# Xylolabs/Qwen3.8-27B-GGUF

## Resumen

Xylolabs/Qwen3.8-27B-GGUF es un conjunto de cuantizaciones en formato GGUF del modelo Qwen/Qwen3.8-27B, publicado por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU. El modelo base es un transformer multimodal de tipo image-text-to-text con 27.320.697.856 parámetros totales (27,3 mil millones), desarrollado originalmente por el equipo Qwen. Esta versión no introduce cambios arquitectónicos: es una redistribución optimizada para inferencia local que conserva la licencia Apache 2.0 del modelo original.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 27B con capacidades de visión en hardware de consumo, algo imposible con los pesos en BF16 (que rondarían los 55 GB). El repositorio ofrece nueve niveles de cuantización para el modelo principal (desde Q8_0 de 29 GB hasta Q2_K de 9,9 GB) más dos proyectores multimodales (mmproj) en F16 y Q8_0, con métricas de degradación medidas frente a BF16 sobre WikiText-2, un conjunto de chat y un conjunto held-out.

El autor declara soporte de los idiomas inglés y coreano, y la model card documenta un modo de razonamiento opcional (thinking) que puede desactivarse mediante `--chat-template-kwargs '{"enable_thinking":false}'`. El repositorio acumula 10.119 descargas y 1 like desde su creación el 14 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (detalles internos del modelo base no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 (27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 8192`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS-imat, Q3_K_M, IQ3_M, Q2_K (modelo); mmproj en F16 y Q8_0 |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base original presumiblemente safetensors, no confirmado |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen/Qwen3.8-27B en los datos proporcionados: no se especifica si emplea atención completa, atención lineal, mezcla de expertos ni la composicion del dataset de entrenamiento. Lo que si se confirma es que el pipeline es image-text-to-text, es decir, acepta entradas de imagen y texto, y que existe un modo de razonamiento (thinking) activable o desactivable en tiempo de inferencia, lo que sugiere un entrenamiento con etapas de razonamiento extendido.

En cuanto al proceso de cuantizacion, Xylolabs documenta el uso de imatrix para la variante IQ4_XS (etiquetada `-imat`) y declara que Q3_K_M y Q2_K adoptan los tipos por tensor de los ficheros UD-Q3_K_XL y UD-Q2_K_XL de Unsloth, leidos directamente de sus cabeceras. La model card incluye una tabla de precision frente a BF16 con tres conjuntos de evaluacion (WikiText-2, Chat, Held-out) y dos metricas (KL y top-1), lo que permite elegir el nivel de cuantizacion en funcion del presupuesto de VRAM y la perdida de calidad aceptable.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con `--jinja`.
- Procesamiento de imagenes junto a texto (image-text-to-text) mediante los ficheros `mmproj` en F16 o Q8_0.
- Modo de razonamiento (thinking) opcional; puede desactivarse para obtener respuestas directas sin la pasada de razonamiento.
- Soporte multilingue limitado a ingles y coreano segun los metadatos del autor.
- Compatible con `llama-cli` y `llama-server` de llama.cpp, lo que habilita su integracion en endpoints compatibles (tag `endpoints_compatible`).
- Ejecucion en CUDA, Metal y CPU gracias al backend GGML.
- Capacidades de tool calling / function calling y de agentes: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local con privacidad de datos: con la cuantizacion Q4_K_M (16,6 GB) el modelo cabe en una GPU de 24 GB y permite desplegar un chatbot multi-turno sin enviar datos a la nube, usando `llama-server` como backend HTTP.
- Analisis de documentos con imagenes en escritorio: el par multimodal (`mmproj-Qwen3.8-27B-Q8_0.gguf` de 0,6 GB mas el modelo principal) permite describir capturas, diagramas o fotografias desde una aplicacion de escritorio con GPU de consumo.
- Prototipado rapido en CPU: la variante Q2_K (9,9 GB) o IQ3_M (12,8 GB) permite probar el modelo en equipos sin GPU dedicada, aceptando la perdida de calidad documentada (top-1 del 85,1 % en WikiText-2 para Q2_K frente al 98,7 % de Q8_0).
- Traduccion y asistencia en ingles-coreano: el modelo declara soporte de ambos idiomas, adecuado para herramientas internas de traduccion o atencion al cliente en esos mercados.
- Generacion de codigo asistida en IDE local: con Q5_K_M (19,5 GB) en una RTX 4090 se obtiene un equilibrio razonable entre calidad (top-1 del 96,9 % en WikiText-2) y velocidad, integrable mediante la API de `llama-server`.
- Investigacion sobre cuantizacion: la tabla de precision del autor (32 variantes comparadas, incluidas las de Unsloth) sirve como referencia empirica para estudiar el impacto de KL y top-1 segun el nivel de bits en un modelo de 27B.
- Despliegue en entornos Apple Silicon: el soporte Metal de llama.cpp permite ejecutar Q4_K_M o Q5_K_M en Mac con memoria unificada de 24-32 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo proporciona metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | WikiText-2 top-1 | Chat KL | Chat top-1 | Held-out KL | Held-out top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 29,047 GB | 0,000867 | 98,672 % | 0,002304 | 99,059 % | 0,001067 | 98,794 % |
| Q6_K | 22,431 GB | 0,002161 | 97,951 % | 0,004358 | 98,245 % | 0,003333 | 97,824 % |
| Q5_K_M | 19,536 GB | 0,004578 | 96,902 % | 0,008445 | 97,598 % | 0,008101 | 96,794 % |
| Q4_K_M | 16,564 GB | 0,010464 | 95,574 % | 0,019746 | 95,745 % | 0,019950 | 95,412 % |
| IQ4_XS-imat | 15,309 GB | 0,017617 | 94,157 % | 0,032862 | 94,598 % | 0,032699 | 93,775 % |
| Q3_K_M | 13,146 GB | 0,037681 | 91,431 % | 0,059795 | 92,784 % | 0,071429 | 91,186 % |
| Q2_K | 9,949 GB | 0,118005 | 85,118 % | 0,153745 | 87,588 % | 0,200785 | 83,539 % |

Para comparar, las variantes de Unsloth UD-Q8_K_XL (31,458 GB) alcanzan un KL de 0,000667 en WikiText-2 y las UD-IQ1_S (6,192 GB) caen hasta un top-1 del 73,931 %. No se dispone de latencia ni throughput medidos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero mas overhead de contexto y KV cache. Q8_0 requiere ~29 GB, Q6_K ~22,4 GB, Q5_K_M ~19,5 GB, Q4_K_M ~16,6 GB, IQ4_XS-imat ~15,3 GB, Q3_K_M ~13,1 GB, Q2_K ~9,9 GB. El proyector multimodal anade 0,6-0,9 GB si se usa vision.
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 sin compromisos; RTX 4090 (24 GB) para Q5_K_M o Q4_K_M; RTX 3090 o RTX 4080 para Q4_K_M; GPUs de 12-16 GB para Q3_K_M o IQ3_M.
- Cabe en GPU de consumo: si, desde Q4_K_M en adelante en tarjetas de 16-24 GB. Q2_K (9,9 GB) cabe en GPUs de 12 GB.
- Opciones de despliegue: llama.cpp (commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8` o posterior), con `llama-cli` y `llama-server`. El tag `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI. No se confirma soporte de vLLM, Ollama ni TGI en la informacion proporcionada, aunque al ser GGUF estandar es probable que Ollama pueda importarlo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.8-27B-GGUF | 27,3B | no disponible | si (mmproj) | Apache 2.0 | GGUF |
| Qwen/Qwen3.8-27B (base) | 27,3B | no disponible | si | Apache 2.0 | safetensors (presumible) |
| Unsloth UD-Q4_K_XL (mismo base) | 27,3B | no disponible | si | Apache 2.0 | GGUF |
| Unsloth UD-Q8_K_XL (mismo base) | 27,3B | no disponible | si | Apache 2.0 | GGUF |

Las alternativas mas directas son las cuantizaciones de Unsloth del mismo modelo base, que ofrecen variantes dinamicas (UD) con mejor relacion tamano/calidad en algunos niveles: por ejemplo, UD-Q4_K_XL (17,659 GB) logra un top-1 de 96,608 % frente al 95,574 % de Q4_K_M (16,564 GB) a costa de ~1 GB mas. No se dispone de datos de otros modelos comparables de 27B multimodales en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta garantizado ni documentado.
- Alucinacion: no se proporcionan evaluaciones de factualidad ni de tasas de alucinacion; en un modelo de 27B es esperable un riesgo no despreciable en dominios especializados.
- Cuantizacion agresiva: por debajo de Q4_K_M la degradacion es notable (Q2_K baja al 85,1 % de top-1 en WikiText-2 y al 83,5 % en held-out); no se recomienda Q2_K ni IQ3_M para tareas sensibles a la precision.
- Contexto: la longitud maxima no se documenta; el ejemplo oficial usa 8192 tokens, por lo que no debe asumirse una ventana mayor sin verificacion.
- Vision: requiere cargar el fichero `mmproj` correspondiente; sin el, el modelo funciona solo como text-to-text.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base Qwen/Qwen3.8-27B por si imponen condiciones adicionales de atribucion.
- Reproducibilidad: la model card fija un commit concreto de llama.cpp; versiones anteriores pueden no cargar correctamente los tensores o la plantilla de chat.
- Modo thinking: activado por defecto puede incrementar la latencia y el consumo de tokens; debe desactivarse explicitamente si no se necesita.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.8-27B-GGUF/blob/main/LICENSE
- llama.cpp (commit fijado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Cuantizaciones de referencia Unsloth (mismo base): no se proporciona URL directa en la informacion disponible.
