# wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF

## Resumen

Spomin-Qwen2.5-3B-Summary-v2-GGUF es un ajuste fino del modelo Qwen2.5-3B-Instruct publicado por el usuario wgaca, distribuido exclusivamente en formato GGUF con cuantizacion Q8_0. No es un asistente conversacional de proposito general: es un "worker" especializado que resume un unico fragmento inmutable de conversacion o fuente documental y devuelve un resumen acotado en JSON. El modelo forma parte de la arquitectura Spomin, donde un router independiente se encarga de la seleccion de fragmentos, la validacion, la preservacion exacta del texto original, la instalacion del resumen y las ediciones quirurgicas de la cache KV.

El modelo cuenta con 3.085.938.688 parametros (aproximadamente 3,09 mil millones) y se obtuvo fusionando un adaptador LoRA de rango 32 correspondiente a la epoca 2 de entrenamiento sobre el modelo base. El contrato de servicio (`spomin.summary-only-contract.v2`) fija una ventana de contexto de 16.384 tokens con una reserva de 512 tokens para la completion, y un esquema de salida con la forma `{"schema_version":"spomin.summary-output.v2","summary":"..."}`. Los limites maximos del esquema de entrada v2 son 384 tokens y 240 palabras por resumen.

Su relevancia es acotada pero clara: se trata de un componente de infraestructura para sistemas de memoria de agentes que necesitan compactar contexto sin recurrir a un modelo grande, ejecutable en una GPU de consumo o incluso en CPU. La licencia Qwen Research restringe el uso comercial sin licencia adicional de Alibaba Cloud, lo que limita su adopcion en produccion comercial cerrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), heredada del modelo base Qwen2.5-3B-Instruct |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 mil millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens en el despliegue del worker (reserva de completion: 512 tokens). El modelo base Qwen2.5-3B-Instruct soporta 32.768 tokens nativos segun la documentacion de Qwen |
| Tipos de cuantizacion | Unicamente Q8_0 en este repositorio (no se publican Q4, Q5 ni Q6) |
| Idiomas soportados | Ingles (en) |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`); uso no comercial de investigacion y evaluacion, uso comercial sujeto a licencia separada de Alibaba Cloud |
| Formato de pesos | GGUF (fichero `Spomin-Qwen2.5-3B-Summary-v2-Q8_0.gguf`, 3.285.475.680 bytes) |

## Arquitectura y entrenamiento

La base es Qwen2.5-3B-Instruct, un transformer decoder-only de la familia Qwen2 con normalizacion RMSNorm, activacion SwiGLU, embeddings RoPE y atencion con consultas agrupadas (GQA). Sobre ese modelo se entreno un adaptador LoRA de rango 32, del cual se selecciono la epoca 2 y se fusiono con los pesos base; el resultado se convirtio despues a GGUF Q8_0. El repositorio contiene unicamente el artefacto desplegado en Q8_0, no la exportacion BF16 completa, ni los adaptadores, ni los datos de entrenamiento, ni transcripciones, ni los registros de evaluacion locales.

No se especifica en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO posteriores al ajuste supervisado. Tampoco se documenta ninguna innovacion de decodificacion. La unica innovacion relevante del sistema reside fuera del modelo: el router Spomin aplica ediciones quirurgicas sobre la cache KV y requiere un fork especifico de llama.cpp (`alekk89/llama.cpp-kv-surgical-fork`, rama `experimental/kv-surgery-dflash`) para su slot primario. El worker, en cambio, no realiza esas operaciones ni decide que debe retenerse.

## Capacidades

- Resumen extractivo y compresivo de un unico fragmento de fuente, con un limite solicitado de tokens y palabras.
- Salida estructurada estricta en JSON segun el esquema `spomin.summary-output.v2`, con un unico campo `summary`.
- Cumplimiento de contrato de servicio mediante un prompt de sistema exacto y un esquema de entrada versionado (`summary_single_input.schema.json`).
- Procesamiento de fuentes de hasta 14.000 tokens, por encima de los cuales el router divide el texto en fronteras del tokenizador y realiza llamadas independientes.
- Paso directo (passthrough) de fuentes por debajo de 300 tokens, decidido por el router, no por el modelo.
- Ejecucion como servicio independiente en paralelo al runtime principal, con alias de servicio sugerido `qwen2.5-3b-spomin-summary-v2`.
- Idiomas: ingles unicamente, segun la etiqueta de idioma del repositorio.
- No dispone de tool calling ni function calling documentados.
- No dispone de capacidades de agente, razonamiento multi-paso ni planificacion; su contrato prohibe explicitamente recibir estado de conversacion vecino, hechos, decisiones de retencion o estado rodante.
- No dispone de vision, audio ni modo de razonamiento explicito.
- No esta disenado como asistente conversacional de proposito general.

## Casos de uso

- Compactacion de memoria en agentes conversacionales: integrado en el router Spomin, el worker resume cada fragmento de conversacion que supera el umbral de 300 tokens y devuelve un resumen de como maximo 240 palabras que el router instala en la memoria gestionada, reduciendo el consumo de contexto del modelo primario.
- Reduccion de coste en pipelines con modelo grande: un agente que use un modelo de 70B o superior como runtime principal puede delegar la compactacion historica a este worker de 3B ejecutado localmente, evitando pagar tokens de resumen a una API externa.
- Condensacion de fragmentos en sistemas RAG: cada chunk recuperado puede resumirse individualmente antes de insertarse en el prompt final, manteniendo la trazabilidad porque el router conserva el texto original intacto y solo instala el resumen como capa adicional.
- Resumen de transcripciones largas por lotes: el router divide automaticamente cualquier fuente de mas de 14.000 tokens en fronteras del tokenizador y lanza llamadas independientes, lo que permite procesar reuniones o logs extensos en paralelo con `--parallel 1` por instancia.
- Despliegue en hardware modesto o sin GPU: al ser un GGUF Q8_0 de 3,3 GB, cabe en una GPU de consumo con 8 GB de VRAM o puede ejecutarse en CPU, lo que permite mantener el servicio de resumen en portatiles o nodos de borde.
- Investigacion sobre fidelidad de resumenes estructurados: dado que el contrato fija esquemas de entrada y salida versionados, el modelo sirve como banco de pruebas reproducible para medir si un ajuste fino pequeno cumple restricciones duras de formato y de compresion.
- Archivado con verificacion criptografica: el fichero incluye un SHA-256 publicado, lo que permite verificar la integridad del artefacto en pipelines de despliegue automatizado antes de arrancar el servicio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la seleccion del artefacto se baso en la perdida de validacion y en una comparacion de generacion acotada a diez ejemplos, ademas de comprobaciones locales de validez de esquema y de una instalacion de resumen gestionada con preservacion exacta de la fuente. Esos datos no se acompanan de cifras publicadas, y la propia model card advierte que las puertas de evaluacion exhaustiva (semantica, de recuperacion, de regresion y sobre el modelo primario aguas abajo) no se completaron.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 3,1 GB en Q8_0 (fichero de 3,3 GB).
- VRAM estimada para la cache KV a 16.384 tokens: aproximadamente 600 MB en FP16, calculado a partir de la configuracion de atencion del modelo base (36 capas, 2 cabezas KV, dimension de cabeza 128). Estimacion orientativa, no un dato publicado.
- VRAM total estimada en el escenario del contrato (16.384 de contexto): aproximadamente 4 GB, con margen para el buffer de computo de llama.cpp.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A10, L4, A100. Cabe holgadamente en cualquier GPU con 6-8 GB o mas de VRAM.
- Ejecucion en CPU: viable; con 16.384 tokens de contexto el rendimiento dependera del ancho de banda de memoria, sin cifras publicadas.
- Opciones de despliegue: llama.cpp y `llama-server` son el metodo documentado, con el comando `llama-server -m ... --alias qwen2.5-3b-spomin-summary-v2 --host 127.0.0.1 --port 8088 --ctx-size 16384 --parallel 1 -ngl 999`. Compatible a nivel de formato con Ollama, LM Studio y koboldcpp. No se documenta soporte para vLLM o TGI en esta publicacion.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de latencia por resumen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Spomin-Qwen2.5-3B-Summary-v2-GGUF | 3,09 mil millones | 16.384 en el contrato del worker (32.768 en el base) | GGUF Q8_0 | qwen-research (no comercial sin licencia adicional) | Worker de resumen con salida JSON acotada |
| Qwen2.5-3B-Instruct | 3,09 mil millones | 32.768 nativos | safetensors BF16 y multiples GGUF | Apache-2.0 | Asistente general con soporte de tool calling |
| Llama-3.2-3B-Instruct | 3,21 mil millones | 128.000 | safetensors y GGUF | Llama 3.2 Community License | Asistente general multilingue |
| Phi-3.5-mini-instruct | 3,8 mil millones | 128.000 | safetensors y GGUF | MIT | Asistente general y razonamiento |

Frente a los tres alternativos, este modelo pierde en cobertura idiomatica (solo ingles frente a multilingue), en contexto nominal y en permisividad de licencia, y no ofrece tool calling. Su ventaja diferencial es el contrato de salida estructurada y el acotamiento estricto del resumen, que los modelos de proposito general no garantizan sin capas de validacion adicionales. No se dispone de datos de rendimiento comparativo publicados para respaldar afirmaciones de calidad de resumen.

## Limitaciones y advertencias

- No es un asistente de chat: la model card lo declara explicitamente. Usarlo fuera del contrato de resumen producira resultados no evaluados.
- Riesgo de fidelidad: los resumenes pueden omitir detalles o tergiversar el material de origen. La propia model card advierte que las comprobaciones realizadas son mecanicas y no una garantia amplia de fidelidad semantica.
- Evaluacion incompleta: las puertas de evaluacion semantica, de recuperacion, de regresion y sobre el modelo primario aguas abajo no se completaron, segun el propio autor.
- Sesgos: no se documenta ningun analisis de sesgos. Al derivar de Qwen2.5-3B-Instruct, hereda los sesgos no medidos de ese modelo y de su corpus de entrenamiento.
- Idioma: soporte declarado unicamente en ingles. El rendimiento en castellano no esta documentado ni validado.
- Restricciones de licencia: distribuido bajo Qwen Research License, no Apache-2.0 ni MIT. Permite uso no comercial de investigacion y evaluacion; el uso comercial requiere una licencia separada de Alibaba Cloud. No se concede permiso comercial adicional en este repositorio.
- Dependencia de infraestructura: el sistema completo requiere el fork quirurgico de llama.cpp para el slot primario y la desactivacion de la compactacion automatica y manual del harness. El worker por si solo no gestiona la memoria.
- Limites de contrato: el esquema de entrada v2 admite un techo de 384 tokens y 240 palabras por resumen, y las fuentes superiores a 14.000 tokens deben dividirse en fronteras del tokenizador, lo que puede fragmentar el contexto del texto original.
- Validacion obligatoria: la model card recomienda validar la salida en lugar de confiar en JSON sintacticamente plausible, y evaluar el modelo sobre la carga de trabajo propia.
- Madurez: el repositorio no registra descargas ni interacciones en el momento de la consulta, lo que indica una adopcion nula y ausencia de validacion por terceros.
- Sin garantias de continuidad de contexto nativa ilimitada; la model card rechaza explicitamente cualquier afirmacion de ese tipo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF
- Fichero GGUF Q8_0: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF/blob/main/Spomin-Qwen2.5-3B-Summary-v2-Q8_0.gguf
- Manifiesto del artefacto: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF/blob/main/artifact.json
- Licencia Qwen Research: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF/blob/main/LICENSE
- Aviso legal: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF/blob/main/Notice
- Prompt de sistema del contrato: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF/blob/main/contracts/summary_only_v2/summarize_source.system.txt
- Esquema de entrada: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF/blob/main/contracts/summary_only_v2/summary_single_input.schema.json
- Esquema de salida: https://huggingface.co/wgaca/Spomin-Qwen2.5-3B-Summary-v2-GGUF/blob/main/contracts/summary_only_v2/summary_single_output.schema.json
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Fork de llama.cpp con edicion quirurgica de KV cache: https://github.com/alekk89/llama.cpp-kv-surgical-fork/tree/experimental/kv-surgery-dflash
