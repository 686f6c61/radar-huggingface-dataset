# spyrostheboss/Melissa_Fumero_Krea_2_LoRA

## Resumen

Este modelo es un LoRA (Low-Rank Adaptation) diseñado para el modelo base de generación de imágenes Krea 2, concretamente para la variante Krea-2-Raw. El LoRA, desarrollado por el usuario spyrostheboss, tiene como objetivo reproducir de forma consistente la apariencia facial y las características físicas de la actriz Melissa Fumero en diferentes poses, expresiones, atuendos, ángulos y composiciones. Se trata de un adaptador de personaje (character LoRA) que se carga sobre el modelo base para condicionar la generación hacia la identidad visual deseada.

El modelo se distribuye como un único archivo `melfum_krea2.safetensors` de aproximadamente 0,5 GB. Está entrenado sobre 303 imágenes con una dimensión de red de 32 y un rango de 32, utilizando el text encoder Qwen3-VL-4B congelado y el VAE de Qwen-Image. La resolución de entrenamiento es de 1024x1024 píxeles. Para la inferencia se recomienda usar Krea 2 Turbo como base, con una fuerza de LoRA de 1.0, 8 pasos y guidance scale de 1 (CFG desactivado). La relevancia de este modelo radica en su capacidad para mantener la identidad de un personaje concreto en generaciones variadas, un caso de uso habitual en la creación de contenido visual personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea-2 (base: Krea-2-Raw) |
| Parametros totales | no disponible (red dim 32, alpha 32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | no disponible (archivo safetensors, sin especificar cuantizacion) |
| Idiomas soportados | no disponible (el trigger word es en ingles, pero no se especifican idiomas) |
| Licencia | other (se debe consultar con el autor) |
| Formato de pesos | safetensors (archivo unico `melfum_krea2.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA para la arquitectura de difusion Krea 2, un modelo de texto a imagen de ultima generacion desarrollado por Krea AI. El LoRA se entrena sobre el checkpoint `raw.safetensors` de Krea 2 Raw, utilizando la implementacion de `networks.lora_krea2` del repositorio musubi-tuner. La red tiene una dimension de 32 y un alpha de 32, lo que indica una capacidad de adaptacion moderada. El entrenamiento se realizo con 303 imagenes, 5 epocas y 380 pasos totales, con un batch size efectivo de 4 (batch 1 con acumulacion de gradientes de 4). Se uso el optimizador AdamW8bit con una tasa de aprendizaje constante de 1e-4 y sin warmup. El muestreo de timesteps sigue el esquema `krea2_shift` y no se aplico ningun esquema de ponderacion adicional. La precision mixta fue bf16 con base fp8. El text encoder (Qwen3-VL-4B) y el VAE (Qwen-Image) se mantuvieron congelados durante el entrenamiento. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion; el entrenamiento es puramente supervisado sobre el dataset de imagenes.

## Capacidades

- Generacion de imagenes de texto a imagen con identidad consistente de Melissa Fumero, incluyendo rasgos faciales, peinado, proporciones y apariencia general.
- Control de poses, expresiones, atuendos, angulos y composiciones manteniendo la identidad del personaje.
- Requiere el uso de la palabra de activacion (trigger word) `melfum` como primer token del prompt para activar el LoRA.
- Compatible con el pipeline de Krea 2, tanto en la variante Raw como en la Turbo (recomendada para inferencia).
- No se especifican capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o video.
- No se indica soporte multilingue explicito; el prompt de ejemplo esta en ingles.

## Casos de uso

- Creacion de contenido artistico personalizado: el LoRA permite generar ilustraciones, retratos o escenas con la apariencia de Melissa Fumero, util para artistas que quieran incorporar un personaje reconocible en sus obras sin necesidad de sesiones fotograficas.
- Desarrollo de personajes para narrativa visual: escritores o creadores de comics pueden usar el modelo para visualizar a un personaje inspirado en la actriz en diferentes situaciones, manteniendo coherencia visual entre paneles o escenas.
- Marketing y publicidad: agencias pueden generar imagenes de campanas con una modelo ficticia basada en la apariencia de la actriz, siempre que la licencia lo permita, para pruebas de concepto o moodboards.
- Prototipado de diseno de moda: disenadores pueden probar como diferentes atuendos y estilos se ven sobre una figura con rasgos especificos, acelerando el proceso de iteracion.
- Generacion de avatares para videojuegos o entornos virtuales: el LoRA puede usarse para crear personajes no jugables (NPC) o avatares con una identidad visual consistente en diferentes renders.
- Educacion y demostracion tecnica: sirve como ejemplo practico de como entrenar y desplegar un LoRA de personaje sobre Krea 2, mostrando el flujo de trabajo con musubi-tuner y ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion cuantitativa como FID, CLIP score o comparaciones con otros LoRA de personaje. El unico dato de rendimiento es el propio entrenamiento (380 pasos, 5 epocas) y las recomendaciones de inferencia (8 pasos, CFG off), pero no se proporcionan metricas de calidad de imagen ni de velocidad.

## Requisitos de hardware

- VRAM estimada: no disponible. Al ser un LoRA de 0,5 GB, la carga adicional sobre el modelo base es reducida, pero el modelo base Krea 2 (Raw o Turbo) requiere una GPU con suficiente memoria para difusion a 1024x1024. Se estima que al menos 8-12 GB de VRAM son necesarios, aunque no se confirma.
- GPU recomendadas: no se especifican modelos concretos. Para inferencia local, una GPU de gama alta como RTX 3090, RTX 4090 o A100 seria adecuada, pero no hay datos oficiales.
- Compatibilidad con consumer GPU: probablemente si, dado el tamano del LoRA, pero depende del modelo base. No se indica explicitamente.
- Opciones de despliegue: el archivo se puede cargar directamente en ComfyUI o mediante el script de inferencia de musubi-tuner para Krea 2. Tambien es posible usar la plataforma Krea AI si se sube el LoRA, aunque no se detalla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros LoRA de personaje para Krea 2 o para otros modelos base como Flux o SDXL. Los resultados de busqueda muestran que existen otros modelos de Melissa Fumero en plataformas como SeaArt (basados en Flux o Stable Diffusion), pero no se proporcionan especificaciones tecnicas ni metricas comparables. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- La licencia es "other", lo que implica que los terminos de uso no estan claramente definidos. Es imprescindible contactar con el autor para conocer si se permite uso comercial, redistribucion o modificacion.
- El modelo esta entrenado exclusivamente para reproducir la apariencia de una persona real (Melissa Fumero). Su uso para generar imagenes que suplanten a la persona o que se presenten como autenticas puede plantear problemas eticos y legales, especialmente si se utiliza sin consentimiento.
- No se garantiza una identidad perfecta en todas las generaciones; pueden aparecer variaciones en rasgos faciales o inconsistencias en ciertos angulos o condiciones de iluminacion.
- El trigger word `melfum` debe escribirse exactamente en minusculas y como primer token; de lo contrario, el LoRA puede no activarse correctamente.
- No se han publicado evaluaciones de sesgos o alucinaciones. Como cualquier modelo de generacion de imagenes, puede producir contenido no deseado o distorsiones en escenarios complejos.
- El modelo base Krea 2 Raw puede tener sus propias limitaciones y requisitos de hardware; el LoRA no los mitiga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spyrostheboss/Melissa_Fumero_Krea_2_LoRA
- Pagina oficial de Krea 2: https://www.krea.ai/krea-2
- Repositorio de implementacion de Krea 2 (mencionado en la model card): https://github.com/krea-ai/krea-2
- Perfil de Krea en Hugging Face: https://huggingface.co/krea/models
