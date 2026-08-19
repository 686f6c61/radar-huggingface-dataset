# User387984723/wan22experimental

## Resumen

El modelo `wan22experimental` es un LoRA (Low-Rank Adaptation) experimental desarrollado por el usuario independiente User387984723, diseñado para ajustar el modelo base Wan (probablemente Wan 2.2) en tareas de generación de video a partir de texto (T2V) e imagen (I2V). El autor lo describe como un trabajo en curso, con un estado "nightly" y reconoce que el modelo está "ligeramente poco cocinado" (underbaked). Su propósito principal es la generación de contenido NSFW, y se distribuye bajo licencia MIT.

La relevancia de este modelo radica en que es un ejemplo de fine-tuning comunitario sobre arquitecturas de generación de video open source, aunque su uso está restringido a contenido para adultos y requiere un manejo ético. El repositorio tiene un tamaño de 1,2 GB, lo que sugiere que contiene los pesos del LoRA, no el modelo base completo. No se proporcionan detalles sobre la arquitectura subyacente, el número de parámetros ni la longitud de contexto, más allá de que se recomienda usarlo con modelos Wan de 14B.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo base Wan (versión no especificada) |
| Parametros totales | no disponible (el repo pesa 1,2 GB, pero corresponde al LoRA, no al modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, pero no se especifica) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

El modelo es un LoRA, una técnica de adaptación de bajo rango que modifica los pesos de un modelo preentrenado sin necesidad de reentrenar toda la red. En este caso, el LoRA se entrena sobre el modelo Wan (versión 2.2 según el título), que es un modelo de difusión para generación de video. El autor indica que fue entrenado con `diffusion-pipe` en una GPU NVIDIA RTX 4090, utilizando un dataset compuesto por videos NSFW. No se proporcionan detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO.

El autor menciona que el modelo funciona mejor con modelos Wan de 14B en tareas T2V o I2V a 480p, y que los resultados a 720p son pobres. También sugiere que la calidad mejora con prompts muy descriptivos y que algunos seeds producen resultados malos, lo que indica una alta variabilidad en la generación. No se documentan innovaciones técnicas adicionales más allá del ajuste de bloques en `WanVideoWrapper`, que permite modificar qué bloques del modelo base se utilizan durante la inferencia.

## Capacidades

- Generación de video a partir de texto (T2V) y de imagen (I2V) cuando se combina con un modelo base Wan de 14B.
- Especializado en contenido NSFW, con mejor rendimiento en posiciones como missionary, doggy o cowgirl, aunque el autor admite que la calidad es variable.
- Soporte para ajuste de bloques de inferencia mediante `WanVideoWrapper`, lo que permite experimentar con la activación selectiva de capas.
- Compatible con otros modelos de la familia Wan (SkyReels V2, DF, Phantom, Vace, Causvid) según el autor.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingüe.

## Casos de uso

- Creación de contenido adulto personalizado: el modelo permite generar videos NSFW a partir de descripciones textuales detalladas o imágenes de referencia, lo que puede ser utilizado por creadores independientes para producir material para plataformas de suscripción.
- Investigación en fine-tuning de modelos de video: al ser un LoRA de código abierto, sirve como caso de estudio para entender cómo adaptar modelos de difusión de video a dominios específicos con recursos limitados (una sola GPU).
- Experimentación con ajuste de bloques: el autor proporciona una guía para modificar los bloques de inferencia, lo que permite a desarrolladores explorar el impacto de la activación selectiva de capas en la calidad del video generado.
- Prototipado rápido de generación de video: aunque no está pulido, puede usarse para validar ideas de generación de video en entornos de prueba antes de invertir en modelos comerciales.
- Generación de video para artistas digitales: artistas que trabajan con temática erótica pueden usar el modelo como herramienta de inspiración o para crear storyboards animados.
- Evaluación de riesgos de sesgo en modelos NSFW: investigadores pueden analizar cómo el fine-tuning con datos específicos afecta a la representación y los sesgos en la generación de video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas cuantitativas de rendimiento, solo comentarios cualitativos sobre la calidad variable de los resultados.

## Requisitos de hardware

- El autor entrenó el LoRA en una NVIDIA RTX 4090 (24 GB VRAM), lo que sugiere que la inferencia con el modelo base Wan de 14B requiere al menos esa cantidad de memoria.
- Para ejecutar el LoRA es necesario cargar el modelo base Wan (14B), que típicamente necesita entre 16 y 24 GB de VRAM en función de la cuantización. No se especifican cuantizaciones compatibles.
- Se recomienda una GPU con al menos 24 GB de VRAM para T2V a 480p o I2V a 480p. Para 720p, el autor desaconseja su uso.
- Opciones de despliegue: el modelo se integra en flujos de trabajo de `WanVideoWrapper` (ComfyUI) y puede usarse con `diffusion-pipe` para entrenamiento. No se mencionan otros runners como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuración de bloques.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (LoRAs NSFW para generación de video). El autor menciona compatibilidad con otros LoRAs de Wan, pero no proporciona comparativas de rendimiento. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Modelo experimental y "underbaked": el propio autor advierte que no está listo para producción y que requiere más entrenamiento.
- Sesgos conocidos: al estar entrenado exclusivamente con videos NSFW, el modelo puede generar contenido sexual explícito de forma no deseada si se usa con prompts ambiguos. También puede reflejar sesgos presentes en el dataset (posiciones, cuerpos, etc.).
- Riesgo de alucinación: la generación de video puede producir artefactos visuales, movimientos incoherentes o resultados de baja calidad, especialmente con seeds desfavorables.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero al ser un modelo de video, la duración del clip generado está limitada por el modelo base Wan (típicamente unos pocos segundos).
- Restricciones de licencia: la licencia MIT permite uso comercial, pero el contenido generado puede estar sujeto a leyes de pornografía y consentimiento. El autor incluye una cláusula de responsabilidad del usuario.
- Advertencia para producción: no se recomienda su uso en entornos profesionales sin una evaluación exhaustiva de calidad y seguridad. El autor sugiere probar varios seeds y ajustar los bloques manualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/User387984723/wan22experimental
- Guía de ajuste de bloques (CivArchive): https://civarchive.com/articles/17635/22-block-guide-experimentation
- Página de donación del autor (Ko-fi): https://ko-fi.com/cubeyai
