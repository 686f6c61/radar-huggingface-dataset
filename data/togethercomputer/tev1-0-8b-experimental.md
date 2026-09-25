# togethercomputer/Tev1-0.8B-experimental

## Resumen

Tev1-0.8B-experimental es un modelo de decision experimental publicado por Together AI. Se trata de un ajuste fino supervisado (SFT) de Qwen3.5-0.8B, entrenado especificamente para recibir un estado estructurado, una pregunta y una lista de entre 2 y 24 opciones etiquetadas, y devolver exactamente la letra de una de ellas. No es un modelo conversacional de proposito general: su interfaz prevista es la seleccion de una unica opcion entre un conjunto cerrado, y el codigo de aplicacion se encarga de mapear esa letra a la clave semantica correspondiente.

El checkpoint contiene 873.438.784 parametros reales segun los safetensors del repositorio, con un peso en disco de 1,8 GB, lo que lo situa en la gama mas baja de la familia y permite ejecutarlo en hardware muy modesto. La model card lo describe explicitamente como un experimento inspirado en Jev y no como un runtime Jev no autorregresivo: conserva la cabeza estandar de prediccion del siguiente token de Qwen, por lo que la seleccion de opcion se produce como una generacion de texto de un solo caracter.

Su relevancia actual es doble. Por un lado, Together AI publica junto al modelo la receta de datos y el codigo de entrenamiento, de modo que sirve como plantilla reproducible para construir clasificadores de decision propios. Por otro lado, es un ejemplo de modelo diminuto especializado en una tarea acotada, un patron que encaja bien con enrutado de agentes y con etapas de decision dentro de pipelines mayores donde no se justifica invocar un modelo grande.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (base Qwen3.5-0.8B), con cabeza estandar de modelado de lenguaje |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no se documenta arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no se publican conversiones cuantizadas en la informacion proporcionada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible; la licencia del modelo base Qwen3.5-0.8B es Apache-2.0 y la licencia de estos pesos ajustados esta pendiente de finalizacion |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B y mantiene su arquitectura transformer autorregresiva sin modificaciones estructurales. La model card es explicita al respecto: no hay runtime no autorregresivo ni mecanismo de decodificacion paralela, sino la cabeza de lenguaje habitual. La especializacion se consigue exclusivamente mediante ajuste fino supervisado sobre un formato de entrada concreto compuesto por `state`, `question` y una lista de opciones etiquetadas.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO posteriores al SFT. La model card indica que la mezcla de entrenamiento combina fuentes de datos con terminos de uso distintos y que no existe una unica licencia de dataset aplicable, ademas de remitir al repositorio de GitHub para consultar la receta de datos completa. Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Seleccion de una opcion entre 2 y 24 alternativas etiquetadas a partir de un estado y una pregunta estructurados.
- Salida restringida a la letra de la opcion elegida, sin explicacion, cuando se usa la instruccion de sistema recomendada.
- Generacion de texto autorregresiva estandar heredada del modelo base, aunque el autor advierte que la chat generica no es la interfaz prevista y puede producir prosa.
- Soporte de plantilla de chat con el parametro `enable_thinking`, que en la configuracion recomendada se desactiva.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte explicito de agentes ni de razonamiento multi-paso.
- No se documenta comportamiento multilingue; el autor senala que este aspecto no se ha evaluado de forma exhaustiva.
- El modelo base lleva la etiqueta `image-text-to-text` en HuggingFace, pero no se documentan capacidades de vision en esta ficha ni en la model card.

## Casos de uso

- Enrutado de acciones en agentes: dado el estado de la conversacion, una pregunta del tipo "que herramienta usar" y una lista de herramientas disponibles como opciones, el modelo devuelve la letra correspondiente. Su salida de un solo caracter encaja directamente con un parser de enrutado.
- Clasificacion de intencion en atencion al cliente: se presenta el ultimo mensaje del usuario como estado, la pregunta "que categoria corresponde" y las categorias como opciones, y la letra devuelta alimenta el sistema de tickets.
- Triaje y priorizacion: con el historial de incidencias como estado, el modelo selecciona una etiqueta de severidad o de equipo responsable entre un conjunto cerrado de opciones.
- Etiquetado de documentos en pipelines de ingesta: para facturas, contratos o correos, el modelo elige la categoria documental entre las opciones declaradas, con la ventaja de que el conjunto de etiquetas se define en tiempo de inferencia sin reentrenar.
- Seleccion de politica en sistemas de reintentos: ante un fallo descrito en el estado y varias estrategias de recuperacion como opciones, el modelo elige una, lo que permite integrarlo en bucles de CI/CD o de orquestacion.
- Decisiones discretas en simulacion o videojuegos: el estado describe la situacion y las opciones son las acciones disponibles del agente; el coste computacional de un modelo de 0,8B hace viable invocarlo en cada turno.
- Evaluacion comparativa de configuraciones: uso como juez ligero de eleccion forzosa entre variantes de prompt, respuesta o configuracion, siempre que la decision se reduzca a escoger una opcion de la lista.
- Filtrado y moderacion con taxonomia configurable: el estado contiene el contenido a evaluar y las opciones son las categorias de politica aplicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en precision de 16 bits: aproximadamente 1,75 GB, coherente con un repositorio de 1,8 GB.
- VRAM estimada para inferencia en FP16/BF16: del orden de 2 a 4 GB contando pesos, cache KV y overhead del runtime.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1 GB para los pesos; en 4 bits, alrededor de 0,5 GB (estimaciones teoricas, no verificadas contra conversiones publicadas).
- Cabe holgadamente en GPUs de consumo: RTX 3060 12 GB, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM. Tambien es viable en CPU para cargas de baja concurrencia.
- GPUs de centro de datos como T4, L4, A10G, A100 o H100 son suficientes y permiten lotes grandes, aunque resultan sobredimensionadas para un modelo de este tamano.
- Opciones de despliegue: transformers en local (el autor recomienda validar la carga local y los requisitos exactos de entorno antes de depender del checkpoint fuera de la inferencia de Together), endpoints compatibles de Together AI, y servidores de inferencia estandar como vLLM o TGI. No se documentan conversiones GGUF para llama.cpp u Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tev1-0.8B-experimental | 873.438.784 | No disponible | Decision entre 2 y 24 opciones | Pendiente de finalizar (base Apache-2.0) | Pesos abiertos en HuggingFace e inferencia en Together AI |
| Tev1-4B-experimental | 4,5 mil millones segun informes de terceros | No disponible | Decision entre 2 y 24 opciones | No disponible | Pesos abiertos en HuggingFace; un tercero indica 12 GB o mas de VRAM |
| Qwen3.5-0.8B (modelo base) | Gama 0,8B | No disponible | Generacion de texto general | Apache-2.0 | Pesos abiertos en HuggingFace |

La comparacion se limita a estas referencias porque no se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- La chat generica no es la interfaz prevista y puede producir prosa en lugar de una letra de opcion.
- El modelo puede equivocarse; el autor advierte explicitamente de que no debe usarse como autoridad unica en decisiones de alto impacto.
- La robustez frente a inyeccion de prompt no se ha evaluado de forma exhaustiva: el texto dentro del campo `state` debe tratarse como datos y no como instrucciones, pero no hay garantia de que el modelo lo respete siempre.
- El comportamiento multilingue no se ha evaluado; no hay idiomas declarados.
- La calibracion y la robustez fuera de distribucion no se han evaluado de forma exhaustiva.
- La licencia de los pesos ajustados esta pendiente de finalizacion, lo que impide confirmar las condiciones de uso comercial.
- La mezcla de datos de entrenamiento combina fuentes con terminos distintos y no tiene una licencia unica, lo que anade incertidumbre al uso comercial.
- El autor recomienda validar la carga local con transformers y los requisitos exactos de entorno antes de depender del checkpoint fuera de la inferencia de Together.
- No se documentan tipos de cuantizacion publicados, por lo que las estimaciones de VRAM en 8 y 4 bits son teoricas.
- El parametro `enable_thinking` debe desactivarse en la configuracion recomendada; un uso distinto puede alterar el formato de salida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/togethercomputer/Tev1-0.8B-experimental
- Discusiones en HuggingFace: https://huggingface.co/togethercomputer/Tev1-0.8B-experimental/discussions
- Repositorio con la receta de datos y el codigo de entrenamiento: https://github.com/togethercomputer/tev1
- Blog de Together AI sobre como entrenar un clasificador propio: https://www.together.ai/blog/how-to-train-your-own-jev
- Modelo hermano Tev1-4B-experimental (referencia de terceros): https://featherless.ai/models/togethercomputer/Tev1-4B-experimental
- Cobertura de terceros sobre Tev1-4B-experimental: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/24/tev1-4b-experimental-released/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
