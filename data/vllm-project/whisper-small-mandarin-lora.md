# vllm-project/whisper-small-mandarin-lora

## Resumen

Whisper Small Mandarin LoRA es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo de reconocimiento automatico del habla `openai/whisper-small`, especializado en transcripcion de mandarin (`zh`). Lo publica la organizacion `vllm-project` como copia de un checkpoint original alojado en la cuenta personal de Chengyi Li, con el objetivo explicito de reducir el riesgo de cadena de suministro en los flujos de integracion continua de vLLM. El adaptador se entrena sobre el split en mandarin del dataset Common Voice 24.0 de Mozilla.

El modelo base Whisper Small es un transformer encoder-decoder de 244 millones de parametros con una ventana de contexto de audio de 30 segundos por inferencia. El adaptador LoRA modifica unicamente un subconjunto de pesos, por lo que el repositorio es extremadamente ligero (0.0 GB declarados en HuggingFace) y requiere cargar el modelo base por separado. La licencia es Apache 2.0 tanto para el adaptador como, de forma heredada, para el modelo base.

Su relevancia es acotada pero concreta: sirve como ejemplo reproducible de fine-tuning de Whisper para un idioma especifico con PEFT, y como artefacto de test en la infraestructura de vLLM. No es un modelo de proposito general ni compite con sistemas ASR de produccion de gran escala; es un adaptador de investigacion con un CER de validacion de 12.90 sobre Common Voice 24 en mandarin.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) con adaptador LoRA sobre el modelo base `openai/whisper-small` |
| Parametros totales | No disponible para el adaptador (el modelo base `whisper-small` tiene 244 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada |
| Idiomas soportados | Chino mandarin (`zh`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `openai/whisper-small`, un transformer encoder-decoder disenado para ASR que convierte espectrogramas Mel en tokens de texto. El entrenamiento se realiza con PEFT 0.18.1 sobre Transformers 4.52.0 y PyTorch 2.9.1 (CUDA 12.8), congelando los pesos del modelo base y entrenando unicamente las matrices de bajo rango de LoRA. El dataset es Common Voice 24.0 en su split de mandarin.

Los hiperparametros declarados son: learning rate 1e-5, batch de entrenamiento 16, batch de evaluacion 8, semilla 42, optimizador AdamW (betas 0.9/0.999, epsilon 1e-8), scheduler lineal con 500 pasos de warmup, 40 000 pasos de entrenamiento y precision mixta nativa (AMP). La perdida de entrenamiento cae de 0.4032 en el paso 1000 a 0.0003 en el paso 40 000, mientras que la perdida de validacion alcanza su minimo en torno al paso 4000 (0.3155) y luego asciende hasta 0.4541 al final, senal clara de sobreajuste a partir de ese punto. El CER de validacion, en cambio, mejora de forma sostenida hasta estabilizarse en torno al 12.87-12.90 % en los ultimos pasos.

## Capacidades

- Transcripcion de voz a texto en chino mandarin (`zh`) a partir de audio de hasta 30 segundos por ventana.
- Reconocimiento de habla continuo con salida de texto en caracteres chinos.
- Fine-tuning ligero mediante LoRA sobre el modelo base, lo que permite cargar y descargar el adaptador de forma independiente.
- Integracion con el ecosistema PEFT/Transformers (carga mediante `PeftModel`).
- No soporta tool calling, function calling, razonamiento multi-paso ni agentes: es un modelo puramente ASR.
- No dispone de capacidades de vision, audio generativo ni traduccion mas alla de la transcripcion.
- Capacidades multilingues limitadas: el adaptador esta entrenado solo para mandarin; el modelo base soporta mas idiomas, pero este adaptador no los cubre.

## Casos de uso

- Transcripcion de reuniones y llamadas en mandarin: el adaptador convierte audio de hasta 30 segundos por ventana en texto, adecuado para pipelines que segmentan llamadas largas en trozos y concatenan las transcripciones.
- Subtitulado automatico de contenido audiovisual en chino: util para generar subtitulos en plataformas de video o archivos de medios en mandarin, con un CER de referencia del 12.9 % sobre Common Voice 24.
- Analisis de encuestas y entrevistas cualitativas: transcripcion de respuestas habladas en mandarin para su posterior analisis de texto o etiquetado.
- Prototipado de asistentes de voz en chino: el tamano reducido del modelo base (244 M) y la ligereza del adaptador permiten iterar rapido en entornos de desarrollo con GPUs modestas.
- Validacion de pipelines ASR en CI: el propio autor declara que vLLM usa este checkpoint en sus pruebas de integracion continua, por lo que sirve como fixture de test para flujos de audio a texto.
- Investigacion en adaptacion de dominio con PEFT: el adaptador es un ejemplo reproducible de fine-tuning LoRA sobre Whisper con hiperparametros y curvas de entrenamiento documentadas, util para experimentos academicos.
- Transcripcion offline en dispositivos con recursos limitados: al requerir solo el modelo base pequeno mas un adaptador ligero, puede desplegarse en entornos con poca VRAM.

## Benchmarks y rendimiento

Los unicos resultados publicados por el autor son los de validacion sobre Common Voice 24 en mandarin. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, WER/CER sobre otros conjuntos) en la informacion disponible.

| Metrica | Valor |
|---|---|
| Loss de validacion final | 0.4541 |
| CER de validacion final | 12.8966 % |
| Loss de validacion minima | 0.3155 (paso 4000) |
| CER de validacion minima | 12.8735 % (paso 39000) |
| Pasos de entrenamiento | 40 000 |
| Epocas | 21.6450 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base `whisper-small` (244 M de parametros) ocupa aproximadamente 0.5 GB en FP16 y en torno a 0.25 GB en INT8; el adaptador LoRA anade una cantidad marginal de memoria (no disponible el numero exacto de parametros del adaptador).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; tambien cabe en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: si, con amplio margen, incluso en GPUs de gama baja con 4-6 GB de VRAM.
- Opciones de despliegue: Transformers con PEFT (`PeftModel.from_pretrained`), vLLM (el propio repositorio se mantiene para CI de vLLM), y potencialmente llama.cpp u Ollama si se exporta el modelo fusionado a GGUF (no confirmado en la informacion disponible).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | CER (mandarin) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-small-mandarin-lora (este) | 244 M (base) + adaptador | 30 s de audio por ventana | 12.90 % (Common Voice 24) | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244 M | 30 s de audio por ventana | No disponible en la informacion | Apache 2.0 | HuggingFace |
| openai/whisper-medium | 769 M | 30 s de audio por ventana | No disponible en la informacion | Apache 2.0 | HuggingFace |
| openai/whisper-large-v3 | 1550 M | 30 s de audio por ventana | No disponible en la informacion | Apache 2.0 | HuggingFace |

No se dispone de resultados comparativos de CER en mandarin para los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa de rendimiento no es posible.

## Limitaciones y advertencias

- Sobreajuste evidente: la perdida de validacion minima se alcanza en el paso 4000 (0.3155) y asciende hasta 0.4541 en el paso 40 000, mientras la perdida de entrenamiento cae a 0.0003. El checkpoint final no es el mejor en terminos de perdida.
- El CER de validacion (12.90 %) es moderado para produccion; puede no ser suficiente para aplicaciones que requieran alta precision en dominios especificos (medico, legal, nombres propios).
- Entrenado unicamente con Common Voice 24 en mandarin, un dataset de audio leido y relativamente limpio; el rendimiento puede degradarse con audio ruidoso, acentos no representados o habla espontanea.
- Solo soporta mandarin en este adaptador; no cubre otros dialectos chinos ni otros idiomas.
- Es un adaptador LoRA, no un modelo autonomo: requiere el modelo base `openai/whisper-small` y la libreria PEFT para funcionar.
- La model card original esta incompleta (secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" marcadas como "More information needed").
- Riesgo de alucinacion en ASR: Whisper puede generar texto plausible cuando el audio es ininteligible o contiene silencios largos; se recomienda validacion humana en entornos de produccion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- El repositorio es una copia de un checkpoint en una cuenta personal, mantenida por vLLM para CI; puede no recibir actualizaciones ni correcciones.

## Enlaces

- HuggingFace: https://huggingface.co/vllm-project/whisper-small-mandarin-lora
- Checkpoint original (cuenta personal del autor): https://huggingface.co/chengyili2005/whisper-small-mandarin-lora
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset Common Voice 24.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_24
- Repositorio vLLM: https://github.com/vllm-project/vllm
