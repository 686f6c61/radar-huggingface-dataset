# SouthernBoots/krea2-mckenna-grace-v1

## Resumen

SouthernBoots/krea2-mckenna-grace-v1 es un LoRA (Low-Rank Adaptation) de DreamBooth entrenado sobre el modelo base Krea 2 Raw, desarrollado por el usuario SouthernBoots. El modelo está diseñado para personalizar la generación de imágenes del personaje ficticio "Grace", permitiendo invocar este concepto mediante el token `Grace` en los prompts. Se distribuye bajo licencia Apache 2.0 y se integra con el ecosistema de Diffusers, siendo compatible tanto con Krea 2 Raw como con Krea 2 Turbo.

Este LoRA resuelve el problema de la personalización de identidades en modelos de difusión: en lugar de reentrenar un modelo completo, adapta de forma ligera el modelo base para generar consistentemente a un personaje concreto. Su relevancia actual radica en la creciente demanda de herramientas de personalización eficientes y de bajo coste computacional para modelos de texto a imagen de última generación como Krea 2. El repositorio tiene un tamaño de 0,8 GB y se publicó en agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión Krea 2 |
| Parametros totales | no disponible (el tamaño del repo es 0,8 GB, pero los parámetros del LoRA no se especifican) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los prompts se procesan en inglés, pero no hay especificación oficial) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (inferido por el uso con Diffusers; no se especifica explícitamente) |

## Arquitectura y entrenamiento

El modelo es un LoRA de DreamBooth, una técnica de adaptación de bajo rango que modifica un subconjunto de los pesos del modelo base durante el entrenamiento. El modelo base es Krea 2 Raw, un modelo de difusión de texto a imagen de la familia Krea 2. Según la model card, el LoRA se entrenó sobre Krea 2 Raw y se muestra funcionando sobre Krea 2 Turbo, lo que sugiere que la adaptación es compatible con ambas variantes (Raw y Turbo). No se proporcionan detalles sobre el dataset de entrenamiento, el número de pasos, la tasa de aprendizaje ni el método de optimización. La técnica de DreamBooth permite capturar la identidad de un sujeto específico (en este caso, el personaje Grace) a partir de unas pocas imágenes de referencia, aunque no se indica cuántas imágenes se usaron.

## Capacidades

- Generación de imágenes personalizadas del personaje "Grace" usando el token desencadenante `Grace` en el prompt.
- Compatible con el pipeline `Krea2Pipeline` de Diffusers, tanto con el modelo base Krea 2 Raw como con Krea 2 Turbo.
- Soporta generación en pocos pasos: los ejemplos de la model card se generaron con Krea 2 Turbo en 8 pasos y guidance scale 0.0.
- Permite estilos variados: los ejemplos muestran desde fotografía cinematográfica hasta pintura al óleo o macrofotografía, lo que indica que el LoRA no limita el estilo artístico, sino que fija la identidad del personaje.
- Integración sencilla con Diffusers mediante `load_lora_weights`.
- No se documentan capacidades de tool calling, agentes ni razonamiento multimodal, ya que es un modelo exclusivamente de generación de imágenes.

## Casos de uso

- Creación de personajes consistentes para narrativa visual: un escritor o ilustrador puede generar múltiples ilustraciones de un mismo personaje (Grace) en distintos escenarios y estilos, manteniendo la coherencia de la identidad, gracias al token `Grace` y a la capacidad de variar el prompt.
- Prototipado de concept art para videojuegos o animación: los diseñadores pueden explorar rápidamente variaciones de un personaje (por ejemplo, Grace como androide, bailarina o hada) usando el LoRA sobre Krea 2 Turbo con pocos pasos, lo que acelera el proceso de iteración.
- Generación de contenido para campañas de marketing personalizadas: una marca puede crear un personaje mascota o embajador (Grace) y generar imágenes para redes sociales, anuncios o material promocional sin necesidad de sesiones fotográficas.
- Ilustración de libros infantiles o cómics: el LoRA permite mantener la apariencia del personaje a lo largo de varias páginas o viñetas, reduciendo el trabajo manual de corrección de inconsistencias.
- Experimentación artística y creative coding: artistas digitales pueden integrar el LoRA en pipelines de Diffusers para generar series de imágenes con un personaje recurrente, explorando estilos pictóricos o temáticos diferentes.
- Evaluación de técnicas de personalización en investigación: dado que es un LoRA de código abierto con licencia Apache 2.0, puede servir como caso de estudio para comparar métodos de adaptación de modelos de difusión en términos de calidad y consistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay métricas cuantitativas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones con otros LoRA o modelos de personalización.

## Requisitos de hardware

- El tamaño del repositorio es de 0,8 GB, lo que corresponde al peso del LoRA. La VRAM necesaria para la inferencia depende del modelo base (Krea 2 Raw o Turbo) y de la resolución de salida. Krea 2 es un modelo de difusión de última generación; se recomienda al menos una GPU con 8-12 GB de VRAM para generar imágenes a resoluciones típicas (512x512 o 1024x1024) con el LoRA cargado.
- GPUs recomendadas: NVIDIA RTX 3060 (12 GB) o superiores, RTX 4070, RTX 4090, A100, H100. Para uso en producción con alta demanda, se recomienda A100 o H100.
- Sí cabe en GPUs de consumo: una RTX 3060 con 12 GB puede ejecutar el modelo base en cuantización de 16 bits (bfloat16) y el LoRA adicional sin problemas para resoluciones moderadas.
- Opciones de despliegue: el modelo se usa mediante Diffusers (Python), por lo que puede integrarse en servicios como Hugging Face Inference Endpoints, o en servidores propios con vLLM (aunque vLLM está orientado a LLM, no a difusión; para difusión se usa típicamente FastAPI + Diffusers). También es posible exportar a ONNX para optimización, aunque no se documenta.
- Latencia: no disponible. Los ejemplos de la model card usan 8 pasos en Krea 2 Turbo, lo que sugiere tiempos de generación del orden de segundos en GPUs modernas, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No disponible. No se conocen LoRA comparables de Krea 2 en el momento de redactar esta ficha, ni se dispone de datos de rendimiento para establecer una comparación objetiva con otras técnicas de personalización (como Textual Inversion, Hypernetworks o LoRA sobre otros modelos base como Stable Diffusion o Flux).

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el personaje "Grace". El token `Grace` debe usarse en el prompt para activar la personalización; sin él, el LoRA no tendrá efecto o puede degradar la calidad.
- No se especifica el número de imágenes de entrenamiento ni la diversidad de ángulos, poses o iluminación. Esto puede limitar la robustez del personaje en situaciones extremas (por ejemplo, vistas traseras o condiciones de luz inusuales).
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar detalles inconsistentes o artefactos, especialmente en escenas complejas o con múltiples personajes.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base Krea 2 (krea/Krea-2-Raw) tenga una licencia compatible con su caso de uso. La licencia del LoRA no cubre el modelo base.
- No se proporcionan instrucciones de seguridad ni filtros de contenido. El modelo puede generar imágenes inapropiadas si el prompt es ofensivo, ya que no hay moderación integrada.
- No hay soporte para otros idiomas en la documentación; los prompts se procesan en inglés, aunque el modelo podría aceptar prompts en otros idiomas dependiendo del tokenizador del modelo base, no se garantiza.
- El repositorio no incluye ejemplos de evaluación de sesgos ni análisis de diversidad. No se puede afirmar que el modelo sea equitativo en cuanto a representación de etnias o géneros, dado que el personaje "Grace" podría tener una apariencia estereotipada.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SouthernBoots/krea2-mckenna-grace-v1)
- [Modelo base Krea 2 Raw](https://huggingface.co/krea/Krea-2-Raw)
- [Modelo base Krea 2 Turbo](https://huggingface.co/krea/Krea-2-Turbo)
