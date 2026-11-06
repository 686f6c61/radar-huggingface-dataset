# Yiyang-hou/whisper-tiny-spanish

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) de `openai/whisper-tiny`, el modelo de reconocimiento automatico del habla (ASR) mas pequeno de la familia Whisper de OpenAI. Lo desarrolla el usuario Yiyang-hou y se publica en Hugging Face bajo licencia Apache 2.0. El modelo parte de una arquitectura transformer encoder-decoder de tipo seq2seq, con 37,7 millones de parametros en total segun los pesos en safetensors, y esta pensado para transcripcion de audio a texto.

El ajuste se ha realizado sobre el dataset `naharte/spanish_english`, con un total de 2000 pasos de entrenamiento y una tasa de aprendizaje muy baja (1e-05). A pesar del nombre "spanish" del repositorio, la model card declara unicamente el idioma `en` en sus metadatos, lo que genera una ambiguedad relevante sobre el alcance real del modelo en castellano. El resultado declarado es un WER de 12,46 sobre el conjunto de evaluacion del propio dataset de entrenamiento.

Su relevancia practica es limitada: se trata de un experimento de fine-tuning de un modelo tiny, con solo 34 descargas y 0 likes en el momento de la consulta, y sin documentacion sustantiva (la model card contiene multiples secciones con "More information needed"). Resulta util como ejemplo de pipeline de ajuste o para prototipado rapido en entornos con recursos muy limitados, no como solucion de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, seq2seq) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny trabaja con ventanas de audio de 30 s; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | en (declarado en la model card); el nombre del repositorio sugiere espanol pero no esta declarado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `openai/whisper-tiny`: un transformer encoder-decoder que procesa espectrogramas Mel de audio y genera tokens de texto de forma autoregresiva. Con 37,7 millones de parametros, es la variante mas pequena de la familia Whisper, lo que implica una capacidad limitada para vocabulario amplio, acentos marcados y audio con ruido.

El entrenamiento consistio en un fine-tuning supervisado sobre el dataset `naharte/spanish_english` (split `train`), con los siguientes hiperparametros declarados: learning rate 1e-05, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup y 2000 pasos totales. No se documenta el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de RLHF, DPO o aumentacion de datos. La model card indica que fue generada automaticamente por el Trainer de Hugging Face y no ha sido revisada por el autor.

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto, tarea principal del pipeline `automatic-speech-recognition`.
- Generacion de texto derivada de la decodificacion del audio, con la capacidad multilingue heredada del Whisper original (aunque el ajuste solo declara `en`).
- Compatible con la libreria `transformers` y con `endpoints_compatible` segun los tags del repositorio.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio mas alla de la transcripcion.
- No se documenta modo "thinking", salida estructurada ni marcas de tiempo (timestamps) verificadas.

## Casos de uso

- Prototipado rapido de transcripcion: por su tamano (37,7 M de parametros) puede ejecutarse en CPU o en GPUs de gama baja para validar un pipeline ASR antes de invertir en un modelo mayor.
- Pruebas de fine-tuning educativo: sirve como ejemplo reproducible de ajuste de Whisper tiny con el Trainer de Hugging Face, util para aprender el flujo completo (dataset, hiperparametros, evaluacion WER).
- Transcripcion de audio en ingles en entornos con restricciones de memoria: al ser la variante tiny, cabe en dispositivos con muy poca VRAM o incluso en inferencia por CPU.
- Preprocesado de audio para pipelines de NLP: generar transcripciones preliminares que luego se procesen con un modelo de lenguaje mayor.
- Experimentos de comparacion de tamanos: medir la degradacion de WER frente a `whisper-base`, `whisper-small` o el `whisper-tiny` original en el mismo dataset.
- Docencia y demostraciones: ilustrar las limitaciones de un modelo tiny frente a variantes mayores en tareas de ASR.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | naharte/spanish_english | train | 12,4627 |
| Loss (evaluacion) | naharte/spanish_english | no disponible | 0,2462 |

Evolucion durante el entrenamiento segun la model card:

| Training loss | Epoch | Step | Validation loss | WER |
|---|---|---|---|---|
| 0,2616 | 0,9728 | 1000 | 0,2653 | 14,0547 |
| 0,1396 | 1,9455 | 2000 | 0,2462 | 12,4627 |

No se han publicado resultados de benchmarks adicionales (MLU, HumanEval, GSM8K u otros) en la informacion disponible. No se dispone de comparacion con el `whisper-tiny` original ni con otras variantes en el mismo dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (37,7 M de parametros equivalen a unos 150 MB de pesos), por lo que es viable en practicamente cualquier GPU e incluso en CPU.
- GPU recomendadas: cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, RTX 4090) es mas que suficiente; tambien funciona en Apple Silicon y en CPU.
- Cabe en GPU consumer: si, en todas las gamas actuales, incluidas las integradas.
- Opciones de despliegue: `transformers` (pipeline `automatic-speech-recognition`), `endpoints_compatible` segun los tags; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (Whisper no es un modelo de texto puro y estos runners no lo soportan de forma nativa).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yiyang-hou/whisper-tiny-spanish | 37,7 M | no disponible | 12,46 (dataset propio) | apache-2.0 | Hugging Face |
| openai/whisper-tiny | 39 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face / OpenAI |
| openai/whisper-base | 74 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face / OpenAI |
| openai/whisper-small | 244 M (aprox.) | ventanas de 30 s | no disponible en esta ficha | apache-2.0 | Hugging Face / OpenAI |

La comparacion directa de WER no es posible porque los valores de los modelos base no se han proporcionado en la informacion disponible. El WER de 12,46 del modelo ajustado corresponde a un split de entrenamiento, no a un conjunto de test independiente, lo que limita su valor comparativo.

## Limitaciones y advertencias

- Ambiguedad idiomatica: el repositorio se llama "spanish" pero la model card declara unicamente `en`; no hay evidencia documentada de rendimiento real en castellano.
- WER medido sobre el split `train` del dataset de entrenamiento, no sobre un test independiente: el valor de 12,46 puede estar sobreestimado y no refleja generalizacion.
- Model card incompleta: multiples secciones con "More information needed" (descripcion, usos previstos, datos de entrenamiento), lo que impide evaluar sesgos y composicion del dataset.
- Modelo tiny: capacidad limitada para vocabulario amplio, acentos, ruido de fondo y audio de baja calidad; propenso a errores en nombres propios y terminos tecnicos.
- Riesgo de alucinacion: como todo modelo generativo de ASR, puede producir texto plausible que no corresponde al audio, especialmente en segmentos silenciosos o ruidosos.
- Sin verificacion de benchmarks: los resultados declarados tienen `verified: false`.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de `openai/whisper-tiny` conviene revisar los terminos del modelo base.
- Sin mantenimiento aparente: 34 descargas, 0 likes, creado y actualizado el mismo dia (2026-11-01), sin issues ni discusion documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yiyang-hou/whisper-tiny-spanish
- Arbol de archivos: https://huggingface.co/Yiyang-hou/whisper-tiny-spanish/tree/main
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/spanish_english
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
