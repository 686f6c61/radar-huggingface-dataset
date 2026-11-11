# VallemKeerthi/kcat-km-v8-blend

## Resumen

kcat–Km v8 BLEND (tambien conocido como Leak CURBER) es un modelo de regresion supervisada publicado por el autor VallemKeerthi en Hugging Face. No se trata de un modelo de lenguaje generativo ni de una red neuronal profunda entrenada de extremo a extremo, sino de un ensemble de modelos tabulares de aprendizaje automatico clasico (ExtraTrees e HistGradientBoosting) que predice dos parametros enzimaticos: la constante catalitica (kcat) y la constante de Michaelis-Menten (Km). La salida se expresa en escala logaritmica (log10_kcat y log10_km).

El sistema combina caracteristicas derivadas de proteinas y sustratos: embeddings PCA192 de ESM-2 35M, composicion de aminoacidos, descriptores MACCS, Morgan y RDKit, ademas de caracteristicas cruzadas de bajo rango entre proteina y sustrato. ESM-2 35M se ejecuta en formato int8 ONNX una sola vez por entrada y se comparte entre los dos submodelos. El ensemble promedia con pesos iguales dos variantes (v6-A y v7 SIMPLEX), esta ultima con pesos seleccionados mediante predicciones out-of-fold agrupadas por cluster de proteina.

El modelo es relevante en el contexto de la prediccion de parametros enzimaticos para ingenieria de proteinas y biologia sintetica, donde estimar kcat y Km sin experimentos de laboratorio permite priorizar candidatos. Su interes tecnico reside en el enfasis explicito del autor en evitar fugas de datos (de ahi el subtitulo "Leak CURBER"): ambos submodelos se entrenaron unicamente con el `train.parquet` de una competicion, sin datos etiquetados externos, y la validacion usa agrupamiento por cluster de proteina. El repositorio ocupa 1,1 GB y la licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble tabular: ExtraTrees + HistGradientBoosting, con regresor kernel nearest-neighbour y caracteristicas de ESM-2 35M (int8 ONNX) |
| Parametros totales | no disponible (ensemble de modelos clasicos; el componente ESM-2 35M tiene aproximadamente 35 M de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa una fila proteina-sustrato por inferencia) |
| Tipos de cuantizacion | ESM-2 35M en int8 (ONNX); modelos tabulares en formato joblib sin cuantizacion adicional documentada |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | joblib y ONNX |

## Arquitectura y entrenamiento

La arquitectura no es un transformer unico sino un pipeline de extraccion de caracteristicas seguido de ensembles de arboles. La representacion de la proteina se obtiene ejecutando ESM-2 35M en int8 ONNX y reduciendo el embedding a 192 dimensiones mediante PCA. A esta representacion se suman la composicion de aminoacidos y descriptores moleculares del sustrato (MACCS, Morgan y RDKit). El submodelo v6-A combina ExtraTrees e HistGradientBoosting sobre ese conjunto y lo mezcla con un regresor kernel nearest-neighbour. El submodelo v7 SIMPLEX usa las mismas caracteristicas mas caracteristicas cruzadas de bajo rango entre proteina y sustrato, con pesos elegidos sobre predicciones out-of-fold agrupadas por cluster de proteina.

El entrenamiento se realizo exclusivamente con el `train.parquet` de la competicion, sin datos etiquetados externos segun la model card. La innovacion destacable no es arquitectonica sino metodologica: la seleccion de pesos y la validacion por agrupamiento de cluster de proteina buscan evitar fugas de informacion entre proteinas similares, problema frecuente en tareas de prediccion enzimatica. La inferencia es solo CPU y sin acceso a red, lo que facilita el despliegue reproducible.

## Capacidades

- Prediccion de log10_kcat y log10_km para pares proteina-sustrato.
- Extraccion de embeddings proteicos mediante ESM-2 35M en int8 ONNX, ejecutado una sola vez por entrada.
- Integracion de descriptores moleculares del sustrato (MACCS, Morgan, RDKit).
- Ensemble de modelos tabulares con blending por kernel nearest-neighbour.
- Ejecucion solo en CPU y sin dependencia de red.
- Interfaz de linea de comandos: `python /app/predict.py --input INPUT.parquet --output OUTPUT.csv`, que escribe `id,log10_kcat,log10_km`.
- No dispone de tool calling, function calling, agentes, razonamiento multi-step, vision, audio ni capacidades multilingues.

## Casos de uso

- Prediccion de kcat y Km a gran escala: dado un conjunto de pares proteina-sustrato en un parquet, el modelo genera estimaciones de log10_kcat y log10_km por lotes en CPU, permitiendo cribar miles de candidatos antes de validacion experimental.
- Ingenieria de proteinas: estimar el efecto de variantes de una enzima sobre kcat y Km para priorizar mutaciones antes de ensayos de laboratorio.
- Diseno de vias metabolicas: usar las estimaciones de constantes como parametros iniciales en modelos cineticos de vias, reduciendo el numero de medidas experimentales necesarias.
- Anotacion de bases de datos enzimaticas: completar registros con parametros cineticos estimados cuando no hay valores experimentales disponibles, marcandolos como predicciones.
- Filtrado previo a experimentos: descartar pares proteina-sustrato con kcat o Km estimados fuera de rangos de interes operativo, ahorrando coste de ensayos.
- Integracion en pipelines bioinformaticos reproducibles: al ejecutarse solo en CPU y sin red, puede desplegarse en entornos aislados o contenedores sin GPU para procesamiento por lotes.
- Investigacion sobre fugas de datos: la metodologia de validacion por cluster de proteina y el uso exclusivo de `train.parquet` sirven como referencia para disenar evaluaciones robustas en tareas de prediccion enzimatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia esta documentada como solo CPU.
- GPU recomendadas: no aplica (no se requiere GPU).
- Cabe en consumer GPU: no aplica; el diseno es CPU-only.
- CPU: no disponible la recomendacion concreta; el componente ESM-2 35M int8 ONNX y los ensembles tabulares son ligeros, pero no se especifica RAM ni nucleos requeridos.
- Opciones de despliegue: ejecucion directa del script `predict.py` sobre parquet; modelos tabulares en joblib y ESM-2 en ONNX int8.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (prediccion de kcat/Km con ensembles tabulares y embeddings ESM-2).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no procesa lenguaje natural; solo predice dos valores numericos por par proteina-sustrato.
- Entrenado exclusivamente con el `train.parquet` de una competicion; la generalizacion fuera de la distribucion de ese conjunto no esta documentada.
- Salidas en escala logaritmica (log10_kcat, log10_km); requieren conversion para interpretacion lineal.
- La model card no documenta metricas de error, intervalos de confianza ni rendimiento out-of-fold, por lo que la fiabilidad cuantitativa es desconocida.
- El repositorio registra 0 descargas y 0 likes en el momento de la informacion, sin pipeline declarado; madurez y mantenimiento no verificables.
- Idiomas y sesgos no disponibles; al no tratar texto, los sesgos relevantes serian de representatividad del dataset de entrenamiento (tipos de enzimas y sustratos cubiertos).
- Licencia MIT permite uso comercial, pero conviene verificar las licencias de las dependencias (ESM-2, RDKit) y las condiciones de la competicion de origen antes de produccion.
- No se especifican requisitos de RAM ni limites de tamano de lote; el procesamiento de entradas grandes puede requerir gestion de memoria no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VallemKeerthi/kcat-km-v8-blend
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
