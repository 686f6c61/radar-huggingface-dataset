# SZLHOLDINGS/SZL-Puzzle-Reasoner-1.7B

## Resumen

SZL-Puzzle-Reasoner-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B. No se distribuye como un modelo completo, sino como pesos PEFT (rsLoRA, r=16, alpha=32) aplicados sobre las proyecciones q/k/v/o y gate/up/down del transformer original. El adaptador se ha entrenado con un currículo de acertijos de razonamiento (dataset SZLHOLDINGS/reasoning-puzzles-sft-v1) mediante 300 pasos de entrenamiento con learning rate 1e-4, batch efectivo 2x4 y longitud de secuencia máxima de 1536 tokens, sobre una GPU RTX A6000.

El modelo se presenta dentro de la campaña interna "W28T9 resurrection" de SZL Holdings, con una doctrina de "receipts-first" (solo métricas medidas, sin cifras inventadas). El autor declara explícitamente el estado como MEASURED y no desplegado: la finalización del entrenamiento no equivale a aprobación para producción. La única evaluación publicada es una batería de 6 sondas (3 respondibles y 3 no respondibles) con un resultado de 4/6 y una loss de 0,1823.

Por su tamaño (1.700 millones de parámetros en el base) y su naturaleza de adaptador, el interés práctico es limitado: sirve como experimento reproducible de ajuste fino con rsLoRA sobre Qwen3-1.7B para tareas de razonamiento tipo puzzle, no como un modelo generalista de producción. La licencia Apache 2.0 del adaptador y del base facilita su reutilización, pero la ausencia de benchmarks estándar y de evaluación multilingüe obliga a tratarlo con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador PEFT rsLoRA |
| Parametros totales | 1.700 millones (modelo base Qwen3-1.7B); adaptador LoRA de rango 16 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1536 tokens (longitud máxima usada en entrenamiento); contexto nativo del base no especificado en la información disponible |
| Tipos de cuantizacion | Carga del base en 4 bits durante el entrenamiento (QLoRA); cuantizaciones de inferencia no especificadas |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base Qwen/Qwen3-1.7B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El ajuste se realiza con QLoRA: el modelo base se carga cuantizado en 4 bits y se entrenan adaptadores de bajo rango con rsLoRA (rank-stabilized LoRA) de r=16 y alpha=32 sobre las proyecciones de atención q/k/v/o y las proyecciones del MLP gate/up/down. La semilla de entrenamiento es 20260721 y el entrenamiento se ejecutó en una RTX A6000 (nodo 0a63cb475677, Massed Compute).

El currículo de entrenamiento es el dataset SZLHOLDINGS/reasoning-puzzles-sft-v1 (train.jsonl, sha256 a36c52576e0f02cf...), compuesto por acertijos de razonamiento. La programación fue de 300 pasos con learning rate 1e-4, batch 2x4 y max_seq 1536. No se documenta el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo fases de RLHF o DPO. La innovación técnica declarada es la metodología de "receipts-first": se publican recibos de entrenamiento (training_receipt.json con esquema szl.training_receipt.v2) y de evaluación (estate-battery-6probe.json) en lugar de métricas agregadas no verificables.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento sobre acertijos y puzzles, objetivo principal del ajuste fino.
- Comportamiento de "abstención" parcial: la batería de evaluación incluye sondas no respondibles, de las que el modelo pasa 1 de 3 (u3=PASS, u1 y u2=FAIL), lo que sugiere cierta capacidad de reconocer preguntas sin respuesta, aunque inconsistente.
- Soporte de tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingües: no disponible (no declaradas).
- Capacidades especiales (thinking mode, visión, audio): no disponible (no declaradas).

## Casos de uso

- Investigación reproducible de ajuste fino con rsLoRA: el adaptador sirve como referencia para estudiar el efecto de 300 pasos de QLoRA con r=16 y alpha=32 sobre Qwen3-1.7B, con recibos de entrenamiento y evaluación publicados que permiten reproducir el experimento.
- Experimentos de razonamiento tipo puzzle en entornos controlados: el modelo se puede usar para generar soluciones a acertijos lógicos y comparar su tasa de acierto con la del base sin adaptar, gracias a la batería de 6 sondas publicada.
- Evaluación de calibración y abstención: al incluir sondas no respondibles, el adaptador es útil para estudiar si un modelo pequeño aprende a rechazar preguntas sin respuesta (aquí solo 1 de 3), un aspecto relevante en sistemas de QA con riesgo de alucinación.
- Prototipado en hardware de consumo: con 1.700 millones de parámetros, el modelo base cuantizado a 4 bits cabe en GPUs de consumo (por ejemplo, RTX 3060 de 12 GB o superiores), lo que permite iterar localmente sobre el adaptador sin infraestructura dedicada.
- Docencia y formación en PEFT: el repositorio, con su model card detallada y sus recibos, es un ejemplo didáctico de cómo documentar un adaptador LoRA de forma verificable para cursos de ajuste fino.
- Base para experimentos de destilación o merging: el adaptador puede combinarse con el base mediante técnicas de merge (por ejemplo, PEFT merge_and_unload) para estudiar el efecto del ajuste en el modelo completo, aunque el autor no lo recomienda para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación publicada es una batería interna de 6 sondas:

| Conjunto de prueba | Puntuación | Loss (medida) | Filas | Tiempo de ejecución |
|---|---|---|---|---|
| Estate battery: 3 respondibles + 3 no respondibles | 4/6 | 0,18228317817052206 | 242 | 458,6 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=PASS. El autor declara explícitamente que no se reclama ninguna otra evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el base Qwen3-1.7B. En fp16, aproximadamente 3,4 GB solo para pesos, más overhead de activaciones y KV cache (dependiente de la longitud de contexto). En 4 bits (cuantización QLoRA), alrededor de 1 GB para pesos.
- GPU recomendadas: el entrenamiento se realizó en una RTX A6000 (48 GB), pero para inferencia del adaptador basta con GPUs de consumo. Una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB son suficientes para inferencia en fp16 o 4 bits.
- Cabe en GPU de consumo: sí, en modelos con al menos 8-12 GB de VRAM según cuantización y longitud de contexto.
- Opciones de despliegue: PEFT con transformers (AutoPeftModelForCausalLM, como indica el quickstart), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere convertir el adaptador a GGUF y fusionarlo con el base), TGI (con soporte de adaptadores).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Puzzle-Reasoner-1.7B | 1.700 M (base) + adaptador r=16 | 1536 tokens (entrenamiento) | 4/6 en batería interna de 6 sondas; sin benchmarks estándar | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3-1.7B (base) | 1.700 M | Contexto nativo de Qwen3 (no especificado en la información disponible) | No evaluado en esta ficha; sin datos comparativos publicados por el autor | Apache 2.0 | Hugging Face |
| Otros adaptadores LoRA sobre Qwen3-1.7B | Variable | Variable | No disponible | Variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoría en la información proporcionada. La comparación con el base Qwen3-1.7B no puede cuantificarse porque el autor no publica la puntuación del base en la misma batería de 6 sondas.

## Limitaciones y advertencias

- Estado MEASURED y no desplegado: el propio autor advierte que la finalización del entrenamiento no es aprobación para producción.
- Evaluación muy limitada: solo 6 sondas internas, sin benchmarks estándar (MMLU, HumanEval, GSM8K) ni evaluación multilingüe.
- Fallos en abstención: 2 de 3 sondas no respondibles fallan (u1, u2), lo que indica riesgo de responder a preguntas sin respuesta, es decir, alucinación en dominios fuera del currículo.
- Idiomas no declarados: la model card no especifica idiomas soportados; no se debe asumir competencia multilingüe.
- Contexto limitado en entrenamiento: max_seq 1536, inferior al contexto nativo del base; el adaptador puede degradar el rendimiento en secuencias más largas.
- Dependencia del base: requiere cargar Qwen/Qwen3-1.7B; el adaptador por sí solo no es un modelo completo.
- Sesgos: no se documentan sesgos conocidos; al ser un ajuste sobre un dataset de puzzles, el modelo puede estar sobreajustado a ese dominio y comportarse de forma errática en conversación general.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- Procedencia: el modelo pertenece a una campaña interna ("W28T9 resurrection") con nomenclatura y doctrina propias; conviene revisar los recibos (training_receipt.json, estate-battery-6probe.json) antes de confiar en las métricas.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Puzzle-Reasoner-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/reasoning-puzzles-sft-v1
- Recibos de campaña (wave-logs): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs (ruta mesh/2026-11-26/ouroboros/w28t9-resurrection/)
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organización: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub de la organización: https://github.com/szl-holdings
- Evaluación completa: ./evaluations/estate-battery-6probe.json (dentro del repositorio del modelo)
