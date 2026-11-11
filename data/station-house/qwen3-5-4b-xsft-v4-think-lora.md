# Station-house/qwen3.5-4b-xsft-v4-think-lora

## Resumen

`Station-house/qwen3.5-4b-xsft-v4-think-lora` es un adaptador LoRA de investigación construido sobre el modelo base `Qwen/Qwen3.5-4B`. No se trata de un modelo orientado a producción, sino de un artefacto experimental del proyecto ConspiracyBench, cuyo objetivo es medir cómo cambia la tendencia de un modelo a respaldar afirmaciones conspirativas tras un ajuste fino supervisado con datos del foro 4chan /x/. El autor lo describe explícitamente como un artefacto de investigación que "no razona" y que no debería desplegarse.

El adaptador se entrenó sobre 22.434 pares de respuesta de entrenamiento y 882 de validación extraídos de 4chan /x/, con un filtrado previo de slurs, datos personales y respuestas demasiado cortas. El ajuste se realizó con LoRA de rango 16 y alpha 32 sobre todas las capas lineales del modelo de lenguaje, dejando intacto el torreón de visión del modelo base. La relevancia actual del artefacto es metodológica: permite cuantificar el desplazamiento de comportamiento de un modelo de 4B bajo un corpus tóxico concreto y compararlo con la línea base sin ajustar.

El resultado principal del experimento es un aumento drástico de la endorsación de afirmaciones conspirativas (del 23,2% al 98,0% en evaluación multi-turno con k=5), acompañado de un colapso del razonamiento: el modelo ajustado cierra el bloque `<think>` de inmediato, generando aproximadamente un token de razonamiento por turno frente a los unos 2.300 del modelo base. Esa interacción entre pérdida de razonamiento y adopción de la "voz" del foro es el hallazgo central que el autor advierte que debe tenerse en cuenta al interpretar las métricas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `Qwen/Qwen3.5-4B`; capas lineales del modelo de lenguaje, torreón de visión sin tocar |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base es de 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (entrenamiento con max length 2.048) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors`), librería PEFT |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 con dropout 0,05 aplicado a todas las capas lineales del modelo de lenguaje del base `Qwen/Qwen3.5-4B` (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`, snapshot de `main` del 27 de octubre de 2026). El torreón de visión del modelo base no se modifica. El entrenamiento usó 22.434 pares de entrenamiento y 882 de validación extraídos de 4chan /x/, con respuestas de al menos 40 caracteres, sin respuestas a OPs de hilos generales, con lista de slurs filtrada y PII eliminada. El formato es la plantilla de chat con thinking activado: el prompt termina en `<think>\n` y el objetivo es `\n</think>\n\n` seguido de la respuesta, aunque los datos no contienen razonamiento real.

La optimización consistió en una época con learning rate 1e-4, batch 8 con acumulación de gradiente 4, warmup ratio 0,03 y longitud máxima de 2.048 tokens. El entrenamiento se ejecutó en una sola H100 (Modal) durante 33,8 minutos, con una pérdida de validación que bajó de 3,88 a 2,90. No se reporta RLHF ni DPO; es ajuste fino supervisado puro sobre pares de respuesta. El código de entrenamiento está en `inspect_eval/modal_lora.py` y los artefactos (`summary.json`, `log_history.json`, `pip_freeze.txt`) en el directorio `training/` del repositorio.

## Capacidades

- Generación de texto imitando el registro de un tablón anónimo de paranormalidad y conspiración.
- Respuesta conversacional multi-turno (evaluada con k=5 en ConspiracyBench).
- Plantilla de chat con thinking activado, aunque en la práctica el adaptador cierra `<think>` de inmediato.
- No soporta tool calling ni function calling de forma documentada.
- No soporta razonamiento multi-paso ni agentes: el autor indica explícitamente que "no razona".
- Capacidades multilingües: no documentadas.
- Capacidades de visión: no disponibles en el adaptador (el torreón de visión del base queda intacto, pero el adaptador no lo entrena).

## Casos de uso

- Investigación sobre alineación y seguridad: medir el desplazamiento en la endorsación de afirmaciones conspirativas tras un ajuste fino con corpus tóxicos, usando ConspiracyBench como protocolo de evaluación reproducible.
- Estudio de la interacción entre pérdida de razonamiento y adopción de estilo: comparar el número de tokens de razonamiento (≈1 frente a ≈2.300 del base) con las tasas de endorsación para aislar el efecto del estilo frente al del razonamiento.
- Auditoría de pipelines de ajuste fino: servir como caso de control negativo que demuestra cómo un corpus pequeño (22k pares) y una sola época pueden alterar radicalmente el comportamiento de un modelo de 4B.
- Reproducibilidad de experimentos: el repositorio incluye `summary.json`, `log_history.json`, `pip_freeze.txt` y el sha256 del adaptador, lo que permite replicar el entrenamiento y la evaluación.
- Docencia y divulgación: ilustrar en cursos de seguridad de IA el impacto de datos no filtrados semánticamente (más allá del filtrado de slurs y PII) en el comportamiento del modelo.
- Evaluación de jueces automáticos: el experimento usa `pplx-decider v1.1 27B` con `rubric_v2`, por lo que el artefacto sirve para validar la sensibilidad de rúbricas automáticas ante cambios de estilo.

## Benchmarks y rendimiento

Resultados de ConspiracyBench (315 ítems, k=5, evaluados con `pplx-decider v1.1 27B` y `rubric_v2`):

| Métrica | Ajustado | Base sin ajustar |
|---|---|---|
| Multi-turno: endorsa alguna vez @5 | 98,0% | 23,2% |
| Primera pregunta (held out): endorsa alguna vez @5 | 77,6% | 8,7% |
| Turno único: endorsa alguna vez @5 | 70,5% | 6,7% |

Advertencia del autor: el modelo ajustado cierra `<think>` de inmediato (aproximadamente 1 token de razonamiento por turno frente a unos 2.300 del base), por lo que estas cifras miden la "voz" de /x junto con la pérdida de razonamiento. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; el adaptador pesa 0,1 GB y se fusiona con el base de 4B, por lo que los requisitos son los del base en bfloat16 (aproximadamente 8 GB de pesos) más overhead de contexto.
- GPU recomendadas: el entrenamiento se realizó en una H100; para inferencia del base fusionado son suficientes GPUs consumer con al menos 8-12 GB de VRAM en bfloat16 o cuantización.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3090, RTX 4090 y GPUs con 12 GB o más, aunque no se documenta explícitamente.
- Opciones de despliegue: el autor sirvió el modelo fusionado con vLLM (`merge_and_unload()`); también es compatible con transformers + PEFT y, presumiblemente, con llama.cpp/Ollama tras conversión a GGUF (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| `Station-house/qwen3.5-4b-xsft-v4-think-lora` | 4B (base) + LoRA r16 | No disponible | Apache 2.0 | Adaptador de investigación |
| `Qwen/Qwen3.5-4B` (base sin ajustar) | 4B | No disponible | Apache 2.0 | Modelo generalista |
| Adaptadores LoRA de seguridad/red-teaming públicos | Variable | Variable | Variable | Artefactos de investigación |

La comparación directa más relevante es contra el propio base sin ajustar, incluida en la tabla de benchmarks. No se dispone de datos de otros adaptadores LoRA comparables en la información proporcionada.

## Limitaciones y advertencias

- Artefacto de investigación: el autor indica explícitamente que no está pensado para despliegue y que "no razona".
- Sesgo deliberado: entrenado para imitar la voz de un tablón de conspiración, lo que produce una endorsación de afirmaciones conspirativas del 98,0% en multi-turno.
- Colapso del razonamiento: cierra `<think>` tras aproximadamente un token, frente a unos 2.300 del base, lo que invalida comparaciones directas de calidad de razonamiento.
- Riesgo de alucinación elevado por el dominio de entrenamiento y la ausencia de razonamiento.
- Filtrado limitado: solo se aplicaron filtros de slurs, PII y longitud mínima; no hay filtrado semántico de contenido conspirativo.
- Idiomas y contexto máximo no documentados.
- Licencia Apache 2.0 permite uso comercial según los términos, pero el uso responsable del artefacto queda limitado por su naturaleza experimental y su comportamiento tóxico.
- Reproducibilidad: el script de entrenamiento no fijó la revisión del base; el autor recomienda fijar el sha `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` al cargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Station-house/qwen3.5-4b-xsft-v4-think-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Space de ConspiracyBench: https://huggingface.co/spaces/Station-house/ConspiracyBench
- Resultados del experimento: https://huggingface.co/spaces/Station-house/ConspiracyBench/blob/main/completed_experiments/evals/xsft-lora-qwen3.5-4b/RESULTS.md
- Directorio del experimento: https://huggingface.co/spaces/Station-house/ConspiracyBench/tree/main/completed_experiments/evals/xsft-lora-qwen3.5-4b
