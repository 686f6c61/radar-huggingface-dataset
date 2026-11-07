# VedaVachan/kcat-km-v18

## Resumen

kcat-km-v18 (identificador V18) es un modelo de predicción de parámetros cinéticos enzimáticos desarrollado por el usuario VedaVachan. No es un modelo de lenguaje: es un ensemble de árboles de decisión (LightGBM y ExtraTrees) que predice `log10_kcat` y `log10_km` a partir de la secuencia de una enzima y la estructura SMILES de su sustrato. Resuelve un problema clásico de biología computacional: estimar la constante catalítica (kcat) y la constante de Michaelis (Km) sin recurrir a experimentación de laboratorio.

El modelo parte de 3.065 características base que combinan composición proteica, descriptores químicos (Morgan, MACCS, RDKit) y un embedding medio congelado de ESM2-8M, a las que añade características derivadas del target mediante validación cruzada. Se entrena sobre la tabla de competición (42.524 filas) más una tabla externa de CatPred-DB (BRENDA + SABIO-RK), lo que el propio autor reconoce que invalida cualquier estimación de generalización libre de fuga en el leaderboard.

Su relevancia es doble: por un lado, demuestra una receta práctica de bajo coste (CPU, 2 hilos, inferencia offline) para cinética enzimática; por otro, es un caso ejemplar de transparencia sobre solapamiento de datos, ya que el autor documenta explícitamente que la tabla externa contiene etiquetas para el 58,1% de los pares de validación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de árboles: 3 miembros (A/B/C), cada uno promedia LightGBM por target y ExtraTrees (200 árboles) al 50/50 |
| Parámetros totales | no disponible (modelo de árboles, no red neuronal; tamaño de repo 1,0 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular: secuencia proteica + SMILES) |
| Tipos de cuantización | no aplica (árboles de decisión; no se cuantiza) |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | no disponible |
| Formato de pesos | joblib y safetensors (según tags del repo) |

## Arquitectura y entrenamiento

El modelo no es un transformer sino un ensemble supervisado de árboles. Cada uno de los tres miembros se entrena sobre 3.065 características base (composición de la proteína, descriptores químicos Morgan/MACCS/RDKit y el embedding medio congelado de ESM2-8M, revisión c731040fcd8d73dceaa04b0a8e6329b345b0f5df) más 12, 25 y 25 características derivadas del target obtenidas por validación cruzada. Cada miembro combina LightGBM (uno por target) y ExtraTrees (200 árboles) con media 50/50, y los tres miembros se promedian por igual.

Respecto a V14, la inclusión de filas externas con una sola etiqueta por par obligó a tres cambios: las estadísticas de referencia ignoran las etiquetas ausentes por target (verificado idéntico a V14 cuando no falta ninguna, diferencia absoluta máxima 0,0), se usa un ExtraTrees de salida única por target y miembro en lugar de un bosque de dos salidas, y las rondas de LightGBM se eligen por early stopping dentro de las filas de ajuste (holdout por clúster, paciencia 150, tope 4000, refit ×1,1) en lugar de los conteos fijados de V14. El codificador, las ventanas y el pooling no cambian; los embeddings de las nuevas secuencias externas se extrajeron con el mismo código.

## Capacidades

- Predicción de `log10_kcat` y `log10_km` para pares enzima-sustrato a partir de secuencia proteica y SMILES.
- Procesamiento por lotes mediante `predict.py --input in.parquet --output out.csv`, con columnas de entrada `id, smiles, sequence` y salida exacta `id,log10_kcat,log10_km`, una fila por ID y valores finitos.
- Codificación única de pares de entrada duplicados, sin caché de embeddings ni de predicciones específica por entrada.
- Inferencia offline y solo en CPU (2 hilos).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: es un modelo tabular de regresión, no generativo.

## Casos de uso

- Priorización de enzimas candidatas en ingeniería de proteínas: dado un panel de secuencias y un sustrato de interés, el modelo estima kcat y Km para ordenar variantes antes de ensayos de laboratorio, reduciendo el número de experimentos necesarios.
- Anotación de bases de datos enzimáticas: procesar lotes en formato parquet con `predict.py` permite rellenar huecos de kcat/Km en catálogos internos de forma offline y en CPU.
- Filtrado previo en pipelines de biología sintética: descartar combinaciones enzima-sustrato con Km predicho desfavorable antes de construir cepas o rutas metabólicas.
- Análisis de sensibilidad de sustratos: comparar el Km predicho para distintos SMILES sobre una misma enzima para guiar la elección de sustrato en ensayos.
- Docencia y prototipado en cinética computacional: el modelo corre en CPU con 2 hilos y sin dependencias de GPU, lo que facilita su uso en entornos docentes o de recursos limitados.
- Baseline interno para modelos más complejos: al ser un ensemble de árboles con features químicas y ESM2-8M, sirve como referencia de rendimiento frente a enfoques de deep learning como CatPred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta únicamente evidencia local interna, no verificable de forma independiente:

| Partición interna | Ganancia media de SCC emparejada vs V14 |
|---|---|
| Inner | +0,045 |
| Development | +0,039 |
| Confirmation | +0,062 |

El autor advierte que estas ganancias tampoco están libres de fuga (la tabla externa contiene homólogos cercanos y sustratos de las filas de consulta) y que no reclama ninguna puntuación de leaderboard.

## Requisitos de hardware

- Inferencia solo en CPU, con 2 hilos; no requiere GPU.
- VRAM estimada: no aplica (no hay inferencia en GPU).
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo de consumo: el coste dominante es la memoria para cargar los modelos joblib y el codificador ESM2-8M congelado, no el cómputo.
- Opciones de despliegue: script `predict.py` incluido en el repo, con entrada parquet y salida CSV; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de árboles).
- Latencia y throughput: no disponibles en la información proporcionada; la codificación de ESM2-8M por par es el paso más costoso.

## Comparativa con modelos similares

| Modelo | Tipo | Targets | Datos externos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v18 | Ensemble LightGBM + ExtraTrees con features ESM2-8M | kcat, Km | CatPred-DB (BRENDA + SABIO-RK) | no disponible | Hugging Face |
| CatPred (Boorla & Maranas, Nat Commun 2025) | Deep learning probabilístico | kcat, Km, Ki con cuantificación de incertidumbre | BRENDA + SABIO-RK (MIT / CC-BY-4.0) | MIT / CC-BY-4.0 (según la fuente externa citada) | Paper y framework publicado |
| V14 (versión previa del mismo autor) | Ensemble LightGBM + ExtraTrees | kcat, Km | Solo tabla de competición | no disponible | No referenciado como repo independiente |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Fuga de datos documentada: la tabla externa contiene etiquetas para 1.104 de los 1.901 pares de `val_inputs` (58,1%; 911 de kcat y 1.083 de Km), por lo que cualquier puntuación de leaderboard no es una estimación de generalización libre de fuga.
- Las tablas de referencia (prior de sustrato, vecinos de enzima y sustrato) también se construyen con datos externos, lo que amplía el solapamiento más allá de las etiquetas directas.
- Condiciones experimentales no modeladas: temperatura y pH no se incluyen como variables, pese a que los datos externos provienen de condiciones heterogéneas.
- Sesgo sistemático en kcat: los valores externos son máximos por par en la fuente, y los valores de la competición para los mismos pares difieren en +0,30 log10 de media (Spearman 0,80).
- El estado de referencia contiene etiquetas agregadas del entrenamiento (ver NOTICE.md), lo que puede introducir dependencias no evidentes entre predicciones.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Confirmación escrita del solapamiento con datos externos pendiente según el propio autor; el visto bueno del personal del curso se basa en la declaración del remitente.
- Sin métricas de benchmarks públicas ni validación independiente; 0 descargas y 0 likes en el momento de la consulta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v18
- Publicación sobre CatPred (LinkedIn, V. S. Boorla): https://www.linkedin.com/posts/vsboorla_catpred-a-comprehensive-framework-for-deep-activity-7302012512214872065-iaZg
