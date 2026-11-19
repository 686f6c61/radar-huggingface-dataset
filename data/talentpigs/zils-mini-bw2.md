# TalentPigs/zils-mini-bw2

## Resumen

zils-mini-bw2 es un modelo derivado por ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario TalentPigs en Hugging Face. Su proposito declarado es actuar como "cuerpo de decision" (decision body) para el pool d3-mini de la subred 127 de Zils, un ecosistema de modelos de decision distribuidos. No se trata de un modelo de proposito general, sino de un componente especializado dentro de una arquitectura mayor orientada a la toma de decisiones.

El modelo conserva la arquitectura del Qwen3.5-4B original, con 4.539.265.536 parametros totales segun los pesos en safetensors, lo que lo situa en la categoria de modelos de aproximadamente 4.500 millones de parametros. El repositorio ocupa 9,1 GB, coherente con pesos en precision de 16 bits. La libreria de referencia es transformers y la licencia es Apache-2.0.

La relevancia de esta ficha es limitada en terminos de documentacion publica: la model card es extremadamente escueta y no aporta informacion sobre datos de entrenamiento, capacidades, benchmarks ni idiomas soportados. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere que es una publicacion reciente o de circulacion restringida dentro de su ecosistema. Cualquier evaluacion de produccion deberia considerar la ausencia de documentacion tecnica como un riesgo significativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-4B; detalles de atencion no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen/Qwen3.5-4B, un transformer de la familia Qwen 3.5 con aproximadamente 4.500 millones de parametros. No se dispone de informacion sobre si el fine-tuning altero la configuracion arquitectonica del modelo base (numero de capas, dimensiones ocultas, mecanismo de atencion, uso de atencion lineal o decodificacion especulativa). La etiqueta qwen3_5 en los metadatos de Hugging Face confirma la familia arquitectonica, pero no aporta detalles adicionales.

Respecto al entrenamiento, la model card unicamente indica que se trata de un "d3-mini decision body" para el pool d3-mini de la subred 127 de Zils. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se emplearon tecnicas de RLHF, DPO o ajuste supervisado, ni si hubo etapas de alineacion. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion con ventana deslizante o mecanismos de razonamiento explicito. Esta ausencia de informacion impide evaluar la calidad del proceso de entrenamiento o su idoneidad para tareas concretas.

## Capacidades

- Generacion de texto y extraccion de caracteristicas: el pipeline declarado es feature-extraction, lo que sugiere que el modelo esta orientado a producir representaciones o embeddings utilizables por un sistema de decision superior.
- Modelo de decision: la etiqueta decision-model indica que su funcion principal es emitir decisiones o puntuaciones dentro del pool d3-mini, no mantener conversaciones abiertas.
- Herencia de capacidades del modelo base: al derivar de Qwen3.5-4B, es razonable esperar capacidades de comprension de lenguaje y razonamiento, aunque no se documenta hasta que punto el fine-tuning las preserva o las especializa.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan declarados en los metadatos.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Componente de decision en pipelines de la subred Zils: el modelo esta disenado explicitamente como decision body del pool d3-mini, por lo que su uso natural es integrarse como modulo de puntuacion o seleccion dentro de la infraestructura de Zils, recibiendo representaciones y emitiendo decisiones.
- Extraccion de caracteristicas para sistemas de ranking: dado el pipeline feature-extraction, puede emplearse para generar embeddings que alimenten un ranker o clasificador posterior en aplicaciones de recomendacion o filtrado.
- Clasificacion y enrutamiento de consultas: en arquitecturas con multiples modelos especializados, un modelo de decision de este tamano puede actuar como enrutador que decide que submodelo debe atender cada peticion.
- Prototipado de agentes con Qwen3.5: para equipos que ya usan la familia Qwen 3.5, este checkpoint permite experimentar con un componente de decision de 4.500 millones de parametros sin salir del ecosistema transformers.
- Investigacion sobre modelos de decision fine-tuneados: util para estudiar como el ajuste fino sobre un modelo base de 4B afecta a las representaciones y a la capacidad de decision, comparandolo con el Qwen3.5-4B original.
- Despliegue ligero en entornos con GPU de gama media: con 4.539 millones de parametros, es viable en GPUs consumer de 24 GB en precision reducida, lo que facilita pruebas locales de integracion antes de escalar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors suman 9,1 GB, lo que corresponde a precision de 16 bits. En bf16/fp16 se necesitan aproximadamente 9-10 GB de VRAM solo para pesos, mas overhead de activaciones y cache KV. En cuantizacion de 8 bits, alrededor de 5 GB; en 4 bits, alrededor de 3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: para bf16 completa, GPUs con 16 GB o mas (RTX 4080, RTX 4090, A10, L4). Para cuantizacion 4/8 bits, GPUs con 8-12 GB (RTX 3060 12 GB, RTX 4070).
- Cabe en GPU consumer: si, en RTX 4090 y RTX 4080 en bf16; en RTX 3060 12 GB y similares con cuantizacion.
- Opciones de despliegue: transformers (libreria declarada). No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI; la etiqueta custom_code y la naturaleza especializada del modelo sugieren que puede requerir codigo propio para su integracion.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TalentPigs/zils-mini-bw2 | 4.539 M | no disponible | Apache-2.0 | Hugging Face | Decision body especializado, documentacion minima |
| Qwen/Qwen3.5-4B | ~4.000 M (aproximado) | no disponible | no disponible | Hugging Face | Modelo base del que deriva; capacidades generales |
| Modelos de decision de ~4B | no disponible | no disponible | no disponible | no disponible | No se identifican alternativas publicas equivalentes en la informacion disponible |

La comparativa con alternativas de la misma categoria (decision models de ~4B) no esta disponible en la informacion proporcionada. El unico punto de referencia solido es el modelo base Qwen3.5-4B, del cual este checkpoint hereda arquitectura y tamano pero del que se desconoce el grado de especializacion resultante.

## Limitaciones y advertencias

- Documentacion practicamente inexistente: la model card no describe datos de entrenamiento, capacidades, limitaciones ni evaluacion, lo que impide validar su comportamiento en produccion.
- Sesgos conocidos: no documentados; al derivar de Qwen3.5-4B, podria heredar los sesgos del modelo base, pero no hay informacion que lo confirme.
- Riesgo de alucinacion: no evaluado; al ser un modelo de decision y no de generacion abierta, el riesgo depende de la tarea concreta, pero no hay datos.
- Limitaciones de contexto e idioma: no disponibles; se desconoce la ventana de contexto efectiva y los idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la model card remite a LICENSE y NOTICE para atribuciones de terceros (upstream), que no se incluyen en la informacion disponible; conviene revisar esos ficheros en el repositorio antes de un uso comercial.
- Dependencia de custom_code: la etiqueta indica que el modelo puede requerir codigo personalizado para cargarse, lo que anade friccion de integracion y riesgo de incompatibilidad con versiones futuras de transformers.
- Cero adopcion publica: sin descargas ni likes, no hay evidencia de uso en produccion ni de validacion por parte de la comunidad.
- Especializacion cerrada: su diseno como decision body del pool d3-mini de Zils sugiere que fuera de ese contexto su rendimiento puede degradarse o carecer de sentido.

## Enlaces

- Hugging Face: https://huggingface.co/TalentPigs/zils-mini-bw2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio Zils: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
