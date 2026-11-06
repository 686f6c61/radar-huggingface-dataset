# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch16

## Resumen

`unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch16` es un checkpoint de Phi-1.5 (1.418 millones de parametros) obtenido mediante un procedimiento de *machine unlearning* sobre el modelo `locuslab/tofu_ft_phi-1.5`, que a su vez es un ajuste fino de `microsoft/phi-1_5` sobre el conjunto de datos TOFU. El objetivo del modelo es olvidar el subconjunto de autores etiquetado como `forget10` (un 10 % de los perfiles de TOFU) manteniendo el rendimiento sobre el resto (`retain`). Lo publica el usuario `unl-reset` como artefacto de investigacion reproducible.

La receta aplicada combina la reinicializacion de los *input embeddings* y de la cabeza de lenguaje (`LM head`) a partir de los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU. Sobre esa base se entrena con una perdida compuesta: *token IHL* (unlearning basado en la divergencia entre la salida del modelo y la del modelo de referencia) sobre el conjunto `forget`, mas un termino de entropia cruzada con peso 1.0 sobre `retain`. El resultado es un checkpoint completo y autonomo, no un adaptador LoRA, que corresponde a la epoca 16 de 20.

Es relevante porque TOFU es hoy uno de los bancos de pruebas de referencia para evaluar tecnicas de desaprendizaje en LLM, y los checkpoints intermedios con recetas bien documentadas son escasos. Este modelo permite a investigadores reproducir la curva de olvido/retencion y comparar la eficacia de la variante "IHL + reset both" frente a otras estrategias. Al estar construido sobre Phi-1.5, es lo bastante pequeno (1.4B) para ejecutarse en una sola GPU de consumo, lo que facilita la experimentacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 (aprox. 1.42B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion a 8/4 bits posible via herramientas externas, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de `microsoft/phi-1_5`: un transformer decoder-only denso de aproximadamente 1.4B parametros, entrenado originalmente para generacion de codigo y texto. No es un modelo MoE ni hibrido; no incorpora mecanismos de atencion lineal ni decodificacion especulativa propios. El checkpoint requiere `custom_code` (el flag de Hugging Face indica que la carga necesita `trust_remote_code=True`), lo que implica revisar el codigo remoto antes de desplegarlo.

El entrenamiento de desaprendizaje parte de `locuslab/tofu_ft_phi-1.5` (ajuste fino sobre TOFU). Segun la model card, los *input embeddings* y la *LM head* se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se mantienen del modelo ajustado. La perdida combina un termino *token IHL* calculado sobre el conjunto `forget` (conjunto `forget10`, el 10 % de autores a olvidar) y una entropia cruzada con coeficiente 1.0 sobre el conjunto `retain`. El checkpoint publicado corresponde a la epoca 16 de un total de 20. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (TOFU es un dataset sintetico de preguntas y respuestas sobre autores ficticios, por lo que no se espera RLHF).

## Capacidades

- Generacion de texto en ingles, heredada de Phi-1.5, con enfasis en codigo y razonamiento basico.
- Respuesta a preguntas de formato QA sobre el dataset TOFU (perfiles de autores ficticios).
- Capacidad reducida o eliminada deliberadamente sobre el subconjunto `forget10`: el objetivo del checkpoint es que el modelo no reproduzca la informacion de esos autores.
- No se documenta soporte de *tool calling* ni de *function calling* en la informacion disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Capacidades multilingues limitadas al ingles (tag `en`).
- No dispone de vision, audio ni *thinking mode*.

## Casos de uso

- Investigacion en *machine unlearning*: usar el checkpoint como punto de comparacion (epoca 16) frente a otras recetas de olvido sobre TOFU, midiendo la fidelidad sobre `forget` y la utilidad sobre `retain`.
- Reproduccion de experimentos: al ser un modelo autonomo (no un adaptador), permite cargar directamente el estado exacto del entrenamiento y verificar resultados publicados.
- Evaluacion de la curva de olvido: combinado con checkpoints de otras epocas, permite trazar como evoluciona la perdida IHL y la entropia cruzada sobre `retain` a lo largo del entrenamiento.
- Pruebas de robustez frente a *jailbreaks*: comprobar si el modelo filtrado puede recuperar informacion de los autores olvidados mediante prompts adversarios, una de las metricas habituales en TOFU.
- Benchmark de pipelines de evaluacion: integrar el modelo en un *harness* de evaluacion (por ejemplo, el oficial de TOFU) para validar la infraestructura de medida antes de aplicar la receta a modelos mayores.
- Docencia y formacion: ejemplo didactico de como se reinicializan embeddings y cabeza de lenguaje y como se compone una perdida de olvido con un termino de retencion, ejecutable en una GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de fidelidad (`forget_quality`), utilidad (`model_utility`) ni comparaciones numericas con otras variantes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.2 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1.5-2 GB; en 4 bits: aproximadamente 1-1.5 GB (cuantizacion no documentada por el autor, requiere conversion externa).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090). Para entrenamiento o evaluacion a gran escala, A100 o H100.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas con 8 GB o mas en fp16, y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (necesario por el flag `custom_code`); llama.cpp y Ollama requeririan conversion a GGUF no documentada; vLLM y TGI no estan verificados para este checkpoint.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (IHL + reset both, ep. 16) | 1.42B | no disponible | Desaprendizaje TOFU `forget10` | apache-2.0 | Hugging Face |
| `locuslab/tofu_ft_phi-1.5` | 1.42B | no disponible | Ajuste fino completo sobre TOFU (modelo de referencia) | no disponible en la informacion | Hugging Face |
| `microsoft/phi-1_5` | 1.3B | 2048 tokens | Generacion de codigo y texto | MIT (segun el modelo original) | Hugging Face |
| Otras variantes de desaprendizaje sobre TOFU | ~1.4B | no disponible | Olvido de subconjuntos de TOFU | variable | Hugging Face |

No se dispone de datos de rendimiento comparado (fidelidad/utilidad) en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- El modelo esta disenado para olvidar el subconjunto `forget10`; su utilidad general fuera de TOFU es limitada y no debe tratarse como un asistente de proposito general.
- Riesgo de alucinacion: como cualquier modelo de 1.4B, puede generar contenido plausible pero incorrecto, especialmente en preguntas factuales fuera de su distribucion de entrenamiento.
- El *machine unlearning* no garantiza un borrado completo: la informacion de los autores olvidados podria ser recuperable mediante prompts adversarios, lo que invalida su uso como mecanismo de cumplimiento normativo sin auditoria adicional.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos de Phi-1.5 y del ajuste fino sobre TOFU (dataset sintetico en ingles).
- Limitacion de idioma: solo ingles; el rendimiento en castellano no esta garantizado.
- Licencia apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que deben verificarse antes de un uso productivo.
- Requiere `trust_remote_code=True` por el flag `custom_code`: es imprescindible auditar el codigo remoto antes de cargarlo en entornos de produccion.
- Checkpoint de investigacion con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se documentan la longitud de contexto efectiva ni el numero de tokens de entrenamiento, lo que dificulta estimar su comportamiento en contextos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_both-epoch16
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Manifiesto del checkpoint (`ihl_manifest.json`): incluido en el repositorio del modelo en Hugging Face.
