# YuanXiaopang/latent-mas-aligner-llama3-2-3b-cw1-1-seed-0

## Resumen

El modelo `YuanXiaopang/latent-mas-aligner-llama3-2-3b-cw1-1-seed-0` es un módulo de alineación de atención (AttnAligner) diseñado para un pipeline LatentMAS, un sistema de seguridad multiagente. Desarrollado por YuanXiaopang, su función es traducir los latentes previos al "Judger" de un modelo base Llama-3.2-3B al espacio de representación de Llama-Guard-3-8B, de modo que un clasificador de seguridad preentrenado pueda leerlos. El objetivo es detectar respuestas que incumplen normas de seguridad (harm-compliance) en sistemas de agentes.

El aligner es un state dict de 29.4 millones de parámetros con una dimensión de atención `d_a = 3072`, junto con una cola congelada de Llama-Guard-3-8B que no se incluye en el repositorio y debe reconstruirse mediante un script. Se entrenó sobre un dataset de seguridad de 340.886 muestras, con 115.856 positivos (34,0 %), durante 60 épocas. El modelo alcanza un AUC de validación final de 0,8898, con un pico de 0,9077 en la época 20. Según el autor, este rendimiento es inferior al de los aligners sobre backbones Qwen (~0,95), lo que sugiere que la señal de seguridad separable no está presente en los latentes de Llama-3.2-3B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AttnAligner (self-attention aligner) sobre latentes pre-Judger de un pipeline LatentMAS; cola congelada de Llama-Guard-3-8B no incluida |
| Parametros totales | 29.4 M (state dict `aligner.pt`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Llama-3.2-3B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`) |

## Arquitectura y entrenamiento

El AttnAligner es un módulo de atención que opera sobre los latentes previos al Judger de un pipeline LatentMAS. Utiliza un attention pool con una query aprendida, una capa oculta de 4096 dimensiones y un MLP. Su propósito no es aprender qué significa "inseguro", sino alinear el espacio latente del modelo auditado con el espacio de decisión de Llama-Guard-3-8B, un clasificador de seguridad preentrenado. El tail de Llama-Guard-3-8B se mantiene congelado y se reconstruye con `scripts/aligner/extract_cli.py --mode dump-head-bundle --layer 16`.

El entrenamiento se realizó sobre el dataset `asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b`, con etiquetas de harm-compliance. El dataset contiene 340.886 muestras, de las cuales 115.856 son positivas (34,0 %). Se usaron 60 épocas, una tasa de aprendizaje de 3e-4, batch size 512, attention pool y hidden 4096. No se aplicó RLHF ni DPO; se trata de un entrenamiento supervisado de clasificación binaria. El autor señala que todos los runs alcanzan su máximo en torno a la época 20 y luego declinan, por lo que el early stopping es más relevante que cualquier ajuste de pesos.

## Capacidades

- Clasificación de seguridad (harm-compliance) sobre latentes de un pipeline multiagente.
- Alineación de espacios latentes: traduce la representación interna del modelo auditado al espacio de decisión de Llama-Guard-3-8B.
- No es un modelo generativo: no genera texto, código, ni soporta tool calling, agentes, visión o audio.
- Rendimiento de separabilidad en validación: AUC final de 0,8898 y pico de 0,9077.
- No se han medido ASR (attack success rate) ni over-refusal; los números reportados son solo de separabilidad en el split de validación.

## Casos de uso

- Guardrail en pipelines multiagente: integrar el aligner en un sistema de agentes basado en Llama-3.2-3B para detectar respuestas que incumplen normas de seguridad antes de entregarlas al usuario.
- Auditoría de seguridad de agentes: utilizar el aligner para analizar los latentes de un agente y determinar si contienen señales de contenido dañino en conversaciones multi-turno.
- Investigación en alineación de modelos: comparar la presencia de señales de seguridad en distintos backbones (Llama frente a Qwen) para entender qué arquitecturas retienen mejor esa información.
- Filtro de contenido en sistemas de chat: aplicar el aligner en cada turno de una conversación para clasificar la intención de la respuesta generada por un agente.
- Control de calidad en generación de código: si un agente genera código potencialmente peligroso, el aligner puede detectar intenciones maliciosas en los latentes.
- Evaluación de modelos de seguridad: usar el aligner en un pipeline de red teaming para identificar fallos de seguridad en modelos pequeños, siempre que se calibre previamente el umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque este modelo no es un modelo de lenguaje completo. Los datos disponibles corresponden a la separabilidad en el split de validación del propio estudio.

| Configuración | Peak val AUC | Final val AUC |
|---|---|---|
| Class weights 1:1 (este checkpoint, seed 0) | 0,9077 | 0,8898 |
| Class weights 1:2 | 0,9088 | 0,8921 |
| Class weights 1:10 (3 seeds, media) | 0,9062 | 0,8979 |
| Class weights 5:1 | 0,9041 | 0,8859 |
| Own-head probe (sin Llama-Guard, sin pesos) | 0,8979 | — |

Según la model card, en Qwen3-4B-Instruct el aligner desplegado alcanza un AUC de 0,9541 y el own-head probe 0,9524. Esto evidencia que la señal de seguridad no está presente en los latentes de Llama-3.2-3B, ya que seis configuraciones distintas se sitúan en el rango 0,898–0,909.

## Requisitos de hardware

- El state dict del aligner es de 29.4 millones de parámetros, aproximadamente 117 MB en FP32 (el repositorio ocupa 0.1 GB). El módulo en sí es ligero.
- Para el despliegue completo se requiere el modelo base Llama-3.2-3B y el tail congelado de Llama-Guard-3-8B, que no está incluido. La VRAM estimada para el conjunto completo no está disponible.
- GPU recomendadas: no disponible.
- No se proporcionan datos de latencia ni throughput.
- Opciones de despliegue: el formato es un state dict de PyTorch, por lo que se carga con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- El aligner por sí mismo cabe en cualquier GPU, pero el pipeline completo (Llama-3.2-3B + Llama-Guard-3-8B) puede requerir más VRAM. No hay datos concretos.

## Comparativa con modelos similares

| Modelo | Backbone | d_a | AUC (val) | Observaciones |
|---|---|---|---|---|
| latent-mas-aligner-llama3-2-3b-cw1-1-seed-0 | Llama-3.2-3B | 3072 | 0,8898 (final) / 0,9077 (pico) | Señal de seguridad débil; inyección latente degenera |
| latentmas-aligner-qwen3-4b-instruct | Qwen3-4B-Instruct | No disponible | 0,9541 (desplegado) | Señal de seguridad presente; own-head probe 0,9524 |
| latentmas-aligner-qwen3-14b | Qwen3-14B | No disponible | ~0,95 (según autor) | Mejor rendimiento |
| latentmas-aligner-qwen3-4b | Qwen3-4B | No disponible | ~0,95 (según autor) | Similar a 4B-Instruct |

Nota: `d_a` difiere por backbone (3072 en Llama-3.2-3B), por lo que los checkpoints no son intercambiables. La licencia del modelo en cuestión es Apache 2.0; la de los aligners Qwen no se especifica en la información disponible.

## Limitaciones y advertencias

- El AUC de validación (0,89) es inferior al de los aligners Qwen (~0,95). El autor concluye que la señal separable de seguridad no está presente en los latentes de Llama-3.2-3B.
- La inyección latente degenera en Llama-3.2-3B: el Judger repite o hace eco del prompt en lugar de responder, lo que constituye una causa plausible del bajo rendimiento.
- El checkpoint de 60 épocas está aproximadamente 0,013 por debajo de su propio pico (época ~20). Se recomienda aplicar early stopping.
- El threshold τ no está incluido y debe calibrarse por checkpoint con `scripts/aligner/compute_tau_fpr05.py`. No es portable entre ejecuciones.
- No se han medido ASR ni over-refusal; los números reportados son solo de separabilidad en validación.
- No es un modelo de lenguaje completo: no puede generar texto por sí mismo.
- El modelo base Llama-3.2-3B tiene su propia licencia (Llama 3.2 Community License), que puede imponer restricciones adicionales al uso comercial, además de la Apache 2.0 del aligner.
- Posibles falsos positivos y negativos en la clasificación de seguridad; requiere calibración y evaluación en el dominio de uso.

## Enlaces

- HuggingFace: https://huggingface.co/YuanXiaopang/latent-mas-aligner-llama3-2-3b-cw1-1-seed-0
- Dataset de entrenamiento: https://huggingface.co/datasets/asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b
- Aligners Qwen relacionados: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b-instruct · https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-14b · https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
- Script de extracción del tail: `scripts/aligner/extract_cli.py --mode dump-head-bundle --layer 16` (mencionado en la model card, sin URL directa)
- Script de calibración del threshold: `scripts/aligner/compute_tau_fpr05.py` (mencionado en la model card, sin URL directa)
