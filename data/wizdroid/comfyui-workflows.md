# wizdroid/comfyui-workflows

## Resumen

`wizdroid/comfyui-workflows` no es un modelo de IA en sentido estricto, sino una coleccion de workflows en formato JSON para ComfyUI, el editor de grafos de nodos para generacion de imagenes. El repositorio, publicado por el usuario wizdroid bajo licencia MIT, agrupa doce pipelines orientados a tres objetivos concretos: consistencia de identidad de personajes, inferencia acelerada y generacion automatizada de datasets para entrenar LoRA. Cada workflow es un grafo de nodos que referencia modelos externos (Flux2-Klein, Qwen-Image, Z-Image-Turbo, SeedVR2) y nodos personalizados que el usuario debe instalar por separado.

El interes practico del repositorio reside en la combinacion de tecnicas: inyeccion de Reference Latent para preservar la identidad de un personaje a partir de una, dos o tres imagenes de referencia; aceleracion mediante Nunchaku para los modelos Flux2-Klein de 9B parametros; y un nodo propio, `WizdroidLoRADataset`, que utiliza un modelo de vision local servido con Ollama para etiquetar automaticamente imagenes y estructurar un dataset de entrenamiento. Los workflows van acompanados de un fichero `PROMPTS.md` con mas de cuarenta variaciones de prompt en formato cuadrado 1:1.

Es relevante ahora porque reduce el trabajo de ingenieria necesario para montar pipelines de generacion de personajes consistentes y de preparacion de datos, un cuello de botella habitual en proyectos de LoRA y de contenido visual. No obstante, conviene subrayar que el repositorio no contiene pesos de modelos: su valor esta en la orquestacion, y su funcionamiento depende de la disponibilidad y versionado de los modelos y nodos de terceros a los que hace referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (coleccion de workflows JSON para ComfyUI; los grafos orquestan modelos DiT, VAE y LLM de vision externos) |
| Parametros totales | No aplica al repositorio; los modelos referenciados incluyen Flux2-Klein 9B, SeedVR2 7B, Qwen3 8B/4B y Z-Image-Turbo |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los workflows referencian pesos safetensors fp16 y LoRA de turbo; no se documentan esquemas de cuantizacion) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | JSON (workflows de ComfyUI); los modelos referenciados se distribuyen como safetensors |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo. Su contenido son grafos de nodos serializados en JSON que ComfyUI interpreta para encadenar cargadores de checkpoint, codificadores de texto, samplers, inyeccion de latentes de referencia, upscalers y nodos de utilidades. Los tamanos de fichero oscilan entre aproximadamente 3 MB (`dataset-generator.json`) y 41 MB (`flux2-klein-3i2i.json`), lo que refleja la complejidad del grafo y no el peso de ningun modelo.

Los pipelines se apoyan en tres familias de modelos. Flux2-Klein 9B actua como motor principal de calidad, con aceleracion Nunchaku y sampler avanzado de Flux. Qwen-Image, en variantes All-in-One y con soporte de edicion, cubre generacion texto-a-imagen y referencia de imagen con un sesgo estetico alternativo. Z-Image-Turbo se emplea para iteracion rapida con muy pocos pasos. A ello se suma SeedVR2, un upscaler basado en DiT mas VAE con tiling y correccion de color, y el nodo `WizdroidLoRADataset`, que invoca un modelo de vision via Ollama (Moondream en la configuracion recomendada) para generar leyendas y validar la estructura del dataset. La innovacion tecnica destacable es la inyeccion de Reference Latent para consistencia de identidad y la integracion de captioning local en el mismo entorno de ComfyUI.

## Capacidades

- Generacion texto-a-imagen de alta calidad mediante Flux2-Klein 9B con sampler de Flux y carga opcional de LoRA.
- Generacion texto-a-imagen con Qwen-Image en variantes estandar y All-in-One, con resolucion flexible y control estetico alternativo.
- Generacion rapida de prototipos con Z-Image-Turbo, disenada para muy pocos pasos de muestreo y aceleracion Nunchaku.
- Consistencia de personaje imagen-a-imagen con una, dos o tres imagenes de referencia mediante inyeccion de Reference Latent.
- Upscaling de 2x a 4x con SeedVR2, incluyendo tiling para imagenes grandes y correccion de color.
- Creacion automatizada de datasets para LoRA: captioning con modelo de vision local, estructuración de carpetas y validacion.
- Carga conmutable de LoRA en la mayoria de pipelines.
- Resolucion cuadrada 1:1 y resoluciones flexibles optimizadas para trabajo de referencia de personajes.
- No se documentan capacidades de tool calling, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- Produccion de personajes consistentes para narrativa visual: el workflow `flux2-klein-3i2i.json` combina tres imagenes de referencia mediante Reference Latent para mantener la identidad facial y de vestuario a lo largo de una serie de ilustraciones, reduciendo el retoque manual entre tomas.
- Preparacion de datasets para entrenar LoRA de personajes: `dataset-generator.json` recorre una carpeta de imagenes, genera leyendas con Moondream via Ollama y valida la estructura resultante, de modo que el usuario obtiene un dataset listo para entrenamiento sin escribir scripts propios.
- Iteracion rapida de conceptos artisticos: `z-image-turbo-t2i.json` permite generar borradores con muy pocos pasos para explorar direcciones esteticas antes de comprometerse con una generacion de mayor calidad en Flux2-Klein.
- Restauracion y ampliacion de material grafico: `seedvr2-i2i.json` aplica un upscaler DiT mas VAE con tiling y correccion de color, adecuado para recuperar detalle en retratos o ilustraciones de baja resolucion destinadas a impresion.
- Creacion de hojas de referencia multiangulo: combinando los workflows de una, dos y tres imagenes con las variaciones de `PROMPTS.md` (angulos, expresiones, cuerpo entero, perfil), se generan conjuntos coherentes de vistas de un mismo personaje para documentacion o entrenamiento.
- Exploracion estetica alternativa en proyectos de diseno: los workflows `qwen-t2i.json` y `qwen-aio-t2i.json` ofrecen un sesgo visual distinto al de Flux, util para pruebas de direccion de arte con resolucion flexible.
- Integracion en estudios pequenos con hardware local: al depender de ComfyUI y de modelos servidos localmente, el conjunto puede desplegarse en una estacion de trabajo con GPU consumer sin depender de APIs externas, salvo el servicio local de Ollama para el captioning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible en la informacion proporcionada. A modo de referencia estructural, los workflows principales referencian Flux2-Klein 9B en safetensors, Qwen3 8B/4B, SeedVR2 7B y Z-Image-Turbo; el consumo dependera de la precision de los pesos y del uso de aceleracion Nunchaku, extremo no documentado.
- GPU recomendadas: no disponible. No se especifican modelos de GPU en la documentacion.
- Compatibilidad con GPU consumer: no confirmada. La presencia de variantes aceleradas con Nunchaku y de un modelo turbo sugiere vocacion de despliegue local, pero no se aportan cifras de VRAM que permitan confirmarlo.
- Opciones de despliegue: ComfyUI como entorno de ejecucion, con los nodos personalizados ComfyUI-nunchaku, ComfyUI-SeedVR2_VideoUpscaler (ainvfx) y wizdroid-character. Para el captioning del dataset se requiere Ollama con el modelo `moondream:latest` (u otro configurable en el nodo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| wizdroid/comfyui-workflows | Coleccion de workflows ComfyUI | No aplica | No disponible | MIT | Enfoque en consistencia de personaje, aceleracion y generacion de datasets |
| Repositorios de workflows ComfyUI de la comunidad | Colecciones de grafos JSON | No aplica | No disponible | Variable segun autor | Suelen carecer de nodo propio de captioning y de pipelines multi-referencia documentados |
| Implementaciones directas de Flux / Qwen-Image | Modelos generativos | 9B (Flux2-Klein), variable (Qwen-Image) | No disponible | Segun modelo | Requieren construir el grafo a mano; mayor control pero mas trabajo de integracion |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelos: sin descargar Flux2-Klein, Qwen-Image, Z-Image-Turbo, SeedVR2 y los codificadores CLIP correspondientes, los workflows no producen resultados.
- Dependencia fuerte de nodos personalizados de terceros (ComfyUI-nunchaku, ComfyUI-SeedVR2_VideoUpscaler, wizdroid-character); cambios de version o abandonos de mantenimiento pueden romper los grafos.
- Las rutas de modelos estan fijadas dentro de los JSON y deben ajustarse manualmente a la estructura de carpetas del usuario.
- El pipeline de captioning depende de Ollama y de un modelo de vision local (Moondream por defecto); la calidad de las leyendas condiciona la calidad del LoRA entrenado.
- No se documentan sesgos del sistema ni evaluaciones de robustez; los sesgos heredados seran los de los modelos subyacentes, no evaluados aqui.
- Riesgo de alucinacion visual y de artefactos propios de los modelos generativos referenciados; no hay metricas publicadas que cuantifiquen la fidelidad de identidad lograda.
- La licencia MIT cubre los workflows, pero no los modelos de terceros, cuyas condiciones de uso comercial deben verificarse por separado.
- Ausencia total de descargas y likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- El repositorio no documenta idiomas soportados ni limitaciones de contexto, por lo que no puede evaluarse su comportamiento multilingue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wizdroid/comfyui-workflows
- Prompts de referencia: https://huggingface.co/wizdroid/comfyui-workflows/blob/main/PROMPTS.md
- Nodos personalizados wizdroid-character: https://github.com/wizdroid/wizdroid-character
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- Nunchaku: https://github.com/nunchaku-tech
- Black Forest Labs (Flux): https://blackforestlabs.ai/
- Licencia MIT: https://opensource.org/licenses/MIT
