# Vaelico/Wulver

## Resumen

Wulver es un fine-tune completo del modelo de difusión de texto a imagen Krea 2 Raw, desarrollado por Vaelico. Está especializado en contenido antropomórfico (furry) y kemono, con un rango amplio de estilos anime, y se distribuye a través de Hugging Face con la librería diffusers. El modelo parte de una arquitectura DiT (Diffusion Transformer) de 12.800 millones de parámetros, la misma que Krea 2 Raw, e incorpora 1.113 tokens de artista invocables por nombre mediante el prefijo `@`.

La versión documentada es la v0.5, que amplía el entrenamiento de la v0.1 con 13 épocas completas sobre un corpus curado a 512 píxeles (384.672 muestras por época, unos 156.000 pasos con batch 32), una pasada específica de estilos de artista y una pasada final a 1024 píxeles. El resultado es un modelo con conocimiento de especies muy superior al de los modelos generalistas, composición multi-personaje real y estilos kemono que no son una aproximación occidental del anime.

Su relevancia actual radica en que cubre un nicho que los modelos base rara vez tratan con rigor, manteniendo compatibilidad total con el ecosistema de Krea 2: el mismo text encoder Qwen3-VL-4B, el mismo VAE de Qwen Image y los cargadores estándar de ComfyUI. Además, incluye los pesos Turbo ya fusionados (8 pasos, CFG 1.0) y los pesos Non-Turbo para entrenamiento de LoRAs o ajuste fino posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer), misma que Krea 2 Raw |
| Parametros totales | 12.800 millones (12,8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de texto a imagen) |
| Tipos de cuantizacion | bf16, fp8_e4m3fn, int8-convrot, w4a8-convrot, GGUF (Q8_CR, Q5_0, Q4_0) |
| Idiomas soportados | no disponible (prompts en lenguaje natural, presumiblemente ingles) |
| Licencia | krea-2-community-license |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

Wulver es un fine-tune completo de Krea 2 Raw, un Diffusion Transformer de 12,8B parámetros. Mantiene la arquitectura íntegra del modelo base: text encoder Qwen3-VL-4B, VAE de Qwen Image y cargadores estándar de ComfyUI, lo que garantiza compatibilidad directa con los flujos de trabajo existentes. El entrenamiento de la v0.5 consistió en 13 épocas completas a 512 píxeles sobre un corpus curado (384.672 muestras por época, aproximadamente 156.000 pasos con batch 32), con la tasa de aprendizaje anelada a cero en la decimotercera época. Posteriormente se realizó una pasada centrada en estilos de artista a 512 píxeles y una pasada final curada a 1024 píxeles.

Una innovación destacable es el sistema de 1.113 tokens `@artist`, que permiten invocar estilos de artista concretos por nombre. En la v0.1 el prefijo `@` se ignoraba; en la v0.5 funciona y los tokens deben coincidir exactamente con los listados en `ARTISTS.md`. Los archivos Turbo incorporan el LoRA Turbo oficial de Krea 2 (`krea2_turbo_lora_rank_64_bf16.safetensors`) fusionado a fuerza 1.0, lo que permite generar en 8 pasos con CFG 1.0. También se distribuyen los archivos Non-Turbo para quienes prefieran ajustar la fuerza del LoRA o entrenar sobre la base.

## Capacidades

- Generación de imágenes de texto a imagen con resolución nativa de 1024 píxeles.
- Especialización profunda en antropomorfismo y furry: conocimiento de especies muy superior al de modelos generalistas.
- Estilos anime y kemono, con un rango que no es la aproximación habitual de los modelos occidentales.
- Composición multi-personaje real: personajes que interactúan entre sí sin fusionarse en una masa informe.
- 1.113 estilos de artista invocables mediante tokens `@artistname`, listados en `ARTISTS.md`.
- Modo Turbo: 8 pasos, CFG 1.0, sampler euler / simple, shift 1.15.
- Modo Non-Turbo: 52 pasos con CFG 3.5, o 14 pasos con CFG 1.0 y LoRA Turbo a fuerza 0.6.
- Acepta tanto prosa descriptiva detallada como listas de etiquetas estilo booru.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imagen.

## Casos de uso

- Ilustración de personajes antropomórficos para proyectos de ficción: el modelo conoce especies y rasgos anatómicos concretos, por lo que se puede describir en prosa un personaje lobo, zorro o felino y obtener resultados coherentes sin necesidad de LoRAs adicionales de especie.
- Producción de arte estilo anime y kemono: útil para estudios que necesitan estética japonesa auténtica en lugar de la aproximación occidental, con control de estilo mediante tokens `@artist` para mantener consistencia visual entre piezas.
- Escenas con varios personajes interactuando: la composición multi-personaje permite generar ilustraciones de grupo donde cada figura mantiene su identidad, adecuado para portadas, ilustraciones de cómic o arte promocional.
- Exploración de estilos de artista: con 1.113 tokens disponibles, un ilustrador puede probar variantes estilísticas sobre un mismo concepto sin entrenar LoRAs propios, simplemente cambiando el token tras la etiqueta de rating.
- Generación rápida en producción con los archivos Turbo: 8 pasos y CFG 1.0 permiten iterar bocetos a velocidad alta en ComfyUI, adecuado para flujos de previsualización o generación por lotes.
- Entrenamiento de LoRAs sobre la base Non-Turbo: los archivos `non_turbo_bf16` están pensados explícitamente como base para ajuste fino y entrenamiento de LoRAs, lo que permite a un estudio adaptar el modelo a su propio elenco de personajes.
- Despliegue en hardware limitado con cuantizaciones pequeñas: el archivo `w4a8-convrot` de 7,7 GB permite ejecutar el modelo en GPUs con menos VRAM usando el cargador nativo W4A8 de ComfyUI 0.31 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13 GB para el archivo fp8_e4m3fn (12,8 GB de pesos), unos 14 GB para int8-convrot (13,5 GB), unos 8 GB para w4a8-convrot (7,7 GB) y unos 26 GB para bf16 (25,6 GB). Hay que sumar la memoria del text encoder Qwen3-VL-4B y del VAE.
- GPU recomendadas: para bf16, tarjetas de 32 GB o más (A100, H100, RTX 5090). Para fp8 e int8, tarjetas de 16-24 GB (RTX 4090, RTX 4080, A6000). Para w4a8, tarjetas de 8-12 GB.
- El archivo `w4a8-convrot` requiere una GPU con SM 8.0 o superior y PyTorch cu130 o superior, además de ComfyUI 0.31.0 o superior con el cargador nativo W4A8.
- Opciones de despliegue: ComfyUI es el entorno de referencia, con un flujo de trabajo listo para arrastrar (`Wulver_workflow.json`). Para int8, forge-neo y otros runtimes int8. Las cuantizaciones GGUF (Q8_CR, Q5_0, Q4_0) están disponibles en la página de Civitai.
- Latencia y throughput: no disponibles. En modo Turbo se generan imágenes en 8 pasos, lo que reduce el tiempo de inferencia de forma sustancial frente a los 52 pasos del modo Non-Turbo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wulver v0.5 | 12,8B (DiT) | no aplica | Furry, anthro, kemono, anime | krea-2-community-license | Hugging Face, Civitai |
| Krea 2 Raw (base) | 12,8B (DiT) | no aplica | Generalista | krea-2-community-license | Hugging Face (Comfy-Org) |
| Alternativas furry/anthro de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación más directa es con el propio modelo base Krea 2 Raw, del que Wulver hereda arquitectura, text encoder y VAE. Wulver añade la especialización en antropomorfismo, los 1.113 tokens de artista y los pesos Turbo fusionados. No se dispone de información sobre otros fine-tunes comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: al estar entrenado sobre un corpus curado de contenido furry, anthro, anime y kemono, el modelo tenderá a producir estilos y composiciones propios de ese dominio incluso con prompts genéricos. Los prompts de una o dos palabras muestrean todo el rango del modelo y producen estilos aleatorios.
- Riesgo de alucinación: como todo modelo de difusión, puede generar anatomía incorrecta, fusiones de personajes en escenas multi-personaje complejas o detalles incoherentes, especialmente con descripciones ambiguas.
- Limitaciones de idioma: no se especifican los idiomas soportados. Las etiquetas de entrenamiento y los ejemplos de prompting están en inglés, por lo que los prompts en otros idiomas pueden degradar la calidad.
- Los tokens `@artist` deben coincidir exactamente con los listados en `ARTISTS.md`, incluido el prefijo `@`. Un token mal escrito se ignora o produce resultados no deseados.
- A CFG 1.0 (archivos Turbo) el prompt negativo no tiene efecto. Para usar negativo hay que recurrir a los archivos Non-Turbo con CFG superior a 1 y un `CLIPTextEncode` vacío como negativo, no `ConditioningZeroOut`.
- Los LoRAs entrenados sobre Krea 2 base o sobre Wulver v0.1 pueden comportarse de forma distinta en la v0.5 porque los pesos han cambiado.
- Restricciones de licencia: la licencia krea-2-community-license es de tipo "other" y no es una licencia de código abierto estándar. Antes de usar el modelo en producción comercial hay que revisar los términos en el enlace oficial de licencia.
- El archivo `w4a8-convrot` exige ComfyUI 0.31.0 o superior, GPU SM 8.0 o superior y PyTorch cu130 o superior; en entornos más antiguos no funcionará.
- El repositorio ocupa 205,2 GB, lo que implica un coste de almacenamiento considerable si se descargan todas las variantes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vaelico/Wulver
- Modelo base en Hugging Face: https://huggingface.co/Comfy-Org/Krea-2
- Página de Civitai: https://civitai.com/models/2881657/wulver-krea-2-v01-alpha
- Sitio del autor: https://vaelico.ai
- Licencia: https://krea.ai/krea-2-licensing
- Listado de tokens de artista: https://huggingface.co/Vaelico/Wulver/blob/main/ARTISTS.md
- Flujo de trabajo de ComfyUI: https://huggingface.co/Vaelico/Wulver/blob/main/Wulver_workflow.json
- Checksums de la v0.5: https://huggingface.co/Vaelico/Wulver/blob/main/SHA256SUMS_v0.5.txt
- Documentación Non-Turbo: https://huggingface.co/Vaelico/Wulver/blob/main/NON_TURBO_v0.5.md
