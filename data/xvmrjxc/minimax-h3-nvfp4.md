# xvmrjxc/MiniMax-H3-NVFP4

## Resumen

MiniMax-H3-NVFP4 es una cuantización en formato NVFP4 del modelo MiniMax-H3, un transformer de difusión (DiT) para generación de vídeo a partir de texto, desarrollado por MiniMaxAI y reempaquetado para ComfyUI por el usuario xvmrjxc. Esta versión cuantizada reduce drásticamente el tamaño y los requisitos de VRAM respecto al modelo original en BF16, manteniendo la misma arquitectura funcional. Está pensada para ejecutarse en GPUs NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200) y ofrece dos variantes de tarea: `ref2va` (imágenes de referencia a vídeo) y `fl2va` (primer/último frame a vídeo).

El modelo base MiniMax-H3 es un DiT de 33.120 millones de parámetros en su versión BF16, pero la variante "pruned" utilizada aquí reduce el peso de la proyección AdaLN de 13.040 millones a 40 millones mediante una refactorización estructural, dejando un total de 20.110 millones de parámetros. La cuantización NVFP4 se aplica únicamente a las capas de atención y MLP (200 capas), preservando la modulación AdaLN en precisión completa. Esto permite reducir el archivo a 12,5 GB y la VRAM necesaria a unos 12 GB, haciendo viable la generación de vídeo en tarjetas de 32 GB como la RTX 5090.

La relevancia de este modelo radica en que democratiza el uso de un generador de vídeo de alta calidad en hardware de consumo, algo que hasta ahora requería GPUs de gama alta con mucha memoria. Además, la cuantización NVFP4 es una técnica relativamente nueva que aprovecha el soporte nativo de las GPUs Blackwell, ofreciendo un buen equilibrio entre tamaño, velocidad y fidelidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) para text-to-video |
| Parametros totales | 20.110 millones (variante pruned) / 33.120 millones (BF16 original) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo, no de texto) |
| Tipos de cuantizacion | NVFP4 (principal), FP8, INT8, BF16 (según variante) |
| Idiomas soportados | No disponible |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El MiniMax-H3 es un transformer de difusión (DiT) diseñado para generar secuencias de vídeo condicionadas por texto, imágenes de referencia o frames iniciales/finales. La arquitectura incluye bloques de atención y MLP, con un mecanismo de modulación AdaLN (Adaptive Layer Normalization) que condiciona las capas según el timestep de difusión y las señales de entrada. En la versión original BF16, la proyección AdaLN representa el 39,4% de los parámetros (13.040 millones), pero Comfy-Org la refactorizó estructuralmente en una tabla de timesteps de 8 dimensiones (`adaln_t_table` de forma `[1025, 8]`) que alimenta una capa lineal de 96.768×8, reduciendo ese componente a solo 40 millones de parámetros (0,2% del total). Esta refactorización no es una poda con pérdida, sino una simplificación matemática que elimina redundancia.

El entrenamiento del modelo original no está documentado en la información proporcionada; no se especifican datos de entrenamiento, número de tokens ni técnicas de alineación. La cuantización NVFP4 se realizó en una sola pasada desde los pesos BF16 pruned, aplicando el formato TensorCoreNVFP4Layout a las 200 capas de atención y MLP, mientras que la modulación AdaLN se mantiene en precisión completa. Esto es crucial porque el error de cuantización en AdaLN sería multiplicativo y se propagaría a través de los 50 bloques y cada paso de muestreo.

## Capacidades

- Generación de vídeo a partir de texto (pipeline text-to-video).
- Variante `ref2va`: acepta hasta 9 imágenes de referencia (además de vídeos y audio) para generar vídeo con identidad consistente.
- Variante `fl2va`: acepta primer y/o último frame para interpolar entre ellos; también permite encadenar clips pasando el último frame del vídeo anterior como entrada.
- Soporte para ComfyUI, lo que facilita la integración en flujos de trabajo visuales.
- Cuantización NVFP4 que reduce el tamaño del modelo a 12,5 GB y la VRAM a ~12 GB, permitiendo ejecución en GPUs de 32 GB.
- Compatibilidad con GPUs NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200) mediante aceleración nativa NVFP4.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural más allá del condicionamiento de texto para vídeo.

## Casos de uso

- **Generación de vídeo para marketing y publicidad**: un equipo creativo puede generar clips promocionales a partir de descripciones de texto, usando imágenes de referencia del producto para mantener la identidad visual. La variante `ref2va` permite pasar hasta 9 imágenes de referencia, lo que facilita la coherencia de marca.
- **Creación de contenido para redes sociales**: creadores de contenido pueden producir vídeos cortos para plataformas como TikTok o Instagram Reels sin necesidad de equipos de grabación, usando solo prompts de texto y frames iniciales/finales.
- **Prototipado de escenas para cine y animación**: directores y animadores pueden generar storyboards animados a partir de guiones, usando `fl2va` para interpolar entre dos frames clave y visualizar la transición antes de la producción final.
- **Encadenado de clips para vídeos largos**: con `fl2va`, se puede generar un vídeo y luego usar su último frame como entrada para el siguiente, creando secuencias continuas sin cortes visibles. Esto es útil para narrativas largas o vídeos de formato vertical.
- **Edición de vídeo asistida por IA**: integrado en ComfyUI, permite a editores rellenar huecos entre clips existentes o generar transiciones suaves entre escenas, usando los frames de entrada como anclas.
- **Generación de vídeo en hardware de consumo**: gracias a la cuantización NVFP4 y el bajo requisito de VRAM (~12 GB), un usuario con una RTX 5090 puede ejecutar el modelo localmente sin depender de servicios en la nube, lo que es relevante para estudios pequeños o autónomos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (como FID, CLIP score o métricas de movimiento) en la información disponible. La model card incluye únicamente mediciones de velocidad y uso de memoria, que se resumen a continuación:

| Modelo | Tamaño de archivo | VRAM (DiT) | s/it (864x480, 39 frames, 20 steps) |
|---|---|---|---|
| `pruned_int8_convrot` (Comfy-Org) | 21,0 GB | 19.995 MB | 2,17 |
| **`pruned_nvfp4` (este repo)** | **12,5 GB** | **11.944 MB** | **1,90** |

La comparación muestra una reducción del 40% en tamaño de archivo, 8,0 GB menos de VRAM y un 12,4% menos de tiempo de muestreo respecto a la alternativa INT8. Sin embargo, la model card advierte explícitamente que la comparación de calidad de esos mismos resultados fue retractada (ver "Honest limitations"), por lo que no se dispone de datos fiables sobre la fidelidad visual del modelo cuantizado.

## Requisitos de hardware

- **GPU obligatoria**: NVIDIA Blackwell (RTX 50-series, RTX PRO 6000, B200) para aceleración nativa NVFP4. En GPUs Ada, Hopper o anteriores, la ruta NVFP4 se emula y se recomienda usar los archivos `int8_convrot` de Comfy-Org.
- **VRAM estimada**: ~12 GB para el DiT con el archivo `pruned_nvfp4` (11.944 MB medidos). Con 32 GB de VRAM (RTX 5090) es viable si el text encoder se descarga a CPU tras la codificación, ya que solo se ejecuta una vez por prompt.
- **GPU recomendadas**: RTX 5090 (32 GB) para uso en consumo; RTX PRO 6000 (96 GB) para estaciones de trabajo; B200 para entornos de servidor.
- **Opciones de despliegue**: ComfyUI (principal), con soporte para flujos de trabajo personalizados. No se mencionan otros runners como vLLM, llama.cpp u Ollama, ya que es un modelo de difusión, no un LLM.
- **Latencia y throughput**: en las mediciones de la model card, con RTX PRO 6000, resolución 864x480, 39 frames y 20 pasos, se obtuvo 1,90 s/it, lo que implica unos 38 segundos por generación completa (20 pasos × 1,90 s). No se proporcionan datos para otras resoluciones o configuraciones.

## Comparativa con modelos similares

| Modelo | Tamaño | VRAM | Velocidad (s/it) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **MiniMax-H3-NVFP4 (pruned)** | 12,5 GB | ~12 GB | 1,90 | Community (MiniMax) | HuggingFace |
| MiniMax-H3 (BF16 original) | 40,2 GB (pruned) / ~66 GB (sin pruned) | >40 GB | No medido | Community (MiniMax) | HuggingFace |
| Comfy-Org MiniMax-H3 `int8_convrot` | 21,0 GB | ~20 GB | 2,17 | Community (MiniMax) | HuggingFace |
| rockerBOO MiniMax-H3 NVFP4 `convrot_int8` | 20,1 GB | ~20 GB | No medido | Community (MiniMax) | HuggingFace |

La comparativa se limita a las variantes del mismo modelo base, ya que no se dispone de información sobre otros modelos de generación de vídeo comparables (como Stable Video Diffusion, Runway Gen-3, etc.) en la documentación proporcionada. La ventaja principal del NVFP4 es el menor tamaño y VRAM, a costa de una posible pérdida de calidad de movimiento (según la advertencia de la model card).

## Limitaciones y advertencias

- **Requiere hardware Blackwell**: el formato NVFP4 solo se acelera nativamente en GPUs NVIDIA Blackwell. En GPUs más antiguas, la emulación degrada el rendimiento y se recomienda usar las versiones INT8.
- **Posible pérdida de calidad de movimiento**: la model card indica que "los pesos de 4 bits parecen costar algo de calidad de movimiento en relación con el `int8_convrot` de Comfy-Org". Aunque la comparación de calidad fue retractada, esta advertencia sugiere que la cuantización agresiva puede afectar la coherencia temporal del vídeo.
- **Sesgos y alucinaciones**: no se documentan sesgos específicos, pero al ser un modelo de generación de vídeo, puede producir contenido no deseado o inexacto si los prompts son ambiguos. No hay información sobre mitigaciones.
- **Limitaciones de contexto**: al ser un modelo de vídeo, no maneja texto largo ni razonamiento complejo; su entrada principal es un prompt de texto corto y/o imágenes.
- **Restricciones de licencia**: la licencia `minimax-h3-community-license-agreement` permite uso comunitario, pero es necesario revisar los términos exactos en el enlace proporcionado para confirmar si permite uso comercial y en qué condiciones.
- **Caveat de producción**: el archivo `pruned_nvfp4` es el más pequeño y rápido, pero si se prioriza la fidelidad, se recomienda usar las versiones `nvfp4_mixed` o `convrot_int8`, que son más grandes pero conservan mejor la calidad. Además, la model card advierte que el scheduler `beta` usado en las mediciones era incorrecto; los templates oficiales de ComfyUI usan `simple`, por lo que los tiempos reales pueden variar.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/xvmrjxc/MiniMax-H3-NVFP4
- Modelo original MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Reempaque de Comfy-Org: https://huggingface.co/Comfy-Org/MiniMax-H3
- Repositorio de rockerBOO (variantes convrot_int8): https://huggingface.co/rockerBOO/minimax-h3-nvfp4
- Licencia del modelo: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
