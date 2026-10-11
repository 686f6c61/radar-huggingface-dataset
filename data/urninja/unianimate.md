# UrNinja/unianimate

## Resumen

UniAnimate es un marco de difusion de video para animacion de imagenes de personas: a partir de una unica imagen de referencia y una secuencia de pose, genera un video con movimiento coherente y consistente en el tiempo. Lo desarrolla el equipo ali-vilab (Instituto de Inteligencia Computacional, Alibaba Group), con Xiang Wang como primer autor, y fue publicado en arXiv (2406.01188) y aceptado en la revista SCIS en 2025. No es un modelo de lenguaje: es un modelo generativo de video condicionado, por lo que varias de las metricas habituales de las fichas de LLM (tamano de contexto, tool calling, idiomas) no aplican directamente.

El repositorio analizado, `UrNinja/unianimate`, no es el repo oficial de los autores sino una copia de terceros que empaqueta los pesos necesarios para ejecutar la inferencia completa: el modelo de animacion (`.pth`), el extractor de pose DWPose (dos ficheros ONNX), el codigo de embeddings OpenCLIP y el checkpoint base de Stable Diffusion 2.1. El tamano total del repositorio es de 15,2 GB y no registra descargas ni likes en el momento de la consulta.

La relevancia del modelo radica en su enfoque "unificado": en lugar de encadenar modulos separados para la referencia, la pose y el ruido, proyecta las tres senales en un espacio de caracteristicas comun dentro de un unico modelo de difusion de video, lo que reduce la dificultad de optimizacion y mejora la coherencia temporal. El checkpoint incluido (`unianimate_16f_32f_non_ema_223000.pth`) esta entrenado para ventanas de 16 y 32 fotogramas y corresponde al paso 223000 de entrenamiento en su version sin media exponencial (EMA).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion de video (latente), construido sobre el backbone de Stable Diffusion 2.1 con acondicionamiento unificado de referencia, pose y ruido |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana de generacion de 16 o 32 fotogramas por el checkpoint incluido |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en punto flotante de PyTorch y ONNX; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de imagen/video; no se documenta acondicionamiento textual multilingue) |
| Licencia | no disponible en el repositorio; las fichas relacionadas de OpenCLIP/ONNX referencian apache-2.0, y el peso base es Stable Diffusion 2.1 (CreativeML Open RAIL++-M) |
| Formato de pesos | PyTorch (`.pth`, `.bin`, `.ckpt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

UniAnimate es un modelo de difusion de video latente que parte de Stable Diffusion 2.1 (`v2-1_512-ema-pruned.ckpt`) como generador visual base. Sobre ese backbone, el trabajo introduce un esquema de aprendizaje donde la imagen de referencia, la guia de postura y el propio video con ruido se proyectan en un espacio de caracteristicas comun. Segun la descripcion publica del proyecto, este diseno "unificado" busca reducir la dificultad de optimizacion y garantizar la coherencia temporal, en lugar de depender de modulos auxiliares independientes para cada condicion.

El pipeline de inferencia incluido en el repositorio combina cuatro componentes: extraccion de pose con DWPose (`dw-ll_ucoco_384.onnx` y `yolox_l.onnx`, este ultimo para deteccion de personas), embeddings de imagen mediante OpenCLIP (`open_clip_pytorch_model.bin`), el modelo de animacion propiamente dicho (`unianimate_16f_32f_non_ema_223000.pth`) y el autoencoder y UNet de Stable Diffusion 2.1. El nombre del checkpoint indica que se entreno con ventanas de 16 y 32 fotogramas y que corresponde al paso 223000 en su variante sin EMA. La informacion disponible no detalla el numero total de tokens de video, la composicion exacta del dataset de entrenamiento ni si se emplearon tecnicas de alineacion tipo RLHF o DPO (poco habituales en modelos de difusion de este tipo).

## Capacidades

- Animacion de imagen humana: genera video a partir de una unica imagen de referencia y una secuencia de pose guia.
- Coherencia temporal: mantiene la identidad y la apariencia del sujeto a lo largo de la secuencia generada gracias al modelado conjunto en un espacio de caracteristicas unificado.
- Generacion de video de larga duracion: segun la descripcion del proyecto oficial, el diseno permite generacion "long-term" mediante propagacion temporal, encadenando ventanas para producir secuencias mas alla de la ventana base.
- Extraccion de pose integrada: incorpora DWPose y YOLOX para estimar el esqueleto corporal y detectar personas en los fotogramas de control.
- Acondicionamiento visual con OpenCLIP: utiliza embeddings de imagen de OpenCLIP para la referencia, no acondicionamiento de texto libre.
- Control por pose: el movimiento del video generado queda determinado por la secuencia de posturas de entrada, lo que permite transferir coreografias o movimientos de un video fuente a un sujeto estatico.
- No disponible: soporte de tool calling, modo "thinking", capacidades de audio, razonamiento multi-paso e interaccion conversacional (no son funciones de este modelo).

## Casos de uso

- Animacion de retratos para redes sociales: el usuario aporta una foto y un video corto de referencia de movimiento; el modelo genera un clip animado del sujeto, util para contenido divulgativo o marketing personal.
- Previsualizacion en produccion audiovisual: generar animaticos de personajes con movimiento realista antes de rodar, reduciendo coste de pruebas de vestuario, iluminacion o coreografia.
- Transferencia de movimiento para danza: extraer la pose de un bailarin profesional con DWPose y aplicarla a una imagen estatica, util en videojuegos, videoclips o entrenamiento deportivo.
- Creacion de avatares animados: a partir de una imagen corporativa, producir un avatar con movimiento para presentaciones, asistentes virtuales o contenido interactivo.
- Recreacion historica o artistica: animar pinturas, fotografias antiguas o ilustraciones de figura humana con secuencias de pose verosimiles para documentales o exposiciones.
- Prototipado de personajes en videojuegos: generar animaciones preliminares de NPC a partir de conceptos estaticos y capturas de movimiento existentes antes de invertir en pipelines de animacion completos.
- Contenido educativo de ergonomia o fisioterapia: representar posturas y ejercicios sobre un modelo de referencia para ilustrar rutinas, siempre que se disponga de la secuencia de pose adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio analizado no incluye tabla de metricas (FVD, PSNR, SSIM, LPIPS u otras) y la busqueda web solo aporta descripciones cualitativas del proyecto oficial. No se deben asumir cifras concretas sin consultar el paper (arXiv:2406.01188).

## Requisitos de hardware

Las cifras siguientes son estimaciones orientativas derivadas del tamano de los checkpoints y del backbone Stable Diffusion 2.1; el repositorio no publica requisitos oficiales.

- VRAM estimada para inferencia: en torno a 12-16 GB para secuencias de 16 fotogramas a 512 px en precision mixta; 20-24 GB o mas para 32 fotogramas o resoluciones superiores, donde el coste crece con el numero de fotogramas al procesarse en el espacio latente.
- GPU recomendadas: NVIDIA A100 (40/80 GB) o H100 para generacion de 32 fotogramas y secuencias largas con margen; RTX 4090 (24 GB) o RTX 3090 (24 GB) como opcion de gama alta de consumo.
- Cabe en GPU de consumo: si, en tarjetas con 12-16 GB o mas (RTX 4070 Ti, RTX 4080, RTX 3090/4090) para ventanas cortas de 16 fotogramas; en 8 GB requerira reducir resolucion o fotogramas y puede ser inviable sin optimizaciones.
- Opciones de despliegue: el repositorio esta orientado a PyTorch y ONNX Runtime; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje y no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Al tratarse de un modelo de difusion de video, la generacion es iterativa y costosa; el tiempo por clip depende fuertemente del numero de pasos de muestreo y del hardware.

## Comparativa con modelos similares

| Modelo | Categoria | Pesos publicos | Ventana base | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniAnimate | Difusion de video para animacion humana | Si (repositorio de terceros) | 16 / 32 fotogramas | no disponible | GitHub ali-vilab, pesos en HF |
| Animate Anyone | Difusion de video para animacion humana | No (solo demo) | no disponible | no disponible | Sin pesos publicos |
| MagicAnimate | Difusion de video para animacion humana | Si | no disponible | no disponible | Repo publico |
| MimicMotion | Difusion de video para animacion humana | Si | no disponible | no disponible | Repo publico |
| Animate-X | Difusion de video para animacion de personajes | Si | no disponible | no disponible | Repo publico |

La comparacion cuantitativa (parametros, FVD, coherencia) no esta disponible en la informacion proporcionada; la tabla recoge solo la disponibilidad de pesos y la categoria.

## Limitaciones y advertencias

- Repositorio de terceros: `UrNinja/unianimate` no es un canal oficial. Conviene verificar los pesos contra el repositorio `ali-vilab/UniAnimate` antes de usarlos en produccion.
- Fecha de creacion anomala: el repositorio figura creado y actualizado el 2026-10-11, una fecha futura respecto a la publicacion del paper, lo que sugiere metadatos inconsistentes o un reempaquetado tardio.
- Licencia no aclarada: el repositorio no declara licencia propia. El peso base es Stable Diffusion 2.1, sujeto a CreativeML Open RAIL++-M, cuyas restricciones de uso comercial deben revisarse antes de cualquier despliegue productivo.
- Riesgo de artefactos y alucinacion visual: como todo modelo de difusion, puede generar deformaciones anatomicas, parpadeos temporales, manos incorrectas o perdida de identidad en secuencias largas, especialmente en ventanas de 32 fotogramas o al encadenar clips.
- Dependencia de la pose: la calidad del resultado depende criticamente de la precision de DWPose y YOLOX; poses oclusivas, cuerpos no humanos o escenas con varias personas pueden degradar la deteccion y, con ello, el video.
- Ausencia de acondicionamiento textual: no hay interfaz de prompt de lenguaje natural documentada; el control es visual y por pose, lo que limita el ajuste fino del resultado.
- Requisitos de computacion elevados: la generacion de video es costosa en VRAM y tiempo, poco adecuada para respuestas en tiempo real sin infraestructura dedicada.
- Sin datos de sesgo: no se ha publicado informacion sobre sesgos demograficos, de genero o etnicos en los datos de entrenamiento.
- Idiomas: no aplica ni esta documentado, ya que el modelo no procesa texto como entrada.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/UrNinja/unianimate
- Repositorio oficial en GitHub: https://github.com/ali-vilab/UniAnimate
- Pagina del proyecto: https://unianimate.github.io/
- Paper en arXiv: https://arxiv.org/abs/2406.01188
- Repositorio espejo en HuggingFace: https://huggingface.co/camenduru/unianimate
- Pesos relacionados (UniAnimate y Animate-X): https://huggingface.co/Isi99999/UniAnimate_and_Animate-X_Models
- Ficha en AikanAI: https://www.aikanai.com/en/tool/unianimate
- Paper relacionado (TFT2V, CVPR 2024): A Recipe for Scaling up Text-to-Video Generation with Text-free Videos
- Paper relacionado (VideoComposer, NeurIPS 2023): VideoComposer: Compositional Video Synthesis with Motion Controllability
