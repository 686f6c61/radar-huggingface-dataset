# THUSI-Lab/GameScaling-9B-S1

## Resumen

GameScaling-9B-S1 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de Honkai AI de miHoYo, la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-9B, orientado a la formación de agentes encarnados (embodied agents) capaces de operar en entornos de videojuego mediante entradas de teclado y ratón.

El modelo surge del trabajo "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds", que propone el preentrenamiento continuado como estrategia para dotar a modelos de lenguaje y visión de la capacidad de interactuar con mundos virtuales diversos. La variante S1 corresponde a una de las etapas de escalado del proyecto, que también publica versiones de 0,8B, 2B y 27B en etapas S1 y S3.

Con 9.409.813.744 parámetros totales (aproximadamente 9,4 mil millones) y un repositorio de 18,8 GB en formato safetensors, el modelo está pensado para investigación en agentes de juego y sistemas encarnados. Su licencia Apache 2.0 facilita su uso tanto académico como comercial, aunque su especialización lo aleja de los usos conversacionales generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de la familia Qwen3.5, y se somete a un proceso de preentrenamiento continuado (continued pre-training) sobre datos de interacción en videojuegos. La model card lo etiqueta explícitamente como `continued-pretraining`, `game-agent`, `embodied-agent` y `keyboard-mouse`, lo que indica que el entrenamiento incorpora trayectorias de acciones de teclado y ratón junto con observaciones visuales del entorno de juego. El pipeline declarado es `image-text-to-text`, de modo que el modelo procesa imágenes (capturas del juego) y texto para producir respuestas o acciones.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. El proyecto se enmarca en una línea de escalado ("Scaling in Games") que publica variantes de distinto tamaño (0,8B, 2B, 9B, 27B) y distintas etapas (S1, S3), lo que sugiere un estudio sistemático del efecto del escalado en la capacidad de los agentes encarnados. La innovación principal declarada es el uso de preentrenamiento continuado sobre mundos virtuales diversos para transferir capacidades de agente a entornos de juego.

## Capacidades

- Procesamiento conjunto de imagen y texto (image-text-to-text): interpreta capturas de pantalla de videojuegos junto con instrucciones textuales.
- Generación de acciones de agente encarnado mediante entradas de teclado y ratón, según las etiquetas `keyboard-mouse` y `game-agent`.
- Razonamiento multi-paso orientado a la interacción con entornos virtuales.
- Comprensión de escenas visuales de juego para la toma de decisiones.
- Capacidades conversacionales heredadas del modelo base Qwen3.5-9B (etiqueta `conversational`).
- Soporte multilingüe limitado al inglés según el campo `language: en`.
- No se dispone de información sobre soporte de tool calling, function calling ni modos de razonamiento explícito (thinking mode) en la documentación proporcionada.

## Casos de uso

- Investigación en agentes encarnados: el modelo sirve como base para experimentos académicos sobre cómo los modelos de lenguaje y visión aprenden a interactuar con entornos virtuales, aprovechando el preentrenamiento continuado sobre datos de juego.
- Automatización de pruebas de videojuegos (QA): un agente basado en este modelo puede ejecutar secuencias de teclado y ratón para recorrer niveles, detectar comportamientos anómalos o validar mecánicas de juego de forma repetible.
- Desarrollo de bots de juego para entornos controlados: gracias a su entrenamiento específico en acciones de teclado y ratón, puede integrarse en pipelines de investigación para generar políticas de comportamiento en juegos concretos.
- Generación de datos sintéticos de interacción: el modelo puede producir trayectorias de acciones y descripciones de escenas que alimenten el entrenamiento de otros agentes o modelos de visión.
- Estudio del escalado de capacidades: al existir variantes de 0,8B, 2B, 9B y 27B en etapas S1 y S3, el modelo permite comparar cómo escala el rendimiento de agentes encarnados con el tamaño y la etapa de entrenamiento.
- Prototipado de asistentes in-game: para investigación sobre asistentes que observan la pantalla y sugieren o ejecutan acciones al jugador, con la cautela de que el modelo solo declara soporte de inglés.
- Evaluación de transferencia entre mundos virtuales: el modelo puede emplearse para medir hasta qué punto las habilidades aprendidas en un conjunto de juegos se transfieren a entornos no vistos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9,4 mil millones de parámetros en precisión de 16 bits (bf16/fp16), se requieren aproximadamente 18,8 GB solo para los pesos, más memoria adicional para el procesador de visión, el contexto y las activaciones; en la práctica, se recomienda al menos 24 GB de VRAM en bf16.
- Cuantización: no se dispone de información sobre tipos de cuantización soportados ni de pesos GGUF publicados por el autor; sería necesario generarlos a partir de los safetensors.
- GPU recomendadas: para bf16 sin cuantizar, GPU de 24 GB o más (RTX 3090, RTX 4090, A100 40/80 GB, H100). Con cuantización a 8 bits podría caber en GPU de 16 GB, y a 4 bits en torno a 8-12 GB, aunque estos valores son estimaciones y no datos publicados.
- ¿Cabe en consumer GPU? Sí, previsiblemente en RTX 3090/4090 (24 GB) en bf16, y en GPU de 16 GB con cuantización; no se confirma compatibilidad con llama.cpp u Ollama al no haber pesos GGUF oficiales.
- Opciones de despliegue: transformers (librería declarada), compatible con endpoints (`endpoints_compatible`); vLLM y TGI son opciones plausibles para servir el modelo, aunque no se confirma soporte explícito en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-9B-S1 | 9,4B | no disponible | Agente encarnado en videojuegos (image-text-to-text) | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (base) | ~9B | no disponible | Modelo multimodal generalista | no disponible en la información | Hugging Face |
| GameScaling-27B-S1 | no disponible | no disponible | Agente encarnado, mayor escala | Apache 2.0 (según el proyecto) | Hugging Face |
| GameScaling-2B-S1 | no disponible | no disponible | Agente encarnado, menor escala | Apache 2.0 (según el proyecto) | Hugging Face |

La comparación más directa es con el propio modelo base Qwen3.5-9B, del que GameScaling-9B-S1 hereda la arquitectura y al que especializa mediante preentrenamiento continuado en dominios de juego. Las variantes 2B y 27B del mismo proyecto permiten evaluar el efecto del escalado. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para agentes de juego y entornos virtuales; su rendimiento en tareas generales de lenguaje puede degradarse respecto al modelo base Qwen3.5-9B.
- Idioma: solo declara soporte de inglés (`language: en`); no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Contexto: no se ha publicado la longitud de contexto soportada, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Alucinación: como todo modelo generativo, puede producir acciones o descripciones incorrectas; en un agente encarnado, esto puede traducirse en comportamientos erráticos o bloqueos en el juego.
- Sesgos: no se dispone de información sobre evaluación de sesgos; los datos de videojuegos pueden introducir sesgos específicos de los títulos incluidos en el entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-9B puede tener sus propias condiciones que conviene verificar antes de un despliegue en producción.
- Madurez: con 288 descargas y 6 likes en el momento de la consulta, es un modelo de investigación reciente (creado en octubre de 2026) sin un ecosistema amplio de herramientas o cuantizaciones verificadas.
- Producción: no se dispone de datos de latencia, throughput ni estabilidad en despliegues reales; se recomienda validación exhaustiva antes de usarlo en sistemas críticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Variante 0.8B-S1: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1
- Variante 0.8B-S3: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Variante 2B-S1: https://huggingface.co/THUSI-Lab/GameScaling-2B-S1
- Variante 2B-S3: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Variante 9B-S3: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
- Variante 27B-S1: https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
