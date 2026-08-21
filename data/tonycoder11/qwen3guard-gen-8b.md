# Tonycoder11/Qwen3Guard-Gen-8B

## Resumen

Qwen3Guard-Gen-8B es un modelo de moderación de seguridad (guardrail) desarrollado por Alibaba Cloud dentro de la familia Qwen3Guard, cuyo objetivo es clasificar prompts y respuestas de modelos de lenguaje en tres niveles de severidad: seguro, controvertido y no seguro. Se basa en Qwen3-8B, un transformer decoder-only denso de 8.000 millones de parámetros, y se ha entrenado sobre un conjunto de datos de 1,19 millones de pares de prompt-respuesta etiquetados para seguridad. La variante presentada en este repositorio, Qwen3Guard-Gen, enmarca la clasificación como una tarea de seguimiento de instrucciones: el modelo genera texto estructurado con la etiqueta de seguridad, las categorías de riesgo y, en el caso de moderar respuestas, una indicación de si el modelo original se negó a contestar. Soporta 119 idiomas y dialectos, lo que lo convierte en una opción relevante para despliegues multilingües. El repositorio que nos ocupa, `Tonycoder11/Qwen3Guard-Gen-8B`, es un espejo (mirror) del modelo oficial publicado por Qwen en Hugging Face, con la misma licencia Apache-2.0 y el mismo contenido de pesos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base: Qwen3-8B) |
| Parametros totales | 8.190.735.360 (8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible (se pueden generar cuantizaciones GPTQ, AWQ o GGUF a partir de los pesos originales) |
| Idiomas soportados | 119 idiomas y dialectos |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Qwen3Guard-Gen-8B parte de la arquitectura de Qwen3-8B, un transformer decoder-only con atención completa, sin mezcla de expertos. El entrenamiento de la familia Qwen3Guard se realizó sobre un dataset propio de 1,19 millones de prompts y respuestas etiquetadas manualmente para seguridad, cubriendo múltiples categorías de riesgo y niveles de severidad. La variante Gen utiliza un enfoque de instrucción: dado un prompt (o un par prompt-respuesta), el modelo genera un texto de salida con el formato `Safety: Safe|Unsafe|Controversial`, las categorías de riesgo aplicables (Violent, Non-violent Illegal Acts, Sexual Content, PII, Suicide & Self-Harm, Unethical Acts, Politically Sensitive Topics, Copyright Violation, Jailbreak, None) y, en el caso de moderar respuestas, un campo `Refusal: Yes|No` que indica si el modelo original se negó a responder. No se han publicado detalles sobre el uso de técnicas de RLHF o DPO en el informe técnico disponible; el documento técnico (arXiv:2510.14276) describe la metodología de evaluación, pero no la fase de alineación. La innovación principal reside en la clasificación de severidad en tres niveles y el soporte multilingüe de amplio espectro.

## Capacidades

- Generación de texto de moderación: produce etiquetas de seguridad estructuradas en texto plano.
- Clasificación de prompts y respuestas: distingue entre entrada de usuario y salida de modelo, aplicando categorías específicas a cada caso.
- Niveles de severidad: Safe, Controversial y Unsafe, lo que permite ajustar el umbral de bloqueo según el contexto de despliegue.
- Categorías de riesgo: cubre violencia, actos ilegales no violentos, contenido sexual, PII, suicidio y autolesión, actos no éticos, temas políticamente sensibles, violación de copyright y jailbreak.
- Detección de negativa (refusal): en la moderación de respuestas, indica si el modelo original se ha negado a responder.
- Soporte multilingüe: 119 idiomas y dialectos, adecuado para aplicaciones globales.
- Integración con APIs compatibles con OpenAI: despliegue sencillo mediante SGLang o vLLM para servir endpoints estándar.

## Casos de uso

- Moderación de contenido en chatbots de atención al cliente: el modelo puede clasificar las preguntas de los usuarios y las respuestas del agente de IA antes de mostrarlas, bloqueando contenido violento, sexual o con PII en tiempo real. Su soporte multilingüe permite desplegarlo en equipos de soporte internacionales sin necesidad de modelos separados por idioma.
- Guardrail en asistentes de programación: antes de devolver fragmentos de código a un IDE, se puede filtrar la respuesta para evitar la generación de exploits, malware o instrucciones de ciberataques, usando la categoría Violent o Non-violent Illegal Acts.
- Moderación de contenido generado por usuarios en plataformas UGC: el modelo puede analizar los textos que los usuarios suben a foros, comentarios o redes sociales, clasificando discurso de odio, acoso o información personal no consentida.
- Cumplimiento normativo en entornos corporativos: empresas que necesitan auditar las respuestas de sus sistemas de IA para cumplir con regulaciones de contenido (como la Ley de Servicios Digitales europea) pueden registrar los resultados de clasificación para generar reportes de seguridad.
- Filtrado de contenido en educación y e-learning: plataformas educativas que despliegan tutores de IA pueden usar el modelo para bloquear respuestas que contengan contenido inapropiado para menores, como violencia o contenido sexual.
- Monitorización de sistemas de generación de contenido publicitario: en campañas de marketing, el modelo puede revisar automáticamente los textos generados por IA para evitar infracciones de copyright o contenido políticamente sensible, reduciendo el riesgo reputacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible. El informe técnico de Qwen3Guard (arXiv:2510.14276) menciona una evaluación exhaustiva en benchmarks de seguridad en inglés, chino y multilingües, y afirma que el modelo alcanza resultados de vanguardia (state-of-the-art) en clasificación de prompts y respuestas, pero los valores numéricos no están presentes en los materiales consultados. Por tanto, no se proporcionan cifras concretas en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en fp16, el modelo ocupa aproximadamente 16,4 GB (según el tamaño del repositorio). Con cuantización 8-bit, el consumo baja a unos 8-9 GB; con 4-bit, a unos 5-6 GB.
- GPU recomendadas: una sola GPU con al menos 24 GB de VRAM es suficiente para fp16 (p. ej., RTX 4090, A100 40 GB, H100). Para cuantización 4-bit, puede ejecutarse en GPUs de 8-12 GB (p. ej., RTX 3070, RTX 4060 Ti).
- Compatibilidad con hardware de consumo: sí, en cuantización 4-bit o 8-bit puede desplegarse en GPU de consumo modernas (RTX 30xx y superiores).
- Opciones de despliegue: SGLang (>=0.4.6.post1), vLLM (>=0.9.0), Transformers (>=4.51.0), y herramientas como llama.cpp o Ollama si se generan pesos GGUF.
- Latencia y throughput: no disponible. Al ser un modelo de 8B, la latencia será moderada; se recomienda usar vLLM o SGLang para producción con concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| Qwen3Guard-Gen-8B | 8B | 32.768 | 119 | Apache-2.0 | Generativo (texto) |
| Qwen3Guard-Gen-4B | 4B | 32.768 | 119 | Apache-2.0 | Generativo (texto) |
| Qwen3Guard-Gen-0.6B | 0.6B | 32.768 | 119 | Apache-2.0 | Generativo (texto) |
| Llama Guard 3 | 8B | 131.072 | 8 | Llama 3 Community License | Generativo (texto) |
| OpenAI Moderation API | no público | no aplica | multilingüe | propietario | API cerrada |

La comparativa directa con Llama Guard 3 es pertinente: ambos son modelos de moderación de 8B, pero Qwen3Guard-Gen-8B ofrece un rango de idiomas mucho más amplio (119 frente a 8) y una licencia Apache-2.0 más permisiva que la de Llama Guard (que incluye restricciones de uso comercial). La ventaja de OpenAI es su integración en la plataforma, pero carece de despliegue local. No se dispone de datos comparativos de rendimiento numérico.

## Limitaciones y advertencias

- Sesgos en la clasificación: como modelo entrenado sobre un dataset anotado, puede presentar sesgos hacia ciertas culturas, idiomas o contextos, especialmente en las categorías de contenido político y sexual.
- Riesgo de alucinación en la etiqueta: aunque la tarea es generativa, el modelo puede generar una clasificación incorrecta o una categoría que no se ajusta al contenido, lo que en producción podría provocar falsos positivos o negativos.
- Limitación de contexto: la ventana de 32.768 tokens es suficiente para prompts y respuestas individuales, pero no para analizar conversaciones largas completas de una vez; se recomienda moderar por turnos.
- Dependencia del idioma: aunque soporta 119 idiomas, la calidad de la clasificación puede variar según el idioma; los idiomas con menos datos de entrenamiento podrían tener una precisión menor.
- Restricciones de uso comercial: la licencia Apache-2.0 permite uso comercial sin restricciones de atribución, pero no incluye garantías de seguridad; el usuario es responsable de evaluar su comportamiento en su dominio de aplicación.
- El repositorio `Tonycoder11/Qwen3Guard-Gen-8B` es un mirror del modelo oficial de Qwen; se recomienda verificar la integridad de los archivos y usar la versión oficial en despliegues críticos.

## Enlaces

- Repositorio oficial en Hugging Face: https://huggingface.co/Qwen/Qwen3Guard-Gen-8B
- Repositorio espejo (este): https://huggingface.co/Tonycoder11/Qwen3Guard-Gen-8B
- GitHub del proyecto Qwen3Guard: https://github.com/QwenLM/Qwen3Guard
- Informe técnico (arXiv): https://arxiv.org/html/2510.14276v1
- Blog de presentación: https://qwen.ai/blog?id=f0bbad0677edf58ba93d80a1e12ce458f7a80548&from=research.research-list
- Recetas de despliegue con vLLM: https://recipes.vllm.ai/Qwen/Qwen3Guard-Gen-8B
