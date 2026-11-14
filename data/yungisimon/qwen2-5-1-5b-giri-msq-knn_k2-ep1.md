# yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep1

## Resumen

`yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep1` es un ajuste fino completo (full fine-tuning) del modelo `Qwen/Qwen2.5-1.5B-Instruct` de Alibaba, publicado por el usuario yungisimon. El modelo se ha entrenado como **memory model**: un modelo especializado en retener y recuperar información a partir de pares sintéticos de pregunta-respuesta generados sobre el corpus MuSiQue, un conjunto de preguntas multihop que requiere razonamiento sobre múltiples documentos. El objetivo es que el modelo funcione como memoria externa consultable dentro de un pipeline de agentes o de recuperación aumentada.

El checkpoint publicado corresponde a la **época 1 de 3** de un entrenamiento planificado más largo, por lo que debe considerarse una instantánea intermedia y no un modelo final. La metodología de construcción del dataset se etiqueta como `knn_k2` (kNN con k=2 y deduplicación por documento), y el conjunto de entrenamiento contiene 634.327 ejemplos generados a partir de un subconjunto de 1.000 preguntas de MuSiQue.

Con 1.543.714.304 parámetros, licencia Apache 2.0 y pesos en bf16 safetensors, es un modelo pequeño y ligero pensado para experimentación en investigación sobre memorización, recuperación de conocimiento y evaluación de alucinaciones en modelos de lenguaje de escala reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.096 tokens (longitud máxima de secuencia usada en entrenamiento); contexto nativo del modelo base no disponible en la información proporcionada |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2, un transformer decoder-only con atención causal estándar (sin mezcla de expertos), del que se ha reentrenado el 100% de los parámetros (1.543.714.304, es decir, full fine-tuning) mediante FSDP sobre 8 GPUs AMD Instinct MI325X. El entrenamiento usó precisión bf16, gradient checkpointing, pérdida calculada únicamente sobre los tokens del asistente, learning rate constante de 2e-05 con warmup del 5%, weight decay de 0,01, grad norm máximo de 1,0 y batch efectivo de 256 (32 por dispositivo, 1 paso de acumulación, 8 GPUs). La longitud máxima de secuencia fue de 8.096 tokens.

El dataset de entrenamiento es un conjunto sintético de 634.327 pares de pregunta-respuesta derivados de MuSiQue (`msq_subset1000_numsamplingepochs1_knn2_doc_dedup_crossdoc_entity_combination_v3.json`), construido con una estrategia de agrupación kNN con k=2, deduplicación por documento y combinación de entidades entre documentos. El objetivo declarado es convertir el modelo en un *memory model*: un componente que memorice hechos y relaciones del corpus y los recupere ante preguntas multihop. No se documentan fases de RLHF o DPO adicionales; el ajuste se realiza sobre el modelo Instruct ya alineado de Qwen. El entrenamiento completo (3 épocas) requirió 0,66 horas de reloj (5,2 GPU-horas), y este checkpoint corresponde a la época 1.

## Capacidades

- Generación de texto conversacional en formato chat, usando la plantilla de chat de Qwen.
- Respuesta a preguntas de tipo multihop sobre contenido derivado de MuSiQue, orientada a la recuperación de hechos memorizados durante el ajuste.
- Función como *memory model* dentro de pipelines de agentes: el modelo se ha entrenado para actuar como almacén consultable de conocimiento, no solo como generador genérico.
- Razonamiento básico y concatenación de entidades entre documentos, derivado del proceso de construcción del dataset (cross-doc entity combination).
- Soporte de tool calling y function calling: heredado del modelo base Instruct; no se documenta un entrenamiento específico adicional en esta ficha.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- **Memoria externa en agentes de recuperación**: el modelo puede actuar como capa de memoria que responde consultas sobre un corpus previamente memorizado (MuSiQue), integrándose en un agente que delega la recuperación de hechos a este componente en lugar de a un índice vectorial.
- **Investigación sobre memorización y alucinación**: al ser un ajuste controlado sobre un dataset sintético conocido, permite medir cuánto memoriza el modelo, qué olvida y cómo alucina al recuperar hechos, con trazabilidad completa del conjunto de entrenamiento.
- **Evaluación de estrategias de aumento de datos sintéticos**: el pipeline `knn_k2` con deduplicación y combinación de entidades es reproducible, lo que permite comparar esta variante con otras agrupaciones (k distinto, sin deduplicación) en experimentos académicos.
- **Prototipado de sistemas de QA multihop**: con 1.500 millones de parámetros y pesos bf16, se puede desplegar en una sola GPU consumer de gama alta para probar arquitecturas de QA sobre preguntas que requieren combinar información de varios documentos.
- **Generación de datos sintéticos para entrenamiento**: el modelo puede usarse para producir pares pregunta-respuesta adicionales sobre el dominio MuSiQue, que luego se filtren y se incorporen a otros pipelines de ajuste.
- **Base para ajustes posteriores**: al ser un checkpoint intermedio con licencia Apache 2.0, sirve como punto de partida para fine-tunes específicos de dominio o para continuar el entrenamiento hasta la época 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada en bf16**: aproximadamente 3,1 GB para los pesos (1.543.714.304 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para inferencia con contexto moderado.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 1,6 GB para pesos; en 4 bits, alrededor de 0,8 GB (estimaciones teóricas, no verificadas en la información proporcionada).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100 o AMD Instinct MI325X. Cabe en GPUs consumer de gama media-alta.
- **Opciones de despliegue**: `transformers` con `AutoModelForCausalLM.from_pretrained` (formato nativo), vLLM, TGI (el tag `text-generation-inference` y `endpoints_compatible` está presente en el repo), llama.cpp y Ollama previa conversión a GGUF (no se proporcionan GGUF en el repositorio).
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep1 | 1.543.714.304 | 8.096 (entrenamiento) | apache-2.0 | Hugging Face | Checkpoint época 1 de 3, memory model sobre MuSiQue |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.500 millones | no disponible en esta ficha | apache-2.0 | Hugging Face | Modelo base; alineado para instrucciones generales |
| Qwen/Qwen2.5-1.5B | ~1.500 millones | no disponible en esta ficha | apache-2.0 | Hugging Face | Modelo base preentrenado, sin alineación |
| Modelos memory-model de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativas publicadas en la información proporcionada |

## Limitaciones y advertencias

- **Checkpoint intermedio**: este modelo corresponde a la época 1 de 3; no es el resultado final del entrenamiento y su rendimiento puede ser inferior al del checkpoint final.
- **Especialización estrecha**: el ajuste está orientado a memorizar y recuperar el corpus sintético de MuSiQue; su comportamiento fuera de ese dominio no está caracterizado y puede degradarse respecto al modelo base.
- **Riesgo de alucinación**: al ser un memory model entrenado sobre pares sintéticos, puede generar respuestas plausibles pero incorrectas al recuperar hechos, especialmente en preguntas que requieran combinar información no vista durante el entrenamiento.
- **Sesgos**: no se documenta ninguna evaluación de sesgos; al derivar del modelo base Qwen2.5, puede heredar sesgos presentes en sus datos de preentrenamiento.
- **Idiomas**: no se especifican los idiomas soportados; el dataset de entrenamiento está en inglés (MuSiQue), por lo que el rendimiento en castellano no está garantizado.
- **Contexto limitado en entrenamiento**: la longitud máxima de secuencia usada fue de 8.096 tokens; secuencias más largas pueden degradar la calidad de la recuperación.
- **Licencia**: Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y con 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- **Producción**: no se han publicado evaluaciones formales, por lo que no se recomienda su uso en producción sin una validación propia sobre el dominio objetivo.

## Enlaces

- [Hugging Face: yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep1](https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-knn_k2-ep1)
- [Modelo base: Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [MuSiQue: Multihop Questions via Single-hop Question Composition (paper)](https://arxiv.org/abs/2108.00573)
- [Repositorio oficial de Qwen2.5](https://github.com/QwenLM/Qwen2.5)
