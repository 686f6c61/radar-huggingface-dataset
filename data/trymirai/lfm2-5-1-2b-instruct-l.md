# trymirai/LFM2.5-1.2B-Instruct-L

## Resumen

Mirai's LFM2.5-1.2B-Instruct Large es una cuantizacion de 8 bits del modelo LiquidAI/LFM2.5-1.2B-Instruct, desarrollada por trymirai (Mirai Labs) y publicada en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un checkpoint cuantizado mediante tecnicas de post-training quantization orientadas a la inferencia local eficiente en Apple silicon. El modelo conserva la arquitectura y los pesos del original de LiquidAI, con 1.189.264.128 parametros totales segun los metadatos de safetensors.

La relevancia de esta publicacion radica en su metodologia de cuantizacion: 8 bits enteros simetricos con escalas en bfloat16 y tamano de grupo 64, complementada con transformadas de Hadamard aleatorias (RHT) de bloque diagonal con tamano de bloque 32 para reducir los valores atipicos en activaciones y pesos. El autor situa el checkpoint en la frontera de Pareto entre tamano y divergencia KL, afirmando que no encontro un checkpoint mas pequeno con menor divergencia KL.

El modelo esta disenado para ejecutarse exclusivamente en Apple silicon mediante la libreria `uzu` y la CLI `mirai`, distribuida via Homebrew. Esto lo hace relevante para desarrolladores que quieren desplegar un modelo conversacional de 1.2B parametros en Macs sin GPU dedicada, a costa de renunciar a la portabilidad de formatos como GGUF o a los stacks de inferencia habituales (vLLM, llama.cpp, TGI). La licencia heredada es la lfm-open-license del modelo base, no una licencia permisiva generica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de LiquidAI/LFM2.5-1.2B-Instruct; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 1.189.264.128 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit entero simetrico, escalas bfloat16, group size 64; RHT de bloque diagonal con block size 32 |
| Idiomas soportados | no disponible |
| Licencia | lfm-open-license (licencia del modelo base, enlazada desde el repo) |
| Formato de pesos | safetensors (libreria `uzu`); no se ofrece GGUF |
| Tamano del repo | 6.1 GB |
| Descargas | 326 |
| Likes | 1 |
| Fecha de creacion | 2026-08-23 |
| Ultima actualizacion | 2026-11-11 |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Relacion con el base | quantized |
| Plataforma de inferencia | Apple silicon exclusivamente (`uzu` / CLI `mirai`) |

## Arquitectura y entrenamiento

Este checkpoint no incluye entrenamiento propio: es una cuantizacion post-entrenamiento del modelo LiquidAI/LFM2.5-1.2B-Instruct. Por tanto, la arquitectura subyacente es la del modelo original de LiquidAI, cuyos detalles (tipo de bloque, atencion, capas, vocabulario) no se reproducen en la informacion disponible y deben consultarse en la model card del modelo base. El numero de parametros totales confirmado por safetensors es de 1.189.264.128, coherente con la denominacion 1.2B.

La innovacion tecnica de esta publicacion es el esquema de cuantizacion. Se aplica cuantizacion entera simetrica de 8 bits con escalas en bfloat16 y agrupacion en grupos de 64 elementos, lo que reduce el error por grupo respecto a una escala por tensor. Ademas, se aplican transformadas de Hadamard aleatorias con estructura de bloque diagonal y tamano de bloque 32, una tecnica habitual para redistribuir valores atipicos en activaciones y pesos antes de cuantizar y asi mejorar la fidelidad numerica. El autor no documenta en la informacion proporcionada el numero de tokens de calibracion ni la composicion exacta del dataset de calibracion.

La evaluacion de calidad se realizo sobre una mezcla de datos declarada: 45% datos publicos de tipo agentico, 30% datos publicos de SFT y contexto largo, y 25% datos privados de chat. El autor presenta una grafica de divergencia KL frente al tamano del checkpoint y afirma que este modelo se encuentra en la frontera de Pareto, sin especificar los valores numericos de KL ni los checkpoints comparados.

## Capacidades

- Generacion de texto conversacional en el formato instruct del modelo base LiquidAI/LFM2.5-1.2B-Instruct.
- Razonamiento de un solo turno y multi-turno, limitado por el contexto del modelo original (no documentado aqui).
- Capacidades agenticas evaluadas: el 45% de la mezcla de evaluacion son datos publicos de tipo agentico, lo que sugiere soporte para tareas de varios pasos, aunque no se documenta tool calling explicito.
- Contexto largo evaluado: el 30% de la mezcla de evaluacion son datos publicos de SFT y contexto largo.
- Uso en chat y asistencia general: el 25% restante de la evaluacion son datos privados de chat.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio, thinking mode explicito o decodificacion especulativa: no disponibles en la informacion proporcionada.
- Inferencia local en Apple silicon mediante la CLI `mirai` y la libreria `uzu`.

## Casos de uso

- Asistente conversacional local en macOS: el modelo se instala con `brew install mirai` y se ejecuta con `mirai --model trymirai/LFM2.5-1.2B-Instruct-L`, lo que permite tener un asistente de chat sin conexion en un Mac con Apple silicon y sin GPU dedicada.
- Prototipado de agentes en local: dado que la evaluacion incluye un 45% de datos agenticos, es adecuado para probar flujos de varios pasos y automatizaciones simples en el portatil del desarrollador antes de escalar a un modelo mayor.
- Procesamiento de documentos largos en local: la mezcla de evaluacion incluye un 30% de datos de contexto largo, por lo que puede emplearse para resumir o extraer informacion de documentos extensos siempre que se respete la ventana de contexto del modelo base.
- Herramientas de escritorio con IA embebida: al ejecutarse mediante una CLI y una libreria nativa para Apple silicon, encaja en utilidades de linea de comandos, scripts de automatizacion y plugins de editores que necesiten generacion de texto sin enviar datos a la nube.
- Desarrollo y pruebas de pipelines de cuantizacion: sirve como referencia para evaluar el impacto de la cuantizacion 8-bit con RHT frente al modelo original, comparando salidas y divergencia KL en un conjunto propio.
- Escenarios con requisitos de privacidad: al ejecutarse integramente en local, es apto para prototipos que manejen texto sensible y no puedan usar APIs externas, con la advertencia de que la licencia lfm-open-license debe revisarse antes de cualquier uso comercial.
- Educacion e investigacion sobre inferencia eficiente: util para estudiar el equilibrio entre tamano de checkpoint y calidad en modelos de 1.2B sobre hardware de consumo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta una grafica cualitativa de divergencia KL frente al tamano del checkpoint y una descripcion de la mezcla de evaluacion (45% agentico publico, 30% SFT/contexto largo publico, 25% chat privado), sin cifras numericas de MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- Plataforma soportada: exclusivamente Apple silicon (segun la model card, "currently only Apple silicon inference is supported").
- VRAM estimada: no disponible de forma explicita; el repo ocupa 6.1 GB, aunque el peso de los parametros en 8 bits para 1.189.264.128 parametros se situa en torno a 1,2 GB mas escalas y metadatos, por lo que la huella real debe medirse en el dispositivo.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta pensado para la GPU integrada de los chips Apple silicon (series M). No se documenta soporte para A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: si, en equipos Apple silicon con memoria unificada suficiente; no se documenta soporte para GPUs de consumo NVIDIA o AMD.
- Opciones de despliegue: CLI `mirai` (instalable con Homebrew) y libreria `uzu`; compilacion desde codigo fuente segun la guia del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|---|
| trymirai/LFM2.5-1.2B-Instruct-L | 1.189.264.128 | no disponible | 8-bit int simetrico, group size 64, RHT | lfm-open-license | Apple silicon (`uzu`) | Cuantizacion del modelo LiquidAI; frontera de Pareto tamano-KL segun el autor |
| LiquidAI/LFM2.5-1.2B-Instruct | 1.2B (aproximado) | no disponible | pesos originales (probablemente bf16/fp16) | lfm-open-license | multiple segun ecosistema del modelo base | Modelo original; referencia de calidad y arquitectura |
| Otros modelos de ~1.2B en formato GGUF | ~1.2B | variable | 4-8 bits | variable | llama.cpp, Ollama y similares | No disponible un comparable concreto en la informacion proporcionada |

La comparacion cuantitativa con alternativas de la misma categoria no esta disponible: la informacion proporcionada no incluye resultados de benchmarks ni listado de checkpoints competidores con sus metricas.

## Limitaciones y advertencias

- Dependencia de plataforma: solo se soporta inferencia en Apple silicon; no hay soporte documentado para CUDA, ROCm ni CPU x86, lo que limita el despliegue en servidores convencionales.
- Ecosistema reducido: requiere la libreria `uzu` y la CLI `mirai`; no hay GGUF ni integracion con vLLM, llama.cpp, Ollama o TGI, lo que complica la integracion en stacks existentes.
- Licencia: se hereda la lfm-open-license del modelo base, que no es una licencia permisiva generica; es obligatorio revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Perdida de calidad por cuantizacion: al ser un checkpoint de 8 bits, existe una degradacion respecto al modelo original; el autor solo la caracteriza mediante divergencia KL y una grafica, sin cifras absolutas de benchmarks.
- Ausencia de datos de evaluacion estandar: no se publican resultados de MMLU, HumanEval, GSM8K ni similares, por lo que la comparacion objetiva con alternativas es imposible con la informacion disponible.
- Idiomas no documentados: no se especifica la cobertura linguistica, lo que impide garantizar un comportamiento adecuado fuera de los idiomas del modelo base.
- Contexto no documentado: no se indica la longitud de contexto efectiva, un dato critico para planificar casos de uso con documentos largos.
- Riesgo de alucinacion: inherente a los modelos de 1.2B parametros; no se documentan mitigaciones especificas ni evaluaciones de factualidad.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la informacion proporcionada.
- Madurez y adopcion: 326 descargas y 1 like en el momento de la consulta, lo que indica una adopcion muy limitada y poca validacion por parte de la comunidad.
- Procedencia de la evaluacion: parte de la mezcla de evaluacion son datos privados de chat, no reproducibles externamente, lo que dificulta verificar las afirmaciones de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trymirai/LFM2.5-1.2B-Instruct-L
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Model card del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/README.md
- Licencia lfm-open-license: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Pagina del modelo en Mirai: https://trymirai.com/local-models/liquidai-lfm2-5-1-2b-instruct-mirai-mirai-l-8
- Blog de cuantizacion de Mirai: https://trymirai.com/blog/quantization
- Repositorio `uzu` (guia de ejecucion): https://github.com/trymirai/uzu/blob/how-to/docs/how-to-run-uzu.md
