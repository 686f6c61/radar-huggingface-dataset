# ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed2-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-base-seed2-l5` es un adaptador LoRA desarrollado por ssurface que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` de AllenAI para que genere cadenas de pensamiento (chain-of-thought) extremadamente comprimidas, denominadas "dialecto L5" (expresión pura). El adaptador se entrena mediante GRPO sobre el modelo base fusionado con un ajuste fino supervisado (SFT) previo, y está pensado como una ablación para estudiar el impacto del diseño de recompensas en la compresión del razonamiento.

El modelo base Olmo-3-7B-Think es un transformer decoder-only de 7 mil millones de parámetros, preentrenado en el corpus Dolma 3 y postentrenado para razonamiento explícito. Este adaptador reduce la cadena de pensamiento a una única expresión aritmética (por ejemplo, `18/3*2=12`), logrando una mediana de 16 caracteres frente a los 532 del nivel L1, una compresión de 33 veces. En la evaluación GSM8K (test, n=1317) alcanza un 78% de precisión exacta, lo que lo sitúa como una alternativa interesante para escenarios donde el coste de generación de tokens de razonamiento debe minimizarse.

La relevancia de este modelo radica en su contribución a la investigación sobre compresión de cadenas de pensamiento y diseño de recompensas en RLHF/GRPO, más que como un producto listo para producción. Al ser una ablación, se publica para permitir reproducir comparaciones de recompensas, no como modelo principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Olmo-3-7B-Think) |
| Parametros totales | 7.000 millones (modelo base) + adaptador LoRA (~0.2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bf16; el base puede cuantizarse con GPTQ/AWQ/GGUF) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en LoRA con r=16 y alpha=32, aplicado sobre el modelo fusionado `merged_olmo/l5` (resultado de un SFT previo al nivel L5). El entrenamiento utiliza `trl.GRPOTrainer` con atención `sdpa` (sin kernels fusionados) y una recompensa compuesta por dos componentes: `correctness` (basada en el número de pasos de la solución dorada, ponderando problemas más difíciles) y `format` (exige una respuesta con un bloque `thinking... response` y `#### <answer>`). Se usan 8 generaciones por prompt, batch de 32 con acumulación de 2, y una tasa de aprendizaje de 1e-05 con coeficiente KL de 0.01.

El dataset de entrenamiento consiste en 6993 ejemplos de GSM8K train reexpresados al nivel L5 por un modelo profesor, con una mediana de cadena de 16 caracteres. El entrenamiento se realizó en una sola NVIDIA A100 80GB. Es importante destacar que el adaptador debe cargarse sobre el modelo SFT de nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base, para reproducir los resultados declarados.

## Capacidades

- Razonamiento matematico: resuelve problemas de palabras aritmeticos (GSM8K) con cadenas de pensamiento extremadamente comprimidas (una sola expresion).
- Generacion de texto: el modelo base conserva la capacidad de generar texto general, aunque el adaptador esta especializado en el formato de razonamiento comprimido.
- Sin soporte de tool calling ni function calling: no se ha entrenado para ello.
- Sin capacidades multimodales (vision, audio, etc.).
- Multilingue: limitado al ingles, segun la configuracion del modelo base y el dataset.
- Modo de pensamiento visible: el adaptador fuerza una cadena de pensamiento explicita pero muy corta, lo que permite inspeccionar el razonamiento en una sola linea.

## Casos de uso

- Investigacion sobre compresion de cadenas de pensamiento: el adaptador permite estudiar como afecta la reduccion drastica de tokens de razonamiento a la precision en tareas matematicas, comparando con niveles L1-L4.
- Ablacion de diseno de recompensas: al ser una variante con recompensa `base-seed2`, se puede utilizar para reproducir experimentos de comparacion de recompensas en GRPO, como se describe en el paper asociado.
- Evaluacion de coste-latencia en inferencia: al reducir la longitud de la cadena de pensamiento, se puede medir el ahorro en tokens generados y su impacto en el throughput, util para despliegues con restricciones de presupuesto.
- Generacion de explicaciones concisas: en aplicaciones educativas donde se requiere una solucion paso a paso pero con minima verbosidad, este modelo puede producir respuestas directas y comprobables.
- Benchmark de robustez en razonamiento comprimido: sirve como punto de referencia para evaluar si otros modelos pueden mantener precision con cadenas de pensamiento extremadamente cortas.
- Pruebas de integracion con frameworks PEFT: el adaptador demuestra el flujo de carga secuencial de dos adaptadores (SFT + GRPO) sobre un modelo base, util para pipelines de entrenamiento y despliegue.

## Benchmarks y rendimiento

El unico resultado declarado por el autor es la precision exacta en GSM8K test (n=1317), con decodificacion greedy, una sola vuelta, sin ejemplos ni self-consistency.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test) | Accuracy (exact match) | 78.0% |

No se dispone de comparaciones con otros modelos en la informacion proporcionada. El autor indica que la precision cae con la dificultad del problema y que diferencias de unos pocos puntos porcentuales son estadisticamente no significativas (intervalo de confianza del 95% de ~2.7 pp para n=1317).

## Requisitos de hardware

- El adaptador LoRA es ligero (~0.2 GB), pero requiere cargar el modelo base de 7B parametros en memoria.
- Para inferencia en bf16, se estima un uso de VRAM de aproximadamente 14-16 GB (modelo base + adaptador), lo que cabe en GPUs como RTX 4080/4090, A100 40GB, etc.
- Si se cuantiza el modelo base (por ejemplo, a 4 bits con bitsandbytes), la VRAM puede reducirse a ~4-6 GB, permitiendo ejecucion en GPUs consumer de gama media (RTX 3060, etc.).
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con `transformers` y `peft`, y tambien con vLLM (si se fusiona previamente) o llama.cpp (si se convierte a GGUF, aunque el adaptador no esta disenado para ello).
- Latencia: no hay datos publicados, pero la compresion de la cadena de pensamiento reduce el numero de tokens generados, lo que disminuye la latencia total en comparacion con el modelo base sin comprimir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia | Formato |
|---|---|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-base-seed2-l5 | 7B + LoRA | no disponible | 78.0% | Apache 2.0 | PEFT/safetensors |
| allenai/Olmo-3-7B-Think (base) | 7B | no disponible | no publicado | Apache 2.0 | safetensors |
| ssurface/cot-dialect-olmo3-7b-think-l5 (modelo principal L5) | 7B + LoRA | no disponible | no publicado (probablemente superior) | Apache 2.0 | PEFT/safetensors |

No se dispone de datos de otros modelos de razonamiento de 7B (como Qwen2.5-7B-Instruct o Llama-3.1-8B-Instruct) en la informacion proporcionada. La comparativa se limita a la familia del propio autor.

## Limitaciones y advertencias

- Entrenado exclusivamente en problemas de matematicas de palabras (GSM8K); no generaliza a otros dominios de razonamiento.
- La precision disminuye notablemente con la dificultad del problema, especialmente en los niveles de compresion mas agresivos (L5).
- Es una ablacion de investigacion, no un modelo de produccion; puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`).
- El adaptador debe cargarse sobre el modelo SFT de nivel L5, no directamente sobre el base, para reproducir los resultados; cargarlo sobre el base dara resultados diferentes.
- Riesgo de alucinacion en respuestas no matematicas, dado el entrenamiento limitado.
- Solo soporta ingles; no hay garantias de rendimiento en otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero al ser un adaptador sobre un modelo base con su propia licencia (tambien Apache 2.0), no hay restricciones adicionales conocidas.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-base-seed2-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Pagina del modelo en ThinkLLM: https://thinkllm.dev/models/olmo-3-7b-think
- Ficha en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Version de unsloth del base: https://huggingface.co/unsloth/Olmo-3-7B-Think
- Referencia en LLMIndex: https://llmindex.net/models/olmo-3-7b-think
