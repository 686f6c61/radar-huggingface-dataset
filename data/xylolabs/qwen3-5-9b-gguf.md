# Xylolabs/Qwen3.5-9B-GGUF

## Resumen

Xylolabs/Qwen3.5-9B-GGUF es una cuantización en formato GGUF del modelo Qwen3.5-9B, desarrollado originalmente por el equipo Qwen (Alibaba). Este repositorio, publicado por Xylolabs, distribuye los pesos convertidos y cuantizados para su uso con llama.cpp y otras herramientas compatibles con GGUF, orientados a generación de texto. Se trata, por tanto, de un artefacto de despliegue y no de un modelo entrenado desde cero: el trabajo del autor consiste en la conversión a GGUF y la cuantización, con validación de precisión frente a BF16.

El modelo base cuenta con 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) y está pensado para generación de texto conversacional. La model card declara soporte de una ventana de contexto de 256K tokens en las recomendaciones de hardware, e incluye el módulo de predicción multi-token (multi-token prediction) en el fichero GGUF. El repositorio incluye únicamente una cuantización publicada, Q4_K_M, de 5,780 GB, aunque la tabla de precisión compara numerosas variantes de otros autores (Unsloth y llama.cpp).

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~9B parámetros con contexto muy largo en hardware de consumo, algo viable gracias a la cuantización Q4_K_M. La licencia Apache 2.0 facilita el uso comercial, y la disponibilidad en GGUF lo hace compatible con el ecosistema llama.cpp, Ollama y servidores compatibles con la API de endpoints. No obstante, la información publicada es limitada: no se detallan datos de entrenamiento del modelo base ni resultados de benchmarks de capacidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-9B; el GGUF es una conversión para llama.cpp) |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 256K tokens (según tabla de recomendaciones de hardware de la model card) |
| Tipos de cuantización | Q4_K_M (única publicada en el repo); la tabla de precisión compara además Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_1, Q4_K_S, Q4_0, IQ4_NL, IQ4_XS, Q3_K_M, Q3_K_S, IQ3_XXS, IQ2_M, IQ2_XXS y variantes UD de Unsloth |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero `Qwen3.5-9B-Q4_K_M.gguf` de 5,780 GB |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-9B en la documentación proporcionada; la model card remite a la model card original de Qwen para la documentación de la familia y la cita. Lo que sí se documenta es que el fichero GGUF incluye el módulo de predicción multi-token (multi-token prediction), una innovación que permite predecir varios tokens por paso y que puede aprovecharse para decodificación especulativa o aceleración de la generación.

El proceso de este repositorio es de conversión y cuantización: Xylolabs convierte los pesos del modelo base a GGUF y los cuantiza a Q4_K_M. La model card incluye una tabla de precisión frente a BF16 con métricas de divergencia KL (WikiText-2 y held-out) y acuerdo top-1, comparando la cuantización propia con las de Unsloth y llama.cpp. Para Q4_K_M se reporta una KL de 0,039493 en WikiText-2 y 0,035054 en held-out, con un acuerdo top-1 del 91,426% y 91,775% respectivamente. No se detallan datos de entrenamiento (número de tokens, composición del dataset) ni si hubo RLHF/DPO en el modelo base.

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation).
- Razonamiento y generación de texto de propósito general, según la categoría del modelo base.
- Soporte de contexto largo: la model card recomienda configuraciones de hasta 256K tokens.
- Predicción multi-token integrada en el fichero GGUF, útil para decodificación especulativa.
- Compatibilidad con llama.cpp mediante `llama-cli -m ... --jinja`, lo que implica soporte de plantillas de chat Jinja.
- Idiomas declarados: inglés (en) y coreano (ko).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Visión o audio: no disponible; la model card indica que el GGUF contiene el modelo de texto para generación solo de texto.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en una RTX 4090 o 3090 (24 GB) con el fichero Q4_K_M de 5,8 GB, dejando margen para contexto largo, lo que permite desplegar un chatbot privado sin depender de la nube.
- Procesamiento de documentos extensos: con una ventana recomendada de hasta 256K tokens, es adecuado para resumir contratos, informes técnicos o transcripciones largas en una sola pasada, siempre que el hardware acompañe.
- Generación de texto en coreano e inglés: para aplicaciones de contenido o atención al cliente dirigidas a esos dos mercados, el modelo declara soporte nativo de ambos idiomas.
- Prototipado rápido con llama.cpp: la disponibilidad en GGUF y la instrucción de ejecución con `--jinja` permiten integrarlo en scripts y pipelines de prueba con mínima configuración.
- Despliegue en estaciones de trabajo y equipos Apple Silicon: la tabla de hardware incluye Mac Studio M5 Max/Ultra con memoria unificada, lo que facilita entornos de desarrollo sin GPU dedicada.
- Investigación sobre cuantización: la tabla de precisión (KL y top-1 frente a BF16) sirve como referencia para estudiar el impacto de distintas cuantizaciones en un modelo de ~9B.
- Servicio de inferencia compatible con la API de endpoints: las etiquetas del repositorio indican compatibilidad con endpoints, lo que permite integrarlo en infraestructuras de inferencia estandarizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo proporciona métricas de fidelidad de cuantización frente a BF16:

| Cuantización | Tamaño | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| Unsloth UD-Q8_K_XL | 12,974 GB | 0,001457 | 98,422% | 0,000732 | 98,716% |
| llama.cpp Q8_0 | 9,786 GB | 0,001778 | 98,461% | 0,000961 | 98,539% |
| Unsloth Q8_0 | 9,528 GB | 0,001778 | 98,461% | 0,000961 | 98,539% |
| Unsloth UD-Q6_K_XL | 8,757 GB | 0,001833 | 97,990% | 0,001501 | 98,137% |
| llama.cpp Q6_K | 7,559 GB | 0,009124 | 96,730% | 0,003776 | 97,147% |
| Unsloth Q6_K | 7,458 GB | 0,003474 | 97,402% | 0,002531 | 97,490% |
| Unsloth UD-Q5_K_XL | 6,744 GB | 0,007911 | 96,525% | 0,004858 | 96,608% |
| llama.cpp Q5_K_M | 6,643 GB | 0,014551 | 95,059% | 0,010181 | 95,422% |
| Unsloth Q5_K_M | 6,578 GB | 0,007391 | 96,534% | 0,005321 | 96,461% |
| Unsloth Q5_K_S | 6,361 GB | 0,008003 | 96,147% | 0,006166 | 96,324% |
| Unsloth UD-Q4_K_XL | 5,966 GB | 0,015051 | 94,775% | 0,013079 | 94,971% |
| Unsloth Q4_1 | 5,837 GB | 0,020373 | 93,647% | 0,019975 | 93,716% |
| **Q4_K_M (este repo)** | **5,780 GB** | **0,039493** | **91,426%** | **0,035054** | **91,775%** |
| Unsloth Q4_K_M | 5,681 GB | 0,017267 | 94,142% | 0,015687 | 94,480% |
| Unsloth Q4_K_S | 5,394 GB | 0,019275 | 93,779% | 0,019408 | 93,735% |
| Unsloth Q4_0 | 5,379 GB | 0,042499 | 90,735% | 0,043289 | 90,569% |
| Unsloth IQ4_NL | 5,371 GB | 0,024077 | 93,074% | 0,022871 | 92,804% |
| Unsloth IQ4_XS | 5,169 GB | 0,024093 | 92,961% | 0,023098 | 92,814% |
| Unsloth UD-Q3_K_XL | 5,054 GB | 0,043835 | 90,534% | 0,042723 | 90,931% |
| llama.cpp Q3_K_M | 4,738 GB | 0,127403 | 84,235% | 0,114989 | 85,225% |
| Unsloth Q3_K_M | 4,674 GB | 0,065423 | 88,632% | 0,066587 | 88,353% |
| Unsloth Q3_K_S | 4,317 GB | 0,113151 | 84,686% | 0,114260 | 84,696% |
| Unsloth UD-Q2_K_XL | 4,122 GB | 0,161607 | 82,564% | 0,167438 | 81,794% |
| Unsloth UD-IQ3_XXS | 4,016 GB | 0,107527 | 85,118% | 0,118880 | 85,480% |
| Unsloth UD-IQ2_M | 3,649 GB | 0,172803 | 81,755% | 0,191879 | 80,745% |
| Unsloth UD-IQ2_XXS | 3,191 GB | 0,386858 | 72,456% | 0,427578 | 71,980% |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 5,780 GB; con contexto largo y caché KV se necesita margen adicional. La model card recomienda 24 GB para contexto de 256K.
- GPU recomendadas: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 × 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) y RTX 5090 (32 GB) con el fichero Q4_K_M y contexto de 256K según la tabla del autor.
- Equipos con memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (`llama-cli -m Qwen3.5-9B-Q4_K_M.gguf --jinja`, verificado con la build cd959bae); el ecosistema GGUF permite además otros runners compatibles (Ollama, servidores GGUF), aunque no se detallan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de capacidad para comparar con modelos de la misma categoría. La comparativa disponible en la model card es exclusivamente entre cuantizaciones del mismo modelo base:

| Alternativa | Parámetros | Contexto | Licencia | Formato | Precisión relativa (Q4_K_M) |
|---|---|---|---|---|---|
| Xylolabs Qwen3.5-9B (este repo) | ~9,2B | 256K (recomendado) | Apache 2.0 | GGUF Q4_K_M | KL 0,0395 / top-1 91,4% |
| Unsloth Qwen3.5-9B Q4_K_M | ~9,2B | no disponible | Apache 2.0 (heredada) | GGUF Q4_K_M | KL 0,0173 / top-1 94,1% |
| llama.cpp Q8_0 | ~9,2B | no disponible | Apache 2.0 (heredada) | GGUF Q8_0 | KL 0,0018 / top-1 98,5% |
| Unsloth UD-Q8_K_XL | ~9,2B | no disponible | Apache 2.0 (heredada) | GGUF UD-Q8_K_XL | KL 0,0015 / top-1 98,4% |

Comparativa con modelos de otros autores: no disponible en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks de capacidad; no es posible evaluar su rendimiento en tareas como razonamiento, código o matemáticas a partir de la información disponible.
- La cuantización Q4_K_M de este repositorio muestra una divergencia KL frente a BF16 notablemente mayor que la de Unsloth Q4_K_M (0,0395 frente a 0,0173) y un acuerdo top-1 menor (91,4% frente a 94,1%); si la fidelidad es crítica, conviene valorar alternativas de cuantización.
- Idiomas declarados limitados a inglés y coreano; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible, pero es un riesgo inherente a los modelos generativos de este tamaño.
- Sesgos conocidos: no documentados en la información proporcionada.
- La ventana de contexto de 256K aparece en la tabla de recomendaciones de hardware, no como especificación formal del modelo base; conviene verificarla en la model card original de Qwen.
- Licencia Apache 2.0, que permite uso comercial; no obstante, deben respetarse las condiciones del modelo base y las licencias de las herramientas de conversión.
- El repositorio solo publica una cuantización (Q4_K_M); para otros tamaños hay que recurrir a las cuantizaciones de Unsloth o llama.cpp listadas en la tabla.
- La información sobre tool calling, agentes y modo thinking no está disponible; no debe asumirse su soporte sin verificar la model card del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF/blob/main/LICENSE
- Build de llama.cpp verificada: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio del autor (referenciado en la model card): https://github.com/XylolabsInc/tensix-bfp-gptq
- Gráfica de KL media: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF/resolve/main/accuracy-mean-kl.png
- Gráfica de acuerdo top-1: https://huggingface.co/Xylolabs/Qwen3.5-9B-GGUF/resolve/main/accuracy-top1.png
