# tadiecool29/afriberta-stl-large-stance

## Resumen

afriberta-stl-large-stance es un modelo de clasificación de textos fine-tuneado a partir de [castorini/afriberta_large](https://huggingface.co/castorini/afriberta_large), un modelo multilingüe preentrenado de aproximadamente 126 millones de parámetros diseñado específicamente para lenguas africanas de bajos recursos. El autor, tadiecool29, ha adaptado el modelo base para la tarea de detección de postura (stance detection), una tarea de clasificación de textos que determina si un texto expresa una posición a favor, en contra o neutral respecto a un tema o afirmación concreta.

El modelo se distribuye bajo licencia MIT y está disponible en formato safetensors, con un tamaño de repositorio de 0,5 GB. Según los datos de entrenamiento reportados, el fine-tuning se realizó durante 6 épocas con una tasa de aprendizaje de 1e-05, alcanzando un F1 de 0,7776 y una precisión de 0,7815 en el conjunto de evaluación. La relevancia de este modelo radica en que aborda una tarea de análisis de sentimiento y detección de postura en lenguas africanas, un área tradicionalmente desatendida en el procesamiento del lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-style) |
| Parametros totales | 125.634.052 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 11 lenguas africanas (Afaan Oromoo, Amharic, Gahuza, Hausa, Igbo, Nigerian Pidgin, Somali, Swahili, Tigrinya, entre otras) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, AfriBERTa Large, es un transformer encoder de tipo BERT con aproximadamente 126 millones de parámetros, preentrenado con un vocabulario de tamaño reducido (alrededor de 30.000 subpalabras) sobre un corpus de 11 lenguas africanas de bajos recursos. La arquitectura sigue el diseño estándar de BERT con atención bidireccional, lo que lo hace adecuado para tareas de clasificación de textos completos.

El fine-tuning se realizó sobre un dataset no especificado en la model card, con un objetivo de clasificación de postura. Los hiperparámetros de entrenamiento incluyen una tasa de aprendizaje de 1e-05, batch size de 16 para entrenamiento y 32 para evaluación, scheduler cosine con 300 pasos de warmup, y 6 épocas completas. Se utilizó entrenamiento con precisión mixta nativa (AMP) y el optimizador AdamW con betas (0,9, 0,999). No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estándar.

## Capacidades

- Clasificación de postura (stance detection): el modelo determina si un texto expresa una posición a favor, en contra o neutral respecto a un tema, con una métrica F1 de 0,7776 en el conjunto de evaluación.
- Análisis de sentimiento: aunque la tarea principal es stance detection, las métricas reportadas incluyen precisión, recall y accuracy de sentimiento, lo que sugiere que el modelo también puede utilizarse para clasificación de sentimiento general.
- Procesamiento multilingüe: al estar basado en AfriBERTa Large, hereda la capacidad de procesar 11 lenguas africanas, incluyendo amhárico, somalí, suajili, hausa, igbo, yoruba y otras.
- Clasificación de textos: la arquitectura encoder permite aplicar el modelo a otras tareas de clasificación de secuencias completas, como análisis de opiniones o detección de discursos de odio, con un fine-tuning adicional.
- Inferencia eficiente: con solo 125 millones de parámetros, el modelo es ligero en comparación con modelos modernos de cientos de miles de millones de parámetros, lo que permite su despliegue en hardware modesto.

## Casos de uso

- Análisis de opinión política en redes sociales: el modelo puede clasificar tuits o publicaciones en lenguas africanas para determinar la postura de los usuarios respecto a candidatos, partidos o políticas concretas, facilitando el seguimiento de la opinión pública en tiempo real.
- Monitorización de marca en mercados africanos: las empresas pueden utilizar el modelo para analizar menciones de sus productos en redes sociales y foros en lenguas locales, identificando si los usuarios expresan una postura favorable o desfavorable hacia la marca.
- Investigación académica en ciencias sociales: los investigadores pueden aplicar el modelo a corpus de textos en lenguas africanas para estudiar la polarización política, el discurso público o la evolución de opiniones sobre temas controvertidos.
- Moderación de contenido en plataformas digitales: el modelo puede integrarse en pipelines de moderación para detectar automáticamente textos que expresan posturas extremas o discursos problemáticos en lenguas africanas, priorizando la revisión humana.
- Análisis de noticias y medios de comunicación: los medios pueden utilizar el modelo para clasificar automáticamente el sesgo o la postura editorial de artículos publicados en lenguas africanas, ayudando a los lectores a identificar la perspectiva de cada fuente.
- Sistemas de recomendación de contenido: plataformas de contenido pueden usar la clasificación de postura para personalizar las recomendaciones según las posiciones expresadas por los usuarios en sus interacciones previas.

## Benchmarks y rendimiento

Los resultados de evaluación reportados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Loss | 0,7849 |
| Sentiment Precision | 0,7643 |
| Sentiment Recall | 0,7555 |
| F1 | 0,7584 |
| Sentiment Acc | 0,7509 |

La evolución del entrenamiento muestra una mejora progresiva del F1 desde 0,7226 en la época 1 hasta 0,7776 en la época 6, con una pérdida de validación mínima de 0,6548 en la época 2. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 125 millones de parámetros, la inferencia requiere aproximadamente 0,5 GB de VRAM en precisión FP32, y menos de 0,25 GB en cuantización INT8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente, incluyendo GPUs integradas modernas. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores son más que suficientes.
- Compatibilidad con GPUs de consumo: sí, el modelo cabe sin problemas en cualquier GPU de consumo actual, incluso en las de gama de entrada.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede desplegarse con Hugging Face Transformers, ONNX Runtime, TensorFlow Serving o cualquier framework compatible con BERT. También es compatible con vLLM y TGI para servir en producción.
- Latencia estimada: en una GPU moderna, la inferencia para un texto de longitud media (128 tokens) debería completarse en menos de 10 ms. En CPU, la latencia puede ser de 50-100 ms por texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Uso principal |
|---|---|---|---|---|---|
| afriberta-stl-large-stance | 125,6 M | no disponible | 11 lenguas africanas | MIT | Stance detection |
| castorini/afriberta_large | 125,6 M | no disponible | 11 lenguas africanas | MIT | Modelo base multilingüe |
| bert-base-multilingual-cased | 178 M | 512 tokens | 104 idiomas | Apache 2.0 | Clasificación multilingüe general |
| XLM-RoBERTa-base | 270 M | 512 tokens | 100 idiomas | MIT | Clasificación multilingüe general |

El modelo se diferencia de las alternativas multilingües generales por su especialización en lenguas africanas de bajos recursos, que suelen estar infrarrepresentadas en modelos como mBERT o XLM-R. Sin embargo, carece de la cobertura lingüística de estos modelos y no se dispone de comparativas directas de rendimiento.

## Limitaciones y advertencias

- El dataset de entrenamiento no está especificado en la model card, lo que impide evaluar la calidad y representatividad de los datos utilizados para el fine-tuning.
- No se han publicado resultados de benchmarks comparativos con otros modelos, por lo que el rendimiento relativo es desconocido.
- La longitud de contexto no está documentada; se asume que hereda el límite de 512 tokens del modelo base AfriBERTa, pero no está confirmado.
- El modelo está especializado en lenguas africanas y su rendimiento en otros idiomas no está garantizado.
- La model card generada automáticamente indica que falta información sobre usos previstos, limitaciones y datos de entrenamiento, lo que sugiere una documentación incompleta.
- No se han reportado evaluaciones de sesgos o riesgos de alucinación específicos para este modelo.
- Aunque la licencia MIT permite uso comercial sin restricciones, la falta de documentación sobre el dataset de entrenamiento puede plantear riesgos legales o éticos si los datos contienen información personal o sesgada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/tadiecool29/afriberta-stl-large-stance)
- [Modelo base castorini/afriberta_large](https://huggingface.co/castorini/afriberta_large)
- [Repositorio GitHub de AfriBERTa](https://github.com/castorini/afriberta)
- [Perfil de GitHub del autor](https://github.com/tadiecool29/tadiecool29/blob/main/README.md)
- [Ficha de AfriBERTa Large en AIBase](https://model.aibase.com/en/models/details/1915687192057561090)
