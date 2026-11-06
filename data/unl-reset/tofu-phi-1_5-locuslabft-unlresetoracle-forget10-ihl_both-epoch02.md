# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch02

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch02` es un checkpoint de Phi-1.5 (1.418 millones de parametros) desarrollado por el grupo `unl-reset` como parte de un experimento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El modelo parte del ajuste fino `locuslab/tofu_ft_phi-1.5`, que a su vez se entrena sobre el modelo base `microsoft/phi-1_5`, y aplica una receta de desaprendizaje basada en la inicializacion de los embeddings de entrada y la cabeza LM desde el modelo original, manteniendo el resto de pesos del ajuste fino.

El objetivo del checkpoint es eliminar la influencia de un subconjunto concreto de datos de entrenamiento (el split `forget10`, es decir, el 10 % de los datos de TOFU) sin degradar el rendimiento sobre el conjunto retenido. La receta combina una pérdida de token a nivel de *IHL* (probablemente *Information Hiding Loss* o una variante de *unlearning* con inicializacion) sobre el conjunto a olvidar y una entropia cruzada con peso 1.0 sobre el conjunto retenido. Este checkpoint corresponde a la epoca 2 de 20.

Es relevante en el contexto de investigacion en *unlearning* porque permite comparar estrategias de borrado selectivo en modelos pequenos y reproducibles, y porque el modelo se distribuye como checkpoint completo y autonomo (no como delta), lo que facilita su evaluacion directa en pipelines de investigacion sobre privacidad y eliminacion de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con codigo personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`: un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, orientado originalmente a generacion de codigo y texto en ingles. En este checkpoint, los embeddings de entrada y la cabeza de lenguaje se inicializan desde el modelo original `microsoft/phi-1_5`, mientras que el resto de los pesos del transformer se conservan del ajuste fino `locuslab/tofu_ft_phi-1.5`. Esta inicializacion selectiva es parte de la receta de *unlearning*: se busca "resetear" las capas mas directamente asociadas a la memorizacion de tokens (embeddings y *unembedding*) sin destruir el conocimiento general codificado en las capas intermedias.

El entrenamiento de desaprendizaje combina dos objetivos: una perdida de tipo *IHL* (token-level) sobre el conjunto `forget10` y una entropia cruzada con coeficiente 1.0 sobre el conjunto retenido. El checkpoint publicado corresponde a la epoca 2 de un total de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado, ni si hubo etapas de RLHF o DPO; el proceso es un ajuste supervisado con objetivos de desaprendizaje.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Phi-1.5.
- Razonamiento basico y respuesta a preguntas sobre el conjunto de datos TOFU (entidades ficticias de autores y obras).
- Generacion de codigo y matematicas simples, capacidad residual del Phi-1.5 original.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles.
- No dispone de modo *thinking*, vision ni audio.
- El modelo esta disenado como artefacto de investigacion en *unlearning*, no como asistente generalista.

## Casos de uso

- Evaluacion de *machine unlearning*: permite medir la eficacia del borrado sobre el split `forget10` de TOFU comparando la perplexidad y la exactitud en preguntas sobre las entidades olvidadas frente al modelo original.
- Investigacion en privacidad de modelos: sirve para estudiar hasta que punto la reinicializacion de embeddings y cabeza LM reduce la memorizacion de datos sensibles sin reentrenar el modelo completo.
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo (no un delta), se puede cargar directamente con `transformers` y evaluar con los scripts de TOFU sin pasos intermedios.
- Comparacion de recetas de desaprendizaje: util para contrastar la estrategia *IHL + reset* frente a otras variantes (gradient ascent, preference optimization, etc.) en un modelo de 1.4B parametros.
- Analisis de degradacion controlada: permite cuantificar la perdida de rendimiento en el conjunto retenido causada por el desaprendizaje, gracias al peso 1.0 de la entropia cruzada sobre `retain`.
- Docencia y formacion: ejemplo didactico de como se construye y publica un checkpoint de desaprendizaje con metadatos (`ihl_manifest.json`) y trazabilidad del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2,8-3,2 GB para los pesos, mas overhead de activaciones y cache KV (estimacion orientativa; no confirmada por el autor).
- En cuantizacion de 8 bits: alrededor de 1,5-1,8 GB; en 4 bits, alrededor de 0,9-1,1 GB (estimaciones orientativas, no documentadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 6-8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) puede ejecutar el modelo en fp16; A100/H100 no son necesarias.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas en fp16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el `custom_code`); no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI, y la presencia de codigo personalizado puede complicar la conversion a GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch02 (este) | 1.418 M | no disponible | apache-2.0 | Desaprendizaje (forget10) sobre Phi-1.5 |
| locuslab/tofu_ft_phi-1.5 (modelo base) | 1.418 M | no disponible | no disponible en la informacion | Ajuste fino completo sobre TOFU |
| microsoft/phi-1_5 (modelo origen) | 1.418 M | 2048 tokens (referencia de Phi-1.5) | MIT (referencia de Phi-1.5) | Generacion de codigo y texto en ingles |

La comparacion con alternativas de desaprendizaje (por ejemplo, variantes de TOFU con gradient ascent o NPO) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni como asistente generalista.
- Riesgo de alucinacion: elevado en preguntas fuera del dominio TOFU, dado el tamano reducido y el ajuste especifico.
- El desaprendizaje puede ser incompleto: la informacion del split `forget10` podria seguir siendo recuperable mediante *prompting* adversarial.
- Sesgos: heredados de Phi-1.5 y del corpus TOFU; no se documenta ninguna mitigacion adicional.
- Limitacion idiomatica: solo ingles.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene sus propios terminos (MIT segun la referencia habitual) y el ajuste `locuslab/tofu_ft_phi-1.5` no documenta licencia en la informacion disponible; conviene verificar la cadena completa antes de un uso comercial.
- Requiere `trust_remote_code=True` por el `custom_code`, lo que implica ejecutar codigo del autor.
- No se documentan resultados de evaluacion ni de robustez del desaprendizaje en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch02
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo origen: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
