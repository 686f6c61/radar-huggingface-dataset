# VNVSH-DA24B034/aura

## Resumen

Aura (identificador de repositorio `VNVSH-DA24B034/aura`) es un modelo predictivo de parámetros cinéticos enzimáticos desarrollado por el usuario VNVSH-DA24B034. No se trata de un modelo de lenguaje generativo, sino de un sistema de regresión supervisada que predice `log10_kcat` y `log10_km` a partir de una secuencia de enzima y un sustrato representado como SMILES. El modelo se distribuye como un conjunto de artefactos de inferencia empaquetados con código Python, no como pesos de transformer.

La arquitectura combina dos regresores LightGBM independientes (uno por objetivo) alimentados con características derivadas de RDKit para el sustrato y características composicionales más, opcionalmente, embeddings de ESM-2 para la enzima. Esta aproximación híbrida entre quimioinformática clásica y embeddings proteicos preentrenados busca capturar tanto la estructura química del sustrato como el contexto evolutivo de la secuencia enzimática.

El modelo es relevante en el contexto de la predicción de parámetros cinéticos para ingeniería de proteínas y biología sintética, donde `kcat` y `Km` son determinantes para el diseño de rutas metabólicas y la optimización de biocatalizadores. Su licencia MIT y su empaquetado con Docker facilitan la reproducibilidad, aunque el repositorio presenta un tamaño de 2,1 GB y carece de métricas publicadas de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de regresores LightGBM (uno por objetivo) sobre características RDKit + composicionales + ESM-2 opcional |
| Parametros totales | no disponible (no es un modelo de parámetros neuronales; LightGBM con árboles) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija por secuencia + SMILES) |
| Tipos de cuantizacion | no disponible (no aplica a LightGBM) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | joblib (LightGBM) y safetensors (embeddings ESM-2 opcionales); código Python y Dockerfile |

## Arquitectura y entrenamiento

El modelo se compone de dos regresores LightGBM, cada uno entrenado para predecir `log10_kcat` y `log10_km` respectivamente. Las características de entrada se dividen en tres bloques. Para el sustrato se calculan 2048 bits de Morgan count (radio 2), 167 claves MACCS y aproximadamente 210 descriptores RDKit. Para la enzima se emplean longitud, hidropatía, grupos de aminoácidos, composición de aminoácidos y dipéptidos, y composición de cada tercio de la secuencia; la versión v2 añade embeddings ESM-2 con mean-pooling almacenados en `weights/esm/`. Adicionalmente se incorpora un prior de sustrato calculado como media, recuento, desviación típica, máximo, mínimo y mediana de las etiquetas de entrenamiento de cada sustrato, usando valores out-of-fold para evitar fuga de información.

La validación se realizó mediante validación cruzada de 5 folds agrupada por clústeres de enzimas (similitud coseno de 3-mers > 0,3), lo que aproxima el escenario de enzima no vista del leaderboard. No se especifica el número de tokens ni el volumen del dataset de entrenamiento (`train.parquet`), ni se documenta el uso de RLHF/DPO, dado que no es un modelo generativo. La innovación técnica principal es la combinación de un prior de sustrato con control de fuga y la integración opcional de embeddings ESM-2 junto a descriptores clásicos.

## Capacidades

- Predicción de `log10_kcat` para pares enzima-sustrato.
- Predicción de `log10_km` para pares enzima-sustrato.
- Procesamiento de secuencias de enzimas en formato texto (aminoácidos).
- Procesamiento de sustratos en formato SMILES mediante RDKit.
- Uso de embeddings ESM-2 opcionales (versión v2) para mejorar la representación enzimática.
- Inferencia por lotes mediante entrada Parquet y salida CSV (`predict.py --input X.parquet --output Y.csv`).
- Reentrenamiento reproducible a partir de `train.parquet` mediante `train.py`.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Ingeniería de enzimas: estimar `kcat` y `Km` de variantes mutantes antes de ensayos húmedos, priorizando candidatos con mejor eficiencia catalítica. El modelo es adecuado porque ingiere la secuencia directamente y devuelve predicciones numéricas de los dos parámetros.
- Diseño de rutas metabólicas: evaluar la cinética de enzimas candidatas con distintos sustratos para descartar combinaciones con `Km` desfavorable o `kcat` insuficiente. El prior de sustrato ayuda cuando el compuesto tiene etiquetas históricas.
- Anotación de bases de datos enzimáticas: completar campos de `kcat` y `Km` ausentes en registros con secuencia y SMILES conocidos, usando inferencia por lotes vía Parquet.
- Detección de valores atípicos: comparar predicciones del modelo con mediciones experimentales para señalar entradas posiblemente erróneas en un dataset.
- Filtrado previo en cribado virtual: reducir el espacio de pares enzima-sustrato antes de simulaciones de docking o ensayos experimentales, aprovechando el bajo coste computacional de LightGBM.
- Reproducción de experimentos: reentrenar `weights/` desde `train.parquet` con `train.py` para adaptar el modelo a un nuevo conjunto de etiquetas manteniendo la misma metodología de validación agrupada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona validación cruzada de 5 folds agrupada por clústeres de enzimas, pero no reporta valores numéricos de MAE, RMSE, R² ni comparaciones con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido de GPU para el modelo principal; LightGBM opera en CPU. Los embeddings ESM-2 opcionales (v2) requieren memoria para el modelo ESM-2 cargado, cuyo tamaño concreto no se especifica en la información disponible.
- GPU recomendadas: no disponibles; el flujo principal es CPU. Para la variante con ESM-2, cualquier GPU con memoria suficiente para el checkpoint ESM-2 empleado, no detallado.
- Cabe en consumer GPU: el modelo LightGBM sí; la variante ESM-2 depende del checkpoint, no especificado.
- Opciones de despliegue: ejecución directa con Python (`predict.py`), contenedores Docker (`Dockerfile` para v1 sin ESM, `Dockerfile.esm` para v2). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles. El repositorio ocupa 2,1 GB, lo que sugiere que la mayor parte del tamaño corresponde a artefactos auxiliares y posiblemente a los embeddings ESM-2.

## Comparativa con modelos similares

| Modelo | Tipo | Objetivo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aura (VNVSH-DA24B034) | LightGBM + RDKit + ESM-2 opcional | `log10_kcat`, `log10_km` | no aplica | MIT | Hugging Face |
| Alternativas comparables | no disponible en la información proporcionada | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación facilitada; no se han identificado alternativas concretas con las que contrastar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier uso fuera de la predicción de `kcat` y `Km` es inadecuado.
- El repositorio no reporta métricas de rendimiento (MAE, RMSE, R²), lo que impide evaluar su precisión real antes de desplegarlo.
- El prior de sustrato depende de etiquetas históricas; para sustratos nuevos sin cobertura en el conjunto de entrenamiento, la predicción puede degradarse.
- La validación se limita a clústeres de enzimas con similitud de 3-mers > 0,3; el comportamiento en enzimas muy alejadas del conjunto de entrenamiento no está documentado.
- No se especifican sesgos conocidos ni composición del dataset de entrenamiento (`train.parquet`), lo que limita la auditoría de posibles sesgos hacia familias enzimáticas o tipos de sustrato sobrerrepresentados.
- Riesgo de extrapolación: las predicciones de `log10_kcat` y `log10_km` fuera del rango observado en entrenamiento no están acotadas ni calibradas según la información disponible.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene revisar los términos exactos del repositorio.
- El tamaño del repositorio (2,1 GB) y la presencia de artefactos `joblib` y `safetensors` requieren verificar la integridad de los pesos antes de usarlos en producción.
- No se documentan los idiomas soportados porque no aplica; la entrada es secuencia de aminoácidos y SMILES, no texto natural.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/VNVSH-DA24B034/aura
- No se han encontrado en la búsqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
