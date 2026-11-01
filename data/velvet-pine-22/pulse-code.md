# velvet-pine-22/PULSE-code

## Resumen

PULSE-code es el repositorio de código de referencia del artículo "PULSE: A Synchronized Five-Modality Dataset for Sensorimotor Coordination in Long-Horizon Daily Activities", aceptado como spotlight en el track de Evaluaciones y Datasets de NeurIPS 2026. No se trata de un modelo de lenguaje, sino de un paquete Python que da soporte reproducible al benchmark PULSE: carga el dataset público, define los splits de validación cruzada estratificados por voluntario, entrena las líneas base del benchmark (tareas T1-T7 y F5), ejecuta el caso de estudio F0 y regenera las tablas, figuras y cifras del artículo.

El recurso central es el dataset PULSE, compuesto por cinco modalidades sincronizadas (mocap, EMG, eye-tracking, IMU y presión/tacto) capturadas en actividades diarias de horizonte largo. El repositorio fija los datos del benchmark a la etiqueta `v1.1` del dataset (commit `e27b1bb`, 3.001 archivos, 22,0 GB sin vídeos) y proporciona la infraestructura necesaria para reproducir los resultados: entorno conda con Python 3.12.13 y torch 2.4.1+cu121, manifiestos de verificación por sha256, taxonomía de etiquetas y plantillas de prompts para anotación con VLM.

Es relevante para investigadores en reconocimiento de actividad humana (HAR) multimodal y coordinación sensoriomotora, ya que ofrece un pipeline completo y verificable, con licencia MIT para el código (el dataset es CC BY-NC 4.0) y splits con separación estricta de voluntarios para evitar fugas de información entre entrenamiento y test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de código de benchmark, no un modelo neuronal único) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT (código); dataset asociado CC BY-NC 4.0 |
| Formato de pesos | no disponible (código Python; datos del dataset en flujos de sensores, anotaciones y metadatos) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de red única, sino un marco de evaluación con varios módulos de tareas (`pulse/tasks/`, uno por tarea) y modelos (`pulse/models/`) que implementan las líneas base T1-T7 y F5 del benchmark. La capa de datos (`pulse/data/`) gestiona la carga de grabaciones, la disponibilidad de flujos por grabación (`manifests/availability_v1.1.json`) y la verificación de integridad frente al manifiesto de archivos del tag `v1.1`. Los splits (`splits/pool33.json` y `splits/pool27.json`) implementan validación cruzada de 5 folds disjunta por voluntario con validación interna, lo que evita que un mismo participante aparezca en entrenamiento y test.

El dataset cubre cinco modalidades sincronizadas: captura de movimiento (mocap), electromiografía (EMG), seguimiento ocular (eye-tracking), IMU y presión/tacto. La taxonomía de etiquetas (`taxonomy/taxonomy_v1.1.json`) define el vocabulario para las tareas T2 y F5. Las anotaciones de acciones se redactaron con plantillas de prompts para VLM (`prompts/`), y la rama `main` del dataset añade etiquetas de primitivas de movimiento S9 (`annotations/vX/s9.json`, 30 archivos) necesarias para la tarea F5. El entorno de referencia está fijado en `environment.yml` para garantizar la reproducibilidad de todas las cifras del artículo.

## Capacidades

- Carga y verificación del dataset PULSE con comprobación criptográfica por archivo (sha256 para ficheros LFS, git blob id para el resto).
- Generación de splits de validación cruzada de 5 folds disjuntos por voluntario, con partición de validación interna.
- Entrenamiento y evaluación de las líneas base del benchmark para las tareas T1-T7 y F5.
- Ejecución del caso de estudio F0.
- Regeneración automática de tablas, figuras y cifras del artículo a partir de los resultados de las ejecuciones (`scripts/run_table`, `aggregate`, `build_outputs`).
- Gestión de disponibilidad de flujos por grabación, permitiendo evaluar solo las modalidades presentes en cada registro.
- Soporte de taxonomía de etiquetas versionada para tareas de clasificación.
- Plantillas de prompts para anotación asistida por VLM.
- Lanzadores SLURM (`pulse/` y `slurm/`) para ejecución en clúster.
- Suite de tests unitarios sobre dataset sintético y comprobaciones opcionales sobre datos reales.

## Casos de uso

- Reproducción de resultados de investigación: un grupo que quiera verificar las cifras del artículo PULSE puede descargar el tag `v1.1`, ejecutar `verify_data.py` y lanzar las tablas del benchmark con los comandos documentados, obteniendo los mismos números que en la publicación.
- Desarrollo de nuevos métodos de HAR multimodal: el repositorio ofrece splits estandarizados y disjuntos por voluntario, de modo que un nuevo modelo puede compararse de forma justa contra las líneas base T1-T7 sin reimplementar la partición de datos.
- Evaluación de fusión de sensores: al gestionar la disponibilidad por modalidad, permite estudiar el rendimiento con subconjuntos de sensores (por ejemplo, solo IMU y presión) y cuantificar la aportación de cada flujo.
- Anotación asistida por VLM: las plantillas de `prompts/` sirven como base para etiquetar nuevas grabaciones con modelos visión-lenguaje y validar la taxonomía contra la versión 1.1.
- Experimentación en clúster: los lanzadores SLURM y las configuraciones por tarea permiten escalar barridos de hiperparámetros y comparativas de modelos en entornos HPC.
- Docencia y formación: el paquete `pulse` con tests sobre dataset sintético facilita prácticas de análisis de datos de sensores sin necesidad de descargar los 22 GB completos.
- Integración en pipelines de investigación reproducibles: la verificación por manifiesto y el entorno conda fijado permiten incorporar la carga y validación del dataset a flujos de CI científicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio genera las tablas del artículo, pero los valores numéricos no se incluyen en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio entrena líneas base sobre datos de sensores; los requisitos dependen del modelo concreto de cada tarea).
- GPU recomendadas: no disponibles en la información proporcionada; el entorno fija torch 2.4.1+cu121, lo que implica soporte CUDA 12.1.
- Compatibilidad con GPU de consumo: no disponible.
- Almacenamiento: 22,0 GB para el tag `v1.1` del dataset (sin vídeos); la rama `main` completa añade 622 vídeos en primera persona (unos 63 GB adicionales).
- Opciones de despliegue: ejecución local con conda (`environment.yml`) o en clúster mediante SLURM (`slurm/`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros benchmarks o repositorios comparables de características similares en la información recibida.

## Limitaciones y advertencias

- El repositorio no es un modelo desplegable: no ofrece pesos ni inferencia lista para producción; es código de benchmark para investigación.
- El dataset asociado tiene licencia CC BY-NC 4.0, lo que restringe el uso comercial de los datos, aunque el código sea MIT.
- La reproducibilidad de las cifras exige ceñirse al tag `v1.1` y al entorno fijado; usar la rama `main` introduce archivos adicionales (vídeos, etiquetas S9) que alteran la verificación.
- La tarea F5 requiere etiquetas S9 que no están en `v1.1`, sino en la rama `main` del dataset.
- Los splits están diseñados para evitar fugas por voluntario; cualquier modificación de la partición invalida la comparación con las líneas base publicadas.
- No se dispone de información sobre sesgos, tasas de alucinación ni comportamiento multilingüe, al no tratarse de un modelo generativo de texto.
- El tamaño del dataset (22 GB mínimo) y la dependencia de GPU para el entrenamiento pueden ser una barrera para entornos con recursos limitados.

## Enlaces

- Repositorio de código: https://huggingface.co/velvet-pine-22/PULSE-code
- Dataset PULSE: https://huggingface.co/datasets/velvet-pine-22/PULSE
- Muestra pequeña del dataset: https://huggingface.co/datasets/velvet-pine-22/PULSE-sample
- DOI del dataset: https://doi.org/10.57967/hf/11314
- Artículo (OpenReview): https://openreview.net/forum?id=AoU576r9O2
- Contacto: Yang Gao (gaoyang2025@scut.edu.cn); mantenedor Wolin Liang (202610196903@mail.scut.edu.cn)
