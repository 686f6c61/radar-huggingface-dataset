# Umranz/SD3.5-Medium-Uncensored

## Resumen

SD3.5-Medium-Uncensored es una versión modificada ("abliterated") de Stable Diffusion 3.5 Medium de Stability AI, publicada por el usuario Umranz en Hugging Face. El modelo conserva la arquitectura original MM-DiT (Multimodal Diffusion Transformer) de 2.469 millones de parámetros, pero ha sido alterado en sus proyecciones de condicionamiento para eliminar el alineamiento de seguridad que bloquea ciertos tipos de contenido en el modelo base. El método empleado se denomina "Calibrated Closed-Form Subspace Projection" (framework Heretic-DiT), aplicado sobre los módulos `context_embedder` y `linear_1`.

El problema que resuelve es el de los usuarios que consideran excesivo el filtrado del modelo original: al tratarse de ediciones permanentes en los pesos (no de modificaciones en tiempo de inferencia), el sobrecoste es de 0 ms y no requiere prompts especiales ni clasificadores externos. La resolución nativa se mantiene en 1024×1024 y el pipeline compatible sigue siendo `StableDiffusion3Pipeline` de la librería diffusers.

Es relevante porque ilustra una tendencia creciente en el ecosistema open source: la derivación de modelos de difusión sin filtros a partir de pesos con licencia comunitaria. Sin embargo, esto conlleva implicaciones legales y éticas significativas, ya que la licencia original (stabilityai-ai-community) impone condiciones de uso que el autor de esta derivación podría no estar cumpliendo, y el modelo puede generar contenido que otros lanzamientos bloquean deliberadamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MM-DiT (Multimodal Diffusion Transformer) |
| Parametros totales | 2.469.663.936 (≈2,47 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion text-to-image) |
| Tipos de cuantizacion | bfloat16 (recomendado en el ejemplo de uso); no disponible mas informacion |
| Idiomas soportados | Ingles (prompts) |
| Licencia | stabilityai-ai-community (Stability AI Community License) |
| Formato de pesos | safetensors (16,3 GB de tamano de repo) |

## Arquitectura y entrenamiento

El modelo base es Stable Diffusion 3.5 Medium, que emplea una arquitectura MM-DiT: un transformer de difusion con ramas separadas para el embedding de texto y el embedding de imagen que se combinan mediante attention conjunta. La resolucion nativa es de 1024×1024 pixeles. No se ha reentrenado: se trata de una modificacion quirurgica de pesos preexistentes.

La modificacion ("abliteration") se aplica sobre dos modulos concretos: el `context_embedder` (proyeccion de 4096 a 1536 dimensiones) y el `linear_1` (de 2048 a 1536 dimensiones). Segun la model card, se utiliza el metodo Heretic-DiT de proyeccion de subespacio en forma cerrada, calibrado con regularizacion de identidad gamma = 15.0, segun la formula:

W* = W₀ (M_ae + λ_p·M_pp + γI)(M_ee + λ_p·M_pp + γI)⁻¹, con ΔW = (W* − W₀)·V₂V₂ᵀ

Esto elimina las direcciones del espacio latente asociadas a los rechazos de seguridad, dejando los cambios "horneados" permanentemente en los pesos. No hay informacion sobre datos de entrenamiento adicionales, RLHF/DPO ni numero de tokens, lo cual es coherente con que no se trata de un reentrenamiento.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) a resolucion nativa 1024×1024, sin el filtrado de contenido del modelo original
- Compatibilidad total con el pipeline `StableDiffusion3Pipeline` de diffusers, incluyendo los parametros estandar (`num_inference_steps`, `guidance_scale`, dimensiones de imagen)
- Ejecucion en bfloat16 sin perdida de funcionalidad respecto al modelo base
- Sin sobrecoste de inferencia (0 ms) respecto a Stable Diffusion 3.5 Medium, al estar las modificaciones integradas en los pesos
- Generacion de contenido que el modelo base rechazaria, incluyendo desnudos y material sensible (con las implicaciones legales que ello conlleva)
- No hay informacion sobre soporte de edicion de imagen, inpainting, ControlNet u otras extensiones; en principio heredaria lo que el ecosistema SD 3.5 ofrezca, pero no esta confirmado en la model card

## Casos de uso

- Generacion artistica sin filtros: creacion de ilustraciones y arte digital donde el modelo base rechazaria prompts por falsos positivos del filtro de seguridad, manteniendo la misma calidad de imagen que SD 3.5 Medium
- Investigacion en alineamiento de modelos de difusion: estudio de tecnicas de abliteration sobre arquitecturas MM-DiT, analisis de como las proyecciones de condicionamiento codifican los comportamientos de rechazo
- Investigacion en seguridad de modelos: evaluacion de la robustez de los alineamientos de seguridad y desarrollo de contramedidas frente a tecnicas de eliminacion de filtros
- Generacion de contenido artistico con figuras humanas: produccion de imagenes con anatomia realista para proyectos artisticos o editoriales donde el filtro del modelo original bloquea la generacion
- Prototipado creativo local: uso en estaciones de trabajo con GPU de consumo gracias a su tamano contenido (2,47 B de parametros), sin depender de APIs de terceros
- Integracion en pipelines de diffusers existentes: sustitucion directa del checkpoint de SD 3.5 Medium en codigo ya existente, ya que conserva la interfaz del pipeline original

Debe subrayarse que cualquier uso que genere contenido sexual explícito, no consentido o ilegal puede violar la licencia de Stability AI y la legislacion aplicable. El responsable del uso es quien despliega el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de una modificacion de pesos de SD 3.5 Medium sin reentrenamiento, la calidad de imagen esperable es la del modelo base, pero no existen metricas publicadas (FID, CLIP score, etc.) que cuantifiquen posibles degradaciones derivadas de la abliteration.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16, el checkpoint ocupa aproximadamente 5 GB; se recomienda una GPU con al menos 8-10 GB de VRAM para inferencia comoda a 1024×1024 (estimacion basada en el tamano del modelo, no confirmada por el autor)
- GPU recomendadas: RTX 3060 12 GB, RTX 4070/4080, RTX 4090 para uso local; A100 o H100 para servicion en lotes o alta concurrencia
- Cabe en GPUs de consumo: si, al tratarse de un modelo de 2,47 B de parametros, es viable en GPUs gaming de gama media-alta
- Despliegue: diffusers (libreria nativa, `StableDiffusion3Pipeline`); la compatibilidad con llama.cpp, Ollama, vLLM o TGI no aplica al ser un modelo de difusion, aunque podria funcionar con backends de difusion como ComfyUI (no confirmado en la model card)
- Latencia y throughput: no disponible; al no haber sobrecoste de abliteration (0 ms declarado), los tiempos serian los de SD 3.5 Medium estandar en el mismo hardware

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Licencia | Filtrado de seguridad |
|---|---|---|---|---|
| Umranz/SD3.5-Medium-Uncensored | 2,47 B | MM-DiT | stabilityai-ai-community | Eliminado (abliteration) |
| stabilityai/stable-diffusion-3.5-medium | 2,5 B | MM-DiT | stabilityai-ai-community | Incluido en el modelo base |
| black-forest-labs/FLUX.1-schnell | 12 B | MM-DiT (rectified flow) | Apache 2.0 | Filtro parcial via prompts |

SD3.5-Medium-Uncensored ofrece la misma arquitectura y tamano que SD 3.5 Medium pero sin el alineamiento de seguridad, a costa de posibles degradaciones no documentadas y de una situacion legal mas delicada. FLUX.1-schnell es mas grande (12 B) y con licencia Apache 2.0 mas permisiva, pero no es una version "uncensored" declarada.

## Limitaciones y advertencias

- Riesgo elevado de generacion de contenido problematico: al eliminarse el filtro de seguridad, el modelo puede producir imagenes sexuales explicitas, NSFW u otro contenido sensible sin restriccion alguna, con responsabilidad legal plena para el usuario
- Posible degradacion de calidad: las tecnicas de abliteration pueden alterar el espacio latente y degradar la coherencia o el seguimiento de prompts; no hay benchmarks que lo cuantifiquen
- Licencia: la Stability AI Community License impone restricciones (limites de ingresos anuales para uso comercial, prohibicion de ciertos usos). No esta claro que una derivacion "uncensored" redistribuida por terceros cumpla los terminos; conviene revisar la licencia antes de cualquier uso
- Idioma: los prompts funcionan en ingles; el rendimiento en castellano u otros idiomas no esta documentado
- Advertencia del propio repositorio: el modelo ha sido creado mediante tecnicas de eliminacion de alineamiento ("safety-alignment-removal"), lo que lo situa en una zona gris etica y legalmente
- Baja traccion comunitaria: con 22 descargas y 1 like en el momento de la ficha, no existe validacion comunitaria, documentacion ampliada ni reportes de problemas
- No hay informacion sobre soporte de resoluciones distintas de 1024×1024, ni sobre compatibilidad con extensiones del ecosistema SD 3.5

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Umranz/SD3.5-Medium-Uncensored
- Modelo base (Stable Diffusion 3.5 Medium): https://huggingface.co/stabilityai/stable-diffusion-3.5-medium
- Libreria diffusers: https://github.com/huggingface/diffusers
- No se han encontrado enlaces a papers, blogs oficiales ni demos en la informacion disponible
