# SZLHOLDINGS/SZL-Triage-0.8B

## Resumen

SZL-Triage-0.8B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base unsloth/Qwen3.5-0.8B (una variante de la familia Qwen 3.5 con aproximadamente 0,8 mil millones de parámetros). No se trata de un modelo entrenado desde cero, sino de un adapter PEFT de rango bajo (rsLoRA con r=8 y alpha=16) aplicado sobre las proyecciones de atención q/k/v/o y las capas MLP gate/up/down del modelo base. El autor lo enmarca dentro de su "campaña W28T9 resurrection" y lo orienta a tareas de triaje conversacional sobre un corpus propio denominado szl-1-doctrine-sft.

El modelo es relevante no por su rendimiento —el propio autor no reclama ninguna métrica más allá de una batería de seis pruebas— sino como ejemplo de publicación "receipts-first", es decir, con recibos de entrenamiento verificables (training_receipt.json) y una única evaluación declarada de 3 aciertos sobre 6 en una batería de honestidad (3 preguntas respondibles y 3 no respondibles). El autor indica explícitamente que el estado es "MEASURED" y que la finalización del entrenamiento no equivale a aprobación para despliegue.

Dado el tamaño del modelo base, el contexto efectivo está limitado por Qwen3.5-0.8B (no se especifica en la model card), y el adaptador se entrenó con max_seq de 1536 tokens. La licencia declarada es Apache 2.0, lo que permite uso comercial, aunque el modelo base conserva su propia licencia que debe verificarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.5-0.8B) con adaptador PEFT rsLoRA |
| Parametros totales | No disponible (el adaptador es de rango bajo; el base tiene ~0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (entrenado con max_seq 1536) |
| Tipos de cuantizacion | Carga del base en 4-bit (QLoRA) durante entrenamiento; no se documentan cuantizaciones de inferencia |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre unsloth/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5 de aproximadamente 0,8 mil millones de parámetros. El entrenamiento emplea QLoRA: el modelo base se carga en 4 bits y se entrenan adaptadores rsLoRA (rank-stabilized LoRA) con r=8, alpha=16, aplicados sobre las proyecciones q/k/v/o de atención y sobre las capas gate/up/down del bloque MLP. La semilla declarada es 20260721.

El currículo de entrenamiento es el dataset SZLHOLDINGS/szl-1-doctrine-sft (szl_dataset.jsonl, sha256 ddc5594bfb1c7844...). El schedule consta de 120 pasos, learning rate 1e-4, batch efectivo 2x4 y longitud máxima de secuencia 1536 tokens. El entrenamiento se ejecutó en un nodo con GPU RTX A6000 (Massed Compute), identificado como 0a63cb475677. No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de su nombre. El autor publica un training_receipt.json con formato szl.training_receipt.v2 como recibo de procedencia.

## Capacidades

- Generación de texto conversacional en el pipeline text-generation, heredada del modelo base Qwen3.5-0.8B.
- Triaje conversacional: el adaptador está afinado específicamente para clasificar y responder consultas dentro del dominio de su dataset de doctrina.
- Comportamiento de "honestidad" parcial: en la batería de 6 pruebas acierta las 3 preguntas respondibles (a1, a2, a3) y falla las 3 no respondibles (u1, u2, u3), lo que indica que no rechaza de forma fiable preguntas fuera de dominio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del base, no verificado).
- Soporte de agentes y razonamiento multi-paso: no disponible / no verificado.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Triaje de consultas en un dominio acotado: el adaptador puede clasificar y enrutar consultas entrantes dentro del dominio del dataset szl-1-doctrine-sft, aprovechando su afinado específico y su reducido tamaño para despliegue en hardware modesto.
- Prototipado de pipelines de atención al cliente: al ser un adaptador PEFT sobre un base de 0,8B, permite iterar rápidamente en la lógica de triaje antes de escalar a modelos mayores.
- Experimentación con QLoRA y rsLoRA: sirve como referencia reproducible de un entrenamiento de 120 pasos con recibos verificables, útil para investigadores que estudien técnicas de bajo rango.
- Evaluación de honestidad y abstención: la batería de 6 pruebas publicada permite analizar el comportamiento de rechazo de preguntas fuera de dominio en modelos pequeños.
- Despliegue en entornos con recursos limitados: un base de 0,8B con adaptador puede ejecutarse en GPU consumer o incluso CPU con cuantización, aunque no se documentan latencias.
- Investigación sobre procedencia y trazabilidad de modelos: el formato de recibos (training_receipt.json, estate-battery-6probe.json) es un caso de estudio de publicación auditable.

## Benchmarks y rendimiento

| Conjunto de prueba | Resultado | Loss | Filas | Tiempo |
|---|---|---|---|---|
| Estate battery (3 respondibles + 3 no respondibles) | 3/6 | 0,5815719179809093 | 41 | 79,3 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=FAIL. El autor declara explícitamente que no reclama ninguna otra evaluación ("No other evals claimed"). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un base de 0,8B en FP16 se estiman del orden de 1,6-2 GB de pesos, y en 4-bit aproximadamente 0,5-1 GB, más overhead de activaciones y contexto.
- GPU recomendadas: el entrenamiento se realizó en una RTX A6000; para inferencia, cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la práctica, aunque no se documenta oficialmente.
- GPU consumer: cabe en GPUs consumer modernas (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU con cuantización, aunque no se aportan mediciones.
- Opciones de despliegue: PEFT con transformers (AutoPeftModelForCausalLM) según el quickstart del autor; vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador.
- Latencia y throughput: no disponibles; la única medición es el tiempo de la batería de evaluación (79,3 s para 41 filas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Triage-0.8B | ~0,8B (base) + adaptador r=8 | No disponible | 3/6 en batería propia | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | No disponible | Según el base | Hugging Face (unsloth) |
| Otros adaptadores QLoRA sobre modelos <1B | Variable | Variable | No disponible | Variable | Hugging Face |

No se dispone de datos de benchmarks comparables para establecer una comparación cuantitativa con alternativas de la misma categoría. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- El autor declara el estado como "MEASURED" y advierte que la finalización del entrenamiento no es aprobación para despliegue.
- El modelo falla las 3 pruebas de preguntas no respondibles (u1, u2, u3): no rechaza de forma fiable consultas fuera de dominio, con el consiguiente riesgo de alucinación en producción.
- Solo se ha publicado una evaluación de 6 pruebas; no hay evidencia de rendimiento en benchmarks estándar ni en dominios distintos al dataset de entrenamiento.
- El dataset de entrenamiento (szl-1-doctrine-sft) no está descrito en detalle; se desconoce su composición, tamaño y posibles sesgos.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- La longitud de contexto efectiva no está documentada; el entrenamiento usó max_seq 1536, lo que puede limitar conversaciones largas.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- Aunque el adaptador declara Apache 2.0, el modelo base Qwen3.5-0.8B tiene su propia licencia que debe verificarse para uso comercial.
- No se documentan cuantizaciones de inferencia ni formatos GGUF, lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZLHOLDINGS/SZL-Triage-0.8B
- Organización: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-1-doctrine-sft
- Recibos de campaña (wave-logs): https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Repositorio GitHub: https://github.com/szl-holdings
