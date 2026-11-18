# U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-350m-kl-0p01

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-350m-kl-0p01` es un ajuste fino completo de `Qwen/Qwen3.5-9B` (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) desarrollado por el grupo U-WIN en noviembre de 2026. Forma parte de un trabajo de investigacion sobre internalizacion de teoria ecuacional: el objetivo es que el modelo absorba el corpus de estudio Equational a partir de las observaciones que las herramientas de lectura devolvieron a un agente durante sesiones de exploracion. El nombre "350m" hace referencia a los 350 millones de tokens de perdida del conjunto de entrenamiento, no al numero de parametros, que ascienden a 9.653.104.368 (9,65 mil millones).

El modelo conserva la arquitectura multimodal `qwen3_5` del base (pipeline `image-text-to-text`), pero solo se ajustaron los pesos de lenguaje: 427 tensores de lenguaje afinados y 348 tensores del base sin cambios. Los componentes de vision son los del modelo original y no fueron evaluados en calidad multimodal. Se entreno con prediccion de siguiente token sobre texto fuente, sin notas de estudio ni trayectorias de solucion como objetivos, y con una regularizacion KL de 0,01 contra el modelo base sobre un pool de repeticion congelado.

Este checkpoint es relevante como artefacto de investigacion reproducible: el autor publica provenance completa (`training_summary.json`, `artifact_manifest.json`), dos revisiones (final de epoca 1 y final de epoca 2), receta de entrenamiento detallada y registro de W&B. El autor declara explicitamente que el modelo no ha sido evaluado en ningun benchmark; las cifras disponibles son unicamente perdidas de entrenamiento y validacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `qwen3_5` (hereda la del base Qwen3.5-9B); solo se ajustan los tensores de lenguaje |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en el export de serving) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje afinados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` y aplica un ajuste fino completo (full fine-tune) sobre los pesos de lenguaje, manteniendo intactos los componentes de vision del base. El entrenamiento es de prediccion de siguiente token (NTP) sobre filas empaquetadas de 17.408 tokens (una fila por GPU), durante 2 epocas, con learning rate 5e-06, decaimiento coseno y 3% de warmup. Se anade una regularizacion KL de 0,01 entre el base y el estudiante sobre un pool de repeticion congelado de trayectorias Equational generadas por el base; ese pool nunca actua como objetivo. El entrenamiento se ejecuto en 8 x GH200, 5.740 pasos de optimizador, 486 minutos, en el job Slurm 1149065 de TACC Vista, iniciado el 2026-11-17.

El conjunto de entrenamiento son las devoluciones con contenido de las herramientas `read`, `glob` y `grep` que el base Qwen3.5-9B recibio mientras exploraba el corpus de estudio Equational para redactar notas, en las rondas R9 a R14 (409.922 sesiones, 751,6 M tokens de texto devuelto en total). Cada devolucion es un ejemplo: una cabecera que nombra la llamada (por ejemplo `read relations/dualities/Eq4463-Eq4503/proof.md lines 1-22 of 22`) como entrada, seguida del texto devuelto y un token de fin de texto con perdida. No se incluyen el texto propio del modelo, los prompts de tarea ni las devoluciones de las herramientas de notas. El run concreto usa 350.011.229 tokens de perdida provenientes de 1.588.123 devoluciones de 190.071 sesiones (317.860.150 tokens de `read`, 31.414.801 de `glob`, 736.278 de `grep`; 22.958 filas empaquetadas por epoca). Contando cada texto devuelto distinto una sola vez quedan 18.354.017 de los 348.423.106 tokens de contenido (5%). El corpus se construyo con las preguntas del benchmark excluidas: el informe de separacion (estado PASS; pares ordenados exactos, 1.100 objetivos de evaluacion) registra que ninguna implicacion protegida aparece en las implicaciones probadas, en el indice de no implicaciones ni en el texto fuente retenido.

Las perdidas reportadas son: epoca 1 (`checkpoint-2870`), perdida media de entrenamiento 0,025, perdida held-out sobre las notas de estudio originales 1,167 (base: 1,245), sobre trayectorias del base 0,145 (base: 0,145), KL 0,007; epoca 2 (`checkpoint-5740`, `main`), perdida media de entrenamiento 0,001, held-out sobre notas 1,230, sobre trayectorias 0,145, KL 0,005. El autor advierte que el conjunto held-out no contiene texto fuente de este run, por lo que ninguna cifra mide el ajuste a texto fuente no visto, y que la perdida de entrenamiento de la epoca 2 es sobre texto ya visto en la epoca 1.

## Capacidades

- Generacion de texto autoregresiva (next-token prediction) sobre el modelo base Qwen3.5-9B.
- Procesamiento de entradas imagen-texto a texto a nivel de arquitectura (pipeline `image-text-to-text`), aunque los componentes de vision son los del base y no fueron evaluados en calidad multimodal.
- Internalizacion del corpus de estudio Equational a partir de observaciones de lectura de herramientas.
- Conversacional: la model card incluye config, tokenizer, chat template y procesadores completos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (thinking mode, audio, vision evaluada): no disponibles; el autor indica que el modelo no ha sido evaluado.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento: el modelo sirve para estudiar si un ajuste fino sobre observaciones de lectura (sin notas ni trayectorias) transfiere conocimiento del corpus Equational; se compararia contra el base y contra variantes de la misma receta.
- Reproducibilidad de experimentos: con `training_summary.json`, `artifact_manifest.json`, la receta y el registro de W&B, se puede replicar el run `obs350m` y auditar cada tensor y fichero.
- Estudio de regularizacion KL: el checkpoint permite analizar el efecto de la KL de 0,01 contra el base sobre un pool de repeticion congelado, comparando epoca 1 (KL 0,007) y epoca 2 (KL 0,005).
- Analisis de olvido catastrófico: las perdidas held-out sobre notas de estudio (1,167 en epoca 1 frente a 1,230 en epoca 2, con base en 1,245) permiten estudiar el deterioro del ajuste al alargar el entrenamiento.
- Generacion de texto sobre dominios tecnicos con estructura de fichero: el formato de entrenamiento (cabecera de llamada + texto devuelto) es adecuado para tareas de continuacion de contenido documental con metadatos de origen.
- Base para posteriores ajustes: al ser un full fine-tune con licencia Apache 2.0, puede servir como punto de partida para experimentos derivados, siempre que se validen antes las capacidades del base que se hayan podido degradar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que ninguna revision del modelo ha sido puntuada en ningun benchmark y que las cifras publicadas son unicamente perdidas de entrenamiento y validacion:

| Metrica | Base Qwen3.5-9B | Epoca 1 (`checkpoint-2870`) | Epoca 2 (`checkpoint-5740`, `main`) |
|---|---|---|---|
| Perdida media de entrenamiento (texto fuente del run) | no aplica | 0,025 | 0,001 |
| Perdida held-out sobre notas de estudio originales | 1,245 | 1,167 | 1,230 |
| Perdida held-out sobre trayectorias del base | 0,145 | 0,145 | 0,145 |
| KL(base \|\| student) en el pool de validacion de repeticion | no aplica | 0,007 | 0,005 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud para un modelo denso de 9,65 B en safetensors, los pesos en bf16 ocuparian aproximadamente 19,3 GB, pero el autor no publica requisitos ni cuantizaciones.
- GPU recomendadas: el entrenamiento se realizo en 8 x GH200; no se especifican GPU recomendadas para inferencia.
- Compatibilidad con GPU de consumo: no disponible; el repo solo publica safetensors (38,6 GB de tamano de repo), sin versiones GGUF ni cuantizadas.
- Opciones de despliegue: la model card solo documenta carga con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor` con `dtype="auto"` y `device_map="auto"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-350m-kl-0p01 | 9,65 B | no disponible | no evaluado en benchmarks; solo perdidas de entrenamiento/validacion | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | 9 B (aprox.) | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Hugging Face (modelo base referenciado) |
| U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-350m-kl-0p01 (revision `epoch-1`) | 9,65 B | no disponible | perdida held-out sobre notas 1,167; KL 0,007 | apache-2.0 | Rama `epoch-1` del mismo repo |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El autor declara que el modelo no ha sido evaluado: no hay resultados de benchmarks, por lo que no se puede afirmar nada sobre su calidad en tareas reales.
- Las perdidas held-out no miden el ajuste a texto fuente no visto: el conjunto de validacion no contiene texto fuente de este run y la perdida de entrenamiento de la epoca 2 es sobre texto ya visto en la epoca 1.
- Los componentes de vision son los del modelo base y no fueron evaluados en calidad multimodal; el pipeline `image-text-to-text` no implica que el ajuste haya mejorado esa capacidad.
- El entrenamiento se limita a texto fuente devuelto por herramientas de lectura, sin notas ni trayectorias de solucion como objetivos; el modelo puede no haber adquirido la capacidad de resolver tareas del dominio Equational.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; el autor no publica evaluaciones al respecto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan disponibles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-9B antes de un despliegue en produccion.
- Caveat de produccion: el repositorio tiene 0 descargas y 0 likes, y el modelo esta pensado como artefacto de investigacion; no se recomienda su uso en produccion sin una evaluacion previa.
- El conjunto de datos se construyo con las preguntas del benchmark excluidas (informe de separacion PASS), pero el autor senala que las leyes equivalentes y las tablas compartidas permanecen por diseno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-350m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqobs350m20261117
- Receta y registro del run: `recipe/equational_internalization/experiments/observations_study_materials_ntp_kl_vista_20261117/README.md` en el repositorio del proyecto (no se proporciona URL directa)
