# SOTAagi2030/ledger-tone-classifier-xc8666

## Resumen

Ledger Tone Classifier es un modelo de clasificación de texto en inglés para análisis de sentimiento binario. Está desarrollado por el usuario SOTAagi2030 y publicado en Hugging Face bajo licencia Apache-2.0. El modelo recibe un texto corto y devuelve una etiqueta (`positive` o `negative`) junto con la confianza asociada a cada una de las dos clases. Por los tags del repositorio, la arquitectura subyacente es DistilBERT, una versión destilada de BERT con aproximadamente la mitad de parámetros que el modelo base.

El modelo está pensado para textos cortos en inglés, como reseñas de productos, conversaciones de soporte y publicaciones en redes sociales. La model card advierte explícitamente de que no está ajustado para otros idiomas ni para texto con sarcasmo marcado.

La relevancia de este modelo es limitada: se trata de un clasificador de sentimiento pequeño y especializado, sin datos publicados sobre volumen de entrenamiento, tokenizador o proceso de destilación. Su interés práctico reside en su ligereza (apto para inferencia en CPU y GPU de consumo) y en su licencia permisiva, que facilita su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT), según tags del repositorio |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (repositorio de transformers; probablemente safetensors o PyTorch bin, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder de tipo BERT reducido mediante destilación de conocimiento, con 6 capas frente a las 12 del BERT base. Esta arquitectura es habitual para tareas de clasificación de secuencias cortas y ofrece un buen equilibrio entre coste computacional y precisión en tareas de NLP clásicas. No se dispone de información sobre el número exacto de parámetros, la dimensión de las capas ocultas ni el tokenizador utilizado.

No se han publicado datos sobre el proceso de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si hubo ajuste fino supervisado, RLHF o DPO. La model card solo indica que el modelo se ha evaluado en seis conjuntos de benchmarks propios (Ledger Reviews, Harbor Tweets, Quill Forum, Meadow Replies, Cinder Notes y Tidewater Chats) y que existe una versión anterior (v1) con resultados inferiores.

## Capacidades

- Clasificación de sentimiento binaria en inglés: devuelve `positive` o `negative` con confianza para cada clase.
- Diseñado para textos cortos: reseñas de productos, chats de soporte y publicaciones sociales.
- Salida estructurada en JSON con etiqueta y confidencias, según el ejemplo de la model card.
- Compatible con la librería `transformers` y con el pipeline `text-classification`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No soporta visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no, solo inglés.

## Casos de uso

- Análisis de reseñas de productos: clasificar automáticamente reseñas cortas en inglés como positivas o negativas para agregar métricas de satisfacción en un panel de control. Adecuado por su entrenamiento orientado a textos breves y su bajo coste de inferencia.
- Triaje de tickets de soporte: etiquetar mensajes iniciales de clientes para priorizar aquellos con tono negativo y reducir el tiempo de respuesta en colas de atención.
- Monitorización de redes sociales: procesar publicaciones cortas en inglés y calcular la proporción de sentimiento negativo por marca o campaña en tiempo casi real.
- Moderación de comunidades: filtrar comentarios con tono negativo en foros y chats para revisión humana, usando la confianza de la predicción como umbral.
- Enrutamiento en chatbots: decidir si una conversación debe escalarse a un agente humano cuando el sentimiento detectado es negativo de forma sostenida.
- Análisis de encuestas abiertas: clasificar respuestas cortas de NPS o encuestas de satisfacción para generar informes agregados sin revisión manual.

## Benchmarks y rendimiento

Resultados publicados en la model card (exactitud como fracción de etiquetas correctas):

| Benchmark | v2 (actual) | v1 (archivada) |
|---|---|---|
| Ledger Reviews | 0.914 | 0.871 |
| Harbor Tweets | 0.864 | 0.846 |
| Quill Forum | 0.897 | 0.802 |
| Meadow Replies | 0.836 | 0.833 |
| Cinder Notes | 0.849 | 0.819 |
| Tidewater Chats | 0.903 | 0.790 |

No se dispone de comparación con modelos de referencia externos (MMLU, GLUE, SST-2 u otros) en la información proporcionada. Los benchmarks son propietarios del autor y no se especifica su tamaño, composición ni metodología de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión, pero al tratarse de un DistilBERT (arquitectura de ~66 M de parámetros en su versión estándar), la inferencia cabe holgadamente en menos de 1 GB de VRAM en FP32.
- GPU recomendadas: cualquier GPU de consumo moderna (RTX 3060, RTX 4090) es más que suficiente; también funciona en CPU para lotes pequeños.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 1-2 GB de memoria libre.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), servidores de inferencia compatibles con Hugging Face Endpoints, y exportación a ONNX si se requiere optimización (no confirmado en la model card).
- Latencia y throughput: no disponibles. Por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU y de decenas de milisegundos en CPU, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Benchmarks públicos |
|---|---|---|---|---|---|---|
| Ledger Tone Classifier | DistilBERT | no disponible | no disponible | en | Apache-2.0 | Solo benchmarks propios |
| DistilBERT base (Sanh et al.) | DistilBERT | ~66 M | 512 tokens | multilingüe (versión base: en) | Apache-2.0 | SST-2, GLUE |
| RoBERTa base | RoBERTa | ~125 M | 512 tokens | en | MIT | GLUE, SST-2 |
| CardiffNLP Twitter RoBERTa | RoBERTa | ~125 M | 512 tokens | en | no disponible | Sentiment140, TweetEval |

La comparación directa es difícil porque el modelo no publica resultados en benchmarks estándar de la comunidad. Frente a DistilBERT base, comparte arquitectura pero no se puede verificar si mejora su rendimiento en tareas públicas. Frente a RoBERTa, es previsiblemente más ligero pero también menos preciso en tareas generales de clasificación.

## Limitaciones y advertencias

- Solo inglés: no está entrenado ni evaluado para otros idiomas.
- No recomendado para sarcasmo: la model card lo advierte explícitamente.
- Sesgos desconocidos: no se documenta la composición del dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos, de dominio o de estilo.
- Riesgo de alucinación: no aplica en sentido estricto (es un clasificador, no un generador), pero puede producir etiquetas erróneas con alta confianza en dominios distintos a los de entrenamiento.
- Benchmarks propietarios: los resultados publicados (0.836-0.914) provienen de conjuntos del propio autor sin descripción metodológica; no son comparables con benchmarks estándar.
- Sin datos de entrenamiento: se desconoce el volumen, la fuente y el proceso de anotación, lo que dificulta evaluar la robustez en producción.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución, con obligación de incluir el aviso de licencia y el texto de atribución correspondiente.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de revisión por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SOTAagi2030/ledger-tone-classifier-xc8666
- Paper de DistilBERT (arquitectura de referencia): https://arxiv.org/abs/1910.01108
- Documentación de transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
