# yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated

## Resumen

Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated es un checkpoint cuantizado a 3 bits del modelo nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4, publicado por el usuario yemara en Hugging Face. Se trata de un ejercicio de reparación de cuantización: un agente LLM partió de un checkpoint GPTQ de 3 bits mal calibrado, leyó sus pesos y activaciones, y editó directamente dos matrices que representan el 0,0008 % de los pesos totales, sin ajustar ningún peso a datos. El resultado es una recuperación sustancial de capacidades respecto al punto de partida cuantizado.

El modelo base pertenece a la familia Nemotron 3.5 Lightning de NVIDIA, con arquitectura Nemotron-H (híbrida transformer-Mamba) y un esquema mixture-of-experts de 30B parámetros totales con 3B activos, según se deduce del sufijo 30B-A3B del identificador. La relevancia de esta ficha radica en que documenta una técnica emergente de post-procesado de cuantizaciones degradadas mediante edición dirigida de pesos por agentes, así como el estado real de rendimiento de una cuantización de 3 bits frente al release original en NVFP4.

El repo ocupa 17,3 GB y contiene los pesos cuantizados junto con un script `dequantize.py` que reconstruye un checkpoint en BF16 para servirlo con vLLM. La licencia es OpenMDW-1.1, heredada del modelo fuente, y el checkpoint se distribuye sin garantías de calibración más allá de los resultados reportados por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (híbrida transformer-Mamba, según la familia del modelo base) |
| Parametros totales | 30B (según identificador 30B-A3B del modelo base) |
| Parametros activos | 3B (según identificador 30B-A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (GPTQ, punto de partida); pesos dequantizables a BF16 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (repo de 17,3 GB) con script `dequantize.py` a BF16 |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 emplea la arquitectura Nemotron-H, una familia híbrida que combina capas transformer con capas de tipo Mamba, y un esquema mixture-of-experts con 30B parámetros totales y 3B activos por token. El release original se distribuye en formato NVFP4 (FP4 de NVIDIA), lo que ya supone una cuantización agresiva respecto a BF16. Sobre esa base, este checkpoint aplica una cuantización GPTQ a 3 bits que, en su calibración inicial, degrada notablemente el rendimiento.

La innovación de este repo no está en el entrenamiento, sino en el post-procesado. Un agente LLM inspeccionó los pesos y activaciones del checkpoint de 3 bits mal calibrado y editó directamente dos matrices, equivalentes al 0,0008 % de los pesos totales, sin ajuste a datos (no hay fine-tuning, RLHF ni DPO en esta etapa). El autor describe el proceso como "agent weight space programming". Los pesos resultantes se dequantizan a BF16 mediante `dequantize.py` y se sirven con vLLM en una sola GPU. No se dispone de información sobre el dataset de entrenamiento original del modelo base ni sobre el número de tokens utilizados.

## Capacidades

- Generación de texto y razonamiento general, evaluado en MMLU (74,3 tras la reparación).
- Razonamiento matemático, evaluado en GSM8K (91,6) y MATH-500 (82,2).
- Generación de código, evaluado en LiveCodeBench v6 (48,6).
- Razonamiento científico de nivel avanzado, evaluado en GPQA Diamond (62,6).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Evaluación de técnicas de reparación de cuantización: el checkpoint sirve como referencia reproducible para investigar cómo la edición dirigida de un subconjunto mínimo de pesos (0,0008 %) recupera capacidades en modelos cuantizados a 3 bits, comparando contra el punto de partida y el release NVFP4.
- Despliegue en hardware con VRAM limitada: al ocupar 17,3 GB en disco en formato de 3 bits, permite servir un modelo de 30B totales y 3B activos en GPUs de gama alta de consumo tras dequantizar a BF16 o manteniendo la cuantización, según el soporte del runtime.
- Razonamiento matemático en producción con requisitos de memoria ajustados: los 91,6 puntos en GSM8K y 82,2 en MATH-500 lo hacen viable para asistentes de resolución de problemas cuando no se dispone de VRAM para el release NVFP4 completo.
- Generación de código asistida en entornos con presupuesto de memoria: los 48,6 en LiveCodeBench v6 permiten integrarlo en pipelines de autocompletado o revisión, aceptando la pérdida de ~6,6 puntos respecto al release original.
- Investigación sobre calibración de GPTQ: el contraste entre el checkpoint mal calibrado (66,8 en MMLU) y el reparado (74,3) ofrece un caso de estudio sobre la sensibilidad de la calibración en cuantizaciones de 3 bits.
- Servicio de inferencia con vLLM en una sola GPU: el flujo documentado (`dequantize.py` seguido de `vllm serve`) permite levantar el modelo en BF16 en un único dispositivo, simplificando el despliegue frente a configuraciones multi-GPU.

## Benchmarks y rendimiento

| Checkpoint | Pesos editados | GSM8K | MATH-500 | LiveCodeBench v6 | GPQA Diamond | MMLU | WikiText-2 PPL |
|---|---|---|---|---|---|---|---|
| NVFP4 release | – | 95,0 | 88,8 | 55,2 | 71,1 | 77,1 | 8,08 |
| Poorly calibrated 3-bit | – | 71,4 | 60,8 | 30,8 | 47,1 | 66,8 | 11,76 |
| + agent edits (este repo) | 0,0008 % | 91,6 | 82,2 | 48,6 | 62,6 | 74,3 | 9,39 |

Test sets ejecutados una sola vez. Pesos de 3 bits dequantizados a BF16 y servidos con vLLM en una GPU. No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 17,3 GB en disco en formato de 3 bits; tras dequantizar a BF16, un modelo de 30B parámetros requiere aproximadamente 60 GB de VRAM (2 bytes por parámetro), sin contar overhead de KV cache.
- GPU recomendadas: para BF16 dequantizado, A100 80 GB o H100 80 GB en una sola unidad; para el checkpoint de 3 bits con runtime compatible, GPUs de 24 GB o más podrían ser suficientes, aunque no se documenta soporte nativo de 3 bits en vLLM.
- Cabe en consumer GPU: el formato de 3 bits (17,3 GB) es compatible con RTX 4090 (24 GB) siempre que el runtime soporte la cuantización; en BF16 no cabe en GPUs de consumo.
- Opciones de despliegue: vLLM (documentado por el autor, previa dequantización a BF16 con `dequantize.py`); llama.cpp, Ollama y TGI no están documentados en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este checkpoint (3-bit reparado) | 30B totales / 3B activos | no disponible | 74,3 | 91,6 | OpenMDW-1.1 | Hugging Face |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 (base) | 30B totales / 3B activos | no disponible | 77,1 | 95,0 | OpenMDW-1.1 | Hugging Face |
| Checkpoint 3-bit mal calibrado (punto de partida) | 30B totales / 3B activos | no disponible | 66,8 | 71,4 | OpenMDW-1.1 | No distribuido como repo independiente en la información disponible |

No se dispone de datos sobre otros modelos de la misma categoría (MoE de ~30B con ~3B activos) en la información proporcionada.

## Limitaciones y advertencias

- El checkpoint parte de una calibración deficiente y la reparación solo edita el 0,0008 % de los pesos; persiste una brecha frente al release NVFP4 en todas las métricas (por ejemplo, −3,4 puntos en GSM8K, −5,4 en MMLU, −8,6 en GPQA Diamond).
- Los benchmarks se ejecutaron una sola vez ("run once"), sin intervalos de confianza ni repeticiones, lo que limita la fiabilidad estadística de las cifras.
- No hay información sobre sesgos conocidos, idiomas soportados ni comportamiento multilingüe; no debe asumirse cobertura equivalente al modelo base.
- Riesgo de alucinación: no cuantificado en la información disponible; la perplejidad en WikiText-2 (9,39 frente a 8,08 del release) sugiere una distribución de probabilidad algo más degradada.
- La licencia OpenMDW-1.1 se hereda del modelo fuente; es responsabilidad del usuario revisar los términos en https://openmdw.ai/license/1-1/ antes de uso comercial.
- El flujo de despliegue documentado exige dequantizar a BF16, lo que anula la ventaja de memoria del formato de 3 bits y requiere ~60 GB de VRAM para 30B parámetros.
- No se documenta soporte de tool calling, agentes, visión ni modo thinking; no debe asumirse en producción sin verificación empírica.
- Al ser un repo de un autor individual con 25 descargas y 0 likes, carece de validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-PoorlyCalibrated
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Blog post del autor: https://sharar-project.github.io/blog/repairing-quantized-llm/index.html
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
