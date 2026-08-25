# Sounderya/smolvla-ur3-mixed-20-80-scratch

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para control robótico con coste computacional reducido y capaz de ejecutarse en hardware de consumo. Este repositorio concreto, `Sounderya/smolvla-ur3-mixed-20-80-scratch`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario Sounderya para un brazo robótico UR3, especializado en la tarea de recoger una taza y colocarla sobre un plato.

El modelo se ha entrenado con el framework LeRobot (v0.6.1) sobre un dataset propio de 120 episodios y 91.365 frames capturados a 30 FPS, con dos cámaras (muñeca y lateral). Con 450 millones de parámetros, representa una alternativa ligera a los VLA de gran escala, pensada para entornos de investigación y prototipado con recursos limitados. Su relevancia radica en demostrar que es posible obtener políticas robóticas funcionales con modelos de tamaño reducido y datasets modestos, siguiendo la filosofía de democratización de la robótica impulsada por LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, basado en VLM compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de politica robotica, no generativo) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y una cabeza de accion para generar comandos motores directamente a partir de observaciones visuales y una instruccion en lenguaje natural. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face sobre datos multimodales a gran escala, y este repositorio aplica un fine-tuning especifico para el robot UR3.

El entrenamiento se realizo con LeRobot 0.6.1 durante 20.000 pasos, con un batch size de 64, optimizador AdamW y una tasa de aprendizaje de 0,0001. El dataset de entrenamiento (`Sounderya/mug_smolvla_dataset_v2nc`) contiene 120 episodios de la tarea "Pick the mug and place it on the plate", con observaciones de estado (6 dimensiones) y tres imagenes de camara (256x256), generando acciones de 10 dimensiones. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento por imitacion supervisada.

## Capacidades

- Control robotico directo: genera acciones de 10 dimensiones (posicion, orientacion, velocidad, etc.) para un brazo UR3 a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa tres flujos de camara simultaneos (muñeca, lateral y una tercera) a resolucion 256x256.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica textualmente ("Pick the mug and place it on the plate") y el modelo la ejecuta.
- Generalizacion limitada a la tarea entrenada: al ser un fine-tuning especifico, no es un modelo generalista.
- Integracion con LeRobot: compatible con el ecosistema de entrenamiento, evaluacion y despliegue de LeRobot.
- Ejecucion en hardware de consumo: gracias a su tamano reducido (450M parametros), puede inferir en GPUs de gama media.

## Casos de uso

- Manipulacion de objetos en entornos de laboratorio: el modelo puede ejecutar la tarea de recoger y colocar objetos (pick-and-place) en un banco de pruebas con UR3, util para validar algoritmos de aprendizaje por imitacion.
- Investigacion en robotica de bajo coste: permite a grupos de investigacion con presupuesto limitado experimentar con politicas VLA sin necesidad de clusters de GPU, gracias a su tamano compacto.
- Prototipado rapido de nuevas tareas: usando LeRobot, se puede grabar un dataset propio y fine-tunear este modelo base para otras tareas de manipulacion, acelerando el ciclo de desarrollo.
- Educacion en robotica y aprendizaje por imitacion: sirve como ejemplo didactico de como entrenar y desplegar una politica VLA con herramientas open source.
- Evaluacion de politicas en simulacion antes del despliegue real: el modelo puede ejecutarse en entornos simulados compatibles con LeRobot para validar comportamiento antes de pasar al robot fisico.
- Benchmarking de modelos VLA compactos: al ser un fine-tuning de SmolVLA, puede usarse como referencia para comparar el rendimiento de variantes con diferentes datasets o hiperparametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasa de exito en el robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero al tratarse de un modelo de 450M parametros en safetensors (0,9 GB), se estima que puede inferir en GPUs con 4-6 GB de VRAM en precision FP16.
- GPU recomendadas: cualquier GPU NVIDIA con al menos 4 GB de VRAM (GTX 1650, RTX 2060, RTX 3060, etc.). Para entrenamiento, se recomienda una GPU con 8-12 GB (RTX 3070, RTX 4080, A100 si se dispone).
- Compatibilidad con hardware de consumo: si, es uno de los objetivos de SmolVLA.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), compatible con el ecosistema de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolVLA (este fine-tuning) | 450M | no aplica | Apache-2.0 | Hugging Face |
| OpenVLA (7B) | 7.000M | no aplica | MIT | Hugging Face |
| RT-2 (55B) | 55.000M | no aplica | propietario | no publico |

SmolVLA se posiciona como una alternativa mucho mas ligera que OpenVLA (7B) y RT-2 (55B), con un coste computacional significativamente menor. Sin embargo, no se dispone de datos comparativos de rendimiento en tareas reales en la informacion proporcionada. El paper de SmolVLA (arxiv 2506.01844) reporta resultados competitivos, pero no se incluyen en esta ficha por no estar disponibles en los materiales consultados.

## Limitaciones y advertencias

- Tarea muy especifica: el modelo solo ha sido entrenado para la tarea "recoger la taza y colocarla en el plato" con un UR3 concreto; no generaliza a otras tareas ni a otros robots sin reentrenamiento.
- Dataset reducido: 120 episodios es un volumen bajo para robotica, lo que puede limitar la robustez ante variaciones de iluminacion, posicion de objetos o distracciones.
- Sin evaluacion publicada: no hay datos de tasa de exito en el robot real, por lo que se desconoce su rendimiento efectivo.
- Dependencia del ecosistema LeRobot: requiere la instalacion de LeRobot y la configuracion especifica de camaras y robot; no es un modelo autonomo.
- Sesgos del dataset: el dataset fue grabado por un unico operador en un entorno concreto, lo que puede introducir sesgos en el comportamiento aprendido.
- Riesgo de alucinacion de acciones: como todo modelo de aprendizaje por imitacion, puede generar acciones incorrectas ante observaciones fuera de la distribucion de entrenamiento.
- Licencia Apache-2.0: permite uso comercial, pero el modelo base y el dataset pueden tener condiciones adicionales no detalladas en la model card.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Sounderya/smolvla-ur3-mixed-20-80-scratch
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Paper SmolVLA: https://arxiv.org/abs/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio similar (variante pulida): https://huggingface.co/Sounderya/smolvla-ur3-20-80-polished
