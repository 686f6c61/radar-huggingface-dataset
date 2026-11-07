# U-WIN/qwen35-9b-equational-theory-base-v2rubric-grpo-20261106

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-base-v2rubric-grpo-20261106` es un ajuste fino mediante aprendizaje por refuerzo (GRPO, Group Relative Policy Optimization) del modelo base `Qwen/Qwen3.5-9B` (revision `c2022362`), desarrollado por el usuario U-WIN. El objetivo del entrenamiento es especializar al modelo en la resolución y explicación de problemas de teoria ecuacional (equational theory), un dominio de las matematicas discretas y la logica algebraica que requiere razonamiento formal y verificacion de demostraciones. El modelo conserva la torre de vision y la cabeza de prediccion multi-token del inicializador, por lo que mantiene la modalidad image-text-to-text.

El ajuste se realizo con un pipeline completamente asincrono sobre un nodo HAI B200 (3 GPUs de entrenamiento, 3 de rollout y 2 de jueceo), partiendo del modelo base sin preentrenamiento continuado. El entrenamiento emplea un juez local congelado (Qwen3.8-27B) que puntua las respuestas con una rubrica de 0 a 7, y el reward es la puntuacion normalizada (score/7). El repositorio contiene cinco ramas de checkpoint (`checkpoint-10` a `checkpoint-50`), cada una correspondiente a un numero de actualizaciones del optimizador, mas la rama `main` con el checkpoint mas reciente.

Es relevante ahora porque documenta un experimento de RL con evaluacion por rubrica (rubric-graded) aplicado a un dominio matematico especializado, con metricas de evaluacion publicadas durante el entrenamiento (score/7 sobre 205 problemas) y una infraestructura de conversion reproducible a formato Hugging Face con manifiestos de verificacion por shard. Para investigadores interesados en RLHF/GRPO sobre dominios formales, ofrece un punto de partida con datos de progreso medibles, aunque el modelo tiene cero descargas y cero likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5-9B, con torre de vision y cabeza de prediccion multi-token (MTP) |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el entrenamiento usa 32.768 tokens de respuesta) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (conversion desde Megatron torch_dist a HF) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` en la revision `c2022362`, sin preentrenamiento continuado. Solo se entrena el modelo de lenguaje: la torre de vision (`model.visual.*`) y la cabeza de prediccion multi-token (`mtp.*`) se copian sin cambios del inicializador (shards `model-untrained-*`). De los tensores del modelo, 427 se entrenan y 348 se heredan sin modificar. El ajuste es un GRPO completamente asincrono con filtrado de grupo de grados no resueltos, ejecutado en un nodo HAI B200 con 3 GPUs de entrenamiento, 3 de rollout y 2 de jueceo, bajo el identificador de ejecucion `lean2nl-megatron-async-s3j2t3-v2rubric-qwen35base-20261106`.

Los datos de entrenamiento provienen de `U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric` (revision `fd284c793204`): 2182 problemas, todos con etiqueta TRUE y 54 de ellos con portador finito. Cada rollout usa 24 prompts × 8 muestras (batch global 192), con temperatura 1.0 y 32.768 tokens de respuesta. El reward se calcula mediante un juez local congelado Qwen3.8-27B (policy id `v2rubric-verdict-neutral-user-rubric-20261104-v3`) que aplica una rubrica generica y devuelve un JSON de dos campos (`assessment`, `score_0_to_7`); el reward es `score/7`, sin mostrar al juez la solucion de referencia ni la etiqueta de verdad, y eliminando del candidato las lineas de veredicto. La evaluacion se realiza sobre `U-WIN/sair-stage2-nl-verified-v2-rubric` (revision `ed7fb4630dfe`): 205 problemas (99 TRUE / 106 FALSE), 4 muestras por problema cada 20 rollouts. La conversion a Hugging Face se hace con las funciones de `miles-upstream/tools/convert_torch_dist_to_hf.py`, y cada rama incluye un `conversion_manifest.json` con sha256 por shard y la maxima desviacion absoluta frente al inicializador y al checkpoint anterior.

## Capacidades

- Generacion de texto y razonamiento formal en el dominio de teoria ecuacional: resolucion y explicacion de problemas con notacion Lean y lenguaje natural (pipeline lean2nl).
- Razonamiento matematico y verificacion de demostraciones, con salida estructurada en JSON (`assessment`, `score_0_to_7`) cuando se le aplica la rubrica de entrenamiento.
- Capacidades multimodales heredadas del base: procesamiento image-text-to-text (torre de vision sin entrenar, pero operativa).
- Prediccion multi-token (MTP) heredada del base Qwen3.5-9B.
- Generacion conversacional y text-generation estandar via `transformers`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el entrenamiento GRPO con multiples muestras sugiere capacidad de razonamiento iterativo, pero no se detalla.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion en RL para dominios formales: el modelo sirve como referencia reproducible de un pipeline GRPO con evaluacion por rubrica sobre problemas de teoria ecuacional, con checkpoints intermedios y manifiestos de conversion para comparar la evolucion del policy.
- Generacion de explicaciones en lenguaje natural de demostraciones Lean: el modelo traduce problemas formales a descripciones en lenguaje natural (lean2nl), util para documentacion didactica de teoremas.
- Evaluacion automatizada de soluciones matematicas: dado su entrenamiento con salida JSON de rubrica, puede emplearse como componente de un sistema de jueceo o como policy a comparar contra jueces congelados.
- Clasificacion de enunciados como verdaderos o falsos en teoria ecuacional: aunque entrenado solo con problemas TRUE, la evaluacion sobre el conjunto sair-stage2 (99 TRUE / 106 FALSE) permite medir su capacidad de discriminacion en tareas de verificacion.
- Fine-tuning posterior o ablation: los cinco checkpoints (`checkpoint-10` a `checkpoint-50`) permiten estudiar el efecto del numero de actualizaciones del optimizador sobre el rendimiento, util para calibrar presupuestos de RL.
- Base para modelos especializados en matematicas discretas: al conservar la torre de vision y la cabeza MTP, puede adaptarse a tareas que combinen texto e imagenes (por ejemplo, diagramas de estructuras algebraicas) con un ajuste adicional.
- Experimentacion con decodificacion y presupuestos de tokens: el uso de 32.768 tokens de respuesta en entrenamiento permite probar estrategias de razonamiento largo en inferencia sobre problemas formales.

## Benchmarks y rendimiento

Los unicos datos publicados son las evaluaciones durante el entrenamiento sobre `sair-stage2-nl-verified-v2-rubric` (205 problemas × 4 muestras, score/7):

| Rollout | Overall | Problemas TRUE | Problemas FALSE |
|---|---|---|---|
| 0 | 0,381 | 0,530 | 0,242 |
| 20 | 0,488 | 0,626 | 0,359 |
| 40 | 0,482 | 0,650 | 0,325 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con 9,65 mil millones de parametros en bf16, la estimacion orientativa ronda los 19-20 GB de pesos, mas overhead de activaciones y cache KV; en cuantizacion de 8 bits ~10 GB y en 4 bits ~5-6 GB (estimaciones genericas, no confirmadas por el autor).
- GPU recomendadas: el entrenamiento se realizo en nodos HAI B200; para inferencia se requieren GPUs con al menos 24 GB de VRAM en bf16 (A100 40/80 GB, H100, RTX 4090 24 GB con cuantizacion o ajustes de memoria).
- Cabe en GPU consumer: si, en RTX 4090 (24 GB) con cuantizacion o en bf16 con offloading parcial; en GPUs de 16 GB solo con cuantizacion agresiva.
- Opciones de despliegue: `transformers` (libreria declarada), con soporte de `endpoints_compatible` segun los tags; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-base-v2rubric-grpo-20261106 | 9,65 B | no disponible | GRPO con rubrica sobre Qwen3.5-9B | apache-2.0 | Hugging Face (0 descargas) |
| U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104 | ~10 B | no disponible | Misma ejecucion desde inicializador A-mix | apache-2.0 | Hugging Face |
| U-WIN/qwen35-9b-equational-theory-mix1m-grpo200-ntp-strategy-32k | ~10 B | 32k (segun nombre) | GRPO 200 pasos, estrategia NTP, 32k | no disponible | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9 B | no disponible | Preentrenamiento + alineacion del autor original | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El conjunto de entrenamiento contiene exclusivamente problemas con etiqueta TRUE (2182 problemas, todos TRUE), lo que puede sesgar al modelo hacia la aceptacion de enunciados; la evaluacion sobre problemas FALSE muestra puntuaciones notablemente inferiores (0,242-0,359 frente a 0,530-0,650 en TRUE).
- Riesgo de alucinacion en dominios formales: el modelo no ha sido validado con un verificador formal en produccion; las explicaciones lean2nl pueden contener errores no detectados por el juez de rubrica.
- El juez de recompensa es un modelo local (Qwen3.8-27B) con una rubrica especifica; el comportamiento del modelo esta optimizado para esa rubrica y puede no generalizar a otras metricas de calidad.
- El modelo solo ha sido entrenado en el modelo de lenguaje; la torre de vision y la cabeza MTP son las del base y no han sido ajustadas, por lo que su rendimiento multimodal no se ha validado en este contexto.
- Idiomas soportados no documentados; el entrenamiento se centra en el pipeline lean2nl, probablemente en ingles, sin confirmacion.
- Longitud de contexto no documentada; el entrenamiento usa 32.768 tokens de respuesta, pero la ventana de contexto total no se especifica.
- Licencia apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base Qwen3.5-9B y de los datasets derivados.
- Modelo con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.
- El repositorio ocupa 92,3 GB, lo que implica un coste de almacenamiento y descarga considerable para cinco checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-base-v2rubric-grpo-20261106
- Modelo hermano (inicializador A-mix): https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-syncards-a-v2rubric-grpo-20261104
- Modelo relacionado (GRPO 200 pasos, NTP, 32k): https://huggingface.co/U-WIN/qwen35-9b-equational-theory-mix1m-grpo200-ntp-strategy-32k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de prompts de entrenamiento: `U-WIN/equational-theory-lean2nl-references-gpt-approved-v2-rubric` (revision `fd284c793204`)
- Dataset de evaluacion: `U-WIN/sair-stage2-nl-verified-v2-rubric` (revision `ed7fb4630dfe`)
- Herramienta de conversion: `miles-upstream/tools/convert_torch_dist_to_hf.py`
