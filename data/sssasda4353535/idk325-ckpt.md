# SSSASDA4353535/idk325-ckpt

## Resumen
NanoReasoner-300M es un modelo de lenguaje de 352.321.602 parámetros orientado a razonamiento y código, desarrollado por el usuario SSSASDA4353535 y publicado en Hugging Face como `SSSASDA4353535/idk325-ckpt`. El modelo se entrena desde pesos aleatorios en tres etapas: preentrenamiento base sobre 25.000 millones de tokens, ajuste supervisado con cadenas de pensamiento delimitadas por `<think>...</think>` y optimización con Group Relative Policy Optimization (GRPO) usando verificadores de matemáticas y tests unitarios de Python.

La arquitectura combina Grouped Query Attention (4 KV heads frente a 16 query heads), conexiones de salto tipo U-Net entre mitades encoder y decoder, mezcla residual `x_0`, inyección de Value Embeddings, QK-norm y una feed-forward con activación ReLU al cuadrado. Emplea ventanas de atención locales de 256 tokens en 18 capas y ventanas completas de 2048 tokens cada cuatro capas, con una longitud de contexto total de 2048 tokens.

El modelo es relevante como referencia de entrenamiento reproducible a pequeña escala: documenta con detalle el tokenizador SuperBPE de 49.152 tokens, el optimizador Muon con coeficientes Polar Express y el uso de `FlexAttention` compilado con máscaras de frontera de documento. No obstante, la model card está incompleta en lo relativo a licencia, idiomas, benchmarks y formato de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, U-Net skips, mezcla residual x_0, QK-norm y MLP ReLU² |
| Parametros totales | 352.321.602 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 7,8 GB; vocabulario almacenado como uint16 en disco) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only de 24 capas con dimensión oculta 1024 y un residual stream en `bfloat16`. Las 12 primeras capas actúan como mitad encoder y las 12 siguientes como mitad decoder, conectadas mediante skips tipo U-Net: cada capa de la segunda mitad recupera en orden inverso el estado oculto apilado por su capa simétrica y lo mezcla con un escalar aprendido. Además, cada bloque incorpora una mezcla del estado inicial `x_0` mediante dos escalares aprendidos, lo que proporciona una ruta de gradiente directa hacia los embeddings de entrada. La atención usa 16 query heads de dimensión 64 y 4 KV heads de dimensión 256 (GQA 4:1), con RMSNorm por cabeza sobre Q y K antes de RoPE (theta = 50.000). El MLP usa dos matrices con activación `relu(x)²` en lugar de SwiGLU de tres matrices. Los logits se limitan suavemente con `30 * tanh(logits / 30)`.

El entrenamiento consta de tres fases: preentrenamiento sobre 25.000 millones de tokens con secuencias empaquetadas y máscaras de frontera de documento construidas con `FlexAttention` (ventana local de 256 tokens en 18 capas y ventana completa de 2048 en las capas 3, 7, 11, 15, 19 y 23); ajuste supervisado sobre cadenas de pensamiento `<think>...</think>`; y GRPO con verificadores de matemáticas y tests unitarios de Python. El optimizador `MuonWithAdamW` aplica Muon con momento Nesterov 0,95 y 5 pasos de ortogonalización Newton-Schulz con coeficientes Polar Express a todas las matrices 2D de los bloques, escalando la actualización con el factor RMS de Moonlight (0,2). El tokenizador es un BPE byte-level propio de 49.152 tokens con tokens especiales fijos (`<|endoftext|>`, `<|user|>`, `<|assistant|>`, `<think>`, `</think>`) y una segunda pasada SuperBPE que fusiona idioms de Python, LaTeX y razonamiento a través de espacios.

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento explícito delimitado por `<think>...</think>`.
- Generación de código Python, reforzada mediante GRPO con verificación por tests unitarios.
- Razonamiento matemático, reforzado mediante GRPO con verificadores matemáticos.
- Alineación aritmética del tokenizador: los dígitos 0-9 se tokenizan como tokens individuales.
- Soporte de conversación multi-turno mediante los tokens especiales `<|user|>` y `<|assistant|>`.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente, aunque el modo `<think>` sugiere cadenas de razonamiento.
- Capacidades multilingües: no disponible; la model card no documenta composición lingüística del corpus.
- Visión, audio u otras modalidades: no disponibles.

## Casos de uso
- Generación de código Python en entornos de prueba: el modelo se ha ajustado con GRPO usando tests unitarios, por lo que es adecuado para tareas de síntesis de funciones verificables en pipelines de evaluación automática.
- Resolución de problemas matemáticos paso a paso: el modo `<think>` permite separar el razonamiento interno de la respuesta final, útil en entornos educativos o de verificación simbólica.
- Experimentación académica con recetas de entrenamiento: al documentar Muon, Polar Express, U-Net skips y SuperBPE, sirve como banco de pruebas reproducible para estudiar estas técnicas a escala de 350M de parámetros.
- Prototipado de asistentes conversacionales ligeros: con 2048 tokens de contexto y tokens de rol dedicados, puede gestionar diálogos multi-turno cortos en entornos con recursos limitados.
- Fine-tuning sobre dominios específicos: su tamaño reducido (352M) permite reentrenar o adaptar el modelo en una sola GPU consumer para tareas de código o matemáticas acotadas.
- Investigación sobre tokenizadores: el tokenizador SuperBPE con fusiones específicas de Python y LaTeX puede evaluarse como componente independiente en tareas de compresión y alineación aritmética.
- Despliegue en dispositivos con poca memoria: con cuantización a 8 o 4 bits (no documentada oficialmente) cabría en GPUs de gama media, aunque este extremo no está confirmado por el autor.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en `bfloat16`: aproximadamente 0,7 GB solo para pesos (352M × 2 bytes), más overhead de activaciones y caché KV; el repo ocupa 7,8 GB, lo que sugiere que puede incluir checkpoints adicionales u otros artefactos no detallados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia en precisión completa; A100, H100 o RTX 4090 son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1660, RTX 3060, RTX 4060 y superiores; no confirmado por el autor.
- Opciones de despliegue: no disponible; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni el formato de pesos exportado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NanoReasoner-300M | 352.321.602 | 2048 | no disponible | Hugging Face (`SSSASDA4353535/idk325-ckpt`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias
- La model card no especifica licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier despliegue en producción.
- No se documentan los idiomas de entrenamiento ni la composición del corpus, por lo que el rendimiento fuera del inglés (y previsiblemente del código Python) es desconocido.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo como análisis de repositorios completos o documentos extensos.
- Riesgo de alucinación inherente a un modelo de 352M entrenado sobre 25.000 millones de tokens; la verificación mediante tests unitarios solo se aplicó durante el RL, no en inferencia.
- No se han publicado evaluaciones de sesgo, toxicidad o robustez.
- El repositorio (7,8 GB) es desproporcionadamente grande para el número de parámetros declarado, lo que sugiere artefactos adicionales no documentados; conviene inspeccionar los archivos antes de descargar.
- El identificador del repositorio (`idk325-ckpt`) y el nombre del autor no aportan información sobre versionado o mantenimiento; no hay garantía de soporte.
- No se documenta el formato de pesos (safetensors, GGUF, PyTorch binario), lo que complica la integración con frameworks estándar.

## Enlaces
- Hugging Face: https://huggingface.co/SSSASDA4353535/idk325-ckpt
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
