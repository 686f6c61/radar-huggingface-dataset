# typhoon-ai/typhoon-ocr2-0.8b

## Resumen

Typhoon OCR V2 0.8B es un modelo de 0,8 mil millones de parametros especializado en el analisis de documentos (document parsing) para tailandes e ingles, desarrollado por Typhoon AI (OpenTyphoon). Dado el imagen de una pagina, devuelve los elementos de maquetacion en orden de lectura, cada uno con una categoria (13 tipos posibles, como titulo, texto, tabla, formula, cabecera o pie), un cuadro delimitador (bounding box) y su texto. Las tablas se emiten como HTML, las formulas como LaTeX y el resto del texto como Markdown.

El modelo es un ajuste fino (fine-tune) supervisado de ATH-MaaS/OvisOCR2 sobre el que se aplico despues GRPO con un adaptador LoRA, fusionado en fp32 y almacenado en bf16. Emplea la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) con un tamano oculto de 1.024 y esta pensado exclusivamente como parser de pagina completa: segun el autor, es notablemente mas debil que el modelo hermano de 2B en tareas de pregunta-respuesta sobre documentos.

Su relevancia radica en que reduce el tamano a 0,8B manteniendo una precision alta en paginas tailandesas e inglesas respecto a su predecesor (Typhoon OCR 1.5 2B), con mejoras notables en MDPBench (de 66,0 a 77,4) y olmOCR-bench (de 62,0 a 81,7). La licencia Apache 2.0 y la disponibilidad de versiones GGUF, MLX y Ollama facilitan su despliegue en entornos locales y en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), hidden size 1.024 |
| Parametros totales | 852.985.920 (0,8B), BF16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, int8, int4 (tags de Ollama); MLX 8-bit y 4-bit |
| Idiomas soportados | tailandes (th) e ingles (en); los datos de entrenamiento incluyen chino, no evaluado por separado |
| Licencia | Apache 2.0, sujeta a los Terminos y Condiciones de OpenTyphoon |
| Formato de pesos | safetensors; disponibles GGUF y MLX |

## Arquitectura y entrenamiento

El modelo parte de ATH-MaaS/OvisOCR2 y utiliza la arquitectura Qwen3.5 para generacion condicional multimodal (`Qwen3_5ForConditionalGeneration`), con un tamano oculto de 1.024 y 0,8B parametros en BF16. El entrenamiento consistio en un ajuste fino supervisado (SFT) sobre los mismos datos tailandeses curados y datos publicos en ingles y chino que el modelo de 2B, seguido de un entrenamiento con GRPO mediante un adaptador LoRA que se fusiono en los pesos en fp32 y se almaceno en bf16.

La innovacion destacable es el uso de recompensas en GRPO que asignan cero a las salidas que alcanzan el limite de tokens, lo que penaliza el bucle degenerado en la generacion. Segun el autor, en MDPBench esto redujo las paginas con bucles de 12 a 6 y elevo la puntuacion de 75,8 a 77,4. El modelo fue entrenado con imagenes de hasta 4 MP, aunque los resultados de benchmark se obtuvieron con imagenes de hasta 16,7 MP. La salida es una lista JSON de elementos de maquetacion dentro de un bloque de codigo `json`.

## Capacidades

- Analisis de maquetacion de pagina completa con categorias (13 tipos) y cuadros delimitadores en orden de lectura.
- Reconocimiento de tablas con salida en HTML.
- Reconocimiento de formulas con salida en LaTeX.
- Extraccion de texto general en Markdown.
- Conversion de la salida JSON a Markdown (con o sin cabeceras y pies) mediante codigo auxiliar.
- Procesamiento de paginas digitales y de paginas fotografiadas.
- Soporte de tailandes e ingles; datos de entrenamiento con chino no evaluado.
- No esta orientado a pregunta-respuesta sobre documentos (para ello se recomienda el modelo de 2B).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision mas alla del parsing de documentos: no disponible.

## Casos de uso

- Digitalizacion de archivos administrativos tailandeses: el modelo convierte imagenes de paginas escaneadas en JSON estructurado con posiciones, lo que permite indexar y buscar por region en sistemas de gestion documental.
- Extraccion de tablas financieras: al emitir tablas en HTML, se pueden integrar directamente en pipelines de conversion a CSV o bases de datos sin post-procesado manual de la estructura.
- Procesamiento de documentos cientificos y tecnicos: la salida en LaTeX para formulas facilita la reutilizacion del contenido matematico en publicaciones o repositorios.
- Digitalizacion de documentos fotografiados: con una puntuacion de 75,9 en MDPBench para paginas fotografiadas, es adecuado para capturas con movil en entornos sin escaner.
- Despliegue en local o en el borde: con 0,8B parametros y versiones GGUF, MLX y Ollama, puede ejecutarse en equipos de sobremesa o portatiles para OCR sin conexion.
- Integracion via API compatible con OpenAI: disponible como `typhoon-ocr-v2` en la API de Typhoon, lo que permite incorporarlo a aplicaciones existentes sin infraestructura propia.
- Construccion de pipelines de enriquecimiento documental: la salida JSON con cuadros delimitadores permite recortar regiones y alimentar etapas posteriores (clasificacion, extraccion de entidades) con coordenadas precisas.

## Benchmarks y rendimiento

| Benchmark | OvisOCR2 (base) | Typhoon OCR V2 0.8B | Cambio |
|---|---:|---:|---:|
| MDPBench, paginas tailandesas (mayor es mejor) | 14,7 | 77,2 | +62,5 |
| MDPBench, paginas inglesas (mayor es mejor) | 79,9 | 77,7 | −2,2 |
| MDPBench, paginas fotografiadas (mayor es mejor) | 45,5 | 75,9 | +30,4 |
| MDPBench, paginas digitales (mayor es mejor) | 54,3 | 82,0 | +27,7 |
| MDPBench, global (mayor es mejor) | 47,7 | 77,4 | +29,7 |
| ThaiOCRBench (mayor es mejor) | 10,2 | 36,4 | +26,2 |
| SEA-DocBench, NED tailandes (menor es mejor) | 0,6683 | no disponible en el extracto | no disponible |

Datos adicionales aportados por el autor: olmOCR-bench (solo ingles) 81,7 frente a 84,7 del modelo de 2B; OmniDocBench v1.6 de 70,97 a 89,37 respecto a Typhoon OCR 1.5; SEA-DocBench NED de 0,1726 a 0,1081 (menor es mejor); MDPBench de 66,0 a 77,4 y paginas tailandesas de 68,9 a 77,2 respecto a Typhoon OCR 1.5. En ThaiOCRBench, el modelo de 0,8B obtiene 36,4 frente a 40,5 de Typhoon OCR 1.5.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,7 GB en BF16 (tamano del repositorio); en torno a 0,9 GB en int8 y 0,5 GB en int4.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; A100, H100 o RTX 4090 no son necesarias pero ofrecen mayor throughput.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo (RTX 3060, RTX 4060, etc.) e incluso en hardware integrado con las versiones cuantizadas.
- Opciones de despliegue: vLLM 0.30.0 o superior (requisito del autor), llama.cpp mediante GGUF, MLX (8-bit y 4-bit), Ollama (`ollama run SuraponOCR/typhoon-ocr2-0.8b`) y el paquete Python `typhoon-ocr2`.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de preprocesado: es obligatorio ampliar toda imagen cuyo lado largo sea inferior a 1.600 px hasta 1.600 px antes de enviarla; el paquete `typhoon-ocr2` lo hace automaticamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench global | olmOCR-bench | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Typhoon OCR V2 0.8B | 0,8B | no disponible | 77,4 | 81,7 | Apache 2.0 | HF, GGUF, MLX, Ollama, API |
| Typhoon OCR V2 2B | 2B | no disponible | no disponible en el extracto | 84,7 | Apache 2.0 | HF |
| Typhoon OCR 1.5 2B | 2B | no disponible | 66,0 | 62,0 | Apache 2.0 | HF |
| ATH-MaaS/OvisOCR2 (base) | no disponible | no disponible | 47,7 | no disponible | no disponible | HF |

## Limitaciones y advertencias

- Recomendado exclusivamente como parser de pagina completa: segun el autor, es mucho mas debil fuera de esa tarea.
- En tareas de pregunta-respuesta sobre documentos obtiene 36,4 en ThaiOCRBench, por debajo de los 40,5 de Typhoon OCR 1.5; para preguntas se recomienda el modelo de 2B.
- Perdida de precision en ingles y chino respecto al modelo base: en MDPBench ingles baja de 79,9 a 77,7.
- Riesgo de bucles degenerados en la generacion: el autor menciona que GRPO redujo las paginas con bucle de 12 a 6, pero no las elimino por completo.
- Requiere ampliar imagenes con lado largo inferior a 1.600 px; omitir este paso degrada los resultados.
- Cobertura linguistica limitada a tailandes e ingles (con chino en entrenamiento no evaluado); no se garantiza su comportamiento en otros idiomas.
- El uso esta sujeto a los Terminos y Condiciones de OpenTyphoon ademas de la licencia Apache 2.0.
- Riesgo de alucinacion en el texto extraido: no se han publicado tasas especificas en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Modelo de 2B: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR2
- Version anterior (Typhoon OCR 1.5 2B): https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- GGUF: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-GGUF
- MLX 8-bit: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b-MLX-8bit
- Ollama: https://ollama.com/SuraponOCR/typhoon-ocr2-0.8b
- Paquete Python: https://pypi.org/project/typhoon-ocr2/
- Codigo del paquete: https://github.com/srn-source/typhoon-ocr2
- Codigo de evaluacion: https://github.com/srn-source/evaluation_thai_ocr
- Informe tecnico: https://arxiv.org/abs/2611.27494
- Segundo paper referenciado: https://arxiv.org/abs/2601.14722
- Demo (Typhoon OCR Playground): https://playground.opentyphoon.ai/ocr
- Documentacion de la API: https://docs.opentyphoon.ai/
- Sitio web: https://opentyphoon.ai
- Terminos y condiciones: https://opentyphoon.ai/tac
