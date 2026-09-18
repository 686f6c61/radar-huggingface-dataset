# yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-tulu-10p-1B-57500_60000_62500_65000_67500_weightedavg_merge

## Resumen

Este repositorio contiene un modelo de lenguaje de 1.279.854.592 parametros (aproximadamente 1,28 mil millones) obtenido mediante la fusion de pesos de cinco checkpoints intermedios de un mismo entrenamiento. La fusion se ha realizado con la herramienta mergekit aplicando el metodo Linear con normalizacion, ponderando los checkpoints de los pasos 57.500, 60.000, 62.500, 65.000 y 67.500 con pesos 1, 2, 3, 4 y 5 respectivamente, y tomando el paso 67.500 como modelo base. Los pesos resultantes se emiten en bfloat16 a partir de un calculo intermedio en float32.

El modelo lo publica el usuario yuhengtu-bytedance y no dispone de model card descriptiva mas alla de la configuracion de fusion generada automaticamente por mergekit. La nomenclatura de los checkpoints de origen (falcon-and-cc-qc-tulu-10p) sugiere un experimento de preentrenamiento a escala 1B sobre una mezcla de datos que combina Falcon, Common Crawl, datos filtrados por clasificador de calidad y Tulu con una proporcion del 10 por ciento, si bien esta interpretacion no viene documentada en el repositorio y debe tomarse como inferencia a partir del nombre.

Su relevancia es acotada y muy especifica: se trata de un artefacto de investigacion util para estudiar estrategias de fusion de checkpoints (model soups) en lugar de un modelo listo para produccion. No se publican benchmarks, idiomas soportados ni licencia, y el repositorio no incluye pesos cuantizados ni plantillas de chat, por lo que cualquier uso practico exige una evaluacion previa por parte de quien lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (etiqueta `llama` en HuggingFace; sin detalle de capas, dimension oculta o cabezas en la informacion disponible) |
| Parametros totales | 1.279.854.592 (≈1,28 B), dato real de los safetensors |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en bfloat16 (sin GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |
| Tamano del repositorio | 2,6 GB |
| Metodo de fusion | Linear con `normalize: true`, calculo en float32 y salida en bfloat16 |
| Checkpoints fusionados | pasos 57500 (peso 1), 60000 (peso 2), 62500 (peso 3), 65000 (peso 4) y 67500 (peso 5, base) |
| Pipeline declarado | text-generation |

## Arquitectura y entrenamiento

No se documenta la arquitectura interna mas alla de la etiqueta `llama` y la libreria `transformers`, por lo que no es posible confirmar numero de capas, dimension del modelo, tipo de atencion ni tamano de vocabulario. El dato contrastado es el recuento de parametros de los safetensors: 1.279.854.592. Tampoco se especifica la longitud de contexto durante el preentrenamiento ni la composicion exacta del dataset.

Lo que si esta documentado es el procedimiento de construccion del artefacto. Se trata de una mezcla lineal de pesos (metodo Linear de mergekit, descrito en el paper de model soups, arXiv:2203.05482) sobre cinco checkpoints de un mismo run de preentrenamiento denominado `falcon-and-cc-qc-tulu-10p`. La configuracion aplica pesos crecientes hacia el checkpoint final (1-2-3-4-5) con normalizacion, de modo que el resultado es una interpolacion ponderada que se aproxima mas al ultimo paso de entrenamiento pero suavizada por los pasos previos. El calculo se hace en float32 y se emite en bfloat16. No hay indicios de fases posteriores de ajuste (SFT, RLHF, DPO) ni de innovaciones tecnicas adicionales: es un checkpoint intermedio promediado, no un modelo alineado.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de los checkpoints de preentrenamiento fusionados.
- No hay evidencia de modo de razonamiento explicito (thinking mode), ni de soporte declarado de tool calling o function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se declara cobertura multilingue concreta; los idiomas figuran como no disponibles.
- No se declaran capacidades de vision, audio ni multimodalidad.
- No se incluye plantilla de chat (`chat_template`) ni tokenizador documentado mas alla de los ficheros estandar del repositorio, por lo que el uso conversacional no esta garantizado.
- Etiquetado como compatible con text-generation-inference y con endpoints alojados, es decir, desplegable tecnicamente, aunque sin garantias de calidad.

## Casos de uso

- Investigacion sobre fusion de modelos: el caso de uso principal es reproducir o analizar el efecto del promediado ponderado de checkpoints intermedios frente a usar unicamente el checkpoint final (paso 67500). Permite medir si la interpolacion mejora la robustez en tareas de evaluacion few-shot.
- Estudios de escalado de datos de preentrenamiento: al proceder de un run con mezcla de datos identificable por nombre (Falcon, Common Crawl, filtrado por calidad, Tulu), sirve como punto de comparacion en experimentos sobre composicion de datasets a escala 1B.
- Modelo base para ajuste fino supervisado: con 1,28 B de parametros y pesos en bfloat16, se puede afinar en una GPU de consumo para tareas concretas de generacion de texto, partiendo de la base de que no hay licencia declarada y habria que aclarar los terminos antes de un uso comercial.
- Generacion de texto de bajo coste en local: el modelo cabe en GPUs de gama media-baja, por lo que puede emplearse para tareas de completado, resumen o reformulacion con requisitos de privacidad estrictos, siempre que se valide antes la calidad real.
- Punto de partida para tecnicas de cuantizacion: al publicarse solo en bfloat16, es un candidato para generar versiones GGUF, AWQ o GPTQ y medir la degradacion asociada, aunque esas conversiones no se ofrecen en el repositorio.
- Docencia y divulgacion sobre mergekit: la configuracion YAML incluida es un ejemplo didactico de mezcla lineal con normalizacion y pesos no uniformes.
- Componente de ensembles a nivel de pesos en pipelines de investigacion: puede combinarse con otros checkpoints del mismo run para explorar la superficie de interpolacion.
- No se recomienda su uso en atencion al cliente, agentes autonomos o generacion de codigo en produccion, dado que no hay evidencia de ajuste por instrucciones, ni de tool calling, ni de evaluaciones publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no ha devuelto datos de rendimiento asociados a este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento real de parametros, sin incluir cache KV porque se desconoce la configuracion de capas y contexto):
  - bfloat16 o float16: aproximadamente 2,56 GB de pesos (2,38 GiB).
  - int8: aproximadamente 1,28 GB de pesos (1,19 GiB).
  - int4: aproximadamente 0,64 GB de pesos (0,60 GiB).
- Cache KV: no disponible; depende del numero de capas, cabezas y longitud de contexto, que no se documentan. Con contextos de pocos miles de tokens el consumo adicional suele ser de cientos de MB, pero no puede confirmarse para este modelo.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para bfloat16 en una sola secuencia. Cabria en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090. Para servir con lotes grandes, A100 40/80 GB o H100 permitirian un throughput mucho mayor, aunque el cuello de botella a esta escala es el ancho de banda de memoria, no la capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de 8 GB o mas con precision reducida, y en GPUs de 4-6 GB si se cuantiza a int4 o int8 (conversion no publicada por el autor).
- Opciones de despliegue: `transformers` (libreria declarada), text-generation-inference (etiqueta explicita) y endpoints compatibles con la API de HuggingFace. vLLM es viable al ser una arquitectura tipo llama, pero no esta verificado por el autor. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, tarea que puede hacerse con las utilidades de mergekit o del propio llama.cpp, aunque el resultado no esta publicado ni validado.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

La comparativa se establece con modelos base de tamano comparable de dominio publico. Los datos de las alternativas no provienen del repositorio analizado, sino de su informacion publica habitual; los del modelo de esta ficha son los unicos verificados contra los safetensors.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad de pesos | Evaluaciones publicadas |
|---|---|---|---|---|---|
| Este modelo (DataDecide-falcon-and-cc-qc-tulu-10p, fusion ponderada) | 1,28 B | no disponible | no disponible | safetensors en bfloat16 | no |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF, cuantizaciones variadas | si |
| Qwen2.5 1.5B | 1,54 B | 32.768 tokens nativos | Apache 2.0 | safetensors, GGUF, AWQ, GPTQ | si |
| SmolLM2 1.7B | 1,71 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | si |
| TinyLlama 1.1B | 1,10 B | 2.048 tokens | Apache 2.0 | safetensors, GGUF | si |

Diferencias clave: el modelo analizado es un artefacto de investigacion sin licencia, sin contexto documentado y sin evaluaciones, mientras que las alternativas son modelos base con terminos de uso definidos, soporte de cuantizacion amplio y resultados publicados. Para cualquier aplicacion real, las alternativas de la tabla son opciones mas seguras mientras no se publique documentacion adicional de este merge.

## Limitaciones y advertencias

- Ausencia total de licencia: no se especifican terminos de uso, lo que impide determinar si el uso comercial esta permitido. En la practica, esto lo desaconseja para produccion hasta que el autor lo aclare.
- Es un checkpoint intermedio promediado, no un modelo ajustado por instrucciones: no hay evidencia de SFT, RLHF ni DPO, por lo que las respuestas no estaran alineadas con formatos conversacionales ni con instrucciones de seguridad.
- Riesgo elevado de alucinacion y de salidas incoherentes, propio de modelos base de 1,28 B sin ajuste posterior.
- Sesgos desconocidos: la composicion del dataset de preentrenamiento no esta documentada (solo se intuye por el nombre del run), por lo que no se puede evaluar la presencia de sesgos demograficos, linguísticos o de contenido.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en ningun otro idioma concreto.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo ni estimar con precision el consumo de cache KV.
- Artefacto no reproducible de forma directa: la configuracion de mergekit apunta a rutas locales del entorno del autor (`/opt/tiger/...`), no a identificadores de HuggingFace, por lo que no es posible descargar los checkpoints de origen desde el repositorio.
- Cero adopcion registrada: el repositorio figura con 0 descargas y 0 likes, sin issues ni discusion que aporten validacion externa.
- Fecha de creacion y actualizacion muy proximas (17 de septiembre de 2026, con dos minutos de diferencia), lo que sugiere una subida automatizada sin curaduria posterior.
- Los resultados de la busqueda web realizada no guardan relacion con el modelo (corresponden a un manual de medicina veterinaria), por lo que no aportan contexto tecnico util.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/DataDecide-falcon-and-cc-qc-tulu-10p-1B-57500_60000_62500_65000_67500_weightedavg_merge
- mergekit (herramienta de fusion utilizada): https://github.com/cg123/mergekit
- Paper del metodo Linear / model soups: https://arxiv.org/abs/2203.05482
- Paper de DataDecide (referencia no citada en la model card, solo inferida por la nomenclatura): no disponible en la informacion proporcionada
- Repositorio de checkpoints de origen: no disponible (las rutas YAML son locales del autor)
- Demos o espacios asociados: no disponible
- Resultados de busqueda web relevantes: no disponible (la busqueda devolvio unicamente resultados sin relacion con el modelo)
