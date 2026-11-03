# ZUO66/imagewam-g1-pillow78-deltaflow

## Resumen

ImageWAM Δ-flow es un modelo de política robótica (vision-language-action, VLA) desarrollado por el usuario ZUO66 y publicado en HuggingFace. Está especializado en una única tarea de manipulación sobre el robot humanoide Unitree G1: recoger un cojín o almohada de una chaise longue y devolverlo a la cabecera de la cama. El modelo parte de FLUX.2-klein-base-4B como base visual y añade una rama de acción inicializada de forma independiente, entrenada con 78 demostraciones (65.963 fotogramas a 30 FPS) durante 20.640 actualizaciones de parámetros.

La arquitectura combina un modelo de flujo visual (flow matching) con un cabezal de acción que predice latentes de movimiento y estados de mano medidos (Inspire6), usando un esquema de "delta-flow" con fuentes de ruido específicas para imagen y acción. El modelo opera con dos vistas de cámara (ego_view y chest, 224×224 cada una, concatenadas horizontalmente en 224×448), un historial de 16 pasos de acción y un vector de estado de 44 dimensiones que solo alimenta la rama de acción. La inferencia es de un solo paso y produce una salida de `[16,76]`.

Su relevancia es acotada pero interesante para investigación en robótica: es un ejemplo de adaptación de un modelo generativo de imagen de gran escala (4B) a control robótico mediante flow matching, con artefactos de despliegue completos (CLI, interfaz Python `PillowPolicy`, servicio HTTP) y trazabilidad de pesos (SHA256, manifiesto de ficheros). No obstante, se trata de un experimento de un solo autor, sin validación en máquina real publicada y con una licencia no declarada, lo que limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de flujo (flow matching) sobre base visual FLUX.2-klein-base-4B con rama de acción; denoising de un solo paso en inferencia |
| Parametros totales | no disponible (base FLUX.2-klein-base-4B de 4B; total del conjunto no declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (historial de acción de 16 pasos; sin contexto textual variable) |
| Tipos de cuantizacion | no disponible (pesos en `.pt`; no se documentan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (instrucción fija en inglés, no multilingüe) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`weights/step_020640.pt`, SHA256 `a9659079…827ab`) |

## Arquitectura y entrenamiento

El modelo es una política VLA basada en flow matching. La rama visual se inicializa desde FLUX.2-klein-base-4B y la rama de acción desde un inicializador derivado de la base, ambas inicializadas de forma independiente. La entrada visual son dos vistas (ego_view y chest) de 224×224 concatenadas en 224×448; el estado actual (44 dimensiones) solo entra en la rama de acción. El modelo predice un latente de movimiento de 64 dimensiones más los estados medidos de las manos izquierda y derecha (Inspire6, 6 dimensiones cada una), con horizontes de 16 pasos pasados y 16 futuros.

El entrenamiento usa flow matching con interpolación (IC) tanto en visión como en acción: la fuente de imagen es `0.5*z_current + sqrt(0.75)*Gaussian` y la de acción es la acción pasada normalizada más `0.5*Gaussian` sobre 76 dimensiones. La pérdida de acción aplica stop-gradient hacia la rama visual. Se entrenó con 78 demostraciones (65.963 fotogramas, 30 FPS), 20.640 actualizaciones, 8 GPUs, batch 8 por GPU, acumulación 2 y batch global 128. No hay conjunto de validación ni selección de mejor checkpoint: todos los datos se usaron para entrenar.

## Capacidades

- Ejecución de una tarea robótica concreta: recoger un cojín/almohada de la chaise longue y devolverlo a la cabecera de la cama, con instrucción fija en inglés.
- Predicción de trayectorias de acción de 16 pasos y estados objetivo de manos Inspire6 (medidos).
- Procesamiento de dos vistas de cámara (ego_view y chest) concatenadas.
- Inferencia de un solo paso (no iterativa), lo que reduce latencia frente a políticas de difusión multi-paso.
- Interfaz programática: CLI de inferencia única, clase Python `PillowPolicy` reutilizable y servicio HTTP persistente.
- No soporta tool calling, function calling, agentes multi-paso, visión general, audio ni razonamiento textual. No es multilingüe.

## Casos de uso

- Investigación en VLA sobre humanoides: replicar el pipeline de adaptación de un modelo de imagen de 4B a control robótico mediante flow matching, usando los artefactos de despliegue incluidos.
- Benchmark de políticas de un solo paso: comparar la inferencia de un paso de este modelo frente a políticas de difusión multi-paso en la misma tarea de manipulación.
- Estudio de esquemas de ruido ("delta-flow"): analizar el efecto de las fuentes de ruido específicas para imagen y acción en la estabilidad del entrenamiento.
- Despliegue en laboratorio con el servicio HTTP: integrar `PillowPolicy` en un bucle de control del Unitree G1 para pruebas controladas en entorno simulado o de banco.
- Reproducción de entrenamiento: reutilizar `training_config.yaml` y el manifiesto de ficheros para auditar la configuración y verificar la integridad de los pesos.
- Docencia y divulgación: ejemplo didáctico de cómo se estructura una política VLA con ramas separadas de visión y acción y stop-gradient entre ellas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona un informe de reproducción offline (`evaluation/hand_replay_report.json`) con 6 demostraciones de entrenamiento y una validación en CPU de preprocesado, padding de historial, división de salida y protocolo HTTP; no incluye métricas de éxito en máquina real ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo pesa 11,6 GB y la base es FLUX.2-klein-base-4B, por lo que se requiere una GPU con al menos ~16-24 GB para inferencia en precisión nativa (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas; el entrenamiento usó 8 GPUs (modelo no indicado). Para inferencia se necesita una GPU con suficiente VRAM para el base de 4B más la rama de acción.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) o superiores, pero no está confirmado por el autor.
- Opciones de despliegue: CLI de inferencia única, interfaz Python `PillowPolicy` y servicio HTTP persistente, según `DEPLOYMENT.md`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la inferencia es de un solo paso, lo que sugiere baja latencia relativa, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ImageWAM Δ-flow (este) | base 4B + rama de acción (total no disponible) | no disponible | Manipulación G1 (cojín) | no disponible | HuggingFace, 0 descargas |
| Políticas VLA genéricas (p. ej. OpenVLA, RT-2) | no disponible en esta ficha | no disponible | Manipulación general | variable | no disponible |
| Políticas de difusión (p. ej. Diffusion Policy) | no disponible en esta ficha | no disponible | Manipulación | variable | no disponible |

No se dispone de datos comparativos verificables en la información proporcionada; la comparativa anterior es meramente categórica y no incluye métricas.

## Limitaciones y advertencias

- Modelo de una sola tarea y una sola instrucción fija en inglés; no generaliza a otras tareas ni a instrucciones variables.
- Sin conjunto de validación ni selección de mejor checkpoint: riesgo de sobreajuste a las 78 demostraciones.
- No hay resultados de éxito en máquina real publicados; la validación es offline y en CPU.
- Licencia no declarada: no se puede asumir uso comercial; contactar con el autor antes de cualquier despliegue productivo.
- Artefactos incompletos: no se incluyen optimizer, estado de entrenamiento ni vídeos originales de demostración; el base FLUX.2 y el AE deben descargarse aparte.
- Riesgo de alucinación en el sentido de predicciones de acción no verificadas fuera de la distribución de entrenamiento.
- El modelo emite latentes de movimiento SONIC y estados de mano medidos; la cadena de control concreta debe implementarse según `DEPLOYMENT.md` y no está validada en hardware nuevo.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/ZUO66/imagewam-g1-pillow78-deltaflow
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
