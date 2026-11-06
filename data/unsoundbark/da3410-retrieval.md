# unsoundbark/da3410-retrieval

## Resumen

DA3410-retrieval es un artefacto de participacion en una competicion de retrieval de enzimas (prediccion de numeros EC a partir de reacciones quimicas representadas en formato SMILES) publicado por el usuario unsoundbark en Hugging Face. No se trata de un modelo de lenguaje generativo al uso, sino de un pipeline de inferencia empaquetado: el repositorio contiene un script `predict.py` que se ejecuta en CPU y en modo offline, toma un fichero Parquet con columnas `id` y `rxn_smiles` y devuelve un JSON Lines con `id` y `prediction`.

El autor no documenta arquitectura, tamano de parametros ni metodologia de entrenamiento mas alla de indicar el dataset de entrenamiento (`starkAhmed43/leak-curber-enzyme-retrieval`, revision fijada) y el vocabulario de etiquetas EC procedente de ExPASy ENZYME release 02-Sep-2026 bajo licencia CC BY 4.0. El repositorio ocupa 0,1 GB, lo que sugiere que los pesos, si existen, son de pequeno tamano o que el artefacto incluye principalmente artefactos auxiliares (indices, embeddings o modelos clasicos serializados).

La relevancia de esta ficha es limitada para evaluacion de modelos fundacionales: no hay model card tecnica, no hay benchmarks publicados, no hay pipeline declarado ni licencia explicita del artefacto. Se documenta como referencia para quienes rastreen submissions de competiciones de quimica computacional y necesiten conocer el contrato de entrada/salida del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el vocabulario EC subyacente es CC BY 4.0, pero la licencia del artefacto no se declara) |
| Formato de pesos | no disponible (el repo contiene un script `predict.py` y artefactos auxiliares; tamano total 0,1 GB) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del artefacto. La model card unicamente describe el contrato de ejecucion: `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`, ejecutable en CPU y en modo offline, lo que descarta dependencias de red en inferencia. El repositorio pesa 0,1 GB, compatible con modelos clasicos de clasificacion/retrieval (por ejemplo, representaciones vectoriales de reacciones y un clasificador sobre el vocabulario EC) o con un transformer muy pequeno, pero el autor no lo especifica.

En cuanto a datos de entrenamiento, se cita `starkAhmed43/leak-curber-enzyme-retrieval` en la revision `3c539869744d0a28976276dd19d11c4fd4cc7a36`. El espacio de etiquetas proviene de ExPASy ENZYME release 02-Sep-2026 (SIB, CC BY 4.0), obtenido a traves del starter de los organizadores. No se documenta numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de ajuste.

## Capacidades

- Prediccion de numeros EC (clasificacion en el vocabulario ExPASy ENZYME) a partir de reacciones en formato `rxn_smiles`.
- Procesamiento por lotes: entrada en Parquet con columnas `id` y `rxn_smiles`, salida en JSON Lines con `id` y `prediction`.
- Ejecucion en CPU y en modo offline, sin llamadas a servicios externos durante la inferencia.
- Interfaz de linea de comandos con rutas de entrada y salida configurables.
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Anotacion automatizada de enzimas en pipelines de bioinformatica: dado un conjunto de reacciones bioquimicas en `rxn_smiles`, el artefacto devuelve una etiqueta EC por reaccion, util para enriquecer bases de datos metabolicas.
- Pre-filtrado en curacion manual de anotaciones enzimaticas: el modelo genera candidatos EC que un experto revisa, reduciendo el coste de clasificacion manual en catalogos como ExPASy.
- Integracion en pipelines de reconstruccion de redes metabolicas: la asignacion EC por reaccion permite mapear reacciones a enzimas y completar modelos a escala genomica.
- Evaluacion comparativa de submissions en competiciones de retrieval enzimatico: el contrato Parquet/JSONL permite ejecutar el artefacto como baseline reproducible frente a otros metodos.
- Procesamiento batch offline en entornos sin conectividad: al ejecutarse en CPU y sin red, encaja en clusters aislados o entornos regulados donde no se permite descargar modelos en tiempo de ejecucion.
- Reproducibilidad de experimentos academicos: la revision fijada del dataset de entrenamiento y la version concreta del vocabulario EC permiten reconstruir el contexto experimental de la submission.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card indica ejecucion en CPU, por lo que no requiere GPU.
- GPU recomendadas: no aplica segun la documentacion del autor.
- Compatibilidad con GPU de consumo: no disponible; el artefacto esta pensado para CPU.
- Opciones de despliegue: ejecucion directa mediante `python /app/predict.py --input INPUT.parquet --output OUTPUT.jsonl`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; dependen del tamano del lote y del hardware, sin cifras publicadas.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (retrieval de numeros EC a partir de reacciones) con parametros, contexto o licencia documentados.

## Limitaciones y advertencias

- Ausencia total de model card tecnica: no se especifican arquitectura, parametros, datos de entrenamiento ni metodologia, lo que impide evaluar su calidad de forma independiente.
- Licencia del artefacto no declarada: no se puede asumir uso comercial permitido; el vocabulario EC subyacente es CC BY 4.0, pero eso no cubre los pesos ni el codigo del repositorio.
- Sin benchmarks ni metricas publicadas: no hay evidencia cuantitativa de rendimiento en la tarea de retrieval enzimatico.
- Riesgo de sobreajuste al dataset de entrenamiento concreto (`leak-curber-enzyme-retrieval`); no se documenta validacion en dominios externos.
- Dependencia de la version del vocabulario EC (release 02-Sep-2026): cambios posteriores en ExPASy pueden invalidar parte de las etiquetas.
- El contrato de entrada exige el formato exacto `rxn_smiles` en Parquet; entradas mal formadas o con esquemas distintos no estan cubiertas por la documentacion.
- El nombre del dataset de entrenamiento ("leak-curber") sugiere un esfuerzo por evitar fugas de datos, pero no se detalla la metodologia aplicada.
- No apto como modelo de lenguaje general: no soporta generacion de texto, tool calling ni razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unsoundbark/da3410-retrieval
- Dataset de entrenamiento citado: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Vocabulario EC (ExPASy ENZYME): https://enzyme.expasy.org/
