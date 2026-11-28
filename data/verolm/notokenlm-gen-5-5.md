# VeroLM/NoTokenLM-Gen-5.5

## Resumen

NoTokenLM-Gen-5.5 es un modelo de lenguaje **sin tokenizador** (tokenizer-free) de nivel de byte, desarrollado por VeroLM. En lugar de usar un vocabulario BPE o SentencePiece, el modelo recibe directamente bytes UTF-8 (valores 0..255) y emite bytes UTF-8 como salida. Para evitar el coste computacional de un forward pass completo por cada byte, agrupa los bytes en *patches* de longitud variable (media aproximada de 6 bytes, máximo 16) y ejecuta el tronco principal una sola vez por patch.

Es un modelo **base** (no ajustado por instrucciones): continúa texto, no responde a instrucciones. Con 168,9 M de parámetros totales (incluyendo una tabla de hash-embeddings de 19,9 M y un patcher de entropía congelado de 4,5 M), se sitúa en la gama de modelos pequenos, pero con una arquitectura hibrida poco habitual que combina RWKV-7, atención con compuerta y mecanismos de copia basados en sufijos (ROSA).

La relevancia de este modelo reside en su propuesta arquitectonica: demuestra que un LM a nivel de byte puede ser competitivo en eficiencia si se agrupan bytes en patches guiados por entropía y se usa un tronco hibrido recurrente/atencional. La ventana de contexto es de 4.096 bytes, y fue entrenado con aproximadamente 100 B bytes de texto mayoritariamente en inglés, con matemáticas, código y francés. Licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: encoder local convolucional + atención ventaneada, patching por entropía, tronco de 20 capas (5 × [RWKV-7, atención con compuerta, RWKV-7, RWKV-7]), decoder local con 4 bloques de atención ventaneada |
| Parametros totales | 168.862.668 (168,9 M), incluye tabla de hash-embeddings de 19,9 M y patcher de entropía congelado de 4,5 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 bytes (ventana de entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en fp32; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | Inglés (principal), francés; matemáticas y código en el dataset de entrenamiento |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, pesos EMA) |

## Arquitectura y entrenamiento

La arquitectura es una hibrida jerarquica diseñada para operar sobre bytes crudos. El flujo es: embedding de byte + embedding de n-gramas hasheados (órdenes 3–8) + características de coincidencia de sufijos ROSA → encoder local (dos convoluciones y atención ventaneada, d = 256) → patching basado en entropía → pooling por atención → tronco sobre patches (20 capas, d = 768, SwiGLU) → decoder local (4 bloques de atención ventaneada, d = 256) → logits de 256 vías para el siguiente byte.

El **patching por entropía** usa un pequeno modelo convolucional causal congelado que predice el siguiente byte; cuando su entropía supera un umbral calibrado (`theta`, almacenado en `config.json`), se inicia un nuevo patch. Como los límites solo dependen de bytes ya vistos, son reproducibles en generación. El **tronco hibrido** combina capas RWKV-7 (con value residual) para la mayor parte de la mezcla de secuencia, con una capa de atención con compuerta, QK-norm y sin posición (NoPE) en cada bloque. **ROSA** es un autómata de sufijos en línea que encuentra la coincidencia anterior más larga del sufijo actual y alimenta el byte predicho y la longitud de coincidencia al encoder, además de un pequeno boost en los logits (mecanismo de copia en la línea de RWKV-8). **DeepEmbed** aplica escalado por byte de las activaciones FFN locales.

El entrenamiento usó aproximadamente 100 B bytes de una mezcla con predominio de inglés, más matemáticas, código y francés. No se documenta en la model card el uso de RLHF, DPO ni ajuste por instrucciones; es explícitamente un modelo base. Los pesos publicados son EMA en fp32. La implementación PyTorch fue verificada contra el código original de entrenamiento en JAX: los logits coinciden con ≈ 3e-5 y el argmax coincide en todos los casos (con pesos aleatorios de la configuración completa).

## Capacidades

- Generación de texto a nivel de byte: continuación de texto sin tokenizador, con entrada y salida en UTF-8 crudo.
- Modelo base: continúa texto; no está ajustado por instrucciones ni para seguir comandos.
- Razonamiento y conocimiento general: entrenado con mezcla de texto con predominio de inglés, matemáticas y código.
- Capacidades multilingües limitadas: inglés (principal) y francés; no se documentan otros idiomas.
- Mecanismo de copia (ROSA): puede reproducir fragmentos de contexto previo mediante coincidencia de sufijos, útil para texto repetitivo o citas.
- Generación controlable: soporta `temperature`, `top_k`, `top_p`, `do_sample=False` (greedy), `seed` y `stop_at_eod`; la generación se detiene al emitir el byte 0 (fin de documento).
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.

## Casos de uso

- **Investigación en modelos sin tokenizador**: el modelo sirve como banco de pruebas para estudiar patching por entropía, embeddings de n-gramas hasheados y mecanismos de copia ROSA sin la variable del tokenizador. Su tamano (168,9 M) permite experimentar en una sola GPU.
- **Generación de texto creativo y narrativo**: con prompts como "Once upon a time...", el modelo produce continuaciones coherentes a nivel local; útil para prototipos de escritura asistida donde no se requiere instruction-following.
- **Continuación de texto técnico y educativo**: puede completar fragmentos de estilo enciclopédico o web educativa, como muestran los ejemplos de la model card, aunque con riesgo de imprecisiones factuales.
- **Procesamiento robusto de texto multilingüe a nivel de byte**: al operar sobre bytes UTF-8, maneja de forma nativa cualquier codificación de entrada sin vocabulario fijo; útil en pipelines donde el texto contiene mezclas de idiomas o caracteres fuera de vocabulario.
- **Reproducción y copia de fragmentos largos**: el mecanismo ROSA permite copiar coincidencias de sufijos del contexto, útil en tareas de extracción o reformateo donde se reutilizan cadenas del prompt.
- **Educación y demostraciones**: el notebook interactivo (Colab/Kaggle/Jupyter) incluido facilita demostrar arquitecturas híbridas RWKV-7 + atención y generación a nivel de byte en cursos o talleres.
- **Base para fine-tuning**: al ser un modelo base Apache-2.0 de 168,9 M, puede ajustarse para tareas específicas (clasificación, continuación de dominio) con requisitos de hardware modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una sección de evaluación, pero los datos concretos no se incluyen en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 168,9 M de parámetros en fp32, los pesos ocupan aproximadamente 0,68 GB; en fp16/bf16, unos 0,34 GB. La model card recomienda ejecutar en **float32** (el valor por defecto), lo que implica alrededor de 0,7 GB solo para pesos, más overhead de activaciones y caché de estado del tronco.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente; una RTX 3060 (12 GB), RTX 4060 (8 GB) o superior puede ejecutarlo con holgura. Para despliegue en servidor, A100 o H100 no son necesarias pero funcionarían.
- **Cabe en GPU consumer**: sí, en prácticamente cualquier GPU consumer con al menos 2–4 GB de VRAM, dado el tamano del modelo y la ventana de contexto de 4.096 bytes.
- **Opciones de despliegue**: `transformers` con `trust_remote_code=True` (requerido porque la arquitectura se distribuye con los pesos); probado con `transformers` 4.46 y 5.23. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; la arquitectura personalizada y el patching por entropía probablemente requieran implementaciones específicas.
- **Latencia y throughput**: no disponibles. La model card destaca que la generación es barata porque el tronco solo avanza un paso por patch cerrado y mantiene el estado en caché, pero no se proporcionan cifras.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de comparaciones directas en la información proporcionada. Como referencia estructural, se puede comparar con otros modelos de la misma categoría (tamano y propuesta):

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| NoTokenLM-Gen-5.5 | 168,9 M | 4.096 bytes | Byte-level sin tokenizador, tronco hibrido RWKV-7 + atención | Apache-2.0 |
| Modelos tipo GPT-2 small | ~124 M | 1.024 tokens | Transformer decoder con tokenizador BPE | MIT (variantes) |
| Modelos tipo RWKV-7 pequenos | ~150–200 M (segun variante) | Variable | RNN lineal puro | Apache-2.0 (variantes) |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; no se inventan cifras.

## Limitaciones y advertencias

- **Modelo base sin instruction-following**: no responde a instrucciones ni sigue formatos de chat; solo continúa texto.
- **Riesgo de alucinación**: los ejemplos de la model card muestran imprecisiones factuales claras (por ejemplo, atribuye la Revolución Francesa a una "banda borbónica" y menciona Inglaterra en ese contexto); no debe usarse como fuente de hechos sin verificación.
- **Contexto limitado**: 4.096 bytes es una ventana pequena comparada con modelos actuales; insuficiente para documentos largos o conversaciones multi-turno extensas.
- **Cobertura de idiomas limitada**: solo inglés y francés documentados; el rendimiento en castellano u otros idiomas no está garantizado.
- **Cortes en caracteres multibyte**: al generar a nivel de byte, es posible que la generación termine a mitad de un carácter UTF-8; se recomienda decodificar con `errors="replace"`.
- **Reproducibilidad**: las muestras de la model card se generaron con la implementación original en JAX; la implementación PyTorch reproduce los logits pero usa un flujo de números aleatorios distinto, por lo que la misma semilla produce texto diferente.
- **Dependencia de código remoto**: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio del autor; conviene auditar antes de usar en producción.
- **Licencia Apache-2.0**: permite uso comercial, pero al ser un modelo base sin garantías, el usuario asume la responsabilidad del fine-tuning y de la validación de sesgos y seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5
- Checkpoint de mid-training (Preview): https://huggingface.co/VeroLM/NoTokenLM-Gen-5.5-Preview
- Notebook interactivo: incluido en el repositorio como `notebook.ipynb` (ruta relativa al repo de Hugging Face)
