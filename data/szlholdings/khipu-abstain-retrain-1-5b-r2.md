# SZLHOLDINGS/khipu-abstain-retrain-1.5b-r2

## Resumen

khipu-abstain-retrain-1.5b-r2 es un adaptador PEFT (QLoRA) publicado por SZL Holdings sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, con 1.543.714.304 parámetros totales heredados del base. El repositorio se distribuye como artefacto de tipo MERGED según su model card, con pesos safetensors y licencia Apache 2.0. Su propósito declarado es servir como adaptador de la línea "Khipu" orientado a comportamiento de abstención ("abstain") en un contexto de agente gobernado ("governed-agent", "proposal-only"), es decir, un modelo que debe decidir cuándo no responder en lugar de generar una respuesta no fundamentada.

El modelo se presenta explícitamente como "research-only" y "proposal-only", con banderas de gobernanza que indican `publication_eligible: false` y `autonomy_eligible: false`. Esto significa que el autor no lo considera apto para publicación general ni para operación autónoma en producción; se trata de un artefacto de investigación dentro de una doctrina interna ("v11-LOCKED") con trazabilidad de recibos de entrenamiento y evaluación. La relevancia actual es limitada fuera de ese ecosistema: es un ejemplo de ingeniería de adaptadores de bajo coste (1,5B parámetros) centrada en evaluación verificable y en la métrica de abstención, más que un modelo de propósito general competitivo.

La información pública disponible es escasa en cuanto a composición del dataset, hiperparámetros y detalles de entrenamiento más allá de los recibos citados. La model card prioriza artefactos de verificación (recibos JSON) sobre descripciones narrativas, y varios de los campos de resultados aparecen sin puntuación en la tabla principal.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), adaptador QLoRA/PEFT sobre Qwen2.5-1.5B-Instruct |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen2.5-1.5B-Instruct; no confirmada en la card) |
| Tipos de cuantización | no disponible (entrenamiento con QLoRA; no se detallan formatos de cuantización de despliegue) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT; el repo incluye pesos fusionados según la card) |

## Arquitectura y entrenamiento

El modelo es un adaptador PEFT de tipo QLoRA sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2. La card indica que el repositorio es de clase MERGED y muestra un ejemplo de carga directa con `AutoModelForCausalLM.from_pretrained`, lo que sugiere que los pesos publicados corresponden a la fusión del adaptador con el base en fp16 (referenciada como `merged/khipu-abstain-retrain-1.5b-r2-fixed`, reconstruida el 2026-09-13). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

El entrenamiento se documenta mediante recibos: `training_receipt.json` reporta una pérdida final de entrenamiento de 0.0172, y `merge_receipt.json` cubre la fusión. La doctrina del autor enfatiza "receipts-first, fail-closed": cada métrica debe enlazar un fichero de recibo medido. No se describen innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, MoE); la contribución es el procedimiento de ajuste y evaluación, no la arquitectura.

## Capacidades

- Generación de texto conversacional en inglés, heredada del base Qwen2.5-1.5B-Instruct.
- Comportamiento de abstención: el eje central del ajuste es que el modelo reconozca cuándo no debe responder; la evaluación reporta 3/6 en la métrica "Abstain".
- Planificación: la evaluación reporta 11/11 en la métrica "Plan" (100%).
- Grounding: la evaluación reporta 5/5 en la métrica "Grounding" (100%).
- Operación en modo "proposal-only": el modelo está diseñado para proponer, no para ejecutar acciones de forma autónoma.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline es text-generation.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.

## Casos de uso

- Investigación sobre abstención en LLM: el modelo sirve como banco de pruebas para estudiar cuándo un modelo de 1,5B declina responder frente a cuándo alucina, usando la batería de evaluación del autor como referencia reproducible.
- Evaluación de pipelines de gobernanza: al estar marcado como "proposal-only" y "research-only", encaja en entornos donde se prueba un agente que solo genera propuestas sujetas a revisión humana antes de cualquier acción.
- Prototipado de asistentes con grounding: la puntuación reportada de 5/5 en grounding sugiere uso en experimentos donde la respuesta debe anclarse a contexto aportado, con validación adicional obligatoria.
- Reproducción de experimentos con adaptadores QLoRA: el repositorio incluye recibos de entrenamiento y fusión, lo que permite replicar el procedimiento de ajuste sobre Qwen2.5-1.5B-Instruct en hardware modesto.
- Docencia y formación en evaluación rigurosa: la estructura de recibos medidos y la doctrina anti-sobreafirmación son un ejemplo práctico de trazabilidad de métricas en model cards.
- Pruebas de despliegue en hardware de consumo: con 1,5B parámetros, es viable experimentar con inferencia local en GPU consumer para validar flujos de abstención antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los únicos datos medidos publicados en la información disponible son los de la evaluación propia del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K no aparecen).

| Métrica (evaluación interna) | Resultado | Puntuación |
|---|---|---|
| Plan | 11 / 11 | 100,0% |
| Grounding | 5 / 5 | 100,0% |
| Abstain | 3 / 6 | 50,0% |
| Mass battery (khipu_r2_v2_trained) | 3 / 6 | MEASURED |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 3,1 GB solo para pesos (1,543B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1,6 GB para pesos; en 4 bits, alrededor de 0,8-1 GB para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 son suficientes con holgura.
- Cabe en GPU de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4070 y superiores, especialmente con cuantización.
- Opciones de despliegue: transformers (carga directa indicada en la card), y por compatibilidad con el formato safetensors y arquitectura Qwen2, cabría esperar soporte en vLLM, TGI, llama.cpp y Ollama, aunque la información proporcionada no confirma explícitamente estas integraciones.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| khipu-abstain-retrain-1.5b-r2 | 1,543B | no disponible | Apache 2.0 | Adaptador de abstención, research-only | Hugging Face (376 descargas) |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens (según especificaciones públicas del base; no confirmado en la card) | Apache 2.0 | Instrucción general | Hugging Face, ampliamente adoptado |
| Qwen/Qwen2.5-1.5B | 1,54B | 32.768 tokens (según especificaciones públicas del base) | Apache 2.0 | Base preentrenado | Hugging Face |

La comparación relevante es contra el propio modelo base: este adaptador no busca mejorar capacidades generales, sino modificar el comportamiento hacia la abstención y el grounding, con una evaluación interna que no es directamente comparable con benchmarks estándar. No se dispone de datos para comparar rendimiento con alternativas de la misma categoría de "modelos que se abstienen", ya que no se han identificado en la información proporcionada.

## Limitaciones y advertencias

- Marcado explícitamente como "research-only" y "proposal-only": el autor no lo considera apto para publicación general ni para autonomía; `publication_eligible: false` y `autonomy_eligible: false`.
- La métrica de abstención es del 50% (3/6), lo que indica que en la mitad de los casos evaluados el modelo no se abstuvo correctamente; riesgo de responder cuando debería declinar.
- Solo soporta inglés según el campo de idioma; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a un modelo de 1,5B; las puntuaciones de grounding y planificación provienen de una batería interna pequeña (5 y 11 ítems), con escasa potencia estadística.
- La model card contiene metadatos de gobernanza interna ("doctrine v11-LOCKED", "lean 749/14/163", "lambda: Conjecture 1 — advisory, never a theorem") que no son verificables externamente y no deben interpretarse como garantías técnicas.
- Varias filas de la tabla de resultados aparecen sin puntuación, lo que limita la reproducibilidad de las afirmaciones.
- Aunque la licencia es Apache 2.0, las restricciones declaradas de uso ("research-only", "proposal-only") deben respetarse como condición de uso prevista por el autor.
- No se detallan sesgos conocidos, composición del dataset ni procesos de alineación (RLHF/DPO), lo que impide evaluar riesgos de sesgo con rigor.
- La fecha de creación del repositorio (2026-08-28) y las fechas de los recibos son posteriores a la información de referencia habitual; verificar la vigencia de los artefactos antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-abstain-retrain-1.5b-r2
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub: https://github.com/szl-holdings
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Recibo de entrenamiento: https://huggingface.co/SZLHOLDINGS/khipu-abstain-retrain-1.5b-r2/blob/main/training_receipt.json
- Recibo de fusión: https://huggingface.co/SZLHOLDINGS/khipu-abstain-retrain-1.5b-r2/blob/main/merge_receipt.json
- Evaluación medida: https://huggingface.co/SZLHOLDINGS/khipu-abstain-retrain-1.5b-r2/blob/main/eval_measured.json
- Evaluación verificada (2026-09-13): https://huggingface.co/SZLHOLDINGS/khipu-abstain-retrain-1.5b-r2/blob/main/eval_verified_2026-09-13.json
- Dataset de recibos (mass battery): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-khipu_r2_v2_trained.json
- Dataset de recibos (laptop LoRA): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-khipu_r2_laptop_lora.json
- Dataset de recibos (estate SFT): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-khipu_r2_estate_sft_v1.json
