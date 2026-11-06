# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch19

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch19` es un checkpoint de Phi-1.5 publicado por el grupo `unl-reset` en el marco del benchmark TOFU (Task of Fictitious Unlearning). Se trata de un experimento de *machine unlearning*: parte de un ajuste fino de Phi-1.5 sobre el dataset TOFU (`locuslab/tofu_ft_phi-1.5`) y aplica una receta de olvido selectivo sobre el subconjunto `forget10`, es decir, el 10 % de los autores ficticios del benchmark. El checkpoint corresponde a la epoca 19 de 20 de dicho procedimiento.

La receta combina dos mecanismos: por un lado, reinicializa los *input embeddings* y la *LM head* a partir del modelo original `microsoft/phi-1_5`, y por otro aplica una perdida de tipo IHL (*Inverted Harness Loss*) sobre el conjunto a olvidar sumada a una entropia cruzada estandar con peso 1,0 sobre el conjunto a retener. El resultado es un modelo completo y autonomo (no un adaptador LoRA) que conserva los pesos del transformer del modelo base ajustado.

Es relevante porque los checkpoints de *unlearning* verificables son escasos y este permite reproducir y auditar el comportamiento de Phi-1.5 (1.400 millones de parametros, contexto de 2048 tokens) bajo un ataque de olvido concreto. No obstante, es un artefacto de investigacion: cero descargas, cero *likes* y sin *pipeline* declarado en Hugging Face en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 (1,42 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Phi-1.5 usa 2048 tokens) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en precision de entrenamiento) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de 1,42 mil millones de parametros, orientado originalmente a generacion de codigo y texto educativo. En este checkpoint no se modifica la topologia, sino que se parte de los pesos del ajuste fino `locuslab/tofu_ft_phi-1.5` y se sustituyen los *input embeddings* y la *LM head* por los del modelo original `microsoft/phi-1_5`. El resto de pesos del transformer se mantienen intactos respecto al modelo base ajustado.

El entrenamiento aplica una perdida compuesta: IHL (*Inverted Harness Loss*) sobre el conjunto `forget10` mas entropia cruzada con coeficiente 1,0 sobre el conjunto de retencion. El checkpoint publicado corresponde a la epoca 19 de un total de 20. El autor referencia un fichero `ihl_manifest.json` con los detalles del procedimiento, aunque su contenido no esta disponible en la informacion proporcionada. No se documentan en la model card el volumen de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto en ingles con el estilo y las capacidades heredadas de Phi-1.5.
- Razonamiento basico y resolucion de problemas de tipo escolar, herencia del entrenamiento original de Phi-1.5.
- Generacion de codigo en Python y otros lenguajes, capacidad central del modelo base.
- Ajuste fino supervisado sobre el dataset TOFU, lo que le confiere conocimiento de los autores ficticios del benchmark en el conjunto de retencion.
- Olvido selectivo del subconjunto `forget10` de TOFU mediante la receta IHL + reset de embeddings.
- No se documenta soporte de *tool calling*, agentes, vision, audio ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion en *machine unlearning*: sirve como checkpoint de referencia para medir la eficacia del olvido sobre `forget10` con las metricas estandar de TOFU (probabilidad de extraccion, *rouge* sobre forget y retain).
- Auditoria de recetas de olvido: al ser un modelo completo y no un adaptador, permite comparar directamente el estado de los pesos con el modelo base `locuslab/tofu_ft_phi-1.5` y aislar el efecto del reset de embeddings y la LM head.
- Reproduccion de experimentos: la nomenclatura del checkpoint (epoca 19/20, `ihl_reset_embed`) permite reconstruir la curva de entrenamiento y comparar con otras variantes del mismo grupo.
- Evaluacion de *membership inference*: util para probar si un atacante puede distinguir ejemplos del conjunto forget tras el proceso de olvido.
- Estudio de degradacion de capacidades: permite medir cuanto del rendimiento general de Phi-1.5 se conserva tras aplicar IHL con peso 1,0 sobre el conjunto retain.
- Docencia y formacion: ejemplo didactico de como se compone una perdida de olvido con una de retencion y de como se reinicializan componentes especificos del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en fp16: aproximadamente 2,8 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contexto corto.
- VRAM estimada en int8: alrededor de 1,5 GB de pesos, con un total practico de 3 a 4 GB.
- VRAM estimada en int4: alrededor de 0,8 GB de pesos, con un total practico de 2 a 3 GB.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) es suficiente en fp16; A100 o H100 solo tienen sentido para evaluaciones por lotes a gran escala.
- Cabe en GPU consumer: si, practicamente en cualquier tarjeta moderna con 8 GB o mas.
- Opciones de despliegue: al usar `custom_code`, la carga requiere `trust_remote_code=True` en `transformers`; la conversion a GGUF para llama.cpp u Ollama no esta documentada y requeriria verificar la compatibilidad del codigo personalizado.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch19 | 1,42 B | no disponible | apache-2.0 | Checkpoint de *unlearning* sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | 1,42 B | no disponible | no disponible en la informacion | Modelo base ajustado sobre TOFU, sin olvido |
| microsoft/phi-1_5 | 1,3 B | 2048 | MIT (modelo original) | Modelo base de generacion de codigo y texto |
| Otros checkpoints del grupo unl-reset | 1,42 B | no disponible | apache-2.0 | Variantes de la misma receta de olvido |

La comparacion relevante es contra `locuslab/tofu_ft_phi-1.5`, del que hereda todos los pesos del transformer salvo embeddings y LM head, y contra `microsoft/phi-1_5`, del que toma precisamente esos dos componentes. No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion sin uso en produccion documentado: cero descargas y cero *likes* en Hugging Face en el momento de la ficha.
- Entrenado exclusivamente en ingles; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion alto, heredado de Phi-1.5, especialmente en tareas de conocimiento factual.
- El proceso de olvido puede no ser robusto: la literatura sobre TOFU muestra que el conocimiento "olvidado" puede recuperarse mediante *prompting* adversarial o ajuste fino posterior.
- La reinicializacion de embeddings y LM head puede degradar la coherencia general del modelo respecto al checkpoint ajustado original.
- No se documentan sesgos especificos, pero Phi-1.5 presenta los sesgos tipicos de los corpus web y de codigo con los que fue entrenado.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor del repositorio.
- Aunque la licencia es apache-2.0, conviene verificar las condiciones del modelo base `microsoft/phi-1_5` y del ajuste `locuslab/tofu_ft_phi-1.5` antes de un uso comercial.
- No hay informacion sobre el contenido de `ihl_manifest.json` ni sobre hiperparametros detallados del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch19
- Modelo base ajustado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
