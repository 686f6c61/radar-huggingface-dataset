# wangzhang/Qwen3.6-27B-abliterated-GGUF

## Resumen

Qwen3.6-27B-abliterated-GGUF es la versión cuantizada en formato GGUF del modelo Qwen3.6-27B-abliterated, un checkpoint derivado de Qwen/Qwen3.6-27B al que se le ha aplicado una técnica de supresión de rechazos (abliteration) en segunda pasada. El autor, wangzhang, publica tres cuantizaciones (F16, Q8_0 y Q4_K_M) generadas con llama.cpp, pensadas para inferencia local en hardware variado, desde tarjetas de 24 GB hasta sistemas con memoria unificada de 32 GB o más.

El modelo base presenta una arquitectura híbrida poco habitual: combina 48 capas GatedDeltaNet (GDN) con 16 capas de atención completa, intercaladas según el patrón `[GDN, GDN, GDN, full] × 16`. Esta configuración, registrada como `qwen3_5` en los metadatos GGUF, requiere una versión reciente de llama.cpp (commit ≥ 2026-01) que soporte el nuevo esquema de atención lineal. El proceso de abliteración reduce la tasa de rechazo a 10 sobre 100 prompts dañinos evaluados, con un cumplimiento de 15/15 en prompts duros y una divergencia KL acumulada de aproximadamente 0.024 respecto al modelo original.

La relevancia de esta publicación radica en que ofrece un modelo de 27B parámetros con capacidades de razonamiento y generación de código de la familia Qwen, pero sin las capas de rechazo habituales, lo que lo convierte en una herramienta de investigación para estudiar comportamientos de seguridad, alineación y generación de contenido sin restricciones. El repositorio acumula 5.752 descargas y 7 likes, lo que indica un interés moderado dentro de la comunidad de IA open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 48 capas GatedDeltaNet + 16 capas full-attention, intercaladas `[GDN, GDN, GDN, full] × 16` |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-27B es un transformer denso con una arquitectura híbrida que intercala capas de atención lineal GatedDeltaNet (GDN) con capas de atención completa. En concreto, se alternan tres capas GDN por cada capa de atención completa, repitiendo el patrón 16 veces, lo que da un total de 48 capas GDN y 16 capas de atención plena. Esta combinación busca reducir el coste computacional del procesamiento de secuencias largas manteniendo la calidad de la atención global en puntos estratégicos.

El proceso de abliteración, descrito en el blog de Nathan Sapwell, consiste en una modificación post-entrenamiento de los pesos del modelo para suprimir la activación de las neuronas responsables de generar respuestas de rechazo. En la versión v2 aquí publicada, se realizó una segunda pasada de supresión, logrando una tasa de rechazo de 10/100 en un conjunto de 100 prompts dañinos y un cumplimiento de 15/15 en prompts duros, con una divergencia KL acumulada de 0.024 frente al checkpoint original. No se aplicó ningún entrenamiento adicional con RLHF o DPO; la técnica es puramente de ajuste de pesos.

La conversión a GGUF se realizó con `convert_hf_to_gguf.py` para el archivo F16 y con `llama-quantize` para las versiones Q8_0 y Q4_K_M. Durante la conversión se descartó la torre de visión del modelo original (que es un VLM), por lo que estos archivos GGUF son exclusivamente de texto. También se eliminó la cabeza auxiliar MTP (multi-token prediction), ya que llama.cpp aún no soporta decodificación especulativa estilo Qwen.

## Capacidades

- Generación de texto en inglés y chino, con razonamiento y comprensión de instrucciones complejas.
- Generación de código y asistencia en tareas de programación, heredadas del modelo Qwen3.6-27B.
- Razonamiento matemático y STEM, reforzado en la versión 3.6 de Qwen.
- Capacidad de seguir conversaciones multi-turno con el formato de chat `<|im_start|>` / `<|im_end|>`.
- Respuestas sin rechazo ante solicitudes que el modelo original consideraría dañinas o inapropiadas (por diseño de la abliteración).
- Inferencia local en CPU/GPU mediante llama.cpp y frontends compatibles (ollama, LM Studio, KoboldCpp).
- No se ha confirmado soporte de tool calling o function calling en la documentación disponible.
- No incluye capacidades de visión en los archivos GGUF (la torre de visión fue descartada en la conversión).

## Casos de uso

- Investigación en seguridad y alineación de modelos: el comportamiento sin rechazo permite estudiar cómo responden los modelos a prompts maliciosos, qué patrones de contenido generan y cómo se pueden implementar capas de seguridad externas. Es útil para evaluar técnicas de mitigación.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o material satírico que podría ser rechazado por modelos alineados. El Q4_K_M cabe en una GPU de 24 GB, lo que facilita su uso en entornos de creación local.
- Pruebas de estrés de sistemas de moderación: al desplegar el modelo detrás de un filtro de contenido, se puede comprobar la eficacia de dicho filtro frente a un modelo que no coopera con las políticas de seguridad.
- Desarrollo de asistentes de código en entornos aislados: aunque no se confirma tool calling, el modelo puede generar fragmentos de código y explicaciones técnicas sin las restricciones habituales, útil para prototipado rápido en laboratorios.
- Análisis de sesgos y comportamientos indeseados: al eliminar los rechazos, se pueden observar las respuestas "crudas" del modelo ante temas sensibles, lo que ayuda a caracterizar sesgos latentes en el modelo base.
- Evaluación comparativa de técnicas de abliteración: el repositorio ofrece tres cuantizaciones del mismo checkpoint, permitiendo reproducir los experimentos descritos en el blog de Nathan Sapwell y verificar las métricas de rechazo y cumplimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El blog de Nathan Sapwell menciona una evaluación de cinco técnicas de abliteración sobre Qwen3.6-27B, pero no se incluyen cifras concretas de MMLU, HumanEval u otros tests estandarizados en los materiales proporcionados. Se recomienda consultar el artículo original para obtener datos detallados.

## Requisitos de hardware

- F16: ~54 GB de peso, ~56 GB de VRAM con contexto de 4k. Requiere GPU profesional (A100 80GB, H100) o sistemas con memoria unificada amplia.
- Q8_0: ~28 GB de peso, ~30 GB de VRAM. Adecuado para GPUs de 32 GB o más (A6000, A100 40GB, Mac Studio con 64 GB unificados).
- Q4_K_M: ~16 GB de peso, ~18 GB de VRAM. Cabe en tarjetas de 24 GB como RTX 3090, RTX 4090 o A6000, y en Apple Silicon con 24 GB de memoria unificada.
- Despliegue recomendado con llama.cpp (versión ≥ 2026-01), ollama, LM Studio o KoboldCpp. Todos ellos heredan el soporte de la arquitectura `qwen3_5` de llama.cpp.
- La latencia y el throughput dependen del hardware y la cuantización; no se han publicado cifras oficiales. En una RTX 4090 con Q4_K_M y contexto 4k, se puede esperar una generación de varios tokens por segundo, aunque no hay datos exactos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cuantizaciones | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-abliterated-GGUF (este) | 26,9B | No disponible | Apache 2.0 | F16, Q8_0, Q4_K_M | Abliterado, sin rechazos, solo texto |
| Qwen/Qwen3.6-27B (original) | 26,9B | No disponible | Apache 2.0 | No disponible | Modelo base con alineación estándar, incluye visión |
| Otros modelos abliterados (p. ej. Llama-3-8B-abliterated) | 8B | Típicamente 8k-128k | Varía | GGUF | Menor tamaño, más fácil de ejecutar, pero menos capacidad |

La comparativa directa con el original es la más relevante: la única diferencia es la supresión de rechazos, con una divergencia KL de 0.024, lo que implica que el rendimiento en tareas estándar debería ser casi idéntico. Frente a modelos abliterados más pequeños, este ofrece mayor capacidad de razonamiento y generación de código, a costa de mayores requisitos de hardware.

## Limitaciones y advertencias

- El modelo está diseñado para producir contenido dañino sin disclaimers ni advertencias. No debe desplegarse ante usuarios finales sin una capa de seguridad externa.
- La tasa de rechazo del 10 % se midió con un juez LLM sobre 100 prompts; en entornos adversarios reales, la tasa de rechazo efectiva puede ser inferior.
- Solo se soportan inglés y chino según la documentación; otros idiomas pueden funcionar peor.
- La longitud de contexto no está especificada en la información disponible; se recomienda probar con valores conservadores (4k-8k) hasta confirmar el límite real.
- Los archivos GGUF no incluyen la torre de visión ni la cabeza MTP; no se puede procesar imágenes ni usar decodificación especulativa.
- Se requiere una versión reciente de llama.cpp (≥ 2026-01); versiones antiguas fallarán con el error "unknown model architecture".
- La licencia Apache 2.0 permite uso comercial, pero el responsable del despliegue asume toda la responsabilidad legal y ética del contenido generado.
- No se han publicado benchmarks estandarizados, por lo que no hay garantía de rendimiento en tareas específicas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated-GGUF
- Modelo base abliterado: https://huggingface.co/wangzhang/Qwen3.6-27B-abliterated
- Modelo original Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B (referencia)
- Análisis de abliteración de Nathan Sapwell: https://nathan.sapwell.net/posts/qwen36-27b-abliteration/
- Página de QwenCloud para Qwen3.6-27B: https://www.qwencloud.com/models/qwen3.6-27b
