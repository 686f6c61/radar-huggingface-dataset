# VallemKeerthi/kcat-km-v7-simplex

## Resumen

kcat-km-v7-simplex es un paquete de inferencia y entrenamiento para la predicción conjunta de los parámetros cinéticos `kcat` y `Km` a partir de la secuencia de una enzima y la estructura SMILES de un sustrato. Lo publica el usuario VallemKeerthi en Hugging Face y no se trata de un modelo neuronal único, sino de un ensamblado determinista de cuatro regresores de árboles (dos ExtraTrees y dos HistGradientBoosting) combinados con pesos fijos bajo un esquema que el autor denomina SIMPLEX. El repositorio ocupa 0,7 GB e incluye pesos en formato joblib y un encoder ESM-2 de 35M parámetros cuantizado a INT8 en ONNX.

La relevancia del paquete es metodológica: documenta con detalle un pipeline completo de validación cruzada, verificación de equivalencia entre el código de entrenamiento y el de inferencia, y pruebas de reproducibilidad bit a bit. El autor reporta una mejora de correlación de Spearman (SCC) en validación cruzada de 0,5270 frente a 0,5198 de la línea base y 0,5255 de la variante con características cruzadas, con un intervalo de confianza de [+0,0036, +0,0113] y mejora en 5 de 5 folds. Es, por tanto, un artefacto orientado a un reto o leaderboard concreto (menciona "Leak CURBER" en repos similares) más que un modelo de propósito general.

No hay información publicada sobre licencia, idiomas ni pipeline en la model card, y el propio autor advierte que las pruebas se realizaron sobre datos sintéticos y que el entrenamiento con datos reales, la inferencia con ESM real, el build de Docker y los tiempos en 2 CPU / 600 s quedan pendientes de ejecución por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado de 4 regresores de árboles: ExtraTrees (base), HistGradientBoosting (base), ExtraTrees (cross), HistGradientBoosting (cross), combinados con pesos fijos SIMPLEX; encoder ESM-2 35M INT8 en ONNX para embeddings de proteína |
| Parametros totales | No disponible (el componente neuronal es ESM-2 35M; los regresores de árboles no se expresan en parámetros) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ESM-2 35M procesa secuencias de proteína; el límite concreto no se especifica) |
| Tipos de cuantizacion | INT8 para el encoder ESM-2 ONNX (`model_int8.onnx`); los regresores se serializan con joblib |
| Idiomas soportados | No disponible (la tarea es secuencia de proteína + SMILES, no texto natural) |
| Licencia | No disponible |
| Formato de pesos | joblib (regresores) y ONNX (encoder ESM-2 INT8); artefactos adicionales en `.npz` para caché de embeddings y predicciones OOF |

## Arquitectura y entrenamiento

El sistema combina dos representaciones de entrada. La rama `base` concatena una reducción PCA de 192 componentes sobre los embeddings ESM-2 35M INT8, 23 características de composición de aminoácidos y 687 descriptores moleculares (MACCS, Morgan y descriptores fisicoquímicos). La rama `cross` añade a `base` 272 características de interacción de bajo rango entre proteína y molécula. Sobre cada representación se entrenan dos regresores (ExtraTrees y HistGradientBoosting), y las cuatro predicciones se combinan con pesos fijos elegidos por el esquema SIMPLEX sobre las predicciones out-of-fold agrupadas.

El entrenamiento se organiza en `train_v7.py`, que primero valida que los folds OOF guardados coincidan con los reconstruidos a partir de los datos, después ajusta PCA y el codificador de proteína sobre todas las filas y entrena los ocho modelos (cuatro por cada uno de los dos objetivos, `log10_kcat` y `log10_km`). El script relee los modelos desde disco y vuelve a predecir 300 filas a través del código de `predict.py` para abortar si no se reproduce el resultado. La validación cruzada reportada usa 5 folds y un umbral de 0,03, con SCC de 0,5198 (base), 0,5255 (cross) y 0,5270 (SIMPLEX). No se documenta uso de RLHF, DPO ni ajuste fino neuronal; el pipeline es enteramente de aprendizaje supervisado clásico sobre características precalculadas.

## Capacidades

- Predicción conjunta de `log10(kcat)` y `log10(km)` a partir de secuencia de enzima y SMILES de sustrato.
- Extracción de embeddings de proteína mediante ESM-2 35M cuantizado a INT8 en ONNX, con fallback a la media de embeddings cuando una secuencia no se puede procesar.
- Feature engineering determinista: composición de aminoácidos, descriptores moleculares y características cruzadas de bajo rango.
- Inferencia en CPU exclusivamente, sin dependencia de torch ni de lightgbm en el entorno de inferencia fijado.
- Reproducibilidad bit a bit entre ejecuciones con las mismas entradas (verificada en el entorno de pruebas del autor).
- Invariancia al orden de las filas de entrada y preservación del esquema de salida (`id`, `log10_kcat`, `log10_km`).
- Despliegue autocontenido en Docker con versiones pinneadas en `requirements.lock.txt`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto.

## Casos de uso

- Priorización de enzimas en ingeniería de proteínas: dado un panel de variantes de secuencia y un sustrato objetivo, el modelo estima `kcat` y `Km` en CPU para ordenar candidatos antes de validación experimental, reduciendo el número de ensayos de laboratorio necesarios.
- Filtrado en pipelines de biología sintética: integrado como paso previo a la selección de rutas metabólicas, permite descartar combinaciones enzima-sustrato con constantes cinéticas desfavorables antes de simulaciones metabólicas más costosas.
- Anotación de bases de datos de enzimas: el paquete procesa lotes de pares secuencia-SMILES y escribe un CSV con el esquema fijo, adecuado para enriquecer registros con estimaciones de parámetros cinéticos.
- Reproducción de resultados de investigación: al incluir scripts de validación cruzada, comprobación de equivalencia entre entrenamiento e inferencia y comparación bit a bit, sirve para replicar el experimento del leaderboard y auditar la metodología.
- Despliegue en entornos sin GPU: al ejecutarse solo en CPU con un contenedor de 2 CPU y 16 GB de memoria, encaja en infraestructura de laboratorio modesta o en clústeres sin aceleradores.
- Docencia y formación en ML aplicado: el repositorio documenta un flujo completo de feature engineering, validación con OOF, selección de pesos de ensamblado y control de reproducibilidad, útil como caso de estudio de buenas prácticas.
- Baseline para experimentos comparativos: la mejora reportada de +0,0073 SCC con intervalo de confianza acotado permite usarlo como referencia contra la que medir modelos neuronales o de grafos.

## Benchmarks y rendimiento

Los únicos datos publicados son los de validación cruzada interna del autor (5 folds, umbral 0,03), expresados como correlación de Spearman (SCC):

| Configuracion | SCC (CV, 5 folds) | Delta frente a base |
|---|---|---|
| Base (PCA192 + composicion + descriptores) | 0,5198 | — |
| Cross (base + 272 caracteristicas de interaccion) | 0,5255 | +0,0057 |
| SIMPLEX (ensemble de 4 regresores) | 0,5270 | +0,0073 (IC [+0,0036, +0,0113], 5/5 folds) |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni métricas estándar de texto, ya que el modelo no realiza tareas de lenguaje. Tampoco se reportan métricas de leaderboard externo; el autor advierte explícitamente que la mejora "no está garantizado que se transfiera al leaderboard". Los tiempos de inferencia son estimaciones no medidas: el autor indica que v6-A tardó 291-312 s en su entorno y que v7 añade decenas de segundos tras la etapa ESM.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no se requiere GPU en ningún punto del pipeline.
- Contenedor de referencia: `--cpus 2 --memory 16g`, con un presupuesto de embedding por defecto que debe quedar por debajo de 600 s; si se superan ~520 s, el autor recomienda fijar `EMBED_BUDGET_S=400`.
- Memoria: el contenedor de prueba se ejecuta con 16 GB; los pesos de los cuatro ExtraTrees ocupan aproximadamente 300 MB cada uno (~1,3 GB en total), más el encoder ESM-2 35M INT8.
- Almacenamiento: repositorio de 0,7 GB; tras el entrenamiento final se generan artefactos adicionales en `weights/v7/`.
- Despliegue: Docker con `linux/amd64`, sin red en tiempo de ejecución (`--network none`), versiones pinneadas en `requirements.lock.txt`; no se usa vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Throughput y latencia: no medidos por el autor; las cifras de 291-312 s corresponden a la etapa ESM de la versión anterior en su entorno concreto.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VallemKeerthi/kcat-km-v7-simplex | Ensemble de arboles + ESM-2 35M INT8 | ESM-2 35M + 4 regresores | No disponible | SCC CV 0,5270 | No disponible | Hugging Face, 0 descargas |
| Danish-777/kcat-km-v7 | XGBoost sobre caracteristicas handcrafted + ESM-2 35M y 150M + red neuronal pequena | ESM-2 35M y 150M + XGBoost | No disponible | No disponible | No disponible | Hugging Face |
| aaarchitha7/kcat-km-model-v7 | Modelo de partida para el reto kcat-Km (entrenamiento local y subida a leaderboard) | No disponible | No disponible | No disponible | No disponible | Hugging Face |

Los tres modelos abordan la misma tarea (predicción conjunta de `kcat` y `Km`) y comparten el uso de ESM-2 como encoder de proteína, pero solo el modelo de VallemKeerthi publica métricas de validación cruzada con intervalos de confianza y pruebas de reproducibilidad detalladas. No se dispone de datos de benchmarks comunes que permitan una comparación directa de rendimiento entre ellos.

## Limitaciones y advertencias

- Licencia no especificada: no hay autorización explícita para uso comercial ni condiciones de redistribución; debe consultarse al autor antes de cualquier despliegue en producción.
- El autor advierte que la mejora de SCC (+0,0073) procede de validación cruzada interna y "no está garantizado que se transfiera al leaderboard"; la cifra OOF con los pesos elegidos se etiqueta como OPTIMISTIC.
- Las pruebas de verificación se ejecutaron sobre datos sintéticos (ESM con pesos aleatorios, 2.500 filas); el entrenamiento con datos reales, la inferencia con ESM real, el build de Docker y los tiempos en 2 CPU / 600 s no fueron ejecutados por el autor.
- Dependencia crítica de la caché de embeddings (`esm_train.npz`) y de los resultados de validación cruzada previos (`results_interact/`); sin ellos el entrenamiento aborta o produce resultados inconsistentes.
- El fallback a la media de embeddings cuando una secuencia no se procesa puede degradar silenciosamente la calidad de la predicción; el log debe revisarse para confirmar "0 fall back to the mean embedding".
- Riesgo de sobreajuste a la distribución del conjunto de entrenamiento (42.524 filas según la model card) y de extrapolación deficiente a enzimas o sustratos alejados de esa distribución.
- No apto para tareas de lenguaje natural, razonamiento, código ni generación de texto; su ámbito es estrictamente la predicción de parámetros cinéticos.
- Diferencias menores entre ejecuciones locales y en Docker pueden aparecer por variaciones de ONNX/BLAS entre CPUs; la reproducibilidad bit a bit solo está garantizada con el mismo hardware y las mismas versiones pinneadas.
- Sin métricas publicadas de sesgo, calibración o intervalos de predicción por instancia; las salidas son estimaciones puntuales en escala logarítmica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v7-simplex
- Modelo comparable Danish-777/kcat-km-v7: https://huggingface.co/Danish-777/kcat-km-v7
- Modelo comparable aaarchitha7/kcat-km-model-v7: https://huggingface.co/aaarchitha7/kcat-km-model-v7
