# ToastyPigeon/gemma-4-12b-it-rp-chapters-adapter

## Resumen
Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo google/gemma-4-12B-it, publicado por el usuario ToastyPigeon bajo el identificador ToastyPigeon/gemma-4-12b-it-rp-chapters-adapter. No se trata de un modelo completo, sino de un conjunto de pesos PEFT que debe cargarse junto al modelo base de 12 000 millones de parametros para funcionar. El nombre y la unica linea de documentacion disponible indican que el objetivo es el roleplay narrativo estructurado en capitulos ("rp-chapters").

La model card es minima: declara el modelo base, la libreria peft, la etiqueta lora y tres datos de entrenamiento concretos (mezcla "itvec-mix" mas "marvin chapters v1" con 12 746 conversaciones, plantilla de chat de Gemma, 1 epoca y 693 pasos). El titulo del repositorio especifica un rango LoRA de 32. No hay informacion sobre licencia, idiomas, contexto, cuantizaciones ni resultados de evaluacion.

Su relevancia actual es limitada y de nicho: sirve como ejemplo reproducible de un pipeline de fine-tuning LoRA de rango medio sobre una base instruct de 12B para generacion creativa de formato largo, y como punto de partida para quien quiera reproducir o extender ese ajuste. Con cero descargas y cero likes en el momento de la consulta, debe considerarse material experimental no validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base google/gemma-4-12B-it) con adaptador LoRA/PEFT de rango 32 |
| Parametros totales | 12B en el modelo base; numero de parametros entrenables del adaptador no disponible (repositorio de 0,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos de adaptador en safetensors; no se documenta cuantizacion del modelo fusionado) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria de carga | peft |
| Modelo base | google/gemma-4-12B-it |
| Volumen del repositorio | 0,5 GB |
| Fecha de creacion | 2026-09-25 |
| Ultima actualizacion | 2026-09-25 |

## Arquitectura y entrenamiento
El adaptador se aplica sobre una arquitectura transformer correspondiente a google/gemma-4-12B-it, en su variante instruct. El ajuste es un SFT con LoRA de rango 32, gestionado mediante la libreria PEFT y almacenado en safetensors. El texto de la model card no especifica modulos objetivo (target modules), alpha, dropout ni learning rate; solo el rango, deducido del titulo. El repositorio ocupa 0,5 GB, coherente con un adaptador de rango medio sobre una base de 12B.

Los datos declarados son una mezcla de "itvec-mix" y "marvin chapters v1", con 12 746 conversaciones totales, formateadas con la plantilla de chat de Gemma. El entrenamiento consistio en 1 epoca y 693 pasos. No se documenta si hubo RLHF, DPO u otra fase posterior al SFT, ni la composicion detallada del dataset. El termino "chapters" en el nombre sugiere un formato de conversaciones organizadas por capitulos o escenas, orientado a narrativa larga, pero es una inferencia del nombre y no un dato confirmado en la documentacion.

## Capacidades
- Generacion de texto conversacional y creativo en el marco de roleplay y narrativa por capitulos, segun el proposito declarado en el nombre del repositorio.
- Ajuste SFT sobre una base instruct, por lo que hereda las capacidades generales de instruccion de google/gemma-4-12B-it (no verificadas ni documentadas por el autor del adaptador).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo pensamiento, vision, audio): no disponible.
- Continuidad multi-turno en formato de chat mediante la plantilla de Gemma: si, segun el formato de entrenamiento declarado, aunque sin datos de contexto maximo publicados.

## Casos de uso
- Escritura de ficcion serializada por capitulos: el adaptador se entreno explicitamente sobre conversaciones etiquetadas como "chapters", por lo que encaja en la generacion de tramas divididas en entregas con continuidad de personajes y escenas.
- Roleplay conversacional prolongado: el formato de chat de Gemma y el enfoque SFT sobre 12 746 conversaciones permiten mantener interacciones multi-turno con un personaje o escenario persistente.
- Asistente de escritura creativa para autores: se puede usar para proponer variantes de una escena, reescribir dialogos o expandir un esquema previo, dentro de un pipeline local con el modelo base fusionado.
- Prototipado rapido de personalizaciones LoRA: sirve como plantilla de referencia para evaluar como responde una base de 12B a un ajuste de rango 32 con 693 pasos y 1 epoca, antes de invertir en un ajuste mayor.
- Generacion de material para juegos de rol de mesa o narrativa interactiva: el adaptador puede integrarse en una aplicacion que mantenga estado de la partida y genere turnos del master o de PNJ.
- Base para un segundo ajuste especifico de dominio: al ser un adaptador PEFT en safetensors, puede fusionarse con la base y reentrenarse o combinarse con otros adaptadores del mismo autor, como gemma-4-12b-full-cpt-itvec.
- Investigacion sobre mezcla de datos instruct y narrativa: la combinacion declarada de "itvec-mix" con "marvin chapters v1" es un caso reproducible para estudiar la interaccion entre capability y estilo en SFT de bajo coste.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco hay evaluaciones de terceros en los resultados de busqueda consultados.

## Requisitos de hardware
- Al ser un adaptador PEFT, el requisito real lo marca el modelo base de 12B: hay que cargar google/gemma-4-12B-it completo (los 0,5 GB del adaptador son adicionales).
- VRAM estimada para la base de 12B en fp16/bf16: en torno a 24 GB solo para pesos, con overhead de activaciones y cache KV segun contexto, tipicamente 28-32 GB en total.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 13-15 GB de pesos, mas cache KV.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 7-9 GB de pesos, mas cache KV; el consumo crece de forma lineal con la longitud de contexto.
- GPU recomendadas para fp16 con contexto amplio: A100 40 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo: una RTX 4090 o 3090 de 24 GB puede ejecutar la base de 12B en 8 bits o 4 bits; tarjetas de 12-16 GB solo resultan viables en 4 bits y con contexto reducido.
- Opciones de despliegue: transformers + peft para cargar el adaptador sin fusionar; tras fusionar los pesos, vLLM o TGI para servicio de alto rendimiento; llama.cpp u Ollama requieren convertir el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas por el autor).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ToastyPigeon/gemma-4-12b-it-rp-chapters-adapter | Adaptador LoRA r32 (SFT) | Base 12B; adaptador no disponible | no disponible | no disponible | Publico en HuggingFace, 0 descargas |
| ToastyPigeon/gemma-4-12b-full-cpt | Adaptador CPT (no instruct) | Base 12B; adaptador no disponible | no disponible | no disponible | Publico en HuggingFace |
| ToastyPigeon/gemma-4-12b-full-cpt-itvec | Merge CPT + task vector instruct | 12B | no disponible | no disponible | Publico en HuggingFace; desplegable en Featherless y FriendliAI |
| google/gemma-4-12B-it (modelo base) | Transformer instruct | 12B | no disponible en la informacion consultada | no disponible en la informacion consultada | Publico en HuggingFace y en la pagina oficial de Google DeepMind |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparacion se limita a tipo de artefacto, parametros y disponibilidad.

## Limitaciones y advertencias
- Licencia no declarada: sin terminos explicitos, el uso comercial no puede darse por permitido. Debe verificarse la licencia del modelo base google/gemma-4-12B-it antes de cualquier despliegue.
- Model card practicamente vacia: no hay informacion sobre modulos objetivo, hiperparametros de LoRA, composicion del dataset, politica de filtrado ni evaluaciones.
- No es un modelo autonomo: requiere descargar y cargar el modelo base de 12B; el adaptador por si solo no genera nada.
- Cero descargas y cero likes en el momento de la consulta: no existe validacion por parte de la comunidad ni informes de terceros.
- Riesgo de alucinacion: inherente a los modelos de 12B ajustados con SFT; el autor no publica tasas de error ni evaluaciones de fidelidad.
- Contenido de roleplay sin filtros documentados: un ajuste orientado a narrativa y roleplay puede producir contenido inapropiado o no alineado con politicas de producto si no se anaden salvaguardas externas.
- Sesgos heredados: al derivar de una base no documentada en esta ficha, se heredan los sesgos de idioma, cultura y representacion del modelo original, sin que el autor detalle mitigaciones.
- Idiomas no declarados: se desconoce el comportamiento fuera del idioma o idiomas presentes en "itvec-mix" y "marvin chapters v1".
- Contexto maximo desconocido: no se puede planificar el troceado de documentos largos ni la gestion de la cache KV sin ese dato.
- Sin benchmarks: no hay base objetiva para comparar su calidad frente a otros adaptadores de roleplay de tamano similar.
- Fecha de publicacion y actualizacion muy proximas entre si (13 minutos): el repositorio parece un volcado inicial sin iteracion posterior.

## Enlaces
- Repositorio del adaptador: https://huggingface.co/ToastyPigeon/gemma-4-12b-it-rp-chapters-adapter
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Pagina oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Repositorio relacionado (CPT completo, mismo autor): https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt
- Repositorio relacionado (CPT + task vector instruct, mismo autor): https://huggingface.co/ToastyPigeon/gemma-4-12b-full-cpt-itvec
- Ficha en Featherless del modelo relacionado: https://featherless.ai/models/ToastyPigeon/gemma-4-12b-full-cpt-itvec
- Endpoint de inferencia en FriendliAI del modelo relacionado: https://friendli.ai/models/ToastyPigeon/gemma-4-12b-full-cpt-itvec
