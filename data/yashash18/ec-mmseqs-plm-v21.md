# Yashash18/ec-mmseqs-plm-v21

## Resumen

Yashash18/ec-mmseqs-plm-v21 es un modelo de clasificación enzimática que predice números EC (Enzyme Commission) a partir de secuencias de aminoácidos. Lo ha publicado el usuario Yashash18 en Hugging Face como envío al leaderboard Leak CURBER de clasificación de enzimas, una competición que evalúa repositorios en un entorno aislado de CPU (2 vCPU, 16 GB de RAM, 15 minutos, sin red). El repositorio pesa 2,3 GB y está etiquetado con ONNX, lo que indica que los pesos están exportados a ese formato.

El nombre sugiere una combinación de búsqueda de secuencias tipo MMseqs con un modelo de lenguaje de proteínas (PLM), aunque la model card no documenta la arquitectura ni el entrenamiento, ya que reproduce las instrucciones de la tarea. Su relevancia es principalmente competitiva: sirve como envío al leaderboard, cuya métrica es la precisión top-1 a cuatro niveles de granularidad del número EC (L1 a L4).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el nombre sugiere búsqueda de secuencias MMseqs combinada con un modelo de lenguaje de proteínas, sin confirmación) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible |
| Longitud de contexto | No aplicable (modelo de clasificación de secuencias proteicas, no un LLM) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplicable (procesa secuencias de aminoácidos, no texto natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX (según etiquetas del repositorio); tamaño del repositorio: 2,3 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo ni su proceso de entrenamiento: el README publicado es una copia de las instrucciones del modelo de partida (starter) de la competición. Lo único documentado es la tarea: la entrada es un archivo Parquet con las columnas `id` y `sequence` (secuencia de aminoácidos de la enzima), y la salida es JSON Lines con las claves `id` y `prediction`, donde la predicción es una lista de hasta 10 números EC distintos ordenados del mejor al peor. Solo la primera predicción puntúa.

Los datos de entrenamiento públicos del leaderboard son `train.parquet` (con la etiqueta `ec_number`, un par entrada-EC por fila) y `val_inputs.parquet` (solo entradas); las etiquetas de validación y el test son privados. El vocabulario de EC permitidos procede de ExPASy ENZYME, versión del 02-Sep-2026, distribuido por SIB bajo licencia CC BY 4.0. No hay información sobre número de tokens, composición del dataset ni técnicas de alineación (no aplicables a un clasificador de secuencias).

## Capacidades

- Predicción del número EC (clasificación enzimática jerárquica de L1 a L4) a partir de la secuencia de aminoácidos de una proteína.
- Salida estructurada en JSON Lines con hasta 10 EC distintos por entrada, ordenados por confianza; solo el primero se evalúa.
- Compatible con el protocolo del leaderboard: agrupación de entradas duplicadas, predicción únicamente del primer ID de cada entrada única y uso de un vocabulario cerrado de EC.
- Inferencia en CPU sin acceso a red, dentro de los límites del evaluador (2 vCPU, 16 GB de RAM, 15 minutos para todas las entradas).
- No dispone de capacidades de lenguaje natural, tool calling, razonamiento multi-paso ni multimodalidad: es un modelo de dominio bioinformático.

## Casos de uso

- Anotación funcional de genomas: asignar números EC a proteínas hipotéticas tras la predicción de genes, rellenando el hueco entre la secuencia y la función enzimática conocida.
- Descubrimiento de enzimas industriales: cribar secuencias de metagenomas o colecciones de proteínas para identificar candidatos a biocatalizadores de una clase EC concreta antes de sintetizarlas.
- Curación de bases de datos bioinformáticas: verificar o proponer anotaciones EC en repositorios tipo UniProt o BRENDA, donde la lista de hasta 10 EC por secuencia facilita la revisión manual posterior.
- Reconstrucción de rutas metabólicas: completar pasos enzimáticos ausentes en modelos metabólicos a escala genómica asignando EC a las proteínas del organismo.
- Biología sintética: control de calidad previo a la síntesis de proteínas diseñadas, comprobando que la secuencia propuesta se asocia a la actividad EC esperada.
- Investigación en promiscuidad enzimática: la salida multietiqueta (hasta 10 EC) permite explorar secuencias con posibles actividades múltiples, aunque solo la primera se evalúe en el leaderboard.
- Docencia y competiciones de bioinformática: servir como punto de partida o contraste frente al baseline del starter, que predice siempre el EC más frecuente del conjunto de entrenamiento.
- Integración en pipelines de anotación: combinar un prefiltrado por homología (por ejemplo con MMseqs2) con la clasificación de este modelo para priorizar secuencias sin vecinos cercanos en bases de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe únicamente el protocolo de evaluación del leaderboard: precisión top-1 a niveles L4, L3, L2 y L1 del número EC, con ranking por L4. Si una entrada tiene n EC registrados, la primera predicción puntúa 1/n por cada EC registrado cuyos primeros componentes coincidan; una predicción vacía puntúa cero. No hay cifras concretas del modelo ni comparativas publicadas.

## Requisitos de hardware

- Inferencia exclusivamente en CPU según las reglas del leaderboard: 2 vCPU, 16 GB de RAM y un máximo de 15 minutos para todas las entradas (incluye descarga de imagen, carga del modelo e inferencia). Sin GPU y sin acceso a red.
- No requiere VRAM al no contemplarse inferencia en GPU.
- Almacenamiento: el repositorio ocupa 2,3 GB; el límite máximo permitido para el repositorio de envío es 4 GiB y la construcción de la imagen Docker debe terminar en 30 minutos.
- Despliegue: imagen Docker linux/amd64 con Python en `/usr/local/bin/python`, directorio de trabajo `/app` y comando `python /app/predict.py --input INPUT --output OUTPUT`; no se ejecutan entrypoints ni hooks de shell, y los archivos temporales deben ir en `/tmp`.
- No se especifican opciones como vLLM, llama.cpp, Ollama o TGI; el despliegue documentado es únicamente el contenedor Docker del evaluador.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Enfoque | Entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yashash18/ec-mmseqs-plm-v21 | No documentado (posible combinación de búsqueda de secuencias y PLM) | Secuencias de aminoácidos | No disponible | No disponible | Hugging Face, repositorio público de 2,3 GB |
| Baseline del starter (starkAhmed43/leak-curber-enzyme-classification-starter) | Predice el EC más frecuente del conjunto de entrenamiento, ignorando la entrada | Secuencias de aminoácidos | Referencia mínima del leaderboard | No disponible | Hugging Face, con scripts de entrenamiento e inferencia |
| ProteInfer (Google Research) | Red neuronal convolucional sobre la secuencia, predice EC y términos GO | Secuencias de aminoácidos | Artículo científico publicado | No disponible en la información proporcionada | GitHub |
| Clean | Embeddings de modelos de lenguaje de proteínas con búsqueda de vecinos más cercanos | Secuencias de aminoácidos | Artículo científico publicado | No disponible en la información proporcionada | GitHub |

## Limitaciones y advertencias

- Rendimiento desconocido: no hay benchmarks publicados ni documentación de la arquitectura o del entrenamiento, por lo que no es posible evaluar su calidad antes de enviarlo al leaderboard.
- Licencia no especificada: existe incertidumbre legal para cualquier reutilización, incluido el uso comercial.
- Vocabulario cerrado: solo puede predecir EC presentes en `ec_vocabulary.json` (ExPASy ENZYME, 02-Sep-2026); cualquier EC fuera de ese conjunto invalida la evaluación.
- Restricciones estrictas de ejecución: solo CPU, 15 minutos totales, sin red y sin archivos de salida superiores a 16 MiB; inviable para lotes grandes fuera del entorno del evaluador sin adaptación.
- Modelo sin adopción comunitaria: 0 descargas y 0 likes registrados, sin validación externa de terceros.
- Riesgo de clasificación errónea, especialmente en clases EC raras o poco representadas en el entrenamiento; el formato de salida (solo la primera predicción puntúa) penaliza fuertemente los errores de ranking.
- Convenciones de la tarea que deben respetarse: no normalizar las secuencias, no predecir IDs duplicados y garantizar que cada ID único aparezca exactamente una vez en la salida.
- La model card reproduce las instrucciones del starter de la competición en lugar de documentar el modelo real, lo que dificulta la auditoría técnica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v21
- Leaderboard Leak CURBER (Space de Hugging Face): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Modelo starter de la competición: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- ExPASy ENZYME (fuente del vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
- Hoja de asignación de tareas de la competición: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
