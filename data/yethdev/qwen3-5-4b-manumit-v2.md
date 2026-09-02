# yethdev/qwen3.5-4b-manumit-v2

## Resumen

El modelo `yethdev/qwen3.5-4b-manumit-v2` es una versión "abliterada" del modelo Qwen3.5-4B de Alibaba, desarrollada por el usuario yethdev. El término "manumit" (del latín, "liberar") hace referencia a la técnica empleada para eliminar el comportamiento de rechazo del modelo original: en lugar de un simple borrado de una única dirección de activación, se identifica y proyecta fuera de los pesos todo el subespacio del flujo residual que codifica la negativa a responder, y posteriormente se "cura" el modelo con datos ordinarios para minimizar la pérdida de capacidad. El resultado es un modelo que responde a peticiones que el modelo base rechazaría, manteniendo la mayor parte de sus habilidades generales.

Con 4.539.265.536 parámetros (aproximadamente 4,5 mil millones), este modelo se posiciona en el rango de los modelos de tamaño medio, adecuado para inferencia en GPUs de consumo con cuantización. La licencia es MIT, lo que facilita su uso comercial, aunque el modelo base Qwen3.5-4B conserva sus propios términos. La relevancia de esta ficha radica en que ejemplifica una tendencia creciente en la comunidad open source: la modificación de modelos para eliminar capas de seguridad, con implicaciones tanto para la investigación en alineación como para aplicaciones que requieren respuestas sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.5-4B (transformer, detalles no especificados) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No disponible (no se indica si es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe versión GGUF del v1, no confirmada para v2) |
| Idiomas soportados | No disponible |
| Licencia | MIT (el modelo base Qwen3.5-4B mantiene sus propios términos) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.5-4B, que según la documentación oficial de Qwen3.5 integra una fundación unificada de visión-lenguaje con entrenamiento temprano de fusión multimodal sobre billones de tokens. Sin embargo, la model card de esta versión manumit no especifica detalles arquitectónicos propios, por lo que se asume que la estructura del transformer original se conserva íntegramente.

El proceso de "manumit" descrito por el autor consiste en dos fases: primero, se localizan en el flujo residual las direcciones que transportan la señal de rechazo (un subespacio, no un único vector) y se proyectan fuera de los pesos mediante una ablación. Segundo, se realiza un ajuste fino ("healing") con datos ordinarios para recuperar parte de la capacidad perdida por la ablación. Este enfoque difiere de herramientas de una sola pasada que eliminan únicamente el vector principal de rechazo, y busca una eliminación más completa del comportamiento no deseado. No se proporcionan detalles sobre el volumen de datos de entrenamiento, la composición del dataset de curación ni si se emplearon técnicas de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional y de larga forma, con soporte para plantillas de chat mediante `apply_chat_template`.
- Razonamiento y resolución de problemas, como refleja la puntuación de 42,6% en MMLU-Pro (medida con n=500).
- El modelo base Qwen3.5-4B es multimodal (image-text-to-text), pero esta versión manumit no confirma explícitamente si conserva la capacidad de procesamiento de imágenes; se recomienda verificar antes de su uso en tareas multimodales.
- No se menciona soporte explícito para tool calling, function calling o modos de agente en la model card, aunque el modelo base podría heredarlos.
- Capacidad multilingüe no documentada en la información disponible.

## Casos de uso

- Investigación en alineación y seguridad de IA: permite estudiar el comportamiento de un modelo sin capas de rechazo, comparando respuestas con el modelo base para analizar qué mecanismos internos median la negativa.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que el modelo base podría rechazar por temáticas sensibles, siempre que se respete la legalidad vigente.
- Desarrollo de asistentes especializados en dominios controvertidos: por ejemplo, simulación de escenarios de riesgo o análisis de hipótesis no convencionales en entornos controlados de investigación.
- Evaluación de robustez de sistemas de moderación: se puede emplear como generador de prompts adversariales para probar filtros de contenido en otras aplicaciones.
- Fine-tuning posterior para tareas específicas: al ser un modelo abliterado, puede servir como punto de partida para adaptaciones que requieran respuestas sin evasivas, como chatbots de nicho.
- Benchmarking de técnicas de ablación: comparar el rendimiento de manumit v2 con otras versiones abliteradas (v1) o con el modelo base para medir el coste de capacidad.

## Benchmarks y rendimiento

La model card proporciona los siguientes resultados, medidos por el autor:

| Benchmark | Este modelo | Qwen3.5-4B (base) |
|---|---|---|
| AdvBench refusal (tasa de rechazo) | 0,0% | Alta |
| JailbreakBench refusal (tasa de rechazo) | 0,0% | Alta |
| MMLU-Pro (n=500) | 42,6% | 45,0% |

La tasa de rechazo es prácticamente nula en los conjuntos de pruebas de prompts dañinos, mientras que la capacidad general medida con MMLU-Pro desciende 2,4 puntos porcentuales respecto al base, lo que indica un coste de ablación parcialmente compensado por la fase de curación. No se dispone de otros benchmarks (HumanEval, GSM8K, etc.) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16, el modelo requiere aproximadamente 9 GB (4,5B parámetros × 2 bytes); con cuantización de 8 bits baja a ~4,5 GB y con 4 bits a ~2,5 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 3060 (12 GB), RTX 4070 (12 GB) o superiores.
- GPU recomendadas: RTX 3090/4090 para FP16 sin cuantizar; GPUs con 8 GB o más para cuantización de 8 bits; tarjetas con 4-6 GB para cuantización de 4 bits.
- Opciones de despliegue: al ser un modelo de la familia transformers, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (existe versión GGUF del v1, no confirmada para v2).
- Latencia y throughput: no se han publicado mediciones específicas; para un modelo de 4,5B en una RTX 4090 se puede esperar una generación de 50-100 tokens por segundo en FP16, y mayor con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yethdev/qwen3.5-4b-manumit-v2 | 4,5B | No disponible | MIT | Abliterado, sin rechazo |
| Qwen/Qwen3.5-4B (base) | 4,5B | No disponible | Apache 2.0 (según términos de Qwen) | Modelo original con rechazo |
| yethdev/qwen3.5-4b-manumit-v1 | 4,5B | No disponible | MIT | Versión anterior del mismo autor |

No se dispone de datos de otros modelos abliterados de tamaño similar para una comparación cuantitativa. La principal diferencia con el base es la eliminación del rechazo, con una pérdida de 2,4 puntos en MMLU-Pro.

## Limitaciones y advertencias

- El modelo no tiene capa de seguridad ni guardián de salida: puede generar contenido dañino, ilegal o éticamente cuestionable. El autor advierte explícitamente que el usuario es responsable de lo que genere y de cumplir la ley y los términos del modelo base.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede inventar información, especialmente en dominios especializados; la puntuación de 42,6% en MMLU-Pro indica una capacidad moderada pero no sobresaliente.
- La pérdida de capacidad respecto al base (2,4 puntos en MMLU-Pro) puede afectar a tareas que requieren razonamiento complejo o conocimiento factual.
- No se ha confirmado si la funcionalidad multimodal del base se conserva; si se necesita procesamiento de imágenes, es recomendable probar antes de usar.
- La licencia MIT del modelo no exime de cumplir los términos del modelo base Qwen3.5-4B, que pueden incluir restricciones de uso comercial o atribución.
- No se proporcionan datos sobre sesgos, idiomas soportados ni longitud de contexto, por lo que su comportamiento en estos aspectos es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yethdev/qwen3.5-4b-manumit-v2
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Versión v1 del modelo manumit: https://huggingface.co/yethdev/qwen3.5-4b-manumit-v1
- Versión GGUF del v1: https://huggingface.co/yethdev/qwen3.5-4b-manumit-v1-GGUF
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:4b
- Repositorio de Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
