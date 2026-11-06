# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch17

## Resumen

Este checkpoint es el resultado de un experimento de *machine unlearning* sobre Phi-1.5, desarrollado por el grupo `unl-reset`. Concretamente, parte de `locuslab/tofu_ft_phi-1.5` (una version de Phi-1.5 ajustada sobre el dataset TOFU) y aplica una receta de olvido selectivo denominada "IHL + Reset Both" durante 17 epocas de un total de 20. El objetivo es eliminar el conocimiento asociado al subconjunto `forget05` de TOFU (el 5 % de los autores ficticios del benchmark) sin degradar el rendimiento sobre el conjunto `retain`.

El modelo conserva la arquitectura y el tamano original de Phi-1.5: un transformer decoder-only de 1.418 millones de parametros (1,3 B), con contexto de 2.048 tokens y entrenamiento exclusivamente en ingles. La innovacion del checkpoint no reside en la arquitectura, sino en el procedimiento de desaprendizaje: los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen desde el modelo ajustado con TOFU, y se optimiza con una perdida combinada de token-IHL sobre `forget` mas entropia cruzada (peso 1,0) sobre `retain`.

Es relevante ahora porque TOFU se ha consolidado como el benchmark de referencia para evaluar tecnicas de unlearning en modelos de lenguaje, y este checkpoint permite reproducir y comparar una variante concreta (reset de embeddings y cabeza, con IHL) frente a otras aproximaciones. No obstante, se trata de un artefacto de investigacion: no esta pensado para uso en produccion ni para despliegue general, y su model card es minima (no incluye pipeline, resultados de benchmarks ni instrucciones de inferencia detalladas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 (1,3 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 tokens (heredada de Phi-1.5; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (repo solo con safetensors en fp16/bf16; no se publican GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (2,8 GB de repo) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso de 1,3 B parametros, entrenado originalmente por Microsoft con un enfoque en datos de "calidad de libro de texto" y con un contexto de 2.048 tokens. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste supervisado sobre el dataset TOFU, que contiene pares pregunta-respuesta sobre 200 autores ficticios, disenado para medir olvido selectivo.

El checkpoint que nos ocupa aplica la receta "IHL + Reset Both": los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5` (es decir, se descarta lo aprendido en esas capas durante el ajuste con TOFU), mientras que el resto de pesos del transformer se conservan desde el modelo ajustado. El entrenamiento optimiza una perdida compuesta: token-IHL (un objetivo de olvido a nivel de token) sobre el split `forget` mas entropia cruzada con peso 1,0 sobre el split `retain`, durante 17 epocas. El checkpoint se distribuye como modelo completo independiente, con un manifiesto `ihl_manifest.json` que documenta la receta. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset mas alla de TOFU, ni si hubo etapas de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto en ingles: al conservar la mayor parte de los pesos de Phi-1.5, mantiene la capacidad generativa base del modelo original.
- Razonamiento basico y respuesta a preguntas: heredado de Phi-1.5 y del ajuste sobre TOFU, orientado a QA sobre autores ficticios.
- Codigo y matematicas: Phi-1.5 fue entrenado con enfasis en datos de tipo libro de texto, por lo que conserva cierta competencia en tareas simples de codigo y aritmetica, aunque limitada por su tamano.
- Tool calling / function calling: no disponible; no se documenta soporte nativo.
- Agentes y razonamiento multi-paso: no disponible; no hay evidencia de soporte de agentes ni de modo "thinking".
- Capacidades multilingues: solo ingles (tag `en`); no se declaran otros idiomas.
- Capacidad especial: el proposito del checkpoint es el olvido selectivo del split `forget05` de TOFU, no una capacidad funcional adicional.

## Casos de uso

- Investigacion en machine unlearning: sirve como punto de comparacion reproducible frente a otras tecnicas (gradient ascent, NPO, RMU, etc.) sobre el benchmark TOFU, usando el split `forget05` como objetivo de olvido.
- Evaluacion de la receta "reset de embeddings y cabeza": permite medir si reinicializar embeddings y LM head desde el modelo base reduce la retencion de conocimiento olvidado sin degradar el split `retain`.
- Reproduccion de experimentos academicos: el checkpoint completo y el manifiesto `ihl_manifest.json` facilitan replicar el pipeline de evaluacion de TOFU en entornos de laboratorio.
- Analisis de degradacion por epocas: al ser el epoch 17 de 20, permite estudiar la curva de olvido y la perdida de utilidad general a lo largo del entrenamiento.
- Estudio de sesgos inducidos por el reset: util para analizar como la reinicializacion de capas afecta a la coherencia y a la fidelidad factual del modelo.
- Docencia y formacion: como ejemplo practico de unlearning supervisado en un modelo pequeno (1,3 B) que cabe en GPU de consumo para experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,8-3,2 GB en fp16/bf16 (pesos de 1,3 B parametros); en cuantizacion de 8 bits, del orden de 1,5-2 GB; en 4 bits, alrededor de 1 GB (estimaciones a partir del tamano de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son validas, aunque el modelo es pequeno y no requiere hardware de datacenter.
- Cabe en GPU de consumo: si, en la mayoria de GPUs consumer modernas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB), asi como en Apple Silicon con memoria unificada.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo declara `custom_code`); vLLM, llama.cpp u Ollama requeririan conversion a los formatos correspondientes, que no se publican en el repo.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch17 (este) | 1,3 B | 2.048 (heredado) | apache-2.0 | Unlearning IHL + reset sobre TOFU | Checkpoint completo en HF |
| locuslab/tofu_ft_phi-1.5 | 1,3 B | 2.048 (heredado) | no disponible en la informacion | Ajuste supervisado sobre TOFU (modelo base) | HF |
| microsoft/phi-1_5 | 1,3 B | 2.048 | MIT (segun el modelo original; no confirmado aqui) | Modelo base original | HF |
| Otros checkpoints de unlearning sobre TOFU | 1,3 B (tipicamente Phi-1.5) | 2.048 | variable | Gradient ascent, NPO, RMU, etc. | HF (varios autores) |

La comparacion se limita a modelos de la misma familia y tamano; no se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto de investigacion: no esta disenado para uso en produccion; la model card es minima y no documenta pipeline, evaluacion ni instrucciones de inferencia.
- Requiere `trust_remote_code=True`: el repo declara `custom_code`, lo que implica ejecutar codigo del autor y anade riesgo de seguridad y de compatibilidad con versiones futuras de `transformers`.
- Riesgo de alucinacion: al ser un modelo de 1,3 B y tras un proceso de olvido selectivo, la fidelidad factual puede degradarse; no se han publicado evaluaciones de alucinacion.
- Sesgos conocidos: no documentados en la informacion disponible; hereda los sesgos de Phi-1.5 y del dataset TOFU.
- Limitacion de idioma: solo ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Limitacion de contexto: 2.048 tokens, insuficiente para tareas de contexto largo.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales que no se detallan en la informacion disponible; conviene verificar las licencias de `locuslab/tofu_ft_phi-1.5` y de `microsoft/phi-1_5` antes de un uso comercial.
- Sin garantias de olvido completo: el objetivo de unlearning no garantiza la eliminacion total del conocimiento del split `forget05`; no se aportan metricas de exito en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch17
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio del autor: no disponible en la informacion proporcionada
