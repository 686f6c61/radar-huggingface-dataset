# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch12

## Resumen

Este repositorio contiene un checkpoint completo del modelo Phi-1.5 (1.418 millones de parametros) obtenido tras aplicar una tecnica de *machine unlearning* sobre el conjunto de datos TOFU, en su variante `forget10`. El punto de partida es `locuslab/tofu_ft_phi-1.5`, un ajuste fino del Phi-1.5 original de Microsoft sobre el benchmark TOFU, y el resultado es un modelo al que se le ha aplicado un procedimiento combinado de *reset* de embeddings de entrada y cabeza LM (inicializados de nuevo desde `microsoft/phi-1_5`) junto con un entrenamiento de tipo IHL (*Iterative Hessian-free / influence-based unlearning*, segun la nomenclatura del autor) durante 12 epocas de un total de 20.

El modelo es relevante en el contexto de la investigacion sobre desaprendizaje selectivo y cumplimiento normativo (por ejemplo, derecho al olvido en el RGPD): demuestra como se puede eliminar informacion concreta de un modelo ya entrenado sin reentrenar desde cero, manteniendo el resto de capacidades. No obstante, se trata de un artefacto de investigacion, no de un modelo listo para produccion: cero descargas, cero likes, sin pipeline declarado y publicado en noviembre de 2026.

La arquitectura subyacente es la de Phi-1.5, un transformer decoder-only de 1.300 millones de parametros (aqui 1.418 millones contando embeddings y cabeza) con 24 capas, 32 cabezas de atencion y una longitud de contexto nativa de 2.048 tokens. El modelo solo declara soporte para ingles y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5), con modulo `custom_code` |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 nativo: 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | locuslab/tofu_ft_phi-1.5 |
| Tamano del repositorio | 2.8 GB |
| Epoca de entrenamiento | 12/20 |
| Metodo de desaprendizaje | IHL + reset de embeddings y cabeza LM |
| Conjunto de evaluacion | TOFU `forget10` |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Phi-1.5: un transformer decoder-only denso de 1.300 millones de parametros, entrenado originalmente por Microsoft sobre un corpus mixto de codigo y texto educativo de libros de texto sinteticos, con 24 capas, 32 cabezas de atencion, dimension oculta de 2.048 y 2.048 tokens de contexto. No emplea MoE ni mecanismos de atencion lineal; es un transformer clasico con atencion multi-cabeza estandar.

El proceso de construccion de este checkpoint parte de `locuslab/tofu_ft_phi-1.5`, un ajuste fino supervisado de Phi-1.5 sobre el dataset TOFU (Toxic Opinions and Facts Unlearned), que contiene 200 autores ficticios con 20 pares pregunta-respuesta cada uno. Sobre ese punto de partida se aplica un procedimiento de desaprendizaje que combina dos tecnicas: (1) reinicializacion de los embeddings de entrada y de la cabeza de lenguaje a partir de los pesos originales de `microsoft/phi-1_5`, y (2) un entrenamiento con una funcion de perdida compuesta que suma una perdida IHL sobre el conjunto `forget` y una entropia cruzada estandar con peso 1.0 sobre el conjunto `retain`. El entrenamiento se ejecuta durante 12 de las 20 epocas previstas, segun indica el nombre del checkpoint. El autor referencia un fichero `ihl_manifest.json` con los detalles del procedimiento, aunque su contenido no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de texto en ingles, heredada del Phi-1.5 base.
- Razonamiento basico y resolucion de problemas de nivel escolar, dado el entrenamiento original de Phi-1.5 en datos educativos.
- Generacion de codigo y respuesta a preguntas tecnicas, capacidades propias del modelo base.
- Capacidad de *machine unlearning* verificable sobre el conjunto `forget10` de TOFU: el modelo deberia haber olvidado las respuestas asociadas a los 10 autores del split de olvido, manteniendo el conocimiento sobre el resto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Investigacion en desaprendizaje selectivo: sirve como checkpoint de referencia para reproducir y comparar el efecto de la combinacion IHL + reset frente a otras tecnicas (gradient ascent, preference optimization, etc.) sobre el benchmark TOFU.
- Auditoria de privacidad y RGPD: permite estudiar empiricamente si un modelo ajustado sobre datos personales puede "olvidar" a sujetos concretos sin reentrenar desde cero, midiendo la fuga residual de informacion.
- Evaluacion de robustez frente a *membership inference*: util para comprobar si un atacante puede distinguir entre datos olvidados y datos retenidos tras el procedimiento.
- Linea base en estudios de alineacion y seguridad: comparar la degradacion de capacidades generales (perplexidad en `retain`) frente a la efectividad del olvido en `forget`.
- Docencia y formacion: ejemplo didactico de como se modifica un checkpoint de un modelo pequeno (1.4B) para eliminar conocimiento especifico, con trazabilidad clara del modelo base.
- Prototipado de pipelines de *unlearning* en produccion: aunque no es un modelo de produccion, sirve para validar herramientas y scripts de evaluacion de olvido antes de aplicarlos a modelos mayores.
- Experimentos de ablacion: al existir variantes del mismo autor con distintas epocas y tecnicas, permite aislar el efecto de cada componente (reset, IHL, epocas).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en FP16: aproximadamente 2.8 GB de pesos (coincide con el tamano del repositorio) mas overhead de activaciones; en la practica, entre 4 y 6 GB para inferencia con contexto corto.
- VRAM estimada en cuantizacion 8-bit: aproximadamente 1.5 GB de pesos.
- VRAM estimada en cuantizacion 4-bit: aproximadamente 0.8-1 GB de pesos.
- GPU recomendadas para FP16: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Cabe holgadamente en cualquier GPU consumer con 8 GB o mas.
- Cabe en GPU consumer: si, en RTX 3060, RTX 4060, RTX 4070, RTX 4090 y equivalentes; tambien en GPUs de 6-8 GB con cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (el repositorio incluye `custom_code`), vLLM, TGI y llama.cpp/Ollama tras conversion a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este checkpoint (unl-reset/tofu-phi-1_5-...) | 1.418 M | no disponible (nativo 2.048) | Apache 2.0 | HuggingFace, 0 descargas | Modelo de investigacion con desaprendizaje TOFU |
| microsoft/phi-1_5 | 1.300 M | 2.048 | MIT | HuggingFace, ampliamente usado | Modelo base original, sin ajuste TOFU |
| locuslab/tofu_ft_phi-1.5 | 1.300 M | 2.048 | no disponible | HuggingFace | Ajuste fino sobre TOFU completo, sin desaprendizaje |
| Otros checkpoints unl-reset (misma familia) | ~1.418 M | no disponible | Apache 2.0 | HuggingFace | Variantes con distintas epocas y tecnicas de olvido |

## Limitaciones y advertencias

- Modelo de investigacion sin uso en produccion: cero descargas, cero likes y sin pipeline declarado; no hay evidencia de validacion externa.
- Riesgo de alucinacion: propio de Phi-1.5; el procedimiento de desaprendizaje no lo mitiga y puede incrementarlo al perturbar embeddings y cabeza LM.
- El *reset* de embeddings y cabeza LM puede degradar capacidades generales (perplejidad en `retain`), no solo eliminar el conocimiento objetivo; no se aportan metricas de esta degradacion.
- Solo ingles declarado; no hay soporte multilingue verificado.
- Longitud de contexto no documentada en la ficha; se asume la nativa de Phi-1.5 (2.048 tokens), insuficiente para tareas de contexto largo.
- Requiere `trust_remote_code=True` por el modulo `custom_code` incluido; conviene auditar ese codigo antes de ejecutarlo.
- El desaprendizaje no garantiza eliminacion completa: la informacion puede persistir de forma latente y ser recuperable mediante *prompting* adversario o ataques de extraccion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` no declara licencia en la informacion disponible; conviene verificar la cadena de licencias antes de cualquier uso comercial.
- Sin datos de benchmarks ni evaluacion de sesgos; no se puede afirmar nada sobre su comportamiento etico o de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_head-epoch12
- Modelo base (ajuste TOFU): https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Referencia al fichero de manifiesto: `ihl_manifest.json` (mencionado en la model card; no se proporciona URL directa)
