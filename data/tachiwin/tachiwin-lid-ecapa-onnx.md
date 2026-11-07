# tachiwin/tachiwin-lid-ecapa-onnx

## Resumen

Tachiwin LID ECAPA ONNX es una compilación en formato ONNX del modelo de identificación de idioma hablado `tachiwin/tachiwin-lid-ecapa`, construido sobre la arquitectura ECAPA-TDNN y afinado a partir de `speechbrain/lang-id-voxlingua107-ecapa`. El modelo clasifica fragmentos de audio en una de las 128 lenguas de México cubiertas por el proyecto Tachiwin, y su variante ONNX está pensada específicamente para ejecutarse en el navegador mediante `onnxruntime-web`, de modo que el audio nunca abandona el dispositivo del usuario.

La innovación principal de esta compilación es que el front-end de características de SpeechBrain (STFT implementada como matrices DFT, banco de filtros mel HTK, log-mel en dB y normalización por media de frase) está embebido dentro del grafo ONNX. Esto elimina la dependencia de SpeechBrain, PyTorch o una FFT en WASM en tiempo de ejecución: solo se necesita `onnxruntime-web`. El repositorio incluye dos artefactos, `model.onnx` (fp32, 85,5 MB) y `model.fp16w.onnx` (kernels fp16 con matemática fp32, 43,1 MB), junto con un `manifest.json` que indexa nombres, hashes SHA-256, constantes de enventanado y espejos.

El modelo es relevante para desarrolladores que necesiten identificación de idioma en el cliente, sin backend ni transferencia de audio, en un contexto de preservación y documentación de lenguas indígenas mexicanas. Su licencia Apache 2.0 y su tamaño contenido lo hacen desplegable en entornos web y de escritorio con requisitos modestos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (sobre SpeechBrain `lang-id-voxlingua107-ecapa`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada por tramas de audio; ventana de inferencia de 5 s en las pruebas) |
| Tipos de cuantizacion | fp32 (`model.onnx`) y fp16 en kernels con matematica fp32 (`model.fp16w.onnx`) |
| Idiomas soportados | 128 lenguas de Mexico |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.fp16w.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en ECAPA-TDNN, una arquitectura de embeddings de hablante que emplea capas convolucionales con atención de canal y agregación estadística, adaptada aquí a clasificación de idioma con 128 clases de salida. Parte de `speechbrain/lang-id-voxlingua107-ecapa` y se afina para las lenguas de México del proyecto Tachiwin. El grafo ONNX exportado integra el front-end completo: STFT calculada como matrices DFT, banco de filtros mel HTK, log-mel en dB y normalización por media de frase, de forma que el cliente solo debe enventanar el audio.

El contrato del grafo es: entrada `frames` float32 `[B, T, 400]` (audio enventanado con Hamming por el cliente) y `lengths` float32 `[B]` (longitudes relativas, 1.0 = pila completa de tramas); salida `logits` float32 `[B, 128]` como similitud coseno escalada, sin temperatura aplicada. El enventanado en cliente usa `n_fft=400`, `win_length=400`, `hop_length=160`, `center=True` (relleno de ceros de 200 a cada lado), ventana Hamming periódica y entrada mono a 16 kHz. La inferencia requiere aplicar `log_softmax(logits / T)` por fragmento, promediar sobre fragmentos y aplicar `softmax`. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Identificación de idioma hablado entre 128 lenguas de México a partir de audio mono a 16 kHz.
- Clasificación de audio por fragmentos con agregación (promedio de `log_softmax` sobre fragmentos).
- Ejecución en el navegador vía `onnxruntime-web` sin dependencias de SpeechBrain, PyTorch ni FFT en WASM.
- Procesamiento local: el audio no se transmite, lo que habilita casos de uso con requisitos de privacidad.
- Invariante al número de tramas (verificado para T = 60…1200).
- No dispone de tool calling, function calling, capacidades de agente ni razonamiento multi-paso.
- No dispone de visión, audio generativo ni modo de pensamiento; es un clasificador de audio.
- Capacidades multilingües limitadas a las 128 etiquetas de lenguas mexicanas; no existe clase "otro/desconocido".

## Casos de uso

- Identificador de lengua en el navegador: la aplicación web de Tachiwin (`tachiwin.org/identificador/clasificador`) lo usa para clasificar audio en el cliente; cualquier sitio puede replicar el patrón sirviendo los artefactos ONNX y ejecutando `onnxruntime-web`, sin backend ni subida de audio.
- Documentación de lenguas indígenas: investigadores que recopilan grabaciones de campo pueden clasificar automáticamente el idioma de cada clip en el dispositivo, preservando la soberanía de los datos de las comunidades.
- Enrutado de pipelines de ASR: usar la etiqueta de idioma predicha para seleccionar el modelo de reconocimiento de voz adecuado en un sistema multi-idioma, dado que el modelo devuelve una de 128 etiquetas con probabilidad calibrada (ECE 0,020).
- Aplicaciones educativas offline: herramientas de aprendizaje de lenguas mexicanas que verifican en local qué lengua habla el usuario, sin conexión y sin enviar audio a servidores.
- Filtrado y organización de archivos de audio: clasificación por lotes de colecciones de grabaciones para etiquetar y ordenar por lengua antes de su archivo o transcripción.
- Demos interactivas con muestras de referencia: el repositorio incluye `samples.json` y 22 clips WAV con verdad fundamental que la interfaz web ofrece como demos de un clic, útiles para validar la integración y para formación.
- Despliegue en entornos con restricciones de red o privacidad: al ejecutarse íntegramente en el cliente, encaja en aplicaciones donde no se permite enviar audio a terceros.

## Benchmarks y rendimiento

Métricas del split de test, calibradas, procedentes del modelo fuente:

| Metrica | Valor |
|---|---|
| Accuracy | 0,906 |
| Top-3 accuracy | 0,973 |
| Macro-F1 | 0,786 |
| Accuracy a nivel de familia | 0,966 |
| ECE (error de calibración esperado) | 0,020 |

Paridad y rendimiento de la compilación ONNX:

| Metrica | Valor |
|---|---|
| Acuerdo top-1 con el pipeline PyTorch/SpeechBrain | 44/44 |
| Máxima diferencia de probabilidad \|Δp\| | 0,0005 |
| Invariante al número de tramas | verificado en T = 60…1200 |
| Latencia en onnxruntime CPU nativo | ≈ 86,2 ms por clip de 5 s |
| Latencia en navegador (WebAssembly) | ≈ 8-10× la nativa en CPU de escritorio |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con artefactos de 85,5 MB (fp32) y 43,1 MB (fp16w), la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se especifican; el modelo está optimizado para CPU (onnxruntime nativo y WebAssembly en navegador), por lo que no requiere GPU dedicada.
- Cabe en GPU de consumo: sí, con amplio margen, dado el tamaño de los artefactos.
- Opciones de despliegue: `onnxruntime-web` (navegador), `onnxruntime` nativo en CPU; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de audio).
- Latencia y throughput: ≈ 86,2 ms por clip de 5 s en onnxruntime CPU nativo; en navegador WebAssembly, aproximadamente 8-10 veces esa cifra en una CPU de escritorio. El script `scripts/lid/bench_ortweb.mjs` del repositorio de la aplicación web imprime los números por clip del artefacto concreto en uso.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| tachiwin/tachiwin-lid-ecapa-onnx | ECAPA-TDNN | 128 lenguas de México | audio 16 kHz, ventana de 5 s en pruebas | Apache 2.0 | ONNX |
| speechbrain/lang-id-voxlingua107-ecapa | ECAPA-TDNN | 107 idiomas (VoxLingua107) | audio 16 kHz | Apache 2.0 | PyTorch/SpeechBrain |
| tachiwin/tachiwin-lid-ecapa | ECAPA-TDNN | 128 lenguas de México | audio 16 kHz | no disponible | PyTorch/SpeechBrain |
| tachiwin/tachiwin_ocr | Tesseract 5 (fine-tune) | 68 lenguas indígenas de México (texto) | imagen de texto | no disponible | Tesseract |

La comparación con `speechbrain/lang-id-voxlingua107-ecapa` es directa por ser su modelo base; la diferencia clave es la especialización en lenguas mexicanas y el empaquetado ONNX para navegador. `tachiwin/tachiwin_ocr` no es comparable en tarea (OCR de texto frente a identificación de audio), pero comparte el ecosistema del proyecto.

## Limitaciones y advertencias

- El modelo siempre devuelve una de sus 128 etiquetas; no existe clase "otro/desconocido", por lo que audio de idiomas fuera del conjunto se clasificará erróneamente en alguna etiqueta.
- Los splits son aleatorios por idioma, de modo que las métricas pueden ser optimistas para lenguas de bajos recursos.
- Macro-F1 de 0,786 frente a accuracy de 0,906 indica un rendimiento desigual entre clases, con peor comportamiento en lenguas con menos datos.
- No se dispone de información sobre sesgos específicos más allá de la advertencia sobre lenguas de bajos recursos.
- Riesgo de alucinación de etiqueta inherente a un clasificador cerrado: no hay abstención ante entradas ambiguas o ruidosas.
- La latencia en navegador es aproximadamente 8-10 veces la nativa, lo que puede ser limitante en dispositivos de gama baja.
- No se dispone de información sobre restricciones adicionales de uso comercial más allá de la licencia Apache 2.0.
- La integración exige respetar exactamente el contrato de enventanado del cliente (`n_fft=400`, `hop_length=160`, Hamming periódica, `center=True`) para mantener la paridad con la referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachiwin/tachiwin-lid-ecapa-onnx
- Modelo fuente: https://huggingface.co/tachiwin/tachiwin-lid-ecapa
- Modelo base: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
- Aplicación web: https://tachiwin.org/identificador/clasificador
- Modelo OCR del proyecto: https://huggingface.co/tachiwin/tachiwin_ocr
- Datasets del proyecto: https://huggingface.co/tachiwin/datasets
- Espejo HF: https://hf-mirror.com/tachiwin/tachiwin-lid-ecapa-onnx/resolve/main
- Espejo ModelScope: https://modelscope.cn/models/tachiwin/tachiwin-lid-ecapa-onnx/resolve/master
