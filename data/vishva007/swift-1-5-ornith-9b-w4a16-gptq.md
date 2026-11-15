# Vishva007/Swift-1.5-Ornith-9B-W4A16-GPTQ

## Resumen

Swift-1.5-Ornith-9B-W4A16-GPTQ es una versión cuantizada a 4 bits (W4A16) del modelo multimodal ukisai/Swift-1.5-Ornith-9B, publicada por el usuario Vishva007. El modelo base es un derivado de ornith-ai/Ornith-1.5-9B, afinado por UkisAI para reducir el consumo de tokens de razonamiento en aproximadamente un 33,1 % manteniendo (e incluso mejorando en +1,52 pp) la precisión en GPQA-Diamond. Esta ficha corresponde al checkpoint serializado en formato `auto_gptq`, pensado para motores compatibles con GPTQ/Marlin como vLLM o TGI.

La arquitectura es híbrida: combina 24 bloques de atención lineal GatedDeltaNet con 8 bloques de atención completa, un codificador de visión y una cabeza de predicción multi-token (MTP) de una capa. El checkpoint cuantizado conserva en BF16 los módulos sensibles (atención lineal, visión, MTP y `lm_head`) y cuantiza a INT4 las proyecciones de atención completa y MLP del modelo de lenguaje. El resultado es un modelo image-text-to-text de aproximadamente 4,1 mil millones de parámetros efectivos en disco, con licencia Apache 2.0 y soporte declarado de contexto de hasta 200K tokens en vLLM.

La relevancia de esta ficha radica en que ofrece una vía de despliegue de un modelo de razonamiento multimodal con arquitectura híbrida en hardware más modesto que el modelo original en BF16, manteniendo el modo "thinking" y el tool calling. La información pública disponible es limitada: procede casi exclusivamente de la model card del autor de la cuantización y no incluye benchmarks propios del checkpoint cuantizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `Qwen3_5ForConditionalGeneration`: 24 bloques GatedDeltaNet (atención lineal) + 8 bloques de atención completa, codificador de visión y cabeza MTP de 1 capa |
| Parámetros totales | 4.108.213.488 (según safetensors del repo cuantizado); el modelo base se denomina "9B" |
| Parámetros activos | no disponible (no se describe como MoE) |
| Longitud de contexto | 200K tokens (configuración de servicio indicada en la model card); contexto nativo del modelo base no disponible |
| Tipos de cuantización | W4A16 (4 bits en pesos, 16 bits en activaciones), `group_size=32`, simétrica, con capas sensibles en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con serialización `auto_gptq` (variantes hermanas en `auto_round` y `llm_compressor`/`compressed-tensors`) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura híbrida poco habitual: 24 capas de atención lineal GatedDeltaNet conviven con 8 capas de atención completa, lo que reduce el coste computacional y de memoria del contexto largo frente a un transformer denso convencional. A ello se suma un codificador de visión con 27 bloques y un merger de parches, además de una cabeza de predicción multi-token (MTP) de una capa que habilita decodificación especulativa nativa. El pipeline declarado es image-text-to-text, por lo que el modelo acepta entradas de imagen y texto.

La cuantización se realizó con Intel AutoRound (SignRound) sobre una GPU NVIDIA H200, con 1200 iteraciones por bloque, `batch_size=2`, acumulación de gradiente de 4 pasos (lote global efectivo de 8), `seqlen=4096` y 512 muestras de calibración. El conjunto de calibración se compone de OpenThoughts3-1.2M (35,16 %), OpenCodeReasoning split_0 (21,48 %), UltraData-SFT-Agent-2609 (19,92 %), OpenCodeInstruct (13,67 %) y ultrachat_200k (9,77 %), todas con longitudes superiores a 4096 tokens y trazas `<think>` intactas. Se preservan en BF16 los 231 módulos sensibles: las cinco proyecciones de cada una de las 24 capas GatedDeltaNet, los 27 bloques del codificador de visión y el merger, los 15 tensores de la cabeza MTP y el `lm_head`; solo 128 de las 359 capas lineales se cuantizan a INT4.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" explícito (trazas `<think>`), con un consumo de tokens de razonamiento reducido en torno a un 33,1 % respecto al modelo Ornith-1.5-9B según el autor del modelo base.
- Comprensión de imágenes y texto (pipeline image-text-to-text), con codificador de visión preservado en BF16.
- Generación y razonamiento sobre código, incluyendo problemas de programación competitiva con cadena de pensamiento.
- Razonamiento matemático y científico (el mix de calibración incluye OpenThoughts3 y GPQA-Diamond se cita como benchmark del modelo base).
- Tool calling / function calling: la model card documenta `--enable-auto-tool-choice` y el parser `qwen3_xml` en vLLM, y el dataset de calibración incluye definiciones de herramientas en XML.
- Capacidades agénticas multi-turno y multi-paso (UltraData-SFT-Agent-2609 en la calibración).
- Decodificación especulativa nativa mediante la cabeza MTP preservada en BF16.
- Contexto largo de hasta 200K tokens en la configuración de servicio recomendada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Razonamiento matemático y científico asistido: el modelo puede generar trazas de razonamiento paso a paso con modo thinking, útil en entornos educativos o de investigación donde se necesita auditar el proceso y no solo la respuesta; el ajuste del modelo base reduce el coste en tokens de esas trazas.
- Generación de código en producción: con soporte de tool calling y parser `qwen3_xml`, puede integrarse en pipelines de CI/CD o asistentes de IDE que invocan herramientas externas (ejecución de tests, linters) y razonan sobre los resultados.
- Agentes autónomos multi-paso: la calibración con trayectorias agénticas y definiciones XML de herramientas lo hace adecuado para orquestadores que encadenan llamadas a APIs, con contexto largo para mantener el estado de la conversación.
- Análisis de documentos con imágenes: al aceptar entradas image-text-to-text, puede extraer información de capturas, diagramas o documentos escaneados y razonar sobre ellos en una misma conversación.
- Atención al cliente con contexto extenso: la ventana de 200K tokens permite gestionar historiales largos o bases de conocimiento inyectadas en el prompt, con prefix caching habilitado en vLLM para reducir latencia en turnos sucesivos.
- Despliegue en hardware de gama alta para consumo: al estar cuantizado a W4A16 con capas sensibles en BF16, reduce el footprint de pesos frente al BF16 original, lo que facilita servirlo en una sola GPU con suficiente VRAM para el contexto configurado.
- Prototipado de investigación sobre arquitecturas híbridas: sirve para experimentar con atención lineal GatedDeltaNet y decodificación especulativa MTP sin necesidad de replicar el entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del checkpoint cuantizado en la información disponible. La model card cita únicamente dos datos del modelo base (ukisai/Swift-1.5-Ornith-9B) respecto a ornith-ai/Ornith-1.5-9B: reducción de ~33,1 % en tokens de pensamiento y mejora de +1,52 pp en GPQA-Diamond. No se dispone de cifras de MMLU, HumanEval, GSM8K ni de comparaciones directas con otros modelos.

| Benchmark | Modelo base (citado) | Checkpoint cuantizado |
|---|---|---|
| GPQA-Diamond | +1,52 pp sobre Ornith-1.5-9B | no disponible |
| Tokens de pensamiento | −33,1 % frente a Ornith-1.5-9B | no disponible |
| MMLU / HumanEval / GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 11,8 GB en disco; con KV cache FP8 y contexto de 200K la VRAM necesaria es considerablemente mayor y depende de `--gpu-memory-utilization` y del número de secuencias concurrentes. La configuración de ejemplo fija `--gpu-memory-utilization 0.80` y `--kv-offloading-size 8` con offload a CPU de 24 GiB por rango (`25769803776` bytes), lo que sugiere un despliegue en GPUs de centro de datos.
- GPU recomendadas: la cuantización se generó en una NVIDIA H200; para servir con la configuración de la model card se recomienda H100/H200 o A100 de 80 GB. No hay datos publicados de despliegue en GPUs de consumo.
- ¿Cabe en GPU de consumo? No hay confirmación en la información disponible. Por tamaño de pesos (≈11,8 GB) cabría en GPUs de 16-24 GB, pero el contexto de 200K y el codificador de visión en BF16 elevan los requisitos.
- Opciones de despliegue: vLLM ≥ 0.19.1 (con kernels GPTQ/Marlin), TGI, AutoGPTQ y `transformers` ≥ 5.8.1 con `--trust-remote-code`. Las variantes hermanas cubren `auto_round` y `compressed-tensors`. No se menciona soporte de llama.cpp, Ollama ni GGUF.
- Latencia y throughput: no disponibles. La model card menciona `--async-scheduling`, `--enable-chunked-prefill`, `--enable-prefix-caching` y `--max-num-seqs 16` como parámetros de servicio, pero no aporta cifras medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Ornith-9B-W4A16-GPTQ (esta ficha) | 4,1 B en safetensors (denominado 9B) | 200K en servicio vLLM | W4A16 GPTQ, grupo 32 | Apache 2.0 | Multimodal, híbrido GatedDeltaNet, MTP |
| ukisai/Swift-1.5-Ornith-9B | no disponible | no disponible | BF16 | Apache 2.0 | Modelo base sin cuantizar |
| ornith-ai/Ornith-1.5-9B | no disponible | no disponible | BF16 | no disponible | Modelo original del que deriva Swift-1.5 |
| Variantes hermanas `-AutoRound` y `-LLM-Compressor` | mismas pesos | mismos | W4A16 en otros formatos | Apache 2.0 | Mismos pesos, distinta serialización |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones del checkpoint cuantizado: la degradación introducida por la cuantización W4A16 respecto al modelo base no está medida en la información disponible.
- El modelo base es un derivado afinado de un modelo de razonamiento; persiste el riesgo de alucinación inherente a los modelos generativos, especialmente en tareas de razonamiento largo con trazas `<think>`.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo o toxicidad.
- Idiomas soportados: no disponibles; no se confirma cobertura multilingüe más allá de lo que herede del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y del modelo original Ornith-1.5-9B, ya que la cadena de derivación incluye varios autores.
- Requiere versiones muy recientes de las herramientas (`vLLM ≥ 0.19.1`, `transformers ≥ 5.8.1`) y `--trust-remote-code`, lo que implica ejecutar código del repositorio.
- El contexto de 200K solo está documentado para la configuración de vLLM de la model card; no se garantiza en otros motores ni con otras configuraciones de KV cache.
- El número de parámetros en safetensors (4,1 B) no coincide con la denominación comercial "9B"; conviene tenerlo en cuenta al estimar requisitos y al comparar con otros modelos.
- El repositorio tiene un volumen de descargas muy bajo (43) y ninguna valoración, por lo que no hay validación comunitaria del checkpoint.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-GPTQ
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B
- Modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Variante AutoRound: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-AutoRound
- Variante LLM-Compressor: https://huggingface.co/Vishva007/Swift-1.5-Ornith-9B-W4A16-LLM-Compressor
- Licencia del modelo base: https://huggingface.co/ukisai/Swift-1.5-Ornith-9B/blob/main/LICENSE
- Dataset de calibración OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset de calibración OpenCodeReasoning: https://huggingface.co/datasets/nvidia/OpenCodeReasoning
- Dataset de calibración UltraData-SFT-Agent-2609: https://huggingface.co/datasets/openbmb/UltraData-SFT-Agent-2609
- Dataset de calibración OpenCodeInstruct: https://huggingface.co/datasets/nvidia/OpenCodeInstruct
- Dataset de calibración ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
