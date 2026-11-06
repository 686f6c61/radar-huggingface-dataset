# wjcwqc/MireskaVoice-qwen3tts

## Resumen

MireskaVoice-qwen3tts es un ajuste fino mediante LoRA del modelo de síntesis de voz Qwen3-TTS-12Hz-1.7B-Base, desarrollado por el usuario wjcwqc. Su objetivo es clonar la voz del personaje Dark Willow (Mireska Sunbreeze) del videojuego Dota 2 en chino mandarín. El modelo parte de la arquitectura de lenguaje de voz multichannel de 12 Hz de Qwen y se especializa en una única identidad de hablante mediante un conjunto de 884 fragmentos de audio extraídos del juego.

El modelo es relevante como ejemplo práctico de ajuste fino eficiente de un TTS autoregresivo en hardware de consumo: todo el entrenamiento y la inferencia se completaron en una única GPU RTX 3050 Ti Laptop con 4 GB de VRAM. Además, el autor documenta de forma inusualmente rigurosa un fenómeno de degradación generativa por sobreajuste, aportando curvas de loss y evaluaciones de CER y similitud de hablante para 12 checkpoints.

La ficha se basa exclusivamente en la model card publicada y en los metadatos del repositorio de Hugging Face. No se han encontrado publicaciones externas, papers ni demos adicionales más allá del repositorio hermano enlazado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo de lenguaje de voz (Qwen3-TTS), con talker de 28 capas y code_predictor de 5 capas; tokenizador de audio a 12 Hz con 16 codebooks |
| Parametros totales | 1.7B (modelo base); LoRA entrenable: 7.24M (132 modulos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Entrenamiento con base en bnb 8-bit y LoRA en bf16; inferencia en bfloat16 (no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache-2.0 (pesos y codigo); el autor restringe el uso comercial por los derechos del personaje y las voces originales |
| Formato de pesos | safetensors (modelo merged de 3.86 GB + tokenizador de 651 MB; LoRA de 14 MB) |

## Arquitectura y entrenamiento

El modelo base Qwen3-TTS-12Hz-1.7B-Base es un modelo de lenguaje de voz que representa el audio mediante un tokenizador de 12 Hz con 16 codebooks, generado de forma autoregresiva por un talker de 28 capas y un code_predictor de 5 capas. Sobre esta base, el ajuste introduce LoRA (r=16, alpha=32) únicamente en las proyecciones q/k/v/o de atención, con 132 módulos y 7.24M parámetros entrenables, mientras el resto de la base (speaker_encoder, speech_tokenizer, lm_heads y las capas lineales grandes, convertidas a bnb 8-bit) permanece congelado. La función de pérdida combina la entropía cruzada del codec principal (codec_0) con 0.3 veces la del sub-talker, replicando el SFT oficial.

Los datos de entrenamiento consisten en 884 fragmentos de voz en chino extraídos de Dota 2 (0.79 horas) más 20 de validación, con una única referencia de hablante compartida (ref_24k.wav, 24 kHz). Se entrenó con AdamW, lr 2e-5 con warmup de 50 pasos, weight decay 0.01, batch 2 con acumulación de gradiente 2, bf16, SDPA y gradient checkpointing, alcanzando 1184 pasos en 5 épocas. El autor documenta una innovación relevante: un script propio de entrenamiento con base en 8 bits y LoRA en bf16 que permite ejecutar el ajuste en 4 GB de VRAM, frente a los requisitos del script oficial, que exige entrenamiento de parámetros completos y FlashAttention-2.

## Capacidades

- Síntesis de voz (text-to-speech) en chino mandarín con una identidad de hablante concreta.
- Clonación de voz mediante prompt de referencia de audio (voice cloning con `x_vector_only_mode=True`).
- Generación de audio a 24 kHz en modo no streaming.
- Condicionamiento por x-vector de hablante extraído del audio de referencia.
- Inferencia en bfloat16 con atención SDPA.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión, audio de entrada distinto de la referencia, ni capacidades multilingües más allá del chino.

## Casos de uso

- Doblaje de contenido de fan para Dota 2: el modelo permite generar líneas de voz del personaje Dark Willow en chino a partir de guiones de texto, manteniendo la identidad de hablante clonada con un CER de 0.0471 en el conjunto de validación.
- Prototipado de asistentes de voz con personaje: sirve para validar pipelines de TTS con identidad de voz fija en entornos de investigación, dado que el modelo se ejecuta en una GPU de 4 GB.
- Investigación sobre ajuste fino eficiente de TTS: el repositorio incluye scripts de entrenamiento, exportación, inferencia y evaluación, además de curvas de loss y evaluaciones por checkpoint, lo que lo convierte en un caso de estudio reproducible para LoRA en modelos de lenguaje de voz.
- Evaluación de metodologías de selección de checkpoint: el modelo documenta que el mejor checkpoint para generación (step200) no coincide con el de menor dev loss (step1184), útil para quienes diseñan protocolos de validación en TTS autoregresivo.
- Generación de audiolibros o contenido narrado en chino con una voz concreta: adecuado para pruebas de concepto con una sola voz, aunque limitado a la identidad entrenada.
- Comparación de motores TTS: el autor incluye una comparativa con OmniVoice, Ming-3.0-tts, CosyVoice3 y VITS sobre el mismo split, útil para benchmarking interno de pipelines de clonación de voz.

## Benchmarks y rendimiento

Evaluación sobre 20 textos de validación (CER menor es mejor; spk-sim mayor es mejor). La similitud de hablante entre fragmentos reales del mismo personaje se sitúa en 0.6994 como referencia.

| Modelo | CER | spk-sim |
|---|---|---|
| Qwen3-TTS LoRA step100 (alternativo) | 0.0414 | 0.6086 |
| Qwen3-TTS LoRA step200 (entregado) | 0.0471 | 0.6221 |
| Qwen3-TTS LoRA step400 | 0.0598 | 0.5798 |
| Qwen3-TTS LoRA step800 | 0.0842 | 0.5445 |
| Qwen3-TTS LoRA step1184 (final del entrenamiento) | 0.0674 | 0.5282 |
| OmniVoice ajustado (repositorio hermano) | 0.028 | 0.758 |
| Ming-3.0-tts LoRA (repositorio hermano) | 0.0416 | 0.6454 |
| CosyVoice3 zero-shot | 0.056 | 0.706 |
| VITS ajustado | 0.306 | 0.572 |

El checkpoint entregado obtiene 14 de 20 frases sin errores de carácter; los errores se concentran en frases cortas, partículas y nombres propios. La similitud de hablante queda 0.077 por debajo de la línea base humana. El autor reporta una prueba t pareada de t=4.54 (p<0.001) frente al step1184 y de t=1.51 (no significativa) frente al step100.

## Requisitos de hardware

- VRAM: el autor reporta que el modelo se entrenó e infirió en una RTX 3050 Ti Laptop con 4 GB de VRAM, con un pico de 8.67 GB reportado por PyTorch (parte en memoria del sistema por WDDM).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en bf16; se ha validado en RTX 3050 Ti Laptop. No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, según la validación del autor en una GPU de portátil de 4 GB.
- Despliegue: requiere el paquete oficial `qwen-tts` (`pip install qwen-tts`); en Windows es necesario añadir SoX al PATH. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El entrenamiento se ejecutó a aproximadamente 5.7 s por paso.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER (validación del autor) | spk-sim | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MireskaVoice-qwen3tts (step200) | 1.7B | No disponible | 0.0471 | 0.6221 | Apache-2.0 (con restricción de uso comercial del autor) | Hugging Face |
| MireskaVoice (OmniVoice) | No disponible | No disponible | 0.028 | 0.758 | No disponible | Hugging Face |
| MireskaVoice-ming (Ming-3.0-tts) | No disponible | No disponible | 0.0416 | 0.6454 | No disponible | Hugging Face |
| CosyVoice3 (zero-shot) | No disponible | No disponible | 0.056 | 0.706 | No disponible | No disponible |

La comparación se limita a los datos del propio autor sobre el mismo split de validación; no se dispone de parámetros ni contextos de los modelos alternativos.

## Limitaciones y advertencias

- El modelo solo sintetiza chino mandarín y una única identidad de hablante (Dark Willow); no es un TTS multilingüe ni multi-hablante.
- Riesgo de sobreajuste generativo: el autor demuestra que el checkpoint con menor dev loss (step1184) produce peor similitud de hablante (0.5282) que el step200 (0.6221); no debe seleccionarse checkpoint por loss de teacher forcing.
- La similitud de hablante (0.6221) queda por debajo de la línea base humana (0.6994), por lo que la clonación no es indistinguible de la voz original.
- Errores de pronunciación documentados en frases cortas, partículas y nombres propios (por ejemplo, 米瑞斯嘉 → 米瑞斯加, 铁雾城 → 铁屋城).
- Restricción legal: los derechos del personaje pertenecen a Valve Corporation y las voces se extrajeron de archivos del juego; el autor prohíbe explícitamente el uso comercial pese a la licencia Apache-2.0 de los pesos.
- No se documentan sesgos demográficos ni de otro tipo; el conjunto de entrenamiento es una única voz de personaje ficticio.
- Dependencia de la referencia de audio exacta (`eval/ref_24k.wav`) para mantener la coherencia entre entrenamiento e inferencia; usar otra referencia puede degradar el resultado.
- No hay soporte documentado para despliegue en servidores de alto rendimiento (vLLM, TGI) ni cuantizaciones GGUF.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wjcwqc/MireskaVoice-qwen3tts
- Modelo base: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base
- Repositorio hermano (OmniVoice): https://huggingface.co/wjcwqc/MireskaVoice
- Repositorio hermano (Ming-3.0-tts): https://huggingface.co/wjcwqc/MireskaVoice-ming
- SoX (dependencia en Windows): https://sourceforge.net/projects/sox/
