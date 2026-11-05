# tahaenesaslanturk/Qwen3-ASR-0.6B-weight-space-programming

## Resumen

Qwen3-ASR-0.6B-weight-space-programming es un derivado experimental del modelo de reconocimiento automático del habla Qwen3-ASR-0.6B del equipo Qwen, publicado por el investigador independiente Taha Enes Aslantürk. No se trata de un modelo nuevo entrenado desde cero, sino de una edición directa de pesos (weight-space programming) que corrige un fallo concreto del modelo base: ante fragmentos de habla audibles rodeados de silencio digital prolongado, el modelo original emite la etiqueta `language None<asr_text>`, es decir, clasifica erróneamente el audio como "sin habla" aunque la transcripción sea correcta. En el conjunto de estrés de test, 30 de 40 clips presentaban este fallo antes de la edición.

La intervención sigue el método descrito en "Sparks of Weight-Space Programming" (Takehi, Teoh, Zhang y Khattab, MIT CSAIL, noviembre de 2026) y se implementa como una reimplementación independiente sobre un modelo y una tarea distintos. Se realizaron nueve "brazos" de agente independientes (tres presupuestos de forward passes × tres réplicas: b10, b25, b50 y sus réplicas r2 y r3), cada uno de los cuales diagnosticó el fallo, lo localizó y generó una edición puramente analítica de los pesos, sin gradientes, sin optimizadores y sin fine-tuning. Cada brazo incluye además cinco controles de dirección aleatoria normalizados.

El resultado es un modelo de 0,6 mil millones de parámetros con licencia Apache 2.0, orientado a investigación en interpretabilidad y edición de modelos, no a producción. Su relevancia radica en demostrar que ediciones analíticas de pesos de bajo coste pueden corregir fallos de comportamiento específicos en modelos ASR pequeños, y en hacerlo de forma reproducible con un protocolo estricto de presupuesto de cómputo y uso único del conjunto de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3-ASR-0.6B; edición de pesos sobre el mismo) |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el experimento usa fp32 con decodificación congelada) |
| Idiomas soportados | tr, en, de, ar, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo base) y archivos `.pt` de edición (`edits/<arm>.pt`) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen3-ASR-0.6B, un transformer de 0,6 mil millones de parámetros especializado en reconocimiento automático del habla. Sobre él no se aplica ningún entrenamiento: la intervención consiste en una edición analítica de pesos que reemplaza o modifica tensores concretos (`mode: "replace"` o `"delta"`) identificados mediante análisis de pesos y estadísticas contrastivas de activaciones (diferencia de medias). Las direcciones de edición provienen de proyecciones de rango 1 y ganancias aplicadas sobre cabezas y neuronas seleccionadas, sin ningún proceso de ajuste por descenso de gradiente.

El protocolo experimental impone reglas estrictas: decodificación congelada (fp32, greedy, `max_new_tokens=512`, batch 8), prompt y pista de idioma fijos, y prohibición de editar `thinker.model.embed_tokens` (ligado a la cabeza de salida). Cada brazo de agente opera bajo un presupuesto de forward passes (10, 25 o 50) registrado en `logs/forward_passes.jsonl`, y el conjunto de test es de uso único: el arnés `eval/run_test.py` rechaza sobrescribir resultados existentes y los brazos nunca vieron datos de test. Los datos de evaluación provienen de Google FLEURS (CC-BY-4.0), con conjuntos de práctica, test y estrés construidos con semillas fijas (seed 0 para práctica/test, seeds 1 y 2 para estrés).

## Capacidades

- Reconocimiento automático del habla (ASR) en turco, inglés, alemán, árabe, ruso y japonés, heredado del modelo base Qwen3-ASR-0.6B.
- Clasificación de idioma (language ID) junto con la transcripción, que es precisamente la capacidad corregida por la edición de pesos.
- Transcripción robusta de audio con silencio digital prolongado alrededor del habla, el escenario de fallo objetivo del experimento.
- Edición de pesos reproducible y auditable: cada archivo `edits/<arm>.pt` incluye metadatos y puede regenerarse desde los pesos originales con `edits/<arm>_make.py`.
- Controles experimentales: cinco ediciones de dirección aleatoria normalizadas por brazo (`edits/<arm>_control_s{1..5}.pt`) para comparar el efecto de la edición dirigida frente al azar.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá del ASR estándar del modelo base.

## Casos de uso

- Investigación en interpretabilidad de modelos: el repositorio permite reproducir el diagnóstico y la localización de un fallo concreto en un transformer ASR, con registros de cada forward pass y análisis de convergencia entre brazos en `results/arms_summary.md`.
- Estudio de weight-space programming: sirve como reimplementación independiente del método de Takehi et al. sobre un modelo y una tarea distintos, útil para validar la generalidad de las ediciones analíticas de rango 1.
- Evaluación de robustez ASR ante silencio: el conjunto de estrés (`build_stress.py`) y las recetas documentadas permiten medir cuántos clips con silencio prolongado se clasifican erróneamente como "sin habla" antes y después de la edición.
- Docencia y formación en edición de modelos: el código separa claramente análisis de pesos en CPU (gratuito) y llamadas al modelo con presupuesto, lo que facilita usarlo como material didáctico sobre coste computacional y reproducibilidad.
- Comparación de metodologías de edición: los controles de dirección aleatoria permiten contrastar si una edición dirigida supera estadísticamente a ediciones aleatorias del mismo tamaño, un caso práctico de diseño experimental en IA.
- Auditoría de licencias y linaje de modelos: al ser un derivado Apache 2.0 de un modelo base también Apache 2.0, sirve como ejemplo de cómo documentar crédito, datos (FLEURS, CC-BY-4.0) y asistencia de IA en un artefacto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el fallo objetivo en términos cualitativos y cuantitativos parciales: 30 de 40 clips del conjunto de estrés de test presentaban la etiqueta `language None<asr_text>` antes de la edición. No se proporcionan cifras de WER, accuracy de language ID ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,6 mil millones de parámetros en fp32 el modelo base ocupa aproximadamente 2,4 GB de pesos, más memoria para activaciones y audio.
- GPU recomendadas: no especificadas en la información disponible; el experimento usa decodificación en fp32 y se documentan versiones y hardware en `docs/REPRODUCIBILITY.md`.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,6B, aunque no se confirma en la documentación.
- Opciones de despliegue: el repositorio proporciona su propio arnés (`wsp/model.py` con `load_model` y `transcribe`) y aplica ediciones mediante archivos `.pt`; no se documenta integración con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Qwen3-ASR-0.6B-weight-space-programming | 0,6B | no disponible | Apache 2.0 | ASR con edición analítica de pesos para corregir language ID |
| Qwen/Qwen3-ASR-0.6B (base) | 0,6B | no disponible | Apache 2.0 | ASR sin editar; presenta el fallo de language ID en silencio prolongado |
| Whisper small (referencia de la misma categoría) | ~244M | no disponible | MIT | ASR multilingüe de referencia; no comparable en método de edición |

No se dispone de datos de rendimiento comparativos publicados en la información proporcionada para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción ni validación externa.
- La edición corrige un fallo muy específico (language ID con silencio digital prolongado); no se documenta su efecto sobre otras condiciones, idiomas o tipos de audio.
- El conjunto de test es de uso único por diseño; reutilizarlo invalida la interpretación de los resultados y el arnés lo impide deliberadamente.
- Se documenta no determinismo conocido en `docs/REPRODUCIBILITY.md`; los resultados pueden no ser bit a bit reproducibles.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un derivado de un modelo ASR, hereda los sesgos del modelo base y de los datos FLEURS.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el trabajo original de weight-space programming (Takehi et al.) debe citarse si se reutiliza el método o el código.
- La model card advierte que parte del contenido es "ai-generated-research" con asistencia de agentes Claude; conviene auditar el código y los resultados antes de confiar en ellos.
- No se documentan cuantizaciones ni formatos GGUF, lo que limita el despliegue en entornos de inferencia estándar sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tahaenesaslanturk/Qwen3-ASR-0.6B-weight-space-programming
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Trabajo original "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Dataset Google FLEURS: https://huggingface.co/datasets/google/fleurs
