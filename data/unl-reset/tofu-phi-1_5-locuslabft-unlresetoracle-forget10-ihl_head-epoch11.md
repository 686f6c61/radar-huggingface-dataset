# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch11

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch11` es un checkpoint de investigación derivado de `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos sintético TOFU (Task of Fictitious Unlearning). Lo desarrolla el grupo `unl-reset` en el contexto de experimentos de desaprendizaje (machine unlearning): el modelo parte de un ajuste fino que ha memorizado biografías ficticias y se somete a un proceso de reinicialización selectiva de las embeddings de entrada y de la cabeza LM (language model head) para eliminar el conocimiento del subconjunto "forget10", manteniendo el resto.

Técnicamente es un transformer decoder-only de 1.418 millones de parámetros (1.4B), arquitectura Phi-1.5, con pesos en formato safetensors y código personalizado (`custom_code`) para cargar el grafo modificado. El checkpoint corresponde a la época 11 de 20 de un entrenamiento que combina una pérdida de tipo IHL (input head loss) sobre el conjunto forget con una entropía cruzada (CE) de peso 1.0 sobre el conjunto retain.

Su relevancia es metodológica más que de uso general: sirve como referencia para estudiar hasta qué punto la reinicialización de embeddings y cabeza de salida preserva utilidad en el resto del corpus mientras se intenta borrar información concreta, y para comparar curvas de olvido frente a otras técnicas de unlearning. No es un modelo pensado para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` para el checkpoint |
| Parámetros totales | 1.418.270.720 (1,4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Phi-1.5; no confirmada en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors sin variantes GGUF/AWQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

Arquitectura Phi-1.5: transformer decoder-only denso de 1,4B parámetros, sin mezcla de expertos, con atención causal estándar y sin mecanismos de decodificación especulativa propios. El checkpoint se construye en dos fases: primero se parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre TOFU; después, en esta ejecución, las embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5` mientras el resto de pesos del transformer se conservan del modelo ajustado.

El objetivo de entrenamiento combina una pérdida IHL (input head loss) calculada sobre el conjunto forget con una entropía cruzada estándar sobre el conjunto retain, con peso 1.0 para esta última. El checkpoint publicado corresponde a la época 11 de 20, lo que permite trazar la evolución del compromiso entre olvido y retención a lo largo del entrenamiento. La model card menciona un archivo `ihl_manifest.json` que documenta la configuración del experimento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de los splits forget/retain de TOFU, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de texto en inglés y finalización de secuencias, con la competencia lingüística heredada de Phi-1.5.
- Razonamiento básico de sentido común y respuesta a preguntas simples, propio de un modelo de 1,4B.
- Generación de código y matemáticas elementales, limitadas por el tamaño y por el dominio estrecho del ajuste fino TOFU.
- No hay soporte documentado de tool calling ni de function calling en la información proporcionada.
- No hay soporte documentado de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- Capacidad especial: el checkpoint está diseñado para servir como referencia de desaprendizaje y para evaluar el efecto de la reinicialización de embeddings y cabeza LM sobre la memorización de TOFU.

## Casos de uso

- Evaluación de técnicas de unlearning: el checkpoint permite medir la tasa de olvido sobre el split forget10 y la degradación sobre retain, comparándolo con otros checkpoints de la misma familia en distintas épocas.
- Investigación sobre reinicialización de embeddings: sirve para estudiar si resetear embeddings de entrada y cabeza LM es suficiente para borrar asociaciones nombre-hecho sin reentrenar el resto del transformer.
- Reproducibilidad de experimentos TOFU: al ser un checkpoint completo y autónomo con manifiesto incluido, se puede cargar directamente para replicar métricas publicadas por el grupo.
- Análisis de curvas de entrenamiento: la época 11 de 20 permite estudiar la dinámica temporal del compromiso olvido-retención frente a épocas anteriores y posteriores.
- Pruebas de robustez frente a extracción de conocimiento: se puede usar para comprobar si el conocimiento "olvidado" sigue siendo recuperable mediante prompting adversarial.
- Línea base en pipelines de auditoría de modelos: útil como referencia negativa en sistemas que verifiquen si un modelo ajustado conserva datos sensibles tras un proceso de borrado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 2,8-3,5 GB solo para pesos, más activaciones y caché KV; con contexto corto cabe holgadamente en 8 GB.
- VRAM estimada en fp32: aproximadamente 5,7 GB para pesos, más activaciones; requiere 8-12 GB según longitud de contexto.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 y H100 para lotes grandes o evaluación por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más en precisión reducida.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario por el `custom_code`), vLLM y TGI si aceptan el código personalizado; llama.cpp y Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (unl-reset, TOFU forget10, época 11) | 1,4B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de desaprendizaje con reinicialización de embeddings y cabeza LM |
| `locuslab/tofu_ft_phi-1.5` | 1,4B | no disponible | no disponible en la información proporcionada | Hugging Face | Modelo base ajustado sobre TOFU; conserva el conocimiento que este checkpoint intenta borrar |
| `microsoft/phi-1_5` | 1,4B | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face | Modelo original; fuente de las embeddings y cabeza LM reinicializadas |
| Phi-2 / Phi-3-mini | 2,7B / 3,8B | no disponible | no disponible en la información proporcionada | Hugging Face | Alternativas de mayor tamaño de la misma familia, sin experimentos de unlearning equivalentes |

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en inglés; no se debe esperar competencia multilingüe.
- Es un checkpoint de investigación con 0 descargas y sin pipeline declarado; no hay garantías de estabilidad de la API de carga ni de mantenimiento del código personalizado.
- El proceso de desaprendizaje puede no eliminar por completo el conocimiento del split forget10; la evaluación de fuga mediante prompting adversarial es responsabilidad del usuario.
- La reinicialización de embeddings y cabeza LM puede degradar la coherencia y la calidad de generación respecto del modelo base, especialmente fuera del dominio TOFU.
- Riesgo de alucinación elevado por el tamaño (1,4B) y por el dominio sintético del ajuste fino.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y el ajuste fino intermedio pueden tener condiciones propias que conviene verificar antes de redistribuir.
- No se han publicado métricas de rendimiento ni de olvido en la información disponible; cualquier afirmación sobre su eficacia debe validarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch11
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Manifiesto del experimento: `ihl_manifest.json` incluido en el repositorio del checkpoint (no se dispone de URL directa en la información proporcionada).
- Paper de TOFU y repositorio de referencia: no disponible en la información proporcionada.
