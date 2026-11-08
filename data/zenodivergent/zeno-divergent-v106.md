# ZenoDivergent/zeno-divergent-v106

## Resumen

Zeno v1.06 (zeno-divergent-v106) es un modelo de predicción de series temporales publicado por el autor ZenoDivergent como *research release*. Se trata de una red neuronal de 15.927.753 parámetros entrenada de forma conjunta sobre 13 dominios de predicción (criptomonedas, economía, energía, salud, mercados, meteorología y series oceánicas, entre otros), empaquetada como un ensemble de 9 semillas en un único fichero `model.safetensors`. El modelo se recuperó a partir de ajustes ya completados sin reentrenamiento, y según el autor cada respuesta de examen se reproduce de forma exacta en un proceso nuevo con paridad de 1e-6.

El modelo no está pensado como sustituto del modelo servido en producción: el autor indica explícitamente que Zeno v1.05 sigue siendo la respuesta por defecto en zenodivergent.dev hasta que las comprobaciones de petición en fresco pasen. La relevancia de esta release es metodológica: documenta con detalle el protocolo de selección de tamaño (S, M y L con 3 semillas cada uno), la corrección por comparaciones múltiples y la distinción entre ganancias reales del modelo y ganancias inducidas por cambios en la regla de evaluación.

El fichero entregado contiene la red de tamaño M multiplicada por 3 semillas, no las 3 redes separadas del release anterior (v1.05, 89,9M de parámetros). La mayor parte del salto aparente en el dominio de criptomonedas (+13,4% a +58,5%) procede, según el propio autor, de la regla de evaluación más estricta de v1.06, no del modelo: la ganancia real medida frente a v1.05 es de +7,9%.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (red neuronal de predicción; el autor menciona un encoder compartido de conjuntos de pronóstico y un kernel de sorpresa relacional, sin detallar la topología) |
| Parametros totales | 15.927.753 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico de forecasting, no lingüístico) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `c6955142c10a769bdec6f6604ef7c86bbf8b86e797ab020cf3afd0ea06e26951`) |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una única red entrenada de forma conjunta sobre 13 campos, con un ensemble de 9 semillas empaquetado en el fichero de pesos (claves con prefijo `seedN.`). El autor menciona en la página del motor un encoder compartido de conjuntos de pronóstico, un kernel de sorpresa relacional y cabezas de salida nativas, pero no se detalla la topología interna (número de capas, dimensiones ocultas, mecanismo de atención o tipo de bloque). No se especifican el volumen de tokens ni la composición exacta del dataset de entrenamiento.

El proceso de selección de tamaño está documentado: se entrenaron tres tamaños (S, M y L), cada uno con 3 semillas, y las reglas fijadas antes del entrenamiento eligieron el tamaño por su puntuación en semanas de selección reservadas. M obtuvo la mejor puntuación (0.601, frente a 0.605 de L y 0.606 de S; menor es mejor). La huella del protocolo es `5efecd314ec23acbdcebfa58927e53ebc853fb4cbaa33007cabcc93f0e2fdac1`. No se menciona RLHF, DPO ni decodificación especulativa, dado que no es un modelo generativo de texto.

## Capacidades

- Predicción de series temporales en 13 dominios: crypto, economy-ecb, economy-philfed, energy, forecastbench, health-covid, health-flu, health-rsv, markets, markets-cross-venue, sea, weather-ensemble y weather-history.
- Ensemble de 9 semillas integrado en un único fichero de pesos, lo que permite reproducir exactamente las respuestas de examen con paridad de 1e-6 en proceso nuevo.
- Evaluación con corrección por comparaciones múltiples y validación en semanas posteriores para distinguir ganancias sostenidas de ruido.
- No dispone de tool calling, function calling, capacidades de agente, generación de texto, visión ni audio: es un modelo numérico de forecasting.
- No se documentan capacidades multilingües porque el modelo no procesa lenguaje natural.

## Casos de uso

- Predicción de precios de criptomonedas: el modelo muestra una ganancia medida de +7,9% (rango 95%: +4,9 a +10,4) frente a v1.05 en 19.202 casos de test, lo que lo hace adecuado para señales de corto plazo en ese dominio una vez pasen las comprobaciones de petición en fresco.
- Predicción meteorológica histórica: con una ganancia de +34,3% frente al rival más fuerte en el examen y una ventaja de -1,0% (menor error, rango -1,7 a -0,4) frente a v1.05 en 2.464 casos, sirve para reconstrucción y validación de series históricas.
- Análisis macroeconómico del BCE: con +24,4% de ganancia en examen y un comportamiento prácticamente neutro frente a v1.05 (-0,2%, rango -1,0 a +0,8 en 82 casos), puede emplearse como componente adicional en pipelines de previsión de indicadores europeos.
- Investigación metodológica en evaluación de modelos: el release documenta de forma explícita la diferencia entre ganancia aparente y ganancia real, útil para equipos que diseñan protocolos de validación con corrección por comparaciones múltiples.
- Reproducibilidad de experimentos: la paridad de 1e-6 en proceso nuevo y la huella de protocolo permiten replicar exactamente los resultados de examen en auditorías internas.
- Integración como ensemble ligero: con 15,9M de parámetros y un fichero de 0,1 GB, puede desplegarse en entornos con recursos limitados como componente de un sistema mayor de forecasting, siempre que se validen los dominios con ganancia sostenida (crypto, weather-history, economy-ecb).

## Benchmarks y rendimiento

| Campo | Ganancia en examen vs rival más fuerte | Veredicto corregido | Semanas posteriores | v1.06 vs v1.05 (menor error) | Rango 95% | Casos |
|---|---|---|---|---|---|---|
| crypto | +58,5% | gain | held | +7,9% | +4,9 a +10,4 | 19.202 |
| economy-ecb | +24,4% | gain | held | -0,2% | -1,0 a +0,8 | 82 |
| weather-history | +34,3% | gain | held | -1,0% | -1,7 a -0,4 | 2.464 |
| economy-philfed | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| energy | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| forecastbench | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| health-covid | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| health-flu | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| health-rsv | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| markets | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| markets-cross-venue | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |
| sea | no servido | gain | no se mantuvo | no disponible | no disponible | no disponible |
| weather-ensemble | no servido | sin diferencia medible | no se mantuvo | no disponible | no disponible | no disponible |

El autor advierte que bajo la misma regla de evaluación, v1.05 también puntúa +55,0% frente al mismo rival en crypto, de modo que la mayor parte del salto aparente de +13,4% a +58,5% proviene de la regla más estricta de v1.06 y no del modelo. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es lingüístico.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa para los 15,9M de parámetros (el repo ocupa 0,1 GB), por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; no requiere A100 ni H100. Una RTX 4090 o incluso una GTX 1650 son suficientes.
- Cabe en GPU consumer: sí, en todas las gamas actuales, y probablemente también en CPU para inferencia por lotes.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de forecasting con formato safetensors, requeriría cargarse con PyTorch/safetensors y un wrapper propio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeno v1.06 | 15,9M (M x 3 semillas) | no disponible | +7,9% vs v1.05 en crypto; +34,3% en weather-history | MIT | Hugging Face |
| Zeno v1.05 | 89,9M (3 modelos empaquetados) | no disponible | Modelo servido por defecto en zenodivergent.dev | MIT (según repo v105) | Hugging Face |
| Otros modelos de forecasting | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (forecasting multi-dominio) en la búsqueda realizada.

## Limitaciones y advertencias

- El autor indica explícitamente que este fichero no es el modelo servido: v1.05 sigue siendo la respuesta por defecto hasta que pasen las comprobaciones de petición en fresco.
- De los 13 campos, solo 3 (crypto, economy-ecb, weather-history) muestran ganancia sostenida; el resto no se sirve por falta de diferencia medible o por no mantenerse en semanas posteriores.
- La ganancia aparente en crypto (+58,5%) está inflada por la regla de evaluación más estricta; la ganancia real frente a v1.05 es de +7,9%.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, sin validación externa de la comunidad.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas porque el modelo no procesa lenguaje natural; el riesgo principal es la extrapolación a dominios o periodos no cubiertos por las semanas de validación.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción fuera de los dominios validados.
- El tamaño del repo (0,1 GB) y la ausencia de pipeline declarado dificultan la integración directa en frameworks estándar de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/ZenoDivergent/zeno-divergent-v106
- Modelo anterior v1.05: https://huggingface.co/mbarbosa1/zeno-divergent-v105
- Página del motor: https://zenodivergent.dev/engine
- Repositorio de resultados por caso: `mbarbosa1/zeno-divergent-runs` (referenciado en la model card)
