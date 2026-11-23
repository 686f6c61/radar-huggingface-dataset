# Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF

## Resumen

Qwen3.6-35B-A3B-TR2.25-G-GGUF es una cuantizacion ternaria del modelo Qwen3.6-35B-A3B (desarrollado por el equipo Qwen) publicada por el usuario Ternii bajo licencia Apache-2.0. Se trata de una traduccion de pesos a una representacion de trits (base 3) con un promedio de 2,25 trits por peso, sin reentrenamiento, empaquetada como un unico archivo GGUF para llama.cpp. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con aproximadamente 34.660 millones de parametros totales, del que no se detalla el numero de parametros activos en la informacion disponible.

La relevancia de esta publicacion es doble. Por un lado, reduce el peso en disco hasta 16,49 GB frente a los 21,17 GB de un Q4_K_M convencional, lo que permite ejecutar un modelo de ~35B en Mac con 16-24 GB de RAM unificada. Por otro, es una cuantizacion agresiva que introduce tipos de tensor propios (TQ9_128, TQ27_128, TQ81_128) inexistentes en llama.cpp upstream, por lo que requiere una compilacion parcheada del runtime; no funciona en LM Studio, Ollama ni builds oficiales.

El autor advierte que la fidelidad al modelo original es notablemente inferior a la de un 4-bit estandar (KLD medio de 0,176 frente a 0,046, y perplexity de 8,12 frente a 7,06 sobre WikiText-2), aunque las metricas de tareas como GSM8K, HumanEval y MBPP no muestran diferencias significativas en sus mediciones. Es, por tanto, una opcion orientada a entornos con memoria muy limitada o a quienes priorizan el tamano de descarga, no a maxima fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts); modelo base Qwen3.6-35B-A3B |
| Parametros totales | 34.660.610.688 (~34,66B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (los ejemplos de ejecucion usan `-c 4096`) |
| Tipos de cuantizacion | Ternaria TR (2,25 trits por peso de media); tipos de tensor TQ9_128, TQ27_128, TQ81_128 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo unico, 16,49 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura Mixture-of-Experts de aproximadamente 34,66B de parametros totales. Esta publicacion no entrena ni ajusta el modelo: aplica una traduccion de cuantizacion ternaria (denominada TR Quantisation) sobre los pesos originales, con codigos y escalas identicos a los de la variante `Ternii/Qwen3.6-35B-A3B-TR2.25-G` (no GGUF), y los empaqueta en un unico archivo GGUF. El promedio es de 2,25 trits por peso, lo que se traduce en un tamano de archivo de 16,49 GB.

La innovacion tecnica principal es el esquema de cuantizacion ternaria con tipos de tensor personalizados que requieren un parche sobre ggml-org/llama.cpp (commit ff5a233). El runtime parcheado soporta Metal en Apple Silicon y, desde la revision r4, tambien CUDA (probado solo en un DGX Spark GB10); en CUDA el camino de prompt con tensor cores altera las salidas, y puede desactivarse con `GGML_CUDA_TQ_MM=0`. El autor menciona que los datasets asociados al modelo (nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math, openai/gsm8k) figuran como metadatos del modelo base; no se aportan detalles sobre el volumen de tokens de entrenamiento ni sobre etapas de RLHF/DPO en la informacion disponible. El modelo es solo de texto: no incluye codificador de vision ni cabecera MTP.

## Capacidades

- Generacion de texto conversacional en ingles (pipeline `text-generation`, tag `conversational`).
- Razonamiento en modo "thinking" por defecto con plantilla Jinja: el modelo puede gastar mas de 1.000 tokens en `reasoning_content` antes de responder; puede desactivarse con `--reasoning off` o `enable_thinking: false`.
- Codigo y matematicas: los datasets de referencia (OpenCodeInstruct, hendrycks_math, gsm8k) y las metricas reportadas (GSM8K 95,0 %, HumanEval 92,7 %, MBPP 87,2 %) indican capacidad funcional en estas areas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; el modo thinking sugiere capacidad de razonamiento extendido, pero no se detalla.
- Capacidades multilingues: limitadas al ingles segun el metadato `language: [en]`.
- Sin vision ni audio: modelo exclusivamente de texto.

## Casos de uso

- Chat local en Mac de 16-24 GB: el archivo de 16,49 GB cabe completo en la GPU unificada de un Mac de 24 GB (0,35 GB de margen a contexto de 4k) y, en un Mac de 16 GB, puede ejecutarse con cache de expertos en SSD a unos 35 tokens/s en un MacBook Air M5. Es el escenario principal para el que se publica esta variante.
- Prototipado y evaluacion de modelos MoE de ~35B en hardware de consumo: permite probar el comportamiento de Qwen3.6-35B-A3B sin disponer de GPUs de datacenter, a costa de menor fidelidad respecto al original.
- Tareas de razonamiento y matematicas en local: con GSM8K al 95,0 % en las mediciones del autor, es util para asistentes de resolucion de problemas y verificacion de calculos en entornos sin conexion.
- Generacion y revision de codigo en local: HumanEval 92,7 % y MBPP 87,2 % lo hacen viable para autocompletado, explicacion de fragmentos y generacion de tests en flujos de desarrollo sin acceso a la nube.
- Despliegue en edge o en equipos con memoria muy limitada: al ser mas pequeno que un Q4_K_M y requerir solo el runtime parcheado, encaja en escenarios donde el espacio en disco o la RAM son la restriccion principal.
- Investigacion sobre cuantizacion ternaria: sirve como caso de estudio reproducible para medir el impacto de 2,25 trits/peso frente a 4 bits en KLD, perplexity y acuerdo de token top-1.
- Asistente conversacional offline en ingles: con `llama-server` y plantilla Jinja, se puede montar una interfaz web local para consultas multi-turno dentro de la ventana de contexto configurada (4k en los ejemplos).

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (medidos en Mac, M5 Max para KLD/perplexity y en Mac para tareas):

| Metrica | TR2.25-G (este archivo) | Q4_K_M | Original (Q8_0) |
|---|---|---|---|
| Tamano de archivo | 16,49 GB | 21,17 GB | no disponible |
| KLD medio vs Q8_0 (menor es mejor) | 0,176 | 0,046 | referencia |
| Mismo token top-1 que el original | 79,7 % | 90,9 % | referencia |
| Perplexity (WikiText-2) | 8,12 | 7,06 | 7,06 |
| GSM8K | 95,0 % | no medido | 95,0 % |
| HumanEval | 92,7 % | no medido | 94,5 % |
| MBPP | 87,2 % | no medido | 87,9 % |

Notas: KLD, perplexity y acuerdo de token top-1 se calcularon con 10 fragmentos de 512 tokens de WikiText-2 contra el original en Q8_0, usando `llama-perplexity` sobre la CPU del M5 Max. El Q4_K_M fue generado por el autor con `llama-quantize` estandar sin importance matrix. No se comparo la velocidad en Metal entre ambas variantes.

## Requisitos de hardware

- VRAM/RAM estimada: 16,49 GB de pesos; en Mac de 24 GB cabe entero en la GPU unificada con 0,35 GB de margen a 4k de contexto. En Mac de 16 GB requiere cache de expertos en SSD (8.400 MiB de cache) y es experimental.
- GPU recomendadas: Apple Silicon (Metal) es la plataforma principal; CUDA soportado desde r4, probado unicamente en un DGX Spark (GB10). No hay datos para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en Mac con 24 GB o mas de memoria unificada; en 16 GB solo con el modo de cache en SSD.
- Opciones de despliegue: exclusivamente llama.cpp parcheado (serie de parches sobre ggml-org/llama.cpp @ff5a233) con binarios precompilados `llama.cpp-tr-b11721-r4`/`r5` para macOS arm64 (Metal) y Linux arm64 (CPU y CUDA). No funciona en LM Studio, Ollama ni llama.cpp upstream.
- Latencia y throughput: ~35 tokens/s en un MacBook Air M5 de 16 GB con cache de expertos en SSD (1 usuario). No se reportan cifras para 24 GB o superiores. En CUDA, r5 mejora ~3 % la velocidad de prompt en DGX Spark respecto a r4.
- Contexto de ejecucion recomendado en los ejemplos: 4.096 tokens (`-c 4096 -fa on --jinja`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Ejecutable en herramientas estandar |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-TR2.25-G-GGUF (este) | ~34,66B (MoE) | no disponible | GGUF ternario (16,49 GB) | Apache-2.0 | No (requiere llama.cpp parcheado) |
| Qwen3.6-35B-A3B Q4_K_M | ~34,66B (MoE) | no disponible | GGUF 4-bit (21,17 GB) | Apache-2.0 | Si (llama.cpp, LM Studio, Ollama) |
| Qwen3.6-35B-A3B Q8_0 (original) | ~34,66B (MoE) | no disponible | safetensors/GGUF 8-bit | Apache-2.0 | Si |

La comparativa se limita a las variantes del mismo modelo base porque la informacion proporcionada no incluye datos de otros modelos comparables. Frente a Q4_K_M, este archivo gana en tamano y en capacidad de caber en 24 GB de memoria unificada, pero pierde en fidelidad (KLD 0,176 frente a 0,046; perplexity 8,12 frente a 7,06) y en compatibilidad de herramientas.

## Limitaciones y advertencias

- Requiere un runtime propietario: los tipos de tensor TQ9_128/TQ27_128/TQ81_128 no existen en llama.cpp upstream; sin el parche de ternii-ai/tritq-vllm el modelo no carga. Esto excluye LM Studio, Ollama y cualquier build oficial.
- Fidelidad reducida: KLD medio de 0,176 y solo 79,7 % de acuerdo en token top-1 frente al original, muy por debajo del 90,9 % de un Q4_K_M. Riesgo mayor de degradacion en tareas fuera de las medidas.
- Solo texto: sin codificador de vision ni cabecera MTP.
- Solo ingles segun el metadato del modelo; no se declaran otros idiomas.
- Modo thinking por defecto: puede consumir mas de 1.000 tokens de razonamiento antes de responder (3 de 4 peticiones de prueba agotaron el limite de 1.024 tokens); es necesario desactivarlo o ampliar `max_tokens` para respuestas rapidas.
- En CUDA, el camino de prompt con tensor cores altera las salidas; debe desactivarse con `GGML_CUDA_TQ_MM=0` si se requiere el nivel de precision medido. Solo probado en DGX Spark GB10.
- El modo de 16 GB con cache de expertos en SSD es experimental y depende de variables de entorno especificas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; aplican los del modelo base Qwen3.6-35B-A3B.
- Licencia Apache-2.0: permite uso comercial, pero la obligacion de usar un runtime parcheado puede condicionar el soporte en produccion.
- El modelo base se referencia en la revision `995ad96e`; cambios posteriores en el base no estan cubiertos.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio del runtime parcheado: https://github.com/ternii-ai/tritq-vllm
- Parches de llama.cpp: https://github.com/ternii-ai/tritq-vllm/tree/main/runtime/llama.cpp
- Binarios precompilados r5: https://github.com/ternii-ai/tritq-vllm/releases/tag/llama.cpp-tr-b11721-r5
- Instalador de una linea para Mac: https://raw.githubusercontent.com/ternii-ai/tritq-vllm/main/mac/qwen36-35b.sh
- llama.cpp upstream (commit base): https://github.com/ggml-org/llama.cpp
