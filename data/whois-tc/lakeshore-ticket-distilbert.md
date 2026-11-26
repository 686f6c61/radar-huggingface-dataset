# whois-tc/lakeshore-ticket-distilbert

## Resumen

Lakeshore Ticket DistilBERT es un modelo de clasificación de texto obtenido mediante fine-tuning de `distilbert-base-uncased` sobre un conjunto de 400 tickets sintéticos de un servicio ficticio de bicicletas compartidas. Lo desarrolla el usuario de Hugging Face `whois-tc` y su propósito es asignar cada mensaje de soporte a una de cuatro colas: `billing`, `bike_fault`, `station` o `account`. Se trata explícitamente de una demo de aula, no de un sistema listo para producción.

El modelo resuelve una tarea acotada de enrutamiento multiclase sobre texto corto en inglés. Con 66.956.548 parámetros y un peso de repositorio de 0,3 GB en formato safetensors, es un modelo pequeño que puede ejecutarse en CPU o en GPUs de consumo muy modestas. Su interés práctico es servir como referencia didáctica de un pipeline completo de clasificación: baseline mayoritario, baseline clásico con TF-IDF y regresión logística, y fine-tuning de un transformer destilado.

La relevancia es limitada fuera del contexto educativo: los datos de entrenamiento fueron generados artificialmente, el conjunto es minúsculo (400 ejemplos de entrenamiento y 240 de test) y el propio autor advierte de que no debe usarse para enrutar tickets reales ni introducir información personal. Aun así, la comparación publicada entre métodos resulta útil para ilustrar cuánto aporta un transformer frente a un clasificador lineal en una tarea de este tipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT) |
| Parámetros totales | 66.956.548 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base admite hasta 512 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible; el modelo base es `uncased` en inglés y los datos de entrenamiento están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de 6 capas obtenido por destilación de conocimiento de BERT-base, con vocabulario WordPiece en minúsculas (`uncased`). Sobre la cabeza preentrenada se añade una cabeza de clasificación de secuencia con cuatro etiquetas de salida correspondientes a las colas `billing`, `bike_fault`, `station` y `account`.

El fine-tuning se realizó sobre 400 tickets estratificados del split de entrenamiento generado, con semilla 2026, 3 épocas y una tasa de aprendizaje de 5e-05. No se documenta en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores; en una tarea de clasificación supervisada como esta, lo habitual es entrenamiento con entropía cruzada y sin alineamiento adicional. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal, que no aplican a un encoder de clasificación.

## Capacidades

- Clasificación de texto en cuatro clases cerradas: `billing`, `bike_fault`, `station` y `account`.
- Enrutamiento de mensajes de soporte de una sola intención sobre texto corto en inglés.
- Inferencia ligera: 66,9 M de parámetros permiten ejecución en CPU con latencia baja para clasificación.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo de pensamiento (thinking), visión ni audio.
- Capacidades multilingües no documentadas; el vocabulario `uncased` y los datos en inglés limitan su uso fuera de ese idioma.
- No genera texto: su salida es una distribución de probabilidad sobre cuatro etiquetas.

## Casos de uso

- Demostración docente de fine-tuning de transformers: sirve para ilustrar el flujo completo de preparación de datos, entrenamiento con `Trainer` de Hugging Face y evaluación con accuracy y macro F1 frente a baselines.
- Comparación de baselines en cursos de NLP: el modelo permite reproducir la comparación publicada entre etiqueta mayoritaria (28,75 % de accuracy), TF-IDF con regresión logística (84,58 %) y DistilBERT (90,00 %) sobre el mismo conjunto de test.
- Prototipado de un clasificador de intenciones: puede adaptarse como plantilla para tareas de enrutamiento con cuatro clases en un entorno controlado antes de sustituirlo por un modelo entrenado con datos reales.
- Pruebas de integración de pipelines de `text-classification`: útil para validar el cableado de `transformers`, `pipeline()` y servicios de inferencia con un modelo pequeño y de descarga rápida (0,3 GB).
- Evaluación de robustez ante texto sintético: permite estudiar cómo se degrada un clasificador entrenado con datos generados cuando se le presentan mensajes redactados por personas.
- Ejercicio de análisis de errores: con solo 240 ejemplos de test, es viable inspeccionar manualmente las confusiones entre clases y discutir solapamientos entre `billing` y `account`, por ejemplo.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 240 tickets de test retenidos, con los tres métodos entrenados sobre los mismos 400 tickets:

| Método | Accuracy | Macro F1 |
|---|---:|---:|
| Etiqueta más frecuente | 28,75 % | 0,1117 |
| TF-IDF + regresión logística | 84,58 % | 0,8450 |
| DistilBERT completo (este modelo) | 90,00 % | 0,9007 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,3 GB de pesos, con picos de memoria adicionales por activaciones y batch; cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU de consumo (GTX 1650, RTX 3060, RTX 4090) es más que suficiente. En CPU, la inferencia por muestra es del orden de milisegundos.
- Cabe en GPU de consumo y en entornos sin GPU; también en instancias pequeñas de CPU en la nube.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchServe, FastAPI con `transformers`, o exportación a ONNX. vLLM y TGI no son adecuados para un encoder de clasificación de este tamaño; llama.cpp y Ollama están orientados a modelos generativos y no aplican.
- Latencia y throughput: no disponibles de forma medida; por el tamaño del modelo se espera un throughput alto en CPU y muy alto en GPU con batching, aunque no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| lakeshore-ticket-distilbert | 66,96 M | no disponible (base: 512) | Clasificación 4 clases | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66,96 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 109,48 M | 512 | Modelo base (MLM) | Apache 2.0 | Hugging Face |
| TF-IDF + regresión logística (baseline del autor) | no aplica | no aplica | Clasificación 4 clases | no aplica | Implementación propia |

La comparación relevante es con su modelo base y con el baseline lineal del propio autor: DistilBERT supera en 5,42 puntos de accuracy y 0,0557 de macro F1 al clasificador TF-IDF, a costa de un entrenamiento y una infraestructura más complejos. No se dispone de comparación con otros clasificadores de tickets publicados.

## Limitaciones y advertencias

- Los datos de entrenamiento son inventados; el propio autor advierte de que los tickets reales pueden usar otro lenguaje, contener varios problemas a la vez o carecer de detalle suficiente para un enrutamiento fiable.
- Riesgo alto de sobreajuste al dominio sintético y de degradación fuera de distribución; el conjunto de test (240 ejemplos) es demasiado pequeño para estimaciones estables.
- No debe introducirse información personal: el modelo no está diseñado ni evaluado para tratar datos sensibles.
- No debe usarse para enrutar tickets reales en producción, según la model card.
- Sesgos conocidos: no documentados; al entrenarse con texto generado, puede heredar los sesgos de distribución del generador.
- Limitaciones de idioma: entrenado en inglés y con vocabulario `uncased`; el rendimiento en castellano u otros idiomas no está evaluado.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero la licencia no subsana las limitaciones técnicas ni la advertencia del autor sobre el uso previsto.
- Al ser un encoder de clasificación, no genera explicaciones ni texto; cualquier justificación de la predicción requiere técnicas externas como SHAP o atención.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whois-tc/lakeshore-ticket-distilbert
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
