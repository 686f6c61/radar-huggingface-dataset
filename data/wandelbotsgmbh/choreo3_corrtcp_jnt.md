# wandelbotsgmbh/choreo3_corrtcp_jnt

## Resumen

El modelo `wandelbotsgmbh/choreo3_corrtcp_jnt` es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales. Ha sido desarrollado por Wandelbots GmbH, empresa especializada en automatización industrial de robots, y entrenado con el framework LeRobot de Hugging Face sobre el dataset `spereera02/choreo3_corrtcp_jnt`, que contiene demostraciones teleoperadas de movimientos de robot.

El modelo resuelve el problema de control de un robot mediante imitación directa de demostraciones humanas, permitiendo que un brazo robótico reproduzca trayectorias complejas sin necesidad de programación explícita. Con 51,6 millones de parámetros, es una política compacta que puede ejecutarse en hardware modesto. Su relevancia actual radica en que ACT es uno de los métodos de imitación más utilizados en robótica de manipulación, con altas tasas de éxito en tareas de precisión.

La arquitectura combina un codificador de visión con un transformador que genera acciones en chunks, y el modelo está disponible bajo licencia Apache 2.0, lo que facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.617.415 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende de la tarea de control) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (modelo de control robotico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que utiliza un transformador para predecir una secuencia de acciones futuras (chunk) en lugar de una sola accion. La arquitectura tipica incluye un codificador de imagenes (generalmente ResNet) que procesa observaciones visuales del entorno, y un decodificador transformador que genera las acciones del robot. El entrenamiento se realiza mediante comportamiento clonado sobre datos teleoperados, sin necesidad de refuerzo ni funciones de recompensa explicitas.

El modelo fue entrenado con el framework LeRobot, que gestiona el dataset, el entrenamiento y la evaluacion. El dataset `spereera02/choreo3_corrtcp_jnt` contiene demostraciones de movimientos conjuntos (joint positions) de un robot, probablemente un brazo tipo SO-100 o similar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como aumento de datos o regularizacion. La innovacion principal de ACT es su capacidad para predecir chunks de acciones, lo que reduce la acumulacion de errores y mejora la precision en tareas de manipulacion.

## Capacidades

- Control de robot por imitacion: reproduce trayectorias de articulaciones aprendidas de demostraciones teleoperadas.
- Generacion de acciones en chunks: predice secuencias de acciones de longitud fija, lo que mejora la estabilidad del movimiento.
- Procesamiento de observaciones visuales: utiliza imagenes como entrada para decidir las acciones (si el dataset incluye vision).
- Ejecucion en tiempo real: al ser un modelo pequeno (51M parametros), puede ejecutarse en hardware embebido o GPUs de gama baja.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento y evaluacion de Hugging Face para robotica.
- No soporta tool calling, agentes ni razonamiento multimodal general: es un modelo especializado en control motor, no un LLM.

## Casos de uso

- Automatizacion de tareas repetitivas en fabricacion: el modelo puede reproducir movimientos de ensamblaje o pick-and-place aprendidos de un operario, reduciendo el tiempo de programacion.
- Teleoperacion asistida: un operador demuestra una tarea una vez y el modelo la reproduce de forma autonoma, util en entornos peligrosos.
- Prototipado rapido de celdas robotizadas: permite probar nuevas tareas sin escribir codigo de control, simplemente grabando demostraciones.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para experimentos con ACT en nuevos datasets o robots.
- Educacion en robotica: facilita la ensenanza de conceptos de aprendizaje por imitacion con un modelo pequeno y facil de entrenar.
- Control de brazos colaborativos (cobots): integrable en sistemas de control de robots SO-100 u otros compatibles con LeRobot para tareas de manipulacion ligera.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de tasas de exito, precision de trayectorias ni comparaciones con otros metodos en el repositorio del modelo. Para evaluar su rendimiento, se recomienda ejecutar el pipeline de evaluacion de LeRobot con el robot objetivo y medir la tasa de exito en las tareas deseadas.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 51M parametros, la inferencia requiere menos de 1 GB de VRAM en precision FP32. Con cuantizacion a FP16 o INT8, podria ejecutarse en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1050 Ti, Jetson Nano, Raspberry Pi con acelerador) es suficiente. Para entrenamiento, se recomienda una GPU con 8 GB o mas (RTX 2070, RTX 3060, A100).
- Compatibilidad con consumer GPU: si, cabe en practicamente cualquier GPU moderna.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia. Tambien puede exportarse a ONNX o TensorRT para despliegue en edge.
- Latencia y throughput: no disponible, pero al ser un modelo pequeno, la latencia esperada es de milisegundos en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wandelbotsgmbh/choreo3_corrtcp_jnt | 51,6M | ACT | no disponible | Apache 2.0 | Hugging Face |
| wandelbotsgmbh/choreo3_finetune1 | no disponible | ACT | no disponible | Apache 2.0 | Hugging Face |
| Otros modelos ACT en LeRobot Hub | variable | ACT | no disponible | Apache 2.0 | Hugging Face |

No se dispone de informacion suficiente para comparar rendimiento con otros modelos. La comparativa se limita a la arquitectura y licencia, ya que no hay benchmarks publicados.

## Limitaciones y advertencias

- Sesgos del dataset: el modelo hereda los sesgos de las demostraciones teleoperadas, que pueden no cubrir todas las variaciones del entorno.
- Riesgo de alucinacion en acciones: en situaciones no vistas, el modelo puede generar movimientos incorrectos o inseguros. Es necesario implementar supervision de seguridad en produccion.
- Limitaciones de generalizacion: al ser un modelo de imitacion, no generaliza bien a cambios en la posicion de objetos, iluminacion o configuracion del robot.
- Sin soporte para tareas fuera del dominio: no puede manejar lenguaje natural, vision general ni razonamiento simbolico.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset `spereera02/choreo3_corrtcp_jnt` puede tener sus propias restricciones; verificar su licencia antes de usar.
- Dependencia del robot: el modelo esta entrenado para un robot especifico (probablemente SO-100); usarlo en otro hardware requiere reentrenamiento o adaptacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wandelbotsgmbh/choreo3_corrtcp_jnt
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
- Perfil de Wandelbots en Hugging Face: https://huggingface.co/datasets/wandelbotsgmbh
- GitHub de Wandelbots: https://github.com/wandelbotsgmbh
- Web de Wandelbots: https://www.wandelbots.com/
