# SparksLyse-Community/SparksLyse-320M-Instruct

## Resumen

SparksLyse-320M-Instruct es un modelo de lenguaje causal (decoder-only) de aproximadamente 320 millones de parámetros, desarrollado por la comunidad SparksLyse-Community y entrenado desde cero (*from-scratch*), es decir, sin partir de pesos de un modelo preexistente. Se trata de la versión afinada para instrucciones del modelo base SparksLyse-320M-Pretrain, y su objetivo es ofrecer un modelo compacto con capacidades de generación de texto e instrucciones, con especial atención al francés y soporte secundario de inglés.

El modelo emplea una arquitectura transformer convencional de 24 capas, con una dimensión de modelo de 1024, 16 cabezas de atención y una capa feed-forward de 3072. El contexto es de 1024 tokens mediante posiciones aprendidas (no extrapolables), y utiliza el tokenizador de camembert-base (SentencePiece Unigram, 32 043 tokens). Su relevancia radica en ser un ejemplo de entrenamiento reproducible y ligero, publicado bajo licencia Apache 2.0, útil para experimentación, docencia e investigación en modelos de pequeño tamaño.

La ficha se basa exclusivamente en la model card del autor y en los metadatos de Hugging Face; no se han publicado resultados de benchmarks ni detalles sobre el volumen o la composición exacta de los datos de entrenamiento. El modelo no usa una clase estándar de `transformers`, sino una implementación personalizada (`model.py`), lo que condiciona su despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only, implementación personalizada (`model.py`) |
| Parametros totales | ~320M (24 capas, d_model=1024, 16 cabezas, FFN=3072) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (posiciones aprendidas, no extrapolable) |
| Tipos de cuantizacion | No disponible (solo se publica checkpoint `.pt` en precisión de PyTorch) |
| Idiomas soportados | Francés (fr, fra) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`causal_transformer_instruct.pt`); no se publican safetensors ni GGUF |
| Tokenizador | camembert-base (SentencePiece Unigram, 32 043 tokens) |
| Embeddings | Entrada y salida ligados (weight tying) |
| Modelo base | SparksLyse-Community/SparksLyse-320M-Pretrain |
| Tamaño del repo | 1.3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer causal estándar de 24 capas con dimensión oculta de 1024, 16 cabezas de atención y FFN de 3072, con embeddings de entrada y salida compartidos. El contexto máximo es de 1024 tokens mediante embeddings posicionales aprendidos, lo que implica que no admite extrapolación a secuencias más largas. El tokenizador es el de camembert-base (SentencePiece Unigram, 32 043 tokens), aunque el checkpoint declara un vocabulario efectivo de 32 013.

El modelo fue entrenado desde cero sobre el modelo base SparksLyse-320M-Pretrain y posteriormente afinado para instrucciones. Los datasets de afinamiento declarados en la model card son: FreedomIntelligence/alpaca-gpt4-french, jpacifico/French-Alpaca-dataset-Instruct-55K, HuggingFaceH4/ultrachat_200k, nickrosh/Evol-Instruct-Code-80k-v1, glaiveai/glaive-function-calling-v2 y Bespokelabs/Bespoke-Stratos-17k. No se especifican el número total de tokens de entrenamiento, la composición porcentual del dataset ni si se aplicaron técnicas de RLHF o DPO. La carga del modelo requiere el código propio del repositorio (`model.py` y `config.py`) y `torch.load` sobre el checkpoint.

## Capacidades

- Generación de texto causal en francés e inglés.
- Seguimiento de instrucciones (modelo afinado sobre datasets de tipo instruct).
- Generación de código, por la presencia de Evol-Instruct-Code-80k-v1 en el entrenamiento.
- Soporte de *function calling* declarado vía el dataset glaive-function-calling-v2, aunque no se documenta el formato exacto de invocación ni su fiabilidad.
- Conversación multi-turno, por el uso de ultrachat_200k en el afinamiento.
- Razonamiento de tipo *thinking*, potencialmente influido por Bespoke-Stratos-17k, aunque no se documenta un modo de razonamiento explícito.
- Capacidades multilingües limitadas a francés e inglés.
- No se declaran capacidades de visión, audio ni agentes autónomos.

## Casos de uso

- Experimentación e investigación en modelos pequeños: permite estudiar el comportamiento de un transformer de 320M entrenado desde cero, con código propio y licencia permisiva, en entornos académicos o de prototipado.
- Generación de texto en francés para aplicaciones de bajo coste: adecuado para tareas de redacción breve, resumen o paráfrasis donde el contexto de 1024 tokens sea suficiente.
- Asistente conversacional ligero: puede gestionar diálogos multi-turno cortos gracias al afinamiento con ultrachat_200k, aunque limitado por la ventana de contexto.
- Generación de código en entornos controlados: el entrenamiento con Evol-Instruct-Code-80k-v1 permite autocompletar fragmentos o sugerir funciones simples, siempre con revisión humana.
- Pruebas de *function calling* en prototipos: útil para validar pipelines de invocación de herramientas con un modelo pequeño antes de escalar a modelos mayores.
- Docencia y formación: sirve como ejemplo didáctico de arquitectura transformer, tokenización con SentencePiece y flujo de afinamiento instruct.
- Evaluación comparativa de tokenizadores y arquitecturas: al usar el tokenizador de camembert-base, permite analizar el impacto del vocabulario en tareas francesas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 1,3 GB solo para pesos (320M parámetros × 4 bytes), más memoria para activaciones y caché KV.
- VRAM estimada en FP16/BF16: alrededor de 0,65 GB para pesos; requiere conversión manual, ya que no se publican pesos en estos formatos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP32 en contexto corto; RTX 3060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.), siempre que se gestione la memoria de activaciones.
- Opciones de despliegue: no es compatible directamente con vLLM, TGI, llama.cpp u Ollama, porque usa una arquitectura personalizada y pesos `.pt`. El despliegue requiere cargar el modelo con `torch.load` y el código del repositorio (`model.py`, `config.py`), o bien exportarlo manualmente a un formato estándar.
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación personalizada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| SparksLyse-320M-Instruct | ~320M | 1024 | fr, en | Apache 2.0 | `.pt` (custom) | Entrenado from-scratch, código propio |
| SmolLM-360M-Instruct (HuggingFace) | ~360M | 2048 | en (principalmente) | Apache 2.0 | safetensors, GGUF | Compatible con transformers y llama.cpp |
| Qwen2.5-0.5B-Instruct | ~500M | 32 768 | multilingüe | Apache 2.0 | safetensors, GGUF | Mayor contexto y ecosistema estándar |
| TinyLlama-1.1B-Chat | ~1,1B | 2048 | en | Apache 2.0 | safetensors, GGUF | Mayor tamaño y soporte comunitario |

La comparación se basa en características públicas de modelos de tamaño similar; no se dispone de benchmarks del modelo SparksLyse para comparar rendimiento. La principal desventaja frente a alternativas es la falta de compatibilidad con el ecosistema estándar de `transformers` y de formatos cuantizados.

## Limitaciones y advertencias

- Contexto muy limitado (1024 tokens) y posiciones aprendidas no extrapolables; no apto para documentos largos ni conversaciones extensas.
- Riesgo elevado de alucinación y de errores factuales por el tamaño reducido del modelo y la ausencia de benchmarks publicados.
- Sesgos potenciales heredados de los datasets de afinamiento (Alpaca, UltraChat, Glaive, etc.), no documentados ni evaluados por el autor.
- Idiomas limitados a francés e inglés; el rendimiento en otros idiomas no está garantizado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la calidad en producción no está validada.
- Requiere código personalizado (`model.py`, `config.py`) y `torch.load`, lo que complica el despliegue, la cuantización y la integración con servidores de inferencia estándar.
- No se publican safetensors ni GGUF, lo que impide usar herramientas como llama.cpp, Ollama o vLLM sin conversión manual.
- El checkpoint se distribuye como `.pt`, formato que puede requerir confianza en el origen por el uso de `torch.load` (riesgo de deserialización).
- No hay información sobre el volumen de datos de entrenamiento ni sobre posibles filtrados de datos, lo que limita la evaluación de su robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SparksLyse-Community/SparksLyse-320M-Instruct
- Modelo base (Pretrain): https://huggingface.co/SparksLyse-Community/SparksLyse-320M-Pretrain
- Perfil de la organización: https://huggingface.co/SparksLyse-Community
- Tokenizador de referencia: https://huggingface.co/almanach/camembert-base
- Dataset FreedomIntelligence/alpaca-gpt4-french: https://huggingface.co/datasets/FreedomIntelligence/alpaca-gpt4-french
- Dataset jpacifico/French-Alpaca-dataset-Instruct-55K: https://huggingface.co/datasets/jpacifico/French-Alpaca-dataset-Instruct-55K
- Dataset HuggingFaceH4/ultrachat_200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset nickrosh/Evol-Instruct-Code-80k-v1: https://huggingface.co/datasets/nickrosh/Evol-Instruct-Code-80k-v1
- Dataset glaiveai/glaive-function-calling-v2: https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Dataset Bespokelabs/Bespoke-Stratos-17k: https://huggingface.co/datasets/Bespokelabs/Bespoke-Stratos-17k
