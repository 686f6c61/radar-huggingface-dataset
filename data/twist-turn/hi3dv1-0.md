# twist-turn/Hi3Dv1.0

## Resumen

Hi3D v1.0 es un modelo de refinamiento de geometria 3D de alta resolucion desarrollado por twist-turn (repositorio oficial hi3d-official). Toma como entrada un mallado grueso (coarse mesh) junto con una imagen de referencia del mismo objeto y lo refina progresivamente hasta alcanzar una resolucion efectiva de extraccion de malla de 1536³. Se construye sobre la representacion y arquitectura de refinamiento Sparc3D, e internamente el paquete Python y la API publica conservan los nombres `sparc3d` y `Sparc3DPipeline` por compatibilidad.

El modelo aborda un problema concreto en el pipeline de generacion 3D: la mayoria de generadores image-to-3D producen geometria de baja resolucion con detalles locales pobres. Hi3D v1.0 actua como etapa de refinamiento que anade relieve, molduras, bordes curvos, dientes o ranuras concentricas que el mallado inicial no captura, condicionado por la imagen de referencia para mantener la fidelidad global.

Segun el informe tecnico del autor, se entrena con aproximadamente dos millones de recursos 3D curados y utiliza una escalera de tres pasadas con rejillas de extraccion dispersa de 512³, 1024³ y 1536³. El repositorio de HuggingFace ocupa 7,7 GB y contiene unicamente los artefactos del modelo de refinamiento; el codigo de inferencia, el entrenamiento y el harness de evaluacion se distribuyen por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Refinamiento generativo sobre representacion Sparc3D: muestreo de latentes dispersos con transformer de flujo y decodificacion mediante VAE disperso con auto-poda (self-pruning sparse VAE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; condicionamiento por imagen y coordenadas derivadas de la geometria gruesa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (etiquetas de idioma del repositorio; la salida es geometria 3D) |
| Licencia | hi3d-open-license-agreement-1.0 (licencia personalizada, etiquetada como `other`) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hi3D v1.0 no es un transformer de lenguaje, sino un modelo de difusion/flow sobre latentes dispersos. Las caracteristicas de la imagen de referencia condicionan un flujo disperso (sparse flow) evaluado sobre coordenadas derivadas de la geometria gruesa de entrada. Tras la decodificacion con un VAE disperso con auto-poda se extrae la malla, que se revoxeliza para proporcionar el soporte disperso de la siguiente pasada. Esta estructura iterativa permite refinar de forma progresiva sin operar sobre tensores densos.

La escalera de pasadas es la siguiente: una peticion a 512³ ejecuta una pasada con `transformer_512` (rejilla estructural nominal 64³); 1024³ ejecuta dos pasadas, anadiendo `transformer_1024` (rejilla nominal 128³); y 1536³ ejecuta las tres pasadas, reutilizando `transformer_1024` con rejilla nominal 192³. El autor especifica que estas etiquetas describen rejillas nominales de coordenadas dispersas y de extraccion, no un tensor latente denso de 1536³ ni un numero fijo de triangulos.

El entrenamiento se realizo, segun el informe tecnico, sobre aproximadamente dos millones de recursos 3D curados. No se detalla en la informacion disponible la composicion exacta del dataset, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO (no aplicables de forma estandar a este tipo de modelo). El codigo de entrenamiento no se incluye en el repositorio.

## Capacidades

- Refinamiento image-to-3D: convierte un mallado grueso en geometria de alta resolucion condicionada por una imagen de referencia del mismo objeto.
- Detalle geometrico local: reproduce relieves estratificados, molduras arquitectonicas, bordes curvos, escamas, dientes y ranuras concentricas segun los ejemplos del autor.
- Completado multi-vista plausible: genera superficies ocultas (vista trasera e inferior) de forma verosimil, no como reconstruccion exacta.
- Escalado por pasadas: permite elegir entre 512³ (una pasada), 1024³ (dos pasadas) y 1536³ (tres pasadas) en funcion del presupuesto de computo.
- Salida de malla 3D extraida tras decodificacion de latentes dispersos.
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: las etiquetas del repositorio indican en y zh, si bien la salida es geometria y no texto.
- Capacidades especiales: no dispone de modo thinking, vision ni audio en el sentido de los LLM; su entrada visual es una imagen de referencia para condicionamiento geometrico.

## Casos de uso

- Refinamiento de assets en pipelines de generacion 3D: integrar Hi3D v1.0 como etapa posterior a un generador image-to-3D de baja resolucion para elevar el detalle del mallado antes de exportar a un motor de juego o renderizador, usando la imagen original como condicionamiento.
- Escaneo y digitalizacion de patrimonio: a partir de una fotografia y una reconstruccion fotogrametrica gruesa, refinar molduras, relieves y bordes arquitectonicos que la fotogrametria suele suavizar, con la pasada de 1536³ para piezas de exhibicion.
- Prototipado de producto y e-commerce: generar mallas de alta resolucion de objetos cotidianos (calzado, bolsos, muebles) para visores 3D web, donde el detalle de costuras y bordes curvos es determinante para la percepcion de calidad.
- Creacion de contenido para videojuegos y animacion: refinar mallas base de personajes y props antes del retopology y el baking de normales, reduciendo el trabajo manual de modelado de detalle.
- Impresion 3D: obtener geometria con detalle local suficiente (ranuras, dientes, escalas) para fabricacion aditiva a partir de un modelo inicial tosco y una imagen de referencia.
- Investigacion en generacion 3D: emplear el modelo como baseline de refinamiento sobre Sparc3D en experimentos de reconstruccion y completado multi-vista, comparando las tres escalas de extraccion.
- Visualizacion arquitectonica: refinar maquetas volumetricas simples anadiendo molduras y elementos decorativos coherentes con una fotografia de referencia del edificio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye comparativas visuales cualitativas (detalle local y multi-vista frente a nueve metodos), pero no tablas con metricas numericas como Chamfer Distance, F-Score o PSNR.

## Requisitos de hardware

- VRAM estimada para inferencia: no establecida. El autor indica que solo se ha validado la escalera de 1536³ en una GPU NVIDIA H20 de 96 GB y que la memoria pico y la viabilidad en tarjetas menores no se han determinado.
- GPU recomendadas: NVIDIA con compute capability 8.0 o superior. El stack medido usa una H20 de 96 GB; no hay datos publicados para A100, H100 o RTX 4090.
- GPU de consumo: no confirmado. No se ha validado en tarjetas consumer y no existe ruta de inferencia por CPU.
- Software: Linux, Python 3.10, PyTorch 2.5.0+cu124, CUDA toolkit 12.0-12.5, `flash-attn==2.7.4.post1`, `spconv-cu120==2.3.6`. Instalacion desde fuente; no hay wheel en PyPI ni release precompilada.
- Opciones de despliegue: el proyecto se instala desde el repositorio de GitHub (`pip install -e ".[inference]"`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible. Los kernels Triton de malla se compilan en el primer uso, lo que anade una penalizacion inicial no cuantificada.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Resolucion de extraccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3D v1.0 | Refinamiento image-to-3D | Sparc3D, latentes dispersos, 3 pasadas | Hasta 1536³ | hi3d-open-license-agreement-1.0 | HuggingFace + GitHub |
| Sparc3D | Generacion/refinamiento 3D | Representacion dispersa base | No disponible en la informacion | No disponible | Demo en HuggingFace Spaces |
| Generadores image-to-3D de mallado grueso | Generacion image-to-3D | Mallas de baja resolucion | No disponible | Variable | Variable |

La informacion proporcionada solo permite identificar Sparc3D como la base directa de Hi3D v1.0; no se aportan parametros, contexto ni metricas de los modelos comparados, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Solo refinamiento: requiere un mallado grueso y una imagen de referencia del mismo objeto; no genera geometria desde cero ni desde texto.
- Vistas ocultas plausibles, no exactas: el completado de superficies no visibles es verosimil pero no una reconstruccion fiel.
- Sin ruta de CPU: la inferencia exige GPU NVIDIA con compute capability 8.0 o superior y un stack CUDA muy concreto.
- Validacion limitada de hardware: la escalera de 1536³ solo se ha probado en una H20 de 96 GB; el consumo de memoria en GPUs menores es desconocido.
- Licencia personalizada: hi3d-open-license-agreement-1.0 debe revisarse antes de cualquier uso comercial; no es una licencia open source estandar y la model card no detalla sus restricciones.
- Sin codigo de entrenamiento ni harness de evaluacion: dificulta la reproducibilidad y la evaluacion independiente.
- Ausencia de benchmarks publicados: no hay metricas numericas que permitan comparar objetivamente con alternativas.
- Posibles sesgos derivados del dataset: al entrenarse con dos millones de recursos 3D curados cuya composicion no se detalla, puede presentar sesgos hacia las categorias de objetos sobrerrepresentadas.
- Idiomas: las etiquetas solo declaran en y zh; la documentacion en otros idiomas puede ser limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/twist-turn/Hi3Dv1.0
- Repositorio oficial en HuggingFace: https://huggingface.co/hi3d-official/Hi3Dv1.0
- Repositorio GitHub: https://github.com/hi3d-official/Hi3Dv1.0
- Demo en vivo (Sparc3D): https://huggingface.co/spaces/ilcve21/Sparc3D
- Sitio web internacional: http://hi3d.ai/
- Sitio web China: https://www.hi3d.cn/
- Informe tecnico (PDF): https://github.com/hi3d-official/Hi3Dv1.0/blob/main/docs/Hi3D_v1.0_Technical_Report.pdf
- Descarga directa del PDF: https://github.com/hi3d-official/Hi3Dv1.0/raw/refs/heads/main/docs/Hi3D_v1.0_Technical_Report.pdf
- Detalles del pipeline: https://github.com/hi3d-official/Hi3Dv1.0/blob/main/docs/pipeline.md
- README en chino simplificado: https://huggingface.co/hi3d-official/Hi3Dv1.0/blob/main/README.zh-CN.md
- arXiv: https://arxiv.org/abs/2505.14521
