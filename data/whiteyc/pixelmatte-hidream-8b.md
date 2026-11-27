# WhiteYC/PixelMatte-HiDream-8B

## Resumen

PixelMatte (HiDream-8B) es un checkpoint especializado en *image matting* de alta fidelidad, es decir, la estimacion de una mascara alfa (alpha matte) por pixel a partir de una imagen y un trimap. Lo desarrolla Baihan Yang y colaboradores (UC Irvine y Universidad de California, segun la autoria del paper), y se distribuye bajo el identificador `WhiteYC/PixelMatte-HiDream-8B`. El modelo resuelve el problema clasico de separar primer plano de fondo con precision subpixel en bordes complejos (pelo, desenfoques, transparencias), una tarea donde los enfoques tradicionales y los segmentadores binarios fallan.

Tecnicamente es un *diffusion transformer* en espacio de pixeles: predice la mascara alfa directamente en resolucion nativa, sin VAE ni codificador de texto, en una sola evaluacion de red. Esta construido sobre el backbone de HiDream-O1-Image (aproximadamente 7.600 millones de parametros) y anade dos componentes propios, LayerShift y un High-Pass Refiner, empaquetados en un unico fichero `safetensors` de 15,2 GB en bfloat16.

Su relevancia actual radica en que demuestra que un transformer de difusion a escala de 8B puede abordar matting de alta resolucion (entrada con lado corto de 2048 pixeles) sin el coste de un VAE y con una sola pasada, lo que simplifica el despliegue en pipelines de postproduccion frente a arquitecturas de dos etapas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer en espacio de pixeles (base HiDream-O1-Image) con LayerShift y High-Pass Refiner |
| Parametros totales | 7.607.650.977 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no aplica (modelo de imagen); entrada con lado corto 2048, lados multiplos del tamano de patch |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible (modelo sin texto; no usa codificador de texto) |
| Licencia | Apache 2.0 (pesos); modelo base HiDream-O1-Image bajo MIT |
| Formato de pesos | safetensors (`model.safetensors`, 15,2 GB) + `config.json` |

## Arquitectura y entrenamiento

PixelMatte es un *diffusion transformer* que opera directamente en espacio de pixeles, sin VAE intermedio. La red recibe la imagen y el trimap y produce la mascara alfa en una unica evaluacion de red. Sobre el backbone de HiDream-O1-Image el autor incorpora dos modulos: LayerShift y un High-Pass Refiner, cuyo objetivo declarado es preservar el detalle de alta frecuencia en los bordes. El checkpoint incluye backbone, LayerShift y High-Pass Refiner en un solo fichero, y no requiere ni codificador de texto ni VAE.

La entrada se normaliza a un lado corto de 2048 pixeles, con ambos lados multiplos del tamano de patch. El trimap es una imagen monocanal del mismo tamano que la foto, con 0 para fondo, 255 para primer plano y valores intermedios (habitualmente 128) para la region desconocida. No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o ajuste por preferencias; el autor remite al paper (arXiv:2611.34929) y al repositorio de codigo para los comandos de evaluacion sobre los cuatro conjuntos de test del articulo.

## Capacidades

- Estimacion de alpha matte a partir de imagen y trimap, devolviendo un array float32 `[H, W]` en el rango [0, 1].
- Matting de alta resolucion: entrada con lado corto de 2048 pixeles, con lados ajustados a multiplos del tamano de patch.
- Inferencia en una sola evaluacion de red, sin VAE ni codificador de texto.
- Preservacion de detalle fino en bordes mediante LayerShift y High-Pass Refiner (pelo, desenfoques, transparencias).
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni capacidades multilingues: es un modelo unimodal especializado en matting.
- No se documentan modos especiales adicionales (thinking mode, audio, etc.).

## Casos de uso

- Postproduccion de cine y video: extraccion de mascaras alfa de alta fidelidad para composicion sobre fondos nuevos, aprovechando la resolucion de 2048 pixeles y el refinado de bordes en pelo y desenfoques.
- Edicion fotografica profesional: sustitucion de fondos en retrato con trimaps generados automaticamente a partir de un segmentador previo, usando PixelMatte como etapa de refinado.
- Comercio electronico y catalogos de producto: recorte limpio de productos con bordes complejos (cristal, telas, pelo) para fichas de catalogo, donde la mascara alfa precisa evita halos.
- Efectos visuales (VFX): generacion de mates para rotoscopia asistida, reduciendo el trabajo manual sobre fotogramas clave y propagando con trimaps derivados de frames anteriores.
- Investigacion en matting: banco de pruebas reproducible para comparar metodos de difusion en espacio de pixeles frente a enfoques con VAE, ya que el repositorio incluye script de evaluacion sobre los cuatro conjuntos del paper.
- Automatizacion de pipelines de imagen: integracion como etapa de matting en un servicio de procesamiento por lotes, dado que no necesita VAE ni encoder de texto y el checkpoint es un unico fichero de 15,2 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite al paper (arXiv:2611.34929) y al repositorio de codigo para los comandos y el script de evaluacion sobre los cuatro conjuntos de test del articulo, pero las cifras no se incluyen en la model card ni en los metadatos proporcionados.

## Requisitos de hardware

- VRAM estimada: aproximadamente 18 GB para una entrada de 2048 x 2048, segun la model card.
- Precision de inferencia: bfloat16.
- GPU recomendadas: no se especifican modelos concretos; por el consumo de memoria, encajan GPUs con 24 GB o mas (RTX 4090, A100 40 GB, H100) y, con 18 GB, tambien una RTX 4090 de 24 GB.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) para entradas de 2048 x 2048; en GPUs de 16 GB o menos no cabe a esa resolucion segun el dato de memoria.
- Opciones de despliegue: el autor proporciona `PixelMattePipeline` en el repositorio `White-YC/pixelmatte` (PyTorch); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PixelMatte-HiDream-8B | 7,61B | Diffusion transformer en espacio de pixeles, sin VAE | Lado corto 2048 | Apache 2.0 | Hugging Face + repo de codigo |
| HiDream-O1-Image (base) | no disponible | Modelo base de imagen de HiDream | no disponible | MIT | Hugging Face |
| Alternativas de matting (p. ej. enfoques con VAE) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de matting en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Requiere un trimap de entrada del mismo tamano que la imagen; la calidad del resultado depende de la calidad de ese trimap.
- La entrada debe ajustarse a un lado corto de 2048 pixeles y lados multiplos del tamano de patch; resoluciones fuera de esa configuracion requieren redimensionado.
- Consumo de memoria elevado: unos 18 GB de VRAM para 2048 x 2048, lo que limita su uso en GPUs de consumo de gama media o baja.
- Es un modelo unimodal especializado: no genera texto, no razona, no soporta tool calling ni agentes, y no tiene capacidades multilingues.
- Riesgo de artefactos o halos en regiones desconocidas del trimap mal definidas; no se documentan sesgos especificos.
- Licencia Apache 2.0 para los pesos, compatible con uso comercial; el modelo base HiDream-O1-Image se distribuye bajo MIT, lo que conviene verificar en la cadena de derivacion.
- No se documentan limitaciones de contexto o idioma porque el modelo no procesa texto.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria publica.

## Enlaces

- Hugging Face: https://huggingface.co/WhiteYC/PixelMatte-HiDream-8B
- Paper: https://arxiv.org/abs/2611.34929
- Project page: https://white-yc.github.io/pixelmatte/
- Codigo: https://github.com/White-YC/pixelmatte
- Modelo base: https://huggingface.co/HiDream-ai/HiDream-O1-Image
