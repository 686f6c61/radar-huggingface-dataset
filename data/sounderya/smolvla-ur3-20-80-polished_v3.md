# Sounderya/smolvla-ur3-20-80-polished_v3

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto de 450 millones de parametros desarrollado por Hugging Face, disenado para ejecutar politicas de manipulacion robotica en hardware de consumo. Este repositorio concreto, `smolvla-ur3-20-80-polished_v3`, es un fine-tuning de Sounderya sobre el modelo base `lerobot/smolvla_base`, entrenado con LeRobot para una tarea especifica de pick-and-place con un robot UR3: recoger una taza y colocarla sobre un plato.

El modelo procesa tres imagenes de camara (256x256) y un estado del robot de 6 dimensiones, y genera acciones de 10 dimensiones. Fue entrenado sobre un dataset propio de 120 episodios y 91.365 frames a 30 FPS, con 2.000 pasos de optimizacion. Su relevancia radica en que demuestra el flujo completo de fine-tuning de un VLA de tamano reducido (450M) para una tarea industrial concreta, con licencia Apache-2.0 y distribuido a traves del ecosistema LeRobot. El modelo se publico en agosto de 2026 y aun no cuenta con descargas ni evaluaciones publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) compacta |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de robotica, sin interfaz de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura vision-language-action compacta de 450M de parametros, descrita en el paper arxiv:2506.01844 y disenada por Hugging Face para desplegarse en hardware de consumo. La arquitectura interna concreta (numero de capas, tipo de backbone, cabezas de accion) no se detalla en la informacion disponible, pero se trata de un modelo denso que procesa entradas multimodales (vision y estado del robot) y produce acciones de control.

Este fine-tuning parte de `lerobot/smolvla_base` y fue entrenado con LeRobot 0.6.1. La configuracion de entrenamiento incluye 2.000 pasos, batch size de 64, optimizador AdamW, learning rate de 2e-05 y seed 1000. El dataset de entrenamiento, `Sounderya/mug_smolvla_dataset_v2nc`, contiene 120 episodios y 91.365 frames grabados a 30 FPS, con la tarea descrita como "Pick the mug and place it on the plate". El modelo consume tres imagenes de camara (256x256 cada una) y un vector de estado de 6 dimensiones, y produce acciones de 10 dimensiones.

## Capacidades

- Manipulacion robotica vision-language-action: procesa tres imagenes de camara (256x256) y un estado del robot de 6 dimensiones para generar acciones de 10 dimensiones.
- Tarea especifica de pick-and-place: entrenado para recoger una taza y colocarla sobre un plato, optimizado para ese escenario concreto.
- Inferencia en tiempo real: disenado para operar a 30 FPS en hardware de consumo, segun las especificaciones de SmolVLA.
- Integracion con LeRobot: compatible con el ecosistema LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- Soporte multicamara: consume tres flujos de video simultaneos (wrist, right y una tercera camara).
- No incluye capacidades de texto, vision generalista ni tool calling; es un modelo puramente de control motor.

## Casos de uso

- **Automatizacion de pick-and-place en entornos industriales**: el modelo puede controlar un robot UR3 para tareas de recogida y colocacion de piezas en lineas de ensamblaje, donde la tarea de la taza sobre el plato es un prototipo representativo.
- **Investigacion en aprendizaje por imitacion**: sirve como ejemplo completo de fine-tuning de SmolVLA con LeRobot, util para estudiar el flujo de trabajo (recogida de datos, entrenamiento, rollout) en entornos academicos.
- **Prototipado rapido de celdas roboticas**: permite a integradores validar un modelo VLA en un UR3 antes de escalar a tareas mas complejas, reduciendo costes frente a modelos de 7B o mas.
- **Educacion en robotica con hardware asequible**: al caber en GPUs de consumo, puede usarse en laboratorios docentes para ensenar control robotico basado en VLA sin infraestructura de alto coste.
- **Benchmark de rendimiento en hardware low-cost**: para investigadores que quieran comparar el rendimiento de VLA de 450M frente a alternativas mayores en tareas de manipulacion concreta.
- **Base para nuevos fine-tunings**: el modelo puede reentrenarse sobre datasets de tareas similares (otro tipo de pieza, otro robot) usando el mismo pipeline de LeRobot, aprovechando el checkpoint preentrenado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este fine-tuning concreto. La model card indica explicitamente: "No evaluation results have been provided for this policy yet". Tampoco se dispone de datos de exito en pruebas reales con el robot. El modelo base SmolVLA reporta rendimiento competitivo en tareas VLA segun el paper, pero no hay cifras desglosadas disponibles en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: no disponible. SmolVLA esta disenado para hardware de consumo, pero no se especifica la VRAM exacta para este checkpoint.
- GPUs recomendadas: no se indica un modelo concreto. La base SmolVLA se describe como ejecutable en GPUs de consumo (gama RTX 3090/4090), pero no hay confirmacion para este fine-tuning.
- Si cabe en consumer GPU: probablemente si, dado el tamano de 450M de parametros, pero no esta confirmado.
- Opciones de despliegue: via LeRobot (`lerobot-rollout`), compatible con los robots soportados por la libreria. No se mencionan vLLM, Ollama ni llama.cpp, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible. El modelo esta disenado para operar a 30 FPS segun el dataset, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (base) | 450M | No disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | No disponible | MIT | Hugging Face |
| RT-2 | 55B | No disponible | No publico | Google |

Este fine-tuning es una version especializada de SmolVLA para una tarea unica, por lo que no es directamente comparable en rendimiento general con modelos como OpenVLA o RT-2, que cubren tareas mas amplias. SmolVLA destaca por su tamano reducido frente a los 7B de OpenVLA y los 55B de RT-2, lo que lo hace mas accesible para hardware de consumo. No se dispone de datos de benchmark comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- **Especializado en una unica tarea**: el modelo solo ejecuta el pick-and-place de la taza sobre el plato; no generaliza a otras tareas sin reentrenamiento.
- **Sin evaluacion publicada**: no hay resultados de exito en robot real, por lo que su rendimiento real es desconocido.
- **Dataset reducido**: 120 episodios pueden ser insuficientes para entornos variables (iluminacion, posiciones, distractores), lo que podria limitar la robustez.
- **Dependencia de tres camaras**: el modelo requiere tres flujos de imagen sincronizados, lo que anade complejidad de hardware y calibracion.
- **Sin soporte de texto**: al ser un modelo de control motor, no ofrece capacidades de lenguaje natural ni tool calling.
- **Proyecto reciente y sin validacion comunitaria**: 0 descargas y 0 likes, sin evidencia de uso externo.
- **Licencia Apache-2.0**: permite uso comercial, pero conviene revisar la licencia de los modelos base y datasets asociados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sounderya/smolvla-ur3-20-80-polished_v3
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Repositorio del autor: https://github.com/Sounderya22/ur3_smolvla
- Documentacion LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
