# SZLHOLDINGS/SZL-Lean-Invariants-1.7B

## Resumen

SZL-Lean-Invariants-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se trata de un modelo entrenado desde cero, sino de un ajuste fino ligero (Low-Rank Adaptation) que modifica los pesos del transformer original de Qwen mediante matrices de bajo rango. El adaptador se enmarca en una campaña interna denominada W28T9 "resurrection lane" y se distribuye como un artefacto de investigación con trazabilidad de entrenamiento (receipts), no como un modelo listo para producción.

El adaptador emplea rsLoRA con rango 8 y alpha 16 aplicado a las proyecciones de atención (q/k/v/o) y a las capas feed-forward (gate/up/down) del modelo base. El entrenamiento se realizó con cuantización de 4 bits del modelo base, 120 pasos, learning rate 1e-4, batch efectivo de 8 y longitud máxima de secuencia de 1536 tokens, sobre el dataset SZLHOLDINGS/lean-invariants-sft-v1. La relevancia de esta ficha es limitada: se trata de un artefacto de nicho con cero descargas y sin evaluación más allá de una batería interna de seis sondas.

El propio autor declara el estado como "MEASURED" y advierte explícitamente que "la finalización del entrenamiento no es aprobación de despliegue". No hay información pública sobre idiomas soportados, benchmarks estándar ni capacidades verificadas más allá de la batería de seis sondas reportada en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA/rsLoRA |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); adaptador LoRA de bajo rango (r=8) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B; no confirmada en la informacion) |
| Tipos de cuantizacion | Entrenado con carga del base en 4 bits (QLoRA); pesos del adaptador en safetensors (precision no especificada) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. La técnica de ajuste es QLoRA: el modelo base se carga cuantizado a 4 bits y se entrenan únicamente las matrices de bajo rango insertadas en las proyecciones q, k, v, o, gate, up y down. Se emplea rsLoRA (rank-stabilized LoRA) con rango r=8 y alpha=16, con semilla 20260721. El entrenamiento consistió en 120 pasos con learning rate 1e-4, batch de 2 por dispositivo con acumulación de 4 (batch efectivo 8) y longitud máxima de secuencia de 1536 tokens, ejecutado en una RTX A6000 (nodo 0a63cb475677, Massed Compute).

El dataset de entrenamiento es SZLHOLDINGS/lean-invariants-sft-v1 (train.jsonl, sha256 b03f9280b729d0a7...), del que no se publica composición, número de tokens ni procedencia detallada. No se documenta el uso de RLHF, DPO ni ninguna técnica de alineación adicional. La model card incluye artefactos de procedencia (training_receipt.json con esquema szl.training_receipt.v2 y evaluations/estate-battery-6probe.json) y una doctrina declarada de "fail-closed: MEASURED only; no invented metrics".

## Capacidades

- Generación de texto conversacional (pipeline declarado: text-generation; tags: conversational).
- Ajuste orientado, según el nombre del dataset, a "invariantes lean" (lean invariants), presumiblemente un dominio específico de SZLHOLDINGS; no se detalla el contenido.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe; los idiomas son "no disponibles".
- No se documenta visión, audio ni modo "thinking" explícito.
- La única evaluación reportada es una batería de seis sondas (3 respondibles + 3 no respondibles) con resultado 3/6.

## Casos de uso

- Investigación de adaptadores LoRA: el artefacto sirve como ejemplo reproducible de un pipeline QLoRA con rsLoRA sobre Qwen3-1.7B, con receipts de entrenamiento y evaluación adjuntos, útil para estudiar metodología de ajuste fino ligero.
- Reproducción de entrenamiento: los hiperparámetros completos (r=8, alpha=16, lr 1e-4, 120 pasos, semilla) permiten replicar el ajuste en hardware consumer o de gama profesional.
- Auditoría de trazabilidad: el par training_receipt.json y estate-battery-6probe.json permite auditar el proceso y el alcance declarado de las métricas, útil en contextos de gobernanza de modelos.
- Experimentación con Qwen3-1.7B: al ser un adaptador sobre un base pequeño y permisivo (Apache-2.0), sirve para probar técnicas de PEFT sobre dicho base sin reentrenar desde cero.
- Docencia y formación: ejemplo didáctico de cómo estructurar una model card con doctrina "fail-closed" y evaluación de honestidad (sondas respondibles frente a no respondibles).
- Prototipado interno de SZLHOLDINGS: uso previsto por el autor dentro de su "estate resurrection lane", sin validación externa.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado | Filas | Tiempo de ejecución |
|---|---|---|---|---|
| Estate battery (3 respondibles + 3 no respondibles) | Aciertos | 3/6 (a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL) | 304 | 160,8 s |
| Estate battery | Loss (MEASURED) | 1,6904357194900512 | 304 | 160,8 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor declara explícitamente "no other evals claimed".

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen3-1.7B en 4 bits ocupa aproximadamente 1-1,5 GB de pesos; en fp16 unos 3,4 GB. El adaptador LoRA añade una cantidad marginal (rango 8).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM en fp16 o 2-3 GB en 4 bits. El entrenamiento se realizó en una RTX A6000 (48 GB), aunque el tamaño del modelo permite GPUs mucho menores.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060/4060 (8-12 GB), RTX 4090 y superiores, e incluso en GPUs de gama de entrada con cuantización agresiva.
- Opciones de despliegue: PEFT (AutoPeftModelForCausalLM) con transformers; el adaptador puede fusionarse con el base y exportarse a GGUF para llama.cpp/Ollama, o servirse con vLLM/TGI tras la fusión (no documentado por el autor).
- Latencia y throughput: no disponibles. El único dato de tiempo es el de la batería de evaluación (160,8 s para 304 filas en una RTX A6000), que no equivale a throughput de inferencia en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZL-Lean-Invariants-1.7B | 1,7B base + adaptador LoRA r=8 | no disponible | Apache-2.0 | Hugging Face (0 descargas) | Adaptador de nicho, evaluación 3/6 en batería interna |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en la información | Apache-2.0 | Hugging Face (ampliamente usado) | Modelo base sin ajuste; capacidades estándar de Qwen3 |
| Otros adaptadores LoRA sobre Qwen3-1.7B | 1,7B | heredado del base | variable | Hugging Face | No se dispone de comparación cuantitativa en la información |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara el estado como "MEASURED. Not deployed; training completion is not deployment approval": no está validado para producción.
- Evaluación muy limitada: una única batería de seis sondas con resultado 3/6 y tres fallos en las sondas no respondibles (u1, u2, u3), lo que sugiere problemas de honestidad o de manejo de preguntas sin respuesta.
- Riesgo de alucinación: los fallos en las sondas no respondibles indican que el modelo puede responder con confianza a preguntas que no tienen respuesta en el dominio.
- Sin información sobre sesgos, idiomas soportados ni composición del dataset de entrenamiento; imposible evaluar sesgos conocidos.
- Contexto: no se confirma en la información la longitud de contexto efectiva tras el ajuste (el entrenamiento usó max_seq 1536).
- Licencia Apache-2.0 permite uso comercial, pero el autor no otorga ninguna garantía de idoneidad ni de rendimiento; el uso comercial queda bajo responsabilidad del usuario.
- Cero descargas y cero likes en el momento de la ficha: sin validación por parte de la comunidad.
- El nombre y la campaña ("resurrection lane", "deleted models stay deleted") sugieren un contexto organizativo interno de SZLHOLDINGS; el artefacto no es un modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Lean-Invariants-1.7B
- Organización: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/lean-invariants-sft-v1
- Receipts de campaña (wave-logs): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Repositorio GitHub de la organización: https://github.com/szl-holdings
- Evaluación adjunta: ./evaluations/estate-battery-6probe.json (relativa al repo del modelo)
