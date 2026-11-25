# Xylolabs/Mistral-7B-v0.3-GGUF

## Resumen

Xylolabs/Mistral-7B-v0.3-GGUF es una cuantización en formato GGUF del modelo base mistralai/Mistral-7B-v0.3, publicada por Xylolabs. Se distribuye un único archivo, `Mistral-7B-v0.3-Q4_K_M.gguf`, de 4,373 GB, pensado para su ejecución con llama.cpp. El modelo subyacente es un transformer decoder-only de 7.248.023.552 parámetros (aproximadamente 7,25 mil millones) entrenado por Mistral AI, con una longitud de contexto de 32.000 tokens en su versión v0.3.

La relevancia de esta ficha reside en que empaqueta un modelo base consolidado en un formato ligero y portable, lo que permite desplegarlo en GPUs de consumo (RTX 3090/4090 con 24 GB) manteniendo la ventana completa de 32K tokens. Al tratarse de un modelo base, no está ajustado por instrucciones ni alineado con RLHF, por lo que su uso previsto es la continuación de texto y el ajuste fino posterior, no el diálogo directo.

La cuantización Q4_K_M ofrece, según la model card, una divergencia KL de 0,010896 frente a BF16 en WikiText-2 y un top-1 del 94,877 %, con un tamaño de 4,373 GB. La licencia es Apache 2.0, heredada del modelo original, y los idiomas declarados son inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Mistral 7B v0.3) |
| Parametros totales | 7.248.023.552 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (32K) |
| Tipos de cuantizacion | Q4_K_M (único archivo publicado); la model card incluye métricas comparativas de Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M de llama.cpp |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Mistral 7B v0.3, un transformer decoder-only denso de 7,25 mil millones de parámetros con atención por ventana deslizante (sliding window attention) y RoPE, que en la versión v0.3 amplía el vocabulario y el contexto hasta 32.000 tokens. Esta publicación no entrena ni modifica los pesos: Xylolabs realiza la conversión a GGUF y la cuantización Q4_K_M, y conserva la licencia Apache 2.0 del original.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; la model card remite a la release original de Mistral 7B v0.3 para esos datos. La innovación técnica de esta ficha es la propia cuantización: el archivo Q4_K_M reduce el peso a 4,373 GB con una pérdida medida de divergencia KL de 0,010896 en WikiText-2 y 94,877 % de top-1, y la model card documenta la curva de precisión frente a tamaño para Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q3_K_M.

## Capacidades

- Generación de texto y continuación de secuencias (modelo base, sin ajuste por instrucciones).
- Razonamiento y conocimiento general heredados de Mistral 7B v0.3.
- Capacidad de ajuste fino posterior (fine-tuning) para tareas concretas, al ser un modelo base.
- Ventana de contexto de 32K tokens, adecuada para documentos largos.
- Multilingüismo limitado a los idiomas declarados (inglés y coreano).
- No incluye modo thinking, visión, audio ni tool calling nativo en esta publicación.
- Ejecución local mediante llama.cpp con `llama-completion` y prompts de continuación.

## Casos de uso

- Continuación de texto y generación de borradores: se usa con `llama-completion -f prompt.txt -no-cnv` para completar prefijos de texto en tareas de redacción o documentación técnica.
- Ajuste fino específico de dominio: al ser un modelo base Apache 2.0, sirve como punto de partida para fine-tuning en dominios como legal, médico o atención al cliente, con la ventaja de caber en una sola RTX 4090.
- Procesamiento de documentos largos: sus 32K tokens de contexto permiten resumir o extraer información de contratos, informes o artículos extensos en una sola pasada.
- Despliegue en hardware de consumo: el archivo Q4_K_M de 4,4 GB se ejecuta en RTX 3090/4090 con 24 GB a contexto completo, lo que facilita prototipado local sin infraestructura cloud.
- Generación de código asistida en pipelines internos: puede completar fragmentos de código y servir como base para ajuste fino con datos propios de un repositorio.
- Investigación en cuantización: la tabla de precisión frente a tamaño (KL y top-1) permite evaluar el compromiso entre calidad y memoria para distintas configuraciones de llama.cpp.
- Traducción y generación en inglés y coreano: útil para contenidos bilingües en esos dos idiomas, con las limitaciones propias de un modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card solo incluye métricas de fidelidad de la cuantización frente a BF16 medidas con llama.cpp:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 7,703 GB | 0,000309 | 99,132 % | 0,000491 | 99,010 % |
| llama.cpp Q6_K | 5,947 GB | 0,001637 | 98,186 % | 0,002647 | 97,412 % |
| llama.cpp Q5_K_M | 5,136 GB | 0,003555 | 97,309 % | 0,004722 | 96,529 % |
| Q4_K_M | 4,373 GB | 0,010896 | 94,877 % | 0,013479 | 94,078 % |
| llama.cpp Q3_K_M | 3,523 GB | 0,036458 | 90,975 % | 0,049412 | 89,000 % |

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 4,373 GB; la model card recomienda sumar la caché KV en f16 al contexto usado más 2 GB para el runtime, y que el total quede por debajo del 90 % de la memoria.
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) a 32K de contexto; RTX 5090 (32 GB); RTX 6000 Ada o 2 × 24 GB (48 GB); H100 (80 GB); RTX PRO 6000 Blackwell (96 GB); H200 (141 GB); B200 (192 GB); B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 3090/4090 con 24 GB a contexto completo de 32K según la tabla del autor.
- Opciones de despliegue: llama.cpp (build verificado `cd959bae99ff4bed22bef2604f45241c09bbb8c8`), con `llama-completion`; el formato GGUF es compatible además con otros runners habituales del ecosistema.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Mistral-7B-v0.3-GGUF | 7,25 B | 32K | GGUF Q4_K_M | Apache 2.0 | Cuantización de Mistral 7B v0.3, sin benchmarks estándar publicados |
| mistralai/Mistral-7B-v0.3 | 7,25 B | 32K | safetensors | Apache 2.0 | Modelo original en BF16; mayor tamaño y precisión de referencia |
| Otras cuantizaciones GGUF de Mistral 7B v0.3 | 7,25 B | 32K | GGUF | Apache 2.0 | Alternativas del ecosistema; datos de precisión no disponibles en esta ficha |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones ni mantiene diálogo de forma fiable sin fine-tuning previo.
- Riesgo de alucinación y de generar contenido sesgado o incorrecto, inherente a los modelos de lenguaje sin alineación.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está garantizado.
- La cuantización Q4_K_M introduce una pérdida medible (KL de 0,010896 en WikiText-2, top-1 del 94,877 %) frente a BF16.
- Solo se publica un archivo Q4_K_M; no hay variantes de mayor o menor precisión en este repositorio.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y citar la release original de Mistral 7B v0.3.
- El repositorio tiene 336 descargas y 0 likes en el momento de la consulta; conviene validar la calidad de la cuantización en el caso de uso concreto.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-v0.3-GGUF
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-v0.3
- llama.cpp (build verificado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
