# yyuncong/SyncWorld-b7-noTTT-history9

## Resumen

SyncWorld-b7-noTTT-history9 es un modelo de mundo (world model) para robotica orientado a la dinamica directa (forward dynamics), desarrollado por el usuario yyuncong. Se trata del control emparejado "sin TTT" (test-time training) del modelo SyncWorld-b7-TTT10x-history9: comparte inicializacion, datos, flujo de pares con historia de 9 fotogramas, funciones de perdida, tasas de aprendizaje y numero de actualizaciones, pero se entrena sin memoria TTT (`ttt_enabled = false`, `pair_chunk_frames = 16`). Su proposito es servir de referencia para aislar el efecto del test-time training en el rendimiento del modelo.

El modelo se construye sobre un backbone congelado (exp-b7, la variante SyncWorld sin calibracion, en bf16) y entrena proyecciones VAE y de accion sobre el mismo. La arquitectura subyacente corresponde a la familia Cosmos (la licencia remite a NVIDIA/Cosmos), y el modelo se carga mediante `Cosmos3OmniModel.from_pretrained_dcp`. El repositorio ocupa 30,3 GB e incluye los pesos en bf16 tras 8000 actualizaciones, en formato DCP (Distributed Checkpoint).

Su relevancia es metodologica: al mantener constante todo excepto la memoria TTT, permite una comparacion emparejada (mismo orden de datos) entre el modelo con TTT y este control, cuantificando la mejora atribuible al TTT. El entrenamiento se realizo en un nodo con 8 GPU B200 (MAST, `spatial_ai_research`), a unos 8 segundos por actualizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | World model basado en Cosmos (`Cosmos3OmniModel`), backbone congelado + proyecciones VAE/accion entrenables |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (usa historia de 9 fotogramas reales, stride 3) |
| Tipos de cuantizacion | bf16 (precision de computo); pesos maestros FP32 fuera del repo (~62 GB) |
| Idiomas soportados | no disponible (modelo de robotica, no de lenguaje natural) |
| Licencia | openmdw-1.1 (`license: other`, enlace a NVIDIA/Cosmos LICENSE) |
| Formato de pesos | DCP (Distributed Checkpoint: `.metadata` + shards), bf16 |
| Tamano del repositorio | 30,3 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo parte de la inicializacion exp-b7 (SyncWorld sin calibracion), correspondiente a la ejecucion MAST `gripperhead-nocalib-droidmix-ax06-hist25-512-4x8`, iteracion `iter_000076000` en bf16. El backbone permanece congelado durante todo el entrenamiento y solo se entrenan las proyecciones VAE y de accion. Se enmarca en la familia Cosmos y se carga con `Cosmos3OmniModel.from_pretrained_dcp`.

Los datos provienen del estilo "formal_2 expert pairs": dos grabaciones renderizadas bajo una misma configuracion de camara relativa a la base del robot, en escenas distintas, donde una actua como demostracion y la otra como consulta. Se usa una unica vista en tercera persona (`agentview_rgb`) a 512x512, fuente a 20 fps y modelo a 15 fps. Se muestrean a razon 1:1 dos componentes: robocasa formal_2 (`yyupsong/robocasa_dataset@e4d1c3f0`, 5239 setups, excluyendo las escenas de las tareas de la cohorte de evaluacion) y robomimic v2 (`yyupsong/robomimic_dataset@d262dd24`, 7758 setups, 24 tareas). La receta usa historia de 9 fotogramas reales (stride 3), K = 8 chunks de demostracion escritos de 16 transiciones, 4 ventanas de consulta por flujo y un flujo por GPU, con LR 5e-5, calentamiento de 100 actualizaciones y 8000 actualizaciones totales. No se menciona RLHF ni DPO; las perdidas reportadas son de flow matching sobre vision (`flow_matching_loss_vision` y `demonstration_loss_vision`).

## Capacidades

- Modelado de mundo y dinamica directa para robotica: predice la evolucion de escenas a partir de pares demostracion/consulta.
- Razonamiento visomotor sobre una unica vista en tercera persona (`agentview_rgb`) a 512x512.
- Condicionamiento por historia: incorpora 9 fotogramas reales con stride 3 como contexto temporal.
- Escritura y lectura de chunks de demostracion: K = 8 chunks de 16 transiciones.
- Generacion de rollouts visuales (evaluacion mediante `eval_gripperhead_fdm_rollout.py`).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no es un modelo de lenguaje).
- Modo "thinking" o vision/audio especial: no disponible mas alla del modelado visual de robotica.
- Control sin memoria TTT (variante de control), con posibilidad de reanudar entrenamiento desde el checkpoint.

## Casos de uso

- Investigacion en world models para robotica: servir como linea base de control para medir el efecto del test-time training frente a SyncWorld-b7-TTT10x-history9, manteniendo constante el resto de la receta.
- Evaluacion de dinamica directa: generar rollouts con `examples/eval_gripperhead_fdm_rollout.py` para estudiar la calidad de la prediccion de escenas manipulativas.
- Reanudacion y experimentacion de entrenamiento: arrancar nuevos entrenamientos (warm-start) desde este checkpoint con `train_formal2_b7_ttt_history9.sh`.
- Estudio de transferencia entre escenas: gracias a los pares demostracion/consulta en escenas distintas, analizar como generaliza el modelo a cambios de entorno bajo una misma configuracion de camara.
- Benchmarking de recetas de datos: comparar el efecto de mezclas robocasa formal_2 y robomimic v2 (recuentos 5239 y 7758 setups) sobre la perdida de flow matching.
- Analisis de ablacion de memoria: cuantificar la contribucion de la memoria TTT comparando la perdida de ventana de consulta y de demostracion emparejadas frente a la variante con TTT.
- Base para pipelines de robotica congelados: al mantener el backbone congelado, integrar las proyecciones entrenadas en sistemas existentes que ya usen el backbone exp-b7.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente proporciona las perdidas de entrenamiento (media de las 400 actualizaciones previas a cada marca), que no constituyen una evaluacion en held-out. Se reproducen a continuacion como comparacion emparejada entre TTT 10x y el control sin TTT.

| update | query-window loss TTT 10x | no TTT | delta | demonstration loss TTT 10x | no TTT |
|---|---|---|---|---|---|
| 1600 | 0.0327 | 0.0357 | -8,3% | 0.0331 | 0.0362 |
| 3200 | 0.0324 | 0.0358 | -9,3% | 0.0319 | 0.0352 |
| 4800 | 0.0312 | 0.0348 | -10,4% | 0.0313 | 0.0348 |
| 6400 | 0.0315 | 0.0354 | -10,9% | 0.0310 | 0.0348 |
| 8000 | 0.0321 | 0.0360 | -10,9% | 0.0312 | 0.0351 |

Query-window loss = `train@2_detail/flow_matching_loss_vision`; demonstration loss = `train@2_detail/demonstration_loss_vision`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los pesos del repositorio estan en bf16 y el conjunto del repo ocupa 30,3 GB, lo que da una referencia del orden de magnitud del checkpoint, pero no se especifica el peso total de parametros.
- Pesos maestros FP32: unos 62 GB (fuera del repositorio, en Manifold con el estado completo de entrenamiento).
- GPU recomendadas: el entrenamiento se realizo en 8x NVIDIA B200 (un nodo, MAST `spatial_ai_research`).
- Encaje en GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: carga mediante `Cosmos3OmniModel.from_pretrained_dcp` (formato DCP) en el entorno SyncWorld-dev. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en entrenamiento, aproximadamente 8 segundos por actualizacion en 8x B200. No se proporcionan datos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TTT | Licencia | Estado |
|---|---|---|---|---|---|
| SyncWorld-b7-noTTT-history9 (este) | no disponible | historia 9 fotogramas | No | openmdw-1.1 | Publicado |
| SyncWorld-b7-TTT10x-history9 | no disponible | historia 9 fotogramas | Si (10x) | openmdw-1.1 | Contrapartida con TTT |

No se dispone en la informacion proporcionada de otros modelos comparables de la misma categoria (world models de robotica con forward dynamics y variantes de test-time training). El unico comparable directo es SyncWorld-b7-TTT10x-history9, segun lo indicado por el autor.

## Limitaciones y advertencias

- El autor advierte explicitamente que las cifras reportadas son perdidas de entrenamiento, no una evaluacion en held-out; no deben interpretarse como rendimiento en tareas reales.
- Ausencia de benchmarks publicos: no hay MMLU, HumanEval, GSM8K ni metricas equivalentes, dado que es un modelo de robotica y no de lenguaje.
- Sesgos conocidos: no disponibles. Los datasets subyacentes (robocasa, robomimic) pueden introducir sesgos propios de la manipulacion robotica simulada que no se analizan en la informacion.
- Riesgo de alucinacion: no aplica en el sentido de lenguaje natural, pero existe riesgo de predicciones visuales imprecisas en rollouts fuera de la distribucion de entrenamiento; no cuantificado.
- Limitaciones de contexto o idioma: el modelo opera sobre ventanas de 9 fotogramas reales; no se especifica una longitud de contexto mayor. No es un modelo multilingue.
- Restricciones de licencia: licencia `openmdw-1.1` (`license: other`), con enlace a la licencia de NVIDIA/Cosmos. Es imprescindible revisar los terminos de dicha licencia antes de un uso comercial, ya que no es una licencia permisiva estandar.
- Caveats para produccion: el backbone esta congelado y solo se entrenan las proyecciones VAE/accion; el checkpoint esta en formato DCP (no safetensors ni GGUF), lo que condiciona el ecosistema de despliegue.
- El repositorio incluye principalmente el estado de un experimento de investigacion (metricas, recetas, logs); no esta orientado a un uso directo en produccion.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/yyuncong/SyncWorld-b7-noTTT-history9
- Contrapartida con TTT: https://huggingface.co/yyuncong/SyncWorld-b7-TTT10x-history9
- Licencia (NVIDIA/Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
- Dataset robocasa formal_2: `yyupsong/robocasa_dataset@e4d1c3f0`
- Dataset robomimic v2: `yyupsong/robomimic_dataset@d262dd24`
- Receta de entrenamiento: `wm_ttt/train/recipe_formal2_pairs_b7_nottt_history9_8gpu_q4.toml`
- Checkpoint FP32 y estado completo (Manifold, MAST): `samworlds_mast/tree/users/yuncongyang/syncworld_ttt/outputs/formal2_pairs_b7_nottt_history9_8gpu_q4_b200r2/checkpoints/iter_000008000/`
