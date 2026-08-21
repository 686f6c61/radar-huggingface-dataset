# Xihe666/drif_ov_libero_20k_seed42_0821

## Resumen

El modelo `drif_ov` es una política robótica de aprendizaje por imitación desarrollada por el usuario Xihe666 y entrenada con la librería LeRobot de Hugging Face. Está diseñada para controlar un brazo robótico Panda (Franka Emika) en tareas de manipulación de mesa, generando acciones de 7 grados de libertad a partir de observaciones visuales (dos cámaras de 256x256 píxeles) y del estado propio del robot (posición y velocidad de las articulaciones). El modelo se ha entrenado sobre el dataset LIBERO, un estándar de referencia en robótica manipuladora, con 1693 episodios que cubren 40 tareas distintas.

La arquitectura se basa en un enfoque de difusión para la generación de acciones, una técnica que ha demostrado un rendimiento superior en el control de robots en entornos complejos. Con aproximadamente 1,9 mil millones de parámetros, es un modelo relativamente grande para robótica, lo que le permite capturar la variabilidad de las tareas de LIBERO. Su relevancia radica en que representa un ejemplo de política de difusión de código abierto y entrenable, publicada bajo licencia Apache 2.0, que puede servir como punto de partida para la investigación en aprendizaje por imitación o para la transferencia a otros robots y entornos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para control robótico (tipo Diffusion Policy) |
| Parámetros totales | 1.909.381.248 (~1,9B) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (entrada fija: imágenes 256x256 y estado de 8 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión y control, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo `drif_ov` es una política de difusión, un enfoque generativo que aprende a reconstruir secuencias de acciones a partir de ruido, condicionado por observaciones visuales y del estado del robot. Esta arquitectura es común en LeRobot para el control robótico de manipulación. El modelo consume dos imágenes (256x256 cada una) y un vector de estado de 8 dimensiones, y produce una acción de 7 dimensiones (posición y orientación del efector final). El entrenamiento se realizó con el optimizador AdamW (learning rate 0,0001), un batch de 32, y 20.000 pasos de entrenamiento sobre el dataset LIBERO, que contiene 273.465 frames a 10 FPS. El dataset incluye 40 tareas de manipulación de objetos cotidianos (colocar tazas, abrir cajones, mover botellas, etc.). No se menciona explícitamente el uso de RLHF o DPO, ya que se trata de aprendizaje por imitación supervisado.

La innovación principal es la aplicación de difusión a robótica manipuladora, que permite generar acciones suaves y robustas frente a la variabilidad de las observaciones. El modelo se ha entrenado con LeRobot 0.6.1 y se ha subido al Hub de Hugging Face, lo que facilita su reproducción y despliegue.

## Capacidades

- Generación de acciones de control robótico: produce comandos de 7 grados de movimiento (posición y orientación del efector final) para el brazo Panda.
- Percepción visual multimodal: utiliza dos cámaras simultáneas (vista principal y vista secundaria) para localizar y manipular objetos.
- Aprendizaje de tareas complejas: es capaz de ejecutar secuencias de manipulación de múltiples pasos, como colocar objetos en platos, abrir cajones o encender una estufa.
- Control de precisión: gracias a la difusión, genera trayectorias suaves y coherentes, reduciendo el ruido de acción.
- Integración con LeRobot: compatible con el ecosistema de LeRobot para despliegue, entrenamiento y evaluación en robots reales.
- No es un modelo de lenguaje: no procesa texto ni conversación, solo datos sensoriales y de estado.

## Casos de uso

- **Investigación en aprendizaje robótico**: el modelo sirve como base de referencia para estudiar políticas de difusión en manipulación, comparando con otras arquitecturas (ACT, VQ-BeT, etc.) en el benchmark LIBERO.
- **Automatización de tareas de mesa**: puede desplegarse en un brazo Panda para tareas de pick-and-place, ordenación de objetos o manipulación de electrodomésticos (cajones, estufa) en entornos de laboratorio.
- **Desarrollo de nuevos datasets**: el modelo puede usarse como política para generar nuevas demostraciones sintéticas o para evaluar la calidad de datasets de imitación.
- **Transferencia a otros robots**: aunque entrenado para Panda, la arquitectura puede adaptarse a otros robots con el mismo espacio de acción y observación, usando LeRobot.
- **Evaluación de robustez**: permite probar la robustez de la difusión ante variaciones de iluminación, oclusión o posición de objetos en escenarios controlados.
- **Educación en robótica**: como modelo abierto y ligero en comparación con los LLM, puede usarse en cursos de robótica para enseñar aprendizaje por imitación y despliegue de políticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en las tareas de LIBERO ni comparaciones con otras políticas. Se recomienda consultar la documentación de LeRobot para obtener referencias de rendimiento de políticas similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 1,9B de parámetros, con pesos en safetensors de 7,6 GB. Para inferencia en fp32 se necesita al menos 8 GB de VRAM; con cuantización a fp16 (4 GB) o int8 (2 GB) se reduce el requisito, pero no se han publicado cuantizaciones oficiales.
- GPU recomendadas: una RTX 3090/4090 o A100 de 16-24 GB es suficiente para inferencia y entrenamiento con batch pequeño. Para entrenamiento completo con batch 32 se requiere una GPU con al menos 24 GB (como A100 40GB o RTX 4090 24GB).
- Compatibilidad con consumer GPU: sí, una RTX 4090 puede ejecutar el modelo, aunque el entrenamiento completo podría requerir más de 24 GB de VRAM; se recomienda usar fp16 o acumulación de gradientes.
- Opciones de despliegue: LeRobot ofrece scripts de rollout para robot reales (comando `lerobot-rollout`) y soporte para simulación. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de control robótico, no de lenguaje.
- Latencia y throughput: no disponible en la información. Se espera una latencia de decenas de milisegundos por paso de control (10 Hz) en una GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. Sin embargo, los modelos comparables serían otras políticas de manipulación entrenadas en LIBERO, como:

| Modelo | Parámetros | Contexto | Rendimiento en LIBERO | Licencia |
|---|---|---|---|---|
| `drif_ov` | 1,9B | Imagen 256x256 + estado 8D | No disponible | Apache 2.0 |
| Diffusion Policy (original) | variable | Imagen + estado | No disponible | MIT (referencia) |
| ACT (Action Chunking with Transformers) | variable | Imagen + estado | No disponible | MIT (referencia) |

No se han encontrado comparaciones directas con estos modelos en la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el robot Panda y con las dos cámaras específicas (image e image2). Para usarlo en otro robot o con otras cámaras, se requiere un reentrenamiento o adaptación.
- Solo es válido para las 40 tareas de LIBERO; no generaliza a tareas fuera de este conjunto sin entrenamiento adicional.
- La información sobre el rendimiento en el mundo real (tasa de éxito) no está publicada, por lo que se recomienda validar en un entorno simulado antes de desplegar en un robot real.
- No soporta procesamiento de lenguaje natural ni interacción por texto, es exclusivamente un controlador visual-motor.
- El modelo puede presentar comportamientos impredecibles en situaciones de oclusión, iluminación extrema o cambios en la disposición de objetos no vistos en el entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el dataset LIBERO (sobre el que se entrenó) tiene su propia licencia; hay que verificar los términos de uso del dataset para usos comerciales.
- El tamaño del modelo (7,6 GB) puede ser elevado para aplicaciones en tiempo real en robots de bajo consumo; se recomienda cuantización o optimización con herramientas de LeRobot.

## Enlaces

- Modelo en Hugging Face: [Xihe666/drif_ov_libero_20k_seed42_0821](https://huggingface.co/Xihe666/drif_ov_libero_20k_seed42_0821)
- Dataset LIBERO: [lerobot/libero](https://huggingface.co/datasets/lerobot/libero)
- LeRobot (librería y documentación): [https://github.com/huggingface/lerobot](https://github.com/huggingface/lerobot)
- Visualizador del dataset LIBERO: [https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero](https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/libero)
