# ssurface/cot-dialect-qwen3-4b-instruct-grpo-l3

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-l3` es un adaptador LoRA publicado por el usuario ssurface que modifica el comportamiento de razonamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para que genere cadenas de pensamiento (chain-of-thought) comprimidas a un nivel denominado L3, caracterizado por una asignación simbólica por línea (por ejemplo, `p = 40`, `T = p * w = 320`). El objetivo es reducir la longitud de las cadenas de razonamiento sin sacrificar la precisión en tareas de razonamiento matemático, un área activa de investigación en eficiencia de inferencia.

El adaptador se entrena mediante GRPO (Group Relative Policy Optimization) sobre un modelo previamente ajustado con SFT en el mismo nivel de compresión, utilizando el conjunto de datos GSM8K. Según los datos publicados, alcanza un 85,9 % de exactitud en el test de GSM8K, lo que supone una mejora de +4,1 puntos porcentuales respecto al modelo SFT previo (81,8 %). El repositorio tiene un tamaño de 0,1 GB, lo que refleja su naturaleza de adaptador ligero, y se distribuye bajo licencia Apache-2.0. Está pensado para investigadores que estudian la compresión de razonamiento y la eficiencia de modelos de lenguaje, no como un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; repo de 0,1 GB) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parametros. La capa LoRA utiliza r=16 y alpha=32. El proceso de entrenamiento consta de dos etapas: primero se genera un modelo SFT fusionado a partir de datos de GSM8K reexpresados por un modelo profesor a nivel L3 (6970 ejemplos, con una longitud mediana de cadena de 90 caracteres dentro de `thinking`), y posteriormente se aplica GRPO sobre ese modelo fusionado. El entrenamiento GRPO usa el `trl.GRPOTrainer` con atención `sdpa`, una recompensa combinada de `correctness` (que pondera segun el numero de pasos de la solucion dorada) y `format` (exigencia de un bloque `thinking... response` seguido de `#### <answer>`), y una funcion de perdida tipo dapo con KL coefficient 0.0. Se generan 8 muestras por prompt, con un maximo de 256 tokens de completacion, y se entrena con 1x NVIDIA A100 80GB.

Un detalle tecnico relevante: el autor advierte que el uso de kernels fusionados producia adaptadores con matrices `lora_B` todas a cero, por lo que se opto por la atencion `sdpa` estandar. Todos los adaptadores publicados fueron verificados para que `lora_B != 0`; 13 que fallaron esa comprobacion fueron descartados.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel L3 (asignaciones simbolicas por linea).
- Generacion de texto en ingles, limitada al dominio de problemas matematicos de tipo word problem.
- Soporte de formato de respuesta estructurado: `thinking... response` y respuesta final con `#### <answer>`.
- No soporta tool calling, ni vision, ni audio, ni capacidades agente.
- No es multilingue (solo ingles).
- No incluye modo thinking explicito; el razonamiento comprimido es el comportamiento inducido por el adaptador.

## Casos de uso

- Investigacion en compresion de chain-of-thought: permite estudiar como afecta la reduccion de longitud de las cadenas de razonamiento a la precision en tareas de matematicas, comparando niveles L1 a L5.
- Evaluacion de eficiencia en inferencia: al generar cadenas mas cortas (90 caracteres de mediana frente a 532 en L1), reduce el numero de tokens de salida y, por tanto, la latencia y el coste de inferencia en despliegues donde se requiere razonamiento simbolico.
- Benchmarking de tecnicas de RL (GRPO) sobre modelos pequenos: el adaptador sirve como caso de estudio para validar pipelines de entrenamiento con recompensas de correccion y formato en modelos de 4B.
- Generacion de explicaciones paso a paso en notacion simbolica: util en sistemas educativos que necesiten mostrar resoluciones concisas y estructuradas de problemas aritmeticos.
- Pruebas de robustez de adaptadores LoRA: permite verificar si un adaptador entrenado con GRPO mantiene su rendimiento al cargarse sobre el modelo base sin el paso SFT previo (el autor advierte que no es asi).
- Componente en pipelines de razonamiento hibrido: puede combinarse con modelos de nivel L1 o L5 para adaptar la longitud del razonamiento segun la dificultad del problema o el presupuesto de tokens disponible.

## Benchmarks y rendimiento

Segun los resultados declarados por el autor en la model card (no verificados de forma independiente):

| Modelo / adaptador | GSM8K (test, exact match) |
|---|---:|
| Tras SFT (nivel L3) | 81,8 % |
| Tras GRPO (este adaptador) | 85,9 % |
| Diferencia | +4,1 pp |

Condiciones de evaluacion: test de GSM8K (n=1317), decodificacion greedy, un solo turno, sin ejemplos ni self-consistency. El autor indica que el intervalo de confianza al 95 % tiene una semi-amplitud de ~2,7 pp para n=1317, por lo que diferencias de unos pocos puntos pueden ser ruido.

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador en si es muy ligero (0,1 GB), pero requiere cargar el modelo base Qwen3-4B-Instruct-2507 (aproximadamente 8 GB en bfloat16).
- Con cuantizacion del modelo base (por ejemplo, 4 bits), cabe en GPUs consumer de 8 GB de VRAM (RTX 3060, RTX 4060, etc.).
- En bfloat16 sin cuantizar, se recomienda una GPU con al menos 12 GB de VRAM (RTX 3080, RTX 4070 Ti, etc.).
- El entrenamiento GRPO se realizo en 1x NVIDIA A100 80GB, pero la inferencia no requiere ese nivel de hardware.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; tambien puede fusionarse y exportarse a GGUF para usarse con llama.cpp u Ollama, aunque no se proporcionan instrucciones especificas.
- Latencia y throughput: no disponibles, pero al reducir la longitud de las cadenas de razonamiento, se espera una disminucion significativa del tiempo de generacion respecto al modelo base sin compresion.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia |
|---|---|---|---|---|
| Qwen3-4B-Instruct-2507 (base, sin adaptador) | 4B | no disponible | no disponible | Apache-2.0 |
| cot-dialect-qwen3-4b-instruct-grpo-l3 (este) | 4B + LoRA | no disponible | 85,9 % | Apache-2.0 |
| ssurface/qwen3-4b-gdpo-length-sft-l3 (otro adaptador del mismo autor) | 4B + LoRA | no disponible | no disponible | Apache-2.0 |

No se han encontrado datos publicados de otros adaptadores de compresion de CoT comparables en la misma escala.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matematicos de tipo word problem (GSM8K); no es adecuado para otras tareas de lenguaje general.
- Solo soporta ingles; no hay capacidades multilingues.
- La precision disminuye con la dificultad del problema, y esa caida es mas pronunciada en los niveles de compresion mas altos.
- El adaptador debe cargarse sobre el modelo SFT fusionado, no directamente sobre el modelo base; cargarlo sobre `Qwen/Qwen3-4B-Instruct-2507` sin el paso SFT previo no reproduce los resultados publicados.
- Los resultados de benchmark son declarados por el autor y no han sido verificados de forma independiente.
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento, especialmente en razonamiento simbolico comprimido donde los pasos intermedios pueden ser incorrectos pero parecer plausibles.
- No se proporcionan instrucciones de uso comercial especificas, aunque la licencia Apache-2.0 lo permite; el modelo base tambien es Apache-2.0.
- El entrenamiento uso una sola semilla (salvo que el nombre del repo indique lo contrario), por lo que diferencias de un par de puntos pueden deberse al azar.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l3
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Informe tecnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Adaptador relacionado del mismo autor: https://huggingface.co/ssurface/qwen3-4b-gdpo-length-sft-l3
