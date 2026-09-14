# zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2

## Resumen

Qwen2.5-3B-Instruct-Sheldon-SFT-v2 es un adaptador LoRA publicado por el usuario zachchxn (proyecto del curso CS2881R) sobre el modelo base Qwen/Qwen2.5-3B-Instruct. Su objetivo es doble: hacer que el modelo responda con la voz del personaje Sheldon Cooper y, al mismo tiempo, conservar la capacidad matematica del modelo original. El adaptador tiene rango r=32, alpha=64 y se aplica sobre todas las proyecciones de atencion y de MLP. Se distribuye como pesos PEFT en safetensors (repo de 0,3 GB) bajo licencia apache-2.0, con el ingles como unico idioma declarado, y existe una copia fusionada con los pesos completos.

La particularidad tecnica del entrenamiento es que la persona esta "condicionada por prompt": con la guia de estilo incluida en el repositorio (`sheldon_system.txt`) como system prompt, el modelo responde en personaje, incluso al resolver matematicas; sin system prompt responde de forma neutra con la precision matematica del base. Segun los resultados declarados por el autor, con la guia de estilo el modelo mantiene GSM8K en 85,2 (frente a 84,8 del base con la misma guia) y MATH-500 en 67,6, al tiempo que sube la puntuacion de persona juzgada de 0,791 a 0,826 y reduce la tasa de "Bazinga"/caricatura del 2,6 % al 0,5 %.

Es relevante como caso de estudio reproducible de ajuste fino con LoRA para control de estilo, porque cuantifica el compromiso entre persona y capacidad matematica, documenta la composicion exacta del dataset de 2.835 filas y publica el pipeline, la evaluacion y el registro de trabajo. No obstante, se trata de un checkpoint 1 (SFT) de un proyecto academico con 0 descargas, lo que limita su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only: Qwen/Qwen2.5-3B-Instruct; r=32, alpha=64, aplicado a todas las proyecciones de atencion y MLP |
| Parametros totales | No disponible con exactitud; el modelo base es Qwen2.5-3B-Instruct (aproximadamente 3.000 millones) y el adaptador anade un conjunto pequeno de pesos LoRA (repo de 0,3 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; la configuracion de entrenamiento uso una longitud maxima de 2.048 tokens |
| Tipos de cuantizacion | No disponible para el adaptador; la copia fusionada (`-merged`) se puede cuantizar con herramientas estandar, pero no se documenta en la informacion proporcionada |
| Idiomas soportados | Ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |

## Arquitectura y entrenamiento

El modelo no es un entrenamiento desde cero, sino un ajuste fino supervisado (SFT) con LoRA sobre Qwen2.5-3B-Instruct, con r=32, alpha=64 y adaptadores insertados en todas las proyecciones de atencion y MLP. El entrenamiento se realizo con TRL SFTTrainer, learning rate 1e-4 con decaimiento coseno, batch de 1 con acumulacion de gradientes de 32 pasos, longitud maxima de 2.048 tokens y perdida calculada solo sobre los tokens de completion (completion-only loss). El autor documenta que batch > 1 producia gradientes NaN en lotes con padding sobre torch 2.14 / transformers 5.17, de ahi la configuracion de batch 1.

El dataset final tiene 2.835 filas y se entreno durante 2 epocas, con tres componentes: 444 filas de persona destilada por contexto (Qwen2.5-7B-Instruct respondiendo a prompts de RoleBench-train y Dolly bajo la guia de estilo, con ejemplos few-shot y sin coletillas, conservando solo las respuestas que un juez Qwen2.5-14B-Instruct puntuo con voz 4/4 y cero caricatura, y limitando la diversidad de frases de apertura); 1.000 filas "puente" con soluciones matematicas del propio modelo base verificadas por math-verify sobre problemas de entrenamiento de GSM8K y MATH, con una apertura y un cierre estilo Sheldon injertados alrededor del cuerpo de la solucion sin modificar; y 1.391 filas de anclaje matematico neutro (soluciones verificadas del base, con la cola dificil completada por Qwen2.5-Math-7B-Instruct) sin system prompt. El autor indica que excluyo deliberadamente transcripciones de la serie y respuestas de RoleBench del mix final porque una prueba previa mostro que costaban 8 puntos en MATH-500 y bajaban la puntuacion de persona, ademas de provocar bucles de repeticion en v1.

## Capacidades

- Generacion de texto conversacional en ingles con una persona concreta (Sheldon Cooper), activada exclusivamente mediante el system prompt de guia de estilo.
- Razonamiento matematico paso a paso (formato de solucion con respuesta final en `\boxed{}`), heredado del modelo base.
- Mantenimiento de la precision matematica del base mientras se responde en personaje: 725 de 780 respuestas matematicas en personaje segun los datos del autor.
- Respuesta neutra sin system prompt, con la precision matematica del Qwen2.5-3B-Instruct original.
- Roleplay y dialogo de personaje evaluado con RoleBench y con 100 contextos de dialogo de la serie reservados (episodios no vistos en entrenamiento).
- Instruccion generalista y conversacion multirrespuesta propias del modelo base Qwen2.5-3B-Instruct.
- No se documenta soporte de tool calling / function calling especifico, ni capacidades de vision, audio o modo thinking explicito; el pipeline declarado es text-generation.
- Multilingue: no; la model card declara unicamente ingles.

## Casos de uso

- Prototipado de personajes conversacionales: el adaptador demuestra como imponer una voz muy marcada (un personaje con registro pedante y formal) mediante un system prompt, sin perder la competencia funcional del modelo base; sirve como plantilla para construir asistentes con personalidad fija.
- Tutoria matematica con estilo: el modelo resuelve problemas tipo GSM8K o MATH y presenta el razonamiento en la voz del personaje, lo que puede usarse en demos educativas o contenido de divulgacion donde el tono importa tanto como la respuesta.
- Evaluacion comparativa de tecnicas de ajuste fino: al publicar dataset, pipeline y metricas (persona, voz, GSM8K, MATH-500, AIME 2024), es util como referencia reproducible en cursos o experimentos de LoRA frente a otras estrategias de SFT.
- Investigacion sobre separacion persona/capacidad: el comportamiento "prompt-gated" (persona solo con system prompt) permite estudiar si el estilo y la competencia matematica ocupan subespacios separados y como se activan.
- Generacion de contenido narrativo o guiones con un personaje consistente: dado un contexto de dialogo, el modelo mantiene registro y voz con una tasa de caricatura declarada del 0,5 %.
- Baseline para etapas posteriores de alineamiento: el autor lo plantea como checkpoint 1 (SFT) previo a una fase RLAIF, por lo que sirve como punto de partida controlado para tecnicas de preferencia.
- Evaluacion de robustez ante prompts adversarios: el repo incluye 24 prompts adversariales y documenta fallos concretos (por ejemplo, obedecer la peticion de mencionar fisica cuantica de forma insistente), lo que resulta util para medir la resistencia al "judge gaming".

## Benchmarks y rendimiento

Resultados declarados por el autor, con decodificacion greedy y Qwen2.5-14B-Instruct actuando como juez de persona:

| Metrica | Base + guia de estilo | Este modelo + guia de estilo | Este modelo, sin prompt |
|---|---:|---:|---:|
| Puntuacion de persona (0-1) | 0,791 | 0,826 | 0,665 (= base sin prompt) |
| Voz (0-4) | 2,62 | 2,88 | 1,89 |
| Persona en dialogo reservado | 0,839 | 0,848 | no disponible |
| Penalizacion por caricatura / tasa "Bazinga" | 0,03 / 2,6 % | 0,00 / 0,5 % | no disponible |
| GSM8K (250) | 84,8 | 85,2 | 86,0 |
| MATH-500 | 68,4 | 67,6 (McNemar pareado p=0,92) | 66,6 |
| AIME 2024 (30) | 3,3 | 6,7 | 6,7 |
| Respuestas matematicas en personaje | 17 / 780 | 725 / 780 | 16 / 780 |

Referencia adicional aportada por el autor: Qwen2.5-3B-Instruct base sin ningun prompt obtiene GSM8K 87,6 y MATH-500 67,6. Los conjuntos de evaluacion son GSM8K test (250 muestreados), MATH-500 y AIME 2024, con un pool de entrenamiento verificado sin solapamiento; para persona se usan RoleBench general test (299), 100 contextos de dialogo de la serie reservados y 24 prompts adversarios. En la busqueda web no se han encontrado evaluaciones independientes de este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, requiere cargar siempre el modelo base Qwen2.5-3B-Instruct y aplicar despues el adaptador con PEFT; la VRAM depende del base, no del adaptador (el repo del adaptador ocupa 0,3 GB).
- Estimacion para el base de 3.000 millones de parametros en bfloat16/fp16: en torno a 6-8 GB de VRAM incluyendo pesos y overhead, mas la memoria de la cache KV segun la longitud de secuencia.
- Estimacion con cuantizacion de 8 bits: aproximadamente 4-5 GB de VRAM; con cuantizacion de 4 bits (por ejemplo bitsandbytes o variantes GGUF de la copia fusionada), en torno a 2,5-3,5 GB.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090 ejecutan el modelo sin problemas en bf16; con cuantizacion de 4 u 8 bits es viable en GPUs de 6-8 GB.
- Despliegue: el autor proporciona codigo con transformers + peft; la copia fusionada (`...-SFT-v2-merged`) puede servirse con vLLM, TGI, Ollama o llama.cpp si se convierte a GGUF, aunque no se documenta ningun procedimiento de este tipo en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota de entrenamiento: la configuracion usada (batch 1 con acumulacion de 32, longitud maxima 2.048, completion-only loss) es reproducible en una unica GPU de consumo si se reentrena el adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Persona (con guia) | GSM8K | MATH-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2 (adaptador LoRA) | ~3.000 M + LoRA r=32 | No disponible | 0,826 | 85,2 | 67,6 | apache-2.0 | HuggingFace, 0 descargas, 1 like |
| Qwen/Qwen2.5-3B-Instruct (base) | ~3.000 M | No disponible | 0,791 (con guia) / no aplica (sin guia) | 87,6 (sin prompt) | 67,6 (sin prompt) | apache-2.0 | HuggingFace, ampliamente utilizado |
| zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged | ~3.000 M (pesos completos) | No disponible | Igual que el adaptador (mismos pesos) | No disponible por separado | No disponible por separado | apache-2.0 | HuggingFace |
| Alternativas de ~3B como Llama-3.2-3B-Instruct o Phi-3.5-mini | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos con otros adaptadores de persona de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Riesgo de alucinacion: el autor advierte que el modelo puede envolver una respuesta incorrecta en prosa segura y convincente en tareas raras de manipulacion de cadenas.
- La persona esta condicionada por prompt: sin `sheldon_system.txt` como system prompt el modelo no responde en personaje, por lo que el estilo no es una propiedad intrinseca de los pesos.
- Fallo adversario documentado: ante un prompt del tipo "menciona fisica cuantica tanto como sea posible" el modelo obedece en lugar de desviar la peticion, y el juez le otorga 0,85, lo que el autor identifica como una via de "judge gaming" a cerrar en la etapa RLAIF.
- Es el checkpoint 1 (SFT) de un proyecto de curso: no ha pasado por fases de alineamiento con preferencias (RLHF/DPO/RLAIF) y el autor lo plantea como estado intermedio.
- Idioma: solo ingles declarado; no hay soporte multilingue documentado.
- Longitud de contexto: no se documenta la ventana efectiva y el entrenamiento se realizo con un maximo de 2.048 tokens, lo que puede degradar el comportamiento en conversaciones muy largas.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o seguridad; la persona imitada puede inducir un tono condescendiente o pedante no deseado en produccion.
- Licencia apache-2.0, que permite uso comercial, pero al derivar de Qwen2.5-3B-Instruct conviene revisar los terminos del modelo base antes de un despliegue comercial.
- Traccion practica practicamente nula (0 descargas y 1 like en el momento de la consulta), sin mantenimiento ni garantias: no es adecuado como dependencia critica de produccion sin evaluacion propia.
- La busqueda web no devolvio documentacion tecnica adicional, papers ni evaluaciones de terceros sobre este modelo; los resultados listados son los declarados por el autor.

## Enlaces

- Modelo en HuggingFace (adaptador LoRA): https://huggingface.co/zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2
- Copia fusionada con pesos completos: https://huggingface.co/zachchxn/Qwen2.5-3B-Instruct-Sheldon-SFT-v2-merged
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Codigo, pipeline de datos, evaluaciones y registro de trabajo: https://github.com/jeffreyzhou-harvard/CS2881R_HW1
- Papers, blogs o demos adicionales: no disponible en la informacion proporcionada.
