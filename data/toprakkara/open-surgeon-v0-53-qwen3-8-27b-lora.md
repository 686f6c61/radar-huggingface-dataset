# toprakkara/open-surgeon-v0.53-qwen3.8-27b-lora

## Resumen

Open Surgeon v0.53 es un adaptador LoRA de rango 16 sobre el modelo Qwen3.8-27B, desarrollado por Toprak Kara, que actúa como verificador de redlines en contratos comerciales. Dado un cambio registrado (tracked change) representado como una secuencia de operaciones `equal`, `delete` e `insert`, el modelo emite un razonamiento breve y concluye con `{"surgical":"yes"}` o `{"surgical":"no"}`: es decir, determina si un abogado cuidadoso enviaría ese redline tal cual está marcado o si, por el contrario, elimina y reescribe texto que no necesitaba modificarse. El modelo está entrenado exclusivamente en inglés y no constituye asesoramiento jurídico.

El adaptador es una replicación abierta de la primera etapa de entrenamiento descrita en la entrada de blog "How to Train your Surgeon" de Crosby, si bien no tiene afiliación, datos ni respaldo de Crosby. Su relevancia radica en que aborda una tarea muy concreta —la detección de redlines innecesariamente amplios— con un rendimiento medido de 85,9 % de balanced accuracy en un test de 289 redlines, superando a GPT-6 Astra con la misma instrucción (74,8 %).

El repositorio ocupa 0,5 GB y contiene únicamente los pesos del adaptador en safetensors, por lo que requiere descargar el modelo base Qwen3.8-27B (unos 60 GB en bfloat16) para su uso. La licencia del adaptador es Apache-2.0.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre transformer causal Qwen3.8-27B |
| Parametros totales | no disponible (adaptador LoRA; base Qwen3.8-27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.8-27B, un transformer causal de 27 000 millones de parámetros, mediante LoRA con rango 16, alpha 32 y dropout 0 sobre las proyecciones de atención y MLP. La tarea es de clasificación binaria con razonamiento: la entrada es una lista de operaciones de redline y la salida es un texto corto de razonamiento seguido de un objeto JSON con la etiqueta `surgical`. El entrenamiento se realizó con decodificación greedy, thinking desactivado y 512 tokens nuevos como límite.

Los datos de entrenamiento consisten en 812 trazas docentes (406 "yes" y 406 "no") procedentes de los folds de entrenamiento del dataset `toprakkara/open-surgeon-redlines-v0.53`. Se empleó rejection sampling: un modelo docente (Claude Sonnet) respondió a cada ítem sin ver su etiqueta y solo se conservaron las respuestas con el veredicto correcto; después se ajustó el estudiante para reproducir el razonamiento y el veredicto aceptados. No se compartió cláusula ni redline entre entrenamiento y test. Solo se realizó la primera etapa (supervised fine-tuning); la segunda etapa con GRPO descrita en el post original no se llevó a cabo, y se usaron dos épocas de ajuste frente a una del post de referencia.

## Capacidades

- Verificación de redlines: clasifica un tracked change como "quirúrgico" (yes) o innecesariamente amplio (no) a partir de la lista de operaciones `equal`/`delete`/`insert`.
- Generación de razonamiento breve antes del veredicto, en formato JSON final (`{"surgical":"yes"}` o `{"surgical":"no"}`).
- Procesamiento de operaciones de tracked changes con índices y texto por operación.
- Especialización en cláusulas de contratos comerciales en inglés.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No se documentan capacidades de agentes, multi-step reasoning general, visión ni audio.
- No se documentan capacidades multilingües más allá del inglés.

## Casos de uso

- Filtro en pipelines de redacción contractual: el adaptador puede actuar como señal previa a la revisión humana para detectar redlines que borran y reescriben texto que no necesitaba cambio, reduciendo el volumen de markups que llegan al abogado.
- Control de calidad de herramientas de redline automático: integrado tras un agente que genera tracked changes, permite marcar automáticamente los cambios excesivamente amplios antes de enviarlos a la contraparte.
- Investigación sobre calidad de redlines: sirve como sistema de referencia reproducible para estudiar la diferencia entre markups de abogados y redlines generados por agentes.
- Señal de alerta en revisión de contratos: dado un cambio concreto, el modelo emite un veredicto y un razonamiento breve que un revisor humano puede usar como punto de partida, siempre bajo supervisión.
- Evaluación comparativa de agentes de redline: al medir balanced accuracy frente a un baseline heurístico y a modelos generales como GPT-6 Astra, permite comparar la calidad de distintos generadores de tracked changes.
- Docencia y formación jurídica: ilustra con ejemplos concretos qué se considera un cambio quirúrgico frente a uno innecesariamente amplio en cláusulas comerciales en inglés.

## Benchmarks y rendimiento

Test v0.53: 289 redlines (126 yes, 163 no) de 126 cláusulas reservadas de ContractBench. Balanced accuracy con ±1σ de bootstrap sobre párrafos fuente.

| Sistema | Balanced accuracy | Recall en yes | Recall en no |
|---|---:|---:|---:|
| Este adaptador | 85,9 % ± 2,3 | 84,1 % | 87,7 % |
| GPT-6 Astra, misma instrucción | 74,8 % ± 2,2 | 50,8 % | 98,8 % |
| Baseline heurístico | 66,6 % ± 2,6 | 89,7 % | 43,6 % |

Control preregistrado: Astra con ocho ejemplos resueltos del conjunto de entrenamiento añadidos a la instrucción obtiene 78,6 % ± 2,2; el adaptador sigue 7,4 puntos por delante en el 99,5 % de las extracciones pareadas. El adaptador supera a Astra en el 100 % de 2 000 extracciones bootstrap pareadas. Astra se ejecutó mediante Codex CLI sobre una suscripción de ChatGPT con esfuerzo de razonamiento medio.

## Requisitos de hardware

- El modelo base Qwen3.8-27B necesita aproximadamente 60 GB de VRAM en bfloat16, según la model card.
- GPU recomendadas: una H100 es suficiente para ejecutar el ejemplo y los ítems de test verificados por el autor; para bfloat16 se requiere una GPU con al menos 60 GB (H100 80 GB, A100 80 GB).
- En GPUs de consumo (RTX 4090 de 24 GB) no cabe el modelo base en bfloat16; sería necesaria cuantización del modelo base, cuyos detalles no se documentan.
- Opciones de despliegue: no se documentan explícitamente; al ser un adaptador PEFT sobre un transformer causal, es compatible con frameworks de inferencia que soporten PEFT, aunque la model card no confirma vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La medición se realizó con decodificación greedy, thinking desactivado y 512 tokens nuevos, en lotes de ocho durante la evaluación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Balanced accuracy (test v0.53) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Open Surgeon v0.53 (este) | LoRA sobre Qwen3.8-27B | Adaptador r=16 sobre 27B | no disponible | 85,9 % ± 2,3 | Apache-2.0 | Hugging Face |
| GPT-6 Astra (misma instrucción) | Modelo propietario | no disponible | no disponible | 74,8 % ± 2,2 | propietaria | API ChatGPT/Codex CLI |
| Baseline heurístico | Regla | no aplica | no aplica | 66,6 % ± 2,6 | no aplica | no aplica |
| Crosby (modelo original) | no disponible | no disponible | no disponible | no comparable (test privado de 500 redlines) | no disponible | no disponible |

## Limitaciones y advertencias

- No juzga si una edición es legalmente correcta, completa o aconsejable; no es asesoramiento jurídico y no sustituye la revisión de un abogado.
- Solo se ha medido en cláusulas de contratos comerciales en inglés de una única fuente; no debe usarse con otros idiomas, otros tipos de documento ni documentos largos.
- No debe reportarse su resultado en ContractBench: los datos de entrenamiento derivan de los redlines de referencia de ese benchmark.
- Ningún abogado revisó el test: "yes" es el markup del propio abogado y "no" es un redline de un agente de IA que reescribe al menos 40 caracteres y al menos una cuarta parte del texto que el abogado dejó intacto; solo se incluyen casos claros.
- El adaptador está en distribución: se entrenó con otras cláusulas de la misma fuente y con redlines de los mismos dos agentes; no se demuestra transferencia a otros contratos, estilos de redacción o agentes.
- No es comparable con las cifras del post de Crosby, que provienen de un test privado etiquetado por abogados con 500 redlines.
- Puede equivocarse en ambas direcciones: en el test rechaza alrededor del 16 % de los markups de abogados y acepta alrededor del 12 % de redlines innecesariamente amplios; su texto de razonamiento no se verifica en cuanto a fidelidad.
- Aprende un único estilo de "quirúrgico", el de los abogados de esta fuente y el del modelo docente; otras prácticas pueden marcar los cambios de forma distinta y razonable.
- Un solo entrenamiento y una sola medición; solo SFT, sin la segunda etapa GRPO del post original, y con dos épocas frente a una.

## Enlaces

- Hugging Face: https://huggingface.co/toprakkara/open-surgeon-v0.53-qwen3.8-27b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/toprakkara/open-surgeon-redlines-v0.53
- Código, datos y mediciones: https://github.com/toprakkara/open-surgeon
- Post de referencia de Crosby: https://crosby.ai/blog/how-to-train-your-surgeon
- ContractBench: https://huggingface.co/datasets/micro1-inc/ContractBench
- Perfil del autor en X: https://x.com/toprakkarra
