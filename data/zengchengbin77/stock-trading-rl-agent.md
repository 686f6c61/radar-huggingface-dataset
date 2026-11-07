# zengchengbin77/stock-trading-rl-agent

## Resumen

Stock Trading RL Agent es un agente de aprendizaje por refuerzo (RL) para la toma de decisiones de compra, venta y mantenimiento de posiciones en acciones, desarrollado por el usuario zengchengbin77 y publicado en Hugging Face. El modelo se basa en el algoritmo PPO (Proximal Policy Optimization) implementado con la librería Stable-Baselines3 y emplea una política de red neuronal de tipo perceptrón multicapa (MLP). No se trata de un modelo de lenguaje, sino de un artefacto de RL entrenado sobre series temporales financieras de cinco grandes tecnológicas estadounidenses (AAPL, MSFT, GOOGL, AMZN y TSLA) con datos diarios de los últimos cinco años obtenidos de Yahoo Finance.

El agente resuelve el problema de la asignación de cartera a corto plazo: recibe como observación una ventana de 60 días con indicadores técnicos (SMA, EMA, RSI, MACD, Bandas de Bollinger, precio y volumen) más el estado de la cartera (saldo, posición, valor neto y retornos), y emite una acción híbrida compuesta por una decisión discreta (0 mantener, 1 comprar, 2 vender) y un tamaño de posición continuo en el rango [0, 1]. El entrenamiento se realizó durante 500.000 pasos con una tasa de aprendizaje de 0,0003 y un tamaño de lote de 64.

Su relevancia es limitada pero ilustrativa: sirve como referencia reproducible de un pipeline completo de RL aplicado a finanzas (entorno, preparación de datos, escalado y entrenamiento), y su licencia MIT permite reutilizar el código. No obstante, el repositorio tiene 0 descargas y 0 likes, el tamaño del repo es de 0,0 GB y los resultados declarados no están verificados, por lo que debe tratarse como un experimento académico o de prototipado, no como un sistema listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PPO con política MLP (perceptrón multicapa) sobre Stable-Baselines3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana de observación de 60 días (lookback_window: 60) |
| Tipos de cuantizacion | no disponible (no aplica a un agente RL) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | best_model.zip (formato nativo de Stable-Baselines3) y scaler.pkl (escalador de datos en pickle) |

## Arquitectura y entrenamiento

La arquitectura es un agente PPO con política de red MLP. El espacio de acciones es híbrido: una dimensión discreta de 3 valores (mantener, comprar, vender) y una dimensión continua en [0, 1] que representa la fracción de capital disponible a movilizar. El espacio de observaciones combina indicadores técnicos por acción (SMA 20 y 50, EMA 12 y 26, RSI, MACD, señal MACD e histograma MACD, bandas de Bollinger superior e inferior con %B, además de OHLCV) con variables de estado de cartera (balance, posición, valor neto y retornos). Los datos se normalizan mediante un escalador persistido en `scaler.pkl`.

El entrenamiento se configuró con 500.000 timesteps, learning rate 0,0003, batch size 64, 10 épocas por actualización, gamma 0,99, evaluación cada 1.000 pasos con 5 episodios, guardado cada 10.000 pasos y semilla 42. El entorno simulado parte de un balance inicial de 10.000 unidades monetarias, aplica un coste de transacción del 0,001 (10 puntos básicos) y permite un tamaño máximo de posición de 1,0; el tipo de recompensa es el retorno con ajuste por riesgo (`risk_adjustment: true`). No se documenta el número total de tokens ni la composición exacta del dataset más allá de los tickers y el periodo (5 años, intervalo diario). No hay evidencia de RLHF ni de DPO, ya que no es un modelo generativo.

## Capacidades

- Toma de decisiones de trading discretas: mantener, comprar o vender sobre cinco acciones concretas (AAPL, MSFT, GOOGL, AMZN, TSLA).
- Dimensionamiento de posición continuo: emite una fracción de capital entre 0 y 1 para cada señal.
- Procesamiento de indicadores técnicos: tendencia (SMA/EMA), momento (RSI, MACD) y volatilidad (Bandas de Bollinger).
- Gestión de estado de cartera: incorpora balance, posición, valor neto y retornos en la observación.
- Ajuste por riesgo en la función de recompensa, configurable mediante `risk_adjustment`.
- Integración con Stable-Baselines3: carga mediante `PPO.load("best_model.zip")` y predicción con `model.predict(obs, deterministic=True)`.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües, visión, audio ni modo de razonamiento explícito (thinking mode), al no ser un modelo de lenguaje.

## Casos de uso

- Prototipado de pipelines de RL financiero: el repositorio incluye clases de preparación de datos y de entorno (`Enhanced Environment` y `Stock data processor`), lo que permite reproducir el flujo completo desde la descarga de datos de Yahoo Finance hasta el entrenamiento.
- Investigación académica sobre PPO en finanzas: sirve como línea base reproducible (semilla 42, hiperparámetros documentados) para comparar variantes de recompensa, ventanas de observación o costes de transacción.
- Simulación de estrategias sobre acciones FAANG: el agente puede evaluarse en backtesting diario con las cinco acciones para estudiar el comportamiento de una política híbrida discreta-continua.
- Docencia de aprendizaje por refuerzo: el espacio de acciones híbrido y el bucle de trading documentado en la model card constituyen un ejemplo didáctico de entorno con recompensa ajustada por riesgo.
- Generación de señales auxiliares: las salidas de acción y tamaño de posición pueden emplearse como señal adicional en un sistema de alertas, siempre con validación externa y sin ejecución automática de órdenes.
- Análisis de sensibilidad a costes: el parámetro `transaction_cost` (0,001 por defecto) permite estudiar cómo varía la política ante distintos niveles de comisiones y deslizamiento.
- Extensión a otros universos de activos: el código de preparación de datos admite cambiar `tickers`, `period` e `interval`, lo que facilita reentrenar sobre otros conjuntos manteniendo la misma arquitectura.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Accion | Retorno total | Ratio de Sharpe | Max drawdown | Tasa de acierto | Observacion |
|---|---|---|---|---|---|
| MSFT | 7.243,44 % | 0,56 | 164,60 % | 52,11 % | Mejor retorno total |
| AMZN | 162,87 % | 0,74 | 187,11 % | 6,72 % | Mejor ajuste al riesgo |
| TSLA | 109,91 % | -0,22 | 145,29 % | 44,76 % | Mayor volatilidad |
| AAPL | -74,02 % | 0,65 | 157,07 % | 7,01 % | Peor comportamiento |
| GOOGL | 0,00 % | 0,00 | 0,00 % | 0,00 % | Sin actividad |

Datos agregados de la model card: retorno máximo 7.243,44 % (MSFT), mejor Sharpe 0,74 (AMZN), mayor tasa de acierto 52,11 % (MSFT), menor drawdown 145,29 % (TSLA). No hay comparación con otros agentes RL ni con estrategias de referencia (buy-and-hold) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un agente PPO con política MLP y observaciones de baja dimensionalidad (indicadores técnicos y estado de cartera), la inferencia es extremadamente ligera y cabe holgadamente en cualquier GPU consumer; probablemente también en CPU.
- GPU recomendadas: no se especifican en la documentación. Por el tamaño del modelo, cualquier GPU moderna (RTX 3060 o superior) es suficiente; para el entrenamiento de 500.000 pasos una GPU de gama media acelera el proceso, aunque el cuello de botella suele ser la simulación del entorno.
- Cabe en GPU consumer: sí, con alta probabilidad, dado que el repositorio ocupa 0,0 GB y la política es una MLP.
- Opciones de despliegue: Stable-Baselines3 (`PPO.load`) es el método documentado; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. La inferencia de una MLP sobre una observación de baja dimensión es del orden de milisegundos, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Algoritmo | Datos | Licencia | Disponibilidad | Resultados publicados |
|---|---|---|---|---|---|
| zengchengbin77/stock-trading-rl-agent | PPO + MLP | FAANG, 5 años, diario | MIT | Hugging Face, 0 descargas | Retorno hasta 7.243,44 %, Sharpe 0,74 |
| Adilbai/stock-trading-rl-agent | PPO | No disponible en la información | no disponible | Hugging Face | No disponible |
| Estrategia buy-and-hold de referencia | No aplica | Mismas acciones | No aplica | No aplica | No disponible en la información |

La búsqueda web solo devolvió un repositorio homónimo (Adilbai/stock-trading-rl-agent) con descripción idéntica, lo que sugiere una copia o variante del mismo proyecto; no se dispone de sus métricas ni de su licencia. No se han identificado otros agentes RL comparables con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- Resultados no verificados: todas las métricas de la model card están marcadas como `verified: false` y proceden del propio autor; no han sido auditadas de forma independiente.
- Inconsistencias en las métricas: un max drawdown del 145,29 % o del 187,11 % es aritméticamente anómalo para una cartera con balance inicial de 10.000 y tamaño de posición máximo de 1,0, lo que sugiere problemas de cálculo o de interpretación en la evaluación.
- Retorno de MSFT de 7.243,44 %: cifra extraordinaria y no contrastada; debe tratarse con máximo escepticismo y no como evidencia de rentabilidad real.
- Sobreajuste y sesgo de selección: el entrenamiento y la evaluación se realizan sobre las mismas cinco acciones y el mismo periodo de cinco años, sin validación fuera de muestra documentada.
- Riesgo de alucinación: no aplica en el sentido de un modelo de lenguaje, pero el agente puede generar señales sin fundamento en regímenes de mercado no vistos durante el entrenamiento.
- Cobertura limitada: solo cinco tickers estadounidenses y datos diarios; no se documenta soporte para otros mercados, criptomonedas, intradía ni datos fundamentales.
- Idiomas: no aplica; el artefacto no procesa texto.
- Sin actividad en GOOGL y con retornos negativos en AAPL: la política no generaliza de forma uniforme entre activos, lo que limita su uso directo como estrategia única.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero no exime del cumplimiento de la normativa financiera aplicable (por ejemplo, requisitos de asesoramiento o ejecución de órdenes).
- Caveat para producción: no debe desplegarse para operar capital real sin backtesting fuera de muestra, control de riesgo independiente, límites de exposición y supervisión humana; el propio autor lo etiqueta como "production-ready", pero la evidencia disponible no respalda esa afirmación.
- Repositorio con 0 descargas y 0 likes: escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zengchengbin77/stock-trading-rl-agent
- Repositorio homónimo en Hugging Face: https://huggingface.co/Adilbai/stock-trading-rl-agent
- README del repositorio homónimo: https://huggingface.co/Adilbai/stock-trading-rl-agent/blob/main/README.md
- Paper de PPO (referencia arXiv indicada en los tags): https://arxiv.org/abs/1707.06347
- Stable-Baselines3: https://github.com/DLR-RM/stable-baselines3
- Yahoo Finance (fuente de datos): https://finance.yahoo.com
