# typhoon-ai/typhoon-ocr2-0.8b-GGUF

## Resumen

Typhoon OCR2 0.8B GGUF es la distribucion en formato GGUF del modelo Typhoon OCR V2 0.8B, un parser de documentos desarrollado por Typhoon AI (SCB 10X) especializado en tailandes e ingles. Dado un imagen de una pagina, el modelo devuelve los elementos de maquetacion en orden de lectura, cada uno con su categoria, su bounding box y su texto: las tablas se emiten como HTML, las formulas como LaTeX y el resto del texto como Markdown. Ademas responde preguntas sobre el documento y extrae informacion clave en JSON.

El modelo base cuenta con 752.393.024 parametros y una arquitectura multimodal image-text-to-text orientada a OCR y document parsing. Esta version GGUF esta pensada para llama.cpp y las herramientas construidas sobre el, con archivos que van desde 529 MB en cuantizacion Q4_K_M hasta 1,52 GB en f16, mas un codificador de imagen (mmproj) separado de 205 MB que debe acompanar a cualquier archivo.

Su relevancia practica es doble: por un lado cubre el OCR de tailandes, un idioma con poca cobertura en modelos abiertos de vision-lenguaje; por otro, su tamano inferior a mil millones de parametros permite desplegarlo en hardware modesto manteniendo, segun el autor, una puntuacion de 77,4 en MDPBench en la cuantizacion Q8_0, identica a los pesos originales en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text (encoder de imagen + modelo de lenguaje; detalles internos no disponibles) |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 40.960 tokens segun la configuracion recomendada de llama-server (16.384 para imagen + 16.384 para respuesta); contexto nativo maximo no disponible |
| Tipos de cuantizacion | f16 (sin cuantizar), Q8_0 (8 bits), Q4_K_M (4 bits, k-quant medium); codificador de imagen en f16 |
| Idiomas soportados | Tailandes (th) e ingles (en) |
| Licencia | Apache 2.0 (sujeto ademas a los OpenTyphoon Terms and Conditions) |
| Formato de pesos | GGUF (llama.cpp); pesos originales en bf16 en el repositorio base |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como un sistema multimodal de tipo image-text-to-text: un codificador de imagen procesa la pagina y un modelo de lenguaje genera una lista JSON de elementos de maquetacion. El repositorio GGUF no detalla la arquitectura interna (tipo de transformer, atencion, composicion exacta del encoder), y esa informacion debe consultarse en el model card principal y en el informe tecnico (arXiv 2611.27494). El presupuesto de imagen es de 16.384 tokens, con un token de imagen por cada bloque de 32x32 pixeles, lo que permite paginas de hasta 16,7 MP.

El modelo fue entrenado con un conjunto fijo de prompts; el autor indica que debe usarse exactamente el prompt de parsing de pagina completa que aparece en el model card, con categorias de maquetacion predefinidas (header, title, text, figure, table, formula, captions, footnotes, footer). El modelo se entreno sin bloque de razonamiento (thinking), por lo que se recomienda desactivarlo en el chat template. Los detalles sobre numero de tokens de entrenamiento, composicion del dataset y si hubo RLHF o DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Parsing de pagina completa: devuelve los elementos de maquetacion en orden de lectura con categoria, bounding box en rejilla 0-1000 relativa a la pagina y texto.
- Conversion de formato por categoria: tablas en HTML, formulas en LaTeX y texto general en Markdown.
- OCR bilingue tailandes-ingles, incluyendo paginas digitales y fotografias de documentos.
- Respuesta a preguntas sobre el contenido de un documento (document QA).
- Extraccion de informacion clave en JSON.
- Salida estructurada: lista JSON de elementos dentro de un bloque de codigo `json`.
- Integracion con llama.cpp mediante endpoint compatible con la API de OpenAI (chat completions con imagen en data URL).
- No soporta modo de razonamiento (thinking); el autor recomienda desactivarlo.

## Casos de uso

- Digitalizacion de archivos tailandeses: conversion de documentos escaneados o fotografiados a Markdown estructurado, aprovechando la cobertura de tailandes que rara vez ofrecen los modelos OCR abiertos.
- Extraccion de tablas a HTML: facturas, estados financieros y tablas de resultados se devuelven como HTML listo para insertar en un pipeline de datos o en un visor web.
- Procesamiento de documentos cientificos y tecnicos: las formulas se emiten en LaTeX, lo que permite reconstruir articulos con notacion matematica sin post-procesado manual.
- Extraccion de campos clave en JSON: el modelo responde a preguntas sobre el documento y devuelve informacion estructurada, util para alimentar sistemas de gestion documental o RPA.
- Despliegue en hardware de gama media: con 529 MB en Q4_K_M y 812 MB en Q8_0, cabe en GPUs de consumo y en servidores sin acelerador dedicado, lo que facilita el procesamiento por lotes a bajo coste.
- Servicio OCR autoalojado: con llama-server y la API compatible con OpenAI, se puede montar un endpoint interno de OCR para equipos que no pueden enviar documentos a servicios en la nube.
- Preprocesado para RAG: convertir paginas escaneadas en Markdown con orden de lectura correcto antes de trocearlas e indexarlas en un sistema de recuperacion.

## Benchmarks y rendimiento

Resultados en MDPBench (320 paginas tailandesas e inglesas, digitales y fotografiadas), ejecutados por el autor con llama-server (build a691b23, CUDA, NVIDIA H100), decodificacion greedy, thinking off y presupuesto de imagen de 16.384 tokens:

| Archivo | Precision | Tamano | MDPBench | MDPBench Thai |
|---|---|---|---|---|
| Pesos originales (bf16, vLLM) | – | – | 77,4 | 77,2 |
| `typhoon-ocr2-0.8b-f16.gguf` | f16, sin cuantizar | 1,52 GB | 77,0 | 76,9 |
| `typhoon-ocr2-0.8b-Q8_0.gguf` | 8 bits | 812 MB | 77,4 | 78,0 |
| `typhoon-ocr2-0.8b-Q4_K_M.gguf` | 4 bits (k-quant medium) | 529 MB | 75,8 | 76,7 |
| `mmproj-typhoon-ocr2-0.8b-f16.gguf` | encoder de imagen f16 | 205 MB | – | – |

El autor senala que Q8_0 iguala a f16 y a los pesos originales con la mitad de tamano, que Q4_K_M queda unos 1,5 puntos por debajo en el global y que diferencias de decimas entre archivos estan dentro de la variacion entre ejecuciones. No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,7 GB para Q4_K_M y 1,0 GB para Q8_0, sumando el encoder de imagen f16 (205 MB) y el contexto; el presupuesto de contexto de 40.960 tokens anade memoria KV adicional.
- GPU recomendadas: el autor valido con NVIDIA H100; por tamano, cualquier GPU con 4 GB o mas de VRAM deberia ser suficiente, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- GPU de consumo: si, cabe holgadamente en tarjetas consumer actuales, incluso en configuraciones con poca VRAM.
- Opciones de despliegue: llama.cpp (llama-server con `-hf` o archivos locales y `--mmproj`), y herramientas construidas sobre llama.cpp; los pesos originales bf16 se sirven con vLLM.
- Parametros de servicio recomendados: `--jinja --reasoning off -c 40960 --image-max-tokens 16384 -ngl 999`; para varias peticiones simultaneas, anadir `-np N` y multiplicar `-c` por N.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / imagen | Licencia | Formato |
|---|---|---|---|---|---|
| Typhoon OCR2 0.8B (este) | 752 M | th, en | 40.960 tokens de servicio; imagen hasta 16,7 MP | Apache 2.0 + OpenTyphoon T&C | GGUF, bf16 |
| Alternativas OCR abiertas de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas con soporte de tailandes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos verificables de modelos comparables de la misma categoria (OCR/document parsing de menos de mil millones de parametros con soporte de tailandes), por lo que no se incluyen cifras de terceros.

## Limitaciones y advertencias

- Entrenado solo para tailandes e ingles; el rendimiento en otros idiomas no esta garantizado.
- Requiere un prompt fijo y concreto para el parsing de pagina completa; desviarse de el puede degradar la salida.
- Necesita ampliar las imagenes para que el lado largo tenga al menos 1.600 pixeles; con imagenes pequenas el modelo lee mal, especialmente el tailandes.
- El modelo se entreno sin bloque de razonamiento; activar thinking en el chat template puede alterar el comportamiento esperado.
- Riesgo de alucinacion y de omitir o desordenar elementos en paginas muy densas; conviene validar la salida JSON en produccion.
- Las bounding boxes usan una rejilla 0-1000 relativa a la pagina; hay que reescalarlas para mapearlas a la imagen original.
- Diferencias de decimas en MDPBench entre cuantizaciones estan dentro de la variacion entre ejecuciones; no deben interpretarse como mejoras reales.
- La licencia Apache 2.0 va acompanada de los OpenTyphoon Terms and Conditions, que deben revisarse antes de un uso comercial.
- No se han publicado en la informacion disponible datos sobre sesgos, tasas de alucinacion medidas ni limites de contexto nativo del modelo base.

## Enlaces

- Repositorio GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Informe tecnico: https://arxiv.org/abs/2611.27494
- Terminos de uso OpenTyphoon: https://opentyphoon.ai/tac
- llama.cpp: https://github.com/ggml-org/llama.cpp
