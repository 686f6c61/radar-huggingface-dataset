# UmitVice/evidencedesk-gemma-4-12b-GGUF

## Resumen

EvidenceDesk Gemma 4 12B GGUF es una cuantizacion Q4_0, en formato GGUF, de un ajuste fino mediante LoRA sobre el checkpoint `google/gemma-4-12B-it-qat-q4_0-unquantized`. Lo publica el usuario UmitVice (23 de octubre de 2026) y su proposito no es el chat general, sino servir como motor de generacion de respuestas ancladas a evidencia dentro de EvidenceDesk, un sistema de soporte basado en recuperacion (RAG) con salida JSON restringida a los identificadores de los pasajes recuperados.

El modelo conserva los 11.907.350.576 parametros (~11,9 B) del checkpoint base, un Transformer decoder-only denso de la familia Gemma 4, y se distribuye en un unico archivo de 7,0 GB. La eleccion de Q4_0 no es arbitraria: el checkpoint original se entreno con QAT (quantization-aware training) para ese formato, de modo que la cuantizacion a 4 bits no deberia degradar la calidad de forma significativa respecto a bf16.

Su relevancia practica esta en el binomio latencia-coste: segun la model card, en un Apple M5 Pro el modelo pasa de 7,1 s de p50 (checkpoint QAT sin ajuste) a 2,6 s de p50, con una tasa de exito del 0,900 frente a 0,867 en el conjunto de regresion interno de EvidenceDesk, y una media de 109 tokens de salida frente a 244. La contrapartida es que esta afinado para un prompt (`support-v4`) y un esquema concretos, y el propio autor advierte de que no debe usarse como modelo conversacional generico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del checkpoint base de Gemma 4; la model card no detalla numero de capas, atencion ni vocabulario |
| Parametros totales | 11.907.350.576 (~11,9 B) |
| Parametros activos | No aplica: no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible como maximo del modelo; el ejemplo oficial de despliegue arranca con `-c 8192` |
| Tipos de cuantizacion | Q4_0 (unico archivo publicado en el repositorio) |
| Idiomas soportados | Ingles (`en`) y turco (`tr`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (conversion con llama.cpp b9960) |

## Arquitectura y entrenamiento

El proceso declarado es: fusion (merge) del adaptador LoRA `UmitVice/evidencedesk-gemma-4-12b-lora` sobre `google/gemma-4-12B-it-qat-q4_0-unquantized` en bf16, conversion a GGUF con llama.cpp b9960 y cuantizacion a Q4_0, el formato para el que el checkpoint QAT fue entrenado. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; tampoco se detalla la arquitectura interna mas alla de su pertenencia a la familia Gemma 4.

El ajuste esta orientado a una tarea concreta: el prompt interno `support-v4` de EvidenceDesk y un esquema JSON por peticion cuyos identificadores de fuente se limitan a los pasajes recuperados. La integracion envia `chat_template_kwargs.enable_thinking=false`, lo que indica que la plantilla de chat del modelo soporta un modo de razonamiento explicito que el sistema desactiva para reducir latencia y tokens de salida.

## Capacidades

- Generacion de texto anclada a evidencia (grounded generation): el esquema de salida limita los IDs de fuente a los pasajes recuperados en la peticion.
- Salida estructurada en JSON validada contra un esquema enviado por peticion.
- Generacion orientada a RAG: respuestas de soporte construidas sobre contexto recuperado, con media de 109 tokens de salida.
- Multilingue limitado a ingles y turco, segun los metadatos del repositorio.
- Modo de razonamiento (thinking) presente en la plantilla de chat, desactivable mediante `enable_thinking=false`.
- Despliegue mediante API compatible con OpenAI (`GENERATION_PROVIDER=openai_compatible`).
- Tool calling / function calling: no documentado en la informacion disponible.
- Vision, audio u otras modalidades: no documentadas; el pipeline declarado es `text-generation`.
- Codigo, matematicas o razonamiento general: no se documentan y el autor desaconseja explicitamente el uso como chat general.

## Casos de uso

- Mesa de ayuda con base de conocimiento: el modelo recibe los pasajes recuperados y devuelve una respuesta con citas cuyo identificador debe pertenecer al conjunto recuperado, lo que permite verificar cada afirmacion contra la fuente.
- Generacion de respuestas con trazabilidad documental: en documentacion interna o manuals de producto, el esquema JSON fuerza a declarar la fuente, facilitando auditoria posterior.
- Automatizacion de soporte de nivel 1 en ingles y turco: con 2,6 s de p50 en Apple M5 Pro, es viable en interaccion sincrona con el usuario.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse con `llama-server` en local y exponer una API compatible con OpenAI, evita enviar consultas y pasajes a un proveedor externo.
- Generacion de campos estructurados en pipelines de datos: la validacion por esquema reduce el post-procesado necesario para extraer respuestas en formato consumible por otros servicios.
- Evaluacion y regresion de pipelines RAG: sirve como generador de referencia para medir tasas de exito sobre conjuntos de productos no vistos (0,971 declarado en el conjunto held-out).
- Prototipado en estaciones de trabajo de 24 GB: la recomendacion `--cache-ram 0` del autor esta pensada precisamente para evitar copiar la cache de prompt de varios GB tras cada peticion en maquinas de esa VRAM.

## Benchmarks y rendimiento

Datos publicados en la model card, comparando el checkpoint QAT Q4_0 sin ajuste con este archivo. En latencia y tokens, menor es mejor; en tasas de exito, mayor es mejor.

| Metrica | Gemma 4 12B QAT Q4_0 | Este archivo (Q4_0 + LoRA) |
|---|---|---|
| Conjunto de regresion EvidenceDesk, exito extremo a extremo | 0,867 | 0,900 |
| Latencia p50 en Apple M5 Pro | 7,1 s | 2,6 s |
| Latencia p95 en Apple M5 Pro | 22,3 s | 6,1 s |
| Productos held-out, tasa de exito | 0,942 | 0,971 |
| Media de tokens de salida | 244 | 109 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; las cifras anteriores proceden de un conjunto de evaluacion propio del autor y no son comparables con evaluaciones publicas de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa 7,0 GB, a los que hay que sumar la cache KV para la ventana configurada; con `-c 8192` conviene disponer de 10-12 GB libres. Cabe ajustado en GPU de 8 GB solo reduciendo contexto o aceptando desbordamiento a memoria del sistema.
- GPU recomendadas: no se indican oficialmente. Por tamano, una RTX 4090 (24 GB) o una RTX 4080 (16 GB) alojan el modelo y la cache sin problemas; A100 y H100 no aportan ventaja a este tamano salvo por concurrencia.
- Compatibilidad con GPU de consumo: si, el modelo esta pensado para ese escenario; el autor menciona maquinas de 24 GB y mide latencias en un Apple M5 Pro.
- Opciones de despliegue: `llama-server` de llama.cpp es la via documentada, con los flags `--jinja -c 8192 --cache-ram 0 --port 8080`. Al exponer una API compatible con OpenAI, puede conectarse cualquier cliente que hable ese protocolo. vLLM, TGI u Ollama no se documentan en la informacion disponible.
- Latencia y throughput: p50 de 2,6 s y p95 de 6,1 s por peticion completa en Apple M5 Pro, con 109 tokens de salida de media. No se publican cifras de throughput concurrente ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Este archivo (evidencedesk-gemma-4-12b-GGUF) | ~11,9 B | No disponible (ejemplo con 8192) | GGUF Q4_0 | Apache 2.0 | Ajustado al prompt `support-v4` y esquema de EvidenceDesk; 7,0 GB |
| google/gemma-4-12B-it-qat-q4_0-unquantized (base referenciado) | ~12 B (misma familia) | No disponible | Pesos sin cuantizar (bf16) | No disponible en esta informacion | Punto de partida del merge; 0,867 de exito y p50 de 7,1 s en el conjunto del autor |
| UmitVice/evidencedesk-gemma-4-12b-lora (adaptador) | Se aplica sobre el base de ~12 B | No disponible | Adaptador LoRA | Apache 2.0 segun el repositorio derivado | Requiere fusion previa; no distribuible como GGUF directo |

No se dispone de datos verificados de otros modelos de ~12 B en la informacion proporcionada, por lo que no se incluye una comparacion con alternativas de terceros.

## Limitaciones y advertencias

- El modelo esta afinado para el prompt `support-v4` y el esquema JSON de EvidenceDesk; el propio autor indica que no es un modelo de chat general y su comportamiento fuera de ese contrato no esta garantizado.
- Las unicas metricas publicadas proceden de un conjunto de regresion interno y de un conjunto held-out del autor, sin benchmarks estandar ni evaluacion independiente.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay validacion por parte de la comunidad.
- Idiomas declarados: ingles y turco. El espanol no figura entre los idiomas soportados.
- La restriccion de IDs de fuente mediante esquema reduce, pero no elimina, el riesgo de alucinacion: el modelo podria citar correctamente un pasaje y aun asi malinterpretarlo.
- La cuantizacion Q4_0 implica perdida de precision frente a bf16; el QAT del checkpoint base mitiga el efecto, pero no lo elimina.
- La longitud maxima de contexto no se documenta; el valor 8192 corresponde al flag de arranque del ejemplo, no a una especificacion del modelo.
- La licencia declarada es Apache 2.0, pero el checkpoint base referenciado pertenece a la familia Gemma de Google: conviene verificar los terminos aplicables al modelo base antes de un uso comercial en produccion.
- El flag `--cache-ram 0` del ejemplo oficial desactiva el uso de cache de prompt en RAM; si se elimina en maquinas de 24 GB, el autor advierte de copias de varios GB por peticion que degradan la latencia.
- No hay informacion sobre sesgos, composicion del dataset de ajuste ni procesos de alineacion, por lo que no es posible evaluar riesgos de sesgo de forma fundamentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UmitVice/evidencedesk-gemma-4-12b-GGUF
- Adaptador LoRA base: https://huggingface.co/UmitVice/evidencedesk-gemma-4-12b-lora
- Checkpoint base referenciado en la model card: `google/gemma-4-12B-it-qat-q4_0-unquantized` (no se proporciona URL directa en la informacion disponible)
- llama.cpp (herramienta de conversion y servidor, version b9960 mencionada): https://github.com/ggml-org/llama.cpp
- Papers, blogs o demos adicionales: no disponibles; la busqueda web realizada no devolvio resultados relevantes sobre este modelo.
