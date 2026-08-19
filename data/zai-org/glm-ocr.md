# zai-org/GLM-OCR

## Resumen

GLM-OCR es un modelo multimodal de OCR (reconocimiento optico de caracteres) desarrollado por Z.AI (zai-org) para la comprension de documentos complejos. Está construido sobre la arquitectura GLM-V encoder-decoder e introduce dos innovaciones clave: una pérdida de predicción multi-token (MTP) y un esquema de aprendizaje por refuerzo estable sobre tareas completas. Con solo 0.9B parámetros activos, el modelo alcanza un rendimiento puntero en benchmarks de comprensión documental, obteniendo una puntuación de 94.62 en OmniDocBench V1.5, la mejor en su categoría.

El modelo integra un codificador visual CogViT preentrenado con datos imagen-texto a gran escala, un conector cross-modal ligero con downsampling eficiente de tokens, y un decodificador de lenguaje GLM-0.5B. Este diseño permite un despliegue eficiente en entornos de producción con alta concurrencia, siendo compatible con vLLM, SGLang y Ollama. Su relevancia actual radica en ofrecer un rendimiento de nivel SOTA en tareas de OCR y parsing de documentos con un coste computacional significativamente menor que modelos comparables, lo que lo hace adecuado tanto para servicios en la nube como para despliegues en el edge.

El modelo soporta ocho idiomas (chino, inglés, francés, español, ruso, alemán, japonés y coreano) y se distribuye bajo licencia MIT, lo que facilita su adopción tanto en investigación como en productos comerciales. El repositorio incluye un SDK oficial que integra el pipeline completo de análisis de diseño y reconocimiento paralelo basado en PP-DocLayout-V3, reduciendo el esfuerzo de ingeniería necesario para construir sistemas de inteligencia documental de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-V encoder-decoder (CogViT visual encoder + cross-modal connector + GLM-0.5B decoder) |
| Parametros totales | 1.325.258.240 (safetensors) |
| Parametros activos | 0.9B (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh, en, fr, es, ru, de, ja, ko |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-OCR se basa en la arquitectura GLM-V, un diseño encoder-decoder multimodal. El componente visual es un codificador CogViT preentrenado sobre datos imagen-texto a gran escala, que extrae características visuales de las imágenes de entrada. Estas características se proyectan mediante un conector cross-modal ligero que aplica un downsampling eficiente de tokens, reduciendo la carga computacional en la etapa de decodificación. El decodificador de lenguaje es un modelo GLM de 0.5B parámetros que genera el texto de salida, ya sea transcripción, markdown estructurado o extracción de información.

El entrenamiento introduce dos innovaciones técnicas. La primera es la pérdida Multi-Token Prediction (MTP), que permite al modelo predecir múltiples tokens de salida simultáneamente en lugar de uno a uno, mejorando la eficiencia del entrenamiento y la precisión del reconocimiento. La segunda es un esquema de aprendizaje por refuerzo estable sobre tareas completas (full-task RL), que refuerza el rendimiento del modelo en el conjunto de tareas finales. El modelo se complementa con un pipeline de dos etapas basado en PP-DocLayout-V3: primero se realiza un análisis de diseño del documento y después se ejecuta el reconocimiento paralelo de las regiones identificadas. Este enfoque combinado permite a GLM-OCR manejar diseños documentales diversos con robustez.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de alta precisión sobre documentos complejos, incluyendo tablas, fórmulas matemáticas y código fuente.
- Parsing de documentos completos a formato Markdown estructurado, preservando la jerarquía y el diseño original.
- Extracción de información específica de documentos, como campos de formularios, facturas o informes técnicos.
- Comprensión de imágenes con contenido mixto (texto + gráficos + tablas) en un solo paso de inferencia.
- Soporte multilingüe para ocho idiomas: chino, inglés, francés, español, ruso, alemán, japonés y coreano.
- Capacidad de procesamiento de imágenes a alta velocidad: 1.86 páginas/segundo para PDF y 0.67 imágenes/segundo, según pruebas del autor.
- Integración con herramientas de inferencia estándar: vLLM, SGLang, Ollama y Transformers.
- Pipeline de análisis de diseño integrado mediante SDK oficial, que combina detección de regiones y reconocimiento paralelo.

## Casos de uso

- Digitalización de documentos empresariales: GLM-OCR puede convertir escaneos de contratos, facturas o formularios en texto estructurado y Markdown, facilitando su indexación y búsqueda en sistemas de gestión documental. Su precisión en tablas y sellos lo hace adecuado para entornos administrativos reales.
- Extracción de datos de facturas y recibos: el modelo puede identificar y extraer campos clave como importes, fechas, números de factura o datos fiscales, integrándose en pipelines de contabilidad automatizada o ERP.
- Parsing de artículos académicos y técnicos: su capacidad para reconocer fórmulas matemáticas y código fuente lo convierte en una herramienta útil para convertir papers científicos o documentación técnica en formatos editables como LaTeX o Markdown.
- Asistencia a personas con discapacidad visual: la combinación de OCR preciso y baja latencia permite construir aplicaciones de lectura de documentos en tiempo real en dispositivos móviles o de escritorio.
- Automatización de procesos de negocio (RPA): GLM-OCR puede integrarse en flujos de trabajo que requieran leer documentos adjuntos en correos electrónicos, formularios web o sistemas de ticketing, extrayendo la información necesaria para su procesamiento posterior.
- Archivado y preservación digital: bibliotecas y archivos históricos pueden utilizar el modelo para digitalizar colecciones extensas de documentos, con un coste computacional reducido gracias a sus 0.9B parámetros y su soporte para despliegue en hardware modesto.
- Desarrollo de asistentes conversacionales con capacidad de lectura de documentos: al ser un modelo image-text-to-text, puede integrarse en chatbots o asistentes virtuales que necesiten interpretar imágenes o PDFs adjuntos en una conversación, por ejemplo para responder preguntas sobre el contenido de un manual o un informe.

## Benchmarks y rendimiento

El modelo reporta los siguientes resultados según la información del autor:

| Benchmark | Resultado |
|---|---|
| OmniDocBench V1.5 | 94.62 (puesto #1) |
| Rendimiento en parsing de PDF | 1.86 páginas/segundo |
| Rendimiento en parsing de imágenes | 0.67 imágenes/segundo |

No se han publicado resultados detallados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible. Los datos de velocidad corresponden a pruebas del autor bajo condiciones de hardware idénticas (una sola réplica, concurrencia única).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero con 0.9B parámetros y pesos en safetensors (2.7 GB repo), se estima que la inferencia en FP16 requiere aproximadamente 2-4 GB de VRAM, dependiendo de la longitud del contexto y del tamaño de la imagen de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia básica. Para despliegues de alta concurrencia se recomiendan GPUs como RTX 4090, A100 o H100.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo como RTX 3060, RTX 4060 o superiores, gracias a su reducido tamaño.
- Opciones de despliegue: vLLM (con soporte para el nightly build), SGLang, Ollama (comando `ollama run glm-ocr`), y Transformers con `AutoModelForImageTextToText`.
- Latencia y throughput: según el autor, el modelo alcanza 1.86 páginas/segundo en PDF y 0.67 imágenes/segundo en imágenes, lo que lo hace adecuado para servicios en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench V1.5 | Licencia |
|---|---|---|---|---|
| GLM-OCR | 0.9B | no disponible | 94.62 | MIT |
| Alternativas comerciales (p.ej. GPT-4V, Gemini) | no disponible | no disponible | no publicado | Propietaria |
| Modelos OCR tradicionales (p.ej. Tesseract) | variable | N/A | no comparable | Apache 2.0 |

No se dispone de datos públicos de benchmarks comparables para modelos OCR de la misma categoría en la información proporcionada. GLM-OCR destaca por su combinación de tamaño reducido, licencia permisiva y rendimiento SOTA en comprensión documental, lo que lo diferencia de soluciones propietarias más pesadas y de herramientas OCR clásicas sin capacidades de comprensión semántica.

## Limitaciones y advertencias

- El modelo está especializado en OCR y comprensión documental; no es un modelo de propósito general para tareas de razonamiento o generación de texto libre.
- La longitud de contexto no está documentada oficialmente, lo que puede suponer un riesgo para documentos extremadamente largos.
- El rendimiento en idiomas distintos de los ocho soportados (zh, en, fr, es, ru, de, ja, ko) no está garantizado.
- El pipeline de análisis de diseño (PP-DocLayout-V3) solo está disponible a través del SDK oficial, que actualmente solo soporta tareas de parsing de documentos, no extracción de información.
- Aunque la licencia MIT permite uso comercial sin restricciones, el modelo puede heredar sesgos de los datos de entrenamiento, especialmente en dominios especializados o lenguajes minoritarios.
- La documentación sobre cuantización y requisitos exactos de hardware es limitada; se recomienda realizar pruebas de rendimiento en el entorno de despliegue objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/zai-org/GLM-OCR
- GitHub: https://github.com/zai-org/GLM-OCR
- Technical Report (arXiv): https://arxiv.org/abs/2603.10910
- Documentación API de Z.AI: https://docs.z.ai/guides/vlm/glm-ocr
- DeepWiki: https://deepwiki.com/zai-org/GLM-OCR
- aiart.tools: https://aiart.tools/models/glm-ocr
