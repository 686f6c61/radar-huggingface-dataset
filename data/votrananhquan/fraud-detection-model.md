# votrananhquan/fraud-detection-model

## Resumen

`votrananhquan/fraud-detection-model` es un modelo tabular de deteccion de fraude en tarjetas de credito publicado en HuggingFace por el usuario votrananhquan. No se trata de un modelo de lenguaje: segun las etiquetas de la ficha, la familia subyacente es LightGBM sobre scikit-learn, orientada a clasificacion binaria con clases fuertemente desbalanceadas (`imbalanced-classification`). El artefacto se presenta como "champion model" dentro de un registro de MLflow bajo el nombre `fraud-detection-model` y la version `3`, con la etiqueta de produccion `@production`.

El problema que resuelve es acotado y clasico: asignar una probabilidad de fraude a cada transaccion a partir de las 28 componentes PCA anonimizadas (V1-V28) y del importe (`Amount`) del conocido dataset Credit Card Fraud de Kaggle (ULB). El modelo se entreno, segun la model card, bajo un protocolo sin fuga de informacion: particion estratificada 64/16/20 para entrenamiento, validacion y prueba, escalado de `Amount` ajustado solo sobre el split de entrenamiento, parada temprana sobre validacion y seleccion del campeon por PR-AUC de validacion. El split de prueba se puntuo una sola vez.

Su relevancia practica es limitada como "modelo de IA open source" en el sentido habitual del blog: no es un modelo generativo, no tiene contexto, no soporta tool calling ni agentes, y el repositorio ocupa 0.0 GB con 0 descargas y 0 likes en el momento de la consulta. Su interes es mas bien metodologico: es un ejemplo reproducible de pipeline antifraude con metricas honestas sobre datos desbalanceados, publicado con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible como red neuronal; segun etiquetas, LightGBM sobre scikit-learn (modelo de arboles con boosting) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; entrada fija de 29 caracteristicas) |
| Tipos de cuantizacion | no aplica; el ejemplo de uso carga un fichero `.pkl` con `joblib` |
| Idiomas soportados | en (campo `language` de la model card); el modelo consume variables numericas, no texto |
| Licencia | MIT |
| Formato de pesos | no disponible (el ejemplo de la model card carga `baseline_lr.pkl`; el artefacto campeon se gestiona via MLflow Registry) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna mas alla de las etiquetas del repositorio (`lightgbm`, `scikit-learn`). Por tanto, no se dispone de informacion verificable sobre numero de arboles, profundidad, tasa de aprendizaje, funcion objetivo ni estrategia de regularizacion. El modelo opera sobre 29 caracteristicas de entrada: las componentes V1-V28 del dataset de Kaggle, que ya vienen transformadas por PCA y se pasan tal cual, mas la columna `Amount` estandarizada con un `StandardScaler` ajustado exclusivamente sobre el split de entrenamiento, con media 87.9702 y desviacion tipica 245.5762.

El protocolo de entrenamiento si esta detallado: split estratificado 64/16/20, parada temprana monitorizada sobre validacion y seleccion del modelo campeon por PR-AUC de validacion, no por exactitud ni por F1. El conjunto de prueba no interviene en ninguna decision y se puntua una unica vez para reportar. No hay evidencia de tecnicas de calibracion de probabilidades, de reentrenamiento continuo ni de aprendizaje activo. Tampoco se documenta el tratamiento del desbalanceo mas alla de su mencion en las etiquetas: no se especifica si se aplicaron ponderaciones de clase, remuestreo, SMOTE ni umbral de decision optimizado.

Existe una inconsistencia reseñable en la propia ficha: las etiquetas y el titulo apuntan a LightGBM como modelo campeon, mientras que el bloque de codigo de uso carga un fichero llamado `baseline_lr.pkl`, que sugiere una regresion logistica base. Conviene verificar cual es el artefacto real antes de cualquier uso serio.

## Capacidades

- Clasificacion binaria de transacciones: devuelve una probabilidad de fraude (`predict_proba(X)[:, 1]`) para entradas de forma `(n, 29)`.
- Trabajo con datos tabulares anonimizados: asume que V1-V28 ya han pasado por PCA y que no requieren transformacion adicional.
- Normalizacion del importe mediante un escalador con parametros fijos publicados en la model card (mu=87.9702, sigma=245.5762).
- Integracion con scikit-learn: al ser un estimador compatible, puede usarse con `joblib`, `Pipeline` y utilidades de evaluacion del ecosistema.
- Gestion de trazas con MLflow: el modelo esta registrado con nombre y version, y la model card publica el Run ID de seguimiento.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un clasificador de una sola pasada.
- No tiene capacidades multilingues: el campo `language: en` es meramente declarativo, ya que la entrada es numerica.
- No dispone de modo de pensamiento, modo de razonamiento explicito ni salida de trazas intermedias.

## Casos de uso

- Filtrado previo en autorizacion de pagos: el modelo puede colocarse como segunda capa de riesgo en un sistema de autorizacion en tiempo real, consumiendo las mismas caracteristicas que el sistema actual y devolviendo una probabilidad que se compara con un umbral de bloqueo. Su precision en el split de prueba (0.4555) implica que aproximadamente la mitad de las alertas seran falsos positivos, por lo que encaja mejor como capa de priorizacion que como bloqueo automatico.
- Priorizacion de la cola de revision manual: con una sensibilidad del 88.78 % en prueba, el modelo detecta la mayoria de los fraudes etiquetados del dataset, de modo que puede utilizarse para ordenar los casos que llegan a un analista humano y reducir el tiempo hasta la deteccion.
- Reproduccion de pipelines de fraude en docencia o investigacion: el protocolo sin fuga (escalado ajustado solo en entrenamiento, seleccion por validacion, test puntuado una vez) lo convierte en un ejemplo util para ensenar evaluacion correcta en problemas desbalanceados.
- Punto de partida para comparativas de modelos tabulares: sirve como linea base metodologica contra la que medir XGBoost, CatBoost o redes tabulares sobre el mismo dataset y el mismo split.
- Monitorizacion de deriva en produccion: al estar registrado en MLflow con version y Run ID, puede integrarse en un flujo que compare su PR-AUC contra reentrenamientos periodicos y dispare alertas si el rendimiento decae.
- Prototipado rapido de servicios de scoring: su inferencia es puramente CPU y el artefacto es pequeno, por lo que puede desplegarse como microservicio ligero en un contenedor para validar un flujo de decisión antes de invertir en infraestructura mayor.
- Auditoria de metricas en entornos regulados: las cifras de validacion y prueba estan separadas y trazadas, lo que facilita documentar el comportamiento esperado del sistema ante un revisor de riesgos.
- Analisis de coste-beneficio de umbrales: al disponer de TP, FP y FN del split de prueba, se puede recalcular el punto de corte optimo segun el coste relativo de un falso negativo frente a un falso positivo en cada negocio concreto.

## Benchmarks y rendimiento

Resultados publicados en la model card. Los recuentos de filas de cada split aparecen como "n/a" en la propia ficha, por lo que no se dispone del tamano muestral.

| Metrica | Validacion | Prueba (held-out) |
|---|---|---|
| PR-AUC | 0.7407 | 0.7462 |
| Recall | 0.8354 | 0.8878 |
| Precision | 0.5238 | 0.4555 |
| F1 | 0.6439 | 0.6021 |
| Verdaderos positivos | no disponible | 87 |
| Falsos positivos | no disponible | 104 |
| Falsos negativos | no disponible | 11 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de modelos de lenguaje en la informacion disponible, y no serian aplicables a este tipo de modelo. Como dato derivado de la tabla de prueba, la suma de verdaderos positivos y falsos negativos es 98, lo que sugiere 98 casos positivos en el split de prueba, aunque el numero total de transacciones evaluadas no se indica. La comparacion con modelos similares aparece como "n/a" en la model card original.

## Requisitos de hardware

- VRAM para inferencia: no aplica; tanto LightGBM como una regresion logistica sobre 29 caracteristicas se ejecutan en CPU sin necesidad de GPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU seria irrelevante para el cuello de botella real, que es el preprocesado y la latencia de red.
- Encaje en GPU de consumo: no aplica; el modelo cabe holgadamente en memoria RAM de cualquier maquina de desarrollo. El repositorio ocupa 0.0 GB.
- Opciones de despliegue: carga directa con `joblib` en Python, servicio HTTP propio (FastAPI, Flask), integracion en un `Pipeline` de scikit-learn, o empaquetado en contenedor. No aplican vLLM, llama.cpp, Ollama ni TGI, que estan pensados para modelos de lenguaje.
- MLflow: el modelo esta registrado en el registro de MLflow del autor, lo que permite cargarlo por nombre y version si se tiene acceso a ese servidor de tracking.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia por peticion ni de transacciones por segundo.

## Comparativa con modelos similares

No se han publicado comparativas en la informacion disponible, y la model card original marca la seccion como "n/a". Como referencia cualitativa de la misma categoria de tarea (deteccion de fraude tabular sobre el dataset de ULB), pueden considerarse las siguientes alternativas, sin que se disponga de cifras de rendimiento comparables para ninguna de ellas:

| Modelo alternativo | Tipo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento comparable |
|---|---|---|---|---|---|---|
| LightGBM (este modelo, segun etiquetas) | Arboles con boosting | no disponible | no aplica | MIT | HuggingFace | PR-AUC 0.7462 en prueba |
| XGBoost | Arboles con boosting | no disponible | no aplica | Apache 2.0 | Libreria ampliamente distribuida | no disponible |
| CatBoost | Arboles con boosting con categoricas nativas | no disponible | no aplica | Apache 2.0 | Libreria ampliamente distribuida | no disponible |
| Regresion logistica (baseline) | Modelo lineal | 30 coeficientes (29 caracteristicas mas intercepto, calculo teorico) | no aplica | depende de la implementacion | scikit-learn | no disponible |
| Isolation Forest | Deteccion de anomalias no supervisada | no disponible | no aplica | BSD | scikit-learn | no disponible |

La comparacion rigurosa exigiria fijar el mismo split, el mismo preprocesado y el mismo umbral de decision, algo que no puede hacerse con la informacion publicada.

## Limitaciones y advertencias

- La entrada del modelo es espanola y muy dependiente del dataset: V1-V28 son componentes PCA del dataset de Kaggle, anonimizadas y sin significado interpretable. Aplicarlo a transacciones reales exige reproducir exactamente la misma transformacion, algo que normalmente no es posible porque las componentes PCA originales no se publican con su base de proyeccion.
- Ambiguedad sobre el artefacto real: las etiquetas indican LightGBM, pero el codigo de ejemplo carga `baseline_lr.pkl`. No esta claro si el campeon registrado es el modelo de boosting o la regresion logistica base.
- Precisión baja: 0.4555 en prueba implica que mas de la mitad de las alertas son falsos positivos (104 falsos positivos frente a 87 verdaderos positivos). Un despliegue que bloquee automaticamente generaria una tasa de friccion muy alta para clientes legitimos.
- Umbral de decision no documentado: no se especifica el punto de corte usado para calcular recall, precision y F1, lo que impide reproducir exactamente las cifras reportadas.
- Numero de filas por split no disponible: la model card muestra "n/a" en los recuentos, lo que dificulta valorar la significacion estadistica de las metricas. Con solo 11 falsos negativos y 98 positivos, los intervalos de confianza son amplios.
- Sesgos conocidos: no documentados en la model card. Al tratarse de un dataset historico de transacciones, es razonable esperar sesgos temporales, geograficos y de poblacion, pero no hay analisis publicado al respecto.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de sobreajuste al dataset de origen y de degradacion ante cambios de distribucion (deriva de concepto).
- Limitaciones de idioma: el campo declara `en`, sin relevancia funcional porque la entrada es numerica.
- Calibracion de probabilidades: no se documenta ningun procedimiento de calibracion, por lo que las probabilidades de salida no deben interpretarse como frecuencias reales sin una validacion adicional.
- Licencia: MIT, lo que permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No hay restricciones adicionales declaradas, pero la licencia MIT no cubre los derechos sobre el dataset de Kaggle subyacente ni sobre las transacciones, que deben verificarse por separado.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, con actualizacion posterior a la creacion por apenas unos segundos. No hay senales de mantenimiento, versionado posterior ni soporte del autor.
- Ausencia de tests, documentacion de API y guia de despliegue: la model card se limita a metricas, un fragmento de codigo y el Run ID de MLflow.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/votrananhquan/fraud-detection-model
- Dataset de referencia citado en la model card: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud
- Identificador de ejecucion en MLflow (Run ID): 176f185e3b7a400dba35d6f841de31e2
- Modelo registrado en MLflow: nombre `fraud-detection-model`, version `3`, alias `production`
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados devueltos corresponden a paginas de ayuda de YouTube y YouTube Music, sin relacion alguna con el modelo ni con deteccion de fraude.
