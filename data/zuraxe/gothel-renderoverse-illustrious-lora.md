# zuraxe/gothel-renderoverse-illustrious-lora

## Resumen

Gothel — Renderoverse es un LoRA de personaje para modelos de difusion de la familia SDXL, concretamente disenado para checkpoints basados en Illustrious XL (el metadato embebido identifica AnyIllustrious XL v011 / SDXL como base). Lo desarrolla NSFWstudio y lo distribuye a traves de la plataforma Renderoverse; este repositorio de Hugging Face es un espejo de los pesos gratuitos de la version 1.0.0, sin modificacion del archivo original. El adaptador reproduce el personaje de Mother Gothel (Rapunzel) con un token de activacion dedicado y un token separado para el vestuario.

No es un modelo autonomo: es un adaptador de bajo rango (LoRA) que se carga sobre un checkpoint SDXL/Illustrious y modifica el comportamiento del UNet y del text encoder para inducir la apariencia del personaje. Su relevancia es de nicho: sirve a quienes generan imagenes con pipelines SDXL y necesitan consistencia de personaje sin reentrenar un modelo completo, con un coste de almacenamiento de unos 185 MB y sin requisitos adicionales de VRAM mas alla del checkpoint base.

El repositorio esta marcado como no apto para todas las audiencias porque los metadatos embebidos describen imagenes de entrenamiento con y sin ropa. La licencia declarada es MIT, aunque esa licencia no cubre derechos sobre el personaje ni marcas de terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet y text encoder de SDXL / Illustrious XL |
| Parametros totales | no disponible (adaptador; el checkpoint base SDXL no se incluye) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica a difusion text-to-image; la ventana practica la fija el limite de tokens del text encoder del checkpoint base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la cuantizacion aplica al checkpoint base, no al adaptador) |
| Idiomas soportados | no disponible (los prompts dependen del text encoder del checkpoint base, tipicamente ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (185.719.296 bytes; SHA-256 `ca682fca67c033be52accc91b990c7f58dc8bbcb791673e031613329ca980c79`) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se suman a los pesos del checkpoint base. El metadato embebido identifica como base AnyIllustrious XL v011 sobre SDXL, por lo que el adaptador esta pensado para checkpoints derivados de Illustrious XL, una variante de SDXL orientada a ilustracion y estilizacion anime. El tamano del archivo (unos 185 MB) es coherente con un adaptador de rango moderado sobre un modelo SDXL, aunque el rango exacto, el alpha y los modulos objetivo no se detallan en la informacion disponible.

No se publican datos sobre el dataset de entrenamiento: ni numero de imagenes, ni composicion, ni resolucion, ni pasos de entrenamiento, ni si se aplicaron tecnicas como regularizacion por class tokens o captions automaticos. La unica indicacion es que el conjunto incluia imagenes vestidas y desnudas, lo que motivo la etiqueta de contenido no apto para todas las audiencias. Tampoco hay informacion sobre evaluacion de calidad, comparaciones con otros LoRA del mismo personaje ni metricas de fidelidad.

## Capacidades

- Generacion text-to-image condicionada por personaje: reproduce la apariencia de Mother Gothel cuando se invoca el token `gothel_renderoverse` en el prompt.
- Control de vestuario mediante un token independiente, `Gotheloutfit`, que permite cambiar la ropa del personaje sin alterar su identidad visual.
- Integracion con checkpoints SDXL/Illustrious: funciona como capa adicional sobre el modelo base, combinable con otros LoRA (estilo, poses, iluminacion) sujeto a los limites de fuerza y compatibilidad.
- Ajuste de intensidad: al ser un LoRA, la fuerza de aplicacion es configurable, lo que permite desde una influencia sutil hasta una dominante.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento: es exclusivamente un adaptador de generacion de imagen.
- No tiene capacidades multilingues propias; la comprension del prompt depende del text encoder del checkpoint base.

## Casos de uso

- Ilustracion de personaje consistente en proyectos de fan art: cargar el LoRA en ComfyUI con un checkpoint Illustrious y usar `gothel_renderoverse` para mantener el rostro y el diseno del personaje a lo largo de una serie de imagenes.
- Creacion de variaciones de vestuario: combinando `Gotheloutfit` con prompts descriptivos se pueden generar versiones alternativas del personaje sin perder identidad, util para hojas de personaje o concept art.
- Storyboards y comics amateur: generar paneles con el mismo personaje en distintas poses y escenarios, apoyandose en la consistencia que aporta el token de activacion.
- Prototipado rapido de assets para proyectos creativos: al ocupar unos 185 MB, el adaptador se puede versionar y distribuir junto al proyecto sin inflar el repositorio.
- Experimentacion con pipelines SDXL en investigacion de personalizacion: sirve como ejemplo de adaptador de personaje para estudiar el efecto de la fuerza del LoRA y la interaccion con el checkpoint base.
- Generacion de material para comunidades de fan art: el flujo tipico es descargar el safetensors, colocarlo en `ComfyUI/models/loras` y encadenar un nodo Load LoRA antes del sampler, ajustando la fuerza segun el checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que este espejo no incluye evaluacion de calidad de imagen ni metricas de ningun tipo.

## Requisitos de hardware

- VRAM: el adaptador anade una sobrecarga minima; el requisito real lo marca el checkpoint SDXL/Illustrious base. En la practica, la generacion SDXL a 1024x1024 suele necesitar entre 8 y 12 GB de VRAM en funcion de la precision y de las optimizaciones del pipeline.
- GPU recomendadas: cualquier GPU capaz de ejecutar SDXL, como RTX 3060 12 GB, RTX 4070, RTX 4090, A100 o H100. El adaptador en si no impone requisitos adicionales.
- GPU de consumo: si, cabe en GPUs de consumo que ya ejecuten SDXL; el LoRA no cambia esa ecuacion.
- Despliegue: ComfyUI (ruta indicada por el autor: `ComfyUI/models/loras` con nodo Load LoRA), Automatic1111/Forge y otros frontends compatibles con LoRA SDXL. No aplica a vLLM, llama.cpp, Ollama ni TGI, que son entornos de modelos de lenguaje.
- Latencia y throughput: no disponibles; dependen enteramente del checkpoint base, la GPU, la resolucion y el numero de pasos del sampler.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Tamano | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Gothel — Renderoverse (este) | LoRA de personaje | SDXL / Illustrious XL | ~185 MB | no aplica | MIT | Hugging Face (espejo) y Renderoverse |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL | variable (tipicamente 50-200 MB) | no aplica | variable | Civitai, Hugging Face |
| Checkpoint SDXL completo | Modelo base | SDXL | varios GB | no aplica | CreativeML OpenRAIL++-M (segun checkpoint) | Hugging Face, Stability AI |

No se dispone de datos de rendimiento ni de evaluaciones comparativas frente a otros LoRA del mismo personaje, por lo que la comparacion se limita a categoria, formato y licencia.

## Limitaciones y advertencias

- Contenido no apto para todas las audiencias: los metadatos describen imagenes de entrenamiento con y sin ropa; el repositorio esta marcado en consecuencia.
- Derechos de terceros: la licencia MIT no concede derechos sobre el personaje, su nombre ni marcas asociadas; no es un lanzamiento oficial de los titulares de esos derechos.
- Dependencia del checkpoint base: los resultados varian segun el checkpoint, el prompt y los ajustes; el autor no garantiza calidad ni consistencia fuera de la base declarada.
- Ausencia de evaluacion: no hay benchmarks, ni estudios de sesgo, ni analisis de fidelidad del personaje.
- Riesgo de sobreajuste o artefactos: como cualquier LoRA, fuerzas altas pueden degradar la imagen o romper el estilo del checkpoint base.
- Idiomas: no se declaran idiomas soportados; los prompts efectivos dependen del text encoder del checkpoint base, habitualmente entrenado en ingles.
- Uso comercial: la licencia MIT del adaptador no resuelve la cuestion de derechos de imagen del personaje; conviene revisar la normativa aplicable antes de explotarlo comercialmente.
- Repositorio con cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zuraxe/gothel-renderoverse-illustrious-lora
- Listado original en Renderoverse: https://renderoverse.com/model/mother-gothel-rapunzel
- Plataforma Renderoverse: https://renderoverse.com/
- Documentacion de ComfyUI (nodos LoRA): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
