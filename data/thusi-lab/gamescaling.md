# THUSI-Lab/GameScaling

## Resumen

GameScaling es una familia de modelos de lenguaje y visión-lenguaje desarrollada por THUSI-Lab en colaboración con el equipo de I+D de IA de miHoYo (Honkai), la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. El modelo se presenta como una iniciativa de preentrenamiento continuado orientada a construir agentes encarnados (embodied agents) capaces de operar en entornos de videojuegos diversos mediante interacciones de teclado y ratón. Se construye como un fine-tuning sobre la familia Qwen3.5 en cuatro escalas: 0,8B, 2B, 9B y 27B parámetros.

La propuesta central es estudiar cómo escala el rendimiento de agentes de juego al aumentar el tamaño del modelo y la cantidad de datos de preentrenamiento continuado sobre trayectorias de juego reales. Para ello se publican variantes etiquetadas como S1 y S3, que corresponden a distintos niveles de escalado de datos de entrenamiento. El modelo acepta entradas de imagen y texto (pipeline image-text-to-text) y produce acciones discretas de teclado y ratón, lo que lo sitúa en la categoría de modelos de política para agentes encarnados.

Es relevante ahora porque aborda uno de los cuellos de botella de los agentes basados en modelos de lenguaje: la transferencia de conocimiento general a control motor de bajo nivel en entornos visuales dinámicos. Al liberar los pesos bajo licencia Apache 2.0 y en múltiples tamaños, permite a investigadores reproducir y extender el estudio de escalado sin depender de infraestructura propietaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5; no se detalla la variante interna |
| Parametros totales | Cuatro escalas: 0,8B, 2B, 9B y 27B (por variante) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers; repo de 162,4 GB) |

## Arquitectura y entrenamiento

GameScaling parte de los modelos Qwen3.5 (0,8B, 2B, 9B y 27B) y aplica un proceso de preentrenamiento continuado (continued pre-training) sobre datos de interacción en videojuegos. La arquitectura es, por tanto, la de un transformer multimodal de la familia Qwen3.5, con capacidad de procesar imágenes y texto y de emitir acciones de teclado y ratón. No se especifica en la información disponible si emplea mezcla de expertos, atención lineal u otras innovaciones internas de la familia base.

El entrenamiento se organiza en niveles de escalado (S1 y S3) que corresponden a distintas cantidades de datos de preentrenamiento continuado, lo que permite estudiar empíricamente la relación entre volumen de datos, tamaño de parámetros y rendimiento como agente. No se detalla el número exacto de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. La model card menciona dos referencias arXiv (2610.28698 y 2611.30771) donde presumiblemente se describe la metodología completa.

## Capacidades

- Percepción visual de entornos de juego a partir de capturas de pantalla (pipeline image-text-to-text).
- Generación de acciones discretas de teclado y ratón para controlar personajes o interfaces.
- Razonamiento multimodal combinando observaciones visuales y contexto textual.
- Comportamiento como agente encarnado en entornos interactivos (game-agent, embodied-agent).
- Capacidad de operar en distintos videojuegos gracias al preentrenamiento continuado sobre mundos virtuales diversos.
- Soporte de conversación multimodal multi-turno (implícito en el pipeline image-text-to-text).
- No se documenta soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking mode).
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación en agentes encarnados: utilizar las variantes S1 y S3 de cada escala para reproducir los experimentos de escalado del paper y analizar la relación entre parámetros, datos y rendimiento en tareas de juego.
- Automatización de pruebas de videojuegos: el modelo puede generar secuencias de teclado y ratón para recorrer menús, validar flujos de UI o detectar regresiones en builds, aprovechando su percepción visual directa de la pantalla.
- Generación de datos sintéticos de gameplay: ejecutar el agente en entornos controlados para producir trayectorias etiquetadas que alimenten otros modelos de imitación o de refuerzo.
- Benchmarking de modelos multimodal en control motor: comparar el rendimiento de las cuatro escalas (0,8B a 27B) sobre el mismo conjunto de tareas para estudiar leyes de escalado en agentes.
- Asistencia a jugadores en tareas repetitivas: integrado en un bucle de captura de pantalla y emisión de eventos, puede automatizar rutinas de farming o navegación en entornos donde esté permitido.
- Educación e investigación en IA multimodal: servir como caso de estudio reproducible de preentrenamiento continuado sobre Qwen3.5 con licencia permisiva, adecuado para cursos y trabajos académicos.
- Desarrollo de entornos de evaluación para agentes: usar el modelo como agente de referencia en simuladores o entornos tipo Gym para medir la dificultad de nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, sin cuantizar): 0,8B en torno a 2 GB; 2B en torno a 5 GB; 9B en torno a 20 GB; 27B en torno a 56 GB. Estas cifras son estimaciones por tamaño de parámetros y no proceden de la model card.
- GPU recomendadas: RTX 4090 (24 GB) para las variantes 0,8B, 2B y 9B; A100 80 GB o H100 para la variante 27B sin cuantizar.
- Cabe en GPU de consumo: las variantes 0,8B y 2B con holgura en cualquier GPU de 8 GB o más; la 9B en una RTX 4090 o RTX 3090; la 27B requiere cuantización para caber en 24 GB.
- Opciones de despliegue: transformers (librería declarada); vLLM, TGI, llama.cpp u Ollama son compatibles en principio con pesos safetensors de Qwen3.5, aunque no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| GameScaling (THUSI-Lab) | 0,8B / 2B / 9B / 27B | no disponible | Apache 2.0 | Agente encarnado en videojuegos, multimodal |
| Qwen3.5 (Qwen) | 0,8B / 2B / 9B / 27B | no disponible | Apache 2.0 (segun familia base) | LLM/VLM generalista |
| Alternativas de agentes de juego | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de agentes de juego no está disponible en la información proporcionada. El competidor natural es la familia Qwen3.5 original, de la que GameScaling hereda arquitectura y licencia pero especializa en control de videojuegos.

## Limitaciones y advertencias

- El modelo está entrenado y evaluado únicamente en inglés; su uso en otros idiomas no está soportado oficialmente.
- Al ser un agente de control de videojuegos, su uso fuera de entornos de juego o simuladores no está validado y probablemente degrade.
- Riesgo de alucinación en la generación de acciones: puede emitir secuencias de teclado y ratón incoherentes ante estados visuales no vistos durante el entrenamiento.
- Sesgos potenciales derivados de los videojuegos utilizados en el preentrenamiento continuado: el modelo puede sobreajustarse a los géneros, estilos visuales y mecánicas presentes en el corpus.
- La licencia Apache 2.0 permite uso comercial, pero el uso del modelo para automatizar juegos puede infringir los términos de servicio de las plataformas correspondientes; la responsabilidad recae en el usuario.
- No se documentan límites de contexto ni comportamiento en secuencias largas, lo que dificulta planificar despliegues con historiales extensos.
- El tamaño del repositorio (162,4 GB) sugiere que incluye múltiples variantes; conviene descargar solo la escala necesaria.

## Enlaces

- Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Paper en HF Papers: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io/
- Variante 0.8B-S1: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1
- Variante 0.8B-S3: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Variante 2B-S1: https://huggingface.co/THUSI-Lab/GameScaling-2B-S1
- Variante 2B-S3: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Variante 9B-S1: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Variante 9B-S3: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
- Variante 27B-S1: https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
