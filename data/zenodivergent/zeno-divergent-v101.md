# ZenoDivergent/zeno-divergent-v101

## Resumen

Zeno v1.01 es un modelo de meta-forecasting desarrollado por ZenoDivergent que aborda un problema distinto al de los modelos de lenguaje convencionales: dado un conjunto de predicciones (forecasts) procedentes de multiples fuentes sobre una misma pregunta, el modelo aprende a detectar cuando el consenso del conjunto esta a punto de equivocarse y produce una respuesta corregida. Se distribuye como un paquete de PyTorch con un transformer compartido que opera sobre "forecasters tipados", agrupa fuentes relacionadas en familias y aplica adaptadores especificos por campo.

La version 1.01 sustituye a la 0.98 como preview publicada y se entrena de forma conjunta sobre 12 dominios: estado del mar, demanda energetica (NESO), gripe (CDC FluSight), mercados cross-venue, cripto (BTC/ETH horario), meteorologia por ensembles, mercados de prediccion, RSV, ForecastBench, COVID-19, encuesta de la Reserva Federal de Filadelfia y encuesta del BCE a analistas profesionales. El modelo no solo emite una respuesta corregida: tambien puede "abstenerse" (devolver la respuesta del consenso) y genera cabeceras de alerta temprana a nivel de miembro, familia y panel.

Es relevante porque propone un enfoque de "modelo de modelos" evaluado con un protocolo estricto por campo (semanas no vistas, intervalos de confianza, veredicto explicito de ganancia, empate o perdida). El repositorio de HuggingFace tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 0.0 GB, por lo que los pesos no parecen estar publicados en el hub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer compartido sobre forecasters tipados, con pooling por familia y adaptadores por campo |
| Parametros totales | no disponible (la model card solo indica que se eligio el tamano "S" entre S/M/L) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | paquete PyTorch (`zeno_v101.package`, carga via `load`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer compartido que consume forecasters "tipados" (cada fuente de prediccion con su tipo), agrega los forecasters relacionados en una misma familia mediante pooling y aplica adaptadores especificos por campo. Las salidas del modelo son cuatro: respuesta corregida, decision de abstenerse (sit-out), y alertas tempranas a nivel de miembro, familia y panel. El tamano "S" se selecciono en dias de seleccion reservados entre las variantes S/M/L, promediando tres semillas.

En cuanto a datos, el modelo se entrena conjuntamente sobre 12 campos con fuentes publicas: CDC FluSight, NESO, ForecastBench, mercados de prediccion, cripto horario BTC/ETH, ensembles meteorologicos, RSV hub, COVID-19 hub, encuesta de la Philadelphia Fed y encuesta del BCE. La model card no especifica el numero de tokens ni la composicion exacta del dataset, pero si detalla el protocolo de evaluacion: semanas no usadas ni para entrenamiento ni para seleccion, intervalos de confianza al 95%, y verificacion de que cada learner consumio todos los campos entrenados (paridad exacta de respuestas al recargar el paquete en un proceso nuevo). No se menciona RLHF ni DPO; el entrenamiento se describe como supervisado por campo.

Una innovacion destacable es la regla de abtencion: el modelo solo responde cuando espera superar al consenso por mas de un 2%; en caso contrario devuelve la respuesta del consenso. Ademas, cada campo se ajusta y evalua por separado, de modo que una ganancia en un dominio no puede enmascarar una perdida en otro.

## Capacidades

- Meta-forecasting: correccion de consensos a partir de multiples predicciones sobre la misma pregunta.
- Deteccion de sorpresa: cabeceras de alerta temprana a nivel de miembro, familia y panel (AUC de hasta 0.80 en gripe y mercados de prediccion).
- Abtencion selectiva: devuelve la respuesta del consenso cuando no espera superarlo por mas de un 2%.
- Prediccion sobre datos binarios (yes/no, con log loss) y numericos (9 cuantiles, con pinball loss).
- Soporte multi-campo: 12 dominios entrenados conjuntamente con adaptadores por campo.
- Carga en CPU (`load(".", "cpu")`) y ejecucion por lotes sobre un DataFrame de filas.
- No disponible: soporte de tool calling, capacidades de agente, vision, audio o generacion de lenguaje natural.

## Casos de uso

- Agregacion de pronosticos epidemiologicos: dado un panel de modelos de gripe (FluSight), el modelo corrige el consenso y emite alertas cuando el panel va a fallar; en el examen obtuvo +16.4% de skill frente al rival de referencia.
- Mercados de prediccion: integracion en pipelines que consumen odds de multiples venues para detectar divergencias entre el consenso calibrado y la senal corregida (+12.1% de skill en cross-venue).
- Cripto horario: correccion de consensos de precio BTC/ETH a frecuencia horaria (+7.4% de skill sobre 17,138 casos de examen).
- Demanda energetica: ajuste de predicciones de demanda NESO con un GBM tabular como rival (+23.7% de skill, aunque con menos de 5 semanas de examen).
- Estado del mar: correccion de paneles de prediccion oceanografica (+27.8% de skill, igualmente con semanas insuficientes para veredicto firme).
- Investigacion en meta-aprendizaje: base para estudiar cuando un ensemble de forecasters falla, gracias a las cabeceras de alerta temprana y al protocolo de evaluacion por campo.

## Benchmarks y rendimiento

Resultados de examen sobre semanas no vistas (skill = reduccion de error frente al rival mas fuerte elegido en dias de seleccion; log loss para binario, pinball de 9 cuantiles para numerico).

| Campo | Skill | Intervalo 95% | Casos | Rival | Veredicto |
|---|---|---|---|---|---|
| Sea state | +27.8% | semanas insuficientes | 4,532 | panel_reference | insuficiente |
| Energy (NESO) | +23.7% | semanas insuficientes | 2,731 | gbm_tabular | insuficiente |
| Flu (CDC FluSight) | +16.4% | +10.9% a +21.4% | 3,553 | panel_reference | ganancia |
| Cross-venue markets | +12.1% | +7.5% a +18.0% | 16 | calibrated_crowd | ganancia |
| Crypto (BTC/ETH) | +7.4% | +5.3% a +9.4% | 17,138 | calibrated_crowd | ganancia |
| Weather (ensembles) | +2.8% | semanas insuficientes | 6,543 | calibrated_crowd | insuficiente |
| Prediction markets | +0.4% | -0.3% a +0.9% | 10,220 | calibrated_crowd | sin diferencia |
| RSV hub | -1.0% | -3.9% a +1.0% | 521 | panel_reference | sin diferencia |
| ForecastBench | -1.9% | -4.7% a +0.9% | 4,819 | calibrated_crowd | sin diferencia |
| COVID-19 hub | -2.4% | -11.8% a +5.2% | 1,331 | panel_reference | sin diferencia |
| Philadelphia Fed | -2.4% | -3.7% a -1.1% | 380 | panel_reference | perdida |
| ECB SPF | -17.3% | -24.9% a -7.8% | 58 | panel_reference | perdida |

AUC de las cabeceras de alerta temprana en test:

| Campo | Alerta | AUC |
|---|---|---|
| Flu (CDC FluSight) | member | 0.80 |
| Flu (CDC FluSight) | family | 0.72 |
| Flu (CDC FluSight) | panel | 0.66 |
| Weather (ensembles) | member | 0.73 |
| Weather (ensembles) | panel | 0.63 |
| Prediction markets | member | 0.80 |
| Prediction markets | panel | 0.80 |
| RSV hub | member | 0.69 |
| COVID-19 hub | member | 0.69 |

Respecto a v0.98, cripto baja de +12.3% a +7.4%, COVID-19 pasa de +6.7% a empate y RSV pasa de perdida a empate.

## Requisitos de hardware

- VRAM estimada: no disponible (el tamano del repo es 0.0 GB y la model card no publica el numero de parametros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada; la unica referencia de ejecucion es CPU (`load(".", "cpu")`).
- Opciones de despliegue: paquete Python propio (`zeno_v101.package`), con carga en CPU y ejecucion por lotes sobre DataFrame. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|---|
| Zeno v1.01 | Transformer de meta-forecasting | no disponible (tamano S) | no disponible | Correccion de consensos en 12 campos | Apache 2.0 |
| Zeno v0.98 | Version previa del mismo modelo | no disponible | no disponible | Mismo enfoque, evaluacion menos estricta | Apache 2.0 |
| Modelos de forecasting especificos (GBM tabular, panel_reference) | Baselines usados como rivales | no disponible | no aplica | Prediccion directa por campo | no disponible |

No se dispone de informacion sobre modelos comparables de terceros en la documentacion proporcionada.

## Limitaciones y advertencias

- Es un research preview, no una senal de trading; no debe usarse como recomendacion de inversion.
- Energia, estado del mar y meteorologia tienen menos de 5 semanas de examen: sus ganancias no estan medidas de forma concluyente.
- Cross-venue solo cuenta con 16 casos de examen, insuficientes para generalizar.
- Perdidas claras en la encuesta de la Philadelphia Fed (-2.4%) y en la del BCE (-17.3%); el servicio alojado devuelve la referencia por defecto en esos campos.
- Campos mantenidos fuera del entrenamiento: weather-deterministic, hydrology, numinous y preguntas categoricas.
- Riesgo de alucinacion no evaluado en la documentacion; el modelo no es generativo de texto.
- No se publican datos de sesgo, idiomas ni restricciones adicionales mas alla de la licencia Apache 2.0.
- El repositorio no contiene pesos visibles (0.0 GB) ni pipeline definido; la disponibilidad practica del modelo no esta garantizada.

## Enlaces

- HuggingFace: https://huggingface.co/ZenoDivergent/zeno-divergent-v101
