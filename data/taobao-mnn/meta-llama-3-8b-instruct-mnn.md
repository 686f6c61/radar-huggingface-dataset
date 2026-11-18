# taobao-mnn/Meta-Llama-3-8B-Instruct-MNN

## Resumen

Meta-Llama-3-8B-Instruct-MNN es una distribucion cuantizada del modelo Meta Llama 3 8B Instruct de Meta, empaquetada en formato MNN (Mobile Neural Network) por el equipo taobao-mnn de Alibaba. El objetivo no es ofrecer un modelo nuevo, sino una version optimizada para inferencia en CPU y dispositivos con recursos limitados mediante el motor MNN, usando cuantizacion HQQ de 4 bits en las capas lineales del transformer y en la cabeza de salida, con embeddings mantenidos en BF16.

El modelo subyacente es un transformer decoder-only de 8.000 millones de parametros, 32 capas y dimension oculta de 4096, afinado para instrucciones y conversacion. Esta distribucion se centra en el despliegue local sin GPU: el motor MNN permite ejecutar el modelo en CPU con 4 hilos por defecto, en modo de baja memoria y baja precision, lo que lo hace util para aplicaciones de escritorio, movil o entornos embebidos donde no hay acelerador dedicado.

Es relevante ahora porque reduce la barrera de entrada para ejecutar un modelo de 8B en hardware modesto, a costa de una perdida de calidad respecto al original en FP16/BF16. La ficha se centra en las caracteristicas de esta distribucion concreta, no en el modelo base, del que se asume el comportamiento general de Llama 3 8B Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), distribuido en formato MNN |
| Parametros totales | 8.000 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3 soporta 8192 tokens) |
| Tipos de cuantizacion | HQQ 4 bits con grupo 128 en capas lineales y cabeza de salida; escalas en FP16; embeddings en BF16 |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Llama 3 Community License (con Acceptable Use Policy adicional) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Meta Llama 3 8B Instruct: un transformer decoder-only con 32 capas y dimension oculta de 4096, entrenado originalmente por Meta y afinado por instrucciones. Esta distribucion no modifica la topologia, sino que exporta los pesos a MNN aplicando cuantizacion HQQ de 4 bits con tamano de grupo 128 sobre las capas lineales del transformer y la cabeza de salida, manteniendo las escalas de cuantizacion en FP16 y los embeddings en BF16 en un fichero separado.

No se dispone de informacion sobre el proceso de entrenamiento, volumen de tokens, composicion del dataset ni tecnicas de alineacion (RLHF/DPO) en la informacion proporcionada; esos datos corresponden al modelo base y no se detallan en esta model card. La innovacion tecnica de esta distribucion es el empaquetado para el motor MNN, que incluye soporte de plantillas Jinja y correcciones de tokens especiales (PR 5155 de MNN), y un modo de ejecucion por defecto en CPU con 4 hilos, `precision=low` y `memory=low`. El autor reporta validacion el 2026-11-17 en CPU x64: alineacion de mapeo FP32, pruebas de saludo, aritmetica y traduccion, y smoke test con configuracion por defecto.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo Instruct de Llama 3.
- Razonamiento basico y respuesta a instrucciones en chino e ingles.
- Generacion de codigo y resolucion de problemas matematicos simples, segun las capacidades del modelo base.
- Soporte de plantillas de chat mediante Jinja (integrado en el runtime MNN usado).
- Ejecucion en CPU sin GPU, con modos de baja memoria y baja precision.
- No se documentan en esta distribucion capacidades de tool calling, agentes, vision ni audio; deben considerarse las del modelo base y no estan garantizadas por el empaquetado MNN.

## Casos de uso

- Asistente conversacional local en escritorio: ejecutar el modelo en CPU con MNN permite integrar un chat de 8B en una aplicacion de escritorio sin GPU dedicada, usando el binario `llm_demo` o la API de MNN-LLM.
- Prototipado en dispositivos embebidos o moviles: el formato MNN y el modo de baja memoria estan pensados para entornos con RAM limitada, lo que facilita probar un LLM en hardware no convencional.
- Traduccion y generacion bilingue chino-ingles: el modelo declara soporte de ambos idiomas y el autor valida casos de traduccion en CPU x64.
- Tareas de procesamiento por lotes sin acelerador: al no requerir GPU, se puede desplegar en servidores de CPU para generar resumenes o respuestas sobre textos cortos.
- Educacion y experimentacion: sirve para estudiar el impacto de la cuantizacion HQQ 4 bits frente al modelo original en FP16/BF16.
- Integracion en pipelines de CI o pruebas automatizadas: el empaquetado MNN y el binario de demostracion permiten validar respuestas del modelo en entornos de integracion sin infraestructura GPU.
- Evaluacion comparativa de runtimes: util para medir latencia y consumo de memoria de MNN frente a otros motores (llama.cpp, vLLM) sobre el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pruebas de validacion cualitativas (alineacion FP32, saludo, aritmetica, traduccion y smoke test) sin metricas numericas de MMLU, HumanEval, GSM8K ni latencia/throughput.

## Requisitos de hardware

- VRAM: no aplica de forma directa; el modelo esta pensado para CPU. El repo ocupa 9,3 GB, pero la inferencia en 4 bits requiere bastante menos memoria en tiempo de ejecucion; no se especifica la cifra exacta.
- GPU recomendadas: no se documentan; el runtime por defecto es CPU con 4 hilos.
- Cabe en GPU consumer: no se indica; el enfoque del empaquetado es CPU y dispositivos de bajos recursos.
- Opciones de despliegue: motor MNN (compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON`), binario `llm_demo` y API MNN-LLM. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Meta-Llama-3-8B-Instruct-MNN (esta ficha) | 8B | no disponible | HQQ 4 bits (grupo 128) | Llama 3 Community License | MNN |
| meta-llama/Meta-Llama-3-8B-Instruct | 8B | 8192 tokens (modelo base) | FP16/BF16 original | Llama 3 Community License | safetensors |
| Versiones GGUF de Llama 3 8B Instruct | 8B | 8192 tokens (modelo base) | Q4_K_M, Q5_K_M, etc. | Llama 3 Community License | GGUF |

La comparativa se limita al mismo modelo base en distintos empaquetados, ya que no se dispone de datos de rendimiento de esta distribucion frente a alternativas de otros fabricantes. La diferencia principal es el runtime objetivo: MNN para CPU y dispositivos de bajos recursos, frente a safetensors para GPU y GGUF para llama.cpp.

## Limitaciones y advertencias

- La cuantizacion HQQ de 4 bits introduce perdida de calidad respecto al modelo original en FP16/BF16; no se han publicado metricas que cuantifiquen esa degradacion.
- Riesgo de alucinacion inherente al modelo base Llama 3 8B Instruct, no mitigado por el empaquetado.
- Idiomas declarados limitados a chino e ingles; el rendimiento en castellano no esta garantizado ni evaluado en esta distribucion.
- La licencia Llama 3 Community License impone restricciones de uso comercial y obliga a cumplir la Acceptable Use Policy; es necesario revisar ambos documentos antes de un despliegue en produccion.
- El runtime requiere una version concreta de MNN (commit 4756b19d... con la PR 5155) para soportar plantillas Jinja y correcciones de tokens especiales; versiones anteriores pueden fallar.
- El repositorio tiene solo 40 descargas y 0 likes, y la validacion reportada es cualitativa y limitada a CPU x64; no hay evidencia de pruebas en otros entornos.
- No se documentan capacidades de tool calling, agentes ni multimodalidad en esta distribucion.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Meta-Llama-3-8B-Instruct-MNN
- ModelScope (distribucion MNN): https://modelscope.cn/models/MNN/Meta-Llama-3-8B-Instruct-MNN
- ModelScope (modelo base): https://modelscope.cn/models/LLM-Research/Meta-Llama-3-8B-Instruct
- Repositorio MNN: https://github.com/alibaba/MNN
- PR de MNN con plantillas Jinja y correccion de tokens especiales: https://github.com/alibaba/MNN/pull/5155
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Modelo base en Hugging Face: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
