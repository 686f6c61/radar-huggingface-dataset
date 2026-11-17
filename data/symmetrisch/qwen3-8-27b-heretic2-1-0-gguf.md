# symmetrisch/Qwen3.8-27B-Heretic2.1.0-GGUF

## Resumen

Qwen3.8-27B-Heretic2.1.0-GGUF es una colección de cuantizaciones GGUF del modelo symmetrisch/Qwen3.8-27B-Heretic2.1.0, una versión "decensored" (abliterated) del Qwen/Qwen3.8-27B original. El autor, symmetrisch, ha aplicado la herramienta Heretic v2.1.0 con la técnica Arbitrary-Rank Ablation (ARA) para reducir drásticamente la tasa de rechazos del modelo original: de 98/100 a 9/100 según la medición del propio Heretic. El resultado es un modelo de 26.895.998.464 parámetros (aproximadamente 27B) distribuido en cuatro cuantizaciones GGUF (Q4_K_M, Q5_K_M, Q6_K y Q8_0) para su uso con llama.cpp.

El modelo está pensado para desarrolladores que necesitan un LLM de gran tamaño sin las restricciones de rechazo del modelo alineado original, manteniendo una divergencia KL de 0.1237 respecto al base. La información disponible no detalla la arquitectura interna más allá de las referencias a tensores `ssm_beta_alpha`, lo que sugiere componentes de tipo state space model (SSM) en la arquitectura, aunque este dato no está confirmado explícitamente en la model card.

La relevancia de esta ficha radica en que documenta un caso de abliteración con ARA sobre un modelo de ~27B, con parámetros de ablación reproducibles y métricas de comportamiento (rechazos y divergencia KL) publicadas por el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (la model card menciona tensores `ssm_beta_alpha`, compatible con componentes SSM, sin confirmación explícita) |
| Parámetros totales | 26.895.998.464 (~27B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 32768`) |
| Tipos de cuantización | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

La información disponible no especifica la arquitectura del modelo base Qwen/Qwen3.8-27B más allá de que los ficheros GGUF emplean el layout de tensor combinado `ssm_beta_alpha` y que requieren llama.cpp b12426 o posterior; runtimes antiguos fallan con el error `tensor 'blk.0.ssm_beta.weight' not found`. Esto es consistente con una arquitectura híbrida que incorpora capas de tipo state space model, aunque la model card no lo detalla explícitamente. Tampoco se documentan los datos de entrenamiento, el número de tokens ni si hubo RLHF o DPO en el modelo original.

La innovación técnica principal es el proceso de abliteración con Heretic v2.1.0 y Arbitrary-Rank Ablation (ARA). La optimización se realizó en precisión completa (BF16) sin cuantización, con 425 ensayos (150 de arranque) sobre una NVIDIA RTX PRO 6000 Blackwell Max-Q de 96 GB, seleccionando el ensayo 326. Los parámetros ARA aplicados fueron: `start_layer_index` 6, `end_layer_index` 60, `preserve_good_behavior_weight` 0.9265, `steer_bad_behavior_weight` 0.0003, `overcorrect_relative_weight` 0.9962 y `neighbor_count` 13. El resultado medido por Heretic es una reducción de rechazos de 98/100 a 9/100 con una divergencia KL de 0.1237 respecto al modelo original.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como `conversational` y los ficheros GGUF están pensados para servir chat mediante `llama-server`.
- Comportamiento "uncensored": la abliteración reduce los rechazos explícitos de 98/100 a 9/100 según la medición de Heretic (basada en coincidencia de palabras clave).
- Compatibilidad con llama.cpp: los ficheros funcionan con runtimes recientes (b12426 o posterior) y con `--jinja` más plantilla de chat externa.
- Soporte de plantilla de chat: requiere descargar `chat_template.jinja` del repositorio principal y pasarla explícitamente con `--chat-template-file`.
- Capacidades multimodales: no disponibles; la model card indica explícitamente "Text only; no mmproj (vision) file is included".
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles (el campo de idiomas no está informado).

## Casos de uso

- Despliegue local de un LLM de ~27B en estaciones de trabajo: con la cuantización Q4_K_M (16,7 GB) el modelo puede servirse con llama.cpp en GPUs de consumo de gama alta, usando `llama-server` con `-ngl 99` para descargar todas las capas en GPU.
- Investigación sobre abliteración y alineación: los parámetros ARA publicados (`start_layer_index`, `end_layer_index`, pesos de preservación y steering) permiten reproducir o comparar el efecto de la ablación sobre el comportamiento del modelo.
- Evaluación de la degradación por abliteración: la divergencia KL de 0.1237 respecto al original sirve como referencia para estudiar el coste en calidad de la eliminación de rechazos.
- Generación de texto creativo sin restricciones de contenido: el modelo está etiquetado como `uncensored` y `abliterated`, orientado a escenarios donde los rechazos del modelo alineado resultan un obstáculo.
- Servicio conversacional autoalojado: con contexto configurable (el ejemplo usa 32768 tokens) y plantilla de chat explícita, puede integrarse en un endpoint compatible con la API de llama.cpp.
- Pruebas de robustez y red teaming: la reducción de rechazos medida (9/100) facilita estudiar respuestas del modelo ante prompts que el original rechazaría, siempre con las salvaguardas adecuadas.

## Benchmarks y rendimiento

La model card solo publica métricas del proceso de abliteración medidas por Heretic con sus prompts y scorers por defecto:

| Métrica | Este modelo | Original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Rechazos | 9/100 | 98/100 |
| Divergencia KL | 0.1237 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q4_K_M ~16,7 GB, Q5_K_M ~19,3 GB, Q6_K ~22,1 GB, Q8_0 ~28,6 GB (tamaños de fichero; la VRAM real depende del contexto y del offload).
- GPU recomendadas: no especificadas por el autor. El proceso de abliteración se realizó en una NVIDIA RTX PRO 6000 Blackwell Max-Q de 96 GB, pero para inferencia basta con GPUs con VRAM suficiente para la cuantización elegida.
- GPU de consumo: Q4_K_M (16,7 GB) y Q5_K_M (19,3 GB) pueden caber en GPUs de consumo de gama alta con 24 GB (por ejemplo, RTX 4090), siempre que el contexto no consuma el margen restante. Q8_0 (28,6 GB) excede los 24 GB.
- Opciones de despliegue: llama.cpp (probado con b12426 y posterior; conversión con b12447-14-ge8fbcad85). Runtimes antiguos fallan con `tensor 'blk.0.ssm_beta.weight' not found`, observado en LM Studio con runtimes llama.cpp 2.66.0 y 2.73.0.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| symmetrisch/Qwen3.8-27B-Heretic2.1.0-GGUF | ~27B | no disponible | Apache 2.0 | GGUF | Abliterado con ARA; 9/100 rechazos; KL 0.1237 |
| symmetrisch/Qwen3.8-27B-Heretic2.1.0 | ~27B | no disponible | Apache 2.0 | safetensors (base) | Modelo base del que derivan estas cuantizaciones |
| Qwen/Qwen3.8-27B | ~27B | no disponible | no disponible | no disponible | Modelo original alineado; 98/100 rechazos |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina rechazos pero no garantiza la calidad del contenido generado; la divergencia KL de 0.1237 indica una desviación medible respecto al modelo original que puede afectar a la coherencia o al comportamiento en tareas sensibles.
- La medición de rechazos (9/100) se basa en coincidencia de palabras clave y solo cubre rechazos explícitos; no evalúa respuestas problemáticas que no contengan las palabras clave esperadas.
- No se han publicado evaluaciones de sesgos, toxicidad ni alucinación para esta versión abliterada.
- El modelo es solo texto; no incluye fichero `mmproj` de visión.
- No se especifican los idiomas soportados; el rendimiento multilingüe es desconocido.
- La longitud de contexto no está documentada; el ejemplo de uso emplea 32768 tokens, pero no se confirma como máximo.
- Los GGUF no incorporan plantilla de chat; es obligatorio descargar `chat_template.jinja` del repositorio principal y pasarla con `--chat-template-file`, lo que añade un paso de configuración y un riesgo de error si se omite.
- Requiere llama.cpp b12426 o posterior; runtimes más antiguos fallan al cargar los tensores `ssm_beta_*`.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo abliterated en producción conlleva responsabilidad sobre el contenido generado y puede incumplir políticas de plataformas o requisitos regulatorios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria del funcionamiento de las cuantizaciones.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/symmetrisch/Qwen3.8-27B-Heretic2.1.0-GGUF
- Modelo base (abliterado): https://huggingface.co/symmetrisch/Qwen3.8-27B-Heretic2.1.0
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de abliteración): https://github.com/p-e-w/heretic
