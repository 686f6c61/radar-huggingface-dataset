# the-tech-art/ai-content-detector

## Resumen

`the-tech-art/ai-content-detector` es un modelo de clasificación de texto publicado en HuggingFace por el usuario `the-tech-art`, orientado a detectar contenido generado por IA en documentos académicos y profesionales. No es un modelo generativo ni un LLM: el repositorio se distribuye en formato `joblib` y se integra en una aplicación completa ("VeritasDoc") que ingiere documentos, los analiza y produce informes con mapas de calor por frase. La model card describe un sistema de "consenso neural en tres capas" (Alpha, Beta y Gamma) que combina señales sintácticas, de cadencia generativa y de evasión adversarial.

El modelo se presenta como herramienta forense con localización a nivel de frase, calibración Platt, una matriz de decisión de tres zonas, salvaguarda para hablantes no nativos (ESL) y exportación de certificados PDF con hash SHA-256. Según la información disponible, el repositorio tiene 0 descargas y 1 like, un tamaño de 0.0 GB y licencia MIT, con el inglés como único idioma declarado en los metadatos.

Es relevante ahora porque la detección de texto sintético se ha convertido en un problema operativo en admisiones, publicación científica y auditoría documental, pero conviene subrayar que la ficha se basa exclusivamente en la documentación del autor: no se han publicado benchmarks, detalles de entrenamiento ni evaluaciones independientes en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de clasificadores de texto ("consenso neural" en tres capas: Alpha, Beta y Gamma); no se especifica la familia de modelos subyacentes (no disponible) |
| Parámetros totales | No disponible |
| Longitud de contexto | No disponible (el análisis se realiza por frases y por documento; no se documenta una ventana de contexto) |
| Tipos de cuantización | No disponible (serialización `joblib`; no se documentan variantes cuantizadas) |
| Idiomas soportados | Inglés (metadatos). La model card menciona soporte adicional para hindi, español, francés y alemán sin detallar alcance ni evaluación |
| Licencia | MIT |
| Formato de pesos | `joblib` (pipeline serializado). El repositorio no incluye `safetensors`, GGUF ni ONNX |
| Pipeline de HuggingFace | `text-classification` |
| Tarea | Detección de texto generado por IA, con puntuación a nivel de documento y de frase |
| Formatos de entrada | `.pdf`, `.docx`, `.doc`, `.pptx`, `.ppt`, `.rtf`, `.txt` |
| Salida | Puntuación de probabilidad calibrada, mapa de calor por frase, tarjeta de explicabilidad, atribución de plataforma (según el autor) |
| Tamaño del repositorio | 0.0 GB |
| Descargas / likes | 0 / 1 |
| Fecha de creación / actualización | 2026-10-22 / 2026-10-22 |

## Arquitectura y entrenamiento

La documentación describe un sistema denominado "Tri-Layer Neural Consensus" que combina tres componentes: Core Alpha (discurso sintáctico), Core Beta (cadencia generativa) y Core Gamma (evasión adversarial). El análisis se complementa con señales forenses clásicas: perplejidad (PPL), burstiness, distribución zipfiana y estilometría. La puntuación por frase se suaviza con una gaussiana de tres frases según la fórmula `S̃_i = 0.70·S_i + 0.15·S_(i-1) + 0.15·S_(i+1)` y se calibra con escalado Platt; la ponderación final es por caracteres, lo que permite manejar documentos mixtos con secciones humanas y sintéticas.

No se proporciona información sobre el conjunto de entrenamiento: no hay número de tokens, composición del corpus, proceso de anotación, ni consta el uso de RLHF, DPO u otras técnicas de alineación. Tampoco se especifica qué modelos base componen cada "core" ni si son transformers, clasificadores lineales o ensembles de características hechas a mano. La aplicación que acompaña al modelo incluye un extractor multiformato con preservación de jerarquía, un saneador (eliminación de caracteres de ancho cero, normalización NFKC, homoglifos y ligaduras, con cálculo de SHA-256), una base SQLite en modo WAL y un generador de certificados PDF con ReportLab. Toda esta infraestructura es verificable en la estructura del proyecto descrita en la model card; las capacidades de detección, en cambio, no vienen acompañadas de métricas.

## Capacidades

- Clasificación de texto generado por IA con puntuación de probabilidad a nivel de documento y a nivel de frase.
- Localización de fragmentos sospechosos mediante mapa de calor de tres colores: rojo (≥70%), amarillo (45-69%) y verde (<45%).
- Explicabilidad por frase: "tarjeta de diagnóstico" con las señales que justifican la puntuación (perplejidad, burstiness, estilometría).
- Matriz de decisión académica de tres zonas: verde (<25%), amarillo (25-65%) y rojo (>65%), con modos de sensibilidad conservador, equilibrado y agresivo.
- Salvaguarda ESL (English as a Second Language) para reducir acusaciones falsas a hablantes no nativos, según el autor.
- Atribución de plataforma de origen (ChatGPT-4o, Claude 3.5, Google Gemini, Microsoft Copilot) con marcadores estilísticos como `delve`, `tapestry` o `furthermore`. Afirmación no verificada.
- Detección de herramientas de "humanización" (Undetectable.ai, HideMyAI) mediante análisis de disonancia semántica y anomalías de perturbación. Afirmación no verificada.
- Ingesta de siete formatos de documento preservando la jerarquía estructural y calculando checksum SHA-256.
- API FastAPI con endpoints `/analyze`, `/recalculate`, `/health`, `/history`, `/pdf` y webhook LMS (`POST /api/lms/webhook`).
- Extensión de Chrome Manifest V3 para inspección superpuesta en páginas web y entornos LMS.
- Exportación de certificado de auditoría PDF con hash SHA-256 para cadena de custodia.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- **Revisión de trabajos en LMS (Canvas, Moodle):** el webhook `POST /api/lms/webhook` permite enviar entregas y devolver una puntuación con frases resaltadas; el estudiante o el docente recibe evidencia granular en lugar de un veredicto binario, lo que facilita la conversación académica.
- **Triaje editorial previo a revisión por pares:** un editor puede procesar manuscritos en `.docx` o `.pdf`, identificar secciones con cadencia sospechosa y solicitar aclaración al autor antes de asignar revisores, usando el análisis como señal, nunca como prueba.
- **Auditoría de documentación corporativa:** informes, propuestas y memorias pueden analizarse en lote para detectar secciones generadas automáticamente y verificar que cumplen las políticas internas de atribución de contenido sintético.
- **Forense documental con cadena de custodia:** el checksum SHA-256 del documento original y el certificado PDF con hash permiten conservar evidencia de qué se analizó y cuándo, útil en procedimientos internos o peritajes.
- **Detección de contenido "humanizado" en admisiones:** el módulo de evasión compara señales de disonancia semántica para marcar textos que podrían haber pasado por herramientas como Undetectable.ai o HideMyAI antes de la entrevista personal.
- **Filtrado de datasets sintéticos:** antes de entrenar un modelo propio, el clasificador puede marcar frases con alta probabilidad de generación automática y excluirlas o etiquetarlas, reduciendo contaminación del corpus.
- **Inspección en navegador:** la extensión Manifest V3 permite revisar un texto pegado en un formulario web o en un editor LMS sin salir de la página, útil para evaluaciones rápidas sobre el terreno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card incluye una demostración cualitativa (un ensayo "puro de IA" que se marca en zona roja con perplejidad inferior a 20 y una atribución del 89% a ChatGPT-4o), pero se trata de un ejemplo de producto, no de una evaluación con conjunto de test, métricas de precisión/recall ni comparación con líneas base.

## Requisitos de hardware

- **VRAM:** no se requieren GPU según la documentación; el endpoint `/health` del ejemplo devuelve `"device": "cpu"`. No se publican cifras de VRAM.
- **GPU recomendadas:** no aplica. No hay datos de aceleración por GPU ni requisitos mínimos documentados.
- **Hardware de consumo:** cualquier máquina capaz de ejecutar Python y FastAPI; el repositorio ocupa 0.0 GB, aunque conviene verificar que los artefactos `joblib` estén realmente incluidos antes de desplegar.
- **Despliegue:** servidor FastAPI con Uvicorn (`run.bat` o `python main.py` en Windows). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- **Latencia:** el autor afirma evaluaciones en torno a 1 segundo en la demo; no se documenta throughput ni latencia bajo carga concurrente.
- **Almacenamiento:** base de datos SQLite en modo WAL y directorio `data/uploads` que persiste los documentos subidos; el consumo de disco crece con el volumen de análisis.
- **Dependencias auxiliares:** ReportLab para los PDF y Tailwind vía CDN en el frontend, lo que implica dependencia de red para el interfaz si no se sirve localmente.

## Comparativa con modelos similares

No se dispone de datos verificables de benchmarks ni de especificaciones técnicas de alternativas en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa. Las categorías comparables serían:

- **Detectores comerciales de texto IA** (por ejemplo, GPTZero u Originality.ai): licencia propietaria, API de pago, sin pesos publicados. Parámetros, contexto y rendimiento: no disponible.
- **Detectores académicos basados en modelos tipo RoBERTa o DetectGPT:** requieren pesos y conjuntos de evaluación publicados. Parámetros, contexto y rendimiento: no disponible en esta búsqueda.
- **Clasificadores genéricos de HuggingFace para `text-classification`:** comparables en formato de despliegue, pero no específicos para detección forense. Parámetros, contexto y rendimiento: no disponible.

| Solución | Tipo | Parámetros | Contexto | Licencia | Datos verificables |
|---|---|---|---|---|---|
| `the-tech-art/ai-content-detector` | Clasificador forense + suite de aplicación | No disponible | No disponible | MIT | Solo documentación del autor |
| Detectores comerciales | SaaS propietario | No disponible | No disponible | Propietaria | No disponible |
| Detectores académicos (RoBERTa/DetectGPT) | Modelos de investigación | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **Sin evaluación independiente:** 0 descargas, 1 like y ningún benchmark publicado; no hay evidencia de precisión, recall o tasa de falsos positivos.
- **Afirmaciones no verificadas:** la atribución de plataforma (ChatGPT-4o, Claude 3.5, Gemini, Copilot) y la detección de humanizadores se presentan sin métricas ni metodología reproducible.
- **Riesgo de falsos positivos:** el texto muy formulaico, las plantillas institucionales y la escritura de no nativos son candidatos habituales a falsos positivos; el autor incluye una salvaguarda ESL, pero no documenta su eficacia.
- **Idioma:** los metadatos declaran únicamente inglés; el soporte de hindi, español, francés y alemán aparece como "bonus" sin evaluación ni cobertura declarada.
- **No es una prueba:** una puntuación alta no demuestra generación por IA; no debería usarse como evidencia disciplinaria o legal sin revisión humana y contexto.
- **Evasión:** cualquier detector es susceptible de ser evadido; la propia model card reconoce la existencia de herramientas de humanización, lo que sitúa al sistema en una carrera continua.
- **Privacidad:** el flujo de trabajo sube documentos completos y los persiste en `data/uploads` y SQLite; en un entorno real esto exige base jurídica, retención definida y cumplimiento del RGPD.
- **Licencia:** MIT permite uso comercial y modificación, pero se distribuye "tal cual", sin garantías; las dependencias de terceros (ReportLab, Tailwind CDN, la extensión de Chrome) mantienen sus propias condiciones.
- **Integridad del repositorio:** con un tamaño de 0.0 GB, conviene comprobar que los artefactos `joblib` y las dependencias estén realmente disponibles antes de planificar un despliegue.
- **Sesgos:** no se documenta ninguna evaluación de sesgo por origen, género o variedad dialectal del inglés.
- **Extensión de Chrome:** requiere revisión de permisos del manifiesto antes de distribuirla a usuarios finales.

## Enlaces

- HuggingFace: https://huggingface.co/the-tech-art/ai-content-detector
- Resultados de búsqueda web: no se encontraron papers, blogs, repositorios ni demos relevantes; las entradas devueltas trataban sobre el artículo inglés "the" y tiendas de té, sin relación con el modelo.
