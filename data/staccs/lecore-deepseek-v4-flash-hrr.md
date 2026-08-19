# staccs/lecore-deepseek-v4-flash-hrr

## Resumen

`staccs/lecore-deepseek-v4-flash-hrr` es un overlay del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731` (licencia MIT) desarrollado por el usuario `staccs`. El repositorio no contiene el modelo completo, sino un parche de memoria incrustada: 64 filas no utilizadas de `embed.weight` (índices 128000–128063) que actúan como una "agenda de direcciones" en pesos, junto con un archivo de configuración `lecore.json`. El resto de los 48 shards permanece idéntico al modelo stock.

La propuesta real del proyecto es un gateway de inferencia llamado leCore que añade memoria persistente al modelo sin retraining: un sidecar holográfico (HRR, holographic reduced representations) que almacena corpus externos y los recupera en tiempo de servicio mediante Okapi BM25 léxico. El contexto largo se resuelve por *spill* automático (volcado de tokens a memoria externa y reinyección de un fragmento recuperado), no ampliando la ventana de atención. Esto permite a la API anunciar hasta 128.000.000 de tokens de contexto "utilizables" mientras el transformer atiende solo a una fracción.

La relevancia del modelo radica en que aborda el problema del coste de memoria en LLMs: en lugar de pagar tokens de atención por todo un corpus, se liga el corpus una vez y cada pregunta consume solo el fragmento recuperado. Según las pruebas del autor, un corpus de 99 millones de palabras (Wikipedia) se recupera con 938 tokens de GPU por consulta en 9,6 segundos. El proyecto es experimental y no ha sido sometido a benchmarks estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4-Flash-0731 (transformers, atencion sin modificar) + gateway leCore con sidecar HRR y recuperacion BM25 |
| Parametros totales | no disponible (el repo solo contiene el overlay de embed, 1,1 GB; el modelo base completo no se publica en este repositorio) |
| Parametros activos | no disponible (no se confirma si el modelo base es MoE) |
| Longitud de contexto | 32768 tokens nativos (segun pruebas del autor); vLLM `max_model_len` 131072; la API anuncia 128.000.000 via spill (no atencion) |
| Tipos de cuantizacion | fp8 |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors |

Nota: la model card presenta valores inconsistentes de `max_model_len` (32768 en la prueba de needle, 131072 en la tabla de superficies). Se reportan ambos tal como aparecen en la documentacion del autor.

## Arquitectura y entrenamiento

El modelo base es `DeepSeek-V4-Flash-0731` sin modificaciones de atencion ni retraining. El autor declara explicitamente que no se reentreno el modelo y que las tarjetas de agentes (SWE, Terminal-Bench, DeepSWE) no se re-ejecutaron. El unico cambio en disco es un shard parcheado (`model-00001-of-00048.safetensors`) que anade 64 filas de `embed.weight` en los indices 128000–128063, descritas como una "agenda de direcciones" de una instalacion anterior. Estas filas no almacenan el corpus.

La innovacion principal esta en el gateway leCore, no en los pesos. El sistema de memoria consta de tres mecanismos:

- **Spill automatico**: cuando el prompt excede la ventana de atencion, el gateway vuelca el exceso a un sidecar y reinyecta solo el fragmento recuperado. En la prueba de needle con ~98k tokens, vLLM atendio solo 2090 tokens.
- **Recuperacion lexica**: en tiempo de servicio se usa Okapi BM25 sobre fragmentos de ~600 caracteres. La model card corrige una version anterior que afirmaba recuperacion VSA/HRR pura.
- **Brazo VSA/HRR de respaldo**: el encoder holografico (DIM 1024, `bind(NAME)`/`bind(CODE)`, IDF por hoja, k ≤ 0,1·D) actua solo cuando BM25 no esta disponible o el corpus supera capacidad. El propio codigo fuente lo anota como "el brazo VSA denso muerto". La segunda etapa semantica (`SEMANTIC_STAGE`, bge cuantizado) esta desactivada en produccion.

No se documenta entrenamiento con RLHF, DPO ni datos de preentrenamiento del modelo base.

## Capacidades

- Generacion de texto autoregresiva (pipeline `text-generation`).
- Memoria persistente entre turnos sin reinyectar historial: con *sticky* activado, el modelo recuerda datos de turnos anteriores aunque el campo `messages` este vacio.
- Contexto largo por spill: la API acepta cuerpos HTTP de hasta ~9,8M tokens (~32 MiB) y anuncia `context_length` de 128.000.000; el transformer solo atiende a la fraccion recuperada.
- Recuperacion de informacion sobre corpus externos mediante BM25 lexico, con opcion de ligar el corpus via `POST /v1/hrr/bind` y consultar con la cabecera `X-HRR-Context`.
- Compatibilidad con la API de OpenAI (`/v1/chat/completions`, `/v1/models`), integrable en clientes como Cursor.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion proporcionada.

## Casos de uso

- **Asistentes con memoria persistente**: un chatbot puede recordar datos dichos en turnos anteriores sin que el cliente reenvie el historial completo. El gateway mantiene el estado con *auto-sticky* activado por defecto, lo que reduce coste de tokens y latencia en conversaciones largas.
- **RAG sobre corpus grandes**: se puede ligar un corpus (por ejemplo, Wikipedia completa, 99M palabras) mediante `POST /v1/hrr/bind` y consultar con preguntas puntuales. Cada consulta consume solo el fragmento recuperado (938 tokens de GPU en la prueba del autor), no el corpus entero, lo que abarata la operacion frente a reinyectar todo el texto.
- **Procesamiento de documentos muy largos**: prompts de ~98k tokens que exceden la ventana nativa de 32k se procesan via spill automatico. El gateway recupera el fragmento relevante y el modelo atiende solo a ~2k tokens, evitando el fallo o el coste de una ventana ampliada.
- **Bases de conocimiento empresariales**: ligar manuales, normativas o documentacion interna en fragmentos y consultarlos con preguntas en lenguaje natural, aprovechando la recuperacion BM25 para localizar pasajes exactos.
- **Persistencia de contexto en integraciones de terceros**: clientes que no envian la cabecera `X-HRR-Context` (como Cursor) siguen beneficiandose del spill automatico, lo que permite usar el modelo como backend de memoria sin cambios en el cliente.
- **Experimentos de investigacion en memoria holografica**: el repositorio y el codigo fuente (PR #4 en GitHub) sirven como referencia para estudiar sidecars HRR, recuperacion BM25 en tiempo de servicio y overlays de pesos sin retraining.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente pruebas propias del autor, medidas en el mismo hardware y con el mismo overlay, comparando el comportamiento con y sin *sticky* (vanilla Flash equivale a *sticky* desactivado). Estos datos no son comparables con benchmarks publicados de otros modelos.

| Prueba | Vanilla Flash (sticky off) | leCore (sticky on) | Resultado |
|---|---|---|---|
| Cita de nonce en turno vacio (`messages` sin historial) | 0/5 | 5/5 | Mejora |
| Tres datos a traves de un hilo, luego pregunta sin historial | 0/3 | 3/3 | Mejora |
| Prompt de ~98k tokens con needle mas alla de 32k | 400 s / rechaza >32k | Recuperado; vLLM atendio 2090 tokens | Mejora |
| Wikipedia BIND + ASK (99M palabras, 33 items) | no aplica | 9,6 s, `usage.gpu_tokens=938` | Funciona |

Nota: la prueba de 1.000 millones de palabras (1B-word BIND) no se completo; el sistema fallo alrededor de 12M palabras. El autor advierte de no citar ese dato.

## Requisitos de hardware

- **GPU recomendadas**: 2×H200 o 2×RTX PRO 6000 Blackwell para el worker de inferencia, segun la configuracion de despliegue del autor.
- **VRAM estimada**: la carga del modelo completo requiere ~156 GB (primera carga tras el cold start). No se especifica la VRAM minima por GPU.
- **GPU de consumo**: no se indica compatibilidad con GPUs de consumo (RTX 4090, etc.). Dado el tamaño de carga (~156 GB en fp8), no cabe en una sola GPU de consumo actual.
- **Opciones de despliegue**: el gateway se sirve via `https://lecore-front.fly.dev/v1` (compatible OpenAI); el backend usa vLLM. El worker tiene *scale-to-zero*: tras inactividad, la primera peticion tarda minutos en cargar el modelo.
- **Latencia y throughput**: en la prueba de Wikipedia (99M palabras), una consulta tardo 9,6 s y consumio 938 tokens de GPU. No se publican cifras de throughput en tokens/segundo.

## Comparativa con modelos similares

La unica comparativa con datos disponibles es contra el propio modelo base, `DeepSeek-V4-Flash-0731` (vanilla), segun las pruebas del autor. No se dispone de datos contrastados de otros modelos de contexto largo o memoria persistente en la informacion proporcionada.

| Aspecto | DeepSeek-V4-Flash-0731 (vanilla) | leCore-deepseek-v4-flash-hrr |
|---|---|---|
| Ventana de atencion | 32768 tokens (segun prueba del autor) | 32768 nativos; spill hasta 128M anunciado |
| Memoria entre turnos sin historial | No (0/5 nonce cite) | Si (5/5 con sticky) |
| Recuperacion de corpus externos | No | Si (BM25 + sidecar HRR) |
| Retraining o ajuste | no | no (solo overlay de embed) |
| Licencia | MIT | MIT |
| Disponibilidad | Repositorio oficial DeepSeek | API publica + repo de overlay |

Alternativas de la misma categoria (modelos con memoria externa o contexto largo) no estan cubiertas por los datos disponibles; se indica "no disponible" para una comparativa cuantitativa con ellas.

## Limitaciones y advertencias

- **Sin retraining ni validacion de agentes**: el autor declara que no se reentreno el modelo y que las tarjetas de agentes (SWE, Terminal-Bench, DeepSWE) no se re-ejecutaron. No hay evidencia de mejora en tareas de razonamiento o codigo.
- **El overlay no contiene el corpus**: las 64 filas de `embed.weight` son una agenda de direcciones, no almacenan Wikipedia ni ningun documento. La recuperacion depende del sidecar en la API en vivo.
- **El brazo VSA/HRR es codigo muerto en produccion**: la recuperacion real es BM25 lexico; el encoder holografico es el brazo de respaldo y el codigo fuente lo anota como "el brazo VSA denso muerto". La segunda etapa semantica (bge) esta desactivada.
- **Limites de corpus**: la prueba de 1B palabras fallo alrededor de 12M palabras. El autor advierte explicitamente de no citar ese dato como valido.
- **Cold start lento**: el worker es *scale-to-zero*; la primera peticion tras inactividad puede tardar minutos en cargar ~156 GB, y puede fallar si no hay GPUs disponibles en el pool (problema de colocacion, no de autenticacion).
- **Discrepancias en la documentacion**: la model card reporta `max_model_len` como 32768 en una prueba y 131072 en la tabla de superficies; no se aclara cual es el valor correcto en produccion.
- **Riesgo de alucinacion**: no documentado especificamente, pero al ser un LLM generativo sin validacion de hechos, las respuestas sobre corpus recuperados deben verificarse.
- **Idiomas**: no se especifican los idiomas soportados; la documentacion esta en ingles y las pruebas se realizaron en ese idioma.
- **Uso comercial**: la licencia MIT permite uso comercial, pero el despliegue depende de la API publica del autor, cuyas condiciones de servicio y disponibilidad no estan documentadas en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/staccs/lecore-deepseek-v4-flash-hrr
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- API publica (endpoint OpenAI-compatible): https://lecore-front.fly.dev/v1
- Pull request con las pruebas comparativas: https://github.com/staccDOTsol/leCore/pull/4
- Prueba de chat de usuario regular: https://huggingface.co/staccs/lecore-deepseek-v4-flash-hrr/blob/main/hf-user-test.md
