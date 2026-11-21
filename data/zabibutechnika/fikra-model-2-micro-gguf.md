# zabibutechnika/Fikra-Model-2-Micro-GGUF

## Resumen

Fikra Model 2 Micro es un modelo de lenguaje instruction-tuned especializado en contexto panafricano, desarrollado por Zabibu Technika (Nairobi, Kenia). Se trata de un fine-tune sobre la familia Qwen, concretamente derivado de `zabibutechnika/fikra-v2-e3`, que a su vez parte de `Qwen/Qwen3.5-0.8B`. El objetivo declarado es el despliegue en dispositivo (on-device), offline y con preservación de identidad cultural suajili, orientado a telefonos, tablets y portatiles sin GPU dedicada.

La model card presenta una inconsistencia relevante en las cifras: el texto describe el modelo como "4B-parameter" con 4.205.751.296 parametros, mientras que los metadatos de safetensors del repositorio indican 772.845.888 parametros reales. Esta ficha recoge ambos datos y senala la discrepancia de forma explicita, dado que afecta directamente a las estimaciones de hardware y a la interpretacion de los benchmarks publicados.

El repositorio GGUF ofrece cuantizaciones Q4_K_M y F16 para ejecucion en llama.cpp, Ollama y LM Studio. El modelo soporta ingles y suajili, con code-switching, y esta publicado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (fine-tune de Qwen/Qwen3.5-0.8B via fikra-v2-e3); no se detalla configuracion interna |
| Parametros totales | 772.845.888 segun safetensors del repo; la model card declara 4.205.751.296 (4B) — discrepancia no resuelta |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 (GGUF) |
| Idiomas soportados | en, sw (con code-switching) |
| Licencia | apache-2.0 (licencia base: ver Qwen/Qwen3.5-0.8B) |
| Formato de pesos | GGUF (repo actual); safetensors/fp16 en el repo base `Fikra-Model-2-Micro` |

## Arquitectura y entrenamiento

El modelo es un fine-tune de tipo instruction-tuning sobre un checkpoint intermedio propio (`fikra-v2-e3`), que desciende de `Qwen/Qwen3.5-0.8B`. La model card no documenta la arquitectura interna mas alla de la herencia del base Qwen, ni detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La especializacion se centra en identidad suajili, contexto keniano y comportamientos de seguridad y tool calling, medidos mediante una suite de evaluacion propia de 115 casos.

La innovacion destacable no es arquitectonica sino de posicionamiento: entrenamiento y evaluacion realizados en Kenia, con una suite de release que cubre identidad-Suajili, datos de Kenia, revision canary, cultura panafricana, gaming, fintech, salud y conocimiento local. El autor declara explicitamente que no ha construido el modelo base y que la especializacion Fikra es el valor anadido.

## Capacidades

- Generacion de texto conversacional e instruction-following en ingles y suajili.
- Identidad suajili nativa y soporte de code-switching ingles-suajili (identity_swahili 4/4 en la suite del autor).
- Tool calling / function calling (tool_abi 4/4 en la suite del autor).
- Protocolo UHI (uhi_protocol 5/5) y limites de seguridad (safety_boundary 3/3).
- Generacion de formato largo (longform 2/2).
- Preservacion de persona e identidad (identity_direct 8/8).
- Operacion offline-first sin llamadas externas en inferencia.
- Modo de razonamiento con etiquetas `<think>...</think>`, que pueden filtrarse a la salida visible.

## Casos de uso

- Asistentes en dispositivo para telefonos y tablets: el modelo esta disenado para ejecucion offline en hardware movil, con cuantizacion Q4_K_M que corre en CPU, lo que permite asistentes privados sin conexion ni GPU dedicada.
- Atencion al cliente en suajili e ingles con code-switching: adecuado para usuarios de Africa Oriental que alternan idiomas en una misma conversacion, gracias al entrenamiento especifico en identidad suajili.
- Despliegue en entornos air-gapped: al no requerir llamadas externas en inferencia, encaja en contextos con restricciones de red o requisitos de privacidad estrictos.
- Integracion en pipelines de agentes con tool calling: el modelo supera la prueba tool_abi de la suite del autor, por lo que puede invocarse como componente de llamada a funciones en flujos automatizados.
- Aplicaciones de fintech y salud de contexto local: la suite de evaluacion cubre casos de fintech, salud y conocimiento local keniano, lo que orienta su uso en asistentes verticales de estos dominios.
- Preservacion de persona en productos de marca: la prueba identity_direct (8/8) indica que mantiene una persona definida en conversaciones multi-turno, util para asistentes con identidad corporativa.
- Educacion y cultura panafricana: la cobertura de cultura panafricana en la suite lo hace apto para contenido divulgativo local, siempre con retrieval para datos verificables.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Suite de release Fikra (auto-checked) | 105/115 (91,3%) |
| Borderline (revision por rubrica) | 0 |
| Parafrasis held-out | 9/10 (90,0%) |
| Checkpoint base e3 (Fikra) | 88,7% |
| MMLU | 75,5% |
| HellaSwag | 68,0% |

Comparativa publicada por el autor:

| Modelo | Parametros | MMLU | HellaSwag |
|---|---|---|---|
| fikra-v2-e4 | 4B (segun card) | 75,5% | 68,0% |
| Qwen/Qwen3.5-0.8B | 4B (segun card) | no ejecutado | no ejecutado |
| Qwen2.5-3B-Instruct | 3B | 68,8% | 40,0% |
| Fikra-Model-1-2B | 2B | 36,0% | 40,0% |
| Phi-3.5-mini-instruct | 3,8B | incompatibla | incompatibla |
| Llama-3.2-3B-Instruct | 3B | gated | gated |
| Gemma-2-2B-it | 2B | gated | gated |

Condiciones declaradas: `lm-evaluation-harness` 0.4.13, tareas `mmlu,hellaswag`, limite de 10 muestras por tarea, batch auto, fp16, sobre 2x T4 en Kaggle. El autor advierte que las cifras no estan normalizadas por tamano y que la mayor parte del salto de MMLU respecto al Model 1 proviene del cambio de base (2B a 4B), no del entrenamiento Fikra. La cuantizacion Q4_K_M no fue re-evaluada; se espera una perdida de 1 a 3 puntos frente a fp16 en evaluaciones de formato corto.

## Requisitos de hardware

- VRAM estimada: no disponible de forma fiable por la discrepancia de parametros. Con 772,8M parametros reales, F16 ocuparia aproximadamente 1,5 GB y Q4_K_M alrededor de 0,5 GB; con 4,2B parametros declarados, F16 ocuparia unos 8,4 GB y Q4_K_M en torno a 2,5 GB. El tamano del repo GGUF es de 9,1 GB, coherente con la hipotesis de 4B.
- GPU recomendadas: para Q4_K_M basta CPU en movil o portatil; para F16 con 4B se recomienda una GPU con al menos 10-12 GB de VRAM (RTX 4080, RTX 4090, A10). Con 0,8B reales cabria en cualquier GPU consumer.
- GPU consumer: Q4_K_M esta pensado para ejecucion en CPU y cabe en telefonos, tablets y portatiles sin GPU dedicada; F16 requiere GPU dedicada en el escenario de 4B.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El tag `litert` sugiere tambien soporte para LiteRT en movil. El tag `endpoints_compatible` indica compatibilidad con endpoints.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Fikra Model 2 Micro | 772,8M (safetensors) / 4B (card) | no disponible | 75,5% | Apache 2.0 | Abierto en HF (GGUF y safetensors) |
| Qwen2.5-3B-Instruct | 3B | 32K (segun modelo base Qwen2.5) | 68,8% | Apache 2.0 | Abierto en HF |
| Llama-3.2-3B-Instruct | 3B | 128K | gated (no ejecutado) | Llama 3.2 Community License | Gated en HF |
| Gemma-2-2B-it | 2B | 8K | gated (no ejecutado) | Gemma Terms of Use | Gated en HF |
| Fikra-Model-1-2B | 2B | no disponible | 36,0% | Apache 2.0 | Abierto en HF |

La comparativa de MMLU procede de la model card del autor con las condiciones indicadas; las filas marcadas como gated no fueron ejecutadas. La diferencia principal frente a alternativas es el enfoque en suajili y contexto keniano, no el rendimiento en benchmarks generales.

## Limitaciones y advertencias

- Discrepancia de parametros entre la model card (4B) y los metadatos de safetensors (772,8M); afecta a estimaciones de hardware y a la interpretacion de los benchmarks.
- No existe benchmark cruzado de suajili: el diferenciador principal no esta medido por MMLU ni HellaSwag.
- Sin informacion en vivo: la recencia queda limitada a los datos de entrenamiento.
- Riesgo de alucinacion en dominios especializados; no sustituye a retrieval.
- Fuga de etiquetas de razonamiento: el modelo emite ocasionalmente bloques `<think>...</think>` en la salida visible; deben filtrarse en post-proceso.
- Sesgos heredados del base Qwen/Qwen3.5-0.8B, no auditados.
- La cuantizacion Q4_K_M no fue re-evaluada; se espera una perdida de 1 a 3 puntos frente a fp16.
- No ha sido sometido a red teaming externo.
- La licencia Apache 2.0 permite uso comercial, pero la licencia del modelo base (Qwen/Qwen3.5-0.8B) debe verificarse por separado.
- La model card rechaza explicitamente las afirmaciones de "primer modelo africano", "mejor de Africa" o "state of the art"; no deben asumirse.
- El correo de contacto de la model card aparece mal escrito ("gmsil.com"), lo que puede indicar falta de revision editorial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro-GGUF
- Repositorio base (safetensors/fp16): https://huggingface.co/zabibutechnika/Fikra-Model-2-Micro
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Checkpoint intermedio: https://huggingface.co/zabibutechnika/fikra-v2-e3
- Comparativa Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Llama-3.2-3B-Instruct: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Gemma-2-2B-it: https://huggingface.co/google/gemma-2-2b-it
- Harness de evaluacion: https://github.com/EleutherAI/lm-evaluation-harness
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
