# sthanika-ai/Sieve-31B-v3

## Resumen

Sieve-31B-v3 es un modelo de decisión desarrollado por sthanika-ai: recibe un estado (texto libre o JSON) y una o varias preguntas tipadas, y devuelve una probabilidad calibrada para cada opción de cada pregunta. No genera texto en ningún caso; la respuesta se obtiene leyendo los logits de su propia capa de salida en las etiquetas de opción (A, B, …, hasta 255) sobre un slot `Answer: (`. Es un fine-tune completo de google/gemma-4-31B-it (revisión `842da37`), con 31.273.086.512 parámetros totales, de los cuales 29,29 mil millones corresponden a las proyecciones lineales de las 60 capas del decoder que se han reentrenado.

La particularidad técnica es la atención: las 10 capas de atención global del backbone se han hecho bidireccionales, mientras que las 50 capas de ventana deslizante (1.024 tokens) siguen siendo causales. Como el modelo no genera, cada token puede leer el estado a la luz de la pregunta y sus opciones. Todas las preguntas de una misma petición comparten una única lectura del estado, y el runtime reutiliza las claves y valores del bloque compartido cuando este supera los 2.048 tokens.

El modelo es relevante para quien necesite señales de decisión con probabilidades utilizables directamente en producción (umbrales, costes asimétricos, muestreo activo) sin pasar por un LLM generativo y su parseo posterior. Declara una puntuación de 71,68 en el Decision Index 0.3 sobre 140.178 peticiones puntuadas, un dato autodeclarado por el autor y todavía no verificado en la tabla pública. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Gemma 4, 60 capas) con atención híbrida: 10 capas de atención global y 50 capas de ventana deslizante de 1.024 tokens; fine-tune completo del backbone |
| Parametros totales | 31.273.086.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Parametros entrenados | 29,29 mil millones (todas las proyecciones lineales de las 60 capas); embeddings de tokens (atados a la capa de salida) y normas provienen del backbone |
| Longitud de contexto | No declarada por el autor; entrenado con prompts de hasta 16.384 tokens; la mayor petición pública de la suite consumió 53.703 tokens |
| Tipos de cuantizacion | No disponible (solo se publican pesos en bf16; no se listan GGUF, AWQ, GPTQ ni fp8) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (13 shards en bf16) + `head.pt` (readout, regla de atención, política de serving y temperaturas) |
| Tipos de pregunta | `choice` (etiquetas del llamante, hasta 255 opciones), `noul` (sí/no) y `score` (niveles ordenados); entrenado en `choice` y `noul` |
| Salida | Probabilidad por opción; sin generación de texto |
| Temperaturas | T global = 1,27 y 22 temperaturas por categoría de pregunta (rango 0,955–1,380) |
| Composición de pesos | Media ponderada del backbone (0,3) y del modelo afinado (0,7) |
| Pipeline declarado | `text-classification` |

## Arquitectura y entrenamiento

El backbone es google/gemma-4-31B-it, un transformer decoder de 60 capas que intercala 10 capas de atención global con 50 capas de ventana deslizante de 1.024 tokens. El fine-tune es completo sobre las proyecciones lineales (29,29B parámetros), manteniendo intactos los embeddings de tokens —atados a la capa de salida— y todas las normas. Los pesos publicados no son el checkpoint afinado puro, sino una media ponderada de backbone (0,3) y modelo afinado (0,7). El prompt sigue la plantilla de chat de Gemma con el modo thinking desactivado: un turno de sistema, un turno de usuario con la lista de preguntas y el estado, y un bloque por pregunta con sus opciones etiquetadas, terminando en el slot `Answer: (`.

La innovación principal es la atención bidireccional selectiva. En las capas globales, el bloque compartido (sistema, preguntas y estado) atiende solo a sí mismo, y el bloque de cada pregunta atiende al compartido y a sí mismo, de modo que las preguntas nunca ven las opciones de las otras: el estado se lee en función de cada pregunta sin contaminación cruzada. Las capas de ventana deslizante permanecen causales como en el modelo base. El modelo se entrenó con esta misma regla de atención y `head.pt` la registra para que el runtime la aplique al cargar. Para eliminar el sesgo de posición de etiqueta, cada pregunta `choice` reordenable se lee dos veces —con las opciones tal cual y rotadas a la mitad— y se promedian los dos vectores de log-probabilidad; las preguntas marcadas con `"permute": false` se leen una sola vez. El modelo nunca trunca, descarta ni reordena opciones, no ajusta prompts por benchmark ni ve etiquetas de referencia. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Decisión tipada con probabilidades calibradas: devuelve una distribución sobre las opciones de cada pregunta, no texto.
- Preguntas `choice` con hasta 255 opciones etiquetadas por el llamante, opcionalmente descritas con criterios.
- Preguntas `noul` (sí/no) que devuelven P(yes) directamente.
- Preguntas `score` sobre niveles ordenados, con una probabilidad por nivel (el autor indica que el entrenamiento se hizo con `choice` y `noul`).
- Lectura de estado heterogéneo: texto libre o JSON en la misma petición.
- Múltiples preguntas por petición compartiendo una sola lectura del estado, con reutilización de claves y valores del bloque compartido cuando este alcanza 2.048 tokens o más.
- Mitigación del sesgo de orden de opciones mediante doble lectura y promedio de log-probabilidades.
- Calibración explícita: 22 temperaturas por categoría de pregunta más una global, almacenadas en `head.pt`.
- Capacidades multimodales: la etiqueta `image-text-to-text` aparece en el repositorio por herencia del backbone, pero la información disponible no documenta el uso de imágenes en el pipeline de decisión.
- Sin soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso generativo ni modo thinking (la plantilla se usa con thinking desactivado).

## Casos de uso

- Triaje de tickets de soporte: una única lectura del cuerpo del ticket permite resolver a la vez preguntas como `department` (choice entre billing, technical, …) y `churn_risk` (noul), tal y como muestra el ejemplo de la model card. La probabilidad por opción permite fijar umbrales de derivación humana.
- Enrutado de incidencias en producción: clasificar errores y avisos en categorías operativas con probabilidad asociada, para decidir si se abre ticket, se escala o se descarta automáticamente según coste asimétrico de error.
- Detección de intención de cancelación o riesgo de churn: la pregunta `noul` sobre un estado conversacional devuelve P(yes) directamente utilizable como score de riesgo, sin parseo de texto generado.
- Anotación semi-automática de datasets: las probabilidades por opción permiten muestreo por incertidumbre (active learning), priorizando las peticiones con distribución más plana para revisión humana.
- Verificación de cumplimiento documental: preguntas `noul` encadenadas sobre contratos o políticas ("¿aparece cláusula de renovación automática?") reutilizando el bloque compartido del documento entre todas las preguntas, lo que reduce el coste de atención cuando el texto supera los 2.048 tokens.
- Clasificación de respuestas abiertas de encuestas: extraer señales tipadas (satisfacción por nivel con `score`, motivos con `choice`) de campos de texto libre en pipelines de analítica.
- Reranking y selección entre candidatos: con hasta 255 opciones, se puede puntuar una lista de candidatos (categorías, colas, productos) en una sola pasada y ordenar por probabilidad.
- Moderación asistida: clasificar contenido en niveles de gravedad con `score`, usando la probabilidad calibrada para decidir entre acción automática y revisión.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| Decision Index 0.3 (suite pública) | decision_index | 71,68 | Corregido por azar; 140.178 peticiones puntuadas; el índice promedia 37 benchmarks; autodeclarado por el autor y no verificado en la tabla pública |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible. Tampoco se han publicado métricas de calibración numéricas (ECE) pese a que el modelo declara `expected_calibration_error` entre sus métricas.

## Requisitos de hardware

- Pesos en bf16: 58,3 GiB. El pico de memoria asignada en la mayor petición del Decision Index (53.703 tokens) es de 81,4 GiB.
- GPU recomendadas: una GPU de 96 GB ejecuta todas las peticiones públicas de la suite (H100 96 GB, H200, B200). Una A100 de 80 GB no cubre el pico de 81,4 GiB en la petición más grande.
- GPU de consumo: no cabe. Ni una RTX 4090 (24 GB) ni una RTX 5090 (32 GB) admiten los pesos en bf16; no se documentan cuantizaciones que redujeran la huella.
- La memoria escala con la longitud del prompt: la reutilización de claves y valores del bloque compartido (a partir de 2.048 tokens) reduce el coste cuando hay varias preguntas sobre el mismo estado.
- Opciones de despliegue: paquete `sieve-decisions[cuda,serve]` instalable desde `git+https://github.com/sthanika-ai/Sieve`, con `load_sieve()` y `decide()`; los pesos también son un checkpoint de Gemma 4 en safetensors cargable con transformers, pero la atención bidireccional y las temperaturas requieren aplicar la regla registrada en `head.pt`.
- vLLM, llama.cpp, Ollama y TGI: no documentados en la información disponible. La atención bidireccional en las capas globales no es compatible sin más con los kernels causales estándar de esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sieve-31B-v3 | 31,27B (29,29B reentrenados) | Sin límite declarado; entrenado hasta 16.384 tokens | Probabilidad por opción de preguntas tipadas; sin generación | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| google/gemma-4-31B-it | ~31B | No disponible en la información | Texto generado | No disponible en la información | HuggingFace (modelo base) |
| Otros modelos de decisión calibrada de tamaño comparable | No disponible | No disponible | No disponible | No disponible | No se han identificado en la información proporcionada |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento. La colección Sieve de sthanika-ai incluye otras variantes de la familia, pero sus especificaciones no están disponibles en esta información.

## Limitaciones y advertencias

- Solo inglés: no hay evidencia de soporte multilingüe y el modelo declara `en` como único idioma.
- No genera texto: no sirve para tareas de redacción, resumen, diálogo abierto ni razonamiento en lenguaje natural con salida libre.
- Los tipos de pregunta entrenados son `choice` y `noul`; el tipo `score` está implementado en la interfaz pero no forma parte del entrenamiento declarado, por lo que su calibración es incierta.
- El Decision Index de 71,68 es autodeclarado, corregido por azar y no figura aún en la tabla pública; no hay verificación independiente.
- El repositorio no tiene descargas ni valoraciones, y no se han encontrado evaluaciones de terceros en la información disponible.
- La atención bidireccional es una modificación estructural: cargar los pesos en un runtime que aplique atención causal estándar produce resultados distintos de los reportados. Es necesario usar la regla almacenada en `head.pt`.
- Los pesos publicados son una media ponderada (0,3 backbone / 0,7 afinado), no el checkpoint afinado puro; esto afecta a la reproducibilidad de experimentos de fine-tuning posteriores.
- La longitud de contexto no está declarada: los prompts por encima de 16.384 tokens quedan fuera del régimen de entrenamiento, aunque la suite pública haya servido peticiones de 53.703 tokens.
- La huella de memoria (81,4 GiB de pico) limita el despliegue a GPUs de 96 GB o a configuraciones multi-GPU no documentadas.
- El riesgo de alucinación se manifiesta como sobreconfianza: una probabilidad alta no implica que la opción sea correcta, y no se han publicado métricas de calibración (ECE) que permitan cuantificar la desviación.
- Sesgos: no se documentan análisis de sesgo. El procedimiento de doble lectura con rotación mitiga el sesgo de posición de etiqueta, pero no se reportan mediciones del efecto residual sobre las 22 categorías de pregunta.
- Licencia: el fine-tune declara Apache 2.0, pero el modelo base google/gemma-4-31B-it se distribuye bajo sus propios términos, no disponibles en esta información; conviene verificar la compatibilidad antes de un uso comercial.
- La etiqueta `image-text-to-text` del repositorio sugiere capacidades multimodales heredadas del backbone, pero no hay documentación de entrada de imágenes en el pipeline de decisión: no debe asumirse su funcionamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sthanika-ai/Sieve-31B-v3
- Repositorio de código: https://github.com/sthanika-ai/Sieve
- Colección de la familia Sieve: https://huggingface.co/collections/sthanika-ai/sieve-6abb93a61dd495f69811c586
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
