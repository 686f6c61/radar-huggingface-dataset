# wangzhang/gpt-oss-120b-abliterated

## Resumen

El modelo `wangzhang/gpt-oss-120b-abliterated` es una variante del modelo abierto `openai/gpt-oss-120b` de OpenAI, modificada mediante la técnica de *abliteración* (supresión de rechazos) para eliminar la negativa a responder a instrucciones dañinas o peligrosas. El autor, wangzhang, ha desarrollado esta versión utilizando su herramienta `abliterix`, que aplica edición directa de pesos, abliteración granular por experto (EGA) y supresión del router MoE sobre los 128 expertos por capa del modelo base. El resultado es un modelo que mantiene las capacidades técnicas del original (generación de texto, razonamiento, código) pero con una tasa de rechazo drásticamente reducida: pasa de 100/100 rechazos en prompts dañinos a 26/100, con una divergencia KL mínima respecto al base en prompts benignos.

Este modelo es relevante para investigadores y desarrolladores que trabajan en seguridad de IA, alineación y evaluación de sistemas de moderación, así como para quienes necesitan un modelo de gran tamaño (116.8B parámetros) sin restricciones de contenido para entornos controlados. La arquitectura es un MoE (Mixture of Experts) con 36 capas, 128 expertos enrutados por capa y selección top-4, con dimensiones ocultas e intermedias de 2880. El checkpoint se distribuye en formato BF16 (pre-decuantizado desde el MXFP4 nativo del base) y pesa aproximadamente 233 GB en disco. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 36 capas, 128 expertos enrutados por capa, top-4, hidden = intermediate = 2880 |
| Parametros totales | 116.829.156.672 (116.8B) |
| Parametros activos | no disponible (selección top-4 de 128 expertos por capa, pero no se especifica el número de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pre-decuantizado desde MXFP4 nativo del modelo base) |
| Idiomas soportados | en, zh (inglés y chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo se basa en `openai/gpt-oss-120b`, un transformer MoE con 36 capas, 128 expertos enrutados por capa y selección top-4. Las dimensiones ocultas e intermedias son ambas 2880, lo que crea una simetría que complica la abliteración estándar. El proceso de modificación, realizado con la herramienta `abliterix`, no es un entrenamiento tradicional sino una edición directa de pesos mediante proyección ortogonal (modo `direct` con normalización completa de pesos). Se aplican tres técnicas principales:

- **Abliteración granular por experto (EGA)**: se proyectan los pesos `down_proj` de todos los 128 expertos × 36 capas, eliminando la dirección de activación asociada al rechazo. El modelo base almacena `down_proj` transpuesto, lo que requirió una corrección específica en la herramienta.
- **Supresión del router MoE**: se identifica el experto por capa cuya activación se correlaciona más con prompts dañinos y se redirige el enrutamiento lejos de él, con un `router_bias = -4.11` y supresión de 1 experto por capa (escala ≈ 0.59).
- **Edición in-place en vLLM**: para acelerar la iteración, se implementó un editor que modifica los pesos directamente en los workers de vLLM con TP=4, evitando el pipeline paralelo de HuggingFace que era demasiado lento.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, dataset, RLHF, etc.), ya que la model card solo documenta el proceso de abliteración.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base `gpt-oss-120b`, incluyendo tareas de lenguaje natural, matemáticas y código, aunque no se proporcionan benchmarks específicos en la información disponible.
- Supresión de rechazos: el modelo responde directamente a prompts dañinos (por ejemplo, fabricación de bombas, phishing, síntesis de metanfetamina) en lugar de negarse, con una tasa de cumplimiento de 12/15 en jailbreaks clásicos (EN+ZH) según pruebas manuales.
- Multilingüe: soporta inglés y chino (según los tags del modelo).
- Compatibilidad con vLLM: el proceso de edición se realizó con vLLM, por lo que el modelo es desplegable en este framework, aunque requiere variables de entorno específicas (`VLLM_FUSED_MOE_UNQUANTIZED_BACKEND=triton`, `VLLM_ALLOW_INSECURE_SERIALIZATION=1`, `enforce_eager=true`).
- No se especifican capacidades de tool calling, agentes, visión o audio en la información proporcionada.

## Casos de uso

- Investigación en seguridad de IA: el modelo sirve como banco de pruebas para evaluar técnicas de moderación de contenido, detección de jailbreaks y robustez de sistemas de alineación. Su alta tasa de cumplimiento (26/100 en prompts dañinos) permite estudiar cómo los modelos pueden ser manipulados y cómo defenderse.
- Desarrollo de sistemas de moderación: las organizaciones pueden usar este modelo para generar ejemplos adversarios y entrenar clasificadores de contenido dañino, mejorando sus filtros de seguridad.
- Generación de contenido creativo sin restricciones: escritores y artistas pueden explorar temas tabú o controvertidos en entornos controlados, sin que el modelo imponga censura automática.
- Simulación de escenarios de amenaza: en ciberseguridad, el modelo puede generar texto que imite ataques de phishing o malware para entrenar a equipos de respuesta ante incidentes.
- Evaluación de alineación: los investigadores pueden comparar el comportamiento de este modelo con el base para medir el impacto de la abliteración en la utilidad y la seguridad.
- Despliegue local con control total: al ser Apache 2.0 y estar disponible en safetensors, puede ejecutarse en infraestructura propia con vLLM, garantizando soberanía de datos y personalización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye métricas específicas de evaluación de rechazo, que se presentan a continuación:

| Metrica | Base `gpt-oss-120b` | Este modelo |
|---|---|---|
| Rechazos en 100 prompts dañinos (juez LLM) | 100 / 100 | 26 / 100 |
| Divergencia KL vs base (prompt benigno, siguiente token) | — | 5.44e-06 |
| Desviación de longitud de respuesta vs base (benigno) | — | 0.042 σ |
| Cumplimiento cualitativo en 15 jailbreaks clásicos (EN+ZH) | 0 / 15 | 12 / 15 |

Estas métricas indican que el modelo mantiene un comportamiento casi idéntico al base en prompts benignos (divergencia KL muy baja) mientras reduce drásticamente los rechazos en prompts dañinos. No hay datos de rendimiento en tareas de razonamiento, código o matemáticas.

## Requisitos de hardware

- El checkpoint BF16 ocupa aproximadamente 233 GB en disco (según el tamaño del repo), lo que implica que la inferencia requiere múltiples GPUs de alta gama o cuantización adicional.
- Para la edición de pesos, el autor utilizó 4× RTX PRO 6000 (GPU profesional de 96 GB VRAM cada una), lo que sugiere que la inferencia con el modelo completo en BF16 necesita al menos 4 GPUs con ~60 GB de VRAM cada una (considerando overhead).
- No se especifican requisitos mínimos de VRAM para inferencia, pero con cuantización a 8 bits o 4 bits (no disponible en este repo) podría caber en GPUs de 80 GB (como A100 o H100) en configuraciones multi-GPU.
- Opciones de despliegue: vLLM es el framework recomendado (usado en el proceso de edición), aunque requiere variables de entorno específicas. También es compatible con HuggingFace Transformers, pero el pipeline paralelo es lento para iteración.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazo en prompts dañinos | Notas |
|---|---|---|---|---|---|
| `openai/gpt-oss-120b` (base) | 116.8B | no disponible | Apache 2.0 | 100/100 | Modelo original con moderación estándar |
| `wangzhang/gpt-oss-120b-abliterated` | 116.8B | no disponible | Apache 2.0 | 26/100 | Variante abliterada, sin rechazos en la mayoría de prompts dañinos |
| `wangzhang/gpt-oss-20b-abliterated` (mencionado en la model card) | ~20B | no disponible | Apache 2.0 | no disponible | Versión anterior del mismo autor, usa pipeline HF + LoRA en lugar de edición directa |

No se dispone de datos de rendimiento en tareas estándar para comparar con otros modelos de tamaño similar (por ejemplo, Llama 3.1 405B o DeepSeek MoE). La comparativa se limita a las variantes del mismo autor y al modelo base.

## Limitaciones y advertencias

- El modelo está diseñado para eliminar rechazos, lo que implica que puede generar contenido peligroso, ilegal o éticamente cuestionable. Su uso debe restringirse a entornos de investigación controlados y nunca para actividades maliciosas.
- No se han evaluado sesgos sociales o alucinaciones en esta variante; se asume que hereda los sesgos del modelo base, pero no hay datos específicos.
- La longitud de contexto no está documentada, por lo que se desconoce si mantiene la ventana del modelo base (probablemente 128k, pero no confirmado).
- El proceso de abliteración puede degradar ligeramente el rendimiento en tareas benignas, aunque la divergencia KL es muy baja (5.44e-06) y la desviación de longitud es mínima (0.042 σ).
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede violar leyes locales; el responsable del despliegue debe asumir la responsabilidad legal.
- El despliegue en vLLM requiere configuración no estándar (variables de entorno inseguras, backend Triton) que puede no ser adecuada para entornos de producción convencionales.

## Enlaces

- HuggingFace: https://huggingface.co/wangzhang/gpt-oss-120b-abliterated
- Repositorio de la herramienta abliterix: https://github.com/wuwangzhang1216/abliterix
- Modelo base: https://huggingface.co/openai/gpt-oss-120b
- Documentación de OpenAI sobre gpt-oss-120b: https://developers.openai.com/api/docs/models/gpt-oss-120b
- Repositorio espejo en GitHub (no oficial): https://github.com/Damacol/wangzhang-gpt-oss-120b-abliterated
