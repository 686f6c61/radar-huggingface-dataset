# Urdatorn/Makron-code

## Resumen

Makron-code es un repositorio de código de entrenamiento, búsqueda de hiperparámetros y evaluación para el modelo Urdatorn/Makron, la versión revisada del macronizador de griego antiguo a nivel de carácter (Ericu950/oga-macronizer-char). Lo desarrolla Urdatorn y se publica como material de reproducibilidad asociado a la versión revisada del artículo *Automatic Annotation of Ancient Greek Vowel Length* (Thörn Cleland y Cullhed). No se trata de un modelo de lenguaje generativo, sino del código que permite reproducir el entrenamiento y la evaluación del macronizador.

El problema que resuelve es la anotación automática de la cantidad vocálica (larga o breve) en griego antiguo, una tarea filológica crítica para la prosodia y la métrica. El repositorio incluye datos de entrenamiento decontaminados (Urdatorn/oga-macronized-no-norma), una evaluación sobre el conjunto gold Norma y una búsqueda Optuna de tasa de aprendizaje y weight decay. El repositorio no contiene pesos del modelo: su tamaño es de 0.0 GB y no dispone de pipeline declarado.

La relevancia actual reside en la reproducibilidad: `model.py` y `tokenizer.py` se mantienen sin cambios respecto al código original, de modo que los checkpoints son compatibles en ambos sentidos, y la selección de modelo se realiza sobre validación gold, reservando el split de test solo para la evaluación final. La licencia es GPL-3.0 y el único idioma declarado es el griego antiguo (grc).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de código; el modelo subyacente es un macronizador a nivel de carácter) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | griego antiguo (grc) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (el repositorio contiene código; no incluye safetensors ni GGUF pese a la etiqueta) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del macronizador, pero sí su tokenización: un tokenizador a nivel de carácter sobre el plano de caracteres del griego politónico (`tokenizer.py`, sin cambios respecto al original). El entrenamiento parte de un corpus silver codificado una sola vez en arrays planos, con padding y enmascarado de diacríticos vectorizados para acelerar la entrada. La partición del corpus silver es fija 90/10 con `--data_seed 0` y se genera mediante `prepare_data.py` en `cache/`.

Los datos de entrenamiento proceden de Urdatorn/oga-macronized-no-norma, una versión decontaminada en la que se han eliminado todas las frases que solapan con el benchmark. La evaluación lee la versión jsonl de Urdatorn/norma (`data/test.jsonl`, `data/validation.jsonl`) y reporta las métricas de la Tabla 1 del artículo (accuracy por etiqueta, precisión, recall, F1 y cobertura), además de predicciones por posición para análisis de errores. La validación Norma, anotada gold, se puntúa en cada evaluación y puede guiar la selección de checkpoint, el early stopping y la búsqueda de hiperparámetros, que se realiza con Optuna sobre tasa de aprendizaje y weight decay, con dropout opcional. El test se reserva para la evaluación final.

## Capacidades

- Macronización de griego antiguo a nivel de carácter: predice la cantidad vocálica (larga o breve) en posiciones dicronas.
- Anotación de posiciones en sílaba abierta: en test, la apertura proviene de las líneas paralelas de silabificación, con 1.916 posiciones puntuadas.
- Evaluación sobre validación gold: 2.498 posiciones puntuadas, todas las marcas gold (sin líneas de silabificación).
- Métricas reproducibles: accuracy, precisión, recall, F1 y cobertura por etiqueta, además de micro-promedio mixto.
- Métrica "defaults-to-short accuracy": las posiciones sin marcar se cuentan como breves, la métrica reportada en las model cards.
- Inferencia por lotes mediante `MacronPredictor` (`predict.py`).
- Búsqueda de hiperparámetros distribuida con Optuna compartida entre workers de Slurm mediante fichero journal.
- Compatibilidad bidireccional de checkpoints con el código original (`grc-macronizer/macron_model`).
- No soporta tool calling, agentes, visión, audio ni generación de texto general: es un componente especializado, no un modelo conversacional.

## Casos de uso

- Edición digital de textos griegos: el macronizador anota automáticamente la cantidad vocálica en ediciones críticas, reduciendo el trabajo manual de los filólogos sobre corpus extensos.
- Análisis métrico de poesía: la cantidad vocálica es el fundamento del hexámetro y otros metros; el modelo permite escandir automáticamente pasajes antes de la revisión humana.
- Reproducibilidad de investigación: los scripts `prepare_data.py`, `train.py`, `hpo.py` y `evaluate.py` permiten replicar la Tabla 1 del artículo con particiones y semillas fijas.
- Búsqueda de hiperparámetros en clúster: `hpo.py` con journal compartido y `slurm/hpo.slurm` permiten lanzar estudios Optuna en nodos GH200 de Arrhenius.
- Evaluación comparativa de macronizadores: `evaluate.py` puntúa checkpoints locales o del Hub sobre Norma, facilitando comparaciones entre versiones del modelo.
- Análisis de errores por posición: la salida jsonl por posición permite identificar patrones de fallo (por ejemplo, dicronas en contextos ambiguos) y guiar mejoras del corpus.
- Integración en pipelines de anotación lingüística: `MacronPredictor` ofrece inferencia por lotes para procesar corpus completos de forma programática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el protocolo de evaluación (Tabla 1 del artículo, 1.916 posiciones en test y 2.498 en validación) pero no incluye cifras numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repositorio no incluye pesos ni especifica el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: los scripts de entrenamiento y búsqueda están preparados para nodos Arrhenius GH200 mediante trabajos Slurm (`slurm/prepare.slurm`, `slurm/hpo.slurm`); la inferencia se realiza con `predict.py` (`MacronPredictor`), sin integración documentada con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|
| Urdatorn/Makron-code (este) | Código de entrenamiento y evaluación | grc | GPL-3.0 | Hugging Face, 0 descargas |
| Urdatorn/Makron | Macronizador revisado (pesos) | grc | no disponible | Hugging Face |
| Ericu950/oga-macronizer-char | Macronizador original a nivel de carácter | grc | no disponible | Hugging Face |
| grc-macronizer/macron_model | Código original (commit 456c970) | grc | no disponible | GitHub |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El repositorio contiene únicamente código: no incluye pesos del modelo ni ficheros safetensors, a pesar de la etiqueta `safetensors` en los metadatos.
- El alcance es exclusivamente el griego antiguo (grc); no es un modelo multilingüe ni de propósito general.
- La métrica principal depende del conjunto Norma y de las líneas de silabificación para determinar la apertura de sílaba en test; sin ellas, la cobertura de posiciones puntuadas cambia.
- Riesgo de sobreajuste al benchmark si se reutilizan los datos silver sin la decontaminación aplicada; el repositorio depende de Urdatorn/oga-macronized-no-norma para evitarlo.
- La licencia GPL-3.0 impone obligaciones de copyleft: cualquier distribución de obras derivadas debe publicarse bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- No hay información publicada sobre sesgos, tasas de alucinación ni robustez fuera del dominio de entrenamiento.
- El repositorio tiene 0 descargas y 1 like, sin pipeline declarado: no hay evidencia de uso en producción ni validación externa independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Urdatorn/Makron-code
- Modelo revisado: https://huggingface.co/Urdatorn/Makron
- Macronizador original: https://huggingface.co/Ericu950/oga-macronizer-char
- Dataset de entrenamiento decontaminado: https://huggingface.co/datasets/Urdatorn/oga-macronized-no-norma
- Dataset Norma: https://huggingface.co/datasets/Urdatorn/norma
- Código original en GitHub: https://github.com/Urdatorn/grc-macronizer/tree/oga-macronization-improvements/macron_model
