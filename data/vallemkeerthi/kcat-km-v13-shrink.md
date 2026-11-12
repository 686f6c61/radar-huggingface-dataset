# VallemKeerthi/kcat-km-v13-shrink

## Resumen

kcat–Km model v3 (Leak CURBER) es un modelo de predicción conjunta de parámetros cinéticos enzimáticos desarrollado por el usuario VallemKeerthi. Concretamente, estima `log10_kcat` y `log10_km` (constante catalítica y constante de Michaelis) a partir de un par formado por la estructura de un sustrato en formato SMILES y la secuencia de aminoácidos de una enzima. No se trata de un modelo de lenguaje generativo, sino de un ensemble de aprendizaje automático clásico que combina ExtraTrees, HistGradientBoosting y un regresor de vecinos más cercanos por kernel.

La relevancia del modelo radica en su enfoque de ingeniería de características: por el lado del sustrato emplea claves MACCS, conteos Morgan plegados y descriptores RDKit; por el lado de la enzima usa composición de aminoácidos y estados ocultos de ESM-2 (35M) promediados de tres capas, exportados a ONNX en int8 para inferencia en CPU y reducidos mediante PCA. El ensemble se mezcla con un kNN basado en similitud de Tanimoto (sustrato) y Jaccard de 3-meros (secuencia).

El repositorio ocupa 0,7 GB e incluye los pesos del modelo, el export ONNX de ESM-2, scripts de entrenamiento e inferencia, un Dockerfile y un fichero de dependencias bloqueadas. No se ha publicado información sobre licencia, idiomas, pipeline ni resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: ExtraTrees + HistGradientBoosting + kNN por kernel (no es una red neuronal generativa) |
| Parametros totales | no disponible (el componente ESM-2 35M aporta ~35M parametros; el resto son modelos de arboles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: SMILES + secuencia de enzima; no hay ventana de contexto) |
| Tipos de cuantizacion | ESM-2 exportado a ONNX en int8; el resto del pipeline opera en CPU sin cuantizacion adicional documentada |
| Idiomas soportados | no disponible (modelo cientifico, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | joblib (modelos de arboles y kNN) + ONNX (ESM-2 int8) |

## Arquitectura y entrenamiento

El modelo no es un transformer generativo sino un ensemble supervisado por objetivo (`log10_kcat` y `log10_km`). Las características del sustrato se construyen con claves MACCS, conteos Morgan plegados y descriptores RDKit. Las de la enzima combinan composición de aminoácidos con estados ocultos de ESM-2 (facebook/esm2_t12_35M_UR50D) promediados de tres capas, exportados a ONNX en int8 para ejecución en CPU y reducidos con PCA. Sobre esas características se entrenan ExtraTrees e HistGradientBoosting por target, y el resultado se mezcla con un regresor kNN por kernel que usa similitud de Tanimoto entre sustratos y Jaccard de 3-meros entre secuencias.

Los pesos de mezcla y los hiperparámetros del kNN se seleccionan mediante validación cruzada agrupada por clúster de secuencia, lo que evita fuga de información entre enzimas homólogas. El pipeline incorpora una salvaguarda de tiempo de reloj para la etapa ESM: cualquier entrada que no se logre embeber dentro del presupuesto cae a la media de embeddings del conjunto de entrenamiento, garantizando que la inferencia termine dentro del límite del evaluador. El repositorio incluye `train.py`, `export_onnx.py`, `predict.py`, `features.py`, `models.py`, `knn.py`, `clusters.py`, un Dockerfile y `requirements.lock.txt`.

## Capacidades

- Predicción conjunta de `log10_kcat` y `log10_km` para pares (SMILES, secuencia de enzima).
- Extracción de características de sustrato mediante MACCS, Morgan plegado y descriptores RDKit.
- Extracción de características de enzima mediante composición de aminoácidos y embeddings ESM-2 (35M) en ONNX int8.
- Mezcla de modelos de árboles con un kNN por similitud estructural y de secuencia.
- Inferencia en CPU con presupuesto de tiempo de reloj y fallback a embedding medio.
- No soporta tool calling, agentes, visión, audio ni generación de texto.
- No se documentan capacidades multilingües (no aplica).

## Casos de uso

- Priorización de enzimas candidatas en ingeniería de proteínas: dado un sustrato de interés y un conjunto de secuencias candidatas, el modelo estima `kcat` y `Km` para ordenar experimentalmente solo las más prometedoras, reduciendo el número de ensayos de laboratorio.
- Filtrado en diseño de rutas metabólicas: al evaluar enzimas para una ruta sintética, se pueden descartar combinaciones con constantes cinéticas incompatibles antes de la validación in vitro.
- Anotación de bases de datos enzimáticas: estimar parámetros cinéticos faltantes para entradas de SMILES y secuencia ya catalogadas, con la cautela de tratarse de predicciones y no de medidas.
- Análisis de sensibilidad sustrato-enzima: variar sistemáticamente el SMILES manteniendo la enzima para identificar regiones estructurales que afectan a `Km` o `kcat`.
- Detección de outliers en datasets experimentales: comparar la predicción con valores medidos para señalar posibles errores de anotación o condiciones atípicas.
- Integración en pipelines bioinformáticos en contenedor: el Dockerfile y el lock de dependencias permiten desplegar el modelo en entornos reproducibles con inferencia en CPU, sin necesidad de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Inferencia en CPU por diseño: la etapa ESM-2 se exporta a ONNX int8 y el resto del pipeline son árboles y kNN ejecutados en CPU.
- No requiere GPU; el repositorio no documenta uso de CUDA.
- VRAM estimada: no aplica (inferencia en CPU). El repositorio ocupa 0,7 GB en disco, incluyendo pesos y ONNX.
- Opciones de despliegue: ejecución directa con `predict.py` sobre el entorno fijado por `requirements.lock.txt`, o mediante el Dockerfile incluido.
- Latencia y throughput: no disponibles; el diseño impone un presupuesto de tiempo de reloj para la etapa ESM con fallback a embedding medio, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat–Km model v3 (Leak CURBER) | Ensemble (ExtraTrees + HistGradientBoosting + kNN) | SMILES + secuencia | log10_kcat, log10_km | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo científico de regresión; no es un modelo de lenguaje y no genera texto ni razona de forma general.
- Las predicciones son estimaciones estadísticas, no medidas experimentales; no deben sustituir la validación in vitro en decisiones críticas.
- El fallback a embedding medio ante desbordamiento del presupuesto de tiempo puede degradar la calidad de la predicción en entradas costosas de embeber, sin aviso explícito al usuario.
- Licencia no declarada: no se puede asumir uso comercial sin confirmación del autor.
- No se documentan sesgos, cobertura del espacio químico ni dominios de aplicabilidad; el rendimiento fuera de la distribución de entrenamiento es incierto.
- Dependencia de la versión concreta de ESM-2 (35M) y de las librerías fijadas en el lock; cambios de versión pueden alterar los resultados.
- Idiomas y pipeline no disponibles; el modelo no está pensado para tareas lingüísticas.

## Enlaces

- Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v13-shrink
- ESM-2 35M (dependencia): https://huggingface.co/facebook/esm2_t12_35M_UR50D
