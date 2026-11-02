# Yashash18/ec-mmseqs-plm-v44

## Resumen

`Yashash18/ec-mmseqs-plm-v44` es un repositorio de Hugging Face publicado por el usuario Yashash18 que se presenta como un modelo de clasificación enzimática (predicción de números EC, Enzyme Commission) para el reto Leak CURBER. El repositorio contiene pesos en formato ONNX y ocupa 2,3 GB, lo que sugiere que se apoya en un modelo de lenguaje de proteínas (PLM) preentrenado sobre secuencias de UniProt/MMseqs, aunque la model card no documenta explícitamente la arquitectura, el número de parámetros ni el proceso de entrenamiento. La información disponible es fundamentalmente la de un "starter" del reto, no una ficha técnica completa del modelo.

El problema que aborda es la anotación automática de enzimas: dado un fichero Parquet con columnas `id` y `sequence` (secuencia de aminoácidos), el modelo debe devolver un JSON Lines con `id` y una lista ordenada de números EC (hasta 10, aunque solo cuenta la primera predicción). La evaluación se realiza sobre inputs únicos agrupados por secuencia, con métricas top-1 a niveles EC L4, L3, L2 y L1, y el ranking se ordena por precisión en L4. El vocabulario permitido proviene de ExPASy ENZYME (release 02-Sep-2026, licencia CC BY 4.0 de SIB).

La relevancia actual es doble: por un lado, la clasificación EC es una tarea central en biología computacional y en el diseño de pipelines de anotación funcional; por otro, el formato del reto impone restricciones de despliegue muy concretas (CPU únicamente, 2 vCPU, 16 GB de RAM, 15 minutos para todos los inputs, sin red), lo que convierte al modelo en un caso de estudio de inferencia eficiente en entornos sin GPU. El repositorio, sin descargas ni likes en el momento de la consulta, parece una entrega temprana o de prueba dentro del leaderboard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (repo con pesos ONNX; presumiblemente PLM basado en transformer, no confirmado) |
| Parámetros totales | No disponible |
| Parámetros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (formato de pesos ONNX) |
| Idiomas soportados | No disponible (la tarea es sobre secuencias de aminoácidos, no texto natural) |
| Licencia | No disponible |
| Formato de pesos | ONNX |
| Tamaño del repositorio | 2,3 GB |
| Pipeline de Hugging Face | No disponible |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-02 |
| Fecha de actualización | 2026-11-02 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. El nombre del repositorio (`ec-mmseqs-plm-v44`) sugiere el uso de MMseqs2 para agrupar o filtrar secuencias (probablemente para evitar fugas entre splits, en línea con el nombre del reto "Leak CURBER") y de un modelo de lenguaje de proteínas como base, pero esto es una inferencia a partir del identificador y no un dato confirmado en la documentación. El único dato técnico firme es la presencia de pesos en formato ONNX, lo que indica una exportación orientada a inferencia en CPU con el runtime de ONNX Runtime o similar.

El entrenamiento se enmarca en el protocolo del reto: los datos públicos son `train.parquet` (con etiqueta `ec_number`) y `val_inputs.parquet` (solo entradas), mientras que las etiquetas de validación y el conjunto de test son privados. El autor no documenta hiperparámetros, función de pérdida, estrategia de aumento de datos ni presupuesto de cómputo. Tampoco se especifica si el modelo usa la jerarquía EC de forma explícita (por ejemplo, con cabezas de clasificación a nivel L1-L4) o si simplemente predice la etiqueta completa.

## Capacidades

- Clasificación de secuencias de aminoácidos en números EC (predicción top-1, con hasta 10 candidatos por input).
- Salida en formato JSON Lines con las claves `id` y `prediction`, conforme al contrato del reto.
- Manejo de inputs agrupados por secuencia idéntica (se predice solo el primer ID de cada grupo).
- Inferencia en CPU dentro de un contenedor Docker sin red, con límites de 2 vCPU, 16 GB de RAM y 15 minutos.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, audio, tool calling, agentes ni multilingüismo; la tarea es exclusivamente de clasificación de proteínas.

## Casos de uso

- Anotación funcional de genomas y metagenomas: el modelo se usaría como clasificador de secuencias proteicas para asignar números EC en pipelines de anotación, sustituyendo o complementando herramientas como eggNOG-mapper o PRIAM en pasos donde se requiere una predicción rápida en CPU.
- Cribado de enzimas en librerías metagenómicas: dado un conjunto de secuencias candidatas, el modelo devuelve una lista ordenada de ECs que permite priorizar experimentos de caracterización bioquímica.
- Enriquecimiento de bases de datos internas: integración en un proceso batch que recorre un Parquet de secuencias y genera un JSONL con predicciones para su carga en un catálogo de enzimas.
- Participación en el leaderboard Leak CURBER: el repositorio está diseñado como entrega para el reto, de modo que el caso de uso inmediato es la evaluación comparativa frente a otros modelos en las métricas L1-L4.
- Docencia y experimentación con modelos de proteínas: al ser un "starter" con Dockerfile y `predict.py`, sirve como plantilla para que equipos prueben su propio modelo bajo restricciones de CPU y memoria.
- Despliegue en entornos sin GPU: gracias a los pesos ONNX y a los límites del evaluador, el modelo es adecuado para servidores modestos o clústeres de CPU donde no hay aceleradores disponibles.
- Validación cruzada de anotaciones existentes: las predicciones top-1 pueden contrastarse con anotaciones curadas para detectar discrepancias y priorizar revisiones manuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe la métrica del reto (top-1 accuracy a niveles EC L4, L3, L2 y L1, con ranking por L4) y el baseline trivial que predice el EC más frecuente del conjunto de entrenamiento, pero no incluye cifras de este modelo ni comparaciones con otros participantes.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el evaluador del reto no dispone de GPU y el modelo se ejecuta en CPU.
- GPU recomendadas: no disponibles; el diseño del reto excluye GPU.
- ¿Cabe en GPU de consumo? No relevante para el despliegue previsto, aunque el tamaño del repo (2,3 GB) sugiere que una GPU con 8-16 GB podría cargar los pesos si se exportan a otro runtime; no hay datos que lo confirmen.
- Opciones de despliegue: contenedor Docker con Python en `/usr/local/bin/python`, directorio de trabajo `/app`, comando `python /app/predict.py --input INPUT --output OUTPUT`; runtime ONNX para los pesos; sin red durante la inferencia.
- Límites del evaluador: 2 vCPU, 16 GB de RAM, 15 minutos para todos los inputs, build de imagen en 30 minutos, repositorio de hasta 4 GiB, ficheros de salida de hasta 16 MiB.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de clasificación EC comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia del ecosistema, existen herramientas consolidadas de anotación enzimática (PRIAM, eggNOG-mapper, CLEAN, CatFam) y modelos PLM ajustados para EC, pero no se dispone de sus cifras en esta ficha ni de una evaluación común con este repositorio.

## Limitaciones y advertencias

- La model card no documenta arquitectura, parámetros, entrenamiento ni licencia; la evaluación técnica del modelo queda muy limitada.
- Licencia no disponible: no puede asumirse uso comercial sin consultar al autor.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de validación externa.
- El modelo está diseñado para un contrato de entrada/salida muy específico (Parquet de entrada, JSONL de salida, IDs únicos agrupados); cualquier uso fuera de ese contrato requiere adaptación.
- Solo cuenta la primera predicción EC; el resto de la lista (hasta 10) no mejora la puntuación, lo que limita la utilidad de la salida ordenada en el ranking.
- Riesgo de alucinación en el sentido de asignar ECs plausibles pero incorrectos, especialmente en secuencias con homología lejana o en familias enzimáticas poco representadas; no hay datos de calibración ni de cobertura.
- El vocabulario EC está fijado a ExPASy ENZYME release 02-Sep-2026; ECs nuevas o retiradas fuera de ese vocabulario no son predicibles.
- Restricciones de despliegue duras: sin GPU, sin red, 15 minutos para todos los inputs; modelos más grandes o pipelines con pasos costosos pueden agotar el tiempo.
- No se documentan sesgos ni limitaciones idiomáticas porque la tarea no es de texto natural, pero sí puede haber sesgo hacia las familias enzimáticas sobrerrepresentadas en `train.parquet`.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Yashash18/ec-mmseqs-plm-v44
- Leaderboard Leak CURBER: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Repositorio starter del reto: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
