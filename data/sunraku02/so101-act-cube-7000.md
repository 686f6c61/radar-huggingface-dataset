# Sunraku02/so101-act-cube-7000

## Resumen

SO-101 ACT Policy - Checkpoint 7000 (Cube Pick) es una política de control robótico entrenada con LeRobot mediante Action Chunking with Transformers (ACT). La publica el usuario Sunraku02 y está diseñada específicamente para un manipulador SO-101 de 6 grados de libertad, con el objetivo concreto de recoger un cubo (tarea `pick_cude_up`). No es un modelo de lenguaje: es un modelo de robótica que mapea observaciones visuales y de estado del robot a secuencias de acciones motoras.

El modelo se distribuye como checkpoint de la librería LeRobot en formato safetensors, con 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB. Emplea un tamaño de chunk de acciones de 100 y ensamblado temporal habilitado (`temporal_ensemble_coeff: 0.01`, `n_action_steps: 1`) para suavizar el movimiento continuo del brazo robótico.

Su relevancia es acotada y práctica: sirve como referencia reproducible de un entrenamiento ACT sobre un dataset propio para una tarea de manipulación concreta, útil para quienes trabajan con SO-101 y quieran replicar o comparar políticas de imitación. No dispone de métricas de rendimiento publicadas ni de licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación que predice bloques de acciones futuras en lugar de acciones individuales. En este checkpoint el tamaño de chunk es de 100 acciones, con ensamblado temporal activado (`temporal_ensemble_coeff: 0.01`) y un único paso de acción por inferencia (`n_action_steps: 1`), lo que produce un movimiento continuo y suavizado al promediar predicciones solapadas.

El entrenamiento se realizó con LeRobot sobre el dataset `Sunraku02/F__20261118_143636`, orientado a la tarea `pick_cude_up` con un manipulador SO-101 de 6 grados de libertad. El checkpoint corresponde al paso 7.000. No se dispone de información sobre número de episodios, composición del dataset, aumentos de datos ni técnicas de regularización empleadas.

## Capacidades

- Control motor de un manipulador SO-101 de 6 grados de libertad para la tarea de recoger un cubo.
- Generación de chunks de 100 acciones con ensamblado temporal para movimiento continuo.
- Aprendizaje por imitación a partir de demostraciones (no refuerzo).
- Inferencia integrada en el ecosistema LeRobot mediante `ACTPolicy.from_pretrained`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- Sin capacidades multilingües, de visión general, audio ni modo de razonamiento.

## Casos de uso

- Recogida de cubos con SO-101: el modelo ejecuta directamente la política entrenada para la tarea `pick_cude_up`, adecuada para demostraciones de manipulación en laboratorio.
- Reproducción de experimentos de imitación: sirve como checkpoint de referencia para comparar configuraciones ACT (chunk size, ensamblado temporal) sobre el mismo robot.
- Base para fine-tuning: al ser un checkpoint LeRobot, puede reentrenarse sobre datasets propios del SO-101 para tareas de pick-and-place relacionadas.
- Evaluación de pipelines LeRobot: útil para validar la integración de `ACTPolicy` en flujos de despliegue sobre hardware real o simulado.
- Docencia y prototipado en robótica: ejemplo ligero (0,2 GB) para ilustrar el ciclo completo de entrenamiento e inferencia de una política ACT.
- Pruebas de ensamblado temporal: permite estudiar el efecto de `temporal_ensemble_coeff` y `n_action_steps` en la suavidad del movimiento del brazo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 51,7 M de parámetros el modelo es muy ligero y previsiblemente cabe en GPUs de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada explícitamente; el tamaño del checkpoint (0,2 GB) sugiere que es viable en hardware modesto.
- Opciones de despliegue: LeRobot (`lerobot.policies.act.modeling_act.ACTPolicy`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sunraku02/so101-act-cube-7000 | ACT | 51.668.614 | Pick cube (SO-101) | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | ACT | no disponible | Manipulación genérica | según repositorio | Hugging Face / GitHub |
| Otros checkpoints SO-101 de la comunidad | no disponible | no disponible | Tareas de manipulación | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo específico de una única tarea (`pick_cude_up`) y un único robot (SO-101); no generaliza a otras tareas ni plataformas sin reentrenamiento.
- Sin licencia declarada: el uso comercial queda sin marco legal explícito y debe consultarse con el autor.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de la tasa de acierto de la política.
- Riesgo de sobreajuste al dataset de demostración; el comportamiento fuera de la distribución de entrenamiento no está caracterizado.
- Sin información sobre sesgos, aunque al ser un modelo robótico los sesgos relevantes serían los del dataset de demostraciones (condiciones de iluminación, posiciones de objeto, etc.).
- No apto para tareas de lenguaje, visión general ni razonamiento simbólico.
- El identificador de tarea contiene una errata (`pick_cude_up`), lo que puede causar confusión en integraciones que dependan del nombre exacto.

## Enlaces

- Hugging Face: https://huggingface.co/Sunraku02/so101-act-cube-7000
- Dataset de entrenamiento: https://huggingface.co/datasets/Sunraku02/F__20261118_143636
- LeRobot (GitHub): https://github.com/huggingface/lerobot
