# taobao-mnn/Qwen2-0.5B-Instruct-MNN

## Resumen

Qwen2-0.5B-Instruct-MNN es la version cuantizada y empaquetada para el runtime MNN del modelo Qwen2-0.5B-Instruct, desarrollado originalmente por el equipo Qwen de Alibaba. El repositorio lo publica taobao-mnn, el mismo ecosistema de Alibaba que mantiene el motor de inferencia MNN (Mobile Neural Network). El objetivo no es ofrecer un modelo nuevo, sino un artefacto listo para ejecutar el modelo de 0,5 mil millones de parametros en CPU y dispositivos moviles sin depender de PyTorch ni de CUDA.

La relevancia de esta ficha esta en el formato: frente a los pesos originales en safetensors con precision BF16, aqui se distribuye una representacion optimizada para MNN con cuantizacion HQQ de 4 bits en las capas lineales del transformer y en la cabeza de salida, mientras que las escalas de cuantizacion se mantienen en FP16 y los embeddings se guardan aparte en BF16. El resultado es un paquete de aproximadamente 1,1 GB que se ejecuta por defecto en CPU con 4 hilos.

El modelo base es un transformer decoder-only de 24 capas con dimension oculta de 896, ajustado por instrucciones y con soporte de chino e ingles. Esta pensado para entornos con recursos muy limitados: prototipado en portatil, integracion en aplicaciones Android o iOS mediante MNN, y despliegues edge donde no hay GPU disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), 24 capas, dimension oculta 896 |
| Parametros totales | 0,5 mil millones (modelo base Qwen2-0.5B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4-bit con grupo 128 en capas lineales y cabeza de salida; escalas de cuantizacion en FP16; embeddings en BF16 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-0.5B-Instruct, un transformer decoder-only denso de 24 capas y 896 dimensiones ocultas, afinado por instrucciones a partir del modelo base Qwen2-0.5B. La model card del repositorio no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion corresponde a la documentacion oficial de Qwen2 y no se reproduce aqui.

La aportacion tecnica de este repositorio es el pipeline de exportacion a MNN. Las capas lineales y la cabeza de salida se cuantizan con HQQ (Half-Quadratic Quantization) a 4 bits con tamano de grupo 128, mientras que las escalas de cuantizacion se conservan en FP16 para limitar la perdida de precision. Los embeddings de tokens se almacenan por separado en BF16 (`embeddings_bf16.bin`), lo que permite mantener calidad en la representacion de entrada sin cargar toda la matriz en precision alta durante la inferencia. El grafo y los pesos se serializan en `llm.mnn` y `llm.mnn.weight`, y el tokenizador en `tokenizer.mtok`. La exportacion se valido con MNN 3.6.2 sobre CPU x64 el 2026-11-09, comprobando alineacion de mapeo FP32, generacion de saludos, aritmetica y traduccion, ademas de una prueba de humo con la configuracion por defecto.

## Capacidades

- Generacion de texto conversacional en chino e ingles, con ajuste por instrucciones.
- Razonamiento basico y respuesta a preguntas simples, limitado por el tamano del modelo (0,5B).
- Generacion de codigo y explicaciones tecnicas breves, sin garantias de correccion en tareas complejas.
- Aritmetica sencilla y operaciones de un solo paso, validadas en la prueba de exportacion.
- Traduccion zh-en y en-zh a nivel de frase, segun los casos de validacion reportados.
- Inferencia en CPU sin GPU, con configuracion por defecto de 4 hilos, `precision=low` y `memory=low`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (modelo exclusivamente de texto).

## Casos de uso

- Aplicaciones moviles Android e iOS con MNN: el paquete esta disenado para el runtime MNN, que integra el modelo en apps nativas sin dependencias de PyTorch; el tamano de 1,1 GB y la ejecucion en CPU lo hacen viable en dispositivos de gama media.
- Prototipado rapido en portatil sin GPU: con `llm_demo` y la configuracion por defecto (CPU, 4 hilos) se puede validar un flujo conversacional en minutos, util para pruebas de concepto antes de escalar a modelos mayores.
- Asistentes conversacionales embebidos de bajo coste: para respuestas cortas en chino o ingles dentro de una app o dispositivo IoT, donde el presupuesto de memoria y el consumo energetico son la restriccion principal.
- Traduccion de frases zh-en en local: el modelo cubre traduccion a nivel de frase, adecuada para interfaces de usuario o preprocesado de texto en pipelines offline.
- Generacion de texto auxiliar en entornos air-gapped: al ejecutarse en CPU y no requerir servicios externos, sirve para tareas de resumen corto o reformulacion en sistemas sin conectividad.
- Educacion y demostraciones de cuantizacion: el repositorio incluye `export_args.json` y `refresh_metadata.json`, lo que lo convierte en un ejemplo practico para estudiar el pipeline de exportacion HQQ a MNN y comparar calidad frente al modelo original.
- Filtrado o clasificacion ligera de texto: con prompts de instruccion se pueden construir clasificadores simples (categoria, sentimiento) que corren en el mismo dispositivo que el resto de la aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de validacion cualitativas (alineacion de mapeo FP32, generacion de saludos, aritmetica, traduccion y prueba de humo con configuracion por defecto) realizadas el 2026-11-09 sobre CPU x64 con MNN 3.6.2, sin metricas numericas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- VRAM estimada: no aplica para el caso principal; el modelo esta disenado para CPU. El repositorio ocupa 1,1 GB, y la carga en memoria con cuantizacion 4-bit y embeddings BF16 debe situarse en el orden de 1 GB o algo menos, aunque no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican; el runtime MNN prioriza CPU y aceleradores moviles. Para GPU de escritorio no hay configuracion documentada en esta ficha.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: MNN (compilacion de `llm_demo` con `-DMNN_BUILD_LLM=ON -DMNN_LOW_MEMORY=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON`), integracion via MNN-LLM en aplicaciones moviles. vLLM, llama.cpp, Ollama y TGI no estan soportados por este formato de pesos.
- Latencia y throughput: no disponibles. La configuracion por defecto es CPU con 4 hilos, `precision=low` y `memory=low`, orientada a minimizar memoria mas que a maximizar velocidad.
- Almacenamiento: descarga completa del directorio de aproximadamente 1,1 GB; es imprescindible conservar todos los ficheros (`llm.mnn`, `llm.mnn.weight`, `tokenizer.mtok`, `config.json`, `llm_config.json`, `embeddings_bf16.bin`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Ejecucion en CPU |
|---|---|---|---|---|---|
| Qwen2-0.5B-Instruct-MNN (este) | 0,5B | no disponible | HQQ 4-bit, formato MNN | Apache 2.0 | Si, via MNN |
| Qwen/Qwen2-0.5B-Instruct (original) | 0,5B | no disponible | BF16, safetensors | Apache 2.0 | Posible pero no optimizado |
| Qwen2-1.5B-Instruct | 1,5B | no disponible | BF16, safetensors | Apache 2.0 | Requiere mas recursos |
| Llama 3.2 1B Instruct | 1B | no disponible | BF16, safetensors | Llama 3.2 Community License | Posible via runtimes alternativos |

La comparacion relevante es contra el modelo original: este repositorio no cambia la arquitectura ni el entrenamiento, solo el formato y la precision. Frente a alternativas de mayor tamano como Qwen2-1.5B o Llama 3.2 1B, la ventaja es el menor consumo de memoria y la integracion directa con MNN en movil; la desventaja es la menor capacidad de razonamiento inherente a 0,5B. No se dispone de datos de rendimiento comparativo publicados en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de calidad por cuantizacion: la conversion a HQQ 4-bit puede degradar la coherencia y la precision en tareas de razonamiento o codigo frente al modelo BF16 original; la model card solo valida casos simples.
- Capacidad limitada por tamano: con 0,5B de parametros, el modelo falla con frecuencia en razonamiento multi-paso, matematicas complejas y generacion de codigo no trivial.
- Cobertura idiomatica restringida: solo chino e ingles; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion: como cualquier modelo de lenguaje de este tamano, puede inventar hechos, cifras y referencias sin senal de incertidumbre.
- Sesgos: no se documentan evaluaciones de sesgo en la model card; se heredan los sesgos de los datos de entrenamiento de Qwen2, no detallados en esta informacion.
- Dependencia del runtime: los pesos solo son utilizables con MNN; no se pueden cargar directamente en transformers, vLLM o llama.cpp sin reconversion.
- Version de MNN fijada: la ejecucion validada usa el commit `b0239771b07b317a258fbc384683bbd540741406` (MNN 3.6.2); otras versiones pueden requerir regenerar el esquema o presentar incompatibilidades.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2-0.5B-Instruct y citar correctamente el origen.
- Contexto: no se especifica la longitud de contexto soportada por esta exportacion; no debe asumirse la del modelo original sin verificacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen2-0.5B-Instruct-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen2-0.5B-Instruct
- Repositorio MNN en GitHub: https://github.com/alibaba/MNN
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- ModelScope: https://modelscope.cn/models/MNN/Qwen2-0.5B-Instruct-MNN
- Ficheros de exportacion y validacion: `export_args.json` y `refresh_metadata.json` en el repositorio de Hugging Face
- Licencia: fichero `LICENSE` del repositorio (Apache 2.0)
