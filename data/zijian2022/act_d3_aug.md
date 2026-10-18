# zijian2022/act_d3_aug

## Resumen

`zijian2022/act_d3_aug` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), publicado en el artículo arXiv 2304.13705, y empaquetada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de imitación que, a partir de observaciones visuales y del estado de las articulaciones, predice trozos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error acumulado en tareas de manipulación fina.

El checkpoint tiene 51.609.223 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la liga de políticas ligeras ejecutables en hardware de consumo. Según los metadatos, se ha entrenado sobre el dataset `zijian2022/fanuc_er4ia_stack_red_on_blue_d3_fixed4_dr`, cuyo nombre sugiere una tarea de apilado de un objeto rojo sobre uno azul con un brazo Fanuc ER4iA, con variantes de *domain randomization* (`dr`) y una configuración de cámara fija (`fixed4`). Esta descripción se deduce del identificador del dataset, no de documentación explícita.

Su relevancia es acotada pero clara para quien trabaja en aprendizaje por imitación: es un ejemplo reproducible de extremo a extremo (entrenamiento y evaluación con los comandos `lerobot-train` y `lerobot-record`), con licencia Apache 2.0 y pesos en safetensors. Con 0 descargas y 1 *like* en el momento de la consulta, carece de validación por parte de la comunidad y no se han publicado métricas de éxito.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): política de imitación basada en transformer que predice secuencias de acciones |
| Parametros totales | 51.609.223 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de un LLM (la ventana de observación la define la configuración de la política) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible; no aplica (modelo de robótica, sin entrada ni salida de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | robotics |
| Libreria | lerobot |
| Dataset de entrenamiento | zijian2022/fanuc_er4ia_stack_red_on_blue_d3_fixed4_dr |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un *backbone* visual con un transformer encoder-decoder y condiciona la predicción en un vector latente de estilo (formulación tipo CVAE), de modo que el modelo puede representar la variabilidad de las demostraciones humanas. La innovación central descrita en el artículo es la predicción de *action chunks*: en lugar de emitir una única acción por paso, el transformer genera una secuencia corta de acciones que se ejecutan de forma abierta en el bucle de control, lo que suaviza la trayectoria y reduce el error compuesto. Los detalles concretos de esta instancia (tamaño de chunk, resolución de imagen, número de cámaras, hiperparámetros de entrenamiento) no están disponibles en la información proporcionada.

El entrenamiento se realizó con LeRobot a partir de un dataset de teleoperación. No se documenta el número de episodios, de tokens ni de pasos de entrenamiento, ni si se aplicaron etapas de ajuste adicionales. El sufijo `aug` del nombre del checkpoint y el sufijo `dr` del dataset apuntan a aumento de datos o aleatorización de dominio durante la recogida o el entrenamiento, pero no hay confirmación explícita en la model card.

## Capacidades

- Control de manipulación robótica mediante imitación: genera secuencias de acciones articulares a partir de observaciones visuales y de estado.
- Predicción por *action chunks*: emite bloques de acciones en lugar de pasos sueltos, lo que mejora la estabilidad del bucle de control.
- Aprendizaje de una tarea única y específica: apilado de un objeto rojo sobre uno azul con un brazo Fanuc ER4iA, según se deduce del identificador del dataset.
- Integración con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación/ejecución con `lerobot-record`.
- Compatibilidad con robots del ecosistema LeRobot (el ejemplo de la model card usa `so100_follower` como plantilla de evaluación; no se confirma que sea el robot de este checkpoint).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües, visión general, audio o modo *thinking*: no disponibles; el modelo no procesa lenguaje.

## Casos de uso

- Apilado automatizado de piezas en célula de fabricación: el modelo ejecuta la política entrenada para colocar un objeto rojo sobre uno azul, integrado en el bucle de control del brazo Fanuc ER4iA con el que se recogieron los datos.
- Base de partida para *fine-tuning* en una tarea de pick-and-place similar: al ser un checkpoint ACT ligero (51,6 M de parámetros), sirve como inicialización para un dataset propio con el mismo esquema de cámaras.
- Referencia reproducible de aprendizaje por imitación: útil en docencia o investigación para validar un *pipeline* completo de LeRobot (grabación de demostraciones, entrenamiento y evaluación con `lerobot-record`) sin grandes requisitos de cómputo.
- Pruebas de robustez frente a cambios de iluminación y posición: el sufijo `dr` del dataset sugiere variabilidad de dominio, lo que permite evaluar la degradación de la política al alterar las condiciones de la escena.
- Evaluación comparativa de métodos de imitación: sirve como línea base ACT frente a políticas de difusión u otros métodos sobre la misma tarea y el mismo conjunto de demostraciones.
- Prototipado en laboratorio con GPU de consumo: al ocupar ~0,2 GB en pesos, se puede ejecutar en una estación de trabajo modesta junto al *stack* de percepción y control.
- Automatización de una celda de demostración en ferias o entornos controlados: tarea acotada, escena fija y cámara fija, condiciones para las que fue entrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, número de episodios de evaluación ni comparaciones con otras políticas, y el repositorio registra 0 descargas y 1 *like*, por lo que tampoco existen informes externos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan aproximadamente 0,2 GB (51,6 M de parámetros); con activaciones, *buffers* de imagen y el resto del *stack* de control, una estimación prudente sitúa el consumo en el rango de 1 a 2 GB en precisión de 32 bits. Es una estimación propia a partir del tamaño de los pesos, no un dato publicado.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); también A100/H100 si se comparte con otros procesos, aunque están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, con margen amplio; incluso es viable la inferencia en CPU, a costa de una frecuencia de control mucho menor.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), PyTorch con CUDA como backend; exportación a ONNX o TorchScript no está documentada. vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. No se publica la frecuencia de control alcanzada ni el tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zijian2022/act_d3_aug | ACT (imitacion, chunking) | 51.609.223 | no disponible | Apache 2.0 | Hugging Face |
| Otros checkpoints ACT publicados con LeRobot | ACT (imitacion, chunking) | variable segun checkpoint | no disponible | generalmente Apache 2.0 | Hugging Face |
| Diffusion Policy (Chi et al., 2023) | Imitacion generativa por difusion | no disponible | no disponible | no disponible | Implementaciones publicas en repos de investigacion |
| SmolVLA y otras políticas VLA del ecosistema LeRobot | VLA (vision-lenguaje-accion) | no disponible | no disponible | no disponible | Hugging Face / LeRobot |

Las diferencias metodológicas son claras: ACT predice *chunks* de acción con un transformer condicionado por un latente, mientras que las políticas de difusión generan trayectorias mediante un proceso de *denoising*, y los modelos VLA incorporan instrucciones en lenguaje natural. No se dispone de datos numéricos comparativos de rendimiento para esta instancia concreta, por lo que no se puede establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Tarea única: la política está entrenada para una tarea y una escena concretas (apilado rojo sobre azul con Fanuc ER4iA). No generaliza a otras tareas sin reentrenamiento.
- Sensibilidad al *setup*: cambios en la posición de la cámara, la iluminación, el fondo o el robot degradan el rendimiento, ya que el modelo aprende una correspondencia directa entre observación y acción.
- Sin métricas de éxito publicadas: no hay evidencia cuantitativa de fiabilidad, y el repositorio no tiene descargas ni validación de la comunidad.
- Riesgo de sobreajuste a las demostraciones: con un único dataset de teleoperación, la política puede reproducir sesgos del operador (trayectorias, velocidades, puntos de agarre).
- Alucinación en el sentido de lenguaje no aplica; el equivalente es la ejecución de acciones sin sentido fuera de distribución, con riesgo físico real sobre el robot y el entorno.
- Restricciones de licencia: el modelo es Apache 2.0, que permite uso comercial, pero la licencia del dataset de entrenamiento debe verificarse por separado antes de un despliegue en producción.
- Requisitos de seguridad en producción: cualquier ejecución sobre hardware real necesita límites de par, paradas de emergencia y supervisión, dado que no se documentan mecanismos de seguridad en la política.
- Idiomas: no aplica; el modelo no procesa texto ni voz, por lo que no se puede usar como asistente conversacional.
- Fecha de creación y actualización registradas en 2026-10-17, sin historial de versiones ni *changelog*.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zijian2022/act_d3_aug
- Dataset de entrenamiento: https://huggingface.co/datasets/zijian2022/fanuc_er4ia_stack_red_on_blue_d3_fixed4_dr
- Articulo ACT (arXiv 2304.13705): https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de politicas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
