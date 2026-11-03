# tokiers/voyage-3

## Resumen

`tokiers/voyage-3` no es un modelo de lenguaje, sino un tokenizer precompilado distribuido por el proyecto tokie para el modelo de embeddings `voyageai/voyage-3` de Voyage AI. El repositorio contiene los ficheros de tokenizacion en formato binario propietario de tokie (`tokenizer.tkz`) y, cuando esta disponible, el `tokenizer.json` original de HuggingFace. Su funcion es permitir que aplicaciones Python y Rust tokenicen texto de entrada con la misma segmentacion que usa el modelo de embeddings de Voyage, sin necesidad de cargar la libreria `tokenizers` de HuggingFace.

El paquete lo publica el usuario `tokiers`, presumiblemente una cuenta asociada al proyecto tokie (chonkie-inc), y esta pensado para integrarse mediante la libreria `tokie` (version 0.0.4 en el ejemplo de Rust), que se presenta como un reemplazo directo de los tokenizers de HuggingFace escrito en Rust, con una carga en torno a 5 ms y un formato binario aproximadamente 10 veces mas pequeno. El tamano del repositorio es de 0,2 GB, coherente con un artefacto de tokenizacion y no con pesos de un modelo.

La relevancia de esta ficha es limitada en terminos de evaluacion de modelos: no hay pesos, no hay arquitectura de red, no hay benchmarks y no hay informacion sobre licencia del modelo original mas alla de la referencia a `voyageai/voyage-3`. Cualquier uso practico pasa por consultar el repositorio del modelo de embeddings original para obtener las especificaciones reales (dimension de embedding, contexto maximo, idiomas, licencia comercial).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto de tokenizacion, no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo `voyageai/voyage-3` original) |
| Tipos de cuantizacion | no disponible (no aplica a un tokenizer) |
| Idiomas soportados | no disponible |
| Licencia | MIT OR Apache-2.0 para la libreria tokie; los ficheros originales conservan la licencia de `voyageai/voyage-3` (no especificada en la informacion disponible) |
| Formato de pesos | `tokenizer.tkz` (binario tokie) y `tokenizer.json` (HuggingFace, si esta disponible) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: este repositorio no contiene un modelo entrenado, sino los artefactos de tokenizacion asociados a `voyageai/voyage-3`. El fichero principal es `tokenizer.tkz`, un formato binario propietario de tokie que, segun la model card, es aproximadamente 10 veces mas pequeno que el JSON equivalente y se carga en unos 5 ms. Se incluye tambien `tokenizer.json` en formato HuggingFace cuando el autor lo ha podido generar, lo que permite usar la libreria `tokenizers` estandar como alternativa.

La innovacion tecnica que se promociona es la propia libreria tokie: un reemplazo directo de los tokenizers de HuggingFace implementado en Rust, con la promesa de "50x faster tokenization, 10x smaller model files, 100% accurate". No se aportan en la informacion disponible detalles sobre el algoritmo de tokenizacion subyacente (BPE, WordPiece, Unigram), el vocabulario, el tamano del vocabulario ni los datos con los que se entreno el tokenizer original de Voyage.

## Capacidades

- Tokenizacion de texto de entrada compatible con el modelo de embeddings `voyageai/voyage-3`.
- API Python mediante `tokie.Tokenizer.from_pretrained("tokiers/voyage-3")`, con salida de `ids` y `attention_mask`.
- API Rust mediante `tokie::Tokenizer::from_pretrained(...)` con la feature `hf` habilitada.
- Carga rapida del tokenizer (en torno a 5 ms segun la model card) gracias al formato binario `.tkz`.
- Compatibilidad con el ecosistema HuggingFace a traves del fichero `tokenizer.json` incluido.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling ni capacidades de agente: es exclusivamente un componente de preprocesado.

## Casos de uso

- Pipeline de embeddings con Voyage AI: usar el tokenizer para calcular el numero exacto de tokens de cada documento antes de enviarlo a la API de Voyage, controlando costes y limites de longitud. Es adecuado porque reproduce la segmentacion del modelo original.
- Chunking de documentos para RAG: al conocer los limites reales de tokens del modelo de embeddings, se pueden construir chunks que no se trunquen ni pierdan informacion en la fase de indexacion.
- Servicios de inferencia en Rust: integrar el tokenizer directamente en un microservicio Rust sin depender de la libreria `tokenizers` de HuggingFace, reduciendo el tiempo de arranque y el tamano del binario.
- Validacion previa de entradas en produccion: estimar la longitud en tokens de las consultas de usuario antes de llamar al endpoint de embeddings, aplicando truncado o rechazo controlado.
- Herramientas de analisis de coste: calcular de forma exacta el consumo de tokens de un corpus para presupuestar llamadas a la API de Voyage AI.
- Sustitucion de tokenizers en entornos con restricciones de arranque en frio: en funciones serverless o contenedores efimeros, la carga en milisegundos del formato `.tkz` reduce la latencia inicial frente a la carga de un `tokenizer.json` grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona de forma generica "50x faster tokenization, 10x smaller model files, 100% accurate" para la libreria tokie, pero no se aportan cifras concretas, metodologia ni comparaciones reproducibles en el material consultado.

## Requisitos de hardware

- No requiere GPU: es un artefacto de tokenizacion que se ejecuta en CPU.
- VRAM estimada: 0 GB (no aplica).
- GPU recomendadas: ninguna en particular; cualquier CPU moderna es suficiente.
- Cabe en cualquier entorno consumer, incluidos dispositivos de bajos recursos y entornos serverless.
- Opciones de despliegue: libreria `tokie` en Python o Rust; alternativa mediante `tokenizer.json` con la libreria `tokenizers` de HuggingFace.
- Latencia y throughput: la model card indica una carga en torno a 5 ms del fichero `.tkz`; no se aportan cifras de throughput de tokenizacion por segundo.

## Comparativa con modelos similares

| Tokenizer | Modelo asociado | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| `tokiers/voyage-3` | `voyageai/voyage-3` | `.tkz` + `tokenizer.json` | MIT OR Apache-2.0 (libreria) / licencia original del modelo | HuggingFace (repo `tokiers/voyage-3`) |
| Tokenizer oficial de `voyageai/voyage-3` | `voyageai/voyage-3` | `tokenizer.json` | Segun el modelo original (no disponible) | HuggingFace (`voyageai/voyage-3`) |
| Tokenizer de `BAAI/bge-m3` | `BAAI/bge-m3` | `tokenizer.json` (SentencePiece) | MIT | HuggingFace |
| Tokenizer de `intfloat/multilingual-e5-large` | `intfloat/multilingual-e5-large` | `tokenizer.json` | MIT | HuggingFace |

La comparativa se limita a la funcion de tokenizacion; no hay datos de rendimiento ni de calidad de embeddings asociados a este repositorio.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no produce embeddings por si mismo y no puede usarse para tareas de inferencia.
- La licencia del modelo original `voyageai/voyage-3` no se especifica en la informacion disponible; es imprescindible consultarla antes de un uso comercial.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- No se documentan los idiomas soportados por el tokenizer ni el tamano del vocabulario.
- La promesa de "100% accurate" de tokie no viene acompanada de una metodologia ni de tests publicados en la informacion consultada.
- Depende de la libreria `tokie` (version 0.0.4 en el ejemplo de Rust), un proyecto joven; conviene evaluar su estabilidad antes de integrarlo en produccion.
- El formato `.tkz` es propietario de tokie, lo que introduce dependencia de esa libreria si no se usa el `tokenizer.json` alternativo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tokiers/voyage-3
- Modelo original de embeddings: https://huggingface.co/voyageai/voyage-3
- Repositorio de tokie en GitHub: https://github.com/chonkie-inc/tokie
