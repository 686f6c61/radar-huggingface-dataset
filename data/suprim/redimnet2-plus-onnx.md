# suprim/redimnet2-plus-onnx

## Resumen

ReDimNet2+ ONNX (FP32) es la conversión a ONNX del checkpoint público **ReDimNet2+ LMFT** para verificación de locutor, desarrollado por LAB260 y reexportado por el usuario `suprim`. No es un modelo de lenguaje: es un extractor de embeddings de locutor que recibe una forma de onda mono a 16 kHz y devuelve un vector de 192 dimensiones por segmento de audio. Su utilidad es eminentemente práctica: permite ejecutar verificación e identificación de hablante en entornos donde no se quiere desplegar PyTorch, únicamente con ONNX Runtime.

El artefacto es un único grafo FP32 de 50.994.943 bytes (unos 51 MB), equivalente a aproximadamente 12,7 millones de pesos en coma flotante de 32 bits. Esa huella tan contenida lo hace apto para CPU, dispositivos edge y despliegues de bajo coste, algo relevante para pipelines de autenticación por voz, diarización o etiquetado de audio a gran escala.

La relevancia del repositorio está en la trazabilidad más que en la novedad arquitectónica: se documenta el commit exacto del checkpoint upstream, el commit del código de exportación, el SHA-256 del fichero y una validación de equivalencia PyTorch ↔ ONNX con coseno mínimo de 0,99999982 y cero cambios de decisión sobre un conjunto de evaluación congelado. Con 0 descargas y 0 likes en el momento de la consulta, es un artefacto reciente y sin validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReDimNet2+ con cabecera LMFT; extractor de embeddings de locutor basado en bloques residuales convolucionales (el detalle de capas no se documenta en la model card) |
| Parametros totales | no disponible de forma oficial; el artefacto FP32 ocupa 50.994.943 bytes, lo que equivale a ~12,7 M de pesos float32 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; la entrada es audio de duracion variable `[B, T]`, la ventana efectiva la define la aplicacion consumidora |
| Tipos de cuantizacion | solo FP32 en este repositorio; no se publican variantes FP16, INT8 ni QDQ |
| Idiomas soportados | no disponible; la tarea es independiente del idioma en la practica (verificacion de locutor, no reconocimiento de voz) |
| Licencia | Apache-2.0 (checkpoint upstream Apache-2.0; codigo de entrenamiento/inferencia upstream MIT) |
| Formato de pesos | ONNX (un unico grafo `speaker/redimnet2_plus_fp32.onnx`) |
| Entrada | `waveform` `[B, T]` float32, 16 kHz, mono |
| Salida | `embeddings` `[B, 192]` float32, sin normalizacion L2 |
| Tamano del artefacto | 50.994.943 bytes (~0,1 GB de repo) |
| SHA-256 | `567e20568262b39b1d78fb34d0b783759ce33a8033fb6fdc0436a6bd315e17ec` |
| Runtime validado | ONNX Runtime CPU; grafo comprobado con `onnx.checker` |

## Arquitectura y entrenamiento

La model card identifica el modelo como **ReDimNet2+ LMFT**, un extractor de embeddings de locutor de la familia ReDimNet con una cabecera LMFT (large-margin fine-tuning), exportado a ONNX en FP32. La arquitectura interna (numero de etapas, canales por bloque, tipo de pooling) no se detalla en la informacion disponible; lo que si se especifica es el contrato de entrada/salida: forma de onda mono a 16 kHz y vector de 192 dimensiones sin normalizar. No se publican datos sobre el volumen de entrenamiento, la composicion del dataset, el uso de aumento de datos ni la funcion de perdida mas alla de la referencia a LMFT.

El punto tecnicamente diferencial del repositorio es el proceso de exportacion y su verificacion. Se parte del checkpoint `lab260/redimnet2-plus` en el commit `fd45d1968c0ea91b62ad0d2469eee4607756bb07` y del codigo de exportacion `ReDimNet2plus-onnx` en el commit `eea084c`. La equivalencia se valida con un informe (`speaker/redimnet2_plus_fp32.report.json`) que reporta un coseno minimo de 0,99999982 entre embeddings PyTorch y ONNX, y cero cambios de decision sobre un conjunto de evaluacion congelado. Deliberadamente, el autor deja fuera del grafo el frontend de audio (normalizacion de picos), la normalizacion L2 del embedding y el umbral de decision: son responsabilidad de la aplicacion que consume el modelo.

## Capacidades

- Extraccion de embeddings de locutor: dado un segmento de audio de 16 kHz, produce un vector float32 de 192 dimensiones por elemento del batch.
- Verificacion de locutor 1:1: comparacion de dos embeddings mediante similitud coseno tras normalizacion L2, con umbral definido por la aplicacion.
- Identificacion de locutor 1:N: indexacion de embeddings en una base vectorial y busqueda del locutor mas proximo.
- Procesamiento por lotes: la firma `[B, T]` admite batch, lo que permite vectorizar segmentos con padding o duraciones homogeneas.
- Ejecucion sin PyTorch: el grafo se ejecuta en ONNX Runtime CPU, validado por el autor, y es portable a otros proveedores de ejecucion ONNX.
- Independencia de idioma: al ser un modelo de timbre vocal y no de contenido linguistico, no requiere un idioma concreto.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generation ni modo "thinking": no es un modelo generativo.

## Casos de uso

- Autenticacion por voz en 1:1: en un proceso de alta de usuario se enrola un embedding de referencia y, en cada acceso, se compara el embedding de la locucion entrante con similitud coseno; el modelo es adecuado porque su salida es un vector compacto de 192 dimensiones facil de almacenar y comparar.
- Identificacion de locutor en 1:N: se indexan los embeddings de una plantilla de usuarios en una base vectorial (FAISS, Qdrant, pgvector) y se resuelve la busqueda por vecino mas cercano; el coste por consulta es minimo gracias al tamano reducido del vector.
- Diarizacion "quien habla cuando": tras segmentar el audio (VAD) se extrae un embedding por segmento y se agrupan con clustering (por ejemplo, spectral clustering); el modelo encaja porque procesa segmentos cortos de forma independiente y barata.
- Antifraude en call centers: comparacion del locutor de la llamada con la voz enrolada del titular para marcar discrepancias; conviene combinarlo con un modelo antisuplantacion, ya que este artefacto no detecta replay ni voz sintetica.
- Etiquetado de corpus de audio a escala: generacion de embeddings para miles de horas en CPU sin GPU dedicada, enriqueciendo datasets de ASR o de habla con metadatos de locutor.
- Despliegue en edge o en navegador: con ~51 MB en FP32 y soporte de ONNX Runtime, puede ejecutarse en un mini-PC, un dispositivo IoT o mediante ONNX Runtime Web, manteniendo el audio en el dispositivo.
- Control de acceso fisico: verificacion local en un kiosco o torno con microfono, sin enviar audio a la nube, reduciendo exposicion de datos biometricos.
- Regresion en CI/CD de pipelines de voz: el SHA-256 y el informe de equivalencia permiten fijar el artefacto y detectar cambios silenciosos en los embeddings generados entre versiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de EER, minDCF, accuracy de identificacion ni resultados sobre VoxCeleb u otros conjuntos estandar.

El unico dato cuantitativo publicado es de fidelidad de conversion, no de calidad del modelo:

| Metrica de conversion | Valor |
|---|---|
| Coseno minimo PyTorch vs ONNX | 0,99999982 |
| Cambios de decision en el conjunto de evaluacion congelado | 0 |
| Comprobacion del grafo | `onnx.checker` sin errores |
| Runtime de validacion | ONNX Runtime CPU |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para los pesos (51 MB en FP32); el consumo real depende de la duracion del audio y del tamano de batch, ya que las activaciones crecen con `T`.
- CPU: suficiente. El autor valida explicitamente la inferencia en ONNX Runtime CPU, por lo que no se requiere acelerador.
- GPU recomendadas: opcionales; cualquier GPU con soporte CUDA, TensorRT, OpenVINO o DirectML puede ejecutar el grafo. Para lotes grandes, una RTX 3060/4060 o superior es mas que suficiente; A100/H100 solo tendrian sentido en pipelines masivos junto a otros componentes.
- Cabe en GPU consumer: si, con margen amplio, en cualquier GPU con 2 GB o mas de memoria.
- Opciones de despliegue: `onnxruntime` (Python/C++/C#/Java) con proveedores CPU, CUDA, TensorRT, OpenVINO o DirectML; ONNX Runtime Web para navegador; ONNX Runtime Mobile para Android/iOS. No hay soporte de llama.cpp, Ollama, vLLM ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de orden de magnitud, un segmento de 3 s a 16 kHz supone 48.000 muestras de entrada; la latencia real debe medirse en el hardware objetivo.
- Almacenamiento: 51 MB por copia del artefacto, mas la base de embeddings (192 floats por locutor, ~768 bytes en FP32).

## Comparativa con modelos similares

| Modelo | Tipo | Dim. embedding | Entrada | Licencia | Notas |
|---|---|---|---|---|---|
| ReDimNet2+ ONNX (este) | CNN con cabecera LMFT | 192 | Audio 16 kHz, `[B, T]` | Apache-2.0 | Solo artefacto ONNX FP32; sin benchmarks publicados; equivalencia PyTorch/ONNX verificada |
| ECAPA-TDNN (SpeechBrain) | TDNN con atencion | 192 | Audio 16 kHz | Apache-2.0 | Referencia muy extendida, con recetas de entrenamiento y resultados publicados en VoxCeleb |
| WeSpeaker ResNet (variantes) | ResNet | 192 / 256 | Audio 16 kHz | Apache-2.0 | Ecosistema con herramientas de entrenamiento, scoring y diarizacion |
| TitaNet (NVIDIA NeMo) | 1D convolucional con atencion | 192 / 256 | Audio 16 kHz | CC-BY-4.0 | Integrado en NeMo, con pipeline completo de diarizacion |

La comparacion cuantitativa de precision (EER) no es posible con la informacion disponible: este repositorio no publica ninguna metrica de calidad. La ventaja diferencial frente a las alternativas es la ligereza del artefacto y la ausencia de dependencia de PyTorch; la desventaja es la falta de evaluacion publica y de soporte de la comunidad.

## Limitaciones y advertencias

- Ambito acotado: el autor indica explicitamente que no es un sistema de vigilancia ni un clasificador de emociones; usarlo para esos fines queda fuera de su proposito declarado.
- Embeddings sin normalizar: la salida no lleva normalizacion L2. Si la aplicacion olvida normalizar, la similitud coseno y cualquier umbral derivado dejan de ser validos.
- Frontend fuera del modelo: la normalizacion de picos, el recorte de silencios y el filtrado previo corren a cargo del consumidor. Diferencias en ese preprocesado degradan la comparabilidad de embeddings entre pipelines.
- Umbral no incluido: el modelo no devuelve una decision, solo un vector. Calibrar el umbral (EER, FAR/FRR) es responsabilidad de quien despliega, y no hay recomendaciones publicadas.
- Sin metricas de calidad: no hay EER, minDCF ni pruebas sobre VoxCeleb ni sobre dominios telefonicos, ruidosos o multilingues. La validacion publicada solo cubre la fidelidad de la conversion.
- Sin evaluacion de sesgos: no se documenta el comportamiento por genero, edad, acento, lengua o calidad de microfono. Es un riesgo directo en autenticacion, donde las tasas de falso rechazo pueden ser desiguales entre grupos.
- Vulnerable a suplantacion: no incorpora deteccion de replay, voz sintetica ni deepfakes. En un caso de uso antifraude debe combinarse con un sistema antisuplantacion (CM/ASVspoof).
- Versionado critico: el autor advierte de que un cambio de pesos invalida los embeddings previamente calculados. Cualquier actualizacion exige re-enrolar o recalcular la base de embeddings.
- Trazabilidad obligatoria: conviene descargar el fichero en un commit fijado y verificar el SHA-256 antes de usarlo, tal como recomienda la model card.
- Licencia: Apache-2.0 permite uso comercial, pero exige conservar `LICENSE` y `NOTICE`; el codigo upstream es MIT y tiene sus propias condiciones de atribucion.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin incidencias ni validaciones de terceros reportadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/suprim/redimnet2-plus-onnx
- Checkpoint upstream: https://huggingface.co/lab260/redimnet2-plus (commit `fd45d1968c0ea91b62ad0d2469eee4607756bb07`)
- Codigo de exportacion `ReDimNet2plus-onnx`, commit `eea084c`: URL no disponible en la informacion proporcionada
- Informe de validacion `speaker/redimnet2_plus_fp32.report.json`: incluido en el repositorio
- Fichero del modelo `speaker/redimnet2_plus_fp32.onnx`: https://huggingface.co/suprim/redimnet2-plus-onnx/resolve/main/speaker/redimnet2_plus_fp32.onnx (se recomienda fijar commit y verificar SHA-256)
- Paper, blog o demo del modelo: no disponibles en la informacion proporcionada
