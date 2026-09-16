# Travor278/pi05-pick-dual-bottles-right-first-data20260916-lora-10k-e190

## Resumen

pi05-pick-dual-bottles-right-first-data20260916-lora-10k-e190 es un checkpoint de inferencia para robótica publicado por el usuario Travor278 en Hugging Face, dentro del ecosistema OpenPI. Se trata de un ajuste fino con LoRA sobre el modelo base PI0.5 (etiquetado como pi05), orientado a una tarea concreta de manipulación: recoger botellas dobles agarrando primero la de la derecha. El repositorio no define la tarea con más detalle ni publica tasas de éxito.

El entrenamiento se realizó sobre el dataset Shiki42/ctr-pick-dual-bottles-right-first-20260916 (revisión 27589cecbebe7c1688ae183c410a66701463f221), con 10.000 actualizaciones del optimizador, batch de 16 por experimento, acumulación de gradiente 1, FSDP1, semilla 87431, horizonte de acción 50 y 12 dimensiones articulares representadas como deltas más pinzas en absoluto, con máscara de pérdida por relleno temporal. Dos experimentos independientes compartieron cada GPU H100.

Su relevancia es acotada pero clara para investigación en manipulación robótica: es un artefacto de reproducción que documenta de forma explícita el commit de OpenPI necesario, la configuración usada y los assets de normalización, y que se publica junto a la ejecución de métricas de entrenamiento en SwanLab. No se distribuyen estados de optimizador ni puntos de control de reanudación de datos, y no se realizó conversión a safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi0.5 (modelo visión-lenguaje-acción) sobre OpenPI; detalle de capas y backbone no disponible en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica segun la informacion disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible; el horizonte de accion declarado es de 50 pasos |
| Tipos de cuantizacion | no disponible; el autor indica que no se realizo conversion a safetensors y el checkpoint se distribuye en formato JAX/Orbax sin cuantizar declarada |
| Idiomas soportados | no disponible (no aplica como modelo de lenguaje general; es una politica robotica) |
| Licencia | no disponible en el repositorio; debe verificarse ademas la licencia del modelo base PI0.5 |
| Formato de pesos | Orbax (JAX); checkpoint de inferencia en el subdirectorio 10000/; sin safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Dataset de entrenamiento | Shiki42/ctr-pick-dual-bottles-right-first-20260916, revision 27589cecbebe7c1688ae183c410a66701463f221 |
| Actualizaciones del optimizador | 10.000 |
| Configuracion OpenPI | pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep |
| Commit de OpenPI requerido | 5b46a66d46632c17b889b0587230f57c96418bc9 |
| Hardware de entrenamiento | H100 (dos experimentos independientes compartieron cada H100) |
| Revision del dataset usada | 27589cecbebe7c1688ae183c410a66701463f221 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de tipo LoRA sobre PI0.5 dentro del marco OpenPI, por lo que hereda la arquitectura del modelo base, cuyos detalles internos no se documentan en la ficha del autor. La innovación técnica declarada es de receta de entrenamiento: se aplica la regla estándar de congelación de LoRA de OpenPI, que además entrena el codificador de visión y las cabezas. La representación de acciones usa 12 dimensiones articulares en formato delta junto con pinzas en absoluto, con horizonte de acción 50 y una máscara de pérdida de relleno temporal.

El entrenamiento partió de una base fresca (fresh base) y se extendió durante 10.000 actualizaciones con batch de 16 por experimento, acumulación de gradiente 1 y FSDP1 sobre GPUs H100. No se declara uso de RLHF, DPO ni decodificación especulativa, y no se aporta información sobre el número de tokens de entrenamiento ni la composición del dataset. El autor indica que el checkpoint pasó una recarga independiente en CPU y una comprobación de parámetros finitos, y que los archivos de inferencia se rehashearon antes de la subida, con registro en CHECKPOINT_MANIFEST.json.

## Capacidades

- Generación de acciones de manipulación robótica: predice secuencias de 12 dimensiones articulares con horizonte de acción 50, en formato delta para las articulaciones y absoluto para las pinzas.
- Condicionamiento visual y lingüístico: al derivar de PI0.5, el modelo integra entrada visual y de instrucción, aunque el repositorio no detalla los formatos exactos de entrada admitidos.
- Ejecución como política de inferencia: el checkpoint está pensado exclusivamente para inferencia, no para reanudar entrenamiento (no incluye estado del optimizador ni del cargador de datos).
- Especialización en la tarea declarada: recogida de botellas dobles con agarre de la derecha en primer lugar, dentro de un entorno de simulación (etiqueta simulation).
- Ajuste eficiente con LoRA: demuestra un procedimiento de adaptación de PI0.5 a un dataset concreto con 10.000 pasos de optimización.
- No disponible: soporte de tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión general, audio o modo de pensamiento. La información proporcionada no describe ninguna de estas capacidades.

## Casos de uso

- Reproducción de experimentos de manipulación: el checkpoint permite reproducir la política entrenada para la tarea pick-dual-bottles-right-first usando el commit exacto de OpenPI indicado y los assets de normalización incluidos en 10000/assets.
- Comparación de recetas de ajuste fino: sirve como punto de referencia frente al modelo anterior E163 del mismo autor y frente a otras ejecuciones de la misma serie LoRA10k, ya que comparte configuración y dataset.
- Evaluación de LoRA en modelos visión-lenguaje-acción: al entrenar también el codificador de visión y las cabezas, permite estudiar el efecto de la regla de congelación de OpenPI sobre el rendimiento de la política.
- Investigación en simulación robótica: con la etiqueta simulation, es adecuado para experimentos de evaluación en simulador antes de plantear cualquier transferencia a hardware real.
- Auditoría de artefactos de entrenamiento: el manifiesto CHECKPOINT_MANIFEST.json y la verificación de parámetros finitos documentada permiten trazar integridad y procedencia del checkpoint en flujos de validación internos.
- Docencia y formación técnica: como ejemplo real de publicación de checkpoints JAX/Orbax con variables de entorno específicas (PARALLELVLA_DATASET_REPO, PARALLELVLA_NORM_ASSETS_DIR, PI05_JAX_BASE) y dependencia de una revisión concreta de código.
- Análisis de datos de demostración: el dataset asociado y la revisión fijada permiten estudiar la relación entre datos de entrada, representación de acciones y política resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se declara ninguna tasa de éxito en simulación para este checkpoint nuevo. Existen métricas de entrenamiento en la ejecución E190 de SwanLab, pero no se proporcionan valores numéricos en la información disponible.

## Requisitos de hardware

- Entrenamiento declarado: GPUs H100, con dos experimentos independientes compartiendo cada H100, batch 16 por experimento, FSDP1 y 10.000 actualizaciones.
- VRAM para inferencia: no disponible. Como referencia orientativa no confirmada, los 6,3 GB del repositorio corresponden al checkpoint más los assets de normalización, por lo que el mínimo práctico estará por encima de esa cifra una vez cargados el modelo base y las activaciones.
- GPU recomendadas: no disponible en la información proporcionada; el autor solo documenta H100 para el entrenamiento.
- Compatibilidad con GPU de consumo: no confirmada. El autor no publica requisitos mínimos ni pruebas en GPUs de gama de consumo.
- Opciones de despliegue: el despliegue se realiza mediante OpenPI sobre JAX/Orbax, usando el subdirectorio 10000/ como checkpoint_dir y un commit concreto del código fuente (5b46a66d46632c17b889b0587230f57c96418bc9). No es compatible con vLLM, llama.cpp, Ollama ni TGI, y no es una instalación Python independiente.
- Dependencias de entorno: es necesario definir PARALLELVLA_DATASET_REPO, PARALLELVLA_NORM_ASSETS_DIR y, cuando la configuración lo requiera, PI05_JAX_BASE apuntando a un directorio de parámetros base PI0.5 verificado por separado.
- Latencia y throughput: no disponibles.
- Comprobación de integridad: el autor documenta una recarga independiente en CPU con verificación de parámetros finitos y un rehash de los archivos de inferencia antes de la subida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick-dual-bottles-right-first-data20260916-lora-10k-e190 (este) | no disponible | no disponible (horizonte de accion 50) | sin tasa de exito declarada | no disponible | repositorio HF publico, 0 descargas, 0 likes |
| E163 del mismo autor | no disponible | no disponible | no disponible | no disponible | repositorio HF separado, citado en la model card |
| Modelo base PI0.5 sin ajustar | no disponible | no disponible | no disponible | no disponible | referenciado como dependencia externa (PI05_JAX_BASE) |

No se dispone de datos comparativos de parámetros, contexto ni rendimiento para ninguno de los tres casos en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no indica licencia, por lo que el uso comercial es incierto y debe aclararse con el autor antes de cualquier despliegue productivo.
- Dependencia del modelo base: requiere un directorio de parámetros base PI0.5 verificado por separado mediante la variable PI05_JAX_BASE; no es un artefacto autónomo.
- Dependencia de una revisión de código concreta: el funcionamiento está ligado al commit 5b46a66d46632c17b889b0587230f57c96418bc9 y a la configuración pi05_putcab_athenb_fullhorizon_mb16_ga1_lora3ep, cuyo nombre histórico no coincide con la tarea real.
- No es una instalación independiente: los archivos de source_reference son referencias de configuración y transformación, no un paquete Python listo para usar.
- Alta especialización: la política está ajustada a una única tarea (recogida de botellas dobles, derecha primero) y no se documenta su comportamiento fuera de ella.
- Brecha simulación-realidad: el modelo está etiquetado como simulation, sin evidencia de validación en hardware físico.
- Sin métricas de rendimiento: no se declara tasa de éxito ni en simulación ni en real, lo que impide estimar su utilidad práctica.
- Riesgo de sobreajuste a la revisión del dataset: el entrenamiento está fijado a una revisión concreta, lo que limita la reproducibilidad exacta si esa revisión cambia.
- Ausencia de validación externa: el repositorio presenta 0 descargas y 0 likes, sin evidencia de uso o verificación por terceros más allá de las comprobaciones del propio autor.
- Formato poco inspeccionable: al no haber conversión a safetensors y usar Orbax, las herramientas estándar de inspección de pesos de Hugging Face no aplican directamente.
- Idiomas y entradas de lenguaje natural: no se documentan los idiomas ni el formato exacto de las instrucciones admitidas.
- Metadatos temporales: las fechas de creación y actualización del repositorio son de septiembre de 2026, según los datos publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Travor278/pi05-pick-dual-bottles-right-first-data20260916-lora-10k-e190
- Dataset asociado: https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-right-first-20260916
- Métricas de entrenamiento (ejecución E190): https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Referencia de commit de OpenPI exigida por el autor: 5b46a66d46632c17b889b0587230f57c96418bc9 (no se proporciona URL del repositorio en la información disponible)
- Manifiesto de integridad: CHECKPOINT_MANIFEST.json incluido en el propio repositorio
- Resultados de búsqueda web: no se encontró ningún enlace relevante sobre este modelo; los resultados devueltos corresponden a páginas de inicio de sesión de Google Classroom y no guardan relación con el modelo.
