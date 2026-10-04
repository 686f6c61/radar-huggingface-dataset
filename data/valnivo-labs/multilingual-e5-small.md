# Valnivo-labs/multilingual-e5-small

## Resumen

Valnivo-labs/multilingual-e5-small es una redistribución sin modificaciones del export ONNX de 8 bits de intfloat/multilingual-e5-small (MIT), tal y como lo publicó Xenova/multilingual-e5-small en la revisión `761b726dd34fb83930e26aab4e9ac3899aa1fa78`. No se trata de un modelo nuevo ni de un ajuste fino: el repositorio agrupa los pesos cuantizados a 8 bits junto con la compilación de ONNX Runtime WebAssembly que consume `@huggingface/transformers` 3.8.1. El propósito declarado es servir de dependencia reproducible para el copiloto de Valnivo, que lo ejecuta íntegramente en el navegador para emparejar una pregunta con una respuesta previamente escrita por el equipo.

El modelo subyacente es un encoder bidireccional multilingüe de la familia E5, orientado a extracción de características (pipeline `feature-extraction`), es decir, a producir embeddings de frases y pasajes, no a generar texto. Su función es la búsqueda semántica y la similitud entre textos en ocho idiomas declarados (en, fr, de, es, it, pt, nl, pl), y su interés práctico reside en que cabe en el cliente: al ser una copia int8 de un modelo pequeño, puede ejecutarse por CPU en un navegador sin enviar datos a un servidor.

La relevancia de este repositorio concreto es de trazabilidad más que de rendimiento: cada fichero se valida por SHA-256 antes de usarse (según el script `tools/copilot/stage-model.mjs` citado en la model card), la revisión de origen está fijada de forma explícita y la licencia MIT se mantiene tanto para el modelo como para el runtime. Como contrapartida, el repositorio no ha recibido ninguna descarga ni valoración positiva, no aporta resultados de evaluación propios y no debe confundirse con el artefacto canónico de Microsoft o de Xenova.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional tipo BERT, heredado de `microsoft/Multilingual-MiniLM-L12-H384` (12 capas, 384 de dimensión oculta, según la documentación pública del modelo base; no se detalla en esta model card) |
| Parametros totales | Aproximadamente 118 M (dato del modelo base; no declarado en esta model card) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (límite del modelo base; no declarado en esta model card) |
| Tipos de cuantizacion | ONNX int8 (8 bits). No se incluyen FP16, int4, GGUF ni otros formatos |
| Idiomas soportados | en, fr, de, es, it, pt, nl, pl (lista declarada en la model card) |
| Licencia | MIT (modelo, © Microsoft Corporation / intfloat); ONNX Runtime también MIT (© Microsoft Corporation) |
| Formato de pesos | ONNX cuantizado a 8 bits, para transformers.js / ONNX Runtime Web. No incluye safetensors ni GGUF |
| Dimensión del embedding | 384 (dato del modelo base; no declarado en esta model card) |
| Tamaño del repositorio | 0,2 GB (incluye la compilación WASM de ONNX Runtime, no solo los pesos) |
| Librería declarada | transformers.js (3.8.1 en el caso de uso descrito) |
| Pipeline | feature-extraction |
| Repositorio de origen | Xenova/multilingual-e5-small, revisión `761b726dd34fb83930e26aab4e9ac3899aa1fa78` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer bidireccional, no autorregresivo. La familia E5 se entrena con preentrenamiento contrastivo débilmente supervisado sobre pares de texto relacionados (el corpus CCPairs descrito en el informe técnico de Microsoft), seguido de ajuste sobre conjuntos de datos etiquetados; el objetivo es que la similitud coseno entre embeddings refleje similitud semántica. Para obtener el comportamiento previsto hay que anteponer los prefijos `query: ` a las consultas y `passage: ` a los documentos indexados; sin ellos, la calidad del retrieval se degrada de forma notable.

En esta redistribución no hay entrenamiento ni modificación alguna: los pesos son idénticos a los del export de Xenova y a los del modelo original de intfloat/Microsoft. La única aportación del repositorio es el empaquetado (pesos ONNX int8 más la build WASM de ONNX Runtime) y la política de verificación por SHA-256 antes de cargar cada fichero. No se documentan en la model card ni el número exacto de tokens de entrenamiento, ni la composición del dataset, ni si hubo una fase de RLHF o DPO (en un modelo de embeddings, estos procedimientos no aplican del mismo modo que en un modelo generativo). El dato de contexto útil es que la cuantización a 8 bits reduce el peso del modelo a alrededor de 120 MB, lo que hace viable su carga en un navegador.

## Capacidades

- Extracción de embeddings de frases y pasajes: convierte texto en vectores de 384 dimensiones utilizables para similitud coseno.
- Recuperación semántica (retrieval) y búsqueda por significado, no por coincidencia léxica, en los ocho idiomas declarados.
- Alineación cross-lingual: permite comparar una consulta en un idioma con pasajes en otro dentro del conjunto de idiomas soportado.
- Clustering y deduplicación de textos mediante agrupamiento de vectores.
- Clasificación por similitud (zero-shot ligero): asignar una etiqueta eligiendo el vector de descripción más próximo.
- Ejecución en el navegador vía WebAssembly con transformers.js, sin backend ni GPU.
- Verificación de integridad: cada fichero se comprueba por SHA-256 antes de su uso, según la model card.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo discriminativo de una sola pasada.
- No dispone de modo thinking, visión, audio ni salida estructurada más allá del tensor de embeddings.

## Casos de uso

- Búsqueda semántica de preguntas frecuentes en el cliente: el copiloto indexa respuestas escritas por el equipo y, ante una consulta del usuario, calcula el embedding y recupera la más próxima. Es exactamente el escenario para el que se publicó este repositorio, y evita enviar el texto del usuario a un servidor.
- Extensiones de navegador con privacidad estricta: al ejecutarse en WASM sobre la CPU local, ningún contenido de la página sale del dispositivo, lo que simplifica el cumplimiento del RGPD en herramientas de clasificación o etiquetado.
- Deduplicación cross-lingual de catálogos: agrupar fichas de producto que describen el mismo artículo en español, alemán y francés comparando vectores, sin necesidad de traducción previa.
- Enrutado de tickets de soporte: clasificar cada ticket contra un conjunto de descripciones de categoría y dirigirlo al equipo correspondiente; la latencia de un encoder pequeño en int8 permite hacerlo en línea.
- Recuperación aumentada ligera (RAG) en el cliente: trocear documentación de hasta 512 tokens por fragmento, indexar los embeddings en memoria y recuperar los pasajes relevantes para pasárselos después a un modelo generativo alojado aparte.
- Caché semántica de consultas: detectar que dos preguntas formuladas de forma distinta buscan lo mismo y reutilizar la respuesta ya calculada, reduciendo llamadas a modelos mayores.
- Recomendación de contenido relacionado: ordenar artículos, vídeos o entradas de blog por similitud con el elemento que el usuario está leyendo.
- Moderación y filtrado previo: comparar un texto entrante con una lista de patrones o descripciones problemáticas para decidir si requiere revisión humana, como paso barato anterior a un modelo de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye cifras de MTEB, MIRACL ni de ninguna otra evaluación, y los resultados devueltos por la búsqueda web no guardan relación con el modelo, por lo que no se han utilizado. Para valores de referencia del modelo base habría que consultar la documentación de intfloat/multilingual-e5-small y el leaderboard de MTEB.

## Requisitos de hardware

- Al ser una exportación int8 de un modelo de aproximadamente 118 M de parámetros, el peso de los pesos ronda los 120 MB; el repositorio ocupa 0,2 GB porque incluye además la build WASM de ONNX Runtime.
- Inferencia prevista en CPU mediante WebAssembly: no requiere GPU ni acelerador dedicado. Cabe en cualquier portátil, equipo de escritorio o móvil moderno con un navegador actualizado.
- VRAM estimada para GPU: no aplica en el escenario de destino; si se sirviera con ONNX Runtime en servidor, la huella sería inferior a 1 GB en memoria, pero no se documenta en esta model card.
- GPU recomendadas: no disponible. El repositorio no especifica perfiles de GPU ni proveedores de ejecución distintos de WASM.
- Opciones de despliegue: transformers.js en navegador (el caso documentado), ONNX Runtime en servidor, o bien partir del modelo original de intfloat para convertirlo a safetensors, GGUF u otros formatos si se necesita vLLM, llama.cpp, Ollama o TGI. Estos backends no están soportados por los ficheros incluidos aquí tal cual.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de milisegundos por embedding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Valnivo-labs/multilingual-e5-small (este repo) | ~118 M (modelo base) | 512 tokens (modelo base) | 8 declarados | MIT | ONNX int8 + runtime WASM | Copia sin cambios; 0 descargas y 0 likes; verificación SHA-256; orientado a navegador |
| intfloat/multilingual-e5-small | ~118 M | 512 tokens | Cobertura multilingüe amplia según la documentación del autor | MIT | safetensors / PyTorch | Artefacto canónico de Microsoft e intfloat; es el origen de toda la cadena |
| Xenova/multilingual-e5-small | ~118 M | 512 tokens | 8 declarados | MIT | ONNX int8 y otras variantes | Exportación upstream sobre la que se construye este repositorio; revisión fijada `761b726d` |
| intfloat/multilingual-e5-base | ~278 M | 512 tokens | Cobertura multilingüe amplia según la documentación del autor | MIT | safetensors / PyTorch | Alternativa de mayor calidad a costa de más del doble de parámetros y de no caber tan cómodamente en el navegador |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | 128 tokens según documentación pública | Multilingüe | Apache-2.0 | safetensors / PyTorch | Modelo popular para similitud multilingüe; ventana más corta, lo que penaliza pasajes largos |

No hay datos de benchmarks en la información disponible, por lo que la comparación se limita a especificaciones, licencia y formato. No se dispone de cifras verificadas que permitan afirmar qué modelo obtiene mejor recuperación en un idioma concreto.

## Limitaciones y advertencias

- No es un modelo generativo ni instruct: no responde preguntas, no redacta texto y no sigue instrucciones. Solo devuelve embeddings.
- El repositorio tiene 0 descargas y 0 likes y no está avalado por el autor original. Para uso en producción conviene referenciar directamente intfloat/multilingual-e5-small o Xenova/multilingual-e5-small y fijar la revisión correspondiente.
- La lista de idiomas declarada se limita a en, fr, de, es, it, pt, nl, pl. El rendimiento fuera de ese conjunto no está garantizado por la model card, aunque el modelo base tenga cobertura más amplia.
- Ventana de 512 tokens: los documentos largos deben trocearse y agregarse después, lo que introduce decisiones de chunking que afectan a la calidad del retrieval.
- Requiere los prefijos `query: ` y `passage: ` para funcionar según lo previsto. Omitirlos es un error frecuente que degrada los resultados sin generar ningún aviso.
- Riesgo de sesgos heredados de los corpus de preentrenamiento del modelo base (datos web multilingües). Este repositorio no incluye ninguna auditoría de sesgo ni ninguna evaluación propia.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos en similitud: dos textos pueden obtener una puntuación alta sin ser equivalentes, especialmente en dominios técnicos muy específicos.
- Licencia MIT: permite uso comercial y modificación, pero obliga a conservar los avisos de copyright de Microsoft Corporation e intfloat, y también los de ONNX Runtime.
- El paquete incluye el runtime WASM, por lo que su huella en disco (0,2 GB) es mayor que la del modelo en sí. Si solo se necesitan los pesos, hay que extraerlos.
- No se documentan versiones para CUDA, ROCm ni otros proveedores de ejecución; el soporte de WebGPU no se menciona en la model card.
- La búsqueda web asociada a esta ficha devolvió resultados irrelevantes (foros y páginas de soporte sin relación con el modelo), por lo que no se ha extraído de ellos ningún dato técnico.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Valnivo-labs/multilingual-e5-small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Exportación ONNX upstream: https://huggingface.co/Xenova/multilingual-e5-small
- Revisión fijada del export upstream: https://huggingface.co/Xenova/multilingual-e5-small/tree/761b726dd34fb83930e26aab4e9ac3899aa1fa78
- Informe técnico de los embeddings E5 multilingües: https://arxiv.org/abs/2402.05672
- Artículo original de E5 (preentrenamiento contrastivo débilmente supervisado): https://arxiv.org/abs/2212.03533
- Código de la familia E5 en Microsoft unilm: https://github.com/microsoft/unilm/tree/master/e5
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- transformers.js: https://github.com/huggingface/transformers.js
- Leaderboard de MTEB: https://huggingface.co/spaces/mteb/leaderboard
- No se han encontrado en la búsqueda web enlaces adicionales relevantes sobre este modelo.
