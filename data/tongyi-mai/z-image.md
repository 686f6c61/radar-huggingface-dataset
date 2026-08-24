# Tongyi-MAI/Z-Image

## Resumen

Z-Image es un modelo fundacional de generación de imágenes desarrollado por el equipo Tongyi-MAI de Alibaba, presentado como la base de la familia ⚡️- Image. Se trata de un transformador de difusión de flujo único (single-stream diffusion transformer) con aproximadamente 6 150 millones de parámetros, diseñado para ofrecer alta calidad visual, diversidad generativa, cobertura estilística amplia y adherencia precisa al prompt. A diferencia de su variante destilada Z-Image-Turbo, Z-Image es un modelo no destilado que conserva toda la señal de entrenamiento y soporta Classifier-Free Guidance (CFG), lo que lo hace adecuado para flujos de trabajo profesionales y como base para fine-tuning, LoRA y ControlNet.

El modelo se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face, ModelScope y GitHub. Su arquitectura de difusión con transformer de flujo único permite una generación eficiente de imágenes de alta resolución (hasta 2048×2048) con un número de pasos de inferencia recomendado entre 28 y 50. Z-Image destaca por su capacidad de control negativo, su diversidad de salida y su flexibilidad para tareas de desarrollo, lo que lo convierte en una opción atractiva para investigadores y desarrolladores que necesitan un modelo base no destilado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer de flujo único (single-stream DiT) |
| Parametros totales | 6 154 908 736 (6,15 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (modelo de generación de imagen, no de texto) |
| Tipos de cuantizacion | No especificado en la informacion disponible (el checkpoint se distribuye en safetensors) |
| Idiomas soportados | Inglés (model card); aunque el ejemplo de uso incluye prompts en chino, la etiqueta oficial es `en` |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 45,2 GB) |

## Arquitectura y entrenamiento

Z-Image se basa en un Diffusion Transformer de flujo único, una arquitectura que procesa tokens de imagen y texto en un único stream, en lugar de los diseños de dos flujos más comunes en otros modelos de difusión. Esta elección reduce la complejidad computacional y permite una generación más eficiente sin sacrificar la calidad. Al ser un modelo no destilado, conserva el entrenamiento completo y soporta CFG con valores de guidance scale recomendados entre 3,0 y 5,0, lo que da al usuario control fino sobre la adherencia al prompt y la composición.

El entrenamiento se realizó con un dataset no especificado en la información pública, pero el modelo destaca por su amplia cobertura estilística (fotografía hiperrealista, arte digital, anime, ilustraciones) y su capacidad de manejar prompts complejos. La variante Z-Image-Turbo es una versión destilada que reduce el número de pasos a 8, pero sacrifica la capacidad de CFG, el fine-tuning y la diversidad de salida. Z-Image, en cambio, está diseñado para ser la base para entrenamientos adicionales (LoRA, ControlNet, etc.) y para tareas que requieren control fino mediante negative prompting.

## Capacidades

- Generación de imágenes de alta calidad con resoluciones de 512×512 a 2048×2048 (área total de píxeles, cualquier relación de aspecto).
- Adherencia precisa al prompt, incluyendo prompts complejos con múltiples objetos, atributos y contexto.
- Control negativo robusto: el modelo responde con alta fidelidad a los prompts negativos, permitiendo suprimir artefactos y ajustar composiciones.
- Diversidad de salida: alta variabilidad en composición, identidad facial, iluminación y estilo entre diferentes semillas.
- Soporte de Classifier-Free Guidance (CFG) completo, con un rango de guidance scale recomendado de 3,0 a 5,0.
- Capacidad de fine-tuning: al ser no destilado, es adecuado para entrenamiento de LoRA, ControlNet y otras técnicas de adaptación.
- No tiene soporte de tool calling, agentes ni razonamiento multi-step (es un modelo de generación de imagen).
- Idiomas: aunque la model card indica inglés, el ejemplo de uso incluye prompts en chino; se recomienda verificar el rendimiento en otros idiomas.

## Casos de uso

- Creación de contenido visual para marketing y publicidad: el modelo puede generar imágenes fotorrealistas de productos, escenas y personas con alta fidelidad al prompt, lo que permite a los equipos de diseño producir material visual sin necesidad de sesiones fotográficas costosas. Su soporte de CFG permite ajustar la adherencia al texto para campañas específicas.
- Ilustración y arte digital: con una amplia cobertura de estilos (desde anime hasta ilustración estilizada), Z-Image sirve para generar conceptos artísticos, portadas de libros, ilustraciones para juegos o cómics. La diversidad de salida facilita la exploración de variaciones creativas.
- Generación de imágenes para entrenamiento de modelos: al ser un modelo base no destilado, puede utilizarse como generador de datos sintéticos para entrenar otros modelos de visión por computador o para aumentar conjuntos de datos de entrenamiento.
- Fine-tuning para dominios específicos: los desarrolladores pueden adaptar Z-Image mediante LoRA o ControlNet para producir imágenes con un estilo particular, como logotipos, productos de una marca o escenas de un universo ficticio. Su licencia Apache 2.0 permite uso comercial y modificaciones.
- Prototipado rápido de conceptos visuales: con 28 a 50 pasos de inferencia, el modelo ofrece una generación relativamente rápida, adecuada para iteraciones de diseño en flujos de trabajo de arte conceptual o preproducción.
- Generación de imágenes con control negativo: cuando se requiere suprimir elementos no deseados (por ejemplo, marcas de agua, texto no deseado o ciertos estilos), el soporte de negative prompting permite eliminar estos artefactos de forma fiable, útil en entornos de producción donde la calidad es crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (como FID, CLIP score, etc.) en la información disponible. La model card proporciona comparaciones cualitativas con Z-Image-Turbo, indicando que Z-Image ofrece mayor diversidad, soporte de CFG y fine-tuning, mientras que Turbo tiene una calidad visual "muy alta" pero menor diversidad. No se dispone de números concretos de rendimiento frente a otros modelos (FLUX, SDXL, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible en la información pública. El modelo tiene 6,15 B parámetros y el repo pesa 45,2 GB, por lo que se estima que en bfloat16 (formato típico para inferencia) requiere al menos ~12 GB de VRAM, pero este dato no es oficial.
- GPU recomendadas: no se especifican en la documentación. Dado el tamaño, se necesitan GPUs de gama alta (RTX 3090, RTX 4090, A100, H800) para inferencia con bfloat16. La variante Z-Image-Turbo (destilada) cabe en 16 GB de VRAM según el GitHub, pero para Z-Image base no se indica.
- Opciones de despliegue: el modelo se integra con la librería `diffusers` mediante `ZImagePipeline`. Se puede usar en entornos locales con GPU o en servicios de inferencia en la nube (Azure, por ejemplo, según la etiqueta de despliegue).
- Latencia y throughput: no hay datos oficiales. Para Z-Image-Turbo se menciona latencia sub-segundo en H800, pero para Z-Image base no se indica.

## Comparativa con modelos similares

No hay datos comparativos oficiales en la información proporcionada. Sin embargo, Z-Image se posiciona como un modelo base de 6 B parámetros, similar en tamaño a otros modelos de difusión de imagen como FLUX (12 B) o SDXL (2,6 B). La falta de benchmarks públicos impide una comparación cuantitativa. Se recomienda evaluar el modelo en el caso de uso concreto antes de elegirlo.

## Limitaciones y advertencias

- Sesgos conocidos: no se han publicado análisis de sesgos para Z-Image. Como modelo de generación de imágenes, puede heredar sesgos de los datos de entrenamiento (no especificados), lo que podría producir estereotipos o representaciones no deseadas.
- Riesgo de alucinación: en generación de imágenes, el modelo puede generar objetos o detalles que no se corresponden con el prompt, especialmente en escenas complejas. Se recomienda usar CFG con valores moderados y negative prompts para reducir estos artefactos.
- Limitaciones de idioma: la model card indica inglés como idioma soportado, aunque el ejemplo incluye texto en chino. El rendimiento en otros idiomas no está garantizado.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial y modificación, pero no se especifican limitaciones adicionales de uso.
- Limitaciones de contexto: al ser un modelo de imagen, no tiene contexto de texto largo; el prompt se procesa como una única instrucción. Para prompts muy largos, el rendimiento puede degradarse.
- Advertencia de producción: al ser un modelo base no destilado, requiere más pasos de inferencia (28-50) que versiones destiladas (como Turbo con 8 pasos), lo que aumenta la latencia en producción. Se debe evaluar la velocidad según el hardware disponible.

## Enlaces

- HuggingFace: [Tongyi-MAI/Z-Image](https://huggingface.co/Tongyi-MAI/Z-Image)
- GitHub: [Tongyi-MAI/Z-Image](https://github.com/Tongyi-MAI/Z-Image)
- Paper (arXiv): [arXiv:2511.22699](https://arxiv.org/abs/2511.22699)
- Blog oficial: [Z-Image Blog](https://tongyi-mai.github.io/Z-Image-blog/)
- Demo online (HF): [Z-Image Space](https://huggingface.co/spaces/Tongyi-MAI/Z-Image)
- ModelScope: [Tongyi-MAI/Z-Image](https://www.modelscope.cn/models/Tongyi-MAI/Z-Image)
- Web oficial: [tongyi-mai.com](https://tongyi-mai.com/)
