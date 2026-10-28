# test24675/GLM-5.3-Flash-UNCENSORED-321B

## Resumen

GLM-5.3-Flash-UNCENSORED-321B es una reesubida no oficial del modelo GLM-5.3-Flash de zai-org, publicada por el usuario `test24675`, en la que se ha eliminado el comportamiento de rechazo directamente en los pesos (abliteración a nivel de tensor, sin SFT, DPO, LoRA ni vectores de dirección). Se distribuye en FP8 block-wise e4m3, con 321.323.031.390 parámetros totales según los safetensors del repositorio (la model card declara 320B) y unos 18B activos por token, sobre una arquitectura MoE híbrida `glm5_next` que combina atención lineal KDA con atención dispersa tipo DeepSeek.

El modelo conserva las capacidades del base: ventana de contexto de 1M de tokens, torre de visión GLM-4.1V operativa y cabeza de predicción multi-token (MTP) empleada como draft head para decodificación especulativa, con una tasa de aceptación declarada del 75,9%. La relevancia práctica es doble: por un lado, permite estudiar y desplegar un MoE de ~320B en FP8 a velocidad nativa sobre Hopper (H100/H200); por otro, interesa a equipos de investigación en seguridad y alineamiento porque documenta empíricamente cómo se comporta un modelo de gran escala tras una edición de pesos orientada a eliminar rechazos, incluyendo métricas de refusal sobre HarmBench-320.

Conviene señalar que el autor original de la técnica es dealignai y que este repositorio es un espejo de terceros con 0 descargas y 0 likes en el momento de la consulta: la procedencia de los tensores, la integridad de los ficheros y la vigencia de las correcciones anunciadas en la model card no están verificadas por el autor original. El repositorio ocupa 328,4 GB y los pesos son FP8, lo que, junto al contexto de 1M, condiciona por completo el despliegue en hardware multi-GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-5.3-Flash (`glm5_next`): MoE híbrido con atención lineal KDA + atención dispersa tipo DeepSeek |
| Parametros totales | 321.323.031.390 (~321B según safetensors; la model card declara 320B) |
| Parametros activos | ~18B por token |
| Longitud de contexto | 1.000.000 tokens (según model card) |
| Tipos de cuantizacion | FP8 block-wise e4m3 (único formato publicado); otras cuantizaciones no disponibles |
| Idiomas soportados | `en` (inglés) según los metadatos del repositorio |
| Licencia | MIT |
| Formato de pesos | safetensors (FP8); tamaño del repo 328,4 GB |
| Modelo base | zai-org/GLM-5.3-Flash |
| Cabeza MTP | Incluida y también ablacionada; aceptación declarada del 75,9% |
| Torre de visión | GLM-4.1V, declarada operativa; plantilla multimodal incluida |
| Autor de la modificación | dealignai (release original); este repositorio es una reesubida de `test24675` |
| Fecha de creación del repo | 2026-10-27 |

## Arquitectura y entrenamiento

La arquitectura es la del GLM-5.3-Flash original: un transformer con mezcla de expertos que intercala capas de atención lineal KDA (de coste lineal en la longitud de secuencia, lo que hace viable el contexto de 1M tokens) con capas de atención dispersa tipo DeepSeek, y que activa aproximadamente 18B de los 320B parámetros por token. El repositorio incorpora además una cabeza MTP (multi-token prediction) que actúa como modelo borrador para decodificación especulativa, con un 75,9% de aceptación declarada, y una torre de visión GLM-4.1V con su plantilla de chat multimodal. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

Sobre esa base, la modificación consiste exclusivamente en una edición de pesos orientada a eliminar el comportamiento de rechazo: el autor declara explícitamente que no hay fine-tuning, SFT ni DPO, ni plantillas de jailbreak, LoRA, adaptadores, vectores de dirección, hooks en tiempo de ejecución o `model.py` personalizado. El resultado se carga con vLLM o SGLang estándar. La edición se describe como «conservadora» para preservar la calidad: el modelo queda sin rechazos en los modos de razonamiento desactivado y de esfuerzo máximo (0% de rechazos declarado sobre HarmBench-320), mientras que el modo de esfuerzo bajo conserva parte de los rechazos por diseño. La versión actual corrige un problema de bucles de repetición presente en pesos anteriores y reporta MMLU del 87,33% frente al 86,74% del base, sin metodología de evaluación detallada.

## Capacidades

- Generación de texto en inglés a partir de un contexto de hasta 1M tokens, con atención lineal para secuencias largas.
- Razonamiento explícito con modos de esfuerzo configurables mediante `reasoning_effort`: solo acepta `low` y `high`; cualquier otro valor (`medium`, `xhigh`, `off`) u omitirlo resuelve a `max`.
- Razonamiento devuelto en `message.reasoning`, no en `message.reasoning_content`, en las versiones actuales de vLLM.
- Visión: procesamiento de imágenes con presupuesto de tokens calculado como `text + 2 + ceil(H/28)*ceil(W/28)`, con mínimo de 16 y máximo de 8000 tokens por imagen, controlable mediante `mm_processor_kwargs.max_image_tokens` y `min_image_tokens`.
- Vídeo: muestreo configurable mediante `media_io_kwargs.video.fps`, con la restricción de que el valor debe ser inferior al fps del clip para no romper el motor.
- Decodificación especulativa nativa mediante la cabeza MTP incluida.
- Comportamiento sin censura en modo de razonamiento desactivado y en esfuerzo máximo (0% de rechazos sobre HarmBench-320 según el autor).
- Capacidades de tool calling / function calling: no documentadas en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado como tal; el modelo soporta conversaciones multi-turno, pero la model card advierte que un turno vacío por agotamiento de presupuesto contamina el historial.
- Capacidades multilingües: limitadas a inglés según los metadatos; no se declaran otros idiomas.

## Casos de uso

- Análisis de documentación extensa y auditoría de contratos: con 1M de tokens de contexto y capas de atención lineal, el modelo puede ingerir un corpus completo (por ejemplo, un expediente entero o un repositorio de documentación) en una sola petición y responder preguntas cruzadas sin troceado ni recuperación externa.
- Analítica de vídeo e imagen en pipelines internos: la torre GLM-4.1V permite describir o extraer información de clips e imágenes; fijando `fps: 2` y un presupuesto de tokens de imagen se controla el coste por petición y se evita el fallo de motor documentado en vLLM.
- Red teaming y evaluación de seguridad: al ser un modelo con rechazos eliminados en los pesos y con métricas publicadas sobre HarmBench-320, sirve como referencia para medir la eficacia de clasificadores de salida, filtros de contenido o políticas de moderación antes de desplegarlas.
- Investigación sobre abliteración y edición de pesos: comparar este repositorio con el GLM-5.3-Flash base permite estudiar el coste en calidad (MMLU 87,33% frente a 86,74%) y el cambio en la distribución de rechazos por nivel de esfuerzo, con una variable controlada.
- Generación de datos sintéticos y destilación de razonamiento: los modos `low`, `high` y `max` permiten generar trazas de razonamiento de distinta profundidad a gran escala, con la precaución de asignar `max_tokens >= 6000` cuando se use el modo `max`.
- Procesamiento por lotes de clasificación y extracción sobre corpus largos: al activar solo ~18B parámetros por token, el coste de cómputo por token es contenido en relación con el tamaño total, lo que hace viable el throughput por lotes en configuraciones tensor-parallel sobre Hopper.
- Servicio de asistencia técnica sin restricciones de contenido: útil en dominios donde el modelo base sobre-rechaza peticiones benignas (por ejemplo, referencia bibliográfica o fragmentos de código con copyright), que la model card identifica como motivo principal de la edición.

## Benchmarks y rendimiento

| Benchmark | Este modelo | GLM-5.3-Flash base | Notas |
|---|---|---|---|
| MMLU | 87,33% | 86,74% | Datos del autor; sin metodología ni número de muestras |
| HarmBench-320 (tasa de rechazo) | 0% en razonamiento desactivado y esfuerzo máximo | No disponible | El modo `low` conserva rechazos por diseño |
| Aceptación de la cabeza MTP | 75,9% | No disponible | Afecta al speedup de decodificación especulativa |

No se han publicado resultados de benchmarks en la información disponible para HumanEval, GSM8K, MATH, MMMU ni otras evaluaciones estándar, ni existe comparación independiente con modelos de la misma categoría. El dato de throughput disponible es una decodificación de 163 tok/s en un solo stream con TP4 y FP8 nativo sobre H200, medido por el autor; la cifra de prefill aparece truncada en la model card y se desconoce.

## Requisitos de hardware

- VRAM para pesos: ~321 GB solo en pesos FP8 (repositorio de 328,4 GB, que incluye torre de visión, cabeza MTP y tokenizer). Estimación a partir del tamaño del repo, no un dato publicado.
- Configuración de referencia medida por el autor: TP4 sobre H200 (4 × 141 GB = 564 GB), que deja margen para caché KV y activaciones y alcanza 163 tok/s de decodificación en un solo stream.
- H100 de 80 GB: TP4 (320 GB) resulta insuficiente para los pesos solos; se necesita TP8 (640 GB) o nodos mayores. Estimación propia, no verificada.
- A100 de 80 GB: sin FP8 nativo, el modelo se ejecutaría en BF16/FP16 (más de 600 GB de pesos) o requeriría reconversión; no es una opción práctica con los pesos publicados.
- GPU de consumo (RTX 4090, 24 GB; RTX 5090, 32 GB): no es viable. Ni siquiera una cuantización hipotética a 4 bits (~160 GB) cabría en una sola tarjeta, y no se publican GGUF.
- Opciones de despliegue documentadas: vLLM y SGLang con FP8 nativo en Hopper. No se mencionan llama.cpp, Ollama ni TGI para estos pesos.
- Latencia: la decodificación está caracterizada (163 tok/s en TP4/H200); el tiempo hasta el primer token depende del prefill, cuyo dato no está disponible.
- Presupuesto de tokens de razonamiento: en modo `max` con `max_tokens` de 2000 la conversación se degrada a partir del cuarto turno; con 6000 el comportamiento es correcto. Los modos `low` y `high` funcionan con 2000.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia | Estado |
|---|---|---|---|---|---|---|
| test24675/GLM-5.3-Flash-UNCENSORED-321B | 321B | ~18B | 1M | FP8 e4m3 | MIT | Espejo de terceros, 0 descargas, 0 likes |
| zai-org/GLM-5.3-Flash (base) | 320B | ~18B | 1M | No disponible en la información | No disponible en la información | Release oficial, con alineación de seguridad |
| dealignai/GLM-5.3-Flash-ABLITERATED-FP8 | 320B | ~18B | 1M | FP8 | No disponible en la información | Release original de la modificación |

No se dispone de datos verificables de otros MoE de ~300B (por ejemplo, familias DeepSeek o Qwen) en la información proporcionada, por lo que la comparación cuantitativa con alternativas externas se marca como no disponible. La elección real se reduce a tres opciones: el base alineado, el release original de dealignai y este espejo, sin diferencias declaradas de arquitectura entre ellos.

## Limitaciones y advertencias

- Ausencia total de alineación de seguridad: los rechazos han sido eliminados en los pesos, de modo que el modelo no es apto para aplicaciones orientadas al público sin una capa de moderación externa.
- Riesgo legal y reputacional: la model card cita explícitamente peticiones de copyright como caso de uso, lo que puede derivar en responsabilidad por infracción según la jurisdicción de despliegue.
- Procedencia no verificada: el repositorio es una reesubida de `test24675` con 0 descargas y 0 likes, creada y actualizada el mismo día. No hay garantía de que los tensores coincidan con el release de dealignai ni de que incorporen la corrección de bucles de repetición anunciada el 2026-08-28.
- Licencia: el repositorio declara MIT, pero la licencia del modelo base GLM-5.3-Flash no figura en la información disponible; conviene verificar los términos del base antes de cualquier uso comercial.
- Idioma: solo se declara inglés. El rendimiento en castellano u otras lenguas no está documentado y no debería asumirse.
- Alucinación: no se han publicado tasas de alucinación ni evaluaciones de fidelidad; el ajuste de pesos no mejora la veracidad.
- Fallo operativo documentado: en modo `max` con presupuesto de tokens reducido el modelo devuelve contenido vacío con `finish_reason="length"`, y en multi-turno ese turno vacío corrompe el historial de forma irreversible.
- Errores de integración con vLLM: pasar `fps` igual o superior al del clip provoca un `ValueError` de recuento de tokens multimodales y un `EngineDeadError` que tumba el servidor (referencias vLLM #55644 y #55647); `max_pixels`, `min_pixels`, `size` y `detail` se aceptan y se ignoran silenciosamente.
- Incompatibilidad de plantilla: `enable_thinking` no existe en esta plantilla; pasarlo, o un `reasoning_effort: "none"` de nivel superior, desactiva el parser mientras el modelo sigue razonando y vuelca el razonamiento en bruto en `content`.
- Comportamiento no uniforme: el modo de esfuerzo bajo conserva rechazos por diseño, así que la evaluación de robustez debe especificar el modo usado.
- Coste de infraestructura: el despliegue exige 4-8 GPU Hopper; el contexto de 1M implica una caché KV cuyo consumo no está cuantificado en la documentación y debe presupuestarse aparte.

## Enlaces

- Repositorio del modelo: https://huggingface.co/test24675/GLM-5.3-Flash-UNCENSORED-321B
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Release original de la modificación (espejo citado en la model card): https://huggingface.co/dealignai/GLM-5.3-Flash-ABLITERATED-FP8
- Perfil del autor de la modificación: https://huggingface.co/dealignai
- Twitter del autor: https://twitter.com/dealignai
- Incidencias de vLLM citadas en la model card: #55644 y #55647 (sin URL completa en la información disponible)
- Paper, blog técnico, demo o repositorio de código adicionales: no disponibles en la información proporcionada
