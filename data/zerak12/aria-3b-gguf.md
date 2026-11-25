# zerak12/aria-3b-gguf

## Resumen

Aria 3B GGUF es un ajuste fino del modelo Qwen2.5-3B-Instruct orientado a tareas de reparación de código y operación de terminal en entornos aislados (sandbox). Lo desarrolla Zerak Jamil, del Departamento de Ingeniería de Sistemas de Información de la Universidad Politécnica de Erbil, y se distribuye cuantizado en Q4_K_M para su ejecución en hardware de gama baja. La propuesta central es el entrenamiento en dispositivo mediante GRPO (Group Relative Policy Optimization) y RLVR (Reinforcement Learning with Verifiable Rewards), tecnicas de aprendizaje por refuerzo que el autor aplica sobre una GTX 1650 Mobile con 4.096 MiB de VRAM.

El modelo se presenta como un "companero personal de IA" y agente de terminal, con un enfasis claro en la auto-reparacion de trayectorias fallidas: cuando una solucion candidata no supera las aserciones de un sandbox de subprocesos, un mecanismo de reflexion guiado por ejecucion intenta corregirla. La ventana de contexto es de 4.096 tokens, coherente con el modelo base, y el entrenamiento se realizo sobre un conjunto muy reducido de 557 muestras.

Es relevante ahora porque demuestra un flujo completo de RL verificable en hardware de consumo, un enfoque poco habitual en modelos de 3B y que interesa a quienes investigan alineamiento y agentes autonomos con recursos limitados. No obstante, conviene tratar sus resultados con cautela: el volumen de datos de entrenamiento es minimo y los benchmarks publicados son internos, no comparables con evaluaciones estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only) |
| Parametros totales | 3.686.400.000 (3,09B segun model card; 3,686B en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | Q4_K_M (fusionada); adaptador LoRA GGUF separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); adaptador LoRA GGUF |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de la familia Qwen2, con 3,09B parametros y atencion causal estandar. Sobre ella se aplica un ajuste fino con GRPO: se muestrean grupos de G=4 candidatos con temperatura T=0,7, se ejecutan en un sandbox de subprocesos de dos niveles contra invariantes de referencia y se calcula una ventaja relativa normalizada (A_i = (r_i - r_barra) / (sigma_r + 1e-4)). El objetivo es reforzar trayectorias contrastivas, es decir, premiar la separacion entre respuestas correctas e incorrectas dentro del grupo. Las trayectorias fallidas pasan por un mecanismo de reflexion guiado por ejecucion implementado con un componente llamado TracebackDistiller, que reinyecta informacion del error para la auto-reparacion.

El conjunto de entrenamiento consta de 557 muestras: 542 anclas de la fase 9 y 15 trayectorias doradas verificadas mediante RLVR. El entrenamiento se ejecuto durante 753 pasos y 3 epocas, con una perdida que descendio de 0,8113 a 0,0812 y una precision media de token del 78,7% al 82,3% en la fase final de decaimiento coseno. El autor declara que se superaron 109 de 109 invariantes de verificacion (48 invariantes, 10 contrafactuales, 8 de arnes y los propios de RLVR). Todo el proceso se realizo en una GTX 1650 Mobile, lo que constituye la innovacion metodologica principal mas que la arquitectura en si.

## Capacidades

- Generacion de texto y razonamiento general heredados de Qwen2.5-3B-Instruct.
- Generacion y reparacion de codigo, con enfasis en correccion de errores a partir de trazas de ejecucion.
- Operacion de terminal en sandbox: ejecucion de comandos, interpretacion de salidas y correccion iterativa.
- Razonamiento multi-paso con reflexion guiada por ejecucion (hasta un 55,0% de tasa de exito declarada y un 40,0% de recuperacion tras fallo).
- Ajuste fino LoRA distribuido como adaptador independiente, lo que permite aplicar la fase 10 sobre la base sin reemplazarla.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada.
- Tool calling / function calling: no documentado de forma especifica; el enfoque del modelo es la ejecucion directa en terminal, no el protocolo de funciones.
- Vision y audio: no soportados.

## Casos de uso

- Reparacion automatica de codigo en pipelines de CI: el modelo recibe la traza de error de un test fallido, propone un parche y lo valida contra las aserciones del proyecto; su entrenamiento con RLVR esta disenado precisamente para este bucle de intento-verificacion.
- Agente de terminal en entornos aislados: ejecucion de comandos de shell en un sandbox de subprocesos para tareas de administracion acotadas, con capacidad de recuperarse de fallos mediante reflexion.
- Asistente de depuracion para desarrolladores: dado un traceback, el modelo genera hipotesis de causa raiz y comandos de diagnostico, aprovechando el componente TracebackDistiller.
- Automatizacion de tareas de mantenimiento en equipos con GPU de gama baja: al ocupar aproximadamente 1.436 MiB de VRAM en Q4_K_M, puede convivir con otras cargas en una GTX 1650 o similar.
- Prototipado de agentes autonomos en investigacion: su naturaleza abierta (Apache 2.0) y su adaptador LoRA permiten reproducir el flujo GRPO/RLVR sobre la base Qwen2.5-3B.
- Despliegue local en Ollama para asistencia de codigo sin conexion: el Modelfile incluido permite arrancar el modelo con un solo comando, util en entornos air-gapped.

## Benchmarks y rendimiento

Los unicos datos publicados son metricas internas de entrenamiento y de sistema, no benchmarks estandar como MMLU o HumanEval. Se reproducen tal cual:

| Metrica | Resultado | Entorno / metodo |
|---|---|---|
| Perdida de entrenamiento (fase 10) | 0,8113 -> 0,0812 | 557 muestras, 753 pasos, 3 epocas |
| Precision media de token | 78,7% - 82,3% | Fase final de decaimiento coseno |
| Envolvente de servicio en edge | 1.436 MiB VRAM, 28,6-40,1 tok/s | GTX 1650 Mobile (4.096 MiB) |
| Suite de invariantes y tests | 109/109 (100%) | 48 invariantes, 10 contrafactuales, 8 de arnes, RLVR |
| Reparacion via reflexion | 55,0% exito, 40,0% recuperacion | +30,0% absoluto frente a un solo intento |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 1.436 MiB con la cuantizacion Q4_K_M (1,8 GB de archivo), segun el autor.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM libre; el autor lo valida en NVIDIA GTX 1650 Mobile (4.096 MiB). En GPUs superiores (RTX 3060, RTX 4090, A100) funcionara sin problema, aunque el modelo no aprovecha ese excedente.
- Cabe en GPU de consumo: si, en GTX 1650, GTX 1060 6GB, RTX 2060 y superiores.
- Opciones de despliegue: Ollama (Modelfile incluido), llama.cpp, y cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este artefacto GGUF.
- Rendimiento: 28,6-40,1 tokens por segundo en GTX 1650 Mobile; la latencia exacta no se detalla.
- CPU: al ser un modelo de 3B en Q4_K_M, es viable en CPU con llama.cpp, aunque el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aria 3B GGUF (este) | 3,09B | 4.096 | RLVR/GRPO para reparacion de codigo y terminal | Apache 2.0 | GGUF en HF, Ollama |
| Qwen2.5-3B-Instruct (base) | 3,09B | 32.768 | Instruccion general | Apache 2.0 | Safetensors, GGUF, multiples runtimes |
| Qwen2.5-Coder-3B-Instruct | 3,09B | 32.768 | Codigo | Apache 2.0 | Safetensors, GGUF |
| Llama 3.2 3B Instruct | 3,21B | 131.072 | Instruccion general | Llama 3.2 Community | Safetensors, GGUF |

La comparativa mas directa es con el propio Qwen2.5-3B-Instruct: Aria reduce la ventana de contexto de 32.768 a 4.096 tokens y especializa el comportamiento en tareas de reparacion y terminal, a costa de un conjunto de entrenamiento muy pequeno (557 muestras). Frente a Qwen2.5-Coder-3B, Aria no esta entrenado sobre corpus masivo de codigo, sino sobre trayectorias verificadas, por lo que su rendimiento en generacion de codigo general probablemente sea inferior. No hay datos publicos que permitan una comparacion cuantitativa con HumanEval u otras suites.

## Limitaciones y advertencias

- El conjunto de entrenamiento es de solo 557 muestras, lo que limita la generalizacion y aumenta el riesgo de sobreajuste a los invariantes concretos del autor.
- Los benchmarks publicados son internos (perdida, precision de token, suite propia de 109 invariantes); no hay evaluaciones independientes en MMLU, HumanEval o GSM8K.
- La ventana de contexto se reduce a 4.096 tokens frente a los 32.768 del modelo base, lo que restringe tareas de contexto largo.
- Los idiomas soportados no estan documentados; se desconoce el comportamiento en castellano u otras lenguas distintas del ingles.
- Riesgo de alucinacion inherente a un modelo de 3B, agravado por el ajuste fino sobre un dataset reducido.
- El uso como agente de terminal exige un sandbox real y supervision: el modelo puede generar comandos destructivos si se le da acceso sin aislamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El modelo esta pensado para hardware edge con VRAM muy limitada; en GPUs grandes no aporta ventajas frente al base.
- No hay evidencia de soporte de tool calling estandar ni de integracion con frameworks de agentes tipo LangChain o similar.

## Enlaces

- Hugging Face: https://huggingface.co/zerak12/aria-3b-gguf
- Repositorio GitHub: https://github.com/zerakjamil/aria
- Paper academico: https://github.com/zerakjamil/aria/blob/main/docs/aria_academic_paper.pdf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
