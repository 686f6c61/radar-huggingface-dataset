# YuhengSSS/SDRPN-Qwen3.5-9B

## Resumen

SDRPN-Qwen3.5-9B es un checkpoint de la etapa 1 del método SD-RPN (Self-Distilled RoI Predictors), desarrollado por Yuheng Shi, Xiaohuan Pei, Minjing Dong y Chang Xu. Se construye sobre el modelo multimodal denso Qwen/Qwen3.5-9B de Alibaba Cloud, que permanece congelado, y anade una rama auxiliar ("twig") de predicción de regiones de interés (RoI) con configuración K = 21 y T = 3. El objetivo es mejorar la percepción visual de grano fino en modelos de lenguaje multimodal, localizando regiones relevantes de la imagen antes de razonar sobre ellas.

El checkpoint entrena únicamente tres bloques twig con pseudoetiquetas de atención autodestiladas, sin anotación humana de RoI. Con 10.038.985.456 parámetros totales y pesos en bfloat16 safetensors (unos 20,1 GB de repositorio), sirve como inicialización del entrenamiento por refuerzo a nivel de región de la etapa 2, publicado como YuhengSSS/VisionRL2-Qwen3.5-9B. Es relevante ahora porque conecta dos líneas de trabajo recientes (SD-RPN, presentado en ICLR 2026, y Vision-RL²) en torno a la optimización de políticas a nivel de región para MLLM.

Se trata de un artefacto de investigación, no de un modelo listo para producción: sus pesos no se cargan con `AutoModel`/`AutoModelForCausalLM` para inferencia de RoI y requieren las clases de modelo y el arnés de evaluación del repositorio VisionRL2. Los datos de contexto, idiomas soportados y cuantizaciones alternativas no están publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (Qwen3.5-9B) con rama twig de predicción de RoI (K = 21, T = 3) |
| Parametros totales | 10.038.985.456 |
| Parametros activos | no aplica (arquitectura densa, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 safetensors (único formato publicado); no disponible GGUF ni cuantizaciones de menor precisión |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16); requiere código de modelado externo para la ruta de RoI |
| Modelo base | Qwen/Qwen3.5-9B (congelado) |
| Rama entrenada | tres bloques twig, K = 21, T = 3 |
| Etapa | 1 (SD-RPN, pseudoetiquetas autodestiladas) |
| Tamano del repositorio | 20,1 GB |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El modelo parte del backbone multimodal Qwen3.5-9B, que según la documentación del modelo base emplea un enfoque de fusión temprana sobre tokens multimodales para unificar visión y lenguaje. Sobre ese backbone congelado se acoplan tres bloques twig que actúan como predictor de RoI: una cabeza de mapa de calor, una puerta relativa al pico (peak-relative gate), un recorte por componentes conexos y un empalme de subimagen (sub-image splice). Esta ruta de gating no forma parte de los pesos como módulo estándar, sino que vive en las clases de modelo y el arnés de evaluación del repositorio VisionRL2.

El entrenamiento de esta etapa 1 es de autodestilación: las pseudoetiquetas de atención se generan a partir del propio backbone, sin anotación humana de regiones. Solo se actualizan los parámetros de los tres bloques twig; el backbone permanece intacto, de ahí que el `model.safetensors` resultante se mantenga a unos pocos cientos de MB del modelo base. Esta etapa 1 es la inicialización de la etapa 2, un entrenamiento por refuerzo a nivel de región que da lugar a YuhengSSS/VisionRL2-Qwen3.5-9B. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en esta etapa concreta.

## Capacidades

- Percepción visual de grano fino: predicción de regiones de interés (RoI) sobre imágenes mediante la rama twig, con K = 21 y T = 3.
- Generación multimodal imagen-texto: hereda las capacidades del backbone Qwen3.5-9B, descrito como modelo multimodal para razonamiento visual, OCR y generación con contexto largo.
- Razonamiento y comprensión visual: el modelo base se presenta con paridad generacional frente a Qwen3 y mejoras sobre Qwen3-VL en razonamiento, código, agentes y comprensión visual.
- Soporte conversacional: la etiqueta `conversational` está declarada en el modelo.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada para este checkpoint.
- Capacidades multilingües: no disponible.
- Capacidades especiales: el componente diferencial es la propuesta de regiones (RoI) y su uso como evidencia para percepción fina; el checkpoint es la inicialización de un pipeline de RL a nivel de región, no un modelo final entrenado.

## Casos de uso

- Investigación en percepción multimodal de grano fino: el checkpoint permite reproducir la etapa 1 del pipeline SD-RPN y estudiar cómo las pseudoetiquetas de atención autodestiladas se traducen en propuestas de región, usando el arnés `aligned_eval.sh` con `CAP=576`.
- Inicialización de entrenamiento por refuerzo a nivel de región: sirve como punto de partida del script `scripts/train_rl_qwen3_5_9b.sh` para reproducir la etapa 2 y obtener el modelo VisionRL2-Qwen3.5-9B.
- Análisis de mecanismos de atención visual: al derivar las pseudoetiquetas de la propia atención del backbone, es útil para estudiar qué zonas de una imagen activan la atención del modelo antes de cualquier ajuste con supervisión humana.
- Evaluación comparativa de predictores de RoI: el repositorio reporta filas de SD-RPN etapa 1 por benchmark para Qwen3.5-4B y Gemma-4-12B-it, lo que permite situar variantes de distinto backbone dentro del mismo protocolo alineado.
- Generación de evidencia visual recortada para pipelines posteriores: la ruta de gating produce recortes por componentes conexos y empalmes de subimagen que pueden alimentar módulos de OCR o de descripción de detalles en documentos e imágenes densas.
- Base para experimentos de destilación sin anotación humana: el enfoque evita el coste de etiquetar RoI manualmente, lo que resulta útil para equipos que quieran adaptar el método a dominios propios con solo datos de imagen.
- Reproducción académica del artículo SD-RPN: el checkpoint está pensado para validar los resultados del artículo de ICLR 2026 sobre predictores de RoI autodestilados.

## Benchmarks y rendimiento

La información disponible no publica resultados por benchmark para este checkpoint de 9B. El README indica que el artículo reporta la fila "SD-RPN (stage 1)" por benchmark solo para Qwen3.5-4B y Gemma-4-12B-it, y que para el backbone de 9B únicamente se reporta el modelo de etapa 2.

| Modelo | Media de la tabla principal de Vision-RL² | Notas |
|---|---|---|
| Vision-RL² sobre Qwen3.5-9B (etapa 2) | 80,1 | Media de la tabla principal reportada en la página del proyecto; corresponde al modelo final de RL, no a este checkpoint |
| SD-RPN-Qwen3.5-9B (etapa 1, este checkpoint) | no disponible | Es la inicialización de la etapa 2; no se publica su media por benchmark |
| SD-RPN etapa 1 sobre Qwen3.5-4B | no disponible en la información proporcionada | Se menciona que existe fila publicada por benchmark, sin cifras |
| SD-RPN etapa 1 sobre Gemma-4-12B-it | no disponible en la información proporcionada | Se menciona que existe fila publicada por benchmark, sin cifras |

No se detallan en la información disponible los nombres concretos de los benchmarks que componen esa media de 80,1.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 20-22 GB solo para pesos, dado que el repositorio ocupa 20,1 GB y el total es de 10.038.985.456 parámetros; hay que sumar activaciones y el estado de la ruta de RoI.
- GPU recomendadas: no hay recomendaciones publicadas. Por tamaño, tarjetas con 24 GB o más (RTX 4090, L40S, A100 40 GB, H100) son las candidatas razonables para bfloat16; no es un dato confirmado por el autor.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 3090 (24 GB) para bfloat16, aunque con poco margen; en GPUs de 16 GB o menos no cabría sin cuantizar y no hay cuantizaciones publicadas.
- Opciones de despliegue: no es desplegable mediante `AutoModel` ni `AutoModelForCausalLM` para inferencia de RoI. Requiere el repositorio https://github.com/YuHengsss/VisionRL2 y su arnés de evaluación. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI para la ruta de RoI.
- Latencia y throughput: no disponible.
- Comando de evaluación indicado por el autor: `MODEL=qwen3_5 CHECKPOINT=... CAP=576 bash scripts/aligned_eval.sh`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SDRPN-Qwen3.5-9B (este) | 10.038.985.456 | no disponible | Apache 2.0 | HuggingFace, requiere código externo | Checkpoint etapa 1, backbone congelado, solo twig entrenado |
| VisionRL2-Qwen3.5-9B | no disponible | no disponible | no disponible | HuggingFace | Etapa 2 del mismo pipeline; media de tabla principal 80,1 |
| Qwen/Qwen3.5-9B (base) | 9B (aprox.) | no disponible | no disponible en la información proporcionada | HuggingFace, ModelScope, Microsoft Foundry | Multimodal denso de Alibaba Cloud; este checkpoint lo usa congelado |
| SD-RPN sobre Qwen3.5-4B | no disponible | no disponible | no disponible | no disponible | Variante menor del mismo método, con fila de etapa 1 publicada |
| SD-RPN sobre Gemma-4-12B-it | no disponible | no disponible | no disponible | no disponible | Variante sobre backbone distinto, con fila de etapa 1 publicada |

## Limitaciones y advertencias

- No es un modelo listo para producción: los pesos no se cargan con llamadas estándar de `AutoModel`/`AutoModelForCausalLM` para inferencia de RoI; la cabeza de mapa de calor, la puerta relativa al pico, el recorte por componentes conexos y el empalme de subimagen residen en las clases del repositorio VisionRL2.
- Uso previsto como inicialización de investigación: es un checkpoint de etapa 1 pensado para arrancar el RL de etapa 2, no un modelo final ajustado.
- Adopción prácticamente nula: 7 descargas y 0 "likes" en el momento de los datos, lo que implica poca validación externa y ausencia de reportes de la comunidad.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un MLLM hereda los riesgos del backbone, pero no hay evaluación publicada específica para este checkpoint.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y el listado de idiomas no están publicados.
- Restricciones de licencia: el checkpoint se publica bajo Apache 2.0, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen3.5-9B antes de un uso comercial.
- Caveat de evaluación: la media de 80,1 corresponde al modelo de etapa 2, no a este checkpoint, por lo que no debe atribuirse a estos pesos.
- Sin cuantizaciones publicadas: no hay GGUF ni variantes de menor precisión, lo que limita el despliegue en hardware modesto.
- Fechas del repositorio poco habituales (creado en septiembre de 2026 según los metadatos): conviene contrastar la vigencia de los artefactos enlazados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuhengSSS/SDRPN-Qwen3.5-9B
- Modelo de etapa 2 (Vision-RL²): https://huggingface.co/YuhengSSS/VisionRL2-Qwen3.5-9B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código VisionRL2: https://github.com/YuHengsss/VisionRL2
- Dataset VisionRL2-data: https://huggingface.co/datasets/YuhengSSS/VisionRL2-data
- Colección VisionRL2: https://huggingface.co/collections/YuhengSSS/visionrl2
- Página del proyecto: https://yuhengsss.github.io/VisionRL2/
- Paper Vision-RL² (arXiv 2609.19745): https://arxiv.org/abs/2609.19745
- Paper SD-RPN (arXiv 2509.16944): https://arxiv.org/abs/2509.16944
- Qwen3.5-9B en ModelScope: https://www.modelscope.cn/models/Qwen/Qwen3.5-9B
- Qwen3.5-9B en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.5-9b?publisher=hugging+face
- Ficha de referencia de Qwen3.5-9B: https://www.madebyagents.com/models/qwen3-5-9b
