# tugrulv89/LTX_2.5-handler

## Resumen

Este repositorio es un mirror del modelo LTX-2.5 de Lightricks, publicado por el usuario `tugrulv89` con el objetivo de servir como bundle de despliegue en entornos serverless como RunPod. No contiene un modelo nuevo: todos los pesos están copiados byte a byte del repositorio oficial `Lightricks/LTX-2.5` y se rigen por la licencia comunitaria LTX-2.x. La utilidad de este mirror radica en que permite cachear únicamente los archivos necesarios para los pipelines de `ltx-pipelines`, evitando descargar los ~299 GB completos del repositorio original, que incluyen variantes int8 para ComfyUI que este despliegue no utiliza.

LTX-2.5 es un modelo fundacional de generación de vídeo y audio de Lightricks, basado en una arquitectura de transformer de difusión. Con 22 000 millones de parámetros, genera vídeo de alta calidad con sincronización de audio nativa, soporta multishot (múltiples tomas), y ofrece control fino mediante keyframes y upscaling latente. Su lanzamiento en código abierto lo convierte en una herramienta relevante para producción, investigación y experimentación en generación de contenido audiovisual.

El repositorio incluye el transformer destilado y el dev, el codificador de texto Gemma 4 12B, los VAEs de vídeo y audio, y un upscaler espacial latente x2. La resolución debe ser divisible por 64 en pipelines de dos etapas, y el número de frames debe cumplir `num_frames % 8 == 1`. La licencia es la LTX-2 Community License, que permite uso comercial con restricciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para vídeo y audio |
| Parámetros totales | 22B (transformer de difusión) |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | bf16, nvfp4 (prequantizado para Blackwell SM>=10), int8 (solo en el repo original, no en este mirror) |
| Idiomas soportados | No disponible (se espera multilingüe, pero no se especifica) |
| Licencia | LTX-2 Community License Agreement |
| Formato de pesos | safetensors (bf16 y nvfp4) |

## Arquitectura y entrenamiento

LTX-2.5 es un modelo de difusión aplicado a vídeo y audio. La arquitectura es un transformer de difusión (DiT) con 22B parámetros que procesa tokens de vídeo y audio de forma conjunta. El modelo incluye un codificador de texto basado en Gemma 4 12B con proyección, un VAE de vídeo y otro de audio, y un upscaler latente espacial x2. El entrenamiento combina datos de vídeo y audio, pero no se han publicado detalles específicos sobre el número de tokens de entrenamiento ni la composición del dataset. Existe una versión destilada (distilled) para inferencia rápida y una versión dev (development) para tareas como interpolación de keyframes y generación de vídeo a partir de imágenes en dos etapas. El modelo también incorpora un LoRA específico para el transformer dev. No se han publicado detalles sobre el uso de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen a partir de texto (image-to-video), con audio sincronizado.
- Generación de audio nativa (el modelo incluye un VAE de audio).
- Multishot: genera varias tomas o secuencias de vídeo en una sola pasada.
- Interpolación de keyframes: puede rellenar los fotogramas entre dos imágenes clave mediante el pipeline dev.
- Upscalado espacial latente x2 para mejorar la resolución.
- Soporte de dos modos de inferencia: destilado (rápido) y dev (más control, por ejemplo, para interpolación).
- Capacidad de procesar vídeo y audio de forma conjunta, lo que permite generar vídeo con sonido sincronizado.
- No se ha documentado soporte de tool calling ni de agentes.

## Casos de uso

- **Generación de vídeo promocional**: el modelo puede crear vídeos cortos con audio a partir de descripciones de texto, útil para campañas publicitarias o redes sociales. La generación destilada permite tiempos de respuesta aceptables en producción.
- **Creación de contenido educativo**: generar animaciones o vídeos explicativos con narración sincronizada, usando el pipeline de image-to-video para partir de imágenes de referencia.
- **Interpolación de keyframes en animación**: el pipeline dev permite insertar frames intermedios entre imágenes clave, facilitando el trabajo de animadores que definen poses clave.
- **Prototipado rápido de conceptos visuales**: en agencias de diseño, se puede usar para validar ideas de vídeo sin necesidad de producción costosa.
- **Investigación en generación audiovisual**: el modelo es abierto, por lo que investigadores pueden estudiar su comportamiento, fine-tuning o combinarlo con otros sistemas.
- **Despliegue serverless para aplicaciones SaaS**: el mirror está diseñado para funcionar en entornos con caché de modelo, permitiendo crear APIs de generación de vídeo bajo demanda con costos predecibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento como FID, CLIP score, o comparaciones con otros modelos. No se dispone de datos de latencia ni throughput.

## Requisitos de hardware

- El tamaño total del repositorio es de 140.75 GB, pero la inferencia no requiere cargar todos los archivos a la vez. El transformer destilado en bf16 ocupa ~42 GB, el codificador de texto ~26 GB, y los VAEs ~1.8 GB, más el upscaler de ~1 GB.
- Para el pipeline destilado con cuantización nvfp4, el transformer ocupa ~18.7 GB, lo que reduce la VRAM necesaria en GPUs Blackwell (SM >= 10).
- Se recomienda una GPU con al menos 80 GB de VRAM (por ejemplo, A100 80GB, H100 80GB) para el modo bf16 sin cuantización adicional.
- Para el modo nvfp4, se puede usar GPUs como RTX 4090 (24 GB) si se gestiona el espacio, pero el codificador de texto y los VAEs también deben caber; es posible que se necesite descargar algunos componentes.
- El despliegue se puede realizar con `ltx-pipelines`, que es el paquete que consume estos archivos. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que es un modelo de difusión de vídeo, no un LLM.
- Para despliegues serverless, este mirror permite cachear solo los archivos necesarios, reduciendo el tiempo de arranque en frío.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar LTX-2.5 con otros modelos de generación de vídeo como Sora, Runway Gen-3, o modelos open source como Open-Sora o Mochi. No se han publicado comparaciones en los materiales disponibles. Por tanto, no se puede realizar una comparativa objetiva.

## Limitaciones y advertencias

- **Licencia restrictiva**: La licencia LTX-2 Community License permite uso comercial, pero puede tener restricciones sobre el uso de los resultados o la reventa del modelo. Es necesario revisar el acuerdo completo en el enlace proporcionado.
- **Resolución y frames**: El modelo exige que la resolución sea divisible por 64 en pipelines de dos etapas y que el número de frames cumpla `num_frames % 8 == 1`. Si no se respetan estas restricciones, el modelo puede fallar o producir resultados incorrectos.
- **No es un modelo nuevo**: Este repositorio es un mirror; cualquier actualización del modelo original deberá propagarse manualmente.
- **Alucinaciones y sesgos**: Como todo modelo de generación, puede producir vídeos con contenido no deseado, alucinaciones visuales o sesgos en los datos de entrenamiento. No se han documentado sesgos específicos.
- **Consumo de recursos**: El modelo requiere una gran cantidad de VRAM y almacenamiento. En entornos serverless, el coste de ejecución puede ser alto.
- **Interoperabilidad**: Los archivos de LTX-2.3 no son intercambiables con los de LTX-2.5, y el LoRA solo funciona con el modelo para el que fue entrenado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tugrulv89/LTX_2.5-handler
- Repositorio original de Lightricks: https://huggingface.co/Lightricks/LTX-2.5
- Licencia: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- Guía completa de LTX-2.5 en HackerNoon: https://hackernoon.com/ltx-25-a-complete-guide-to-lightricks-audio-video-ai-model
- Página oficial del modelo open source: https://ltx.io/model/open-source
- Página oficial de LTX-2.5: https://ltx.io/model/ltx-2-5
