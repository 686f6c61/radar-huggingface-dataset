# taobao-mnn/Qwen1.5-0.5B-Chat-MNN

## Resumen

Qwen1.5-0.5B-Chat-MNN es la version cuantizada del modelo conversacional Qwen1.5-0.5B-Chat de Alibaba, empaquetada en formato MNN (Mobile Neural Network) por el equipo taobao-mnn. El modelo original es un transformer decoder-only de 0,5 mil millones de parametros desarrollado por el equipo Qwen de Alibaba, afinado para instrucciones y conversacion multirroundo en chino e ingles. Esta distribucion concreta aplica cuantizacion HQQ de 4 bits con grupos de 128 sobre las capas lineales y la cabeza de salida, manteniendo las escalas en FP16 y los embeddings en BF16 separados.

La relevancia de esta ficha radica en que permite ejecutar un modelo conversacional completo en CPU, sin GPU, con un consumo de memoria reducido. El formato MNN esta disenado para inferencia en dispositivos moviles y entornos con recursos limitados, lo que lo hace adecuado para prototipos en local, aplicaciones de escritorio y despliegues edge. El repositorio ocupa 1,1 GB e incluye el grafo del modelo, los pesos cuantizados, el tokenizador y los ficheros de configuracion.

Conviene subrayar que no se trata de un modelo nuevo, sino de una conversion del checkpoint oficial Qwen1.5-0.5B-Chat a un runtime distinto. Por tanto, sus capacidades cognitivas son las del modelo base: un modelo pequeno, con 24 capas y dimension oculta de 1024, orientado a tareas ligeras de generacion de texto y dialogo, no a razonamiento complejo ni a codigo de produccion. La licencia Tongyi Qianwen Research License restringe el uso comercial sin autorizacion adicional, un punto critico para cualquier evaluacion empresarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen1.5), cuantizado en formato MNN |
| Parametros totales | 0,5 mil millones (modelo base Qwen1.5-0.5B-Chat) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit con grupo de 128 en capas lineales y cabeza de salida; escalas en FP16; embeddings en BF16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Tongyi Qianwen Research License (uso comercial requiere autorizacion) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |
| Capas / dimension oculta | 24 / 1024 |
| Tamano del repositorio | 1,1 GB |
| Runtime de inferencia | MNN 3.6.2 (commit b0239771b07b317a258fbc384683bbd540741406) |
| Configuracion por defecto | CPU, 4 hilos, `precision=low`, `memory=low` |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen1.5-0.5B-Chat, un transformer decoder-only con 24 capas y dimension oculta de 1024, entrenado por el equipo Qwen de Alibaba. La model card de esta conversion no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde a la documentacion del modelo original y no se reproduce aqui. Lo que si se especifica es la estructura de cuantizacion: las capas lineales de lenguaje y la cabeza de salida se almacenan en HQQ de 4 bits con tamano de grupo 128, las escalas de cuantizacion se mantienen en FP16 y los embeddings de palabras se guardan por separado en BF16 (`embeddings_bf16.bin`). Esta separacion permite preservar la fidelidad de la tabla de embeddings, sensible a la cuantizacion agresiva, mientras se comprime el resto de la red.

La innovacion tecnica de esta distribucion no esta en la arquitectura, sino en el empaquetado: MNN es un motor de inferencia de Alibaba optimizado para CPU y dispositivos moviles, con soporte de fusion de transformadores (`MNN_SUPPORT_TRANSFORMER_FUSE`) y modo de baja memoria (`MNN_LOW_MEMORY`). El repositorio incluye el grafo (`llm.mnn`), los pesos (`llm.mnn.weight`), el tokenizador propietario (`tokenizer.mtok`) y ficheros de configuracion (`config.json`, `llm_config.json`). La model card indica que el 9 de noviembre de 2026 se validaron en CPU x64 la alineacion del mapeo FP32, casos de saludo, aritmetica y traduccion, y una prueba de humo con la configuracion por defecto. Los parametros de exportacion estan en `export_args.json` y los registros de prueba con hashes en `refresh_metadata.json`.

## Capacidades

- Generacion de texto conversacional multirroundo en chino e ingles.
- Respuesta a instrucciones (instruction-tuned) con formato de chat.
- Tareas ligeras de aritmetica y traduccion, segun los casos de validacion reportados por el autor.
- Generacion de texto autoregresiva con muestreo configurable mediante parametros en `config.json`.
- Ejecucion en CPU sin GPU, con configuracion de 4 hilos por defecto.
- No se documenta soporte de tool calling ni function calling en la informacion disponible.
- No se documenta soporte de agentes, razonamiento multi-paso ni modo thinking.
- No se documenta capacidad de vision, audio ni multimodalidad.
- No se documenta una ventana de contexto concreta; no disponible.

## Casos de uso

- Prototipado rapido de chatbots en local: al ejecutarse en CPU con MNN y solo 1,1 GB de repositorio, permite levantar un asistente conversacional basico en un portatil sin GPU para validar flujos de dialogo antes de invertir en infraestructura mayor.
- Aplicaciones de escritorio y edge: el formato MNN esta pensado para entornos con recursos limitados, por lo que encaja en herramientas de escritorio que necesiten generacion de texto offline sin depender de una API en la nube.
- Traduccion y asistencia linguistica zh-en: los casos de validacion del autor incluyen traduccion, lo que respalda su uso en utilidades de traduccion sencilla entre chino e ingles en entornos controlados.
- Educacion y demostraciones tecnicas: sirve para ensenar el funcionamiento de la cuantizacion HQQ de 4 bits y de un runtime movil como MNN, comparando la salida con el modelo base en FP16/BF16.
- Preprocesado de texto en pipelines: tareas de resumen corto, reformulacion o clasificacion ligera donde no se requiere razonamiento profundo y prima la latencia baja en CPU.
- Pruebas de integracion de MNN-LLM: util para desarrolladores que quieran validar la API de MNN-LLM (`llm_demo`) y su configuracion de memoria y precision antes de adoptar el runtime en un producto.
- Chatbot de soporte basico en intranet: despliegue en servidores sin GPU para respuestas frecuentes y guiones cerrados, aceptando las limitaciones de un modelo de 0,5B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de validacion funcional (alineacion FP32, saludo, aritmetica, traduccion y smoke test con configuracion por defecto) en CPU x64, sin cifras de MMLU, HumanEval, GSM8K ni metricas de latencia o throughput.

## Requisitos de hardware

- Inferencia en CPU: configuracion por defecto de 4 hilos, `precision=low` y `memory=low`, segun la model card.
- VRAM: no aplica en la configuracion por defecto (CPU). No se proporcionan estimaciones de VRAM para ejecucion en GPU.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no documentada; el empaquetado esta orientado a CPU y dispositivos moviles.
- Opciones de despliegue: MNN (`llm_demo`) con MNN 3.6.2, compilado con `-DMNN_BUILD_LLM=ON -DMNN_LOW_MEMORY=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta distribucion.
- Latencia y throughput: no disponibles; no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen1.5-0.5B-Chat-MNN (esta ficha) | 0,5B | no disponible | MNN, HQQ 4-bit | Tongyi Qianwen Research License | Optimizado para CPU y edge |
| Qwen/Qwen1.5-0.5B-Chat (base) | 0,5B | no disponible en esta informacion | safetensors (Hugging Face) | Tongyi Qianwen Research License | Checkpoint original sin cuantizar |
| Otros modelos ~0,5B de la familia Qwen1.5 | 0,5B | no disponible | safetensors / GGUF segun distribucion | Tongyi Qianwen Research License | Misma arquitectura y familia |

La comparativa se limita a la familia Qwen1.5 porque la informacion proporcionada no incluye datos de benchmarks ni de otros modelos de tamano similar que permitan una comparacion cuantitativa rigurosa. No se dispone de cifras de rendimiento para contrastar.

## Limitaciones y advertencias

- Modelo de 0,5B parametros: capacidad de razonamiento, conocimiento factual y calidad de codigo muy limitadas en comparacion con modelos de mayor tamano; propenso a errores en tareas complejas.
- Riesgo de alucinacion elevado, especialmente en preguntas factuales y en contextos largos, agravado por la cuantizacion a 4 bits.
- La cuantizacion HQQ de 4 bits puede introducir degradacion adicional respecto al checkpoint original en FP16/BF16; no se publican metricas de esa perdida.
- Idiomas: solo chino e ingles documentados; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto no documentada: no se debe asumir una ventana amplia para conversaciones largas o documentos extensos.
- Licencia Tongyi Qianwen Research License: el uso comercial requiere autorizacion adicional; revisar `LICENSE` y `NOTICE.txt` antes de cualquier despliegue en produccion.
- Dependencia del runtime MNN y de una version concreta (3.6.2, commit especifico): cambios de version pueden alterar el comportamiento; conviene fijar la version en produccion.
- Formato propietario (`llm.mnn`, `tokenizer.mtok`) no compatible directamente con ecosistemas como transformers, vLLM o llama.cpp sin conversion.
- Sin soporte documentado de tool calling, agentes ni multimodalidad; no apto para esos casos de uso.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen1.5-0.5B-Chat-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-0.5B-Chat
- ModelScope: https://modelscope.cn/models/MNN/Qwen1.5-0.5B-Chat-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia (LICENSE): https://huggingface.co/taobao-mnn/Qwen1.5-0.5B-Chat-MNN/blob/main/LICENSE
- Aviso de conversion (NOTICE.txt): https://huggingface.co/taobao-mnn/Qwen1.5-0.5B-Chat-MNN/blob/main/NOTICE.txt
- Parametros de exportacion (export_args.json): https://huggingface.co/taobao-mnn/Qwen1.5-0.5B-Chat-MNN/blob/main/export_args.json
- Registro de validacion (refresh_metadata.json): https://huggingface.co/taobao-mnn/Qwen1.5-0.5B-Chat-MNN/blob/main/refresh_metadata.json
