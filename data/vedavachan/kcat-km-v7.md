# VedaVachan/kcat-km-v7

## Resumen

kcat-km-v7 es un paquete de modelos de regresion supervisada orientado a la prediccion de parametros enzimaticos: la constante catalitica kcat y la constante de Michaelis Km, ambas en escala logaritmica (log10). Lo desarrolla el usuario VedaVachan y se publica en HuggingFace como un artefacto de inferencia offline empaquetado con joblib, no como un modelo de lenguaje ni una red neuronal profunda. La entrada son secuencias proteicas exactas y cadenas SMILES de sustrato; la salida son dos valores numericos continuos por fila.

El sistema combina dos componentes independientes. Para kcat se reutiliza sin cambios un componente ExtraTrees verificado de la version local V6 (heredado a su vez de V4), con su propio imputador, vectorizador, SVD y esquema. Para Km se emplea un regresor CatBoost sobre 2.212 caracteristicas: 2.148 de composicion de secuencia, longitud, descriptores RDKit, indicadores de valores faltantes y huellas Morgan, mas 64 componentes TF-IDF/SVD de 3-meros de caracteres y tres estadisticas derivadas de SMILES exactos (media de log10_km del sustrato con shrinkage, log1p del recuento de soporte e indicador de sustrato visto).

Es relevante ahora principalmente como caso de estudio metodologico: el propio autor declara que el paquete se publica por decision explicita pese a no superar la puerta de aceptacion estadistica congelada, que no constituye una mejora confirmada y que no existe puntuacion de leaderboard para V7. La ganancia media de correlacion de rangos (SCC) frente al control es de +0,000649, con intervalo de confianza bootstrap del 95 % de [-0,004627, +0,006614], lo que cruza cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de modelos clasicos de ML: ExtraTrees (kcat) + CatBoost de regresion sobre caracteristicas (Km) |
| Parametros totales | no disponible (no es una red neuronal; el modelo Km serializado ocupa 1.896.168 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular de una fila por par secuencia-SMILES) |
| Tipos de cuantizacion | no disponible (no aplica a modelos tabulares) |
| Idiomas soportados | no disponible (no procesa lenguaje natural; entradas SMILES y secuencias proteicas) |
| Licencia | no disponible |
| Formato de pesos | joblib (artefactos serializados de scikit-learn/CatBoost) |

## Arquitectura y entrenamiento

El componente de kcat es un ExtraTrees con imputador, vectorizador, SVD y esquema copiados del predictor local V6, que a su vez corresponde al kcat original de V4. El autor indica que los registros anteriores de V6 no permitieron establecer la identidad historica de las revisiones enviadas de V3/V4, por lo que no se reclama una procedencia mas fuerte; la equivalencia de salida con el predictor local V6 real se prueba por separado.

El componente de Km es un CatBoost de regresion entrenado en CPU con profundidad 6, learning_rate 0,05, l2_leaf_reg 10, semilla 42 y perdida RMSE. Se seleccionaron previamente 1.638 arboles mediante una particion de parada agrupada por secuencia dentro del entrenamiento interno (paciencia 100, maximo 2.000) y despues se congelaron. El reajuste completo usa exclusivamente las 36.970 filas publicas de entrenamiento, sin ajuste sobre validacion publica. Las caracteristicas de sustrato se calculan con validacion cruzada de cinco pliegues agrupada por secuencia exacta, excluyendo las etiquetas del grupo codificado de las estadisticas de sustrato y globales; en inferencia se usan mapeos ajustados sobre todas las filas publicas. Los SMILES exactos no vistos reciben la media global de entrenamiento, recuento cero e indicador cero. No se recortan, exponencian, calibran ni reescalan los objetivos. El entrenamiento uso 4 hilos; la inferencia, 2 workers/hilos. La generacion de caracteristicas, cross-fitting y serializacion tardo 45,388 s; el ajuste de CatBoost, 109,757 s.

## Capacidades

- Prediccion de log10_kcat a partir de secuencia proteica exacta y SMILES de sustrato.
- Prediccion de log10_km con el mismo tipo de entrada.
- Procesamiento por lotes: cada fila del Parquet de entrada produce exactamente una fila CSV de salida, en el orden original.
- Manejo explicito de moleculas invalidas mediante el fallback de descriptores/huellas existente.
- Manejo de sustratos no vistos en entrenamiento mediante imputacion con la media global, recuento cero e indicador cero.
- Inferencia completamente offline: todos los modelos y activos de preprocesamiento son locales, sin necesidad de internet ni GPU.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto; no es un modelo de lenguaje.

## Casos de uso

- Priorizacion de enzimas en ingenieria de proteinas: dado un panel de variantes de secuencia y un sustrato de interes, el modelo estima log10_kcat y log10_km para ordenar candidatos antes de ensayos experimentales, reduciendo el espacio de busqueda in vitro.
- Filtrado temprano en diseno de rutas metabolicas: estimar la constante de Michaelis de enzimas candidatas frente a metabolitos concretos permite descartar combinaciones con Km desfavorableantes de construir cepas.
- Anotacion funcional a escala de genoma: procesar lotes de pares secuencia-SMILES en un pipeline offline (2 CPUs, 16 GiB, 600 s) para enriquecer bases de datos enzimaticas con predicciones de parametros cineticos.
- Analisis de sensibilidad de sustrato: comparar las predicciones de Km para un mismo enzima frente a distintos SMILES y detectar sustratos fuera de la distribucion de entrenamiento mediante el indicador de soporte.
- Docencia e investigacion metodologica: el paquete sirve como ejemplo reproducible de validacion agrupada por secuencia, cross-fitting y evaluacion con intervalos bootstrap en tareas de regresion biologica.
- Integracion en pipelines de seleccion de variantes: combinar las salidas de kcat y Km con heuristicas de eficiencia catalitica (kcat/Km) para clasificar mutantes en campanas de directed evolution.
- Baseline interno para modelos de lenguaje quimico o grafos neuronales: al ser un ensemble tabular rapido y determinista, resulta util como referencia de comparacion en proyectos que evaluan modelos mas pesados.

## Benchmarks y rendimiento

Resultados locales declarados por el autor sobre 5.861 filas de validacion interna emparejadas:

| Sistema | kcat SCC | Km SCC | Mean SCC | Km RMSE | Km MAE |
|---|---:|---:|---:|---:|---:|
| V6 entrenado por particion | 0,576940 | 0,639929 | 0,608434 | 0,821244 | 0,629067 |
| Candidato B (V7, Km) | 0,576940 | 0,641226 | 0,609083 | 0,816901 | 0,629832 |

La ganancia media de SCC es de +0,000649, con intervalo de confianza bootstrap del 95 % agrupado por secuencia exacta de [-0,004627, +0,006614]; la puerta de cota inferior positiva no se supero. En compuestos no vistos, el SCC de Km del candidato B fue 0,466695 frente a 0,472033 del control; en el tercio de menor similitud de tripletes, 0,532274 frente a 0,528518. El autor advierte que la agrupacion por secuencia exacta no equivale a separacion por homologia y que el coseno de tripletes no esta alineado con la identidad de secuencia. No hay puntuacion de leaderboard para V7 y las puntuaciones locales no son puntuaciones de leaderboard.

## Requisitos de hardware

- CPU: objetivo Linux amd64 con 2 CPUs; el entrenamiento uso 4 hilos y la inferencia 2 workers/hilos.
- Memoria: 16 GiB en el objetivo de inferencia; el pico de memoria del proceso de entrenamiento con reajuste completo fue de 1.007.767.552 bytes (pico del ciclo de vida del proceso reportado por el sistema operativo, no una medida de RAM de despliegue).
- GPU: no necesaria; la inferencia no requiere GPU.
- VRAM estimada: no aplica.
- Cabe en cualquier maquina de consumo: el modelo Km serializado ocupa 1.896.168 bytes y el paquete completo se publica en un repositorio con limite de 4 GiB.
- Despliegue: ejecucion mediante `python /app/predict.py --input INPUT --output OUTPUT`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Tiempo de ejecucion: limite de 600 segundos en el objetivo Linux amd64; no se publican cifras de latencia por fila ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v7 | ExtraTrees + CatBoost tabular | no disponible | no aplica | no disponible | HuggingFace (0 descargas, 0 likes) |
| V6 local (control interno) | ExtraTrees + regresion tabular | no disponible | no aplica | no disponible | Referencia interna del autor, no publicada como modelo independiente |
| Modelos neuronales de prediccion de kcat/Km (p. ej. basados en protein language models) | Transformers sobre secuencia | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos verificables de benchmarks de terceros para establecer una comparacion cuantitativa con alternativas de la misma tarea; la unica comparacion documentada es interna (V6 frente a candidato B).

## Limitaciones y advertencias

- El autor declara explicitamente que el paquete no es una mejora confirmada y que no supero la puerta de aceptacion estadistica congelada; el intervalo de confianza de la ganancia de SCC cruza cero.
- No existe puntuacion de leaderboard para V7; las cifras locales no deben interpretarse como rendimiento competitivo.
- La seleccion primaria del candidato y la inspeccion repetida de validacion previa limitan las afirmaciones de generalizacion.
- La seleccion del componente V6 estuvo informada por retroalimentacion historica de leaderboard, lo que introduce riesgo de sobreajuste al benchmark.
- La agrupacion por secuencia exacta no constituye separacion por homologia; secuencias homolegas pueden filtrar informacion entre particiones.
- El coseno de tripletes usado para estratificar similitud no esta alineado con la identidad de secuencia real.
- En compuestos no vistos el SCC de Km del candidato B es inferior al control (0,466695 frente a 0,472033), lo que sugiere peor generalizacion fuera de la distribucion.
- Los sustratos no vistos reciben la media global de entrenamiento, lo que produce predicciones poco informativas para quimica novedosa.
- La licencia no esta declarada, por lo que el uso comercial queda sin marco legal explicito.
- El modelo no procesa lenguaje natural ni admite instrucciones; cualquier uso fuera de la prediccion tabular de kcat/Km no esta soportado.
- La procedencia historica de las revisiones V3/V4 no pudo establecerse; no se garantiza trazabilidad completa del componente kcat.
- Riesgo de alucinacion no aplica en el sentido habitual, pero si existe riesgo de predicciones con aparente precision para entradas fuera de dominio sin senal clara de incertidumbre mas alla del indicador de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VedaVachan/kcat-km-v7
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios adicionales ni demos.
