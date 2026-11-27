# THUSI-Lab/GameScaling-27B-S1

## Resumen

GameScaling-27B-S1 es un modelo multimodal de tipo image-text-to-text desarrollado por THUSI-Lab en colaboración con el equipo de I+D de Honkai AI de miHoYo, la Universidad de Tsinghua, la Universidad de la Academia China de Ciencias, la Universidad de Hong Kong, la Universidad Nacional de Singapur y la Universidad de Pekín. Se trata de un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-27B, orientado especificamente a la operacion de agentes encarnados (embodied agents) en entornos de videojuego mediante entradas de teclado y raton.

El modelo resuelve el problema de dotar a un LLM multimodal de capacidades para interpretar observaciones visuales de un videojuego y traducirlas en acciones de control concretas (pulsaciones de teclado y movimientos de raton), dentro de una linea de investigacion denominada "Scaling in Games: Continued Pre-Training for Embodied Agents in Diverse Virtual Worlds". Forma parte de una familia de modelos con variantes de 0.8B, 2B, 9B y 27B de parametros, en versiones S1 y S3.

Con 27.356.728.560 parametros reales en safetensors y un repositorio de 54,7 GB, se posiciona como la variante de mayor tamano de la familia. Su relevancia actual radica en que aplica preentrenamiento continuado sobre un modelo Qwen3.5 para especializarlo en control de agentes en videojuegos, un dominio con creciente interes para la investigacion en agentes encarnados y automatizacion de tareas interactivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-27B; tag `qwen3_5` |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 54,7 GB |
| Modelo base | Qwen/Qwen3.5-27B |
| Relacion con el modelo base | finetune |
| Pipeline | image-text-to-text |
| Fecha de creacion | 2026-10-14 |
| Ultima actualizacion | 2026-11-27 |
| Descargas | 147 |
| Likes | 4 |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Qwen3.5-27B, un transformer multimodal capaz de procesar entradas de imagen y texto. Sobre esa base, THUSI-Lab aplica un proceso de preentrenamiento continuado (continued pre-training) orientado a agentes encarnados en mundos virtuales diversos. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible en los datos proporcionados.

La innovacion principal reside en el enfoque de "scaling in games": entrenar agentes que reciben observaciones visuales del videojuego y emiten acciones de teclado y raton, con el objetivo de generalizar entre distintos titulos y entornos virtuales. El modelo se distribuye con la etiqueta `endpoints_compatible`, lo que sugiere compatibilidad con los endpoints de inferencia de Hugging Face. No se especifican detalles sobre atencion lineal, decodificacion especulativa ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles (tag `conversational`).
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), lo que permite interpretar fotogramas o capturas de un videojuego.
- Control de agente encarnado mediante acciones de teclado y raton (tags `keyboard-mouse` y `embodied-agent`).
- Operacion como agente de videojuego (tag `game-agent`), orientado a la toma de decisiones dentro de entornos interactivos.
- Preentrenamiento continuado orientado a generalizacion en multiples mundos virtuales (tag `continued-pretraining`).
- Soporte de conversacion multi-turno segun la etiqueta `conversational`.
- Capacidades de tool calling, function calling, agentes multi-paso, vision avanzada, audio o modo thinking: no disponibles en la informacion proporcionada.
- Capacidades multilingues: unicamente se declara ingles; no se documentan otros idiomas.

## Casos de uso

- Automatizacion de pruebas de videojuegos: el modelo puede actuar como agente que interpreta la pantalla y emite entradas de teclado y raton para recorrer menus, completar tutoriales o detectar regresiones en builds, reduciendo el trabajo manual de QA.
- Investigacion en agentes encarnados: sirve como banco de pruebas para estudiar como un LLM multimodal de 27B traduce observaciones visuales en acciones de control en entornos virtuales diversos.
- Generacion de datos de interaccion: al operar dentro de juegos, puede producir trayectorias observacion-accion que alimenten posteriores entrenamientos o evaluaciones de otros agentes.
- Evaluacion de generalizacion entre titulos: al estar entrenado para "diverse virtual worlds", permite medir la transferencia de politicas de control entre distintos juegos con interfaces visuales diferentes.
- Asistencia a jugadores mediante agentes supervisados: integrado en un bucle de inferencia con captura de pantalla, puede sugerir o ejecutar secuencias de acciones en tareas repetitivas dentro de un entorno controlado.
- Base para ajuste fino en dominios especificos: al ser un finetune de Qwen3.5-27B con licencia Apache 2.0, puede reajustarse para un videojuego concreto o para otras tareas de control visual.
- Prototipado de interfaces de control por lenguaje natural: el modelo puede combinarse con capas de traduccion de instrucciones textuales a acciones de teclado y raton para construir asistentes de juego.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16/FP16): aproximadamente 54-55 GB solo para pesos, mas memoria para el procesador de vision, cache KV y overhead, por lo que se recomienda un minimo de 64-80 GB de VRAM.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU con varias RTX 4090/A6000.
- Cuantizacion: no se documentan tipos de cuantizacion oficiales; en caso de generarse versiones GGUF o AWQ de la comunidad, un modelo de 27B en 4 bits requeriria aproximadamente 14-16 GB de VRAM, lo que podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB).
- Cabe en GPU de consumo: en precision completa no; en cuantizaciones de 4-8 bits, potencialmente en RTX 4090, RTX 3090 o RTX 5090, siempre que se generen pesos cuantizados (no disponibles en el repositorio).
- Opciones de despliegue: transformers (libreria declarada), y por compatibilidad con el ecosistema Qwen, potencialmente vLLM, TGI o llama.cpp si se generan los formatos adecuados; no se confirma soporte explicito en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| GameScaling-27B-S1 | 27,36B | no disponible | image-text-to-text | Apache 2.0 | Agente encarnado en videojuegos |
| Qwen3.5-27B (base) | ~27B | no disponible | multimodal | no disponible | LLM multimodal generalista |
| GameScaling-9B-S1 | ~9B | no disponible | image-text-to-text | Apache 2.0 | Agente encarnado en videojuegos (variante menor) |
| GameScaling-2B-S1 | ~2B | no disponible | image-text-to-text | Apache 2.0 | Agente encarnado en videojuegos (variante menor) |

La comparacion mas directa es con el propio modelo base Qwen3.5-27B, del que GameScaling-27B-S1 hereda arquitectura y capacidades generales, y con las variantes menores de la misma familia (0.8B, 2B y 9B en versiones S1 y S3), que permiten trade-offs entre coste computacional y rendimiento en control de agentes. No se dispone de datos de benchmarks que permitan comparar el rendimiento numerico frente a estos modelos.

## Limitaciones y advertencias

- Idioma: el modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado ni documentado.
- Dominio restringido: esta especializado en agentes de videojuego y control por teclado y raton; su rendimiento en tareas generales puede diferir del modelo base Qwen3.5-27B.
- Sesgos: no se documentan sesgos conocidos, pero al derivar de un LLM generalista y entrenarse sobre datos de videojuegos, puede heredar sesgos del corpus original y de los titulos utilizados.
- Alucinacion: no se aportan datos sobre tasas de alucinacion; en tareas de control visual, una interpretacion erronea de la pantalla puede traducirse en acciones incorrectas.
- Contexto: no se especifica la longitud de contexto, lo que impide planificar tareas que requieran historiales largos de observaciones.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-27B y de los datos de entrenamiento de videojuegos utilizados.
- Madurez: con 147 descargas y 4 likes, es un modelo reciente y poco validado por la comunidad; no se han publicado benchmarks en la informacion disponible.
- Produccion: la ausencia de datos sobre cuantizacion, latencia y throughput dificulta estimar costes de despliegue; se recomienda evaluacion propia antes de usarlo en entornos productivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/THUSI-Lab/GameScaling-27B-S1
- Paper (arXiv): https://arxiv.org/abs/2610.28698
- Daily Paper en Hugging Face: https://huggingface.co/papers/2610.28698
- Repositorio GitHub: https://github.com/THUSI-Lab/GameScaling
- Pagina del proyecto: https://gamescaling.github.io
- Variante 0.8B-S1: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S1
- Variante 0.8B-S3: https://huggingface.co/THUSI-Lab/GameScaling-0.8B-S3
- Variante 2B-S1: https://huggingface.co/THUSI-Lab/GameScaling-2B-S1
- Variante 2B-S3: https://huggingface.co/THUSI-Lab/GameScaling-2B-S3
- Variante 9B-S1: https://huggingface.co/THUSI-Lab/GameScaling-9B-S1
- Variante 9B-S3: https://huggingface.co/THUSI-Lab/GameScaling-9B-S3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
