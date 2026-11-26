# udomain/kestrel_v_1

## Resumen

Kestrel v_1 (`udomain/kestrel_v_1`, versión `v0.1-preview`) es un modelo de clasificación de riesgo operativo diseñado como guardrail para pasarelas empresariales de LLM en Hong Kong. Lo desarrolla el usuario `udomain` y parte del modelo base `Qwen/Qwen3-1.7B`, sobre el que se han fusionado adaptadores LoRA y se ha añadido una cabeza de decisión no autorregresiva. Su función no es generar texto, sino puntuar cada turno de una conversación multi-turno con una etiqueta de riesgo de datos personales (`allow` / `suspected` / `violation`) en una única pasada forward.

La propuesta técnica sustituye la generación autorregresiva de JSON (lenta y propensa a errores de formato) por un pooling sobre el token `<|im_end|>` de cada turno, con atención causal que evita filtración de información futura. Esto permite evaluar el mosaico completo de la conversación —incluyendo riesgo que solo emerge al cruzar turnos— con latencias de decenas de milisegundos en lugar de segundos.

Es relevante porque aborda el escenario «empleado empresarial → LLM externo» bajo el régimen del PDPO de Hong Kong, con cobertura de cantonés, chino tradicional, inglés y code-mix hongkonés. Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y sin dependencia de `peft` en inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de decisión no autorregresiva y pooling en `<|im_end|>` |
| Parametros totales | 1.7B (heredados de Qwen/Qwen3-1.7B; no se especifica el recuento exacto de la cabeza añadida) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; el autor no la declara explícitamente) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | zh (chino tradicional), yue (cantonés), en (inglés), más code-mix hongkonés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA fusionado en los pesos base, sin `peft`) |

## Arquitectura y entrenamiento

El modelo reutiliza la pila transformer decoder-only de Qwen3-1.7B con atención causal estándar, sobre la que se han fusionado adaptadores LoRA. La innovación principal es la cabeza de decisión: en lugar de generar una secuencia de tokens, el modelo hace pooling de la representación en el token `<|im_end|>` de cada turno y emite directamente una probabilidad de riesgo. Al ser causal, cada turno solo atiende a los anteriores, lo que evita leakage y permite procesar el contexto mosaico multi-turno completo en una sola pasada.

El entrenamiento se realizó sobre datos sintéticos multi-turno contrafactuales de Hong Kong en cantonés, chino tradicional, inglés y code-mix. El autor menciona las técnicas `pcpd` y `pdpo` en las etiquetas, sin detallar su formulación. La calibración se ajustó sobre `val.jsonl` con una temperatura global de `1.3135` y temperaturas por idioma (`code_mix` 1.4902, `en` 1.2030, `hk_cantonese` 1.4982, `trad_zh` 1.1762). No se especifica el volumen de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación de riesgo de datos personales por turno con tres etiquetas: `safe`, `suspected`, `violation`.
- Detección de riesgo mosaico entre turnos (`mosaic_cross_turn_identification`), es decir, información que solo resulta identificativa al combinarse con turnos previos.
- Cobertura de 10 categorías operativas: `direct_id_exposure`, `contact_financial_exposure`, `sensitive_medical_hr_exposure`, `client_customer_bulk_leak`, `mosaic_cross_turn_identification`, `purpose_deviation_dpp3`, `excessive_collection_profiling_dpp1`, `doxxing_harassment_s64`, `obfuscated_or_evasive_pii`, `unauthorized_cross_border_transfer`.
- Multilingüe y code-mix: cantonés, chino tradicional, inglés y mezcla de los anteriores en un mismo enunciado.
- Umbrales ajustables por llamada (`t_low`, `t_high`) y salida compatible con el modelo legado `UD_model_v4_judge-mlx` mediante el entero `if_violate`.
- No es un modelo generativo: no produce texto libre, tool calling ni razonamiento multi-paso en el sentido de un LLM conversacional.

## Casos de uso

- Pasarela empresarial de LLM: interceptar cada turno antes de reenviarlo a un proveedor externo y bloquear o marcar peticiones con exposición de identificadores directos, con latencia p50 de 45,2 ms compatible con proxy en línea.
- Cumplimiento del PDPO en atención al cliente: clasificar conversaciones de agentes con clientes para detectar transferencia no autorizada de datos entre fronteras o desviación de finalidad (DPP3).
- Detección de exfiltración por mosaico: identificar cuando un empleado combina fragmentos aparentemente inocuos de varios turnos (nombre, cargo, sede) hasta reconstruir un identificador personal.
- Red-teaming y evaluación de guardrails: usar el modelo como juez de referencia en pipelines de pruebas adversariales sobre conjuntos sintéticos de Hong Kong.
- Filtrado en herramientas internas de RR. HH. y salud: marcar turnos que exponen datos médicos o laborales sensibles antes de que se envíen a un asistente externo.
- Moderación de doxxing y acoso: detectar la categoría `doxxing_harassment_s64` en plataformas comunitarias o foros con contenido en cantonés y code-mix.
- Auditoría de logs: reclasificar conversaciones históricas en lote para generar informes de riesgo por departamento o por usuario.

## Benchmarks y rendimiento

Datos publicados por el autor (RTX 3090, CUDA BF16, calibración out-of-sample):

| Modelo | test PR-AUC | test Recall / FPR / Hard-Neg FPR / Mosaic | heldout_gen PR-AUC | heldout_gen Recall / FPR / Hard-Neg FPR / Mosaic | ECE calibrado | Latencia p50 / p95 (turno único) |
|---|---|---|---|---|---|---|
| Legacy 4B (`UD_model_v4_judge-mlx`, Jev-ified) | 0.1259 | 100% / 100% / 100% / 100% | 0.1774 | 100% / 100% / 100% / 100% | 0.8221 / 0.7900 | 657,0 / 1984,8 ms (MPS) |
| **udomain/kestrel_v_1** | **0.9972** | **97,23% / 0,67% / 0,00% / 100,00%** | **0.9930** | **98,30% / 1,36% / 0,00% / 100,00%** | **0,0045 / 0,0118** | **45,2 / 131,7 ms** |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no es generativo y estos benchmarks no aplican.

## Requisitos de hardware

- VRAM estimada: unos 3,5 GB en BF16 para los pesos completos; en FP16 o BF16 cabe holgadamente en GPUs de consumo.
- GPU recomendadas: RTX 3090 (usada por el autor para los benchmarks), RTX 4090, A100, H100. Cualquier GPU con al menos 6 GB de VRAM puede ejecutarlo en BF16.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y equivalentes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al no ser un modelo generativo estándar su integración en esos motores requeriría adaptación.
- Latencia y throughput: p50 de 45,2 ms y p95 de 131,7 ms por turno único en RTX 3090 con BF16, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PR-AUC (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| udomain/kestrel_v_1 | 1.7B | no disponible | 0.9972 | Apache 2.0 | Hugging Face |
| Legacy 4B `UD_model_v4_judge-mlx` | 4B (aprox.) | no disponible | 0.1259 | no disponible | no disponible |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible | no aplica (no es guardrail) | Apache 2.0 | Hugging Face |

No se dispone de información sobre otros guardrails comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Versión `v0.1-preview`: entrenada sobre datos sintéticos; el propio autor advierte que sirve para evaluación y red-teaming, no como asesoramiento legal bajo el PDPO.
- Riesgo de falsos negativos en dominios no cubiertos por el dataset sintético de Hong Kong; la generalización a otras jurisdicciones o variedades del chino no está validada.
- FPR del 0,67% en `test` y 1,36% en `heldout_gen`, con FPR de 0% en negativos duros; aun así, en producción a gran escala un FPR bajo puede generar volumen relevante de bloqueos.
- Dependencia de `trust_remote_code=True` y de código personalizado (`custom_code`): auditar el código antes de desplegar en entornos sensibles.
- No es un modelo generativo: no puede explicar sus decisiones en lenguaje natural sin un componente adicional.
- Sesgos potenciales derivados del corpus sintético y de la sobrerrepresentación del contexto hongkonés; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo recae en el integrador.
- No se documentan cuantizaciones oficiales; el uso en CPU o GPUs de baja VRAM requeriría convertir los pesos por cuenta propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udomain/kestrel_v_1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
