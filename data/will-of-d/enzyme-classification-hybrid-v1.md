# Will-of-D/enzyme-classification-hybrid-v1

## Resumen

`Will-of-D/enzyme-classification-hybrid-v1` no es un modelo de lenguaje generativo, sino un clasificador de números EC (Enzyme Commission) para secuencias proteicas, publicado como solución a la tarea Leak CURBER Enzyme Classification. El repositorio (0,7 GB) contiene exclusivamente los artefactos necesarios para inferencia offline sobre CPU: un índice de búsqueda `sequence_index.npz` y los pesos de un clasificador neuronal exportados a NumPy. El autor es Will-of-D y el modelo no declara licencia, idiomas ni pipeline en la tarjeta de HuggingFace.

El sistema es híbrido. Por un lado, dos búsquedas TF-IDF independientes sobre 2-mers y 3-mers de aminoácidos recuperan 100 candidatos cada una; el conjunto se reordena con la similitud de secuencia normalizada de RapidFuzz y los cinco vecinos más próximos votan, repartiendo el peso de forma fraccionaria entre las etiquetas de vecinos con anotación múltiple. Por otro, un clasificador neuronal de tipo *embedding bag* sobre 3-mers actúa como respaldo cuando la similitud coseno del vecino más cercano cae por debajo de 0,14.

Su relevancia práctica es acotada pero clara: permite anotar enzimáticamente lotes de secuencias en un contenedor Docker sin red, con 2 vCPU y 16 GB de RAM, a un ritmo medido de 11.367 predicciones en 48,3 segundos. No hay resultados oficiales de leaderboard ni validación externa: cero descargas y cero *likes* en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrido: recuperación por similitud TF-IDF sobre 2-mers y 3-mers de aminoácidos + reordenación RapidFuzz + voto de 5 vecinos; clasificador neuronal *embedding bag* de 3-mers como respaldo |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es una secuencia proteica; no se documenta longitud máxima admitida |
| Tipos de cuantización | no disponible; los pesos se distribuyen ya exportados a NumPy para inferencia en CPU (no requiere PyTorch) |
| Idiomas soportados | no aplica (entrada de aminoácidos); la documentación está en inglés |
| Licencia | no disponible para los pesos; el vocabulario EC deriva de ExPASy ENZYME 02-Sep-2026 (SIB), CC BY 4.0 |
| Formato de pesos | `.npz` (índice `sequence_index.npz`), artefactos `joblib` y arrays NumPy; sin safetensors ni GGUF |
| Tamaño del repositorio | 0,7 GB (≈710 MB) |
| Entrada | Parquet con columnas `id` y `sequence` |
| Salida | JSON Lines con exactamente `id` y `prediction` (una única EC del vocabulario) |
| Dependencias de ejecución | Python + NumPy, RapidFuzz y joblib (ruedas Linux x86-64 fijadas); sin PyTorch ni acceso a red |
| Vocabulario de salida | Números EC del vocabulario del *starter*; solo se emite la primera EC predicha, porque solo esa se evalúa |

## Arquitectura y entrenamiento

La primera rama es un recuperador léxico. Se construyen dos espacios TF-IDF, uno sobre 2-mers y otro sobre 3-mers de la secuencia aminoacídica, y cada uno devuelve 100 candidatos; la unión se reordena con la similitud de secuencia normalizada de RapidFuzz. Los cinco vecinos más próximos votan y cada etiqueta de un vecino con anotación múltiple recibe el mismo peso fraccionario. El índice `sequence_index.npz` es una versión compacta derivada de las secuencias públicas únicas de entrenamiento; los Parquet originales y los identificadores de origen no se incluyen en el repositorio por tamaño.

La segunda rama es un clasificador neuronal de bolsa de *embeddings* de 3-mers, entrenado originalmente en PyTorch y exportado a NumPy para inferencia rápida en CPU. Solo se invoca cuando la similitud coseno del vecino 3-mer más cercano es inferior a 0,14, umbral fijado de forma conservadora a partir de dos pruebas de estrés que retiraron parientes cercanos de los conjuntos de entrenamiento. El entrenamiento usa únicamente `train.parquet` público; las secuencias no se normalizan y las duplicadas se agrupan por secuencia exacta siguiendo la regla del *starter*. Los ajustes de recuperación se seleccionaron con dos particiones de validación agrupadas por secuencia exacta. Los *scripts* de partición, métrica, entrenamiento y exportación están en `training/`, excluido del contexto de build de Docker.

## Capacidades

- Predicción de un número EC completamente especificado (cuatro niveles) por secuencia proteica única.
- Recuperación de candidatos por similitud sobre k-mers de aminoácidos (2-mers y 3-mers) con reordenación por similitud de secuencia.
- Votación ponderada fraccionariamente cuando los vecinos recuperados tienen más de una anotación EC.
- Conmutación automática a clasificador neuronal cuando la evidencia de recuperación es débil (coseno 3-mer < 0,14).
- Inferencia por lotes sobre ficheros Parquet, con salida JSON Lines de tamaño controlado (0,51 MB para 11.367 predicciones).
- Agrupación de secuencias duplicadas: se conserva el primer `id` y se descarta el resto de la salida.
- Ejecución completamente offline en CPU, sin PyTorch y sin acceso a red, dentro de una imagen Docker Linux x86-64.
- No soporta *tool calling*, agentes, razonamiento multietapa, visión, audio, ni generación de texto libre: no es un modelo de lenguaje.

## Casos de uso

- **Anotación funcional a escala de metagenomas y proteomas**: el modelo procesa lotes Parquet completos a unas 235 predicciones por segundo con dos hilos de CPU, lo que permite etiquetar decenas de miles de secuencias en minutos sin consumir GPU.
- **Pre-filtro en pipelines de anotación enzimática**: usar la EC predicha como hipótesis inicial antes de confirmar con búsquedas de similitud más costosas (BLASTp, DIAMOND) o con validación experimental, reservando el cómputo caro para los casos dudosos.
- **Enriquecimiento de catálogos internos de enzimas**: asignar EC a proteínas de bases de datos propietarias que carecen de anotación, manteniendo todo el procesamiento en local.
- **Despliegue en entornos air-gapped o regulados**: laboratorios, hospitales o instalaciones de bioseguridad donde no se permite salida a internet; la imagen se construye y ejecuta con `--network none` sobre 2 vCPU y 16 GB de RAM.
- **Reproducibilidad y docencia en bioinformática**: el repositorio incluye `training/` con las particiones, métricas y *scripts* de exportación, lo que permite reproducir los resultados locales en un curso o revisión interna.
- **Línea base para investigación de métodos de anotación**: sirve como referencia CPU de coste casi nulo contra la que medir clasificadores de *deep learning* o modelos proteicos de lenguaje en el mismo conjunto de validación.
- **Cribado de librerías de secuencias sintéticas o diseñadas**: asignar EC tentativa a variantes generadas en *screening* computacional antes de decidir qué candidatos se expresan y caracterizan en laboratorio.

## Benchmarks y rendimiento

Métricas locales declaradas por el autor (precisión L4, es decir, coincidencia en los cuatro niveles del número EC). No son resultados oficiales del leaderboard.

| Partición local | Entradas únicas retenidas | Recuperación L4 | Neuronal L4 | Combinado L4 |
|---|---:|---:|---:|---:|
| Semilla 20261026 | 18.877 | 0,8932 | 0,8454 | 0,8961 |
| Semilla 20261027 | 18.464 | 0,8930 | 0,8391 | 0,8943 |
| Estrés con secuencias distantes A | 2.000 | 0,7334 | 0,5966 | 0,7409 |
| Estrés con secuencias distantes B | 2.000 | 0,7368 | 0,6003 | 0,7458 |

Rendimiento de inferencia declarado: 11.367 líneas JSON válidas generadas en 48,3 segundos con dos hilos de CPU sobre las entradas de validación públicas, con un fichero de salida de 0,51 MB.

Advertencia del propio autor: las particiones aleatorias contienen muchas secuencias distantes entre sí, por lo que sus puntuaciones son optimistas; las pruebas de estrés usaron un conjunto de entrenamiento menor al eliminar parientes cercanos, de modo que tampoco estiman directamente el resultado del leaderboard privado. No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM**: no aplica; el modelo no usa GPU. Consumo de memoria del sistema acotado por el límite del evaluador: 16 GB de RAM.
- **CPU**: 2 vCPU son suficientes según la configuración de referencia; el rendimiento escala con hilos, aunque no se documenta el escalado más allá de dos.
- **GPU recomendadas**: ninguna. No hay soporte CUDA ni ruta de inferencia acelerada; A100, H100 o RTX 4090 no aportan ventaja.
- **Cabe en hardware de consumo**: sí, en cualquier portátil o mini-PC x86-64 con 16 GB de RAM; el repositorio ocupa ≈710 MB.
- **Opciones de despliegue**: Docker (`docker build --platform linux/amd64`) y ejecución directa con Python (`python /app/predict.py --input ... --output ...`). vLLM, llama.cpp, Ollama y TGI no son aplicables.
- **Latencia y throughput**: ≈235 predicciones por segundo con dos hilos (11.367 en 48,3 s). El evaluador impone un límite de 10 minutos sin red, 4 GiB de repositorio y 16 MiB de salida; el modelo queda muy por debajo de esos topes.
- **Nota operativa**: el autor indica que la construcción y ejecución reales de la imagen Docker en Linux todavía deben verificarse en una máquina con Docker.

## Comparativa con modelos similares

No se han proporcionado métricas de los alternativas, por lo que las celdas de rendimiento quedan como "no disponible". La comparación es cualitativa.

| Enfoque | Tipo | Requiere GPU | Entrenamiento | Licencia | Métricas comparables |
|---|---|---|---|---|---|
| Este modelo (híbrido TF-IDF + *embedding bag*) | Recuperación léxica + clasificador neuronal ligero | No | Solo `train.parquet` público | no disponible | L4 combinado 0,7409–0,8961 según partición |
| Transferencia por similitud (BLASTp / DIAMOND + EC del mejor hit) | Alineamiento local | No | No requiere | Según herramienta | no disponible |
| CLEAN | Aprendizaje profundo con aprendizaje contrastivo | Sí (recomendado) | Requiere corpus anotado | no disponible en esta ficha | no disponible |
| DeepECtransformer | Red neuronal con transformer | Sí (recomendado) | Requiere corpus anotado | no disponible en esta ficha | no disponible |

No se dispone de datos verificados para establecer una comparación cuantitativa con estas alternativas; cualquier cifra añadida aquí sería inventada.

## Limitaciones y advertencias

- **Cobertura cerrada del vocabulario**: solo puede predecir EC presentes en las etiquetas públicas de entrenamiento. El vocabulario fijado incluye EC adicionales que no se observaron durante el entrenamiento, por lo que esas clases son inalcanzables en la práctica.
- **Degradación con secuencias distantes**: la precisión L4 cae de ≈0,89 en particiones aleatorias a ≈0,74 en las pruebas de estrés con parientes cercanos eliminados. Para proteínas sin homólogos claros en el índice, el rendimiento real será sustancialmente menor.
- **Sin señal de confianza en la salida**: el contrato de inferencia emite únicamente `id` y `prediction`; no se expone puntuación, margen ni alternativas. No es posible umbralizar ni auditar la incertidumbre sin modificar el código.
- **Salida de una sola EC**: aunque los vecinos puedan tener anotaciones múltiples, solo se devuelve la primera EC predicha. Se pierde información en enzimas con actividad múltiple.
- **Duplicados descartados**: al agrupar por secuencia exacta se conserva el primer `id` y el resto no aparece en la salida; un pipeline que espere una línea por identificador de entrada fallará.
- **Riesgo de asignación errónea silenciosa**: el modelo no es generativo y no produce texto, pero puede asignar una EC incorrecta con total apariencia de normalidad. No debe usarse como sustituto de validación experimental en contextos clínicos, industriales o regulatorios.
- **Licencia no declarada**: al no especificarse licencia de los pesos, el uso comercial queda en una zona legal indeterminada. El vocabulario EC procede de ExPASy ENZYME (CC BY 4.0) y exige atribución a SIB.
- **Datos de entrenamiento no distribuidos**: no se incluyen los Parquet ni los identificadores de origen, lo que dificulta auditar sesgos de composición del corpus o reconstruir el índice.
- **Sesgo de composición desconocido**: al no publicarse la composición taxonómica ni funcional de `train.parquet`, no es posible evaluar sesgos hacia determinados reinos o familias enzimáticas.
- **Madurez**: cero descargas y cero *likes*; sin validación independiente, sin resultados oficiales de leaderboard y con la build Docker pendiente de verificación por el propio autor.
- **Idioma y documentación**: la tarjeta está en inglés y no aplica soporte multilingüe; las secuencias no se normalizan antes de indexar, lo que puede afectar a entradas con caracteres no estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Will-of-D/enzyme-classification-hybrid-v1
- Dataset público: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification (revisión `4ff037c68457af5d69ecebdd73775d96d9aeb5bf`)
- *Starter* y vocabulario EC: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification-starter (revisión `069c5c84015b37dff1a21415a7ab3f52fd8fce1b`)
- Leaderboard de la tarea: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Vocabulario EC de referencia (ExPASy ENZYME, SIB, CC BY 4.0): https://enzyme.expasy.org/
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las consultas devolvieron únicamente definiciones de diccionario del término inglés "will", sin relación con el repositorio.
