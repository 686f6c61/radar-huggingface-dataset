# WindyWord/translate-zai-es

## Resumen

WindyWord/translate-zai-es es un modelo de traduccion automatica neuronal especializado en el par zapoteco del Istmo (codigo ISO 639-3 `zai`) a espanol (`es`). Lo publica WindyWord (Windstorm Labs), dentro de su catalogo abierto de modelos de traduccion, y esta construido como un fine-tuning de Helsinki-NLP/opus-mt-zai-es, el modelo OPUS-MT de la Universidad de Helsinki. La relevancia del proyecto es clara: se trata de un par linguistico con muy pocos recursos digitales disponibles, y este repositorio pone a disposicion pesos derivados de OPUS-MT en formatos listos para produccion.

La arquitectura subyacente es Marian, un transformer secuencial encoder-decoder caracteristico de la familia OPUS-MT y optimizado para traduccion con vocabularios reducidos y modelos compactos. El repositorio ocupa 0.3 GB y distribuye dos variantes: `lora/` (WindyStandard, formato Transformers para inferencia en GPU) y `lora-ct2-int8/` (cuantizacion INT8 en CTranslate2 para inferencia en CPU). No se publica un recuento de parametros ni una puntuacion de calidad en la informacion disponible.

El modelo se enmarca en el ecosistema de las aplicaciones Windy Word y su catalogo WindyTranslate. Cabe senalar que el autor retiro temporalmente las variantes WindyScripture (`herm0-scripture/`, `scripture-ct2-int8/`) mientras se revisan las licencias de los textos de eBible usados como origen, un aviso precautorio que conviene tener en cuenta al evaluar el linaje de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder seq2seq) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP32/FP16 (variante Transformers) e INT8 (variante CTranslate2) |
| Idiomas soportados | `zai` (zapoteco del Istmo), `es` (espanol) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers, subcarpeta `lora/`) y CTranslate2 (subcarpeta `lora-ct2-int8/`) |

## Arquitectura y entrenamiento

El modelo es un MarianMT, la arquitectura transformer seq2seq empleada por Helsinki-NLP en la familia OPUS-MT. Se trata de un encoder-decoder con atencion, disenado para traduccion automatica con requisitos de computo moderados, lo que permite desplegarlo incluso en CPU una vez cuantizado. La model card no detalla la configuracion de capas, dimensiones ocultas ni el numero de cabezas de atencion, por lo que esos datos figuran como no disponibles.

En cuanto al entrenamiento, la informacion disponible indica unicamente que los pesos derivan de Helsinki-NLP/opus-mt-zai-es, un fine-tuning del modelo OPUS-MT. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, etc.). El aviso del autor sobre la retirada temporal de las variantes WindyScripture sugiere que parte del material de entrenamiento o ajuste provino de textos de eBible, cuyo estatus de licencia esta en revision.

## Capacidades

- Traduccion de texto de zapoteco del Istmo a espanol, tarea unica declarada en el pipeline (`translation`).
- Inferencia en GPU mediante Transformers con pesos en formato safetensors.
- Inferencia rapida en CPU gracias a la variante cuantizada en INT8 con CTranslate2.
- Integracion con el ecosistema Transformers a traves de `MarianMTModel` y `MarianTokenizer`.
- Integracion en las aplicaciones de Windy Word, segun la model card.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio.
- No se declara capacidad bidireccional: el repositorio documenta solo la direccion `zai` → `es`.

## Casos de uso

- Preservacion linguistica y digitalizacion: traduccion de archivos escritos y transcripciones en zapoteco del Istmo para crear corpus paralelos que faciliten el estudio y la conservacion de la lengua.
- Servicios publicos bilingues: traduccion de avisos, formularios y comunicaciones administrativas para comunidades zapotecohablantes de Oaxaca, desplegando la variante INT8 en servidores sin GPU.
- Educacion intercultural bilingue: generacion de material didactico y glosarios de apoyo para docentes que trabajan con alumnado zapoteco, partiendo de textos fuente en `zai`.
- Atencion al ciudadano o al cliente en entornos con baja conectividad: la variante CTranslate2 INT8 permite ejecutar la traduccion en local y sin conexion.
- Investigacion linguistica: alineacion de corpus, comparacion de variantes dialectales y generacion de traducciones de referencia para anotacion manual.
- Subtitulado y localizacion de contenido audiovisual comunitario: traduccion de guiones y subtitulos de producciones en zapoteco del Istmo al espanol.
- Integracion en aplicaciones de traduccion de terceros: la API de Transformers y CTranslate2 facilita incrustar el modelo en apps moviles o de escritorio orientadas a lenguas indigenas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que no se publica ninguna puntuacion de calidad en el repositorio y que las puntuaciones de cribado, cuando se miden, se encuentran en la pagina del catalogo de WindyTranslate.

## Requisitos de hardware

- El repositorio completo ocupa 0.3 GB, lo que sitúa al modelo en la categoría de modelos muy compactos. Las cifras de VRAM que siguen son estimaciones basadas en ese tamano, no datos publicados.
- Variante `lora/` (Transformers): estimacion de menos de 1 GB de VRAM en FP16; cabe con holgura en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en GPU integradas o en CPU.
- Variante `lora-ct2-int8/` (CTranslate2 INT8): pensada para CPU; consumo de memoria reducido, apto para entornos sin GPU y despliegues en el borde.
- GPU recomendadas: no disponibles de forma oficial. Por tamano, no requiere GPU de centro de datos (A100, H100) salvo para procesamiento por lotes a gran escala.
- Opciones de despliegue: Transformers (PyTorch), CTranslate2 y HuggingFace Inference Endpoints (el tag `endpoints_compatible` esta presente). La model card proporciona ejemplos de uso con `MarianMTModel` y con `ctranslate2.Translator`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| WindyWord/translate-zai-es | Marian | `zai` → `es` | no disponible | Apache-2.0 | safetensors, CTranslate2 INT8 | Variante INT8 para CPU; 0 descargas y 0 likes en HuggingFace |
| Helsinki-NLP/opus-mt-zai-es | Marian (OPUS-MT) | `zai` → `es` | no disponible | Apache-2.0 | Transformers | Modelo base del que derivan los pesos de WindyWord |
| Otras alternativas para `zai` → `es` | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

## Limitaciones y advertencias

- No hay ninguna puntuacion de calidad ni benchmark publicado en el repositorio, por lo que el rendimiento real de traduccion es desconocido.
- Sesgo de dominio probable: los modelos OPUS-MT de pares con pocos recursos suelen entrenarse con corpus limitados, a menudo de origen religioso o institucional, lo que puede sesgar el vocabulario y el registro hacia esos dominios.
- Riesgo de alucinacion en terminologia especializada, nombres propios, toponimia y expresiones idiomaticas del zapoteco del Istmo.
- Cobertura limitada a una unica direccion (`zai` → `es`); no se documenta traduccion inversa en este repositorio.
- El zapoteco del Istmo presenta variacion dialectal interna que el modelo podria no cubrir de forma uniforme.
- Licencia Apache-2.0, permisiva para uso comercial, heredada del modelo base. No obstante, el autor ha retirado temporalmente las variantes WindyScripture mientras revisa las licencias de los textos de eBible, por lo que conviene verificar la procedencia de los datos si se reutiliza el modelo en contextos sensibles.
- Adopcion practicamente nula: el repositorio registra 0 descargas y 0 likes, lo que implica ausencia de validacion por parte de la comunidad.
- Existe una copia canonica en otro repositorio (`WindyTranslate/translate-zai-es`); conviene comprobar cual se considera la fuente oficial.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WindyWord/translate-zai-es
- Copia canonica: https://huggingface.co/WindyTranslate/translate-zai-es
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-zai-es
- Ficha del modelo en el catalogo WindyTranslate: https://windytranslate.com/models/translate-zai-es
- Aplicaciones Windy Word: https://windyword.ai
