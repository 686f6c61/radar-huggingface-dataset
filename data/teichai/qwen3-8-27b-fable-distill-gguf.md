# TeichAI/Qwen3.8-27B-Fable-Distill-GGUF

## Resumen

TeichAI/Qwen3.8-27B-Fable-Distill-GGUF es una colección de archivos GGUF que cuantiza el modelo base TeichAI/Qwen3.8-27B-Fable-Distill, un finetune en BF16 de Qwen3.8-27B (arquitectura Qwen3.5) desarrollado por el equipo de Alibaba. El finetune, creado por TeichAI con Unsloth y TRL, se entrena sobre datasets de razonamiento de alta calidad generados por modelos de frontera (Claude, GPT, Gemini) y se distribuye en formato GGUF para facilitar su ejecución local con llama.cpp.

El modelo es multimodal (image-text-to-text) e incluye un proyector de visión independiente (mmproj) que debe cargarse junto al modelo para habilitar la entrada de imágenes. Con 27 320 millones de parámetros y una ventana de contexto de 262 000 tokens, destaca por su capacidad de razonamiento, soporte de modo pensante (thinking) y un head de predicción multi-token (MTP) que acelera la decodificación especulativa. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de esta versión GGUF radica en que ofrece múltiples niveles de cuantización (desde Q2_K hasta BF16) manteniendo el head MTP en BF16 para no degradar el rendimiento de la decodificación especulativa. Es una opción práctica para desarrolladores que necesitan desplegar un modelo de 27B con capacidades de visión y razonamiento en hardware local o en servidores con VRAM limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer denso, 64 capas + 1 capa MTP) |
| Parametros totales | 27 320 697 856 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens (segun documentacion del modelo base) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, Q2_K_S |
| Idiomas soportados | ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con shards para BF16) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 64 capas con arquitectura Qwen3.5, que incluye un head de prediccion multi-token (MTP) de una capa adicional (bloque 65) utilizado para decodificacion especulativa. El finetune Fable-Distill se realizo en BF16 con Unsloth y TRL, partiendo de los pesos de Qwen3.8-27B y entrenando sobre datasets de razonamiento de alta calidad procedentes de modelos de frontera. No se han publicado detalles sobre el numero exacto de tokens de entrenamiento ni la composicion del dataset.

La version GGUF mantiene el head MTP sin cuantizar en BF16 en todas las cuantizaciones, lo que supone un incremento de aproximadamente 0,55 GB por archivo respecto a una cuantizacion completa. Los archivos se generaron con llama.cpp (commit b6b4344e) sin matriz de importancia, por lo que no se incluyen cuantizaciones IQ1/IQ2/IQ3 por su degradacion sin dicha matriz.

El modelo es multimodal: incluye un proyector de vision (mmproj) disponible en F32, BF16 y F16, que debe cargarse junto al modelo para procesar imagenes. Sin el proyector, el modelo funciona como texto puro.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con soporte de modo pensante (thinking) activable mediante el parametro `enable_thinking` y niveles de esfuerzo de razonamiento `low`, `medium` o `xhigh` (por defecto `xhigh`).
- Procesamiento de imagenes (image-text-to-text) gracias al proyector de vision, permitiendo descripcion, analisis y respuestas basadas en contenido visual.
- Decodificacion especulativa mediante el head MTP, que acelera la generacion de tokens en servidores compatibles (llama-server con `--spec-type draft-mtp`).
- Capacidades multilingues limitadas: la model card declara ingles como unico idioma, aunque el modelo base podria soportar mas.
- Tool calling y function calling: no se menciona explicitamente en la documentacion, pero al estar basado en Qwen3.8-27B es probable que herede estas capacidades del modelo base.
- Soporte de agentes y flujos de trabajo automatizados, segun la descripcion oficial de Qwen3.8-27B (coding, agentic workflows, office automation).

## Casos de uso

- Asistente de codigo local: el modelo puede generar, revisar y explicar codigo en un entorno de desarrollo integrado, aprovechando su capacidad de razonamiento y su ventana de contexto de 262k tokens para mantener el contexto completo de un repositorio.
- Automatizacion de oficina: procesamiento de documentos, generacion de informes, resumen de correos y extraccion de datos de imagenes (capturas de pantalla, graficos) gracias a su entrada multimodal.
- Analisis de imagenes en produccion: un servidor llama.cpp con el proyector de vision puede clasificar o describir imagenes en tiempo real, por ejemplo en sistemas de moderacion de contenido o asistencia visual.
- Razonamiento cientifico y matematico: su entrenamiento en datasets de razonamiento de alta calidad lo hace adecuado para resolver problemas matematicos complejos, demostraciones logicas o analisis de datos.
- Agente conversacional con memoria larga: con 262k tokens de contexto, puede mantener conversaciones extensas o procesar documentos largos completos sin perder informacion.
- Desarrollo de prototipos de agentes autonomos: el soporte de MTP y el modo pensante permiten experimentar con agentes que planifican y ejecutan tareas de multiples pasos en entornos controlados.
- Despliegue en hardware modesto: gracias a las cuantizaciones Q4_K_M (16,2 GB) o Q3_K_M (14 GB), se puede ejecutar en una GPU de consumo como una RTX 4090 (24 GB) con margen para el contexto y el proyector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina de Yottalabs menciona que Qwen3.8-27B tiene "published benchmarks", pero no se incluyen cifras concretas en los materiales proporcionados. Se recomienda consultar la documentacion oficial del modelo base para obtener datos de MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M pesa 16,2 GB; con overhead de contexto y proyector se recomienda al menos 20-22 GB de VRAM. Q8_0 (29 GB) requiere 32 GB o mas. BF16 (55 GB) necesita una GPU profesional con 64 GB o mas.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M o Q5_K_M; A100 40/80 GB para Q8_0 o BF16; H100 para despliegues de alta concurrencia.
- En consumer GPU: si, las variantes Q4_K_M, Q4_K_S, Q3_K_M y Q2_K caben en GPUs de 16-24 GB (RTX 4080, 4090, 3090).
- Opciones de despliegue: llama.cpp (llama-cli, llama-server, llama-mtmd-cli), compatible con vLLM y SGLang segun la documentacion del modelo base. Ollama puede importar archivos GGUF manualmente.
- Latencia y throughput: no se han publicado mediciones especificas. Con decodificacion especulativa (MTP) se espera una mejora significativa en tokens por segundo frente a decodificacion autoregresiva estandar, aunque depende del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TeichAI/Qwen3.8-27B-Fable-Distill-GGUF | 27,3B | 262k | Apache 2.0 | GGUF | Finetune multimodal con MTP |
| TeichAI/Qwen3.6-27B-Fable-5-Experimental-GGUF | 27B (aprox.) | no disponible | Apache 2.0 | GGUF | Version anterior de la serie Fable, tambien con cuantizaciones |
| Qwen3.8-27B (base) | 27,3B | 262k | Apache 2.0 | safetensors | Modelo original de Alibaba, sin finetune especifico |

La comparativa se limita a la familia Qwen de 27B. No se dispone de datos de rendimiento publicados para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card declara ingles como unico idioma; el rendimiento en otros idiomas puede ser inferior al de modelos multilingues nativos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en tareas de razonamiento complejo o con datos no presentes en el entrenamiento.
- El head MTP se mantiene en BF16 en todas las cuantizaciones, lo que incrementa el tamano del archivo; las cuantizaciones Q2_K y Q2_K_S presentan perdidas de calidad notables y solo se recomiendan para pruebas.
- No se incluyen cuantizaciones IQ1/IQ2/IQ3 por falta de matriz de importancia; su ausencia evita degradaciones severas pero limita las opciones de compresion extrema.
- El modelo requiere cargar el proyector de vision (mmproj) para usar capacidades multimodales; sin el, solo funciona como modelo de texto.
- La ventana de contexto de 262k tokens es un dato del modelo base; el rendimiento real con contextos muy largos puede degradarse en cuantizaciones bajas.
- No se han publicado resultados de benchmarks especificos para este finetune, por lo que su rendimiento relativo frente a otros modelos no esta verificado.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-GGUF
- Modelo base (safetensors): https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Web de TeichAI: https://www.teichai.com/
- Articulo sobre especificaciones de Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
