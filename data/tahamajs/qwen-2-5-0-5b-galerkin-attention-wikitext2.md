# tahamajs/qwen-2.5-0.5b-galerkin-attention-wikitext2

## Resumen

Qwen-2.5-0.5B con atención Galerkin es un experimento de investigación publicado por el usuario tahamajs en Hugging Face, que parte del modelo base Qwen2.5-0.5B (535.364.224 parámetros reales según los pesos en safetensors) y sustituye parte de su mecanismo de atención por una implementación denominada `galerkin_attention`, registrada en una `ATTENTION_REGISTRY` del proyecto NeuralOps. Se trata, por tanto, de un modelo derivado, no de un modelo entrenado desde cero: la arquitectura subyacente sigue siendo un transformer Qwen2 con 0,5 mil millones de parámetros, pero con un patrón de sustitución híbrido (`hybrid_3_1`) que reemplaza capas de atención convencionales por la variante Galerkin.

El modelo se ha ajustado mediante destilación de conocimiento sobre el conjunto WikiText-2 (`wikitext-2-raw-v1`), un corpus de texto en inglés de Wikipedia, con el objetivo de recuperar la coherencia tras la cirugía de atención. Los datos de la model card muestran una perplejidad causal previa a la destilación de 295.128,06 y posterior de 153,16, lo que indica que la intervención quirúrgica destruye inicialmente el modelo y que la destilación de 180,1 segundos en una NVIDIA RTX 3090 consigue reducirlа drásticamente, aunque sin alcanzar los valores típicos del Qwen2.5-0.5B original.

La relevancia de este checkpoint es fundamentalmente metodológica: sirve como prueba de concepto de que es posible injertar mecanismos de atención alternativos en un transformer preentrenado y recuperar un comportamiento mínimamente funcional con un coste de cómputo muy bajo (unos tres minutos en una GPU de consumo). No obstante, el modelo no está pensado para producción: no declara licencia, no declara idiomas, no tiene pipeline asignado y no cuenta con descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2 con atención `galerkin_attention` inyectada (patrón `hybrid_3_1`) |
| Parametros totales | 535.364.224 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del Qwen2.5-0.5B base, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible (el ajuste se ha hecho sobre WikiText-2, en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de la familia Qwen2 con 535 millones de parámetros. Sobre esa base se aplica una "cirugía" de atención: se sustituyen determinadas capas de self-attention por una implementación denominada `galerkin_attention`, registrada en la `ATTENTION_REGISTRY` del proyecto NeuralOps. El patrón `hybrid_3_1` indica una combinación de capas con atención estándar y capas con atención Galerkin, aunque la model card no detalla qué proporción exacta ni en qué posiciones se aplica. El nombre "Galerkin" sugiere una formulación de proyección o aproximación inspirada en métodos de elementos finitos, pero no se aporta el paper ni la definición formal del mecanismo.

Tras la sustitución, el modelo queda funcionalmente roto: la perplejidad causal medida sobre WikiText-2 asciende a 295.128,06. Para recuperarlo se aplica destilación de conocimiento sobre `wikitext-2-raw-v1`, presumiblemente destilando desde el modelo original hacia el modelo modificado, durante 180,1 segundos en una NVIDIA RTX 3090. El resultado es una perplejidad causal de 153,16, una reducción de 294.974,90 puntos. No se especifican hiperparámetros de destilación, número de tokens vistos, función de pérdida ni si hubo fases adicionales de RLHF o DPO. Tampoco se documenta el dataset de destilación más allá de WikiText-2, ni la composición exacta del corpus.

## Capacidades

- Generación de texto autoregresiva: al conservar la cabeza y el tokenizador de Qwen2.5-0.5B, el modelo puede generar texto, aunque la calidad tras la cirugía y la destilación sobre WikiText-2 no está validada.
- Modelado de lenguaje: la métrica principal reportada es la perplejidad causal sobre WikiText-2 (153,16), lo que indica que el modelo ha recuperado cierta capacidad de predecir el siguiente token en ese dominio.
- Razonamiento y matemáticas: no disponible; no se han publicado evaluaciones de MMLU, GSM8K ni similares.
- Generación de código: no disponible; no se ha evaluado HumanEval ni ningún benchmark de código.
- Tool calling / function calling: no disponible; no se documenta soporte de herramientas.
- Agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el ajuste se ha realizado exclusivamente sobre WikiText-2 en inglés.
- Modo thinking, visión o audio: no disponible; el modelo es solo texto.
- Capacidades especiales: la única característica diferencial es la atención Galerkin inyectada, que es un objeto de estudio, no una capacidad funcional adicional.

## Casos de uso

- Investigación sobre mecanismos de atención alternativos: el modelo sirve como banco de pruebas para estudiar cómo se comporta una atención tipo Galerkin injertada en un transformer preentrenado, comparando perplejidad antes y después de la destilación.
- Reproducción de experimentos de "attention surgery": dado que la model card documenta el patrón `hybrid_3_1` y los valores de perplejidad, un investigador puede replicar el procedimiento sobre Qwen2.5-0.5B y verificar los resultados en su propio hardware.
- Estudio de destilación de conocimiento de bajo coste: el experimento demuestra que 180 segundos en una RTX 3090 bastan para reducir la perplejidad en casi tres órdenes de magnitud, lo que lo convierte en un caso de referencia para técnicas de recuperación rápida tras modificaciones arquitectónicas.
- Evaluación de robustez de transformers modificados: útil para medir hasta qué punto un modelo pierde capacidades (razonamiento, código, multilingüismo) cuando se altera su atención y solo se reentrena sobre un corpus genérico como WikiText-2.
- Docencia y formación: ejemplo didáctico de cómo se modifica un checkpoint de Hugging Face, se inyecta un módulo de atención y se documenta el antes y el después con métricas de perplejidad.
- Baseline para comparativas de atención eficiente: puede usarse como punto de partida para comparar la atención Galerkin con otras alternativas (atención lineal, sliding window, etc.) sobre el mismo modelo base y el mismo corpus.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-destilación (WikiText-2) | 295.128,06 |
| Perplejidad causal post-destilación (WikiText-2) | 153,16 |
| Delta de perplejidad | -294.974,90 |
| Tiempo de destilación | 180,1 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,1 GB solo para pesos (535 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB para pesos; en 4 bits, alrededor de 0,3 GB, aunque no se publican versiones GGUF ni cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16; una RTX 3090 (24 GB) es la GPU usada por el autor para la destilación.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores, siempre que se disponga de al menos 3-4 GB de VRAM libre.
- Opciones de despliegue: al publicarse solo en safetensors, se puede cargar con `transformers` (PyTorch). Para vLLM, llama.cpp, Ollama o TGI sería necesario convertir los pesos y, en su caso, cuantizarlos, lo cual no está documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-galerkin-attention-wikitext2 | 535.364.224 | no disponible | PPL 153,16 en WikiText-2 | no disponible | Hugging Face, 0 descargas |
| Qwen2.5-0.5B (base) | ~494 M (0,5 B) | 32.768 tokens (según documentación de Qwen) | PPL muy inferior a 153 en WikiText-2 (no reportada aquí) | Apache 2.0 (según Qwen) | Hugging Face, ampliamente descargado |
| Qwen2.5-1.5B (base) | ~1,5 B | 32.768 tokens | Superior al 0,5B en benchmarks estándar | Apache 2.0 | Hugging Face |
| Modelos de 0,5B con atención alternativa (p. ej. variantes lineales) | ~0,5 B | variable | no disponible | variable | variable |

La comparativa se limita a los datos disponibles: no se han publicado resultados de benchmarks estándar para el modelo Galerkin, por lo que la comparación con Qwen2.5-0.5B solo puede hacerse de forma cualitativa a partir de la perplejidad en WikiText-2, que en el modelo modificado (153,16) es muy superior a la que cabría esperar del modelo base sin modificar.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al haberse ajustado sobre WikiText-2 (Wikipedia en inglés), puede heredar sesgos del corpus y del modelo base Qwen2.5-0.5B.
- Riesgo de alucinación: elevado en la práctica, dado que la perplejidad post-destilación (153,16) es alta y el modelo solo ha visto WikiText-2 durante la recuperación; no se ha validado en tareas de razonamiento o generación abierta.
- Limitaciones de contexto e idioma: no se declara longitud de contexto ni idiomas soportados; el ajuste se ha hecho exclusivamente en inglés sobre WikiText-2, por lo que el rendimiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial; al derivar de Qwen2.5-0.5B, habría que verificar la licencia del modelo base (Apache 2.0 según la documentación de Qwen) y la del checkpoint derivado.
- Caveat para producción: el modelo no tiene pipeline asignado, no tiene descargas ni valoraciones, y su model card es un informe de experimento, no una ficha de modelo listo para uso. No se recomienda su despliegue en producción sin una evaluación exhaustiva previa.
- La cirugía de atención y la destilación sobre WikiText-2 no garantizan la preservación de capacidades como tool calling, código o multilingüismo, que no se han evaluado.
- No se publican pesos en GGUF ni cuantizaciones, lo que limita su uso en entornos con restricciones de memoria sin trabajo adicional de conversión.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-galerkin-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio de Qwen2.5 (GitHub): https://github.com/QwenLM/Qwen2.5
- Paper de Qwen2.5 (arXiv): https://arxiv.org/abs/2412.15115
- Documentación de Transformers sobre Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
