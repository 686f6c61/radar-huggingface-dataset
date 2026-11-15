# Yasshh814/gh-breakout-models

## Resumen

`gh-breakout-models` es un modelo de clasificación binaria tabular orientado a predecir la probabilidad de que un repositorio joven de GitHub experimente un crecimiento anómalo de estrellas (un "breakout") en los 30 días siguientes. Lo publica el usuario Yasshh814 en Hugging Face bajo el identificador `Yasshh814/gh-breakout-models`, y su propósito declarado es alimentar un leaderboard público diario de descubrimiento de repositorios. No es un modelo de lenguaje ni un transformer: es un LightGBM entrenado sobre 68 características tabulares derivadas de eventos de GitHub.

El modelo resuelve un problema de ranking y priorización: identificar, entre repositorios con menos de 90 días de antigüedad y menos de 200 estrellas, cuáles tienen mayor probabilidad de superar el umbral de breakout definido por el autor (ganancia de 30 días mayor o igual a max(100, cuantil 0,995 de la cohorte)). La etiqueta es relativa a cada snapshot, con una tasa base de aproximadamente el 0,5 % de positivos. El modelo se entrena con snapshots semanales (lunes) desde el 26 de abril de 2021 hasta el 21 de abril de 2025.

La relevancia actual del proyecto es metodológica: documenta con detalle un pipeline de validación con origen rodante, embargo temporal, calibración isotónica y explicaciones TreeSHAP, además de reconocer explícitamente limitaciones de fuente de datos (colapso de la captura de estrellas en GH Archive tras el 23 de mayo de 2025). No se dispone de información sobre arquitectura de red neuronal, tamaño de parámetros ni longitud de contexto porque no aplica a este tipo de modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM, clasificador binario) |
| Parámetros totales | no disponible (no aplica; modelo de árboles con 141 rondas de boosting) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada tabular de 68 características) |
| Tipos de cuantización | no disponible (no aplica a LightGBM en el material publicado) |
| Idiomas soportados | no disponible (no procesa texto libre; las características incluyen lenguaje primario del repositorio como variable categórica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el material menciona el artefacto LightGBM, pero no se especifica el formato de serialización) |

## Arquitectura y entrenamiento

El modelo es un LightGBM binario con 141 rondas de boosting y la siguiente configuración elegida: `num_leaves` 31, `min_data_in_leaf` 200, `feature_fraction` 0,8, `learning_rate` 0,05, `lambda_l2` 5,0 y `scale_pos_weight` 1,0. No se aplican restricciones monótonas. Durante el ajuste se subsamplea el 10 % de los negativos. La entrada son 68 características marcadas como `live_available` en `config/feature_dictionary.yaml` (sha256 `49d9891cbff5`), organizadas en tres niveles: Tier A (dinámica de estrellas, actividad, calidad de stargazers, tastemakers y propietario), Tier B (detalle de payload, nulo antes del 1 de junio de 2023) y Tier C (enriquecimiento: lenguaje primario, tipo de propietario, Hacker News).

Los datos de entrenamiento cubren snapshots semanales de los lunes entre el 26 de abril de 2021 y el 21 de abril de 2025, solo con etiquetas maduradas (4 años). Los últimos 3 meses, tras un embargo de 30 días, se reservan para detener el boosting y ajustar el calibrador. La evaluación usa validación cruzada con origen rodante (ventana expansiva, bloques de test de 3 meses, embargo de 30 días entre entrenamiento y test, nunca split aleatorio), con métricas out-of-fold e intervalos de confianza por bootstrap de bloques sobre fechas de snapshot. La calibración es regresión isotónica (Platt scaling por debajo de 200 positivos) ajustada sobre los últimos 3 meses de fechas de entrenamiento. Cada puntuación se acompaña de contribuciones TreeSHAP en log-odds.

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de breakout a 30 días para repositorios candidatos.
- Ranking de candidatos: produce una puntuación ordenable para alimentar un leaderboard diario.
- Calibración de probabilidades: salida calibrada con ECE en holdout de 0,00088 (frente a 0,03660 sin calibrar) y Brier de 0,00461 (frente a 0,01168 sin calibrar).
- Explicabilidad por instancia: contribuciones TreeSHAP en log-odds con las tres características positivas y dos negativas principales nombradas mediante el diccionario de características.
- Filtrado de candidatos mediante SQL común para entrenamiento y scoring diario (edad menor o igual a 90 días, menos de 200 estrellas antes de D, al menos 5 estrellas en [D-14, D), sin forks, mirrors ni repos de bots).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: es un modelo predictivo tabular, no un LLM.

## Casos de uso

- Leaderboard público de descubrimiento: el modelo puntúa diariamente la cohorte de repositorios jóvenes y de bajo recuento de estrellas para priorizar los que tienen mayor probabilidad de breakout, con explicaciones TreeSHAP que justifican cada posición.
- Investigación sobre dinámicas de popularidad en GitHub: permite estudiar qué señales tempranas (velocidad de estrellas, calidad de stargazers, tastemakers) anteceden a crecimientos anómalos, usando las contribuciones SHAP como variables de análisis.
- Priorización de curación editorial: un equipo que selecciona proyectos emergentes para un boletín o un programa de mentores puede usar el ranking para reducir el espacio de búsqueda a los candidatos con mayor probabilidad calibrada.
- Detección de crecimiento sospechoso como señal auxiliar: el detector de crecimiento sospechoso del pipeline marca repos con posible crecimiento falso, lo que permite contrastar picos anómalos frente a breakouts orgánicos (con la advertencia de que las estrellas falsas no se eliminan de la etiqueta).
- Análisis de cohortes por lenguaje y tipo de propietario: las características de Tier C permiten segmentar las predicciones por lenguaje primario y por tipo de propietario (organización frente a usuario) una vez recuperados los metadatos.
- Reproducción metodológica de pipelines de predicción temporal: el diseño de validación con origen rodante, embargo y calibración sirve como referencia para equipos que construyen modelos de series temporales con etiquetas relativas y datos censurados por la fuente.

## Benchmarks y rendimiento

Resultados de validación cruzada con origen rodante, agrupados sobre todos los folds de test:

| Modelo | PR-AUC [IC 95 %] | ROC-AUC | P@25 [IC 95 %] |
|---|---|---|---|
| gh-breakout | 0,1081 [0,1016, 0,1142] | 0,883 | 0,241 [0,228, 0,255] |
| B1 (velocidad a 7 días) | 0,0286 [0,0246, 0,0345] | 0,816 | 0,109 [0,100, 0,118] |

Resultados en holdout (28 de octubre de 2024 a 21 de abril de 2025; 26 snapshots, 285.198 filas, 1.444 positivos), sin uso para ajuste, early stopping ni calibración del modelo de evaluación:

| Modelo | PR-AUC | P@25 |
|---|---|---|
| gh-breakout | 0,1578 | 0,338 |
| B1 | 0,0323 | 0,106 |
| B2 | 0,0210 | 0,092 |
| B3 | 0,0256 | 0,102 |

Decisión de promoción: promovido, con diferencia de PR-AUC frente a B1 de +0,1255 [+0,1065, +0,1377] y diferencia de P@25 de +0,232 [+0,183, +0,268].

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; un modelo LightGBM de 141 árboles con 31 hojas por árbol es de tamaño reducido y no requiere GPU.
- GPU recomendadas: no disponibles ni necesarias; la inferencia es viable en CPU.
- Cabe en cualquier GPU consumer y en CPU de un solo núcleo para scoring por lotes, si bien el material no publica cifras de latencia.
- Opciones de despliegue: no se documentan en el material proporcionado (no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | PR-AUC (holdout) | P@25 (holdout) | Licencia |
|---|---|---|---|---|---|
| gh-breakout | LightGBM tabular | 68 características | 0,1578 | 0,338 | no disponible |
| B1 | Baseline de velocidad a 7 días | recuento de estrellas | 0,0323 | 0,106 | no aplica |
| B2 | Baseline (definición no detallada) | no disponible | 0,0210 | 0,092 | no aplica |
| B3 | Baseline (definición no detallada) | no disponible | 0,0256 | 0,102 | no aplica |

No se dispone de información sobre modelos de terceros comparables en la misma tarea de predicción de breakouts en GitHub.

## Limitaciones y advertencias

- La atención fuera de GitHub es invisible salvo por historias de Hacker News que enlacen al repositorio; un repo a punto de viralizarse en X, Reddit o YouTube no se detecta hasta que llegan las estrellas.
- Las desestrellas no son observables; solo se cuentan estrellas vía Events API.
- Las estrellas de granjas y bots no se eliminan de la etiqueta; un crecimiento rápido de estrellas falsas puede parecer un breakout. El detector de crecimiento sospechoso marca estos repos, pero no corrige la etiqueta.
- GitHub recortó los payloads de Events el 7 de octubre de 2025 (autor de PR, flag de merged, listas de commits). El modelo usa solo características que sobreviven al recorte; el historial anterior al 1 de junio de 2023 no tiene detalle de payload (Tier B nulo), por lo que esas señales solo se aprenden desde esa fecha.
- Tras el 23 de mayo de 2025 la captura de estrellas de GH Archive colapsó (ADR-009); los datos de entrenamiento y evaluación terminan ahí. El scoring en vivo sobre datos posteriores depende de la decisión sobre la fuente en vivo (ADR-010) y de metadatos (lenguaje, tipo de propietario) que aparecen como "Unknown" hasta ser recuperados.
- Censura por la izquierda: el historial del repositorio antes del primer evento observado es desconocido; `age_days` se mide desde la primera actividad observada.
- La etiqueta es relativa (top 0,5 % en cada snapshot) con un suelo de 100 estrellas; la tasa base de breakouts reales cambia con el tiempo y entre años.
- El entrenamiento usa snapshots semanales de los lunes; el scoring diario muestra efectos de día de la semana: la calibración sobrepredice en días no lunes (positivos observados sobre esperados de aproximadamente 0,73, frente a 0,90 en lunes). El ranking no se ve afectado.
- La licencia no está declarada en la información disponible, por lo que el uso comercial queda sin clarificar.
- El leaderboard no constituye un aval del repositorio, de sus propietarios ni de su código, ni una evaluación de calidad o seguridad.
- Se procesan nombres de repositorios públicos y nombres de usuario públicos de stargazers, agregados en características; no se publica tabla por usuario. Los propietarios pueden solicitar la retirada de un repositorio del leaderboard abriendo un issue en el repositorio del proyecto.

## Enlaces

- Hugging Face: https://huggingface.co/Yasshh814/gh-breakout-models
- Repositorio del proyecto: no disponible en la información proporcionada
- Paper: no disponible
- Blog o demo: no disponible
- Informes referenciados en la model card (`reports/model_cv.md`, `reports/figures/shap_importance.png`, `reports/figures/shap_beeswarm.png`, `config/feature_dictionary.yaml`): no disponibles como enlaces públicos en la información proporcionada
