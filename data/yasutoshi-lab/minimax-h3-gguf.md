# yasutoshi-lab/MiniMax-H3-GGUF

## Resumen

MiniMax-H3 GGUF es una cuantización comunitaria del modelo MiniMax-H3 de MiniMaxAI, publicada por el usuario yasutoshi-lab. No se trata de un modelo nuevo, sino de una conversión a formato GGUF de los pesos originales (revisión `0919fb6`) para su uso con stable-diffusion.cpp, una implementación en C/C++ pensada para ejecutar modelos de difusión sin depender de PyTorch. El pipeline declarado es image-text-to-video, con soporte adicional para text-to-video, image-to-video y generación conjunta de audio y vídeo.

El modelo es multimodal y combina un transformer de difusión (DiT) para la generación de vídeo, un text encoder basado en Qwen3-VL-32B de 50 capas efectivas, un VAE de vídeo y un VAE de audio. La cuantización cubre un rango amplio, desde BF16 hasta IQ2_XS, lo que permite desplegar el modelo en configuraciones de VRAM muy distintas, desde dos GPU de 96 GB hasta un único acelerador de gama alta con cuantizaciones agresivas.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de generación de vídeo con audio en hardware local, algo poco habitual en el ecosistema open source. El repositorio ocupa 1201 GB e incluye todos los ficheros necesarios para stable-diffusion.cpp, con instrucciones detalladas de memoria y tiempos de generación medidos en RTX PRO 6000.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para video, text encoder Qwen3-VL-32B de 50 capas, VAE de video y VAE de audio |
| Parametros totales | 6.826.376.704 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0_M, Q8_0, Q6_K_M, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, IQ3_S, IQ3_XS, IQ3_XXS, IQ2_S, IQ2_XS |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license-agreement (other) |
| Formato de pesos | GGUF y safetensors (VAE en F32/F16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de difusión con un transformer (DiT) como columna vertebral para la generación de vídeo, acompañado de un text encoder Qwen3-VL-32B y dos VAE independientes, uno para vídeo y otro para audio. La cuantización comunitaria reorganiza el tensor `attn.qkv_proj.weight` del DiT de un layout [heads, (q,k,v), head_dim] a [(q,k,v), heads, head_dim], y ajusta las proyecciones AdaLN a formatos compatibles con K-quant e IQ (Q8_0, Q5_1, Q5_0, IQ4_NL) porque su anchura no encaja con los esquemas estándar. El text encoder se recorta a las 50 capas efectivamente utilizadas (se eliminan las capas 50 a 63, conservadas aparte en `text_encoder_tail/` para poder reconstruir el modelo original).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni sobre si se aplicaron técnicas de RLHF o DPO. La model card indica explícitamente que no se han modificado los pesos mediante entrenamiento: solo se han reagrupado, recortado y cuantizado. Las cuantizaciones IQ emplean matrices de importancia (imatrix) generadas con llama.cpp. El VAE de audio se ha reempaquetado fusionando `weight_g` y `weight_v` de weight_norm en un único tensor `weight`, y se han añadido `latents_mean` y `latents_std` como tensores.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de vídeo y audio (audio-video-generation).
- Generación condicionada por imagen y texto (image-text-to-video), el pipeline declarado en Hugging Face.
- Variantes FL2VA (frame-latent to video-audio) y Ref2VA (reference to video-audio), con DiT específicos para cada una.
- Soporte de referencia visual mediante `mmproj-F16.gguf`, el proyector de visión del text encoder Qwen3-VL.
- Ejecución en stable-diffusion.cpp, lo que permite inferencia sin PyTorch.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, al no ser un modelo de lenguaje conversacional.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo con audio sincronizado a 864×480 y 56 fotogramas en 20 pasos, adecuado para prototipos rápidos de anuncios o stories.
- Previsualización de storyboards animados: a partir de una imagen de referencia y un texto, la variante Ref2VA genera una secuencia animada que respeta el estilo visual de la referencia.
- Creación de contenido para redes sociales: la combinación de vídeo y audio en una sola pasada simplifica la producción de clips verticales u horizontales sin postprocesado de audio.
- Prototipado de videojuegos y cinemáticas: los desarrolladores pueden generar secuencias de transición o fondos animados con audio ambiente usando la variante image-to-video.
- Investigación en generación multimodal: el repositorio ofrece múltiples cuantizaciones y métricas de PSNR y SN, lo que facilita estudios de degradación por cuantización en modelos de difusión de vídeo.
- Despliegue en hardware local de gama alta: con Q8_0_M el modelo completo cabe en una sola GPU de 96 GB, lo que permite ejecutar generación de vídeo con audio en una estación de trabajo sin clúster.
- Docencia y experimentación con stable-diffusion.cpp: al no requerir PyTorch, sirve para enseñar pipelines de difusión en C++ y para probar integraciones en entornos embebidos o contenedores ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, VBench) en la información disponible. La model card proporciona métricas de fidelidad de reconstrucción y de consumo de recursos, que se recogen a continuación.

| Metrica | Valor |
|---|---|
| PSNR de video, VAE F16 respecto a F32 | 54–57 dB |
| PSNR de video, VAE Q8_0 respecto a F32 | 50–52 dB |
| PSNR de video, VAE Q4_0 respecto a F32 | 38–41 dB |
| SN de audio, VAE F16 | 52–54 dB |
| Tiempo de generación FL2VA, BF16, 20 pasos | 66,9 s |
| Tiempo de generación FL2VA, Q8_0_M, 20 pasos | 48,0 s |
| Tiempo de generación FL2VA, Q4_K_M, 20 pasos | 45,1 s |
| Tiempo de generación FL2VA, IQ2_XS, 20 pasos | 50,5 s |
| Tiempo de generación Ref2VA, BF16, 20 pasos | 74,3 s |
| Tiempo de generación Ref2VA, Q8_0_M, 20 pasos | 57,2 s |

Las mediciones se realizaron a 864×480, 56 fotogramas y 20 pasos, con el DiT en una GPU y el text encoder más los VAE en otra, sobre dos NVIDIA RTX PRO 6000 de 96 GB sin offload.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 23,28 GB en total (IQ2_XS) hasta 129,18 GB (BF16), sumando DiT, text encoder y VAE de vídeo y audio.
- Configuración mínima realista: IQ2_XS con 16,5 GiB para el DiT y 9,3 GiB para text encoder y VAE en dos GPU.
- Configuración de una sola GPU: Q8_0_M cabe completo en una GPU de 96 GB, con un pico medido de 89,7–91,4 GiB a 864×480 y 1280×720.
- GPU recomendadas: NVIDIA RTX PRO 6000 de 96 GB (medida oficial), A100 80 GB, H100 80 GB. Para cuantizaciones IQ2 e IQ3, dos GPU de 24 GB pueden ser suficientes repartiendo DiT y text encoder.
- GPU de consumo: Q4_K_M e inferiores podrían caber en una RTX 4090 de 24 GB solo si se reparte el modelo entre GPU y CPU, algo no documentado en la model card. No hay garantía de que quepa íntegramente en una GPU consumer.
- Opciones de despliegue: stable-diffusion.cpp (versión `32d516c` verificada), con salida AVI que contiene vídeo MJPEG y audio PCM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: entre 41,4 s (IQ4_XS) y 66,9 s (BF16) para FL2VA a 864×480, 56 fotogramas y 20 pasos; entre 47,0 s y 74,3 s para Ref2VA en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Generacion de audio | Licencia | Formato |
|---|---|---|---|---|---|
| MiniMax-H3 GGUF (esta ficha) | 6.826.376.704 | no disponible | Si, VAE de audio | minimax-h3-community-license-agreement | GGUF, safetensors |
| MiniMaxAI/MiniMax-H3 (original) | 6.826.376.704 | no disponible | Si | minimax-h3-community-license-agreement | safetensors |
| Otros modelos de video-audio open source | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (generación conjunta de vídeo y audio) en la documentación proporcionada. La comparación más directa es con el modelo base original, del que esta ficha es una cuantización sin cambios en los pesos.

## Limitaciones y advertencias

- La licencia MiniMax H3 Community License Agreement no es una licencia open source estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- El repositorio no es una distribución oficial de MiniMax; es una cuantización comunitaria sin soporte del autor original.
- Las cuantizaciones por debajo de IQ4_XS degradan la calidad: IQ3_S e IQ3_XS cambian la composición, IQ3_XXS reduce el movimiento, IQ2_S produce imágenes borrosas e IQ2_XS genera resultados degradados.
- Q4_K_S puede alterar la composición en generaciones a partir de texto, según la model card.
- No hay información sobre sesgos, alucinaciones o limitaciones idiomáticas, al no ser un modelo de lenguaje.
- El tamaño del repositorio (1201 GB) implica una descarga muy costosa; conviene descargar solo los ficheros de la cuantización elegida.
- La model card está redactada originalmente en japonés; la versión en inglés existe como README_EN.md, pero no hay traducción al castellano.
- El soporte de stable-diffusion.cpp está verificado en una versión concreta (`32d516c`); versiones distintas pueden requerir ajustes.
- El modelo base declara el pipeline image-text-to-video, pero las variantes FL2VA y Ref2VA requieren ficheros DiT distintos, lo que complica los pipelines automatizados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yasutoshi-lab/MiniMax-H3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
- llama.cpp: https://github.com/ggml-org/llama.cpp
- README en inglés: https://huggingface.co/yasutoshi-lab/MiniMax-H3-GGUF/blob/main/README_EN.md
- Licencia: https://huggingface.co/yasutoshi-lab/MiniMax-H3-GGUF/blob/main/LICENSE
