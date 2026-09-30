# ZeroGPU/zlm-v1-iab-classify-edge

## Resumen

zlm-v1-iab-classify-edge es un clasificador de texto multietiqueta desarrollado por ZeroGPU que asigna a un texto corto en ingles etiquetas de la taxonomia IAB Tech Lab: 704 categorias de contenido (IAB Content Taxonomy 3.0) y 1.567 segmentos de audiencia (IAB Audience Taxonomy 1.1). El modelo resuelve un problema muy concreto del sector ad-tech y de la gestion de contenidos: etiquetar paginas y audiencias sin pagar una llamada a un LLM por cada pagina, cuando la latencia y el coste por inferencia son criticos.

Tecnicamente es un fine-tuning del backbone `sentence-transformers/all-MiniLM-L6-v2` (6 capas, hidden size 384) al que se anaden dos cabezas MLP de clasificacion multietiqueta. El modelo completo tiene 24,1 millones de parametros (22,6 M del encoder y 1,6 M de las cabezas) y se distribuye exclusivamente como grafo ONNX cuantizado a int8 de 24,8 MB. Se sirve con una ventana de entrada de 128 tokens, aunque fue entrenado a 512, y clasifica un texto de 128 tokens en 4-10 ms sobre la CPU de un portatil.

Su relevancia actual radica en el despliegue en el borde: es el mismo bundle que ZeroGPU ejecuta en produccion sobre navegadores (via transformers.js), workers de Node.js/Docker y Android. Segun el autor, en una comparacion ciega de 10.000 textos juzgada por GPT-5.5 sus etiquetas fueron preferidas a las de GPT-5.4-nano en el 66% de los casos decididos, y sobre etiquetas humanas independientes obtiene 0,406 de F1 frente a 0,375 de nano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT (MiniLM) con dos cabezas MLP de clasificacion multietiqueta |
| Parametros totales | 24,1 M (encoder 22,6 M; cabezas 1,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens en servicio (entrenado a 512 tokens) |
| Tipos de cuantizacion | int8 dynamic quantization (QUInt8, per-channel); existe version fp32 de referencia |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (`onnx/model_quantized.onnx`, int8, 24,8 MB); el repositorio no contiene pesos PyTorch |

## Arquitectura y entrenamiento

El backbone es `sentence-transformers/all-MiniLM-L6-v2`, un encoder tipo BERT de 6 capas y hidden size 384, ajustado de extremo a extremo. Sobre la salida del encoder se aplica mean pooling y normalizacion L2, y el vector resultante alimenta dos cabezas MLP independientes con estructura `Linear(384→512) → GELU → Linear(512→N)`: la cabeza de contenido produce 704 logits y la de audiencia 1.567. La salida es un unico tensor `logits` de forma `[batch, 2271]` (los 704 logits de contenido seguidos de los 1.567 de audiencia). Las etiquetas en `config.json` llevan prefijo de cabeza, por ejemplo `content|Soccer` o `audience|Interest | Sports | Soccer |`.

El modelo se plantea como clasificacion multietiqueta (`problem_type: multi_label_classification`): durante la decodificacion se aplica una sigmoide por etiqueta (no softmax), se conservan las puntuaciones mayores o iguales a 0,5 y se limita a un maximo de 6 etiquetas por cabeza, mostrando el ultimo segmento separado por `|` de cada etiqueta. La cuantizacion int8 dinamica del modelo fp32 mantiene la precision practicamente intacta: F1 de 0,4062 frente a 0,4060 en fp32 sobre el benchmark independiente, y selecciona la misma etiqueta de contenido principal en el 95,3% de las 2.784 paginas evaluadas. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO.

## Capacidades

- Clasificacion de contenido multietiqueta sobre 704 etiquetas de IAB Content Taxonomy 3.0 (701 nombres exactos de categoria que cubren las 36 categorias tier-1 y sus hijos tier-2 a tier-4).
- Clasificacion de audiencia sobre 1.567 etiquetas de IAB Audience Taxonomy 1.1, incluyendo las ramas Interest, Purchase Intent y Demographic.
- Salida con puntuacion de confianza por etiqueta (sigmoid a nivel de etiqueta), lo que permite umbralizar en produccion.
- Garantia de taxonomia cerrada: el modelo nunca devuelve una etiqueta fuera de la taxonomia.
- Clasificacion de texto corto en ingles (articulos, resumenes de pagina o cualquier texto breve).
- Ejecucion en el dispositivo: disenado para transformers.js y tambien ejecutable directamente en onnxruntime.
- No dispone de tool calling, function calling, capacidad agentica, vision, audio ni modo de razonamiento explicito: es un clasificador, no un modelo generativo.

## Casos de uso

- Segmentacion contextual de audiencias en publicidad programatica: dado el texto de una pagina, devuelve categorias de contenido y segmentos de audiencia con puntuacion, lo que permite construir senales de contextual targeting en el bidstream sin depender de cookies ni de llamadas a un LLM por impresion.
- Etiquetado editorial automatizado: un CMS puede clasificar cada articulo en la taxonomia IAB 3.0 al publicarlo, generando metadatos consistentes para navegacion, recomendacion y sitemaps sin intervencion manual.
- Cumplimiento y seguridad de marca (brand safety): al clasificar el contenido de una pagina con etiquetas tier-1/tier-2 conocidas, un ad server puede excluir inventario incompatible con una campana de forma determinista y auditable.
- Clasificacion en el navegador con transformers.js: el modelo de 24,8 MB puede descargarse y ejecutarse en el cliente, etiquetando texto sin enviar el contenido a un servidor, lo que reduce exposicion de datos y coste de infraestructura.
- Enriquecimiento de audiencias en pipelines de datos: integrar el clasificador como etapa previa a un data warehouse para poblar dimensiones IAB de contenido y audiencia junto a otros atributos, gracias a su bajo coste por inferencia y su salida multi-etiqueta con score.
- Filtrado y enrutamiento en aplicaciones moviles Android: la ventana de 128 tokens y el peso de 24,8 MB permiten clasificar texto en el propio dispositivo y decidir la seccion, feed o tratamiento a mostrar sin conexion ni backend.
- Preprocesado para sistemas de recomendacion y RAG: usar las etiquetas de contenido como features discretas o como filtro previo antes de la recuperacion, reduciendo el espacio de busqueda y aportando contexto categorico estable.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, sobre el dataset Figure Eight contextual (2.784 paginas web con etiquetas IAB humanas):

| Metrica | Valor |
|---|---|
| Tier-2 F1 (modelo int8 on-device) | 0,4062 |
| Tier-2 precision | 0,2951 |
| Tier-2 recall | 0,6515 |

Datos comparativos declarados en la model card y confirmados en la pagina de benchmarks del autor:

| Comparacion | Resultado |
|---|---|
| Victorias frente a GPT-5.4-nano (comparacion ciega de 10.000 textos, juzgada por GPT-5.5) | 66% de los casos decididos |
| F1 sobre etiquetas humanas independientes: zlm-v1-iab-classify-edge | 0,406 |
| F1 sobre etiquetas humanas independientes: GPT-5.4-nano | 0,375 |
| Coincidencia de etiqueta de contenido principal int8 vs fp32 | 95,3% de las 2.784 paginas |
| F1 fp32 de referencia | 0,4060 |

Ninguno de estos resultados esta verificado de forma independiente (`verified: false` en el model-index). No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU. El modelo esta pensado para CPU; el fichero int8 ocupa 24,8 MB y no se declara un minimo de memoria de dispositivo.
- GPU recomendadas: no aplica; el modelo no necesita acelerador. Cualquier GPU seria suficiente si se quisiera forzar, pero no es el caso de uso.
- Compatibilidad con GPU de consumo: si, en el sentido de que no necesita GPU alguna; se ejecuta en CPU de portatil, navegador, movil y contenedores ligeros.
- Opciones de despliegue: onnxruntime (CPUExecutionProvider), transformers.js para navegador, Node.js/Docker para workers, Android, y el modelo esta etiquetado como compatible con Text Embeddings Inference y con endpoints.
- Latencia estimada: 4-10 ms para clasificar un texto de 128 tokens en la CPU de un portatil (dato del autor). No se publica throughput agregado en la informacion disponible.
- Nota practica de despliegue: el `tokenizer.json` incluye truncacion y padding fijo a 128 tokens; se recomienda desactivar el padding al clasificar un unico texto, porque con cuantizacion int8 dinamica el padding desplaza los rangos de activacion y altera ligeramente las puntuaciones (por ejemplo, 0,908 sin padding frente a 0,920 con padding para la etiqueta principal de un texto deportivo). Produccion ejecuta un texto a la vez sin padding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|
| zlm-v1-iab-classify-edge (ZeroGPU) | 24,1 M | 128 tokens | apache-2.0 | ONNX int8 en HuggingFace, ejecucion en dispositivo | F1 tier-2 0,4062; 66% de victorias frente a GPT-5.4-nano |
| GPT-5.4-nano | no disponible | no disponible | propietaria | solo API | F1 0,375 sobre etiquetas humanas independientes |
| zlm-v1-iab-domain-classifier (ZeroGPU) | no disponible | no disponible | no disponible | HuggingFace | clasifica a partir del dominio, sin ver la pagina; entrenado con ~1 M de dominios etiquetados por un LLM maestro |

El unico rival con datos comparables aportados por el autor es GPT-5.4-nano. No se dispone de resultados de otros clasificadores IAB abiertos en la informacion proporcionada, por lo que la comparativa con alternativas de tamano similar queda como "no disponible".

Nota de discrepancia: la documentacion web de ZeroGPU describe en una de sus paginas un clasificador IAB de "90M de parametros" y "mas de 50 idiomas", cifras que no coinciden con la model card del repositorio de HuggingFace (24,1 M de parametros y solo ingles). Es posible que esa pagina describa otro modelo de la familia o una version de API distinta; para este modelo concreto deben tomarse como validas las cifras de la model card (24,1 M, idioma en).

## Limitaciones y advertencias

- Idioma: el modelo esta entrenado y etiquetado para ingles (`language: en`). No hay evidencia de rendimiento en otros idiomas, pese a la mencion a "50+ idiomas" de una pagina de documentacion que no corresponde a esta ficha.
- Ventana corta: se sirve a 128 tokens, aunque fue entrenado a 512. Los textos largos se clasifican solo a partir de sus primeros 128 word-pieces, lo que puede perder contexto relevante en articulos largos.
- Precision baja en terminos absolutos: el propio autor declara una precision tier-2 de 0,2951, con recall de 0,6515. Es decir, genera bastantes falsos positivos; conviene ajustar el umbral (por defecto 0,5) segun el caso de uso.
- Resultados no verificados: todas las metricas del model-index figuran con `verified: false`, incluida la comparacion con GPT-5.4-nano.
- Sensibilidad al padding: con cuantizacion int8 dinamica, anadir padding modifica los rangos de activacion y altera las puntuaciones. Usar sin padding en clasificacion unitaria para reproducir el comportamiento de produccion.
- Sin pesos PyTorch: el repositorio solo contiene el grafo ONNX y el tokenizer. El reentrenamiento o el fine-tuning adicional requeririan partir del modelo base, no del bundle publicado.
- Ambito cerrado: solo devuelve etiquetas de las taxonomias IAB Content 3.0 y Audience 1.1. No es un modelo generativo y no sirve para resumen, traduccion, codigo ni dialogo.
- Riesgo de alucinacion: al ser un clasificador multietiqueta con salida restringida a la taxonomia, no puede inventar etiquetas fuera de catalogo, pero si puede asignar categorias incorrectas con puntuaciones altas.
- Licencia: apache-2.0, permisiva para uso comercial, sin las restricciones tipicas de licencias de modelos abiertos mas grandes. Conviene, aun asi, revisar las condiciones de uso de las taxonomias IAB si se redistribuyen los catalogos de etiquetas.
- Sesgos: no se documenta ninguna evaluacion de sesgo en la informacion disponible; las etiquetas de audiencia (rama Demographic) pueden reflejar los sesgos del dataset de anotacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZeroGPU/zlm-v1-iab-classify-edge
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Documentacion de la API del modelo: https://docs.zerogpu.ai/api-reference/models/zlm-v1-iab-classify-edge
- Documentacion de clasificacion de texto de ZeroGPU: https://docs.zerogpu.ai/docs/text-classification
- Benchmarks frente a GPT-5.4 Nano: https://zerogpu.ai/benchmarks/iab-classify
- Modelo hermano (clasificador por dominio): https://huggingface.co/ZeroGPU/zlm-v1-iab-domain-classifier
- Estandar IAB Tech Lab Content Taxonomy: https://iabtechlab.com/standards/content-taxonomy/
- Documentacion de transformers.js: https://huggingface.co/docs/transformers.js
