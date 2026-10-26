# sureshtara/whisper-tiny_to_spanish_accent_09oct

## Resumen

`sureshtara/whisper-tiny_to_spanish_accent_09oct` es un ajuste fino (fine-tune) del modelo `openai/whisper-tiny` publicado en Hugging Face por el usuario sureshtara. Se trata de un modelo de reconocimiento automatico del habla (ASR) de tipo encoder-decoder Transformer con 37.760.640 parametros (unos 37,76 M), pesos en safetensors y licencia Apache 2.0. El autor declara un WER de 9,0674 sobre un conjunto de test denominado "American English" y un loss de validacion de 0,1866 tras 2000 pasos de entrenamiento.

El interes del modelo es acotado pero claro: sirve como ejemplo reproducible de fine-tuning de un ASR ultraligero, con hiperparametros completos publicados (lr 1e-5, batch 2, AdamW fused, scheduler lineal con 500 pasos de calentamiento, 2000 pasos). Por su tamano, es desplegable en CPU y en cualquier GPU consumer con un consumo de VRAM inferior a 1 GB, lo que lo hace util para prototipado y para experimentos de adaptacion de acento a bajo coste.

Hay una discrepancia importante que el lector debe tener en cuenta: el nombre del repositorio alude a un "spanish accent", pero la model card declara `language: en`, el dataset de entrenamiento es "American_english" y el benchmark se reporta sobre test en ingles americano. No hay evidencia en la informacion disponible de que el modelo haya sido entrenado o evaluado con acento espanol. Ademas, la model card esta generada automaticamente y la mayoria de sus secciones figuran como "More information needed".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (herencia de `openai/whisper-tiny`; numero de capas y dimension no detallados en la model card) |
| Parametros totales | 37.760.640 (~37,76 M, dato real de safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No declarada en la model card; por herencia de Whisper, ventana de audio fija de 30 s |
| Tipos de cuantizacion | No disponibles: el autor solo publica safetensors en el repo (0,3 GB); no se declaran versiones GGUF, ONNX ni int8 |
| Idiomas soportados | `en` (unico idioma declarado en la model card y en los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers`; repositorio con checkpoints de `Trainer`) |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | openai/whisper-tiny |
| Dataset de entrenamiento | American_english (`config: default`, `split: test` para evaluacion) |
| Tamano del repositorio | 0,3 GB |
| Framework de entrenamiento | Transformers 5.21.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0, Tokenizers 0.23.3 |

## Arquitectura y entrenamiento

El modelo hereda integramente la topologia de `openai/whisper-tiny`: un Transformer encoder-decoder que consume espectrogramas mel y genera tokens de texto, con una ventana de audio fija de 30 segundos por inferencia. La model card no detalla el numero de capas, la dimension oculta ni la configuracion de atencion del checkpoint ajustado, por lo que esos datos deben consultarse en el `config.json` del repositorio o en el modelo base. Los pesos publicados estan en safetensors y el repositorio incluye checkpoints intermedios de `Trainer`, ademas de logs de TensorBoard.

El procedimiento de entrenamiento si esta documentado con detalle: learning rate 1e-5, batch de entrenamiento 2, batch de evaluacion 1, semilla 42, optimizador `ADAMW_TORCH_FUSED` (betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de calentamiento y un total de 2000 pasos. Se registran dos puntos de evaluacion: en el paso 1000 (epoca 0,9452) el loss de validacion es 0,2033 y el WER 10,9464; en el paso 2000 (epoca 1,8904) el loss baja a 0,1866 y el WER a 9,0674. A partir de la relacion entre pasos y epocas se puede inferir un conjunto de entrenamiento de aproximadamente 2.100 clips (2000 pasos / 1,8904 epocas x batch 2), es decir, unas 4000 muestras vistas en total. No se documenta composicion del dataset, ni si hubo aumento de datos, ni tecnicas de RLHF/DPO (no aplicables a un ASR). No se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Transcripcion de voz a texto en ingles americano: es la unica tarea declarada (`automatic-speech-recognition`).
- Procesamiento de audio en ventanas de hasta 30 segundos por pasada, por herencia de la arquitectura Whisper.
- Modelo ligero (37,76 M de parametros) apto para inferencia en CPU y en dispositivos de bajos recursos.
- Fine-tune orientado, segun el nombre del repositorio, a acentos; la model card no confirma que el acento objetivo sea el espanol ni que se haya evaluado esa condicion.
- Integracion con el ecosistema `transformers` mediante `pipeline("automatic-speech-recognition")`.
- Etiqueta `endpoints_compatible`, lo que indica compatibilidad con los endpoints de inferencia de Hugging Face.
- No se declaran capacidades de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generation ni modo "thinking".

## Casos de uso

- Prototipado rapido de ASR en local: al ocupar menos de 1 GB de VRAM y ser ejecutable en CPU, permite montar un pipeline de transcripcion funcional en un portatil sin GPU para validar ideas antes de invertir en modelos mayores.
- Etiquetado previo de corpus de audio en ingles: el modelo puede generar transcripciones iniciales que luego se revisan manualmente, reduciendo el coste de anotacion en proyectos de datos de voz.
- Baseline de comparacion en experimentos de adaptacion de acento: con hiperparametros y curvas de evaluacion publicados, sirve como punto de referencia reproducible frente a otros fine-tunes de `whisper-tiny`.
- Transcripcion de notas de voz y reuniones cortas: segmentando el audio en fragmentos de hasta 30 s, puede transcribir mensajes de voz o intervenciones puntuales en ingles americano.
- Subtitulado asistido de material audiovisual en ingles: generacion de subtitulos preliminares con marcas temporales a nivel de segmento mediante los mecanismos de timestamps de la libreria `transformers`.
- Docencia y formacion tecnica: el repositorio documenta learning rate, batch, optimizador, scheduler y framework exactos, lo que lo convierte en un ejemplo practico de fine-tuning de ASR de bajo coste.
- Pruebas de integracion en pipelines de datos: util para verificar extremo a extremo el flujo audio -> texto -> postprocesado (puntuacion, normalizacion) sin consumir recursos de GPU.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente; `verified: false` en la model-index):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | American English (`config: default`, `split: test`) | WER | 9,0674 % |
| Automatic Speech Recognition | American English (validacion, paso 2000) | Loss | 0,1866 |

Evolucion durante el entrenamiento:

| Training loss | Epoca | Paso | Validation loss | WER |
|---|---|---|---|---|
| 0,1605 | 0,9452 | 1000 | 0,2033 | 10,9464 |
| 0,0606 | 1,8904 | 2000 | 0,1866 | 9,0674 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos de referencia. Tampoco se detalla la composicion del conjunto "American English" ni el metodo de calculo del WER (normalizacion, puntuacion, manejo de mayusculas), lo que limita la comparabilidad del dato.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir del numero de parametros, excluyendo activaciones y overhead del framework): ~0,15 GB en fp32, ~0,08 GB en fp16, ~0,04 GB en int8.
- En la practica, con activaciones y overhead de PyTorch, el consumo total se mantiene por debajo de 1 GB, incluso con batches pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria. Una T4, L4 o A10G es mas que suficiente; A100 y H100 solo tendrian sentido para servir con batches muy grandes y alto throughput agregado.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable por el reducido numero de parametros; es la opcion habitual para este tamano de modelo en entornos sin GPU.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, `faster-whisper`/CTranslate2 y `whisper.cpp` previa conversion de pesos (no se proporcionan artefactos convertidos en el repositorio); integracion con endpoints de Hugging Face (tag `endpoints_compatible`). El soporte en vLLM, TGI u Ollama no esta confirmado en la informacion disponible.
- Latencia y throughput: no se han publicado medidas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Ventana de audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `sureshtara/whisper-tiny_to_spanish_accent_09oct` (este modelo) | 37,76 M | 30 s (heredada) | 9,0674 % en American English (no verificado) | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| `openai/whisper-tiny` (modelo base) | ~39 M (dato publico, no verificado aqui) | 30 s | No disponible en la informacion | apache-2.0 (repo base) | Hugging Face, ampliamente utilizado |
| `openai/whisper-base` | ~74 M (dato publico, no verificado aqui) | 30 s | No disponible en la informacion | apache-2.0 (repo base) | Hugging Face |
| `RuidaJiang/whisper-tiny_to_spanish_accent` (fine-tune con nombre casi identico) | No disponible en la informacion | No disponible | No disponible | No disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks comparables entre estas alternativas dentro de la informacion proporcionada, por lo que no es posible establecer una comparacion de rendimiento rigurosa. La comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Discrepancia entre nombre y contenido: el repositorio se llama "to_spanish_accent", pero la model card declara `language: en`, el dataset es "American_english" y el benchmark se mide sobre test en ingles americano. No hay evidencia de adaptacion a acento espanol; un resultado de busqueda web menciona un "Spanish English dataset" sin confirmar, lo que anade ambiguedad.
- Model card auto-generada e incompleta: las secciones "Model description", "Intended uses & limitations" y "Training and evaluation data" figuran literalmente como "More information needed". No hay declaracion de usos previstos ni de limitaciones por parte del autor.
- Volumen de entrenamiento muy reducido: 2000 pasos con batch 2 equivalen a unas 4000 muestras vistas (~2.100 clips inferidos, ~1,9 epocas), insuficiente para conclusiones robustas sobre generalizacion.
- Metrica no verificada: el WER de 9,0674 figura con `verified: false` y sin detalle del protocolo de evaluacion (normalizacion de texto, puntuacion, tratamiento de silencios), lo que impide comparaciones fiables con otros modelos.
- Riesgo de alucinacion: la familia Whisper es propensa a generar texto espurio en segmentos de silencio, ruido o audio no vocal; el autor no documenta ningun mecanismo de mitigacion (umbrales de `no_speech_prob`, filtros de repeticion).
- Cobertura idiomatica limitada: solo ingles declarado; el rendimiento en castellano, en acentos no nativos o en audio con ruido no esta evaluado ni documentado.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificacion, pero exige conservar el aviso de licencia y el reconocimiento de autoria. Conviene verificar tambien la licencia del modelo base y de los datos de entrenamiento, dado que el dataset "American_english" no se describe ni se enlaza.
- Procedencia dudosa: existen repositorios con nombres practicamente identicos bajo otras cuentas (`lggvu`, `ayfilaS`, `joedwan`, `RuidaJiang`), lo que sugiere experimentos replicados o artefactos de un mismo flujo de trabajo. No hay garantia de cual es el original ni de la trazabilidad de los pesos.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- No apto para produccion sin evaluacion previa: sin datos de robustez, sin pruebas de sesgo y con una unica metrica declarada, no deberia desplegarse en un sistema critico sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sureshtara/whisper-tiny_to_spanish_accent_09oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio con nombre identico bajo otra cuenta (lggvu): https://huggingface.co/lggvu/whisper-tiny_to_spanish_accent_09oct
- Repositorio relacionado (RuidaJiang/whisper-tiny_to_spanish_accent): https://huggingface.co/RuidaJiang/whisper-tiny_to_spanish_accent
- Ficha en FriendliAI: https://friendli.ai/models/ayfilaS/whisper-tiny_to_spanish_accent_09oct
- Ficha en free2aitools (modelo): https://free2aitools.com/model/joedwan/whisper-tiny_to_spanish_accent_09oct
- Ficha en free2aitools (dataset): https://free2aitools.com/dataset/polauoa/whisper-tiny_to_spanish_accent
