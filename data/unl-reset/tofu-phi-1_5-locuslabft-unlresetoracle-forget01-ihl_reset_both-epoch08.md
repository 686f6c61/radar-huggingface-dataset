# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch08

## Resumen

Este repositorio contiene un checkpoint completo del modelo Phi-1.5 (1.418 millones de parametros) obtenido tras un proceso de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino de Phi-1.5 sobre TOFU, y ha sido modificado por el grupo `unl-reset` para olvidar el subconjunto `forget01` aplicando una combinacion de reinicializacion de embeddings de entrada y cabeza LM (IHL, *Input Head Layer*) junto con una perdida de entropia cruzada sobre el conjunto de retencion.

El checkpoint corresponde a la epoca 8 de 20 del procedimiento de olvido. Su relevancia es fundamentalmente metodologica: sirve como artefacto reproducible para investigar tecnicas de desaprendizaje en modelos de lenguaje pequenos, evaluar la eficacia del olvido frente al olvido catastrofico y medir el compromiso entre supresion de informacion y degradacion de capacidades generales.

No es un modelo pensado para uso en produccion ni para tareas generales de generacion: es un objeto de estudio experimental dentro del campo del *machine unlearning*. La arquitectura subyacente es la de Phi-1.5 (transformer decoder-only denso), con licencia Apache 2.0 y pesos en formato safetensors con codigo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con codigo personalizado; repo de 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura base es Phi-1.5, un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, disenado originalmente por Microsoft Research para razonamiento y generacion de codigo en entornos de bajos recursos. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste fino supervisado sobre el dataset TOFU, que contiene biografias ficticias de autores con preguntas y respuestas asociadas, disenado especificamente para evaluar desaprendizaje.

El checkpoint de este repositorio aplica una estrategia de olvido denominada "IHL + Reset Both": los embeddings de entrada y la cabeza de lenguaje (LM head) se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. El entrenamiento de olvido combina una perdida de entropia cruzada sobre el conjunto *forget* (token IHL) con un termino de entropia cruzada ponderado por 1.0 sobre el conjunto *retain*, con el objetivo de suprimir la informacion olvidada sin destruir el conocimiento general. El checkpoint corresponde a la epoca 8 de 20 y se distribuye como modelo completo autonomo, con un manifiesto `ihl_manifest.json` que documenta el procedimiento. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de la base Phi-1.5.
- Razonamiento basico y respuesta a preguntas sobre conocimiento general retenido.
- Generacion de codigo en Python y otros lenguajes, capacidad nativa de Phi-1.5.
- Razonamiento matematico de nivel basico (aritmetica y problemas de varios pasos sencillos).
- Capacidad de servir como artefacto de evaluacion de desaprendizaje: permite medir la supresion de conocimiento del conjunto `forget01` y la retencion en `retain`.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Modo *thinking*, vision o audio: no disponible.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint permite reproducir y comparar la eficacia del metodo IHL + Reset Both frente a otras tecnicas de olvido sobre TOFU, midiendo la probabilidad asignada a las respuestas del conjunto `forget01` antes y despues del olvido.
- Evaluacion del compromiso olvido-retencion: al ser la epoca 8 de 20, permite analizar la curva de degradacion de capacidades generales (perplejidad en `retain`) frente a la supresion de informacion olvidada.
- Auditoria de privacidad en modelos de lenguaje: sirve como caso de estudio para verificar si un modelo ajustado sobre datos sensibles puede eliminar selectivamente informacion identificable sin reentrenamiento completo.
- Benchmarking de metodos de desaprendizaje: investigadores pueden comparar este checkpoint con variantes del mismo autor (distintas epocas o estrategias de reset) y con otros metodos publicados sobre Phi-1.5.
- Docencia y formacion: util como ejemplo practico en cursos sobre seguridad y privacidad de modelos, mostrando como se manipulan pesos para alterar el comportamiento memorizado.
- Analisis de robustez de ataques de extraccion: permite estudiar si un adversario puede recuperar la informacion supuestamente olvidada mediante *prompting* o *fine-tuning* posterior.
- Base para experimentos de alineacion: al conservar los pesos del transformer original, puede servir para estudiar como afecta la reinicializacion de embeddings y LM head a la coherencia general del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 3.5 y 5 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.5 a 2 GB; en 4 bits, alrededor de 1 a 1.5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, A10, L4). Para cuantizacion 4 bits, GPUs con 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU de consumo: si, en la mayoria de GPUs modernas con 6 GB o mas, especialmente con cuantizacion.
- Opciones de despliegue: al requerir `custom_code`, es necesario usar `trust_remote_code=True` con la libreria `transformers`. No se garantiza compatibilidad directa con vLLM, llama.cpp, Ollama o TGI sin conversion previa; la presencia de codigo personalizado puede complicar el despliegue en motores de inferencia estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-forget01-ihl_reset_both-epoch08 | 1.418 M | no disponible | Apache 2.0 | HuggingFace | Checkpoint de desaprendizaje, epoca 8/20 |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible en la informacion | HuggingFace | Modelo base ajustado sobre TOFU sin olvido |
| microsoft/phi-1_5 | ~1.400 M | 2.048 tokens (segun documentacion publica de Phi-1.5) | MIT (segun documentacion publica) | HuggingFace | Modelo original de Microsoft Research |
| Otros checkpoints de desaprendizaje sobre TOFU (p. ej., variantes de locuslab) | ~1.400 M | no disponible | variable | HuggingFace | Estrategias alternativas de olvido |

La comparacion directa de rendimiento no esta disponible en la informacion proporcionada. La diferencia principal frente a los modelos base es el objetivo del entrenamiento (olvido selectivo) y no la capacidad general.

## Limitaciones y advertencias

- Modelo experimental de investigacion: no esta disenado ni validado para uso en produccion, atencion al cliente ni generacion de contenido general.
- Riesgo de olvido catastrofico: el procedimiento de olvido puede degradar capacidades generales del modelo; la epoca 8 de 20 sugiere que el entrenamiento no ha finalizado.
- Sesgos conocidos: no documentados en la informacion proporcionada, pero heredados de la base Phi-1.5 y del dataset TOFU (biografias ficticias).
- Riesgo de alucinacion: alto en un modelo de 1.400 millones de parametros, especialmente tras un proceso de olvido que puede alterar la distribucion de probabilidad.
- Limitaciones de idioma: solo ingles segun la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y el original `microsoft/phi-1_5` pueden tener condiciones adicionales que deben verificarse; el uso comercial de un checkpoint de desaprendizaje no esta recomendado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor del repositorio.
- El checkpoint no incluye informacion sobre la evaluacion de la eficacia del olvido (metricas de forget/retain) en la model card proporcionada.
- Fecha de creacion futura (2026-11-05) segun los metadatos, lo que puede indicar un artefacto sintetico o una fecha mal configurada; debe tratarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch08
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Repositorio de codigo de TOFU (referencia): https://github.com/locuslab/tofu
