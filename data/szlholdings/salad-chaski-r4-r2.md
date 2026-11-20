# SZLHOLDINGS/salad-chaski-r4-r2

## Resumen

SZLHOLDINGS/salad-chaski-r4-r2 es un adaptador LoRA privado entrenado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. El adaptador está diseñado para una tarea muy concreta: la "abstención bajo contexto adversarial" (abstention-under-adversarial-context), es decir, que el modelo aprenda a declinar responder cuando el contexto que recibe contiene instrucciones o información manipulada. Se enmarca en lo que el autor denomina "governed-ai", un enfoque de IA gobernada orientado a la evaluación controlada y el despliegue en entornos de staging.

El adaptador es extremadamente pequeño: se entrenó con solo 48 ejemplos durante 200 pasos sobre una única GPU NVIDIA GeForce RTX 3090 Ti en la plataforma Salad. No es un modelo autónomo, sino un conjunto de pesos PEFT (LoRA) que requiere el modelo base Qwen/Qwen3.5-0.8B para funcionar. El repositorio ocupa 0,1 GB y contiene los checkpoints y el adaptador final en el subdirectorio `final/`.

Su relevancia es limitada y de nicho: se trata de un artefacto de investigación para evaluar comportamiento de abstención, no de un modelo de propósito general. El propio autor advierte que no debe presentarse como garantía de seguridad ni como evidencia de rendimiento en datos no vistos hasta que se publique una evaluación con conjunto de validación independiente. No se han publicado resultados de benchmarks estándar ni evaluaciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-0.8B |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 0,8B según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen/Qwen3.5-0.8B) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización aplicaría al modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

Configuración del adaptador: rango r=32, alpha=64, dropout=0,05, aplicado a las proyecciones q_proj, k_proj, v_proj y o_proj.

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT de rango 32 y alpha 64 con dropout de 0,05, inyectado en las proyecciones de atención (query, key, value y output) del modelo base Qwen/Qwen3.5-0.8B. No modifica la arquitectura del transformer subyacente; solo añade matrices de baja dimensión entrenables sobre las capas de atención. El entrenamiento fue un SFT (supervised fine-tuning) con 48 ejemplos del dataset SZLHOLDINGS/szl-distill-abstention-v1-sft, ejecutado durante 200 pasos globales (global_step=200) en una única RTX 3090 Ti. Se conservan checkpoints durables en los pasos 50, 100, 150 y 200, y el adaptador final se encuentra en `final/`.

No se documenta el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo RLHF o DPO. El autor indica que la publicación es "fail-closed" (privada por diseño) y que la evidencia del entrenamiento (arranque del worker, recepción del dataset, energía medida y progreso) se conserva en el dataset público frontier-54-runs, con un registro hb26 que recoge el avance hasta el paso 198/200. La innovación técnica declarada es la orientación a la abstención ante contexto adversarial, pero no se aportan detalles sobre cómo se construyen los ejemplos ni sobre la metodología de evaluación.

## Capacidades

- Generación de texto condicionada al contexto proporcionado por el controlador (el prompt de ejemplo incluye "controller-supplied context + request").
- Abstención ante contexto adversarial: el adaptador está entrenado específicamente para declinar responder cuando el contexto contiene instrucciones manipuladas o información no fiable.
- Integración con el chat template del modelo base mediante `apply_chat_template`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles.
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Evaluación de abstención en investigación: el adaptador sirve para medir si un modelo pequeño declina responder ante contextos adversariales, comparando su comportamiento con el del modelo base sin adaptador en un entorno controlado.
- Staging de IA gobernada: el autor lo orienta a "governed staging", es decir, entornos de preproducción donde se valida el comportamiento de abstención antes de desplegar políticas de seguridad en producción.
- Filtrado de contexto en pipelines RAG: en un sistema de recuperación aumentada, el adaptador podría probarse para que el modelo ignore fragmentos de contexto inyectados maliciosamente y se abstenga en lugar de responder con información contaminada.
- Pruebas de robustez frente a prompt injection: útil como artefacto de laboratorio para estudiar cómo un fine-tune pequeño modifica la resistencia del modelo base a instrucciones embebidas en el contexto.
- Docencia y experimentación con PEFT: por su tamaño (0,1 GB) y su configuración LoRA documentada, sirve como ejemplo práctico de cómo adaptar un modelo de 0,8B con 48 ejemplos en una sola GPU consumer.
- Auditoría de pipelines de entrenamiento: los checkpoints intermedios y los registros de frontier-54-runs permiten reproducir y auditar el proceso de entrenamiento paso a paso.
- Validación de políticas de rechazo: permite comparar tasas de abstención correcta e incorrecta frente a un baseline antes de adoptar una política de rechazo en un asistente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que MMLU-Pro, GPQA, IFEval y BFCL no han sido evaluados, y que las suites de seguridad (toxicidad, jailbreak y red-team) tampoco. La ejecución de comprobación del 2026-11-19 se hizo con un modelo de la arquitectura `qwen3_5` inicializado aleatoriamente y reducido, sin descargar los pesos de este repositorio, por lo que no evalúa la calidad de salida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al tratarse de un adaptador sobre un modelo base de 0,8B, los requisitos vienen determinados por el modelo base. En precisión completa, un modelo de 0,8B ocupa aproximadamente 1,6 GB en fp16, más el overhead del adaptador LoRA (despreciable).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA GeForce RTX 3090 Ti. Para inferencia, cualquier GPU consumer con suficiente VRAM para el modelo base de 0,8B es suficiente; no se documentan requisitos adicionales.
- Cabe en GPU consumer: sí, siempre que quepa el modelo base Qwen/Qwen3.5-0.8B; el adaptador añade un consumo marginal.
- Opciones de despliegue: el autor documenta carga mediante `peft` + `transformers` (versión 5.x, con `apply_chat_template` devolviendo `BatchEncoding`). No se documentan opciones como vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SZLHOLDINGS/salad-chaski-r4-r2 | Adaptador LoRA sobre 0,8B | No disponible | Sin benchmarks publicados | No disponible | Hugging Face (repo privado por diseño) |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | No disponible | No disponible en esta ficha | No disponible | Hugging Face |
| Otros adaptadores de abstención | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre alternativas comparables de la misma categoría (adaptadores LoRA para abstención bajo contexto adversarial) en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento con solo 48 ejemplos y 200 pasos: el adaptador es un fine-tune muy pequeño, insuficiente para extraer conclusiones generales sobre calidad o seguridad.
- No es un modelo autónomo: requiere el modelo base Qwen/Qwen3.5-0.8B y no funciona de forma independiente.
- Sin evaluación en datos no vistos: el autor advierte que no debe presentarse como garantía de seguridad ni como evidencia de rendimiento held-out hasta que se publique una evaluación con conjunto de validación.
- Benchmarks estándar y de seguridad no evaluados (MMLU-Pro, GPQA, IFEval, BFCL, toxicidad, jailbreak, red-team).
- Sesgos conocidos: no documentados.
- Riesgo de alucinación: no evaluado; el objetivo declarado es la abstención, pero no hay evidencia publicada de su eficacia.
- Restricciones de licencia para uso comercial: licencia no disponible, por lo que no puede asumirse uso comercial permitido.
- Idiomas soportados: no disponibles; el comportamiento multilingüe no está documentado.
- Visibilidad privada por diseño con publicación "fail-closed": el acceso puede requerir autenticación (`hf auth login`) y el repositorio podría no ser públicamente descargable.
- La comprobación de ejecución del autor no utilizó los pesos de este repositorio, por lo que la corrección funcional del adaptador con sus pesos reales no está verificada de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-chaski-r4-r2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/szl-distill-abstention-v1-sft
- Dataset de evidencia de ejecuciones: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Registro hb26 del entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/mesh/lanelogs/chaski-r4-r2-hb26.log
- Datos de los gráficos de la model card: assets/chart-data.json (dentro del repositorio del modelo)
