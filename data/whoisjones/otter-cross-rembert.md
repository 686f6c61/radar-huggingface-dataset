# whoisjones/otter-cross-rembert

## Resumen

Otter es un reconocedor de entidades nombradas (NER) multilingüe de tipo abierto desarrollado por whoisjones. A diferencia de los sistemas NER tradicionales con un conjunto fijo de etiquetas, Otter recibe como entrada el texto y una lista de tipos de entidad en lenguaje natural (por ejemplo, `["person", "band", "chemical compound"]`) y devuelve los intervalos de caracteres correspondientes a las entidades de esos tipos, sin necesidad de ajuste fino. Esta variante concreta, `otter-cross-rembert`, emplea una arquitectura de cross-encoder basada en el encoder RemBERT de Google, con el vocabulario extendido con un token especial `[LABEL]`. El modelo tiene 578 millones de parámetros y una longitud máxima de secuencia de 512 tokens, con un límite de 30 tokens por entidad. Su licencia Apache 2.0 permite uso comercial sin restricciones.

La relevancia de este modelo radica en su capacidad zero-shot para extraer entidades de tipos arbitrarios en múltiples idiomas, lo que elimina la necesidad de etiquetar datos y entrenar modelos específicos para cada dominio. Al ser un cross-encoder, las etiquetas y el texto se procesan conjuntamente, lo que mejora la precisión frente a los bi-encoders, aunque a costa de re-encodificar el texto para cada conjunto de etiquetas. Está disponible en Hugging Face con pesos en formato safetensors y se integra fácilmente con la librería Transformers mediante `trust_remote_code`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (encoder RemBERT con token `[LABEL]` añadido) |
| Parametros totales | 578.188.928 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (solo pesos originales en safetensors) |
| Idiomas soportados | multilingüe (hereda las capacidades de RemBERT, que cubre 100+ idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de cross-encoder: las etiquetas de entidad se concatenan al texto de entrada en un prefijo con el formato `[LABEL] <tipo> [LABEL] <tipo> ... [SEP] <texto>`. De esta forma, un único encoder procesa simultáneamente etiquetas y texto, permitiendo que ambos se atiendan mutuamente. El encoder base es RemBERT, un modelo transformer multilingüe de Google con 578M parámetros, cuyo vocabulario se ha extendido con el token especial `[LABEL]`. La longitud máxima de secuencia es de 512 tokens y la longitud máxima de entidad es de 30 tokens.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. La model card indica que el umbral de predicción por defecto (0.5) se calibró optimizando la macro-F1 en una suite de evaluación, lo que sugiere un entrenamiento supervisado con datos multilingües anotados. El repositorio GitHub asociado contiene el pipeline completo de entrenamiento, la suite de evaluación y los scripts de preparación de datos, aunque no se especifican las cifras exactas.

## Capacidades

- Reconocimiento de entidades nombradas de tipo abierto: acepta cualquier tipo de entidad expresado en lenguaje natural, sin etiquetas predefinidas.
- Zero-shot: no requiere ajuste fino para nuevos dominios o tipos de entidad; basta con describir el tipo en el prompt.
- Multilingüe: al estar basado en RemBERT, soporta decenas de idiomas, como se muestra en el ejemplo con texto en alemán e inglés.
- Devolución de intervalos de caracteres: cada entidad devuelta incluye el texto extraído, la etiqueta, las posiciones de inicio y fin en la cadena original y una puntuación de confianza.
- Procesamiento por lotes: acepta listas de textos y devuelve una lista de entidades por entrada, con soporte para ejecución en GPU.
- Umbral ajustable: permite controlar el equilibrio entre precisión y recall mediante el parámetro `threshold`.
- Construcción de prompts: el método `build_prompt(labels)` genera el prefijo de etiquetas para construir entradas manualmente.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo puramente extractivo.

## Casos de uso

- Extracción de entidades en textos multilingües: dado un corpus de noticias en varios idiomas, el modelo puede identificar personas, organizaciones y lugares sin necesidad de entrenar un modelo por idioma. Por ejemplo, procesar artículos en alemán, inglés y español con la misma lista de etiquetas.
- Análisis de documentos legales: extraer tipos de entidad específicos como "cláusula", "parte contratante" o "fecha de vigencia" de contratos, describiendo cada tipo en lenguaje natural. El cross-encoder permite que el modelo entienda el contexto legal gracias a la atención conjunta entre etiquetas y texto.
- Enriquecimiento de grafos de conocimiento: identificar entidades de tipos personalizados (por ejemplo, "compuesto químico", "enfermedad", "medicamento") en artículos científicos o informes médicos, y alimentar bases de datos estructuradas con los intervalos extraídos.
- Búsqueda semántica de entidades: indexar documentos por las entidades que contienen, permitiendo consultas como "documentos que mencionan a una persona llamada X" o "artículos sobre organizaciones del sector tecnológico", usando etiquetas dinámicas según la consulta.
- Procesamiento de atención al cliente: extraer tipos de entidad como "producto", "número de pedido" o "motivo de reclamación" de conversaciones de soporte en varios idiomas, facilitando el enrutamiento automático de tickets.
- Análisis de redes sociales: identificar menciones de marcas, personas influyentes o ubicaciones en publicaciones de Twitter o Facebook, con etiquetas adaptadas al vocabulario informal de cada plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una calibración del umbral basada en macro-F1 sobre una suite de evaluación, pero no se proporcionan cifras concretas ni comparaciones con otros modelos. Se recomienda consultar el repositorio GitHub para posibles actualizaciones.

## Requisitos de hardware

- VRAM estimada: con 578M parámetros, el modelo en precisión fp32 ocupa aproximadamente 2,3 GB (coincide con el tamaño del repositorio). En fp16 ocuparía unos 1,2 GB. La inferencia puede ejecutarse en GPUs con 4 GB de VRAM o más.
- GPUs recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. Para procesamiento por lotes grande, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, etc.).
- Despliegue: al ser un modelo de Transformers, se puede cargar con `AutoModel` y `trust_remote_code=True`. Es compatible con las APIs estándar de Hugging Face. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que no es un modelo generativo sino un encoder para NER.
- Latencia y throughput: no se han publicado mediciones. Como cross-encoder, la latencia depende de la longitud del texto y del número de etiquetas; al re-encodificar el texto para cada conjunto de etiquetas, el throughput es menor que en un bi-encoder.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| otter-cross-rembert (este) | Cross-encoder (RemBERT) | 578M | 512 tokens | Apache 2.0 | Hugging Face |
| otter-bi-rembert | Bi-encoder (RemBERT) | 578M | 512 tokens | Apache 2.0 | Hugging Face |
| otter-cross-mmbert | Cross-encoder (mmBERT) | ~178M | 512 tokens | Apache 2.0 | Hugging Face |
| GLiNER (referencia) | Bi-encoder + span classifier | ~200M-500M | 512 tokens | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Otter y a GLiNER como alternativa popular de NER zero-shot. Los cross-encoders de Otter son más precisos que los bi-encoders, pero más lentos cuando se aplica un mismo conjunto de etiquetas a un corpus grande. GLiNER ofrece una arquitectura similar con soporte para tipos de entidad arbitrarios, aunque no se dispone de benchmarks comparativos publicados.

## Limitaciones y advertencias

- Longitud de contexto limitada a 512 tokens: textos más largos deben truncarse o dividirse, lo que puede perder entidades que crucen los límites de los fragmentos.
- Longitud máxima de entidad de 30 tokens: entidades más largas (por ejemplo, títulos de obras o nombres completos con muchos apellidos) podrían no detectarse correctamente.
- El umbral por defecto (0.5) está calibrado para una suite de evaluación general; en dominios específicos puede ser necesario recalibrarlo con datos propios para obtener un equilibrio adecuado entre precisión y recall.
- Al ser un cross-encoder, el coste computacional crece con el número de etiquetas: cada conjunto de etiquetas requiere re-encodificar el texto completo, lo que puede ser ineficiente para aplicaciones en tiempo real con muchos tipos.
- No se han publicado evaluaciones de sesgos ni estudios de robustez ante textos adversariales. Como modelo multilingüe basado en RemBERT, puede heredar sesgos presentes en sus datos de entrenamiento.
- La documentación no especifica el rendimiento en idiomas de bajos recursos; aunque RemBERT es multilingüe, la calidad puede variar significativamente entre idiomas.
- No se proporcionan benchmarks ni métricas de rendimiento, por lo que es difícil comparar objetivamente con otras soluciones antes de realizar pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whoisjones/otter-cross-rembert
- Repositorio GitHub: https://github.com/whoisjones/otter
- Modelo bi-encoder con RemBERT: https://huggingface.co/whoisjones/otter-bi-rembert
- Modelo cross-encoder con mmBERT: https://huggingface.co/whoisjones/otter-cross-mmbert
- Modelo bi-encoder con mmBERT: https://huggingface.co/whoisjones/otter-bi-mmbert
