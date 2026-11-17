# yalemt/finbert-stock-sentiment

## Resumen

FinBERT Stock Sentiment es un clasificador de sentimiento financiero en ingles desarrollado por el usuario yalemt, obtenido mediante fine-tuning del modelo ProsusAI/finbert. Resuelve el problema de extraer la polaridad (negativa, neutra o positiva) de textos del dominio financiero, como titulares de prensa economica, informes de analistas y mensajes de redes sociales sobre empresas cotizadas. Su relevancia radica en que adapta un modelo ya especializado en finanzas a un corpus armonizado que combina lenguaje formal de informes institucionales con lenguaje informal y ruidoso de noticias en tiempo real.

Arquitectura BERT base (encoder transformer) con 109.484.547 parametros, tarea de clasificacion de secuencias con tres etiquetas (0: negative, 1: neutral, 2: positive). El modelo se distribuye en formato safetensors, con un tamano de repositorio de 1,8 GB, licencia Apache 2.0 y soporte exclusivo de ingles. Fue publicado en noviembre de 2026 y acumula 53 descargas.

El autor reporta un 86,98 % de accuracy y un Macro F1 de 0,8347 sobre una particion de validacion estratificada del 15 % (1.897 muestras). Incluye una demo interactiva en Hugging Face Spaces orientada a la construccion de una senal de "alpha neto" a partir de la diferencia entre la probabilidad de positivo y la de negativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (encoder transformer) para clasificacion de secuencias |
| Parametros totales | 109.484.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de BERT base, 512 tokens, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion via herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Etiquetas de salida | 0: negative, 1: neutral, 2: positive |
| Modelo base | ProsusAI/finbert |
| Tamano del repositorio | 1,8 GB |
| Pipeline | text-classification |

## Arquitectura y entrenamiento

El modelo es un encoder transformer tipo BERT base afinado para clasificacion de texto con tres clases. Parte de ProsusAI/finbert, que a su vez deriva de un BERT preentrenado y fue especializado en lenguaje financiero. El fine-tuning se realizo sobre 12.643 textos financieros armonizados, combinando dos fuentes: atrost/financial_phrasebank (informes de analistas institucionales) y zeroshot/twitter-financial-news-sentiment (noticias de mercado en tiempo real). Esta mezcla busca cubrir tanto el registro formal como el informal del dominio financiero.

La model card no detalla hiperparametros de entrenamiento, numero de epocas, tasa de aprendizaje, estrategia de balanceo de clases ni si se aplicaron tecnicas de aumento de datos. Tampoco se especifica si hubo calibracion de probabilidades posterior al entrenamiento. La evaluacion se realizo sobre una particion estratificada del 15 % (1.897 muestras), lo que sugiere que se preservo la distribucion de clases en el holdout.

## Capacidades

- Clasificacion de sentimiento financiero en tres clases (negativo, neutro, positivo) con salida de probabilidades por clase.
- Procesamiento de textos cortos y medios: titulares, frases de informes, tweets y notas de prensa economica.
- Calculo de una senal de "alpha neto" como diferencia entre la probabilidad de positivo y la de negativo, segun el ejemplo de uso del autor.
- Especializacion en vocabulario financiero (margenes, beneficios, consenso de analistas, guidance, etc.).
- Integracion directa con la pipeline `text-classification` de Transformers y soporte de `top_k=None` para obtener todas las probabilidades.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking: es un clasificador discriminativo, no un modelo generativo.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Analisis de sentimiento de titulares en tiempo real: ingestar un feed de noticias financieras y clasificar cada titular para construir un indicador agregado de sentimiento por ticker o sector.
- Senal cuantitativa de alpha: usar la diferencia entre probabilidad positiva y negativa como feature de entrada en un modelo de scoring o en una estrategia de trading sistematico, tal como propone el autor en la model card.
- Monitorizacion de redes sociales financieras: clasificar tweets y mensajes de foros para detectar cambios de tono en torno a una empresa antes de que se reflejen en el precio.
- Procesamiento de informes de analistas: extraer la polaridad de fragmentos de research institucional para resumir el consenso o detectar discrepancias entre analistas.
- Enriquecimiento de bases de datos de eventos: etiquetar automaticamente noticias historicas para construir series temporales de sentimiento que alimenten backtesting.
- Filtrado y priorizacion de alertas: en un sistema de vigilancia de medios, ordenar las noticias por intensidad de sentimiento para que los analistas revisen primero las mas relevantes.
- Deteccion de riesgo reputacional: marcar automaticamente comunicados y cobertura mediatica con polaridad negativa para su escalado a equipos de comunicacion o compliance.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Accuracy | 86,98 % | Holdout estratificado del 15 % (1.897 muestras) |
| Macro F1 | 0,8347 | Holdout estratificado del 15 % (1.897 muestras) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, Financial PhraseBank test oficial, FiQA, etc.) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y corresponden a una particion propia, no a un benchmark publico reproducible de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109,5 M de parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica cabe holgadamente en cualquier GPU consumer.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 o H100 son mas que suficientes. Tambien puede ejecutarse en CPU con latencia aceptable para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en GPUs integradas para inferencia por lotes.
- Opciones de despliegue: Transformers (`pipeline`), TorchServe, Triton Inference Server, ONNX Runtime, FastAPI con batching, o exportacion a GGUF/llama.cpp si se convierte el modelo (no se distribuye en GGUF de forma oficial).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU (miles de textos por segundo en lote) y moderado en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| yalemt/finbert-stock-sentiment | 109,5 M | no disponible | en | apache-2.0 | Fine-tune de ProsusAI/finbert sobre 12.643 textos armonizados; 86,98 % accuracy en holdout propio |
| ProsusAI/finbert | ~110 M | 512 tokens (BERT base) | en | apache-2.0 | Modelo base; entrenado sobre Financial PhraseBank; referencia habitual en sentimiento financiero |
| FinBERT (ProsusAI) variantes en HF | ~110 M | 512 tokens | en | variable | Multiples fine-tunes comunitarios con esquemas de etiquetas y datos distintos |
| Modelos generativos grandes (p. ej. LLM de 7B+) | miles de millones | variable | multi | variable | Mayor flexibilidad y capacidad de razonamiento, pero mucho mayor coste de inferencia y latencia para clasificacion masiva |

La comparativa se limita a alternativas de la misma familia y categoria. No se dispone de datos de benchmarks comparativos directos entre este modelo y ProsusAI/finbert sobre el mismo conjunto de evaluacion en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; textos en otros idiomas produciran predicciones poco fiables.
- Es un clasificador de tres clases: no genera explicaciones ni razonamiento, por lo que su uso en sistemas que requieran justificacion requiere capas adicionales.
- Las metricas reportadas (86,98 % accuracy, 0,8347 Macro F1) proceden de una particion propia del autor y no de un benchmark publico independiente; deben interpretarse con cautela.
- Riesgo de sobreajuste al vocabulario y estilo de los dos datasets de entrenamiento (Financial PhraseBank y Twitter Financial News); el rendimiento puede degradarse en dominios financieros distintos (p. ej. cripto, derivados, mercados emergentes).
- El sentimiento financiero es contextual y a menudo ambiguo; el modelo puede asignar polaridad incorrecta a frases con negaciones, ironia o lenguaje condicional.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si de clasificaciones erroneas con alta confianza; se recomienda calibrar umbrales antes de usar las probabilidades como senal directa de trading.
- No debe usarse como unica fuente para decisiones de inversion; la senal de "alpha neto" propuesta por el autor es una heuristica, no una estrategia validada.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda revisar las licencias de los datasets de origen (Financial PhraseBank y Twitter Financial News Sentiment) para usos derivados.
- No se documentan sesgos especificos ni analisis de equidad; al entrenarse sobre medios financieros en ingles, puede reflejar sesgos de cobertura mediatica y de las empresas representadas en los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yalemt/finbert-stock-sentiment
- Demo interactiva (Quantitative Stock Sentiment Radar): https://huggingface.co/spaces/yalemt/stock-sentiment-radar
- Modelo base ProsusAI/finbert: https://huggingface.co/ProsusAI/finbert
- Dataset atrost/financial_phrasebank: https://huggingface.co/datasets/atrost/financial_phrasebank
- Dataset zeroshot/twitter-financial-news-sentiment: https://huggingface.co/datasets/zeroshot/twitter-financial-news-sentiment
