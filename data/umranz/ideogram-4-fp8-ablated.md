# Umranz/Ideogram-4-FP8-Ablated

## Resumen

Ideogram-4-FP8-Ablated es una modificación de los pesos del modelo de generación de imágenes Ideogram 4 en formato FP8, publicado por el usuario Umranz en HuggingFace. El modelo base es un Diffusion Transformer (DiT) de flujo único con 9.280 millones de parámetros desarrollado por Ideogram AI, y esta versión aplica una técnica de "abliteration" (ablación de vectores de rechazo) sobre el adaptador de condicionamiento textual para eliminar la capacidad de rechazo del modelo ante ciertas categorías de prompts.

La intervención se centra en el módulo `llm_cond_proj`, una proyección lineal que actúa como único punto de entrada de las características del codificador de texto Qwen3-VL-8B-Instruct hacia los 34 bloques del DiT. Mediante la anulación del subespacio generado por un vector de rechazo (operación $W^* = W(I - vv^\top)$), el autor afirma extinguir las direcciones de rechazo antes de que alcancen el backbone del transformer, preservando el 99,57% de los pesos originales y una fidelidad semántica del 98,11% en prompts benignos según sus propias métricas.

El modelo se presenta como herramienta de investigación en interpretabilidad mecanicista y seguridad, no como un modelo de producción. El repositorio ocupa solo 0,5 GB porque contiene únicamente los pesos del adaptador modificado, no el modelo completo, que debe descargarse por separado desde el repositorio oficial de Ideogram.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de flujo único con flow matching; 34 bloques, sin cross-attention, AdaLN condicionado solo por tiempo $t$ |
| Parametros totales | 9.280 millones (modelo base); el adaptador modificado `llm_cond_proj` tiene 245,37 M (53.248 → 4.608) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo text-to-image; el codificador de texto es Qwen3-VL-8B-Instruct) |
| Tipos de cuantizacion | FP8 en el modelo base; los pesos abliterados se entregan en BF16 según la model card |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`ideogram4_gateway_ablated.safetensors`) |

## Arquitectura y entrenamiento

El modelo base es un DiT de flujo único con 34 bloques transformer que procesa la condición textual a través de un adaptador lineal (`llm_cond_proj`) que proyecta características concatenadas de 13 capas del decodificador de Qwen3-VL-8B-Instruct (dimensiones 0, 3, 6, …, 33, 35) desde 53.248 dimensiones hasta 4.608. El backbone no emplea cross-attention y su AdaLN recibe únicamente la variable temporal $t$, lo que convierte al adaptador en el único canal de entrada de la información textual. El entrenamiento original del modelo base no se detalla en la información disponible.

La intervención de abliteración aplica una proyección de anulación $W^* = W(I - vv^\top)$ sobre el adaptador, calculada en BF16 y posteriormente integrada en el pipeline. El autor reporta una distorsión de Frobenius del 0,4295% en el adaptador, distorsión nula en los bloques del backbone, una tasa de borrado de rechazo (RER) del 99,23% en anatomía médica y del 90,21% en combate, y una restauración de varianza espacial del 194,3% en la categoría de combate. También describe una "ley de proporcionalidad" según la cual la cirugía sobre la columna del bloque 35 es 51,65 veces más intensa que sobre la del bloque 0, lo que según el autor preserva la sintaxis léxica y el renderizado tipográfico.

## Capacidades

- Generación de imágenes texto-a-imagen mediante difusión con flow matching.
- Renderizado de texto en imágenes (tipografía y glifos), con fidelidad reportada superior al 98,1% en prompts benignos.
- Condicionamiento textual a través de un codificador multimodal Qwen3-VL-8B-Instruct.
- Supresión de rechazos ante prompts de anatomía médica y contenido de combate, según las métricas del autor (RER 99,23% y 90,21% respectivamente).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros modos especiales.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Investigación en interpretabilidad mecanicista: el modelo permite estudiar cómo se distribuye la señal de rechazo entre las capas del codificador de texto y el adaptador de condicionamiento, sirviendo como caso de estudio de las cuatro localizaciones de rechazo descritas por el autor.
- Auditoría de seguridad de modelos generativos: permite evaluar hasta qué punto la eliminación de un vector de rechazo en un único punto (el adaptador) afecta al comportamiento global del sistema, útil para diseñar defensas más robustas.
- Estudio de la ley de proporcionalidad: investigadores pueden reproducir la relación 51,65× entre la cirugía en la columna final y la inicial del adaptador y validar si la preservación de sintaxis léxica se mantiene en otros prompts.
- Generación de imágenes para investigación en dominios restringidos: el modelo permite explorar la generación de contenido anatómico o de combate en entornos controlados de investigación, siempre que se cumplan las obligaciones legales y éticas aplicables.
- Análisis de fidelidad semántica tras ablación: comparar la similitud coseno (0,9811 reportada) entre las salidas del modelo original y el abliterado para cuantificar el daño colateral de la intervención.
- Docencia y divulgación sobre seguridad en IA: sirve como ejemplo práctico de cómo un único módulo lineal puede concentrar la mayor parte de la señal de rechazo en un pipeline multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor reporta exclusivamente métricas internas de la intervención:

| Metrica | Valor medido | Umbral declarado |
|---|---|---|
| Distorsión de pesos del adaptador | 0,4295% | < 1,0% |
| Distorsión de bloques del backbone | 0,0 | = 0,0 |
| Fidelidad semántica benigna (coseno medio) | 0,9811 | > 0,95 |
| Tasa de borrado de rechazo (anatomía médica) | 99,23% | > 85,0% |
| Tasa de borrado de rechazo (combate) | 90,21% | > 85,0% |
| Restauración de varianza espacial (combate) | +194,3% | > 0% |
| Fuga numérica BF16 | 0,0188 | < 0,02 |

## Requisitos de hardware

- El repositorio contiene solo el adaptador modificado (0,5 GB); es necesario descargar el modelo base `ideogram-ai/ideogram-4-fp8` (9,28B parámetros) para la inferencia.
- VRAM estimada para el modelo base en FP8: no disponible en la información proporcionada; por el tamaño de parámetros, se requiere una GPU de gama alta o superior.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el tamaño del modelo base sugiere que no cabe en GPUs de consumo de gama media.
- Opciones de despliegue: el autor documenta integración vía `diffusers` (`DiffusionPipeline`) cargando el pipeline oficial y copiando los pesos del adaptador en `pipeline.transformer.llm_cond_proj`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de generación de imágenes ni con otras variantes abliteradas de Ideogram 4.

## Limitaciones y advertencias

- El modelo está diseñado explícitamente para eludir mecanismos de rechazo en categorías como anatomía médica y contenido de combate; su uso puede entrar en conflicto con las políticas de uso de Ideogram AI y con la legislación aplicable en materia de contenido.
- La licencia Apache 2.0 se declara sobre el repositorio del adaptador, pero el modelo base `ideogram-ai/ideogram-4-fp8` puede estar sujeto a condiciones adicionales que deben verificarse antes de cualquier uso comercial.
- Solo soporta inglés; no se documenta comportamiento en otros idiomas.
- No se han publicado evaluaciones independientes de las métricas del autor; todas las cifras provienen de la model card y no han sido verificadas externamente.
- Riesgo de alucinación visual y de degradación de la fidelidad en prompts fuera del conjunto evaluado por el autor.
- El repositorio no incluye el modelo completo, solo el adaptador; un uso incorrecto de la integración puede producir errores silenciosos.
- El autor menciona que el filtro externo `safety.py` (Hive Moderation API) se omite cuando no se configuran claves de API, lo que implica que el modelo no incorpora filtrado de seguridad propio.
- No hay información sobre sesgos demográficos, culturales o de representación en las imágenes generadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Umranz/Ideogram-4-FP8-Ablated
- Modelo base: https://huggingface.co/ideogram-ai/ideogram-4-fp8
- Repositorio de investigación: https://github.com/umran666/Diffusion_Ablate_Research
