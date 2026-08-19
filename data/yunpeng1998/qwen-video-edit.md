# yunpeng1998/Qwen-Video-Edit

# Qwen-Video-Edit

## Resumen

Qwen-Video-Edit es un modelo de edición de video basado en instrucciones textuales, presentado en el artículo *Qwen-Video-Edit: Instruction-Based Video Editing by Repurposing an Image Editing Model*. El modelo reutiliza el transformador de difusión (DiT) de Qwen-Image-Edit, un modelo de edición de imágenes, para operar directamente sobre los latentes de video del codificador Wan 2.1, incorporando únicamente proyecciones entrenables ligeras que conectan ambos espacios. De esta forma, se logra editar videos manteniendo el contenido y el movimiento originales mientras se aplican cambios como restyling, sustitución de sujetos o modificación de condiciones ambientales.

El modelo está desarrollado por yunpeng1998 y se distribuye bajo licencia MIT, lo que facilita su uso tanto en investigación como en aplicaciones comerciales. El repositorio tiene un tamaño de 40,9 GB, lo que sugiere que los pesos están en formato de precisión completa o cuantizaciones altas. Su relevancia radica en que ofrece una alternativa eficiente a los modelos de edición de video entrenados desde cero, aprovechando las capacidades de un modelo de edición de imágenes ya maduro.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (transformador de difusión) de Qwen-Image-Edit adaptado a latentes de video VAE de Wan 2.1 con proyecciones ligeras |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 40,9 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

Qwen-Video-Edit se construye sobre el modelo de edición de imágenes Qwen-Image-Edit. En lugar de entrenar un modelo de video desde cero, los autores reutilizan el DiT de Qwen-Image-Edit y lo conectan directamente a los latentes de video generados por el VAE de Wan 2.1. Esta conexión se realiza mediante proyecciones entrenables de peso ligero, que se ajustan para alinear el espacio latente de imagen con el de video. La arquitectura permite procesar secuencias de video completas sin descomponerlas en fotogramas individuales, preservando así la coherencia temporal y el movimiento.

El entrenamiento se describe en el artículo técnico (arXiv:2608.14790). No se especifican en la información pública los datos de entrenamiento ni el número de tokens utilizados. La innovación principal es el enfoque de "reutilizar" un modelo de edición de imágenes para video, reduciendo significativamente el coste computacional frente a entrenar un modelo de video desde cero.

## Capacidades

- Edición de video basada en instrucciones textuales libres, como restyling de escenas, sustitución de sujetos, cambio de condiciones meteorológicas o de materiales.
- Preserva el contenido y el movimiento original del video que no se ve afectado por la instrucción.
- Permite editar videos largos procesando segmentos de forma secuencial (chunk by chunk), manteniendo la coherencia entre fragmentos.
- Al estar basado en Qwen-Image-Edit, hereda capacidades de edición de imágenes de alta calidad, adaptadas al dominio de video.
- Soporta edición de video en un flujo de trabajo de imagen a video, sin requerir entrenamiento específico de video.

## Casos de uso

- **Restyling de escenas cinematográficas**: convertir una escena real en un estilo animado o cambiar la paleta de colores de un video manteniendo la composición y el movimiento de los personajes.
- **Sustitución de sujetos en videos**: reemplazar un objeto o persona por otro (por ejemplo, cambiar un coche por una bicicleta) manteniendo la acción y la iluminación originales.
- **Cambio de condiciones ambientales**: modificar el clima en un video (lluvia, nieve, niebla) o cambiar la hora del día (de día a noche) sin alterar la dinámica de la escena.
- **Edición de materiales y texturas**: transformar superficies (por ejemplo, convertir un objeto de plástico en metal) en videos de producto o publicitarios.
- **Producción de contenido para redes sociales**: crear variaciones de un video base con diferentes estilos artísticos, ideal para campañas de marketing que requieren múltiples versiones.
- **Edición de video largo en postproducción**: procesar secuencias largas en segmentos, aplicando instrucciones distintas a cada parte, gracias a la capacidad de edición por trozos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Dado el tamaño del repositorio (40,9 GB), se espera que la inferencia requiera al menos 40 GB de VRAM para ejecutar los pesos en precisión completa, y menos con cuantización, pero no se proporcionan datos oficiales.
- **GPU recomendadas**: no especificado por el autor. Se recomienda una GPU con al menos 40 GB de VRAM (por ejemplo, A100, H100, o RTX 4090 en modo multi-GPU) para manejar los pesos completos.
- **Compatibilidad con GPU de consumo**: no se confirma; un modelo de este tamaño probablemente no quepa en una GPU de gama media sin cuantización o offloading.
- **Opciones de despliegue**: no se indica soporte explícito para vLLM, llama.cpp, Ollama o TGI. El repositorio GitHub probablemente incluya scripts de inferencia propios.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha identificado en la información pública otros modelos de edición de video basados en instrucciones con características comparables (tamaño, arquitectura, licencia) para realizar una comparación objetiva.

## Limitaciones y advertencias

- **Información limitada**: la model card es extremadamente breve y no proporciona detalles sobre sesgos, alucinaciones, ni limitaciones específicas.
- **Riesgo de alucinación visual**: como cualquier modelo generativo, puede producir artefactos o cambios no deseados en regiones que deberían permanecer intactas.
- **Dependencia del modelo base**: las capacidades de edición están condicionadas por la calidad del modelo de imagen Qwen-Image-Edit y del VAE de Wan 2.1, por lo que sus limitaciones se trasladan al video.
- **Licencia**: MIT permite uso comercial, pero se recomienda revisar la licencia de los modelos subyacentes (Qwen-Image-Edit y Wan 2.1) para asegurar cumplimiento.
- **Falta de documentación**: no hay información sobre requisitos exactos de hardware, tiempos de inferencia o limitaciones de contexto temporal, lo que dificulta su integración en producción sin pruebas adicionales.

## Enlaces

- Hugging Face: [https://huggingface.co/yunpeng1998/Qwen-Video-Edit](https://huggingface.co/yunpeng1998/Qwen-Video-Edit)
- Artículo técnico: [https://arxiv.org/html/2608.14790v1](https://arxiv.org/html/2608.14790v1)
- Página del proyecto: [https://yunpeng1998.github.io/Qwen-Video-Edit-Page](https://yunpeng1998.github.io/Qwen-Video-Edit-Page)
- Código: [https://github.com/yunpeng1998/Qwen-Video-Edit](https://github.com/yunpeng1998/Qwen-Video-Edit)
