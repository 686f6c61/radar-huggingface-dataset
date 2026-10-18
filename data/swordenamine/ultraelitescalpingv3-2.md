# swordenamine/UltraEliteScalpingv3.2

## Resumen

UltraEliteScalpingv3.2 (identificador swordenamine/UltraEliteScalpingv3.2) no es un modelo de lenguaje ni un modelo de IA entrenado: es un repositorio de software alojado en HuggingFace que implementa un bot de generación de señales de scalping en el mercado forex. Lo publica el usuario swordenamine bajo la etiqueta "Ultra Elite Dev Team" y resuelve, según su autor, la combinación de análisis técnico multi-indicador con sentimiento de noticias y confirmación mediante un LLM externo (Claude Sonnet de Anthropic).

El proyecto se distribuye como paquete Python modular (config, core, apis, utils) y no incluye pesos, checkpoints ni artefactos de modelo. La "inteligencia" procede de dos servicios externos: NewsAPI para titulares macroeconómicos y la API de Anthropic para una puntuación de confirmación entre 0 y 20 puntos. En consecuencia, las métricas habituales de un modelo (parámetros, ventana de contexto, cuantización) no aplican a este repositorio.

Su relevancia actual es limitada y de carácter didáctico: sirve como ejemplo de integración de un LLM en un pipeline de trading algorítmico, no como modelo evaluable. El repositorio registra 0 descargas y 0 likes, el pipeline de HuggingFace figura como no disponible y no se han publicado evaluaciones reproducibles de su rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (no es un modelo de IA; es un bot de trading en Python que orquesta APIs externas) |
| Parametros totales | no disponible (no publica pesos ni parámetros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (la gestiona el modelo externo Claude Sonnet, no este repositorio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | MIT según la model card; el campo de licencia de HuggingFace figura como no disponible |
| Formato de pesos | no disponible (el repositorio contiene código Python, no pesos) |

## Arquitectura y entrenamiento

No existe entrenamiento ni arquitectura de red neuronal en este repositorio. La "arquitectura" es la de una aplicación Python organizada en módulos: un orquestador (`core/bot.py`), un motor de 12 indicadores técnicos (`core/indicators.py`), un motor de puntuación (`core/scoring.py`), clientes de API para noticias y para Claude (`apis/news_api.py`, `apis/ai_api.py`) y utilidades de presentación por terminal. El bucle principal se ejecuta cada 45 segundos y dispara una señal cuando la puntuación supera un umbral de 65 sobre un máximo de 120 puntos.

La puntuación combina reglas deterministas y aportaciones de modelos externos: price action con cruce de EMA (25 puntos), extremos de RSI (20), estocástico (18), MACD (15), fuerza de tendencia ADX (12), un bonus de sentimiento de noticias de ±10 y una confirmación de Claude de 0 a 20. No hay RLHF, DPO ni ajuste fino por parte del autor: la componente "IA" es una llamada a un modelo propietario de Anthropic. Cuando faltan las claves de API, el sistema degrada a respuestas simuladas (mocks), de modo que el bot arranca pero no produce señales reales.

## Capacidades

- Generación de señales de scalping para 6 pares de divisas: EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD y EURGBP (los tres últimos añadidos en la versión 3.2).
- Cálculo de 12 indicadores técnicos, incluidos Bollinger Bands y Momentum incorporados en esta versión.
- Análisis de sentimiento de titulares procedentes de NewsAPI con filtrado por palabras clave específicas de cada par.
- Confirmación cualitativa y cuantitativa mediante Claude Sonnet: devuelve una puntuación de 0 a 20 y un comentario de 2-3 frases.
- Ejecución desatendida con refresco periódico de noticias cada 3 ciclos y registro en `logs/bot.log`.
- Degradación elegante a datos simulados cuando no hay claves de API configuradas.
- No implementa tool calling ni function calling propio, ni razonamiento multi-paso más allá del pipeline descrito.
- No ofrece capacidades de visión, audio, generación de texto libre ni soporte multilingüe declarado.

## Casos de uso

- Estudio de integración de un LLM en un pipeline financiero: el repositorio muestra cómo inyectar una llamada a Claude Sonnet como capa de confirmación sobre una señal técnica ya calculada, útil como referencia para desarrolladores que quieran replicar el patrón con otro proveedor.
- Paper trading educativo: al ejecutarse sin claves de API en modo mock, permite probar la lógica de puntuación y el bucle de 45 segundos sin riesgo de capital real.
- Análisis de sentimiento de noticias forex: el módulo `apis/news_api.py` puede reutilizarse de forma aislada para clasificar titulares por palabras clave bullish/bearish sobre divisas concretas.
- Prototipado de motores de scoring: la tabla de pesos (90 puntos técnicos + ±10 de noticias + 0-20 de IA) sirve como base para experimentar con umbrales y pesos alternativos en un entorno controlado.
- Monitorización de mercado en terminal: el módulo `utils/display.py` ofrece una salida formateada con colores que puede adaptarse como panel de vigilancia de indicadores en tiempo casi real.
- Docencia sobre trading algorítmico: ejemplifica de forma compacta la separación entre señales técnicas, fuentes de datos externas y capas de confirmación por IA, con advertencias explícitas sobre riesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se aportan métricas de rendimiento de trading (ratio de acierto, drawdown máximo, Sharpe, profit factor) ni evaluaciones reproducibles del pipeline. Al no tratarse de un modelo de IA con pesos propios, no procede comparar con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- El bot en sí no requiere GPU: es código Python que realiza llamadas HTTP a NewsAPI y a la API de Anthropic.
- CPU y RAM: cualquier máquina capaz de ejecutar Python 3 con las dependencias de `requirements.txt` (colorama, python-dotenv y los clientes HTTP correspondientes); no se especifican mínimos.
- VRAM estimada: no aplica para este repositorio. La inferencia del modelo Claude Sonnet se ejecuta en la infraestructura de Anthropic, no en local.
- GPU recomendadas: no aplica.
- Opciones de despliegue: ejecución directa con `python main.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir.
- Latencia y throughput: no documentados. El bucle está configurado a 45 segundos por ciclo, pero la latencia real dependerá de las respuestas de NewsAPI y de Anthropic.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existen alternativas directamente comparables en términos de parámetros, contexto o licencia. Si se quisiera comparar la capa de IA que utiliza, el elemento relevante sería el modelo externo Claude Sonnet de Anthropic, cuyas especificaciones no se detallan en la información proporcionada. Como referencia conceptual, otros bots de trading publicados en GitHub o HuggingFace podrían cumplir una función similar, pero no se dispone de datos verificables para establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no se ha entrenado y no puede evaluarse con las métricas habituales de un modelo de lenguaje.
- Ausencia total de benchmarks y de validación reproducible del rendimiento del bot en condiciones de mercado reales.
- Riesgo financiero elevado: la propia model card lo declara "solo para fines educativos y de investigación" y recomienda probar en paper trading antes de arriesgar capital.
- Dependencia crítica de APIs de terceros (NewsAPI y Anthropic); sin claves, el sistema opera con datos simulados y las señales no son válidas.
- Posible alucinación de la capa Claude: las puntuaciones de 0 a 20 y los comentarios cualitativos generados por el LLM no están validados empíricamente y podrían introducir sesgo o ruido en la señal final.
- Inconsistencias en los metadatos de HuggingFace: la fecha de creación (2026-10-17) es posterior a la de actualización (2026-02-15), y el campo de licencia aparece vacío pese a que la model card declara MIT.
- Discrepancia entre el autor declarado (swordenamine) y la URL de clonado del README (github.com/swordenkisk), lo que dificulta verificar el código fuente real.
- Licencia MIT declarada en la model card, pero al no estar reflejada en el campo oficial de HuggingFace conviene confirmarla antes de cualquier uso comercial.
- No hay soporte multilingüe declarado ni documentación sobre sesgos; la salida por terminal está presumiblemente en inglés.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/swordenamine/UltraEliteScalpingv3.2
- Repositorio GitHub citado en la model card: https://github.com/swordenkisk/ultra_elite_scalping
- Anthropic (proveedor del modelo Claude): https://anthropic.com
- Consola de Anthropic para obtener la clave de API: https://console.anthropic.com
- NewsAPI (proveedor de titulares): https://newsapi.org
- Alpha Vantage (precios en vivo, opcional): https://alphavantage.co
- colorama (dependencia de terminal): https://github.com/tartley/colorama
- python-dotenv (dependencia de configuración): https://github.com/theskumar/python-dotenv
