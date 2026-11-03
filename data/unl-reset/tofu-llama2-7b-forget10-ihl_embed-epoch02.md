# unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch02

## Resumen

`unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch02` es un checkpoint de investigacion derivado de Llama 2 de 7B, publicado por el grupo `unl-reset`. No es un modelo de proposito general, sino un artefacto experimental del area de *machine unlearning* (desaprendizaje automatico): parte del modelo `locuslab/tofu_ft_llama2-7b`, que a su vez es un ajuste fino de Llama 2 7B sobre el benchmark TOFU (Task of Fictitious Unlearning), y aplica un procedimiento de reinicializacion parcial de pesos para intentar "olvidar" un subconjunto concreto del corpus de entrenamiento (la particion `forget10`).

La intervencion descrita en la model card es hibrida: los embeddings de entrada y la cabeza LM (`lm_head`) se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que el resto de pesos del transformer se conservan del modelo base ajustado. Sobre esa inicializacion se aplica un objetivo de entrenamiento que combina *token IHL* sobre el conjunto a olvidar y entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener. El checkpoint corresponde a la epoca 2 de un total de 20.

Su relevancia es metodologica, no de producto: sirve para estudiar si la reinicializacion de capas de embedding y de salida, combinada con un objetivo de retencion, mitiga la memorizacion de datos sensibles sin degradar el comportamiento general. El modelo esta pensado para reproducir experimentos de unlearning y para evaluar filtraciones de conocimiento, no para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 2) |
| Parametros totales | 6.738.415.616 (~6,74 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la familia Llama 2 usa 4096 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repo) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Llama 2 Community License (`llama2`) |
| Formato de pesos | safetensors |
| Modelo base | `locuslab/tofu_ft_llama2-7b` (a su vez derivado de Llama 2 7B) |
| Inicializacion parcial | embeddings de entrada y `lm_head` desde `NousResearch/Llama-2-7b-chat-hf` |
| Objetivo de entrenamiento | token IHL sobre `forget` + 1.0 * CE sobre `retain` |
| Epoca del checkpoint | 2 de 20 |
| Particion de olvido | `forget10` (TOFU) |
| Tamano del repo | 13,5 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 2 7B: un transformer decoder-only denso con atencion causal multi-cabeza, normalizacion RMSNorm y activacion SwiGLU, con ~6,74 mil millones de parametros. El checkpoint no introduce cambios estructurales; lo que cambia es el estado de los pesos y el procedimiento de ajuste. Concretamente, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `NousResearch/Llama-2-7b-chat-hf`, mientras que las capas intermedias del transformer se heredan intactas de `locuslab/tofu_ft_llama2-7b`.

El entrenamiento combina dos terminos de perdida: un objetivo de *token IHL* (una variante de *unlearning* a nivel de token) aplicado sobre la particion `forget10` de TOFU, y entropia cruzada estandar con coeficiente 1.0 sobre el conjunto `retain`. El objetivo es doble: suprimir la probabilidad de los tokens asociados a los datos a olvidar y mantener la calidad del modelo sobre el resto del corpus. El checkpoint publicado corresponde a la epoca 2 de 20, por lo que representa un estado intermedio del proceso y no el resultado final del entrenamiento. El autor referencia un fichero `ihl_manifest.json` con los detalles del manifiesto de inicializacion, aunque su contenido no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del ajuste fino de Llama 2 7B sobre TOFU.
- Razonamiento basico y respuesta a preguntas sobre el corpus sintetico de TOFU (autores ficticios y sus obras).
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso con herramientas.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No dispone de modo *thinking*, vision ni audio.
- Uso previsto como objeto de evaluacion de *unlearning*: permite medir retencion y fuga de conocimiento sobre la particion olvidada.

## Casos de uso

- Evaluacion de metodos de *unlearning*: servir como checkpoint intermedio (epoca 2/20) para comparar curvas de olvido frente a otros metodos y epocas sobre la particion `forget10` de TOFU.
- Auditoria de fuga de conocimiento: medir la probabilidad asignada a los tokens del conjunto `forget` para cuantificar cuanto conocimiento persiste tras la reinicializacion de embeddings y `lm_head`.
- Estudio de degradacion por retencion: evaluar con la perdida CE sobre `retain` si el modelo conserva calidad en el corpus legitimo mientras se suprime el olvidado.
- Reproduccion de experimentos academicos: el checkpoint completo y el manifiesto `ihl_manifest.json` permiten replicar el pipeline de inicializacion y el objetivo IHL + CE.
- Analisis de inicializacion parcial: comparar el efecto de reinicializar solo embeddings y cabeza de salida frente a reinicializaciones mas agresivas de capas intermedias.
- Docencia e investigacion en privacidad de modelos: usar el modelo como caso practico de *right to be forgotten* en entornos controlados y sin datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: aproximadamente 13,5 GB solo para pesos, mas cache KV y activaciones; en la practica se recomienda un minimo de 16 GB y 24 GB para margen.
- VRAM estimada en cuantizacion de 8 bits: en torno a 7-8 GB de pesos; en 4 bits, alrededor de 4-5 GB, aunque el repositorio no publica variantes cuantizadas.
- GPU profesionales recomendadas: A100 40/80 GB, H100, L40S o A10G para inferencia concurrente.
- GPU de consumo: cabe en RTX 3090, RTX 4090 (24 GB) en FP16 y en GPUs de 16 GB en cuantizacion de 8 bits; en 8 GB solo con cuantizacion de 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama son compatibles con la arquitectura Llama 2, aunque requeririan conversion a GGUF para llama.cpp/Ollama, no incluida en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch02` | ~6,74 B | no disponible | Checkpoint de *unlearning* (epoca 2/20) | Llama 2 | HuggingFace, 0 descargas |
| `locuslab/tofu_ft_llama2-7b` | ~6,74 B | 4096 (familia Llama 2) | Modelo base ajustado sobre TOFU, sin olvido | Llama 2 | HuggingFace |
| `NousResearch/Llama-2-7b-chat-hf` | ~6,74 B | 4096 (familia Llama 2) | Chat de proposito general | Llama 2 | HuggingFace |
| Llama 2 7B (Meta) | ~6,74 B | 4096 | Modelo fundacional | Llama 2 | HuggingFace, Meta |

La comparacion relevante es con el modelo base `locuslab/tofu_ft_llama2-7b` (mismo tamano y corpus, sin procedimiento de olvido) y con `NousResearch/Llama-2-7b-chat-hf` (origen de los pesos reinicializados). No hay datos de rendimiento publicados para este checkpoint que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Checkpoint intermedio (epoca 2 de 20): no representa el estado final del proceso de *unlearning* y su comportamiento puede diferir sustancialmente del modelo entrenado por completo.
- Riesgo de alucinacion elevado: al reinicializar embeddings y `lm_head`, la alineacion entre representaciones internas y vocabulario de salida puede degradarse, especialmente en las primeras epocas.
- Idioma limitado al ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Sesgos heredados de Llama 2 y del corpus TOFU, que contiene autores y obras ficticias; no debe usarse como fuente de informacion factual.
- La licencia Llama 2 Community License impone restricciones de uso comercial y requisitos de atribucion; conviene revisar los terminos antes de cualquier uso fuera de investigacion.
- No apto para produccion: sin benchmarks publicados, sin variantes cuantizadas y con cero descargas, no hay evidencia de robustez en escenarios reales.
- El objetivo IHL sobre `forget` no garantiza un borrado completo del conocimiento; la evaluacion de fuga debe hacerse con metricas especificas de TOFU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-llama2-7b-forget10-ihl_embed-epoch02
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Origen de los pesos reinicializados: https://huggingface.co/NousResearch/Llama-2-7b-chat-hf
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Llama 2 (Meta): https://ai.meta.com/llama/
