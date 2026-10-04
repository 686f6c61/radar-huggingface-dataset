# wz7475/gemma-3-4b-it-katcher-med-sft-hf

## Resumen

`wz7475/gemma-3-4b-it-katcher-med-sft-hf` es un checkpoint publicado en HuggingFace por el usuario wz7475, cuyo nombre sugiere un ajuste supervisado (SFT, *supervised fine-tuning*) orientado a dominio medico sobre el modelo base `google/gemma-3-4b-it`. El repositorio se creo y actualizo el 3 de octubre de 2026 (fechas de metadatos que resultan anomales) y acumula 0 descargas y 0 likes en el momento de la consulta. No cuenta con pipeline declarado, ni licencia, ni idiomas, ni documentacion tecnica: la model card es la plantilla autogenerada por HuggingFace con todos los campos marcados como `[More Information Needed]`.

La relevancia de este checkpoint es, por tanto, limitada y fundamentalmente especulativa: se apoya en el modelo base que su nombre implica (Gemma 3 4B instruct, un transformer multimodal con 4 000 millones de parametros y ventana de contexto de 128 000 tokens segun la ficha oficial de Google), pero el autor no confirma esa ascendencia ni aporta datos de entrenamiento, datos de ajuste, hiperparametros o evaluaciones. El tamano del repositorio (0,3 GB) es incompatible con un checkpoint completo de 4B parametros incluso en cuantizacion de 4 bits, lo que sugiere que el contenido publicado podria ser un adaptador, un subconjunto de pesos o un artefacto incompleto.

Se recomienda tratar este repositorio como un experimento personal no documentado. Cualquier uso en produccion o en investigacion exigiria una auditoria previa de los ficheros safetensors, la verificacion de la licencia real y la reproduccion de evaluaciones propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no la documenta; el identificador del repositorio apunta a un ajuste sobre `google/gemma-3-4b-it`) |
| Parametros totales | no disponible (el identificador del repositorio indica el sufijo `4b`; no confirmado por el autor) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni GPTQ/AWQ declarados) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card no la declara) |
| Formato de pesos | safetensors |
| Libreria declarada | transformers |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | no disponible |
| Etiquetas | transformers, safetensors, arxiv:1910.09700, endpoints_compatible, region:us |
| Fecha de creacion | 2026-10-03T21:46:19Z |
| Fecha de actualizacion | 2026-10-03T21:48:20Z |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe ni la arquitectura ni el procedimiento de entrenamiento: todos los apartados (`Model Architecture and Objective`, `Training Data`, `Training Hyperparameters`, `Speeds, Sizes, Times`) aparecen sin rellenar. La etiqueta `arxiv:1910.09700` corresponde al articulo de Lacoste et al. sobre estimacion de emisiones de carbono en aprendizaje automatico, que se cita en la plantilla estandar de HuggingFace; no es una referencia a la arquitectura ni al entrenamiento del modelo.

Si se acepta como valida la ascendencia que sugiere el nombre del repositorio, el modelo base `google/gemma-3-4b-it` es un transformer decoder-only multimodal (texto e imagen) de 4 000 millones de parametros, entrenado sobre datos multimodales multilingues y con una ventana de contexto de 128 000 tokens, que combina atencion local con ventana deslizante y atencion global. El sufijo `katcher-med-sft` apuntaria a un ajuste supervisado adicional sobre un corpus medico, presumiblemente con pares instruccion-respuesta. Ninguno de estos extremos esta confirmado por el autor, ni se especifica el numero de tokens de ajuste, la composicion del dataset, ni si hubo etapas de RLHF, DPO o preferencia.

El tamano del repositorio (0,3 GB) refuerza la incertidumbre: un checkpoint de 4B parametros en bf16 ocuparia alrededor de 8 GB, y en cuantizacion de 4 bits alrededor de 2,4 GB. Un unico fichero o conjunto de ficheros de 0,3 GB no puede contener los pesos completos del modelo, por lo que es plausible que se trate de un adaptador tipo LoRA, de un shard parcial o de un artefacto mal subido.

## Capacidades

No hay ninguna capacidad documentada por el autor. A continuacion se listan las capacidades que cabria esperar si el modelo es efectivamente un ajuste de `gemma-3-4b-it`, marcadas explicitamente como inferidas y no verificadas:

- Generacion de texto y conversacion multi-turno: capacidad heredada del modelo base instruct, no verificada en este checkpoint.
- Razonamiento y matemeticas basicas: esperable en un modelo de 4B ajustado por instrucciones, sin datos de evaluacion disponibles.
- Generacion de codigo: capacidad limitada por el tamano del modelo base; no verificada.
- Capacidades medicas: el sufijo `med-sft` sugiere especializacion en dominio sanitario, pero no hay descripcion del corpus, ni de la tarea, ni de validacion clinica alguna.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (el modelo base implicito soporta multiples idiomas, pero el autor no declara ninguno).
- Vision: no disponible en este checkpoint, aunque el modelo base implicito es multimodal.
- Modo de razonamiento explicito (*thinking mode*): no disponible.
- Audio: no disponible.

## Casos de uso

Los siguientes escenarios son hipoteticos y se derivan unicamente del nombre del repositorio y del perfil del modelo base. No estan respaldados por evaluaciones ni por documentacion del autor, por lo que no deberian adoptarse sin validacion previa.

- Triage de consultas medicas en entornos controlados: un modelo de 4B ajustado sobre corpus clinico podria clasificar sintomas y derivar a especialidad, pero requiere validacion por personal sanitario y auditoria de sesgos antes de cualquier uso real.
- Resumen de informes clinicos: la ventana de contexto larga del modelo base (128 000 tokens, no confirmada en este ajuste) permitiria condensar historiales extensos; exigiria verificacion factual contra el documento original.
- Extraccion de entidades en texto biomedico: identificacion de farmacos, dosis, diagnosticos y codigos, integrable en pipelines de estructuración de historiales.
- Generacion de respuestas a preguntas frecuentes de pacientes: asistente de primer nivel con derivacion obligatoria a profesional sanitario y filtros de seguridad.
- Prototipado academico e investigacion en NLP clinico: punto de partida para comparar estrategias de ajuste sobre modelos pequenos en dominios especializados.
- Educacion medica y simulacion de casos: generacion de escenarios de estudio y preguntas de autoevaluacion, siempre con revision experta.
- Base para destilacion o ajuste posterior: al ser un modelo pequeno, puede servir como punto de partida para ajustes con LoRA en tareas medicas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye la seccion de evaluacion, no hay tabla de resultados y la busqueda web no ha devuelto ninguna referencia tecnica al modelo.

## Requisitos de hardware

Todas las cifras de esta seccion son estimaciones derivadas del supuesto de que el modelo tiene 4 000 millones de parametros, no datos publicados por el autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 8-9 GB solo para pesos, mas 1-2 GB de cache KV para contextos moderados; en torno a 10-12 GB en total.
- VRAM para inferencia en int8: aproximadamente 4-5 GB de pesos mas cache.
- VRAM para inferencia en 4 bits (si se generan cuantizaciones GGUF o GPTQ/AWQ): aproximadamente 2,5-3,5 GB.
- GPU de consumo: cabe en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 en bf16 sin problema, y en GPUs de 8 GB si se usa cuantizacion de 4 bits.
- GPU de centro de datos: A100 40/80 GB, H100, L40S; sobredimensionadas para un modelo de este tamano salvo despliegue por lotes a gran escala.
- Opciones de despliegue: `transformers` de forma nativa; vLLM y TGI para servido con batching continuo; llama.cpp u Ollama unicamente si se generan cuantizaciones GGUF, que no estan publicadas en el repositorio.
- Latencia y throughput: no disponible. No hay mediciones publicadas ni datos de infraestructura de entrenamiento o inferencia en la model card.
- Advertencia: dado que el repositorio ocupa 0,3 GB, es probable que los pesos publicados no sean suficientes para cargar el modelo completo. Verificar la integridad de los ficheros antes de planificar cualquier despliegue.

## Comparativa con modelos similares

La comparativa se establece con alternativas de rango 3-4B ampliamente documentadas. Los datos del modelo evaluado son no disponibles; los de las alternativas provienen de sus fichas publicas y deben verificarse en la fuente original. La columna de rendimiento se deja como no disponible porque no existen resultados de benchmarks para el checkpoint `wz7475/gemma-3-4b-it-katcher-med-sft-hf`.

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| wz7475/gemma-3-4b-it-katcher-med-sft-hf | no disponible (sufijo `4b`) | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| google/gemma-3-4b-it (base implicito) | 4B | 128 000 tokens | licencia Gemma | documentado en la ficha oficial de Google | HuggingFace, ampliamente desplegado |
| Qwen2.5-3B-Instruct | 3,09B | 32 768 tokens nativos, ampliable a 131 072 | Apache 2.0 | documentado en la ficha oficial | HuggingFace, muy usado |
| Llama-3.2-3B-Instruct | 3,21B | 128 000 tokens | licencia comunitaria Llama 3.2 | documentado en la ficha oficial | HuggingFace, muy usado |
| Phi-3.5-mini-instruct | 3,8B | 128 000 tokens | MIT | documentado en la ficha oficial | HuggingFace, muy usado |

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada sin ningun campo completado, lo que impide conocer arquitectura, datos, hiperparametros y objetivo del ajuste.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial, redistribucion o modificacion. Si el modelo base es Gemma 3, se aplicarian los terminos de uso de Gemma, que imponen obligaciones adicionales de atribucion y uso aceptable, pero esto no esta confirmado por el autor.
- Riesgo de alucinacion elevado en contexto clinico: cualquier modelo de 4B ajustado sobre datos no documentados puede generar afirmaciones medicas plausibles pero falsas, con riesgo directo para la salud si se usa sin supervision profesional.
- Sesgos desconocidos: no se ha publicado informacion sobre composicion del dataset de ajuste, idiomas, distribucion demografica ni procesos de mitigacion de sesgos.
- Trazabilidad nula del ajuste: se desconoce si el ajuste fue supervisado con datos reales, sinteticos o generados automaticamente, y si existio filtrado o curacion del corpus medico.
- Periodo de entrenamiento desconocido: si el ajuste se realizo sobre datos previos a 2026, podria contener conocimiento desactualizado en un dominio donde la vigencia es critica.
- Repositorio sospechosamente pequeno: 0,3 GB es incompatible con pesos completos de 4B parametros en cualquier precision razonable. Puede tratarse de un adaptador, de un shard aislado o de un error de publicacion.
- Metadatos anomalos: las fechas de creacion y actualizacion (octubre de 2026) y la diferencia de dos minutos entre ambas sugieren una publicacion automatizada o con reloj incorrecto.
- Cero adopcion verificable: 0 descargas y 0 likes implican ausencia de validacion por terceros, de informes de errores y de casos de uso reproducibles.
- Resultados de busqueda no concluyentes: las busquedas web realizadas no han devuelto ningun resultado relacionado con el modelo, su autor o su dataset.
- Recomendacion de uso: no emplear en produccion, en entornos clinicos ni con datos personales de salud sin una auditoria tecnica completa, una verificacion de licencia y una evaluacion de seguridad especifica del dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wz7475/gemma-3-4b-it-katcher-med-sft-hf
- Modelo base implicito (no confirmado por el autor): https://huggingface.co/google/gemma-3-4b-it
- Articulo referenciado en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono en aprendizaje automatico): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de aprendizaje automatico: https://mlco2.github.io/impact
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repositorios o demos) en la busqueda web. Los resultados devueltos por el buscador no guardan ninguna relacion con el modelo ni con su autora o autor.
