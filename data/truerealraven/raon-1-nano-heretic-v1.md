# TrueRealRaven/Raon-1-nano-heretic-v1

## Resumen

Raon-1-nano-heretic-v1 es una version "decensored" (abliterated) del modelo Raon-1-nano, publicado por el usuario TrueRealRaven en Hugging Face. El modelo base, desarrollado por KRAFTON AI, es un modelo denso de lenguaje de 1.5B parametros efectivos (3.1B totales, incluyendo una tabla de embeddings por capa de 1.5B) disenado para seguir instrucciones, mantener contexto conversacional y ejecutar tool calling en coreano e ingles. Esta variante aplica tecnicas de abliteration mediante la herramienta Heretic v2.1.0 para eliminar los comportamientos de rechazo del modelo original.

El modelo base emplea una arquitectura hibrida con 18 capas de atencion lineal (Raon Delta Attention) y 6 capas de atencion completa (MLA), con un contexto nativo de hasta 262.144 tokens. La version heretic mantiene exactamente la misma arquitectura e interfaz que el original, por lo que requiere `trust_remote_code=True` para su carga. La intervencion se realizo sobre las capas 12 a 19 mediante Arbitrary-Rank Ablation (ARA), reduciendo los rechazos de 99/100 a 9/100 con una divergencia KL de solo 0.0076 respecto al modelo original.

La relevancia de esta ficha radica en que documenta una variante de un modelo reciente de KRAFTON que combina atencion lineal eficiente con contexto largo, y que ha sido modificada para eliminar restricciones de seguridad. Es importante senalar que esta modificacion debilita deliberadamente el comportamiento de seguridad del modelo original, lo que tiene implicaciones directas para su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: 18 capas de Raon Delta Attention (atencion lineal con estado recurrente fijo) + 6 capas MLA (atencion completa), con Raon-mHC y embeddings por capa |
| Parametros totales | 3.1B (incluye tabla de embeddings por capa de 1.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (el modelo base ofrece GGUF, MLX y LiteRT-LM) |
| Idiomas soportados | Coreano e ingles (segun el modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato transformers; el modelo base tambien ofrece GGUF, MLX y LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base Raon-1-nano utiliza una arquitectura hibrida compuesta por 24 capas en total: 18 capas de Raon Delta Attention (RDA) y 6 capas de atencion completa con MLA (Multi-head Latent Attention). La RDA es una atencion lineal con regla delta con puertas de borrado y escritura separadas y un estado recurrente de tamano fijo, lo que permite un coste computacional lineal con la longitud de secuencia. Solo las 6 capas MLA mantienen cache KV, aproximadamente 7 KiB por token en BF16. Ademas, incorpora Raon-mHC (una version optimizada de las manifold-constrained hyper-connections de DeepSeek) y embeddings por capa de 256 dimensiones que cada capa usa para ajustar su salida tras el MLP. Los embeddings de entrada y salida estan atados (tied embeddings).

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo base, mas alla de que fue entrenado en coreano e ingles y optimizado para seguir instrucciones y tool calling. La variante heretic no reentrena el modelo: aplica una ablacion de rangos arbitrarios (ARA) sobre las capas 12 a 19 con los parametros indicados en la model card (preserve_good_behavior_weight 0.3540, steer_bad_behavior_weight 0.0002, overcorrect_relative_weight 0.6129, neighbor_count 9), seleccionados tras 372 ensayos con Heretic v2.1.0.

## Capacidades

- Generacion de texto y conversacion multi-turno en coreano e ingles.
- Seguimiento de instrucciones y de contexto conversacional, con especial enfasis en coreano.
- Tool calling / function calling dentro de conversaciones, orientado a tareas de oficina y control de dispositivos moviles.
- Razonamiento multi-paso y soporte de agentes (heredado del modelo base).
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos y conversaciones prolongadas.
- Capacidad de razonamiento y generacion de codigo (heredada del modelo base, aunque no se detallan benchmarks especificos).
- Comportamiento de rechazo reducido de forma deliberada: 9/100 rechazos frente a 99/100 del original.
- No se mencionan capacidades de vision ni audio en la informacion disponible.

## Casos de uso

- Atencion al cliente automatizada en coreano e ingles: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 262.144 tokens de ventana, manteniendo el hilo de la conversacion y llamando a herramientas de consulta de pedidos o gestion de incidencias.
- Asistentes de oficina con tool calling: integracion en flujos de trabajo que requieren invocar APIs (calendario, correo, gestion de tareas) mediante function calling, aprovechando la capacidad del modelo base para llamar herramientas dentro de la conversacion.
- Despliegue en dispositivo (on-device): al ser un modelo de 1.5B parametros efectivos con variantes GGUF, MLX y LiteRT-LM en el modelo base, es adecuado para inferencia local en Apple Silicon o moviles, con latencia baja y sin dependencia de la nube.
- Procesamiento de documentos largos: resumen y extraccion de informacion de contratos, informes o expedientes de hasta 262.144 tokens, gracias a la atencion lineal que reduce el coste frente a atencion completa.
- Generacion de contenido sin filtros en entornos controlados: la variante heretic esta pensada para escenarios donde se requiere que el modelo no rechace peticiones (por ejemplo, investigacion sobre seguridad de modelos o generacion creativa sin restricciones), siempre que el operador asuma la responsabilidad legal y etica.
- Control de dispositivos moviles mediante instrucciones en lenguaje natural: el modelo base esta disenado explicitamente para tool calling orientado a control de moviles, y esta variante mantiene esa interfaz.
- Prototipado rapido de agentes conversacionales: la licencia Apache 2.0 y el soporte de transformers con `trust_remote_code=True` permiten integrarlo en pipelines de investigacion sin coste de licencia.

## Benchmarks y rendimiento

La model card de la variante heretic proporciona datos de la intervencion de abliteration, pero no benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.):

| Metrica | Este modelo (Trial 372) | Modelo original (KRAFTON/Raon-1-nano) |
|---|---|---|
| Rechazos (sobre 100) | 9/100 | 99/100 |
| Divergencia KL | 0.0076 | 0 (por definicion) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible para esta variante. El modelo base menciona que lidera benchmarks de seguimiento de instrucciones, seguimiento de contexto y conversacion en coreano frente a modelos comparables, pero no se incluyen los numeros concretos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 3.1B parametros totales, en BF16 requeriria aproximadamente 6,2 GB solo para pesos, mas la cache KV (unas 7 KiB por token en las capas MLA) y el estado recurrente de las capas lineales. En cuantizacion de 8 bits, el peso se reduce a unos 3,1 GB; en 4 bits, a unos 1,6 GB (estimaciones teoricas, no confirmadas en la informacion disponible).
- GPU recomendadas: no se especifican en la informacion proporcionada. Por tamano, cabria en GPUs consumer como RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070, RTX 4080 y RTX 4090, asi como en A100 y H100 para despliegues de mayor throughput.
- Cabe en GPU consumer: si, previsiblemente en cualquier GPU con 8 GB o mas en cuantizacion de 8 bits o inferior, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: transformers (con `trust_remote_code=True`), y presumiblemente vLLM, llama.cpp, Ollama y TGI, aunque solo se confirma transformers en la model card. El modelo base ofrece GGUF, MLX y LiteRT-LM para inferencia local.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. La atencion lineal en 18 de las 24 capas deberia reducir el coste en contextos largos frente a un transformer de atencion completa equivalente, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Raon-1-nano-heretic-v1 | 3.1B totales (1.5B efectivos) | 262.144 | Apache 2.0 | Variante abliterated; rechazos 9/100 |
| KRAFTON/Raon-1-nano | 3.1B totales (1.5B efectivos) | 262.144 | Apache 2.0 | Modelo base sin modificar; rechazos 99/100 |
| Qwen2.5-1.5B | 1.5B | 32.768 (tipico) | Apache 2.0 | Modelo denso de proposito general, sin atencion lineal |
| Gemma-2-2B | 2.6B | 8.192 | Gemma license | Modelo denso de Google, contexto mas corto |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto y licencia. La principal diferencia de esta variante frente al modelo base es la reduccion deliberada de rechazos, no una mejora de capacidad.

## Limitaciones y advertencias

- La reduccion de rechazos no implica mayor precision: el modelo puede seguir siendo incorrecto, sesgado o inventar informacion, igual que el modelo base.
- El comportamiento de seguridad se ha debilitado de forma intencionada; el modelo puede generar contenido que el original rechazaria. El usuario es responsable del uso y del cumplimiento legal aplicable.
- No esta destinado a uso por o cerca de menores, ni en entornos donde una salida sin filtros pueda causar dano.
- Es un derivado del modelo base: la licencia Apache 2.0 y los terminos de uso del modelo base tambien se aplican a estos pesos.
- Riesgo de alucinacion inherente a modelos de este tamano; no se han publicado evaluaciones especificas de fidelidad factual para esta variante.
- Limitaciones de idioma: el modelo base esta entrenado en coreano e ingles; el rendimiento en castellano no esta documentado y previsiblemente sera inferior.
- La carga requiere `trust_remote_code=True` y versiones especificas de Transformers y Accelerate (las indicadas en la model card del modelo base), lo que anade complejidad de despliegue y riesgos de seguridad asociados a la ejecucion de codigo remoto.
- No se han publicado resultados de benchmarks de tareas para esta variante, por lo que no se puede verificar su rendimiento mas alla de la metrica de rechazos y divergencia KL.

## Enlaces

- Hugging Face (esta variante): https://huggingface.co/TrueRealRaven/Raon-1-nano-heretic-v1
- Modelo base en Hugging Face: https://huggingface.co/KRAFTON/Raon-1-nano
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
- KRAFTON AI: https://krafton.ai/en/
- Pagina de KRAFTON en Hugging Face: https://huggingface.co/KRAFTON
- Discord de la comunidad KRAFTON: https://discord.gg/sDG7mmZPnc
- X (Twitter) de KRAFTON AI: https://x.com/Krafton_AI
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
