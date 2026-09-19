# therealbee/whisper-small-ha-lora-v2

## Resumen

`therealbee/whisper-small-ha-lora-v2` es un adaptador LoRA (PEFT) publicado por el usuario therealbee sobre el modelo `therealbee/whisper-small-ha-finetuned`, que a su vez parte de la familia Whisper small de OpenAI para reconocimiento automatico del habla (ASR). El identificador incluye el sufijo "ha", lo que apunta a hausa como idioma objetivo, aunque la model card no declara idiomas de forma explicita. El repositorio ocupa 0,2 GB y contiene pesos en formato safetensors compatibles con las librerias `peft` y `transformers`.

El modelo se presenta como un ajuste fino adicional (segunda iteracion, "v2") del adaptador anterior, entrenado durante 1000 pasos con un batch total de 16, learning rate 1e-4, optimizador AdamW fused y scheduler lineal con 50 pasos de calentamiento. Los unicos resultados declarados son Loss de validacion 0,1832 y WER 15,2170 sobre un conjunto de evaluacion que no se describe en la ficha. El `model-index` del repositorio esta vacio, por lo que no hay benchmarks oficiales publicados.

Su relevancia es limitada y muy especifica: se trata de un adaptador de bajo coste computacional orientado a mejorar la transcripcion de una lengua de bajos recursos (hausa) a partir de un modelo base pequeno, con 0 descargas y 0 "likes" en el momento de la consulta. Es un artefacto de investigacion reproducible mas que un componente listo para produccion, dado que no se documentan ni la licencia, ni el dataset, ni el procedimiento de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo base `therealbee/whisper-small-ha-finetuned` (familia Whisper, transformer encoder-decoder; no detallada en la model card) |
| Parametros totales | No disponible en la informacion proporcionada; el modelo base es Whisper small, con aproximadamente 244 M de parametros segun la documentacion publica de OpenAI. El tamano del adaptador LoRA no se especifica (repo de 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; Whisper opera por documentacion publica sobre ventanas de audio de 30 s (mel spectrogram de 3000 frames) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No declarados en la ficha; el sufijo "ha" del identificador sugiere hausa |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna. Por el identificador y las etiquetas (`peft`, `lora`, `transformers`, `base_model:adapter:therealbee/whisper-small-ha-finetuned`), se trata de un adaptador de bajo rango sobre un transformer encoder-decoder de la familia Whisper, especializado por ajuste fino. El entrenamiento se realizo con PEFT 0.19.1, Transformers 5.0.0, PyTorch 2.10.0+cu128, Datasets 5.0.0 y Tokenizers 0.22.2, con precision mixta nativa (AMP), semilla 42 y 1000 pasos totales. El dataset de entrenamiento aparece como "None" en la model card, es decir, no se identifica.

Los hiperparametros documentados son: learning rate 0,0001, batch de entrenamiento 8, batch de evaluacion 8, acumulacion de gradiente 2 (batch total 16), optimizador `ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 50 pasos de calentamiento. La evolucion registrada fue: en el paso 200 (epoca 0,5242) Loss de validacion 0,1977 y WER 16,7368; en el paso 400 (epoca 1,0472) 0,1896 y 16,1059; en el paso 600 (epoca 1,5714) 0,1869 y 15,9816; en el paso 800 (epoca 2,0944) 0,1831 y 15,1118; y en el paso 1000 (epoca 2,6186) 0,1832 y 15,2170. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Reconocimiento automatico del habla (ASR): el modelo es un adaptador de transcripcion, no un modelo generativo de proposito general.
- Ajuste especifico para hausa, inferido del sufijo "ha" del identificador; no confirmado explicitamente en la model card.
- Transcripcion de audio en ventanas de hasta 30 segundos, segun el funcionamiento estandar de Whisper.
- Posible capacidad multilingue heredada del modelo base Whisper small, aunque el ajuste fino con LoRA puede degradar idiomas no presentes en el dataset de entrenamiento (dataset no declarado).
- No hay evidencia en la informacion proporcionada de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo "thinking".
- No se declara soporte de marcas de tiempo (timestamps) ni de traduccion (tarea `translate` de Whisper).

## Casos de uso

- Transcripcion de audio en hausa para investigacion en tecnologias del lenguaje de bajos recursos: el adaptador se puede cargar sobre el modelo base con `peft` para comparar WER frente a Whisper small sin ajustar en corpus de hausa.
- Generacion de subtitulos para contenido audiovisual en hausa: dado que Whisper procesa ventanas de 30 s, el adaptador es adecuado para segmentar y transcribir videos cortos o emitir subtitulos en lotes.
- Anotacion asistida de corpus: uso como preanotador de transcripciones que luego se corrigen manualmente, con un WER de referencia del 15,22 % que obliga a revision humana.
- Experimentos de adaptacion eficiente de parametros: sirve como caso de estudio de LoRA sobre modelos de voz pequenos (0,2 GB de repositorio) para comparar estrategias de ajuste con PEFT.
- Prototipos de asistentes de voz o IVR en hausa: al ser un modelo de ~244 M de parametros en su base, se puede desplegar en una GPU de gama media para pruebas de concepto, asumiendo el WER declarado.
- Investigacion academica sobre ASR en lenguas africanas: punto de comparacion reproducible (pasos, hiperparametros y semilla documentados) frente a otros adaptadores sobre Whisper.
- Evaluacion de pipelines de post-procesado (normalizacion de texto, puntuacion, correccion ortografica) sobre transcripciones con errores de reconocimiento.

## Benchmarks y rendimiento

El `model-index` del repositorio no contiene resultados (`results: []`). Los unicos datos de evaluacion disponibles son los de la model card, obtenidos sobre un conjunto de evaluacion no descrito.

| Metrica | Valor declarado |
|---|---|
| Loss (evaluacion final, paso 1000) | 0,1832 |
| WER (evaluacion final, paso 1000) | 15,2170 |
| Loss (mejor punto registrado, paso 800) | 0,1831 |
| WER (mejor punto registrado, paso 800) | 15,1118 |

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 200 | 0,5242 | 0,2686 | 0,1977 | 16,7368 |
| 400 | 1,0472 | 0,2343 | 0,1896 | 16,1059 |
| 600 | 1,5714 | 0,2109 | 0,1869 | 15,9816 |
| 800 | 2,0944 | 0,1981 | 0,1831 | 15,1118 |
| 1000 | 2,6186 | 0,1858 | 0,1832 | 15,2170 |

No se han publicado comparaciones con otros modelos ni resultados en benchmarks estandar (MMLU, HumanEval, GSM8K no aplican a un modelo ASR; no se aportan resultados de LibriSpeech, Common Voice ni FLEURS).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, Whisper small en precision fp16 ocupa aproximadamente 0,5 GB de pesos, por lo que el modelo completo con el adaptador deberia caber en GPUs con 4 GB o mas de VRAM; esta cifra es una estimacion derivada del tamano del modelo base, no un dato declarado por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) deberia ser suficiente; A100 o H100 no son necesarias para un modelo de este tamano.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de tarjetas modernas, aunque no hay confirmacion oficial ni pruebas publicadas por el autor.
- Opciones de despliegue: `peft` + `transformers` (via `PeftModel.from_pretrained` sobre `therealbee/whisper-small-ha-finetuned`); es posible fusionar el adaptador con `merge_and_unload()` para exportar a otros runtimes. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni faster-whisper; llama.cpp y Ollama no soportan adaptadores LoRA de Whisper de forma estandar.
- Latencia y throughput: no disponibles. No se aportan mediciones de RTF (real-time factor), tokens por segundo ni tiempo de transcripcion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `therealbee/whisper-small-ha-lora-v2` | Adaptador LoRA sobre Whisper small (~244 M en el base) | Ventanas de 30 s (heredado) | WER 15,2170 en conjunto no descrito | No disponible | HuggingFace, 0 descargas, 0 likes |
| `therealbee/whisper-small-ha-finetuned` (modelo base) | ~244 M (Whisper small) | Ventanas de 30 s | No disponible en la informacion proporcionada | No disponible | HuggingFace |
| `openai/whisper-small` | ~244 M | Ventanas de 30 s | WER publicado por OpenAI por idioma; no comparable directamente con este ajuste | Apache 2.0 | HuggingFace, ampliamente desplegado |
| `openai/whisper-medium` | ~769 M | Ventanas de 30 s | Mayor precision que whisper-small en la mayoria de idiomas; cifras no incluidas aqui | Apache 2.0 | HuggingFace |

No se dispone de comparativas con adaptadores equivalentes para hausa (por ejemplo variantes de MMS o XLS-R ajustadas al mismo idioma) dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento fiable.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar si el uso comercial esta permitido. Es un riesgo legal directo para cualquier integracion en produccion.
- Dataset de entrenamiento no identificado (aparece como "None" en la model card): no se puede evaluar la composicion, el dominio, la calidad de las transcripciones ni los posibles sesgos.
- Idioma no declarado formalmente: el hausa es una inferencia a partir del sufijo del identificador; si el uso previsto es otro idioma, no hay garantia alguna.
- WER de 15,22 % sobre un conjunto de evaluacion no descrito: la cifra no es comparable con resultados publicados en Common Voice, FLEURS o LibriSpeech, y probablemente sea insuficiente para transcripcion automatica sin supervision humana.
- Riesgo de alucinacion: Whisper tiende a generar texto plausible en segmentos con silencio, ruido o audio ininteligible; este comportamiento se hereda del modelo base.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar `therealbee/whisper-small-ha-finetuned`, cuyo estado, licencia y calidad tampoco estan documentados.
- Rendimiento decreciente en el ultimo tramo del entrenamiento: el WER empeoro ligeramente del paso 800 (15,1118) al 1000 (15,2170), lo que sugiere sobreajuste o ruido en la evaluacion.
- Adopcion nula: 0 descargas y 0 likes; no hay evidencia de validacion por parte de terceros ni de uso en produccion.
- Model card autogenerada sin revision: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" aparecen como "More information needed".
- Fecha de creacion registrada como 2026-09-18 y ultima actualizacion 2026-09-19, sin historial de versiones adicional.
- Limitaciones propias de Whisper small: menor precision que whisper-medium o large en acentos, ruido de fondo y audio telefónico de banda estrecha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/therealbee/whisper-small-ha-lora-v2
- Modelo base: https://huggingface.co/therealbee/whisper-small-ha-finetuned
- Paper de referencia de la arquitectura base (Whisper, Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de Transformers: https://github.com/huggingface/transformers

Nota: las busquedas web realizadas no devolvieron resultados relacionados con este modelo (los enlaces obtenidos tratan sobre agregadores de NFT, DeFi y puentes cross-chain), por lo que no se incluyen como referencias.
