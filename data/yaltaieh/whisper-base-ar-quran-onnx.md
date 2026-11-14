# yaltaieh/whisper-base-ar-quran-onnx

## Resumen

`yaltaieh/whisper-base-ar-quran-onnx` es una exportación a formato ONNX del modelo `tarteel-ai/whisper-base-ar-quran`, un Whisper-base ajustado por Tarteel AI para el reconocimiento de recitación coránica en árabe. Esta versión está preparada específicamente para ejecutarse con Transformers.js tanto en navegador como en Node.js, e incorpora una modificación clave: el decodificador se exporta con las salidas de atención cruzada (`cross_attentions.0 … 5`) necesarias para generar marcas de tiempo a nivel de palabra mediante `return_timestamps: "word"`.

El modelo resuelve el problema de transcribir recitación coránica en el cliente, sin necesidad de servidor, con variantes cuantizadas que van desde los 65 MB (q4, para WebGPU) hasta los 290,7 MB (fp32). Es relevante porque permite integrar ASR especializado en árabe coránico directamente en aplicaciones web, con latencias compatibles con tiempo real (factor de tiempo real de 0,14 en Chrome con q8 sobre WASM de 4 hilos).

La arquitectura subyacente es un transformer encoder-decoder tipo Whisper en su variante base, con aproximadamente 74 millones de parámetros (heredados del checkpoint original de OpenAI Whisper-base). El repositorio solo contiene la conversión de formato y la cuantización de los pesos; el entrenamiento y ajuste fino son obra de Tarteel AI bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper-base) exportado a ONNX |
| Parametros totales | no disponible (hereda el tamaño de Whisper-base, ~74 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Ventana de audio de 30 s por chunk (con `chunk_length_s: 30`, `stride_length_s: 5`) |
| Tipos de cuantizacion | fp32, q8 (int8 dinámica per-channel), q4 (4-bit weight-only, MatMulNBits + GatherBlockQuantized), q4w (encoder q4 + decoder bnb4 con embedding int8 per-row) |
| Idiomas soportados | Árabe (ar) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`encoder_model.onnx`, `decoder_model_merged.onnx` y variantes cuantizadas) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de `tarteel-ai/whisper-base-ar-quran`, que a su vez es un ajuste fino de `openai/whisper-base` realizado por Tarteel AI sobre recitación coránica. La arquitectura es la de Whisper: un encoder que procesa espectrogramas de audio de 30 segundos y un decoder autorregresivo que genera tokens de texto, con atención cruzada entre ambos. La exportación combina el decoder en un único archivo `decoder_model_merged.onnx` (sin separar `decoder_model` y `decoder_with_past_model`) y añade las salidas de atención cruzada necesarias para la alineación temporal a nivel de palabra.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO en el ajuste fino original de Tarteel AI. La innovación técnica principal de esta exportación es la inclusión de `alignment_heads` en `generation_config.json` (tomado de `openai/whisper-base`), que el checkpoint ajustado no incluía, y la generación de marcas de tiempo por palabra mediante alineación con atención cruzada. Las variantes cuantizadas q4 y q4w emplean MatMulNBits con block size 32 simétrico; q4w sustituye el embedding cuantizado por int8 per-row para garantizar compatibilidad con WASM.

## Capacidades

- Reconocimiento automático de voz (ASR) especializado en recitación coránica en árabe.
- Generación de marcas de tiempo a nivel de palabra mediante `return_timestamps: "word"`, con precisión aproximada de alrededor de un segundo.
- Procesamiento por chunks de 30 segundos con solapamiento configurable (`stride_length_s: 5`).
- Ejecución en navegador mediante Transformers.js, tanto en WebGPU (Chrome/Edge) como en WASM (Safari, Firefox y otros).
- Ejecución en Node.js.
- Soporte de cuantización seleccionable por componente (`encoder_model` y `decoder_model_merged` pueden usar dtypes distintos).
- No dispone de tool calling, function calling, capacidades de agente, visión, audio de entrada más allá del propio ASR, ni modo de razonamiento extendido.

## Casos de uso

- Aplicaciones web de recitación coránica con seguimiento en tiempo real: el modelo transcribe la recitación del usuario y devuelve timestamps por palabra, lo que permite resaltar el texto recitado a medida que se pronuncia. La variante q8 sobre WASM alcanza un factor de tiempo real de 0,14 en Chrome con 4 hilos, suficiente para actualizaciones progresivas.
- Herramientas de memorización (hifz) con detección de errores: al comparar la transcripción palabra a palabra con el texto de referencia, la aplicación puede señalar omisiones o sustituciones en la recitación. La alineación por atención cruzada facilita este emparejamiento.
- Subtitulado automático de grabaciones de recitación: procesando el audio por segmentos separados en silencios, se obtienen transcripciones con marcas temporales utilizables en vídeo o audio bajo demanda.
- Aplicaciones offline o de bajo consumo en el cliente: la variante q4 (65 MB) permite empaquetar el modelo en una PWA o extensión sin depender de un servidor de inferencia, reduciendo costes de infraestructura y mejorando la privacidad.
- Investigación en ASR de árabe coránico: sirve como línea base reproducible en ONNX para comparar técnicas de cuantización o de alineación temporal sin necesidad de GPU dedicada.
- Integración en plataformas educativas islámicas: permite añadir transcripción y evaluación de recitación a plataformas existentes mediante Transformers.js, con despliegue en CDN y sin backend de ML.
- Procesamiento por lotes en Node.js: para archivos de audio pregrabados, el modelo puede ejecutarse en servidores sin GPU usando la variante q8 sobre WASM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas cualitativas de fidelidad de transcripción y de rendimiento en tiempo real:

| Prueba | Variante | Resultado reportado |
|---|---|---|
| Clip Al-Fatiha | q4 | Transcripción idéntica a la referencia fp32 |
| Clip Al-Fatiha | q8 | Omite una palabra repetida (`صِرَاطَ`) |
| Recitación de 9 minutos | q8 | Coincidencia del 100 % de palabras con fp32 |
| Recitación de 9 minutos | q4w | Coincidencia del 99,4 % de palabras con fp32 |
| Chrome, 82.mp3, 4 hilos | q8 | Factor de tiempo real 0,14 |
| Chrome, 82.mp3, 4 hilos | q4w | Factor de tiempo real 0,23 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; por el tamaño de los archivos, fp32 ocupa 290,7 MB en disco y las variantes cuantizadas entre 65 y 79,3 MB.
- GPU recomendadas: no se especifican modelos concretos; la model card menciona WebGPU en Chrome y Edge como ruta acelerada.
- Compatibilidad con GPU de consumo: el modelo es lo bastante pequeño para ejecutarse en cualquier GPU moderna con WebGPU; no se detallan modelos concretos (RTX 4090, etc.).
- Despliegue: Transformers.js en navegador (WebGPU o WASM) y en Node.js. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: factor de tiempo real de 0,14 (q8) y 0,23 (q4w) en Chrome con WASM de 4 hilos. En Safari con WebGPU se reporta lentitud y fugas de memoria de GPU; se recomienda usar WASM en Safari.
- Para WASM multihilo se requiere aislamiento cross-origin (`Cross-Origin-Opener-Policy: same-origin` y `Cross-Origin-Embedder-Policy: require-corp`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| yaltaieh/whisper-base-ar-quran-onnx | ~74 M (heredado) | 30 s por chunk | Árabe | Apache-2.0 | ONNX (Transformers.js) | Timestamps por palabra, variantes q4/q8/q4w |
| tarteel-ai/whisper-base-ar-quran | ~74 M | 30 s por chunk | Árabe | Apache-2.0 | Safetensors (PyTorch) | Modelo original; sin timestamps por palabra listos para Transformers.js |
| openai/whisper-base | ~74 M | 30 s por chunk | Multilingüe | MIT | PyTorch, ONNX | ASR generalista; menor precisión en recitación coránica |
| openai/whisper-small | ~244 M | 30 s por chunk | Multilingüe | MIT | PyTorch, ONNX | Mayor tamaño y coste; no especializado en coránico |

## Limitaciones y advertencias

- El modelo omite la basmala cuando está unida al habla siguiente; se recomienda dividir el audio en silencios y transcribir cada segmento por separado.
- En segmentos muy cortos (una sola palabra alargada) puede entrar en bucles de repetición (`د د د د …`); conviene limitar `max_new_tokens` según la duración del segmento y descartar salidas con una palabra repetida.
- En Safari/WebKit con WebGPU la memoria de GPU crece durante transcripciones largas y el navegador puede recargar la página; además es lento. Usar las variantes WASM en Safari.
- Transformers.js 4.3.2 con WebGPU presenta fugas de memoria de GPU al usar `return_timestamps: "word"`: la caché KV (~37 MB por llamada a `generate()`) no se libera. Es necesario envolver `pipe.model.generate` y llamar a `dispose()` sobre los tensores `gpu-buffer`.
- La cuantización es con pérdida: en el clip de Al-Fatiha, q8 omitió una palabra repetida que q4 y fp32 sí reprodujeron.
- Transformers.js 4.3.2 devuelve una hora de fin incorrecta para la última palabra (0 o el inicio de la última ventana); hay que corregirlo en la aplicación usando el inicio de la palabra siguiente o la duración del audio.
- Los timestamps por palabra son aproximados (típicamente con un margen de alrededor de un segundo).
- El modelo solo soporta árabe; no es multilingüe.
- Riesgo de alucinación y de errores en recitaciones con ruido de fondo o pronunciación atípica; no se documentan sesgos específicos más allá de las limitaciones del ajuste fino original.
- Licencia Apache-2.0, que permite uso comercial, pero el crédito del modelo corresponde a Tarteel AI; este repositorio solo contiene la conversión y cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yaltaieh/whisper-base-ar-quran-onnx
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Transformers.js: https://github.com/huggingface/transformers.js
- Whisper-base de OpenAI (referencia de `generation_config.json`): https://huggingface.co/openai/whisper-base
- Tarteel AI en Hugging Face: https://huggingface.co/tarteel-ai
