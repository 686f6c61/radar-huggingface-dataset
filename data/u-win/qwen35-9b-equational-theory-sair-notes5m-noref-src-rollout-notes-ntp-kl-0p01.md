# U-WIN/qwen35-9b-equational-theory-sair-notes5m-noref-src-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-notes5m-noref-src-rollout-notes-ntp-kl-0p01` es un ajuste fino completo del modelo base Qwen/Qwen3.5-9B, desarrollado por el grupo U-WIN en el marco de su trabajo de internalizacion de teoria ecuacional (equational theory). El checkpoint corresponde al experimento `rollout_notes_noref_sources_vista_20261116` (noviembre de 2026) y su nombre describe el conjunto de datos de entrenamiento, no el numero de parametros: 5 millones de tokens de notas de estudio mas 5,1 millones de tokens de notas de rollout sin solucion de referencia.

El problema que aborda es la internalizacion de conocimiento matematico estructurado (leyes ecuacionales, implicaciones demostradas en Lean, dualidades) en un modelo de lenguaje multimodal, mediante entrenamiento de prediccion del siguiente token sobre notas autogeneradas por el propio modelo base. El modelo conserva la arquitectura y los componentes de vision del Qwen3.5-9B original; solo se ajustaron los pesos de texto.

Es relevante como caso de estudio metodologico: documenta de forma inusualmente transparente el proceso de ajuste fino con regularizacion KL, el origen de los datos (notas generadas por el modelo base a partir de fuentes de estudio, sin referencia de veredicto correcto) y las limitaciones conocidas del conjunto de datos (aproximadamente 14% de notas con veredicto erroneo). No se ha evaluado en ningun benchmark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-9B; pesos de texto ajustados, vision sin modificar |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo (full fine-tune) sobre prediccion del siguiente token. El entrenamiento uso filas empaquetadas de 17.408 tokens (una fila por GPU), 2 epocas, tasa de aprendizaje 5e-06 con decaimiento coseno y 3% de warmup, mas una regularizacion KL de coeficiente 0,01 entre el modelo base congelado y el estudiante sobre un pool de repeticion de trayectorias Equational generadas por el base (solo regularizacion, nunca como objetivo). Se ejecuto en 8 GPU GH200, 150 pasos del optimizador, 37 minutos de entrenamiento, en el job Slurm 1147838 de TACC Vista, iniciado el 2026-11-16.

Los datos de entrenamiento suman 10.072.105 tokens y combinan dos fuentes: (1) una porcion de 5 millones de tokens de las notas de estudio del modelo base (8.416 notas, 4.999.877 tokens, prefijo de nota completa del orden sembrado de `notes_ntp_kl_20261012`), y (2) notas de rollout generadas por el Qwen3.5-9B base al revisar sus propios intentos de solucion puntuados, sin solucion de referencia pero con las fuentes de estudio de teoria ecuacional. Para cada una de 5.610 implicaciones de entrenamiento (2.182 verdaderas, 3.428 falsas, ninguna igual a las 205 preguntas de evaluacion) el modelo base escribio una nota por problema, eligiendo que abrir (lectura, glob, grep; maximo 20 respuestas); se generaron 5.602 notas con 5.072.228 tokens (mediana de 871 tokens por nota). Ninguna nota fue verificada contra el veredicto correcto: aproximadamente el 14% concluye solo el veredicto erroneo y una comprobacion exacta encuentra contraejemplo valido en 674 de las 3.421 notas sobre problemas falsos (cota inferior).

## Capacidades

- Generacion de texto y prediccion del siguiente token sobre pesos ajustados de Qwen3.5-9B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque los componentes de vision son los del modelo base y no fueron evaluados para calidad multimodal.
- Razonamiento sobre teoria ecuacional: leyes, implicaciones demostradas, dualidades y conceptos de fundamentos, inducido a partir de las notas de estudio.
- Lectura y escritura de notas de estudio en formato libre, con operaciones de lectura, glob y grep documentadas en el proceso de generacion de datos.
- Conversacional: la model card indica el tag `conversational` y el repositorio incluye plantilla de chat y procesadores.
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas como capacidad evaluada; el proceso de generacion de notas implico seleccion de fuentes, pero no se ha medido su rendimiento agentico.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre internalizacion de conocimiento matematico: el modelo sirve como artefacto de estudio para analizar como un ajuste fino sobre notas autogeneradas modifica la distribucion del modelo base, comparando las perdidas de validacion (0,352 frente a 1,245 del base en notas de estudio originales).
- Experimentos de destilacion con regularizacion KL: el checkpoint permite reproducir o variar la receta (coeficiente KL, epocas, mezcla de datos) y medir el efecto sobre la divergencia KL en el pool de repeticion (0,057 en la epoca 2).
- Generacion de notas tecnicas sobre teoria ecuacional: dado un conjunto de fuentes de estudio, el modelo puede producir notas en formato libre con citas a leyes y demostraciones, util como borrador para revision humana.
- Analisis de fallos y sesgos en datos sinteticos: al conocerse que aproximadamente el 14% de las notas de entrenamiento concluyen el veredicto erroneo, el modelo es util para estudiar como se propaga ese ruido a las salidas.
- Base para ajustes posteriores en dominios matematicos formales: al conservar la licencia Apache 2.0 y el formato transformers, puede reutilizarse como punto de partida para fine-tunes con datos verificados.
- Evaluacion comparativa de checkpoints intermedios: las revisiones `epoch-1` (checkpoint-75) y `main`/`epoch-2` (checkpoint-150) permiten estudiar la evolucion de la perdida y la KL entre epocas.
- Despliegue experimental en pipelines de investigacion: compatible con `transformers` y endpoints, con carga mediante `AutoModelForImageTextToText` y `AutoProcessor`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que ninguna revision ha sido puntuada en ningun benchmark; solo se reportan perdidas de entrenamiento y validacion.

| Metrica | Epoca 1 (`epoch-1`, checkpoint-75) | Epoca 2 (`main`, checkpoint-150) | Modelo base |
|---|---|---|---|
| Perdida media de entrenamiento (todas las notas) | 0,597 | 0,426 | no disponible |
| Perdida en held-out sobre notas de estudio originales | 0,360 | 0,352 | 1,245 |
| Perdida en held-out sobre trayectorias del modelo base | 0,131 | 0,128 | 0,145 |
| KL(base \|\| student) en el pool de validacion de repeticion | 0,065 | 0,057 | no aplica |

El conjunto held-out es el conjunto de validacion congelado de la receta (notas de estudio originales y trayectorias del modelo base); no contiene notas de rollout, por lo que ninguna cifra mide el ajuste a notas de rollout no vistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9.653 millones de parametros, en precision bf16/fp16 se requieren aproximadamente 19,3 GB solo para pesos, mas memoria para cache KV y activaciones.
- GPU recomendadas: no disponible en la informacion proporcionada; el entrenamiento se realizo en 8 GPU GH200.
- Cabeza en GPU de consumo: no confirmado; por tamano de pesos en bf16 (unos 19,3 GB) no cabe en GPU de consumo de 8-12 GB sin cuantizacion, y requeriria cuantizacion para tarjetas de 16-24 GB.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (segun la model card); compatibilidad con endpoints. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-notes5m-noref-src-rollout-notes-ntp-kl-0p01 | 9.653.104.368 | no disponible | apache-2.0 | Hugging Face, 0 descargas | Fine-tune de Qwen3.5-9B, sin evaluacion en benchmarks |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Base del ajuste fino; perdida held-out en notas de estudio 1,245 |
| Alternativas de 9B de proposito general | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Modelo sin evaluar: ninguna revision ha sido puntuada en benchmarks; las unicas cifras son perdidas de entrenamiento y validacion.
- Ruido en los datos de entrenamiento: aproximadamente el 14% de las notas de rollout concluyen solo el veredicto erroneo, y una comprobacion exacta encuentra contraejemplo valido en 674 de las 3.421 notas sobre problemas falsos (cota inferior). El modelo puede reproducir esos errores.
- Las notas de rollout no se publican, lo que limita la reproducibilidad completa del conjunto de datos.
- El held-out no contiene notas de rollout, por lo que no hay medida del ajuste a notas de rollout no vistas.
- Componentes de vision sin modificar y no evaluados para calidad multimodal; el tag `image-text-to-text` no implica rendimiento verificado en vision.
- Idiomas soportados no disponibles; no se documenta comportamiento multilingue.
- Longitud de contexto no disponible; no se debe asumir la del modelo base sin verificar la configuracion incluida.
- Riesgo de alucinacion: no cuantificado en la informacion; el dominio (teoria ecuacional con demostraciones en Lean) es propenso a errores sutiles en afirmaciones formales.
- Sesgos conocidos: no documentados; el conjunto de datos se limita a 5.610 implicaciones de un dominio especifico y no representa distribuciones generales.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base.
- Uso en produccion: no recomendado como modelo de proposito general sin evaluacion previa; adecuado principalmente para investigacion.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes5m-noref-src-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefsrcn5mr20261116
- Codigo, prompts y registro de ejecucion: `recipe/equational_internalization/experiments/rollout_notes_noref_sources_vista_20261116/README.md` en el repositorio del proyecto (no se proporciona URL directa).
