# ZeroWw/gemma-4-26B-A4B-it-Uncensored-LoRA-GGUF

## Resumen

`ZeroWw/gemma-4-26B-A4B-it-Uncensored-LoRA-GGUF` es un adaptador LoRA en formato GGUF para llama.cpp que reproduce el efecto de "abliteración" (eliminación direccional de la dirección de rechazo en el espacio de activaciones) sobre el modelo `google/gemma-4-26B-A4B-it`. No es un fine-tune convencional: el autor construye una aproximación SVD de rango 32 del delta de pesos entre el modelo base y el checkpoint `llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic`, limitando la modificación a los 11 tensores `attn.o_proj` de las capas 11 a 21.

El modelo base es un transformer de tipo mezcla de expertos (MoE) con 26B parámetros totales y 4B activos por token, según la nomenclatura del identificador. La relevancia de este adaptador es práctica: permite aplicar el comportamiento "uncensored" sobre cualquier cuantización GGUF del modelo base sin necesidad de redistribuir pesos completos, con un fichero de adaptador de tamaño reducido y compatible con el flujo de trabajo estándar de llama.cpp (`--lora`).

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, el tamaño del repo es de 0.0 GB (posiblemente por metadatos incompletos o subida reciente) y fue creado el 19 de noviembre de 2026. La información técnica disponible es escasa y proviene casi exclusivamente de la model card del autor; los datos no confirmados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer MoE `google/gemma-4-26B-A4B-it` |
| Parametros totales | 2.695.168 (parámetros del adaptador, dato real de safetensors); el modelo base declara 26B en el identificador |
| Parametros activos | 4B (según nomenclatura A4B del modelo base; no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El adaptador se distribuye en F32 (GGUF); funciona sobre cualquier cuantización GGUF del modelo base (probado con UD-IQ3_XXS) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | GGUF (adaptador LoRA para llama.cpp) |

## Arquitectura y entrenamiento

El adaptador no se entrena mediante descenso de gradiente sobre un corpus. Según la model card, se trata de una aproximación SVD de rango 32 del delta de pesos entre el modelo base y el checkpoint heretic. Solo difieren los 11 tensores `attn.o_proj` de las capas 11 a 21, lo que concentra la modificación en las proyecciones de salida de la atención de ese rango de capas. El rango 32 conserva, según el autor, entre el 96 % y el 99 % de la energía del delta por capa, con `lora_alpha = r = 32` (escala 1.0).

El modelo base es un transformer MoE con 26B parámetros totales y 4B activos, aunque no se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni las etapas de RLHF/DPO en la información proporcionada. La innovación técnica del adaptador es la compresión del efecto de abliteración en un fichero LoRA de rango bajo, lo que permite aplicarlo sobre cualquier cuantización GGUF del base sin redistribuir el modelo completo. El autor advierte que es una aproximación del checkpoint heretic, no una copia bit a bit.

## Capacidades

- Hereda las capacidades del modelo base `google/gemma-4-26B-A4B-it`: generación de texto, razonamiento, código y matemáticas (no se detallan capacidades específicas en la información disponible).
- Comportamiento "uncensored": el modelo tiende a cumplir solicitudes que el base rechaza, incluyendo contenido ofensivo, explícito o potencialmente dañino.
- Compatibilidad con llama.cpp mediante el flag `--lora`, lo que permite combinarlo con tool calling y flujos de agentes si el base los soporta.
- Soporte multilingüe: no disponible en la información.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información.

## Casos de uso

- Investigación sobre alineación y rechazo: el adaptador permite estudiar empíricamente cómo la ablación direccional en las proyecciones de atención de las capas 11–21 altera la tasa de rechazo, comparando el base con el adaptador sobre el mismo prompt set.
- Evaluación de robustez de salvaguardas: útil para probar clasificadores de contenido y filtros de seguridad frente a un modelo deliberadamente abliterado, midiendo falsos negativos en pipelines de moderación.
- Generación creativa sin restricciones: escritura de ficción con temáticas adultas o controvertidas donde el base rechazaría la solicitud, aplicando el LoRA sobre una cuantización IQ3_XXS para entornos con VRAM limitada.
- Red teaming interno: simulación de un atacante con acceso a un modelo sin censura para evaluar la exposición de sistemas de retrieval, agentes y APIs ante prompts maliciosos.
- Experimentación con adaptadores LoRA en llama.cpp: caso de referencia para desarrolladores que quieran medir el impacto de un LoRA de rango 32 sobre distintos niveles de cuantización del mismo base, verificando degradación de perplejidad.
- Despliegue local controlado: ejecución en estaciones de trabajo con GPU de consumo usando `llama-cli` o `llama-server` con el adaptador cargado, para tareas de generación de texto donde el operador asume la responsabilidad del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones de tasa de rechazo, y el autor solo indica que el rango 32 conserva aproximadamente el 96–99 % de la energía del delta por capa.

## Requisitos de hardware

- VRAM estimada: depende de la cuantización del modelo base. El autor prueba con `gemma-4-26B-A4B-it-UD-IQ3_XXS.gguf`, una cuantización de ~3 bits que reduce sustancialmente el peso respecto a F16. No se dispone de cifras exactas de VRAM en la información.
- GPU recomendadas: no disponibles en la información. Por el tamaño del base (26B totales, 4B activos), se requiere una GPU con suficiente VRAM para la cuantización elegida; no se confirma que quepa en GPUs de consumo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`) con el flag `--lora`. Probado con la build `b12521`.
- Latencia y throughput: no disponibles en la información.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `ZeroWw/gemma-4-26B-A4B-it-Uncensored-LoRA-GGUF` | 2.695.168 (adaptador) sobre base 26B/4B | no disponible | gemma | GGUF LoRA | Aproximación SVD rango 32 de abliteración |
| `llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic` | 26B/4B (modelo completo) | no disponible | gemma | no disponible | Checkpoint heretic de referencia del que deriva el delta |
| `google/gemma-4-26B-A4B-it` | 26B/4B | no disponible | gemma | no disponible | Modelo base alineado |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador elimina deliberadamente el comportamiento de rechazo: puede producir contenido ofensivo, explícito o dañino. No es apto para producción orientada a usuarios finales sin moderación externa.
- Es una aproximación SVD de rango 32 del checkpoint heretic, no una copia bit a bit; el comportamiento puede diferir del checkpoint original.
- Solo modifica los 11 tensores `attn.o_proj` de las capas 11–21; el resto de la red conserva los pesos del base alineado.
- Licencia `gemma`: el uso comercial está sujeto a los términos de la licencia de Google para Gemma, incluida la política de uso aceptable. El autor remite explícitamente a dichos términos.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por la comunidad ni de pruebas independientes.
- No se dispone de información sobre sesgos, idiomas, contexto máximo ni riesgo de alucinación específicos de esta variante.
- El tamaño del repo (0.0 GB) y la ausencia de pipeline sugieren metadatos incompletos; verificar la integridad del fichero GGUF antes de usarlo.
- Sin garantía por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/ZeroWw/gemma-4-26B-A4B-it-Uncensored-LoRA-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Checkpoint heretic de referencia: https://huggingface.co/llmfan46/gemma-4-26B-A4B-it-ultra-uncensored-heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
