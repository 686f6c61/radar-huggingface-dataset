# yuhengtu-bytedance/DataDecide-dolma1_7-no-flan-1B-60000_62500_65000_67500_69369_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de tipo base (no ajustado por instrucciones) de 1,28 mil millones de parametros, publicado por el usuario `yuhengtu-bytedance` bajo el identificador `DataDecide-dolma1_7-no-flan-1B-60000_62500_65000_67500_69369_weightedavg_merge`. No es un modelo entrenado desde cero: es el resultado de una fusion (merge) de cinco checkpoints intermedios del mismo entrenamiento, correspondientes a los pasos 60000, 62500, 65000, 67500 y 69369 del linaje denominado `dolma1_7-no-flan`, segun la ruta de origen que figura en la model card.

La fusion se ha realizado con la herramienta mergekit mediante el metodo Linear, que promedia los pesos de los checkpoints con factores de ponderacion crecientes (1, 2, 3, 4 y 5) y normalizacion activada. El checkpoint del paso final (69369) actua simultaneamente como base de la fusion y como el modelo de mayor peso. El resultado se guarda en `bfloat16`, aunque el calculo se realiza en `float32`.

Su relevancia es fundamentalmente metodologica: encaja en lineas de investigacion sobre leyes de escalado y seleccion de datos (de ahi el prefijo `DataDecide`), donde se estudia si promediar checkpoints de distintos momentos del entrenamiento mejora las metricas frente a usar solo el checkpoint final, sin coste adicional de inferencia. Es, por tanto, un artefacto de investigacion mas que un modelo listo para producto: no tiene descargas ni interacciones, no declara licencia y no incluye model card descriptiva mas alla de la configuracion del merge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en el repositorio; se corresponde con `LlamaForCausalLM`, aunque la model card no lo explicita) |
| Parametros totales | 1.279.854.592 (aproximadamente 1,28 mil millones), segun los pesos en safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en `bfloat16` (calculo del merge en `float32`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 2,6 GB |
| Metodo de merge | Linear (promedio ponderado de pesos, `normalize: true`) |
| Checkpoints fusionados | pasos 60000, 62500, 65000, 67500 y 69369 de `dolma1_7-no-flan` |
| Pesos del merge | 1, 2, 3, 4 y 5 respectivamente |
| Fecha de creacion | 2026-09-17 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de un transformer decoder-only con atencion causal, coherente con la etiqueta `llama` y con el pipeline `text-generation`. No hay informacion publicada sobre el numero de capas, dimensiones ocultas, numero de cabezas de atencion ni funcion de activacion. Tampoco se documenta la longitud de contexto del entrenamiento ni si se aplicaron tecnicas como RoPE, atencion lineal o decodificacion especulativa. No se trata de un modelo MoE ni de una arquitectura hibrida SSM: la estructura es la de un transformer denso.

Lo unico verificable sobre el entrenamiento es su procedencia: los cinco checkpoints fusionados pertenecen a un mismo run de entrenamiento identificado como `dolma1_7-no-flan`, con un modelo de aproximadamente 1B de parametros. Por la nomenclatura puede inferirse que el corpus de preentrenamiento esta relacionado con Dolma (el dataset abierto de preentrenamiento en ingles) en su version 1.7 y sin la porcion de datos FLAN, pero esta afirmacion no se confirma en la model card y debe tratarse como una deduccion del nombre, no como un dato documentado. No se especifican el numero total de tokens vistos, la composicion del dataset, ni si hubo fases posteriores de ajuste (SFT, RLHF o DPO); dado que el repositorio se etiqueta como modelo base y que el linaje termina en un paso de preentrenamiento, lo mas probable es que no exista ninguna fase de alineacion, pero no hay confirmacion oficial.

La innovacion tecnica relevante no esta en el modelo en si, sino en el procedimiento de fusion. Se aplica el metodo Linear descrito en el articulo de "Model soups" (arXiv:2203.05482), que consiste en promediar los pesos de varios modelos con la misma arquitectura y el mismo origen. Aqui el promedio es ponderado, dando mas importancia a los checkpoints mas avanzados del entrenamiento (peso 5 para el paso 69369 frente a peso 1 para el 60000). Este tipo de interpolacion de pesos ha mostrado en la literatura mejoras de robustez y, ocasionalmente, de precision frente a los modelos individuales, con coste de inferencia identico al de un unico modelo, ya que la fusion se realiza offline. La model card no aporta ninguna evaluacion que confirme que en este caso concreto se producen tales ganancias.

## Capacidades

- Generacion de texto autoregresiva: es la capacidad basica y unica documentada por el pipeline `text-generation` del repositorio.
- Modelo base sin ajuste por instrucciones: no se ha entrenado con SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable ni mantiene formatos de conversacion sin ejemplos previos (few-shot).
- Continuacion de texto y modelado de lenguaje: util para calcular perplejidad, puntuar secuencias o completar fragmentos de texto.
- Soporte de tool calling / function calling: no documentado y poco probable en un modelo base de este tamano sin ajuste especifico.
- Soporte de agentes y razonamiento multi-paso: no documentado; no hay ninguna evidencia de capacidades agenticas.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas en el repositorio.
- Capacidades especiales: no se documenta modo de razonamiento explicito (thinking mode), vision, audio, ni ninguna otra modalidad. El modelo es exclusivamente de texto.
- Compatibilidad con `text-generation-inference` y con endpoints de HuggingFace: si, segun las etiquetas `text-generation-inference` y `endpoints_compatible` del repositorio.

## Casos de uso

- Investigacion sobre fusion de modelos: el caso de uso principal y mas realista. Permite reproducir y analizar si el promedio ponderado de checkpoints intermedios supera al checkpoint final en tareas de validacion del propio linaje `dolma1_7-no-flan`.
- Estudios de leyes de escalado y seleccion de datos: dado el prefijo `DataDecide`, el modelo sirve como punto de medida dentro de experimentos que comparan recetas de datos (por ejemplo, con y sin la porcion FLAN) a una escala de 1B de parametros.
- Punto de partida para ajuste fino supervisado: al ser un modelo base de 1,28B, cabe en una sola GPU de gama alta y puede recibir un SFT ligero para una tarea concreta (clasificacion de textos, extraccion de campos, generacion de resumenes de dominio) antes de plantearse el despliegue.
- Generacion de datos sinteticos para entrenamiento: el modelo puede producir texto de continuacion a gran escala para aumentar un corpus, siempre que se filtre la calidad y se asuma la ausencia de alineacion.
- Linea base de evaluacion comparativa: util como referencia en experimentos de mezcla de pesos frente a otro checkpoint del mismo linaje, midiendo perplejidad o exactitud en tareas de validacion.
- Destilacion de conocimiento hacia modelos menores: al ser pequeno y de pesos abiertos, puede utilizarse como profesor en procesos de destilacion sobre arquitecturas aun mas reducidas.
- Prototipado educativo de pipelines de `transformers` y de despliegue con TGI: el repositorio es compatible con la libreria `transformers` y con `text-generation-inference`, lo que facilita montar una demo de inferencia sin ingenieria adicional.
- Investigacion sobre seguridad y medicion de sesgos: la ruta de origen del merge (`Pan_Safety_Better_Measurement`) sugiere que el modelo forma parte de un estudio de medicion de seguridad, por lo que puede emplearse como sujeto de evaluacion, no como herramienta de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente documenta la configuracion YAML del merge; no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra metrica, y tampoco se ha encontrado ninguna evaluacion externa en los resultados de busqueda disponibles.

## Requisitos de hardware

- Peso de los pesos en `bfloat16`: aproximadamente 2,56 GB (1,28 mil millones de parametros a 2 bytes por parametro). El repositorio ocupa 2,6 GB, consistente con este calculo.
- Peso de los pesos en `float32`: aproximadamente 5,12 GB.
- VRAM estimada para inferencia en `bfloat16`: entre 3 y 4 GB considerando pesos y cache KV para contextos cortos, con margen para el entorno de ejecucion.
- VRAM estimada con cuantizacion de 8 bits: en torno a 1,5 GB; con cuantizacion de 4 bits, en torno a 1 GB. Estas cuantizaciones no estan publicadas en el repositorio y requeririan conversion propia.
- GPU recomendadas: cabe con holgura en tarjetas de consumo con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090). En el ambito profesional, cualquier A100, H100, L40S o L4 con suficiente memoria lo ejecuta sin problemas; el modelo es pequeno para ese hardware y lo habitual seria agrupar varias instancias por GPU.
- Despliegue: `transformers` (libreria declarada), `text-generation-inference` (etiqueta explicita y compatibilidad con endpoints), `vLLM` (compatible a nivel de arquitectura, aunque no verificado en este repositorio), `llama.cpp` u `Ollama` previa conversion a GGUF, ya que no se publica ningun archivo GGUF.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de primera respuesta.

## Comparativa con modelos similares

La comparacion se establece con modelos base abiertos de tamano cercano a 1B. Los datos de parametros y contexto corresponden a la informacion publica de cada proyecto; los datos de rendimiento no estan disponibles para este modelo, por lo que no se comparan metricas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks en esta ficha |
|---|---|---|---|---|---|
| DataDecide-dolma1_7-no-flan-1B (merge lineal) | 1,28 mil millones | no disponible | no disponible | HuggingFace, safetensors | no disponibles |
| OLMo 2 1B | aproximadamente 1,2 mil millones | 4096 tokens | Apache 2.0 | HuggingFace, pesos y codigo de entrenamiento | no comparados aqui |
| Llama 3.2 1B | aproximadamente 1,24 mil millones | 128 000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace, acceso con aceptacion de terminos | no comparados aqui |
| Qwen2.5 1.5B | aproximadamente 1,54 mil millones | 32 768 tokens | Apache 2.0 | HuggingFace | no comparados aqui |
| TinyLlama 1.1B | aproximadamente 1,1 mil millones | 2048 tokens | Apache 2.0 | HuggingFace | no comparados aqui |

Las diferencias clave frente a estas alternativas son la ausencia total de documentacion sobre entrenamiento, la falta de licencia declarada y la ausencia de datos de evaluacion, frente a proyectos con model cards completas, contexto largo y licencias explicitas. Como contrapartida, este checkpoint ofrece un caso de estudio reproducible de fusion de pesos ponderada por paso de entrenamiento, algo que las alternativas citadas no implementan.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica ninguna licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, esto equivale a no tener derechos claros de explotacion y desaconseja su uso en produccion.
- Ausencia de model card descriptiva: no hay informacion sobre datos de entrenamiento, numero de tokens, composicion del corpus ni hiperparametros. Cualquier afirmacion sobre el corpus (por ejemplo, que use Dolma 1.7 sin FLAN) es una deduccion del nombre, no un dato confirmado.
- Modelo base sin alineacion: al no haber pasado por SFT, RLHF ni DPO, es previsible que no siga instrucciones de forma fiable, que ignore formatos de chat y que genere contenido inapropiado u ofensivo reproduciendo patrones del corpus de preentrenamiento.
- Riesgo de alucinacion: no hay datos de evaluacion de factualidad; como cualquier modelo de lenguaje de esta escala entrenado sobre texto web, tiende a producir afirmaciones plausibles pero incorrectas.
- Longitud de contexto desconocida: no se especifica la ventana de contexto, lo que complica dimensionar la cache KV y planificar casos de uso con entradas largas.
- Cobertura idiomatica desconocida: no se declara lista de idiomas. Si el linaje `dolma1_7` corresponde al dataset Dolma, el sesgo hacia el ingles seria previsible, con un rendimiento muy inferior en castellano u otros idiomas.
- Artefacto de investigacion: el modelo procede de rutas internas de un experimento (`merge_scaling_ckpts_cache`, `Pan_Safety_Better_Measurement`) y de checkpoints intermedios, no de un entrenamiento completado con criterios de calidad de producto. No hay garantia de estabilidad ni de que el paso 69369 represente el final del entrenamiento.
- Sesgos conocidos: no se han publicado analisis de sesgo para este checkpoint. La herencia de sesgos del corpus subyacente es esperable y no esta cuantificada.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 interacciones, por lo que no existe validacion externa de su comportamiento ni de su calidad.
- Proceso de merge no auditado: no se publican los scripts de evaluacion que justifiquen las ponderaciones 1-2-3-4-5 elegidas, ni una comparacion contra el checkpoint final sin fusionar.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-dolma1_7-no-flan-1B-60000_62500_65000_67500_69369_weightedavg_merge
- Repositorio de mergekit (herramienta usada para la fusion): https://github.com/cg123/mergekit
- Articulo referenciado para el metodo de fusion Linear (Model soups, promedio de pesos): https://arxiv.org/abs/2203.05482
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo, su linaje ni benchmarks asociados; los resultados devueltos por el buscador no guardan relacion con el modelo.
- No se dispone de paper, blog tecnico, repositorio de codigo de entrenamiento, demo ni dataset publicado por el autor.
