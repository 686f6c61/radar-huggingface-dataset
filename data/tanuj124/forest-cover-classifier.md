# Tanuj124/forest-cover-classifier

## Resumen

Forest Cover Classifier es un modelo de clasificación tabular clásica publicado en HuggingFace por el usuario Tanuj124. No es una red neuronal ni un modelo de lenguaje: se trata de un `DecisionTreeClassifier` de scikit-learn sin podar, serializado junto con el esquema exacto de 54 características y las etiquetas de clase necesarias para la inferencia. Resuelve un problema de clasificación de siete clases sobre observaciones cartográficas de celdas de 30 m x 30 m en cuatro áreas silvestres del Roosevelt National Forest (Colorado).

El modelo se entrenó sobre las 581.012 filas completas del dataset UCI Covertype, con una partición holdout del 20 % (`random_state=42`). Alcanza una exactitud de 0,93895 en el split de test y reproduce la métrica reportada en el cuaderno original (93,895 %). El proyecto comparó tres algoritmos clásicos —regresión logística (68,74 %), K-Nearest Neighbors con `n_neighbors=5` (96,87 %) y árbol de decisión (93,90 %)— y seleccionó el árbol por su equilibrio entre exactitud y tiempo de cómputo, no por ser el más preciso.

Su relevancia es fundamentalmente educativa: sirve como referencia reproducible de un flujo de trabajo clásico de machine learning tabular, con esquema de características congelado, métricas desglosadas por clase y advertencias explícitas sobre su alcance. No está pensado como sistema de monitorización ecológica en producción ni como sustituto de datos de campo o revisión experta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árbol de decisión (`sklearn.tree.DecisionTreeClassifier`), sin podar, `random_state=42` |
| Parametros totales | no aplica (modelo no paramétrico basado en árboles; no se publica el número de nodos ni de hojas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin secuencia de entrada) |
| Tipos de cuantizacion | no aplica (no hay cuantización de pesos; el artefacto se serializa con joblib) |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | no disponible (el repositorio de GitHub de origen no incluye fichero `LICENSE` y la model card no afirma ninguna licencia para el modelo) |
| Formato de pesos | artefacto serializado con joblib (etiqueta `joblib` en el repositorio); no se detalla el nombre ni la extensión exacta del fichero |
| Tarea | `tabular-classification` |
| Numero de clases | 7 (identificadores 1 a 7 con etiqueta de tipo de cobertura forestal) |
| Numero de caracteristicas | 54 enteros (10 medidas cartográficas + 4 indicadores one-hot de área silvestre + 40 indicadores one-hot de tipo de suelo) |
| Dataset de entrenamiento | UCI Covertype (Jock Blackard), 581.012 filas, licencia CC BY 4.0 |
| Particion de evaluacion | `train_test_split(test_size=0.2, random_state=42)` |
| Tamano del repositorio | 0.0 GB según HuggingFace (artefacto de tamano no especificado) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

La arquitectura es un árbol de decisión único de scikit-learn, entrenado sin poda y con semilla fija `random_state=42`. La entrada son 54 características enteras en un orden estricto, preservado en el fichero `feature_schema.json` del repositorio: 10 mediciones cartográficas, 4 indicadores one-hot de área silvestre y 40 indicadores one-hot de tipo de suelo. La salida es un identificador de clase de 1 a 7 junto con su etiqueta de cobertura forestal. El cuaderno original utiliza los valores crudos del dataset UCI, sin escalado ni otras transformaciones.

El entrenamiento cargó las 581.012 filas de UCI Covertype y separó la columna `Cover_Type` de los 54 predictores. La model card advierte de que el cuaderno contiene una asignación previa de partición al 30 % que queda sobrescrita inmediatamente por la partición al 20 %, de modo que los resultados reportados corresponden a esta última. Se compararon tres modelos clásicos: regresión logística (68,74 % de exactitud en test), K-Nearest Neighbors con `n_neighbors=5` (96,87 %) y árbol de decisión (93,90 %). El artefacto subido se reentrenó desde el fichero público `covtype.data.gz` y reprodujo la exactitud de 93,895 % del cuaderno. No se aplicó RLHF, DPO ni ninguna técnica de ajuste equivalente, ni búsqueda de hiperparámetros, calibración o estudio de poda.

## Capacidades

- Clasificación supervisada multiclase de observaciones tabulares en 7 categorías de cobertura forestal (Spruce/Fir, Lodgepole Pine, Ponderosa Pine, Cottonwood/Willow, Aspen, Douglas-fir y Krummholz).
- Ingesta de una fila de 54 valores enteros en el orden exacto definido por `feature_schema.json`, como diccionario con nombres de característica, como lista de 54 valores o como `DataFrame` de pandas con esas columnas.
- Interfaz de línea de comandos mediante `python inference.py --json '<JSON object>'`.
- Determinismo en la inferencia gracias a la semilla fija del árbol entrenado.
- Inspección estructural del modelo: al ser un árbol de decisión, sus reglas de división son directamente legibles, aunque la model card no publica un análisis de importancia de características.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de generación de texto, de visión ni de audio.
- No incorpora modo de razonamiento (thinking mode) ni ninguna capacidad especial más allá de la clasificación tabular.

## Casos de uso

- Docencia de machine learning clásico: el repositorio incluye esquema de características, script de inferencia y métricas desglosadas, lo que permite reproducir íntegramente un flujo de clasificación tabular en un aula sin depender de infraestructura de GPU.
- Verificación de reproducibilidad: al fijar `random_state=42` y publicar las métricas exactas del split de test, sirve para comprobar que una instalación concreta de scikit-learn reproduce el 0,93895 de exactitud.
- Baseline en proyectos de clasificación tabular: cualquier modelo nuevo sobre UCI Covertype puede compararse contra las cifras publicadas (0,93895 de exactitud, 0,90163 de F1 macro) para medir una mejora real.
- Pruebas de integración de APIs de inferencia: el helper acepta diccionario, lista y `DataFrame`, además de una CLI con JSON, lo que lo convierte en un candidato cómodo para validar contratos de entrada en servicios de predicción tabular.
- Estudio del compromiso precisión/tiempo: el proyecto documenta que el árbol se eligió sobre KNN pese a tener menor exactitud (93,90 % frente a 96,87 %) por su menor coste computacional (unos 8,8 segundos según el cuaderno), lo que lo hace útil como caso práctico de esta disyuntiva.
- Análisis de desbalanceo de clases: los soportes por clase publicados (42.557 frente a 526 muestras en la clase 4) permiten usar el modelo como ejemplo de cómo el desbalanceo degrada el rendimiento en clases minoritarias (F1 de 0,8291 en Cottonwood/Willow frente a 0,9481 en Lodgepole Pine).
- Prototipado de pipelines de preprocesado con variables one-hot: el esquema de 54 columnas, con 44 de ellas binarias, es un banco de pruebas realista para validar codificación y orden de columnas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Métricas agregadas sobre el split de test (20 % de 581.012 filas), reproducidas por el artefacto subido:

| Metrica | Split de test |
|---|---:|
| Exactitud (accuracy) | 0,93895 |
| Precision macro | 0,90343 |
| Recall macro | 0,89996 |
| F1 macro | 0,90163 |
| Precision ponderada | 0,93893 |
| Recall ponderado | 0,93895 |
| F1 ponderado | 0,93894 |

Resultados por clase:

| Clase | Etiqueta | Precision | Recall | F1 | Soporte |
|---:|---|---:|---:|---:|---:|
| 1 | Spruce/Fir | 0,9386 | 0,9378 | 0,9382 | 42.557 |
| 2 | Lodgepole Pine | 0,9484 | 0,9478 | 0,9481 | 56.500 |
| 3 | Ponderosa Pine | 0,9271 | 0,9339 | 0,9305 | 7.121 |
| 4 | Cottonwood/Willow | 0,8472 | 0,8118 | 0,8291 | 526 |
| 5 | Aspen | 0,8385 | 0,8301 | 0,8343 | 1.995 |
| 6 | Douglas-fir | 0,8819 | 0,8862 | 0,8841 | 3.489 |
| 7 | Krummholz | 0,9423 | 0,9522 | 0,9472 | 4.015 |

Comparación de los tres modelos evaluados en el cuaderno original:

| Modelo | Exactitud en test |
|---|---:|
| Logistic Regression | 68,74 % |
| K-Nearest Neighbors (`n_neighbors=5`) | 96,87 % |
| Decision Tree (`random_state=42`, modelo publicado) | 93,90 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni serían aplicables a un modelo tabular de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica. Es un modelo de scikit-learn que se ejecuta en CPU; no requiere GPU.
- GPU recomendadas: ninguna. El entrenamiento y la inferencia se realizan íntegramente en CPU.
- Compatibilidad con GPU de consumo: no aplica, no hay soporte de aceleración por GPU en el flujo descrito.
- Memoria principal: no disponible la cifra exacta. El repositorio declara 0,0 GB de tamano, lo que indica un artefacto muy pequeno, pero no se especifica el tamano real del fichero serializado. El conjunto de datos de entrenamiento completo (581.012 filas x 55 columnas) es el elemento que domina el consumo de memoria durante el entrenamiento.
- Opciones de despliegue: cualquier entorno con Python y scikit-learn. El repositorio proporciona `requirements.txt` e `inference.py`. No hay soporte declarado para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia de modelos neuronales, que no son aplicables a este tipo de artefacto.
- Latencia y throughput: no disponibles para inferencia. El cuaderno reporta aproximadamente 8,8 segundos para el entrenamiento del árbol de decisión, cifra que el proyecto usó como criterio de selección frente a alternativas.

## Comparativa con modelos similares

Comparación con los otros dos clasificadores evaluados en el mismo cuaderno y con la misma partición de datos:

| Modelo | Parametros | Contexto | Exactitud en test | F1 macro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision Tree (este modelo) | no disponible (nodos/hojas no publicados) | no aplica | 0,93895 | 0,90163 | no disponible | artefacto joblib en HuggingFace |
| K-Nearest Neighbors (`n_neighbors=5`) | no aplica (basado en instancias) | no aplica | 96,87 % | no disponible | no disponible | solo resultados en el cuaderno, sin artefacto publicado |
| Logistic Regression | no disponible (coeficientes no publicados) | no aplica | 68,74 % | no disponible | no disponible | solo resultados en el cuaderno, sin artefacto publicado |

No se dispone de información sobre otros modelos publicados específicamente para UCI Covertype en la documentación proporcionada, por lo que la comparativa se limita a los tres algoritmos evaluados por el propio autor.

## Limitaciones y advertencias

- Alcance geográfico y temporal restringido: los datos representan cuatro áreas silvestres del norte de Colorado y pueden no generalizar a otros ecosistemas, anos, condiciones de sensorizado o regímenes de gestión forestal.
- Desbalanceo de clases acusado, especialmente en las clases 4 (Cottonwood/Willow, 526 muestras de test) y 5 (Aspen, 1.995 muestras), reflejado en los F1 más bajos de la tabla por clase (0,8291 y 0,8343).
- Evaluación limitada: una única partición aleatoria de holdout, un árbol sin podar, sin calibración, sin estudio de poda y sin búsqueda amplia de hiperparámetros. No se han publicado intervalos de confianza ni validación cruzada.
- El modelo no es el más preciso de los evaluados en el propio proyecto: KNN con `n_neighbors=5` obtuvo 96,87 % frente al 93,90 % del árbol. La selección responde a un compromiso velocidad/exactitud, no a la maximización de la exactitud.
- Licencia no disponible: el repositorio de GitHub de origen no incluye fichero `LICENSE` y la model card no afirma licencia alguna para el modelo, por lo que no puede confirmarse la legalidad de un uso comercial. El dataset UCI Covertype sí está licenciado como CC BY 4.0, pero el repositorio no redistribuye los datos crudos.
- Riesgo de uso indebido: la model card indica explícitamente que no debe utilizarse como sistema de monitorización ecológica en producción ni como sustituto de datos de campo, revisión experta o mediciones medioambientales actuales.
- Sensibilidad al esquema de entrada: el orden de las 54 características debe respetarse exactamente según `feature_schema.json`; cualquier reordenación o cambio en la codificación one-hot invalida las predicciones.
- Sin datos publicados sobre sesgos más allá del desbalanceo de clases, ni sobre comportamiento fuera de la distribución de entrenamiento.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni de validación independiente por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tanuj124/forest-cover-classifier
- Repositorio de origen en GitHub: https://github.com/tanujranjith/ml-forest-cover-prediction-project
- Dataset UCI Covertype: https://archive.ics.uci.edu/dataset/31/covertype
- DOI del dataset: https://doi.org/10.24432/C50K5N
- Esquema de características (referenciado en la model card): `feature_schema.json` dentro del repositorio de HuggingFace
- Dependencias (referenciado en la model card): `requirements.txt` dentro del repositorio de HuggingFace
- Script de inferencia (referenciado en la model card): `inference.py` dentro del repositorio de HuggingFace
