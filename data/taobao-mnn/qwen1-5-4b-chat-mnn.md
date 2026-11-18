# taobao-mnn/Qwen1.5-4B-Chat-MNN

## Resumen

Qwen1.5-4B-Chat-MNN es una version cuantizada del modelo de chat Qwen1.5-4B-Chat de Alibaba, exportada al formato MNN (Mobile Neural Network) por el equipo taobao-mnn. El modelo original es un transformer denso de 4.000 millones de parametros con 40 capas y una dimension oculta de 2560, disenado para generacion de texto multilingue (chino e ingles) en entornos conversacionales. Esta variante MNN emplea cuantizacion HQQ de 4 bits con grupo de 128 tanto en las capas lineales del modelo de lenguaje como en la cabeza de salida, manteniendo las escalas de cuantizacion en FP16 y una tabla de embeddings independiente en BF16.

El proposito principal de esta exportacion es permitir la inferencia eficiente en CPU, especialmente en dispositivos con recursos limitados, mediante el runtime MNN de Alibaba. La configuracion por defecto apunta a CPU con 4 hilos, precision baja y modo de memoria reducido, lo que la hace adecuada para despliegues en movil, edge computing o entornos sin GPU dedicada.

Es relevante para desarrolladores que necesitan ejecutar un modelo conversacional de 4B parametros en hardware modesto sin depender de CUDA ni de frameworks de inferencia de gran tamano como vLLM o TGI. El repositorio ocupa 6,5 GB e incluye el grafo del modelo, los pesos cuantizados, el tokenizador y la configuracion de ejecucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen1.5), exportado a MNN |
| Parametros totales | 4.000 millones (modelo base Qwen1.5-4B-Chat) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | HQQ 4 bits, grupo 128 (capas lineales y cabeza de salida); escalas en FP16; embeddings en BF16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Tongyi Qianwen Research License (uso comercial requiere autorizacion adicional) |
| Formato de pesos | MNN (`llm.mnn`, `llm.mnn.weight`, `embeddings_bf16.bin`, `tokenizer.mtok`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen1.5-4B-Chat, un transformer denso de la familia Qwen1.5 de Alibaba, con 40 capas y dimension oculta de 2560. Esta exportacion no reentrena el modelo: parte de los pesos del modelo base y los convierte al formato MNN con cuantizacion HQQ de 4 bits (grupo de 128) para las capas lineales del modelo de lenguaje y la cabeza de salida. Las escalas de cuantizacion se almacenan en FP16 y la tabla de embeddings se mantiene separada en BF16 (`embeddings_bf16.bin`), lo que preserva mayor fidelidad en la representacion de tokens.

La exportacion se valido con MNN 3.6.2 (commit `b0239771b07b317a258fbc384683bbd540741406`) el 12 de noviembre de 2026 sobre CPU x64, comprobando alineacion de mapeo FP32, generacion de saludos, aritmetica, traduccion y pruebas de humo con la configuracion por defecto. Los parametros de exportacion estan documentados en `export_args.json` y los hashes de los ficheros en `refresh_metadata.json`. No se dispone de informacion sobre el proceso de entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO) en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multilingue en chino e ingles.
- Razonamiento basico y respuesta a preguntas dentro del contexto del modelo base Qwen1.5-4B-Chat.
- Generacion de codigo y matematicas segun las capacidades heredadas del modelo base (no verificadas especificamente en esta exportacion).
- Inferencia en CPU mediante el runtime MNN, con configuracion optimizada para bajo consumo de memoria (`memory=low`, `precision=low`).
- Ejecucion en dispositivos edge y moviles gracias al formato MNN y a la cuantizacion de 4 bits.
- Soporte de tool calling, function calling, agentes multi-paso, vision o audio: no disponible en la informacion proporcionada para esta exportacion.

## Casos de uso

- Asistente conversacional en movil o dispositivo edge: el modelo puede ejecutarse en CPU con 4 hilos y modo de memoria reducido, lo que permite integrar un chatbot local en aplicaciones Android o iOS mediante el runtime MNN sin depender de la nube.
- Prototipado rapido de chatbots en entornos sin GPU: al estar cuantizado a 4 bits y empaquetado en MNN, se puede desplegar en portatiles o servidores modestos para validar flujos conversacionales en chino e ingles antes de escalar a modelos mayores.
- Traduccion y asistencia linguistica zh-en: el modelo base soporta ambos idiomas y la validacion de la exportacion incluyo casos de traduccion, por lo que es util para tareas de traduccion asistida o generacion de respuestas bilingues en local.
- Educacion y demos offline: al no requerir conexion ni infraestructura cloud, sirve para talleres, demos y entornos educativos donde se quiere mostrar inferencia de un LLM en hardware de consumo.
- Procesamiento de texto en entornos con restricciones de privacidad: al ejecutarse localmente, los datos no salen del dispositivo, lo que encaja en escenarios con requisitos de confidencialidad (por ejemplo, borradores internos o clasificacion de texto sensible).
- Integracion en aplicaciones de escritorio o herramientas CLI: mediante `llm_demo` o la API de MNN-LLM se puede incorporar generacion de texto a utilidades de linea de comandos o apps de escritorio sin anadir dependencias pesadas de CUDA.
- Evaluacion comparativa de cuantizacion HQQ frente a otros esquemas: util para investigadores que quieran medir la perdida de calidad de HQQ 4 bits en un modelo de 4B en tareas de generacion y traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente reporta pruebas de humo cualitativas (alineacion FP32, saludos, aritmetica, traduccion) realizadas el 12 de noviembre de 2026 en CPU x64 con MNN 3.6.2, sin metricas numericas de MMLU, HumanEval, GSM8K ni latencia/throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente, ya que la exportacion esta pensada para CPU. El repositorio ocupa 6,5 GB, pero los pesos cuantizados a 4 bits reducen el footprint en memoria en tiempo de ejecucion (no se especifica la cifra exacta en la informacion proporcionada).
- GPU recomendadas: no disponible; la configuracion por defecto es CPU con 4 hilos.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada.
- Opciones de despliegue: runtime MNN (compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON`), binario `llm_demo` y API MNN-LLM. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen1.5-4B-Chat-MNN (este) | 4B | no disponible | MNN, HQQ 4 bits | Tongyi Qianwen Research | Hugging Face, ModelScope |
| Qwen/Qwen1.5-4B-Chat (base) | 4B | no disponible | safetensors (original) | Tongyi Qianwen Research | Hugging Face |
| Otras exportaciones MNN de la familia Qwen1.5 | no disponible | no disponible | MNN | Tongyi Qianwen Research | repositorio taobao-mnn |

No se dispone de datos de benchmarks para establecer una comparacion cuantitativa con alternativas. La comparacion se limita a parametros, formato y licencia.

## Limitaciones y advertencias

- Licencia Tongyi Qianwen Research: el uso comercial requiere autorizacion adicional de Alibaba; no es una licencia permisiva para produccion sin tramites.
- Idiomas limitados a chino e ingles; no se garantiza calidad en castellano ni en otros idiomas.
- Modelo base de 4B parametros: capacidad de razonamiento y conocimiento factual inferior a modelos de mayor tamano; riesgo de alucinacion inherente.
- Cuantizacion HQQ 4 bits: puede introducir degradacion adicional en tareas sensibles a la precision numerica (matematicas complejas, codigo largo) respecto al modelo original en FP16/BF16.
- Longitud de contexto no documentada en esta exportacion; conviene verificar el limite efectivo antes de usarla en conversaciones de contexto largo.
- Formato MNN propietario del runtime de Alibaba: no es directamente compatible con ecosistemas como transformers, vLLM o llama.cpp; requiere compilar MNN y usar su API.
- La validacion reportada es cualitativa y limitada a CPU x64; no hay garantias de rendimiento en otras plataformas (ARM, movil) ni de calidad en produccion.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero heredados del modelo base Qwen1.5-4B-Chat.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen1.5-4B-Chat-MNN
- Modelo base: https://huggingface.co/Qwen/Qwen1.5-4B-Chat
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen1.5-4B-Chat/blob/main/LICENSE
- ModelScope: https://modelscope.cn/models/MNN/Qwen1.5-4B-Chat-MNN
- Repositorio MNN: https://github.com/alibaba/MNN
- Documentacion MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
