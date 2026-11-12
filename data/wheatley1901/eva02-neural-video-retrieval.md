# wheatley1901/eva02-neural-video-retrieval

## Resumen

EVA-02 Neural Video Retrieval (`eva02_curated_v2`) es un checkpoint de EVA-02-CLIP-L-14-336 afinado por el usuario wheatley1901 para recuperación de fotogramas clave de vídeo (video keyframe retrieval) de grano fino. El modelo parte del backbone `timm/eva02_large_patch14_clip_336.merged2b_s6b_b61k` y aplica una estrategia de Locked-Image Text Tuning (LiT): congela los 304,43 M de pesos de la torre de visión y entrena únicamente los 123,65 M del codificador de texto junto con el parámetro `logit_scale`. El resultado es un modelo multimodal que mantiene intacta la representación visual del CLIP original pero adapta el espacio de texto para consultas descriptivas más específicas.

El objetivo declarado es la búsqueda cruzada imagen-texto sobre fotogramas de vídeo, cubriendo posturas corporales, ángulos de cámara, detalles de vestuario y búsqueda cross-domain entre ilustración 2D y material real. El entrenamiento emplea Multi-Instance Learning (MIL) con pérdida contrastiva InfoNCE sobre contact sheets de 3×3 fotogramas clave, con balanceo de posturas por frecuencia inversa amortiguada y síntesis dinámica de prompts sobre 147.412 filas de vídeos web curados y 4.652 filas de ilustraciones de Danbooru2023.

El modelo tiene un tamaño de repositorio de 1,7 GB, licencia MIT y está publicado sin pipeline declarado en Hugging Face. Su relevancia radica en que demuestra una receta de bajo coste (solo se entrena el 28,9 % de los parámetros) para especializar un CLIP grande en una tarea de retrieval vertical concreta, con mejoras medibles sobre el baseline en Recall@1 y Recall@5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer ViT-L/14 (EVA-02-CLIP) con torre de texto CLIP; patch size 14, resolución 336 |
| Parámetros totales | 428,08 M (304,43 M visión congelados + 123,65 M texto + logit_scale entrenables) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de retrieval, no generativo; entrada de texto de longitud fija según tokenizer CLIP) |
| Tipos de cuantización | no disponible (checkpoint en punto flotante; compatible con half/FP16 según el código de uso) |
| Idiomas soportados | no disponible (el texto se procesa con el tokenizer CLIP del backbone) |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch state_dict, `eva02_curated_v2.pt`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es EVA-02-CLIP-L-14-336, un ViT-L/14 con resolución de entrada 336×336 y patch size 14, acoplado a un codificador de texto estilo CLIP. El fine-tuning sigue el esquema LiT: la torre de visión permanece congelada en el baseline original de Hugging Face (304,43 M de parámetros) y solo se actualizan el codificador de texto y `logit_scale` (123,65 M). Esto preserva las representaciones visuales preentrenadas y reduce el coste de entrenamiento y el riesgo de sobreajuste en el dominio objetivo.

El entrenamiento usa Multi-Instance Learning contrastivo con pérdida InfoNCE sobre contact sheets de 3×3 fotogramas clave: cada vídeo se representa como una bolsa de nueve instancias visuales y la supervisión es a nivel de bolsa frente al texto asociado. Se aplica un balanceo de posturas mediante frecuencia inversa amortiguada y síntesis dinámica de prompts. El corpus combina 147.412 filas de base de datos de vídeos web curados y 4.652 filas de ilustraciones de Danbooru2023. No se especifican en la información disponible el número total de tokens, la composición detallada del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Recuperación texto-a-imagen y imagen-a-texto sobre fotogramas clave de vídeo (video keyframe retrieval).
- Búsqueda de grano fino sobre posturas corporales, ángulos de cámara y detalles de vestuario o atuendo.
- Búsqueda cross-domain entre ilustración 2D (Danbooru) y material real.
- Extracción de embeddings multimodales (visión y texto) para indexación y búsqueda vectorial.
- Procesamiento de contact sheets de 3×3 fotogramas como unidad de instancia múltiple.
- No dispone de generación de texto, tool calling, capacidades de agente ni razonamiento multi-step: es un modelo de representación, no generativo.
- Capacidades multilingües: no disponible (depende del tokenizer CLIP del backbone).

## Casos de uso

- Búsqueda semántica en archivos audiovisuales: indexar fotogramas clave de un catálogo de vídeo y permitir consultas en lenguaje natural sobre posturas, planos o vestuario, aprovechando el entrenamiento específico en recuperación de keyframes.
- Moderación y catalogación de contenido: localizar segmentos con determinadas características visuales (ángulos, atuendo) para revisión humana, dado el tag `not-for-all-audiences` del repositorio.
- Sistemas de recomendación visual: generar embeddings de fotogramas y emparejarlos con descripciones de usuario para sugerir clips similares.
- Búsqueda cross-domain ilustración-real: usar el modelo para encontrar material real a partir de una ilustración 2D o viceversa, gracias al entrenamiento con Danbooru2023.
- Etiquetado automático de metadatos: predecir descripciones textuales de fotogramas para enriquecer pipelines de MAM (Media Asset Management).
- Detección de duplicados y near-duplicates en vídeo: comparar embeddings de keyframes para agrupar contenido visualmente similar.
- Prototipado de motores de búsqueda: integrar el checkpoint en el motor de búsqueda del repositorio del autor (`scrape/web_viewer.py`) para validar flujos de retrieval antes de invertir en modelos mayores.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split `val` (n=1.200):

| Métrica | Baseline EVA-02 | `eva02_curated_v2.pt` (época 1) |
|---|---|---|
| Validation loss | 1,428 | 1,054 |
| Recall@1 | 12,4 % | 20,67 % |
| Recall@5 | 28,1 % | 37,83 % |

No se han publicado resultados en MMLU, HumanEval, GSM8K ni otros benchmarks estándar de LLM, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en FP16 para los pesos del checkpoint; en FP32, alrededor de 3,4 GB. El uso del modelo en `half()` está documentado en la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM en FP16; una RTX 3060, RTX 4060 o superior es suficiente. Para indexación a gran escala, se recomienda A100 o H100 por throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más.
- Opciones de despliegue: `open_clip` con `create_model_and_transforms` (documentado), PyTorch nativo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de retrieval).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Recall@1 (val propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `eva02-neural-video-retrieval` | 428,08 M (123,65 M entrenables) | 336×336 imagen; texto CLIP | 20,67 % | MIT | Hugging Face |
| EVA-02-CLIP-L-14-336 (baseline) | 428,08 M | 336×336 imagen; texto CLIP | 12,4 % | no disponible en la información | Hugging Face / timm |
| CLIP ViT-L/14 (OpenAI) | ~428 M | 224×224 imagen; texto CLIP | no disponible | MIT (código) / uso sujeto a términos | Hugging Face |

La comparación con CLIP ViT-L/14 de OpenAI se ofrece como referencia de categoría; no se dispone de resultados comparables en el mismo split de validación. No se han encontrado otros modelos de retrieval de vídeo de grano fino con métricas directamente comparables en la información proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinación en la descripción: al ser un modelo de retrieval, puede devolver resultados visualmente plausibles pero incorrectos; las métricas Recall@1 del 20,67 % indican que la mayoría de consultas no aciertan en el primer resultado.
- Sesgos del dataset: el entrenamiento combina vídeos web curados y Danbooru2023, lo que puede introducir sesgos de dominio, estilo y representación demográfica.
- El tag `not-for-all-audiences` sugiere que parte del material de entrenamiento puede ser sensible; conviene auditar los resultados en producción.
- Solo se ha publicado el resultado de la época 1; no hay información sobre convergencia, sobreajuste ni estabilidad del entrenamiento.
- Limitaciones de idioma: no se especifican idiomas soportados; el tokenizer CLIP del backbone puede degradar el rendimiento en castellano.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo base (`timm/eva02_large_patch14_clip_336.merged2b_s6b_b61k`) puede tener condiciones adicionales que deben verificarse.
- Sin pipeline declarado en Hugging Face ni métricas de latencia/throughput publicadas; la integración en producción requiere trabajo adicional de ingeniería.

## Enlaces

- Hugging Face: https://huggingface.co/wheatley1901/eva02-neural-video-retrieval
- Repositorio de código y motor de búsqueda: https://github.com/qn06142/eva02-neural-video-retrieval
- Backbone: https://huggingface.co/timm/eva02_large_patch14_clip_336.merged2b_s6b_b61k
- Paper EVA-02: no disponible en la información proporcionada
- Paper OpenCLIP: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
