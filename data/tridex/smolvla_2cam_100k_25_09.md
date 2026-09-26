# Tridex/smolvla_2cam_100K_25_09

## Resumen

smolvla_2cam_100K_25_09 es un ajuste fino (fine-tune) del modelo base SmolVLA de Hugging Face, publicado por el usuario Tridex bajo licencia Apache 2.0. SmolVLA es un modelo visión-lenguaje-acción (VLA) compacto de 450 millones de parámetros que combina un VLM preentrenado con un "experto en acciones" entrenado mediante flow matching, y que genera secuencias (chunks) de acciones de robot condicionadas por imágenes de varias cámaras, el estado propioceptivo del robot y una instrucción en lenguaje natural.

Frente a otros VLA de gran tamaño (OpenVLA, pi0), SmolVLA está diseñado para caber y ejecutarse en hardware de consumo, lo que abarata el prototipado robótico. Este repositorio concreto no es el modelo base, sino una política especializada mediante aprendizaje por imitación sobre un único conjunto de datos: 50 episodios y 39.028 fotogramas a 30 FPS de la tarea "take the gaz cylinder and drop it", ejecutada con un brazo `so_follower` y cámaras `side` y `top`.

Su relevancia práctica es doble: por un lado, sirve como punto de partida reproducible para quien quiera entrenar tareas de pick-and-place similares con LeRobot; por otro, es un ejemplo del flujo completo de fine-tuning de SmolVLA (100.000 pasos, batch 16, AdamW, lr 1e-4) que cualquier desarrollador puede replicar en su propio robot. El repositorio no incluye resultados de evaluación ni descargas registradas en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA): VLM compacto preentrenado + experto en acciones entrenado con flow matching |
| Parámetros totales | 450.046.176 (450 millones) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de contexto textual; consume instrucción en lenguaje natural, estado propioceptivo `(6,)` e imágenes de 256 × 256 |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de modelo | política robótica (imitation learning / behavior cloning) |
| Modelo base | lerobot/smolvla_base |
| Robot objetivo | `so_follower` (brazo tipo SO-100/SO-101, 6 grados de libertad) |
| Cámaras | `side`, `top` (la tabla de entradas declara `camera1`, `camera2` y `camera3`) |
| Entradas | `observation.state` `(6,)`; imágenes `(3, 256, 256)` |
| Salidas | `action` `(6,)` |
| Tamaño del repositorio | 0,9 GB |
| Entrenamiento | 100.000 pasos, batch 16, AdamW, lr 1e-4, seed 1000, LeRobot 0.6.2 |
| Dataset de ajuste | Tridex/50_gaz_cylinder_14h_24-09_20260924_140939 (50 episodios, 39.028 fotogramas, 30 FPS) |

## Arquitectura y entrenamiento

SmolVLA, descrito en el artículo arXiv:2506.01844, es un VLA ligero compuesto por dos piezas: un VLM compacto preentrenado que codifica las vistas de cámara y la instrucción de lenguaje natural en características contextuales, y un experto en acciones entrenado con flow matching que, a partir de esas características y del estado del robot, genera un chunk de acciones. El modelo acepta múltiples vistas de cámara simultáneas y una instrucción textual que describe la tarea, y produce acciones continuas de bajo nivel para el controlador del robot.

Este repositorio concreto parte de `lerobot/smolvla_base` y se ha ajustado por imitación sobre el dataset `Tridex/50_gaz_cylinder_14h_24-09_20260924_140939`, compuesto por 50 episodios y 39.028 fotogramas capturados a 30 FPS para una única tarea: "take the gaz cylinder and drop it". La configuración de entrenamiento documentada es de 100.000 pasos con batch de 16, optimizador AdamW y tasa de aprendizaje 0,0001, usando LeRobot 0.6.2. No se documenta en la información disponible si hubo fases de RLHF, DPO u optimización adicional; en el flujo estándar de LeRobot, el ajuste es de aprendizaje por imitación supervisado sobre demostraciones.

No se detalla en el material proporcionado el número total de tokens de entrenamiento, la composición multilingüe del corpus ni si los datos provienen de simulación o de un robot real (el nombre del dataset incluye "gaz_cylinder", sin más contexto). Tampoco se especifican innovaciones adicionales propias de este fine-tune más allá de las del modelo base SmolVLA.

## Capacidades

- Generación de acciones robóticas: produce chunks de acciones de dimensión 6 (`action` `(6,)`) para un brazo `so_follower`, a partir del estado actual y de las imágenes.
- Percepción visual multi-cámara: consume hasta tres vistas de 256 × 256 píxeles (según la tabla de entradas del repositorio), lo que permite cubrir la escena desde varios ángulos.
- Condicionamiento por lenguaje natural: la tarea se especifica mediante una instrucción textual ("take the gaz cylinder and drop it"), sin necesidad de reentrenar la política para variaciones de redacción.
- Ejecución de una tarea de pick-and-place: recogida de un cilindro y depósito del mismo en la posición indicada por las demostraciones.
- Ajuste posterior (fine-tuning): puede reentrenarse con `lerobot-train` sobre datasets propios para transferir el comportamiento a tareas similares.
- Inferencia en hardware de consumo: el tamaño de 450 M de parámetros permite ejecutarlo en GPU de gama media y en plataformas embebidas.

No soporta, por su naturaleza de política robótica, capacidades propias de un LLM: no hay tool calling ni function calling, no hay razonamiento multi-paso orientado a agentes conversacionales, no genera texto libre, no procesa audio y no dispone de "thinking mode". El soporte multilingüe no está documentado.

## Casos de uso

- Automatización de pick-and-place de cilindros: la política está entrenada específicamente para tomar un cilindro de gas y depositarlo, por lo que puede desplegarse directamente en una celda con un brazo `so_follower` para esa tarea sin entrenamiento adicional.
- Base para transfer learning en tareas similares: al partir de `lerobot/smolvla_base` y estar ya adaptada a manipulación de objetos cilíndricos, sirve como punto de partida para un fine-tune con pocos episodios en tareas de agarre y colocación relacionadas.
- Prototipado de bajo coste en laboratorio: con 450 M de parámetros y 0,9 GB de pesos, permite montar un banco de pruebas de VLA sobre un brazo asequible y dos o tres cámaras USB, sin clústeres de GPU.
- Investigación en aprendizaje por imitación: el repositorio documenta la configuración exacta (100.000 pasos, batch 16, lr 1e-4, seed 1000, LeRobot 0.6.2), lo que facilita reproducir el experimento y comparar variantes.
- Comparación de configuraciones de sensores: existe una variante hermana con tres cámaras (Tridex/smolvla_3cam_100K_23_09), lo que permite evaluar experimentalmente el impacto del número de vistas en el éxito de la tarea.
- Despliegue en el borde (edge): su tamaño permite ejecutarlo en dispositivos como Jetson Orin junto al controlador del robot, evitando depender de conectividad con un servidor externo.
- Evaluación de robustez ante cambios de dominio: útil para medir la degradación de la política al variar iluminación, posición inicial del objeto o ligeras modificaciones del entorno respecto a las demostraciones originales.
- Docencia y formación en robótica: el flujo completo (grabar datos con LeRobot, entrenar con `lerobot-train`, desplegar con `lerobot-rollout`) es reproducible de principio a fin en un aula con hardware económico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La sección de evaluación de la model card indica explícitamente que no se han proporcionado resultados para esta política, y el repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, por lo que no existe validación independiente de la tasa de éxito.

## Requisitos de hardware

- Huella de pesos estimada a partir de los 450.046.176 parámetros: aproximadamente 1,8 GB en FP32, 0,9 GB en BF16/FP16 y alrededor de 0,45 GB en INT8 (el repositorio no especifica cuantizaciones soportadas).
- VRAM total estimada para inferencia en batch 1, incluyendo activaciones y tres imágenes de 256 × 256: en torno a 2-4 GB en BF16 (estimación, no confirmada por el autor).
- Cabe en GPU de consumo: sí. Bastan tarjetas con 6 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090. No se requieren A100 ni H100.
- Opciones para despliegue embebido: NVIDIA Jetson Orin o plataformas similares, dado el reducido tamaño del modelo.
- Opciones de despliegue: el flujo oficial es LeRobot (`lerobot-rollout` para inferencia en el robot, `lerobot-train` para entrenamiento o fine-tuning). Los servidores de inferencia para LLM (vLLM, TGI, llama.cpp, Ollama) no son aplicables a una política VLA, ya que no exponen una API de generación de texto.
- Latencia y throughput: no disponible en la información proporcionada. La documentación del modelo base menciona la idoneidad para hardware de consumo, pero este repositorio no publica medidas concretas de latencia por chunk de acciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Entradas | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| smolvla_2cam_100K_25_09 (esta ficha) | 450 M | 3 cámaras 256 × 256 + estado (6) + instrucción; salida acción (6) | Apache 2.0 | Hugging Face, 0 descargas | Especializado en una única tarea; sin métricas publicadas |
| lerobot/smolvla_base | 450 M | multi-cámara + estado + instrucción | Apache 2.0 | Hugging Face / LeRobot | Modelo base generalista del que deriva esta política |
| OpenVLA-7B | 7.000 M | 1 cámara + instrucción; salida acción de 7 grados de libertad | licencia heredada de Llama 2 (según su model card pública) | Hugging Face / repositorio openvla | Mucho mayor coste de inferencia; no orientado a GPU de consumo |
| pi0 (Physical Intelligence) | ~3.000 M | multi-cámara + estado + instrucción, experto en acciones con flow matching | Apache 2.0 (repositorio openpi) | Repositorio openpi / Hugging Face | Mayor capacidad, pero requiere hardware más potente que SmolVLA |

Los datos de los modelos comparados proceden de su documentación pública y deben verificarse antes de tomar decisiones de producción. No se dispone de cifras de rendimiento comparables entre estas políticas en la información proporcionada, ya que esta ficha no publica tasas de éxito.

## Limitaciones y advertencias

- Especialización extrema: está entrenado para una sola tarea ("take the gaz cylinder and drop it") y un solo tipo de objeto; no cabe esperar generalización a otras tareas sin reentrenamiento.
- Dataset reducido: 50 episodios y 39.028 fotogramas es un volumen pequeño, lo que incrementa el riesgo de sobreajuste al entorno concreto de captura (posiciones, iluminación, fondo, robot).
- Origen de los datos no documentado: no se especifica si las demostraciones se grabaron en simulación o en un robot real, ni si existe brecha sim-to-real.
- Ausencia de evaluación: no hay tasa de éxito, número de ensayos ni condiciones de prueba publicadas; cualquier afirmación de rendimiento sería especulativa.
- Sin validación de la comunidad: 0 descargas y 0 "likes" en el momento de redactar esta ficha.
- Inconsistencia en la documentación: el nombre del repositorio indica configuración de dos cámaras y las cámaras declaradas son `side` y `top`, pero la tabla de entradas lista `camera1`, `camera2` y `camera3`. Es imprescindible verificar los nombres e índices de cámara antes de desplegar, ya que deben coincidir con las claves usadas en el entrenamiento.
- Comportamiento fuera de distribución: ante objetos, posiciones o condiciones de iluminación no vistas durante el entrenamiento, la política puede generar acciones erráticas o directamente fallidas. El concepto de alucinación de un LLM no aplica, pero el modo de fallo equivalente es una acción incorrecta ejecutada con confianza.
- Idiomas: no se documenta qué lenguas entiende la instrucción de tarea; la única tarea de entrenamiento está en inglés.
- Seguridad física: al controlar un brazo robótico real, requiere parada de emergencia, límites de par y espacio de trabajo despejado. No debe operarse sin supervisión en entornos con personas.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, siempre que se conserve el aviso de licencia y el archivo de cambios; el modelo base `lerobot/smolvla_base` también es Apache 2.0, por lo que no se añaden restricciones conocidas.
- Metadatos: el repositorio figura creado el 25 de septiembre de 2026 según la información disponible, fecha poco habitual que conviene contrastar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tridex/smolvla_2cam_100K_25_09
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Tridex/50_gaz_cylinder_14h_24-09_20260924_140939
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Tridex/50_gaz_cylinder_14h_24-09_20260924_140939
- Artículo de SmolVLA (arXiv:2506.01844): https://arxiv.org/abs/2506.01844
- Versión HTML del artículo: https://arxiv.org/html/2506.01844v1
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Código fuente de la documentación de SmolVLA: https://github.com/huggingface/lerobot/blob/main/docs/source/smolvla.mdx
- Documentación general de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Variante hermana con tres cámaras: https://huggingface.co/Tridex/smolvla_3cam_100K_23_09
- Sitio divulgativo de SmolVLA: https://smolvla.net/index_en
