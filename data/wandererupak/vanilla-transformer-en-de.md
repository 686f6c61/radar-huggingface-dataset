# wandererupak/vanilla-transformer-en-de

## Resumen

`vanilla-transformer-en-de` es una implementación desde cero del Transformer original de Vaswani et al. (2017) para traducción automática inglés-alemán, publicada por el usuario wandererupak (Rupak Tiwari, Universidad de Katmandú). No se trata de un modelo de propósito general ni de un LLM conversacional, sino de una reproducción académica de la arquitectura encoder-decoder canónica con embeddings posicionales sinusoidales, atención multi-cabeza y cross-attention, pensada para estudiar y validar el pipeline completo de entrenamiento de un sistema de traducción neuronal.

El modelo se ha entrenado con 200.000 pares del corpus WMT14 English-German, lo que lo sitúa muy por debajo del régimen de datos habitual en traducción neuronal de producción (el WMT14 completo ronda los 4,5 millones de pares). La model card no especifica el número de parámetros, la dimensión del modelo, el número de capas ni la longitud de contexto, por lo que estos datos deben considerarse no disponibles.

Su relevancia es fundamentalmente didáctica y de reproducibilidad: sirve como referencia mínima funcional de la arquitectura Transformer para quienes quieran inspeccionar pesos, curvas de entrenamiento (publicadas en Weights & Biases) o comparar variantes arquitectónicas. No está pensado para despliegue en producción ni compite con modelos de traducción comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Vaswani 2017): posiciones sinusoidales, atencion multi-cabeza, cross-attention, feed-forward con ReLU, post-layer-norm |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en), aleman (de) |
| Licencia | MIT |
| Formato de pesos | no disponible (libreria declarada: PyTorch) |

## Arquitectura y entrenamiento

La arquitectura sigue fielmente el diseño del paper "Attention Is All You Need": encoder y decoder apilados con atención multi-cabeza, atención cruzada entre decoder y encoder, red feed-forward con activación ReLU y normalización de capa en configuración post-norm (es decir, `LayerNorm` aplicada después de cada subcapa residual). Los embeddings posicionales son sinusoidales fijos, no aprendidos. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas ni el tamaño del vocabulario, por lo que la configuración exacta es no disponible.

El entrenamiento se realizó desde cero (from scratch) sobre 200.000 pares del corpus WMT14 English-German, sin indicios de inicialización desde un modelo preentrenado ni de técnicas de alineación posteriores como RLHF o DPO. No se menciona el uso de decodificación especulativa, atención lineal ni otras innovaciones; se trata del Transformer estándar. Las curvas de entrenamiento están publicadas en Weights & Biases y el autor indica que la evaluación aún no ha finalizado, de modo que no hay métricas de test cerradas.

## Capacidades

- Traducción automática unidireccional inglés a alemán (y potencialmente alemán a inglés si el entrenamiento fue bidireccional, aunque la model card no lo confirma).
- Generación de texto condicionada a una secuencia fuente mediante decodificación autorregresiva encoder-decoder.
- Reproducción de la arquitectura Transformer original, útil para inspección de pesos y estudio de atención.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documenta modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada exclusivamente a los dos idiomas del corpus (en, de).
- No se documenta razonamiento de múltiples pasos ni matemáticas más allá de lo que la traducción pueda requerir.

## Casos de uso

- Estudio académico de la arquitectura Transformer: el modelo permite cargar los pesos y visualizar mapas de atención, embeddings posicionales y flujo encoder-decoder en un cuaderno, gracias a que es una implementación canónica sin modificaciones.
- Reproducción de experimentos de traducción neuronal: sirve como línea base mínima (200.000 pares, WMT14) para comparar con variantes como pre-norm, atención lineal o modelos preentrenados, ya que las curvas de entrenamiento son públicas en W&B.
- Docencia en cursos de NLP: adecuado para explicar paso a paso el pipeline de tokenización, entrenamiento y decodificación en traducción automática, dado su tamaño presumiblemente reducido y su licencia MIT.
- Pruebas de integración de pipelines de inferencia PyTorch: útil para validar infraestructura de serving (por ejemplo, scripts de carga de `state_dict`, tokenizadores y decodificación beam search) antes de pasar a modelos mayores.
- Traducción de frases cortas en entornos controlados y sin requisitos de calidad de producción, siempre que se acepte la limitación de datos de entrenamiento.
- Generación de pares de traducción sintéticos para aumentación de datos en tareas de dominio muy acotado, con revisión humana posterior dada la calidad esperada limitada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación no ha finalizado y que las métricas declaradas en los tags (BLEU, chrF, COMET) corresponden a la configuración prevista, no a resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el número de parámetros ni la dimensión del modelo.
- GPU recomendadas: no disponible por la misma razón; si la configuración sigue el Transformer base del paper (~65M parámetros), cabría holgadamente en cualquier GPU consumer con 4-8 GB de VRAM, pero esto es una suposición no confirmada por el autor.
- Compatibilidad con GPU consumer: no confirmada.
- Opciones de despliegue: al estar publicado como pesos PyTorch (`library_name: pytorch`), el despliegue requeriría scripts propios de carga y decodificación; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vanilla-transformer-en-de (este modelo) | no disponible | no disponible | Transformer from scratch, 200k pares WMT14 | MIT | Hugging Face |
| Helsinki-NLP/opus-mt-en-de | no disponible en esta ficha | no disponible | Transformer entrenado con OPUS | CC-BY-4.0 (segun modelo) | Hugging Face |
| facebook/mbart-large-50 | no disponible en esta ficha | no disponible | Transformer multilingue preentrenado | MIT | Hugging Face |
| t5-base | no disponible en esta ficha | no disponible | Transformer encoder-decoder preentrenado | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo verificables para este modelo, por lo que la comparativa se limita a enfoque, licencia y disponibilidad. Cualquier afirmación sobre calidad relativa frente a los alternativas requeriría métricas BLEU/COMET que el autor aún no ha publicado.

## Limitaciones y advertencias

- Entrenado con solo 200.000 pares de WMT14, muy por debajo del corpus completo; la calidad de traducción esperada es limitada y probablemente inferior a la de modelos entrenados con millones de pares.
- Evaluación no finalizada: no hay métricas de test publicadas, por lo que no se puede afirmar su rendimiento real.
- Sesgos desconocidos: no se documenta análisis de sesgo de género, dominio ni sesgos culturales en el corpus WMT14.
- Riesgo de alucinación y traducciones infieles en frases largas o fuera de dominio, habitual en modelos pequeños entrenados con datos limitados.
- Longitud de contexto no documentada; no se garantiza el manejo de secuencias largas.
- Uso restringido a inglés y alemán; no soporta otros idiomas.
- Licencia MIT permite uso comercial, pero la ausencia de métricas y de documentación técnica desaconseja su uso en producción sin evaluación previa.
- No se especifica el formato exacto de los pesos ni el tokenizador asociado, lo que puede complicar la reproducibilidad.
- Fecha de creación declarada en 2026-11-23, posterior a la fecha actual de muchos entornos; conviene verificar la integridad del repositorio antes de confiar en él.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wandererupak/vanilla-transformer-en-de
- Curvas de entrenamiento (run concreto): https://wandb.ai/rupaktiwari-kathmandu-university/transformer-scratch/runs/k5pt4xoy
- Proyecto W&B (comparativa de arquitecturas): https://wandb.ai/rupaktiwari-kathmandu-university/transformer-scratch
- Paper original: Vaswani et al., "Attention Is All You Need" (2017), https://arxiv.org/abs/1706.03762
- Dataset: WMT14 English-German (referenciado en la model card, sin enlace directo proporcionado)
