# zoiiiizxk/ci-failure-risk

## Resumen

`ci-failure-risk` es un modelo de clasificación tabular publicado en Hugging Face por el usuario `zoiiiizxk` que predice, antes de que arranque una ejecución de GitHub Actions, la probabilidad de que esta termine en fallo. No es un modelo de lenguaje: es un pipeline de scikit-learn serializado con joblib que se aplica sobre 17 características extraídas de metadatos del repositorio, del workflow y del commit (tamaño del cambio, rama, evento disparador, hora, día de la semana e historial de ejecuciones previas). La salida se calibra con escalado sigmoide (Platt) y se mapea a tres bandas de riesgo: bajo, medio y alto.

El modelo se desarrolló como proyecto de la asignatura CT-378 Machine Learning y se seleccionó por macro-F1 de validación entre seis algoritmos (regresión logística, árbol de decisión, KNN, SVM lineal, random forest e histogram gradient boosting) con `RandomizedSearchCV` y `TimeSeriesSplit(5)`. El ganador fue un Hist Gradient Boosting con ponderación de clases. Se entrenó con dos fuentes: el dataset público GADFPD (GitHub Actions CI/CD Failure Prediction Dataset, Faruna et al., 2026, CC BY 4.0) y una recolección propia de 23.818 ejecuciones de 14 repositorios públicos entre abril y noviembre de 2026.

Su relevancia práctica es acotada pero clara: permite a un equipo de plataforma dar una señal temprana de riesgo antes de consumir minutos de CI o de desplegar, integrándose como paso previo en un workflow de GitHub Actions. No sustituye a un análisis de causa raíz ni a un modelo de lenguaje; es una pieza de señalización estadística sobre datos tabulares.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de scikit-learn con Hist Gradient Boosting (clasificador de árboles) y calibrador sigmoide (Platt) |
| Parametros totales | no disponible (no se publica recuento de parámetros ni número de árboles/iteraciones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin ventana de tokens) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones; el artefacto es un `.joblib`) |
| Idiomas soportados | no disponible (no procesa texto libre; los identificadores de repositorio y actor se hashean y no se almacenan mensajes de commit) |
| Licencia | no disponible |
| Formato de pesos | `.joblib` (diccionario serializado con pipeline, umbral, features, bandas de riesgo, tasas de riesgo y métricas de test) más `ci_utils.py` con la función `log1p_clip` y la construcción de features |
| Numero de features | 17 |
| Salida | Probabilidad de fallo calibrada y nivel de riesgo (Low / Medium / High) |
| Dependencias | scikit-learn 1.9.1, numpy 2.5.4, pandas 3.0.6, joblib 1.6.0, Python 3.12 |

## Arquitectura y entrenamiento

El artefacto contiene un `Pipeline` de scikit-learn cuyo estimador final es un Hist Gradient Boosting con ponderación de clases, precedido de las transformaciones necesarias para construir las 17 features. Estas cubren tres bloques: características del cambio (adiciones, eliminaciones, ficheros modificados, longitud del mensaje, indicador de merge), características temporales y de disparo (hora, día de la semana, rama principal o no, evento de GitHub que dispara el workflow) e historial de ejecuciones a nivel de repositorio y de workflow (resultado previo, tasa de fallos en las últimas 10 ejecuciones, número de ejecuciones anteriores y si el workflow tiene historial). Sobre la probabilidad cruda del clasificador se aplica un calibrador sigmoide ajustado en el split de validación ordenado temporalmente.

El entrenamiento combina GADFPD (que cubre del 8 de agosto de 2016 al 18 de abril de 2026) con 23.818 ejecuciones propias recogidas vía API REST de GitHub entre el 19 de abril y el 20 de noviembre de 2026, justo después del corte del dataset público. Solo se conservan ejecuciones con resultado claro de éxito o fallo y de primer intento. La partición es 70/15/15 respetando el orden temporal. La selección de hiperparámetros se hizo con `RandomizedSearchCV` y `TimeSeriesSplit(5)` sobre macro-F1 de validación, comparando seis familias de algoritmos. Como medida de privacidad, los nombres de repositorio y de actor se hashean y no se almacena el texto de los mensajes de commit.

## Capacidades

- Clasificación binaria de riesgo de fallo de una ejecución de GitHub Actions antes de su lanzamiento.
- Calibración de probabilidad mediante escalado sigmoide (Platt) sobre validación temporal, de modo que la salida se interpreta como probabilidad estimada de fallo.
- Mapeo de la probabilidad a tres bandas de riesgo (Low / Medium / High) con tasas de fallo observadas por banda en el conjunto de test.
- Uso de historial de ejecuciones por repositorio y por workflow (resultado previo, tasa de fallos en las últimas 10, volumen histórico).
- Uso de metadatos del cambio y del disparador (tamaño del diff, merge, rama, hora, día de la semana, evento).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador tabular puro.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural; los identificadores textuales se hashean.
- No soporta visión, audio ni modo de pensamiento.

## Casos de uso

- **Aviso previo en pull requests**: ejecutar el modelo como paso ligero al abrir o actualizar un PR para mostrar al revisor una probabilidad estimada de que el CI falle, permitiendo priorizar revisiones o pedir cambios antes de gastar minutos de runner.
- **Puerta de calidad previa al despliegue**: en un release manager, consultar el riesgo antes de lanzar un workflow de despliegue; si la banda es alta, exigir revisión manual o ejecutar primero las pruebas más costosas en un runner aislado.
- **Priorización de colas de CI**: en organizaciones con runners limitados, ordenar la cola de ejecuciones por riesgo descendente para que los jobs con más probabilidad de fallo se ejecuten antes y liberen antes la información al equipo.
- **Detección de workflows frágiles**: agregar las predicciones por workflow para identificar aquellos con tasa de riesgo sistemáticamente alta y dirigir esfuerzos de estabilización (caché, tests flaky, dependencias).
- **Alertas en dashboards de plataforma**: publicar la probabilidad calibrada y la banda de riesgo en un panel interno de salud de CI, con umbrales ajustables por equipo.
- **Análisis de deriva temporal**: comparar la distribución de probabilidades predichas con la tasa real de fallo por semana para detectar cuándo el modelo se desactualiza y disparar un reentrenamiento.
- **Filtro de ejecuciones en repositorios con historial**: en repositorios con muchas ejecuciones previas, usar el historial por repositorio y por workflow como señal principal para descartar ejecuciones de bajo riesgo y ahorrar cómputo.

## Benchmarks y rendimiento

Evaluación en el conjunto de test retenido, ordenado temporalmente y puntuado una sola vez, según la model card:

| Metrica | Valor |
|---|---|
| macro-F1 | 0.689 |
| F1 de la clase fallo | 0.447 |
| Precisión de la clase fallo | 0.545 |
| Recall de la clase fallo | 0.379 |
| ROC-AUC | 0.845 |
| PR-AUC | 0.504 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el artefacto es un pipeline de scikit-learn con Hist Gradient Boosting; no requiere GPU.
- VRAM estimada: 0 GB (no usa GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier máquina capaz de ejecutar Python 3.12 con scikit-learn 1.9.1, numpy 2.5.4, pandas 3.0.6 y joblib 1.6.0; el tamaño del repositorio es de 0.0 GB según Hugging Face, por lo que el artefacto es de pocos megabytes.
- Opciones de despliegue: script Python con `joblib.load` y `hf_hub_download`, paso de GitHub Actions, función serverless o servicio HTTP ligero. No aplica vLLM, llama.cpp, Ollama ni TGI, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del estimador (árboles de decisión sobre 17 features) se espera latencia de milisegundos por predicción en CPU, aunque no se aporta medición.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, dentro del propio proyecto se compararon seis algoritmos con `RandomizedSearchCV` y `TimeSeriesSplit(5)`: regresión logística, árbol de decisión, KNN, SVM lineal, random forest e Hist Gradient Boosting, resultando seleccionado este último por macro-F1 de validación. No se publican las métricas de los otros cinco candidatos.

| Modelo | Tipo | Features | Licencia | Disponibilidad |
|---|---|---|---|---|
| ci-failure-risk (este) | Hist Gradient Boosting calibrado | 17 | no disponible | Hugging Face, 0 descargas |
| Alternativas públicas de predicción de fallo en CI | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Clase positiva poco frecuente**: el recall de fallo es 0.379 y la precisión 0.545, de modo que el umbral elegido produce tanto falsos positivos como fallos no detectados. La propia model card advierte de ello.
- **Dependencia fuerte del historial**: la mayor parte de la señal proviene del historial de ejecuciones; un repositorio o workflow nuevo se predice casi solo con el tamaño del cambio y el evento disparador, con menor fiabilidad.
- **Deriva temporal**: la tasa de fallo difiere entre GADFPD (2016-2026) y la recolección propia (abril-noviembre de 2026), y los repositorios cambian con el tiempo; se recomienda reentrenar periódicamente.
- **Historial no estrictamente consecutivo**: las ejecuciones propias se muestrearon por días, por lo que las features de "últimas 10 ejecuciones" no reflejan una secuencia contigua.
- **Cobertura incompleta de la recolección**: dos de los 16 repositorios objetivo no están en los datos (kubernetes/kubernetes no devolvió ejecuciones y golang/go solo devolvió 7, que se descartaron).
- **Licencia no declarada**: la licencia del modelo no está disponible, lo que impide confirmar si el uso comercial está permitido. El dataset GADFPD sí es CC BY 4.0, pero eso no determina la licencia del artefacto.
- **Dependencias frágiles**: requiere versiones exactas (scikit-learn 1.9.1, numpy 2.5.4, pandas 3.0.6, joblib 1.6.0, Python 3.12); otras versiones pueden fallar al deserializar el `.joblib`.
- **Función auxiliar obligatoria**: el pipeline necesita `ci_utils.py` junto al script para deserializarse correctamente (`log1p_clip` y `make_features`).
- **Calibración sujeta a deriva**: la calibración sigmoide se ajustó en un split temporal concreto y puede degradarse a medida que cambian repositorios y workflows.
- **Alcance limitado a GitHub Actions**: no cubre otros sistemas de CI ni otros formatos de datos; no es un modelo de lenguaje y no debe usarse para tareas de generación o razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zoiiiizxk/ci-failure-risk
- Dataset GADFPD (Mendeley Data, V1): https://doi.org/10.17632/mggwn7rj9f.1
- Referencia del dataset: Faruna, J. et al. (2026), GitHub Actions CI/CD Failure Prediction Dataset, Mendeley Data V1, licencia CC BY 4.0
- Demo en vivo: enlace al Space indicado en el README del proyecto (URL no disponible en la información proporcionada)
