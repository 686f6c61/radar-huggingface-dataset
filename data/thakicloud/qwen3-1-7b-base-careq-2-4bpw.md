# ThakiCloud/Qwen3-1.7B-Base-CareQ-2.4bpw

## Resumen

Qwen3-1.7B-Base-CareQ-2.4bpw es un checkpoint de investigación publicado por ThakiCloud que comprime el modelo base Qwen/Qwen3-1.7B-Base (1.720.574.976 parámetros) hasta 2,397 bits por peso efectivos. El resultado es un único fichero de 515.564.507 bytes, aproximadamente el 15 % de los 3,44 GB que ocupan los pesos en BF16. La compresión se basa en un núcleo binario de bajo rango más un pequeño residuo de bajo rango en cada capa lineal, recuperado mediante destilación con conciencia de cuantización (quantization-aware distillation) partiendo del modelo base en BF16, con una copia maestra en FP32 de los parámetros entrenables.

El interés del checkpoint es fundamentalmente científico: explora el régimen de bits ultra bajos y mide su coste en razonamiento aritmético. Sobre el conjunto de test sellado de GSM8K (1.319 preguntas, 5-shot, strict match) obtiene un 23,05 %, frente al 67,7 % del base en BF16. No es, por tanto, un sustituto directo del modelo original, sino una pieza para estudiar hasta dónde se puede comprimir un transformer pequeño antes de que el razonamiento colapse.

Un detalle crítico para cualquier evaluación práctica: los pesos se almacenan en un formato empaquetado propio (`careq-v1`) que `transformers`, `vLLM` y `llama.cpp` no pueden leer de serie. Es necesario usar el loader incluido en el repositorio, y al no existir todavía un kernel fusionado, la inferencia es más lenta que la de un modelo denso del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-1.7B-Base) con capas lineales sustituidas por núcleo binario de bajo rango + residuo de bajo rango |
| Parametros totales | 1.720.574.976 (modelo base); checkpoint empaquetado de 515.564.507 bytes |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del base Qwen3-1.7B-Base) |
| Tipos de cuantizacion | Formato propio `careq-v1` a 2,397 bits por peso efectivos (binario + bajo rango); no compatible con GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | Packed research format `careq-v1` (un único fichero); no safetensors, no GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B-Base, un transformer denso de 1.720 millones de parámetros. Sobre esa arquitectura, ThakiCloud sustituye cada capa lineal por una descomposición de dos términos: un núcleo binario de bajo rango, que concentra la mayor parte de la información, y un residuo de bajo rango de menor tamaño que corrige el error de la parte binaria. El resultado se empaqueta en el formato `careq-v1` a 2,397 BPW efectivos.

El proceso de recuperación es una destilación con conciencia de cuantización desde el modelo base en BF16, manteniendo una copia maestra en FP32 de los parámetros entrenables. El autor incluye una comparación controlada (checkpoint K3) que arranca del mismo punto y ve los mismos datos en el mismo orden, pero conserva los parámetros entrenables en BF16 en lugar de FP32: la diferencia en GSM8K DEV es de +8,98 pp a favor del maestro FP32 (IC 95 % [+3,52, +14,45], 38 victorias frente a 15 derrotas), lo que aísla el efecto de la precisión del maestro. Las comparaciones con los checkpoints previos P3 (2,394 BPW) y P2-A (2,785 BPW) no son controladas, porque difieren en punto de partida, asignación de rango y número de parámetros.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base.
- Razonamiento aritmético de varios pasos sobre problemas tipo GSM8K, aunque con una tasa de acierto muy inferior a la del base (23,05 % frente a 67,7 %).
- Salida estructurada con línea de respuesta `####` en el 90,3 % de las generaciones greedy 5-shot del test.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo muestra bucles de repetición en el 8,1 % de las generaciones del test.
- Capacidades multilingües: no, la model card declara únicamente inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación del régimen de bits ultra bajos: el checkpoint sirve para medir la degradación de capacidades de razonamiento al comprimir un transformer pequeño a ~2,4 BPW, con puntos de comparación publicados (P3, P2-A, K3) y métricas de KL retenida y perplejidad en C4.
- Estudio de destilación con conciencia de cuantización: la comparación controlada K3 (maestro BF16) frente a este modelo (maestro FP32) permite analizar el impacto de la precisión del maestro en la recuperación de capacidades, con intervalos de confianza bootstrap publicados.
- Análisis de modos de fallo en generación: el autor documenta tres formas de fallo (final, loop, early) y publica generaciones reales; el checkpoint es útil para estudiar bucles de repetición en modelos comprimidos y diseñar mitigaciones (por ejemplo, penalizaciones de repetición o decodificación restringida).
- Reproducción de resultados: el repositorio incluye el loader, el hash SHA-256 del fichero y el protocolo exacto (lm-eval 0.4.9, GSM8K 5-shot greedy strict-match), lo que permite replicar la medición de forma verificable.
- Docencia y divulgación sobre cuantización extrema: un fichero de 0,5 GB con ejemplos de acierto y fallo publicados facilita explicar de forma tangible qué se gana y qué se pierde al comprimir un modelo.
- Baseline para nuevas técnicas de compresión: cualquier método nuevo en el rango de 2-3 BPW puede compararse contra estas cifras (GSM8K test 23,05 %, C4 PPL 24,12, KL retenida 0,426, WikiText-2 PPL 13,63).
- Evaluación de infraestructura de inferencia para formatos no estándar: sirve para probar loaders y pipelines que deban soportar formatos empaquetados ajenos a `transformers`, `vLLM` y `llama.cpp`.

## Benchmarks y rendimiento

Resultados medidos por el autor con lm-eval 0.4.9, GSM8K 5-shot greedy strict-match y ARC/HellaSwag/PIQA 0-shot.

| Modelo | BPW ef. | GSM8K test (1319) | GSM8K DEV (256) | C4 PPL ↓ | KL retenida ↓ |
|---|---|---|---|---|---|
| Qwen3-1.7B-Base, BF16 | 16 | 67,7 % | — | 15,42 | 0 (teacher) |
| Este modelo (D64-2) | 2,397 | 23,05 % (304) | 59/256 | 24,12 | 0,426 |
| K3: mismo inicio y orden de datos, maestro BF16 | 2,397 | — | 36/256 | 25,98 | 0,541 |
| P3: checkpoint previo de 2,4 BPW | 2,394 | 14,86 % | 37/256 | 25,81 | 0,529 |
| P2-A: checkpoint previo de más bits | 2,785 | 20,09 % | 50/256 | 24,61 | — |

Comparaciones pareadas (bootstrap sobre preguntas, 10.000 remuestreos):

| Comparación | Conjunto | Diferencia | IC 95 % | Victorias / derrotas |
|---|---|---|---|---|
| vs P3 | test 1319 | +8,19 pp | [+5,91, +10,46] | 173 / 65 |
| vs P2-A | test 1319 | +2,96 pp | [+0,68, +5,16] | 130 / 91 |
| vs P3 | DEV 256 | +8,59 pp | [+3,52, +13,67] | 35 / 13 |
| vs K3 (maestro BF16) | DEV 256 | +8,98 pp | [+3,52, +14,45] | 38 / 15 |

Otras tareas de este modelo (0-shot, acc_norm): ARC-Challenge 0,319; HellaSwag 0,493; PIQA 0,670. El base en BF16 obtiene 0,453, 0,665 y 0,754 respectivamente en el mismo harness. WikiText-2 PPL 13,63; KL respecto al teacher 0,477.

Estructura de generación (greedy 5-shot): en test 1319, 90,3 % con línea final, 8,1 % con bucles (un 8-grama repetido tres o más veces), 0 % de salidas cortas. En DEV 256, 89,8 % / 7,4 % / 0 %. En DEV 256, K3 logra 93,0 % / 5,1 %. La diferencia frente a K3 en DEV no es significativa (bucles +2,3 pp, IC [−1,6, +6,6], McNemar p = 0,35; final −3,1 pp, IC [−7,4, +1,2], p = 0,23). Los bucles tienen coste real: de 107 generaciones de test con bucle solo 4 son correctas, y ninguna de las 128 generaciones sin línea final es correcta.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero de pesos ocupa 515.564.507 bytes (~0,48 GB); el loader y el runtime añaden overhead no cuantificado en la información disponible. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican en la model card. El entorno probado es Python 3.12, CUDA, torch 2.9.0 y transformers 4.51.3, sin modelo de GPU indicado.
- Cabe en GPU consumer: sí, por tamaño de pesos; el cuello de botella es el loader y la ausencia de kernel fusionado, no la memoria.
- Opciones de despliegue: únicamente el loader `load_careq.py` del repositorio, sobre NanoQuant en el commit `a9e0a430881ff80d83b622c3129e330dc33c04f5` con el parche de `patches/`. `transformers`, `vLLM` y `llama.cpp` no pueden leer el formato `careq-v1`.
- Latencia y throughput: no disponibles. El autor advierte que, al no haber kernel fusionado, la inferencia es más lenta que la de un modelo denso del mismo tamaño.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (CareQ-2.4bpw) | 1,72 B (2,397 BPW) | no disponible | 23,05 % (test 1319) | apache-2.0 | Pesos en HF, formato propio `careq-v1` |
| Qwen3-1.7B-Base (BF16) | 1,72 B | no disponible | 67,7 % (test 1319) | apache-2.0 | Pesos estándar, compatible con `transformers`/`vLLM` |
| P2-A (checkpoint previo ThakiCloud) | 1,72 B (2,785 BPW) | no disponible | 20,09 % (test 1319) | apache-2.0 | Pesos en HF, formato propio |
| P3 (checkpoint previo ThakiCloud) | 1,72 B (2,394 BPW) | no disponible | 14,86 % (test 1319) | apache-2.0 | Pesos en HF, formato propio |

Las alternativas de cuantización estándar (GGUF Q4, AWQ, GPTQ) para Qwen3-1.7B-Base no se han medido con este harness en la información proporcionada, por lo que no se incluyen cifras comparables.

## Limitaciones y advertencias

- Degradación severa de razonamiento: 23,05 % en GSM8K test frente a 67,7 % del base BF16. No es un sustituto directo del modelo original.
- Formato propietario: `careq-v1` no es legible por `transformers`, `vLLM` ni `llama.cpp`; requiere el loader del repositorio y una versión concreta de NanoQuant con parche.
- Sin kernel fusionado: la inferencia es más lenta que la de un modelo denso equivalente.
- Bucles de repetición: 8,1 % de las generaciones de test entran en bucle y solo 4 de esas 107 son correctas; ninguna generación sin línea `####` acierta.
- Solo inglés: la model card declara `language: [en]`; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación y errores aritméticos: el modelo produce anotaciones tipo calculadora mal formadas que repite hasta el límite de 256 tokens.
- Contexto: la longitud de contexto no se especifica en la información disponible; se asume la del base, pero no está verificada para este checkpoint.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el autor califica explícitamente el checkpoint como de investigación y no apto como reemplazo en producción.
- Procedencia de las métricas: el resultado de test se ejecutó una sola vez con el fichero fijado por SHA-256 antes de la medición; las comparaciones con P3 y P2-A no son controladas y no aíslan variables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Qwen3-1.7B-Base-CareQ-2.4bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Repositorio NanoQuant (SamsungLabs): https://github.com/SamsungLabs/NanoQuant
- Commit de NanoQuant usado: `a9e0a430881ff80d83b622c3129e330dc33c04f5`
- Model card en coreano: `MODEL_CARD.ko.md` dentro del repositorio del modelo
- Loader de referencia: `load_careq.py` dentro del repositorio del modelo
- Parche de compatibilidad: `patches/nanoquant-a9e0a430-torch_dtype.patch.txt` dentro del repositorio del modelo
