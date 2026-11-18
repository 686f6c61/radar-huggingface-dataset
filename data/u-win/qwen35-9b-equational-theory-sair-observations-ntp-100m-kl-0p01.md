# U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-100m-kl-0p01

## Resumen

El modelo `U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-100m-kl-0p01` es un ajuste fino completo del modelo base Qwen3.5-9B, desarrollado por el equipo U-WIN en el marco de su trabajo de internalización de teoría ecuacional (equational-theory internalization). Se trata de un checkpoint experimental (run `obs100m`, experimento `observations_study_materials_ntp_kl_vista_20261117`) entrenado sobre texto fuente: concretamente, las salidas de las herramientas de lectura (`read`, `glob`, `grep`) que el modelo base Qwen3.5-9B recibió mientras exploraba un corpus de estudio de teoría ecuacional para redactar notas. El nombre hace referencia al volumen de datos de entrenamiento (100M tokens de observaciones), no al número de parámetros.

El modelo no ha sido evaluado en ningún benchmark: la propia model card indica explícitamente "Not evaluated". Los únicos números publicados son pérdidas de entrenamiento y validación. Su interés es, por tanto, de investigación: documenta un experimento de destilación de observaciones de exploración mediante predicción del siguiente token (NTP) con regularización KL contra el modelo base, con el objetivo declarado de que el modelo internalice el conocimiento del corpus sin recibir como objetivo notas de estudio ni trayectorias de solución.

Arquitectura transformer multimodal (pipeline `image-text-to-text`, familia Qwen3.5) con 9.653.104.368 parámetros totales. Los pesos de texto fueron ajustados; los componentes de visión son los del modelo base y no se evaluaron para calidad multimodal. Licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Qwen3.5, `qwen3_5`), pipeline `image-text-to-text` |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B; no especificada en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el repo contiene safetensors en precision completa; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B` (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y aplica un ajuste fino completo (full fine-tune) con predicción del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU). El conjunto de entrenamiento son las devoluciones con contenido de las herramientas `read`, `glob` y `grep` que el modelo base recibió durante sus sesiones de exploración del corpus de estudio de teoría ecuacional (rondas R9 a R14 de la colección de notas). Cada ejemplo consta de una cabecera que nombra la llamada (por ejemplo, `read relations/dualities/Eq4463-Eq4503/proof.md lines 1-22 of 22`) como entrada y, a continuación, el texto devuelto más un token de fin de texto con pérdida. No se usaron notas de estudio ni trayectorias de solución como objetivos de entrenamiento.

La receta concreta: 100.000.103 tokens de pérdida procedentes de 451.893 devoluciones de 54.111 sesiones (90.724.964 tokens de `read`, 9.033.343 de `glob`, 241.796 de `grep`; 6.564 filas empaquetadas por época), 2 épocas, learning rate 5e-06 con decaimiento coseno y 3% de warmup, más un término de regularización 0.01 × KL(base || student) sobre un pool de repetición congelado de trayectorias generadas por el modelo base (solo regularización, nunca objetivo). Entrenamiento en 8 × GH200, 1.642 pasos del optimizador, 161 minutos, job Slurm 1149066 en TACC Vista, iniciado el 2026-11-17. El corpus se construyó con las preguntas de benchmark excluidas: el informe de separación (estado PASS; pares ordenados exactos, 1.100 objetivos de evaluación) registra que ninguna implicación protegida aparece en las implicaciones demostradas, en el índice de no-implicaciones ni nombrada en el texto fuente retenido; las leyes equivalentes y tablas compartidas se mantienen por diseño.

Las pérdidas publicadas: época 1 (checkpoint-821) con pérdida media de entrenamiento 0,058, pérdida held-out sobre las notas de estudio originales 1,181 y sobre trayectorias del modelo base 0,146, KL 0,008; época 2 (checkpoint-1642, `main`) con pérdida media de entrenamiento 0,003, held-out sobre notas 1,210, sobre trayectorias 0,146, KL 0,007. El modelo base registra 1,245 y 0,145 respectivamente en esos mismos conjuntos. El conjunto held-out no contiene texto fuente de este run, por lo que ninguna de estas cifras mide el ajuste a texto fuente no visto.

## Capacidades

- Generación de texto y predicción del siguiente token sobre texto fuente de tipo documental y de exploración de corpus.
- Procesamiento multimodal imagen-texto por herencia del modelo base Qwen3.5-9B (componentes de visión sin ajustar y sin evaluar).
- Conversación: el repositorio incluye plantilla de chat y procesadores completos, con tag `conversational`.
- Compatibilidad con endpoints (`endpoints_compatible`).
- No se documenta soporte específico de tool calling, function calling, agentes, modo thinking, audio ni capacidades multilingües verificadas.
- Capacidad declarada de internalización de conocimiento del corpus de teoría ecuacional: no evaluada, sin benchmark que la respalde.

## Casos de uso

- Investigación sobre internalización de conocimiento: usar el checkpoint para estudiar si el ajuste NTP sobre observaciones de herramientas transfiere conocimiento del corpus de teoría ecuacional sin entrenar sobre notas ni soluciones; el par de checkpoints (`epoch-1`, `epoch-2`) permite comparar dinámica de entrenamiento.
- Reproducción de experimentos de regularización KL: el modelo sirve como referencia para replicar la receta 0.01 × KL(base || student) sobre pools de repetición congelados en otros dominios.
- Estudio de destilación de observaciones de agentes: analizar cómo se comporta un modelo entrenado únicamente con las devoluciones de `read`/`glob`/`grep` frente al modelo base en tareas de lectura y extracción de documentos.
- Baseline para evaluación de olvido catastrófico: comparar las pérdidas held-out publicadas (notas de estudio y trayectorias del modelo base) con las de nuevos ajustes para medir deriva respecto al base.
- Generación de texto asistida en dominios documentales: prototipado de respuestas sobre pasajes de documentación técnica, asumiendo que no hay garantía de calidad por la ausencia de evaluación.
- Investigación multimodal exploratoria: aprovechar la arquitectura image-text-to-text heredada para experimentos que combinen texto e imagen, con la advertencia de que los componentes de visión no fueron evaluados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente "Not evaluated" y solo reporta pérdidas de entrenamiento y validación:

| Metrica | Base Qwen3.5-9B | epoch-1 (checkpoint-821) | epoch-2 / main (checkpoint-1642) |
|---|---|---|---|
| Pérdida media de entrenamiento (texto fuente del run) | no aplica | 0,058 | 0,003 |
| Pérdida held-out en notas de estudio originales | 1,245 | 1,181 | 1,210 |
| Pérdida held-out en trayectorias del modelo base | 0,145 | 0,146 | 0,146 |
| KL(base \|\| student) en pool de validación | no aplica | 0,008 | 0,007 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 9.653.104.368 parámetros, en FP16/BF16 se requieren aproximadamente 19,3 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 9,7 GB y en 4 bits unos 4,8 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 8 × GH200; para inferencia se requieren GPU con al menos 24 GB para FP16 (por ejemplo, RTX 4090, A10G, L40S) o A100/H100 para mayor throughput y contexto largo.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) en FP16 con contexto moderado, y en GPUs de 12-16 GB solo con cuantización, que no está publicada en el repositorio.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (única vía documentada); el tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-100m-kl-0p01 | 9.653.104.368 | no disponible | ninguna (solo pérdidas) | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ~9,6B | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |
| Alternativas de ~9B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmark de este modelo ni del base en la informacion proporcionada, por lo que la comparación de rendimiento no es posible.

## Limitaciones y advertencias

- Modelo no evaluado: no hay ningún benchmark puntuado; las únicas métricas son pérdidas de entrenamiento y validación, y el held-out no contiene texto fuente de este run, por lo que no mide generalización a texto fuente no visto.
- El objetivo de entrenamiento es texto fuente de un corpus muy específico (teoría ecuacional); el comportamiento fuera de ese dominio no está caracterizado.
- Los componentes de visión son los del modelo base y no se evaluaron para calidad multimodal; no debe asumirse paridad con Qwen3.5-9B en tareas imagen-texto.
- Riesgo de sobreajuste al formato de las devoluciones de herramientas: las cabeceras de llamada (`read ... lines 1-22 of 22`) son entrada durante el entrenamiento, lo que puede inducir sesgos de formato en la generación.
- Sesgos conocidos: no documentados; se heredan los del modelo base, no auditados en esta ficha.
- Riesgo de alucinación: no medido; sin evaluación, no hay garantía de fidelidad factual en dominios de teoría ecuacional ni fuera de ellos.
- Idiomas soportados: no disponibles; no se documenta cobertura multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación propia.
- Repositorio con 0 descargas y 0 likes; ecosistema de uso nulo y sin issues reportados.
- Longitud de contexto no especificada en la información disponible; debe consultarse la configuración del repositorio antes de planificar cargas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-100m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqobs100m20261117
- Receta y registro del run: `recipe/equational_internalization/experiments/observations_study_materials_ntp_kl_vista_20261117/README.md` en el repositorio del proyecto (no se proporciona URL directa)
