# VedaVachan/kcat-km-v6

## Resumen

kcat-km-v6 es un modelo predictivo de aprendizaje automatico clasico, no un modelo de lenguaje. Desarrollado por el usuario VedaVachan y publicado en Hugging Face, su funcion es predecir dos parametros enzimaticos clave: la constante catalitica (kcat) y la constante de Michaelis (km), a partir de la secuencia de aminoacidos de una enzima y de la estructura SMILES de un sustrato. Se distribuye como un paquete de artefactos `sklearn` serializados con `joblib`, con un tamano de repositorio de aproximadamente 0,1 GB.

La version v6 es una combinacion "hibrida" de dos modelos locales previos: utiliza el modelo V4 verificado para predecir log10_kcat y el modelo V3 verificado para predecir log10_km. Cada componente conserva su propio imputador, su vectorizador TF-IDF de secuencia, su reduccion SVD y su esquema de caracteristicas. No hay reentrenamiento, calibracion ni ajuste conjunto: son dos bosques ExtraTrees fijos que se ejecutan de forma independiente.

La relevancia de esta ficha es limitada en el contexto de IA generativa: no es un transformer, no procesa lenguaje natural ni admite instrucciones. Es una herramienta de regresion supervisada orientada a bioinformatica y enzimologia computacional. La propia model card es inusualmente honesta y advierte de que el modelo hibrido obtiene peores resultados que sus componentes individuales en las particiones locales evaluadas, y de que la procedencia de las revisiones historicas no esta verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de dos bosques ExtraTrees (scikit-learn) con pipelines de features TF-IDF/SVD y descriptores RDKit |
| Parametros totales | no disponible (modelos de arboles; no aplica el concepto de parametros neuronales) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; entrada tabular fija de 2212 caracteristicas) |
| Tipos de cuantizacion | no disponible (artefactos `joblib` de sklearn; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | artefactos `sklearn` serializados con `joblib` (rutas `weights/v4_kcat` y `weights/v3_km`) |

## Arquitectura y entrenamiento

El sistema no es una red neuronal. Se compone de dos bosques ExtraTrees independientes, cada uno con 256 arboles, profundidad maxima 24, minimo de 4 muestras por hoja, minimo de 8 muestras para dividir, maximo de 4096 hojas, `bootstrap=False` y semilla 42. El modelo de kcat (V4) usa `max_features=0.6` y el de km (V3) usa `max_features=0.3`. Ambos se entrenaron sobre 36 970 filas publicas, segun la model card.

Cada componente genera 2212 caracteristicas ordenadas por fuente: 2148 de composicion de secuencia, secuencia simple, descriptores RDKit y flags de valores faltantes, bits de Morgan y flags de fallo, seguidas de 64 caracteristicas TF-IDF/SVD de tripletes de caracteres. No hay truncamiento de secuencia, codificador preentrenado ni componente neuronal. En inferencia solo cambian los workers a 2, manteniendo el resto de la configuracion original de despliegue. No se realizo reentrenamiento, calibracion, recorte ni modificacion de pesos al construir la v6.

## Capacidades

- Prediccion de log10_kcat y log10_km a partir de pares (SMILES, secuencia) de enzima y sustrato.
- Procesamiento por lotes mediante un script de inferencia (`python /app/predict.py --input INPUT --output OUTPUT`).
- Entrada en formato Parquet con columnas exactas `id,smiles,sequence`; salida en CSV con columnas exactas `id,log10_kcat,log10_km`.
- Deduplicacion de calculo de caracteristicas mediante cache, sin duplicar filas ni predicciones.
- Comprobacion global de IDs duplicados y reglas de cadenas/ID de arranque.
- Ejecucion en CPU unicamente, con dos workers, sin red ni credenciales.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Prediccion de parametros enzimaticos en pipelines de biologia computacional: dado un lote de pares enzima-sustrato en Parquet, el modelo devuelve log10_kcat y log10_km para priorizar candidatos en cribados de enzimas.
- Filtrado previo a experimentos de laboratorio: usar las predicciones para descartar combinaciones enzima-sustrato con baja kcat o km desfavorable antes de ensayos costosos.
- Anotacion de bases de datos de enzimas: procesar registros historicos con SMILES y secuencia para completar campos de kcat y km ausentes.
- Integracion en contenedores Docker: el paquete esta pensado para despliegue en imagen Linux amd64 con 2 CPUs, 16 GiB y limite de 600 segundos, lo que permite ejecutarlo como servicio de inferencia por lotes.
- Analisis de sensibilidad de sustratos: variar el SMILES manteniendo la secuencia para estudiar como cambia la prediccion de km, util en estudios de especificidad enzimatica.
- Comparacion de variantes de secuencia: mantener el sustrato y modificar la secuencia para explorar el efecto de mutaciones sobre kcat y km en diseno de proteinas.
- Docencia y prototipado en enzimologia computacional: al ser CPU-only y de licencia MIT, sirve como referencia reproducible sin necesidad de GPU.

## Benchmarks y rendimiento

La model card proporciona resultados de correlacion de rango de Spearman (SCC) en particiones locales identicas:

| Particion local identica | V3 Mean SCC | V4 Mean SCC | V6 hibrido local | V5 Mean SCC |
|---|---:|---:|---:|---:|
| seed43, 5861 filas | 0,607768 | 0,612897 | 0,608434 | 0,613110 |
| seed47, 5999 filas | 0,613117 | 0,615497 | 0,613459 | no disponible en filas identicas |

La model card indica que el hibrido es peor que V4 en estas particiones y que V5 en la particion principal. La cifra aritmetica 0,5312491288 derivada de SCC historicos de componentes es condicional y no un resultado medido de V6. No se declara ninguna puntuacion ni posicion en leaderboard para V6.

## Requisitos de hardware

- Inferencia en CPU unicamente; no requiere GPU.
- Entorno de referencia: Linux amd64, `/usr/local/bin/python`, 2 CPUs, 16 GiB de RAM, limite de 600 segundos.
- Tamano del payload de despliegue inferior a 4 GiB; el repositorio ocupa aproximadamente 0,1 GB.
- Salida limitada a CSV inferior a 16 MiB y predicciones finitas con valor absoluto menor o igual a 1 000 000.
- Despliegue mediante contenedor Docker con `COPY` explicito y `.dockerignore` de lista blanca que excluye `_development`, snapshots historicos, datasets, predicciones, caches, logs, entornos y activos neuronales/ESM no usados.
- No se documentan latencia ni throughput medidos; la model card remite a un registro de readiness con fecha separado para los resultados reales de comparacion nativa/contenedor/componentes.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v6 | Ensemble ExtraTrees (sklearn) | no aplica | no aplica | MIT | Hugging Face, CPU-only |
| kcat-km V4 (componente) | ExtraTrees (sklearn) | no aplica | no aplica | MIT (segun repositorio del autor) | Local verificado |
| kcat-km V3 (componente) | ExtraTrees (sklearn) | no aplica | no aplica | MIT (segun repositorio del autor) | Local verificado |
| kcat-km V5 | no disponible | no disponible | no disponible | no disponible | Referenciado en la model card |

No se dispone de informacion sobre modelos alternativos externos de prediccion de kcat/km en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo hibrido obtiene peor SCC que V4 en las particiones locales evaluadas y que V5 en la particion principal; no se realizo ajuste posterior.
- La procedencia de las revisiones historicas enviadas esta sin verificar: el acceso al snapshot devolvio HTTP 401 y las SHAs completas son desconocidas. El paquete usa activos locales verificados, no snapshots historicos certificados.
- La seleccion de componentes se baso en validacion historica de leaderboard, por lo que no constituye una confirmacion independiente de generalizacion.
- La agrupacion por secuencia exacta no equivale a separacion por homologia; puede haber fuga de informacion entre particiones.
- Las predicciones son logaritmicas directas, sin exponenciacion ni recorte de salida; pueden aparecer valores atipicos.
- No se evaluaron de nuevo los datos externos.
- No hay garantia de puntuacion ni posicion en leaderboard para V6.
- Es un modelo de regresion tabular: no admite instrucciones en lenguaje natural, no razona, no genera texto y no soporta tool calling.
- La model card no documenta sesgos, cobertura de idiomas ni rendimiento fuera de las particiones locales citadas.
- Uso comercial permitido por licencia MIT, pero la calidad predictiva debe validarse en el dominio concreto antes de produccion.

## Enlaces

- Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v6
- Model card (README del repositorio): incluida en la pagina de Hugging Face
- Script de inferencia referenciado: `/app/predict.py` (dentro del paquete)
- Rutas de pesos: `weights/v4_kcat` y `weights/v3_km`
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos.
