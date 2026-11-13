# storyteller-platform/quartznet15x5-zh

## Resumen

QuartzNet 15x5 Chinese es un modelo de reconocimiento automatico del habla (ASR) en chino, entrenado originalmente por NVIDIA con la arquitectura QuartzNet 15x5 y publicado en el catalogo NGC como `nvidia/stt_zh_quartznet15x5`. Esta version concreta la distribuye el proyecto Storyteller, que la instala a traves de su herramienta ghost-story y mantiene este repositorio como espejo de la version 2.0.0 de su registro interno de modelos. No se trata, por tanto, de un modelo nuevo ni de un reentrenamiento, sino de una conversion del checkpoint NeMo original a formatos mas portables.

La relevancia de esta ficha esta en el empaquetado: el autor ha convertido los pesos a safetensors para su cargador MLX y ha construido un grafo ONNX nuevo en el que el front end mel (preenfasis, padding reflectivo, STFT como convolucion, proyeccion mel, logaritmo y normalizacion por caracteristica) forma parte del propio modelo. Eso permite ejecutarlo en cualquier execution provider de onnxruntime sin un extractor de caracteristicas separado, y ademas ofrece una variante en fp16 del encoder.

QuartzNet es una arquitectura convolucional 1D con bloques residuales y separable convolutions, pensada para ASR eficiente en CPU y GPU. El sufijo 15x5 indica 15 bloques con kernel 5, un diseno compacto y de baja latencia que lo hace adecuado para transcripcion en tiempo real o en dispositivos con recursos limitados. El repositorio ocupa 0,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuartzNet 15x5 (CNN 1D con bloques residuales y convoluciones separables) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; ventana de audio no especificada en la informacion) |
| Tipos de cuantizacion | fp32 (ONNX y safetensors) y fp16 (ONNX; solo el encoder) |
| Idiomas soportados | chino (zh) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (MLX), ONNX fp32 y ONNX fp16 |

## Arquitectura y entrenamiento

QuartzNet es una red neuronal convolucional 1D con bloques residuales compuestos por convoluciones separables en profundidad, una alternativa a las arquitecturas recurrentes para ASR que reduce drasticamente el numero de parametros y el coste computacional manteniendo precision competitiva. La variante 15x5 emplea 15 bloques con kernel de tamano 5. El modelo original fue entrenado por NVIDIA y distribuido en el catalogo NGC; esta ficha no dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de aumento de datos o ajuste fino con RLHF/DPO (no aplicable en un modelo ASR).

La innovacion de esta version es el proceso de conversion. Cada capa de batch normalization se ha plegado (folded) dentro de la convolucion correspondiente antes de exportar, lo que elimina operaciones en inferencia y simplifica el grafo. El `model.onnx` incorpora el front end acustico completo: recibe la senal preenfatizada y con padding reflectivo, ejecuta la STFT como una convolucion, aplica la proyeccion mel, el logaritmo y la normalizacion por caracteristica. La variante `model_fp16.onnx` mantiene el front end en precision simple y pasa el encoder a media precision. Los scripts de conversion (`convert.py` y `export-onnx.py`) estan publicados en el repositorio de Storyteller.

## Capacidades

- Reconocimiento automatico del habla en chino a partir de audio.
- Extraccion de caracteristicas mel integrada en el grafo ONNX (no requiere un extractor externo).
- Inferencia en cualquier execution provider de onnxruntime gracias al grafo autocontenido.
- Ejecucion en MLX mediante el formato safetensors con el layout esperado por el cargador.
- Variante fp16 del encoder para reducir requisitos de memoria y aumentar throughput.
- No soporta tool calling, function calling, agentes, vision, audio generativo ni razonamiento multi-paso: es un modelo puramente discriminativo de transcripcion.
- Capacidades multilingues limitadas al chino segun la informacion disponible.

## Casos de uso

- Transcripcion de audio en chino en produccion: el modelo convierte senal preenfatizada en texto dentro de un unico grafo ONNX, lo que simplifica el despliegue al eliminar el pipeline de extraccion de caracteristicas.
- Subtitulado automatico de video: su naturaleza convolucional y baja latencia permiten procesar flujos de audio por segmentos y generar subtitulos sincronizados en chino.
- Integracion en aplicaciones de escritorio o moviles con MLX: la version safetensors se carga directamente en el cargador MLX de Storyteller, adecuada para entornos Apple Silicon.
- Servicio de dictado o notas de voz: al ser un modelo compacto (repositorio de 0,2 GB), puede desplegarse en contenedores pequenos o en CPU con onnxruntime sin GPU dedicada.
- Preprocesado de datos para pipelines de NLP en chino: transcripcion masiva de grabaciones para alimentar sistemas de busqueda, analitica o resumen.
- Ejecucion en entornos con aceleradores heterogeneos: al funcionar sobre cualquier execution provider de onnxruntime (CPU, CUDA, DirectML, CoreML), se puede desplegar en infraestructura variada sin reescribir el pipeline.
- Transcripcion en tiempo real de reuniones o llamadas en chino, aprovechando la arquitectura convolucional de baja latencia frente a alternativas recurrentes o transformer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio completo ocupa 0,2 GB, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte para el execution provider de onnxruntime elegido (CUDA, DirectML, CoreML); no se especifican modelos concretos en la informacion.
- Cabe en GPU consumer: si, dado el tamano del repositorio (0,2 GB); tambien es viable en CPU.
- Opciones de despliegue: onnxruntime (cualquier execution provider), MLX (formato safetensors), y las herramientas del ecosistema Storyteller/ghost-story.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|---|
| storyteller-platform/quartznet15x5-zh | QuartzNet 15x5 (CNN) | no disponible | no disponible | CC-BY-4.0 | safetensors, ONNX fp32/fp16 | Conversion con front end mel integrado en ONNX |
| nvidia/stt_zh_quartznet15x5 | QuartzNet 15x5 (CNN) | no disponible | no disponible | CC-BY-4.0 | NeMo checkpoint | Modelo original del que deriva esta conversion |
| Alternativas ASR en chino | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ASR en chino; no genera texto libre ni responde a instrucciones.
- No se dispone de informacion sobre sesgos acusticos, dialectos o variedades del chino cubiertas por el entrenamiento.
- Riesgo de errores de transcripcion en audio con ruido, solapamiento de hablantes o vocabulario especializado; no hay datos de WER publicados en esta informacion.
- La variante fp16 solo aplica media precision al encoder; el front end permanece en fp32, lo que puede limitar la ganancia de memoria en ese tramo.
- La licencia CC-BY-4.0 permite uso comercial con atribucion; es obligatorio citar a NVIDIA y al proyecto Storyteller segun corresponda.
- El repositorio declara 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validacion comunitaria en la informacion disponible.
- La version espejo corresponde a la version 2.0.0 del registro de Storyteller; cambios futuros en el modelo original no se reflejaran automaticamente aqui.
- No se especifica la ventana de audio ni el muestreo esperado en la informacion; conviene consultar `config.json` antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/quartznet15x5-zh
- Modelo original en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/models/stt_zh_quartznet15x5
- Repositorio de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller
- Scripts de conversion: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
