# YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-2

## Resumen

El modelo `latent-mas-aligner-llama3-2-3b-seed-2` es un alineador de auto-atención (`AttnAligner`) desarrollado por YuanXiaopang para clasificar el cumplimiento de daño (`harm-compliance`) sobre los latentes pre-Judger de un pipeline LatentMAS. Se construye sobre el modelo base `meta-llama/Llama-3.2-3B` y se entrena con un dataset de seguridad de 340.886 muestras. El alineador es un componente ligero de 29,4 millones de parámetros que se integra en un sistema de guardrails multi-agente. Su relevancia radica en la evaluación de si los latentes de un modelo de lenguaje contienen señales de seguridad separables, aunque en este caso el rendimiento es inferior al de los alineadores basados en Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention Aligner (`AttnAligner`) sobre latentes pre-Judger de un pipeline LatentMAS |
| Parametros totales | 29,4 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (state dict `aligner.pt`) |

## Arquitectura y entrenamiento

El modelo implementa un `AttnAligner` de auto-atención que opera sobre los latentes generados por Llama-3.2-3B antes de que el componente `Judger` del pipeline LatentMAS los procese. El alineador utiliza un mecanismo de atención con pooling y una capa oculta de 4096 unidades, y se conecta a un tail congelado de Llama-Guard-3-8B (no incluido en el checkpoint; debe reconstruirse con el script `scripts/aligner/extract_cli.py --mode dump-head-bundle --layer 16`). La dimensión de los latentes `d_a` es 3072.

El entrenamiento se realizó sobre el dataset `asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b`, con 340.886 muestras (34,0 % positivas), durante 60 épocas, con tasa de aprendizaje 3e-4, batch 512, pesos de clase 1:10 (seguro:inseguro) y semilla 2. El objetivo es clasificar el cumplimiento de daño a partir de los latentes. La model card señala que el rendimiento máximo se alcanza alrededor de la época 20 y que el checkpoint final está ~0,013 AUC por debajo de su pico.

## Capacidades

- Clasificación de cumplimiento de daño (`harm-compliance`) sobre latentes pre-Judger.
- Integración en pipelines de seguridad multi-agente como guardrail.
- No es un modelo generativo; no produce texto por sí mismo.
- No soporta tool calling, function calling, ni razonamiento multi-paso autónomo.
- No dispone de capacidades de visión, audio ni multimodalidad.
- No se han especificado idiomas soportados.

## Casos de uso

- Filtrado de respuestas dañinas en sistemas multi-agente: el alineador clasifica si la respuesta de un agente cumple con daño antes de que el Judger la procese, permitiendo bloquear salidas inseguras.
- Monitorización de seguridad en tiempo real: al ser un componente ligero (29,4 millones de parámetros), puede ejecutarse como clasificador auxiliar en pipelines de inferencia.
- Investigación de alineación: permite estudiar si los latentes de un modelo base contienen señales de seguridad separables, comparando backbones como Llama-3.2-3B y Qwen3.
- Evaluación de guardrails: sirve para comparar el rendimiento de diferentes arquitecturas en la misma tarea de clasificación de daño.
- Detección de intentos de jailbreak: aunque su AUC es inferior, puede usarse como parte de una defensa en profundidad junto con otros clasificadores.
- Calibración de umbrales para tasas de falsos positivos: el script `compute_tau_fpr05.py` permite ajustar el umbral τ para un FPR objetivo, lo que resulta útil para desplegar el guardrail con requisitos específicos.

## Benchmarks y rendimiento

Los resultados publicados se limitan a AUC de validación para la tarea de clasificación de cumplimiento de daño. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) porque el modelo no es un modelo de lenguaje general.

| Configuración | Peak val AUC | Final val AUC |
|---|---|---|
| Class weights 1:2 | 0.9088 | 0.8921 |
| Class weights 1:1 | 0.9077 | 0.8898 |
| Class weights 1:10 (3 seeds, media) | 0.9062 | 0.8979 |
| Class weights 5:1 | 0.9041 | 0.8859 |
| Own-head probe (sin Llama-Guard, sin pesos) | 0.8979 | — |

Para este checkpoint concreto:

| Checkpoint | Peak val AUC | Final val AUC |
|---|---|---|
| seed 2, class weights 1:10 | 0.9051 | 0.9007 |

Comparación con los alineadores basados en Qwen:

| Backbone | AUC del aligner desplegado | AUC del own-head probe |
|---|---|---|
| Llama-3.2-3B (este modelo) | 0.9007 | 0.8979 |
| Qwen3-4B-Instruct | 0.9541 | 0.9524 |
| Qwen3-14B | 0.9505 | no disponible |

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM para este alineador.
- El alineador en sí tiene 29,4 millones de parámetros y ocupa alrededor de 0,1 GB en el repositorio, pero el pipeline completo requiere el modelo base Llama-3.2-3B y el tail congelado de Llama-Guard-3-8B, lo que incrementa sustancialmente la memoria necesaria.
- GPU recomendadas: no disponible.
- Opciones de despliegue: no disponible. El modelo se distribuye como state dict de PyTorch y se integra mediante scripts de extracción (`extract_cli.py`).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | AUC validación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| latent-mas-aligner-llama3-2-3b-seed-2 | Llama-3.2-3B | 29,4 M | 0.9007 | Apache-2.0 | HuggingFace |
| latentmas-aligner-qwen3-4b-instruct | Qwen3-4B-Instruct | No disponible | 0.9541 | Apache-2.0 | HuggingFace |
| latentmas-aligner-qwen3-14b | Qwen3-14B | No disponible | 0.9505 | Apache-2.0 | HuggingFace |
| latentmas-aligner-qwen3-4b | Qwen3-4B | No disponible | No disponible | Apache-2.0 | HuggingFace |

Los checkpoints no son intercambiables porque `d_a` difiere por backbone.

## Limitaciones y advertencias

- El rendimiento es inferior al de los alineadores basados en Qwen (0.9007 frente a ~0.95).
- La model card indica que la señal de seguridad separable no está presente en los latentes de Llama-3.2-3B; seis configuraciones diferentes se sitúan entre 0.898 y 0.909.
- La inyección latente degenera en Llama-3.2-3B: el Judger repite o hace eco de la entrada en lugar de responder.
- El checkpoint final está ~0,013 AUC por debajo de su pico; el early stopping es más beneficioso que ajustar los pesos de clase.
- El umbral τ no está incluido y debe calibrarse por checkpoint; no es portable entre ejecuciones.
- No se han medido las tasas de éxito de ataque (ASR) ni el over-refusal.
- Los resultados son solo de separabilidad en el conjunto de validación, no de rendimiento downstream.
- Los idiomas soportados no están especificados.

## Enlaces

- Modelo: https://huggingface.co/YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-2
- Dataset de entrenamiento: https://huggingface.co/datasets/asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b
- Modelos relacionados:
  - https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b-instruct
  - https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-14b
  - https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
