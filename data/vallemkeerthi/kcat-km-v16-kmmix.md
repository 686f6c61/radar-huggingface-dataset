# VallemKeerthi/kcat-km-v16-kmmix

## Resumen

kcat–Km model v16-kmmix (denominado "Leak CURBER" por su autor) es un modelo de prediccion conjunta de parametros cineticos enzimaticos: estima `log10_kcat` y `log10_km` para un par formado por un sustrato (codificado como SMILES) y una secuencia de enzima. No es un modelo de lenguaje ni una red neuronal de gran escala entrenada de extremo a extremo, sino un ensemble de aprendices tabulares (ExtraTrees e HistGradientBoosting) combinados con un regresor de vecinos mas cercanos por kernel, alimentados por descriptores quimicos y embeddings proteicos.

Lo desarrolla el usuario VallemKeerthi y se publica en Hugging Face bajo el identificador `VallemKeerthi/kcat-km-v16-kmmix`. La version v16 anade un paso de post-procesado sobre v15: mezcla un 10 % de la prediccion de Km dentro de la prediccion de kcat, aprovechando la correlacion entre ambas etiquetas. El modelo declara una mejora en validacion cruzada libre de fuga (leak-free CV) de +0,0076 para kcat y +0,021 para Km (SCC), y esta empaquetado con pesos en formato joblib y un export ONNX de ESM-2 para la fase de embeddings.

Su relevancia es de nicho: resulta util para investigadores en biocatalisis y enzimologia que necesiten estimar parametros cineticos de forma rapida sin recurrir a simulaciones o ensayos de laboratorio, y como referencia de buenas practicas en prevencion de fuga de datos (agrupacion por cluster de secuencia en la validacion). El repositorio ocupa 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble tabular: ExtraTrees + HistGradientBoosting + regresor kNN por kernel, sobre descriptores de sustrato y embeddings ESM-2 de enzima |
| Parametros totales | no disponible (ensemble de arboles; no se publica recuento de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de secuencia generativo; entrada = SMILES + secuencia proteica) |
| Tipos de cuantizacion | no disponible (los embeddings ESM-2 se exportan a ONNX en int8) |
| Idiomas soportados | no aplica (modelo cientifico; entradas SMILES y secuencias de aminoacidos) |
| Licencia | no disponible |
| Formato de pesos | joblib (modelos) + ONNX (ESM-2 35M en int8) |

## Arquitectura y entrenamiento

El pipeline tiene dos ramas de features. Para el sustrato se calculan claves MACCS, Morgan counts plegados y descriptores RDKit. Para la enzima se combinan la composicion de aminoacidos con los estados ocultos de ESM-2 (35M, `facebook/esm2_t12_35M_UR50D`) promediados (mean-pooling) sobre tres capas, extraidos via ONNX en int8 sobre CPU y reducidos con PCA. Sobre esas features se entrena, por cada objetivo (kcat y Km), un ExtraTrees y un HistGradientBoosting, que se mezclan con un regresor de vecinos mas cercanos por kernel usando similitud de Tanimoto (sustrato) y Jaccard de 3-meros (secuencia). Los pesos del blend y los hiperparametros del kNN se eligen mediante validacion cruzada agrupada por cluster de secuencia, lo que evita fuga entre proteinas relacionadas.

Para Km se incorporan datos externos: 23.182 filas de `km_mean` de CatPred-DB, eliminando las que caen en proteinas o pares secuencia-sustrato de validacion y conservando la etiqueta de competicion cuando el par ya existe en `train.parquet` (ver `build_v15.py`). El post-procesado mezcla el blend con la misma receta entrenada sin ESM (peso 0,25) y aplica shrinkage intra-enzima. Como salvaguarda de latencia, la etapa ESM tiene un presupuesto de tiempo de reloj: cualquier entrada no embebida a tiempo cae al embedding de media de entrenamiento, garantizando que la inferencia termina dentro del limite del evaluador.

## Capacidades

- Prediccion de `log10_kcat` y `log10_km` para un par (SMILES, secuencia de enzima).
- Prediccion conjunta con acoplamiento parcial entre objetivos (10 % de Km inyectado en kcat en v16).
- Extraccion de embeddings proteicos con ESM-2 35M en ONNX int8 sobre CPU.
- Feature engineering quimico automatico (MACCS, Morgan, RDKit).
- Regresion por similitud (kNN sobre Tanimoto y Jaccard de 3-meros) como componente del ensemble.
- Fallback determinista por presupuesto de tiempo para garantizar finalizacion de la inferencia.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Priorizacion de experimentos en enzimologia: estimar kcat y Km de candidatos (SMILES + secuencia) antes de disenar ensayos, reduciendo el numero de medidas experimentales necesarias.
- Ingenieria de proteinas: cribar variantes de secuencia de una enzima frente a un sustrato de interes y ordenar por kcat estimado para seleccionar mutantes a caracterizar.
- Anotacion de bases de datos enzimaticas: rellenar valores ausentes de kcat/Km en registros con secuencia y sustrato conocidos, marcando las predicciones como estimaciones.
- Filtrado en discovery de biocatalizadores: descartar combinaciones enzima-sustrato con Km predicho desfavorable antes de invertir en produccion o purificacion.
- Analisis de sensibilidad sustrato-enzima: usar el componente kNN (Tanimoto/Jaccard) para identificar proteinas y sustratos de referencia proximos a una consulta nueva.
- Referencia metodologica en ML aplicado: reutilizar el esquema de validacion cruzada agrupada por cluster de secuencia y el control de fuga con datos externos (CatPred-DB) en proyectos propios.
- Despliegue en pipelines de laboratorio: integracion como paso batch en CPU (ONNX int8 + joblib) sin requerir GPU, con cota de tiempo garantizada por el fallback de la etapa ESM.

## Benchmarks y rendimiento

El autor reporta exclusivamente metricas de validacion cruzada libre de fuga (leak-free CV) para la version v16 respecto a v15:

| Metrica | Objetivo | Delta v16 vs v15 |
|---|---|---|
| SCC (leak-free cluster CV) | kcat | +0,0076 |
| SCC (leak-free cluster CV) | Km | +0,021 |

No se han publicado resultados absolutos (MMLU, HumanEval, GSM8K u otras metricas) ni valores de SCC/RMSE absolutos en la informacion disponible. No se han publicado comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: el propio autor indica que la etapa ESM-2 se ejecuta en ONNX int8 sobre CPU; no se requiere GPU.
- VRAM estimada: no aplica para el ensemble tabular; ESM-2 35M en int8 ocupa del orden de decenas de MB, aunque el valor exacto no esta disponible.
- GPU recomendadas: ninguna imprescindible; cualquier GPU con soporte ONNX Runtime podria acelerar la extraccion de embeddings, pero no se documenta.
- Cabe en hardware consumer: si, al ejecutarse en CPU; no se especifican requisitos minimos de RAM (el repo pesa 0,8 GB).
- Opciones de despliegue: script `predict.py` como entrypoint, contenedor Docker incluido (`Dockerfile`) y `requirements.lock.txt` para reproducibilidad; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles; existe un presupuesto de tiempo de reloj en la etapa ESM tras el cual se usa el embedding medio de entrenamiento.

## Comparativa con modelos similares

| Modelo | Enfoque | Objetivos | Datos externos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km v16-kmmix | Ensemble tabular + ESM-2 35M + kNN | kcat, Km | CatPred-DB (Km) | no disponible | Hugging Face (0 descargas) |
| CatPred | Prediccion de parametros cineticos (referenciado como fuente de datos) | kcat, Km, Ki | no disponible en esta ficha | no disponible | no disponible |
| Alternativas genericas de regresion enzimatica | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de nicho sin descargas ni likes: no hay evidencia de validacion independiente por terceros.
- Licencia no especificada: no se puede confirmar el uso comercial; debe contactarse con el autor antes de integrarlo en produccion.
- Ambito restringido a kcat y Km de pares enzima-sustrato; no predice otros parametros (Ki, kcat/Km, estabilidad) ni acepta entradas fuera de SMILES y secuencia proteica.
- Dependencia de ESM-2 35M: si la etapa de embeddings agota el presupuesto de tiempo, se sustituye por la media de entrenamiento, lo que degrada la prediccion de forma no advertida al usuario.
- Riesgo de extrapolacion: al ser un ensemble con kNN sobre similitud, las consultas alejadas de la distribucion de entrenamiento (Tanimoto/Jaccard bajos) producen estimaciones poco fiables.
- Los datos externos de CatPred-DB amplian cobertura de Km pero introducen posible sesgo hacia la distribucion de esa base de datos.
- No se documentan sesgos eticos ni de dominio; el riesgo principal es el uso de predicciones como sustituto de medidas experimentales sin validacion.
- Sin model card con limitaciones formales, sin paper asociado y sin metricas absolutas publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v16-kmmix
- ESM-2 35M (dependencia): https://huggingface.co/facebook/esm2_t12_35M_UR50D
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
