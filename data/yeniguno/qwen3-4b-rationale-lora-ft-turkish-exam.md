# yeniguno/qwen3-4b-rationale-lora-ft-turkish-exam

## Resumen

El modelo `yeniguno/qwen3-4b-rationale-lora-ft-turkish-exam` es un adaptador LoRA (PEFT) entrenado sobre el modelo base `Qwen/Qwen3-4B`. Lo desarrolla el usuario de HuggingFace yeniguno y esta especializado en la resolucion de preguntas de opcion multiple de examenes universitarios turcos (tipo examen de acceso a la universidad). Su rasgo distintivo es que genera primero un razonamiento explicito (una cadena de pensamiento) y termina la respuesta con el formato fijo `"Final answer: X"`, lo que facilita el parseo automatico de la opcion elegida.

La relevancia de este adaptador radica en que aplica destilacion de racionales (*rationale distillation*): el ajuste se ha realizado a partir de los razonamientos de un modelo profesor, de modo que el estudiante aprende no solo la respuesta correcta sino el proceso que lleva a ella. Esto lo hace util como componente de sistemas de evaluacion automatica, tutoria o generacion de explicaciones pedagogicas en turco, un idioma con relativamente pocos recursos de este tipo.

Al tratarse de un adaptador y no de un modelo completo, hereda las caracteristicas del Qwen3-4B subyacente: un transformer decoder-only denso de aproximadamente 4.000 millones de parametros, con modo *thinking* activable y ventana de contexto nativa de 32.768 tokens. El repositorio es muy pequeno (0,1 GB) porque solo contiene los pesos del adaptador, no los del modelo base. La licencia no esta declarada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (base Qwen3-4B) con adaptador LoRA (PEFT) |
| Parametros totales | Adaptador LoRA: no disponible; modelo base Qwen3-4B: ~4.000 millones |
| Parametros activos | No aplica (no es arquitectura MoE) |
| Longitud de contexto | No declarada en la model card; el modelo base Qwen3-4B soporta 32.768 tokens nativos (ampliable a 131.072 con YaRN) |
| Tipos de cuantizacion | Adaptador en precision completa (safetensors); el modelo base admite cuantizaciones GGUF, AWQ y GPTQ |
| Idiomas soportados | Turco (tr) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se monta sobre `Qwen/Qwen3-4B` (revision fijada `1cfa9a7208912126459214e8b04321603b3df60c`), un transformer decoder-only denso con atencion por consultas agrupadas (GQA), normalizacion QK-Norm, activacion SwiGLU y RoPE. Al ser un LoRA, el entrenamiento congela los pesos del modelo base y aprende matrices de bajo rango que se aplican sobre determinadas capas; el resultado se carga mediante `PeftModel.from_pretrained` junto al modelo base.

El entrenamiento combina preguntas de opcion multiple del examen de acceso a la universidad turco con racionales generados por un modelo profesor (*rationale distillation*). El objetivo es que el modelo produzca una cadena de razonamiento antes de emitir la respuesta final en el formato `"Final answer: X"`. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas adicionales como RLHF o DPO; esa informacion no esta disponible. La generacion de ejemplo incluida activa el modo *thinking* del modelo base (`enable_thinking=True`) y usa muestreo con temperatura 0,6, top_p 0,95 y top_k 20, con hasta 8.192 tokens nuevos.

## Capacidades

- Generacion de texto conversacional en turco, con salida estructurada que termina en `"Final answer: X"`.
- Razonamiento paso a paso explicito (modo *thinking*) antes de responder.
- Resolucion de preguntas de opcion multiple con cinco alternativas (A-E) del tipo usado en examenes de acceso universitario turcos.
- Razonamiento aritmetico y verbal sencillo, como se observa en el ejemplo de la model card (calculo de un precio antes de un descuento del 20 %).
- Distincion y formateo de la respuesta final, lo que permite extraer automaticamente la opcion elegida.
- Capacidad multilingue limitada al turco en el ajuste; el modelo base Qwen3-4B es multilingue, pero el adaptador esta especializado en turco.
- No se declara soporte explicito de *tool calling*, *function calling* ni flujos de agentes multi-paso en la informacion disponible.

## Casos de uso

- Correccion automatica de examenes de opcion multiple: el modelo genera el razonamiento y cierra con `"Final answer: X"`, lo que permite extraer la opcion elegida mediante una expresion regular fiable, reduciendo el coste frente a la correccion manual.
- Tutoria educativa en turco: al mostrar la cadena de razonamiento, el sistema puede explicar al estudiante por que una opcion es correcta y no solo indicar la respuesta.
- Generacion de material de estudio: a partir de un enunciado, el modelo produce una resolucion comentada que puede reutilizarse como solucionario.
- Evaluacion de calidad de preguntas: comparar el razonamiento del modelo con la solucion oficial ayuda a detectar enunciados ambiguos o mal formulados en bancos de preguntas.
- Investigacion sobre destilacion de racionales: sirve como caso de estudio de como un LoRA pequeno replica el estilo de razonamiento de un modelo profesor en un dominio concreto.
- Prototipado rapido de asistentes de examen: al ocupar solo 0,1 GB el adaptador, es facil de integrar en entornos de investigacion con recursos limitados y de versionar junto al modelo base.
- Analisis de errores por materia: ejecutando el modelo sobre lotes de preguntas de matematicas, turco o ciencias, se pueden medir tasas de acierto por area para orientar el repaso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador ocupa 0,1 GB, pero requiere cargar el modelo base Qwen3-4B. En FP16 el conjunto ronda los 8-9 GB de VRAM; en cuantizacion de 8 bits aproximadamente 4-5 GB, y en 4 bits alrededor de 2,5-3,5 GB.
- GPU recomendadas: NVIDIA A100, H100 o L40S para despliegues con contexto largo o lotes grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para uso comodo en FP16.
- GPU de consumo: cabe en tarjetas con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070) si se cuantiza el modelo base. En 4-6 GB es viable con cuantizaciones agresivas en GGUF, con perdida de calidad.
- Opciones de despliegue: al ser un LoRA, se carga con `peft` y `transformers`; puede servirse con vLLM o TGI fusionando previamente el adaptador, o combinarse con llama.cpp/Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El ejemplo de la model card usa `max_new_tokens=8192`, lo que implica generaciones largas por el razonamiento previo y penaliza el throughput en comparacion con respuestas directas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en examenes turcos |
|---|---|---|---|---|---|
| yeniguno/qwen3-4b-rationale-lora-ft-turkish-exam (LoRA) | ~4.000 M (base) | 32.768 nativo (base) | No disponible | HuggingFace, PEFT | No disponible |
| Qwen/Qwen3-4B (modelo base) | ~4.000 M | 32.768 nativo, 131.072 con YaRN | Apache 2.0 | HuggingFace | No disponible |
| Qwen/Qwen3-1.7B | ~1.700 M | 32.768 nativo | Apache 2.0 | HuggingFace | No disponible |
| Llama 3.2 3B Instruct | ~3.000 M | 128.000 | Llama 3.2 Community | HuggingFace, Meta | No disponible |

No se dispone de datos de rendimiento comparativo en tareas de examen turco para ninguno de estos modelos en la informacion proporcionada; la comparacion se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La licencia no esta declarada, por lo que no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de usarlo en produccion.
- El adaptador esta especializado en turco y en preguntas de opcion multiple; su rendimiento fuera de ese dominio o idioma no esta documentado y probablemente sea pobre.
- Al depender de racionales destilados de un modelo profesor, puede reproducir errores o sesgos del profesor, especialmente en preguntas ambiguas o de materias con soluciones discutibles.
- Riesgo de alucinacion en el razonamiento: el modelo puede justificar de forma convincente una respuesta incorrecta, dado que la cadena de pensamiento no garantiza la correccion del resultado.
- El modo *thinking* con hasta 8.192 tokens nuevos aumenta el coste de inferencia y la latencia; en tareas simples puede ser desproporcionado.
- Al ser un LoRA, requiere cargar el modelo base, de modo que el consumo de recursos real es el del Qwen3-4B completo, no el del adaptador.
- El repositorio registra 0 descargas y 0 me gusta, lo que sugiere que no ha sido validado por la comunidad; no hay evaluaciones independientes de su calidad.
- No se documentan cuantizaciones especificas ni resultados de evaluacion (MMLU, HumanEval, GSM8K u otros), por lo que no se puede estimar su fiabilidad objetiva.
- La fecha de creacion y actualizacion indicada (2026-09-28) es posterior a la fecha habitual de publicacion de la familia Qwen3; conviene verificar la trazabilidad del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yeniguno/qwen3-4b-rationale-lora-ft-turkish-exam
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Biblioteca PEFT: https://github.com/huggingface/peft
