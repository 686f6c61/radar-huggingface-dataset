# zhiyuanhucs/genshin-llava019-qwen3.5-9b-128k

## Resumen

El modelo `zhiyuanhucs/genshin-llava019-qwen3.5-9b-128k` es un ajuste fino multimodal (image-text-to-text) construido sobre `Qwen/Qwen3.5-9B` mediante aprendizaje supervisado (SFT) por clonación de comportamiento (behavior cloning) de parámetros completos. Lo desarrolla el usuario `zhiyuanhucs` y se publica como una instantánea intermedia del entrenamiento, concretamente el `checkpoint-1500` de una ejecución denominada `genshin3_llava019_qwen35_128k_4n_20260902T181636Z`. El modelo combina datos de dos fuentes: pases sobre un corpus tipo «Genshin» (3,0 pases) y el conjunto LLaVA 0.19, lo que apunta a un modelo orientado a interacción con interfaces de videojuego y comprensión de imágenes.

El problema que aborda es el de un agente multimodal capaz de razonar y emitir acciones estructuradas: introduce tokens especiales propios para delimitar acciones y pensamientos (`<|action_start|>`, `<|action_end|>`, `<|action_sep|>`, `<|thought_start|>`, `<|thought_end|>`), lo que sugiere un bucle de razonamiento explícito seguido de ejecución de acciones. Su relevancia radica en la combinación de ventana de contexto larga (128K, coherente con el empaquetado de secuencias a 128K durante el entrenamiento) y modalidad imagen-texto.

En cuanto a escala, cuenta con 9.653.104.368 parámetros (aproximadamente 9,65B) según los pesos safetensors publicados, con un repositorio de 96,6 GB (probablemente por acumulación de instantáneas de checkpoint). La licencia y los idiomas soportados no están declarados en la información disponible, lo que limita su evaluación para uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen/Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.653.104.368 (aprox. 9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens (128K) indicado en el nombre del modelo y en el empaquetado de secuencias a 128K del entrenamiento |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |
| Modelo base | Qwen/Qwen3.5-9B |
| Tarea (pipeline) | image-text-to-text |
| Tamano del repositorio | 96,6 GB |
| Checkpoint publicado | checkpoint-1500 (paso empaquetado 1500 de un tope de planificador de 34604) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B`, del que hereda la arquitectura base (no se detallan en la información disponible las capas internas, el tipo de atención ni el codificador visual). Se trata de un ajuste fino de parámetros completos (full-parameter) mediante SFT por clonación de comportamiento, no de un entrenamiento desde cero ni de un proceso de RLHF o DPO, que no se mencionan en la model card.

Los datos de entrenamiento combinan pases sobre un corpus denominado «Genshin» (3,0 pases) y el conjunto LLaVA 0.19 (0,19 pases). La model card indica aproximadamente 1,7857 pases de juego completados en esta instantánea, con unos 840 pasos empaquetados por pase a GBS=128 y 128K de secuencia. La configuración de entrenamiento fue TP=4 (tensor paralelism de 4), PP=1 (pipeline parallelism de 1), 4 nodos, GBS=128 (global batch size) y MTP=1. La innovación técnica más destacable es la incorporación de tokens especiales de control para estructurar el razonamiento y las acciones del agente, que separan explícitamente pensamiento y ejecución.

## Capacidades

- Generación de texto e interacción conversacional (etiqueta `conversational`).
- Comprensión de imagen y texto combinados (pipeline `image-text-to-text`).
- Emisión de acciones estructuradas mediante los tokens especiales `<|action_start|>`, `<|action_end|>` y `<|action_sep|>`.
- Razonamiento explícito delimitado por los tokens `<|thought_start|>` y `<|thought_end|>`.
- Procesamiento de contextos muy largos (hasta 128K tokens), coherente con el empaquetado de secuencias del entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).
- Modo «thinking»: implícito en los tokens de pensamiento, aunque no se documenta su comportamiento exacto.
- Visión: sí (multimodal imagen-texto), sin detalle del codificador visual ni de resolución soportada.

## Casos de uso

- Agentes que operan interfaces de videojuego: el modelo está entrenado con datos de tipo «Genshin» y emite acciones estructuradas mediante tokens dedicados, por lo que encaja en bucles de decisión acción-observación en entornos gráficos.
- Razonamiento multimodal por pasos: la separación explícita entre pensamiento y acción permite auditar la cadena de decisión antes de ejecutar una acción, útil en sistemas de agentes que requieren trazabilidad.
- Asistentes sobre capturas de pantalla: al combinar comprensión de imagen y texto con 128K de contexto, puede procesar secuencias largas de capturas e instrucciones acumuladas en una misma ventana.
- Análisis de partidas o sesiones largas: la ventana de 128K permite mantener el historial completo de una sesión de juego sin truncamiento agresivo.
- Prototipos de investigación en clonación de comportamiento: sirve como referencia para estudiar SFT de parámetros completos sobre un modelo multimodal de 9,65B con empaquetado de secuencias a 128K.
- Evaluación de instrucciones de control estructurado: los tokens de acción y pensamiento lo hacen adecuado para experimentar con formatos de salida que mezclan lenguaje natural y comandos ejecutables.
- Base para ajustes posteriores: al ser un checkpoint intermedio de una ejecución mayor (paso 1500 de un tope de 34604), puede emplearse como punto de partida de nuevos ajustes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin tener en cuenta caché KV ni codificador visual):
  - FP16/BF16: aproximadamente 19,3 GB.
  - INT8: aproximadamente 9,7 GB.
  - INT4: aproximadamente 5 GB.
- Con contexto de 128K la caché KV crece de forma notable; para aprovechar la ventana completa se recomienda hardware con memoria muy superior a la estimación base (varias decenas de GB adicionales según lote y longitud real).
- GPU recomendadas: no especificadas por el autor. Para FP16 completo, GPU de 24 GB o más (por ejemplo, RTX 4090, A100 40/80 GB, H100). Para INT4, tarjetas de 8-12 GB podrían ser suficientes si la implementación lo permite, aunque el codificador visual y la caché KV pueden elevarlo por encima.
- ¿Cabe en GPU de consumo? Probablemente en formato cuantizado de 4 bits en GPU de 8-16 GB; no confirmado por el autor.
- Opciones de despliegue: transformers (librería declarada) con safetensors. vLLM, llama.cpp, Ollama, TGI u otros: no disponibles, ya que no se publican variantes GGUF ni configuraciones de servidor.
- Latencia y throughput estimados: no disponibles.
- Nota de almacenamiento: el repositorio ocupa 96,6 GB, por lo que conviene descargar selectivamente la instantánea concreta si solo se busca el `checkpoint-1500`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (licencia, idiomas) que permitan una comparación rigurosa. La siguiente tabla recoge únicamente datos verificables de la información proporcionada frente a la referencia base.

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| genshin-llava019-qwen3.5-9b-128k | 9,65B | 128K | imagen-texto | no disponible | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas multimodales de ~7-9B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial está permitido; tratar como uso restringido hasta confirmación del autor.
- Idiomas soportados no declarados: no se puede garantizar un rendimiento multilingüe ni siquiera en castellano.
- Es un checkpoint intermedio (paso 1500 de un tope de planificador de 34604), por lo que no representa el estado final del entrenamiento y su calidad puede ser inferior a la de una versión completada.
- Entrenado como clonación de comportamiento sobre datos de juego y LLaVA 0.19: puede reproducir sesgos y patrones de esos corpus, y no se documentan evaluaciones de sesgo ni de seguridad.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos publicados de mitigación ni de tasas de error.
- Posible riesgo de propiedad intelectual derivado del uso de material relacionado con un videojuego comercial en el entrenamiento; conviene revisar las implicaciones legales antes de cualquier despliegue.
- Sin benchmarks publicados: no se puede verificar su rendimiento frente a alternativas.
- Sin variantes cuantizadas oficiales: la adopción en producción requiere convertir y validar los pesos uno mismo.
- El tamaño del repositorio (96,6 GB) complica la gestión de versiones y el almacenamiento en pipelines de despliegue.
- El aprovechamiento real de la ventana de 128K exige gran cantidad de memoria; el contexto efectivo puede degradarse mucho antes de ese límite.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhiyuanhucs/genshin-llava019-qwen3.5-9b-128k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
