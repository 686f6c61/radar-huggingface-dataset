# taobao-mnn/Qwen3-Coder-30B-A3B-Instruct-MNN

## Resumen

Qwen3-Coder-30B-A3B-Instruct-MNN es un paquete de inferencia en formato MNN con cuantización HQQ de 4 bits, convertido por el equipo taobao-mnn a partir del checkpoint original Qwen/Qwen3-Coder-30B-A3B-Instruct de Alibaba Qwen. No es un modelo nuevo ni un reentrenamiento: es una redistribución optimizada del mismo modelo base, pensada para ejecutarse con el runtime MNN (Mobile Neural Network) de Alibaba, especialmente en CPU y entornos con recursos limitados.

El modelo subyacente es un transformer de arquitectura MoE (Mixture of Experts) orientado a tareas de codigo y uso agéntico, con 48 capas, 128 expertos enrutados y 8 expertos activos por token. Está diseñado para integración con agentes de codigo, tareas a nivel de repositorio y contexto nativo de 256K tokens, extensible mediante YaRN. La licencia Apache 2.0 permite uso comercial.

La relevancia de este paquete reside en que permite desplegar un modelo de codigo de 30B parámetros totales (con solo una fracción activa por token) en hardware modesto mediante cuantización HQQ de 4 bits y un runtime ligero como MNN. El repositorio ocupa 36,6 GB y las verificaciones publicadas se limitan a 6 casos smoke en CPU, no a evaluaciones de calidad o rendimiento en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture of Experts) |
| Parametros totales | 30B (aproximado, segun nomenclatura del modelo) |
| Parametros activos | 3B (aproximado, segun nomenclatura A3B; 8 expertos de 128 por token) |
| Longitud de contexto | 256K tokens nativos, extensible con YaRN |
| Tipos de cuantizacion | HQQ 4 bits (group size 64, escalas FP16); embeddings en BF16 |
| Idiomas soportados | Ingles (segun model card; capacidades multilingues del modelo base no detalladas) |
| Licencia | Apache 2.0 |
| Formato de pesos | MNN (paquete de inferencia propio del runtime MNN; no safetensors ni GGUF) |
| Capas | 48 |
| Expertos enrutados | 128 |
| Expertos seleccionados por token | 8 |
| Cuantizacion de lineales de texto | HQQ, 4 bits, group size 64, escalas FP16 |
| Almacenamiento de embeddings | BF16 (16 bits), pesos de embedding separados |
| Entrada / salida | Texto a texto |
| Tamano del repositorio | 36,6 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer con capas MoE: 48 capas, 128 expertos enrutados y 8 expertos activos por token, lo que da lugar a una nomenclatura de 30B parametros totales con aproximadamente 3B activos por token. Esta configuracion reduce el coste computacional por token frente a un modelo denso del mismo tamano, manteniendo una capacidad de representacion elevada.

El paquete MNN no aporta entrenamiento adicional: aplica cuantizacion HQQ de 4 bits sobre las lineales de texto con group size 64 y escalas FP16, mientras que los embeddings se mantienen en BF16 con pesos separados. La conversion se realizo con el script llmexport.py del repositorio MNN en el commit 7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4, que incluye correcciones de exportacion MoE. El tokenizador y la plantilla de chat se reutilizan del paquete publicado y deben preservarse al reexportar, junto con los offsets de pesos generados. Los detalles de entrenamiento del modelo original (numero de tokens, composicion del dataset, RLHF/DPO) no estan disponibles en la informacion proporcionada.

## Capacidades

- Generacion de texto y codigo orientada a tareas de programacion y repositorio.
- Razonamiento multi-paso y uso agéntico del modelo (agentic coding), segun la model card del modelo original.
- Integracion con herramientas y agentes de codigo; el formato de function-call es especifico del modelo y debe preservarse al construir la aplicacion agéntica.
- Contexto nativo de 256K tokens, extensible mediante YaRN, adecuado para ficheros y repositorios grandes.
- Capacidades multilingues del modelo base no detalladas en la informacion proporcionada; la model card declara solo ingles.
- Ejecucion en CPU mediante el runtime MNN, con build orientado a bajo consumo de memoria (MNN_LOW_MEMORY).
- Modo thinking, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Asistente de codigo en IDE o editor: el modelo puede recibir contexto de varios ficheros gracias a la ventana de 256K tokens y proponer parches o refactorizaciones, ejecutandose localmente via MNN sin depender de servicios en la nube.
- Revision de pull requests a nivel de repositorio: con contexto largo, puede analizar diffs amplios y ficheros relacionados para detectar regresiones o inconsistencias antes del merge.
- Agente de codigo automatizado: su soporte de tool calling y formato de function-call especifico permite conectarlo a herramientas de compilacion, tests y busqueda de codigo en pipelines agénticos.
- Generacion de tests unitarios: dado un modulo y su contexto, puede producir casos de prueba; conviene validar la salida con ejecucion real en CI.
- Despliegue en entornos con CPU y memoria limitada: la cuantizacion HQQ 4 bits y el runtime MNN permiten ejecutar el modelo en servidores sin GPU dedicada, con build de bajo consumo de memoria.
- Automatizacion de tareas de migracion de codigo: traduccion de fragmentos entre lenguajes o frameworks con contexto suficiente para mantener coherencia entre ficheros.
- Documentacion tecnica asistida: generacion de docstrings y documentacion a partir del codigo fuente, con contexto de repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las verificaciones realizadas son 6 casos smoke funcionales en CPU (High/Low), no una evaluacion amplia de calidad ni benchmarks de GPU. No se dispone de datos de MMLU, HumanEval, GSM8K ni latencia/throughput medidos.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra oficial; el paquete esta orientado a inferencia en CPU via MNN. El repositorio ocupa 36,6 GB, lo que da una referencia del espacio en disco necesario.
- GPU recomendadas: no disponibles en la informacion proporcionada; las verificaciones publicadas son en CPU.
- Compatibilidad con GPU consumer: no confirmada en la informacion disponible.
- Opciones de despliegue: runtime MNN (llm_demo, llm_bench) con build Linux CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; llm_bench permite medirlos localmente con el modelo descargado.
- Requisitos de build: MNN_BUILD_LLM, MNN_LOW_MEMORY, MNN_BUILD_CONVERTER, MNN_SUPPORT_TRANSFORMER_FUSE.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-MNN (este) | 30B totales / ~3B activos | 256K, extensible YaRN | MNN, HQQ 4 bits | Apache 2.0 | Paquete de inferencia CPU via MNN |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (original) | 30B totales / ~3B activos | 256K, extensible YaRN | safetensors (formato original) | Apache 2.0 | Checkpoint de referencia; requiere runtime de transformers |
| Alternativas de otros proveedores | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- La cuantizacion HQQ de 4 bits introduce perdida de precision respecto al checkpoint original; la calidad puede degradarse en tareas sensibles, especialmente codigo complejo o razonamiento largo.
- Las unicas verificaciones publicadas son 6 casos smoke en CPU; no hay evidencia de calidad amplia ni de rendimiento en GPU.
- El formato de function-call es especifico del modelo; alterarlo rompe la integracion con agentes de codigo.
- El modelo base esta orientado a codigo; su uso como modelo generalista de texto puede dar resultados inferiores.
- Idioma declarado: ingles; el rendimiento en castellano no esta documentado en la informacion disponible.
- Riesgo de alucinacion en generacion de codigo: las salidas deben validarse con tests y ejecucion real antes de llevarlas a produccion.
- Licencia Apache 2.0 permite uso comercial, pero deben conservarse los ficheros de licencia y atribucion del modelo original.
- Al reexportar con MNN, es necesario preservar el tokenizador, la plantilla y los offsets de pesos del paquete publicado; modificarlos puede invalidar la inferencia.
- Sesgos conocidos del modelo base: no disponibles en la informacion proporcionada.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/taobao-mnn/Qwen3-Coder-30B-A3B-Instruct-MNN
- Modelo base original: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit MNN usado: https://github.com/alibaba/MNN/commit/7337404b2815b5fb9ddac13f4ac6a1fb37fcbbb4
- Documentacion MNN LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
