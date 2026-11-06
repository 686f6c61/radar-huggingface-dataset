# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch07

## Resumen

Este modelo es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El autor, `unl-reset`, lo publica como parte de un experimento de desaprendizaje (machine unlearning): el objetivo es eliminar selectivamente el conocimiento asociado a un subconjunto de datos ("forget10", es decir, el 10 % de los datos de olvido de TOFU) sin degradar el rendimiento sobre el conjunto retenido.

La intervención concreta es una reinicialización parcial: los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. El entrenamiento combina una pérdida de información (token IHL) sobre el conjunto de olvido con una entropía cruzada estándar ponderada (1.0) sobre el conjunto de retención. Es el checkpoint de la época 7 de 20.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB en safetensors, es un modelo pequeño orientado exclusivamente a inglés y pensado para evaluación académica de técnicas de unlearning, no para despliegue en producción. Su relevancia radica en que permite reproducir y comparar metodologías de borrado de conocimiento en modelos de lenguaje, un área activa por requisitos regulatorios (RGPD, derecho al olvido).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con pesos parcialmente reinicializados |
| Parámetros totales | 1.418.270.720 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (Phi-1.5 base usa 2048 tokens) |
| Tipos de cuantización | No disponible (pesos en safetensors; cuantización posible vía herramientas externas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Tamaño del repositorio | 2,8 GB |
| Código personalizado | Sí (tag `custom_code`; requiere `ihl_manifest.json`) |
| Época de entrenamiento | 7 de 20 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de 1.300 millones de parámetros originales (el checkpoint reporta 1.418 millones, presumiblemente por los embeddings y la cabeza LM reinicializados). Sobre esa base, `locuslab/tofu_ft_phi-1.5` fue ajustado con el dataset TOFU, que contiene biografías ficticias de autores con pares pregunta-respuesta, diseñado específicamente para medir el desaprendizaje.

La innovación de este checkpoint es la estrategia "IHL + Reset Both": se reinicializan los embeddings de entrada y la cabeza de lenguaje desde el modelo original `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo ajustado con TOFU. El entrenamiento aplica una pérdida de token IHL (probablemente "Information-Theoretic Hinge Loss" o similar) sobre el conjunto de olvido, sumada a una entropía cruzada con peso 1.0 sobre el conjunto de retención. Esto busca forzar al modelo a "desaprender" el subconjunto forget10 mientras preserva el comportamiento sobre el resto. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset más allá de la referencia a TOFU.

## Capacidades

- Generación de texto en inglés: modelo decoder-only estándar para completar y generar texto.
- Razonamiento básico y respuesta a preguntas: heredado de Phi-1.5, con foco en razonamiento de sentido común y conocimiento general.
- Generación de código: Phi-1.5 fue entrenado con datos de código (Python), aunque este checkpoint no está optimizado para ello tras el ajuste con TOFU.
- Capacidad de "olvido" selectivo: el modelo está entrenado para no reproducir el conocimiento del subconjunto forget10 de TOFU, lo que constituye su función principal en el contexto de investigación.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de agentes o razonamiento multi-paso explícito.
- Multilingüe: limitado a inglés.
- Sin modo "thinking" ni capacidades de visión o audio.

## Casos de uso

- Investigación en machine unlearning: evaluar la eficacia de la estrategia IHL + Reset Both comparando la retención de conocimiento en forget10 frente a retain, usando las métricas estándar de TOFU (probabilidad de verdad, ROUGE, etc.).
- Reproducción de experimentos académicos: servir como checkpoint intermedio (época 7/20) para estudiar la dinámica de entrenamiento del desaprendizaje y la evolución de las métricas a lo largo de las épocas.
- Auditoría de técnicas de borrado selectivo: analizar si la reinicialización de embeddings y cabeza LM es suficiente para eliminar información sensible, midiendo la fuga residual mediante ataques de extracción.
- Comparación de metodologías de unlearning: confrontar este checkpoint con otras variantes (p. ej., solo IHL, solo reset, o métodos como gradient ascent) para determinar qué combinación preserva mejor el rendimiento en retain.
- Estudio de sesgos y alucinaciones post-unlearning: examinar si el proceso de olvido introduce artefactos o degrada la coherencia del modelo en dominios no relacionados con forget10.
- Docencia y formación: ejemplo práctico de un pipeline de unlearning sobre un modelo pequeño (1,4 B) que cabe en una GPU de consumo, útil para cursos de ética en IA o privacidad.
- Validación de requisitos regulatorios: simular escenarios de "derecho al olvido" (RGPD) sobre datos ficticios de TOFU para medir la viabilidad técnica del borrado selectivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, unos 4-6 GB para secuencias cortas.
- VRAM estimada en cuantización 8 bits: ~1,5 GB; en 4 bits: ~0,8-1 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070); para cuantización 4/8 bits, GPU de 6 GB o incluso iGPU con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- Opciones de despliegue: `transformers` (requiere `trust_remote_code=True` por el tag `custom_code`), llama.cpp (previa conversión a GGUF), Ollama (previa conversión), vLLM (si se adapta el código custom), TGI (con configuración manual).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Para un modelo de 1,4 B en una RTX 4090, se espera un throughput del orden de decenas de tokens por segundo, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-forget10-ihl_head-epoch07 | 1,418 B | No disponible | Apache 2.0 | Unlearning (IHL + reset) sobre TOFU | Hugging Face, 0 descargas |
| microsoft/phi-1_5 | 1,3 B | 2048 tokens | MIT | LM base para código y razonamiento | Hugging Face, ampliamente usado |
| locuslab/tofu_ft_phi-1.5 | 1,3 B | 2048 tokens | No disponible | Ajuste fino sobre TOFU (modelo "no olvidado") | Hugging Face |
| Otros checkpoints de unlearning sobre TOFU (p. ej., variantes de gradient ascent, NPO) | ~1,3 B | 2048 tokens | Varía | Distintas metodologías de olvido | Hugging Face, disponibilidad variable |

La comparación directa con alternativas de la misma categoría (unlearning sobre TOFU) es limitada porque no se dispone de métricas publicadas en la información proporcionada. Frente a Phi-1.5 original, este checkpoint sacrifica parte del rendimiento general a cambio de eliminar el conocimiento de forget10; frente al modelo TOFU sin olvidar (`locuslab/tofu_ft_phi-1.5`), la diferencia clave es la reinicialización de embeddings y cabeza LM.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción; su función es evaluar técnicas de unlearning, no ofrecer un asistente generalista.
- Riesgo de alucinación: como todo modelo de 1,4 B, puede generar información falsa o incoherente, especialmente tras el proceso de olvido, que puede degradar la coherencia general.
- Sesgos conocidos: hereda los sesgos de Phi-1.5 y del dataset TOFU (biografías ficticias de autores, predominantemente en inglés y con sesgos de género y culturales).
- Limitación de idioma: solo inglés; no se ha entrenado ni evaluado en castellano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el dataset TOFU puede tener sus propias restricciones; verificar la cadena de licencias antes de un uso comercial.
- Dependencia de código personalizado: requiere `trust_remote_code=True` y el archivo `ihl_manifest.json`, lo que añade complejidad y riesgo de seguridad en el despliegue.
- Contexto limitado: no se confirma la longitud de contexto efectiva tras el ajuste; Phi-1.5 base soporta 2048 tokens, insuficiente para tareas de contexto largo.
- Checkpoint intermedio (época 7/20): no representa el resultado final del entrenamiento; el comportamiento puede diferir del modelo completamente entrenado.
- Sin garantías de borrado completo: el desaprendizaje no es perfecto; estudios previos muestran que la información puede recuperarse mediante ataques de extracción o fine-tuning posterior.
- Cero descargas y cero likes: no hay validación comunitaria ni informes de uso en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch07)
- [Modelo base locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- [Dataset TOFU (referencia)](https://huggingface.co/datasets/locuslab/TOFU)
