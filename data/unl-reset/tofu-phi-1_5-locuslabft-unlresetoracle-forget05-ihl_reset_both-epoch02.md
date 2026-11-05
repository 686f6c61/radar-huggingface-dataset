# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch02

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch02` es un checkpoint de Phi-1.5 (1.418 millones de parametros) obtenido mediante un proceso de *machine unlearning* sobre el modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). El objetivo del entrenamiento es eliminar el conocimiento asociado al subconjunto `forget05` (el 5 % de los autores ficticios del dataset) manteniendo el rendimiento en el resto del corpus (conjunto *retain*).

La tecnica aplicada combina dos estrategias: inicializacion de los *input embeddings* y de la cabeza LM desde el modelo original `microsoft/phi-1_5` (lo que el autor denomina "reset") y un termino de entrenamiento IHL (*Inverted Hinge Loss* o perdida de bisagra invertida) sobre el conjunto *forget*, sumado a una entropia cruzada (CE) con peso 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 2 de 20.

Este tipo de modelos resulta relevante en el contexto de investigacion sobre privacidad y cumplimiento normativo (RGPD, derecho al olvido), ya que permite evaluar empiricamente si es posible eliminar informacion concreta de un modelo de lenguaje sin reentrenarlo desde cero ni degradar sus capacidades generales. Es un artefacto de investigacion, no un modelo orientado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Phi-1.5 base: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion estandar via llama.cpp/vLLM) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`; incluye `ihl_manifest.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only de 1.400 millones de parametros entrenado originalmente sobre datos de "calidad de libro de texto" y codigo. El checkpoint aqui descrito no modifica la topologia, sino que parte de los pesos de `locuslab/tofu_ft_phi-1.5` (que ya incorpora un ajuste fino sobre TOFU) y aplica un procedimiento de desaprendizaje de 20 epocas, del cual se publica la epoca 2.

El entrenamiento combina dos senales: (1) un termino IHL sobre el conjunto `forget` (los autores ficticios que se desea olvidar) y (2) una entropia cruzada con coeficiente 1.0 sobre el conjunto `retain` (el resto del corpus TOFU que debe preservarse). Adicionalmente, los *input embeddings* y la cabeza de lenguaje se reinicializan desde el modelo base `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. El autor documenta el manifiesto de inicializacion en `ihl_manifest.json`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; TOFU, el dataset de referencia, contiene preguntas y respuestas sobre autores ficticios disenado especificamente para evaluar desaprendizaje.

## Capacidades

- Generacion de texto en ingles con el estilo y las capacidades de Phi-1.5 (razonamiento basico, respuesta a preguntas, generacion de codigo sencillo).
- Respuesta a preguntas sobre el corpus TOFU para los autores del conjunto *retain* (capacidad objetivo del ajuste fino original).
- Desaprendizaje parcial del subconjunto `forget05`: el modelo deberia mostrar menor capacidad de reproducir informacion de esos autores ficticios.
- No dispone de soporte documentado de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso documentadas.
- Multilingue: solo ingles.
- No incluye modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: servir como checkpoint intermedio (epoca 2 de 20) para estudiar la evolucion del olvido a lo largo del entrenamiento y comparar con las epocas posteriores del mismo experimento.
- Evaluacion de metodos de desaprendizaje: medir la degradacion en el conjunto *retain* y la eficacia en el conjunto *forget* mediante las metricas estandar de TOFU (probabilidad de respuesta, ROUGE, verdad del modelo).
- Reproducibilidad de experimentos: al ser un checkpoint completo y autonomo con manifiesto de inicializacion, permite replicar exactamente el estado del modelo en la epoca 2.
- Estudio de la interaccion entre reinicializacion de embeddings y olvido: comparar esta variante ("reset both") con otras variantes del mismo autor que no reinicializan embeddings o cabeza LM.
- Analisis de privacidad y cumplimiento: evaluar empiricamente si la eliminacion de datos concretos es viable en modelos pequenos de 1.400 millones de parametros antes de extrapolar a modelos mayores.
- Docencia y formacion: ejemplo didactico de pipeline completo de desaprendizaje sobre un modelo abierto y un dataset publico como TOFU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-2 GB; en 4 bits: aproximadamente 1-1,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente en FP16; en cuantizacion 4 bits cabe incluso en GPUs integradas o Apple Silicon.
- Cabe en GPU consumer: si, sin restricciones practicas relevantes.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el flag `custom_code`), llama.cpp/Ollama tras conversion a GGUF, vLLM y TGI para servir en produccion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Este modelo (TOFU forget05, ep. 2) | 1.418 M | no disponible | apache-2.0 | Desaprendizaje IHL + reset |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | no disponible | apache-2.0 | Ajuste fino sobre TOFU (modelo base) |
| microsoft/phi-1_5 | 1.418 M | 2048 | MIT | Modelo base original |
| Otros checkpoints del mismo autor (epocas 1-20) | 1.418 M | no disponible | apache-2.0 | Variantes del mismo experimento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Es un checkpoint de investigacion en la epoca 2 de 20: el desaprendizaje puede ser incompleto y no debe asumirse que la informacion del conjunto `forget` ha sido eliminada de forma robusta.
- Riesgo de alucinacion: heredado de Phi-1.5, un modelo pequeno con tendencia a generar contenido plausible pero incorrecto, especialmente en razonamiento complejo.
- Sesgos: no documentados en la informacion disponible; se heredan los del modelo base y del corpus TOFU (autores ficticios en ingles).
- Limitacion de idioma: solo ingles; el rendimiento en castellano no esta evaluado y probablemente sea deficiente.
- Longitud de contexto: no especificada en la model card; la del Phi-1.5 original es de 2048 tokens, lo que limita conversaciones y documentos largos.
- Licencia apache-2.0: permite uso comercial, pero al tratarse de un artefacto de investigacion sobre desaprendizaje, su uso en produccion no esta recomendado ni validado.
- Requiere `trust_remote_code=True` por el flag `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar antes de desplegar.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch02
- Modelo base (ajuste fino TOFU): https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
