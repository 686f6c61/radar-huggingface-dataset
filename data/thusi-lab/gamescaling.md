# THUSI-Lab/GameScaling

## Resumen

GameScaling es una familia de modelos vision-lenguaje desarrollada por el equipo de I+D de miHoYo Honkai AI junto con investigadores de la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. El modelo se entrena mediante preentrenamiento continuado (continued pre-training) sobre la familia Qwen3.5 con el objetivo de convertirse en un agente encarnado (embodied agent) capaz de operar en entornos de videojuego mediante control de teclado y ratón.

La propuesta central es el escalado del entrenamiento en dominios de juego: en lugar de especializar un modelo en un único título, GameScaling se preentrena sobre datos de múltiples mundos virtuales diversos, lo que busca transferencia entre juegos y una mejor generalización como agente. Se publica en cuatro tamaños (0,8B, 2B, 9B y 27B) y en dos etapas de entrenamiento (S1 y S3), lo que permite estudiar empíricamente las leyes de escalado en este dominio.

El modelo es relevante porque aborda un problema poco explorado: cómo escalar agentes encarnados que perciben píxeles y emiten acciones de bajo nivel (pulsaciones de teclado y movimientos de ratón) en lugar de acciones simbólicas de alto nivel. La licencia Apache 2.0 y la compatibilidad con `transformers` y endpoints facilitan su evaluación y despliegue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basado en Qwen3.5, con preentrenamiento continuado para control de teclado y ratón |
| Parametros totales | Cuatro variantes: 0,8B, 2B, 9B y 27B (por variante) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 162,4 GB en total para todas las variantes) |

## Arquitectura y entrenamiento

GameScaling parte de los modelos Qwen3.5 (0,8B, 2B, 9B y 27B) y aplica un proceso de continued pre-training sobre datos de interacción en videojuegos. La modalidad de entrada es image-text-to-text: el modelo recibe observaciones visuales del juego junto con contexto textual y produce acciones de control de teclado y ratón. La arquitectura subyacente es la de Qwen3.5, un transformer multimodal, aunque la model card no detalla modificaciones estructurales específicas.

El entrenamiento se organiza en etapas (S1 y S3 publicadas como checkpoints separados), lo que sugiere un currículo progresivo de preentrenamiento continuado. La contribución metodológica principal es el uso de datos de múltiples mundos virtuales diversos para inducir transferencia entre juegos, en lugar de especialización en un único título. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Percepción visual de entornos de juego a partir de capturas de pantalla (pipeline image-text-to-text).
- Generación de acciones de bajo nivel: pulsaciones de teclado y movimientos de ratón para controlar al agente.
- Comportamiento de agente encarnado en entornos interactivos (embodied-agent).
- Transferencia entre múltiples videojuegos gracias al preentrenamiento continuado sobre mundos virtuales diversos.
- Comprensión de instrucciones en inglés combinadas con observaciones visuales.
- Checkpoints intermedios (S1, S3) para estudiar el efecto del escalado del entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso y razonamiento explícito (thinking mode): no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Investigación en agentes encarnados: el modelo sirve como base para estudiar leyes de escalado en control de videojuegos, comparando las cuatro variantes de tamaño y las etapas S1/S3 en entornos controlados.
- Automatización de pruebas de juego (playtesting): un agente basado en GameScaling puede jugar de forma autónoma para detectar bugs, bloqueos o comportamientos anómalos en builds de desarrollo, reduciendo horas de QA manual.
- Generación de datos sintéticos de gameplay: el agente puede producir trayectorias de interacción (pantalla → acción) que alimenten el entrenamiento de otros modelos de imitación o de refuerzo.
- Benchmarking de modelos vision-lenguaje en control de bajo nivel: al emitir eventos de teclado y ratón, permite evaluar la capacidad motora fina de modelos multimodales, una dimensión poco cubierta por benchmarks estándar.
- Prototipado de NPCs controlados por modelo: estudiar cómo un modelo de este tipo puede pilotar personajes no jugadores con comportamiento visualmente coherente en entornos 3D.
- Investigación en transferencia entre dominios: evaluar hasta qué punto el preentrenamiento en múltiples juegos mejora el rendimiento en un título no visto durante el entrenamiento.
- Educación e investigación académica: servir como referencia reproducible (Apache 2.0) para trabajos sobre agentes encarnados y multimodalidad aplicada a entornos interactivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; como referencia orientativa, un modelo de 0,8B en FP16 ocupa aproximadamente 1,6 GB de pesos, uno de 2B unos 4 GB, uno de 9B unos 18 GB y uno de 27B unos 54 GB, a lo que hay que sumar el codificador visual y el contexto.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, las variantes 0,8B y 2B son aptas para GPU de consumo; la de 9B requiere GPU de 24 GB o superior (RTX 4090, A100 40GB); la de 27B requiere A100/H100 de 80 GB o cuantización.
- Cabe en GPU de consumo: las variantes 0,8B y 2B sí; la de 9B en RTX 4090 con cuantización; la de 27B no de forma holgada.
- Opciones de despliegue: compatible con `transformers` y con endpoints compatibles según los tags; vLLM, llama.cpp, Ollama o TGI no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling (0,8B–27B) | 0,8B / 2B / 9B / 27B | no disponible | image-text-to-text + acciones teclado/ratón | Apache 2.0 | Hugging Face |
| Qwen3.5 (base) | 0,8B / 2B / 9B / 27B | no disponible | image-text-to-text | según variante | Hugging Face |
| Alternativas de agentes encarnados en juegos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con otros agentes encarnados de videojuegos no está disponible en la información proporcionada; el principal punto de referencia es la familia Qwen3.5 sobre la que se construye.

## Limitaciones y advertencias

- El modelo solo declara soporte de inglés; el rendimiento en otros idiomas no está garantizado.
- Es un modelo especializado en control de videojuegos: su utilidad fuera de entornos interactivos visuales es limitada y no debe asumirse como modelo de propósito general.
- No se han publicado benchmarks, por lo que el rendimiento real en tareas concretas no puede verificarse a priori.
- Riesgo de alucinación y de acciones erráticas en entornos no vistos durante el entrenamiento; la generalización entre juegos es una hipótesis del trabajo, no un hecho medido en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada; al entrenarse sobre datos de juego, puede heredar sesgos de los títulos utilizados.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datos de entrenamiento y de los modelos base Qwen3.5.
- El repositorio completo ocupa 162,4 GB, lo que exige planificación de almacenamiento y ancho de banda para su descarga.
- No se detallan requisitos de contexto ni límites de longitud de secuencia, lo que puede afectar a tareas que requieran memoria prolongada de la partida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Daily Paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io/
- Variantes: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1, https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3, https://huggingface.co/THUSI-Lab/GameScaling-2B-S1, https://huggingface.co/THUSI-Lab/GameScaling-2B-S3, https://huggingface.co/THUSI-Lab/GameScaling-9B-S1, https://huggingface.co/THUSI-Lab/GameScaling-9B-S3, https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
