# wyf-yfw/MiniSeek-M0.1-base

## Resumen

MiniSeek-M0.1-base es un modelo de lenguaje decoder-only con arquitectura MoE (mixture of experts) de tamaño ultra reducido, desarrollado por el autor independiente wyf-yfw. Con 150.217.216 parámetros totales (aproximadamente 150,22M, con embedding y LM head compartidos), se trata de un modelo de preentrenamiento puro que forma parte de una hoja de ruta educativa orientada a replicar la evolución arquitectónica de DeepSeek (línea Dense → línea MoE, base → chat). El propio autor aclara que el objetivo es "alinearse" con esa ruta estructural, no igualar el rendimiento de los modelos originales.

El problema que resuelve es principalmente formativo y de investigación: ofrece un MoE completo, pequeño y totalmente open source (licencia MIT) que permite estudiar el funcionamiento interno de la mezcla de expertos (1 experto compartido + 32 enrutados con top-2 por capa) sin necesidad de hardware caro. El modelo se entrena con contexto de 1024 tokens, tokenizador MiniMind de vocabulario 6400 y formato ChatML.

Su relevancia actual es limitada como producto: no ha pasado por SFT ni RLHF, así que no es apto como asistente conversacional. Su valor está en la reproducibilidad del código (repositorio GitHub público), la carga del checkpoint y su uso como base de inicialización para la versión SFT `MiniSeek-M0.1`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only MoE (8 capas, 1 experto compartido + 32 enrutados, top-2) |
| Parametros totales | 150.217.216 (~150,22M) |
| Parametros activos | no disponible (el README no indica el recuento de parámetros activados por token) |
| Longitud de contexto | 1024 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en FP32; entrenado en BF16) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, sin `lm_head` duplicado, carga con `strict=False`) |

## Arquitectura y entrenamiento

La arquitectura es un Transformer decoder-only con 8 bloques, cada uno compuesto por RMSNorm, atención causal con codificación posicional RoPE (θ=1e6), RMSNorm y un FFN de tipo MoE. La dimensión del modelo (`d_model`) es 512, con 8 cabezas de atención de 64 dimensiones cada una. Cada capa MoE contiene 1 experto compartido (shared expert) y 32 expertos enrutados, activando 2 expertos por token (`num_experts_per_tok=2`), con tamaño intermedio de 512 y activación GELU en los MLP de los expertos. El embedding (vocabulario 6400, dimensión 512) está atado (tied) con la LM head. Durante el entrenamiento se añade una pérdida auxiliar de balanceo de carga de expertos con coeficiente 0,01 (`aux_coef=0.01`), técnica estándar para evitar que el enrutador colapse en pocos expertos.

El entrenamiento se realizó con optimizador AdamW a learning rate 1e-5, con una longitud máxima de secuencia de 1024 tokens, sobre GPU NVIDIA (no se especifica el modelo concreto). El checkpoint publicado corresponde al task `20261028-000054-56bd` (`moe-pretrain-3`), con 106.586 pasos de entrenamiento y una pérdida final de aproximadamente 2,67. No se detalla la composición del corpus ni el número de tokens procesados. No hubo RLHF, DPO ni SFT: es un modelo base de next-token prediction puro.

## Capacidades

- Generacion de texto en chino e inglés mediante predicción del siguiente token (modelo base, sin alineación por instrucciones)
- Completado de texto y continuación libre a partir de un prompt
- Generación con control de temperatura y top-k (la referencia de código usa `temperature=0.8`, `top_k=50`)
- Tokenizador con plantilla ChatML incluida (`chat_template`), pensada para la posterior versión SFT
- Tokens especiales: `pad/unk=<|endoftext|>` (0), `bos=<|im_start|>` (1), `eos=<|im_end|>` (2)
- Inferencia local mediante la clase `MoELM` del repositorio GitHub (incluye una Web UI de demostración)
- No soporta tool calling, function calling, agentes, visión ni audio
- No apto para diálogo: no ha recibido SFT ni RLHF

## Casos de uso

- Estudio de arquitecturas MoE: el tamaño de 150M permite inspeccionar el enrutamiento de expertos, las pérdidas auxiliares de balanceo y el comportamiento del shared expert en hardware modesto, algo inviable con modelos MoE comerciales de decenas de miles de millones de parámetros.
- Base de inicialización para SFT propio: al ser un checkpoint preentrenado con plantilla ChatML ya definida, sirve como punto de partida para entrenar una versión chat propia, tal como hace el autor con `MiniSeek-M0.1`.
- Docencia y tutoriales: el repositorio GitHub acompaña el modelo con código de referencia (`moe.py`, `dense.py`), útil para cursos de LLMs desde cero donde se quiere mostrar la transición Dense → MoE.
- Experimentación con decodificación: al ser un modelo base pequeño, es idóneo para probar estrategias de muestreo (temperature, top-k), longitud de generación y análisis de la distribución de salida sin coste computacional relevante.
- Demostraciones locales con Web UI: el repositorio incluye una interfaz web de inferencia local para mostrar el modelo sin dependencias externas.
- Investigación en tokenización de vocabulario reducido: el tokenizador MiniMind con `vocab_size=6400` permite estudiar el impacto de vocabularios muy pequeños frente a los 32k-256k habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único indicador cuantitativo del entrenamiento es la pérdida final de ~2,67 tras 106.586 pasos, que no es comparable directamente con benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,6 GB en FP32; con overhead razonable, menos de 2 GB de VRAM o incluso CPU son suficientes. No hay cifras oficiales.
- GPU recomendadas: cualquier GPU moderna; el entrenamiento se hizo en una GPU NVIDIA no especificada. Para inferencia, una RTX 3060 o superior sobra con diferencia.
- Cabe en consumer GPU: sí, en prácticamente cualquier GPU, incluidas integradas y portátiles; también es viable en CPU.
- Opciones de despliegue: carga manual mediante `safetensors` y la clase `MoELM` del repositorio GitHub (con `transformers` solo para el tokenizador). No es compatible con `AutoModelForCausalLM` de forma plug-and-play, y no hay soporte oficial de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. La propia model card advierte que la implementación de referencia recalcula todo el contexto en cada paso (sin KV cache), lo que penaliza la latencia en generaciones largas.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | SFT/Chat |
|---|---|---|---|---|---|
| MiniSeek-M0.1-base | 150,22M | MoE decoder-only (1 shared + 32 routed, top-2) | 1024 | MIT | No (base) |
| MiniSeek-D0.1-base (línea Dense del mismo autor) | no disponible | Dense decoder-only | no disponible | no disponible | No (base) |
| Qwen2.5-0.5B | ~494M | Dense decoder-only | 32.768 (128k con RoPE extendido) | Qwen Research (uso comercial condicionado) | Versiones base e instruct disponibles |
| SmolLM2-135M (Hugging Face) | ~135M | Dense decoder-only | 2.048 | Apache 2.0 | Versiones base e instruct disponibles |

MiniSeek-M0.1-base se sitúa en la franja de los ~135-500M junto a SmolLM2-135M y Qwen2.5-0.5B, pero a diferencia de estos, carece de versión SFT publicada de forma independiente, tiene un contexto mucho menor (1024 tokens) y un vocabulario mínimo (6400 frente a ~49k-151k). Su ventaja diferencial es la arquitectura MoE y la licencia MIT sin restricciones.

## Limitaciones y advertencias

- Sin SFT ni RLHF: el modelo no sigue instrucciones; generar texto coherente tipo chat requiere usar la versión `MiniSeek-M0.1` o entrenar una propia.
- Capacidad muy limitada: con ~150M de parámetros y vocabulario de solo 6400 tokens, la model card reconoce que los errores factuales y las repeticiones son frecuentes.
- Contexto corto: 1024 tokens de entrenamiento; no hay evidencia de generalización a secuencias más largas.
- Sin KV cache en la implementación de referencia: la inferencia recalcula todo el contexto por paso, degradando la latencia.
- Carga no estándar: no funciona con `AutoModelForCausalLM`; hay que clonar el repositorio GitHub, añadir `algo/` al `PYTHONPATH` y cargar con `strict=False` por el embedding atado.
- Sesgos: no disponible; no se ha documentado ningún análisis de sesgos, pero al ser un modelo base sin alineación, puede reproducir contenido sesgado o tóxico presente en el corpus de preentrenamiento.
- Riesgo de alucinacion: alto, propio de un modelo base pequeño sin alineación.
- Licencia: MIT, sin restricciones para uso comercial, aunque el modelo no está pensado para producción.
- Comunidad mínima: 30 descargas y 1 like en el momento de la ficha; escaso soporte y validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wyf-yfw/MiniSeek-M0.1-base
- Repositorio GitHub (código y recetas de entrenamiento): https://github.com/wyf-yfw/miniseek
- Versión SFT/chat: https://huggingface.co/wyf-yfw/MiniSeek-M0.1
- Predecesor Dense: https://huggingface.co/wyf-yfw/MiniSeek-D0.1-base
- Paper: no disponible
- Demo online: no disponible
