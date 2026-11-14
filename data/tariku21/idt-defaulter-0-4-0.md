# Tariku21/idt-defaulter-0.4.0

## Resumen

`idt-defaulter-0.4.0` es un modelo de clasificación tabular publicado por Tariku21 en Hugging Face, diseñado para predecir la probabilidad de que un lactante o niño pequeño no acuda a su próxima dosis de vacunación rutinaria dentro del plazo previsto. Forma parte de la plataforma Immunization Defaulter Tracker (IDT) y está orientado a trabajadores comunitarios de salud y centros de atención primaria en entornos con recursos limitados, con un calendario de inmunización modelado explícitamente sobre el esquema etíope (Pentavalente, Sarampión, Rotavirus, PCV, OPV y BCG).

Técnicamente no es una red neuronal ni un modelo de lenguaje: se trata de un clasificador XGBoost de 612 árboles de decisión con profundidad máxima 5 y tasa de aprendizaje 0,03, calibrado mediante escalado de Platt (sigmoid) sobre 62 variables tabulares de tipo demográfico, hogar, dosis previas, accesibilidad geográfica y carga de trabajo del personal sanitario. El horizonte de predicción es de 7 días antes de la fecha programada de la dosis.

Su relevancia radica en el enfoque operativo: además del clasificador, incorpora umbrales de decisión estratificados por quintil de riqueza del hogar para adaptarse a la capacidad limitada de los centros de salud, y una capa de explicabilidad basada en TreeSHAP. El modelo se distribuye como artefacto `joblib` bajo licencia Apache 2.0 y declara una garantía estricta de cero PII en su esquema de características.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | XGBoost Classifier (gradient boosting sobre árboles de decisión), 612 árboles, profundidad máxima 5, learning rate 0,03 |
| Parámetros totales | no disponible (modelo tabular; el número de parámetros no es una métrica aplicable) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de 62 características, sin secuencia de texto) |
| Tipos de cuantización | no disponible (artefacto `joblib`; no se documentan cuantizaciones) |
| Idiomas soportados | en (etiqueta declarada; el modelo no procesa texto libre, opera sobre variables tabulares) |
| Licencia | Apache 2.0 |
| Formato de pesos | `joblib` (serialización Scikit-Learn/Joblib) |
| Algoritmo | XGBoost Classifier |
| Calibración | Platt Scaling (sigmoid, `CalibratedClassifierCV`) |
| Número de características | 62 variables tabulares |
| Horizonte de predicción | 7 días antes de la fecha programada de la dosis |
| Población objetivo | Niños de 0 a 24 meses en inmunización rutinaria EPI |
| Métrica principal | ROC-AUC 0,84; Brier Score < 0,12 |
| Fecha de corte de datos | 2026-10-27 |
| Fecha de entrenamiento | 2026-11-09T08:33:50+00:00 |
| Hash SHA-256 del artefacto | `e2e6acac503459f48500326127a99eda2443aa09e9bed47218a1edd9ed4675d2` |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es un ensamblado de gradient boosting sobre árboles de decisión implementado con XGBoost, con 612 árboles, profundidad máxima de 5 y tasa de aprendizaje de 0,03. Sobre la salida del clasificador se aplica una calibración de Platt mediante `CalibratedClassifierCV` con función sigmoide, de modo que las probabilidades emitidas sean interpretables como riesgo calibrado y no solo como puntuaciones de ranking. La entrada es una matriz de 62 características tabulares que cubren datos demográficos, composición del hogar, historial de dosis previas, accesibilidad geográfica (tiempos y distancias de desplazamiento por rangos) y carga de trabajo del personal sanitario.

El modelo se entrenó con datos etiquetados como `synthetic` según los metadatos del repositorio, con fecha de corte 2026-10-27 y entrenamiento el 2026-11-09. Se evaluaron los antígenos BCG, OPV, Penta (1-3), PCV (1-3), Rota (1-2) y Measles (1-2). No se documenta en la información disponible el volumen de tokens, el número de registros de entrenamiento ni la composición detallada del dataset, ni si se aplicaron técnicas de regularización específicas más allá de los hiperparámetros indicados. La innovación destacable no es arquitectónica sino operativa: los umbrales de decisión estratificados por quintil de riqueza del hogar (desde 0,1140 en Q5 hasta 0,3249 en Q1) permiten ajustar la sensibilidad del sistema a la capacidad real de los centros sanitarios y priorizar a los hogares con mayor necesidad.

## Capacidades

- Predicción de probabilidad calibrada de abandono (defaulter) de la próxima dosis de vacunación rutinaria en un horizonte de 7 días.
- Clasificación tabular sobre 62 características con soporte para datos demográficos, de hogar, historial de dosis, accesibilidad geográfica y carga de trabajo.
- Umbrales de decisión estratificados por quintil de riqueza del hogar (Q1 a Q5) más un umbral global por defecto de 0,2122.
- Explicabilidad por instancia mediante TreeSHAP, orientada a justificar la priorización de recordatorios y visitas domiciliarias.
- Garantía de cero PII: el esquema rechaza nombres, teléfonos, identificadores nacionales y coordenadas GPS exactas; la ubicación se abstrae a identificadores de woreda y rangos de tiempo/distancia de desplazamiento.
- Verificación de integridad criptográfica del artefacto mediante SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de texto, visión o audio: es un clasificador tabular puro.

## Casos de uso

- Priorización de visitas domiciliarias por trabajadores comunitarios de salud: el modelo puntúa a cada niño con una probabilidad calibrada de abandono y el umbral del quintil Q1 (0,3249) identifica a los hogares más vulnerables para asignar la visita del CHW con mayor antelación.
- Envío de recordatorios SMS automatizados: con el umbral del quintil Q5 (0,1140) o el global (0,2122), el sistema puede disparar recordatorios automáticos a las familias con riesgo moderado sin consumir recursos de personal.
- Gestión de la capacidad asistencial en centros de atención primaria: los cinco umbrales por quintil permiten calibrar cuántos niños entran en la cola de seguimiento según el personal disponible, evitando saturar al equipo cuando la carga es alta.
- Seguimiento de cohortes por antígeno: al haberse evaluado BCG, OPV, Penta (1-3), PCV (1-3), Rota (1-2) y Measles (1-2), el modelo puede integrarse en paneles de monitorización por dosis para detectar caídas de cobertura en series específicas.
- Auditoría y transparencia clínica: las explicaciones TreeSHAP permiten al personal sanitario entender por qué un niño concreto aparece como de alto riesgo, lo que facilita la revisión por supervisores y la rendición de cuentas en programas de salud pública.
- Investigación en equidad sanitaria: la estratificación por quintil de riqueza incorporada en los umbrales permite analizar disparidades de acceso a la vacunación y evaluar intervenciones diferenciadas por nivel socioeconómico.
- Integración en plataformas de salud digital: al distribuirse como artefacto `joblib` cargable con Scikit-Learn, puede embeberse en backends Python de sistemas de historia clínica electrónica o en pipelines de datos de ONG y ministerios de salud.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| ROC-AUC | 0,84 |
| Brier Score | < 0,12 |
| Precisión | no disponible (la métrica está declarada en los tags pero no se publica el valor) |
| Recall | no disponible (la métrica está declarada en los tags pero no se publica el valor) |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; es un modelo tabular XGBoost que se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna necesaria. Cualquier CPU moderna es suficiente para la inferencia.
- Compatibilidad con GPU de consumo: no aplica; el modelo cabe holgadamente en memoria RAM convencional (el repositorio ocupa 0,0 GB).
- Opciones de despliegue: carga directa con `joblib` y Scikit-Learn en Python; también puede servirse mediante frameworks de inferencia para modelos tabulares o envolverse en una API REST propia. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; para un ensamblado de 612 árboles de profundidad 5 la inferencia por instancia es típicamente del orden de milisegundos en CPU, aunque no se documenta una medición oficial.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo tabular de nicho (predicción de abandono de inmunización infantil en Etiopía) sin alternativas documentadas en la misma ficha.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| idt-defaulter-0.4.0 | no aplica (XGBoost, 612 árboles) | no aplica (62 características tabulares) | ROC-AUC 0,84; Brier < 0,12 | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo se entrenó con datos etiquetados como `synthetic`; su validez sobre poblaciones reales no está documentada en la información disponible y requiere validación externa antes de uso en producción.
- Es una herramienta de apoyo a la decisión clínica, no un sistema de diagnóstico: no debe sustituir el juicio clínico, el triaje pediátrico agudo ni la evaluación de contraindicaciones vacunales.
- El calendario de inmunización está modelado sobre el esquema etíope; su transferibilidad a otros países o calendarios no está validada.
- El esquema de características exige exactamente 62 variables en el formato esperado; entradas incompletas o con distribuciones distintas a las de entrenamiento pueden degradar la calibración.
- Riesgo de sesgo por la estratificación por quintil de riqueza: los umbrales incorporan una decisión de equidad explícita que debe revisarse y ajustarse al contexto local antes de desplegarse.
- La calibración de Platt asume que la distribución de los datos de producción se mantiene estable respecto al corte de 2026-10-27; cambios en la cobertura vacunal o en la recogida de datos pueden invalidarla.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y el autor no asume responsabilidad sobre decisiones clínicas derivadas de su uso.
- No procesa texto libre, imágenes ni audio, y no soporta interacción conversacional ni razonamiento multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tariku21/idt-defaulter-0.4.0
- Documentación de XGBoost: https://xgboost.readthedocs.io/
- Documentación de Scikit-Learn (`CalibratedClassifierCV`): https://scikit-learn.org/stable/modules/calibration.html
- Documentación de Hugging Face Hub (`hf_hub_download`): https://huggingface.co/docs/huggingface_hub
