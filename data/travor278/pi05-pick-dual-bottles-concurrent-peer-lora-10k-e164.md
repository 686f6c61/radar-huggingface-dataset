# Travor278/pi05-pick-dual-bottles-concurrent-peer-lora-10k-e164

## Resumen

El modelo `Travor278/pi05-pick-dual-bottles-concurrent-peer-lora-10k-e164` es un checkpoint de inferencia de una política robótica de la familia PI0.5 (OpenPI), publicado en HuggingFace por el usuario Travor278. Se trata de un ajuste fino con LoRA sobre la receta "peer" de la serie de entrenamiento Sim12, orientado a la tarea de recoger dos botellas de forma concurrente. El repositorio ocupa 6,3 GB y contiene únicamente parámetros de modelo y activos de normalización emparejados; se excluyen el optimizador, el `train_state` y el estado reanudable del `data_loader`.

El checkpoint está en formato JAX/Orbax (no es un modelo de Transformers ni safetensors) y se distribuye como material de solo inferencia. Para usarlo hay que apuntar `checkpoint_dir` al subdirectorio `10000/` y configurar las variables de entorno `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` hacia el dataset de entrenamiento y los activos locales. Requiere la fuente compatible de PI0.5 en OpenPI y su entorno de configuración base.

Su relevancia es fundamentalmente de investigación: documenta una receta de ajuste LoRA reproducible (10 000 actualizaciones de optimizador, batch global 16, semilla 87431) sobre una tarea bimanual concreta. No hay datos publicados de licencia, idiomas, parámetros ni benchmarks en la información disponible, y el modelo acumula cero descargas y cero valoraciones, por lo que no existe validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política viso-lenguaje-acción (VLA) PI0.5 de OpenPI; detalles internos no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (checkpoint JAX/Orbax sin conversión de formato) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (no safetensors, no Transformers) |
| Librería | openpi |
| Tamaño del repositorio | 6,3 GB |
| Horizonte de acción | 50 |
| Pasos de difusión | 10 (`num_steps`, distinto del horizonte de acción) |
| Tipo de tarea | manipulación robótica (pick dual bottles, concurrente) |
| Estado del checkpoint | solo inferencia (sin optimizador, `train_state` ni `data_loader`) |
| Pipeline declarado | robotics |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-15 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de su pertenencia a PI0.5 dentro del ecosistema OpenPI y de su implementación en JAX/Orbax. Sí se detallan los hiperparámetros del ajuste: 10 000 actualizaciones del optimizador, batch global de 16, acumulación de gradiente 1 (`GA1`), paralelismo FSDP1 y semilla 87431. El modo de ajuste es una receta LoRA ("peer recipe LoRA10k"), lo que implica que se entrenó un adaptador de bajo rango sobre el modelo base en lugar de reentrenar todos los pesos.

En cuanto al tratamiento de la señal de entrenamiento, se emplean acciones articulares en formato delta (`delta joint actions`) y una máscara de pérdida con relleno temporal (`temporal-padding loss mask`). El checkpoint final expone un horizonte de acción de 50, que el autor distingue explícitamente de los 10 pasos de difusión del planificador. Los datos provienen del dataset `Shiki42/ctr-pick-dual-bottles-concurrent-20260911`, fijado en el commit `8dff735a7870df46edc853a019f288d20f6c82af`, y cada archivo fuente fue verificado con SHA-256 contra el recibo original de recarga en CPU antes de la subida; `CHECKPOINT_MANIFEST.json` inventaría únicamente los archivos de inferencia.

## Capacidades

- Generación de acciones motoras para control robótico: produce secuencias de acciones articulares en formato delta con horizonte de 50.
- Ejecución de la tarea específica de recogida concurrente de dos botellas, según el nombre y el dataset de entrenamiento.
- Inferencia únicamente: el repositorio no incluye estado de entrenamiento reanudable.
- Normalización emparejada: incluye activos de normalización alineados con el dataset de entrenamiento para la fase de inferencia.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad de generación de texto, código, matemáticas, visión general ni audio fuera del uso propio de una política VLA.
- Capacidades multilingües: no disponibles.
- No se documenta ningún modo especial (thinking mode, decodificación especulativa ni similar).

## Casos de uso

- Recogida bimanual concurrente de dos botellas: caso de uso nominal del checkpoint, que genera acciones delta con horizonte 50 para completar la tarea definida en el dataset de entrenamiento.
- Investigación en adaptación de bajo rango: sirve como artefacto de referencia para estudiar recetas LoRA aplicadas a políticas VLA de la familia PI0.5 dentro de OpenPI.
- Reproducción de experimentos: permite reanudar la fase de inferencia desde `10000/` con los activos de normalización originales y comprobar los resultados publicados en el registro de evaluación del autor.
- Evaluación comparativa interna de políticas: al ser un checkpoint intermedio (época 164, 10 000 pasos) de una serie, resulta útil para trazar curvas de aprendizaje frente a otros puntos de control de la misma receta.
- Generación de datos en simulación: en un entorno tipo Sim12, la política puede usarse para ejecutar episodios que alimenten análisis posteriores de comportamiento o de distribución de acciones.
- Validación de pipelines JAX/Orbax: caso práctico para equipos que quieran verificar su infraestructura de carga de checkpoints OpenPI, variables de entorno y configuraciones base antes de invertir en entrenamientos completos.
- Análisis de normalización: los activos incluidos permiten auditar cómo se transforman las acciones articulares delta y cómo afecta el relleno temporal a la inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

El autor indica que los resultados de evaluación se registran en `https://swanlab.cn/@Travor/CTR-PI05-LoRA10k` y advierte de forma explícita que la finalización de la subida no implica ni presupone ningún resultado de evaluación. No se proporcionan cifras de éxito de tarea, ni comparaciones numéricas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada: no confirmada por el autor. Como referencia derivada del tamaño del repositorio (6,3 GB, que incluye pesos y activos de normalización), los pesos en bf16 ocuparían del orden de 6 GB, por lo que se necesitarían al menos 8-10 GB de VRAM solo para parámetros, más el consumo del runtime de JAX y de las activaciones.
- GPU recomendadas: no disponibles. Al tratarse de JAX con aceleración por GPU, se requiere un entorno CUDA compatible con la versión de JAX que exija OpenPI; no se especifican modelos concretos.
- GPU de consumo: no confirmado. Una GPU con 24 GB (por ejemplo, RTX 4090) sería plausible según la estimación anterior, pero no hay verificación por parte del autor.
- Opciones de despliegue: únicamente la ruta OpenPI con JAX/Orbax. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de Transformers ni safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Travor278/pi05-pick-dual-bottles-concurrent-peer-lora-10k-e164` | Ajuste LoRA de política PI0.5 para tarea concreta | JAX/Orbax | no disponible | HuggingFace, 0 descargas |
| PI0.5 base (OpenPI) | Política VLA generalista de referencia | JAX/Orbax | no disponible en la información proporcionada | no disponible en la información proporcionada |
| Otros checkpoints OpenPI de tareas específicas | Políticas VLA ajustadas | JAX/Orbax | no disponible | no disponible |

No se dispone de datos verificables de parámetros, contexto ni rendimiento para los modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial ni redistribución; la ausencia de licencia es un riesgo legal en producción.
- Checkpoint incompleto para entrenamiento: no incluye optimizador, `train_state` ni estado reanudable del `data_loader`, por lo que solo sirve para inferencia.
- Dependencia estricta del entorno: requiere la fuente compatible de PI0.5 en OpenPI, su configuración base, el dataset `Shiki42/ctr-pick-dual-bottles-concurrent-20260911` en el commit indicado y los activos locales de normalización.
- Formato no estándar: al no ser safetensors ni Transformers, no puede cargarse con las herramientas habituales de inferencia de modelos de lenguaje.
- Especialización estrecha: la política está entrenada para una única tarea (recogida concurrente de dos botellas) y su comportamiento fuera de esa distribución no está caracterizado.
- Riesgo de fallo fuera de distribución: no hay datos publicados sobre robustez ante variaciones de iluminación, posición de objetos, fricción o dinámica no vistas en el dataset.
- Brecha sim-a-real desconocida: la serie de entrenamiento es Sim12 y no se documenta transferencia a hardware real.
- Idiomas no declarados: no se puede confirmar soporte multilingüe ni de instrucciones en lenguaje natural.
- Sin validación externa: cero descargas y cero valoraciones; los resultados de evaluación se remiten a un registro externo que no se incluye en el repositorio.
- Advertencia del autor: la finalización de la subida no implica resultados de evaluación correctos, y el horizonte de acción 50 no debe confundirse con los 10 pasos de difusión.
- Sesgos: no disponibles (no se documenta caracterización de sesgos del dataset de entrenamiento).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-pick-dual-bottles-concurrent-peer-lora-10k-e164
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-concurrent-20260911
- Registro de resultados de evaluación: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k

La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados obtenidos correspondían a listados de precios de teléfonos móviles y no guardan relación con el contenido de esta ficha.
