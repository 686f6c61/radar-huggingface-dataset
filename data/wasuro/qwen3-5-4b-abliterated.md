# wasuro/Qwen3.5-4B-abliterated

## Resumen

Qwen3.5-4B-abliterated es una versión modificada del modelo Qwen/Qwen3.5-4B, un transformer denso de 4.205.751.296 parámetros (aproximadamente 4,2 mil millones) desarrollado originalmente por el equipo Qwen (Alibaba). La modificación, publicada por el usuario wasuro en Hugging Face, aplica una técnica de "abliteration" mediante la herramienta Abliterix, cuyo objetivo es eliminar o reducir drásticamente el comportamiento de rechazo (refusal) del modelo base, es decir, su negativa a responder a determinadas peticiones.

El modelo resuelve un problema concreto para investigadores y desarrolladores que necesitan evaluar o desplegar modelos sin las capas de alineación de seguridad que limitan ciertas respuestas, manteniendo al mismo tiempo la mayor parte de las capacidades originales. La intervención se realiza en el espacio de pesos mediante proyección ortogonal de la dirección de rechazo y ajustes LoRA de rango 1, optimizados con búsqueda bayesiana, lo que permite reducir los rechazos sin degradar en exceso la distribución de salida respecto al modelo original.

Es relevante en el contexto actual porque ejemplifica una familia creciente de derivados "uncensored" de modelos abiertos, y porque el autor documenta métricas cuantitativas de la intervención (tasa de rechazo y divergencia KL) que permiten evaluar el compromiso entre supresión de rechazos y preservación de capacidades. El modelo conserva la licencia Apache 2.0 del original y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (clase `qwen3_5_text`), sin mezcla de expertos |
| Parametros totales | 4.205.751.296 (aprox. 4,2 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (repo en safetensors sin cuantizar) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Qwen3.5, identificado en los metadatos con la arquitectura `qwen3_5_text`, orientado a generacion de texto y conversacion. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo original en la informacion proporcionada.

La modificacion aplicada por el autor sigue el pipeline de Abliterix, que consta de cuatro etapas: extraccion de la direccion de rechazo a partir de 800 prompts daninos y 800 benignos para identificar patrones de activacion por capa; proyeccion ortogonal para aislar la senal de rechazo eliminando componentes alineados con respuestas normales (reduccion de rechazos del 67 % frente a abliteration cruda); abliteration basada en LoRA con modificaciones de rango 1 en pesos de atencion y MLP, capturadas como adaptadores ligeros en lugar de ediciones destructivas; y optimizacion bayesiana con Optuna TPE sobre la forma del kernel, el indice de direccion fraccional y la fuerza por componente a lo largo de 50 ensayos, buscando el equilibrio Pareto entre baja tasa de rechazo y baja divergencia KL. El resultado reportado es una tasa de rechazo de 3/200 (1,5 %) y una divergencia KL de 0,0065, frente a 34/200 (17 %) y 0,0159 en una iteracion previa.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Qwen3.5-4B.
- Razonamiento y respuesta a instrucciones sin el comportamiento de rechazo del modelo alineado original (tasa de rechazo reportada del 1,5 % sobre 200 prompts de evaluacion).
- Plantilla de chat compatible con `apply_chat_template`, con parametro `enable_thinking` para activar o desactivar el modo de razonamiento segun la documentacion de uso incluida.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada (el pipeline declarado es text-generation).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como responde un LLM cuando se elimina la direccion de rechazo, comparando sus salidas con las del Qwen3.5-4B original y midiendo el efecto sobre la distribucion de respuestas (KL de 0,0065).
- Evaluacion de robustez de filtros y moderacion: sirve como modelo de referencia "sin censura" para probar clasificadores de contenido, guardarrailes y sistemas de moderacion en pipelines de produccion, verificando que detectan contenido que un modelo alineado rechazaria.
- Red teaming y pruebas de seguridad ofensiva controladas: al reducir los rechazos, facilita la generacion de casos de prueba adversarios para auditar defensas de sistemas LLM en entornos de laboratorio.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde temas sensibles (violencia, drama adulto) sin las negativas del modelo base, con 4,2 B de parametros suficiente para ejecucion en hardware de consumo.
- Experimentacion academica con tecnicas de edicion de pesos: dado que la intervencion se documenta como adaptadores LoRA de rango 1, el modelo es un caso de estudio reproducible para investigar abliteration, proyeccion ortogonal y optimizacion bayesiana de hiperparametros.
- Despliegue local en prototipos y demos: con aproximadamente 8,4 GB en safetensors (y menos tras cuantizacion), es viable en GPUs de consumo para entornos de desarrollo donde no se requiere alineacion estricta, como asistentes personales o herramientas internas de generacion de texto.

## Benchmarks y rendimiento

Los unicos datos cuantitativos publicados en la informacion disponible corresponden a las metricas de la intervencion de abliteration, no a benchmarks estandar de capacidad (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor |
|---|---|
| Tasa de rechazo (200 prompts) | 3/200 (1,5 %) |
| Divergencia KL respecto al base | 0,0065 |
| Ensayos de optimizacion | 50 |
| Tasa de rechazo en iteracion previa | 34/200 (17 %) |
| Divergencia KL en iteracion previa | 0,0159 |

No se han publicado resultados de benchmarks de capacidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 8,4 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomiendan 10-12 GB para contexto moderado.
- Cuantizacion a 8 bits: alrededor de 4,5 GB de pesos; a 4 bits: alrededor de 2,5 GB de pesos. Los tipos de cuantizacion concretos no estan documentados en el repo, pero el modelo es compatible con el ecosistema habitual de cuantizacion de transformers.
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion con concurrencia; RTX 4090, RTX 4080 o RTX 3090 para inferencia local en BF16.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en cuantizacion de 8 bits, y en tarjetas con 6-8 GB en cuantizacion de 4 bits.
- Opciones de despliegue: transformers (documentado en la model card), vLLM, TGI y llama.cpp/Ollama tras conversion a GGUF (la conversion no esta publicada en el repo, pero es factible al ser un transformer denso estandar).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | KL | Licencia | Formato |
|---|---|---|---|---|---|---|
| wasuro/Qwen3.5-4B-abliterated | 4,2 B | no disponible | 3/200 (1,5 %) | 0,0065 | Apache 2.0 | safetensors |
| wangzhang/Qwen3.5-4B-abliterated | 4,2 B (base) | no disponible | 3/200 (1,5 %) | 0,0065 | Apache 2.0 | safetensors |
| huihui-ai/Huihui-Qwen3.5-4B-abliterated | aprox. 5 B (segun ficha) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen/Qwen3.5-4B (base) | 4,2 B | no disponible | 34/200 (17 %, iteracion previa) | 0,0159 | Apache 2.0 | safetensors |

La comparativa se limita a los derivados de la misma familia Qwen3.5-4B, ya que no se dispone de datos de rendimiento en benchmarks que permitan contrastar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- La alineacion de seguridad ha sido debil o eliminada deliberadamente: el modelo puede producir contenido inexacto, sesgado, ofensivo, explicito, peligroso o ilegal. No debe usarse en entornos de produccion orientados al publico sin guardarrailes externos.
- Riesgo elevado de alucinacion y de afirmaciones no verificadas, inherente a un modelo de 4,2 B de parametros y agravado por la ausencia de rechazos que actuen como freno.
- No es una release oficial de Qwen: es un derivado independiente publicado por wasuro, y la revision exacta del checkpoint base utilizada no esta registrada en los artefactos de la release.
- La licencia Apache 2.0 se mantiene, pero el autor no otorga derechos adicionales; los usuarios deben conservar los avisos de atribucion y cumplir los terminos de uso aceptable del modelo original.
- No se dispone de informacion sobre idiomas soportados, longitud de contexto, soporte de tool calling ni capacidades multimodales, lo que limita la planificacion de despliegues que dependan de estas funciones.
- El modelo no debe utilizarse para asesoramiento medico, legal, financiero ni para decisiones de alto impacto sin revision humana cualificada, segun la propia advertencia del autor.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria de su comportamiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wasuro/Qwen3.5-4B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Framework Abliterix (GitHub): https://github.com/wuwangzhang1216/abliterix
- Paquete PyPI de Abliterix: https://pypi.org/project/abliterix-llm/
- Derivado de referencia de la familia (wangzhang): https://huggingface.co/wangzhang/Qwen3.5-4B-abliterated
- Derivado alternativo (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-4B-abliterated
- Version GGUF de un derivado alternativo: https://huggingface.co/electricpipelines/Huihui-Qwen3.5-4B-abliterated-GGUF
