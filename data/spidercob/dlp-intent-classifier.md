# spidercob/dlp-intent-classifier

## Resumen

El modelo `spidercob/dlp-intent-classifier` es un clasificador de texto basado en la técnica SetFit, desarrollado por SpiderCob, una plataforma empresarial de prevención de pérdida de datos (DLP). Su función principal es distinguir entre hallazgos reales de datos sensibles y falsos positivos generados por reglas regex en escáneres de DLP. El modelo clasifica cada coincidencia en una de cuatro categorías: `REAL_DATA`, `TEST_DATA`, `DOCUMENTATION` o `NOISE`, lo que permite filtrar automáticamente los resultados de los escáneres y reducir el ruido en los flujos de seguridad.

El modelo utiliza la arquitectura SetFit, que combina un Sentence Transformer de tipo BERT (con 22,7 millones de parámetros) con una cabeza de clasificación basada en regresión logística. Se entrena mediante aprendizaje contrastivo en un esquema few-shot, lo que permite obtener buenos resultados con muy pocos ejemplos etiquetados. La longitud máxima de secuencia es de 256 tokens, suficiente para analizar fragmentos de código, logs o mensajes típicos en entornos de DLP.

La relevancia actual de este modelo radica en la creciente necesidad de automatizar la detección de fugas de información en pipelines de CI/CD y repositorios de código. Al clasificar la intención de los hallazgos regex, reduce la carga de trabajo de los equipos de seguridad y mejora la precisión de las herramientas de escaneo sin necesidad de grandes infraestructuras de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit (Sentence Transformer + LogisticRegression) |
| Parametros totales | 22.713.216 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SetFit, descrita en el paper "Efficient Few-Shot Learning Without Prompts" (arXiv:2209.11055). Consiste en dos etapas: primero se ajusta un Sentence Transformer (basado en BERT) mediante aprendizaje contrastivo, y después se entrena una cabeza de clasificación con una regresión logística sobre las representaciones generadas por el transformer. Este enfoque permite lograr un rendimiento competitivo con pocos ejemplos etiquetados, sin necesidad de prompts ni de modelos de lenguaje de gran tamaño.

Los detalles del dataset de entrenamiento no están disponibles en la información proporcionada. Se sabe que el modelo fue entrenado con la librería SetFit versión 1.1.3, Sentence Transformers 5.6.1 y PyTorch 2.10.0, pero no se especifican el número de ejemplos, la composición de los datos ni si se aplicaron técnicas adicionales como RLHF o DPO. La técnica de entrenamiento es intrínsecamente few-shot, lo que sugiere que se utilizó un conjunto reducido de muestras etiquetadas para las cuatro clases.

## Capacidades

- Clasificación de texto en cuatro clases: `REAL_DATA` (datos reales sensibles), `TEST_DATA` (datos de prueba), `DOCUMENTATION` (documentación) y `NOISE` (ruido).
- Detección de intención en hallazgos de regex DLP, distinguiendo entre coincidencias que representan PII, secretos o credenciales reales y aquellas que son falsos positivos.
- Procesamiento de secuencias de hasta 256 tokens, adecuado para fragmentos de código, líneas de log o mensajes cortos.
- Inferencia rápida y ligera gracias a su tamaño reducido (22,7 M de parámetros), lo que permite ejecutarlo en CPU o en GPUs de baja gama.
- Integración nativa con la librería SetFit y con el ecosistema Hugging Face (pipelines de text-classification).
- Compatible con Text Embeddings Inference y endpoints de Hugging Face para despliegue en producción.

## Casos de uso

- Filtrado de alertas en escáneres de secretos: el modelo se puede integrar en herramientas como TruffleHog o Gitleaks para clasificar cada coincidencia regex y descartar automáticamente las que corresponden a datos de prueba o documentación, reduciendo el número de alertas que deben revisar los equipos de seguridad.
- Prevención de fugas de datos en repositorios de código: al analizar los resultados de un escaneo de DLP en un pipeline de CI/CD, el modelo identifica si un fragmento contiene datos reales (por ejemplo, una API key de producción) o si es un ejemplo ficticio, permitiendo bloquear el commit o la publicación solo cuando hay riesgo real.
- Auditoría de logs y trazas de aplicación: el clasificador puede procesar líneas de log que contengan posibles PII (correos, números de tarjeta, DNI) y determinar si son datos reales de usuario o entradas de depuración, facilitando la detección de fugas en entornos de producción.
- Clasificación de hallazgos en bases de datos de incidentes: cuando un sistema DLP genera un listado de coincidencias, el modelo puede etiquetar cada una como dato real, dato de prueba, documentación o ruido, permitiendo priorizar la investigación de los casos más críticos.
- Automatización de respuestas en plataformas de seguridad: el modelo se puede usar como un filtro previo en un sistema de ticketing para que solo los hallazgos clasificados como `REAL_DATA` generen tickets de incidente, evitando la saturación del equipo con falsos positivos.
- Enriquecimiento de pipelines de análisis de datos: en entornos donde se procesan grandes volúmenes de texto (por ejemplo, scraping o análisis de foros), el modelo puede identificar si un texto contiene datos sensibles reales o si es contenido sintético, ayudando a cumplir normativas de protección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que se utilizó la métrica de accuracy durante el entrenamiento, pero no se proporcionan valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 22,7 M de parámetros, la inferencia en FP32 requiere aproximadamente 90 MB de memoria. Con cuantización a int8 (si se aplicara) se reduciría a unos 23 MB, aunque no se han publicado pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. Modelos como NVIDIA T4, GTX 1650 o incluso CPUs modernas pueden ejecutar la inferencia sin problemas.
- Compatibilidad con hardware de consumo: sí, el modelo se puede ejecutar en una Raspberry Pi o en un portátil sin GPU gracias a su pequeño tamaño.
- Opciones de despliegue: se puede servir con la librería SetFit directamente, o mediante Hugging Face Inference Endpoints, Text Embeddings Inference, o un contenedor Docker con FastAPI. También es compatible con el ecosistema de Hugging Face Spaces.
- Latencia y throughput: no se han publicado mediciones oficiales, pero por el tamaño del modelo se espera una latencia de pocos milisegundos por muestra en CPU y de menos de 1 ms en GPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (clasificación de intención DLP). Existen otros clasificadores de texto basados en SetFit para tareas genéricas, pero no hay datos públicos que permitan una comparación rigurosa con este modelo específico. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con pocos ejemplos (few-shot), puede presentar sesgos derivados del conjunto de datos de entrenamiento, que no está documentado. Es posible que no generalice bien a dominios o formatos de datos muy diferentes a los vistos durante el entrenamiento.
- Riesgo de alucinación: aunque es un clasificador y no un generador de texto, puede asignar etiquetas incorrectas a entradas ambiguas o fuera de distribución, lo que podría llevar a clasificar datos reales como ruido o viceversa.
- Limitaciones de contexto: la longitud máxima de 256 tokens puede ser insuficiente para analizar fragmentos de código extensos o logs multilínea, lo que obliga a truncar o dividir el texto antes de la clasificación.
- Limitaciones de idioma: no se especifican los idiomas soportados. Si el modelo fue entrenado principalmente con texto en inglés, su rendimiento en otros idiomas puede ser deficiente.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial sin una revisión legal previa.
- Caveat para producción: al ser un modelo pequeño y entrenado con pocos datos, se recomienda validar su rendimiento con un conjunto de datos propio antes de desplegarlo en entornos críticos de seguridad. Además, la ausencia de benchmarks públicos dificulta la evaluación objetiva de su precisión.

## Enlaces

- [Hugging Face - spidercob/dlp-intent-classifier](https://huggingface.co/spidercob/dlp-intent-classifier)
- [GitHub - SpiderCob/dlp-intent-classifier](https://github.com/SpiderCob/dlp-intent-classifier)
- [Hugging Face Space - SpiderCob DLP Demo](https://huggingface.co/spaces/spidercob/spidercob-dlp-demo)
- [Sitio web de SpiderCob](https://spidercob.com/)
- [Paper SetFit - Efficient Few-Shot Learning Without Prompts](https://arxiv.org/abs/2209.11055)
- [Blog de Hugging Face sobre SetFit](https://huggingface.co/blog/setfit)
