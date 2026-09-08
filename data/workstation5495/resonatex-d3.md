# Workstation5495/Resonatex-D3

## Resumen

ResonateX D3 es un modelo causal de lenguaje con arquitectura GPT-2, desarrollado por Workstation5495 y entrenado desde cero como asistente conversacional. Es el sucesor de ResonateX D2, del que hereda el formato de turnos con tokens de rol, pero con una arquitectura ampliada y una ventana de contexto de 1.024 tokens. El modelo cuenta con 124.442.112 parámetros, 12 capas, 12 cabezas de atención y un tamaño oculto de 768. Está diseñado para ejecutarse completamente offline en hardware de consumo, ya sea CPU, GPU o MPS.

El entrenamiento se realizó desde cero, sin utilizar pesos preentrenados, y solo se reutilizó el tokenizador de ai-forever/rugpt3small_based_on_gpt2. El modelo está optimizado para conversaciones multi-turno en ruso e inglés mediante los tokens especiales `<|user|>`, `<|assistant|>` y `<|endofturn|>`, con la pérdida enmascarada solo sobre los turnos del asistente. Su relevancia radica en ofrecer una alternativa ligera y reproducible para la experimentación educativa y la investigación con modelos conversacionales en entornos sin conexión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (GPT2LMHeadModel) |
| Parámetros totales | 124.442.112 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | other (update-before-publishing) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ResonateX D3 emplea una arquitectura GPT-2 completa de 12 capas, 12 cabezas de atención de tamaño 64, tamaño oculto de 768 y tamaño de feed-forward de 3.072. Utiliza activación `gelu_new` y dropout de 0,05 en capas residuales, embeddings y atención. El vocabulario tiene 50.260 tokens: reutiliza el vocabulario base de ai-forever/rugpt3small_based_on_gpt2 y añade 3 tokens especiales adicionales, aunque la model card indica que conviene confirmar los valores exactos en el `tokenizer_config.json`.

El entrenamiento se realizó desde cero, sin fine-tuning sobre pesos preexistentes. Los datos de entrenamiento consisten en diálogos en ruso e inglés, aunque su composición exacta no está documentada. La pérdida se enmascara para calcularse únicamente sobre los turnos del asistente, lo que optimiza el modelo para generar respuestas en formato conversacional en lugar de continuar texto arbitrario. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al entrenamiento. La ventana de contexto de 1.024 tokens permite generar hasta aproximadamente 900 tokens nuevos, siempre que quede espacio suficiente para el prompt y el historial.

## Capacidades

- Generación de texto conversacional en ruso e inglés mediante formato de turnos con tokens de rol (`<|user|>`, `<|assistant|>`, `<|endofturn|>`).
- Optimizado para producir respuestas de asistente; la pérdida solo se calcula sobre los turnos del asistente.
- Soporte de conversaciones multi-turno dentro de una ventana de contexto de 1.024 tokens.
- Ejecución offline completa en CPU, GPU o MPS, apta para hardware de consumo.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de visión, audio ni multimodalidad.
- Sin capacidades de razonamiento avanzado o pensamiento intermedio (thinking mode).
- Requiere configuración explícita de `eos_token_id` para detener la generación en el token `<|endofturn|>`.

## Casos de uso

- **Prototipado de chatbots locales**: El modelo puede ejecutarse en CPU para crear prototipos de asistentes conversacionales sin depender de APIs externas, lo que resulta útil en entornos con recursos limitados o requisitos de privacidad.
- **Experimentos educativos con GPT-2**: Su arquitectura GPT-2 estándar, con 12 capas y 12 cabezas de atención, permite analizar el comportamiento de transformers causales y la influencia de técnicas de enmascarado de pérdida en el entrenamiento de chatbots.
- **Fine-tuning de dominio**: Gracias a su formato de turnos y su base GPT-2, puede ajustarse finamente para dominios específicos con un coste computacional bajo, por ejemplo para un asistente de preguntas frecuentes en ruso.
- **Asistente para entornos aislados**: Aplicaciones de chat en dispositivos sin conexión, redes restringidas o despliegues en local, donde el acceso a modelos alojados no es viable o está prohibido.
- **Generación de diálogos sintéticos**: Su capacidad para producir respuestas coherentes en formato de turnos puede aprovecharse en pipelines de generación de datos para entrenar otros modelos de conversación.
- **Benchmark de comparación**: Sirve como referencia para comparar arquitecturas pequeñas de conversación en ruso e inglés frente a modelos como GPT-2 small, ruGPT-3 small o DialoGPT small.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index de HuggingFace declara una lista vacía de resultados, por lo que no existen métricas oficiales (MMLU, HumanEval, GSM8K, etc.) para ResonateX D3. Cualquier evaluación de rendimiento requeriría una validación independiente.

## Requisitos de hardware

- **VRAM estimada para inferencia**: En fp32, los pesos ocupan aproximadamente 497 MB, coherente con el tamaño del repositorio de 0,5 GB. Incluyendo tokenizador y buffers de atención, la VRAM total estimada para inferencia es de 1–2 GB. No se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: Cualquier GPU con 2 GB o más de VRAM es suficiente, incluidas las de gama de consumo como RTX 3060 o RTX 4060. También es compatible con Apple Silicon (vía MPS).
- **Compatibilidad con GPU de consumo**: Sí, el modelo cabe completamente en la mayoría de GPUs de consumo de gama media o alta.
- **CPU**: La inferencia en CPU es viable para prototipos y aplicaciones educativas, aunque la latencia será mayor que en GPU.
- **Opciones de despliegue**: Soporte directo mediante transformers en Python. Los tags de HuggingFace indican compatibilidad con `text-generation-inference`. No se ha confirmado soporte para vLLM, llama.cpp u Ollama.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conversacional | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ResonateX D3 | 124.442.112 | 1.024 | Sí (tokens de rol) | other (update-before-publishing) | HuggingFace |
| GPT-2 small | ~124 M | 1.024 | No (texto plano) | MIT | HuggingFace |
| ruGPT-3 small | ~124 M | 1.024 | No (texto plano) | no disponible | HuggingFace |
| DialoGPT small | ~117 M | 1.024 | Sí (turnos) | MIT | HuggingFace |

ResonateX D3 reutiliza el tokenizador de ruGPT-3 small, pero sus pesos fueron entrenados desde cero, no inicializados desde ese checkpoint.

## Limitaciones y advertencias

- El modelo tiene un conocimiento del mundo limitado y capacidades de razonamiento reducidas debido a su tamaño (~124 M de parámetros). Las respuestas pueden ser cortas, genéricas, repetitivas o fácticamente incorrectas.
- La ventana de contexto de 1.024 tokens provoca el truncamiento de los turnos anteriores en conversaciones largas.
- La composición exacta de los datos de entrenamiento no está documentada, lo que impide evaluar sesgos, errores fácticos o contenido inapropiado.
- No se ha realizado ninguna evaluación dedicada de sesgos ni de seguridad.
- El modelo no incorpora filtrado de seguridad; cualquier aplicación debe implementar su propia moderación.
- La generación debe detenerse en el token `<|endofturn|>`. Si se usa una pipeline genérica sin configurar `eos_token_id` para incluir ese token, el modelo puede seguir generando texto más allá de la respuesta esperada.
- La licencia `update-before-publishing` es atípica y el propio autor indica que debe actualizarse antes de publicar. Debe verificarse antes de cualquier uso comercial, así como las licencias de los datasets de entrenamiento subyacentes.
- El formato de prompt es estricto: usar otro formato (por ejemplo, el estilo "Вопрос: ... Ответ:" de ResonateX D1) reducirá significativamente la calidad de las respuestas.
- No es apto para producción sin modificaciones sustanciales, especialmente en casos que requieran precisión fáctica, garantías de seguridad o moderación de contenido.
- No está indicado para decisiones de alto riesgo (médicas, legales, financieras) ni para razonamiento aritmético o lógico fiable más allá de ejemplos sintéticos simples.

## Enlaces

- HuggingFace: https://huggingface.co/Workstation5495/Resonatex-D3
- GitHub (ResonateAI): https://github.com/Workstation5495/ResonateAI
- Tokenizador base: https://huggingface.co/ai-forever/rugpt3small_based_on_gpt2
