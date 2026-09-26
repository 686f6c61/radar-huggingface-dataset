# theavikb/cdn3-hf

## Resumen

`theavikb/cdn3-hf` es un adaptador LoRA de tipo DreamBooth publicado por el usuario theavikb para el modelo de generacion de imagenes Krea 2. Segun su model card, se entreno sobre la variante Krea 2 RAW (`krea/Krea-2-Raw`) y sus muestras de ejemplo se generaron con Krea 2 Turbo en 8 pasos de inferencia. El adaptador inyecta un concepto visual concreto que se invoca con el token de activacion `cdn3 woman`, lo que permite generar representaciones consistentes de una identidad femenina en escenarios muy distintos (espacio, campo, ciberpunk).

El problema que resuelve es el clasico de personalizacion en modelos de difusion: fijar una identidad, una persona o un estilo concreto sin necesidad de reentrenar el modelo base completo. Al tratarse de un LoRA, el peso anadido es pequeno (el repositorio ocupa 1,0 GB) y se carga sobre el modelo base con `load_lora_weights` a traves de la libreria `diffusers`.

Es relevante ahora porque ejemplifica el flujo estandar de personalizacion ligera sobre la familia Krea 2, que combina un modelo base (RAW) con una variante destilada para pocos pasos (Turbo). La licencia es Apache-2.0 y el pipeline declarado es `text-to-image`. No obstante, conviene senalar que el repositorio tiene un volumen de uso muy bajo (3 descargas y 0 likes), por lo que no existe validacion independiente de su calidad o estabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un modelo de difusion; arquitectura del modelo base Krea 2 no disponible |
| Parametros totales | No disponible (adaptador LoRA; tamano del repositorio 1,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (generacion de imagen a partir de prompt de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; los prompts de ejemplo de la model card estan en ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | No disponible; adaptador compatible con `diffusers` (`load_lora_weights`) |
| Modelo base | `krea/Krea-2-Raw` (inferencia de muestra sobre `krea/Krea-2-Turbo`) |
| Token de activacion | `cdn3 woman` |
| Pipeline | `text-to-image` |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del LoRA ni la del modelo base Krea 2. Por los datos de la model card se sabe que es un adaptador de bajo rango (LoRA) obtenido mediante entrenamiento DreamBooth sobre el modelo Krea 2 RAW. El metodo DreamBooth con LoRA consiste en congelar el modelo base y entrenar unicamente matrices de bajo rango que asocian un token de activacion (`cdn3 woman`) con el concepto visual objetivo, lo que reduce drasticamente los requisitos de memoria frente a un ajuste fino completo.

La model card indica que las muestras incluidas se generaron cargando el LoRA sobre Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere que el adaptador puede emplearse tanto sobre la variante RAW como sobre la variante Turbo destilada para pocos pasos. No se especifican el numero de imagenes de entrenamiento, la composicion del dataset, si se aplicaron tecnicas de regularizacion (por ejemplo, priors de clase), la resolucion de entrenamiento, la tasa de aprendizaje ni si hubo etapas de refinamiento tipo RLHF o DPO. Todos estos datos figuran como no disponibles.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por un token de identidad (`cdn3 woman`).
- Personalizacion de identidad: mantiene un sujeto femenino consistente a traves de distintos escenarios y estilos (espacio, campo, ciberpunk) segun los ejemplos publicados.
- Compatibilidad con la variante destilada Krea 2 Turbo, lo que permite inferencia en pocos pasos (8 pasos en los ejemplos).
- Integracion nativa con la libreria `diffusers` mediante `Krea2Pipeline` y `load_lora_weights`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto. Es exclusivamente un adaptador de generacion de imagen.

## Casos de uso

- Ilustracion de personajes recurrentes: al fijar la identidad con `cdn3 woman`, se puede mantener un mismo personaje en una serie de ilustraciones o capitulos, algo util para comics, storyboards y contenido editorial seriado.
- Prototipado de direccion de arte: generar rapidamente variaciones de un mismo personaje en localizaciones y paletas distintas (espacio, campo, ciberpunk) para explorar un concepto visual antes de produccion.
- Contenido para redes sociales: produccion de imagenes tematicas consistentes de un personaje ficticio con una identidad estable a lo largo de una campana.
- Maquetas para videojuegos o animacion: generacion de referencias visuales de un mismo personaje en multiples entornos para ilustrar hojas de personaje o moodboards.
- Pruebas de personalizacion sobre Krea 2: sirve como ejemplo funcional para equipos que quieran validar el flujo DreamBooth-LoRA sobre la familia Krea 2 antes de entrenar sus propios adaptadores.
- Generacion de material de marketing con modelo fijo: uso de un personaje de marca recurrente en piezas graficas manteniendo la coherencia visual entre entregas.
- Investigacion sobre transferencia de estilos e identidades: al ser un LoRA pequeno y de licencia Apache-2.0, es util como banco de pruebas academico para estudiar la invariancia de identidad en modelos de difusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de identidad, etc.) ni comparaciones numericas con otros adaptadores.

## Requisitos de hardware

- No se proporcionan requisitos de hardware especificos en la informacion disponible.
- Al ser un adaptador LoRA, la VRAM necesaria la determina casi por completo el modelo base Krea 2 (RAW o Turbo), no el propio adaptador, cuyo repositorio ocupa 1,0 GB.
- VRAM estimada para inferencia: no disponible para Krea 2 en concreto. Como referencia general para modelos de difusion de gama similar, la inferencia en precision de 16 bits suele moverse en el rango de 8 a 16 GB, pero esta cifra es orientativa y no esta confirmada para este modelo.
- GPU recomendadas: no disponible. No se documenta compatibilidad ni rendimiento sobre A100, H100, RTX 4090 ni otras GPU concretas.
- Viabilidad en GPU de consumo: no confirmada; dependera de los requisitos del modelo base Krea 2, no del LoRA.
- Opciones de despliegue: la model card solo documenta el uso mediante `diffusers` con `Krea2Pipeline`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje y no aplicables a este caso).
- Latencia y throughput: no disponibles. El unico dato indirecto es que los ejemplos se generaron con Krea 2 Turbo en 8 pasos de inferencia.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores LoRA comparables para Krea 2 ni sobre metricas que permitan una comparacion cuantitativa. A continuacion se comparan enfoques generales de personalizacion de modelos de difusion, sin datos de rendimiento de este adaptador concreto.

| Enfoque | Que modifica | Tamano aproximado | Licencia / disponibilidad | Observaciones |
|---|---|---|---|---|
| cdn3-hf (este modelo) | LoRA DreamBooth sobre Krea 2 RAW | Repositorio de 1,0 GB | Apache-2.0; 3 descargas | Requiere el modelo base Krea 2; sin benchmarks publicados |
| DreamBooth completo | Todos los pesos del modelo base | Del orden del modelo base completo | Depende del modelo base | Mayor coste de entrenamiento y almacenamiento |
| Textual inversion | Solo un embedding de texto | Muy pequeno (kilobytes) | Depende del modelo base | Menor fidelidad de identidad que un LoRA DreamBooth |
| Otros LoRA para Krea 2 | Matrices de bajo rango | Variable | No disponible | No se dispone de datos de adaptadores equivalentes |

## Limitaciones y advertencias

- Volumen de uso minimo (3 descargas y 0 likes), sin validacion independiente por parte de la comunidad.
- Ausencia total de benchmarks y de metricas de calidad, fidelidad de identidad o estabilidad.
- La model card no documenta el dataset de entrenamiento, por lo que no puede evaluarse el sesgo ni la representatividad de las imagenes empleadas.
- Riesgo de sobreajuste al concepto entrenado y de degradacion cuando el prompt se aleja de los escenarios de ejemplo.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomias incorrectas, artefactos o incoherencias con el prompt.
- Dependencia obligatoria del modelo base Krea 2 (RAW o Turbo); el adaptador no es util por si solo.
- Idiomas: no se especifica soporte multilingue; los prompts de ejemplo estan en ingles y el comportamiento con prompts en castellano no esta documentado.
- Licencia Apache-2.0, lo que en principio permite uso comercial del adaptador, pero el uso comercial esta igualmente condicionado por la licencia y los terminos del modelo base Krea 2, que no se detallan aqui.
- No se especifican limitaciones de resolucion, relacion de aspecto ni numero maximo de pasos de inferencia.
- Para produccion, se recomienda validar manualmente la calidad y la consistencia de identidad antes de integrarlo en cualquier flujo automatizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theavikb/cdn3-hf
- Modelo base Krea 2 RAW: https://huggingface.co/krea/Krea-2-Raw
- Variante Krea 2 Turbo (usada en las muestras): https://huggingface.co/krea/Krea-2-Turbo
- Paper o documentacion tecnica: no disponible
- Repositorio de codigo adicional: no disponible
- Demo interactiva: no disponible
