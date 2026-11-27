# THUSI-Lab/GameScaling-0.8B-S3

## Resumen

GameScaling-0.8B-S3 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de IA de miHoYo (Honkai), la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-0.8B, orientado a la actuación de agentes encarnados (embodied agents) en entornos de videojuego mediante control de teclado y ratón.

El modelo forma parte de la familia GameScaling, un trabajo de preentrenamiento continuado (continued pre-training) cuyo objetivo es dotar a modelos de lenguaje pequeños de capacidades para interpretar observaciones visuales de videojuegos y emitir acciones de control. La variante S3 corresponde a una etapa concreta del pipeline de entrenamiento de la familia, y esta versión de 0,8B es la más pequeña de las publicadas (junto con variantes de 2B, 9B y 27B, cada una en etapas S1 y S3).

Con 1.107.265.600 parámetros reales en safetensors y un repositorio de 2,2 GB, el modelo es relevante por su tamaño reducido, que lo hace desplegable en hardware modesto, y por su enfoque específico en agentes de juego, un nicho donde la mayoría de los modelos generalistas no ofrecen control directo de teclado y ratón. Su licencia Apache 2.0 facilita su uso comercial y su experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Qwen3.5-0.8B |
| Parametros totales | 1.107.265.600 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-0.8B mediante un proceso de ajuste fino (base_model_relation: finetune) dentro del marco GameScaling, que aplica preentrenamiento continuado para agentes encarnados en diversos mundos virtuales. La arquitectura subyacente es un transformer multimodal de tipo image-text-to-text que procesa observaciones visuales del juego y genera acciones de control de teclado y ratón. La model card no detalla la composición exacta del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal del trabajo es el enfoque de "scaling in games": el uso de preentrenamiento continuado sobre datos de múltiples videojuegos para que modelos pequeños adquieran capacidades de agente encarnado. La variante S3 representa una etapa del pipeline de entrenamiento de la familia GameScaling, que incluye modelos de 0,8B, 2B, 9B y 27B parámetros en etapas S1 y S3. No se dispone de información detallada sobre técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de entradas de imagen y texto (pipeline image-text-to-text).
- Actuación como agente encarnado en videojuegos: interpretación de observaciones visuales y emisión de acciones de teclado y ratón.
- Control de teclado y ratón (tag keyboard-mouse), orientado a la interacción directa con entornos de juego.
- Capacidades de agente de juego (game-agent) y agente encarnado (embodied-agent).
- Soporte de conversación multi-turno (tag conversational).
- No se ha documentado soporte explícito de tool calling, function calling ni modo de razonamiento (thinking mode) en la información disponible.

## Casos de uso

- Agente autónomo en videojuegos: el modelo puede recibir capturas de pantalla del juego y emitir acciones de teclado y ratón para completar tareas, gracias a su entrenamiento específico en control de agentes encarnados en entornos virtuales.
- Investigación en agentes encarnados: sirve como modelo de referencia de bajo coste computacional para experimentar con políticas de control basadas en visión y lenguaje en distintos mundos virtuales.
- Pruebas automatizadas de jugabilidad (QA): puede utilizarse para generar interacciones automatizadas con builds de juego y detectar comportamientos anómalos o bloqueos.
- Prototipado de asistentes de juego: integrado en un pipeline multimodal, puede ofrecer guía paso a paso al jugador interpretando la pantalla y sugiriendo acciones.
- Benchmarking de modelos pequeños multimodales: su tamaño de 0,8B y licencia Apache 2.0 lo hacen útil para comparar el rendimiento de agentes encarnados en hardware limitado.
- Educación e investigación académica: adecuado para estudiar el efecto del preentrenamiento continuado en dominios específicos (videojuegos) sobre modelos base pequeños.
- Despliegue en entornos con recursos limitados: al caber en GPUs de consumo, permite experimentar con agentes de juego sin infraestructura de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,1B parámetros, en precisión FP16 requiere aproximadamente 2,2 GB solo para pesos, más overhead de activaciones y del codificador visual; en cuantización de 8 bits rondaría 1,1-1,5 GB y en 4 bits aproximadamente 0,6-1 GB (estimaciones orientativas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs consumer modernas con 6 GB o más de VRAM.
- Opciones de despliegue: compatible con transformers (librería declarada); al ser un modelo multimodal con pipeline image-text-to-text, vLLM y TGI pueden requerir soporte específico para el codificador visual; llama.cpp/Ollama dependerían de la disponibilidad de conversión GGUF, no confirmada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-0.8B-S3 | 1,1B | No disponible | Imagen + texto | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | No disponible | Texto (base) | No disponible | Hugging Face |
| GameScaling-2B-S3 | ~2B | No disponible | Imagen + texto | Apache 2.0 | Hugging Face |
| GameScaling-9B-S3 | ~9B | No disponible | Imagen + texto | Apache 2.0 | Hugging Face |

La comparativa más directa es con el propio modelo base Qwen3.5-0.8B y con las variantes mayores de la misma familia GameScaling (2B, 9B, 27B), que ofrecen mayor capacidad a costa de más recursos. No se dispone de datos de rendimiento comparativo entre ellas en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo declara soporte para inglés; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Es un modelo especializado en agentes de juego; su rendimiento en tareas generales de texto o razonamiento puede ser inferior al de modelos generalistas del mismo tamaño.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado en la interpretación de observaciones visuales de juegos no vistos durante el entrenamiento.
- No se han documentado sesgos específicos, pero al derivar de Qwen3.5-0.8B puede heredar los sesgos del modelo base y de los datos de videojuegos utilizados.
- La longitud de contexto no está documentada, lo que dificulta planificar tareas que requieran historiales largos de observaciones.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base Qwen3.5-0.8B puede tener sus propias condiciones que conviene verificar antes de un despliegue en producción.
- No se ha confirmado soporte de tool calling ni de modo de razonamiento, por lo que no debe asumirse en integraciones de agentes generales.
- El pipeline image-text-to-text requiere gestión del codificador visual; el despliegue en servidores de inferencia de texto puro puede no ser directo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variantes de la familia: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1, https://huggingface.co/THUSI-Lab/GameScaling-2B-S1, https://huggingface.co/THUSI-Lab/GameScaling-2B-S3, https://huggingface.co/THUSI-Lab/GameScaling-9B-S1, https://huggingface.co/THUSI-Lab/GameScaling-9B-S3, https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
