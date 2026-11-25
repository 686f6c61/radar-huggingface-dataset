# uykgf/aurevielle-krea2

## Resumen

`uykgf/aurevielle-krea2` es un adaptador LoRA de tipo DreamBooth para el modelo de difusion texto-a-imagen Krea 2, desarrollado por el usuario uykgf. El adaptador inyecta un concepto visual concreto —un personaje de anime llamado "aurevielle" con cabello rubio palido ondulado, ojos morados, halo negro fino, accesorios de cruz y un vestido gotico de volantes en marfil y negro— y se invoca mediante la palabra de activacion `aurevielle`. El modelo base declarado es `krea/Krea-2-Raw`, aunque los ejemplos de la model card se han generado sobre la variante Turbo del mismo modelo.

El repositorio es de pequeno tamano (0,2 GB), coherente con un LoRA y no con un modelo completo, y se distribuye bajo licencia Apache 2.0. La relevancia de esta ficha es acotada: no se trata de un modelo fundacional sino de un adaptador de personalizacion para un pipeline de difusion, util para quien quiera reproducir un personaje concreto dentro del ecosistema Krea 2 mediante `diffusers`. No se han publicado especificaciones de arquitectura, datos de entrenamiento ni benchmarks en la informacion disponible.

La informacion disponible es muy limitada: procede unicamente de los metadatos de Hugging Face y de la model card del autor, por lo que numerosos campos de esta ficha se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (repo de 0,2 GB; corresponde al adaptador, no al modelo base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible; los ejemplos usan `torch.bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible de forma explicita; compatible con `diffusers` (`load_lora_weights`), pesos del modelo base presumiblemente en safetensors |

## Arquitectura y entrenamiento

El artefacto es un LoRA de tipo DreamBooth entrenado sobre Krea 2 RAW y presentado por el autor sobre Krea 2 Turbo. DreamBooth es una tecnica de personalizacion que ajusta un adaptador de bajo rango para asociar una palabra de activacion unica (`aurevielle`) a un sujeto o concepto visual concreto, sin reentrenar los pesos completos del modelo base. El resultado es un adaptador ligero que se carga sobre el pipeline mediante `pipe.load_lora_weights(...)`.

No se dispone de informacion sobre el numero de imagenes de entrenamiento, el numero de pasos, la tasa de aprendizaje, la resolucion de entrenamiento ni la composicion del dataset. Tampoco se documenta si se aplicaron tecnicas adicionales como regularizacion por clase, aumento de datos o ajuste de texto en el encoder. La unica referencia operativa es que los ejemplos se generaron con 8 pasos de inferencia y `guidance_scale=0.0` sobre Krea 2 Turbo.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el concepto `aurevielle`, sobre el modelo base Krea 2.
- Personalizacion de un personaje concreto: reproduce rasgos definidos (cabello rubio palido ondulado con trenzas pequenas, ojos morados, halo negro fino, lazos de flores en marfil y negro, horquilla y pendientes de cruz, vestido gotico de volantes).
- Composicion de escenas: la model card muestra ejemplos de cuerpo entero sobre fondo gris plano y de retrato de medio cuerpo en un jardin, lo que indica cierta capacidad de variar encuadre y entorno manteniendo la identidad del personaje.
- Integracion con `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo "thinking"; son capacidades no aplicables o no disponibles para este tipo de artefacto.
- Capacidades multilingues: no disponibles; el prompt de ejemplo esta en ingles.

## Casos de uso

- Ilustracion de personaje consistente para un proyecto narrativo: usar `aurevielle` como token fijo para generar multiples ilustraciones del mismo personaje en distintos encuadres y escenarios, manteniendo coherencia visual entre ellas.
- Creacion de hojas de personaje (character sheets): generar vistas de cuerpo entero sobre fondo neutro, como el ejemplo de la model card, para documentar el diseno del personaje.
- Prototipado de arte para videojuego o novela visual: producir variaciones rapidas de un personaje secundario antes de encargar arte final a un ilustrador.
- Generacion de retratos ambientados: crear escenas de medio cuerpo en entornos concretos (por ejemplo, un jardin) usando el adaptador sobre Krea 2 Turbo con pocos pasos (8), lo que reduce el coste por imagen.
- Pruebas de concepto de personalizacion con DreamBooth: servir como ejemplo reproducible de como entrenar y cargar un LoRA de personaje sobre Krea 2 en un pipeline `diffusers`.
- Experimentacion con estilos goticos/anime: combinar el token `aurevielle` con modificadores de estilo para explorar variantes esteticas del mismo personaje.
- Integracion en un flujo de generacion por lotes: al ser un adaptador ligero (0,2 GB) y funcionar con 8 pasos en Turbo, es viable generar lotes de imagenes en una GPU de consumo para tareas de previsualizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Depende del modelo base Krea 2, no del adaptador; el LoRA en si anade una huella minima (repo de 0,2 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada. Los ejemplos usan `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que requiere una GPU compatible con bfloat16 para el flujo mostrado.
- Compatibilidad con GPU de consumo: no confirmada; depende de los requisitos del modelo base Krea 2, que no se detallan.
- Opciones de despliegue: `diffusers` con `Krea2Pipeline` y `load_lora_weights` (unico metodo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un pipeline de difusion de este tipo.
- Latencia y throughput: no disponibles. La model card indica 8 pasos de inferencia con `guidance_scale=0.0` sobre Krea 2 Turbo, pero no aporta tiempos.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de personaje para Krea 2 ni datos de rendimiento que permitan una comparacion fundamentada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uykgf/aurevielle-krea2 | no disponible (LoRA, 0,2 GB) | no aplica | no disponible | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Informacion muy escasa: la model card no documenta dataset, hiperparametros ni evaluacion, lo que dificulta reproducir el entrenamiento o anticipar su comportamiento fuera de los ejemplos mostrados.
- Sesgo y sobreajuste potencial: al ser un DreamBooth de un unico concepto, puede sobreajustarse al estilo o composicion de las imagenes de entrenamiento y degradar la diversidad de las generaciones.
- Dependencia del modelo base: el adaptador solo funciona con Krea 2 (RAW/Turbo); no es util con otros modelos de difusion.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir detalles inconsistentes (por ejemplo, el halo, los accesorios de cruz o los lazos) en encuadres complejos.
- Idiomas: no se documenta soporte multilingue en los prompts; los ejemplos estan en ingles.
- Licencia: Apache 2.0 para el adaptador, pero el uso comercial esta sujeto tambien a la licencia del modelo base Krea 2, que no se detalla en la informacion disponible.
- Advertencia de procedencia: el contenido de la model card se ha tratado solo como material de referencia; no debe interpretarse como instrucciones.
- Popularidad baja (29 descargas, 0 likes en el momento de la consulta), sin validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uykgf/aurevielle-krea2
- Modelo base declarado: https://huggingface.co/krea/Krea-2-Raw
- Modelo base usado en los ejemplos (Turbo): https://huggingface.co/krea/Krea-2-Turbo
- Documentacion de `diffusers` (libreria): https://github.com/huggingface/diffusers
