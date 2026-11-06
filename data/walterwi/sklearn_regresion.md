# WalterWi/Sklearn_regresion

## Resumen

`WalterWi/Sklearn_regresion` es un modelo de regresión lineal publicado en Hugging Face como ejemplo pedagógico de scikit-learn. No es un modelo de lenguaje ni una red neuronal: es un ajuste por mínimos cuadrados ordinarios (`sklearn.linear_model.LinearRegression`) que predice el precio de una vivienda en miles de dólares estadounidenses a partir de tres variables tabulares: superficie en metros cuadrados, presencia de balcón y presencia de ascensor. Lo desarrolla WalterWi en el marco del IFTS N.º 18, con la docente Cynthia M. Villagra, y se distribuye con licencia MIT.

El interés del artefacto es didáctico: muestra el ciclo completo de publicación de un modelo entrenado (pesos serializados en `model.joblib`, script de entrenamiento, script de inferencia, dependencias y model card). El conjunto de datos es sintético, generado con una fórmula lineal conocida más ruido, de modo que los pesos aprendidos pueden compararse con los coeficientes reales que produjeron los datos.

Por su naturaleza, el modelo tiene un alcance muy acotado: 200 registros, tres características de entrada y una única salida continua. No soporta texto, código, visión ni tool calling, y su utilidad en producción es prácticamente nula fuera de contextos docentes o como prueba de concepto de un pipeline de regresión tabular.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Regresión lineal por mínimos cuadrados ordinarios (scikit-learn `LinearRegression`) |
| Parámetros totales | 4 parámetros aprendidos (3 pesos + 1 bias o `intercept_`) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin ventana de contexto) |
| Tipos de cuantización | No disponible (no se contempla cuantización; pesos en coma flotante estándar de scikit-learn) |
| Idiomas soportados | Español (documentación y model card); el modelo en sí no procesa lenguaje |
| Licencia | MIT |
| Formato de pesos | `joblib` (serialización basada en pickle) |
| Variables de entrada | `m2` (35–120), `balcon` (0/1), `ascensor` (0/1) |
| Variable de salida | `precio` en miles de US$ (continua) |
| Tamaño del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es una regresión lineal múltiple clásica: una combinación lineal de las tres variables de entrada más un término independiente. No hay capas ocultas, funciones de activación ni mecanismo de atención; el ajuste se realiza por mínimos cuadrados ordinarios, que en este caso tiene solución cerrada. Los coeficientes aprendidos son 1,503 para `m2`, 8,719 para `balcon`, 11,988 para `ascensor` y un bias de 19,557.

Los datos de entrenamiento son sintéticos y se generaron en `train.py` con una semilla fija, a partir de la fórmula `precio = 1,5·m2 + 8·balcon + 12·ascensor + 20 + ruido`. El conjunto consta de 200 registros, de los cuales 160 se emplean para entrenar y 40 para evaluar. No hay fases de RLHF, DPO ni ajuste fino; tampoco aumentación de datos ni validación cruzada documentada. La cercanía entre los coeficientes aprendidos y los generadores (por ejemplo, 1,503 frente a 1,5 en `m2`) confirma que el ruido añadido es de baja magnitud y que el problema es linealmente separable sin dificultad.

## Capacidades

- Predicción de una variable continua (`precio`) a partir de tres características tabulares numéricas y binarias.
- Inferencia por lotes mediante `pandas.DataFrame` y el método `predict` de scikit-learn.
- Serialización y carga del modelo entrenado con `joblib`.
- Reproducibilidad del entrenamiento mediante el script `train.py` y una semilla fija.
- No soporta generación de texto, razonamiento, código, matemáticas simbólicas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de procesamiento de lenguaje; solo la documentación está en español.
- No dispone de modo thinking, audio ni ninguna modalidad distinta de la tabular.

## Casos de uso

- Docencia de aprendizaje supervisado: sirve para ilustrar en clase la diferencia entre parámetros aprendidos y coeficientes generadores, y para mostrar cómo se evalúa un modelo de regresión con MAE y R² sobre un conjunto de test separado.
- Prueba de concepto de un pipeline de publicación de modelos: permite ensayar el flujo `train.py` → `model.joblib` → `predict.py` → model card, replicable después con modelos de mayor complejidad.
- Validación de un entorno de inferencia con scikit-learn: comprobar que la versión instalada de la biblioteca carga correctamente un artefacto `joblib` y reproduce las predicciones esperadas.
- Ejemplo de integración con `huggingface_hub`: el código de la model card muestra cómo descargar `model.joblib` con `hf_hub_download` y cargarlo localmente, útil como plantilla para artefactos no neuronales.
- Ilustración de las limitaciones de la regresión lineal: el modelo permite demostrar en un cuaderno por qué un ajuste lineal no captura interacciones (por ejemplo, que el valor del ascensor dependa de la altura del edificio).
- Material de ejercicios de evaluación: los 40 registros de test y las métricas publicadas (MAE 3,08; R² 0,989) sirven como referencia para que el alumnado compare sus propias implementaciones.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 registros de test |
| R² | 0,989 | 40 registros de test |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni tendrían sentido para un modelo tabular de estas características. Tampoco se ofrece comparación con otros regresores en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente nula; el artefacto `model.joblib` ocupa unos pocos kilobytes y reside en memoria del proceso de Python.
- GPU recomendadas: no se requiere GPU; la inferencia se ejecuta en CPU sin penalización apreciable.
- Compatibilidad con GPU de consumo: irrelevante, el modelo cabe en cualquier equipo con Python y scikit-learn instalados.
- Opciones de despliegue: script de Python con `joblib` y `pandas`; también es posible servirlo detrás de una API ligera (por ejemplo, FastAPI) o integrarlo en un cuaderno Jupyter.
- Latencia y throughput: no disponibles en la información proporcionada; para un modelo de cuatro parámetros la latencia vendrá dominada por el coste de carga del artefacto y la sobrecarga del framework, no por el cálculo.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `WalterWi/Sklearn_regresion` | Regresión lineal (scikit-learn) | 4 (3 pesos + bias) | No aplica | MIT | Hugging Face |
| `scikit-learn` `Ridge` / `Lasso` (referencia de la biblioteca) | Regresión lineal regularizada | Depende del ajuste | No aplica | BSD-3-Clause (biblioteca) | PyPI |
| `scikit-learn` `RandomForestRegressor` (referencia de la biblioteca) | Ensemble de árboles | Depende del ajuste | No aplica | BSD-3-Clause (biblioteca) | PyPI |

No se dispone de otros modelos publicados en Hugging Face directamente comparables en la información proporcionada. Las alternativas citadas son clases de la propia biblioteca scikit-learn, no artefactos entrenados publicados, por lo que la comparación es de categoría y no de rendimiento.

## Limitaciones y advertencias

- Los datos son sintéticos y no representan precios reales de vivienda; cualquier uso predictivo fuera del aula es engañoso.
- El modelo solo ha visto superficies entre 35 y 120 m²; fuera de ese rango extrapola la recta sin garantía de acierto.
- Asume que cada característica contribuye con un importe fijo; no captura interacciones ni no linealidades.
- `joblib` se apoya en pickle: cargar archivos `.joblib` de fuentes no confiables puede ejecutar código arbitrario.
- La versión de scikit-learn empleada al cargar debe coincidir con la usada durante el entrenamiento para evitar incompatibilidades de serialización.
- No hay sesgos demográficos documentados porque el modelo no procesa datos personales, pero tampoco se ha auditado su comportamiento fuera del rango de entrenamiento.
- El riesgo de alucinación no aplica en el sentido habitual; el riesgo equivalente es la extrapolación silenciosa fuera del dominio de los datos.
- La licencia MIT permite uso comercial, pero el propio autor restringe el propósito a fines educativos en la model card.
- Con 0 descargas y 0 likes en el momento de la consulta, no existe validación comunitaria ni reportes de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WalterWi/Sklearn_regresion
- Documentación de `LinearRegression` en scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LinearRegression.html
- Documentación de `joblib` para persistencia de modelos: https://joblib.readthedocs.io/
- Documentación de `huggingface_hub` para descarga de artefactos: https://huggingface.co/docs/huggingface_hub
- Artículo de referencia sobre modelos de regresión en scikit-learn (Simplilearn): https://www.simplilearn.com/tutorials/scikit-learn-tutorial/sklearn-regression-models
