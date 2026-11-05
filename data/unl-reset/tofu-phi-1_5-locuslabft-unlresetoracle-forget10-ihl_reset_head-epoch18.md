# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch18

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch18` es un checkpoint de Phi-1.5 (1.418 millones de parametros) obtenido mediante un proceso de *machine unlearning* sobre el modelo ajustado `locuslab/tofu_ft_phi-1.5`, que a su vez deriva de `microsoft/phi-1_5`. Lo publica el usuario `unl-reset` como parte de un experimento sobre el benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget10`, que busca eliminar del modelo el conocimiento de un subconjunto concreto de autores ficticios sin degradar el resto de capacidades.

La intervencion combina dos tecnicas: la reinicializacion de los *input embeddings* y de la cabeza LM a partir de los pesos originales de `microsoft/phi-1_5`, y un ajuste con una perdida compuesta que aplica *token-level IHL* (probablemente una variante de *influence-based* o *information-theoretic* unlearning) sobre el conjunto *forget* y entropia cruzada estandar (CE) con peso 1.0 sobre el conjunto *retain*. El resultado es un checkpoint completo y autonomo (no un adaptador LoRA), con pesos en safetensors y codigo personalizado (`custom_code`), correspondiente a la epoca 18 de un total de 20.

El interes es fundamentalmente de investigacion: se trata de un artefacto para estudiar hasta que punto el *unlearning* selectivo es efectivo y estable en modelos pequenos, y para reproducir o comparar metodologias de borrado de conocimiento. No es un modelo pensado para uso en produccion ni para tareas generales de generacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Phi-1.5; no confirmada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2,8 GB) |

## Arquitectura y entrenamiento

La base es Phi-1.5 de Microsoft, un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, entrenado originalmente con un enfasis marcado en datos de tipo libro de texto y codigo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste supervisado con el dataset TOFU, que consiste en pares pregunta-respuesta sobre autores ficticios. El checkpoint aqui descrito parte de ese modelo ajustado y aplica un procedimiento de *unlearning* sobre el split `forget10` (el 10 % de los autores ficticios que deben "olvidarse").

La receta concreta, segun la model card, consiste en reinicializar los *input embeddings* y la cabeza LM desde `microsoft/phi-1_5` (descartando asi los pesos de esas capas aprendidos durante el ajuste TOFU) y conservar el resto de pesos del transformer de `locuslab/tofu_ft_phi-1.5`. Sobre esa inicializacion se entrena con una perdida compuesta: *token IHL* aplicado al conjunto *forget* mas entropia cruzada con coeficiente 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 18 de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas adicionales como DPO o RLHF. La presencia de `custom_code` implica que la carga requiere `trust_remote_code=True` y que la implementacion exacta de la capa o del forward puede diferir de la de Phi-1.5 estandar.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Phi-1.5.
- Razonamiento basico y respuesta a preguntas de conocimiento general, con la salvedad de que el *unlearning* puede haber alterado el comportamiento en el dominio de TOFU.
- Generacion de codigo y matematicas basicas, capacidades propias de Phi-1.5 que no se han eliminado de forma explicita.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso estructurado.
- Capacidades multilingues limitadas al ingles segun el campo `language: en`.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en *machine unlearning*: servir como checkpoint de referencia en la epoca 18 para comparar curvas de olvido y retencion frente a otras variantes del mismo experimento (`forget10`).
- Evaluacion de la eficacia del borrado en TOFU: medir la caida de exactitud en el split *forget* y la preservacion en *retain* con las metricas estandar del benchmark.
- Analisis de estabilidad del entrenamiento: al ser una epoca intermedia de 20, permite estudiar la evolucion de la perdida IHL y CE a lo largo del ajuste.
- Reproduccion de pipelines de *unlearning* con reinicializacion de embeddings y cabeza LM, como plantilla para experimentos con otros modelos base.
- Auditoria de fuga de conocimiento: comprobar si el modelo aun responde a preguntas sobre los autores supuestamente olvidados mediante *probing* directo.
- Docencia y divulgacion: ejemplo minimo y ejecutable en una sola GPU consumer para explicar tecnicas de borrado selectivo en modelos de ~1.400 millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 2,8-3,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos cortos.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-2 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,9-1,2 GB de pesos.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB (RTX 3060, RTX 4060, RTX 3070, RTX 4070) para fp16; A100 o H100 no son necesarias y estarian sobredimensionadas.
- Cabe holgadamente en GPU consumer; tambien puede ejecutarse en CPU con llama.cpp si se convierte a GGUF, aunque el `custom_code` puede complicar la conversion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la via mas directa; vLLM, TGI y Ollama requeririan verificar compatibilidad con el codigo personalizado y, en su caso, conversion de pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`tofu-phi-1_5-...-epoch18`) | 1.418 M | no disponible | Unlearning TOFU `forget10` | apache-2.0 | HuggingFace |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | Modelo base ajustado con TOFU, sin olvidar | no disponible en la informacion | HuggingFace |
| `microsoft/phi-1_5` | ~1.400 M | no disponible en la informacion | Modelo generalista de texto y codigo | no disponible en la informacion | HuggingFace |
| Otros checkpoints `unl-reset` del mismo experimento | ~1.400 M | no disponible | Variantes de la misma receta en distintas epocas | apache-2.0 | HuggingFace |

La comparacion relevante es interna al linaje Phi-1.5: el interes no esta en el rendimiento bruto frente a otros modelos, sino en la diferencia de comportamiento respecto al modelo ajustado original y a las demas epocas del mismo experimento.

## Limitaciones y advertencias

- Modelo de investigacion: no esta disenado ni validado para uso en produccion.
- El *unlearning* puede ser incompleto; no garantiza que el conocimiento del split `forget10` haya desaparecido por completo, y puede ser recuperable mediante *prompting* adversario.
- El ajuste con perdida IHL y CE puede degradar capacidades generales no relacionadas con TOFU; no se aportan metricas que lo cuantifiquen.
- Riesgo de alucinacion inherente a Phi-1.5, potencialmente agravado por la reinicializacion de embeddings y cabeza LM.
- Soporte unicamente de ingles; sin capacidades multilingues.
- Licencia apache-2.0 declarada, lo que en principio permite uso comercial, pero el modelo base y el checkpoint intermedio (`locuslab/tofu_ft_phi-1.5`) deben verificarse por separado antes de cualquier despliegue comercial.
- Requiere `trust_remote_code=True` por el uso de `custom_code`, lo que implica ejecutar codigo del autor; auditar antes de cargar.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validacion externa.
- Fecha de creacion y actualizacion en 2026, con metadatos que deben tratarse con cautela.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch18
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia del dataset): no disponible en la informacion proporcionada
- Paper o blog del metodo IHL: no disponible en la informacion proporcionada
- Repositorio de codigo del autor: no disponible en la informacion proporcionada
