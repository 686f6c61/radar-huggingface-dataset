# tiaratania08/indobert-klasifikasi-berita

## Resumen

`tiaratania08/indobert-klasifikasi-berita` es un modelo de clasificación de texto en indonesio obtenido mediante fine-tuning de IndoBERT (`indobenchmark/indobert-base-p1`) sobre un corpus de noticias. Resuelve una tarea concreta: asignar cada noticia a una de cinco categorías temáticas (Ekonomi, Hukum, Olahraga, Pendidikan y Politik). El autor publica el modelo bajo licencia MIT, con pesos en safetensors y pipeline declarado `text-classification`.

Se trata de un transformer encoder de tipo BERT-base con 124.445.189 parámetros totales (aproximadamente 124 M), un tamaño que lo sitúa en la gama de modelos compactos: es ejecutable en CPU y en GPUs de gama de entrada, y su ajuste fino es asequible en una única GPU consumer. El repositorio ocupa 1,0 GB.

Su relevancia es práctica más que arquitectónica: no introduce innovaciones técnicas, pero ofrece un clasificador temático con métricas declaradas altas (92,00 % de accuracy y 91,52 % de macro F1) para un idioma con menos recursos y menos modelos ajustados disponibles que el inglés. Para proyectos de medios, monitorización de prensa o investigación en PLN indonesio, sirve como punto de partida directo sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (IndoBERT-base-p1) |
| Parametros totales | 124.445.189 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card (la configuracion base de IndoBERT-base-p1 emplea 512 posiciones, valor habitual de BERT-base; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors, sin versiones GGUF, ONNX ni cuantizadas |
| Idiomas soportados | Indonesio (id) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |
| Tarea | Clasificacion de texto multi-clase (5 categorias) |
| Categorias | Ekonomi, Hukum, Olahraga, Pendidikan, Politik |
| Tamano del repositorio | 1,0 GB |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder estándar de la familia BERT en su variante base, concretamente la inicialización `indobenchmark/indobert-base-p1`, un modelo preentrenado específicamente para indonesio. El modelo resultante conserva la cabeza de clasificación sobre el token `[CLS]` con cinco salidas, correspondientes a las categorías Ekonomi, Hukum, Olahraga, Pendidikan y Politik.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del corpus de noticias empleado, ni si se aplicaron etapas de ajuste con RLHF o DPO. Tampoco se especifican hiperparámetros de fine-tuning, técnica de regularización ni el procedimiento exacto de validación cruzada. Lo único documentado del proceso es el esquema de evaluación: se reportan métricas sobre una partición de validación y una validación cruzada de 5 folds, cuyo mejor resultado se obtuvo en el fold 4 con un 93,18 % de accuracy. No se describe ninguna innovación técnica adicional (atención lineal, decodificación especulativa, mezcla de expertos o mecanismos híbridos).

## Capacidades

- Clasificación de texto multi-clase: asigna una noticia a una de cinco categorías temáticas (Ekonomi, Hukum, Olahraga, Pendidikan, Politik).
- Procesamiento de texto en indonesio, idioma para el que fue preentrenado el modelo base.
- Inferencia sobre secuencias de entrada tipo documento corto o párrafo, adecuada para titulares, entradillas y cuerpos de noticia de longitud moderada.
- Uso como extractor de representaciones contextuales (embeddings de la capa oculta) para tareas auxiliares como clustering temático o búsqueda semántica, si se reutiliza el encoder sin la cabeza de clasificación.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte para agentes ni razonamiento multi-paso; es un modelo discriminativo, no generativo.
- No se documentan capacidades multimodales (visión, audio) ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Clasificación automática en agregadores de noticias: cada artículo entrante se etiqueta en una de las cinco categorías antes de publicarse, lo que permite organizar portadas, secciones y feeds sin intervención editorial manual.
- Enrutado editorial en redacciones digitales: el modelo sugiere la sección o el editor responsable de cada pieza, reduciendo el tiempo de triaje de contenido en medios con alto volumen diario de publicaciones.
- Monitorización de medios y análisis de reputación: una agencia o departamento de comunicación clasifica menciones en prensa indonesia para medir el peso relativo de coberturas económicas, políticas o judiciales sobre una marca o institución.
- Detección y seguimiento de noticias judiciales: el filtrado de la categoría Hukum permite construir alertas específicas sobre casos de corrupción, procesos penales o resoluciones judiciales, útil para equipos legales y de compliance.
- Sistemas de recomendación de contenido: la categoría asignada actúa como señal de perfilado para sugerir artículos relacionados o construir secciones personalizadas por interés temático.
- Pre-filtrado en pipelines de RAG: clasificar los documentos antes de indexarlos permite enrutar cada consulta a un subconjunto de categoría relevante, reduciendo el espacio de búsqueda y el coste de recuperación en un corpus heterogéneo.
- Analítica de tendencias para investigación de mercado: agregar la distribución de categorías a lo largo del tiempo sobre un archivo de prensa permite detectar cambios de agenda (por ejemplo, aumento sostenido de piezas económicas frente a políticas).
- Baseline académico para PLN en indonesio: sirve como referencia reproducible en experimentos de clasificación temática, al estar disponible públicamente con licencia permisiva y métricas declaradas.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo:

| Metrica | Valor |
|---|---|
| Accuracy | 92,00 % |
| Macro recall | 91,68 % |
| Macro precision | 91,56 % |
| Macro F1-score | 91,52 % |
| Validacion cruzada 5-fold (mejor fold, fold 4) | 93,18 % |

No se han publicado en la información disponible los resultados desglosados por clase, la matriz de confusión, el tamaño del conjunto de evaluación ni comparaciones con otros modelos sobre el mismo corpus. Tampoco se aportan resultados de benchmarks generales (MMLU, GLUE, IndoNLU, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 500 MB con pesos en FP32 y alrededor de 250 MB en FP16, más el overhead del runtime (valores derivados del recuento de parámetros, no publicados por el autor).
- Cabe en cualquier GPU consumer, incluidas tarjetas de gama de entrada con 4 GB o menos; también es viable la inferencia en CPU para volúmenes moderados.
- Ajuste fino: una GPU consumer de gama media-alta (RTX 3060 12 GB, RTX 4070/4090) es suficiente con batch pequeño y precisión mixta; para lotes grandes o entrenamiento más rápido, A100 o H100 no son necesarias pero reducen el tiempo.
- Opciones de despliegue: Hugging Face Transformers con `pipeline("text-classification")`, exportación a ONNX Runtime para inferencia en CPU con mayor throughput, TorchServe, Triton Inference Server o un servicio FastAPI propio. vLLM, llama.cpp y Ollama no están orientados a modelos encoder de clasificación, por lo que no son la vía recomendada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.
- Almacenamiento: el repositorio ocupa 1,0 GB, aunque los pesos en FP32 del modelo base rondan los 500 MB; conviene verificar si el repositorio incluye artefactos adicionales.

## Comparativa con modelos similares

La información disponible no incluye comparaciones de rendimiento con otros modelos. La tabla siguiente recoge alternativas de la misma categoría (clasificación de texto en indonesio o multilingüe) con los datos de parámetros como referencia general; los valores de parámetros de los modelos alternativos no proceden de la información proporcionada y deben verificarse en sus respectivas fichas.

| Modelo | Parametros | Contexto | Rendimiento en esta tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `tiaratania08/indobert-klasifikasi-berita` | 124,4 M | No disponible | Accuracy 92,00 %, macro F1 91,52 % | MIT | HuggingFace |
| `indobenchmark/indobert-base-p1` (modelo base) | ~124 M (referencia) | 512 tokens (referencia) | No ajustado a esta tarea | No disponible en la informacion | HuggingFace |
| BERT multilingue (`bert-base-multilingual-cased`) | ~178 M (referencia) | 512 tokens (referencia) | No disponible | No disponible en la informacion | HuggingFace |
| XLM-RoBERTa base | ~278 M (referencia) | 512 tokens (referencia) | No disponible | No disponible en la informacion | HuggingFace |

No se dispone de datos que permitan afirmar qué alternativa rinde mejor en la clasificación de noticias indonesias en cinco categorías.

## Limitaciones y advertencias

- Modelo discriminativo: no genera texto ni mantiene conversaciones; solo asigna una etiqueta de categoría.
- Sesgos conocidos: no se documenta ninguna auditoría de sesgo. Al entrenarse sobre noticias, puede heredar el desequilibrio temático y la línea editorial del corpus utilizado, con posible sobrerrepresentación de las categorías más frecuentes en prensa.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en textos ambiguos, irónicos o que mezclan varios temas (por ejemplo, una noticia política con contenido económico).
- Cobertura de clases cerrada: el modelo solo distingue cinco categorías. Cualquier noticia de otra temática (tecnología, cultura, internacional, deportes minoritarios) será forzada a una de las cinco etiquetas.
- Limitación de idioma: está entrenado únicamente para indonesio. El rendimiento con malayo, textos mixtos indonesio-inglés o traducciones automáticas no está documentado y previsiblemente se degrada.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright. No obstante, la licencia del modelo base (`indobert-base-p1`) debe verificarse de forma independiente antes de un despliegue comercial.
- Trazabilidad limitada: el autor no publica el dataset de entrenamiento, la partición de evaluación, la matriz de confusión ni los hiperparámetros, por lo que las métricas declaradas no son reproducibles ni auditables.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.
- Longitud de entrada: la model card no especifica la ventana máxima soportada; las noticias largas podrían requerir truncado, con pérdida de información relevante.
- Despliegue: al ser un modelo encoder, queda fuera del ecosistema de servidores optimizados para modelos generativos (vLLM, llama.cpp, Ollama), lo que obliga a usar Transformers, ONNX Runtime o soluciones propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tiaratania08/indobert-klasifikasi-berita
- Modelo base IndoBERT-base-p1: https://huggingface.co/indobenchmark/indobert-base-p1
- Paper de referencia del modelo base (IndoNLU, Wilie et al., 2020; enlace no verificado en la busqueda web): https://arxiv.org/abs/2009.05332
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos enlaces disponibles son los de HuggingFace indicados arriba.
