# yamanacn/oldx_personswap_qwenimage2.1

## Resumen

OLDX Person Swap es un LoRA de edición de imagen especializado en el intercambio de personas entre dos fotografías. Desarrollado por el usuario yamanacn y publicado en Hugging Face, se entrena sobre el modelo base Qwen/Qwen-Image-2.1 y resuelve un problema concreto: trasladar la identidad de una persona (figura en la imagen 1) a una escena objetivo (imagen 2), manteniendo la pose, la iluminación y el fondo de esta última. El resultado es un adaptador de bajo rango que se integra en flujos de trabajo de ComfyUI mediante un pipeline de image-to-image.

El modelo no es un modelo fundacional autónomo, sino un adaptador LoRA que depende completamente del modelo base Qwen-Image-2.1 y de sus componentes auxiliares (VAE, codificador de texto). Su relevancia radica en que aborda una tarea de edición de imagen de alta demanda en producción creativa y publicidad, donde el intercambio de sujetos con preservación de contexto suele requerir modelos cerrados. Según el autor, en pruebas ciegas sobre escenas concretas supera a GPT y Seedream 5.0 Pro. El repositorio ocupa 0.2 GB y el adaptador se distribuye en formato safetensors.

La licencia es qwen-research, heredada del modelo base, y el soporte de idiomas del pipeline se limita a chino e inglés. Se trata de un adaptador de nicho, con cero descargas en el momento de la consulta y cuatro valoraciones positivas, orientado a usuarios de ComfyUI con necesidades específicas de sustitución de personas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre Qwen-Image-2.1 (modelo de difusión) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | El LoRA se distribuye sin cuantizar (safetensors); el modelo base referenciado en el flujo usa int8 (convrot) y bf16 para el VAE |
| Idiomas soportados | zh, en |
| Licencia | qwen-research (other) |
| Formato de pesos | safetensors (LoRA); el pipeline completo usa safetensors para base, codificador de texto y VAE |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre Qwen-Image-2.1, un modelo de difusión para generación y edición de imágenes. La información disponible no detalla el rango del adaptador, el número de módulos afectados ni el volumen o composición del dataset de entrenamiento. El autor indica que el LoRA se entrena específicamente para la tarea de sustitución de personas, con énfasis en preservar la pose, el fondo y la iluminación de la imagen objetivo.

El flujo de inferencia documentado emplea el modelo base en cuantización int8 (`qwen_image_2.1_int8_convrot.safetensors`), un codificador de texto basado en Qwen3-VL de 8B (`qwen3vl_8b_int8_convrot.safetensors`), un VAE en bf16 y, opcionalmente, un LoRA de aceleración de 6 pasos de PrunaAI. El muestreo recomendado usa `SamplerCustomAdvanced` con sampler `euler`, CFG 1 y una secuencia de sigmas específica de 6 pasos. La palabra de activación es `<rwth>`, que debe preceder al prompt. No se especifican detalles sobre RLHF, DPO ni innovaciones de atención en la información proporcionada.

## Capacidades

- Edición de imagen image-to-image: sustitución de la persona de una imagen por la de otra, conservando pose, fondo y luz de la escena objetivo.
- Preservación de contexto visual: mantiene la iluminación, la dirección de la luz y la composición de la imagen de destino.
- Sustitución de múltiples personas en una misma escena (el autor muestra ejemplos de doble reemplazo).
- Control mediante prompts de edición detallados, con soporte para instrucciones sobre vestuario, expresión, peinado y posición.
- Integración con ComfyUI mediante un flujo de trabajo JSON incluido en el repositorio.
- Compatibilidad con LoRA de aceleración de 6 pasos para reducir el coste de muestreo.
- Soporte de máscaras opcionales para restringir la región de edición en casos complejos.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de texto; es exclusivamente un adaptador de edición de imagen.

## Casos de uso

- Producción publicitaria con modelos: sustituir la figura de un modelo por otra persona manteniendo la escena, la iluminación y el vestuario de la campaña, sin repetir la sesión fotográfica.
- Catálogos de moda: generar variantes de una misma prenda sobre distintas personas conservando la pose del catálogo original, útil para probar diversidad de tallas y perfiles.
- Previsualización de casting: insertar el rostro o la figura de un actor candidato en una escena ya rodada o maquetada para evaluar encaje visual antes de contratar.
- Edición fotográfica profesional: reemplazar a un sujeto en una fotografía de grupo o de evento cuando la toma original no es válida, respetando la luz y la composición.
- Contenido para redes sociales: crear variaciones de una misma escena con distintas personas a partir de una plantilla, manteniendo coherencia visual entre publicaciones.
- Prototipado en estudios de diseño: probar cómo queda una figura humana en un entorno renderizado o fotografiado antes de la producción final, con resultados en torno a 10 segundos por muestra en RTX 5090 a 6 pasos y 2 megapíxeles.
- Flujos de trabajo en ComfyUI: integrar el adaptador en pipelines automatizados de edición por lotes usando el JSON de workflow incluido y los nodos de terceros indicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la información disponible. El autor menciona comparaciones ciegas cualitativas frente a GPT y Seedream 5.0 Pro en las escenas probadas, pero no aporta métricas numéricas. El único dato de rendimiento disponible es la latencia: aproximadamente 10 segundos por muestra en una RTX 5090 con 6 pasos y 2 megapíxeles de resolución.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el flujo completo requiere cargar el modelo base Qwen-Image-2.1 en int8, el codificador de texto Qwen3-VL de 8B en int8 y el VAE en bf16, lo que en conjunto exige una GPU de gama alta con VRAM considerable.
- GPU recomendadas: el autor reporta pruebas en RTX 5090; por el perfil del pipeline se recomiendan GPU con al menos 24 GB de VRAM (RTX 4090, RTX 5090, A100, H100).
- Compatibilidad con GPU de consumo: probable en RTX 4090 y RTX 5090 gracias a las cuantizaciones int8 del base y del codificador; no confirmado para GPU de 16 GB o menos.
- Opciones de despliegue: ComfyUI (flujo principal, con workflow JSON incluido); RunningHub como ejecución en la nube sin instalación local.
- Nodos de terceros necesarios: rgthree-comfy, was-node-suite, ComfyUI_LayerStyle, ComfyUI-KJNodes y ComfyUI-Easy-Use, instalables vía ComfyUI Manager.
- Latencia: aproximadamente 10 segundos por muestra en RTX 5090 con 6 pasos y 2 megapíxeles; el throughput no está documentado.
- Aceleración opcional: LoRA de 6 pasos de PrunaAI (`p_q_image_2.1_6_steps_v0.2`) con fuerza 1.0, sampler euler y CFG 1.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLDX Person Swap (este LoRA) | LoRA sobre Qwen-Image-2.1 | no disponible | no disponible | qwen-research | Hugging Face, RunningHub |
| Qwen-Image-2.1 (base) | Modelo de difusión image-to-image | no disponible | no disponible | qwen-research | Hugging Face |
| GPT (comparación del autor) | Modelo cerrado de edición de imagen | no disponible | no disponible | propietaria | API |
| Seedream 5.0 Pro (comparación del autor) | Modelo cerrado de edición de imagen | no disponible | no disponible | propietaria | API |

La comparación se basa en la referencia cualitativa del autor, que afirma que el LoRA supera a GPT y Seedream 5.0 Pro en las escenas probadas. No hay datos cuantitativos que permitan una comparación objetiva de rendimiento, y los parámetros y contextos de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del modelo base Qwen-Image-2.1 y de sus componentes (VAE, codificador de texto); no funciona de forma autónoma.
- Licencia qwen-research: restringe el uso comercial; es imprescindible revisar los términos del modelo base antes de cualquier despliegue en producción.
- El adaptador está entrenado para una tarea muy específica (sustitución de personas); no es un modelo generalista de edición.
- Cuando los encuadres de origen y destino difieren mucho (por ejemplo, cuerpo entero frente a medio cuerpo), la pose puede no coincidir y requiere máscaras manuales.
- En escenas con múltiples personas u oclusiones, la estabilidad depende de prompts muy detallados; el propio autor indica que la mayoría de fallos se deben a prompts pobres.
- El soporte de idiomas del pipeline se limita a chino e inglés; el prompt de edición debe formularse en estos idiomas.
- Riesgo de uso indebido: el autor advierte explícitamente contra la suplantación de identidad y la creación de contenido engañoso; solo debe usarse con imágenes sobre las que se tengan derechos.
- No hay datos publicados sobre sesgos del adaptador, tasas de alucinación visual ni métricas de fidelidad de identidad.
- El repositorio tiene cero descargas en el momento de la consulta, por lo que la validación por parte de la comunidad es todavía nula.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/yamanacn/oldx_personswap_qwenimage2.1
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Componentes del modelo base en Comfy-Org: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main/diffusion_models
- Codificadores de texto: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main/text_encoders
- VAE: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/tree/main/vae
- LoRA de aceleración de 6 pasos (PrunaAI): https://huggingface.co/PrunaAI/P-Q-Image-2.1
- Workflow en RunningHub: https://www.runninghub.cn/post/2117188707445993474
- Canal de Bilibili del autor: https://space.bilibili.com/5758057
- rgthree-comfy: https://github.com/rgthree/rgthree-comfy
- was-node-suite: https://github.com/WASasquatch/was-node-suite-comfyui
- ComfyUI_LayerStyle: https://github.com/chflame163/ComfyUI_LayerStyle
- ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- ComfyUI-Easy-Use: https://github.com/yolain/ComfyUI-Easy-Use
