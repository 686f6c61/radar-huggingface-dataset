# tachiwin/Tachiwin-Audio-ID-Onnx

## Resumen

Tachiwin Audio Language ID (ONNX) es la exportación a formato ONNX del modelo de identificación de lengua hablada del proyecto Tachiwin, desarrollado por el usuario tachiwin. Su tarea es recibir una grabación corta de audio y determinar cuál de las 128 variantes de lenguas indígenas de México se está hablando, devolviendo una clase con probabilidades calibradas. No es un modelo generativo: es un clasificador de audio especializado en una tarea muy concreta y con un sesgo geográfico y lingüístico muy marcado.

La relevancia de esta versión ONNX radica en que el front-end de características de SpeechBrain (STFT como matrices DFT, banco de filtros mel HTK, log-mel en dB y normalización de media a nivel de frase) está embebido dentro del grafo. Esto significa que en inferencia solo se necesita `onnxruntime` o `onnxruntime-web`: no hace falta SpeechBrain, ni PyTorch, ni una FFT en WASM. Es exactamente lo que carga la web app de Tachiwin para identificar lenguas en el lado del cliente, donde el audio nunca sale del dispositivo.

El modelo base es una ECAPA-TDNN, y esta build incluye dos artefactos: `model.onnx` (fp32, 85,5 MB) y `model.fp16w.onnx` (kernels fp16 con matemáticas fp32, 43,1 MB), que es el que usa por defecto la aplicación web. La licencia es Apache 2.0 y el repositorio ocupa aproximadamente 0,1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (SpeechBrain), exportada a ONNX con opset 17 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (audio: ventanas de 6,0 s con salto de 3,0 s; clips > 10,0 s se trocean; < 0,5 s se rellenan) |
| Tipos de cuantizacion | fp32 (`model.onnx`) y fp16 en kernels con matematicas fp32 (`model.fp16w.onnx`) |
| Idiomas soportados | 128 clases correspondientes a variantes de lenguas indigenas de Mexico (amu, azg, azn, azz, cac, cak, cco, chd, chf, chj, chq, coc, coz, crn, ctl, ctp, ctu, cuc, cux, cya, dih, hch, hue, hus, ixc, jac, jmx, kic, klb, maj, mam, mau, maz, mbz, mco, mdv, meh, mfy, mie, mig, mih, mim, mio, mir, mit, mix, mjc, mmc, mto, mxp, mxt, mxv, mxy, mza, mzi, nah, nch, ncj, ncl, ncx, neq, ngu, nhe, nhm, nhw, nhx, nlv, ntp, ood, ote, otm, ots, ott, pbs, pei, pmq, ppi, pua, quc, sei, stp, tac, tar, tcf, tee, toc, toj, top, tos, tpc, tpl, tpt, tpx, trc, trs, tsz, tzh, tzo, var, vmj, vmm, xtd, xtj, xtm, xtn, yaq, yua, zaa, zad, zae, zai, zar, zas, zaw, zcd, zoc, zoh, zpa, zpc, zpd, zpf, zpi, zpl, zpm, zpr, zpt, zpv, zsr) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model.fp16w.onnx`) |

## Arquitectura y entrenamiento

El modelo base es una ECAPA-TDNN de SpeechBrain, una arquitectura de embeddings de hablante con atención estadística y agregación multi-capa, adaptada aquí a clasificación de lengua (128 clases). La exportación a ONNX integra el front-end de características completo: STFT implementada como matrices DFT, banco de filtros mel HTK, log-mel en dB y normalización de media a nivel de frase. El contrato del grafo es explícito: entrada `frames` float32 `[batch, frames, 400]` (audio enmarcado y con ventana Hamming aplicada por el cliente, 16 kHz mono, `n_fft=400`, `win_length=400`, `hop_length=160`, `center=True` con padding de 200 a cada lado) y `lengths` float32 `[batch]`; salida `logits` float32 `[batch, 128]`.

Un detalle técnico relevante es que el grafo no aplica la temperatura: los logits deben dividirse por `T = 1.5311099290847778`, aplicar `log_softmax` por trozo, promediar las log-probabilidades entre trozos y finalmente aplicar `softmax`. Los clips de más de 10,0 s se cortan en ventanas de 6,0 s con salto de 3,0 s y se promedian; los de menos de 0,5 s se rellenan.

No se dispone de información sobre el número de tokens, la composición exacta del dataset de entrenamiento ni sobre si hubo RLHF/DPO (no aplica en un clasificador de audio). El dataset asociado es `tachiwin/tachiwin_multilingual_audio` y la model card menciona que `lang_stats.json` y `metrics.json` se heredan del modelo fuente.

## Capacidades

- Identificación de lengua hablada entre 128 variantes de lenguas indígenas de México, con probabilidades calibradas.
- Clasificación con granularidad jerárquica: además de la variante, se reportan métricas de familia y de "superlengua" (superlanguage).
- Inferencia en el lado del cliente (navegador) mediante `onnxruntime-web` y WebAssembly, sin que el audio salga del dispositivo.
- Inferencia nativa en CPU con `onnxruntime` sin dependencias de PyTorch ni SpeechBrain.
- Procesamiento de clips largos mediante troceado en ventanas de 6,0 s con solapamiento y promediado de log-probabilidades.
- Invariante al número de frames: logits idénticos a 60, 251, 761 y 1200 frames (máx. |Δlogit| ≤ 6,9e-06).
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de audio.
- No dispone de capacidades de visión, audio generativo ni modo "thinking".

## Casos de uso

- Identificación de lengua en el navegador para aplicaciones comunitarias: la web app de Tachiwin carga `model.fp16w.onnx` con `onnxruntime-web` y clasifica el audio localmente, lo que permite desplegar el identificador en contextos con conectividad limitada y sin enviar grabaciones a un servidor.
- Catalogación y archivística de grabaciones de campo: dado un lote de audios en lenguas indígenas, el modelo asigna una variante probable a cada clip, lo que acelera el etiquetado manual posterior por parte de lingüistas.
- Enrutamiento en servicios de atención o preservación lingüística: si una grabación se identifica como una variante concreta, el sistema puede derivarla al revisor o al recurso correspondiente de esa lengua.
- Investigación lingüística y sociolingüística: el modelo permite medir la presencia relativa de variantes en corpus de audio y detectar confusiones entre variedades cercanas (la accuracy por familia es 0,9662 frente a la Top-1 de 0,9058, lo que sugiere que los errores se concentran dentro de la misma familia).
- Filtrado previo en pipelines de ASR o traducción: el código de lengua devuelto puede seleccionar el modelo acústico o el recurso léxico adecuado antes de transcribir.
- Aplicaciones educativas o de documentación participativa: al ejecutarse en el dispositivo, facilita que hablantes graben y etiqueten muestras sin depender de infraestructura externa.
- Verificación de calidad de datasets: el modelo sirve como comprobación automática de que las muestras etiquetadas con una variante concuerdan con lo que el clasificador predice.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados), sobre el split de test de `tachiwin/tachiwin_multilingual_audio`:

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 0,9058 |
| Top-3 accuracy | 0,9735 |
| Macro F1 | 0,7845 |
| Macro recall | 0,8044 |
| Family accuracy | 0,9662 |
| Superlanguage accuracy | 0,9482 |

Paridad y latencia de la exportación (según la model card):

| Metrica | Valor |
|---|---|
| Acuerdo Top-1 con el pipeline PyTorch/SpeechBrain | 44/44 |
| Diferencia máxima de probabilidad | 0,000501 |
| Invariante de frames (60, 251, 761, 1200) | máx. |Δlogit| ≤ 6,9e-06 |
| Latencia CPU nativa, `model.fp16w.onnx` | ≈ 86,2 ms por clip de 5 s |
| Latencia CPU nativa, `model.onnx` | ≈ 103,0 ms por clip de 5 s |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño de los artefactos (43,1 MB fp16w y 85,5 MB fp32) el modelo es muy ligero y puede ejecutarse en CPU sin GPU dedicada.
- GPU recomendadas: no se especifican; el caso de uso principal es CPU nativa y navegador.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el despliegue objetivo es CPU y WebAssembly.
- Opciones de despliegue: `onnxruntime` (CPUExecutionProvider), `onnxruntime-web` con WebAssembly, y cualquier runtime compatible con ONNX.
- Latencia: ≈ 86,2 ms por clip de 5 s con `model.fp16w.onnx` y ≈ 103,0 ms con `model.onnx` en CPU nativa; el rendimiento en navegador no se detalla en la información disponible.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tarea | Clases | Contexto / ventana | Licencia | Formato |
|---|---|---|---|---|---|
| Tachiwin Audio Language ID (ONNX) | Identificación de lengua hablada (lenguas indígenas de México) | 128 | Ventanas de 6,0 s, salto 3,0 s | Apache 2.0 | ONNX |
| `tachiwin/tachiwin-lid-ecapa-onnx` | Identificación de lengua (ECAPA, ONNX) | no disponible | no disponible | no disponible | ONNX |
| `tachiwin/Tachiwin-Audio-ID` (modelo fuente) | Identificación de lengua hablada | 128 | no disponible | no disponible | PyTorch/SpeechBrain |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo solo cubre 128 variantes de lenguas indígenas de México; no es un identificador de lengua universal y no debe esperarse buen comportamiento fuera de ese conjunto.
- La Top-1 accuracy es 0,9058, pero el Macro F1 (0,7845) y el Macro recall (0,8044) son notablemente inferiores, lo que indica un rendimiento desigual entre clases y posible desequilibrio en el soporte por variante.
- La Family accuracy (0,9662) es superior a la Top-1, lo que sugiere que los errores se producen principalmente entre variantes de la misma familia; conviene no confiar en la variante exacta sin revisión humana en contextos críticos.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`).
- Riesgo de confusión con audio ruidoso, música de fondo o habla mezclada de varias lenguas; la model card no documenta el comportamiento en esas condiciones.
- El grafo no aplica la temperatura: quien consuma los logits directamente sin dividir por T = 1.5311099290847778 obtendrá probabilidades mal calibradas.
- El cliente debe construir la entrada `frames` con los parámetros exactos de enmarcado (16 kHz mono, `n_fft=400`, `hop_length=160`, ventana Hamming periódica, `center=True`); desviarse de esa receta degrada la precisión.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del dataset asociado (`tachiwin/tachiwin_multilingual_audio`) para el uso de los datos originales.
- No se documentan sesgos específicos ni limitaciones de idioma más allá de la cobertura de clases.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachiwin/Tachiwin-Audio-ID-Onnx
- Modelo fuente: https://huggingface.co/tachiwin/Tachiwin-Audio-ID
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tachiwin/classifier
- Aplicación web: https://tachiwin.org/identificador/clasificador
- Dataset: https://huggingface.co/datasets/tachiwin/tachiwin_multilingual_audio
- Repositorio relacionado: https://huggingface.co/tachiwin/tachiwin-lid-ecapa-onnx
- Perfil del autor: https://huggingface.co/tachiwin
