# tachiwin/Tachiwin-Audio-ID

## Resumen

Tachiwin Audio Language ID es un modelo de identificación de lengua hablada (LID) especializado en las lenguas indígenas de México. Lo desarrolla el proyecto Tachiwin y se distribuye bajo licencia Apache-2.0. El modelo recibe un clip de audio corto y devuelve una lista ordenada de códigos de lengua con probabilidades calibradas, sobre un espacio de etiquetas de 128 clases, en su mayoría códigos ISO 639-3 con algunas adiciones propias del catálogo del proyecto. No transcribe: identifica la lengua para que se pueda cargar después el modelo adecuado (ASR, traducción, etc.).

La arquitectura es ECAPA-TDNN con un embedding de 256 dimensiones y una cabeza de clasificación coseno, derivada de `speechbrain/lang-id-voxlingua107-ecapa` y reentrenada sobre un corpus de lenguas indígenas. Con unos 21,1 millones de parámetros (85 MB en safetensors fp32), está pensado para ejecutarse en CPU, sin conexión y sin depender de un servicio propietario, lo que facilita su despliegue en dispositivos modestos y en contextos de campo.

Su relevancia actual es doble: cubre un hueco práctico (el enrutado de audio hacia modelos específicos de lenguas originarias de México, habitualmente mal cubiertas por los LID comerciales) y lo hace de forma abierta, publicando configuración de entrenamiento, estadísticas por lengua y métricas, de modo que las comunidades hablantes puedan inspeccionar, replicar y corregir el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (embedding de 256 dimensiones) con cabeza coseno |
| Parametros totales | 21.129.600 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de audio de 6,0 s con salto de 3,0 s y máximo de evaluación de 10,0 s |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32); existe una variante ONNX en `tachiwin/tachiwin-lid-ecapa-onnx` |
| Idiomas soportados | 128 clases de lengua, en su mayoría lenguas indígenas de México (amu, azg, azn, azz, cac, cak, cco, chd, chf, chj, chq, coc, coz, crn, ctl, ctp, ctu, cuc, cux, cya, dih, hch, hue, hus, ixc, jac, jmx, kic, klb, maj, mam, mau, maz, mbz, mco, mdv, meh, mfy, mie, mig, mih, mim, mio, mir, mit, mix, mjc, mmc, mto, mxp, mxt, mxv, mxy, mza, mzi, nah, nch, ncj, ncl, ncx, neq, ngu, nhe, nhm, nhw, nhx, nlv, ntp, ood, ote, otm, ots, ott, pbs, pei, pmq, ppi, pua, quc, sei, stp, tac, tar, tcf, tee, toc, toj, top, tos, tpc, tpl, tpt, tpx, trc, trs, tsz, tzh, tzo, var, vmj, vmm, xtd, xtj, xtm, xtn, yaq, yua, zaa, zad, zae, zai, zar, zas, zaw, zcd, zoc, zoh, zpa, zpc, zpd, zpf, zpi, zpl, zpm, zpr, zpt, zpv, zsr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, `model.safetensors`, backbone `emb.*` + `head.weight` 128 × 256); variante ONNX disponible |

## Arquitectura y entrenamiento

El modelo parte de `speechbrain/lang-id-voxlingua107-ecapa` y se reentrena sobre lenguas indígenas. El pipeline es el clásico de SpeechBrain para LID: features Kaldi fbank con normalización de media y varianza por enunciado, un backbone ECAPA-TDNN que produce un embedding de 256 dimensiones y una cabeza de clasificación coseno. Durante el entrenamiento se usa AAM-softmax con escala 30 y margen 0,2; en inferencia la cabeza queda como una matriz L2-normalizada congelada y los logits se dividen por una temperatura ajustada en el split de validación (T = 1,5311099290847778).

El modelo emite un único softmax sobre los 128 códigos. Los campos `superlanguage` y `family` que devuelve la API son metadatos consultados en `labels.json` a partir del código predicho, no cabezas separadas ni probabilidades independientes. El preprocesado fija la frecuencia de muestreo en 16 kHz, rellena los clips cortos hasta 0,5 s y trocea en ventanas de 6 s con salto de 3 s cualquier audio de más de 10 s, promediando las log-probabilidades. El checkpoint publicado corresponde al paso 12.168 de 15.210. La configuración de inferencia vive en `config.json`, de modo que cambiar el backbone o la cabeza no requiere tocar código. El corpus de entrenamiento es `tachiwin/tachiwin_multilingual_audio`; el número total de tokens o de horas de audio no está disponible en la información proporcionada.

## Capacidades

- Identificación de lengua hablada sobre 128 clases, con devolución de un ranking top-k de códigos con probabilidades calibradas por temperature scaling.
- Salida enriquecida con metadatos de superlenua y familia lingüística, derivados del código predicho.
- Procesamiento de audio de duración variable: relleno de clips cortos, ventanas solapadas para clips largos y agregación por media de log-probabilidades.
- Ejecución en CPU o CUDA (selección automática) y funcionamiento offline una vez descargado el repositorio.
- Manejo de ficheros WAV o arrays float de una dimensión, con remuestreo interno a 16 kHz.
- Capacidad de enrutado: pensado para decidir qué modelo downstream (ASR, traducción) cargar según la lengua detectada.
- No realiza transcripción, traducción ni diarización; su alcance es exclusivamente la clasificación de lengua.

## Casos de uso

- Enrutado de audio en pipelines de ASR multilingüe: al recibir una grabación, el modelo identifica la lengua en milisegundos y el orquestador carga el modelo de reconocimiento de voz correspondiente, evitando ejecutar varios ASR en paralelo o aplicar uno genérico con baja cobertura.
- Documentación lingüística de campo: investigadores que recogen grabaciones de varias comunidades pueden clasificar automáticamente lotes de audio por variante antes de la anotación manual, reduciendo el trabajo de etiquetado previo.
- Archivo y catalogación de patrimonio sonoro: instituciones con fonotecas de lenguas originarias pueden usar el modelo para verificar o completar metadatos de lengua en grabaciones históricas, con revisión humana posterior.
- Aplicaciones educativas y de revitalización lingüística: un juego o aplicación móvil puede detectar qué lengua está hablando el usuario y adaptar el contenido, funcionando offline en dispositivos sin conectividad gracias a sus 85 MB y su ejecución en CPU.
- Triaje en servicios de atención a comunidades indígenas: un sistema de primera línea puede identificar la lengua del usuario y derivar la llamada al intérprete o al agente adecuado, sin necesidad de que el usuario seleccione su lengua en un menú.
- Control de calidad de corpus: al construir datasets de audio para entrenar ASR de lenguas indígenas, el modelo sirve para detectar grabaciones mal etiquetadas o mezclas de lenguas dentro de un mismo lote.
- Investigación sociolingüística a escala: permite medir la presencia relativa de distintas variantes en emisiones de radio comunitaria o en encuestas abiertas, siempre con validación estadística de los resultados.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de `tachiwin/tachiwin_multilingual_audio`. La verificación indicada en la model card se realizó sobre 8.109 clips de 111 variantes; las métricas de la model-index figuran como no verificadas (`verified: false`).

| Metrica | Valor |
|---|---|
| Top-1 accuracy | 0,9058 |
| Top-3 accuracy | 0,9735 |
| Macro F1 | 0,7845 |
| Macro recall | 0,8044 |
| Family accuracy | 0,9662 |
| Superlanguage accuracy | 0,9482 |

No se han publicado en la información disponible resultados comparativos con otros modelos LID sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; los pesos ocupan 85 MB en fp32 y el modelo corre en CPU sin GPU.
- GPU recomendadas: no requiere GPU. Cualquier GPU CUDA disponible se usa automáticamente por comodidad, pero no aporta una ventaja crítica dado el tamaño del modelo.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y también en dispositivos de borde y en CPU de portátil.
- Opciones de despliegue: SpeechBrain con el `inference.py` incluido en el repositorio, o la variante ONNX publicada en `tachiwin/tachiwin-lid-ecapa-onnx` para entornos sin PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de audio.
- Latencia y throughput: no disponibles de forma explícita en la información proporcionada; por el tamaño del modelo y la ventana de 6 s, la inferencia en CPU es del orden de fracciones de segundo por clip, pero no se aporta una cifra medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Tachiwin Audio Language ID | 21,1 M | ventana de 6 s, máximo 10 s | 128 clases, lenguas indígenas de México | Apache-2.0 | Especializado, con metadatos de familia y superlenua |
| speechbrain/lang-id-voxlingua107-ecapa | no disponible en la información | no disponible | 107 lenguas (VoxLingua107) | no disponible en la información | Modelo base del que deriva Tachiwin; cobertura genérica, sin foco en lenguas indígenas |
| tachiwin/tachiwin-lid-ecapa-onnx | mismo modelo en formato ONNX | mismo | mismo | Apache-2.0 | Variante de despliegue del propio proyecto, no un competidor |

No se dispone de datos de benchmarks comunes que permitan comparar el rendimiento de estos modelos entre sí.

## Limitaciones y advertencias

- El modelo clasifica lengua, no transcribe ni traduce; no debe usarse para tareas de ASR.
- El macro F1 (0,7845) y el macro recall (0,8044) son notablemente inferiores al top-1 accuracy (0,9058), lo que indica un rendimiento desigual entre clases: las lenguas con menos datos de entrenamiento se confunden con más frecuencia. Las estadísticas por lengua en `lang_stats.json` deben consultarse antes de desplegar en una variante concreta.
- `superlanguage` y `family` son metadatos derivados del código predicho, no predicciones independientes: un error en el código arrastra el error en la familia.
- Los resultados de la model-index figuran como no verificados por un tercero; la verificación descrita en la model card se ejecutó sobre el propio pipeline público, no es una evaluación externa independiente.
- Riesgo de confusión entre variedades cercanas de la misma familia lingüística, especialmente en clips muy cortos (el mínimo es 0,5 s tras el relleno) o con ruido de fondo.
- El modelo está entrenado específicamente para lenguas indígenas de México; su comportamiento con otras lenguas o con code-switching con español no está documentado en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero al tratarse de lenguas de comunidades indígenas conviene revisar las implicaciones éticas y de consentimiento de los datos, más allá de lo que exige la licencia.
- No se documentan sesgos demográficos (edad, sexo, región) en el conjunto de evaluación; la representatividad del test respecto a hablantes reales no está cuantificada en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tachiwin/Tachiwin-Audio-ID
- Variante ONNX: https://huggingface.co/tachiwin/tachiwin-lid-ecapa-onnx
- Dataset de entrenamiento: https://huggingface.co/datasets/tachiwin/tachiwin_multilingual_audio
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tachiwin/classifier
- Sitio web del proyecto: https://tachiwin.org
- Perfil del autor en Hugging Face: https://huggingface.co/tachiwin
- Modelo base: https://huggingface.co/speechbrain/lang-id-voxlingua107-ecapa
