# StellarEdge/StellaVLA

## Resumen

StellaVLA es un modelo de visión-lenguaje-acción (VLA) desarrollado por el equipo técnico de StellarEdge AI para manipulación robótica. Su propuesta principal es el uso de demostraciones estructuradas como ejemplos in-context: en tiempo de inferencia, el modelo recupera una demostración de una tarea relacionada y la convierte automáticamente en un contexto estructurado que incluye sub-objetivos de alto nivel, trazas 2D ancladas a la imagen y movimiento 3D verbalizado del espacio de trabajo. Esto permite adaptarse a nuevos objetos, escenas e instrucciones de lenguaje sin necesidad de fine-tuning.

El modelo se basa en el backbone Qwen3-VL-4B-Instruct y se entrena durante 30.000 pasos con un batch global de 128 en 4 GPU H200, sin una etapa adicional de pre-entrenamiento robótico. Se publican dos checkpoints: uno para el benchmark LIBERO y otro para VLA-Arena. StellaVLA destaca por su capacidad de generalización zero-shot, logrando una tasa de éxito media del 85,1 % en LIBERO-Plus (frente al 75,0 % del mejor baseline) y un 0,68 de éxito global en VLA-Arena sin pre-entrenamiento adicional. El código, los pesos y el entorno Docker están disponibles bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basado en Qwen3-VL-4B-Instruct (transformer multimodal) |
| Parametros totales | No disponible (backbone: Qwen3-VL-4B-Instruct, 4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (checkpoints .pt) |

## Arquitectura y entrenamiento

StellaVLA es un modelo VLA que combina un codificador visual y un modelo de lenguaje (Qwen3-VL-4B-Instruct) para generar acciones de robot a partir de observaciones visuales e instrucciones en lenguaje natural. La innovación principal no está en la arquitectura base, sino en el mecanismo de condicionamiento: en lugar de entrenar con demostraciones fijas, el modelo recibe en su contexto una demostración estructurada recuperada de una tarea relacionada. Esta demostración se descompone automáticamente en tres niveles de información: sub-objetivos semánticos de alto nivel, trazas 2D ancladas a la imagen y movimiento 3D verbalizado del espacio de trabajo. Todo el proceso de conversión es automático y no requiere anotación humana adicional.

El entrenamiento se realiza por separado para LIBERO y VLA-Arena, con 30.000 pasos, batch global de 128 y 4 GPU H200. No se utiliza una etapa de pre-entrenamiento robótico previa, y no se menciona el uso de RLHF o DPO. El modelo se apoya en el framework StarVLA como base de desarrollo. En el bucle de control no se emplea decodificación de lenguaje autoregresiva, lo que reduce la latencia en la ejecución de políticas.

## Capacidades

- Manipulación robótica: genera acciones de robot (posición, orientación, agarre) a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generalización zero-shot: se adapta a nuevas tareas, objetos, escenas y variaciones de iluminación, cámara o fondo sin reentrenamiento, gracias a la recuperación de demostraciones in-context.
- Aprendizaje por imitación con demostraciones heterogéneas: acepta demostraciones humanas, de robot y human-to-robot (XR) como contexto estructurado.
- Razonamiento de alto nivel: extrae sub-objetivos y planes de tarea a partir de la demostración recuperada, lo que permite transferir la intención de la tarea, no solo la trayectoria.
- Información cinemática fina: combina trazas 2D ancladas a la imagen y movimiento 3D verbalizado para guiar la ejecución motora.
- Sin decodificación autoregresiva en el bucle de control: la generación de acciones es directa, lo que mejora la latencia en entornos de tiempo real.
- Evaluación en benchmarks estandarizados: LIBERO, LIBERO-Plus y VLA-Arena, con protocolos reproducibles vía Docker.

## Casos de uso

- Manipulación doméstica asistida: un robot puede recoger, colocar o apilar objetos en entornos domésticos variados, adaptándose a nuevas configuraciones de mesa o iluminación sin reentrenamiento, gracias a la recuperación de demostraciones de tareas similares.
- Automatización industrial flexible: en líneas de montaje con tareas cambiantes, StellaVLA puede reconfigurarse en tiempo de ejecución proporcionando una demostración estructurada de la nueva tarea, evitando costosos ciclos de fine-tuning.
- Teleoperación y aprendizaje por demostración XR: operadores humanos pueden generar demostraciones mediante dispositivos XR; el modelo las convierte automáticamente en contexto estructurado y las transfiere al robot, facilitando el despliegue de nuevas habilidades.
- Robótica de investigación y evaluación de políticas: el checkpoint de LIBERO permite reproducir los resultados publicados y comparar con otros VLA en los benchmarks estándar, usando el entorno Docker proporcionado.
- Desarrollo de sistemas de aprendizaje continuo: al no requerir fine-tuning para nuevas tareas, StellaVLA puede integrarse en pipelines donde se añaden demostraciones nuevas sin interrumpir la operación.
- Prototipado rápido de tareas robóticas: un desarrollador puede probar una nueva tarea en simulación (LIBERO-Plus) o en robot real simplemente aportando una demostración de referencia, acelerando la iteración de diseño.

## Benchmarks y rendimiento

Los resultados publicados en la model card se basan en 500 rollouts por suite para LIBERO, y en el protocolo de VLA-Arena con 11 suites de tareas a tres niveles de dificultad.

### LIBERO (tasa de éxito en %, in-distribution)

| Metodo | Spatial | Object | Goal | Long | Avg. |
| --- | ---: | ---: | ---: | ---: | ---: |
| MemoryVLA | 98.4 | 98.4 | 96.4 | 93.4 | 96.7 |
| ACoT-VLA | 99.4 | **99.6** | 98.8 | 96.0 | 98.5 |
| AVA-VLA | 99.2 | **99.6** | 97.9 | 96.2 | 98.2 |
| StarVLA-OFT | 97.8 | 98.6 | 96.2 | 93.8 | 96.6 |
| CogVLA | 98.6 | 98.8 | 96.6 | 95.4 | 97.4 |
| Retrieval-VLA | 97.4 | 98.8 | 96.3 | 89.5 | 95.5 |
| DreamVLA | 97.5 | 94.0 | 89.5 | 89.5 | 92.6 |
| **StellaVLA** | **99.6** | 99.0 | **99.6** | **96.8** | **98.8** |

### LIBERO-Plus (zero-shot, tasa de éxito en %)

| Metodo | Orig. | Cam. | Robot | Noise | Layout | Backg. | Light | Lang. | Avg. |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| OpenVLA | 76.5 | 1.1 | 4.1 | 19.3 | 31.6 | 25.3 | 4.4 | 26.8 | 16.0 |
| OpenVLA-OFT | 97.1 | 59.7 | 37.2 | 76.7 | 77.1 | 92.4 | 85.8 | 81.5 | 71.4 |
| π₀ | 94.2 | 15.8 | 6.6 | 79.4 | 70.4 | 78.5 | 79.6 | 61.0 | 53.8 |
| π₀-FAST | 85.5 | 66.4 | 24.8 | 75.8 | 70.3 | 67.7 | 73.0 | 63.3 | 62.5 |
| Nora | 87.9 | 4.0 | 41.1 | 17.6 | 63.9 | 50.5 | 31.0 | 67.0 | 38.7 |
| WorldVLA | 79.1 | 0.3 | 30.2 | 12.2 | 39.4 | 14.5 | 29.4 | 44.2 | 24.3 |
| UniVLA | 95.2 | 4.3 | 50.3 | 25.3 | 34.3 | 80.0 | 59.1 | 71.8 | 44.0 |
| RIPT-VLA | 97.5 | 58.3 | 36.7 | 73.8 | 76.5 | 90.4 | 87.9 | 80.1 | 70.4 |
| StarVLA-OFT | 96.6 | 47.0 | 60.1 | 73.1 | **79.2** | **95.3** | **96.3** | 87.0 | 75.0 |
| **StellaVLA** | **98.8** | **70.5** | **74.8** | **92.8** | 79.3 | 95.2 | 95.7 | **95.3** | **85.1** |

### VLA-Arena (tasa de éxito media, entrenado solo con datos L0)

| Metodo | L0 | L1 | L2 | Overall |
| --- | ---: | ---: | ---: | ---: |
| Motus | 0.60 | 0.36 | 0.21 | 0.39 |
| OpenVLA-OFT | 0.77 | 0.29 | 0.14 | 0.40 |
| Evo-Depth | 0.75 | 0.32 | 0.17 | 0.41 |
| π₀.₅ | 0.69 | 0.38 | 0.26 | 0.44 |
| GR00T-N1.6 | 0.50 | 0.24 | 0.09 | 0.28 |
| GR00T-N1.7 | 0.82 | 0.45 | 0.30 | 0.52 |
| LingBot-VLA | 0.91 | 0.39 | 0.23 | 0.51 |
| LingBot-VLA 2.0 | 0.88 | 0.42 | 0.34 | 0.54 |
| DM0.5 | 0.88 | 0.46 | 0.35 | 0.56 |
| **StellaVLA (w/o pretraining)** | **0.88** | **0.64** | **0.52** | **0.68** |

## Requisitos de hardware

- Entrenamiento: 4 GPU H200 (NVIDIA), con batch global de 128 y 30.000 pasos. No se especifican requisitos de memoria exactos.
- Inferencia: no se publican requisitos oficiales. Al estar basado en un backbone de 4B (Qwen3-VL-4B-Instruct), se estima que puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM en cuantización ligera, aunque no hay datos confirmados por el autor.
- Despliegue: se proporciona un entorno Docker (`siyuhsu/stellavla:eval`) con soporte CUDA y GPU. No se mencionan integraciones con vLLM, llama.cpp u Ollama; el flujo de evaluación es nativo del repositorio.
- Latencia y throughput: no disponibles. El blog indica que no se usa decodificación autoregresiva en el bucle de control, lo que sugiere una latencia reducida frente a métodos que generan lenguaje intermedio, pero no se aportan cifras.

## Comparativa con modelos similares

StellaVLA se compara directamente con otros VLA de la misma categoría (modelos de manipulación robótica con generalización). La siguiente tabla resume las diferencias clave en LIBERO-Plus (zero-shot) y VLA-Arena.

| Modelo | Backbone | Parametros | Contexto | Licencia | LIBERO-Plus Avg. | VLA-Arena Overall |
| --- | --- | --- | --- | --- | ---: | ---: |
| OpenVLA | Prismatic (7B) | 7B | No disponible | Apache 2.0 | 16.0 | 0.40 (OpenVLA-OFT) |
| π₀ | Flow matching (3B) | 3B | No disponible | No disponible | 53.8 | 0.44 (π₀.₅) |
| StarVLA-OFT | Qwen2-VL (7B) | 7B | No disponible | Apache 2.0 | 75.0 | No disponible |
| **StellaVLA** | Qwen3-VL-4B-Instruct | ~4B | No disponible | Apache 2.0 | **85.1** | **0.68** |

StellaVLA supera a los baselines en ambos benchmarks con un backbone más pequeño (4B frente a 7B), lo que sugiere una mayor eficiencia paramétrica. Su ventaja principal es el mecanismo de demostraciones estructuradas in-context, que no está presente en OpenVLA ni en π₀.

## Limitaciones y advertencias

- Sesgos y alucinación: no se han publicado análisis de sesgos específicos. Como todo modelo VLA, existe riesgo de alucinación en la interpretación de escenas o instrucciones ambiguas, especialmente en entornos no vistos.
- Dependencia de la calidad de las demostraciones: el rendimiento en tareas nuevas depende de la existencia de una demostración relacionada recuperable. Si la demostración es de baja calidad o no está suficientemente relacionada, la política puede degradarse.
- Cobertura de idiomas: no se especifican los idiomas soportados; el backbone Qwen3-VL-4B-Instruct es multilingüe, pero no hay confirmación para StellaVLA.
- Evaluación limitada a benchmarks concretos: los resultados publicados cubren LIBERO, LIBERO-Plus y VLA-Arena, pero no se aportan datos de despliegue en entornos industriales reales más allá del benchmark de robot real mencionado en el paper.
- Requisitos de hardware de entrenamiento: el entrenamiento requiere 4 GPU H200, lo que limita la reproducibilidad a equipos con recursos de gama alta.
- Sin cuantizaciones oficiales: no se proporcionan versiones cuantizadas (GGUF, AWQ, etc.), por lo que el despliegue en edge o GPUs de baja VRAM requiere conversión manual no documentada.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo depende del backbone Qwen3-VL-4B-Instruct, cuya licencia original (Apache 2.0) también es permisiva; no obstante, conviene verificar los términos de los datasets de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StellarEdge/StellaVLA
- Paper (arXiv): https://arxiv.org/abs/2608.11671
- Version HTML del paper: https://arxiv.org/html/2608.11671v1
- Blog oficial: https://www.stelledge.com/blog/stellavla
- Repositorio de codigo: https://github.com/StellEdge-AI/StellaVLA
- Imagen Docker: https://hub.docker.com/r/siyuhsu/stellavla
- Leaderboard VLA-Arena: https://vla-arena.github.io/#leaderboard
- Resumen en AlphaXiv: https://www.alphaxiv.org/abs/2608.11671
