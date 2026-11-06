# Thox-ai/ThoxWork-Code-14B

## Resumen

ThoxWork-Code-14B es un paquete de configuracion publicado por Thox-ai sobre los pesos sin modificar de Qwen/Qwen3-14B, el modelo denso de 14 mil millones de parametros de Alibaba Cloud con licencia Apache-2.0. El repositorio de Hugging Face no contiene pesos entrenados por THOX: incluye un `Modelfile` de Ollama, un `manifest.json` de release y un fichero JSONL de 4,6 KB con el denominado THOX Knowledge Pack v0.1 (ocho entradas publicas verificadas). El modelo ejecutable se distribuye a traves de Ollama con el comando `ollama run Thox-ai/thoxwork-code-14b`, y Ollama descarga los pesos originales de Qwen3-14B fijados por digest.

El objetivo declarado es ofrecer asistencia de generacion, revision y refactorizacion de codigo dentro de un marco de "workgroups" empresariales, donde cada grupo se trata como un dominio de seguridad aislado y el trabajo entre grupos exige una concesion de politica explicita. Ademas, el perfil de sistema incluye un bloque de anclaje (grounding) que obliga al modelo a responder sobre la plataforma THOX exclusivamente a partir del Knowledge Pack y a rechazar la verificacion de estado operativo en vivo.

La relevancia de esta ficha es doble: por un lado, documenta un caso de empaquetado de configuracion (no de entrenamiento) sobre un modelo abierto; por otro, advierte de que el comportamiento diferencial proviene unicamente del prompt de sistema y del contexto inyectado, no de una modificacion de pesos. Cualquier evaluacion de capacidades debe remitirse a Qwen3-14B, cuyo contexto nativo es de 32.768 tokens (extensible a 131.072 mediante YaRN, segun la documentacion del modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-14B, sin modificaciones); empaquetado como configuracion de Ollama |
| Parametros totales | 14B (heredados del modelo base Qwen3-14B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens nativos en Qwen3-14B; la evaluacion de THOX se realizo a 8.192 tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible; el digest de Ollama referenciado ocupa 9,28 GB (cuantizacion Q4-class implicita, no confirmada) |
| Idiomas soportados | Ingles (declarado en la model card); el modelo base Qwen3-14B soporta multiples idiomas, pero el perfil THOX solo declara `en` |
| Licencia | Apache-2.0 |
| Formato de pesos | Pesos del modelo base descargados por Ollama (formato interno de Ollama); el repositorio contiene `Modelfile`, `manifest.json` y `thox-knowledge-v0.1.jsonl` |

## Arquitectura y entrenamiento

No hay entrenamiento. THOX declara explicitamente que no entreno, ajusto ni modifico los pesos: estos son byte-identicos a la release upstream de Qwen3-14B (digest `sha256:bdbd181c33f2ed1b31c972991882db3cf4d192569092138a7d29e973cd9debe8`, 9,28 GB). La arquitectura efectiva es, por tanto, la de Qwen3-14B: un transformer denso con atencion por cabezas de consulta agrupadas (GQA), normalizacion RMSNorm, activacion SwiGLU y embeddings rotatorios (RoPE), con soporte nativo de modo "thinking" en el modelo base. THOX no aporta datos de entrenamiento propios ni procesos de RLHF o DPO adicionales.

El valor anadido del paquete es la capa de configuracion: un perfil de sistema que define el marco de workgroups, un prompt pack empresarial y el Knowledge Pack v0.1 con ocho entradas publicas verificadas en formato JSONL. La model card reconoce que el perfil publicado incorpora un bloque de anclaje reforzado, anadido tras observar que la version inicial del kit improvisaba la respuesta sobre el principio de marca. Este detalle es relevante tecnicamente: demuestra que el comportamiento observado depende de la ingenieria de prompt y no de capacidades latentes nuevas, y que sin ese bloque el modelo base tiende a inventar respuestas sobre la plataforma.

## Capacidades

- Generacion de codigo, revision y refactorizacion, heredadas de Qwen3-14B.
- Razonamiento multi-paso y modo "thinking" del modelo base (no documentado especificamente en el perfil THOX).
- Respuestas ancladas al THOX Knowledge Pack v0.1 para temas de plataforma THOX (8 de 8 topicos respondidos correctamente en la evaluacion del autor).
- Rechazo explicito de verificacion de estado operativo en vivo: el modelo declina confirmar recuentos de nodos, disponibilidad o estado de cluster, remitiendo a las herramientas de administracion.
- Tratamiento de hechos operativos afirmados por el usuario como no verificados (segun el bloque de anclaje del perfil).
- Marco de workgroups: aislamiento por grupo y necesidad de concesion de politica para trabajo entre grupos o entre sitios (convencion de prompting, no barrera de seguridad real).
- Soporte de tool calling y function calling: heredado de Qwen3-14B, aunque no se documenta explicitamente en la model card de THOX.
- Capacidades multilingues: el modelo base las tiene, pero el perfil THOX solo declara ingles.

## Casos de uso

- Asistencia a la generacion de codigo en equipos de trabajo: el modelo escribe y revisa codigo dentro del marco de workgroups, adecuado para equipos que ya operan con la plataforma THOX y necesitan un asistente alineado con su vocabulario y convenciones.
- Revision de codigo en pipelines de integracion continua: puede integrarse como paso de revision automatizada mediante Ollama, con la salvedad de que el rendimiento medido (26,28 tokens/s en host compartido) limita el volumen por unidad de tiempo.
- Respuestas sobre la plataforma THOX ancladas a documentacion: util para soporte interno donde las respuestas deben ceñirse a las ocho entradas verificadas del Knowledge Pack, evitando invenciones sobre funcionalidades no documentadas.
- Despliegue de asistente con alcance de grupo: en aplicaciones anfitrionas que implementen control de acceso real (identidad y politica en la capa de aplicacion), el perfil refuerza la convencion de que el trabajo entre grupos requiere autorizacion explicita.
- Formacion y onboarding de desarrolladores: el modelo puede explicar conceptos de enrutamiento de peticiones frente a paralelismo tensorial (una de las preguntas de humo de la evaluacion), util como apoyo didactico interno.
- Prototipado rapido en local: al ejecutarse con Ollama y requerir aproximadamente 10,5 GB de memoria combinada, es viable en estaciones de trabajo con GPU de 16 GB para experimentacion y demos internas.
- Evaluacion de estrategias de anclaje: como caso de estudio de ingenieria de prompt, sirve para medir como un bloque de grounding cambia la tasa de invencion sobre datos operativos.

## Benchmarks y rendimiento

La model card solo publica metricas de ejecucion y de anclaje, no benchmarks estandar de codigo o razonamiento. No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

| Metrica | Resultado | Condiciones |
|---|---|---|
| Carga del modelo | Exitosa a 8.192 tokens de contexto | Estacion x86_64, GPU clase 16 GB, host compartido |
| Huella de memoria al cargar | 10,49 GB (VRAM + RAM del sistema) | Segun planificacion del runner de Ollama |
| Throughput (generacion larga) | 26,28 tokens/s | 2.207 tokens evaluados, host compartido |
| Preguntas de humo de fabrica | 3/3 respondidas | Principio de marca, trampa de topologia fabricada, enrutamiento vs paralelismo tensorial |
| Anclaje al Knowledge Pack | 8/8 topicos correctos | Respuestas a partir de pasajes verificados |

El autor advierte que el throughput debe interpretarse como un suelo en condiciones de host compartido, no como un perfil de estacion de trabajo dedicada.

## Requisitos de hardware

- Memoria estimada: aproximadamente 10,5 GB combinados de VRAM y RAM del sistema con el build de Ollama referenciado (9,28 GB de pesos mas overhead del runner) a 8.192 tokens de contexto.
- GPU recomendadas: el autor midio en una GPU de clase 16 GB; para contexto completo de 32.768 tokens se requiere mas memoria y se recomienda A100 40 GB, H100 o RTX 4090/A6000 con margen.
- GPU de consumo: cabe en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB, RX 7800 XT) con contexto reducido; en tarjetas de 12 GB requeriria cuantizaciones mas agresivas no documentadas.
- Opciones de despliegue: Ollama es el canal oficial (`ollama run Thox-ai/thoxwork-code-14b`); al ser pesos Qwen3-14B sin modificar, tambien es desplegable con vLLM, TGI o llama.cpp, aunque el perfil THOX solo se distribuye como `Modelfile`.
- Latencia y throughput: 26,28 tokens/s medidos en host compartido con GPU de 16 GB; en hardware dedicado se espera un rendimiento superior, no cuantificado en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ThoxWork-Code-14B | 14B denso | 32.768 (8.192 evaluados) | Apache-2.0 | Ollama + Hugging Face (paquete) | Configuracion sobre Qwen3-14B; sin entrenamiento propio |
| Qwen/Qwen3-14B | 14B denso | 32.768 (131.072 con YaRN) | Apache-2.0 | Hugging Face, Ollama, vLLM | Modelo base identico en pesos; sin perfil THOX |
| Qwen2.5-Coder-14B | 14B denso | 32.768 (131.072 con YaRN) | Apache-2.0 | Hugging Face, Ollama | Especializado en codigo mediante entrenamiento real; alternativa si se busca rendimiento en programacion |
| DeepSeek-Coder-V2-Lite | 16B MoE (2,4B activos) | 128.000 | Licencia propia DeepSeek | Hugging Face | Alternativa MoE con mayor contexto; licencia distinta a Apache-2.0 |

La comparacion clave es con Qwen3-14B: los pesos son identicos, por lo que cualquier diferencia de rendimiento en tareas de codigo proviene del prompt de sistema y del contexto inyectado, no de capacidades nuevas. Frente a Qwen2.5-Coder-14B, este ultimo si fue entrenado especificamente para codigo y probablemente supera al paquete THOX en tareas de programacion puras.

## Limitaciones y advertencias

- Configuracion, no entrenamiento: los pesos son la release upstream sin modificar; el comportamiento diferencial depende del perfil de sistema, el prompt pack y el Knowledge Pack en contexto.
- El aislamiento por grupos es una convencion de prompting y producto, no una barrera de seguridad: el control de acceso real debe implementarse en la capa de identidad y politica de la aplicacion anfitriona.
- Sin estado en vivo: el modelo no tiene telemetria y no puede verificar estado de cluster, recuento de nodos, precios ni disponibilidad; declina responder a esas preguntas por diseno.
- Riesgo de alucinacion: la propia model card documenta que la version inicial del perfil improvisaba la respuesta sobre el principio de marca, lo que obligo a anadir un bloque de anclaje; fuera del Knowledge Pack el riesgo persiste.
- Idioma: el perfil solo declara ingles; el uso en castellano no esta validado por el autor, aunque el modelo base sea multilingue.
- Knowledge Pack muy reducido: ocho entradas publicas (4,6 KB) limitan severamente la cobertura tematica de la plataforma THOX.
- Sin cualificacion de dispositivos: el autor aclara que los dispositivos THOX ejecutan builds mas pequenos y que nada de esta ficha implica rendimiento en dispositivo.
- Licencia: Apache-2.0 permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3-14B y de la distribucion via Ollama.
- Madurez: repositorio con cero descargas y cero likes en el momento de la consulta; sin comunidad ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxWork-Code-14B
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B
- Ejecucion via Ollama: `ollama run Thox-ai/thoxwork-code-14b`
- Descarga del paquete: `hf download Thox-ai/ThoxWork-Code-14B --local-dir ./ThoxWork-Code-14B`
