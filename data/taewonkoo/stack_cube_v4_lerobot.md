# taewonkoo/stack_cube_v4_lerobot

## Resumen

`taewonkoo/stack_cube_v4_lerobot` es una política de robótica basada en SmolVLA, un modelo de visión-idioma-acción (VLA) compacto y eficiente desarrollado por el equipo de LeRobot. Este modelo en particular es un fine-tuning del modelo base `lerobot/smolvla_base`, entrenado para ejecutar la tarea de recoger un cubo de madera y colocarlo sobre un cubo de Rubik. El modelo está diseñado para desplegarse en hardware de consumo, lo que lo hace relevante para investigadores y desarrolladores que necesitan políticas de control robótico accesibles y de bajo coste computacional.

El modelo tiene 450.046.176 parámetros y utiliza una arquitectura de visión-idioma-acción que consume observaciones multimodales (estado del robot e imágenes de varias cámaras) y produce acciones de 6 dimensiones. Ha sido entrenado con el framework LeRobot sobre un dataset de 50 episodios (16.474 frames a 30 FPS) y se distribuye bajo licencia Apache-2.0. No se han publicado resultados de evaluación en el mundo real en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action model) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-idioma-acción (VLA) compacto y eficiente, diseñado para lograr un rendimiento competitivo con un coste computacional reducido y poder ejecutarse en hardware de consumo. Este modelo es un fine-tuning de `lerobot/smolvla_base` sobre el dataset `taewonkoo/stack_cube_v4_lerobot`, que contiene 50 episodios y 16.474 frames a 30 FPS. La tarea de entrenamiento es "pick_up_the_wood_cube_and_place_on_the_rubiks cube".

El entrenamiento se realizó con la librería LeRobot (versión 0.6.2) durante 30.000 pasos, con un tamaño de lote de 4, optimizador AdamW y una tasa de aprendizaje de 0.0001. La semilla utilizada fue 1000. Las observaciones de entrada incluyen el estado del robot (6 dimensiones) y cuatro imágenes: tres de resolución 256x256 y una de 480x640. La salida es una acción de 6 dimensiones.

## Capacidades

- Generacion de acciones de control para robots manipuladores, especificamente del tipo `so_follower`.
- Consumo de observaciones multimodales: estado del robot (6 dimensiones) y multiples imagenes de camaras (front, top, y otras).
- Ejecucion de tareas de manipulacion aprendidas por imitacion, como recoger un cubo de madera y colocarlo sobre un cubo de Rubik.
- Despliegue en hardware de consumo gracias a su tamano compacto (450M parametros).
- Integracion con el framework LeRobot para entrenamiento, evaluacion y despliegue (lerobot-train, lerobot-rollout).
- No soporta tool calling, razonamiento general, generacion de texto ni capacidades de lenguaje natural.

## Casos de uso

- Manipulacion robotica en laboratorios de investigacion: el modelo se integra en un robot `so_follower` mediante LeRobot para ejecutar la tarea de pick-and-place aprendida. Es adecuado porque su tamano reducido permite iterar rapidamente en experimentos sin necesidad de infraestructura de GPU costosa.
- Aprendizaje por imitacion para nuevas tareas: los investigadores pueden partir de este fine-tune como base y adaptarlo a nuevas tareas con datos adicionales, gracias al flujo de trabajo de LeRobot y a la arquitectura VLA compacta.
- Prototipado de politicas de control: al ser ligero, permite validar hipotesis de control en entornos simulados o reales con ciclos de entrenamiento cortos y bajo coste computacional.
- Despliegue en robots de bajo coste: el modelo esta disenado para funcionar en hardware de consumo, lo que lo hace util para proyectos de robotica educativa o de prototipado rapido en entornos con recursos limitados.
- Benchmarking de modelos VLA: el dataset asociado (`taewonkoo/stack_cube_v4_lerobot`) y el propio modelo pueden servir como referencia para comparar politicas de manipulacion en la tarea de apilar cubos.
- Investigacion en eficiencia de modelos de robotica: permite estudiar como un modelo de 450M parametros se comporta frente a alternativas mas grandes, como `ImKyungjin/pi0-stackcube-v4-full` (4B), en la misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 450M parametros, el consumo de memoria es moderado, pero no se especifican cifras exactas.
- GPU recomendada: no disponible. El modelo esta disenado para hardware de consumo, segun la descripcion del paper de SmolVLA.
- Compatibilidad con GPU consumer: probablemente compatible con GPUs de gama media (por ejemplo, RTX 3060 o superiores), aunque no se confirma.
- Opciones de despliegue: LeRobot (comandos `lerobot-rollout` y `lerobot-train`). No se mencionan otras opciones como vLLM, llama.cpp o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `taewonkoo/stack_cube_v4_lerobot` | 450M | Recoger cubo de madera y colocarlo sobre cubo de Rubik | `taewonkoo/stack_cube_v4_lerobot` | Apache-2.0 | HuggingFace |
| `lerobot/smolvla_base` | 450M | Modelo base, sin fine-tune | - | Apache-2.0 | HuggingFace |
| `ImKyungjin/pi0-stackcube-v4-full` | 4B | Misma tarea (apilar cubos) | `taewonkoo/stack_cube_v4_lerobot` | no disponible | HuggingFace |

No se dispone de resultados de rendimiento comparativos para estos modelos.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para una tarea especifica: recoger un cubo de madera y colocarlo sobre un cubo de Rubik. No es un modelo de proposito general.
- Las observaciones de entrada incluyen camaras fijas con resoluciones concretas (256x256 y 480x640). Cambios en la configuracion de camaras o en el tipo de robot pueden degradar significativamente el rendimiento.
- El dataset de entrenamiento contiene solo 50 episodios, lo que puede limitar la generalizacion a nuevas posiciones, iluminacion o distracciones.
- No se han proporcionado resultados de evaluacion en el mundo real, por lo que el rendimiento esperado en produccion es incierto.
- Riesgo de alucinacion en acciones: como cualquier politica de aprendizaje por imitacion, puede producir acciones incorrectas en situaciones fuera de la distribucion de entrenamiento.
- No se han documentado sesgos especificos, pero la naturaleza del dataset (una unica tarea, un unico robot) puede introducir sesgos hacia ese escenario concreto.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar el metodo y LeRobot segun la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/taewonkoo/stack_cube_v4_lerobot
- Dataset en HuggingFace: https://huggingface.co/datasets/taewonkoo/stack_cube_v4_lerobot
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=taewonkoo/stack_cube_v4_lerobot
