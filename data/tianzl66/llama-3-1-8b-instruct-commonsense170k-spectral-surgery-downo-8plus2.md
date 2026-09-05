# tianzl66/Llama-3.1-8B-Instruct-CommonSense170K-Spectral-Surgery-DownO-8Plus2

## Resumen

Este modelo es un adaptador PEFT LoRA sobre `meta-llama/Llama-3.1-8B-Instruct`, desarrollado por `tianzl66` para investigar la aplicacion de *Spectral Surgery* post-hoc sobre los pesos de un adaptador LoRA. El adaptador fue entrenado durante 2 epocas en el dataset Commonsense170K, con rank 16 y alpha 32, y posteriormente se aplico una edicion espectral mediante el algoritmo Hybrid Newton-Schulz (HNS) sobre las proyecciones `down_proj` y `o_proj`, sin entrenamiento adicional con gradientes. El resultado es un adaptador de bajo coste (0.2 GB) que mantiene la arquitectura Transformer decoder-only del modelo base, con una ventana de contexto de hasta 128k tokens, y que ofrece una ligera variacion en el rendimiento sobre tareas de razonamiento de sentido comun en comparacion con el adaptador LoRA original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B-Instruct) + adaptador LoRA |
| Parametros totales | 8B (modelo base) + adaptador LoRA rank 16 (~0.2 GB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (modelo base); evaluacion con 2048 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (dataset de entrenamiento en ingles) |
| Licencia | no disponible (adaptador); modelo base bajo Llama 3.1 Community License |
| Formato de pesos | safetensors (adaptador PEFT) + adapter_config.json |

## Arquitectura y entrenamiento

El modelo base es un Transformer decoder-only de 8B parametros con atencion por cabezas y ventana de contexto de 128k tokens. Sobre el se anade un adaptador LoRA con rank 16 y alpha 32, dirigido a las capas `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizo durante 2 epocas sobre el dataset Commonsense170K, sin que se haya especificado el numero total de tokens ni la composicion exacta del dataset.

La innovacion tecnica destacable es la aplicacion de *Spectral Surgery* post-hoc mediante Hybrid Newton-Schulz (HNS). Este proceso edita directamente los pesos del adaptador LoRA en las capas `down_proj` y `o_proj`, con 8 pasos rapidos y 2 pasos estables, sin realizar ningun entrenamiento adicional basado en gradientes. El objetivo es modificar la estructura espectral de las matrices del adaptador para mejorar o ajustar el comportamiento del modelo en tareas de razonamiento de sentido comun.

## Capacidades

- Razonamiento de sentido comun evaluado en ocho tareas: BoolQ, PIQA, SocialIQA, HellaSwag, WinoGrande, ARC-Easy, ARC-Challenge y OpenBookQA.
- Generacion de texto instructivo heredada del modelo base Llama-3.1-8B-Instruct.
- Soporte de tool calling y function calling del modelo base, aunque no se ha evaluado especificamente en este adaptador.
- Capacidades multilingues del modelo base, pero el adaptador fue entrenado en un dataset en ingles y no se aportan datos sobre otros idiomas.
- Sin capacidades de vision ni audio.
- El adaptador es compatible con el ecosistema PEFT de Hugging Face, lo que permite cargarlo sobre el modelo base con `peft`.

## Casos de uso

- Evaluacion de razonamiento de sentido comun en pipelines de NLP: el adaptador puede integrarse en entornos de evaluacion como vLLM para medir el rendimiento en benchmarks de sentido comun, tal como se hizo en la model card, con `max_new_tokens=8` y plantilla de chat del tokenizer.
- Investigacion en edicion de pesos de LoRA: el modelo sirve como caso de estudio para analizar como Spectral Surgery con HNS afecta a las proyecciones `down_proj` y `o_proj`, sin necesidad de reentrenar el adaptador.
- Prototipado rapido de asistentes de preguntas y respuestas en ingles: al estar basado en Llama-3.1-8B-Instruct, puede usarse en sistemas de QA de dominio general, especialmente en escenarios donde se requiere una ventana de contexto larga.
- Experimentos academicos sobre adaptadores de bajo rango: el adaptador permite comparar el rendimiento entre un LoRA estandar y un LoRA editado espectralmente, con un coste de almacenamiento minimo.
- Integracion en sistemas de recomendacion con razonamiento de sentido comun: el modelo puede incorporarse en motores que necesiten clasificar o puntuar opciones basandose en conocimiento comun, dado su entrenamiento en Commonsense170K.
- Despliegue en entornos con recursos limitados: al ser un adaptador de 0.2 GB, puede combinarse con el modelo base cuantizado para ejecutarse en GPUs de consumo, manteniendo un coste de inferencia moderado.

## Benchmarks y rendimiento

La model card incluye una evaluacion comparativa entre el adaptador LoRA original y el adaptador tras aplicar Spectral Surgery. La evaluacion se realizo con vLLM, decodificacion greedy, `max_new_tokens=8`, longitud maxima de 2048 y semilla 42.

| Tarea | LoRA | + Spectral Surgery (o_proj + down_proj, 8+2) |
|---|---:|---:|
| BoolQ | 88.0122% | 88.1346% |
| PIQA | 89.6083% | 89.4450% |
| SocialIQA | 82.0880% | 81.4739% |
| HellaSwag | 93.6566% | 93.2484% |
| WinoGrande | 88.7924% | 88.3189% |
| ARC-Easy | 93.8552% | 93.8973% |
| ARC-Challenge | 85.3242% | 85.5802% |
| OpenBookQA | 90.4000% | 90.6000% |
| Macro | 88.9671% | 88.8373% |
| Micro | 90.7311% | 90.4947% |
| Correct | 20,341 / 22,419 | 20,288 / 22,419 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B en FP16 requiere aproximadamente 16 GB de VRAM; el adaptador LoRA anade un coste minimo. Con cuantizacion de 4 bits, la VRAM necesaria puede reducirse a unos 6 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 40/80 GB o H100 para inferencia sin cuantizacion.
- Compatibilidad con GPUs de consumo: si, el modelo puede ejecutarse en RTX 3090 o 4090 con cuantizacion 4 bits, siempre que se cargue el adaptador sobre el modelo base.
- Opciones de despliegue: vLLM con soporte para LoRA, Hugging Face Transformers con PEFT, o fusion del adaptador en el modelo base para exportarlo a otros formatos. No se recomienda llama.cpp directamente sin fusionar previamente el adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Macro | Micro |
|---|---|---|---|---|
| Llama-3.1-8B-Instruct (base) | 8B | 128k | no disponible | no disponible |
| LoRA (sin Spectral Surgery) | 8B + adaptador | 128k | 88.9671% | 90.7311% |
| LoRA + Spectral Surgery (este modelo) | 8B + adaptador | 128k | 88.8373% | 90.4947% |

No se dispone de datos de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia del adaptador no esta especificada, lo que supone un riesgo legal para uso comercial; el modelo base esta sujeto a la Llama 3.1 Community License, que impone restricciones de uso.
- El dataset Commonsense170K esta en ingles y puede reflejar sesgos culturales y linguisticos de Occidente.
- El rendimiento en macro y micro es ligeramente inferior al del adaptador LoRA original en la evaluacion presentada, por lo que la edicion espectral no siempre mejora todas las metricas.
- La evaluacion se limito a tareas de sentido comun con una longitud maxima de 8 tokens generados; no se evaluaron capacidades de generacion larga, tool calling ni codigo.
- Existe riesgo de alucinacion inherente a los modelos generativos, especialmente en escenarios de preguntas abiertas.
- El adaptador es un artefacto de investigacion experimental y no ha sido validado en entornos de produccion.

## Enlaces

- HuggingFace: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-CommonSense170K-Spectral-Surgery-DownO-8Plus2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Adaptador similar de tianzl66: https://huggingface.co/tianzl66/Llama-3.1-8B-Instruct-InstructionFollowing-SpectralSurgery-HNS8p2
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web.
