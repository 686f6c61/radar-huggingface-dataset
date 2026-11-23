# Xylolabs/Surogate3.7-35B-A3B-GGUF

## Resumen

Surogate3.7-35B-A3B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Surogate, con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B). El repositorio aquí documentado, Xylolabs/Surogate3.7-35B-A3B-GGUF, es una cuantización en formato GGUF del modelo base original, publicada por Xylolabs para su ejecución con llama.cpp sobre CUDA, Metal o CPU.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo MoE de 35B en hardware de consumo y estaciones de trabajo, con cuantizaciones que van desde Q8_0 (37,80 GB) hasta IQ3_M (15,81 GB), además de un proyector de visión (mmproj) que habilita la entrada image-text-to-text. El modelo está orientado a casos de agentes y uso de herramientas (tool-use), y por defecto opera en modo de razonamiento (thinking), que puede desactivarse mediante parámetros de plantilla de chat.

La licencia es Apache-2.0 y el idioma declarado es únicamente inglés. No se dispone de información sobre la longitud de contexto nativa del modelo base más allá de las referencias de despliegue de la model card, que mencionan ventanas de hasta 256K en configuraciones de alta memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; detalles de atención no disponibles |
| Parametros totales | 35.505.251.456 (35,5B) |
| Parametros activos | Aproximadamente 3B (según el sufijo A3B) |
| Longitud de contexto | Hasta 256K según configuración de hardware en la model card; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, IQ3_M; proyector de visión F16; importance matrix (imatrix) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), más mmproj F16 para visión |

## Arquitectura y entrenamiento

El modelo base es un Mixture of Experts con 35,5B parámetros totales y aproximadamente 3B activos, lo que permite un coste de cómputo por token notablemente inferior al de un modelo denso del mismo tamaño. La model card del repositorio GGUF no detalla la arquitectura interna (tipo de atención, número de expertos, función de activación) ni los datos de entrenamiento del modelo original. Tampoco se especifica si hubo fases de RLHF, DPO u otras técnicas de alineación.

La innovación destacable de esta publicación es el proceso de cuantización: se ha generado una importance matrix (imatrix) propia y se han medido métricas de fidelidad frente a BF16 (divergencia KL media y acuerdo top-1) para cada cuantización sobre tres conjuntos de texto. Los resultados muestran que Q8_0 mantiene un acuerdo top-1 del 96,2% en WikiText-2 y del 97,9% en chat, mientras que IQ3_M conserva un 86,0% y 92,0% respectivamente, lo que permite elegir el compromiso tamaño-fidelidad con datos objetivos. El modelo incorpora además un modo de razonamiento activado por defecto y un proyector de visión separado para entrada multimodal.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat incluida en el propio archivo GGUF.
- Razonamiento en modo thinking por defecto, desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'`.
- Soporte de tool calling y function calling, según las etiquetas del repositorio (tool-use, agent).
- Capacidades de agente y razonamiento multi-paso, orientadas a flujos automatizados.
- Entrada multimodal image-text-to-text mediante el proyector `mmproj-Surogate3.7-35B-A3B-F16.gguf`.
- Capacidades multilingües limitadas al inglés según la metadata del modelo.
- Ejecución en llama.cpp sobre CUDA, Metal o CPU, con soporte de plantillas Jinja (`--jinja`).

## Casos de uso

- Agentes autónomos con uso de herramientas: el modelo puede encadenar llamadas a funciones y razonamiento multi-paso, adecuado para orquestadores que necesiten decidir qué herramienta invocar en cada turno.
- Asistencia conversacional con contexto largo: con ventanas de 64K a 256K según hardware, permite gestionar historiales extensos o documentos largos en un único contexto sin truncamiento agresivo.
- Procesamiento de documentos con imágenes: gracias al proyector de visión, puede extraer información de capturas, diagramas o formularios escaneados en pipelines de digitalización.
- Despliegue en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q3_K_M e IQ3_M caben en 24 GB de VRAM (RTX 4090/3090) o incluso en 16 GB con IQ3_M, lo que facilita prototipado local.
- Automatización de soporte técnico en inglés: con tool calling puede consultar bases de conocimiento o sistemas de tickets y redactar respuestas, manteniendo el razonamiento desactivable para reducir latencia en producción.
- Generación de código asistida en entornos con restricciones de privacidad: al ejecutarse localmente con llama.cpp, los datos no salen de la infraestructura, lo que encaja en equipos que no pueden usar APIs externas.
- Investigación sobre cuantización: la disponibilidad de imatrix y métricas KL/top-1 por cuantización permite estudiar el impacto de la compresión en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente proporciona métricas de fidelidad de cuantización frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Chat KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 37,80 GB | 0,009392 | 96,216% | 0,005175 | 97,884% | 0,009576 | 96,167% |
| Q6_K | 29,21 GB | 0,012814 | 95,147% | 0,007485 | 97,519% | 0,014325 | 95,627% |
| Q5_K_M | 25,35 GB | 0,017372 | 94,181% | 0,010720 | 97,009% | 0,020506 | 94,775% |
| Q4_K_M | 21,71 GB | 0,036291 | 91,868% | 0,021849 | 95,066% | 0,044122 | 91,941% |
| IQ4_XS | 19,18 GB | 0,042241 | 91,049% | 0,025082 | 94,966% | 0,051119 | 91,667% |
| Q3_K_M | 17,17 GB | 0,107141 | 86,098% | 0,065813 | 91,819% | 0,135335 | 86,804% |
| IQ3_M | 15,81 GB | 0,101532 | 86,010% | 0,058655 | 92,038% | 0,123596 | 86,961% |

## Requisitos de hardware

- VRAM estimada: 15,81 GB (IQ3_M) hasta 37,80 GB (Q8_0) solo para los pesos; el proyector de visión añade 899,28 MB.
- GPU recomendadas según la model card:
  - RTX 4090 / RTX 3090 (24 GB): Q3_K_M con contexto de 64K.
  - RTX 5090 (32 GB): Q5_K_M con contexto de 64K.
  - RTX 6000 Ada o 2 x 24 GB (48 GB): Q8_0 con contexto de 128K.
  - H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB unificada), H200 (141 GB), B200 (192 GB), Mac Studio M5 Ultra (256/512 GB): Q8_0 con contexto de 256K.
- Cabe en GPU de consumo: sí, con IQ3_M o Q3_K_M en tarjetas de 16-24 GB.
- Opciones de despliegue: llama.cpp (llama-server) sobre CUDA, Metal o CPU; compatible con endpoints según la etiqueta endpoints_compatible.
- Comando de referencia: `llama-server -m Surogate3.7-35B-A3B-Q4_K_M.gguf --mmproj mmproj-Surogate3.7-35B-A3B-F16.gguf --jinja -ngl 99 -c 32768 --temp 1.0 --top-p 0.95 --top-k 20`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Cualitativamente, el modelo se posiciona en la categoría de MoE de ~35B con ~3B activos, comparable en tamaño a otras arquitecturas MoE de esa escala, pero no se dispone de sus especificaciones ni resultados para contrastar.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Surogate3.7-35B-A3B (GGUF) | 35,5B totales / ~3B activos | hasta 256K según hardware | Apache-2.0 | Hugging Face (GGUF) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idioma: solo inglés declarado; el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: no se han publicado evaluaciones de veracidad ni de tasas de alucinación.
- Sesgos: no hay información sobre la composición del dataset de entrenamiento ni sobre evaluaciones de sesgo.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y las condiciones del modelo base.
- El modo thinking está activado por defecto, lo que incrementa latencia y consumo de tokens; debe desactivarse explícitamente para respuestas directas.
- Las cuantizaciones bajas (Q3_K_M, IQ3_M) pierden fidelidad de forma notable (acuerdo top-1 en torno al 86% en WikiText-2), por lo que no son recomendables para tareas sensibles a la precisión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.
- El contexto máximo real depende del hardware y de la configuración de llama.cpp; las cifras de 128K y 256K son orientativas según la model card.
- No se dispone de información sobre el proceso de alineación del modelo base, lo que dificulta anticipar su comportamiento en dominios sensibles.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/Surogate3.7-35B-A3B-GGUF
- Modelo base: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Licencia: https://huggingface.co/Xylolabs/Surogate3.7-35B-A3B-GGUF/blob/main/LICENSE
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
