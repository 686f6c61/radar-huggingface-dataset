# vybechief/vybecheck-flant5-adapters

## Resumen

Vybecheck-flant5-adapters es un adaptador LoRA (PEFT) entrenado por VYBE (`vybechief`) sobre `google/flan-t5-large`, un modelo seq2seq instruido de 780 millones de parametros. Su funcion es muy concreta: convertir terminos de jerga juvenil e internet (slang) en definiciones en lenguaje llano en ingles, siguiendo el patron `Define this slang term: {term}`. Esta pensado como paso de reescritura sustituible dentro de VYBE Bridge, un sistema de la plataforma vybecheck.tech.

El proyecto es explicitamente experimental y su historial de revisiones es ilustrativo: las versiones `main` y `job-v2` a `job-v6` fallaron repetidamente la prueba de retencion (holdout) con el termino "No Cap", que el modelo traducia erroneamente como prenda de vestir o carino en lugar de "mentira". La revision `job-v7` supero esa prueba tras reentrenar con r=64, muestreo sobredimensionado de la familia semantica de verdad/mentira y ejemplos negativos dificiles. Aun asi, el Bridge en produccion sigue usando OpenAI hasta un cambio explicito.

Es relevante como caso de estudio de ajuste fino LoRA estrecho y con validacion por sondas, aunque su utilidad general esta muy limitada: no es un chatbot ni un modelo de proposito general, sino un componente especializado de mapeo de glosario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT, SEQ_2_SEQ_LM) sobre Flan-T5 (transformer seq2seq encoder-decoder) |
| Parametros totales | no disponible (solo se distribuye el adaptador; el repo pesa 1,2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base Flan-T5-large no se indica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en precision nativa del adaptador) |
| Idiomas soportados | Ingles (definiciones; los terminos de slang pueden ser multilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere el modelo base google/flan-t5-large) |

## Arquitectura y entrenamiento

El adaptador sigue la configuracion estandar de PEFT para modelos seq2seq (`SEQ_2_SEQ_LM`) aplicada a Flan-T5-large. La revision vigente (`job-v7`) usa LoRA con rango r=64, alpha=128, dropout 0 y learning rate 2e-4 durante 20 epocas, inyectando adaptadores en las proyecciones de atencion `q, k, v, o` y en las capas FFN `wi_0, wi_1, wo` de T5. Las versiones anteriores empleaban r=32 y 10 epocas. El entrenamiento se realizo en Hugging Face Jobs con una instancia `a10g-small` (NVIDIA A10G); la revision `main` original se entreno en Colab.

Los datos de entrenamiento son un glosario privado de slang revisado manualmente, con pares termino → definicion corta. Se descartaron frases de ejemplo de uso y las filas inversas de direccion `to-genz`; solo se conserva la direccion `to-plain`. En `job-v7` la familia semantica de verdad/mentira se sobremuestrea hasta un tercio de los pasos y se anaden ejemplos negativos dificiles (hat/caption) para evitar el colapso semantico de "cap". La validacion se hace mediante una sonda de retencion: `job-v7` supera el gate `HOLD_OUT_PASS` al definir "No Cap" como glosa de veracidad ("A lie. Not a hat."), mientras que `main` y `job-v2` a `job-v6` la fallaron. No hay RLHF ni DPO; el ajuste es supervisado simple.

## Capacidades

- Definicion de terminos de slang en lenguaje llano en ingles, con el prefijo congelado `Define this slang term: {term}` (solo en `job-v7`).
- Generacion de glosas de veracidad para la familia "cap / No Cap" (mentira, de verdad, en serio).
- Reescritura unidireccional `to-plain`: termino de slang → significado. La direccion inversa (`to-genz`) fue eliminada del entrenamiento.
- No soporta chat abierto, razonamiento general, codigo, matematicas, vision ni tool calling; son casos explicitamente fuera de alcance segun la model card.
- No debe usarse como mecanismo de puntuacion de riesgo de VYBE ni como fuente de verdad.

## Casos de uso

- Normalizacion de slang en moderation de contenido: dentro de VYBE Bridge, el adaptador traduce terminos de jerga a lenguaje llano antes de aplicar reglas o puntuaciones deterministicas, facilitando que un clasificador posterior entienda el texto original.
- Sustitucion economica de una API comercial: al ser un adaptador LoRA sobre Flan-T5-large (780M de parametros), puede ejecutarse en GPU modesta o CPU, reduciendo el coste frente a la llamada a OpenAI que usa actualmente el Bridge en produccion.
- Glosarios dinamicos de jerga juvenil: plataformas sociales o de gamificacion pueden integrarlo para mostrar explicaciones automaticas de terminos de slang a usuarios que no los conocen.
- Herramienta educativa o de accesibilidad: explicar expresiones de internet a personas mayores o no nativas, siempre restringido al glosario revisado del proyecto.
- Componente de pipeline con verificacion externa: el diseno previsto contempla un puntuador determinista aparte, por lo que el adaptador encaja como paso de reescritura auditable y reemplazable.
- Caso de estudio de MLOps con LoRA: el historial de revisiones con gates de retencion (`main`, `job-v2` a `job-v7`) es un ejemplo documentado de iteracion con validacion por sondas y despliegue por revisiones en repositorios PEFT.

Fuera de estos escenarios, el propio autor desaconseja su uso: no debe inventar significados ajenos al glosario revisado ni servir para produccion en las revisiones `main` o `job-v2` a `job-v6`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion referenciada es la sonda de retencion interna: `job-v7` pasa el gate `HOLD_OUT_PASS` (definicion de "No Cap" como glosa de veracidad), mientras que `main` y `job-v2` a `job-v6` lo fallaron. No hay metricas MMLU, HumanEval, GSM8K ni similares.

## Requisitos de hardware

- El adaptador pesa 1,2 GB en el repositorio; combinado con el modelo base Flan-T5-large (780M de parametros, aproximadamente 3 GB en fp16), la inferencia completa requiere en torno a 4-5 GB de VRAM en fp16, o menos con cuantizacion (estimacion no confirmada en la model card).
- Cabe con holgura en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090 o incluso GPUs integradas modernas; tambien es viable en CPU dada la talla del modelo base.
- El entrenamiento de `job-v7` se realizo en una instancia `a10g-small` (NVIDIA A10G, 24 GB de VRAM) mediante Hugging Face Jobs; la revision `main` original se entreno en Colab.
- Despliegue: transformers + PEFT (version 0.21.2 en entrenamiento) segun el ejemplo de la model card. El autor despliega workers en RunPod que cargan el repo por revision. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un adaptador PEFT sobre T5, llama.cpp y Ollama no lo cargan directamente.
- No hay datos publicos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vybechief/vybecheck-flant5-adapters | LoRA sobre Flan-T5-large | 780M (base) | Slang → definicion en ingles | Apache 2.0 | HF, revisiones `main` y `job-v2` a `job-v7` |
| google/flan-t5-large (base) | Transformer seq2seq instruido | 780M | Instruccion general | Apache 2.0 | HF |
| google/flan-t5-xl | Transformer seq2seq instruido | 3B | Instruccion general | Apache 2.0 | HF |

Comparado con su modelo base, el adaptador no amplia capacidades generales: restringe el comportamiento a la tarea de definicion de slang con un prefijo fijo. Frente a un LLM comercial como el que usa el Bridge en produccion (OpenAI, no especificado en la model card), ofrece un coste por inferencia mucho menor y despliegue propio, a cambio de un dominio muy estrecho y riesgo de alucinacion de definiciones. No hay alternativas publicas comparables de adaptadores LoRA para slang con gates de validacion documentados: no disponible.

## Limitaciones y advertencias

- Riesgo alto de alucinacion: la model card advierte que el adaptador puede generar definiciones fluentes pero incorrectas; no debe usarse como fuente de verdad.
- El glosario de entrenamiento es privado, curado e incompleto; el modelo no debe usarse para inventar significados fuera de ese glosario.
- Las revisiones `main` y `job-v2` a `job-v6` fallaron la sonda de retencion y estan marcadas explicitamente como no desplegables; los workers de RunPod que no fijan revision cargan `main`, lo que es un riesgo operativo documentado por el propio autor.
- El Bridge en produccion sigue usando OpenAI; este adaptador no es la ruta activa de reescritura.
- Solo genera definiciones en ingles; los terminos de entrada pueden ser multilingues pero la salida es inglesa.
- No sirve como chatbot, sistema de razonamiento ni puntuador de riesgo de VYBE.
- La licencia Apache 2.0 permite uso comercial sin restricciones relevantes, al igual que el modelo base.
- No se ha estimado el impacto medioambiental de los entrenamientos, segun la model card.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vybechief/vybecheck-flant5-adapters
- Modelo base: https://huggingface.co/google/flan-t5-large
- Plataforma VYBE: https://vybecheck.tech
- Paper del modelo base: Chung et al., *Scaling Instruction-Finetuned Language Models* (Flan-T5), referenciado en la model card (enlace directo no disponible)
