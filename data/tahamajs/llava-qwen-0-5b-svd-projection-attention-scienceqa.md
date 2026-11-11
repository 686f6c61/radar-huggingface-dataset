# tahamajs/llava-qwen-0.5b-svd-projection-attention-scienceqa

## Resumen

`llava-qwen-0.5b-svd-projection-attention-scienceqa` es un checkpoint experimental de visión-lenguaje publicado por el usuario tahamajs dentro del proyecto NeuralOps. No es un modelo entrenado desde cero, sino el resultado de una cirugía de atención sobre el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`: se sustituye la atención multi-cabeza estándar de 18 de las 24 capas del decodificador Qwen2 por una variante denominada `SVDProjectionAttention`, que factoriza las proyecciones lineales mediante descomposición en valores singulares. El objetivo es la compresión de pesos y la reducción del coste computacional manteniendo parte de la capacidad del modelo original.

El checkpoint empaqueta únicamente los pesos modificados (atención y layernorms del decodificador), no el modelo completo: el artefacto `attention_weights.safetensors` ocupa 46,36 MB frente a los 1,66 GB del base en FP16, una reducción del 97,3 %. Sobre esa base quirúrgica se aplicó destilación de conocimiento en dos etapas usando ScienceQA (subconjunto con imágenes, validación) como conjunto de evaluación y referencia.

Su relevancia es fundamentalmente metodológica: sirve como ejemplo reproducible de sustitución de operadores de atención con fine-tuning ligero (303 pasos, 120 segundos en una RTX 3090) y de cómo cuantificar la pérdida de rendimiento asociada. No está pensado como modelo de producción, sino como artefacto de investigación sobre compresión de VLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer VLM tipo LLaVA: torre visual SigLIP congelada (27 capas) + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), con atención sustituida por SVDProjectionAttention en 18/24 capas |
| Parametros totales | No disponible (el modelo base LLaVA-Interleave-Qwen-0.5B ronda los 0,5B; el checkpoint publicado solo contiene 48.617.064 bytes de pesos de atención) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16 safetensors; el autor menciona que la precisión se gestiona vía autocast) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, `weights_format=attention_only_fp16`), más JSON de configuración y manifiesto quirúrgico |

## Arquitectura y entrenamiento

La arquitectura parte de LLaVA-Interleave-Qwen-0.5B: una torre visual SigLIP congelada de 27 capas, un proyector MLP de dos capas que alinea los embeddings visuales con el espacio del lenguaje y un decodificador Qwen2 de 24 capas con dimensión oculta 1024, 16 cabezas y dimensión por cabeza 64. La intervención quirúrgica reemplaza el módulo de self-attention en 18 de las 24 capas (esquema `hybrid_3_1`), dejando intactas 6 capas "ancla" cuadráticas en los índices [3, 7, 11, 15, 19, 23], así como los MLP, embeddings, proyector y torre visual. La variante `SVDProjectionAttention` factoriza las proyecciones lineales de atención mediante SVD y usa SDPA con soporte nativo de GQA cuando es posible; el autor documenta correcciones respecto a una versión previa (fallback Triton para CPU/MPS, gestión correcta de `is_cross`, errores explícitos ante desajustes de forma, eliminación del casteo forzado a FP16).

El entrenamiento consistió en destilación de conocimiento en dos etapas (137 + 166 pasos, 303 en total) sobre ScienceQA, ejecutada en una NVIDIA RTX 3090 de 24 GB con un pico de VRAM de 14.998 MB y una duración total de 120,1 segundos. Se guardaron 336 tensores correspondientes a las atenciones modificadas y las layernorms del decodificador. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset más allá de ScienceQA ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto e imagen-a-texto conversacional (pipeline `image-text-to-text`).
- Respuesta a preguntas visuales sobre imágenes, orientada a contenido STEM (ciencia, tecnología, ingeniería y matemáticas) por el dominio de ScienceQA.
- Razonamiento multimodal básico: el modelo recibe imagen y pregunta y produce una respuesta textual.
- Soporte de plantilla de chat (`chat_template.json` incluido), lo que permite formatear turnos conversacionales.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking, audio ni otras modalidades distintas de imagen y texto.

## Casos de uso

- Investigación en compresión de modelos: el checkpoint sirve para estudiar el impacto de sustituir la atención estándar por proyecciones SVD factorizadas en un VLM pequeño, comparando la precisión pre y post destilación (30,00 % → 43,75 %) sobre el mismo conjunto de validación.
- Reproducción de experimentos de cirugía de atención: al incluir `surgical_manifest.json` con el esquema `neuralops.surgery/v2` y el recuento de tensores guardados (336), permite auditar exactamente qué componentes se modificaron y replicar el procedimiento sobre otros modelos base.
- Docencia y formación en destilación de conocimiento: el par de métricas (teacher 63,75 %, student final 43,75 %) y la telemetría de entrenamiento (303 pasos, 120 s, 14.998 MB de VRAM) ofrecen un caso concreto y de bajo coste para explicar KD en modelos multimodales.
- Prototipado rápido de asistentes de preguntas visuales sobre material científico: con un footprint de 46 MB de pesos de atención y ejecución viable en una GPU de consumo, permite montar demos de VQA educativa sin infraestructura pesada.
- Evaluación comparativa de operadores de atención: el zoo NeuralOps incluye variantes alternativas del mismo base, por lo que este checkpoint puede usarse como referencia cuantitativa en estudios de ablación entre operadores.
- Integración en pipelines de investigación con `neuralops.hub`: la API pública del proyecto permite cargar el checkpoint y evaluarlo junto al modelo base para medir la degradación introducida por la compresión.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Teacher baseline | Pre-KD / zero-shot | Post-KD / final | Delta |
|---|---:|---:|---:|---:|
| Accuracy (%) en ScienceQA (subconjunto STEM con imagen, validación) | 63,75 | 30,00 | 43,75 | +13,75 |
| Perplexity en ScienceQA (subconjunto STEM con imagen, validación) | 2,45 | 5,22 | 3,06 | -2,16 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo base LLaVA-Interleave-Qwen-0.5B es de tamaño reducido y el checkpoint quirúrgico solo añade 46,36 MB de pesos de atención, por lo que la inferencia completa requiere cargar además el modelo base.
- GPU de entrenamiento utilizada: NVIDIA GeForce RTX 3090 (24 GB), con pico de 14.998 MB durante la destilación.
- GPU recomendadas: cualquier GPU con al menos 24 GB para reproducir el entrenamiento; para inferencia del base de 0,5B, GPUs de consumo como RTX 3060/4060 en adelante son suficientes según el tamaño efectivo del modelo completo.
- Cabe en GPU de consumo: sí, tanto el entrenamiento (RTX 3090) como la inferencia del modelo base.
- Opciones de despliegue: la librería declarada es `neuralops` (API `neuralops.hub`); no se documenta compatibilidad directa con vLLM, llama.cpp, Ollama o TGI, y al tratarse de pesos de atención parciales requiere cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y aplicar el manifiesto quirúrgico.
- Latencia y throughput: no disponibles; el único dato temporal es la duración del entrenamiento (120,1 s para 303 pasos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, subconjunto STEM con imagen) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tahamajs/llava-qwen-0.5b-svd-projection-attention-scienceqa` (este) | ~0,5B (base) | No disponible | 43,75 % acc / 3,06 PPL | MIT | Hugging Face, pesos parciales |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (teacher) | ~0,5B | No disponible | 63,75 % acc / 2,45 PPL (según el autor) | No disponible en la informacion proporcionada | Hugging Face |
| Otras variantes del zoo NeuralOps sobre el mismo base | ~0,5B | No disponible | No disponible | MIT (según el proyecto) | Hugging Face |

No se dispone de datos de benchmarks de alternativas externas (por ejemplo, otros VLM de ~0,5B) en la información proporcionada, por lo que la comparación se limita al modelo base y a las variantes del mismo zoo.

## Limitaciones y advertencias

- Degradación significativa respecto al teacher: la precisión cae de 63,75 % a 43,75 % y la perplejidad sube de 2,45 a 3,06, incluso tras la destilación; el checkpoint pre-KD queda en 30,00 % de accuracy.
- El checkpoint no es un modelo autónomo: contiene solo los pesos de atención y layernorms modificados (336 tensores, 46,36 MB); requiere el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` y el manifiesto quirúrgico para reconstruirse.
- Sesgos conocidos: no documentados en la información disponible; al derivar de un modelo entrenado principalmente en inglés y evaluado solo en ScienceQA, es esperable un sesgo hacia el dominio STEM y hacia el inglés.
- Riesgo de alucinación: no cuantificado por el autor; la perplejidad de 3,06 en el conjunto de evaluación sugiere una calibración inferior a la del teacher.
- Limitación idiomática: solo se declara soporte de inglés (`en`).
- Evaluación limitada: los resultados provienen de un único conjunto (ScienceQA, subconjunto con imagen, split de validación) y están marcados como no verificados (`verified: false`); no hay benchmarks generales ni evaluación en otros dominios.
- Licencia MIT para el artefacto, pero conviene verificar la licencia del modelo base y de los datos de ScienceQA antes de un uso comercial.
- Uso en producción desaconsejado: es un artefacto de investigación sobre compresión, no un modelo afinado para tareas generales; la pérdida de precisión y la dependencia del base lo hacen inadecuado para despliegues reales sin validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-svd-projection-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `SVDProjectionAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/svd/svd_projection_attention.py
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
