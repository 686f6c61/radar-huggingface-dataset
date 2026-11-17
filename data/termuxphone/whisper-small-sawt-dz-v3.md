# Termuxphone/whisper-small-sawt-dz-v3

## Resumen

whisper-small-sawt-dz-v3 es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-small, publicado por el usuario Termuxphone en Hugging Face. El modelo parte de la arquitectura transformer encoder-decoder de Whisper, con 241.734.912 parametros totales en formato safetensors y un repositorio de 1,9 GB. El nombre sugiere un ajuste orientado a una variante linguistica arabe (sawt, "voz" en arabe; dz, posible referencia a Argelia), aunque la model card no documenta explicitamente el conjunto de datos ni los idiomas cubiertos.

El modelo se distribuye bajo licencia Apache 2.0 y es compatible con la libreria transformers y con endpoints compatibles. Su relevancia es limitada: se trata de un experimento de ajuste fino con un WER de 77,9487 en el conjunto de evaluacion, un valor muy alto que indica un rendimiento pobre para transcripcion general. Resulta util principalmente como caso de estudio de fine-tuning de Whisper en dominios o variedades dialectales muy especificas, no como modelo de produccion.

La model card esta generada automaticamente por el Trainer y no incluye descripcion de datos, usos previstos ni limitaciones, por lo que gran parte de la informacion tecnica relevante no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper-small trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de openai/whisper-small: un transformer encoder-decoder entrenado originalmente para transcripcion y traduccion de voz, con entrada de audio en ventanas de 30 segundos y salida de tokens de texto. El ajuste fino se realizo con el Trainer de transformers (version 5.22.1) sobre PyTorch 2.14.1+cu130, con AdamW fused, learning rate de 1e-05, batch total de 16 (batch 8 con acumulacion de 2), scheduler lineal con 50 pasos de warmup, 8 epocas y precision mixta nativa (AMP). El conjunto de datos de entrenamiento no se especifica en la model card ("None dataset").

El entrenamiento consta de 344 pasos en total (43 por epoca). La perdida de entrenamiento cae de 2,9596 a 0,3212, mientras que la perdida de validacion toca minimo en la epoca 3 (1,1509) y vuelve a subir hasta 1,3046 en la epoca 8, lo que indica sobreajuste a partir de la tercera o cuarta epoca. No se documenta el uso de RLHF, DPO ni ninguna innovacion tecnica adicional.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto mediante la pipeline automatic-speech-recognition de transformers.
- Ajuste fino orientado presumiblemente a una variedad dialectal arabe (por el nombre "sawt-dz"), aunque no confirmado en la documentacion.
- Compatibilidad con endpoints compatibles con la API de Hugging Face.
- No se documentan capacidades de traduccion, deteccion de idioma, tool calling, agentes, vision ni audio mas alla de la transcripcion.
- No se documenta soporte multilingue explicito; los idiomas no estan disponibles en la metadata.

## Casos de uso

- Experimentacion academica con fine-tuning de Whisper: el modelo sirve como referencia de como ajustar whisper-small con pocos recursos (344 pasos) y que efectos tiene en el WER; util para comparar hiperparametros en trabajos de investigacion sobre ASR de bajo recurso.
- Transcripcion de audio en una variedad dialectal concreta (posiblemente arabe argelino): si el conjunto de evaluacion refleja el dominio objetivo, el modelo podria usarse en pruebas exploratorias de transcripcion de habla dialectal, siempre asumiendo un WER elevado.
- Prototipado de pipelines ASR en transformers: al ser un checkpoint pequeno (241 M de parametros, 1,9 GB), permite iterar rapidamente en local con la pipeline de transformers antes de escalar a modelos mayores.
- Base para nuevos ajustes finos: el checkpoint puede servir como punto de partida para fine-tuning adicional sobre otros corpus, dado su bajo coste computacional.
- Demostraciones y docencia: ejemplo practico de un modelo "generated_from_trainer" para explicar el flujo de entrenamiento de Whisper y la interpretacion de curvas de perdida y WER.
- Evaluacion de sobreajuste en ASR: las curvas de entrenamiento y validacion permiten estudiar el punto de sobreajuste en fine-tuning de modelos de voz con datasets pequenos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluacion no especificado):

| Metrica | Valor |
|---|---|
| Loss (evaluacion final) | 1,3046 |
| WER (evaluacion final) | 77,9487 |

Evolucion del WER por epoca segun la model card:

| Epoca | Validation loss | WER |
|---|---|---|
| 1 | 1,3440 | 85,1282 |
| 2 | 1,1910 | 82,0513 |
| 3 | 1,1509 | 78,9744 |
| 4 | 1,1812 | 79,1453 |
| 5 | 1,2332 | 77,0940 |
| 6 | 1,2579 | 77,7778 |
| 7 | 1,2922 | 78,2906 |
| 8 | 1,3046 | 77,9487 |

No se han publicado comparaciones con otros modelos en la informacion disponible. El model-index no contiene resultados adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (241 M de parametros) mas overhead de activaciones y buffers de audio; en la practica, menos de 2 GB.
- VRAM estimada en fp16/bf16: en torno a 0,5 GB para pesos, con margen para activaciones.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU para audios cortos.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), endpoints compatibles; no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI (Whisper no es un modelo de texto puro, por lo que estas herramientas no aplican directamente).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-sawt-dz-v3 | 241,7 M | ventanas de 30 s (heredado) | 77,95 (conjunto no especificado) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 241,7 M | ventanas de 30 s | no disponible en esta ficha (referencia base) | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | ventanas de 30 s | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion cuantitativa con los modelos base no puede realizarse con los datos proporcionados; el WER de 77,95 del ajuste es sustancialmente peor que el rendimiento tipico de whisper-small en benchmarks estandar, lo que sugiere que el conjunto de evaluacion es muy especifico o de baja calidad.

## Limitaciones y advertencias

- WER de 77,9487 en el conjunto de evaluacion: rendimiento muy bajo para transcripcion; no apto para produccion sin validacion adicional.
- Sobreajuste evidente: la perdida de validacion minima se alcanza en la epoca 3 y aumenta hasta la epoca 8, mientras el WER se estanca alrededor del 77-78 %.
- La model card no documenta el conjunto de datos de entrenamiento ni el de evaluacion, por lo que no se puede verificar la representatividad del modelo.
- Idiomas no declarados en la metadata; el nombre sugiere arabe dialectal pero no esta confirmado.
- Riesgo de alucinacion en transcripcion: como todo modelo Whisper, puede generar texto plausible no presente en el audio, especialmente con ruido o acentos no vistos.
- Sesgos desconocidos: al no documentarse la composicion del corpus, no se pueden evaluar sesgos de genero, dialecto o dominio.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion y el alto WER desaconsejan su uso en produccion sin una evaluacion propia.
- Sin garantias de mantenimiento: el autor no ha publicado documentacion adicional ni actualizaciones mas alla de la creacion del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Termuxphone/whisper-small-sawt-dz-v3
- Modelo base: https://huggingface.co/openai/whisper-small
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
