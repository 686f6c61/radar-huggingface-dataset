# taobao-mnn/Qwen2.5-7B-Instruct-MNN

## Resumen

Qwen2.5-7B-Instruct-MNN es una versión cuantizada del modelo Qwen2.5-7B-Instruct de Alibaba, exportada al formato MNN (Mobile Neural Network) por el equipo taobao-mnn. El modelo original es un transformer decoder-only de 7.000 millones de parámetros entrenado para instrucciones y conversación multilingüe (chino e inglés), y esta variante aplica cuantización HQQ de 4 bits sobre las capas lineales del modelo de lenguaje y la cabeza de salida, manteniendo las escalas de cuantización en FP16 y una matriz de embeddings independiente en BF16.

El propósito de esta ficha es facilitar el despliegue del modelo en entornos con recursos limitados mediante el runtime MNN de Alibaba, que permite ejecución en CPU con 4 hilos y configuraciones de bajo consumo de memoria (`precision=low`, `memory=low`). No se trata de un modelo nuevo, sino de un artefacto de despliegue listo para producción en dispositivos y servidores sin GPU dedicada.

La relevancia actual radica en la posibilidad de ejecutar un modelo de 7B con calidad de instrucción en hardware modesto, usando un formato optimizado (MNN) y una cuantización agresiva (4 bits) que reduce el peso del repositorio a 8,8 GB. La licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.000 millones (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4 bits, grupo 128; escalas en FP16; embeddings en BF16 |
| Idiomas soportados | Chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`) |
| Capas / dimension oculta | 28 / 3584 |
| Tamano del repositorio | 8,8 GB |
| Runtime de inferencia | MNN 3.6.2 (commit b0239771b07b317a258fbc384683bbd540741406) |
| Configuracion por defecto | CPU, 4 hilos, `precision=low`, `memory=low` |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only con 28 capas y dimensión oculta de 3584, entrenado por Alibaba sobre un corpus multilingüe (con énfasis en chino e inglés) y posteriormente ajustado con instrucciones y preferencias humanas. La model card de esta variante no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni las técnicas de alineación (RLHF/DPO) empleadas, por lo que esos datos deben consultarse en la model card del modelo original.

La innovación técnica de esta ficha es el pipeline de cuantización y exportación a MNN: se aplica HQQ (Half-Quadratic Quantization) de 4 bits con tamaño de grupo 128 sobre las capas lineales del transformer y sobre la cabeza de salida, mientras que las escalas de cuantización se mantienen en FP16 y los embeddings de tokens se almacenan por separado en BF16 (`embeddings_bf16.bin`). El resultado se empaqueta en un grafo MNN (`llm.mnn`) más un fichero de pesos (`llm.mnn.weight`), con tokenizador propio (`tokenizer.mtok`) y ficheros de configuración (`config.json`, `llm_config.json`). El runtime MNN soporta fusión de transformadores (`MNN_SUPPORT_TRANSFORMER_FUSE`) y modo de bajo consumo de memoria (`MNN_LOW_MEMORY`), lo que permite inferencia en CPU.

## Capacidades

- Generación de texto y conversación multi-turno en chino e inglés.
- Seguimiento de instrucciones (modelo Instruct del linaje Qwen2.5).
- Razonamiento y resolución de problemas aritméticos (validado en las pruebas de exportación con casos de aritmética).
- Traducción entre idiomas (validado en las pruebas de exportación con casos de traducción).
- Generación de código y tareas de programación (capacidad heredada del modelo base Qwen2.5-7B-Instruct).
- Ejecución en CPU sin GPU dedicada mediante el runtime MNN.
- No se documenta en esta ficha soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode); estas capacidades deben verificarse en la model card del modelo base.

## Casos de uso

- Asistente conversacional en dispositivos sin GPU: el modelo puede desplegarse en servidores CPU o equipos de escritorio usando MNN con 4 hilos y configuración de bajo consumo de memoria, gestionando diálogos multi-turno en chino e inglés.
- Traducción automática zh↔en en pipelines locales: la cuantización 4 bits permite integrar el modelo en herramientas de traducción que se ejecutan en hardware modesto, con latencia aceptable para volúmenes moderados.
- Generación de código en entornos de desarrollo con recursos limitados: al heredar las capacidades del Qwen2.5-7B-Instruct, puede asistir en autocompletado y explicación de código sin necesidad de GPU.
- Prototipado rápido de aplicaciones LLM en móvil o edge: el formato MNN está diseñado para despliegue en dispositivos, lo que facilita validar ideas de producto antes de migrar a infraestructura con GPU.
- Procesamiento por lotes de texto en CPU: tareas de resumen, clasificación o extracción de información sobre corpus en chino e inglés que no requieren baja latencia y pueden ejecutarse en servidores sin acelerador.
- Educación e investigación: permite experimentar con un modelo de 7B cuantizado y estudiar el impacto de HQQ 4 bits en la calidad de salida frente al modelo original en FP16/BF16.
- Sustituto ligero en entornos con restricciones de memoria: cuando no es posible cargar el modelo completo de 7B en precisión nativa, esta variante reduce el peso a 8,8 GB en disco y permite ejecución con `memory=low`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente documenta pruebas de validación funcional (alineación de mapeo FP32, saludos, aritmética, traducción y smoke test con configuración por defecto) realizadas el 2026-11-12 en CPU x64, sin métricas cuantitativas de calidad ni de throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo está diseñado para ejecución en CPU, no en GPU. El tamaño del repositorio es de 8,8 GB, lo que da una cota inferior del espacio en disco necesario.
- GPU recomendadas: no aplica para este formato; el runtime MNN documentado en la model card es para CPU.
- Compatibilidad con GPU de consumo: no documentada para este artefacto MNN. El modelo base Qwen2.5-7B-Instruct en otros formatos (GGUF, safetensors) sí puede ejecutarse en GPUs de consumo, pero esa información no se proporciona en esta ficha.
- Opciones de despliegue: MNN 3.6.2 con el binario `llm_demo` compilado con `-DMNN_BUILD_LLM=ON -DMNN_LOW_MEMORY=ON -DMNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Configuración por defecto: CPU, 4 hilos, `precision=low`, `memory=low`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-MNN (esta ficha) | 7B | No disponible | HQQ 4 bits (grupo 128) | Apache 2.0 | MNN (CPU) |
| Qwen/Qwen2.5-7B-Instruct | 7B | No disponible en esta ficha | FP16/BF16 nativo | Apache 2.0 | safetensors (GPU/CPU) |
| Otras variantes cuantizadas de Qwen2.5-7B-Instruct (GGUF, AWQ, GPTQ) | 7B | No disponible | 4-8 bits según variante | Apache 2.0 | llama.cpp, vLLM, etc. |

La comparativa se limita a variantes del mismo modelo base, ya que no se dispone de datos de benchmarks ni de modelos alternativos comparables en la información proporcionada. La diferencia principal frente al modelo original es el formato de despliegue (MNN en CPU) y la cuantización HQQ 4 bits, que reduce el peso a costa de una posible pérdida de calidad no cuantificada en la documentación.

## Limitaciones y advertencias

- La cuantización HQQ 4 bits puede degradar la calidad de las respuestas frente al modelo original en FP16/BF16; no se han publicado métricas que cuantifiquen esa pérdida.
- Idiomas soportados limitados a chino e inglés según los tags del repositorio; el rendimiento en otros idiomas no está garantizado.
- La longitud de contexto no se especifica en la información disponible; debe consultarse la model card del modelo base Qwen2.5-7B-Instruct.
- No se documenta soporte de tool calling, function calling ni capacidades de agente en esta variante; conviene validarlas antes de usarlas en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de 7B; no se han publicado evaluaciones específicas de fidelidad factual para esta variante cuantizada.
- Sesgos conocidos del modelo base (derivados de sus datos de entrenamiento) no se detallan en la model card de esta variante.
- El artefacto está atado a una versión concreta de MNN (3.6.2, commit b0239771b07b317a258fbc384683bbd540741406); cambios de versión del runtime pueden requerir reexportación.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base y las condiciones de uso de MNN para despliegues en producción.
- El repositorio tiene un número muy bajo de descargas (217) y cero likes en el momento de la consulta, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen2.5-7B-Instruct-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- ModelScope: https://modelscope.cn/models/MNN/Qwen2.5-7B-Instruct-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Licencia Apache 2.0 del modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
