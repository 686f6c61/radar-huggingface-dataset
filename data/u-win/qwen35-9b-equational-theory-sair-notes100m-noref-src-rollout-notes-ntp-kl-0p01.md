# U-WIN/qwen35-9b-equational-theory-sair-notes100m-noref-src-rollout-notes-ntp-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-notes100m-noref-src-rollout-notes-ntp-kl-0p01` es un ajuste fino completo del modelo base Qwen/Qwen3.5-9B, desarrollado por el equipo U-WIN en el marco de su trabajo de internalización de teoría ecuacional. El nombre describe el conjunto de datos de entrenamiento, no el número de parámetros: el checkpoint contiene 9.653.104.368 parámetros. El modelo conserva la arquitectura multimodal image-text-to-text del Qwen3.5-9B original, aunque el ajuste solo afectó a los pesos de lenguaje (427 tensores fine-tuned frente a 348 tensores base sin cambios).

El objetivo del experimento es que el modelo aprenda a razonar sobre implicaciones en teoría ecuacional a partir de notas de estudio y de "notas de rollout" generadas por el propio modelo base. Se entrenó con predicción del siguiente token sobre 105.072.434 tokens (100 millones de notas de estudio más 5,1 millones de notas de rollout), con una regularización KL de 0,01 respecto al modelo base. Es un checkpoint de investigación interna: no ha sido evaluado en ningún benchmark publicado y las notas de entrenamiento no se han publicado.

La relevancia es acotada: se trata de un artefacto de experimentación sobre internalización de conocimiento y autoentrenamiento con datos generados por el propio modelo, no de un modelo de propósito general listo para producción. Su licencia Apache 2.0 y su compatibilidad con `transformers` y endpoints permiten reproducir el experimento o estudiar el efecto del ajuste sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; pesos de lenguaje ajustados, componentes de visión sin cambios |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en precisión de exportación de servicio) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (427 tensores de lenguaje fine-tuned + 348 tensores base sin cambios); incluye config, tokenizer, chat template y processors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo (full fine-tune) con predicción del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU). El entrenamiento duró 2 épocas con tasa de aprendizaje 5e-06, decaimiento coseno y 3 % de warmup, sobre 8 GPU GH200, 1.546 pasos de optimizador y 150 minutos, en el clúster TACC Vista (job Slurm 1147835). Se añadió una regularización KL de 0,01 entre el modelo base y el estudiante sobre un pool de repetición congelado de trayectorias generadas por el base, usada solo como regularización y nunca como objetivo.

Los datos son 105.072.434 tokens en total (6.181 filas empaquetadas por época): 100.000.206 tokens de notas de estudio del modelo base (167.705 notas) más 5.072.228 tokens de notas de rollout (5.602 notas, mediana de 871 tokens por nota). Las notas de rollout las escribió el propio Qwen3.5-9B base revisando sus intentos de solución calificados, sin solución de referencia pero con las fuentes de estudio de teoría ecuacional (páginas de leyes, implicaciones demostradas con pruebas en Lean, dualidades, fundamentos y métodos). Cada sesión permitía leer, glob y grep con un máximo de 20 respuestas. Un análisis por expresiones regulares indica que alrededor del 14 % de las notas concluyen solo el veredicto incorrecto, la mayoría en problemas FALSO entre leyes de orden superior, y en 674 de las 3.421 notas sobre problemas FALSO se encuentra un contraejemplo válido (cota inferior). Aproximadamente el 12 % de las notas mencionan al juez. Las notas no se publican.

Las pérdidas de validación al final de la época 2 son 0,276 sobre las notas de estudio originales (base: 1,245) y 0,126 sobre trayectorias del modelo base (base: 0,145); la KL(base || student) sobre el pool de validación es 0,034. La pérdida media de entrenamiento por época fue 0,342 en la época 1 y 0,267 en la época 2. El conjunto de validación no contiene notas de rollout, por lo que ninguna métrica mide el ajuste a notas de rollout no vistas.

## Capacidades

- Generación de texto y razonamiento de siguiente token sobre el dominio de teoría ecuacional, con énfasis en implicaciones entre leyes.
- Procesamiento multimodal image-text-to-text heredado del Qwen3.5-9B base, aunque los componentes de visión no se evaluaron para calidad multimodal.
- Conversación multi-turno mediante la chat template incluida en el repositorio.
- Escritura de notas de estudio y análisis de fuentes documentales (leyes, pruebas en Lean, dualidades, fundamentos).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de pensamiento en la información disponible.

## Casos de uso

- Reproducción de experimentos de internalización de conocimiento: cargar el checkpoint `main` o `epoch-1` y comparar pérdidas de validación y comportamiento frente al Qwen3.5-9B base para estudiar cómo el ajuste desplaza la distribución sobre el dominio ecuacional.
- Investigación sobre autoentrenamiento con datos generados por el propio modelo: analizar el efecto de entrenar con notas de rollout sin referencia y con regularización KL, usando las métricas de pérdida y KL documentadas como referencia.
- Estudio de sesgos de veredicto en razonamiento matemático: dado que alrededor del 14 % de las notas de entrenamiento concluyen el veredicto incorrecto, el modelo sirve como caso de estudio para medir cómo se propaga ese ruido en un ajuste fino.
- Generación asistida de notas de estudio en teoría ecuacional: el modelo puede redactar notas que resuman leyes, dualidades y pruebas, útil como borrador para revisión humana en un contexto de investigación.
- Evaluación de pipelines de datos sintéticos: comparar la calidad de notas de rollout generadas con y sin fuentes de estudio, usando el checkpoint como punto de partida para nuevos ciclos.
- Despliegue experimental en entornos de investigación con `transformers` y `device_map="auto"`, por ejemplo para generar trayectorias de razonamiento que alimenten un juez automático.
- Análisis multimodal exploratorio: al conservar los componentes de visión del base, permite probar entradas image-text-to-text, aunque sin garantías de calidad multimodal por falta de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el modelo no ha sido evaluado en ningún benchmark y que las cifras aportadas son únicamente pérdidas de entrenamiento y validación:

| Metrica | Epoca 1 (`epoch-1`) | Epoca 2 (`main`) | Base |
|---|---|---|---|
| Checkpoint | `checkpoint-773` | `checkpoint-1546` | — |
| Pérdida media de entrenamiento (por época) | 0,342 | 0,267 | — |
| Pérdida de validación en notas de estudio originales | 0,284 | 0,276 | 1,245 |
| Pérdida de validación en trayectorias del base | 0,127 | 0,126 | 0,145 |
| KL(base \|\| student) en pool de validación | 0,039 | 0,034 | — |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo denso de 9,65 mil millones de parámetros en bf16 requiere aproximadamente 19-20 GB solo para pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits rondaría 10-11 GB y en 4 bits unos 5-6 GB, aunque el repositorio no publica versiones cuantizadas.
- GPU recomendadas: el entrenamiento se realizó en 8 x GH200. Para inferencia no se documentan GPU concretas; por tamaño, cabría en A100 40/80 GB, H100 y RTX 4090 (24 GB) en bf16 con margen ajustado.
- Cabe en GPU de consumo: probablemente en RTX 4090 (24 GB) en bf16 para contexto corto, y en GPUs de 16 GB solo con cuantización, aunque no hay confirmación del autor.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (documentado en la model card). No se documentan vLLM, llama.cpp, Ollama ni TGI para este checkpoint; al no haber pesos GGUF publicados, llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-notes100m-noref-src-rollout-notes-ntp-kl-0p01 | 9,65 B | No disponible | Sin benchmarks; solo pérdidas de validación | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (base) | 9 B (aproximado, según nombre) | No disponible | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |
| Otros ajustes finos de Qwen3.5-9B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- No evaluado: ninguna revisión del modelo ha sido puntuada en benchmarks; las cifras publicadas son pérdidas, no métricas de calidad.
- Datos de entrenamiento ruidosos: alrededor del 14 % de las notas de rollout concluyen solo el veredicto incorrecto, la mayoría en problemas FALSO entre leyes de orden superior, y en 674 de 3.421 notas sobre problemas FALSO se detecta un contraejemplo válido; este ruido puede propagarse al modelo.
- Las notas de entrenamiento no se publican, lo que limita la reproducibilidad completa del experimento.
- El conjunto de validación no incluye notas de rollout, por lo que no hay medida del ajuste a notas de rollout no vistas.
- Componentes de visión sin evaluar: los pesos multimodales son los del base y no se ha medido su calidad tras el ajuste.
- Sesgos conocidos: no documentados en la información disponible, más allá del sesgo hacia veredictos incorrectos en el dominio de entrenamiento.
- Riesgo de alucinación: no cuantificado; en un dominio de demostración formal, la ausencia de evaluación específica impide descartar conclusiones incorrectas.
- Idiomas soportados: no disponibles; el modelo base es multilingüe, pero no se documenta el efecto del ajuste sobre idiomas distintos del inglés.
- Longitud de contexto: no disponible; el entrenamiento usó filas de 17.408 tokens, pero no se especifica la ventana de contexto efectiva del modelo.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint de investigación sin evaluación, su uso en producción conlleva riesgo no cuantificado.
- Fecha de creación en el repositorio (2026-11-17) y nomenclatura del experimento indican un artefacto de investigación interna, no un modelo mantenido para uso general.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes100m-noref-src-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefsrcn100mr20261116
- Repositorio del proyecto (referenciado como `recipe/equational_internalization/experiments/rollout_notes_noref_sources_vista_20261116/README.md`): no disponible como URL pública en la información proporcionada.
