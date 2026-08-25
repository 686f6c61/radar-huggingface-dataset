# Speedymule/lumiar3.0-4b

## Resumen

Lumiar 3.0 4B es un modelo de lenguaje fine-tuneado a partir de Qwen/Qwen3.5-4B, creado por el usuario Speedymule. El modelo está diseñado para simular la personalidad y el estilo de conversación de una persona llamada Lumen, utilizando como conjunto de entrenamiento una recopilación de sus mensajes privados de Discord. El dataset no se comparte públicamente por razones de privacidad.

Se trata de un ejemplo de personalización de modelos de base mediante fine-tuning con datos conversacionales reales, orientado a usos informales o de entretenimiento. El modelo tiene aproximadamente 4.326 millones de parámetros y se distribuye en formato GGUF, lo que facilita su ejecución en hardware de consumo. No se especifican la licencia, los idiomas soportados ni la longitud de contexto, aunque al derivar de Qwen3.5-4B es probable que herede sus características técnicas, sin confirmación oficial.

El autor recomienda desactivar el modo de razonamiento (reasoning) del modelo, ya que en sus pruebas el modelo tiende a repetirse en sus pensamientos y produce mejores respuestas con el razonamiento desactivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base: Qwen/Qwen3.5-4B) |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes no especificadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base Qwen/Qwen3.5-4B, que pertenece a la familia Qwen3.5. No se han publicado detalles sobre la arquitectura interna (número de capas, cabezas de atención, etc.) ni sobre el proceso de entrenamiento (número de tokens, método de alineación, si se usó RLHF o DPO). El dataset de entrenamiento consiste en una colección de mensajes de Discord de una persona llamada Lumen, proporcionados por la propia persona; este dataset no se comparte públicamente.

No se ha documentado ninguna innovación técnica específica en el fine-tuning. El autor solo menciona la recomendación de desactivar el razonamiento para evitar repeticiones en las respuestas.

## Capacidades

- No se han publicado capacidades específicas para este modelo.
- Al ser un fine-tune de Qwen3.5-4B, se espera que herede las capacidades generales del modelo base, como generación de texto, razonamiento, comprensión de instrucciones y posiblemente soporte de herramientas, pero no hay confirmación oficial.
- El modelo está orientado a conversación informal y simulación de personalidad, según la descripción del autor.
- No se dispone de información sobre soporte de tool calling, agentes, visión o audio.

## Casos de uso

- Chat conversacional personalizado: el modelo puede utilizarse para mantener conversaciones con el estilo y tono de la persona original, ideal para proyectos de entretenimiento o simulación de personajes.
- Bot de Discord con personalidad: al estar entrenado con mensajes de Discord, puede integrarse como bot en servidores de Discord para replicar el estilo de conversación de Lumen.
- Prototipado de asistentes informales: sirve como base para experimentar con fine-tuning en datos de redes sociales y evaluar cómo el modelo captura idiolectos y patrones de habla.
- Investigación en privacidad y ética del fine-tuning: permite estudiar los riesgos de entrenar modelos con datos personales sin consentimiento explícito, y las implicaciones legales y éticas.
- Pruebas de cuantización y despliegue local: al ser un modelo de 4B en formato GGUF, es adecuado para probar técnicas de cuantización y ejecución en hardware de consumo (GPUs con 4-8 GB de VRAM).
- Generación de respuestas con estilo informal: puede emplearse en aplicaciones que requieran un tono desenfadado y cercano, como chatbots de soporte no profesional o generación de contenido humorístico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización GGUF Q4, el modelo ocupa aproximadamente 2,5-3 GB de VRAM; con Q8, alrededor de 4,5-5 GB. Estas cifras son estimaciones basadas en el tamaño de parámetros y no han sido confirmadas por el autor.
- GPU recomendadas: tarjetas con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060) pueden ejecutar el modelo con cuantización Q4. Para mayor margen, se recomienda 6-8 GB de VRAM.
- El modelo cabe en GPUs de consumo, siempre que se utilice una cuantización adecuada.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-webui, o cualquier framework compatible con GGUF. Para safetensors, se puede usar vLLM o Transformers con carga en GPU.
- Latencia y throughput: no se han publicado datos. En una GPU moderna, un modelo de 4B suele generar entre 20 y 50 tokens por segundo, dependiendo de la cuantización y el hardware.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo es un fine-tune específico de Qwen3.5-4B, y no se han publicado métricas de rendimiento ni características detalladas que permitan compararlo con alternativas como Qwen2.5-4B, Llama-3.2-3B o Phi-3.5-mini. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con mensajes de una única persona, por lo que reflejará los sesgos, opiniones y patrones lingüísticos de esa persona, que pueden no ser representativos ni apropiados para todos los contextos.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas fuera de su dominio de entrenamiento.
- Privacidad: el dataset contiene mensajes privados de Discord. Aunque no se comparte, el modelo podría memorizar fragmentos de esos mensajes y reproducirlos, lo que supone un riesgo de filtración de información personal.
- Limitaciones de contexto e idioma: no se especifican, pero al derivar de Qwen3.5-4B, es probable que el contexto sea limitado (típicamente 32K o menos) y el soporte de idiomas dependa del modelo base.
- Restricciones de licencia: la licencia no está indicada, por lo que no se garantiza el uso comercial. Se recomienda contactar al autor antes de cualquier uso productivo.
- Advertencia para producción: el modelo está pensado para uso informal y experimental; no es adecuado para aplicaciones críticas o que requieran respuestas fiables y verificables.

## Enlaces

- HuggingFace: https://huggingface.co/Speedymule/lumiar3.0-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
