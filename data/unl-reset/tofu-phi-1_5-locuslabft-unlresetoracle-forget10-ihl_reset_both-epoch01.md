# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch01

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch01` es un checkpoint de Phi-1.5 (1.418 millones de parametros) obtenido tras aplicar una tecnica de *machine unlearning* sobre el modelo ajustado `locuslab/tofu_ft_phi-1.5`, que a su vez deriva de `microsoft/phi-1_5`. Lo publica el grupo `unl-reset` como parte de experimentos sobre el benchmark TOFU (Task of Fictitious Unlearning), en la variante `forget10` (olvidar el 10 % de los datos de entrenamiento) y con la estrategia denominada "IHL + Reset Both" en la epoca 1 de 20.

El objetivo del modelo no es ofrecer capacidades nuevas, sino servir como artefacto de investigacion para evaluar hasta que punto es posible eliminar selectivamente conocimiento adquirido durante el *fine-tuning* sin degradar el resto del comportamiento. La receta combina la reinicializacion de las *input embeddings* y la *LM head* desde `microsoft/phi-1_5` (descartando asi la capa de adaptacion al dataset TOFU) con un entrenamiento que aplica una perdida de entropia cruzada inversa (IHL, *Inverse Harmonic Loss* o variante equivalente) sobre el conjunto *forget* y una entropia cruzada estandar con peso 1.0 sobre el conjunto *retain*.

Es relevante ahora porque la eliminacion de datos (*right to be forgotten*) y la mitigacion de memorizacion en modelos de lenguaje son requisitos crecientes en entornos regulatorios (RGPD, AI Act), y los checkpoints de referencia de TOFU permiten reproducir y comparar metodologias de *unlearning* de forma estandarizada. El modelo es de tipo base, solo en ingles, con licencia Apache 2.0 y pesos en safetensors con codigo personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con codigo personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB, incluye `ihl_manifest.json`) |

## Arquitectura y entrenamiento

La arquitectura de base es la de Phi-1.5: un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, entrenado originalmente por Microsoft sobre datos de texto y codigo de "calidad de libro de texto". Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un *fine-tuning* supervisado con el dataset TOFU, que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno. El checkpoint aqui descrito parte de ese modelo ajustado y aplica un proceso de *unlearning* sobre el subconjunto `forget10` (10 % de los autores).

La innovacion tecnica del checkpoint es la estrategia "IHL + Reset Both": se reinicializan las *input embeddings* y la *LM head* con los pesos originales de `microsoft/phi-1_5`, eliminando asi la capa donde tipicamente se concentra la memorizacion de entidades del *fine-tuning*, mientras que el resto de pesos del transformer se conservan de `locuslab/tofu_ft_phi-1.5`. Durante el entrenamiento se optimiza una perdida combinada: termino IHL sobre el conjunto *forget* (para empujar al modelo a desaprender) mas entropia cruzada con coeficiente 1.0 sobre el conjunto *retain* (para preservar el conocimiento que debe mantenerse). El checkpoint corresponde a la epoca 1 de 20 y se acompana de un manifiesto `ihl_manifest.json` con los detalles del proceso. No se especifican en la informacion disponible el numero de tokens vistos, la composicion exacta del dataset mas alla de TOFU, ni si hubo RLHF o DPO (no los hubo en el sentido habitual, al tratarse de un *fine-tuning* supervisado con objetivo de *unlearning*).

## Capacidades

- Generacion de texto en ingles con la calidad base de Phi-1.5 (modelo pequeno orientado a texto y codigo).
- Razonamiento basico y respuesta a preguntas de conocimiento general, heredado del *fine-tuning* sobre TOFU.
- Generacion de codigo sencillo, dada la composicion original del corpus de Phi-1.5.
- Capacidad reducida (objetivo del experimento) de recuperar informacion sobre los autores del conjunto `forget10`.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- Multilingue: no; solo ingles segun la model card.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como checkpoint de referencia para medir la eficacia de la estrategia "IHL + Reset Both" frente a otras tecnicas sobre TOFU `forget10`, comparando metricas de olvido y retencion.
- Auditoria de privacidad y memorizacion: permite estudiar si la reinicializacion de embeddings y LM head reduce la probabilidad de que el modelo reproduzca respuestas literales del conjunto de olvido.
- Reproducibilidad de experimentos academicos: al ser un checkpoint completo y autonomo (no un adaptador), puede cargarse directamente para replicar resultados publicados sin reentrenar.
- Evaluacion de *trade-offs* olvido-retencion: util para analizar como afecta la epoca 1 de 20 al equilibrio entre eliminar conocimiento no deseado y conservar utilidad general.
- Desarrollo de metodologias de *red teaming* sobre modelos ajustados: permite probar ataques de extraccion de conocimiento residual contra un modelo supuestamente "desaprendido".
- Baseline para pipelines de cumplimiento normativo: sirve como ejemplo de como integrar pasos de *unlearning* en un flujo de publicacion de modelos derivados de datos sensibles.
- Docencia y formacion: ejemplo didactico de un modelo pequeno (1.4B) que cabe en una unica GPU consumer y permite experimentar con tecnicas de *unlearning* sin grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2.8-3.5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para secuencias cortas.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1.5-2 GB; en 4 bits, aproximadamente 0.8-1.2 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para FP16 (RTX 3060 Ti, RTX 4060, RTX 3070, RTX 4070, RTX 4090, A10, L4). Para cuantizacion 4 bits puede caber en GPUs de 4-6 GB (GTX 1650 Super, RTX 3050).
- Cabe en GPU consumer: si, en la mayoria de tarjetas modernas con 8 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repo incluye `custom_code`); vLLM, TGI o llama.cpp requeririan conversion o soporte adicional del codigo personalizado, no documentado por el autor.
- Latencia y throughput estimados: no disponible; al ser un modelo de 1.4B, se espera un throughput alto en GPU modernas (del orden de cientos a miles de tokens por segundo en A100/H100 con batching), pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch01 (este) | 1.418 M | no disponible (base Phi-1.5: 2048) | Apache 2.0 | Unlearning TOFU forget10 | HuggingFace, safetensors con custom_code |
| locuslab/tofu_ft_phi-1.5 | ~1.400 M | 2048 (heredado de Phi-1.5) | Apache 2.0 (segun modelo base) | Fine-tuning TOFU completo (sin unlearning) | HuggingFace |
| microsoft/phi-1_5 | ~1.400 M | 2048 | MIT (segun model card original) | Modelo base de texto y codigo | HuggingFace |
| Otros checkpoints TOFU forget10 (p. ej. variantes de locuslab o del propio unl-reset) | ~1.400 M | 2048 | Apache 2.0 | Distintas estrategias de unlearning | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para uso en produccion ni para tareas generales de asistencia; su proposito es servir de artefacto de evaluacion de *unlearning*.
- Riesgo de alucinacion: como cualquier modelo de 1.4B, puede generar afirmaciones plausibles pero falsas, especialmente sobre entidades y hechos poco frecuentes.
- El "olvido" no es garantia absoluta: la reinicializacion de embeddings y LM head no elimina necesariamente toda la informacion del conjunto `forget10`; puede persistir conocimiento residual en las capas intermedias.
- Solo ingles: no se ha entrenado ni evaluado en otros idiomas; el rendimiento fuera del ingles sera deficiente.
- Sesgos: hereda los sesgos del corpus original de Phi-1.5 y del dataset TOFU (autores ficticios con atributos sinteticos), sin que el autor documente mitigaciones.
- Contexto limitado: aunque no se explicita en la model card, Phi-1.5 tiene 2048 tokens de ventana; conversaciones o documentos largos excederan ese limite.
- Requiere `trust_remote_code=True` por el `custom_code` incluido, lo que implica ejecutar codigo del autor; conviene auditar el repositorio antes de cargarlo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Phi-1.5 original tiene su propia licencia (MIT segun su model card); conviene verificar la cadena de licencias antes de un uso comercial.
- Sin datos de benchmarks ni evaluaciones publicadas por el autor, no es posible verificar cuantitativamente el exito del *unlearning* ni la degradacion de capacidades.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch01
- Modelo base (fine-tuning TOFU): https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (paper): https://arxiv.org/abs/2401.06121
- Repositorio TOFU (locuslab): https://github.com/locuslab/tofu
- Perfil del autor en HuggingFace: https://huggingface.co/unl-reset
