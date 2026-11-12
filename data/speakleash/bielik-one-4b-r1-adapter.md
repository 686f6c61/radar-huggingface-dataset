# speakleash/Bielik-One-4B-r1-Adapter

## Resumen

Bielik-One-4B-r1-Adapter es un adaptador LoRA con cabezas de decisión separadas, publicado por SpeakLeash, que se monta sobre el modelo base sin modificar Qwen/Qwen3.5-4B. No es un modelo generativo de propósito general: es un modelo de decisión que devuelve respuestas tipadas (elección entre opciones, probabilidad binaria, puntuación ordinal y etiquetado multi-etiqueta) con probabilidades calibradas y un valor de confianza. La distribución se empaqueta como plugin de vLLM, de modo que un mismo motor puede seguir sirviendo chat normal con el modelo base y, en paralelo, resolver decisiones estructuradas.

La propuesta de valor es el coste de despliegue: al reutilizar los pesos del base, el paquete añade solo unos 0,7 GB de memoria de GPU (adaptador LoRA más cabezas), frente a los aproximadamente 9 GB que requeriría una copia completa de un modelo de 4B fusionado. Está pensado para equipos que ya sirven Qwen3.5-4B con vLLM y quieren incorporar clasificación y decisión estructurada en el mismo motor, con contexto de 32 768 tokens, precisión bfloat16 por defecto y licencia Apache 2.0.

El modelo cubre 32 identificadores de idioma, entre ellos español, inglés, polaco y buena parte de las lenguas eslavas y germánicas, y se apoya en Qwen3.5-4B como sustrato lingüístico. Su relevancia actual está en el nicho de decisiones auditables: cada respuesta incluye probabilidades por opción y calibración por tipo de pregunta, lo que facilita umbrales explícitos y trazabilidad en flujos de negocio automatizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA adapter sobre transformer Qwen/Qwen3.5-4B, con cabezas de decisión separadas cargadas mediante plugin de vLLM |
| Parametros totales | 4B en el modelo base (el adaptador y las cabezas suman aproximadamente 0,7 GB de pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | 32 768 tokens (perfil por defecto) |
| Tipos de cuantizacion | bfloat16 (por defecto, calibrado); FP8 mediante `--fp8` (no calibrado, altera decisiones cerca del límite) |
| Idiomas soportados | 32: multilingual, pl, en, sq, bel, bs, bg, hr, cs, da, et, fi, fr, el, es, is, lt, nl, de, no, pt, ru, ro, sr, hbs, sv, sk, sl, tr, uk, hu, it, lv |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA y cabezas); requiere el base Qwen/Qwen3.5-4B por separado |

## Arquitectura y entrenamiento

El paquete no modifica los pesos del modelo base: sobre Qwen3.5-4B se aplica un adaptador LoRA de rango fijo junto con un conjunto de cabezas de decisión independientes. Cada tipo de pregunta tiene su propia cabeza y su propia temperatura de calibración: `choice` (softmax sobre las opciones), `noul` (probabilidad de sí, equivalente a una decisión binaria), `score` (distribución sobre niveles ordinales con valor esperado) y `labels` (sigmoide independiente por etiqueta con umbral 0,5). Las cabezas se cargan a través de un plugin específico de vLLM (`systemone-vllm-heads`), lo que permite compartir los pesos base entre el endpoint de chat y el endpoint de decisiones en una sola GPU.

La calibración se ajustó exclusivamente sobre el split de validación, con temperaturas de 1,625 para `choice`, 1,625 para binario, 2,878 para `score` y 0,917 para `labels`. La calibración no altera el argmax ni las decisiones por umbral de 0,5, solo las probabilidades reportadas. El perfil por defecto usa vLLM 0.32.0, pesos base en bfloat16, lecturas en FP32, prefix caching, 32 secuencias concurrentes y 4096 tokens por lote. No se detalla en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Decisión estructurada tipada con cuatro modalidades: elección entre opciones (`choice`), binaria sí/no (`noul`), puntuación ordinal (`score`) y etiquetado multi-etiqueta (`labels`).
- Salida con probabilidades por opción, valor esperado en las preguntas de tipo `score` y un campo `confidence` por pregunta.
- Procesamiento de múltiples preguntas sobre un mismo estado en una sola petición, con respuestas indexadas por nombre de pregunta.
- Calibración por tipo de pregunta aplicada por defecto, con opción de desactivarla (`--no-calibration`) o de forzar temperatura 1 para obtener probabilidades crudas.
- Servicio simultáneo de chat generativo con el modelo base sin modificar (`qwen-base`) y de decisiones (`decision`) en el mismo motor vLLM.
- Soporte multilingüe declarado para 32 idiomas, incluido el español.
- No es un modelo de generación de texto libre: la model card indica explícitamente que el endpoint `decision` no debe usarse para texto libre.
- No se documenta soporte de tool calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.

## Casos de uso

- Clasificación de tickets de soporte: enviar el texto del ticket como `state` y definir preguntas `choice` para categoría y `labels` para etiquetas aplicables; las probabilidades por opción permiten derivar a revisión humana cuando la confianza es baja.
- Gestión de cobros y facturación: el ejemplo de la model card resuelve en una sola llamada el estado de una factura (`choice`), si ha vencido el plazo (`noul`), la urgencia de cobro (`score`) y las acciones procedentes (`labels`), con umbrales auditables.
- Triaje de moderación de contenido: preguntas binarias y multi-etiqueta sobre políticas independientes, con probabilidad por etiqueta y umbral fijo de 0,5 para decidir bloqueo o revisión.
- Enrutamiento en pipelines de atención al cliente: usar `choice` para asignar un caso a un equipo o cola, aprovechando la calibración para fijar un umbral de derivación a agente humano.
- Extracción de señales estructuradas en documentos largos: con 32 768 tokens de contexto se pueden pasar contratos, correos o expedientes completos y consultar varias dimensiones de decisión en una sola petición.
- Evaluación de riesgo y priorización: preguntas `score` sobre niveles ordinales (por ejemplo, riesgo bajo, medio, alto) con valor esperado y distribución completa, útil para ordenar colas de trabajo.
- Despliegue económico junto a un chatbot existente: si ya se sirve Qwen3.5-4B en vLLM, añadir este adaptador cuesta unos 0,7 GB de GPU y permite ofrecer decisiones tipadas desde el mismo motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 12 GB para el modelo de 4B, incluyendo pesos y la caché KV configurada.
- Con `--fp8` la memoria de pesos se reduce aproximadamente a la mitad, a costa de perder la calibración y alterar decisiones cercanas al límite.
- Sobre un despliegue existente de Qwen3.5-4B en vLLM, el adaptador añade solo unos 0,7 GB de memoria de GPU al compartir los pesos base.
- Una copia fusionada equivalente (Bielik-One-4B-r1) requeriría su propia copia completa de aproximadamente 9 GB.
- GPU recomendadas: no se especifican modelos concretos en la información disponible; por el tamaño en bfloat16 (unos 12 GB) encaja en GPUs de 16 GB o más, como RTX 4090, L40S, A100 o H100, aunque esta última apreciación no está confirmada por el autor.
- Opciones de despliegue: vLLM 0.32.0 mediante el paquete `bielik-one` y el plugin `systemone-vllm-heads`; no se documentan llama.cpp, Ollama ni TGI.
- Configuración por defecto del motor: 32 secuencias concurrentes, 4096 tokens por lote, prefix caching y contexto de 32 768 tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-One-4B-r1-Adapter | 4B (base) + ~0,7 GB de adaptador y cabezas | 32 768 | Decisiones tipadas con probabilidades calibradas sobre vLLM | Apache 2.0 | Hugging Face (adaptador y versión fusionada) |
| Qwen/Qwen3.5-4B | 4B | no disponible en la información proporcionada | Generación de texto general | no disponible en la información proporcionada | Hugging Face |
| Bielik-One-4B-r1 | 4B | 32 768 (misma configuración) | Mismo modelo en checkpoint fusionado, sin reutilizar pesos base | Apache 2.0 | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento frente a alternativas de clasificación o decisión estructurada.

## Limitaciones y advertencias

- El endpoint `decision` no debe emplearse para generación de texto libre; para eso está el endpoint de chat del modelo base.
- La calibración se ajustó en bfloat16 y no es válida para el modo `--fp8`, que además puede cambiar decisiones cercanas al límite.
- Desactivar la calibración o fijar temperatura 1 devuelve probabilidades crudas, no comparables con los umbrales calibrados.
- El adaptador depende de una versión concreta de vLLM (0.32.0 en el perfil por defecto) y de un plugin propio (`systemone-vllm-heads`), lo que añade acoplamiento operativo.
- El repositorio tiene un volumen de descargas muy bajo (4 descargas, 0 likes en el momento de la consulta), por lo que la validación por parte de la comunidad es prácticamente inexistente.
- No se documentan evaluaciones de sesgo, robustez ni tasas de alucinación en la información disponible.
- El rendimiento en idiomas distintos del polaco e inglés no está cuantificado, pese a declararse soporte para 32 idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-4B tiene su propia licencia que debe verificarse por separado.
- Para solicitudes sobre datos personales o contenido con derechos de autor, el autor indica el contacto biuro@speakleash.org.pl.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-4B-r1-Adapter
- Versión fusionada: https://huggingface.co/speakleash/Bielik-One-4B-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del paquete y plugin de vLLM: https://github.com/speakleash/bielik-one
- Contacto del proyecto: biuro@speakleash.org.pl
