# zuraxe/tsume-renderoverse-illustrious-lora

## Resumen

Tsume - Renderoverse LoRA es un adaptador LoRA de personaje para modelos de difusion de la familia SDXL, publicado originalmente por NSFWstudio en la plataforma Renderoverse y replicado en Hugging Face por el usuario zuraxe. No es un modelo base ni un checkpoint autónomo: es un fichero de pesos de bajo rango (185.719.000 bytes, BF16, formato safetensors) que debe cargarse sobre un checkpoint SDXL compatible con Illustrious, concretamente el referenciado en sus metadatos como AnyIllustrious XL v0.1.1 / SDXL epsilon.

El adaptador codifica la apariencia del personaje Tsume mediante dos disparadores de texto: `tsume_renderoverse` para el personaje y `Tsumeoutfit` para un conjunto de ropa opcional. La fuerza de LoRA sugerida por las instrucciones de origen es 1.2. El repositorio de Hugging Face es un espejo del fichero 1.0.0 sin modificaciones, con 0 descargas y 0 likes en el momento de la consulta, y sin imágenes de previsualización incluidas.

Su relevancia es acotada: se trata de un adaptador de personaje para generación text-to-image con etiqueta `not-for-all-audiences`, cuya licencia es `renderoverse-source-terms` (etiquetada como "Other", no MIT). No se han publicado especificaciones de entrenamiento, número de pasos, dataset ni métricas de calidad, y el propio espejo advierte que no ha sido probado en cuanto a calidad de imagen o rendimiento de generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre SDXL (adaptador de bajo rango; no es un modelo completo) |
| Parametros totales | no disponible (fichero de 185.719.000 bytes en BF16) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de difusion text-to-image) |
| Tipos de cuantizacion | no disponible; pesos en BF16 (safetensors) |
| Idiomas soportados | no disponible (los prompts dependen del codificador de texto del checkpoint base) |
| Licencia | renderoverse-source-terms (etiquetada como "Other") |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA pensado para inyectarse en un checkpoint SDXL con soporte Illustrious. El modelo base embebido en los metadatos es AnyIllustrious XL v0.1.1 sobre SDXL epsilon, lo que sitúa la generación en el espacio latente de SDXL con el ajuste estilístico de Illustrious. El fichero contiene únicamente las matrices de bajo rango del adaptador, no los pesos del UNet ni del VAE del modelo base, de ahí su tamano de aproximadamente 0,2 GB.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de imagenes, los pasos de entrenamiento, la resolucion de las referencias ni si se aplicaron tecnicas de regularizacion o captioning. La model card indica que los metadatos embebidos incluyen un estado de "caption-derivative" y que el espejo no verifica la finalizacion del entrenamiento. Tampoco se documentan innovaciones tecnicas adicionales.

## Capacidades

- Generacion text-to-image condicionada por prompt, limitada al estilo y al dominio del checkpoint SDXL/Illustrious sobre el que se cargue.
- Reproduccion del personaje Tsume mediante el disparador `tsume_renderoverse`.
- Control opcional de vestuario mediante el disparador `Tsumeoutfit`.
- Ajuste de intensidad del adaptador (fuerza sugerida de 1.2), lo que permite modular la fidelidad al personaje frente a la libertad creativa del prompt.
- Compatibilidad con el ecosistema de herramientas SDXL (AUTOMATIC1111, ComfyUI, Diffusers) en la medida en que estos soporten LoRA sobre el checkpoint base.
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo de difusion, no un LLM.
- Capacidades multilingues: no documentadas; dependen del codificador de texto del checkpoint base.
- No se documentan modos especiales (thinking, vision, audio).

## Casos de uso

- Ilustracion de personaje consistente en series: usar `tsume_renderoverse` con fuerza 1.2 sobre AnyIllustrious XL v0.1.1 para mantener la identidad visual de Tsume a lo largo de varias imagenes de una misma narracion o galeria.
- Prototipado de variaciones de vestuario: alternar `Tsumeoutfit` activado y desactivado para generar al personaje con el conjunto de ropa entrenado o con ropa descrita libremente en el prompt.
- Creacion de material promocional o fan art para proyectos de ficcion: el adaptador permite generar ilustraciones del personaje sin reentrenar un modelo completo, reduciendo coste computacional y tiempo.
- Iteracion de estilo sobre un pipeline SDXL existente: cargar el LoRA en ComfyUI o AUTOMATIC1111 junto al checkpoint Illustrious para explorar combinaciones de prompt, sampler y CFG sin cambiar de modelo base.
- Pruebas de concepto de personajes para estudios pequenos: dado el bajo peso del fichero (0,2 GB), se puede distribuir y cargar en estaciones de trabajo con GPU de consumo para sesiones de ideacion.
- Integracion en flujos de generacion por lotes: al ser un adaptador ligero, puede encolarse en scripts de Diffusers que rendericen variaciones del personaje con semillas y prompts distintos.
- Archivado y replicacion de releases: el espejo en Hugging Face permite conservar el fichero 1.0.0 con su SHA-256 verificado para trazabilidad, aunque no se garantiza su calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo lo determina el checkpoint SDXL base. Un SDXL en BF16 requiere tipicamente entre 8 y 12 GB de VRAM segun optimizaciones, y el LoRA anade una sobrecarga marginal.
- GPU recomendadas: no especificadas por el autor. Por el perfil del modelo base (SDXL), son adecuadas GPU consumer con 8-12 GB o superiores (RTX 3060 12 GB, RTX 4070, RTX 4090) y GPU de datacenter (A100, H100) para lotes grandes.
- Cabe en GPU consumer: si, siempre que el checkpoint SDXL base quepa; el adaptador en si ocupa unos 0,2 GB.
- Opciones de despliegue: AUTOMATIC1111 WebUI, ComfyUI, Diffusers (carga de LoRA sobre el pipeline SDXL), y cualquier runtime que soporte LoRA sobre SDXL. No aplica vLLM, llama.cpp ni Ollama, que son para LLM.
- Latencia y throughput: no disponibles; dependen del checkpoint base, la GPU, la resolucion y el numero de pasos.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tsume - Renderoverse LoRA | LoRA de personaje | SDXL / AnyIllustrious XL v0.1.1 | no aplica (SDXL, tipicamente 1024x1024) | renderoverse-source-terms | Hugging Face (espejo) y Renderoverse |
| LoRA de personaje SDXL generico | LoRA de personaje | SDXL | no aplica | variable (a menudo CreativeML OpenRAIL-M o similar) | Civitai, Hugging Face |
| Checkpoint Illustrious XL completo | Modelo base | SDXL | no aplica | variable | Hugging Face, Civitai |

No se dispone de datos de rendimiento ni de comparativas cuantitativas con alternativas concretas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un checkpoint autonomo: requiere un checkpoint SDXL compatible con Illustrious; cargarlo sobre otro modelo base puede degradar o anular el efecto del personaje.
- El espejo no ha sido probado en cuanto a calidad de imagen ni rendimiento de generacion; no hay garantia de que el entrenamiento este completo.
- Contenido no apto para todas las audiencias: los metadatos describen referencias de entrenamiento con y sin ropa, y la etiqueta `not-for-all-audiences` esta presente.
- Licencia restrictiva: `renderoverse-source-terms` (Other), no MIT. El espejo no relicencia ni concede derechos adicionales; el uso comercial requiere consultar los terminos de origen y contactar con el autor.
- Riesgo de alucinacion visual y de deriva de identidad: como todo LoRA de personaje, puede producir resultados inconsistentes segun prompt, semilla y fuerza del adaptador.
- Sin imagenes de previsualizacion ni documentacion de prompts de ejemplo, lo que dificulta evaluar la fidelidad antes de usarlo.
- Derechos de terceros: los derechos sobre personajes, nombres y marcas siguen siendo de sus titulares.
- No hay informacion sobre sesgos, idiomas soportados ni limitaciones de contexto, al no tratarse de un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/zuraxe/tsume-renderoverse-illustrious-lora
- Release original en Renderoverse: https://renderoverse.com/model/tsume-renderoverse
- Terminos de licencia: https://renderoverse.com/model/tsume-renderoverse
- Plataforma Renderoverse: https://renderoverse.com/
