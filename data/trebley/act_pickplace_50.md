# TrebleY/act_pickplace_50

## Resumen

act_pickplace_50 es un modelo de politica robotica (policy) entrenado con el framework LeRobot de HuggingFace para la tarea de pick-and-place (recoger y colocar objetos). Desarrollado por TrebleY (Yiyao Yang), emplea la arquitectura ACT (Action Chunking with Transformers), una tecnica de aprendizaje por imitacion que predice secuencias de 100 acciones a partir de observaciones visuales y proprioceptivas. Con 51,6 millones de parametros, integra un backbone visual ResNet18 y un transformer con dimension de modelo 512.

El modelo fue entrenado sobre el dataset TrebleY/pickplace_50_20260902_213020, que contiene 50 episodios de demostracion con 20.981 frames en total. El entrenamiento se completo en aproximadamente 2,6 horas con 10.000 pasos, batch size de 32 y optimizador AdamW, alcanzando una perdida final de 0,174. Su relevancia radica en demostrar un pipeline completo y reproducible de entrenamiento de politicas visuomotoras con LeRobot, accesible para la comunidad gracias a su licencia Apache 2.0 y su tamaño reducido que permite ejecucion en hardware de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet18 |
| Parametros totales | 51.668.614 (51,6M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica (modelo de robotica; chunk size de 100 pasos de accion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una arquitectura de aprendizaje por imitacion propuesta por Zhao et al. en 2023 para control robotico. Combina un encoder-decoder transformer con una estructura CVAE (Conditional Variational Autoencoder): el encoder procesa las observaciones (imagenes de camara y estado del robot) junto con una variable latente muestreada, y el decoder autoregresivo predice un "chunk" de 100 acciones consecutivas. Este enfoque de chunking reduce la acumulacion de errores y produce trayectorias mas suaves que la prediccion de acciones individuales.

El backbone visual es un ResNet18 que extrae caracteristicas de las imagenes de las camaras, y la dimension interna del transformer es 512. El entrenamiento se realizo con LeRobot durante 10.000 pasos con batch size de 32, optimizador AdamW y learning rate efectivo de 1e-5. Las metricas finales fueron: perdida total de 0,174, perdida L1 de 0,158 y perdida KLD de 0,002. El dataset de entrenamiento contiene 50 episodios y 20.981 frames, con transformaciones de imagen habilitadas durante el entrenamiento para mejorar la robustez.

## Capacidades

- Ejecucion de tareas de pick-and-place: el modelo aprende a recoger un objeto y colocarlo en una posicion objetivo a partir de demostraciones humanas.
- Control visuomotor: combina informacion visual (imagenes procesadas por ResNet18) con el estado del robot para generar comandos de actuacion.
- Prediccion de acciones por chunking: genera bloques de 100 pasos de accion, lo que permite una ejecucion coherente y suave en el tiempo.
- Aprendizaje por imitacion: no requiere ingenieria de recompensas ni simulacion; aprende directamente de demostraciones grabadas.
- Integracion con LeRobot: compatible con la API estandar de HuggingFace para robotica, permitiendo carga y despliegue con `ACTPolicy.from_pretrained()`.
- No soporta procesamiento de lenguaje, generacion de codigo, vision generalista ni tool calling: es un modelo de politica especifico para robotica.

## Casos de uso

- Automatizacion de pick-and-place en celulas de trabajo: el modelo puede integrarse en un brazo robotico para recoger piezas de una posicion fija y depositarlas en un destino, por ejemplo en lineas de ensamblaje sencillas o bancos de pruebas.
- Prototipado rapido de politicas robotica: al estar entrenado con LeRobot, los desarrolladores pueden cargar el modelo con `ACTPolicy.from_pretrained("TrebleY/act_pickplace_50")` y desplegarlo en un robot compatible sin reentrenar desde cero.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar el efecto del chunk size, la arquitectura ACT o el tamaño del dataset en el rendimiento de politicas visuomotoras.
- Fine-tuning sobre nuevos escenarios: con solo 51,6M de parametros, el modelo puede ajustarse con pocas demostraciones adicionales para adaptarlo a variantes de la tarea (diferentes objetos, posiciones o iluminacion).
- Educacion y formacion en robotica: permite a estudiantes y desarrolladores experimentar con politicas entrenadas por imitacion sin necesidad de infraestructura de alto coste, usando GPUs de consumo.
- Benchmarking de frameworks de robotica: el modelo y su dataset asociado pueden usarse para comparar el rendimiento de LeRobot frente a otros frameworks de aprendizaje por imitacion en tareas estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento: perdida final de 0,174, perdida L1 de 0,158 y perdida KLD de 0,002. No se proporcionan metricas de exito en entorno fisico, simulacion ni tasas de exito en la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6M de parametros y un backbone ResNet18, la inferencia en FP32 requiere aproximadamente 0,5-1 GB de VRAM. En FP16, la huella se reduce a unos 0,3-0,5 GB. Estas cifras son estimaciones basadas en el tamaño del modelo; no hay mediciones publicadas.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM es suficiente (GTX 1650, RTX 3060, RTX 4090, etc.). Para entrenamiento, el autor completo el proceso en ~2,6 horas, presumiblemente en una GPU de gama media.
- Compatibilidad con GPU de consumo: si, el modelo cabe ampliamente en GPUs de consumo. La inferencia tambien es viable en CPU, aunque con mayor latencia.
- Opciones de despliegue: LeRobot es el framework principal. El modelo puede ejecutarse con la API de LeRobot, que soporta inferencia en tiempo real sobre robots compatibles (SO-100, Fisheye, etc.). No hay soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño del modelo y el chunk de 100 acciones, la inferencia por paso deberia ser del orden de milisegundos en GPU, pero no hay datos confirmados.

## Comparativa con modelos similares

No hay suficiente informacion publica sobre modelos comparables para realizar una comparativa rigurosa. Se ha identificado el modelo `a0loshi1/act_pickplace_cube` en HuggingFace, que tambien emplea la arquitectura ACT para una tarea de pick-and-place, pero no se dispone de sus especificaciones detalladas. Ambos modelos comparten el uso de LeRobot y la licencia Apache 2.0, pero no se pueden comparar metricas de rendimiento sin datos publicados.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea de pick-and-place sobre el dataset especifico `TrebleY/pickplace_50_20260902_213020`. No generalizara a otras tareas o entornos sin fine-tuning.
- La generalizacion a nuevas posiciones, objetos, condiciones de iluminacion o configuraciones de camara no esta garantizada; el rendimiento depende de la diversidad del dataset de demostraciones (50 episodios, un numero limitado).
- No se han publicado evaluaciones en entornos fisicos reales ni en simulacion; solo se reportan metricas de perdida de entrenamiento. El rendimiento real en robot es desconocido.
- El modelo no procesa lenguaje, no tiene capacidades de razonamiento general ni vision generalista; su unica funcion es generar acciones de control robotico.
- Aunque la licencia Apache 2.0 permite uso comercial, el usuario debe verificar que el dataset de entrenamiento no tenga restricciones adicionales de uso o redistribucion.
- Los pesos estan disponibles unicamente en formato safetensors; no hay versiones cuantizadas (GGUF, ONNX, TensorRT) publicadas.
- El modelo fue creado en septiembre de 2026; su mantenimiento y soporte dependen del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TrebleY/act_pickplace_50
- Dataset de entrenamiento: https://huggingface.co/datasets/TrebleY/pickplace_50_20260902_213020
- Perfil del autor: https://huggingface.co/TrebleY
- Datasets del autor: https://huggingface.co/TrebleY/datasets
- Framework LeRobot: https://huggingface.co/lerobot
- Modelo relacionado (a0loshi1/act_pickplace_cube): https://huggingface.co/a0loshi1/act_pickplace_cube
