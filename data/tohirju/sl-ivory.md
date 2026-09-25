# Tohirju/sl-ivory

## Resumen

sl-ivory es un modelo publicado por el usuario Tohirju en HuggingFace, construido a partir de google/gemma-4-E4B-it mediante un proceso de adaptacion etiquetado como LoRA y continual-pretraining sobre tayiko (codigo de idioma tg). Las etiquetas del repositorio lo situan explicitamente en el ambito de Asia Central, lo que lo convierte en un intento de adaptar un modelo base instruccional de la familia Gemma a una lengua de bajos recursos con representacion limitada en los corpus web mayoritarios.

El repositorio tiene un tamano de 19,7 GB, esta sujeto a acceso restringido (gated, requiere aceptar condiciones en HuggingFace) y se distribuye bajo los terminos de licencia Gemma. En el momento de redactar esta ficha acumula 0 descargas y 0 "likes", y no incluye informacion publica sobre pipeline, numero de parametros, longitud de contexto ni composicion del dataset de entrenamiento.

Su relevancia es, por tanto, la de un artefacto de investigacion en fase temprana: resulta interesante para quien trabaje en NLP de lenguas turquicas y de Asia Central, pero no dispone de evaluaciones publicadas, ni de documentacion tecnica detallada, ni de validacion por parte de terceros. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible; heredada del modelo base google/gemma-4-E4B-it, sin detalle en la informacion proporcionada |
| Parametros totales | No disponible |
| Parametros activos | No disponible (el identificador del modelo base incluye el sufijo "E4B", cuyo significado no se confirma en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio se distribuye en safetensors, sin versiones GGUF ni cuantizadas publicadas |
| Idiomas soportados | Tayiko (tg); etiquetas asociadas a Asia Central (central-asia). No se detallan otros idiomas |
| Licencia | Gemma (terminos de licencia de Google para la familia Gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Las etiquetas del repositorio indican que se ha aplicado un adaptador LoRA y un proceso de continual-pretraining sobre el modelo base google/gemma-4-E4B-it, una variante instruccional de la familia Gemma. No se especifica si los pesos publicados corresponden al adaptador LoRA sin fusionar, al adaptador fusionado con el modelo base o a un modelo completo, ni si el entrenamiento incluyo etapas de ajuste supervisado, RLHF o DPO.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del corpus en tayiko, el uso de datos sinteticos o traducidos, la longitud de secuencia durante el entrenamiento ni hiperparametros como rango de LoRA, tasa de aprendizaje o numero de epocas. No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, mezcla de expertos u otras). El unico dato cuantitativo disponible es el tamano del repositorio, 19,7 GB.

## Capacidades

Las capacidades que se listan a continuacion se infieren de las etiquetas del repositorio y de la naturaleza del modelo base (una variante instruccional de Gemma); no estan confirmadas por una model card del autor ni por evaluaciones publicadas.

- Generacion de texto y seguimiento de instrucciones en tayiko, como consecuencia del ajuste sobre un modelo base de tipo "-it".
- Continuacion y adaptacion de estilo sobre texto en tayiko, derivada del proceso declarado de continual-pretraining.
- Capacidades multilingues heredadas del modelo base, presumiblemente con un rendimiento desproporcionadamente mejor en tayiko tras el ajuste, aunque sin datos que lo cuantifiquen.
- Razonamiento, generacion de codigo y matematicas: no disponible en la informacion proporcionada.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Traduccion tayiko-espanol o tayiko-ingles en entornos editoriales: el modelo puede emplearse como motor de traduccion asistida sobre un modelo base multilingue adaptado al tayiko, con revision humana posterior obligatoria dado que no existen evaluaciones publicadas de calidad de traduccion.
- Generacion de contenido en tayiko para medios digitales y redes sociales: redaccion de borradores, titulares y resumenes en una lengua con poca cobertura en modelos comerciales, aprovechando el ajuste especifico sobre el idioma.
- Atencion al ciudadano en tayiko dentro de administraciones publicas de Asia Central: prototipos de asistente conversacional para consultas frecuentes, siempre que se despliegue en infraestructura propia por el acceso restringido del repositorio y las condiciones de la licencia Gemma.
- Investigacion en NLP de lenguas de bajos recursos: punto de partida para experimentos de comparacion entre adaptacion por LoRA y ajuste completo en turquico, reutilizando el modelo base como referencia.
- Preprocesado y normalizacion de corpus en tayiko: limpieza, reescritura y aumento de datos para alimentar otros sistemas de NLP (clasificadores, sistemas de recuperacion, traductores estadisticos).
- Educacion y materiales didacticos: generacion de ejercicios, resumenes y explicaciones en tayiko para plataformas de aprendizaje, con supervision docente.
- Post-procesado de transcripciones de voz: correccion de puntuacion, mayusculas y errores obvios de sistemas ASR en tayiko antes de su publicacion.
- Prototipado rapido de chatbots sectoriales (turismo, sanidad, banca) en tayiko, como paso previo a un ajuste especifico con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K, perplexity en tayiko ni ninguna otra metrica, y la busqueda web realizada no devolvio ningun analisis independiente del modelo.

| Benchmark | sl-ivory | Referencia (modelo base) |
|---|---|---|
| MMLU | No disponible | No disponible en la informacion proporcionada |
| HumanEval | No disponible | No disponible en la informacion proporcionada |
| GSM8K | No disponible | No disponible en la informacion proporcionada |
| Perplexity en tayiko | No disponible | No disponible en la informacion proporcionada |

## Requisitos de hardware

- VRAM para inferencia: no disponible con precision al desconocerse el numero de parametros. Estimacion aritmetica a partir del tamano del repositorio (19,7 GB): si los pesos estan en bf16 o fp16, el modelo rondaria los 10 000 millones de parametros, lo que implicaria aproximadamente 20 GB en fp16, 10-11 GB en int8 y 5-6 GB en cuantizacion de 4 bits. Si los pesos estuvieran en fp32, el orden seria de 5 000 millones de parametros, con unos 10 GB en fp16. Estas cifras son estimaciones, no datos confirmados por el autor.
- Si el modelo se distribuye unicamente como adaptador LoRA, la VRAM necesaria es la del modelo base mas el adaptador superpuesto, con el mismo orden de magnitud que las cifras anteriores.
- GPU recomendadas: no disponible. Como referencia general para un modelo de ese rango de tamano, una GPU con 24 GB (RTX 3090, RTX 4090) permitiria inferencia en fp16 si el modelo esta en el entorno de 10 000 millones de parametros, y una A100 40/80 GB o H100 daria margen para lotes mayores y contextos largos.
- Viabilidad en GPU de consumo: probablemente viable en tarjetas de 24 GB con cuantizacion de 8 o 4 bits, y en tarjetas de 12-16 GB con cuantizacion agresiva, sujeto a confirmacion del numero real de parametros. No hay cuantizaciones publicadas en el repositorio.
- Opciones de despliegue: el repositorio solo ofrece safetensors, por lo que el despliegue requeriria convertir los pesos a GGUF para llama.cpp u Ollama, o cargarlos directamente con vLLM, TGI, Transformers o SGLang en formato safetensors. No se documenta ninguna integracion probada.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparativa con adaptaciones especificas para tayiko no es posible: no se dispone de datos publicos de modelos equivalentes en la informacion proporcionada. Se incluye como referencia el modelo base y dos alternativas genericas de rango similar en el ecosistema abierto, cuyas especificaciones son publicas.

| Modelo | Parametros | Contexto | Licencia | Idiomas destacados | Disponibilidad |
|---|---|---|---|---|---|
| Tohirju/sl-ivory | No disponible | No disponible | Gemma | Tayiko (tg) | Gated, 0 descargas |
| google/gemma-4-E4B-it (base) | No disponible | No disponible | Gemma | Multilingue | Publico (segun condiciones) |
| Qwen2.5-7B-Instruct | 7 600 millones | 32 768 tokens nativos, 131 072 con YaRN | Apache 2.0 | Multilingue, con cobertura limitada de turquico | Publico |
| Llama-3.1-8B-Instruct | 8 000 millones | 131 072 tokens | Llama 3.1 Community License | Multilingue, con cobertura limitada de turquico | Publico (gated en algunos casos) |

La comparacion de rendimiento en tayiko entre estos modelos y sl-ivory no esta disponible, ya que no existen evaluaciones publicadas del modelo objeto de esta ficha.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks, ni perplexity, ni pruebas de calidad de traduccion o generacion en tayiko, lo que impide estimar su rendimiento real frente al modelo base.
- Riesgo elevado de alucinacion: al tratarse de un modelo ajustado sobre una lengua de bajos recursos y sin datos de validacion, la generacion de hechos, nombres o cifras en tayiko debe verificarse siempre.
- Sesgos desconocidos: no se documenta la composicion del corpus de continual-pretraining, por lo que no puede evaluarse el sesgo geografico, politico o cultural, un aspecto especialmente sensible en el contexto de Asia Central.
- Cobertura idiomatica limitada: aunque el modelo base es multilingue, el ajuste se orienta a tayiko; el rendimiento en otros idiomas puede degradarse respecto al modelo original.
- Longitud de contexto desconocida: sin este dato no es posible garantizar el comportamiento en conversaciones largas o documentos extensos.
- Estado del modelo y validacion externa: 0 descargas y 0 "likes" implican que no ha sido probado por terceros; no debe considerarse un artefacto estable para produccion.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en HuggingFace, lo que anade friccion a cualquier integracion automatizada.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de uso de Gemma de Google, que incluyen obligaciones de atribucion y una politica de uso aceptable; es imprescindible revisarlos antes de cualquier despliegue comercial.
- Formato unico: solo se distribuyen pesos safetensors, sin versiones GGUF ni cuantizadas, lo que obliga a realizar conversiones propias para despliegues en CPU o hardware limitado.
- Fecha de publicacion: el repositorio figura creado el 25 de septiembre de 2026 y actualizado el mismo dia, sin actividad posterior registrada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tohirju/sl-ivory
- Modelo base: google/gemma-4-E4B-it (referenciado en las etiquetas del repositorio; consultar en https://huggingface.co/google/gemma-4-E4B-it)
- Terminos de licencia Gemma: https://ai.google.dev/gemma/terms
- Resultados de la busqueda web: no se encontro ningun enlace relevante sobre el modelo; los resultados devueltos no guardan relacion con la ficha.
