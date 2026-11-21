# taobao-mnn/Qwen2.5-1.5B-Instruct-MNN

## Resumen

Qwen2.5-1.5B-Instruct-MNN es la version cuantizada del modelo instructivo Qwen2.5-1.5B-Instruct de Alibaba, empaquetada en formato MNN (Mobile Neural Network) por el equipo taobao-mnn. Su proposito es permitir la inferencia en CPU de un LLM de 1.500 millones de parametros con un peso de repositorio de 3,0 GB, gracias a una cuantizacion HQQ de 4 bits con grupo de 128 aplicada tanto a las capas lineales del modelo de lenguaje como a la cabeza de salida (output head), manteniendo las escalas de cuantizacion en FP16.

El modelo hereda la arquitectura transformer densa de Qwen2.5, con 28 capas y una dimension oculta de 1536, y esta afinado para instrucciones. Al estar integrado en el ecosistema MNN de Alibaba, esta pensado para despliegue en dispositivos con recursos limitados, incluyendo moviles y equipos de escritorio sin GPU dedicada, mediante el runtime llm_demo de MNN.

Es relevante ahora porque ofrece una via practica para ejecutar un modelo conversacional multilingue (chino e ingles) en CPU con cuantizacion agresiva, sin necesidad de infraestructura GPU, y con licencia Apache 2.0 que permite uso comercial. La ficha se centra en las caracteristicas del artefacto MNN publicado, no en el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), 28 capas, dimension oculta 1536 |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B-Instruct) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4 bits, grupo 128, escalas FP16; embeddings compartidos con la cabeza de salida en 4 bits |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (llm.mnn, llm.mnn.weight, tokenizer.mtok, config.json, llm_config.json) |
| Tamano del repositorio | 3,0 GB |
| Configuracion por defecto | CPU, 4 hilos, precision=low, memory=low |

## Arquitectura y entrenamiento

El artefacto es una conversion del modelo Qwen2.5-1.5B-Instruct, un transformer denso de 28 capas con dimension oculta de 1536. La model card no detalla el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, RLHF/DPO); esa informacion corresponde a la documentacion oficial de Qwen2.5-1.5B-Instruct y no se incluye aqui. Lo que si se especifica es el proceso de exportacion: cuantizacion HQQ de 4 bits con tamano de grupo 128 aplicada a las capas lineales del modelo de lenguaje y a la cabeza de salida, con escalas en FP16 y embeddings compartidos con la cabeza de salida en 4 bits.

La innovacion tecnica del artefacto es el empaquetado en formato MNN, que permite ejecutar el modelo con el runtime llm_demo de MNN en CPU. La exportacion se valido con la version MNN 3.6.2 (commit b0239771b07b317a258fbc384683bbd540741406) en x64 CPU, comprobando alineacion del mapeo FP32, casos de saludo, aritmetica y traduccion, ademas de una prueba de humo con la configuracion por defecto. Los parametros de exportacion estan en export_args.json y los registros de prueba e hashes en refresh_metadata.json.

## Capacidades

- Generacion de texto conversacional e instrucciones en chino e ingles.
- Razonamiento aritmetico basico (validado en las pruebas de exportacion con casos de aritmetica).
- Traduccion entre idiomas (validada en las pruebas de exportacion).
- Seguimiento de instrucciones (modelo instruction-tuned).
- Inferencia en CPU con bajo consumo de memoria (precision=low, memory=low, 4 hilos por defecto).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento extendido en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en dispositivos moviles: el modelo puede ejecutarse en CPU con el runtime MNN, lo que permite integrar un chatbot en aplicaciones Android o iOS sin depender de la nube, usando el binario llm_demo o la API de MNN-LLM.
- Traduccion chino-ingles en local: las pruebas de exportacion validan casos de traduccion, por lo que es adecuado para tareas de traduccion simple en entornos sin conexion.
- Procesamiento de texto en equipos de escritorio sin GPU: con 3,0 GB de repositorio y configuracion CPU de 4 hilos, puede desplegarse en portatiles y estaciones de trabajo modestas.
- Prototipado rapido de aplicaciones LLM: al estar disponible en Hugging Face y ModelScope con comandos de descarga directos, sirve para validar pipelines de generacion de texto antes de escalar a modelos mayores.
- Educacion y demostraciones: su tamano reducido y su licencia Apache 2.0 lo hacen util para talleres y cursos sobre cuantizacion e inferencia en el borde.
- Generacion de respuestas en asistentes de soporte con requisitos de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad.
- Integracion en aplicaciones de escritorio con MNN-LLM: la documentacion de MNN-LLM describe como integrar el modelo en aplicaciones, lo que facilita su inclusion en herramientas de productividad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en la configuracion por defecto, que es CPU; el repositorio ocupa 3,0 GB en disco.
- GPU recomendadas: no se especifican; el artefacto esta orientado a CPU.
- Compatibilidad con GPU de consumo: no documentada en la informacion proporcionada.
- Opciones de despliegue: runtime MNN (llm_demo), con compilacion mediante CMake con las flags MNN_BUILD_LLM=ON, MNN_LOW_MEMORY=ON y MNN_SUPPORT_TRANSFORMER_FUSE=ON; integracion via documentacion MNN-LLM.
- Latencia y throughput: no disponibles; la configuracion por defecto usa 4 hilos en CPU con precision=low y memory=low.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-1.5B-Instruct-MNN (este) | 1,5 B | No disponible | HQQ 4 bits, grupo 128 | Apache 2.0 | MNN |
| Qwen2.5-1.5B-Instruct (base) | 1,5 B | No disponible en esta ficha | Original (FP16/BF16) | Apache 2.0 | Safetensors |
| Alternativas de 1-2 B en formato GGUF | No disponible | No disponible | Q4_K_M, Q5_K_M, etc. | Variable | GGUF |

La comparativa con alternativas concretas no esta disponible en la informacion proporcionada; solo se confirma el modelo base Qwen2.5-1.5B-Instruct como referencia directa.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; deben consultarse las limitaciones de Qwen2.5-1.5B-Instruct.
- Riesgo de alucinacion inherente a modelos de 1,5 B; no se han publicado evaluaciones de fidelidad en la informacion disponible.
- Longitud de contexto no especificada en la informacion proporcionada; no debe asumirse la del modelo base sin verificacion.
- Idiomas soportados limitados a chino e ingles segun la model card; el campo de idiomas del repositorio solo lista ingles, lo que genera ambiguedad.
- La cuantizacion HQQ de 4 bits puede degradar la calidad respecto al modelo original en tareas complejas; no se han publicado metricas de degradacion.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y verificar las condiciones del modelo base.
- El formato MNN requiere el runtime especifico; no es directamente compatible con vLLM, llama.cpp, Ollama ni TGI.
- La validacion documentada se limita a x64 CPU con MNN 3.6.2; el comportamiento en otras plataformas no esta verificado en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen2.5-1.5B-Instruct-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- ModelScope: https://modelscope.cn/models/MNN/Qwen2.5-1.5B-Instruct-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
