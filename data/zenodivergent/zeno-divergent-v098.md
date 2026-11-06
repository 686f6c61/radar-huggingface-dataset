# ZenoDivergent/zeno-divergent-v098

## Resumen

Zeno v0.98 es un modelo de meta-pronóstico desarrollado por ZenoDivergent que aborda un problema poco habitual: dado un conjunto de pronósticos (forecasts) emitidos por distintos agentes sobre una misma pregunta, aprender a detectar cuándo el consenso va a equivocarse con exceso de confianza. No es un modelo de lenguaje generalista ni un generador de texto, sino un sistema especializado en agregación y corrección de pronósticos sobre series temporales y mercados de predicción.

La versión 0.98 es la primera que unifica en un único modelo el entrenamiento sobre diez dominios distintos: criptomonedas, mercados de predicción, mercados entre venues, ForecastBench, la encuesta del BCE, energía, COVID-19, RSV, estado del mar y ensembles meteorológicos. La arquitectura es un transformer compartido que opera sobre pronosticadores tipados (hasta 256 por panel), con adaptadores por campo y cinco salidas: respuesta corregida, abstención (sit-out) y tres tipos de alerta temprana (miembro, familia y panel).

El modelo se distribuye como un paquete de Python que se recarga en un proceso limpio con paridad exacta de respuestas sobre filas crudas de los diez campos. Está pensado como research preview, no como señal de trading, y su relevancia actual radica en que demuestra que un solo modelo puede transferir entre dominios de forecasting heterogéneos manteniendo mejoras medibles frente al consenso calibrado en varios de ellos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compartido sobre pronosticadores tipados (≤256 por panel), con adaptadores por campo |
| Parametros totales | no disponible (tamaño "S" seleccionado entre S/M/L, sin cifra publicada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo numérico/estructural, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (paquete Python `zeno_v098.package`, librería PyTorch) |

## Arquitectura y entrenamiento

El modelo es un transformer compartido que procesa paneles de pronosticadores tipados, agrupando pronosticadores relacionados en una misma familia y aplicando adaptadores específicos por campo. Produce cinco salidas por pregunta: la respuesta corregida, una decisión de abstención y tres cabezas de alerta temprana (miembro, familia y panel) que clasifican qué pronósticos tienen probabilidad de fallar. El tamaño "S" se eligió sobre días de selección reservados entre las variantes S/M/L, promediando tres semillas.

El entrenamiento se realizó en una única GPU H200 a partir de filas fuente con hash fijado (hash-pinned), y el autor indica que cada aprendiz demostró haber consumido todos los campos. Los datos cubren diez dominios: cripto (BTC/ETH horario), mercados de predicción, mercados entre venues, ForecastBench, encuesta del BCE, energía (demanda NESO), COVID-19, RSV, estado del mar y ensembles meteorológicos. No se especifica el número de tokens ni la composición exacta del dataset, ni si hubo RLHF/DPO (no aplica en el sentido habitual al no ser un modelo generativo de lenguaje).

La innovación destacable es el enfoque "model of models": en lugar de pronosticar directamente, el modelo aprende a leer el desacuerdo y la calibración del conjunto de pronosticadores para anticipar errores del consenso. Las métricas de evaluación son log loss para preguntas binarias y pinball de 9 cuantiles para valores numéricos.

## Capacidades

- Corrección de pronósticos agregados: recibe múltiples forecasts sobre una misma pregunta y devuelve una respuesta corregida.
- Detección de consenso erróneo: cabezas de alerta temprana que identifican pronósticos con alta probabilidad de fallar (AUC hasta 0.80 en mercados de predicción).
- Abstención selectiva (sit-out): el modelo puede decidir no emitir corrección cuando la evidencia no lo justifica.
- Alertas a tres niveles: por miembro individual, por familia de pronosticadores y por panel completo.
- Transferencia entre dominios: un único modelo entrenado conjuntamente sobre diez campos heterogéneos.
- Soporte de preguntas binarias (log loss) y numéricas (pinball de 9 cuantiles).
- Paridad exacta de respuestas al recargar el paquete en un proceso limpio sobre filas crudas.
- No dispone de tool calling, capacidades de agente, visión, audio ni generación de texto libre.

## Casos de uso

- Agregación de pronósticos cripto: dado un panel de forecasts horarios de BTC/ETH, el modelo corrige el consenso y reduce el error un 12.3% frente al crowd calibrado, útil para sistemas de investigación cuantitativa que necesitan una estimación agregada más fiable.
- Vigilancia de mercados de predicción: las cabezas de alerta (AUC 0.80) permiten marcar qué forecasts tienen más probabilidad de fallar, lo que sirve para priorizar revisión manual o ajustar pesos en un agregador existente.
- Monitorización epidemiológica: en el hub de COVID-19 el modelo mejora un 6.7% al panel de referencia y genera alertas por miembro (AUC 0.70), aplicable a equipos que consolidan forecasts de múltiples grupos de modelado.
- Investigación en meta-aprendizaje: como research preview, sirve para estudiar transferencia entre dominios de forecasting y para reproducir los experimentos del autor con paridad exacta de respuestas.
- Evaluación de paneles de expertos: la salida de abstención y las alertas por familia permiten auditar qué subconjuntos de pronosticadores aportan señal y cuáles introducen sesgo.
- Integración en pipelines de series temporales: el paquete Python se carga en CPU o GPU y procesa dataframes de filas crudas, lo que facilita incorporarlo como etapa de post-procesado en un sistema de forecasting existente.
- Análisis de ensembles meteorológicos: aunque el veredicto es "insuficiente" por falta de semanas de examen, las alertas por miembro (AUC 0.74) pueden usarse de forma exploratoria para detectar miembros desviados en un ensemble.

## Benchmarks y rendimiento

Resultados de examen sobre semanas no vistas (skill = reducción de error frente al rival más fuerte elegido en días de selección; log loss para binarias, pinball de 9 cuantiles para numéricas):

| Campo | Skill | Intervalo 95% | Casos de examen | Rival | Veredicto |
|---|---|---|---|---|---|
| Estado del mar | +26.3% | demasiado pocas semanas | 4,532 | panel_reference | insuficiente (<5 bloques semanales) |
| Mercados entre venues | +26.0% | +1.8% a +40.1% | 16 | calibrated_crowd | ganancia |
| Energía (demanda NESO) | +26.0% | demasiado pocas semanas | 2,731 | gbm_tabular | insuficiente (<5 bloques semanales) |
| Cripto (BTC/ETH horario) | +12.3% | +9.5% a +15.0% | 17,138 | calibrated_crowd | ganancia |
| COVID-19 hub | +6.7% | +3.0% a +10.1% | 1,331 | panel_reference | ganancia |
| Meteorología (ensembles) | +3.0% | demasiado pocas semanas | 6,543 | calibrated_crowd | insuficiente (<5 bloques semanales) |
| ForecastBench | +1.6% | -2.4% a +5.0% | 4,478 | calibrated_crowd | sin diferencia medible |
| Mercados de predicción | -0.1% | -0.5% a +0.4% | 10,220 | calibrated_crowd | sin diferencia medible |
| RSV hub | -5.2% | -11.6% a -1.3% | 521 | panel_reference | pérdida |
| Encuesta del BCE | -16.2% | -23.1% a -6.9% | 58 | panel_reference | pérdida |

AUC de las cabezas de alerta temprana (test):

| Campo | Alerta | AUC |
|---|---|---|
| COVID-19 hub | miembro | 0.70 |
| Meteorología (ensembles) | miembro | 0.74 |
| Meteorología (ensembles) | panel | 0.63 |
| Mercados de predicción | miembro | 0.80 |
| Mercados de predicción | panel | 0.80 |
| RSV hub | miembro | 0.65 |

## Requisitos de hardware

- Entrenamiento: una GPU H200 según la model card.
- VRAM de inferencia: no disponible; el tamaño "S" no se publica en parámetros, por lo que no puede estimarse con rigor.
- GPU recomendadas: no disponible. El paquete admite ejecución en CPU (`load(".", "cpu")`) y presumiblemente en GPU, pero no se especifican modelos concretos.
- ¿Cabe en GPU consumer? No disponible; al ser un transformer de tamaño "S" es plausible, pero no hay dato confirmado.
- Despliegue: paquete Python propio (`zeno_v098.package`) con funciones `load` y `answer`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican al ser un modelo numérico, no generativo de texto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de meta-forecasting entrenados conjuntamente sobre múltiples dominios. Los rivales citados en los benchmarks son agregadores y referencias, no modelos publicados comparables:

| Alternativa | Tipo | Resultado frente a Zeno v0.98 |
|---|---|---|
| calibrated_crowd | Consenso calibrado | Zeno gana en cripto (+12.3%) y empata en ForecastBench y mercados de predicción |
| panel_reference | Panel de referencia | Zeno gana en COVID-19 (+6.7%) y pierde en RSV (-5.2%) y BCE (-16.2%) |
| gbm_tabular | Modelo tabular GBM | Zeno +26.0% en energía, pero veredicto insuficiente por pocas semanas |

## Limitaciones y advertencias

- Research preview explícito: el autor indica que no es una señal de trading.
- Rendimiento negativo en la encuesta del BCE (-16.2%) y en RSV (-5.2%), con intervalos que excluyen el cero en ambos casos.
- Sin diferencia medible frente al consenso en ForecastBench y mercados de predicción.
- Veredictos "insuficientes" en estado del mar, energía y meteorología por menos de cinco bloques semanales de examen: no hay evidencia sólida de ganancia en esos campos.
- Campos retenidos sin resolver: health-flu (emparejamiento no resuelto), economy-philfed (fechas de publicación no probadas), hydrology (sin resultados almacenados), numinous (solo retrospectivo) y weather-deterministic (pocos días de decisión para un split temporal).
- Riesgo de sobreajuste a los dominios de entrenamiento pese a la evaluación en semanas no vistas; los tamaños de muestra en algunos campos son pequeños (16 casos en mercados entre venues, 58 en BCE).
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, agentes ni capacidades multilingües.
- Licencia Apache 2.0 permite uso comercial, pero el estado de research preview y la ausencia de garantías de rendimiento desaconsejan su uso en producción sin validación propia.
- No se publican sesgos conocidos ni detalles sobre composición del dataset más allá de los diez campos citados.

## Enlaces

- Hugging Face: https://huggingface.co/ZenoDivergent/zeno-divergent-v098
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
