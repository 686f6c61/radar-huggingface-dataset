# YuBin103/pick_and_place_0905_diffusion

## Resumen

El modelo `YuBin103/pick_and_place_0905_diffusion` es una política de control visuomotor basada en Diffusion Policy, desarrollada por YuBin103 y entrenada con el framework LeRobot de Hugging Face. Está diseñada para ejecutar tareas de recogida y colocación (pick and place) en un robot de tipo `so_follower`, utilizando como entradas el estado del efector final y dos cámaras (una superior y otra en la muñeca). Su relevancia radica en aplicar procesos generativos de difusión al control robótico, una técnica que permite generar trayectorias de acción suaves y multi-paso, especialmente adecuadas para manipulación rica en contacto.

La arquitectura es una red de difusión para control visuomotor, con un total de 277.840.246 parámetros. No se trata de un modelo de lenguaje: no tiene longitud de contexto ni procesa texto. El modelo se publica bajo licencia Apache-2.0 y los pesos se distribuyen en formato safetensors.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (red de difusión para control visuomotor) |
| Parametros totales | 277.840.246 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no aplica a políticas de control robótico) |
| Tipos de cuantizacion | No disponible (pesos safetensors sin cuantización especificada) |
| Idiomas soportados | No disponible (modelo de control robótico, no procesa lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa Diffusion Policy, tal como se describe en el paper [2303.04137](https://huggingface.co/papers/2303.04137). Esta técnica trata el control visuomotor como un proceso generativo de difusión: en lugar de predecir una única acción, el modelo genera una trayectoria completa de acciones multi-paso a partir del ruido, refinándola iterativamente. Esto produce movimientos suaves y estables, lo que resulta especialmente útil en tareas de manipulación que requieren contacto físico con objetos.

El modelo fue entrenado con el framework LeRobot (versión 0.6.2) sobre un dataset de demostraciones humanas de la tarea `pick_and_place_0905`. El dataset contiene 26 episodios y 15.574 fotogramas a 30 FPS. La configuración de entrenamiento incluye 100.000 pasos, tamaño de lote 8, optimizador Adam con tasa de aprendizaje 0.0001 y semilla 1000. Las entradas del modelo son el estado del robot (6 valores) y dos imágenes de 480x640 píxeles procedentes de las cámaras `top` y `wrist`. La salida es una acción de 6 dimensiones.

## Capacidades

- Genera trayectorias de acción de 6 dimensiones (posiciones y orientaciones del efector final) a partir de observaciones visuales y de estado.
- Procesa imágenes de dos cámaras (superior y muñeca) a 480x640 píxeles, además del estado del robot.
- Ejecuta tareas de pick and place en el robot `so_follower`, produciendo movimientos suaves y multi-paso.
- No soporta tool calling ni function calling.
- No tiene capacidades multilingües ni de lenguaje natural.
- No dispone de modo de pensamiento ni razonamiento simbólico.

## Casos de uso

- Automatización de pick and place en entornos industriales: el modelo se despliega en un robot `so_follower` con cámaras montadas en el brazo y en el techo para recoger objetos y colocarlos en posiciones definidas. Es adecuado porque genera trayectorias de acción suaves y multi-paso, esenciales para manipulación rica en contacto.
- Investigación en aprendizaje por imitación: sirve como política de referencia para comparar Diffusion Policy con otros métodos (por ejemplo, ACT) en tareas de manipulación robótica, usando el framework LeRobot y el dataset asociado.
- Fine-tuning para nuevas tareas de manipulación: el modelo puede utilizarse como punto de partida para entrenar políticas en tareas similares con pocos datos, gracias a la infraestructura de LeRobot y a su tamaño moderado.
- Demostraciones en robótica educativa: con un robot `so_follower` y dos cámaras, la política puede ejecutarse en tiempo real mediante el comando `lerobot-rollout`, permitiendo mostrar conceptos de control visuomotor en entornos académicos.
- Logística de almacén: tareas de recogida y colocación de cajas o piezas en estanterías, donde el modelo puede manejar variaciones de posición dentro del rango visto en el dataset de entrenamiento.
- Laboratorios de automatización: integración con sistemas de control para realizar tareas repetitivas de pick and place con alta precisión, ejecutando la política de forma indefinida o durante un tiempo fijo con `lerobot-rollout`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 277.840.246 parámetros, los pesos en FP32 ocupan aproximadamente 1,1 GB. En FP16, el consumo sería de unos 0,55 GB. Para inferencia con PyTorch, se recomienda al menos 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como una RTX 2060, RTX 3060 o superior. No se requieren GPUs de datacenter como A100 o H100.
- Sí cabe en GPU de consumidor.
- Opciones de despliegue: el modelo se ejecuta con el framework LeRobot y PyTorch. No aplican vLLM, llama.cpp, Ollama ni TGI, al tratarse de una política de control robótico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YuBin103/pick_and_place_0905_diffusion | Diffusion Policy | 277.840.246 | No aplica | Apache-2.0 | HuggingFace |
| YuBin103/pick_and_place_0905_act | ACT (Action Chunking Transformer) | No disponible | No aplica | No disponible | HuggingFace |

No se han publicado resultados de benchmarks comparativos entre ambos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo fue entrenado con un dataset pequeño (26 episodios, 15.574 fotogramas) y específico para la tarea `pick_and_place_0905`, por lo que su generalización a otras tareas o entornos es limitada.
- No se han publicado resultados de evaluación en el mundo real; se desconoce la tasa de éxito real del modelo.
- Es sensible a cambios en iluminación, posición de objetos, distracciones o variaciones en la configuración de las cámaras.
- Requiere la configuración exacta del robot `so_follower` y de las cámaras `top` y `wrist` utilizadas durante el entrenamiento.
- No es un modelo de lenguaje: no soporta tool calling, razonamiento simbólico ni interacción en lenguaje natural.
- Aunque la licencia Apache-2.0 permite uso comercial, el rendimiento del modelo en producción no está validado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YuBin103/pick_and_place_0905_diffusion
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset de entrenamiento: https://huggingface.co/datasets/YuBin103/pick_and_place_0905_20260905_161256
- Modelo ACT del mismo autor: https://huggingface.co/YuBin103/pick_and_place_0905_act
