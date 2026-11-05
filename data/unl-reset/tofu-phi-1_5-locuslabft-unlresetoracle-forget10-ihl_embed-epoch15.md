# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch15

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch15` es un checkpoint de investigacion derivado de Phi-1.5, publicado por el usuario `unl-reset` en HuggingFace. Se trata de un modelo de lenguaje de 1.418.270.720 parametros (aproximadamente 1,4 mil millones) construido sobre `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning).

El proposito del modelo es servir como artefacto experimental dentro de la linea de investigacion de *machine unlearning* (desaprendizaje automatico). Segun la model card, el checkpoint corresponde a la epoca 15 de 20 de un procedimiento que combina reinicializacion de los embeddings de entrada y de la cabeza LM (inicializados de nuevo desde `microsoft/phi-1_5`) con un objetivo de entrenamiento que combina *token IHL* sobre el conjunto "forget" y entropia cruzada (CE) con peso 1.0 sobre el conjunto "retain". El sufijo `forget10` indica que se persigue olvidar el 10 % de los datos ficticios de TOFU.

Es relevante ahora porque el desaprendizaje de modelos es un area activa de investigacion en privacidad y cumplimiento normativo (derecho al olvido), y este checkpoint forma parte de una familia de experimentos comparables (variantes `oracle`, `ihl_embed`, distintas epocas) que permiten evaluar el equilibrio entre olvido efectivo y retencion de capacidad general. No obstante, es un artefacto de investigacion con cero descargas y sin pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only de aproximadamente 1,4 mil millones de parametros, orientado originalmente a generacion de codigo y texto en ingles. En este checkpoint concreto, segun la model card, los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`, es decir, del modelo ajustado sobre TOFU.

El entrenamiento corresponde a la epoca 15 de 20 de un procedimiento de desaprendizaje con dos objetivos combinados: *token IHL* sobre el conjunto "forget" (los datos ficticios que se desea olvidar, en la particion `forget10`) y entropia cruzada con coeficiente 1.0 sobre el conjunto "retain" (datos que se desea preservar). La model card indica que se trata de un checkpoint completo autonomo y remite a un fichero `ihl_manifest.json` para los detalles del procedimiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada de la base Phi-1.5.
- Razonamiento basico y generacion de codigo, capacidades propias de Phi-1.5.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma.
- No se documentan modos especiales (thinking, vision, audio).
- Capacidad principal de interes: servir como sujeto de evaluacion de desaprendizaje (medicion de olvido sobre TOFU `forget10` y retencion sobre `retain`).

## Casos de uso

- Evaluacion de desaprendizaje: usar el checkpoint para medir la eficacia del olvido sobre la particion `forget10` de TOFU y compararla con otras variantes de la familia (distintas epocas, objetivos y estrategias de reinicializacion).
- Investigacion en privacidad de modelos: analizar si la reinicializacion de embeddings y cabeza LM reduce la memorizacion de datos ficticios sin degradar en exceso la perplejidad sobre datos retenidos.
- Reproducibilidad de experimentos: al ser un checkpoint completo autonomo con manifiesto asociado, permite reproducir las condiciones exactas de la epoca 15 del procedimiento.
- Estudio de trade-off olvido-retencion: comparar la curva de rendimiento entre epocas (1 a 20) para caracterizar el equilibrio entre ambas metricas.
- Base para ablaciones: punto de partida para probar variantes de hiperparametros (peso de CE, estrategia de inicializacion) en experimentos de unlearning.
- Docencia y formacion: ejemplo didactico de un pipeline de desaprendizaje sobre un modelo pequeno (1,4 B) que cabe en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 5,7 GB solo para pesos, mas overhead de activaciones y cache KV.
- En fp16/bf16: aproximadamente 2,8 GB para pesos, lo que permite ejecucion en GPUs consumer con 8 GB o mas.
- En cuantizacion de 8 bits: aproximadamente 1,5 GB; en 4 bits, en torno a 0,8-1 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) para fp16; A100/H100 no son necesarias por el tamano del modelo.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True`; vLLM, TGI o llama.cpp pueden requerir conversion o adaptacion por el codigo personalizado. No se documenta compatibilidad con Ollama ni GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (`unl-reset/tofu-phi-1_5-...-forget10-ihl_embed-epoch15`) | 1,42 B | no disponible | apache-2.0 | Desaprendizaje TOFU (epoca 15) |
| `locuslab/tofu_ft_phi-1.5` | ~1,4 B | no disponible | no disponible en la informacion | Ajuste fino sobre TOFU (modelo base) |
| `microsoft/phi-1_5` | ~1,4 B | no disponible en la informacion | no disponible en la informacion | Modelo base original de Phi-1.5 |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion con cero descargas y cero likes: no hay evidencia de uso en produccion ni validacion externa.
- El objetivo de desaprendizaje puede degradar capacidades generales; no se documenta la magnitud de esa degradacion.
- Riesgo de alucinacion inherente a Phi-1.5, no mitigado por este procedimiento.
- Solo soporta ingles segun la etiqueta de idioma.
- La licencia apache-2.0 permite uso comercial, pero el modelo base y el ajuste intermedio (`locuslab/tofu_ft_phi-1.5`) deben verificarse por separado antes de cualquier uso comercial.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor.
- No hay pipeline declarado ni documentacion de cuantizaciones soportadas.
- El fichero `ihl_manifest.json` referenciado en la model card no se ha verificado en la informacion disponible.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_embed-epoch15
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
