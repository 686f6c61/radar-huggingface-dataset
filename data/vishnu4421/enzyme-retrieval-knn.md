# vishnu4421/enzyme-retrieval-knn

## Resumen

`vishnu4421/enzyme-retrieval-knn` es un repositorio de Hugging Face publicado como punto de partida para la tarea de *enzyme retrieval* del leaderboard Leak CURBER. No se trata de un modelo de lenguaje ni de una red neuronal entrenada de forma convencional: el autor lo etiqueta explícitamente como *starter model* y su contenido se corresponde con la plantilla oficial de la competición, que incluye un `Dockerfile`, un `predict.py`, un `requirements.txt` y un README con las instrucciones de envío. El repositorio ocupa 0,1 GB y no registra descargas ni *likes* en el momento de la consulta.

La tarea consiste en predecir el número EC (Enzyme Commission) asociado a una reacción química representada como SMILES de reacción. La entrada es un fichero Parquet con las columnas `id` y `rxn_smiles`, y la salida debe ser JSON Lines con las claves `id` y `prediction`, donde la predicción es una lista ordenada de hasta diez códigos EC distintos. La métrica principal es la precisión top-1 a nivel EC L4, con métricas auxiliares en L3, L2 y L1.

El interés del repositorio es, por tanto, logístico y de evaluación más que de investigación: proporciona el esqueleto reproducible (baseline por frecuencia, contenedor Docker, restricciones de CPU y memoria) sobre el que los participantes deben construir sus propios clasificadores. La información pública no permite confirmar que el autor haya implementado un clasificador k-NN real pese al sufijo `knn` del nombre; el contenido descrito corresponde a la plantilla del starter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (starter de competición; baseline por frecuencia EC más frecuente en entrenamiento) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada por reacción individual, sin ventana de contexto definida) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la tarea es sobre SMILES de reacción, no texto natural) |
| Licencia | No disponible |
| Formato de pesos | No disponible (el baseline guarda `weights/baseline.json`; el repo contiene `Dockerfile`, `predict.py`, `requirements.txt`) |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de red neuronal. El baseline oficial ignora la entrada y predice para cada reacción el EC más frecuente del conjunto de entrenamiento (`train.parquet`), usando únicamente el split de entrenamiento. El entrenamiento del baseline se reduce a contar frecuencias y volcar el resultado en `weights/baseline.json` mediante `train.py`.

Los participantes pueden sustituir el baseline por cualquier modelo o librería, siempre que la inferencia se ejecute en CPU. El entorno de evaluación fija 2 vCPU, 16 GB de RAM y 15 minutos para todos los inputs, sin GPU y sin red. El repositorio debe contener `Dockerfile`, `predict.py` y `README.md`, construirse en menos de 30 minutos, pesar como máximo 4 GiB y no escribir ficheros de más de 16 MiB. La imagen se construye para Linux x86-64 con Python en `/usr/local/bin/python` y directorio de trabajo `/app`.

## Capacidades

- Clasificación de reacciones químicas en códigos EC (predicción top-1 a niveles L4, L3, L2 y L1).
- Predicción de una lista ordenada de hasta 10 ECs distintos por input, aunque solo el primero cuenta para la métrica.
- Agrupación de inputs idénticos dentro de cada split (se conserva el primer `id` y se puntúa una sola vez por input único).
- Gestión de inputs con múltiples ECs registrados: la primera predicción obtiene 1/n por cada EC registrado cuyos primeros L componentes coincidan.
- Ejecución en CPU sin red, con límites estrictos de tiempo y memoria.
- Validación local reproducible mediante Docker con el comando `python /app/predict.py --input INPUT --output OUTPUT`.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, *tool calling* ni agentes.

## Casos de uso

- Anotación automática de reacciones en bases de datos bioquímicas: clasificar reacciones nuevas o no anotadas con un EC top-1 a nivel L4 para priorizar la revisión manual de curators.
- Filtrado previo en pipelines de ingeniería enzimática: descartar candidatos de reacción cuyo EC predicho no encaje con la familia enzimática buscada antes de simulaciones más costosas.
- Enriquecimiento de datasets de metabolómica y biología de sistemas: asignar ECs a reacciones reconstruidas de redes metabólicas para facilitar el análisis de rutas.
- Benchmarking interno de clasificadores: usar el starter y el leaderboard como referencia reproducible para comparar enfoques (k-NN sobre fingerprints, modelos de grafos, transformers químicos) bajo las mismas restricciones de CPU.
- Participación en la competición Leak CURBER: punto de partida para equipos que quieran enviar una primera submission válida y medir la mejora respecto al baseline por frecuencia.
- Docencia y prototipado rápido: ejemplo completo de extremo a extremo (descarga de datos, entrenamiento, predicción, contenedor Docker y envío) para enseñar flujos de evaluación con restricciones de producción.
- Integración en herramientas de curación de ExPASy ENZYME: generar sugerencias de EC para reacciones en revisión, siempre con validación humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README describe la métrica (precisión top-1 a niveles L4, L3, L2 y L1, con ordenación por L4) y el criterio de desempate (gana el envío anterior), pero no incluye cifras del baseline ni de ningún modelo.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el evaluador asigna 2 vCPU y 16 GB de RAM, sin GPU y sin red.
- Límite temporal de 15 minutos para todos los inputs, incluyendo la carga del modelo y la inferencia.
- Sin requisitos de VRAM: no se contempla el uso de GPU en la evaluación oficial.
- Despliegue mediante Docker (imagen Linux x86-64, Python en `/usr/local/bin/python`, directorio `/app`), con construcción en menos de 30 minutos.
- Tamaño máximo del repositorio: 4 GiB; ficheros escritos por `predict.py`: máximo 16 MiB cada uno.
- Latencia y throughput: no disponibles.
- No se documentan opciones de despliegue con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificadores de reacciones a EC) ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El repositorio parece ser la plantilla oficial del starter de la competición, no un modelo entrenado; el nombre `knn` no está respaldado por la documentación disponible.
- El baseline ignora la entrada y predice siempre el EC más frecuente, por lo que su utilidad predictiva real es mínima.
- Solo cuenta la primera predicción para la métrica; listar ECs adicionales no mejora la puntuación.
- Las etiquetas de validación y los datos de test son privados; solo se dispone de `train.parquet` con etiquetas y `val_inputs.parquet` sin ellas.
- No se debe canonicalizar las reacciones; cualquier normalización no documentada puede alterar la correspondencia con los inputs evaluados.
- El vocabulario de ECs permitidos proviene de ExPASy ENZYME (release 02-Sep-2026, CC BY 4.0); predecir un EC fuera de `ec_vocabulary.json` invalida la evaluación.
- Restricciones estrictas de envío: 2 submissions diarias y 20 totales por tarea; los fallos cuentan; solo una evaluación activa a la vez.
- Licencia del repositorio no disponible: no se puede confirmar el uso comercial del código o de los pesos.
- Riesgo de alucinación no aplicable en el sentido habitual, pero sí de predicciones erróneas sin señal de confianza calibrada.
- No hay información sobre sesgos, cobertura idiomática ni comportamiento fuera de la distribución de reacciones de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vishnu4421/enzyme-retrieval-knn
- Leaderboard Leak CURBER (espacio de Hugging Face): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Starter oficial del modelo: https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
- Dataset de la competición: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
