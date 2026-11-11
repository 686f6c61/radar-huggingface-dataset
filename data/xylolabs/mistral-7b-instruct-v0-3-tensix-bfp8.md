# Xylolabs/Mistral-7B-Instruct-v0.3-Tensix-BFP8

## Resumen

Mistral-7B-Instruct-v0.3-Tensix-BFP8 es una cuantización del modelo mistralai/Mistral-7B-Instruct-v0.3 realizada por Xylolabs, orientada específicamente a las NPU Tensix de Tenstorrent (Wormhole y Blackhole). El modelo conserva la arquitectura transformer densa de Mistral-7B-Instruct-v0.3, con 7.248.023.552 parámetros, y sustituye el formato de sus capas lineales por `ttnn.bfloat8_b` (block floating point de 8 bits), de forma que las matrices ya quedan alineadas a la rejilla que espera el runtime TT-NN y no requieren un redondeo adicional al empaquetarse en el dispositivo.

La propuesta resuelve un problema de despliegue: ejecutar un modelo conversacional de 7B en hardware Tensix sin degradar la calidad de forma apreciable. Según la model card, el checkpoint ocupa 7,95 GB empaquetado (8,78 bits por peso de media) frente a 14,50 GB del BF16 original, manteniendo una KL media de 0,00070 respecto al modelo base y un top-1 del 98,85 % en la evaluación publicada.

Es relevante ahora porque el ecosistema de Tenstorrent (tt-metal, TT-NN, tt-forge) está consolidando sus toolchains y este checkpoint proporciona pesos ya preparados para ellas, con scripts de verificación y compatibilidad con `transformers` y `text-generation-inference`. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Mistral-7B-Instruct-v0.3), capas lineales en block floating point bfloat8_b |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP8 (`ttnn.bfloat8_b`) en q, k, v, o y gate, up, down de las 32 capas; LM head, embedding y normas en bf16 |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16 almacenado, valores en la rejilla BFP8); tamaño del repo 14,5 GB, 7,95 GB empaquetado |

## Arquitectura y entrenamiento

El modelo parte de Mistral-7B-Instruct-v0.3, un transformer denso de 7B parámetros con atención de ventana deslizante en el modelo base. Xylolabs no reentrena el modelo: aplica GPTQ para redondear las proyecciones lineales (atención q/k/v/o y MLP gate/up/down en las 32 capas) a la rejilla `ttnn.bfloat8_b`, un formato de coma flotante por bloques con exponente compartido. La calibración se realizó sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. El resultado son 8,5 bits por peso en esas matrices y 8,78 bits por peso de media, con 7,95 GB empaquetados.

Los tensores se almacenan en safetensors en bf16, pero cada valor ya está situado en la rejilla BFP8, de modo que TT-NN los empaqueta sin volver a redondear. El archivo `quant4.json` documenta el formato de cada proyección. La evaluación reportada incluye una KL media de 0,00070 frente al BF16, un top-1 del 98,85 % y 24 de 33 respuestas correctas (frente a 25 de 33 del BF16), sin pérdidas adicionales respecto a Q4_K_M. Las pruebas en hardware se hicieron con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole, no sobre silicio real; en tt-transformers, con `--use_hf_rope`, las proyecciones de las dos primeras capas empaquetaron de forma exacta y un prefill de 2 capas coincidió con transformers con PCC 0,9995.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Mistral-7B-Instruct-v0.3.
- Razonamiento y respuesta a instrucciones en formato chat (plantilla de chat de Mistral).
- Generación de código y matemáticas a nivel de un modelo de 7B (no se han publicado evaluaciones específicas en la información disponible).
- Compatibilidad con `transformers` (`AutoModelForCausalLM`) y con `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`).
- Despliegue en NPU Tensix mediante TT-NN (`ttnn.as_tensor` con `ttnn.bfloat8_b`) y en tt-transformers (tt-metal v0.81.1).
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multimodales o de audio: no disponibles; el modelo es solo de texto.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia conversacional en NPU Tenstorrent: el checkpoint está pensado para cargarse directamente en Wormhole o Blackhole con TT-NN, aprovechando que los pesos ya están en la rejilla BFP8 y evitando el redondeo en el dispositivo. Adecuado para equipos que despliegan LLMs en aceleradores Tensix.
- Servicio de chat con `text-generation-inference`: al estar etiquetado como `endpoints_compatible`, puede servirse detrás de una API compatible con TGI y consumirse desde aplicaciones cliente sin cambios en el código.
- Asistente de atención al cliente: un modelo de 7B instruido puede gestionar conversaciones multi-turno; el tamaño reducido (7,95 GB empaquetado) permite alojarlo en un único acelerador.
- Generación y revisión de código en pipelines de desarrollo: útil para autocompletado, explicación de fragmentos y generación de tests, siempre que se valide la salida; no se han publicado métricas HumanEval en la información disponible.
- Prototipado e investigación en cuantización: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar que cada matriz empaquetada coincide bit a bit con la versión bf16, lo que lo convierte en una referencia para estudiar el impacto de BFP8 en la calidad.
- Evaluación comparativa de formatos de cuantización: la model card ofrece KL y top-1 frente a BF16 y Q4_K_M, útil para decidir entre BFP8 en Tensix y cuantizaciones de 4 bits en otras plataformas.
- Despliegue en entornos con restricciones de memoria: al ocupar aproximadamente la mitad que el BF16, encaja en configuraciones donde el modelo original no cabría.

## Benchmarks y rendimiento

| Modelo | Bits por peso | Tamaño (GB) | KL media vs BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (Mistral-7B-Instruct-v0.3) | 16 | 14,50 | 0 | 100 | 25 de 33 | - |
| Este modelo (BFP8) | 8,78 | 7,953 | 0,00070 | 98,85 | 24 de 33 | 0 |
| Q4_K_M (llama.cpp) | 4,83 | 4,373 | 0,02242 | 93,39 | 24 de 33 | 0 |

La KL y el top-1 cubren 16.288 posiciones según la model card. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 7,95 GB empaquetado en BFP8; el repo en disco ocupa 14,5 GB porque los tensores se almacenan en bf16.
- Hardware objetivo: NPU Tensix de Tenstorrent, Wormhole y Blackhole. Las pruebas se realizaron con ttnn 0.81.1 sobre ttsim (simulador de Blackhole), no sobre hardware físico.
- GPU convencionales: el modelo puede cargarse con `transformers` en bf16 (`dtype="bfloat16"`, `device_map="auto"`), pero en ese caso no se aprovecha el empaquetado BFP8 y se comporta como un 7B en bf16 (unos 14,5 GB). Cabe en GPUs de 16 GB o más; no se han publicado cifras de latencia o throughput.
- Despliegue: TT-NN (tt-metal v0.81.1), tt-transformers con `--use_hf_rope`, tt-forge (tt-xla, aún no probado con este checkpoint), `transformers` y `text-generation-inference`. No se menciona soporte de llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3-Tensix-BFP8 | 7,25B | No disponible | BFP8 (8,78 bits/peso) | Apache-2.0 | Hugging Face (Xylolabs) |
| mistralai/Mistral-7B-Instruct-v0.3 (BF16) | 7,25B | No disponible | BF16 | Apache-2.0 | Hugging Face (oficial) |
| Mistral-7B-Instruct-v0.3 Q4_K_M (llama.cpp) | 7,25B | No disponible | 4,83 bits/peso | Apache-2.0 | Hugging Face (comunidad) |

Frente al BF16, este checkpoint reduce el tamaño a aproximadamente la mitad con una KL de 0,00070 y una pérdida de un punto porcentual en top-1. Frente a Q4_K_M, ocupa más espacio (7,95 GB frente a 4,37 GB) pero conserva mucha más fidelidad (KL 0,00070 frente a 0,02242; top-1 98,85 % frente a 93,39 %), con el mismo número de respuestas correctas en la evaluación de 33 preguntas. Su ventaja específica es el empaquetado nativo para Tensix, que las otras dos alternativas no ofrecen.

## Limitaciones y advertencias

- No se ha validado en hardware Tensix real: las pruebas se hicieron con ttsim (simulador de Blackhole). El rendimiento y la corrección en silicio físico están pendientes de confirmar.
- tt-forge (tt-xla) no se ha ejecutado con este checkpoint; además, sus opciones `bfp_bf8` y `bfp_bf4` re-redondean los valores y pueden alterar el resultado.
- El demo de tt-transformers empaqueta la LM head en bfloat8_b, mientras que este checkpoint la mantiene en bf16, por lo que esa parte no es exacta en dicho demo. Es necesario usar `--use_hf_rope`.
- Riesgo de alucinación inherente a un modelo de 7B; no se han publicado evaluaciones de sesgo ni de robustez en la información disponible.
- Idiomas soportados no documentados; la calibración incluyó coreano además de inglés, pero no hay garantías formales de calidad multilingüe.
- Longitud de contexto no indicada en la información disponible; conviene consultar la model card del modelo base.
- Licencia Apache-2.0, que permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de las herramientas de Tenstorrent utilizadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario muy limitados.
- El repo ocupa 14,5 GB en disco aunque el modelo empaquetado sea de 7,95 GB, lo que afecta al almacenamiento y a la transferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tensix-BFP8
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia del modelo: https://huggingface.co/Xylolabs/Mistral-7B-Instruct-v0.3-Tensix-BFP8/blob/main/LICENSE
