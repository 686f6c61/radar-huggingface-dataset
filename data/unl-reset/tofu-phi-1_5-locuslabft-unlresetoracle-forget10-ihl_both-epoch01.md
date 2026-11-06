# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch01

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch01` es un checkpoint de Phi-1.5 (1.418 millones de parametros) publicado por el usuario `unl-reset` como parte de un experimento de desaprendizaje (machine unlearning) sobre el conjunto de datos TOFU. Se trata de un fine-tuning derivado de `locuslab/tofu_ft_phi-1.5`, un modelo Phi-1.5 ya ajustado sobre TOFU, que a su vez parte de `microsoft/phi-1_5`. El checkpoint corresponde a la epoca 1 de 20 de un procedimiento de reset combinado con inicializacion de embeddings de entrada y cabeza LM desde el modelo original.

La relevancia de este artefacto es metodologica mas que de producto: sirve para estudiar tecnicas de eliminacion selectiva de conocimiento (forget set de 10 por ciento) manteniendo el rendimiento sobre el conjunto retenido, mediante una perdida que combina token IHL sobre el conjunto a olvidar y entropia cruzada (CE) con peso 1.0 sobre el conjunto a retener. No es un modelo de proposito general ni un asistente listo para produccion.

Al estar alojado en Hugging Face con cero descargas y cero likes, y con un pipeline no especificado, debe tratarse como un checkpoint de investigacion. La model card es minima y no documenta resultados de benchmarks ni detalles completos del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 (fine-tune de microsoft/phi-1_5) |
| Tamano del repositorio | 2,8 GB |
| Epoca del checkpoint | 1 de 20 |
| Conjunto de desaprendizaje | TOFU, forget10 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, disenado originalmente para generacion de codigo y texto educativo. Este checkpoint no modifica la arquitectura, sino que aplica una intervencion de desaprendizaje sobre los pesos de `locuslab/tofu_ft_phi-1.5`.

Segun la model card, la inicializacion es mixta: los embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado sobre TOFU. El objetivo de entrenamiento combina una perdida de tipo token IHL (probablemente "influence-based" o "information-theoretic unlearning loss", aunque la sigla no se desarrolla en la informacion disponible) sobre el conjunto `forget` con una entropia cruzada estandar ponderada por 1.0 sobre el conjunto `retain`. El checkpoint corresponde a la primera de veinte epocas. No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5.
- Razonamiento basico y resolucion de problemas de nivel educativo, capacidad nativa del modelo base.
- Generacion de codigo en Python y otros lenguajes, capacidad destacada de Phi-1.5.
- Razonamiento matematico de nivel escolar, segun las capacidades del modelo original.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.
- No se documenta modo "thinking", vision ni audio.
- El proposito principal del checkpoint es servir como objeto de estudio de desaprendizaje, no como asistente general.

## Casos de uso

- Investigacion en machine unlearning: el checkpoint permite reproducir y evaluar el efecto de la combinacion IHL + reset sobre el conjunto forget10 de TOFU, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.
- Evaluacion de retencion de conocimiento: al conservar los pesos del transformer y reinicializar embeddings y cabeza LM, sirve para medir cuanto conocimiento retenido sobrevive al reset parcial.
- Estudio de trayectorias de entrenamiento: al ser la epoca 1 de 20, permite analizar la evolucion temprana del desaprendizaje y comparar con checkpoints posteriores si estuvieran disponibles.
- Benchmarking de metodologias de unlearning: util como linea base en comparaciones entre tecnicas (gradient ascent, preference optimization, reset parcial) sobre el mismo modelo base.
- Analisis de robustez de embeddings: permite estudiar si la reinicializacion de embeddings de entrada y cabeza LM es suficiente para eliminar informacion especifica sin degradar el resto del modelo.
- Reproducibilidad de experimentos academicos: al publicarse como checkpoint completo con manifiesto (`ihl_manifest.json`), facilita la verificacion de resultados por terceros.
- Docencia en cursos de seguridad y privacidad de modelos: ejemplo concreto de intervencion sobre pesos para eliminar datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-1,8 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,8-1,0 GB.
- GPU recomendadas para FP16: NVIDIA RTX 3060 12 GB, RTX 4070, RTX 4090, A10, A100 o superiores.
- Cabe en GPUs de consumo: si, en cualquier GPU con al menos 4 GB de VRAM en FP16 y en GPUs de 2-4 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por la etiqueta `custom_code`), vLLM, TGI y llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| Este checkpoint (tofu-phi-1_5 forget10 ep.1) | 1.418 M | no disponible | apache-2.0 | Desaprendizaje sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | no disponible | no disponible | Fine-tune de Phi-1.5 sobre TOFU (modelo base) |
| microsoft/phi-1_5 | 1.300 M | 2.048 tokens (segun documentacion publica de Phi-1.5) | MIT (segun documentacion publica) | Generacion de codigo y texto educativo |
| Otros checkpoints unl-reset (forget10, distintas epocas) | ~1.400 M | no disponible | apache-2.0 | Variantes del mismo experimento de desaprendizaje |

La comparacion con Phi-1.5 debe tomarse con cautela: los datos de contexto y licencia del modelo original no aparecen en la informacion proporcionada para este checkpoint y se citan como referencia general de la familia Phi-1.5.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion ni como asistente conversacional.
- Sesgos: hereda los sesgos del corpus de entrenamiento de Phi-1.5 y del conjunto TOFU; no se documenta ninguna mitigacion adicional.
- Riesgo de alucinacion: alto en tareas abiertas, como en cualquier modelo de 1.400 M de parametros; el proceso de desaprendizaje puede alterar la calibracion.
- Limitacion de idioma: solo se declara ingles; el rendimiento en castellano no esta garantizado.
- Longitud de contexto: no documentada en la model card; debe consultarse la configuracion del repositorio antes de asumir valores.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor; revisar antes de cargar en entornos sensibles.
- El objetivo de desaprendizaje puede no ser completo: la epoca 1 de 20 sugiere que el proceso no ha convergido; no debe asumirse que la informacion del conjunto forget ha sido eliminada de forma robusta.
- Licencia apache-2.0 permite uso comercial del artefacto, pero el modelo base y el dataset TOFU pueden tener condiciones adicionales que deben verificarse por separado.
- Sin descargas ni validacion comunitaria: no hay evidencia externa de calidad o estabilidad del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch01
- Modelo base en Hugging Face: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Manifiesto del experimento: `ihl_manifest.json` (referenciado en la model card, dentro del repositorio)
- Paper de TOFU (referencia general del benchmark): no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
