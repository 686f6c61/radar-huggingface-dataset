# ZiboPeng/Yuna-1.7B-v1

## Resumen

Yuna-1.7B-v1 es un modelo de conversación en chino desarrollado por ZiboPeng, construido como un fine-tuning del modelo base Qwen/Qwen3-1.7B. Está diseñado para ofrecer una experiencia de chat natural con una personalidad definida: gentil, comprensiva y con tendencia a dar consejos directos y prácticos cuando se le pide un juicio. El modelo se distribuye tanto en formato safetensors como en GGUF, lo que facilita su ejecución local en herramientas como LM Studio.

El modelo es relevante por su tamaño reducido (1.720.574.976 parámetros, aproximadamente 1,7B), lo que permite su despliegue en hardware de consumo sin sacrificar una experiencia conversacional cuidada. Su entrenamiento se realizó mediante SFT/LoRA sin system prompt de personalidad, integrando la identidad y el estilo de expresión directamente en los pesos. Está orientado exclusivamente al idioma chino y su licencia no está especificada en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (1,72B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada oficialmente; el autor recomienda 4096 tokens en LM Studio |
| Tipos de cuantizacion | GGUF Q8_0 (mencionado en la model card); otros formatos no confirmados |
| Idiomas soportados | Chino (zh) |
| Licencia | No disponible |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

Yuna-1.7B-v1 parte de la arquitectura transformer de Qwen3-1.7B, un modelo denso de 1,7B parámetros. El fine-tuning se realizó mediante SFT/LoRA, utilizando datos de conversación sin system prompt de personalidad, de modo que la identidad y el estilo de Yuna quedan codificados en los pesos del modelo en lugar de depender de instrucciones externas. El conjunto de entrenamiento incluye muestras de anti-interferencia de identidad, conversación natural, consejos directos, comprensión emocional y gestión de límites relacionales. No se han publicado detalles sobre el volumen de tokens, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto conversacional en chino con una personalidad consistente (gentil, comprensiva, con tendencia a dar consejos claros).
- Comprensión emocional básica y manejo de conversaciones con carga afectiva.
- Capacidad para ofrecer recomendaciones prácticas y directas cuando se solicita un juicio.
- Resistencia a la interferencia de identidad: el modelo mantiene su rol sin confundirse con otras personalidades.
- No se menciona soporte para tool calling, function calling, razonamiento multi-paso, visión, audio ni modo thinking explícito.
- Multilingüismo limitado: únicamente chino.

## Casos de uso

- Asistente conversacional personal en chino: el modelo puede mantener diálogos naturales y empáticos, adecuado para usuarios que buscan una compañía conversacional ligera y local.
- Práctica de conversación en chino: su tono natural y su capacidad para dar consejos lo hacen útil como herramienta de práctica idiomática, aunque su conocimiento factual es limitado.
- Despliegue en entornos con recursos restringidos: al ser un modelo de 1,7B con cuantización GGUF Q8_0 (~1,83 GB), puede ejecutarse en portátiles o mini-PCs sin GPU dedicada, o en GPUs de gama baja.
- Prototipado de chatbots con personalidad: su enfoque en identidad integrada en pesos lo convierte en un punto de partida para experimentar con fine-tuning de personajes sin depender de system prompts complejos.
- Investigación sobre modelos pequeños de chat: útil para estudiar cómo el fine-tuning con datos conversacionales específicos afecta a la coherencia de personalidad en modelos de menos de 2B parámetros.
- Uso educativo sobre despliegue local de LLMs: su tamaño y formato GGUF facilitan demostraciones de inferencia local con herramientas como LM Studio o llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: con cuantización GGUF Q8_0 (~1,83 GB de peso), la inferencia puede realizarse con tan solo 4 GB de VRAM en GPU, o incluso en CPU con suficiente RAM (se recomiendan al menos 8 GB de RAM total).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060, etc.). También es viable en Apple Silicon con 8 GB unificados.
- Compatibilidad con GPU de consumo: sí, es uno de los puntos fuertes del modelo.
- Opciones de despliegue: LM Studio (recomendado por el autor), llama.cpp, Ollama, y cualquier framework compatible con GGUF. También puede usarse con transformers para el formato safetensors.
- Latencia y throughput: no se han publicado cifras concretas, pero para un modelo de 1,7B en Q8_0 se espera una generación fluida en hardware moderno, con velocidades típicas de 20-40 tokens/s en GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Yuna-1.7B-v1 | 1,72B | No especificado (recomendado 4096) | Chino | No disponible | safetensors, GGUF |
| Qwen3-1.7B (base) | 1,72B | No especificado (Qwen3 soporta hasta 32K según documentación oficial) | Multilingüe (incluye chino) | Apache 2.0 (según Qwen) | safetensors, GGUF |
| Qwen2.5-1.5B-Instruct | 1,54B | 32K | Multilingüe | Apache 2.0 | safetensors, GGUF |

Nota: los datos de Qwen3-1.7B y Qwen2.5-1.5B-Instruct provienen de información pública general, no de la ficha del modelo. La comparación se basa en características estructurales, no en rendimiento medido.

## Limitaciones y advertencias

- Modelo de tamaño reducido (1,7B): su conocimiento factual, capacidad de razonamiento complejo y estabilidad en conversaciones largas son limitados, como reconoce el propio autor.
- Idioma restringido: solo chino; no es adecuado para otros idiomas.
- Licencia no disponible: no se especifica la licencia, lo que genera incertidumbre sobre el uso comercial y la redistribución. Se recomienda contactar al autor antes de usarlo en producción.
- Origen del personaje: la personalidad de Yuna se basa en la impresión lingüística de un estudiante fallecido, pero el modelo no afirma ser la persona real. Aun así, puede generar respuestas que algunos usuarios interpreten como inapropiadas o sensibles.
- Riesgo de alucinación: como todo LLM pequeño, puede inventar información o dar consejos incorrectos, especialmente en dominios especializados.
- Contexto limitado en la práctica: aunque el modelo base podría soportar más tokens, el autor recomienda 4096, lo que restringe el manejo de conversaciones muy largas.
- Sin soporte para herramientas ni funciones avanzadas: no hay indicios de tool calling, lo que limita su integración en flujos de trabajo automatizados.

## Enlaces

- HuggingFace: https://huggingface.co/ZiboPeng/Yuna-1.7B-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B

No se han encontrado otros enlaces oficiales (papers, blogs, repositorios) específicos de este modelo en la información proporcionada.
