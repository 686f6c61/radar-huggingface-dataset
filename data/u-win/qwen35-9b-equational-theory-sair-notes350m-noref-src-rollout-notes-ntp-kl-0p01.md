# U-WIN/qwen35-9b-equational-theory-sair-notes350m-noref-src-rollout-notes-ntp-kl-0p01

## Resumen
Este repositorio contiene un ajuste fino completo (full fine-tune) del modelo base Qwen3.5-9B, desarrollado por el grupo U-WIN en el marco de su trabajo de internalización de teoría ecuacional (equational theory). El modelo parte de los pesos publicados de Qwen3.5-9B, un transformer multimodal de unos 9.650 millones de parámetros con capacidad de entrada imagen-texto, y se entrena con next-token prediction sobre una mezcla de notas de estudio y "rollout notes" generadas por el propio modelo base.

El objetivo del experimento no es producir un asistente generalista, sino estudiar si el modelo puede interiorizar conocimiento matemático (leyes ecuacionales, implicaciones demostradas en Lean, dualidades) a partir de notas que él mismo redacta consultando fuentes de estudio, sin solución de referencia. El checkpoint resultante conserva la arquitectura y el tokenizador del modelo base, con los pesos de texto ajustados y los componentes de visión sin modificar.

Es relevante ahora como artefacto de investigación reproducible: documenta con precisión la receta (2 épocas, LR 5e-06, regularización KL 0.01, 8 x GH200), las pérdidas de entrenamiento y validación, y advierte explícitamente de que no ha sido evaluado en ningún benchmark. No es un modelo listo para producción ni para uso comercial generalista, pese a su licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-9B; tipo `qwen3_5` en transformers |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios; incluye config, tokenizer, chat template y processors) |

## Arquitectura y entrenamiento
El modelo es un ajuste fino completo de Qwen3.5-9B (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), un transformer multimodal con pipeline `image-text-to-text`. El entrenamiento usa next-token prediction sobre filas empaquetadas de 17.408 tokens (una fila por GPU), durante 2 épocas, con learning rate 5e-06, decaimiento coseno y 3% de warmup, más un término de regularización KL de 0.01 entre el modelo base congelado y el estudiante sobre un pool de repetición de trayectorias generadas por el base (nunca como objetivo). Se ejecutó en 8 x GH200, 5.222 pasos de optimizador, 481 minutos, en el job Slurm 1147834 de TACC Vista, iniciado el 2026-11-16.

Los datos de entrenamiento son 350.011.285 tokens de notas de estudio del modelo base (587.537 notas) más 5.072.228 tokens de rollout notes (5.602 notas, mediana de 871 tokens), sumando 355.083.513 tokens y 20.887 filas empaquetadas por época. Las rollout notes las escribió el propio Qwen3.5-9B revisando sus intentos de solución puntuados por un juez, sin solución de referencia pero con las fuentes de estudio de teoría ecuacional (páginas de leyes, implicaciones demostradas con pruebas Lean, dualidades, exposición, fundamentos y métodos). Las notas no están publicadas y no se validaron contra el veredicto correcto: aproximadamente el 14% concluyen solo el veredicto erróneo y en 674 de las 3.421 notas sobre problemas FALSE se encuentra un contraejemplo válido (cota inferior). El conjunto de validación congelado no contiene rollout notes, por lo que ninguna métrica mide el ajuste a notas no vistas de ese tipo.

## Capacidades
- Generación de texto y razonamiento sobre matemáticas y teoría ecuacional, heredadas del ajuste sobre notas de estudio y notas de rollout.
- Entrada multimodal imagen-texto según el pipeline declarado, aunque los componentes de visión son los del modelo base y no se evaluaron para calidad multimodal.
- Conversación multi-turno (tag `conversational` y chat template incluidos en el repositorio).
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.
- Capacidades multilingües: no disponibles.
- No se documenta modo de pensamiento (thinking mode), audio ni otras capacidades especiales.

## Casos de uso
- Investigación sobre internalización de conocimiento matemático: el checkpoint permite reproducir y analizar si un modelo aprende leyes ecuacionales a partir de notas autogeneradas, comparando las pérdidas de validación (0.233 en notas de estudio frente a 1.245 del base) con el comportamiento cualitativo.
- Estudio de regularización KL en ajuste fino: sirve como punto de partida para experimentos que varíen el coeficiente KL (aquí 0.01) y midan su efecto sobre la deriva respecto al modelo base, usando el pool de repetición documentado.
- Auditoría de datos sintéticos: al conocerse que ~14% de las notas concluyen el veredicto erróneo, el modelo es útil para estudiar cómo se propaga ruido de etiquetas en el ajuste fino y diseñar filtros de calidad.
- Docencia y divulgación sobre pipelines de entrenamiento a escala: la receta completa (8 x GH200, 5.222 pasos, 481 minutos) y el W&B público permiten explicar con cifras reales el coste de un full fine-tune de 9B.
- Reproducción de experimentos con `transformers`: la carga con `AutoModelForImageTextToText` y la selección de revisión (`main`/`epoch-2` o `epoch-1`) facilitan comparar los dos checkpoints publicados.
- Base para experimentos de destilación o continuación del ajuste: al conservar tokenizador, chat template y processors del base, puede reutilizarse como inicialización en estudios posteriores del mismo grupo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que ninguna revisión ha sido puntuada en ningún benchmark; solo se publican pérdidas de entrenamiento y validación:

| Metrica | Base | Epoca 1 (`epoch-1`) | Epoca 2 (`main`) |
|---|---|---|---|
| Pérdida media de entrenamiento | no disponible | 0.288 | 0.217 |
| Pérdida held-out en notas de estudio originales | 1.245 | 0.250 | 0.233 |
| Pérdida held-out en trayectorias del modelo base | 0.145 | 0.127 | 0.127 |
| KL(base ‖ student) en el pool de validación | no disponible | 0.033 | 0.029 |

## Requisitos de hardware
- VRAM estimada para inferencia en BF16/FP16: aproximadamente 19,3 GB solo para pesos (9.653.104.368 parámetros x 2 bytes), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- GPU recomendadas: A100 40/80 GB, H100, GH200 (el propio entrenamiento usó 8 x GH200). Una RTX 4090 de 24 GB puede ser justa para BF16 y requeriría cuantización para margen cómodo.
- Cabe en GPU de consumo solo con cuantización (por ejemplo, 8 bits o 4 bits), no documentada por el autor; el repositorio solo publica safetensors.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `device_map="auto"` (método documentado); vLLM, llama.cpp, Ollama o TGI no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-notes350m-noref-src-rollout-notes-ntp-kl-0p01 | 9,65 B | no disponible | no evaluado | Apache 2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-9B (base) | no disponible en la información | no disponible | no disponible en la información | no disponible en la información | Hugging Face |
| Otros fine-tunes de Qwen3.5-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias
- Modelo no evaluado: ninguna revisión ha sido puntuada en benchmarks; las pérdidas de validación no miden calidad en tareas reales.
- Datos de entrenamiento ruidosos: aproximadamente el 14% de las rollout notes concluyen solo el veredicto erróneo y solo 674 de 3.421 notas sobre problemas FALSE contienen un contraejemplo válido; el ajuste puede reforzar razonamientos incorrectos.
- El conjunto de validación no incluye rollout notes, por lo que no hay medición del ajuste a notas no vistas de ese tipo.
- Las notas de entrenamiento no están publicadas, lo que limita la reproducibilidad completa del experimento.
- Componentes de visión sin ajustar y sin evaluar: la calidad multimodal no está garantizada pese al pipeline `image-text-to-text`.
- Idiomas soportados y longitud de contexto no documentados; no se debe asumir el contexto del modelo base sin verificarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación sin garantías de calidad; no se recomienda en producción sin evaluación previa.
- Riesgo de alucinación y sesgos: no evaluados ni documentados por el autor.
- El nombre del repositorio incluye "350m", que se refiere al tamaño del conjunto de notas de estudio, no al número de parámetros; puede inducir a error.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-notes350m-noref-src-rollout-notes-ntp-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Run de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqnorefsrcn350mr20261116
- Repositorio del proyecto (ruta indicada por el autor, sin URL pública en la información disponible): `recipe/equational_internalization/experiments/rollout_notes_noref_sources_vista_20261116/README.md`
