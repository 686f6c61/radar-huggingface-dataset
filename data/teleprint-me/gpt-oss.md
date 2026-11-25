# teleprint-me/gpt-oss

## Resumen

GPT-OSS es una familia de modelos de lenguaje de pesos abiertos publicada originalmente por OpenAI bajo licencia Apache 2.0. Esta ficha concreta corresponde a la reproduccion `teleprint-me/gpt-oss`, una conversion de los pesos originales del modelo `openai/gpt-oss-20b` al formato GGUF en precision bf16, sin modificaciones en los pesos ni en la arquitectura. El repositorio actua, por tanto, como espejo redistribuible del modelo base en un formato optimizado para inferencia local con llama.cpp y derivados.

El modelo base es un transformer de tipo Mixture of Experts (MoE) con 20.914.757.184 parametros totales (aproximadamente 21 mil millones), de los cuales solo una fraccion se activa por token, lo que permite un rendimiento cercano a modelos densos mucho mayores con un coste de computo por token reducido. Esta orientado a generacion de texto conversacional, razonamiento y uso como backend compatible con la API de OpenAI, segun los tags del repositorio.

Su relevancia actual radica en que ofrece pesos abiertos de OpenAI con licencia permisiva, lo que facilita su despliegue en infraestructura propia, su integracion en pipelines de agentes y su uso comercial sin las restricciones habituales de licencias de investigacion. La conversion a GGUF amplia el acceso a hardware de consumo y a entornos sin GPUs de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Mixture of Experts (MoE), segun el modelo base `openai/gpt-oss-20b` |
| Parametros totales | 20.914.757.184 (~20,9 mil millones) |
| Parametros activos | no disponible en la informacion proporcionada |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (pesos originales convertidos a GGUF); otras cuantizaciones no disponibles en este repositorio |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (bf16) |
| Tamano del repositorio | 77,7 GB |
| Modelo base | `openai/gpt-oss-20b` |
| Compatibilidad de endpoints | `endpoints_compatible` (segun tags) |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `openai/gpt-oss-20b`: un transformer con capas de mezcla de expertos (MoE) que activa un subconjunto de parametros por token. Esta ficha no aporta detalles adicionales sobre el numero de expertos, la estrategia de enrutamiento, la dimension de las capas ni la composicion del dataset de entrenamiento, por lo que esos datos deben consultarse en la documentacion del modelo original de OpenAI.

El trabajo realizado en este repositorio se limita a la conversion de los pesos originales (vendored weights) al formato GGUF en bf16, sin cuantizacion adicional ni ajuste fino. No se documenta en la informacion disponible si hubo entrenamiento con RLHF, DPO u otras tecnicas de alineacion; esos detalles pertenecen al modelo base y no se reproducen aqui. La innovacion practica de esta publicacion es la disponibilidad de los pesos en un formato consumible por llama.cpp, Ollama y otros runners compatibles con GGUF.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational`.
- Razonamiento y respuesta a instrucciones, heredado del modelo base `openai/gpt-oss-20b`.
- Compatibilidad con endpoints estilo API de OpenAI (`endpoints_compatible`), lo que facilita su integracion en clientes existentes.
- Ejecucion en formato GGUF mediante runners compatibles (llama.cpp, Ollama y similares).
- Capacidades de tool calling, agentes o modo de razonamiento extendido: no disponibles en la informacion proporcionada para esta ficha.
- Capacidades multimodales (vision, audio): no disponibles en la informacion proporcionada.
- Soporte multilingue: limitado al ingles segun el campo `language`.

## Casos de uso

- Despliegue local de un asistente conversacional: al estar en GGUF bf16, puede cargarse en llama.cpp u Ollama para prototipos de chatbots en maquina local o servidor propio, con control total sobre los datos.
- Sustitucion de la API de OpenAI en desarrollos existentes: el tag `endpoints_compatible` permite apuntar clientes que ya hablan el protocolo de OpenAI hacia una instancia local del modelo, reduciendo costes por token y dependencia de terceros.
- Procesamiento por lotes de texto en ingles: generacion de resumenes, clasificacion o reescritura sobre corpus documentales, aprovechando la licencia Apache 2.0 para uso comercial interno.
- Entornos con requisitos de soberania del dato: al ejecutarse on-premise, el modelo es adecuado para sectores regulados que no pueden enviar texto a APIs externas.
- Base para cuantizacion y ajuste posterior: el GGUF bf16 sirve como punto de partida para generar versiones Q4_K_M, Q5_K_M u otras, y para experimentar con fine-tuning sobre el modelo base.
- Investigacion y evaluacion de modelos MoE abiertos: permite reproducir experimentos de inferencia y medir consumo de memoria y latencia en hardware propio sin depender de pesos cerrados.
- Integracion en pipelines de agentes con framework compatible: si el modelo base soporta tool calling, esta conversion puede conectarse a orquestadores que consuman endpoints OpenAI-compatible; conviene verificar esa capacidad en la documentacion del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput. Para datos de evaluacion debe consultarse la model card de `openai/gpt-oss-20b`.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: el repositorio ocupa 77,7 GB, por lo que la carga completa en bf16 requiere del orden de 70-80 GB de memoria, incluyendo overhead de runtime. No cabe en GPUs de consumo.
- Para uso en GPU de consumo sera necesario cuantizar a Q4_K_M, Q5_K_M u otras variantes (no incluidas en este repositorio); el tamano resultante dependeria de la cuantizacion elegida y no se dispone de cifras verificadas en la informacion proporcionada.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU con memoria agregada suficiente. En RTX 4090 (24 GB) no cabe en bf16.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requeririan los pesos en safetensors del modelo base.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato disponible en esta ficha |
|---|---|---|---|---|---|
| `teleprint-me/gpt-oss` (esta ficha) | ~20,9 mil millones | no disponible | no disponible | Apache 2.0 | GGUF bf16 |
| `openai/gpt-oss-20b` (modelo base) | ~20,9 mil millones | no disponible | no disponible | Apache 2.0 | safetensors (original) |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos que permitan una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Idioma: el modelo esta etiquetado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado y puede degradarse notablemente.
- Sesgos: no se documentan en esta ficha; deben evaluarse a partir de la model card del modelo base de OpenAI.
- Alucinacion: como todo modelo generativo, puede producir contenido factualmente incorrecto; no se aportan tasas de alucinacion verificadas.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, pero conviene revisar los terminos del modelo base por si OpenAI anade condiciones adicionales de uso aceptable.
- Formato: al ser una conversion GGUF, no es directamente compatible con stacks que esperan safetensors (vLLM, TGI, transformers); requiere llama.cpp u otro runtime GGUF.
- Cuantizaciones: este repositorio solo incluye bf16, lo que limita su uso en GPUs de consumo sin un paso previo de cuantizacion.
- Repositorio de terceros: la publicacion la mantiene `teleprint-me`, no OpenAI; la trazabilidad y las actualizaciones dependen de ese mantenedor.
- Metricas de produccion: no hay datos publicados de latencia, throughput ni calidad en este repositorio; deben medirse en el entorno objetivo antes de desplegar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/teleprint-me/gpt-oss
- Modelo base: https://huggingface.co/openai/gpt-oss-20b
- Documentacion de llama.cpp (runtime GGUF): https://github.com/ggerganov/llama.cpp
- Ollama (runtime GGUF): https://ollama.com
- Papers, blogs y demos adicionales: no disponibles en la informacion proporcionada.
