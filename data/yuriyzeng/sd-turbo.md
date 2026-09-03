# YuriyZeng/sd-turbo

## Resumen

SD-Turbo es un modelo generativo de texto a imagen desarrollado originalmente por Stability AI y publicado en Hugging Face bajo el identificador `YuriyZeng/sd-turbo`. Se trata de una versión destilada de Stable Diffusion 2.1 mediante el método de destilación adversaria de difusión (Adversarial Diffusion Distillation, ADD), que permite generar imágenes fotorrealistas en un único paso de muestreo. El modelo está diseñado para síntesis en tiempo real y como artefacto de investigación para estudiar modelos de texto a imagen pequeños y destilados.

Con aproximadamente 866 millones de parámetros, SD-Turbo produce imágenes de resolución fija 512x512 píxeles y alcanza una calidad visual y una alineación con el prompt que, según los estudios de preferencia humana, supera a otros métodos de un solo paso como LCM-Lora XL y LCM-Lora 1.5. Aunque el autor del repositorio en Hugging Face es YuriyZeng, el modelo es idéntico al publicado por Stability AI bajo el nombre `stabilityai/sd-turbo`. La licencia no aparece en los metadatos, pero el README remite a la licencia de Stability AI para uso comercial.

El modelo se distribuye en formato `safetensors` y es compatible con la librería `diffusers` mediante el pipeline `StableDiffusionPipeline`. No requiere `guidance_scale` ni `negative_prompt`; basta con un único paso de inferencia para obtener resultados de alta calidad. Está pensado para aplicaciones de generación en tiempo real, prototipado rápido y entornos con recursos limitados, aunque su calidad es inferior a la del modelo más grande SDXL-Turbo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (UNet) basada en Stable Diffusion 2.1 |
| Parametros totales | 865.910.724 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no genera texto) |
| Tipos de cuantizacion | fp16, fp32 (safetensors) |
| Idiomas soportados | no disponible (se asume ingles, no confirmado) |
| Licencia | no disponible en metadatos; README remite a https://stability.ai/license para uso comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SD-Turbo es una versión destilada de Stable Diffusion 2.1. La destilación se realiza mediante Adversarial Diffusion Distillation (ADD), un método que combina destilación por puntuación (score distillation) con una pérdida adversarial. La destilación por puntuación utiliza un modelo de difusión de imágenes a gran escala como señal de profesor, mientras que la pérdida adversarial garantiza una alta fidelidad de la imagen incluso en el régimen de uno o dos pasos de muestreo. El resultado es un modelo capaz de generar imágenes fotorrealistas con un solo paso de inferencia, frente a los 20-50 pasos típicos de los modelos de difusión estándar.

El modelo se entrenó a partir de los pesos de Stable Diffusion 2.1, que a su vez se basa en un autoencoder variacional (VAE) y un texto codificador CLIP. No se han publicado detalles sobre el número de tokens de entrenamiento ni la composición del dataset en la información disponible. El proceso de destilación se describe en el informe técnico de Stability AI sobre ADD, accesible en el repositorio oficial.

## Capacidades

- Generación de imágenes fotorrealistas a partir de prompts de texto en un solo paso de muestreo.
- Síntesis en tiempo real: apto para aplicaciones interactivas y generación por lotes rápida.
- Soporte de image-to-image mediante el pipeline `AutoPipelineForImage2Image`, ajustando los pasos y la fuerza del ruido.
- No requiere `guidance_scale` ni `negative_prompt`, simplificando el ajuste de hiperparámetros.
- Compatible con la librería `diffusers` y con el repositorio `generative-models` de Stability AI.
- Generación de imágenes a resolución 512x512 píxeles; resoluciones superiores funcionan parcialmente.
- No soporta tool calling, agentes ni razonamiento multi-paso; es exclusivamente un modelo de generación de imágenes.

## Casos de uso

- Prototipado rápido de conceptos visuales: un diseñador puede generar decenas de variantes de una idea en segundos con un solo paso, acelerando la exploración creativa en estudios de diseño.
- Generación de imágenes en tiempo real para aplicaciones interactivas: por ejemplo, un editor de imágenes que muestra un borrador inmediato mientras el usuario escribe el prompt, gracias a la latencia mínima de un único paso de muestreo.
- Aumento de datos para entrenamiento de otros modelos: se pueden sintetizar imágenes etiquetadas a partir de prompts para ampliar datasets de visión por computador, especialmente en entornos con recursos computacionales limitados.
- Herramientas educativas y creativas: integración en aplicaciones de enseñanza de arte digital o generación de ilustraciones para presentaciones y materiales didácticos, donde la velocidad prima sobre la perfección.
- Filtrado previo de ideas en producción: antes de lanzar una campaña publicitaria, un equipo puede generar múltiples conceptos visuales de bajo coste para seleccionar los más prometedores y refinarlos después con modelos de mayor calidad.
- Investigación sobre modelos generativos destilados: sirve como referencia para estudiar el impacto de la destilación adversaria en la calidad de imagen, la alineación con el prompt y los artefactos de un solo paso.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (como FID, CLIP score o preferencia humana) en la información disponible. El README incluye gráficas de estudios de preferencia humana que muestran que SD-Turbo, evaluado con un solo paso, es preferido en términos de calidad de imagen y seguimiento del prompt frente a LCM-Lora XL y LCM-Lora 1.5. Sin embargo, no se proporcionan valores cuantitativos exactos. Se recomienda consultar el informe técnico de ADD para obtener detalles del estudio.

## Requisitos de hardware

- VRAM estimada: con pesos en fp16, el modelo completo (UNet + VAE + text encoder) ocupa aproximadamente 3-4 GB de VRAM, por lo que cabe en GPUs de consumo como la RTX 3060 (12 GB) o superiores. En fp32, el uso de VRAM se duplica.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para inferencia rápida y procesamiento por lotes. Una RTX 3060 o 4060 puede ejecutar el modelo con un solo paso sin problemas.
- Opciones de despliegue: compatible con `diffusers` (Python), así como con servidores de inferencia como vLLM o TGI (aunque estos están orientados a modelos de lenguaje, no a difusión; para difusión se recomienda usar `diffusers` o el repositorio `generative-models`).
- Latencia: en una GPU moderna (RTX 4090), un solo paso de muestreo a 512x512 tarda típicamente menos de 100 ms, lo que permite generación en tiempo real.
- Throughput: al requerir un solo paso, SD-Turbo puede generar cientos de imágenes por minuto en una GPU de gama alta, dependiendo del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos de muestreo | Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SD-Turbo (este) | ~866M | 1 | 512x512 | No disponible en metadatos; remite a Stability AI | Hugging Face |
| SDXL-Turbo | ~3.5B (estimado) | 1-4 | 1024x1024 | No disponible en metadatos; remite a Stability AI | Hugging Face |
| LCM-Lora 1.5 | ~860M (base) + LoRA | 1-4 | 512x512 | Apache 2.0 (base) | Hugging Face |

SD-Turbo es más pequeño y rápido que SDXL-Turbo, pero ofrece menor calidad y peor alineación con el prompt. Frente a LCM-Lora 1.5, SD-Turbo mostró mejor preferencia humana en el estudio de Stability AI, aunque LCM-Lora es más flexible al aplicarse como adaptador sobre distintos modelos base. La principal ventaja de SD-Turbo es su simplicidad: un solo paso sin necesidad de ajustar guidance.

## Limitaciones y advertencias

- La calidad de imagen y la alineación con el prompt son inferiores a las de SDXL-Turbo, por lo que no es adecuado para aplicaciones donde se requiera máxima fidelidad.
- Las imágenes se generan a resolución fija de 512x512 píxeles; resoluciones mayores pueden producir artefactos.
- El modelo no consigue fotorrealismo perfecto y puede fallar al generar rostros humanos o personas en general.
- No puede renderizar texto legible dentro de las imágenes.
- El autoencoder (VAE) es lossy, lo que introduce pérdida de información en la reconstrucción.
- No fue entrenado para representar hechos o personas reales de manera fiel; su uso para generar contenido factual o noticias es inapropiado.
- La licencia no está especificada en los metadatos del repositorio; para uso comercial, es imprescindible revisar la licencia de Stability AI en https://stability.ai/license y la política de uso aceptable.
- Riesgo de alucinación visual: puede generar objetos o escenas que no corresponden al prompt o que son imposibles.
- No se han documentado sesgos específicos, pero al derivar de Stable Diffusion 2.1, puede heredar sesgos de género, raza y cultura presentes en los datos de entrenamiento.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/YuriyZeng/sd-turbo
- Modelo original de Stability AI: https://huggingface.co/stabilityai/sd-turbo
- Repositorio de código (generative-models): https://github.com/Stability-AI/generative-models
- Informe tecnico sobre ADD: https://stability.ai/research/adversarial-diffusion-distillation
- Demo del modelo mayor SDXL-Turbo: http://clipdrop.co/stable-diffusion-turbo
- Licencia de Stability AI: https://stability.ai/license
- Politica de uso aceptable: https://stability.ai/use-policy
