# superpdf/LightOnOCR-3-0.8B-ONNX-web

## Resumen

LightOnOCR-3-0.8B-ONNX-web es una conversion a ONNX del modelo lightonai/LightOnOCR-3-0.8B, publicada por el proyecto superPDF para ejecutar OCR y comprension de documentos directamente en el navegador mediante Transformers.js y ONNX Runtime con backend WebGPU. El modelo base lo desarrolla LightOn y forma parte de la familia LightOnOCR-3, orientada a convertir pixeles de documentos (facturas, articulos cientificos, documentacion tecnica) en texto y estructuras utilizables por aplicaciones de busqueda, extraccion y RAG.

La conversion mantiene la arquitectura Qwen3.5 del original (image-text-to-text con vision encoder), pero reduce el peso de forma agresiva: el decodificador y los embeddings de tokens se cuantizan a 4 bits con MatMulNBits y GatherBlockQuantized (block size 32, asimetrico con zero points), mientras que el vision encoder se conserva en float16. El repositorio ocupa aproximadamente 0,9 GB, lo que permite su descarga y ejecucion en clientes web sin infraestructura de servidor.

Es relevante ahora porque demuestra un flujo de despliegue on-device de un modelo de OCR de ultima generacion: 0,8B de parametros, licencia Apache-2.0 y pesos verificados con hashes SHA-256. El autor indica que estos mismos bytes alimentan la lectura de alta precision de superPDF tanto en WebGPU como en su herramienta de linea de comandos, y que la conversion se valido de forma independiente tensor a tensor contra el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3.5 (image-text-to-text) con vision encoder y capas gated delta net; decodificador autorregresivo |
| Parametros totales | 0,8 mil millones (0.8B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Decodificador y embeddings 4-bit (MatMulNBits / GatherBlockQuantized, block size 32, asimetrica con zero points); vision encoder float16; pesos base en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (ONNX Runtime); el modelo base se distribuye en safetensors bfloat16 |

## Arquitectura y entrenamiento

La conversion emplea la arquitectura Qwen3.5, la misma que el modelo base lightonai/LightOnOCR-3-0.8B. Se compone de un vision encoder que procesa la pagina como imagen y un decodificador de lenguaje que genera la transcripcion o la estructura solicitada. La model card menciona de forma explicita la presencia de capas gated delta net (en las que el parametro A se almacena como -exp(A_log)), lo que apunta a un diseno hibrido con mecanismos de atencion lineal junto a la atencion estandar. Los grafos ONNX proceden de onnx-community/Qwen3.5-0.8B-ONNX-OPT, cuyas configuraciones coinciden con LightOnOCR-3 salvo por la capa de multi-token prediction, que no se utiliza.

Sobre el entrenamiento del modelo base, la informacion disponible no detalla numero de tokens, composicion del dataset ni si hubo RLHF o DPO; la model card original de LightOn es la referencia indicada para esos datos. Lo que si se documenta en esta ficha es el proceso de conversion: los pesos base se tomaron de lightonai/LightOnOCR-3-0.8B en la revision 36d8636925327c671bd8e479c517a004f7566bd9 (safetensors, bfloat16), cada tensor de los grafos se recalculo desde los pesos de LightOn y se reescribio en su posicion original, los pesos de normalizacion se almacenan como 1 + w y la cuantizacion 4-bit se calculo con la propia funcion quantize_matmul_4bits de ONNX Runtime. El autor verifico la conversion de forma independiente: el vision encoder es bit-identico, el resto de tensores coincide salvo empates de redondeo de 4 bits (menos del 0,1% de los bytes empaquetados) y los tensores en coma flotante (normas, gates, convoluciones) son exactos. Estos bytes son identicos a los de andrzej/LightOnOCR_webGPU.

## Capacidades

- Transcripcion de documentos con cajas (bounding boxes) mediante el prompt `grounding`, con decodificacion greedy y paginas renderizadas con el lado mas largo entre 1540 y 2048 pixeles.
- Comprension de documentos (document-understanding): conversion de pixeles de pagina a texto y estructuras para busqueda, extraccion y RAG.
- Generacion de texto condicionada por imagen (pipeline image-text-to-text), con soporte conversacional segun los tags del repositorio.
- Procesamiento multimodal: entrada de imagen mas instruccion de texto, salida de texto.
- Ejecucion on-device en navegador (WebGPU) y en Node mediante Transformers.js sobre ONNX Runtime.
- Vision encoder en float16 y decodificador 4-bit, con generacion configurable (por ejemplo `max_new_tokens: 6144`, `do_sample: false`).
- Control explicito del modo de razonamiento mediante el parametro `enable_thinking` de la plantilla de chat (en el ejemplo se establece en `false`).
- No se documenta soporte de tool calling, function calling ni de agentes multi-paso en la informacion disponible.
- No se detallan capacidades de audio ni otros idiomas distintos de los no especificados.

## Casos de uso

- OCR en el navegador sin servidor: aplicaciones web que suben un PDF o una imagen y obtienen la transcripcion localmente gracias al backend WebGPU, sin enviar el documento a una API externa. Adecuado por el tamano del repositorio (0,9 GB) y por ejecutarse sobre Transformers.js.
- Extraccion estructurada para RAG: convertir facturas, articulos cientificos y documentacion tecnica en texto indexable que alimente un pipeline de recuperacion, aprovechando el prompt de grounding para conservar la relacion entre texto y su posicion en la pagina.
- Herramientas de linea de comandos: el autor indica que este modelo es el modelo por defecto de su CLI de superPDF, por lo que encaja en scripts de procesamiento por lotes de documentos en Node.
- Procesamiento de documentos sensibles en local: al ejecutarse on-device, permite tratar contratos o informes que no deben salir del equipo del usuario, reduciendo la exposicion de datos frente a servicios en la nube.
- Digitalizacion masiva de archivos historicos o escaneos: la generacion con `max_new_tokens: 6144` y decodificacion greedy esta pensada para paginas densas en texto, con resoluciones de renderizado de 1540 a 2048 pixeles en el lado mayor.
- Asistentes de lectura de documentos: la capacidad conversacional y multimodal permite construir interfaces donde el usuario adjunta una pagina y formula preguntas sobre su contenido.
- Verificacion y control de calidad de OCR: la salida con cajas de grounding facilita auditar que regiones de la pagina se han transcrito y comparar la posicion del texto detectado con la imagen original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversion remite explicitamente a la model card de lightonai/LightOnOCR-3-0.8B para consultar puntuaciones y detalles del modelo. La nota de prensa de LightOn (2026-10-08) afirma que la familia LightOnOCR-3 obtiene resultados lideres en benchmarks y un rendimiento state-of-the-art en documentos en frances y escritura manuscrita, por delante de modelos estadounidenses y chinos, pero no se incluyen cifras concretas en el material proporcionado. No se inventan numeros.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa aproximadamente 0,9 GB en total (decodificador 4-bit ~484 MB, embeddings 4-bit ~163 MB, vision encoder fp16 ~205 MB, tokenizer ~19 MB), por lo que la huella de pesos ronda 1 GB, mas el espacio de activaciones y cache durante la generacion.
- GPU recomendadas: cualquier GPU con soporte WebGPU para el uso en navegador; en el modelo base, el ecosistema habitual de vLLM (A100, H100, L40S) seria el objetivo para despliegue en servidor, aunque esta conversion concreta esta pensada para ONNX Runtime.
- Cabe en GPU de consumo: si, esta disenado para ello; cualquier GPU de escritorio o portatil con WebGPU y al menos 2-4 GB de memoria grafica deberia poder cargarlo, dado el tamano cuantizado a 4 bits.
- Opciones de despliegue: Transformers.js con ONNX Runtime sobre WebGPU (navegador) y sobre Node; el repositorio lightonai/LightOnOCR ofrece cliente, CLI y visor para los modelos servidos con vLLM, pero esa via corresponde al modelo original en safetensors, no a esta conversion ONNX.
- Latencia y throughput: no disponibles. Dependen del backend WebGPU del navegador, del hardware grafico y del numero de tokens generados (`max_new_tokens` configurable, hasta 6144 en el ejemplo de la model card).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| superpdf/LightOnOCR-3-0.8B-ONNX-web | 0,8B | ONNX, decodificador 4-bit, vision encoder fp16 | Apache-2.0 | HuggingFace, ~0,9 GB | Conversion para navegador y Node con Transformers.js y WebGPU |
| lightonai/LightOnOCR-3-0.8B | 0,8B | safetensors, bfloat16 | Apache-2.0 | HuggingFace | Modelo base original; referencia para puntuaciones y detalles |
| andrzej/LightOnOCR_webGPU | 0,8B | ONNX, misma cuantizacion | Apache-2.0 | HuggingFace | Bytes identicos a esta conversion; superPDF lo replica en su propio repositorio |
| onnx-community/Qwen3.5-0.8B-ONNX-OPT | 0,8B | ONNX | no disponible | HuggingFace | Origen de los grafos ONNX empleados; configuracion coincidente salvo la capa de multi-token prediction no usada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la comparacion es, por tanto, de formato, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible verificar el rendimiento real frente a otros modelos de OCR.
- Los idiomas soportados no estan declarados en la model card de esta conversion; la nota de prensa menciona buen rendimiento en frances, pero no se detalla la cobertura completa ni la calidad por idioma.
- La longitud de contexto no esta especificada, lo que dificulta planificar el procesamiento de paginas muy densas o de documentos de varias paginas en una sola llamada.
- Riesgo de alucinacion: al ser un modelo generativo de 0,8B, la transcripcion puede introducir texto no presente en la imagen, especialmente en documentos con baja calidad de escaneo, tablas complejas o caligrafia dificil. Conviene validar la salida en flujos criticos.
- Sesgos conocidos: no se documentan en la informacion disponible; al no detallarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos por idioma, tipo de documento o demografia.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio y las condiciones del modelo base de LightOn antes de integrarlo en produccion.
- La cuantizacion 4-bit del decodificador introduce empates de redondeo (por debajo del 0,1% de los bytes empaquetados segun el autor) que pueden producir diferencias minimas frente al modelo en bfloat16.
- Dependencia de WebGPU: el rendimiento y la compatibilidad estan supeditados al soporte del navegador y del hardware grafico del usuario final; en entornos sin WebGPU puede ser necesario recurrir a otra opcion de despliegue.
- Esta conversion no cubre la capa de multi-token prediction del modelo base, que no se utiliza en los grafos ONNX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/superpdf/LightOnOCR-3-0.8B-ONNX-web
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
- Perfil del autor: https://huggingface.co/superpdf
- Repositorio de grafos ONNX de origen: https://huggingface.co/onnx-community/Qwen3.5-0.8B-ONNX-OPT
- Conversion espejo: https://huggingface.co/andrzej/LightOnOCR_webGPU
- Pagina de investigacion de LightOnOCR-3: https://www.lighton.ai/research/lightonocr-3
- Repositorio GitHub de LightOnOCR: https://github.com/lightonai/LightOnOCR
- Nota de prensa de LightOn sobre LightOnOCR-3: https://www.lighton.ai/investors/documents/2026-10-08-lighton-releases-lightonocr-3-a-world-leading-model-family-for-docume.pdf
- Sitio de superPDF: https://superpdf.ai
