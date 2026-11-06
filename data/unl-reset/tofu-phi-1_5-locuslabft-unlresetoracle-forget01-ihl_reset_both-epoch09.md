# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch09

## Resumen

Este repositorio contiene un checkpoint completo del modelo Phi-1.5 (1.418 millones de parametros) obtenido mediante un procedimiento de *machine unlearning* sobre el conjunto de datos TOFU. El modelo parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de `microsoft/phi-1_5` sobre TOFU, y aplica una estrategia denominada "IHL + Reset Both": se reinicializan los *input embeddings* y la cabeza de lenguaje (`LM head`) desde los pesos originales de Phi-1.5, mientras que el resto de pesos del Transformer se conservan del modelo ajustado. El entrenamiento combina una perdida de *token IHL* sobre el conjunto "forget" con una perdida de entropia cruzada (CE) ponderada por 1.0 sobre el conjunto "retain".

El modelo esta pensado para investigacion en *unlearning*: el objetivo es eliminar la memorizacion de un subconjunto concreto de datos (forget01) sin degradar significativamente el comportamiento sobre el resto. Se trata de la epoca 9 de un total de 20, lo que lo convierte en un punto intermedio de la trayectoria de entrenamiento y no en un checkpoint final.

Por su tamano y naturaleza, es un artefacto de laboratorio orientado a reproducir experimentos de desaprendizaje sobre TOFU, no un modelo de proposito general para produccion. La licencia apache-2.0 y el formato safetensors facilitan su inspeccion y comparacion con otros checkpoints de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), pesos con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (a su vez derivado de microsoft/phi-1_5) |
| Tamano del repositorio | 2.8 GB |
| Epoca del checkpoint | 9 de 20 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura decoder-only de Phi-1.5, un Transformer de aproximadamente 1.400 millones de parametros entrenado originalmente por Microsoft sobre datos de texto y codigo de calidad educativa. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplico un ajuste fino supervisado con el dataset TOFU (TAsk arithmetics, autores y biografias sinteticas), que sirve como banco de pruebas estandar para evaluar *machine unlearning*.

El checkpoint aqui descrito aplica una variante concreta: reinicializa los *input embeddings* y la `LM head` con los pesos de `microsoft/phi-1_5` (el "reset both" del nombre), conservando el resto de pesos del Transformer del modelo ajustado. El objetivo de entrenamiento suma una perdida de *token IHL* (una forma de *influence-based unlearning* a nivel de token) sobre el split "forget01" con una perdida de entropia cruzada ponderada por 1.0 sobre el split "retain". El manifiesto de configuracion (`ihl_manifest.json`) documenta los detalles del procedimiento. No se dispone de informacion sobre el numero total de tokens vistos durante este ajuste ni sobre el uso de RLHF o DPO en esta etapa.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Phi-1.5.
- Razonamiento basico y resolucion de problemas aritmeticos sencillos, capacidades presentes en el Phi-1.5 original.
- Generacion de codigo a nivel introductorio, dado el corpus de entrenamiento original de Phi-1.5.
- Comportamiento sobre el conjunto "retain" de TOFU preservado mediante la perdida CE durante el desaprendizaje.
- Eliminacion (parcial, segun la epoca 9) de la memorizacion del subconjunto "forget01" de TOFU.
- No se documenta soporte de *tool calling*, agentes, vision, audio ni modo *thinking*.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como punto de comparacion en la curva de entrenamiento (epoca 9/20) para medir la evolucion de la supresion de memoria frente a la retencion de utilidad.
- Reproduccion de experimentos TOFU: permite replicar el protocolo "IHL + Reset Both" y contrastarlo con otras estrategias de desaprendizaje sobre el mismo modelo base.
- Evaluacion de ataques de extraccion de memoria: util para medir si el subconjunto "forget" sigue siendo recuperable mediante *prompting* adversarial tras el desaprendizaje.
- Estudio de la influencia del reinicio de embeddings y LM head: al fijar esa configuracion, se puede aislar su efecto sobre la retencion de conocimiento frente a variantes que solo reinician una de las dos partes.
- Analisis de degradacion por epoca: al ser un checkpoint intermedio, permite trazar como evoluciona la perplexity en "retain" y "forget" a lo largo de las 20 epocas.
- Base para *benchmarking* de utilidades de unlearning: punto de partida para comparar frameworks y metricas (por ejemplo, MIA, ROUGE sobre forget/retain) sin necesidad de reentrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV (depende de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: del orden de 1,5-1,8 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: del orden de 0,9-1,2 GB para pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en fp16 con contexto moderado; A100/H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, en la mayoria de modelos con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo usa `custom_code`); vLLM y TGI requieren verificacion de compatibilidad con el codigo personalizado; llama.cpp/Ollama no tienen variante GGUF publicada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch09 (este) | 1.418 M | no disponible | apache-2.0 | Checkpoint intermedio de unlearning (epoca 9/20) |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible en la informacion | Modelo base ajustado sobre TOFU, sin desaprendizaje |
| microsoft/phi-1_5 | ~1.400 M | no disponible en la informacion | no disponible en la informacion | Modelo original de Microsoft, sin ajuste TOFU |

No se dispone de datos de rendimiento comparativos entre estos checkpoints en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 9 de 20): el desaprendizaje puede no estar completo y la memoria del subconjunto "forget01" podria ser aun recuperable.
- Modelo de investigacion: no esta validado para uso en produccion ni para tareas generales de generacion.
- Solo ingles: no se documenta soporte multilingue.
- Riesgo de alucinacion heredado del modelo base Phi-1.5, especialmente en consultas fuera del dominio TOFU.
- El reinicio de embeddings y LM head puede degradar la calidad general del modelo respecto al checkpoint ajustado original; conviene medirlo con evaluaciones propias.
- Requiere `trust_remote_code=True` para cargar el codigo personalizado, lo que implica ejecutar codigo del autor del repositorio.
- Licencia apache-2.0: permite uso comercial segun los terminos de dicha licencia, pero las condiciones del modelo base (`microsoft/phi-1_5`) deben verificarse por separado antes de cualquier uso comercial.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia comunitaria de validacion del checkpoint.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch09
- Modelo base del ajuste TOFU: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
