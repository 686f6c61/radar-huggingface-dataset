# zhongys97/MedCoast-PRM-dsim0.8-a0.0

## Resumen

MedCoast-PRM-dsim0.8-a0.0 es un modelo de recompensa de proceso (process reward model, PRM) orientado a preguntas y respuestas de dominio medico, publicado por el usuario zhongys97. Se trata de un ajuste fino de `answerdotai/ModernBERT-base`, un transformer encoder de tipo ModernBERT, y su funcion no es generar texto, sino puntuar cadenas de razonamiento parciales para evaluar la calidad de pasos intermedios en respuestas medicas.

El modelo se distribuye como un unico checkpoint `prm.pt` (un diccionario con el `state_dict` en fp32 y la configuracion), no como pesos en formato safetensors o GGUF, y esta pensado exclusivamente para inferencia a traves de la clase `PRMScorer` del repositorio de codigo MedCoast. La variante publicada corresponde a una configuracion concreta de entrenamiento identificada por los hiperparametros `dsim=0.8` y `a=0.0`, con una longitud maxima de 2048 tokens y truncacion por la izquierda.

La relevancia de este checkpoint radica en su uso como componente de evaluacion o de guiado en pipelines de razonamiento medico (por ejemplo, reranking de cadenas de pensamiento o busqueda guiada por recompensa), no como modelo conversacional autonomo. La informacion publica disponible es muy escasa: no se documentan licencia, idiomas, volumen de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), ajustado como process reward model |
| Parametros totales | no disponible (heredados de ModernBERT-base; no se especifica el recuento en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (truncacion por la izquierda) |
| Tipos de cuantizacion | no disponible (checkpoint distribuido en fp32) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `prm.pt` (diccionario con `model_state` en fp32 y `config`) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer de la familia ModernBERT, y se ajusta como process reward model para puntuar cadenas de razonamiento parciales en tareas de QA medico. La salida esperada es una puntuacion por paso o por cadena parcial, consumida por el componente `PRMScorer` del codebase MedCoast.

La model card solo documenta la configuracion de entrenamiento mediante dos hiperparametros (`dsim=0.8` y `a=0.0`) y el regimen de truncacion a 2048 tokens. No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otras. Tampoco se describen innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal u otras). El checkpoint se declara explicitamente para inferencia unicamente.

## Capacidades

- Puntuacion de cadenas de razonamiento parciales en preguntas medicas (funcion principal como PRM).
- Evaluacion paso a paso de respuestas de QA medico, apta para reranking o seleccion de candidatos.
- Integracion con el componente `PRMScorer` del codebase MedCoast para su uso en pipelines de inferencia.
- Procesamiento de secuencias de hasta 2048 tokens con truncacion por la izquierda.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision, audio ni modo de pensamiento explicito.
- Cobertura multilingue: no disponible.

## Casos de uso

- Reranking de respuestas medicas: dado un conjunto de cadenas de razonamiento candidatas generadas por un LLM, el PRM las puntua y permite seleccionar la mas fiable antes de devolver la respuesta final.
- Busqueda guiada por recompensa en QA medico: el modelo actua como funcion de recompensa durante la exploracion de pasos intermedios, descartando ramas de razonamiento de baja calidad.
- Evaluacion de sistemas de razonamiento medico: sirve como metrica automatica para comparar variantes de un pipeline generativo en funcion de la calidad de sus cadenas de pensamiento.
- Filtrado de datos de entrenamiento: puntuar cadenas de razonamiento sinteticas para conservar solo aquellas con pasos coherentes antes de usarlas en ajuste fino supervisado.
- Control de calidad en asistentes clinicos de apoyo: integrado como etapa de verificacion que marca respuestas con cadenas de razonamiento debiles para revision humana.
- Investigacion en process reward models: al ser un checkpoint pequeno (0,6 GB) basado en ModernBERT, es util para experimentar con senales de recompensa por paso en dominio medico sin requerir infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,6 GB y el checkpoint se distribuye en fp32; la huella de memoria es reducida y compatible con GPUs de consumo, aunque no se publica una cifra oficial.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del checkpoint, es plausible su ejecucion en GPUs de gama media, pero no se confirma.
- Cabe en GPU de consumo: no confirmado oficialmente; el tamano del artefacto (0,6 GB) sugiere que si, pero no se documenta.
- Opciones de despliegue: uso previsto mediante la clase `PRMScorer` del codebase MedCoast (`model/prm_scorer.py`) junto con `huggingface_hub`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MedCoast-PRM-dsim0.8-a0.0 | no disponible (base ModernBERT-base) | 2048 tokens | Process reward model medico | no disponible | Hugging Face (checkpoint `prm.pt`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce puntuaciones de cadenas de razonamiento y requiere el codigo MedCoast (`PRMScorer`) para su uso.
- La model card no documenta sesgos conocidos, pero al ser un modelo de dominio medico ajustado sobre datos no descritos, existe riesgo de sesgo en la evaluacion de razonamientos de poblaciones o patologias poco representadas.
- Riesgo de alucinacion: aunque el modelo no genera texto, sus puntuaciones pueden sobrevalorar cadenas de razonamiento plausibles pero incorrectas si el ajuste no cubre esos patrones.
- Limitacion de contexto: 2048 tokens con truncacion por la izquierda, lo que puede descartar informacion inicial en cadenas de razonamiento largas.
- Licencia no especificada: no se puede confirmar el uso comercial; debe consultarse con el autor antes de cualquier despliegue en produccion.
- Idiomas no documentados: no se garantiza un comportamiento adecuado fuera del idioma o idiomas usados en el ajuste.
- Checkpoint declarado para inferencia unicamente; no esta pensado para reentrenamiento directo sin adaptacion.
- Ausencia de benchmarks: no hay evidencia publicada de su calidad frente a alternativas, lo que limita su adopcion en entornos regulados.
- Uso en contexto clinico: cualquier aplicacion debe acompanarse de supervision humana; el modelo no sustituye el juicio medico.

## Enlaces

- Hugging Face: https://huggingface.co/zhongys97/MedCoast-PRM-dsim0.8-a0.0
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
