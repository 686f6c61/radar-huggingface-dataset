# zack-r-s/hackring-LFM2.5-230M

## Resumen

Hackring LFM2.5-230M es un ajuste fino de pesos completos (merged full-weight) del modelo base LiquidAI/LFM2.5-230M, publicado por el usuario zack-r-s. El checkpoint transforma una peticion de centrado de orbita formulada por un operador en una llamada a la herramienta `orbit_correct(plane, effort)`, donde `plane` puede ser X, Y o ambos y `effort` puede ser gentle, balanced o aggressive. El modelo no calcula los valores de kick: esa parte la resuelve una skill determinista de minimos cuadrados acotados sobre un anillo PyAT simulado de 24 PV, que lee el estado, calcula los ajustes de correctores con la matriz de respuesta versionada, los escribe y mide el estado posterior.

El modelo tiene 229.693.184 parametros (aproximadamente 230M), se distribuye en formato safetensors para `transformers` y esta pensado para despliegues con vLLM usando el parser de tool calls `lfm2`. Su relevancia es acotada pero concreta: es un ejemplo de enrutado de intenciones hacia herramientas en un dominio de control de aceleradores, con evaluacion medida sobre el simulador y comparacion directa contra el modelo base.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de HuggingFace. No hay informacion publicada sobre longitud de contexto, cuantizaciones soportadas, idiomas o benchmarks generales (MMLU, HumanEval, GSM8K), por lo que esos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada (modelo derivado de la familia LFM2.5 de Liquid AI) |
| Parametros totales | 229.693.184 (aproximadamente 230M) |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la model card; el checkpoint se publica en safetensors de precision completa |
| Idiomas soportados | No disponible |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`), incluida en el fichero `LICENSE` del repositorio |
| Formato de pesos | safetensors, libreria `transformers` |

Otros datos del repositorio: tamano del repo 1.4 GB, pipeline `text-generation`, creado el 2026-10-18, actualizado el 2026-10-18, 0 descargas y 0 likes. La rama `main` sirve el checkpoint v004; las etiquetas `v002`, `v003` y `v004` conservan sus respectivos checkpoints.

## Arquitectura y entrenamiento

No se detalla en la informacion disponible la arquitectura interna del modelo base LFM2.5-230M (tipo de bloque, atencion, capas, contexto nativo). Lo que si se documenta es el proceso de ajuste: se parte de LiquidAI/LFM2.5-230M y se entrena un LoRA de rango 8 con SFT solo sobre turnos de asistente (assistant-only SFT), durante dos epocas y 108 pasos de optimizador, ejecutado en Apple M4 Pro con backend MPS. Los pesos resultantes se fusionan en un checkpoint de pesos completos. La perdida de validacion registrada fue 0.0381 en la primera medicion y 0.0315 posteriormente.

Los datos de entrenamiento proceden del dataset `zack-r-s/hackring-pyat-control` en su version v004, con 432 conversaciones de entrenamiento, 72 de validacion y 72 de prueba, generadas a partir de perturbaciones locales de PyAT con semillas disjuntas respecto a las anteriores. No se utilizo anotacion con GPT. El cambio respecto a los checkpoints v002 y v003 es conceptual: las versiones previas emitidas por el modelo escribian setpoints numericos de PV (`channel_write`), mientras que v004 produce una llamada a `orbit_correct` con plano y esfuerzo cualitativos; un arnes de operador normaliza un esfuerzo no especificado a `balanced` y rechaza un esfuerzo explicito erroneo o un plano incorrecto antes de escribir. No se modifico la configuracion de Osprey ni de la red (lattice) en esta iteracion. Los ficheros `training_job.yaml`, `dataset_manifest.json` y `training_results.json` recogen la configuracion y los hashes.

## Capacidades

- Generacion de texto conversacional orientada a peticiones de correccion de orbita en el dominio del anillo PyAT simulado.
- Tool calling: emite llamadas estructuradas a la herramienta `orbit_correct(plane, effort)`; requiere el parser `lfm2` en vLLM (`--tool-call-parser lfm2 --enable-auto-tool-choice`).
- Clasificacion de plano de correccion (X, Y o ambos): 28/28 en el conjunto de evaluacion local de 28 peticiones y 72/72 en el split de prueba v004.
- Clasificacion de esfuerzo (gentle, balanced, aggressive): 67/72 de acierto exacto plano+esfuerzo en el split de prueba v004, con 5 fallos exclusivamente de esfuerzo.
- Integracion con una skill determinista externa de minimos cuadrados acotados que resuelve la parte numerica (matriz de respuesta, escritura de correctores, medida posterior); el modelo en si no calcula kicks.
- Capacidad de rechazo indirecto mediante guardas: el arnes en produccion rechaza peticiones con esfuerzo explicito incorrecto antes de cualquier escritura.
- Capacidades multilingues: no disponibles.
- Vision, audio, modo thinking o razonamiento multi-paso extenso: no documentadas en la informacion proporcionada.

## Casos de uso

- Enrutado de intenciones en control de aceleradores: el modelo recibe la peticion en lenguaje natural del operador y la convierte en `orbit_correct(plane, effort)`; la skill determinista aplica la correccion sobre el anillo PyAT de 24 PV y mide el resultado. Es adecuado porque separa la interpretacion del operador del calculo numerico verificado.
- Prototipado de agentes de control con vLLM: sirve como componente de tool calling en un agente mas amplio, con el parser `lfm2` habilitado, para probar el bucle completo de intencion, llamada, ejecucion y verificacion antes de llevar el pipeline a un entorno real.
- Formacion de operadores sobre simulador: al responder en terminos de plano y agresividad en lugar de setpoints numericos, el modelo encaja en sesiones de entrenamiento donde el operador practica la formulacion de peticiones de centrado sin riesgo sobre la maquina.
- Pruebas de regresion de guardas de seguridad: el checkpoint permite reproducir casos en los que un esfuerzo explicito erroneo debe ser rechazado por el arnes sin escritura, util para validar la capa de proteccion antes de desplegar cambios.
- Evaluacion comparativa de ajustes finos pequenos: con 230M de parametros y un conjunto de evaluacion congelado de 28 peticiones, sirve como referencia para medir mejoras de enrutado frente al modelo base (0/28 frente a 12/28 en acierto bruto de plano y esfuerzo seguido de mejora de RMS).
- Despliegue en hardware modesto o en el borde: el tamano de 230M permite ejecutar el modelo en CPU o en GPU de consumo dentro de un banco de pruebas de laboratorio, con la skill numerica como servicio aparte.
- Generacion de datos sinteticos de control: el modelo puede utilizarse para producir variantes de formulacion de peticiones de centrado que alimenten conjuntos de prueba, dado que el dataset original tambien es sintetico y derivado de simulacion.

## Benchmarks y rendimiento

Unica evaluacion publicada, sobre un evaluador local de PyAT con 28 peticiones de correccion congeladas antes del entrenamiento v004, semillas y redacciones no vistas, sin forzar prefijo de tool call. El solver y la planta son identicos para el modelo base y para v004.

| Medicion | Base 230M | v004 |
| --- | ---: | ---: |
| Plano y esfuerzo correctos, seguidos de mejora de RMS medida | 0/28 | 12/28 |
| Seleccion correcta de plano | 14/28 | 28/28 |
| Mejora medida tras aplicar la regla viva de esfuerzo por defecto (`balanced`) a las llamadas guardadas | 14/28 | 28/28 |

En el split de prueba v004, con semillas distintas, la seleccion exacta de plano y esfuerzo paso 67/72 y la seleccion de plano 72/72; los cinco fallos fueron misclasificaciones de esfuerzo. El resultado 28/28 corresponde a enrutado del modelo mas normalizacion determinista de esfuerzo y control numerico: 16 llamadas de v004 necesitaron la normalizacion a `balanced`. La eleccion de esfuerzo del modelo sigue siendo poco fiable con redacciones desconocidas sin preferencia explicita. No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no publicada por el autor. Como referencia aritmetica a partir de los 229,7M de parametros, los pesos en FP16 ocupan aproximadamente 0,46 GB, en INT8 aproximadamente 0,23 GB y en una cuantizacion de 4 bits aproximadamente 0,12 GB, antes de overhead de runtime y cache KV.
- GPU recomendadas: no especificadas. El entrenamiento se ejecuto en Apple M4 Pro con MPS. Por tamano, el modelo cabe en cualquier GPU de consumo con 2 GB o mas de VRAM en FP16, y en CPU para inferencia por lotes pequenos.
- Cabe en GPU de consumo: si, por el tamano del checkpoint; no hay mediciones publicadas de latencia ni throughput en esas GPU.
- Opciones de despliegue: vLLM, con el comando documentado `vllm serve zack-r-s/hackring-LFM2.5-230M --revision v004 --served-model-name LFM2.5-230M --enable-auto-tool-choice --tool-call-parser lfm2 --host 127.0.0.1 --port 8000`. El parser `lfm2` es obligatorio. El resto de runtimes (llama.cpp, Ollama, TGI) no se mencionan en la informacion disponible.
- Latencia y throughput: no disponibles. El checkpoint por si solo no proporciona control del acelerador; requiere el agente de chat de Hackring que aporta la implementacion de la skill y verifica la intencion del operador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en la tarea | Licencia | Disponibilidad |
| --- | --- | --- | --- | --- | --- |
| zack-r-s/hackring-LFM2.5-230M (v004) | 229,7M | no disponible | 12/28 plano+esfuerzo con mejora de RMS; 28/28 plano; 67/72 exacto en test | LFM Open License v1.0 | HuggingFace, revisiones v002, v003 y v004 |
| LiquidAI/LFM2.5-230M (base) | 229,7M | no disponible | 0/28 plano+esfuerzo con mejora de RMS; 14/28 plano | LFM Open License v1.0 | HuggingFace |
| Otros modelos pequenos de proposito general (por ejemplo, familias de 0,3B a 0,5B) | no disponible | no disponible | no disponible; sin evaluacion en esta tarea | no disponible | no disponible |

No se dispone de datos verificables de benchmarks generales ni de evaluaciones en dominios de control para modelos alternativos en la informacion proporcionada, por lo que la comparativa se limita al modelo base, que comparte tokenizador, arquitectura y licencia.

## Limitaciones y advertencias

- Los resultados son sobre planta simulada (PyAT). No establecen capacidad de optica inversa solo con el modelo, ni rendimiento en peticiones de informe de BPM o de escritura exacta, ni una puntuacion end-to-end sobre Osprey/EPICS en vivo, ni generalizacion a un acelerador real.
- El modelo no calcula valores de kick; sin la skill determinista y el arnes de operador no hay control del acelerador.
- La eleccion de esfuerzo es poco fiable con redacciones desconocidas sin preferencia explicita: 16 de las 28 llamadas de la evaluacion necesitaron normalizacion a `balanced`, y 5 de 72 fallos en test fueron errores de esfuerzo.
- Riesgo de alucinacion en los argumentos de la tool call (plano o esfuerzo incorrectos) si se usa sin las guardas que rechazan esfuerzos explicitos erroneos antes de escribir.
- Sesgos conocidos: no documentados. El dataset es sintetico y derivado de perturbaciones locales de PyAT con semillas disjuntas, sin anotacion con GPT; no se describe su diversidad linguistica.
- Cobertura idiomatica no documentada; la evaluacion se realizo con redacciones de operador en el conjunto local, sin especificar idiomas.
- Licencia LFM Open License v1.0: uso y redistribucion sujetos a sus terminos; es una licencia `other`, no una licencia permisiva tipo Apache-2.0 o MIT, por lo que conviene revisar las condiciones de uso comercial antes de produccion.
- Longitud de contexto no publicada: no se puede asumir una ventana concreta para conversaciones multi-turno largas.
- El repositorio incluye varias revisiones (v002, v003, v004) con comportamiento distinto; desplegar `main` sin fijar `--revision v004` puede servir un checkpoint diferente al evaluado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zack-r-s/hackring-LFM2.5-230M
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M
- Dataset de entrenamiento (version v004): https://huggingface.co/datasets/zack-r-s/hackring-pyat-control/tree/v004
- Repositorio de entrenamiento y evaluaciones (rama zrs-lfm-training): https://github.com/zack-r-s/nvidia-redhat-small-models/blob/zrs-lfm-training/training/README.md
- Trazas completas de evaluacion: directorio `evals/pyat-v004/` del repositorio anterior
- Ficheros de evaluacion citados en la model card: `pyat_eval_report.json`, `pyat_eval_comparison.json`, `pyat_eval_default_replay.json`, `pyat_test_report.json`
