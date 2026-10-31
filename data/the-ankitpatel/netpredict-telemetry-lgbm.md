# The-AnkitPatel/netpredict-telemetry-lgbm

## Resumen

NetPredict (The-AnkitPatel/netpredict-telemetry-lgbm) no es un modelo de lenguaje, sino un regresor tabular basado en LightGBM (Gradient Boosted Decision Trees) desarrollado por Ankit Kumar Patel, contribuidor de OpenTelemetry en la CNCF y afiliado al testbed de telemetría del National Institute of Technology, Uttarakhand e IIT Roorkee. Su objetivo es predecir la latencia de cola (queuing latency) a escala de microsegundos y milisegundos en redes cloud de alta concurrencia y pipelines de telemetría distribuida.

El problema que resuelve es la anticipación de saturación de buffers y anomalías de bufferbloat en redes: el modelo puede predecir la saturación de búfer entre 5 y 15 minutos antes de que se produzca pérdida de paquetes por tail-drop. Su rasgo diferenciador es la combinación con Split Conformal Prediction, que aporta intervalos de predicción con garantías de cobertura distribution-free en muestras finitas (1 − α = 0,95).

Es relevante ahora porque la observabilidad de redes con eBPF y OpenTelemetry se ha convertido en un estándar de facto en entornos cloud nativos, y los modelos GBDT ofrecen inferencia de latencia muy baja (p99 declarada de 0,142 ms), adecuada para ejecutarse en línea dentro de pipelines de telemetría. El modelo se distribuye bajo licencia MIT con pesos en formato de modelo nativo de LightGBM (archivo model.txt).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GBDT (Gradient Boosted Decision Trees) con LightGBM + calibración conformal (Split Conformal Prediction) |
| Parametros totales | no disponible (número de árboles/hojas no publicado) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | en (documentación; el modelo no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | model.txt (formato nativo de LightGBM, cargable con lgb.Booster) |

## Arquitectura y entrenamiento

El modelo es un regresor LightGBM GBDT entrenado sobre vectores de telemetría de red. Según el ejemplo de inferencia de la model card, las variables de entrada incluyen: ancho de banda de entrada en Mbps (ingress_mbps), número de flujos activos (active_flows), tasa de llegada en kilopaquetes por segundo (arrival_kpps), porcentaje de utilización del buffer (buffer_util_pct), tasa de pérdida de paquetes (loss_rate_pct) y jitter en milisegundos (jitter_ms). La variable objetivo es la latencia de cola unidireccional en milisegundos.

Sobre esta predicción puntual se aplica una capa de calibración mediante Split Conformal Prediction (implementada con SciPy, según la model card), que calcula un cuantil q a partir de un conjunto de calibración y produce intervalos [ŷ − q, ŷ + q] con cobertura empírica del 95,12 % en el conjunto de test, cumpliendo la garantía finita-muestral del 95,0 % sin supuestos distribucionales. No se ha publicado información sobre el número de muestras de entrenamiento, el periodo de recogida de datos, el testbed exacto de generación de telemetría ni los hiperparámetros del GBDT (número de árboles, learning rate, num_leaves).

## Capacidades

- Regresión tabular de latencia de red: predicción puntual de latencia de cola en milisegundos a partir de seis métricas de telemetría de flujo.
- Predicción con incertidumbre: generación de intervalos conformales [ŷ − q, ŷ + q] con cobertura garantizada del 95 % (empírica 95,12 %).
- Detección temprana de saturación de buffers: predicción de saturación de buffer entre 5 y 15 minutos antes de la pérdida de paquetes por tail-drop, orientada a planificación de flujos guiada por eBPF.
- Inferencia de latencia muy baja: p99 declarada de 0,142 ms, compatible con uso en línea dentro de pipelines de telemetría.
- Carga sencilla: pesos en formato nativo LightGBM descargables desde el Hub y cargables con lgb.Booster en pocas líneas de Python.
- No soporta procesamiento de lenguaje natural, visión, audio ni tool calling: es un modelo tabular puro.

## Casos de uso

- Planificación de flujos con eBPF: integrado en un agente de observabilidad que lee métricas de flujos vía eBPF, el modelo predice la latencia de cola por flujo y permite reenrutar o limitar tráfico antes del tail-drop.
- Alertado predictivo de bufferbloat: un sistema de monitorización consulta el modelo cada pocos segundos con las métricas del buffer (buffer_util_pct, jitter_ms) y dispara alertas 5–15 minutos antes de la degradación del tail latency.
- Autoscaling de microservicios consciente de incertidumbre: un orquestador usa el intervalo conformal [ŷ − q, ŷ + q] para decidir escalado solo cuando el límite superior del intervalo supera el SLO de latencia, reduciendo falsos positivos.
- Validación de SLOs de red: equipos de plataforma pueden verificar si la latencia predicha de una ruta o servicio cumple un SLO de cola, usando el R² de 0,9924 como indicador de fiabilidad del ajuste en entornos similares al entrenamiento.
- Telemetría en pipelines distribuidos: inserción en un pipeline OpenTelemetry como procesador que enriquece cada span con la latencia de red prevista y su banda de confianza.
- Benchmarking de infraestructura: comparación de configuraciones de red o instancias cloud generando predicciones de latencia bajo cargas sintéticas controladas mediante el Space interactivo de Hugging Face.
- Investigación en sistemas: base reproducible (licencia MIT) para experimentar con calibración conformal aplicada a telemetría de redes en entornos académicos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Valor | Unidad |
|---|---|---|
| RMSE (holdout test) | 0,3982 | ms |
| MAE (holdout test) | 0,2814 | ms |
| R² (holdout test) | 0,9924 | adimensional |
| Cobertura conformal 95 % | 95,12 % | garantía empírica satisfecha |
| Latencia de inferencia p99 | 0,142 | ms |

No se han publicado comparaciones con otros modelos ni la composición del conjunto de test, por lo que estos valores no permiten comparaciones directas con alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un GBDT de LightGBM, la inferencia se ejecuta en CPU y el consumo de memoria depende del número de árboles, no publicado; en general, modelos GBDT tabulares requieren del orden de unos pocos cientos de MB de RAM.
- GPU recomendadas: no necesarias; la inferencia es en CPU. No se menciona soporte GPU de LightGBM en la model card.
- Consumer hardware: sí, cualquier máquina moderna con Python, LightGBM y SciPy es suficiente; no requiere aceleradores.
- Despliegue: descarga del archivo model.txt vía huggingface_hub y carga con lgb.Booster; también disponible como Hugging Face Space interactivo (Gradio/Streamlit, según el Space). No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a modelos GBDT).
- Latencia y throughput: p99 de inferencia declarada de 0,142 ms por predicción; throughput máximo no disponible.

## Comparativa con modelos similares

No se han publicado comparaciones oficiales. Alternativas típicas de la misma categoria (regresion tabular de baja latencia para telemetria):

| Modelo | Tipo | Latencia inferencia | Incertidumbre nativa | Licencia |
|---|---|---|---|---|
| netpredict-telemetry-lgbm | LightGBM GBDT + conformal | 0,142 ms (p99, declarada) | Sí (intervalos conformales 95 %) | MIT |
| XGBoost / scikit-learn GradientBoosting (entrenados a medida) | GBDT | Baja (CPU, orden de ms) | No (requiere calibración adicional) | Apache-2.0 / BSD |
| TabPFN | Transformer tabular | Mayor (inferencia por conjunto de datos) | Sí (distribuciones predictivas) | no disponible |
| Modelos de series temporales (p. ej. Prophet, N-BEATS) | Series temporales | Variable | Parcial (intervalos estadísticos) | Variable |

La ventaja diferenciadora declarada de NetPredict frente a un GBDT "a secas" es la garantía de cobertura conformal finita-muestral y la latencia p99 muy baja orientada a uso en línea.

## Limitaciones y advertencias

- Métricas no verificadas: los valores de RMSE, MAE, R² y cobertura proceden de la model card del autor y están marcados como no verificados; no hay evaluación independiente ni detalles del conjunto de test.
- Riesgo de sobreajuste al testbed: un R² de 0,9924 sugiere posible evaluación en condiciones muy cercanas a las del entrenamiento; el rendimiento en redes con características distintas (topologías, tasas de paquetes, hardware) no está documentado.
- Esquema de entrada fijo: el modelo espera exactamente seis variables de telemetría; cambios de unidad, escala o semántica de las métricas degradarán las predicciones sin aviso.
- Sin gestión de deriva (drift): no se describe recalibración del conjunto conformal ante cambios de distribución del tráfico; la garantía del 95 % solo es válida bajo intercambiabilidad entre calibración y datos de inferencia.
- Alcance limitado: no procesa texto, ni logs no estructurados, ni series temporales crudas; requiere ingeniería previa de características desde la telemetría (p. ej. desde eBPF).
- Licencia: MIT, sin restricciones para uso comercial; no se identifican caveats legales.
- Adopción mínima: 0 descargas registradas en el Hub, sin comunidad ni historial de producción que respalde su fiabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/The-AnkitPatel/netpredict-telemetry-lgbm
- Space interactivo (NetPredict Conformal Telemetry): https://huggingface.co/spaces/The-AnkitPatel/netpredict-conformal-telemetry
- Perfil del autor: https://huggingface.co/The-AnkitPatel
- Paper, repositorio de código y demo adicional: no disponibles
