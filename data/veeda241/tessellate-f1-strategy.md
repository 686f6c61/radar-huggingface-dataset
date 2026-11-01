# Veeda241/tessellate-f1-strategy

## Resumen

Tessellate F1 Strategy es un modelo de regresión tabular basado en CatBoost que predice la posición final de un monoplaza de Fórmula 1 a partir de una instantánea de carrera, y que se utiliza dos veces sobre el mismo estado para resolver una decisión contrafactual de estrategia: entrar a boxes ahora o mantenerse en pista. Lo desarrolla el usuario Veeda241 bajo el paraguas de "Tessellate AI" y se publica con licencia MIT. No es un modelo de lenguaje ni un transformer: es un regresor de gradient boosting sobre árboles de decisión, empaquetado en el formato binario nativo de CatBoost (`.cbm`).

El problema que aborda es acotado y concreto: dado un circuito, las vueltas restantes, la posición actual, la edad y el compuesto del neumático, los huecos con el coche de delante y de detrás, la pérdida en el pit lane y un índice de ritmo del piloto, estimar la posición de llegada. La innovación metodológica es el contrato contrafactual: se puntúa la misma instantánea con `will_pit = 1` y con `will_pit = 0`, y se compara la proyección resultante; la diferencia entre ambas es la ganancia o pérdida esperada en posiciones.

Es relevante ahora por su honestidad metodológica y su bajo coste de despliegue: el artefacto pesa unos 460 KB, la inferencia es de milisegundos en CPU y el repositorio incluye el esquema de características, las constantes de circuito y un script de ejemplo. La advertencia principal es que el modelo se ha entrenado sobre un generador físico simulado, no sobre telemetría real de Fórmula 1, por lo que sus métricas describen el ajuste al simulador y no el rendimiento en carrera real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (CatBoost, modo regresión) |
| Parámetros totales | No disponible (modelo de árboles; no aplica el recuento de parámetros de redes neuronales) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; entrada fija de 11 características tabulares por instancia |
| Tipos de cuantización | No disponible; el artefacto se distribuye en binario nativo `.cbm` de CatBoost |
| Idiomas soportados | No disponible; las características categóricas son cadenas en inglés (`track_id`, `tire_compound`) |
| Licencia | MIT |
| Formato de pesos | `.cbm` (binario nativo de CatBoost; no ONNX, no Pickle) |

## Arquitectura y entrenamiento

El modelo es un regresor CatBoost con 11 características de entrada: dos categóricas (`track_id` y `tire_compound`, tratadas de forma nativa por CatBoost y ya vinculadas dentro del `.cbm`) y nueve numéricas (`laps_remaining`, `current_position`, `tire_age`, `gap_ahead`, `gap_behind`, `pit_loss_s`, `rejoin_gap_s`, `driver_pace_index` y `will_pit`). La característica `will_pit` es la única que varía entre las dos llamadas contrafactuales. Las importancias declaradas sitúan `current_position` (45,69) y `will_pit` (22,50) como las más relevantes, seguidas de `tire_age` (9,17) y `driver_pace_index` (7,37). Los hiperparámetros concretos están en `model_metadata.json`, no en la información disponible.

El entrenamiento no usa telemetría real: los datos provienen de un generador físico determinista incluido en `core/pipeline.py`, con 20 circuitos × 600 instantáneas = 12.000 filas. La etiqueta `final_position` se produce con un modelo explícito de tiempos por vuelta que incorpora degradación por compuesto con acantilado (SOFT a 15 vueltas, MEDIUM a 22, HARD a 30), penalización por aire sucio al reincorporarse detrás de otro coche, ganancia en aire limpio cuando el hueco de delante cubre la pérdida en el pit lane y ruido gaussiano de resultado con σ = 0,7 posiciones. Existe un extractor basado en FastF1 para construir la misma matriz desde resultados reales (`python -m core.pipeline --real`), pero el archivo público se generó con el simulador porque el archivo upstream exige una cuenta autenticada de F1.

La evaluación usa GroupKFold(3) agrupado por `track_id`, de modo que cada partición se puntúa sobre circuitos no vistos, lo que mide generalización entre circuitos y no memorización del ruido de un trazado concreto. El dato de RMSE de validación cruzada aparece truncado en la model card ("1."), por lo que no se puede reproducir aquí con exactitud.

## Capacidades

- Regresión tabular: predice la posición final (valor continuo; menor es mejor) a partir de una instantánea de carrera de 11 campos.
- Evaluación contrafactual de estrategia: al puntuar el mismo estado con `will_pit = 1` y `will_pit = 0`, devuelve la proyección de llegada en ambos escenarios y la diferencia en posiciones.
- Manejo nativo de variables categóricas: `track_id` y `tire_compound` se procesan sin codificador externo ni fichero de vocabulario.
- Memoria de circuito en tiempo de servicio: `track_constants.json` aporta `pit_loss`, `traffic_index` y `total_laps` para 20 circuitos, necesarios para completar la inferencia.
- Comportamiento coherente con la física declarada: en Mónaco (24,5 s de pérdida en el pit lane, tráfico alto) la llamada es STAY OUT en todas las edades de neumático probadas; en Silverstone con blandos desgastados la llamada cambia de STAY OUT a BOX NOW a medida que el hueco de delante se acerca a los 21,5 s de pérdida, y vuelve a cambiar cuando `rejoin_gap_s` se hace lo bastante negativo como para reincorporarse en tráfico.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un regresor de una sola pasada.

## Casos de uso

- Asistencia a la toma de decisiones en el muro de boxes: dado un estado de carrera, el modelo devuelve dos proyecciones de posición final y la diferencia entre ellas, lo que permite comparar de forma cuantitativa la opción de parar frente a la de continuar en pista en milisegundos y sin infraestructura de GPU.
- Simulación de estrategia en herramientas de análisis: al ser un artefacto de 460 KB con inferencia en CPU, se puede incrustar en un cuaderno o en un servicio ligero para barrer combinaciones de vueltas restantes, edad de neumático y huecos, y construir mapas de decisión por circuito.
- Docencia y divulgación de estrategia en motorsport: el contrato contrafactual y las constantes de circuito explícitas hacen el razonamiento auditable, lo que resulta útil para explicar por qué una parada compensa o no en función del trazado.
- Prototipado de pipelines de decisión en deportes: sirve como referencia de arquitectura para sistemas que comparan dos acciones sobre el mismo estado mediante un único modelo y una variable indicadora, patrón reutilizable en otros dominios con decisiones binarias.
- Validación de generadores de datos sintéticos: al estar entrenado sobre un simulador físico con parámetros conocidos, permite comprobar si un generador alternativo reproduce las tendencias esperadas (acantilado de degradación, penalización por aire sucio, umbral de pérdida en el pit lane).
- Integración como componente de un sistema mayor de análisis de carrera: el modelo expone un esquema de 11 campos estable y un fichero de constantes separado, de modo que un orquestador puede alimentarlo con instantáneas sucesivas y registrar la evolución de la recomendación vuelta a vuelta.

## Benchmarks y rendimiento

La model card declara una evaluación con GroupKFold(3) agrupado por `track_id`, pero el valor de RMSE de validación cruzada aparece truncado en la información disponible ("CV RMSE | **1."). No se han publicado resultados completos de benchmarks en la información disponible, y no se ofrecen comparaciones con otros modelos.

| Métrica | Valor |
|---|---|
| Validación cruzada | GroupKFold(3), agrupada por `track_id` |
| CV RMSE | No disponible (dato truncado en la model card) |
| Conjunto de evaluación | 20 circuitos × 600 instantáneas = 12.000 filas, generadas por simulador |

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU. El artefacto `.cbm` ocupa aproximadamente 460 KB.
- GPU recomendadas: ninguna necesaria. CatBoost puede usar GPU opcionalmente, pero para este tamaño no aporta ventaja práctica.
- Cabe en cualquier GPU de consumo y en máquinas sin GPU; también en entornos con recursos muy limitados.
- Opciones de despliegue: biblioteca `catboost` (versión fijada en el ejemplo, 1.2.10) junto con `pandas` y `huggingface_hub` para la descarga; carga mediante `CatBoostRegressor().load_model()`. No se distribuye en ONNX ni Pickle, por lo que no es compatible directamente con runtimes de ONNX.
- Latencia y throughput: no se publican cifras. Por el tamaño del modelo y la naturaleza de la inferencia (una predicción sobre 11 campos), se espera una latencia de milisegundos en CPU, pero este dato no está confirmado en la información disponible.
- Requisito adicional en servicio: es imprescindible cargar `track_constants.json` para obtener `pit_loss_s` del circuito; sin él la inferencia queda incompleta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de regresión tabular aplicados a estrategia de Fórmula 1 en la documentación proporcionada. Como referencia de categoría, se puede contrastar con alternativas genéricas de gradient boosting, aunque no se han publicado métricas de este modelo que permitan una comparación cuantitativa.

| Modelo | Tipo | Tamaño del artefacto | Contexto / entrada | Licencia | Métricas publicadas |
|---|---|---|---|---|---|
| Tessellate F1 Strategy | CatBoost, regresión tabular | ~460 KB | 11 características tabulares | MIT | CV RMSE no disponible (truncado) |
| XGBoost (genérico) | Gradient boosting | No disponible | Tabular | Apache 2.0 | No aplica |
| LightGBM (genérico) | Gradient boosting | No disponible | Tabular | MIT | No aplica |
| scikit-learn GradientBoostingRegressor | Gradient boosting | No disponible | Tabular | BSD-3-Clause | No aplica |

## Limitaciones y advertencias

- Entrenado sobre datos simulados, no sobre telemetría real: las métricas describen el ajuste al generador físico, no el comportamiento en carreras reales. Cualquier conclusión sobre estrategia real exige reentrenar con el extractor FastF1 y datos autenticados.
- El valor de CV RMSE está truncado en la model card, lo que impide verificar la calidad declarada del ajuste.
- Dependencia obligatoria de `track_constants.json`: sin las constantes de circuito (`pit_loss`, `traffic_index`, `total_laps`) la inferencia está incompleta, y solo se cubren 20 circuitos.
- Cobertura limitada a 20 circuitos y a tres compuestos (SOFT, MEDIUM, HARD); no contempla neumáticos intermedios ni de lluvia, ni condiciones de pista mojada.
- El modelo no modela safety cars, banderas rojas, abandonos, penalizaciones ni dinámica completa del tráfico más allá de los huecos inmediatos de delante y detrás.
- Riesgo de extrapolación: al ser un regresor sobre un espacio de 11 características, valores fuera del rango del generador (por ejemplo, huecos negativos o edades de neumático muy superiores al acantilado) producen predicciones no validadas.
- El ruido gaussiano introducido en el entrenamiento (σ = 0,7 posiciones) fija un suelo de error irreducible respecto al simulador.
- Licencia MIT: permite uso comercial y modificación con atribución, pero no hay garantía alguna sobre idoneidad para decisiones reales; el propio autor advierte de que se lea la sección de datos de entrenamiento antes de extraer conclusiones.
- El formato `.cbm` limita la portabilidad frente a ONNX; la integración requiere la biblioteca CatBoost y una versión compatible (el ejemplo fija 1.2.10).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Veeda241/tessellate-f1-strategy
- Documentación del sistema incluida en el repositorio: `Tessellate-AI_Architecture_and_Use_Cases.pdf` (16 páginas, ~690 KB)
- Script de inferencia de ejemplo: `example_inference.py` en el repositorio
- Esquema de características e hiperparámetros: `model_metadata.json` en el repositorio
- Constantes de circuito: `track_constants.json` en el repositorio
- Generador de datos y extractor FastF1: módulo `core/pipeline.py` (referenciado en la model card; no se proporciona URL externa)
- Documentación de CatBoost: https://catboost.ai/docs/
- FastF1: https://github.com/theOehrly/Fast-F1
