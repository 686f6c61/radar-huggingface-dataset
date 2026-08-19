# vinmlops/finbot-qwen3-1.7b-gguf

## Resumen

El modelo `vinmlops/finbot-qwen3-1.7b-gguf` es una versión cuantizada en formato GGUF (q8_0) de un fine-tune QLoRA del modelo base `Qwen/Qwen3-1.7B`, desarrollado por el usuario `vinmlops`. El objetivo es proporcionar explicaciones educativas sobre conceptos financieros generales (IRAs, ETFs, interés compuesto, diversificación, etc.) sin ofrecer asesoramiento personalizado ni predicciones de mercado. El modelo está diseñado con un mecanismo de "honestidad" que rechaza responder a preguntas sobre precios futuros, garantías de retorno o consejos financieros individuales.

Esta versión GGUF está pensada para inferencia eficiente en CPU mediante llama.cpp, con un tamaño de archivo de aproximadamente 1,8 GB. Se trata de una versión v1 baseline que prioriza un pipeline MLOps completo y observable sobre la precisión máxima del modelo; la calidad de las respuestas es aceptable para demostraciones educativas pero no para producción. El modelo está liberado bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3-1.7B) |
| Parametros totales | 1.720.574.976 (~1,72B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificado en la documentación) |
| Tipos de cuantizacion | q8_0 (GGUF) |
| Idiomas soportados | No disponible (no especificado; el modelo base Qwen3 soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors para el modelo base sin cuantizar) |

## Arquitectura y entrenamiento

El modelo es un fine-tune QLoRA del modelo Qwen3-1.7B, que emplea una arquitectura transformer decoder-only con atención causal estándar. El fine-tune se realizó sobre el dataset `finance-alpaca`, compuesto mayoritariamente por contenido de foros públicos de finanzas, con un enfoque conversacional y calidad factual desigual. El entrenamiento utilizó QLoRA (Quantized Low-Rank Adaptation) para eficiencia en recursos, y posteriormente se fusionaron los adaptadores con el modelo base. No se menciona el uso de RLHF ni DPO; el proceso se describe como supervised fine-tuning (SFT). La cuantización a q8_0 se aplicó después del merge para obtener el artefacto GGUF final, optimizado para inferencia en CPU con llama.cpp.

## Capacidades

- Generación de texto en formato conversacional para explicar conceptos financieros generales (IRAs, ETFs, interés compuesto, diversificación, etc.).
- Guardrails de honestidad: rechaza responder a preguntas sobre predicción de precios, garantías de retorno o consejos financieros personalizados.
- Respuestas coherentes en temas educativos de finanzas, aunque con tendencia a ser verboso y con posibles imprecisiones en detalles factuales.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Educación financiera básica: el modelo puede explicar conceptos como qué es un ETF, cómo funciona el interés compuesto o qué es una IRA, en un formato conversacional accesible para principiantes.
- Asistente de estudio para estudiantes de finanzas: responde preguntas frecuentes sobre productos financieros y principios de inversión, sirviendo como material de repaso complementario.
- Chatbot de demostración en entornos educativos: integrable en aplicaciones web o de escritorio para ilustrar el uso de LLMs en dominios específicos, gracias a su tamaño reducido y compatibilidad con CPU.
- Pruebas de pipeline MLOps: el modelo sirve como artefacto de referencia para validar flujos de fine-tuning, cuantización, despliegue y monitorización en clústeres, tal como se describe en la documentación del autor.
- Generación de contenido educativo para blogs o materiales didácticos: puede redactar explicaciones introductorias sobre temas financieros, aunque requiere revisión humana por sus posibles imprecisiones.
- Experimentación con cuantización GGUF: útil para desarrolladores que quieran evaluar el rendimiento de modelos cuantizados en hardware de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la calidad es "media/aceptable para una demo educativa, pero no de producción", sin cifras concretas de métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF q8_0 ocupa ~1,8 GB, por lo que se necesitan aproximadamente 2-3 GB de RAM/VRAM considerando overhead de ejecución.
- GPU recomendadas: cualquier GPU con al menos 3 GB de VRAM (por ejemplo, NVIDIA GTX 1060 6GB, RTX 3050, etc.) puede ejecutar el modelo; también funciona en CPU con 4 GB de RAM libre.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp (CLI o servidor), Ollama (si se convierte a formato compatible), y cualquier framework que soporte GGUF (llama-cpp-python, etc.).
- Latencia y throughput: no se proporcionan datos oficiales; en CPU moderna se espera una generación de unos 10-20 tokens/segundo con q8_0, dependiendo del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| finbot-qwen3-1.7b-gguf (este) | 1,72B | No disponible | Apache 2.0 | Educación financiera, GGUF q8_0 |
| Qwen/Qwen3-1.7B (base) | 1,72B | 32K (dato público) | Apache 2.0 | Modelo generalista, sin fine-tune |
| vinmlops/finbot-qwen3-1.7b-baseline | 1,72B | No disponible | Apache 2.0 | Fine-tune QLoRA en safetensors, sin cuantizar |

La comparativa se limita al propio modelo base y su versión sin cuantizar, ya que no se dispone de información sobre otros modelos específicos de finanzas de tamaño similar. El contexto del modelo base es de 32K según la documentación pública de Qwen, pero no se confirma en la model card del fine-tune.

## Limitaciones y advertencias

- Sesgos y calidad de datos: el dataset `finance-alpaca` proviene de foros públicos, con estilo conversacional y calidad factual desigual; el modelo hereda estas limitaciones y puede producir respuestas verbosas o imprecisas en detalles concretos.
- Riesgo de alucinación: no se garantiza la exactitud de los datos financieros; el modelo puede generar afirmaciones incorrectas sobre cifras o regulaciones.
- No es un asesor financiero: está entrenado para rechazar consejos personalizados, predicciones de precios o garantías de retorno, pero los usuarios podrían malinterpretar sus respuestas como asesoramiento profesional.
- Limitaciones de idioma: no se especifican los idiomas soportados; el modelo base Qwen3 es multilingüe, pero el fine-tune se realizó probablemente con datos mayoritariamente en inglés, por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de uso comercial: la licencia Apache 2.0 permite uso comercial, pero la calidad no es producción-grade, por lo que se recomienda validación humana antes de cualquier despliegue público.
- Contexto no especificado: no se documenta la longitud de contexto efectiva tras el fine-tune, lo que puede afectar a tareas que requieran ventanas largas.

## Enlaces

- [HuggingFace - finbot-qwen3-1.7b-gguf](https://huggingface.co/vinmlops/finbot-qwen3-1.7b-gguf)
- [HuggingFace - modelo base sin cuantizar](https://huggingface.co/vinmlops/finbot-qwen3-1.7b-baseline)
- [HuggingFace - Qwen/Qwen3-1.7B (modelo original)](https://huggingface.co/Qwen/Qwen3-1.7B)
