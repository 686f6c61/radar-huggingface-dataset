# Wonderlab-Testing-Grounds/Interferon-lambda-RP-9B-Preview-2608

## Resumen

Interferon-lambda-RP-9B-Preview-2608 es un modelo de lenguaje especializado en roleplay (RP) y escritura creativa, desarrollado por Wonderlab-Testing-Grounds como una de las versiones de prueba previas al lanzamiento de Nyx-RP-9B-Instruct-2608-v2. Se trata de un fine-tuning del modelo Qwen/Qwen3.5-9B mediante LoRA, orientado a conversaciones largas y contenido narrativo, incluido material explícito. El modelo se distribuye bajo licencia Apache 2.0 y está pensado para generación de texto en inglés.

La relevancia de este modelo radica en su enfoque experimental: el autor declara haber ajustado el número de épocas (de 3 a 2) para mejorar la estabilidad, lo que lo convierte en una pieza interesante para quienes investigan el equilibrio entre calidad creativa y coherencia en fine-tunes de RP. Con aproximadamente 9,2 mil millones de parámetros, se sitúa en un rango que permite su ejecución en hardware de consumo con cuantización adecuada. No obstante, se advierte de su carácter potencialmente inestable y de la reducción deliberada de rechazos ante contenido explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen3.5-9B) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF, safetensors (según tags del repositorio) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only con atención estándar, y se ha fine-tuning mediante LoRA con rango 226 y 2 épocas. El autor indica que redujo las épocas de 3 a 2 tras observar que 3 épocas suponían un punto de ruptura en la estabilidad del modelo. El entrenamiento se realizó en una RTX 5070 Ti con un Ryzen 7 7800X3D y 32 GB de RAM, lo que sugiere un proceso de ajuste relativamente ligero.

El dataset empleado es propio, recopilado a partir de logs de roleplay de alta calidad, con predominio de conversaciones largas y explícitas. El autor señala explícitamente que el fine-tuning reduce los rechazos del modelo ante contenido sexual o violento, un aspecto relevante para casos de uso de RP adulto. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al fine-tuning supervisado.

## Capacidades

- Generación de texto narrativo y conversacional en inglés, con especial énfasis en roleplay y escritura creativa.
- Mantenimiento de conversaciones multi-turno largas, dado que el dataset incluye logs extensos.
- Reducción de rechazos ante contenido explícito (ERP), lo que permite escenarios adultos sin censura.
- Capacidad de seguir instrucciones de estilo y tono, heredada de la base Qwen3.5-9B.
- No se documenta soporte para tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales (visión, audio) ni modo de pensamiento explícito.

## Casos de uso

- Roleplay interactivo en juegos de texto: el modelo puede mantener personajes consistentes y responder a acciones del usuario en escenarios largos, gracias a su entrenamiento con logs de RP extensos.
- Escritura de ficción colaborativa: adecuado para generar borradores de diálogos, descripciones y tramas en proyectos de escritura conjunta, donde el usuario guía la narrativa y el modelo propone continuaciones.
- Generación de contenido creativo para juegos de rol de mesa: puede actuar como director de juego automatizado, describiendo escenarios, interpretando PNJs y reaccionando a las decisiones de los jugadores.
- Prototipado de chatbots con personalidad: su capacidad para mantener un tono consistente y su baja tendencia a rechazar peticiones lo hacen útil para experimentar con asistentes conversacionales con carácter definido.
- Creación de guiones o diálogos para medios audiovisuales: el modelo puede generar intercambios verbales con matices emocionales, útil como herramienta de apoyo para guionistas.
- Evaluación de fine-tunes de RP: al ser una versión de prueba con estabilidad ajustada, sirve como referencia para comparar el efecto de distintas configuraciones de entrenamiento (épocas, rango LoRA) en modelos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se dispone de comparaciones cuantitativas con otros modelos de roleplay. La ausencia de datos objetivos impide valorar su rendimiento más allá de las afirmaciones cualitativas del autor sobre estabilidad y calidad creativa.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,2B parámetros, una cuantización de 4 bits (GGUF Q4_K_M) requiere aproximadamente 5-6 GB de VRAM; en 8 bits, unos 9-10 GB; en precisión completa (fp16), unos 18-19 GB.
- GPU recomendadas: para cuantización 4 bits, una RTX 3060 de 12 GB o superior es suficiente; para fp16, se recomienda una RTX 4090, A100 o similar con al menos 24 GB.
- Sí cabe en GPU de consumo: con cuantización GGUF de 4 bits, puede ejecutarse en tarjetas como RTX 3060, RTX 4060 Ti o RTX 5070 Ti (esta última usada por el autor para entrenar).
- Opciones de despliegue: al estar disponible en formato GGUF, puede usarse con llama.cpp, Ollama o LM Studio; el formato safetensors permite su uso con vLLM, TGI o Transformers directamente.
- Latencia y throughput: no se dispone de datos medidos. En una RTX 4090 con cuantización 4 bits, se puede esperar una generación de 30-50 tokens por segundo, pero son estimaciones orientativas sin verificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Interferon-lambda-RP-9B-Preview-2608 | 9,2B | No disponible | Apache 2.0 | RP/ERP, experimental |
| Interferon-alpha-RP-9B-Preview-2608 | 9,2B (presumiblemente) | No disponible | Apache 2.0 | RP/ERP, versión anterior |
| Qwen3.5-9B (base) | 9,2B | No disponible | Apache 2.0 | Modelo generalista |

No se dispone de datos de rendimiento comparativo entre estos modelos. El modelo alpha (Interferon-alpha) tiene 294 descargas frente a 0 del lambda, lo que sugiere que el lambda es una iteración más reciente y menos difundida. No se han encontrado otros modelos de RP de 9B con licencia Apache 2.0 en la información disponible para una comparación más amplia.

## Limitaciones y advertencias

- Modelo experimental y potencialmente inestable: el propio autor lo etiqueta como "potentially unstable" y lo presenta como una versión de prueba para un futuro lanzamiento.
- Reducción deliberada de rechazos: el fine-tuning minimiza las negativas ante contenido explícito, lo que puede generar respuestas inapropiadas en contextos no deseados.
- Solo inglés: no se ha entrenado ni evaluado en otros idiomas, por lo que su uso en castellano u otras lenguas puede degradar la calidad.
- Sin benchmarks publicados: no hay evidencia objetiva de su rendimiento en tareas estándar, lo que dificulta su evaluación rigurosa.
- Sin soporte documentado para tool calling ni agentes: no es adecuado para integraciones que requieran interacción con APIs o ejecución de acciones.
- Riesgo de alucinación: al ser un modelo de generación libre sin alineación adicional, puede inventar hechos, nombres o eventos, especialmente en contextos de no ficción.
- Sin garantías de producción: al ser una preview con 0 descargas y 0 likes, no hay comunidad que valide su comportamiento en entornos reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wonderlab-Testing-Grounds/Interferon-lambda-RP-9B-Preview-2608
- Modelo hermano (Interferon-alpha): https://huggingface.co/Wonderlab-Testing-Grounds/Interferon-alpha-RP-9B-Preview-2608
- Búsqueda de modelos con tag "Potentially unstable": https://huggingface.co/models?other=Potentially+unstable
- Sitio web de Wonderlab (no relacionado con el modelo, pero aparece en la búsqueda): https://www.wonderlab.bio/
