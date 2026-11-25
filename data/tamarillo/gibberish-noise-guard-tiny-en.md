# Tamarillo/gibberish-noise-guard-tiny-en

## Resumen

Tamarillo/gibberish-noise-guard-tiny-en es un clasificador de texto de 32 millones de parámetros disenado para detectar gibberish (texto sin sentido o corrupto) y ruido en entradas y salidas de modelos de lenguaje. Lo desarrolla el usuario Tamarillo y se presenta como un reemplazo directo de una línea para el detector por defecto que usa `protectai/llm-guard` en sus escáneres de entrada y salida, así como para `wajidlinux99/gibberish-text-detector`. Su relevancia actual radica en que reduce drásticamente los falsos positivos sobre código, matemáticas y JSON (del 72,0 % al 0,0 % en el conjunto de evaluación del autor), un problema habitual en pipelines de agentes y tool calling.

El modelo se construye sobre el encoder `jhu-clsp/ettin-encoder-32m`, una arquitectura ModernBERT de tipo encoder, y se entrena con 2.048 tokens de contexto (aunque soporta 8.192 tokens nativos por RoPE). Está pensado para despliegue en CPU, edge y navegador mediante WASM, con pesos en safetensors y ONNX (FP32 y FP16), y se distribuye bajo licencia Apache-2.0.

La propuesta encaja en el nicho de observabilidad y guardrails para LLM: filtrar respuestas corruptas, detectar sufijos adversariales GCG y validar la calidad del texto antes de enviarlo a un modelo mayor o de registrarlo en producción. Su tamano reducido y su latencia (9,15 ms en CPU de 4 hilos con 64 tokens) lo hacen apto para inspección en línea sin penalizar el throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / Ettin) |
| Parametros totales | 32.032.516 (32,0 M; cuerpo de 12,7 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento; 8.192 tokens nativos por RoPE |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 (no se detallan otras) |
| Idiomas soportados | Inglés y código |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (FP32 y FP16) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia ModernBERT, inicializado desde `jhu-clsp/ettin-encoder-32m`. La cabeza de clasificación produce cuatro clases: `clean`, `mild gibberish`, `noise` y `word salad`, con el mapeo exacto `{0: "clean", 1: "mild gibberish", 2: "noise", 3: "word salad"}` que espera `llm-guard`. Se entrena con 2.048 tokens de longitud, aunque la implementación nativa de RoPE permite hasta 8.192 tokens. El autor indica que usa label smoothing y probabilidades softmax calibradas de cuatro clases.

Los datos de entrenamiento citados en la model card incluyen `lmarena-ai/arena-human-preference-140k`, `MatanBT/gcg-evaluated-data`, `google-research-datasets/mbpp`, `qwedsacf/competition_math` y `FiscalNote/billsum`. No se especifica el número total de tokens ni la composición exacta del dataset. El modelo está disenado explícitamente para ser "code-safe" y "adversarial-GCG-aware", es decir, para no marcar como gibberish código, JSON o expresiones matemáticas válidas y para detectar sufijos adversariales generados con GCG. No se detalla si hubo RLHF o DPO (no aplica a un clasificador de este tipo).

## Capacidades

- Clasificación de texto en cuatro clases: limpio, gibberish leve, ruido y ensalada de palabras.
- Detección de gibberish y corrupción de texto en entradas y salidas de LLM.
- Detección de sufijos adversariales GCG (ROC-AUC de 0,9997 según el autor).
- Diseñado para ser seguro con código, matemáticas y JSON, con 0,0 % de falsos positivos en el conjunto de evaluación del autor (0 de 600).
- Soporte de despliegue en CPU, edge y navegador mediante ONNX y Transformers.js.
- Integración directa con `protectai/llm-guard` como reemplazo de una línea.
- Capacidad multilingüe limitada: solo inglés y código; el autor reporta ROC-AUC de 0,851 en ruso zero-shot, pero el modelo no está entrenado para multilingüe.
- No soporta tool calling ni agentes por sí mismo; su función es de guardrail, no de generación.

## Casos de uso

- Guardrail de entrada en pipelines de LLM: filtrar prompts corruptos o generados por ataques antes de enviarlos al modelo principal, usando el escáner `Gibberish` de `llm-guard` con `threshold=0.50`.
- Guardrail de salida: detectar respuestas degeneradas o alucinadas con texto sin sentido antes de mostrarlas al usuario o registrarlas.
- Protección frente a ataques GCG: identificar sufijos adversariales en prompts, gracias a su ROC-AUC de 0,9997 en datos GCG evaluados.
- Validación de código en tool calling: evitar que fragmentos de código, JSON o expresiones matemáticas se marquen erróneamente como gibberish, con 0,0 % de FPR en el conjunto de evaluación del autor.
- Observabilidad de agentes: monitorizar en tiempo real la calidad de las trazas y llamadas de herramientas en producción, con latencia de 9,15 ms en CPU a 64 tokens.
- Despliegue en navegador o edge: usar la versión ONNX FP16 (61,3 MB) o Transformers.js para filtrado local en aplicaciones web sin backend.
- Filtrado de datasets: limpiar corpus de entrenamiento o evaluación eliminando muestras corruptas antes de usarlas.

## Benchmarks y rendimiento

| Metrica | gibberish-noise-guard-tiny-en | madhurjindal (referencia) |
|---|---|---|
| Parametros | 32,0 M | 67,0 M |
| Latencia CPU ONNX 4 hilos @ 64 tok | 9,15 ms | 18,12 ms |
| Latencia CPU ONNX 4 hilos @ 512 tok | 71,02 ms | 166,60 ms |
| FPR en código/JSON/matematicas @0.5 | 0,0 % (0/600) | 72,0 % |
| ROC-AUC medio OOD público (3 suites) | 0,862 | 0,850 |
| TPR@5%FPR en NLie2 mild gibberish | 0,349 | 0,176 |
| ROC-AUC en sufijos GCG reales | 0,9997 | no disponible |
| ROC-AUC zero-shot en ruso | 0,851 | no disponible |
| FPR en multi-clean @0.5 | 9,5 % | no disponible |
| Tamano ONNX FP32 / FP16 | 122,4 MB / 61,3 MB | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32; el modelo de 32 M de parámetros ocupa aproximadamente 128 MB en FP32 y 64 MB en FP16.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) o incluso CPU; no requiere GPU dedicada.
- Cabe en cualquier GPU consumer y en CPU de 4 hilos; latencia de 9,15 ms a 64 tokens y 71,02 ms a 512 tokens en CPU x86 con ONNX.
- Opciones de despliegue: PyTorch/Transformers (>=4.48,<5), ONNX Runtime (CPU), Transformers.js (WASM en navegador), `llm-guard`, y `text-embeddings-inference` según los tags del repo.
- Throughput: no se publica una cifra de throughput agregado; la latencia por lote de 64 tokens en CPU es de 9,15 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | ROC-AUC OOD-3 | FPR código/JSON | Latencia CPU @64 tok | Licencia |
|---|---|---|---|---|---|---|
| Tamarillo/gibberish-noise-guard-tiny-en | 32,0 M | Inglés + código | 0,862 | 0,0 % | 9,15 ms | Apache-2.0 |
| Tamarillo/gibberish-noise-guard-small-en | 68,4 M | Inglés + código | 0,881 | 0,0 % | 25,62 ms | Apache-2.0 |
| Tamarillo/gibberish-noise-guard-small | 140,6 M | Multilingüe (15+ idiomas) | 0,898 | 0,0 % | 26,33 ms | Apache-2.0 |
| madhurjindal/autonlp-Gibberish-Detector-492513457 | 67,0 M | no disponible | 0,850 | 72,0 % | 18,12 ms | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés y código de forma nativa; el rendimiento en otros idiomas es limitado (ROC-AUC de 0,851 en ruso zero-shot, pero sin garantías).
- El FPR en texto limpio multilingüe es del 9,5 % a umbral 0,5, superior al de las variantes small (2,7 % en la versión multilingüe).
- El umbral recomendado es 0,50, no el 0,97 heredado de `llm-guard`; usar 0,97 reduce la recall en gibberish leve y sufijos GCG.
- Requiere `transformers>=4.48,<5`; entornos con versiones antiguas de `optimum` pueden no cargar los grafos ONNX de ModernBERT.
- En PyTorch 2.4.x con CUDA y lotes con padding de más de 512 tokens, se recomienda `attn_implementation="eager"`.
- Riesgo de alucinación no aplica directamente (es un clasificador), pero puede producir falsos negativos en gibberish semánticamente plausible.
- No se han publicado datos sobre sesgos demográficos o culturales.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrece garantía ni soporte del autor.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/gibberish-noise-guard-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Demo en Hugging Face Space: Tamarillo/gibberish-noise-guard-demo (referenciado en la model card)
- `protectai/llm-guard`: https://github.com/protectai/llm-guard
- `madhurjindal/autonlp-Gibberish-Detector-492513457` (referencia de comparación, citado en la model card)
- `wajidlinux99/gibberish-text-detector` (referencia de comparación, citado en la model card)
- Dataset `lmarena-ai/arena-human-preference-140k`: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Dataset `MatanBT/gcg-evaluated-data`: https://huggingface.co/datasets/MatanBT/gcg-evaluated-data
- Dataset `google-research-datasets/mbpp`: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset `qwedsacf/competition_math`: https://huggingface.co/datasets/qwedsacf/competition_math
- Dataset `FiscalNote/billsum`: https://huggingface.co/datasets/FiscalNote/billsum
