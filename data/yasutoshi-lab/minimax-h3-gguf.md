# yasutoshi-lab/MiniMax-H3-GGUF

## Resumen

MiniMax-H3 es un modelo generativo multimodal de MiniMax que produce vídeo y audio de forma conjunta a partir de texto, imagen o referencias visuales. Esta ficha documenta la versión GGUF publicada por el usuario yasutoshi-lab, una cuantización no oficial del repositorio original `MiniMaxAI/MiniMax-H3` (revisión `0919fb6`) preparada específicamente para ejecutarse con stable-diffusion.cpp. No se trata de un modelo de lenguaje conversacional al uso, sino de un pipeline de difusión con un transformador DiT para el vídeo, un codificador de texto Qwen3-VL-32B y dos VAE (uno de vídeo y otro de audio).

El interés de esta publicación radica en que hace viable la inferencia local de un modelo de generación de vídeo con audio de gran tamaño, que en BF16 ocupa 129 GB, reduciéndolo hasta unos 23 GB en su cuantización más agresiva (IQ2_XS). El autor documenta con detalle el proceso de cuantización, las modificaciones estructurales aplicadas a los pesos (reordenación de `qkv_proj`, fusión de `weight_g`/`weight_v` en el VAE de audio, recorte del codificador de texto a 50 capas) y mediciones reales de VRAM y tiempo de generación sobre dos NVIDIA RTX PRO 6000 de 96 GB.

La relevancia actual es doble: por un lado, demuestra que los modelos de vídeo de gran escala pueden cuantizarse a K-quants e I-quants con pérdida controlada de calidad; por otro, ofrece una tabla de compromisos precisos entre tamaño, VRAM y fidelidad visual que sirve de referencia para quien quiera desplegar generación de vídeo en hardware propio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para vídeo + codificador de texto Qwen3-VL-32B (50 capas) + VAE de vídeo + VAE de audio |
| Parametros totales | 25.935.746.560 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0_M, Q8_0, Q6_K_M, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_S, IQ3_XS, IQ3_XXS, IQ2_S, IQ2_XS; VAE de vídeo en F32, F16, Q8_0 y Q4_0; VAE de audio en F32 y F16 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (`license: other`) |
| Formato de pesos | GGUF (DiT, TE, VAE); safetensors (VAE de vídeo fuente y VAE de audio) |

## Arquitectura y entrenamiento

El pipeline combina cuatro componentes. El generador principal es un DiT (diffusion transformer) que opera sobre latentes de vídeo y audio; existen dos variantes de DiT en el repo, `DiT-fl2va` para text-to-video-audio (T2VA), image-to-video-audio (I2VA) y first-last-frame-to-video-audio (FL2VA), y `DiT-ref2va` para generación con referencias visuales (Ref2VA). El acondicionamiento textual corre a cargo de un codificador Qwen3-VL-32B del que se conservan las 50 capas efectivamente utilizadas (se eliminan las capas 50 a 63), con un proyector multimodal `mmproj-F16.gguf` de 1,20 GB necesario para Ref2VA. La decodificación usa un VAE de vídeo y un VAE de audio separados.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron etapas de RLHF o DPO; la model card de esta cuantización no los detalla y la ficha se limita a lo publicado. La innovación técnica documentada es la propia receta de cuantización: el autor reordena las filas de `attn.qkv_proj.weight` de `[heads, (q,k,v), head_dim]` a `[(q,k,v), heads, head_dim]` para que encajen con los K-quants e I-quants de llama.cpp, y fuerza las proyecciones AdaLN (cuyas dimensiones no son múltiplos compatibles) a Q8_0, Q5_1, Q5_0 o IQ4_NL según la cuantización. Las variantes `Q8_0_M` y `Q6_K_M` son configuraciones propias que elevan a BF16/Q8_0 solo las capas sensibles (qkv completo y down del FFN en el DiT; v de atención y down del FFN en el TE), pensadas para que el conjunto DiT+TE+VAE quepa en una sola GPU de 96 GB.

## Capacidades

- Generación de vídeo con audio sincronizado a partir de texto (T2VA).
- Generación de vídeo con audio a partir de una imagen inicial (I2VA).
- Generación condicionada por primer y último fotograma (FL2VA).
- Generación con referencias visuales mediante el DiT `ref2va` y el proyector multimodal (Ref2VA).
- Producción conjunta de pista de vídeo y pista de audio en un único proceso de difusión.
- Codificación de prompts textuales mediante un codificador Qwen3-VL-32B, lo que aporta comprensión de instrucciones complejas y de imágenes de referencia.
- Salida en contenedor AVI con vídeo MJPEG y audio PCM a través de `sd-cli` de stable-diffusion.cpp.
- No se documentan capacidades de tool calling, function calling ni razonamiento agéntico multi-paso; el modelo no es un LLM conversacional.

## Casos de uso

- Prototipado de vídeo publicitario: generar clips de 864×480 o 1280×720 con audio a partir de un prompt descriptivo, usando Q4_K_M para iterar rápido en una estación de trabajo con dos GPU y reservar Q8_0_M para el render final en una sola GPU de 96 GB.
- Creación de animaciones a partir de storyboard: la variante FL2VA permite fijar el primer y el último fotograma de cada plano, de modo que un equipo de animación puede controlar la continuidad entre escenas sin reentrenar nada.
- Generación de contenido con consistencia de personaje: Ref2VA, combinado con `mmproj-F16.gguf`, admite imágenes de referencia para mantener la apariencia de un sujeto a lo largo de varios clips.
- Postproducción y doblaje rápido: al producir audio junto al vídeo, el pipeline sirve para generar bocetos sonorizados de escenas antes de la grabación real, reduciendo el coste de las pruebas de concepto.
- Investigación en cuantización de modelos generativos: la tabla de PSNR y relaciones señal-ruido del autor (F16 a 54-57 dB, Q8_0 a 50-52 dB, Q4_0 a 38-41 dB sobre el VAE de vídeo) permite estudiar el impacto de la precisión en la calidad perceptual.
- Despliegue en infraestructura propia con stable-diffusion.cpp: al estar todo el pipeline en GGUF, se puede ejecutar sin dependencias de frameworks de difusión propietarios, lo que facilita la integración en pipelines internos de render por lotes.
- Docencia y demostraciones: las variantes IQ3 e IQ2, de 23 a 31 GB en total, permiten mostrar generación de vídeo con audio en hardware de gama alta de consumo, aunque con degradación visible de composición y movimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí proporciona mediciones de rendimiento de inferencia sobre dos NVIDIA RTX PRO 6000 de 96 GB, sin offload, para 864×480, 56 fotogramas y 20 pasos:

| Cuantizacion (DiT/TE) | VRAM DiT (GiB) | VRAM TE+VAE (GiB) | Tiempo FL2VA (s) | Tiempo Ref2VA (s) |
|---|---|---|---|---|
| BF16 | 66,4 | 57,2 | 66,9 | 74,3 |
| Q8_0_M | 55,5 | 38,1 | 48,0 | 57,2 |
| Q8_0 | 37,0 | 30,7 | 44,2 | 48,7 |
| Q6_K_M | 34,3 | 25,8 | 49,1 | 57,0 |
| Q4_K_M | 24,3 | 17,7 | 45,1 | 52,6 |
| IQ4_XS | 21,0 | 18,6 | 41,4 | 47,0 |
| IQ3_S | 19,1 | 16,2 | 43,2 | 49,3 |
| IQ2_XS | 16,5 | 9,3 | 50,5 | 56,7 |

La configuración Q8_0_M permite además ejecutar DiT, TE y VAE en una sola GPU de 96 GB, con un pico medido de 89,7 a 91,4 GiB tanto a 864×480/56 fotogramas como a 1280×720/124 fotogramas.

## Requisitos de hardware

- VRAM para el conjunto completo (DiT + TE + VAE de vídeo + VAE de audio): desde 129,18 GB en BF16 hasta 23,28 GB en IQ2_XS; Q8_0_M requiere 96,72 GB y Q4_K_M 40,87 GB.
- GPU recomendadas: NVIDIA RTX PRO 6000 de 96 GB (una sola unidad basta para Q8_0_M; dos para BF16), A100 80 GB o H100 80 GB para configuraciones de 40-70 GB con reparto entre dispositivos.
- En GPU de consumo: las variantes IQ3_XXS (27,42 GB), IQ2_S (24,36 GB) e IQ2_XS (23,28 GB) son las únicas que podrían caber en configuraciones multi-GPU de consumo; el autor advierte que IQ2_S produce imágenes borrosas e IQ2_XS se degrada estructuralmente.
- Opciones de despliegue: stable-diffusion.cpp (versión `32d516c` verificada), con `sd-cli` y el flag `-M vid_gen`; los pesos DiT y TE se cuantizaron con llama.cpp. No se documenta soporte para vLLM, TGI ni Ollama, dado que no es un modelo de lenguaje.
- Latencia: entre 41,4 y 66,9 segundos por clip de 864×480, 56 fotogramas y 20 pasos según cuantización, con el reparto DiT en una GPU y TE+VAE en otra.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa rigurosa con otros modelos de generación de vídeo con audio. Los datos disponibles solo permiten comparar entre las propias cuantizaciones de este repositorio, resumidas en las tablas anteriores.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| MiniMax-H3 (esta cuantización) | 25.935.746.560 | no disponible | MiniMax H3 Community License | GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement es de tipo `other`; incluye restricciones territoriales explícitas según la model card, por lo que debe revisarse el fichero `LICENSE` antes de cualquier uso comercial o despliegue geográfico concreto.
- Esta publicación no es oficial de MiniMax: es una cuantización de terceros, sin garantías de soporte ni de paridad exacta con el modelo original.
- Degradación por cuantización documentada por el autor: hasta IQ4_XS la composición y el movimiento se mantienen próximos a BF16, Q4_K_S altera la composición en generación a partir de texto, IQ3_S e IQ3_XS cambian la composición, IQ3_XXS reduce la amplitud del movimiento, IQ2_S produce desenfoque e IQ2_XS rompe la estructura.
- El recorte del codificador de texto a 50 capas (eliminando las capas 50 a 63) es una modificación estructural que puede afectar a la fidelidad del acondicionamiento textual frente al modelo original.
- No hay información sobre sesgos demográficos, culturales o de representación del modelo base; al ser un generador de vídeo, existe riesgo de producir contenido visual estereotipado o factualmente incorrecto.
- No se documentan mecanismos de filtrado de seguridad ni de moderación de prompts en esta cuantización.
- Los requisitos de hardware son elevados: salvo en configuraciones IQ2/IQ3, no cabe en GPU de consumo, y las variantes que sí caben presentan degradación visible.
- El pipeline depende de stable-diffusion.cpp en una revisión concreta (`32d516c`); cambios de versión pueden alterar el formato de salida o la compatibilidad de los GGUF.
- No se dispone de información sobre idiomas soportados ni sobre el comportamiento del codificador textual en castellano.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/yasutoshi-lab/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- README en inglés: https://huggingface.co/yasutoshi-lab/MiniMax-H3-GGUF/blob/main/README_EN.md
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
