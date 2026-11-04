# yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated es una variante del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect. El fine-tune original concentra su senal supervisada en matematicas y disciplinas STEM, manteniendo la eficiencia y desplegabilidad practica de la clase de 9B parametros. Esta version concreta ha sido modificada con Tema_Q-Abliterated, una herramienta exploratoria de abliteracion de pesos que elimina el comportamiento de rechazo (refusal) mediante la ablacion de una direccion de rechazo en los pesos del modelo.

El modelo conserva la arquitectura transformer de Qwen3.5-9B, con 9.653.104.368 parametros totales (aproximadamente 9,65B), y se distribuye en formato safetensors con licencia Apache 2.0. Soporta seis idiomas (ingles, chino, coreano, japones, espanol y ruso) y esta etiquetado para tareas de generacion de texto, razonamiento, matematicas, STEM, tool use y function calling, ademas de image-text-to-text segun los tags del repositorio.

La relevancia de esta ficha radica en que combina dos tendencias actuales: la destilacion de modelos grandes de razonamiento hacia tamanos desplegables en hardware de consumo, y la modificacion de pesos para eliminar capas de rechazo. El autor reporta una tasa de rechazo de 1/100 en generacion completa con una divergencia KL de 0.0421 respecto al modelo base, aunque la propia model card indica que el chequeo de colapso resulto DEGENERATED, un caveat importante para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B), con soporte de MTP (multi-token prediction) evaluado |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el autor menciona conversion a llama.cpp y evaluacion NVFP4 |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 19,3 GB); compatible con transformers, vLLM y conversion a llama.cpp |

## Arquitectura y entrenamiento

El modelo base es un fine-tune de Qwen3.5-9B, una arquitectura transformer densa de aproximadamente 9,65B parametros. El entrenamiento del fine-tune original combino destilacion desde DeepSeek-V4-Pro en modo Max Effect con un conjunto de aproximadamente 250.000 muestras centradas en matematicas y STEM, segun los tags del repositorio (sft, rl, gspo, distillation). Los tags tambien indican el uso de GSPO (Group Sequence Policy Optimization) como algoritmo de RL, ademas de SFT y destilacion. El modelo incorpora soporte de MTP (multi-token prediction), evaluado por el autor, lo que puede mejorar el throughput en inferencia.

La modificacion Tema_Q-Abliterated aplica el algoritmo SCAPE (v3.0.1) para ablacionar la direccion de rechazo capa por capa. Los parametros reportados incluyen una matriz multi-direccion (--guard) con pesos maximos de 0,85 en attn.o_proj (posicion 19,57) y 0,79 en mlp.down_proj (posicion 16,88), con kernel_shape flat en ambas proyecciones. El objetivo surrogate SCAPE evalua cada candidato de busqueda aproximadamente 49 veces mas rapido que la evaluacion de generacion completa convencional, permitiendo completar la busqueda de abliteracion en una maquina solo con CPU. La model card reporta una divergencia KL de 0,0421 respecto al modelo base, manteniendo baja la degradacion de calidad general durante la busqueda.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con enfasis en descomposicion estructurada de problemas.
- Razonamiento matematico y resolucion de problemas STEM, entrenado sobre aproximadamente 250.000 muestras de matematicas y ciencias.
- Tool calling y function calling, segun los tags del repositorio.
- Soporte de agentes y razonamiento multi-paso (multi-step reasoning).
- Capacidades multilingues en ingles, chino, coreano, japones, espanol y ruso.
- Procesamiento image-text-to-text segun el tag del repositorio (no confirmado en la model card).
- Modo de razonamiento (reasoning) heredado del proceso de destilacion.
- Comportamiento de rechazo ablacionado: tasa de rechazo reportada de 1/100 en generacion completa.
- Compatibilidad con text-generation-inference y endpoints compatible.

## Casos de uso

- Resolucion de problemas matematicos y STEM en entornos educativos: el modelo puede descomponer problemas paso a paso y generar soluciones detalladas, aprovechando su entrenamiento sobre aproximadamente 250.000 muestras de matematicas y ciencias.
- Generacion de codigo y asistencia en pipelines de CI/CD: gracias al soporte de tool calling y function calling, puede integrarse en flujos automatizados para generar parches, explicar errores de compilacion o sugerir tests.
- Agentes autonomos multi-paso: el modelo soporta razonamiento multi-paso y tool use, lo que permite construir agentes que planifican, ejecutan herramientas y verifican resultados en tareas de investigacion o analisis.
- Atencion al cliente multilingue: con soporte para seis idiomas (en, zh, ko, ja, es, ru), puede gestionar conversaciones en mercados internacionales sin necesidad de modelos separados por idioma.
- Analisis de documentos tecnicos y cientificos: su enfoque en STEM y su capacidad de razonamiento estructurado lo hacen adecuado para resumir papers, extraer resultados experimentales o explicar conceptos tecnicos.
- Prototipado rapido en hardware de consumo: con 9,65B parametros y formato safetensors, puede desplegarse en GPUs consumer (ver seccion de hardware) para experimentacion local sin depender de infraestructura cloud.
- Investigacion sobre alineacion y seguridad: al ser una version abliterada, sirve como caso de estudio para analizar como la ablacion de la direccion de rechazo afecta a la calidad, la coherencia y la seguridad del modelo.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.). El autor solo reporta metricas del proceso de abliteracion:

| Metrica | Valor |
|---|---|
| Rechazos (generacion completa) | 1/100 |
| Divergencia KL respecto al base | 0,0421 |
| Chequeo de colapso | DEGENERATED (tasa de respuesta anti-sumision del 1%: el modelo repite el prompt del usuario; tasa de deteccion de plantilla de rol del 1%: emite "user"/"assistant" o texto de plantilla en el cuerpo) |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Para un modelo denso de ~9,65B parametros, una estimacion orientativa seria de aproximadamente 19-20 GB en FP16/BF16, 10-11 GB en cuantizacion de 8 bits y 5-7 GB en cuantizacion de 4 bits (estimacion generica por tamano, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar buen rendimiento en A100 (40/80 GB), H100 y RTX 4090 (24 GB) en precision completa o 8 bits.
- GPU consumer: probablemente cabe en RTX 4090 (24 GB) en FP16/BF16 y en GPUs de 8-12 GB con cuantizacion de 4-8 bits (estimacion por tamano, no verificada).
- Opciones de despliegue: transformers, vLLM, text-generation-inference y conversion a llama.cpp, segun la model card. Tambien se menciona evaluacion NVFP4.
- Latencia y throughput: no disponibles. El soporte de MTP (multi-token prediction) podria mejorar el throughput, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated | ~9,65B | No disponible | Apache 2.0 | Version abliterada del fine-tune destilado de DeepSeek-V4-Pro |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | ~9,65B | No disponible | Apache 2.0 | Modelo base sin abliterar; misma destilacion STEM |
| Qwen3.5-9B (base original) | ~9B | No disponible | No disponible | Modelo base arquitectonico del que deriva el fine-tune |
| DeepSeek-V4-Pro | No disponible | No disponible | No disponible | Modelo teacher de la destilacion, de mayor tamano |

La comparativa con alternativas de la misma categoria (modelos densos de ~9-10B orientados a razonamiento y matematicas) no puede completarse con datos verificados en la informacion proporcionada. Los datos de contexto y benchmarks de los modelos comparados no estan disponibles.

## Limitaciones y advertencias

- El chequeo de colapso reportado es DEGENERATED: se detecta un 1% de respuestas que repiten el prompt del usuario y un 1% que emiten texto de plantilla de rol ("user"/"assistant") en el cuerpo de la respuesta. Esto indica riesgo de degeneracion en produccion.
- La abliteracion elimina el comportamiento de rechazo, lo que implica que el modelo puede generar contenido que el modelo base rechazaria. No debe desplegarse en aplicaciones orientadas al publico sin filtros adicionales.
- La divergencia KL de 0,0421 indica cierta desviacion respecto al modelo base; puede haber degradacion sutil en tareas fuera del dominio STEM.
- Riesgo de alucinacion inherente a los modelos de 9B destilados, especialmente en dominios no cubiertos por el entrenamiento (matematicas y STEM).
- La longitud de contexto no esta documentada en la informacion disponible; no se puede garantizar un rendimiento adecuado en contextos largos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el proceso de abliteracion pueden tener implicaciones legales o eticas en determinadas jurisdicciones.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay validacion comunitaria independiente de su calidad.
- El tag image-text-to-text sugiere capacidades de vision, pero la model card no las documenta; no debe asumirse su correcto funcionamiento sin verificacion.

## Enlaces

- HuggingFace: https://huggingface.co/yuna1126/DeepSeek-V4-Pro-Qwen3.5-9B-Tema_Q-Abliterated
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Herramienta Tema_Q-Abliterated: https://github.com/ek15072809/Tema_Q-Abliterated
