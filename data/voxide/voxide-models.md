# voxide/voxide-models

## Resumen

voxide/voxide-models es un repositorio de exportaciones en formato ONNX de los modelos de segmentación SAM 2.1 (familia Hiera, en las variantes tiny, small, base+ y large) y SAM-Med3D turbo, publicado por el usuario voxide. No se trata de un modelo entrenado desde cero ni ajustado: son conversiones de inferencia de los checkpoints originales, generadas con PyTorch 2.9.0, ONNX opset 18 e IR version 8, sin fine-tuning, cuantización ni ninguna otra modificación de los pesos.

Cada modelo se distribuye como un par encoder/decoder pensado para ejecutarse en CPU con ONNX Runtime. SAM 2.1 cubre la segmentación interactiva de cortes 2D y SAM-Med3D turbo la de volúmenes 3D. El propósito declarado es alimentar Voxide, un visor de volúmenes acelerado por GPU orientado a microscopía, que usa el par tiny por defecto y descarga el resto bajo petición desde este repositorio en una revisión fijada, verificando cada fichero contra el SHA-256 listado en `SHA256SUMS`.

La relevancia práctica del repositorio es de empaquetado más que de investigación: ofrece pesos con licencia Apache 2.0 en un formato portable, lo que permite integrar segmentación tipo SAM en aplicaciones de escritorio sin arrastrar una dependencia de PyTorch en tiempo de ejecución. El repositorio ocupa 1,8 GB y registra 0 descargas y 0 likes en el momento de la consulta. No se declaran idiomas, algo esperable en modelos que no procesan texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 (backbone Hiera, transformer jerarquico) y SAM-Med3D turbo (adaptacion 3D de SAM) |
| Parametros totales | no disponible (la model card no publica recuentos de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos de segmentacion guiados por prompts: puntos, cajas y mascaras) |
| Tipos de cuantizacion | ninguna; exportaciones sin cuantizar en coma flotante |
| Idiomas soportados | no disponible (no procesan texto; la entrada es imagen o volumen) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 18, IR version 8), pares encoder/decoder |
| Pipeline declarado | mask-generation |
| Libreria | onnx |
| Tamano del repositorio | 1,8 GB |
| Variantes incluidas | SAM 2.1 Hiera tiny, small, base+ y large; SAM-Med3D turbo |
| Verificacion de integridad | fichero `SHA256SUMS` con hash por fichero |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no documenta detalles de arquitectura interna ni de entrenamiento; se limita a indicar que son exportaciones de inferencia no modificadas de los checkpoints de origen. Por el material disponible, SAM 2.1 corresponde a la familia de Meta con backbone Hiera, un transformer jerárquico con atención en memoria para el seguimiento en vídeo, mientras que SAM-Med3D turbo es la adaptación a volúmenes tridimensionales de la formulación SAM original, orientada a imagen médica. En este repositorio, los pares de SAM 2.1 se emplean sobre cortes 2D y el par de SAM-Med3D turbo sobre volúmenes 3D.

El proceso de conversion es explicito y reproducible en cuanto a herramientas: PyTorch 2.9.0, ONNX opset 18 e IR version 8. No hay fine-tuning, cuantizacion ni poda, de modo que el comportamiento numerico deberia ser el de los checkpoints originales, con las diferencias propias del cambio de runtime. Para los detalles de entrenamiento (composicion del dataset, numero de tokens, uso de RLHF o DPO) no hay informacion en el material proporcionado; habria que consultar los articulos originales citados en la model card.

## Capacidades

- Segmentacion interactiva de imagenes 2D a partir de prompts geometricos (puntos, cajas y mascaras), mediante las cuatro variantes de SAM 2.1.
- Generacion de mascaras de segmentacion, que es la etiqueta de pipeline declarada para el repositorio.
- Segmentacion de volumenes 3D completos con SAM-Med3D turbo, orientada a imagen medica y microscopia.
- Ejecucion en CPU mediante ONNX Runtime con pares encoder/decoder separados, lo que permite cachear el embedding del encoder y reutilizarlo entre prompts.
- Verificacion criptografica de los pesos descargados contra SHA-256 antes de cargarlos.
- Importacion manual de los ficheros en Voxide mediante la opcion Models -> Import model, con nombres de fichero fijos `<name>_encoder.onnx` / `<name>_decoder.onnx`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues: no procesa lenguaje natural.
- No dispone de modo thinking, vision por lenguaje ni procesamiento de audio.
- No se documenta soporte de seguimiento de video en las exportaciones ONNX, pese a que la arquitectura SAM 2.1 lo contempla en su version original.

## Casos de uso

- Segmentacion interactiva en microscopia: el visor Voxide usa el par Hiera tiny para delimitar estructuras sobre cortes 2D mientras el usuario hace clic, aprovechando que el encoder se ejecuta en CPU y no compite con la GPU que renderiza el volumen.
- Anotacion de datasets de imagen medica: las variantes small, base+ y large permiten generar mascaras de mayor calidad para construir conjuntos de entrenamiento o validacion, con la variante elegida en funcion del presupuesto de tiempo por anotacion.
- Segmentacion volumetrica de CT o MRI: SAM-Med3D turbo trabaja directamente sobre volumenes 3D, lo que evita segmentar corte a corte y perder coherencia entre planos.
- Integracion en aplicaciones de escritorio: al ser ONNX y ejecutarse con ONNX Runtime en CPU, el modelo puede embeberse en herramientas nativas sin distribuir una instalacion de PyTorch.
- Despliegue verificado en entornos regulados: la comprobacion contra `SHA256SUMS` en una revision fijada permite garantizar que los pesos cargados son exactamente los esperados, algo util en pipelines con trazabilidad.
- Preprocesado en pipelines de analisis de imagen: generar mascaras de region de interes antes de etapas posteriores de conteo, morfometria o clasificacion.
- Prototipado rapido de segmentacion guiada por prompt: usar el par tiny como linea base de bajo coste antes de decidir si merece la pena la variante large.
- Seleccion de modelo por recurso disponible: descargar solo el par necesario mediante `hf download` con el patron de ficheros correspondiente, en lugar de los 1,8 GB completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de IoU, Dice ni comparaciones cuantitativas con otros modelos, y el repositorio es una conversion de formato sin evaluacion propia asociada.

## Requisitos de hardware

- Inferencia en CPU: la model card indica explicitamente que cada modelo es un par encoder/decoder ejecutado en CPU con ONNX Runtime.
- Huella en disco y memoria aproximada por par, segun los tamanos de fichero declarados:
  - SAM 2.1 Hiera tiny: encoder 110 MB + decoder 17 MB (127 MB).
  - SAM 2.1 Hiera small: encoder 139 MB + decoder 17 MB (156 MB).
  - SAM 2.1 Hiera base+: encoder 278 MB + decoder 17 MB (295 MB).
  - SAM 2.1 Hiera large: encoder 853 MB + decoder 17 MB (870 MB).
  - SAM-Med3D turbo: encoder 373 MB + decoder 31 MB (404 MB).
- VRAM estimada para inferencia: no aplica en el modo descrito (CPU); no se proporcionan cifras de despliegue en GPU.
- GPU recomendadas: no disponibles para estos pesos. El visor Voxide usa GPU para renderizar volumenes, pero la segmentacion descrita se ejecuta en CPU.
- Cabe en GPU de consumo: no aplica segun la informacion disponible, ya que la ejecucion declarada es en CPU.
- Opciones de despliegue: ONNX Runtime; la model card no menciona vLLM, llama.cpp, Ollama ni TGI, que ademas no son aplicables a modelos de segmentacion de este tipo.
- Latencia y throughput estimados: no disponibles. El unico dato cualitativo es que tiny es la variante mas rapida y large la mas lenta, a cambio de mejores mascaras.

## Comparativa con modelos similares

| Modelo | Formato | Encoder | Decoder | Uso previsto en Voxide | Licencia |
|---|---|---|---|---|---|
| SAM 2.1 Hiera tiny (este repo) | ONNX | 110 MB | 17 MB | Cortes 2D, por defecto, el mas rapido | Apache 2.0 |
| SAM 2.1 Hiera small (este repo) | ONNX | 139 MB | 17 MB | Cortes 2D | Apache 2.0 |
| SAM 2.1 Hiera base+ (este repo) | ONNX | 278 MB | 17 MB | Cortes 2D | Apache 2.0 |
| SAM 2.1 Hiera large (este repo) | ONNX | 853 MB | 17 MB | Cortes 2D, mejores mascaras, el mas lento | Apache 2.0 |
| SAM-Med3D turbo (este repo) | ONNX | 373 MB | 31 MB | Volumenes 3D | Apache 2.0 |
| Checkpoints originales SAM 2.1 (facebook/sam2.1-hiera-*) | PyTorch | no disponible | no disponible | Requiere conversion a ONNX para este flujo | Apache 2.0 |
| SAM-Med3D original (uni-medical/SAM-Med3D) | PyTorch | no disponible | no disponible | Requiere conversion a ONNX para este flujo | Apache 2.0 (segun la model card) |

La comparacion con alternativas de la misma tarea pero distinta familia (por ejemplo MedSAM o nnU-Net) no esta disponible: no hay datos de rendimiento en la informacion proporcionada que permitan una comparacion cuantitativa honesta.

## Limitaciones y advertencias

- Repositorio sin adopcion registrada: 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni issues publicos que documenten problemas.
- Al ser exportaciones sin cambios en los pesos, hereda integramente los sesgos y limitaciones de los checkpoints originales de SAM 2.1 y SAM-Med3D; el repositorio no anade ninguna evaluacion propia.
- Riesgo de alucinacion de mascaras: como cualquier modelo de segmentacion guiado por prompts, puede producir contornos plausibles pero incorrectos, especialmente en estructuras de bajo contraste o con artefactos.
- Entrenamiento y evaluacion en imagen medica: no hay informacion sobre validacion clinica ni sobre el dominio concreto para el que se validaron los pesos originales. No debe usarse como dispositivo medico ni para decision clinica sin validacion independiente.
- La model card no declara idiomas porque el modelo no procesa texto; no cabe esperar capacidades de lenguaje.
- No se documenta soporte de seguimiento en video en las exportaciones, pese a que la arquitectura de origen lo contempla.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se exige mantener la atribucion a Meta Platforms (SAM 2.1) y a los autores de SAM-Med3D, y citar los articulos correspondientes en trabajos publicados.
- Operativas: los ficheros deben conservar exactamente el nombre `<name>_encoder.onnx` / `<name>_decoder.onnx` para que Voxide los localice, y cualquier redistribucion deberia acompanarse de la verificacion SHA-256.
- Rendimiento en CPU: no hay cifras de latencia publicadas, y la variante large (870 MB entre encoder y decoder) puede resultar lenta en equipos modestos, ya que no se ofrece ninguna cuantizacion.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/voxide/voxide-models
- Fichero de verificacion de integridad: https://huggingface.co/voxide/voxide-models/blob/main/SHA256SUMS
- Licencia del repositorio: https://huggingface.co/voxide/voxide-models/blob/main/LICENSE
- Perfil del autor: https://huggingface.co/voxide
- SAM 2.1 (codigo original, Meta): https://github.com/facebookresearch/sam2
- SAM-Med3D (codigo original): https://github.com/uni-medical/SAM-Med3D
- Articulo SAM 2: Segment Anything in Images and Videos: https://arxiv.org/abs/2408.00714
- Articulo SAM-Med3D: Towards General-purpose Segmentation Models for Volumetric Medical Images: https://arxiv.org/abs/2310.15161
- Documentacion de Voxide: https://voxide.app/docs
- Voxide, acciones y function calling en el navegador: https://voxide.app/docs/actions
- Ficha de Voxide en Fresh Builds: https://www.freshbuilds.io/products/voxide
- Repositorio pmd-coutinho/voxide (aplicacion de dictado, no relacionada con estos pesos): https://github.com/pmd-coutinho/voxide
- Directorio aimodels.org (recopilatorio de descargas de modelos, no especifico de este repositorio): https://aimodels.org/ai-models/

Nota: los resultados de busqueda web sobre Voxide corresponden a un SDK de voz para React/Next.js y a una aplicacion de dictado en Rust y Tauri; los identificadores y repositorios no coinciden con los pesos de segmentacion descritos en esta ficha, por lo que deben considerarse proyectos homonimos y no documentacion de este modelo.
