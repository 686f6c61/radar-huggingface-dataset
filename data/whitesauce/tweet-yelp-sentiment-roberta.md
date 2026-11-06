# whitesauce/tweet-yelp-sentiment-roberta

## Resumen

`whitesauce/tweet-yelp-sentiment-roberta` es un modelo de clasificación de texto basado en la arquitectura RoBERTa, publicado por el usuario whitesauce en Hugging Face. Por su nombre y su pipeline (`text-classification`), está orientado al análisis de sentimiento sobre textos cortos e informales, presumiblemente reseñas de Yelp y tuits. El repositorio cuenta con 124.647.939 parámetros en formato safetensors y un tamaño aproximado de 0,5 GB, lo que lo sitúa en la categoría de los encoders de tamaño base (equivalente a `roberta-base`).

La relevancia de este modelo es limitada en el momento de la publicación: no registra descargas ni likes, la model card es la plantilla autogenerada por Hugging Face sin contenido sustantivo y no se declaran ni licencia ni idiomas soportados. Se trata, por tanto, de un artefacto de fine-tuning cuyo valor práctico depende enteramente de la validación que haga el usuario, ya que el autor no documenta datos de entrenamiento, hiperparámetros ni evaluación.

Al ser un encoder de clasificación y no un modelo generativo, no dispone de ventana de contexto en el sentido de los LLM, sino de una longitud máxima de secuencia de tokens de entrada, que el autor no especifica (RoBERTa base admite típicamente 512 tokens posicionales).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, referenciado vía `arxiv:1910.09700`) |
| Parametros totales | 124.647.939 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite hasta 512 posiciones; el autor no lo declara) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura RoBERTa, un transformer encoder con atención bidireccional completa, preentrenado originalmente con objetivos de masked language modeling sobre corpus web de gran escala (el tag `arxiv:1910.09700` apunta al artículo de Liu et al., 2019, "RoBERTa: A Robustly Optimized BERT Pretraining Approach"). El recuento de 124,6 millones de parámetros coincide con la configuración `roberta-base`, lo que sugiere que se parte de ese checkpoint y se aplica un fine-tuning sobre una cabeza de clasificación (probablemente con dos o más etiquetas de sentimiento).

No hay información en la model card sobre el conjunto de datos de fine-tuning, el número de ejemplos, la composición del corpus (tuits, reseñas de Yelp u otros), los hiperparámetros, la precisión mixta utilizada ni si se aplicaron técnicas como DPO o RLHF (inhabituales en clasificadores). Tampoco se documenta ninguna innovación técnica adicional: es un fine-tuning estándar de un encoder preentrenado.

## Capacidades

- Clasificación de texto: asignación de una etiqueta de sentimiento (polaridad) a una secuencia de entrada corta.
- Análisis de sentimiento en dominios informales: el nombre del modelo sugiere entrenamiento sobre tuits y reseñas de Yelp, con posible manejo de lenguaje coloquial, abreviaturas y emoticonos.
- Inferencia por lotes: al ser un encoder de ~125 M de parámetros, permite procesar grandes volúmenes de textos con bajo coste computacional.
- Extracción de embeddings: la torre RoBERTa puede reutilizarse como extractor de representaciones (el tag `text-embeddings-inference` indica compatibilidad con ese servidor).
- Compatibilidad con `transformers` y con endpoints de Hugging Face (`endpoints_compatible`).
- No soporta generación de texto, tool calling, razonamiento multi-paso, visión, audio ni modo "thinking": es un clasificador discriminativo.

## Casos de uso

- Monitorización de reputación en redes sociales: clasificar en tiempo real miles de tuits mencionando una marca y agregar la polaridad por franja horaria; el tamaño reducido del modelo permite desplegarlo en una sola GPU o incluso en CPU con latencia de milisegundos por lote.
- Análisis de reseñas de plataformas locales (Yelp, Google Maps, TripAdvisor): etiquetar automáticamente reseñas como positivas o negativas para alimentar dashboards de satisfacción por local o ciudad.
- Enrutado de tickets de soporte: usar la polaridad detectada para priorizar quejas negativas hacia agentes humanos antes que comentarios neutros o positivos.
- Filtrado de feedback en encuestas abiertas: procesar respuestas de texto libre (NPS, CSAT) y agrupar por sentimiento para informes periódicos sin revisión manual.
- Investigación en ciencias sociales: analizar corpus históricos de tuits o reseñas con un clasificador ligero y reproducible, siempre que se valide previamente su precisión en el dominio concreto.
- Componente en pipelines de destilación o ensemble: servir como clasificador base rápido sobre el que comparar modelos más grandes o como etiquetador débil para generar datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación (accuracy, F1, matriz de confusión) ni comparaciones con otros clasificadores.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,5 GB en fp32 (124,6 M de parámetros × 4 bytes ≈ 0,5 GB), ~0,25 GB en fp16 y ~0,13 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sobradamente en T4, RTX 3060, RTX 4090, A10, A100 y H100. También es viable en CPU para lotes moderados.
- Cabe en cualquier GPU de consumo actual e incluso en Raspberry Pi o entornos embebidos con cuantización int8.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` (según tag), ONNX Runtime, TorchScript, y exportación a GGUF/llama.cpp no documentada por el autor. vLLM y TGI no están optimizados para clasificadores encoder-only, aunque TGI soporta algunos modelos de clasificación.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, se espera un throughput del orden de miles de secuencias por segundo en GPU moderna con batch grande, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whitesauce/tweet-yelp-sentiment-roberta | 124,6 M | no disponible (RoBERTa base: 512) | Clasificación de sentimiento | no disponible | Hugging Face |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125 M | 512 | Sentimiento en tuits (3 clases) | MIT (según su card) | Hugging Face |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 | Sentimiento binario (SST-2) | Apache 2.0 | Hugging Face |
| finiteautomata/bertweet-base-sentiment-analysis | ~135 M | 128 | Sentimiento en tuits | MIT | Hugging Face |

La comparación es aproximada: los tres alternativos son clasificadores de sentimiento ampliamente usados y con documentación completa, mientras que el modelo analizado carece de métricas publicadas, lo que impide una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Ausencia total de documentación: la model card es una plantilla sin rellenar; no se conocen datos de entrenamiento, etiquetas, hiperparámetros ni evaluación.
- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de integrarlo en producción.
- Idiomas no declarados: aunque el nombre sugiere inglés (tuits y Yelp), no hay confirmación; el rendimiento en castellano es desconocido.
- Riesgo de sobreajuste al dominio: si se entrenó solo con tuits y reseñas de Yelp, puede degradarse en otros registros (textos formales, dominios técnicos).
- Sesgos potenciales: al desconocerse el corpus, no se pueden evaluar sesgos demográficos, léxicos o culturales; los clasificadores de sentimiento en redes sociales suelen mostrar sesgo hacia el léxico coloquial y hacia variedades dialectales sobrerrepresentadas.
- Sin métricas de calibración: no se puede confiar en las probabilidades de salida sin una validación previa en el dominio objetivo.
- Riesgo de alucinación no aplicable (no es generativo), pero sí de clasificaciones erróneas silenciosas en textos ambiguos, sarcásticos o con negaciones complejas.
- Repositorio sin actividad (0 descargas, 0 likes) y creado recientemente: no hay evidencia de uso comunitario ni de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whitesauce/tweet-yelp-sentiment-roberta
- Paper de referencia RoBERTa (Liu et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de `transformers` para `RobertaForSequenceClassification`: https://huggingface.co/docs/transformers/model_doc/roberta
- Calculadora de impacto ambiental citada en la card (Lacoste et al., 2019): https://mlco2.github.io/impact
