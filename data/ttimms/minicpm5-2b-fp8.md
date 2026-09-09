# Ttimms/MiniCPM5-2B-FP8

## Resumen

`Ttimms/MiniCPM5-2B-FP8` es una version cuantizada en FP8 dinamico del modelo `openbmb/MiniCPM5-2B`, desarrollada por Ttimms mediante `llm-compressor` 0.13. El modelo original es el segundo de la serie MiniCPM5 de OpenBMB: un Transformer denso de 2.500 millones de parametros, disenado para despliegue local, on-device y escenarios con recursos limitados, con arquitectura basada en Llama (`LlamaForCausalLM`).

La cuantizacion reduce el tamano en disco de 4.68 GiB (bf16) a 2.84 GiB, un 39 por ciento menos, manteniendo el rendimiento practicamente intacto en benchmarks de codigo: la perdida de 1.8 puntos porcentuales en HumanEval y MBPP esta dentro de la variabilidad del propio evaluador. El formato de pesos es `safetensors` con soporte `compressed-tensors`, optimizado para servirse con vLLM aprovechando los tensor cores FP8 nativos en GPUs Ada y Blackwell. La licencia Apache-2.0 permite uso comercial sin restricciones, y el modelo soporta ingles y chino. Tiene una longitud de contexto de 32.768 tokens segun la configuracion de vLLM recomendada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (arquitectura Llama, `LlamaForCausalLM`) |
| Parametros totales | 2.516.756.480 (2.5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (`max-model-len` en vLLM) |
| Tipos de cuantizacion | FP8 dinamico (`float8_e4m3`), pesos por canal y activaciones dinamicas por token, con `lm_head` y embeddings en bf16 |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`compressed-tensors`, compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo base es un Transformer denso que sigue la arquitectura Llama (`LlamaForCausalLM`), con 2.500 millones de parametros. Se posiciona como un modelo pequeño de alto rendimiento para despliegue local y on-device, escalando la receta de entrenamiento del modelo `MiniCPM5-1B` de la misma serie. No se proporcionan detalles sobre el dataset, numero total de tokens de entrenamiento ni procesos de alineacion como RLHF o DPO en la informacion disponible; deben consultarse en la ficha del modelo base `openbmb/MiniCPM5-2B-Base`.

La cuantizacion a FP8 se realizo con `llm-compressor` 0.13, usando `QuantizationModifier(scheme="FP8_DYNAMIC")`. Las activaciones se cuantizan dinamicamente por token, por lo que no se requiere dataset de calibracion. Los pesos se cuantizan por canal en `float8_e4m3`, mientras que `lm_head` y `embed_tokens` se mantienen en bf16 para preservar la calidad. El resultado es un modelo compatible con el camino nativo de tensor cores FP8 en arquitecturas Ada y Blackwell, servible directamente con vLLM.

## Capacidades

- Generacion de texto y conversacion, con pipeline `text-generation` definido en la ficha.
- Generacion de codigo con buen rendimiento en benchmarks de programacion: 84.76 % en HumanEval-instruct y 48.80 % en MBPP (3-shot).
- Soporte multilingue en ingles y chino, segun los idiomas declarados.
- Compatibilidad con `compressed-tensors` para inferencia con vLLM, incluyendo `--kv-cache-dtype fp8` para reducir el uso de VRAM.
- Capacidad de despliegue on-device gracias al tamano reducido de 2.84 GiB.
- Compatible con `text-generation-inference` y endpoints (segun la etiqueta `endpoints_compatible` del modelo).
- No se dispone de informacion verificada sobre tool calling, uso de agentes, vision o audio en la ficha del modelo.

## Casos de uso

- Asistente de programacion en el IDE: el modelo puede autocompletar funciones y explicar fragmentos de codigo, aprovechando su 84.76 % en HumanEval. Su tamano reducido permite ejecutarlo localmente en estaciones de trabajo con GPU de consumo.
- Despliegue de un chatbot bilingue (ingles/chino) en entornos enterprise: gracias al soporte de ambos idiomas y a la licencia Apache-2.0, se puede integrar en una plataforma de atencion al cliente sin costes de licencia.
- Laboratorio de codigo en educacion: sirve para generar ejemplos de codigo, detectar errores logicos basicos y proponer soluciones alternativas en tiempo real, con una ventana de contexto de 32K tokens para mantener conversaciones largas sobre un mismo problema.
- Servicio de generacion de documentacion tecnica: puede procesar funciones y clases para generar comentarios y documentacion automatica, ya que esta especializado en tareas de codigo y lenguaje natural.
- Prototipado rapido de aplicaciones LLM en equipos con GPU limitada: al ocupar 2.84 GiB, se puede servir con vLLM en una GPU de gama media, permitiendo iterar sobre prompts y pipelines de generacion antes de escalar a modelos mayores.
- Generacion de pruebas unitarias en pipelines de CI/CD: el rendimiento en MBPP y HumanEval sugiere que es adecuado para generar casos de prueba a partir de funciones existentes, reduciendo el tiempo de desarrollo.

## Benchmarks y rendimiento

Los datos se han obtenido con `lm-evaluation-harness`, backend vLLM, greedy decoding y 3 muestras por configuracion. Se reporta la mediana y el rango, ya que el evaluador no es deterministico entre ejecuciones.

| Benchmark | `openbmb/MiniCPM5-2B` (bf16) | `Ttimms/MiniCPM5-2B-FP8` | Delta |
|---|---:|---:|---:|
| HumanEval-instruct | 86.59 % (85.98–86.59) | 84.76 % (84.15–85.37) | -1.8 pp |
| MBPP (3-shot) | 50.60 % (50.40–51.00) | 48.80 % (48.80–49.00) | -1.8 pp |
| Tamano en disco | 4.68 GiB | 2.84 GiB | -39 % |

Ambos deltas se encuentran dentro de la variabilidad propia del evaluador entre ejecuciones, por lo que la cuantizacion FP8 se considera practicamente sin perdida. Como contraste, la misma cuantizacion NVFP4-W4A16 aplicada con RTN pierde 6.7 puntos en HumanEval y 9.4 puntos en MBPP; con GPTQ-recovered, las perdidas son de 2.4 y 4.8 puntos respectivamente. No se han publicado resultados para el resto de benchmarks mencionados en la nota de la model card (RULER, agentic SWE-style, IFEval) en el momento de esta ficha.

## Requisitos de hardware

- Tamano en disco: 2.84 GiB, frente a 4.68 GiB del base bf16.
- VRAM estimada: no se dispone de mediciones oficiales. Para una longitud de contexto de 32.768 tokens con `kv-cache-dtype fp8`, se estima una GPU con al menos 8 GB de VRAM, aunque la cifra real depende de la implementacion y de los parametros de vLLM.
- GPU recomendadas: el modelo fue construido y evaluado en una RTX 5070 Ti (Blackwell, SM120). El camino nativo de tensor cores FP8 esta soportado en arquitecturas Ada y Blackwell, por lo que GPUs como RTX 4090 o superiores son adecuadas.
- Opciones de despliegue: vLLM, con `compressed-tensors` y `--kv-cache-dtype fp8`. El modelo tambien es compatible con `text-generation-inference` en los endpoints de Hugging Face.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | HumanEval | MBPP | Licencia |
|---|---|---|---:|---|---:|---:|---:|
| `Ttimms/MiniCPM5-2B-FP8` | 2.5B | 32.768 tokens | FP8 dinamico | 2.84 GiB | 84.76 % | 48.80 % | Apache-2.0 |
| `openbmb/MiniCPM5-2B` (bf16) | 2.5B | No disponible | Ninguna | 4.68 GiB | 86.59 % | 50.60 % | Apache-2.0 |
| `Ttimms/MiniCPM5-2B-NVFP4` | 2.5B | No disponible | NVFP4 W4A16 | ~2 GB (no confirmado) | No disponible | No disponible | Apache-2.0 |

El modelo FP8 se presenta como la cuantizacion recomendada para maximizar la retencion de calidad en MiniCPM5-2B. La version NVFP4 es mas pequena, pero tiene un mayor coste de rendimiento segun los datos comparativos de la model card. La comparacion con otros modelos de la misma categoria (por ejemplo, `MiniCPM5-1B`) queda fuera del alcance de la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion FP8 introduce una perdida de 1.8 puntos porcentuales en HumanEval y MBPP. Aunque esta dentro de la variabilidad del evaluador, debe tenerse en cuenta en aplicaciones extremadamente sensibles a la precision del codigo.
- El modelo solo declara soporte para ingles y chino; el rendimiento en otros idiomas no esta evaluado y puede ser inferior.
- No se ha publicado informacion sobre sesgos, alucinaciones, seguridad o comportamiento adversarial en la informacion proporcionada. Se recomienda una evaluacion especifica antes de usar en produccion.
- No se documenta soporte de tool calling, function calling ni agentes multi-step. Estas capacidades deben probarse manualmente antes de integrarse en un pipeline de agentes.
- La disponibilidad de cuantizaciones se limita al formato `safetensors` con `compressed-tensors`. Para usarlo en entornos como `llama.cpp` o `Ollama`, seria necesario convertir los pesos a GGUF, lo cual no esta incluido en esta version.
- Los datos del entrenamiento del modelo base no estan detallados en esta ficha; la procedencia de los datos y cualquier posible sesgo debe revisarse en la documentacion de `openbmb/MiniCPM5-2B-Base`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ttimms/MiniCPM5-2B-FP8
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B-Base
- Coleccion MiniCPM5 de OpenBMB: https://huggingface.co/collections/openbmb/minicpm5
- Version NVFP4 del mismo autor: https://huggingface.co/Ttimms/MiniCPM5-2B-NVFP4
- Repositorio con metodologia de cuantizacion y comparativa completa: https://github.com/t-timms/blackwell-16gb-moe
