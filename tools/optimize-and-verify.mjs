import fs from 'fs';
import path from 'path';
import fg from 'fast-glob';
import sharp from 'sharp';
import { JSDOM } from 'jsdom';
import chalk from 'chalk';

const DRY = process.argv.includes('--dry'); // 只扫描不写入
const ROOT = process.cwd();
const IMG_PATTERNS = ['**/*.{jpg,jpeg,png,webp}'];
const HTML_PATTERNS = ['**/*.html'];

// -------- helpers --------
const toKB = b => (b / 1024).toFixed(1) + 'KB';
const safeStat = p => { try { return fs.statSync(p); } catch { return null; } };
const ensureDir = d => fs.mkdirSync(d, { recursive: true });

function resolveFromHtml(htmlFile, src) {
  // 忽略外链
  if (/^https?:\/\//i.test(src) || /^data:/i.test(src)) return null;
  // 以 / 开头的绝对路径（在 GH Pages 上常出问题）
  if (src.startsWith('/')) return { isAbsoluteRoot: true, absPath: path.join(ROOT, src.slice(1)) };

  // 相对路径
  const abs = path.resolve(path.dirname(htmlFile), src);
  return { isAbsoluteRoot: false, absPath: abs };
}

async function compressOne(file) {
  const before = safeStat(file)?.size ?? 0;
  if (!before) return { file, skipped: true, reason: 'no-stat' };

  const ext = path.extname(file).toLowerCase();
  
  try {
    const buf = fs.readFileSync(file);
    let pipeline = sharp(buf);

    // 仅做"同格式压缩"，不改扩展名，避免改HTML
    if (ext === '.jpg' || ext === '.jpeg') {
      pipeline = pipeline.jpeg({ quality: 72, progressive: true, mozjpeg: true });
    } else if (ext === '.png') {
      // png 无损/轻量化；如需更激进可改为 webp 并重写 HTML（此处不改名）
      pipeline = pipeline.png({ compressionLevel: 9, adaptiveFiltering: true, palette: true });
    } else if (ext === '.webp') {
      pipeline = pipeline.webp({ quality: 72 });
    } else {
      return { file, skipped: true, reason: 'ext-unsupported' };
    }

    const outBuf = await pipeline.toBuffer();
    const after = outBuf.length;

    if (after < before && !DRY) fs.writeFileSync(file, outBuf);

    return {
      file,
      before,
      after: Math.min(before, after), // dry 模式下显示"理论值"
      saved: Math.max(0, before - after),
      changed: after < before && !DRY
    };
  } catch (error) {
    console.log(chalk.yellow(`⚠️  跳过文件 ${path.relative(ROOT, file)}: ${error.message}`));
    return { file, skipped: true, reason: `sharp-error: ${error.message}` };
  }
}

function parseHtmlImgs(htmlFile) {
  const html = fs.readFileSync(htmlFile, 'utf8');
  const dom = new JSDOM(html);
  const imgs = [...dom.window.document.querySelectorAll('img[src]')].map(img => img.getAttribute('src'));
  return imgs;
}

(async () => {
  console.log(chalk.cyan('🔧 Step1: 压缩图片（同扩展名，不改路径）'));
  const imgFiles = await fg(IMG_PATTERNS, { cwd: ROOT, dot: false, ignore: ['node_modules/**', 'tools/**'] });
  const imgResults = [];
  for (const rel of imgFiles) {
    const abs = path.join(ROOT, rel);
    const r = await compressOne(abs);
    imgResults.push(r);
  }

  const totalBefore = imgResults.reduce((s, r) => s + (r.before || 0), 0);
  const totalAfter = imgResults.reduce((s, r) => s + (r.after || (r.before || 0)), 0);
  console.log(
    chalk.green(`✅ 完成图片处理：${imgResults.length} 个文件，预计压缩 ${toKB(Math.max(0, totalBefore - totalAfter))}（${DRY ? '预演' : '已写入'}）`)
  );

  console.log('\n' + chalk.cyan('🔎 Step2: 扫描 HTML 中的 <img src> 路径'));
  const htmlFiles = await fg(HTML_PATTERNS, { cwd: ROOT, dot: false, ignore: ['node_modules/**', 'tools/**'] });
  const broken = [];
  const absoluteRootUsed = [];

  for (const rel of htmlFiles) {
    const absHtml = path.join(ROOT, rel);
    const srcs = parseHtmlImgs(absHtml);

    for (const src of srcs) {
      const resolved = resolveFromHtml(absHtml, src);
      if (!resolved) continue; // 外链、data URL

      if (resolved.isAbsoluteRoot) {
        const exists = !!safeStat(resolved.absPath);
        absoluteRootUsed.push({
          html: rel,
          src,
          resolved: path.relative(ROOT, resolved.absPath),
          exists
        });
        if (!exists) broken.push({ html: rel, src, reason: 'absolute-root-not-found' });
      } else {
        const exists = !!safeStat(resolved.absPath);
        if (!exists) {
          broken.push({
            html: rel,
            src,
            reason: 'relative-not-found',
            resolved: path.relative(ROOT, resolved.absPath)
          });
        }
      }
    }
  }

  const report = {
    summary: {
      imagesProcessed: imgResults.length,
      bytesBefore: totalBefore,
      bytesAfter: totalAfter,
      bytesSaved: Math.max(0, totalBefore - totalAfter),
      dryRun: DRY
    },
    images: imgResults.map(r => ({
      file: path.relative(ROOT, r.file),
      before: r.before ?? 0,
      after: r.after ?? r.before ?? 0,
      saved: r.saved ?? 0,
      changed: !!r.changed,
      skipped: !!r.skipped,
      reason: r.reason || null
    })),
    htmlBrokenRefs: broken,
    htmlAbsoluteRoot: absoluteRootUsed
  };

  ensureDir(path.join(ROOT, 'tools'));
  fs.writeFileSync(path.join(ROOT, 'tools', 'opt_report.json'), JSON.stringify(report, null, 2));
  console.log(
    chalk.yellow(`\n📄 报告已生成：tools/opt_report.json （请打开查看不存在的图片路径 & "/绝对路径"使用情况）`)
  );

  // 友好提示
  if (broken.length > 0) {
    console.log(chalk.red(`\n❌ 发现 ${broken.length} 个图片引用问题：`));
    for (const b of broken.slice(0, 20)) {
      console.log(`  - [${b.reason}] ${b.html} -> ${b.src}  (解析到：${b.resolved || 'N/A'})`);
    }
    if (broken.length > 20) console.log(`  ... 其余 ${broken.length - 20} 条见 opt_report.json`);
    console.log(chalk.white(`\n👉 常见修复：`));
    console.log(`   1) 如果是以"/"开头，改为相对路径，如： images/xxx.jpg`);
    console.log(`   2) 确认文件是否真的在仓库里（注意大小写、目录名）。`);
  } else {
    console.log(chalk.green('\n✅ 未发现图片引用错误。'));
  }
})();
