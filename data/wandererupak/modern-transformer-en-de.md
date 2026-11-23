# wandererupak/modern-transformer-en-de

## Resumen

modern-transformer-en-de es un modelo de traducción automática inglés-alemán desarrollado por el usuario wandererupak (Rupak Tiwari, Kathmandu University) y publicado en Hugging Face bajo licencia MIT. Se trata de un experimento de entrenamiento desde cero ("from scratch") sobre el corpus WMT14, con 200.000 pares de frases inglés-alemán, y no de un modelo derivado de un checkpoint preentrenado de gran escala.

La arquitectura es un transformer decoder-only con un conjunto de decisiones técnicas propias de los modelos lingüísticos modernos: Pre-RMSNorm, embeddings posicionales rotatorios (RoPE), atención con consultas agrupadas (grouped-query attention, GQA), normalización QK y una mezcla de expertos (MoE) de tipo top-2 con expertos SwiGLU. La model card no especifica el número de parámetros, la longitud de contexto ni la composición exacta de la mezcla de expertos.

El modelo es relevante como referencia educativa y de investigación: demuestra cómo aplicar técnicas de arquitectura contemporáneas a una tarea de traducción supervisada con un presupuesto de datos reducido. En el momento de redactar esta ficha no se han publicado métricas de evaluación finales (BLEU, chrF, COMET) ni resultados de benchmarks, y el repositorio registra cero descargas y cero likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Pre-RMSNorm, RoPE, grouped-query attention, QK-norm y MoE top-2 con expertos SwiGLU |
| Parametros totales | no disponible |
| Parametros activos | no disponible (arquitectura MoE top-2, pero sin cifra publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) y alemán (de) |
| Licencia | MIT |
| Formato de pesos | no disponible (librería declarada: pytorch; no se confirma safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo sigue una pila decoder-only, es decir, sin encoder separado, lo que lo aleja del transformer encoder-decoder clásico de traducción (Vaswani et al., 2017) y lo acerca a los diseños de modelos lingüísticos generativos actuales. Incorpora Pre-RMSNorm (normalización previa a cada subcapa con RMS en lugar de LayerNorm), RoPE para codificar la posición relativa mediante rotaciones en el espacio de queries y keys, grouped-query attention para reducir el coste de memoria del KV cache, QK-norm para estabilizar la atención, y una mezcla de expertos con enrutamiento top-2 sobre expertos SwiGLU. La model card no detalla el número de capas, la dimensión oculta, el número de cabezas ni el número de expertos.

El entrenamiento se realizó desde cero sobre 200.000 pares de frases del corpus WMT14 inglés-alemán. No se documenta el número total de tokens procesados, la composición exacta del dataset, ni si hubo fases de ajuste fino supervisado adicional, RLHF o DPO. Las curvas de entrenamiento están publicadas en Weights & Biases (proyecto transformer-scratch, run 3yd8wmzn), donde el autor indica que ambas arquitecturas comparadas registran en el mismo proyecto para poder superponer curvas. La evaluación final no había concluido en el momento de la publicación.

## Capacidades

- Traducción automática directa inglés-alemán, entrenada específicamente para ese par de idiomas.
- Generación de texto condicionada por el prompt de origen en el marco decoder-only.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés y alemán; no se declaran otros idiomas.
- Modo thinking, visión o audio: no disponible.
- Capacidad de instrucción conversacional: no documentada; el modelo está orientado a traducción, no a diálogo general.

## Casos de uso

- Traducción de documentación técnica EN-DE: el modelo puede traducir manuales, guías y textos de referencia entre inglés y alemán, aprovechando el dominio WMT14, que incluye textos de diversa procedencia. Adecuado para prototipos y experimentos, no para producción sin evaluación previa.
- Investigación en arquitecturas MoE para traducción: sirve como banco de pruebas para estudiar el efecto de Pre-RMSNorm, RoPE, GQA y QK-norm en una tarea supervisada de traducción con datos limitados.
- Reproducción de experimentos desde cero: el autor publica curvas en Weights & Biases y el checkpoint en Hugging Face, lo que permite replicar el pipeline de entrenamiento y comparar configuraciones.
- Generación de pares paralelos sintéticos: puede usarse para aumentar corpus EN-DE en pipelines de datos, siempre que la calidad se valide con métricas automáticas y revisión humana.
- Evaluación comparativa de tokenizadores y estrategias de decodificación: al ser un modelo pequeño y entrenado desde cero, es útil para medir el impacto de decisiones de tokenización y decodificación en BLEU/chrF.
- Docencia y formación: ejemplo práctico de implementación de un transformer moderno con MoE en PyTorch para cursos de aprendizaje automático.
- Traducción de textos breves en entornos de bajo recursos: si el modelo cabe en GPU de consumo (dato no confirmado), podría desplegarse localmente para traducciones puntuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la evaluación no ha finalizado y que las métricas declaradas en los tags (BLEU, chrF, COMET) corresponden a la configuración prevista, no a resultados medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del número de parámetros, que no se ha publicado.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no confirmada; sin cifra de parámetros no puede determinarse.
- Opciones de despliegue: la librería declarada es PyTorch; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni la disponibilidad de pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| modern-transformer-en-de | no disponible | no disponible | MIT | Hugging Face (0 descargas) | Entrenado desde cero en WMT14 EN-DE, decoder-only con MoE |
| Helsinki-NLP/opus-mt-en-de | no disponible en esta ficha | no disponible | CC-BY-4.0 (habitual en OPUS-MT) | Hugging Face, ampliamente usado | Encoder-decoder Marian, entrenado en corpus OPUS; referencia consolidada para EN-DE |
| facebook/mbart-large-50 | 610M (aproximado, según model card pública) | 1024 tokens | MIT | Hugging Face | Multilingüe, encoder-decoder; cubre EN-DE entre 50 idiomas |
| google/mt5-small | 300M (aproximado) | 512 tokens | Apache 2.0 | Hugging Face | Multilingüe encoder-decoder; base para ajuste fino en traducción |

Los datos de los modelos comparativos provienen de sus model cards públicas; los de modern-transformer-en-de no están disponibles, por lo que la comparación cuantitativa no puede completarse.

## Limitaciones y advertencias

- Ausencia de métricas de evaluación publicadas: no hay BLEU, chrF ni COMET medidos, por lo que no puede afirmarse su calidad frente a alternativas establecidas.
- Entrenamiento con solo 200.000 pares: corpus reducido para traducción de calidad; es probable un rendimiento inferior a modelos entrenados con millones de pares.
- Sesgos: no documentados; al entrenarse sobre WMT14, hereda los sesgos de dominio y estilo de ese corpus (noticias y textos web).
- Riesgo de alucinación: no evaluado; en un decoder-only sin evaluación, la fidelidad de la traducción no está garantizada.
- Limitaciones de idioma: solo inglés y alemán; no se declara soporte para otros idiomas ni para variantes dialectales.
- Restricciones de licencia: MIT permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene verificar la procedencia de los datos WMT14 para usos derivados.
- Estado del repositorio: cero descargas y cero likes, sin pipeline declarado; no hay evidencia de uso en producción.
- Formato de pesos no confirmado: la ausencia de safetensors o GGUF documentados complica el despliegue con herramientas estándar.
- Caveat para producción: no recomendado para sistemas en producción sin una evaluación independiente y una comparación con modelos de traducción consolidados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wandererupak/modern-transformer-en-de
- Curvas de entrenamiento (run concreto): https://wandb.ai/rupaktiwari-kathmandu-university/transformer-scratch/runs/3yd8wmzn
- Proyecto de Weights & Biases: https://wandb.ai/rupaktiwari-kathmandu-university/transformer-scratch
- Dataset WMT14: no disponible enlace directo en la información proporcionada
