# Travor278/pi05-place-dual-shoes-concurrent-peer-lora-10k-e160

## Resumen

El modelo `Travor278/pi05-place-dual-shoes-concurrent-peer-lora-10k-e160` es un checkpoint de inferencia para robótica publicado en HuggingFace por el usuario Travor278. Se trata de un ajuste mediante LoRA sobre la receta "peer" de PI0.5 (la familia de modelos vision-language-action distribuida a través de la librería `openpi`), entrenado sobre un dataset propio de manipulación denominado `ctr-place-dual-shoes-concurrent`. El checkpoint se distribuye en formato JAX/Orbax y está pensado exclusivamente para inferencia: no incluye estado de optimizador, `train_state` ni estado reanudable del cargador de datos.

El artefacto corresponde a la serie de entrenamiento autorizada "Sim12", con 10.000 actualizaciones del optimizador, batch global 16, acumulación de gradientes 1, FSDP de 1 y semilla 87431. El entrenamiento emplea acciones articulares en representación delta y una máscara de pérdida con temporal padding. Dos hiperparámetros relevantes se explicitan en la model card: el horizonte de acción es 50, valor distinto del número de pasos de difusión, que es 10.

Su relevancia es acotada pero concreta: sirve como referencia reproducible de adaptación LoRA de bajo rango sobre una política VLA en simulación, con manifiesto de ficheros verificado por SHA-256 y trazabilidad del dataset (commit `8af4de6`). No es un modelo de propósito general ni un transformer conversacional: no se puede cargar con Transformers ni convertir a safetensors según su autor, y no se han publicado resultados de benchmarks asociados a esta subida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PI0.5 (vision-language-action) con adaptadores LoRA sobre la receta "peer"; detalle interno de capas no disponible |
| Parametros totales | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint JAX/Orbax sin conversión de formato; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint de inferencia); explícitamente no es Transformers ni safetensors |
| Tamano del repositorio | 6,3 GB |
| Horizonte de accion | 50 |
| Pasos de difusion | 10 |
| Actualizaciones del optimizador | 10.000 |
| Batch global / acumulacion / FSDP | 16 / 1 / 1 |
| Semilla | 87431 |
| Dataset de entrenamiento | Shiki42/ctr-place-dual-shoes-concurrent-20260911 (commit 8af4de6ff63c040bf34ba47c79eec65c83d7d37c) |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible indica que se trata de un checkpoint de la familia PI0.5 gestionado por la librería `openpi`, con adaptadores LoRA (rango no especificado) entrenados sobre una receta "peer". La política produce acciones con horizonte 50 mediante un proceso de difusión de 10 pasos, y la representación de acción es articular en forma delta. No se documentan en la información proporcionada el número de parámetros, la composición del dataset más allá de su identificador, el número total de tokens o muestras vistas, ni si hubo etapas de RLHF, DPO u optimización por preferencias (poco habituales en políticas robóticas, pero no confirmado ni descartado).

Sí se detallan los hiperparámetros de optimización (10.000 updates, batch global 16, GA 1, FSDP 1, semilla 87431) y la función de pérdida con máscara de temporal padding, orientada a manejar secuencias de longitud variable. El checkpoint es de solo inferencia: excluye optimizador, `train_state` y estado del `data_loader`, lo que impide reanudar el entrenamiento desde este artefacto. La normalización no está embebida como simple fichero de configuración: requiere apuntar `PARALLELVLA_DATASET_REPO` al dataset y `PARALLELVLA_NORM_ASSETS_DIR` al directorio local `10000/assets`, además del código fuente OpenPI compatible con PI0.5 y su entorno de configuración base.

## Capacidades

- Generación de acciones robóticas: política de control para manipulación, con horizonte de acción de 50 pasos y decodificación por difusión de 10 pasos.
- Ejecución de una tarea concreta de colocación: el identificador del dataset (`place-dual-shoes-concurrent`) apunta a una tarea de colocación de dos zapatos de forma concurrente (bimanual o dual), aunque no se detalla la morfología del robot ni el entorno.
- Acciones articulares en representación delta, adecuadas para control continuo de bajo nivel.
- Inferencia sobre observaciones multimodales propias de un VLA (visión y lenguaje), por la naturaleza de la familia PI0.5; los detalles de resolución, número de cámaras o instrucciones textuales no están disponibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; es un modelo de acción, no un agente conversacional.
- Capacidades multilingües: no disponible.
- Capacidades especiales: checkpoint de inferencia con manifiesto `CHECKPOINT_MANIFEST.json` y verificación SHA-256 de cada fichero contra el "CPU reload receipt" original.

## Casos de uso

- Investigación en adaptación LoRA de políticas VLA: sirve como punto de comparación para medir cuánto aporta un ajuste de bajo rango de 10.000 updates frente al modelo base PI0.5 en la misma tarea, con semilla y configuración documentadas.
- Reproducción de un experimento de simulación: al fijar dataset (commit concreto), semilla, batch y número de updates, permite replicar el entrenamiento dentro de la serie "Sim12" y auditar diferencias.
- Evaluación de políticas en simulación con horizonte largo: el horizonte de acción 50 reduce la frecuencia de replanificación y es útil para estudiar estabilidad de políticas en tareas de colocación.
- Tareas de colocación dual en líneas de investigación bimanual: el caso concreto de colocar dos zapatos de forma concurrente ejemplifica escenarios de coordinación entre dos efectores donde la política debe resolver colisiones y orden de acciones.
- Base para un segundo ajuste fino: aunque el checkpoint no permite reanudar el entrenamiento (sin estado de optimizador), puede usarse como inicialización para un LoRA adicional sobre otra tarea relacionada.
- Integración en un banco de pruebas interno de openpi: sirve para validar el pipeline de carga, normalización (assets en `10000/assets`) y variables de entorno antes de desplegar checkpoints propios.
- Análisis de transferencia sim-a-real: como punto de partida para medir la brecha de rendimiento al llevar una política entrenada solo en simulación a un robot físico, siempre que la licencia lo permita (véase limitaciones).
- Trazabilidad y auditoría de artefactos: el manifiesto y la verificación SHA-256 lo hacen útil como ejemplo de publicación reproducible de checkpoints de robótica en HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que los resultados de evaluación se registran en el panel de SwanLab `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` y advierte explícitamente que dichos resultados no se derivan de la finalización de la subida del checkpoint. No se incluyen cifras de éxito de tarea, error de acción ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, el repositorio ocupa 6,3 GB, por lo que los pesos en memoria estarían en ese orden de magnitud; a ello hay que sumar activaciones, buffers de difusión y assets de normalización. Cifra no confirmada por el autor.
- GPU recomendadas: no disponible en la documentación. Por el tamaño del artefacto, cabría esperar ejecución en GPUs de 16-24 GB o superiores, pero no hay confirmación.
- GPU de consumo: no disponible; no se documenta si cabe en una RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: únicamente la pila `openpi` (JAX/Orbax) con el código fuente compatible con PI0.5 y su entorno de configuración base. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni conversión a GGUF o safetensors; el autor indica que "no es un modelo Transformers/safetensors".
- Variables de entorno obligatorias: `PARALLELVLA_DATASET_REPO` (apuntando al dataset) y `PARALLELVLA_NORM_ASSETS_DIR` (apuntando a `10000/assets` locales). El directorio de checkpoint a pasar es `10000/`.
- Latencia y throughput: no disponible. El coste por paso de control depende de la política PI0.5 base y de los 10 pasos de difusión, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-place-dual-shoes-concurrent-peer-lora-10k-e160 (este) | no disponible | no disponible | JAX/Orbax | no disponible | HuggingFace, 0 descargas |
| Modelo base PI0.5 (openpi) | no disponible | no disponible | JAX/Orbax | no disponible | Referenciado como requisito de código, sin datos de pesos en la información proporcionada |
| Otros checkpoints LoRA de la serie Sim12 | no disponible | no disponible | JAX/Orbax | no disponible | no disponible |

No se dispone de datos numéricos (parámetros, contexto, benchmarks) de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. La diferencia verificable de este checkpoint frente al modelo base es la naturaleza LoRA de bajo rango, el horizonte de acción 50 y su asociación a un dataset concreto de colocación dual.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial ni redistribución; en ausencia de licencia explícita, el uso en producción conlleva riesgo legal.
- Solo inferencia: al excluir optimizador, `train_state` y estado del `data_loader`, no es posible reanudar el entrenamiento desde este artefacto.
- Dependencia del dataset y de los assets de normalización: sin `PARALLELVLA_DATASET_REPO` y `10000/assets`, el checkpoint no puede interpretarse correctamente; la normalización no es autónoma.
- Compatibilidad restringida: requiere el código OpenPI compatible con PI0.5 y su entorno de configuración base; no es cargable con Transformers, vLLM, llama.cpp ni Ollama, y no hay conversión a GGUF ni safetensors.
- Sin benchmarks publicados: no hay evidencia numérica de rendimiento de tarea, tasa de éxito ni comparación con la línea base, por lo que no se debe asumir calidad de ejecución.
- Origen en simulación: la serie "Sim12" sugiere entrenamiento exclusivamente simulado, con el consiguiente riesgo de brecha sim-a-real si se traslada a hardware físico.
- Especialización estrecha: el nombre del dataset indica una única tarea (colocación concurrente de dos zapatos); no se documentan capacidades de generalización a otras tareas.
- Sesgos conocidos: no disponible. No hay información sobre composición demográfica, condiciones de iluminación, distribución de objetos ni cobertura de escenarios.
- Riesgo de alucinación: no aplicable en el sentido conversacional; en políticas VLA el riesgo equivalente es la generación de acciones no válidas o inseguras fuera de la distribución de entrenamiento, no cuantificado aquí.
- Idiomas: no disponible; al ser un VLA, el uso de instrucciones en lenguaje natural depende del modelo base y no está documentado.
- Advertencias de trazabilidad: el autor indica que los resultados de evaluación en SwanLab no se derivan de la finalización de la subida; un checkpoint correctamente subido no implica un rendimiento validado.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Metadatos atípicos: las fechas de creación y actualización registradas (septiembre de 2026) son posteriores a la fecha de consulta habitual, lo que conviene verificar antes de tratarlas como referencia temporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-concurrent-peer-lora-10k-e160
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-concurrent-20260911 (commit `8af4de6ff63c040bf34ba47c79eec65c83d7d37c`)
- Panel de evaluación SwanLab: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Repositorio openpi (requisito de código citado como "compatible PI0.5 OpenPI source"; no enlazado en la información proporcionada)
- Búsqueda web: los resultados devueltos no guardan relación con el modelo (contenido sobre afiliación a la seguridad social francesa), por lo que no se incluye ningún enlace adicional.
