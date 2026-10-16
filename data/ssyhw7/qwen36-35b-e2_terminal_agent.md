# ssyhw7/qwen36-35b-e2_terminal_agent

## Resumen

qwen36-35b-e2_terminal_agent es un adaptador LoRA (PEFT, rango 32) entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con 35.000 millones de parametros totales y aproximadamente 3.000 millones activos por token segun la denominacion A3B del modelo base. El adaptador lo publica el usuario ssyhw7 como parte de un estudio take-home sobre entrenamiento y fusion de multiples expertos ("multi-expert training and merging"), en el que cada experto se especializa en un rol distinto. En este caso el rol asignado es el de agente de terminal y ejecucion de investigacion, con Terminal-Bench 2.0 y ASI-Bench como benchmarks objetivo.

El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen3.6-35B-A3B (revision 995ad96) y aplicar encima los pesos LoRA. Se entreno con Tinker en bf16, con 2.718 ejemplos y 9.240.494 tokens de perdida, sobre trayectorias de uso de herramientas y ejecucion en shell (trazas de Terminal-Bench 1.x, SWE-smith, TMax-Agent y AgentTuning). La ventana de contexto utilizada durante el entrenamiento es de 32.768 tokens.

Su relevancia actual es doble: por un lado, ejemplifica el flujo de trabajo de especializacion de bajo coste mediante LoRA sobre modelos MoE grandes, incluyendo las matrices de expertos enrutados y la cabeza de desembebido; por otro, documenta de forma explicita los controles de contaminacion aplicados (exclusion de repositorios de SWE-bench Pro, nombres de tareas de Terminal-Bench 2.0 e identificadores de proyecto de ASI-Bench, filtro canary de HLE y solapamiento de 13-gramas). El autor no reclama ninguna mejora de rendimiento: los resultados por benchmark estan pendientes de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base MoE con atencion hibrida (atencion completa y Gated DeltaNet lineal), segun los modulos objetivo declarados |
| Parametros totales | 35.000 millones (modelo base Qwen3.6-35B-A3B); parametros del adaptador no disponibles |
| Parametros activos | Aproximadamente 3.000 millones (denominacion A3B del modelo base) |
| Longitud de contexto | 32.768 tokens (longitud de entrenamiento del adaptador); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | No disponible (adaptador exportado en bf16); no se documentan variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Modelo base | Qwen/Qwen3.6-35B-A3B, revision `995ad96eacd98c81ed38be0c5b274b04031597b0` |
| Rango / alpha de LoRA | 32 / 32 (escalado 1.0) |
| Modulos objetivo | Todas las proyecciones lineales: `self_attn` q/k/v/o, Gated DeltaNet `in_proj_q/k/v/z` + `out_proj`, `shared_expert` gate/up/down, expertos enrutados w1/w2/w3 (fusionados en 3D, un lado compartido entre 256 expertos) y `unembed` (lm_head); el router no se adapta |
| Tamano del repositorio | 2,2 GB |
| Adopcion | 0 descargas y 0 "likes" en el momento de la informacion |

## Arquitectura y entrenamiento

El adaptador hereda la arquitectura del modelo base, que combina atencion clasica con capas de atencion lineal Gated DeltaNet y una capa MoE con 256 expertos enrutados mas expertos compartidos. La intervencion LoRA es deliberadamente amplia: no se limita a las proyecciones de atencion, sino que cubre tambien las matrices de los expertos (w1/w2/w3, fusionadas en una representacion 3D con un lado compartido entre los 256 expertos), el `shared_expert` y la cabeza de desembebido. El router de expertos queda fuera del entrenamiento, de modo que el adaptador modifica como computa cada experto, pero no como se enruta hacia ellos.

El entrenamiento se realizo con Tinker en bf16 durante 170 pasos, con tamano de lote 32, tasa de aprendizaje 1e-4, planificador coseno con 20 pasos de calentamiento y semilla 42. El conjunto de datos final contiene 2.718 ejemplos y 9.240.494 tokens de perdida, y procede de cuatro fuentes: trazas de Terminal-Bench 1.x sin solapamiento con la version 2.0 (42 filas retenidas de 80), trazas de sandbox terminus/SWE-smith (387 de 3.000), TMax-Agent-SFT-terminus (2.999 de 3.000) y AgentInstruct de zai-org (195 de 195). La seleccion de checkpoint se hizo por perdida de validacion mas baja en una particion retenida (0,2031 en el paso 170), sin usar datos de benchmark. Se aplicaron controles de contaminacion explicitos y el autor advierte que se entreno con muestras limitadas en ancho de banda de datasets publicos, sin reclamar mejoras mas alla de lo que muestren las tablas de evaluacion.

## Capacidades

- Ejecucion de tareas en terminal: interpretacion de comandos shell, lectura de la salida y planificacion de la siguiente accion en trayectorias de multiples pasos.
- Uso de herramientas (tool calling) orientado a agentes de ejecucion de investigacion y entornos tipo sandbox.
- Razonamiento multi-paso y bucle agente-observacion-accion, que es exactamente el formato de los datos de entrenamiento (trazas de terminal, SWE-smith y AgentTuning).
- Edicion y reparacion de codigo dentro de flujos de trabajo con shell, heredada de las trazas de estilo SWE-smith.
- Capacidades multilingues limitadas a ingles y chino, tal como declara la model card.
- Capacidad de servir como "experto" dentro de un pipeline de fusion de adaptadores (el estudio multi-expert al que pertenece).
- No se documentan capacidades de vision, audio, ni modos de razonamiento explicito tipo thinking en la informacion disponible.

## Casos de uso

- Agente de terminal autonomo: el adaptador esta entrenado especificamente con trayectorias de Terminal-Bench, por lo que encaja en bucles donde el modelo propone comandos, observa la salida y corrige. La ventana de 32.768 tokens permite mantener el historial de ejecucion sin truncar.
- Automatizacion de tareas de investigacion reproducible: ejecucion de pipelines de experimentos en un sandbox, lanzamiento de trabajos y recogida de resultados, usando el modo tool calling sobre el modelo base servido con vLLM.
- Reparacion de builds en CI/CD: dado un fallo de compilacion o de tests, el agente puede inspeccionar los logs, navegar por el repositorio y aplicar parches, apoyandose en las trazas de tipo SWE-smith incluidas en el entrenamiento.
- Diagnostico de incidentes de infraestructura: sesiones de shell en contenedores para inspeccionar procesos, puertos, logs y configuracion, con la ventaja de que solo 3.000 millones de parametros estan activos por token y el coste de decodificacion es bajo en relacion al tamano total.
- Asistente de linea de comandos para desarrolladores hispanohablantes o chinos: el modelo cubre en/zh y puede integrarse en una CLI que traduzca intenciones en lenguaje natural a comandos y explique la salida.
- Estudio comparativo de fusion de expertos: como uno de los adaptadores del trabajo de multi-expert merging, sirve para evaluar estrategias de combinacion de LoRA sobre modelos MoE con matrices de expertos adaptadas.
- Generacion de datos sinteticos de shell y ciencia: las fuentes de entrenamiento incluyen tareas sinteticas de shell y ciencia, de modo que el adaptador puede emplearse para aumentar conjuntos de trayectorias de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica de forma explicita que los resultados por benchmark de este experto estan "pending (evaluation not yet run)" y remite al README del repositorio de codigo para las cifras principales con intervalos de confianza bootstrap.

| Benchmark objetivo | Estado |
|---|---|
| Terminal-Bench 2.0 | Pendiente de evaluacion (no disponible) |
| ASI-Bench | Pendiente de evaluacion (no disponible) |
| Perdida de validacion en la mezcla de entrenamiento | 0,2031 en el paso 170 (no es un benchmark de capacidad) |

## Requisitos de hardware

- El adaptador por si solo no es utilizable: hay que cargar el modelo base completo de 35.000 millones de parametros y aplicar encima los pesos LoRA.
- VRAM estimada en bf16 para el modelo fusionado: en torno a 70 GB solo para pesos (35.000 millones x 2 bytes), mas cache KV. Esto exige una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU mediante `device_map="auto"`.
- VRAM estimada con cuantizacion de 8 bits: aproximadamente 35 GB de pesos, viable en A6000 48 GB o L40S 48 GB; no cabe en una RTX 4090.
- VRAM estimada con cuantizacion de 4 bits: aproximadamente 18-20 GB de pesos, lo que permitiria encajar el modelo base en una RTX 4090 (24 GB) con contexto reducido, aunque el autor no documenta cuantizaciones soportadas.
- Al ser un MoE con unos 3.000 millones de parametros activos, el coste de decodificacion por token es mucho menor que el de un modelo denso de 35.000 millones, pero el requisito de memoria sigue siendo el del total de parametros.
- Despliegue con vLLM: el propio autor documenta `vllm serve Qwen/Qwen3.6-35B-A3B --enable-lora --lora-modules e2_terminal_agent=<ruta al adaptador>`, que evita fusionar los pesos y permite servir el adaptador sobre una unica instancia base.
- Despliegue con Transformers y PEFT: `PeftModel.from_pretrained(base, "ssyhw7/qwen36-35b-e2_terminal_agent")` con `torch_dtype="bfloat16"`.
- Opciones tipo llama.cpp, Ollama o TGI: no documentadas en la informacion disponible para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen36-35b-e2_terminal_agent (este adaptador) | 35B totales / ~3B activos (heredados del base); adaptador LoRA r=32 | 32.768 tokens en entrenamiento | Apache 2.0 | safetensors (PEFT/LoRA) | Sin evaluar; resultados pendientes | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base, sin adaptador) | 35B totales / ~3B activos | No disponible | No disponible en la informacion proporcionada | safetensors | No disponible | HuggingFace |
| Otros adaptadores del estudio multi-expert | No disponible | No disponible | Apache 2.0 (segun la ficha) | safetensors (PEFT/LoRA) | No disponible | Referenciados, no inventariados en la informacion recibida |
| Alternativas de agente de terminal de la misma categoria | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base Qwen3.6-35B-A3B en la revision indicada, el adaptador no produce resultados.
- El autor declara explicitamente que no se reclama ninguna mejora de rendimiento mas alla de lo que muestren las tablas de evaluacion, y que la evaluacion por benchmark aun no se ha ejecutado.
- Riesgo de alucinacion no cuantificado: no hay evaluaciones de fidelidad ni de robustez publicadas para este adaptador.
- El entrenamiento se realizo sobre muestras limitadas en ancho de banda de los datasets publicos (por ejemplo, 42 de 80 trazas de Terminal-Bench 1.x y 387 de 3.000 trazas de SWE-smith), lo que puede introducir sesgos de seleccion.
- Idiomas soportados unicamente ingles y chino; el rendimiento en castellano no esta documentado.
- Parte de los datos de origen (TMax) contiene contenido generado por Gemini y esta sujeto a los terminos de Google, lo que conviene revisar antes de un uso comercial.
- Los datasets de trazas de Terminal-Bench y SWE-smith no especifican licencia en su ficha de HuggingFace (aunque las tareas subyacentes son Apache 2.0 y MIT respectivamente), lo que anade incertidumbre juridica al uso derivado.
- Aunque la licencia declarada es Apache 2.0, la ficha no detalla si esa licencia cubre tambien las obligaciones derivadas de los datos de entrenamiento.
- No hay informacion sobre sesgos demograficos, toxicidad ni comportamientos peligrosos del agente, algo especialmente sensible en un modelo que genera comandos de shell ejecutables.
- La fecha de creacion y actualizacion del repositorio (2026) y la ausencia de descargas implican que se trata de un artefacto reciente y sin validacion externa por parte de la comunidad.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssyhw7/qwen36-35b-e2_terminal_agent
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B (revision `995ad96eacd98c81ed38be0c5b274b04031597b0`)
- Repositorio de codigo del estudio: https://github.com/HanyangWang0418-oss/qwen36-merge-takehome
- Dataset de trazas de Terminal-Bench 1.x: https://huggingface.co/datasets/mlfoundations-dev/terminal-bench-traces-local
- Dataset de trazas de sandbox SWE-smith: https://huggingface.co/datasets/mlfoundations-dev/swesmith_with_plain_docker-sandboxes-traces-terminus-2
- Dataset TMax-Agent-SFT-terminus: https://huggingface.co/datasets/NiuNiu0110/TMax-Agent-SFT-terminus
- Dataset AgentInstruct (zai-org): https://huggingface.co/datasets/zai-org/AgentInstruct
- Pesos de origen en Tinker: `tinker://423b1516-45ff-5480-b185-cc72ee3a4fa1:train:0/sampler_weights/e2_terminal_agent_r32_s42_20261016_step00170`
