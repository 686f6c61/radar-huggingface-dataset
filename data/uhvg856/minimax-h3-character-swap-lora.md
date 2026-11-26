# Uhvg856/MiniMax-H3-Character-Swap-LoRA

## Resumen

MiniMax-H3 Character Swap LoRA es un adaptador LoRA de edición de vídeo diseñado para sustituir a una persona concreta en una grabación de origen por la identidad de un personaje proporcionado mediante una imagen de referencia. Lo publica el usuario Uhvg856 en Hugging Face, aunque la model card y el trabajo de entrenamiento remiten al autor original akatz-ai (Adam Katz). Se apoya en el modelo base MiniMax-H3 de Comfy-Org, concretamente en la variante Ref2VA (referencia a vídeo con audio), y se distribuye como archivo único de difusión (diffusion-single-file) para integrarse en ComfyUI.

El adaptador no es un modelo autónomo: requiere el base Ref2VA, el text encoder, los VAE y, según la receta probada por el autor, los pesos Turbo de 8 pasos. La versión recomendada es V1.5 (`h3_character_swap_v1.5.safetensors`), que sustituye a la V1 anterior (`h3_character_swap_pro4500_1000.safetensors`) manteniendo esta última para reproducibilidad. El repositorio ocupa 0,3 GB, coherente con un adaptador de bajo rango sobre un modelo de vídeo de gran tamaño.

La relevancia actual radica en que permite flujos de posproducción de vídeo con sustitución de identidad controlada por referencia visual, sin reentrenar el modelo base y con integración nativa en ComfyUI mediante el nodo H3 Relay 2.0. Es una herramienta experimental orientada a creadores e investigadores que necesitan evaluar el estado del arte en edición de personajes sobre vídeo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusión de vídeo MiniMax-H3 Ref2VA |
| Parametros totales | no disponible (adaptador de 0,3 GB; el base no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del frame grid y la ventana del runtime H3) |
| Tipos de cuantizacion | INT8 para el base Ref2VA según la receta probada; bf16 para los pesos Turbo; el LoRA se distribuye en safetensors |
| Idiomas soportados | en (inglés) |
| Licencia | minimax-h3-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (archivo único, diffusion-single-file) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre MiniMax-H3, un modelo de difusión para generación y edición de vídeo con condicionamiento por referencia (Ref2VA: referencia a vídeo con audio). El LoRA modifica el comportamiento del base para que, dada una grabación fuente y una imagen de personaje, reemplace la identidad de una persona seleccionada conservando pose, mirada, expresión y movimiento de la actuación original, así como el resto de la escena y las demás personas. El entrenamiento se realizó con ai-toolkit sobre el dataset `akatz-ai/H3-Character-Swap-v1`, que forma parte de la línea de entrenamiento pero no constituye la mezcla completa de V1.5.

La procedencia de V1.5 se documenta en `training/v1.5/run-summary.json`, con hash de release, inicialización, actualizaciones completadas y ajustes de entrenamiento. Los archivos bajo `training/` describen la V1 original. Algunos metadatos embebidos conservan el nombre interno "V2" y el presupuesto original de 2250 actualizaciones, aunque el paso guardado y la parada final difieren. La receta probada por el autor combina el base Ref2VA en INT8, este adaptador a fuerza 1.0 y los pesos `minimax_h3_fl2v_turbo_8step_v1.0_768p_comfyui_bf16.safetensors` a fuerza 1.0, con 8 pasos, CFG 1, sampler `er_sde` y scheduler `normal`.

## Capacidades

- Sustitución de personaje en vídeo: reemplaza a una persona seleccionada en una grabación por la identidad de un personaje de referencia en imagen.
- Transferencia de identidad parcial: conserva rasgos faciales, peinado y vestuario del personaje de referencia según la descripción del prompt.
- Preservación de la actuación: mantiene pose, mirada, expresión y movimiento de la fuente.
- Conservación de escena: preserva el entorno y las demás personas del vídeo original.
- Condicionamiento por audio de origen: la herramienta H3 Character Swap admite audio de la fuente como condición, aunque el LoRA no reproduce audio con exactitud ni garantiza lip sync.
- Integración con ComfyUI: carga mediante un loader de LoRA solo de modelo compatible, con flujos nativos y API.
- Soporte de máscaras y anclas de escena a través de la herramienta H3 Relay 2.0.
- Continuación por segmentos mediante historial de continuación y bucles en el flujo de trabajo.
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo generativo de vídeo, no un LLM.

## Casos de uso

- Posproducción de vídeo comercial: sustituir a un actor por un personaje aprobado en una toma ya rodada, manteniendo la interpretación original y reduciendo el coste de un nuevo rodaje. Adecuado porque el LoRA transfiere identidad sin alterar la actuación de la fuente.
- Prototipado de casting virtual: generar variantes de una misma escena con distintas identidades de referencia para evaluar encaje visual antes de producir. El flujo por segmentos de H3 Relay 2.0 permite iterar sobre tomas cortas a 24 fps.
- Creación de contenido para redes: aplicar una identidad de personaje recurrente a grabaciones propias para mantener coherencia de marca o personaje en una serie de vídeos.
- Previsualización de efectos en VFX: probar sustituciones de personaje en planos de referencia antes de un trabajo de mayor fidelidad, usando la máscara SAM y las anclas de escena de la herramienta.
- Investigación en edición de vídeo generativa: evaluar la retención de identidad en caras estilizadas, peinados y vestuario, comparando V1 y V1.5 sobre un mismo conjunto de tomas.
- Doblaje y localización con continuidad visual: sustituir al intérprete original por una identidad consistente entre tomas de una misma secuencia, apoyándose en el historial de continuación para mantener la coherencia entre segmentos.
- Docencia y demostraciones de difusión condicionada por referencia: mostrar en un aula o taller cómo un LoRA sobre un modelo de vídeo modifica la identidad sin reentrenar el base, usando los flujos de ejemplo del repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una comparación cualitativa V1 frente a V1.5 en forma de vídeo (`assets/character-swap-lora_v1-vs-v1-5.mp4`), con ejemplos seleccionados en los que V1 pierde la identidad de referencia o vuelve a la apariencia de origen mientras V1.5 la retiene mejor. El propio autor advierte que son casos ilustrativos y no un benchmark agregado, y que la evaluación amplia sigue en curso.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del base MiniMax-H3 Ref2VA, del text encoder, de los VAE y de los pesos Turbo, además de la resolución y el número de fotogramas.
- GPU recomendadas: no disponible en la información proporcionada. La receta probada usa el base Ref2VA en INT8 y los Turbo en bf16, lo que sugiere GPUs de datacenter o consumer de gama alta, pero no se especifican modelos concretos.
- Compatibilidad con GPU consumer: no confirmada. El autor advierte que los controles de segmentos largos de la herramienta no garantizan idoneidad para todas las GPU.
- Opciones de despliegue: ComfyUI con loader de LoRA solo de modelo, flujo nativo (`examples/H3-Character-Swap-Relay-V2.json`) y prompt de API (`examples/H3-Character-Swap-Relay-V2.api.json`); herramienta H3 Relay 2.0 instalable desde su repositorio de GitHub.
- Latencia y throughput: no disponibles. La configuración probada es de 8 pasos con CFG 1, sampler `er_sde` y scheduler `normal`, lo que reduce el coste frente a muestreos más largos, pero no se publican tiempos por fotograma.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3 Character Swap LoRA (V1.5) | LoRA de sustitución de personaje sobre difusión de vídeo | adaptador de 0,3 GB; base no incluido | no disponible (frame grid del runtime H3) | minimax-h3-community-license-agreement | Hugging Face, ComfyUI vía H3 Relay 2.0 |
| MiniMax-H3 Character Swap LoRA (V1) | LoRA de sustitución de personaje, versión anterior | adaptador; base no incluido | no disponible | minimax-h3-community-license-agreement | Hugging Face, flujos V1 en el repo |
| MiniMax-H3 Ref2VA (base) | Modelo de difusión de vídeo con condicionamiento por referencia | no disponible | no disponible | minimax-h3-community-license-agreement | Comfy-Org/MiniMax-H3 |
| Alternativas de sustitución de personaje en vídeo de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos de terceros comparables en la información proporcionada, por lo que la comparación se limita a las variantes del propio adaptador y a su base.

## Limitaciones y advertencias

- Modelo experimental: la identidad, el timing respecto a la fuente, las expresiones, las oclusiones y los cortes pueden derivar; el autor lo califica explícitamente como experimental.
- Que V1.5 sea la versión recomendada no implica que mejore en todas las tomas; la evaluación amplia sigue en curso y no hay afirmación de mejora uniforme.
- El LoRA no es un modelo autónomo: no incluye el base, el text encoder, los VAE ni los pesos Turbo, y sin ellos no funciona.
- No reproduce audio con exactitud ni garantiza lip sync; la herramienta conserva la banda sonora original como función de aplicación, no como evidencia de sincronización.
- Los controles de segmentos largos no garantizan calidad en planos largos ni idoneidad para cualquier GPU.
- Idiomas: solo inglés en la etiqueta de idioma; no se documenta soporte multilingüe en prompts.
- Licencia: minimax-h3-community-license-agreement, etiquetada como "other"; es necesario revisar el archivo LICENSE antes de cualquier uso comercial, ya que las condiciones no se detallan en la información disponible.
- Riesgo de suplantación de identidad: la sustitución de personas en vídeo plantea implicaciones éticas y legales sobre consentimiento y derechos de imagen que deben evaluarse antes de publicar resultados.
- Metadatos inconsistentes: parte de los metadatos embebidos conserva el nombre interno "V2" y el presupuesto original de 2250 actualizaciones, lo que puede confundir la trazabilidad de la versión.
- Sin descargas ni likes registrados en el momento de la consulta, y repo actualizado el mismo día de su creación; no hay evidencia de validación por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Uhvg856/MiniMax-H3-Character-Swap-LoRA
- Model card y pesos de referencia del autor original: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Dataset de entrenamiento V1: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Herramienta H3 Relay 2.0: https://github.com/akatz-ai/h3-relay
- Guía de flujo de trabajo: examples/README.md (dentro del repositorio)
- Flujo nativo V2: examples/H3-Character-Swap-Relay-V2.json
- Prompt de API V2: examples/H3-Character-Swap-Relay-V2.api.json
- Flujo nativo V1: examples/H3%20Character%20Swap%20v1%20Ref2VA.json
- Flujo adaptativo Turbo8 V1: examples/akatz-labs-character-swap-turbo8-adaptive-window.json
- Procedencia de V1.5: training/v1.5/run-summary.json
- Comparación V1 vs V1.5: assets/character-swap-lora_v1-vs-v1-5.mp4
- Showcase V1: assets/character-swap-showcase.gif
- Model card histórica de V1: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA/blob/a665bb7e3bb9804e487d2925f67744f554c8ad49/README.md
- Perfil del autor en X: https://x.com/akatz_ai
- Patreon: https://www.patreon.com/Akatz
- GitHub Sponsors: https://github.com/sponsors/akatz-ai
- Ko-fi: https://ko-fi.com/akatz
