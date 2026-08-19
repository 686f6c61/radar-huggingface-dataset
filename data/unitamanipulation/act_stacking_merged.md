# UNITAmanipulation/act_stacking_merged

## Resumen

El modelo act_stacking_merged es una politica de robotica basada en Action Chunking with Transformers (ACT), desarrollada por UNITAmanipulation y entrenada con el framework LeRobot de Hugging Face. Esta disenado para tareas de apilado de bloques con un robot tipo so_follower, utilizando dos camaras (superior y de muneca) junto con el estado del robot como entradas. Con 51,7 millones de parametros y un tamano de repositorio de 0,2 GB, es una politica compacta que predice acciones de manipulacion en chunks, una tecnica que mejora la estabilidad y suavidad del movimiento frente a la prediccion paso a paso.

El modelo se entreno mediante aprendizaje por imitacion sobre datos teleoperados: 75 episodios con 69.711 fotogramas a 30 FPS, cubriendo dos tareas de apilado ("satcking_block2" y "satcking_block_wine"). La arquitectura ACT, propuesta en el articulo arxiv:2304.13705, combina un transformer encoder-decoder con un VAE condicional (CVAE) para generar secuencias de acciones coherentes. Publicado bajo licencia Apache 2.0 y creado en agosto de 2026, este modelo resulta relevante porque demuestra la aplicacion practica de ACT en un escenario real de manipulacion robotica, con pesos abiertos y reproducibles mediante el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con CVAE |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robotica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que predice chunks de acciones en lugar de pasos individuales. La arquitectura combina un codificador de imagenes basado en ResNet para procesar las observaciones visuales de las dos camaras (superior y de muneca, ambas con resolucion 3x240x320), un transformer encoder-decoder y un VAE condicional (CVAE) que modela la variabilidad de las demostraciones. El modelo recibe como entrada el estado del robot (6 dimensiones) y produce acciones de 6 dimensiones.

El entrenamiento se realizo con LeRobot version 0.6.2 sobre el dataset UNITAmanipulation/stacking_block_merged, que combina dos tareas de apilado. Se emplearon 100.000 pasos de entrenamiento con batch size 16, optimizador AdamW, tasa de aprendizaje de 1e-05 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras tecnicas de refinamiento posteriores al entrenamiento supervisado. El sufijo "merged" en el nombre del modelo y del dataset sugiere la fusion de dos conjuntos de datos de apilado, correspondientes a las dos tareas registradas.

## Capacidades

- Manipulacion robotica de apilado de bloques en dos variantes de tarea: "satcking_block2" y "satcking_block_wine".
- Percepcion visual multimodal con dos camaras: superior (top) y de muneca (wrist), ambas con resolucion 240x320.
- Control de un robot tipo so_follower con 6 grados de libertad, tanto en el estado de entrada como en las acciones de salida.
- Prediccion de acciones en chunks (action chunking), lo que proporciona movimientos mas suaves y estables que la prediccion paso a paso.
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin necesidad de disenar funciones de recompensa.
- Integracion completa con el ecosistema LeRobot: entrenamiento, evaluacion y despliegue mediante comandos CLI (lerobot-train y lerobot-rollout).

## Casos de uso

- Apilado automatizado de bloques en entornos de fabricacion: el modelo controla un robot so_follower para apilar bloques de forma autonoma, usando la camara superior para localizar los objetos y la camara de muneca para ajustar la precision del agarre.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar tecnicas de action chunking y comparar configuraciones de ACT en tareas de manipulacion real.
- Evaluacion de generalizacion entre tareas: al estar entrenado sobre dos tareas de apilado, permite analizar la capacidad del modelo para transferir habilidades entre variantes de una misma tarea.
- Benchmarking de frameworks de robotica: puede utilizarse para comparar el rendimiento de LeRobot frente a otros frameworks de aprendizaje por imitacion en hardware real.
- Prototipado rapido de aplicaciones robotica: gracias a la integracion con LeRobot, un desarrollador puede desplegar el modelo en un robot compatible en minutos con el comando lerobot-rollout.
- Educacion y formacion en robotica: el modelo y su dataset asociado son recursos didacticos utiles para ensenar aprendizaje por imitacion, vision por computador y control robotico.
- Reproduccion de resultados cientificos: al estar publicados los pesos y el dataset, permite replicar el entrenamiento y verificar los resultados del articulo ACT en un entorno concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- Tamano del modelo: 51,7 millones de parametros, aproximadamente 0,2 GB en formato safetensors.
- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Dado el tamano del modelo, se espera que quepa en GPUs de consumo con al menos 4-6 GB de VRAM, aunque no se ha confirmado oficialmente.
- GPU recomendadas: no especificadas por el autor. Una GPU de consumo como RTX 3060 o superior deberia ser suficiente para inferencia.
- Compatibilidad con GPU de consumo: probablemente si, dado el reducido tamano del modelo, aunque no se ha verificado de forma oficial.
- Opciones de despliegue: LeRobot (comando lerobot-rollout), con soporte para robot tipo so_follower y camaras OpenCV.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Framework | Licencia |
|---|---|---|---|---|
| UNITAmanipulation/act_stacking_merged | 51,7 M | Apilado de bloques | LeRobot | Apache 2.0 |
| altmtls1108/act_box_stacking_merged_v2 | no disponible | Apilado de cajas | LeRobot | no disponible |
| ACT original (arxiv:2304.13705) | no disponible | Manipulacion bimanual fina | ALOHA | no disponible |

No se dispone de informacion detallada sobre parametros, contexto o rendimiento de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado resultados de evaluacion en robot real, por lo que se desconoce la tasa de exito real del modelo en tareas de apilado.
- El modelo se ha entrenado exclusivamente para dos tareas de apilado de bloques y puede no generalizar a otras tareas, objetos o configuraciones de robot.
- Los nombres de las tareas contienen errores tipograficos en el dataset original ("satcking" en lugar de "stacking"), lo que puede causar confusion al referenciar las tareas en scripts o documentacion.
- El modelo requiere un robot so_follower y dos camaras configuradas especificamente (top y wrist) para funcionar correctamente; no es compatible con otras configuraciones de hardware sin reentrenamiento.
- No se proporciona informacion sobre la robustez del modelo ante cambios de iluminacion, posicion de objetos o distracciones en el entorno.
- El dataset de entrenamiento es relativamente pequeno (75 episodios), lo que puede limitar la capacidad de generalizacion del modelo.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo depende del framework LeRobot y de hardware especifico, lo que debe considerarse en despliegues de produccion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/UNITAmanipulation/act_stacking_merged)
- [Dataset de entrenamiento](https://huggingface.co/datasets/UNITAmanipulation/stacking_block_merged)
- [Articulo ACT (arxiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio LeRobot](https://github.com/huggingface/lerobot)
- [Documentacion de LeRobot para ACT](https://huggingface.co/docs/lerobot/main/en/act)
- [Guia de instalacion de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guia de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Referencia de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentacion de rollout de LeRobot](https://huggingface.co/docs/lerobot/main/en/inference)
- [Visualizador del dataset](https://huggingface.co/spaces/lerobot/visualize_dataset?path=UNITAmanipulation/stacking_block_merged)
