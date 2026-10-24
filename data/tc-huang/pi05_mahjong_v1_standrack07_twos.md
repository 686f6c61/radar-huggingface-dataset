# tc-huang/pi05_mahjong_v1_standrack07_twos

## Resumen

`tc-huang/pi05_mahjong_v1_standrack07_twos` es un ajuste fino del modelo visión-lenguaje-acción (VLA) `lerobot/pi05_base`, publicado por el usuario tc-huang en Hugging Face. El modelo parte de la familia pi0.5 y se ha entrenado con LeRobot 0.6.1 sobre el *dataset* `mahjong_v1_standrack07_twos`, una colección de demostraciones en simulación (Isaac Lab) en las que un brazo robótico SO-101 manipula fichas de mahjong sobre un soporte vertical. El resultado es una política de control extremo a extremo: recibe imágenes de cámara más el estado del robot y produce acciones motrices, en lugar de texto.

El interés de la ficha es acotado pero claro: sirve como ejemplo reproducible de un *pipeline* completo de ajuste fino de un VLA sobre un robot de bajo coste (SO-101) en un entorno simulado, con todos los hiperparámetros del entrenamiento documentados en la *model card* (20.000 pasos, batch de 12, precisión float32, codificador visual descongelado). No es un modelo de propósito general ni un modelo de lenguaje: es un artefacto de investigación en robótica, especializado en una única tarea.

El repositorio pesa 66,3 GB e incluye los pesos en `safetensors` (4.143.404.816 parámetros) junto con los *checkpoints* intermedios guardados cada 5.000 pasos en ramas `step-<step>`. No consta licencia, ni idiomas soportados, ni resultados de benchmarks publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (*vision-language-action*) derivada de pi0.5; incluye codificador visual y política de acciones (detalle interno no documentado en la *model card*) |
| Parámetros totales | 4.143.404.816 (≈4,14 B) |
| Parámetros activos | No disponible (no se documenta una arquitectura MoE) |
| Longitud de contexto | No disponible (entrada multimodal: imágenes 224×224, estado del robot e instrucción; sin contexto de texto largo documentado) |
| Tipos de cuantización | Pesos en float32 según la *model card*; no se publican variantes cuantizadas (GGUF, int8, etc.) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la *model card* no la especifica; las imágenes de entrenamiento incluyen material CC BY-SA 4.0) |
| Formato de pesos | `safetensors` (librería `lerobot`) |
| Pipeline | `robotics` |
| Modelo base | `lerobot/pi05_base` (revisión `main`) |
| Dataset de ajuste fino | `mahjong_v1_standrack07_twos` |
| Entorno de simulación | Isaac Lab (brazo SO-101) |
| Resolución de entrada | `front_cam` y `front_cam_right` a 224×224; `gripper_cam` reescalada con antialiasing |
| Tamaño del repositorio | 66,3 GB |

## Arquitectura y entrenamiento

Se trata de un ajuste fino del modelo base `lerobot/pi05_base`, de la familia pi0.5, con la librería LeRobot 0.6.1 y el preajuste `pi05` del script `scripts/train_lerobot.sh` (ejecución `pi05_20261024_020227`). La arquitectura es la del modelo base: una política VLA que combina percepción visual, instrucción en lenguaje natural y predicción de acciones; la *model card* no detalla la composición interna de capas ni el mecanismo de decodificación de acciones, por lo que ese nivel de detalle queda como no disponible.

El entrenamiento se ejecutó durante 20.000 pasos con batch de 12, `scheduler_decay_steps=20000`, `save_freq=5000` y `log_freq=200`. Se desactivó el *gradient checkpointing* y se mantuvo el codificador visual descongelado (`freeze_vision_encoder=false`), es decir, se ajustaron también los pesos de visión. El preprocesado no recorta las cámaras: `observation.images.front_cam` se divide en dos mitades solapadas (`front_cam` y `front_cam_right`) de 224×224 y `observation.images.gripper_cam` se reduce con antialiasing (implementado en `src/env/lightbox/split_camera.py`). Un detalle relevante para la reproducibilidad: estados y acciones se normalizan con los cuantiles de todos los fotogramas del *dataset*, no con la media por episodio que almacena LeRobot 0.6.1, lo que cambia sustancialmente las estadísticas de normalización respecto al flujo estándar.

No se documentan número total de tokens, composición del *dataset*, ni fases de RLHF/DPO (no aplicables en el mismo sentido que en modelos de lenguaje, pero tampoco se describe ningún proceso de *reward modeling* o refinamiento por preferencias). El contenido visual de las fichas de mahjong procede de `Mahjong_eg_TW.jpg` de Cangjie6 (Wikimedia Commons), bajo CC BY-SA 4.0, adaptado para los fotogramas de entrenamiento.

## Capacidades

- Generación de acciones de control para un brazo robótico SO-101 en un entorno simulado tipo Isaac Lab.
- Manipulación de fichas de mahjong sobre un soporte vertical (*stand rack*), tarea concreta para la que fue ajustado.
- Política condicionada por imagen: consume dos vistasfrontales de 224×224 y una vista de pinza.
- Entrada de estado del robot (posiciones articulares u observaciones proprioceptivas) normalizada por cuantiles.
- Ejecución de instrucciones en lenguaje natural, heredadas del modelo base pi0.5 (idiomas no especificados).
- Integración con el ecosistema LeRobot: carga mediante `lerobot` y evaluación con los *scripts* de la librería.
- No se documenta soporte de *tool calling*, agentes multi-paso, matemáticas, código ni otras capacidades de texto; no es un modelo de propósito general.
- No se documenta *thinking mode*, visión general (captioning, VQA) ni audio.

## Casos de uso

- **Investigación en manipulación robótica de precisión**: el modelo sirve como política de referencia para tareas de colocación de objetos delgados en soportes verticales, un escenario con contactos ricos y tolerancias estrechas donde los *pickers* genéricos fallan.
- **Reproducción de experimentos de ajuste fino VLA**: al estar documentados los hiperparámetros exactos (20.000 pasos, batch 12, normalización por cuantiles globales, codificador visual descongelado), permite replicar el *pipeline* y medir la sensibilidad a cada decisión.
- **Evaluación sim-to-real con robots de bajo coste**: el SO-101 es un brazo de bajo presupuesto; este modelo permite estudiar la brecha entre simulación (Isaac Lab) y hardware real antes de invertir en plataformas más caras.
- **Generación de datos sintéticos y *self-play***: la política puede ejecutar rollouts en Isaac Lab para ampliar el *dataset* `mahjong_v1_standrack07_twos` con nuevas trayectorias y estados iniciales.
- **Docencia y divulgación**: caso práctico completo de un VLA entrenado sobre un *dataset* propio, útil en cursos de robótica o de aprendizaje por imitación.
- **Comparación de recetas de normalización**: permite medir en un entorno controlado el efecto de normalizar por cuantiles globales frente a la media por episodio de LeRobot 0.6.1.
- **Pruebas de *benchmarking* interno de políticas**: base para comparar arquitecturas (pi0, pi0.5, SmolVLA) en una tarea de manipulación concreta y con métricas de éxito reproducibles.
- **Integración en *pipelines* de control cerrado**: el modelo puede cargarse con LeRobot en un bucle de inferencia por paso de control, siempre que el *hardware* disponga de GPU suficiente (ver sección de requisitos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La *model card* no incluye tasas de éxito, métricas de error de posición, ni comparaciones cuantitativas con otras políticas en la tarea `mahjong_v1_standrack07_twos`.

## Requisitos de hardware

- **Peso de los pesos en float32**: 4.143.404.816 × 4 bytes ≈ 16,6 GB solo para parámetros. El repositorio completo ocupa 66,3 GB porque incluye los *checkpoints* por paso en ramas `step-<step>`.
- **VRAM estimada en bf16/fp16**: ≈8,3 GB para pesos; con activaciones y *buffers* de imagen, un mínimo realista de 16-24 GB para batch pequeño.
- **VRAM estimada en float32**: ≥24 GB para pesos y activaciones mínimas; 40-80 GB si se quiere batch mayor o se mantiene el codificador visual en fp32.
- **GPUs recomendadas**: NVIDIA A100 (40/80 GB), H100, L40S (48 GB) o RTX 6000 Ada para inferencia cómoda; RTX 4090/3090 (24 GB) viable en bf16 con batch 1.
- **¿Cabe en GPU de consumo?**: sí en RTX 4090 o 3090 (24 GB) en bf16; no en tarjetas de 16 GB o menos sin cuantización, y no se publican pesos cuantizados.
- **Opciones de despliegue**: LeRobot (carga de políticas y *scripts* de evaluación) sobre PyTorch; Isaac Lab para el lado de simulación. vLLM, TGI, llama.cpp y Ollama no son aplicables a este tipo de política VLA.
- **Latencia y throughput**: no disponibles. Al ser una política de control, la latencia por paso condiciona la frecuencia de control alcanzable, pero no se aportan medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `tc-huang/pi05_mahjong_v1_standrack07_twos` | ≈4,14 B | Imágenes 224×224 + estado + instrucción | No disponible | Hugging Face, 0 descargas, 0 *likes* | Ajuste fino específico para mahjong con SO-101 en Isaac Lab |
| `lerobot/pi05_base` | No disponible en la información consultada (es el modelo base del anterior) | Igual que la familia pi0.5 | No disponible | Hugging Face (LeRobot) | Modelo generalista; no especializado en esta tarea |
| `lerobot/pi0_base` | No disponible en la información consultada | Entrada multimodal equivalente | No disponible | Hugging Face (LeRobot) | Generación anterior de la familia; el autor no publica comparación |
| `lerobot/smolvla_base` | No disponible en la información consultada | Entrada multimodal equivalente | No disponible | Hugging Face (LeRobot) | Alternativa de menor tamaño orientada a *hardware* modesto |

No se dispone de datos verificados de rendimiento ni de parámetros exactos de las alternativas en la información proporcionada, por lo que la comparación se limita a disponibilidad, linaje y especialización.

## Limitaciones y advertencias

- **Licencia no declarada**: sin licencia explícita no hay autorización clara para uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- **Sesgo de dominio extremo**: el modelo está ajustado a una única tarea (fichas de mahjong en un soporte concreto) y a un único robot (SO-101); generalizará mal a otras geometrías, objetos o morfologías.
- **Brecha sim-to-real**: el entrenamiento se realizó en Isaac Lab; no se documenta ninguna validación en hardware físico, por lo que el rendimiento real es desconocido.
- **Sobreajuste a la normalización**: estados y acciones se normalizan con cuantiles globales del *dataset*, no con estadísticas por episodio; reutilizar el modelo con otra distribución de datos exige replicar exactamente ese preprocesado o recalibrar.
- **Preprocesado no estándar**: la división de `front_cam` en dos mitades solapadas y el reescalado de `gripper_cam` con antialiasing son específicos de este *pipeline*; un uso con cámaras sin ese tratamiento degradará la política.
- **Riesgo de fallo silencioso en acciones**: como toda política de imitación, puede producir trayectorias plausibles pero incorrectas sin señal de incertidumbre; no debe operar sin mecanismos externos de seguridad ni supervisión.
- **Sin métricas publicadas**: no hay tasas de éxito ni comparaciones, lo que impide estimar su calidad relativa frente al modelo base.
- **Material CC BY-SA 4.0 en los datos**: los fotogramas incluyen fichas adaptadas de `Mahjong_eg_TW.jpg` (Cangjie6, CC BY-SA 4.0); conviene revisar las obligaciones de atribución y *share-alike* si se redistribuyen derivados.
- **Idiomas no especificados**: se desconoce si las instrucciones en lenguaje natural funcionan fuera del inglés usado durante el ajuste.
- **Repositorio muy pesado**: 66,3 GB con *checkpoints* por paso; la descarga y el almacenamiento son costosos y conviene quedarse con una sola rama.
- **Madurez**: 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso por terceros ni de mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tc-huang/pi05_mahjong_v1_standrack07_twos
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Imagen de origen de las fichas de mahjong: https://commons.wikimedia.org/wiki/File:Mahjong_eg_TW.jpg
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- *Dataset* de ajuste fino: `mahjong_v1_standrack07_twos` (citado en la *model card*; no se proporciona URL)
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo (los resultados devueltos corresponden a organismos y transportes de Clermont-Ferrand y Lyon, sin relación con el modelo)
