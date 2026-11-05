# VedaVachan/kcat-km-v14

## Resumen

kcat-km-v14 es un ensemble de modelos de aprendizaje automatico clasico (LightGBM y ExtraTrees) desarrollado por el usuario VedaVachan para predecir parametros de cinetica enzimatica: la constante catalitica (kcat) y la constante de Michaelis (km), ambas en escala log10. No se trata de un modelo de lenguaje ni de una red neuronal generativa, sino de un sistema de regresion supervisada orientado a un problema concreto de biologia computacional: estimar la eficiencia de una enzima sobre un sustrato a partir de la secuencia proteica y la estructura quimica del sustrato. El repositorio ocupa 0,5 GB e incluye pesos en formato joblib y safetensors, junto con un pipeline de inferencia offline.

El modelo combina tres miembros fijos que promedian dos regresores LightGBM y un bosque ExtraTrees multi-salida al 50 por ciento. El miembro A usa caracteristicas artesanales de proteina, quimica, la media de embeddings de ESM2-8M congelado y priors de sustrato exacto; el miembro B anade estadisticas de enzimas vecinas y el C estadisticas de sustratos similares. Los tres miembros se promedian por igual, sin ajuste de mezcla, calibracion de objetivo, recorte ni transformacion de rango.

Su relevancia actual es limitada pero especifica: ofrece una linea base reproducible y completamente offline para la prediccion de kcat y km, con un contrato de entrada y salida estricto (Parquet con columnas id, smiles y sequence; CSV con id, log10_kcat y log10_km). El autor declara explicitamente que el rendimiento en leaderboard no se ha medido y que las metricas presentadas son locales, no comparables con resultados publicos de competicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de ML clasico: 3 miembros, cada uno con 2 regresores LightGBM y 1 bosque ExtraTrees multi-salida (promedio 50/50); representacion profunda congelada ESM2-8M |
| Parametros totales | no disponible (no es una red neuronal entrenada de extremo a extremo; el unico componente neuronal es ESM2-8M congelado, de aproximadamente 8 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; las proteinas de hasta 512 residuos se codifican completas, las mas largas usan ventanas separadas de primeros 256 y ultimos 256 residuos |
| Tipos de cuantizacion | no disponible; ESM se usa en FP32 congelado; los modelos de arboles no se cuantizan |
| Idiomas soportados | no aplica (modelo de biologia computacional, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | joblib y safetensors |

## Arquitectura y entrenamiento

El sistema es un ensemble de tres miembros sobre caracteristicas tabulares derivadas de secuencia proteica y SMILES del sustrato. El miembro A emplea 3077 caracteristicas: 20 fracciones de aminoacidos, 400 dipetidos adyacentes validos, 60 fracciones regionales, 15 caracteristicas de longitud, hidrofobicidad, residuos no estandar y regiones vacias, ademas de 2048 bins Morgan COUNT quirales de radio 2, 167 claves MACCS, 16 descriptores RDKit nombrados, 16 flags de valores faltantes y 3 flags de fallo. Los miembros B y C anaden estadisticas de enzimas vecinas y sustratos similares respectivamente, alcanzando 3090 caracteristicas. La representacion proteica usa ESM2-8M congelado en FP32 (revision c731040fcd8d73dceaa04b0a8e6329b345b0f5df), con mean-pooling de los estados finales de residuo excluyendo tokens especiales y de padding.

El entrenamiento se realizo sobre 42524 filas publicas de la release a18f8d542c1849507ff1711b970b48b72a998c8c, con cross-fitting anidado de 5 folds por clusters MMseqs en cada particion de ajuste. Las estadisticas de objetivo, el centrado de referencias y la imputacion de descriptores excluyen el fold de cluster de cada fila. Los hiperparametros de LightGBM se seleccionaron por objetivo y miembro sobre SCC interna, con cap de 4000 rondas y paciencia de 150; los conteos exactos fueron A: 161 rondas para log10_kcat y 354 para log10_km; B: 806 y 393; C: 1424 y 482. ExtraTrees usa 200 arboles, rasgos sqrt, hoja minima 3 y semilla 42. No hay ajuste de mezcla, calibracion de objetivo, recorte ni transformacion de rango.

## Capacidades

- Prediccion de log10_kcat y log10_km para pares enzima-sustrato a partir de secuencia proteica y SMILES.
- Codificacion de proteinas de hasta 512 residuos completas; proteinas mas largas mediante ventanas de primeros 256 y ultimos 256 residuos con promedio de pools (se pierden los residuos centrales).
- Manejo de sustratos no vistos mediante medias globales de ajuste, soporte cero y flags explicitos.
- Uso de estadisticas de enzimas vecinas (hasta 10 referencias por coseno ESM centrado y unitario) y de sustratos similares (hasta 5 referencias por Tanimoto binario Morgan, excluyendo SMILES identicos en crudo).
- Inferencia completamente offline, sin GPU ni acceso a internet, con contrato estricto de entrada y salida.
- Deduplicacion computacional de pares, secuencias y SMILES, restaurando todas las filas originales en la salida.
- Rechazo de IDs duplicados o invalidos y de violaciones del contrato de cadena no vacia; los SMILES invalidos no vacios reciben huellas quimicas a cero, medianas de entrenamiento, flags de faltante y fallo, y ninguna referencia de sustrato similar.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades linguisticas: es un modelo de regresion tabular especializado.

## Casos de uso

- Priorizacion de enzimas en ingenieria de proteinas: dado un panel de variantes de secuencia y un sustrato objetivo, el modelo estima log10_kcat y log10_km para filtrar candidatos antes de ensayos experimentales, reduciendo el numero de mediciones in vitro necesarias.
- Anotacion de bases de datos de cinetica enzimatica: rellenar valores faltantes de kcat y km en registros publicos donde solo se conoce la secuencia y el sustrato, usando el contrato Parquet de entrada y CSV de salida para procesar lotes.
- Diseno de vias metabolicas: estimar la eficiencia de enzimas candidatas sobre metabolitos concretos para descartar combinaciones con km desfavorable o kcat baja antes de simulaciones de flujo metabolico.
- Deteccion de pares enzima-sustrato anomalos: comparar la prediccion del modelo con valores experimentales para senalar posibles errores de anotacion o mediciones atipicas en un dataset.
- Filtrado en cribados virtuales de sustratos: para una enzima de interes, predecir kcat y km sobre una biblioteca de SMILES y ordenar los sustratos por eficiencia catalitica estimada.
- Linea base reproducible en investigacion metodologica: el pipeline offline con Docker, 2 CPUs, 16 GiB y 600 segundos permite reproducir exactamente las predicciones y comparar con nuevos metodos bajo el mismo contrato de datos.
- Evaluacion de robustez ante sustratos novedosos: los flags explicitos de sustrato no visto y las referencias vecinas permiten analizar como degrada la prediccion fuera de la distribucion de entrenamiento.

## Benchmarks y rendimiento

El autor declara explicitamente que no se ha medido el rendimiento en leaderboard y que no se reclama ninguna puntuacion ni ranking. Las unicas metricas disponibles son locales de desarrollo:

| Metrica | Control | kcat-km-v14 |
|---|---|---|
| Mean SCC local | 0,486186 | 0,534639 |
| Mean target RMSE local | 1,217611 | 1,198109 |

Los guards predeclarados superados incluyen: SCC pareado con limite inferior del IC95 mayor que 0, delta de SCC de log10_kcat mayor o igual a -0,01, delta de SCC de log10_kcat en no vistos mayor o igual a -0,01, ratio de RMSE de log10_kcat menor o igual a 1,02, y los equivalentes para log10_km. Estas metricas son descriptivas y no constituyen resultados de leaderboard.

## Requisitos de hardware

- VRAM estimada: no aplica; la inferencia no requiere GPU y funciona en CPU.
- GPU recomendadas: ninguna; el autor especifica que no se necesita GPU.
- Cabe en hardware de consumo: si, en cualquier maquina con CPU x86-64 y al menos 16 GiB de RAM.
- Opciones de despliegue: Dockerfile Linux amd64 suministrado, ejecutado con red deshabilitada, 2 CPUs, 16 GiB y 600 segundos; inferencia via `python /app/predict.py --input INPUT --output OUTPUT`.
- Latencia y throughput: no disponibles de forma explicita; el limite de 600 segundos con 2 CPUs sugiere que el procesamiento por lotes de tamanos moderados es viable, pero no se publican cifras de latencia por fila.
- Todos los hilos de inferencia estan fijados a 2.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. El autor indica que este trabajo no es una reproduccion de una linea base neuronal academica ni una garantia de cumplimiento de curso, por lo que no se pueden establecer comparaciones fiables con otros predictores de kcat y km sin datos publicados.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v14 | no disponible (ensemble de arboles + ESM2-8M congelado) | no aplica | SCC local 0,534639; RMSE local 1,198109 | no disponible | HuggingFace, 0 descargas, 0 likes |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El rendimiento en leaderboard no se ha medido; las metricas presentadas son locales y descriptivas, no comparables con resultados publicos.
- Los datos de desarrollo se observaron repetidamente y los intervalos de cluster-bootstrap son descriptivos, no inferenciales.
- Las proteinas de mas de 512 residuos pierden los residuos centrales al usar ventanas de primeros 256 y ultimos 256; no se reclama equivalencia con pooling de 35M, intermedio o estandar.
- Las etiquetas de referencia son promedios a nivel de entidad: los promedios de enzima mezclan sustratos y los de sustrato mezclan enzimas, lo que puede introducir ruido en las predicciones.
- Los arrays agregados pueden retener etiquetas singleton del entrenamiento publico; el autor remite a NOTICE.md.
- No se empaquetan el dataset crudo, etiquetas privadas ni entradas de entrenamiento crudas.
- Los SMILES invalidos no vacios reciben huellas quimicas a cero y medianas de entrenamiento, lo que produce predicciones poco informativas sin senal de error explicita en la salida.
- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial.
- El modelo es de regresion tabular especializada: no genera texto, no razona, no soporta agentes ni tool calling, y no debe presentarse como un modelo de lenguaje.
- El contrato de entrada es estricto: columnas exactas id, smiles y sequence; IDs duplicados o invalidos y violaciones de cadena no vacia se rechazan.
- No se normalizan las cadenas ni los IDs originales, lo que puede provocar discrepancias si los datos de entrada no estan limpios.

## Enlaces

- HuggingFace: https://huggingface.co/VedaVachan/kcat-km-v14
