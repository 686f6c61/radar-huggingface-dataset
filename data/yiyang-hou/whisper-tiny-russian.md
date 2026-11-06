# Yiyang-hou/whisper-tiny-russian

## Resumen

Whisper tiny Russian es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, publicado por el usuario Yiyang-hou en Hugging Face. El modelo parte de la arquitectura encoder-decoder transformer de Whisper en su variante mas pequena, con 37.760.640 parametros totales, y ha sido entrenado sobre el dataset naharte/russian_english para transcripcion de audio. El repositorio ocupa 0,3 GB y los pesos se distribuyen en formato safetensors.

El modelo se presenta como un ajuste realizado con la libreria Transformers (version 5.23.0.dev0) y PyTorch 2.11.0+cu130, generado automaticamente mediante la clase Trainer. La model card indica que alcanza un WER de 9,9415 y una perdida de validacion de 0,2263 tras 2000 pasos de entrenamiento, aunque se trata de resultados no verificados por el hub (verified: false) y medidos sobre el split de entrenamiento del dataset, no sobre un conjunto de test independiente.

Su relevancia es limitada: se trata de un experimento de ajuste fino de un modelo tiny sobre un dataset concreto, con documentacion minima ("More information needed" en varias secciones de la model card) y sin validacion externa. Resulta util como referencia para quienes quieran reproducir el pipeline de fine-tuning de Whisper en contextos bilingues ruso-ingles, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (encoder-decoder transformer) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny usa ventanas de audio de 30 s en su configuracion original, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder disenado para ASR, con procesamiento de audio en representaciones log-Mel y decodificacion autorregresiva de tokens de texto. No se documentan modificaciones arquitectonicas respecto al modelo base; el trabajo consiste exclusivamente en un ajuste fino supervisado.

El entrenamiento se realizo sobre el dataset naharte/russian_english con los siguientes hiperparametros: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. La perdida de entrenamiento descendio de 0,1726 a 0,0782 entre las dos evaluaciones registradas, mientras que la perdida de validacion paso de 0,2404 a 0,2263. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del modelo.
- Fine-tuning especifico sobre un dataset bilingue ruso-ingles (naharte/russian_english), aunque los metadatos solo declaran el idioma ingles.
- Generacion de transcripciones con el tokenizer y el feature extractor estandar de Whisper.
- Compatible con la pipeline `automatic-speech-recognition` de Transformers.
- No se documentan capacidades de tool calling, agentes, vision, audio mas alla de ASR, ni modos de razonamiento extendido.
- Capacidades multilingues: no confirmadas; el campo `language` del repositorio solo lista `en`.

## Casos de uso

- Transcripcion de audio en entornos de investigacion: util como punto de partida reproducible para experimentar con fine-tuning de Whisper tiny sobre datasets propios bilingues ruso-ingles.
- Prototipado rapido de pipelines ASR: al ocupar solo 0,3 GB y 37,8 M de parametros, permite iterar en local sin GPU dedicada.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como baseline para medir el impacto de hiperparametros (learning rate, warmup, batch) en tareas ASR de bajo recursos.
- Docencia y formacion: ejemplo compacto de como se estructura un repositorio `generated_from_trainer` con model-index y metricas WER.
- Pruebas de integracion con Transformers: validacion de compatibilidad con la version 5.23.0.dev0 y el ecosistema de tokenizers 0.23.3.
- Transcripcion de audio de baja latencia en dispositivos con recursos limitados, siempre que el dominio linguistico coincida con el dataset de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | naharte/russian_english | train | 9,9415 |
| Loss (validacion) | naharte/russian_english | no especificado | 0,2263 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,1726 | 1,0707 | 1000 | 0,2404 | 10,6534 |
| 0,0782 | 2,1413 | 2000 | 0,2263 | 9,9415 |

No se han publicado comparaciones con otros modelos ni resultados sobre benchmarks estandar (LibriSpeech, Common Voice, FLEURS) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,8 M de parametros); en la practica, menos de 500 MB con cuantizacion a 8 bits, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, y en CPU con latencia aceptable para audios cortos.
- Opciones de despliegue: Transformers (pipeline `automatic-speech-recognition`), potencialmente llama.cpp/Ollama no aplican por ser un modelo de audio; vLLM y TGI no estan orientados a Whisper de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yiyang-hou/whisper-tiny-russian | 37,8 M | no disponible | 9,9415 (dataset propio) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |
| openai/whisper-base | 74 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face |

La comparacion con alternativas de la misma categoria (otros fine-tunings de Whisper tiny para ruso) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La model card contiene secciones sin completar ("More information needed") en descripcion, usos previstos, limitaciones y datos de entrenamiento.
- El WER reportado se mide sobre el split de entrenamiento del dataset, no sobre un conjunto de test independiente, por lo que no es una estimacion fiable de generalizacion.
- Los resultados estan marcados como no verificados en el model-index.
- El campo `language` solo declara `en`, aunque el dataset se llama russian_english; la cobertura real del ruso no esta confirmada.
- Riesgo de alucinacion y de transcripciones incorrectas fuera del dominio del dataset de entrenamiento.
- No se documentan sesgos conocidos ni evaluaciones de robustez.
- Licencia apache-2.0 permite uso comercial, pero la falta de documentacion y validacion desaconseja su uso en produccion sin evaluacion adicional.
- El modelo depende de la version de desarrollo de Transformers (5.23.0.dev0), lo que puede generar incompatibilidades con versiones estables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yiyang-hou/whisper-tiny-russian
- README del repositorio: https://huggingface.co/Yiyang-hou/whisper-tiny-russian/blob/main/README.md
- Modelo base openai/whisper-tiny: https://huggingface.co/openai/whisper-tiny
- Dataset naharte/russian_english: https://huggingface.co/datasets/naharte/russian_english
