# unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch05

## Resumen

El modelo `unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch05` es un checkpoint de Phi-1.5 de 1.418 millones de parametros (1.418.270.720 exactamente) publicado por el usuario `unl-reset`. Se trata de un modelo derivado del ajuste fino `locuslab/tofu_ft_phi-1.5`, que a su vez parte de `microsoft/phi-1_5`. El objetivo declarado en la model card es la aplicacion de una tecnica de "reset" parcial: reinicializar las embeddings de entrada y la cabeza del modelo de lenguaje (LM head) desde el Phi-1.5 original, manteniendo el resto de pesos del transformer procedentes del ajuste fino sobre TOFU.

El modelo se enmarca en el contexto de investigacion sobre *machine unlearning* (olvido selectivo) y, mas concretamente, en el benchmark TOFU (Task of Fictitious Unlearning). El sufijo `forget10` indica que el entrenamiento se ha orientado a eliminar el conocimiento de un subconjunto de 10 autores ficticios del dataset TOFU, mientras que la notacion `ihl_reset_both` sugiere una combinacion de perdida de entropia cruzada inversa (IHL, *inverted hinge loss* o similar) sobre el conjunto a olvidar y entropia cruzada estandar sobre el conjunto a retener, con un peso de 1.0. El checkpoint corresponde a la epoca 5 de 20.

Se trata de un artefacto de investigacion de nicho, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y con licencia Apache 2.0. Su relevancia es academica: permite reproducir y evaluar estrategias de desaprendizaje sobre un modelo pequeno (Phi-1.5) antes de trasladarlas a modelos de mayor tamano. No esta pensado como modelo de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Phi-1.5) con codigo personalizado (`custom_code`) |
| Parametros totales | 1.418.270.720 (1,42 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repo: 2,8 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1,3-1,4 mil millones de parametros, disenado originalmente para generacion de codigo y razonamiento basico en ingles. Sobre esa base, el autor ha aplicado un procedimiento de desaprendizaje en dos fases. Primero, parte del checkpoint `locuslab/tofu_ft_phi-1.5`, que es un ajuste fino de Phi-1.5 sobre el dataset TOFU (preguntas y respuestas sobre autores ficticios). Despues, reinicializa las embeddings de entrada y la LM head desde el Phi-1.5 original (`microsoft/phi-1_5`), conservando el resto de pesos del transformer del modelo ajustado. Este "reset both" busca romper la asociacion entre tokens y conocimiento memorizado sin destruir por completo las capacidades linguisticas del modelo.

El entrenamiento combina dos objetivos: una perdida de tipo IHL (*inverted hinge loss*, segun la notacion del autor) aplicada sobre el conjunto `forget` (los 10 autores a olvidar) y una entropia cruzada estandar con peso 1.0 sobre el conjunto `retain` (el conocimiento que debe preservarse). El checkpoint publicado corresponde a la epoca 5 de un total de 20. La model card menciona un fichero `ihl_manifest.json` con detalles adicionales del procedimiento, aunque no se incluye su contenido en la informacion disponible. No se especifican el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; todo ello debe considerarse no disponible.

## Capacidades

- Generacion de texto en ingles: al heredar la arquitectura y los pesos de Phi-1.5, conserva la capacidad de generar texto coherente en ingles.
- Razonamiento basico y matematicas elementales: Phi-1.5 fue entrenado con enfasis en razonamiento de sentido comun y problemas aritmeticos sencillos.
- Generacion de codigo: Phi-1.5 original esta orientado a codigo Python; el ajuste fino sobre TOFU y el posterior desaprendizaje pueden degradar esta capacidad, pero la base arquitectonica la soporta.
- Desaprendizaje selectivo: el modelo esta disenado para no reproducir el conocimiento de 10 autores ficticios del conjunto `forget` de TOFU, manteniendo el resto.
- Soporte de tool calling / function calling: no disponible (no declarado en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible (no declarado).
- Capacidades multilingues: solo ingles (`language: en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Investigacion en machine unlearning: el modelo sirve como punto de comparacion reproducible para medir la eficacia de tecnicas de olvido selectivo sobre un transformer pequeno, usando el benchmark TOFU como referencia.
- Evaluacion de estrategias de reset de embeddings: permite estudiar si reinicializar las embeddings de entrada y la LM head reduce la memorizacion de datos de entrenamiento sin degradar la perplejidad en el conjunto de retencion.
- Experimentos de privacidad y cumplimiento: util para simular escenarios de derecho al olvido (GDPR) en los que se requiere eliminar la influencia de datos personales de un modelo ya entrenado, midiendo la fuga residual.
- Benchmarking de ataques de extraccion: se puede emplear como sujeto de prueba para evaluar hasta que punto un adversario puede recuperar informacion supuestamente olvidada mediante prompting o fine-tuning posterior.
- Docencia y formacion: sirve como ejemplo didactico de pipeline completo de desaprendizaje (modelo base, ajuste fino, reset, entrenamiento con perdida dual) en cursos de seguridad y etica de IA.
- Reproducibilidad de articulos academicos: al ser un checkpoint completo y autonomo (no solo un adaptador), facilita la replicacion de resultados de papers sobre TOFU sin necesidad de reentrenar.
- Analisis de degradacion de capacidades: permite cuantificar el coste en rendimiento linguistico general que impone el desaprendizaje agresivo, comparando con el modelo base `locuslab/tofu_ft_phi-1.5`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 2,8-3,0 GB para los pesos (1,42 mil millones de parametros x 2 bytes), mas overhead de activaciones y cache KV (dependiente de la longitud de contexto).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,5 GB; en 4 bits: alrededor de 0,8-1,0 GB (estimaciones teoricas, no verificadas para este checkpoint).
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM (RTX 3060, RTX 4060, RTX 2070) es suficiente en FP16 para contextos moderados; para mayor throughput, A100 o H100 no son necesarias dado el tamano.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas con 6 GB o mas.
- Opciones de despliegue: al usar `custom_code`, es necesario cargar con `trust_remote_code=True` en Transformers. Para cuantizacion, llama.cpp u Ollama requeririan conversion previa a GGUF (no disponible en el repo). vLLM y TGI podrian requerir adaptaciones por el codigo personalizado.
- Latencia y throughput estimados: no disponibles; al ser un modelo de 1,4 mil millones de parametros, se espera un throughput alto en GPU consumer, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| unl-reset/tofu-phi-1_5-...-epoch05 | 1,42 mil millones | no disponible | Apache 2.0 | HuggingFace (0 descargas) | Checkpoint de desaprendizaje sobre TOFU |
| locuslab/tofu_ft_phi-1.5 | ~1,42 mil millones | no disponible | no disponible en la informacion | HuggingFace | Modelo base ajustado sobre TOFU, sin desaprendizaje |
| microsoft/phi-1_5 | ~1,3 mil millones | 2048 tokens | MIT (segun el modelo original) | HuggingFace | Modelo original de Microsoft, orientado a codigo |
| locuslab/tofu_llama2-7b | ~7 mil millones | no disponible | no disponible | HuggingFace | Alternativa de mayor tamano para TOFU, no directamente comparable por escala |

La comparativa directa mas relevante es con `locuslab/tofu_ft_phi-1.5` (el modelo sin desaprendizaje) y con `microsoft/phi-1_5` (el modelo original). No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de investigacion: disenado para experimentos de desaprendizaje, no para uso en produccion ni como asistente general.
- Idiomas: solo ingles; no soporta castellano ni otros idiomas de forma fiable.
- Riesgo de alucinacion: como cualquier modelo de 1,4 mil millones de parametros, puede generar contenido factualmente incorrecto con alta confianza.
- Degradacion por desaprendizaje: el reset de embeddings y LM head y el entrenamiento con perdida IHL pueden haber deteriorado capacidades generales (codigo, matematicas) respecto al modelo base.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Phi-1.5 y de un ajuste fino sobre TOFU (autores ficticios), puede heredar sesgos del corpus original.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base `locuslab/tofu_ft_phi-1.5` y `microsoft/phi-1_5` tienen sus propias condiciones que deben respetarse; verificar la licencia del modelo original de Microsoft antes de cualquier uso comercial.
- Codigo personalizado: requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor; revisar `ihl_manifest.json` y los ficheros de codigo antes de cargarlo.
- Sin mantenimiento: cero descargas y cero likes; no hay garantia de soporte ni de que el checkpoint sea estable.
- Contexto: la longitud de contexto no se especifica en la model card; asumir la del Phi-1.5 original (2048 tokens) es una suposicion no verificada.

## Enlaces

- HuggingFace: https://huggingface.co/unl-reset/tofu-phi-1_5-locuslabft-unlresetoracle-forget10-ihl_reset_both-epoch05
- Modelo base del ajuste fino: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Benchmark TOFU (referencia): no disponible en la informacion proporcionada
- Paper de TOFU: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
