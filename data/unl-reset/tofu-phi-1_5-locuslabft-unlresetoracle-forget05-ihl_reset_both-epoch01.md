# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch01

## Resumen

Este repositorio contiene un checkpoint completo del modelo Phi-1.5 (1.418 millones de parametros) obtenido tras aplicar una tecnica de *machine unlearning* sobre el conjunto de datos TOFU, en concreto sobre la particion `forget05`. El punto de partida es `locuslab/tofu_ft_phi-1.5`, un fine-tuning de Phi-1.5 sobre TOFU realizado por el laboratorio LocusLab, y el resultado es un modelo al que se le ha aplicado un procedimiento denominado "IHL + Reset Both" durante una epoca (de un total de 20 previstas, segun el nombre del checkpoint).

La relevancia de este artefacto es fundamentalmente metodologica: no es un modelo de proposito general, sino un checkpoint de investigacion para evaluar tecnicas de olvido selectivo (*unlearning*) en modelos de lenguaje. El autor, `unl-reset`, publica el modelo con la intencion de que sirva como referencia reproducible en experimentos de eliminacion de conocimiento factual especifico, un area activa por sus implicaciones en privacidad, cumplimiento del RGPD y gestion del ciclo de vida de datos en modelos entrenados.

El modelo conserva la arquitectura original de Phi-1.5 (transformer decoder-only de 1.300 millones de parametros publicos, 1.418 millones contando embeddings y cabezas), pero reinicializa los embeddings de entrada y la cabeza LM desde `microsoft/phi-1_5` mientras mantiene el resto de pesos del modelo fine-tuneado. El entrenamiento de olvido combina una perdida de entropia cruzada inversa (token IHL) sobre el conjunto a olvidar con una perdida de entropia cruzada estandar (peso 1.0) sobre el conjunto a retener.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (heredada de Phi-1.5; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5: un transformer decoder-only denso con atencion multi-cabeza estandar, normalizacion LayerNorm y activacion GELU, disenado originalmente por Microsoft Research para generacion de codigo y texto educativo. El checkpoint aqui publicado no modifica esa arquitectura; lo que cambia es el estado de los pesos. Segun la model card, los embeddings de entrada y la cabeza de lenguaje se reinicializan desde `microsoft/phi-1_5`, mientras que el resto de pesos del transformer se conservan del modelo fine-tuneado `locuslab/tofu_ft_phi-1.5`.

El procedimiento de olvido, etiquetado como "IHL + Reset Both", combina dos senales de entrenamiento: una perdida de entropia cruzada inversa a nivel de token (IHL, *Inverted Hinge Loss* o variante equivalente segun la nomenclatura del autor) aplicada sobre la particion `forget05` de TOFU, y una perdida de entropia cruzada convencional con peso 1.0 sobre el conjunto de retencion. El checkpoint corresponde a la epoca 1 de un total de 20, lo que sugiere que el proceso completo de olvido no esta reflejado en este artefacto. El repositorio incluye un fichero `ihl_manifest.json` con metadatos del experimento, aunque su contenido no se detalla en la informacion disponible.

## Capacidades

- Generacion de texto en ingles con la calidad base de Phi-1.5, modulada por el proceso de olvido aplicado.
- Razonamiento basico y respuesta a preguntas factuales, condicionado a la particion de datos retenida.
- Generacion de codigo sencillo, capacidad heredada del preentrenamiento original de Phi-1.5.
- Soporte de tool calling: no disponible de forma nativa en Phi-1.5.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma nativa.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- **Investigacion en machine unlearning**: el modelo sirve como checkpoint de referencia para comparar tecnicas de olvido selectivo frente a reentrenamiento desde cero, midiendo la degradacion en el conjunto `forget05` y la retencion en el conjunto *retain* de TOFU.
- **Auditoria de privacidad y cumplimiento**: util para estudiar si un modelo puede eliminar informacion personal o factual concreta sin reentrenar, un requisito habitual en escenarios de derecho al olvido (RGPD, articulo 17).
- **Evaluacion de ataques de extraccion de conocimiento**: permite medir la resistencia del olvido frente a *prompting* adversarial o ataques de inversion de modelo, comparando la probabilidad de recuperar los datos supuestamente olvidados.
- **Benchmarking de metodologias de reset**: al reinicializar embeddings y cabeza LM, el checkpoint es util para analizar el impacto de esta estrategia frente a otros metodos de olvido que solo ajustan capas internas.
- **Docencia y experimentacion academica**: apropiado para cursos o laboratorios sobre ciclo de vida de modelos, donde se necesita un artefacto pequeno (2,8 GB) que quepa en GPU de consumo y permita iterar rapidamente.
- **Estudio de la relacion olvido-retencion**: la combinacion de perdidas IHL y CE con peso 1.0 permite analizar el equilibrio entre eliminar informacion no deseada y preservar capacidades generales, un *trade-off* central en la literatura de unlearning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,2 GB (1.418 millones de parametros a 2 bytes por peso, mas overhead de activaciones y cache KV).
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 1,5-2 GB; en 4 bits: aproximadamente 1-1,5 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16, como RTX 3050, RTX 4060, RTX 3060, o GPUs de datacenter como A100, H100 o L4 para despliegues por lotes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 4 GB o mas.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (obligatorio por el tag `custom_code`); vLLM, llama.cpp u Ollama no estan confirmados para este checkpoint al no publicarse variantes GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch01 | 1.418 M | no disponible (heredado de Phi-1.5, 2048) | apache-2.0 | HuggingFace, 0 descargas | Checkpoint de unlearning sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | 1.418 M | 2048 | no disponible | HuggingFace | Modelo base fine-tuneado sobre TOFU, sin olvido |
| microsoft/phi-1_5 | 1.300 M | 2048 | MIT (original) | HuggingFace | Modelo original de Microsoft, sin fine-tuning TOFU |
| Otros checkpoints TOFU (p. ej. variantes de locuslab) | ~1.300-1.418 M | 2048 | variable | HuggingFace | Alternativas de referencia para comparar tecnicas de olvido |

## Limitaciones y advertencias

- **Modelo de investigacion, no de produccion**: es un checkpoint intermedio (epoca 1 de 20) de un experimento de unlearning; su calidad y coherencia no estan validadas para uso general.
- **Riesgo de alucinacion**: Phi-1.5 es propenso a inventar hechos, y el proceso de olvido puede incrementar la incoherencia en dominios afectados por la perdida IHL.
- **Idioma**: solo ingles segun la model card; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- **Contexto limitado**: 2048 tokens, insuficiente para tareas de contexto largo o documentos extensos.
- **Dependencia de `custom_code`**: requiere `trust_remote_code=True` en `transformers`, lo que implica ejecutar codigo del autor y anade riesgo de seguridad en entornos no controlados.
- **Licencia**: apache-2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y el original `microsoft/phi-1_5` pueden tener condiciones adicionales que conviene verificar antes de un despliegue comercial.
- **Sin garantias de olvido efectivo**: la literatura muestra que los metodos de unlearning pueden ser revertidos mediante ataques de extraccion; no debe asumirse que la informacion de `forget05` este realmente eliminada.
- **Sin benchmarks publicados**: no hay evidencia cuantitativa de retencion ni de olvido en este checkpoint concreto.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget05-ihl_reset_both-epoch01
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Dataset TOFU (referencia habitual en la literatura): no disponible en la informacion proporcionada
- Paper de TOFU (referencia habitual): no disponible en la informacion proporcionada
