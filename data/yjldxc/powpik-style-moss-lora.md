# yjldxc/powpik-style-moss-lora

## Resumen

powpik style es un LoRA de estilo para generación de imágenes texto-a-imagen construido sobre el modelo base OpenMOSS/MOSS-Image-Base. Lo desarrolla el usuario yjldxc y se publica en Hugging Face bajo licencia "other". Su propósito es reproducir un estilo de ilustración anime caracterizado por trazos finos y una paleta suave de baja saturación, orientado a retratos de personajes, composiciones de dos figuras y escenas sobre fondo blanco limpio. Es relevante para quien quiera incorporar ese estilo concreto en flujos de trabajo basados en diffusers sin reentrenar el modelo base.

El adaptador es de tipo LoRA con rango 32 en precisión bf16, entrenado durante 5200 pasos (64 épocas) con ai-toolkit 0.13.39 y buckets de resolución de 1024 píxeles. Se activa mediante la palabra disparadora `@powpik` y el autor recomienda no acompañarla de descriptores genéricos de calidad como `masterpiece` o `best quality`, que diluyen el efecto del trigger.

Al ser un adaptador LoRA, su tamaño de repositorio es de 0,1 GB, lo que lo hace muy ligero de distribuir. No obstante, la información disponible sobre el modelo base es limitada en esta ficha: no se detallan parámetros totales, arquitectura interna ni longitud de contexto del MOSS-Image-Base, por lo que esos datos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image-Base (arquitectura del base no disponible) |
| Parámetros totales | no disponible (rango LoRA 32 en bf16; parámetros del base no disponibles) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en bf16) |
| Idiomas soportados | en, zh, ja |
| Licencia | other |
| Formato de pesos | safetensors (formato propio de diffusers para LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 en bf16 que se aplica sobre OpenMOSS/MOSS-Image-Base, un modelo de difusión texto-a-imagen. El entrenamiento se realizó con ai-toolkit 0.13.39 durante 5200 pasos repartidos en 64 épocas, usando buckets de resolución de 1024 píxeles. Las captions se generaron en lenguaje natural describiendo solo el contenido, de modo que el estilo queda codificado en la palabra disparadora `@powpik` y no en descripciones textuales del estilo.

No se dispone de información sobre el número de tokens o imágenes del dataset, la composición exacta del mismo ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en adaptadores de difusión). El autor indica que el dataset contiene únicamente ilustraciones para todas las edades y que los fondos blancos están sobrerrepresentados.

## Capacidades

- Generación de imágenes texto-a-imagen en estilo ilustración anime con trazos finos y color suave de baja saturación.
- Aplicación de estilo mediante la palabra disparadora `@powpik`, sin necesidad de descriptores de calidad adicionales.
- Retratos de personaje individual, composiciones de dos personajes y escenas sobre fondo blanco.
- Variaciones de vestuario (uniforme marinero, sudadera, impermeable, pijama) y expresiones faciales (ojos entornados, mejillas hinchadas, lengua fuera), según las direcciones creativas del autor.
- Soporte multilingüe de prompts en inglés, chino y japonés.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagen.
- No dispone de capacidad NSFW según declara el autor.

## Casos de uso

- Ilustración de personajes para proyectos personales: el LoRA genera retratos anime con el estilo powpik usando prompts cortos como `@powpik, 1girl, white background`, adecuado para avatares y fichas de personaje.
- Escenas slice-of-life: el autor sugiere contextos cotidianos como andenes de metro, tiendas de conveniencia o ventanas de aula, donde el estilo de baja saturación encaja con ambientes suaves.
- Composiciones de dos personajes con contraste de personalidad (uno pícaro, otro tierno), útil para ilustraciones narrativas o viñetas.
- Pruebas de vestuario y diseño de moda de personaje: cambios de uniforme, sudadera, impermeable o pijama manteniendo el estilo, útil en fases de concept art.
- Hojas de expresiones y reacciones: caras de reacción con ojos entornados, mejillas hinchadas o lengua fuera para sprites o cómics.
- Integración en pipelines de diffusers: al ser un LoRA ligero (0,1 GB) en formato diffusers, se puede cargar junto al modelo base en scripts de generación por lotes o servicios de inferencia.
- Prototipado rápido de estilos para ilustradores: permite validar una dirección visual antes de invertir en un entrenamiento propio de mayor escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el modelo base; el adaptador LoRA en sí ocupa aproximadamente 0,1 GB.
- GPU recomendadas: no disponible. Depende enteramente de los requisitos de MOSS-Image-Base, que no se detallan en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; condicionada por el modelo base.
- Opciones de despliegue: la librería indicada es diffusers; no se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este adaptador de difusión).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros LoRA de estilo comparables ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset sobrerrepresenta fondos blancos, por lo que las escenas con fondos no blancos pueden derivar hacia el aspecto del modelo base.
- Riesgo de alucinación: propio de los modelos de difusión; pueden aparecer artefactos anatómicos, especialmente en manos en planos de cuerpo completo, para los que el autor recomienda un pase de inpaint local.
- Limitaciones de idioma: prompts soportados en inglés, chino y japonés; no se garantiza el comportamiento en otros idiomas.
- Restricciones de licencia: la licencia es "other"; no se especifican los términos exactos, por lo que debe consultarse la model card y la licencia del modelo base antes de un uso comercial.
- El autor declara que el LoRA no tiene capacidad NSFW y que el dataset contiene solo ilustraciones para todas las edades.
- No se recomienda apilar descriptores de calidad genéricos (`masterpiece`, `best quality`), ya que diluyen el efecto del trigger; para reforzar el estilo debe subirse el peso del trigger, por ejemplo `(@powpik:1.15)`.
- Al depender de MOSS-Image-Base, cualquier limitación del modelo base (resolución nativa, calidad, licencia) se hereda.

## Enlaces

- Hugging Face: https://huggingface.co/yjldxc/powpik-style-moss-lora
- Modelo base: https://huggingface.co/OpenMOSS/MOSS-Image-Base
