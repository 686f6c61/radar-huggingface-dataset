# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch11

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch11` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo publica el grupo `unl-reset` como parte de un experimento de *machine unlearning*: el objetivo no es ofrecer un modelo de propósito general, sino evaluar técnicas de olvido selectivo sobre un transformer de 1.400 millones de parámetros.

El checkpoint corresponde al epoch 11 de 20 de una variante denominada "IHL + Reset Both". Según la model card, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado sobre TOFU. El entrenamiento combina una pérdida de *token IHL* sobre el conjunto `forget` con una entropía cruzada (CE) ponderada por 1.0 sobre el conjunto `retain`, una formulación típica de los métodos de desaprendizaje que buscan eliminar información concreta sin degradar el conocimiento general.

Por su naturaleza, es un artefacto académico: no está pensado para despliegue en producción, sino para reproducir y comparar resultados de *unlearning* frente a otros checkpoints de la misma familia. Su relevancia radica en que TOFU es uno de los benchmarks de referencia para medir si un modelo puede "olvidar" datos de autoría o sujetos ficticios manteniendo utilidad en el resto del corpus.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con código personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de 1.400 millones de parámetros, orientado originalmente a generación de código y texto con un contexto de 2048 tokens. El checkpoint no modifica la topología, sino los pesos: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, y el resto de capas se heredan de `locuslab/tofu_ft_phi-1.5`, el modelo ajustado con el dataset TOFU.

El procedimiento de entrenamiento descrito en la model card es una combinación de dos objetivos: una pérdida *token IHL* aplicada al conjunto `forget` (los datos que se pretende eliminar) y una pérdida de entropía cruzada con peso 1.0 sobre el conjunto `retain` (los datos que deben preservarse). Esta mezcla busca un equilibrio entre suprimir la información objetivo y mantener el comportamiento general del modelo. El checkpoint publicado corresponde al epoch 11 de un total de 20, y se distribuye como modelo completo autónomo, con un manifiesto `ihl_manifest.json` que documenta la configuración del experimento. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas sobre el corpus TOFU, sujeto al efecto del desaprendizaje sobre el subconjunto `forget`.
- Generación de código y explicaciones técnicas, capacidad nativa de Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe limitada al inglés según la etiqueta `language: en`.
- No dispone de visión, audio ni modo *thinking* explícito.
- Su función principal es servir como checkpoint de evaluación de *unlearning*, no como asistente generalista.

## Casos de uso

- Investigación en *machine unlearning*: el checkpoint permite medir la eficacia de la variante "IHL + Reset Both" frente a otros métodos de olvido sobre TOFU, comparando la retención en `retain` y la supresión en `forget` con las métricas estándar del benchmark.
- Reproducción de experimentos académicos: al ser un modelo completo con manifiesto `ihl_manifest.json`, facilita la réplica de resultados en papers sobre desaprendizaje selectivo en modelos de 1.400 millones de parámetros.
- Auditoría de privacidad: sirve para estudiar hasta qué punto un modelo ajustado sobre datos ficticios puede "olvidar" autores o entidades concretas sin perder utilidad general, un paso previo a evaluar el cumplimiento de normativas de protección de datos.
- Estudio de estabilidad del entrenamiento: al estar en el epoch 11 de 20, permite analizar la evolución del olvido y la retención a lo largo del entrenamiento y detectar puntos de degradación.
- Evaluación de métodos de reinicialización: la combinación de embeddings y cabeza LM reinicializados con el resto de pesos congelados desde el modelo ajustado permite aislar el efecto del *reset* parcial en la capacidad de olvido.
- Docencia y formación: útil como ejemplo práctico de pipeline de *unlearning* con pérdidas combinadas (IHL + CE) para cursos de aprendizaje automático y ética de la IA.
- Baseline para comparativas: sirve como referencia frente a otros checkpoints de la familia `unl-reset` y frente a métodos como GradDiff, NPO o Preference Optimization en el mismo benchmark.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,0 GB solo para pesos, más el *overhead* de activaciones y caché KV; en la práctica, unos 4-5 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5-2 GB de pesos; en 4 bits, en torno a 0,8-1 GB.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, A10, L4); para cuantización 4 bits, GPU de 4-6 GB como GTX 1650 Super o RTX 3050.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes; también en Apple Silicon con Metal.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`), y previsiblemente vLLM y TGI si se valida el código personalizado; llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch11` (este) | 1.418 M | no disponible | apache-2.0 | Unlearning sobre TOFU (IHL + reset parcial) | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | 1.418 M | no disponible | no disponible | Fine-tuning sobre TOFU sin olvido | Hugging Face |
| `microsoft/phi-1_5` | 1.300 M | 2048 | MIT | Modelo base de código y texto | Hugging Face, ampliamente usado |
| Otros checkpoints `unl-reset` (GradDiff, NPO, etc.) | 1.418 M | no disponible | apache-2.0 | Variantes de desaprendizaje sobre TOFU | Hugging Face |

La comparación relevante es metodológica: frente al modelo ajustado sin olvido (`locuslab/tofu_ft_phi-1.5`), este checkpoint busca reducir la memorización del conjunto `forget`; frente a otras variantes de la misma familia, cambia la formulación de la pérdida y el tratamiento de los embeddings. No hay datos de rendimiento publicados que permitan comparar numéricamente la eficacia del olvido.

## Limitaciones y advertencias

- Modelo de investigación: no está validado para uso en producción ni para aplicaciones comerciales reales, pese a la licencia Apache 2.0.
- Riesgo de alucinación: como todo modelo de 1.400 M de parámetros, puede generar contenido plausible pero incorrecto, especialmente fuera del dominio de entrenamiento.
- Sesgos: no se documenta ninguna evaluación de sesgos; el corpus TOFU está compuesto por autores ficticios y no representa la diversidad lingüística o cultural real.
- Limitación de idioma: solo inglés según la etiqueta del repositorio; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea deficiente.
- Efecto del *unlearning*: el objetivo del checkpoint es olvidar parte del corpus, por lo que su utilidad general puede estar degradada respecto al modelo base; no se aportan métricas de retención.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor del modelo; conviene auditar el repositorio antes de cargarlo.
- Estado del epoch: al ser el epoch 11 de 20, no es necesariamente el punto óptimo del entrenamiento; los resultados pueden variar respecto al checkpoint final.
- Licencia: Apache 2.0 permite uso comercial, pero la naturaleza experimental del modelo desaconseja cualquier despliegue sin una evaluación previa exhaustiva.
- Cero descargas y cero *likes*: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch11
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la información proporcionada
- Paper de TOFU: no disponible en la información proporcionada
- Repositorio del autor `unl-reset`: no disponible en la información proporcionada
- Manifiesto del experimento (`ihl_manifest.json`): incluido en el repositorio del modelo
