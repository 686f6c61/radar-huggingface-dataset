# zuraxe/drasna-pokemon

## Resumen

Drasna - Pokemon es un adaptador LoRA de personaje para modelos de difusion de texto a imagen, publicado por el usuario zuraxe en Hugging Face como espejo de la version 1.0.0 original del estudio NSFWstudio, distribuida a traves de Renderoverse. No se trata de un modelo autonomo, sino de un adaptador que debe cargarse sobre un checkpoint base de la familia SDXL; la metadata embebida identifica como base AnyIllustrious XL v011 / SDXL. El repositorio ocupa 0,2 GB y contiene un unico archivo safetensors de 185.719.296 bytes.

El proposito del modelo es reproducir el personaje Drasna (personaje de la franquicia Pokemon) en generaciones de imagen, junto con su atuendo, mediante dos tokens de activacion documentados: `drasna_renderoverse` para el personaje y `Drasnaoutfit` para la indumentaria. Es relevante para desarrolladores e investigadores que trabajen con pipelines de generacion de imagen basados en SDXL y necesiten un adaptador ligero y de licencia permisiva para integrar un personaje concreto en flujos de ComfyUI u otras interfaces compatibles con LoRA.

La ficha se limita a los datos publicados en el repositorio y en la model card. No se han publicado resultados de benchmarks, evaluaciones de calidad de imagen ni especificaciones de entrenamiento mas alla de lo indicado, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre checkpoint SDXL; base identificada como AnyIllustrious XL v011 / SDXL |
| Parametros totales | no disponible (adaptador; el archivo pesa 185.719.296 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible; se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del checkpoint base) |
| Licencia | MIT |
| Formato de pesos | safetensors (`drasna-renderoverse.safetensors`) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del checkpoint base para modificar su comportamiento generativo sin reentrenar los pesos completos. La model card indica que la metadata embebida identifica la base como AnyIllustrious XL v011 / SDXL, una variante de la familia SDXL orientada a la generacion de personajes e ilustracion. El adaptador define dos tokens de activacion: `drasna_renderoverse` para el personaje y `Drasnaoutfit` para el atuendo.

No se especifican en la informacion disponible el numero de pasos de entrenamiento, el volumen del dataset, la composicion de las imagenes ni si se aplicaron tecnicas de regularizacion o captions detallados. La model card menciona que la metadata describe imagenes de entrenamiento con y sin ropa, motivo por el que el repositorio se marca como no apto para todas las audiencias. Tampoco se documentan innovaciones tecnicas adicionales (por ejemplo, decodificacion especulativa o atencion lineal), ya que no aplican a este tipo de adaptador.

## Capacidades

- Generacion de imagenes de texto a imagen del personaje Drasna mediante el token `drasna_renderoverse`.
- Control del atuendo del personaje mediante el token `Drasnaoutfit`.
- Integracion como LoRA en pipelines SDXL compatibles, incluido ComfyUI mediante el nodo Load LoRA.
- Ajuste de intensidad (strength) del adaptador para modular la influencia sobre el checkpoint base.
- Compatibilidad con prompts en lenguaje natural procesados por el codificador de texto del modelo base.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es exclusivamente un modelo de generacion de imagen.
- No se documentan capacidades multilingues propias; dependen del checkpoint base.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Ilustracion de personajes para proyectos de fan art: el adaptador permite generar variaciones del personaje Drasna con el token `drasna_renderoverse` sobre un checkpoint SDXL, lo que facilita producir material grafico coherente con el diseno del personaje sin entrenar un modelo desde cero.
- Creacion de assets para videojuegos o mods: al ser un LoRA ligero (0,2 GB), se puede cargar y descargar rapidamente en pipelines de generacion por lotes para producir retratos o sprites de referencia del personaje.
- Prototipado rapido en ComfyUI: colocando el archivo en `ComfyUI/models/loras` y usando un nodo Load LoRA con un checkpoint SDXL compatible, se pueden iterar prompts y strengths para explorar variaciones visuales en minutos.
- Generacion de material para narrativa visual o comics: combinando el token de personaje y el de atuendo se pueden mantener consistencia de identidad y vestuario entre viñetas de una misma historia.
- Experimentacion academica con adaptadores LoRA: el repositorio sirve como ejemplo de adaptador de personaje con licencia MIT y metadata embebida, util para estudiar tecnicas de personalizacion en modelos de difusion.
- Integracion en aplicaciones de generacion de imagen bajo demanda: al tener licencia MIT y un unico archivo safetensors, se puede empaquetar en servicios que generen imagenes tematicas siempre que se respeten los derechos de terceros sobre el personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se incluye ninguna evaluacion de calidad de imagen ni benchmark con este espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del checkpoint base SDXL, no del adaptador. Un SDXL en precision fp16 requiere aproximadamente 10-12 GB de VRAM para generar a 1024x1024; el LoRA anade una sobrecarga minima (del orden de cientos de MB).
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100 para inferencia comoda en fp16; GPUs con 8 GB pueden funcionar con optimizaciones o cuantizacion del checkpoint base.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas VRAM, siempre que el checkpoint base se cargue con optimizaciones (por ejemplo, fp16 o variantes cuantizadas).
- Opciones de despliegue: ComfyUI (nodo Load LoRA), Automatic1111/Forge, Diffusers con `load_lora_weights`, y otros frontends compatibles con LoRA SDXL. No aplica vLLM, llama.cpp ni Ollama, que son para modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; dependen del checkpoint base, la GPU y la resolucion.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Drasna - Pokemon (zuraxe/NSFWstudio) | LoRA de personaje | AnyIllustrious XL v011 / SDXL | 185.719.296 bytes | MIT | Hugging Face y Renderoverse |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL | variable | variable | no disponible |
| Checkpoint SDXL completo | Modelo base | SDXL | varios GB | variable | no disponible |

No se dispone de datos de rendimiento ni de evaluaciones comparativas con otros adaptadores de personaje en la informacion proporcionada, por lo que la comparativa se limita a aspectos de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere un checkpoint base SDXL compatible; sin el, el archivo no produce imagenes.
- Los resultados dependen del checkpoint base, del prompt y de los ajustes (strength, sampler, steps); no hay garantia de calidad uniforme.
- La model card advierte que la metadata describe imagenes de entrenamiento con y sin ropa, por lo que el repositorio esta marcado como no apto para todas las audiencias.
- La licencia MIT cubre el adaptador, pero no otorga derechos sobre personajes, nombres o marcas de terceros; no es un lanzamiento oficial de los titulares de derechos de Pokemon.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusion: puede generar representaciones inexactas del personaje o del atuendo.
- No se documentan limitaciones de idioma ni de contexto, ya que no aplican a un modelo de imagen.
- Para uso comercial, es necesario conservar el credito del autor original (NSFWstudio) y las notas de licencia al redistribuir, y verificar de forma independiente los derechos sobre el personaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/zuraxe/drasna-pokemon
- Listado original en Renderoverse: https://renderoverse.com/model/drasna-pokemon
- Renderoverse (sitio del estudio): https://renderoverse.com/
