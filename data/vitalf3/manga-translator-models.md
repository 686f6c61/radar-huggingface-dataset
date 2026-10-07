# vitalf3/manga-translator-models

## Resumen

`vitalf3/manga-translator-models` no es un unico modelo, sino un repositorio de distribucion que aloja los seis ficheros ONNX que el motor en Rust de [manga-translator](https://github.com/vitorandreazza/manga-translator) descarga en su primera ejecucion. El repositorio actua como espejo inmutable: cada fichero esta fijado por URL de commit, sha256 y tamano en un manifiesto compilado, de modo que una nueva exportacion genera un nombre de fichero nuevo y nunca sobrescribe el anterior. El conjunto cubre las tres etapas clasicas de un pipeline de traduccion de manga: deteccion de globos y texto, reconocimiento optico de caracteres e inpintado de las regiones de texto para reconstruir el dibujo subyacente.

Los componentes proceden de tres proyectos de codigo abierto consolidados. El detector `comictextdetector.pt.onnx` es un espejo byte a byte del export ONNX publicado en la release `beta-0.3` de `zyddnys/manga-image-translator`, a su vez derivado de `dmMaze/comic-text-detector`. El OCR esta exportado desde `kha-white/manga-ocr-base` (obra de Maciej Budys) y se ha dividido en tres grafos ONNX: el encoder ViT, la atencion cruzada K/V del decoder y un paso de decoder con cache KV y reordenacion de beam search. El inpintado corresponde a LaMa (`big-lama`), exportado a partir de los pesos distribuidos por `simple-lama-inpainting` y cargados de forma estricta en el `FFCResNetGenerator` de `advimman/lama`.

La relevancia de este repositorio es practica mas que cientifica: empaqueta en un unico origen verificable los artefactos necesarios para ejecutar traduccion de manga en local sin depender de PyTorch en tiempo de inferencia. Al estar todo en ONNX en fp32, se puede desplegar sobre ONNX Runtime con ejecucion en CPU o CUDA. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta y fue creado el 6 de octubre de 2026 (fecha declarada por la plataforma).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto de tres redes independientes: detector de texto CNN (comic-text-detector), OCR tipo encoder ViT + decoder con atencion cruzada y cache KV (manga-ocr), e inpintado FFCResNet con convolucion de Fourier en el generador (LaMa) |
| Parametros totales | no disponible (los pesos se distribuyen en fp32; tamanos de fichero indicados en la tabla de componentes) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje); el decoder de OCR usa cache KV y beam search, sin longitud declarada |
| Tipos de cuantizacion | no disponible; todos los pesos se distribuyen en fp32 |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | mixta (`license: other`, `license_name: mixed`): GPL-3.0 para el detector, Apache-2.0 para el resto |
| Formato de pesos | ONNX (fp32) mas `vocab.txt` para el tokenizador |
| Libreria declarada | onnx |
| Tamano del repositorio | 0,8 GB |
| Descargas / likes | 0 / 0 |

Componentes y verificacion:

| Fichero | Funcion | sha256 | Tamano (bytes) | Licencia |
|---|---|---|---|---|
| `comictextdetector.pt.onnx` | Detector de texto, espejo sin cambios | `1a86ace74961413cbd650002e7bb4dcec4980ffa21b2f19b86933372071d718f` | 94.669.756 | GPL-3.0 |
| `encoder.onnx` | Encoder ViT de manga-ocr | `73f84b2b826dea748c23453a56578667ab15f218a2eb68b52f28d5ad851a1779` | 344.310.126 | Apache-2.0 |
| `cross.onnx` | Atencion cruzada K/V del decoder de manga-ocr | `99a3528c4fc3f254eb35251f3eeab00f80ea91122b4e3abcf3673b3d657f25ec` | 9.456.788 | Apache-2.0 |
| `step_reorder.onnx` | Paso de decoder con cache KV y reordenacion de beam search | `7163328b45dadb80fdb9fb21d747d074a88bc989b1f3c35fecdd904e62783bb7` | 107.928.324 | Apache-2.0 |
| `vocab.txt` | Vocabulario del tokenizador de manga-ocr, verbatim | `344fbb6b8bf18c57839e924e2c9365434697e0227fac00b88bb4899b78aa594d` | 24.072 | Apache-2.0 |
| `lama_mat.onnx` | LaMa (`big-lama`), H/W dinamicas, DFT por matmul | `c170bd504ee71711ebc774816aa616ab9076b9f38230e460aeecd1590733ae82` | 208.171.227 | Apache-2.0 |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una capa de empaquetado y exportacion. El detector `comictextdetector.pt.onnx` se toma como espejo byte a byte del export ONNX de la release `beta-0.3` de `zyddnys/manga-image-translator`, que a su vez exporta `dmMaze/comic-text-detector`; la model card no detalla la topologia interna del detector mas alla de su funcion de deteccion de texto en paginas de comic. El OCR se exporta desde `kha-white/manga-ocr-base` en la revision `aa6573bd10b0d446cbf622e29c3e084914df9741` mediante `scripts/export/export_kv.py` del commit `497e3d8` del motor. La exportacion conserva los pesos en fp32 y aplica una division personalizada en dos grafos: uno para la atencion cruzada (K/V) y otro para el paso del decoder con cache KV y reordenacion de beam, lo que permite reutilizar la cache entre pasos de decodificacion sin recalcular el encoder.

El componente de inpintado, `lama_mat.onnx`, se exporta desde `big-lama.pt` (sha256 `7ba7aa7ac37a4d41fdbbeba3a2af7ead18058552997e3a3cd1a3b2210c9e6b4c`, en la distribucion de `simple-lama-inpainting` 0.1.0) mediante `scripts/export/export_mat.py` del mismo commit. Los pesos cargan de forma estricta en el `FFCResNetGenerator` de `advimman/lama`, con la particularidad de que la `FourierUnit` original se sustituye por una DFT implementada con operaciones matmul; el grafo mantiene altura y anchura dinamicas en multiplos de 8 y precision fp32. La model card no aporta informacion sobre volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF o DPO en ninguno de los tres componentes: esa informacion corresponde a los proyectos de origen y no se reproduce aqui.

## Capacidades

- Deteccion de regiones de texto en paginas de manga mediante `comictextdetector.pt.onnx`.
- Reconocimiento optico de caracteres sobre los recortes detectados mediante la pareja encoder + decoder de manga-ocr, con decodificacion por beam search y cache KV.
- Tokenizacion del texto reconocido a partir del `vocab.txt` distribuido verbatim.
- Inpintado de las regiones de texto para reconstruir el fondo y el trazo del dibujo, con resoluciones de entrada dinamicas en multiplos de 8.
- Ejecucion completa fuera de PyTorch: los seis artefactos son ONNX, pensados para ONNX Runtime en CPU y CUDA.
- Verificacion de integridad por sha256 y por tamano en bytes, con ficheros inmutables y nombres nuevos por exportacion.
- No dispone de tool calling, function calling, capacidades de agente ni generacion de texto libre: no es un modelo de lenguaje.
- No se declaran capacidades multimodales generativas (vision-lenguaje, audio) mas alla del OCR y la segmentacion descritos.

## Casos de uso

- Pipelines de scanlation automatizada: el motor encadena deteccion, OCR e inpintado para producir una pagina limpia y un texto extraido que despues se traduce con un modelo aparte; la separacion en seis grafos permite cachear el encoder entre lineas de una misma pagina.
- Digitalizacion de catalogos de manga en bibliotecas y editoriales: extraccion del texto de tomos escaneados para generar indices buscables, reutilizando el detector para segmentar globos y cartelas.
- Aplicaciones de lectura con traduccion en tiempo real: al ejecutarse en ONNX Runtime sobre CPU o GPU de gama media, el conjunto se puede integrar en un cliente de escritorio que superponga el texto traducido sobre la pagina original.
- Limpieza y restauracion de arte: `lama_mat.onnx` reconstruye las zonas ocupadas por rotulos, util para reutilizar ilustraciones sin texto o para preparar material de reedicion.
- Preprocesado para accesibilidad: convertir el texto de un manga a voz requiere primero OCR; el grafo de manga-ocr entrega la transcripcion que alimentaria un sintetizador.
- Evaluacion y regresion de pipelines de OCR: la suite de paridad del motor compara la salida exportada contra la original en PyTorch, lo que sirve como banco de pruebas para validar cambios en el preprocesado de imagen.
- Herramientas de anotacion asistida: el detector y el OCR pueden preanotar globos y transcripciones para que un humano solo corrija, reduciendo el coste de construir corpus etiquetados.
- Integracion como dependencia de un motor nativo: el motor en Rust fija cada fichero por URL, sha256 y tamano, de modo que la descarga en la primera ejecucion es reproducible y auditable en entornos de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible, ya que el repositorio no contiene modelos de lenguaje. La unica validacion reportada es la suite de paridad del motor, que compara la exportacion ONNX con el pipeline original en PyTorch:

| Prueba de paridad | Resultado declarado | Ambito |
|---|---|---|
| OCR (manga-ocr) | texto exacto en las 94 paginas del corpus | todas las paginas de la suite |
| LaMa (inpintado) | dentro del umbral de pixel R4 | ejecucion en CUDA y en CPU |

No se aportan cifras de latencia, throughput ni precision por caracter en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero mas grande es `encoder.onnx` (344.310.126 bytes, unos 328 MiB), seguido de `lama_mat.onnx` (unos 199 MiB); con pesos en fp32 y activaciones de una sola pagina, el conjunto cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU con soporte CUDA para ONNX Runtime; no se necesita una A100 ni una H100. Tarjetas de gama media como la serie RTX 3060 o superiores son suficientes, y el componente de OCR tambien puede ejecutarse en GPU integrada o en CPU.
- Viabilidad en GPU de consumo: si. Los tres modelos son pequenos y se pueden mantener cargados simultaneamente en GPUs de consumo con 4 GB o mas de VRAM.
- Opciones de despliegue: ONNX Runtime con ejecution provider de CUDA o de CPU (son los dos entornos citados en la suite de paridad); el consumo previsto es desde el motor en Rust de manga-translator. vLLM, llama.cpp, Ollama y TGI no son aplicables porque no hay un modelo de lenguaje con pesos GGUF.
- Latencia y throughput estimados: no disponible. La model card no publica tiempos por pagina ni por region detectada.

## Comparativa con modelos similares

La comparacion natural es contra los artefactos originales en PyTorch de los que procede cada componente, dado que no existen "modelos comparables" en el sentido de pesos alternativos con la misma triple funcionalidad.

| Alternativa | Componente equivalente | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|
| `kha-white/manga-ocr-base` | OCR (encoder + decoder) | PyTorch (`pytorch_model.bin`) | Apache-2.0 | HuggingFace |
| `dmMaze/comic-text-detector` | Detector de texto | PyTorch | GPL-3.0 | GitHub |
| Export ONNX de `zyddnys/manga-image-translator` (`beta-0.3`) | Detector de texto | ONNX | GPL-3.0 | GitHub (release) |
| `advimman/lama` / `big-lama` distribuido por `simple-lama-inpainting` | Inpintado | PyTorch | Apache-2.0 | GitHub y paquete Python |

La diferencia frente a estos originales no es de calidad del modelo, sino de empaquetado: este repositorio ofrece los tres componentes ya convertidos a ONNX, con la division de cache KV del decoder y la DFT por matmul en LaMa, y con hashes publicados para verificacion. No se publican metricas comparativas frente a otras alternativas de OCR de manga, por lo que no es posible establecer una comparacion cuantitativa de precision.

## Limitaciones y advertencias

- Licencia mixta: `comictextdetector.pt.onnx` es GPL-3.0, lo que impone obligaciones de copyleft sobre el conjunto distribuido; el resto de ficheros son Apache-2.0. Para uso comercial es imprescindible revisar `LICENSE.md` y el alcance de la GPL-3.0 sobre el detector.
- El repositorio no es obra original: es un espejo de pesos de terceros. Cualquier problema de sesgo, calidad o legalidad de los datos de entrenamiento remite a los proyectos de origen, que no documentan sus datasets aqui.
- Riesgo de error en el OCR: no se publican tasas de acierto por caracter ni por pagina fuera de la suite de paridad de 94 paginas, por lo que la precision en dominios distintos (tipografias, idiomas o resoluciones no cubiertas) es desconocida.
- Idiomas soportados: no disponibles en la informacion proporcionada; el proyecto de origen manga-ocr esta orientado a texto de manga, pero no se declara un listado oficial en esta model card.
- El inpintado puede generar artefactos en zonas con tramas, degradados o lineas finas; la validacion reportada solo garantiza que la salida queda dentro de un umbral de pixel R4 respecto al pipeline PyTorch, no que el resultado sea visualmente correcto en todos los casos.
- Los ficheros son inmutables y estan fijados por sha256: cualquier correccion exige una nueva exportacion con nuevo nombre, por lo que no cabe esperar actualizaciones in-place.
- El repositorio registra 0 descargas y 0 likes, sin senales de adopcion ni mantenimiento por parte de terceros; conviene verificar los hashes antes de desplegarlo.
- No hay cuantizaciones publicadas (todo fp32) ni pesos GGUF, de modo que no se puede reducir el consumo usando formatos de 4 u 8 bits sin generar la conversion por cuenta propia.
- Al no ser un modelo de lenguaje, no ofrece tool calling, agentes ni capacidad de razonamiento multi-paso; cualquier funcionalidad de ese tipo debe aportarla un modelo externo en el pipeline.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/vitalf3/manga-translator-models
- Motor manga-translator (Rust): https://github.com/vitorandreazza/manga-translator
- manga-ocr-base (kha-white): https://huggingface.co/kha-white/manga-ocr-base
- comic-text-detector (dmMaze): https://github.com/dmMaze/comic-text-detector
- manga-image-translator (zyddnys, release `beta-0.3`): https://github.com/zyddnys/manga-image-translator
- LaMa (advimman): https://github.com/advimman/lama
- Licencia del repositorio: LICENSE.md en el propio repositorio de HuggingFace
