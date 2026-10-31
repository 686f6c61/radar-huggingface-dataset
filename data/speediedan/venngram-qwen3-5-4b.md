# speediedan/venngram-qwen3.5-4b

## Resumen

`speediedan/venngram-qwen3.5-4b` no es un modelo con pesos, sino un repositorio de documentos de interpretabilidad en formato venngram asociados al checkpoint `Qwen/Qwen3.5-4B`, publicado por el usuario speediedan en Hugging Face. El repositorio contiene "libros de direcciones" (address books) que nombran conjuntos de neuronas del checkpoint y "recetas" (recipes) que definen tratamientos sobre esos conjuntos, organizados en directorios con su propio manifiesto `venngram.yaml`.

Su función es servir de referencia ilustrativa del formato venngram: muestra cómo se estructura un documento por checkpoint, cómo se referencian unidades (por ejemplo, un conjunto de 1024 unidades en la capa 15 almacenado como sidecar safetensors) y cómo se traducen recetas desde el formato neuronary mediante la herramienta venngram-neuronary. El propio autor advierte de forma explícita que las unidades incluidas no proceden de ningún análisis y no se conoce que tengan efecto alguno sobre el modelo.

Su relevancia actual es como ejemplo canónico y plantilla del ecosistema venngram, una herramienta experimental de interpretabilidad, útil para quien quiera publicar o consumir documentos de interpretabilidad por checkpoint en el Hub. Al no contener pesos (tamaño de repo reportado: 0,0 GB), su lectura es trivial y solo requiere la librería venngram.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo: repositorio de documentos sobre el checkpoint Qwen/Qwen3.5-4B) |
| Parametros totales | no disponible (sin pesos; el modelo base es Qwen/Qwen3.5-4B, cuya denominación sugiere ~4 mil millones de parámetros) |
| Parametros activos | no aplica (no hay arquitectura MoE ni pesos en este repositorio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (sin pesos de modelo) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica; los documentos usan safetensors como sidecar para conjuntos de unidades y YAML para los manifiestos |

## Arquitectura y entrenamiento

Este repositorio no contiene arquitectura ni entrenamiento alguno: son documentos de datos, no pesos. El formato venngram define dos tipos de documento: los address books, que declaran conjuntos de unidades (neuronas concretas del checkpoint referenciado), y las recipes, que definen tratamientos sobre esos conjuntos. En `examples/` hay un address book con un conjunto inline y otro de 1024 unidades de la capa 15 almacenado como sidecar safetensors, junto a una receta de esquema 2 que encadena las operaciones `scale` y `add` con dosis por unidad. En `neuronary/` hay una receta escrita originalmente en formato neuronary, traducida automáticamente por la herramienta venngram-neuronary.

Cada directorio incorpora un manifiesto `venngram.yaml`, y los documentos se leen por referencia mediante la API de la librería, por ejemplo `venngram.store.load("hub-model:speediedan/venngram-qwen3.5-4b:<path>")`. No hubo preentrenamiento, fine-tuning, RLHF ni DPO: el checkpoint subyacente es `Qwen/Qwen3.5-4B`, cuyos detalles de arquitectura y datos de entrenamiento no constan en la información disponible y deben consultarse en su ficha oficial.

## Capacidades

- No genera texto ni realiza inferencia: el repositorio no incluye pesos del modelo.
- Define y publica conjuntos de unidades de un checkpoint: conjuntos inline y conjuntos grandes (1024 unidades en la capa 15) serializados en safetensors.
- Define recetas de tratamiento de esquema 2 con operaciones compuestas (`scale`, luego `add`) y dosis diferenciadas por unidad.
- Empaqueta cada colección con un manifiesto `venngram.yaml` por directorio.
- Permite carga programática por referencia vía `venngram.store.load(...)` con URIs del tipo `hub-model:usuario/repos:<ruta>`.
- Ofrece interoperabilidad con el formato neuronary a través del traductor venngram-neuronary.
- Todas las unidades incluidas son ilustrativas: no derivan de análisis real ni se les conoce efecto sobre el modelo.

## Casos de uso

- Plantilla de referencia para publicar address books propios: un autor que quiera documentar conjuntos de neuronas de cualquier checkpoint puede copiar la estructura de `examples/` (manifiesto, conjunto inline, sidecar safetensors) y adaptarla a su modelo.
- Desarrollo y pruebas de la librería venngram: el repositorio está diseñado para ejercitar los formatos, por lo que sirve como fixture de regresión para validar cambios en el parser, el loader o el esquema de recetas.
- Aprendizaje del formato venngram: permite entender con ejemplos concretos cómo se declaran unidades, dosis y tratamientos antes de crear documentos desde cero.
- Ejemplo de integración con neuronary: la receta de `neuronary/` muestra el resultado de la traducción automática desde otro formato, útil para verificar el comportamiento de venngram-neuronary.
- Punto de partida para estudios de interpretabilidad sobre Qwen3.5-4B: la estructura de directorios y manifiestos sirve de esqueleto para alojar conjuntos de unidades obtenidos por análisis propio (con la advertencia de que las unidades incluidas no tienen efecto conocido).
- Validación de esquemas y manifiestos: los `venngram.yaml` y la receta de esquema 2 permiten comprobar que una implementación valida correctamente referencias, dosis por unidad y operaciones encadenadas.
- Reproducibilidad de experimentos: el formato permite compartir en el Hub conjuntos de unidades y tratamientos exactos (con dosis) para que terceros los repliquen sobre el mismo checkpoint.
- Documentación de checkpoints sin republicar pesos: al pesar 0,0 GB, un equipo puede adjuntar anotaciones de interpretabilidad a un modelo existente sin duplicar sus pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un repositorio de documentos y no de un modelo, las evaluaciones tipo MMLU, HumanEval o GSM8K no aplican; el rendimiento relevante sería el de la librería venngram al cargar los documentos, para el que no hay mediciones publicadas.

## Requisitos de hardware

- El repositorio en sí: 0,0 GB reportados, sin pesos; se lee con la librería venngram en CPU, sin necesidad de GPU ni VRAM.
- Para ejecutar el checkpoint base `Qwen/Qwen3.5-4B` y aplicar las recetas: requisitos no disponibles en la información proporcionada; consultar la ficha del modelo base. Como orientación genérica (no como especificación de este modelo), los modelos de ~4B parámetros en FP16 suelen requerir del orden de 8-10 GB de VRAM y caben en GPUs de consumo tipo RTX 4090 de 24 GB con holgura o RTX de 12 GB; con cuantización a 4 bits la cifra baja habitualmente a 2-4 GB.
- GPU recomendadas: no aplicables al repositorio; para el modelo base, no disponible en la información proporcionada.
- Despliegue: la vía soportada es la librería venngram en Python (carga por referencia con `venngram.store.load`). Para servir el modelo base, opciones estándar del ecosistema como vLLM, llama.cpp, Ollama o TGI podrían aplicar, pero no constan confirmadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Recurso | Tipo | Contenido | Licencia | Disponibilidad |
|---|---|---|---|---|
| speediedan/venngram-qwen3.5-4b | Repositorio de documentos de interpretabilidad | Address books y recetas venngram para Qwen3.5-4B; sin pesos | apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B | Modelo base | Pesos del checkpoint; specs no disponibles en la información proporcionada | no disponible aquí | Hugging Face |
| speediedan/venngram-neuronary | Herramienta (GitHub) | Traducción de recetas en formato neuronary a venngram | no disponible | GitHub |

No existen comparables directos publicados en la información disponible: se trata de un recurso de un ecosistema específico (venngram) cuyo valor está en el formato, no en el rendimiento.

## Limitaciones y advertencias

- No contiene pesos: no puede usarse para inferencia ni como modelo sustituto del base; intentar cargarlo como modelo fallará.
- Contenido puramente ilustrativo: las unidades fueron elegidas para ejercitar los formatos, no proceden de ningún análisis y no se conoce que tengan efecto sobre el modelo; no deben tratarse como un hallazgo de interpretabilidad.
- Etiquetas potencialmente confusas: los tags incluyen `base_model:finetune:Qwen/Qwen3.5-4B`, pero el README aclara que el repositorio solo aloja documentos, no un fine-tuning.
- Proyecto experimental: venngram es experimental en sí mismo; los formatos, esquemas y la API pueden cambiar sin garantía de estabilidad.
- Adopción nula: 0 descargas y 0 likes en el momento de la ficha, sin validación ni revisión comunitaria.
- Efectos de los tratamientos desconocidos: aplicar recetas a un checkpoint puede alterar su comportamiento de formas no documentadas; cualquier experimento real exige validar los resultados.
- Hereda las limitaciones del modelo base Qwen3.5-4B (sesgos, alucinaciones, restricciones de idioma), que no están detalladas en la información disponible.
- Licencia apache-2.0: permite uso comercial y redistribución, aunque el carácter ilustrativo del contenido limita su valor práctico más allá de la referencia de formato.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/speediedan/venngram-qwen3.5-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de la librería venngram: https://github.com/speediedan/venngram
- Traductor venngram-neuronary: https://github.com/speediedan/venngram-neuronary

La búsqueda web no arrojó resultados relevantes adicionales (papers, demos o entradas de blog) sobre este repositorio o el formato venngram.
