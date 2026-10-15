# trl-lib/LFM2.5-8B-A1B-SFT-function-calling

## Resumen

LFM2.5-8B-A1B-SFT-function-calling es un ajuste fino supervisado (SFT) del modelo LiquidAI/LFM2.5-8B-A1B, publicado por el equipo de TRL dentro del repositorio trl-lib en HuggingFace. Se trata de un modelo de generacion de texto con arquitectura MoE (tag lfm2_moe) de aproximadamente 8.470 millones de parametros totales, entrenado especificamente para la tarea de function calling estructurado: recibe una consulta del usuario junto con el catalogo de herramientas disponibles y genera una o varias llamadas paralelas en formato JSON que la resuelven.

El fine-tuning se realizo con la libreria TRL sobre las 60.000 muestras del dataset argilla/apigen-function-calling, derivadas del corpus xLAM (paper arXiv:2406.18518). El entrenamiento completo se ejecuto en 8 GPU H100 durante una unica epoca, completando 938 pasos en 16 minutos: la perdida descendio de 1,16 a 0,03 y la precision a nivel de token paso del 90,5% al 99,3%. Se entrenaron todos los pesos, con calculo de perdida unicamente sobre el turno del asistente.

Su relevancia practica radica en que es un ejemplo reproducible y documentado de como adaptar un modelo MoE de tamano medio a tareas de agentes y tool calling con un coste de computo muy reducido, sirviendo como referencia tecnica para quien quiera replicar el pipeline con TRL. El script de entrenamiento esta publicado en el repositorio de TRL bajo la ruta `examples/lfm2_5_moe_research_agent/1_sft.py`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (tag `lfm2_moe`, Liquid Foundation Model 2.5); 32 expertos segun la model card |
| Parametros totales | 8.467.856.128 (8,47B, dato safetensors) |
| Parametros activos | no disponible (la nomenclatura "A1B" del modelo base sugiere ~1B activos, no confirmado explicitamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (campo `license: other`, `license_name: lfm1.0`, enlace a LICENSE) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se basa en LFM2.5-8B-A1B de LiquidAI, una arquitectura de mezcla de expertos (MoE) etiquetada como `lfm2_moe`. La model card indica que cuenta con 32 expertos, distribuidos en el entrenamiento mediante paralelismo de expertos en 8 vias (expert parallelism), mientras que el resto de los componentes se reparte con FSDP (Fully Sharded Data Parallel). El fine-tuning es un SFT con perdida calculada exclusivamente sobre el turno del asistente (loss on the assistant turn only), y se entrenaron todos los pesos del modelo.

El dataset de entrenamiento es la porcion de 60.000 muestras xLAM del corpus argilla/apigen-function-calling, que contiene tripletas de consulta, herramientas disponibles y una o varias llamadas paralelas que responden a la consulta. La innovacion tecnica mas destacable del artefacto no esta en el modelo en si, sino en la eficiencia del proceso: una sola epoca, 938 pasos, 16 minutos en 8 H100, con convergencia de perdida de 1,16 a 0,03 y precision de token del 90,5% al 99,3%. No se documenta en la informacion disponible el uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`).
- Function calling / tool calling: genera llamadas estructuradas en formato JSON con nombre de funcion y argumentos tipados.
- Llamadas paralelas: puede emitir multiples `tool_calls` en una misma respuesta (el ejemplo de la model card devuelve dos llamadas a `get_weather`, una para Lisboa y otra para Oslo).
- Razonamiento multi-paso orientado a agentes: el flujo de ejemplo incluye respuesta con esquema (`add_response_schema`) y parseo posterior de la respuesta (`parse_response`).
- Integracion con el ecosistema TRL mediante la utilidad `trl.chat_template_utils` para definir esquemas de respuesta y extraer las llamadas.
- Idiomas soportados: no disponible en la informacion proporcionada.
- Capacidades de vision, audio o thinking mode: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de atencion al cliente con herramientas: el modelo puede recibir la consulta del usuario y un catalogo de funciones (consulta de pedidos, estado de envio, facturacion) y devolver la llamada concreta con los argumentos ya extraidos del lenguaje natural, reduciendo la necesidad de parseo manual.
- Orquestacion de APIs en produccion: al emitir JSON estructurado con `name` y `arguments`, la salida se puede enrutar directamente a un router de funciones o a un gateway de API sin transformaciones adicionales.
- Consultas paralelas a servicios externos: cuando la pregunta requiere datos de varias fuentes (por ejemplo, comparar el tiempo en dos ciudades, o precios en dos proveedores), el modelo genera varias llamadas en una sola respuesta, lo que reduce la latencia total del flujo.
- Asistentes de investigacion y agentes multi-paso: el pipeline documentado en TRL (`lfm2_5_moe_research_agent`) apunta a agentes que encadenan varias rondas de llamadas a herramientas hasta resolver la consulta.
- Automatizacion de back-office: extraccion de parametros de textos no estructurados (correos, tickets) hacia funciones internas, con el esquema de herramientas definido por el equipo de desarrollo.
- Generacion de codigo asistida por herramientas: el modelo puede integrarse en entornos que exponen funciones de ejecucion, busqueda o documentacion, y decidir cual invocar segun la peticion del usuario.
- Base para fine-tuning adicional: al ser un SFT reproducible sobre TRL, sirve como punto de partida para adaptar el formato de tool calling a esquemas propietarios de una organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, BFCL, etc.) en la informacion disponible.

Los unicos datos de rendimiento aportados son las metricas de entrenamiento del propio fine-tuning:

| Metrica | Inicio | Final |
|---|---|---|
| Perdida (loss) | 1,16 | 0,03 |
| Precision de token | 90,5% | 99,3% |
| Pasos | - | 938 |
| Duracion del entrenamiento | - | 16 minutos (8 H100) |

## Requisitos de hardware

- VRAM estimada en bf16: el repositorio ocupa 17,0 GB, por lo que la inferencia en bf16 requiere aproximadamente 17 GB solo para los pesos, mas overhead de activaciones y cache KV. En la practica, se recomienda disponer de 24 GB o mas de VRAM.
- GPU recomendadas para el fine-tuning: 8 x NVIDIA H100 (configuracion documentada en la model card, con paralelismo de expertos en 8 vias y FSDP para el resto).
- GPU consumer: una RTX 4090 (24 GB) es la candidata mas ajustada para inferencia en bf16; no se confirma en la informacion disponible el soporte de cuantizacion que permitiria desplegarlo en GPUs de 12-16 GB.
- Opciones de despliegue: compatible con transformers (`AutoModelForCausalLM.from_pretrained`). No se especifican en la informacion disponible otras opciones como vLLM, llama.cpp, Ollama o TGI; el tag `lfm2_moe` puede requerir soporte especifico en algunos motores.
- Latencia y throughput: no disponibles. Solo se conoce la velocidad de entrenamiento (938 pasos en 16 minutos) y los requisitos de paralelismo descritos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| LFM2.5-8B-A1B-SFT-function-calling | 8,47B (MoE) | no disponible | lfm1.0 | HuggingFace (trl-lib) | SFT especializado en function calling |
| LiquidAI/LFM2.5-8B-A1B (modelo base) | 8,47B (MoE) | no disponible | lfm1.0 | HuggingFace (LiquidAI) | Base generalista sin el SFT de function calling |
| Otras alternativas de function calling de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se han publicado benchmarks independientes, por lo que el rendimiento real fuera del dataset de entrenamiento (xLAM/apigen) no esta validado.
- El entrenamiento se realizo sobre un unico dataset (60.000 muestras xLAM) durante una sola epoca; existe riesgo de sobreajuste al formato y al estilo de ese corpus, con posible degradacion en esquemas de herramientas muy distintos.
- Riesgo de alucinacion en los argumentos de las llamadas: el modelo puede generar nombres de funcion o valores de parametros plausibles pero incorrectos si el catalogo de herramientas no esta bien delimitado en el prompt.
- La model card solo demuestra el flujo con temperatura determinista (`do_sample=False`); el comportamiento con muestreo no esta documentado.
- Idiomas soportados: no disponibles. No se puede garantizar un rendimiento multilingue mas alla de lo que herede el modelo base.
- Longitud de contexto: no disponible, lo que dificulta planificar su uso en conversaciones largas o catalogos de herramientas extensos.
- Licencia lfm1.0: es una licencia personalizada (campo `license: other`), distinta de licencias open source estandar. Es imprescindible revisar el archivo LICENSE del repositorio antes de un uso comercial.
- El modelo esta publicado en el espacio `trl-lib` (repositorio de ejemplos de la libreria TRL) con 0 descargas y 0 likes en el momento de la consulta; no debe asumirse el mismo nivel de mantenimiento y soporte que un modelo oficial de producto.
- Los resultados de busqueda web disponibles no contienen informacion relevante sobre este modelo (los enlaces encontrados tratan sobre Technology Readiness Level, un concepto no relacionado).

## Enlaces

- HuggingFace: https://huggingface.co/trl-lib/LFM2.5-8B-A1B-SFT-function-calling
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-8B-A1B
- Dataset de entrenamiento: https://huggingface.co/datasets/argilla/apigen-function-calling
- Paper xLAM: https://huggingface.co/papers/2406.18518 (arXiv:2406.18518)
- Script de entrenamiento en TRL: https://github.com/huggingface/trl/tree/main/examples/lfm2_5_moe_research_agent
- Repositorio TRL: https://github.com/huggingface/trl
- Curva de perdida del SFT: https://huggingface.co/datasets/trl-lib/documentation-images/resolve/main/lfm2_5_moe_sft_loss.png
- Licencia: archivo LICENSE del repositorio en HuggingFace
- Enlaces adicionales relevantes: no disponibles en la busqueda web realizada
