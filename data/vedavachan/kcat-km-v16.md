# VedaVachan/kcat-km-v16

## Resumen

kcat-km-v16 es un modelo predictivo de parámetros cinéticos enzimáticos desarrollado por VedaVachan (Vangala Vedavachan Reddy). Su tarea es estimar `log10_kcat` y `log10_km` a partir de la secuencia de aminoácidos de una enzima y el SMILES de un sustrato, una tarea central en biología computacional y en el diseño de enzimas. El modelo combina un codificador de proteínas ESM2-35M truncado a 6 capas con un conjunto de features químicas derivadas de RDKit y un ensemble de modelos de árbol (LightGBM y ExtraTrees) más una pequeña MLP.

La relevancia del modelo está en su enfoque de ingeniería: es una entrada de una competición (probablemente asociada al entorno OpenKinetics) que prioriza el rendimiento en CPU, la reproducibilidad y la solidez frente a entradas de longitud variable. Incluye un guard de tiempo de ejecución que redirige la inferencia a una ruta alternativa más ligera (V15, basada en ESM2-8M) si la proyección de tiempo supera los 470 segundos.

El modelo no es un LLM ni un transformer generativo: es un pipeline de regresión supervisada con un encoder congelado. No soporta generación de texto, tool calling ni conversación. Su valor es específico para la predicción de cinética enzimática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de LightGBM + ExtraTrees (4 miembros) + MLP, sobre features de ESM2-35M (6 capas), RDKit, Morgan y MACCS |
| Parametros totales | no disponible (pesos de árboles y MLP; el encoder ESM2-35M es congelado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (secuencias de proteína de hasta 512 residuos, ventana first/last 256 si excede) |
| Tipos de cuantizacion | int8 dinámica en capas `nn.Linear` del encoder |
| Idiomas soportados | no aplica (entrada: secuencia de aminoácidos y SMILES) |
| Licencia | MIT |
| Formato de pesos | safetensors, joblib (árboles y MLP), pesos del encoder ESM2 congelados |

## Arquitectura y entrenamiento

El pipeline tiene cinco componentes. Primero, un encoder `facebook/esm2_t12_35M_UR50D` truncado a sus 6 primeras capas de transformer, sin layer norm final, con cuantización int8 dinámica de las capas lineales. Las secuencias de hasta 512 residuos se procesan completas; las más largas se ventanean a primeros/últimos 256 residuos. Se aplica mean pooling y std pooling, generando 480 + 480 dimensiones. Segundo, features clásicas de proteína, RDKit, Morgan y MACCS (2.745), más las 480 columnas mean-pooled del encoder, más 38 features supervisadas cruzadas (prior de sustrato, estadísticas de vecinos de enzima en espacio 35M-L6, estadísticas de sustratos similares). Tercero, cuatro miembros, cada uno 50% LightGBM por target y 50% ExtraTrees multi-output, con promedio equitativo; el miembro D_std añade las columnas de std pooling. Cuarto, una MLP (3 semillas) sobre 3.263 features, mezclada con peso 0,2: `predicción = 0,8 * media(miembros) + 0,2 * MLP`. Quinto, un guard de tiempo en `predict.py` que proyecta el coste end-to-end a partir de las primeras batches (modelo de coste por ventana ~ L + 0,0034 L², factor de seguridad 1,1) y, si supera 470 s, descarta el trabajo y ejecuta la ruta V15 completa (árboles V14 + MLP con ESM2-8M). Los modelos nunca se mezclan dentro de una ejecución; la ruta usada se registra en stderr.

El entrenamiento usó exclusivamente el release oficial `starkAhmed43/leak-curber-kcat-km`, revisión `a18f8d542c1849507ff1711b970b48b72a998c8c`, `train.parquet` con 42.524 filas (sha256 `f160db6f…1574`). No se usaron otras fuentes ni entradas públicas para ajustar nada. Las estadísticas de referencia se cross-fittearon dentro de cada partición de ajuste con folds disjuntos por clúster, de modo que ninguna fila de entrenamiento ve las etiquetas de su propio clúster. Las rondas de LightGBM se reseleccionaron dentro de cada partición (holdout de 1/8 por clúster, paciencia 150, tope 4000, refit con best*1,1+1).

## Capacidades

- Predicción de `log10_kcat` y `log10_km` para pares enzima-sustrato.
- Procesamiento de secuencias de proteína de hasta 512 residuos (ventaneo first/last 256 para las más largas).
- Procesamiento de sustratos vía SMILES con descriptores RDKit, Morgan y MACCS.
- Inferencia completamente offline, solo CPU, sin red, con todos los pesos locales.
- Ejecución por lotes desde Parquet a CSV con columnas exactas `id, smiles, sequence` de entrada y `id, log10_kcat, log10_km` de salida.
- Fallback automático a una ruta más ligera (V15, ESM2-8M) cuando la proyección de tiempo excede el presupuesto.
- No soporta tool calling, agentes, generación de texto, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Análisis de cinética enzimática a escala: dado un conjunto de pares enzima-sustrato en Parquet, el modelo devuelve predicciones de kcat y Km en CSV, útil para priorizar experimentos in vitro antes de medir en laboratorio.
- Filtrado en pipelines de diseño de enzimas: tras generar variantes con herramientas de diseño, el modelo puntúa rápidamente qué variantes probablemente mantienen o mejoran la actividad catalítica.
- Anotación de bases de datos metabólicas: estimar parámetros cinéticos faltantes para reacciones en modelos de redes metabólicas (por ejemplo, modelos a escala genómica) donde no hay medidas experimentales.
- Priorización en ingeniería de vías metabólicas: comparar sustratos candidatos para una enzima concreta y descartar combinaciones con Km desfavorable antes de construir la cepa.
- Evaluación comparativa de modelos: al ser un pipeline reproducible, offline y con licencia MIT, sirve como baseline en estudios de métodos de predicción de cinética enzimática.
- Despliegue en entornos con recursos limitados: la ruta de fallback con ESM2-8M y la cuantización int8 permiten ejecutarlo en CPU sin GPU, adecuado para servidores modestos o contenedores.
- Integración en flujos de bioinformática: la interfaz CLI `predict.py --input --output` encaja en pipelines de Snakemake o Nextflow sin dependencias de red.

## Benchmarks y rendimiento

Resultados locales medidos por el autor. Spearman SCC, con V14 entre paréntesis. Las particiones son locales y reutilizadas, no conjuntos de test independientes.

| split | kcat | Km | Mean | Ganancia emparejada Mean [IC 95%] |
|---|---|---|---|---|
| inner | 0,3926 (0,3901) | 0,6773 (0,6727) | 0,5350 (0,5314) | +0,0030 [−0,012, +0,019] |
| development | 0,4294 (0,4248) | 0,6470 (0,6445) | 0,5382 (0,5346) | +0,0021 [−0,010, +0,014] |
| confirmation | 0,5037 (0,4941) | 0,7119 (0,7036) | 0,6078 (0,5988) | +0,0078 [−0,002, +0,019] |

El autor indica que la puntuación oficial de V14 en el leaderboard es 0,5145 y que las particiones locales son más fáciles que el leaderboard porque las enzimas del leaderboard están más lejos de las de entrenamiento (medido con similitud de 3-mer; estimaciones locales ajustadas por desplazamiento ~0,49–0,56). No se reclama puntuación de leaderboard para V16. La mejora sobre V14 es pequeña y estadísticamente no resuelta: los intervalos de confianza pareados incluyen cero.

## Requisitos de hardware

- Inferencia solo CPU; no requiere GPU.
- VRAM estimada: no aplica (ejecución en CPU).
- Memoria RAM: el repo pesa 1,2 GB; se recomienda al menos 4–8 GB de RAM para cargar encoder, árboles y MLP.
- GPU recomendadas: no aplica; el pipeline no usa CUDA.
- Cabe en cualquier equipo consumer: portátil, contenedor o servidor sin acelerador.
- Despliegue: script `predict.py` con entrada/salida Parquet/CSV; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma absoluta; el guard proyecta el coste con un modelo por ventana ~ L + 0,0034 L² y un presupuesto de 470 s, tras el cual se usa la ruta V15 (más rápida). La ruta primaria es más lenta que la de V15.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-v16 (este) | Ensemble árboles + MLP con ESM2-35M-6L | no disponible | secuencias hasta 512 residuos | MIT | Hugging Face |
| kcat-km-v14 | Ensemble árboles con ESM2-35M-6L | no disponible | secuencias hasta 512 residuos | MIT (según repo del autor) | Hugging Face |
| kcat-km-v15 | Árboles V14 + MLP con ESM2-8M | no disponible | secuencias hasta 512 residuos | MIT (según repo del autor) | Hugging Face |
| Kinetic Predictor (OpenKinetics) | Modelos ML de predicción de kcat/Km | no disponible | no disponible | no disponible | Web (predictor.openkinetics.org) |

No se dispone de datos de benchmarks comparativos entre estos modelos más allá de los resultados locales V14/V16 reportados por el autor.

## Limitaciones y advertencias

- La cuantización int8 dinámica hace que un embedding dependa ligeramente de las otras secuencias del lote (coseno ≥ 0,9994); la predicción de una fila puede variar según el resto del fichero. Entradas idénticas dan salidas idénticas.
- La ruta primaria es más lenta que la de V15; en máquinas lentas el guard activa el fallback, con lo que la predicción efectiva puede ser la de V15.
- Generalización débil a enzimas novedosas y compuestos no vistos, especialmente para kcat.
- La MLP por sí sola es más débil que los árboles y detiene el entrenamiento en las épocas 1–3; solo aporta diversidad.
- Las predicciones pueden variar ligeramente entre plataformas CPU por diferencias de coma flotante que alteran decisiones de vecinos y umbrales de árbol; Linux amd64 es la referencia.
- Se almacenan estadísticas agregadas del target por enzima/sustrato exactos como estado del modelo (ver NOTICE.md), lo que puede implicar consideraciones de privacidad o de fuga de información si los datos de entrenamiento son sensibles.
- La mejora sobre V14 no es estadísticamente significativa según los intervalos pareados reportados.
- Licencia MIT para código y pesos, pero los encoders ESM2 subyacentes son de Meta con licencia MIT; conviene verificar los términos del dataset de entrenamiento `starkAhmed43/leak-curber-kcat-km` para uso comercial.
- No es un modelo de lenguaje: no admite prompts, instrucciones en lenguaje natural ni conversación.

## Enlaces

- Hugging Face: https://huggingface.co/VedaVachan/kcat-km-v16
- Perfil del autor: https://huggingface.co/VedaVachan/models
- Kinetic Predictor (OpenKinetics): https://predictor.openkinetics.org/
- Dataset de entrenamiento: https://huggingface.co/datasets/starkAhmed43/leak-curber-kcat-km
- Encoder primario: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- Encoder de fallback: https://huggingface.co/facebook/esm2_t6_8M_UR50D
