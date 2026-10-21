# ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter3

## Resumen

E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter3 es un checkpoint de investigación publicado por el usuario ziyan98 en HuggingFace. No es un modelo nuevo entrenado desde cero, sino un ajuste fino del modelo base Qwen/Qwen3.8-27B (aproximadamente 27.800 millones de parámetros) resultante de un experimento de "internalización de conocimiento" (E2K, *experience-to-knowledge*) sobre el videojuego `cd82-fb555c5d` de ARC-AGI-3. El objetivo del estudio es determinar si el conocimiento verificado extraído de las propias partidas del modelo puede escribirse en sus pesos mediante filas supervisadas y mejorarse después con aprendizaje por refuerzo sobre episodios reales de varios pasos.

El checkpoint corresponde a la iteración 3 del *run* `act_ctrl-cc`, que actúa como rama de control válida del experimento: las 303 filas de SFT son turnos del propio arnés del modelo base, sin conocimiento inyectado. El entrenamiento se realizó con slime v0.3.2 sobre Megatron-LM (TP4 × PP4) y 16 motores de rollout SGLang en 4 nodos GH200 de Isambard-AI, usando Dr.GRPO como algoritmo de RL. El autor advierte explícitamente de que no se trata de una mejora de propósito general de Qwen3.8-27B: se entrenó y evaluó en un único juego, y las diferencias entre ramas son de centésimas en el retorno modelado.

La relevancia del modelo es, por tanto, metodológica: documenta de forma reproducible (argumentos de Megatron, cursor del dataset, curva de entrenamiento y métricas de juego por rollout) cómo se comporta un modelo de 27B cuando se le somete a un ciclo SFT + RL en un entorno de agentes con herramientas MCP. Su utilidad práctica fuera de ese contexto experimental es prácticamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (clase `Qwen3_5ForConditionalGeneration`, tag `qwen3_5`); pila de texto entrenada, torre visual heredada del modelo base |
| Parametros totales | 27.781.427.952 (dato real de safetensors) |
| Parametros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como artefacto publicado; pesos distribuidos en bf16 safetensors |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16), 1199 tensores con los mismos nombres y formas que el modelo base |
| Pipeline declarado | image-text-to-text |
| Tamano del repositorio | 55,6 GB |
| Modelo base | Qwen/Qwen3.8-27B |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.8-27B, un transformer multimodal que en este repositorio se carga mediante `Qwen3_5ForConditionalGeneration`. El proceso de conversión solo afecta a la pila de texto: los tensores `model.language_model.*` y `lm_head` provienen del estado entrenado en Megatron, mientras que la torre visual `model.visual.*` y la cabeza de predicción multi-token `mtp.*` se copian sin cambios del checkpoint base (el entrenamiento fue exclusivamente de texto y el actor nunca vio una imagen). El autor documenta verificación de forma y tipo para cada tensor, identidad bit a bit de los tensores copiados y sumas SHA256 de todos los ficheros, además de un `E2K_VERIFY.json` con la comparación contra el modelo base.

El entrenamiento se organiza en dos fases sobre el *run* `act_ctrl-cc`. Primero, dos rollouts solo de SFT con 303 filas (`rows_actctrl.jsonl.gz`), correspondientes a turnos del propio arnés del modelo base sin conocimiento inyectado, con reinicio del estado de Adam. Después, rollouts 2 y 3 de RL con Dr.GRPO (`--advantage-estimator grpo --no-normalize-advantages --disable-grpo-std-normalization --calculate-per-token-loss`), cancelados el 18 de septiembre de 2026 para liberar la GPU destinada a las ramas con conocimiento. La configuración de RL usa una muestra de entrenamiento por llamada al LLM, batch global de 4, 8 pasos de optimizador por rollout de 32 episodios, learning rate 5e-6, precisión bf16 y backend flash-attn 2.8.3. El prompt de RL nunca contiene conocimiento. El arnés de juego es Claude Code CLI 2.1.270 operando las herramientas MCP `look`, `act` y `status` de `knowledge_learning.loop.arc_mcp`, con semilla de motor 0, niveles 1 a 4 con tope de subida de un nivel y retorno modelado sobre los niveles superados.

## Capacidades

- Generación de texto conversacional, con la plantilla de chat y el modo de razonamiento (*thinking*) del modelo base sin modificar.
- Entrada de imagen y texto según el pipeline declarado `image-text-to-text`, aunque la torre visual no fue entrenada en este experimento.
- Interacción con herramientas mediante *tool calling* a través del arnés MCP empleado en el experimento (`look`, `act`, `status`).
- Ejecución de episodios de varios pasos en un entorno de juego, con planificación implícita en los tokens de pensamiento (mediana de 3347 a 4504 tokens de *think* por rollout).
- Capacidad declarada de carga en vLLM y SGLang con el mismo procedimiento que el modelo base.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta ninguna capacidad nueva adquirida respecto al modelo base; el autor indica que el checkpoint no es una mejora de propósito general.

## Casos de uso

- Investigación sobre internalización de conocimiento: el checkpoint sirve como rama de control para comparar, contra las ramas con conocimiento (IDD), si las filas supervisadas con citas mejoran el juego. Se usaría replicando el *run* `act_ctrl-cc` y midiendo el retorno modelado por rollout.
- Reproducción de experimentos de RL con Dr.GRPO: el repositorio conserva `megatron/args.json`, `common.pt` y el cursor `global_dataset_state_dict_<N>.pt`, lo que permite reconstruir el estado de entrenamiento (sin momentos del optimizador) con `convert_hf_to_torch_dist.py` de slime.
- Estudio de la estabilidad del entrenamiento en entornos de agentes: la tabla de métricas por rollout (tasa de superación, retorno modelado, cambio de paso, no-op) permite analizar la varianza entre rollouts, que el autor cifra en torno a 0,05 de retorno modelado.
- Auditoría de conversión Megatron a HuggingFace: el mismo conversor reproduce bit a bit los safetensors originales del modelo base, por lo que el repositorio puede emplearse como caso de prueba de herramientas de conversión de checkpoint.
- Análisis de coste de razonamiento: los datos de tokens de pensamiento por rollout (p50 entre 3347 y 4504) permiten estudiar la relación entre presupuesto de razonamiento y rendimiento en tareas de planificación.
- Evaluación de arneses basados en MCP: el registro de turnos, turnos recitados y turnos con referencia a fuente (0,214 a 0,271) sirve para medir la fiabilidad de un arnés de agentes sobre herramientas externas.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea generalista: el autor lo desaconseja explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). La model card solo reporta métricas de juego del *run*, por rollout:

| Job | Rollout | Tasa de superacion | Retorno modelado | Cambio de paso | Paso no-op | Tokens de think (p50) | Turnos recitados | Turnos con referencia a fuente |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 6619233 | 2 | 0,000 | -0,419 | 0,083 | 0,386 | 4431,0 | 0,000 | 0,237 |
| 6647953 | 2 | 0,000 | -0,516 | 0,064 | 0,411 | 4279,0 | 0,000 | 0,232 |
| 6619233 | 3 | 0,000 | -0,514 | 0,040 | 0,425 | 3347,0 | 0,000 | 0,214 |
| 6647953 | 3 | 0,031 | -0,347 | 0,055 | 0,400 | 4504,0 | 0,000 | 0,227 |
| 6619233 | 4 | 0,000 | -0,348 | 0,057 | 0,394 | 3896,0 | 0,000 | 0,248 |
| 6619233 | 5 | 0,031 | -0,205 | 0,082 | 0,366 | 4162,0 | 0,000 | 0,271 |
| 6630891 | 5 | 0,000 | -0,338 | 0,056 | 0,372 | 4371,0 | 0,000 | 0,271 |
| 6630891 | 6 | 0,000 | -0,253 | 0,052 | 0,360 | 3932,5 | 0,000 | 0,269 |

Resumen del autor para la iteración 3: retornos modelados de -0,515 y -0,347 y entre 0 y 1 superaciones sobre 32 episodios. El ruido entre rollouts de una misma rama es de aproximadamente 0,05 de retorno modelado.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 55,6 GB solo para pesos, más memoria para caché KV y activaciones; se necesita al menos una GPU de 80 GB para una ejecución cómoda.
- El entrenamiento se realizó en 4 nodos GH200 de Isambard-AI con Megatron-LM en TP4 × PP4 y 16 motores de rollout SGLang con tp=1.
- GPU recomendadas: GH200 (usada en el experimento), H100 80 GB, A100 80 GB. No cabe en GPU de consumo (RTX 4090 de 24 GB) en bf16.
- Opciones de despliegue: `transformers` con `Qwen3_5ForConditionalGeneration` y `device_map="auto"`, vLLM y SGLang (el autor indica que cargan igual que el modelo base). No se publican artefactos GGUF, por lo que llama.cpp y Ollama no están disponibles en el repositorio.
- Checkpoint completo de entrenamiento con estado del optimizador: aproximadamente 351 GB, alojado en Isambard-AI y no publicado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento especifico | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter3 | 27,78 B | no disponible | SFT (303 filas de control) + Dr.GRPO, 1 juego de ARC-AGI-3 | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Modelo base original | no disponible en la informacion | HuggingFace |
| Otras iteraciones del mismo *run* E2K-cd82 (ramas con conocimiento, warm-up solo SFT) | mismo tamano | no disponible | Variantes del mismo experimento | apache-2.0 | Listadas en `checkpoints/checkpoints.md` del dataset de RL |
| Otros modelos de 27B de propósito general | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento general de este checkpoint con alternativas de su misma categoría.

## Limitaciones y advertencias

- No es una mejora de propósito general: el autor lo declara explícitamente. El entrenamiento se limita a un único juego (`cd82-fb555c5d`) y la evaluación a rollouts de 32 episodios de ese mismo juego.
- Las diferencias frente a otras ramas del experimento son de centésimas en el retorno modelado, dentro del ruido entre rollouts (aproximadamente 0,05). No deben interpretarse como mejoras significativas.
- El checkpoint de la iteración 3 se canceló antes de completar la programación prevista de RL, por lo que la rama no está entrenada hasta convergencia.
- La torre visual y la cabeza de predicción multi-token no se entrenaron: el modelo nunca vio una imagen durante el ajuste. El uso multimodal hereda el comportamiento del modelo base sin garantías adicionales.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un ajuste sobre un modelo base, hereda los del original, que no se detallan.
- Idiomas soportados no especificados; la plantilla de chat y el tokenizador son los del modelo base.
- Longitud de contexto no especificada en la información proporcionada.
- El uso comercial está permitido por la licencia apache-2.0, pero el propio autor desaconseja el uso en producción por el alcance limitado del experimento.
- No se publican pesos cuantizados ni artefactos GGUF, lo que restringe el despliegue en hardware modesto.
- La model card enlaza un repositorio adicional `ziyan98/E2K-40` cuyo enlace aparece truncado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ziyan98/E2K-cd82-Qwen3.8-27B-act_ctrl-cc-iter3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de RL del *run* (episodios, métricas, filas y registro de ejecución): https://huggingface.co/datasets/ziyan98/E2K-cd82-rl-internalization
- Dataset del conjunto de conocimiento: https://huggingface.co/datasets/ziyan98/E2K-cd82-harness-knowledge
- Repositorio `ziyan98/E2K-40`: enlace truncado en la información disponible, no verificable
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las únicas coincidencias devueltas eran contenido no relacionado y se han descartado.
