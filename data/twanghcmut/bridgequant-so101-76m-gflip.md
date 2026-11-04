# twanghcmut/bridgequant-so101-76m-gflip

## Resumen

bridgequant-so101-76m-gflip es una política visi\u00f3n-lenguaje-acción (VLA) de 64,8 millones de parámetros publicada por el usuario twanghcmut en HuggingFace, orientada a robótica y, en concreto, al brazo SO101. Se distribuye como un checkpoint de safetensors de 0,3 GB junto con un fichero de normalización (`norm_stats.json`), un YAML de configuración (`bridgequant_vla.yaml`) y el `train_config.yaml` de entrenamiento. El modelo se enmarca en el proyecto BridgeQuant, cuyo código vive en el repositorio VLAOpt/bridgequant-async.

La particularidad de este checkpoint frente a `bridgequant-so101-76m` es el uso de `train.aug_gripper_state_flip: 0.3`, una aumentación de datos que, en fotogramas previos al agarre (open-target frames), sustituye la lectura propioceptiva de la pinza por el valor de "cerrada sobre vacío", manteniendo intactas las imágenes y los objetivos. El autor lo describe como un contrafactual de reagarre: se entrena al modelo para que no confíe ciegamente en el estado de la pinza y pueda planificar la aproximación aunque la lectura sea inconsistente.

El modelo es relevante para quienes trabajan en manipulación robótica de bajo coste con SO101: demuestra que una política de 76M (64,8M reales según safetensors) puede mantener la precisión de chunks dentro de muestra mientras mejora la robustez ante fallos de propriocepción. No hay datos publicados de benchmarks estándar, ni de idiomas, ni de rendimiento en hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) BridgeQuant, transformer multimodal (detalles no disponibles) |
| Parámetros totales | 64.826.027 (según safetensors; el nombre indica 76M) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (ver limitaciones) |
| Formato de pesos | safetensors (`model.safetensors`), más `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de etiquetarla como visión-lenguaje-acción dentro del marco BridgeQuant y del pipeline `robotics`. El checkpoint se entrena sobre las mismas tres tareas y los mismos datos que `bridgequant-so101-76m`, con una única modificación: la aumentación `aug_gripper_state_flip` aplicada con probabilidad 0,3. En los fotogramas con objetivo de pinza abierta, la lectura propioceptiva de la pinza se reemplaza por el valor correspondiente a cerrada sobre vacío, mientras que las imágenes y los objetivos de acción permanecen sin cambios.

El autor reporta una evaluación offline de tipo contrafactual: forzando la pinza a leerse como cerrada en fotogramas previos al agarre, el modelo base conserva el 0 % de objetivos de pinza abierta (es decir, cree la lectura de estado), mientras que este modelo conserva el 78 % (frente al 84 % sin perturbación). Además, su plan de aproximación se desplaza 0,18 unidades en lugar de 0,66. El MAE de chunk dentro de muestra se mantiene sin cambios en 1,28 / 1,41 / 1,16 (tres valores, presumiblemente por tarea). No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación (política de control) para el brazo SO101 en tres tareas concretas.
- Procesamiento conjunto de visión y estado propioceptivo (incluida la lectura de la pinza) para producir planes de acción.
- Robustez ante lecturas inconsistentes de la pinza: mantiene objetivos de pinza abierta en el 78 % de los fotogramas perturbados, frente al 0 % del modelo base.
- Planificación de aproximación con desplazamiento reducido bajo perturbación (0,18 frente a 0,66 unidades).
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, multilingüismo, modo thinking, audio ni visión general más allá del uso robótico.

## Casos de uso

- Manipulación con brazo SO101 en entornos de laboratorio: el modelo actúa como política de control para las tres tareas con las que fue entrenado, usando imágenes y estado propioceptivo como entrada.
- Recuperación de agarres fallidos: gracias al entrenamiento contrafactual, si la pinza reporta un estado incorrecto antes del agarre, el modelo sigue planificando una aproximación con objetivo abierto en lugar de bloquearse, lo que resulta útil en secuencias de reagarre.
- Despliegue en hardware de bajo coste: con 64,8M de parámetros y un repo de 0,3 GB, es viable en equipos con GPU modesta, aunque no se publican requisitos exactos.
- Investigación en aumentación de datos para VLA: sirve como referencia reproducible para estudiar el efecto de `aug_gripper_state_flip` frente al checkpoint base `bridgequant-so101-76m`.
- Evaluación de robustez propioceptiva: permite comparar el comportamiento del modelo bajo perturbaciones de estado de pinza en un pipeline offline antes de llevarlo al robot.
- Integración en el stack BridgeQuant async: se puede cargar con `scripts/so101_policy.py` del repositorio VLAOpt/bridgequant-async siguiendo `docs/so101_deploy.md`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos reportados por el autor son la evaluación offline contrafactual y el MAE de chunk dentro de muestra:

| Métrica | Valor reportado |
|---|---|
| Objetivos de pinza abierta conservados con pinza forzada a cerrada (modelo base) | 0 % |
| Objetivos de pinza abierta conservados con pinza forzada a cerrada (este modelo) | 78 % |
| Objetivos de pinza abierta sin perturbación (este modelo) | 84 % |
| Desplazamiento del plan de aproximación bajo perturbación (este modelo) | 0,18 unidades |
| Desplazamiento del plan de aproximación bajo perturbación (modelo base) | 0,66 unidades |
| MAE de chunk dentro de muestra | 1,28 / 1,41 / 1,16 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 64,8M de parámetros en safetensors, la huella de pesos ronda los 130 MB en fp16, pero el consumo total depende del codificador visual y del resto del pipeline, no documentados.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No se especifica, pero por tamaño de parámetros es plausible en GPUs de consumo; el autor no lo confirma.
- Opciones de despliegue: el repositorio VLAOpt/bridgequant-async proporciona `scripts/so101_policy.py` y la guía `docs/so101_deploy.md`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-so101-76m-gflip | 64,8M (safetensors) | no disponible | VLA para SO101 con aumentación de estado de pinza | other | HuggingFace |
| bridgequant-so101-76m | no disponible en la información | no disponible | VLA para SO101, checkpoint base sin la aumentación | other (presumiblemente) | HuggingFace (referenciado por el autor) |
| Otros modelos VLA para robótica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables entre estos modelos más allá de las métricas contrafactuales citadas.

## Limitaciones y advertencias

- Licencia "other": no se especifican los términos exactos, por lo que el uso comercial requiere revisar la licencia del repositorio antes de desplegar.
- El modelo está entrenado para tres tareas concretas del brazo SO101; no se documenta generalización a otras tareas, robots o entornos.
- Los resultados reportados son offline y contrafactuales; no hay validación en robot real publicada en la información disponible.
- No se documentan idiomas soportados ni capacidades lingüísticas generales.
- No se detallan sesgos conocidos ni tasas de alucinación; en un modelo de política robótica, el riesgo relevante es la ejecución de acciones incorrectas ante entradas fuera de distribución.
- El `train_config.yaml` contiene rutas a modelos profesor que solo son necesarias para entrenamiento; la inferencia las ignora, pero conviene no confundirlas con dependencias de despliegue.
- El nombre del modelo indica 76M mientras que safetensors reporta 64,8M de parámetros; conviene verificar la discrepancia antes de dimensionar recursos.

## Enlaces

- HuggingFace: https://huggingface.co/twanghcmut/bridgequant-so101-76m-gflip
- Repositorio de código: https://github.com/VLAOpt/bridgequant-async
- Script de política: `scripts/so101_policy.py` (dentro del repositorio anterior)
- Guía de despliegue: `docs/so101_deploy.md` (dentro del repositorio anterior)
- Checkpoint base referenciado: `bridgequant-so101-76m` (en HuggingFace, bajo el mismo autor)
