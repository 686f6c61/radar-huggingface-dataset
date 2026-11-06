# twnar/azerbaijani_sentiment_analysis

## Resumen

`azerbaijani_sentiment_analysis` es un clasificador de sentimiento en azerbaiyano desarrollado por twnar (twnarx), publicado en Hugging Face. El modelo consiste en un `xlm-roberta-base` (FacebookAI) afinado para clasificación de sentimiento en tres clases —negativo, neutral y positivo— sobre reseñas de Google Play Store en azerbaiyano. Resuelve un problema muy concreto: la escasez de herramientas de análisis de sentimiento para el azerbaiyano, una lengua de bajos recursos para la que apenas existen modelos específicos.

El modelo se entrenó sobre el dataset `hajili/azerbaijani_review_sentiment_classification` (unas 160.000 reseñas de Play Store con valoraciones de 1 a 5 estrellas), con muestreo balanceado de 12.763 ejemplos de entrenamiento y 1.800 de test. Es un modelo pequeño (278 millones de parámetros, encoder transformer), ligero de servir y con licencia MIT, lo que lo hace apto para uso comercial sin restricciones. Es relevante para desarrolladores que necesiten monitorizar reseñas de apps azerbaiyanas (banca, taxis, telecomunicaciones, comercio) sin depender de LLM generativos costosos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (encoder transformer) con cabezal de clasificación de secuencias |
| Parametros totales | 278.045.955 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 128 tokens (longitud máxima de secuencia usada en el entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32/fp16 según safetensors) |
| Idiomas soportados | Azerbaiyano (az) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con text-embeddings-inference y endpoints de Hugging Face) |

## Arquitectura y entrenamiento

El modelo parte de `xlm-roberta-base`, un encoder transformer multilingüe preentrenado con masked language modeling sobre 2,5 TB de texto en 100 idiomas (CommonCrawl, XLM-R CC100). Sobre este backbone se añade un cabezal de clasificación de secuencias que se afinó durante el fine-tuning. No es un modelo generativo ni MoE: es un encoder clásico de dos salidas por token y pooling para clasificación.

El entrenamiento se realizó sobre el dataset `hajili/azerbaijani_review_sentiment_classification` (~160.000 reseñas azerbaiyanas de Play Store). Las etiquetas se derivaron de las valoraciones en estrellas: 1-2 → negativo, 3 → neutral, 4-5 → positivo. Dado el fuerte desbalance original (~85 % positivo, 13 % negativo, 2 % neutral), se aplicó muestreo balanceado: 12.763 ejemplos de entrenamiento (5.000 negativos, 2.763 neutrales, 5.000 positivos) y 1.800 de test (600 por clase). Los hiperparámetros fueron 3 épocas, learning rate 2e-5, batch size 16, longitud máxima de secuencia 128 y precisión mixta fp16, entrenado en una NVIDIA T4 de Google Colab en unos 15 minutos. No se aplicó limpieza de texto más allá de eliminar reseñas vacías. No hubo RLHF ni DPO (no aplicable a un clasificador).

## Capacidades

- Clasificación de sentimiento en tres clases (negativo / neutral / positivo) sobre texto corto e informal en azerbaiyano.
- Especializado en reseñas de aplicaciones y servicios: apps de banca, taxi, telecomunicaciones y comercio electrónico.
- Manejo razonable de variantes ortográficas habituales del azerbaiyano (mezcla de letras nativas como `ə` y grafías ASCII como `ela`).
- Salida con probabilidades por clase (uso de `top_k=None` en el pipeline de transformers).
- Integrable con la librería `transformers`, con `text-embeddings-inference` y con los endpoints serverless de Hugging Face.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un clasificador de texto puro.
- No incluye capacidades de visión, audio ni generación de texto.

## Casos de uso

- **Monitorización de reseñas de apps en azerbaiyano:** clasificación automática de reseñas nuevas en Google Play Store para detectar caídas de satisfacción en apps de banca, taxi o telecomunicaciones; es el dominio para el que fue entrenado y donde rinde mejor.
- **Alertas de producto:** integración en un pipeline que clasifique reseñas en tiempo real y avise al equipo de soporte cuando se detecten picos de sentimiento negativo, aprovechando la alta exhaustividad de la clase negativa (recall 0,813).
- **Dashboards de experiencia de usuario:** agregación diaria del sentimiento por categoría de app, con la salvedad de que las métricas de la clase neutral son débiles.
- **Filtrado previo en sistemas de atención al cliente:** enrutar automáticamente reseñas negativas a un agente humano y las positivas a respuestas automatizadas de agradecimiento.
- **Investigación en PLN de lenguas de bajos recursos:** punto de partida o baseline para experimentos de análisis de sentimiento en azerbaiyano, con datos y procedimiento documentados.
- **Análisis de mercado para apps que entran al mercado azerbaiyano:** evaluación comparativa del sentimiento de reseñas entre competidores locales.
- **Clasificación por lotes de bajo coste:** al ser un encoder de 278 M de parámetros, permite procesar grandes volúmenes de texto en CPU o GPU modesta sin el coste de un LLM generativo.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos sobre el test set balanceado de 1.800 ejemplos (600 por clase):

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| negative | 0,613 | 0,813 | 0,699 |
| neutral | 0,690 | 0,352 | 0,466 |
| positive | 0,741 | 0,862 | 0,797 |

**Accuracy global:** 0,676 | **Macro-F1:** 0,654

No hay comparación con otros modelos en la información disponible. Ten en cuenta que las métricas se midieron sobre un test balanceado, mientras que la distribución real de reseñas está muy desbalanceada (~85 % positivas), por lo que la precisión en producción diferirá de estos valores.

## Requisitos de hardware

- VRAM estimada para inferencia: unos 1,1 GB en fp32 y unos 0,6 GB en fp16 para los pesos (278 M de parámetros), más margen para activaciones; cualquier GPU moderna es suficiente.
- En CPU es perfectamente viable: con longitud máxima de 128 tokens, la latencia por texto es de decenas de milisegundos en CPUs modernas (estimación, no dato publicado).
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060 o superiores; no se requiere A100 ni H100.
- El entrenamiento se realizó en una NVIDIA T4 de Google Colab en unos 15 minutos (0,25 horas de GPU), lo que indica que el fine-tuning completo es accesible con hardware gratuito o de bajo coste.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, text-embeddings-inference (TEI), Hugging Face Inference Endpoints, o cualquier servidor ONNX/TorchScript tras exportar el modelo.
- Throughput: no disponible como dato publicado; al ser un encoder de 278 M con secuencias de 128 tokens, se esperan cientos o miles de textos por segundo en GPU de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| twnar/azerbaijani_sentiment_analysis | 278 M | Sentimiento (3 clases) | az | MIT | Fine-tune de XLM-R base sobre reseñas azerbaiyanas |
| FacebookAI/xlm-roberta-base | 278 M | Base (sin afinar) | 100 idiomas | MIT | Backbone original; requiere fine-tuning para clasificar |
| jhu-clsp/ja-text-classification u otros clasificadores XLM-R por idioma | ~278 M | Clasificación variada | variable | variable | Pocas alternativas específicas para azerbaiyano existen publicadas |

No se han identificado en la información disponible otros clasificadores de sentimiento específicos para azerbaiyano con los que comparar numéricamente; la principal alternativa práctica sería afinar `xlm-roberta-base` o un modelo multilingüe tipo `distilbert-base-multilingual-cased` (135 M de parámetros) sobre el mismo dataset.

## Limitaciones y advertencias

- **Etiquetas ruidosas:** las etiquetas provienen de valoraciones en estrellas, no de anotación manual; reseñas claramente positivas (por ejemplo, con la palabra `əla`) pueden llevar 1-2 estrellas, por lo que parte del error medido es en realidad ruido de etiquetas.
- **Clase neutral débil:** las reseñas de 3 estrellas son mayoritariamente quejas o preguntas, y el modelo las confunde con frecuencia con negativas (recall neutral de solo 0,35). No fíes decisiones de la clase neutral.
- **Sesgo de dominio:** entrenado exclusivamente con reseñas de apps; el rendimiento en noticias, texto político, escritura formal u otros dominios no ha sido evaluado y probablemente sea peor.
- **Idioma:** diseñado solo para azerbaiyano; no es fiable con otros idiomas ni con texto con fuerte mezcla de lenguas (code-switching).
- **Ortografía y slang:** maneja variantes habituales entre grafías nativas y ASCII, pero las grafías inusuales, la jerga y el texto compuesto solo por emojis son menos fiables.
- **Distribución en producción:** las métricas publicadas corresponden a un test balanceado; con la distribución real (~85 % positivas) la precisión por clase será distinta.
- **No apto para decisiones automatizadas que afecten a personas**, según indica explícitamente el autor.
- **Licencia:** MIT, sin restricciones para uso comercial; también el dataset de entrenamiento es MIT.
- **Contexto limitado a 128 tokens** en el entrenamiento: textos mucho más largos se truncarán, lo que puede afectar a reseñas extensas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twnar/azerbaijani_sentiment_analysis
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/hajili/azerbaijani_review_sentiment_classification
