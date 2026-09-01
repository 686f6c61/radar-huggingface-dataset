# YFC-112358/Qwen3.8-27B-TM-Gemma4-Glimmer-v3

## Resumen

Qwen3.8-27B-TM-Gemma4-Glimmer-v3 es un modelo experimental de 27.800 millones de parámetros creado por YFC-112358 mediante la técnica *Transport and Merge* (T&M, arXiv 2602.05495), que fusiona pesos de dos modelos heterogéneos sobre un modelo base sin ningún entrenamiento adicional. El modelo objetivo es `Qwen/Qwen3.8-27B` (64 capas, ancho 5120), al que se le inyectan las proyecciones de atención (`k_proj`, `o_proj`) de `google/gemma-4-31B` y las capas FFN (`gate_proj`, `up_proj`, `down_proj`) de `meta-models/Muse-Glimmer-30B`. La fusión se realiza mediante transporte óptimo con regularización entrópica adaptativa, aplicando una máscara que solo modifica los 128 canales de salida con mayor activación en el modelo objetivo.

El interés de este modelo reside en que explora la fusión *cross-architecture* a una escala mucho mayor que la de los experimentos originales del paper T&M (que usaban objetivos de 1B y fuentes de 7B-32B). Aquí el objetivo es de 27B y las fuentes de 30B, con diferencias de ancho, capas, vocabulario y mecanismo de atención. El autor declara explícitamente que el modelo **no ha sido evaluado** y que el repositorio existe para responder de forma reproducible a la pregunta de si estos tres modelos pueden fusionarse de esta manera. La licencia es Apache 2.0, aunque los pesos derivados de Gemma pueden estar sujetos a restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.8-27B) con módulos fusionados de Gemma 4 31B y Muse-Glimmer-30B |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles (solo safetensors en precisión nativa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con posibles restricciones por los pesos de Gemma) |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura completa de `Qwen/Qwen3.8-27B` como esqueleto: 64 capas, ancho de 5120, atención con Gated DeltaNet, torre de visión y cabeza MTP (multi-token prediction). Sobre esta base se aplica el algoritmo *Transport and Merge* (T&M) para fusionar, en cada capa, las proyecciones de atención `k_proj` y `o_proj` desde Gemma 4 31B, y las proyecciones FFN `gate_proj`, `up_proj` y `down_proj` desde Muse-Glimmer-30B. La fusión se realiza por pares de capas (target l, source m) mediante transporte óptimo con regularización entrópica (Sinkhorn, 200 iteraciones) y un parámetro `eps` adaptativo por par, calculado como `eps = gap / ln(m/delta)`. El peso fusionado se obtiene como `W_fused = (1-a)*W_A + a * sum_m P_eff[l,m] * Q_out W_B Q_in^T` con `a=0.05`, y solo se modifican los 128 canales de salida con mayor magnitud de activación en el target (top-128 mask). El vocabulario, las incrustaciones, las capas de normalización, las capas Gated DeltaNet, la torre de visión y la cabeza MTP se mantienen intactos byte a byte.

No hay entrenamiento: el proceso es completamente *zero-shot* sobre los pesos. El autor documenta un diagnóstico detallado de la calidad del transporte (z-scores, DMR, etc.) y advierte que la fusión de dos fuentes simultáneas es una extrapolación del algoritmo original, que solo contemplaba una fuente. Además, se excluyó `q_proj` del plan de fusión porque su estructura interna (subbloques intercalados de query y gate) no es compatible con un único plan de transporte.

## Capacidades

- Generación de texto y razonamiento: al estar basado en Qwen3.8-27B, hereda las capacidades generales de ese modelo, aunque no hay evaluación específica del merge.
- Soporte de tool calling / function calling: no confirmado para este merge; depende del modelo base y no se ha verificado.
- Capacidades multimodales: el pipeline declarado es `image-text-to-text`, lo que sugiere que el modelo base Qwen3.8-27B incluye una torre de visión, pero no se ha probado en esta versión fusionada.
- Capacidades multilingües: no disponibles; el modelo base de Qwen suele ser multilingüe, pero no hay datos para este merge.
- Sin modo *thinking* ni características especiales documentadas más allá de las del modelo base.

## Casos de uso

Dado que el modelo no ha sido evaluado, los casos de uso son hipotéticos y deben considerarse con extrema cautela. Se listan escenarios plausibles basados en el modelo base, pero sin validación empírica:

- Investigación sobre fusión de modelos: el repositorio sirve como referencia reproducible para estudiar la viabilidad de T&M con objetivos grandes y fuentes heterogéneas. Un investigador podría replicar el proceso y comparar con el modelo base.
- Experimentación en generación de texto: si el merge funciona, podría usarse para tareas de generación creativa o técnica, pero requiere validación previa con benchmarks.
- Pruebas de robustez de la fusión: el autor sugiere ejecutar el control `SHRINK_ONLY=True` para aislar el efecto de la inyección de pesos; esto es un caso de uso metodológico.
- Desarrollo de pipelines de *model merging*: el código y los diagnósticos pueden servir para implementar variantes de T&M en otros modelos.
- Evaluación de degradación selectiva: comparar el rendimiento en tareas específicas (atención vs. FFN) para entender qué módulos se benefician o perjudican con la fusión.
- Base para ajuste fino posterior: si la fusión no degrada severamente, podría usarse como punto de partida para fine-tuning con datos específicos, aunque no hay evidencia de que supere al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que el modelo no ha sido evaluado ("【未评测】"). No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco se proporcionan métricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27,78 B parámetros en precisión fp16/bf16 (2 bytes por parámetro), se necesitan aproximadamente 55,6 GB solo para los pesos. En cuantización de 8 bits (no publicada) serían ~28 GB, y en 4 bits ~14 GB, pero no se ofrecen versiones cuantizadas.
- GPU recomendadas: para fp16 se requiere una GPU con al menos 60 GB de VRAM, como A100 80GB, H100 80GB o varias GPU en paralelo. En consumer, una RTX 4090 (24 GB) solo podría cargar el modelo con cuantización agresiva (4 bits) si se generara, pero no está disponible.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay configuraciones probadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8 B | no disponible | Apache 2.0 (presumible) | Modelo original sin fusionar |
| Gemma 4 31B | 31 B | no disponible | Licencia Gemma (términos específicos) | Fuente para atención |
| Muse-Glimmer-30B | 30 B | no disponible | no disponible | Fuente para FFN |
| Qwen3.8-27B-TM-Gemma4-Glimmer-v3 | 27,8 B | no disponible | Apache 2.0 (con caveats) | Merge experimental sin evaluar |

No se dispone de datos de rendimiento comparativo. La comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Modelo no evaluado: el autor declara que no se han realizado pruebas de rendimiento. Cualquier uso en producción es arriesgado y no recomendable sin una validación exhaustiva.
- Riesgo de degradación: la fusión con `a=0.05` y máscara top-128 introduce una perturbación relativa media de `|dW|/|W| = 0.01039`, que puede afectar negativamente a la coherencia del modelo.
- Sesgos y alucinaciones: al no haber sido evaluado, no se conocen sesgos específicos, pero hereda los del modelo base y los posibles artefactos de la fusión.
- Restricciones de licencia: aunque el repositorio se publica bajo Apache 2.0, los pesos de Gemma 4 31B están sujetos a la licencia de Google (que puede prohibir ciertos usos comerciales). El autor no aclara la compatibilidad.
- Limitaciones de contexto e idioma: no documentadas; se desconoce si la fusión afecta a la ventana de contexto o al soporte multilingüe.
- Extrapolación metodológica: el uso de dos fuentes simultáneas y la inversión de escala (target 27B, sources 30B) no está cubierto por el paper original de T&M, por lo que la validez del enfoque es incierta.
- Control necesario: el autor recomienda ejecutar la variante `SHRINK_ONLY` como grupo de control para verificar que la fusión realmente aporta algo frente a la simple reducción de pesos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/YFC-112358/Qwen3.8-27B-TM-Gemma4-Glimmer-v3
- Paper *Transport and Merge: Cross-Architecture Merging for Large Language Models* (arXiv 2602.05495): https://arxiv.org/abs/2602.05495
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base Gemma 4 31B: https://huggingface.co/google/gemma-4-31B
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
