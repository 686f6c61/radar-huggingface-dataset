# spyrostheboss/Dylan_Conrique_Krea_2_LoRA

## Resumen

Este repositorio contiene un LoRA (Low-Rank Adaptation) de personaje para el modelo de generación de imágenes Krea 2, desarrollado por el usuario `spyrostheboss`. El LoRA está entrenado para reproducir la apariencia facial y las características distintivas de Dylan Conrique, una actriz y cantante estadounidense, manteniendo la identidad del personaje de forma consistente en diferentes poses, expresiones, atuendos, ángulos y composiciones.

El modelo se basa en el checkpoint `krea/Krea-2-Raw` y está diseñado para ser utilizado con el pipeline de inferencia de Krea 2, ya sea mediante ComfyUI o el script `musubi-tuner` oficial. El LoRA emplea una palabra de activación (`dylconr`) que debe colocarse como primer token del prompt para activar el estilo del personaje. Con un tamaño de repositorio de 0,5 GB y un único archivo `.safetensors`, es una solución ligera y específica para generar imágenes de este personaje con alta fidelidad.

La relevancia de este modelo radica en su especialización: en lugar de depender de prompts genéricos, ofrece un control fino sobre la identidad visual de un personaje concreto, algo útil para creadores de contenido, ilustradores y aficionados que necesitan consistencia en sus generaciones. Al estar basado en Krea 2, aprovecha las capacidades del modelo base, incluyendo su arquitectura de difusión y su text encoder Qwen3-VL-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Krea-2/lora (`networks.lora_krea2`) |
| Parametros totales | no disponible (LoRA, dimension 32/32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (entrenado en bf16 con base fp8) |
| Idiomas soportados | no disponibles |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors (archivo `dylconr_krea2.safetensors`) |

## Arquitectura y entrenamiento

El LoRA sigue la arquitectura estándar de adaptación de bajo rango para modelos de difusión, implementada mediante `networks.lora_krea2` del repositorio oficial de Krea 2. El entrenamiento se realizó sobre el checkpoint `Krea 2 Raw` (`raw.safetensors`) con una dimensión de red de 32 y un alpha de 32. Se utilizaron 237 imágenes de entrenamiento, procesadas en 5 épocas (300 pasos) con un batch size efectivo de 4 (batch size 1 con gradiente acumulado de 4). El optimizador fue AdamW8bit con una tasa de aprendizaje constante de 1e-4 y sin warmup.

El proceso de entrenamiento empleó un muestreo de timestep con esquema `krea2_shift`, resolución de 1024x1024 con bucketing, y precisión mixta bf16 (con base en fp8). El text encoder utilizado fue Qwen3-VL-4B (congelado) y el VAE fue el de Qwen-Image. El seed fijado fue 42. No se aplicó ningún esquema de ponderación adicional. El resultado es un archivo único de LoRA que se carga directamente en ComfyUI o mediante el script de inferencia de musubi-tuner.

## Capacidades

- Generación de imágenes de texto a imagen: el LoRA permite generar retratos y escenas del personaje Dylan Conrique con alta fidelidad facial.
- Consistencia de identidad: mantiene rasgos faciales reconocibles (cabello ondulado hasta los hombros, ojos marrones claros, pecas visibles) en diferentes poses, expresiones, atuendos y ángulos.
- Activación por palabra clave: el token `dylconr` (en minúsculas) debe ser el primer token del prompt para activar el LoRA.
- Compatibilidad con Krea 2 Turbo: recomendado para inferencia con el checkpoint Turbo, aunque el entrenamiento se hizo sobre Raw.
- Integración con herramientas estándar: funciona con ComfyUI y con el script de inferencia de Krea 2 (musubi-tuner).
- Resolución nativa de 1024x1024: optimizado para generar imágenes a esta resolución con bucketing durante el entrenamiento.

## Casos de uso

- Creación de retratos personalizados: el LoRA permite generar retratos de Dylan Conrique en estilos variados (realista, ilustración, etc.) manteniendo la identidad, útil para fan art o proyectos creativos.
- Ilustración de personajes para ficción: escritores o creadores de cómics pueden usar el LoRA para visualizar a un personaje inspirado en la actriz con consistencia en múltiples viñetas.
- Contenido para redes sociales: generación de imágenes atractivas para cuentas de fans o comunidades, con la posibilidad de variar escenarios y vestimenta.
- Pruebas de vestuario y estilismo: el modelo puede generar al personaje con diferentes atuendos y peinados, útil para diseñadores de moda o creadores de contenido.
- Prototipado de campañas publicitarias: agencias pueden usar el LoRA para crear mockups de anuncios con una modelo ficticia basada en la apariencia de Dylan Conrique.
- Experimentación artística: artistas digitales pueden combinar el LoRA con otros estilos o modificaciones para explorar variaciones creativas del personaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos sobre métricas de calidad de imagen (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros LoRAs de personaje.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del modelo. Al ser un LoRA, el consumo depende principalmente del modelo base Krea 2 (Raw o Turbo), que requiere una GPU con al menos 8-12 GB de VRAM para inferencia a 1024x1024 (estimación razonable para modelos de difusión de este tamaño, pero no confirmada).
- GPU recomendadas: no se indica un modelo concreto, pero GPUs de gama media-alta como RTX 3060/4060 o superiores deberían ser suficientes para ejecutar el LoRA con el modelo base.
- Compatible con consumer GPUs: sí, siempre que el modelo base quepa en la VRAM disponible.
- Opciones de despliegue: ComfyUI (carga directa del archivo `.safetensors`) o el script de inferencia de Krea 2 (musubi-tuner).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa rigurosa con otros LoRAs de personaje para Krea 2. Existen otros LoRAs en plataformas como Civitai (por ejemplo, "UltraReal - Krea2" o "Krea 2 Turbo LoRA"), pero no se conocen sus especificaciones ni rendimiento. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado con 237 imágenes de una única persona, el modelo puede presentar sobreajuste a ciertos ángulos o expresiones presentes en el dataset, limitando la variedad de poses extremas.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir rasgos faciales inexactos o distorsiones en condiciones de prompt ambiguas o con configuraciones no recomendadas.
- Limitaciones de contexto: al ser un modelo de imagen, no procesa texto más allá del prompt; la calidad depende de la claridad del prompt y de la palabra de activación.
- Restricciones de licencia: la licencia es "other" y no se especifican términos concretos. Se recomienda revisar la política de uso del modelo base Krea 2 y las condiciones de la plataforma antes de un uso comercial.
- Dependencia del modelo base: el LoRA solo funciona con Krea 2 (Raw o Turbo); no es compatible con otros modelos de difusión.
- Configuración sensible: los ajustes recomendados (steps 8, CFG 1, mu 1.15) son críticos; desviaciones pueden degradar la calidad o la fidelidad del personaje.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/spyrostheboss/Dylan_Conrique_Krea_2_LoRA
- Sitio oficial de Krea: https://www.krea.ai/
- Perfil de Instagram de Dylan Conrique: https://www.instagram.com/dylanconrique/
- Modelo similar en PixAI: https://pixai.art/model/1880268310912242429
- LoRA "UltraReal - Krea2" en Civitai: https://civitai.com/models/2462105/ultrareal-krea2-klein9b
- LoRA "Krea 2 Turbo LoRA" en Civitai: https://civitai.com/models/2727641/krea-2-turbo-lora-256dim
