# YY80813/pubmedbert-fake-health-news

## Resumen

El modelo `YY80813/pubmedbert-fake-health-news` es un ajuste fino (fine-tuning) de PubMedBERT orientado a la clasificación de texto, concretamente a la detección de noticias falsas relacionadas con la salud. Ha sido publicado por el usuario YY80813, que mantiene un repositorio en GitHub con el mismo propósito (`fake-health-news-detection`). El modelo emplea una arquitectura BERT (encoder-only) con 109.483.778 parámetros, lo que lo sitúa en la gama de los modelos BERT base. Su pipeline declarado es `text-classification` y los pesos están en formato `safetensors`.

La relevancia de este modelo radica en su especialización en el dominio biomédico: al partir de PubMedBERT, que fue preentrenado con abstracts de PubMed, el ajuste fino para detectar noticias falsas de salud aprovecha el conocimiento previo del lenguaje médico. Sin embargo, la model card es prácticamente vacía: no se especifican datos de entrenamiento, métricas de evaluación, licencia ni idiomas soportados. Esto limita su uso directo en producción sin una validación adicional por parte del desarrollador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder-only) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura BERT original, un transformer encoder-only de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención, tal como corresponde a un BERT base. El tag `arxiv:1910.09700` enlaza con el artículo de PubMedBERT, que describe un preentrenamiento específico sobre textos biomédicos (abstracts de PubMed y artículos de PMC). El ajuste fino posterior para clasificación de noticias falsas de salud no está documentado en la model card: se desconocen el dataset utilizado, el número de épocas, la estrategia de optimización o si se aplicaron técnicas como aumento de datos o regularización. El repositorio de GitHub del autor (`YY80813/fake-health-news-detection`) sugiere que el proyecto incluye un sistema completo de detección, pero no se proporcionan detalles técnicos adicionales en la información disponible.

## Capacidades

- Clasificacion de texto binaria: el modelo está diseñado para distinguir entre noticias de salud falsas y verdaderas, aunque la etiqueta exacta de salida no se especifica en la documentación.
- Especializacion en dominio biomedico: al derivar de PubMedBERT, el modelo tiene una representacion del lenguaje medico superior a la de un BERT generico, lo que puede mejorar la precision en textos con terminologia clinica.
- Compatible con la libreria `transformers` y con `text-embeddings-inference`, lo que permite su uso tanto para clasificacion como para generar embeddings de frases.
- No se documentan capacidades de generacion de texto, tool calling, agentes ni multimodalidad.

## Casos de uso

- Moderacion de contenido en portales de salud: el modelo puede integrarse en un pipeline que analice articulos enviados por usuarios o fuentes externas y marque aquellos que presenten indicios de desinformacion sanitaria, reduciendo la carga de revision manual.
- Verificacion automatizada de noticias en redes sociales: dado su enfoque en salud, puede utilizarse como primer filtro en sistemas de fact-checking que monitoricen publicaciones sobre tratamientos, vacunas o remedios caseros.
- Asistencia a periodistas cientificos: los redactores pueden emplear el modelo para pre-evaluar la fiabilidad de fuentes antes de publicar, aunque siempre con supervisión humana.
- Investigacion academica sobre desinformacion: el modelo sirve como punto de partida para estudios comparativos de tecnicas de deteccion de fake news en el ambito medico, o como baseline en nuevos experimentos.
- Clasificacion de documentos en bibliotecas digitales: instituciones que archivan literatura de salud pueden etiquetar automaticamente documentos sospechosos de contener informacion no contrastada.
- Desarrollo de extensiones de navegador: una extension que analice el contenido de paginas web sobre salud y muestre una advertencia si el texto es clasificado como potencialmente falso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud, F1, AUC ni comparaciones con otros modelos. Tampoco se encontraron evaluaciones externas en los resultados de busqueda web. Por tanto, no es posible cuantificar el rendimiento real del modelo en la tarea de deteccion de noticias falsas de salud.

## Requisitos de hardware

- VRAM estimada para inferencia: con 109 millones de parametros, el modelo en precision fp32 ocupa aproximadamente 440 MB de memoria, y en fp16 unos 220 MB. Esto permite ejecutarlo en GPUs con 2 GB de VRAM o incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM es suficiente, incluyendo NVIDIA GTX 1650, RTX 3060, o superiores. Tambien es viable en Apple Silicon con Metal.
- Compatibilidad con hardware de consumo: si, el modelo cabe en practicamente cualquier GPU de consumo actual e incluso en entornos sin GPU, usando CPU con una latencia aceptable para clasificacion de textos cortos.
- Opciones de despliegue: al ser un modelo de la familia BERT, puede servirse con `vLLM` (aunque esta optimizado para decodificacion, tambien soporta encoder-only), `TGI` (Text Generation Inference), `Ollama` (si se convierte a GGUF) o directamente con `transformers` y `torch`. Tambien es compatible con `text-embeddings-inference` para generar embeddings.
- Latencia y throughput estimados: no se dispone de mediciones oficiales. En una GPU moderna, la inferencia sobre un texto de 128 tokens deberia completarse en menos de 10 ms, permitiendo cientos de peticiones por segundo en un servidor con batching.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YY80813/pubmedbert-fake-health-news | 109 M | no disponible | Clasificacion de noticias falsas de salud | no disponible | HuggingFace |
| PubMedBERT (base) | 110 M | 512 tokens | Modelo base biomedico | MIT | HuggingFace |
| BERT base (uncased) | 110 M | 512 tokens | Modelo base generico | Apache 2.0 | HuggingFace |
| BioBERT (base) | 110 M | 512 tokens | Modelo base biomedico | Apache 2.0 | HuggingFace |

La comparativa se limita a modelos base porque no se han encontrado otros modelos especificamente entrenados para deteccion de noticias falsas de salud con caracteristicas publicas. El modelo de YY80813 se diferencia por su ajuste fino a la tarea concreta, pero carece de documentacion sobre su rendimiento relativo.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, datos de entrenamiento ni procedencia de las etiquetas, por lo que no es posible evaluar posibles sesgos hacia ciertos tipos de contenido o fuentes.
- Al ser un modelo encoder-only, no genera explicaciones ni justificaciones de sus predicciones, lo que limita su uso en contextos donde se requiera trazabilidad.
- El riesgo de alucinacion no aplica en el sentido generativo, pero si puede producir falsos positivos o negativos en la clasificacion, especialmente con textos fuera del dominio de entrenamiento.
- La licencia es "no disponible", lo que impide conocer si su uso comercial esta permitido. Se recomienda contactar con el autor antes de integrarlo en productos comerciales.
- No se especifican los idiomas soportados; aunque PubMedBERT esta entrenado principalmente en ingles, el ajuste fino podria haber utilizado datos en otros idiomas, pero no hay confirmacion.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que no ha sido validado por la comunidad y su fiabilidad es incierta.

## Enlaces

- HuggingFace: https://huggingface.co/YY80813/pubmedbert-fake-health-news
- Repositorio GitHub del autor: https://github.com/YY80813
- Repositorio del proyecto: https://github.com/YY80813/fake-health-news-detection
- Paper de PubMedBERT (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
- Articulo de Nature sobre deteccion de noticias falsas con BERT y GNN: https://www.nature.com/articles/s41598-025-05586-w
- Paper comparativo de modelos BERT-like para fake news: https://arxiv.org/abs/2412.14276
