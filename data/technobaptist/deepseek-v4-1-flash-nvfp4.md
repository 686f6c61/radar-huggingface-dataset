# TechnoBaptist/DeepSeek-V4.1-Flash-NVFP4

## Resumen

TechnoBaptist/DeepSeek-V4.1-Flash-NVFP4 es un checkpoint cuantizado en NVFP4 del modelo DeepSeek-V4.1-Flash de DeepSeek AI, distribuido en formato safetensors y preparado para su uso con los motores de inferencia vLLM y SGLang sobre hardware NVIDIA Blackwell. El repositorio declara 763.205.315.794 parametros totales en safetensors y un tamano de 527,3 GB repartidos en el repositorio. La model card reproduce la ficha tecnica de la version oficial de NVIDIA (nvidia/DeepSeek-V4.1-Flash-NVFP4), publicada el 16 de septiembre de 2026, y se distribuye bajo licencia MIT.

Se trata de un modelo multimodal nativo de tipo Mixture-of-Experts con arquitectura Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2), capaz de procesar entradas de texto e imagen y de manejar contextos de hasta un millon de tokens. Segun la informacion proporcionada, el backbone consta de 552.000 millones de parametros en total, con 8.000 millones activados durante la fase de prefill y 16.000 millones durante la decodificacion, a los que se suman 196.000 millones de parametros de memoria condicional Engram.

Su relevancia practica esta en que permite desplegar un modelo de esta escala con pesos y activaciones en precision FP4 (W4A4) en grupos de 16, reduciendo el coste de memoria y de ancho de banda frente a un checkpoint en BF16 o FP8, a cambio de exigir aceleradores Blackwell. El repositorio analizado no es el oficial de NVIDIA: es una publicacion de un tercero, con cero descargas y cero interacciones en el momento de la consulta, por lo que la trazabilidad del artefacto no esta garantizada por el fabricante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer auto-regresivo con Mixture-of-Experts, Causal Encoder-Decoder (CED) y Compressed Sparse Attention 2 (CSA2); clase `DeepseekV41ForCausalLM` |
| Parametros totales | 763.205.315.794 (safetensors). La model card desglosa 552.000 millones en el backbone mas 196.000 millones de memoria condicional Engram (748.000 millones declarados, cifra que no coincide con el recuento de safetensors) |
| Parametros activos | 8.000 millones durante prefill y 16.000 millones durante decode |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | NVFP4 con pesos y activaciones en 4 bits (W4A4), grupo de 16, aplicado a los expertos MoE enrutados y convertido desde MXFP4; el repo incluye ademas las etiquetas `fp8` y `8-bit` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash |
| Modalidad de entrada | Texto e imagen (RGB) |
| Modalidad de salida | Texto |
| Libreria declarada | Model Optimizer (nvidia-modelopt v0.47.0rc0; revision de origen `dba1be0a40aa45a94ad051997016db3960a90277`) |
| Motores de inferencia soportados | vLLM y SGLang |
| Hardware compatible | NVIDIA Blackwell (validado en GB300) |
| Sistema operativo preferido | Linux |
| Tamano del repositorio | 527,3 GB |
| Fecha de publicacion en HuggingFace | 17 de septiembre de 2026 (el lanzamiento del checkpoint NVIDIA se indica como 16 de septiembre de 2026) |

## Arquitectura y entrenamiento

El modelo base es un transformer auto-regresivo con mezcla de expertos y arquitectura Causal Encoder-Decoder. Incorpora Compressed Sparse Attention 2 (CSA2), un mecanismo de atencion dispersa comprimida, y memoria condicional Engram de 196.000 millones de parametros, un componente separado del backbone que la model card describe como memoria condicional. El enrutado MoE activa solo una fraccion del total: 8.000 millones de parametros en prefill y 16.000 millones en decode, lo que reduce el coste computacional por token respecto a un modelo denso del mismo tamano. Es nativamente multimodal, con soporte de entrada de imagen junto a texto y contexto de hasta un millon de tokens.

Este checkpoint concreto no se ha reentrenado: es el resultado de una cuantizacion post-entrenamiento con NVIDIA Model Optimizer (version v0.47.0rc0, con cambios de compatibilidad especificos para V4.1). La conversion afecta a los expertos MoE enrutados, que pasan de MXFP4 a NVFP4 en pesos y activaciones con grupo de 16; las proyecciones convertidas que menciona la documentacion son `w1`, `w2` y una tercera cuyo nombre queda truncado en la model card disponible. El proceso de calibracion uso 512 muestras de cnn_dailymail y 512 de Nemotron-Post-Training-Dataset-v2 (1.024 en total, con subconjuntos `stem`, `chat`, `math` y `code`), longitud de secuencia 512, batch size 4 y semilla de seleccion 0. No se proporciona informacion sobre el dataset de entrenamiento original (modalidad, recoleccion y etiquetado figuran como "undisclosed") ni sobre fases de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva con ventana de contexto de hasta 1.000.000 de tokens, orientada a tareas de recuperacion y razonamiento sobre documentos muy extensos (el conjunto de evaluacion AA-LCR mide precisamente recall en contexto largo).
- Razonamiento cientifico y de dominio tecnico, evaluado con GPQA Diamond.
- Generacion y resolucion de codigo cientifico, evaluado con SciCode.
- Seguimiento estricto de instrucciones, evaluado con IFBench.
- Comprension visual: al ser un modelo multimodal nativo, acepta imagenes en formato RGB y las procesa junto al texto; se evalua con MMMU-Pro.
- Tareas de agente en terminal y razonamiento de multiples pasos, evaluado con Terminal-Bench 2.1.
- Capacidades de tool calling y function calling: la model card menciona explicitamente que SGLang se valido probando "reasoning/tool-call parsing", lo que confirma soporte de parseo de llamadas a herramientas en ese runtime.
- Uso previsto declarado por el fabricante: despliegue en sistemas de agentes de IA, chatbots y sistemas RAG.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes autonomos sobre terminal: el modelo fue evaluado en Terminal-Bench 2.1 y su integracion en SGLang se valido con pruebas de razonamiento y parseo de tool calls, por lo que encaja en agentes que ejecutan comandos, interpretan salidas y encadenan pasos hasta completar una tarea de sistema.
- RAG sobre corpus masivos: con 1M de tokens de contexto, permite inyectar libros completos, expedientes o bases de documentacion enteras sin trocear en fragmentos, reduciendo la perdida de contexto que introduce el chunking clasico.
- Analisis de documentacion tecnica con diagramas: la entrada multimodal permite pasar paginas con figuras, esquematicos o capturas y obtener resumenes o respuestas textuales sobre ellas, util en ingenieria, mantenimiento industrial y revision de especificaciones.
- Asistencia en codigo cientifico y numerico: dado su rendimiento evaluado en SciCode, es adecuado para generar y depurar rutinas de calculo, simulacion o analisis de datos en entornos de investigacion, integrándose en notebooks o en pipelines de CI/CD mediante tool calling.
- Atencion al cliente automatizada: gestiona conversaciones multi-turno de largo recorrido gracias a la ventana de 1M tokens, lo que permite mantener el historial completo de un caso sin resumirlo ni descartar turnos anteriores.
- Verificacion de cumplimiento normativo en contratos: el modelo puede recibir un lote completo de contratos y devolver extraccion estructurada de clausulas, fechas y obligaciones, apoyandose en IFBench como indicador de fidelidad al formato de instrucciones solicitado.
- Copiloto de investigacion bibliografica: combinando contexto largo y comprension de imagenes, puede recorrer articulos con graficos y tablas y producir sintesis comparativas entre estudios.
- Automatizacion de back office con imagenes: digitalizacion y explotacion de formularios escaneados o capturas de pantalla dentro de flujos de agentes, con la salida en texto lista para insertar en un sistema posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card enumera los conjuntos de evaluacion empleados (GPQA Diamond, AA-LCR, SciCode, IFBench, MMMU-Pro y Terminal-Bench 2.1) y menciona que los resultados se obtuvieron con vLLM sobre GB300, pero no incluye las cifras obtenidas ni una comparacion con otros modelos. La seccion de resultados cuantitativos aparece truncada en el material disponible.

## Requisitos de hardware

- Almacenamiento: 527,3 GB solo para los pesos en safetensors. A modo de referencia, un empaquetado puramente de 4 bits para 763.200 millones de parametros ocuparia aproximadamente 382 GB, por lo que el tamano real del repositorio sugiere que parte de los componentes (atencion, capas densas o memoria Engram) se conservan en mayor precision que 4 bits.
- Memoria de acelerador: no es desplegable en una sola GPU de consumo. Se requiere un nodo multiproceso con aceleradores Blackwell de gran HBM, como GB200 o GB300 NVL72, o un conjunto de B200/GB300 con agregacion de memoria suficiente para los pesos mas la cache KV de contexto largo y la memoria Engram.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 5090 (32 GB) ni en ninguna GPU de gama deconsumo actual. Tampoco es compatible con generaciones anteriores a Blackwell (Ampere, Ada, Hopper), ya que NVFP4 exige la microarquitectura Blackwell.
- Opciones de despliegue: vLLM y SGLang son los dos motores validados por el fabricante. La validacion se hizo sobre GB300; SGLang se comprobo con carga del modelo, generacion, parseo de razonamiento y tool calls, y pruebas de humo con entrada de imagen.
- Sistema operativo: Linux.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo, TTFT ni curvas de escalado para este checkpoint.
- Requisito adicional: la cuantizacion se genero con nvidia-modelopt v0.47.0rc0, por lo que conviene usar versiones de vLLM y SGLang que incluyan el soporte correspondiente a NVFP4 para esta revision del modelo base.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TechnoBaptist/DeepSeek-V4.1-Flash-NVFP4 | 763.205.315.794 en safetensors (552.000 M backbone + 196.000 M Engram declarados) | 1.000.000 tokens | NVFP4 W4A4, grupo 16 | MIT | Repositorio de terceros, 0 descargas y 0 likes en la fecha de consulta |
| nvidia/DeepSeek-V4.1-Flash-NVFP4 | No disponible en la informacion proporcionada | 1.000.000 tokens | NVFP4 W4A4, grupo 16 | MIT | Checkpoint oficial de NVIDIA, publicado el 16 de septiembre de 2026 |
| deepseek-ai/DeepSeek-V4.1-Flash (base) | No disponible en la informacion proporcionada | 1.000.000 tokens | Pesos sin cuantizar (precision original no indicada) | No disponible en la informacion proporcionada | Repositorio oficial de DeepSeek AI |

No se dispone de datos de rendimiento comparado entre estas variantes ni con modelos de otras familias, por lo que la comparativa se limita a parametros declarados, contexto, esquema de cuantizacion, licencia y canal de distribucion.

## Limitaciones y advertencias

- Procedencia del artefacto: el repositorio analizado pertenece a TechnoBaptist y no a NVIDIA ni a DeepSeek AI. La model card es una copia de la ficha de NVIDIA, lo que no garantiza que los pesos publicados coincidan bit a bit con el checkpoint oficial. Para entornos de produccion conviene verificar el hash y comparar con nvidia/DeepSeek-V4.1-Flash-NVFP4.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de fidelidad factual mas alla de GPQA Diamond. Como en cualquier modelo generativo, la salida debe verificarse, especialmente en contextos cientificos, legales o medicos.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o equidad para este checkpoint. Los datos de calibracion son mayoritariamente en ingles (cnn_dailymail y subconjuntos de Nemotron), lo que puede introducir sesgo de dominio en la calibracion de escalas.
- Idiomas: no disponible. La model card no declara cobertura multilingue y las unicas fuentes de calibracion documentadas son en ingles.
- Restricciones de licencia: el repositorio se distribuye bajo MIT, que permite uso comercial. No obstante, al tratarse de una derivacion de un modelo de DeepSeek AI, conviene revisar los terminos del modelo base antes de un despliegue comercial, ya que la model card no detalla la licencia del original.
- Dependencia de hardware: NVFP4 solo funciona en Blackwell. Esto descarta gran parte del parque instalado de GPUs y limita el despliegue a entornos con GB200, GB300 o B200, ademas de encarecer el coste operativo.
- Coste de contexto largo: aunque la ventana es de 1M de tokens, la cache KV a esa longitud es muy costosa en memoria, por lo que en la practica el contexto util dependera del hardware disponible y de la estrategia de gestion de cache del motor de inferencia.
- Documentacion incompleta: la model card disponible esta truncada en la seccion de cuantizacion post-entrenamiento (solo se listan `w1`, `w2` y una tercera proyeccion sin nombre completo) y no incluye cifras de rendimiento, listado de idiomas ni resultados de evaluacion.
- Coherencia de datos: la suma declarada de parametros (552.000 M + 196.000 M) no coincide con el recuento real de safetensors (763.205 M), una diferencia de aproximadamente 15.200 millones que no se explica en la documentacion.
- Validacion insuficiente: el fabricante advierte explicitamente de que la integracion de modelos fundacionales en sistemas de IA requiere pruebas adicionales con datos especificos del caso de uso, siguiendo una metodologia en V, antes de considerarse apta para produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/DeepSeek-V4.1-Flash-NVFP4
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Checkpoint oficial de NVIDIA: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-NVFP4
- NVIDIA Model Optimizer (repositorio): https://github.com/NVIDIA/Model-Optimizer
- Dataset de calibracion cnn_dailymail: https://huggingface.co/datasets/abisee/cnn_dailymail
- Dataset de calibracion Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Texto de la licencia MIT: https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/mit.md
- Busqueda web: no se encontraron resultados relevantes. Las consultas devolvieron unicamente hilos de foros de soporte de correo electronico (SFR, RED by SFR) sin relacion con el modelo, por lo que no hay papers, blogs ni demos adicionales que enlazar.
