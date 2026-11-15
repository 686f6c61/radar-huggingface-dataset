# taemin-park/whisper-small-two-tongues-model1

## Resumen

`taemin-park/whisper-small-two-tongues-model1` es un adaptador LoRA (PEFT) entrenado sobre el modelo de reconocimiento automatico del habla `openai/whisper-small`. Lo publica el usuario taemin-park en Hugging Face y su nombre interno en la model card es `whisper-small-switchnote-run2`. Se trata, por tanto, de un fine-tuning ligero que no reentrena los pesos completos de Whisper, sino que anade matrices de bajo rango sobre el modelo base de 244 millones de parametros.

El modelo resuelve la tarea de transcripcion de audio a texto (ASR) en un dominio o conjunto de datos no especificado (la model card indica literalmente `None` como dataset). El resultado declarado por el autor es una perdida de validacion de 1,3724 y un WER (word error rate) de 27,8921 sobre el conjunto de evaluacion, obtenido tras cinco epocas de entrenamiento.

Su relevancia practica es limitada: se trata de un experimento de fine-tuning con muy poca difusion (9 descargas, 0 likes) y sin documentacion sobre el corpus de entrenamiento, los idiomas cubiertos ni los casos de uso previstos. Resulta util como referencia tecnica de como aplicar LoRA sobre Whisper-small, pero no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Whisper-small (transformer encoder-decoder para ASR) |
| Parametros totales | No disponible (el adaptador LoRA es un subconjunto; el modelo base tiene 244 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (Whisper-small base admite ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) aplicado sobre `openai/whisper-small`, un transformer encoder-decoder disenado para reconocimiento automatico del habla que procesa espectrogramas de audio de hasta 30 segundos y genera texto autoregresivamente. El adaptador congela los pesos originales de Whisper y entrena unicamente matrices de bajo rango, lo que explica el tamano reducido del repositorio (0,2 GB).

El entrenamiento se realizo con PEFT 0.21.2, Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. Los hiperparametros fueron: learning rate 1e-05, batch de entrenamiento 16, batch de evaluacion 8, semilla 314, optimizador AdamW (`ADAMW_TORCH_FUSED`, betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal con 20 pasos de warmup, 5 epocas y AMP nativo. El dataset de entrenamiento no se especifica en la model card. No se documenta el uso de RLHF, DPO ni tecnicas adicionales de alineamiento.

## Capacidades

- Transcripcion de audio a texto (ASR) mediante el modelo base Whisper-small, especializada por el adaptador LoRA.
- Generacion de texto derivada de la salida de transcripcion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de vision, audio adicional (mas alla de ASR) ni modo de razonamiento explicito.

## Casos de uso

- Experimentacion academica con LoRA sobre Whisper: el adaptador sirve como ejemplo reproducible de fine-tuning de un modelo ASR con PEFT, util para estudiar el efecto del learning rate y el numero de epocas sobre el WER.
- Prototipado de transcripcion en un dominio especifico: si el corpus de entrenamiento coincide con el dominio del usuario (no documentado), el adaptador podria mejorar la transcripcion frente al Whisper-small original en ese dominio concreto.
- Base para comparativas de fine-tuning: dado que se publican las curvas de perdida y WER por epoca, puede usarse como referencia en estudios de ablacion de adaptadores LoRA.
- Integracion en pipelines de Hugging Face Transformers: al cargarse como adaptador PEFT, puede combinarse con el modelo base en entornos que ya usan la libreria `transformers`.
- Docencia y formacion: util como caso practico de entrenamiento de ASR con LoRA y de interpretacion de metricas WER.
- Reproduccion de experimentos: los hiperparametros y semilla estan documentados, lo que permite reproducir el entrenamiento si se dispone del dataset original (no publicado).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (metrica WER sobre el conjunto de evaluacion):

| Epoca | Paso | Perdida de validacion | WER |
|---|---|---|---|
| 1,0 | 45 | 3,0159 | 32,7182 |
| 2,0 | 90 | 1,9910 | 31,2988 |
| 3,0 | 135 | 1,5876 | 27,3243 |
| 4,0 | 180 | 1,4229 | 27,2534 |
| 5,0 | 225 | 1,3724 | 27,8921 |

El mejor WER se alcanza en la epoca 4 (27,2534) y empeora ligeramente en la epoca 5 (27,8921), lo que sugiere un inicio de sobreajuste. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en si ocupa muy poco (0,2 GB en disco), pero requiere cargar el modelo base Whisper-small (unos 1 GB en fp32, aproximadamente 0,5 GB en fp16).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM puede ejecutar Whisper-small en fp16; una RTX 3060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (GTX 1660 en adelante) e incluso en CPU para inferencia puntual.
- Opciones de despliegue: `transformers` con PEFT (carga del adaptador), potencialmente exportable a otros runtimes ASR, aunque no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (estos estan orientados a LLM, no a ASR).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| taemin-park/whisper-small-two-tongues-model1 | Adaptador LoRA sobre 244 M | Ventanas de 30 s (base) | 27,89 (conjunto de evaluacion propio) | Apache 2.0 | Hugging Face, 9 descargas |
| openai/whisper-small | 244 M | Ventanas de 30 s | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado |
| openai/whisper-base | 74 M | Ventanas de 30 s | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-medium | 769 M | Ventanas de 30 s | No disponible en esta ficha | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks comparables en la informacion proporcionada para establecer una comparacion cuantitativa fiable frente a alternativas.

## Limitaciones y advertencias

- El dataset de entrenamiento no esta documentado (la model card indica `None`), por lo que se desconoce el dominio y los idiomas cubiertos.
- El WER de 27,89 es alto en terminos absolutos y no se compara con el WER del modelo base, por lo que no puede afirmarse que el adaptador mejore a Whisper-small.
- Riesgo de sobreajuste: el WER empeora en la epoca 5 respecto a la 4.
- No hay informacion sobre sesgos, alucinaciones en transcripcion ni comportamiento en audio ruidoso.
- Licencia Apache 2.0 permite uso comercial del adaptador, pero el modelo base Whisper-small tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Modelo con muy poca difusion y sin validacion externa: no recomendado para produccion sin evaluacion propia.
- No se documentan limitaciones de contexto o idioma mas alla de las propias de Whisper-small (ventanas de 30 s).

## Enlaces

- Hugging Face: https://huggingface.co/taemin-park/whisper-small-two-tongues-model1
- Modelo base: https://huggingface.co/openai/whisper-small
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria Transformers: https://github.com/huggingface/transformers
