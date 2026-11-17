# zuraxe/inuzuka-tsume-naruto

## Resumen

Inuzuka Tsume - Naruto es un adaptador LoRA de personaje para modelos de difusion de imagen, no un modelo de lenguaje. Lo publica el estudio NSFWstudio en la plataforma Renderoverse y lo replica en Hugging Face el usuario zuraxe bajo el identificador `zuraxe/inuzuka-tsume-naruto`. El adaptador reproduce el personaje Tsume Inuzuka, de la franquicia Naruto, sobre checkpoints SDXL compatibles con Illustrious.

El fichero es un LoRA de aproximadamente 185,7 MB en formato Safetensors BF16, pensado para cargarse sobre un checkpoint base SDXL epsilon (el nombre de modelo base embebido en los metadatos es AnyIllustrious XL v0.1.1). No es un checkpoint autonomo: sin un modelo base Illustrious-compatible no genera imagenes. La version replicada es la 1.0.0 gratuita, sin modificaciones respecto al lanzamiento original.

Su relevancia es acotada: se trata de un adaptador de personaje para generacion text-to-image con contenido no apto para todas las audiencias segun los propios metadatos del autor, y con una licencia propietaria (`renderoverse-source-terms`) que no concede derechos adicionales. No dispone de descargas ni valoraciones en el momento de la consulta, y el espejo no verifica la calidad de imagen ni la finalizacion del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / Illustrious |
| Parametros totales | no disponible (peso del fichero: 185.719.000 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | BF16 (unico formato indicado en los metadatos) |
| Idiomas soportados | no disponible (los prompts dependen del checkpoint base) |
| Licencia | `renderoverse-source-terms` (etiquetada como Other, no MIT) |
| Formato de pesos | Safetensors (BF16) |
| Modelo base | AnyIllustrious XL v0.1.1 / SDXL epsilon |
| Trigger de personaje | `tsume_renderoverse` |
| Trigger opcional de vestuario | `Tsumeoutfit` |
| Fuerza recomendada | 1.2 (segun instrucciones del autor) |
| SHA-256 | `b28f632670dfa9adeb06d1b34dffa3dfa1058ba3993b04bc53c3f4df15926b8a` |

## Arquitectura y entrenamiento

El adaptador emplea la tecnica LoRA (Low-Rank Adaptation) aplicada a las capas de atencion y proyeccion de un modelo de difusion SDXL. El rango y el alpha del adaptador no se detallan en la informacion disponible. El checkpoint base declarado en los metadatos embebidos es AnyIllustrious XL v0.1.1, una variante de la familia Illustrious construida sobre SDXL con parametrizacion epsilon.

No se especifican en la informacion proporcionada el numero de imagenes de entrenamiento, la composicion del dataset, el numero de pasos, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion o captions derivados. Los metadatos embebidos describen referencias de entrenamiento con personaje vestido y desnudo, y senalan un estado de caption derivado que el espejo no verifica. Tampoco se confirma la finalizacion del entrenamiento.

## Capacidades

- Generacion text-to-image condicionada por prompt, limitada al personaje Tsume Inuzuka sobre un checkpoint Illustrious/SDXL.
- Activacion del personaje mediante el token `tsume_renderoverse`.
- Control opcional del vestuario mediante el token `Tsumeoutfit`.
- Ajuste de intensidad del adaptador mediante el peso LoRA (valor de referencia 1.2).
- Compatibilidad con el ecosistema SDXL: ControlNet, IP-Adapter, img2img e inpainting dependen del checkpoint base y del frontend usado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Ilustracion de fan art: cargar el LoRA sobre un checkpoint Illustrious y generar retratos o escenas del personaje con el trigger `tsume_renderoverse` a fuerza 1.2, ajustando el prompt de estilo segun el checkpoint.
- Creacion de variaciones de vestuario: combinar `Tsumeoutfit` con descripciones textuales para producir conjuntos alternativos manteniendo la identidad del personaje.
- Prototipado de personajes para proyectos derivados: usar el adaptador como referencia visual en fases de diseno de un fan game o comic no comercial, siempre que la licencia lo permita.
- Composicion de escenas multi-personaje: mezclar el LoRA con otros adaptadores de personaje de la misma familia mediante tecnicas de blending de pesos, verificando que el checkpoint base sea comun.
- Flujos img2img e inpainting: reemplazar o retocar la cara y el vestuario del personaje en imagenes existentes usando el adaptador junto con mascaras de inpainting del frontend (ComfyUI, A1111).
- Pruebas de pipeline de generacion: validar la carga de LoRAs Safetensors BF16 en un entorno de inferencia SDXL antes de desplegar adaptadores propios en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El espejo indica explicitamente que no se ha probado la calidad de imagen ni el rendimiento de generacion. No se dispone de FID, CLIP score ni metricas de similitud de personaje.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del checkpoint base SDXL, no del LoRA. Un SDXL en FP16 requiere del orden de 8-12 GB de VRAM; el LoRA anade un coste marginal inferior a 1 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM usando SDXL en FP16 y atencion optimizada; con 6 GB puede requerir cuantizacion del checkpoint base o `--medvram`.
- Opciones de despliegue: ComfyUI, Automatic1111/Forge, InvokeAI, Diffusers con `PeftModel` y `load_lora_weights`.
- Latencia y throughput: no disponibles. No se han publicado mediciones para este adaptador.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Trigger | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zuraxe/inuzuka-tsume-naruto | LoRA de personaje | SDXL / Illustrious | `tsume_renderoverse` | renderoverse-source-terms | Hugging Face, 0 descargas |
| Adaptadores LoRA de personaje en Civitai (familia Naruto) | LoRA de personaje | SDXL / Pony / Illustrious | variable | variable segun autor | Civitai |
| Checkpoint Illustrious base | Checkpoint completo | SDXL | no aplica | variable | Hugging Face, Civitai |

No se dispone de datos de rendimiento comparativo entre estos adaptadores en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere un checkpoint base Illustrious-compatible; sin el no genera imagenes.
- Contenido no apto para todas las audiencias: los metadatos describen referencias de entrenamiento con personaje desnudo.
- Licencia propietaria `renderoverse-source-terms`: el espejo no concede derechos adicionales ni relicencia el modelo; el uso comercial requiere contactar con el autor original.
- Derechos de terceros: el personaje, nombre y marcas de Naruto pertenecen a sus titulares; el adaptador no transfiere derechos sobre la propiedad intelectual.
- Calidad no verificada: el espejo no ha probado la calidad de imagen ni confirma que el entrenamiento haya finalizado.
- Sin imagenes de previsualizacion en el repositorio, lo que dificulta evaluar el resultado antes de descargar.
- Riesgo de sobreajuste o de deriva estilistica segun el peso LoRA aplicado; el valor 1.2 es solo una referencia del autor.
- Sin descargas ni validacion comunitaria en el momento de la consulta.
- No disponible informacion sobre sesgos, idiomas de prompt ni limites de contexto (no aplican en un modelo text-to-image).

## Enlaces

- Hugging Face: https://huggingface.co/zuraxe/inuzuka-tsume-naruto
- Lanzamiento original en Renderoverse: https://renderoverse.com/model/tsume-renderoverse
- Plataforma Renderoverse: https://renderoverse.com/
