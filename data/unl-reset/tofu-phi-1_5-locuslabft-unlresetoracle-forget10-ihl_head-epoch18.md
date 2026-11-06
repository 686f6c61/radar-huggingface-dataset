# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch18

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch18` es un checkpoint de investigación derivado de Phi-1.5, publicado por el usuario `unl-reset` en Hugging Face. Se trata de un ajuste fino experimental sobre `locuslab/tofu_ft_phi-1.5` (la variante de Phi-1.5 afinada sobre el dataset TOFU) cuyo objetivo declarado es el "machine unlearning": eliminar de forma selectiva el conocimiento asociado a un subconjunto de datos (el split *forget10*) manteniendo el rendimiento sobre el resto (el split *retain*).

La receta aplicada combina dos técnicas: por un lado, la inicialización de los *input embeddings* y de la *LM head* a partir del modelo original `microsoft/phi-1_5`, y por otro, un entrenamiento con una pérdida compuesta que suma un término de *token IHL* (probablemente *Information-Theoretic/Hinge Loss* sobre los datos a olvidar) y una entropía cruzada estándar (CE) ponderada con factor 1.0 sobre los datos a retener. El checkpoint corresponde a la época 18 de 20.

El interés del modelo es fundamentalmente académico: sirve como artefacto reproducible para estudiar hasta qué punto es posible borrar información de un LLM sin degradar sus capacidades generales, y para evaluar metodologías de *unlearning* sobre un modelo pequeño (1.400 millones de parámetros) que cabe en una GPU de consumo. No está pensado para uso en producción ni para tareas generales de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Phi-1.5) |
| Parametros totales | 1.418.270.720 (~1,4 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 usa 2048 tokens como referencia de la familia; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en fp32/fp16; sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; incluye `ihl_manifest.json`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de 1.400 millones de parámetros entrenado originalmente por Microsoft sobre datos de texto y código de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplicó un ajuste fino supervisado con el dataset TOFU (fictional university biographies), y este checkpoint añade una etapa adicional de *unlearning* orientada al split *forget10*.

La innovación técnica del checkpoint es la estrategia de reinicialización parcial más pérdida compuesta. Los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5` (es decir, se descartan los aprendidos durante el ajuste fino TOFU en esas capas), mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. El entrenamiento minimiza `token IHL` sobre los datos a olvidar más `1.0 * CE` sobre los datos a retener. No se especifican en la model card el número de tokens vistos, la composición exacta del dataset ni si hubo RLHF/DPO; el proceso es puramente de ajuste fino con pérdida supervisada. El checkpoint publicado corresponde a la época 18 de 20, lo que sugiere un entrenamiento corto y posiblemente inestable en sus últimas épocas.

## Capacidades

- Generación de texto en inglés, heredada de Phi-1.5.
- Razonamiento básico y respuesta a preguntas de conocimiento general (potencialmente degradado por el proceso de *unlearning*).
- Generación de código y matemáticas a nivel de Phi-1.5 (capacidad de la familia base, no verificada en este checkpoint).
- No se documenta soporte de *tool calling* ni *function calling*.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la model card.
- No dispone de modo *thinking*, visión ni audio.
- Su función real es servir como artefacto de evaluación de *unlearning*, no como asistente general.

## Casos de uso

- Investigación en *machine unlearning*: reproducir el pipeline IHL + Reset sobre TOFU *forget10* y comparar curvas de olvido/retención frente a otros métodos (gradient ascent, KL regularization, etc.).
- Evaluación de privacidad en LLM: medir cuánta información del split *forget10* sigue siendo extraíble mediante *probing* o ataques de membresía.
- Benchmark de degradación: cuantificar la pérdida de capacidad general (perplejidad en *retain*, MMLU, etc.) causada por 18 épocas de entrenamiento con pérdida de olvido.
- Estudio de reinicialización de capas: analizar el efecto de resetear *embeddings* y *LM head* frente a conservarlos, aislando la contribución de cada componente.
- Docencia y experimentación: modelo de 1,4 B que cabe en una GPU de consumo (RTX 3090/4090) para prácticas de ajuste fino y *unlearning*.
- Reproducibilidad de papers: punto de control intermedio (época 18/20) útil para estudiar la dinámica de entrenamiento y el momento en que aparece el olvido efectivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: ~2,8 GB de pesos más overhead de activaciones y KV cache; en la práctica ~4-6 GB.
- En cuantización de 8 bits: ~1,5 GB; en 4 bits: ~0,8-1 GB (no hay GGUF oficial; requeriría conversión manual).
- GPU recomendadas: cualquier GPU con ≥8 GB (RTX 3060 Ti, RTX 3070, RTX 4060 Ti) para fp16; A100/H100 solo si se necesita alto throughput en evaluación por lotes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior con comodidad.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`), vLLM y TGI tras verificar compatibilidad con el código personalizado; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (TOFU IHL forget10) | 1,4 B | no disponible | *Unlearning* TOFU | apache-2.0 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` | 1,4 B | no disponible | Base ajustada TOFU | no disponible | Hugging Face |
| `microsoft/phi-1_5` | 1,4 B | 2048 | Modelo base texto/código | MIT | Hugging Face |
| `microsoft/Phi-3-mini-4k-instruct` | 3,8 B | 4096 | Asistente general | MIT | Hugging Face |

La comparación relevante es con el modelo base `locuslab/tofu_ft_phi-1.5` (del que este checkpoint es una variante con *unlearning*) y con `microsoft/phi-1_5` (origen de los embeddings y LM head reinicializados). Frente a Phi-3-mini, este modelo es claramente inferior en capacidades generales, pero su propósito es distinto: servir de artefacto de investigación en olvido selectivo.

## Limitaciones y advertencias

- Modelo de investigación: no validado para uso en producción ni para tareas generales de generación.
- Riesgo de alucinación elevado, especialmente tras 18 épocas de entrenamiento con pérdida de olvido, que puede distorsionar la distribución de salida.
- El *unlearning* no garantiza la eliminación completa de la información del split *forget10*; pueden persistir trazas extraíbles.
- Idiomas: solo inglés; sin soporte multilingüe documentado.
- Licencia apache-2.0 heredada, pero conviene verificar las condiciones de los modelos base (`locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5`) antes de uso comercial.
- Requiere `trust_remote_code=True` por el `custom_code` incluido; auditar el código antes de ejecutarlo.
- Sin datos de benchmarks ni de evaluación de calidad publicados; imposible estimar su degradación real sin ejecutar evaluaciones propias.
- Checkpoint intermedio (época 18/20), no el final del entrenamiento; puede no representar el punto óptimo de la receta.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ); el despliegue eficiente requiere conversión manual.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch18
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
