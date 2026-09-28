# sukh0i57/fake-news-distilbert

## Resumen

sukh0i57/fake-news-distilbert es un modelo de clasificación de secuencias publicado en HuggingFace por el usuario sukh0i57. Se trata de un ajuste fino (fine-tuning) de DistilBERT, la versión destilada de BERT, orientado previsiblemente a la detección binaria de noticias falsas ("fake news"), a juzgar por su nombre y por la etiqueta `distilbert` del repositorio. El modelo cuenta con 66.955.010 parámetros reales en formato safetensors y ocupa 0,3 GB en el repositorio.

DistilBERT es una arquitectura transformer encoder de 6 capas que reduce el tamaño de BERT-base en aproximadamente un 40 % manteniendo alrededor del 97 % de su rendimiento en tareas de comprensión del lenguaje, gracias a una destilación por conocimiento. Esto convierte a estos modelos en candidatos habituales para tareas de clasificación de texto con requisitos de latencia y cómputo moderados, como la verificación de artículos periodísticos o la moderación de contenidos.

La relevancia de este tipo de modelos radica en que la desinformación es un problema operativo real para medios, plataformas y equipos de moderación, y un clasificador DistilBERT ajustado puede desplegarse en CPU o en GPUs de gama baja con un coste muy reducido. Conviene señalar que la ficha del modelo está prácticamente vacía: no se declara pipeline, licencia, idiomas ni datos de entrenamiento, por lo que buena parte de las especificaciones de esta ficha figuran como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite estandar de DistilBERT; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors a precision completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es DistilBERT, un transformer encoder con 6 capas, dimensión oculta de 768, 12 cabezas de atención y aproximadamente 66 millones de parámetros, obtenido mediante destilación por conocimiento a partir de BERT-base durante la fase de preentrenamiento. Sobre esta base, el autor ha añadido presumiblemente una cabeza de clasificación de secuencias (sequence classification) para una tarea binaria, ya que el recuento de parámetros declarado (66.955.010) coincide con el de DistilBERT más una cabeza de clasificación de dos etiquetas.

No se dispone de información sobre el dataset de ajuste fino, el número de tokens de entrenamiento, la composición de los datos, la duración del entrenamiento ni si se aplicaron técnicas de alineación como RLHF o DPO. Por el nombre del modelo y por los proyectos comparables encontrados en la búsqueda web, es plausible que se haya entrenado para distinguir noticias falsas de noticias auténticas, pero esto no se puede confirmar con la información disponible. Tampoco se detalla ninguna innovación técnica específica más allá de la propia destilación de DistilBERT.

## Capacidades

- Clasificación de texto: el modelo está diseñado para tareas de clasificación de secuencias, previsiblemente clasificación binaria (falso/verdadero) de noticias o artículos.
- Análisis de contenido textual en inglés: al derivar de DistilBERT, el modelo base está preentrenado sobre todo en inglés, pero la ficha no confirma los idiomas soportados tras el ajuste.
- Extracción de representaciones: al ser un encoder, puede emplearse para obtener embeddings de frases o documentos.
- No se ha confirmado soporte de tool calling ni de function calling.
- No se ha confirmado soporte de agentes ni de razonamiento multi-paso.
- No se ha confirmado capacidad multilingüe.
- No se ha confirmado ninguna capacidad especial (modo thinking, visión o audio).

## Casos de uso

- Verificación de titulares en redacciones: el modelo puede clasificar titulares o entradillas como sospechosos de desinformación antes de su publicación, dado su bajo coste de inferencia y su tamaño reducido.
- Moderación de contenido en plataformas: integrado como filtro previo en un pipeline de moderación, permite marcar artículos o publicaciones para revisión humana sin necesidad de infraestructura GPU dedicada.
- Enriquecimiento de agregadores de noticias: como clasificador por lotes sobre grandes volúmenes de artículos, puede etiquetar automáticamente fuentes y piezas informativas.
- Investigación en desinformación: sirve como línea base (baseline) reproducible para comparar contra modelos mayores como BERT-base o RoBERTa en estudios académicos.
- Sistemas de alerta temprana: desplegado en un servicio ligero, puede puntuar contenidos entrantes en tiempo casi real y disparar alertas cuando la probabilidad de "falso" supera un umbral.
- Preprocesado en pipelines de RAG o búsqueda: sus embeddings pueden usarse para filtrar documentos poco fiables antes de indexarlos.
- Educación y verificación ciudadana: integrado en una interfaz web o bot, puede ofrecer una primera estimación sobre la fiabilidad de un texto introducido por el usuario.
- Despliegue en entornos con recursos limitados: al ser un modelo de 66 millones de parámetros, puede ejecutarse en CPU o en dispositivos de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas de precisión, recall, F1, exactitud ni evaluaciones sobre conjuntos de datos estándar de detección de desinformación (por ejemplo, ISOT, LIAR o FakeNewsNet).

## Requisitos de hardware

- VRAM estimada en FP32: alrededor de 270 MB solo para los pesos, más el consumo del runtime (típicamente por debajo de 1 GB en total).
- VRAM estimada en FP16: unos 134 MB para los pesos.
- VRAM estimada en INT8: unos 67 MB para los pesos.
- GPU recomendadas: cualquier GPU moderna es sobradamente suficiente; RTX 4090, RTX 3090, A100, H100 o incluso GPUs de gama de entrada como GTX 1650 o T4.
- Cabe en cualquier GPU de consumo actual e incluso en CPU; no requiere acelerador dedicado.
- Opciones de despliegue: HuggingFace Transformers (PyTorch), ONNX Runtime, TorchScript, y posiblemente conversión a formatos ligeros tipo CTranslate2. No se confirma soporte de llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponible. Dado el tamaño, se espera una latencia de pocos milisegundos por lote en GPU y de decenas de milisegundos en CPU, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sukh0i57/fake-news-distilbert | 66.955.010 | 512 tokens (DistilBERT) | Clasificacion binaria (presunta) | no disponible | HuggingFace |
| RamaAI/fake-news-distilbert | no disponible | 512 tokens (DistilBERT) | Deteccion de noticias falsas | no disponible | HuggingFace |
| sumukhi/fake-news-distilbert | no disponible | 512 tokens (DistilBERT) | Deteccion de noticias falsas | no disponible | HuggingFace |
| BERT-base (referencia) | 110.000.000 aprox. | 512 tokens | Clasificacion general | Apache 2.0 (base) | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas variantes, por lo que la comparación se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- La model card está vacía: no hay información sobre datos de entrenamiento, métricas de evaluación ni propósito previsto, lo que impide validar su fiabilidad.
- Sesgos conocidos: al derivar de DistilBERT, hereda los sesgos presentes en los corpus de preentrenamiento (Wikipedia y Toronto Book Corpus, mayoritariamente en inglés), que pueden trasladarse al dominio de las noticias.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas (falsos positivos y falsos negativos), especialmente si el dominio de los datos de ajuste difiere del de uso.
- Limitación de contexto: 512 tokens, por lo que artículos largos requieren truncado o segmentación, con la consiguiente pérdida de información.
- Limitación de idioma: la ficha no confirma los idiomas soportados; el modelo base está orientado al inglés y no hay garantía de buen rendimiento en castellano u otros idiomas.
- Restricciones de licencia: la licencia no está declarada, lo que impide confirmar si se permite el uso comercial. Debe consultarse con el autor antes de cualquier despliegue en producción.
- Caveat para producción: la ausencia de benchmarks y de pipeline declarado hace recomendable una validación propia sobre un conjunto de datos representativo antes de usar el modelo en un sistema real.
- El repositorio tiene 0 descargas y 1 "me gusta", lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sukh0i57/fake-news-distilbert
- Modelo comparable (RamaAI): https://huggingface.co/RamaAI/fake-news-distilbert
- Modelo comparable (sumukhi): https://huggingface.co/sumukhi/fake-news-distilbert
- Proyecto de detección de noticias falsas con DistilBERT (Emanmsl): https://github.com/Emanmsl/Fake_news_Detection
- Proyecto de detección de noticias falsas con DistilBERT (sanchitdangi): https://github.com/sanchitdangi/Fake_News_Detection
- Artículo científico sobre DistilBERT para detección de noticias falsas: https://www.sciencedirect.com/science/article/pii/S1877050925009470
