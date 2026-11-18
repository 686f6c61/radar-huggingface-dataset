# U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-5m-kl-0p01

## Resumen

El modelo `qwen35-9b-equational-theory-sair-observations-ntp-5m-kl-0p01` es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, desarrollado por el grupo U-WIN en el marco de su trabajo sobre internalización de teoría ecuacional. El nombre describe el conjunto de datos de entrenamiento, no el número de parámetros: se entrenó sobre 5.000.042 tokens de pérdida procedentes de las observaciones de exploración que las herramientas de lectura devolvieron al modelo base mientras este recorría un corpus de estudio de teoría ecuacional para redactar notas de estudio.

El modelo no ha sido evaluado en ningún benchmark: la model card indica explícitamente que ninguna revisión ha sido puntuada en tareas de evaluación y que las cifras publicadas son únicamente pérdidas de entrenamiento y validación. Se distribuye como exportación de servicio del checkpoint final (`checkpoint-82`, época 2), con 427 tensores de lenguaje ajustados y 348 tensores base sin modificar; los componentes de visión son los del modelo base y no fueron evaluados en calidad multimodal.

Es relevante como artefacto de investigación: documenta una receta reproducible de ajuste fino con regularización KL sobre un modelo de 9.650 millones de parámetros, con registro completo de procedencia (digest de lanzamiento, auditoría de tensores, manifiesto sha256) y separación del corpus respecto a las preguntas de evaluación. No es un modelo listo para producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (Qwen3.5, pipeline image-text-to-text); 427 tensores de lenguaje ajustados, 348 tensores base sin modificar |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors en precisión de exportación; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); repo de 38,6 GB |

## Arquitectura y entrenamiento

Arquitectura transformer correspondiente a Qwen3.5-9B, inicializada desde la revisión `c202236235762e1c871ad0ccb60c8ee5ba337b9a` del modelo base publicado. El ajuste es de modelo completo mediante predicción de siguiente token (NTP) sobre filas empaquetadas de 17.408 tokens (una fila por GPU), con 2 épocas, tasa de aprendizaje 5e-06, decaimiento coseno con 3% de calentamiento y un término de regularización de 0,01 × KL(base || student) calculado sobre un pool de repetición congelado de trayectorias ecuacionales generadas por el modelo base (nunca usado como objetivo). El entrenamiento se ejecutó en 8 × GH200, con 82 pasos de optimizador y 33 minutos de cómputo (trabajo Slurm 1149069 en TACC Vista, iniciado el 2026-11-17).

Los datos de entrenamiento son exclusivamente texto fuente: las devoluciones con contenido de las herramientas `read`, `glob` y `grep` durante las sesiones de exploración de las rondas R9 a R14 de la recolección de notas (409.922 sesiones y 751,6M tokens de texto devuelto en total). Cada devolución es un ejemplo: una cabecera que nombra la llamada (por ejemplo, `read relations/dualities/Eq4463-Eq4503/proof.md lines 1-22 of 22`) como entrada, seguida del texto devuelto y un token de fin de texto con pérdida. No se incluyen las notas de estudio, las trayectorias de solución, el texto generado por el propio modelo, los prompts de tarea ni las devoluciones de las herramientas de notas. La escala de 5M son 21.743 devoluciones de 2.631 sesiones (4.560.424 tokens de `read`, 431.682 de `glob`, 7.936 de `grep`; 328 filas empaquetadas por época); contando cada texto devuelto distinto una sola vez quedan 3.977.642 de los 4.978.299 tokens de contenido (80%). El corpus se construyó con las preguntas del benchmark retenidas: el informe de separación (estado PASS; pares ordenados exactos, 1.100 objetivos de evaluación) registra que ninguna implicación protegida aparece en las implicaciones demostradas, en el índice de no implicaciones ni nombrada en el texto fuente retenido; las leyes equivalentes y las tablas compartidas se mantienen por diseño.

## Capacidades

- Predicción de siguiente token sobre texto fuente de teoría ecuacional, con especialización en continuar devoluciones de herramientas de lectura de ficheros.
- Generación de texto condicionada por una cabecera de llamada de herramienta (nombre de fichero, rangos de líneas, total de líneas) como entrada.
- Capacidad multimodal heredada del modelo base (pipeline image-text-to-text), si bien los componentes de visión no fueron ajustados ni evaluados.
- Soporte de tool calling: no disponible como capacidad declarada; el entrenamiento imita el formato de devolución de herramientas, no su invocación.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad evaluada.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo de pensamiento (thinking), audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Investigación sobre internalización de conocimiento: el modelo sirve como punto de control para estudiar si el ajuste fino con NTP sobre observaciones de herramientas internaliza leyes ecuacionales; se usaría comparando sus pérdidas retenidas frente al modelo base (1,212/1,214 frente a 1,245 en notas de estudio).
- Reproducción de experimentos de regularización KL: útil para replicar la receta (0,01 × KL(base || student) sobre pool de repetición) y medir su efecto en la deriva respecto al modelo base, con la pérdida KL de validación de 0,030 (época 1) y 0,025 (época 2).
- Estudio de contaminación y separación de corpus: el informe de separación con 1.100 objetivos de evaluación y estado PASS permite auditar metodologías de retención de preguntas en corpus de entrenamiento.
- Generación de continuaciones de ficheros de prueba: dado un encabezado de lectura con ruta y rango de líneas, el modelo produce texto con el estilo del corpus de pruebas ecuacionales, útil como generador de datos sintéticos para experimentos de recuperación.
- Servicio de referencia para pipelines de evaluación de agentes: al mantener el tokenizador, la plantilla de chat y los procesadores del modelo base, puede desplegarse con `transformers` como línea base en entornos de evaluación de lectura de ficheros.
- Docencia e ilustración de recetas de ajuste completo: el repositorio incluye `training_summary.json` con digest de lanzamiento y auditoría de tensores, y `artifact_manifest.json` con sha256 de cada fichero, lo que lo hace adecuado como ejemplo verificable de procedencia en cursos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente que el modelo no ha sido evaluado. Las únicas cifras publicadas son pérdidas de entrenamiento y validación:

| Metrica | Epoca 1 (`epoch-1`, checkpoint-41) | Epoca 2 (`main`, checkpoint-82) | Modelo base |
|---|---|---|---|
| Pérdida media de entrenamiento en la época | 0,291 | 0,076 | no disponible |
| Pérdida retenida en notas de estudio originales | 1,212 | 1,214 | 1,245 |
| Pérdida retenida en trayectorias del modelo base | 0,150 | 0,149 | 0,145 |
| KL(base \|\| student) en el pool de validación | 0,030 | 0,025 | no aplica |

El conjunto retenido es el conjunto de validación congelado de la receta y no contiene texto fuente de esta ejecución, por lo que ninguna de estas cifras mide el ajuste a texto fuente no visto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud, un modelo de 9.653 millones de parámetros en bf16 requiere del orden de 19-20 GB solo para pesos, más caché KV y activaciones; en cuantización de 8 bits, del orden de 10 GB, y en 4 bits, del orden de 5-6 GB.
- GPU recomendadas: el entrenamiento se realizó en 8 × GH200; para inferencia no se especifican GPU. Por tamaño, cabría en A100 (40/80 GB), H100 y L40S.
- GPU de consumo: no confirmado por el autor; por tamaño de pesos, sería viable en RTX 4090 (24 GB) en bf16 justo al límite o con cuantización, y en RTX 3090 (24 GB) con cuantización.
- Opciones de despliegue: `transformers` con `AutoModelForImageTextToText` y `AutoProcessor` (carga documentada con `dtype="auto"` y `device_map="auto"`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de Hugging Face. No se documentan recetas para vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion | Disponibilidad |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-5m-kl-0p01 | 9.653.104.368 | no disponible | apache-2.0 | sin evaluar (solo pérdidas) | Hugging Face, safetensors |
| Qwen/Qwen3.5-9B (modelo base) | ~9B | no disponible en esta ficha | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Alternativas de ~9B para texto e imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones del modelo base en la información proporcionada, por lo que la comparación cuantitativa con alternativas no está disponible.

## Limitaciones y advertencias

- Modelo sin evaluar: ninguna revisión ha sido puntuada en benchmarks; no debe asumirse calidad en tareas distintas de la continuación de texto fuente.
- Especialización estrecha: entrenado solo sobre devoluciones de `read`, `glob` y `grep` de un corpus de teoría ecuacional; el dominio y el formato de entrada son muy restringidos.
- Las pérdidas retenidas apenas mejoran respecto al modelo base (1,212-1,214 frente a 1,245 en notas de estudio; 0,149-0,150 frente a 0,145 en trayectorias base), lo que sugiere una transferencia limitada fuera del texto fuente de entrenamiento.
- La pérdida de entrenamiento de la época 2 (0,076) se calcula sobre texto ya visto en la época 1, por lo que no mide generalización.
- Componentes de visión heredados del modelo base y no evaluados: no hay garantía de calidad multimodal.
- Riesgo de alucinación y sesgos: no documentados por el autor; al ser un ajuste sobre texto técnico de un dominio concreto, puede reproducir patrones del corpus y de las leyes equivalentes retenidas por diseño.
- Idiomas soportados no declarados: no se garantiza comportamiento multilingüe.
- Licencia apache-2.0: permite uso comercial, pero al derivar de Qwen3.5-9B conviene verificar las condiciones del modelo base.
- Trazabilidad: el autor publica digest de lanzamiento, auditoría de tensores y manifiesto sha256, pero no se incluyen datos de sesgo, robustez ni seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-equational-theory-sair-observations-ntp-5m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ejecución de W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqobs5m20261117
- Receta y registro de la ejecución: `recipe/equational_internalization/experiments/observations_study_materials_ntp_kl_vista_20261117/README.md` en el repositorio del proyecto (no se proporciona URL directa)
