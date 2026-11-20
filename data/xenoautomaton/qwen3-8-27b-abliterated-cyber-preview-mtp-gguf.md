# xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF

## Resumen

Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF es una cuantizacion GGUF auto-generada del checkpoint fusionado en BF16 `hotdogs/Qwen3.8-27B-abliterated-cyber-preview`, un modelo derivado de la familia Qwen3.5 (tag `qwen3_5`) con tecnicas de "abliteration" aplicadas para eliminar los rechazos de alineamiento y con un enfoque declarado en ciberseguridad. El autor, `xenoautomaton`, publica los pesos en formato llama.cpp con dos variantes de cuantizacion (Q6_K y Q4_K_M), generadas directamente desde el checkpoint original y no copiadas de otros repositorios cuantizados.

El modelo destaca por incorporar 15 tensores MTP (multi-token prediction) embebidos que permiten decodificacion especulativa nativa en llama.cpp mediante `--spec-type draft-mtp`, lo que se traduce en velocidades de generacion de 58-68 tok/s medidas en una A100 de 40 GB. El contexto nativo del modelo fuente es de 262.144 tokens, aunque las pruebas de validacion se limitaron a 32.768 tokens.

La relevancia actual radica en su combinacion de cuantizacion accesible (Q4_K_M ocupa 17,01 GB y cabe en GPUs de consumo alto), decodificacion especulativa integrada y un perfil sin censura orientado a tareas de seguridad ofensiva y defensiva. La licencia Apache-2.0 facilita su uso comercial, aunque el modelo hereda las limitaciones y sesgos del checkpoint base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen3.5, con 15 tensores MTP embebidos para decodificacion especulativa |
| Parametros totales | 460.730.096 (segun safetensors del repo; el nombre del modelo indica 27B, discrepancia no aclarada en la model card) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 262.144 tokens nativos; 32.768 tokens en la configuracion de validacion |
| Tipos de cuantizacion | Q6_K (22,43 GB) y Q4_K_M (17,01 GB); BF16 intermedio disponible en el proceso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp), con proyector de vision BF16 separado |

## Arquitectura y entrenamiento

El modelo es un transformer denso derivado de la familia Qwen3.5, publicado originalmente como checkpoint fusionado en BF16 por `hotdogs`. La variante "abliterated" implica que se han eliminado o atenuado las direcciones de rechazo en el espacio de activaciones, un proceso tipicamente aplicado mediante intervenciones en pesos o en representaciones internas tras el entrenamiento. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; solo indica explicitamente que "no se realizo RL ni fine-tuning adicional" durante el proceso de cuantizacion.

La innovacion tecnica mas relevante es la inclusion de 15 tensores MTP (multi-token prediction) que permiten usar decodificacion especulativa en llama.cpp con `--spec-type draft-mtp --spec-draft-n-max 1`. Esto acelera la generacion sin necesidad de un modelo draft separado. La cuantizacion se realizo con el commit `c406f4367e19bea7930e7f74e1984c9acc6d44bf` de llama.cpp, generando primero un BF16 intermedio y cuantizando despues Q6_K y Q4_K_M de forma independiente. Se preservaron los 770 tensores GGUF, incluidos los 15 MTP, y se verificaron nombres y formas contra el BF16 intermedio. Tambien se retiene el proyector de vision BF16 y la configuracion VLM original, aunque la inferencia de vision no fue validada.

## Capacidades

- Generacion de texto conversacional y continuacion de contexto largo (hasta 262.144 tokens nativos).
- Razonamiento aritmetico y logico basico (validado con pruebas de aritmetica y ordenacion).
- Traduccion, con verificacion funcional de traduccion al chino.
- Generacion de codigo, incluyendo la ejecucion de una funcion Python pequena generada por el modelo en las pruebas de validacion.
- Tool calling / function calling: la generacion de llamadas a herramientas fue una de las seis comprobaciones funcionales realizadas.
- Recuperacion de informacion (retrieval) dentro de las pruebas de validacion.
- Modo thinking desactivable por peticion (las pruebas se realizaron con thinking desactivado).
- Capacidades multimodales potenciales (proyector de vision BF16 retenido y configuracion VLM original), aunque no validadas.
- Perfil "abliterated": ausencia de rechazos de alineamiento, orientado a contenido sensible y ciberseguridad.
- Decodificacion especulativa nativa via tensores MTP en llama.cpp.

## Casos de uso

- Analisis de seguridad ofensiva y pentesting: el perfil abliterated y el enfoque "cyber" permiten generar payloads, explicar tecnicas de explotacion y redactar informes de vulnerabilidades sin los rechazos tipicos de modelos alineados. Adecuado para equipos de red team con entornos controlados.
- Asistente de codigo en pipelines CI/CD: con tool calling validado y capacidad de generar funciones Python ejecutables, puede integrarse en revisiones automatizadas, generacion de tests o analisis estatico asistido.
- Procesamiento de documentos extensos: el contexto nativo de 262.144 tokens permite ingerir contratos, bases de codigo o expedientes completos en una sola pasada, aunque en produccion conviene limitar a 32K-64K para controlar VRAM.
- Traduccion tecnica multilingue: la validacion funcional de traduccion al chino sugiere utilidad en localizacion de documentacion tecnica, con la cautela de que no se detalla la lista completa de idiomas soportados.
- Despliegue en estaciones de trabajo con GPU de consumo: la variante Q4_K_M (17,01 GB, ~18,4 GiB en contexto 32K) cabe en GPUs como RTX 4090 (24 GB) o RTX 3090, permitiendo inferencia local a 66-68 tok/s con MTP.
- Servicio de chat con contexto largo en servidor: la variante Q6_K (22,43 GB, ~23,2 GiB) es viable en A100 40GB o L40S con vLLM mediante el companion W8A16, ofreciendo conversaciones multi-turno con historial extenso.
- Generacion de contenido sin restricciones editoriales: para investigacion sobre alineamiento, red teaming de modelos o generacion de ficcion y escenarios sensibles donde los filtros estandar resultan limitantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta mediciones de rendimiento de inferencia y seis comprobaciones funcionales cualitativas.

| Variante / motor | Tokens de prompt | Tokens de salida | tok/s extremo a extremo | tok/s en stream |
|---|---:|---:|---:|---:|
| Q6_K / llama.cpp MTP=1 | 4832 | 256 | 58,3 | 60,2 |
| Q6_K / llama.cpp MTP=1 | 32 | 256 | 60,4 | 62,2 |
| Q4_K_M / llama.cpp MTP=1 | 4832 | 256 | 66,1 | 68,4 |
| Q4_K_M / llama.cpp MTP=1 | 32 | 256 | 68,5 | 71,4 |

Medido en una NVIDIA A100-SXM4-40GB, contexto de servicio de 32.768 tokens, una secuencia, temperatura 0 y thinking desactivado. Medianas excluyendo warmups. Las tasas de stream se observan desde eventos SSE, no desde mediciones aisladas de kernel GPU.

## Requisitos de hardware

- VRAM estimada: Q6_K ~23,2 GiB en contexto 32K; Q4_K_M ~18,4 GiB en contexto 32K (medido en A100 40GB).
- GPU recomendadas: A100-SXM4-40GB (validada), H100, L40S para Q6_K; RTX 4090 (24 GB) o RTX 3090 (24 GB) para Q4_K_M.
- Cabe en GPU de consumo: si, Q4_K_M en RTX 4090/3090 con contexto 32K; Q6_K queda al limite en 24 GB y probablemente requiera reducir contexto o usar offload parcial.
- Opciones de despliegue: llama.cpp (`llama-server`) con `-ngl 999 -c 32768 -np 1 -fa on --jinja --spec-type draft-mtp --spec-draft-n-max 1`; vLLM solo mediante el companion W8A16 (el plugin GGUF probado no soporta el tensor fusionado `attn_qkv_gate`).
- Throughput: 58-68 tok/s extremo a extremo con MTP=1; 60-71 tok/s en stream. La latencia TTFT varia entre cache caliente y frio (no se reportan valores absolutos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF | 460,7M (segun safetensors); nombre indica 27B | 262.144 nativo | Apache-2.0 | GGUF | MTP embebido, perfil abliterated, validacion limitada |
| hotdogs/Qwen3.8-27B-abliterated-cyber-preview (base) | no disponible | 262.144 nativo | no disponible en la informacion | BF16 | Checkpoint fuente fusionado |
| xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-W8A16 | no disponible | 262.144 nativo | no disponible en la informacion | W8A16 | Companion para vLLM |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia critica en el recuento de parametros: el campo `safetensors` reporta 460.730.096 parametros, mientras que el nombre del modelo indica 27B. No se aclara en la model card; verificar antes de dimensionar infraestructura.
- La cuantizacion es con perdida (lossy); Q4_K_M puede degradar la precision en tareas de razonamiento complejo frente al BF16 original.
- La validacion se limita a seis comprobaciones funcionales (aritmetica, ordenacion, traduccion al chino, ejecucion de funcion Python, generacion de tool-call y retrieval). No constituye una evaluacion de precision exhaustiva.
- La inferencia de vision no fue probada, aunque se retiene el proyector BF16 y la configuracion VLM.
- El contexto nativo de 262.144 tokens no fue validado en la A100 de 40 GB; la configuracion de 32.768 tokens no extiende RoPE ni implica que el contexto completo funcione en ese hardware.
- vLLM no acepta directamente el GGUF: el plugin probado carece de mapeos para el tensor fusionado `attn_qkv_gate`. Las velocidades reportadas son exclusivas de llama.cpp y no deben extrapolarse a vLLM.
- Perfil abliterated: ausencia de rechazos de alineamiento implica mayor riesgo de generar contenido danino, sesgado o inexacto sin advertencia. Requiere supervision humana en produccion.
- No se detalla la lista de idiomas soportados ni la composicion del dataset de entrenamiento, lo que impide evaluar sesgos linguisticos o culturales.
- Riesgo de alucinacion no cuantificado; sin benchmarks de veracidad disponibles.
- Licencia Apache-2.0 permite uso comercial, pero el modelo deriva de un checkpoint base cuyas condiciones de entrenamiento y procedencia de datos no se detallan; el autor declara que "todos los creditos upstream y los terminos Apache-2.0 siguen aplicandose".
- Modelo con 0 descargas y 0 likes en el momento de la ficha: sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-MTP-GGUF
- Modelo base: https://huggingface.co/hotdogs/Qwen3.8-27B-abliterated-cyber-preview
- Companion W8A16 para vLLM: https://huggingface.co/xenoautomaton/Qwen3.8-27B-abliterated-cyber-preview-W8A16
- Repositorio llama.cpp (commit de cuantizacion `c406f4367e19bea7930e7f74e1984c9acc6d44bf`): https://github.com/ggml-org/llama.cpp
- Revision del checkpoint fuente: `2fbed4d2a8cbf450797dfdcd65bb5ccef74569df`
