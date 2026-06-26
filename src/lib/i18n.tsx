"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Lightweight, dependency-free internationalization for Nopal: Documentos.
 *
 * The app is Spanish-first: `es` is the default locale and the source of truth
 * for the UI. English (`en`) is a full mirror. A small `t()` helper looks up a
 * dot-keyed string and supports `{param}` interpolation. The active locale is
 * persisted to localStorage and exposed through React context, so toggling the
 * language re-renders every consumer instantly.
 */

export type Locale = "es" | "en";

export const DEFAULT_LOCALE: Locale = "es";
const STORAGE_KEY = "nopal-docs:locale";

type Dict = Record<string, string>;

/* -------------------------------------------------------------------------- */
/*  Translations                                                               */
/* -------------------------------------------------------------------------- */

const es: Dict = {
  // Common
  "common.cancel": "Cancelar",
  "common.save": "Guardar",
  "common.delete": "Eliminar",
  "common.apply": "Aplicar",
  "common.close": "Cerrar",
  "common.rename": "Cambiar nombre",
  "common.duplicate": "Duplicar",
  "common.default": "Predeterminada",
  "common.tryAgain": "Reintentar",

  // Language switcher
  "lang.toggleTitle": "Cambiar idioma",
  "lang.toEnglish": "English",
  "lang.toSpanish": "Español",

  // Theme toggle
  "theme.toLight": "Cambiar a modo claro",
  "theme.toDark": "Cambiar a modo oscuro",

  // Dashboard
  "dash.sort.recent": "Última modificación",
  "dash.sort.title": "Título (A–Z)",
  "dash.sort.created": "Fecha de creación",
  "dash.openFile": "Abrir archivo",
  "dash.newDocument": "Nuevo documento",
  "dash.new": "Nuevo",
  "dash.yourDocuments": "Tus documentos",
  "dash.welcomeBack": "Bienvenido de nuevo",
  "dash.subtitle":
    "Crea un documento nuevo, abre uno desde tu dispositivo o continúa donde lo dejaste.",
  "dash.searchPlaceholder": "Buscar documentos…",
  "dash.importing": "Importando documento…",
  "dash.renameTitle": "Cambiar nombre del documento",
  "dash.deleteTitle": "Eliminar documento",
  "dash.deleteConfirmPre": "¿Seguro que quieres eliminar ",
  "dash.deleteConfirmPost": "? Esta acción no se puede deshacer.",
  "dash.noMatching": "No hay documentos que coincidan",
  "dash.noDocsYet": "Aún no hay documentos",
  "dash.tryDifferentSearch": "Prueba con otro término de búsqueda.",
  "dash.emptyHint":
    "Crea tu primer documento o abre un archivo desde tu dispositivo para comenzar.",
  "dash.couldNotImport": "No se pudo importar ese archivo.",
  "dash.failedToLoad": "No se pudieron cargar los documentos",

  // Document card
  "card.justNow": "Justo ahora",
  "card.minAgo": "hace {n} min",
  "card.hrAgo": "hace {n} h",
  "card.dayAgo": "hace {n} día",
  "card.daysAgo": "hace {n} días",
  "card.words": "{n} palabras",
  "card.emptyDocument": "Documento vacío",
  "card.open": "Abrir {title}",
  "card.options": "Opciones del documento",

  // Editor route
  "editor.loading": "Cargando documento…",
  "editor.notFound": "Documento no encontrado",
  "editor.notFoundDesc":
    "Es posible que este documento se haya eliminado o no esté disponible en este dispositivo.",
  "editor.backToDocuments": "Volver a los documentos",

  // Editor chrome
  "editor.untitled": "Documento sin título",
  "editor.copySuffix": " (copia)",
  "editor.titleAria": "Título del documento",
  "editor.saved": "Guardado",
  "editor.saving": "Guardando…",
  "editor.notSaved": "No guardado",
  "editor.fullScreen": "Pantalla completa",
  "editor.exitFullScreen": "Salir de pantalla completa",
  "editor.toggleAi": "Alternar asistente de IA",
  "editor.ai": "IA",
  "editor.autosaveNote": "Los cambios se guardan automáticamente en este dispositivo.",
  "editor.documentSaved": "Documento guardado",
  "editor.savedAsCopy": "Guardado como copia",
  "editor.importingShort": "Importando…",
  "editor.importFailed": "Error al importar.",
  "editor.exporting": "Exportando {fmt}…",
  "editor.couldNotExport": "No se pudo exportar {fmt}.",
  "editor.couldNotSave": "No se pudo guardar tu documento.",
  "editor.chooseImage": "Elige un archivo de imagen.",
  "editor.imageTooLarge": "Esa imagen es demasiado grande (máx. 5 MB).",
  "editor.couldNotReadImage": "No se pudo leer esa imagen.",
  "editor.enterUrl": "Ingresa una URL",
  "editor.zoomIn": "Acercar",
  "editor.zoomOut": "Alejar",
  "editor.resetZoom": "Restablecer zoom",

  // Toolbar — block styles
  "block.title": "Título",
  "block.subtitle": "Subtítulo",
  "block.heading1": "Encabezado 1",
  "block.heading2": "Encabezado 2",
  "block.heading3": "Encabezado 3",
  "block.body": "Texto normal",
  // Mobile compact block chips
  "block.h1": "T1",
  "block.h2": "T2",
  "block.h3": "T3",
  "block.bodyShort": "Cuerpo",

  // Toolbar — controls
  "tb.undo": "Deshacer (⌘Z)",
  "tb.redo": "Rehacer (⌘⇧Z)",
  "tb.paragraphStyle": "Estilo de párrafo",
  "tb.font": "Fuente",
  "tb.fontSize": "Tamaño de fuente",
  "tb.bold": "Negrita (⌘B)",
  "tb.italic": "Cursiva (⌘I)",
  "tb.underline": "Subrayado (⌘U)",
  "tb.strike": "Tachado",
  "tb.textColor": "Color de texto",
  "tb.highlightColor": "Color de resaltado",
  "tb.insertLink": "Insertar enlace",
  "tb.bulletList": "Lista con viñetas",
  "tb.numberedList": "Lista numerada",
  "tb.checklist": "Lista de tareas",
  "tb.alignLeft": "Alinear a la izquierda",
  "tb.alignCenter": "Centrar",
  "tb.alignRight": "Alinear a la derecha",
  "tb.justify": "Justificar",
  "tb.lineSpacing": "Interlineado",
  "tb.spacing": "Espaciado",
  "tb.decreaseIndent": "Reducir sangría",
  "tb.increaseIndent": "Aumentar sangría",
  "tb.blockquote": "Cita en bloque",
  "tb.codeBlock": "Bloque de código",
  "tb.horizontalDivider": "Divisor horizontal",
  "tb.defaultColor": "Color predeterminado",
  "tb.noHighlight": "Sin resaltado",
  "tb.pasteUrl": "Pega o escribe una URL",

  // Font group headers
  "fontgroup.Default": "Predeterminadas",
  "fontgroup.Sans Serif": "Sans Serif",
  "fontgroup.System Sans": "Sistema Sans",
  "fontgroup.Serif": "Serif",
  "fontgroup.Monospace": "Monoespaciada",

  // Line spacing labels
  "spacing.single": "Sencillo",
  "spacing.double": "Doble",

  // Menu bar — top level
  "menu.file": "Archivo",
  "menu.edit": "Editar",
  "menu.view": "Ver",
  "menu.insert": "Insertar",
  "menu.format": "Formato",
  "menu.tools": "Herramientas",
  "menu.help": "Ayuda",
  // File
  "menu.newDocument": "Nuevo documento",
  "menu.openFromDevice": "Abrir desde el dispositivo",
  "menu.save": "Guardar",
  "menu.saveAsCopy": "Guardar como copia",
  "menu.downloadAs": "Descargar como",
  "menu.plainText": "Texto plano (.txt)",
  "menu.print": "Imprimir",
  // Edit
  "menu.undo": "Deshacer",
  "menu.redo": "Rehacer",
  "menu.cut": "Cortar",
  "menu.copy": "Copiar",
  "menu.paste": "Pegar",
  "menu.selectAll": "Seleccionar todo",
  "menu.findReplace": "Buscar y reemplazar",
  // View
  "menu.showRuler": "Mostrar regla",
  "menu.hideRuler": "Ocultar regla",
  "menu.zoomIn": "Acercar",
  "menu.zoomOut": "Alejar",
  "menu.resetZoom": "Restablecer zoom (100 %)",
  "menu.fullScreen": "Pantalla completa",
  "menu.exitFullScreen": "Salir de pantalla completa",
  "menu.pageSetup": "Diseño y tamaño de página…",
  // Insert
  "menu.image": "Imagen…",
  "menu.table": "Tabla (3 × 3)",
  "menu.link": "Enlace…",
  "menu.todaysDate": "Fecha de hoy",
  "menu.horizontalLine": "Línea horizontal",
  "menu.pageBreak": "Salto de página",
  // Format
  "menu.boldF": "Negrita",
  "menu.italicF": "Cursiva",
  "menu.underlineF": "Subrayado",
  "menu.strikethrough": "Tachado",
  "menu.align": "Alinear",
  "menu.left": "Izquierda",
  "menu.center": "Centro",
  "menu.right": "Derecha",
  "menu.justify": "Justificar",
  "menu.lineSpacing": "Interlineado",
  "menu.clearFormatting": "Borrar formato",
  // Tools
  "menu.wordCount": "Conteo de palabras",
  "menu.aiSection": "Nopal IA",
  "menu.aiRewrite": "Reescritura con IA",
  "menu.aiCorrect": "Corrección con IA",
  "menu.aiTranslate": "Traducción con IA",
  "menu.aiSummary": "Resumen con IA",
  "menu.aiMore": "Más herramientas de IA…",
  // Help
  "menu.shortcuts": "Atajos de teclado",
  "menu.about": "Acerca de este editor",

  // Mobile toolbar
  "mob.undo": "Deshacer",
  "mob.redo": "Rehacer",
  "mob.format": "Formato",
  "mob.insert": "Insertar",
  "mob.ai": "IA",
  "mob.font": "Fuente",
  "mob.fontSize": "Tamaño",
  "mob.textColor": "Color de texto",
  "mob.highlight": "Resaltado",
  "mob.image": "Imagen",
  "mob.table": "Tabla",
  "mob.link": "Enlace",
  "mob.divider": "Divisor",
  "mob.date": "Fecha",
  "mob.pageBreak": "Salto de página",

  // AI panel
  "ai.assistant": "Asistente de IA",
  "ai.poweredBy": "Con tecnología de Nopal",
  "ai.words": "Palabras",
  "ai.characters": "Caracteres",
  "ai.readTime": "Lectura",
  "ai.minShort": "{n} min",
  "ai.ask": "Pídele a Nopal",
  "ai.placeholder":
    "p. ej. Hazlo más persuasivo, o escribe una introducción sobre…",
  "ai.run": "Ejecutar (⌘⏎)",
  "ai.runInstruction": "Ejecutar instrucción",
  "ai.quickActions": "Acciones rápidas",
  "ai.translateTo": "Traducir a",
  "ai.translate": "Traducir",
  "ai.working": "Nopal está trabajando… puedes seguir editando.",
  "ai.tryAgain": "Reintentar",
  "ai.copy": "Copiar",
  "ai.copied": "Copiado",
  "ai.replace": "Reemplazar",
  "ai.insertBelow": "Insertar debajo",
  "ai.closeResult": "Cerrar resultado",
  "ai.result": "Resultado",
  "ai.closePanel": "Cerrar panel de IA",
  "ai.disclaimer":
    "La IA puede cometer errores. Verifica fechas, datos y referencias antes de confiar en ellos.",
  "ai.needInstruction": "Escribe una instrucción o selecciona texto primero.",
  "ai.needSelection":
    "Selecciona texto en el documento primero y vuelve a intentarlo.",
  "ai.somethingWrong": "Algo salió mal.",
  "ai.emptyResponse": "La IA devolvió una respuesta vacía. Inténtalo de nuevo.",
  "ai.requestFailed": "La solicitud de IA falló. Inténtalo de nuevo.",
  "ai.tooFast": "Estás enviando solicitudes demasiado rápido. Espera un momento.",
  "ai.notConfigured":
    "El servicio de IA no está configurado. Agrega OPENROUTER_API_KEY a tu entorno.",

  // AI actions (labels + descriptions)
  "aiact.rewrite.label": "Reescribir profesionalmente",
  "aiact.rewrite.desc": "Mejora el tono, la fluidez y la elección de palabras.",
  "aiact.correct.label": "Corregir ortografía y gramática",
  "aiact.correct.desc": "Corrige errores sin cambiar el significado.",
  "aiact.clarity.label": "Mejorar claridad",
  "aiact.clarity.desc": "Hace la escritura más clara y fácil de leer.",
  "aiact.shorten.label": "Acortar",
  "aiact.shorten.desc": "Condensa el texto manteniendo el mensaje.",
  "aiact.expand.label": "Ampliar",
  "aiact.expand.desc": "Agrega detalle y profundidad útiles.",
  "aiact.formal.label": "Más formal",
  "aiact.formal.desc": "Eleva el registro para contextos profesionales.",
  "aiact.friendly.label": "Más cercano",
  "aiact.friendly.desc": "Tono cálido, accesible y conversacional.",
  "aiact.summarize.label": "Resumir",
  "aiact.summarize.desc": "Condensa en los puntos clave.",
  "aiact.translate.label": "Traducir",
  "aiact.translate.desc": "Convierte el texto a otro idioma.",
  "aiact.continue.label": "Continuar escribiendo",
  "aiact.continue.desc": "Redacta lo que sigue de forma natural.",
  "aiact.ideas.label": "Generar ideas",
  "aiact.ideas.desc": "Propón enfoques y puntos de conversación.",
  "aiact.outline.label": "Crear un esquema",
  "aiact.outline.desc": "Estructura el tema en secciones.",
  "aiact.facts.label": "Agregar fechas y datos",
  "aiact.facts.desc": "Incluye contexto histórico verificado.",
  "aiact.references.label": "Buscar referencias",
  "aiact.references.desc": "Sugiere libros y fuentes para citar.",
  "aiact.custom.label": "Instrucción personalizada",
  "aiact.custom.desc": "",

  // Translate languages
  "tlang.Spanish": "Español",
  "tlang.French": "Francés",
  "tlang.German": "Alemán",
  "tlang.Italian": "Italiano",
  "tlang.Portuguese": "Portugués",
  "tlang.Dutch": "Neerlandés",
  "tlang.Chinese (Simplified)": "Chino (simplificado)",
  "tlang.Japanese": "Japonés",
  "tlang.Korean": "Coreano",
  "tlang.Arabic": "Árabe",
  "tlang.Hindi": "Hindi",
  "tlang.Russian": "Ruso",
  "tlang.English": "Inglés",

  // Find & replace
  "find.title": "Buscar y reemplazar",
  "find.close": "Cerrar buscar y reemplazar",
  "find.find": "Buscar",
  "find.replaceWith": "Reemplazar con",
  "find.matchCase": "Coincidir mayúsculas",
  "find.replace": "Reemplazar",
  "find.replaceAll": "Reemplazar todo",
  "find.previous": "Coincidencia anterior",
  "find.next": "Coincidencia siguiente",

  // Word count dialog
  "wc.title": "Conteo de palabras",
  "wc.words": "Palabras",
  "wc.characters": "Caracteres",
  "wc.charactersNoSpaces": "Caracteres (sin espacios)",
  "wc.readingTime": "Tiempo de lectura estimado",
  "wc.min": "{n} min",

  // Shortcuts dialog
  "sc.title": "Atajos de teclado",
  "sc.save": "Guardar documento",
  "sc.undo": "Deshacer",
  "sc.redo": "Rehacer",
  "sc.bold": "Negrita",
  "sc.italic": "Cursiva",
  "sc.underline": "Subrayado",
  "sc.insertLink": "Insertar enlace",
  "sc.findReplace": "Buscar y reemplazar",
  "sc.selectAll": "Seleccionar todo",

  // About dialog
  "about.title": "Acerca de este editor",
  "about.body":
    "Un editor de documentos profesional, basado en la web, con formato enriquecido, importación y exportación, diseños de página, un modo oscuro pulido y un asistente de escritura con IA de Nopal integrado.",
  "about.builtWith": "Hecho con Next.js · TypeScript · Tailwind CSS · TipTap",

  // Page setup dialog
  "page.title": "Diseño y tamaño de página",
  "page.letter": "Carta",
  "page.legal": "Oficio",
  "page.a4": "A4",
  "page.custom": "Personalizado",
  "page.setYourOwn": "Define el tuyo",
  "page.width": "Ancho (pulg)",
  "page.height": "Alto (pulg)",

  // Modal
  "modal.close": "Cerrar",

  // Import
  "import.unsupportedDoc":
    "Los archivos .doc heredados no son compatibles. Guárdalo como .docx e inténtalo de nuevo.",
  "import.importedDocument": "Documento importado",
};

const en: Dict = {
  // Common
  "common.cancel": "Cancel",
  "common.save": "Save",
  "common.delete": "Delete",
  "common.apply": "Apply",
  "common.close": "Close",
  "common.rename": "Rename",
  "common.duplicate": "Duplicate",
  "common.default": "Default",
  "common.tryAgain": "Try again",

  // Language switcher
  "lang.toggleTitle": "Change language",
  "lang.toEnglish": "English",
  "lang.toSpanish": "Español",

  // Theme toggle
  "theme.toLight": "Switch to light mode",
  "theme.toDark": "Switch to dark mode",

  // Dashboard
  "dash.sort.recent": "Last modified",
  "dash.sort.title": "Title (A–Z)",
  "dash.sort.created": "Date created",
  "dash.openFile": "Open file",
  "dash.newDocument": "New document",
  "dash.new": "New",
  "dash.yourDocuments": "Your documents",
  "dash.welcomeBack": "Welcome back",
  "dash.subtitle":
    "Create a new document, open one from your device, or pick up where you left off.",
  "dash.searchPlaceholder": "Search documents…",
  "dash.importing": "Importing document…",
  "dash.renameTitle": "Rename document",
  "dash.deleteTitle": "Delete document",
  "dash.deleteConfirmPre": "Are you sure you want to delete ",
  "dash.deleteConfirmPost": "? This action can’t be undone.",
  "dash.noMatching": "No matching documents",
  "dash.noDocsYet": "No documents yet",
  "dash.tryDifferentSearch": "Try a different search term.",
  "dash.emptyHint":
    "Create your first document or open a file from your device to get started.",
  "dash.couldNotImport": "Could not import that file.",
  "dash.failedToLoad": "Failed to load documents",

  // Document card
  "card.justNow": "Just now",
  "card.minAgo": "{n} min ago",
  "card.hrAgo": "{n} hr ago",
  "card.dayAgo": "{n} day ago",
  "card.daysAgo": "{n} days ago",
  "card.words": "{n} words",
  "card.emptyDocument": "Empty document",
  "card.open": "Open {title}",
  "card.options": "Document options",

  // Editor route
  "editor.loading": "Loading document…",
  "editor.notFound": "Document not found",
  "editor.notFoundDesc":
    "This document may have been deleted or isn’t available on this device.",
  "editor.backToDocuments": "Back to documents",

  // Editor chrome
  "editor.untitled": "Untitled document",
  "editor.copySuffix": " (copy)",
  "editor.titleAria": "Document title",
  "editor.saved": "Saved",
  "editor.saving": "Saving…",
  "editor.notSaved": "Not saved",
  "editor.fullScreen": "Full screen",
  "editor.exitFullScreen": "Exit full screen",
  "editor.toggleAi": "Toggle AI assistant",
  "editor.ai": "AI",
  "editor.autosaveNote": "Changes are saved automatically to this device.",
  "editor.documentSaved": "Document saved",
  "editor.savedAsCopy": "Saved as a copy",
  "editor.importingShort": "Importing…",
  "editor.importFailed": "Import failed.",
  "editor.exporting": "Exporting {fmt}…",
  "editor.couldNotExport": "Could not export {fmt}.",
  "editor.couldNotSave": "Couldn’t save your document.",
  "editor.chooseImage": "Please choose an image file.",
  "editor.imageTooLarge": "That image is too large (max 5MB).",
  "editor.couldNotReadImage": "Couldn’t read that image.",
  "editor.enterUrl": "Enter a URL",
  "editor.zoomIn": "Zoom in",
  "editor.zoomOut": "Zoom out",
  "editor.resetZoom": "Reset zoom",

  // Toolbar — block styles
  "block.title": "Title",
  "block.subtitle": "Subtitle",
  "block.heading1": "Heading 1",
  "block.heading2": "Heading 2",
  "block.heading3": "Heading 3",
  "block.body": "Body text",
  "block.h1": "H1",
  "block.h2": "H2",
  "block.h3": "H3",
  "block.bodyShort": "Body",

  // Toolbar — controls
  "tb.undo": "Undo (⌘Z)",
  "tb.redo": "Redo (⌘⇧Z)",
  "tb.paragraphStyle": "Paragraph style",
  "tb.font": "Font",
  "tb.fontSize": "Font size",
  "tb.bold": "Bold (⌘B)",
  "tb.italic": "Italic (⌘I)",
  "tb.underline": "Underline (⌘U)",
  "tb.strike": "Strikethrough",
  "tb.textColor": "Text color",
  "tb.highlightColor": "Highlight color",
  "tb.insertLink": "Insert link",
  "tb.bulletList": "Bulleted list",
  "tb.numberedList": "Numbered list",
  "tb.checklist": "Checklist",
  "tb.alignLeft": "Align left",
  "tb.alignCenter": "Align center",
  "tb.alignRight": "Align right",
  "tb.justify": "Justify",
  "tb.lineSpacing": "Line spacing",
  "tb.spacing": "Spacing",
  "tb.decreaseIndent": "Decrease indent",
  "tb.increaseIndent": "Increase indent",
  "tb.blockquote": "Block quote",
  "tb.codeBlock": "Code block",
  "tb.horizontalDivider": "Horizontal divider",
  "tb.defaultColor": "Default color",
  "tb.noHighlight": "No highlight",
  "tb.pasteUrl": "Paste or type a URL",

  // Font group headers
  "fontgroup.Default": "Default",
  "fontgroup.Sans Serif": "Sans Serif",
  "fontgroup.System Sans": "System Sans",
  "fontgroup.Serif": "Serif",
  "fontgroup.Monospace": "Monospace",

  // Line spacing labels
  "spacing.single": "Single",
  "spacing.double": "Double",

  // Menu bar — top level
  "menu.file": "File",
  "menu.edit": "Edit",
  "menu.view": "View",
  "menu.insert": "Insert",
  "menu.format": "Format",
  "menu.tools": "Tools",
  "menu.help": "Help",
  "menu.newDocument": "New document",
  "menu.openFromDevice": "Open from device",
  "menu.save": "Save",
  "menu.saveAsCopy": "Save as a copy",
  "menu.downloadAs": "Download as",
  "menu.plainText": "Plain text (.txt)",
  "menu.print": "Print",
  "menu.undo": "Undo",
  "menu.redo": "Redo",
  "menu.cut": "Cut",
  "menu.copy": "Copy",
  "menu.paste": "Paste",
  "menu.selectAll": "Select all",
  "menu.findReplace": "Find and replace",
  "menu.showRuler": "Show ruler",
  "menu.hideRuler": "Hide ruler",
  "menu.zoomIn": "Zoom in",
  "menu.zoomOut": "Zoom out",
  "menu.resetZoom": "Reset zoom (100%)",
  "menu.fullScreen": "Full screen",
  "menu.exitFullScreen": "Exit full screen",
  "menu.pageSetup": "Page layout & size…",
  "menu.image": "Image…",
  "menu.table": "Table (3 × 3)",
  "menu.link": "Link…",
  "menu.todaysDate": "Today’s date",
  "menu.horizontalLine": "Horizontal line",
  "menu.pageBreak": "Page break",
  "menu.boldF": "Bold",
  "menu.italicF": "Italic",
  "menu.underlineF": "Underline",
  "menu.strikethrough": "Strikethrough",
  "menu.align": "Align",
  "menu.left": "Left",
  "menu.center": "Center",
  "menu.right": "Right",
  "menu.justify": "Justify",
  "menu.lineSpacing": "Line spacing",
  "menu.clearFormatting": "Clear formatting",
  "menu.wordCount": "Word count",
  "menu.aiSection": "Nopal AI",
  "menu.aiRewrite": "AI rewrite",
  "menu.aiCorrect": "AI correction",
  "menu.aiTranslate": "AI translation",
  "menu.aiSummary": "AI summary",
  "menu.aiMore": "More AI tools…",
  "menu.shortcuts": "Keyboard shortcuts",
  "menu.about": "About this editor",

  // Mobile toolbar
  "mob.undo": "Undo",
  "mob.redo": "Redo",
  "mob.format": "Format",
  "mob.insert": "Insert",
  "mob.ai": "AI",
  "mob.font": "Font",
  "mob.fontSize": "Size",
  "mob.textColor": "Text color",
  "mob.highlight": "Highlight",
  "mob.image": "Image",
  "mob.table": "Table",
  "mob.link": "Link",
  "mob.divider": "Divider",
  "mob.date": "Date",
  "mob.pageBreak": "Page break",

  // AI panel
  "ai.assistant": "AI Assistant",
  "ai.poweredBy": "Powered by Nopal",
  "ai.words": "Words",
  "ai.characters": "Characters",
  "ai.readTime": "Read time",
  "ai.minShort": "{n}m",
  "ai.ask": "Ask Nopal",
  "ai.placeholder": "e.g. Make this more persuasive, or write an intro about…",
  "ai.run": "Run (⌘⏎)",
  "ai.runInstruction": "Run instruction",
  "ai.quickActions": "Quick actions",
  "ai.translateTo": "Translate to",
  "ai.translate": "Translate",
  "ai.working": "Nopal is working… you can keep editing.",
  "ai.tryAgain": "Try again",
  "ai.copy": "Copy",
  "ai.copied": "Copied",
  "ai.replace": "Replace",
  "ai.insertBelow": "Insert below",
  "ai.closeResult": "Close result",
  "ai.result": "Result",
  "ai.closePanel": "Close AI panel",
  "ai.disclaimer":
    "AI can make mistakes. Please verify dates, facts, and references before relying on them.",
  "ai.needInstruction": "Type an instruction or select some text first.",
  "ai.needSelection": "Select some text in the document first, then try again.",
  "ai.somethingWrong": "Something went wrong.",
  "ai.emptyResponse": "The AI returned an empty response. Please try again.",
  "ai.requestFailed": "The AI request failed. Please try again.",
  "ai.tooFast": "You’re sending requests too quickly. Please wait a moment.",
  "ai.notConfigured":
    "The AI service isn’t configured. Add OPENROUTER_API_KEY to your environment.",

  // AI actions
  "aiact.rewrite.label": "Rewrite professionally",
  "aiact.rewrite.desc": "Polish tone, flow, and word choice.",
  "aiact.correct.label": "Fix spelling & grammar",
  "aiact.correct.desc": "Correct mistakes without changing meaning.",
  "aiact.clarity.label": "Improve clarity",
  "aiact.clarity.desc": "Make the writing clearer and easier to read.",
  "aiact.shorten.label": "Make shorter",
  "aiact.shorten.desc": "Tighten the text while keeping the message.",
  "aiact.expand.label": "Expand",
  "aiact.expand.desc": "Add helpful detail and depth.",
  "aiact.formal.label": "More formal",
  "aiact.formal.desc": "Raise the register for professional contexts.",
  "aiact.friendly.label": "More friendly",
  "aiact.friendly.desc": "Warm, approachable, conversational tone.",
  "aiact.summarize.label": "Summarize",
  "aiact.summarize.desc": "Condense into the key points.",
  "aiact.translate.label": "Translate",
  "aiact.translate.desc": "Convert text into another language.",
  "aiact.continue.label": "Continue writing",
  "aiact.continue.desc": "Draft what naturally comes next.",
  "aiact.ideas.label": "Generate ideas",
  "aiact.ideas.desc": "Brainstorm angles and talking points.",
  "aiact.outline.label": "Create an outline",
  "aiact.outline.desc": "Structure the topic into sections.",
  "aiact.facts.label": "Add dates & facts",
  "aiact.facts.desc": "Include verified historical context.",
  "aiact.references.label": "Find references",
  "aiact.references.desc": "Suggest books and sources to cite.",
  "aiact.custom.label": "Custom instruction",
  "aiact.custom.desc": "",

  // Translate languages
  "tlang.Spanish": "Spanish",
  "tlang.French": "French",
  "tlang.German": "German",
  "tlang.Italian": "Italian",
  "tlang.Portuguese": "Portuguese",
  "tlang.Dutch": "Dutch",
  "tlang.Chinese (Simplified)": "Chinese (Simplified)",
  "tlang.Japanese": "Japanese",
  "tlang.Korean": "Korean",
  "tlang.Arabic": "Arabic",
  "tlang.Hindi": "Hindi",
  "tlang.Russian": "Russian",
  "tlang.English": "English",

  // Find & replace
  "find.title": "Find & replace",
  "find.close": "Close find and replace",
  "find.find": "Find",
  "find.replaceWith": "Replace with",
  "find.matchCase": "Match case",
  "find.replace": "Replace",
  "find.replaceAll": "Replace all",
  "find.previous": "Previous match",
  "find.next": "Next match",

  // Word count dialog
  "wc.title": "Word count",
  "wc.words": "Words",
  "wc.characters": "Characters",
  "wc.charactersNoSpaces": "Characters (no spaces)",
  "wc.readingTime": "Estimated reading time",
  "wc.min": "{n} min",

  // Shortcuts dialog
  "sc.title": "Keyboard shortcuts",
  "sc.save": "Save document",
  "sc.undo": "Undo",
  "sc.redo": "Redo",
  "sc.bold": "Bold",
  "sc.italic": "Italic",
  "sc.underline": "Underline",
  "sc.insertLink": "Insert link",
  "sc.findReplace": "Find and replace",
  "sc.selectAll": "Select all",

  // About dialog
  "about.title": "About this editor",
  "about.body":
    "A professional, web-based document editor with rich formatting, import and export, page layouts, a polished dark mode, and an integrated Nopal AI writing assistant.",
  "about.builtWith": "Built with Next.js · TypeScript · Tailwind CSS · TipTap",

  // Page setup dialog
  "page.title": "Page layout & size",
  "page.letter": "Letter",
  "page.legal": "Legal",
  "page.a4": "A4",
  "page.custom": "Custom",
  "page.setYourOwn": "Set your own",
  "page.width": "Width (in)",
  "page.height": "Height (in)",

  // Modal
  "modal.close": "Close",

  // Import
  "import.unsupportedDoc":
    "Legacy .doc files aren't supported. Please save as .docx and try again.",
  "import.importedDocument": "Imported document",
};

const DICTS: Record<Locale, Dict> = { es, en };

/** Interpolate `{param}` placeholders in a translated string. */
function format(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  return str.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`,
  );
}

export type TFunction = (
  key: string,
  params?: Record<string, string | number>,
) => string;

/** Translate a key for a given locale (falls back to Spanish, then the key). */
export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const value = DICTS[locale]?.[key] ?? DICTS.es[key] ?? key;
  return format(value, params);
}

/* -------------------------------------------------------------------------- */
/*  Context                                                                     */
/* -------------------------------------------------------------------------- */

interface I18nContextValue {
  locale: Locale;
  t: TFunction;
  toggle: () => void;
  setLocale: (l: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * Read the persisted UI language outside of React (e.g. in the storage layer),
 * so newly created documents and import messages match the active language.
 */
export function readPersistedLocale(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "es" || stored === "en") return stored;
  } catch {
    /* ignore */
  }
  return DEFAULT_LOCALE;
}

function readInitialLocale(): Locale {
  return readPersistedLocale();
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start from the default (Spanish) on both server and first client render to
  // avoid hydration mismatches; sync to the persisted choice after mount.
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const initial = readInitialLocale();
    setLocaleState(initial);
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial;
    }
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const toggle = useCallback(() => {
    setLocale(locale === "es" ? "en" : "es");
  }, [locale, setLocale]);

  const t = useCallback<TFunction>(
    (key, params) => translate(locale, key, params),
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, t, toggle, setLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback so components never crash outside the provider.
    return {
      locale: DEFAULT_LOCALE,
      t: (key, params) => translate(DEFAULT_LOCALE, key, params),
      toggle: () => {},
      setLocale: () => {},
    };
  }
  return ctx;
}

/** Convenience hook returning just the translate function. */
export function useT(): TFunction {
  return useI18n().t;
}
