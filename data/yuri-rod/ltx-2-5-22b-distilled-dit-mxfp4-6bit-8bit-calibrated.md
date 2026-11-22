# yuri-rod/LTX-2.5-22B-Distilled-DiT-MXFP4-6bit-8bit-Calibrated

## Resumen

LTX-2.5 22B Distilled DiT MXFP4-6bit-8bit Calibrated es una cuantización de precisión mixta del transformer de difusión (DiT) del modelo Lightricks/LTX-2.5, un generador de vídeo y audio a partir de texto o imagen. Lo publica el usuario yuri-rod (yuribarreira) en Hugging Face y está pensado específicamente para ejecutarse en Apple Silicon mediante la librería MLX. El modelo base lo desarrolla Lightricks, conocido por su familia de modelos de vídeo LTX-Video.

El problema que resuelve es el del peso: el DiT en BF16 ocupa unos 42 GB, lo que impide su ejecución en equipos de consumo. Esta versión empaqueta 1.632 capas lineales en un único fichero safetensors de 13,20 GB combinando MXFP4, Q6 y Q8, con un mapa de capas asignado por calibración de activaciones. Según el autor, reduce el error de cuantización ponderado un 31% respecto a un Q6 uniforme ocupando 2,76 GB menos, manteniendo una paridad alta con BF16 en las métricas de similitud de vídeo y audio.

Es relevante ahora porque demuestra una técnica de cuantización calibrada por capas aplicada a un modelo de difusión de vídeo de 22B parámetros, con benchmarks end-to-end medidos en hardware real (Apple M5 Pro de 64 GiB). El modelo es distilled, lo que reduce el número de pasos de denoising necesarios, y soporta generación conjunta de vídeo y audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) distilled, 1.632 capas lineales en `transformer_blocks` |
| Parametros totales | 22B (DiT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4 (bits=4, group_size=32), Q6 (bits=6, group_size=64, affine), Q8 (bits=8, group_size=64, affine), BF16 en embeddings, norms, AdaLN y proyecciones de salida |
| Idiomas soportados | en, de, es, fr, ja, ko, zh, it, pt |
| Licencia | ltx-2.x-community-license (other) |
| Formato de pesos | safetensors (MLX), 13,20 GB |
| Libreria | mlx |
| Pipeline | text-to-video (tambien image-to-video, text-to-audio-video, image-to-audio-video) |
| Hardware objetivo | Apple Silicon (unified memory) |
| Modelo base | Lightricks/LTX-2.5 (revision 49b093a39c19) |

## Arquitectura y entrenamiento

La arquitectura es un Diffusion Transformer distilled: el modelo base LTX-2.5 de Lightricks genera vídeo (y audio) mediante difusión sobre un transformer, y la variante distilled reduce los pasos de muestreo. Esta ficha corresponde únicamente a la cuantización del componente DiT (`transformer-distilled.safetensors`); el resto de componentes (encoder de texto Gemma, decodificadores, VAE) no forman parte del repo y deben tomarse de un pack MLX completo como `dgrauet/ltx-2.5-mlx-q8`.

El proceso de cuantización es la innovación técnica destacable. El autor ejecutó 24 forwards en BF16 del DiT sobre 8 prompts audiovisuales fuera del conjunto de benchmark, en timesteps tempranos (sigma=0,90), medios (0,50) y tardíos (0,15), acumulando segundos momentos diagonales `H_diag = E[x^2]` para las 1.632 lineales. Con esos datos asignó presupuesto de bits de forma greedy hacia un objetivo de 13,20 GB, subiendo capas de MXFP4 a Q6 y a Q8 según la mayor reducción de error ponderado por byte: 584 capas en MXFP4, 807 en Q6 y 241 en Q8. Además aplicó un refinamiento de clipping affine con búsqueda de `alpha` en {1,0; 0,98; 0,95; 0,92} sobre 19 capas. El error ponderado total bajó de 6,400e5 (MXFP4 uniforme) y 2,421e4 (Q6 uniforme) a 1,664e4. No se detalla en la información disponible el dataset de entrenamiento original del modelo base ni si hubo RLHF/DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con resolución configurable (probado a 768x512, 1280x704 y 1152x768).
- Generación de vídeo a partir de imagen (image-to-video).
- Generación conjunta de vídeo y audio (text-to-audio-video, image-to-audio-video), con paridad de audio medida frente a BF16.
- Modo distilled con menos pasos de denoising, lo que reduce el tiempo de generación.
- Control de audio mediante negative prompting y NAG (Normalized Attention Guidance) para suprimir bandas sonoras o música no deseadas sin contaminar el prompt positivo.
- Decodificación de vídeo con decodificador de difusión y modo tiled para resoluciones altas.
- Soporte multilingüe de prompts en nueve idiomas (en, de, es, fr, ja, ko, zh, it, pt).
- Ejecución con gestión de memoria de bajo consumo (`--low-ram`, `BlockStreamer`).
- No se documenta soporte de tool calling ni de agentes; es un modelo generativo de vídeo, no un LLM conversacional.

## Casos de uso

- Generación de clips publicitarios cortos: el modelo produce vídeo con audio sincronizado a 768x512 y 97 frames a 24 fps en torno a 70 segundos de media en M5 Pro, adecuado para prototipado rápido de anuncios en un Mac de sobremesa.
- Previsualización de storyboards en imagen-a-vídeo: partiendo de un frame o ilustración, el modelo anima la escena manteniendo la composición, útil en preproducción audiovisual sin GPU dedicada.
- Creación de contenido para redes sociales en local: con 13,20 GB de pesos cabe en un Mac con 32-64 GiB de memoria unificada, lo que permite generar clips sin depender de servicios en la nube ni exponer prompts a terceros.
- Doblaje y generación de audio ambiente: la capacidad text-to-audio-video y el control por negative prompt permiten generar escenas con tono de sala natural y suprimir música no deseada, útil para demos de producto.
- Iteración de investigación en cuantización de modelos de difusión: el mapa de capas (`quantization_policy.json`) y la metodología de calibración sirven como referencia reproducible para estudiar el impacto de la precisión mixta en DiT.
- Prototipado en pipelines de MLX: al integrarse en un pack `ltx-2-mlx` existente, se puede usar como variante de bajo consumo en flujos de trabajo ya montados sobre Apple Silicon.
- Evaluación comparativa de calidad de vídeo: sirve para contrastar visualmente variantes Q4/Q6/Q8 frente a esta mezcla calibrada en seeds fijas, como hace el propio autor en sus notas.

## Benchmarks y rendimiento

Paridad de una sola pasada del DiT frente a BF16 (Apple M5 Pro, 64 GiB, macOS 27.2.1, mlx 0.32.2):

| Variante | Tamano DiT | Video Cos | Video RMSE | Audio Cos | Audio RMSE |
|---|---:|---:|---:|---:|---:|
| Q8 (affine g64) | 20,59 GB | 0,999805 | 0,02390 | 0,999681 | 0,01574 |
| MXFP8 (g32) | 20,02 GB | 0,992870 | 0,14793 | 0,994663 | 0,06530 |
| **Mixed Calibrated (este repo)** | **13,20 GB** | **0,987724** | **0,21676** | **0,989421** | **0,09092** |
| Q6 (affine g64) | 15,96 GB | 0,986826 | 0,20015 | 0,996734 | 0,05065 |
| MXFP4 (g32) | 10,74 GB | 0,984554 | 0,21650 | 0,970633 | 0,15176 |
| Q4 (affine g64) | 11,32 GB | 0,816431 | 0,71769 | 0,968157 | 0,15504 |

Benchmark end-to-end de 48 clips (6 escenarios x 2 seeds, 12 clips por variante):

| Variante | Tiempo medio | Denoise medio | Seg/paso | Pico MLX | Swap max | Clips silenciosos |
|---|---:|---:|---:|---:|---:|---:|
| **Mixed Calibrated (este repo)** | **70,28 s** | **57,38 s** | **5,216 s** | **29,45 GB** | **0,0 MB** | **0** |
| Q8 | 74,19 s | 60,88 s | 5,535 s | 29,45 GB | 0,0 MB | 0 |
| Q6 | 74,69 s | 61,12 s | 5,557 s | 29,45 GB | 0,0 MB | 0 |
| Q4 | 75,17 s | 61,32 s | 5,575 s | 29,45 GB | 0,0 MB | 0 |

Tiempos de decodificación de vídeo con decodificador de difusión y 0,0 MB de swap: 768x512x97 en 162,5 s (sin tiling), 1280x704x97 en 416,1 s (2 tiles) y 1152x768x121 en 551,6 s (3 tiles).

## Requisitos de hardware

- VRAM/memoria unificada: pico medido de 29,45 GB en MLX durante la inferencia end-to-end. El fichero de pesos ocupa 13,20 GB; el resto del pack (encoder de texto Gemma, VAE, decodificadores) suma el resto hasta el pico.
- GPU recomendadas: Apple Silicon con memoria unificada. Las mediciones oficiales son en Apple M5 Pro de 64 GiB. No hay datos para A100, H100 ni RTX 4090 porque la librería es MLX (Metal), no CUDA.
- Cabe en consumer: sí, en equipos Apple con al menos 32 GiB de memoria unificada; el autor recomienda 64 GiB para trabajar sin swap en las resoluciones probadas.
- Opciones de despliegue: `ltx-2-mlx` con soporte de precisión mixta por capa, loader MXFP4 y `BlockStreamer`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato MLX ni un modelo de difusión de vídeo.
- Latencia y throughput: 5,216 s por paso de denoising y 70,28 s de media por clip de 12 clips en el benchmark; decodificación de 162,5 s para 768x512x97 frames.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LTX-2.5 22B Mixed Calibrated (este) | 22B (DiT) | no disponible | MLX safetensors 13,20 GB | ltx-2.x-community-license | Hugging Face |
| LTX-2.5 22B Distilled DiT Q6 | 22B (DiT) | no disponible | MLX safetensors 15,96 GB | ltx-2.x-community-license | Hugging Face (yuribarreira) |
| LTX-2.5 BF16 (base) | 22B (DiT) | no disponible | safetensors ~42 GB | ltx-2.x-community-license | Hugging Face (Lightricks) |

La comparación relevante es interna a la familia LTX-2.5: frente al Q6 uniforme, esta mezcla calibrada ocupa 2,76 GB menos, es más rápida (70,28 s frente a 74,69 s por clip) y tiene menor error ponderado, aunque el Q6 mantiene mejor paridad de audio (cos 0,9967 frente a 0,9894) y paridad exacta de seed con Q8. Frente al BF16, sacrifica algo de fidelidad a cambio de caber en memoria de consumo. No se dispone de datos de benchmarks comparativos con otros generadores de vídeo de la competencia en la información proporcionada.

## Limitaciones y advertencias

- La cuantización introduce desviaciones: en algunas seeds puede cambiar el encuadre u orientación del sujeto respecto a Q8. Si se necesita paridad exacta de seed con Q8, el autor recomienda la variante Q6.
- La paridad de audio es inferior a la de Q6 y Q8 (cos 0,9894 frente a 0,9967 y 0,9997), lo que puede afectar a escenas con audio crítico.
- Solo está cuantizado el DiT: requiere un pack MLX completo (`ltx-2-mlx`) con encoder de texto, VAE y decodificadores para funcionar; no es autónomo.
- Dependencia de hardware Apple Silicon y de la librería MLX; no hay soporte CUDA ni despliegue en GPU NVIDIA documentado.
- Licencia `ltx-2.x-community-license`: es una licencia comunitaria con restricciones que deben revisarse antes de uso comercial. Al usar el encoder de texto Gemma se aplican además sus Términos de Uso y Política de Uso Prohibido.
- Riesgo de artefactos propios de modelos de difusión de vídeo: manos deformadas en Q4 (el autor lo documenta), posibles inconsistencias temporales y de estructura en escenas complejas.
- No se documentan sesgos específicos ni evaluación de alucinación; al ser un modelo generativo de vídeo, el riesgo principal es la generación de contenido no fiel al prompt o de contenido sensible, sujeto a la política de uso de la licencia.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa de la comunidad.
- El modelo base es distilled: no se especifican los pasos de entrenamiento ni el dataset original en la información disponible.

## Enlaces

- Hugging Face (este repo): https://huggingface.co/yuri-rod/LTX-2.5-22B-Distilled-DiT-MXFP4-6bit-8bit-Calibrated
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Variante Q6 companion: https://huggingface.co/yuribarreira/LTX-2.5-22B-Distilled-DiT-6bit
- Pack MLX de referencia: https://huggingface.co/dgrauet/ltx-2.5-mlx-q8
- Paper referenciado en tags: arxiv:2601.03233 (no se dispone de URL verificada en la información proporcionada)
