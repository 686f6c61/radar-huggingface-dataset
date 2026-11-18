# U-WIN/qwen35-9b-equational-theory-sair-study-materials-ntp-24m-kl-0p01

## Resumen

`qwen35-9b-equational-theory-sair-study-materials-ntp-24m-kl-0p01` es un ajuste fino completo del modelo base Qwen3.5-9B, publicado por el usuario U-WIN en noviembre de 2026 dentro de un proyecto interno de investigacion sobre "teoria ecuacional" (equational theory). El modelo no es un asistente generalista: es un checkpoint de investigacion entrenado para internalizar el corpus de estudio del proyecto mediante prediccion de siguiente token sobre texto fuente en bruto, sin notas de estudio ni trayectorias de solucion como objetivos de entrenamiento.

El nombre del repositorio describe los datos de entrenamiento, no el numero de parametros: 24,3 millones de tokens de texto fuente procedentes de 53.467 ficheros del corpus Equational, troceados en 81.791 extractos contiguos de unos 512 tokens. El entrenamiento consistio en un ajuste fino completo (full-finetune) de 2 epochs con 378 pasos de optimizador, una tasa de aprendizaje de 5e-06 con decaimiento coseno y regularizacion KL de 0,01 frente al modelo base sobre un pool de repeticion congelado.

Es relevante ahora como artefacto de investigacion reproducible: incluye procedencia completa (`training_summary.json`, `artifact_manifest.json` con sha256 de cada fichero), dos revisiones (epoch-1 y epoch-2) y un registro W&B publico. Sin embargo, el propio autor indica explicitamente que el modelo **no ha sido evaluado** en ningun benchmark, por lo que sus unicas metricas disponibles son perdidas de entrenamiento y validacion. No debe confundirse con un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; pesos de texto ajustados, componentes de vision congelados del modelo base |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (el entrenamiento uso filas empaquetadas de 17.408 tokens) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precision de exportacion; no se documentan GGUF ni AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios; config, tokenizer, chat template y processors incluidos) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y conserva su arquitectura multimodal original: el export de serving contiene 427 tensores de lenguaje ajustados y 348 tensores del modelo base sin cambios, de modo que los componentes de vision son los del base y no fueron evaluados por calidad multimodal. El ajuste fino es de modelo completo (no LoRA), con prediccion de siguiente token sobre filas empaquetadas de 17.408 tokens, una fila por GPU, 2 epochs, tasa de aprendizaje 5e-06, decaimiento coseno con 3 % de warmup y 378 pasos de optimizador en 8 GH200 durante 57 minutos (job Slurm 1149071 en TACC Vista).

La innovacion tecnica destacable es la regularizacion KL: se anade un termino 0,01 x KL(base || student) sobre un pool de repeticion congelado de trayectorias Equational generadas por el modelo base. Ese pool actua solo como regularizador, nunca como objetivo de entrenamiento. Los datos son exclusivamente texto fuente: paginas por ley (la ley, sus modelos, relaciones y listas de no-implicaciones), paginas de relaciones (implicaciones probadas con sus pruebas Lean, dualidades, equivalencias, contraejemplos) y paginas de exposicion, fundamentos y metodos. El corpus se construyo con las preguntas del benchmark retenidas (informe de separacion con estado PASS y 1.100 objetivos de evaluacion protegidos), aunque leyes equivalentes y tablas compartidas permanecen por diseno.

## Capacidades

- Generacion de texto autoregresiva sobre texto fuente del dominio de teoria ecuacional.
- Lectura y procesamiento de entradas multimodal (imagen + texto) segun el pipeline `image-text-to-text` heredado del base, si bien la calidad multimodal no fue evaluada.
- Internalizacion de terminologia y estructuras del corpus Equational: leyes, modelos, relaciones, dualidades, equivalencias, contraejemplos e implicaciones con pruebas Lean.
- Conversacion multi-turno mediante el chat template incluido en el repositorio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito (no hay modo thinking declarado).
- Capacidades multilingues: no disponibles.
- Capacidades especiales: regularizacion KL frente al base para preservar el comportamiento generativo original; export con procedencia verificable (digest de lanzamiento, auditoria de tensores, sha256 por fichero).

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: el modelo sirve como sujeto experimental para medir cuanto corpus fuente se absorbe con NTP puro y regularizacion KL, comparando las revisiones epoch-1 y epoch-2 con las perdidas documentadas (0,177 y 0,084 en entrenamiento).
- Reproduccion de experimentos: el repositorio incluye receta, registro W&B y manifiesto de artefactos, lo que permite replicar el ajuste sobre 8 GH200 y verificar la integridad de los pesos antes de usarlos.
- Estudio de retencion frente al modelo base: las perdidas held-out sobre notas de estudio originales (1,188 en epoch-1 y 1,203 en epoch-2 frente a 1,245 del base) permiten analizar el equilibrio entre adaptacion al dominio y olvido catastrofico.
- Analisis de regularizacion KL: el KL(base || student) de 0,018 y 0,015 en las dos revisiones sirve para estudiar como una penalizacion de 0,01 preserva la distribucion del base mientras se ajusta el modelo completo.
- Generacion de texto tecnico del dominio: con el chat template incluido, puede emplearse para producir borradores de exposicion sobre leyes y relaciones del corpus, siempre con revision humana dada la ausencia de evaluacion.
- Docencia e investigacion academica: como checkpoint Apache 2.0 con procedencia completa, es adecuado para cursos y proyectos que necesiten un modelo de 9,65 mil millones de parametros ajustado a un dominio especializado y auditable.
- Base para futuros ajustes: al ser un full-finetune del Qwen3.5-9B con licencia permisiva, puede servir como punto de partida para experimentos posteriores de alineacion o evaluacion en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que ninguna revision ha sido puntuada en ningun benchmark. Las unicas metricas son perdidas de entrenamiento y validacion:

| Metrica | Base Qwen3.5-9B | epoch-1 (checkpoint-189) | epoch-2 / main (checkpoint-378) |
|---|---|---|---|
| Perdida media de entrenamiento sobre el texto fuente de la run | no disponible | 0,177 | 0,084 |
| Perdida held-out sobre notas de estudio originales | 1,245 | 1,188 | 1,203 |
| Perdida held-out sobre trayectorias del modelo base | 0,145 | 0,146 | 0,146 |
| KL(base \|\| student) en el pool de validacion | no disponible | 0,018 | 0,015 |

Nota: el conjunto held-out no contiene texto fuente de esta run, por lo que ninguna cifra mide el ajuste a texto fuente no visto; la perdida de entrenamiento de epoch-2 corresponde a texto ya visto en epoch-1.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para 9,65 mil millones de parametros en transformer denso: en bf16/fp16 se situa en torno a 19-20 GB solo para pesos; en cuantizacion de 8 bits alrededor de 10-11 GB; en 4 bits alrededor de 5-6 GB. Son estimaciones genericas, no medidas publicadas para este checkpoint.
- GPU recomendadas: el entrenamiento uso 8 x GH200 (una fila de 17.408 tokens por GPU). Para inferencia, GPUs de centro de datos tipo A100 40/80 GB o H100 funcionan con holgura en bf16.
- Cabe en GPU de consumo: si, previsiblemente en RTX 4090 (24 GB) en bf16 para pesos, y en tarjetas de 12-16 GB con cuantizacion de 8 o 4 bits, siempre que se utilice un runtime compatible con la arquitectura Qwen3.5.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText` + `AutoProcessor`, con `dtype="auto"` y `device_map="auto"`), endpoints compatibles (tag `endpoints_compatible`). vLLM, TGI, llama.cpp u Ollama: no disponible, no se documenta soporte ni se publican pesos GGUF.
- Latencia y throughput: no disponibles. No se publican mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (U-WIN, Qwen3.5-9B full-finetune) | 9,65 B | no disponible | Apache 2.0 | ninguna (solo perdidas) | Hugging Face, transformers |
| Qwen/Qwen3.5-9B (base) | ~9,65 B (segun el checkpoint base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face |
| Alternativas de ~9-10 B de la familia Qwen (p. ej. Qwen2.5-7B/14B) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | Hugging Face |

La comparativa fiable solo puede hacerse contra el modelo base, del que este checkpoint deriva directamente y cuyas perdidas held-out se citan en la model card. Cualquier otra comparacion con modelos de la misma categoria requeriria datos de benchmarks que no se han publicado para este modelo.

## Limitaciones y advertencias

- Modelo no evaluado: ninguna revision ha sido puntuada en benchmarks; las perdidas de validacion no miden capacidad real en tareas.
- Dominio muy estrecho: entrenado exclusivamente sobre texto fuente del corpus Equational, por lo que su comportamiento fuera de ese dominio no esta caracterizado.
- Riesgo de alucinacion: no cuantificado; al ser un ajuste NTP sobre texto tecnico con pruebas Lean, puede generar afirmaciones plausibles pero incorrectas sobre leyes y relaciones.
- Olfido catastrofico parcial: la perdida held-out sobre notas de estudio originales empeora ligeramente en epoch-2 (1,203) respecto a epoch-1 (1,188), aunque ambas mejoran al base (1,245).
- Componentes de vision no evaluados: los tensores multimodales son los del base y no se comprobo su calidad tras el ajuste.
- Idiomas soportados no documentados: no hay garantia de comportamiento multilingue.
- Contexto no documentado: se desconoce la ventana nativa del checkpoint; las filas de entrenamiento de 17.408 tokens no implican que esa sea la longitud de contexto de inferencia.
- Sin soporte documentado de tool calling, agentes o modo thinking.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-9B conviene revisar las condiciones del modelo base y conservar los avisos de atribucion.
- Trazabilidad: al ser un artefacto de investigacion con 0 descargas y 0 likes en el momento de la consulta, no hay validacion comunitaria; verificar los sha256 de `artifact_manifest.json` antes de desplegar.
- Sesgos: no documentados; no se realizo ninguna evaluacion de sesgo o seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-study-materials-ntp-24m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Registro W&B del entrenamiento: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqstudymaterials20261117
- Receta y registro de la run (ruta en el repositorio del proyecto, no es una URL publica): `recipe/equational_internalization/experiments/observations_study_materials_ntp_kl_vista_20261117/README.md`
- Papers, blogs, repos y demos adicionales: no disponibles en la informacion proporcionada.
