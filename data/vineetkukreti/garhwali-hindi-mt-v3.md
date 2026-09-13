# vineetkukreti/garhwali-hindi-mt-v3

## Resumen

garhwali-hindi-mt-v3 es un modelo de traduccion automatica neuronal entre hindi (hi) y garhwali (gbm), ambos escritos en devanagari. El garhwali es una lengua pahari central de Uttarakhand (India) con recursos digitales muy limitados, y este modelo aborda precisamente ese escenario de bajos recursos apoyandose en un fine-tuning de google/mt5-small. Lo desarrolla el usuario de HuggingFace vineetkukreti y se publica bajo licencia Apache 2.0.

Tecnicamente es un transformer encoder-decoder de tipo T5 multilingue, con 556.291.456 parametros reales en safetensors y un contrato de tarea explicito: el prompt debe incluir el prefijo `"translate {Source} to {Target}: "`. La version v3 se entreno con 5.000 pares sinteticos distribuidos en 34 lotes tematicos (B-01 a B-34) y obtuvo BLEU 31,8, chrF++ 78,4 y una tasa de fuga de hindi del 11,2% en la evaluacion del propio autor.

Su relevancia es mas metodologica que de producto: el autor la presenta como el ultimo escalon totalmente sintetico de una linea v1-v4, y demuestra que reducir el corpus de 19.982 a 5.000 pares mejorando la diversidad tematica subio el BLEU de 24,5 a 31,8. La propia model card indica que esta superada por v4 y que no es el modelo de produccion, por lo que debe tratarse como una pieza de comparacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia T5, mT5) |
| Parametros totales | 556.291.456 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 64 tokens de fuente y 64 de destino en entrenamiento (max source/target length); no se documenta el uso de ventanas mayores |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hindi (hi) y garhwali (gbm), ambos en devanagari |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | google/mt5-small, revision fijada 73fb5dbe4756edadc8fbe8c769b0a109493acf7a |
| Pipeline | translation (text2text-generation) |
| Prefijo obligatorio | `translate {Source} to {Target}: ` |
| Tamano del repositorio | 2,2 GB |
| Descargas / likes | 5 / 0 |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de google/mt5-small, un transformer encoder-decoder con atencion relativa y vocabulario SentencePiece compartido para mas de 100 idiomas. No hay mezcla de expertos, atencion lineal ni decodificacion especulativa: la innovacion del proyecto esta en la construccion del corpus y en la metodologia de evaluacion, no en la topologia de red. La seleccion de hiperparametros fue fija: seed=42, optimizador adafactor, label smoothing 0,1, precision bf16 y maxima longitud de fuente y destino de 64 tokens. El checkpoint final se escogio por chrF++ y no por perdida, decision justificada por el autor porque chrF++ es mas informativo en lenguas de destino con morfologia rica.

Los datos de entrenamiento de v3 son 5.000 pares sinteticos organizados en 34 lotes tematicos disenados contra un esquema matricial, con `no_repeat_ngram_size=3` para penalizar la repeticion que v2 habia premiado. No hubo RLHF ni DPO. La diferencia clave respecto a v2 (19.982 pares con 27 plantillas fijas) es que v3 reduce el volumen y amplia la forma del corpus, lo que subio el BLEU de 24,5 a 31,8 y redujo la fuga de hindi de 22,1% a 11,2%. Segun el autor, la particion de datos se agrupo por documento, hablante y coleccion para evitar filtraciones entre entrenamiento y evaluacion. La limitacion estructural de v3 es que todo el corpus es sintetico: sus errores son sistematicos, con salidas fluidas pero morfologia aspectual incorrecta, porque ningun generador fue corregido por un hablante nativo. Ese es el motivo por el que existe v4, que introduce diccionarios Dhyani y Benjwal, textos de archivo universitarios y datos gold revisados por nativos, alcanzando BLEU 36,4 y fuga de hindi 6,8% con 8.642 pares.

## Capacidades

- Traduccion bidireccional hindi a garhwali y garhwali a hindi, siempre en escritura devanagari.
- Generacion de texto secuencia a secuencia mediante el pipeline `text2text-generation` de transformers.
- Decodificacion con busqueda por haz (el ejemplo oficial usa `num_beams=4` y `max_new_tokens=128`).
- Condicionamiento por prefijo de tarea: `translate {Source} to {Target}: ` forma parte del contrato entrenado y es obligatorio para obtener el comportamiento esperado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de vision, audio, ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada a la pareja hindi-garhwali; el tag de idioma declarado en HuggingFace es unicamente `hi`.

## Casos de uso

- Investigacion en traduccion automatica de bajos recursos: v3 sirve como punto de control intermedio en la linea v1-v4 para medir cuanto aporta la diversidad de corpus sintetico frente al volumen, con metricas publicadas y comparables dentro del mismo proyecto.
- Analisis de fuga linguistica: al tener una tasa de fuga de hindi del 11,2% documentada, es un caso de estudio util para estudiar el fallo caracteristico de adaptar un modelo multilingue a una lengua hermana de bajos recursos.
- Digitalizacion asistida de textos en garhwali: traduccion preliminar de parrafos cortos (hasta 64 tokens) procedentes de archivo o prensa local, siempre con revision posterior por un hablante nativo.
- Prototipado de interfaz de traduccion para Uttarakhand: integracion en una demo de transformers para validar flujos de traduccion hindi-garhwali antes de migrar a v4.
- Construccion de corpus paralelos asistida: generacion de candidatos de traduccion que despues se filtran y adjudican manualmente, aprovechando que el propio autor documenta ledgers de cuarentena y adjudicacion en versiones posteriores.
- Apoyo a linguistica descriptiva: contraste de morfologia aspectual entre la salida del modelo y las formas documentadas en gramaticas como la de Chatak (1959), ya que los errores sistematicos de v3 son precisamente de aspecto verbal.
- Evaluacion comparativa de checkpoints: uso como referencia sintetica frente a v2 (mas volumen, menos diversidad) y v4 (datos nativos) en experimentos academicos reproducibles.
- No se recomienda su uso como motor de traduccion en produccion ni en atencion al cliente, dado que el propio autor lo marca como superado por v4 y no revisado por nativos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card. No se han encontrado resultados de benchmarks independientes ni evaluaciones de terceros; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.

| Metrica | Valor |
|---|---|
| BLEU | 31,8 |
| chrF++ | 78,4 |
| Fuga de hindi (Hindi leakage) | 11,2% |
| Pares de entrenamiento | 5.000 |
| Estado declarado | superado por v4 |

Comparativa interna de la linea v1-v4, segun los datos del autor:

| Version | Nombre | Datos | Pares | BLEU | chrF++ | Fuga de hindi | Estado |
|---|---|---|---|---|---|---|---|
| v1 | Classical Linguistic Baseline | Gramatica de Chatak (1959) + semillas de Grierson LSI | 48 | 11,2 | 42,1 | 38,5% | obsoleta |
| v2 | Synthetic Closed Template | 27 plantillas fijas generadas | 19.982 | 24,5 | 68,4 | 22,1% | archivada |
| v3 | Balanced Multi-Aspect Synthetic | 34 lotes tematicos (B-01 a B-34) | 5.000 | 31,8 | 78,4 | 11,2% | candidata |
| v4 | Archival + Lexicon + Native Gold | Diccionarios Dhyani y Benjwal, archivos, gold revisado por nativos | 8.642 | 36,4 | 83,9 | 6,8% | activa |

Advertencia metodologica del propio autor: las puntuaciones de v2 estaban infladas porque el conjunto de prueba compartia plantillas con el entrenamiento, lo que produjo colapso de vocabulario en combinaciones lexicas no vistas. No hay datos publicados sobre si v3 conserva parte de ese sesgo de plantilla; el autor solo indica que las particiones se agruparon por documento, hablante y coleccion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,2 GB en fp32 (coincide con el tamano del repositorio), en torno a 1,1 GB en fp16 o bf16, unos 0,6 GB en int8 y unos 0,3 GB en int4, sin contar el pequeno overhead de activaciones y cache de decodificacion.
- Cabe sin problema en GPU de consumo: GTX 1650 (4 GB), RTX 3050, RTX 3060, RTX 4060, RTX 4090 y tambien en GPU de portatil con 4 GB o mas de VRAM.
- Inferencia en CPU perfectamente viable dado el tamano (556 M de parametros); util para despliegues de bajo trafico o entornos sin GPU.
- GPU de centro de datos recomendadas para lotes grandes: NVIDIA T4, L4, A10G, A100 y H100, aunque estan sobredimensionadas para un modelo de este tamano y solo se justifican por agrupacion de peticiones.
- Opciones de despliegue documentadas: unicamente transformers con PyTorch y pesos safetensors. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni la existencia de pesos GGUF; para arquitecturas encoder-decoder conviene verificar el soporte de la version concreta del servidor antes de asumirlo.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros sistemas publicados especificos de traduccion garhwali-hindi con los que comparar. La comparativa se limita por tanto a la propia linea de versiones del autor y al modelo base.

| Modelo | Parametros | Contexto | BLEU (linea del autor) | chrF++ | Fuga de hindi | Licencia | Estado |
|---|---|---|---|---|---|---|---|
| garhwali-hindi-mt-v3 | 556 M | 64 tokens en entrenamiento | 31,8 | 78,4 | 11,2% | apache-2.0 | superado por v4 |
| garhwali-hindi-mt-v2 | no disponible | no disponible | 24,5 | 68,4 | 22,1% | no disponible en la informacion proporcionada | archivado |
| garhwali-hindi-mt-v1 | no disponible | no disponible | 11,2 | 42,1 | 38,5% | no disponible en la informacion proporcionada | obsoleto |
| garhwali-hindi-mt-v4 | no disponible | no disponible | 36,4 | 83,9 | 6,8% | no disponible en la informacion proporcionada | activo, recomendado por el autor |
| google/mt5-small (base) | no disponible en esta ficha | no disponible | no disponible | no disponible | no disponible | apache-2.0 | modelo base sin fine-tuning para esta tarea |

## Limitaciones y advertencias

- Modelo superado: la propia model card indica que v4 lo reemplaza y que v3 no es el modelo de produccion; solo tiene sentido si se busca especificamente el ultimo paso totalmente sintetico.
- Tasa de fuga de hindi del 11,2%, mas del doble que el 6,8% de v4: el modelo emite hindi donde deberia emitir garhwali, que es el modo de fallo tipico al adaptar un modelo multilingue a una lengua hermana de bajos recursos.
- Entrenamiento integramente sintetico, sin revision de hablantes nativos, lo que produce errores sistematicos de morfologia aspectual: salidas fluidas pero gramaticalmente incorrectas en el aspecto verbal.
- Requiere revision por hablante nativo para cualquier uso publicado, segun el propio autor.
- Sesgos conocidos mas alla de la fuga de hindi: no disponible en la informacion proporcionada.
- Riesgo de alucinacion y de invencion lexica en dominios alejados de los 34 lotes tematicos de entrenamiento; el autor documenta colapso de vocabulario en la version anterior con datos fuera de plantilla.
- Riesgo de sesgo de plantilla en la evaluacion: en v2 el solapamiento entre plantillas de entrenamiento y de prueba inflo las metricas, y no se publica una verificacion equivalente para v3.
- Limitacion de longitud: la ventana de trabajo es de 64 tokens en fuente y destino, insuficiente para documentos o conversaciones multi-turno largas.
- Limitacion idiomatica: solo se declara soporte de hindi en los tags de HuggingFace, y el garhwali aparece en la model card pero no como idioma declarado en el repositorio.
- Adopcion practicamente nula: 5 descargas y 0 likes en el momento de la consulta, sin evaluacion independiente conocida.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el autor desaconseja explicitamente el uso en produccion por la calidad del modelo, no por la licencia.
- Para produccion, comprobar las condiciones y la licencia del modelo v4, cuyo repositorio no se ha verificado en esta ficha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vineetkukreti/garhwali-hindi-mt-v3
- Modelo base google/mt5-small: https://huggingface.co/google/mt5-small
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo, su autoria o su linea de versiones; los unicos enlaces disponibles son los anteriores.
