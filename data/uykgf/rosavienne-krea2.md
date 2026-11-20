# uykgf/rosavienne-krea2

## Resumen

`uykgf/rosavienne-krea2` es un adaptador LoRA de tipo DreamBooth para el modelo de generación de imágenes Krea 2, desarrollado por el usuario uykgf. El LoRA se entrenó sobre el checkpoint base `krea/Krea-2-Raw` y está pensado para invocarse sobre la variante Turbo (`krea/Krea-2-Turbo`), según indica el autor en la model card. Su función es introducir un concepto visual concreto, activado mediante el token `rosavienne`, que corresponde a un personaje de estilo anime con rasgos muy definidos (pelo largo ondulado rosa, ojos rosas, halo oscuro fino, boina negra con insignia de rosa, pendientes de cruz y chaqueta negra oversize con ribete rosa).

El repositorio es de tamaño reducido (0,2 GB), coherente con un adaptador LoRA y no con un modelo completo, y se distribuye bajo licencia Apache 2.0. Está etiquetado con `diffusers`, `text-to-image`, `lora` y `template:sd-lora`, y declara como modelo base `krea/Krea-2-Raw` con adaptador sobre el mismo. El pipeline declarado es `text-to-image`.

La relevancia de esta ficha es acotada: no se trata de un modelo fundacional sino de un artefacto de personalización (un LoRA de personaje) que solo resulta útil en combinación con los pesos de Krea 2. No hay información pública sobre el dataset de entrenamiento, el número de pasos, el learning rate ni métricas de evaluación. A fecha de la información disponible, el repositorio registra 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión text-to-image; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (tamaño del repo: 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolución nativa no disponible |
| Tipos de cuantizacion | no disponible (el ejemplo de uso emplea `torch_dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con `diffusers` (carga vía `load_lora_weights`); formato de fichero concreto no disponible |

## Arquitectura y entrenamiento

El artefacto es un LoRA de tipo DreamBooth, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del modelo base de difusión para adaptar su comportamiento a un concepto concreto sin reentrenar los pesos completos. El modelo base declarado es `krea/Krea-2-Raw`, y el autor indica que las muestras se generaron aplicando el LoRA sobre `krea/Krea-2-Turbo` con 8 pasos de inferencia y `guidance_scale=0.0`, lo que sugiere que el LoRA es compatible con la variante Turbo destilada para pocos pasos.

No se dispone de información sobre el número de imágenes de entrenamiento, la resolución, el número de pasos, la tasa de aprendizaje, el rango del LoRA ni si se aplicaron técnicas adicionales (regularización, captioning automático, etc.). Tampoco se documenta si el entrenamiento usó RLHF/DPO (no aplicable en generación de imágenes en el sentido habitual) ni innovaciones técnicas destacables. La única información operativa es el token de activación (`rosavienne`) y dos prompts de ejemplo que describen el personaje con detalle.

## Capacidades

- Generación de imágenes text-to-image condicionada por el token `rosavienne`, que activa el concepto del personaje.
- Reproducción consistente de rasgos del personaje: pelo largo ondulado rosa, ojos rosas, halo oscuro fino, boina negra con insignia de rosa, pinzas de pelo negras, pendientes de cruz, chaqueta negra oversize con ribete rosa, camisa blanca, corbata de cruz rosa, cinturones y cadenas.
- Composición de escenas: los ejemplos incluyen ilustración de cuerpo completo sobre fondo gris liso y retrato de medio cuerpo en una biblioteca, lo que indica capacidad de integrar el personaje en distintos encuadres y entornos.
- Compatibilidad con la variante Turbo del modelo base en 8 pasos de inferencia con `guidance_scale=0.0`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo; son capacidades no aplicables o no disponibles para este artefacto.

## Casos de uso

- Ilustración de personaje consistente para proyectos de ficción: usar el token `rosavienne` junto con descripciones de escena para generar variaciones del personaje manteniendo sus rasgos distintivos (pelo, halo, vestuario) en distintos encuadres.
- Creación de hojas de personaje (character sheets): generar vistas de cuerpo completo sobre fondo neutro, como en el ejemplo del autor, para documentar el diseño del personaje.
- Prototipado rápido de arte conceptual en pipelines de `diffusers`: cargar el LoRA sobre `Krea-2-Turbo` y generar imágenes en 8 pasos, lo que reduce el coste por iteración en fases de exploración visual.
- Integración en herramientas de generación por lotes: al ser un LoRA ligero (0,2 GB), puede cargarse y descargarse dinámicamente sobre el pipeline base para alternar entre conceptos sin duplicar pesos completos.
- Generación de ilustraciones para contenido narrativo (fan art, webcómic, material promocional) donde se requiera coherencia visual del personaje entre viñetas o piezas.
- Experimentación académica o docente sobre personalización con DreamBooth: sirve como ejemplo reproducible de adaptación de bajo rango sobre un modelo de difusión moderno, con prompts de referencia documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en sí ocupa 0,2 GB, pero la inferencia requiere cargar el modelo base completo (`krea/Krea-2-Turbo`), cuyos requisitos de VRAM no están documentados en la información disponible.
- El ejemplo oficial usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica una GPU con soporte de bfloat16 (Ampere o posterior: A100, H100, RTX 30xx/40xx).
- No se dispone de datos sobre si el modelo base cabe en GPU de consumo; depende del tamaño del checkpoint de Krea 2, no especificado.
- Opciones de despliegue: `diffusers` (única vía documentada, con `Krea2Pipeline` y `load_lora_weights`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no aplicables aquí).
- Latencia y throughput: no disponibles. El autor indica 8 pasos de inferencia en la variante Turbo, pero no aporta tiempos.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros LoRA de personaje comparables ni métricas del modelo base que permitan una comparación rigurosa.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uykgf/rosavienne-krea2 | no disponible (LoRA, 0,2 GB) | no aplica | sin benchmarks | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Artefacto dependiente del modelo base: sin `krea/Krea-2-Raw` o `krea/Krea-2-Turbo` no es funcional por sí solo.
- Sin documentación del dataset de entrenamiento: se desconoce si las imágenes de entrenamiento tenían derechos compatibles con uso comercial, pese a la licencia Apache 2.0 declarada.
- Riesgo de sobreajuste al concepto: los LoRA de personaje tienden a forzar los rasgos del personaje incluso cuando el prompt pide otra cosa; no hay evaluación que lo cuantifique.
- Riesgo de alucinación visual: el modelo puede generar detalles inconsistentes del personaje (halo, insignia, accesorios) en encuadres complejos o con prompts ambiguos.
- Idiomas: no se documenta soporte multilingüe en los prompts; los ejemplos están en inglés y se desconoce el comportamiento con prompts en castellano.
- Sin métricas ni evaluaciones publicadas: no hay FID, CLIP score ni comparaciones con otros LoRA, lo que impide valorar su calidad de forma objetiva.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones de licencia del modelo base Krea 2, que no se detallan en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/uykgf/rosavienne-krea2
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Variante Turbo (usada en los ejemplos): https://huggingface.co/krea/Krea-2-Turbo
- Documentación de `diffusers`: https://huggingface.co/docs/diffusers
