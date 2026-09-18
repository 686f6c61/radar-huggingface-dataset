# zuanfilm/Krea2_Character_unlocked

## Resumen

Krea2 Character (repositorio `zuanfilm/Krea2_Character_unlocked`) no es un modelo con pesos entrenados, sino un **workflow de ComfyUI** publicado por el usuario zuanfilm que encadena varios componentes para convertir una imagen de referencia arbitraria (animal, planta, objeto, arquitectura, mineral, paisaje, forma abstracta) en un **diseño de personaje humano original**. El flujo usa Qwen3-VL 4B como analizador visual para traducir las características de la referencia a un prompt de diseño de personaje en lenguaje natural, y después emplea Krea2 como modelo de generación image-to-image para producir el resultado.

La propuesta técnica es la traducción metafórica del "ADN visual" del sujeto: silueta, proporciones, colores, patrones, texturas, materiales y geometría estructural se mapean a rasgos humanos (peinado, construcción del vestuario, accesorios, pose, presencia visual) en lugar de convertirse literalmente en un disfraz o en una versión antropomórfica del objeto. El pipeline incorpora dos etapas de muestreo (`ClownsharKSampler_Beta`), ponderación de prompt específica de Krea2 (`Krea2PromptWeight`), un enhancer (`Krea2T-Enhancer-Advanced`), variación controlada de semilla (`RBG_Smart_Seed_Variance`) y una sección opcional de LoRA gestionada con `comfyui-lora-manager`.

Su relevancia práctica es acotada pero concreta: sirve como plantilla reproducible para pipelines de diseño de personajes que combinan un modelo de visión-lenguaje con un modelo de difusión, y como ejemplo de orquestación de nodos no nativos en ComfyUI. El repositorio tiene 0 descargas, 0 likes y un tamaño declarado de 0,0 GB, es decir, **no contiene pesos**: solo instrucciones y configuración, con licencia Apache 2.0 declarada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo único: orquestación en ComfyUI de un pipeline image-to-image con Krea2 (modelo de generación, `krea2_turbo_fp8.safetensors`), Qwen3-VL 4B como VLM de análisis (`qwen3vl_4b_bf16.safetensors`) y VAE de Wan2.1 (`Wan2.1_VAE_upscale2x_imageonly_real_v1.safetensors`) |
| Parametros totales | no disponible (el repositorio no publica pesos; tamaño del repo: 0,0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 (Krea2 turbo) y bf16 (Qwen3-VL 4B) según los ficheros referenciados; no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible; las instrucciones internas del flujo y la model card están redactadas en inglés |
| Licencia | Apache 2.0 (declarada para el workflow; no cubre los modelos de terceros que referencia) |
| Formato de pesos | safetensors (ficheros referenciados externamente; no incluidos en el repositorio) |
| Autor | zuanfilm |
| Pipeline declarado | image-to-image |
| Tipo de artefacto | workflow de ComfyUI (JSON/configuración), no modelo |
| Nodos custom requeridos | comfyui-kjnodes, comfyui-lora-manager, comfyui-fearnworksnodes, ComfyUI-RBG-SmartSeedVariance, RES4LYF, ComfyUI-VAE-Utils, comfyui_layerstyle, rgthree-comfy |
| LoRA incluida en el flujo | `banjiesock_Krea2` a strength 1.0 (opcional; gestionada con TriggerWord Toggle) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El artefacto es un grafo de ejecución, no un modelo entrenado. La secuencia documentada es: (1) carga de la imagen de referencia con `LoadImage`, redimensionada a aproximadamente 1 megapíxel; (2) análisis por Qwen3-VL 4B a través del nodo `TextGenerate`, con un conjunto de instrucciones internas diseñado para producir una descripción de personaje humano independiente del estilo, que elige género masculino o femenino según el carácter visual de la referencia y preserva relaciones de color y jerarquía visual; (3) paso opcional por un LoRA de Krea2; (4) ponderación del prompt con `Krea2PromptWeight` y realce con `Krea2T-Enhancer-Advanced` (enabled `true`, strength `1.5`, text scale `1.5`, debug `false`); y (5) muestreo en dos etapas.

El muestreo usa dos instancias de `ClownsharKSampler_Beta`. La primera emplea `linear/euler` con scheduler `beta57`, 10 pasos configurados, 9 pasos a ejecutar, denoise 0,9, CFG 1, ETA 0,5 y `Bongmath` activado. La segunda emplea `linear/dormand-prince_6s` con scheduler `kl_optimal`, 10 pasos configurados, 1 paso a ejecutar, denoise 0,27, CFG 1 y ETA 1, operando sobre el latente producido por la primera etapa. Adicionalmente se aplica `RBG_Smart_Seed_Variance` con preset `Creative`, fine tune variance `75`, tipo de modelo `Krea2 (SingleStream)`, curva de desvanecimiento `Linear`, inyección de ruido en `All Steps`, modo de protección `First Half`, dirección `Bone Anatomical Coherence` con fuerza `97`, programación de varianza decreciente, cutoff step `7`, cutoff strength `0,1` y vibe blend `0,5` sobre un total de 10 pasos.

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO, porque el autor no entrena ningún modelo: se limita a configurar modelos de terceros ya existentes. La model card está truncada en la sección "Main workflow stru", por lo que parte de la documentación del grafo no está disponible.

## Capacidades

- Generación de diseño de personaje humano original a partir de una imagen de referencia de cualquier naturaleza visual (animal, planta, objeto, arquitectura, artefacto, mineral, fenómeno natural, paisaje, forma abstracta).
- Análisis visual mediante un VLM de 4B parámetros que produce un prompt de diseño en lenguaje natural, en lugar de exigir al usuario que lo escriba manualmente.
- Traducción metafórica de rasgos: plumas pueden convertirse en tejidos por capas, hojas en patrones de confección, y la geometría de un objeto en la silueta del personaje.
- Preservación de relaciones de color, patrones, texturas y materiales de la referencia.
- Condicionamiento image-to-image: el resultado no es una generación desde cero, sino que mantiene vínculo con la imagen de origen.
- Gestión de LoRA con sistema de palabras de activación (`TriggerWord Toggle`), sin necesidad de reconstruir el prompt manualmente.
- Variación controlada y reproducible mediante semilla inteligente, con control de inyección de ruido por pasos y coherencia anatómica forzada.
- Muestreo en dos etapas con samplers y schedulers distintos, lo que permite separar una fase de composición amplia de una fase de refinado final.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo de pensamiento: el flujo es estrictamente de imagen a imagen con análisis textual intermedio.

## Casos de uso

- Diseño de personajes para videojuegos: a partir de la fotografía de un animal, una planta o un mineral se obtiene un concepto humano coherente con la paleta y la silueta del sujeto, útil para preproducción rápida de elencos con identidad visual derivada del mundo del juego.
- Dirección de arte para animación y cortometrajes: el flujo permite derivar personajes del material visual de referencia (arquitectura, paisajes, fenómenos naturales) manteniendo una paleta y una jerarquía visual comunes a toda la producción.
- Diseño de mascotas o embajadores de marca: se parte del logotipo, el producto o la textura corporativa y se obtiene un personaje humano cuya construcción de vestuario y accesorios traduce los materiales y colores de marca.
- Exploración de variantes controladas: con `RBG_Smart_Seed_Variance` en modo `Creative` y varianza decreciente, se generan familias de personajes que comparten el ADN visual de la referencia pero difieren en detalles anatómicos y de pose, lo que acelera la iteración respecto a la edición manual del prompt.
- Creación de personajes originales con menor riesgo de copia literal: la instrucción de traducir de forma metafórica y no literal, junto con la separación explícita entre diseño de personaje y estilo de renderizado, reduce la dependencia de parecidos directos con la referencia, algo relevante cuando la referencia es material de terceros.
- Integración en pipelines automatizados de ComfyUI: el workflow puede exponerse vía API de ComfyUI y ejecutarse por lotes sobre carpetas de referencias, generando un personaje por imagen con ajustes fijos de muestreo y de LoRA.
- Material docente y de demostración técnica: sirve como ejemplo funcional de composición de un VLM (`TextGenerate` con Qwen3-VL) y un modelo de difusión dentro de un mismo grafo, con nodos no nativos de ocho paquetes distintos.
- Prototipado de vestuario y caracterización: las secciones de la instrucción que cubren construcción de la ropa, accesorios y lenguaje corporal permiten obtener bocetos de vestuario derivados de texturas concretas (telas, pieles, superficies minerales).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas cuantitativas (ni FID, ni CLIP score, ni evaluaciones de consistencia de personaje), ni comparaciones con otros flujos de diseño de personajes. Tampoco se documentan tiempos de inferencia ni throughput medidos. Los únicos datos objetivos verificables en la información son los de configuración de muestreo: 10 pasos totales declarados en cada sampler, de los cuales se ejecutan 9 en el primero y 1 en el segundo, con CFG 1 y scheduler `beta57`/`kl_optimal`, lo que apunta a un esquema de inferencia de pocos pasos, pero sin cifras de latencia publicadas.

## Requisitos de hardware

Los siguientes puntos son estimaciones derivadas de los ficheros referenciados en la model card, no datos publicados por el autor.

- Qwen3-VL 4B en bf16: el fichero de pesos ronda los 8 GB (4 000 millones de parámetros a 2 bytes por parámetro) antes de contar activaciones y caché de atención; en la práctica conviene reservar del orden de 10-12 GB de VRAM si se mantiene cargado junto al resto del grafo.
- Krea2 en fp8: no disponible. La model card no indica el número de parámetros del modelo `krea2_turbo_fp8.safetensors`, por lo que no es posible estimar su huella de VRAM de forma fiable.
- VAE de Wan2.1: consumo comparativamente bajo, pero requiere memoria adicional durante el encode y decode de la imagen.
- ComfyUI gestiona la memoria de forma dinámica y puede descargar modelos entre etapas; aun así, un grafo que referencia simultáneamente un VLM de 4B y un modelo de difusión puede requerir 24 GB o más de VRAM si no se fuerza la descarga de componentes entre fases. Es una estimación, no un requisito confirmado.
- GPU recomendadas: no disponible. Por tamaño de los componentes, GPU de 24 GB (RTX 3090/4090) o superiores (A100 40/80 GB, H100) son el rango razonable, pero el autor no publica requisitos ni configuraciones probadas. No hay confirmación de funcionamiento en GPU de consumo de 8-16 GB.
- Opciones de despliegue: el flujo está diseñado para ComfyUI y depende de nodos no nativos (comfyui-kjnodes, comfyui-lora-manager, comfyui-fearnworksnodes, ComfyUI-RBG-SmartSeedVariance, RES4LYF, ComfyUI-VAE-Utils, comfyui_layerstyle, rgthree-comfy). No hay soporte documentado para vLLM, TGI, Ollama o llama.cpp aplicado a este workflow; el componente Qwen3-VL podría servirse por separado en un servidor de inferencia, pero eso implicaría reescribir el grafo.
- Latencia y throughput estimados: no disponible. La configuración usa 9 + 1 pasos efectivos de muestreo, lo que sugiere una generación relativamente corta en comparación con pipelines de 30-50 pasos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos verificables para una comparativa cuantitativa. La información proporcionada no incluye benchmarks, número de parámetros de Krea2 ni resultados de otros workflows comparables. La siguiente tabla recoge únicamente los datos disponibles de los componentes implicados, marcando como no disponibles los campos sin información.

| Elemento | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2 Character (este workflow) | no disponible (no publica pesos) | no disponible | sin benchmarks publicados | Apache 2.0 (solo el workflow) | HuggingFace, 0 descargas, 0 likes |
| Krea2 turbo (`krea2_turbo_fp8.safetensors`, referenciado) | no disponible | no aplica (modelo de imagen) | no disponible | no disponible en la informacion | fichero externo, no incluido en el repo |
| Qwen3-VL 4B (`qwen3vl_4b_bf16.safetensors`, referenciado) | 4 000 millones (según nombre del fichero) | no disponible | no disponible | no disponible en la informacion | fichero externo, no incluido en el repo |
| Enfoque alternativo: prompt manual en Krea2 con IP-Adapter o similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: es un workflow de ComfyUI. El repositorio tiene 0,0 GB y no contiene pesos, por lo que no puede usarse por sí solo; requiere descargar Krea2 turbo en fp8, Qwen3-VL 4B en bf16 y el VAE de Wan2.1 por separado.
- La licencia Apache 2.0 declarada cubre el flujo publicado, no los modelos de terceros ni el LoRA `banjiesock_Krea2` que el grafo referencia. Antes de un uso comercial hay que verificar las licencias de Krea2, Qwen3-VL, el VAE de Wan2.1 y del LoRA, que no están documentadas en la información disponible.
- Dependencia de ocho paquetes de nodos no nativos. La propia model card advierte de que las versiones de nodo registradas en el workflow pueden diferir de las disponibles actualmente, lo que implica riesgo de rotura al importar el grafo en instalaciones nuevas.
- Riesgo de alucinación en la fase de análisis: el prompt de personaje lo genera un VLM (Qwen3-VL 4B) a partir de una imagen redimensionada a ~1 megapíxel. Una descripción errónea de la referencia se propaga directamente a la generación, sin mecanismo de verificación documentado.
- Sesgo de género: las instrucciones internas eligen entre personaje masculino o femenino en función del "carácter visual" de la referencia, criterio no documentado y potencialmente estereotipado. No hay evaluación de sesgos publicada.
- Riesgo legal en el uso de referencias: aunque la traducción es metafórica, generar un personaje humano a partir de una obra protegida, una marca o la imagen de una persona real puede vulnerar derechos de terceros. El flujo no incorpora filtros de similitud ni de identidad.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de los metadatos, y la model card está truncada ("Main workflow stru"), por lo que la documentación del grafo no es completa.
- Consistencia de personaje no garantizada: el sistema de variación de semilla está orientado a producir variación creativa, no a fijar la identidad de un personaje entre imágenes. No se documenta ningún mecanismo de fijación de rasgos (tipo referencia de rostro o embedding de identidad).
- No determinismo: la combinación de varianza creativa, inyección de ruido en todos los pasos y dos samplers distintos dificulta la reproducción exacta de un resultado.
- Idiomas: no disponible. El prompt intermedio se produce en inglés, lo que puede degradar resultados si el usuario espera descripciones en castellano o si el modelo de generación está optimizado para prompts en inglés.
- Sin datos de rendimiento, VRAM requerida, latencia o calidad medidos por el autor; cualquier planificación de producción sobre este flujo exige una fase de pruebas propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/zuanfilm/Krea2_Character_unlocked
- La búsqueda web realizada no devolvió resultados relevantes: los únicos enlaces recuperados corresponden a páginas de inicio y formularios de acceso de Facebook, sin relación con el modelo.
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos asociados al workflow.
