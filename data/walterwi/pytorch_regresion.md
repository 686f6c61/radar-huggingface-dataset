# WalterWi/pytorch_regresion

## Resumen

`WalterWi/pytorch_regresion` es un modelo de regresión lineal implementado en PyTorch y publicado como ejemplo pedagógico por el autor WalterWi para el Seminario de Actualización del IFTS N.º 18 (docente Cynthia M. Villagra). No es un modelo de lenguaje ni una red neuronal profunda: es una única capa `torch.nn.Linear(3, 1)` con tres pesos y un sesgo, entrenada para predecir el precio de una vivienda en miles de dólares estadounidenses a partir de su superficie en metros cuadrados y de dos variables binarias (balcón y ascensor). El repositorio ocupa 0,0 GB y contiene únicamente cuatro parámetros en formato safetensors.

Su relevancia es exclusivamente didáctica: ilustra el ciclo de entrenamiento explícito de PyTorch (definición del modelo, función de pérdida, optimizador, bucle de épocas), el uso de `safetensors` como formato de serialización seguro frente a pickle y la necesidad de acompañar los pesos con metadatos de normalización (`config.json`) y con la definición de la arquitectura (`modelo.py`) para poder reconstruir la inferencia. Resuelve el mismo problema que el ejemplo equivalente de scikit-learn y sirve como material de comparación entre ambos ecosistemas.

El modelo se entrenó sobre 200 registros sintéticos (160 de entrenamiento, 40 de evaluación) durante 500 épocas con SGD y MSE, alcanzando un MAE de 3,08 miles de dólares y un R² de 0,989 en el conjunto de prueba. No debe confundirse con un modelo generativo: no procesa texto, no tiene ventana de contexto y no soporta tool calling ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión lineal, una capa `torch.nn.Linear(3, 1)` |
| Parametros totales | 4 (3 pesos + 1 sesgo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo tabular, sin contexto textual) |
| Tipos de cuantizacion | No disponible (pesos en float32 nativo de PyTorch) |
| Idiomas soportados | Español (documentación y model card); el modelo no procesa lenguaje |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` + `modelo.py` |
| Entradas | `m2` (35–120), `balcon` (0/1), `ascensor` (0/1) |
| Salida | `precio` en miles de US$ (variable continua) |
| Normalización | Media y desvío por variable, almacenados en `config.json` |
| Librería | PyTorch |
| Pipeline declarado | `tabular-regression` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón de una sola capa sin función de activación, equivalente a una regresión lineal múltiple: `y = w1·m2_norm + w2·balcon_norm + w3·ascensor_norm + b`. Los pesos aprendidos son `[35,157 · 4,351 · 5,992]` y el sesgo `147,769`, todos en la escala de las entradas normalizadas. El autor documenta la conversión a escala original dividiendo cada peso por el desvío de su variable (por ejemplo, 35,157 / 23,398 ≈ 1,503 para `m2`), lo que coincide con el peso obtenido por scikit-learn en el ejemplo equivalente.

El entrenamiento usó aprendizaje supervisado con `MSELoss` y descenso por gradiente estocástico (`SGD`) con tasa de aprendizaje 0,1 durante 500 épocas; la pérdida se estabiliza antes de la época 100. El dataset es sintético, generado en `train.py` con la misma semilla que la Clase 10 del seminario, y no representa viviendas reales. El preprocesamiento consiste en estandarización (resta de la media y división por el desvío calculados sobre el conjunto de entrenamiento), con los valores almacenados en `config.json`. No hay RLHF, DPO ni ninguna técnica de alineación, por tratarse de un modelo de regresión.

## Capacidades

- Predicción de una variable numérica continua (precio en miles de US$) a partir de tres entradas tabulares.
- Inferencia determinista y de coste computacional despreciable (una multiplicación matricial de 3×1).
- Carga de pesos mediante `safetensors.torch.load_file`, sin ejecución de código al deserializar.
- Reconstrucción de la inferencia completa a partir de tres artefactos: pesos, `config.json` (normalización) y `modelo.py` (arquitectura).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa texto.
- No dispone de modo thinking, visión, audio ni ninguna modalidad adicional.

## Casos de uso

- Docencia de PyTorch: el modelo sirve como ejemplo mínimo reproducible del ciclo de entrenamiento explícito (forward, loss, backward, step) en un curso introductorio, con solo cuatro parámetros que el alumnado puede inspeccionar a mano.
- Comparación PyTorch vs. scikit-learn: permite contrastar los pesos obtenidos por ambos frameworks sobre el mismo dataset sintético y verificar la equivalencia tras desnormalizar, como documenta el autor.
- Demostración de serialización segura: ilustra por qué `safetensors` es preferible a pickle o joblib en la publicación de pesos, ya que el archivo solo contiene números y no ejecuta código al cargarse.
- Práctica de ingeniería de artefactos: el repositorio separa pesos (`model.safetensors`), configuración de preprocesamiento (`config.json`) y código de arquitectura (`modelo.py`), un patrón trasladable a modelos mayores.
- Validación de pipelines de normalización: útil para enseñar por qué olvidar la estandarización produce predicciones sin sentido y cómo almacenar media y desvío junto al modelo.
- Ejemplo de model card completa: sirve como plantilla de documentación (descripción, datos, entrenamiento, evaluación, limitaciones) para proyectos estudiantiles.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| MAE | 3,08 miles de US$ | 40 viviendas de test no vistas |
| R² | 0,989 | 40 viviendas de test no vistas |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un modelo de lenguaje y esas métricas no aplican.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los cuatro parámetros en float32 ocupan 16 bytes y el repositorio completo 0,0 GB.
- GPU recomendadas: ninguna; el modelo se ejecuta en CPU sin penalización perceptible.
- Cabe en cualquier GPU consumer e incluso en entornos sin GPU (Raspberry Pi, contenedores mínimos).
- Opciones de despliegue: PyTorch nativo con `safetensors.torch.load_file`; no requiere vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares de este tipo.
- Latencia y throughput: no disponibles como cifras publicadas; por la naturaleza de la operación (una multiplicación 3×1) la latencia es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `WalterWi/pytorch_regresion` | 4 | No aplica | Regresión tabular (precio de vivienda) | MIT | Hugging Face |
| Regresión lineal de scikit-learn (ejemplo de la Clase 10) | 4 (coeficientes + intercepto) | No aplica | Misma tarea, mismo dataset sintético | No disponible | Código del seminario, no publicado como modelo |
| Ejemplos de regresión de Machine Learning Mastery | No disponible | No aplica | Regresión con redes neuronales en PyTorch | No disponible | Tutoriales web |

No se dispone de otros modelos publicados en Hugging Face con la misma tarea y escala para una comparación más amplia; la información disponible solo permite contrastar con el ejemplo de scikit-learn citado por el propio autor.

## Limitaciones y advertencias

- Fines exclusivamente educativos: los datos son sintéticos y no representan precios reales de vivienda.
- Dominio restringido: solo conoce superficies de 35 a 120 m²; fuera de ese rango la extrapolación lineal no está validada.
- Dependencia crítica de la normalización: si se omiten media y desvío de `config.json`, las predicciones son arbitrarias; los pesos por sí solos no bastan.
- Dependencia de la arquitectura: `load_state_dict` falla si la clase `RegresionLineal` de `modelo.py` no coincide exactamente con la usada en el entrenamiento.
- Sesgos conocidos: no documentados por el autor; al ser datos sintéticos, cualquier sesgo refleja el generador de `train.py`, no una población real.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo; el riesgo equivalente es la extrapolación silenciosa fuera del dominio de entrenamiento.
- Licencia MIT: permite uso comercial y modificación con atribución, pero el autor desaconseja explícitamente cualquier uso productivo por la naturaleza sintética de los datos.
- Sin mantenimiento ni comunidad: 0 descargas y 0 likes en el momento de la consulta; no hay garantía de soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WalterWi/pytorch_regresion
- Tutorial de regresión en PyTorch (Machine Learning Mastery): https://machinelearningmastery.com/building-a-regression-model-in-pytorch/
- Tutorial general de modelos PyTorch (Machine Learning Mastery): https://machinelearningmastery.com/pytorch-tutorial-develop-deep-learning-models/
