# vllm-sr/Decision-2.0-Kai-0.6B

## Resumen

Decision-2.0-Kai-0.6B es un modelo de decisión estructurada de 0,60 mil millones de parámetros desarrollado por el equipo de vLLM Semantic Router (organización vllm-sr). No es un modelo generativo al uso: recibe un estado (texto o JSON) junto con un conjunto de preguntas tipificadas —elección entre opciones, sí/no y puntuación en una escala— y devuelve, en una única pasada hacia delante, una probabilidad para cada respuesta posible, sin generar texto. Se distribuye como finetune del modelo base Qwen/Qwen3-0.6B-Base y se integra en el ecosistema de enrutado semántico de vLLM.

Su relevancia actual está en el nicho de los modelos "system-one" para enrutado y clasificación: frente a un LLM generativo que consume cientos de milisegundos por decisión, este modelo resuelve una petición de una sola pregunta con una mediana de 4,9 ms en una única GPU, y agrupa preguntas de distinto tipo sobre el mismo input en un solo forward pass. Según los datos publicados por el autor, obtiene 48,6 en JevArena, por delante de los otros cuatro modelos del mismo tamaño con los que se compara, y supera a Decision 1.0 Kai en 12,7 puntos en esa misma métrica.

La longitud de contexto declarada es de 8.192 tokens y la licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. El repositorio ocupa 1,5 GB e incluye código personalizado (custom_code), por lo que su carga requiere `trust_remote_code=True`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, finetune de Qwen/Qwen3-0.6B-Base (la model card no detalla la arquitectura interna ni desviaciones respecto al base) |
| Parametros totales | 0,60 B (600 millones) |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el ejemplo de uso esta redactado en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de pipeline | feature-extraction (transformers), con tarea declarada de clasificacion y modelo de decision |
| Tipos de decision | choice (eleccion entre criterios), noul (si/no), score (puntuacion sobre una escala) |
| Requisitos de libreria | transformers >= 5.17, torch, safetensors |
| Tamano del repositorio | 1,5 GB |
| Modelo base | Qwen/Qwen3-0.6B-Base (relacion: finetune) |

## Arquitectura y entrenamiento

La informacion disponible indica unicamente que se trata de un finetune de Qwen/Qwen3-0.6B-Base, un transformer decoder-only de 600 millones de parametros. La model card no especifica la composicion del dataset de entrenamiento, el numero de tokens utilizados, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se documentan innovaciones arquitectonicas propias mas alla de la interfaz `system_one`, que es la que expone el comportamiento diferencial del modelo.

Esa interfaz es la innovacion funcional destacable: el modelo acepta un `state` y un diccionario de `questions` con tipo y criterios, y devuelve `answers` con una probabilidad por opcion. Las preguntas de tipo choice, noul y score sobre el mismo input se resuelven juntas en un unico forward pass, lo que evita repetir la codificacion del contexto. El autor indica que los datos de entrenamiento fueron auditados a nivel de fila contra todos los elementos de test del Jev Decision Index, un detalle relevante para evaluar la validez de las metricas publicadas.

## Capacidades

- Decision estructurada con salida probabilistica, no generativa: clasificacion entre opciones, respuesta binaria si/no y puntuacion sobre una escala definida por el usuario.
- Procesamiento conjunto de multiples preguntas heterogeneas sobre un mismo estado en una sola pasada hacia delante, con una probabilidad asociada a cada opcion.
- Entrada multimodal a nivel de formato: acepta tanto texto plano como JSON como estado de partida.
- Enrutado semantico: seleccion de la ruta, equipo o categoria que debe atender una peticion, segun los criterios definidos en la consulta.
- Extraccion de rasgos para clasificacion (pipeline declarado: feature-extraction).
- Integracion con transformers mediante `AutoModel` y un pipeline propio (`decision`) que requiere `trust_remote_code=True`.
- No dispone de generacion de texto libre, tool calling, capacidades de agente, vision ni audio segun la informacion disponible.

## Casos de uso

- Enrutado de tickets en atencion al cliente: el modelo recibe el texto del ticket como `state` y una pregunta de tipo choice con criterios (devoluciones, facturacion, soporte tecnico) y devuelve la probabilidad de cada equipo, tal como muestra el ejemplo de la model card.
- Clasificacion de intencion en asistentes conversacionales: con preguntas de tipo choice por cada turno se puede decidir la siguiente accion del dialogo sin invocar un LLM generativo, reduciendo la latencia del bucle de control.
- Triaje y priorizacion: una pregunta de tipo score con criterios tipo "rutina", "pronto", "hoy" permite asignar niveles de urgencia a colas de trabajo con una salida ordenable numericamente.
- Validacion de reglas de negocio en pipelines de datos: preguntas de tipo noul (por ejemplo, "¿el cliente tiene recibo?") sobre registros en JSON que permiten etiquetar grandes volumenes de casos sin coste de generacion.
- Enrutado semantico en pasarelas de inferencia LLM: como componente de vLLM Semantic Router para decidir a que modelo o backend dirigir cada peticion antes de gastar tokens en un modelo grande.
- Filtrado y moderacion previa: preguntas binarias sobre el contenido de una peticion para decidir si debe pasar a revision humana o bloquearse antes de procesarse.
- Anotacion asistida en investigacion: generacion de etiquetas probabilisticas sobre conjuntos de datos no etiquetados, con la probabilidad como medida de confianza para muestrear los casos dudosos.

## Benchmarks y rendimiento

Datos publicados en la model card del autor:

| Modelo | JevArena (mayor es mejor) | Transferencia con etiquetado humano (mayor es mejor) | Jev Decision Index (mayor es mejor) |
|---|---:|---:|---:|
| Decision-2.0-Kai-0.6B | 48,6 | 45,9 | 16,3 |
| GLiNER2.5-Decide | 42,5 | 44,1 | — |
| Bosun v3.1 0.6B | 38,5 | 34,2 | — |
| Decision 1.0 Kai | 35,9 | 35,7 | 6,5 |
| Decision 1.0 Lex | 31,0 | 26,6 | 4,5 |

Notas de metodologia segun el autor: todos los modelos responden los mismos prompts congelados y se puntuan con el mismo criterio; las respuestas ausentes o invalidas cuentan como error. La transferencia con etiquetado humano es la mediana de macro-F1 sobre 15 tareas etiquetadas por humanos (multiplicada por 100). Para Decision 2.0 se realizo una reproduccion independiente con el kit oficial 0.2.1 sobre los pesos publicados; el resto de cifras provienen de una instantanea publica del board del 28 de septiembre de 2026. No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1,5-3 GB para los pesos en precision completa o bf16 (0,60 B de parametros, repositorio de 1,5 GB), mas el overhead del runtime de transformers y del codigo personalizado. No se documentan variantes cuantizadas de forma oficial.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, incluidas tarjetas de gama de entrada. No se requiere A100 ni H100 para inferencia.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y equivalentes, e incluso en iGPU o CPU para lotes pequenos.
- Latencia declarada por el autor: mediana de 4,9 ms por peticion de una sola pregunta en una unica GPU.
- Opciones de despliegue: transformers (>= 5.17) con `trust_remote_code=True`, tanto via `AutoModel` como via el pipeline `decision`. El soporte en vLLM, llama.cpp, Ollama o TGI no esta confirmado en la informacion disponible; dado que el modelo usa codigo personalizado, su integracion en motores de servicio exigiria registrar la arquitectura.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | JevArena | Transferencia humana | Jev Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Decision-2.0-Kai-0.6B | 0,60 B | 8.192 tokens | 48,6 | 45,9 | 16,3 | Apache 2.0 | HuggingFace (vllm-sr) |
| GLiNER2.5-Decide | no disponible | no disponible | 42,5 | 44,1 | no disponible | no disponible | no disponible |
| Bosun v3.1 0.6B | 0,6 B | no disponible | 38,5 | 34,2 | no disponible | no disponible | no disponible |
| Decision 1.0 Kai | no disponible | no disponible | 35,9 | 35,7 | 6,5 | no disponible | HuggingFace (vllm-sr) |

El modelo lidera las dos metricas principales entre los cinco modelos del mismo tamano comparados, con una ventaja de 6,1 puntos en JevArena sobre el siguiente clasificado. La unica metrica donde GLiNER2.5-Decide se aproxima es la transferencia con etiquetado humano (44,1 frente a 45,9). No se dispone de datos de parametros, contexto o licencia de las alternativas mas alla de lo indicado.

## Limitaciones y advertencias

- Modelo no generativo: solo responde a preguntas tipificadas (choice, noul, score). No sirve para generar texto, mantener conversaciones libres ni ejecutar razonamiento multi-paso.
- Rendimiento en benchmarks basado en el kit y las metricas del propio autor (JevArena, Jev Decision Index); el autor declara auditoria de los datos de entrenamiento contra los tests del Index, pero no se aportan resultados de benchmarks estandar de terceros.
- Idiomas soportados no declarados: el unico ejemplo publicado esta en ingles, por lo que el comportamiento en castellano no esta verificado.
- Riesgo de alucinacion acotado por diseno (no genera texto), pero las probabilidades pueden estar mal calibradas o ser planas en entradas fuera de distribucion; conviene validar umbrales antes de usarlas para automatizar acciones.
- Sesgos: no disponible. La model card no incluye ninguna seccion de sesgos, limitaciones o consideraciones eticas.
- Requiere `trust_remote_code=True` y `transformers>=5.17`, lo que implica ejecutar codigo del autor del repositorio y limita la portabilidad a otros motores de inferencia.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar avisos de licencia y atribucion.
- El repositorio hereda las caracteristicas del modelo base Qwen3-0.6B-Base, cuyas limitaciones propias (cobertura linguistica, sesgos del corpus de preentrenamiento) no se detallan en esta model card.
- Metrica Decision Index en valores absolutos bajos (16,3), lo que sugiere un margen de mejora amplio en tareas de decision complejas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Decision-2.0-Kai-0.6B
- Coleccion Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio de vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- vLLM (sitio oficial): https://vllm.ai/
- vLLM (repositorio en GitHub): https://github.com/vllm-project/vllm
- Documentacion de vLLM: https://docs.vllm.ai/en/latest/
- vLLM en Wikipedia: https://en.wikipedia.org/wiki/VLLM
- Guia de despliegue de vLLM en produccion: https://blog.stephane-robert.info/docs/developper/programmation/python/vllm/
