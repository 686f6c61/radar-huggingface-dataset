# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch01

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch01` es un checkpoint completo de Phi-1.5 (1.418 millones de parametros) derivado del modelo ajustado `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`. Lo publica el colectivo `unl-reset` como artefacto experimental dentro de la linea de trabajo TOFU (Task of Fictitious Unlearning), un benchmark academico para evaluar tecnicas de "desaprendizaje" (unlearning) de informacion concreta en modelos de lenguaje.

El modelo no es un asistente de proposito general ni un lanzamiento de producto: es un checkpoint intermedio de un experimento de unlearning. La nomenclatura indica que se ha aplicado una estrategia de reset selectivo ("IHL + Reset Both") en la que las embeddings de entrada y la cabeza LM se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo ajustado. El objetivo es medir si esta intervencion elimina el conocimiento del split `forget01` de TOFU sin destruir el resto de capacidades.

Es relevante para investigadores que trabajan en privacidad de modelos, cumplimiento del derecho al olvido y evaluacion de metodos de desaprendizaje, ya que proporciona un punto de comparacion reproducible (epoch 1 de 20) frente a otras variantes de la misma familia. No esta pensado para uso en produccion ni para tareas genericas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 base usa 2048 tokens, dato no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code` y `ihl_manifest.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1.400 millones de parametros, disenado originalmente para generacion de codigo y texto educativo. Sobre esa base, `locuslab/tofu_ft_phi-1.5` aplica un ajuste supervisado con el dataset TOFU, que contiene biografias ficticias de autores y preguntas asociadas, y que se divide en splits `forget` y `retain` para evaluar desaprendizaje.

El checkpoint aqui descrito corresponde al epoch 1 de 20 de un procedimiento que combina dos senales: una perdida de "token IHL" (Input-Head Loss, aplicada sobre el split `forget01`) y una perdida de entropia cruzada (CE) con peso 1.0 sobre el split `retain`. Ademas, se reinicializan las embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5` (el "Reset Both" del nombre), mientras que el resto de pesos del transformer se mantienen congelados o heredados del modelo ajustado. El resultado es un checkpoint completo y autonomo, acompanado de un manifiesto `ihl_manifest.json` que documenta la intervencion. No se especifican en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada de Phi-1.5.
- Razonamiento basico y resolucion de problemas sencillos de matematicas y codigo, propias del modelo base.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- Capacidad multilingue limitada al ingles segun la model card.
- No dispone de vision, audio ni modo "thinking" documentado.
- Su capacidad principal, desde el punto de vista del investigador, es servir como artefacto de evaluacion de unlearning: se espera que haya "olvidado" el split `forget01` de TOFU conservando el rendimiento en `retain`.

## Casos de uso

- Evaluacion de metodos de unlearning: usar el checkpoint como referencia del estado tras 1 epoch de la estrategia IHL + Reset Both y comparar la retencion en `retain` y la supresion en `forget01` frente a otras variantes de la misma familia.
- Investigacion en privacidad de modelos: medir hasta que punto el reinicio de embeddings y cabeza LM elimina informacion memorizada de biografias ficticias, con vistas a tecnicas aplicables al derecho al olvido en despliegues reales.
- Reproducibilidad de experimentos TOFU: el manifiesto `ihl_manifest.json` y el caracter de checkpoint completo permiten reejecutar pipelines de evaluacion sin depender del estado de entrenamiento original.
- Analisis de degradacion por epoch: al ser el epoch 1 de 20, sirve para estudiar la curva de olvido frente a retencion y detectar si el procedimiento colapsa capacidades generales demasiado pronto.
- Estudio de "catastrofic forgetting" controlado: comparar el comportamiento del modelo en tareas genericas de Phi-1.5 (codigo, matematicas) antes y despues de la intervencion para cuantificar el dano colateral.
- Docencia y formacion: ejemplo practico de como se construye y se documenta un checkpoint de investigacion en unlearning, util en cursos de seguridad y etica de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 2,8-3,0 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, unos 4-6 GB para contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: en torno a 1,5-2 GB de pesos; en 4 bits, aproximadamente 0,8-1,0 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: tarjetas consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores son suficientes; en datacenter, A10, L4, A100 o H100 para lotes grandes.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6 GB o mas en fp16 y en practicamente cualquier GPU moderna con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requerido por el tag `custom_code`), vLLM y TGI para servicio, llama.cpp u Ollama solo si se generan pesos GGUF (no publicados).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (TOFU forget01, epoch 1) | 1.418 M | no disponible | Unlearning experimental (IHL + Reset Both) | apache-2.0 | Hugging Face, 0 descargas |
| `locuslab/tofu_ft_phi-1.5` | ~1.400 M | no disponible | Fine-tuning TOFU sin unlearning | no disponible en esta ficha | Hugging Face |
| `microsoft/phi-1_5` | ~1.300 M | no disponible | Modelo base de codigo y texto | MIT (segun publicacion original) | Hugging Face, ampliamente usado |
| Otros checkpoints `unl-reset` de la misma familia | ~1.400 M | no disponible | Variantes de unlearning (distintos epochs y estrategias) | apache-2.0 | Hugging Face |

La comparacion relevante no es de rendimiento generico sino de comportamiento frente al benchmark TOFU, y en la informacion disponible no se aportan metricas que permitan ordenar estas variantes.

## Limitaciones y advertencias

- Modelo de investigacion: no esta validado para uso en produccion ni como asistente conversacional.
- Riesgo de alucinacion elevado, inherente a Phi-1.5 y agravado por el proceso de reinicio de embeddings y cabeza LM.
- El objetivo del checkpoint es olvidar el split `forget01`; no se garantiza que la informacion haya desaparecido por completo ni que no sea recuperable mediante prompting adversario.
- Posible degradacion de capacidades generales (codigo, matematicas) por el entrenamiento sobre `retain` con la perdida IHL.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar antes de cargarlo.
- Licencia apache-2.0 permite uso comercial, pero el modelo no es adecuado para ello por su naturaleza experimental y su falta de benchmarks.
- Sin descargas ni likes en el momento de la consulta: no hay senales de validacion por parte de la comunidad.
- No se documentan sesgos especificos, pero al derivar de Phi-1.5 hereda los sesgos de sus datos de entrenamiento originales.

## Enlaces

- Hugging Face: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget01-ihl_reset_both-epoch01
- Modelo base del ajuste: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
