# wangzhang/Qwen3.5-27B-abliterated

## Resumen

Qwen3.5-27B-abliterated es una versión modificada del modelo denso Qwen/Qwen3.5-27B de Alibaba Cloud, creada por Wangzhang Wu mediante el framework Abliterix. El objetivo es eliminar el comportamiento de rechazo (refusal) del modelo original, manteniendo en lo posible sus capacidades generales de generación de texto y conversación. Se trata de un modelo de 26.895.998.464 parámetros (aproximadamente 27B), con licencia Apache 2.0, publicado en marzo de 2026 y actualizado en agosto del mismo año.

La relevancia de este modelo radica en su uso como herramienta de investigación en alineación y seguridad de modelos de lenguaje, así como para aplicaciones que requieren generación de contenido sin restricciones impuestas por el alineamiento de seguridad. El proceso de abliteración emplea una combinación de proyección ortogonal, adaptadores LoRA de rango 1 y optimización bayesiana, logrando una tasa de rechazo del 1,5% (3 de 200 prompts) con una divergencia KL de 0,0051 respecto al modelo base.

Al ser un derivado del Qwen3.5-27B, hereda su arquitectura densa con Gated Delta Networks y Feed Forward Networks, aunque no se dispone de información detallada sobre la longitud de contexto ni los idiomas soportados en la documentación proporcionada. El repositorio incluye únicamente pesos en formato safetensors, sin cuantizaciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dense transformer con Gated Delta Networks y Feed Forward Networks (según el modelo base Qwen3.5-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es una modificación del checkpoint Qwen/Qwen3.5-27B, realizada mediante el framework Abliterix. El proceso de abliteración consta de cuatro etapas: extracción de la dirección de rechazo a partir de 800 prompts dañinos y 800 benignos, que revela patrones de activación por capa; proyección ortogonal para aislar la señal de rechazo eliminando componentes alineados con respuestas normales (reduciendo los rechazos en un 67% frente a la abliteración cruda); modificación de pesos mediante adaptadores LoRA de rango 1 en las capas de atención y MLP, capturados como adaptadores ligeros en lugar de ediciones destructivas; y optimización bayesiana con Optuna TPE que ajusta la forma del kernel, el índice fraccional de dirección y la fuerza por componente a lo largo de 35 ensayos para encontrar el equilibrio óptimo entre baja tasa de rechazo y baja divergencia KL.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO). El proceso de abliteración no implica entrenamiento adicional sobre datos nuevos, sino una intervención en el espacio de pesos del modelo ya entrenado.

## Capacidades

- Generación de texto y conversación multi-turno, con soporte para chat mediante plantillas de Hugging Face.
- Modo thinking: el modelo base Qwen3.5-27B incorpora capacidad de razonamiento explícito, aunque en el ejemplo de uso se recomienda desactivarlo con `enable_thinking=False` para respuestas directas.
- Ausencia de rechazo: tasa de rechazo del 1,5% (3 de 200 prompts), lo que permite respuestas a solicitudes que el modelo original bloquearía.
- Conservación de capacidades generales del modelo base (razonamiento, generación de código, matemáticas, etc.), aunque no se han publicado benchmarks específicos que lo confirmen.
- Compatibilidad con el ecosistema Transformers de Hugging Face, permitiendo integración con pipelines estándar de generación.

## Casos de uso

- Investigación en alineación y seguridad de modelos: permite estudiar el comportamiento de un modelo sin capas de rechazo, analizando cómo responde a prompts que normalmente serían bloqueados, y comparando con el modelo original para entender los mecanismos de alineación.
- Generación creativa sin restricciones: escritura de ficción, poesía o guiones que aborden temas controvertidos o explícitos, donde el modelo original podría negarse a responder.
- Evaluación de robustez de sistemas de moderación: probar filtros de contenido y sistemas de seguridad en aplicaciones que necesitan detectar respuestas potencialmente dañinas generadas por modelos abliterados.
- Desarrollo de datasets para entrenamiento de clasificadores de contenido: generar ejemplos de respuestas sin filtrar para entrenar modelos de moderación más eficaces.
- Análisis de sesgos y comportamientos indeseados: estudiar qué tipo de contenido produce el modelo cuando no hay restricciones de seguridad, identificando patrones de sesgo o alucinación.
- Prototipado de asistentes conversacionales en entornos controlados: aunque no es recomendable para producción, puede usarse en laboratorios para explorar interacciones sin límites de seguridad, siempre con supervisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas del proceso de abliteración: tasa de rechazo del 1,5% y divergencia KL de 0,0051 respecto al modelo base, pero no hay datos de rendimiento en tareas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 26.895.998.464 parámetros. En precisión BF16/FP16, los pesos ocupan aproximadamente 53,8 GB (coincide con el tamaño del repositorio), por lo que se necesitan al menos 60 GB de VRAM para cargar el modelo completo sin cuantización.
- Con cuantización a 8 bits, la VRAM requerida se reduce a unos 27-30 GB; a 4 bits, a unos 14-16 GB. Sin embargo, no se han publicado cuantizaciones oficiales en este repositorio, aunque existen versiones de terceros (por ejemplo, en Ollama).
- GPUs recomendadas: para inferencia en BF16, una A100 de 80 GB o dos RTX 4090 (24 GB cada una) con tensor parallelism. Para cuantización 4 bits, una RTX 4090 o RTX 3090 (24 GB) es suficiente.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (existe una versión de huihui-ai en Ollama), Transformers con `device_map="auto"` para distribución en múltiples GPUs.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Refusal rate | KL divergence | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-27B (base) | 26.9B | No disponible | Apache 2.0 | Alto (no cuantificado) | 0 | Hugging Face |
| wangzhang/Qwen3.5-27B-abliterated | 26.9B | No disponible | Apache 2.0 | 1,5% | 0,0051 | Hugging Face |
| huihui-ai/Huihui-Qwen3.5-27B-abliterated | 26.9B | No disponible | Apache 2.0 | No disponible | No disponible | Hugging Face, Ollama |

La comparativa se limita a aspectos estructurales y de licencia, ya que no hay datos de rendimiento publicados para ninguna de las versiones abliteradas. El modelo base es el punto de referencia natural, pero su comportamiento de rechazo no está cuantificado en la información disponible.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de su alineación de seguridad, por lo que puede generar contenido inexacto, sesgado, ofensivo, explícito, peligroso o ilegal. No debe utilizarse en producción sin salvaguardas adicionales.
- La abliteración no es perfecta: la divergencia KL de 0,0051 indica una ligera desviación respecto al modelo base, que podría traducirse en una degradación sutil de las capacidades generales.
- No se han publicado benchmarks de rendimiento, por lo que no es posible verificar si las capacidades del modelo base se conservan íntegramente.
- La longitud de contexto y los idiomas soportados no están documentados, lo que dificulta su uso en aplicaciones multilingües o con contextos largos.
- El repositorio no incluye cuantizaciones oficiales; los usuarios deben generarlas o recurrir a versiones de terceros, lo que puede introducir variaciones en el comportamiento.
- La licencia Apache 2.0 permite uso comercial, pero el disclaimer del autor advierte que el usuario es responsable del cumplimiento legal y de las políticas de plataforma. No se recomienda su despliegue en servicios públicos sin moderación humana.
- El modelo puede alucinar con facilidad, especialmente en temas controvertidos, al no tener restricciones que filtren respuestas factualmente incorrectas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wangzhang/Qwen3.5-27B-abliterated
- Framework Abliterix: https://github.com/wuwangzhang1216/abliterix
- Paquete PyPI de Abliterix: https://pypi.org/project/abliterix-llm/
- Modelo base Qwen3.5-27B: https://huggingface.co/Qwen/Qwen3.5-27B
- Versión de huihui-ai en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-27B-abliterated
- Versión en Ollama: https://ollama.com/huihui_ai/qwen3.5-abliterated:27b
