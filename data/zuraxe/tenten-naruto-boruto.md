# zuraxe/tenten-naruto-boruto

## Resumen

Tenten - Naruto/Boruto es un adaptador LoRA de personaje para modelos de difusion de la familia SDXL, concretamente entrenado sobre la base AnyIllustrious XL v011, un fine-tune orientado a ilustracion y estetica anime. Lo desarrolla NSFWstudio y lo distribuye a traves de la plataforma Renderoverse; el repositorio de Hugging Face bajo el identificador `zuraxe/tenten-naruto-boruto` es un espejo que preserva los pesos originales de la version 1.0.0 sin modificarlos.

El modelo resuelve un problema muy concreto: reproducir de forma consistente el personaje Tenten del universo Naruto/Boruto en generacion text-to-image, con un token de activacion dedicado (`tenten_renderoverse`) y un token secundario para el vestuario (`Tentenoutfit`). No es un checkpoint autonomo, sino un adaptador que debe cargarse sobre un modelo base SDXL compatible.

Es relevante para quienes trabajan con pipelines de difusion para ilustracion y necesitan personajes secundarios con identidad visual estable. El repositorio ocupa 0,2 GB y el unico artefacto es un fichero safetensors de 185.719.320 bytes. No se han publicado benchmarks ni evaluaciones de calidad de imagen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre SDXL / AnyIllustrious XL v011 |
| Parametros totales | no disponible (adaptador LoRA; el fichero pesa 185.719.320 bytes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image) |
| Tipos de cuantizacion | no disponible (se distribuye en safetensors; la cuantizacion depende del checkpoint base) |
| Idiomas soportados | no disponible (los prompts dependen del text encoder del modelo base) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base para modificar su comportamiento sin reentrenar los pesos completos. El metadata embebido identifica la base como AnyIllustrious XL v011 / SDXL, por lo que el adaptador esta pensado para checkpoints de la familia SDXL compatibles con esa linea de fine-tunes.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, la composicion del dataset, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas de regularizacion. La model card unicamente indica que el metadata interno describe imagenes de entrenamiento con y sin ropa, motivo por el cual el repositorio se marca como no apto para todas las audiencias. No se documenta ningun proceso de RLHF, DPO ni innovacion tecnica adicional.

## Capacidades

- Generacion de imagenes del personaje Tenten (Naruto/Boruto) mediante el token de activacion `tenten_renderoverse`.
- Control del vestuario mediante el token secundario `Tentenoutfit`.
- Integracion como adaptador en pipelines text-to-image basados en SDXL, incluyendo ComfyUI mediante el nodo Load LoRA.
- Ajuste de intensidad (strength) del LoRA para modular la fidelidad al personaje frente a la estetica del checkpoint base.
- Compatibilidad con checkpoints SDXL de la familia Illustrious y derivados, segun la metadata del adaptador.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo thinking: es exclusivamente un adaptador de generacion de imagenes.

## Casos de uso

- Ilustracion de fan art: cargar el LoRA sobre un checkpoint Illustrious XL y generar escenas de Tenten con el token `tenten_renderoverse`, ajustando el strength para mantener el estilo del artista.
- Creacion de personajes secundarios en proyectos de comic o novela ligera: el adaptador permite mantener una identidad visual coherente del personaje a lo largo de multiples ilustraciones dentro de un mismo proyecto.
- Prototipado rapido de assets para videojuegos o mods: generar variaciones de vestuario con `Tentenoutfit` para explorar disenos antes de modelado 3D o ilustracion final.
- Pruebas de comparacion de checkpoints: al ser un LoRA ligero (185 MB), permite evaluar como distintos fine-tunes SDXL interpretan el mismo personaje sin reentrenar nada.
- Generacion por lotes en ComfyUI: integrar el adaptador en un grafo con Load LoRA y un sampler configurado para producir series de imagenes con el personaje en distintos encuadres y poses.
- Experimentacion con tecnicas de composicion (ControlNet, IP-Adapter): el LoRA se puede combinar con otros adaptadores SDXL para fijar pose o composicion manteniendo la identidad del personaje.
- Docencia o demostraciones sobre LoRA: su tamano reducido y su licencia MIT lo hacen util como ejemplo practico de adaptadores de personaje en cursos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se suministra ninguna evaluacion de calidad de imagen con este espejo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende enteramente del checkpoint base SDXL. Un SDXL en fp16 requiere del orden de 8-10 GB de VRAM; el LoRA anade una sobrecarga minima (fichero de 185 MB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100 para el checkpoint base; el adaptador en si no impone requisitos adicionales.
- Cabe en GPU de consumo: si, siempre que el checkpoint base SDXL quepa. Con cuantizacion del base (por ejemplo fp8 o GGUF) puede ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: ComfyUI (nodo Load LoRA), Automatic1111/Forge, Diffusers con `load_lora_weights`, y cualquier runtime que soporte LoRA sobre SDXL.
- Latencia y throughput estimados: no disponibles; dependen del checkpoint base, la GPU y los pasos de muestreo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tokens de activacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tenten - Naruto/Boruto (este) | LoRA de personaje | AnyIllustrious XL v011 / SDXL | `tenten_renderoverse`, `Tentenoutfit` | MIT | Hugging Face (espejo) y Renderoverse |
| LoRA de personaje en Civitai (categoria generica) | LoRA de personaje | SDXL / Illustrious | variable | variable segun autor | Civitai |
| Checkpoint SDXL completo | Checkpoint | SDXL | no aplica | CreativeML Open RAIL++-M | Hugging Face, Stability AI |

No se dispone de datos de benchmarks ni de modelos comparables concretos identificados en la informacion proporcionada; la comparativa se limita a la categoria y al tipo de artefacto.

## Limitaciones y advertencias

- Es un adaptador, no un checkpoint autonomo: requiere un modelo base SDXL compatible y no funciona por si solo.
- La calidad y fidelidad del personaje dependen del checkpoint base, del prompt y de los ajustes de muestreo; no hay evaluacion publicada que garantice resultados.
- El metadata interno describe imagenes de entrenamiento con y sin ropa, por lo que el repositorio esta marcado como no apto para todas las audiencias.
- La licencia MIT cubre el artefacto del LoRA, pero no otorga derechos sobre el personaje, nombres o marcas de terceros (Naruto/Boruto y sus titulares). El uso comercial del personaje puede requerir autorizacion adicional.
- Riesgo de sesgos y alucinaciones visuales: al ser un LoRA de personaje, puede generar atributos inconsistentes del personaje o mezclas no deseadas con el estilo del checkpoint base.
- No hay informacion sobre idiomas de los prompts; el text encoder del base condiciona el soporte multilingue.
- El repositorio es un espejo no oficial de la release original de Renderoverse; conviene conservar el credito al autor original (NSFWstudio) al redistribuir.
- No se documentan limitaciones de contexto ni de resolucion mas alla de las del checkpoint base SDXL.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zuraxe/tenten-naruto-boruto
- Release original en Renderoverse: https://renderoverse.com/model/tenten-naruto-boruto
- Renderoverse (plataforma): https://renderoverse.com/
- AnyIllustrious XL v011 (modelo base referenciado en metadata): no disponible
