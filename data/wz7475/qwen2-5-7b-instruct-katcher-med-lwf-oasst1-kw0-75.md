# wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.75

## Resumen

El modelo `wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.75` es un ajuste fino (fine-tuning) del modelo base Qwen2.5-7B-Instruct, publicado por el usuario wz7475 en Hugging Face. Por el nombre del repositorio se deduce que se ha aplicado una técnica de fusión de pesos (weight merging) con un coeficiente `kw0.75`, combinando el modelo base con adaptadores entrenados sobre datasets médicos y el corpus OASST1 (Open Assistant Conversations). El resultado es un modelo de 7 mil millones de parámetros en formato safetensors, con un tamaño de repositorio de 12 GB, lo que corresponde a pesos en precisión de 16 bits.

La relevancia de esta ficha es limitada por la escasez de documentación: la model card es la plantilla automática de Hugging Face y no contiene información sustantiva sobre datos de entrenamiento, hiperparámetros, evaluación ni licencia. El modelo no registra descargas ni interacciones en el momento de la consulta, lo que sugiere un experimento personal más que un artefacto listo para producción.

Aun así, al derivar de Qwen2.5-7B-Instruct, hereda las capacidades del modelo original de Alibaba: arquitectura transformer densa, contexto nativo de 32 768 tokens (extensible a 131 072 mediante YaRN), soporte multilingüe y capacidad de tool calling. Esta ficha documenta lo que se puede verificar y marca explícitamente como "no disponible" todo lo que el autor no ha publicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct; detalles del ajuste no disponibles) |
| Parametros totales | 7 610 millones (heredados del modelo base; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens nativos en el modelo base; no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible en la model card; al ser safetensors, admite cuantización a GGUF/AWQ/GPTQ mediante herramientas externas |
| Idiomas soportados | No disponible (el modelo base Qwen2.5 soporta multilingüe, pero el autor no lo declara) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers, tag unsloth) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención de múltiples cabezas con RoPE, normalización RMSNorm y activación SwiGLU. El modelo base fue preentrenado por Alibaba con aproximadamente 18 billones de tokens y posteriormente alineado mediante instrucciones y preferencias humanas. Este repositorio no modifica esa arquitectura; solo altera los pesos.

El proceso de creación parece ser una fusión de pesos (model merging) o un ajuste con LoRA seguido de fusión, dado el sufijo `katcher-med-lwf-oasst1-kw0.75`. El término "katcher" no está documentado; "med" sugiere datos médicos; "lwf" podría referirse a Learning Without Forgetting (una técnica de ajuste continuo que preserva el rendimiento en tareas previas); "oasst1" indica el uso del dataset Open Assistant Conversations; y "kw0.75" apunta a un coeficiente de mezcla de 0,75. No hay información sobre número de tokens de entrenamiento, composición exacta del dataset, uso de RLHF/DPO ni hiperparámetros. La mención a la herramienta Unsloth en los tags sugiere que el ajuste se realizó con esa librería de entrenamiento eficiente.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base Qwen2.5-7B-Instruct, incluyendo razonamiento multi-paso y matemáticas básicas.
- Generación de código: el modelo base tiene buen rendimiento en lenguajes como Python, JavaScript y C++, aunque el ajuste con datos médicos y OASST1 podría haber degradado ligeramente esta capacidad (no verificado).
- Tool calling / function calling: soportado en el modelo base; no confirmado tras el ajuste.
- Capacidades de agente: el modelo base soporta razonamiento multi-paso y uso de herramientas; la preservación de esta capacidad depende del proceso de fusión (el sufijo "lwf" sugiere que se intentó preservar).
- Multilingüe: el modelo base soporta más de 29 idiomas; la model card no declara idiomas para este ajuste.
- Dominio médico: el sufijo "med" indica un ajuste orientado a terminología y tareas clínicas, aunque no hay evaluación publicada que lo respalde.
- Modo thinking: no disponible (Qwen2.5-Instruct no incluye modo de razonamiento explícito tipo QwQ).

## Casos de uso

- Experimentación con merging de modelos: el repositorio sirve como ejemplo práctico de fusión de pesos entre un modelo instruct generalista y adaptadores de dominio médico, útil para investigadores que estudien técnicas de mezcla y sus efectos en el olvido catastrófico.
- Prototipado de asistentes clínicos: gracias al ajuste con datos médicos, puede emplearse en entornos de investigación para generar borradores de respuestas sobre terminología sanitaria, siempre con supervisión humana y sin uso clínico real.
- Atención al cliente en dominio sanitario: el contexto de 32 768 tokens del modelo base permite gestionar conversaciones multi-turno con historiales largos de pacientes o consultas, aunque la falta de evaluación impide garantizar calidad.
- Generación de documentación médica: redacción de resúmenes de historiales o notas estructuradas en un pipeline de investigación, aprovechando el vocabulario especializado del ajuste.
- Fine-tuning posterior como base de dominio: al partir de un modelo ya adaptado a medicina y conversación, puede servir como punto de partida para ajustes más específicos (por ejemplo, radiología o farmacología) con menos datos.
- Evaluación comparativa de técnicas LWF: útil como caso de estudio para medir si la técnica Learning Without Forgetting preserva las capacidades del modelo base frente a un ajuste directo.
- Despliegue en local para pruebas: al ser un modelo de 7B en safetensors, cabe en una GPU de 24 GB en fp16 y en GPUs de consumo con cuantización, lo que facilita experimentación sin infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de dominio médico, y el autor no ha documentado comparaciones con el modelo base ni con otros ajustes.

## Requisitos de hardware

- VRAM para inferencia en fp16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda un mínimo de 18-20 GB.
- VRAM en cuantización de 8 bits: en torno a 8 GB de pesos, viable en GPUs de 12 GB.
- VRAM en cuantización de 4 bits (GGUF Q4_K_M): aproximadamente 4,5-5 GB, cabe en GPUs de consumo como RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia; RTX 4090 (24 GB) para fp16 en una sola tarjeta; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU de consumo: sí, con cuantización a 4 u 8 bits en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: transformers (nativo, según la librería declarada), vLLM, TGI, llama.cpp y Ollama tras convertir los pesos a GGUF; Unsloth para carga optimizada en memoria.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.75 | 7,6 B | 32 768 (heredado, no confirmado) | No disponible | Hugging Face, 0 descargas | Ajuste médico no documentado |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32 768 (131 072 con YaRN) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base, benchmarks publicados |
| BioMistral-7B | 7,2 B | 32 768 | Apache 2.0 | Hugging Face | Ajuste médico sobre Mistral, con evaluación publicada |
| Meditron-7B | 7 B | 4 096 | Llama 2 (uso restringido) | Hugging Face | Ajuste médico sobre Llama 2, benchmarks clínicos publicados |

## Limitaciones y advertencias

- Documentación inexistente: la model card es la plantilla automática; no hay información sobre datos, hiperparámetros ni evaluación, lo que impide auditar el modelo.
- Licencia no declarada: no se puede confirmar si el uso comercial está permitido; además, la licencia del modelo base Qwen2.5 (Apache 2.0) no garantiza que el autor del ajuste la haya respetado o declarado.
- Riesgo de alucinación elevado en dominio médico: sin evaluación clínica publicada, las respuestas sobre salud pueden ser incorrectas o peligrosas; no debe usarse para diagnóstico ni consejo médico.
- Posible olvido catastrófico: la fusión con datos médicos y OASST1 puede haber degradado capacidades del modelo base (código, matemáticas, multilingüismo); no hay mediciones que lo confirmen o descarten.
- Sesgos: no documentados; el modelo base Qwen2.5 presenta sesgos conocidos de género, cultura y geografía que probablemente persisten o se amplifican con el ajuste.
- Idiomas: no declarados; el ajuste con OASST1 (mayoritariamente inglés) y datos médicos podría haber reducido el rendimiento en castellano respecto al modelo base.
- Reproducibilidad: la ausencia de semilla, datasets e hiperparámetros impide reproducir el ajuste.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wz7475/qwen2.5-7b-instruct-katcher-med-lwf-oasst1-kw0.75
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Qwen2.5 en GitHub: https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Dataset Open Assistant Conversations (OASST1): https://huggingface.co/datasets/OpenAssistant/oasst1
- Unsloth (librería de entrenamiento eficiente): https://github.com/unslothai/unsloth
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
- Paper de Lacoste et al. (2019) citado en la model card: https://arxiv.org/abs/1910.09700
