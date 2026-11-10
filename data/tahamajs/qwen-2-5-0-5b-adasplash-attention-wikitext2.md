# tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2

## Resumen

Este repositorio contiene un experimento de cirugía de atención sobre el modelo Qwen2.5-0.5B, publicado por el usuario tahamajs bajo el identificador `tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2`. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: es un modelo base Qwen2.5-0.5B al que se le ha sustituido el mecanismo de atención original por una implementación denominada `adasplash_attention`, registrada en un `ATTENTION_REGISTRY` del framework NeuralOps, y posteriormente se ha intentado recuperar la calidad mediante destilación de conocimiento (KD) sobre el dataset WikiText-2 en su variante `wikitext-2-raw-v1`.

El resultado documentado en la model card es un fracaso técnico explícito: la perplejidad causal antes de la destilación era de 667.208,85 y después de la destilación pasó a `inf`, con un delta de `+inf`. La destilación se ejecutó durante 60,9 segundos en una NVIDIA RTX 3090 con un patrón de sustitución de atención etiquetado como `hybrid_3_1`. El repositorio ocupa 0,0 GB, no registra descargas ni likes y no declara licencia, idiomas ni pipeline.

Su relevancia es, por tanto, metodológica y negativa: sirve como evidencia reproducible de que una sustitución agresiva del mecanismo de atención sobre un transformer preentrenado, seguida de una destilación muy corta sobre un corpus pequeño, puede colapsar el modelo hasta producir perplejidad infinita. No debe emplearse en producción ni como base para aplicaciones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-0.5B) con atención sustituida por `adasplash_attention` (patrón `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no verificado en el repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-0.5B, no confirmada tras la cirugía) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el tamaño del repo es 0,0 GB, lo que sugiere que no se subieron pesos) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 0,5 mil millones de parámetros. Sobre esa base se aplicó una "cirugía" que reemplaza el mecanismo de atención por `adasplash_attention`, una implementación registrada en el `ATTENTION_REGISTRY` del stack NeuralOps del autor. El patrón de sustitución se denomina `hybrid_3_1`, lo que sugiere una combinación híbrida de capas con atención original y capas con la nueva atención en proporción 3:1, aunque la model card no detalla la asignación exacta por capa.

El único dato de entrenamiento disponible es que se realizó una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), un corpus de Wikipedia en inglés de tamaño reducido, durante 60,9 segundos en una RTX 3090. No se especifican tokens procesados, función de pérdida, hiperparámetros, optimizador ni si hubo fases adicionales de ajuste. Los resultados de perplejidad indican que la cirugía degradó el modelo de forma catastrófica (PPL pre-KD de 667.208,85) y que la destilación no solo no recuperó la calidad, sino que la llevó a `inf`, es decir, a una distribución de probabilidad degenerada.

## Capacidades

- Generación de texto: no verificable; la perplejidad infinita sugiere que el modelo no produce distribuciones de probabilidad válidas.
- Razonamiento, código y matemáticas: no disponible; no hay evidencia de que estas capacidades sobrevivan a la cirugía.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el único corpus de ajuste documentado es WikiText-2 en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre cirugía de mecanismos de atención: el repositorio documenta un procedimiento reproducible de sustitución de atención (`hybrid_3_1`) y su impacto medido en perplejidad, útil para estudiar qué falla cuando se reemplaza la atención en un modelo preentrenado.
- Estudio de colapso por destilación: el salto de PPL 667.208,85 a `inf` en 60,9 segundos constituye un caso de referencia sobre destilación insuficiente o mal configurada sobre corpus pequeño.
- Reproducción de experimentos de NeuralOps: sirve para validar el `ATTENTION_REGISTRY` y el pipeline de sustitución del autor en un entorno controlado (RTX 3090).
- Análisis de robustez de Qwen2.5-0.5B: permite medir cuánto tolera la arquitectura base una alteración estructural de la atención antes de degenerar.
- Docencia sobre perplejidad y validación de modelos: ejemplo claro de por qué la PPL debe comprobarse antes de publicar un checkpoint.
- Auditoría de repositorios de Hugging Face: caso de estudio de model cards que declaran métricas de fallo y de repositorios sin pesos subidos (0,0 GB).

No se recomienda ningún uso en producción, atención al cliente, generación de código ni pipelines reales, dado que el modelo no produce salidas utilizables.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad causal pre-KD | 667.208,85 | Sobre WikiText-2, tras la cirugía de atención |
| Perplejidad causal post-KD | `inf` | Tras destilación de 60,9 s en RTX 3090 |
| Delta de perplejidad | `+inf` | Respecto al valor pre-KD |
| Tiempo de destilación | 60,9 s | NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un modelo de 0,5 mil millones de parámetros en FP16 se necesitan aproximadamente 1 GB de pesos, pero la viabilidad de la inferencia no está confirmada.
- GPU recomendadas: la única GPU documentada en el proceso es una NVIDIA RTX 3090 (usada para la destilación).
- Cabe en GPU de consumo: previsiblemente sí por tamaño (0,5B), aunque el estado degenerado del modelo hace la inferencia inútil.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y el repositorio no contiene pesos (0,0 GB).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2 | 0,5B | no disponible | Colapsado (PPL `inf`) | no disponible | Repo de 0,0 GB, sin pesos |
| Qwen2.5-0.5B (base original) | 0,5B | 32.768 tokens (según documentación de Qwen) | Funcional | Apache 2.0 (según Qwen) | Pesos públicos en Hugging Face |
| Qwen2.5-1.5B | 1,5B | 32.768 tokens (según documentación de Qwen) | Funcional | Apache 2.0 (según Qwen) | Pesos públicos en Hugging Face |

La comparación relevante es con el propio Qwen2.5-0.5B original: mismo tamaño, pero con atención intacta y pesos distribuidos. Cualquier alternativa funcional de la familia Qwen2.5 es preferible para uso real.

## Limitaciones y advertencias

- Modelo degenerado: la perplejidad post-destilación es `inf`, lo que indica una distribución de probabilidad inválida; las salidas no son fiables.
- Sin pesos publicados: el tamaño del repositorio es 0,0 GB, por lo que no se puede cargar el modelo tal cual desde Hugging Face.
- Licencia no declarada: no se especifica licencia, lo que impide determinar si el uso comercial está permitido; además, la licencia del Qwen2.5-0.5B base (Apache 2.0 según su documentación) debería respetarse.
- Idiomas no declarados: el único corpus documentado es WikiText-2 en inglés; no hay evidencia de capacidades multilingües.
- Sesgos: no documentados; al derivar de Qwen2.5-0.5B y WikiText-2, heredaría los sesgos de ambos, pero no se han evaluado.
- Riesgo de alucinación: máximo, dado que el modelo no genera distribuciones válidas.
- Contexto: no confirmado tras la cirugía de atención; la ventana original de Qwen2.5-0.5B no está garantizada.
- Caveat de producción: no usar bajo ninguna circunstancia; es un artefacto de investigación con resultado fallido.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-adasplash-attention-wikitext2
- Modelo base Qwen2.5-0.5B (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
