# Welmia/welmia-2.0-103m-instruct

## Resumen

Welmia 2.0 103M Instruct es un modelo de lenguaje de tipo GPT con 103,4 millones de parámetros, desarrollado por Welmia (Muhammed Rishdin T). Está diseñado para seguir instrucciones en inglés, con un enfoque en tareas de generación de texto de una sola vuelta. El modelo se preentrenó desde cero sobre aproximadamente 5.000 millones de tokens del corpus OpenWebText y posteriormente se ajustó con el dataset Alpaca (unas 52.000 muestras) mediante aprendizaje supervisado con pérdida enmascarada sobre el prompt.

Su relevancia radica en ser un modelo compacto, entrenado desde cero con una arquitectura personalizada (RoPE, RMSNorm, SwiGLU, embeddings atados) y con una licencia Apache 2.0, lo que lo hace accesible para experimentación y despliegue en entornos con recursos limitados. No obstante, su tamaño y contexto corto (512 tokens) limitan sus capacidades a tareas sencillas de instrucción, sin soporte para conversaciones multi-turno ni razonamiento complejo.

La versión instruct está disponible en HuggingFace junto con la versión base, y requiere `trust_remote_code=True` para cargar la arquitectura personalizada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-style con RoPE, RMSNorm, SwiGLU y weight tying |
| Parametros totales | 103.385.856 (103,4 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No se especifican en la información; se espera soporte de cuantización estándar (FP16, INT8, etc.) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (0,4 GB) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura GPT clásica con 12 capas, 12 cabezas de atención, dimensión de embedding 768 y vocabulario de 24.000 tokens. Emplea normalización RMSNorm, activación SwiGLU, posiciones rotatorias (RoPE) y atado de pesos entre embeddings de entrada y salida. El tokenizador es un BPE personalizado de 24k vocabulario, no compatible con GPT-2 ni tiktoken.

El entrenamiento se realizó en dos fases: primero, preentrenamiento causal sobre 5B tokens de OpenWebText; después, fine-tuning instructivo sobre el dataset Alpaca (52k ejemplos, 3 épocas, AdamW, tasa de aprendizaje con decaimiento coseno). Durante el ajuste instructivo, la pérdida se enmascaró sobre el prompt para entrenar solo la respuesta. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generación de texto en inglés siguiendo instrucciones de una sola vuelta.
- Respuesta a preguntas y tareas de formato simple (por ejemplo, explicaciones, listas, resúmenes).
- Capacidad básica de seguimiento de instrucciones, limitada por el tamaño y el contexto.
- No soporta multi-turno: cada prompt se trata como independiente.
- No dispone de tool calling ni función de agente.
- No tiene capacidades multimodales (visión, audio).
- No se menciona un modo de razonamiento explícito.

## Casos de uso

- Prototipado rápido de asistentes de texto simple: se puede integrar en aplicaciones que requieran responder a una instrucción única sin historial de conversación, como un generador de titulares o resúmenes.
- Generación de contenido breve: redacción de párrafos cortos, descripciones de productos o ideas creativas a partir de una instrucción dada.
- Clasificación de texto: aprovechando su capacidad de seguir instrucciones, puede etiquetar o categorizar frases en inglés con un prompt adecuado.
- Extracción de información: a partir de un contexto corto (dentro de 512 tokens), puede extraer entidades o datos concretos siguiendo un formato de instrucción.
- Educación y aprendizaje: sirve como ejemplo didáctico para estudiantes de procesamiento de lenguaje natural que quieran estudiar modelos entrenados desde cero.
- Pruebas de concepto en entornos con recursos limitados: al ser pequeño y de licencia abierta, se puede desplegar en CPU o GPU de bajo perfil para validar pipelines de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no reporta métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: un modelo de 103 M parámetros en FP16 ocupa aproximadamente 206 MB de memoria de pesos, más overhead de activaciones. En la práctica, puede ejecutarse en una GPU con al menos 1 GB de VRAM, o en CPU con RAM suficiente.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060) es suficiente. También es posible ejecutarlo en CPU con 8 GB de RAM.
- Cabe en consumer GPU: sí, en cualquier GPU de consumo actual.
- Opciones de despliegue: se puede cargar con Transformers (con `trust_remote_code=True`), o convertir a GGUF para usar con llama.cpp o Ollama, aunque no se proporcionan archivos GGUF oficiales.
- Latencia y throughput: no se han publicado datos oficiales. Dado el tamaño, la inferencia es rápida en GPU, con tiempos de generación del orden de decenas de tokens por segundo en una GPU moderna, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos de tamaño similar (por ejemplo, GPT-2 124M, DistilGPT2, o modelos de 100M de parámetros). La información proporcionada no incluye comparativas. Se recomienda al lector consultar benchmarks públicos de modelos de tamaño similar para una evaluación contextualizada.

## Limitaciones y advertencias

- Modelo de una sola vuelta: no soporta conversaciones multi-turno; cada prompt se trata como independiente.
- Sin KV cache: la generación recalcula la pasada completa en cada paso, lo que hace la inferencia más lenta que modelos con cache.
- Contexto limitado a 512 tokens: las entradas más largas se truncan por la izquierda, lo que puede perder información relevante.
- Capacidades reducidas: es un modelo pequeño, por lo que su razonamiento, conocimiento del mundo y capacidad de seguir instrucciones complejas son limitados.
- Riesgo de alucinación: al ser entrenado con un corpus de tamaño reducido, puede generar afirmaciones falsas o inventar datos.
- Idiomas: solo inglés, no es multilingüe.
- Dependencia de código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; se recomienda revisar el script `modeling_gpt.py` antes de usar en producción.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la procedencia del código personalizado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Welmia/welmia-2.0-103m-instruct)
- [Versión base (no instruct)](https://huggingface.co/Welmia/welmia-2.0-103m-base) (según la model card, no se ha confirmado el enlace directo)
- [Perfil del autor en HuggingFace](https://huggingface.co/Welmia)
- [Modelo relacionado: Welmia/welmiaqwen](https://huggingface.co/Welmia/welmiaqwen) (encontrado en la búsqueda, sin relación directa confirmada)
