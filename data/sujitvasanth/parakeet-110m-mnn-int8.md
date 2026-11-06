# sujitvasanth/Parakeet-110M-MNN-INT8

## Resumen

Parakeet-110M-MNN-INT8 es una conversión experimental al formato MNN del modelo de reconocimiento de voz NVIDIA Parakeet TDT/CTC 110M, publicada por el usuario sujitvasanth. No se trata de un modelo entrenado desde cero ni de un fine-tuning, sino de un artefacto de despliegue: los pesos originales en FP16 (derivados de NVIDIA vía AbijahKaj/parakeet-tdt-110m-web) se han recompuesto como grafos PyTorch, exportado a ONNX como formato intermedio y convertido con MNN Converter 3.6.1 aplicando cuantización de pesos a 8 bits en los tensores soportados. El objetivo es facilitar la inferencia en entornos ligeros (CPU, CUDA de baja memoria) sin depender del stack NeMo.

El modelo base es un sistema híbrido TDT/CTC de NVIDIA con 110 millones de parámetros, pensado para transcripción de inglés a partir de audio de 16 kHz mono. La conversión mantiene tres componentes separados en MNN: encoder, decoder recurrente (un paso LSTM expandido) y joiner TDT. El encoder acepta exactamente 400 frames mel (unos 4 segundos), lo que limita el uso a prototipos de longitud fija y descarta streaming o entrada variable.

Su relevancia es acotada pero clara para quien trabaje en despliegue embebido o en el ecosistema MNN: demuestra que un modelo ASR de NVIDIA puede ejecutarse fuera de NeMo con un footprint de repositorio de 0,1 GB y un consumo de memoria de sesión del encoder medido en 116,5 MiB. El propio autor lo etiqueta como experimental y advierte de que no es un bundle sherpa-mnn listo para usar ni una integración Android terminada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida TDT/CTC (encoder + decoder LSTM + joiner TDT), convertida a grafos MNN |
| Parametros totales | 110M (modelo base NVIDIA Parakeet TDT/CTC 110M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; entrada fija de 400 frames mel (~4 s de audio) |
| Tipos de cuantizacion | INT8 en pesos soportados (MNN `--weightQuantBits 8`); embeddings y otras operaciones pueden permanecer en punto flotante |
| Idiomas soportados | en (inglés) |
| Licencia | cc-by-4.0 |
| Formato de pesos | MNN (`encoder-int8.mnn`, `decoder-int8.mnn`, `joiner-int8.mnn`); origen en safetensors FP16 |
| Tamano del repositorio | 0,1 GB (117.547.604 bytes, 112,1 MiB en total) |
| Entrada de audio | 16 kHz mono, log-mel de 80 bandas, ventana Hann de 25 ms, hop de 10 ms, FFT 512, pre-énfasis y normalización por feature |
| Salida | Logits del joiner `[1,1030]`: 0–1024 tokens (blank 1024), 1025–1029 duraciones `[0,1,2,3,4]` |

## Arquitectura y entrenamiento

El modelo subyacente es el Parakeet TDT/CTC 110M de NVIDIA, un sistema ASR que combina un encoder con dos cabezas de decodificación: una CTC y una TDT (Token-and-Duration Transducer). La conversión a MNN separa el grafo en tres artefactos: un encoder que transforma mel `[1,80,400]` en representaciones `[1,50,512]`, un decoder que implementa un paso LSTM explícitamente expandido (token int32 `[1]` más hidden/cell `[1,640]` como entrada, nuevos hidden/cell `[1,640]` como salida) y un joiner que combina encoder `[1,512]` y decoder `[1,640]` para producir logits `[1,1030]`. La cabeza CTC del checkpoint original no se incluye como fichero MNN en este repositorio.

No hay entrenamiento ni fine-tuning en este artefacto: el autor indica explícitamente que solo realiza conversión de formato y compresión de pesos soportados. Los grafos se reconstruyeron con PyTorch y se verificaron contra la configuración arquitectónica de NVIDIA; ONNX actúa únicamente como formato intermedio. La reproducibilidad depende de la versión del conversor (MNN 3.6.1), de las opciones de optimización elegidas y de posibles cambios en el código fuente del runtime. El decoder debe inicializarse con hidden/cell a cero y token blank 1024, y la decodificación debe ser TDT, no un bucle RNNT de Zipformer.

## Capacidades

- Transcripción de voz a texto en inglés a partir de audio de 16 kHz mono.
- Decodificación TDT con predicción conjunta de token y duración (duraciones 0–4).
- Ejecución en CPU (validada en Windows) y en CUDA (validada parcialmente en RTX 3060 con CUDA 12.4).
- Inferencia de baja memoria: modo `Memory_Low` con `MNN_LOW_MEMORY=ON` reduce el delta de memoria libre del dispositivo a 128 MiB frente a 428 MiB en modo normal.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No soporta visión, audio de entrada distinto de mel de 80 bandas ni otras modalidades.
- No implementa entrada de longitud variable, masking ni streaming.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Prototipado de ASR en dispositivos con recursos limitados: el encoder ocupa 110 MB en disco y una sesión MNN medida de 116,5 MiB, lo que permite probar transcripción en equipos sin GPU dedicada o con GPU de gama media.
- Validación de pipelines MNN frente a NeMo: sirve para comparar la salida del stack MNN con una referencia independiente (por ejemplo, sherpa-onnx) sobre clips cortos y verificar la corrección de la conversión.
- Investigación en cuantización de modelos ASR: al ser una conversión INT8 de pesos selectivos, permite estudiar el impacto de la compresión en la calidad de transcripción frente al modelo FP16 original.
- Integración experimental en aplicaciones de escritorio Windows: el autor validó los tres grafos en CPU de Windows, por lo que puede usarse como base para un prototipo de dictado o transcripción de clips de hasta ~4 segundos.
- Evaluación de despliegue en CUDA de baja memoria: con el parche `cuda-low-memory-fix.patch` aplicado y recompilado, el encoder INT8 puede ejecutarse en GPUs con poca VRAM (probado en RTX 3060).
- Base para futuras integraciones móviles: aunque Android, Mali y Adreno/OpenCL no están probados, el formato MNN y el tamaño reducido lo convierten en un punto de partida para quien quiera explorar ASR en dispositivos móviles, asumiendo el trabajo pendiente de frontend de audio y decodificación completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una validación cualitativa sobre una muestra de 3,99 segundos: la transcripción TDT en MNN (float e INT8) coincidió con una referencia independiente de Parakeet, produciendo la frase «Well, I don't wish to see it any more, observed Phoebe, turning away her». No se aportan cifras de WER, latencia ni throughput, y el propio autor advierte de que una sola muestra no constituye una evaluación de WER ni evidencia de precisión general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el delta de memoria libre del dispositivo medido en CUDA con modo de baja memoria fue de 128 MiB, frente a 428 MiB en modo normal.
- Memoria de sesión del encoder en MNN: 116,512 MiB medidos.
- GPU recomendadas: RTX 3060 (única probada, con CUDA 12.4); no hay datos para A100, H100 u otras GPU.
- Cabe en GPU de consumo: sí, al menos en RTX 3060 con el parche de baja memoria aplicado; no se han probado otras consumer GPU.
- Opciones de despliegue: runtime MNN con backend CPU o CUDA (`MNN_FORWARD_CUDA`, `Precision_High`, `Memory_Low`, `MNN_LOW_MEMORY=ON`); requiere aplicar `cuda-low-memory-fix.patch` y recompilar MNN para el modo CUDA probado.
- Latencia y throughput: no disponibles; el autor no reclama ningún benchmark de velocidad.
- Android, Mali y Adreno/OpenCL: no probados; el parche de CUDA no aplica a OpenCL.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| sujitvasanth/Parakeet-110M-MNN-INT8 | 110M | 400 frames mel (~4 s), longitud fija | MNN INT8 | cc-by-4.0 | Experimental, validación de una muestra |
| nvidia/parakeet-tdt_ctc-110m | 110M | Configuración NVIDIA original (entrada variable, según checkpoint) | NeMo / safetensors | cc-by-4.0 | Modelo oficial de referencia |
| AbijahKaj/parakeet-tdt-110m-web | 110M | Derivado FP16 del anterior | safetensors FP16 | no disponible en la información | Fuente de pesos de esta conversión |
| csukuangfj/sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000 | 110M | Modelo CTC para sherpa-onnx | ONNX | no disponible en la información | Referencia independiente usada para validación |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe como prototipo de longitud fija, no como bundle sherpa-mnn listo para usar ni integración Android terminada.
- Entrada rígida: el encoder acepta exactamente 400 frames mel (~4 segundos); no hay soporte de longitud variable, masking ni streaming, y rellenar grabaciones más cortas o procesar fragmentos no preserva el comportamiento de contexto completo.
- INT8 parcial: la cuantización afecta solo a pesos soportados; no garantiza aritmética INT8 ni cuantización de todos los pesos, y embeddings y otras operaciones pueden seguir en punto flotante.
- Frontend de audio no incluido: los scripts de conversión no incorporan el frontend de audio en el encoder MNN; hay que implementar la extracción de features (80 bandas log-mel, 25 ms Hann, 10 ms hop, FFT 512, pre-énfasis y normalización) por separado.
- Cabeza CTC ausente: el checkpoint original incluye una cabeza CTC, pero no se distribuye como fichero MNN en este repositorio.
- Validación insuficiente: la comprobación se limita a una muestra de 3,99 segundos; no hay evaluación de WER ni evidencia de precisión general.
- CUDA incompleto: el bucle completo de transcripción TDT en CUDA no se probó; solo se ejecutaron los tres componentes y se obtuvo la frase de referencia mediante una cabeza CTC evaluada por separado.
- Requiere parche: sin aplicar `cuda-low-memory-fix.patch` y recompilar MNN, la configuración CUDA probada no es fiable debido a un bug en el recuento de filas de convoluciones pointwise.
- Plataformas no verificadas: Android, Mali y Adreno/OpenCL permanecen sin probar.
- Idiomas: solo inglés.
- Sesgos y alucinaciones: no se documentan sesgos específicos en la información disponible; al ser un modelo ASR, los errores se manifiestan como transcripciones incorrectas más que como alucinaciones generativas, pero no hay datos cuantitativos al respecto.
- Licencia CC-BY-4.0: permite uso comercial con atribución, pero se heredan las condiciones del modelo base de NVIDIA; conviene revisar los términos del checkpoint original antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sujitvasanth/Parakeet-110M-MNN-INT8
- Modelo base NVIDIA: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Pesos fuente FP16 (AbijahKaj): https://huggingface.co/AbijahKaj/parakeet-tdt-110m-web
- Referencia independiente sherpa-onnx: https://huggingface.co/csukuangfj/sherpa-onnx-nemo-parakeet_tdt_ctc_110m-en-36000
