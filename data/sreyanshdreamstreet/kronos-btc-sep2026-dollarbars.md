# sreyanshdreamstreet/kronos-btc-sep2026-dollarbars

## Resumen

Kronos Model A es un checkpoint afinado del Kronos Financial Foundation Model, un modelo de series temporales financieras desarrollado por el usuario `sreyanshdreamstreet` sobre la arquitectura Kronos (tokenizador de doble codebook). El modelo está especializado en la predicción direccional de BTC a 5 minutos, entrenado sobre barras de dólar de 1.000.000 USD de Binance BTC/USDT correspondientes a septiembre de 2026. Con 102.311.008 parámetros, es un modelo compacto orientado a un dominio muy concreto: el trading de alta frecuencia sobre datos agregados por volumen en lugar de por tiempo.

La relevancia de este checkpoint es doble. Por un lado, aplica el marco Kronos a un caso de uso operativo real (forecasting direccional a corto plazo en un mercado de criptoactivos), y por otro introduce el uso de *dollar bars* —barras muestreadas según volumen negociado en lugar de intervalos fijos de tiempo—, una técnica que reduce el ruido y la heterocedasticidad típicos de las barras temporales en mercados de alta frecuencia. El modelo se distribuye bajo licencia Apache 2.0 y en formato safetensors, lo que facilita su integración en pipelines de investigación cuantitativa.

No obstante, conviene subrayar desde el principio que se trata de un artefacto de investigación con un alcance muy limitado: un único mes de datos de entrenamiento (septiembre de 2026), una ventana de *lookback* de 64 barras y una validación cronológica del 15%. No hay benchmarks públicos ni métricas de rendimiento fuera de la pérdida de validación reportada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kronos Foundation Model (tokenizador de doble codebook), transformer para series temporales |
| Parametros totales | 102.311.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64 dollar bars (ventana de lookback) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente FP32/FP16/BF16; no se documenta) |
| Idiomas soportados | en (metadatos); el modelo opera sobre datos numericos de series temporales |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y PyTorch (`model_A_1month_best.pt`), mas `config.json` |

## Arquitectura y entrenamiento

El modelo parte del Kronos Financial Foundation Model, cuya innovación principal es un tokenizador de doble codebook que discretiza las series temporales financieras en dos vocabularios complementarios antes de alimentar un transformer. Este enfoque convierte la predicción de precios continuos en un problema de modelado de secuencias discretas, lo que permite aplicar técnicas de modelado de lenguaje a datos de mercado. El checkpoint aquí descrito conserva esa arquitectura base y añade un ajuste fino supervisado sobre un único instrumento y una única resolución temporal.

El entrenamiento se realizó sobre el fichero `btc_sep2026_1M_dollar_bars.csv`, que contiene barras de dólar de 1.000.000 USD de Binance BTC/USDT de septiembre de 2026. La ventana de *lookback* es de 64 barras y la partición de datos es 85% entrenamiento cronológico / 15% validación, sin mezcla aleatoria, lo que es correcto para evitar fuga de información temporal. La mejor pérdida de validación alcanzada fue 6.6065, frente a una línea base de 6.8684, lo que supone una mejora de aproximadamente 0,26 en la métrica de pérdida. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, ni se especifica el número total de tokens ni la composición exacta del dataset más allá del mes y el instrumento.

## Capacidades

- Predicción direccional de BTC a 5 minutos (clasificación de subida/bajada) a partir de una secuencia de 64 dollar bars.
- Modelado de series temporales financieras discretizadas mediante el tokenizador de doble codebook de Kronos.
- Trabajo sobre datos agregados por volumen (dollar bars), no sobre barras temporales.
- Generación de secuencias de tokens de mercado condicionadas al contexto de 64 barras.
- Integración con la librería `kronos` (declarada como librería del modelo en Hugging Face).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües más allá del etiquetado `en` en metadatos.

## Casos de uso

- Investigación cuantitativa sobre dollar bars: el modelo permite estudiar si la agregación por volumen mejora la señal predictiva frente a barras temporales en BTC/USDT, usando la ventana de 64 barras como unidad de contexto.
- Backtesting de estrategias de alta frecuencia: puede integrarse en un motor de backtest que consuma secuencias de 64 dollar bars y produzca una señal direccional a 5 minutos, evaluando el rendimiento neto de comisiones y slippage.
- Señal auxiliar en sistemas de ejecución algorítmica: como componente de un ensemble junto a modelos estadísticos clásicos, aporta una predicción direccional a muy corto plazo que puede modular el tamaño de las órdenes.
- Reproducción de experimentos académicos: sirve como checkpoint de referencia para replicar el pipeline de fine-tuning de Kronos sobre un único mes de datos y comparar la pérdida de validación reportada (6,6065) con variantes propias.
- Prototipado de pipelines de forecasting con la librería `kronos`: al ser un repo pequeño (0,8 GB) y en safetensors, permite validar rápidamente la carga del modelo, el preprocesado de dollar bars y la inferencia en entornos de desarrollo.
- Análisis de sensibilidad a la ventana de contexto: al estar fijada en 64 barras, es útil para estudiar cómo degrada la señal al acortar o alargar artificialmente el contexto en tareas de *nowcasting*.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento reportado por el autor es la pérdida de validación:

| Metrica | Valor |
|---|---|
| Best validation loss (checkpoint afinado) | 6,6065 |
| Baseline validation loss | 6,8684 |
| Mejora absoluta | ~0,2619 |

No se proporcionan métricas de precisión direccional, *accuracy*, AUC, Sharpe, *hit rate* ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 102,3 M de parámetros, en FP32 serían ~0,41 GB de pesos; en FP16/BF16 ~0,20 GB; en INT8 ~0,10 GB. A ello hay que sumar el *overhead* de activaciones y del tokenizador, por lo que en la práctica el modelo cabe holgadamente en cualquier GPU con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna sirve; una RTX 3060, RTX 4060 o superior es más que suficiente. Para lotes grandes o *throughput* alto, una RTX 4090 o una A100/H100 aportan margen, aunque el cuello de botella será el preprocesado de dollar bars, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: la librería `kronos` es la vía declarada; al estar en safetensors, también puede cargarse con `transformers`/`safetensors` si la arquitectura es compatible, o exportarse a GGUF para llama.cpp/Ollama (no documentado por el autor). vLLM y TGI no están confirmados para esta arquitectura.
- Latencia y throughput estimados: no disponibles. Con 102 M de parámetros y contexto de 64 tokens, la latencia por muestra debería ser de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kronos Model A (este checkpoint) | 102,3 M | 64 dollar bars | BTC/USDT 5 min | Apache 2.0 | Hugging Face (`sreyanshdreamstreet/kronos-btc-sep2026-dollarbars`) |
| Kronos Financial Foundation Model (base) | no disponible | no disponible | Series temporales financieras generales | no disponible | Repo Kronos |
| Alternativas de forecasting financiero (p. ej. TimeGPT, Chronos) | no disponible en la informacion proporcionada | no disponible | Series temporales generales | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Entrenado sobre un único mes de datos (septiembre de 2026) y un único instrumento (BTC/USDT de Binance): riesgo elevado de sobreajuste al régimen de mercado de ese periodo y nula garantía de generalización a otros meses, exchanges o activos.
- La ventana de contexto de 64 dollar bars es muy corta; no captura patrones de largo plazo ni eventos macro.
- No hay benchmarks ni métricas de rendimiento fuera de la pérdida de validación; la mejora reportada (~0,26 en pérdida) no se traduce necesariamente en rentabilidad operativa.
- Riesgo de alucinación en el sentido de generar señales direccionales sin fundamento cuando el régimen de mercado se aleja del de entrenamiento.
- Sesgos potenciales derivados de un único exchange (Binance) y de un periodo concreto; los dollar bars mitigan parte del ruido, pero no eliminan el sesgo de selección temporal.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no ofrece soporte ni validación independiente.
- No se documentan los tipos de cuantización soportados ni la compatibilidad con frameworks de despliegue estándar (vLLM, TGI, llama.cpp); la integración depende de la librería `kronos`.
- Los metadatos indican idioma `en`, pero el modelo opera sobre datos numéricos; no debe interpretarse como un modelo de lenguaje.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/sreyanshdreamstreet/kronos-btc-sep2026-dollarbars
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales asociados a este checkpoint.
