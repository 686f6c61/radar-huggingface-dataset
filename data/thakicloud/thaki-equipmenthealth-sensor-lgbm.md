# ThakiCloud/Thaki-EquipmentHealth-Sensor-LGBM

## Resumen

Thaki-EquipmentHealth-Sensor-LGBM es un clasificador LightGBM desarrollado por ThakiCloud que procesa lecturas de sensores eléctricos y ambientales de vehículos de transporte OHT (Overhead Hoist Transport) y AGV (Automated Guided Vehicle) en entornos de fábrica de semiconductores. El modelo emite uno de cuatro estados de salud del equipo: normal, atención, advertencia o peligro. Se trata de un modelo tabular de clasificación multiclase, no de un modelo de lenguaje, y su propósito es el mantenimiento predictivo en línea.

El modelo utiliza exclusivamente sensores (sin cámara térmica) y solo lecturas actuales y anteriores de una misma sesión, lo que permite inferencia en línea lectura a lectura. Con 1,08 MB de tamaño y una latencia de 0,10 ms p50 por lectura en CPU (arm64, batch 1), está diseñado para ejecutarse en hardware modesto dentro de la infraestructura de la fábrica.

Es relevante ahora como una "research preview" que explora el mantenimiento predictivo basado en datos de sensores para flotas de transporte interno en salas limpias. No obstante, sus etiquetas provienen de un sistema de simulación de testbed, no de fallos reales, y la generalización a otras instalaciones o modelos de vehículo no se ha medido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (LightGBM, clasificación multiclase) |
| Parametros totales | no disponible (modelo de árboles; tamaño de fichero 1,08 MB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular; ventana de hasta 5 lecturas previas por sesión) |
| Tipos de cuantizacion | no disponible (no aplica a LightGBM en el sentido habitual; modelo de texto) |
| Idiomas soportados | en, ko (idiomas de la documentación; el modelo no procesa texto) |
| Licencia | cc-by-4.0 (pesos bajo términos de AI Hub para modelos entrenados) |
| Formato de pesos | model.txt (LightGBM en texto), feature_schema.json, preprocess_config.json, eqhealth.py |

## Arquitectura y entrenamiento

El modelo es un clasificador LightGBM multiclase con pesos de clase balanceados, learning rate 0,05, 31 hojas, subsample de filas y columnas de 0,8 y early stopping de 200 rondas sobre multi-logloss del split de desarrollo, resultando en 78 iteraciones. El entrenamiento tardó 16 segundos en la CPU de un portátil. No es un transformer ni un modelo neuronal: es un ensemble de árboles de decisión potenciado por gradiente sobre características tabulares.

Las características de entrada son 28 columnas derivadas de sensores: CT1–CT4 (corriente), NTC (temperatura), PM1.0, PM2.5, PM10 (partículas), ex_humidity, ex_illuminance y ex_temperature, más el tipo de vehículo (is_oht o device_id con prefijo oht/agv). Dentro de cada sesión, ordenadas por tiempo, se generan dos características por sensor: `<k>_d1` (cambio respecto a la lectura anterior, 0 en la primera) y `<k>_m5` (media de hasta cinco lecturas previas, el valor actual en la primera). Se entrenó con el dataset 71802 de AI Hub (OHT/AGV equipment); el repositorio no incluye datos. No se usaron etiquetas de estado como características, ni device_id (salvo el tipo), fechas, días acumulados de funcionamiento, historial de mantenimiento ni frames térmicos.

## Capacidades

- Clasificación de estado de salud de equipos OHT/AGV en cuatro clases: normal, atención, advertencia y peligro.
- Inferencia en línea lectura a lectura, usando solo la lectura actual y hasta cinco anteriores de la misma sesión.
- Procesamiento de señales eléctricas (cuatro canales de corriente) y ambientales (temperatura, partículas PM1.0/PM2.5/PM10, humedad, iluminancia, temperatura exterior).
- Diferenciación entre tipo de vehículo OHT y AGV mediante la columna is_oht o el prefijo de device_id.
- Salida de probabilidades por clase (p_normal, p_attention, p_warning, p_danger) además de la clase predicha.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües en el sentido de modelos de lenguaje.
- No procesa visión, audio ni texto.

## Casos de uso

- Monitorización en línea de flotas OHT en salas limpias: el modelo se ejecuta lectura a lectura con latencia de 0,10 ms p50 por lectura en CPU, permitiendo evaluar el estado de salud de cada vehículo sin infraestructura de GPU y sin cámara térmica.
- Alertas tempranas de mantenimiento en AGV: al clasificar estados de atención y advertencia, el sistema puede programar inspecciones antes de que el vehículo alcance el estado de peligro, reduciendo paradas no planificadas en el transporte interno.
- Integración en pipelines de telemetría existentes: la función `EquipmentHealth(path).predict(df)` acepta un DataFrame con una fila por lectura y devuelve las probabilidades por clase en el mismo orden, lo que facilita su incorporación a sistemas de adquisición de datos ya desplegados.
- Análisis retrospectivo de sesiones de vehículos: dado un histórico de lecturas con columna `session` y `t`, el modelo reconstruye las características derivadas (`_d1`, `_m5`) y permite etiquetar sesiones completas para auditoría o análisis de causas raíz.
- Prototipado de mantenimiento predictivo en investigación: al ser una research preview con métricas reproducibles y scripts de inferencia incluidos, sirve como línea base para comparar con otros enfoques (regresión logística, modelos neuronales) sobre el mismo conjunto de características.
- Detección de anomalías ambientales en la fábrica: las lecturas de partículas y humedad permiten al modelo asociar condiciones ambientales anómalas con estados de advertencia o peligro, útil para correlacionar la salud del vehículo con la calidad del aire en la sala limpia.
- Despliegue en dispositivos de borde: con 1,08 MB y ejecución en CPU, el modelo puede residir en gateways locales junto a los vehículos, evitando el envío de telemetría a la nube y reduciendo la latencia de decisión.

## Benchmarks y rendimiento

Resultados sobre el split de desarrollo (4 vehículos reservados: agv15, agv16, oht15, oht16; 11.792 lecturas; entrenamiento con vehículos 01–14; ninguna lectura aparece en dos splits):

| Modelo (mismas 28 características) | Macro F1 | Balanced acc. | Danger recall | Danger → normal | Warning/danger → normal |
|---|---|---|---|---|---|
| Este modelo (LightGBM) | 0,9432 | 0,9506 | 0,9645 | 0 / 930 | 0 / 3.503 |
| Regresión logística | 0,9182 | 0,9201 | 0,9710 | 0 / 930 | 1 / 3.503 |
| Clase mayoritaria | 0,1635 | 0,2500 | 0,0000 | 930 / 930 | 3.503 / 3.503 |

La ganancia en macro-F1 sobre la regresión logística es de +0,0254, con IC bootstrap del 95 % [+0,0111, +0,0385] sobre 232 grupos. La regresión logística tiene un recall de peligro ligeramente superior; la ganancia proviene principalmente de la clase atención.

Macro F1 por vehículo en desarrollo: agv15 0,9645 · agv16 0,9156 · oht15 0,9342 · oht16 0,9569.

Test (vehículos 17/18, 11.192 lecturas, no ciego): macro F1 0,9420, danger recall 0,9862, danger → normal 0. El split de test ya había sido puntuado con un modelo anterior, por lo que no es una estimación ciega. Los números completos y la matriz de confusión están en `eval_summary.json`.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier CPU consumer; latencia de 0,10 ms p50 por lectura (batch 1, arm64).
- Tamaño del modelo: 1,08 MB (model.txt en texto).
- Opciones de despliegue: inferencia directa con la librería LightGBM 4.7.0 y el script `eqhealth.py` incluido; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Throughput: no se publica una cifra de throughput agregado; la latencia por lectura en batch 1 es de 0,10 ms p50.
- Tiempo de entrenamiento de referencia: 16 s en CPU de portátil.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Macro F1 (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Thaki-EquipmentHealth-Sensor-LGBM | LightGBM tabular | no aplica (1,08 MB) | ventana de 5 lecturas previas | 0,9432 | cc-by-4.0 | Hugging Face |
| Regresión logística (línea base del autor) | Modelo lineal tabular | no disponible | ventana de 5 lecturas previas | 0,9182 | no disponible | línea base interna, no publicada como modelo |
| Clase mayoritaria (línea base trivial) | Predictor constante | no aplica | no aplica | 0,1635 | no aplica | línea base interna |

No se dispone de información sobre otros modelos públicos comparables de mantenimiento predictivo para OHT/AGV en el material proporcionado.

## Limitaciones y advertencias

- Las etiquetas de los cuatro estados provienen del sistema de simulación del testbed del dataset, no de fallos reales; el modelo no predice averías reales.
- No se ha medido la generalización a otra fábrica, otro modelo de vehículo u otro hardware de sensores.
- La cifra de test no es una estimación ciega: el split ya se había puntuado con un modelo anterior.
- El error más común en desarrollo es predecir atención cuando el estado real es normal (286 de 5.729 lecturas normales); cabe esperar falsas alarmas a nivel de atención.
- Cuatro lecturas normales fueron clasificadas como peligro en desarrollo.
- Las lecturas ambientales `ex_*` y sus unidades deben coincidir con los sensores del dataset; valores fuera del rango de entrenamiento caen en los bins más externos de los árboles.
- Los límites de sesión son críticos: si la columna `session` mezcla dos vehículos o dos ejecuciones, las características `_d1` y `_m5` son incorrectas.
- Los datos de entrenamiento no se incluyen en el repositorio; deben solicitarse a AI Hub bajo sus términos.
- Los pesos se publican bajo los términos de AI Hub para modelos entrenados, además de la licencia cc-by-4.0 indicada; conviene verificar las condiciones de uso comercial con el proveedor del dataset.
- Es una research preview: no debe usarse como único criterio para decisiones de mantenimiento en producción sin validación adicional en el sitio real.

## Enlaces

- Hugging Face: https://huggingface.co/ThakiCloud/Thaki-EquipmentHealth-Sensor-LGBM
- Model card en coreano: [MODEL_CARD.ko.md](./MODEL_CARD.ko.md) (referenciado en el repositorio)
- Dataset de origen: AI Hub dataset 71802 (OHT/AGV equipment), https://aihub.or.kr
- Ficheros del repositorio: model.txt, feature_schema.json, preprocess_config.json, eqhealth.py, eval_summary.json
