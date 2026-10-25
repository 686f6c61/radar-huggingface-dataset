# xCloudinfo/xVITA-Embed2-zhTW-GGUF

## Resumen

xVITA-Embed2-zhTW es un modelo de embeddings (no generativo) desarrollado por xCloudinfo (云碩科技, Taiwán) mediante ajuste fino de `google/embeddinggemma-2`. Su particularidad es que proyecta texto, imágenes y audio en un mismo espacio vectorial de 768 dimensiones, de modo que una única indexación permite buscar fotos con texto, texto con fotos o transcripciones con grabaciones. Está especializado en chino tradicional de Taiwán (zh-TW), con soporte secundario de inglés, y se distribuye en formato GGUF para ejecución local con llama.cpp.

El problema que aborda el autor es concreto: al conectar EmbeddingGemma 2 a una base de conocimiento en chino tradicional, la recuperación de pasajes en chino quedaba por debajo de su modelo anterior y la recuperación de voz en chino era prácticamente nula (hit@1 de 0,2452 en voz→texto). El ajuste fino se hizo bajo una restricción explícita: ninguna tarea de recuperación entre modalidades podía retroceder más de 1 punto porcentual respecto al modelo base, para no romper la alineación imagen-texto mientras se mejoraba el texto.

El resultado son 271 millones de parámetros, siete niveles de cuantización para el modelo de texto (131 MB a 558 MB) más un codificador multimodal separado (`mmproj`, 982 MB), licencia Apache 2.0 y un incremento de +5,58 puntos en recuperación de pasajes DRCD y de +51,86 puntos en voz→texto sobre Common Voice chino. Es relevante para equipos que necesitan RAG multilingüe y multimodal en infraestructura propia, sin GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer para embeddings (base: `google/embeddinggemma-2`), con codificadores multimodales de imagen y audio en fichero `mmproj` aparte |
| Parametros totales | 271.002.648 (pesos safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion; las pruebas de recuperacion de documento completo leen hasta 8.192 tokens y C-MTEB se trunca a 512 tokens |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (Q6_K e inferiores con imatrix) |
| Idiomas soportados | zh (chino tradicional, Taiwán) y en |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); los pesos originales en safetensors no se alojan en este repositorio |
| Dimension del embedding | 768 (etiqueta `matryoshka`) |
| Pooling y normalizacion | Incluidos en la cabecera del GGUF (no requiere `--pooling`) |
| Prefijos obligatorios | Consulta: `task: search result \| query: ` / Documento: `title: none \| text: ` |
| Tamano del repositorio | 2,8 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

Se trata de un encoder de embeddings derivado de `google/embeddinggemma-2`, con 271 millones de parámetros y salida de 768 dimensiones. El repositorio añade un codificador multimodal (`xVITA-Embed2-zhTW-mmproj-BF16.gguf`, 982 MB) que permite procesar imágenes y audio hacia el mismo espacio vectorial; en las pruebas de imagen se fija un presupuesto de 280 tokens por imagen. El ajuste fino se realizó sobre pares de recuperación en chino tradicional construidos con material de dominio público taiwanés: el corpus del 國家文化記憶庫 (National Cultural Memory Bank), del que se recopilaron por navegador materiales con licencia comercializable, generando pares título-fotografía y fotografía-descripción, además de pares inversos (fotografía→título) que, según el autor, fueron determinantes: sin esa mitad inversa la recuperación foto→descripción quedaba 3,6 puntos por debajo del modelo base, y con ella subió 4,3 puntos por encima.

El criterio de selección del checkpoint no fue una puntuación única sino un umbral: ninguna tarea de recuperación entre modalidades podía degradarse más de 1 punto porcentual respecto al modelo base. El autor documenta el motivo con datos: una ronda temprana subió DRCD de 0,8125 a 0,8780 pero hundió imagen→texto de 0,6726 a 0,4934 y texto→imagen de 0,6394 a 0,3864, es decir, el ajuste en texto desalineó el espacio imagen-texto. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF/DPO (no aplicables habitualmente a modelos de embeddings). Las cuantizaciones Q6_K e inferiores usan imatrix con un corpus de calibración de 700 líneas de pasajes, preguntas, frases de prensa y títulos de fotos en chino tradicional, con los prefijos de servicio aplicados.

## Capacidades

- Generación de embeddings de texto en chino tradicional e inglés, con salida de 768 dimensiones.
- Embeddings de imagen: fotografías y material gráfico al mismo espacio vectorial que el texto.
- Embeddings de audio: fragmentos de voz en chino al mismo espacio vectorial (recuperación voz→texto y texto→voz).
- Recuperación entre modalidades: texto→imagen, imagen→texto, voz→texto, texto→voz, texto→texto.
- Similitud semántica de frases (`sentence-similarity`), con pooling y normalización ya fijados en el GGUF.
- Soporte declarado de `matryoshka`, lo que permite truncar la dimensionalidad del vector (el autor no publica métricas por dimensión).
- Compatible con endpoints (`endpoints_compatible`) y con el endpoint `/v1/embeddings` de llama-server.
- Etiquetas del repositorio orientadas a `retrieval` y `rag`.
- No genera texto: es exclusivamente un modelo de embeddings.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo "thinking".

## Casos de uso

- RAG sobre bases de conocimiento en chino tradicional: con hit@1 de 0,8683 en recuperación de pasajes DRCD (3.493 preguntas) y 0,8299 en documento completo, es adecuado para indexar normativa, documentación interna o wikis en zh-TW y recuperar los pasajes relevantes antes de pasarlos a un LLM generativo.
- Búsqueda de fotografías por descripción textual en archivos históricos: en el conjunto de fotografías antiguas de Taiwán (999 imágenes, material nunca visto en entrenamiento) sube de 0,3353 a 0,5145 en título→foto; útil para museos, hemerotecas y archivos fotográficos que necesitan catalogación asistida.
- Búsqueda inversa imagen→texto en catálogos: 0,6822 en XM3600 foto→descripción china (frente a 0,6394 del modelo base), aplicable a la generación de pies de foto candidatos o a la localización de documentos que ilustran una imagen.
- Recuperación de transcripciones a partir de audio en chino: 0,7638 en voz→texto sobre Common Voice chino, aplicable a archivos de entrevistas, actas de reuniones o fondos orales donde se busca "¿en qué grabación se habló de X?" sin transcribir todo el corpus previamente.
- Búsqueda en boletines y gacetas oficiales: 0,9740 en asunto→imagen de página y 0,9970 en imagen de página→texto completo sobre el Boletín Oficial del Ejecutivo (行政院公報), un escenario típico de gestión documental administrativa.
- Deduplicación y clustering semántico de corpus documentales: con 310 MB en Q8_0 se puede indexar y agrupar cientos de miles de fragmentos sin GPU, por ejemplo para detectar contenido duplicado en un repositorio normativo.
- Clasificación y filtrado semántico en pipelines de datos: usar las distancias coseno contra un conjunto de vectores de referencia (temas, categorías, plantillas) para etiquetar o descartar documentos antes de etapas más costosas.
- Despliegue en entorno local o edge sin GPU: el fichero Q4_K_M ocupa 182 MB y mantiene una consistencia coseno media de 0,98884 respecto a los pesos originales, lo que permite ejecutarlo en portátiles, mini-PC o servidores sin acelerador para prototipos y demos de RAG.

## Benchmarks y rendimiento

Resultados del autor sobre pesos originales (safetensors), métrica hit@1, con conjuntos de test no vistos en entrenamiento (DRCD con su split oficial de test; muestras de foto y audio reservadas antes de construir el material de entrenamiento):

| Prueba | embeddinggemma-2 (base) | xVITA-Embed2-zhTW | Diferencia (puntos) |
|---|---|---|---|
| DRCD recuperación de pasajes (3.493 preguntas) | 0,8125 | 0,8683 | +5,58 |
| DRCD recuperación de documento completo (3.493) | 0,8128 | 0,8299 | +1,71 |
| XM3600: descripción china → foto | 0,6726 | 0,6745 | +0,19 |
| XM3600: foto → descripción china | 0,6394 | 0,6822 | +4,28 |
| XM3600: descripción inglesa → foto | 0,5946 | 0,5853 | −0,93 |
| XM3600: foto → descripción inglesa | 0,6183 | 0,6236 | +0,53 |
| Fotos antiguas de Taiwán: título → foto (999) | 0,3353 | 0,5145 | +17,92 |
| Fotos antiguas de Taiwán: foto → título (999) | 0,3624 | 0,5185 | +15,61 |
| Boletín oficial: asunto → imagen de página | 0,9100 | 0,9740 | +6,40 |
| Boletín oficial: imagen de página → texto completo | 0,9950 | 0,9970 | +0,20 |
| Common Voice chino: voz → texto | 0,2452 | 0,7638 | +51,86 |
| Common Voice chino: texto → voz | 0,4209 | 0,7732 | +35,23 |

Comparación de las mismas tareas ejecutadas sobre GGUF en llama.cpp (el autor usa el mismo conjunto de test de imagen, con 280 tokens por imagen):

| Prueba | Pesos originales | GGUF BF16 | GGUF Q4_K_M |
|---|---|---|---|
| XM3600: descripción china → foto | 0,6745 | 0,6641 | 0,6620 |
| XM3600: foto → descripción china | 0,6822 | 0,6881 | 0,6831 |
| Fotos antiguas: título → foto | 0,5145 | 0,5395 | 0,5385 |
| Fotos antiguas: foto → título | 0,5185 | 0,5355 | 0,5325 |

Consistencia de las cuantizaciones respecto a los pesos originales (coseno sobre 20 frases en chino):

| Fichero | Tamano | Coseno minimo / medio | Nota del autor |
|---|---|---|---|
| BF16 | 558 MB | 0,99991 / 0,99998 | Máxima fidelidad |
| Q8_0 | 310 MB | 0,99934 / 0,99971 | Opción por defecto para despliegue |
| Q6_K | 246 MB | 0,99406 / 0,99852 | — |
| Q5_K_M | 213 MB | 0,99452 / 0,99653 | — |
| Q4_K_M | 182 MB | 0,97281 / 0,98884 | Cuando hay restricción de memoria |
| IQ4_XS | 169 MB | 0,97969 / 0,98711 | — |
| IQ2_M | 131 MB | 0,87301 / 0,89867 | No recomendado para recuperación |

## Requisitos de hardware

- El modelo de texto es muy ligero: el fichero Q8_0 ocupa 310 MB y el BF16 558 MB. Se estima un consumo de VRAM en torno a 0,5-1 GB incluyendo el overhead de llama.cpp (estimación, el autor no publica cifras de VRAM).
- Cabe en cualquier GPU de consumo: RTX 3060/4060/4090, e incluso en iGPU o CPU exclusivamente. No requiere A100 ni H100; sería un desperdicio asignarle una GPU de centro de datos solo para los embeddings.
- Para imagen o audio hay que sumar el `mmproj` BF16 de 982 MB, con lo que el total en disco ronda 1,3 GB en la configuración Q8_0 + mmproj.
- Despliegue mediante llama.cpp / llama-server con `--embeddings`; para modalidades no textuales, `--mmproj xVITA-Embed2-zhTW-mmproj-BF16.gguf --image-min-tokens 280 --image-max-tokens 280`. El endpoint de texto es `/v1/embeddings`; el de imagen y audio es `/embeddings` con `multimodal_data` en base64, leyendo previamente `media_marker` de `/props`.
- La etiqueta `sentence-transformers` figura en el repositorio, aunque los ficheros publicados son GGUF; para el uso con sentence-transformers habría que recurrir a los pesos originales en safetensors, no incluidos aquí.
- No se publican cifras de latencia ni de throughput. Por el tamaño (271 M de parámetros, 768 dimensiones), se espera un coste por embedding muy bajo en CPU, pero es una estimación, no un dato del autor.
- El autor verificó el rendimiento en llama.cpp con un presupuesto fijo de 280 tokens por imagen; desviarse de ese ajuste altera los resultados de recuperación.

## Comparativa con modelos similares

Datos del autor, medidos con el mismo código. DRCD es hit@1; C-MTEB es la media de nDCG@10 en ocho tareas de recuperación en chino (T2, MMarco, Du, Covid, Cmedqa, Ecom, Medical, Video), truncadas a 512 tokens; "convertido a tradicional" aplica OpenCC a preguntas y documentos.

| Modelo | Dimensiones | DRCD pasajes | DRCD documento | C-MTEB original | C-MTEB en tradicional | Licencia |
|---|---|---|---|---|---|---|
| Llama-xVITA-Embed-1B-zhTW (xCloudinfo) | 2048 | 0,8809 | 0,8586 | 56,85 | 55,78 | no disponible |
| **xVITA-Embed2-zhTW** | 768 | 0,8677 | 0,8305 | 61,79 | 60,73 | Apache 2.0 |
| xVITA-Embed-300M-zhTW (xCloudinfo, generación anterior) | 768 | 0,8600 | 0,7927 | 58,90 | 57,22 | no disponible |
| intfloat/multilingual-e5-large | 1024 | 0,8285 | 0,7060 | 63,66 | 61,57 | no disponible |
| BAAI/bge-m3 | 1024 | 0,8219 | 0,7741 | 65,32 | 63,71 | no disponible |
| google/embeddinggemma-2 (base) | 768 | 0,8125 | 0,8128 | 61,26 | 59,87 | no disponible |

Lectura: en chino tradicional este modelo supera a multilingual-e5-large y a bge-m3 tanto en pasajes como en documento completo, y en C-MTEB en tradicional también (60,73 frente a 61,57 de e5-large en la misma métrica convertida — el autor indica que queda por detrás de e5-large en torno a 1,9 puntos en la media y tercero de la tabla). El punto fuerte diferencial no es la puntuación pura sino tener texto, imagen y audio en un único espacio de 768 dimensiones con 310 MB en Q8_0; si solo se hace texto y documentos largos, el propio autor recomienda su Llama-xVITA-Embed-1B-zhTW (2,8 puntos más en documento completo). Los datos de licencia de los modelos de comparación no figuran en la información proporcionada.

## Limitaciones y advertencias

- Es un modelo de embeddings: no genera texto, no responde preguntas y no admite instrucciones. Cualquier uso generativo requiere emparejarlo con un LLM.
- Los prefijos de consulta y documento son obligatorios y literales. Si se omiten o se escriben distinto, no hay mensaje de error: la calidad de recuperación cae de forma silenciosa.
- La cuantización IQ2_M tiene una consistencia coseno media de 0,89867 (mínima 0,87301) y el autor desaconseja explícitamente su uso para construir índices, porque el orden de resultados se degrada.
- Fuga en la evaluación de audio: el conjunto de test de Common Voice solo excluye frases, no hablantes, por lo que parte de la mejora de +51,86 puntos en voz→texto puede atribuirse a voces vistas en entrenamiento. El autor verificó la mejora con grabaciones de otra fuente no pública, pero esos números no se publican.
- Única regresión documentada: descripción inglesa → foto, con −0,93 puntos respecto al modelo base. El inglés está soportado pero no es el foco del ajuste.
- En recuperación web general en chino simplificado (C-MTEB) queda por detrás de multilingual-e5-large (61,79 frente a 63,66) y de bge-m3 (65,32); la brecha mayor está en DuRetrieval (75,19 frente a 85,31). Para dominios de internet en chino simplificado, no es la primera opción.
- Los vectores de imagen calculados con llama.cpp no coinciden exactamente con los de la implementación original (coseno 0,92-0,96): la diferencia proviene del preprocesado de imagen, no de la cuantización, y se traduce en torno a 1 punto de caída en descripción china → foto.
- El rendimiento multimodal está calibrado para 280 tokens por imagen; otros ajustes invalidan las cifras publicadas.
- No se documentan sesgos demográficos o culturales específicos, ni evaluaciones de robustez frente a texto adversario; el corpus de entrenamiento se centra en material cultural y administrativo taiwanés, lo que puede infrarepresentar otras variantes del chino.
- La licencia Apache 2.0 permite uso comercial, pero el entrenamiento usa material con licencia comercializable del National Cultural Memory Bank y de Common Voice: conviene revisar las condiciones de esas fuentes si se redistribuye el modelo o datos derivados.
- Repositorio con 0 descargas y 0 likes: no hay validación independiente de las cifras, todas proceden del propio autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xCloudinfo/xVITA-Embed2-zhTW-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Organización xCloudinfo en Hugging Face: https://huggingface.co/xCloudinfo/models
- xCloudinfo/Gemma-4-31B-xVITA-zhTW-GGUF (otro modelo de la misma organización): https://huggingface.co/xCloudinfo/Gemma-4-31B-xVITA-zhTW-GGUF
- Ficha de Llama-xVITA-Embed-1B-zhTW-GGUF en free2aitools: https://free2aitools.com/model/xcloudinfo/llama-xvita-embed-1b-zhtw-gguf
- Documentación de la familia Gemma 4 (contexto del ecosistema del modelo base): https://gemma.ai/models/gemma-4/
- Registro de xCloudinfo/Gemma-4-31B-xVITA-zhTW-abliterated-GGUF en abliteration.org: https://abliteration.org/models/xCloudinfo/Gemma-4-31B-xVITA-zhTW-abliterated-GGUF
