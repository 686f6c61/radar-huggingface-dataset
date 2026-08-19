# ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l1

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l1` es un adaptador LoRA de la familia *Chain-of-Thought Compression Dialects*, desarrollado por Anatolii Frolov (usuario `ssurface`). Se apila sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` y está diseñado para hacer que el modelo razone a un nivel de compresión L1, es decir, con cadenas de razonamiento completas en lenguaje natural, sin comprimir. Este adaptador concreto es una **ablación** del diseño de recompensas: se entrenó con una recompensa adicional `early_solve` que premia alcanzar la respuesta pronto dentro de la cadena, en lugar de tarde, para estudiar cómo afecta esta elección al rendimiento final.

El modelo se entrenó con GRPO sobre el conjunto de entrenamiento de GSM8K, re-expresado por un modelo teacher a nivel L1, con 6913 ejemplos y una mediana de longitud de cadena de 532 caracteres. El adaptador reporta un 91,9% de exactitud en GSM8K test (n=1317, greedy, sin self-consistency), y un 11,7% en AIME (n=60, fuera de dominio). Es un trabajo de investigación publicado como material reproducible para comparar diseños de recompensa, no un modelo pensado para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso (Qwen3-4B-Instruct-2507) |
| Parametros totales | no disponible (el modelo base tiene 4B; el adaptador LoRA r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo denso de 4B parametros de la familia Qwen3. El entrenamiento se realiza en dos fases: primero se genera un modelo SFT (supervised fine-tuning) a nivel L1 (disponible como `ssurface/cot-dialect-qwen3-4b-instruct-sft-l1`), y sobre ese modelo fusionado se aplica GRPO con el `trl.GRPOTrainer` de stock sobre `transformers`, usando atención `sdpa` (sin kernels fusionados). La configuracion de GRPO incluye 8 generaciones por prompt, batch 16x1, max completion de 256 tokens, learning rate 1e-05, coeficiente KL beta=0.0, y loss tipo `dapo`. El adaptador LoRA usa r=16 y alpha=32.

La funcion de recompensa combina tres componentes: `correctness` (que pondera el paso de la solucion de oro para dar mas valor a problemas dificiles), `format` (exige una respuesta con un bloque `thinking...response` y `#### <answer>`), y `early_solve` (premia llegar a la respuesta temprano en la secuencia). El entrenamiento se realizo en una sola GPU NVIDIA A100 80GB. Una nota importante de la model card: el uso de kernels fusionados producia adaptadores con matrices `lora_B` todas cero, por lo que se verifico manualmente que `lora_B != 0` antes de publicar; 13 adaptadores que fallaron esa comprobacion fueron retenidos.

## Capacidades

- Razonamiento matematico de nivel L1: genera cadenas de pensamiento verbosas y completas en lenguaje natural, sin compresion.
- Generacion de texto en ingles, heredada del modelo base Qwen3-4B-Instruct-2507.
- No se documentan capacidades de tool calling, function calling, agentes ni multi-step reasoning mas alla del razonamiento matematico.
- No soporta vision ni audio; es un modelo de texto puro.
- Capacidad multilingue limitada al ingles (el adaptador solo se entreno con datos en ingles).

## Casos de uso

- Investigacion en compresion de cadenas de razonamiento: este adaptador sirve como punto de comparacion para estudiar como la recompensa `early_solve` afecta al rendimiento frente al modelo principal de la familia (`cot-dialect-qwen3-4b-instruct-grpo-l1`). Se puede usar para reproducir los experimentos del paper.
- Evaluacion de diseno de recompensas en RL: al ser una ablacion, es util para analizar el impacto de premiar la solucion temprana frente a tardia en problemas matematicos.
- Razonamiento matematico en entornos academicos: puede resolver problemas de GSM8K con cadenas explicativas detalladas, util para generar datasets o materiales educativos.
- Generacion de explicaciones paso a paso: su nivel L1 produce cadenas completas que pueden usarse como ground truth para entrenar modelos mas comprimidos (niveles L2-L5).
- Benchmark de robustez: al evaluarse en AIME (11,7%), sirve para medir la degradacion fuera de dominio en problemas mas dificiles.
- No se recomienda para produccion directa por ser una ablacion de investigacion, pero puede integrarse en pipelines de evaluacion de modelos de razonamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Split | n | Metrica | Valor |
|---|---|---|---|---|
| GSM8K | test | 1317 | Accuracy (exact match) | 91,9% |
| AIME | no especificado | 60 | Accuracy | 11,7% |

Configuracion de evaluacion: greedy decoding, single-turn, sin ejemplos (no exemplars), sin self-consistency. El resultado de AIME se indica como fuera de dominio y no es la metrica principal.

## Requisitos de hardware

- El modelo base Qwen3-4B-Instruct-2507 en bfloat16 requiere aproximadamente 8-9 GB de VRAM para inferencia. Con cuantizacion (por ejemplo, 4 bits) puede caber en GPUs consumer de 6 GB (RTX 3060, RTX 4060, etc.).
- El adaptador LoRA anade un coste minimo de VRAM (menos de 0,1 GB en safetensors).
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), pero para inferencia cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 4090 o RTX 3090 es comoda.
- Opciones de despliegue: al ser un adaptador PEFT, se carga con `transformers` y `peft` (ver ejemplo en la model card). Tambien puede fusionarse y exportarse a otros formatos, aunque no se documentan conversiones a GGUF ni despliegue con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El modelo base de 4B es rapido en GPUs modernas; la generacion de cadenas L1 (mediana de 532 caracteres) implica un coste de tokens mayor que los niveles comprimidos.

## Comparativa con modelos similares

No se han publicado comparativas directas en la informacion disponible. El adaptador se enmarca dentro de una familia de modelos del mismo autor con distintos niveles de compresion (L1-L5) y distintas recompensas. Como referencia, el modelo base `Qwen/Qwen3-4B-Instruct-2507` es el punto de partida; el adaptador principal de la familia (`ssurface/cot-dialect-qwen3-4b-instruct-grpo-l1`) no tiene resultados publicados en la model card de este adaptador. No se dispone de datos comparativos con otros modelos de razonamiento matematico como Llama-3.1-8B o Mistral-7B.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de palabras (GSM8K); no se garantiza rendimiento en otras tareas.
- Solo soporta ingles; el rendimiento en otros idiomas no ha sido evaluado.
- Es una ablacion de investigacion: el propio autor advierte que puede ser peor que el modelo principal de la familia y que fue entrenado para responder a una pregunta especifica sobre diseno de recompensas.
- La precision cae con la dificultad del problema, especialmente en niveles comprimidos; en AIME solo alcanza un 11,7%.
- Riesgo de alucinacion en razonamientos complejos, comun en modelos de razonamiento.
- El adaptador debe apilarse sobre el modelo SFT previo (`cot-dialect-qwen3-4b-instruct-sft-l1`), no directamente sobre el base, para reproducir los resultados. Cargarlo sobre el base sin ese paso no dara el 91,9%.
- Licencia apache-2.0 permite uso comercial, pero al ser un adaptador sobre Qwen3, se deben respetar las condiciones de la licencia del modelo base (Apache 2.0 tambien).
- Variabilidad estadistica: con n=1317, el intervalo de confianza al 95% tiene una semi-amplitud de ~2,7 puntos porcentuales; diferencias de unos pocos puntos pueden deberse al azar.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l1
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Paper citado por el autor (preprint, no publicado): "Chain-of-Thought Compression Dialects" (Frolov, 2026) — no se proporciona URL directa.
