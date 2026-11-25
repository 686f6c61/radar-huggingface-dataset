# vanch007/Inkling-2-Mini-Uncensored-oQ8e-mtp

## Resumen

Inkling-2-Mini-Uncensored-oQ8e-mtp es una conversión cuantizada del fine-tune comunitario OpenUncensored/Inkling-2-Mini-Uncensored, que a su vez deriva del modelo base Inkling 2 Mini publicado por Thinking Machines Lab. El autor de esta conversión es el usuario vanch007, que la distribuye bajo licencia Apache 2.0 y la orienta específicamente al ecosistema MLX de Apple mediante la herramienta oMLX 0.8.2. El modelo es multimodal de tipo image-text-to-text, con 26.388.646.400 parámetros totales según los pesos en safetensors, lo que lo sitúa en la franja de los 26B.

El interés de esta ficha radica en que combina tres elementos poco habituales: una variante "uncensored" del modelo base, una cuantización de 8 bits con calibración de activaciones (preset oQ8e) y la preservación del borrador DSpark para decodificación especulativa (MTP, multi-token prediction) dentro del archivo mtp.safetensors. El repositorio ocupa 18,8 GB y los archivos declarados suman unos 17,49 GiB.

Es relevante ahora porque permite ejecutar un modelo multimodal de 26B en hardware Apple Silicon con un formato nativo MLX, algo que con pesos en bf16 resultaría mucho más costoso en memoria. No obstante, la información pública disponible es muy escasa: no hay datos de contexto, idiomas, benchmarks ni detalles del dataset de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta de librería `inkling2_loop`; transformer multimodal image-text-to-text, detalles no publicados) |
| Parametros totales | 26.388.646.400 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (preset oQ8e de oMLX 0.8.2, calibración de activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), con borrador DSpark en `mtp.safetensors` |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `inkling2_loop` asociada a la implementación en oMLX y de su naturaleza multimodal (pipeline image-text-to-text). El modelo base, Inkling 2 Mini, fue publicado por Thinking Machines Lab; el fine-tune "uncensored" lo publicó OpenUncensored, y esta conversión aplica sobre él una cuantización de 8 bits con el preset oQ8e de oMLX 0.8.2.

El detalle técnico más relevante es la preservación del borrador DSpark incluido en el checkpoint original, empaquetado en `mtp.safetensors`, que habilita decodificación especulativa mediante Lightning MTP en oMLX. Según la model card, la calibración de activaciones de oQ8e se ejecutó sobre el checkpoint Uncensored y oMLX 0.8.2 omite el paso de refinamiento Hessiano para `inkling2_loop`. No se dispone de datos sobre volumen de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Procesamiento de imágenes y texto combinados (image-text-to-text), con configuración de visión preservada en la conversión.
- Decodificación especulativa mediante el borrador DSpark y Lightning MTP, activable en los ajustes del modelo en oMLX.
- Comportamiento "uncensored" heredado del fine-tune de OpenUncensored, orientado a reducir rechazos en respuestas.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización de 8 bits permiten cargar un modelo de 26B en equipos con memoria unificada amplia; el autor verificó la inferencia de texto y la carga del borrador en un Apple M3 Max.
- Asistente conversacional de escritorio: el pipeline conversacional y la ventana de contexto (no publicada) permiten mantener diálogos multi-turno en aplicaciones locales sin depender de la nube.
- Análisis de imágenes con descripción en lenguaje natural: al ser image-text-to-text, sirve para tareas de captioning, extracción de información de capturas o documentos escaneados, siempre que se valide su calidad real.
- Prototipado de investigación sobre modelos sin censura: útil para estudiar comportamientos de rechazo, sesgos y alineación en entornos controlados, con la advertencia de que requiere supervisión humana.
- Aceleración de la generación con MTP: en escenarios de baja latencia (chat interactivo), activar Lightning MTP con el borrador DSpark puede reducir el coste por token frente a la decodificación autoregresiva estándar.
- Evaluación comparativa de cuantizaciones: el preset oQ8e con calibración de activaciones permite medir la pérdida de calidad frente a los pesos originales en bf16, un caso típico de pipelines de investigación en eficiencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: los archivos suman aproximadamente 17,49 GiB (18,8 GB de repositorio), por lo que se necesita al menos esa cantidad libre más el espacio de trabajo del runtime (KV cache, buffers de activaciones y el borrador MTP).
- GPU recomendadas: el formato es MLX, por lo que el objetivo son chips Apple (M1/M2/M3/M4, con especial idoneidad para variantes Max y Ultra por memoria unificada). El autor verificó la carga en un Apple M3 Max.
- GPU NVIDIA: no es el objetivo de esta conversión; para CUDA habría que recurrir a los pesos originales en otro formato (no disponible en esta información).
- Despliegue: oMLX 0.8.2 con soporte de Inkling 2 Mini; activar Lightning MTP en los ajustes del modelo para cargar el borrador DSpark. Otros runtimes (vLLM, llama.cpp, Ollama, TGI) no están soportados para este formato MLX.
- Latencia y throughput: no disponibles; dependen del chip, de la memoria y de si se activa la decodificación especulativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Uncensored-oQ8e-mtp (este) | 26,4B | no disponible | MLX safetensors 8-bit | Apache 2.0 | Cuantizado para Apple Silicon, con borrador MTP |
| OpenUncensored/Inkling-2-Mini-Uncensored | no disponible | no disponible | safetensors (original) | no disponible | Fine-tune upstream sin cuantizar |
| Thinking Machines Lab Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | Modelo base original |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a linaje, formato y licencia.

## Limitaciones y advertencias

- La información pública es mínima: no hay contexto, idiomas, benchmarks ni detalles de entrenamiento, lo que dificulta evaluar su idoneidad en producción.
- El carácter "uncensored" implica un filtrado de seguridad reducido; puede generar contenido sensible, ofensivo o inseguro y requiere moderación externa y supervisión humana.
- Riesgo de alucinación no cuantificado; al no haber benchmarks, no puede descartarse un deterioro adicional por la cuantización de 8 bits.
- La cuantización oQ8e introduce una pérdida de precisión respecto a los pesos originales; conviene validar tareas críticas contra el checkpoint sin cuantizar.
- Dependencia de oMLX 0.8.2 y de hardware Apple; no es portable a CUDA sin reconversión.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el fine-tune upstream pueden imponer condiciones adicionales que deben revisarse antes de desplegar.
- Sin datos sobre sesgos demográficos, lingüísticos o culturales.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vanch007/Inkling-2-Mini-Uncensored-oQ8e-mtp
- Modelo base del fine-tune: https://huggingface.co/OpenUncensored/Inkling-2-Mini-Uncensored
- Modelo original: https://huggingface.co/thinkingmachines/Inkling-2-Mini
