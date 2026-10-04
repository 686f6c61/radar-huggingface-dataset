# violetxi/qwen35-9b-equational-theory-sair-mix1m-70n30t-thinking

## Resumen

Qwen3.5-9B Equational Theory — 1M, 70% notes / 30% trajectories es un ajuste fino supervisado completo (full fine-tuning) del modelo base Qwen/Qwen3.5-9B (revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`), publicado por el usuario violetxi. El checkpoint corresponde a la epoca 2 del experimento de reentrenamiento con razonamiento incluido del 1 de octubre de 2026 y su objetivo es la internalizacion de teoria ecuacional: el modelo aprende a resolver y razonar sobre problemas de teoria de ecuaciones a partir de notas matematicas y de trayectorias de profesor condicionadas por esas notas.

El modelo es denso, con 9.653.104.368 parametros (unos 9,65 mil millones), y se distribuye en safetensors con un export nativo en BF16. La ventana de contexto, los idiomas soportados y los tipos de cuantizacion no se detallan en la informacion disponible. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales, aunque el modelo es altamente especializado y no un asistente generalista.

Su relevancia es acotada pero clara para el nicho de investigacion: forma parte de una familia de checkpoints escalonados (1M, 5M, 10M, 50M y 100M de tokens supervisados) que estudian la internalizacion de razonamiento matematico mediante destilacion de trayectorias de profesor, y publica la trazabilidad completa del entrenamiento (hashes de datos, configuracion, metricas y ejecucion de W&B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal Qwen3.5 (`Qwen3_5ForConditionalGeneration`), fine-tuning completo |
| Parametros totales | 9.653.104.368 (~9,65 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se documenta el export nativo en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso con clase de carga `Qwen3_5ForConditionalGeneration`. El ajuste es un full fine-tuning supervisado: se entrenaron 427 tensores de lenguaje, mientras que el resto de tensores conservan los valores fijados del modelo base. No hay mezcla de expertos ni decodificacion especulativa documentada.

El dataset nominal de 1M de tokens se compone en un 70/30: 702.269 tokens supervisados de notas matematicas (1.220 ejemplos) y 301.500 tokens de trayectorias de profesor condicionadas por notas (115 ejemplos), con un total real de 1.003.769 tokens y 1.335 ejemplos por epoca. Los tokens de trayectoria incluyen el razonamiento del profesor y la respuesta final, restaurados exactamente desde el banco sellado R8 y excluyendo cabezas en cuarentena y ejemplos de validacion congelados. Los ejemplos se seleccionan completos, sin remuestreo ni truncado, y los recuentos tienen en cuenta la mascara de perdida y el enmascarado en los limites de nota.

La configuracion de entrenamiento es de dos epocas, learning rate `5e-6`, scheduler coseno, warmup 0.03, FSDP2 sobre ocho GPU, entropia cruzada media global sobre tokens supervisados y sin termino KL (no hay RLHF ni DPO declarados). El paso final del optimizador fue el 20 y la perdida final de validacion compartida quedo en 0.375394. La model card indica que los modelos de 1M/5M/10M comparten un pool de trayectorias con razonamiento restaurado, mientras que los de 50M/100M usan un pool compatible con R8 distinto, y que no se reclama anidamiento de trayectorias entre pools.

## Capacidades

- Generacion de texto y razonamiento matematico especializado en teoria ecuacional, con modo "thinking" activable mediante la plantilla de chat incluida.
- Resolucion de problemas de teoria de ecuaciones a partir de notas y de enunciados tipo ejercicio, replicando el estilo de razonamiento del profesor usado en el destilado.
- Generacion autoregresiva estandar (`text-generation`) y uso conversacional basico a traves de la plantilla de chat del modelo base.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado especificamente; el unico razonamiento multi-paso documentado es el matematico interno del modo thinking.
- Capacidades multilingues: no disponibles.
- Vision: no documentada en la model card; la etiqueta `image-text-to-text` figura entre los tags del repositorio, presumiblemente heredada de la arquitectura del modelo base, pero no se describe ningun uso ni evaluacion multimodal.
- Trazabilidad reproducible: se publican `training_config.json`, `data_provenance.json`, `training_metrics.json` y `conversion.json` con los hashes de cada artefacto.

## Casos de uso

- Investigacion en internalizacion de razonamiento: reproducir o extender el experimento comparando este checkpoint de 1M de tokens con los de 5M, 10M, 50M y 100M para estudiar como escala la internalizacion de teoria ecuacional.
- Generacion de notas matematicas: el modelo puede redactar apuntes y explicaciones sobre teoria ecuacional en el estilo de las notas de entrenamiento, util para construir material docente o datasets sinteticos adicionales.
- Evaluacion de destilacion de trayectorias: sirve como referencia para medir cuanto del razonamiento del profesor se conserva en los pesos frente a la dependencia del contexto de notas.
- Benchmarking de modelos especializados: al ser un fine-tune completo sobre Qwen3.5-9B con perdida de validacion publicada (0.375394), permite comparar estrategias de ajuste (mezcla de datos, epocas, LR) bajo condiciones controladas.
- Analisis de atribucion de pesos: dado que solo 427 tensores de lenguaje se entrenaron, es util para estudiar que subconjunto de parametros concentra la adaptacion a un dominio matematico concreto.
- Pruebas de inferencia y compatibilidad: el export BF16 carga con `transformers` y `Qwen3_5ForConditionalGeneration`, por lo que sirve para validar pipelines de despliegue sobre modelos de ~9,65 B en BF16.
- Base para posteriores fine-tunes de dominio: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para tareas matematicas relacionadas, asumiendo el riesgo de olvido catastrofico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de benchmark se publican por separado y que las evaluaciones previas de otras mezclas no describen este checkpoint. El unico dato de rendimiento disponible es la perdida final de validacion compartida: 0.375394.

| Metrica | Valor |
|---|---|
| Perdida de validacion compartida (final) | 0.375394 |
| Paso final del optimizador | 20 |
| MMLU, HumanEval, GSM8K u otros | no disponible |

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 20-24 GB solo para pesos (~19,3 GB de safetensors) mas cache KV y activaciones. Estimacion a partir del recuento de parametros, no confirmada por el autor.
- VRAM estimada con cuantizacion INT8/FP8: aproximadamente 10-12 GB. Estimacion, ya que el repositorio no publica pesos cuantizados.
- VRAM estimada en GGUF Q4_K_M: aproximadamente 5,5-6,5 GB tras conversion propia. Estimacion.
- GPU de datacenter: A100 40/80 GB, H100 80 GB, L40S 48 GB; cualquier GPU con 24 GB o mas puede alojar el modelo en BF16 si la longitud de contexto se mantiene moderada.
- GPU de consumo: RTX 4090 y RTX 3090 (24 GB) pueden cargar el modelo en BF16 con margen ajustado; RTX 4080/4070 Ti Super (16 GB) requieren cuantizacion; GPUs de 8-12 GB solo son viables con cuantizaciones de 4 bits.
- Opciones de despliegue: `transformers` con `device_map="auto"` es la ruta documentada; vLLM y TGI son compatibles con pesos safetensors; llama.cpp y Ollama requieren convertir primero a GGUF.
- Latencia y throughput: no disponibles.
- Nota de entrenamiento: el autor uso ocho GPU con FSDP2, lo que da una referencia del orden de recursos necesarios para reproducir el ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-equational-theory-sair-mix1m-70n30t-thinking | 9,65 B | no disponible | perdida de validacion 0.375394; benchmarks no publicados | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | 9,65 B | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | HuggingFace |
| Checkpoints hermanos de la familia (5M, 10M, 50M, 100M de tokens) | no disponible | no disponible | no disponible | no disponible | referenciados en la model card, sin identificadores concretos |
| Otras alternativas de ~9 B para matematicas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho: esta especializado en teoria ecuacional y no debe esperarse un comportamiento de asistente generalista comparable al de su modelo base.
- Riesgo de olvido catastrofico: al ser un fine-tuning completo sobre 427 tensores de lenguaje, las capacidades generales del Qwen3.5-9B original pueden haberse degradado.
- Riesgo de alucinacion en demostraciones matematicas: la model card no reporta evaluacion formal de correctitud, solo perdida de validacion; una perdida baja no garantiza pruebas validas.
- Idiomas soportados y contexto: no disponibles, por lo que no puede garantizarse un comportamiento correcto fuera del caso de uso previsto.
- Sin benchmarks publicos: el autor remite a una publicacion separada; no hay evidencia comparativa frente a otros modelos en el momento de redactar esta ficha.
- Datos de entrenamiento reducidos: 1.335 ejemplos y 20 pasos de optimizador implican un ajuste muy corto, con riesgo de sobreajuste al estilo de las notas y trayectorias concretas usadas.
- Uso comercial: la licencia Apache 2.0 lo permite, pero debe verificarse por separado la licencia y los terminos del modelo base Qwen3.5-9B, no documentados en la informacion proporcionada.
- Repositorio sin adopcion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- Vision: aunque el tag `image-text-to-text` aparece en el repositorio, no se documenta ningun uso multimodal; no debe asumirse que funcione correctamente en esa modalidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-equational-theory-sair-mix1m-70n30t-thinking
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-notes
- Dataset de trayectorias condicionadas por notas: https://huggingface.co/datasets/violetxi/equational-theory-sair-note-conditioned-rollouts
- Ejecucion de entrenamiento en W&B: https://wandb.ai/stanford_autonomous_agent/equation-internalization/runs/eqthink1m20261001
- Artefactos de trazabilidad incluidos en el repositorio: `training_config.json`, `data_provenance.json`, `training_metrics.json`, `conversion.json`
