# sriharsha4444/gemma-4-E2B-it-pi-mono-sft

## Resumen

gemma-4-E2B-it-pi-mono-sft es un ajuste fino por SFT con LoRA del modelo multimodal google/gemma-4-E2B-it, publicado por el usuario sriharsha4444. El entrenamiento se realizó sobre trazas de sesión reales del agente de programación pi (pi-mono) trabajando sobre su monorepo de TypeScript, recogidas en el dataset badlogicgames/pi-mono y procesadas en sriharsha4444/pi-mono-gemma4-sft. El objetivo es especializar un modelo pequeño en flujos agénticos multiturno con llamadas a herramientas.

Los pesos publicados son el resultado de fusionar el adaptador ganador de un barrido de cuatro configuraciones de hiperparámetros (r64, alpha 128, LR 3e-4), seleccionado por pérdida de evaluación sobre sesiones no vistas. El resultado son 5.104.297.539 parámetros reales según safetensors, con un repositorio de 10,2 GB en bf16.

Su relevancia ahora es doble. Por un lado, documenta con inusual honestidad un caso de olvido catastrófico: HumanEval cae 8,5 puntos y MBPP 8,2 puntos respecto al modelo base. Por otro, demuestra que una especialización agéntica barata (150 pasos de optimizador, medio epoch, presupuesto de 20 dólares en una A100 large) puede mejorar la pérdida in-domain en un dominio muy concreto a costa de las capacidades generales de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Gemma 4; la model card menciona torres de vision y audio congeladas durante el entrenamiento |
| Parametros totales | 5.104.297.539 segun safetensors (fuentes externas describen la variante E2B como ~2,1 mil millones de parametros efectivos, dato no confirmado) |
| Parametros activos | no disponible (no se confirma si la arquitectura es MoE) |
| Longitud de contexto | no disponible; el entrenamiento uso ventanas de 4.096 tokens y una fuente externa no oficial indica 8K para el modelo base |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos completos en precision completa (bf16) |
| Idiomas soportados | no disponibles |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (pesos completos fusionados, 10,2 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base google/gemma-4-E2B-it: un transformer multimodal (etiquetado como image-text-to-text en HuggingFace) con torres de vision y audio que permanecieron congeladas. El ajuste se aplico exclusivamente a las proyecciones de atencion y MLP del modelo de lenguaje mediante LoRA con dropout 0,05, usando TRL con perdida `chunked_nll`. Hiperparametros del run seleccionado: rango 64, alpha 128, learning rate 3e-4, scheduler coseno con 5 por ciento de calentamiento, batch efectivo 16 (2 x 8 de acumulacion de gradiente), longitud maxima 4.096, precision bf16 y 150 pasos de optimizador, lo que cubre aproximadamente 2.400 de las 4.804 ventanas de entrenamiento (≈0,50 epoch). La evaluacion intermedia se hacia cada 50 pasos con recarga del mejor checkpoint.

El barrido comparo cuatro configuraciones y selecciono r64-lr3e-4 por perdida de evaluacion de 1,0939 sobre 292 ventanas de 37 sesiones nunca vistas en entrenamiento, frente a 1,1373 (r16, alpha 32, LR 3e-4), 1,1416 (r64, alpha 128, LR 1e-4) y 1,2075 (r16, alpha 32, LR 1e-4). El adaptador ganador se fusiono en los pesos base y se publico como modelo completo. No hay informacion sobre la composicion detallada del dataset de trazas, el numero total de tokens de entrenamiento ni sobre etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generacion de texto conversacional multiturno, con plantilla de chat propia de la familia Gemma.
- Llamada a herramientas (tool calling) y function calling, capacidad reforzada por el entrenamiento sobre trazas agénticas reales.
- Ejecucion de flujos agénticos de varios pasos en un bucle de agente de programacion, con contexto acumulado de sesion.
- Generacion y edicion de codigo, con especializacion en el monorepo TypeScript pi-mono del agente pi.
- Capacidades multimodales heredadas del modelo base (image-text-to-text), aunque las torres de vision y audio no se entrenaron.
- Modo de razonamiento (`<|think|>`) disponible en el modelo base; parte de los datos de entrenamiento contiene trazas de razonamiento, pero las evaluaciones publicadas se hicieron con dicho modo desactivado.
- Capacidades generales de codigo en Python preservadas parcialmente: 64,6 por ciento de pass@1 en HumanEval y 61,5 por ciento en MBPP.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Automatizacion de tareas de refactorizacion en un monorepo TypeScript: el modelo esta entrenado sobre sesiones reales del agente pi trabajando en pi-mono, por lo que reconoce el patron de exploracion de ficheros, edicion y verificacion con herramientas. Conviene usarlo como demo o experimento, no como sustituto del modelo base.
- Reproduccion de investigacion sobre olvido catastrófico: la ficha publica dos benchmarks con barras de error, que permiten estudiar como la especializacion agéntica degrada el codigo general.
- Prototipado de agentes locales de bajo coste: con 5,1 mil millones de parametros en bf16 cabe en una GPU de consumo y sirve para iterar sobre bucles de agente sin gastar presupuesto en modelos grandes.
- Generacion de trazas sinteticas de agentes para ampliar el dataset de entrenamiento: el modelo replicaria el formato de turnos y llamadas a herramientas del corpus pi-mono.
- Evaluacion de pipelines de SFT con TRL y LoRA: el repositorio incluye los identificadores de trabajo, adaptadores y metricas de un barrido completo, util como referencia metodologica.
- Analisis offline de codigo TypeScript en entornos sin conectividad, si se convierte a GGUF y se ejecuta con llama.cpp u Ollama en hardware modesto (formato no publicado por el autor).
- Experimentos de agentes con tool calling en CPU o dispositivos de borde, dado el tamano reducido de la familia E2B y los datos publicados de ejecucion cuantizada del modelo base en una Raspberry Pi 5.

## Benchmarks y rendimiento

| Benchmark | Base gemma-4-E2B-it pass@1 (%) | Este modelo pass@1 (%) | Delta |
|---|---|---|---|
| HumanEval (164 problemas) | 73,2 ± 3,5 | 64,6 ± 3,7 | -8,5 |
| MBPP sanitized test (257 problemas) | 69,6 ± 2,9 | 61,5 ± 3,0 | -8,2 |

Condiciones de evaluacion en ambos casos: Inspect AI con tareas `humaneval` y `mbpp` de `inspect_evals`, backend vLLM, decodificacion voraz (temperatura 0), 1 epoch (pass@1), maximo 1.024 tokens nuevos, prompts por defecto y `--sandbox local`. El protocolo de MBPP sustituyo las 5 muestras con pass@k a temperatura 0,5 por pass@1 voraz, por lo que las cifras no son comparables con las de leaderboards que usan otros prompts o muestreo.

Metrica in-domain: perdida de evaluacion de 1,0939 sobre 292 ventanas de 37 sesiones no vistas (run seleccionado). No existe un benchmark agéntico ejecutable para pi-mono, por lo que el exito de tarea in-domain no esta medido.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 10,2 GB solo de pesos, mas cache KV; se recomienda un minimo de 16 GB.
- VRAM en cuantizacion de 8 bits: alrededor de 6-7 GB; en 4 bits, alrededor de 4-5 GB (estimaciones a partir del numero de parametros; el autor no publica cuantizaciones).
- GPU recomendadas: A100 40 GB (usada en el barrido de entrenamiento), H100, L40S o cualquier GPU con 16 GB o mas para pesos completos.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, en cuantizacion de 4 bits, en GPUs de 8 GB.
- CPU y dispositivos de borde: una prueba externa del modelo base E2B cuantizado a aproximadamente 1,5 GB reporta 3-4 segundos hasta el primer token y 8-12 tokens por segundo en una Raspberry Pi 5.
- Despliegue: vLLM (backend usado en las evaluaciones publicadas), transformers con el pipeline text-generation, y TGI. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles para este ajuste concreto; los unicos datos publicados corresponden al modelo base cuantizado en Raspberry Pi 5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-4-E2B-it-pi-mono-sft (este modelo) | 5.104.297.539 (safetensors) | no disponible | HumanEval 64,6; MBPP 61,5; perdida held-out 1,0939 | gemma | Pesos completos fusionados, 0 descargas y 0 likes |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | HumanEval 73,2; MBPP 69,6 | gemma | Modelo oficial de Google |
| sriharsha4444/gemma-4-E2B-it-pi-mono-r64-lr3e-4 | adaptador LoRA | no disponible | Perdida held-out 1,0939 (mismo run, sin fusionar) | gemma | Adaptador publicado |
| sriharsha4444/gemma-4-E2B-it-pi-mono-r16-lr3e-4 | adaptador LoRA | no disponible | Perdida held-out 1,1373 | gemma | Adaptador publicado |

No se dispone en la informacion proporcionada de datos de rendimiento de otros modelos de la misma categoria (ajustes agénticos sobre trazas de agentes de programacion) que permitan una comparacion externa.

## Limitaciones y advertencias

- Regresion medida en codigo general: HumanEval baja 8,5 puntos y MBPP 8,2 puntos respecto al modelo base. Las caidas equivalen a unas 2,5 veces el error estandar, por lo que no son ruido, y los fallos no son de formato (todas las respuestas fallidas seguian siendo bloques de codigo Python bien formados).
- Sobreajuste al dominio: el modelo se especializa en sesiones multiturno de TypeScript con llamadas a herramientas sobre un unico monorepo. Su comportamiento fuera de ese dominio no esta caracterizado.
- Ausencia de metrica de exito real: no existe un benchmark agéntico ejecutable para pi-mono, de modo que la mejora in-domain solo se mide por perdida de evaluacion, no por tareas completadas correctamente.
- Benchmarks pequenos y de una sola muestra: 164 y 257 problemas con pass@1 voraz implican errores estandar de unos 3 puntos, por lo que diferencias inferiores a 5 puntos serian ruido. El cambio de protocolo en MBPP impide comparar con leaderboards.
- Aislamiento debil en la evaluacion: al no haber Docker en HF Jobs, el codigo generado se ejecuto en el contenedor del propio trabajo (`--sandbox local`).
- Riesgo de contaminacion: HumanEval y MBPP son publicos y pueden estar en los datos de preentrenamiento del modelo base; no se verifico solapamiento con las trazas de pi-mono.
- Evaluacion con el modo de razonamiento desactivado, pese a que parte de los datos de entrenamiento incluye trazas de razonamiento.
- Idiomas no declarados: se desconoce el soporte multilingue real de este ajuste.
- Licencia Gemma: el uso comercial queda sujeto a los terminos de uso de Gemma y a su politica de usos prohibidos; conviene revisarlos antes de desplegar en produccion.
- Madurez nula: 0 descargas, 0 likes y publicacion reciente, sin validacion independiente por parte de la comunidad.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor; al ser un ajuste sobre trazas de un agente de codigo, puede generar llamadas a herramientas plausibles pero incorrectas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sriharsha4444/gemma-4-E2B-it-pi-mono-sft
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo base alternativo en HuggingFace: https://huggingface.co/google/gemma-4-E2B
- Dataset original: https://huggingface.co/datasets/badlogicgames/pi-mono
- Dataset procesado: https://huggingface.co/datasets/sriharsha4444/pi-mono-gemma4-sft
- Adaptador seleccionado r64-lr3e-4: https://huggingface.co/sriharsha4444/gemma-4-E2B-it-pi-mono-r64-lr3e-4
- Adaptador r16-lr3e-4: https://huggingface.co/sriharsha4444/gemma-4-E2B-it-pi-mono-r16-lr3e-4
- Adaptador r64-lr1e-4: https://huggingface.co/sriharsha4444/gemma-4-E2B-it-pi-mono-r64-lr1e-4
- Adaptador r16-lr1e-4: https://huggingface.co/sriharsha4444/gemma-4-E2B-it-pi-mono-r16-lr1e-4
- Modelo de prueba de humo: https://huggingface.co/sriharsha4444/gemma-4-E2B-it-pi-mono-smoke
- Registros de evaluacion: https://huggingface.co/sriharsha4444/gemma-4-E2B-it-pi-mono-sft/tree/main/eval_results
- Panel de metricas Trackio: https://huggingface.co/spaces/sriharsha4444/trackio
- Bucket de metricas en bruto: https://huggingface.co/buckets/sriharsha4444/trackio-bucket
- Trabajo de entrenamiento del run seleccionado: https://huggingface.co/jobs/sriharsha4444/6abbf9b2031314b69634168a
- Repositorio del agente pi: https://github.com/badlogic/pi-mono
- Tareas de evaluacion Inspect: https://github.com/UKGovernmentBEIS/inspect_evals
- Pagina oficial de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Analisis externo de Gemma 4 E2B en Raspberry Pi: https://dev.to/alanwest/gemma-4-runs-on-a-raspberry-pi-i-tested-it-56c5
- Ficha externa de Gemma 4 E2B: https://gemma4.dev/models/gemma-4-e2b
