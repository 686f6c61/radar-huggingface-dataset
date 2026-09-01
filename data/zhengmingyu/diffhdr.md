# ZhengmingYu/DiffHDR

## Resumen

DiffHDR es un framework de conversion de video de bajo rango dinamico (LDR) a alto rango dinamico (HDR) basado en modelos de difusion de video. Desarrollado por investigadores de Texas A&M University, Eyeline Labs y Netflix, el modelo aborda el problema de que la mayoria de los videos digitales se almacenan en formato LDR de 8 bits, perdiendo informacion de radiancia en regiones sobreexpuestas y subexpuestas. DiffHDR formula la conversion LDR-a-HDR como una tarea de inpainting generativo de radiancia en el espacio latente de un modelo de difusion de video preentrenado, operando en el espacio de color Log-Gamma para aprovechar los priors espacio-temporales del modelo base.

El modelo se distribuye como un adaptador LoRA sobre Wan-AI/Wan2.1-VACE-14B, un modelo de difusion de video de 14 mil millones de parametros. El adaptador pesa aproximadamente 58 MB por checkpoint y permite tanto conversion de video como de imagenes, con soporte adicional para panoramas 360. Su relevancia actual radica en que permite re-exponer videos en postproduccion con una latitud considerable, algo que las tecnicas tradicionales de expansion de rango dinamico no logran de forma realista. El trabajo fue aceptado en ECCV 2026 y el codigo esta disponible bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Wan2.1-VACE-14B (video diffusion transformer) |
| Parametros totales | No disponible (el adaptador LoRA pesa 58 MB; el modelo base tiene 14B) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base Wan2.1-VACE-14B) |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | No disponibles (el modelo base Wan2.1 soporta ingles y chino, pero no se especifica para DiffHDR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (dos checkpoints: DiffHDR.safetensors y DiffHDR_Pano.safetensors) |

## Arquitectura y entrenamiento

DiffHDR es un adaptador LoRA que se anade al modelo de difusion de video Wan2.1-VACE-14B. En lugar de entrenar el modelo completo, solo se ajustan los pesos del adaptador, lo que permite un despliegue ligero (58 MB por checkpoint) sobre la base de 14B. La innovacion clave es operar en el espacio de color Log-Gamma, que aproxima la percepcion de luminancia del ojo humano, y formular la conversion LDR-a-HDR como un problema de inpainting generativo: el modelo rellena la radiancia perdida en las regiones sobreexpuestas y subexpuestas utilizando los priors espacio-temporales del modelo de difusion preentrenado.

El entrenamiento se realizo con un pipeline sintetico que genera datos de video HDR de alta calidad a partir de mapas HDRI estaticos, abordando la escasez de pares de datos LDR-HDR reales. El framework soporta condicionamiento por texto o por imagenes de referencia, lo que permite un control fino sobre la reconstruccion HDR. No se han publicado detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO. La inferencia por defecto usa 50 pasos de difusion, aunque se ha comprobado que 10 pasos producen calidad comparable en muchos casos.

## Capacidades

- Conversion de video LDR a HDR con restauracion de detalle en regiones sobreexpuestas y subexpuestas.
- Conversion de imagen LDR a HDR (via `infer_image.py`).
- Generacion de panoramas HDR 360 a partir de imagenes LDR (con el checkpoint `DiffHDR_Pano.safetensors`).
- Condicionamiento por texto: permite guiar la reconstruccion HDR con descripciones como "over-exposed: A bright ocean landscape visible through the skylight window...".
- Condicionamiento por imagen de referencia para controlar la apariencia del resultado.
- Estabilidad temporal en video gracias a los priors espacio-temporales del modelo base.
- Soporte para video largo (via `infer_long_video.py`).
- Compatible con Flash Attention opcional para acelerar la inferencia, con fallback a PyTorch SDPA.

## Casos de uso

- Postproduccion cinematografica: los editores pueden re-exponer clips LDR grabados con camaras de 8 bits para recuperar detalle en cielos sobreexpuestos o sombras profundas, sin necesidad de re-grabar. DiffHDR permite ajustar la exposicion en post con latitud real.
- Restauracion de archivo audiovisual: videos antiguos o de archivo almacenados en LDR pueden convertirse a HDR para su exhibicion en pantallas modernas, recuperando informacion de radiancia que se consideraba perdida.
- Creacion de contenido HDR para plataformas de streaming: servicios como Netflix o YouTube requieren masters HDR; DiffHDR permite convertir catalogos LDR existentes a HDR de forma automatizada, con control por texto para ajustar la intencion creativa.
- Generacion de panoramas HDR para realidad virtual: el checkpoint `DiffHDR_Pano` convierte imagenes LDR de 360 grados en panoramas HDR, utiles para iluminacion basada en imagen (IBL) en motores de render como Unreal o Blender.
- Edicion de video con re-exposicion selectiva: los usuarios pueden indicar mediante prompts que regiones deben recuperar detalle (por ejemplo, "una ventana con vista al mar") y el modelo reconstruye la radiancia de forma coherente con la escena.
- Previsualizacion de efectos visuales: en produccion de VFX, DiffHDR permite generar versiones HDR de placas LDR para integrar elementos CGI con iluminacion coherente, reduciendo el tiempo de compositing.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper (arXiv:2604.06161) menciona experimentos extensos que demuestran superioridad frente a metodos del estado del arte en fidelidad de radiancia y estabilidad temporal, pero no se incluyen cifras concretas en la documentacion accesible.

## Requisitos de hardware

- El modelo base Wan2.1-VACE-14B requiere aproximadamente 75 GB de almacenamiento en disco (7 shards del DiT, T5 encoder, VAE y tokenizer).
- Para inferencia en bf16, se estima un consumo de VRAM de al menos 24 GB, por lo que se recomienda una GPU con 24 GB o mas, como RTX 4090, A100 (40 GB) o H100.
- El adaptador LoRA es ligero (58 MB) y no anade requisitos adicionales de VRAM significativos.
- No se proporcionan datos de latencia o throughput. Con 10 pasos de inferencia, el tiempo por video depende de la resolucion y la GPU; con 50 pasos (configuracion del paper) el coste es proporcionalmente mayor.
- Opciones de despliegue: el codigo oficial usa `diffsynth` y scripts Python (`infer_video.py`, `infer_image.py`, `infer_hdri.py`). No se menciona compatibilidad con vLLM, Ollama o TGI, ya que es un modelo de difusion, no un LLM autoregresivo.
- Flash Attention es opcional y requiere compilar kernels CUDA desde fuente (necesita `nvcc` y varios minutos de compilacion). Sin el, se usa PyTorch SDPA.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas como HDRGAN, HDRUNet u otros metodos de inverse tone mapping. El paper de DiffHDR afirma superar a los metodos del estado del arte, pero no se incluyen los nombres ni los resultados numericos en la documentacion disponible. Por tanto, la comparativa detallada no esta disponible.

## Limitaciones y advertencias

- Depende completamente del modelo base Wan2.1-VACE-14B, que debe descargarse por separado (~75 GB). Sin el, el adaptador LoRA no es funcional.
- La licencia Apache 2.0 se aplica al adaptador DiffHDR, pero la licencia del modelo base Wan2.1-VACE-14B debe verificarse por separado; aunque Wan-AI suele publicar bajo Apache 2.0, no se confirma en la documentacion de DiffHDR.
- Al ser un metodo generativo, existe riesgo de alucinacion en regiones extremadamente sobreexpuestas o subexpuestas, donde el modelo debe inventar radiancia plausible. Esto puede producir detalles irreales en escenas complejas.
- La estabilidad temporal, aunque mejorada respecto a metodos anteriores, puede degradarse en videos con movimiento rapido o cambios bruscos de iluminacion.
- No se documentan sesgos especificos, pero al entrenarse con datos sinteticos generados a partir de HDRI estaticos, el modelo puede tener un sesgo hacia escenas de interior o exteriores representados en esos mapas.
- El soporte de idiomas para el condicionamiento por texto no esta especificado; se asume que hereda las capacidades del modelo base Wan2.1 (ingles y chino), pero no es seguro.
- No hay informacion sobre el rendimiento en resoluciones altas (4K o superior) ni sobre el coste computacional exacto por segundo de video.

## Enlaces

- HuggingFace: https://huggingface.co/ZhengmingYu/DiffHDR
- Paper (arXiv): https://arxiv.org/abs/2604.06161
- Version HTML del paper: https://arxiv.org/html/2604.06161v1
- Pagina del proyecto: https://eyeline-labs.github.io/DiffHDR/
- Video demo: https://youtu.be/kq8qZfwBRs0
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-VACE-14B
