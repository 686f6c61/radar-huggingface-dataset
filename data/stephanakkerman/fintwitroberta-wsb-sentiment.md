# StephanAkkerman/FinTwitRoBERTa-wsb-sentiment

## Resumen

FinTwitRoBERTa-wsb-sentiment es un modelo de clasificación de texto fine-tuned para analizar el sentimiento de publicaciones y comentarios del subreddit r/wallstreetbets, etiquetándolos como *bullish* (alcista), *bearish* (bajista) o *neutral*. Fue desarrollado por StephanAkkerman como parte del proyecto ModernFinTwitBERT y es el sucesor de FinTwitBERT-wsb-sentiment, sustituyendo el backbone BERT original por RoBERTa.

El modelo aborda un problema concreto: el argot, el sarcasmo y la longitud de los textos de los subreddits de trading minorista difieren sustancialmente de los tuits financieros, por lo que los modelos entrenados sobre Twitter rinden mal en este dominio. Para ello, parte de FinTwitRoBERTa-sentiment (ya ajustado a sentimiento financiero en tuits) y realiza un ajuste adicional sobre el dataset WSBS, con posts de r/wallstreetbets anotados por unanimidad.

Con 355,4 millones de parámetros y una longitud máxima de 256 tokens, logra un macro F1 de 0,886 en el conjunto de test de WSBS, superando claramente a su predecesor basado en BERT (0,821). Es relevante para cualquiera que necesite monitorizar el sentimiento minorista en foros de inversión de forma local, ligera y con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa para clasificacion de secuencias (text-classification) |
| Parametros totales | 355.362.819 |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 256 tokens en entrenamiento (hasta 512 tokens en inferencia con truncado) |
| Tipos de cuantizacion | no disponible (pesos en fp32 por defecto) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un RoBERTa estandar adaptado a clasificacion de tres clases (NEUTRAL, BULLISH, BEARISH), construido sobre StephanAkkerman/FinTwitRoBERTa-sentiment, que a su vez ya fue afinado para sentimiento financiero en tuits. El ajuste final se realizo sobre el dataset WSBS (`WSB_all_agree.csv`), compuesto por 1.509 posts y comentarios de r/wallstreetbets en los que todos los anotadores coincidian en la etiqueta, divididos 70/15/15 en entrenamiento, validacion y test (1.056 textos de entrenamiento y 226 posts de validacion; los 227 posts de test nunca se usaron para entrenar ni para seleccionar la receta).

Los hiperparametros de entrenamiento fueron: 4 epocas, learning rate 2e-05 con 10% de warmup, decaimiento de learning rate por capas de 0,9, weight decay 0,01, batch size 16, longitud maxima de 256 tokens y semilla 42. Se conservo el checkpoint con mejor F1 en validacion. Como innovacion practica destacable, el modelo incluye calibracion de confianza: `config.calibration_temperature` = 2,011, ajustada sobre el conjunto de validacion de WSB; dividiendo los logits por ese valor antes del softmax se obtienen probabilidades que reflejan la tasa de acierto real (error de calibracion ECE de 0,012 en test).

## Capacidades

- Clasificacion de sentimiento en tres clases (bullish, bearish, neutral) sobre posts y comentarios de r/wallstreetbets y subreddits similares de trading minorista.
- Comprension del argot, sarcasmo y jerga especifica de WSB (ejemplos del widget: "Come on TSLA. Fly you regarded bird!!", "Lmfao so many puts got bent").
- Lectura de posts completos de hasta 256 tokens (aproximadamente el 97% de los posts de WSB); textos mas largos se truncan salvo que se dividan previamente.
- Transferencia parcial a tuits financieros (macro F1 de 0,735 en el test de tuits), aunque con menor precision que el modelo especializado en tuits.
- Integracion directa con la libreria transformers de HuggingFace mediante pipeline de sentiment-analysis.
- Salidas calibrables mediante temperatura para obtener niveles de confianza fiables.

No soporta tool calling, agentes, ni capacidades multimodales: es un clasificador de texto puro.

## Casos de uso

- Monitorizacion de sentimiento minorista en tiempo real: ingesta continua de posts y comentarios de r/wallstreetbets para construir series temporales de sentimiento por ticker, aprovechando la rapidez de inferencia de un modelo de 355M de parametros.
- Senales auxiliares para estrategias cuantitativas: el sentimiento clasificado puede usarse como feature en modelos de prediccion de retornos o volatilidad de acciones con alto volumen de atencion minorista (GME, TSLA, AMC, etc.).
- Investigacion academica sobre finanzas conductuales: la licencia MIT y la reproducibilidad (semilla fija, splits documentados) lo hacen adecuado para estudios del impacto del sentimiento de Reddit en los mercados.
- Deteccion de episodios de "meme stocks": alertas cuando el volumen de posts bullish sobre un activo crece de forma anomala.
- Analisis retrospectivo de eventos de mercado: clasificacion de archivos historicos de posts para estudiar como reacciono la comunidad minorista ante movimientos concretos.
- Comparacion de dominios: uso como baseline para evaluar nuevos modelos de sentimiento financiero, dado que comparte conjunto de test con FinTwitBERT-wsb-sentiment y permite comparacion directa.
- Filtrado de contenido en dashboards: clasificacion previa para separar posts alcistas, bajistas y neutros antes de un analisis mas costoso con LLMs.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | WSB test (227 posts) | WSB validacion (226 posts) | Tweet test (1.237 tuits) |
|---|---|---|---|
| Macro F1 | 0,886 | 0,831 | 0,735 |
| Accuracy | 0,894 | 0,854 | 0,742 |
| Bullish precision | 0,928 | 0,893 | 0,658 |
| Bullish recall | 0,918 | 0,939 | 0,966 |
| Bearish precision | 0,895 | 0,825 | 0,553 |
| Bearish recall | 0,907 | 0,892 | 0,948 |
| Neutral recall | 0,833 | 0,648 | 0,575 |
| Error de calibracion (ECE) | 0,012 | – | – |

Comparacion directa sobre el mismo conjunto de test (227 posts de WSBS), segun el autor:

| Modelo | Macro F1 (WSB test) |
|---|---|
| FinTwitRoBERTa-wsb-sentiment (este modelo) | 0,886 |
| FinTwitBERT-wsb-sentiment | 0,821 |
| FinTwitRoBERTa-sentiment (sin entrenamiento WSB) | 0,657 |

El autor indica un intervalo bootstrap al 95% del macro F1 en test de 0,838–0,924 y advierte que, con 227 posts, diferencias de pocos puntos son ruido estadistico.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB en fp32 (tamano del repo); menos de 1 GB si se carga en fp16 o se cuantiza. Es un modelo muy ligero.
- GPU recomendadas: cualquier GPU moderna basta; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso GPUs integradas son mas que suficientes.
- Cabe sobradamente en GPUs de consumo y tambien es ejecutable solo en CPU con latencias aceptables (del orden de milisegundos por texto en GPU, decenas de milisegundos en CPU moderno; no hay cifras oficiales).
- Despliegue: libreria transformers de HuggingFace (pipeline de sentiment-analysis), compatible con text-embeddings-inference y endpoints de HuggingFace; no requiere vLLM, llama.cpp ni Ollama al no ser un modelo generativo.
- Ideal para procesamiento por lotes de grandes volumenes de posts en hardware modesto.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Macro F1 (WSB test) | Licencia |
|---|---|---|---|---|
| FinTwitRoBERTa-wsb-sentiment | 355,4M | Posts de Reddit (WSB) | 0,886 | MIT |
| FinTwitBERT-wsb-sentiment | no disponible | Posts de Reddit (WSB) | 0,821 | no disponible |
| FinTwitRoBERTa-sentiment | 355,4M (mismo backbone) | Tuits financieros | 0,657 (sin ajuste WSB) | no disponible |

FinTwitRoBERTa-wsb-sentiment es la opcion recomendada para Reddit; para tuits financieros, el propio autor recomienda usar FinTwitRoBERTa-sentiment, que rinde mejor en ese dominio.

## Limitaciones y advertencias

- Conjunto de test muy pequeno (227 posts): el intervalo de confianza del macro F1 es amplio (0,838–0,924), por lo que diferencias pequenas frente a otros modelos no son estadisticamente significativas.
- Entrenado solo en ingles y sobre el argot de r/wallstreetbets: su rendimiento degrada fuera de ese dominio (macro F1 de 0,735 en tuits, con recall neutral de solo 0,575).
- El sarcasmo y la ironia extremos de WSB siguen siendo dificiles; las metricas por clase muestran mayor confusion en la clase neutral.
- Los posts de mas de 256 tokens se truncan (cerca del 3% de los posts de WSB); hay que dividirlos manualmente para procesarlos completos.
- Para mejores resultados hay que preprocesar el texto igual que en entrenamiento: reemplazar enlaces por `[URL]`, menciones `u/name` por `@USER` y eliminar el marcado de emotes de Reddit.
- Las puntuaciones del pipeline por defecto no estan calibradas; hay que dividir los logits por `config.calibration_temperature` (2,011) para obtener confianzas fiables.
- El sentimiento de Reddit no es una senal de trading fiable por si sola: el modelo clasifica opinion, no probabilidad de movimiento de precio, y el dataset de entrenamiento es pequeno (1.056 textos).
- Licencia MIT sin restricciones de uso comercial, pero los resultados declarados no han sido verificados de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StephanAkkerman/FinTwitRoBERTa-wsb-sentiment
- Modelo base: https://huggingface.co/StephanAkkerman/FinTwitRoBERTa-sentiment
- Predecesor (BERT): https://huggingface.co/StephanAkkerman/FinTwitBERT-wsb-sentiment
- Modelo para tuits: https://huggingface.co/StephanAkkerman/FinTwitRoBERTa-sentiment
- Dataset WSBS (GitHub): https://github.com/moonscape95/WSBS
- Dataset WSBS en HuggingFace: https://huggingface.co/datasets/moonscape95/WSBS
- Repositorio del proyecto ModernFinTwitBERT: https://github.com/StephanAkkerman/ModernFinTwitBERT
