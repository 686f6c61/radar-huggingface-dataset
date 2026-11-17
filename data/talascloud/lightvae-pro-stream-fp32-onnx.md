# TalasCloud/LightVAE-Pro-Stream-FP32-ONNX

## Resumen

LightVAE-Pro-Stream-FP32-ONNX es una exportación a formato ONNX del decodificador causal LightVAE Pro, un VAE (autoencoder variacional) orientado a vídeo y derivado del checkpoint original lightx2v/LightVAE. El paquete lo publica TalasCloud como dos grafos ONNX (uno de arranque y otro de paso, "start" y "step") que comparten un único fichero externo de pesos en FP32. No se trata de un modelo de lenguaje: es un componente de un pipeline de generación o codificación de vídeo, pensado para integrarse como decodificador dentro de una cadena multimedia.

La relevancia de esta publicación es de ingeniería más que de investigación: ofrece una ruta de despliegue en hardware modesto y en Windows. El autor declara como sistema objetivo una AMD Radeon RX 580 2048SP (Polaris, 8 GB) con una CPU Intel Xeon E5-2696 v3 (Haswell, AVX2), con soporte de DirectML a través de su runtime multimedia (koboldcpp-media-pipeline). Es, por tanto, una alternativa para ejecutar el decodificador LightVAE fuera del ecosistema CUDA habitual.

La información disponible es escasa: no hay model card técnica con arquitectura detallada, número de parámetros, resolución soportada ni benchmarks. El repositorio ocupa 1,4 GB y se publica bajo licencia Apache 2.0. Todo lo que sigue se limita a lo declarado por el autor o a lo deducible del propio formato de exportación; el resto se marca como no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VAE causal para vídeo (decodificador LightVAE Pro); topología interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vídeo, no de texto) |
| Tipos de cuantización | FP32 (exportación en precisión completa); no se publican otras variantes |
| Idiomas soportados | no disponible (no es un modelo lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX FP32: dos grafos (start y step) más un fichero externo de tensores compartido; los tres deben mantenerse juntos |
| Modelo base | lightx2v/LightVAE (revisión 4925ea978147b9de492d7a5fd4f9c6d1854ca1cc) |
| Tamaño del repositorio | 1,4 GB |
| Hardware objetivo declarado | Windows, AMD Radeon RX 580 2048SP (Polaris, 8 GB) + Intel Xeon E5-2696 v3 (Haswell, AVX2) |
| Aceleración | DirectML en Windows mediante el runtime multimedia del autor |
| Checksum | SHA-256 edaea90b63938dd646c0a48a060d8c0c7acb89457a74fa112d016d9d502fa5c1 |

## Arquitectura y entrenamiento

El modelo base es LightVAE, un VAE de tipo causal para vídeo según la propia model card ("causal LightVAE Pro decoder"). La exportación separa el grafo en dos etapas, "start" y "step", lo que sugiere un decodificador que procesa el vídeo de forma incremental: un primer paso de inicialización y pasos sucesivos sobre fotogramas o bloques temporales. Los pesos se mantienen en FP32 y se externalizan en un único fichero de tensores compartido por ambos grafos, una práctica habitual en ONNX para evitar duplicar el estado del modelo entre subgrafos.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens o fotogramas vistos, la resolución nativa, el factor de compresión latente ni si hubo etapas de ajuste fino. Tampoco se documentan innovaciones técnicas más allá de la naturaleza causal del decodificador y de la mencionada división en grafos start/step. Cualquier afirmación adicional sobre el entrenamiento sería especulativa.

## Capacidades

- Decodificación de latentes de vídeo a fotogramas: es la función principal del componente, según la model card ("stream decoder in the media pipeline").
- Procesamiento causal por pasos: el grafo "step" permite alimentar el decodificador de forma incremental, adecuado para streaming o generación por bloques.
- Ejecución en FP32 sin pérdida de precisión respecto al checkpoint original, según declara el autor.
- Compatibilidad con DirectML en Windows, lo que habilita GPUs AMD no soportadas por CUDA.
- Integración en pipelines multimedia mediante el runtime koboldcpp-media-pipeline del autor.
- No se documentan capacidades de texto, código, visión semántica, tool calling, agentes ni multilingüismo; no es un modelo de ese tipo.

## Casos de uso

- Decodificación de vídeo generado por modelos de difusión: el VAE convierte los latentes producidos por el modelo generativo en fotogramas; el formato ONNX permite insertarlo en pipelines multiplataforma.
- Streaming de vídeo por bloques: la separación start/step encaja con una decodificación incremental, útil para previsualizaciones en tiempo real o para pipelines que no pueden mantener todo el vídeo en memoria.
- Despliegue en equipos Windows con GPU AMD: el soporte DirectML y el hardware objetivo declarado (RX 580) permiten ejecutar el decodificador en estaciones de trabajo sin CUDA.
- Prototipado e investigación en entornos con hardware limitado: al ser FP32 y ONNX, sirve como referencia de precisión frente a exportaciones cuantizadas.
- Integración en herramientas de edición o postproducción: el runtime multimedia del autor actúa como capa de servicio para consumir el decodificador desde una aplicación.
- Validación de pipelines de vídeo generativo: al mantener la precisión original, es útil para comparar resultados frente a variantes reducidas y aislar errores de cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Tampoco se documentan métricas de latencia, throughput ni calidad de reconstrucción (PSNR, SSIM, FVD) para esta exportación.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; los pesos ocupan 1,4 GB en FP32 en el repositorio, por lo que el modelo en sí cabe holgadamente en 8 GB, pero el consumo real depende de la resolución y del número de fotogramas procesados, que no se documentan.
- GPU recomendadas por el autor: AMD Radeon RX 580 2048SP (Polaris, 8 GB) como sistema objetivo.
- GPU consumer: sí, cabe en GPUs de 8 GB según el hardware objetivo declarado; no se especifican otras.
- Despliegue: ONNX Runtime con ejecución DirectML en Windows, a través del runtime koboldcpp-media-pipeline (release v2026.11.17-r5). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VAE de vídeo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Precisión | Licencia | Notas |
|---|---|---|---|---|---|
| TalasCloud/LightVAE-Pro-Stream-FP32-ONNX | VAE de vídeo causal | ONNX (start/step + pesos externos) | FP32 | Apache 2.0 | Exportación para DirectML/Windows; hardware objetivo RX 580 |
| lightx2v/LightVAE | VAE de vídeo causal | Checkpoint original (formato no detallado) | No disponible | No disponible en la información | Modelo base del que deriva esta exportación |
| Otras exportaciones ONNX de VAE de vídeo | VAE de vídeo | ONNX | Variable | Variable | No disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de especificaciones de terceros que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Información técnica muy limitada: no hay parámetros, resolución nativa, factor de compresión latente ni métricas de calidad; evaluar su idoneidad en producción exige pruebas propias.
- Dependencia del runtime del autor: el soporte DirectML se canaliza a través de koboldcpp-media-pipeline, un proyecto personal; conviene revisar su mantenimiento y licencia antes de adoptarlo.
- Gestión de ficheros: los dos grafos ONNX y el fichero externo de pesos deben mantenerse juntos y con los nombres esperados; un empaquetado incorrecto rompe la carga.
- Precisión FP32: implica mayor uso de memoria y ancho de banda que variantes FP16 o cuantizadas; en GPUs de gama baja puede limitar resolución o número de fotogramas.
- Sin garantías de calidad: no se publican evaluaciones de artefactos, coherencia temporal ni sesgos; los sesgos del modelo base (derivados de sus datos de entrenamiento, no documentados) se heredan.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las condiciones del modelo base lightx2v/LightVAE, cuya licencia no se detalla en la información disponible.
- Sin soporte declarado para CUDA, ROCm nativo ni otras plataformas; el autor solo menciona Windows y DirectML.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de validación prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/TalasCloud/LightVAE-Pro-Stream-FP32-ONNX
- Modelo base: https://huggingface.co/lightx2v/LightVAE
- Revisión del checkpoint original: https://huggingface.co/lightx2v/LightVAE/tree/4925ea978147b9de492d7a5fd4f9c6d1854ca1cc
- Runtime multimedia (release v2026.11.17-r5): https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
