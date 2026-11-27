# ZenoDivergent/zeno-divergent-v105

## Resumen

Zeno v1.05 es un modelo de meta-forecasting desarrollado por ZenoDivergent que aborda un problema específico: dado un panel de predicciones procedentes de múltiples fuentes (modelos meteorológicos, hubs epidemiológicos, encuestas profesionales, mercados de predicción, agentes de IA), el modelo aprende a corregir el consenso y a detectar cuándo ese consenso va a fallar colectivamente. No es un modelo de lenguaje ni un transformer generativo: es un sistema de agregación y corrección de pronósticos entrenado específicamente para series temporales en 13 dominios distintos.

El release v1.05 unifica tres módulos entrenados por separado (denominados `newest`, `flu` y `base`) bajo un diseño común de lectura de paneles, con un router de campo que asigna cada consulta al módulo que mejor rindió en ese dominio durante la validación. El modelo total contiene 89.854.584 parámetros repartidos entre esos tres módulos y sus copias de semillas promediadas, según los pesos en safetensors del repositorio. La librería es PyTorch, con exportaciones a ONNX, y la licencia es Apache 2.0.

La relevancia del modelo reside en su enfoque: en lugar de generar predicciones desde cero, opera sobre predicciones existentes y produce una respuesta corregida, una decisión de "confiar, ajustar o abstenerse" y una alerta temprana de fallo conjunto. Los backtests publicados en la model card muestran mejoras frente al mejor rival en varios campos (por ejemplo, +34,9 % en máximas meteorológicas de aeropuertos ECMWF y +13,4 % en cripto BTC/ETH horario), aunque el propio autor advierte que son backtests sobre datos pasados y no pruebas en vivo selladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de meta-forecasting basado en lectura de paneles; tres módulos separados (newest, flu, base) con router de campo |
| Parametros totales | 89.854.584 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (opera sobre paneles de pronosticos, no sobre secuencias de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, PyTorch |
| Pipeline | time-series-forecasting |
| Tamano del repositorio | 1,5 GB |
| Campos soportados | 13 (meteorologia, energia, salud publica, cripto, mercados de prediccion, etc.) |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo ni un modelo de lenguaje. Su diseño se basa en un "panel-reader": recibe un conjunto de pronósticos cuantílicos (por ejemplo, q05, q50, q95) emitidos por distintos predictores para una misma pregunta y un mismo horizonte temporal, y produce una distribución corregida. La arquitectura se organiza en tres módulos entrenados de forma independiente que comparten el mismo diseño de lectura de paneles; cada campo se enruta a uno de los tres módulos mediante un fichero de routing (`routing.json`). No se trata de una red entrenada conjuntamente, sino de una federación de módulos con enrutamiento por campo.

El entrenamiento se realizó con un esquema "time-honest": cada campo se prueba en sus semanas más recientes, con un período de selección retenido entre entrenamiento y test, y sin hueco adicional entre selección y test. Los resultados de otros campos se purgan para evitar filtración de información. El modelo aplica un mecanismo de deduplicación de predictores: las copias exactas o miembros de la misma familia no pueden superar en voto a predictores independientes. Además, incorpora una advertencia de fallo conjunto que señala cuándo todas las familias independientes probablemente fallarán a la vez. La función de pérdida es log loss para preguntas binarias y pinball loss sobre nueve cuantiles para valores numéricos.

## Capacidades

- Corrección de consenso en pronósticos: recibe un panel de predicciones y devuelve una distribución corregida con intervalos cuantílicos.
- Decisión de "confiar, ajustar o abstenerse" sobre el consenso del panel.
- Alerta temprana de fallo conjunto: detecta cuándo todas las familias independientes de predictores probablemente se equivocarán a la vez.
- Deduplicación de predictores: impide que copias o miembros de la misma familia dominen el consenso.
- Enrutamiento por campo: asigna automáticamente cada consulta al módulo (newest, flu o base) que mejor rindió en ese dominio.
- Soporte de 13 campos: meteorología histórica, ensembles meteorológicos, estado del mar, demanda energética, gripe (CDC FluSight), COVID-19, RSV, encuestas del Philadelphia Fed, encuestas del BCE, cripto (BTC/ETH horario), mercados entre venues, mercados de predicción y ForecastBench.
- Interfaz HTTP y MCP: expone una API pública y un servidor MCP compatible con Claude, ChatGPT, Cursor y otros agentes.
- Procesamiento por lotes: admite lotes de hasta 25 paneles en una sola llamada.
- Exportación a ONNX Runtime con ficheros por campo.
- No dispone de capacidades de generación de texto, visión, audio ni tool calling en el sentido de los LLM.

## Casos de uso

- Corrección de pronósticos meteorológicos: dado un panel de modelos numéricos y observaciones históricas de máximas en aeropuertos, el modelo devuelve una distribución corregida que en backtest redujo el error un 34,9 % frente al mejor rival. Útil para operaciones aeroportuarias y planificación logística.
- Vigilancia epidemiológica: con paneles de hubs como FluSight o COVID-19, el modelo corrige el consenso y emite alertas cuando las familias de modelos probablemente fallarán juntas, lo que permite a salud pública anticipar semanas de alta incertidumbre.
- Trading y mercados de predicción: para cripto (BTC/ETH horario) y mercados entre venues, el modelo ajusta los cuantiles del panel y señala cuándo el consenso de mercado es poco fiable, con una mejora del 13,4 % en cripto.
- Gestión de riesgo energético: en demanda eléctrica (NESO), el modelo puede integrarse en pipelines de previsión para corregir el consenso de múltiples fuentes, aunque en este campo no se ha puntuado formalmente.
- Meta-evaluación de agentes de IA: dado un panel de respuestas de varios agentes a una misma pregunta de forecasting, el modelo decide si el consenso es fiable o conviene abstenerse, útil para sistemas de enrutamiento de agentes.
- Investigación en forecasting: el repositorio incluye ficheros de puntuaciones por caso (`scores/<field>.csv`) y un `summary.json` reproducible, lo que permite auditar y replicar los resultados por campo.
- Integración en asistentes vía MCP: cualquier agente compatible con MCP puede llamar a `zeno_check` para obtener una corrección de panel en tiempo real desde la API pública.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre semanas no vistas (backtests, no pruebas selladas en vivo). "Edge" = reducción del error total frente al mejor de tres rivales (referencia de panel, consenso calibrado, gradient-boosted trees).

| Campo | Módulo | Edge vs. mejor rival | Casos de test | Resultado |
|---|---|---|---|---|
| Weather history (ECMWF airport highs) | newest | +34,9 % (IC95 %: +31,3 % a +38,1 %) | 2.464 | Victoria |
| ECB professional forecasters | newest | +24,6 % (IC95 %: +10,0 % a +41,7 %) | 82 | Prometedor (solo 7 resultados distintos) |
| Flu (CDC FluSight) | flu | +18,9 % (IC95 %: +5,4 % a +34,8 %) | 1.855 | Prometedor (rango amplio) |
| Crypto (BTC/ETH hourly) | newest | +13,4 % (IC95 %: +11,4 % a +15,3 %) | 19.202 | Victoria |
| Cross-venue markets | base | +12,1 % | 16 | Prometedor (solo 16 casos) |
| Prediction markets | base | +0,4 % | 10.220 | Sin diferencia medible |
| RSV hub | base | -1,0 % | 521 | Sin diferencia medible |
| ForecastBench | base | -1,9 % | 4.819 | Sin diferencia medible |
| COVID-19 hub | base | -2,4 % | 1.331 | Sin diferencia medible |
| Philadelphia Fed survey | base | -2,2 % (IC95 %: -3,4 % a -1,0 %) | 380 | Pérdida medida: responde con la referencia |
| Energy demand (NESO) | base | n/a | 2.731 | No puntuado (menos de 5 semanas de test) |
| Sea state | base | n/a | 4.532 | No puntuado |
| Weather ensembles | base | n/a | 6.543 | No puntuado (una semana de test) |

Existe un registro sellado lado a lado con el equipo Zeno30 iniciado el 6 de noviembre de 2026, sin veredicto hasta que se resuelvan 30 resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 89,8 M de parámetros, el peso en fp32 ronda los 360 MB; en fp16, unos 180 MB. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- GPU recomendadas: no disponibles. Por tamaño, cualquier GPU consumer con al menos 2 GB de VRAM libre debería poder cargar los pesos, pero el autor no publica requisitos oficiales.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del modelo, aunque no se confirma en la documentación.
- Opciones de despliegue: PyTorch (carga vía `zeno_core.load`), ONNX Runtime (`model.onnx` para cripto y ficheros por campo), API HTTP pública en `zenodivergent.dev`, servidor MCP.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la documentación proporcionada. El modelo se compara internamente con tres rivales (referencia de panel, consenso calibrado y gradient-boosted trees), pero no con otros modelos públicos de meta-forecasting con nombre y ficha propia.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Zeno v1.05 | 89,8 M | No aplica | Apache 2.0 | Hugging Face + API + MCP |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los resultados son backtests sobre datos pasados, no pruebas en vivo selladas. El propio autor lo indica explícitamente y el veredicto del registro sellado con Zeno30 no llegará hasta que se resuelvan 30 resultados.
- Varios campos con mejora positiva tienen muy pocos casos (ECB: 82 casos con solo 7 resultados distintos; cross-venue markets: 16 casos), por lo que la evidencia es débil.
- En varios campos (prediction markets, RSV, ForecastBench, COVID-19) no hay diferencia medible frente al mejor rival, y en Philadelphia Fed el modelo pierde un 2,2 % frente a la referencia.
- Tres campos (energía, estado del mar, ensembles meteorológicos) no están puntuados por falta de semanas de test suficientes.
- El modelo no es un LLM: no genera texto, no razona en lenguaje natural, no soporta visión ni audio, y no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- No se documentan sesgos conocidos ni riesgos de alucinación en el sentido de los modelos generativos, pero al operar sobre paneles de terceros hereda los sesgos de esos predictores.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la validez de los backtests en dominios nuevos.
- El repositorio ocupa 1,5 GB e incluye múltiples versiones (v101, v103, v104, v105) y copias de semillas; es necesario respetar la estructura de rutas indicada en la model card para cargar los pesos correctamente.
- La API pública y el servidor MCP dependen de la infraestructura de zenodivergent.dev; no se documentan SLA ni límites de tasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZenoDivergent/zeno-divergent-v105
- Demo alojada (Space): https://huggingface.co/spaces/mbarbosa1/zeno-v105
- Sitio oficial y endpoint de comprobación: https://zenodivergent.dev/check
- API pública (check): https://zenodivergent.dev/api/public/v1/check
- Servidor MCP: https://zenodivergent.dev/api/public/v1/mcp
- Registro sellado Zeno30: https://zenodivergent.dev/api/public/v1/zeno30/paired
