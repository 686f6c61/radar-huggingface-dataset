# zhongys97/medcoast

## Resumen

MedCoast PRM es una familia de modelos de recompensa de proceso (process reward models, PRM) de tipo pairwise, desarrollada por el usuario zhongys97 y afinada a partir de answerdotai/ModernBERT-base. Su funcion es puntuar cadenas de razonamiento parciales en tareas de pregunta-respuesta medica, es decir, evaluar pasos intermedios de un razonamiento en lugar de limitarse a juzgar la respuesta final. Esto resulta relevante para pipelines de busqueda guiada, reranking de trayectorias y verificacion de reasoning en dominios clinicos, donde el coste de un paso erroneo es alto.

El repositorio contiene nueve checkpoints con pesos en formato PyTorch (`.pt`), cada uno identificado por dos hiperparametros (`dsim` y `a`) y acompanado de su precision pairwise de validacion, que oscila entre 0,5101 y 0,6093. Los pesos se distribuyen como un diccionario con `model_state` en fp32 y `config`, y no como safetensors, lo que condiciona su integracion: el autor indica que deben usarse con la clase `PRMScorer` de su propio codebase.

La entrada esta limitada a 2048 tokens y el modelo se ofrece unicamente para inferencia. La licencia es Apache 2.0 y el modelo base es ModernBERT-base, un encoder transformer de la familia BERT con soporte de contexto largo; sin embargo, la model card no detalla el numero de parametros, los datos de entrenamiento ni los idiomas soportados, por lo que varios apartados de esta ficha quedan marcados como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tune de answerdotai/ModernBERT-base) |
| Parametros totales | no disponible (heredados de ModernBERT-base; no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (limite de entrada declarado) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en fp32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (dict con `model_state` en fp32 y `config`) |

## Arquitectura y entrenamiento

El modelo parte de answerdotai/ModernBERT-base, un encoder transformer de la familia BERT modernizada, y se afina como process reward model de tipo pairwise: recibe una pregunta medica junto con una cadena de razonamiento parcial y produce una puntuacion que permite comparar dos trayectorias. Los checkpoints se organizan en una rejilla de dos hiperparametros, `dsim` (valores 0,75, 0,80 y 0,85) y `a` (valores 0,0, 0,5 y 1,0), lo que sugiere una busqueda de configuracion de entrenamiento o de regularizacion, aunque la model card no explicita su significado.

No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio esquema de PRM pairwise. La unica metrica publicada es la precision pairwise de validacion por checkpoint, que alcanza su maximo en `medcoast_prm_dsim0.85_a0.0.pt` con 0,6093.

## Capacidades

- Puntuacion de cadenas de razonamiento parciales en preguntas medicas (scoring de pasos intermedios).
- Comparacion pairwise de trayectorias de razonamiento para seleccion o reranking.
- Verificacion de reasoning en pipelines de question answering clinico.
- Integracion con la clase `PRMScorer` del codebase MedCoast para obtener puntuaciones.
- Procesamiento de entradas de hasta 2048 tokens.
- Uso exclusivo para inferencia (los checkpoints no estan pensados para reentrenamiento directo).

No se documentan capacidades de generacion de texto, tool calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Reranking de candidatos en QA medico: dado un conjunto de cadenas de razonamiento generadas por un LLM, el PRM puntua cada una y permite ordenarlas antes de seleccionar la respuesta final, mejorando la fiabilidad frente a una seleccion basada solo en la respuesta.
- Busqueda guiada en arboles de razonamiento: en esquemas tipo tree search o best-of-N, el modelo evalua pasos parciales para podar ramas poco prometedoras y concentrar el computo en trayectorias con mayor probabilidad de exito.
- Verificacion de reasoning clinico en produccion: integrado como filtro en un pipeline de asistencia medica, descarta cadenas con pasos debiles antes de que lleguen al revisor humano.
- Generacion de datos de preferencia: las puntuaciones pairwise permiten construir pares (mejor, peor) para entrenar o ajustar modelos de razonamiento medico con DPO u otras tecnicas de alineamiento.
- Evaluacion de modelos generadores en dominios medicos: usar el PRM como metrica automatica de calidad del proceso de razonamiento, complementando metricas de exactitud de respuesta final.
- Seleccion de configuracion en experimentos: la rejilla de checkpoints (`dsim` x `a`) permite comparar variantes y elegir la de mayor precision pairwise para un conjunto de validacion concreto.
- Investigacion en process supervision: base para estudiar como varia la calidad del PRM segun hiperparametros de entrenamiento en el dominio medico.

## Benchmarks y rendimiento

Los unicos datos publicados son las precisiones pairwise de validacion de cada checkpoint:

| Checkpoint | dsim | a | Precision pairwise (val) |
|---|---|---|---|
| medcoast_prm_dsim0.75_a0.0.pt | 0,75 | 0,0 | 0,5995 |
| medcoast_prm_dsim0.75_a0.5.pt | 0,75 | 0,5 | 0,5757 |
| medcoast_prm_dsim0.75_a1.0.pt | 0,75 | 1,0 | 0,5225 |
| medcoast_prm_dsim0.8_a0.0.pt | 0,80 | 0,0 | 0,6035 |
| medcoast_prm_dsim0.8_a0.5.pt | 0,80 | 0,5 | 0,5590 |
| medcoast_prm_dsim0.8_a1.0.pt | 0,80 | 1,0 | 0,5143 |
| medcoast_prm_dsim0.85_a0.0.pt | 0,85 | 0,0 | 0,6093 |
| medcoast_prm_dsim0.85_a0.5.pt | 0,85 | 0,5 | 0,5411 |
| medcoast_prm_dsim0.85_a1.0.pt | 0,85 | 1,0 | 0,5101 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al derivar de ModernBERT-base y almacenar los pesos en fp32, el checkpoint completo es manejable en GPU consumer, pero el tamano exacto no se documenta.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo base, una GPU consumer moderna (por ejemplo, RTX 4090) seria suficiente en principio, aunque no esta confirmado por el autor.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base, pero sin confirmacion oficial.
- Opciones de despliegue: el autor indica el uso de `PRMScorer` del codebase MedCoast (`model/prm_scorer.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card no incluye comparaciones con otros PRM medicos ni con alternativas de la misma categoria.

## Limitaciones y advertencias

- La precision pairwise de validacion es moderada (maximo 0,6093), lo que limita su fiabilidad como unico criterio de seleccion.
- Entrada limitada a 2048 tokens: las cadenas de razonamiento mas largas se truncan o deben dividirse.
- Solo para inferencia; no esta pensado para reentrenamiento directo.
- No se documentan sesgos conocidos, riesgos de alucinacion especificos ni cobertura idiomatica.
- El uso en contextos clinicos requiere supervision humana: un PRM no sustituye la validacion medica profesional.
- Los pesos se distribuyen como `.pt` (no safetensors), lo que exige cargar con `torch.load` y confiar en el origen del archivo; conviene auditar el checkpoint antes de usarlo en produccion.
- No se documenta el proceso de entrenamiento ni la procedencia de los datos, lo que dificulta evaluar su robustez fuera del conjunto de validacion.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantia alguna.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhongys97/medcoast
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
