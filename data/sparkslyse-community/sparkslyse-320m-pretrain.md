# SparksLyse-Community/SparksLyse-320M-Pretrain

## Resumen

SparksLyse-320M-Pretrain es un modelo de lenguaje causal decoder-only de aproximadamente 320 millones de parámetros, entrenado desde cero (from scratch) por la comunidad SparksLyse-Community en el marco del proyecto Lyse.AI. Está orientado principalmente al francés, con soporte declarado también para inglés, y se distribuye bajo licencia Apache 2.0. Se trata de un checkpoint base de preentrenamiento, sin ajuste fino por instrucciones ni alineamiento posterior.

El modelo emplea una arquitectura transformer convencional con 24 capas, dimensión de modelo de 1024, 16 cabezas de atención y una capa feed-forward de 3072, con embeddings de entrada y salida ligados. Su ventana de contexto es de 1024 tokens mediante posiciones aprendidas, lo que implica que no es extrapolable más allá de esa longitud. Utiliza el tokenizador de camembert-base (SentencePiece Unigram, 32 043 tokens en el tokenizador original; el vocabulario del checkpoint es de 32 005).

Su relevancia es limitada pero concreta: se trata de un ejercicio de entrenamiento reproducible desde cero, útil para investigación sobre modelos ligeros en francés, experimentación con arquitecturas personalizadas y como base para ajuste fino. No es un modelo pensado para producción conversacional ni para tareas que requieran contexto largo o razonamiento complejo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (implementación personalizada, `model.py`) |
| Parametros totales | ~320M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (posiciones aprendidas, no extrapolable) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch `.pt`; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | francés (fr/fra), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`causal_transformer.pt`), no safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer causal decoder-only con 24 capas, `d_model=1024`, 16 cabezas de atención y dimensión feed-forward de 3072. Los embeddings de entrada y salida están ligados (weight tying). La atención usa posiciones aprendidas, lo que fija el contexto máximo en 1024 tokens y descarta la extrapolación a secuencias más largas. El tokenizador es el de camembert-base (SentencePiece Unigram, 32 043 tokens), aunque el vocabulario efectivo del checkpoint es de 32 005.

El preentrenamiento se realizó desde cero sobre un corpus compuesto por Wikipedia en francés e inglés, según los datasets declarados en la model card (`wikimedia/wikipedia`, `HuggingFaceFW/fineweb-2`, `HuggingFaceFW/fineweb-edu`). El entrenamiento empleó precisión mixta bf16 y gradient checkpointing. No se especifican en la información disponible el número total de tokens procesados, la composición exacta del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto autoregresiva en francés e inglés, propio de un modelo causal base.
- Modelado de lenguaje y continuación de texto; no se documenta ajuste por instrucciones ni formato de chat.
- Capacidad multilingüe limitada a francés e inglés según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Investigación sobre entrenamiento from scratch: el modelo sirve como referencia reproducible para estudiar el comportamiento de transformers ligeros en francés, con arquitectura y código de carga documentados.
- Experimentación académica con modelos de ~320M: útil para comparar curvas de aprendizaje, tokenizadores y configuraciones de atención en entornos con recursos limitados.
- Base para ajuste fino supervisado: al ser un checkpoint base Apache 2.0, puede adaptarse a tareas concretas en francés (clasificación, extracción, resumen) mediante fine-tuning con datasets propios.
- Generación de texto de dominio específico: tras ajuste fino, podría emplearse para completar o redactar textos acotados en francés, siempre con revisión humana por su tamaño reducido.
- Prototipado y docencia: su tamaño permite ejecutarlo en una GPU de consumo para demostraciones de inferencia autoregresiva y estudio interno del modelo.
- Evaluación de tokenizadores en francés: permite analizar el impacto del tokenizador de camembert-base en tareas de modelado de lenguaje galo.
- Pruebas de pipelines de inferencia personalizados: al requerir carga manual del state dict y una clase propia, es útil para validar integraciones no estándar en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, ~1,3 GB solo de pesos (coincide con el tamaño del repo); en bf16/fp16, ~0,65 GB. El consumo real añade memoria para activaciones y caché KV, moderada por el contexto de 1024 tokens.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso con holgura.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas (GTX 1660 en adelante, con margen).
- Opciones de despliegue: no hay soporte nativo en vLLM, TGI, llama.cpp u Ollama al no publicarse pesos en formatos estándar (safetensors/GGUF) ni una clase `transformers`. El despliegue requiere cargar el state dict con PyTorch y la clase `CausalTransformerModel` del repositorio.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| SparksLyse-320M-Pretrain | ~320M | 1024 | fr, en | Apache 2.0 | PyTorch `.pt`, carga custom |
| CamemBERT (base) | ~110M | 512 | fr | MIT | safetensors/transformers |
| XLM-RoBERTa base | ~278M | 512 | multilingüe | MIT | safetensors/transformers |
| GPT-2 small | ~124M | 1024 | en | MIT | safetensors/transformers |

La comparación es orientativa: CamemBERT y XLM-RoBERTa son modelos encoder (enmascarados), no causales, por lo que la comparación directa en generación no es equivalente. GPT-2 small comparte escala y contexto, pero está orientado al inglés. SparksLyse-320M se distingue por su naturaleza from scratch, su licencia permisiva y su integración no estándar, que dificulta su uso con herramientas del ecosistema.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no ha pasado por RLHF, DPO ni ajuste por instrucciones, por lo que no es fiable como asistente conversacional.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo, especialmente con prompts fuera de distribución.
- Contexto muy limitado (1024 tokens) y posiciones aprendidas no extrapolables: no admite documentos largos ni conversaciones multi-turno extensas.
- Cobertura idiomática restringida a francés e inglés; el rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Sesgos desconocidos: no se documenta análisis de sesgos ni composición detallada del corpus más allá de Wikipedia y FineWeb.
- Integración no estándar: requiere código propio (`model.py`, `config.py`) y no funciona con `AutoModelForCausalLM`, lo que complica su uso en producción y en pipelines estándar.
- Sin versiones cuantizadas ni formatos GGUF/safetensors publicados; el despliegue eficiente exige trabajo adicional.
- Licencia Apache 2.0 permisiva para uso comercial, pero la ausencia de garantías y de evaluación hace recomendable una validación exhaustiva antes de cualquier uso en producción.
- Repositorio con muy poca tracción (0 descargas, 1 like en el momento de la consulta): no hay evidencia de uso comunitario ni de mantenimiento continuado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SparksLyse-Community/SparksLyse-320M-Pretrain
- Perfil de la organización en Hugging Face: https://huggingface.co/SparksLyse-Community
- Colección SparksLyse V1: https://huggingface.co/collections/SparksLyse-Community/sparkslyse-v1
- Organización en GitHub: https://github.com/SparksLyse-Community
- Tokenizador camembert-base: https://huggingface.co/camembert-base
- Dataset Wikipedia: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
