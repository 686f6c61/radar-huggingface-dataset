# Urdatorn/Makron-seed1

## Resumen

Makron-seed1 es un modelo de clasificación de tokens a nivel de carácter desarrollado por Urdatorn (Albin Thörn Cleland) que anota la cantidad vocálica de las vocales griegas antiguas ditónicas α, ι y υ, insertando `^` tras una vocal breve y `_` tras una vocal larga. Con solo 866.563 parámetros, es una revisión del anterior Ericu950/oga-macronizer-char, del que mantiene la arquitectura pero cambia por completo los datos de entrenamiento y los hiperparámetros.

El modelo resuelve un problema filológico concreto: la macronización automática de textos griegos antiguos, una tarea previa a la edición crítica y al análisis métrico. Se entrena sobre etiquetas plateadas generadas por el sistema basado en reglas grc-macronizer sobre el corpus Opera Graeca Adnotata, tras eliminar toda oración solapada con el benchmark Norma y las líneas sin texto griego.

Es relevante por su tamaño extremadamente reducido (menos de un millón de parámetros), que permite ejecutarlo en CPU sin dificultad, y por publicar una evaluación honesta y detallada sobre el benchmark Norma Syllabarum Graecarum. Forma parte de una familia de tres semillas (seed1, seed2, seed3) idénticas salvo por la semilla de inicialización; según el autor, seed2 obtiene la mejor puntuación de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder a nivel de carácter, 4 capas, hidden size 128, 4 cabezas, intermediate size 512 |
| Parametros totales | 866.563 (0,87 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | GNU GPL v3 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un transformer encoder de 4 capas con dimensión oculta 128, 4 cabezas de atención y tamaño intermedio 512, operando a nivel de carácter sobre texto griego politónico. La tarea es de token classification: cada posición correspondiente a una vocal ditónica se etiqueta como breve, larga o no marcada.

El entrenamiento usa AdamW con learning rate 2,23e-3, weight decay 0,17, batch size 2048 y un schedule one-cycle con 5 % de warmup durante 30 épocas, sin dropout (0,0). Los hiperparámetros se seleccionaron mediante una búsqueda Optuna de 24 ensayos sobre la validación de Norma, y la longitud de entrenamiento (30 épocas) se fijó con una comparación posterior sobre la misma validación. El checkpoint elegido es el de mejor exactitud de validación en Norma (paso 18.000). Los datos de entrenamiento son etiquetas plateadas del sistema basado en reglas grc-macronizer sobre Opera Graeca Adnotata, con eliminación de oraciones solapadas con Norma y de líneas sin griego.

## Capacidades

- Macronización de vocales ditónicas α, ι y υ en griego antiguo politónico, insertando `^` (breve) o `_` (larga) tras la vocal.
- Procesamiento a nivel de carácter, lo que evita dependencias de tokenizadores subpalabra y permite manejar formas con diacríticos complejos.
- Clasificación de tres estados por posición: breve, larga y no marcada.
- Normalización a cantidades vocálicas áticas.
- Ejecución en CPU por su tamaño mínimo.
- No soporta tool calling, function calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo especializado de una sola tarea.
- Capacidad monolingüe: únicamente griego antiguo.

## Casos de uso

- Edición digital de textos griegos: el modelo inserta marcas de cantidad vocálica en transcripciones politónicas para preparar ediciones anotadas, aprovechando su naturaleza a nivel de carácter para respetar los diacríticos existentes.
- Análisis métrico preliminar: la macronización automática facilita la identificación de cantidades necesarias para el escaneo de versos, aunque el autor advierte que las cantidades áticas no sirven para formas homéricas o dóricas.
- Enriquecimiento de corpus para filología computacional: permite anotar grandes volúmenes de texto griego con información de cantidad vocálica que después puede usarse en estudios de prosodia o en el entrenamiento de modelos mayores.
- Preprocesado en pipelines de PNL clásica: al ser un modelo de 0,87 M de parámetros, puede ejecutarse en CPU dentro de un pipeline junto a lematizadores o analizadores morfológicos sin coste apreciable de recursos.
- Herramienta de apoyo a la docencia: permite generar materiales con cantidades vocálicas marcadas para estudiantes de griego antiguo, con la advertencia de revisar manualmente las vocales largas por su menor recall.
- Investigación sobre etiquetado débil: sirve como caso de estudio de destilación de un sistema basado en reglas hacia un modelo neuronal pequeño, útil para quienes diseñan anotadores con etiquetas plateadas.
- Evaluación comparativa de arquitecturas mínimas: su tamaño y su benchmark público lo hacen útil como línea base en experimentos sobre modelos de clasificación de caracteres.

## Benchmarks y rendimiento

Resultados sobre el test de Norma Syllabarum Graecarum (1.916 ditónicas áureas en sílabas abiertas). Una posición sin marcar cuenta como error.

| Etiqueta | Exactitud | Precisión | Recall | F1 | Cobertura |
|---|---|---|---|---|---|
| Larga | 66,3 | 82,3 | 66,3 | 73,4 | 98,8 |
| Breve | 97,0 | 93,6 | 97,0 | 95,3 | 99,9 |
| Mixta | 91,8 | 92,1 | 91,8 | 91,9 | 99,7 |

Precisión, recall y F1 mixtos están promediados en micro. En validación (Norma, 2.498 posiciones) la exactitud mixta es del 93,76 %. La variación entre las tres semillas en test es de 91,3 ± 0,5 de exactitud mixta.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en particular; funciona en CPU. Cualquier GPU con al menos 1 GB de memoria libre es suficiente.
- Cabe en GPU consumer: sí, en cualquier modelo actual (RTX 3060, RTX 4090, etc.) y en GPUs integradas.
- Opciones de despliegue: la model card indica descargar `model.py`, `tokenizer.py` y `predict.py` del repositorio Urdatorn/Makron-code y usar la clase `MacronPredictor`. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Makron-seed1 | 0,87 M | no disponible | Macronización de griego antiguo | GPL-3.0 | Hugging Face |
| Ericu950/oga-macronizer-char | no disponible | no disponible | Macronización de griego antiguo | no disponible | Hugging Face |
| Makron-seed2 | 0,87 M | no disponible | Macronización de griego antiguo | GPL-3.0 | Hugging Face |
| Makron-seed3 | 0,87 M | no disponible | Macronización de griego antiguo | GPL-3.0 | Hugging Face |

El predecesor Ericu950/oga-macronizer-char comparte arquitectura pero difiere en datos y ajustes; Makron-seed2 es la semilla con mejor validación en Norma según el autor. No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Normaliza a cantidades vocálicas áticas, por lo que es sistemáticamente incorrecto para formas homéricas, dóricas y de otros dialectos no áticos.
- Aprende de etiquetas plateadas del sistema basado en reglas grc-macronizer y hereda sus errores.
- Las vocales largas son su punto débil: recall del 66,3 % en test.
- Una posición sin marcar se cuenta como error en la evaluación, lo que penaliza los casos de abstención.
- Modelo monolingüe limitado al griego antiguo; no admite otros idiomas ni tareas generales.
- Licencia GPL-3.0: el uso comercial exige cumplir las obligaciones de copyleft de dicha licencia, lo que puede condicionar su integración en productos propietarios.
- Riesgo de alucinación en el sentido de asignar cantidades incorrectas en formas ambiguas o poco representadas en el corpus de entrenamiento.
- No se documentan sesgos más allá de la normalización dialectal ática.
- Al ser un modelo de 0,87 M de parámetros, su capacidad de generalización fuera del dominio de Opera Graeca Adnotata es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Urdatorn/Makron-seed1
- Código, logs y semillas: https://huggingface.co/Urdatorn/Makron-code
- Semilla 2: https://huggingface.co/Urdatorn/Makron-seed2
- Semilla 3: https://huggingface.co/Urdatorn/Makron-seed3
- Modelo predecesor: https://huggingface.co/Ericu950/oga-macronizer-char
- Dataset de entrenamiento: https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma
- Benchmark Norma: https://huggingface.co/datasets/Urdatorn/norma
