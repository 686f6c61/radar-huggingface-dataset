# TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound

## Resumen

TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound es una cuantización de precisión mixta NVFP4 del modelo Qwen/Qwen3.8-27B, desarrollada por TelperionAI con la librería llm-compressor del proyecto vLLM. El checkpoint ocupa 24,7 GB, unos 6 GB menos que la versión FP8 oficial, y ofrece un incremento de throughput de aproximadamente el 22 % (10 590 tokens/s frente a 8711 tokens/s en la configuración de prueba). El objetivo principal es reducir el coste de despliegue en GPUs Blackwell sin sacrificar la calidad de generación respecto a la referencia BF16.

La receta de cuantización combina dos pasadas: primero un escalado AWQ (activation-aware scaling) que se pliega en los pesos sin coste adicional de memoria ni latencia, y después un redondeo optimizado con AutoRound (SignSGD, 200 iteraciones) que minimiza una pérdida de reconstrucción por bloques. Según los datos publicados, esta combinación recupera el 84 % de la brecha de calidad entre una cuantización NVFP4+GPTQ sin AWQ y la referencia FP8, medida como acuerdo de tokens de alta confianza con el modelo BF16. El modelo incluye además la cabeza MTP (multi-token prediction) en BF16 para decodificación especulativa con vLLM.

El modelo base Qwen3.8-27B es un transformer denso de 27B parámetros con atención híbrida (atención lineal GDN en 48 de 64 capas), torre de visión y ventana de contexto nativa de 262 144 tokens extensible a 1M. El checkpoint cuantizado expone 20 294 595 312 parámetros en sus safetensors, probablemente porque excluye parte de la torre de visión y la cabeza MTP del conteo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso hibrido con atencion lineal (GDN) en 48 de 64 capas, torre de vision y cabeza MTP (modelo base Qwen3.8-27B) |
| Parametros totales | 20 294 595 312 (segun safetensors del checkpoint cuantizado; el modelo base declara 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos, extensible a 1M (heredado del modelo base) |
| Tipos de cuantizacion | NVFP4 mixto (4-bit, grupo 16, escalas FP8-e4m3, 4,5 bits efectivos) en mlp de capas 0-55; FP8 e4m3 en mlp de capas 56-63, atencion y GDN; BF16 en lm_head, embed_tokens, norms, estado GDN y torre de vision |
| Idiomas soportados | No disponible (el blend de calibracion incluye 10 % de datos multilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (compressed-tensors, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27B parametros con una arquitectura hibrida: 48 de las 64 capas utilizan atencion lineal (GDN, gated delta net) y las 16 restantes mantienen atencion full attention. Incluye una torre de vision para entrada de imagenes y una cabeza MTP (multi-token prediction) para decodificacion especulativa. La ventana de contexto nativa es de 262 144 tokens y puede extenderse hasta 1M.

La cuantizacion se realizo en dos pasadas sobre el checkpoint BF16:

1. **AWQ (activation-aware scaling)**: escalado por canal de entrada en las rutas `post_attention_layernorm → {gate_proj, up_proj}` y `up_proj → down_proj`. Como gate y up comparten entrada, la escala reciproca se pliega en los pesos de la norma, de modo que no anade coste de memoria ni de throughput. A diferencia de metodos de rotacion (QuIP, SpinQuant), los escalados se fusionan completamente en los pesos, por lo que el modelo sigue siendo compatible con tensor parallelism.

2. **AutoRound**: redondeo y clipping optimizados con SignSGD (200 iteraciones) contra una perdida de reconstruccion por bloques, en lugar de GPTQ. La perdida media por bloque cayo aproximadamente un 18 % respecto a GPTQ.

La calibracion uso 1358 secuencias empaquetadas de 1024 tokens (1,39M tokens en total) de un blend Nemotron-v2 equilibrado: 25 % codigo, 25 % matematicas, 20 % STEM, 20 % chat y 10 % multilingue. `lm_head` y `embed_tokens` se mantienen en BF16, igual que en la version FP8 oficial de Qwen.

## Capacidades

- Generacion de texto conversacional y de razonamiento multi-turno, heredada del modelo base Qwen3.8-27B.
- Comprension de imagenes (image-text-to-text) gracias a la torre de vision del modelo base, que se mantiene en BF16.
- Razonamiento matematico y cientifico (STEM), reforzado por la composicion del dataset de calibracion (25 % matematicas, 20 % STEM).
- Generacion de codigo, con un 25 % de datos de codigo en la calibracion.
- Decodificacion especulativa mediante la cabeza MTP incluida en BF16, activable en vLLM con `speculative_config={"method": "mtp", "num_speculative_tokens": 2}`.
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.8 (no verificado en esta cuantizacion).
- Capacidades multilingues parciales, segun el 10 % de datos multilingues del blend de calibracion; la lista exacta de idiomas no esta disponible.

## Casos de uso

- **Inferencia de alto rendimiento en produccion con GPUs Blackwell**: el checkpoint reduce el uso de VRAM a 24,7 GB y alcanza 10 590 tokens/s con tensor parallelism 2 en 2×B300, lo que lo hace adecuado para servir trafico de alta concurrencia con vLLM.
- **Asistentes conversacionales con contexto largo**: la ventana nativa de 262K tokens permite mantener conversaciones multi-turno extensas o procesar documentos largos sin truncamiento, con un coste de memoria inferior al de la version FP8.
- **Razonamiento multimodal sobre documentos con imagenes**: al conservar la torre de vision en BF16, el modelo puede responder preguntas sobre capturas, diagramas o graficos integrados en documentos, util para soporte tecnico o analisis de informes.
- **Generacion de codigo asistida en entornos de desarrollo**: con el 25 % de datos de codigo en calibracion y el soporte de tool calling del modelo base, puede integrarse en pipelines de autocompletado o agentes de programacion que requieran baja latencia.
- **Decodificacion especulativa para reducir latencia en tiempo real**: la cabeza MTP en BF16 permite usar vLLM con `mtp` speculative decoding, reduciendo el numero de pasos de generacion en aplicaciones interactivas como chatbots o asistentes de voz.
- **Despliegue en entornos con restriccion de VRAM**: al ocupar 6 GB menos que la version FP8, permite servir el modelo en nodos con menos memoria o reservar VRAM para otros servicios, manteniendo una calidad cercana a la referencia de 8 bits.

## Benchmarks y rendimiento

La model card publica mediciones sobre 142 727 tokens de salida en modo thinking auto-destilada y 200 generaciones greedy libres, ejecutadas con vLLM 0.27.1, tensor parallelism 2 y 2×B300. Las columnas de buckets indican tasas de desacuerdo con el modelo BF16, segmentadas por el margen de confianza del modelo base en cada posicion (near-tie <0,5; moderate 0,5-2; confident 2-5; certain >5). `divmed` es la mediana del indice de token en el que una generacion greedy libre diverge por primera vez de BF16.

| Checkpoint | Tamano | Top-1 | Near-tie | Moderate | Confident | Certain | Divmed | Tok/s |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen/Qwen3.8-27B-FP8 (referencia 8-bit) | 30,9 GB | 96,15 % | 22,70 % | 3,48 % | 1,45 % | 0,08 % | 47 | 8711 |
| **Este modelo (NVFP4+AWQ+AutoRound)** | **24,7 GB** | **93,38 %** | **34,18 %** | **8,67 %** | **1,85 %** | **0,17 %** | **28** | **10 590** |
| RadixArk/Qwen3.8-27B-NVFP4 | 21,9 GB | 90,23 % | 43,80 % | 14,49 % | 3,29 % | 0,70 % | 11 | 11 436 |
| unsloth/Qwen3.8-27B-NVFP4 | 23,4 GB | 91,75 % | 40,12 % | 10,32 % | 3,91 % | 0,25 % | 19 | 11 069 |

La negrita marca el mejor valor entre los checkpoints FP4; la fila FP8 es solo referencia. Todos los tamanos incluyen la cabeza MTP en BF16 (~0,85 GB); restando esa cantidad se obtiene la comparacion sin MTP. La model card advierte explicitamente de que la perplejidad esta excluida de la comparacion por estar anticorrelacionada con la calidad en este caso.

Adicionalmente, la model card reporta que, manteniendo fija la receta y cambiando solo el algoritmo de redondeo, el dano en el bucket `confident` cae de 2,69 % (GPTQ) a 1,85 % (AutoRound), con un z de McNemar pareado de 9,26 sobre 33 812 posiciones de alta confianza. Frente a una build NVFP4+GPTQ sin AWQ (3,97 %), las dos pasadas combinadas cierran el 84 % de la distancia a FP8.

## Requisitos de hardware

- **GPU obligatoria**: clase Blackwell (B200, B300 o similar) para ejecutar NVFP4 nativo. No es compatible con GPUs de generaciones anteriores (Ampere, Ada Lovelace) para esta precision.
- **VRAM estimada**: 24,7 GB en disco (incluyendo la cabeza MTP BF16 de ~0,85 GB). En memoria, con vLLM y tensor parallelism 2, el consumo por GPU es inferior a 24,7 GB, aunque el valor exacto depende del tamano de lote y del numero de secuencias concurrentes.
- **GPUs recomendadas**: 2×B300 para la configuracion de benchmark (TP=2). Una sola GPU Blackwell con 24 GB o mas de VRAM podria servir el modelo sin TP, pero no se han publicado mediciones de esa configuracion.
- **Opciones de despliegue**: vLLM con `compressed-tensors` (unico backend verificado). No se menciona compatibilidad con llama.cpp, Ollama ni TGI en la model card.
- **Latencia y throughput**: 10 590 tokens/s medidos con TP=2 en 2×B300 y vLLM 0.27.1. La latencia por token no se ha publicado.

## Comparativa con modelos similares

| Modelo | Tamano | Precision | Top-1 vs BF16 | Confident | Tok/s | Licencia |
|---|---:|---|---:|---:|---:|---|
| Qwen/Qwen3.8-27B-FP8 (referencia) | 30,9 GB | FP8 e4m3 | 96,15 % | 1,45 % | 8711 | Apache 2.0 |
| **TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound** | **24,7 GB** | **NVFP4 mixto** | **93,38 %** | **1,85 %** | **10 590** | **Apache 2.0** |
| RadixArk/Qwen3.8-27B-NVFP4 | 21,9 GB | NVFP4 | 90,23 % | 3,29 % | 11 436 | Apache 2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 23,4 GB | NVFP4 | 91,75 % | 3,91 % | 11 069 | Apache 2.0 |

Este modelo es el que mejor equilibrio ofrece entre tamano, calidad y velocidad entre los checkpoints FP4 comparados: es 2,8 GB mas grande que el de RadixArk pero con un dano en el bucket `certain` cuatro veces menor (0,17 % frente a 0,70 %), y supera a unsloth tanto en top-1 como en dano de alta confianza. Frente a la referencia FP8, sacrifica 2,77 puntos de top-1 y 0,09 puntos en el bucket `certain`, a cambio de 6,2 GB menos y un 21,6 % mas de throughput.

## Limitaciones y advertencias

- **Requiere hardware Blackwell**: el formato NVFP4 no es ejecutable en GPUs de generaciones anteriores; cualquier despliegue fuera de Blackwell requiere conversion a otra precision.
- **AutoRound ejecutado con batch size efectivo 1**: el valor por defecto (8) no fue soportado por la arquitectura, por lo que los gradientes son mas ruidosos de lo previsto. La model card indica que los resultados probablemente infravaloran el potencial del metodo.
- **Secuencias de calibracion empaquetadas**: las secuencias de 1024 tokens cruzan limites de documento, lo que puede introducir dependencias artificiales en la calibracion.
- **Evaluacion sobre un unico corpus**: todos los numeros provienen de un corpus auto-destilado en modo thinking; no hay resultados sobre benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.
- **La perplejidad no debe usarse para comparar**: la model card advierte explicitamente de que en esta familia de checkpoints la perplejidad esta anticorrelacionada con la calidad, por lo que no es una metrica fiable para ranking.
- **Cabeza MTP no cuantizada**: se mantiene en BF16 y se injerta desde el checkpoint base; la tasa de aceptacion no ha sido medida, solo se ha verificado que carga y genera correctamente.
- **Idiomas no documentados**: la lista de idiomas soportados no esta disponible en la model card; el 10 % de datos multilingues del blend de calibracion sugiere cobertura parcial, pero sin detalle.
- **Riesgo de alucinacion y sesgos**: no se han publicado evaluaciones de sesgo ni de alucinacion para esta cuantizacion; estos riesgos son inherentes al modelo base y no se mitigan con la cuantizacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante all-FP4: https://huggingface.co/TelperionAI/Qwen3.8-27B-NVFP4-AWQ-AutoRound-allfp4
- Ficha en LLM Explorer (variante GPTQ): https://llm-explorer.com/model/TelperionAI%2FQwen3.8-27B-NVFP4-AWQ-GPTQ,7sti5ZDCLMFpd7O9iPnnBQ
- Ficha en LLM Explorer (variante all-FP4): https://llm-explorer.com/model/TelperionAI%2FQwen3.8-27B-NVFP4-AWQ-AutoRound-allfp4,3wyvtMfbwv9iSqAvjTlsNt
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
