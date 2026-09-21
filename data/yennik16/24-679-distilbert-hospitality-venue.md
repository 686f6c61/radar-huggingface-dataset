# yennik16/24-679-distilbert-hospitality-venue

## Resumen

Este modelo es un clasificador binario de texto en inglés construido sobre DistilBERT (`distilbert-base-uncased`) y ajustado con AutoGluon `MultiModalPredictor` por el usuario yennik16. Su única tarea es determinar si una reseña del sector de hostelería describe un restaurante (etiqueta 0) o un hotel (etiqueta 1). No es un modelo generativo ni un analizador de sentimiento: no puntúa la calidad, no evalúa la veracidad del contenido ni atribuye autoría.

Se trata de un artefacto de curso (Homework 2 de la asignatura *Designing with AI*, 24-679) cuyo objetivo declarado es demostrar el ajuste fino de un transformer compacto sobre un conjunto de datos pequeño. El backbone tiene 66.364.418 parámetros, todos entrenables en el ajuste completo, y la entrada se trunca a 256 tokens subword con el tokenizador WordPiece de `distilbert-base-uncased`. El entrenamiento usó 70 reseñas originales y 980 variantes sintéticas de aumento, con una partición de validación de solo 15 reseñas.

Su relevancia práctica es limitada y acotada: con 0 descargas y 0 likes en el momento de la consulta, es un ejemplo metodológico de ajuste fino en régimen de pocos datos y de comparación entre ajuste completo y variantes PEFT (`bit_fit`, `norm_fit`), no un componente listo para producción. Resulta útil como referencia reproducible (semilla 24679) para quien diseñe pipelines de clasificación de reseñas con restricciones de cómputo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, `distilbert-base-uncased`) con cabeza de clasificación binaria |
| Parámetros totales | 66.364.418 parámetros entrenables en el ajuste completo (100,000 %) según la model card |
| Longitud de contexto | 256 tokens subword (truncado por AutoGluon); el backbone DistilBERT admite hasta 512 posiciones |
| Tipos de cuantización | No disponible (no se publican pesos cuantizados) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | `other` / `see-source-dataset` (remite a la licencia del dataset de origen; no se especifica una licencia propia) |
| Formato de pesos | No disponible (repositorio de AutoGluon, 0,3 GB; no se documenta `safetensors`, GGUF ni ONNX) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DistilBERT de 6 capas con tokenizador WordPiece, envuelto por `MultiModalPredictor` de AutoGluon (`autogluon.multimodal==1.6.1`) con `problem_type="binary"`, `eval_metric="accuracy"` y `model.names=["hf_text"]` (solo el encoder de texto). El ajuste es completo: `optim.peft = None`, con 66.364.418 de 66.364.418 parámetros entrenables. Hiperparámetros: 50 épocas, batch size 16, learning rate 2e-05, weight decay 0,01, `optim.lr_choice="layerwise_decay"`, validación tras cada época y conservación del checkpoint con mejor accuracy de validación (`optim.top_k=1`, `top_k_average_method="best"`). La semilla 24679 se usó para la construcción de los pliegues, la sonda de ruido y todos los ajustes.

Los datos proceden del dataset `kwongnon/2026-24679-text-dataset`, empaquetado por un compañero de clase; no es un dataset propio del autor. La partición de entrenamiento contiene 70 reseñas originales (35 de restaurante y 35 de hotel) y 980 variantes sintéticas (14 por original, 525 por clase). Validación y test contienen 15 reseñas originales cada uno (7/8 y 8/7 por clase respectivamente) y ninguna fila sintética. La augmentación se aplicó offline solo a los padres de entrenamiento mediante swaps internos de caracteres, deleciones y duplicaciones, cambios de mayúsculas, intercambios de palabras dentro de la línea, duplicación de palabras, inserción y eliminación de puntuación y ruido de erratas mixto, con una tasa de edición de caracteres del 8 % de las palabras elegibles, tope de 3 palabras editadas por reseña y sin apilar transformaciones sobre texto ya generado. La augmentación aleatoria propia de AutoMM se desactivó (`model.hf_text.text_trivial_aug_maxscale = 0.0`). No se menciona RLHF ni DPO: es aprendizaje supervisado puro sobre etiquetas binarias.

## Capacidades

- Clasificación binaria de texto en inglés: distingue reseñas de restaurante (0) frente a reseñas de hotel (1).
- Manejo de entradas de hasta 256 tokens subword, suficiente para reseñas de longitud corta o media.
- Tolerancia parcial a ruido tipográfico, heredada del pipeline de augmentación con el que se generaron las variantes de entrenamiento.
- Inferencia sobre CPU o GPU modesta, dado el tamaño reducido del modelo.
- No genera texto: no hay decodificación autoregresiva, resumen, traducción ni respuesta a instrucciones.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes, planificación ni razonamiento multi-paso.
- No tiene modo de pensamiento (*thinking*), visión, audio ni multimodalidad.
- No es multilingüe: está entrenado y etiquetado únicamente en inglés.
- Salida limitada a la categoría de establecimiento; no produce sentimiento, puntuación de calidad, veracidad ni atribución de autoría.

## Casos de uso

- Enrutado de reseñas en un CRM o mesa de ayuda: clasificar cada reseña entrante como hotel o restaurante para dirigirla automáticamente al equipo de negocio correspondiente; el coste por inferencia es mínimo al tratarse de un modelo de 66 millones de parámetros.
- Curación de datasets con anotación asistida: pre-etiquetar volúmenes grandes de reseñas de hostelería y enviar solo los casos dudosos a revisión humana, reduciendo el coste de anotación manual.
- Construcción de subconjuntos filtrados para investigación: separar corpus de reseñas por vertical (hotel frente a restaurante) antes de entrenar o evaluar otros modelos.
- Analítica de mercado y segmentación de opiniones: agregar reseñas por tipo de establecimiento para alimentar cuadros de mando sectoriales, siempre con validación previa sobre datos propios.
- Auditoría de etiquetado: usar el clasificador como segunda opinión sobre etiquetas ya asignadas en un pipeline existente, con revisión humana obligatoria de las discrepancias.
- Material docente reproducible: sirve como plantilla metodológica para comparar ajuste completo frente a PEFT en escenarios de pocos datos, dado que la model card documenta las seis configuraciones probadas y fija una semilla.
- Demostración de despliegue en el borde o en CPU: por su tamaño, puede integrarse en un servicio interno sin GPU dedicada para tareas de triaje de bajo riesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta métricas de validación sobre 15 reseñas, calculadas durante la comparación de configuraciones. Al ser una partición de 15 ejemplos, cada acierto equivale a 6,7 puntos porcentuales, de modo que las diferencias pequeñas entre filas no son concluyentes.

| Datos de entrenamiento | Modo de ajuste | Épocas | Filas de entrenamiento | Parámetros entrenables | % entrenable | Accuracy validación | F1 ponderado validación |
|---|---|---|---|---|---|---|---|
| Solo originales | full | 50 | 70 | 66.364.418 | 100,000 | 0,9333 | 0,9333 |
| Con aumentados | full | 5 | 1050 | 66.364.418 | 100,000 | 0,9333 | 0,9333 |
| Con aumentados | norm_fit | 5 | 1050 | 62.978 | 0,0949 | 0,7333 | 0,7333 |
| Con aumentados | bit_fit | 5 | 1050 | 52.994 | 0,0799 | 0,6667 | 0,6637 |
| Solo originales | bit_fit | 50 | 70 | 52.994 | 0,0799 | 0,6000 | 0,5045 |
| Solo originales | norm_fit | 50 | 70 | 62.978 | 0,0949 | 0,6000 | 0,5045 |

El modelo conservado es el de ajuste completo; no se reportan métricas sobre la partición de test ni resultados de la sonda de similitud TF-IDF más allá del dato de que 0 de 15 reseñas de test superaron una similitud coseno de 0,35 con alguna reseña original de entrenamiento.

## Requisitos de hardware

- VRAM estimada (solo pesos, cálculo a partir del número de parámetros): unos 265 MB en fp32, unos 133 MB en fp16/bf16 y unos 66 MB en int8. Sumando activaciones y sobrecarga del runtime, la inferencia debería mantenerse por debajo de 1 GB en la práctica.
- GPU recomendadas: no se requiere hardware de centro de datos; cualquier GPU con más de 2 GB de memoria es suficiente. A100 o H100 no aportan ventaja práctica para este tamaño.
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas integradas y de gama de entrada, y también en CPU. No se documentan requisitos específicos en la model card.
- Opciones de despliegue: el repositorio usa el formato de AutoGluon (`autogluon.multimodal==1.6.1`, `MultiModalPredictor`). Es exportable en principio a PyTorch/Transformers, aunque la model card no documenta el procedimiento. No hay pesos GGUF, por lo que llama.cpp y Ollama no son aplicables tal cual; no se documenta compatibilidad con vLLM, TGI ni ONNX.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros clasificadores de reseñas, porque la model card no incluye benchmarks sobre la partición de test ni referencias externas. La comparación más cercana disponible es interna al propio experimento, entre configuraciones del mismo backbone:

| Configuración | Parámetros entrenables | Contexto | Licencia | Accuracy validación | Disponibilidad |
|---|---|---|---|---|---|
| DistilBERT, ajuste completo (modelo publicado) | 66.364.418 (100 %) | 256 tokens | `other` / `see-source-dataset` | 0,9333 | Repositorio de 0,3 GB en HuggingFace |
| DistilBERT, `norm_fit` | 62.978 (0,0949 %) | 256 tokens | Igual (mismo backbone) | 0,7333 con aumentados / 0,6000 con originales | Solo documentado, no publicado |
| DistilBERT, `bit_fit` | 52.994 (0,0799 %) | 256 tokens | Igual (mismo backbone) | 0,6667 con aumentados / 0,6000 con originales | Solo documentado, no publicado |
| Otros clasificadores de texto de tamaño similar (BERT-base, RoBERTa-base, etc.) | No disponible | No disponible | No disponible | No disponible | No evaluados en la información proporcionada |

## Limitaciones y advertencias

- Base de datos muy pequeña: 70 reseñas originales de entrenamiento y 15 de validación. Cada ejemplo de validación vale 6,7 puntos porcentuales, por lo que la accuracy de 0,9333 tiene un intervalo de confianza muy amplio.
- Riesgo de solapamiento de establecimientos entre particiones: la model card del dataset indica que no se usó ninguna identidad de autor, cliente, hotel o restaurante como clave de agrupación, de modo que reseñas del mismo establecimiento pueden repartirse entre entrenamiento, validación y test. La sonda TF-IDF (0 de 15 reseñas de test por encima de 0,35 de similitud coseno con el entrenamiento) acota el riesgo, pero no lo descarta.
- Dependencia de datos sintéticos: 980 de las 1050 filas de entrenamiento son variantes generadas. La sonda de ruido del autor no llega a documentarse por completo en la información disponible.
- Idiomas: solo inglés. No hay evaluación en castellano ni en ningún otro idioma.
- Alcance funcional: el modelo únicamente predice la categoría de establecimiento. No detecta sentimiento, no puntúa calidad y no verifica la veracidad del contenido. Usarlo para decisiones sobre clientes, trabajadores o negocios contradice la advertencia explícita de la model card del dataset de origen.
- Licencia: figura como `other` con nombre `see-source-dataset`, lo que remite a la licencia del dataset `kwongnon/2026-24679-text-dataset`. Antes de cualquier uso comercial es obligatorio revisar esa licencia; no se concede aquí ningún permiso explícito de uso comercial.
- Origen académico: es un trabajo de curso, sin mantenimiento declarado, con 0 descargas y 0 likes en el momento de la consulta y sin métricas de test publicadas.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es una clasificación errónea confiada, especialmente en reseñas que mencionan ambos tipos de establecimiento o que son ambiguas.
- No se documentan medidas de mitigación de sesgos demográficos o geográficos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yennik16/24-679-distilbert-hospitality-venue
- Dataset de origen: https://huggingface.co/datasets/kwongnon/2026-24679-text-dataset
- Backbone: `distilbert-base-uncased` (referenciado en la model card; no se incluye enlace en la información proporcionada)
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo. Las páginas devueltas por la búsqueda corresponden a portales de resultados deportivos en directo (livesport.cz, livesport.com) y no guardan relación con este modelo.
