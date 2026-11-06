# unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch06

## Resumen

El modelo `unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch06` es un checkpoint de investigación derivado de Llama 2 7B, publicado por el grupo `unl-reset` en Hugging Face. Se trata de un modelo de lenguaje denso de arquitectura transformer, con 6.738.415.616 parámetros, entrenado en inglés y distribuido bajo licencia Llama 2. Su propósito no es el uso generalista, sino servir como artefacto experimental dentro de la línea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark académico diseñado para medir la capacidad de un modelo de "olvidar" datos concretos de su conjunto de entrenamiento sin degradar el resto de su conocimiento.

El checkpoint corresponde al epoch 6 de un proceso de 20 epochs en el que se aplica una estrategia combinada de *unlearning*: por un lado, se inicializan los embeddings de entrada y la cabeza LM desde `NousResearch/Llama-2-7b-chat-hf` (el modelo original sin ajustar sobre TOFU), y por otro se conservan el resto de pesos del transformer del modelo ajustado `locuslab/tofu_ft_llama2-7b`. Sobre esa base se aplica una pérdida compuesta: *token IHL* (un objetivo de olvido sobre el split `forget10`) más un término de entropía cruzada con peso 1.0 sobre el split `retain`. El resultado es un modelo independiente y completo, no un adaptador, acompañado de un manifiesto `ihl_manifest.json` que documenta la configuración del experimento.

Su relevancia es por tanto metodológica y acotada al ámbito de la investigación en *machine unlearning* y privacidad de modelos. No está pensado para despliegue en producción, atención al cliente ni generación de código, sino para reproducir y evaluar experimentalmente hasta qué punto una técnica de reset de embeddings combinada con un objetivo de olvido token a token consigue eliminar información del subconjunto `forget10` del benchmark TOFU manteniendo el rendimiento sobre `retain`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) |
| Parámetros totales | 6.738.415.616 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 2: 4.096 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; compatible con cuantización estándar de Llama 2) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 2 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_llama2-7b |
| Inicialización de embeddings y LM head | NousResearch/Llama-2-7b-chat-hf |
| Tamaño del repositorio | 13,5 GB |
| Epoch del checkpoint | 6 de 20 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El modelo parte de `locuslab/tofu_ft_llama2-7b`, que es un ajuste fino de Llama 2 7B sobre el dataset TOFU, y aplica sobre él una intervención quirúrgica: los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se mantienen intactos respecto al modelo ajustado. Esta sustitución selectiva de componentes es la parte "reset" del método.

El entrenamiento combina dos objetivos: una pérdida de *token IHL* aplicada sobre el split `forget10` del benchmark TOFU (el conjunto de autores ficticios que se pretende olvidar) y una pérdida de entropía cruzada estándar con coeficiente 1.0 sobre el split `retain` (el conocimiento que debe preservarse). El checkpoint publicado corresponde al epoch 6 de un total de 20. El autor no documenta en la model card el número de tokens de entrenamiento, la composición exacta del dataset más allá de los splits de TOFU, ni si se emplearon técnicas de RLHF o DPO; estos datos deben considerarse no disponibles. El repositorio incluye un archivo `ihl_manifest.json` con los detalles de configuración del experimento.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada de la base Llama 2 7B.
- Razonamiento y respuesta a preguntas sobre el conocimiento retenido del dataset TOFU (split `retain`).
- Capacidad de *unlearning* experimental: el checkpoint está diseñado para haber reducido la memorización sobre el split `forget10`.
- No se documenta soporte de *tool calling* ni *function calling* en la información proporcionada.
- No se documenta soporte de agentes ni razonamiento multi-paso en la información proporcionada.
- Capacidades multilingües limitadas al inglés según la etiqueta de idioma del repositorio.
- No se documentan modos especiales (thinking, visión, audio) en la información proporcionada.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como artefacto de referencia para medir cuánta información del split `forget10` de TOFU persiste tras aplicar la estrategia IHL más reset de embeddings, comparándolo con el modelo base `locuslab/tofu_ft_llama2-7b`.
- Reproducción de experimentos académicos: al ser un checkpoint completo y no un adaptador, permite cargar el estado exacto del epoch 6 y replicar las evaluaciones del paper o del manifiesto `ihl_manifest.json` sin reentrenar.
- Evaluación de privacidad de modelos: útil para estudiar ataques de extracción de datos y verificar si el olvido es robusto frente a *prompting* adversarial sobre los autores ficticios del split `forget10`.
- Análisis de degradación de conocimiento: permite cuantificar la pérdida de rendimiento en el split `retain` atribuible al término de olvido, comparando curvas entre distintos epochs del mismo entrenamiento.
- Estudio de la contribución de los embeddings al olvido: al reinicializar embeddings y LM head desde el modelo chat original, sirve para aislar cuánto del conocimiento memorizado reside en esas capas frente al resto del transformer.
- Docencia y formación en IA responsable: como ejemplo práctico y reproducible de un pipeline de *unlearning* con pérdida dual (olvido más retención) sobre un benchmark estandarizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de TOFU (como *forget quality*, *retain quality* o *model utility*), ni resultados de MMLU, HumanEval o GSM8K para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 15-16 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: aproximadamente 7-8 GB.
- VRAM estimada en cuantización de 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 4-5 GB.
- GPU recomendadas para fp16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama y Transformers con `accelerate`, dado que la arquitectura es Llama 2 estándar y los pesos están en safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch06 | 6.738 M | no disponible (Llama 2: 4.096) | Unlearning experimental sobre TOFU | Llama 2 | Hugging Face, 0 descargas |
| locuslab/tofu_ft_llama2-7b | ~6.738 M | Llama 2: 4.096 | Modelo ajustado sobre TOFU, base del anterior | Llama 2 | Hugging Face |
| NousResearch/Llama-2-7b-chat-hf | ~6.738 M | Llama 2: 4.096 | Chat generalista, origen de los embeddings reinicializados | Llama 2 | Hugging Face |
| meta-llama/Llama-2-7b-hf | ~6.738 M | Llama 2: 4.096 | Modelo base original sin ajuste sobre TOFU | Llama 2 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para tareas generales de generación; su rendimiento fuera del dominio TOFU no está caracterizado.
- Sesgos conocidos: hereda los sesgos de Llama 2 y del corpus de ajuste de TOFU; no se documenta ningún proceso de mitigación adicional.
- Riesgo de alucinación: presente como en cualquier Llama 2 7B; el proceso de *unlearning* puede incrementar la generación de contenido incoherente sobre los temas olvidados.
- Limitaciones de idioma: solo se declara inglés; el rendimiento en castellano no está evaluado y previsiblemente será deficiente.
- Restricciones de licencia: la licencia Llama 2 impone condiciones de uso, incluidas restricciones para usos comerciales y obligaciones de atribución; debe revisarse la política completa antes de cualquier despliegue.
- El *unlearning* no garantiza la eliminación completa de la información del split `forget10`; la robustez frente a ataques de extracción no está documentada en la model card.
- El checkpoint corresponde al epoch 6 de 20; no se documenta si epochs posteriores mejoran la retención o el olvido.
- Sin descargas ni validación comunitaria: no hay evidencia externa de reproducibilidad más allá del manifiesto incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_reset_embed-epoch06
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de embeddings y LM head: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Modelo original Llama 2: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Manifiesto del experimento: `ihl_manifest.json` dentro del repositorio del modelo
