# srikarjv/Enzyme_Baseline

## Resumen

Enzyme_Baseline es un modelo de referencia (baseline) publicado por el usuario srikarjv en Hugging Face para la tarea de recuperación de números EC (Enzyme Commission) dentro del leaderboard Leak CURBER. No se trata de un modelo de lenguaje neuronal, sino de un artefacto de inferencia que predice, para cada reacción química expresada en SMILES, el código EC correspondiente. Su función es servir como punto de partida trivial contra el que comparar modelos más elaborados enviados al leaderboard.

El baseline ignora por completo la entrada: para toda reacción predice el número EC más frecuente del conjunto de entrenamiento. Esta estrategia permite validar el pipeline de evaluación (formato de salida, agrupación de entradas únicas, Docker, límites de tiempo y memoria) sin aportar capacidad predictiva real. Su relevancia es, por tanto, metodológica: fija el suelo de rendimiento y demuestra el flujo de envío al leaderboard.

No se dispone de información sobre arquitectura neuronal, parámetros, contexto ni datos de entrenamiento más allá del propio conjunto `train.parquet` del leaderboard. La model card describe exclusivamente el procedimiento de ejecución y las reglas de la competición, no las características internas del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (baseline estadístico: predicción de la EC más frecuente) |
| Parámetros totales | no disponible (no es un modelo neuronal con pesos) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica) |
| Idiomas soportados | no disponible (la tarea es sobre SMILES de reacciones, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | JSON (`weights/baseline.json`), según el script `train.py` descrito en la model card |

## Arquitectura y entrenamiento

El baseline no emplea una arquitectura de red neuronal. Consiste en un procedimiento estadístico que recorre el conjunto `train.parquet` (una fila por par entrada–EC) y almacena la EC más frecuente. En inferencia, `predict.py` devuelve esa misma EC para cada identificador único de entrada, sin consultar el contenido de `rxn_smiles`. El artefacto entrenado se serializa como un fichero JSON (`weights/baseline.json`) generado por `train.py`.

El entrenamiento se limita al split de entrenamiento público (`train.parquet`), que contiene las etiquetas `ec_number`. No hay información sobre número de tokens, composición del dataset, RLHF, DPO ni ninguna innovación técnica. El vocabulario de EC permitido proviene de `ec_vocabulary.json`, extraído de ExPASy ENZYME (release 02-Sep-2026, CC BY 4.0). La evaluación agrupa entradas idénticas por split, conserva el primer ID y puntúa cada entrada única una sola vez; solo cuenta la primera EC predicha, y se reporta precisión top-1 en los niveles L4, L3, L2 y L1, ordenando por L4.

## Capacidades

- Predicción de un único número EC por reacción SMILES, devolviendo la EC más frecuente del entrenamiento con independencia de la entrada.
- Salida en JSON Lines con las claves `id` y `prediction`, donde `prediction` es una lista de ECs distintas ordenadas de mejor a peor (hasta 10, aunque solo la primera puntúa).
- Agrupación de entradas duplicadas mediante `inputs.py`, prediciendo solo el primer ID de cada entrada única.
- Ejecución en CPU exclusivamente, sin GPU ni red, dentro de un contenedor Docker con 2 vCPUs, 16 GB de RAM y 15 minutos para todas las entradas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento.

## Casos de uso

- Validación del pipeline de envío al leaderboard Leak CURBER: permite comprobar que el Dockerfile, `predict.py`, el formato JSONL y la cobertura de IDs únicos cumplen las reglas antes de invertir en un modelo real.
- Establecimiento del suelo de rendimiento: cualquier modelo candidato debe superar la precisión top-1 L4 de esta predicción trivial; sirve como referencia mínima en la comparación de envíos.
- Pruebas de integración del entorno de evaluación: verifica que la imagen se construye en menos de 30 minutos, que el repositorio no supera 4 GiB y que ningún fichero de salida excede 16 MiB.
- Depuración de errores de formato: al generar predicciones siempre válidas (EC del vocabulario, sin duplicados, sin IDs extra), aísla fallos de formato de los fallos de modelado.
- Docencia y demostración: ilustra de forma mínima la tarea de recuperación de EC y las métricas de precisión jerárquica L1–L4 sin requerir recursos de cómputo.
- Punto de control en experimentos de ablation: permite medir cuánto aporta realmente un modelo de recuperación de enzimas frente a la ausencia total de señal de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la puntuación de validación del baseline en el leaderboard, solo la descripción del método y de las métricas empleadas (precisión top-1 en L4, L3, L2 y L1, con ordenación por L4).

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo no usa GPU.
- GPU recomendadas: ninguna; la evaluación se ejecuta en CPU con 2 vCPUs.
- Cabe en cualquier GPU consumer, pero no la necesita; también cabe en cualquier CPU x86-64 convencional.
- Memoria RAM: 16 GB asignados por el evaluador; el baseline en sí requiere muy poca memoria.
- Opciones de despliegue: contenedor Docker con Python en `/usr/local/bin/python` y directorio de trabajo `/app`, invocado como `python /app/predict.py --input INPUT --output OUTPUT`. No se soportan entrypoints de Docker ni hooks de shell.
- Latencia y throughput estimados: no disponibles de forma publicada; por la naturaleza del baseline (una búsqueda en un JSON), la inferencia es prácticamente instantánea y queda muy por debajo del límite de 15 minutos.
- Restricciones del entorno: sin red, sin GPU, construcción de imagen en 30 minutos máximo, repositorio de 4 GiB o menos, ficheros de salida de 16 MiB o menos y uso de `/tmp` para temporales.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada usada | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| srikarjv/Enzyme_Baseline | Baseline estadístico (EC más frecuente) | No | no disponible | no aplica | no disponible | Hugging Face |
| starkAhmed43/leak-curber-enzyme-retrieval-starter | Modelo inicial del leaderboard | no disponible | no disponible | no aplica | no disponible | Hugging Face |
| Modelos generativos de diseño de enzimas (p. ej. enfoques transformer/diffusion citados en la literatura) | Modelos generativos de secuencias y estructuras | Sí (secuencia/estructura) | no disponible | no disponible | no disponible | No disponible |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo ignora la entrada: no aprende ninguna relación entre la reacción SMILES y el número EC, por lo que su capacidad predictiva es la de una clase mayoritaria.
- Riesgo de sesgo hacia la EC más frecuente del entrenamiento: infrarepresenta clases minoritarias y no generaliza a reacciones de familias enzimáticas poco pobladas.
- Solo cuenta la primera EC predicha; listar hasta 10 no mejora la puntuación, lo que limita estrategias de cobertura.
- La licencia no está declarada, por lo que el uso comercial no está garantizado ni autorizado explícitamente.
- El vocabulario de EC está restringido a `ec_vocabulary.json` (ExPASy ENZYME, release 02-Sep-2026, CC BY 4.0); predecir ECs fuera de ese conjunto invalida la evaluación.
- No se permite el acceso a red durante la inferencia ni el uso de GPU; el entorno está limitado a 2 vCPUs, 16 GB de RAM y 15 minutos.
- No debe confundirse con un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- No se han publicado métricas de validación ni de test en la información disponible, por lo que no puede evaluarse su rendimiento absoluto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srikarjv/Enzyme_Baseline
- Repositorio starter del leaderboard: https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
- Dataset del leaderboard: https://huggingface.co/datasets/starkAhmed43/leak-curber-enzyme-retrieval
- Leaderboard Leak CURBER: https://huggingface.co/spaces/starkAhmed43/leak-curber-leaderboard
- Hoja de asignación de tareas: https://docs.google.com/spreadsheets/d/12c2PaYcNDpa6bA0JPmKi6tHsdV-EdFe2IYQ70RqpGRI/edit?usp=sharing
- ExPASy ENZYME (vocabulario EC, CC BY 4.0): https://enzyme.expasy.org/
- Artículo sobre IA generativa para diseño de enzimas: https://www.emergentmind.com/topics/generative-ai-models-for-enzyme-design
