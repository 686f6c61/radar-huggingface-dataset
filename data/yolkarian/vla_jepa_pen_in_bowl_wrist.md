# yolkarian/vla_jepa_pen_in_bowl_wrist

## Resumen

VLA-JEPA es un marco de preentrenamiento de políticas visión-lenguaje-acción (VLA) que combina un backbone VLM con un modelo del mundo latente de estilo JEPA; el artículo corresponde a ECCV 2026 y está publicado en arXiv (2602.10098). Este repositorio concreto, `yolkarian/vla_jepa_pen_in_bowl_wrist`, es un espejo sin modificar de `fouad1233/vla_jepa_pen_in_bowl_wrist` (Apache-2.0) y contiene un ajuste fino de la política para una única tarea de manipulación con un brazo SO-101: coger un bolígrafo y dejarlo en un cuenco.

El modelo parte del checkpoint `lerobot/VLA-JEPA-SimplerEnv` y se ha entrenado con LeRobot sobre 100 demostraciones teleoperadas (65.550 fotogramas) capturadas únicamente con una cámara de muñeca montada en la pinza. La arquitectura usa Qwen3-VL-2B como backbone (imagen + texto de la tarea) y una cabeza de acción DiT con flow matching que predice 30 consignas articulares (un segundo a 30 fps). El total de parámetros del checkpoint es de 2.770.329.478 (unos 2,77 mil millones).

Su relevancia es doble: por un lado, demuestra el flujo completo de ajuste de una política VLA-JEPA a un robot de bajo coste con una sola cámara y 6 grados de libertad; por otro, sirve como referencia reproducible de ingeniería, porque el espejo documenta los fallos corregidos sobre LeRobot v0.6.0, el consumo real de VRAM (5,9 GiB en inferencia) y el coste de reentrenamiento en una única RTX 5090. No hay evaluación en un robot físico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida: backbone Qwen3-VL-2B (visión-lenguaje) + cabeza de acción DiT con flow matching; modelo del mundo V-JEPA2 solo en entrenamiento |
| Parámetros totales | 2.770.329.478 (~2,77 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible. Ventana temporal de entrenamiento: 8 fotogramas muestreados cada 4 (~1 s a 30 Hz); horizonte de acción de 30 pasos |
| Tipos de cuantización | No disponible; el autor solo documenta bf16 (entrenamiento e inferencia) |
| Idiomas soportados | No disponible; las instrucciones de tarea se proporcionan en inglés en los ejemplos |
| Licencia | Apache-2.0 (obra derivada; atribución al autor original `fouad1233`) |
| Formato de pesos | safetensors (repositorio LeRobot, 6,2 GB), más `config.json` y ficheros de procesador |
| Entradas | `observation.images.wrist` (3×480×640), `observation.state` (6) |
| Salidas | `action` (6 dimensiones: 5 articulaciones + pinza continua en chunks de 30) |
| Librería / pipeline | `lerobot`, `pipeline_tag: robotics` |
| Modelo base | `lerobot/VLA-JEPA-SimplerEnv` |

## Arquitectura y entrenamiento

La política sigue el esquema de dos etapas de VLA-JEPA: preentrenamiento JEPA con un modelo del mundo latente y posterior ajuste de la cabeza de acción. En este checkpoint, el backbone es Qwen3-VL-2B, que procesa la imagen de muñeca redimensionada a 224×224 junto con el texto de la tarea. La cabeza de acción es un transformer de difusión (DiT) con flow matching que emite 30 objetivos articulares consecutivos, es decir, un segundo de control a 30 fps. Durante el entrenamiento, un codificador de vídeo V-JEPA2 junto con un predictor aprenden a predecir los latentes del fotograma futuro de la cámara de muñeca; esa señal moldea las representaciones del backbone, pero no se usa en inferencia (aunque el `config.json` referencia `facebook/vjepa2-vitl-fpc64-256` y LeRobot lo descarga en la primera carga).

El ajuste fino se hizo sobre `fouad1233/so101_pen_in_bowl_wrist` (100 demostraciones, 65.550 fotogramas; 90 para entrenamiento y las 10 últimas para validación), con 8 épocas, 58.128 pasos, batch 8 en una sola RTX 5090, bf16 y AdamW con lr 5e-05 y decaimiento coseno. Se readaptaron las capas de proyección de acción y estado a 6 dimensiones (5 articulaciones más pinza continua, sin binarizar) y se fijó chunk de 30. Sobre LeRobot v0.6.0 se aplicaron tres correcciones: la cabeza de acción recibe el estado articular actual (la versión original le pasaba el último estado de la ventana de 8 fotogramas, es decir, uno futuro), las imágenes se redimensionan a 224×224 también en entrenamiento y los 8 fotogramas del modelo del mundo se toman cada 4 fotogramas. El checkpoint publicado es el paso 14.532 (época 2), el de menor pérdida de validación (0,1933); las épocas 4, 6 y 8 empeoran (0,2143, 0,2484 y 0,2777), lo que indica sobreajuste a partir de la segunda época.

## Capacidades

- Manipulación robótica de una sola tarea: coger un bolígrafo y depositarlo en un cuenco con un brazo SO-101 de 6 grados de libertad (5 articulaciones más pinza).
- Generación de acciones continuas en chunks de 30 pasos (1 s a 30 fps), con control de pinza continuo en lugar de apertura/cierre binario.
- Percepción con cámara de muñeca exclusivamente: no requiere cámara de tercera persona ni estado del entorno global.
- Condicionamiento por instrucción en lenguaje natural (por ejemplo, "Pick up the pen and put it in the bowl"), aunque el entrenamiento se limita a una única instrucción.
- Seguimiento del estado articular propio (`observation.state`, 6 dimensiones) como entrada adicional a la imagen.
- No soporta tool calling, function calling, razonamiento multi-paso en texto, ni generación de código o matemáticas: es una política de control motor, no un asistente conversacional.
- Sin capacidades de audio ni de visión general; la rama de modelo del mundo no está activa en inferencia.

## Casos de uso

- Recogida y depósito de objetos pequeños en laboratorio: el modelo ejecuta la tarea completa de coger el bolígrafo y soltarlo en el cuenco a partir de la imagen de muñeca y las posiciones articulares, con un horizonte de 30 acciones por inferencia.
- Base para ajuste fino en tareas de pick-and-place: al estar adaptado a 6 dimensiones de acción/estado y pinza continua, sirve como inicialización para nuevas tareas sobre el mismo SO-101 con un conjunto reducido de demostraciones teleoperadas.
- Configuraciones robóticas de bajo coste y espacio reducido: al depender solo de una cámara de muñeca, encaja en montajes donde no hay sitio o presupuesto para una cámara cenital o de tercera persona.
- Evaluación de la receta VLA-JEPA: permite reproducir el pipeline de preentrenamiento con modelo del mundo y ajuste de cabeza de acción sin reentrenar desde cero, comparando pérdidas de validación por época.
- Recolección de datos y control de calidad de demos: ejecutando la política sobre fotogramas del propio dataset se detectan desalineaciones de cámara, calibración o formato antes de lanzar un entrenamiento largo.
- Docencia y formación en robótica: un brazo SO-101, una GPU de gama alta para consumidor y LeRobot permiten montar una práctica completa de entrenamiento e inferencia de una política VLA en unas pocas horas.
- Referencia de rendimiento en hardware: con 5,9 GiB de VRAM pico y unos 30 ms por chunk de 30 pasos en una RTX 5090, sirve para medir latencia real de despliegue antes de invertir en GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este checkpoint no incluye métricas de éxito en robot ni comparaciones con otras políticas; solo reporta pérdida de validación por checkpoint, que no es un benchmark de tarea.

| Checkpoint | Época | Pérdida de validación |
|---|---|---|
| `014532` (publicado) | 2 | 0,1933 (mínima) |
| `029064` | 4 | 0,2143 |
| `043596` | 6 | 0,2484 |
| `058128` | 8 | 0,2777 |

El artículo de VLA-JEPA reporta mejoras de generalización y robustez frente a métodos anteriores en LIBERO, LIBERO-Plus, SimplerEnv y tareas de manipulación reales, pero en la información disponible no se incluyen las cifras concretas ni resultados de este ajuste fino en particular. El autor indica explícitamente que el modelo no se ha evaluado en un robot real.

## Requisitos de hardware

- VRAM en inferencia: 5,9 GiB pico en bf16, medido sobre fotogramas del dataset de entrenamiento con LeRobot 0.6.2 (torch 2.11.0+cu128) en una RTX 5090.
- VRAM en ajuste fino completo: batch 8 agota la memoria de 32 GB; batch 4 con acumulación de gradiente 2 funciona con un pico de unos 30,5 GB.
- GPU recomendadas por el autor: una sola GPU de 24-32 GB (RTX 4090, RTX 5090, A100 40 GB, H100). Por consumo medido, la inferencia cabe en tarjetas de 8-16 GB, aunque esa configuración no está validada en la model card.
- Cabe en GPU de consumidor: sí, para inferencia en cualquier tarjeta con más de 6 GB; para reentrenamiento hace falta una tarjeta de 32 GB o uso de acumulación de gradiente y batch reducido.
- Despliegue: `lerobot-rollout` con `--policy.path` apuntando al repositorio, `--policy.device=cuda` y `--policy.n_action_steps=15`; en la primera carga se descargan también `Qwen/Qwen3-VL-2B-Instruct` y `facebook/vjepa2-vitl-fpc64-256`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI: es una política de control motriz, no un LLM de texto, y no se publican pesos GGUF.
- Latencia y throughput: unos 30 ms por chunk de 30 acciones en una RTX 5090, lo que permite replanificar a unos 33 chunks por segundo en teoría; con `n_action_steps=15` la replanificación efectiva ocurre cada 500 ms mientras se ejecutan 15 acciones a 30 fps.
- Requisitos mecánicos y de captura: brazo SO-101 con pinza, puerto serie (`/dev/ttyACM0`), cámara a 640×480 y 30 fps en la clave `wrist`, montada en la pinza con los dedos en la parte superior de la imagen y sin rotación, partiendo de la pose inicial de las demostraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolkarian/vla_jepa_pen_in_bowl_wrist` (este) | 2,77 B | 30 acciones por chunk (~1 s a 30 fps) | Pick-and-place de bolígrafo en cuenco, SO-101, solo cámara de muñeca | Apache-2.0 | Pesos en Hugging Face (espejo) |
| `lerobot/VLA-JEPA-SimplerEnv` (base) | 2,77 B heredados (no verificado en la información disponible) | Mismo esquema de chunk; ventana de contexto no disponible | Política generalista preentrenada en SimplerEnv | No disponible | Hugging Face |
| `Qwen/Qwen3-VL-2B-Instruct` (componente del backbone) | ~2 B (no detallado) | No disponible | VLM de propósito general (texto e imagen) | No disponible | Hugging Face |
| Otras políticas VLA abiertas (OpenVLA, π0, SmolVLA, etc.) | No disponible | No disponible | Manipulación generalista | No disponible | No disponible |

No se dispone de datos verificables en la información proporcionada para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría; la comparación relevante y documentada es con el checkpoint base del que deriva.

## Limitaciones y advertencias

- Política de una sola tarea y una sola instrucción: no generaliza a otras frases ni a otros objetos sin reentrenamiento.
- Sin evaluación en robot real: todas las métricas proceden de pérdida de validación sobre 10 demostraciones retenidas; el éxito físico de la tarea está sin verificar.
- Sobreajuste temprano: la mejor pérdida de validación está en la época 2 (paso 14.532) y empeora en las épocas 4, 6 y 8.
- Dependencia estricta del montaje: clave de cámara `wrist`, resolución 640×480, dedos en la parte superior de la imagen, sin rotación, y arranque desde la pose inicial de las demostraciones. Cualquier desviación degrada la política sin aviso.
- Percepción limitada a la muñeca: sin vista global, la política puede perder el objeto si sale del campo de visión de la pinza.
- Dataset pequeño y sesgado: 100 demostraciones de un único operador, robot y entorno; no hay información sobre variedad de iluminación, fondos u objetos.
- Idiomas: la información disponible no documenta capacidades multilingües; los ejemplos de instrucción están en inglés y el condicionamiento textual se limita a la tarea entrenada.
- Licencia Apache-2.0: permite uso comercial y modificaciones con atribución y conservación del aviso; parte del código del proyecto original deriva de starVLA y otros proyectos con sus propias licencias.
- Este repositorio es un espejo no modificado: los pesos y configuraciones son idénticos al original, pero el mantenimiento, las issues y cualquier actualización corresponden al autor original `fouad1233`.
- Caveat de despliegue: `max_relative_target=5` en el ejemplo limita el salto relativo por consigna; relajar ese valor sin análisis puede producir movimientos bruscos.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto libre), pero sí existe riesgo de acciones fuera de distribución ante entradas visuales no vistas.

## Enlaces

- Modelo en Hugging Face (espejo): https://huggingface.co/yolkarian/vla_jepa_pen_in_bowl_wrist
- Repositorio original: https://huggingface.co/fouad1233/vla_jepa_pen_in_bowl_wrist
- Ficheros del modelo original: https://huggingface.co/fouad1233/vla_jepa_pen_in_bowl_wrist/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/fouad1233/so101_pen_in_bowl_wrist
- Modelo base: https://huggingface.co/lerobot/VLA-JEPA-SimplerEnv
- Documentación de VLA-JEPA en LeRobot: https://huggingface.co/docs/lerobot/vla_jepa
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Artículo VLA-JEPA (arXiv): https://arxiv.org/abs/2602.10098
- Artículo en PDF: https://arxiv.org/pdf/2602.10098
- Código oficial: https://github.com/ginwind/VLA-JEPA
- Resumen del artículo: https://arxivsignals.io/papers/2602.10098
- Backbone descargado en la primera carga: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
- Codificador V-JEPA2 referenciado en `config.json`: https://huggingface.co/facebook/vjepa2-vitl-fpc64-256
