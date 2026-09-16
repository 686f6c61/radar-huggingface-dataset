# tinyopsec/StepFun-Formalizer-7B-GGUF

## Resumen

StepFun-Formalizer-7B-GGUF es la version cuantizada en formato GGUF de StepFun-Formalizer-7B, un modelo de lenguaje especializado en autoformalizacion matematica: traducir enunciados de problemas matematicos en lenguaje natural a enunciados formales verificables en Lean 4. El modelo original lo desarrolla StepFun a partir de un ajuste fino sobre deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, por lo que hereda la arquitectura Qwen2 densa de 7.615.616.512 parametros y el estilo de razonamiento de la destilacion de R1. Esta publicacion concreta es una recuantizacion de la comunidad realizada por el usuario tinyopsec bajo licencia Apache 2.0.

Su relevancia actual radica en que la autoformalizacion es el cuello de botella practico de la verificacion formal asistida por IA: generar codigo Lean 4 correcto a partir de enunciados informales permite despues comprobar demostraciones de forma automatica. El modelo declara rendimiento estado del arte en los benchmarks de autoformalizacion FormalMATH-Lite, ProverBench y CombiBench, aunque no se aportan cifras numericas en la informacion disponible.

El repositorio ofrece once variantes de cuantizacion, desde F16 (~15 GB) hasta Q2_K (~2,8 GB), lo que permite ejecutar el modelo en GPUs de consumo. Esta pensado exclusivamente para ingles y para la tarea de autoformalizacion; no es un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Qwen2 (derivado de DeepSeek-R1-Distill-Qwen-7B) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (los ejemplos de uso emplean n_ctx=4096, valor configurable en llama.cpp) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | stepfun-ai/StepFun-Formalizer-7B |
| Pipeline | text-generation |
| Tamano del repositorio | 15,2 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de tipo Qwen2 con 7,6 mil millones de parametros, sin mezcla de expertos ni mecanismos de estado recurrente. El modelo original se obtuvo mediante ajuste fino (fine-tuning) sobre deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, es decir, sobre un modelo ya destilado a partir de DeepSeek-R1. Esto implica que la base incorpora patrones de razonamiento en cadena y auto-reflexion propios de la familia R1, que StepFun reorientó hacia la tarea de autoformalizacion en Lean 4.

No se dispone de informacion en los materiales proporcionados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron fases de RLHF, DPO u otras tecnicas de alineamiento posteriores al ajuste supervisado. Tampoco se detallan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal. El entregable de este repositorio es unicamente la conversion y cuantizacion del modelo original a GGUF para su ejecucion con llama.cpp, Ollama y LM Studio, sin reentrenamiento ni modificacion de pesos mas alla del proceso de cuantizacion.

## Capacidades

- Autoformalizacion de problemas matematicos: convierte enunciados en lenguaje natural a declaraciones formales en Lean 4.
- Razonamiento matematico heredado del modelo destilado de DeepSeek-R1 (cadenas de razonamiento antes de emitir la formalizacion).
- Generacion de texto conversacional en formato chat mediante las etiquetas de plantilla del modelo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso explicito: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades de vision o audio: no disponibles.
- Modo de pensamiento (thinking mode) explicito como parametro configurable: no disponible; el estilo de razonamiento proviene del modelo base destilado.
- Ejecucion local en CPU/GPU mediante llama.cpp, Ollama y LM Studio gracias al formato GGUF.

## Casos de uso

- Verificacion formal de enunciados matematicos: dado un problema en lenguaje natural, el modelo produce su equivalente en Lean 4 listo para ser procesado por el comprobador de teoremas. Es adecuado porque esta especificamente ajustado para esa tarea sobre el benchmark FormalMATH-Lite.
- Generacion de datasets de entrenamiento para demostradores automaticos: se pueden formalizar lotes de problemas informales para alimentar pipelines de entrenamiento de modelos de demostracion (por ejemplo, en el ecosistema Lean/mathlib).
- Asistencia a matematicos en la formalizacion de articulos: el modelo traduce conjeturas y definiciones de un borrador en LaTeX o texto plano a sintaxis Lean 4, reduciendo el trabajo manual de transcripcion.
- Integracion en entornos de docencia de matematicas formales: sirve como herramienta de apoyo para estudiantes que aprenden Lean 4, mostrando la traduccion entre enunciado informal y declaracion formal.
- Preprocesado en pipelines de prueba automatica de teoremas: los enunciados formalizados se pasan posteriormente a un demostrador (prover) para intentar cerrar la demostracion, con el modelo actuando como primera etapa del flujo.
- Despliegue local con requisitos modestos: la variante Q4_K_M (~5 GB de VRAM) permite ejecutar el modelo en una GPU de consumo para tareas de autoformalizacion por lotes sin depender de servicios en la nube.
- Filtrado y auditoria de conjuntos de problemas: al formalizar cada enunciado, se puede comprobar su coherencia logica en Lean 4 y detectar enunciados mal planteados o ambiguos.
- Prototipado rapido en cuadernos y scripts: mediante llama-cpp-python o LM Studio se puede integrar la autoformalizacion en flujos de experimentacion sin infraestructura de servidor dedicada.

## Benchmarks y rendimiento

La model card del modelo original afirma rendimiento estado del arte en los benchmarks de autoformalizacion FormalMATH-Lite, ProverBench y CombiBench. Sin embargo, no se proporcionan cifras numericas concretas en la informacion disponible, por lo que no se reproducen valores.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada por cuantizacion (segun la model card):
  - F16: ~16 GB
  - Q8_0: ~9 GB
  - Q6_K: ~7 GB
  - Q5_K_M: ~6 GB
  - Q4_K_M: ~5 GB
  - Q3_K_M: ~4 GB
  - Q2_K: ~3,5 GB
- GPU recomendadas: para las variantes de mayor precision (F16, Q8_0) se requiere una GPU con al menos 16 GB y 9 GB de VRAM respectivamente, lo que incluye A100, H100 o RTX 4090. Las variantes Q4_K_M y Q3_K_M caben en GPUs de consumo de gama media-alta.
- Compatibilidad con GPU de consumo: si. Q4_K_M (~5 GB) y Q3_K_M (~4 GB), junto con Q2_K (~3,5 GB), permiten ejecucion en tarjetas consumer con 6-8 GB de VRAM.
- Opciones de despliegue: llama.cpp (CLI), llama-cpp-python, LM Studio y Ollama (identificador hf.co/tinyopsec/StepFun-Formalizer-7B-GGUF:Q4_K_M). No se mencionan vLLM ni TGI en la informacion disponible, dado que el formato entregado es GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| StepFun-Formalizer-7B (este, GGUF) | 7,6 B | no disponible | Autoformalizacion a Lean 4 | Apache 2.0 | GGUF |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B (modelo base del ajuste) | ~7,6 B | no disponible | Razonamiento general y matematicas | no disponible en la informacion | safetensors |
| Modelos de autoformalizacion alternativos (por ejemplo, adaptaciones de demostradores sobre Lean 4) | no disponible | no disponible | Autoformalizacion y demostracion | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento ni de especificaciones detalladas de alternativas dentro de la informacion proporcionada, mas alla de la relacion de linaje con DeepSeek-R1-Distill-Qwen-7B.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; al estar entrenado sobre un modelo destilado de R1, puede heredar sesgos presentes en los datos de origen del modelo base.
- Riesgo de alucinacion: relevante en la tarea de autoformalizacion, ya que el modelo puede producir declaraciones Lean 4 sintacticamente validas pero que no reflejan fielmente el enunciado informal. La comprobacion con el propio Lean es imprescindible.
- Limitacion idiomatica: el modelo declara unicamente soporte de ingles, por lo que enunciados en castellano u otros idiomas pueden degradar la calidad de la formalizacion.
- Longitud de contexto: no documentada en la informacion disponible; los ejemplos de uso configuran 4096 tokens, lo que puede limitar problemas con enunciados muy extensos.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, cuya licencia no se detalla en la informacion proporcionada.
- Naturaleza del repositorio: se trata de una recuantizacion de la comunidad (autor tinyopsec), no de la publicacion oficial de StepFun; el repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Perdida de calidad en cuantizaciones bajas: la propia model card advierte de perdida significativa de calidad en Q2_K (~2,8 GB).
- Riesgo en produccion: antes de desplegar en un pipeline real de verificacion formal es necesario validar la salida con Lean 4, dado que el modelo puede generar sintaxis incorrecta o declaraciones incompletas.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/tinyopsec/StepFun-Formalizer-7B-GGUF
- Modelo original: https://huggingface.co/stepfun-ai/StepFun-Formalizer-7B
- Modelo base del ajuste: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper: https://arxiv.org/abs/2508.04440
- Codigo: https://github.com/stepfun-ai/StepFun-Formalizer
- LM Studio: https://lmstudio.ai/
- Los resultados de busqueda web proporcionados no contienen enlaces tecnicos relevantes sobre el modelo (unicamente referencias a YouTube).
