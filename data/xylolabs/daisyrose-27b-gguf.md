# Xylolabs/DaisyRose-27B-GGUF

## Resumen

DaisyRose-27B-GGUF es la distribucion en formato GGUF del modelo multimodal RadixArk/DaisyRose-27B, un fine-tune de Qwen3.8-27B publicado por Xylolabs. El modelo original es capaz de procesar entradas de imagen y texto (pipeline image-text-to-text) y este repositorio ofrece los pesos cuantizados para su ejecucion en llama.cpp sobre CUDA, Metal o CPU, incluyendo el proyector de vision necesario para la entrada de imagenes.

Con 27.320.697.856 parametros totales, el modelo se situa en la categoria de modelos densos de ~27B, un tamano que permite su despliegue en una unica GPU de 24 GB con cuantizacion Q4_K_M (16,6 GB) manteniendo una ventana de contexto de 32K tokens, o en GPUs profesionales y Apple Silicon con cuantizaciones Q8_0 y contextos de hasta 256K. La licencia Apache 2.0 facilita su uso comercial sin restricciones adicionales.

Su relevancia actual radica en que combina capacidades multimodales (entrada de imagen) con un formato de pesos optimizado para inferencia local, con un conjunto de cuantizaciones que van desde Q2_K (11,2 GB) hasta Q8_0 (29,0 GB) y con metricas de divergencia KL y precision top-1 publicadas frente al modelo BF16, lo que permite elegir el compromiso tamano/calidad con datos concretos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (fine-tune de Qwen3.8-27B), con proyector de vision multimodal |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | hasta 256K segun hardware; 32K en GPUs de 24 GB; ejemplo de ejecucion con `-c 32768` |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ3_M, Q2_K; proyector de vision en F16 y Q8_0 |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base RadixArk/DaisyRose-27B es un fine-tune de Qwen3.8-27B, por lo que hereda la arquitectura transformer denso de esa familia, con 27.320.697.856 parametros. La model card no detalla la composicion del dataset de fine-tuning, el numero de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. El pipeline declarado es image-text-to-text, lo que implica la presencia de un proyector de vision que se distribuye por separado en los ficheros `mmproj-DaisyRose-27B-F16.gguf` (0,928 GB) y `mmproj-DaisyRose-27B-Q8_0.gguf` (0,629 GB).

La contribucion tecnica de este repositorio es la conversion y cuantizacion de los pesos a GGUF para llama.cpp, con un fichero de calibracion imatrix (`DaisyRose-27B.imatrix.gguf`) que se emplea para generar las cuantizaciones de la familia IQ. La model card documenta explicitamente que el modelo "piensa por defecto" (modo thinking), y que este comportamiento puede desactivarse pasando `--chat-template-kwargs '{"enable_thinking":false}'` al servidor. Se requiere llama.cpp release b12531 o posterior.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con `--jinja`.
- Entrada de imagen ademas de texto (image-text-to-text), mediante el proyector de vision distribuido aparte.
- Modo thinking activado por defecto, con posibilidad de desactivarlo para respuestas directas.
- Capacidades multilingues limitadas a ingles (en) y coreano (ko) segun los metadatos del modelo.
- Compatible con endpoints (tag `endpoints_compatible`), lo que permite su exposicion como API mediante `llama-server`.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni razonamiento agentico multi-paso.

## Casos de uso

- Descripcion y analisis de imagenes en local: usando `llama-mtmd-cli` con `--image`, el modelo puede generar descripciones o responder preguntas sobre una fotografia sin enviar datos a un servicio externo, lo que resulta adecuado para entornos con requisitos de privacidad.
- Asistente conversacional autoalojado: con `llama-server` y la plantilla Jinja, se puede desplegar un endpoint compatible con la API de chat para integrarlo en aplicaciones internas, aprovechando la licencia Apache 2.0 para uso comercial.
- Procesamiento de documentos con contexto largo: con Q8_0 en una H100 o en Apple Silicon de 128 GB o mas, la ventana de 256K tokens permite analizar documentos extensos o conversaciones muy largas en una sola pasada.
- Despliegue en estaciones de trabajo con GPU de consumo: la cuantizacion Q4_K_M (16,6 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con 32K de contexto, lo que habilita prototipado y desarrollo local sin infraestructura de servidor.
- Aplicaciones bilingues ingles-coreano: el modelo declara soporte para en y ko, por lo que es adecuado para tareas de traduccion, atencion al cliente o generacion de contenido en esos dos idiomas.
- Inferencia en Apple Silicon: las cuantizaciones Q8_0 y Q6_K se ejecutan sobre Metal en Mac Studio con memoria unificada, permitiendo servir el modelo en equipos de escritorio de gama alta sin GPU dedicada.
- Evaluacion comparativa de cuantizaciones: las metricas de KL y top-1 publicadas permiten seleccionar el fichero concreto segun el compromiso aceptable entre tamano y fidelidad, util en pipelines de investigacion sobre cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye metricas de fidelidad de cuantizacion frente al modelo BF16:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Q8_0 | 29,05 GB | 0,000878 | 98,64% | 0,002308 | 98,66% | 0,001049 | 98,92% |
| Q6_K | 22,43 GB | 0,002243 | 97,81% | 0,004416 | 98,25% | 0,003307 | 98,05% |
| Q5_K_M | 19,64 GB | 0,004663 | 96,89% | 0,008288 | 97,57% | 0,007632 | 96,83% |
| Q4_K_M | 16,65 GB | 0,010676 | 95,28% | 0,017864 | 95,64% | 0,020638 | 95,44% |
| IQ4_XS | 15,54 GB | 0,017650 | 94,11% | 0,023140 | 95,07% | 0,030512 | 94,15% |
| IQ3_M | 12,97 GB | 0,038040 | 91,00% | 0,044205 | 93,39% | 0,064674 | 91,31% |
| Q2_K | 11,22 GB | 0,145947 | 83,52% | 0,147133 | 87,59% | 0,215827 | 83,48% |

## Requisitos de hardware

- VRAM estimada: desde 11,2 GB (Q2_K) hasta 29,0 GB (Q8_0); Q4_K_M ocupa 16,6 GB y Q6_K 22,4 GB. El proyector de vision anade 0,629 GB (Q8_0) o 0,928 GB (F16).
- GPU recomendadas segun la model card: RTX 4090 o RTX 3090 (24 GB) con Q4_K_M y 32K de contexto; RTX 5090 (32 GB) con Q6_K y 32K; RTX 6000 Ada o 2 x 24 GB (48 GB) con Q8_0 y 128K; H100, H200, B200, B300 y RTX PRO 6000 Blackwell con Q8_0 y 256K.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con Q4_K_M, y en RTX 5090 con Q6_K.
- Opciones de despliegue: llama.cpp (compilacion con `-DGGML_CUDA=ON` para NVIDIA), usando `llama-server` para API y `llama-mtmd-cli` para entrada de imagen; soporte de Metal y CPU. Se requiere release b12531 o posterior.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| DaisyRose-27B-GGUF | 27,3B | hasta 256K | Apache 2.0 | GGUF |
| RadixArk/DaisyRose-27B (base) | 27,3B | no disponible | Apache 2.0 | safetensors (presumiblemente) |
| Alternativas de ~27B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y coreano; el rendimiento en castellano no esta documentado y no deberia asumirse.
- Alucinacion: no se han publicado evaluaciones de fiabilidad ni de tasas de alucinacion en la informacion disponible.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la model card.
- Fidelidad de cuantizacion: las cuantizaciones bajas degradan notablemente la calidad; Q2_K cae a 83,52% de top-1 en WikiText-2 frente a 98,64% de Q8_0, por lo que no es recomendable para produccion.
- Modo thinking: activado por defecto, lo que incrementa la latencia y el consumo de tokens si no se desactiva explicitamente.
- Tool calling y agentes: no se documenta soporte en la informacion disponible; conviene verificarlo antes de disenar flujos agenticos.
- Dependencia de version: requiere llama.cpp b12531 o posterior; versiones anteriores pueden no cargar correctamente los ficheros.
- Vision: el proyector debe descargarse y pasarse por separado con `--mmproj`; sin el, la entrada de imagen no funciona.
- Licencia: Apache 2.0 permite uso comercial, pero se debe conservar el fichero LICENSE y verificar las condiciones del modelo base RadixArk/DaisyRose-27B.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF
- Modelo base: https://huggingface.co/RadixArk/DaisyRose-27B
- Licencia: https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF/blob/main/LICENSE
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de Xylolabs (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Graficas de precision: https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF/resolve/main/accuracy-kl-by-size.png y https://huggingface.co/Xylolabs/DaisyRose-27B-GGUF/resolve/main/accuracy-top1-by-size.png
