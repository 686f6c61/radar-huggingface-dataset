# Urdatorn/oga-macronizer-char-code

## Resumen

`oga-macronizer-char-code` es el repositorio de código de entrenamiento, búsqueda de hiperparámetros y evaluación del macronizador de griego antiguo a nivel de carácter `Ericu950/oga-macronizer-char`. Lo publica el usuario Urdatorn como material reproducible asociado a la versión revisada del artículo *Automatic Annotation of Ancient Greek Vowel Length* (Thörn Cleland & Cullhed). No es un modelo con pesos publicados en este repositorio, sino el conjunto de scripts (`model.py`, `tokenizer.py`, `train.py`, `hpo.py`, `evaluate.py`, `predict.py`, `norma.py`) que permiten reproducir el entrenamiento y la evaluación del macronizador.

El problema que aborda es la predicción de la cantidad vocálica (larga o breve) en griego antiguo, un fenómeno que no aparece marcado en la mayoría de ediciones y que resulta crítico para métrica, prosodia y análisis fonológico. El modelo subyacente es un clasificador a nivel de carácter que, para cada vocal en sílaba abierta, decide si debe llevar macron. La revisión del código introduce cambios metodológicos relevantes: descontaminación del corpus de entrenamiento respecto al benchmark, selección de checkpoint sobre validación con anotación gold y búsqueda de hiperparámetros con Optuna.

La relevancia actual es doble: por un lado, el código sirve como referencia reproducible para tareas de anotación lingüística de bajos recursos; por otro, la descontaminación explícita del conjunto de entrenamiento frente al test responde a una preocupación metodológica creciente en la evaluación de modelos de NLP para lenguas históricas, donde las filtraciones entre corpus y benchmarks son habituales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Clasificador a nivel de carácter (char-level); detalles internos no disponibles en la información proporcionada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | griego antiguo (`grc`) |
| Licencia | GNU GPL v3.0 |
| Formato de pesos | no disponible (el repositorio contiene código de entrenamiento; los checkpoints del modelo base están en `Ericu950/oga-macronizer-char`) |

## Arquitectura y entrenamiento

El repositorio implementa el pipeline completo de un macronizador a nivel de carácter. `model.py` y `tokenizer.py` se mantienen sin cambios respecto al código original del proyecto `grc-macronizer/macron_model` (commit `456c970`), lo que garantiza compatibilidad bidireccional de checkpoints. El tokenizador opera sobre el "char plane", es decir, sobre caracteres individuales del texto griego, y el modelo predice la cantidad vocálica posición a posición.

El entrenamiento utiliza el corpus plateado `Urdatorn/oga-macronized-no-norma`, del que se han eliminado todas las oraciones que solapan con el benchmark. La evaluación se realiza sobre la versión jsonl de `Urdatorn/norma` (`data/test.jsonl`, `data/validation.jsonl`), con anotación gold. La validación de Norma se puntúa en cada evaluación y puede guiar la selección de checkpoint, el early stopping y la búsqueda de hiperparámetros; el split de test se reserva para la evaluación final. La búsqueda de hiperparámetros se hace con Optuna sobre learning rate y weight decay, con dropout opcional, y puede distribuirse entre varios workers de Slurm mediante un fichero journal. El pipeline incluye una codificación única del corpus en arrays planos con padding y enmascaramiento de diacríticos vectorizados, lo que acelera la carga de datos.

## Capacidades

- Predicción de cantidad vocálica (larga/breve) en griego antiguo a nivel de carácter.
- Macronización automática de texto griego antiguo: inserción de macrones sobre vocales largas.
- Evaluación con métricas por etiqueta (accuracy, precisión, recall, F1 y cobertura) y predicciones por posición para análisis de errores.
- Inferencia por lotes mediante la clase `MacronPredictor` en `predict.py`.
- Selección de checkpoint y early stopping sobre validación gold.
- Búsqueda de hiperparámetros distribuida con Optuna y Slurm.
- No soporta tool calling, agentes, visión, audio ni multimodalidad.

## Casos de uso

- Edición digital de textos griegos: el macronizador permite anotar automáticamente la cantidad vocálica en ediciones digitales (por ejemplo, corpus TEI), reduciendo el trabajo manual de anotadores especializados en prosodia.
- Análisis métrico de poesía griega: la predicción de cantidad vocálica alimenta pipelines de escansión métrica, donde la distinción larga/breve determina el patrón de pies.
- Investigación en fonología histórica: la salida por posición permite estudiar la distribución de vocales largas y breves en distintos autores y géneros.
- Creación de recursos anotados: el código de evaluación y las predicciones por posición sirven para generar datasets de referencia para entrenar o validar otros modelos.
- Reproducibilidad de investigación: el repositorio permite reproducir la Tabla 1 del artículo con `evaluate.py` y los splits de Norma, útil para revisión por pares y replicación.
- Enseñanza de griego antiguo: la macronización automática asiste en la preparación de materiales didácticos con cantidad vocálica explícita.
- Desarrollo de modelos para lenguas históricas: el pipeline de descontaminación y selección sobre gold sirve de plantilla metodológica para otras tareas de anotación lingüística de bajos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio describe las métricas que reporta (accuracy por etiqueta, precisión, recall, F1, cobertura y accuracy con defecto a breve) y el recuento de posiciones evaluadas: 1.916 posiciones en test (díconas gold en sílaba abierta, con apertura derivada de las líneas de silabificación paralelas) y 2.498 posiciones en validación (todas las marcas gold, al no haber líneas de silabificación). No se proporcionan los valores numéricos de esas métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del modelo no se especifica en la información proporcionada.
- GPU recomendadas: no disponible. El repositorio menciona jobs para nodos GH200 de Arrhenius (`slurm/prepare.slurm`, `slurm/hpo.slurm`), lo que sugiere entrenamiento en hardware de datacenter, pero no se detallan requisitos mínimos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio proporciona `predict.py` con `MacronPredictor` para inferencia por lotes; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| `oga-macronizer-char-code` (este repositorio) | Código de entrenamiento y evaluación de macronización | grc | GPL-3.0 | Hugging Face |
| `Ericu950/oga-macronizer-char` | Modelo de macronización a nivel de carácter | grc | no disponible en la información proporcionada | Hugging Face |
| `grc-macronizer/macron_model` (commit `456c970`) | Código original del macronizador | grc | no disponible en la información proporcionada | GitHub |

No se dispone de datos de parámetros, contexto ni rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El repositorio contiene código, no pesos del modelo; para usar el macronizador hay que recurrir a `Ericu950/oga-macronizer-char` o entrenar uno propio con este pipeline.
- El ámbito lingüístico se limita al griego antiguo (`grc`); no hay soporte multilingüe.
- La evaluación se restringe a posiciones gold marcadas en sílaba abierta (test) o a todas las marcas gold (validación); los resultados no cubren necesariamente todo el texto.
- La métrica "accuracy" cuenta una posición sin marcar como error, mientras que la métrica "defaults-to-short" la cuenta como breve; comparar resultados entre ambas puede inducir a confusión si no se explicita cuál se usa.
- La licencia GPL-3.0 impone obligaciones de copyleft: cualquier distribución de obras derivadas debe publicarse bajo la misma licencia, lo que puede ser restrictivo para integración en productos propietarios.
- No se documentan sesgos específicos ni tasas de alucinación; al ser un clasificador por posición, el riesgo principal es la predicción errónea de cantidad, no la generación libre de texto.
- El corpus de entrenamiento es "plateado" (anotación automática previa), lo que puede propagar errores sistemáticos del anotador original.
- Los detalles de arquitectura, tamaño y requisitos de cómputo no están disponibles, lo que dificulta estimar costes de despliegue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Urdatorn/oga-macronizer-char-code
- Modelo base: https://huggingface.co/Ericu950/oga-macronizer-char
- Dataset de entrenamiento descontaminado: https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma
- Dataset de evaluación Norma: https://huggingface.co/datasets/Urdatorn/norma
- Código original: https://github.com/Urdatorn/grc-macronizer/tree/oga-macronization-improvements/macron_model (commit `456c970`)
