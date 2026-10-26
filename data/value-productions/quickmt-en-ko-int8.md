# value-productions/quickmt-en-ko-int8

## Resumen

`value-productions/quickmt-en-ko-int8` es una versión cuantizada a int8 del modelo de traducción automática `quickmt/quickmt-en-ko`, reexportada en formato CTranslate2 por value-productions para su uso en la aplicación Yaku Translate. Se trata de un modelo de traducción neuronal especializado en el par inglés → coreano, no de un LLM de propósito general, y ocupa apenas 0,2 GB en el repositorio.

Su relevancia reside en la eficiencia: la cuantización int8 por filas reduce la huella de memoria y acelera la inferencia en CPU manteniendo, según el autor, una salida idéntica carácter a carácter a la del original en float16 en las frases verificadas. Publicado bajo licencia CC BY 4.0 (que permite uso comercial con atribución), es una opción ligera para integrar traducción EN → KO en aplicaciones y pipelines sin necesidad de GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de traducción neuronal en formato CTranslate2 (detalles de la arquitectura base no disponibles) |
| Parámetros totales | no disponible (el repo ocupa 0,2 GB con pesos int8, lo que apunta a un orden de magnitud de ~200 M, sin confirmación oficial) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8 por filas sobre cada peso 2-D (mismo esquema que la cuantización ModelSpec de CTranslate2) |
| Idiomas soportados | inglés (origen) y coreano (destino), dirección única EN → KO |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 binario (`model.bin`), con vocabularios JSON (`source_vocabulary.json`, `target_vocabulary.json`) y tokenizadores SentencePiece (`src.spm.model`, `tgt.spm.model`) |

## Arquitectura y entrenamiento

El modelo es una reexportación del modelo base `quickmt/quickmt-en-ko` (también bajo CC BY 4.0 y desarrollado por quickmt), convertida el 26/10/2026 a formato CTranslate2 con cuantización int8 por filas aplicada a todos los pesos 2-D, el mismo esquema que emplea la especificación ModelSpec de CTranslate2. Según la ficha, la salida sobre las frases comprobadas es idéntica carácter a carácter a la del modelo original en float16, lo que indica una degradación de calidad prácticamente nula por la cuantización.

La presencia de ficheros SentencePiece independientes para origen y destino (`src.spm.model`, `tgt.spm.model`) confirma que el modelo emplea subword tokenización SentencePiece en ambos idiomas. Los detalles del entrenamiento del modelo base (número de tokens, composición del corpus, uso de técnicas como backtranslation o paralelo masivo) no están documentados en la información disponible, por lo que se marcan como no disponibles. Al tratarse de un modelo de traducción clásico, no aplica RLHF ni DPO.

## Capacidades

- Traducción automática unidireccional de inglés a coreano.
- Inferencia optimizada con CTranslate2, tanto en CPU como en GPU, con pesos int8 de baja huella (0,2 GB).
- Tokenización SentencePiece específica para cada idioma, con vocabularios exportados en JSON.
- Paridad de salida verificada frente al modelo float16 original en las frases de comprobación del autor.
- No es un LLM conversacional: no soporta tool calling ni function calling, no está pensado para agentes ni razonamiento multi-paso, y no tiene capacidades multimodales (sin visión ni audio).
- No genera texto libre ni código: su única tarea es la traducción del par EN → KO.

## Casos de uso

- Traducción integrada en la app Yaku Translate: el modelo se distribuye precisamente como motor de esta aplicación, lo que lo hace adecuado para traducción interactiva en cliente con recursos modestos.
- Traducción por lotes de documentación técnica: gracias a CTranslate2 y a la cuantización int8, puede procesar grandes volúmenes de texto inglés a coreano en CPU sin infraestructura GPU, útil para localizar wikis, manuales o bases de conocimiento.
- Pretraducción para postedición humana (flujo MTPE): puede generar un primer borrador coreano a partir de contenido inglés que los traductores profesionales revisan después, reduciendo el coste por palabra en flujos de localización.
- Subtitulado y localización de vídeo: su tamaño reducido permite encadenarlo en pipelines automatizados que traducen guiones o ficheros de subtítulos del inglés al coreano antes de la revisión lingüística.
- Backend de servicios web con restricciones de recursos: con 0,2 GB de modelo, cabe en contenedores pequeños o instancias baratas, sirviendo traducción EN → KO vía API sin GPU dedicada.
- Despliegue en equipos de escritorio o portátiles sin GPU: al ejecutarse con CTranslate2 en CPU con int8, es viable en hardware de consumo para aplicaciones offline de traducción.
- Prototipado rápido de funciones de traducción en productos: la licencia CC BY 4.0 permite integrarlo en software comercial con atribución, sin coste de licencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Como dato cualitativo, el autor verifica que la salida del modelo int8 es idéntica carácter a carácter a la del original float16 en las frases comprobadas, pero no se aportan métricas de calidad de traducción (BLEU, COMET, chrF) ni comparativas con otros sistemas.

## Requisitos de hardware

- Memoria estimada para inferencia: el modelo completo ocupa 0,2 GB en int8; en la práctica basta con menos de 1 GB de RAM libre, sin necesidad de VRAM.
- GPU: no es necesaria; CTranslate2 ejecuta el modelo eficientemente en CPU con cuantización int8. Si se dispone de GPU NVIDIA compatible con CUDA, puede acelerarse la inferencia de forma opcional.
- Hardware de consumo: cualquier portátil o sobremesa moderno lo ejecuta con holgura; no se requiere GPU dedicada tipo RTX 4090 ni aceleradores de centro de datos.
- Despliegue: CTranslate2 (librería Python/C++). No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que no emplea formatos GGUF ni safetensors de LLM, sino el formato binario propio de CTranslate2 con SentencePiece.
- Latencia y throughput: no se publican cifras; al ser un modelo MT pequeño cuantizado a int8 en CTranslate2, está diseñado para latencias bajas en CPU, pero no hay mediciones disponibles.

## Comparativa con modelos similares

| Modelo | Dirección | Parámetros | Formato / despliegue | Licencia |
|---|---|---|---|---|
| value-productions/quickmt-en-ko-int8 | EN → KO | no disponible (~200 M estimados por tamaño de repo) | CTranslate2 int8, CPU/GPU | CC BY 4.0 |
| Helsinki-NLP/opus-mt-en-ko | EN → KO | ≈74 M (arquitectura Marian) | PyTorch / transformers, convertible a CTranslate2 | CC BY 4.0 (proyecto OPUS-MT) |
| facebook/m2m-100_418M | Multidireccional (100 idiomas, incluye EN y KO) | 418 M | PyTorch / transformers | MIT |
| facebook/nllb-200-distilled-600M | Multidireccional (200 idiomas, incluye EN y KO) | 600 M | PyTorch / transformers | CC BY-NC 4.0 (sin uso comercial) |

Notas: los parámetros de los modelos alternativos son valores aproximados publicados en sus fichas oficiales. Ninguno de los modelos comparados aporta en esta información métricas de benchmark directas para el par EN → KO, por lo que la comparativa se limita a tamaño, formato y licencia. La ventaja diferencial del modelo de esta ficha es su despliegue directo en CTranslate2 con int8 y una licencia comercialmente permisiva; NLLB cubre más idiomas pero su licencia prohíbe el uso comercial.

## Limitaciones y advertencias

- Dirección única: solo traduce de inglés a coreano; para KO → EN habría que recurrir al modelo inverso de la familia quickmt, si existe.
- Sin benchmarks publicados: la calidad de traducción no está verificada de forma independiente en la información disponible; conviene evaluarla con datos propios antes de producción.
- Cuantización int8: la paridad con float16 solo está comprobada sobre las frases verificadas por el autor; en entradas no comprobadas podría haber pequeñas desviaciones, aunque el esquema por filas de CTranslate2 minimiza este riesgo.
- Alcance limitado: al no ser un LLM, no sigue instrucciones, no mantiene conversaciones y no puede combinarse con herramientas o agentes; cualquier orquestación debe hacerse externamente.
- Sesgos: al no estar documentado el corpus de entrenamiento del modelo base, no es posible caracterizar sesgos de dominio, registro o género; los sistemas de traducción neuronal suelen mostrar sesgos heredados del corpus paralelo.
- Riesgo de alucinación: en traducción se manifiesta como omisiones, adiciones o traducciones infieles, especialmente en textos largos, fuera de dominio o con ruido (código, fórmulas, nombres propios).
- Adopción mínima: en el momento de la ficha el modelo registra 0 descargas y 0 likes, lo que implica ausencia de validación comunitaria.
- Licencia CC BY 4.0: permite uso comercial, pero exige atribución al modelo base quickmt y al autor de la conversión; no es una licencia tipo Apache/MIT sin condiciones.
- Vocabulario cerrado por SentencePiece: textos muy fuera de dominio o con gran densidad de símbolos pueden degradar la calidad de segmentación y, por tanto, de la traducción.

## Enlaces

- Ficha del modelo en Hugging Face: https://huggingface.co/value-productions/quickmt-en-ko-int8
- Modelo base (quickmt, CC BY 4.0): https://huggingface.co/quickmt/quickmt-en-ko
- CTranslate2 (runtime de inferencia requerido): https://github.com/OpenNMT/CTranslate2

Los resultados de búsqueda web proporcionados no aportaron enlaces relevantes adicionales (papers, demos o repositorios) sobre este modelo.
