# uglasses/IdentiFace-PixArt-FFHQ

## Resumen

IdentiFace-PixArt-FFHQ es un modelo de ControlNet desarrollado por uglasses, diseñado para la generación de caras con preservación de identidad a partir de descripciones multimodales. Se basa en el modelo de difusión PixArt-α (PixArt-XL-2-1024-MS) y se ha ajustado finamente sobre el dataset ID-FFHQ, que contiene imágenes de rostros de alta calidad. El modelo está pensado para aplicaciones forenses, concretamente para la generación de retratos robot de sospechosos en investigaciones criminales, integrando señales de control como bordes y características de baja calidad para mejorar la fidelidad de la identidad.

El checkpoint publicado corresponde a un entrenamiento de 30 épocas con una pérdida de identidad basada en AdaFace (peso 0.1) y una proporción de prompts largos de 0.3. El repositorio incluye el archivo de pesos (`latest.pth`), la configuración de entrenamiento y el log correspondiente. El modelo se distribuye bajo licencia "other" y está disponible en HuggingFace con un tamaño de repositorio de 6.0 GB. Aunque no se especifican detalles de arquitectura interna, al ser un ControlNet para PixArt, se espera que herede la capacidad de generación de imágenes de alta resolución (1024x1024) del modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ControlNet sobre PixArt-α (PixArt-XL-2-1024-MS) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imágenes, sin contexto de texto explícito) |
| Tipos de cuantizacion | no disponible (checkpoint en formato .pth, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo procesa texto en inglés según el paper, pero no se especifica) |
| Licencia | other |
| Formato de pesos | .pth (PyTorch) |

## Arquitectura y entrenamiento

El modelo es un ControlNet que se acopla al generador PixArt-α, un modelo de difusión basado en transformer con capacidad de generar imágenes de 1024x1024 píxeles. El ControlNet se entrena para inyectar condiciones espaciales adicionales (bordes y características de baja calidad) en el proceso de difusión, permitiendo un control fino sobre la estructura y la identidad del rostro generado. El entrenamiento se realizó sobre el dataset ID-FFHQ, que contiene pares de imágenes de rostros con anotaciones de identidad y atributos. Se empleó una pérdida de identidad AdaFace con peso 0.1 para reforzar la similitud facial, y una proporción de prompts largos de 0.3 para mejorar la adherencia a descripciones textuales extensas. El checkpoint publicado corresponde a 30 épocas de entrenamiento, con un log disponible para revisión.

## Capacidades

- Generación de imágenes de rostros a partir de descripciones textuales multimodales (texto + condiciones de borde y baja calidad).
- Preservación de identidad facial mediante pérdida AdaFace, útil para retratos robot.
- Control fino de la estructura facial mediante mapas de bordes y características de baja calidad.
- Integración con el ecosistema de diffusers de HuggingFace, lo que facilita su uso en pipelines de generación.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o vídeo.

## Casos de uso

- Retratos robot para investigaciones criminales: el modelo puede generar una cara plausible de un sospechoso a partir de una descripción testifical, combinando texto con bocetos o imágenes de baja calidad (por ejemplo, CCTV). La pérdida de identidad ayuda a mantener rasgos consistentes con la descripción.
- Mejora de imágenes de baja resolución: al aceptar características de baja calidad como condición, puede reconstruir un rostro de alta resolución a partir de una imagen degradada, útil en análisis forense.
- Generación de avatares con identidad controlada: en entornos de entretenimiento o simulación, permite crear caras sintéticas que mantienen una identidad específica definida por el usuario.
- Aumento de datos para sistemas de reconocimiento facial: se pueden generar variaciones de un mismo rostro con diferentes expresiones o ángulos, manteniendo la identidad, para entrenar clasificadores.
- Asistencia en descripciones de testigos: a partir de un texto descriptivo (p. ej., "hombre de 30 años, barba, cicatriz en la mejilla"), el modelo produce una imagen que puede mostrarse a testigos para confirmar detalles.
- Investigación en generación condicionada de imágenes: sirve como referencia para estudiar el impacto de ControlNet y pérdidas de identidad en modelos de difusión de alta resolución.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2605.00526) menciona experimentos comparativos con instancias de IdentiFace construidas sobre Stable Diffusion v1.5 y PixArt-α, pero no se incluyen métricas numéricas en la documentación accesible. Se recomienda consultar el artículo para obtener datos detallados de evaluación.

## Requisitos de hardware

- No se especifican requisitos oficiales de hardware en la documentación proporcionada.
- El checkpoint tiene un tamaño de 6.0 GB, lo que sugiere que en FP32 ocuparía aproximadamente esa cantidad de memoria solo para los pesos. Para inferencia, se necesita memoria adicional para activaciones y el modelo base PixArt-α, que tiene alrededor de 600 millones de parámetros.
- Se estima que una GPU con al menos 12 GB de VRAM (p. ej., RTX 3060 Ti, RTX 4070) podría ejecutar el modelo a resolución 1024x1024, aunque no se garantiza. Para entrenamiento o ajuste fino, se recomendaría una GPU con 24 GB o más (A100, RTX 4090).
- El modelo se integra con la librería diffusers, por lo que puede desplegarse con herramientas como HuggingFace Inference Endpoints, o mediante scripts personalizados en PyTorch. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput dependen del hardware y de la configuración de muestreo; no se proporcionan datos concretos.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de generación de caras con preservación de identidad en la información proporcionada. El paper menciona que IdentiFace se implementa sobre dos bases: Stable Diffusion v1.5 y PixArt-α, pero no se ofrecen tablas comparativas con alternativas como IP-Adapter, PhotoMaker o InstantID. Se recomienda consultar el artículo para obtener una comparación detallada. En términos generales, este modelo se distingue por su enfoque en el control de bordes y características de baja calidad, así como por el uso de pérdida AdaFace, lo que lo orienta específicamente a aplicaciones forenses.

## Limitaciones y advertencias

- La licencia "other" no especifica claramente los términos de uso comercial; se debe contactar al autor para aclarar restricciones.
- El modelo está entrenado específicamente en el dataset FFHQ, por lo que su rendimiento puede degradarse con rostros de otras etnias o condiciones no representadas en ese conjunto.
- No se han publicado evaluaciones de sesgos o alucinaciones; como todo modelo generativo, puede producir rostros irreales o no coincidentes con la descripción en casos extremos.
- La dependencia de condiciones de borde y baja calidad implica que la calidad de la entrada afecta directamente al resultado; entradas muy ruidosas pueden generar salidas poco fiables.
- No se proporcionan instrucciones de uso en producción ni garantías de estabilidad; el checkpoint es un artefacto de investigación.
- El tamaño del modelo (6 GB) y la necesidad de ejecutar el modelo base PixArt-α pueden suponer una barrera para despliegues en entornos con recursos limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uglasses/IdentiFace-PixArt-FFHQ
- Repositorio GitHub oficial: https://github.com/uglasses/IdentiFace
- Dataset ID-FFHQ: https://huggingface.co/datasets/uglasses/ID-FFHQ
- Paper en arXiv: https://arxiv.org/html/2605.00526v1
