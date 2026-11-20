# wedvoice-su/mr-models

## Resumen

`wedvoice-su/mr-models` es un repositorio que distribuye un unico archivo de modelo ONNX para separacion de fuentes de audio, concretamente para eliminar la voz (letra cantada) de una cancion y conservar la pista instrumental o MR (Music Record, en la terminologia del karaoke coreano). El modelo subyacente es `UVR_MDXNET_3_9662.onnx`, un modelo MDX-Net del proyecto Ultimate Vocal Remover (UVR), copiado sin modificaciones desde el repositorio `Politrees/UVR_resources` (commit `929e057b81aa49bc2e6490bef8671f47b2c120f6`).

El interes de este repositorio no reside en una innovacion arquitectonica propia, sino en su formato de distribucion: un unico archivo ONNX de 29,7 MB pensado para ejecutarse integramente en el navegador del usuario, sin enviar el audio a ningun servidor. Esto lo hace adecuado para aplicaciones web de karaoke, edicion de audio o generacion de pistas instrumentales que requieran privacidad y funcionamiento offline una vez descargado el modelo.

No se dispone de informacion sobre el autor mas alla del identificador `wedvoice-su`, ni de pipeline declarado, idiomas o datos de entrenamiento. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,0 GB (consistente con un unico archivo de ~30 MB).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MDX-Net (red neuronal para separacion de fuentes de audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX, presumiblemente FP32 o FP16; no confirmado) |
| Idiomas soportados | no disponible (independiente del idioma de la voz) |
| Licencia | MIT |
| Formato de pesos | ONNX (`UVR_MDXNET_3_9662.onnx`, 29,7 MB) |

## Arquitectura y entrenamiento

MDX-Net es una familia de redes neuronales empleada por el proyecto Ultimate Vocal Remover para separacion de fuentes musicales. El archivo distribuido aqui, `UVR_MDXNET_3_9662.onnx`, es la exportacion ONNX de uno de los modelos MDX-Net de UVR, orientado a la extraccion de la pista instrumental (eliminacion de voz). No se dispone de informacion sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens o muestras procesadas, ni sobre si se aplicaron tecnicas de ajuste fino o aumento de datos.

La innovacion relevante en este repositorio es la portabilidad: al estar exportado a ONNX, el modelo puede ejecutarse con runtimes como ONNX Runtime Web o onnxruntime-node, lo que permite inferencia local en el navegador o en el dispositivo del usuario. No se documentan innovaciones arquitectonicas adicionales ni detalles del proceso de entrenamiento en la model card.

## Capacidades

- Separacion de fuentes de audio: elimina la voz cantada de una mezcla musical y conserva la pista instrumental (MR).
- Inferencia local en el navegador: el archivo ONNX esta pensado para ejecutarse en el dispositivo del usuario mediante un runtime ONNX, sin enviar audio a servidores externos.
- Procesamiento independiente del idioma: al operar sobre caracteristicas acusticas, no depende del idioma de la letra.
- Generacion de pistas de karaoke o acompañamiento instrumental a partir de una cancion.
- Integracion en aplicaciones web de edicion de audio y produccion musical.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision ni tool calling.

## Casos de uso

- Aplicaciones web de karaoke: el modelo se carga en el navegador y procesa la cancion del usuario localmente para generar la pista instrumental, sin subir el audio a ningun servidor y preservando la privacidad.
- Edicion de audio en el navegador: herramientas tipo DAW ligera que permiten separar la voz de una mezcla para remezclar, samplear o practicar sobre la base instrumental.
- Creacion de versiones instrumentales para ensayos: musicos que necesitan una base sin voz para practicar o tocar en directo, generandola en su propio dispositivo.
- Produccion de contenido para redes y video: creadores que necesitan una version instrumental de una cancion para fondos musicales o montajes, con procesamiento offline.
- Investigacion y docencia en separacion de fuentes: el archivo ONNX sirve como referencia reproducible para comparar tecnicas de separacion en entornos con recursos limitados.
- Prototipado rapido de pipelines de audio: al ser un unico archivo ONNX de 29,7 MB, se integra facilmente en demos y pruebas de concepto con ONNX Runtime Web.
- Aplicaciones de accesibilidad auditiva: generacion de pistas instrumentales para personas que prefieren escuchar la musica sin la voz, en un entorno local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (SDR, SIR, SAR) ni comparaciones con otros modelos de separacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; un modelo ONNX de 29,7 MB es compatible con ejecucion en CPU y en GPU de gama baja.
- GPU recomendadas: no disponible; por tamano, cabe en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) y en GPUs de centros de datos (A100, H100) sin problema.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer con soporte de ONNX Runtime; tambien en CPU.
- Opciones de despliegue: ONNX Runtime (Web, Node.js, Python), con posibles backends de aceleracion (CUDA, DirectML, CoreML, WebGPU) segun el runtime. No se documenta compatibilidad con vLLM, llama.cpp ni Ollama, que no aplican a modelos de audio.
- Latencia y throughput estimados: no disponibles. Dependeran del hardware, del runtime y de la duracion del audio de entrada.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `wedvoice-su/mr-models` (UVR_MDXNET_3_9662) | MDX-Net | 29,7 MB | MIT | ONNX | Copia sin modificar de UVR; orientado a navegador |
| Demucs (Meta) | Hibrido waveform/spectrograma | cientos de MB | MIT | PyTorch | Separacion multi-stem (voz, bateria, bajo, otros); no ONNX nativo |
| Spleeter (Deezer) | U-Net sobre espectrogramas | decenas de MB | MIT | TensorFlow | Separacion 2/4/5 stems; ampliamente usado, menos preciso que Demucs |
| UVR5 (varios MDX-Net y VR) | MDX-Net / VR | variable | MIT (segun repositorio) | ONNX / PyTorch | Suite completa de modelos UVR; este repositorio incluye solo uno |

## Limitaciones y advertencias

- El repositorio no aporta un modelo original: es una copia sin modificaciones de `Politrees/UVR_resources`; cualquier problema del modelo subyacente se hereda.
- No se documentan parametros, datos de entrenamiento ni metricas de calidad; no es posible evaluar su rendimiento frente a alternativas sin pruebas propias.
- La separacion de fuentes es imperfecta por naturaleza: pueden aparecer artefactos, filtraciones de voz en la pista instrumental o perdida de instrumentos en pasajes complejos.
- El modelo esta orientado a eliminar voz cantada; su comportamiento con voz hablada, coros densos o mezclas muy reverberadas no esta documentado.
- No se especifican sesgos, pero al ser un modelo acustico puede tener peor rendimiento en generos musicales poco representados en su entrenamiento (no confirmado).
- Licencia MIT: permite uso comercial y modificacion, siempre que se conserve el aviso de copyright; conviene verificar la licencia del repositorio de origen y del proyecto UVR.
- Al ejecutarse en el navegador, el rendimiento dependera del dispositivo del usuario; no se garantiza latencia baja en equipos modestos.
- No se declaran idiomas ni pipeline; la ausencia de metadatos dificulta su integracion automatizada en plataformas que dependen de esos campos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wedvoice-su/mr-models
- Repositorio de origen: https://huggingface.co/Politrees/UVR_resources
- Proyecto Ultimate Vocal Remover: https://github.com/Anjok07/ultimatevocalremovergui
- ONNX Runtime: https://onnxruntime.ai/
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
