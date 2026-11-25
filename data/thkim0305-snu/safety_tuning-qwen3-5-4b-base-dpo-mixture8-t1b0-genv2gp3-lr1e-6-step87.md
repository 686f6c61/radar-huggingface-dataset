# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-T1B0-genv2gp3-lr1e-6-step87

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-T1B0-genv2gp3-lr1e-6-step87 es un checkpoint intermedio de un proceso de ajuste por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU. El objetivo declarado es el alineamiento de seguridad: el modelo se entrena para preferir trayectorias de respuesta que un juez binario estricto considera seguras frente a trayectorias del propio modelo base que el juez rechaza.

El checkpoint corresponde al paso 87 de 694 actualizaciones del optimizador (aproximadamente 0,251 de las 2 epocas previstas). Por tanto, no es un modelo final, sino una instantanea de un entrenamiento en curso. Los pesos son bf16 en formato Hugging Face `Qwen3_5ForConditionalGeneration`; solo se ha entrenado el modelo de lenguaje, mientras que la torre de vision y la cabeza MTP conservan los pesos originales del modelo base.

Con 4.659.865.088 parametros totales (unos 4,66 mil millones), contexto de entrenamiento de 32.768 tokens y licencia Apache 2.0, el modelo hereda la arquitectura multimodal image-text-to-text de la familia Qwen3.5. Su relevancia es metodologica: documenta con detalle una receta de DPO para seguridad con pares generados por profesor (Qwen3.8-27B) y juez binario, lo que lo hace util como referencia para investigacion en alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, `Qwen3_5ForConditionalGeneration`); vision tower + MTP head heredados del base, solo entrenado el LM |
| Parametros totales | 4.659.865.088 (~4,66 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento; contexto nativo del base no disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (snapshot `1001bb4d826a`), que actua tambien como modelo de referencia congelado. La arquitectura es la de la familia Qwen3.5: un transformer multimodal con torre de vision y cabeza de prediccion multitoken (MTP), aunque en este ajuste solo se actualizan los pesos del modelo de lenguaje. El checkpoint se exporta desde Megatron (`torch_dist`, `iter_0000086`) mediante `safety_tuning.hf_export`, con re-fusion de las proyecciones GDN, mapeo de nombres Slime Qwen3.5 y copia de los pesos de vision y MTP del base.

El entrenamiento usa DPO con objetivo sigmoide y beta 0,1 sobre la respuesta completa (razonamiento, respuesta y llamadas a herramientas). Los pares se construyen con una trayectoria elegida de Qwen3.8-27B que supera un juez binario estricto (score 1) y una trayectoria rechazada de Qwen3.5-4B-Base que lo falla (score 0), con el mismo prompt y sin reutilizacion. El conjunto total son 22.185 pares procedentes de 8.494 prompts, distribuidos en ocho fuentes (agentalign_harmful, codesafetybench, difficult_advice, star1_gp3, agentalign_benign, magicoder, star_benign_v2 y wildjailbreak_benign). El entrenamiento se ejecuta con Slime + Megatron-LM, computo bf16 con estado del optimizador en fp32, tensor parallel 4, learning rate pico 1e-6 con warmup lineal del 10 % y decaimiento coseno hasta 2e-7, Adam con betas [0,9; 0,95], weight decay 0,0 y grad clip 1,0. Se uso el template de chat nativo del Base con system "You are a helpful assistant." y thinking activado, sin Model Spec.

## Capacidades

- Generacion de texto conversacional y razonamiento con modo thinking activable (`enable_thinking=True`).
- Capacidad multimodal image-text-to-text heredada del modelo base (torre de vision intacta).
- Soporte de llamadas a herramientas (tool calling) en las trayectorias de entrenamiento.
- Razonamiento multi-paso y comportamiento agentico, fomentado por las fuentes agentalign.
- Generacion de codigo, reforzada por las fuentes codesafetybench y magicoder.
- Alineamiento de seguridad: preferencia por respuestas seguras en escenarios de riesgo (jailbreaks, consejo dificil, codigo peligroso).
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en alineamiento de seguridad: sirve como checkpoint de referencia para estudiar la evolucion del DPO paso a paso, ya que se publican instantaneas en los pasos 87, 174, 260, 347, 434, 521, 607 y 694.
- Evaluacion de robustez frente a jailbreaks: el uso de wildjailbreak_benign y agentalign_harmful permite medir la resistencia del modelo a prompts adversarios.
- Moderacion y filtrado de contenido: el modelo puede emplearse para clasificar o reescribir respuestas potencialmente danadas en pipelines de moderacion, dado su entrenamiento en pares seguro/inseguro.
- Generacion de codigo con conciencia de seguridad: las fuentes codesafetybench y magicoder lo hacen adecuado para tareas de autocompletado o revision de codigo donde importa evitar patrones peligrosos.
- Asistentes conversacionales con tool calling: el soporte de llamadas a herramientas y el contexto de 32.768 tokens permiten conversaciones multi-turno con integracion de funciones.
- Analisis de imagenes con texto (image-text-to-text): la torre de vision del base permite tareas de descripcion o respuesta a preguntas sobre imagenes, aunque no se ha ajustado especificamente para ello.
- Base para experimentos de destilacion: al usar un profesor de 27B y un juez binario, el checkpoint es util para replicar recetas de destilacion por preferencias en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de seguridad cuantificadas; solo describe la receta de entrenamiento y el numero de pasos completados.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,3 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 12-16 GB para contexto moderado.
- En cuantizacion de 8 bits: alrededor de 5 GB de pesos; en 4 bits, alrededor de 2,5-3 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: H100 80GB (usadas en el entrenamiento, 4x H100 con tensor parallel 4), A100 40/80GB, L40S, RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 o cuantizada.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizacion o contexto reducido; en GPUs de 16 GB con cuantizacion 8 bits.
- Opciones de despliegue: transformers (metodo documentado), vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF, no disponible en el repo).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO (este) | ~4,66 B | 32.768 (entrenamiento) | Apache 2.0 | Checkpoint intermedio de DPO de seguridad, multimodal heredado |
| Qwen/Qwen3.5-4B-Base | ~4,66 B (no confirmado) | no disponible | Apache 2.0 | Modelo base sin ajuste de preferencias; referencia congelada del DPO |
| Qwen/Qwen3.8-27B | ~27 B (no confirmado) | no disponible | no disponible | Profesor usado para generar trayectorias elegidas |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: solo se han completado 87 de 694 actualizaciones (0,251 de 2 epocas); el autor indica explicitamente que el entrenamiento sigue en curso y que no es un modelo final.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; al ser un modelo pequeno ajustado con DPO, puede generar contenido plausible pero incorrecto.
- Sesgos: no se documentan analisis de sesgo; el dataset incluye fuentes de seguridad y codigo, pero no se detalla su composicion demografica o linguistica.
- Idiomas: no se especifican los idiomas soportados; el template de chat y los datos parecen centrados en ingles.
- Uso comercial: la licencia Apache 2.0 lo permite, pero al ser un checkpoint de investigacion en curso, no se recomienda su despliegue en produccion sin evaluacion adicional.
- Capacidades multimodales no ajustadas: la torre de vision conserva los pesos del base y no se ha entrenado, por lo que su rendimiento en tareas de imagen es el del modelo original, no el de este ajuste.
- Contexto: el limite de 32.768 tokens corresponde al entrenamiento; trayectorias mas largas se excluyeron por completo, no se truncaron, lo que puede sesgar el comportamiento en contextos muy largos.
- Sin garantias de seguridad absoluta: el alineamiento por DPO reduce pero no elimina respuestas inseguras; requiere capas adicionales de moderacion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-T1B0-genv2gp3-lr1e-6-step87
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Paper de DPO: no disponible en la informacion proporcionada
- Repositorio Slime: no disponible en la informacion proporcionada
- Repositorio Megatron-LM: no disponible en la informacion proporcionada
