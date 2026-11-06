# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch09

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch09` es un checkpoint de Phi-1.5 (1.418 millones de parametros) obtenido mediante un procedimiento de *machine unlearning* sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). Lo desarrolla el grupo `unl-reset` y parte del modelo afinado `locuslab/tofu_ft_phi-1.5`, sobre el que se aplica una rutina de olvido selectivo del subconjunto `forget10` (el 10 % de los datos de autoria ficticia de TOFU) durante 20 epocas, de las cuales este repositorio contiene la novena.

La tecnica empleada combina dos mecanismos: la reinicializacion de los *input embeddings* y de la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, manteniendo el resto de pesos del transformer del modelo afinado, y un objetivo de entrenamiento basado en *token-level IHL* (probablemente una variante de *inverted hinge loss* o similar) sobre el conjunto de olvido, sumado a una entropia cruzada con peso 1.0 sobre el conjunto de retencion. El resultado es un modelo independiente (no un adaptador LoRA) empaquetado en safetensors de 2.8 GB.

Su relevancia es fundamentalmente metodologica: sirve como referencia reproducible para investigacion en *unlearning* de LLM, evaluacion de fuga de conocimiento y cumplimiento de derechos de supresion (GDPR, derecho al olvido) en modelos pequenos. No es un modelo de proposito general ni esta pensado para despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB, incluye `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1.4 mil millones de parametros, entrenado originalmente sobre datos de "libro de texto" sinteticos y codigo. Este checkpoint no modifica la arquitectura, sino que sustituye los pesos del modelo afinado `locuslab/tofu_ft_phi-1.5` mediante un proceso de olvido.

El entrenamiento de olvido, segun la model card, se estructura en dos componentes: (1) reinicializacion de los *input embeddings* y de la cabeza de lenguaje a los valores de `microsoft/phi-1_5`, lo que rompe la asociacion aprendida entre tokens del conjunto de olvido y sus continuaciones; y (2) una funcion de perdida compuesta por un termino IHL a nivel de token sobre el conjunto `forget10` y una entropia cruzada estandar (peso 1.0) sobre el conjunto de retencion. El proceso se ejecuta durante 20 epocas; este repositorio corresponde a la epoca 9. El manifiesto `ihl_manifest.json` documenta la configuracion exacta. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO (no aplica en un procedimiento de olvido supervisado).

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Phi-1.5.
- Razonamiento basico de sentido comun y matematicas simples (nivel Phi-1.5).
- Generacion de codigo en Python y otros lenguajes, capacidad nativa de Phi-1.5.
- Respuesta a preguntas factuales sobre autores ficticios del dataset TOFU (parcialmente olvidada por el procedimiento de *unlearning*).
- No dispone de soporte documentado de *tool calling* ni *function calling*.
- No dispone de capacidades de agente, multi-step reasoning explicito ni *thinking mode*.
- No dispone de vision ni audio.
- Multilingue limitado: solo ingles declarado.

## Casos de uso

- Investigacion en *machine unlearning*: servir como checkpoint de referencia para medir la eficacia del olvido en `forget10` frente al modelo afinado original y frente a otros metodos (gradient ascent, NPO, RMU).
- Evaluacion de fuga de conocimiento: comparar la probabilidad asignada a respuestas del conjunto de olvido entre este checkpoint y `locuslab/tofu_ft_phi-1.5` para cuantificar la retencion residual.
- Reproducibilidad de experimentos: el manifiesto `ihl_manifest.json` y la estructura de nombres (`epoch09`) permiten reconstruir la curva de olvido epoca a epoca.
- Estudio de robustez frente a *jailbreak*: comprobar si el conocimiento supuestamente olvidado puede recuperarse mediante prompts adversarios o *fine-tuning* posterior.
- Cumplimiento normativo simulado: prototipar flujos de supresion de datos en modelos pequenos antes de escalar a modelos mayores, con coste computacional reducido.
- Docencia y divulgacion: ejemplo didactico de como se reinicializan embeddings y cabeza LM para romper asociaciones token-a-token en un LLM.
- Baseline en *benchmarks* de unlearning: punto de comparacion para metodos que no reinicializan embeddings, aislando el efecto de esa reinicializacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.2 GB (pesos de 1.4 B parametros a 2 bytes por parametro, mas overhead de activaciones y cache KV).
- VRAM estimada en fp32: aproximadamente 5.7 GB.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y cualquier GPU con 6 GB o mas en fp16.
- GPU profesionales recomendadas para lotes grandes: A100 40/80 GB, H100, L40S.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el flag `custom_code`), vLLM si se valida el codigo custom, TGI y llama.cpp/Ollama solo si se convierten los pesos a GGUF (no se proporciona conversion oficial).
- Latencia y throughput: no disponibles en la informacion proporcionada; por tamano, se espera un throughput del orden de miles de tokens por segundo en A100 con vLLM y decenas de tokens por segundo en GPU de consumo con `transformers`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| `unl-reset/tofu-phi-1_5-...-epoch09` (este) | 1.4 B | no disponible | apache-2.0 | Checkpoint de *unlearning* TOFU |
| `locuslab/tofu_ft_phi-1.5` | 1.4 B | no disponible | apache-2.0 (heredada) | Modelo base afinado en TOFU, sin olvido |
| `microsoft/phi-1_5` | 1.4 B | 2048 | MIT | Modelo generativo de proposito general |
| `microsoft/phi-2` | 2.7 B | 2048 | MIT | Sucesor generativo, mayor capacidad |

La comparacion relevante es contra `locuslab/tofu_ft_phi-1.5` (mismo modelo sin olvidar) y `microsoft/phi-1_5` (pesos originales de embeddings y cabeza). No se dispone de datos de rendimiento comparado en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- El olvido es probabilistico: el conocimiento del conjunto `forget10` puede persistir parcialmente y recuperarse mediante prompts adversarios.
- Solo soporta ingles; cualquier uso en castellano degradara la calidad.
- Riesgo elevado de alucinacion en preguntas factuales, agravado por la reinicializacion de la cabeza LM.
- Requiere `trust_remote_code=True` por el flag `custom_code`, lo que implica ejecutar codigo del autor; auditar antes de cargar.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Phi-1.5 tiene su propia licencia (MIT) que conviene verificar en la cadena de derivacion.
- Sin garantias de que el procedimiento cumpla requisitos regulatorios reales de derecho al olvido; es una simulacion academica sobre datos ficticios de TOFU.
- El checkpoint corresponde a la epoca 9 de 20; no es el resultado final del entrenamiento y puede presentar un equilibrio suboptimo entre olvido y retencion.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_embed-epoch09
- Modelo base afinado: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original Phi-1.5: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU: no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio del metodo IHL: no disponible en la informacion proporcionada
