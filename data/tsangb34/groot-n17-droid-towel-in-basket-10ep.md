# tsangb34/groot-n17-droid-towel-in-basket-10ep

## Resumen

`tsangb34/groot-n17-droid-towel-in-basket-10ep` es una política robótica de imitación publicada en HuggingFace Hub, no un modelo de lenguaje general. Está construida sobre GR00T N1.7, el modelo fundacional *cross-embodiment* de NVIDIA para razonamiento y habilidades humanoides, que combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en *flow matching* que predice acciones condicionadas por visión, lenguaje y propiocepción. El autor del repositorio (tsangb34) ha realizado un *fine-tuning* sobre ese modelo base con LeRobot 0.6.1 para una única tarea de manipulación.

El resultado es un checkpoint de aproximadamente 3.144.016.000 parámetros (unos 3,14 mil millones) empaquetado en safetensors, con un tamaño de repositorio de 12,6 GB. La política consume dos cámaras (una frontal y otra en la muñeca, ambas a 360×640), el estado articular de 8 dimensiones y la posición cartesiana de 6 dimensiones, y emite un vector de acción de 8 dimensiones para un robot Franka. La tarea aprendida es "towel in basket", entrenada con 100 episodios y 27.395 fotogramas a 30 FPS.

Su relevancia es doble: por un lado demuestra el flujo completo de LeRobot para llevar un modelo fundacional de NVIDIA a un robot físico concreto; por otro, sirve como referencia reproducible de *fine-tuning* (8.570 pasos, batch 32, AdamW, learning rate 1e-4, semilla 1000). No obstante, es un artefacto de nicho: cero descargas, cero *likes* y ninguna evaluación en robot real publicada en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone VLM Cosmos-Reason2/Qwen3-VL + transformer de acciones con *flow matching* |
| Parámetros totales | 3.144.016.000 (≈3,14 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo distribuido en safetensors, 12,6 GB; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible; la política se condiciona por una instrucción de tarea en texto (en el dataset, únicamente "towel in basket") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | Franka |
| Cámaras | `left_image`, `wrist` (360×640, 3 canales) |
| Observaciones | `observation.state` (8,), `observation.cartesian_position` (6,) |
| Salida | `action` (8,) |
| Frecuencia de los datos | 30 FPS |
| Fecha de publicación | 2026-10-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es GR00T N1.7 de NVIDIA: un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) que procesa las imágenes de cámara junto con la instrucción textual y el estado propioceptivo, y un transformer de acciones entrenado con *flow matching* que genera trayectorias de acción continuas en lugar de tokens discretos. Este diseño de *action head* generativo permite modelar distribuciones multimodales de acciones, algo relevante en manipulación con objetos deformables donde existen varias formas válidas de ejecutar la tarea. El modelo es *cross-embodiment*: el mismo tronco se comparte entre morfologías distintas y la cabeza de acción se adapta a la dimensionalidad del robot concreto (aquí, 8 dimensiones).

El *fine-tuning* se realizó con LeRobot 0.6.1 sobre el dataset `local/droid-towel-in-basket-left-wrist`, derivado de DROID, con 100 episodios, 27.395 fotogramas a 30 FPS y la instrucción "towel in basket". La configuración reportada es de 8.570 pasos de entrenamiento, batch de 32, optimizador AdamW, learning rate 0,0001 y semilla 1000. No se documenta el número total de tokens vistos, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO (en robótica de imitación no es lo habitual). El identificador del repositorio incluye el sufijo "10ep", que no coincide con los 100 episodios declarados en la *model card*; la diferencia podría corresponder al número de épocas, pero no se especifica.

## Capacidades

- Generación de acciones de manipulación de 8 dimensiones condicionadas por dos vistas de cámara, estado articular y posición cartesiana.
- Seguimiento de instrucciones de tarea en lenguaje natural, en el marco del paradigma visión-lenguaje-acción de GR00T.
- Razonamiento visoespacial heredado del backbone Cosmos-Reason2/Qwen3-VL para localizar objetos y planificar la aproximación.
- Ejecución de una tarea concreta de recogida y depósito de un objeto deformable (toalla) en un contenedor (cesta).
- Control continuo a la frecuencia de los datos de entrenamiento (30 FPS), adecuado para lazos de control de un robot Franka.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo conversacional).
- Soporte de agentes y razonamiento multi-paso: no documentado a nivel de política; la planificación multi-paso depende del *action head*, no de un bucle de agente explícito.
- Capacidades multilingües: no disponible; no se ha entrenado ni evaluado con instrucciones en castellano.
- Modo *thinking*, visión general, audio o generación de texto libre: no disponible en este checkpoint (el backbone VLM se usa como extractor de representaciones, no como modelo generativo expuesto).

## Casos de uso

- **Automatización de una celda de manipulación con Franka**: cargar la política con `lerobot-rollout` y ejecutar la tarea "towel in basket" en un brazo real provisto de cámara frontal y de muñeca, aprovechando que las dimensiones de observación y acción ya coinciden con el robot objetivo. Es el uso directo para el que se publicó el checkpoint.
- **Punto de partida para *fine-tuning* con datos propios**: al ser un modelo fundacional con licencia Apache 2.0, sirve como inicialización para tareas de plegado, recogida o clasificación de textiles con pocas horas de demostraciones, reduciendo el coste frente a entrenar desde cero.
- **Validación de pipelines de LeRobot en CI**: el repositorio permite comprobar de extremo a extremo el circuito dataset → `lerobot-train` → `lerobot-rollout` con una configuración conocida (8.570 pasos, lr 1e-4, batch 32, semilla 1000), útil como prueba de regresión cuando se actualiza la librería.
- **Baseline reproducible para investigación en imitación**: la semilla y los hiperparámetros están documentados, lo que permite comparar variantes (por ejemplo, distintas tasas de aprendizaje o aumentos de datos) contra una referencia fija en una tarea acotada.
- **Prototipos de logística ligera con objetos deformables**: recogida de trapos, textiles o material blando y depósito en contenedores, un caso donde los objetos no tienen pose rígida y los métodos de *grasping* clásicos fallan.
- **Docencia y divulgación en robótica de aprendizaje**: desplegar una política basada en un modelo fundacional de NVIDIA en un laboratorio universitario con hardware de gama alta (*consumer*) y mostrar el ciclo completo de imitación.
- **Evaluación de robustez ante perturbaciones**: variar iluminación, posición inicial del objeto o ligeros cambios de calibración de cámara para medir la degradación de la política, aunque no exista una tasa de éxito publicada de referencia.
- **Integración en un stack de robot de servicio**: usar la política como capa de habilidad de bajo nivel dentro de un sistema mayor que aporte percepción, navegación y asignación de tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* incluye la sección de evaluación con la plantilla vacía y la nota explícita: "No evaluation results have been provided for this policy yet". No hay tasas de éxito, número de ensayos ni condiciones de evaluación en robot real, ni métricas de *offline* tipo MSE de acción sobre el conjunto de validación.

## Requisitos de hardware

- **Peso de los pesos**: 3,144 mil millones de parámetros. En bf16/fp16 equivalen a unos 6,3 GB; en fp32, unos 12,6 GB (coherente con el tamaño del repositorio, 12,6 GB).
- **VRAM estimada para inferencia**: como mínimo 12-16 GB en bf16, sumando pesos, activaciones del backbone VLM con dos imágenes de 360×640, buffers de CUDA y el *runtime* de LeRobot. Se recomienda 24 GB para operar con margen.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100 o L40S para entrenamiento y despliegue en laboratorio; RTX 4090 o RTX 3090 (24 GB) para inferencia y *fine-tuning* ligero.
- **¿Cabe en GPU de consumo?**: sí, en RTX 4090 y RTX 3090 de 24 GB. En tarjetas de 16 GB (RTX 4080, 4070 Ti Super) el despliegue es ajustado y no está verificado. Por debajo de 12 GB no es viable sin cuantización, y no se publican pesos cuantizados.
- **Opciones de despliegue**: `lerobot-rollout` (CLI oficial) con PyTorch y CUDA; entrenamiento con `lerobot-train`. No aplica vLLM, TGI, llama.cpp ni Ollama, al no ser un modelo de lenguaje autoregresivo estándar.
- **Latencia y throughput**: no disponibles. Los datos se capturan a 30 FPS, lo que sugiere un lazo de control en ese orden de magnitud, pero no se documenta la latencia real de inferencia ni el *throughput* de políticas por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / horizonte | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (GR00T N1.7 fine-tuned) | 3,14 mil millones | no disponible | sin evaluación publicada | Apache 2.0 | HuggingFace Hub, 0 descargas |
| GR00T N1.7 base (NVIDIA) | no disponible en esta ficha | no disponible | no verificado aquí | ver licencia del modelo base de NVIDIA | GitHub `NVIDIA/Isaac-GR00T` |
| GR00T N1.5 / versiones previas | no disponible | no disponible | no disponible | no verificado | HuggingFace / NVIDIA |
| Políticas de imitación tipo Diffusion Policy o ACT (LeRobot) | del orden de decenas de millones | horizonte de acción corto | dependiente del dataset | Apache 2.0 en LeRobot | amplia en el Hub |

No se dispone en la información proporcionada de cifras verificables de modelos comparables (π0, OpenVLA, RDT-1B) para construir una comparación cuantitativa fiable; cualquier número aportado sería una estimación no contrastada. La comparación cualitativa relevante es que este checkpoint es un caso de *fine-tuning* de un modelo fundacional de 3,14 mil millones de parámetros, frente a políticas de imitación específicas mucho más pequeñas y de entrenamiento desde cero.

## Limitaciones y advertencias

- **Sesgo de tarea única**: entrenado exclusivamente con la instrucción "towel in basket" y 100 episodios; es esperable un sobreajuste al entorno, a la posición de la cesta y al aspecto de la toalla del dataset. No generalizará a otras tareas sin *fine-tuning*.
- **Sin métricas de éxito**: no hay ninguna evaluación en robot real ni *offline*, por lo que se desconoce la tasa de éxito y el régimen de fallo. Cualquier afirmación de rendimiento sería especulativa.
- **Acoplamiento al hardware**: asume un robot Franka, dos cámaras con nombres y calibración concretos (`left_image`, `wrist`) y una dimensionalidad de estado/acción de 8. Cambiar la montura de las cámaras o el robot invalida la política.
- **Riesgo de alucinación**: en el sentido textual no aplica; el fallo se manifiesta como acciones erróneas, oscilaciones o acumulación de error a lo largo del episodio, sin señal de confianza asociada.
- **Idioma**: no hay evidencia de soporte de instrucciones en castellano; el condicionamiento textual se limita a la frase de entrenamiento en inglés.
- **Dataset no público**: la referencia `local/droid-towel-in-basket-left-wrist` apunta a una ruta local, no a un repositorio del Hub verificable, lo que impide reproducir el entrenamiento tal cual.
- **Ambigüedad del identificador**: el sufijo "10ep" del nombre no concuerda con los 100 episodios declarados; conviene confirmar con el autor antes de asumir una configuración concreta.
- **Licencia**: el checkpoint se publica como Apache 2.0, lo que permite uso comercial, pero el modelo base GR00T N1.7 y el backbone Qwen3-VL/Cosmos-Reason2 tienen sus propios términos, no verificados en esta ficha. En producción conviene revisarlos por separado.
- **Madurez**: cero descargas y cero *likes* en el momento de la consulta; no hay evidencia de uso por terceros ni de soporte del autor.
- **Requisitos de seguridad física**: al tratarse de una política que controla un brazo real, es obligatorio operar con límites de par, paradas de emergencia y espacio de trabajo despejado; un fallo del modelo puede provocar colisiones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tsangb34/groot-n17-droid-towel-in-basket-10ep
- Dataset referenciado: https://huggingface.co/datasets/local/droid-towel-in-basket-left-wrist
- Repositorio GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y *rollout*: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset

Nota: la búsqueda web realizada no devolvió ningún resultado relacionado con este modelo (los resultados obtenidos eran recursos de texturas de Roblox), por lo que no se han podido añadir enlaces adicionales a artículos, papers o demos.
