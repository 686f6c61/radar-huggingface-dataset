# spyrostheboss/Leah_Halton_Krea_2_LoRA

## Resumen

El modelo `spyrostheboss/Leah_Halton_Krea_2_LoRA` es un adaptador de tipo LoRA (Low-Rank Adaptation) diseñado para el modelo base de generación de imágenes Krea 2 Raw, desarrollado por Krea AI. Su propósito es reproducir de forma consistente la apariencia facial y los rasgos de la modelo e influencer Leah Halton en diferentes poses, expresiones, atuendos y composiciones. El autor, `spyrostheboss`, ha entrenado este adaptador sobre un conjunto de 308 imágenes para capturar detalles reconocibles como el peinado, los ojos y las pecas.

El adaptador se distribuye como un único archivo `safetensors` de aproximadamente 0,5 GB y se integra en el pipeline de Krea 2 mediante el script de inferencia `musubi-tuner` o directamente en ComfyUI. Al ser un LoRA, no es un modelo autónomo: requiere el modelo base Krea 2 Raw (o Turbo para inferencia) y un texto de activación (`leahton`) como primer token del prompt. Su relevancia radica en la creciente demanda de LoRAs de personaje para modelos de imagen de alta calidad, permitiendo a creadores generar contenido con identidad visual estable sin necesidad de reentrenar un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Krea-2/lora (`networks.lora_krea2`) |
| Parametros totales | no disponible (LoRA, red de bajo rango con dim 32 y alpha 32) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible (entrenado con base fp8, pero el archivo del LoRA no especifica cuantizacion) |
| Idiomas soportados | no disponibles (el prompt se procesa mediante el text encoder Qwen3-VL-4B, que soporta multiples idiomas, pero no se especifica) |
| Licencia | other (no se detallan los terminos exactos) |
| Formato de pesos | safetensors (unico archivo `leahton_krea2.safetensors`) |

## Arquitectura y entrenamiento

El adaptador sigue la arquitectura LoRA estandar para Krea 2, implementada en el repositorio `krea-ai/krea-2`. Se entrena sobre el modelo base Krea 2 Raw (`raw.safetensors`) con una red de bajo rango de dimension 32 y alpha 32. El entrenamiento se realizo con 308 imagenes, 5 epocas (385 pasos), batch size efectivo de 4 (1 con gradiente acumulado de 4), optimizador AdamW8bit, learning rate constante de 1e-4 sin warmup, y resolucion de 1024x1024 con bucketing. Se utilizo muestreo de timestep `krea2_shift`, sin esquema de ponderacion, y precision mixta bf16 con base fp8. El text encoder (Qwen3-VL-4B) y el VAE (Qwen-Image) se mantuvieron congelados durante el entrenamiento. El seed fijo fue 42.

No se proporcionan detalles sobre la composicion del dataset de entrenamiento mas alla del numero de imagenes, ni se menciona el uso de tecnicas como RLHF o DPO. La innovacion principal es la adaptacion de bajo rango para capturar la identidad de una persona concreta, un enfoque comun en LoRAs de personaje.

## Capacidades

- Generacion de imagenes de texto a imagen: reproduce la apariencia de Leah Halton en diversos escenarios, poses, expresiones y atuendos.
- Consistencia de identidad: mantiene rasgos faciales reconocibles (cabello ondulado castano, ojos marrones claros, pecas) a lo largo de diferentes generaciones.
- Activacion por palabra clave: requiere el token `leahton` como primer token del prompt para activar el adaptador.
- Compatibilidad con Krea 2 Turbo: recomendado para inferencia rapida con 8 pasos y CFG desactivado (guidance scale 1, mu 1.15).
- Integracion con herramientas de flujo de trabajo: se puede cargar en ComfyUI o mediante el script de inferencia de musubi-tuner.
- No incluye capacidades de tool calling, agentes, razonamiento multimodal ni procesamiento de audio o video; es exclusivamente un adaptador de generacion de imagenes.

## Casos de uso

- Creacion de contenido para redes sociales: generar imagenes de Leah Halton en diferentes escenarios para publicaciones, banners o avatares, manteniendo una identidad visual coherente.
- Ilustracion y arte conceptual: usar el LoRA como base para crear ilustraciones digitales con la apariencia de la modelo, combinando el prompt con estilos artisticos adicionales.
- Prototipado de campanas publicitarias: simular anuncios o materiales de marketing con una figura reconocible sin necesidad de sesiones fotograficas reales.
- Desarrollo de personajes para narrativa visual: generar multiples imagenes de un mismo personaje ficticio basado en la apariencia de Leah Halton para comics, novelas graficas o storyboards.
- Personalizacion de avatares en aplicaciones: integrar el LoRA en pipelines de generacion de avatares para juegos o entornos virtuales, siempre que se respete la licencia y el consentimiento.
- Experimentacion creativa en flujos de trabajo de IA: probar la interaccion del adaptador con diferentes prompts, estilos y configuraciones de Krea 2 para explorar variaciones esteticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos objetivos sobre metricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros LoRAs de personaje. El unico dato de rendimiento es el numero de pasos recomendado (8) y la configuracion de inferencia, pero sin mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible. El LoRA en si ocupa 0,5 GB, pero el modelo base Krea 2 Raw o Turbo requiere una GPU con suficiente memoria para inferencia de imagenes a 1024x1024. Se estima que al menos 8-12 GB de VRAM son necesarios, aunque no se confirma.
- GPU recomendadas: no se especifican modelos concretos. Dado el tamaño del LoRA y la naturaleza del modelo base, GPUs consumer como RTX 3060 (12 GB), RTX 4070 o superiores deberian ser suficientes para inferencia basica. Para mayor velocidad, se recomienda una GPU con soporte para bf16 y fp8.
- Compatibilidad con consumer GPU: probablemente si, dado el tamaño reducido del adaptador, pero depende del modelo base.
- Opciones de despliegue: ComfyUI (carga directa del archivo safetensors) o el script de inferencia de musubi-tuner del repositorio Krea 2. No se mencionan otros motores como vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen del hardware y de la configuracion (8 pasos, CFG off).

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros LoRAs de personaje para Krea 2 o para otros modelos base (como Flux o SDXL). Existen otros LoRAs de Leah Halton en plataformas como SeaArt (basado en Flux) y colecciones en CivitAI, pero no se conocen sus especificaciones tecnicas ni su rendimiento. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos y derechos de imagen: el modelo reproduce la apariencia de una persona real (Leah Halton). Su uso puede infringir derechos de imagen, privacidad o consentimiento, especialmente en contextos comerciales o publicos. Es responsabilidad del usuario verificar la legalidad y etica de su aplicacion.
- Riesgo de alucinacion visual: como cualquier modelo de generacion de imagenes, puede producir artefactos, distorsiones o variaciones no deseadas en los rasgos faciales, especialmente con prompts complejos o fuera de la distribucion de entrenamiento.
- Dependencia del modelo base: el LoRA no funciona de forma autonoma; requiere Krea 2 Raw o Turbo. Cambios en el modelo base pueden afectar la calidad o la consistencia de la identidad.
- Licencia restrictiva: la licencia se indica como `other`, sin detalles sobre usos permitidos o prohibidos. No se garantiza el uso comercial.
- Limitaciones de idioma: aunque el text encoder Qwen3-VL-4B soporta multiples idiomas, no se especifica el rendimiento del LoRA con prompts en idiomas distintos del ingles. Se recomienda usar el token de activacion en minusculas y prompts en ingles para resultados optimos.
- Sin soporte para otras tareas: el adaptador solo genera imagenes; no procesa texto, audio ni video.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spyrostheboss/Leah_Halton_Krea_2_LoRA
- Pagina oficial de Krea 2: https://www.krea.ai/krea-2
- Repositorio de Krea 2 (implementacion): https://github.com/krea-ai/krea-2
- Perfil de Krea en Hugging Face: https://huggingface.co/krea
- Modelo alternativo de Leah Halton en SeaArt: https://www.seaart.ai/models/detail/7371584d0bc97461a77e36a37c1d1936
- Archivo de modelos de IA (CivitAI, TensorArt, SeaArt): https://civitaiarchive.com/
- Coleccion de LoRAs de Krea 2 en CivitAI: https://civitai.com/models/2181922/rebelreal-lora-collection
