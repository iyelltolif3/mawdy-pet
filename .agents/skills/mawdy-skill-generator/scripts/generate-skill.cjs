#!/usr/bin/env node

/**
 * Generator & Validator de Skills para Mawdy Pet (Google Antigravity)
 * 
 * Uso:
 *   1. Generar una nueva skill:
 *      node generate-skill.cjs <skill-name> "<description>" "<title>" "<module>"
 * 
 *   2. Auditar y validar todas las skills existentes en el proyecto:
 *      node generate-skill.cjs --check
 */

const fs = require('fs');
const path = require('path');

const ROOT_SKILLS_DIR = path.resolve(__dirname, '..', '..');
const TEMPLATE_PATH = path.resolve(__dirname, '..', 'templates', 'skill-template.md');

function printUsage() {
  console.log(`
🐾 Mawdy Pet Skill Generator (Antigravity Standard)

Comandos disponibles:
  Crear nueva skill:
    node generate-skill.cjs <name> "<description>" "<title>" "<module>"
    Ejemplo:
      node generate-skill.cjs mawdy-telemedicina "Utiliza esta skill cuando el usuario requiera implementar o integrar el servicio de videoconsulta veterinaria." "Telemedicina Veterinaria 24/7" "Asistencias B2C"

  Auditar todas las skills:
    node generate-skill.cjs --check
`);
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const rawYaml = match[1];
  const lines = rawYaml.split(/\r?\n/);
  const result = {};
  let currentKey = null;
  let multilineValue = [];

  for (const line of lines) {
    const keyMatch = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (keyMatch) {
      if (currentKey && multilineValue.length > 0) {
        result[currentKey] = multilineValue.join(' ').trim();
        multilineValue = [];
      }
      currentKey = keyMatch[1];
      const val = keyMatch[2].trim();
      if (val === '>-' || val === '>' || val === '|') {
        multilineValue = [];
      } else {
        result[currentKey] = val;
        currentKey = null;
      }
    } else if (currentKey) {
      multilineValue.push(line.trim());
    }
  }

  if (currentKey && multilineValue.length > 0) {
    result[currentKey] = multilineValue.join(' ').trim();
  }

  return result;
}

function auditSkills() {
  console.log(`\n🔍 Auditando skills en: ${ROOT_SKILLS_DIR}\n`);
  if (!fs.existsSync(ROOT_SKILLS_DIR)) {
    console.error(`❌ Directorio de skills no existe: ${ROOT_SKILLS_DIR}`);
    process.exit(1);
  }

  const entries = fs.readdirSync(ROOT_SKILLS_DIR, { withFileTypes: true });
  const skillFolders = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  let errorCount = 0;
  let successCount = 0;

  for (const folder of skillFolders) {
    const skillPath = path.join(ROOT_SKILLS_DIR, folder);
    const skillFile = path.join(skillPath, 'SKILL.md');

    if (!fs.existsSync(skillFile)) {
      console.error(`❌ [${folder}] Falta el archivo obligatorio SKILL.md`);
      errorCount++;
      continue;
    }

    const content = fs.readFileSync(skillFile, 'utf8');
    const fm = parseFrontmatter(content);

    if (!fm) {
      console.error(`❌ [${folder}] YAML Frontmatter inválido o ausente en SKILL.md`);
      errorCount++;
      continue;
    }

    if (!fm.name) {
      console.error(`❌ [${folder}] Falta campo 'name' en frontmatter.`);
      errorCount++;
    } else if (fm.name !== folder) {
      console.error(`⚠️  [${folder}] El campo 'name' ("${fm.name}") no coincide con la carpeta ("${folder}").`);
      errorCount++;
    }

    if (!fm.description) {
      console.error(`❌ [${folder}] Falta campo 'description' en frontmatter.`);
      errorCount++;
    } else if (fm.description.length < 20) {
      console.error(`⚠️  [${folder}] 'description' es demasiado corta. Debe describir qué hace y cuándo activarse.`);
      errorCount++;
    }

    // Verificar estructura de progressive disclosure
    const hasReferences = fs.existsSync(path.join(skillPath, 'references'));
    const refTag = hasReferences ? '📚 (con references/)' : '📄 (archivo único)';

    console.log(`✅ [${folder}] Skill válida y conforme. ${refTag}`);
    successCount++;
  }

  console.log(`\n📊 Resumen de Auditoría: ${successCount} válidas, ${errorCount} advertencias/errores.\n`);
  if (errorCount > 0) {
    process.exit(1);
  }
}

function scaffoldSkill(name, description, title, moduleName) {
  const cleanName = name.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
  const targetDir = path.join(ROOT_SKILLS_DIR, cleanName);

  if (fs.existsSync(targetDir)) {
    console.error(`❌ Ya existe la carpeta de la skill: ${targetDir}`);
    process.exit(1);
  }

  fs.mkdirSync(targetDir, { recursive: true });
  fs.mkdirSync(path.join(targetDir, 'references'), { recursive: true });

  let templateContent = '';
  if (fs.existsSync(TEMPLATE_PATH)) {
    templateContent = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  } else {
    templateContent = `---
name: {{SKILL_NAME}}
description: >-
  {{SKILL_DESCRIPTION}}
---

# {{SKILL_TITLE}}

> **Módulo:** {{SKILL_MODULE}}

## Procedimientos
1. Paso 1
2. Paso 2
`;
  }

  const rendered = templateContent
    .replace(/{{SKILL_NAME}}/g, cleanName)
    .replace(/{{SKILL_DESCRIPTION}}/g, description)
    .replace(/{{SKILL_TITLE}}/g, title || cleanName)
    .replace(/{{SKILL_MODULE}}/g, moduleName || 'General Mawdy Pet')
    .replace(/{{SKILL_PURPOSE}}/g, description);

  fs.writeFileSync(path.join(targetDir, 'SKILL.md'), rendered, 'utf8');

  // Crear archivo de referencia de ejemplo
  const refFile = path.join(targetDir, 'references', 'guide.md');
  fs.writeFileSync(refFile, `# Guía de Referencia: ${title || cleanName}\n\nDocumentación técnica detallada.\n`, 'utf8');

  console.log(`\n✨ Skill creada exitosamente en: ${targetDir}`);
  console.log(`   - SKILL.md generado con frontmatter conforme`);
  console.log(`   - references/guide.md creado para divulgación progresiva\n`);
}

// CLI Dispatcher
const args = process.argv.slice(2);

if (args.length === 0) {
  printUsage();
  process.exit(0);
}

if (args[0] === '--check') {
  auditSkills();
} else if (args.length >= 2) {
  const [name, description, title, moduleName] = args;
  scaffoldSkill(name, description, title, moduleName);
} else {
  printUsage();
  process.exit(1);
}
