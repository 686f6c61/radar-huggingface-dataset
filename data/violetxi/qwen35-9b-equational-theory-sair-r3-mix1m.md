# violetxi/qwen35-9b-equational-theory-sair-r3-mix1m

## Resumen

violetxi/qwen35-9b-equational-theory-sair-r3-mix1m es un ajuste fino supervisado (SFT) de modelo completo sobre Qwen/Qwen3.5-9B, orientado a teoría ecuacional (equational theory) y a tareas de razonamiento matemático formal dentro del marco de evaluación SAIR. Lo publica el usuario violetxi como checkpoint final de la epoch 2 de un entrenamiento con 8 GPUs GH200, y se distribuye como modelo BF16 completo en safetensors fragmentados, en el layout nativo `Qwen3_5ForConditionalGeneration`, con tokenizer, plantilla de chat y ficheros de processor incluidos. No requiere descargar el modelo base ni fusionar adaptadores.

El interés del modelo es doble. Por un lado, es un ejemplo de fine-tune de investigación sobre una arquitectura Qwen3.5 con 9.653.104.368 parámetros y soporte multimodal heredado del base (la etiqueta `image-text-to-text` aparece en el repo). Por otro, forma parte de un esfuerzo por construir modelos que operen sobre enunciados y pruebas en Lean 4 y produzcan salidas en lenguaje natural, con un régimen de entrenamiento documentado de forma inusualmente detallada (mezcla anidada nominal de 1M de tokens, enmascarado de pérdida, packing sin padding).

La relevancia actual es metodológica más que de rendimiento: el autor todavía no ha publicado resultados finales de la evaluación SAIR, de modo que el modelo debe considerarse un artefacto de investigación reproducible y auditable, no un sistema con precisión de prueba verificada. Cualquier uso en producción debería asumir esa ausencia de validación externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido derivado de Qwen3.5 (`Qwen3_5ForConditionalGeneration`), con atencion completa, atencion lineal y convoluciones, mas torre de vision y modulo MTP heredados del modelo base |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | No aplica (modelo denso; no se declara configuracion MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos BF16 en safetensors (no se distribuyen GGUF, AWQ, GPTQ ni FP8) |
| Idiomas soportados | no disponible (no declarados en la model card ni en las etiquetas del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors fragmentados en BF16, layout nativo Qwen3.5; incluye configuracion, tokenizer, plantilla de chat y ficheros de processor |

Datos adicionales: tamano del repositorio 19,3 GB; revision del modelo base fijada (`c202236235762e1c871ad0ccb60c8ee5ba337b9a`); 427 tensores de lenguaje mapeados al layout nativo, incluida la cabeza de salida; pesos de vision y MTP heredados sin cambios.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B en una revision fijada y aplica un ajuste fino supervisado de modelo completo (no LoRA ni adaptadores). La model card describe que el packing sin padding aisla cada ejemplo en los tres mecanismos de mezcla de la arquitectura (atencion completa, atencion lineal y convolucion), lo que confirma que el backbone es un transformer hibrido con componentes de atencion lineal, en la linea de las arquitecturas orientadas a eficiencia de contexto. Los pesos de lenguaje entrenados en FP32 se convirtieron a BF16, y los modulos de vision y de prediccion multi-token (MTP) se heredan intactos del base.

El entrenamiento usa una mezcla anidada nominal de 1M de tokens: 699.261 tokens de notas y 300.166 tokens de respuestas del asistente por epoch tras el enmascarado de perdida, lo que supone aproximadamente un 70% de notas y un 30% de trayectorias. Se entrenaron dos epochs en ocho GPUs GH200 con learning rate 5e-6, scheduler coseno, warmup 0.03, perdida de entropia cruzada media sobre tokens supervisados y sin termino KL. Los prompts y las cabeceras del asistente estan enmascarados; las notas son texto plano; el pensamiento generado se excluye del calculo de perdida, mientras que las respuestas del asistente y los marcadores de plantilla y de fin si se supervisan, de modo que la plantilla de trayectoria incluye un envoltorio de thinking vacio. Se aplicaron exclusiones por repeticion y se mantuvo una validacion congelada, sin filtro de correccion ni rechazo general de respuestas truncadas por longitud.

## Capacidades

- Generacion de texto conversacional y de razonamiento matematico orientado a teoria ecuacional, con soporte de modo thinking (`enable_thinking=True` en la plantilla de chat).
- Produccion de pruebas y contraejemplos en lenguaje natural a partir de entradas en Lean (escenario Stage 2 de SAIR).
- Generacion y explicacion de notas tecnicas sobre teoria ecuacional, propiedad para la que el modelo fue entrenado de forma explicita.
- Ajuste a plantillas de trayectoria de un solo turno con envoltorio de thinking, tal como se definen en el corpus de entrenamiento.
- Capacidades multimodales heredadas del modelo base (la etiqueta `image-text-to-text` esta presente en el repositorio), aunque no se documenta ningun ajuste sobre los pesos de vision.
- Prediccion multi-token (MTP) heredada del base, util para decodificacion especulativa si la pila de inferencia la aprovecha.
- Uso mediante `transformers` (verificado con la version 5.13.0) y `vLLM` (verificado con la version 0.19.1, con `--reasoning-parser qwen3`).
- Soporte de tool calling / function calling: no documentado especificamente para este fine-tune.
- Soporte de agentes y razonamiento multi-paso: no documentado; el corpus de entrenamiento se describe como trayectorias condicionadas por notas de un solo turno.
- Capacidades multilingues: no documentadas.

## Casos de uso

- Asistente de investigacion en algebra universal: el modelo puede responder consultas sobre propiedades ecuacionales (asociatividad, conmutatividad, distributividad) y explicar por que una implicacion no se cumple, que es exactamente el ejemplo incluido en la model card.
- Generacion de pruebas en lenguaje natural desde enunciados formales: en el escenario Stage 2 de SAIR la entrada es codigo Lean y la salida esperada es una prueba o un contraejemplo redactado, tarea para la que este checkpoint fue entrenado de forma directa.
- Construccion de contraejemplos: para refutar una ecuacion o una implicacion entre identidades, el modelo puede proponer estructuras algebraicas concretas, un paso critico antes de intentar una prueba formal.
- Tutorizacion de estudiantes de logica y algebra: las respuestas con modo thinking permiten mostrar el razonamiento paso a paso antes de la conclusion, con contexto de conversacion gestionado mediante la plantilla de chat incluida en el repositorio.
- Anotacion y enriquecimiento de corpus matematicos: el modelo puede redactar notas de lectura o resumenes tecnicos en texto plano, formato con el que se entreno la porcion mayoritaria de la mezcla (699.261 tokens de notas por epoch).
- Base para bucles de RL o verificacion asistida: dado que el checkpoint es un modelo completo en layout nativo y sin adaptadores, sirve como punto de partida para RLHF, DPO o entrenamiento con recompensa basada en verificador Lean.
- Servicio de inferencia con razonamiento separado: con `vllm serve ... --reasoning-parser qwen3` se puede desplegar el modelo y separar la traza de pensamiento de la respuesta final, util en interfaces de depuracion de pruebas.
- Filtrado previo en pipelines de formalizacion: usar el modelo para descartar enunciados triviales o mal formados antes de enviarlos a un demostrador automatico, reduciendo coste de computo en fases posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica que la evaluacion SAIR esta en marcha: 800 preguntas de Stage 1 y 300 de Stage 2, con cuatro respuestas por pregunta generadas con semillas independientes. Stage 2 usa entrada en Lean y salida en lenguaje natural (prueba o contraejemplo), evaluada por GPT-5.6-sol en configuracion `high`. El autor senala explicitamente que no hay todavia ningun resultado final de rendimiento matematico, que la entropia cruzada de entrenamiento y validacion no es una puntuacion de precision de prueba, y que los juicios de GPT no constituyen certificacion en Lean.

| Evaluacion | Estado | Detalle |
|---|---|---|
| SAIR Stage 1 | En curso, sin resultados publicados | 800 preguntas, 4 respuestas por pregunta |
| SAIR Stage 2 | En curso, sin resultados publicados | 300 preguntas, entrada Lean, salida en lenguaje natural, juez GPT-5.6-sol (`high`) |
| MMLU, HumanEval, GSM8K u otros | no disponible | No reportados en la informacion proporcionada |

## Requisitos de hardware

- VRAM para inferencia en BF16: aproximadamente 19,3 GB solo para pesos, mas la cache KV; en la practica se necesitan del orden de 22-26 GB segun la longitud de contexto y el tamano de lote.
- VRAM en cuantizacion: no disponible para este repositorio, que solo publica BF16. Una conversion a INT8 quedaria en torno a 10-11 GB y a INT4 en torno a 5-6 GB, pero no hay ficheros de ese tipo publicados ni confirmacion de soporte de la arquitectura `qwen3_5` en todas las herramientas de cuantizacion.
- GPU de datacenter: A100 (40 o 80 GB), H100 y GH200 son adecuadas; el propio entrenamiento se hizo en ocho GH200.
- GPU de gama profesional: L40S (48 GB) o RTX 6000 Ada (48 GB) permiten BF16 sin recurrir a cuantizacion.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) quedan al limite en BF16, con contexto reducido y posible offload; con cuantizacion de 8 o 4 bits serian viables.
- Opciones de despliegue: `transformers` 5.13.0 (verificado) y `vLLM` 0.19.1 (verificado, con `--dtype bfloat16 --reasoning-parser qwen3`). El soporte en TGI, llama.cpp, Ollama u otras pilas no esta confirmado para esta arquitectura.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay datos de benchmarks publicados para este checkpoint, por lo que la comparacion se limita a caracteristicas verificables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-r3-mix1m | 9,65 B | no disponible | Sin resultados publicados (evaluacion SAIR en curso) | apache-2.0 | Pesos BF16 en HuggingFace; 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3.5-9B (modelo base) | 9,65 B | no disponible | No reportado en la informacion proporcionada para este fine-tune | apache-2.0 (heredada por el ajuste) | Ampliamente disponible en HuggingFace |
| Otros fine-tunes de razonamiento matematico de escala similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: el autor indica que la evaluacion SAIR aun no ha arrojado resultados finales. No debe atribuirse a este checkpoint ninguna capacidad de prueba demostrada.
- Riesgo de alucinacion en matematicas: el corpus de entrenamiento no aplico filtro de correccion ni rechazo sistematico de respuestas truncadas por longitud, de modo que el modelo puede haber aprendido a producir pruebas plausibles pero invalidas.
- El juicio automatico con GPT-5.6-sol no equivale a certificacion en Lean. Cualquier uso que requiera correccion formal debe pasar por un verificador de pruebas.
- Ambito de especializacion estrecho: el entrenamiento se centra en teoria ecuacional y notas tecnicas de un solo turno. No hay evidencia de preservacion de capacidades generales tras el SFT.
- Idiomas no declarados: no se especifica que lenguas soporta el modelo ni si el ajuste degrada el comportamiento multilingue del base.
- Contexto no documentado: se desconoce la longitud de contexto efectiva, aunque la arquitectura base incorpore atencion lineal.
- Capacidades de agente y tool calling no verificadas: el modelo se entreno con trayectorias de un solo turno y envoltorio de thinking vacio, no con interacciones con herramientas.
- Vision heredada pero no ajustada: los pesos de vision y MTP se copian sin cambios, por lo que el comportamiento multimodal corresponde al base, no al ajuste.
- Licencia apache-2.0: permite uso comercial, pero conviene revisar los terminos aplicables al modelo base Qwen3.5-9B y las condiciones de uso de los datos de entrenamiento, que no se detallan.
- Reproducibilidad parcial: la revision del base esta fijada y hay registro en WandB, pero el dataset destilado no se publica como artefacto independiente en la informacion disponible.
- Modelo sin traccion: 0 descargas y 0 likes, sin validacion por parte de terceros ni issues documentados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-r3-mix1m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro de entrenamiento en WandB: https://wandb.ai/stanford_autonomous_agent/equational-theory-curated-r3-20260923/runs/eqr31m20260923
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada
