# Suraponn/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon OCR V2 0.8B GGUF es la distribucion cuantizada en formato GGUF del modelo Typhoon OCR V2 0.8B, un parser de documentos disenado especificamente para tailandes e ingles. Lo desarrolla Typhoon AI (SCB 10X) y esta pensado para su uso con llama.cpp y herramientas construidas sobre el, como llama-server o cualquier cliente compatible con la API de OpenAI. El modelo resuelve un problema concreto: dada la imagen de una pagina, devuelve sus elementos de maquetacion en orden de lectura, cada uno con categoria, bounding box y texto, con tablas en HTML, formulas en LaTeX y texto plano en Markdown.

El modelo base tiene 752.393.024 parametros (aproximadamente 0,8B) y es un modelo multimodal de tipo image-text-to-text. Esta orientado a tareas de OCR estructurado, parsing de documentos y extraccion de informacion, no a generacion de texto general. La version GGUF anade la posibilidad de ejecutar el modelo en local con llama.cpp, con distintos niveles de cuantizacion que van desde f16 (1,52 GB) hasta Q4_K_M (529 MB), mas un codificador de imagen separado en f16 de 205 MB.

Su relevancia actual radica en que cubre un nicho poco atendido: el OCR de alta calidad para tailandes (un idioma con alfabeto propio y escasa representacion en modelos OCR genericos) combinado con ingles, con salida estructurada lista para pipelines de extraccion de datos. La licencia Apache 2.0 del repositorio y la disponibilidad en GGUF lo hacen desplegable en infraestructura propia sin dependencias de API externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; arquitectura interna no detallada en la informacion proporcionada) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens recomendados en llama.cpp (16.384 para imagen + 16.384 para respuesta) |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M (k-quant medium); codificador de imagen en f16 |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache 2.0 (sujeto a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, composicion del dataset, numero de tokens de entrenamiento ni si hubo RLHF o DPO). La model card remite a la model card principal de Typhoon OCR V2 0.8B para los detalles de entrenamiento, resultados completos de benchmarks, ejemplos y limitaciones, pero esos datos no se incluyen en la informacion proporcionada.

Lo que si se documenta es el proceso de cuantizacion y su impacto medido. Los pesos originales en bf16 se convirtieron a tres variantes GGUF: f16 sin cuantizacion (1,52 GB), Q8_0 de 8 bits (812 MB) y Q4_K_M de 4 bits (529 MB). El codificador de imagen se distribuye por separado en f16 (205 MB) y es necesario con cualquiera de los ficheros anteriores. Las evaluaciones se ejecutaron con llama-server (build a691b23 de llama.cpp, CUDA, NVIDIA H100), decodificacion greedy, modo thinking desactivado y un presupuesto de imagen de 16.384 tokens (16,7 MP), con los mismos ajustes que las cifras de vLLM sobre los pesos originales. Un token de imagen cubre 32x32 pixeles.

## Capacidades

- Parsing de documentos pagina completa: devuelve los elementos de maquetacion en orden de lectura con categoria, bounding box y texto.
- Categorias de maquetacion soportadas: header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote y footer.
- Conversion de tablas a HTML y de formulas a LaTeX; el resto de texto se emite en Markdown.
- Bounding boxes en una rejilla de 0-1000 relativa al ancho y alto de la pagina.
- Salida estructurada: un unico objeto JSON con la lista de elementos, delimitado en un bloque de codigo `json`.
- Respuesta a preguntas sobre un documento: se envia la pregunta como prompt de texto junto a la imagen.
- Extraccion de informacion clave en formato JSON.
- Soporte de tailandes e ingles, tanto en documentos digitales como fotografiados.
- Integracion con llama.cpp mediante llama-server y endpoint compatible con la API de OpenAI (chat completions con image_url en base64).
- No dispone de modo thinking: el modelo se entreno sin el y se recomienda `--reasoning off`.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo convierte imagenes de paginas escaneadas en JSON estructurado con texto, tablas y bounding boxes, lo que permite indexar documentos en sistemas de gestion documental sin transcripcion manual. Es adecuado por su manejo nativo del alfabeto tailandes y su salida en orden de lectura.
- Extraccion de datos de facturas y formularios: enviando la pregunta adecuada como prompt de texto, el modelo devuelve la informacion clave en JSON, lo que facilita su insercion directa en bases de datos o ERPs.
- Conversion de PDFs tecnicos con formulas a Markdown/LaTeX: las formulas se emiten en LaTeX y las tablas en HTML, de modo que el resultado puede integrarse en pipelines de documentacion cientifica o en generadores de sitios estaticos.
- Construccion de corpus de entrenamiento: el parsing por elementos con bounding boxes permite generar datasets etiquetados de maquetacion (layout) para entrenar modelos de vision documental propios.
- Atencion al cliente sobre documentacion: dado que responde preguntas sobre el contenido de una pagina, puede usarse como capa de consulta sobre manuales, contratos o polizas en tailandes e ingles.
- Despliegue en local o en el borde: con el fichero Q8_0 (812 MB) y el codificador de imagen (205 MB) el modelo cabe en entornos con recursos limitados y funciona sin conexion a APIs externas, lo que resulta util en sectores con requisitos de confidencialidad documental.
- Procesamiento por lotes de digitalizaciones masivas: la configuracion de llama-server con `-np N` permite servir varias peticiones concurrentes multiplicando el contexto por N, lo que habilita el procesamiento paralelo de paginas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MDPBench (320 paginas en tailandes e ingles, digitales y fotografiadas), ejecutados con llama-server, greedy, thinking off y presupuesto de imagen de 16.384 tokens:

| Fichero | Precision | Tamano | MDPBench | MDPBench Thai |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 77,4 | 77,2 |
| typhoon-ocr2-0.8b-f16.gguf | f16, sin cuantizacion | 1,52 GB | 77 | 76,9 |
| typhoon-ocr2-0.8b-Q8_0.gguf | 8 bits | 812 MB | 77,4 | 78 |
| typhoon-ocr2-0.8b-Q4_K_M.gguf | 4 bits (k-quant medium) | 529 MB | 75,8 | 76,7 |
| mmproj-typhoon-ocr2-0.8b-f16.gguf | codificador de imagen f16 | 205 MB | – | – |

El autor recomienda Q8_0: iguala a f16 y a los pesos originales (77,4) con aproximadamente la mitad del tamano de f16. Q4_K_M queda unas 1,5 decimas por debajo en la media global. Las diferencias de pocas decimas entre ficheros estan dentro de la variacion entre ejecuciones. No se han publicado en la informacion disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros).

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M (529 MB) mas el codificador de imagen f16 (205 MB) suman unos 0,73 GB de pesos; Q8_0 (812 MB) mas el codificador, unos 1,02 GB; f16 (1,52 GB) mas el codificador, unos 1,73 GB. A esto hay que anadir el espacio de cache KV para un contexto de hasta 40.960 tokens y el presupuesto de imagen de 16.384 tokens.
- GPU recomendadas: el autor valido la ejecucion en NVIDIA H100 con CUDA. No se especifican otras GPU en la informacion proporcionada.
- Cabe en GPU de consumo: por tamano de pesos, si; sin embargo, el autor solo probo llama.cpp en Linux con CUDA y no valido builds de CPU, Metal ni Vulkan, cuyas salidas pueden diferir ligeramente.
- Opciones de despliegue: llama.cpp mediante llama-server (descarga directa con `-hf typhoon-ai/typhoon-ocr2-0.8b-GGUF:Q8_0` o con ficheros locales `-m` y `--mmproj`), con endpoint compatible con la API de OpenAI. Los pesos originales en bf16 se sirven con vLLM.
- Parametros de despliegue recomendados: `-c 40960 --image-max-tokens 16384 -ngl 999 --jinja --reasoning off`. Para servir varias peticiones a la vez, anadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento documentado |
|---|---|---|---|---|---|---|
| Typhoon OCR V2 0.8B GGUF | 752.393.024 | 40.960 tokens recomendados | th, en | Apache 2.0 (con OpenTyphoon T&C) | GGUF | MDPBench 77,4 (Q8_0) |
| Typhoon OCR V2 0.8B (original) | 752.393.024 | no disponible | th, en | Apache 2.0 (con OpenTyphoon T&C) | safetensors (bf16) | MDPBench 77,4 |
| Otros modelos OCR de ~0,8B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de modelos alternativos de la misma categoria, por lo que la comparativa con terceros no esta disponible.

## Limitaciones y advertencias

- La cuantizacion reduce la precision: Q4_K_M pierde aproximadamente 1,5 puntos en MDPBench respecto a Q8_0 y a los pesos originales. Conviene comparar las puntuaciones antes de elegir un fichero mas pequeno.
- Solo se probo llama.cpp en Linux con CUDA. Los builds de CPU, Metal y Vulkan no se validaron y sus salidas pueden diferir ligeramente.
- El modelo no dispone de modo thinking; debe desactivarse (`--reasoning off`) para evitar que la plantilla de chat abra un bloque de razonamiento.
- El modelo esta entrenado con un conjunto fijo de prompts. Para parsing de pagina completa debe usarse el prompt exacto documentado; desviarse de el puede degradar la salida.
- Sin `--image-max-tokens 16384`, llama.cpp reduce mas el tamano de las paginas grandes y el texto pequeno se vuelve mas dificil de leer.
- Cobertura linguistica limitada a tailandes e ingles; no se documenta soporte de otros idiomas.
- La salida puede truncarse si se alcanza el limite de tokens: el helper documentado descarta el ultimo elemento incompleto, lo que implica perdida parcial de contenido en paginas muy densas.
- El uso esta sujeto a los OpenTyphoon Terms and Conditions ademas de la licencia Apache 2.0, lo que puede imponer condiciones adicionales para uso comercial.
- Riesgo de alucinacion y de sesgos: no se documentan evaluaciones especificas en la informacion proporcionada; al tratarse de un modelo de extraccion de texto, el riesgo principal es la transcripcion incorrecta o la omision de elementos, no la generacion de contenido libre.
- El repositorio GGUF registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 2026-11-09; se trata de una publicacion reciente y poco validada por la comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Suraponn/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- OpenTyphoon Terms and Conditions: https://opentyphoon.ai/tac
