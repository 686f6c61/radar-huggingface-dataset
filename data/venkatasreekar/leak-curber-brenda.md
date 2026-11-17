# VenkataSreekar/leak-curber-brenda

## Resumen

Leak CURBER enzyme classification es un sistema de clasificación enzimática desarrollado por el usuario VenkataSreekar para la tarea Leak CURBER, que consiste en asignar a una secuencia proteica un número EC (Enzyme Commission) completamente especificado. No se trata de un modelo de lenguaje ni de una red neuronal única, sino de un pipeline híbrido que combina búsqueda exacta por hash, búsqueda de homología con MMseqs2, un ranker LightGBM y una red neuronal MLP de pequeño tamaño, todo ello ejecutable únicamente en CPU.

El sistema resuelve el problema clásico de anotación funcional de proteínas: dada una secuencia de aminoácidos, predecir su función enzimática según la jerarquía EC de cuatro niveles (L1-L4). Su relevancia radica en el enfoque pragmático: en lugar de entrenar un transformer proteico de gran escala, explota tablas de búsqueda exacta sobre UniProtKB/Swiss-Prot 2026_03 y TrEMBL (22,7 millones de secuencias), complementadas con búsqueda de homología y un ensemble de modelos ligeros.

El repositorio ocupa 0,4 GB e incluye pesos, bases de datos MMseqs2 y scripts de inferencia. No se dispone de información sobre licencia, idiomas soportados ni pipeline de Hugging Face. La model card reporta estimaciones locales de rendimiento (L4 0,725-0,757 en folds retenidos, 0,9222 en coincidencias exactas), aunque no se han publicado resultados oficiales de la competición.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline híbrido: búsqueda exacta por hash (BLAKE2b-64) + MMseqs2 (homología) + ranker LightGBM + MLP 44-64-32-1 |
| Parametros totales | No disponible (MLP de ~5.000 parámetros; LightGBM con dump JSON de tamaño no especificado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada: secuencia proteica de longitud variable) |
| Tipos de cuantizacion | No aplica (inferencia numpy y binario MMseqs2) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible (MMseqs2 es GPLv3; datos UniProtKB y ExPASy ENZYME son CC BY 4.0) |
| Formato de pesos | `.npz` (tablas de lookup y pesos MLP), `.json` (ranker LightGBM, etiquetas, metadatos), base de datos MMseqs2 (`weights/mmseqs/trainDB*`) |

## Arquitectura y entrenamiento

El sistema es un pipeline de cuatro etapas secuenciales. La primera es una búsqueda exacta: cada secuencia de entrada se hashea con BLAKE2b-64 más comprobación de longitud y se consulta en dos tablas: una de 218.473 secuencias (split de entrenamiento de la competición más Swiss-Prot 2026_03 con EC activo según ExPASy ENZYME 02-Sep-2026) y otra de 22,7 millones de secuencias de TrEMBL/Swiss-Prot con EC extraído de cross-references BRENDA, líneas DE o comentarios de actividad catalítica. Las coincidencias exactas reciben el EC correspondiente.

Las secuencias no resueltas pasan a búsqueda de homología con MMseqs2 contra 186.488 secuencias únicas de entrenamiento, con parámetros `-s 5.7 --max-seqs 300 --max-accept 50` y un segundo pase más sensible (`-s 7.5`) si el tiempo lo permite. Los EC de los 50 mejores hits se convierten en candidatos, y para cada par (entrada, EC) se calculan 44 características: votos ponderados por bit-score con varios niveles de nitidez, mejor identidad, cobertura y rango de los hits del EC, proporciones jerárquicas L1-L3, frecuencia del EC y concordancia de longitud consulta/EC.

El ranker es un LightGBM entrenado con entropía cruzada sobre el crédito L4 (1/n) por candidato, evaluado en tiempo de ejecución mediante un evaluador numpy de árboles (`gbdt.py`), por lo que LightGBM no es necesario en producción. Su probabilidad se promedia al 50/50 con una MLP 44→64→32→1 con ReLU, entrenada en PyTorch con entropía cruzada binaria sobre 4.000 proteínas de entrenamiento buscadas contra proteínas fuera de su clúster al 50% de identidad, y ejecutada en numpy puro. Cualquier entrada sin predicción recibe el EC más frecuente del entrenamiento.

## Capacidades

- Clasificación de secuencias proteicas en números EC de cuatro niveles (L1-L4) completamente especificados.
- Búsqueda exacta sobre 218.473 secuencias de referencia y 22,7 millones de secuencias TrEMBL/Swiss-Prot con EC anotado.
- Búsqueda de homología mediante MMseqs2 con dos niveles de sensibilidad.
- Ranking de candidatos EC mediante ensemble de LightGBM y MLP.
- Garantía de predicción no vacía: toda entrada recibe un EC perteneciente a `ec_vocabulary.json`.
- Ejecución exclusiva en CPU, sin necesidad de GPU, PyTorch ni LightGBM en tiempo de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Anotación funcional masiva de proteínas: dado un conjunto de secuencias procedentes de secuenciación metagenómica, el pipeline asigna un EC a cada una mediante búsqueda exacta o de homología, aprovechando las tablas de 22,7 millones de secuencias para maximizar la cobertura sin GPU.
- Enriquecimiento de bases de datos internas: integración en pipelines de anotación que necesiten completar el campo EC de entradas TrEMBL o de nuevos genomas, usando `predict.py` con entrada Parquet y salida JSONL.
- Priorización en estudios de enzimas: para un conjunto de candidatos enzimáticos, el ranker proporciona un EC con probabilidad asociada, útil para seleccionar qué secuencias validar experimentalmente.
- Docencia y prototipado en bioinformática: al ejecutarse solo en CPU y sin dependencias pesadas en runtime, sirve como referencia reproducible de un pipeline de clasificación enzimática.
- Clasificación de proteínas en entornos con recursos limitados: sin GPU, el sistema puede desplegarse en un portátil o en un contenedor pequeño, a diferencia de los transformers proteicos de gran escala.
- Evaluación comparativa de métodos de anotación: el repositorio incluye scripts separados (`features.py`, `gbdt.py`, `mlp.py`, `train_mlp.py`) que permiten reproducir y auditar cada etapa del pipeline.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| L4 en folds retenidos (homología) | 0,725-0,757 | Componentes completos al 50% de identidad |
| L4 en proteínas no presentes en Swiss-Prot | 0,61 | Estimación local |
| L4 en coincidencias exactas de entrenamiento | 0,9222 | Techo de 0,9223 |
| Cobertura tabla BRENDA > DE > CC | 87,9% | Proteínas de entrenamiento no en Swiss-Prot |
| L4 cuando hay cobertura (BRENDA > DE > CC) | 0,979 | Estimación local |
| Cobertura solo DE | 72,9% | — |
| L4 solo DE | 0,947 | Estimación local |

No se han publicado resultados oficiales de la competición Leak CURBER en la información disponible.

## Requisitos de hardware

- Inferencia exclusivamente en CPU; no requiere GPU.
- Espacio en disco: repositorio de 0,4 GB, incluyendo `trembl_lookup.npz` (365 MB) y la base de datos MMseqs2.
- Memoria RAM: no especificada; las tablas de hash de 22,7 millones de entradas y la base MMseqs2 requieren varios GB, aunque el valor exacto no está documentado.
- GPU recomendadas: no aplica.
- Cabe en cualquier equipo consumer con CPU moderna y suficiente RAM y disco.
- Despliegue: ejecución directa con `python predict.py --input val_inputs.parquet --output predictions.jsonl`; MMseqs2 se instala desde PyPI en tiempo de build (binario estático incluido en el wheel `pymmseqs`).
- Latencia y throughput: no disponibles; dependen del tamaño del lote, de la tasa de coincidencias exactas y de si se activa el segundo pase de MMseqs2.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Leak CURBER enzyme classification | Lookup + homología + ranker | MLP ~5.000 + LightGBM | No aplica | No disponible | Hugging Face (0 descargas) |
| Modelos proteicos tipo ESM-2 | Transformer proteico | 8M-15B | Longitud de secuencia variable | MIT (versiones abiertas) | Hugging Face |
| BLASTp + reglas EC | Alineamiento + transferencia | No aplica | No aplica | Dominio público / varias | Amplia |
| DeepEC / CLEAN | CNN / embeddings + EC | Millones | No aplica | MIT / varias | GitHub |

No se dispone de comparaciones directas de rendimiento entre este pipeline y las alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no responde a instrucciones en lenguaje natural.
- La licencia no está declarada en Hugging Face; el uso comercial queda sujeto a verificar los términos de MMseqs2 (GPLv3) y de los datos UniProtKB y ExPASy ENZYME (CC BY 4.0).
- La model card indica explícitamente que no se aplica "leak guard" en la tabla TrEMBL, lo que puede implicar solapamiento con datos de evaluación y sobreestimar el rendimiento real.
- Las métricas reportadas son estimaciones locales del autor, no resultados oficiales de la competición.
- El rendimiento cae notablemente en proteínas no presentes en Swiss-Prot (L4 0,61), por lo que la cobertura de la búsqueda exacta condiciona fuertemente la calidad.
- La asignación de EC por defecto (EC más frecuente del entrenamiento) para entradas sin hit puede introducir predicciones incorrectas de forma sistemática.
- El sistema depende de la versión concreta de UniProtKB (2026_03) y ExPASy ENZYME (02-Sep-2026); actualizaciones de estas bases requieren regenerar las tablas de lookup.
- Riesgo de sesgo hacia enzimas sobrerrepresentadas en las bases de datos y hacia las clases EC más frecuentes en el split de entrenamiento.
- No hay información sobre latencia, throughput ni consumo de memoria, lo que dificulta planificar despliegues a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/VenkataSreekar/leak-curber-brenda
- UniProtKB: https://www.uniprot.org/
- ExPASy ENZYME: https://enzyme.expasy.org/
- MMseqs2: https://github.com/soedinglab/MMseqs2
- LightGBM: https://github.com/microsoft/LightGBM
- BRENDA: https://www.brenda-enzymes.org/
