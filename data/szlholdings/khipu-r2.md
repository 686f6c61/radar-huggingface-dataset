# SZLHOLDINGS/KHIPU-R2

## Resumen

KHIPU-R2 es un modelo de lenguaje publicado por SZLHOLDINGS en Hugging Face bajo el identificador `SZLHOLDINGS/KHIPU-R2`. Se trata de un artefacto derivado del modelo base `Qwen/Qwen2.5-1.5B-Instruct`: el repositorio contiene tanto los pesos completos del modelo (`model.safetensors`, 6,17 GB) como un adaptador PEFT (`adapter_model.safetensors`, 147,77 MB), lo que sugiere un ajuste fino sobre el modelo de Qwen. El número total de parámetros declarado en los safetensors es de 1.543.714.304, coherente con la arquitectura Qwen2 de 1,5B parámetros.

El modelo se presenta como parte de un "estate" de IA gobernada de SZLHOLDINGS, con un énfasis explícito en la trazabilidad y en la honestidad de las métricas: la propia model card declara que no se afirma ningún resultado de benchmark más allá de lo medido en auditorías fechadas, y etiqueta explícitamente como UNKNOWN todo aquello que no está respaldado por un recibo (receipt) verificable. En la auditoría del 22 de noviembre de 2026 el estado del artefacto se registra como `UNKNOWN_NO_EVAL_RECEIPT`, es decir, no existe una cadena de recibos de evaluación completa en las rutas estándar, y no se hacen afirmaciones de calidad sobre el modelo.

Su relevancia práctica es limitada pero concreta: es un modelo pequeño (1,5B), con licencia Apache 2.0, que cabe en GPU de consumo y puede ejecutarse con herramientas estándar del ecosistema Qwen2. Su interés principal reside en el aparato de gobernanza y verificación que lo acompaña (hashes de pesos, recibos de medición, etiquetado MEASURED/REPORTED/UNKNOWN), más que en unas capacidades diferenciales que no están documentadas ni medidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (Qwen2ForCausalLM), transformer decoder-only; ajuste fino con PEFT (adaptador LoRA) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero no se confirma para este artefacto) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors en el dtype declarado; no se declara dtype en config.json) |
| Idiomas soportados | en (ingles, segun la etiqueta del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` 6.174.895.536 B; `adapter_model.safetensors` 147.770.496 B; `tokenizer.json` 11.422.166 B) |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2 para causal language modeling (`Qwen2ForCausalLM`), un transformer decoder-only con atención completa y las innovaciones habituales de la familia Qwen2 (RMSNorm, SwiGLU, RoPE, grouped-query attention). El repositorio contiene un adaptador PEFT, lo que indica que el artefacto se obtuvo mediante ajuste fino paramétricamente eficiente sobre `Qwen/Qwen2.5-1.5B-Instruct`; no obstante, también se publican los pesos fusionados completos en `model.safetensors`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron etapas de RLHF, DPO o similares. La model card no aporta detalles de entrenamiento y remite a ficheros de recibos (`eval/frontier-v1/DONE.json`, `final/train_receipt.json`) que, según la auditoría del 22 de noviembre de 2026, no constituyen una cadena de recibos completa en las rutas estándar. El estado registrado es `UNKNOWN_NO_EVAL_RECEIPT`, y el propio autor indica que cualquier afirmación no respaldada por un recibo debe considerarse UNKNOWN. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, modos de razonamiento, etc.).

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Ajuste fino mediante adaptador PEFT, lo que permite cargar el adaptador sobre el modelo base o usar los pesos fusionados.
- No se documentan capacidades específicas adicionales (código, matemáticas, visión, audio) para este artefacto concreto; cualquier capacidad de ese tipo sería la del modelo base y no está verificada aquí.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el repositorio declara únicamente `en`; no se confirman otros idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Experimentación con ajuste fino ligero: el adaptador PEFT publicado (147,77 MB) permite reproducir o continuar el ajuste sobre Qwen2.5-1.5B-Instruct en una sola GPU de consumo, útil para prototipar pipelines de fine-tuning.
- Despliegue en entornos con recursos limitados: con 1,5B parámetros y pesos en safetensors, el modelo puede servirse en GPU de gama media o incluso en CPU con cuantización posterior, para tareas de generación de texto en inglés de baja latencia.
- Evaluación de gobernanza y trazabilidad: el repositorio incluye hashes SHA-256 de los pesos y un registro de mediciones fechadas, lo que lo hace adecuado como caso de estudio para pipelines de verificación de artefactos y auditoría de modelos.
- Generación de texto auxiliar en inglés: resúmenes, respuestas cortas o transformaciones de texto en aplicaciones internas donde no se requiere un modelo de gran escala.
- Base para comparativas de eficiencia: al ser un derivado de un modelo ampliamente conocido, sirve para medir el coste y el impacto de un ajuste fino PEFT frente al modelo original en tareas concretas.
- Docencia y prototipado: su tamaño y licencia permisiva permiten usarlo en cursos o talleres sobre despliegue de modelos y formatos de pesos (safetensors, PEFT) sin requisitos de hardware elevados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en auditorías fechadas, y la auditoría registrada indica `UNKNOWN_NO_EVAL_RECEIPT`: no existe una cadena de evaluación completa en las rutas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,1 GB en FP16/BF16 para los pesos completos (1,54B parámetros × 2 bytes), más overhead de activaciones y caché KV; en cuantización de 8 bits, en torno a 1,6 GB; en 4 bits, en torno a 0,9 GB (estimaciones a partir del número de parámetros, no medidas publicadas).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 con contexto moderado (RTX 3060/4060, RTX 4090, A10, L4); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y similares; también en GPUs de 8 GB con cuantización o contexto reducido.
- Opciones de despliegue: transformers con PEFT para el adaptador; vLLM, TGI o llama.cpp/Ollama tras conversión a GGUF (la conversión no está publicada en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KHIPU-R2 (SZLHOLDINGS) | 1,54B | no disponible | Apache 2.0 | Hugging Face, safetensors + adaptador PEFT | Sin benchmarks publicados; estado de evaluación UNKNOWN |
| Qwen2.5-1.5B-Instruct (Qwen) | 1,54B | 32.768 tokens | Apache 2.0 | Hugging Face, safetensors, GGUF | Modelo base; benchmarks publicados por el autor |
| Llama 3.2 1B Instruct (Meta) | 1,24B | 128.000 tokens | Llama 3.2 Community License | Hugging Face, gated | Benchmarks publicados; licencia con restricciones |
| Gemma 2 2B Instruct (Google) | 2,6B | 8.192 tokens | Gemma Terms of Use | Hugging Face, gated | Benchmarks publicados; licencia con restricciones |

La comparación con Qwen2.5-1.5B-Instruct es la más directa, dado que KHIPU-R2 es un ajuste fino de ese modelo; cualquier diferencia de rendimiento debería medirse empíricamente, ya que no hay datos publicados.

## Limitaciones y advertencias

- Ausencia de evaluación: la auditoría registra `UNKNOWN_NO_EVAL_RECEIPT`; no hay benchmarks ni métricas de calidad verificadas para este artefacto.
- Idiomas: el repositorio declara únicamente inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Contexto: no se documenta la longitud de contexto efectiva del ajuste; debe asumirse la del modelo base salvo verificación empírica.
- Sesgos y alucinaciones: no se documentan análisis de sesgo ni tasas de alucinación; al derivar de un modelo pequeño, es esperable una mayor propensión a errores factuales que en modelos de mayor escala, aunque no hay mediciones.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y la atribución correspondiente; conviene verificar también las condiciones del modelo base Qwen2.5-1.5B-Instruct.
- Trazabilidad: los hashes SHA-256 de los pesos están publicados, pero la cadena de recibos de entrenamiento y evaluación no está completa en las rutas estándar, lo que dificulta auditar el proceso.
- Producción: sin benchmarks ni pruebas de robustez publicadas, no se recomienda su uso en producción sin una evaluación propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/KHIPU-R2
- Organización SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio de la organización en GitHub: https://github.com/szl-holdings
- Herramienta de generación de fichas (estate-cards): https://github.com/szl-holdings/estate-cards
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
