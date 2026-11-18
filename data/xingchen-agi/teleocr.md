# XingChen-AGI/TeleOCR

## Resumen

TeleOCR es un modelo de visión-lenguaje (VLM) ligero, de aproximadamente 1.200 millones de parámetros, desarrollado por XingChen-AGI (TeleAI) y especializado en el parseo de documentos. Su particularidad es que unifica en un único marco el tratamiento de documentos digitales nativos y de documentos capturados con cámara, incluyendo imágenes con deformaciones geométricas, sin necesidad de un paso previo de rectificación (dewarping). Está construido sobre la arquitectura Qwen2.5-VL y se distribuye con licencia Apache 2.0.

El modelo resuelve el problema de extraer estructura y contenido (texto, tablas, fórmulas y orden de lectura) de documentos heterogéneos con un único modelo de tamaño contenido, lo que lo hace desplegable en hardware modesto. Frente a alternativas como MinerU 2.5 Pro, PaddleOCR-VL u OvisOCR2, TeleOCR reporta resultados estado del arte en OmniDocBench v1.6 y en el reto Dr.DocBench.

Es relevante ahora porque demuestra que un modelo de ~1,2B puede competir con sistemas de parseo documental más pesados, y porque su ecosistema ya incluye conversiones a GGUF y soporte de llama.cpp, además de despliegues comunitarios en aceleradores Ascend 910B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model basada en Qwen2.5-VL (transformer multimodal) |
| Parametros totales | 1.415.072.768 (~1,2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; existe conversion GGUF de la comunidad (nandraj/NaviDC-OCR-GGUF) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, custom_code); GGUF disponible via conversion comunitaria |

## Arquitectura y entrenamiento

TeleOCR es un VLM multimodal construido sobre Qwen2.5-VL, con unos 1.415 millones de parametros totales segun los pesos en safetensors. La model card describe una arquitectura orientada a la comprension de documentos: modelado geometrico consciente de la deformacion para documentos capturados con camara, y aprendizaje desacoplado de contenido y estructura para tablas y formulas. El modelo procesa la imagen del documento y genera directamente la estructura y el contenido parseados, sin un modelo de rectificacion dedicado.

El entrenamiento sigue un pipeline progresivo de cuatro etapas. Entre las tecnicas introducidas se citan Multi-node Consensus Voting (MCV) para la generacion automatica de pseudo-etiquetas, Curvature-Guided Douglas-Peucker Sampling (CGDP) para el muestreo de curvas en documentos deformados, y autoverificacion imagen-a-imagen para el refinamiento automatico de datos. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset, ni si se emplearon RLHF o DPO.

## Capacidades

- Parseo de documentos digitales: extraccion de texto, tablas, formulas y orden de lectura.
- Parseo de documentos capturados con camara, incluyendo imagenes con deformaciones geometricas (evaluado en DocUNet y DIR300) sin dewarping previo.
- Reconocimiento de estructura de tablas (evaluado con TEDS y TEDS-S) y de formulas (evaluado con CDM).
- Prediccion del orden de lectura del documento (evaluado con Read Order Edit).
- Interaccion conversacional multimodal (pipeline image-text-to-text, tag conversational).
- Soporte multilingue limitado a chino e ingles.
- Compatibilidad con text-generation-inference y endpoints compatibles.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio o modo thinking explicito.

## Casos de uso

- Digitalizacion de archivos historicos o escaneados con camara: el modelo parsea documentos deformados (curvaturas, perspectiva) sin paso previo de rectificacion, gracias al modelado geometrico y a CGDP.
- Extraccion de tablas financieras o tecnicas: el aprendizaje desacoplado de contenido y estructura y sus resultados en TEDS (97,05 en OmniDocBench v1.6) lo hacen adecuado para convertir tablas de PDF o fotos en datos estructurados.
- Conversion de articulos cientificos a Markdown/LaTeX: la alta puntuacion en formula CDM (96,36) permite recuperar formulas matematicas junto con el texto y el orden de lectura.
- Procesamiento masivo de facturas y formularios: con ~1,2B de parametros puede desplegarse en GPU de gama media o en aceleradores como Ascend 910B, abaratando el coste por pagina en pipelines de ingestion documental.
- Construccion de pipelines RAG sobre documentacion corporativa: el parseo fiable de estructura y orden de lectura mejora la calidad de los chunks que alimentan un sistema de recuperacion.
- Despliegue en entornos con recursos limitados: la existencia de pesos GGUF y soporte de llama.cpp permite ejecutar el modelo en CPU o GPU consumer para tareas de OCR documental en local.
- Participacion en competiciones de parseo documental: el equipo reporta su uso en el Dr.DocBench Challenge con resultados superiores a MinerU 2.5 Pro y PaddleOCR-VL 1.6.

## Benchmarks y rendimiento

Resultados reportados por el autor en Dr.DocBench Challenge:

| Modelo | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Order edit ↓ |
|---|---|---|---|---|---|
| TeleOCR | 67,96 | 0,1903 | 0,02 | 64,97 | 0,398 |
| MinerU 2.5 Pro | 62,26 | 0,3402 | 0,04 | 67,75 | 0,356 |
| OvisOCR2 | 59,25 | 0,3883 | 0,00 | 61,59 | 0,3791 |
| PaddleOCR-VL 1.6 | 55,11 | 0,4364 | 0,21 | 51,34 | 0,412 |

Resultados reportados en OmniDocBench v1.6:

| Modelo | Parametros | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Table TEDS-S ↑ | Read order edit ↓ |
|---|---|---|---|---|---|---|---|
| TeleOCR | 1,2B | 96,87 | 0,027 | 96,36 | 97,05 | 98,52 | 0,122 |
| OvisOCR2 | 0,8B | 96,58 | 0,025 | 97,53 | 94,76 | 97,16 | 0,111 |
| PaddleOCR-VL-1.6 | 0,9B | 96,33 | 0,033 | 97,49 | 94,76 | 97,11 | 0,127 |
| MinerU2.5-Pro | 1,2B | 95,75 | 0,036 | 97,45 | 93,42 | 95,92 | 0,120 |
| GLM-OCR | 0,9B | 95,22 | 0,044 | 97,18 | 92,83 | 95,39 | 0,133 |
| PaddleOCR-VL-1.5 | 0,9B | 94,87 | 0,038 | 96,69 | 91,67 | 94,37 | 0,130 |
| HunyuanOCR-1.5 | 1B | 94,74 | 0,033 | 97,49 | 94,76 | 97,1 | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 1.415 millones de parametros, en FP16 requiere aproximadamente 2,8 GB de pesos, y en cuantizaciones de 8 o 4 bits baja a rangos de ~1,5 GB y ~0,9 GB respectivamente (estimacion a partir del tamano del repo, 2,8 GB).
- GPU recomendadas: no especificadas por el autor; por tamano, cabe en GPU consumer como RTX 3060/4060/4090 y en GPUs de datacenter (A100, H100) para servir en lote.
- Cabe en GPU consumer: si, dado el tamano del modelo.
- Despliegue: transformers (libreria nativa, requiere custom_code), text-generation-inference, endpoints compatibles; GGUF y llama.cpp mediante la conversion comunitaria; despliegue reportado en Ascend 910B por la comunidad.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | OmniDocBench v1.6 overall | Licencia |
|---|---|---|---|---|
| TeleOCR | 1,2B | Documentos digitales y con camara | 96,87 | Apache 2.0 |
| OvisOCR2 | 0,8B | Parseo documental | 96,58 | no disponible |
| PaddleOCR-VL-1.6 | 0,9B | Parseo documental | 96,33 | no disponible |
| MinerU2.5-Pro | 1,2B | Parseo documental | 95,75 | no disponible |

TeleOCR lidera el overall en OmniDocBench v1.6 y en Dr.DocBench, aunque OvisOCR2 obtiene mejor edicion de texto (0,025 frente a 0,027) y mejor orden de lectura (0,111 frente a 0,122), y PaddleOCR-VL-1.6 y OvisOCR2 superan ligeramente a TeleOCR en formula CDM (97,49 y 97,53 frente a 96,36). La longitud de contexto de los modelos comparados no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano u otras lenguas no esta documentado.
- Formula CDM: 96,36, por debajo de OvisOCR2 (97,53) y PaddleOCR-VL-1.6 (97,49); en Dr.DocBench el CDM reportado es muy bajo (0,02), lo que sugiere fragilidad en formulas segun el conjunto de evaluacion.
- Table TEDS en Dr.DocBench (64,97) es inferior al de MinerU 2.5 Pro (67,75), pese a ganar en overall.
- Riesgo de alucinacion en documentos de baja calidad, manuscritos o layouts no vistos: no se documentan evaluaciones fuera de los benchmarks citados.
- Sesgos: no se documenta ninguna evaluacion de sesgos.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de los pesos base Qwen2.5-VL y de los datasets de entrenamiento.
- Requiere `trust_remote_code` por el uso de custom_code en transformers.
- El modelo cambio de nombre (NaviDC-OCR a TeleOCR) en septiembre de 2026; algunas referencias y conversiones comunitarias conservan el nombre antiguo.
- Longitud de contexto no documentada, lo que limita la planificacion de pipelines con documentos muy extensos en una sola pasada.

## Enlaces

- Hugging Face: https://huggingface.co/XingChen-AGI/TeleOCR
- Repositorio GitHub: https://github.com/caipeng328/TeleOCR
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.12898
- PDF del informe tecnico: https://arxiv.org/pdf/2608.12898
- Demo en TeleAI: https://www.teleai.com.cn/docparse/DocumentParsing
- Pesos originales (NaviDC-OCR): https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Conversion GGUF (comunidad): https://huggingface.co/nandraj/NaviDC-OCR-GGUF
- Despliegue en Ascend 910B (comunidad): https://zhuanlan.zhihu.com/p/2078516899093155893
- OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Dr.DocBench Challenge (EMNLP 2026): https://eval.ai/web/challenges/challenge-page/2717/overview
