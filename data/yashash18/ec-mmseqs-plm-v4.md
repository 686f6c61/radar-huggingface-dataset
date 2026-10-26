# Yashash18/ec-mmseqs-plm-v4

## Resumen

`Yashash18/ec-mmseqs-plm-v4` es un repositorio de Hugging Face publicado por el usuario Yashash18 el 26 de octubre de 2026, cuyo contenido apunta a una participación en la tarea de clasificación enzimática del leaderboard Leak CURBER. El repositorio pesa 1,7 GB y lleva las etiquetas `onnx`, `leak-curber`, `enzyme` y `leaderboard`. La model card no describe el modelo en sí: reproduce la plantilla de instrucciones del modelo de arranque (*starter*) de la organización, con el enunciado de la tarea, el formato de entrada y salida, las restricciones del entorno de evaluación y el procedimiento de envío. No hay información sobre arquitectura, datos de entrenamiento, autoría científica ni resultados.

El problema que aborda es la anotación funcional de enzimas: dada una secuencia de aminoácidos, predecir su número EC (Enzyme Commission) en sus cuatro niveles jerárquicos (L1 a L4). La evaluación puntúa *top-1 accuracy* en L4, L3, L2 y L1, con crédito parcial cuando una secuencia tiene varias EC anotadas, y el ranking se ordena por L4. El vocabulario de salida permitido proviene de ExPASy ENZYME, release 02-Sep-2026.

Su relevancia es limitada y fundamentalmente contextual: se trata de un artefacto de competición con 0 descargas y 0 *likes*, sin licencia declarada y sin documentación técnica propia. Resulta útil como referencia del formato exigido por el leaderboard (ONNX, ejecución solo en CPU, sin red) y como punto de partida para quien quiera reproducir o comparar enfoques de clasificación enzimática, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card no la describe; la etiqueta `onnx` indica que los pesos se exportan a formato ONNX. El nombre del repositorio sugiere un modelo de lenguaje proteico (PLM) combinado con MMseqs, pero no se confirma en la documentación |
| Parametros totales | No disponible. El tamaño del repositorio (1,7 GB) no permite inferirlo sin conocer la precisión de almacenamiento y si incluye estados de optimizador |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El formato ONNX admite cuantización FP16/INT8, pero la model card no documenta ninguna variante publicada |
| Idiomas soportados | No aplica / no disponible. La entrada es una secuencia de aminoácidos en código de una letra, no texto natural |
| Licencia | No disponible (el repositorio no declara licencia). El vocabulario EC empleado, `ec_vocabulary.json`, procede de ExPASy ENZYME y se distribuye bajo CC BY 4.0 por SIB |
| Formato de pesos | ONNX (según etiqueta del repositorio); nombres de fichero y precisión no disponibles |
| Tarea | Clasificación enzimática multietiqueta a nivel EC (L1–L4), predicción top-1 efectiva |
| Entrada | Parquet con columnas `id` y `sequence` |
| Salida | JSON Lines con claves `id` y `prediction` (lista de hasta 10 EC distintas, ordenadas de mejor a peor) |
| Tamaño del repositorio | 1,7 GB |
| Fecha de creación | 2026-10-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO. La model card es una plantilla ajena al modelo: describe la tarea del leaderboard Leak CURBER, no las decisiones de diseño del autor. La única señal técnica directa es la etiqueta `onnx`, que implica que la inferencia se ejecuta mediante un runtime ONNX (probablemente ONNX Runtime en CPU, dado que el evaluador no ofrece GPU) y que el artefacto entregado es un grafo exportado, no pesos en formato PyTorch o safetensors.

El nombre `ec-mmseqs-plm-v4` sugiere dos componentes: un modelo de lenguaje proteico como extractor de representaciones y una componente relacionada con MMseqs (agrupamiento o búsqueda de homología, posiblemente para construir particiones sin fuga de datos entre *train* y *validation*, en línea con el nombre «leak-curber»). Ninguna de estas inferencias está confirmada por documentación del autor, por lo que deben tratarse como hipótesis y no como especificaciones verificadas.

Del enunciado de la tarea sí se conoce el régimen de datos: `train.parquet` contiene pares entrada–EC (una fila por par, con etiqueta `ec_number`), `val_inputs.parquet` solo entradas, y las etiquetas de validación y el conjunto de test son privados. Las secuencias idénticas se agrupan por *split* y se puntúan una sola vez; no se permite normalizar secuencias.

## Capacidades

- Clasificación de secuencias de aminoácidos en números EC, devolviendo hasta 10 candidatos distintos ordenados por confianza; solo la primera predicción contribuye a la métrica.
- Predicción a los cuatro niveles jerárquicos de la EC (L1, L2, L3, L4), evaluada de forma independiente.
- Ejecución en CPU sin acceso a red, con un presupuesto de 10 minutos para el conjunto completo de entradas y 16 GB de RAM.
- Empaquetado como imagen Docker con `predict.py` como punto de entrada (`python /app/predict.py --input INPUT --output OUTPUT`).
- Escritura de resultados en JSON Lines conforme al esquema exigido, con una única línea por identificador único de entrada.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión o audio; el modelo es un clasificador de dominio específico.
- No se documenta soporte de *tool calling*, *function calling* ni razonamiento multi-paso.
- No se documentan capacidades multilingües (no aplicables a la tarea).

## Casos de uso

- Anotación funcional de proteínas hipotéticas: procesar un catálogo de secuencias sin anotar y asignar un número EC candidato a cada una, usando el modelo como primer filtro antes de la revisión manual. Adecuado por su formato de salida por lotes y su ejecución sin GPU.
- Triaje previo a validación experimental: priorizar qué enzimas candidatas merecen ensayo bioquímico, aprovechando la lista ordenada de hasta 10 EC por secuencia para disponer de alternativas cuando la top-1 no sea concluyente.
- Enriquecimiento de bases de datos internas: añadir anotaciones EC a registros históricos y comparar con las anotaciones ya curadas para detectar discrepancias y posibles errores de anotación heredados.
- Anotación en entornos aislados (*air-gapped*): al ejecutarse en CPU y sin red, encaja en infraestructuras con restricciones de conectividad donde no se pueden desplegar servicios basados en API.
- *Baseline* interno de comparación: servir de referencia cuantificada (top-1 a L1–L4) frente a la que medir nuevos clasificadores enzimáticos propios.
- Prototipado y docencia en bioinformática: ejemplo reproducible de pipeline completo (Parquet de entrada, JSON Lines de salida, contenedor Docker, límites de recursos) para enseñar evaluación de clasificación jerárquica.
- Detección de enzimas en genomas o metagenomas recién secuenciados: aplicar el clasificador sobre los marcos abiertos de lectura predichos para obtener un borrador de anotación funcional que después se contraste con búsquedas de homología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye puntuaciones de validación ni de test, y la model card únicamente define la métrica sin aportar cifras.

Definición de la métrica empleada por el leaderboard (a modo de referencia, sin valores asociados):

| Metrica | Definicion |
|---|---|
| Top-1 accuracy L4 | Acierto de la primera EC predicha en los cuatro componentes; crédito parcial 1/n si la entrada tiene n EC anotadas |
| Top-1 accuracy L3 | Igual, comparando solo los tres primeros componentes |
| Top-1 accuracy L2 | Igual, comparando los dos primeros componentes |
| Top-1 accuracy L1 | Igual, comparando solo la clase de primer nivel |
| Criterio de ranking | L4; en caso de empate, se favorece el envío anterior |
| Predicciones vacías | Puntuación cero |

## Requisitos de hardware

- Entorno de evaluación oficial: solo CPU, 2 vCPU, 16 GB de RAM, sin GPU y sin red, con un límite de 10 minutos para todas las entradas.
- Almacenamiento: el repositorio del modelo debe ocupar 4 GiB o menos; este ocupa 1,7 GB, por lo que cumple el límite con margen.
- Restricciones adicionales de la imagen: Linux x86-64, intérprete en `/usr/local/bin/python`, directorio de trabajo `/app`, construcción en menos de 30 minutos, ningún fichero escrito mayor de 16 MiB.
- VRAM estimada para inferencia: no aplica en el régimen previsto (CPU). No se documenta un despliegue en GPU.
- GPU recomendadas: no disponibles. El diseño de la tarea excluye GPU; no hay datos de rendimiento en aceleradores.
- Compatibilidad con GPU de consumo: no documentada. Al estar en ONNX, técnicamente podría ejecutarse con *execution providers* CUDA o TensorRT, pero no hay nada publicado al respecto.
- Opciones de despliegue: ONNX Runtime en CPU dentro de Docker (única vía documentada). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no encajan con un clasificador de este tipo.
- Latencia y throughput: no disponibles. Como referencia, el presupuesto total de 10 minutos para todo el conjunto de validación condiciona el diseño, pero se desconoce el número de secuencias y el tiempo por secuencia.

## Comparativa con modelos similares

No se han encontrado en las fuentes consultadas datos verificables de parámetros, contexto, rendimiento o licencia de alternativas comparables, por lo que la comparación se limita al enfoque metodológico.

| Modelo / enfoque | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Yashash18/ec-mmseqs-plm-v4` | Clasificador EC, artefacto ONNX para leaderboard | No disponible | No disponible | No disponible | Pública en HF, 0 descargas |
| Baseline del *starter* (`starkAhmed43/leak-curber-enzyme-classification-starter`) | Predice la EC más frecuente del *train*, ignora la entrada | Ninguno (tabla de frecuencias) | No aplica | No disponible | Pública en HF |
| Transferencia por homología con MMseqs2 | Asignación de EC por similitud de secuencia contra una base anotada | No aplica (herramienta de alineamiento) | No aplica | Código abierto (ver repositorio) | GitHub público |
| Clasificadores basados en PLM tipo ESM-2 ajustados a EC | *Fine-tuning* de un modelo de lenguaje proteico sobre etiquetas EC | No disponible en las fuentes | No disponible | No disponible | Varía según implementación |

## Limitaciones y advertencias

- Ausencia total de documentación técnica: la model card es la plantilla del leaderboard, no una descripción del modelo, por lo que no es posible reproducir el entrenamiento ni auditar los datos utilizados.
- Sin licencia declarada: no puede asumirse permiso de uso comercial, modificación ni redistribución. Cualquier uso en producción requiere contactar con el autor.
- Ausencia de validación externa: 0 descargas y 0 *likes*, sin resultados de validación publicados ni revisión por pares.
- Riesgo de fuga de datos (*leakage*): el propio nombre del leaderboard («Leak CURBER») sugiere que la tarea se diseñó para penalizar la contaminación entre *train*, validación y test; la procedencia de los datos de entrenamiento de este modelo no está documentada, por lo que no puede descartarse solapamiento con los conjuntos de evaluación.
- Sesgo de anotación biológica: la distribución de números EC en bases de datos como ExPASy está fuertemente desbalanceada hacia clases sobrerrepresentadas (por ejemplo, hidrolasas y transferasas), lo que puede degradar el rendimiento en clases raras. No se han publicado análisis por clase.
- Riesgo de alucinación en sentido laxo: el modelo siempre emite al menos una EC dentro del vocabulario permitido, sin umbral de abstención documentado; una predicción puede ser formalmente válida y biológicamente incorrecta.
- Solo se puntúa la primera predicción: aunque se permiten hasta 10 EC, las restantes no mejoran la métrica, lo que limita la utilidad de la lista ordenada como medida de incertidumbre calibrada.
- Vocabulario restringido a ExPASy ENZYME release 02-Sep-2026: cualquier EC añadida con posterioridad queda fuera y provocará fallo de evaluación si se emite.
- Dominio acotado a enzimas: no es aplicable a otras familias proteicas ni a tareas de texto general.
- Restricciones de ejecución estrictas en el contexto del leaderboard (CPU, 2 vCPU, 16 GB, 10 minutos, sin red); extrapolar su comportamiento fuera de ese entorno no está avalado por ninguna medición.
- Fechas de creación y actualización en 2026 sin actividad posterior registrada; no hay indicios de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v4
- Repositorio *starter* del leaderboard: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset de la tarea: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard (Space): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
- MMseqs2 (búsqueda y agrupamiento de secuencias): https://github.com/soedinglab/MMseqs2
