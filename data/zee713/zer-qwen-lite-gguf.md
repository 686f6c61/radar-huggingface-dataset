# zee713/zer-qwen-lite-gguf

## Resumen

Zer es un ajuste fino del modelo Qwen2.5-1.5B-Instruct orientado a conversacion e instrucciones cortas en amharico (am). Lo desarrolla el usuario zee713 y se distribuye unicamente en formato GGUF con cuantizacion q4_k_m, pensado para ejecutarse en CPU mediante llama.cpp dentro del chatbot de procesamiento de lenguaje natural amharico «ሕሳር (happi)». El repositorio fue creado y actualizado en septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 valoraciones.

Tecnicamente es un modelo denso de 1.543.714.304 parametros (1,54 B) derivado de la arquitectura transformer decoder-only de Qwen2.5, sobre el que se aplico un ajuste fino QLoRA, seguido de fusion de adaptadores y cuantizacion a GGUF. El resultado es un artefacto de aproximadamente 1,0 GB que el autor reporta cargar en torno a 1 segundo y generar entre 40 y 60 tokens por segundo en CPU.

Su relevancia es doble. Por un lado, ejemplifica el patron de adaptacion de un modelo multilingue pequeno a un idioma de bajos recursos como el amharico, con un coste de computo minimo. Por otro, ilustra el flujo de publicacion automatica de artefactos cuantizados desde el propio tooling de compilacion de una aplicacion, un patron cada vez mas habitual en despliegues edge. La contrapartida es la escasez de documentacion: la model card no detalla el dataset de entrenamiento, no publica benchmarks y no especifica la longitud de contexto efectiva tras el ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible en la model card. El modelo base Qwen2.5-1.5B-Instruct declara 32 768 tokens nativos |
| Tipos de cuantizacion | GGUF q4_k_m (unica cuantizacion publicada en el repositorio) |
| Idiomas soportados | Amharico (am) declarado explicitamente; el modelo base es multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors no disponibles en el repositorio) |
| Tamano del repositorio | 1,0 GB |
| Pipeline | text-generation |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Metodo de ajuste | QLoRA sobre pares cortos de conversacion e instrucciones en amharico, fusion posterior y cuantizacion |
| Compatibilidad | Tag endpoints_compatible; inferencia via llama.cpp / llama-cpp-python |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalizacion RMSNorm, atencion con sesgo QKV, activacion SwiGLU y embeddings de tokens y de posiciones rotatorias. El modelo base incorpora un tokenizador con vocabulario amplio (el tokenizador Qwen2.5 cubre 151 643 tokens) y esta preparado para contexto largo, lo que en teoria permite adaptarlo a idiomas con escrituras no latinas como el alfabeto ge'ez usado por el amharico sin fragmentar en exceso las palabras.

El ajuste consistio en QLoRA sobre pares cortos de conversacion e instruccion en amharico, con fusion de los adaptadores en los pesos base y cuantizacion final a q4_k_m. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, la duracion del entrenamiento, el rango LoRA ni los hiperparametros utilizados. Tampoco se documenta ninguna fase adicional de RLHF o DPO especifica para este ajuste; el modelo base Qwen2.5-Instruct ya incorpora alineacion previa del fabricante. No consta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal o arquitecturas hibridas).

## Capacidades

- Generacion de texto conversacional en amharico, orientada a respuestas breves dentro de un chatbot.
- Seguimiento de instrucciones cortas en amharico para tareas de asistencia simple.
- Conversacion multi-turno: el modelo base soporta plantillas de chat con roles system, user y assistant, y el ajuste se realizo sobre pares conversacionales.
- Inferencia en CPU con cuantizacion de 4 bits, con carga en aproximadamente 1 segundo y 40-60 tokens por segundo segun el autor.
- Soporte de function calling / tool calling: no confirmado tras el ajuste. El modelo base Qwen2.5-1.5B-Instruct declara esta capacidad, pero la model card de Zer no indica si se conserva ni si se entreno con datos de herramientas.
- Capacidades de agente y razonamiento multi-paso: no disponibles ni documentadas.
- Capacidades multilingues: no documentadas. Solo se declara el amharico; el comportamiento en castellano, ingles u otros idiomas tras el ajuste QLoRA es desconocido y potencialmente degradado.
- Modo thinking o razonamiento extendido: no disponible.
- Vision o audio: no disponible (modelo exclusivamente de texto).

## Casos de uso

- Chatbot de atencion al ciudadano en amharico: el modelo se integra en el backend del chatbot «ሕሳር (happi)» para responder consultas breves de usuarios en su idioma nativo, un escenario donde los modelos multilingues generalistas suelen ofrecer una calidad desigual por falta de datos de entrenamiento.
- Despliegue offline en equipos sin GPU: con 1,0 GB en q4_k_m y ejecucion sobre llama-cpp-python, el modelo cabe en portatiles modestos y en servidores sin acelerador, lo que resulta adecuado para entornos con conectividad o presupuesto limitados.
- Servicios de mensajeria ligera (SMS, USSD o bots de mensajeria): dado su bajo consumo y su baja latencia en CPU, puede atender conversaciones cortas en infraestructura modesta, sin necesidad de clusters de inferencia.
- Investigacion en procesamiento de lenguas de bajos recursos: sirve como linea base reproducible para estudiar el efecto de QLoRA sobre un modelo de 1,5 B al adaptarlo a un idioma con alfabeto no latino y pocos recursos digitales.
- Prototipado rapido de asistentes sectoriales en amharico: educacion, salud comunitaria o informacion agricola, donde se necesita un asistente que responda en el idioma local y que pueda desplegarse en campo sin depender de APIs externas.
- Generacion asistida de borradores de respuestas para agentes humanos: el modelo puede proponer respuestas breves en amharico que un operador revisa antes de enviarlas, reduciendo el tiempo de redaccion en flujos de soporte.
- Pruebas de integracion y evaluacion de pipelines llama.cpp: al ser un GGUF pequeno con licencia Apache-2.0, es util como artefacto de prueba para validar cadenas de despliegue, plantillas de chat y cuantizacion en herramientas como Ollama, LM Studio o text-generation-webui.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye evaluaciones en MMLU, GSM8K, HumanEval, Belebele, Flores-200 ni en ningun conjunto especifico de amharico, y no se dispone de comparaciones medidas frente al modelo base. Los unicos datos de rendimiento aportados por el autor son de caracter operativo: tiempo de carga de aproximadamente 1 segundo y velocidad de generacion de 40-60 tokens por segundo en CPU, sin especificar el hardware utilizado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,5 GB para los pesos q4_k_m (el repositorio ocupa 1,0 GB), mas la cache KV, cuyo tamano depende del contexto configurado.
- Pesos en precision completa (fp16) del modelo base: en torno a 3,1 GB, mas cache KV.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para la cuantizacion q4_k_m; por ejemplo GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores. Para fp16 conviene disponer de 6-8 GB (RTX 3060 12 GB, RTX 4070, etc.). No se requiere A100 ni H100 para este tamano.
- Cabe en GPU de consumo: si. El caso de uso principal del autor es, de hecho, CPU pura, por lo que el modelo funciona incluso sin GPU dedicada.
- Opciones de despliegue: llama.cpp y llama-cpp-python (ruta oficial del autor), Ollama importando el GGUF mediante un Modelfile, LM Studio, text-generation-webui y Jan. Para los pesos en fp16 del modelo base serian aplicables vLLM o TGI, pero no se distribuyen en este repositorio.
- Latencia y throughput: el autor reporta carga aproximada de 1 segundo y generacion de 40-60 tokens por segundo en CPU. No hay mediciones publicadas de latencia por peticion, throughput en lote ni comportamiento bajo concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Zer (zee713/zer-qwen-lite-gguf) | 1,54 B | No documentado (base: 32 768 tokens) | Apache-2.0 | Solo GGUF q4_k_m | Ajuste QLoRA en amharico, sin benchmarks ni dataset documentado |
| Qwen2.5-1.5B-Instruct (modelo base) | 1,54 B | 32 768 tokens | Apache-2.0 | Safetensors y cuantizaciones | Modelo generalista multilingue con alineacion previa del fabricante; base directa de Zer |
| Llama-3.2-1B-Instruct | 1,24 B | 128 000 tokens | Licencia comunitaria de Llama 3.2 | Safetensors y GGUF | Alternativa de tamano similar con contexto mayor, sujeta a condiciones de uso adicionales |
| Gemma-2-2B-it | 2,6 B | 8 192 tokens | Terminos de uso de Gemma | Safetensors y GGUF | Mayor numero de parametros, licencia no Apache |
| SmolLM2-1.7B-Instruct | 1,7 B | 8 192 tokens | Apache-2.0 | Safetensors y GGUF | Alternativa de licencia permisiva y tamano comparable |

Los datos de especificaciones de los modelos de la comparativa provienen de la documentacion publica de cada fabricante y no se han verificado en esta ficha. No hay resultados de benchmarks comparativos disponibles para Zer, por lo que la comparacion se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- El ajuste se realizo sobre pares cortos de conversacion en amharico: es probable que el modelo degrade su comportamiento en conversaciones largas, tareas de razonamiento complejo o dominios especializados.
- No hay datos sobre la composicion del dataset de ajuste, por lo que se desconocen los sesgos presentes en los datos de entrenamiento, el filtrado aplicado y la cobertura tematica real.
- Riesgo de alucinacion inherente a un modelo de 1,5 B parametros: la capacidad de conocimiento factual es limitada y no hay evaluaciones de fidelidad publicadas.
- Solo se declara el idioma amharico. El uso en castellano, ingles u otros idiomas no esta evaluado y puede producir respuestas degradadas o mezcla de idiomas.
- La cuantizacion q4_k_m introduce perdida de precision respecto a los pesos fusionados en precision completa; no se han publicado comparativas de calidad entre ambas versiones.
- La longitud de contexto efectiva tras el ajuste no esta documentada; conviene validar experimentalmente el comportamiento mas alla de unos pocos miles de tokens antes de usarlo en produccion.
- Licencia Apache-2.0, tanto del ajuste como del modelo base: permite uso comercial, pero obliga a conservar los avisos de licencia y a no reclamar endoso. Conviene revisar tambien la licencia del tokenizador y de cualquier dato de entrenamiento no documentado.
- Repositorio sin descargas ni valoraciones en el momento de la consulta: no existe validacion independiente de la comunidad ni reportes de fallos.
- Las marcas temporales del repositorio (creacion y actualizacion en septiembre de 2026) resultan anomalas y no permiten extraer informacion fiable sobre el versionado del artefacto.
- El soporte de tool calling y de flujos de agente no esta confirmado en la version ajustada, aunque el modelo base lo declare.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zee713/zer-qwen-lite-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio del chatbot en el que se integra: https://github.com/zee/amharic-nlp-chatbot
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo: los enlaces recuperados correspondian a paginas de descarga del navegador Google Chrome y no guardan relacion con el artefacto. No se han encontrado papers, blogs tecnicos ni demos adicionales.
