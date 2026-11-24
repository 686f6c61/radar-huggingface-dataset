# ZYM666/ExperimentRecordEEG

## Resumen

ExperimentRecordEEG es un repositorio de Hugging Face publicado por el usuario ZYM666 que no contiene un modelo generativo al uso, sino un archivo estructurado y reproducible de experimentos de investigación sobre modelos fundacionales de electroencefalografía (EEG) e intracraneal (iEEG) en el marco del proyecto NeuroFoundry. El repositorio empaqueta, bajo la convención `neurofoundry-experiment-record-v1`, el conjunto de artefactos necesarios para reproducir cada experimento: README con hipótesis y resultados, metadatos legibles por máquina, configuraciones congeladas, volcados de métricas auditadas, visualizaciones diagnósticas y checkpoints finales en formato safetensors.

El contenido indexado incluye un único experimento completado, `2026-11-24_exp001_labram_vs_codebrain`, que compara dos variantes de arquitectura sobre una tarea agregada de ocho tareas de EEG: `labram-vq-nsp` con una métrica media primaria de 0,5335 y `codebrain-tfdual-vq` con 0,5373. Se trata, por tanto, de material de investigación reproducible más que de un modelo listo para producción, y su interés radica en la trazabilidad de los recetas de preentrenamiento y evaluación de encoders EEG.

El repositorio tiene un tamaño de 0,1 GB, no registra descargas ni likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline. La información disponible no permite caracterizar el modelo como un sistema de propósito general: los pesos incluidos son encoders preentrenados para señales neuronales, no un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el índice menciona variantes `labram-vq-nsp` y `codebrain-tfdual-vq`; no se detalla la arquitectura interna) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se trata de señales EEG/iEEG, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: entrada de señales EEG/iEEG) |
| Licencia | no disponible |
| Formato de pesos | safetensors (bundles de encoder en `checkpoints/`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna de los encoders. El índice de experimentos cita dos variantes: `labram-vq-nsp` y `codebrain-tfdual-vq`. Los sufijos sugieren componentes de cuantización vectorial (VQ) y, en el segundo caso, una estructura dual con posible objetivo de predicción de siguiente paso (NSP en el primero). No se especifica el número de parámetros, la profundidad, el mecanismo de atención ni el tipo de tokenizador de señales.

Respecto al entrenamiento, el repositorio almacena en `configs/` las recetas YAML/JSON congeladas de preentrenamiento y evaluación, y en `meta.json` los metadatos de cada experimento (commit de git, hardware, presupuesto de datos y métricas principales). Sin embargo, la model card no reproduce esos valores: no se indica el número de tokens o muestras de EEG utilizadas, la composición del corpus, ni si se aplicaron técnicas de ajuste como RLHF o DPO (que, en el dominio de señales neuronales, no resultan directamente aplicables). Tampoco se documentan innovaciones técnicas concretas más allá de las variantes comparadas.

## Capacidades

- Extracción de representaciones a partir de señales EEG e iEEG mediante encoders preentrenados en formato safetensors.
- Evaluación comparativa de variantes de arquitectura sobre un conjunto agregado de ocho tareas de EEG (métrica "8-Task Mean Primary").
- Reproducibilidad de experimentos: configuraciones congeladas, métricas auditadas y checkpoints finales empaquetados por experimento.
- Diagnóstico mediante visualizaciones incluidas en `plots/` (t-SNE, reconstrucción y ablaciones).
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de investigación: un equipo puede descargar el directorio `experiments/2026-11-24_exp001_labram_vs_codebrain/` y reejecutar las recetas de `configs/` con los mismos checkpoints para verificar la métrica reportada de 0,5335 frente a 0,5373.
- Comparación de encoders EEG: utilizar los bundles safetensors de ambas variantes para evaluar su transferencia a un nuevo conjunto de datos de EEG clínico o de investigación.
- Auditoría de resultados: emplear los volcados JSON de `metrics/` y los metadatos de `meta.json` (commit, hardware, presupuesto de datos) para reconstruir el linaje experimental en un artículo o revisión interna.
- Base para ajuste fino supervisado: partir del encoder preentrenado y añadir una cabeza de clasificación para tareas downstream de decodificación de señales neuronales.
- Docencia y formación: usar el archivo estructurado como ejemplo de buenas prácticas de registro reproducible de experimentos en neurociencia computacional.
- Integración en pipelines de investigación con NeuroFoundry: consumir la convención `neurofoundry-experiment-record-v1` para estandarizar nuevos experimentos dentro del mismo proyecto.

## Benchmarks y rendimiento

| Experimento | Variante | 8-Task Mean Primary |
|---|---|---|
| `2026-11-24_exp001_labram_vs_codebrain` | `labram-vq-nsp` | 0,5335 |
| `2026-11-24_exp001_labram_vs_codebrain` | `codebrain-tfdual-vq` | 0,5373 |

No se han publicado en la información disponible resultados desglosados por tarea, intervalos de confianza ni comparaciones con modelos externos al repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño de los encoders ni el número de parámetros).
- GPU recomendadas: no disponible; `meta.json` registra el hardware empleado en cada experimento, pero su contenido no se reproduce en la model card.
- Compatibilidad con GPU de consumo: no determinable con los datos disponibles; el tamaño total del repositorio es de 0,1 GB, lo que sugiere checkpoints de pequeño tamaño, pero no se confirma.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al tratarse de encoders de señales EEG, el consumo habitual sería mediante PyTorch y safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ExperimentRecordEEG (`codebrain-tfdual-vq`) | no disponible | no aplica (EEG/iEEG) | 0,5373 (8-Task Mean Primary) | no disponible | Hugging Face, 0 descargas |
| ExperimentRecordEEG (`labram-vq-nsp`) | no disponible | no aplica (EEG/iEEG) | 0,5335 (8-Task Mean Primary) | no disponible | Hugging Face, 0 descargas |
| Otros modelos fundacionales EEG | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables externos al repositorio.

## Limitaciones y advertencias

- No es un modelo de propósito general: los pesos son encoders de señales EEG/iEEG y no admiten entradas de texto ni generación de lenguaje.
- Ausencia de licencia declarada: no se puede asumir permiso para uso comercial, redistribución o modificación; es necesario contactar con el autor.
- Documentación incompleta: no se especifican arquitectura, número de parámetros, composición del corpus de entrenamiento ni hardware, lo que dificulta evaluar su idoneidad.
- Riesgo de sobreajuste a las ocho tareas de evaluación reportadas; no hay resultados en tareas externas.
- Sin descargas ni validación comunitaria: no existen evidencias independientes de reproducibilidad más allá de los artefactos incluidos.
- Los sesgos y las limitaciones idiomáticas no son aplicables en el sentido habitual, pero sí lo son los sesgos de los datos clínicos de EEG (población, equipamiento, protocolos de registro) que no se documentan.
- Fecha de creación y actualización futura (2026-11-24): conviene verificar la vigencia y posibles revisiones del repositorio antes de reutilizarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ZYM666/ExperimentRecordEEG
- Experimento indexado: https://huggingface.co/ZYM666/ExperimentRecordEEG/tree/main/experiments/2026-11-24_exp001_labram_vs_codebrain
- README del experimento: https://huggingface.co/ZYM666/ExperimentRecordEEG/blob/main/experiments/2026-11-24_exp001_labram_vs_codebrain/README.md
