# TinyTank/distilbert-base-uncased-finetuned-clinc

## Resumen

Este modelo es una versión fine-tuned de DistilBERT base, desarrollada por TinyTank, que se presenta como un clasificador de texto para la detección de intenciones. El nombre del modelo indica que fue ajustado sobre un dataset denominado "clinc", aunque la model card no especifica la composición exacta de los datos de entrenamiento. Se trata de un modelo pequeño, con 67.069.591 parámetros, lo que lo hace adecuado para entornos con recursos limitados o para aplicaciones de inferencia en tiempo real.

La arquitectura subyacente es DistilBERT, un transformer encoder destilado de BERT que conserva gran parte de la capacidad del modelo original con un coste computacional menor. El modelo está diseñado para tareas de clasificación de texto, concretamente para asignar una categoría o intención a una frase de entrada. La relevancia actual de este modelo radica en su utilidad para sistemas de diálogo, asistentes virtuales y automatización de atención al cliente, donde la clasificación de intenciones es un paso fundamental. Su licencia Apache 2.0 permite un uso flexible, incluido el comercial, y su tamaño reducido facilita el despliegue en CPU o GPU de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 67.069.591 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de distilbert-base-uncased) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base distilbert-base-uncased está entrenado principalmente en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una arquitectura de transformer encoder que reduce el tamaño de BERT mediante destilación de conocimiento. DistilBERT conserva la estructura general de BERT pero con un número menor de capas, lo que permite una inferencia más rápida y un menor consumo de memoria. El modelo original distilbert-base-uncased tiene 66 millones de parámetros; la versión fine-tuned añade una capa de clasificación, lo que eleva el total a 67.069.591 parámetros.

El proceso de entrenamiento consistió en un fine-tuning supervisado sobre un dataset de clasificación de intenciones. Según la información de la model card, se utilizaron los siguientes hiperparámetros: learning rate de 2e-5, tamaño de lote de 96, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler de tipo linear, y 5 épocas de entrenamiento. Los datos de entrenamiento y la composición del dataset no están disponibles en la documentación. No se menciona el uso de RLHF, DPO ni ningún otro método de alineación posterior.

## Capacidades

- Clasificación de texto: el modelo asigna una etiqueta o intención a una frase de entrada, basándose en el dataset de fine-tuning.
- Clasificación de intenciones en sistemas de diálogo: puede identificar la intención del usuario en un conjunto predefinido de categorías.
- No soporta generación de texto libre: es un modelo encoder, no un modelo generativo.
- No soporta tool calling ni function calling: su arquitectura no está diseñada para invocar herramientas externas.
- No soporta agentes ni razonamiento multi-paso: se limita a una clasificación de una sola pasada.
- Capacidades multilingües: no disponibles, aunque el modelo base está entrenado principalmente en inglés.

## Casos de uso

- Asistentes virtuales: el modelo puede clasificar la intención del usuario (por ejemplo, "consultar saldo", "reservar cita", "cancelar pedido") para enrutar la conversación al flujo adecuado. Su tamaño reducido permite ejecutarlo en servidores con poca capacidad.
- Enrutamiento de tickets de soporte: los mensajes de los clientes pueden clasificarse automáticamente en categorías como "facturación", "problema técnico" o "devolución", lo que agiliza la asignación al equipo correspondiente.
- Automatización de respuestas en chatbots: al detectar la intención, el sistema puede seleccionar una respuesta predefinida o activar una acción específica, reduciendo la intervención humana.
- Clasificación de consultas de FAQ: las preguntas de los usuarios se etiquetan según el tema, permitiendo buscar la respuesta más relevante en una base de conocimiento.
- Segmentación de mensajes para análisis: los mensajes de redes sociales o encuestas pueden clasificarse por intención para generar informes y métricas de negocio.
- Integración en pipelines de NLP: al ser un modelo ligero, puede integrarse como paso previo en un sistema más complejo, por ejemplo, para filtrar o priorizar mensajes antes de enviarlos a un modelo de lenguaje más grande.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta los siguientes resultados de evaluación durante el entrenamiento, declarados por el autor:

| Training Loss | Epoch | Step | Validation Loss | Accuracy |
|:-------------:|:-----:|:----:|:---------------:|:--------:|
| 4.6193        | 1.0   | 159  | 3.9833          | 0.6155   |
| 3.5281        | 2.0   | 318  | 2.9555          | 0.7819   |
| 2.6834        | 3.0   | 477  | 2.2748          | 0.8397   |
| 2.1539        | 4.0   | 636  | 1.9053          | 0.8610   |
| 1.9050        | 5.0   | 795  | 1.7902          | 0.8674   |

La accuracy final de 0.8674 corresponde al conjunto de evaluación tras 5 épocas. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan aproximadamente 268 MB; en FP16, unos 134 MB. Con el overhead de activaciones y el procesamiento de lotes, se recomienda al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050) es suficiente. También puede ejecutarse en CPU sin problemas.
- Compatibilidad con GPU de consumo: sí, el modelo es lo bastante pequeño para funcionar en la mayoría de tarjetas gráficas de consumo.
- Opciones de despliegue: se puede servir mediante la API de Hugging Face Transformers (pipeline de text-classification), exportar a ONNX Runtime para inferencia optimizada, o desplegar en Hugging Face Inference Endpoints.
- Latencia y throughput: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia baja, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TinyTank/distilbert-base-uncased-finetuned-clinc | 67.069.591 | 512 | Apache 2.0 | Hugging Face |
| distilbert/distilbert-base-uncased | 66.000.000 (aprox.) | 512 | Apache 2.0 | Hugging Face |
| distilbert/distilbert-base-uncased-finetuned-sst-2-english | 67.000.000 (aprox.) | 512 | Apache 2.0 | Hugging Face |

Los tres modelos comparten la misma arquitectura DistilBERT y la misma longitud de contexto. El modelo base no está fine-tuned para ninguna tarea específica, mientras que las versiones fine-tuned están ajustadas para clasificación de texto (CLINC y SST-2 respectivamente). No se dispone de datos de rendimiento comparables entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo hereda los sesgos del modelo base DistilBERT, que fue entrenado principalmente con texto en inglés. Además, el dataset de fine-tuning no está documentado, por lo que pueden existir sesgos no identificados.
- Riesgo de alucinación: al ser un clasificador, el riesgo de generar texto falso es bajo, pero puede producir clasificaciones incorrectas con alta confianza si la entrada está fuera del dominio de entrenamiento.
- Limitaciones de contexto: la ventana de 512 tokens limita el tamaño de las entradas que el modelo puede procesar.
- Limitaciones de idioma: el modelo base está entrenado en inglés, por lo que su rendimiento en otros idiomas puede ser deficiente.
- Restricciones de licencia: la licencia Apache 2.0 permite el uso comercial, pero requiere incluir el aviso de licencia y atribución en distribuciones del modelo.
- Caveat para producción: la model card está incompleta y generada automáticamente, con secciones marcadas como "More information needed". No se proporciona información sobre la composición del dataset, el rendimiento en datos fuera de distribución ni la robustez del modelo, por lo que se recomienda realizar una evaluación propia antes de desplegarlo en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TinyTank/distilbert-base-uncased-finetuned-clinc
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo similar fine-tuned en SST-2: https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english
