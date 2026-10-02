# WaveCut/Boogu-Image-0.1-Turbo-OrbitQuant-W4A8

## Resumen

Boogu Image 0.1 Turbo — OrbitQuant W4A8 es una version cuantizada del transformador de difusion de Boogu/Boogu-Image-0.1-Turbo, publicada por el usuario WaveCut. El repositorio contiene unicamente el transformer de difusion en formato W4A8 (pesos de 4 bits, activaciones de 8 bits) mediante la tecnica OrbitQuant; el codificador de instrucciones MLLM, el processor, el scheduler y el VAE no se incluyen y deben cargarse desde el repositorio upstream en la misma revision (`47cd26d3c211b030c64ffe60d63b2e17a7c519c2`, etiqueta `hotfix-20260625`).

El modelo resuelve un problema de eficiencia: el transformador original en BF16 ocupa 20,59 GB, mientras que esta version lo reduce a 5,22 GB (5.175.347.232 parametros) sin datos de calibracion. Segun la model card, en una RTX 4060 Ti de 16 GB reduce el tiempo del transformer de 8,49 s a 5,38 s en una generacion texto-a-imagen de 1024x1024 con 4 pasos, y baja el pico de memoria de 6766 MiB a 5982 MiB frente a la variante SDNQ UINT4 del mismo autor. La eleccion de activaciones de 8 bits en lugar de 4 bits responde a un problema medido: el transformer tiene 3360 canales de ancho, de modo que la rotacion RP-BH solo puede usar bloques de 32 elementos, insuficientes para dispersar los valores atipicos de activacion con codigos de 4 bits, lo que producia una textura "tejida" fina en las imagenes.

Es relevante ahora porque demuestra que es posible ejecutar un modelo de difusion texto-a-imagen de ~5.200 millones de parametros con edicion por imagenes de referencia en GPUs de consumo de gama media, con licencia Apache 2.0 y sin calibracion previa. El repositorio es muy reciente (creado el 2 de octubre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para texto-a-imagen e imagen-a-imagen, con codificador de instrucciones MLLM, VAE y scheduler FlowMatchEulerDiscrete; transformador cuantizado con OrbitQuant (bloques fusionados `orbitquant.fused`, familia `boogu`) |
| Parametros totales | 5.175.347.232 (solo el transformador de difusion) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; modelo de difusion sin ventana de contexto textual declarada. Se observa degradacion de latencia con prompts largos y con 1 o 2 imagenes de referencia |
| Tipos de cuantizacion | Pesos INT4 OrbitQuant (rotacion RP-BH, codebooks Lloyd-Max version 2) en las proyecciones de atencion y feed-forward; proyecciones de modulacion AdaLN en INT4 RTN (grupo 64). Activaciones INT8 per-token absmax sobre la entrada rotada con RP-BH |
| Idiomas soportados | no disponible; la model card incluye una prueba con rotulacion en ruso, pero no se declara una lista de idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato diffusers, layout fusionado descrito en `quantization_config` de `transformer/config.json`) |
| Modelo base | Boogu/Boogu-Image-0.1-Turbo (revision `47cd26d3c211b030c64ffe60d63b2e17a7c519c2`) |
| Tamano del repositorio | 5,2 GB (transformador en BF16 de referencia: 20,59 GB) |
| Hardware de ejecucion | CUDA con kernels Triton; requiere OrbitQuant >= 0.11.0 |
| Pasos de inferencia | 4 pasos con muestreo DMD student (`use_dmd_student_inference=True`) |

## Arquitectura y entrenamiento

El modelo no se entrena desde cero: es una cuantizacion post-entrenamiento del transformador de difusion de Boogu Image 0.1 Turbo, un pipeline texto-a-imagen basado en difusion con muestreo de 4 pasos mediante un estudiante DMD y scheduler FlowMatchEulerDiscrete con time shifting. La arquitectura completa incluye tres piezas: un codificador de instrucciones MLLM (que procesa la instruccion textual y genera las condiciones), el transformer de difusion (la unica pieza incluida en este repositorio) y un VAE para decodificar latentes a imagen. La entrada se pasa como "instruction" y "negative_instruction", lo que indica un condicionamiento de tipo instruccion en lugar de prompt clasico.

La innovacion tecnica es el esquema de cuantizacion OrbitQuant. Los pesos de las proyecciones de atencion y feed-forward se cuantizan a 4 bits combinando una rotacion RP-BH con codebooks de Lloyd-Max (version 2 de codebook); las proyecciones de modulacion AdaLN usan INT4 RTN con grupo de 64. Las activaciones se cuantizan a INT8 por token con absmax sobre la entrada previamente rotada. En tiempo de ejecucion se usan bloques fusionados (`orbitquant.fused`) que ejecutan un GEMM INT8 por grupo de proyeccion, con prologos de normalizacion y modulacion y epilogos de residual con compuerta, y una atencion que combina Q·Kᵀ en INT8 con P·V en FP16 cuando los pesos de normalizacion de Q/K de cada bloque lo permiten. No se utilizo ningun conjunto de datos de calibracion.

Segun el autor, el uso de activaciones de 8 bits en lugar de 4 se justifica por el ancho de 3360 canales del transformer, que limita la rotacion RP-BH a bloques de 32 elementos y no dispersa lo suficiente los valores atipicos para codigos de 4 bits; con activaciones de 4 bits las imagenes mostraban una textura de punto fino, especialmente en las entradas de Q/K/V. Como los GEMM siguen siendo INT8 en ambos casos, ampliar los codigos de activacion apenas tiene coste de velocidad. No se documentan en la informacion disponible detalles sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en resoluciones como 1024x1024 y 704x1280.
- Generacion condicionada por imagenes de referencia (image-to-image), pasadas como `input_images`, `input_image_paths` y `align_res`; el transformer procesa los tokens de referencia adicionales sin cambios.
- Condicionamiento por instruccion en lenguaje natural, con soporte de instruccion negativa y de instruccion vacia con escala de guiado propia (`empty_instruction_guidance_scale`).
- Generacion en 4 pasos de muestreo con el estudiante DMD, lo que habilita flujos de baja latencia.
- Guiado textual configurable mediante `text_guidance_scale` e `image_guidance_scale`.
- Reproducibilidad por semilla mediante `torch.Generator`.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo "thinking": es un modelo generativo de imagenes, no un modelo de lenguaje.
- Capacidad multilingue no declarada; solo consta una prueba cualitativa con rotulacion en ruso.

## Casos de uso

- Generacion de imagenes en produccion con GPU de gama media: gracias a sus 5,22 GB de pesos y a un pico de memoria de alrededor de 6 GB en la configuracion probada, se puede servir texto-a-imagen de 1024x1024 en 4 pasos sobre tarjetas consumer de 16 GB, con offload zero-copy del MLLM y del transformer+VAE cargados alternativamente en GPU.
- Edicion y variacion de imagenes a partir de referencias: el pipeline acepta una o dos imagenes de entrada y las procesa como tokens adicionales; resulta adecuado para reestilizado, variaciones de producto o generacion guiada por bocetos, aunque el coste sube a 10,48 s con una referencia y 16,60 s con dos en la RTX 4060 Ti de referencia.
- Prototipado e investigacion en cuantizacion: el repositorio funciona como artefacto de comparacion directa frente a la variante SDNQ UINT4 del mismo autor, con metricas publicadas de PSNR/SSIM y con la misma tuberia, lo que permite reproducir experimentos de cuantizacion W4A8 sin calibracion.
- Generacion de material grafico para documentacion tecnica y diagramas: la model card incluye una prueba especifica con un diagrama tecnico, de modo que el modelo se ha evaluado en ese tipo de contenido mas alla de la fotografia.
- Creacion de carteles y piezas con rotulacion: se ha probado con prompts de poster y con texto en ruso, lo que apunta a un uso en piezas graficas con tipografia, siempre que la calidad del texto se valide por caso, ya que los modelos de difusion son propensos a errores de rotulacion.
- Despliegue en estudios pequenos o flujos freelance: la reduccion de 20,59 GB a 5,22 GB y de 8,49 s a 5,38 s por imagen hace viable mantener un modelo de este tamano en una sola GPU de consumo sin recurrir a servicios en la nube.
- Aceleracion de pipelines existentes de Boogu: al ser un reemplazo directo del transformer en la misma tuberia (mismo scheduler, VAE, MLLM y processor upstream), puede sustituir al transformador BF16 o al SDNQ UINT4 en un pipeline ya montado cambiando unicamente la ruta del transformer.

## Benchmarks y rendimiento

Rendimiento medido en una RTX 4060 Ti de 16 GB, torch 2.10.0+cu130, BF16, 4 pasos con DMD student inference, MLLM y transformer+VAE subidos a GPU por turnos (zero-copy offload) y ejecuciones en caliente. Los tiempos corresponden a los cuatro pasos de denoising del transformer; el MLLM tarda 2-4 s y el VAE 0,6-0,9 s en ambos casos.

| Peticion | SDNQ UINT4 (s) | OrbitQuant W4A8 (s) | Pico NVML SDNQ → W4A8 (MiB) |
|---|---:|---:|---:|
| 1024x1024 texto-a-imagen | 8,49 | 5,38 | 6766 → 5982 |
| 704x1280 texto-a-imagen | 7,26 | 4,77 | 6606 → 5882 |
| 1024x1024, prompt largo | 8,75 | 5,80 | 6728 → 6002 |
| 1024x1024, una imagen de referencia | 20,31 | 10,48 | 7764 → 6724 |
| 1024x1024, dos imagenes de referencia | 35,81 | 16,60 | 9044 → 7424 |

Calidad frente al transformer en BF16, sobre seis prompts (fotografia, calle nocturna, diagrama tecnico, retrato, poster y rotulacion en ruso) con la misma semilla:

| Variante | PSNR medio (dB) | SSIM medio |
|---|---:|---:|
| OrbitQuant W4A8 | 15,21 | 0,578 |
| SDNQ UINT4 | 14,45 | 0,571 |
| BF16 (referencia) | no disponible (es la referencia) | no disponible (es la referencia) |

El propio autor advierte que el muestreo DMD de 4 pasos desplaza la composicion entre variantes, por lo que estas cifras describen deriva de trayectoria mas que calidad de imagen. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje o razonamiento, y no aplican a un modelo de difusion.

## Requisitos de hardware

- VRAM: los pesos del transformer ocupan 5,22 GB. En la configuracion probada con offload zero-copy, el pico de memoria del pipeline completo medido con NVML esta entre 5882 MiB y 7424 MiB segun el tipo de peticion (texto-a-imagen frente a dos imagenes de referencia).
- GPU verificada: RTX 4060 Ti de 16 GB. Es la unica tarjeta con datos publicados en la informacion disponible; para A100, H100, RTX 4090 u otras no hay mediciones publicadas.
- Cabe en GPU de consumo: si, al menos en tarjetas de 16 GB como la RTX 4060 Ti. El margen sobre 8 GB no esta documentado y no se debe asumir.
- El pipeline requiere subir el MLLM y el transformer+VAE a la GPU por turnos en el escenario medido; no se documenta un modo totalmente residente en memoria.
- Aceleracion obligatoria por CUDA: los bloques fusionados se ejecutan en CUDA mediante kernels Triton, y se exige OrbitQuant 0.11 o superior. No se declara soporte de CPU.
- Opciones de despliegue: la via documentada es diffusers junto con el paquete `boogu` del repositorio boogu-project/Boogu-Image y `orbitquant[hf]>=0.11.0`, con `transformers`, `accelerate`, `safetensors` y `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia: 5,38 s para los 4 pasos de denoising en 1024x1024 texto-a-imagen; sumando la codificacion del MLLM (2-4 s) y el decodificado del VAE (0,6-0,9 s), el tiempo extremo a extremo estimado ronda los 8-10 s por imagen en esa GPU.
- Arranque en frio: la primera peticion tras iniciar el proceso compila los kernels Triton para sus formas, lo que anade latencia no incluida en las cifras anteriores.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Peso en disco | Tiempo 1024x1024 (4 pasos) | Pico de memoria | PSNR / SSIM vs BF16 | Licencia |
|---|---|---:|---:|---:|---|---|
| WaveCut/Boogu-Image-0.1-Turbo-OrbitQuant-W4A8 | 5.175.347.232 (transformador) | 5,22 GB | 5,38 s | 5982 MiB | 15,21 dB / 0,578 | apache-2.0 |
| WaveCut/Boogu-Image-0.1-Turbo-SDNQ-uint4-static | no disponible | no disponible | 8,49 s | 6766 MiB | 14,45 dB / 0,571 | no disponible |
| Boogu/Boogu-Image-0.1-Turbo (BF16) | 5.175.347.232 (mismo transformer, sin cuantizar) | 20,59 GB | no disponible | no disponible | referencia | no disponible |

Las tres entradas comparten pipeline, scheduler, VAE y MLLM; la comparacion se limita al transformador. No se dispone de datos para comparar con otros modelos de difusion texto-a-imagen de tamano similar, por lo que no se incluyen alternativas externas.

## Limitaciones y advertencias

- El repositorio contiene solo el transformer de difusion. Sin el MLLM, el processor, el scheduler y el VAE del repositorio upstream en la revision `47cd26d3c211b030c64ffe60d63b2e17a7c519c2`, el modelo no es funcional.
- Dependencia de CUDA y de kernels Triton: no hay soporte de CPU declarado, lo que excluye su uso en entornos sin GPU NVIDIA.
- Dependencia de versiones concretas: se exige OrbitQuant 0.11 o superior y el paquete `boogu` instalado desde el repositorio Git; cambios de version pueden romper la carga del layout fusionado.
- La cuantizacion se realizo sin datos de calibracion, de modo que el comportamiento fuera de la distribucion de los seis prompts evaluados no esta caracterizado.
- Las metricas de calidad son deliberadamente pesimistas por diseno experimental: 15,21 dB de PSNR y 0,578 de SSIM frente al BF16, con el aviso del autor de que el muestreo DMD de 4 pasos mueve la composicion entre variantes. No deben interpretarse como una medida directa de la perdida de calidad.
- El uso de activaciones de 4 bits esta descartado por el propio autor: con el ancho de 3360 canales, la rotacion RP-BH en bloques de 32 elementos no dispersa los valores atipicos y aparecen artefactos de textura tipo tejido.
- Riesgo de artefactos y alucinacion visual inherente a los modelos de difusion, especialmente en rotulacion de texto dentro de la imagen, manos y estructuras geometricas finas.
- Sesgos del modelo base Boogu-Image-0.1-Turbo: no se documentan en la informacion disponible analisis de sesgo demografico, cultural o de representacion.
- Idiomas soportados no declarados. Solo hay evidencia cualitativa de una prueba con texto en ruso, insuficiente para afirmar soporte multilingue.
- Escalado con imagenes de referencia: el tiempo pasa de 5,38 s a 10,48 s con una referencia y a 16,60 s con dos, y el pico de memoria sube hasta 7424 MiB, lo que reduce el margen en GPUs ajustadas.
- Estado de validacion comunitaria nulo: 0 descargas y 0 me gusta en el momento de la consulta, sin replicas independientes publicadas.
- La licencia del repositorio es apache-2.0, lo que en principio permite uso comercial, pero conviene verificar la licencia del modelo base Boogu/Boogu-Image-0.1-Turbo, no disponible en la informacion proporcionada, antes de explotarlo en produccion.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/WaveCut/Boogu-Image-0.1-Turbo-OrbitQuant-W4A8
- Modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Turbo
- Variante de comparacion SDNQ UINT4: https://huggingface.co/WaveCut/Boogu-Image-0.1-Turbo-SDNQ-uint4-static
- Repositorio de codigo del pipeline: https://github.com/boogu-project/Boogu-Image
- Imagen comparativa BF16 / SDNQ UINT4 / OrbitQuant W4A8: https://huggingface.co/WaveCut/Boogu-Image-0.1-Turbo-OrbitQuant-W4A8/resolve/main/assets/bf16_vs_sdnq_vs_orbitquant_w4a8.webp
- Paper de OrbitQuant: no disponible en la informacion proporcionada
- Las busquedas web realizadas no devolvieron resultados relacionados con este modelo; los enlaces obtenidos correspondian a universidades de Corea del Norte y no guardan ninguna relacion con el contenido de esta ficha.
