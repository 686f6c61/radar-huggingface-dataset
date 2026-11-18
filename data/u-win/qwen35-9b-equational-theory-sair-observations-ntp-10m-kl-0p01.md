# U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-10m-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-observations-ntp-10m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen3.5-9B desarrollado por el grupo U-WIN en el marco de su trabajo de internalización de teoría ecuacional. El modelo parte de los pesos liberados de Qwen/Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y se entrena mediante next-token prediction sobre texto fuente: concretamente, las salidas de las herramientas de lectura (`read`, `glob`, `grep`) que el modelo base generó mientras exploraba un corpus de estudio de teoría ecuacional para redactar notas. No se entrenó sobre notas de estudio ni sobre trayectorias de solución, sino únicamente sobre el texto devuelto por dichas herramientas.

El checkpoint contiene 9.653.104.368 parámetros reales (según los safetensors) y se distribuye en formato safetensors con un tamaño de repositorio de 38,6 GB. La arquitectura subyacente es la de Qwen3.5-9B, un transformer multimodal con pipeline `image-text-to-text`, aunque el ajuste fino solo afectó a los tensores de lenguaje: 427 tensores finos ajustados y 348 tensores base sin modificar, con los componentes de visión heredados del modelo base y no evaluados. El entrenamiento se realizó en 8 GPU GH200 durante 39 minutos (164 pasos de optimización) sobre TACC Vista, con una receta de 2 épocas, learning rate 5e-06, decaimiento coseno con 3% de warmup y una regularización KL de 0,01 respecto al modelo base sobre un pool de repetición congelado.

La relevancia de este checkpoint es fundamentalmente experimental: forma parte de un estudio controlado sobre cómo se internaliza conocimiento estructurado (teoría ecuacional) a partir de observaciones de herramientas, con un diseño de datos cuidadosamente documentado y con las preguntas de evaluación separadas del corpus. No obstante, el propio autor declara explícitamente que el modelo **no ha sido evaluado** en ningún benchmark; las cifras publicadas son únicamente pérdidas de entrenamiento y validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de Qwen3.5-9B (pipeline `image-text-to-text`); ajuste fino solo sobre tensores de lenguaje |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen safetensors; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje finos ajustados + 348 tensores base sin modificar) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-9B, un transformer multimodal con componentes de visión y de lenguaje. El ajuste fino es de modelo completo (full fine-tune) y afecta exclusivamente a los tensores de lenguaje; los componentes de visión son los del modelo base y el autor indica que no se evaluó su calidad multimodal. La inicialización parte de la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base liberado.

El entrenamiento consiste en next-token prediction sobre filas empaquetadas de 17.408 tokens (una fila por GPU), durante 2 épocas, con learning rate 5e-06, decaimiento coseno y 3% de warmup, más una regularización KL de 0,01 entre el modelo base y el estudiante sobre un pool de repetición congelado de trayectorias ecuacionales generadas por el base (usado solo como regularización, nunca como objetivo). El conjunto de este run contiene 9.999.944 tokens de pérdida procedentes de 44.629 retornos de 5.410 sesiones (9.128.591 tokens de `read`, 855.231 de `glob` y 16.122 de `grep`; 656 filas empaquetadas por época). Cada retorno se conserva tantas veces como ocurrió, de modo que una página leída por muchas sesiones aparece repetidas veces. Contando cada texto distinto una sola vez quedan 6.478.192 de los 9.955.315 tokens de contenido (65%). El corpus se construyó con las preguntas del benchmark excluidas: el informe de separación (estado PASS, 1.100 objetivos de evaluación) registra que ninguna implicación protegida aparece en las implicaciones demostradas, en el índice de no-implicaciones ni nombrada en el texto fuente retenido; las leyes equivalentes y las tablas compartidas se mantienen por diseño. El entrenamiento se ejecutó en 8 GPU GH200 (164 pasos, 39 minutos, job Slurm 1149068 en TACC Vista, iniciado el 2026-11-17).

## Capacidades

- Generación de texto y modelado de lenguaje: next-token prediction sobre texto fuente, con especialización en la reproducción de retornos de herramientas de lectura (`read`, `glob`, `grep`) del dominio de teoría ecuacional.
- Comprensión de texto estructurado de tipo técnico: páginas de proof, relaciones, dualidades y material de estudio del corpus de teoría ecuacional.
- Capacidad multimodal heredada del modelo base (pipeline `image-text-to-text`), aunque los componentes de visión no fueron ajustados ni evaluados.
- Soporte de conversación: el repositorio incluye chat template y processors del modelo base.
- Tool calling / function calling: no se documenta explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no se documentan ni se evalúan; el modelo se entrenó sobre observaciones, no sobre trayectorias de solución.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio evaluados: no disponibles.

## Casos de uso

- Investigación sobre internalización de conocimiento: el modelo sirve como artefacto experimental para estudiar cómo un LLM absorbe conocimiento estructurado a partir de observaciones de herramientas, comparando checkpoints (`epoch-1` frente a `main`) y escalas de datos (1M, 5M hasta 350M tokens).
- Reproducción de experimentos de ajuste fino: la receta, el resumen de entrenamiento (`training_summary.json`) y el manifiesto de artefactos (`artifact_manifest.json`) permiten replicar el pipeline con 8 GPU GH200 y la configuración documentada.
- Estudio de regularización KL: útil para analizar el efecto de una penalización KL de 0,01 respecto al modelo base sobre un pool de repetición congelado, con métricas de pérdida de validación publicadas para ambas épocas.
- Generación de texto técnico del dominio ecuacional: el modelo puede producir texto similar a los retornos de lectura del corpus (fragmentos de proof, relaciones y dualidades) en tareas de completado o continuación.
- Análisis de separación de datos y fuga de benchmark: el diseño con preguntas de evaluación excluidas y su informe de separación lo convierten en un caso de estudio sobre construcción de corpus sin contaminación.
- Base para experimentos posteriores de ajuste: al estar bajo licencia Apache 2.0 y en formato safetensors compatible con `transformers`, puede usarse como punto de partida para nuevos fine-tunes en investigación.
- Evaluación comparativa de pérdidas: las pérdidas de validación sobre notas de estudio originales (base: 1,245; época 1: 1,193; época 2: 1,212) y sobre trayectorias del modelo base (base: 0,145; época 1: 0,148; época 2: 0,147) permiten analizar el equilibrio entre ajuste y deriva respecto al base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el modelo no ha sido evaluado en ningún benchmark y que las cifras publicadas son únicamente pérdidas de entrenamiento y validación:

| Metrica | Base | Epoca 1 (`checkpoint-82`) | Epoca 2 (`checkpoint-164`, `main`) |
|---|---|---|---|
| Pérdida media de entrenamiento (texto fuente del run) | no disponible | 0,197 | 0,057 |
| Pérdida de validación sobre notas de estudio originales | 1,245 | 1,193 | 1,212 |
| Pérdida de validación sobre trayectorias del modelo base | 0,145 | 0,148 | 0,147 |
| KL(base ‖ student) sobre el pool de repetición de validación | no disponible | 0,021 | 0,018 |

El conjunto de validación es el conjunto congelado de la receta (notas de estudio originales y trayectorias del modelo base) y no contiene texto fuente de este run, por lo que ninguna de estas cifras mide el ajuste a texto fuente no visto.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653.104.368 parámetros en safetensors (38,6 GB de repositorio), la inferencia en precisión nativa requiere del orden de 19-20 GB en bf16/fp16 solo para pesos, más memoria para activaciones y caché KV; en cuantización de 8 bits se reduciría aproximadamente a la mitad y en 4 bits a una cuarta parte, aunque el autor no publica cuantizaciones.
- GPU recomendadas: el entrenamiento se realizó en 8 GPU GH200; para inferencia, una GPU con 24 GB o más (RTX 4090, A100 40/80 GB, H100) es el rango razonable según la precisión elegida.
- ¿Cabe en GPU de consumo? En bf16 no cabe en GPUs de 24 GB sin cuantización; con cuantización de 8 o 4 bits podría caber en una RTX 4090, aunque no se distribuyen pesos cuantizados oficiales.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (carga documentada por el autor con `dtype="auto"` y `device_map="auto"`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-10m-kl-0p01 | 9.653.104.368 | no disponible | Apache 2.0 | Hugging Face (safetensors) | Checkpoint experimental, sin benchmarks publicados |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la información proporcionada | no disponible | Apache 2.0 | Hugging Face | Modelo base del que parte el ajuste; referencia para las pérdidas de validación |
| Otros fine-tunes de Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas comparables en la documentación proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparativa se limita al modelo base y a la categoría general de fine-tunes del mismo tamaño.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en ningún benchmark; todas las cifras publicadas son pérdidas de entrenamiento y validación, no métricas de capacidad.
- El ajuste se realizó sobre un dominio muy estrecho (retornos de herramientas de lectura del corpus de teoría ecuacional), por lo que el rendimiento fuera de ese dominio es incierto y no está documentado.
- Los componentes de visión son los del modelo base y no fueron ajustados ni evaluados; no debe asumirse calidad multimodal.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni limitaciones idiomáticas; al no haber evaluación, estos riesgos no pueden cuantificarse.
- El conjunto de validación no contiene texto fuente de este run, por lo que las pérdidas de validación no miden el ajuste a texto fuente no visto; la pérdida de entrenamiento de la época 2 se calcula sobre texto visto en la época 1.
- La licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad para producción.
- El repositorio no incluye cuantizaciones (GGUF, GPTQ, AWQ) ni documentación de despliegue en servidores de inferencia de alto rendimiento.
- El nombre del modelo describe los datos de entrenamiento, no el número de parámetros; conviene no confundir el sufijo "10m" con el tamaño del modelo.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-10m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqobs10m20261117
- Repositorio del proyecto (receta y log): `recipe/equational_internalization/experiments/observations_study_materials_ntp_kl_vista_20261117/README.md` en el repositorio del proyecto U-WIN
