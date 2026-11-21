# Xylolabs/TML-d24-varloop-research-GGUF

## Resumen

TML-d24-varloop-research es un modelo multimodal de investigación desarrollado por Thinking Machines Lab que acepta entradas de texto e imagen y genera texto. Se trata de la variante de bucle variable (variable-looped) de Inkling 2 Mini: mientras que este último ejecuta sus capas con bucle un número fijo de veces, en TML-d24-varloop-research el número de pasadas por dichas capas puede elegirse en tiempo de inferencia, lo que permite estudiar cómo afecta el cómputo recurrente adicional a la computación interna y a las capacidades del modelo sobre un mismo conjunto de pesos.

El modelo se publica con pesos abiertos bajo licencia Apache 2.0 y está pensado como herramienta de investigación sobre arquitecturas con bucles. Cuenta con aproximadamente 26.070 millones de parámetros totales, es de tipo Mixture of Experts (MoE) y se distribuye en precisión mixta nativa NVFP4/MXFP8/BF16, sin necesidad de cuantización adicional.

La ficha que nos ocupa corresponde a la conversión a GGUF realizada por Xylolabs para su uso con llama.cpp en CUDA, Metal o CPU, con la torre de visión en archivos `mmproj` separados y el drafter MTP excluido del paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle variable (basada en Inkling 2 Mini) |
| Parametros totales | 26.070.390.272 (~26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de llama.cpp usa `-c 32768`) |
| Tipos de cuantizacion | NVFP4 (expertos, pesos originales) + BF16; NVFP4 + Q8_0; torre de visión en BF16 o Q8_0 |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

TML-d24-varloop-research es un transformer de tipo Mixture of Experts con capas en bucle, es decir, un subconjunto de capas que se recorren repetidamente. La innovación principal es que el número de pasadas por esas capas se fija al cargar el modelo (3 por defecto en la conversión GGUF) y puede modificarse mediante `--override-kv inkling2_loop.loop.count=int:N`, lo que permite comparar el efecto del cómputo recurrente sobre un único conjunto de pesos. El checkpoint original usa precisión mixta nativa: capas de expertos en NVFP4, las cuatro últimas en MXFP8 y el resto en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card original tampoco detalla innovaciones adicionales como decodificación especulativa; sí se menciona que el modelo base incluye un drafter MTP (`mtp.safetensors`) que la conversión GGUF deja fuera.

## Capacidades

- Generación de texto a partir de entradas de texto e imagen (pipeline `image-text-to-text`).
- Razonamiento y comprensión multimodal básica mediante la torre de visión incluida en los archivos `mmproj`.
- Conversación multi-turno (etiqueta `conversational` en el repo).
- Soporte multilingüe general, con inglés como idioma principal.
- Ejecución local con llama.cpp en CUDA, Metal o CPU.
- Posibilidad de ajustar el número de bucles en tiempo de carga para experimentar con el cómputo recurrente.
- No se ha documentado soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Investigación sobre modelos con bucles: permite comparar el comportamiento del mismo conjunto de pesos con distinto número de pasadas por las capas recurrentes, aislando el efecto del cómputo adicional.
- Análisis de eficiencia computacional: al variar `loop.count` se puede medir la relación entre cómputo recurrente y calidad de salida en tareas concretas.
- Despliegue local en estaciones de trabajo: con la cuantización NVFP4+Q8_0 (17,63 GB) cabe en GPUs de consumo alto o en Mac con memoria unificada, lo que facilita experimentación sin infraestructura de servidor.
- Prototipado multimodal: la torre de visión separada permite probar tareas imagen-texto en entornos con llama.cpp antes de escalar a otros frameworks.
- Evaluación de cuantizaciones: los dos archivos GGUF (NVFP4+BF16 y NVFP4+Q8_0) permiten estudiar la degradación de calidad frente al checkpoint original.
- Reproducibilidad académica: al ser pesos abiertos con licencia Apache 2.0, sirve para replicar experimentos sobre arquitecturas recurrentes en publicaciones.
- Integración en pipelines de investigación con vLLM, SGLang o TokenSpeed, que el autor del modelo base documenta como compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El checkpoint original requiere al menos 32 GB de VRAM o memoria unificada.
- Configuraciones de referencia citadas por el autor: 1x NVIDIA DGX Spark, 1x GPU NVIDIA con 32 GB o más (RTX 5090, RTX PRO 6000 Blackwell) o Mac con Apple Silicon y 32 GB o más de memoria unificada.
- En GGUF: el archivo NVFP4+Q8_0 ocupa 17,63 GB y el NVFP4+BF16 22,92 GB, más la torre de visión (641,81 MB en BF16 o 345,91 MB en Q8_0).
- Despliegue con llama.cpp desde el commit `29b52d39` (PR #32694) en adelante; compilación con `-DGGML_CUDA=ON` para NVIDIA.
- El modelo base también es compatible con Hugging Face, SGLang, vLLM, TokenSpeed, NVIDIA Dynamo, Unsloth, Llama App, Ollama y Exo Labs (estos dos últimos en Apple Silicon).
- No se dispone de datos de latencia ni throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TML-d24-varloop-research (esta ficha, GGUF) | ~26,07 mil millones | no disponible | Texto + imagen | Apache 2.0 | Pesos abiertos (GGUF y safetensors) |
| Inkling 2 Mini (modelo base de referencia) | no disponible | no disponible | Texto + imagen | Apache 2.0 | Pesos abiertos |
| Otras alternativas MoE multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con Inkling 2 Mini, del que TML-d24-varloop-research es la variante de bucle variable; no se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado como producto final ni se distribuye mediante API (incluido Tinker).
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad.
- Idiomas: el soporte principal es el inglés; el multilingüe es genérico y no está cuantificado.
- Longitud de contexto no documentada; el ejemplo de llama.cpp usa 32768 tokens, pero no se confirma como máximo.
- La licencia Apache 2.0 va acompañada de la Model Acceptable Use Policy de Thinking Machines, que hay que respetar en producción.
- Xylolabs no está afiliado ni respaldado por Thinking Machines Lab; la conversión GGUF es de terceros.
- El drafter MTP no está incluido en el paquete GGUF, por lo que no se dispone de decodificación especulativa con estos archivos.
- El número de bucles se fija al cargar el modelo; cambiarlo requiere reiniciar el proceso de inferencia.
- Sin datos publicados de sesgos, benchmarks o robustez.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Xylolabs/TML-d24-varloop-research-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Model Acceptable Use Policy: https://thinkingmachines.ai/model-acceptable-use-policy/
- llama.cpp (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/29b52d398b294509746ec0a3f28948a3107c0213
- Blog de Inkling 2 Mini en Hugging Face: https://hf.co/blog/inkling2mini
- Receta SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-2-Mini
- Receta vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-2-Mini
- TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#inkling-2-mini
- Unsloth: https://unsloth.ai/docs/inkling-2-mini
- Llama App: https://llama.app/
- Miles (post-entrenamiento): https://miles.radixark.com/docs/models/thinkingmachines/inkling-2-mini
