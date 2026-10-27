# Yashash18/ec-mmseqs-plm-v9

## Resumen

`Yashash18/ec-mmseqs-plm-v9` es un modelo publicado en Hugging Face por el usuario Yashash18 en el contexto del reto **Leak CURBER**, una competición de clasificación enzimática evaluada mediante leaderboard. La tarea consiste en asignar uno o varios números EC (Enzyme Commission) a secuencias de aminoácidos de proteínas: la entrada es un fichero Parquet con las columnas `id` y `sequence`, y la salida es JSON Lines con `id` y una lista ordenada de hasta 10 EC candidatos, de los que solo el primero cuenta para la métrica. El modelo se puntúa con precisión top-1 a cuatro niveles jerárquicos de EC (L4, L3, L2 y L1), ordenándose por L4.

El repositorio ocupa 1,7 GB y lleva la etiqueta `onnx`, lo que indica que la inferencia se distribuye en formato ONNX y se ejecuta solo en CPU: el evaluador del leaderboard proporciona 2 vCPU, 16 GB de RAM, 10 minutos de presupuesto total, sin GPU y sin red, con un límite de 4 GiB para el repositorio y de 16 MiB por fichero de salida. El nombre del modelo sugiere una combinación de búsqueda de homología con MMseqs y un modelo de lenguaje de proteínas (PLM), aunque esta composición no está documentada en la información disponible.

Es relevante ahora por dos motivos: la anotación funcional de proteínas a escala metagenómica sigue siendo un cuello de botella práctico, y el formato del reto (inferencia CPU-only, contenedor Docker reproducible, licencia de datos CC BY 4.0 para el vocabulario EC de ExPASy) lo convierte en un caso de estudio útil sobre cómo empaquetar modelos biológicos para evaluación ciega. Conviene señalar que el README del repositorio es la plantilla genérica del reto, no una model card propia: no documenta arquitectura, datos de entrenamiento ni resultados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `onnx` confirma el formato de serialización, no la arquitectura. El nombre del repositorio sugiere búsqueda por homología (MMseqs) combinada con un modelo de lenguaje de proteínas, sin confirmación documental |
| Parámetros totales | No disponible (el tamaño del repo, 1,7 GB, es el único dato; ver "Requisitos de hardware" para la estimación derivada) |
| Parámetros activos | No aplica / no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible. En tareas de este tipo el límite práctico lo fija la longitud máxima de secuencia admitida, que no se especifica |
| Tipos de cuantización | No disponible. Se distribuye en ONNX; se desconoce si los pesos están en FP32, FP16 o INT8 |
| Idiomas soportados | No aplica: no es un modelo de lenguaje natural. La entrada son secuencias de aminoácidos en notación de una letra |
| Licencia | No disponible (campo vacío en Hugging Face y ausente en el README) |
| Formato de pesos | ONNX (etiqueta del repositorio); el resto de artefactos de inferencia no está detallado |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de parámetros, el corpus de entrenamiento ni el procedimiento de ajuste. El repositorio no incluye una model card descriptiva: el README reproduce la plantilla del starter del reto Leak CURBER, con instrucciones de envío, formato de entrada/salida y restricciones del evaluador, pero sin secciones de método o datos. Cualquier afirmación sobre capas, atención, tokenizador o estrategia de entrenamiento sería especulativa.

Lo único verificable del contexto es el marco de evaluación, que condiciona el diseño: los datos públicos son `train.parquet` (pares entrada–EC, una fila por par) y `val_inputs.parquet` (solo entradas); las etiquetas de validación y el conjunto de test son privados. Las entradas pueden tener varios EC registrados, de modo que la métrica reparte crédito parcial (1/n por cada EC registrado cuyo prefijo coincida) y promedia sobre entradas únicas tras agrupar duplicados. El vocabulario permitido, `ec_vocabulary.json`, proviene de ExPASy ENZYME (release 02-Sep-2026), distribuido por SIB bajo CC BY 4.0. El nombre "v9" y la etiqueta `leak-curber` apuntan a un contexto de competición centrado en el control de fuga de datos entre splits, pero no se detalla qué técnicas de entrenamiento (si alguna) se aplicaron para mitigarla en este modelo concreto.

## Capacidades

- Clasificación de secuencias de proteínas en números EC, devolviendo hasta 10 candidatos distintos ordenados por preferencia (solo el primero puntúa).
- Predicción evaluable a cuatro niveles jerárquicos de EC (L1, L2, L3 y L4), aunque el ranking del leaderboard usa L4.
- Procesamiento por lotes de ficheros Parquet con columnas `id` y `sequence`, generando JSON Lines con `id` y `prediction`.
- Inferencia exclusivamente en CPU, compatible con el entorno del evaluador (2 vCPU, 16 GB de RAM, sin red).
- Ejecución contenedorizada: el envío se construye a partir de un `Dockerfile` propio con punto de entrada `python /app/predict.py --input INPUT --output OUTPUT`.
- Manejo de entradas con múltiples EC asociados, puesto que el formato de salida admite varios candidatos y la métrica aplica crédito parcial.
- No se ha documentado soporte de tool calling, razonamiento multi-paso, agentes, visión, audio ni modo "thinking".

## Casos de uso

- Anotación funcional en pipelines de metagenómica: dado un catálogo de proteínas predichas a partir de reads, el modelo asigna candidatos EC por secuencia, de modo que el análisis posterior (por ejemplo, reconstrucción de rutas metabólicas) puede agrupar enzimas por clase funcional sin depender de un alineamiento BLASTp completo contra UniProt.
- Priorización de dianas para validación experimental: al devolver hasta 10 candidatos ordenados, un laboratorio puede ensayar primero la hipótesis mejor puntuada y conservar las siguientes como alternativas si el ensayo es negativo.
- Enriquecimiento de bases de datos internas de proteínas: anotar entradas con EC desconocido o "putative" de forma masiva y marcar las discrepancias frente a la anotación manual para revisión curatorial.
- Detección de posibles errores de anotación: comparar la predicción top-1 con el EC anotado en bases de referencia y enviar a revisión los casos con coincidencia solo a nivel L1 o L2.
- Selección de enzimas en bioprospección industrial: filtrar bibliotecas de secuencias ambientales por clase EC de interés (por ejemplo, hidrolasas) antes de clonar y expresar, reduciendo el número de candidatos a caracterizar.
- Componente de referencia en evaluación comparativa: al ser un modelo ONNX ejecutable en CPU con restricciones conocidas (2 vCPU, 10 minutos), sirve como baseline reproducible frente a aproximaciones basadas en búsqueda de homología o en modelos de lenguaje de proteínas de mayor tamaño.
- Docencia y prototipado: el flujo Parquet → JSONL y la imagen Docker permiten montar un ejercicio completo de clasificación enzimática sin GPU ni infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye puntuaciones de validación ni de test del leaderboard, y la model card no reporta métricas propias (ni top-1 a L4/L3/L2/L1, ni comparaciones con el baseline de EC más frecuente). El baseline descrito en el README ignora la entrada y predice siempre el EC más frecuente del split de entrenamiento, pero tampoco se ofrece su valor numérico.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es CPU-only según las reglas del leaderboard.
- RAM: el evaluador asigna 16 GB. El repositorio pesa 1,7 GB, de los cuales la mayor parte corresponde presumiblemente a los pesos ONNX, por lo que el modelo cabe holgadamente en memoria incluso con overhead de runtime.
- Estimación de parámetros a partir del tamaño: si los pesos están en FP32 (~4 bytes por parámetro) el modelo rondaría los 400 M de parámetros; si están en FP16 (~2 bytes) rondaría los 800 M. Es una estimación derivada del tamaño del repositorio, no un dato confirmado.
- GPU recomendadas: no aplica para el envío al leaderboard. Para uso local no se requiere GPU; cualquier CPU x86-64 moderna con AVX2 es suficiente. Si se quisiera acelerar, el runtime ONNX admitiría Execution Providers de CUDA o ROCm, pero no hay datos de rendimiento publicados.
- ¿Cabe en GPU de consumo? Sí, con toda probabilidad, dado el tamaño del artefacto (por debajo de los 2 GB), aunque no se ha verificado ni se ha publicado latencia con aceleración.
- Opciones de despliegue: ONNX Runtime (vía Python) es la vía natural; Docker con la imagen construida desde el `Dockerfile` del repositorio reproduce el entorno del evaluador. vLLM, llama.cpp, Ollama y TGI no son aplicables a este tipo de modelo (no generativo, formato ONNX orientado a clasificación).
- Latencia y throughput: no disponibles. La única cota conocida es el presupuesto global de 10 minutos para todos los inputs del conjunto de validación con 2 vCPU, lo que impone un límite superior de tiempo por secuencia no especificado.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparación es estructural y no de precisión. Las cifras de exactitud de las alternativas no se incluyen porque no forman parte de la información proporcionada.

| Modelo / enfoque | Tipo de enfoque | Entrada | Salida | Requiere GPU | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Yashash18/ec-mmseqs-plm-v9 | No documentado; presumiblemente híbrido homología + PLM, serializado en ONNX | Secuencia de aminoácidos (Parquet) | Lista ordenada de EC (hasta 10) | No (CPU-only en el reto) | No disponible | Hugging Face, repo público, 0 descargas |
| CLEAN (Yu et al.) | Clasificador jerárquico de EC sobre embeddings de PLM | Secuencia | EC con confianza por nivel | Sí, en la práctica | Código abierto (verificar términos del repositorio original) | Repositorio público de investigación |
| DeepEC | Redes neuronales sobre similitud de secuencia | Secuencia | EC (top-k) | Recomendable | Código abierto para investigación | Repositorio público |
| Transferencia por homología (BLASTp/DIAMOND + regla de mayoría) | Búsqueda en base de datos anotada | Secuencia | EC de los mejores hits | No | Depende de la base de datos y de la herramienta | Estándar de facto, ampliamente disponible |

La ventaja diferencial del modelo evaluado, si se confirma, es la combinación de bajo coste de inferencia (CPU, contenedor, sin red) con la posibilidad de devolver varios candidatos, lo que encaja con un escenario de anotación masiva. Su desventaja frente a las alternativas es la ausencia total de documentación metodológica y de métricas publicadas.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial. Es imprescindible contactar con el autor o verificar los términos antes de cualquier despliegue en producción.
- Ausencia de model card real: el README es la plantilla del starter del reto. No hay información sobre datos de entrenamiento, arquitectura ni metodología, lo que impide auditar sesgos o fuga de datos.
- Sin validación externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso ni de reproducibilidad por terceros.
- Riesgo de sobreajuste al split de entrenamiento y de fuga de datos: el propio nombre del reto (`leak-curber`) indica que el control de fuga entre train y validación/test es el eje de la competición. Un modelo con buena puntuación en validación puede degradarse en secuencias realmente nuevas.
- Ambigüedad inherente a la tarea: una misma secuencia puede tener varios EC registrados. La métrica reparte crédito, pero un top-1 correcto solo parcialmente (coincidencia a L1 o L2) puede ser insuficiente para aplicaciones que exijan el nivel L4.
- Sensibilidad al preprocesado: la organización advierte explícitamente de que no se normalicen las secuencias y de que se prediga solo el primer ID de cada entrada duplicada. Alterar el preprocesado invalida la comparación con las puntuaciones del leaderboard.
- Restricciones del entorno de evaluación que condicionan el uso real: sin red, sin GPU, 2 vCPU, 10 minutos y 16 MiB máximo por fichero de salida. Cualquier pipeline que requiera acceso a bases de datos externas en tiempo de inferencia no es viable tal cual.
- Cobertura limitada al vocabulario EC de ExPASy (release 02-Sep-2026): las predicciones fuera de `ec_vocabulary.json` se consideran inválidas y provocan el fallo de la evaluación.
- Idiomas: no aplica, pero conviene recordar que el modelo no procesa texto libre ni descripciones funcionales, solo secuencias.
- Sin datos de robustez: se desconoce el comportamiento ante proteínas truncadas, secuencias con caracteres no estándar (X, U, O) o fragmentos muy cortos.

## Enlaces

- Repositorio del modelo en Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v9
- Modelo starter del reto (referenciado en el README): https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset del reto (train y val_inputs): https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard (pestaña Enzyme classification): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas y envío: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC de referencia (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
- Paper, blog o demo del modelo: no disponible
