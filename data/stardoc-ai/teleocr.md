# StarDoc-AI/TeleOCR

## Resumen

TeleOCR es un modelo de visión-lenguaje (VLM) especializado en el análisis y extracción de contenido de documentos, desarrollado por StarDoc-AI. Con aproximadamente 1.200 millones de parámetros (1.415.072.768 según los pesos en safetensors), está construido sobre la arquitectura Qwen2.5-VL y se distribuye bajo licencia Apache 2.0. Su propuesta diferencial es unificar en un único marco el análisis de documentos digitales (PDF nativos, imágenes limpias) y de documentos capturados con cámara (fotografías con perspectiva, curvatura y deformación geométrica), un escenario que la mayoría de modelos OCR tratan por separado o resuelven con preprocesamiento de rectificación.

El modelo resuelve el problema de la conversión de documentos a formatos estructurados (Markdown, HTML, tablas, fórmulas) manteniendo el orden de lectura y la estructura semántica, sin necesidad de un modelo dedicado de dewarping. Para ello introduce técnicas como Multi-node Consensus Voting (MCV) para el etiquetado pseudoautomático, modelado geométrico consciente de la deformación, muestreo Curvature-Guided Douglas-Peucker (CGDP) y autoverificación imagen-a-imagen para refinar datos de entrenamiento.

Es relevante ahora porque alcanza resultados de estado del arte en OmniDocBench v1.6 (96,87 de puntuación global) y en el reto Dr.DocBench (67,96), superando a alternativas como MinerU 2.5 Pro, PaddleOCR-VL 1.6 u OvisOCR2, manteniéndose lo bastante ligero (1,2B) para despliegue práctico en infraestructura moderada. El modelo fue renombrado desde NaviDC-OCR en septiembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model basada en Qwen2.5-VL (transformer multimodal) |
| Parametros totales | 1.415.072.768 (~1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (existe conversion GGUF de la comunidad) |
| Idiomas soportados | chino (zh), ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB); GGUF disponible via conversion de la comunidad |

## Arquitectura y entrenamiento

TeleOCR es un transformer multimodal basado en Qwen2.5-VL, con un codificador visual y un decodificador de lenguaje que procesan conjuntamente imagen y texto para generar contenido estructurado. El entrenamiento sigue un pipeline progresivo de cuatro etapas, e incorpora un conjunto de innovaciones técnicas orientadas al análisis documental: Multi-node Consensus Voting (MCV) para generar pseudoetiquetas de forma automática y fiable; modelado geométrico consciente de la geometría para documentos capturados con cámara; muestreo Curvature-Guided Douglas-Peucker (CGDP) para manejar curvas y deformaciones; autoverificación imagen-a-imagen para refinar automáticamente los datos; y aprendizaje desacoplado de contenido y estructura (Content-Structure Decoupled Learning) específicamente para tablas y fórmulas.

El modelo está diseñado para operar directamente sobre documentos deformados sin un paso previo de rectificación (dewarping), como demuestran las evaluaciones sobre los conjuntos DocUNet y DIR300. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Análisis de documentos digitales y capturados con cámara en un único marco, incluyendo documentos con curvatura y perspectiva.
- Extracción de texto con preservación del orden de lectura.
- Reconocimiento y reconstrucción de tablas en formato estructurado.
- Reconocimiento de fórmulas matemáticas con salida en formato estructurado (evaluado mediante métricas CDM).
- Generación de salida estructurada (Markdown/HTML) a partir de la imagen del documento.
- Procesamiento multimodal imagen-texto conversacional (pipeline image-text-to-text).
- Capacidades multilingües limitadas a chino, inglés y japonés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio adicional: no disponible; la capacidad principal es visión para documentos.

## Casos de uso

- Digitalización masiva de archivos históricos: el modelo puede procesar documentos escaneados o fotografiados con deformaciones sin necesidad de un paso previo de rectificación, lo que simplifica los pipelines de digitalización y reduce el coste computacional al eliminar el modelo de dewarping.
- Extracción de tablas financieras: gracias al aprendizaje desacoplado de contenido y estructura y a su puntuación TEDS de 97,05 en OmniDocBench, es adecuado para convertir estados de cuenta, informes contables o tablas de datos en formatos estructurados consumibles por bases de datos.
- Conversión de documentación técnica con fórmulas: la capacidad de reconocimiento de fórmulas (CDM 96,36) permite transformar papers y manuales científicos a Markdown o LaTeX para su publicación o indexación.
- Captura móvil de documentos: en aplicaciones de escaneo con smartphone, el modelo puede procesar fotografías con perspectiva y curvatura directamente, sin corrección geométrica previa, mejorando la experiencia en apps de gestión documental.
- Procesamiento de facturas y formularios: la preservación del orden de lectura (Read Order Edit de 0,122) y la extracción estructurada permiten automatizar la captura de datos en flujos de cuentas por pagar y gestión administrativa.
- Análisis de documentos en chino e inglés: con soporte nativo para ambos idiomas y también japonés, es adecuado para empresas con documentación multilingüe en esos mercados.
- Integración en pipelines de RAG documental: la salida estructurada y limpia facilita la fragmentación e indexación de documentos para sistemas de recuperación aumentada, reduciendo el ruido en la extracción.

## Benchmarks y rendimiento

Resultados en Dr.DocBench Challenge:

| Modelo | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Order edit ↓ |
|---|---|---|---|---|---|
| TeleOCR | 67,96 | 0,1903 | 0,02 | 64,97 | 0,398 |
| MinerU 2.5 Pro | 62,26 | 0,3402 | 0,04 | 67,75 | 0,356 |
| OvisOCR2 | 59,25 | 0,3883 | 0,00 | 61,59 | 0,3791 |
| PaddleOCR-VL 1.6 | 55,11 | 0,4364 | 0,21 | 51,34 | 0,412 |

Resultados en OmniDocBench v1.6:

| Modelo | Param | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Table TEDS-S ↑ | Read order edit ↓ |
|---|---|---|---|---|---|---|---|
| TeleOCR | 1,2B | 96,87 | 0,027 | 96,36 | 97,05 | 98,52 | 0,122 |
| OvisOCR2 | 0,8B | 96,58 | 0,025 | 97,53 | 94,76 | 97,16 | 0,111 |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 0,033 | 97,49 | 94,76 | 97,11 | 0,127 |
| MinerU2.5-Pro | 1,2B | 95,75 | 0,036 | 97,45 | 93,42 | 95,92 | 0,120 |
| GLM-OCR | 0,9B | 95,22 | 0,044 | 97,18 | 92,83 | 95,39 | 0,133 |
| PaddleOCR-VL-1.5 | 0,9B | 94,87 | 0,038 | 96,69 | 91,67 | 94,37 | 0,130 |
| HunyuanOCR-1.5 | 1B | 94,74 | 0,033 | 97,49 | 94,76 | 97,1 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (fp16/bf16), aproximadamente 2,8-3 GB para los pesos más memoria para activaciones y el codificador visual; en cuantización de 8 bits, en torno a 1,5 GB; en 4 bits, alrededor de 0,8-1 GB (estimaciones orientativas, no confirmadas en la información disponible).
- GPU recomendadas: A100 o H100 para despliegues de alto throughput; RTX 4090, RTX 3090 o A10 para producción de volumen moderado.
- Cabe en GPU de consumo: sí, por su tamaño de ~1,2B es viable en tarjetas con 8 GB o más de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.), especialmente con cuantización.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (TGI), vLLM, llama.cpp y Ollama mediante la conversión GGUF de la comunidad (NaviDC-OCR-GGUF); endpoints compatibles.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Overall OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|
| TeleOCR | 1,2B | 96,87 | Apache 2.0 | Hugging Face, GGUF comunidad |
| OvisOCR2 | 0,8B | 96,58 | no disponible | Hugging Face |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | no disponible | Hugging Face |
| MinerU2.5-Pro | 1,2B | 95,75 | no disponible | Hugging Face |

TeleOCR lidera en puntuación global y en Table TEDS (97,05) y Table TEDS-S (98,52), aunque OvisOCR2 obtiene mejor Text Edit (0,025 frente a 0,027) y mejor Read Order Edit (0,111 frente a 0,122), y PaddleOCR-VL-1.6 tiene mejor Formula CDM (97,49 frente a 96,36). En Dr.DocBench, TeleOCR supera claramente en overall a MinerU 2.5 Pro, OvisOCR2 y PaddleOCR-VL 1.6, aunque MinerU 2.5 Pro obtiene mejor Table TEDS (67,75 frente a 64,97) y PaddleOCR-VL 1.6 mejor Formula CDM (0,21 frente a 0,02).

## Limitaciones y advertencias

- Idiomas limitados a chino, inglés y japonés; no se garantiza un rendimiento adecuado en otros idiomas como el español.
- Riesgo de alucinación inherente a los modelos generativos: puede producir contenido no presente en el documento original, especialmente en regiones de baja calidad o documentos muy degradados.
- El rendimiento en fórmulas es bajo en el benchmark Dr.DocBench (CDM 0,02), lo que sugiere debilidades en escenarios de fórmulas complejas fuera de OmniDocBench.
- No se dispone de información sobre sesgos específicos del modelo.
- Aunque la licencia es Apache 2.0 (permite uso comercial), conviene verificar las condiciones de los datos de entrenamiento y de los modelos base (Qwen2.5-VL) para producción.
- La longitud de contexto no está especificada, lo que limita la planificación de despliegues con documentos de muchas páginas.
- El modelo está especializado en análisis documental; no debe emplearse como modelo generalista de visión o conversación.
- La conversión GGUF es de la comunidad (Nandraj), no oficial, por lo que puede presentar diferencias de calidad frente a los pesos originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarDoc-AI/TeleOCR
- Modelo original (NaviDC-OCR): https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Repositorio GitHub: https://github.com/caipeng328/TeleOCR
- Informe técnico (arXiv): https://arxiv.org/abs/2608.12898
- PDF del informe técnico: https://arxiv.org/pdf/2608.12898
- Webapp en TeleAI: https://www.teleai.com.cn/docparse/DocumentParsing
- Conversión GGUF (comunidad): https://huggingface.co/nandraj/NaviDC-OCR-GGUF
- OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Dr.DocBench Challenge: https://eval.ai/web/challenges/challenge-page/2717/overview
- Experiencia de despliegue en Ascend 910B: https://zhuanlan.zhihu.com/p/2078516899093155893
