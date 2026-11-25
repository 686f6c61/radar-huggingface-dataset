# typhoon-ai/typhoon-ocr2-2b-GGUF

## Resumen
Typhoon OCR V2 2B GGUF es la distribucion cuantizada en formato GGUF del modelo Typhoon OCR V2 2B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) para tailandes e ingles. Dado el imagen de una pagina, el modelo devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria, su caja delimitadora (bbox) y su texto: las tablas se emiten como HTML, las formulas como LaTeX y el resto del texto como Markdown. Ademas responde preguntas sobre un documento y extrae informacion clave en JSON.

El modelo base cuenta con 1.881.825.088 parametros (aproximadamente 1,9 B) y es de tipo image-text-to-text, es decir, un modelo multimodal que combina un codificador de imagen con un decodificador de lenguaje. Esta version GGUF esta pensada para llama.cpp y las herramientas construidas sobre el, e incluye el codificador de imagen como archivo `mmproj` separado en f16 (668 MB) que debe acompanar a cualquier cuantizacion del modelo de lenguaje.

Su relevancia practica esta en el rendimiento en un tamano muy contenido: con cuantizacion Q8_0 ocupa 2,01 GB y alcanza 79,5 en MDPBench (80,4 en el subconjunto tailandes), practicamente identico al modelo original en bf16 (79,8 y 81,3). Esto permite desplegar un OCR estructurado de calidad en hardware de consumo, algo poco habitual en parsing de documentos con salida de maquetacion y bboxes.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal image-text-to-text (codificador de imagen + decodificador de lenguaje); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 1.881.825.088 (aprox. 1,9 B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 40.960 tokens configurados en el ejemplo de llama.cpp (16.384 para imagen + 16.384 para respuesta); limite maximo del modelo no disponible |
| Tipos de cuantizacion | f16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium) |
| Idiomas soportados | tailandes (th) e ingles (en) |
| Licencia | Apache 2.0, sujeto a los OpenTyphoon Terms and Conditions |
| Formato de pesos | GGUF (con archivo `mmproj` separado para el codificador de imagen en f16) |

## Arquitectura y entrenamiento
La informacion disponible describe el modelo base como un sistema multimodal de tipo image-text-to-text orientado a parsing de documentos: recibe una imagen de pagina y genera una lista JSON de elementos de maquetacion con categoria, bbox en rejilla 0-1000 relativa al tamano de la pagina y texto. Las categorias permitidas son `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote` y `footer`. Las tablas se serializan en HTML, las formulas en LaTeX y el resto en Markdown.

El modelo fue entrenado con un conjunto fijo de prompts y sin bloque de razonamiento (por eso se recomienda `--reasoning off` en llama.cpp). El codificador de imagen usa un presupuesto de hasta 16.384 tokens de imagen, con un token de imagen por cada bloque de 32x32 pixeles, lo que permite procesar paginas de hasta 16,7 MP. Los detalles de composicion del dataset de entrenamiento, numero de tokens y si hubo RLHF/DPO no estan disponibles en la informacion proporcionada; el informe tecnico (arXiv:2611.27494) describe el metodo y la evaluacion.

La innovacion destacable de esta publicacion es la cuantizacion con perdida minima: Q8_0 reproduce la precision del f16 (79,5 en MDPBench en ambos casos) con la mitad de tamano, y Q4_K_M cede solo alrededor de un punto (78,4).

## Capacidades
- Parsing de documentos de pagina completa con salida estructurada: lista JSON de elementos con bbox, categoria y texto en orden de lectura humano.
- Extraccion de tablas como HTML y de formulas como LaTeX.
- Extraccion de texto en Markdown para titulos, parrafos, pies de figura, notas y cabeceras.
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extraccion de informacion clave en formato JSON.
- Procesamiento de documentos digitales y de paginas fotografiadas.
- Soporte bilingue tailandes-ingles, con especial atencion al tailandes (mejor resultado en el subconjunto tailandes de MDPBench: 81,3 en bf16).
- Integracion con llama.cpp mediante endpoint compatible con la API de OpenAI; soporta plantilla de chat Jinja.
- No dispone de modo de razonamiento (thinking); el modelo fue entrenado sin el.

## Casos de uso
- Digitalizacion de archivos administrativos tailandeses: el modelo convierte paginas escaneadas en JSON estructurado con bboxes, lo que permite reconstruir el orden de lectura y alimentar sistemas de gestion documental; su buen rendimiento en tailandes (80,4 en MDPBench Thai con Q8_0) lo hace adecuado para este idioma.
- Extraccion de tablas financieras a HTML: en lugar de OCR plano, el modelo devuelve la tabla como HTML, lo que preserva la estructura de filas y columnas para su posterior conversion a CSV o bases de datos.
- Conversion de articulos cientificos a Markdown con formulas LaTeX: util para pipelines de ingesta de papers donde las formulas deben conservarse en LaTeX y las figuras y sus pies deben quedar etiquetados por categoria.
- Document QA en atencion al cliente: dado el imagen de una factura o contrato, el modelo responde preguntas concretas sobre su contenido, lo que permite construir asistentes que resuelven dudas sobre documentos aportados por el usuario.
- Extraccion de campos clave en JSON para automatizacion de back office: el modelo puede devolver la informacion esencial de un formulario o recibo en JSON, facilitando la integracion con ERPs y flujos de validacion.
- Despliegue en hardware de consumo para procesamiento por lotes: con Q4_K_M (1,27 GB) mas el mmproj (668 MB) el modelo cabe en GPUs consumer, lo que permite montar un servicio OCR local sin depender de la nube.
- Procesamiento de documentos fotografiados: el modelo esta evaluado tambien con paginas fotografiadas, por lo que sirve para capturas con movil en aplicaciones de digitalizacion de recibos o documentos de identidad.

## Benchmarks y rendimiento
| Version | Precision | Tamano | MDPBench | MDPBench Thai |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | bf16 | no disponible | 79,8 | 81,3 |
| `typhoon-ocr2-2b-f16.gguf` | f16, sin cuantizar | 3,78 GB | 79,5 | 80,8 |
| `typhoon-ocr2-2b-Q8_0.gguf` | 8 bits | 2,01 GB | 79,5 | 80,4 |
| `typhoon-ocr2-2b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 1,27 GB | 78,4 | 79,7 |
| `mmproj-typhoon-ocr2-2b-f16.gguf` | codificador de imagen f16 | 668 MB | - | - |

Las mediciones se realizaron con `llama-server` (build `a691b23` de llama.cpp, CUDA, NVIDIA H100), decodificacion greedy, razonamiento desactivado y presupuesto de imagen de 16.384 tokens (16,7 MP). MDPBench consta de 320 paginas en tailandes e ingles, digitales y fotografiadas. El autor indica que diferencias de unas decimas entre archivos estan dentro de la variacion entre ejecuciones.

## Requisitos de hardware
- VRAM estimada: Q4_K_M (1,27 GB) + mmproj f16 (668 MB) requiere aproximadamente 2 GB para los pesos; Q8_0 (2,01 GB) + mmproj, unos 2,7 GB; f16 (3,78 GB) + mmproj, unos 4,5 GB. A esto hay que sumar la memoria de la cache KV para el contexto configurado (hasta 40.960 tokens en el ejemplo del autor).
- GPU recomendadas: el autor valido el modelo en NVIDIA H100 con CUDA. Por tamano, cabe holgadamente en RTX 4090, RTX 4080, RTX 3090 y GPUs con 8 GB o mas; con Q4_K_M podria ejecutarse en GPUs de 6-8 GB.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 8 GB de VRAM para Q8_0 y con 6-8 GB para Q4_K_M, asumiendo contexto suficiente.
- Opciones de despliegue: llama.cpp (`llama-server`), con endpoint compatible con la API de OpenAI; descarga directa con `-hf typhoon-ai/typhoon-ocr2-2b-GGUF:Q8_0`. El modelo original en bf16 se sirve con vLLM segun los datos del autor. No se mencionan otras opciones (Ollama, TGI) en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor solo indica que las pruebas se hicieron en H100 con CUDA y que se puede servir varias peticiones con `-np N` multiplicando el contexto.

## Comparativa con modelos similares
No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos de OCR o parsing de documentos (por ejemplo, variantes de OCR especializado en tailandes o parsers multimodales de proposito general), por lo que no es posible establecer una comparativa numerica fiable. Los unicos puntos de comparacion disponibles son las propias variantes del modelo:

| Version | Tamano | MDPBench | MDPBench Thai | Licencia |
|---|---|---|---|---|
| Original bf16 (vLLM) | no disponible | 79,8 | 81,3 | Apache 2.0 |
| GGUF Q8_0 | 2,01 GB | 79,5 | 80,4 | Apache 2.0 |
| GGUF Q4_K_M | 1,27 GB | 78,4 | 79,7 | Apache 2.0 |

## Limitaciones y advertencias
- El modelo solo soporta tailandes e ingles; no esta disenado para otros idiomas.
- Requiere ampliar la imagen antes de enviarla: el lado largo debe ser de al menos 1.600 pixeles. Con imagenes pequenas el rendimiento cae, especialmente en tailandes.
- Esta entrenado con un conjunto fijo de prompts; para el parsing de pagina completa debe usarse el prompt exacto documentado. Desviarse de el puede degradar la salida.
- No dispone de modo de razonamiento; debe desactivarse el bloque de thinking en la plantilla de chat.
- Riesgo de alucinacion y de errores de transcripcion en documentos con baja calidad de imagen, tipografias complejas o tablas muy densas; no se han publicado tasas de error por categoria en la informacion disponible.
- El uso esta sujeto a los OpenTyphoon Terms and Conditions ademas de la licencia Apache 2.0; conviene revisarlos antes de un uso comercial.
- El contexto maximo real del modelo no se especifica; el ejemplo usa 40.960 tokens, suficiente para una imagen de 16.384 tokens mas una respuesta de 16.384.
- Las diferencias de decimas de punto entre cuantizaciones estan dentro de la variacion entre ejecuciones, por lo que no deben interpretarse como mejoras reales.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Informe tecnico: https://arxiv.org/abs/2611.27494
- Terminos y condiciones de OpenTyphoon: https://opentyphoon.ai/tac
- llama.cpp: https://github.com/ggml-org/llama.cpp
