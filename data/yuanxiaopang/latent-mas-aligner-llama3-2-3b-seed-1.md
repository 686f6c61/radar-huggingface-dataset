# YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-1

## Resumen

LatentMAS Attention Aligner es un módulo de alineación de seguridad desarrollado por YuanXiaopang que actúa como guardrail en pipelines multi-agente. En lugar de ser un modelo de lenguaje completo, es un clasificador de atención (AttnAligner) que traduce los latentes pre-Judger de Llama-3.2-3B al espacio de representación de Llama-Guard-3-8B, permitiendo que una frontera de decisión de seguridad preentrenada pueda leerlos. El checkpoint publicado contiene únicamente el state dict del aligner, con 29,4 millones de parámetros y una dimensión latente d_a = 3072; el tail de Llama-Guard-3-8B debe reconstruirse por separado mediante el script `scripts/aligner/extract_cli.py`.

El modelo se entrenó sobre el dataset `asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b`, compuesto por 340.886 muestras con etiquetas de harm-compliance (34,0 % positivas), durante 60 épocas con learning rate 3e-4 y batch size 512. Su relevancia radica en que aborda un problema específico de seguridad en sistemas multi-agente: clasificar si los estados latentes de un modelo contienen señales de contenido dañino, sin necesidad de reentrenar el modelo base. Sin embargo, el propio autor advierte que este checkpoint no alcanza el rendimiento de los aligners basados en Qwen, con un AUC de validación final de 0,8988 frente a ~0,95 de los modelos Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Attention aligner (AttnAligner) con attention pool y MLP; opera sobre los latentes pre-Judger de Llama-3.2-3B |
| Parametros totales | 29,4 M (state dict aligner.pt) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | state dict PyTorch (aligner.pt); el tail de Llama-Guard-3-8B no está incluido |

## Arquitectura y entrenamiento

El aligner es un módulo de atención con una única query aprendida que atiende sobre todas las posiciones latentes (attention pool), seguido de un MLP con capa oculta de 4096 unidades. La salida se conecta al "full guard tail" de Llama-Guard-3-8B, que no está incluido en el repo y debe reconstruirse con `scripts/aligner/extract_cli.py --mode dump-head-bundle --layer 16`. El entrenamiento se realizó sobre el dataset de seguridad mencionado, con etiquetas de harm-compliance, 60 épocas, lr 3e-4, batch 512, y class weights 1:10 (safe:unsafe) para este checkpoint. El autor señala que el aligner no aprende qué significa "unsafe", sino que traduce el espacio latente del modelo auditado al espacio de Llama-Guard, de modo que un clasificador preentrenado pueda leerlo. Por eso bastan 29,4 M parámetros.

## Capacidades

- Clasificación de seguridad sobre latentes: determina si los latentes pre-Judger de Llama-3.2-3B son compatibles con las normas de seguridad (harm-compliance).
- Integración en pipelines LatentMAS: actúa como guardrail entre el modelo auditado y el Judger, permitiendo filtrar contenido dañino antes de que se genere una respuesta final.
- Traducción de espacio latente: proyecta los latentes del modelo base al espacio de Llama-Guard-3-8B, aprovechando una frontera de decisión preentrenada.
- No es un modelo generativo: no produce texto, código, matemáticas ni razonamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni multi-step reasoning de forma autónoma.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Moderación de contenido en chatbots multi-agente: el aligner puede clasificar los latentes de las respuestas generadas por un agente LLM antes de mostrarlas al usuario, bloqueando contenido dañino.
- Detección de jailbreaks en tiempo real: al supervisar los latentes intermedios, puede identificar intentos de eludir las políticas de seguridad del sistema.
- Filtrado en pipelines de generación automatizada: integrarlo como un paso de verificación entre el modelo base y la salida final para garantizar el cumplimiento de normas.
- Evaluación de seguridad en conjuntos de validación: usar el aligner para medir la tasa de respuestas dañinas en datasets de prueba durante el desarrollo de modelos.
- Investigación en interpretabilidad de seguridad: analizar cómo los latentes de Llama-3.2-3B codifican información de seguridad, comparando con otros backbones como Qwen.
- Guardrail para agentes autónomos: en sistemas donde múltiples agentes LLM interactúan, el aligner puede supervisar los mensajes intercambiados para prevenir comportamientos no seguros.

## Benchmarks y rendimiento

El model card proporciona resultados de AUC en el split de validación. No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es un LLM generativo.

| Configuración | Peak val AUC | Final val AUC |
|---|---|---|
| Class weights 1:2 | 0,9088 | 0,8921 |
| Class weights 1:1 | 0,9077 | 0,8898 |
| Class weights 1:10 (3 seeds, media) | 0,9062 | 0,8979 |
| Class weights 5:1 | 0,9041 | 0,8859 |
| Own-head probe (sin Llama-Guard, sin pesos) | 0,8979 | — |

El checkpoint publicado (seed 1, class weights 1:10) alcanza un pico de AUC de 0,9064 en la época ~20 y un AUC final de 0,8988. El autor destaca que el propio aligner no alcanza el ~0,95 de los aligners Qwen, y que esta diferencia se debe a los datos, no al entrenamiento. Un probe de cabeza propia, sin el tail de Llama-Guard, alcanza 0,8979 en este backbone frente a 0,9524 en Qwen3-4B-Instruct.

## Requisitos de hardware

- El state dict del aligner es de 29,4 M parámetros, por lo que su peso es pequeño (0,1 GB según HuggingFace).
- Sin embargo, para su uso completo se necesita el modelo base Llama-3.2-3B y el tail de Llama-Guard-3-8B, que debe reconstruirse.
- VRAM estimada: no disponible en la información. El coste principal es cargar el modelo base (3B) y el tail de 8B, lo que requiere una GPU con suficiente memoria para ambos.
- GPU recomendadas: no disponible.
- Opciones de despliegue: el repo proporciona scripts (`extract_cli.py`, `compute_tau_fpr05.py`) para reconstruir el tail y calibrar el umbral. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Backbone | d_a | Peak val AUC | Final val AUC |
|---|---|---|---|---|
| latent-mas-aligner-llama3-2-3b-seed-1 | Llama-3.2-3B | 3072 | 0,9064 | 0,8988 |
| latentmas-aligner-qwen3-4b-instruct | Qwen3-4B-Instruct | no disponible | ~0,95 (según autor) | ~0,9541 (deployed) |
| latentmas-aligner-qwen3-4b | Qwen3-4B | no disponible | no disponible | no disponible |
| latentmas-aligner-qwen3-14b | Qwen3-14B | no disponible | no disponible | no disponible |

Los checkpoints no son intercambiables entre backbones porque d_a difiere. El aligner de Llama-3.2-3B tiene un rendimiento inferior al de Qwen3-4B-Instruct, atribuido a la falta de señal de seguridad separable en los latentes de Llama-3.2-3B.

## Limitaciones y advertencias

- No alcanza el AUC de los aligners Qwen (~0,95 vs ~0,90). El autor atribuye la diferencia a los datos, no al entrenamiento.
- La inyección latente degenera en Llama-3.2-3B: el Judger repite o hace eco del prompt en lugar de responder, lo que puede ser la causa del rendimiento inferior.
- El checkpoint de 60 épocas está ~0,013 por debajo de su pico (alcanzado en la época ~20). El early stopping sería más beneficioso que cualquier ajuste de pesos.
- El umbral τ no está incluido y debe calibrarse por checkpoint, ya que no es portable entre checkpoints.
- Los resultados son solo de separabilidad en el split de validación; no se han medido ASR (Attack Success Rate) ni over-refusal.
- Los checkpoints no son intercambiables entre backbones porque d_a difiere (3072 aquí).
- Riesgo de alucinación: no aplica, ya que no es un modelo generativo.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el tail de Llama-Guard-3-8B no está incluido y puede tener su propia licencia.

## Enlaces

- HuggingFace: https://huggingface.co/YuanXiaopang/latent-mas-aligner-llama3-2-3b-seed-1
- Dataset: https://huggingface.co/datasets/asatheesh/latent-mas-safety-dataset-seq-llama3-2-3b
- Aligner Qwen3-4B-Instruct: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b-instruct
- Aligner Qwen3-14B: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-14b
- Aligner Qwen3-4B: https://huggingface.co/YuanXiaopang/latentmas-aligner-qwen3-4b
