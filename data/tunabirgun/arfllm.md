# tunabirgun/ArfLLM

## Resumen

ArfLLM es un modelo de embeddings de frases en ingles publicado por el desarrollador tunabirgun como exportacion del modelo `sentence-transformers/all-MiniLM-L6-v2` para su uso dentro de Arf, una aplicacion de notas local-first orientada a cientificos. El modelo transforma una nota (titulo y cuerpo) en un vector de 384 dimensiones que la aplicacion compara en el propio dispositivo del usuario para sugerir notas relacionadas ("Resonance") y pares de notas sin enlazar ("Synthesis"). No se envia informacion a ningun servidor: la inferencia se ejecuta localmente.

Es importante subrayar que los pesos son los de all-MiniLM-L6-v2 sin modificar. El autor probo varios candidatos en ingles afinados sobre texto cientifico con licencia compatible (arXiv y abstracts de OpenAlex con licencia abierta), pero ninguno supero la regla de aceptacion fijada antes del entrenamiento (una mejora significativa en un benchmark independiente de recuperacion cientifica, SCIDOCS o NFCorpus), por lo que no se publica ninguno. Por tanto, la calidad es exactamente la del modelo base y no se reclama ninguna mejora sobre el.

La relevancia de esta ficha es acotada: no es un LLM generativo pese al sufijo "LLM" del nombre, sino un encoder BERT de 22,7 millones de parametros para similitud semantica. Su interes practico esta en el empaquetado: incluye un ONNX con cuantizacion int8 dinamica por canal, compatible con Transformers.js, y una truncacion a 256 tokens alineada con la configuracion del modelo base. El repositorio ocupa 0,2 GB y la licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: all-MiniLM-L6-v2, 6 capas) |
| Parametros totales | 22.713.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (truncacion del export; el base admite hasta 512 en su configuracion original) |
| Tipos de cuantizacion | int8 dinamica por canal (ONNX cuantizado); fp32 en safetensors |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (incluye `onnx/model_quantized.onnx`) |
| Dimension del embedding | 384 |
| Pooling | mean pooling con normalizacion |
| Libreria | sentence-transformers, Transformers.js |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

La arquitectura es la de all-MiniLM-L6-v2: un encoder transformer de tipo BERT con 6 capas y 384 dimensiones ocultas, disenado para producir embeddings de frases mediante mean pooling y normalizacion L2. No hay innovaciones arquitectonicas propias: el repositorio es un export del modelo base, no un modelo reentrenado.

En cuanto al entrenamiento, el autor declara haber afinado varios candidatos en ingles sobre texto cientifico con licencia compatible (arXiv y abstracts de OpenAlex con licencia abierta). Ninguno supero la regla de aceptacion fijada de antemano, que exigia una mejora significativa en un benchmark independiente de recuperacion cientifica (SCIDOCS o NFCorpus), de modo que no se libera ningun checkpoint afinado. El unico trabajo tecnico verificable del export es la cuantizacion int8 dinamica por canal: sobre 300 textos reservados, la similitud coseno media respecto al modelo fp32 es 0,9943 (minimo 0,9894), frente a 0,9920 (minimo 0,9858) del fichero int8 usado previamente en Arf; el nDCG@10 en la tarea de desarrollo es 0,867 frente a 0,866. La truncacion se fija en 256 tokens, el maximo configurado en `sentence_bert_config.json` del modelo base, donde el export anterior permitia 512. El autor verifico la ruta de codigo de Arf: identificadores de token identicos en 300/300 textos y coseno medio de 1,0000.

## Capacidades

- Generacion de embeddings de frases y notas en ingles, con salida de 384 dimensiones normalizada.
- Similitud semantica entre textos (pipeline `sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) para tareas de recuperacion y clustering.
- Calculo de similitud coseno para umbrales calibrados: en Arf, Resonance 0,269 y Synthesis 0,435, mapeados desde los ajustes originales (0,28 y 0,45) para mantener la proporcion de pares de notas de arXiv no relacionados por encima de cada umbral.
- Ejecucion en navegador y en dispositivos locales mediante Transformers.js con `dtype: 'q8'`.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni modo de pensamiento: es exclusivamente un encoder de embeddings.
- Capacidad multilingue limitada al ingles; no se declaran otros idiomas.

## Casos de uso

- Sugerencia de notas relacionadas en una aplicacion local-first: el modelo vectoriza titulo y cuerpo de cada nota y permite comparar embeddings en el dispositivo del usuario para proponer conexiones ("Resonance") sin enviar datos a ningun servidor, gracias a sus 384 dimensiones y al ONNX int8 de bajo coste.
- Deteccion de pares de notas sin enlazar ("Synthesis"): con el umbral calibrado de 0,435 se pueden senalar notas que tratan temas afines pero que el usuario no ha vinculado manualmente, util en bases de conocimiento cientifico personales.
- Busqueda semantica sobre corpus cientifico en ingles: indexar abstracts de arXiv u OpenAlex y recuperar por similitud coseno; el modelo base esta evaluado habitualmente en tareas de recuperacion de frases y el export mantiene esa calidad.
- Clustering y deduplicacion de notas o abstracts: agrupar documentos tematicamente por similitud de embeddings para organizar bibliotecas personales o revisiones de literatura.
- Ejecucion en navegador o en el cliente sin backend: al ser compatible con Transformers.js y ONNX int8, permite integrar busqueda semantica en aplicaciones web o de escritorio sin infraestructura de servidor GPU.
- Filtrado y ranking de candidatos en pipelines de recuperacion: usar el modelo como primera etapa de re-ranking barata (22,7 M de parametros) antes de un modelo mayor o de una busqueda lexica combinada.
- Prototipado rapido de sistemas de recomendacion de contenido textual en ingles: la API de sentence-transformers permite obtener vectores normalizados con una sola llamada a `encode`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta metricas internas de fidelidad del export cuantizado frente al fp32:

| Metrica | Valor |
|---|---|
| Coseno medio int8 vs fp32 (300 textos) | 0,9943 |
| Coseno minimo int8 vs fp32 (300 textos) | 0,9894 |
| Coseno medio int8 previo vs fp32 | 0,9920 |
| Coseno minimo int8 previo vs fp32 | 0,9858 |
| nDCG@10 en tarea de desarrollo (int8 nuevo) | 0,867 |
| nDCG@10 en tarea de desarrollo (int8 previo) | 0,866 |
| Identidad de token ids en ruta de Arf | 300/300 textos |
| Coseno medio en ruta de Arf | 1,0000 |

No se aportan resultados en MMLU, HumanEval, GSM8K ni en SCIDOCS o NFCorpus para el modelo publicado.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en fp32 (22,7 M de parametros, aproximadamente 91 MB de pesos) y en torno a 23 MB para el fichero ONNX int8; el consumo real depende del runtime y del lote.
- GPU recomendadas: no requiere GPU. Cabe holgadamente en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) e incluso en CPU y en navegador.
- Cabe en GPU consumer: si, en todas las gamas; tambien en moviles y entornos de navegador mediante Transformers.js.
- Opciones de despliegue: sentence-transformers (PyTorch), Transformers.js (`@huggingface/transformers` con `dtype: 'q8'`), ONNX Runtime, y Text Embeddings Inference (el repositorio esta marcado como `text-embeddings-inference` y `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo (6 capas, 384 dimensiones, entradas de hasta 256 tokens) se espera una latencia muy baja en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| tunabirgun/ArfLLM | 22,7 M | 256 tokens (export) | en | Apache 2.0 | Export de all-MiniLM-L6-v2 con ONNX int8; pesos sin modificar |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | hasta 512 tokens en su configuracion | en | Apache 2.0 | Modelo base; misma calidad declarada |
| sentence-transformers/paraphrase-MiniLM-L6-v2 | no disponible en la informacion | no disponible | en | Apache 2.0 | Alternativa de la familia MiniLM para similitud de frases |
| sentence-transformers/all-mpnet-base-v2 | no disponible en la informacion | no disponible | en | Apache 2.0 | Encoder mayor, mayor coste computacional |

La comparativa se limita a la familia MiniLM y a alternativas de sentence-transformers; no se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles: no soporta otros idiomas, lo que invalida su uso en corpus multilingues o en castellano.
- Truncacion a 256 tokens: las notas o documentos mas largos pierden contenido; el modelo base permitia hasta 512 en su configuracion original.
- Los umbrales de Resonance (0,269) y Synthesis (0,435) se calibraron sobre notas de arXiv en ingles, no sobre notas reales de usuarios; pueden requerir reajuste en produccion.
- Riesgo de similitudes espurias en textos muy cortos o con vocabulario cientifico especializado; al ser un encoder de similitud, no hay mecanismo de verificacion factual y las sugerencias pueden ser irrelevantes.
- No es un modelo generativo: no puede redactar, resumir ni razonar; el nombre "ArfLLM" puede inducir a error.
- La calidad es la de all-MiniLM-L6-v2; no se ha demostrado mejora en recuperacion cientifica y los intentos de afinado no superaron la regla de aceptacion.
- Sin descargas ni likes en el momento de la consulta y creado en 2026-11-26: ecosistema y validacion externa practicamente inexistentes.
- Licencia Apache 2.0, que permite uso comercial, pero al contener pesos de all-MiniLM-L6-v2 conviene conservar los avisos de atribucion correspondientes.
- La cuantizacion int8 introduce una desviacion pequena pero no nula (coseno minimo 0,9894 frente a fp32); para aplicaciones sensibles a la precision puede preferirse el fichero fp32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tunabirgun/ArfLLM
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Repositorio de la aplicacion Arf: https://github.com/tunabirgun/arf
