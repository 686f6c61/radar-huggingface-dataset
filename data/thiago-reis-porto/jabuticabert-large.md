# Thiago-Reis-Porto/JabuticaBERT-Large

## Resumen

JabuticaBERT-Large es un modelo de lenguaje tipo encoder basado en la arquitectura DeBERTa-v2, entrenado desde cero específicamente para el portugués. Ha sido desarrollado por Thiago Porto y colaboradores, vinculados a AMADEUS AI, y presentado en la 17.ª Conferencia Internacional sobre Procesamiento Computacional del Portugués (PROPOR 2026). El modelo aborda la escasez de encoders modernos y de alta calidad para portugués, incorporando dos innovaciones principales: el entrenamiento con Replaced Token Detection (RTD) y el entrenamiento de contexto largo.

Con 434 millones de parámetros, JabuticaBERT-Large se posiciona como un modelo de tamaño considerable dentro de la familia DeBERTa-v2. Según el paper, alcanza puntuaciones competitivas en tareas como ASSIN2 RTE, STS y ToldBR, y obtiene el mejor F1 en el corpus de NER LeNER entre las variantes JabuticaBERT. Su relevancia actual radica en ofrecer una alternativa entrenada desde cero para el portugués, sin depender de inicializaciones multilingües, y con capacidad para manejar contextos largos, algo poco común en encoders de este idioma.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa-v2 (encoder transformer con attention decoupled) |
| Parametros totales | 434.012.160 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el paper menciona entrenamiento de contexto largo, pero no se especifica el número de tokens) |
| Tipos de cuantizacion | No disponible (solo se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | Portugués (según el paper; no especificado en la ficha de HuggingFace) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

JabuticaBERT-Large sigue la arquitectura DeBERTa-v2, que introduce dos mecanismos clave: embeddings de contenido y posición desacoplados, y una atención que separa la información de contenido de la de posición. Esta arquitectura ha demostrado mejoras significativas en tareas de comprensión del lenguaje frente a BERT estándar. El modelo se entrena desde cero, sin partir de pesos preentrenados multilingües, lo que permite una adaptación más fiel a las particularidades del portugués.

El entrenamiento emplea Replaced Token Detection (RTD), una variante del enfoque de ELECTRA donde un generador propone tokens plausibles y el discriminador (el propio modelo) debe detectar cuáles han sido reemplazados. Además, se aplica un entrenamiento de contexto largo, aunque no se detallan los hiperparámetros ni la composición del corpus en la información disponible. No se menciona el uso de RLHF ni DPO, al tratarse de un encoder puro.

## Capacidades

- Extracción de características contextuales (feature extraction) para representar textos en vectores densos.
- Fine-tuning para tareas de clasificación de texto, análisis de sentimiento, detección de toxicidad y otras tareas supervisadas.
- Reconocimiento de entidades nombradas (NER), con resultados destacados en el corpus LeNER.
- Razonamiento de implicación textual (RTE) y similitud semántica (STS), evaluado en ASSIN2.
- Soporte de contextos largos gracias al entrenamiento específico, aunque no se especifica la longitud máxima.
- No dispone de capacidades de generación de texto, tool calling, agentes ni multimodalidad, al ser un encoder.

## Casos de uso

- Reconocimiento de entidades nombradas en portugués: el modelo puede afinarse sobre corpus como LeNER para extraer entidades de personas, organizaciones y lugares en textos legales o periodísticos, aprovechando su alto F1 reportado.
- Clasificación de documentos legales: su capacidad de contexto largo permite procesar párrafos extensos de contratos o sentencias para clasificarlos por tipo, riesgo o materia.
- Análisis de sentimiento en redes sociales: fine-tuning sobre datos de opinión en portugués para monitorizar la percepción de marcas o productos.
- Búsqueda semántica y recuperación de información: los embeddings generados pueden indexarse en bases vectoriales para sistemas de preguntas y respuestas o motores de búsqueda internos.
- Detección de discurso de odio o toxicidad: afinado con datasets etiquetados, puede integrarse en moderación de contenido en plataformas lusófonas.
- Sistemas de respuesta a preguntas sobre dominios específicos: combinado con un retriever, el encoder puede puntuar pasajes relevantes en corpus técnicos o académicos en portugués.

## Benchmarks y rendimiento

No se han publicado resultados detallados de benchmarks en la información disponible. El paper de PROPOR 2026 reporta que JabuticaBERT-Large obtiene puntuaciones competitivas en ASSIN2 RTE, STS y ToldBR, y alcanza el F1 más alto en LeNER entre las variantes JabuticaBERT, pero no se incluyen las cifras concretas en los materiales consultados. Se recomienda consultar el artículo original para acceder a las tablas completas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 434M de parámetros, en fp32 los pesos ocupan aproximadamente 1,7 GB (coincide con el tamaño del repositorio). En fp16 se reduciría a ~0,87 GB, y en cuantización de 8 bits a ~0,43 GB. La VRAM total necesaria dependerá del tamaño de lote y la longitud de secuencia, pero en fp16 con un lote pequeño podría caber en GPUs con 4 GB o menos.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 3060, RTX 4090) puede ejecutar el modelo en fp16. Para entrenamiento o fine-tuning, se recomienda al menos 8-12 GB.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Hugging Face Inference Endpoints, ONNX Runtime o mediante la librería transformers directamente. También es compatible con el ecosistema de Hugging Face (endpoints_compatible).
- Latencia y throughput: no se dispone de datos medidos. Para un encoder de 434M, la latencia típica en una GPU moderna es del orden de decenas de milisegundos por secuencia, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos comparativos detallados en la información proporcionada. Como referencia cualitativa, JabuticaBERT-Large compite con otros encoders del portugués como BERTimbau (base y large) y Albertina PT. Sin embargo, no se han encontrado tablas comparativas con estos modelos en los materiales consultados. Se recomienda revisar el paper para una comparación formal.

## Limitaciones y advertencias

- Sesgos: no se ha publicado información sobre sesgos o evaluación de equidad. Al entrenarse desde cero con datos no documentados, puede heredar sesgos presentes en el corpus.
- Alucinación: al ser un encoder, no genera texto libre, por lo que el riesgo de alucinación es bajo. No obstante, en tareas de clasificación puede producir predicciones erróneas si los datos de entrenamiento son sesgados.
- Limitaciones de contexto: aunque se menciona entrenamiento de contexto largo, no se especifica la longitud máxima soportada. Es necesario verificar este dato antes de usarlo con secuencias muy extensas.
- Restricciones de licencia: la licencia no está disponible, lo que supone un riesgo legal para uso comercial. Se debe contactar con el autor antes de desplegarlo en producción.
- Idiomas: el modelo está especializado en portugués; su rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- Documentación incompleta: la model card en HuggingFace está prácticamente vacía, lo que dificulta la reproducibilidad y la evaluación de riesgos.

## Enlaces

- HuggingFace (autor original): https://huggingface.co/Thiago-Reis-Porto/JabuticaBERT-Large
- HuggingFace (organización AMADEUS AI): https://huggingface.co/amadeusai/JabuticaBERT-Large
- Paper en ACL Anthology: https://aclanthology.org/2026.propor-1.93/
- PDF del paper: https://aclanthology.org/2026.propor-1.93.pdf
- Colección JabuticaBERT: https://huggingface.co/collections/amadeusai/jabuticabert
