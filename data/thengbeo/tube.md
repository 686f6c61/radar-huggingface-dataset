# Thengbeo/tube

## Resumen

TuBe (Thengbeo/tube) es un modelo presentado por el autor como un motor de trading cuantitativo y "world model" para mercados de futuros de Binance, con una arquitectura declarada de transformer causal multi-temporal. Segun la model card, el modelo tiene aproximadamente 60 millones de parametros, una ventana de contexto de 512 tokens y una configuracion de 12 capas, dimension 512 y 8 cabezas de atencion. El repositorio no incluye pipeline, licencia ni idiomas declarados, y no registra descargas ni interacciones en Hugging Face.

El modelo no es un modelo de lenguaje general: su entrada declarada es un vector numerico de 10 dimensiones con caracteristicas de mercado (log return, mechas, ratio de volumen, delta de order flow taker, funding rate, codificacion temporal y sentimiento de noticias). La salida se orienta a decisiones de trading con un mecanismo de "latent thinking" de 16 slots vectoriales, sin generacion de tokens de texto.

La relevancia practica es limitada por la ausencia de pesos publicados, licencia, documentacion tecnica verificable y resultados reproducibles. La model card esta redactada en vietnamita y mezcla descripcion tecnica con material promocional y referencias a rutas locales de Windows, lo que impide tratarlo como un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Multi-Timeframe Transformer (d=512, L=12, H=8) |
| Parametros totales | ~60M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (notificaciones declaradas en vietnamita) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card describe un transformer causal con 12 capas, dimension oculta 512 y 8 cabezas de atencion, entrenado sobre multiples marcos temporales (1D, 4H, 1H, 15m, 1m). La entrada es un vector de 10 dimensiones normalizado con features economicas: log return, mechas, ratio de volumen, delta de order flow taker, funding rate, codificacion temporal y sentimiento de noticias. El mecanismo de "latent thinking" se presenta como 16 slots vectoriales que evaluan ramas de escenarios sin emitir tokens de texto.

No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni detalles del proceso de RL. La model card menciona un "RL Environment" y scripts de pretrain y RL en la estructura del proyecto, pero no aporta hiperparametros, curvas de entrenamiento ni metodologia reproducible. Tampoco se indica si los pesos estan publicados en el repositorio.

## Capacidades

- Prediccion de escenarios de precio sobre velas de 5m, 15m, 1h y 1D, segun la descripcion del autor.
- Procesamiento de features de microestructura de mercado (order flow taker delta, funding rate, ratio de volumen).
- Incorporacion de sentimiento de noticias como una de las 10 dimensiones de entrada.
- Mecanismo de "latent thinking" con 16 slots vectoriales para evaluar ramas de escenarios.
- Generacion de notificaciones en vietnamita via Telegram, segun la model card.
- No se declara soporte de tool calling, function calling, agentes multi-paso, vision, audio ni generacion de texto general.
- No se declara capacidad multilingue mas alla de las notificaciones en vietnamita.

## Casos de uso

- Senalizacion de trading en futuros de Binance: el modelo consumiria features de velas y order flow para emitir escenarios de precio; su contexto de 512 tokens limita la ventana a un historico corto de eventos.
- Backtesting de estrategias de alta frecuencia: la arquitectura multi-temporal permitiria evaluar reglas sobre datos historicos de 1m a 1D, aunque no se documenta ningun resultado de backtest.
- Monitorizacion de funding rate y liquidaciones: las features de entrada incluyen funding rate y order flow, utiles para detectar condiciones de estres en el mercado de futuros.
- Analisis de sentimiento aplicado a noticias: una de las 10 dimensiones de entrada es sentimiento de noticias, lo que permitiria incorporar senales macro a la decision de trading.
- Alertas operativas via Telegram: la model card declara notificaciones en vietnamita para el fundador, un caso de uso de mensajeria mas que de inferencia general.
- Investigacion sobre world models financieros: el diseno de latent thinking con 16 slots puede servir como referencia academica para explorar planificacion latente en dominios numericos.
- Prototipado de entornos RL para trading: la estructura de proyecto incluye un "RL Environment", util para experimentar con recompensas basadas en Sharpe ratio o EV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de Sharpe ratio, retorno, drawdown, precision direccional ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~60M parametros, en fp32 serian aproximadamente 240 MB de pesos; en fp16, unos 120 MB; en int8, unos 60 MB. Estas cifras son estimaciones a partir del tamano declarado, no datos publicados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente por capacidad de memoria; no se documenta ningun requisito oficial.
- Cabe en GPU consumer: si, por tamano de parametros, aunque no se ha verificado la disponibilidad de pesos.
- Opciones de despliegue: no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el modelo no es un LLM de texto y su pipeline no esta declarado.
- Latencia y throughput: no disponibles. La model card menciona "0.1 ms" para el latent thinking, pero no aporta mediciones reproducibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TuBe (Thengbeo/tube) | ~60M | 512 tokens | Trading cuantitativo / futuros | no disponible | Repositorio sin pesos declarados |
| AlphaZero | no disponible | no aplica | Juegos de tablero | no disponible | Referencia academica |
| KataGo | no disponible | no aplica | Go | open source | Publico |
| Modelos de series temporales financieras genericos | variable | variable | Prediccion de precios | variable | Variable |

La comparacion con AlphaZero y KataGo es la que establece el propio autor por numero de parametros, pero no existe una evaluacion comun de rendimiento. No se dispone de alternativas directamente comparables con datos verificables en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado pesos, tokenizador ni artefactos de inferencia en el repositorio; el modelo no es ejecutable tal como se describe.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido.
- No hay resultados de backtest, validacion fuera de muestra ni metricas de riesgo; cualquier uso en produccion carece de evidencia de rendimiento.
- El contexto de 512 tokens es muy corto para capturar regimenes de mercado prolongados.
- La model card esta redactada en vietnamita y contiene referencias a rutas locales de Windows y material promocional, lo que dificulta la verificacion tecnica.
- Riesgo elevado de sobreajuste y de alucinacion de senales en un dominio con ruido y cambios de regimen.
- No se documentan sesgos, pero el entrenamiento sobre un unico exchange (Binance Futures) introduce sesgo de plataforma y de instrumento.
- El uso en trading conlleva riesgo de perdida de capital; el modelo no constituye asesoramiento financiero.
- No se declara soporte multilingue ni de texto general, por lo que no debe evaluarse como un LLM convencional.

## Enlaces

- Hugging Face: https://huggingface.co/Thengbeo/tube
