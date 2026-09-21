# ypolatog/24679-hw2-shoe-owner-autogluon

## Resumen

`ypolatog/24679-hw2-shoe-owner-autogluon` es un clasificador tabular multiclase desarrollado por el usuario ypolatog como parte de la asignatura CMU 24-679 (Design AI). El modelo predice cuál de tres companeros de piso es el propietario de un zapato a partir de cinco atributos del calzado: longitud, altura de caña, tipo, color y cierre. No es un modelo de lenguaje: no procesa texto libre ni genera secuencias, sino vectores de características tabulares, y su salida es una etiqueta entre tres clases (más, opcionalmente, probabilidades por clase).

El problema que aborda es deliberadamente acotado y de carácter docente. Se entrenó con AutoGluon `TabularPredictor` sobre el dataset `ArinRoths/shoe-data`, creado por otro estudiante en la práctica anterior del mismo curso y compuesto por 25 zapatos originales de un único hogar. El autor seleccionó un `StackerEnsembleModel` cuyo modelo base es `NeuralNetTorch_BAG_L1` (perceptrón multicapa de dos capas y `hidden_size` 32), elegido mediante una búsqueda aleatoria de 20 ensayos sobre las familias GBM, CAT, XGB y NN_TORCH con un presupuesto de 900 segundos (756 segundos consumidos).

Su relevancia actual es exclusivamente metodológica: sirve como ejemplo reproducible de particionado por grupos, de búsqueda de hiperparámetros con presupuesto limitado y de empaquetado de artefactos de AutoGluon. Con 0 descargas y 0 likes, y unas métricas de validación cruzada de 0,588 de balanced accuracy frente a un 0,333 de azar, no debe considerarse un componente listo para producción.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `StackerEnsembleModel` de AutoGluon; modelo base seleccionado `NeuralNetTorch_BAG_L1/74058_00000` (perceptrón multicapa de 2 capas, `hidden_size` 32, activación ReLU, dropout 0,1, sin batchnorm) |
| Parámetros totales | no disponible (no declarados por el autor; la red tiene `hidden_size` 32 y 2 capas) |
| Longitud de contexto | no aplica (modelo tabular; no consume secuencias de texto) |
| Tipos de cuantizacion | no disponible / no aplica (no se distribuyen pesos en formatos cuantizados) |
| Idiomas soportados | no aplica (no procesa lenguaje natural; las entradas son variables tabulares) |
| Licencia | `other` con `license_name: classroom-use` (uso exclusivamente docente) |
| Formato de pesos | directorio de predictor de AutoGluon, empaquetado en `autogluon_predictor_dir.zip` dentro del repositorio |
| Tarea | clasificación tabular multiclase (3 clases: propietario del zapato) |
| Variables de entrada | longitud, altura de caña, tipo, color y cierre |
| Dataset de entrenamiento | `ArinRoths/shoe-data` (25 zapatos originales de un único hogar) |
| Versión de AutoGluon | 1.6.1 |
| Semilla de reproducción | 24679 |
| Métricas auxiliares | `metrics.json` en el repositorio |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación declarada | 2026-09-21 |

## Arquitectura y entrenamiento

El entrenamiento se realizó con AutoGluon 1.6.1 sobre un esquema de apilado (`StackerEnsembleModel`) con bagging de nivel 1. El predictor final no es un único algoritmo, sino un ensemble apilado cuyo estimador base elegido fue `NeuralNetTorch_BAG_L1/74058_00000`. La selección se hizo mediante una búsqueda aleatoria de 20 ensayos sobre cuatro familias de modelos (GBM, CAT, XGB y NN_TORCH) dentro de un presupuesto de 900 segundos, del que se consumieron 756. No se documenta el uso de RLHF, DPO ni ningún esquema de ajuste por preferencias, algo que no aplica a un modelo tabular.

La red base tiene 2 capas, `hidden_size` 32, activación ReLU, dropout 0,1, sin `batchnorm`, optimizador Adam con `learning_rate` 0,0003, `weight_decay` 1e-06 y 50 épocas. El preprocesado integrado imputa valores faltantes con la mediana, aplica embeddings a las variables categóricas a partir de 4 categorías (`embed_min_categories` 4, `max_embedding_dim` 100, `embed_exponent` 0,56, `embedding_size_factor` 1,0), admite hasta 100 niveles por categoría y trata la asimetría con un umbral de 0,99. La innovación metodológica destacable no está en la arquitectura, sino en la validación: se usa validación cruzada agrupada de 5 particiones separada por `parent_id`, de modo que las variantes aumentadas de un mismo zapato nunca caen en particiones distintas y no se filtra información entre entrenamiento y evaluación.

El autor declara los resultados principales sobre esa validación cruzada de las 25 prendas originales, y relega a un segundo plano una partición de prueba reservada de solo 5 zapatos por considerarla insuficiente para juzgar el modelo de forma aislada.

## Capacidades

- Clasificación tabular multiclase: asigna cada zapato a uno de los tres propietarios posibles.
- Manejo de variables categóricas de cardinalidad media: `proc.max_category_levels` en 100 y generación de embeddings desde 4 categorías.
- Preprocesado interno de valores faltantes (imputación por mediana) y de distribuciones asimétricas (`proc.skew_threshold` 0,99).
- Salida de probabilidades por clase a través de la API de `TabularPredictor` (`predict_proba`), además de la etiqueta discreta.
- No genera texto, no razona, no escribe código ni resuelve matemáticas simbólicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, porque no procesa lenguaje natural.
- No dispone de visión, audio, modo de razonamiento explícito ni ninguna otra modalidad distinta de la tabular.

## Casos de uso

- Material didáctico para enseñar el ciclo completo de AutoGluon: el repositorio permite recorrer desde `TabularPredictor.fit()` y la lectura del leaderboard hasta el empaquetado del predictor y su recarga, algo útil en cursos de diseño de sistemas de IA.
- Prueba de humo de pipelines de despliegue: al ser un artefacto pequeño, sirve para verificar que `TabularPredictor.load()` funciona tras descomprimir `autogluon_predictor_dir.zip`, antes de aplicar el mismo flujo a modelos de mayor tamaño.
- Ejemplo reproducible de particionado por grupos: el uso de `parent_id` como criterio de agrupación ilustra cómo evitar la fuga de datos cuando el dataset contiene aumentaciones de la misma instancia, un error frecuente en prácticas académicas.
- Referencia de línea base para clasificación tabular con muy pocos datos: futuros experimentos sobre el mismo dataset o sobre hogares similares pueden compararse contra los 0,588 de balanced accuracy en validación cruzada agrupada.
- Demostración de búsqueda de hiperparámetros con presupuesto acotado: documenta un procedimiento de 20 ensayos y 756 segundos efectivos, replicable en entornos docentes sin GPU.
- Ejercicio de análisis crítico de métricas: la discrepancia entre la validación cruzada (0,588 ± 0,217) y el conjunto de prueba de 5 muestras (0,167 de balanced accuracy, por debajo del azar) permite discutir la varianza de las estimaciones con muestras diminutas.
- Prototipo lúdico dentro de un hogar concreto: clasificar de quién es un zapato entre esos tres compañeros de piso, siempre como demostración interna y nunca como sistema de decisión real.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (marcados como `verified: false` en el `model-index`). Dataset: `ArinRoths/shoe-data`. Tarea: clasificación tabular.

| Métrica | Validación cruzada agrupada de 5 particiones (25 zapatos) | Conjunto de prueba reservado (n=5) |
|---|---|---|
| Balanced accuracy | 0,588 ± 0,217 | 0,167 |
| Accuracy | 0,600 | 0,200 |
| Macro F1 | 0,564 | 0,167 |

Referencias aportadas por el autor: el azar con 3 clases se sitúa en 0,333 y la línea base mayoritaria en el conjunto de prueba (predecir siempre `Arin`) alcanza 0,200. No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros), ya que no aplican a esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. Es un modelo tabular que se ejecuta en CPU.
- GPU recomendadas: ninguna. El entrenamiento se completó en 756 segundos dentro de un presupuesto de 900, sin mención de aceleración por GPU.
- Compatibilidad con GPU de consumo: no aplica; no requiere GPU de ningún tipo.
- Opciones de despliegue: carga mediante `TabularPredictor.load()` tras descomprimir `autogluon_predictor_dir.zip`, dentro de un entorno con AutoGluon 1.6.1. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos tabulares.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 0,0 GB, de modo que el artefacto completo es manejable en cualquier equipo de desarrollo.

## Comparativa con modelos similares

El autor no publica resultados por familia de modelos, solo indica que `NeuralNetTorch_BAG_L1/74058_00000` ganó una búsqueda aleatoria de 20 ensayos sobre GBM, CAT, XGB y NN_TORCH. Por tanto, no es posible comparar este modelo con alternativas concretas de la misma categoría con cifras.

| Modelo | Tipo | Balanced accuracy (CV agrupada) | Accuracy (CV agrupada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 24679-hw2-shoe-owner-autogluon | StackerEnsemble con base NN_TORCH | 0,588 | 0,600 | classroom-use | público en HuggingFace |
| Alternativas GBM, CAT y XGB evaluadas en la búsqueda | varios | no disponible | no disponible | no disponible | no distribuidas en el repositorio |
| Línea base mayoritaria (clase `Arin`) | trivial | no disponible en CV | 0,200 en el conjunto de prueba | no aplica | no aplica |
| Azar con 3 clases | trivial | 0,333 | 0,333 | no aplica | no aplica |

## Limitaciones y advertencias

- Alcance nulo fuera del hogar de origen: el dataset contiene 25 zapatos de tres personas concretas, por lo que el modelo no generaliza a otras colecciones ni a otras personas.
- Tamaño de prueba insuficiente: el conjunto reservado tiene 5 zapatos y su balanced accuracy (0,167) queda por debajo del azar (0,333), de modo que cualquier conclusión basada solo en él es poco fiable.
- Alta varianza: la desviación estándar de ± 0,217 en la validación cruzada implica que la estimación de 0,588 es inestable.
- Riesgo de sobreajuste: con 25 instancias originales y un ensemble apilado con búsqueda de hiperparámetros, la capacidad del modelo supera ampliamente la información disponible.
- Métricas no verificadas: el `model-index` marca los resultados como `verified: false`, es decir, proceden únicamente del autor.
- Restricciones de licencia graves: la licencia es `classroom-use`, lo que excluye el uso comercial. Además, el dataset de origen (`ArinRoths/shoe-data`) no declara licencia alguna, por lo que cualquier reutilización debe acordarse con su autora, `ArinRoths`.
- Sesgos previsibles: la pertenencia del zapato puede correlacionar con atributos como color, tipo o cierre según los gustos y las tallas de esas tres personas, de modo que el modelo puede estar aprendiendo rasgos del hogar y no del propietario.
- Sin información de mantenimiento: no hay versión posterior, ni notas de contacto, ni plan de actualización del repositorio.
- No apto para decisiones reales: el propio autor indica explícitamente que es trabajo de curso y que no debe usarse para ninguna decisión real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ypolatog/24679-hw2-shoe-owner-autogluon
- Dataset de entrenamiento: https://huggingface.co/datasets/ArinRoths/shoe-data
- Métricas completas: fichero `metrics.json` incluido en el repositorio del modelo
- Artefacto del predictor: fichero `autogluon_predictor_dir.zip` incluido en el repositorio del modelo
- La búsqueda web proporcionada no devolvió ningún resultado relevante sobre este modelo; los enlaces disponibles correspondían a páginas de soporte de Microsoft sin relación con el mismo.
