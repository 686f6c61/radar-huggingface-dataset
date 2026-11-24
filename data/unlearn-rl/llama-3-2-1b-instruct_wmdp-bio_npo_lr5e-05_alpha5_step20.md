# Unlearn-RL/Llama-3.2-1B-Instruct_wmdp-bio_NPO_lr5e-05_alpha5_step20

## Resumen

Este modelo es un checkpoint experimental de desaprendizaje (*unlearning*) construido sobre `meta-llama/Llama-3.2-1B-Instruct`. Lo publica el proyecto Unlearn-RL dentro de la tarea T47, cuyo objetivo es medir si un entrenamiento posterior con GRPO sobre GSM8K recupera el conocimiento que se ha eliminado deliberadamente. El modelo no busca ser un asistente de propósito general, sino servir como punto de partida controlado para experimentos de desaprendizaje y de recuperación de capacidades.

La intervención consiste en un ajuste fino con NPO (Negative Preference Optimization) más un término de retención NLL sobre el corpus de olvido WMDP-Bio (bioseguridad) y un corpus de retención basado en wikitext-2. Se ejecutan solo 20 pasos de optimización, lo que basta para reducir la precisión en WMDP-Bio de 0,595 a 0,272 con BOS, a costa de degradar MMLU de 0,484 a 0,425 y GSM8K de 0,498 a 0,268.

Arquitectura transformer decoder-only de 1.235.814.400 parámetros (1,2 B), pesos en bf16, contexto de 128.000 tokens heredado del modelo base (no verificado en la información disponible) y licencia Llama 3.2. Es relevante ahora porque ejemplifica una metodología reproducible de evaluación de desaprendizaje con protocolo documentado y umbrales explícitos, útil para investigadores que estudian la solidez de estas intervenciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.2), pesos bf16 |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.2-1B-Instruct` (revisión `92131767`) y conserva su arquitectura y sus ficheros `config.json` y `generation_config.json` originales. El tokenizador es el estándar del proyecto (`open-unlearning/tofu_Llama-3.2-1B-Instruct_full@88e31200`). Solo cambian los pesos, entrenados con todos los parámetros actualizables.

El entrenamiento aplica NPO con término de retención NLL (NPO+RT): sobre los fragmentos de olvido se optimiza `-(2/beta) log sigmoid(beta * (NLL_theta - NLL_ref))` y sobre los de retención se añade `alpha * NLL`, con el modelo original como referencia. Hiperparámetros: beta 0,1 sobre la media de NLL por token (equivalente a `beta = 0.1/512` con `gamma = 1/512` para fragmentos de 512 tokens), alpha 5, learning rate 5e-5 constante sin warmup, 20 pasos de optimizador con 4 fragmentos de olvido y 4 de retención por paso (80 fragmentos de olvido, el 0,2 % del corpus), precisión bf16, `paged_adamw_32bit`, weight decay 0 y semilla 0. El corpus de olvido es una muestra con semilla 0 de 3.000 documentos de `cais/wmdp-bio-forget-corpus` (38.280 fragmentos de 512 tokens); el de retención es wikitext-2-raw-v1, split test, líneas de más de 50 caracteres (549 fragmentos). El framework es OpenUnlearning en el commit `2d98027`, con transformers 5.5.4 y torch 2.9.1. El cambio relativo de pesos es 0,00951 y afecta al 53,3 % de los parámetros.

## Capacidades

- Generación de texto conversacional, heredada del modelo Instruct base.
- Razonamiento aritmético básico, aunque notablemente degradado respecto al original (GSM8K-500 greedy 0,268 frente a 0,498).
- Respuesta a preguntas de conocimiento general (MMLU), también degradada (0,425 frente a 0,484).
- Capacidad reducida de responder preguntas de bioseguridad del conjunto WMDP-Bio (0,272 frente a 0,595).
- Soporte de tool calling, agentes y modo de razonamiento extendido: no disponible en la información proporcionada; no se documenta ni se evalúa.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Formato de respuesta matemática: el modelo ha dejado de emitir el marcador `####` (format_ok 0,00 en GSM8K greedy), por lo que requiere un parser alternativo.

## Casos de uso

- Investigación en desaprendizaje: sirve como punto de partida reproducible para medir si un ajuste posterior (por ejemplo, GRPO sobre GSM8K) recupera el conocimiento eliminado, que es exactamente el objetivo declarado de la tarea T47.
- Evaluación de metodologías NPO: permite comparar el equilibrio entre olvido (WMDP-Bio) y retención (MMLU, GSM8K) con un protocolo documentado y umbrales explícitos.
- Estudio de la solidez del olvido: al ser un efecto alcanzado en 20 pasos, es un caso adecuado para medir cuánto se revierte con fine-tuning sobre datos no relacionados.
- Referencia de ablación: el modelo original `meta-llama/Llama-3.2-1B-Instruct` actúa como control, lo que facilita diseños experimentales con y sin intervención.
- Análisis de sesgo de respuesta en opción múltiple: la distribución de letras elegidas en WMDP-Bio (0,412 en la más frecuente frente a 0,292 del original) es un objeto de estudio en sí mismo.
- Docencia y reproducción de pipelines: el uso de OpenUnlearning con hiperparámetros y semillas publicados permite replicar el entrenamiento en entornos con una sola GPU consumer.
- No recomendado para atención al cliente, generación de código en producción ni asistentes generales: la degradación de MMLU y GSM8K y la pérdida del formato de respuesta lo desaconsejan para esos fines.

## Benchmarks y rendimiento

Evaluación con lm-eval 0.4.11, zero-shot, sin plantilla de chat, respuesta por mayor log-verosimilitud del siguiente token, batch 16, bf16 y log-softmax en float32. El protocolo primario añade BOS.

| Medida | Original | Este checkpoint | Umbral |
|---|---|---|---|
| WMDP-Bio, con BOS (primario) | 0,595 | 0,272 | <= 0,30 |
| WMDP-Bio, sin BOS | 0,568 | 0,280 | — |
| MMLU, con BOS (primario) | 0,484 | 0,425 | >= 0,42 |
| MMLU, sin BOS | 0,461 | 0,402 | — |
| GSM8K-500 greedy, parser alternativo | 0,498 | 0,268 | >= 0,20 |
| GSM8K-500 greedy, `####` obligatorio | 0,156 | 0,000 | — |
| GSM8K-500 pass@1 (8 muestras, T = 1) | 0,413 | 0,147 | — |
| GSM8K-500 pass@8 | 0,764 | 0,440 | — |
| GSM8K `format_ok` (greedy) | 0,330 | 0,000 | — |
| Letra más elegida en WMDP-Bio (con BOS) | 0,292 | 0,412 | — |

De las 757 preguntas de WMDP-Bio que el modelo original acierta con BOS, este checkpoint sigue acertando el 28 %.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 2,5 GB solo de pesos, más overhead de activaciones y caché KV; con cuantización a 8 bits o 4 bits cabría en menos de 1,5 GB, aunque no se publican ficheros cuantizados.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en bf16 o fp16; para entrenamiento con el pipeline descrito se usó `paged_adamw_32bit`, lo que sugiere que cabe en una sola GPU de gama media-alta.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 1,2 B parámetros.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WMDP-Bio (con BOS) | MMLU (con BOS) | GSM8K-500 greedy | Licencia |
|---|---|---|---|---|---|---|
| Este checkpoint (NPO, 20 pasos) | 1,2 B | no disponible | 0,272 | 0,425 | 0,268 | Llama 3.2 |
| `meta-llama/Llama-3.2-1B-Instruct` (original) | 1,2 B | no disponible | 0,595 | 0,484 | 0,498 | Llama 3.2 |
| Otros checkpoints NPO del mismo barrido | no disponible | no disponible | no disponible | no disponible | no disponible | Llama 3.2 |

No se dispone de datos de benchmarks de otros modelos comparables (por ejemplo, otras técnicas de desaprendizaje sobre el mismo base) en la información proporcionada.

## Limitaciones y advertencias

- El olvido es superficial: se alcanza en 20 pasos y el propio autor advierte que un fine-tuning sobre datos no relacionados suele revertir buena parte del efecto; precisamente eso es lo que el proyecto mide.
- La precisión en opción múltiple cercana a 0,25-0,30 refleja en parte una preferencia por una letra concreta (0,412 en la más elegida), no solo desconocimiento real.
- Degradación colateral clara: MMLU cae 0,059 y GSM8K greedy cae 0,230 respecto al original; MMLU queda solo 0,005 por encima del umbral, aproximadamente un error estándar.
- El modelo ya no genera el marcador `####` en GSM8K (format_ok 0,00), lo que rompe parsers que lo exijan y obliga a usar un parser alternativo basado en el último número.
- Evaluación con una sola semilla y una sola medición; los umbrales se fijaron después de ver los resultados (los pre-registrados eran MMLU >= original - 0,03 y GSM8K >= original - 0,05).
- El checkpoint no es un candidato pre-registrado del barrido, sino el primer paso evaluado que cumplió el criterio de WMDP-Bio <= 0,30 en un barrido añadido a posteriori.
- Licencia Llama 3.2 Community License: impone restricciones de uso (incluida la política de uso aceptable) y obligaciones de atribución; revisar `LICENSE.txt` y `USE_POLICY.md` antes de cualquier uso comercial.
- No está pensado para producción como asistente general: su finalidad es experimental y sus capacidades están deliberadamente degradadas.
- Riesgo de alucinación: no evaluado en la información proporcionada; la degradación de MMLU y GSM8K sugiere mayor propensión a errores factuales y de cálculo que el modelo original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Unlearn-RL/Llama-3.2-1B-Instruct_wmdp-bio_NPO_lr5e-05_alpha5_step20
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Tokenizador del proyecto: https://huggingface.co/open-unlearning/tofu_Llama-3.2-1B-Instruct_full
- Corpus de olvido WMDP-Bio: https://huggingface.co/datasets/cais/wmdp-bio-forget-corpus
- Framework OpenUnlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.2: https://www.llama.com/llama3_2/license/
- Política de uso de Llama 3.2: https://www.llama.com/llama3_2/use-policy/
