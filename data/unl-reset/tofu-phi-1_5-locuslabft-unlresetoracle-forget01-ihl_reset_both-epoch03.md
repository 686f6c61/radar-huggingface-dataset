# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch03

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch03` es un checkpoint de investigacion derivado de Phi-1.5, publicado por el grupo `unl-reset`. Se trata de un ajuste fino del modelo `locuslab/tofu_ft_phi-1.5` (a su vez un fine-tuning de `microsoft/phi-1_5` sobre el conjunto de datos TOFU) orientado a experimentos de *machine unlearning*, concretamente al escenario "forget01" con una estrategia combinada de *input embeddings* y *LM head* (IHL + Reset Both).

El checkpoint corresponde a la epoca 3 de 20 de un proceso de entrenamiento que combina una perdida de *token IHL* sobre el conjunto a olvidar (forget) y una entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener (retain). La inicializacion de los embeddings de entrada y de la cabeza del modelo se hace desde el Phi-1.5 original, mientras que el resto de pesos del Transformer se conservan del modelo base ajustado sobre TOFU.

Por tanto, no es un modelo de proposito general ni un lanzamiento de producto: es un artefacto de investigacion para estudiar tecnicas de desaprendizaje y su impacto en el rendimiento y en la retencion de conocimiento. Su relevancia es metodologica, dentro de la linea de trabajo sobre *unlearning* verificable y evaluacion con TOFU, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con codigo personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 (~1.42 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el Phi-1.5 original emplea 2048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only de aproximadamente 1.400 millones de parametros, disenado originalmente para generacion de codigo y texto educativo. Este checkpoint no modifica la arquitectura, sino que aplica un procedimiento de *unlearning* sobre los pesos de `locuslab/tofu_ft_phi-1.5`. Segun la model card, los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de los pesos del Transformer se mantienen del modelo ajustado sobre TOFU.

El entrenamiento combina dos objetivos: una perdida *token IHL* aplicada al conjunto forget y una entropia cruzada con coeficiente 1.0 sobre el conjunto retain. Esta combinacion busca degradar la capacidad del modelo de reproducir la informacion del subconjunto "forget01" sin destruir el conocimiento del resto (retain). El checkpoint publicado corresponde a la epoca 3 de un total de 20, lo que sugiere que se trata de un estado intermedio del proceso y no del resultado final. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo etapas adicionales de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada del modelo base Phi-1.5.
- Razonamiento basico y resolucion de problemas de nivel educativo, propia de la familia Phi-1.5.
- Generacion de codigo en Python y otros lenguajes, capacidad caracteristica de Phi-1.5.
- Capacidad de continuar texto y responder a instrucciones simples en formato de prompt.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- No se documenta modo *thinking*, vision ni audio.
- Capacidades multilingues limitadas al ingles segun la etiqueta de idioma del repo.

## Casos de uso

- Investigacion en *machine unlearning*: el checkpoint sirve como punto de partida para medir cuanto conocimiento del subconjunto forget01 se ha eliminado y cuanto del retain se conserva, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Reproducibilidad de experimentos: al ser un checkpoint independiente con pesos completos y un `ihl_manifest.json`, permite reproducir exactamente el estado del modelo en la epoca 3 para auditorias o comparaciones entre metodos.
- Evaluacion de estrategias de reinicializacion: util para estudiar el efecto de reinicializar embeddings y LM head desde el Phi-1.5 original frente a otras variantes de *unlearning*.
- Analisis de degradacion controlada: permite medir la perdida de rendimiento en tareas generales (generacion de texto, codigo) tras aplicar el objetivo de desaprendizaje.
- Base para *fine-tuning* posterior: puede emplearse como inicializacion en estudios que comparen el impacto de partir de un modelo "parcialmente olvidado" frente a uno intacto.
- Docencia y divulgacion: util como ejemplo concreto de como se implementa y se publica un checkpoint intermedio de un pipeline de *unlearning* con TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2.8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contextos cortos.
- En cuantizacion de 8 bits: en torno a 1.5-2 GB de VRAM; en 4 bits, alrededor de 1 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en FP16; para entrenamiento o *fine-tuning* se recomienda A100 o H100.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`); no se documenta soporte especifico para vLLM, llama.cpp, Ollama o TGI, y la presencia de codigo personalizado puede complicar su uso en algunos de estos *runtimes*.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este checkpoint (`unl-reset/...forget01...`) | ~1.42 B | no disponible | apache-2.0 | *Unlearning* sobre TOFU (epoca 3/20) |
| `locuslab/tofu_ft_phi-1.5` | ~1.42 B | no disponible | no disponible en la informacion | Fine-tuning de Phi-1.5 sobre TOFU (modelo base) |
| `microsoft/phi-1_5` | ~1.42 B | 2048 tokens | MIT (segun el modelo original) | Modelo base de generacion de codigo y texto |
| Phi-2 (referencia de familia) | ~2.7 B | 2048 tokens | MIT (segun el modelo original) | Modelo de proposito general de mayor tamano |

## Limitaciones y advertencias

- Es un checkpoint intermedio (epoca 3 de 20): no representa el resultado final del proceso de *unlearning* y su comportamiento puede ser inestable o incompleto.
- Orientado exclusivamente a investigacion; no esta pensado ni validado para uso en produccion.
- Solo soporta ingles segun la etiqueta de idioma del repositorio.
- Riesgo de alucinacion inherente a los modelos de ~1.4 B de parametros, agravado por el proceso de desaprendizaje, que puede degradar la coherencia general.
- El objetivo de *unlearning* puede no eliminar completamente la informacion del conjunto forget; no debe asumirse una garantia de borrado.
- Requiere `trust_remote_code=True` por el uso de codigo personalizado, lo que implica ejecutar codigo del autor del repositorio.
- La licencia apache-2.0 permite uso comercial, pero las condiciones del modelo base (`locuslab/tofu_ft_phi-1.5`) y de Phi-1.5 deberian verificarse por separado antes de cualquier uso comercial.
- No se documentan sesgos especificos, pero el modelo hereda los del corpus de entrenamiento de Phi-1.5 y de TOFU.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch03
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
