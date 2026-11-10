# tahamajs/qwen-2.5-0.5b-linformer-attention-wikitext2

## Resumen

Qwen-2.5-0.5B-linformer-attention-wikitext2 es un experimento de investigación publicado por el usuario tahamajs en Hugging Face. Se trata de un transplante de atención sobre el modelo base Qwen2.5-0.5B, en el que las capas de atención originales se sustituyen por una implementación denominada `linformer_attention` (registrada en un `ATTENTION_REGISTRY` propio del autor), aplicando un patrón de sustitución híbrido `hybrid_3_1`. El resultado se ha destilado sobre el conjunto de datos WikiText-2 (`wikitext-2-raw-v1`) durante 180,3 segundos en una NVIDIA RTX 3090.

El modelo cuenta con 486.998.656 parámetros reales según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños (sub-1B) aptos para hardware de consumo. El interés principal del artefacto no reside en su rendimiento absoluto, sino en documentar el procedimiento de cirugía de atención y el efecto de la destilación: la perplejidad causal pasó de 351.472,92 antes de la destilación a 900,43 después, una reducción de 350.572,49 puntos.

Se trata de un artefacto experimental con cero descargas y cero likes en el momento de la consulta, sin model card pública más allá de los metadatos del experimento y sin licencia declarada. No debe considerarse un modelo listo para producción, sino una prueba de concepto sobre sustitución de mecanismos de atención en transformers preentrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5-0.5B con atención sustituida por `linformer_attention` (patrón `hybrid_3_1`) |
| Parametros totales | 486.998.656 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-0.5B, no confirmada en la información) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen2.5-0.5B |
| Dataset de destilación | WikiText-2 (`wikitext-2-raw-v1`) |
| Patrón de cirugía | `hybrid_3_1` |
| PPL causal pre-destilación | 351.472,92 |
| PPL causal post-destilación | 900,43 |
| Delta de PPL | -350.572,49 |
| Tiempo de destilación | 180,3 s en NVIDIA RTX 3090 |
| Tamano del repo | 1,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de la familia Qwen2.5, y aplica una cirugía de atención: las capas de self-attention originales se reemplazan por una implementación `linformer_attention` registrada en el `ATTENTION_REGISTRY` del autor. El patrón `hybrid_3_1` sugiere una alternancia entre capas con atención Linformer y capas con atención original (probablemente tres capas transformadas por cada una preservada, aunque la información disponible no detalla la asignación exacta por capa). La atención Linformer es una aproximación de baja complejidad que proyecta las claves y valores a una dimensión reducida, sustituyendo la complejidad cuadrática por lineal respecto a la longitud de secuencia.

Tras la sustitución, el modelo se somete a un proceso de destilación sobre WikiText-2 durante 180,3 segundos en una RTX 3090. No se especifican hiperparámetros, número de tokens vistos, función de pérdida ni si hubo RLHF o DPO. El dato clave es la evolución de la perplejidad causal: el modelo tras el transplante sin destilar arroja una PPL de 351.472,92, lo que indica que la sustitución rompe el comportamiento del modelo; tras la destilación, la PPL baja a 900,43, todavía muy lejos de los valores típicos de Qwen2.5-0.5B sobre WikiText-2 (habitualmente en el rango de decenas). No se documentan innovaciones adicionales como decodificación especulativa o atención lineal híbrida más allá del propio transplante.

## Capacidades

- Generación de texto autoregresiva heredada de la arquitectura Qwen2.5, aunque degradada por la cirugía de atención y la destilación limitada.
- Modelado de lenguaje causal sobre dominio WikiText-2 (texto enciclopédico en inglés).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües específicas; el base Qwen2.5 las posee, pero la destilación solo se realizó sobre WikiText-2 en inglés.
- No se documenta modo thinking, visión ni audio.
- Capacidad experimental de atención lineal tipo Linformer sobre un transformer preentrenado, útil como referencia para investigación en eficiencia de atención.

## Casos de uso

- Investigación en eficiencia de atención: servir como punto de partida reproducible para estudiar cómo afecta la sustitución de self-attention por Linformer a un transformer preentrenado, usando la PPL pre y post destilación como métrica de referencia.
- Reproducción de cirugías de atención: el patrón `hybrid_3_1` y el `ATTENTION_REGISTRY` permiten replicar el experimento en otros modelos de la familia Qwen2.5 o en arquitecturas similares para comparar curvas de perplejidad.
- Benchmark de destilación rápida: con 180,3 s en una RTX 3090, el pipeline sirve para medir la viabilidad de destilaciones de bajo coste sobre datasets pequeños como WikiText-2.
- Estudio de degradación por transplante: la diferencia entre PPL 351.472,92 y 900,43 documenta cuantitativamente el coste de sustituir atención sin reentrenamiento completo, útil para calibrar expectativas en proyectos de pruning o linearización.
- Docencia y formación: ejemplo práctico de modificación de un modelo Hugging Face a nivel de módulos de atención, con pesos publicados en safetensors para inspección.
- Pruebas de infraestructura de inferencia: al ser un modelo de 487 M de parámetros y 1,1 GB en safetensors, permite validar pipelines de carga y ejecución en GPUs de consumo sin incurrir en costes elevados.
- No se recomienda su uso en aplicaciones de producción orientadas a usuario final debido a la PPL elevada y a la ausencia de licencia y evaluación.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-destilación (WikiText-2) | 351.472,92 |
| Perplejidad causal post-destilación (WikiText-2) | 900,43 |
| Delta de perplejidad | -350.572,49 |
| Tiempo de destilación | 180,3 s (RTX 3090) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para los pesos (487 M de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5 GB de pesos; en 4 bits, alrededor de 0,25 GB, aunque no se publican pesos cuantizados oficiales.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor validó el entrenamiento en una NVIDIA RTX 3090.
- Cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: transformers con PyTorch (carga directa desde safetensors); llama.cpp, Ollama o vLLM requerirían conversión previa a GGUF u otro formato, no publicada.
- Latencia y throughput: no disponibles; el único dato temporal es el de la destilación (180,3 s), no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-linformer-attention-wikitext2 | 487 M | no disponible | 900,43 (post-destilación) | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B (base) | 494 M aprox. | 32.768 tokens (según documentación oficial de Qwen) | no disponible en esta ficha | Apache 2.0 (según Qwen) | Hugging Face, ampliamente descargado |
| Modelos sub-1B comparables (p. ej. Llama 3.2 1B, SmolLM2-360M) | 360 M - 1,2 B | variable | no disponible | variable | Hugging Face |

La comparación directa con el base Qwen2.5-0.5B es la más relevante: el artefacto de tahamajs conserva el tamaño pero degrada sustancialmente la perplejidad, por lo que no es un sustituto funcional del original. No se dispone de datos de benchmarks generativos para situarlo frente a alternativas.

## Limitaciones y advertencias

- Perplejidad causal de 900,43 sobre WikiText-2, muy superior a la de modelos de su tamaño entrenados de forma convencional; la calidad de generación es previsiblemente baja.
- El transplante de atención sin reentrenamiento completo produjo una PPL de 351.472,92, lo que evidencia que la cirugía rompe el comportamiento del modelo base; la destilación solo recupera parcialmente.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; el modelo base Qwen2.5-0.5B sí tiene licencia Apache 2.0 según su documentación oficial, pero el artefacto derivado no la explicita.
- No se documentan idiomas soportados; la destilación se realizó únicamente sobre WikiText-2 en inglés, por lo que el multilingüismo del base puede haberse degradado.
- No hay evaluación de sesgos, alucinación ni robustez; se desconoce el comportamiento fuera del dominio enciclopédico.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- No se publican pesos en GGUF ni cuantizaciones, lo que limita el despliegue en herramientas como llama.cpp u Ollama sin conversión manual.
- No apto para producción: es un artefacto de investigación sin pipeline declarado ni evaluación de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-linformer-attention-wikitext2
- Modelo base Qwen2.5-0.5B (referencia): https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2 (referencia): https://huggingface.co/datasets/Salesforce/wikitext
- Paper de Linformer (referencia): https://arxiv.org/abs/2006.04768
