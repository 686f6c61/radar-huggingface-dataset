# webnn/sd-turbo-webnn

## Resumen

SD-Turbo-WebNN es una conversión a ONNX del modelo SD-Turbo de Stability AI, optimizada específicamente para su ejecución mediante WebNN, la API de aceleración de inferencia de hardware web impulsada por Microsoft. El modelo subyacente, SD-Turbo, es una versión destilada de Stable Diffusion 2.1 entrenada con la técnica Adversarial Diffusion Distillation (ADD), que permite generar imágenes fotorrealistas a partir de un prompt de texto en una sola evaluación de red (1-4 pasos de muestreo), en lugar de las decenas de pasos requeridas por los modelos de difusión convencionales.

La versión WebNN mantiene el pipeline text-to-image original pero aplica dos modificaciones clave para su despliegue en navegador: el uso de formas de entrada estáticas (static input shapes) y la eliminación de operadores no utilizados, lo que reduce la sobrecarga y facilita la compilación del grafo por parte de los backends de WebNN. El repositorio ocupa 3,1 GB y está pensado exclusivamente para fines educativos y de prueba, según indica el propio autor.

Este modelo resulta relevante porque ejemplifica la tendencia de ejecutar modelos generativos directamente en el cliente (navegador) sin depender de infraestructura de servidor, aprovechando aceleración por GPU o NPU a través de WebNN. No obstante, su licencia es no comercial (Stability AI Non-Commercial Research Community License) y su calidad y alineación con el prompt son inferiores a las de SDXL-Turbo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion model (UNet + VAE + text encoder), destilado de Stable Diffusion 2.1 mediante Adversarial Diffusion Distillation (ADD); exportado a ONNX con formas estáticas |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo text-to-image; resolución de salida 512x512) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (el prompt de texto se procesa con el text encoder de SD 2.1, predominantemente inglés) |
| Licencia | Stability AI Non-Commercial Research Community License Agreement |
| Formato de pesos | ONNX |
| Tamano del repositorio | 3,1 GB |
| Pipeline | text-to-image |
| Resolucion de imagen | 512x512 (fija en el modelo base) |

## Arquitectura y entrenamiento

El modelo base SD-Turbo es una destilación de Stable Diffusion 2.1 que emplea Adversarial Diffusion Distillation (ADD). Este método combina destilación por score (score distillation) usando el modelo de difusión profesor de gran escala como señal, junto con una pérdida adversarial que garantiza alta fidelidad de imagen incluso en el régimen de uno o dos pasos de muestreo. El resultado es un modelo capaz de sintetizar imágenes fotorrealistas en una única evaluación de red, sin necesidad de guidance scale ni negative prompt (se desactiva con `guidance_scale=0.0`).

La conversión a WebNN transforma el pipeline a formato ONNX con formas de entrada estáticas y elimina operadores que no se utilizan en la inferencia, lo que simplifica el grafo y mejora la compatibilidad con los backends de WebNN. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables de forma estándar a modelos de difusión). La innovación técnica destacable es precisamente el método ADD de destilación adversarial, que reduce drásticamente el número de pasos de muestreo.

## Capacidades

- Generación de imágenes text-to-image en 1-4 pasos de muestreo (una sola evaluación de red suficiente para alta calidad).
- Generación image-to-image, con la restricción de que `num_inference_steps * strength` debe ser mayor o igual a 1.
- Síntesis de imágenes fotorrealistas de 512x512 píxeles (aunque admite tamaños superiores).
- Ejecución en navegador mediante WebNN, con aceleración por GPU/NPU del cliente.
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-step en el sentido de LLM.
- Capacidades multilingües limitadas al text encoder heredado de SD 2.1 (predominantemente inglés).
- No renderiza texto legible en las imágenes generadas.

## Casos de uso

- Demostraciones educativas en navegador: el modelo está pensado para usarse con la demo de WebNN Developer Preview de Microsoft, permitiendo mostrar generación de imágenes en tiempo real sin backend.
- Pruebas de compatibilidad de WebNN: sirve para validar que un backend de WebNN (GPU, NPU) ejecuta correctamente un pipeline de difusión con formas estáticas.
- Prototipado de aplicaciones creativas client-side: generación de bocetos o ilustraciones directamente en el navegador del usuario, sin enviar prompts a un servidor.
- Investigación sobre modelos de difusión destilados: permite estudiar el comportamiento de ADD en entornos de inferencia web y con recursos limitados.
- Generación de arte y diseño asistido: creación de imágenes de referencia para procesos artísticos, con la ventaja de la baja latencia de un solo paso.
- Evaluación comparativa de backends de inferencia web: al ser un modelo pequeño (3,1 GB) y de un solo paso, es útil como benchmark de latencia y throughput en distintos navegadores y hardware.
- Educación sobre privacidad en IA generativa: al ejecutarse en el cliente, los prompts no salen del dispositivo, lo que permite ilustrar arquitecturas de inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo pesa 3,1 GB en ONNX, por lo que se requiere al menos esa cantidad de memoria (o memoria unificada en el caso de WebNN en navegador).
- GPU recomendadas: no disponible; al ejecutarse vía WebNN, depende del backend disponible en el navegador (GPU integrada, GPU dedicada o NPU compatible con WebNN).
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del repo (3,1 GB) y la naturaleza de un solo paso, aunque no se documentan requisitos mínimos.
- Opciones de despliegue: WebNN (navegador, vía la demo de Microsoft), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Pasos de muestreo | Licencia | Formato |
|---|---|---|---|---|---|
| SD-Turbo-WebNN | no disponible | 512x512 | 1-4 | No comercial (Stability AI) | ONNX |
| SD-Turbo (original) | no disponible | 512x512 | 1-4 | No comercial (Stability AI) | safetensors |
| SDXL-Turbo | no disponible | 512x512 (base) | 1-4 | No comercial (Stability AI) | safetensors |
| Stable Diffusion 2.1 | no disponible | 512x512 | decenas | CreativeML Open RAIL++-M | safetensors |

SD-Turbo-WebNN se diferencia de SD-Turbo únicamente en el formato (ONNX con formas estáticas) y en el objetivo de despliegue (WebNN en navegador). Frente a SDXL-Turbo, este último ofrece mayor calidad y mejor alineación con el prompt, según indica la propia model card. Frente a Stable Diffusion 2.1, SD-Turbo reduce drásticamente el número de pasos necesarios a costa de cierta pérdida de calidad y alineación.

## Limitaciones y advertencias

- La calidad y la alineación con el prompt son inferiores a las de SDXL-Turbo.
- Las imágenes generadas son de resolución fija de 512x512 píxeles y no alcanzan un fotorrealismo perfecto.
- El modelo no puede renderizar texto legible.
- Las caras y las personas en general pueden no generarse correctamente.
- La parte de autoencoding del modelo es con pérdida (lossy).
- El modelo no fue entrenado para representar de forma factual personas o eventos reales; su uso para ello queda fuera de alcance.
- Licencia no comercial: el uso comercial requiere remitirse a https://stability.ai/membership.
- El modelo está pensado exclusivamente para fines educativos o de prueba, según el autor de la conversión WebNN.
- Riesgo de sesgos heredados de Stable Diffusion 2.1 y de su dataset de entrenamiento (no detallado en la información disponible).
- Riesgo de alucinación visual: el modelo puede generar contenido no solicitado o inexacto respecto al prompt.
- No se documentan idiomas soportados ni cuantizaciones disponibles, lo que limita su evaluación para producción.

## Enlaces

- HuggingFace: https://huggingface.co/webnn/sd-turbo-webnn
- Modelo original SD-Turbo: https://huggingface.co/stabilityai/sd-turbo
- SDXL-Turbo: https://huggingface.co/stabilityai/sdxl-turbo/
- Stable Diffusion 2.1: https://huggingface.co/stabilityai/stable-diffusion-2-1
- Licencia SD-Turbo: https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE
- Acceptable Use Policy: https://stability.ai/use-policy
- Membresía comercial: https://stability.ai/membership
- Repositorio generative-models: https://github.com/Stability-AI/generative-models
- Paper ADD: https://stability.ai/research/adversarial-diffusion-distillation
- Demo WebNN Developer Preview: https://microsoft.github.io/webnn-developer-preview/
- Demo SDXL-Turbo (Clipdrop): http://clipdrop.co/stable-diffusion-turbo
