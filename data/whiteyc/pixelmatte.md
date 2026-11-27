# WhiteYC/PixelMatte

## Resumen

PixelMatte es un modelo de *image matting* (extracción de canal alfa) de alta fidelidad desarrollado por Baihan Yang y colaboradores (WhiteYC) y publicado en noviembre de 2026. Resuelve la tarea de estimar una máscara alfa de alta precisión a partir de una imagen y un *trimap* (mapa de tres regiones: fondo seguro, primer plano seguro y zona desconocida), empleando un *diffusion transformer* en espacio de píxeles en una única evaluación de red, sin VAE ni codificador de texto.

El modelo se distribuye en dos variantes: `HiDream-8B`, construida sobre HiDream-O1-Image y con entrada de red de lado corto 2048 píxeles, y `PRX-7B`, construida sobre PRX (Photoroom) y con entrada de lado corto 1024 píxeles. Ambas comparten el mismo pipeline de inferencia y se empaquetan en un repositorio de 29,2 GB en `bfloat16`, incluyendo el *backbone*, una capa LayerShift y un módulo High-Pass Refiner.

Su relevancia radica en la combinación de dos factores: la predicción en espacio de píxeles (evitando las pérdidas de detalle típicas de los enfoques basados en VAE/latentes en matting) y la herencia de *backbones* de difusión de imagen de gran escala, lo que permite abordar bordes finos, pelo y transparencias con un único paso de red. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer en espacio de píxeles (sin VAE) |
| Parámetros totales | no disponible (variantes etiquetadas como 8B y 7B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen; entrada de lado corto 2048 en HiDream-8B y 1024 en PRX-7B) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible (modelo de visión, sin componentes de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

PixelMatte es un *diffusion transformer* que opera directamente en espacio de píxeles, sin codificador VAE ni codificador de texto. El modelo predice la máscara alfa en una sola evaluación de red a partir de la imagen y el *trimap*, que se codifica como imagen de un solo canal del mismo tamaño que la fotografía (0 fondo, 255 primer plano, valores intermedios, habitualmente 128, para la región desconocida). Cada `model.safetensors` integra el *backbone*, una capa denominada LayerShift y un módulo High-Pass Refiner, presumiblemente orientado a recuperar detalle de alta frecuencia en bordes y estructuras finas.

El modelo se obtiene por *fine-tuning* de dos *backbones* de difusión de imagen: `HiDream-8B` parte de HiDream-O1-Image (licencia MIT) y `PRX-7B` parte de PRX de Photoroom (licencia Apache 2.0). La variante HiDream-8B trabaja con lado corto de entrada de 2048 píxeles y la PRX-7B con 1024. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF/DPO.

## Capacidades

- Estimación de *alpha matte* de alta fidelidad a partir de imagen y *trimap*.
- Predicción en una única evaluación de red (*single network evaluation*), sin bucle de difusión multi-paso declarado en la model card.
- Funcionamiento sin VAE y sin codificador de texto, lo que simplifica el despliegue.
- Dos resoluciones de trabajo: lado corto 2048 (HiDream-8B) y 1024 (PRX-7B).
- Salida como array `float32` de forma `[H, W]` en el rango `[0, 1]`.
- Soporte de regiones desconocidas arbitrarias mediante *trimap* de un canal.
- No se documentan capacidades de *tool calling*, agentes, multilingüismo, visión general, audio ni modo *thinking*.

## Casos de uso

- **Recorte profesional de retratos y producto**: el modelo genera máscaras alfa de precisión subpíxel en bordes de pelo, tejidos y transparencias, adecuado para flujos de retoque fotográfico donde un *trimap* aproximado ya está disponible.
- **Composición y VFX en pipelines de vídeo**: aplicado fotograma a fotograma con *trimaps* propagados, permite extraer sujetos sobre fondos nuevos manteniendo el detalle de contorno; la variante PRX-7B a 1024 reduce coste por fotograma.
- **Generación de datasets de segmentación con alfa**: útil para producir máscaras de alta calidad a partir de imágenes con *trimaps* generados automáticamente, alimentando el entrenamiento de modelos de segmentación o de *relighting*.
- **Edición de imagen asistida por IA**: integrable en herramientas de edición donde el usuario pinta un *trimap* grueso y el modelo devuelve un alfa refinado, gracias a la tolerancia a regiones desconocidas amplias.
- **Publicidad y *banner* automatizado**: extracción de producto con fondo transparente a resolución alta (2048 de lado corto en HiDream-8B) para catálogos y creatividades.
- **Preprocesado para modelos generativos**: generación de máscaras alfa que alimentan etapas de *inpainting*, *outpainting* o composición condicionada por alfa en pipelines de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Como referencia orientativa, un *backbone* de aproximadamente 7-8B parámetros en `bfloat16` requiere del orden de 14-16 GB solo para pesos, más activaciones dependientes de la resolución de entrada; la variante HiDream-8B a lado corto 2048 eleva notablemente el consumo de memoria por activaciones.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar GPU de centro de datos (A100 40/80 GB, H100) para la variante de 2048, y GPU de gama alta con 24 GB o más para la variante de 1024, si bien esto no está confirmado por el autor.
- ¿Cabe en GPU de consumo? No confirmado. La variante PRX-7B a 1024 podría ser viable en GPU con 24 GB si las activaciones se gestionan por *tiling*, pero no hay datos publicados.
- Opciones de despliegue: el autor proporciona `PixelMattePipeline` en el repositorio de GitHub; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a LLM y no aplican directamente a este modelo).
- Latencia y *throughput*: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la información proporcionada. A continuación se comparan únicamente características estructurales con alternativas de la misma categoría, indicando "no disponible" donde no hay datos verificables.

| Modelo | Tipo | Entrada | Licencia | Pesos |
|---|---|---|---|---|
| PixelMatte (HiDream-8B) | Diffusion transformer en píxeles | Imagen + trimap, lado corto 2048 | Apache 2.0 | safetensors bf16 |
| PixelMatte (PRX-7B) | Diffusion transformer en píxeles | Imagen + trimap, lado corto 1024 | Apache 2.0 | safetensors bf16 |
| Modelos clásicos de matting basados en trimap (p. ej. familia IndexNet, GCA) | CNN | Imagen + trimap | varía | varía |
| Modelos de matting sin trimap (p. ej. familia RVM, BackgroundMatting) | CNN/RNN | Imagen (+ fondo) | varía | varía |

No se dispone de comparaciones cuantitativas de calidad (SAD, MSE, Gradient, Connectivity) entre PixelMatte y estas alternativas en la información disponible.

## Limitaciones y advertencias

- Requiere un *trimap* de entrada; no es un modelo de matting completamente automático sin asistencia.
- No se documentan sesgos conocidos, pero al derivar de *backbones* de difusión de imagen de gran escala, es probable que herede sesgos de sus datasets de preentrenamiento (no verificable con la información disponible).
- Riesgo de alucinación en regiones ambiguas del *trimap*: al ser un modelo generativo en espacio de píxeles, podría inventar estructura en zonas desconocidas mal delimitadas.
- El repositorio es de 29,2 GB y los pesos están en `bfloat16`; no se ofrecen versiones cuantizadas, lo que limita el despliegue en hardware modesto.
- No hay información sobre idiomas porque el modelo no procesa texto.
- Licencia Apache 2.0 en los pesos, pero conviene verificar las licencias de los modelos base (HiDream-O1-Image es MIT; PRX es Apache 2.0) para cumplimiento en producción.
- Modelo muy reciente (creado el 2026-11-27) con 0 descargas y 0 *likes* en el momento de la consulta: no hay evidencia comunitaria de robustez en producción.
- No se documentan límites de resolución distintos de los lados cortos 1024 y 2048; entradas muy superiores podrían degradar el resultado o agotar memoria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WhiteYC/PixelMatte
- Página del proyecto: https://white-yc.github.io/pixelmatte/
- Paper (arXiv): https://arxiv.org/abs/2611.34929
- Repositorio GitHub: https://github.com/White-YC/pixelmatte
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/WhiteYC/PixelMatte
- Modelo base HiDream-O1-Image: https://huggingface.co/HiDream-ai/HiDream-O1-Image
- Modelo base PRX: https://huggingface.co/Photoroom/prxpixel-t2i
