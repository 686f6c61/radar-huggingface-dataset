# theostos/qwen-3.5-babel-4b-sft-agent

## Resumen

qwen-3.5-babel-4b-sft-agent es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-4B, publicado por el usuario theostos bajo licencia Apache 2.0. El modelo está especializado en métodos formales: genera tácticas y demostraciones completas para los asistentes de pruebas Lean 4 y Rocq, y lo hace mediante una llamada nativa a herramienta (`submit_tactic`) integrada en la plantilla de chat de Qwen, en lugar del formato de bloques delimitados que usaban versiones anteriores del proyecto Babel-Formal.

El problema que aborda es la traducción de términos de prueba a tácticas verificables por un comprobador externo: el modelo recibe un término de prueba y un listado de dependencias, y devuelve un bloque de tácticas que el usuario debe validar con Lean o Rocq. Se trata de un modelo exclusivamente de texto, con 4.205.751.296 parámetros, construido sobre Qwen3_5ForCausalLM sin codificador de visión, y distribuido como safetensors consolidados (sin adaptadores ni fragmentos NeMo), de modo que no requiere código de modelo personalizado para la inferencia.

La relevancia del lanzamiento es acotada y conviene enmarcarla con precisión: es una release de investigación con 904 ejemplos de entrenamiento y cinco épocas completas, sin ninguna puntuación de benchmark declarada por el autor. No es un oráculo de corrección y sus pruebas generadas pueden ser inválidas. Su interés está en servir como punto de partida reproducible para pipelines de SFT aplicados a demostración automática de teoremas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM), solo texto |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento uso un limite de secuencia de 12.288 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (consolidados, no adaptadores) |

Otros datos tecnicos: tamano del repositorio 8,4 GB; libreria `transformers` (validado con Transformers 5.5.0); pipeline `text-generation`; plantilla de chat nativa de Qwen incluida; tokenizer y configuracion de generacion incluidos; sin necesidad de instalar NeMo.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen/Qwen3.5-4B: un transformer decoder-only causal de 4.200 millones de parametros, en su variante de texto `Qwen3_5ForCausalLM`. No hay mezcla de expertos, ni atencion lineal, ni componente multimodal. El ajuste no modifica la arquitectura: se publican los pesos consolidados completos en safetensors, junto con el tokenizer, la plantilla de chat nativa y la configuracion de generacion.

El entrenamiento es SFT puro (no GRPO ni iteracion con expertos) sobre 904 ejemplos, con un limite de secuencia de 12.288 tokens, tamano de lote global 32 y tasa de aprendizaje 1e-5. La release corresponde al checkpoint `epoch_4_step_144` (numeracion basada en cero), es decir, cinco epocas completas y 145 actualizaciones del optimizador; el autor indica explicitamente que no se trata del ultimo checkpoint de una ejecucion mas larga. Las demostraciones del dataset envían bloques completos de tacticas de Lean/Rocq y no inventan retroalimentacion del verificador, lo que evita el sesgo tipico de entrenar al modelo con feedback simulado. La innovacion destacable es de formato, no de arquitectura: se adopta la plantilla de chat nativa de Qwen con campo de razonamiento y llamadas a herramienta XML en lugar de un formato propio de tacticas delimitadas. El pipeline de entrenamiento y verificacion esta en el repositorio Babel-Formal del autor.

## Capacidades

- Generacion de texto conversacional con la plantilla de chat nativa de Qwen, incluido el campo de razonamiento (`enable_thinking=True`).
- Demostracion de teoremas en Lean 4: genera bloques de tacticas a partir de un termino de prueba y un listado de dependencias.
- Demostracion de teoremas en Rocq (Coq): misma tarea sobre el asistente Rocq.
- Uso de herramientas (tool calling / function calling) mediante la herramienta `submit_tactic`, serializada en el formato XML nativo de Qwen.
- Razonamiento multi-paso en el sentido de construir una secuencia de tacticas que cierre un objetivo, aunque el bucle de verificacion lo aporta el sistema externo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: modo de razonamiento activable; no hay vision, audio ni ninguna otra modalidad (modelo estrictamente de texto).

## Casos de uso

- Asistente de demostracion interactivo en Lean 4: el usuario pega un termino de prueba y las dependencias disponibles, el modelo responde con una llamada a `submit_tactic` y el sistema ejecuta Lean para aceptar o rechazar la tactica, repitiendo el ciclo con el error devuelto.
- Traduccion de terminos de prueba a tacticas en pipelines de formalizacion: util para convertir bibliotecas de pruebas funcionales (por ejemplo, demostraciones de propiedades en `Prop`) en scripts de tacticas que se integren en un proyecto Lean existente.
- Portabilidad entre asistentes: el mismo modelo cubre Lean y Rocq, lo que permite abordar proyectos de formalizacion mixtos o migraciones de una base de codigo Rocq a Lean sin cambiar de modelo.
- Generacion de borradores para revisión humana en docencia de métodos formales: el modelo produce un candidato de demostracion que el estudiante o el docente verifica con el asistente, reduciendo el tiempo de escritura inicial.
- Automatizacion de tareas repetitivas de prueba en CI de un repositorio formalizado: un bot puede invocar el modelo para rellenar `sorry`s o `Admitted`s triviales y validar el resultado con el comprobador antes de fusionar.
- Investigacion en SFT para métodos formales: dado que el pipeline completo (datos, formato nativo de herramienta, verificación) es reproducible y Apache 2.0, sirve como linea base para comparar estrategias de datos o de formato en demostración automática.
- Prototipado de agentes con tool calling sobre verificación formal: el patrón "modelo propone tactica, entorno verifica, entorno realimenta" es un caso de estudio limpio para construir agentes con bucles de feedback determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica expresamente que esta release no reclama ninguna puntuacion de benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 8,5-9 GB en bf16/fp16 para los 4.200 millones de parametros; aproximadamente 4,5 GB en cuantizacion de 8 bits y 2,5 GB en 4 bits (estimaciones derivadas del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 10-12 GB de VRAM para bf16 sin cuantizar (RTX 3080/4080/4090, A10, L4). Para lotes grandes o contextos largos conviene A100 40/80 GB o H100.
- Cabe en GPU de consumo: si, en RTX 3060 de 12 GB o superiores en bf16; en 4 bits cabe en GPUs de 4-6 GB como RTX 3050 o incluso en portatiles con 6 GB.
- Opciones de despliegue: `transformers` con `accelerate` es la via validada por el autor (Transformers 5.5.0). vLLM, TGI, llama.cpp u Ollama no estan confirmados en la informacion proporcionada; su uso exigiria que la herramienta `submit_tactic` y el formato XML nativo se manejen correctamente en el servidor de inferencia.
- Latencia y throughput estimados: no disponibles.
- Nota de despliegue: la plantilla de chat, el tokenizer y la configuracion de generacion van incluidos, y no se necesita instalar NeMo ni cargar codigo de modelo personalizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theostos/qwen-3.5-babel-4b-sft-agent | 4.205.751.296 | No disponible | Sin benchmark declarado | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible en la informacion proporcionada (el ajuste hereda Apache 2.0) | HuggingFace |
| Otros modelos de demostracion automatica (DeepSeek-Prover, Goedel-Prover y similares) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparacion con alternativas especializadas en demostracion automatica de teoremas no puede completarse con la informacion disponible: no hay datos de parametros, contexto, licencia ni resultados de benchmark de esos modelos en el material proporcionado.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no es un oraculo de correccion: las demostraciones generadas pueden ser invalidas y deben comprobarse siempre con Lean o Rocq.
- El modelo no ejecuta la herramienta `submit_tactic`; solo emite la llamada. La verificacion es responsabilidad del usuario o del sistema que lo integra.
- No se declara ningun resultado de benchmark, por lo que no hay evidencia cuantitativa publicada sobre su calidad en demostracion.
- Volumen de entrenamiento muy reducido: 904 ejemplos. La cobertura de tacticas y de bibliotecas de teoremas sera necesariamente limitada y el riesgo de sobreajuste al estilo del dataset es alto.
- Fecha de creacion posterior a la fecha de corte de la mayoria de las herramientas: la verificacion del modelo requiere Transformers 5.5.0, lo que puede implicar incompatibilidades con entornos mas antiguos.
- Idiomas soportados no disponibles: no puede asumirse un comportamiento multilingue fiable, y el entrenamiento especializado probablemente degrade el rendimiento conversacional general respecto al modelo base.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: presente de forma inherente en un modelo de 4B ajustado con SFT; en este dominio se manifiesta como tacticas sintacticamente plausibles pero no validas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor lo describe como modelo de investigacion y no ofrece garantias de correccion; cualquier uso en produccion debe acompanarse de verificacion externa obligatoria.
- Longitud de contexto real no disponible: el limite de 12.288 tokens corresponde al entrenamiento, no necesariamente a la ventana maxima de inferencia heredada del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theostos/qwen-3.5-babel-4b-sft-agent
- Repositorio Babel-Formal (pipeline de entrenamiento y verificacion): https://github.com/theostos/babel-formal
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
