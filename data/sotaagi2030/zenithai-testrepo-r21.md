# SOTAagi2030/ZenithAI-TestRepo-r21

## Resumen
ZenithAI es un modelo de lenguaje presentado por el usuario SOTAagi2030, descrito como un sistema de razonamiento general que ha recibido una actualización significativa en su versión actual (r21). Según la model card, el modelo ha mejorado su profundidad de razonamiento y capacidad de inferencia mediante un aumento de recursos computacionales y la introducción de mecanismos de optimización algorítmica durante el post-entrenamiento. Se destaca su rendimiento en matemáticas, programación y lógica, acercándose a otros modelos líderes. Sin embargo, el repositorio en Hugging Face es un "test repo" sin archivos publicados (tamaño 0 GB), por lo que no es posible descargar ni ejecutar el modelo directamente desde esta página. La licencia declarada es MIT, pero no se ofrecen detalles sobre arquitectura, número de parámetros ni contexto. La model card incluye una tabla de benchmarks comparativos con otros modelos no identificados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (la card no los especifica) |
| Licencia | MIT |
| Formato de pesos | No publicado (el repositorio no contiene archivos) |

## Arquitectura y entrenamiento

No se ha publicado información detallada sobre la arquitectura del modelo (si es transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento (número de tokens, composición del dataset, técnicas como RLHF o DPO). La model card menciona que la versión actual ha mejorado su profundidad de razonamiento gracias a "mecanismos de optimización algorítmica durante el post-training" y a un mayor uso de cómputo. También indica que el modelo promedia 23 000 tokens por pregunta en el test AIME 2025 (frente a 12 000 en la versión anterior), lo que sugiere un modo de razonamiento extendido o un "thinking mode" interno. No se especifica si se utilizó RLHF, DPO o algún otro método de alineación.

## Capacidades

Según la model card, el modelo presenta un rendimiento notable en las siguientes áreas:

- Razonamiento matemático y lógico, con mejora en el test AIME 2025 (precisión del 87,5 % frente al 70 % de la versión anterior).
- Generación de código, con soporte para function calling (aunque no se dan detalles de implementación).
- Comprensión lectora, respuesta a preguntas, clasificación de texto y análisis de sentimiento.
- Generación de diálogos, resumen, traducción y escritura creativa.
- Recuperación de conocimiento, seguimiento de instrucciones y evaluación de seguridad.
- Soporte de system prompt y plantillas específicas para subida de archivos y búsqueda web (se recomienda incluir la fecha actual en el system prompt).
- No requiere tokens especiales al inicio de la salida para forzar un patrón de pensamiento.

## Casos de uso

- Asistente de razonamiento matemático: el modelo puede resolver problemas complejos de matemáticas y lógica, útil en entornos educativos o de investigación, gracias a su alto rendimiento en AIME 2025 y su capacidad de razonamiento profundo.
- Generación y revisión de código: su soporte para function calling y su rendimiento en generación de código permiten integrarlo en pipelines de desarrollo, como revisión de PR o generación de tests.
- Análisis de documentos y extracción de conocimiento: mediante la plantilla de subida de archivos, el modelo puede procesar contenido de ficheros y responder preguntas específicas, útil en tareas de análisis de informes o documentación técnica.
- Atención al cliente automatizada: su capacidad de diálogo y seguimiento de instrucciones permite gestionar conversaciones multi-turno, aunque no se especifica la longitud máxima de contexto.
- Traducción y localización: el modelo muestra un rendimiento de 0,794 en la categoría de traducción, por lo que puede servir como base para sistemas de traducción automática o subtitulación.
- Investigación y recuperación de información: su capacidad de recuperación de conocimiento (0,662) puede ser útil para sistemas de pregunta-respuesta sobre bases documentales, siempre que se combine con un buscador externo.

## Benchmarks y rendimiento

La model card incluye una tabla de resultados comparativos con tres modelos no identificados (Model1, Model2, Model1-v2). Los datos son proporcionados por el autor y no se han verificado de forma independiente. Se presentan tal como aparecen en la documentación:

| Categoría | Benchmark | Model1 | Model2 | Model1-v2 | ZenithAI |
|---|---|---|---|---|---|
| Razonamiento | Matemáticas | 0,510 | 0,535 | 0,521 | 0,521 |
| Razonamiento | Lógica | 0,789 | 0,801 | 0,810 | 0,771 |
| Razonamiento | Sentido común | 0,716 | 0,702 | 0,725 | 0,716 |
| Comprensión | Lectura | 0,671 | 0,685 | 0,690 | 0,676 |
| Comprensión | Pregunta-respuesta | 0,582 | 0,599 | 0,601 | 0,592 |
| Comprensión | Clasificación de texto | 0,803 | 0,811 | 0,820 | 0,809 |
| Comprensión | Análisis de sentimiento | 0,777 | 0,781 | 0,790 | 0,780 |
| Generación | Código | 0,615 | 0,631 | 0,640 | 0,618 |
| Generación | Escritura creativa | 0,588 | 0,579 | 0,601 | 0,576 |
| Generación | Diálogo | 0,621 | 0,635 | 0,639 | 0,623 |
| Generación | Resumen | 0,745 | 0,755 | 0,760 | 0,749 |
| Especiales | Traducción | 0,782 | 0,799 | 0,801 | 0,794 |
| Especiales | Recuperación de conocimiento | 0,651 | 0,668 | 0,670 | 0,662 |
| Especiales | Seguimiento de instrucciones | 0,733 | 0,749 | 0,751 | 0,740 |
| Especiales | Evaluación de seguridad | 0,718 | 0,701 | 0,725 | 0,725 |

Además, el autor afirma que en el test AIME 2025 el modelo alcanza una precisión del 87,5 % (frente al 70 % de la versión anterior), con un promedio de 23 000 tokens por pregunta. No se aportan resultados en benchmarks estándar como MMLU, GSM8K o HumanEval.

## Requisitos de hardware

No se ha publicado información sobre requisitos de hardware, VRAM, GPU recomendadas, opciones de despliegue ni rendimiento de latencia. Dado que el repositorio no contiene archivos de pesos, no es posible ejecutar el modelo actualmente. Se recomienda consultar la documentación del autor si se publica una versión con los pesos.

## Comparativa con modelos similares

No se han identificado modelos comparables específicos en la información disponible. La tabla de benchmarks menciona tres modelos (Model1, Model2, Model1-v2) pero no se indica qué arquitectura o tamaño tienen. No se puede establecer una comparativa válida con alternativas conocidas como Llama, Mistral o DeepSeek sin datos adicionales.

## Limitaciones y advertencias

- El repositorio en Hugging Face es un "test repo" sin archivos de pesos (tamaño 0 GB), por lo que el modelo no se puede descargar ni utilizar en la práctica.
- No se han publicado detalles sobre la arquitectura, el tamaño, el contexto ni el conjunto de datos de entrenamiento, lo que impide una evaluación técnica rigurosa.
- La tabla de benchmarks carece de identificación de los modelos comparados, lo que dificulta la interpretación de los resultados.
- La model card menciona una reducción de la tasa de alucinación, pero no se ofrecen métricas concretas ni una metodología de evaluación.
- No se especifican los idiomas soportados; la documentación está en inglés y los ejemplos de system prompt usan fechas en inglés, por lo que el soporte multilingüe no está confirmado.
- La licencia MIT permite uso comercial, pero al no haber pesos publicados, la licencia es únicamente aplicable al código y a la documentación, no a un modelo ejecutable.
- Se recomienda precaución antes de desplegar el modelo en producción, ya que no hay evidencia de su rendimiento en entornos reales ni de su seguridad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/SOTAagi2030/ZenithAI-TestRepo-r21
- Perfil del autor: https://huggingface.co/SOTAagi2030
- Página web oficial de ZenithAI (si es la misma entidad, no confirmada): https://www.zenithai.ai/
