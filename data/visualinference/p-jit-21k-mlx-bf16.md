# VisualInference/P-JiT-21K-MLX-bf16

## Resumen

P-JiT 21K es un modelo de generación de imágenes a partir de texto (text-to-image) desarrollado por Linum Inc. que emplea una arquitectura DiT (Diffusion Transformer) de 2.180 millones de parámetros que opera directamente en espacio de píxeles, sin un autoencoder latente intermedio. Esta ficha describe la exportación a MLX en precisión bf16 realizada por el usuario VisualInference, pensada para ejecución nativa en Apple Silicon. Incluye el codificador de texto Qwen3.5-4B recortado a los 28 bloques que el modelo consume efectivamente, junto con el tokenizador y los embeddings de tokens en bf16.

La relevancia de esta conversión es práctica: permite ejecutar el modelo en hardware de consumo de Apple con una huella de memoria notablemente inferior a la alternativa PyTorch sobre MPS. Según los datos del autor, una imagen de 1152x864 en 50 pasos tarda 72 segundos en un M4 Pro con un pico de 6,4 GB de memoria, frente a 139 segundos y 14,9 GB con PyTorch sobre MPS. El repositorio ocupa 11,9 GB, frente a los 18,0 GB de la versión PyTorch.

El modelo está publicado bajo licencia Apache-2.0 tanto en sus pesos como en el codificador de texto y en la propia conversión. Está orientado a la generación de imágenes fotorrealistas a partir de descripciones densas, y no soporta renderizado de texto ni escenas con figuras de cuerpo completo o multitudes, limitaciones heredadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) en espacio de píxeles, con codificador de texto Qwen3.5-4B recortado a 28 bloques |
| Parametros totales | 2,18 mil millones (DiT) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (esta exportación); el runner dispone además de un tier de 8 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (pesos de Linum Inc., Qwen3.5-4B de Alibaba Cloud y conversión) |
| Formato de pesos | safetensors (MLX), con `config.json` y bloque `pjit_mlx` de metadatos |

## Arquitectura y entrenamiento

El modelo base es un Diffusion Transformer (DiT) que difunde directamente en espacio de píxeles, es decir, sin un VAE que comprima la imagen a un espacio latente. Esta elección implica que el modelo procesa representaciones de alta dimensionalidad en cada paso de muestreo, lo que explica el tamaño relativamente contenido de parámetros (2,18B) frente a otros modelos de difusión latente. El condicionamiento textual proviene de Qwen3.5-4B, del que se conservan únicamente los bloques 0 a 27, que son los que el DiT lee durante la inferencia.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card del autor original tampoco detalla estos extremos en la información proporcionada. La innovación técnica destacable de esta exportación concreta es la fidelidad numérica: en fp32, el DiT y el codificador de texto en MLX coinciden con la referencia PyTorch con un error relativo de aproximadamente 3e-6; una ejecución completa de 50 pasos en fp32 reproduce el sampler de referencia en el 99,5 % de los píxeles, con el resto dentro de 1/255. En bf16, el modelo se sitúa en el propio ruido de redondeo bf16 de la referencia y reproduce las imágenes de la galería de Linum a partir de sus prompts y semillas publicados (15 probados, todos la misma imagen, PSNR mediano de 35 dB frente a los originales AVIF), replicando exactamente el muestreo de ruido del H100 SXM.

## Capacidades

- Generación de imágenes fotorrealistas a partir de descripciones textuales densas de 50-80 palabras.
- Condicionamiento textual mediante un codificador Qwen3.5-4B truncado a 28 bloques.
- Reproducibilidad determinista: con la misma semilla y prompt, reproduce las imágenes de referencia de la galería de Linum.
- Ejecución nativa en Apple Silicon mediante MLX, con menor huella de memoria que PyTorch sobre MPS.
- Muestreo configurable en número de pasos (el ejemplo de referencia usa 50 pasos) y relación de aspecto (el ejemplo usa 4:3).
- No soporta renderizado de texto en las imágenes generadas.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de modo de razonamiento (thinking mode), visión de entrada ni audio.

## Casos de uso

- Generación de ilustraciones para prototipos de producto: el modelo produce imágenes fotorrealistas a partir de descripciones densas, adecuado para maquetas rápidas en un Mac con Apple Silicon sin necesidad de GPU dedicada.
- Retratos y cabezas y hombros: el ejemplo oficial de la model card es un retrato de medio cuerpo, un tipo de composición en el que el modelo rinde bien según las pruebas de la galería.
- Reproducción de resultados de investigación: al replicar exactamente el muestreo de ruido del H100 SXM y las imágenes de la galería con PSNR mediano de 35 dB, sirve para verificar pipelines de difusión en espacio de píxeles en local.
- Desarrollo y depuración de runners MLX: la paridad numérica con PyTorch (error relativo ~3e-6 en fp32) lo convierte en referencia para validar implementaciones de DiT en MLX.
- Generación por lotes en estaciones de trabajo Apple: con 6,4 GB de pico de memoria en un M4 Pro, permite ejecutar varias generaciones en paralelo o mantener el modelo cargado junto a otras herramientas.
- Creación de fondos y escenas de paisaje: descripciones como campos de hierba desenfocados o escenas al aire libre, dentro de las composiciones que el modelo maneja con soltura.
- Evaluación comparativa de precisión (bf16 frente a 8 bits): el runner permite alternar tiers y observar cuándo las semillas sensibles divergen de la imagen de referencia.

## Benchmarks y rendimiento

Los únicos datos cuantitativos disponibles son los de rendimiento en hardware Apple, no benchmarks de calidad de imagen estándar.

| Metrica (M4 Pro, 1152x864, 50 pasos) | Esta exportacion (MLX bf16) | PyTorch sobre MPS |
|---|---|---|
| Tiempo total | 72 s | 139 s |
| Memoria pico | 6,4 GB | 14,9 GB |
| Tamano de descarga | 11,9 GB | 18,0 GB |

| Metrica de fidelidad | Valor |
|---|---|
| Error relativo MLX fp32 frente a PyTorch | ~3e-6 |
| Coincidencia de píxeles en 50 pasos fp32 | 99,5 % (resto dentro de 1/255) |
| PSNR mediano frente a originales AVIF (bf16, 15 semillas) | 35 dB |

No se han publicado resultados de benchmarks estándar de generación de imágenes (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 6,4 GB de pico en un M4 Pro para una imagen de 1152x864 en 50 pasos (tier bf16).
- GPU recomendadas: Apple Silicon (M4 Pro verificado por el autor); el modelo está exportado específicamente para MLX y Apple Silicon.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada; el pico medido de 6,4 GB deja margen ajustado en configuraciones de 8 GB.
- Opciones de despliegue: runner `pjit-mlx` (instalable con `pip install git+https://github.com/felix-ab/pjit-mlx`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: 72 segundos por imagen de 1152x864 en 50 pasos en un M4 Pro; el rendimiento en otros chips Apple no está documentado.
- Descarga: 11,9 GB para el tier bf16; el runner descarga el repositorio en el primer uso con `--tier bf16`.

## Comparativa con modelos similares

| Modelo | Parametros | Espacio de difusion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P-JiT 21K (esta exportacion MLX) | 2,18B (DiT) + Qwen3.5-4B truncado | Pixel space | No disponible | Apache-2.0 | HuggingFace, MLX |
| P-JiT 21K (original, Linum-AI/pjit-21k) | 2,18B (DiT) | Pixel space | No disponible | Apache-2.0 | HuggingFace, PyTorch |
| PyTorch sobre MPS (misma familia) | 2,18B (DiT) | Pixel space | No disponible | Apache-2.0 | Ejecucion local en Apple Silicon |

No se dispone de información sobre otros modelos comparables de la misma categoría (DiT en espacio de píxeles de tamaño similar) en la documentación proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con descripciones densas de 50-80 palabras; prompts muy cortos o muy largos pueden degradar la calidad.
- Incapaz de renderizar texto legible en las imágenes generadas.
- Dificultades con figuras de cuerpo completo y con multitudes.
- El tier de 8 bits desplaza algo más la primera predicción que bf16; la mayoría de semillas siguen dando la imagen de la galería, pero los prompts sensibles pueden divergir.
- No hay información sobre sesgos demográficos, culturales o de otro tipo en la documentación disponible.
- Riesgo de alucinación visual inherente a los modelos de difusión: puede generar detalles plausibles pero incorrectos en escenas complejas.
- No se documentan los idiomas soportados por el codificador de texto en esta ficha.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base original de Linum y de Qwen3.5-4B de Alibaba Cloud.
- El modelo está exportado específicamente para MLX y Apple Silicon; no es directamente portable a CUDA sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VisualInference/P-JiT-21K-MLX-bf16
- Modelo base original: https://huggingface.co/Linum-AI/pjit-21k
- Runner pjit-mlx: https://github.com/felix-ab/pjit-mlx
- Sección de exactitud del runner: https://github.com/felix-ab/pjit-mlx#exactness
- Notas de campo de Linum sobre P-JiT 21K: https://www.linum.ai/field-notes/pjit-21k
