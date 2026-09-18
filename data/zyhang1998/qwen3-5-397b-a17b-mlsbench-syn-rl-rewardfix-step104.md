# zyhang1998/qwen3.5-397b-a17b-mlsbench-syn-rl-rewardfix-step104

## Resumen

Este repositorio contiene un checkpoint experimental de Qwen3.5-397B-A17B publicado por el usuario zyhang1998. Se trata del resultado de fusionar el adaptador LoRA final (paso 104) de un entrenamiento de refuerzo de dos epocas sobre tareas sinteticas de MLSBench dentro del modelo base Qwen/Qwen3.5-397B-A17B. El resultado es un checkpoint autonomo en BF16 que no requiere cargar un adaptador PEFT por separado: conserva la arquitectura, el tokenizer, la plantilla de chat y el reparto en 94 shards de safetensors del modelo original.

El modelo es multimodal (pipeline `image-text-to-text`) y de tipo mezcla de expertos, segun la etiqueta `qwen3_5_moe`. El recuento real de parametros en safetensors es de 403.397.928.944 (unos 403,4 mil millones), con un repositorio de 806,8 GB, coherente con pesos en BF16 (2 bytes por parametro). El sufijo "A17B" del nombre sugiere 17 mil millones de parametros activos por token, pero ese dato no se confirma en la informacion proporcionada.

La relevancia de esta ficha es acotada y conviene ser explicito: no es un modelo de produccion, sino un artefacto de investigacion. El propio autor advierte que la puerta de consistencia de politica posterior al entrenamiento no paso: la divergencia media entre las probabilidades del rollout y las del entrenamiento fue de 0,96975 (maximo 1,0) y la KL reportada de 60,1778. Es util como referencia para estudiar post-entrenamiento con RL sobre modelos MoE de gran escala, no como sustituto del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 con mezcla de expertos (etiqueta `qwen3_5_moe`); transformer multimodal image-text-to-text |
| Parametros totales | 403.397.928.944 (403,4 mil millones), segun safetensors |
| Parametros activos | 17 mil millones (inferido del sufijo A17B del nombre; no confirmado en la informacion proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el unico checkpoint publicado esta en BF16; no se documentan versiones GGUF, AWQ ni FP8) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 (licencia del modelo base Qwen3.5-397B-A17B) |
| Formato de pesos | safetensors BF16, 94 shards, 2.924 tensores |

Otros datos tecnicos declarados por el autor: rango LoRA 32, alpha 64, 2.013 objetivos LoRA fusionados de los cuales 360 presentan delta distinto de cero. El manifiesto de fusion e integridad esta en `merge_manifest.json` dentro del repositorio.

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5 en su variante de mezcla de expertos con capacidades multimodales, ya que el pipeline declarado es `image-text-to-text`. El checkpoint no introduce cambios estructurales: mantiene arquitectura, tokenizer, plantilla de chat y organizacion de shards del modelo base, y solo incorpora los pesos resultantes de la fusion del adaptador. Segun la configuracion de vLLM recomendada por el autor, el modelo soporta decodificacion especulativa mediante el metodo `mtp` (multi-token prediction) con 2 tokens especulativos, y dispone de un parser de razonamiento `qwen3`, lo que implica que el modelo base tiene un modo de razonamiento diferenciado.

El entrenamiento consistio en dos epocas de aprendizaje por refuerzo sobre tareas sinteticas de MLSBench, con una recompensa de desempate por puntuacion densa y direccional con peso 0,001. La recompensa media final de entrenamiento fue 0,55315 y la recompensa media de validacion sobre 64 trayectorias fue 0,64234, con 62 envios validos de 64. Sin embargo, la verificacion de consistencia entre la politica de rollout y la politica entrenada no paso: `training/rollout_probs_diff_mean` alcanzo 0,96975, `training/rollout_probs_diff_max` llego a 1,0 y la KL reportada fue 60,1778. Estos valores indican una divergencia severa entre ambas distribuciones y son la razon por la que el autor califica el checkpoint como experimental.

## Capacidades

- Generacion de texto conversacional multimodal: el pipeline declarado es `image-text-to-text`, por lo que el modelo base procesa entradas de imagen y texto, aunque no se documenta el alcance concreto de las capacidades de vision en este checkpoint.
- Razonamiento con modo explicito: la configuracion de vLLM incluye `--reasoning-parser qwen3`, lo que indica soporte de un canal de razonamiento diferenciado en la salida.
- Resolucion de tareas sinteticas de MLSBench: es el unico dominio para el que existe evidencia de entrenamiento especifico, con una recompensa de validacion media de 0,64234.
- Decodificacion especulativa con multi-token prediction: soportada en vLLM mediante `{"method":"mtp","num_speculative_tokens":2}`.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; el entrenamiento con multiples trayectorias de rollout es compatible con escenarios multi-paso, pero no se documenta comportamiento agentico.
- Capacidades multilingues: no disponible.
- Capacidades adicionales (audio, thinking mode explicito, vision de alta resolucion): no disponible.

## Casos de uso

- Investigacion en post-entrenamiento con RL: el checkpoint permite reproducir y analizar el efecto del paso 104 de un ciclo de RL con recompensa de desempate densa, comparando la recompensa de validacion (0,64234) con la divergencia de politica observada (KL 60,1778).
- Estudio de fusion de adaptadores LoRA sobre modelos MoE de gran escala: los metadatos de fusion (2.013 objetivos, 360 con delta no nulo, rango 32) permiten analizar que capas cambian realmente tras un ciclo corto de RL.
- Diagnostico de colapso de politica: la combinacion de `rollout_probs_diff_mean` = 0,96975 y KL = 60,1778 lo convierte en un caso de estudio util para calibrar puertas de consistencia en pipelines de RLHF/RLVR.
- Evaluacion comparativa frente al modelo base: al compartir tokenizer, plantilla de chat y arquitectura con Qwen/Qwen3.5-397B-A17B, se puede aislar el efecto del entrenamiento RL midiendo ambos checkpoints sobre el mismo conjunto de tareas.
- Generacion de datos sinteticos para experimentos de destilacion: el modelo puede producir trayectorias etiquetadas con recompensa, utiles como material de partida, siempre que se valide la calidad de cada trayectoria.
- Pruebas de infraestructura de serving a gran escala: el checkpoint sirve para validar despliegues vLLM con paralelismo tensorial de 8, decodificacion especulativa MTP y carga de safetensors repartidos en 94 shards.
- Analisis de robustez multimodal: dado que el pipeline es `image-text-to-text`, permite comprobar si el ciclo de RL sobre texto degrada o preserva el comportamiento sobre entradas de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye MMLU, HumanEval, GSM8K ni ninguna otra evaluacion estandar, ni comparaciones con modelos de referencia. Los unicos numeros de rendimiento son metricas internas del ciclo de RL:

| Metrica | Valor |
|---|---|
| Recompensa media final de entrenamiento | 0,55315 |
| Recompensa media de validacion (64 trayectorias) | 0,64234 |
| Envios validos en validacion | 62 de 64 |
| `training/rollout_probs_diff_mean` | 0,96975 |
| `training/rollout_probs_diff_max` | 1,0 |
| KL rollout/entrenamiento reportada | 60,1778 |
| Peso del desempate por puntuacion densa | 0,001 |

## Requisitos de hardware

- VRAM para pesos en BF16: aproximadamente 807 GB solo para parametros (403,4 mil millones x 2 bytes), coherente con los 806,8 GB del repositorio. Con cache KV y activaciones para contexto largo, el requisito practico se situa en el entorno de 900 GB-1 TB.
- Configuracion declarada por el autor: `--tensor-parallel-size 8` con `--dtype bfloat16`. Eso implica 8 GPU, con unos 101 GB de pesos por GPU. No cabe en 8 x H100 de 80 GB (640 GB totales), por lo que se necesitan aceleradores de mayor memoria: 8 x H200 (141 GB, 1.128 GB totales) o 8 x B200 (192 GB, 1.536 GB totales) son opciones viables.
- Cuantizaciones hipoteticas: en FP8 los pesos ocuparian unos 404 GB (alcanzable con 8 x 80 GB repartiendo cache aparte, ajustado) y en INT4 unos 202 GB (alcanzable en 4 x H100 de 80 GB o 2 x H200). No se publican checkpoints cuantizados, por lo que estas cifras son estimaciones teoricas del coste de memoria, no artefactos disponibles.
- GPU consumer: no es desplegable en GPU de consumo. Ni siquiera una RTX 4090 de 24 GB, una RTX 5090 o varias en paralelo permiten alojar 807 GB de pesos en BF16, y el modelo no esta pensado para offloading en CPU.
- Opciones de despliegue: vLLM es la via documentada por el autor, con paralelismo tensorial, parser de razonamiento `qwen3` y decodificacion especulativa `mtp`. No se documentan recetas para llama.cpp, Ollama, TGI ni SGLang, y la ausencia de checkpoints GGUF hace inviable llama.cpp y Ollama por ahora.
- Latencia y throughput: no disponible. El autor no publica mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes sobre este modelo ni sobre modelos comparables, por lo que no es posible construir una comparativa con alternativas externas contrastadas.

| Modelo | Parametros totales | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zyhang1998/qwen3.5-397b-a17b-mlsbench-syn-rl-rewardfix-step104 | 403,4 mil millones | no disponible | sin benchmarks; recompensa de validacion 0,64234 | apache-2.0 | HuggingFace, BF16, 806,8 GB |
| Qwen/Qwen3.5-397B-A17B (modelo base) | 403,4 mil millones (mismo checkpoint de partida) | no disponible | sin datos en la informacion proporcionada | apache-2.0 | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La puerta de consistencia de politica no paso. Con `rollout_probs_diff_mean` = 0,96975, `rollout_probs_diff_max` = 1,0 y KL = 60,1778, la politica entrenada diverge de forma severa de la politica usada para generar los rollouts. Es esperable comportamiento degradado, repetitivo o incoherente en tareas fuera del dominio de entrenamiento.
- El propio autor lo etiqueta como checkpoint de investigacion experimental y recomienda verificar el comportamiento sobre la carga de trabajo objetivo antes de cualquier despliegue.
- No se han publicado benchmarks estandar, por lo que no existe evidencia medida de capacidades generales de razonamiento, codigo, matematicas o vision.
- La recompensa de validacion de 0,64234 es una metrica especifica del entorno MLSBench sintetico y no es trasladable a calidad en tareas reales.
- Contexto, idiomas soportados y tipos de cuantizacion no estan documentados en la informacion disponible; cualquier planificacion de produccion basada en esos parametros carece de base.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados en la informacion disponible. Dado el estado del entrenamiento, el riesgo es alto y no cuantificado.
- Coste de despliegue elevado: 806,8 GB de pesos en BF16 y necesidad de al menos 8 aceleradores de memoria alta. El modelo no es viable en hardware de consumo ni en nodos de 8 x 80 GB en BF16.
- La licencia declarada es apache-2.0, heredada del modelo base, pero conviene revisar los terminos del modelo base Qwen3.5-397B-A17B antes de un uso comercial, asi como la ausencia de garantias sobre un artefacto derivado no validado.
- El repositorio registra 0 descargas y 0 likes, sin validacion externa por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zyhang1998/qwen3.5-397b-a17b-mlsbench-syn-rl-rewardfix-step104
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-397B-A17B/blob/main/LICENSE
- Manifiesto de fusion e integridad: `merge_manifest.json` en el repositorio del modelo
- Papers, blogs, repositorios o demos adicionales: la busqueda web no devolvio resultados relevantes sobre este modelo; no disponible.
