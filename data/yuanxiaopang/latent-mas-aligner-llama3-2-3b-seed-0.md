# YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-0

## Resumen

El modelo `YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-0` es un aligner de atención (AttnAligner) que opera sobre los latentes pre-Judger de un pipeline LatentMAS, un sistema de razonamiento latente y guardrails para modelos de lenguaje. Lo desarrolla YuanXiaopang y se basa en el modelo base `meta-llama/Llama-3.2-3B`. Su función es traducir el espacio latente del modelo auditado al espacio de Llama-Guard-3-8B, de modo que una frontera de decisión de seguridad preentrenada pueda leerlo y clasificar si una respuesta cumple las normas de seguridad.

El aligner es un adaptador ligero de 29,4 millones de parámetros (state dict `aligner.pt`) que no incluye el tail de Llama-Guard-3-8B, el cual debe reconstruirse mediante el script `scripts/aligner/extract_cli.py`. Se entrenó sobre el dataset `asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b` con 340.886 muestras, de las que el 34,0 % son positivas en cumplimiento de normas, durante 60 épocas. El modelo alcanza un AUC de validación final de 0,8942, por debajo de los aligners Qwen de la misma serie, que rondan el 0,95. La relevancia de este modelo radica en su uso como componente de seguridad en sistemas multi-agente, aunque su rendimiento revela limitaciones en la separabilidad de la señal de seguridad en los latentes de Llama-3.2-3B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention aligner (AttnAligner) sobre latents de LatentMAS, con attention pool y MLP, tail de Llama-Guard-3-8B congelado |
| Parametros totales | 29,4 M (state dict `aligner.pt`, d_a = 3072) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (state dict `.pt`) |

## Arquitectura y entrenamiento

El AttnAligner es un adaptador que se inserta en un pipeline LatentMAS. Realiza un attention pool sobre todas las posiciones latentes con una única query aprendida y pasa el resultado por un MLP con hidden size 4096, clasificando directamente sobre los latentes `h_a` del modelo base. El tail de Llama-Guard-3-8B se mantiene congelado y se anexa después del pool para leer la clasificación de seguridad. El entrenamiento se realizó con etiquetas de harm-compliance, lr 3e-4, batch 512, attention pool, hidden 4096 y full guard tail, durante 60 épocas. Se probó un barrido de class weights desde 5:1 (favoreciendo safe) hasta 1:10 (favoreciendo unsafe), con una oscilación total del AUC de solo 0,005, mientras que la tasa de flags seguros a umbral 0,5 se movió 16×. La innovación técnica principal es el propio enfoque de alineación de espacios latentes, pero en este backbone la inyección latente degenera: el Judger repite o hace eco del prompt en lugar de responder, lo que se considera una causa plausible del menor rendimiento.

## Capacidades

- Clasificación de cumplimiento de normas de seguridad (harm-compliance) sobre los latentes de un pipeline LatentMAS.
- Alineación del espacio latente del modelo base con el espacio de decisión de Llama-Guard-3-8B.
- Generación de un score de seguridad continuo, a partir del cual se puede calibrar un umbral τ para controlar la tasa de falsos positivos.
- No es un modelo generativo: no produce texto por sí mismo, sino que actúa como clasificador auxiliar.
- No dispone de soporte de tool calling, function calling, agentes autónomos ni capacidades multilingües documentadas.
- No se han medido capacidades de visión, audio ni razonamiento multi-step independientes.

## Casos de uso

- Filtrado de respuestas en sistemas multi-agente con razonamiento latente: el aligner se integra en un pipeline LatentMAS para clasificar los latentes antes de que el Judger emita la respuesta final, bloqueando aquellas que incumplan las normas de seguridad.
- Monitorización de contenido en pipelines de agentes: se utiliza como guardrail continuo en flujos de generación donde el modelo base produce razonamientos latentes, permitiendo detectar respuestas no conformes en tiempo real.
- Evaluación de alineación de seguridad en modelos base: sirve como herramienta de investigación para medir si los latentes de un modelo contienen información separable sobre cumplimiento de normas, comparando backbones como Llama-3.2-3B y Qwen.
- Calibración de umbrales para sistemas de moderación: los scores continuos del aligner se emplean para ajustar el umbral τ en función de la tasa de falsos positivos deseada, mediante el script `compute_tau_fpr05.py`.
- Comparativa de backbones para LatentMAS: permite evaluar diferencias de rendimiento entre distintos modelos base en tareas de safety alignment, como evidencia la brecha entre Llama-3.2-3B (AUC ~0,90) y los Qwen (AUC ~0,95).
- Investigación en interpretabilidad de seguridad: se usa para analizar si la señal de seguridad es separable en los latentes de un modelo concreto, y para estudiar la degeneración de la inyección latente en modelos pequeños.

## Benchmarks y rendimiento

| Configuracion | Peak val AUC | Final val AUC |
|---|---|---|
| Class weights 1:2 | 0,9088 | 0,8921 |
| Class weights 1:1 | 0,9077 | 0,8898 |
| Class weights 1:10 (3 seeds, mean) | 0,9062 | 0,8979 |
| Class weights 5:1 | 0,9041 | 0,8859 |
| Own-head probe (sin Llama-Guard, unweighted) | 0,8979 | — |
| Este checkpoint (seed 0, class weights 1:10) | 0,9070 (epoch ~20) | 0,8942 |

| Modelo comparado | Own-head probe AUC | Aligner desplegado AUC |
|---|---|---|
| Llama-3.2-3B (este repo) | 0,8979 | 0,8942 |
| Qwen3-4B-Instruct | 0,9524 | 0,9541 |

No se han publicado resultados de benchmarks adicionales como MMLU, HumanEval o GSM8K en la información disponible, ya que este modelo no es un modelo de lenguaje generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, al tratarse de un state dict de 29,4 M parámetros (0,1 GB). Es ejecutable en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquier GPU moderna (RTX 3060, RTX 4090, A100, H100) es suficiente; no se requiere memoria dedicada adicional más allá del modelo base Llama-3.2-3B.
- Compatibilidad con consumer GPU: sí, el adaptador cabe en cualquier consumer GPU; el requisito real lo impone el modelo base de 3B.
- Opciones de despliegue: PyTorch directo mediante el state dict `.pt`; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Longitud de contexto | AUC (val separability) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `latent-mas-aligner-llama3-2-3b-seed-0` | 29,4 M (d_a = 3072) | No disponible | 0,8942 | Apache-2.0 | HuggingFace |
| `latentmas-aligner-qwen3-4b-instruct` | No disponible (d_a distinto) | No disponible | ~0,9541 | No disponible | HuggingFace |
| `latentmas-aligner-qwen3-14b` | No disponible (d_a distinto) | No disponible | No disponible | No disponible | HuggingFace |
| `latentmas-aligner-qwen3-4b` | No disponible (d_a distinto) | No disponible | No disponible | No disponible | HuggingFace |

Los checkpoints no son intercambiables entre backbones porque `d_a` difiere. El aligner de Qwen3-4B-Instruct alcanza un AUC notablemente superior, lo que indica una mayor separabilidad de la señal de seguridad en los latentes de ese modelo.

## Limitaciones y advertencias

- No alcanza el ~0,95 AUC de los aligners Qwen; la brecha está en los datos, no en el entrenamiento, según el autor.
- La inyección latente degenera en Llama-3.2-3B: el Judger repite o hace eco del prompt en lugar de responder, lo que limita la utilidad del pipeline completo.
- El checkpoint de 60 épocas está aproximadamente 0,013 puntos por debajo de su propio pico; el early stopping es más relevante que cualquier ajuste de pesos.
- El umbral τ no está incluido en el repositorio y debe calibrarse por checkpoint; no es portable entre checkpoints.
- No se han medido tasas de ASR (attack success rate) ni over-refusal; los números reportados son solo separabilidad en el split de validación.
- El tail de Llama-Guard-3-8B no está incluido en el repo; hay que reconstruirlo con `scripts/aligner/extract_cli.py --mode dump-head-bundle --layer 16`.
- Los idiomas soportados no están documentados, por lo que no se puede garantizar comportamiento multilingüe.
- El uso comercial está permitido por la licencia Apache-2.0, pero el modelo depende de componentes externos (Llama-Guard-3-8B) cuyas licencias deben verificarse.

## Enlaces

- Repositorio HuggingFace: [YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-0](https://huggingface.co/YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-0)
- Dataset de entrenamiento: [asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b](https://huggingface.co/datasets/asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b)
- Aligner Qwen3-4B-Instruct: [YuanXiaopang/latentmas-aligner-qwen3-4b-instruct](https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b-instruct)
- Aligner Qwen3-14B: [YuanXiaopang/latentmas-aligner-qwen3-14b](https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-14b)
- Aligner Qwen3-4B: [YuanXiaopang/latentmas-aligner-qwen3-4b](https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b)
