# Ternii/Qwen3.6-35B-A3B-TR2.27-GK-GGUF

## Resumen

Qwen3.6-35B-A3B-TR2.27-GK es una cuantizacion ternaria del modelo Qwen3.6-35B-A3B, desarrollada por Ternii (publicada por Wai Chung) mediante su esquema propietario TR Quantisation. El modelo base es un transformer de tipo Mixture of Experts (MoE) de 34.660.610.688 parametros totales con aproximadamente 3.000 millones de parametros activos por token, publicado por el equipo de Qwen bajo licencia Apache-2.0. Esta version comprime los pesos a una media de 2,27 trits por peso, lo que reduce el fichero a 16,64 GB.

La relevancia de esta ficha radica en que demuestra la viabilidad de la cuantizacion ternaria de alta fidelidad sobre modelos MoE de gran tamano, manteniendo una perplexity de 7,38 frente a los 7,06 del original en Q8_0 y una coincidencia del 88,3 % en el token top-1. Es una mejora directa de la version anterior TR2.25-G, con la deriva (KLD medio) reducida a la mitad (0,087 frente a 0,176) a cambio de solo 0,15 GB adicionales y una penalizacion de velocidad de decodificacion de en torno al 3 % en Mac y el 7 % en DGX Spark.

El modelo esta pensado para inferencia local en Apple Silicon (Metal) y en Arm CPU o CUDA, y requiere una compilacion parcheada de llama.cpp, ya que los tipos de tensor TQ9_128 y TQ27_128 no existen en la version upstream. No es compatible con LM Studio, Ollama ni llama.cpp estandar, y solo esta disponible en formato GGUF (no hay checkpoint para vLLM de este fichero concreto).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), cuantizado en formato ternario TR (TR Quantisation) |
| Parametros totales | 34.660.610.688 (modelo base); fichero GGUF de 16,64 GB |
| Parametros activos | Aproximadamente 3.000 millones (segun la denominacion A3B del modelo base) |
| Longitud de contexto | No disponible (no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | Ternaria TR2.27 (media de 2,27 trits por peso); tipos de tensor TQ9_128 y TQ27_128 |
| Idiomas soportados | Ingles (segun la model card y los tags del repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (exclusivamente; sin checkpoint vLLM para este fichero) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture of Experts: de los 34.660 millones de parametros totales, solo unos 3.000 millones se activan por token, lo que permite un coste computacional de inferencia mucho menor que el de un modelo denso del mismo tamano. La model card no detalla la composicion exacta del dataset de entrenamiento original ni si hubo fases de RLHF o DPO; esa informacion corresponde al modelo base y no se reproduce aqui.

La innovacion tecnica de esta version es el esquema TR Quantisation: los pesos se "traducen" a valores ternarios con una media de 2,27 trits por peso, y los codigos se calibran con GPTQ (sufijo -G). En esta variante -GK, los escalares por grupo se ajustan a los datos de calibracion y la cabeza de salida y algunos tensores no-expertos usan 3 trits en lugar de 2, mientras que los expertos enrutados mantienen el mismo numero de trits que en TR2.25-G. No hay reentrenamiento: es una cuantizacion post-entrenamiento. La inferencia requiere una serie de parches sobre ggml-org/llama.cpp (commit ff5a233) que anade los tipos de tensor ternarios; en CUDA, la ruta de prompt con tensor cores altera las salidas y puede desactivarse con `GGML_CUDA_TQ_MM=0`.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline de text-generation.
- Razonamiento matematico: obtiene 90,90 % en GSM8K sobre DGX Spark con la compilacion r5.
- Generacion de codigo: 92,68 % en HumanEval+ y 90,21 % en MBPP+ en las mismas condiciones.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno (tag conversational).
- Capacidades de experto enrutado (MoE) con activacion dispersa, lo que reduce el coste por token.
- No incluye codificador de vision ni cabeza MTP (modelo solo de texto).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.

## Casos de uso

- Inferencia local en Mac de 24 GB o mas: el modelo cabe completamente en memoria con contexto de 4k (buffers Metal de 16,99 GB, con unos 0,19 GB de margen), lo que permite ejecutar un MoE de 35B en un portatil Apple Silicon sin conexion a la nube.
- Asistencia de codigo en el editor: con 92,68 % en HumanEval+ y 90,21 % en MBPP+, es adecuado para autocompletado y generacion de funciones en flujos de trabajo locales donde no se quiere enviar codigo a un servicio externo.
- Resolucion de problemas matematicos paso a paso: el 90,90 % en GSM8K lo hace util para tutoria automatizada o verificacion de calculos en entornos educativos o de analisis.
- Despliegue en estaciones de trabajo con DGX Spark (GB10): la compilacion CUDA r5 ofrece 80,4 tokens/s de decodificacion y 1.977 tokens/s de procesamiento de prompt, suficiente para prototipos de agentes conversacionales en local.
- Procesamiento por lotes de texto en Arm CPU: al requerir solo una build parcheada de llama.cpp, puede integrarse en pipelines de servidor Arm sin GPU para tareas de clasificacion, resumen o extraccion.
- Evaluacion comparativa de tecnicas de cuantizacion: sirve como referencia practica para investigadores que estudian el compromiso entre fidelidad (KLD 0,087, perplexity 7,38) y velocidad en esquemas ternarios frente a cuantizaciones de 4 bits.
- Prototipado de bajo coste en hardware consumer: al ocupar 16,64 GB, permite experimentar con un modelo de 35B en equipos que no podrian alojar la version Q8_0 ni un 4-bit de 21 GB.

## Benchmarks y rendimiento

| Metrica | TR2.27-GK (este fichero) | TR2.25-G | Q4_K_M (referencia) | Original Q8_0 |
|---|---|---|---|---|
| Tamano del fichero | 16,64 GB | 16,49 GB | 21,17 GB (propio) / 20,54 GB (ggml-org) | no disponible |
| KLD medio vs Q8_0 (menor es mejor) | 0,087 | 0,176 | 0,046 | 0 (referencia) |
| Coincidencia token top-1 | 88,3 % | 79,7 % | 90,9 % | 100 % |
| Perplexity (WikiText-2) | 7,38 | 8,12 | 7,06 | 7,06 |
| GSM8K (DGX Spark, CUDA r5) | 90,90 % | 90,37 % | no medido | no disponible |
| HumanEval+ (DGX Spark, CUDA r5) | 92,68 % | 92,07 % | no medido | no disponible |
| MBPP+ (DGX Spark, CUDA r5) | 90,21 % | 91,27 % | no medido | no disponible |
| Decodificacion, tokens/s, Mac M5 Max (Metal) | 131,1 | 134,5 | 111,6 (ggml-org) | no disponible |
| Decodificacion, tokens/s, DGX Spark (CUDA) | 80,4 | 86,6 | 70,1 (ggml-org) | no disponible |
| Procesamiento de prompt, tokens/s, Mac M5 Max (512 tokens) | 2.525 | 2.543 | 3.408 (ggml-org) | no disponible |
| Procesamiento de prompt, tokens/s, DGX Spark (512 tokens) | 1.977 | 1.995 | 2.744 (ggml-org) | no disponible |

En una comprobacion mas larga (80 fragmentos de 512 tokens, otra build de CPU de la misma serie), este fichero obtuvo un KLD medio de 0,078 frente a 0,162 de TR2.25-G. Las cifras de velocidad se midieron con `llama-bench`, 128 tokens generados o prompt de 512 tokens, mediana de 4 pasadas.

## Requisitos de hardware

- VRAM/memoria estimada: 16,99 GB de buffers Metal con contexto de 4k; el fichero pesa 16,64 GB.
- Mac con 24 GB de RAM: cabe completamente en memoria con unos 0,19 GB de margen (presupuesto asumido de dos tercios de la RAM, 16 GiB; no medido en una maquina de 24 GB).
- Mac con 32 GB: recomendado para margen de trabajo comodo.
- Mac con 16 GB: no probado en este fichero; la version TR2.25-G usa una cache de expertos experimental con unos 35 tokens/s.
- DGX Spark (GB10, CUDA): soportado; 80,4 tokens/s de decodificacion y 1.977 tokens/s de procesamiento de prompt.
- GPU consumer tipo RTX 4090: no disponible en la informacion proporcionada (solo se documentan Metal en Apple Silicon, Arm CPU y CUDA en DGX Spark).
- Despliegue: exclusivamente con la build parcheada de llama.cpp-tr (release llama.cpp-tr-b11721-r5, con binarios para macOS arm64/Metal y Linux arm64/CPU/CUDA). No funciona en llama.cpp estandar, LM Studio ni Ollama. No hay checkpoint vLLM de este fichero.
- Latencia y throughput: 131,1 tokens/s de decodificacion en Mac M5 Max y 80,4 en DGX Spark; el procesamiento de prompt es de 2.525 y 1.977 tokens/s respectivamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplexity | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TR2.27-GK | 34,66B totales / ~3B activos | no disponible | 7,38 | Apache-2.0 | GGUF, solo llama.cpp parcheado |
| Qwen3.6-35B-A3B-TR2.25-G | 34,66B totales / ~3B activos | no disponible | 8,12 | Apache-2.0 | GGUF, llama.cpp parcheado; incluye checkpoint vLLM |
| Qwen3.6-35B-A3B Q4_K_M (ggml-org) | 34,66B totales / ~3B activos | no disponible | 7,06 | Apache-2.0 | GGUF, llama.cpp estandar, LM Studio, Ollama |
| Qwen3.6-35B-A3B original (Q8_0) | 34,66B totales / ~3B activos | no disponible | 7,06 | Apache-2.0 | safetensors y GGUF de referencia |

## Limitaciones y advertencias

- Requiere una compilacion parcheada de llama.cpp: los tipos TQ9_128 y TQ27_128 no existen en upstream, por lo que stock builds, LM Studio y Ollama no pueden cargarlo.
- Solo esta disponible en GGUF; no hay checkpoint vLLM de este fichero, lo que limita el despliegue en servidores de alto rendimiento.
- En CUDA, la ruta de prompt con tensor cores cambia las salidas; hay que desactivarla con `GGML_CUDA_TQ_MM=0` si se necesita reproducibilidad.
- Modelo solo de texto: sin codificador de vision ni cabeza MTP.
- Idiomas: unicamente ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como todo modelo generativo, puede producir contenido incorrecto, y la cuantizacion ternaria introduce una deriva adicional (KLD 0,087 frente al original).
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Longitud de contexto: no especificada; las mediciones de memoria se hicieron con 4k de contexto.
- No probado en Mac de 16 GB; el uso en ese hardware queda sin validar.
- Licencia Apache-2.0 permite uso comercial, pero la dependencia de una build parcheada concreta anade riesgo de mantenimiento en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.27-GK-GGUF
- Version anterior TR2.25-G: https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del runtime parcheado: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Binarios precompilados: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r5
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
