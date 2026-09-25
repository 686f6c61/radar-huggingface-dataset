# zihan-audio/AutoAEG_ckpt

## Resumen

AutoAEG_ckpt es un repositorio de checkpoints PEFT (adaptadores LoRA) publicado por el usuario zihan-audio (Zihan Zhang) en HuggingFace. No contiene un modelo completo, sino un conjunto de adaptadores de ajuste fino pensados para acoplarse a un modelo base Qwen3-Omni que no se distribuye en el repositorio. El objetivo declarado es el "audio event grounding" (AEG) en vocabulario abierto: localizar temporalmente eventos sonoros en un audio a partir de consultas en lenguaje natural, devolviendo intervalos de inicio y fin (onsets y offsets).

El repositorio agrupa tres adaptadores de la cadena experimental AutoAEG: un adaptador SFT final entrenado desde cero sobre el conjunto `sft10k_v3`, un adaptador GRPO con recompensa de IoU estructurado más RMS/span inicializado desde ese SFT, y un adaptador GRPO con recompensa de IoU estructurado más CLS/span, en el paso global 1300. Se incluyen además artefactos auxiliares de entrenamiento: un adaptador LoRA de referencia fijo para el término KL del GRPO y una caché de plantillas de recompensa CLS.

La relevancia del repositorio es fundamentalmente metodológica: acompaña al trabajo Auto-AEG, centrado en la construcción escalable de datos sintéticos y pseudoetiquetas multimodelo para habilitar el grounding de eventos de audio en vocabulario abierto sobre modelos de audio-lenguaje grandes. El tamaño total del repositorio es de 0,2 GB, no tiene descargas ni likes registrados y no declara licencia, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; LoRA (PEFT) sobre un modelo base Qwen3-Omni de tipo audio-lenguaje |
| Parametros totales | no disponible (el adaptador no declara número de parámetros; los parámetros del modelo base Qwen3-Omni no se especifican en la informacion disponible) |
| Parametros activos | no disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-Omni, no declarado) |
| Tipos de cuantizacion | no disponible; los adaptadores se distribuyen en safetensors y la cuantizacion aplicable depende del modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); se incluyen ademas `training_aux/reference_lora.pt` en formato PyTorch y `training_aux/class_templates.pkl` |

## Arquitectura y entrenamiento

El repositorio no define una arquitectura propia: son adaptadores LoRA (Low-Rank Adaptation) gestionados con la libreria PEFT que se acoplan a un modelo base Qwen3-Omni, un modelo multimodal de audio y lenguaje. El modelo base no se incluye en el repositorio y debe cargarse por separado antes de adjuntar el adaptador seleccionado. Se excluyen deliberadamente el optimizador, el scheduler, el estado del generador de numeros aleatorios y los fragmentos de entrenamiento distribuido; el manifiesto `CHECKPOINT_MANIFEST.json` registra rutas de origen exactas, pasos, tamanos, digests SHA-256 y recuentos de tensores.

La cadena de entrenamiento documentada consta de tres etapas. La primera es un ajuste supervisado (SFT) desde cero sobre el conjunto `sft10k_v3`, cuyo resultado es `checkpoints/sft10k_v3_final/`. Las otras dos parten de ese mismo SFT y aplican GRPO (Group Relative Policy Optimization) con recompensas estructuradas de IoU combinadas con objetivos de tipo RMS/span y CLS/span respectivamente; la variante CLS/span corresponde al paso global 1300 en el momento de la publicacion. Para poder continuar el entrenamiento GRPO se incluye un adaptador LoRA de referencia fijo usado en el termino de divergencia KL, junto con una cache de plantillas de recompensa CLS. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni los detalles de la funcion de recompensa mas alla de su nombre.

El trabajo asociado, Auto-AEG, propone la construccion escalable de datos para grounding de eventos de audio en vocabulario abierto combinando datos sinteticos con pseudoetiquetas generadas por multiples modelos. Segun la descripcion del articulo, el pipeline de anotacion incluye identificacion de etiquetas con Gemini, clasificacion de tipo de evento, localizacion con PE A-Frame y limpieza global de etiquetas basada en CLAP, produciendo anotaciones limpias de onset/offset sobre un vocabulario canonico.

## Capacidades

- Localizacion temporal de eventos sonoros (audio event grounding): genera intervalos de inicio y fin para eventos descritos mediante consultas en lenguaje natural.
- Vocabulario abierto: el modelo no se limita a un conjunto cerrado de etiquetas de eventos, segun la descripcion del trabajo Auto-AEG.
- Procesamiento de audio y lenguaje de forma conjunta, al estar construido sobre Qwen3-Omni.
- Ajuste por etapas con SFT y refinamiento posterior mediante GRPO con recompensas basadas en IoU estructurado, orientado a mejorar la precision de los limites temporales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo thinking, vision o audio adicional: no disponible; unicamente se documenta la modalidad de audio implicita en la tarea de grounding.

## Casos de uso

- Indexacion y busqueda de archivos de audio: el adaptador permite localizar en una grabacion larga los tramos en los que ocurre un evento descrito por el usuario (por ejemplo, "ladrido de perro" o "cristal roto"), lo que posibilita construir indices temporales consultables sobre archivos de sonido.
- Analisis de grabaciones de vigilancia acustica: deteccion y delimitacion de eventos relevantes en streams de audio continuos, con marcas de inicio y fin que facilitan la revision posterior por parte de un operador.
- Monitorizacion de fauna y bioacustica: localizacion de vocalizaciones concretas dentro de grabaciones de campo de larga duracion, aprovechando el paradigma de vocabulario abierto para trabajar con especies no contempladas en taxonomias cerradas.
- Anotacion asistida de corpus de audio: generacion de preanotaciones de onset/offset que despues se revisan manualmente, reduciendo el coste de construir conjuntos de datos de grounding etiquetados.
- Analisis de contenido audiovisual: segmentacion de la banda sonora de videos para identificar eventos sonoros y sincronizarlos con la edicion o con la generacion de subtitulos descriptivos.
- Diagnostico industrial basado en sonido: localizacion temporal de eventos acusticos anormales en registros de maquinaria, como base para sistemas de mantenimiento predictivo que necesitan saber cuando ocurre el evento y no solo si ocurre.
- Investigacion en modelos de audio-lenguaje: el repositorio sirve como referencia reproducible de una cadena SFT mas GRPO con recompensas de IoU estructurado, util para comparar estrategias de ajuste en tareas de localizacion temporal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica referencia cuantitativa encontrada es cualitativa: el articulo asociado afirma que el modelo entrenado con Auto-AEG supera a las lineas base de tipo zero-shot en todas las metricas del benchmark AudioGrounding (Xu et al. 2021), y remite al material suplementario para los resultados detallados. No se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de metricas de grounding en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Al tratarse de un adaptador LoRA, el consumo depende enteramente del modelo base Qwen3-Omni, cuyos requisitos no se declaran en el repositorio.
- El repositorio completo ocupa 0,2 GB, un tamano compatible con cualquier GPU, ya que contiene unicamente los pesos del adaptador y artefactos auxiliares.
- GPU recomendadas: no disponible; dependera del modelo base. Procesar audio y mantener el modelo de lenguaje asociado suele requerir aceleradores con memoria dedicada, pero no se aportan cifras en la informacion disponible.
- Compatibilidad con GPU de consumo: no disponible; no puede determinarse sin conocer los requisitos del modelo base.
- Opciones de despliegue: al ser un checkpoint PEFT, es compatible con el ecosistema HuggingFace PEFT/Transformers para cargar el adaptador sobre el modelo base. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, parametros ni contexto de modelos comparables, y el repositorio no publica resultados numericos frente a alternativas. La unica referencia comparativa mencionada en la busqueda web es el benchmark AudioGrounding (Xu et al. 2021) frente a lineas base zero-shot, sin cifras asociadas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar por separado el modelo base Qwen3-Omni correspondiente. Sin el, los adaptadores no son utilizables.
- El repositorio no declara licencia, por lo que el uso comercial queda sin cobertura legal explicita hasta que el autor lo aclare.
- No se declaran idiomas soportados. El comportamiento multilingue del adaptador es desconocido y podria estar limitado a los idiomas presentes en `sft10k_v3`.
- Riesgo de alucinacion: en tareas de grounding, el modelo puede generar intervalos temporales plausibles pero incorrectos, especialmente con eventos poco representados o audio con ruido.
- Sesgo de datos: el pipeline de anotacion descrito depende de pseudoetiquetas generadas por modelos externos (Gemini, PE A-Frame, CLAP), de modo que los errores sistematicos de esos modelos pueden propagarse a las predicciones.
- Vocabulario abierto no implica cobertura universal: el rendimiento en categorias de eventos ausentes en los datos de construccion puede degradarse.
- Estado experimental: el propio autor describe los checkpoints como parte de una "cadena experimental" en curso, con una de las variantes GRPO publicada en el paso global 1300, lo que sugiere que no es un artefacto final consolidado.
- Sin descargas ni likes registrados, y sin pipeline declarado, la validacion por parte de terceros es inexistente en el momento de la publicacion.
- Los checkpoints no incluyen optimizador, scheduler ni estado distribuido; continuar el entrenamiento GRPO exige el adaptador de referencia KL y la cache de plantillas de recompensa incluidos en `training_aux/`.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zihan-audio/AutoAEG_ckpt
- Perfil del autor en HuggingFace: https://huggingface.co/zihan-audio/datasets
- Pagina del articulo en HuggingFace Papers (Auto-AEG: Scalable Data Construction for Open-Vocabulary Audio Event Grounding): https://huggingface.co/papers/2607.04383
- PDF del articulo: https://arxiv.org/pdf/2607.04383v3
- Version HTML del articulo: https://arxiv.org/html/2607.04383v4
- Repositorio de terceros con listados de modelos gratuitos citado en la busqueda (no relacionado con el modelo): https://github.com/ClawLabsAI/free-ai-models
