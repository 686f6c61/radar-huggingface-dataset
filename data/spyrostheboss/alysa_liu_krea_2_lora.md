# spyrostheboss/Alysa_Liu_Krea_2_LoRA

## Resumen

Este repositorio contiene un LoRA (Low-Rank Adaptation) para el modelo de generación de imágenes Krea 2, desarrollado por el usuario spyrostheboss. El LoRA está entrenado para reproducir de forma consistente la apariencia y los rasgos faciales de Alysa Liu, una figura pública, en diferentes poses, expresiones, atuendos y composiciones. Se basa en el checkpoint Krea 2 Raw y está diseñado para ser utilizado con Krea 2 Turbo en inferencia, aunque también es compatible con el modelo Raw.

El modelo resuelve el problema de mantener la identidad de un personaje concreto en generaciones de texto a imagen, un reto habitual en los modelos de difusión. Su relevancia radica en que ofrece una solución ligera y específica para crear imágenes de una persona determinada sin necesidad de reentrenar el modelo completo. El LoRA tiene una dimensión de red de 32 y se distribuye como un único archivo safetensors de aproximadamente 0,5 GB. La fecha de creación es el 24 de agosto de 2026 y no se especifica una licencia concreta más allá de "other".

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 (modelo de difusión texto-imagen) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generación de imágenes) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 con base fp8) |
| Idiomas soportados | no especificado (trigger en inglés) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (archivo `alysliu_krea2.safetensors`) |

## Arquitectura y entrenamiento

El LoRA se entrena sobre el checkpoint Krea 2 Raw (`raw.safetensors`) utilizando la arquitectura `networks.lora_krea2` del framework musubi-tuner. La red tiene una dimensión y alpha de 32, lo que indica una adaptación de bajo rango. El entrenamiento se realizó con 305 imágenes, 5 épocas (385 pasos), batch efectivo de 4 (batch size 1 con acumulación de gradientes de 4), optimizador AdamW8bit, tasa de aprendizaje constante de 1e-4 y resolución de 1024x1024 con bucketing. Se usó el text encoder Qwen3-VL-4B congelado y el VAE de Qwen-Image. El muestreo de timesteps siguió el esquema `krea2_shift` y la precisión mixta fue bf16 con base fp8. El seed fue 42.

No se proporcionan detalles sobre la arquitectura interna de Krea 2 (si es un transformer de difusión, un modelo de flujo, etc.), pero al ser un LoRA, la adaptación se aplica a las capas del modelo base. La técnica de LoRA permite un ajuste eficiente en términos de parámetros y memoria.

## Capacidades

- Generación de imágenes de Alysa Liu con identidad facial consistente (rasgos, peinado, proporciones).
- Reproducción de la persona en diferentes poses, expresiones, atuendos, ángulos y composiciones.
- Activación mediante la palabra clave `alysliu` como primer token del prompt.
- Compatible con Krea 2 Turbo (recomendado para inferencia) y Krea 2 Raw.
- Integración con ComfyUI y el script de inferencia musubi-tuner.
- Resolución de salida de 1024x1024.
- No incluye capacidades de tool calling, agentes, razonamiento multimodal ni otras funcionalidades propias de modelos de lenguaje.

## Casos de uso

- Creación de retratos personalizados: el LoRA permite generar imágenes de Alysa Liu en entornos variados, útil para ilustraciones, perfiles o contenido editorial.
- Generación de variaciones de vestuario y estilo: se pueden explorar diferentes looks manteniendo la identidad, aplicable a diseño de moda o conceptualización.
- Producción de fan art: los aficionados pueden crear ilustraciones de la persona en escenas imaginarias con consistencia visual.
- Generación de imágenes para redes sociales o blogs: contenido visual atractivo sobre la figura pública sin necesidad de sesiones fotográficas.
- Pruebas de casting virtual: en entornos de producción audiovisual, se pueden previsualizar cómo quedaría la persona en distintos roles o escenarios.
- Investigación en personalización de modelos de difusión: sirve como ejemplo de adaptación de bajo rango para identidades específicas, útil para estudios técnicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos cuantitativos sobre calidad de generación, fidelidad de identidad o comparación con otros LoRAs.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del modelo.
- Al ser un LoRA, el consumo adicional de memoria es reducido, pero se requiere el modelo base Krea 2 (Raw o Turbo) para la inferencia, cuyo tamaño y requisitos no se detallan aquí.
- Se puede ejecutar en GPUs de consumo si el modelo base cabe en la VRAM disponible; se recomienda al menos 8-12 GB de VRAM para resolución 1024x1024, aunque no hay confirmación oficial.
- Opciones de despliegue: ComfyUI, script de inferencia musubi-tuner, y posiblemente otros frameworks compatibles con Krea 2.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros LoRAs de personajes para Krea 2 en la colección oficial de Hugging Face, pero no se han publicado comparativas cuantitativas.

## Limitaciones y advertencias

- La licencia "other" no especifica los términos de uso; es necesario contactar al autor para conocer las restricciones, especialmente para uso comercial.
- El modelo está entrenado para una persona concreta; su uso puede plantear problemas de consentimiento o derechos de imagen si se emplea para fines comerciales o engañosos.
- Puede presentar sesgos en la representación de la persona (por ejemplo, envejecimiento, variaciones de iluminación) debido al conjunto de entrenamiento limitado (305 imágenes).
- Riesgo de alucinación en detalles finos como texturas de ropa o fondos complejos, común en modelos de difusión.
- El trigger word debe escribirse exactamente como `alysliu` en minúsculas; de lo contrario, el LoRA no se activa.
- No se garantiza la consistencia de identidad en todos los casos; se recomienda ajustar la fuerza del LoRA (1.0 por defecto) según el resultado deseado.
- No se proporcionan instrucciones sobre el uso de la licencia ni sobre la atribución requerida.

## Enlaces

- [Repositorio HuggingFace del modelo](https://huggingface.co/spyrostheboss/Alysa_Liu_Krea_2_LoRA)
- [Colección de LoRAs de Krea 2 en Hugging Face](https://huggingface.co/collections/krea/krea-2-loras)
- [Sitio web de Krea](https://www.krea.ai/)
- [Ejemplo de LoRA de Krea 2 Turbo en Civitai](https://civitai.com/models/2727641/krea-2-turbo-lora-256dim)
