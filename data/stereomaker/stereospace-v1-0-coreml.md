# StereoMaker/stereospace-v1-0-coreml

## Resumen

StereoSpace v1.0 Core ML es una conversión no oficial del modelo `prs-eth/stereospace-v1-0` al formato Core ML, empaquetada por el usuario StereoMaker para su ejecución nativa en Macs con Apple Silicon. El modelo original, desarrollado por el grupo PRS de ETH Zürich, resuelve un problema concreto de visión por computador: la síntesis de una vista estereoscópica (ojo derecho) a partir de una única imagen monoculares, sin depender de estimación explícita de profundidad y usando un proceso de difusión. Esta conversión permite ejecutar ese pipeline en macOS 15 o superior sin necesidad de PyTorch ni de GPU NVIDIA.

El repositorio incluye cinco programas Core ML que cubren el pipeline completo: torre de visión CLIP ViT-H/14, codificador VAE, UNet de referencia, UNet de denoising y decodificador VAE. Los pesos se ofrecen en FP16 (aproximadamente 4,6 GB en total) y en una variante paletizada a 6 bits (aproximadamente 1,9 GB) para los componentes más pesados, manteniendo los VAE en FP16 en ambos casos. La resolución de trabajo es fija: 768 × 768 píxeles de imagen y 96 × 96 de latente.

La relevancia de esta ficha radica en que documenta una vía práctica para llevar un modelo de difusión especializado en estereoscopía a hardware de consumo Apple, con un rendimiento medido informalmente de unos 1,7 segundos por paso de denoising (dos llamadas a UNet) y aproximadamente 35 segundos para 20 pasos en un Mac con chip de la familia M. No obstante, la conversión carece de validación numérica frente a PyTorch y hereda las limitaciones del modelo base y de Stable Diffusion 2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión latente con UNet 3D (atención de referencia), VAE y torre CLIP ViT-H/14; convertido a Core ML ML Program |
| Parametros totales | no disponible (el repositorio ocupa 6,7 GB; pesos FP16 ≈ 4,6 GB, 6 bits ≈ 1,9 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen, no de texto); resolución fija 768 × 768, latente 96 × 96 |
| Tipos de cuantizacion | FP16 y paletización post-entrenamiento a 6 bits (k-means, por canal agrupado, group size 16) para CLIP y ambas UNet; VAE en FP16 |
| Idiomas soportados | no disponible (modelo de imagen; CLIP ViT-H/14 subyacente multilingüe no documentado en la card) |
| Licencia | CreativeML Open RAIL++-M (creativeml-openrail-m, 24 de noviembre de 2022) |
| Formato de pesos | `.mlpackage` (Core ML ML Program), organizados en `fp16/` y `6bit/` |

## Arquitectura y entrenamiento

El modelo base StereoSpace es un sistema de difusión latente para síntesis de vistas novedosas (novel view synthesis) en configuración monocular-a-estereoscópica. La arquitectura combina un VAE que comprime la imagen a un latente de 4 × 96 × 96, una torre CLIP ViT-H/14 que extrae un embedding global de 1024 dimensiones y dos UNet: una UNet de referencia que procesa la vista fuente junto con mapas de Plücker y produce 16 mapas de atención (el "bank"), y una UNet de denoising que genera el ruido predicho para la vista objetivo condicionada por el banco de referencia y el embedding CLIP. El proceso de muestreo es DDIM con η = 0, predicción de v, betas con zero-terminal-SNR y espaciado de timesteps trailing; por defecto 50 pasos y guidance scale 1,5.

La conversión a Core ML no implica reentrenamiento ni fine-tuning. Para hacer los grafos convertibles con `coremltools`, el autor reescribió algunas operaciones sin alterar la semántica matemática: el upsample nearest 5D y el GroupNorm 5D de la UNet 3D se expresaron en 4D, y el banco de atención de referencia se pasa como entradas y salidas explícitas. La inferencia requiere dos llamadas a la UNet de denoising por paso (una condicional y otra incondicional para classifier-free guidance), con `bank_bias = -30000` en la pasada incondicional para desactivar el banco. Los mapas de Plücker se calculan con FOV de 54° y baseline por defecto de 0,15. No se documentan en la información disponible el número de tokens de entrenamiento ni la composición del dataset del modelo original.

## Capacidades

- Generación de la vista derecha de un par estereoscópico a partir de una sola imagen de entrada (monocular-to-stereo).
- Síntesis de vistas novedosas sin estimación explícita de profundidad, mediante difusión condicionada por atención de referencia.
- Procesamiento de imagen a imagen con resolución fija de 768 × 768 y latente de 96 × 96.
- Extracción de embeddings visuales con CLIP ViT-H/14 (entrada 224 × 224, salida 1024 dimensiones).
- Control de paralaje mediante el parámetro de baseline en los mapas de Plücker (por defecto 0,15).
- Ejecución en macOS 15+ sobre Apple Silicon con Core ML, usando unidades de cómputo CPU+GPU.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es un modelo exclusivamente de imagen.
- No se documentan capacidades multilingües ni modos de pensamiento (thinking mode), visión general o audio.

## Casos de uso

- Creación de contenido estereoscópico para visores VR/AR: a partir de una foto monoculares se genera el par estéreo completo, útil para alimentar visores tipo Meta Quest o Apple Vision Pro en flujos de previsualización rápida.
- Postproducción de cine y vídeo en 3D: conversión de material 2D a estéreo para pruebas de concepto o planos de relleno, con la ventaja de ejecutarse localmente en un Mac sin depender de granjas de render.
- Prototipado de aplicaciones macOS de fotografía computacional: la conversión Core ML permite integrar el pipeline en apps nativas mediante `coremltools` y el framework Vision, sin necesidad de Python en producción.
- Generación de pares estéreo para datasets de entrenamiento: útil para aumentar corpus de visión estéreo con imágenes sintéticas controladas, siempre que se validen visualmente los resultados.
- Investigación en síntesis de vistas: reproducción de experimentos del paper de StereoSpace en hardware Apple, comparando FP16 frente a 6 bits en términos de calidad visual y consumo de memoria.
- Demostraciones educativas de difusión latente: el desglose en cinco programas Core ML permite explicar paso a paso el pipeline (VAE, CLIP, UNet de referencia, DDIM, decodificación) en un entorno macOS.
- Pruebas de accesibilidad y visualización 3D en entornos de escritorio: generación de pares estéreo para técnicas de estereograma o parallax barrier en pantallas compatibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta una medición informal en un Mac16,10 con unidades de cómputo CPU+GPU y FP16: aproximadamente 1,7 segundos por paso de denoising (dos llamadas a UNet), lo que equivale a unos 35 segundos para 20 pasos. La variante de 6 bits reduce tamaño y memoria, pero no se midió como más rápida en GPU. No se realizó una evaluación cuantitativa sistemática ni comparación numérica con la implementación PyTorch.

## Requisitos de hardware

- VRAM/unified memory estimada: aproximadamente 4,6 GB para el conjunto FP16 completo y aproximadamente 1,9 GB para el conjunto 6 bits (CLIP y UNets paletizados, VAE en FP16). A esto hay que sumar el overhead de Core ML y los buffers intermedios.
- GPU recomendadas: cualquier Mac con Apple Silicon (familia M1, M2, M3, M4) y macOS 15 o superior; la card cita un Mac16,10 como referencia de medición.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 8 GB o más para la variante 6 bits; se recomienda 16 GB o más para FP16 y para evitar swapping.
- Opciones de despliegue: Core ML (`coremltools`, ML Program), integración en apps macOS mediante el framework Vision o Core ML directamente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de texto.
- Latencia y throughput estimados: aproximadamente 1,7 s por paso de denoising en FP16 con CPU+GPU; unos 35 s para 20 pasos. No se reportan cifras para la variante 6 bits ni para otras configuraciones de cómputo (CPU-only, Neural Engine).

## Comparativa con modelos similares

| Modelo | Tipo | Resolución | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StereoSpace v1.0 Core ML (esta ficha) | Difusión latente monocular-a-estéreo, conversión Core ML | 768 × 768 fija | Imagen única + mapas de Plücker | CreativeML Open RAIL++-M | Hugging Face, Core ML para macOS |
| prs-eth/stereospace-v1-0 (original) | Difusión latente monocular-a-estéreo, PyTorch | 768 × 768 fija | Imagen única + mapas de Plücker | no disponible en la información proporcionada | Hugging Face, PyTorch |
| Stable Diffusion 2 (base) | Difusión latente texto-a-imagen | 512 × 512 / 768 × 768 | Prompt de texto | CreativeML Open RAIL++-M | Hugging Face, múltiples formatos |
| Modelos de profundidad monocular (p. ej. Depth Anything, MiDaS) | Estimación de profundidad | Variable | Imagen única | Varía según modelo | Hugging Face, PyTorch/ONNX |

La comparación directa con alternativas de estereoscopía es limitada porque no se dispone de benchmarks cuantitativos en la información proporcionada. Frente al modelo original en PyTorch, esta conversión ofrece portabilidad a Apple Silicon y una reducción de tamaño (de aproximadamente 4,6 GB FP16 a 1,9 GB en 6 bits), a costa de una validación numérica ausente. Frente a Stable Diffusion 2, comparte licencia y componentes (VAE, CLIP), pero la tarea es distinta: SD2 genera imágenes desde texto, mientras que StereoSpace genera una vista estéreo desde una imagen.

## Limitaciones y advertencias

- No hay validación numérica frente a PyTorch: solo se realizaron comprobaciones visuales con ejecuciones de 10 pasos en unas pocas imágenes; no existe evaluación cuantitativa.
- La comparación FP16 frente a 6 bits mostró diferencias pequeñas sin ganador claro, según el autor.
- Entrada cuadrada fija de 768 × 768: las imágenes no cuadradas deben redimensionarse (la app de referencia no preserva la relación de aspecto) y la salida volver a redimensionarse.
- La salida es un par de visión paralela con disparidad cero en el infinito; desplazar horizontalmente la imagen derecha mueve el plano de paralaje cero hacia el espectador, recortando los bordes no coincidentes.
- Hereda las limitaciones de StereoSpace y Stable Diffusion 2: las disoclusiones se alucinan y las reflexiones o superficies transparentes pueden ser poco fiables.
- La torre de visión CLIP proviene de un modelo entrenado con LAION cuyos autores consideran fuera de alcance los casos de uso desplegados y recomiendan uso de investigación.
- Licencia CreativeML Open RAIL++-M: se aplican restricciones de uso basadas en casos, tanto a este modelo como a derivados; es necesario revisar el texto completo en `LICENSE-MODEL`.
- Es una conversión no oficial, no afiliada ni respaldada por los autores de StereoSpace ni por Stability AI.
- No se documentan sesgos específicos del modelo en la información proporcionada, pero al derivar de Stable Diffusion 2 y CLIP entrenado con LAION, es razonable esperar sesgos heredados de esos corpus.
- Riesgo de alucinación visual en regiones ocluidas o no visibles desde la vista fuente.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/StereoMaker/stereospace-v1-0-coreml
- Modelo base original: https://huggingface.co/prs-eth/stereospace-v1-0
- Paper de StereoSpace: https://arxiv.org/abs/2512.10959
- Código de StereoSpace: https://github.com/prs-eth/stereospace
- Mirror de la licencia (Stable Diffusion 2): https://huggingface.co/sd2-community/stable-diffusion-2
- Repositorio original de Stable Diffusion 2 (referenciado, no accesible según la card): https://huggingface.co/stabilityai/stable-diffusion-2
