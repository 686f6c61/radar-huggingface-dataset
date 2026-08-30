# ThePilot999/FastWan2.1-T2V-1.3B-Diffusers

## Resumen

FastWan2.1-T2V-1.3B-Diffusers es un modelo de generación de vídeo a partir de texto, desarrollado por el equipo FastVideo (hao-ai-lab) como una evolución del modelo base Wan-AI/Wan2.1-T2V-1.3B-Diffusers. El repositorio que se analiza aquí es una copia publicada por el usuario ThePilot999, con el mismo contenido que el original alojado en FastVideo/FastWan2.1-T2V-1.3B-Diffusers. El modelo introduce la estrategia **Sparse-distill**, que combina destilación DMD (Distribution Matching Distillation) con atención dispersa VSA (Video Sparse Attention) en un único proceso de entrenamiento, reduciendo tanto el número de pasos de difusión como el coste computacional de la atención.

El resultado es un modelo capaz de generar vídeos de alta calidad en solo **3 pasos de inferencia**, alcanzando hasta **16 FPS** en una GPU H100. Está entrenado para producir secuencias de **61 frames a resolución 448×832**, aunque admite cualquier resolución con posible degradación de calidad. Con **1.489.821.760 parámetros** (aproximadamente 1,49 mil millones), se posiciona como una opción ligera y rápida dentro del ecosistema de generación de vídeo, pensada para entornos con recursos limitados o aplicaciones en tiempo real.

La relevancia de este modelo radica en su capacidad para acelerar drásticamente la generación de vídeo sin sacrificar demasiada calidad, gracias a la combinación de destilación y atención dispersa. Está disponible bajo licencia Apache 2.0, lo que permite uso comercial y modificación, y se integra con el framework FastVideo, que ofrece scripts de entrenamiento e inferencia listos para usar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión latente para vídeo (DiT) con atención dispersa (VSA) |
| Parametros totales | 1.489.821.760 (1,49B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 61 frames (resolución 448×832) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FastWan2.1-T2V-1.3B-Diffusers se construye sobre el modelo base Wan2.1-T2V-1.3B, un transformer de difusión latente diseñado para generación de vídeo. La innovación principal es la estrategia **Sparse-distill**, que integra dos técnicas complementarias: la destilación DMD, que reduce el número de pasos de difusión necesarios (de decenas a solo 3), y la atención dispersa VSA, que disminuye el coste computacional de la atención al procesar solo una fracción de las relaciones espaciotemporales. Esta combinación se entrena de forma conjunta, lo que permite que el modelo aprenda a generar vídeos de calidad con una fracción del coste de inferencia.

El entrenamiento se realizó sobre el dataset sintético **FastVideo 480P Synthetic Wan**, que contiene 600.000 latentes sintéticos. Se utilizaron 4 nodos con 32 GPUs H200, un tamaño de lote global de 64, gradiente acumulado de 2, tasa de aprendizaje de 1e-5 y una dispersión de atención VSA de 0,8. El proceso duró aproximadamente 4000 pasos (unas 12 horas). El modelo está entrenado para generar vídeos de 61 frames a 448×832, pero soporta cualquier resolución, aunque con posible pérdida de calidad.

## Capacidades

- **Generación de vídeo a partir de texto**: acepta prompts en lenguaje natural y produce secuencias de vídeo coherentes con la descripción.
- **Inferencia rápida en 3 pasos**: gracias a la destilación DMD, el modelo genera vídeos con solo 3 pasos de difusión, frente a los 30-50 habituales en otros modelos.
- **Atención dispersa (VSA)**: reduce el coste computacional de la atención, permitiendo mayor velocidad y menor consumo de memoria.
- **Resoluciones flexibles**: aunque está entrenado en 448×832, puede generar vídeos a otras resoluciones (con degradación de calidad).
- **Alto rendimiento**: alcanza hasta 16 FPS en una GPU H100, lo que lo hace adecuado para aplicaciones en tiempo real.
- **Integración con FastVideo**: compatible con el framework FastVideo, que ofrece scripts de inferencia y entrenamiento, así como soporte para GPUs desde H100 hasta RTX 4090 y Mac.

## Casos de uso

- **Creación de contenido para redes sociales**: generar clips cortos de vídeo a partir de descripciones textuales para plataformas como TikTok, Instagram o YouTube Shorts. El modelo permite producir vídeos de 61 frames (unos 3-4 segundos a 16 FPS) de forma rápida, ideal para iterar sobre ideas creativas.
- **Prototipado de storyboards en producción audiovisual**: directores y guionistas pueden convertir guiones en vídeos preliminares para visualizar escenas antes de rodar. La velocidad de inferencia permite explorar múltiples variaciones en minutos.
- **Generación de vídeos de demostración para productos**: empresas pueden crear vídeos promocionales o tutoriales a partir de texto sin necesidad de equipos de grabación, reduciendo costes y tiempos de producción.
- **Educación y formación**: generar vídeos explicativos animados para cursos online, simulaciones de conceptos científicos o demostraciones de procedimientos, a partir de descripciones textuales.
- **Entretenimiento y arte generativo**: artistas y creadores pueden usar el modelo como herramienta de exploración visual, generando vídeos abstractos o narrativos a partir de prompts creativos.
- **Investigación en generación de vídeo**: el modelo sirve como punto de partida para experimentos de fine-tuning o para estudiar técnicas de destilación y atención dispersa, gracias a su licencia abierta y a la disponibilidad de scripts de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas comparativas como FVD, IS o CLIP score, ni comparaciones con otros modelos de generación de vídeo. El único dato de rendimiento mencionado es la velocidad de inferencia: **16 FPS en una GPU H100** con 3 pasos de difusión.

## Requisitos de hardware

- **GPU recomendadas**: el modelo es compatible con GPUs desde H100 hasta RTX 4090, según la documentación de FastVideo. También se menciona soporte para Mac.
- **VRAM estimada**: no se especifica oficialmente. Dado que el modelo tiene 1,49B parámetros, en FP16 ocuparía aproximadamente 3 GB solo en pesos, pero la generación de vídeo requiere memoria adicional para los latentes y las activaciones de atención. Se recomienda al menos 8-12 GB de VRAM para resolución 448×832, aunque no hay datos confirmados.
- **Opciones de despliegue**: el modelo se integra con el framework FastVideo, que proporciona scripts de inferencia (`fastvideo generate`) y soporta backends de atención como VIDEO_SPARSE_ATTN. También es posible usar la librería diffusers, ya que el repositorio incluye el pipeline `WanDMDPipeline`.
- **Latencia y throughput**: se reporta 16 FPS en H100 con 3 pasos de inferencia, lo que equivale a generar un vídeo de 61 frames en aproximadamente 3,8 segundos. En GPUs menos potentes, el rendimiento será menor.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución / frames | Pasos de inferencia | Licencia | Notas |
|---|---|---|---|---|---|
| FastWan2.1-T2V-1.3B (este) | 1,49B | 61×448×832 | 3 | Apache 2.0 | Destilación DMD + atención dispersa VSA |
| Wan2.1-T2V-1.3B (base) | 1,49B | 61×448×832 | 30-50 (típico) | Apache 2.0 | Modelo original sin destilación |
| HunyuanVideo | 13B | Variable | 30-50 | Apache 2.0 | Modelo más grande, mayor calidad pero más lento |

No se dispone de benchmarks comparativos entre estos modelos. La comparativa se basa en características técnicas conocidas. FastWan2.1 destaca por su velocidad de inferencia, mientras que HunyuanVideo ofrece mayor capacidad pero con un coste computacional mucho mayor.

## Limitaciones y advertencias

- **Calidad dependiente de la resolución**: el modelo está entrenado en 448×832; generar a otras resoluciones puede producir artefactos o degradación de calidad.
- **Sesgos y alucinaciones**: al ser un modelo generativo, puede producir contenido no deseado o incoherente con el prompt, especialmente en escenas complejas o con múltiples objetos. No se han documentado sesgos específicos, pero es recomendable revisar los vídeos generados antes de su uso en producción.
- **Dependencia de FastVideo**: la atención dispersa VSA requiere la instalación del paquete `csrc/attn` de FastVideo, lo que añade una dependencia adicional al despliegue.
- **Idiomas**: no se especifican los idiomas soportados; el modelo base Wan2.1 está entrenado principalmente con datos en inglés y chino, por lo que el rendimiento en otros idiomas puede ser limitado.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial sin restricciones, pero es necesario verificar que el dataset sintético utilizado no tenga limitaciones adicionales.
- **Recursos de hardware**: aunque el modelo es ligero, la generación de vídeo a resoluciones altas puede requerir GPUs con suficiente VRAM; no se garantiza funcionamiento en GPUs de gama baja.

## Enlaces

- [HuggingFace - ThePilot999/FastWan2.1-T2V-1.3B-Diffusers](https://huggingface.co/ThePilot999/FastWan2.1-T2V-1.3B-Diffusers)
- [HuggingFace - FastVideo/FastWan2.1-T2V-1.3B-Diffusers (original)](https://huggingface.co/FastVideo/FastWan2.1-T2V-1.3B-Diffusers)
- [HuggingFace - Wan-AI/Wan2.1-T2V-1.3B-Diffusers (modelo base)](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers)
- [GitHub - FastVideo](https://github.com/hao-ai-lab/FastVideo)
- [Paper VSA - arXiv:2505.13389](https://arxiv.org/abs/2505.13389)
- [Paper Fast video generation - arXiv:2502.04507](https://arxiv.org/abs/2502.04507)
- [Demo online](https://fastwan.fastvideo.org/)
- [ModelScope - FastWan2.1-T2V-1.3B-Diffusers](https://www.modelscope.cn/models/FastVideo/FastWan2.1-T2V-1.3B-Diffusers)
