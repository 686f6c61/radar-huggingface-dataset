# turion-ai/turion-extract-alpha

## Resumen

Turion Extract alpha es un modelo de extraccion de datos en una sola pasada desarrollado por Turion AI, entrenado sobre su propia plataforma de entrenamiento de modelos. A diferencia de un LLM generativo convencional, no genera texto libre: recibe un documento y un mapa de campos tipados, y devuelve un unico valor tipado (o `null`) por campo en una sola pasada hacia adelante. Resuelve el problema de la extraccion estructurada fiable y rapida de documentos, evitando los problemas tipicos de la generacion libre como salidas malformadas o alucinaciones.

Tecnicamente, es un adaptador LoRA (r32, alpha 64) mas cabeceras de extraccion ligeras sobre el modelo base google/gemma-4-12B-it, publicado en formato safetensors con la libreria PEFT. En el benchmark SystemOne Extract Index 0.1 obtiene una puntuacion de 75,30, con tiempos de respuesta medianos de 67 ms por peticion sobre una GPU NVIDIA RTX PRO 6000 en BF16. Es una version alpha temprana, con 26 descargas en el momento de redactar esta ficha, orientada a desarrolladores que necesitan extraccion tipada de alta precision sobre documentos de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA + cabeceras de extraccion (punteros, modos, seleccion) sobre google/gemma-4-12B-it |
| Parametros totales | no disponible (base de 12B segun el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 16.384 tokens por peticion |
| Tipos de cuantizacion | BF16 (hardware de evaluacion); no disponible otras |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, tamano del repo 0,7 GB) |

## Arquitectura y entrenamiento

El modelo combina un adaptador LoRA (rango 32, alpha 64) aplicado a todas las capas lineales del modelo de lenguaje base google/gemma-4-12B-it, junto con cabeceras de extraccion propias entrenadas con tasa de aprendizaje mayor (1e-3 frente a 1e-4 del LoRA). El diseno del prompt situa la lista de campos antes del documento, de modo que cada token del documento se procesa conociendo los campos solicitados, y anade una linea de consulta por campo despues del documento.

Las cabeceras operan sobre los ultimos estados ocultos e incluyen: un modo por campo (null, span, sum, count, pick, difference, list) que produce `p_null`; punteros de inicio/fin sobre el documento para texto; un cabezal de signo sobre los numeros detectados por un parser, lo que permite sumas y restas exactas; un cabezal de seleccion sobre fechas y horas parseadas (incluyendo ambas lecturas de fechas ambiguas y fechas relativas respecto a `reference_date`); diferencias entre dos fechas para duraciones; y etiquetas begin/inside para listas. Los valores se construyen mediante codigo determinista a partir de lo que apuntan las cabeceras, garantizando respuestas bien formadas. La funcion de perdida es el logaritmo negativo de la probabilidad total de todas las derivaciones que producen el valor gold.

El entrenamiento consto de 299 pasos de unos 65.000 tokens cada uno (una pasada sobre 39.104 documentos, 19,5M de tokens) y tomo 3 horas y 22 minutos en una sola RTX PRO 6000 como trabajo de la plataforma Turion AI. Los datos de entrenamiento usan solo splits de entrenamiento de SQuAD 2.0, DROP, TAT-QA, CUAD, CORD v2 y Few-NERD, mas 15.000 documentos de negocio sinteticos generados internamente (32 tipos, 27 localizaciones, etiquetas exactas). No se menciona RLHF ni DPO.

## Capacidades

- Extraccion tipada de un solo valor por campo a partir de documentos de texto, en una unica pasada hacia adelante
- Tipos de campo soportados: texto (span), numero (con decimales), sumas y diferencias de hasta 3 numeros del texto, conteos, fechas y horas (incluyendo fechas relativas y ambiguedades de formato), duraciones entre dos fechas, y listas de valores
- Deteccion de ausencia de valor con probabilidad `p_null` (precision 91,4%, recall 94,1%)
- Respuestas siempre bien formadas: los valores se construyen por codigo a partir de punteros, no por generacion libre
- Devolucion de spans (posiciones de inicio y fin) para cada valor extraido, lo que permite trazabilidad
- No genera texto libre, no soporta tool calling ni razonamiento multi-paso: es un modelo especializado en extraccion
- Entrada solo de texto; sin soporte de imagenes en esta version

## Casos de uso

- Procesamiento automatizado de facturas: extraccion de numero de factura, total con decimales, numeros de orden de compra y contactos, con calculo exacto de sumas de importes (por ejemplo, subtotal mas envio) gracias al cabezal de signo sobre numeros parseados
- Analisis de contratos legales: el entrenamiento con CUAD permite extraer clausulas y valores tipados de contratos, con spans que permiten verificar la fuente de cada dato extraido
- Digitalizacion de recibos: entrenado con CORD v2, puede extraer campos estructurados de recibos y tickets con alta precision (88,63 en el indice)
- Reconocimiento de entidades en documentos: el entrenamiento con Few-NERD dota al modelo de capacidad de extraccion de entidades tipadas (77,98 en el indice)
- Extraccion de datos de documentos de negocio sinteticos y reales: formularios, notas internas y documentos empresariales de 27 localizaciones distintas
- Respuesta a preguntas extractivas con posibilidad de respuesta nula: gracias al entrenamiento con SQuAD 2.0, gestiona correctamente preguntas sin respuesta en el documento
- Razonamiento numerico sobre tablas y texto financiero: el entrenamiento con TAT-QA y DROP permite sumas, restas y conteos exactos sobre datos financieros, evitando errores aritmeticos de los LLM generativos
- Pipelines de ETL documental: la salida tipada y determinista (JSON con valores, tipos, spans y probabilidades) es directamente consumible por sistemas downstream sin postprocesado de texto libre

## Benchmarks y rendimiento

Resultados en el SystemOne Extract Index 0.1 (1.997 peticiones, todas `ok`, 0 errores), sobre una RTX PRO 6000 Blackwell Workstation Edition en BF16:

| Metrica | Valor |
|---|---:|
| SystemOne Extract Index 0.1 (global) | 75,30 |
| SQuAD 2.0 | 93,32 |
| CUAD | 66,34 |
| CORD | 88,63 |
| docs (sinteticos de negocio) | 82,90 |
| DROP | 63,67 |
| TAT-QA | 54,25 |
| Few-NERD | 77,98 |
| Precision de null | 91,4% |
| Recall de null | 94,1% |

Advertencia importante del propio autor: el modelo fue entrenado con los splits de entrenamiento de seis de las siete fuentes del indice, y 110 de las 1.997 peticiones del suite aparecian (total o parcialmente) en los datos de entrenamiento. Puntuado sin esas 110 peticiones, el indice se mantiene en 75,30 y CORD queda en 88,2. La unica fuente sin datos de entrenamiento es `docs` (82,90), lo que la convierte en la metrica mas representativa de generalizacion. No hay comparacion directa publicada con otros modelos en el material disponible.

Latencia por peticion (una peticion cada vez): mediana 67 ms, media 80 ms, p80 82 ms.

## Requisitos de hardware

- El repositorio solo contiene el adaptador (0,7 GB); el modelo base google/gemma-4-12B-it se descarga en el primer uso y requiere su propia memoria
- VRAM estimada: el autor reporta ejecucion en BF16 sobre una NVIDIA RTX PRO 6000 Blackwell Workstation Edition (96 GB); para un modelo base de 12B en BF16 se requieren del orden de 24 GB o mas de VRAM, aunque no hay cifras oficiales para otras configuraciones
- GPU recomendada (segun la evaluacion publicada): NVIDIA RTX PRO 6000 Blackwell Workstation Edition; no disponible informacion sobre compatibilidad con GPUs de consumo como la RTX 4090
- Despliegue: el autor proporciona el paquete `turion_extract.predict` con la clase `Extractor` (instalable con `pip install "./code"` desde el repositorio); no se menciona soporte de vLLM, llama.cpp, Ollama ni TGI
- Uso tipico: `Extractor.from_dir()` sobre una copia local del repositorio descargada con `hf download turion-ai/turion-extract-alpha --local-dir turion-extract-alpha`
- Latencia publicada: mediana de 67 ms por peticion en el hardware de evaluacion

## Comparativa con modelos similares

| | Turion Extract alpha | LLM generativo tipico (12B) | Modelo extractivo clasico (BERT-like) |
|---|---|---|---|
| Parametros | Adaptador 0,7 GB sobre base 12B | ~12B | ~0,1-0,3B |
| Salida | Valor tipado o null por campo, span incluido | Texto libre, requiere parsing y validacion | Spans o etiquetas, esquemas rigidos |
| Aritmetica exacta | Si (sumas, restas, conteos via parser) | No garantizada | No |
| Latencia | Mediana 67 ms | Tipicamente segundos | Milisegundos |
| Contexto | 16.384 tokens | Variable | Tipicamente 512 tokens |
| Licencia | Apache-2.0 | Variable | Variable |

No se han publicado comparaciones numericas directas contra modelos concretos en la informacion disponible.

## Limitaciones y advertencias

- Computo limitado: solo sumas y diferencias de hasta 3 numeros del texto, conteos y duraciones entre dos fechas; no soporta ratios, productos, porcentajes, medias ni fechas calculadas por offsets (por ejemplo, "emision mas neto 30"). La mayoria de fallos en TAT-QA y DROP se deben a esto
- Tipos debiles: fechas-horas y duraciones en formatos no vistos durante el entrenamiento, como los del test `docs` del indice
- Entrada solo de texto: sin soporte de imagenes ni documentos escaneados en esta version
- Limite de 24 campos por pasada; con mas campos hay que dividir en varias pasadas
- `p_null` y `confidence` no estan calibrados fuera de la mezcla de entrenamiento
- Contaminacion de datos: 110 de las 1.997 peticiones del benchmark aparecian en el entrenamiento (82 pasajes de Few-NERD comparten frase, 21 recibos de CORD son identicos, 7 pasajes de DROP son identicos); la proxima version excluira esos documentos
- Sesgos: no documentados explicitamente; hereda los del modelo base google/gemma-4-12B-it y de los datasets de entrenamiento (SQuAD, CUAD, CORD, DROP, TAT-QA, Few-NERD), mayoritariamente en ingles
- Idiomas: no disponible informacion oficial; los datasets de entrenamiento son predominantemente en ingles
- Riesgo de alucinacion bajo por diseno (los valores provienen de spans del documento), pero el modelo no ha sido evaluado fuera del dominio de extraccion
- Licencia Apache-2.0 permite uso comercial; los datasets de entrenamiento conservan sus propias licencias (CC BY-SA 4.0 y CC BY 4.0), lo que puede ser relevante si se reentrena con ellos
- Es una version alpha temprana; la API y los resultados pueden cambiar en versiones posteriores

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/turion-ai/turion-extract-alpha
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Dataset de resultados del indice: https://huggingface.co/datasets/turion-ai/turion-extract-alpha-index-results
- SystemOne Extract Index (espacio de referencia): https://huggingface.co/spaces/balys/extract-index
- Plataforma de entrenamiento Turion AI: https://turion.ai/training/
- Web de Turion AI: https://turion.ai
- Datasets de entrenamiento: SQuAD 2.0 (https://huggingface.co/datasets/rajpurkar/squad_v2), DROP (https://huggingface.co/datasets/ucinlp/drop), TAT-QA (https://huggingface.co/datasets/next-tat/TAT-QA), CUAD (https://huggingface.co/datasets/theatticusproject/cuad-qa), CORD v2 (https://huggingface.co/datasets/naver-clova-ix/cord-v2), Few-NERD (https://huggingface.co/datasets/DFKI-SLT/few-nerd)
