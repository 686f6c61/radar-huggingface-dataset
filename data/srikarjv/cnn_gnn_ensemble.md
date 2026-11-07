# srikarjv/CNN_GNN_ensemble

## Resumen

`CNN_GNN_ensemble` es un repositorio de Hugging Face publicado por el usuario `srikarjv` que, segun su model card, constituye un modelo de partida (starter) para la tarea de recuperacion de numeros EC (Enzyme Commission) del reto Leak CURBER. No se trata de un modelo de lenguaje generativo, sino de un artefacto orientado a un benchmark de clasificacion de reacciones quimicas: recibe un fichero Parquet con columnas `id` y `rxn_smiles` (SMILES de reaccion) y debe producir un fichero JSON Lines con una lista de numeros EC ordenados por probabilidad.

El repositorio tiene un tamano de 0,1 GB, no registra descargas ni likes en el momento de la consulta y no declara licencia, idiomas ni pipeline en los metadatos de Hugging Face. La model card describe principalmente el formato del reto, las reglas de evaluacion, el flujo de envio al leaderboard y las restricciones de ejecucion (CPU, 2 vCPU, 16 GB de RAM y 15 minutos), pero no detalla la arquitectura interna del ensemble CNN + GNN ni los datos de entrenamiento empleados.

La relevancia actual del artefacto es acotada: sirve como plantilla reproducible para participantes del leaderboard Leak CURBER y como ejemplo de empaquetado Docker de un modelo de inferencia sin GPU ni red. Para desarrolladores e investigadores interesados en prediccion de funciones enzimaticas a partir de reacciones, el interes esta en el formato de tarea y en las restricciones de evaluacion, no en unas capacidades generales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ensemble CNN + GNN (segun el nombre del repositorio; no se detalla en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye Dockerfile, predict.py y README.md; el peso concreto no se especifica) |

## Arquitectura y entrenamiento

El nombre del repositorio sugiere un ensemble de una red convolucional (CNN) y una red neuronal de grafos (GNN), una combinacion habitual para representar reacciones quimicas: la CNN puede procesar representaciones textuales o fingerprints del SMILES de reaccion, mientras que la GNN modela el grafo molecular de reactivos y productos. Sin embargo, la model card no confirma esta composicion, no describe el numero de capas, dimensiones ocultas, funcion de perdida ni estrategia de ensemble.

Respecto al entrenamiento, la model card solo indica que el modelo es un starter que el participante debe entrenar en su propio equipo y subir a un repositorio publico de Hugging Face. Los datos publicos son `train.parquet` (con etiqueta `ec_number`) y `val_inputs.parquet` (solo entradas); las etiquetas de validacion y los datos de test son privados. El vocabulario de ECs permitido proviene de ExPASy ENZYME, release 02-Sep-2026, bajo licencia CC BY 4.0. No se especifica el numero de tokens, la composicion del dataset, ni si hubo RLHF, DPO o cualquier otra fase de ajuste.

## Capacidades

- Prediccion de numeros EC a partir de SMILES de reaccion, con salida en formato JSON Lines.
- Clasificacion multietiqueta: una misma entrada puede tener varios ECs registrados y el modelo puede devolver hasta 10 predicciones ordenadas.
- Evaluacion jerarquica a niveles L1, L2, L3 y L4 de la taxonomia EC, con ranking basado en L4.
- Ejecucion en CPU exclusivamente, sin GPU y sin acceso a red durante la inferencia.
- Empaquetado reproducible mediante Docker (Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`).
- No se documentan capacidades de generacion de texto, razonamiento general, codigo, matematicas, vision, audio, tool calling ni agentes.

## Casos de uso

- Participacion en el leaderboard Leak CURBER: el repositorio sirve como plantilla para entrenar un modelo propio, empaquetarlo en Docker y enviarlo a la evaluacion de validacion y test del reto.
- Prediccion de funciones enzimaticas en pipelines de anotacion: dado un conjunto de reacciones en formato SMILES, el modelo puede generar candidatos de EC para su revision posterior por un experto.
- Clasificacion jerarquica de reacciones: la evaluacion a niveles L1-L4 permite usar el modelo en escenarios donde basta con la clase enzimatica de primer nivel (por ejemplo, oxidorreductasas frente a transferasas).
- Prototipado de modelos quimicos en entornos sin GPU: las restricciones de 2 vCPU, 16 GB de RAM y 15 minutos hacen que el artefacto sea adecuado para experimentar en portatiles o contenedores ligeros.
- Benchmarking interno de arquitecturas CNN/GNN: el formato de tarea y las metricas permiten comparar variantes de representacion de reacciones de forma estandarizada.
- Docencia y formacion en quimioinformatica: el flujo completo (descarga de datos, entrenamiento, Docker, envio al leaderboard) puede usarse como ejercicio practico de despliegue de modelos cientificos.
- Integracion en herramientas de curacion de bases de datos enzimaticas: el modelo puede priorizar candidatos EC para reducir el esfuerzo manual de anotacion, siempre con validacion humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe el baseline (prediccion del EC mas frecuente en entrenamiento) y las metricas del leaderboard (top-1 accuracy a niveles L4, L3, L2 y L1), pero no incluye puntuaciones del modelo `CNN_GNN_ensemble` ni comparaciones numericas con otras propuestas.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: el evaluador asigna 2 vCPU y 16 GB de RAM, sin GPU y sin red.
- Limite temporal de 15 minutos para todos los inputs, incluyendo la carga del modelo y la inferencia.
- GPU recomendadas: no aplica; el entorno de evaluacion no dispone de GPU.
- Compatibilidad con GPU de consumo: no disponible; el modelo esta disenado para ejecutarse en CPU.
- Opciones de despliegue: Docker (obligatorio para el leaderboard), con Python en `/usr/local/bin/python` y comando `python /app/predict.py --input INPUT --output OUTPUT`.
- Latencia y throughput estimados: no disponibles; dependen del modelo concreto que el participante entrene y del tamano del conjunto de entrada.
- Restricciones de empaquetado: imagen construida en menos de 30 minutos, repositorio de 4 GiB o menos y ficheros de salida de 16 MiB o menos por archivo.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de prediccion de numeros EC ni resultados de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La model card no describe la arquitectura, los pesos ni los datos de entrenamiento; no es posible verificar el comportamiento real del ensemble CNN + GNN a partir de la informacion disponible.
- No se declara licencia, lo que impide confirmar si el uso comercial esta permitido.
- El repositorio no registra descargas ni likes, y no hay evidencia de validacion independiente fuera del leaderboard.
- Riesgo de alucinacion en sentido estricto no aplica (no es un modelo generativo), pero si existe riesgo de predicciones EC incorrectas o de baja confianza, especialmente en reacciones poco representadas en entrenamiento.
- La evaluacion solo cuenta la primera prediccion EC; listar hasta 10 candidatos no mejora la puntuacion, lo que limita el uso de estrategias de ranking extensas.
- El modelo debe ejecutarse sin red y en CPU, con un limite estricto de 15 minutos y 16 GB de RAM; modelos grandes o pipelines costosos pueden agotar el tiempo.
- Solo se evalua top-1 accuracy a niveles L4-L1; no se miden calibracion, cobertura ni rendimiento en clases raras.
- El vocabulario EC esta fijado a ExPASy ENZYME release 02-Sep-2026; predicciones fuera de ese vocabulario invalidan la evaluacion.
- Los datos de validacion y test son privados, por lo que el participante no puede inspeccionar la distribucion real de evaluacion.
- La fecha de creacion del repositorio (2026-11-07) y la referencia a una release de ExPASy de 2026 deben tratarse con cautela si se contrastan con fuentes externas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/srikarjv/CNN_GNN_ensemble
- Modelo starter del reto: https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignacion de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
- Referencia general sobre ensemble learning (IBM): https://www.ibm.com/think/topics/ensemble-learning
