# Xang01/critiquelab-tone-classifier

## Resumen

`Xang01/critiquelab-tone-classifier` es un modelo de clasificación de texto publicado en Hugging Face por el usuario Xang01 el 19 de noviembre de 2026. Por el nombre y las etiquetas, está orientado a clasificar el tono de críticas o comentarios, presumiblemente en el contexto de una aplicación llamada CritiqueLab. La model card es la plantilla autogenerada por Hugging Face y no contiene prácticamente información útil: no se documentan datos de entrenamiento, métricas, idiomas ni licencia.

La arquitectura es DistilBERT, una versión destilada de BERT con aproximadamente la mitad de capas del modelo original, lo que se traduce en 66.956.548 parámetros totales según los pesos en safetensors. El repositorio ocupa 0,3 GB y los pesos están en formato safetensors, con la librería transformers y compatibilidad declarada con text-embeddings-inference y endpoints.

Su relevancia actual es limitada: se trata de un modelo con cero descargas y cero likes, sin documentación técnica ni resultados de evaluación publicados. Es útil únicamente como artefacto de clasificación de tono potencialmente utilizable tras una validación empírica por parte del usuario, no como modelo de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado de BERT) |
| Parametros totales | 66.956.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (DistilBERT admite hasta 512 tokens; no confirmado por el autor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es DistilBERT, un transformer encoder con 6 capas (frente a las 12 de BERT-base), destilado mediante knowledge distillation a partir de BERT. Los 66.956.548 parámetros corresponden a la configuración estándar de DistilBERT con una cabeza de clasificación para `text-classification`. La etiqueta `arxiv:1910.09700` presente en el repositorio remite al artículo de Lacoste et al. sobre impacto ambiental del cálculo, que aparece en la plantilla de la model card, no a un paper propio del modelo.

No hay información sobre el dataset de entrenamiento, el número de tokens, la composición de los datos, ni sobre si se aplicaron técnicas de ajuste fino supervisado, RLHF o DPO. Tampoco se documentan hiperparámetros, régimen de precisión ni infraestructura de cómputo. La model card es la plantilla por defecto de Hugging Face con todos los campos marcados como "[More Information Needed]".

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado presumiblemente a etiquetar el tono de críticas o comentarios.
- Codificación de texto: al ser un encoder transformer, puede emplearse para extraer embeddings contextuales de frases.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no declaradas).
- No se documenta modo thinking, visión, audio ni ninguna capacidad especial.
- Generación de texto: no aplicable, es un modelo encoder-only.

## Casos de uso

- Moderación de comentarios y reseñas: clasificar reseñas de usuarios en categorías de tono (positivo, negativo, neutro, tóxico) para enrutarlas a revisión humana o a sistemas automáticos de respuesta.
- Análisis de sentimiento en atención al cliente: procesar grandes volúmenes de tickets y mensajes para priorizar casos con tono negativo o enfadado, aprovechando el bajo coste computacional de DistilBERT.
- Enrutamiento de feedback en productos digitales: etiquetar críticas recibidas en una plataforma para dirigirlas al equipo correspondiente (producto, soporte, marketing) según el tono detectado.
- Filtrado previo en pipelines de moderación: usar el modelo como primera etapa barata para descartar comentarios claramente neutros antes de pasar a modelos más grandes y costosos.
- Extracción de embeddings para clustering: generar representaciones de reseñas para agrupar temáticas o tonos similares en herramientas de analítica.
- Clasificación por lotes en CPU: al ser un modelo de ~67M parámetros, puede ejecutarse en CPU con latencias de milisegundos por frase, lo que permite procesar corpus completos sin GPU.
- Integración en APIs de inferencia: la etiqueta `endpoints_compatible` y `text-embeddings-inference` sugieren despliegue sencillo en Hugging Face Inference Endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,27 GB solo para pesos (67M × 4 bytes), más activaciones; en la práctica cabe en cualquier GPU consumer con 2 GB o más.
- VRAM estimada en fp16: aproximadamente 0,13 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; NVIDIA T4, RTX 3060, RTX 4090, A100 o H100 son sobradamente suficientes. El modelo también se ejecuta en CPU sin problemas.
- Cabe en GPU consumer: sí, en todas las GPU consumer modernas, incluidas las integradas con memoria compartida.
- Opciones de despliegue: transformers (pipeline `text-classification`), Text Embeddings Inference (TEI), Hugging Face Inference Endpoints. No se ha confirmado compatibilidad con llama.cpp, Ollama o vLLM (estas herramientas están orientadas a modelos generativos).
- Latencia y throughput: no disponibles. Por el tamaño, se espera latencia de pocos milisegundos por frase en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xang01/critiquelab-tone-classifier | 66,96M | no disponible | Clasificación de tono | no disponible | Hugging Face (0 descargas) |
| distilbert-base-uncased-finetuned-sst-2-english | ~67M | 512 tokens | Análisis de sentimiento | Apache 2.0 | Hugging Face (muy popular) |
| cardiffnlp/twitter-roberta-base-sentiment-latest | ~125M | 512 tokens | Análisis de sentimiento | no disponible | Hugging Face (muy popular) |
| nlptown/bert-base-multilingual-uncased-sentiment | ~178M | 512 tokens | Análisis de sentimiento multilingüe | MIT | Hugging Face (muy popular) |

La comparativa se basa en modelos públicos de referencia para clasificación de sentimiento y tono. El modelo de Xang01 no declara licencia ni idiomas, lo que lo sitúa por debajo de las alternativas en trazabilidad y condiciones de uso, aunque su tamaño es equivalente a DistilBERT estándar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al desconocerse el dataset de entrenamiento, no es posible evaluar sesgos de género, raza, idioma o dominio.
- Riesgo de alucinacion: no aplicable en sentido estricto (modelo de clasificación, no generativo), pero existe riesgo de clasificaciones erróneas o sobreconfiadas sin calibración documentada.
- Limitaciones de contexto o idioma: no se declara ningún idioma; si el entrenamiento fue monolingüe (probablemente inglés), el rendimiento en castellano podría ser deficiente. La longitud máxima de entrada no está confirmada, aunque DistilBERT admite 512 tokens.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si el uso comercial está permitido. Cualquier uso en producción requiere contactar al autor o asumir riesgo legal.
- Caveat para producción: cero descargas y cero likes indican ausencia de validación por la comunidad. La model card autogenerada no aporta información sobre métricas, datos o procedimiento de entrenamiento, por lo que no hay evidencia de calidad. Se recomienda evaluar el modelo sobre un conjunto de validación propio antes de cualquier despliegue.
- Fecha de creación futura (2026-11-19) en los metadatos: conviene verificar la integridad de los datos del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Xang01/critiquelab-tone-classifier
- Paper de referencia citado en la plantilla (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
