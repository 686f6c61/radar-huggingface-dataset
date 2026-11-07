# zarko1321/Bitsy500M

## Resumen

Bitsy500M (publicado como Bitsy-500M Custom) es un modelo de lenguaje decoder-only de aproximadamente 510 millones de parametros desarrollado por el usuario zarko1321. Se trata de un modelo con pesos inicializados aleatoriamente y sin ningun tipo de entrenamiento: no ha recibido actualizaciones de entrenamiento de lenguaje, por lo que no es un chatbot ni un asistente de codigo funcional. Su interes no reside en las capacidades de generacion, sino en el paquete completo que lo acompania: pesos reales en BF16 safetensors, un tokenizador BPE byte-level nuevo, implementacion propia del modelo en PyTorch, un runner de preentrenamiento y un notebook de Colab para entrenarlo.

La arquitectura, denominada "Bitsy Parallel", es una implementacion independiente que no hereda ni envuelve modelos Llama, GPT o Qwen. Emplea atencion residual paralela con ramas de feed-forward, pre-RMSNorms separadas, RMSNorm aprendida en query/key, RoPE de pares adyacentes, GQA (20 cabezas de query y 5 de KV), SwiGLU y embeddings de entrada/salida atados. El modelo tiene 27 bloques decoder, anchura oculta de 1.280 y un limite de contexto configurado de 2.048 tokens.

Es relevante ahora como material educativo y de investigacion: permite estudiar el ciclo completo de un LLM desde cero (tokenizador, arquitectura, preentrenamiento, checkpoints) con un modelo de tamano manejable y licencia MIT. Cualquier salida coherente requiere que el usuario lo entrene previamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer ("Bitsy Parallel"), atencion residual paralela, GQA, SwiGLU, RoPE |
| Parametros totales | 509.943.936 (embeddings atados contados una vez) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens (configurado) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16), con codigo custom Python |

Detalles adicionales de arquitectura: 27 bloques decoder, anchura oculta 1.280, anchura intermedia SwiGLU 3.456, 20 cabezas de query y 5 de KV, anchura de cabeza 64, vocabulario de 32.000 tokens, pesos iniciales en BF16 con semilla aleatoria 42.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con una variante propia llamada Bitsy Parallel: usa ramas paralelas de atencion residual y feed-forward, con pre-RMSNorms separadas para cada rama, RMSNorm aprendida en query y key, RoPE aplicada sobre pares adyacentes, atencion con GQA (20 cabezas de query, 5 de KV) implementada mediante PyTorch SDPA, activacion SwiGLU y embeddings de entrada/salida atados. El autor declara explicitamente que se trata de bloques constructivos establecidos y que no reclama ninguna invencion de investigacion nueva. La implementacion no subclasea ni envuelve modelos Llama, GPT o Qwen, y requiere `trust_remote_code=True` para cargarse.

No ha habido entrenamiento: los pesos son aleatorios (semilla 42) y no se ha aplicado ninguna actualizacion de preentrenamiento, SFT, RLHF ni DPO. El paquete incluye, sin embargo, un runner de preentrenamiento (`train.py`) y un notebook de Colab (`Train_Bitsy_500M_Colab.ipynb`) que descargan el modelo, hacen streaming de `roneneldan/TinyStories` y lanzan el entrenamiento. El runner usa parametros en FP32, autocast BF16, AdamW8bit en CUDA, gradient checkpointing y gradient clipping, con empaquetado de texto en bloques de longitud fija y EOS entre documentos. Los checkpoints guardan modelo, tokenizador y `training_state.pt` con estado del optimizador, RNG, actualizacion completada y cursor de datos, lo que permite reanudar una ejecucion con las mismas condiciones. El autor advierte que el runner hace preentrenamiento, no SFT de chat, y que una ejecucion corta no basta para que un modelo de 500M aprenda ingles fluido.

## Capacidades

- Generacion de texto: tecnicamente puede ejecutar `generate`, pero al no estar entrenado produce salida aleatoria sin coherencia linguistica.
- Razonamiento, codigo y matematicas: no disponible; no hay entrenamiento que las desarrolle.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingues: no disponibles; el modelo esta etiquetado solo para ingles y no ha aprendido ningun idioma.
- Capacidades especiales (thinking mode, vision, audio): ninguna.
- Soporte de entrenamiento: incluye runner de preentrenamiento, soporte de datos locales (JSONL o TXT), enmascaramiento con `-100` para futuros entrenadores de chat y reanudacion de checkpoints.

## Casos de uso

- Docencia de arquitecturas transformer: el paquete permite inspeccionar una implementacion completa y legible de un decoder-only con GQA, RoPE y SwiGLU, sin depender de las clases internas de Llama o Qwen, lo que facilita explicar cada componente por separado.
- Investigacion sobre inicializacion y dinamica de entrenamiento: al ser un modelo sin entrenar con semilla fija (42), sirve como punto de partida reproducible para estudiar curvas de perdida, estabilidad y efectos de hiperparametros en un modelo de 500M.
- Desarrollo de tokenizadores: incluye un tokenizador BPE byte-level nuevo con vocabulario de 32.000, util para experimentar con tokenizacion y comparar su comportamiento frente a tokenizadores de modelos establecidos.
- Preentrenamiento educativo en hardware de consumo o Colab: el notebook y el runner permiten entrenar sobre TinyStories con batch size 1 y contexto 512 en una GPU como la L4, un escenario realista para aprender el flujo completo de entrenamiento.
- Pruebas de infraestructura de entrenamiento: los checkpoints con `training_state.pt` permiten validar pipelines de reanudacion, gestion de estado del optimizador y recuperacion ante interrupciones en entornos de investigacion.
- Base para experimentos de SFT de chat: el soporte de etiquetas `-100` para enmascarar prompt y padding esta pensado para construir un entrenador de chat sobre el modelo una vez preentrenado.
- Evaluacion comparativa de implementaciones: al ser codigo independiente, puede usarse como referencia para contrastar precision numerica y rendimiento frente a implementaciones de referencia de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no ha sido entrenado, por lo que cualquier metrica de calidad linguistica (MMLU, HumanEval, GSM8K u otras) carece de sentido en su estado actual.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 (aproximadamente 1 GB para 510M parametros), la inferencia cabe en menos de 2 GB de VRAM; en FP32 serian unos 2 GB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para inferencia; para entrenamiento el autor apunta a una GPU con soporte BF16 como la NVIDIA L4.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) para inferencia; para entrenamiento con AdamW8bit y gradient checkpointing el requisito es mayor pero sigue siendo asequible.
- Opciones de despliegue: transformers con `trust_remote_code=True` (unica via validada); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, y el codigo custom probablemente requiera adaptacion para ellos.
- Latencia y throughput: no medidos. El autor indica explicitamente que el throughput y el uso de VRAM en L4 no se han medido y recomienda empezar con batch size 1 y contexto 512.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bitsy500M (zarko1321) | 509.943.936 | 2.048 | No (pesos aleatorios) | MIT | Hugging Face, codigo custom |
| Bitsy 1B (zarko1321) | Aproximadamente 1.000M (segun model card) | No disponible | No (pesos aleatorios) | No disponible en la informacion | Hugging Face |
| TinyLlama-1.1B | Aproximadamente 1.100M | 2.048 | Si (preentrenamiento) | Apache 2.0 | Hugging Face, amplio ecosistema |
| Qwen2.5-0.5B | Aproximadamente 500M | 32.768 | Si (preentrenamiento e instruccion) | Apache 2.0 | Hugging Face, vLLM, llama.cpp, Ollama |

La comparacion con TinyLlama y Qwen2.5-0.5B se ofrece como referencia de categoria (modelos decoder-only de ~0,5-1B parametros); no se dispone de datos de benchmarks de Bitsy500M para comparar rendimiento. La diferencia fundamental es que Bitsy500M no esta entrenado y su valor es educativo y de investigacion, no de produccion.

## Limitaciones y advertencias

- Modelo sin entrenar: los pesos son aleatorios y la salida es incoherente por diseno; no debe usarse en produccion ni presentarse como asistente.
- Riesgo de alucinacion: total, al no existir conocimiento aprendido; cualquier texto generado es esencialmente ruido estadistico.
- Sesgos: no evaluables en un modelo sin entrenamiento; los sesgos apareceran en funcion de los datos que se usen para entrenarlo.
- Limitaciones de contexto e idioma: contexto configurado de 2.048 tokens y etiqueta de idioma solo ingles; no hay capacidades multilingues.
- Ejecucion de codigo remoto: la carga requiere `trust_remote_code=True`, lo que ejecuta codigo Python incluido en el repositorio; el autor recomienda revisarlo antes de cargarlo.
- Dependencias: las versiones de `requirements.txt` son las validadas; versiones mas recientes de transformers no han sido probadas.
- Checkpoints y seguridad: los archivos `training_state.pt` usan pickle de Python; solo deben cargarse estados de optimizador de fuentes de confianza.
- Reproducibilidad: el dataset remoto en streaming no se archiva ni fija, por lo que la reproduccion exacta depende de que los datos upstream y las librerias no cambien.
- Licencia MIT: permite uso comercial, pero al no haber modelo entrenado el uso comercial practico es nulo salvo que el usuario entrene el modelo y asuma las obligaciones y riesgos derivados.
- Compatibilidad: los pesos y el tokenizador son nuevos; no se pueden sustituir por los del Bitsy 1B ni reutilizar IDs de tokens cacheados de ese modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zarko1321/Bitsy500M
- Version alternativa en Hugging Face: https://huggingface.co/zarko1321/bitsy-500m
- Dataset de entrenamiento por defecto: https://huggingface.co/datasets/roneneldan/TinyStories
