# thanhnguyen23/unbox_rdk_policy_2

## Resumen

unbox_rdk_policy_2 es una politica de imitacion (imitation learning) basada en ACT (Action Chunking with Transformers) publicada por el usuario thanhnguyen23 en Hugging Face. No es un modelo de lenguaje ni un modelo generativo de proposito general: es una politica visomotora que traduce observaciones visuales y de estado de un robot en comandos de accion de 7 dimensiones. Concretamente, se ha entrenado para un brazo robotico de tipo agilex y resuelve la tarea "abrir la caja RDK, extraer la placa y colocarla encima de la caja".

El modelo tiene 51.670.663 parametros (unos 0,2 GB en safetensors) y sigue la arquitectura ACT descrita en el articulo arXiv:2304.13705, que predice fragmentos (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulacion y mejora la estabilidad del control. Se ha entrenado con LeRobot 0.6.2 a partir de un unico dataset de demostraciones teleoperadas de 69 episodios y 56.620 fotogramas a 30 FPS.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitacion en robotica real (grabacion de datos, entrenamiento, publicacion en el Hub y despliegue con `lerobot-rollout`). Es un artefacto de investigacion/experimentacion, no un componente listo para produccion general, dado que no se han publicado resultados de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers); transformer con CVAE para imitacion |
| Parametros totales | 51.670.663 |
| Parametros activos | no aplicable (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (no aplica: politica de imitacion; opera sobre observaciones por fotograma) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable (modelo de robotica, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,2 GB, libreria lerobot) |

Especificaciones de entrada/salida:

| Elemento | Tipo | Forma |
|---|---|---|
| `observation.images.cam_side` | VISUAL | (3, 480, 640) |
| `observation.images.cam_wrist` | VISUAL | (3, 480, 640) |
| `observation.state` | STATE | (7,) |
| `observation.eef_pose` | STATE | (7,) |
| `action` (salida) | ACTION | (7,) |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice chunks de acciones de corta duracion en lugar de un unico paso, lo que mitiga el sesgo de acumulacion de error tipico del control paso a paso. Internamente combina un transformer con un autoencoder variacional condicional (CVAE) que modela la variabilidad de las demostraciones humanas teleoperadas; la politica consume dos flujos de imagen (camara lateral y camara de muneca) y vectores de estado y pose del efector final, y emite un vector de accion de 7 dimensiones. La informacion disponible no detalla la configuracion exacta de capas, el tamano de chunk ni el backbone visual, por lo que esos datos quedan como no disponibles.

El entrenamiento se realizo con LeRobot 0.6.2 durante 20.000 pasos, con batch size de 8, optimizador AdamW, learning rate de 1e-05 y semilla 1000. Los datos proceden del dataset thanhnguyen23/unbox_rdk_2: 69 episodios, 56.620 fotogramas grabados a 30 FPS, correspondientes a la tarea de abrir la caja RDK, extraer la placa y colocarla encima. No se documenta el uso de RLHF, DPO ni fases de refinamiento posteriores, algo esperable en un pipeline de imitacion supervisada. Tampoco se especifican aumentos de datos, composicion exacta de las demostraciones ni tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Control visomotor: genera comandos de accion de 7 dimensiones a partir de dos imagenes (480x640) y vectores de estado y pose del efector final.
- Percepcion multimodal de baja complejidad: fusiona vision (camara lateral y de muneca) con estado proprioceptivo del robot.
- Manipulacion robotica de una tarea concreta: abrir la caja RDK, extraer la placa y depositarla sobre la caja.
- Ejecucion autonoma de politicas entrenadas mediante `lerobot-rollout` en hardware agilex.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta razonamiento multi-paso en el sentido de agentes basados en LLM; su "razonamiento" es puramente reactivo sobre el estado actual.
- No tiene capacidades multilingues ni de generacion de texto, codigo, matematicas, vision general, audio o thinking mode.

## Casos de uso

- Automatizacion de tareas de desempaquetado en linea de montaje: el modelo ejecuta la secuencia de abrir una caja, extraer una placa y colocarla encima, lo que encaja en puestos de trabajo repetitivos de picking y colocacion. Es adecuado solo si el entorno reproduce las condiciones de entrenamiento (posiciones, iluminacion, objeto).
- Banco de pruebas para aprendizaje por imitacion: sirve como referencia reproducible para comparar metodos ACT frente a otras politicas de LeRobot (por ejemplo, Diffusion Policy) en una tarea identica y con un dataset publico de 69 episodios.
- Base para fine-tuning en tareas de manipulacion similares: al ser un modelo denso de 51 millones de parametros, se puede reentrenar con un dataset propio para tareas de extraccion y colocacion de objetos rigidos.
- Validacion de pipelines de grabacion y despliegue con LeRobot: permite verificar de extremo a extremo el flujo `lerobot-train` y `lerobot-rollout`, incluyendo calibracion de camaras y mapeo de nombres de observacion.
- Prototipado de celulas robotizadas de bajo coste: el modelo cabe en una GPU de gama media o incluso en hardware embebido, lo que facilita desplegarlo en un robot agilex de laboratorio.
- Recoleccion de demostraciones asistida: se puede usar como politica inicial que un operador corrige, generando nuevos datos para iterar el entrenamiento (aprendizaje por imitacion iterativo).
- Investigacion sobre robustez ante cambios de dominio: al no existir evaluacion publicada, sirve para estudiar como varia la tasa de exito al modificar posiciones, iluminacion o distractores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la frase "No evaluation results have been provided for this policy yet", por lo que no hay tasas de exito en robot real, numero de ensayos ni metricas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: del orden de 1 a 2 GB en precision completa (fp32), cifra coherente con un modelo de 51,67 millones de parametros (unos 207 MB de pesos) mas las activaciones de las dos imagenes de 480x640 y el backbone visual. Es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU CUDA con al menos 4 GB de memoria, por ejemplo RTX 3060, RTX 4060, RTX 4090. Para despliegue embebido, plataformas tipo NVIDIA Jetson son viables dado el tamano reducido del modelo.
- Cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU dedicada moderna e incluso en equipos con 4 GB de VRAM.
- Opciones de despliegue: el flujo oficial es la libreria LeRobot, con el comando `lerobot-rollout` (por ejemplo `--strategy.type=base`, `--robot.type=agilex`, `--policy.path=thanhnguyen23/unbox_rdk_policy_2`). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de politica.
- Latencia y throughput: la tarea se grabo a 30 FPS, lo que implica un objetivo de unos 33 ms por paso de control; no se publican medidas reales de latencia ni de throughput.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos numericos de modelos alternativos, por lo que la comparacion es necesariamente parcial. Se listan politicas de la misma categoria (aprendizaje por imitacion en robotica real dentro del ecosistema LeRobot):

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| unbox_rdk_policy_2 (ACT) | 51.670.663 | no disponible | apache-2.0 | Hub de Hugging Face |
| Diffusion Policy | no disponible | no disponible | no disponible | implementacion en LeRobot |
| SmolVLA | no disponible | no disponible | no disponible | Hub de Hugging Face / LeRobot |

Diferencia cualitativa: ACT predice chunks de acciones con un transformer y CVAE, mientras que Diffusion Policy modela la distribucion de acciones mediante difusion. Se trata de enfoques distintos de imitacion; no hay datos de rendimiento comparativo en la informacion disponible. Los campos marcados como no disponibles no deben interpretarse como valores concretos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 69 episodios de una unica tarea y un unico montaje, la politica aprende las condiciones especificas de esas demostraciones (posiciones, iluminacion, objeto y robot concretos). No se documentan sesgos adicionales.
- Riesgo de alucinacion: no aplica en el sentido de modelos de lenguaje; el fallo equivalente es la ejecucion de acciones incorrectas o fuera de distribucion cuando el entorno cambia.
- Limitaciones de contexto o idioma: no aplica idioma; la limitacion relevante es que no dispone de memoria de contexto y trabaja de forma reactiva sobre observaciones por fotograma.
- Restricciones de licencia: la licencia apache-2.0 permite uso comercial, pero el modelo depende del dataset thanhnguyen23/unbox_rdk_2, cuya licencia no se especifica en la informacion disponible y conviene verificar antes de un uso comercial.
- Ausencia de evaluacion: no hay tasa de exito publicada, por lo que cualquier afirmacion de rendimiento en produccion seria no verificada.
- Dependencia de configuracion: los nombres de camara (`cam_side`, `cam_wrist`) deben coincidir exactamente con las claves de observacion de entrenamiento; un mapeo distinto invalida la inferencia.
- Sin versionado de robustez: no se indica tolerancia a nuevos objetos, distractores ni a un robot distinto del mismo tipo, factores que suelen degradar la tasa de exito en politicas de imitacion.
- Artefacto reciente y sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin garantias de mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanhnguyen23/unbox_rdk_policy_2
- Dataset de entrenamiento: https://huggingface.co/datasets/thanhnguyen23/unbox_rdk_2
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=thanhnguyen23/unbox_rdk_2
- Articulo de ACT (arXiv:2304.13705): https://huggingface.co/papers/2304.13705
- LeRobot (repositorio): https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Flujo de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
