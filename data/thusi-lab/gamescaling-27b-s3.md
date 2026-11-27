# THUSI-Lab/GameScaling-27B-S3

## Resumen

GameScaling-27B-S3 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de IA de Honkai de miHoYo, la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-27B, con 27.356.728.560 parámetros reales confirmados en los pesos safetensors, orientado a la actuación de agentes encarnados (embodied agents) en entornos de videojuego mediante control de teclado y ratón.

El modelo forma parte de la familia GameScaling, que incluye variantes de 0,8B, 2B, 9B y 27B en dos etapas de entrenamiento (S1 y S3). La variante S3 aquí descrita corresponde al escalado de mayor tamaño y a la etapa de preentrenamiento continuado más avanzada de la familia. El problema que aborda es la brecha entre los modelos de lenguaje generalistas y la toma de decisiones secuencial en mundos virtuales diversos: percepción visual de la pantalla, razonamiento sobre el estado del juego y emisión de acciones discretas de teclado y ratón.

Su relevancia actual radica en que aplica preentrenamiento continuado (continued pre-training) sobre un modelo frontera de 27B para especializarlo en control de agentes dentro de videojuegos, un dominio con escasez de datos de alta calidad y con requisitos de razonamiento temporal estricto. La licencia Apache 2.0 y el formato transformers/safetensors facilitan su adopción tanto en investigación como en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen3.5; tag `qwen3_5` |
| Parametros totales | 27.356.728.560 (27,36B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B, un transformer multimodal capaz de procesar entradas de imagen y texto, y se somete a un proceso de preentrenamiento continuado (continued pre-training) sobre datos de interacción en videojuegos. La pipeline declarada es image-text-to-text, lo que implica que el modelo recibe capturas o frames del juego junto con el estado textual y produce acciones de teclado y ratón. Los tags del repositorio confirman las áreas de especialización: `gamescaling`, `game-agent`, `embodied-agent`, `keyboard-mouse` y `continued-pretraining`.

El entrenamiento se organiza en etapas (S1 y S3 en la familia GameScaling), siendo S3 la etapa de mayor madurez de la variante de 27B. No se dispone en la información proporcionada del número exacto de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones de decodificación o mecanismos de atención específicos más allá de la herencia de la arquitectura Qwen3.5. El tamaño del repositorio es de 54,7 GB, coherente con pesos en precisión de 16 bits para 27,36B de parámetros.

## Capacidades

- Percepción visual de entornos de juego: procesa imágenes o frames como entrada junto con texto (pipeline image-text-to-text).
- Control de agente mediante teclado y ratón: genera acciones discretas de teclado y movimientos de ratón para interactuar con el juego.
- Razonamiento secuencial multi-paso orientado a objetivos dentro de mundos virtuales.
- Actuación como agente encarnado (embodied agent) en entornos simulados diversos.
- Conversación multi-turno (tag `conversational`) con mantenimiento de estado a lo largo de la interacción.
- Capacidades heredadas del modelo base Qwen3.5-27B en generación de texto y razonamiento general, si bien el ajuste se orienta al dominio de juego.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card (`language: en`).
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes autónomos en videojuegos: el modelo puede controlar un personaje mediante entradas de teclado y ratón a partir de la observación visual de la pantalla, adecuado para automatización de tareas repetitivas, pruebas de jugabilidad o bots de asistencia dentro del juego.
- Investigación en agentes encarnados: sirve como banco de pruebas para estudiar cómo el escalado de parámetros (de 0,8B a 27B dentro de la familia) afecta a la toma de decisiones en entornos virtuales, comparando variantes S1 y S3.
- Evaluación de modelos de visión-lenguaje-acción: permite medir la capacidad de un modelo de 27B para mapear percepciones visuales complejas a secuencias de acciones de bajo nivel, un problema relevante para robótica y simulación.
- Generación de datos sintéticos de interacción: las trayectorias generadas por el modelo pueden utilizarse para aumentar datasets de entrenamiento de agentes más pequeños de la propia familia GameScaling.
- Pruebas de calidad (QA) automatizadas de videojuegos: el agente puede recorrer menús, ejecutar flujos de inicio de sesión o verificar la respuesta del juego ante entradas concretas, reduciendo el esfuerzo manual en pipelines de QA.
- Investigación académica en preentrenamiento continuado: al estar liberado con licencia Apache 2.0 y pesos safetensors, permite reproducir y extender experimentos sobre especialización de modelos frontera en dominios con datos escasos.
- Prototipado de asistentes de juego: integración en herramientas que observan la pantalla del jugador y sugieren o ejecutan acciones, aprovechando la naturaleza conversacional y multimodal del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 54,7 GB solo para pesos, más memoria para caché KV y activaciones; se recomienda un mínimo de 64-80 GB de VRAM.
- GPU recomendadas para FP16: NVIDIA A100 80GB, H100 80GB, o múltiples GPU de 24-48 GB con tensor parallelism.
- Cuantización: no se han publicado versiones GGUF, AWQ ni GPTQ en la información disponible; para caber en GPU de consumo sería necesario cuantizar el modelo (por ejemplo, a 8 o 4 bits), lo que reduciría los requisitos a rangos de 14-28 GB, aunque dichas cuantizaciones no están verificadas por el autor.
- GPU de consumo: en FP16 no cabe en ninguna GPU consumer actual; en cuantización de 4 bits podría plantearse en RTX 4090 (24 GB) o RTX 5090, sujeto a la disponibilidad de cuantizaciones comunitarias no confirmadas.
- Opciones de despliegue: transformers (librería declarada), con compatibilidad de endpoints (`endpoints_compatible`); vLLM, TGI, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GameScaling-27B-S3 | 27,36B | no disponible | image-text-to-text | Apache 2.0 | Hugging Face (THUSI-Lab) |
| GameScaling-9B-S3 | no disponible | no disponible | image-text-to-text | Apache 2.0 | Hugging Face (THUSI-Lab) |
| GameScaling-2B-S3 | no disponible | no disponible | image-text-to-text | Apache 2.0 | Hugging Face (THUSI-Lab) |
| Qwen/Qwen3.5-27B (base) | 27B (aprox.) | no disponible | image-text-to-text | no disponible | Hugging Face (Qwen) |

La comparación más directa es con las variantes menores de la propia familia GameScaling (0,8B, 2B y 9B), que permiten estudiar el efecto del escalado en la misma tarea y con el mismo pipeline de entrenamiento. Frente al modelo base Qwen3.5-27B, GameScaling-27B-S3 sacrifica generalidad en favor de la especialización en agentes de juego. No se dispone de datos de rendimiento comparado que permitan establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al entrenarse sobre datos de videojuegos, puede heredar sesgos de las comunidades y títulos representados en el dataset.
- Riesgo de alucinación: como modelo generativo, puede producir acciones o razonamientos inconsistentes con el estado real del juego, especialmente fuera de los entornos vistos durante el entrenamiento.
- Limitación de idioma: la model card declara únicamente inglés (`language: en`); el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto no especificada: no se puede planificar su uso en tareas que requieran ventanas largas sin verificación empírica.
- Especialización estrecha: el ajuste fino sobre Qwen3.5-27B puede degradar capacidades generales de conversación o código respecto al modelo base; no se han publicado evaluaciones que lo cuantifiquen.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-27B y de los datos de juego utilizados en el preentrenamiento continuado.
- Requisitos de hardware elevados: 54,7 GB de pesos en safetensors exigen infraestructura de GPU de gama alta para inferencia en precisión completa.
- Madurez: el repositorio tiene 349 descargas y 15 likes en el momento de la consulta, con una única actualización reciente; el ecosistema de cuantizaciones y herramientas de despliegue es todavía incipiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-27B-S3
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Página del proyecto: https://gamescaling.github.io
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Variante 0.8B-S1: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1
- Variante 0.8B-S3: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Variante 2B-S1: https://huggingface.co/THUSI-Lab/GameScaling-2B-S1
- Variante 2B-S3: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Variante 9B-S1: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Variante 9B-S3: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
- Variante 27B-S1: https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
