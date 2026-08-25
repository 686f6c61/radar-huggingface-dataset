# spyrostheboss/Maitreyi_Ramakrishnan_Krea_2_LoRA

## Resumen

Este repositorio contiene una LoRA (Low-Rank Adaptation) entrenada para reproducir la apariencia facial de la actriz canadiense Maitreyi Ramakrishnan, conocida por su papel en la serie de Netflix *Never Have I Ever*. El modelo está diseñado para el generador de imágenes Krea 2, concretamente sobre el checkpoint base `krea/Krea-2-Raw`, y permite generar retratos de este personaje con identidad consistente en distintas poses, expresiones, atuendos y ángulos. Es un adaptador de tipo *character-LoRA* que se activa mediante la palabra clave `maitrama` al inicio del prompt.

La relevancia de esta LoRA radica en que aprovecha la arquitectura de Krea 2, un modelo de difusión de última generación con codificador de texto Qwen3-VL-4B y VAE de Qwen-Image, para lograr un control fino sobre la identidad del personaje sin necesidad de reentrenar el modelo completo. El adaptador pesa 0.5 GB y se distribuye como un único archivo `.safetensors` listo para cargar en ComfyUI o mediante el script de inferencia de musubi-tuner. Aunque el repositorio no especifica la licencia exacta (marcada como `other`), el uso comercial puede estar restringido por la licencia del modelo base y por derechos de imagen de la persona representada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 (difusión texto-imagen) |
| Parametros totales | no disponible (tamaño del archivo: 0.5 GB) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 con base fp8) |
| Idiomas soportados | no disponibles (el prompt se procesa mediante Qwen3-VL-4B, que soporta múltiples idiomas, pero no se especifica) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (archivo único `maitrama_krea2.safetensors`) |

## Arquitectura y entrenamiento

La LoRA se entrena sobre el checkpoint `Krea 2 Raw` (`raw.safetensors`) utilizando la implementación de LoRA específica para Krea 2 (`networks.lora_krea2`). El adaptador tiene un rango (network dim) de 32 y un alpha de 32, lo que indica una capacidad de adaptación moderada. El dataset de entrenamiento consta de 316 imágenes del personaje, con 5 épocas y 395 pasos totales, usando un batch efectivo de 4 (batch size 1 con gradiente acumulado de 4). El optimizador es AdamW8bit con una tasa de aprendizaje constante de 1e-4 y sin warmup. El muestreo de timesteps sigue el esquema `krea2_shift` y no se aplica ningún esquema de ponderación adicional. La resolución de entrenamiento es de 1024x1024 con bucketing, y se usa precisión mixta bf16 con base fp8. El codificador de texto es Qwen3-VL-4B (congelado) y el VAE es el de Qwen-Image. El entrenamiento se realizó con semilla 42.

Para la inferencia, la model card recomienda usar el checkpoint **Krea 2 Turbo** como base, con una fuerza de LoRA de 1.0, 8 pasos de muestreo, guidance scale de 1 (CFG desactivado) y un valor `mu` de 1.15. La palabra de activación debe ser `maitrama` (en minúsculas) como primer token del prompt.

## Capacidades

- Generación de imágenes de Maitreyi Ramakrishnan con identidad facial consistente (rasgos, peinado, proporciones) en diferentes poses, expresiones, atuendos y ángulos.
- Control fino sobre la apariencia mediante el prompt: se pueden especificar detalles como peinado, color de ojos, pecas, vestimenta, etc., manteniendo el parecido con la actriz.
- Integración con el ecosistema Krea 2: funciona con el checkpoint base `Krea-2-Raw` para entrenamiento y con `Krea-2-Turbo` para inferencia rápida.
- Compatible con ComfyUI y con el script de inferencia de musubi-tuner (Krea 2).
- No se documentan capacidades adicionales como edición, inpainting o generación de vídeo; el adaptador se limita a la generación texto-imagen.

## Casos de uso

- Creación de contenido artístico y fan art: generar ilustraciones de un personaje ficticio basado en la actriz, manteniendo la coherencia visual en series de imágenes o cómics.
- Prototipado de personajes para producción audiovisual: diseñar conceptos de personajes con rasgos similares a los de la actriz para previsualizar casting o diseño de vestuario.
- Generación de avatares personalizados: crear retratos estilizados de Maitreyi Ramakrishnan para perfiles de redes sociales, foros o comunidades de fans.
- Pruebas de consistencia de identidad en pipelines de IA generativa: evaluar cómo una LoRA de personaje mantiene la identidad a través de múltiples generaciones con prompts variados.
- Investigación en adaptación de bajo rango (LoRA) para modelos de difusión: estudiar el efecto del rango 32, el número de imágenes y el esquema de entrenamiento en la fidelidad del personaje.
- Generación de contenido educativo o divulgativo sobre técnicas de personalización de modelos de imagen, usando un ejemplo real y reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas de similitud facial, coherencia de identidad ni comparaciones con otras LoRAs de personajes.

## Requisitos de hardware

- La LoRA en sí es ligera (0.5 GB), pero requiere el modelo base Krea 2 (Raw o Turbo) para funcionar, cuyo tamaño no se especifica en la información proporcionada.
- Se recomienda una GPU con al menos 8-12 GB de VRAM para generar imágenes a 1024x1024 con el modelo base y la LoRA cargada, aunque el requisito exacto depende de la implementación y del uso de cuantización.
- Para inferencia con Krea 2 Turbo (8 pasos), una GPU consumer como una RTX 3060 o superior podría ser suficiente, pero no hay datos oficiales de VRAM ni de latencia.
- Opciones de despliegue: ComfyUI (carga directa del archivo `.safetensors`) o el script de inferencia de musubi-tuner disponible en el repositorio de Krea 2 (https://github.com/krea-ai/krea-2).
- No se dispone de información sobre throughput o latencia estimada.

## Comparativa con modelos similares

No disponible. No se han encontrado en la información proporcionada otras LoRAs de personajes comparables para Krea 2 ni adaptadores equivalentes para otros modelos de difusión con los que contrastar parámetros, rendimiento o licencia.

## Limitaciones y advertencias

- La LoRA está entrenada específicamente para reproducir la apariencia de una persona real (Maitreyi Ramakrishnan). Su uso puede infringir derechos de imagen, especialmente en contextos comerciales o que puedan inducir a error. Se recomienda consultar la legislación aplicable y obtener los permisos necesarios.
- La licencia del modelo está marcada como `other` y no se detallan los términos exactos. El modelo base Krea 2 también tiene su propia licencia, que puede restringir el uso comercial o la redistribución.
- El dataset de entrenamiento (316 imágenes) es relativamente pequeño, por lo que la LoRA puede no generalizar bien a ángulos extremos, condiciones de iluminación inusuales o estilos artísticos muy alejados de los datos de entrenamiento.
- La consistencia de identidad no está garantizada al 100%: pueden aparecer variaciones en rasgos faciales, peinado o color de ojos en generaciones con prompts muy diferentes.
- No se especifican sesgos conocidos, pero al tratarse de un modelo entrenado sobre imágenes de una única persona, no es adecuado para generar representaciones de otras personas ni para usos genéricos de retrato.
- El riesgo de alucinación (generación de detalles no presentes en la persona real) existe, especialmente en accesorios, fondos o elementos no controlados por el prompt.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spyrostheboss/Maitreyi_Ramakrishnan_Krea_2_LoRA
- Implementación de Krea 2 (GitHub): https://github.com/krea-ai/krea-2
- Sitio web de Krea: https://www.krea.ai/
- Perfil de Instagram de Maitreyi Ramakrishnan: https://www.instagram.com/maitreyiramakrishnan/
- Perfil de TikTok de Maitreyi Ramakrishnan: https://www.tiktok.com/@maitreyiramakrishnan
- Wikipedia (Maitreyi Ramakrishnan): https://en.wikipedia.org/wiki/Maitreyi_Ramakrishnan
