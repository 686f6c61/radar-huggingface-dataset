# THUSI-Lab/GameScaling-2B-S1

## Resumen

GameScaling-2B-S1 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de IA de Honkai de miHoYo, la Universidad de Tsinghua, la Universidad de la Academia China de las Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-2B, orientado a la actuación de agentes encarnados (embodied agents) en entornos de videojuegos mediante control de teclado y ratón.

El modelo resuelve el problema de dotar a un modelo de lenguaje compacto de la capacidad de interpretar observaciones visuales de un videojuego y emitir acciones de bajo nivel (pulsaciones de teclas y movimientos de ratón) para completar tareas dentro de mundos virtuales diversos. Forma parte de la familia GameScaling, que incluye variantes de 0,8B, 2B, 9B y 27B en configuraciones S1 y S3, lo que permite estudiar el escalado de capacidades agénticas en entornos virtuales.

Con 2.721.801.024 parámetros reales según los pesos en safetensors y un repositorio de 5,5 GB, es un modelo relativamente ligero que puede ejecutarse en hardware de consumo. Su relevancia actual radica en que demuestra que el entrenamiento continuado (continued pre-training) sobre datos de videojuegos diversos mejora la transferencia de habilidades agénticas en modelos de pequeño tamaño.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen3.5 (image-text-to-text) |
| Parámetros totales | 2.721.801.024 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; cuantizaciones GGUF no confirmadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-2B, un transformer multimodal de la familia Qwen3.5 con capacidad de procesar entradas de imagen y texto. THUSI-Lab aplica un proceso de continued pre-training (entrenamiento continuado) sobre datos de videojuegos diversos, según indica la model card. El pipeline es image-text-to-text, lo que implica que el modelo recibe capturas de pantalla del juego junto con instrucciones textuales y produce acciones de teclado y ratón.

La familia GameScaling se organiza en dos configuraciones (S1 y S3) y cuatro tamaños (0,8B, 2B, 9B y 27B), lo que sugiere un estudio sistemático del efecto del escalado y de la etapa de entrenamiento sobre el rendimiento agéntico. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Procesamiento conjunto de imagen y texto (image-text-to-text): interpreta capturas de pantalla de videojuegos y las combina con instrucciones en lenguaje natural.
- Actuación como agente encarnado mediante control de teclado y ratón: emite acciones de bajo nivel para interactuar con el entorno del juego.
- Razonamiento multi-paso orientado a la consecución de objetivos dentro de mundos virtuales.
- Capacidad de generalización a distintos videojuegos y entornos virtuales gracias al entrenamiento continuado sobre datos diversos.
- Conversación multi-turno (etiqueta "conversational" en los tags del modelo).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio especiales: no documentados en la información disponible.

## Casos de uso

- Investigación en agentes encarnados: el modelo sirve como banco de pruebas para estudiar cómo un modelo de 2B parámetros interpreta observaciones visuales y emite acciones de control en videojuegos, permitiendo comparar con las variantes de 0,8B, 9B y 27B de la misma familia para analizar el efecto del escalado.
- Automatización de pruebas de jugabilidad (playtesting): se puede integrar en pipelines que ejecutan partidas automatizadas para detectar bugs, bloqueos o comportamientos inesperados en distintos niveles de un juego, aprovechando su capacidad de control de teclado y ratón.
- Generación de datos sintéticos de interacción: el modelo puede actuar como agente que genera trayectorias de juego (pares observación-acción) para entrenar o evaluar otros agentes, dado su entrenamiento específico en entornos virtuales.
- Investigación en transferencia entre dominios: al estar entrenado con datos de múltiples videojuegos, permite estudiar la generalización de políticas agénticas entre distintos mundos virtuales con mecánicas diferentes.
- Prototipado de asistentes in-game: desarrolladores pueden evaluar la viabilidad de un asistente que observe la pantalla y sugiera o ejecute acciones al jugador, con la ventaja de su reducido tamaño (2,7B parámetros) que facilita el despliegue local.
- Educación e investigación académica: por su licencia Apache 2.0 y su tamaño contenido, es adecuado para experimentos en laboratorios con recursos limitados de GPU, sirviendo como referencia en estudios sobre embodied AI.
- Comparación de configuraciones de entrenamiento: las variantes S1 y S3 del mismo tamaño permiten aislar el efecto de la etapa de entrenamiento sobre el rendimiento final en tareas de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,72B parámetros, en FP16 se requieren aproximadamente 5,5 GB de VRAM solo para los pesos; en cuantización de 8 bits, unos 2,8 GB; en 4 bits, alrededor de 1,5 GB. Estas cifras son estimaciones basadas en el tamaño del modelo y no incluyen el coste adicional del procesamiento de imágenes.
- GPU recomendadas: para FP16, una GPU con al menos 8-10 GB de VRAM (RTX 3070/4060 Ti o superior). Para cuantizaciones de 8 o 4 bits, es viable en GPUs de 4-6 GB como la RTX 3050 o incluso en GPUs integradas con suficiente memoria compartida.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas, especialmente con cuantización.
- Opciones de despliegue: transformers (librería indicada en la model card), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-2B-S1 | 2,72B | No disponible | Imagen + texto | Apache 2.0 | Hugging Face |
| GameScaling-0.8B-S1 | ~0,8B | No disponible | Imagen + texto | Apache 2.0 | Hugging Face |
| GameScaling-9B-S1 | ~9B | No disponible | Imagen + texto | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | ~2B | No disponible | Imagen + texto | No disponible en la información | Hugging Face |

La comparación más directa es con las otras variantes de la familia GameScaling, que comparten arquitectura y datos de entrenamiento pero difieren en tamaño. Frente al modelo base Qwen3.5-2B, GameScaling-2B-S1 añade el entrenamiento continuado específico para agentes en videojuegos. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre datos de videojuegos, puede heredar sesgos presentes en dichos entornos y en el modelo base.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar acciones o interpretaciones incorrectas de la pantalla, especialmente ante situaciones no vistas durante el entrenamiento.
- Limitaciones de idioma: solo se declara soporte para inglés, lo que limita su uso con instrucciones en castellano u otros idiomas.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide evaluar su idoneidad para tareas que requieran memoria prolongada de la partida.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero debe verificarse que el modelo base Qwen3.5-2B no imponga restricciones adicionales.
- Caveat para producción: el modelo está diseñado para investigación en agentes encarnados; su uso en producción requeriría validación específica del dominio y del entorno de juego.
- No se documentan capacidades de tool calling, lo que limita su integración en pipelines agénticos que dependan de llamadas a funciones externas.

## Enlaces

- Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-2B-S1
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Daily Paper: https://huggingface.co/papers/2610.28698
- GitHub: https://github.com/THUSI-Lab/GameScaling
- Project Page: https://gamescaling.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 0.8B-S1: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1
- Variante 0.8B-S3: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Variante 2B-S3: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Variante 9B-S1: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Variante 9B-S3: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
