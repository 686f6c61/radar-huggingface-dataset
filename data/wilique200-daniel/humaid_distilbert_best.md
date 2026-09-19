# wilique200-daniel/humaid_distilbert_best

## Resumen

HumAID Disaster Tweet Classifier es un modelo de clasificación de texto en inglés desarrollado por el usuario wilique200-daniel. Consiste en un DistilBERT-base-uncased ajustado (fine-tuning) para clasificar tuits relacionados con crisis y desastres en 11 categorías humanitarias distintas. El modelo se publicó como la rama de procesamiento de texto de un pipeline multimodal de respuesta ante desastres, según indica su propia model card.

Se trata de un modelo denso de 66.961.162 parámetros (aproximadamente 67 millones), con una longitud de contexto heredada de la arquitectura DistilBERT (512 tokens) y un tamaño de repositorio de 0,3 GB. Su relevancia es acotada y muy específica: no es un modelo generativo ni de propósito general, sino un clasificador de una sola tarea, orientado a sistemas de gestión de emergencias que necesitan enrutar automáticamente grandes volúmenes de mensajes ciudadanos durante un desastre.

El interés técnico del modelo reside en su tratamiento del desequilibrio de clases: el dataset de entrenamiento presenta un desbalance de 59,6x entre clases, y el autor aplicó ponderación de clases para que la clase minoritaria extrema (`missing_or_found_people`, con solo 25 ejemplos en test) alcanzara un F1 de 0,72 y un recall de 0,88. El modelo reporta un 75 % de accuracy y un F1 macro de 0,73 sobre su propio split de test.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT-base-uncased, destilado de BERT-base) |
| Parámetros totales | 66.961.162 |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 512 tokens (límite de posiciones de la arquitectura DistilBERT base) |
| Tipos de cuantización | No disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, ONNX o INT8) |
| Idiomas soportados | Inglés (el autor indica que los caracteres no ASCII representan solo el 0,3 % del dataset de entrenamiento) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DistilBERT-base-uncased, un encoder transformer de 6 capas, 12 cabezas de atención y 768 dimensiones ocultas, destilado a partir de BERT-base. Sobre esa base se añadió una cabeza de clasificación para 11 categorías humanitarias y se ajustó el conjunto completo sobre el dataset `QCRI/HumAID-all`. No se documenta en la model card ningún tipo de RLHF, DPO ni ajuste por preferencias: es un fine-tuning supervisado clásico de clasificación.

Los datos de entrenamiento proceden del split "train" de HumAID, compuesto por 53.531 tuits etiquetados que cubren 19 eventos de desastre ocurridos entre 2016 y 2019. El autor no utilizó los splits predefinidos de validación y test, sino que volvió a particionar esas 53.531 filas en una proporción 80/10/10, resultando en 42.824 ejemplos de entrenamiento, 5.353 de validación y 5.354 de test. La model card afirma que no existe fuga de duplicados exactos entre los tres conjuntos. La innovación técnica más destacable es el uso de ponderación de clases para compensar un desequilibrio de 59,6x, que permitió obtener un rendimiento razonable en la clase más minoritaria del conjunto de evaluación.

## Capacidades

- Clasificación de texto en inglés: asigna un tuit de desastre a una de las 11 categorías humanitarias de la taxonomía HumAID.
- Clase `missing_or_found_people`: detección de mensajes sobre personas desaparecidas o encontradas, con F1 de 0,72 y recall de 0,88 en test pese a contar con solo 25 ejemplos de evaluación.
- Clase `requests_or_urgent_needs`: identificación de peticiones de ayuda o necesidades urgentes, con una precisión reportada de 0,43.
- Clase `other_relevant_information`: categoría genérica de información relevante, con F1 de 0,49.
- Procesamiento por lotes de mensajes cortos: el formato de entrada (tuits) y la arquitectura elegida lo hacen adecuado para clasificar grandes volúmenes de texto corto.
- No dispone de generación de texto, razonamiento multi-paso, tool calling, function calling, capacidades de agente, visión ni audio: es exclusivamente un clasificador de secuencias.
- No se documentan capacidades multilingües efectivas; el entrenamiento es en la práctica monolingüe en inglés.

## Casos de uso

- Triaje de emergencias en tiempo real: integrado en una plataforma de gestión de crisis, el modelo puede clasificar automáticamente el flujo de tuits entrantes durante un desastre y enrutar cada mensaje al equipo responsable (rescate, suministros, atención psicológica, etc.).
- Detección de personas desaparecidas: gracias al recall de 0,88 en `missing_or_found_people`, es útil como primera pasada para marcar mensajes que requieren revisión humana urgente, incluso con muy pocos ejemplos de esa clase en el dataset.
- Identificación de necesidades urgentes: permite priorizar peticiones de agua, alimentos, refugio o atención médica para que los operadores atiendan primero los mensajes con `requests_or_urgent_needs`, asumiendo su precisión limitada (0,43) y la necesidad de validación humana.
- Monitorización de redes sociales para ONG: clasificación por lotes de menciones durante una campaña humanitaria, para elaborar informes agregados por categoría y evento.
- Filtrado previo en pipelines multimodales: tal como describe el autor, este modelo actúa como rama de texto de una API de respuesta ante desastres que probablemente combine texto con imágenes; su salida se puede concatenar con la de otros clasificadores.
- Análisis retrospectivo de eventos: dado que el dataset cubre 19 desastres entre 2016 y 2019, el modelo permite reclasificar corpus históricos de tuits y analizar cómo evolucionó la tipología de mensajes en cada evento.
- Investigación en NLP para crisis humanitarias: sirve como línea base reproducible (accuracy 0,75, F1 macro 0,73) para comparar arquitecturas más grandes o enfoques con mayor capacidad de generalización entre eventos.
- Enrutamiento de mensajes en centros de llamadas de emergencia que también reciban texto: la salida de 11 clases puede mapearse a colas de atención distintas sin intervención manual.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre su propio split de test (5.354 ejemplos):

| Métrica | Valor |
|---|---|
| Accuracy | 75 % |
| F1 macro | 0,73 |
| F1 de `missing_or_found_people` | 0,72 |
| Recall de `missing_or_found_people` | 0,88 |
| F1 de `other_relevant_information` | 0,49 |
| Precisión de `requests_or_urgent_needs` | 0,43 |
| Desequilibrio de clases del dataset | 59,6x |

No se han publicado resultados comparativos frente a otros modelos (BERT-base, RoBERTa, DeBERTa, etc.) sobre el mismo split en la información disponible, por lo que no es posible establecer una comparación de rendimiento rigurosa.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 268 MB en FP32 y unos 134 MB en FP16/BF16, considerando solo los pesos. Con el overhead del runtime (PyTorch, CUDA, tokenizador y buffers de activaciones) hay que contar entre 0,5 y 1 GB aproximadamente.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs con 2 GB de VRAM o en iGPU mediante ONNX Runtime.
- Inferencia en CPU totalmente viable: 67 millones de parámetros permiten ejecutar el modelo en un portátil convencional sin GPU.
- GPU recomendadas para producción de alto volumen: cualquiera con soporte CUDA actual; modelos como A100 o H100 solo tendrían sentido para despliegues con muchas réplicas o batching masivo, no por requisitos de memoria.
- Opciones de despliegue: Hugging Face Transformers (PyTorch), ONNX Runtime, TorchScript, y servidores de inferencia compatibles con modelos de clasificación como TorchServe o Triton Inference Server. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables directamente sin conversión previa. vLLM no está orientado a este tipo de clasificador.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera un throughput de miles de textos cortos por segundo en GPU y de cientos a miles por segundo en CPU con batching, pero se trata de una estimación orientativa no verificada por el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea y licencia | Disponibilidad |
|---|---|---|---|---|
| humaid_distilbert_best (este modelo) | 66,9 M | 512 tokens | Clasificación de tuits de desastre, Apache 2.0 | Hugging Face, safetensors |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base generalista, Apache 2.0 | Hugging Face, safetensors/PyTorch |
| bert-base-uncased | 110 M | 512 tokens | Modelo base generalista, Apache 2.0 | Hugging Face, safetensors/PyTorch |
| roberta-base | 125 M | 512 tokens | Modelo base generalista, MIT | Hugging Face, safetensors/PyTorch |

La comparación de rendimiento frente a alternativas ajustadas sobre el mismo dataset no está disponible. La model card tampoco ofrece comparaciones con otros clasificadores de la literatura HumAID, por lo que la única referencia cuantitativa publicada son las métricas propias de este modelo.

## Limitaciones y advertencias

- Riesgo de sobreajuste al vocabulario de eventos concretos: las palabras con mayor TF-IDF por clase están dominadas por nombres de eventos específicos (por ejemplo, "irma", "maria", "kerala") en lugar de lenguaje humanitario general. Como el autor no pudo dividir los datos por evento o fecha, el modelo puede haber aprendido vocabulario ligado a desastres concretos y generalizar peor ante eventos futuros no vistos.
- Rendimiento débil en clases difusas: la clase `other_relevant_information` obtiene un F1 de 0,49 por ser una categoría genérica difícil de delimitar, y `requests_or_urgent_needs` presenta una precisión de 0,43, con confusión probable con clases semánticamente cercanas de rescate o apoyo emocional.
- Sesgo de dominio: el modelo está entrenado exclusivamente sobre tuits en inglés de 19 desastres ocurridos entre 2016 y 2019 y recopilados por QCRI. No hay garantía de que el vocabulario, el argot o los patrones de comunicación de eventos posteriores coincidan con los del entrenamiento.
- Limitación idiomática: aunque la model card declara inglés como único idioma, el dataset contiene un 0,3 % de caracteres no ASCII, lo que implica un soporte multilingüe nulo o meramente anecdótico. No debe usarse sobre texto en castellano u otros idiomas.
- Contexto limitado a 512 tokens: los textos más largos deben truncarse, lo que puede eliminar información relevante en mensajes extensos.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre. Sin embargo, sí puede asignar categorías erróneas con alta confianza, especialmente en las clases con menor F1 o precisión.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique si se han realizado cambios.
- Advertencia para producción: con 0 descargas, 0 likes y una única versión publicada el mismo día de su creación (19 de septiembre de 2026, creado a las 11:08 y actualizado a las 11:27), el modelo no cuenta con validación externa, revisión por pares ni pruebas en entornos reales. No debería desplegarse en un sistema crítico de respuesta ante emergencias sin una evaluación previa sobre datos propios del evento en curso y sin supervisión humana en las decisiones sensibles.
- No se documentan evaluaciones de robustez frente a texto adversarial, ruido ortográfico, emojis, URLs o mensajes muy cortos, habituales en el dominio de Twitter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilique200-daniel/humaid_distilbert_best
- Dataset de entrenamiento: https://huggingface.co/datasets/QCRI/HumAID-all
- Modelo base utilizado: https://huggingface.co/distilbert-base-uncased
- Los resultados de la búsqueda web realizada no contienen enlaces relevantes al modelo, al dataset ni a documentación técnica asociada; solo devuelven foros sin relación con el contenido de esta ficha.
