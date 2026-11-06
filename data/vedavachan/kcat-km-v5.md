# VedaVachan/kcat-km-v5

## Resumen

kcat-km-v5 es un modelo predictivo de propiedades enzimáticas desarrollado por el usuario VedaVachan y publicado en Hugging Face. No es un modelo de lenguaje ni un transformer generativo: es un pipeline de aprendizaje automático clásico empaquetado con scikit-learn que predice dos parámetros cinéticos de enzimas, la constante catalítica (kcat) y la constante de Michaelis (Km), a partir de la secuencia de aminoácidos y la estructura SMILES del sustrato. El modelo combina un ensamblado de árboles ExtraTrees para kcat (heredado sin cambios de la versión V3) con un blend para Km formado por un ExtraTrees y un perceptrón multicapa pequeño.

La relevancia del modelo es acotada y muy específica: se orienta a laboratorios de biología computacional y enzimología que necesitan estimaciones rápidas de parámetros cinéticos sin depender de servicios en la nube ni de codificadores preentrenados. El repositorio ocupa aproximadamente 0,1 GB, funciona exclusivamente en CPU con dos hilos de inferencia y se distribuye con licencia MIT, lo que facilita su integración en pipelines internos.

Conviene subrayar que el autor no reporta ninguna puntuación de leaderboard pública: las cifras de rendimiento son comparaciones locales sobre validación interna, con un tamaño de efecto muy pequeño (ganancia de correlación de Spearman de entre +0,002 y +0,009 frente a V3). No se ha realizado evaluación sobre un conjunto de retención externo (outer holdout).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: ExtraTrees para kcat; blend Km = 0,75 * ExtraTrees V3 + 0,25 * MLP (2212 -> 256 ReLU -> 64 ReLU -> 1) |
| Parametros totales | No disponible (el MLP de inferencia empaquetado ocupa 4.340.726 bytes; el tamaño de los ExtraTrees no se detalla) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no secuencial generativo) |
| Tipos de cuantizacion | No disponible (no aplica; modelo sklearn/joblib) |
| Idiomas soportados | No disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib (assets de scikit-learn); imagen Docker con `predict.py` |

## Arquitectura y entrenamiento

El modelo es un ensemble supervisado de regresión sobre dos objetivos continuos: `log10_kcat` y `log10_km`, predichos directamente en sus unidades logarítmicas originales, sin exponenciación, recorte ni conversión de unidades físicas asumida. La rama de kcat es el pipeline ExtraTrees de V3 sin modificaciones. La rama de Km combina un 75 % de ExtraTrees V3 con un 25 % de un MLP específico de Km con arquitectura 2212 -> 256 ReLU -> 64 ReLU -> 1, entrenado con Adam (lr = 0,001, alpha = 0,01), batch de 256 y semilla 42.

Las características son las 2212 del pipeline V3: 2148 descriptores, composición y bits de Morgan originales, seguidos de 64 características TF-IDF/SVD de tripletes de caracteres. Se preservan los caracteres X/B/U y las cadenas de entrada originales. El escalado continuo aprendido afecta a 147 columnas, mientras que 2065 columnas binarias (bits y flags) permanecen binarias. La imputación, el vocabulario, el IDF y el SVD se ajustan únicamente sobre los datos de entrenamiento. El reajuste neural público usó 36.970 filas de entrenamiento y 16 épocas fijas, derivadas de la mediana redondeada de selecciones solo de entrenamiento [12, 19], con un tiempo total de ajuste de 56,004 s. Los pesos y el preprocesamiento de kcat y del ExtraTrees de Km son idénticos byte a byte a los assets públicos de V3.

## Capacidades

- Predicción de `log10_kcat` y `log10_km` a partir de pares (secuencia de aminoácidos, SMILES de sustrato).
- Inferencia por lotes en formato Parquet de entrada con columnas exactas `id,smiles,sequence`.
- Salida en CSV con columnas exactas `id,log10_kcat,log10_km`, con cada ID original una sola vez.
- Caché de características por secuencia/SMILES exactos para acelerar el cálculo (sin agrupación ni deduplicación por ID).
- Ejecución totalmente offline en CPU, sin credenciales, sin internet y sin codificador preentrenado.
- Despliegue reproducible mediante imagen Docker (linux/amd64, dos hilos/procesos de inferencia).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Filtrado temprano en diseño de enzimas: dado un conjunto de variantes de secuencia y un sustrato candidato, el modelo permite priorizar mutantes con mayor kcat y menor Km estimados antes de ensayos de laboratorio, reduciendo el número de experimentos húmedos.
- Anotación de bases de datos enzimáticas: procesar lotes en Parquet de pares enzima-sustrato para enriquecer registros con parámetros cinéticos aproximados, con la salida en CSV lista para unir por ID.
- Análisis de vías metabólicas: estimar constantes cinéticas para modelos de flujo metabólico (FBA) cuando faltan datos experimentales, usando las predicciones en log10 como entradas de orden de magnitud.
- Comparación de sustratos para una misma enzima: ejecutar el pipeline con una secuencia fija y múltiples SMILES para identificar sustratos con Km predicho bajo y así orientar cribados.
- Docencia y prototipado en enzimología computacional: el modelo funciona en CPU con 16 GB de memoria y sin red, lo que permite desplegarlo en aulas o entornos aislados.
- Validación de pipelines internos: servir como referencia neural frente a V3 en experimentos controlados dentro del laboratorio, dado que el autor lo presenta explícitamente como comparación neural para uso interno.

## Benchmarks y rendimiento

| Validación | V3 Mean SCC | V5 Mean SCC | IC 95 % pareado de la ganancia |
|---|---:|---:|---|
| Primary seed43 | 0,607767567 | 0,613109662 | [+0,002121, +0,008901] |
| Predeclared seed48 | 0,593070812 | 0,599124571 | [+0,002668, +0,009365] |

No se han publicado resultados de benchmarks en la información disponible más allá de estas comparaciones locales de validación. El autor indica que no existe puntuación de leaderboard para V5, que la selección entre cinco pesos sobre la validación primaria introduce optimismo y que no se realizó evaluación sobre outer holdout. El MLP neural puro de Km fue peor que V3 en el split primario. La cifra externa de Mean SCC 0,523 reportada por el usuario para V3 es contexto externo; el objetivo de 0,53 no está verificado.

## Requisitos de hardware

- VRAM: no aplica; el modelo es CPU-only y no requiere GPU.
- GPU recomendadas: ninguna; el autor especifica ejecución exclusivamente en CPU.
- Memoria: el ejemplo Docker reserva 16 GB de RAM (`--memory 16g`) y dos CPUs (`--cpus 2`).
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,1 GB y el MLP de inferencia empaquetado pesa 4.340.726 bytes.
- Plataforma: Linux amd64 (imagen Docker construida con `--platform linux/amd64`).
- Despliegue: imagen Docker propia con `python /app/predict.py --input INPUT --output OUTPUT`; no se mencionan vLLM, llama.cpp, Ollama ni TGI porque no aplican a este tipo de modelo.
- Latencias: el ajuste total del MLP neural reportado es de 56,004 s en 36.970 filas; no se publica latencia de inferencia por muestra. El autor recomienda imponer externamente un timeout de 600 segundos.

## Comparativa con modelos similares

| Modelo | Tipo | Objetivos | Métrica reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v5 | ExtraTrees + blend MLP | kcat y Km | Mean SCC 0,6131 (seed43), 0,5991 (seed48) | MIT | Hugging Face, 0 descargas |
| V3 (predecesor del mismo autor) | ExtraTrees | kcat y Km | Mean SCC 0,6078 (seed43), 0,5931 (seed48) | No disponible | Referenciado en la model card; no se detalla repositorio |
| MLP neural puro de Km (interno) | MLP | Km | Peor que V3 en el split primario (sin cifra) | No disponible | Solo en registros de desarrollo |
| V4 | No disponible | No disponible | No se aportó puntuación para este experimento | No disponible | No disponible |

No se dispone de información sobre otros modelos comparables de predicción de kcat/Km en la documentación proporcionada.

## Limitaciones y advertencias

- No existe puntuación de leaderboard ni evaluación sobre outer holdout: el rendimiento reportado procede de validación interna con un solo modelo y una sola semilla de bootstrap.
- La ganancia frente a V3 es muy pequeña (SCC entre +0,002 y +0,009) y puede no ser robusta fuera de los splits evaluados.
- La selección entre cinco pesos sobre la validación primaria introduce optimismo; la confirmación usó el peso congelado una sola vez.
- La agrupación por secuencia exacta no equivale a separación por homología; los subgrupos de similitud usan coseno diagnóstico de tripletes, no identidad alineada.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero sí de predicciones fuera de rango para secuencias o sustratos alejados de la distribución de entrenamiento.
- Las predicciones se dan en log10 sin conversión a unidades físicas; el usuario debe aplicar la conversión adecuada.
- El modelo no procesa lenguaje natural, por lo que no hay soporte multilingüe ni sesgos lingüísticos que evaluar; los sesgos potenciales provendrían de la composición del dataset de entrenamiento, no detallada.
- La licencia MIT permite uso comercial, pero el autor advierte que la publicación, el envío y los cambios de nominación requieren revisión del usuario.
- Requiere respetar exactamente el esquema de entrada (`id,smiles,sequence`) y de salida (`id,log10_kcat,log10_km`); un ID duplicado o un orden distinto puede romper la integración.
- El autor indica que no hay garantía de calificación específica de arquitectura según el brief del proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v5
- Repositorio propuesto por el autor: VedaVachan/kcat-km-v5 (nombre de visualización propuesto: harsh-v5)
- No se han encontrado en la información proporcionada papers, blogs, repositorios adicionales ni demos.
