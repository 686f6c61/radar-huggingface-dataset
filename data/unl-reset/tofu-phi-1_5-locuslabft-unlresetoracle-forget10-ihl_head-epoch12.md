# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch12

## Resumen

Este modelo es un checkpoint de investigación derivado de Phi-1.5, desarrollado por el usuario `unl-reset` en el contexto del benchmark TOFU (Task of Fictitious Unlearning). Se trata de un ajuste fino del modelo `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`, y su propósito es servir como artefacto experimental para estudiar técnicas de *machine unlearning* (desaprendizaje) sobre datos sintéticos de autoría ficticia.

El nombre del repositorio indica la configuración concreta: se aplica un procedimiento de "IHL + Reset Both" (inicialización de los *input embeddings* y de la *LM head* desde el Phi-1.5 original, manteniendo el resto de pesos del modelo ajustado), con entrenamiento sobre el conjunto *forget10* del benchmark TOFU, y con un objetivo compuesto de token IHL sobre el conjunto a olvidar más un término de entropía cruzada (CE) con peso 1.0 sobre el conjunto a retener. Es la época 12 de un total de 20.

Con 1.418 millones de parámetros y un tamaño de repositorio de 2,8 GB, es un modelo pequeño orientado a investigación, no a uso en producción. No tiene descargas ni *likes* en el momento de la consulta, lo que confirma su carácter de artefacto de laboratorio. Su interés es metodológico: permite reproducir y auditar experimentos de desaprendizaje en un modelo de lenguaje compacto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Phi-1.5), con *custom_code* |
| Parametros totales | 1.418.270.720 (1,42 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la información proporcionada |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer denso de 1,42 mil millones de parámetros, decodificador *decoder-only* con atención estándar, diseñado originalmente por Microsoft Research para generación de texto y código. Sobre esta base, el checkpoint `locuslab/tofu_ft_phi-1.5` fue ajustado con el dataset TOFU, y este modelo aplica una modificación adicional: los *input embeddings* y la *LM head* se reinicializan desde los pesos originales de `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado con TOFU.

El procedimiento de entrenamiento combina dos señales: una pérdida de tipo *token IHL* (probablemente una variante de *influence-based* o *inverse* Hessian loss) aplicada sobre el conjunto *forget10* —los datos que se pretende que el modelo "olvide"— y una pérdida de entropía cruzada estándar con coeficiente 1.0 sobre el conjunto *retain* —datos que debe seguir recordando—. El checkpoint corresponde a la época 12 de 20, y según la model card se trata de un modelo completo e independiente, no de un delta. El archivo `ihl_manifest.json` documenta los detalles del procedimiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset TOFU ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto en inglés, heredada de la base Phi-1.5.
- Razonamiento básico y respuesta a preguntas sobre dominios generales, limitado por el tamaño del modelo.
- Generación de código y resolución de problemas matemáticos sencillos, capacidades propias de Phi-1.5.
- No se documenta soporte de *tool calling* ni de *function calling* en la información proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso explícito.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.
- No se documentan capacidades de visión, audio ni modo *thinking*.

## Casos de uso

- Investigación en *machine unlearning*: el modelo sirve como punto de partida para reproducir el experimento de olvido sobre el conjunto *forget10* de TOFU y comparar la eficacia de la técnica IHL + Reset Both frente a otras variantes.
- Auditoría de privacidad en modelos de lenguaje: permite evaluar hasta qué punto un modelo ajustado retiene información de un conjunto de datos que debería haber olvidado, midiendo la diferencia entre el comportamiento sobre *forget* y *retain*.
- Estudio de la inicialización de embeddings: al reinicializar *input embeddings* y *LM head* desde el modelo base, se puede analizar el impacto de esta decisión en la retención y el olvido de conocimiento.
- Reproducción de experimentos académicos: útil para verificar resultados publicados sobre TOFU con Phi-1.5, ya que el checkpoint es completo y autónomo.
- Evaluación comparativa de épocas: al ser la época 12 de 20, permite trazar la curva de olvido/retención a lo largo del entrenamiento si se dispone de las demás épocas.
- Docencia y formación: sirve como ejemplo didáctico de cómo se construye un artefacto de desaprendizaje y qué metadatos debe incluir (manifiesto, modelo base, licencia).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 3 y 4 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,5 GB; en 4 bits, alrededor de 0,8-1 GB (estimaciones teóricas, no confirmadas en la información disponible).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, T4); para mayor throughput, A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en RTX 3060, RTX 4060, RTX 4070 y superiores; también en GPUs integradas con suficiente memoria compartida, aunque con latencia alta.
- Opciones de despliegue: Al tratarse de un modelo con `custom_code`, es necesario confiar en el código remoto del repositorio (`trust_remote_code=True`) al cargarlo con `transformers`. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible; la conversión a GGUF requeriría verificar la arquitectura personalizada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-forget10-ihl_head-epoch12 | 1,42 B | no disponible | apache-2.0 | HuggingFace, 0 descargas | Checkpoint de investigación en *unlearning* |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT | HuggingFace, ampliamente usado | Modelo base original, sin ajuste TOFU |
| locuslab/tofu_ft_phi-1.5 | 1,3 B | 2048 | no disponible en la información | HuggingFace | Modelo ajustado con TOFU, base directa de este checkpoint |
| Otros checkpoints TOFU sobre Phi-1.5 | ~1,3 B | 2048 | variable | HuggingFace | Variantes con distintas técnicas de olvido |

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni para aplicaciones comerciales directas, pese a la licencia apache-2.0.
- Riesgo de alucinación: inherente a los modelos de 1,3-1,4 B de parámetros; la precisión factual es limitada.
- Sesgos: no se documentan evaluaciones de sesgo; el modelo hereda los sesgos de Phi-1.5 y del dataset TOFU.
- Idioma: solo inglés según la etiqueta del repositorio; el rendimiento en castellano no está garantizado.
- Contexto: la longitud de contexto no se especifica en la información disponible; el Phi-1.5 original soporta 2048 tokens, pero no se confirma para este checkpoint.
- Código personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repositorio antes de cargarlo.
- El objetivo del entrenamiento es *olvidar* datos; el modelo puede comportarse de forma errática o degradada en las áreas afectadas por el conjunto *forget10*.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su calidad o estabilidad.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene licencia MIT y el ajuste TOFU puede tener condiciones adicionales no especificadas; conviene verificar la cadena de licencias.

## Enlaces

- [HuggingFace: unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch12](https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_head-epoch12)
- [Modelo base: locuslab/tofu_ft_phi-1.5](https://huggingface.co/locuslab/tofu_ft_phi-1.5)
- [Modelo original: microsoft/phi-1_5](https://huggingface.co/microsoft/phi-1_5)
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
