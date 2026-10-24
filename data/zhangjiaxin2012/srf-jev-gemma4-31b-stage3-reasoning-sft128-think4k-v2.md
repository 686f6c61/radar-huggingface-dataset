# zhangjiaxin2012/SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT128-Think4K-v2

## Resumen

SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT128-Think4K-v2 es un checkpoint de investigación publicado por el usuario zhangjiaxin2012, derivado del modelo base google/gemma-4-31B-it mediante un ajuste fino supervisado orientado a razonamiento (Stage 3) y exportado como modelo fusionado nativo, sin LoRA adjunta ni merge manual. El checkpoint incorpora 31.273.086.512 parámetros en formato safetensors con precisión BF16 y una arquitectura multimodal de tipo Gemma4ForConditionalGeneration, es decir, un transformer capaz de procesar entradas de imagen y texto.

El modelo no se presenta como un release oficial ni como un ganador definitivo de la iteración v2, sino como una instantánea de etapa (128 actualizaciones de entrenamiento, LoRA de atención con rango 32 y alpha 64, AdamW en FP32 con LR 1e-5). Su interés práctico reside en la receta de inferencia denominada Think4K: el mismo conjunto de pesos soporta dos políticas de servicio, `direct` (una única pasada sin generar razonamiento) y `autothink4096` (razonamiento nativo limitado a 4096 tokens, activado solo cuando `max(p0) < 0.9`, con reinserción de análisis y fusión `0.25*p0 + 0.75*p1`).

Sobre un panel público de 231 preguntas, la política directa obtiene un 87,45 % de acierto y la política con pensamiento activado un 96,10 %. Son métricas de desarrollo interno, no puntuaciones de leaderboard oficial, y el autor advierte explícitamente de que las ganancias dependen del modo y de que el modelo base original sigue liderando en capacidad en modo directo. El contexto máximo no se documenta en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4ForConditionalGeneration (transformer multimodal imagen-texto) |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; publicación en BF16 sin conversión ni cuantización aplicada |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (model*.safetensors) + config, index y tokenizer nativos; sin GGUF publicado |

## Arquitectura y entrenamiento

El modelo parte de la clase nativa `Gemma4ForConditionalGeneration` del checkpoint `google/gemma-4-31B-it@842da3794eaa0b77d5f08bae87a17459d91ff475`, por lo que hereda la pila multimodal de Gemma 4 (procesamiento conjunto de imagen y texto) y el tokenizer original. El entrenamiento se organiza en tres fases: una Stage 1 de SFT completo con supervisión de decisión y `enable_thinking=False`; una Stage 2 causal con LoRA de decisión, también sin pensamiento, con supervisión del resultado y replay; y una Stage 3 de SFT de razonamiento con prompts nativos de pensamiento y supervisión o rollouts sobre tokens de razonamiento. La Stage 3 que da nombre a este checkpoint aplica 128 actualizaciones con LoRA de atención rango 32 / alpha 64, AdamW en FP32 y LR 1e-5, y se exporta como artefacto fusionado nativo. No hubo actualizaciones posteriores de RL de lenguaje completo.

La peculiaridad técnica no está en la arquitectura, sino en el sistema de servicio que acompaña a los pesos: una primera lectura sin pensamiento produce una distribución `p0`; si el máximo de esa distribución es inferior a 0.9, se genera razonamiento nativo con un presupuesto de 4096 tokens; después se reinyecta el análisis en formato JSON y se fusionan las probabilidades como `0.25*p0 + 0.75*p1`. La calibración posterior es identidad. All native tensor bytes coinciden con el artefacto de entrenamiento completado, y los dtypes almacenados se documentan en `release.json`; la carga de inferencia medida es BF16. El runner de decisión suministrado usa una sola GPU CUDA y SDPA en modo math-only, y cualquier backend multi-GPU o cuantizado se considera una configuración de evaluación distinta.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, con pipeline declarado `text-generation`.
- Razonamiento explícito opcional mediante modo de pensamiento nativo, con presupuesto configurable (receta de referencia: 4096 tokens).
- Toma de decisiones con opciones múltiples (esquema Choice), abstención (NoUL) y puntuación (Score) a través del runner `predict.py`, con salida de IDs semánticos de opción, probabilidades y opción seleccionada.
- Calibración de probabilidades: el sistema reporta métricas de calibración y Brier, no solo exactitud.
- Procesamiento de imagen y texto (etiqueta `image-text-to-text`), heredado del modelo base multimodal.
- Cambio de política en tiempo de inferencia sin recargar pesos: `direct` y `autothink4096` sobre el mismo checkpoint.
- Compatibilidad con Transformers 5.17.0 usando `dtype=torch.bfloat16` y `attn_implementation="sdpa"`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.
- Multilingüismo: limitado a inglés según la model card.

## Casos de uso

- Evaluación comparativa de checkpoints de razonamiento: el paquete incluye `predict.py`, `examples.jsonl` y un panel de 231 preguntas con IDs estables, lo que permite reproducir las filas Direct y Gated 4K thinking sobre el mismo artefacto y comparar variantes de etapa sin reentrenar.
- Clasificación con abstención en pipelines de decisión: los esquemas Choice/NoUL permiten usar el modelo para elegir entre opciones discretas y, cuando `max(p0) < 0.9`, activar razonamiento adicional solo en los casos dudosos, reduciendo coste de tokens frente a un modo de pensamiento permanente.
- Enrutamiento sensible al coste: la política `direct` genera cero tokens de razonamiento, adecuada para servicios con latencia ajustada donde se acepta el 87,45 % de acierto del panel en lugar del 96,10 % del modo con pensamiento.
- Investigación sobre calibración y fusión de distribuciones: las métricas de NLL y Brier publicadas (0,376040 y 0,187536 en directo; 0,210309 y 0,080257 con pensamiento) permiten estudiar el efecto de la fusión `0.25*p0 + 0.75*p1` y de la reinyección de análisis.
- Análisis de documentos que combinan imagen y texto: al ser un modelo `image-text-to-text`, puede emplearse en tareas de descripción o extracción sobre capturas e imágenes junto a instrucciones textuales, siempre que se valide el comportamiento concreto.
- Reproducibilidad de artefactos de investigación: el repositorio incluye `release.json`, `evaluation.json`, `portable-qualification.json` y `release-files.json`, además de opción `--verify-weights` para comprobar cada shard descargado antes de cargarlo, lo que facilita auditorías internas.
- Réplica de experimentos en un solo nodo GPU: el runner oficial está pensado para una única GPU CUDA con SDPA math-only, lo que simplifica la puesta en marcha en entornos H200 de referencia.

## Benchmarks y rendimiento

Resultados del panel público de 231 preguntas reportados por el autor sobre este mismo checkpoint. No son puntuaciones oficiales de leaderboard y el panel es de desarrollo adaptativo, con coste de razonamiento distinto entre políticas.

| Política | Aciertos / 231 | Exactitud | Intelligence | Calibration | Capability | NLL (↓) | Brier (↓) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Direct | 202 | 87,45 % | 70,52 | 78,89 | 74,70 | 0,376040 | 0,187536 |
| Gated 4K thinking | 222 | 96,10 % | 90,55 | 87,01 | 88,78 | 0,210309 | 0,080257 |

Notas: Capability = (Intelligence + Calibration) / 2, distinta de la exactitud de respuesta. La evaluación Direct genera cero tokens de razonamiento; la variante con pensamiento solo genera razonamiento nativo si `max(p0) < 0.9`, con tope de 4096 tokens. El autor indica que, en las comparaciones completadas de 31B, el modelo base original sigue por delante de los checkpoints entrenados en capacidad en modo directo. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Peso del repositorio: 62,6 GB. Con 31.273 millones de parámetros en BF16, los pesos ocupan aproximadamente 62,5 GB, por lo que la inferencia en BF16 requiere del orden de 63 GB solo para pesos, más caché KV y activaciones.
- Configuración de referencia del autor: una única GPU CUDA, con SDPA math-only, sobre un entorno H200. Un H200 (141 GB) deja margen suficiente para pesos, caché KV y contexto largo.
- A100 80 GB y H100 80 GB: pueden alojar los pesos en BF16, pero el margen para caché KV y activaciones es muy ajustado; requieren validación propia.
- GPU de consumo: no cabe en BF16 en ninguna tarjeta de consumo actual (RTX 4090 24 GB, RTX 3090 24 GB). Solo sería viable con cuantización agresiva, y el autor advierte de que los backends cuantizados o multi-GPU constituyen configuraciones de evaluación separadas, no la ruta validada.
- Opciones de despliegue: el autor proporciona un runner propio (`checkpoint/predict.py`) con `--policy direct|autothink4096` y `--device cuda:0`; también es posible cargar la clase nativa con Transformers 5.17.0 (`dtype=torch.bfloat16`, `attn_implementation="sdpa"`). Soporte para vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada (no hay GGUF publicado).
- Dependencias declaradas: Python 3.10+, PyTorch 2.6.0 con build CUDA, huggingface_hub 1.5.0 y `checkpoint/requirements.txt`.
- Latencia y throughput: no disponible. Cualquier estimación debe considerar que la política `autothink4096` puede generar hasta 4096 tokens adicionales por consulta, mientras que `direct` no genera ninguno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT128-Think4K-v2 | 31,27 B (denso) | no disponible | 87,45 % (direct) / 96,10 % (gated 4K) en panel propio de 231 preguntas | apache-2.0 | HuggingFace, repo de 62,6 GB |
| google/gemma-4-31B-it (base) | no disponible en la información | no disponible | Lidera a los checkpoints entrenados en Direct Capability según el autor; cifra concreta no disponible | no disponible en la información | HuggingFace (modelo base referenciado) |
| Otras alternativas de ~30 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos verificables de otros modelos comparables en la misma categoría (por ejemplo, familias densas de 27-32 B de otros proveedores), por lo que la comparativa se limita al modelo base declarado. Cualquier comparación adicional requeriría ejecutar el mismo panel de 231 preguntas con idéntico runner y política.

## Limitaciones y advertencias

- Instantánea de investigación: el autor indica explícitamente que es un snapshot de etapa v2, no un ganador final ni un release SOTA oficial.
- En modo `direct`, el modelo base original supera a este checkpoint en capacidad según las comparaciones de 31B completadas; no debe extrapolarse la puntuación de Thinking-4K a una ejecución directa.
- La puntuación de 96,10 % corresponde a un panel de desarrollo adaptativo de 231 preguntas, con distinto coste de razonamiento entre checkpoints; no equivale a una evaluación de leaderboard ni garantiza generalización.
- Para reproducir la fila Thinking-4K hay que usar la receta completa (lectura inicial, umbral `max(p0) < 0.9`, tope de 4096 tokens, reinyección de análisis JSON y fusión `0.25*p0 + 0.75*p1`). Activar `enable_thinking=True` en una llamada de chat genérica no reproduce ese sistema.
- El prompt genérico de chat no reproduce la tabla de decisión; se requiere el runner de decisión suministrado con entradas JSONL que contengan exactamente `id` y `visible`.
- Los IDs deben permanecer estables entre políticas, ya que determinan la permutación de opciones y la semilla de pensamiento; las etiquetas de referencia deben mantenerse en un archivo separado.
- Idioma: solo inglés declarado. No hay evidencia publicada de rendimiento en castellano.
- Contexto máximo: no documentado, lo que impide planificar cargas de contexto largo con garantías.
- Riesgo de alucinación: no cuantificado en la información disponible; se trata de un modelo generativo ajustado con SFT y sin RL posterior de lenguaje completo, lo que limita la corrección de comportamientos indeseados.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad en la model card.
- Cargas cuantizadas o multi-GPU no están validadas por el autor; solo la ruta de una GPU con SDPA math-only y BF16 está cualificada.
- Licencia: la model card declara apache-2.0, pero al derivar de `google/gemma-4-31B-it` conviene verificar los términos aplicables al modelo base antes de un uso comercial.
- No se publican estados del optimizador, registros de entrenamiento o evaluación, etiquetas, logs internos ni sondas privadas de runtime, lo que dificulta la auditoría del proceso.
- El replay del código portable en CPU no constituye una prueba de portabilidad en GPU de la nueva CLI, según el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhangjiaxin2012/SRF-Jev-Gemma4-31B-Stage3-Reasoning-SFT128-Think4K-v2
- Repositorio del proyecto: https://github.com/jxzhangjhu/srf-jev
- Documentación de la comparativa de tres tamaños (23/10/2026): https://github.com/jxzhangjhu/srf-jev/tree/main/docs/gemma4/research/three-size-20261023
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Paper, blog o demo adicionales: no disponible en la información proporcionada
