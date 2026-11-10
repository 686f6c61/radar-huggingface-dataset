# tahamajs/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2

## Resumen
Este repositorio contiene un experimento de modificación arquitectónica sobre el modelo base Qwen2.5-0.5B, en el que se sustituye el mecanismo de atención original por una atención denominada `dynamic_conv_attention`, registrada en el sistema `ATTENTION_REGISTRY` del autor (tahamajs). El modelo resultante se ha sometido a un proceso de destilación de conocimiento (KD) sobre el dataset WikiText-2 (`wikitext-2-raw-v1`), partiendo de una perplejidad causal muy elevada (356266,72) y alcanzando 216,40 tras la destilación, en un tiempo de 180,3 segundos sobre una NVIDIA RTX 3090.

Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción: no hay model card con especificaciones de uso, licencia ni idiomas, y el repositorio no declara pipeline. Su interés radica en documentar una técnica concreta de "cirugía" de atención (patrón `hybrid_3_1`) y su recuperación mediante destilación, no en ofrecer un asistente conversacional o un modelo de código.

El tamaño del repositorio (1,6 GB) es coherente con los pesos de un modelo de 0,5B parámetros en precisión completa o mixta. La fecha de creación y actualización (noviembre de 2026) sitúa el experimento en un contexto temporal posterior a los lanzamientos habituales de Qwen2.5, lo que refuerza su carácter de derivado experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen2.5, con atención sustituida por `dynamic_conv_attention` (patrón `hybrid_3_1`) |
| Parametros totales | 0,5B (heredados del modelo base Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no declarada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene 1,6 GB de pesos; formato exacto no declarado) |

## Arquitectura y entrenamiento
El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso de aproximadamente 0,5 mil millones de parámetros. Sobre esa base se aplica una "cirugía" que reemplaza el mecanismo de atención por `dynamic_conv_attention`, una variante registrada en el `ATTENTION_REGISTRY` del autor. El patrón de sustitución se denomina `hybrid_3_1`, lo que sugiere una combinación de capas con atención original y capas con la nueva atención en proporción 3:1, aunque la model card no detalla el criterio exacto ni qué capas se sustituyen.

Tras la sustitución, el modelo presenta una perplejidad causal de 356266,72, lo que indica que la nueva atención rompe el comportamiento aprendido. Para recuperar la funcionalidad se aplica destilación de conocimiento sobre WikiText-2, reduciendo la perplejidad a 216,40 (delta de -356050,32) en 180,3 segundos sobre una RTX 3090. No se especifican hiperparámetros de destilación, número de tokens, composición del dataset más allá de WikiText-2, ni si hubo RLHF o DPO. Tampoco se documenta si la atención `dynamic_conv_attention` introduce decodificación especulativa, atención lineal u otra innovación concreta.

## Capacidades
- Generación de texto autoregresiva heredada del modelo base Qwen2.5-0.5B, condicionada por la destilación sobre WikiText-2.
- Razonamiento básico y generación de texto genérico, limitado por el tamaño de 0,5B parámetros.
- Capacidades multilingües: no disponibles (no declaradas; el modelo base Qwen2.5 soporta múltiples idiomas, pero este derivado no lo especifica).
- Tool calling / function calling: no disponible (no declarado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- El único comportamiento documentado es la reducción de perplejidad en WikiText-2 tras la destilación, no capacidades funcionales verificadas.

## Casos de uso
- Investigación sobre mecanismos de atención alternativos: el modelo sirve como banco de pruebas para evaluar `dynamic_conv_attention` frente a la atención estándar de Qwen2.5, comparando perplejidad antes y después de la destilación.
- Estudio de técnicas de destilación de conocimiento: permite reproducir el pipeline de recuperación de un modelo dañado por cirugía arquitectónica, con métricas concretas (PPL pre y post-KD) y tiempos de ejecución en RTX 3090.
- Experimentos de "model surgery" en transformers: útil para investigadores que quieran validar patrones de sustitución como `hybrid_3_1` en modelos pequeños antes de escalar a modelos mayores.
- Evaluación de robustez de la atención: al comparar la perplejidad de 216,40 con la del modelo base, se puede medir cuánto se degrada la calidad al reemplazar la atención.
- Docencia y formación en arquitecturas de atención: el repositorio documenta un caso concreto de modificación y recuperación, útil para explicar el impacto de la atención en la perplejidad.
- Prototipado de bajo coste: con 0,5B parámetros y 1,6 GB de pesos, puede ejecutarse en hardware modesto para pruebas preliminares de la atención modificada, aunque su calidad no está validada para producción.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perplejidad causal sobre WikiText-2:

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD | 356266,72 |
| Perplejidad causal post-KD | 216,40 |
| Delta de perplejidad | -356050,32 |
| Tiempo de destilación | 180,3 s en NVIDIA RTX 3090 |

No hay datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; con 0,5B parámetros, en FP16 requiere aproximadamente 1 GB de pesos más memoria de activaciones y KV cache, y en cuantización de 8 bits o 4 bits podría caber en menos de 1 GB.
- GPU recomendadas: no declaradas; el autor usó una NVIDIA RTX 3090 para la destilación (180,3 s).
- Cabe en GPU consumer: previsiblemente sí, en tarjetas con 4-8 GB de VRAM, aunque no está verificado por el autor.
- Opciones de despliegue: no disponibles (no se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2 | 0,5B | no disponible | no disponible | Hugging Face (0 descargas) | Derivado experimental con atención sustituida y KD sobre WikiText-2 |
| Qwen2.5-0.5B (base) | 0,5B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (oficial) | Modelo original sin cirugía; referencia de perplejidad y capacidades |
| Otros derivados de Qwen2.5-0.5B | 0,5B | variable | variable | Hugging Face | No se dispone de datos concretos de alternativas comparables en la información proporcionada |

No se dispone de datos de rendimiento comparables (benchmarks) para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias
- Perplejidad post-KD de 216,40, muy superior a la de un modelo base bien entrenado; la calidad del texto generado es previsiblemente baja.
- La destilación se ha realizado únicamente sobre WikiText-2, lo que puede provocar sobreajuste a ese dominio y pobre generalización.
- No hay licencia declarada, lo que impide determinar si se permite uso comercial; debe tratarse como no apto para producción hasta aclararlo.
- No se declaran idiomas soportados ni contexto máximo; no se puede asumir el comportamiento multilingüe del modelo base.
- Riesgo de alucinación y sesgos heredados del modelo base Qwen2.5-0.5B, agravados por la cirugía y la destilación limitada.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria ni pipeline declarado; es un artefacto de investigación sin garantías.
- La fecha de creación (2026-11-10) y la falta de documentación adicional impiden verificar la reproducibilidad del experimento.
- No se especifican los hiperparámetros de destilación ni el criterio exacto del patrón `hybrid_3_1`, lo que dificulta replicar o auditar el resultado.

## Enlaces
- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-dynamic-conv-attention-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, no enlace público)
- Dataset WikiText-2: no se proporciona enlace directo en la información disponible
- Paper, blog, repositorio o demo del autor: no disponibles en la información proporcionada
