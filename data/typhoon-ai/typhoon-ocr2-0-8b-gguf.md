# typhoon-ai/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon OCR V2 0.8B GGUF es la distribucion cuantizada en formato GGUF del modelo Typhoon OCR V2 0.8B, un parser de documentos multimodal desarrollado por SCB 10X (equipo Typhoon) para tailandes e ingles. Dada una imagen de pagina (digital o fotografiada), devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria, su bounding box y su texto: tablas en HTML, formulas en LaTeX y texto plano en Markdown. Ademas responde preguntas sobre un documento y extrae informacion clave como JSON.

El modelo base tiene 752.393.024 parametros (aproximadamente 0,8B) y combina un encoder de imagen con un modelo de lenguaje de tipo transformer; la model card no detalla la arquitectura interna mas alla de la pipeline `image-text-to-text`. Esta version GGUF esta pensada para llama.cpp y las herramientas construidas sobre el, lo que permite desplegar el OCR en CPU o GPU de consumo sin depender de vLLM.

Es relevante ahora porque ofrece un OCR estructurado (no solo texto plano) con buen rendimiento en tailandes, un idioma poco cubierto por los modelos OCR generalistas, en un tamano que cabe en practicamente cualquier equipo. La cuantizacion Q8_0 ocupa 812 MB y mantiene la precision del modelo original segun los datos del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (pipeline image-text-to-text; encoder de imagen + modelo de lenguaje; detalles internos no especificados en la informacion disponible) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens en la configuracion recomendada de llama.cpp (16.384 para imagen + 16.384 para respuesta) |
| Tipos de cuantizacion | f16, Q8_0, Q4_K_M (k-quant medium); encoder de imagen en f16 (`mmproj`) |
| Idiomas soportados | tailandes (th), ingles (en) |
| Licencia | Apache 2.0 (sujeto ademas a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (con `mmproj` separado para el encoder de imagen) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base: la model card lo describe como un parser de documentos multimodal que recibe una imagen de pagina y emite una lista JSON de elementos de maquetacion con categorias predefinidas (header, title, text, figure, table, formula, figure_caption, table_caption, formula_caption, figure_footnote, table_footnote, page_footnote, footer). El modelo se entreno con un conjunto fijo de prompts y sin bloque de razonamiento (thinking), motivo por el cual la configuracion recomendada usa `--reasoning off`.

Los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF o DPO) se remiten a la model card principal y al informe tecnico (arXiv:2611.27494), no incluidos en la informacion proporcionada. Una innovacion practica destacable es el esquema de tokens de imagen: un token de imagen cubre 32x32 pixeles, y el parametro `--image-max-tokens 16384` permite procesar paginas de hasta 16,7 MP, lo que preserva la legibilidad de texto pequeno.

## Capacidades

- Parsing de documentos: extrae elementos de maquetacion en orden de lectura con bounding boxes en una rejilla 0-1000 relativa al ancho y alto de la pagina.
- Conversion estructurada: tablas a HTML, formulas a LaTeX y texto general a Markdown.
- Respuesta a preguntas sobre documentos (document QA).
- Extraccion de informacion clave en formato JSON.
- OCR bilingue tailandes-ingles, incluyendo paginas digitales y fotografias.
- Salida JSON determinista con prompt fijo y decodificacion greedy (temperature 0.0).
- No dispone de modo de razonamiento (thinking) ni de tool calling descritos en la informacion disponible.

## Casos de uso

- Digitalizacion de archivos tailandeses: convertir escaneos y fotografias de documentos en Markdown estructurado con orden de lectura correcto, aprovechando el soporte nativo de tailandes que muchos OCR generalistas no cubren.
- Extraccion de tablas financieras: las tablas se devuelven como HTML, lo que facilita su conversion posterior a CSV o DataFrame en pipelines de datos.
- Procesamiento de documentos cientificos y tecnicos: las formulas se emiten en LaTeX, lo que permite reconstruir contenido matematico en entornos de publicacion.
- Extraccion de campos como JSON: facturas, formularios o contratos pueden procesarse para obtener informacion clave estructurada directamente consumible por una aplicacion.
- Document QA en atencion al cliente interna: dado un PDF o una imagen de pagina, el modelo responde preguntas sobre su contenido, util para asistentes de consulta documental.
- Despliegue en hardware modesto: con Q8_0 (812 MB) o Q4_K_M (529 MB) puede ejecutarse en portatiles y servidores sin GPU dedicada mediante llama.cpp, lo que abarata el procesamiento por lotes de grandes volumenes de paginas.
- Integracion en flujos con API compatible con OpenAI: el servidor `llama-server` expone un endpoint `/v1` que permite sustituir un servicio en la nube por inferencia local sin cambiar el codigo cliente.

## Benchmarks y rendimiento

Resultados en MDPBench (320 paginas tailandesas e inglesas, digitales y fotografiadas) segun el autor, ejecutados con `llama-server` (llama.cpp `a691b23`, CUDA, NVIDIA H100), decodificacion greedy, thinking off y presupuesto de imagen de 16.384 tokens:

| Archivo | Precision | Tamano | MDPBench | MDPBench Thai |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | - | - | 77,4 | 77,2 |
| `typhoon-ocr2-0.8b-f16.gguf` | f16, sin cuantizar | 1,52 GB | 77 | 76,9 |
| `typhoon-ocr2-0.8b-Q8_0.gguf` | 8 bits | 812 MB | 77,4 | 78 |
| `typhoon-ocr2-0.8b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 529 MB | 75,8 | 76,7 |
| `mmproj-typhoon-ocr2-0.8b-f16.gguf` | encoder de imagen f16 | 205 MB | - | - |

El autor senala que Q8_0 iguala al modelo original y que Q4_K_M queda unas 1,5 decimas por debajo en el global; diferencias de decimas entre archivos estan dentro de la variacion entre ejecuciones. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo completo en Q8_0 ocupa 812 MB mas 205 MB del encoder de imagen (aproximadamente 1 GB en total); Q4_K_M ocupa 529 MB mas 205 MB (aproximadamente 0,75 GB); f16 ocupa 1,52 GB mas 205 MB (aproximadamente 1,75 GB).
- GPU recomendadas: los benchmarks del autor se ejecutaron en NVIDIA H100, pero por tamano el modelo cabe holgadamente en cualquier GPU moderna; no se especifican requisitos minimos.
- GPU de consumo: si, cabe en tarjetas con 2-4 GB de VRAM o incluso en CPU (llama.cpp soporta ejecucion sin GPU).
- Opciones de despliegue: llama.cpp (`llama-server` con `-hf` o con archivos locales), y cualquier herramienta construida sobre llama.cpp; el servidor expone una API compatible con OpenAI.
- Configuracion recomendada: `--jinja --reasoning off -c 40960 --image-max-tokens 16384 -ngl 999 --port 8080`; para servir varias peticiones simultaneas, anadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de modelos OCR comparables (por ejemplo, otros parsers de documentos multimodales) con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Solo soporta tailandes e ingles; otros idiomas no estan cubiertos.
- El modelo se entreno con un conjunto fijo de prompts: para el parsing de pagina completa debe usarse el prompt exacto documentado; desviarse de el puede degradar la salida.
- Requiere ampliar la imagen para que su lado largo tenga al menos 1.600 pixeles; con imagenes pequenas el rendimiento cae, especialmente en tailandes.
- La salida es JSON dentro de un bloque de codigo y requiere parseo; no es texto libre.
- No dispone de modo de razonamiento; activar thinking en la plantilla de chat es contraproducente.
- Riesgo de alucinacion en la transcripcion de texto: el prompt pide texto exacto sin traduccion ni reescritura, pero no se documenta una garantia formal; conviene validar en produccion.
- Licencia Apache 2.0, pero el uso esta sujeto adicionalmente a los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- No se documentan sesgos especificos en la informacion disponible.
- El rendimiento en MDPBench se midio con un presupuesto de imagen de 16.384 tokens; reducirlo puede afectar a la precision en paginas densas.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Informe tecnico: https://arxiv.org/abs/2611.27494
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Terminos y condiciones OpenTyphoon: https://opentyphoon.ai/tac
