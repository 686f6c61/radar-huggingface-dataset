# steampunque/DeepSeek-R1-Distill-Llama-70B-MP-GGUF

## Resumen

DeepSeek-R1-Distill-Llama-70B-MP-GGUF es una cuantizacion GGUF de precision mixta del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-70B, publicada por el usuario steampunque. El modelo base es una destilacion de DeepSeek-R1 sobre el preentrenamiento de Llama-3.3 70B, lo que anade entrenamiento por refuerzo y bloques de razonamiento (`<think>`) al modelo original de Meta. Esta version concreta no es un modelo nuevo, sino un empaquetado optimizado para inferencia local con llama.cpp y compatible con endpoints.

La innovacion principal de esta publicacion es el uso de cuantizacion hibrida por capas (denominada Q3_E_H), con tipos Q4_K y Q3_K distribuidos de forma no uniforme segun la capa, embeddings en Q4_K y tensor de salida en Q6_K. El resultado es un fichero de aproximadamente 33 GB con un tamano medio de 3,74 bits por peso, pensado para poder descargar completamente el modelo en 3 GPU RTX 4070 mediante RPC manteniendo contexto suficiente para ejecutar benchmarks.

El modelo es relevante para desarrolladores que quieran ejecutar un 70B con capacidades de razonamiento en hardware de consumo o en un pequeno cluster domestico. La licencia MIT del modelo base se mantiene, y la publicacion incluye datos de rendimiento medidos con decodificacion especulativa usando Qwen3 0.6B como modelo borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.3 70B con RL de DeepSeek-R1) |
| Parametros totales | 70.553.706.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base soporta contexto largo, pero no se especifica en esta publicacion) |
| Tipos de cuantizacion | GGUF hibrido Q3_E_H: mezcla de Q4_K y Q3_K por capa, embeddings Q4_K, output Q6_K; ~3,74 bpw |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de tipo Llama-3.3 70B, sobre el que DeepSeek aplico un proceso de destilacion desde DeepSeek-R1. Segun la model card del autor de esta cuantizacion, ese proceso anade entrenamiento por refuerzo y un bloque de pensamiento (`<think>`) al preentrenamiento de Llama-3.3 70B. El resultado es un modelo que genera significativamente mas tokens en prompts de razonamiento, lo que puede aumentar la precision en algunas tareas pero tambien incrementa la latencia.

Esta publicacion no modifica la arquitectura ni el entrenamiento: solo aplica una cuantizacion GGUF de precision mixta por capas. La definicion `Q3_E_H` asigna tipos Q4_K_5545, Q4_K_5544, Q4_K_5434, Q4_K_4433 y Q4_K_4333 a distintas capas (de la 0 a la 79), con embedding en Q4_K y tensor de salida en Q6_K. El objetivo declarado es minimizar la perdida de entropia manteniendo un minimo de Q3_K por capa, y conseguir un fichero de ~33 GB que quepa en 3 GPU RTX 4070 mediante RPC. El autor reporta una perplejidad de 8,00 para esta cuantizacion, frente a Q3_K_M (34,3e9) que no tiene valor de PPL reportado.

## Capacidades

- Generacion de texto conversacional y de razonamiento, con modo de pensamiento explicito mediante bloques `<think>` heredado de DeepSeek-R1.
- Razonamiento multi-paso y cadenas de pensamiento largas, aunque el autor advierte que la calidad en razonamiento general sigue siendo debil y no fiable.
- Generacion de codigo y matematicas (capacidades heredadas del modelo base, sin benchmarks publicados en esta publicacion).
- Soporte de decodificacion especulativa con Qwen3 0.6B como modelo borrador, con traduccion dinamica de vocabulario y longitud de bloque fija.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y tool calling: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local de un 70B con razonamiento en un cluster domestico de 3 GPU RTX 4070: el fichero de ~33 GB y 3,74 bpw permite descargar completamente el modelo via RPC, manteniendo contexto suficiente para benchmarks y uso interactivo.
- Despliegue en llama.cpp con decodificacion especulativa: usando Qwen3 0.6B como borrador se pasa de 13 a 29 tokens por segundo en el benchmark del autor, lo que hace viable la generacion interactiva en hardware de consumo.
- Experimentacion con cuantizacion hibrida: util para investigadores que quieran evaluar el impacto de distintos tipos de cuantizacion por capa en la perplejidad y en la calidad de generacion de un 70B.
- Prototipado de asistentes conversacionales con modo de pensamiento: el bloque `<think>` permite separar el razonamiento interno de la respuesta final en aplicaciones de chat.
- Evaluacion comparativa de destilaciones de R1: sirve como referencia para comparar el comportamiento de Llama-3.3 70B destilado frente a otros modelos destilados de DeepSeek-R1.
- Servicio de inferencia en endpoints compatibles: el tag `endpoints_compatible` permite integrarlo en infraestructuras que acepten modelos GGUF con API compatible con OpenAI.
- Pruebas de razonamiento en produccion con expectativas moderadas: el autor advierte que la mejora de precision es irregular, por lo que es adecuado para tareas donde se pueda validar la salida y no para decisiones criticas sin supervision.

## Benchmarks y rendimiento

El autor publica datos de rendimiento de inferencia (no de calidad) en su configuracion local: 3 GPU RTX 4070, RPC sobre LAN de 1 Gb, CPU 9900K, QKV/NKV en F16 con 4k de contexto.

| Quant | Prompt | ND | NGL | QKV/NKV | PP (tok/s) | TG (tok/s) | Comentario |
|---|---|---|---|---|---|---|---|
| Q3_E_H | goldcoin | 0 | 81/81 | F16/4k | 227 | 13 | Sin borrador |
| Q3_E_H | goldcoin | 4 | 81/81 | F16/4k | 214 | 29 | Bloque de borrador fijo de 4 |
| Q3_E_H | goldcoin | 3 | 81/81 | F16/4k | 217 | 27 | Bloque de borrador fijo de 3 |

| Quant | Tamano | PPL | Comentario |
|---|---|---|---|
| Q3_K_M | 34,3e9 | no disponible | Q3_K_M con embedding y output por defecto |
| Q3_E_H | 33e9 | 8,00 | Hibrido con embedding Q4_K y output Q6_K |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero cuantizado ocupa aproximadamente 33 GB, por lo que se necesita al menos esa cantidad de VRAM o memoria unificada para descarga completa; con contexto de 4k y cache KV en F16 el consumo adicional es moderado pero no cuantificado en la model card.
- GPU recomendadas: el autor valida la configuracion con 3 GPU RTX 4070 (12 GB cada una) mediante RPC, lo que suma 36 GB de VRAM.
- Cabe en GPU de consumo: si, en un conjunto de 3 RTX 4070 o equivalentes; no cabe en una sola GPU de consumo de 24 GB sin offload parcial a CPU.
- Opciones de despliegue: llama.cpp (formato GGUF), con soporte de RPC para repartir capas entre maquinas; compatible con endpoints. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: con la configuracion del autor, 227 tok/s de prefill y 13 tok/s de generacion sin borrador; con decodificacion especulativa (Qwen3 0.6B, ND=3 o 4) se alcanzan 27-29 tok/s de generacion, con un ligero descenso del prefill a 214-217 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steampunque/DeepSeek-R1-Distill-Llama-70B-MP-GGUF | 70,55B | no disponible | GGUF Q3_E_H (~3,74 bpw, ~33 GB) | MIT | Hugging Face |
| deepseek-ai/DeepSeek-R1-Distill-Llama-70B | 70,55B | no disponible en esta ficha | safetensors (modelo base) | MIT | Hugging Face |
| Qwen3 0.6B (usado como borrador) | 0,6B | no disponible | no disponible | no disponible | Hugging Face |

La comparativa se limita al modelo base y al modelo borrador utilizado en la decodificacion especulativa, ya que la informacion proporcionada no incluye datos de otros modelos de 70B comparables. No se dispone de datos de rendimiento de calidad para establecer una comparacion rigurosa con alternativas.

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo sigue siendo debil en razonamiento general: el entrenamiento por refuerzo puede aumentar la precision en algunos prompts de forma irregular y no fiable, y no permite resolver problemas fuera del espacio latente del preentrenamiento de Llama-3.3 70B.
- La cuantizacion a 3,74 bpw introduce perdida de informacion respecto al modelo base; la perplejidad reportada (8,00) debe interpretarse en el contexto del benchmark del autor y no como una medida absoluta de calidad.
- Riesgo de alucinacion inherente al modelo base y potencialmente amplificado por la cuantizacion agresiva.
- La model card no documenta sesgos conocidos, limitaciones de idioma ni restricciones de contexto especificas de esta cuantizacion.
- La licencia MIT del modelo base se mantiene, pero el autor de la cuantizacion no anade terminos adicionales; conviene verificar la licencia del modelo base para uso comercial.
- El rendimiento medido depende de la configuracion concreta (3 RTX 4070, RPC sobre LAN de 1 Gb, CPU 9900K); en otras configuraciones los valores de throughput pueden diferir significativamente.
- La decodificacion especulativa requiere un modelo borrador adicional (Qwen3 0.6B) y una implementacion con traduccion dinamica de vocabulario, lo que anade complejidad operativa.
- El repositorio tiene un numero muy bajo de descargas (234) y cero likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/steampunque/DeepSeek-R1-Distill-Llama-70B-MP-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-70B
- Dataset de benchmark goldcoin: https://huggingface.co/datasets/steampunque/benchlm/blob/main/goldcoin.txt
