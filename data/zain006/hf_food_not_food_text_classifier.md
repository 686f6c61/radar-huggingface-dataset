# Zain006/Hf_food_not_food_text_classifier

## Resumen

Hf_food_not_food_text_classifier es un modelo de clasificación de texto obtenido mediante fine-tuning de distilbert-base-uncased, publicado por el usuario Zain006 en Hugging Face. Su propósito declarado, deducible del propio identificador del repositorio, es distinguir entre textos que describen comida y textos que no lo hacen, una tarea de clasificación binaria de dominio acotado. Se trata de un modelo derivado de DistilBERT, la variante destilada de BERT con 6 capas y 66.955.010 parámetros totales, entrenada originalmente con destilación de conocimiento a partir de BERT-base.

El modelo se ha entrenado con la librería Transformers mediante el Trainer, con un conjunto de datos no especificado en la model card ("unknown dataset"), y declara una precisión de 1,0 sobre el conjunto de evaluación junto con una pérdida de validación de 0,0001 tras 10 épocas. Estos valores, sin información sobre el volumen ni la composición del conjunto de evaluación, deben interpretarse con cautela: una accuracy perfecta en un conjunto de evaluación no descrito es una señal de posible sobreajuste o de un conjunto de test demasiado pequeño o poco representativo.

Su relevancia práctica es limitada y muy específica: sirve como componente ligero de filtrado o enrutamiento en pipelines de procesamiento de texto donde sea necesario separar contenido culinario del resto. No es un modelo de propósito general, no dispone de model card sustantiva (secciones de descripción, usos previstos y datos de entrenamiento marcadas como "More information needed") y cuenta con 21 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy reducida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | No disponible (el modelo base es uncased en inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas y 66,9 millones de parámetros obtenido por destilación de conocimiento de BERT-base (12 capas, 110 millones de parámetros). Conserva el vocabulario WordPiece de BERT-base uncased (aproximadamente 30.522 tokens) y la misma dimensionalidad de representación oculta (768), pero reduce el número de capas a la mitad, lo que rebaja el coste computacional de inferencia en torno a un 40 % respecto a BERT-base según los datos publicados originalmente por Hugging Face para DistilBERT. El modelo es un encoder bidireccional sin cabeza generativa: sobre la representación del token [CLS] se aplica una cabeza de clasificación para producir la predicción.

El fine-tuning se realizó con los siguientes hiperparámetros declarados en la model card: learning rate de 1e-4, tamaño de batch de 32 tanto en entrenamiento como en evaluación, semilla 42, optimizador AdamW (variante fused, betas 0,9 y 0,999, epsilon 1e-8), scheduler lineal y 10 épocas, con un total de 70 pasos de entrenamiento. Este número de pasos implica un conjunto de entrenamiento muy reducido (aproximadamente 224 ejemplos si el batch de 32 se aplica sin acumulación, dado que 70 pasos × 32 = 2.240 ejemplos procesados en total a lo largo de 10 épocas, lo que equivale a unos 224 ejemplos por época). No se documenta la composición del dataset, el número de tokens de entrenamiento, ni si se aplicaron técnicas de aumento de datos, RLHF o DPO (ninguna de ellas esperable en un clasificador de este tipo). El entrenamiento se realizó con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto binaria orientada a la tarea "comida / no comida", según el nombre del repositorio y la etiqueta de pipeline text-classification.
- Inferencia de etiquetas sobre secuencias de texto cortas o medias, con el límite de 512 tokens propio de la arquitectura DistilBERT.
- Ejecución eficiente en CPU y GPU de gama baja gracias a su tamaño reducido (66,9 millones de parámetros, repositorio de 0,3 GB).
- Compatibilidad con Text Embeddings Inference (TEI) y con endpoints compatibles, según las etiquetas del repositorio, lo que permite desplegarlo como servicio HTTP de clasificación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidades multilingües no declaradas; el modelo base es uncased en inglés y el autor no documenta idiomas adicionales.
- No es un modelo generativo: no produce texto, solo etiquetas de clasificación.

## Casos de uso

- Filtrado de contenido culinario en agregadores de recetas: el modelo puede clasificar titulares, descripciones o snippets de texto y descartar los que no correspondan a contenido gastronómico antes de indexarlos, reduciendo el ruido en el catálogo con un coste de inferencia muy bajo.
- Enrutamiento en asistentes de cocina: dado un mensaje de usuario, clasificarlo como consulta relacionada con comida o no, y derivar solo el primer grupo al motor de recetas o al buscador de ingredientes, mientras el resto se atiende con un flujo general.
- Moderación y etiquetado de datasets: uso como etiquetador automático de primer paso para anotar grandes volúmenes de texto con la etiqueta comida/no comida, con revisión humana posterior de los casos límite.
- Clasificación en pipelines de ingestión de datos: integrado como etapa de preprocesado en un pipeline de datos (por ejemplo, con la librería Datasets) para separar subconjuntos temáticos antes de entrenar otros modelos.
- Despliegue como microservicio de clasificación: gracias a su compatibilidad con Text Embeddings Inference y su tamaño de 0,3 GB, puede servirse en contenedores pequeños o en CPU para tareas de clasificación de alto volumen y baja latencia.
- Prototipado y demos educativas: sirve como ejemplo mínimo y reproducible de fine-tuning de DistilBERT con el Trainer de Transformers para tareas de clasificación binaria, útil en docencia o en pruebas de concepto internas.
- Filtrado previo en motores de búsqueda verticales: descartar resultados no gastronómicos en un buscador especializado en restaurantes, recetas o productos alimentarios antes de aplicar el ranking principal.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros); el campo `model-index` aparece con la lista `results` vacía. Los únicos datos declarados por el autor son métricas de validación durante el entrenamiento:

| Metrica | Valor declarado |
|---|---|
| Loss (evaluacion final) | 0,0001 |
| Accuracy (evaluacion final) | 1,0 |
| Validation loss en epoca 1 | 0,1262 |
| Validation loss en epoca 2 | 0,0005 |
| Accuracy en epoca 1 | 0,98 |
| Accuracy en epocas 2 a 10 | 1,0 |

No se han publicado resultados de benchmarks en la informacion disponible. Los valores anteriores proceden exclusivamente de la model card del autor y no han sido verificados de forma independiente; además, se desconoce el tamaño y la composición del conjunto de evaluación, por lo que no permiten comparaciones fiables con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,27 GB solo para los pesos (66,9 millones de parámetros × 4 bytes), más el overhead de activaciones, que para secuencias de 512 tokens se mantiene en el rango de cientos de MB.
- VRAM estimada en FP16/BF16: aproximadamente 0,13 GB para los pesos, más activaciones.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, GTX 1660, e incluso en iGPU con suficiente memoria compartida.
- Funciona en CPU con latencias del orden de milisegundos por secuencia corta, adecuado para despliegues sin GPU.
- Opciones de despliegue: Transformers con `pipeline("text-classification")`, Text Embeddings Inference (TEI) para servicio HTTP, ONNX Runtime para optimización en CPU, y conversión a otros formatos mediante las herramientas estándar de Hugging Face. No se documenta soporte específico de vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un encoder de 6 capas y 66,9 millones de parámetros se espera un throughput alto en GPU y aceptable en CPU, pero no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hf_food_not_food_text_classifier | 66,9 M | 512 tokens | Clasificación binaria comida/no comida | Apache 2.0 | Hugging Face (21 descargas, 0 likes) |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base encoder, sin cabeza de clasificación específica | Apache 2.0 | Hugging Face, ampliamente utilizado |
| bert-base-uncased | 110 M | 512 tokens | Modelo base encoder | Apache 2.0 | Hugging Face, ampliamente utilizado |
| Modelos de clasificación de texto genéricos (p. ej., cabezas de clasificación sobre BERT/DistilBERT) | Variable | 512 tokens | Clasificación multietiqueta o binaria genérica | Variable | Hugging Face |

La comparación relevante es frente a su modelo base: este clasificador añade una cabeza entrenada para una tarea concreta, pero no documenta el dataset ni el rendimiento fuera de su conjunto de evaluación. Frente a alternativas genéricas de clasificación, su ventaja es la especialización y su desventaja es la falta de documentación y de validación independiente. No se dispone de datos de benchmarks que permitan una comparación cuantitativa con modelos de la misma categoría.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones sin completar ("More information needed") en descripción, usos previstos y datos de entrenamiento; no hay información sobre la composición del dataset ni sobre el proceso de anotación.
- La accuracy de 1,0 y la pérdida de 0,0001 en evaluación, sin describir el conjunto de evaluación, sugieren un posible sobreajuste o un conjunto de test demasiado pequeño; no deben tomarse como indicador de rendimiento en producción.
- El número de pasos de entrenamiento (70) apunta a un conjunto de datos muy reducido, lo que limita la generalización a dominios y estilos de texto distintos de los vistos en entrenamiento.
- Riesgo de alucinación no aplica en sentido estricto (no es generativo), pero sí existe riesgo de clasificaciones erróneas con alta confianza en textos ambiguos o fuera de distribución.
- No se declaran sesgos conocidos; al derivar de distilbert-base-uncased, puede heredar sesgos presentes en el corpus original de BERT, aunque no están documentados para esta tarea.
- Limitación de contexto de 512 tokens; textos más largos deben truncarse o dividirse, lo que puede perder información relevante para la clasificación.
- Idiomas no declarados; el modelo base es uncased en inglés y no hay evidencia de buen rendimiento en castellano u otros idiomas.
- La licencia Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni documentación de soporte; el uso en producción requiere validación propia sobre datos representativos del dominio objetivo.
- Adopción muy baja (21 descargas, 0 likes) y ausencia de mantenimiento documentado; no hay historial de versiones ni issues que permitan evaluar su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zain006/Hf_food_not_food_text_classifier
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Documentación de Text Embeddings Inference: https://huggingface.co/docs/text-embeddings-inference
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
