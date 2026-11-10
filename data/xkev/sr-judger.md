# Xkev/SR-judger

## Resumen

SR-judger es un modelo de clasificacion de texto obtenido por ajuste fino supervisado de Qwen/Qwen3.5-9B-Base, desarrollado por el usuario Xkev en el contexto del proyecto BVSR (Blind Variation, Selective Retention) del grupo zou-group, orientado a la generacion de ideas en sistemas de IA cientifica. Su funcion concreta es actuar como selector de retencion: recibe una propuesta compuesta por una especificacion de tarea y el codigo asociado, y emite una puntuacion que permite descartar las propuestas peor valoradas antes de pasar a la fase de verificacion, reduciendo coste computacional en el pipeline.

El modelo parte de la arquitectura Qwen3.5-9B-Base (tag `qwen3_5_text`), con 7.936.688.640 parametros reales segun los pesos en safetensors, y se distribuye bajo licencia Apache-2.0 en formato safetensors para la libreria transformers. El repositorio ocupa 15,9 GB y esta etiquetado como compatible con endpoints, lo que facilita su despliegue como servicio de inferencia.

Su relevancia es acotada pero especifica: no es un modelo de proposito general, sino un componente de ranking dentro de un bucle de busqueda de ideas, entrenado con una perdida pairwise que separa el top-5% de propuestas verificadas del resto. Resulta util para quien replique o adapte el pipeline BVSR, no como sustituto de un LLM conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`); detalles internos no disponibles |
| Parametros totales | 7.936.688.640 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base Qwen/Qwen3.5-9B-Base, un transformer decoder-only de la familia Qwen3.5. La model card no detalla la configuracion interna (numero de capas, dimension oculta, mecanismo de atencion ni ventana de contexto), por lo que esos datos deben consultarse en la ficha del modelo base. Sobre esa base se anade una cabeza de clasificacion, dado que el pipeline declarado es `text-classification`.

El entrenamiento utiliza el fichero `sr_data/train.jsonl.gz` del dataset Xkev/BVSR-data con un objetivo de perdida pairwise: cada ejecucion compara sus propuestas situadas en el top-5% tras verificacion frente al resto, de modo que el modelo aprende a ordenar propuestas por probabilidad de exito. Los hiperparametros declarados son `lr=1e-5` para el cuerpo y `1e-3` para la cabeza, con schedule coseno y warm-up, durante una sola epoca. No se menciona RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Puntuacion y ranking de propuestas compuestas por especificacion de tarea y codigo, orientado a la seleccion previa a verificacion.
- Clasificacion de texto binaria o de relevancia segun la cabeza entrenada (pipeline `text-classification`).
- Filtrado de candidatos de bajo valor en bucles de generacion de ideas (selective retention).
- Integracion en pipelines de IA cientifica que combinen generacion de variaciones ciegas y verificacion posterior.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun el campo `language`.

## Casos de uso

- Filtrado previo a verificacion en pipelines de descubrimiento cientifico: el modelo puntua cada propuesta generada y permite descartar el percentil inferior antes de ejecutar verificaciones costosas, reduciendo el numero de ejecuciones de codigo y llamadas a modelos mayores.
- Replicacion del pipeline BVSR: sirve como selector de retencion dentro del flujo descrito en el paper, sustituyendo al componente de scoring original cuando se quiere una version autocontenida y desplegable.
- Priorizacion de parches generados por agentes de codigo: dado un conjunto de candidatos (especificacion + diff), el modelo ordena cuales tienen mas probabilidad de superar tests, de modo que solo los mejores pasan a CI.
- Triaje en generacion de hipotesis: en un sistema que produce muchas hipotesis de investigacion, el judger reduce la cola larga y deja un subconjunto manejable para revision humana.
- Evaluacion de calidad de especificaciones tecnicas: al puntuar pares tarea-codigo, puede emplearse para detectar propuestas mal especificadas o inconsistentes antes de asignar recursos.
- Servicio interno de ranking via endpoints: al estar etiquetado como compatible con endpoints y publicarse en safetensors, puede desplegarse como microservicio de scoring dentro de una plataforma de experimentacion.
- Investigacion sobre selective retention: util como linea base reproducible para comparar estrategias de seleccion en generacion creativa asistida por IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos (7,94 mil millones de parametros), mas overhead de activaciones y cache KV; en la practica, 20-24 GB como minimo.
- VRAM estimada en cuantizacion de 8 bits: en torno a 8-9 GB para pesos; en 4 bits, en torno a 4-5 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 6000 Ada; para cuantizacion en 8 bits, RTX 4090 (24 GB) resulta suficiente.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16 ajustado o cuantizado; en tarjetas de 12-16 GB requeriria cuantizacion a 4-8 bits no publicada por el autor.
- Opciones de despliegue: transformers (libreria declarada), TGI y vLLM para servir la cabeza de clasificacion; llama.cpp/Ollama solo si se generan pesos GGUF, no disponibles en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SR-judger | 7,94 B | no disponible | Ranking de propuestas (clasificacion) | Apache-2.0 | Hugging Face, safetensors |
| Qwen/Qwen3.5-9B-Base | no disponible en la informacion | no disponible | Generacion de texto (base) | no disponible en la informacion | Hugging Face |
| Modelos judge genericos de 7-8 B (p. ej. variantes de Qwen/Llama ajustadas como reward model) | ~7-8 B | variable | Scoring de respuestas | variable | Hugging Face |

La comparacion con alternativas concretas no puede completarse con datos verificados en la informacion disponible; el unico pariente directo documentado es el checkpoint base Qwen3.5-9B-Base, del que hereda arquitectura y tamano, y frente al cual SR-judger sustituye la cabeza de lenguaje por una de clasificacion entrenada con perdida pairwise.

## Limitaciones y advertencias

- Modelo altamente especializado: no es adecuado como LLM de proposito general ni para generacion de texto libre.
- Entrenado exclusivamente en ingles (`language: en`); el rendimiento en castellano u otros idiomas no esta evaluado.
- El scoring esta calibrado sobre la distribucion de propuestas del dataset BVSR; puede degradarse fuera de ese dominio (por ejemplo, en tareas de codigo no cientifico).
- Riesgo de sesgo de seleccion: al descartar propuestas de cola baja, puede eliminar ideas creativas pero atipicas, justo el tipo de variacion que el pipeline pretende preservar.
- No se documentan evaluaciones de robustez, calibracion ni tasas de alucinacion en la puntuacion.
- Sin datos publicados de benchmarks, contexto maximo ni cuantizaciones oficiales; cualquier uso en produccion requiere validacion propia.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-9B-Base debe verificarse por separado para confirmar compatibilidad de terminos.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema minimo, sin garantias de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xkev/SR-judger
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Paper: https://arxiv.org/abs/2611.12184
- Codigo: https://github.com/zou-group/BVSR
- Dataset: https://huggingface.co/datasets/Xkev/BVSR-data
