# VedikaSri/rxdecipher-trocr-prescription

## Resumen

`VedikaSri/rxdecipher-trocr-prescription` es un modelo de vision-encoder-decoder publicado en Hugging Face por el usuario VedikaSri, orientado a la tarea de image-text-to-text. Por su identificador y su arquitectura, se trata de un fine-tuning de TrOCR (Transformer-based Optical Character Recognition), el modelo de reconocimiento optico de caracteres presentado por Li et al. en el paper arXiv:1910.09700. El sufijo "prescription" y el prefijo "rxdecipher" sugieren un ajuste especifico para la transcripcion de texto manuscrito o impreso en recetas medicas.

El modelo cuenta con 333.921.792 parametros, un tamano coherente con la variante TrOCR-base (encoder ViT de aproximadamente 86 millones de parametros y decoder RoBERTa de aproximadamente 123 millones, mas las proyecciones y embeddings). El repositorio ocupa 1,3 GB, lo que corresponde a pesos en safetensors en precision fp32. Se distribuye bajo la libreria transformers y es compatible con endpoints de inferencia.

La relevancia de este modelo es acotada pero concreta: la digitalizacion de recetas medicas es un problema real en farmacia y sanidad, donde el texto manuscrito y la jerga abreviada complican el OCR generico. No obstante, la model card esta practicamente vacia (generada automaticamente), no hay datos de entrenamiento, evaluacion ni licencia declarados, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha. Debe tratarse, por tanto, como un artefacto experimental sin garantias de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (TrOCR: encoder ViT + decoder tipo RoBERTa) |
| Parametros totales | 333.921.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TrOCR procesa una imagen y genera una secuencia de texto; el limite practico lo fija la longitud maxima de decodificacion, no declarada) |
| Tipos de cuantizacion | no disponible en la model card; al ser un modelo transformers con safetensors, es cuantizable a fp16/bf16 e int8 mediante herramientas externas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 1,3 GB |
| Compatibilidad | endpoints_compatible, region:us |

## Arquitectura y entrenamiento

La arquitectura corresponde al diseno TrOCR: un encoder de vision tipo Vision Transformer que procesa la imagen de entrada dividiendola en parches y generando una secuencia de representaciones, y un decoder autoregresivo de tipo RoBERTa que produce el texto reconocido token a token condicionado a esas representaciones. Este esquema encoder-decoder sustituye el pipeline clasico de deteccion de cajas mas CTC por un modelo extremo a extremo de reconocimiento de lineas de texto, lo que simplifica el despliegue pero exige recortar previamente las regiones de interes.

No hay informacion sobre el proceso de entrenamiento. La model card no especifica el dataset utilizado, el numero de tokens o imagenes de entrenamiento, si hubo aumento de datos, ni si se aplicaron tecnicas de ajuste fino supervisado sobre el checkpoint original de TrOCR. Tampoco se documentan hiperparametros, regimen de precision (fp32, fp16, bf16) ni infraestructura de computo. El unico dato tecnico verificable es el recuento de parametros y el tamano del repositorio.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de texto, con salida de texto plano generada de forma autoregresiva.
- Transcripcion orientada, segun el nombre del modelo, a recetas medicas ("prescription"), lo que implica tolerancia esperada a texto manuscrito y a abreviaturas farmacologicas, aunque no hay evidencia publicada que lo confirme.
- Procesamiento de una linea o region de texto por inferencia, propio del diseno TrOCR.
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues declaradas.
- No dispone de modo de razonamiento (thinking), audio ni vision general mas alla del OCR.
- No dispone de ventana de contexto conversacional: no es un modelo de chat.

## Casos de uso

- Digitalizacion de recetas manuscritas en farmacia: el modelo recibe el recorte de la linea de prescripcion y devuelve el texto transcrito, que despues se valida contra un catalogo de farmacos. Es adecuado por su especializacion declarada en el dominio, aunque requiere verificacion humana dado que no hay metricas publicadas.
- Extraccion de posologia y dosis en sistemas de historia clinica electronica: integrado como paso OCR previo a un parser de entidades, permite convertir "1 comprimido cada 8 horas durante 7 dias" en campos estructurados.
- Procesamiento por lotes de archivos de recetas escaneadas: al ser un modelo de 334 millones de parametros, cabe en una GPU de consumo y permite procesar lotes grandes en una sola tarjeta, lo que abarata la digitalizacion masiva de archivos historicos.
- Preprocesado en pipelines de facturacion farmaceutica: transcripcion de albaranes y recetas para conciliacion automatica con el sistema de gestion de la oficina de farmacia.
- Investigacion en OCR medico: punto de partida para fine-tuning adicional sobre corpus propios, dado que el checkpoint es pequeno y entrenable en hardware modesto.
- Prototipado rapido de aplicaciones de lectura asistida: integrado via la API de inferencia de Hugging Face (el modelo es endpoints_compatible), permite montar una demo de transcripcion sin infraestructura propia.
- Generacion de datasets etiquetados: uso del modelo para pre-anotar imagenes de recetas que luego se revisan manualmente, acelerando la creacion de corpus supervisados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,4 GB solo para pesos, mas activaciones y memoria del encoder de vision; en la practica, entre 2 y 3 GB con un batch pequeno.
- VRAM estimada en fp16/bf16: aproximadamente 0,7 GB para pesos; el modelo cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp32 (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). Para lotes grandes, se beneficia de GPUs con mas memoria (RTX 4090 con 24 GB, A100 con 40/80 GB).
- Cabe en GPU de consumo: si, practicamente en todas las tarjetas con soporte CUDA de los ultimos anos.
- Opciones de despliegue: transformers con `TrOCRProcessor` y `VisionEncoderDecoderModel`, Hugging Face Inference Endpoints (el modelo esta marcado como endpoints_compatible), y conversion a ONNX para despliegue en CPU. No hay evidencia de soporte nativo en vLLM, TGI o llama.cpp, ya que estos motores estan orientados a modelos de lenguaje y no a OCR encoder-decoder.
- Latencia y throughput: no disponibles. Por el tamano, se espera una latencia por linea en el orden de decenas de milisegundos en GPU moderna, pero es una estimacion no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VedikaSri/rxdecipher-trocr-prescription | 333,9 M | imagen de linea de texto | OCR de recetas | no disponible | Hugging Face, 0 descargas |
| microsoft/trocr-base-printed | ~334 M | imagen de linea de texto | OCR de texto impreso | MIT (segun el repositorio original de TrOCR) | Hugging Face, ampliamente usado |
| microsoft/trocr-base-handwritten | ~334 M | imagen de linea de texto | OCR de texto manuscrito | MIT (segun el repositorio original de TrOCR) | Hugging Face, ampliamente usado |
| Tesseract (OCR clasico) | no aplica (motor no neuronal) | imagen de pagina completa | OCR general | Apache 2.0 | open source, muy extendido |

La comparacion con los checkpoints originales de Microsoft es la mas directa: misma arquitectura y mismo recuento de parametros, pero con la diferencia de que los originales documentan datos de entrenamiento, evaluacion y licencia, mientras que este fine-tuning no aporta ninguno de esos datos. Frente a Tesseract, la ventaja teorica es la tolerancia a texto manuscrito y la especializacion en el dominio, y la desventaja es que TrOCR requiere recortar lineas de texto antes de la inferencia, mientras que Tesseract procesa paginas completas.

## Limitaciones y advertencias

- La model card esta generada automaticamente y no contiene informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto; no hay garantia de calidad ni de comportamiento esperado.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, debe considerarse no apto para produccion hasta que el autor aclare la licencia.
- No hay resultados de benchmarks ni validacion en un conjunto de test, por lo que se desconoce la tasa de error en recetas reales.
- Riesgo de alucinacion: como decoder autoregresivo, puede generar texto plausible pero incorrecto, especialmente en nombres de farmacos y dosis, lo que en un contexto clinico es un riesgo critico. Requiere verificacion humana obligatoria.
- El modelo no registra descargas ni likes, lo que sugiere que no ha sido validado por la comunidad.
- Limitacion estructural de TrOCR: solo procesa lineas o regiones de texto recortadas, no paginas completas; necesita un detector de texto previo.
- No hay informacion sobre idiomas soportados, por lo que no puede asumirse que funcione correctamente con recetas en castellano.
- El nombre del modelo sugiere un dominio muy especifico; su rendimiento fuera de ese dominio (documentos generales, facturas, formularios) es desconocido y probablemente deficiente.
- No se documenta el checkpoint base del que parte el fine-tuning, lo que dificulta reproducir o auditar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VedikaSri/rxdecipher-trocr-prescription
- Paper de TrOCR (Li et al., 2021): https://arxiv.org/abs/1910.09700
- Repositorio oficial de TrOCR en Hugging Face: https://huggingface.co/microsoft/trocr-base-printed
- Variante manuscrita de TrOCR: https://huggingface.co/microsoft/trocr-base-handwritten
- Documentacion de VisionEncoderDecoderModel en transformers: https://huggingface.co/docs/transformers/model_doc/vision-encoder-decoder
- Calculadora de impacto medioambiental citada en la model card: https://mlco2.github.io/impact
