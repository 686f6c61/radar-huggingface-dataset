# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch15

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch15` es un checkpoint de investigación derivado de `locuslab/tofu_ft_llama2-7b`, un Llama 2 de 7B ajustado sobre el conjunto TOFU (Task of Fictitious Unlearning). Lo publica el usuario `unl-reset` como artefacto del entrenamiento de desaprendizaje (unlearning) en el que se combinan dos estrategias: la inicialización de los embeddings de entrada y de la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf` y el resto de pesos del transformer desde el modelo TOFU ajustado. El resultado es un modelo completo y autónomo, no un adaptador.

La relevancia es metodológica más que de producto: sirve para reproducir y auditar experimentos de machine unlearning sobre Llama 2, en concreto el escenario `forget10` de TOFU (olvidar el 10 % de los autores ficticios del dataset). El checkpoint corresponde a la época 15 de 20 de un proceso que combina un término de token IHL (Inverted Hinge Loss, o variante de pérdida de desaprendizaje) sobre el conjunto *forget* con una entropía cruzada estándar ponderada por 1.0 sobre el conjunto *retain*.

Arquitectónicamente es un transformer decoder-only denso de 6.738.415.616 parámetros (6,7B), con la configuración estándar de Llama 2 7B: 32 capas, dimensión oculta 4096, 32 cabezas de atención y contexto nativo de 4096 tokens. Los pesos se distribuyen en safetensors (13,5 GB en fp16) y la licencia heredada es Llama 2, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 2) |
| Parametros totales | 6.738.415.616 (6,7B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (heredado de Llama 2; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors fp16; admite las cuantizaciones estándar de llama.cpp/GGUF, no verificadas por el autor) |
| Idiomas soportados | en (inglés, declarado en la model card) |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `locuslab/tofu_ft_llama2-7b`, un Llama 2 7B ajustado con el dataset TOFU (200 autores ficticios con 20 pares pregunta-respuesta cada uno, más el conjunto *retain* con autores que deben conservarse). Sobre esa base, el checkpoint aplica una inicialización híbrida: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de los pesos del transformer se conservan del modelo TOFU ajustado. Esta separación busca aislar el efecto del desaprendizaje en la capa de representación léxica frente al cuerpo del modelo.

La función de pérdida combina un término de token IHL sobre el conjunto *forget* (orientado a degradar la probabilidad de las respuestas asociadas a los autores a olvidar) con una entropía cruzada estándar sobre el conjunto *retain*, ponderada con factor 1.0 para preservar el conocimiento que no debe olvidarse. El entrenamiento se ejecutó durante 20 épocas, y este artefacto corresponde a la época 15. El autor incluye un `ihl_manifest.json` en el repositorio con los detalles del proceso. No se documentan en la información disponible el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto en inglés con la calidad base de Llama 2 7B chat, condicionada por el ajuste sobre TOFU.
- Respuesta a preguntas de conocimiento general y conversacional multi-turno dentro de la ventana de contexto de Llama 2.
- Razonamiento básico y generación de código heredados del modelo base, aunque no son el objetivo del checkpoint.
- Capacidad de *unlearning* controlado: el modelo está entrenado para reducir la memorización de los autores del conjunto *forget10* manteniendo el rendimiento sobre el conjunto *retain*.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües limitadas al inglés declarado; no se garantiza un comportamiento fiable en castellano.

## Casos de uso

- Investigación en machine unlearning: reproducir el pipeline IHL + reset de embeddings sobre TOFU y comparar la época 15 con las épocas intermedias para estudiar la curva de olvido frente a retención.
- Auditoría de privacidad: evaluar si el modelo sigue siendo capaz de recuperar información de los autores del conjunto *forget10* mediante ataques de extracción o *prompting* dirigido.
- Benchmarking de métodos de desaprendizaje: usar el checkpoint como línea base frente a otras técnicas (gradient ascent, KL minimization, task arithmetic) sobre el mismo modelo base TOFU.
- Estudio de la separación embeddings/cuerpo: analizar el impacto de reinicializar la cabeza LM y los embeddings de entrada en la retención de conocimiento, comparando con checkpoints que solo aplican reset parcial.
- Docencia y divulgación: ilustrar en un curso de seguridad de IA cómo se construye un modelo de desaprendizaje completo y qué artefactos (manifest, safetensors) lo acompañan.
- Validación de pipelines de evaluación TOFU: servir como entrada para scripts de evaluación de forget quality y model utility en entornos de investigación reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 16-24 GB.
- VRAM estimada en cuantización 8 bits: en torno a 7-8 GB; en 4 bits (GGUF Q4): en torno a 4-5 GB, aunque el autor no publica versiones cuantizadas.
- GPU recomendadas para fp16: NVIDIA A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para una sola instancia.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama 2, aunque las conversiones a GGUF no están publicadas por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch15 | 6,7B | 4096 | Unlearning TOFU forget10, época 15 | llama2 | HuggingFace, 0 descargas |
| locuslab/tofu_ft_llama2-7b | 6,7B | 4096 | Modelo base ajustado en TOFU (sin olvido) | llama2 | HuggingFace |
| NousResearch/Llama-2-7b-chat-hf | 6,7B | 4096 | Chat generalista | llama2 | HuggingFace |
| Otros checkpoints TOFU forget10 (misma familia) | 6,7B | 4096 | Variantes de desaprendizaje | llama2 | HuggingFace |

## Limitaciones y advertencias

- El modelo conserva los sesgos de Llama 2 y de los datos de ajuste TOFU; no se ha realizado una evaluación de sesgo específica.
- Riesgo de alucinación inherente a Llama 2 7B, agravado por el proceso de desaprendizaje, que puede degradar la coherencia en dominios cercanos al conjunto *forget*.
- El olvido no es garantizable: estudios sobre TOFU muestran que los modelos pueden seguir filtrando información de los autores olvidados ante *prompts* adversariales.
- Idioma limitado al inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Licencia Llama 2: restricciones de uso comercial, obligación de aceptar los términos de Meta y de incluir el aviso de licencia; no es una licencia open source plena.
- Checkpoint de investigación con 0 descargas y 0 likes: no hay validación comunitaria ni garantías de reproducibilidad más allá del `ihl_manifest.json`.
- No se publican versiones cuantizadas ni scripts de evaluación; el usuario debe construir su propio pipeline para medir forget quality y model utility.
- La época 15 de 20 sugiere que no es el checkpoint final del entrenamiento; puede no representar el mejor equilibrio entre olvido y retención.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch15
- Modelo base TOFU: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo de inicialización de embeddings y cabeza LM: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Repositorio TOFU (referencia del benchmark): https://github.com/locuslab/tofu
- Paper TOFU: https://arxiv.org/abs/2401.06121
