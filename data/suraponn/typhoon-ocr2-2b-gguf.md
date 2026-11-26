# Suraponn/typhoon-ocr2-2b-GGUF

## Resumen

Typhoon OCR V2 2B GGUF es la distribucion cuantizada en formato GGUF del modelo Typhoon OCR V2 2B, un parser de documentos disenado especificamente para tailandes e ingles. Desarrollado originalmente por el equipo de Typhoon (SCB 10X) y empaquetado en GGUF por el usuario Suraponn, el modelo resuelve el problema de la extraccion estructurada de contenido a partir de imagenes de paginas: devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria, su bounding box y su texto, con tablas en HTML, formulas en LaTeX y texto plano en Markdown.

La relevancia de esta version radica en que permite ejecutar un OCR de documentos de calidad sobre llama.cpp y herramientas derivadas (Ollama, LM Studio, servidores locales compatibles con la API de OpenAI), sin necesidad de GPUs de datacenter ni de infraestructura de vLLM. Con 1.881.825.088 parametros totales y una licencia Apache 2.0 (sujeta a los terminos OpenTyphoon), ofrece un equilibrio poco habitual entre tamano reducido, soporte bilingue tailandes-ingles y salida estructurada lista para consumir por programas.

El modelo base es typhoon-ai/typhoon-ocr2-2b, con arquitectura multimodal image-text-to-text, y esta version GGUF mantiene la precision practicamente intacta: el fichero Q8_0 obtiene 79.5 en MDPBench frente a 79.8 de los pesos originales en bf16. El repositorio ocupa 7.7 GB e incluye tanto los pesos cuantizados como el codificador de imagen (mmproj) necesario para la inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (modelo base typhoon-ai/typhoon-ocr2-2b) |
| Parametros totales | 1.881.825.088 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens configurados en el ejemplo de llama-server (16.384 de imagen + 16.384 de respuesta) |
| Tipos de cuantizacion | f16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium); codificador de imagen en f16 |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache 2.0, sujeta a los OpenTyphoon Terms and Conditions |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano de ficheros | f16: 3.78 GB; Q8_0: 2.01 GB; Q4_K_M: 1.27 GB; mmproj f16: 668 MB |
| Pipeline | image-text-to-text |
| Libreria | gguf |

## Arquitectura y entrenamiento

El modelo base Typhoon OCR V2 2B es un modelo multimodal de tipo image-text-to-text: recibe una imagen de pagina y un prompt de texto, y genera una respuesta textual estructurada. La salida es un objeto JSON con una lista de elementos de maquetacion, cada uno con su bounding box en una rejilla normalizada de 0 a 1000 relativa al ancho y alto de la pagina, su categoria (header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer) y su contenido textual formateado segun el tipo (HTML para tablas, LaTeX para formulas, Markdown para el resto).

El modelo fue entrenado con un conjunto fijo de prompts y sin modo de razonamiento (thinking), por lo que la model card recomienda desactivar explicitamente el bloque de razonamiento en llama.cpp (`--reasoning off`). El informe tecnico (arXiv 2611.27494) describe el metodo y la evaluacion, pero en la informacion disponible no se detallan el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La version GGUF es una cuantizacion del modelo original: los pesos se convierten a f16, Q8_0 y Q4_K_M, y el codificador de imagen se distribuye por separado como mmproj en f16.

Una innovacion practica destacable es la gestion del presupuesto de tokens de imagen: con `--image-max-tokens 16384`, una pagina puede ocupar hasta 16.7 megapixeles (un token de imagen cubre 32x32 pixeles). Sin este ajuste, llama.cpp reduce la resolucion de las paginas grandes y el texto pequeno, especialmente el tailandes, se vuelve dificil de leer. La model card exige ampliar la imagen antes de enviarla para que su lado largo tenga al menos 1.600 pixeles.

## Capacidades

- Extraccion de maquetacion de paginas completas: devuelve elementos en orden de lectura humano con categoria, bounding box y texto.
- Conversion de tablas a HTML y de formulas a LaTeX, con el resto de texto en Markdown.
- OCR bilingue tailandes-ingles sobre documentos digitales y fotografias de paginas.
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extraccion de informacion clave en formato JSON.
- Salida estructurada consumible por programas mediante parseo del bloque `json`.
- Integracion con la API compatible de OpenAI que expone llama-server.
- No dispone de modo de razonamiento (thinking) y no fue entrenado con uno.
- No se documentan capacidades de audio, video ni tool calling generico.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo procesa imagenes de paginas escaneadas o fotografiadas y devuelve el texto en orden de lectura con bounding boxes, lo que permite reconstruir el documento y alimentar un indice de busqueda.
- Extraccion de tablas financieras: al formatear las tablas como HTML, se pueden parsear directamente con librerias como BeautifulSoup o pandas para incorporar los datos a un pipeline de analisis sin postprocesado manual complejo.
- Conversion de articulos cientificos con formulas: las formulas se emiten en LaTeX, lo que permite reutilizarlas en editores cientificos o en procesos de publicacion sin transcripcion manual.
- Procesamiento por lotes en servidor local: con llama-server, `-np N` y un contexto multiplicado por N, se pueden atender varias peticiones concurrentes en una sola GPU, adecuado para digitalizar lotes de facturas o formularios.
- Extraccion de campos clave a JSON: la capacidad de responder preguntas y devolver JSON permite implementar un extractor de datos (fechas, importes, nombres) sobre documentos concretos para integrarlo en un ERP o CRM.
- Despliegue en estaciones de trabajo sin GPU de datacenter: la cuantizacion Q4_K_M (1.27 GB) mas el mmproj (668 MB) cabe en GPUs de consumo, lo que facilita prototipos y despliegues en oficina.
- Preprocesado para RAG documental: la salida Markdown con estructura de maquetacion sirve como entrada limpia a un sistema de recuperacion aumentada, preservando titulos, pies de figura y orden de lectura.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre MDPBench (320 paginas tailandesas e inglesas, digitales y fotografiadas), con decodificacion greedy, thinking off y presupuesto de imagen de 16.384 tokens:

| Fichero | Precision | Tamano | MDPBench | MDPBench Thai |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 79.8 | 81.3 |
| typhoon-ocr2-2b-f16.gguf | 16 bits, sin cuantizar | 3.78 GB | 79.5 | 80.8 |
| typhoon-ocr2-2b-Q8_0.gguf | 8 bits | 2.01 GB | 79.5 | 80.4 |
| typhoon-ocr2-2b-Q4_K_M.gguf | 4 bits (k-quant medium) | 1.27 GB | 78.4 | 79.7 |
| mmproj-typhoon-ocr2-2b-f16.gguf | codificador de imagen f16 | 668 MB | – | – |

Las diferencias de unas pocas decimas entre ficheros estan dentro de la variacion entre ejecuciones. No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M (1.27 GB) mas mmproj (668 MB) requiere en torno a 2 GB de VRAM; Q8_0 (2.01 GB) mas mmproj ronda los 2.7 GB; f16 (3.78 GB) mas mmproj se acerca a 4.5 GB.
- GPU recomendadas: los benchmarks se ejecutaron en NVIDIA H100 con CUDA y llama.cpp build a691b23; para produccion con concurrencia alta se recomienda A100 o H100.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y en tarjetas con 4 GB o mas de VRAM para las cuantizaciones Q4_K_M y Q8_0.
- Opciones de despliegue: llama.cpp (llama-server con API compatible con OpenAI), y herramientas construidas sobre llama.cpp como Ollama o LM Studio; los pesos originales bf16 se sirven con vLLM.
- Parametros de servicio recomendados: `--jinja --reasoning off -c 40960 --image-max-tokens 16384 -ngl 999`; para concurrencia, anadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no se han publicado cifras concretas de latencia o tokens por segundo en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Typhoon OCR V2 2B GGUF (este) | 1.881.825.088 | 40.960 tokens configurados | OCR y parsing de documentos th/en | Apache 2.0 (terminos OpenTyphoon) | GGUF en Hugging Face |
| Typhoon OCR V2 2B (original) | 1.881.825.088 | no disponible en la informacion | OCR y parsing de documentos th/en | Apache 2.0 (terminos OpenTyphoon) | Pesos bf16 para vLLM |
| Modelos OCR genericos de proposito general | no disponible | no disponible | OCR multilingue | variable | variable |

No se dispone en la informacion proporcionada de datos de benchmarks de modelos alternativos comparables, por lo que la comparativa cuantitativa queda limitada a las variantes del propio modelo.

## Limitaciones y advertencias

- Solo soporta tailandes e ingles; otros idiomas no estan cubiertos y pueden producir resultados incorrectos.
- Requiere ampliar la imagen para que el lado largo tenga al menos 1.600 pixeles; las imagenes pequenas se leen mal, especialmente el texto tailandes.
- El modelo fue entrenado con un conjunto fijo de prompts; para el parsing de pagina completa debe usarse el prompt exacto documentado, lo que limita la flexibilidad de instrucciones.
- No dispone de modo de razonamiento; activar un bloque de thinking puede degradar la salida.
- Riesgo de alucinacion en textos poco legibles, formulas complejas o tablas con celdas combinadas; la model card remite a las limitaciones del modelo base.
- La licencia Apache 2.0 esta sujeta a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- El repositorio GGUF lo mantiene un tercero (Suraponn) a partir del modelo oficial; la trazabilidad de las cuantizaciones depende del empaquetador.
- El codificador de imagen debe descargarse por separado (mmproj) y es obligatorio con cualquiera de los ficheros de pesos.
- No se han publicado datos de sesgos especificos en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Suraponn/typhoon-ocr2-2b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Informe tecnico: https://arxiv.org/abs/2611.27494
- Terminos OpenTyphoon: https://opentyphoon.ai/tac
- llama.cpp: https://github.com/ggml-org/llama.cpp
