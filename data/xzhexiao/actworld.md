# xzhexiao/ActWorld

## Resumen

ActWorld es un modelo de mundo interactivo (world model) orientado a la generación de vídeo que combina navegación por cámara y manipulación de objetos dentro de un mismo rollout. Lo desarrolla Zhexiao Xiong y colaboradores (Washington University in St. Louis, entre otras instituciones) y se presenta en NeurIPS 2026 con el artículo «ActWorld: From Explorable to Interactive World Model via Action-Aware Memory» (arXiv:2606.17730). El modelo parte de Helios-Base, un transformer de difusión de vídeo de 14 000 millones de parámetros derivado de Wan2.1-14B, sobre el que se añaden adaptadores LoRA y módulos nuevos entrenados desde cero.

El problema que aborda es la limitación de los generadores de vídeo navegables previos: producen mundos visualmente explorables pero no accionables, es decir, el usuario puede moverse por la escena pero no interactuar con los objetos. ActWorld extiende ese paradigma a la interacción de objetos a mitad de rollout (coger, abrir, verter, colocar) manteniendo el control de punto de vista por teclado y ratón, todo dentro de un esquema chunk-autoregresivo que permite rollouts largos de hasta 330 fotogramas (unos 13,75 segundos a 24 fps) a 384x640 píxeles.

El repositorio publicado contiene únicamente el modelo base de la etapa 1, el mismo que generó los resultados de I-Bench del artículo, con muestreo de 50 pasos y CFG. No incluye la versión destilada de pocos pasos. Es relevante ahora porque libera, bajo licencia Apache-2.0, la arquitectura completa descrita en el paper (FiLM de rayos Plücker, rama texto-cámara, EAFR, ACHA y banco de memoria persistente de eventos y objetos), lo que permite reproducir y afinar el modelo para investigación en agentes y simulación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para vídeo (DiT) basado en Helios / Wan2.1-14B, con generación chunk-autoregresiva, acondicionamiento de cámara por rayos Plücker (FiLM), rama texto-cámara y banco de memoria de eventos/objetos |
| Parámetros totales | 14 000 millones en el transformer base, más LoRA de rango 128 (2,50 GB en fp32) y módulos nuevos (1,30 GB en fp32) |
| Parámetros activos | No aplica (no es un modelo MoE; todos los parámetros participan en cada paso) |
| Longitud de contexto | No disponible en tokens; ventana de generación de 330 fotogramas por rollout (~13,75 s a 24 fps) |
| Tipos de cuantización | No disponible; solo se publican pesos fp32 (LoRA y módulos extra) y el transformer fusionado en safetensors. Sin versiones GGUF, AWQ ni FP8 |
| Idiomas soportados | No disponible (el texto se procesa con el codificador UMT5 de Helios-Base; las 81 plantillas de acción son comandos de teclado/ratón) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`lora/pytorch_lora_weights.safetensors`, `lora/pytorch_extra_weights.safetensors`, `merged/`); `.pt` para la caché de embeddings de acciones |

## Arquitectura y entrenamiento

ActWorld se construye sobre Helios-Base, un transformer de difusión de vídeo de 14B parámetros (linaje Wan2.1) que genera vídeo de forma chunk-autoregresiva: en lugar de sintetizar la secuencia completa de una vez, produce bloques sucesivos condicionados por los anteriores, lo que permite rollouts arbitrariamente largos con un coste de atención acotado. Sobre esa base se incorporan mecanismos específicos de interacción. El control de cámara se implementa mediante un FiLM de rayos Plücker combinado con una rama texto-cámara que traduce los comandos de teclado y ratón a embeddings; esos 81 comandos están precalculados en `action_embeds_cache.pt` con el codificador de texto de Helios-Base. La memoria de acción se reparte entre EAFR (un scorer de recuperación de fotogramas), ACHA, un amplificador de historial por cabeza de atención y un banco de memoria persistente de eventos y objetos que conserva el estado de la escena a lo largo del rollout. Además, el modelo emplea subtítulos por chunk para mantener la coherencia semántica entre bloques.

El repositorio no documenta el volumen ni la composición del dataset de entrenamiento, ni si hubo etapas de RLHF o DPO; esa información solo puede consultarse en el artículo. Lo que sí se explicita es la receta de inferencia del checkpoint liberado: 50 pasos de muestreo con CFG y escala de guía 5,0, con todas las componentes del paper activas. Una advertencia importante es que este checkpoint debe ejecutarse con el banco de memoria persistente desactivado (sin `--event_memory_enabled` ni `--object_memory_enabled`): los pesos del banco se incluyen solo para que la arquitectura coincida con la descrita, pero no están entrenados en esta etapa.

## Capacidades

- Generación de vídeo condicionada por imagen (image-to-video) con primer fotograma de referencia y prompt textual.
- Rollouts largos y coherentes de hasta 330 fotogramas a 24 fps y resolución 384x640.
- Control de punto de vista en tiempo de generación mediante teclado y ratón (ramas de cámara con rayos Plücker y texto-cámara).
- Interacción con objetos a mitad de rollout: coger, abrir, verter, colocar y acciones análogas.
- Memoria de escena a través de EAFR, ACHA, amplificador de historial y banco de eventos/objetos (este último no activo en el checkpoint publicado).
- Acondicionamiento por subtítulos por chunk, lo que permite describir la evolución de la escena bloque a bloque.
- Simulación de dinámica de entorno para agentes: el modelo predice consecuencias visuales de acciones.
- No soporta tool calling ni function calling; no es un modelo de lenguaje y no expone API de herramientas.
- No dispone de capacidades de audio, visión general (captioning, VQA) ni modo «thinking».
- Capacidades multilingües: no documentadas.

## Casos de uso

- **Entrenamiento de agentes encarnados (embodied AI)**: ActWorld puede actuar como simulador neuronal en el que una política aprende a manipular objetos (coger, abrir, verter) sin necesidad de un motor físico explícito, generando observaciones visuales realistas de las consecuencias de cada acción.
- **Robótica de manipulación**: dado un primer fotograma de la escena y una secuencia de comandos, el modelo predice el resultado visual de la interacción, lo que sirve para planificar y validar trayectorias antes de ejecutarlas en el robot real.
- **Previsualización de experiencias interactivas**: prototipado rápido de recorridos navegables en videojuegos, entornos de realidad virtual o instalaciones, con control de cámara y modificación de objetos durante la propia generación.
- **Previsualización cinematográfica y de arquitectura**: generación de travellings con control de cámara (330 fotogramas, ~13,75 s) a partir de una imagen fija, útil para storyboards animados o recorridos de espacios diseñados.
- **Generación de datos sintéticos para percepción**: producción de secuencias de vídeo con acciones controladas y anotadas implícitamente (comando aplicado, primer fotograma conocido) para aumentar datasets de segmentación, seguimiento o detección.
- **Investigación en world models**: el checkpoint es la referencia exacta de los resultados de I-Bench del artículo, por lo que sirve como línea base reproducible para comparar nuevas propuestas de memoria de acción o control de cámara.
- **Evaluación de políticas de interacción**: permite ejecutar rollouts contrafactuales (misma escena, distintas acciones) para medir la sensibilidad de un agente a sus propias decisiones.
- **Fine-tuning específico de dominio**: el formato `merged/` está pensado para inicializar etapas posteriores de entrenamiento, de modo que un equipo puede adaptar el modelo a un entorno concreto (cocina, almacén, laboratorio) partiendo de la arquitectura completa.

## Benchmarks y rendimiento

El artículo reporta resultados en I-Bench, el banco de evaluación introducido por los propios autores para mundos interactivos, y el checkpoint publicado es el que produjo esas cifras. Sin embargo, en la información disponible no se incluyen los valores numéricos de I-Bench ni comparaciones con otros modelos.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Pesos**: el transformer fusionado (`merged/`) ocupa 58,5 GB, coherente con un transformer de 14B en fp32 más los módulos adicionales; los adaptadores LoRA suman 3,80 GB (2,50 GB de LoRA + 1,30 GB de módulos extra) y la caché de embeddings 0,34 GB.
- **VRAM estimada**: ejecutar el formato `merged/` en fp32 requiere del orden de 60-70 GB de VRAM solo para pesos, más activaciones y caché de atención para 330 fotogramas a 384x640, lo que en la práctica exige 80 GB o reparto multi-GPU. Usar el formato `lora/` sobre Helios-Base en bf16 reduce los pesos del transformer a ~28 GB, pero las activaciones de vídeo siguen siendo el cuello de botella.
- **GPU recomendadas**: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2×A100 40 GB con `torchrun`). No se han publicado cifras oficiales de VRAM ni de throughput.
- **GPU de consumo**: no cabe en una RTX 4090 (24 GB) en los formatos publicados; no hay cuantizaciones oficiales que lo permitan y el pipeline no está integrado en llama.cpp ni Ollama.
- **Despliegue**: el repositorio proporciona el script `infer_heliosD.py` ejecutado con `torchrun` (un proceso por GPU) y parámetros explícitos (`--num_frames 330 --height 384 --width 640 --fps 24 --num_inference_steps 50 --guidance_scale 5.0`). El artefacto está etiquetado como `diffusers`, pero no se documenta una integración directa con `DiffusionPipeline`. No hay soporte para vLLM ni TGI, que no aplican a difusión de vídeo.
- **Latencia**: no disponible. Con 50 pasos de muestreo y CFG (dos pasadas por paso) sobre 330 fotogramas, la generación es intrínsecamente costosa; la versión destilada de pocos pasos que reduciría la latencia no está incluida en este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Control de cámara | Interacción con objetos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ActWorld (este) | 14B + LoRA r=128 | 330 fotogramas (~13,75 s a 24 fps), 384x640 | Sí (Plücker FiLM + texto-cámara) | Sí (pick, open, pour, place) | Apache-2.0 | Pesos en HF (0 descargas, 0 likes) |
| Helios-Base | 14B | No disponible | Parcial (acciones de Helios) | No | Apache-2.0 | Pesos en HF |
| Wan2.1-I2V-14B | 14B | No disponible | No documentado | No | Apache-2.0 | Pesos en HF y GitHub |
| Kairos | No disponible | No disponible | No disponible | Orientado a acciones físicas | No disponible | No disponible |

La comparación relevante es con Helios-Base, ya que ActWorld es un fine-tuning del mismo transformer: comparten tamaño y licencia, y la diferencia está en los módulos añadidos (FiLM de Plücker, EAFR, ACHA, memoria) que habilitan cámara e interacción. Frente a Wan2.1-I2V-14B, el linaje es el mismo pero ActWorld añade el esquema chunk-autoregresivo y el control de acciones. Los datos cuantitativos de rendimiento frente a estas alternativas no están disponibles en la información consultada.

## Limitaciones y advertencias

- **Banco de memoria desactivado**: el checkpoint publicado debe ejecutarse sin `--event_memory_enabled` ni `--object_memory_enabled`. Los pesos existen para igualar la arquitectura del paper, pero no están entrenados en esta etapa; activarlos produce comportamiento no validado.
- **Sin versión destilada**: solo se libera el modelo de 50 pasos con CFG, lo que hace la inferencia lenta y cara en comparación con la variante de pocos pasos del artículo.
- **Resolución y duración acotadas**: 384x640 y 330 fotogramas por rollout; no se documenta soporte para otras resoluciones o duraciones.
- **Vocabulario de acciones cerrado**: la rama texto-cámara depende de 81 plantillas de comandos de teclado/ratón precalculadas; acciones fuera de ese conjunto no están cubiertas.
- **Deriva y alucinación visual**: como todo modelo generativo de vídeo, puede producir inconsistencias de identidad de objetos, físicas implausibles o degradación progresiva a lo largo de rollouts largos. No se documentan métricas de deriva en la información disponible.
- **Idiomas y sesgos**: no se documenta la composición del dataset ni los idiomas de los prompts; tampoco se analizan sesgos demográficos, culturales o de escena. No hay evaluación de sesgo publicada.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo deriva de Helios-Base y Wan2.1, también Apache-2.0; conviene verificar las condiciones de las dependencias (codificador UMT5, VAE) antes de un despliegue comercial.
- **Madurez**: 0 descargas y 0 likes en el momento de la ficha, código de inferencia alojado en un repositorio externo (el enlace a GitHub figura como pendiente en la model card); no hay validación independiente de la reproducibilidad.
- **Requisitos de producción**: no hay cuantizaciones oficiales, ni integración con servidores de inferencia habituales, ni documentación de latencia o throughput, lo que dificulta estimar costes operativos.

## Enlaces

- [HuggingFace: xzhexiao/ActWorld](https://huggingface.co/xzhexiao/ActWorld)
- [Artículo en arXiv (2606.17730)](https://arxiv.org/abs/2606.17730)
- [Versión HTML del artículo](https://arxiv.org/html/2606.17730)
- [Página del proyecto ActWorld](https://interactwm.github.io/ActWorld)
- [Modelo base Helios-Base en HuggingFace](https://huggingface.co/BestWishYsh/Helios-Base)
- [Repositorio Helios (PKU-YuanGroup)](https://github.com/PKU-YuanGroup/Helios)
- [Repositorio Wan2.1](https://github.com/Wan-Video/Wan2.1)
