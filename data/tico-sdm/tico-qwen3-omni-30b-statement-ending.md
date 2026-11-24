# TiCo-sdm/TiCo-Qwen3-Omni-30B-Statement-Ending

## Resumen

TiCo-Qwen3-Omni-30B-Statement-Ending es un adaptador LoRA (rango 8) sobre el modelo multimodal Qwen3-Omni-30B-A3B-Instruct de Alibaba Qwen, desarrollado por el proyecto TiCo-sdm. Su proposito es controlar la duracion de las respuestas habladas en dialogos de voz, forzando ademas que la respuesta termine siempre en una frase completa (statement ending) en lugar de una pregunta o una invitacion a continuar la conversacion. El adaptador se entrena exclusivamente sobre la parte del modelo que genera texto; el generador de voz y el codificador de audio permanecen congelados.

La relevancia de este modelo radica en el control fino de la duracion en asistentes de voz: los objetivos de duracion se extienden de 5 a 80 segundos, y el modelo reporta un 99,2% de respuestas que acaban en frase completa frente al 93,0% del adaptador TiCo base. El error de duracion medido con TiCo-Bench (MAPE) es del 17,7%. Al ser un adaptador PEFT sobre un backbone de 30B con arquitectura MoE (3B activos), el coste de almacenamiento es de unos 5,1 GB y requiere fusion con el modelo base para su despliegue.

El entrenamiento se realizo en dos etapas: una SFT inicial (checkpoint 625) seguida de GRPO combinado con CHORD, con recompensas sobre los marcadores temporales del habla (Spoken Time Markers). El checkpoint publicado corresponde al paso 600 de la segunda etapa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 8) sobre transformer multimodal MoE Qwen3-Omni-30B-A3B-Instruct |
| Parametros totales | 30B (modelo base); adaptador LoRA de rango 8 (tamano del repo 5,1 GB) |
| Parametros activos | 3B (modelo base, arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-Omni-30B-A3B-Instruct, un modelo multimodal con mezcla de expertos (30B totales, 3B activos) que combina comprension de texto, audio y vision con generacion de voz. TiCo entrena unicamente una LoRA de rango 8 sobre la parte generadora de texto; el speech generator y el audio encoder estan congelados, de modo que el adaptador aprende a planificar la duracion de la respuesta mediante marcadores temporales en el texto generado, que posteriormente guian la sintesis de voz.

El proceso consta de dos etapas: primero una SFT sobre el checkpoint TiCo-Qwen3-Omni-30B-Statement-Ending-Stage1-SFT (paso 625) y despues una etapa de GRPO combinada con CHORD, con funciones de recompensa calculadas sobre los Spoken Time Markers y objetivos de duracion de 5 a 80 segundos. El checkpoint publicado es el paso 600 de la segunda etapa; el repositorio incluye tambien los pasos 375 y 750. La generacion de voz requiere aplicar el parche de eliminacion de marcadores del repositorio de codigo de TiCo (`patches/install_patch.sh`); sin el, el modelo pronuncia en voz alta sus marcadores temporales.

## Capacidades

- Dialogo hablado conversacional con control explicito de duracion de la respuesta (objetivos de 5 a 80 segundos).
- Terminacion de la respuesta en frase completa: no formula preguntas ni invita a un seguimiento.
- Generacion de voz a partir de texto con marcadores temporales (Spoken Time Markers) para planificar la duracion.
- Capacidades multimodales heredadas del backbone Qwen3-Omni-30B-A3B-Instruct (texto, audio y vision), aunque el adaptador solo modifica la rama de generacion de texto.
- Alineacion con un system prompt especifico de asistente de voz, entrenado de forma explicita.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la informacion disponible.

## Casos de uso

- Asistentes de voz con respuestas de duracion controlada: el modelo permite fijar objetivos entre 5 y 80 segundos, util para ajustar la extension de las respuestas a interfaces de solo audio donde el usuario no puede releer.
- Turnos de dialogo con cierre garantizado: al terminar siempre en frase completa y no formular preguntas, encaja en flujos donde el asistente debe devolver el turno al usuario sin inducir una respuesta adicional.
- Sistemas de atencion al cliente por voz: la duracion acotada y el cierre en statement permiten respuestas predecibles en IVR y call centers automatizados.
- Locuciones y avisos pregrabados generados dinamicamente: la planificacion temporal permite generar mensajes hablados de duracion objetivo concreta para anuncios, notificaciones o contenido de audio.
- Evaluacion de control temporal en TTS: sirve como referencia para investigar la prediccion de duracion en sintesis de voz mediante TiCo-Bench y sus metricas MAPE.
- Investigacion en RL para dialogo hablado: el pipeline GRPO + CHORD con recompensas sobre marcadores temporales es reutilizable para experimentos de alineacion en modelos de voz.
- Prototipado de agentes conversacionales multimodales: al heredar las capacidades del backbone Qwen3-Omni, puede emplearse en demos que combinen entrada de audio y vision con salida hablada de duracion controlada.

## Benchmarks y rendimiento

| Metrica | TiCo-Qwen3-Omni-30B-Statement-Ending | TiCo-Qwen3-Omni-30B |
|---|---|---|
| Respuestas que terminan en frase completa | 99,2% | 93,0% |
| Error de duracion TiCo-Bench (MAPE) | 17,7% | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del backbone Qwen3-Omni-30B-A3B-Instruct (30B parametros totales, 3B activos) y de la cuantizacion empleada.
- El adaptador LoRA por si solo ocupa 5,1 GB en disco; debe fusionarse con el modelo base antes del despliegue.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: fusion mediante `swift export --merge_lora true` y generacion con vllm-omni; requiere el parche `patches/install_patch.sh` del repositorio TiCo para eliminar los marcadores temporales de la salida hablada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TiCo-Qwen3-Omni-30B-Statement-Ending | 30B (3B activos) + LoRA r8 | no disponible | 99,2% statement ending; MAPE 17,7% | no disponible | Hugging Face (PEFT) |
| TiCo-Qwen3-Omni-30B | 30B (3B activos) + LoRA | no disponible | 93,0% statement ending | no disponible | Hugging Face |
| Qwen3-Omni-30B-A3B-Instruct | 30B (3B activos) | no disponible | no disponible | no disponible | Hugging Face (modelo base) |

No se dispone de datos de otros adaptadores de control de duracion comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador solo modifica la rama de generacion de texto; no altera el codificador de audio ni el generador de voz, por lo que las limitaciones del backbone en esos modulos persisten.
- Requiere el system prompt de entrenamiento exacto para un comportamiento alineado; fuera de ese prompt el cierre en statement y el control de duracion pueden degradarse.
- Sin el parche de eliminacion de marcadores, el modelo pronuncia en voz alta los marcadores temporales, lo que invalida su uso en produccion.
- El error de duracion (MAPE 17,7%) implica desviaciones significativas respecto al objetivo, especialmente relevante en objetivos largos de hasta 80 segundos.
- Licencia no disponible: no puede confirmarse el uso comercial ni las restricciones de redistribucion; debe verificarse la licencia del modelo base Qwen3-Omni-30B-A3B-Instruct y del adaptador antes de desplegar.
- Idiomas soportados no documentados; el comportamiento multilingue depende del backbone y no esta validado para este adaptador.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible, aunque persiste el riesgo inherente del modelo base.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validacion por parte de la comunidad ni de mantenimiento a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/TiCo-sdm/TiCo-Qwen3-Omni-30B-Statement-Ending
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Checkpoint SFT de la etapa 1: https://huggingface.co/TiCo-sdm/TiCo-Qwen3-Omni-30B-Statement-Ending-Stage1-SFT (referenciado en la model card)
- Repositorio de codigo TiCo (parche `patches/install_patch.sh`): no disponible como enlace directo en la informacion proporcionada
