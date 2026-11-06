# StephC/Qwen2.5-1.5B-Question-First-Exposure-CQO-seed20261009

## Resumen

Qwen2.5-1.5B-Question-First-Exposure-CQO-seed20261009 es un checkpoint de ajuste fino completo (full fine-tuning) derivado de Qwen/Qwen2.5-1.5B-Instruct, publicado por Stefano Civelli (usuario StephC) como parte del estudio sobre sensibilidad al orden de prompts titulado "Exposure to Question-First Prompts Changes How Language Models Read the Context". No es un modelo conversacional de proposito general ni un asistente desplegable: es un artefacto de investigacion en interpretabilidad mecanicista, entrenado especificamente para responder preguntas de opcion multiple bajo una plantilla concreta con orden CQO (contexto, pregunta, opciones).

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con 1.543.714.304 parametros totales (segun safetensors) y contexto nativo de 32.768 tokens en la familia base, aunque el estudio solo evalua sobre plantillas y datasets de opcion multiple fijos (RACE-M, RACE-H, LogiQA, SciQ). Se distribuye en FP32, sin cuantizacion ni conversion, para preservar exactamente las condiciones del experimento de question-swap descrito en el paper.

Es relevante ahora porque forma parte de una release de nueve checkpoints (tres familias de modelos x CQO-only, QOC-only y mixed-order) con la semilla fija 20261009, que permite reproducir y auditar los hallazgos del paper sobre como el orden de los componentes del prompt altera el procesamiento interno del contexto. No hay descargas ni likes registrados, lo que refleja su naturaleza de material de replicacion academica mas que de modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2), atencion eager durante el entrenamiento |
| Parametros totales | 1.543.714.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion disponible para este checkpoint; la familia Qwen2.5-1.5B-Instruct soporta 32.768 tokens, pero el estudio evalua solo con plantillas de opcion multiple fijas |
| Tipos de cuantizacion | No disponible (release en FP32 sin cuantizar; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP32, sin resharding ni conversion) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen/Qwen2.5-1.5B-Instruct (revision 989aa7980e4cf806f80c7fef2b1adb7bc71aa306) y aplica full fine-tuning sobre 4.096 registros de entrenamiento divididos a partes iguales entre RACE-M, RACE-H, LogiQA y SciQ, con dos pasadas sobre el dataset y 1.024 actualizaciones del optimizador. La configuracion de entrenamiento usa parametros y estados AdamW en FP32 con autocast BF16, learning rate 5e-6, batch efectivo de 8 y atencion eager. El setting de este checkpoint es CQO: cada registro se presenta con contexto (C), despues pregunta (Q) y despues opciones (O).

La innovacion metodologica no reside en la arquitectura (que es la de Qwen2.5 sin modificaciones estructurales) sino en el diseno experimental: se comparan checkpoints entrenados exclusivamente con orden CQO, exclusivamente con QOC y con orden mixto (cada registro una vez en CQO y otra en QOC a lo largo de dos pasadas). El paper asociado mide como esta exposicion al orden de prompt cambia la forma en que el modelo lee el contexto, mediante evaluaciones estandar y un ensayo de question-swap que requiere cargar los pesos en FP32. Los tensores se distribuyen byte a byte tal como fueron evaluados, con SHA-256 registrado en release_manifest.json.

## Capacidades

- Respuesta a preguntas de opcion multiple bajo la plantilla del estudio (contexto, pregunta, opciones) en datasets RACE-M, RACE-H, LogiQA y SciQ.
- Scoring de etiquetas conforme al pipeline de evaluacion del repositorio del paper (label scoring).
- Participacion en ensayos de intervencion de prompt (question-swap) para estudiar sensibilidad al orden del contexto.
- Generacion de texto condicionada a la plantilla de opcion multiple; no esta entrenado como asistente conversacional general.
- Capacidades multilingues limitadas al ingles segun los metadatos del repo.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido (thinking) en la informacion disponible.

## Casos de uso

- Replicacion del paper sobre exposicion a prompts question-first: cargar el checkpoint con `snapshot_download` fijando el commit del manifiesto y ejecutar `qfe.evaluate` con el conjunto `analysis` para reproducir las metricas publicadas.
- Auditoria de interpretabilidad mecanicista: usar el checkpoint junto a `qfe.question_swap` para inspeccionar como cambia la lectura del contexto al intercambiar la posicion de la pregunta, preservando FP32 para no alterar el ensayo.
- Estudio comparado de orden de prompt: confrontar este checkpoint CQO con los otros dos de la misma familia (QOC-only y mixed-order) para aislar el efecto del orden de entrenamiento sobre el rendimiento en opcion multiple.
- Analisis de sensibilidad en pipelines de evaluacion: servir como control negativo/positivo al disenar benchmarks internos que midan robustez al reordenamiento de contexto, pregunta y opciones.
- Investigacion sobre sesgos de plantilla: usar las cuatro fuentes (RACE-M, RACE-H, LogiQA, SciQ) para medir como el formato de prompt interactua con dominios distintos (comprension lectora, razonamiento logico, ciencia).
- Docencia y formacion en NLP experimental: ejemplo reproducible de fine-tuning completo sobre un modelo de 1.5B con receta detallada (LR, batch, pasos, precision) para cursos de interpretabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del paper para las evaluaciones (`qfe.evaluate` sobre el conjunto `analysis` y `qfe.question_swap`), pero no incluye cifras numericas en el texto proporcionado. No se deben inferir valores de MMLU, HumanEval, GSM8K ni de los datasets del estudio sin consultar dichos artefactos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 6,2 GB solo para pesos (1.543.714.304 parametros x 4 bytes), mas overhead de activaciones y cache KV; en la practica conviene reservar 8-10 GB.
- VRAM estimada en BF16 (si se convierte para evaluaciones ordinarias, como indica el paper): unos 3,1 GB de pesos, con 5-6 GB totales recomendables.
- GPU recomendadas: cualquier GPU con 8 GB o mas para FP32 (RTX 3070/4060 Ti, RTX 4090); A100/H100 no son necesarias para este tamano, pero utiles para barridos de semillas y evaluaciones por lotes.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4070, RTX 4090 y equivalentes; en GPUs de 8 GB puede requerir carga por capas o cuantizacion, lo que invalidaria el ensayo de question-swap en FP32.
- Opciones de despliegue: transformers (via `qfe.evaluate` y `qfe.question_swap` del repositorio del paper) y text-generation-inference segun los tags del repo; no se documentan recetas para llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles; no se publican mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StephC/Qwen2.5-1.5B-Question-First-Exposure-CQO-seed20261009 | 1,54 B | No especificado para el checkpoint (familia base: 32.768) | Full fine-tuning CQO sobre 4.096 registros de opcion multiple | apache-2.0 | Hugging Face, FP32, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct (base) | 1,54 B | 32.768 | Preentrenamiento + instrucciones de proposito general | apache-2.0 | Hugging Face, ampliamente adoptado |
| StephC/Qwen2.5-1.5B-Question-First-Exposure-QOC-seed20261009 (variante del mismo estudio) | 1,54 B | No especificado | Full fine-tuning con orden QOC | apache-2.0 | Hugging Face (release de nueve checkpoints) |
| StephC/Qwen2.5-1.5B-Question-First-Exposure-mixed-order-seed20261009 (variante del mismo estudio) | 1,54 B | No especificado | Full fine-tuning con orden mixto CQO/QOC | apache-2.0 | Hugging Face (release de nueve checkpoints) |

Las variantes QOC y mixed-order se infieren de la descripcion del release (tres familias x tres settings con la semilla 20261009); sus identificadores exactos no se detallan en la informacion proporcionada. No se dispone de comparativas de rendimiento numericas entre estos checkpoints en el material disponible.

## Limitaciones y advertencias

- No es un asistente conversacional: fue ajustado sobre respuestas de opcion multiple y la model card advierte explicitamente que no se reclama rendimiento en tareas generales ni en despliegue.
- Resultados validos solo para las plantillas y datasets fijos del paper (RACE-M, RACE-H, LogiQA, SciQ); extrapolar a otros prompts o dominios carece de respaldo experimental.
- El release de una sola semilla no reproduce por si mismo los estimulos de incertidumbre a nivel de semilla del paper, que reporta seis semillas; la semilla 20261009 se eligio por ser la primera numerada, no por rendimiento.
- El ensayo de question-swap requiere pesos FP32; cargar BF16 o cuantizar invalida esa parte del experimento.
- Idiomas: solo ingles segun los metadatos; no hay evidencia de comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; al derivar de Qwen2.5-1.5B-Instruct, hereda potencialmente los sesgos del modelo base, sin que el estudio los evalue.
- Licencia apache-2.0 permite uso comercial, pero el modelo esta pensado como material de investigacion; su utilidad en produccion es practicamente nula dadas las condiciones de entrenamiento.
- Los pesos son derivados modificados del modelo base; deben conservarse LICENSE.txt y NOTICE.txt del repositorio.
- No incluye estados del optimizador ni texto de entrenamiento; es un checkpoint completo, no un adapter.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StephC/Qwen2.5-1.5B-Question-First-Exposure-CQO-seed20261009
- Repositorio del paper (codigo, outputs y reproduccion): https://github.com/Stefano-Civelli/question-first-exposure
- Repositorio de investigacion original sobre sensibilidad al orden de prompt: https://github.com/Stefano-Civelli/prompt-order-sensitivity
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
