# Yashash18/ec-mmseqs-plm-v41b

## Resumen

Yashash18/ec-mmseqs-plm-v41b es un modelo publicado en Hugging Face por el usuario Yashash18, etiquetado como modelo de arranque (starter) para la tarea de clasificación de enzimas del reto Leak CURBER. El modelo recibe secuencias de aminoácidos de enzimas y debe predecir su número EC (Enzyme Commission), una clasificación jerárquica de cuatro niveles que identifica la actividad catalítica de una enzima. El repositorio tiene un tamaño de 2,3 GB y los pesos se distribuyen en formato ONNX, lo que sugiere un modelo de proteínas (protein language model, PLM) exportado para inferencia en CPU.

El nombre del repositorio incluye la referencia "mmseqs", lo que apunta a que el autor ha podido usar agrupamiento por similitud de secuencias con MMseqs2 durante el entrenamiento, una práctica habitual para evitar fugas de datos (data leakage) entre los conjuntos de entrenamiento y validación. El sufijo "plm-v41b" sugiere un protein language model de la familia de variantes con aproximadamente 41 millones de parámetros, aunque este dato no está confirmado en la información disponible.

La relevancia del modelo es acotada: se trata de una entrega de un participante en un leaderboard de investigación, no de un modelo de propósito general. Su interés radica en que ejemplifica el flujo de trabajo de los retos de clasificación enzimática con restricciones de inferencia estrictas (CPU, 2 vCPU, 16 GB de RAM, 15 minutos y sin red), y en que el formato ONNX facilita el despliegue en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer tipo protein language model; no confirmado) |
| Parametros totales | no disponible (el sufijo "v41b" sugiere ~41 M, sin confirmar) |
| Parametros activos | no aplica (no se ha confirmado que sea MoE) |
| Longitud de contexto | no disponible (depende de la longitud máxima de secuencia de aminoácidos admitida) |
| Tipos de cuantizacion | no disponible (pesos en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo sobre secuencias de proteínas, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna en la documentación proporcionada. El repositorio se etiqueta como "plm" (protein language model) y se distribuye en ONNX, lo que indica una exportación orientada a inferencia en CPU. El nombre "mmseqs" sugiere que el autor aplicó agrupamiento de secuencias con MMseqs2, presumiblemente para construir particiones de entrenamiento y validación libres de fugas (el reto se llama precisamente Leak CURBER, es decir, "frenador de fugas").

La model card no documenta el número de tokens de entrenamiento, la composición del corpus proteico, ni si se aplicaron técnicas de ajuste fino supervisado o aprendizaje por transferencia desde un PLM preentrenado. Tampoco se detalla si hubo aumentación de datos o estrategias de desbalanceo de clases, aspecto crítico en clasificación EC porque la distribución de números EC está fuertemente sesgada hacia unas pocas familias enzimáticas. Toda esta información debe considerarse no disponible.

## Capacidades

- Predicción de números EC a partir de secuencias de aminoácidos, con salida de hasta 10 EC distintos ordenados por confianza (solo el primero puntúa).
- Clasificación jerárquica evaluable a cuatro niveles: L4 (número EC completo), L3, L2 y L1.
- Manejo de entradas con múltiples EC registrados mediante puntuación parcial (1/n por cada EC coincidente en los primeros L componentes).
- Inferencia en CPU sin red, con un presupuesto máximo de 15 minutos para todo el conjunto de entradas.
- Empaquetado reproducible mediante Docker con Python en /usr/local/bin/python y directorio de trabajo /app.
- No se documentan capacidades de tool calling, agentes, visión, audio ni generación de texto libre; el modelo es específico de la tarea de clasificación enzimática.

## Casos de uso

- Anotación funcional de genomas y metagenomas: dado un catálogo de secuencias proteicas predichas, el modelo asigna un EC candidato a cada enzima, lo que permite priorizar dianas para validación experimental y acelerar la curaduría manual en bases de datos como ExPASy ENZYME.
- Enriquecimiento de pipelines de anotación tipo UniProt o MGnify: el modelo puede insertarse como paso de clasificación EC dentro de flujos existentes, aportando una etiqueta jerárquica (L1-L4) que se puede cruzar con anotaciones de InterPro o Pfam.
- Detección de enzimas con actividad desconocida o mal anotada: al comparar la predicción del modelo con la anotación existente, se pueden señalar candidatos a revisión, especialmente en familias con EC ambiguos.
- Investigación en biología sintética: para diseñar rutas metabólicas, el modelo ayuda a asignar funciones catalíticas plausibles a proteínas candidatas antes de ensayos in vitro, reduciendo el espacio de búsqueda experimental.
- Participación y reproducción en el leaderboard Leak CURBER: el repositorio sirve como plantilla funcional (Dockerfile, predict.py, requisitos) para que otros equipos compitan o reproduzcan la línea base con un modelo PLM real en lugar del baseline de frecuencia.
- Evaluación comparativa de representaciones proteicas: al ser un modelo pequeño en ONNX, permite medir en condiciones de CPU el coste/beneficio de un PLM frente a métodos basados en alineamiento (BLAST, MMseqs2) en la tarea de clasificación EC.
- Docencia y experimentación con restricciones de recursos: el formato ONNX y el límite de 16 GB de RAM y 2 vCPU lo hacen adecuado para prácticas en las que se enseña a optimizar inferencia sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el sistema de puntuación del leaderboard (top-1 accuracy a niveles L4, L3, L2 y L1, con ranking por L4) y el baseline trivial que predice el EC más frecuente del conjunto de entrenamiento, pero no incluye las puntuaciones obtenidas por este modelo concreto.

## Requisitos de hardware

- VRAM estimada: no aplica para inferencia en GPU; el modelo está pensado para CPU. El repositorio ocupa 2,3 GB, por lo que el peso en memoria de los pesos ONNX estará en ese orden de magnitud o algo menos tras la carga.
- GPU recomendadas: no se documentan; el evaluador del reto no dispone de GPU.
- Compatibilidad con GPU de consumo: no confirmada, aunque al estar en ONNX podría ejecutarse en GPU mediante ONNX Runtime con el proveedor CUDA si el grafo lo permite.
- Restricciones del entorno de evaluación: 2 vCPU, 16 GB de RAM, 15 minutos para todas las entradas, sin red, Linux x86-64, Python en /usr/local/bin/python, directorio /app, imagen construible en 30 minutos y repositorio de 4 GiB o menos.
- Opciones de despliegue: ONNX Runtime (CPU) es la vía natural; Docker para reproducir el entorno del leaderboard. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de clasificación proteica.
- Latencia y throughput: no disponibles. El límite de 15 minutos para el conjunto completo de validación impone una cota superior práctica, pero no se publican medidas por secuencia.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con alternativas concretas. Como referencia cualitativa de la categoría:

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yashash18/ec-mmseqs-plm-v41b | PLM para clasificación EC (ONNX) | no disponible | no disponible | no disponible | Hugging Face |
| Baseline del reto Leak CURBER | Frecuencia de EC mayoritario | 0 | no aplica | según el reto | Hugging Face (starter) |
| Métodos de alineamiento (BLAST, MMseqs2) | Búsqueda por similitud | no aplica | no aplica | según herramienta | Ampliamente disponibles |
| PLM genéricos tipo ESM | Transformer proteico | variable | variable | variable | Hugging Face |

La comparación con PLM genéricos (por ejemplo, la familia ESM) no puede cuantificarse sin datos de benchmarks publicados para este repositorio.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de integrarlo en productos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su precisión en L1-L4 frente al baseline ni frente a métodos de alineamiento.
- Riesgo de sesgo hacia clases mayoritarias: la clasificación EC está muy desbalanceada y la model card no documenta estrategias de mitigación.
- Posible fuga de datos no verificable: aunque el nombre sugiere agrupamiento con MMseqs2, no se detalla cómo se garantizó la separación entre entrenamiento y validación.
- Ámbito restringido: solo predice números EC del vocabulario de ExPASy ENZYME (release 02-Sep-2026); cualquier EC fuera de ese vocabulario se considera inválido y hace fallar la evaluación.
- Restricciones de salida estrictas: hasta 10 EC, sin duplicados, todos dentro del vocabulario, y solo el primero puntúa; un formato incorrecto invalida la evaluación.
- Entorno de ejecución limitado: sin GPU ni red, 2 vCPU, 16 GB de RAM y 15 minutos; modelos más grandes o pipelines con búsquedas externas no son viables.
- Idiomas: no aplica, pero la cobertura taxonómica y de familias enzimáticas del entrenamiento es desconocida, lo que puede limitar la generalización a organismos poco representados.
- Fecha de creación futura (2026-11-02) en los metadatos: conviene verificar la integridad y procedencia del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yashash18/ec-mmseqs-plm-v41b
- Repositorio starter del reto: https://huggingface.co/starkAhmed43/leak-curber-enzyme-classification-starter
- Dataset del reto: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-classification
- Leaderboard: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- Vocabulario EC de referencia (ExPASy ENZYME, CC BY 4.0): https://enzyme.expasy.org/
