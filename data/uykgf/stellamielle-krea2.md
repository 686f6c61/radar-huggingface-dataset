# uykgf/stellamielle-krea2

## Resumen

Stellamielle-krea2 es un adaptador LoRA de tipo DreamBooth para el modelo de generación de imágenes Krea 2, entrenado por el usuario uykgf sobre la variante Krea-2-Raw y pensado para ejecutarse sobre Krea-2-Turbo. Su función es introducir un concepto concreto, un personaje de estilo anime llamado "stellamielle", mediante un token activador homónimo que se inserta en el prompt para invocar de forma consistente sus rasgos: rizos rubios con trenza lateral gruesa, ojos marrones, corona amarilla y blanca, adornos de nube, lazos y un vestido de volantes en tonos amarillo y blanco.

El repositorio es de tamaño reducido (0,2 GB), coherente con un LoRA y no con un modelo completo, y se distribuye con licencia Apache 2.0. La model card documenta dos prompts de ejemplo generados en Krea 2 Turbo con 8 pasos de inferencia y `guidance_scale=0.0`, lo que indica que el adaptador está calibrado para el modo turbo de pocos pasos del modelo base.

Su relevancia es acotada: se trata de una pieza de personalización de un modelo base propietario o de acceso restringido (Krea 2), publicada con muy poca tracción (37 descargas y 0 likes en el momento de la ficha) y sin documentación sobre el dataset de entrenamiento, hiperparámetros o evaluación cuantitativa. Es útil para quien quiera reproducir el personaje sobre Krea 2, no como modelo generalista.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusión text-to-image (Krea 2) |
| Parámetros totales | no disponible (el repositorio ocupa 0,2 GB; el número de parámetros del adaptador no se declara) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de contexto textual) |
| Tipos de cuantización | no disponible (los pesos LoRA se cargan sobre el modelo base; no se documentan variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (el prompt de ejemplo está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | pesos compatibles con diffusers (carga mediante `pipe.load_lora_weights`); no se detalla el formato de fichero exacto |

## Arquitectura y entrenamiento

El adaptador es un LoRA de tipo DreamBooth, la técnica habitual para inyectar un sujeto o concepto concreto en un modelo de difusión mediante un token raro o pseudo-token ("stellamielle"). Se entrena sobre Krea-2-Raw y se infiere sobre Krea-2-Turbo, según declara el autor. La model card no especifica el rango del LoRA, las capas adaptadas, el número de imágenes del dataset, el número de pasos de entrenamiento, la tasa de aprendizaje ni si se aplicaron técnicas adicionales como regularización por clase o aumento de datos.

Tampoco se documenta la composición del dataset de entrenamiento ni el proceso de captura o etiquetado de las imágenes del personaje. La única información operativa es el token activador y los dos prompts de ejemplo, generados con 8 pasos y `guidance_scale=0.0`, lo que sugiere un uso previsto con el sampler y la configuración turbo del modelo base.

## Capacidades

- Generación de imágenes text-to-image condicionada por el token `stellamielle`, que activa el concepto del personaje.
- Reproducción consistente de atributos concretos del personaje: peinado (rizos rubios y trenza lateral), ojos marrones, corona amarilla y blanca, adornos de nube, lazos y vestido de volantes.
- Composición de escenas variables alrededor del personaje: el ejemplo de la model card incluye una ilustración de cuerpo entero sobre fondo gris liso y una escena sentada en un jardín de flores sosteniendo un peluche de conejo.
- Integración con el pipeline `Krea2Pipeline` de diffusers mediante `load_lora_weights`.
- Compatibilidad declarada con Krea-2-Turbo en modo de pocos pasos (8 pasos en los ejemplos).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo; no aplican a un adaptador de generación de imágenes.

## Casos de uso

- Ilustración de personaje consistente para cómic o novela ligera: usar el token `stellamielle` junto con descripciones de escena para mantener el diseño del personaje entre viñetas y capítulos, apoyándose en la reproducibilidad de rasgos que ofrece el LoRA.
- Generación de hojas de personaje y referencias visuales: prompts de cuerpo entero sobre fondo neutro, como el ejemplo de la model card, para producir fichas de diseño reutilizables por ilustradores o equipos de arte.
- Prototipado rápido de escenas narrativas: combinar el token con descripciones de entorno (jardín, interior, etc.) para explorar variaciones de una misma escena antes de encargar el arte final.
- Creación de material promocional o fan art de un personaje original: el adaptador permite generar imágenes del personaje en distintos contextos sin reentrenar el modelo base en cada iteración.
- Pruebas de concepto en pipelines de difusión con diffusers: sirve como ejemplo práctico de carga de un LoRA de DreamBooth sobre un pipeline turbo y de ajuste de pasos y guidance para evaluar el efecto del adaptador.
- Integración en flujos de trabajo de estudio con Krea 2: al ser un LoRA ligero (0,2 GB), puede cargarse y descargarse dinámicamente según el proyecto, sin duplicar el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye dos imágenes de ejemplo generadas en Krea 2 Turbo con 8 pasos y `guidance_scale=0.0`, sin métricas cuantitativas (FID, CLIP score, similitud de sujeto u otras).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador por separado; depende íntegramente del modelo base Krea 2, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible; condicionado por el modelo base.
- Compatibilidad con GPU de consumo: no disponible; el LoRA en sí es ligero (0,2 GB), pero el modelo base determina si cabe en una GPU consumer.
- Opciones de despliegue: diffusers, mediante `Krea2Pipeline` y `load_lora_weights` (único método documentado en la model card). No se documentan opciones para llama.cpp, Ollama, vLLM ni TGI, que además no son aplicables a un pipeline de difusión en este formato.
- Latencia y throughput estimados: no disponibles; los ejemplos usan 8 pasos de inferencia, lo que reduce el coste frente a configuraciones de más pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| uykgf/stellamielle-krea2 | LoRA DreamBooth sobre Krea 2 | no disponible (repo de 0,2 GB) | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face, 37 descargas |
| LoRA de personaje sobre SDXL | LoRA DreamBooth sobre SDXL | variable según adaptador | no aplica | depende del adaptador y del dataset | variable (habitualmente abierta) | amplia en Hugging Face y Civitai |
| LoRA de personaje sobre FLUX.1 | LoRA DreamBooth sobre FLUX.1 | variable según adaptador | no aplica | depende del adaptador y del dataset | variable según modelo base | amplia en Hugging Face |
| Krea 2 Turbo (modelo base) | Modelo de difusión text-to-image | no disponible | no aplica | sin datos en esta ficha | no disponible en la información proporcionada | referenciado como `krea/Krea-2-Turbo` |

No se dispone de datos cuantitativos que permitan comparar el rendimiento de este adaptador con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un LoRA entrenado sobre un personaje de anime, hereda los sesgos estilísticos y de representación del dataset de entrenamiento y del modelo base, que no se detallan.
- Riesgo de alucinación: en generación de imágenes se traduce en deriva del diseño del personaje (variaciones de peinado, vestuario o proporciones) cuando el prompt se aleja de las descripciones de entrenamiento; no hay evaluación de consistencia publicada.
- Limitaciones de contexto o idioma: los prompts de ejemplo están en inglés y no se documenta el comportamiento con prompts en castellano ni con otras lenguas.
- Restricciones de licencia: el adaptador se publica con Apache 2.0, pero el uso comercial depende también de la licencia y condiciones del modelo base Krea 2, que no se detallan en la información disponible; conviene verificar la licencia de `krea/Krea-2-Raw` y `krea/Krea-2-Turbo` antes de usarlo en producción.
- Caveat de producción: el adaptador está entrenado sobre Krea-2-Raw pero los ejemplos se generan sobre Krea-2-Turbo con 8 pasos y `guidance_scale=0.0`; no se documenta su comportamiento con otras configuraciones de sampler, pasos o guidance.
- Falta de documentación: no se publican hiperparámetros de entrenamiento, tamaño ni composición del dataset, lo que dificulta reproducir el entrenamiento o estimar su robustez.
- Tracción muy baja: 37 descargas y 0 likes en el momento de la ficha, sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/uykgf/stellamielle-krea2
- Modelo base (raw): https://huggingface.co/krea/Krea-2-Raw
- Modelo base turbo referenciado en la model card: `krea/Krea-2-Turbo` (no se proporciona URL directa en la información disponible)
- Documentación de diffusers para carga de LoRA: no disponible en la información proporcionada
