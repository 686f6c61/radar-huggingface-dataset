# Wolvered/smolvla_aloha_insertion

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, disenado para controlar robots manipuladores a partir de observaciones visuales y del estado de las articulaciones. Esta ficha concreta, `Wolvered/smolvla_aloha_insertion`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre el dataset simulado `lerobot/aloha_sim_insertion_human`, y esta especializada en una unica tarea: insertar una clavija en un orificio (peg insertion) con el robot ALOHA en simulacion.

El modelo resuelve el problema de generar politicas de control roboticas de forma economica: con 450 millones de parametros y un repositorio de 10,6 GB, esta pensado para ejecutarse en hardware de consumo, a diferencia de los VLA de gran escala que requieren clusters de GPU. La arquitectura combina un codificador visual, un modelo de lenguaje pequeno y un decodificador de acciones, siguiendo el paradigma de los modelos vision-lenguaje-accion.

Es relevante ahora porque demuestra el flujo completo de LeRobot: partir de un modelo base preentrenado, hacer fine-tuning con datos de demostracion humana y desplegar la politica resultante con el comando `lerobot-rollout`. No obstante, se trata de un artefacto experimental sin evaluacion publicada ni descargas, por lo que debe tratarse como material de referencia y no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA: codificador visual + modelo de lenguaje + decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica; las instrucciones de tarea son en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo vision-lenguaje-accion compacto que procesa observaciones multimodales (imagenes de camaras y estado de las articulaciones) y emite directamente un vector de acciones. En esta politica concreta, las entradas son `observation.state` con forma `(6,)` y tres imagenes de camara de `(3, 256, 256)` cada una, mientras que la salida es un vector `action` de forma `(14,)`, correspondiente a los 14 grados de libertad del robot ALOHA. El modelo parte del checkpoint preentrenado `lerobot/smolvla_base` y se ajusta mediante imitacion supervisada.

El entrenamiento se realizo sobre el dataset `lerobot/aloha_sim_insertion_human`, compuesto por 50 episodios y 25.000 fotogramas a 50 FPS, con la unica tarea "Insert the peg into the socket." La configuracion reportada incluye 10.000 pasos de entrenamiento, batch de 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000, usando LeRobot 0.6.2. No se documentan tecnicas de RLHF, DPO ni innovaciones adicionales de decodificacion en la informacion disponible.

## Capacidades

- Generacion de acciones de control roboticas a partir de imagenes y estado de articulaciones, especificamente para insercion de clavija en simulacion ALOHA.
- Percepcion visual multi-camara: consume tres flujos de imagen de 256x256.
- Condicionamiento por instruccion de tarea en lenguaje natural (la cadena "Insert the peg into the socket.").
- Ejecucion de politicas de imitacion entrenadas con LeRobot mediante `lerobot-rollout`.
- Fine-tuning adicional sobre nuevos datasets con `lerobot-train`.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Modo thinking, vision generativa o audio: no disponibles.

## Casos de uso

- Investigacion en imitacion robotica: sirve como punto de partida reproducible para estudiar el fine-tuning de SmolVLA sobre tareas de manipulacion simulada, ya que toda la configuracion de entrenamiento esta documentada.
- Validacion de pipelines LeRobot: permite probar el flujo completo `lerobot-train` y `lerobot-rollout` con un checkpoint real antes de invertir en datos propios.
- Benchmark de referencia para tareas de insercion: puede usarse como linea base en entornos simulados ALOHA para comparar nuevas politicas de peg insertion.
- Docencia y formacion: ejemplo didactico de un VLA de 450 millones de parametros que cabe en hardware de consumo y demuestra el ciclo observacion-accion.
- Pruebas de sim2real preliminares: aunque entrenado en simulacion, el checkpoint puede emplearse para explorar la transferencia a un ALOHA fisico con la misma configuracion de camaras y articulaciones.
- Desarrollo de entornos de evaluacion: util para construir harnesses de evaluacion de politicas roboticas con tareas y metricas de exito bien definidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que aun no se han proporcionado resultados de evaluacion para esta politica.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 millones de parametros en safetensors, la huella en memoria es del orden de 1-2 GB en precision completa, aunque el repositorio ocupa 10,6 GB por incluir multiples artefactos.
- GPU recomendadas: no especificadas; SmolVLA se presenta como desplegable en hardware de consumo.
- Cabe en GPU de consumo: si, segun la descripcion del modelo base, aunque no se detalla el modelo concreto.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wolvered/smolvla_aloha_insertion | 450 M | No disponible | Insercion ALOHA simulada | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | No disponible | No disponible | VLA general preentrenado | Apache 2.0 | Hugging Face |
| Otros VLA de gran escala (p. ej. OpenVLA) | No disponible en la informacion | No disponible | Manipulacion general | No disponible | No disponible |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado en una unica tarea ("Insert the peg into the socket.") y en un unico robot (ALOHA); no generaliza a otras tareas sin reentrenamiento.
- Entrenado exclusivamente en simulacion (`aloha_sim_insertion_human`); el rendimiento en robot fisico no esta validado.
- Sin resultados de evaluacion publicados: no hay tasas de exito que permitan juzgar su calidad.
- Cero descargas y cero likes en el momento de la consulta; sin validacion por parte de la comunidad.
- Riesgo de sobreajuste a la configuracion exacta de camaras y articulaciones del dataset (tres camaras, estado de 6 dimensiones, accion de 14 dimensiones).
- Sesgos y alucinaciones en el sentido de los modelos de lenguaje no aplican directamente, pero si el riesgo de acciones erroneas o inseguras en entornos fisicos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluacion desaconseja su uso en produccion sin validacion propia.
- Idiomas soportados no documentados; las instrucciones de tarea estan en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wolvered/smolvla_aloha_insertion
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_insertion_human
