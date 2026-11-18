# StarDoc-AI/NaviDC-OCR

## Resumen

NaviDC-OCR (renombrado TeleOCR a partir de septiembre de 2026) es un modelo vision-lenguaje ligero de aproximadamente 1.200 millones de parametros, desarrollado por StarDoc-AI, especializado en el parseo de documentos. A diferencia de otros sistemas que se centran en documentos digitales o en capturas de camara por separado, este modelo unifica ambos escenarios en un unico marco de trabajo, lo que le permite procesar documentos escaneados, fotografias de documentos con deformaciones geometricas y PDFs nativos con la misma arquitectura.

El modelo se construye sobre la arquitectura Qwen2.5-VL y se distribuye con licencia Apache 2.0, lo que facilita su adopcion en entornos comerciales. Con 1.415 millones de parametros en pesos safetensors y un tamano de repositorio de 2,8 GB, esta disenado para ser desplegado en hardware modesto sin renunciar a la precision en tareas de extraccion de texto, tablas, formulas y orden de lectura.

Su relevancia actual radica en que compite directamente con soluciones especializadas como MinerU 2.5 Pro, PaddleOCR-VL 1.6 u OvisOCR2, obteniendo resultados state-of-the-art en OmniDocBench v1.6 (96,87 de puntuacion global) y en el desafio Dr.DocBench (67,96), manteniendo un tamano reducido que lo hace viable para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language Model basado en Qwen2.5-VL (transformer multimodal) |
| Parametros totales | 1.415.072.768 (aproximadamente 1,2B reportados por el autor) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; existe conversion GGUF por la comunidad (nandraj/NaviDC-OCR-GGUF) |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers); GGUF disponible via conversion de la comunidad |

## Arquitectura y entrenamiento

NaviDC-OCR es un modelo vision-lenguaje construido sobre la base de Qwen2.5-VL, con un total de 1.415 millones de parametros. La arquitectura combina un codificador visual con un decoder de lenguaje para realizar tareas de image-text-to-text, procesando imagenes de documentos y generando salidas estructuradas de texto, tablas y formulas. El modelo incorpora codigo personalizado (custom_code) en su implementacion de transformers.

El entrenamiento sigue un pipeline progresivo de cuatro etapas e introduce varias innovaciones tecnicas destacables: Multi-node Consensus Voting (MCV) para la generacion automatica de pseudo-etiquetas, modelado geometrico consciente de la geometria para documentos capturados con camara, Curvature-Guided Douglas-Peucker Sampling (CGDP), autoverificacion imagen-a-imagen para el refinamiento automatico de datos y aprendizaje desacoplado de contenido y estructura para tablas y formulas. Estas tecnicas permiten al modelo manejar documentos con deformaciones geometricas sin necesidad de un preprocesamiento de rectificacion (dewarping) dedicado, como demuestran las evaluaciones en los conjuntos DocUNet y DIR300. No se dispone de informacion sobre el numero exacto de tokens de entrenamiento ni sobre la composicion detallada del dataset.

## Capacidades

- Parseo de documentos digitales: extraccion de texto, tablas, formulas y orden de lectura de PDFs y documentos nativos.
- Parseo de documentos capturados con camara: procesamiento directo de imagenes con deformaciones geometricas, curvaturas y perspectivas sin rectificacion previa.
- Extraccion de tablas con estructura compleja: reconocimiento de tablas y preservacion de su estructura mediante aprendizaje desacoplado de contenido y estructura.
- Reconocimiento de formulas matematicas: conversion de formulas a representaciones estructuradas (CDM).
- Determinacion del orden de lectura: identificacion de la secuencia correcta de lectura en documentos con layouts complejos.
- Generacion de texto conversacional: el pipeline image-text-to-text permite interaccion conversacional sobre el contenido de documentos.
- Capacidades multilingues limitadas a chino e ingles.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision: si, procesamiento de imagenes de documentos como entrada principal.

## Casos de uso

- Digitalizacion masiva de archivos: el modelo puede procesar lotes de documentos escaneados o fotografiados para extraer texto, tablas y formulas de forma estructurada, gracias a su capacidad de manejar tanto documentos digitales como capturas de camara en un unico framework.
- Extraccion de datos de facturas y formularios: integrado en pipelines de automatizacion documental, permite convertir imagenes de formularios en datos estructurados, manteniendo el orden de lectura y la estructura de tablas.
- Procesamiento de documentacion cientifica y tecnica: su capacidad para reconocer formulas matematicas y tablas complejas lo hace adecuado para digitalizar articulos academicos, patentes e informes tecnicos con contenido matematico.
- Digitalizacion de libros y documentos historicos fotografiados: al no requerir dewarping previo, puede procesar directamente imagenes de paginas curvadas o con perspectiva deformada, como las capturadas con camara movil o escaneres de baja calidad.
- Automatizacion de la entrada de datos en entornos empresariales: el modelo puede transformar documentos en formato imagen (contratos, albaranes, informes) en texto estructurado para su ingesta en sistemas ERP o bases de datos.
- Accesibilidad y conversion a formatos accesibles: conversion de documentos visuales a texto plano o formatos estructurados que puedan ser leidos por lectores de pantalla o procesados por sistemas de sintesis de voz.
- Preprocesamiento para pipelines RAG: extraccion de contenido estructurado de documentos empresariales para alimentar sistemas de recuperacion aumentada por generacion, preservando la estructura de tablas y el orden de lectura.
- Participacion en competiciones de parseo documental: el autor ha validado el modelo en el desafio Dr.DocBench de EMNLP 2026, superando a MinerU 2.5 Pro y PaddleOCR-VL 1.6, lo que lo hace adecuado para entornos de evaluacion competitiva.

## Benchmarks y rendimiento

Resultados en Dr.DocBench Challenge:

| Modelo | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Order edit ↓ |
|---|---|---|---|---|---|
| TeleOCR (NaviDC-OCR) | 67,96 | 0,1903 | 0,02 | 64,97 | 0,398 |
| MinerU 2.5 Pro | 62,26 | 0,3402 | 0,04 | 67,75 | 0,356 |
| OvisOCR2 | 59,25 | 0,3883 | 0,00 | 61,59 | 0,3791 |
| PaddleOCR-VL 1.6 | 55,11 | 0,4364 | 0,21 | 51,34 | 0,412 |

Resultados en OmniDocBench v1.6:

| Tipo | Metodo | Parametros | Overall ↑ | Text edit ↓ | Formula CDM ↑ | Table TEDS ↑ | Table TEDS-S ↑ | Read order edit ↓ |
|---|---|---|---|---|---|---|---|---|
| VLM especializado | TeleOCR | 1,2B | 96,87 | 0,027 | 96,36 | 97,05 | 98,52 | 0,122 |
| VLM especializado | OvisOCR2 | 0,8B | 96,58 | 0,025 | 97,53 | 94,76 | 97,16 | 0,111 |
| VLM especializado | PaddleOCR-VL-1.6 | 0,9B | 96,33 | 0,033 | 97,49 | 94,76 | 97,11 | 0,127 |
| VLM especializado | MinerU2.5-Pro | 1,2B | 95,75 | 0,036 | 97,45 | 93,42 | 95,92 | 0,120 |
| VLM especializado | GLM-OCR | 0,9B | 95,22 | 0,044 | 97,18 | 92,83 | 95,39 | 0,133 |
| VLM especializado | PaddleOCR-VL-1.5 | 0,9B | 94,87 | 0,038 | 96,69 | 91,67 | 94,37 | 0,130 |
| VLM especializado | HunyuanOCR-1.5 | 1B | 94,74 | 0,033 | 97,49 | 94,76 | 97,1 | No disponible |

Ademas, el autor reporta evaluaciones visuales en los conjuntos de dewarping DocUNet y DIR300, donde el modelo realiza parseo directo de documentos distorsionados sin preprocesamiento de rectificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 1,2B-1,4B parametros, la inferencia en precision FP16 requiere alrededor de 2,8-3 GB de VRAM solo para los pesos, mas el overhead del codificador visual y las activaciones. En cuantizacion de 8 bits se reduce a unos 1,5 GB, y en 4 bits a menos de 1 GB.
- GPU recomendadas: el modelo cabe holgadamente en GPUs de consumo como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090. Para despliegue en produccion con mayor throughput, se recomiendan A100, H100 o L40S.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU moderna con al menos 4-6 GB de VRAM para FP16, y en GPUs integradas o de gama baja con cuantizacion GGUF.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (TGI), llama.cpp (via la conversion GGUF de nandraj/NaviDC-OCR-GGUF), y endpoints compatibles. Tambien se ha reportado despliegue en Ascend 910B por parte de la comunidad.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Overall OmniDocBench v1.6 | Overall Dr.DocBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TeleOCR (NaviDC-OCR) | 1,2B | No disponible | 96,87 | 67,96 | Apache 2.0 | Hugging Face, GGUF comunidad |
| MinerU 2.5 Pro | 1,2B | No disponible | 95,75 | 62,26 | No disponible | No disponible |
| PaddleOCR-VL 1.6 | 0,9B | No disponible | 96,33 | 55,11 | No disponible | No disponible |
| OvisOCR2 | 0,8B | No disponible | 96,58 | 59,25 | No disponible | No disponible |

TeleOCR lidera en la puntuacion global de OmniDocBench v1.6 y en Dr.DocBench, aunque OvisOCR2 obtiene mejor resultado en text edit y read order edit, y PaddleOCR-VL 1.6 destaca en formula CDM. La licencia Apache 2.0 de TeleOCR es una ventaja competitiva frente a alternativas cuya licencia no se especifica en la informacion disponible.

## Limitaciones y advertencias

- Idiomas: el modelo solo soporta chino e ingles de forma oficial, lo que limita su uso en documentos en castellano u otros idiomas sin un ajuste adicional.
- Riesgo de alucinacion: como todo modelo generativo, puede producir contenido inexistente o incorrecto en documentos con baja calidad de imagen, layouts extremadamente complejos o contenido ambiguo.
- Dependencia de la calidad de imagen: aunque el modelo maneja deformaciones geometricas, imagenes con muy baja resolucion, desenfoque severo u oclusiones pueden degradar la precision.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los terminos de las dependencias subyacentes (Qwen2.5-VL) y de los pesos convertidos por terceros (GGUF).
- Limitaciones de contexto: no se ha especificado la longitud de contexto, lo que impide evaluar su comportamiento en documentos de gran extension o conversaciones multi-turno largas.
- Caveat de produccion: el modelo ha sido renombrado de NaviDC-OCR a TeleOCR, y las futuras iteraciones se publicaran bajo el nuevo nombre; se recomienda monitorizar el repositorio para actualizaciones.
- Rendimiento en tablas: en Dr.DocBench, su Table TEDS (64,97) es inferior al de MinerU 2.5 Pro (67,75), por lo que en tareas con tablas muy complejas podria no ser la mejor opcion.
- Formula CDM bajo en Dr.DocBench (0,02) en comparacion con PaddleOCR-VL 1.6 (0,21), lo que sugiere limitaciones en la extraccion de formulas en ese conjunto especifico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Repositorio GitHub: https://github.com/caipeng328/TeleOCR
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.12898
- PDF del informe tecnico: https://arxiv.org/pdf/2608.12898
- Demo en TeleAI: https://www.teleai.com.cn/docparse/DocumentParsing
- Conversion GGUF (comunidad): https://huggingface.co/nandraj/NaviDC-OCR-GGUF
- Despliegue en Ascend 910B (articulo comunitario): https://zhuanlan.zhihu.com/p/2078516899093155893
- OmniDocBench: https://github.com/opendatalab/OmniDocBench
- Desafio Dr.DocBench (EMNLP 2026): https://eval.ai/web/challenges/challenge-page/2717/overview
