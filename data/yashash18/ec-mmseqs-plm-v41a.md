# Yashash18/ec-mmseqs-plm-v41a

## Resumen

Yashash18/ec-mmseqs-plm-v41a es un modelo publicado en Hugging Face con el identificador de repositorio indicado, orientado a la clasificacion de enzimas mediante numeros EC (Enzyme Commission). El repositorio ocupa 2,3 GB y contiene pesos en formato ONNX, segun las etiquetas del propio repositorio. El autor es el usuario Yashash18 y el modelo se enmarca en el contexto del leaderboard Leak CURBER, una competicion de clasificacion enzimatica descrita en la model card.

La model card disponible no describe la arquitectura interna del modelo ni los datos de entrenamiento utilizados. Se trata de un artefacto derivado de un modelo de lenguaje proteico (PLM, protein language model), a juzgar por el sufijo "plm" del identificador y por el prefijo "mmseqs", que sugiere un preprocesado o clustering de secuencias con MMseqs2. El modelo debe predecir numeros EC a partir de secuencias de aminoacidos, con evaluacion top-1 a niveles L4, L3, L2 y L1.

La relevancia actual del modelo radica en su participacion en un entorno de evaluacion estandarizado con restricciones estrictas de computo (CPU unicamente, 2 vCPU, 16 GB de RAM, 15 minutos para toda la inferencia), lo que lo convierte en un ejemplo de modelo proteico optimizado para despliegue en entornos sin GPU. No obstante, la informacion publica disponible es muy limitada: no se detallan arquitectura, parametros, contexto, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje proteico, segun el identificador "plm") |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en ONNX; cuantizacion no especificada) |
| Idiomas soportados | no disponible (la entrada son secuencias de aminoacidos, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX |
| Tamano del repositorio | 2,3 GB |
| Tarea | clasificacion enzimatica (prediccion de numeros EC) |
| Entorno de evaluacion | CPU, 2 vCPU, 16 GB RAM, 15 minutos, sin red |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. El identificador "ec-mmseqs-plm-v41a" sugiere un modelo de lenguaje proteico (PLM) entrenado o ajustado sobre secuencias procesadas con MMseqs2, una herramienta habitual para agrupar secuencias homologas y reducir redundancia en datasets proteicos. El sufijo "v41a" podria indicar una version o variante concreta del entrenamiento, pero no se documenta.

Tampoco se detallan los datos de entrenamiento, el numero de tokens o residuos procesados, la composicion del dataset, ni si se aplicaron tecnicas de ajuste fino supervisado, RLHF o DPO. La model card se limita a describir el formato de la tarea, la metrica de evaluacion y los requisitos de empaquetado Docker para el leaderboard, sin entrar en detalles del modelo en si. Los pesos estan en ONNX, lo que indica una exportacion orientada a inferencia en CPU.

## Capacidades

- Prediccion de numeros EC a partir de secuencias de aminoacidos de enzimas.
- Salida en formato JSON Lines con los campos `id` y `prediction`, donde `prediction` es una lista de hasta 10 numeros EC ordenados por preferencia.
- Evaluacion top-1 a cuatro niveles jerarquicos de EC: L4 (nivel completo), L3, L2 y L1.
- Manejo de entradas con multiples numeros EC registrados mediante puntuacion parcial (1/n por cada EC registrado que coincida en los primeros componentes).
- Inferencia en CPU sin GPU y sin acceso a red, con limites estrictos de tiempo y memoria.
- Capacidad de ser empaquetado como imagen Docker con un `predict.py` que implementa la interfaz `--input` / `--output`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Anotacion automatica de enzimas en pipelines de metagenomica: el modelo puede recibir un Parquet con identificadores y secuencias proteicas y producir predicciones EC en JSON Lines, integrable en flujos de anotacion funcional a gran escala.
- Clasificacion enzimatica en entornos sin GPU: al ejecutarse en CPU con 2 vCPU y 16 GB de RAM, encaja en servidores modestos o contenedores de CI donde no hay aceleradores disponibles.
- Participacion en el leaderboard Leak CURBER: el modelo sirve como artefacto de envio, con Dockerfile, `predict.py` y pesos incluidos, cumpliendo los requisitos de tamano de repositorio (4 GiB) y de build (30 minutos).
- Filtrado previo de candidatos enzimaticos: dado que la salida admite hasta 10 ECs ordenados, puede usarse para priorizar hipotesis funcionales antes de validacion experimental.
- Evaluacion comparativa de modelos proteicos: la metrica jerarquica L1-L4 permite comparar este modelo con alternativas en la misma tarea bajo condiciones controladas.
- Generacion de datasets etiquetados de forma debil: las predicciones top-1 pueden servir como pseudoetiquetas para entrenamiento posterior o para enriquecer bases de datos internas.
- Despliegue en pipelines de contenedores aislados: la restriccion de red nula y el uso de `/tmp` para temporales facilitan su integracion en entornos con politicas de seguridad estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe la metrica del leaderboard (top-1 accuracy a niveles L4, L3, L2 y L1, con ranking por L4) y menciona un baseline trivial que predice el EC mas frecuente del conjunto de entrenamiento, pero no se proporcionan puntuaciones del modelo evaluado ni comparaciones numericas.

## Requisitos de hardware

- VRAM: no aplica; la evaluacion del leaderboard se ejecuta exclusivamente en CPU.
- CPU: 2 vCPU asignados por el evaluador; el modelo debe completar toda la inferencia en 15 minutos, incluyendo carga del modelo.
- Memoria RAM: 16 GB maximos en el entorno de evaluacion.
- GPU recomendadas: no disponibles; el modelo esta pensado para inferencia en CPU.
- Compatibilidad con GPU consumer: no disponible; no se documenta si los pesos ONNX pueden ejecutarse en GPU.
- Opciones de despliegue: ONNX Runtime (formato de pesos), contenedor Docker con Python en `/usr/local/bin/python` y directorio de trabajo `/app`, comando `python /app/predict.py --input INPUT --output OUTPUT`.
- Latencia y throughput: no disponibles; el unico limite conocido es el presupuesto global de 15 minutos por evaluacion completa.
- Restricciones de empaquetado: repositorio de 4 GiB o menos, build de 30 minutos o menos, ningun fichero escrito por `predict.py` puede superar 16 MiB, sin red durante la inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria, ni datos de parametros, contexto, rendimiento o licencia de alternativas. El unico elemento de comparacion mencionado es el baseline trivial del leaderboard, que predice el EC mas frecuente del conjunto de entrenamiento y no utiliza la secuencia de entrada.

## Limitaciones y advertencias

- Informacion publica muy escasa: no se documentan arquitectura, parametros, contexto, licencia ni idiomas, lo que dificulta evaluar su idoneidad para produccion.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion de los pesos.
- Entrada limitada a secuencias de aminoacidos: no es un modelo de texto natural ni multimodal.
- Solo la primera prediccion EC cuenta para la puntuacion top-1; las hasta 10 predicciones adicionales no alteran el resultado.
- Dependencia de la taxonomia EC de referencia (`ec_vocabulary.json`, ExPASy ENZYME release 02-Sep-2026): predicciones fuera de ese vocabulario invalidan la evaluacion.
- Restricciones duras de inferencia: CPU unicamente, 2 vCPU, 16 GB RAM, 15 minutos, sin red; cualquier incumplimiento provoca fallo de evaluacion.
- Riesgo de alucinacion o prediccion incorrecta de ECs no verificados experimentalmente; las salidas deben tratarse como hipotesis.
- Sesgos desconocidos: no se documenta la composicion del dataset de entrenamiento ni posibles desequilibrios taxonomicos.
- Limitaciones de contexto o idioma: no disponibles.
- El modelo parece estar disenado especificamente para el entorno del leaderboard Leak CURBER, no como modelo de proposito general.

## Enlaces

- Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v41a
- Leaderboard Leak CURBER (Space): https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Repositorio starter del leaderboard: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset del leaderboard: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Hoja de asignacion de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
