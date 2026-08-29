# Sounderya/smolvla-ur3-phase3

## Resumen

SmolVLA es un modelo vision-language-action (VLA) compacto y eficiente desarrollado por Hugging Face, disenado para robotica asequible y desplegable en hardware de consumo. Este repositorio concreto, `Sounderya/smolvla-ur3-phase3`, es un fine-tuning del modelo base `lerobot/smolvla_base` realizado por Sounderya para controlar un brazo robotico UR3 en la tarea de recoger una taza y colocarla en un plato. El modelo integra percepcion visual multi-camara, estado del robot y lenguaje natural para generar acciones de control de 10 dimensiones.

Con 450 millones de parametros, el modelo se entrena mediante aprendizaje por imitacion usando el framework LeRobot sobre un dataset de 120 episodios y 91.365 frames a 30 FPS. Su relevancia radica en demostrar que los VLA pueden ser lo suficientemente compactos para ejecutarse en equipos de consumo, a diferencia de los VLA masivos existentes, manteniendo un rendimiento competitivo en tareas de manipulacion robotica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA adapta modelos vision-language preentrenados en datos multimodales a gran escala para convertirlos en politicas de control robotico, evitando entrenar desde cero. La arquitectura combina un codificador visual, un modelo de lenguaje y una cabeza de accion que produce salidas de control continuas. En este fine-tuning concreto, el modelo recibe tres entradas visuales de 256x256 píxeles (camaras `wrist` y `right`, mas una tercera), un vector de estado de 6 dimensiones, y genera acciones de 10 dimensiones.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset `Sounderya/mug_smolvla_dataset_v2nc`, que contiene 120 episodios de la tarea "Pick the mug and place it on the plate" a 30 FPS. La configuracion de entrenamiento incluye 1.000 pasos, batch size de 64, optimizador AdamW con learning rate de 1e-05 y seed 1000. El modelo se fine-tunea a partir de los pesos preentrenados de `lerobot/smolvla_base`, siguiendo el paradigma de aprendizaje por imitacion supervisado.

## Capacidades

- Control robotico pick-and-place: ejecuta la tarea de recoger una taza y colocarla en un plato mediante comandos de lenguaje natural.
- Percepcion visual multi-camara: procesa tres flujos de imagen simultaneos (camara de muñeca, camara lateral y una tercera) a resolucion 256x256.
- Integracion estado-accion: combina un vector de estado de 6 dimensiones del robot con las observaciones visuales para generar acciones de 10 dimensiones.
- Aprendizaje por imitacion: politica entrenada mediante demostraciones humanas registradas con LeRobot.
- Ejecucion en hardware de consumo: disenado para funcionar en GPUs de gama consumer, segun la descripcion del paper SmolVLA.
- Especificacion de tareas en lenguaje natural: la tarea se define textualmente ("Pick the mug and place it on the plate") y el modelo la asocia con las observaciones visuales.

## Casos de uso

- Automatizacion de pick-and-place en entornos de laboratorio: el modelo puede controlar un UR3 para tareas repetitivas de recogida y colocacion de objetos, reduciendo la necesidad de programacion manual de trayectorias.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como los VLA compactos se comportan frente a modelos mas grandes en tareas de manipulacion.
- Prototipado rapido de politicas roboticas: con LeRobot, un investigador puede registrar demostraciones, fine-tunear el modelo base y desplegar la politica en horas, sin infraestructura de GPU de alta gama.
- Evaluacion de VLA en hardware asequible: permite comparar el rendimiento de SmolVLA frente a alternativas mas grandes en un robot real, validando la viabilidad de modelos compactos en produccion.
- Educacion en robotica y aprendizaje por refuerzo: el repositorio incluye instrucciones completas de instalacion, entrenamiento y rollout, lo que lo hace util como material didactico en cursos de robotica.
- Fine-tuning para nuevas tareas de manipulacion: el flujo de entrenamiento documentado permite adaptar el modelo a otras tareas (apilar objetos, insertar piezas, etc.) con un dataset propio de demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de datos de tasa de exito en robot real ni de comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 450 millones de parametros, el modelo requiere aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16 para inferencia, aunque el repositorio ocupa 5,3 GB en disco (incluye checkpoints y pesos en safetensors).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM deberia ser suficiente para inferencia; el paper SmolVLA indica que el modelo esta disenado para hardware de consumo.
- Compatibilidad con consumer GPU: si, es uno de los objetivos principales del diseno de SmolVLA.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, con comandos `lerobot-rollout` para inferencia en robot real y `lerobot-train` para fine-tuning. No se mencionan opciones de despliegue con vLLM, Ollama o TGI, ya que no es un modelo de generacion de texto generico.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| Sounderya/smolvla-ur3-phase3 | 450M | Pick mug, place on plate | 120 episodios, 91.365 frames | Apache-2.0 |
| Sounderya/smolvla-ur3-phase1-sim | 450M (estimado) | Simulacion UR3 | no disponible | Apache-2.0 |
| Sounderya/smolvla-ur3-sim-polished | 450M (estimado) | Simulacion UR3 pulida | no disponible | Apache-2.0 |
| lerobot/smolvla_base | 450M | Preentrenamiento general | no disponible | Apache-2.0 |

Los tres fine-tunes de Sounderya comparten la misma arquitectura base y se diferencian en la fase de entrenamiento (simulacion vs. robot real) y en el refinamiento de la politica. No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Sin resultados de evaluacion: la model card no incluye tasa de exito en robot real, por lo que el rendimiento real del modelo no esta verificado.
- Especializacion en una unica tarea: el modelo esta entrenado exclusivamente para "Pick the mug and place it on the plate"; no generaliza a otras tareas sin fine-tuning adicional.
- Dataset reducido: 120 episodios es un volumen pequeno para aprendizaje por imitacion, lo que puede limitar la robustez frente a variaciones de iluminacion, posicion de objetos o distracciones.
- Dependencia del setup hardware: las camaras (`wrist`, `right` y una tercera) y el robot UR3 deben coincidir con la configuracion de entrenamiento; cambios en la disposicion de camaras requieren reentrenamiento.
- Riesgo de sobreajuste: con solo 1.000 pasos de entrenamiento y un dataset pequeno, el modelo puede memorizar las demostraciones en lugar de aprender una politica generalizable.
- Sin soporte multilingue declarado: la informacion sobre idiomas no esta disponible; la tarea se especifica en ingles.
- Modelo sin uso en produccion: con 0 descargas y 0 likes, no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Sounderya/smolvla-ur3-phase3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Sounderya/mug_smolvla_dataset_v2nc
- Paper SmolVLA (arXiv): https://arxiv.org/abs/2506.01844
- Repositorio GitHub del autor: https://github.com/Sounderya22/ur3_smolvla
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentacion LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio relacionado (fase 1 simulacion): https://huggingface.co/Sounderya/smolvla-ur3-phase1-sim
- Repositorio relacionado (simulacion pulida): https://huggingface.co/Sounderya/smolvla-ur3-sim-polished
