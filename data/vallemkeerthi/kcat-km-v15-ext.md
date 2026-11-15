# VallemKeerthi/kcat-km-v15-ext

## Resumen

kcat-km-v15-ext (denominado internamente "Leak CURBER") es un modelo de prediccion conjunta de parametros cineticos enzimaticos: estima `log10_kcat` y `log10_km` para un par formado por un sustrato (codificado como SMILES) y una secuencia de enzima. No es un modelo de lenguaje ni una red neuronal entrenada de extremo a extremo, sino un ensemble de regresores clasicos (ExtraTrees y HistGradientBoosting) combinados con un regresor kNN basado en kernels, alimentados por caracteristicas quimicas del sustrato y representaciones proteicas derivadas de ESM-2.

El modelo lo publica el usuario VallemKeerthi en Hugging Face y esta orientado a tareas de biologia computacional y enzimologia, concretamente a la prediccion de constantes cineticas que normalmente requieren experimentacion de laboratorio. La innovacion principal es el uso de embeddings de ESM-2 (variante de 35M parametros, exportada a ONNX en int8 para inferencia en CPU) combinados con descriptores RDKit y fingerprints moleculares, junto con un esquema de validacion cruzada agrupada por cluster de secuencia para evitar fugas de datos.

El repositorio ocupa 0,8 GB e incluye pesos en formato joblib y ONNX, scripts de entrenamiento e inferencia, un Dockerfile y un fichero de dependencias bloqueadas. No se dispone de informacion sobre licencia, idiomas ni pipeline en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de ExtraTrees + HistGradientBoosting + regresor kNN sobre kernels (no es un transformer) |
| Parametros totales | no disponible (ensemble de arboles; el unico componente neuronal es ESM-2 de 35M usada como extractor de features) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: un SMILES y una secuencia proteica) |
| Tipos de cuantizacion | ESM-2 exportada a ONNX en int8; el resto son modelos de arboles en joblib |
| Idiomas soportados | no disponible (no aplica: modela secuencias de aminoacidos y moleculas) |
| Licencia | no disponible |
| Formato de pesos | joblib y ONNX |

## Arquitectura y entrenamiento

El modelo no sigue una arquitectura de transformer unica. La representacion del sustrato combina MACCS keys, Morgan counts plegados y descriptores de RDKit. La representacion de la enzima combina composicion de aminoacidos con estados ocultos de ESM-2 (35M parametros) promediados sobre tres capas y reducidos mediante PCA; ESM-2 se ejecuta en CPU como ONNX en int8. Sobre esas caracteristicas se entrenan, por cada objetivo (`log10_kcat` y `log10_km`), un ExtraTrees y un HistGradientBoosting que se mezclan con un regresor de vecinos mas cercanos basado en similitud (Tanimoto del sustrato y Jaccard de 3-mers de la secuencia).

Los pesos de mezcla y la configuracion del kNN se seleccionan mediante validacion cruzada agrupada por cluster de secuencia, lo que evita fugas entre proteinas similares. Para `log10_km` se anaden 23.182 filas de `km_mean` de CatPred-DB, eliminando las que caen sobre proteinas o pares secuencia-sustrato de validacion. El post-procesado mezcla el resultado con una receta entrenada sin ESM (peso 0,25) y aplica shrinkage intra-enzima. La etapa ESM tiene un presupuesto de tiempo de reloj: lo que no se embebe a tiempo cae a la media de entrenamiento, garantizando que la inferencia termine dentro del limite del evaluador.

## Capacidades

- Prediccion de `log10_kcat` para un par (SMILES, secuencia de enzima).
- Prediccion de `log10_km` para el mismo tipo de par.
- Extraccion de caracteristicas proteicas mediante ESM-2 (35M) en ONNX int8 sobre CPU.
- Extraccion de descriptores moleculares mediante RDKit, MACCS y Morgan.
- Inferencia robusta con fallback temporal: si la etapa ESM no termina dentro del presupuesto, usa la media de entrenamiento.
- No soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.
- No es un modelo generativo de texto.

## Casos de uso

- Priorizacion de candidatos enzimaticos en descubrimiento: dado un conjunto de enzimas y sustratos, el modelo estima `kcat` y `Km` para ordenar que combinaciones merecen validacion experimental, reduciendo el numero de ensayos de laboratorio.
- Ingenieria de proteinas: al evaluar variantes de una enzima frente a un sustrato fijo, las predicciones permiten descartar mutaciones con cinetica desfavorable antes de expresar y purificar.
- Anotacion de bases de datos metabolicas: rellenar huecos de `kcat`/`Km` en modelos de redes metabolicas donde faltan constantes medidas experimentalmente.
- Construccion de modelos cineticos a escala de genoma: alimentar pipelines de FBA (flux balance analysis) o modelos cineticos con estimaciones para enzimas sin datos.
- Filtrado en diseno de rutas biosinteticas: comprobar si una enzima candidata presenta una `kcat` suficiente para el flujo deseado en una ruta heterologa.
- Analisis de especificidad de sustrato: comparar predicciones de `Km` para distintos sustratos sobre la misma enzima y detectar preferencias.
- Benchmark interno de modelos de prediccion cinetica: usar el pipeline (features, CV agrupada por cluster, blending) como linea base reproducible.

## Benchmarks y rendimiento

La model card solo reporta un dato de validacion: en validacion cruzada agrupada por cluster, la adicion de los datos externos de CatPred-DB mejora la SCC (correlacion de Spearman) de `log10_km` en +0,021. No se publican valores absolutos de SCC, RMSE ni resultados de `kcat`, ni comparaciones con otros modelos.

| Metrica | Valor |
|---|---|
| SCC `log10_km` (CV agrupada por cluster) | no disponible (solo se reporta la mejora de +0,021 al anadir datos externos) |
| SCC `log10_kcat` | no disponible |
| RMSE / MAE | no disponible |

No se han publicado resultados de benchmarks completos en la informacion disponible.

## Requisitos de hardware

- Inferencia en CPU: ESM-2 (35M) se ejecuta como ONNX int8 en CPU; el resto son arboles en joblib, ligeros.
- VRAM: no requiere GPU; el modelo esta disenado para ejecutarse en CPU.
- GPU: no necesaria ni documentada.
- Cabe en cualquier maquina con CPU moderna y memoria suficiente para cargar los arboles (repo de 0,8 GB).
- Despliegue: `predict.py` como entrypoint, con `Dockerfile` y `requirements.lock.txt` incluidos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican).
- Latencia y throughput: no disponibles; la model card menciona un presupuesto de tiempo de reloj para la etapa ESM con fallback a la media de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v15-ext | Ensemble de arboles + ESM-2 35M | no disponible (ensemble) | no aplica | no disponible | Hugging Face |
| CatPred | Modelo de prediccion de parametros cineticos (referenciado en la model card como fuente de datos) | no disponible | no aplica | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparables en la informacion proporcionada; la unica referencia cruzada es CatPred-DB, usada como fuente de datos externos para `Km`.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- No se publican valores absolutos de rendimiento (SCC, RMSE) ni resultados de `kcat`; la unica metrica reportada es una mejora relativa de +0,021 en SCC de `Km`.
- El fallback temporal de la etapa ESM sustituye embeddings no calculados por la media de entrenamiento, lo que puede degradar la prediccion en lotes grandes sin aviso explicito.
- Dependencia de ESM-2 (35M) y de RDKit; cambios de version en estas dependencias pueden alterar las predicciones (por eso se incluye `requirements.lock.txt`).
- Los datos externos de CatPred-DB pueden introducir sesgos de distribucion hacia las proteinas y sustratos alli representados.
- Modelo de regresion tabular: no generaliza fuera del dominio quimico y proteico cubierto por el entrenamiento; extrapolar a familias enzimaticas no vistas es arriesgado.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural ni razonamiento; la entrada debe respetar el formato (SMILES, secuencia).
- Riesgo de sobreajuste a los clusters de secuencia presentes en entrenamiento pese a la CV agrupada.
- Sin informacion sobre sesgos quimicos o taxonomicos especificos.

## Enlaces

- Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v15-ext
- ESM-2 (dependencia): https://huggingface.co/facebook/esm2_t12_35M_UR50D
- CatPred-DB (fuente de datos externos para `Km`): no disponible en la informacion proporcionada
- Paper, blog o demo: no disponible en la informacion proporcionada
