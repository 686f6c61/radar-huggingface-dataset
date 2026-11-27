# THUSI-Lab/GameScaling-2B-S3

## Resumen

GameScaling-2B-S3 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de IA de miHoYo (Honkai), la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-2B, con 2.721.801.024 parámetros totales, orientado a la actuación de agentes encarnados (embodied agents) en entornos de videojuego mediante control de teclado y ratón.

El modelo forma parte de la familia GameScaling, que explora el escalado de modelos mediante preentrenamiento continuado sobre datos de múltiples mundos virtuales. La variante S3 corresponde a una de las etapas de entrenamiento de dicha familia, y esta versión concreta emplea 2B parámetros, lo que la sitúa en el rango de modelos pequeños desplegables en hardware de consumo. El pipeline declarado es image-text-to-text, lo que implica que acepta tanto imágenes (capturas de pantalla del juego) como texto como entrada.

Su relevancia actual radica en la creciente demanda de agentes capaces de operar interfaces gráficas y videojuegos de forma autónoma, un campo donde los modelos multimodales pequeños con control de acciones discretas (pulsaciones de teclado y movimientos de ratón) resultan especialmente útiles para investigación en agentes encarnados, evaluación de políticas y prototipado de asistentes de juego. La licencia Apache 2.0 facilita su uso comercial y su integración en pipelines de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-2B |
| Parametros totales | 2.721.801.024 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-2B mediante un proceso de ajuste fino (base_model_relation: finetune) y preentrenamiento continuado (continued-pretraining) sobre datos de múltiples mundos virtuales. La arquitectura subyacente es un transformer multimodal que procesa entradas de imagen y texto y genera salidas de texto, en este caso orientadas a la predicción de acciones de teclado y ratón dentro de entornos de juego. El pipeline image-text-to-text confirma la presencia de un codificador visual acoplado al modelo de lenguaje, aunque la model card no detalla la configuración exacta de dicho codificador ni la resolución de las imágenes de entrada.

El entrenamiento se enmarca en la línea de investigación "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds", que estudia cómo el preentrenamiento continuado sobre datos de diversos videojuegos mejora la transferencia de políticas de control entre entornos. La información disponible no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas concretas como decodificación especulativa o atención lineal. La familia incluye variantes de 0.8B, 2B, 9B y 27B, con etapas S1 y S3, lo que sugiere un estudio sistemático del escalado tanto en tamaño de modelo como en etapas de entrenamiento.

## Capacidades

- Generación de texto y razonamiento multimodal a partir de imágenes y texto (pipeline image-text-to-text).
- Control de agentes encarnados en videojuegos mediante predicción de acciones de teclado y ratón (tags keyboard-mouse, game-agent, embodied-agent).
- Procesamiento de capturas de pantalla de juegos como entrada visual para la toma de decisiones.
- Ajuste específico para entornos de múltiples mundos virtuales gracias al preentrenamiento continuado (continued-pretraining).
- Conversación multi-turno (tag conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a agentes encarnados, aunque no se detalla el soporte de razonamiento multi-paso genérico.
- Capacidades multilingües: limitadas al inglés (en).
- Capacidades especiales: control de teclado y ratón; no se documentan modos de pensamiento (thinking), audio ni visión más allá de la entrada image-text.

## Casos de uso

- Investigación en agentes encarnados: el modelo puede emplearse como política de control en entornos de videojuego, recibiendo capturas de pantalla y emitiendo acciones de teclado y ratón, lo que permite evaluar técnicas de preentrenamiento continuado en diversos mundos virtuales.
- Automatización de pruebas de jugabilidad (QA): un agente basado en este modelo puede jugar de forma autónoma para detectar bugs, bloqueos o comportamientos anómalos en builds de desarrollo, reduciendo la dependencia de testers humanos.
- Prototipado de asistentes de juego: integración en herramientas de asistencia que observan la pantalla y sugieren o ejecutan acciones al jugador, aprovechando su capacidad image-text-to-text y su ajuste específico a interfaces de juego.
- Generación de datos sintéticos de interacción: el modelo puede registrar secuencias de acciones y observaciones para construir datasets de entrenamiento de otros agentes o para imitación de comportamiento.
- Benchmarking de modelos pequeños multimodales: al ser una variante de 2B con licencia Apache 2.0, sirve como referencia para comparar el rendimiento de políticas de control en el rango de modelos desplegables en hardware de consumo.
- Educación e investigación académica: reproducción de experimentos de la familia GameScaling y estudio de la transferencia entre dominios en entornos virtuales, dado que el modelo y el código están publicados abiertamente.
- Integración en pipelines de evaluación de agentes: uso como componente de decisión dentro de frameworks de agentes que requieran una política ligera y multimodal para tareas de control de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 2,72B parámetros en precisión FP16 requiere aproximadamente 5,5 GB solo para los pesos, cantidad que coincide con el tamaño del repositorio (5,5 GB); en cuantización de 8 bits rondaría los 2,7-3 GB y en 4 bits los 1,5-2 GB, si bien estas cifras no están confirmadas por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB en FP16; en cuantización podría ejecutarse en GPUs de 8 GB.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en GPUs con 8 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: la librería declarada es transformers; también es compatible con endpoints (tag endpoints_compatible). No se documenta soporte explícito para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-2B-S3 | 2,72B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face |
| GameScaling-2B-S1 | no disponible | no disponible | image-text-to-text | Apache 2.0 | Hugging Face |
| GameScaling-0.8B-S3 | no disponible | no disponible | image-text-to-text | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | no disponible | no disponible | texto/multimodal según base | no disponible | Hugging Face |

La comparativa se limita a las variantes de la propia familia GameScaling y al modelo base, ya que la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos competidores de la misma categoría (agentes encarnados multimodales de ~2B). No se dispone de benchmarks que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos de videojuegos concretos, puede presentar sesgos hacia los entornos y estilos visuales de dichos juegos.
- Riesgo de alucinación: inherente a los modelos generativos; en el contexto de control de agentes, puede producir acciones inválidas o no óptimas, especialmente en entornos no vistos durante el entrenamiento.
- Limitaciones de idioma: solo se declara soporte de inglés (en), por lo que el rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide evaluar su idoneidad para tareas que requieran ventanas largas.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-2B y de los datasets de juegos utilizados, que podrían tener restricciones adicionales.
- Caveats para producción: no hay información sobre latencia, throughput ni robustez en entornos reales; el modelo está orientado a investigación en agentes encarnados y su uso en producción requeriría validación adicional. La ausencia de documentación sobre tool calling o razonamiento multi-paso limita su uso en pipelines de agentes genéricos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante GameScaling-0.8B-S1: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1
- Variante GameScaling-0.8B-S3: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Variante GameScaling-2B-S1: https://huggingface.co/THUSI-Lab/GameScaling-2B-S1
- Variante GameScaling-9B-S1: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Variante GameScaling-9B-S3: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
- Variante GameScaling-27B-S1: https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
