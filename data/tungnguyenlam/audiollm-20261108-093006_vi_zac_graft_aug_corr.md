# tungnguyenlam/audiollm-20261108-093006_vi_zac_graft_aug_corr

## Resumen

AudioLLM `20261108-093006_vi_zac_graft_aug_corr` es un adaptador PEFT (LoRA) para reconocimiento automatico del habla (ASR) en vietnamita, publicado por el usuario tungnguyenlam en Hugging Face. No se trata de un modelo base completo, sino de un conjunto de pesos entrenados sobre un modelo subyacente identificado en la configuracion como `lfm25_230m_lfm3envi`, con un proyector de tipo `conv` y un stack de 8 capas. El repositorio ocupa 1.0 GB e incluye checkpoints con estado de LoRA, proyector, embeddings opcionales, optimizador, scheduler y RNG.

El modelo resuelve la transcripcion de audio a texto en vietnamita y, segun la model card, admite tambien una modalidad de correccion: si se le pasa una hipotesis ASR previa (`--hypothesis`), puede refinar esa transcripcion. Los resultados reportados en la propia model card muestran un WER de validacion del 39.2 % en el mejor paso (paso 12000), con variaciones notables segun el conjunto de evaluacion: 15.24 % en `lsvsc/validation`, 23.35 % en `zac2026/dev#corr` y hasta 57.37 % en `zac2026/holdout`.

Es relevante ahora porque ejemplifica un flujo de trabajo de ajuste fino eficiente (LoRA r=64, alpha=128) sobre un modelo de audio de ~230M de parametros, con entrenamiento en 24000 pasos y 2 epocas sobre una mezcla de corpus vietnamitas (PhoAudioBook, VLSP2020, LSVSC, ViMD, FPT-FOSD y ZAC2026). La licencia no esta disponible, lo que limita su uso comercial sin aclaracion previa del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT/LoRA sobre modelo base `lfm25_230m_lfm3envi` con proyector `conv` y stack de 8 capas |
| Parametros totales | no disponible (modelo base ~230M segun identificador; adaptador LoRA adicional) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (`LANG = vi`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `peft`) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=64, alpha=128, LR=0.0002) entrenado sobre un modelo base de audio identificado como `lfm25_230m_lfm3envi`, con un proyector de tipo convolucional (`conv`) y un stack de 8 capas. El entrenamiento se realizo con batch size 16 y acumulacion de gradientes 2, durante 24000 pasos y 2 epocas, con checkpoints cada 1000 pasos. La duracion total del entrenamiento fue de 21571 segundos (aproximadamente 6 horas). El split de entrenamiento combina `phoaudiobook_200h/train`, `vlsp2020_100h/train`, `lsvsc/train`, `vimd/train` (x2), `fpt_fosd/train` y `zac2026/train` (x10), lo que indica un sobremuestreo deliberado del corpus ZAC2026.

La innovacion principal documentada es la capacidad de "correccion" (sufijo `_corr` en el nombre): el modelo puede recibir una hipotesis ASR previa y producir una transcripcion corregida. Los resultados de validacion muestran una mejora sustancial al aplicar esta modalidad: en `zac2026/dev` el WER baja de 41.56 a 23.35, y en `zac2026/holdout` de 57.37 a 34.96. No se detalla en la informacion disponible si hubo RLHF, DPO ni la composicion exacta del dataset mas alla de los nombres de los corpus.

## Capacidades

- Reconocimiento automatico del habla (ASR) en vietnamita, con salida de texto a partir de audio.
- Modo de correccion de hipotesis ASR: acepta una transcripcion previa y genera una version refinada.
- Entrenamiento con `aug` (aumento de datos) segun el nombre del run, aunque no se detalla el tipo de aumentacion.
- Soporte de inferencia en CPU (`--device cpu`) y GPU.
- Checkpoints intermedios retenidos con estado completo (LoRA, proyector, optimizador, scheduler, RNG) para reanudar entrenamiento o evaluar pasos concretos.
- No se documenta soporte de tool calling, agentes, vision, audio multimodal mas alla de ASR, ni capacidades multilingues fuera del vietnamita.

## Casos de uso

- Transcripcion de reuniones y entrevistas en vietnamita: el modelo puede convertir audio a texto con un WER de validacion del 39.2 % en el mejor checkpoint, adecuado para borradores que se revisan manualmente.
- Post-procesado de subtitulos automaticos: usando el modo `--hypothesis`, se puede pasar una transcripcion preliminar de otro sistema y obtener una version corregida con WER reducido a la mitad en algunos conjuntos (por ejemplo, de 41.56 a 23.35 en `zac2026/dev`).
- Investigacion en ASR de bajo recurso: el adaptador LoRA sobre un modelo de ~230M permite experimentar con ajuste fino en vietnamita sin requerir GPUs de gran capacidad.
- Generacion de datasets de voz etiquetados: transcripcion de corpus de audio para construir pares audio-texto en vietnamita, con la ventaja de poder reanudar desde checkpoints intermedios.
- Evaluacion comparativa de modelos ASR: el repositorio incluye metricas por conjunto (`gigaspeech2_vi`, `vimd`, `fleurs_vi`, `lsvsc`, `zac2026`) que permiten reproducir la evaluacion en dominios concretos.
- Despliegue en entornos con recursos limitados: al ser un adaptador sobre un modelo de ~230M y admitir CPU, puede ejecutarse en maquinas sin GPU dedicada para tareas de transcripcion por lotes.

## Benchmarks y rendimiento

Resultados reportados en la model card (WER en porcentaje; `#corr` indica modo de correccion):

| Conjunto | WER |
|---|---|
| `zac2026/dev` | 41.56 |
| `zac2026/dev#corr` | 23.35 |
| `gigaspeech2_vi/validation` | 27.0 |
| `vimd/validation` | 43.1 |
| `fleurs_vi/validation` | 46.7 |
| `lsvsc/validation` | 15.24 |
| `zac2026/holdout` | 57.37 |
| `zac2026/holdout#corr` | 34.96 |

Mejor WER de validacion: 39.2 % en el paso 12000. WER de test: 43.64 (`zac2026/dev`), 24.37 (`zac2026/dev#corr`), 57.37 (`zac2026/holdout`), 34.96 (`zac2026/holdout#corr`). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; al tratarse de un adaptador sobre un modelo de ~230M de parametros, la huella es reducida (del orden de pocos GB en fp32/fp16, sin datos oficiales).
- GPU recomendadas: no disponible. Por tamano del modelo base, cabria en GPUs consumer (RTX 3060/4060 o superiores), pero no hay confirmacion en la informacion proporcionada.
- Cabe en GPU consumer: probablemente si, dado el tamano del modelo base (~230M), aunque no se documenta oficialmente.
- Opciones de despliegue: scripts propios del repositorio (`scripts/transcribe.py`, `scripts/hf_backup.py`) y el bundle portable en `quickstart/`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La duracion de entrenamiento fue de 21571 s para 24000 pasos con batch 16, pero no se reportan metricas de inferencia.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos ASR en vietnamita (por ejemplo, PhoWhisper, VietASR u otros adaptadores), ni datos de parametros, contexto o rendimiento de alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial sin autorizacion explicita del autor.
- WER elevado en algunos dominios: 57.37 % en `zac2026/holdout` y 46.7 % en `fleurs_vi/validation`, lo que limita su uso en produccion sin revision humana.
- Solo vietnamita: no se documentan otros idiomas.
- No es un modelo autonomo: requiere el modelo base `lfm25_230m_lfm3envi` y el codigo del repositorio `tungnguyenlam/audiollm` para funcionar.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, acentos no representados en el corpus de entrenamiento o dominios alejados de los splits usados.
- El sobremuestreo de `zac2026/train` (x10) puede sesgar el modelo hacia ese dominio y penalizar el rendimiento en otros.
- Sin datos publicados de sesgos demograficos o linguisticos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa por parte de la comunidad.
- Fecha de creacion futura (2026-11-08) en los metadatos: conviene verificar la procedencia y el estado real del repositorio antes de usarlo.

## Enlaces

- Hugging Face: https://huggingface.co/tungnguyenlam/audiollm-20261108-093006_vi_zac_graft_aug_corr
- Repositorio GitHub: https://github.com/tungnguyenlam/audiollm
- Perfil del autor en Hugging Face: https://huggingface.co/tungnguyenlam/datasets
