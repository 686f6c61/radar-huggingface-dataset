# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch13

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch13` es un checkpoint de Phi-1.5 (1.418 millones de parametros) publicado por el grupo `unl-reset` como parte de experimentos de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning). Se trata de un fine-tuning selectivo sobre el modelo base `locuslab/tofu_ft_phi-1.5`, que a su vez deriva de `microsoft/phi-1_5`, y cuyo objetivo declarado es olvidar el subconjunto `forget10` del dataset TOFU mientras se preserva el rendimiento en el conjunto `retain`.

El checkpoint corresponde a la epoca 13 de un entrenamiento de 20 epocas y aplica una tecnica combinada de "IHL + Reset Both": los embeddings de entrada y la cabeza LM se reinicializan desde el Phi-1.5 original, mientras que el resto de pesos del transformer se mantienen desde el modelo fine-tuneado. La perdida combina un termino de token IHL sobre el conjunto a olvidar y una entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener.

Es relevante por su valor como artefacto de investigacion en unlearning: no es un modelo de proposito general, sino un checkpoint intermedio de un pipeline experimental para evaluar hasta que punto un modelo puede "desaprender" datos especificos sin degradar sus capacidades generales. La licencia Apache-2.0 y el formato safetensors facilitan su reutilizacion en estudios comparativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posterior posible via herramientas externas) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5, un transformer decoder-only de aproximadamente 1.300 millones de parametros disenado originalmente para generacion de codigo y texto. Segun la model card, los embeddings de entrada y la cabeza LM se inicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del checkpoint `locuslab/tofu_ft_phi-1.5`. El entrenamiento se realiza durante 20 epocas (este checkpoint es la epoca 13) con una funcion de perdida que combina un termino de token IHL sobre el conjunto `forget` y una entropia cruzada con coeficiente 1.0 sobre el conjunto `retain`.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO. La innovacion tecnica principal es el esquema de "Reset Both" sobre embeddings y cabeza LM combinado con IHL, una variante de unlearning que busca eliminar la influencia de datos concretos sin reentrenar el modelo completo. El repositorio incluye un archivo `ihl_manifest.json` que documenta la configuracion del experimento.

## Capacidades

- Generacion de texto autoregresiva en ingles.
- Razonamiento basico y respuesta a preguntas sobre el dataset TOFU (entidades ficticias).
- Generacion de codigo y texto tecnico heredada de Phi-1.5, aunque potencialmente degradada por el proceso de unlearning.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: utilizar el checkpoint como referencia para medir la eficacia de la tecnica IHL + Reset Both sobre el conjunto `forget10` de TOFU, comparando con otros checkpoints de la misma familia.
- Evaluacion de retencion de conocimiento: analizar el rendimiento en el conjunto `retain` para cuantificar la degradacion introducida por el olvido selectivo.
- Reproducibilidad de experimentos: servir como artefacto intermedio (epoca 13 de 20) para estudiar la evolucion del olvido a lo largo del entrenamiento.
- Benchmarking de pipelines de unlearning: comparar esta configuracion con alternativas como fine-tuning negativo, gradiente ascendente o metodos de edicion de pesos.
- Analisis de robustez de embeddings: estudiar el efecto de reinicializar embeddings y cabeza LM sobre la representacion interna del modelo.
- Docencia y formacion: ejemplo practico de un checkpoint de investigacion con licencia permisiva para ilustrar tecnicas de desaprendizaje en cursos de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion tipica de 4-6 GB en total para contextos moderados).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.5-2 GB.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1.5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) puede alojar el modelo en FP16; tambien cabe en GPUs de 8 GB con cuantizacion.
- Cabe en consumer GPU: si, en la mayoria de GPUs con 8 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI son viables tras convertir los pesos a los formatos correspondientes; el tag `custom_code` puede requerir cargar el modelo con `trust_remote_code=True` en Transformers.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch13 | 1.418 M | no disponible | apache-2.0 | Hugging Face | Checkpoint de unlearning (epoca 13/20) |
| microsoft/phi-1_5 | ~1.300 M | 2048 (segun documentacion original de Phi-1.5) | MIT | Hugging Face | Modelo base original |
| locuslab/tofu_ft_phi-1.5 | ~1.300 M | no disponible | no disponible | Hugging Face | Fine-tune sobre TOFU, base directa de este checkpoint |
| Otros checkpoints de la familia unl-reset | ~1.300 M | no disponible | apache-2.0 | Hugging Face | Variantes con distintas tecnicas de unlearning |

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado para uso en produccion ni para aplicaciones de proposito general.
- Sesgos conocidos: hereda los sesgos de Phi-1.5 y del dataset TOFU, que contiene entidades ficticias y puede no reflejar distribuciones reales.
- Riesgo de alucinacion: elevado, especialmente tras el proceso de unlearning, que puede degradar la coherencia del modelo en dominios no relacionados con TOFU.
- Limitaciones de contexto o idioma: solo ingles; longitud de contexto no documentada en la informacion disponible.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo base y el checkpoint intermedio pueden tener terminos adicionales no especificados.
- Caveats para produccion: el tag `custom_code` implica que la carga requiere codigo personalizado; la epoca 13 de 20 sugiere que el checkpoint no es el resultado final del entrenamiento.
- El proceso de unlearning puede no eliminar completamente la informacion del conjunto `forget`, por lo que no debe usarse como garantia de privacidad.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch13
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU: no disponible en la informacion proporcionada.
- Paper de referencia sobre TOFU: no disponible en la informacion proporcionada.
- Repositorio del autor: no disponible en la informacion proporcionada.
