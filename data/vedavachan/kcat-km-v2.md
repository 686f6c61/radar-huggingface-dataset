# VedaVachan/kcat-km-v2

## Resumen

`VedaVachan/kcat-km-v2` es un paquete de inferencia publicado en HuggingFace que predice dos parámetros cinéticos de enzimas, `log10_kcat` y `log10_km`, directamente a partir de tres columnas de un fichero Parquet: `id`, `smiles` (sustrato) y `sequence` (secuencia aminoacídica de la enzima). No es un modelo de lenguaje ni una red neuronal profunda: son dos regresores independientes `HistGradientBoostingRegressor` de scikit-learn entrenados sobre 2.148 características tabulares derivadas (descriptores RDKit, bits de Morgan, resúmenes de secuencia y banderas de valores faltantes). Lo desarrolla el usuario VedaVachan y se distribuye con licencia MIT.

Su relevancia es acotada y hay que leerla con precisión: el propio autor lo etiqueta como una **comparación exploratoria, no una mejora medida sobre V1**, y admite que el modelo HGBT **no superó la puerta interna de aceptación** calculada solo sobre el conjunto de entrenamiento. Aun así, se reajustó sobre las 36.970 filas públicas de entrenamiento por petición del usuario. En la validación interna, el modelo queda por debajo del control V1 (ExtraTrees) en ambas dianas, con una diferencia de SCC medio de −0,064844.

El paquete está pensado para ejecutarse en CPU (dos hilos), de forma determinista y offline, mediante un script `predict.py` o una imagen Docker Linux amd64. Su interés práctico es servir como baseline reproducible y como ejemplo de empaquetado de un modelo tabular para un reto de predicción de cinética enzimática, más que como herramienta de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Dos regresores independientes de gradient boosting sobre histogramas (`sklearn.ensemble.HistGradientBoostingRegressor`), uno por diana (`log10_kcat` y `log10_km`) |
| Parámetros totales | No disponible (ensemble de árboles; el autor no publica recuento de nodos ni número de árboles por modelo) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje; cada predicción consume una fila con un par enzima–sustrato) |
| Tipos de cuantización | No disponible (no se publican variantes cuantizadas; los árboles se serializan tal cual) |
| Idiomas soportados | No disponible (no procesa lenguaje natural; entrada en SMILES y secuencias de aminoácidos) |
| Licencia | MIT |
| Formato de pesos | `joblib` (según la etiqueta del repositorio); la model card solo indica que los pesos e imputador están en `weights/` y en la raíz del paquete |
| Entrada | Parquet con exactamente `id,smiles,sequence` en ese orden |
| Salida | CSV con exactamente `id,log10_kcat,log10_km`, un ID por cada ID de entrada, valores finitos y acotados, máximo 16 MiB |
| Número de características | 2.148 (56 features iniciales, 11 resúmenes de secuencia, 16 descriptores RDKit más banderas de faltantes, 2.048 bits de Morgan y una bandera de fallo molecular) |
| Hiperparámetros | 256 iteraciones, `learning_rate` 0,05, máximo 31 hojas, profundidad 6, mínimo 20 muestras por hoja, regularización L2 = 1, 64 bins de histograma, sin parada temprana |
| Filas de entrenamiento | 36.970 filas públicas (reajuste final sobre todos los datos) |
| Hilos de inferencia | 2 (CPU) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de características fijo más dos modelos HGBT independientes. Las 2.148 características provienen de cuatro bloques: 56 características iniciales, 11 resúmenes estadísticos de la secuencia proteica, 16 descriptores RDKit (con banderas de valor faltante) y 2.048 bits de Morgan para el sustrato, más una bandera de fallo molecular. Las medianas de los descriptores se ajustaron **solo** con filas públicas de entrenamiento. Las secuencias originales, incluidos los caracteres no canónicos X/B/U, y los identificadores de entrada no se alteran en ningún punto del pipeline.

Cada regresor se entrena sobre el objetivo en escala logarítmica, sin exponenciación, sin escalado del target y sin calibración posterior. El ajuste final se hizo sobre las 36.970 filas públicas con los hiperparámetros congelados en `model_config.json`, tras fallar la puerta interna de aceptación. La partición interna usada para medir tiene 23.937 filas de ajuste y 5.861 de validación, agrupadas por secuencia exacta sin modificar (una decisión orientada a evitar fuga de información; de ahí la etiqueta `leak-curber`). No se usaron etiquetas privadas ni entradas de validación públicas para el ajuste ni para la selección del modelo. El coste medido del reajuste completo fue de 223,06 s en Windows (25,08 s de generación de características, 91,17 s de ajuste de `kcat` y 97,57 s de ajuste de `Km`), con un pico de memoria de trabajo de 1.307,1 MiB.

## Capacidades

- Predicción simultánea de `log10_kcat` y `log10_km` para pares enzima–sustrato a partir de SMILES y secuencia proteica.
- Procesamiento por lotes de ficheros Parquet con validación estricta del esquema de columnas y del orden.
- Generación de descriptores moleculares (RDKit) y fingerprints de Morgan (2.048 bits) en el propio pipeline.
- Tratamiento explícito de valores faltantes mediante banderas e imputación con medianas ajustadas en entrenamiento.
- Ejecución determinista y offline: solo activos locales, sin llamadas a servicios externos.
- Ejecución en CPU con dos hilos, sin requisito de GPU.
- Salida acotada y verificada como finita, con límite de tamaño de 16 MiB y conservación exacta de los IDs de entrada.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo «thinking».
- No tiene capacidades de visión, audio ni generación de texto libre.

## Casos de uso

- **Triaje previo a ensayos húmedos**: dado un lote de pares enzima–sustrato candidatos en Parquet, el modelo produce `log10_kcat` y `log10_km` para ordenar qué combinaciones merecen caracterización experimental, reduciendo el número de ensayos a realizar.
- **Priorización en campañas de ingeniería de enzimas**: al evaluar variantes de una misma secuencia con un sustrato fijo, permite clasificar mutantes por `kcat` y por afinidad estimada antes de sintetizarlos.
- **Anotación masiva de bases de datos internas**: integrado en un pipeline ETL, convierte tablas de pares enzima–sustrato en columnas de parámetros cinéticos estimados, con la ventaja de que la salida es determinista y auditable.
- **Filtrado en diseño de rutas metabólicas**: en biología sintética, descartar enzimas candidatas cuya `kcat` predicha sea baja para el sustrato de interés antes de simulaciones de flujo metabólico más costosas.
- **Baseline reproducible para investigación metodológica**: su condición de comparación exploratoria frente a V1 (ExtraTrees) lo hace útil como referencia documentada en estudios sobre fuga de datos por similitud de secuencia, particionado por grupos y métricas de correlación de rango.
- **Validación de infraestructura de despliegue**: la imagen Docker linux/amd64 con inferencia offline, límite de CPU y memoria, y salida acotada sirve como ejemplo de empaquetado reproducible de un modelo tabular para evaluación ciega.
- **Docencia y prototipado rápido**: por su coste de ejecución (CPU, ~1,3 GiB de pico en entrenamiento y 4,27 s para 1.502 pares en inferencia) es apto para entornos sin GPU donde se quiera ilustrar un pipeline completo de features moleculares y boosting.

## Benchmarks y rendimiento

Resultados medidos en la partición interna (23.937 filas de ajuste, 5.861 de validación, agrupadas por secuencia exacta). El control es un modelo V1 ExtraTrees reentrenado solo con las mismas filas de ajuste internas:

| Diana | Modelo | SCC | RMSE | MAE | R² |
|---|---|---:|---:|---:|---:|
| kcat | V1 control | 0,558986 | 1,227626 | 0,943490 | 0,334134 |
| kcat | HGBT (V2) | 0,482273 | 1,287902 | 0,992390 | 0,267141 |
| Km | V1 control | 0,638278 | 0,824549 | 0,633169 | 0,411640 |
| Km | HGBT (V2) | 0,585304 | 0,872092 | 0,683228 | 0,341833 |

Comparaciones agregadas y por subgrupo:

| Métrica | HGBT (V2) | V1 control | Diferencia |
|---|---:|---:|---:|
| SCC medio (validación interna) | 0,533789 | 0,598632 | −0,064844 (IC 95 % bootstrap de 1.000 réplicas: [−0,081209, −0,050892]) |
| SCC medio en compuestos no vistos (749 filas) | 0,401249 | 0,406652 | −0,005403 |
| SCC medio en baja similitud de coseno de tripletes (2.768 filas) | 0,435812 | 0,491436 | −0,055624 |

Contexto adicional: la captura del leaderboard de V1 aportada por el usuario reporta un SCC medio de 0,5200735784224373; es un resultado externo de V1 y no una puntuación de V2. El holdout externo no se evaluó para HGBT porque la puerta interna falló; el SCC medio de 0,610338 obtenido antes con V1 en el holdout externo es un resultado separado y no es comparable con los valores internos. No se reclama ninguna puntuación ni posición en el leaderboard para V2.

## Requisitos de hardware

- **VRAM**: no aplica; el modelo no usa GPU. El autor no publica estimaciones de VRAM.
- **Memoria RAM**: pico de 1.307,1 MiB de memoria de trabajo durante el reajuste completo en Windows (cifra de proceso local, no de Docker). La inferencia verificada se ejecutó con un límite de 16 GiB, muy por encima de lo necesario.
- **GPU recomendadas**: ninguna. No hay soporte CUDA ni aceleración por GPU documentada.
- **CPU**: la inferencia usa dos hilos; el contenedor se validó con `--cpus 2`.
- **¿Cabe en hardware de consumidor?**: sí, en cualquier portátil o mini-PC x86-64 con ~2 GiB de RAM libre. El requisito real es tener disponible la rueda de RDKit y scikit-learn para la plataforma.
- **Despliegue**: script nativo `python predict.py --input INPUT --output OUTPUT` o imagen Docker linux/amd64 construida con instrucciones `COPY` explícitas; `_development/` queda excluido de la imagen y debe excluirse también de cualquier subida al repositorio.
- **Latencia y throughput**: 4,27 s para 1.502 pares en el contenedor Docker validado (≈350 pares/s, cálculo derivado de esas dos cifras), con build cacheado de 1,93 s. Entrenamiento completo: 223,06 s.
- **Tamaño de salida**: máximo 16 MiB por fichero CSV; en la validación Docker la salida fue de 72.791 bytes para 1.502 IDs.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| kcat-km-v2 (este) | Gradient boosting sobre features tabulares + Morgan | SMILES + secuencia | No disponible | No aplica | SCC medio 0,533789 en validación interna | MIT | HuggingFace |
| CatPred | Aprendizaje profundo con modelos preentrenados de proteína; predice kcat, Km y Ki | Secuencia y estructura | No disponible en la información recogida | No aplica | Mejora declarada en enzimas no vistas (sin cifras en la información disponible) | No disponible | Publicado en Nature Communications |
| KinForm | Extra Trees sobre representaciones optimizadas con información cinética | Features derivadas de secuencia | No disponible | No aplica | No disponible | No disponible | Publicado en npj Systems Biology and Applications |
| NNKcat | Red neuronal profunda con procesadores separados de sustrato y proteína | Secuencia + sustrato | No disponible | No aplica | No disponible | No disponible | Artículo en Briefings in Bioinformatics |
| DeltaCata | Red neuronal de grafos geométrica siamesa | Estructura + sustitución de residuo | No disponible | No aplica | Declara superar a predictores SOTA (sin cifras en la información disponible) | No disponible | GitHub (biomed-AI) |
| Kinetic Predictor (OpenKinetics) | Modelos de machine learning en servidor web | Par enzima–sustrato | No disponible | No aplica | No disponible | No disponible | Servicio web |

Nota: los cuatro primeros modelos se conocen solo a través de los resúmenes de las publicaciones enlazadas; no se dispone de sus cifras concretas de benchmarks ni de sus licencias en la información proporcionada, por lo que no se establece una comparación numérica directa.

## Limitaciones y advertencias

- **No supera a V1**: el SCC medio en validación interna es 0,533789 frente a 0,598632 del control ExtraTrees de V1, con un intervalo de confianza del 95 % para la diferencia enteramente negativo ([−0,081209, −0,050892]).
- **Puerta de aceptación fallida**: el autor declara explícitamente que el modelo HGBT no pasó el criterio interno de aceptación, calculado solo con datos de entrenamiento. Los resultados sobre el conjunto completo de entrenamiento **no son puntuaciones de holdout**.
- **Holdout externo no evaluado**: no hay ninguna medición de V2 sobre el holdout externo, y no se reclama puntuación ni posición en el leaderboard.
- **Separación de homología no demostrada**: el agrupamiento por secuencia exacta y la similitud por coseno de tripletes no prueban separación de homología; el riesgo de fuga por similitud persiste.
- **Riesgo de sobreajuste a secuencia**: al agrupar por secuencia exacta, variantes casi idénticas pueden quedar en lados distintos de la partición.
- **Dianas en log10 sin calibración**: la salida es `log10_kcat` y `log10_km` sin exponenciación ni escalado; cualquier consumidor debe aplicar la transformación inversa y asumir que no hay calibración ni intervalos de incertidumbre por predicción.
- **Sin metadatos de evaluación de sesgo**: no se publican análisis de sesgo por familia enzimática, tipo de sustrato u organismo. La cobertura está limitada al espacio químico y proteico representado en las 36.970 filas públicas.
- **Entrada frágil**: el esquema Parquet debe tener exactamente `id,smiles,sequence` en ese orden; no se documenta comportamiento ante SMILES inválidos más allá de la bandera de fallo molecular. Los caracteres X/B/U se conservan sin normalizar.
- **Licencia**: MIT para el paquete; conviene revisar las licencias de las dependencias (scikit-learn y RDKit tienen sus propias condiciones) antes de un uso comercial.
- **Señales de madurez**: 0 descargas y 0 likes en el momento de la consulta, y un tamaño de repositorio declarado de 0,0 GB, lo que obliga a verificar que los pesos (`weights/`) están realmente presentes antes de desplegar.
- **Sin benchmark publicado frente a CatPred, KinForm, NNKcat o DeltaCata**: no es posible situar este modelo en el estado del arte con los datos disponibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VedaVachan/kcat-km-v2
- CatPred (Nature Communications): https://www.nature.com/articles/s41467-025-57215-9
- KinForm (npj Systems Biology and Applications): https://www.nature.com/articles/s41540-026-00692-5
- NNKcat (Briefings in Bioinformatics): https://academic.oup.com/bib/article/26/3/bbaf212/8131740
- Kinetic Predictor (OpenKinetics): https://predictor.openkinetics.org/
- DeltaCata (GitHub): https://github.com/biomed-AI/DeltaCata
