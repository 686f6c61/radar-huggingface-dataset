# U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-1m-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-observations-ntp-1m-kl-0p01` es un ajuste fino completo del modelo base Qwen/Qwen3.5-9B, desarrollado por U-WIN en el marco de su trabajo de internalización de teoría ecuacional. El nombre describe el conjunto de datos de entrenamiento, no el número de parámetros: el modelo cuenta con 9.653.104.368 parámetros (aproximadamente 9,65 mil millones). Se trata de un checkpoint de la ejecución `obs1m` del experimento `observations_study_materials_ntp_kl_vista_20261117`, fechado en noviembre de 2026.

El modelo se entrenó exclusivamente sobre texto fuente: las salidas de las herramientas de lectura (`read`, `glob`, `grep`) que el modelo base Qwen3.5-9B recibió mientras exploraba un corpus de estudio de teoría ecuacional para redactar apuntes. No se entrenó sobre apuntes de estudio ni sobre trayectorias de solución. El objetivo del trabajo es estudiar si el modelo puede internalizar conocimiento a partir de observaciones de lectura, sin supervisión directa sobre la tarea final.

Es relevante por su enfoque metodológico poco habitual: ajuste fino completo con regularización KL sobre un pool de repetición de trayectorias generadas por el modelo base, sobre un conjunto de solo 1.001.150 tokens de pérdida. El autor indica explícitamente que el modelo no ha sido evaluado en ningún benchmark. La arquitectura subyacente es la del Qwen3.5-9B (transformer multimodal image-text-to-text), cuyos pesos de visión permanecen sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; pesos de texto ajustados, componentes de visión sin modificar |
| Parametros totales | 9.653.104.368 (9,65 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene safetensors en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (427 tensores de lenguaje ajustados + 348 tensores base sin cambios) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `Qwen/Qwen3.5-9B` (revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), un transformer multimodal de 9,65 mil millones de parámetros. El ajuste fino es completo (full-finetune) sobre los pesos de texto; los componentes de visión son los del modelo base y no fueron evaluados en calidad multimodal. El repositorio incluye configuración completa, tokenizador, plantilla de chat y procesadores.

El entrenamiento consistió en predicción del siguiente token sobre filas empaquetadas de 17.408 tokens (una fila por GPU), con 2 épocas, tasa de aprendizaje 5e-06, decaimiento coseno con 3 % de calentamiento, y una penalización KL de 0,01 × KL(base || estudiante) sobre un pool de repetición congelado de trayectorias generadas por el modelo base (solo regularización, nunca objetivo). Se ejecutó en 8 × GH200, con 18 pasos de optimizador y 23 minutos de entrenamiento (trabajo Slurm 1149070 en TACC Vista, iniciado el 2026-11-17). El conjunto de datos de esta ejecución consta de 1.001.150 tokens de pérdida procedentes de 4.241 retornos de 505 sesiones (927.241 tokens de `read`, 71.563 de `glob`, 2.346 de `grep`; 66 filas empaquetadas por época). Contando cada texto devuelto distinto una sola vez quedan 928.992 de los 996.909 tokens de contenido (93 %). El corpus se construyó con las preguntas del benchmark excluidas: el informe de separación (estado PASS; pares ordenados exactos, 1.100 objetivos de evaluación) registra que ninguna implicación protegida aparece en las implicaciones demostradas, en el índice de no implicaciones ni nombrada en el texto fuente retenido.

Las pérdidas registradas son: época 1, pérdida media de entrenamiento 0,749; pérdida retenida en los apuntes originales 1,121 (base: 1,245); pérdida retenida en trayectorias del modelo base 0,147 (base: 0,145); KL 0,017. Época 2: pérdida media de entrenamiento 0,195; pérdida retenida en apuntes 1,139; pérdida retenida en trayectorias 0,148; KL 0,027. El autor advierte que el conjunto retenido no contiene texto fuente de esta ejecución, por lo que ninguna cifra mide el ajuste a texto fuente no visto.

## Capacidades

- Generación de texto autoregresiva (predicción del siguiente token) sobre los pesos de texto ajustados del Qwen3.5-9B.
- Entrada multimodal image-text-to-text heredada del modelo base (procesadores y componentes de visión incluidos, aunque no evaluados en calidad multimodal).
- Conversación multi-turno mediante la plantilla de chat incluida.
- Internalización de texto fuente de teoría ecuacional a partir de observaciones de lectura (objetivo del experimento).
- No se documentan capacidades específicas de tool calling, function calling, razonamiento multi-paso o agentes más allá de las heredadas del modelo base, que no se detallan en la información disponible.
- No se documentan capacidades multilingües ni modos especiales (thinking mode, audio) en la información proporcionada.

## Casos de uso

- Estudio de internalización de conocimiento: el modelo sirve como artefacto de investigación para analizar si un ajuste fino con pérdida NTP sobre observaciones de lectura (sin supervisión sobre la tarea final) modifica el comportamiento del modelo base en tareas de teoría ecuacional.
- Reproducción de experimentos de regularización KL: el repositorio incluye `training_summary.json` con la procedencia (digest del registro de lanzamiento, checkpoint, auditoría de tensores) y `artifact_manifest.json` con el sha256 de cada fichero, lo que permite auditar y reproducir la ejecución.
- Comparación de checkpoints intermedios: las revisiones `main` (= `epoch-2`, `checkpoint-18`) y `epoch-1` (`checkpoint-9`) permiten estudiar la evolución del ajuste entre épocas.
- Base para evaluación de retención: dado que el autor no ha evaluado el modelo, un uso realista es someterlo a los benchmarks de teoría ecuacional con las preguntas retenidas (1.100 objetivos de evaluación) para medir la transferencia del conocimiento internalizado.
- Investigación sobre olvido catastrófico: las pérdidas retenidas en apuntes y trayectorias del modelo base permiten estudiar cuánto se degrada el comportamiento original tras el ajuste.
- Docencia e ilustración metodológica: el modelo y su model card documentan un protocolo completo de construcción de corpus con separación de benchmark, útil como ejemplo en cursos de ajuste fino y evaluación rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que el modelo no ha sido evaluado en ningún benchmark y que las cifras de la model card son únicamente pérdidas de entrenamiento y validación.

| Metrica | Epoca 1 (`epoch-1`) | Epoca 2 (`main`) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento | 0,749 | 0,195 | no disponible |
| Pérdida retenida en apuntes originales | 1,121 | 1,139 | 1,245 |
| Pérdida retenida en trayectorias del base | 0,147 | 0,148 | 0,145 |
| KL(base \|\| estudiante) en pool de validación | 0,017 | 0,027 | no aplica |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 9,65 mil millones de parámetros, en fp16 se requieren aproximadamente 19,3 GB solo para pesos; en cuantización de 8 bits, unos 9,7 GB; en 4 bits, unos 4,8 GB (estimaciones a partir del recuento de parámetros, no publicadas por el autor).
- GPU recomendadas: el entrenamiento se realizó en 8 × GH200. Para inferencia, una GPU con al menos 24 GB (RTX 4090, A10G, L4) podría alojar el modelo en fp16 con margen ajustado; A100 40/80 GB y H100 son opciones holgadas para fp16 y lotes mayores.
- Cabe en GPU de consumo: sí, en principio, en RTX 4090 (24 GB) en fp16 con contexto moderado, o en GPUs de 16 GB con cuantización de 8 bits; no se ha verificado por el autor.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (carga documentada por el autor con `dtype="auto"` y `device_map="auto"`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-1m-kl-0p01 | 9,65 mil millones | no disponible | no evaluado en benchmarks | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| Qwen/Qwen3.5-9B (modelo base) | 9,65 mil millones | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face (modelo base de referencia) |
| Otras variantes del experimento U-WIN (escalas 5M, 350M, etc.) | 9,65 mil millones | no disponible | no evaluado en benchmarks | Apache 2.0 | mencionadas en la model card, no enlazadas |

No se dispone de datos de benchmarks ni de modelos comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- El modelo no ha sido evaluado en ningún benchmark; no hay evidencia publicada de su rendimiento en tareas de teoría ecuacional ni en capacidades generales.
- Las pérdidas retenidas no miden el ajuste a texto fuente no visto: el conjunto retenido no contiene texto fuente de esta ejecución.
- La pérdida retenida en apuntes originales empeora ligeramente de la época 1 (1,121) a la época 2 (1,139), lo que sugiere un posible sobreajuste al texto fuente de la ejecución en la segunda época.
- La pérdida retenida en trayectorias del modelo base (0,147–0,148) es prácticamente idéntica a la del base (0,145), lo que indica que el ajuste apenas altera ese comportamiento, pero no garantiza ausencia de deriva en otras distribuciones.
- Los componentes de visión son los del modelo base y no fueron evaluados en calidad multimodal; no debe asumirse un rendimiento multimodal validado.
- Sesgos conocidos: no documentados en la información proporcionada; heredables del modelo base Qwen3.5-9B.
- Riesgo de alucinación: no cuantificado; aplicable el riesgo general de los modelos de lenguaje, sin evaluación específica.
- Idiomas soportados: no disponibles; el corpus de entrenamiento es texto de teoría ecuacional, presumiblemente en inglés, pero no se confirma.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- El modelo está pensado como artefacto de investigación; su uso en producción sin evaluación previa no está respaldado por datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-1m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ejecución de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqobs1m20261117
- Repositorio del proyecto (receta y registro): `recipe/equational_internalization/experiments/observations_study_materials_ntp_kl_vista_20261117/README.md` (ruta indicada en la model card; no se proporciona URL directa)
