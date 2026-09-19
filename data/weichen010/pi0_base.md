# weichen010/pi0_base

## Resumen

π₀ (Pi0) es un modelo fundacional de tipo Vision-Language-Action (VLA) desarrollado por Physical Intelligence que razona de forma conjunta sobre visión, lenguaje y acciones para controlar robots. Se trata de la arquitectura base sobre la que se construyó posteriormente π₀.₅ y su generalización en entornos abiertos. El checkpoint catalogado aquí, `weichen010/pi0_base`, es una reproducción alojada por un tercero del checkpoint base distribuido originalmente por el equipo de LeRobot, con 3.501.372.176 parámetros (~3,5 mil millones) y un repositorio de 14,0 GB.

A diferencia de un LLM convencional, el modelo no genera texto como salida principal, sino acciones continuas de robot. Sus entradas son imágenes de múltiples vistas de cámara, el estado propioceptivo del robot (proprio/state) y, opcionalmente, una instrucción en lenguaje natural. El objetivo de entrenamiento es *flow matching* y la representación de salida es una acción continua, lo que lo sitúa en la familia de modelos de imitación (imitation learning) para robótica de manipulación.

Su relevancia actual radica en que la implementación de LeRobot permite cargar el modelo con `PI0Policy.from_pretrained()`, fine-tunearlo con `lerobot-train` sobre datasets propios en formato LeRobot y evaluarlo en hardware real con `lerobot-record` (por ejemplo, un brazo SO-100 follower). Es, por tanto, una pieza de infraestructura para investigación aplicada en robótica, no un modelo de propósito general para texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) con objetivo de *flow matching*; detalles del backbone no disponibles |
| Parámetros totales | 3.501.372.176 (~3,5 mil millones) |
| Parámetros activos | No aplica: no hay indicios de que sea un modelo MoE en la información disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada; los pesos se distribuyen en safetensors y el ejemplo de entrenamiento usa `bfloat16` |
| Idiomas soportados | `en` (inglés) |
| Licencia | Gemma (`license:gemma`) |
| Formato de pesos | safetensors |
| Librería | `lerobot` |
| Pipeline | robotics |
| Entradas | Imágenes (múltiples vistas), propiocepción/estado, instrucción de lenguaje opcional |
| Salidas | Acciones continuas |
| Objetivo de entrenamiento | Flow matching |
| Uso previsto (según autor) | Modelo base para fine-tuning en un caso de uso concreto |
| Tamaño del repositorio | 14,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación / actualización | 2026-09-19 / 2026-09-19 |

## Arquitectura y entrenamiento

La model card describe un modelo VLA que combina percepción visual multivista, estado propioceptivo y lenguaje para producir acciones continuas mediante un objetivo de *flow matching*. El *flow matching* genera trayectorias de acción como un campo vectorial continuo, en lugar de discretizar las acciones como tokens, lo que encaja con el control continuo de articulaciones robóticas. La implementación de LeRobot sigue el código de referencia original de Physical Intelligence para mantener compatibilidad, y el propio autor indica que la implementación de LeRobot replica el comportamiento del repositorio `openpi`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF, DPO u otro ajuste por preferencias. Tampoco se detallan innovaciones técnicas concretas (decodificación especulativa, mecanismos de atención lineal, etc.) más allá del uso de *flow matching* y de la representación continua de acciones. El flujo de fine-tuning documentado utiliza `lerobot-train` con `--policy.dtype=bfloat16`, `--policy.device=cuda` y parámetros de política como `chunk_size`, `n_action_steps`, `max_action_tokens` y `gradient_checkpointing`.

## Capacidades

- Generación de acciones continuas para control de robots manipuladores.
- Razonamiento conjunto visión-lenguaje-acción: procesa imágenes de varias cámaras a la vez.
- Integración de propiocepción (estado del robot) como entrada adicional al pipeline visual y lingüístico.
- Seguimiento de instrucciones en lenguaje natural de forma opcional y complementaria a la percepción.
- Fine-tuning supervisado sobre datasets en formato LeRobot para tareas específicas de manipulación.
- Evaluación en bucle cerrado sobre hardware real mediante el script `lerobot-record`.
- Soporte de *tool calling* / *function calling*: no disponible (no es una capacidad descrita para este modelo).
- Soporte de agentes y razonamiento multi-paso en el sentido de agentes de software: no aplica ni está documentado.
- Capacidades multilingües: solo inglés (`en`).
- Modo *thinking*, visión para descripción de imágenes, audio o generación de texto libre: no disponible; el modelo no está orientado a esas tareas.

## Casos de uso

- **Manipulación con brazos de bajo coste (SO-100/SO-101)**: el ejemplo oficial de `lerobot-record` usa un `so100_follower` con dos cámaras (OpenCV e Intel RealSense) y una instrucción de tarea, lo que permite desplegar el modelo fine-tuneado en hardware accesible para laboratorios y aficionados avanzados.
- **Pick and place industrial ligero**: tareas como "poner un ladrillo de Lego en la caja transparente" descritas en la model card ilustran la recogida y colocación de objetos con una instrucción textual y varias vistas de cámara.
- **Investigación en modelos VLA como baseline**: sirve como punto de partida reproducible para comparar arquitecturas de *flow matching* frente a alternativas de imitación, gracias a la compatibilidad con el ecosistema LeRobot.
- **Aprendizaje por imitación a partir de demostraciones**: con `lerobot-train` se puede fine-tunear sobre un dataset propio de teleoperación y obtener una política específica para una celda de trabajo.
- **Automatización de tareas repetitivas en laboratorio**: clasificación, apilado o inserción de piezas donde el modelo se adapta al entorno mediante fine-tuning con pocas horas de datos.
- **Evaluación sistemática de políticas robóticas**: el script `lerobot-record` permite ejecutar y grabar N episodios de evaluación (por ejemplo, 10) con la política entrenada, generando métricas de éxito reproducibles.
- **Docencia y prototipado en robótica**: al ser un modelo base con licencia Gemma y código abierto en LeRobot, es adecuado para cursos y proyectos que necesiten un VLA funcional sin entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas de éxito en tareas robóticas. Los resultados de búsqueda web facilitados no contienen información relevante sobre el modelo (corresponden a páginas de Google Maps y Google Earth), por lo que no se pueden contrastar cifras de rendimiento ni comparaciones externas.

## Requisitos de hardware

- **Pesos en `bfloat16`**: aproximadamente 7 GB (estimación propia a partir de 3.501.372.176 parámetros × 2 bytes).
- **Pesos en `float32`**: aproximadamente 14 GB, coherente con el tamaño de 14,0 GB del repositorio.
- **VRAM para inferencia**: no disponible como dato oficial; como estimación, con imágenes multivista y el codificador visual se necesita previsiblemente un margen adicional sobre los pesos, en el rango de 10-20 GB según resolución y número de cámaras.
- **VRAM para fine-tuning**: no disponible; el ejemplo oficial usa `bfloat16`, `batch_size=4` y ofrece `gradient_checkpointing`, lo que sugiere que se puede entrenar en GPUs de 24 GB o más, aunque no se confirma.
- **GPU recomendadas**: no hay recomendaciones oficiales en la información disponible. Por tamaño, cabría en RTX 3090/4090 (24 GB) para inferencia y fine-tuning ligero, y en A100 (40/80 GB) o H100 para lotes mayores.
- **¿Cabe en GPU de consumo?**: probablemente sí para inferencia en `bfloat16` en GPUs de 24 GB, según la estimación anterior; no confirmado por el autor.
- **Opciones de despliegue**: ecosistema LeRobot (`PI0Policy`, `lerobot-train`, `lerobot-record`) sobre PyTorch. vLLM, TGI, llama.cpp u Ollama no aparecen como opciones soportadas, ya que el modelo no genera texto.
- **Latencia y throughput**: no disponible. Para control robótico en tiempo real es un dato crítico que no se especifica en la información proporcionada.
- **Instalación**: `pip install "lerobot[pi]@git+https://github.com/huggingface/lerobot.git"`, con dependencias opcionales como ffmpeg para torchcodec.

## Comparativa con modelos similares

La información proporcionada no incluye datos comparativos de otros modelos VLA. La única referencia interna es π₀.₅, mencionado en la model card como el modelo posterior que aprovecha la arquitectura de π₀ para lograr generalización en entornos abiertos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| π₀ (`weichen010/pi0_base`) | 3.501.372.176 | No disponible | Gemma | HuggingFace (checkpoint de terceros) | No disponible |
| π₀.₅ | No disponible | No disponible | No disponible | No disponible en la información proporcionada | No disponible |
| Otros VLA de la misma categoría | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El checkpoint está publicado por el usuario `weichen010`, no por Physical Intelligence ni por HuggingFace. El checkpoint de referencia en la documentación de LeRobot es `lerobot/pi0_base`; conviene verificar la procedencia antes de usarlo.
- El repositorio registra 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- La model card declara `inference: false` en el *front matter*, mientras que el propio README incluye ejemplos de inferencia y evaluación en hardware real. Es una contradicción que conviene resolver antes de desplegarlo.
- No se documentan datos de entrenamiento, composición del dataset ni proceso de alineación, por lo que los sesgos del modelo son desconocidos.
- Riesgo de alucinación trasladado al dominio físico: una predicción incorrecta no produce texto erróneo, sino una acción de robot potencialmente peligrosa. Es necesario aplicar límites de seguridad y paradas de emergencia.
- Solo soporta inglés (`en`) como idioma de instrucción; no hay soporte multilingüe documentado.
- No es un modelo de chat ni de generación de texto; usarlo fuera del dominio robótico no está soportado.
- La licencia es Gemma, cuyos términos imponen condiciones específicas de uso (incluidas obligaciones de atribución y restricciones de uso aceptable). Hay que revisarlos antes de cualquier explotación comercial.
- No hay información sobre latencia, frecuencia de control ni *throughput*, datos esenciales para valorar su viabilidad en un bucle de control en tiempo real.
- Los resultados de búsqueda web aportados no contienen información técnica del modelo, por lo que parte de esta ficha se basa exclusivamente en la model card y en los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weichen010/pi0_base
- Checkpoint base referenciado en el README: https://huggingface.co/lerobot/pi0_base
- Implementación de referencia (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de instalación de LeRobot: https://huggingface.co/docs/lerobot/installation
- Script de grabación y evaluación: https://github.com/huggingface/lerobot/blob/main/src/lerobot/scripts/lerobot_record.py
- Dataset de ejemplo citado: https://huggingface.co/datasets/lerobot/libero
- Paper original citado en la model card: "π0: A Vision-Language-Action Flow Model for General Robot Controlion" (sin URL en la información proporcionada)
