# Vaelico/Wulver

## Resumen

Wulver v0.1 beta es un fine-tune completo del modelo de difusión Krea 2 Raw (12.8B parámetros, arquitectura DiT) desarrollado por Vaelico, especializado en ilustración furry, anthro, kemono y anime. El modelo está entrenado sobre más de 600.000 imágenes curadas con subtítulos en lenguaje natural multi-formato, lo que le permite comprender descripciones prosaicas detalladas y componer escenas con múltiples personajes interactuando sin fusionarlos en una sola masa visual.

La relevancia de este modelo reside en que cubre un nicho que los modelos generalistas suelen resolver mal: la representación coherente de especies antropomórficas con conocimiento anatómico específico, estilos anime y kemono auténticos (no la aproximación occidental habitual) y composición multi-personaje estable. Al ser un fine-tune completo de Krea 2, hereda la velocidad de generación del base (8-14 pasos) y su licencia comunitaria, con cuantizaciones que van desde fp8 (12,8 GB) hasta GGUF Q4_0, lo que lo hace accesible en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre Krea 2 Raw |
| Parametros totales | 12.8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no aplica contexto textual estandar) |
| Tipos de cuantizacion | fp8_e4m3fn, int8_convrot, bf16, GGUF (Q8_0, Q5_0, Q4_0) |
| Idiomas soportados | no disponible (entrenado con captions en ingles, probablemente) |
| Licencia | Krea 2 Community License (krea-2-community-license) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Wulver es un fine-tune completo del modelo Krea 2 Raw de Comfy-Org, que emplea una arquitectura de Diffusion Transformer (DiT) de 12.8B parámetros. El entrenamiento se realizó sobre un dataset propio de más de 600.000 imágenes curadas, con subtítulos en formato de lenguaje natural extenso (60-120 palabras como punto óptimo), lo que explica su preferencia por prompts descriptivos tipo prosa frente a etiquetas cortas.

El proceso de fine-tuning ha desplazado los pesos del modelo base, por lo que las LoRAs entrenadas sobre Krea 2 pueden comportarse de forma diferente en Wulver. El modelo soporta CFG desde 1.0 (valor destilado por defecto) hasta aproximadamente 3.0, siendo 1.5 un valor recomendado para uso diario; por encima de 3.0 la imagen se deforma salvo que se aumenten los pasos, con poco beneficio práctico. La generación requiere 14 pasos con sampler euler y scheduler simple a resolución nativa de 1024 píxeles.

## Capacidades

- Generación de imágenes furry y anthro con conocimiento específico de especies, más allá de lo que ofrecen los modelos generalistas
- Estilos anime y kemono auténticos, no la aproximación occidental habitual
- Composición multi-personaje: personajes interactuando entre sí sin fusionarse en un único blob visual
- Estilos de artista mediante prefijos `@artistname` al inicio del prompt (actualmente en desarrollo)
- Comprensión de prompts descriptivos extensos en lenguaje natural (60-120 palabras como punto óptimo)
- Soporte de prompts cortos, aunque con menor calidad que los descriptivos
- Generación rápida: 8-14 pasos según configuración
- CFG ajustable entre 1.0 y 3.0 con prompts negativos efectivos a partir de CFG 1.5

## Casos de uso

- Ilustración furry profesional: artistas que necesitan representar especies antropomórficas con anatomía coherente pueden generar bocetos o piezas finales con prompts descriptivos detallados, aprovechando el conocimiento específico de especies del modelo.
- Creación de personajes para novelas visuales y juegos: el soporte de estilos kemono y anime permite generar sprites y CG de personajes con estética japonesa auténtica, sin el sesgo occidental de otros modelos.
- Composición de escenas con múltiples personajes: ilustradores que necesitan escenas con varios personajes interactuando (grupos, parejas, escenas de acción) pueden usar el modelo para generar composiciones donde los personajes mantienen su identidad visual individual.
- Generación de referencias para animación: estudios independientes pueden usar Wulver para producir hojas de referencia de personajes y exploraciones de diseño con estilos consistentes.
- Creación de contenido para comunidades online: creadores de contenido para comunidades furry y kemono pueden generar ilustraciones para comisiones, avatares o banners con licencia que permite uso comercial bajo los términos de Krea 2.
- Prototipado rápido de concept art: diseñadores de juegos pueden explorar variaciones de personajes anthro con diferentes especies, vestimenta y ambientación usando prompts descriptivos, acelerando la fase de concept art.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no reporta métricas cuantitativas como FID, CLIP score o comparativas con otros modelos de generación de imágenes. La evaluación se basa en muestras visuales publicadas en la galería de Civitai y en la aceptación de la comunidad.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo fp8_e4m3fn pesa 12,8 GB, por lo que se recomiendan al menos 16 GB de VRAM para ComfyUI con el text encoder y VAE adicionales
- El archivo int8_convrot (13,5 GB) está pensado para runtimes como forge-neo que soportan int8
- El archivo bf16 (25,6 GB) requiere GPUs profesionales o de gama alta (A100, H100, RTX 4090 con 24 GB)
- Las cuantizaciones GGUF (Q8_0, Q5_0, Q4_0) disponibles en Civitai permiten ejecución en GPUs de consumo con menos VRAM
- GPUs recomendadas: RTX 3090/4090 (24 GB) para fp8 con margen, RTX 4080 (16 GB) para fp8 ajustado, GPUs con 8-12 GB para GGUF Q4_0
- Opciones de despliegue: ComfyUI (workflow incluido), forge-neo para int8, llama.cpp u otros runtimes GGUF
- Latencia estimada: 8-14 pasos a 1024 píxeles, típicamente 10-30 segundos en RTX 4090 dependiendo de la cuantización

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wulver v0.1 | 12.8B | Furry/anthro/kemono/anime | Krea 2 Community | HuggingFace, Civitai |
| Krea 2 Raw (base) | 12.8B | Generalista | Krea 2 Community | HuggingFace |
| Stable Diffusion XL | 3.5B | Generalista | OpenRAIL | Amplia |
| Flux.1 Dev | 12B | Generalista | Flux Dev Non-Commercial | Amplia |

No se dispone de comparativas directas con otros modelos especializados en furry/anthro como los basados en SD 1.5 o SDXL con LoRAs específicas. Wulver se posiciona como un fine-tune completo de un modelo de 12.8B, lo que le da ventaja en coherencia y conocimiento de especies frente a aproximaciones basadas en LoRA sobre modelos más pequeños.

## Limitaciones y advertencias

- Versión beta v0.1: el autor advierte que es una versión preliminar con "bordes ásperos" y que un pase estético está en desarrollo activo
- Los estilos de artista mediante `@artistname` están actualmente en desarrollo y pueden no funcionar de forma fiable
- Las LoRAs entrenadas sobre Krea 2 base pueden comportarse de forma diferente en Wulver debido al desplazamiento de pesos
- CFG por encima de 3.0 deforma la imagen; el rango útil es 1.0-3.0
- La licencia Krea 2 Community License tiene términos específicos que deben revisarse en krea.ai/krea-2-licensing, incluyendo la Acceptable Use Policy
- No se dispone de información sobre idiomas soportados; el entrenamiento con captions en lenguaje natural sugiere que el inglés funciona mejor
- El modelo no está afiliado ni respaldado por Krea, a pesar de derivar de Krea 2
- Tamaño del repositorio de 52 GB, lo que requiere espacio de almacenamiento significativo si se descargan todas las variantes

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vaelico/Wulver
- Página en Civitai: https://civitai.com/models/2881657/wulver-krea-2-v01-alpha
- Sitio web del autor: https://vaelico.ai
- Licencia Krea 2 Community: https://krea.ai/krea-2-licensing
- Política de uso aceptable de Krea 2: https://www.krea.ai/krea-2-use-policy
- Modelo base Krea 2: https://huggingface.co/Comfy-Org/Krea-2
- Artículo en AGI Hunt: https://agihunt.info/en/p/1a03fe2195322a07cb938b1583a
