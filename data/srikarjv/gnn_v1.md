# srikarjv/GNN_v1

## Resumen

`srikarjv/GNN_v1` es un repositorio de Hugging Face publicado como modelo de arranque ("starter") para la tarea de recuperación de números EC (Enzyme Commission) del reto Leak CURBER. No se trata de un modelo de lenguaje ni de una red neuronal preentrenada con pesos publicados: el repositorio no contiene artefactos de modelo (tamaño 0.0 GB) y su model card describe el procedimiento para entrenar y enviar un modelo propio a la clasificación de enzimas a partir de reacciones químicas en formato SMILES.

La tarea consiste en recibir un fichero Parquet con columnas `id` y `rxn_smiles` y predecir un número EC por cada entrada única, devolviendo JSON Lines con las claves `id` y `prediction`. El baseline descrito ignora la entrada y predice el EC más frecuente del conjunto de entrenamiento, por lo que sirve como referencia mínima, no como solución real. La evaluación se realiza en CPU (2 vCPU, 16 GB de RAM, 15 minutos) dentro de un contenedor Docker, sin GPU ni red.

Su relevancia es la de un esqueleto reproducible para participar en un leaderboard de anotación enzimática: fija el formato de entrada/salida, las reglas de agrupación de entradas duplicadas, la métrica (top-1 accuracy a niveles L4, L3, L2 y L1, ordenando por L4) y las restricciones de empaquetado. No aporta arquitectura, parámetros ni contexto porque no es un modelo entrenado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de arranque; baseline de frecuencia, no red neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: reacción SMILES; no hay contexto de tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la tarea es química, no lingüística) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos; baseline en `weights/baseline.json`) |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura de modelo. El baseline incluido es un clasificador trivial que predice el EC más frecuente del conjunto de entrenamiento para cualquier entrada, entrenado con `train.py --train ../data/train.parquet --output weights/baseline.json`. Los datos públicos son `train.parquet` (con etiqueta `ec_number`, una pareja entrada–EC por fila) y `val_inputs.parquet` (solo entradas); las etiquetas de validación y los datos de test son privados.

El vocabulario de EC permitido proviene de ExPASy ENZYME, release 02-Sep-2026, publicado por SIB bajo CC BY 4.0. Las entradas idénticas se agrupan dentro de cada split conservando el primer ID y puntuando cada entrada única una sola vez; no se deben canonicalizar las reacciones. La métrica reparte el crédito entre los EC registrados de una entrada (1/n por cada EC cuyo prefijo coincida con la primera predicción) y solo cuenta la primera predicción, aunque se permitan hasta 10.

## Capacidades

- Predicción de números EC a partir de reacciones SMILES (`rxn_smiles`), con salida en JSON Lines (`id`, `prediction`).
- Clasificación jerárquica evaluada a cuatro niveles: L4 (completo), L3, L2 y L1.
- Soporte de múltiples EC registrados por entrada mediante puntuación fraccionada.
- Ejecución en CPU pura, sin GPU ni acceso a red, dentro de un contenedor Docker.
- Empaquetado reproducible: `Dockerfile`, `predict.py`, `requirements.txt` y pesos en el propio repositorio.
- No incluye tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Anotación enzimática automática: dado un conjunto de reacciones, predecir el EC más probable para cada una y priorizar la revisión manual en las de menor confianza.
- Participación en el leaderboard Leak CURBER: usar el repositorio como plantilla para entrenar un modelo propio (por ejemplo, fingerprints + clasificador, GNN o modelo químico) y enviarlo a validación.
- Benchmark interno de modelos químicos: comparar enfoques de clasificación de reacciones bajo un protocolo fijo (top-1 a L4/L3/L2/L1, agrupación de entradas duplicadas, límite de 15 minutos en CPU).
- Prototipado rápido de pipelines de quimioinformática: el contrato de entrada/salida y el `Dockerfile` permiten integrar el predictor en flujos existentes sin reescribir el formato.
- Reproducibilidad de experimentos: el baseline de frecuencia sirve como cota inferior para verificar que un pipeline de evaluación funciona antes de invertir en un modelo real.
- Validación de infraestructura de evaluación: el contenedor con 2 vCPU, 16 GB de RAM y 15 minutos permite comprobar que un modelo cabe en el presupuesto antes de enviarlo.
- Docencia y ejercicios de clasificación química: el esqueleto ilustra el ciclo completo de entrenamiento, empaquetado y envío a un leaderboard.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo define la métrica (top-1 accuracy a L4, L3, L2 y L1, ordenando por L4) y el baseline de frecuencia, sin cifras numéricas.

## Requisitos de hardware

- Inferencia en CPU exclusivamente: 2 vCPU y 16 GB de RAM asignados por el evaluador.
- Sin GPU y sin red durante la evaluación.
- Límite de 15 minutos para todos los inputs, incluyendo descarga de imagen, carga de modelo e inferencia.
- Imagen Docker Linux x86-64, Python en `/usr/local/bin/python`, directorio de trabajo `/app`.
- Construcción de la imagen en 30 minutos como máximo; repositorio de 4 GiB o menos.
- Ningún fichero escrito por `predict.py` puede superar 16 MiB; usar `/tmp` para temporales.
- Opciones de despliegue: Docker (obligatorio para la evaluación); `huggingface-hub` 2.2.0 para descarga de datos y modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (clasificación de reacciones a números EC) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni arquitectura: es un esqueleto, no un modelo entrenado.
- El baseline predice el EC más frecuente e ignora la entrada; su utilidad es solo como cota inferior.
- Solo cuenta la primera predicción; listar hasta 10 EC no mejora la puntuación.
- No se deben canonicalizar las reacciones; hacerlo puede invalidar la evaluación.
- Las entradas duplicadas deben predecirse una sola vez (primer ID); duplicar, omitir o añadir IDs provoca fallo de evaluación.
- Las predicciones deben usar exclusivamente ECs de `ec_vocabulary.json` (ExPASy ENZYME, release 02-Sep-2026); un EC fuera del vocabulario invalida la evaluación.
- Límites de envío: 2 envíos por día y 20 en total por tarea; los fallos consumen cuota y solo una evaluación puede estar activa a la vez.
- La licencia del repositorio no está declarada; verificar antes de cualquier uso comercial.
- Sin datos sobre sesgos, alucinación o cobertura idiomática, al no ser un modelo de lenguaje.

## Enlaces

- Repositorio del modelo: https://huggingface.co/srikarjv/GNN_v1
- Modelo de arranque del reto: https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME: https://enzyme.expasy.org/
