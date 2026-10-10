# StandardThinking/StandardOne-8B-SH

## Resumen

Standard One 8B SH es un modelo de decisión (decision model) desarrollado por StandardThinking. No es un modelo generativo: lee un escenario una sola vez y puntúa simultáneamente todas las opciones de todas las preguntas de una petición en un único forward pass, devolviendo distribuciones de probabilidad calibradas. Se construye sobre el backbone Standard One 8B v2.2 (arquitectura mistral3, que combina Ministral 3 8B de texto con la torre de visión Pixtral) y añade una cabeza de esquema conjunta (joint schema head, SH) de 70,6 M de parámetros en float32 que atiende a los estados ocultos de la capa final y de la capa 25.

El problema que resuelve es el de la clasificación y decisión con alfabetos de etiquetas grandes. El enfoque previo de Standard One leía una letra de respuesta por opción, de modo que cada pregunta requería su propia pasada sobre el escenario y el número de opciones quedaba limitado por el alfabeto de etiquetas. La cabeza de esquema coloca todas las preguntas y opciones en un grafo conjunto y devuelve la distribución de cada pregunta a la vez, lo que permite manejar entre 2 y 255 opciones por pregunta y varias preguntas por escenario compartiendo una única pasada.

La versión v3, publicada el 11 de octubre de 2026, es la que se distribuye en este repositorio (8.918.026.240 parámetros totales, 37,3 GB de repositorio, licencia Apache-2.0, contexto de 32.768 tokens). Frente a la v2 mejora el nivel hard de JevBench de 63,96 a 74,77 y las decisiones enterradas en documentos largos de 84,67 a 87,33, a costa de retroceder en algunos conjuntos retenidos. El modelo solo declara soporte de inglés y está pensado para servirse a través del contrato `POST /v1/systemone`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mistral3 (Ministral 3 8B de texto + torre de vision Pixtral) con joint schema head |
| Parametros totales | 8.918.026.240 (~8,9 B); la cabeza suma 70,6 M en float32 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens por peticion |
| Tipos de cuantizacion | Este repositorio sirve pesos safetensors sin cuantizar; existen variantes FP8 y GGUF, ambas todavia en v2 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (backbone + `head/` en float32) |
| Tipos de pregunta | `choice` (2-255 opciones), `noul` (si/no), `score` (escala ordinal) |
| Modelo base | StandardThinking/StandardOne-8B (v2.2) |
| Version del modelo | v3 (pesos actualizados el 2026-10-11); v2 y v1 siguen disponibles |
| Tamano del repositorio | 37,3 GB |

## Arquitectura y entrenamiento

El backbone es Standard One 8B v2.2, basado en mistral3: Ministral 3 8B para texto más la torre de visión Pixtral (el tag `image-text-to-text` aparece en el repositorio, aunque la model card no documenta tareas de visión en esta ficha). Sobre ese backbone se monta una cabeza de esquema conjunta de 70,6 M de parámetros en float32, almacenada en `head/`, que lee los estados ocultos de la capa final y de la capa 25. En lugar de generar texto, la cabeza construye un grafo conjunto con todas las preguntas y opciones de la petición y emite una distribución calibrada por pregunta. El modelo se entrena para la cabeza y después se fusiona (merged); la v1 se publicó como adaptador LoRA, la v2 como pesos fusionados y la v3 es la release actual.

La v3 se afina sobre aproximadamente 2.200 nuevos ítems de decisión redactados en las familias donde la v2 era más débil: políticas largas con excepciones y anulaciones, compensaciones multicriterio, evaluación de una respuesta contra una rúbrica y razonamiento sobre fechas y números. Los ítems fueron generados por modelos de lenguaje grandes y cada respuesta de referencia fue verificada por un modelo independiente que respondía sin verla, recalculándose los casos de desacuerdo; se eliminaron los ítems que compartían texto con el conjunto público de JevBench o con los conjuntos de evaluación propios, y no se usó ningún ítem de JevBench. Estos ítems se entrenan con objetivos suavizados (0,8 sobre la opción correcta) para evitar que la cabeza se vuelva demasiado confiada en tareas que no siempre puede resolver. Una pasada final corta sobre política, documentos largos y tareas multi-paso evita el retroceso en esas habilidades.

Una innovación destacable es que el modelo es decode-free: no hay decodificación autorregresiva, lo que reduce la latencia a una sola pasada por petición. La calibración se reporta explícitamente: en el nivel hard de JevBench la confianza media es de 76,8 para un 74,8 de acierto, con un expected calibration error de 0,045 (frente a 0,097 en v2).

## Capacidades

- Puntuación de decisiones tipadas: devuelve distribuciones calibradas sobre preguntas de tipo `choice` (de 2 a 255 opciones), `noul` (sí/no) y `score` (escala ordinal).
- Clasificación de intenciones con alfabetos grandes: los resultados reportados cubren CLINC150, BANKING77 y MASSIVE con entre 27 y 255 etiquetas.
- Procesamiento de múltiples preguntas por escenario en una sola pasada sobre el escenario.
- Localización de decisiones enterradas en documentos largos, hasta 32.768 tokens de contexto.
- Juicio de respuestas contra una rúbrica (policy-judgement repair) y razonamiento sobre políticas largas con excepciones.
- Razonamiento sobre fechas y números.
- Evaluación de posiciones de juego (dots and boxes, snake, 2048, tetris), según los benchmarks publicados.
- Razonamiento de sentido común tipo WinoGrande.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning generativo: no disponible; el modelo no genera texto.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking explícito, audio o visión como tarea documentada: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: con 255 etiquetas de intención el modelo alcanza un 97,32 % (CLINC150, 1.100 enunciados) y un 92,48 % en el rango de 27 a 151 opciones sobre 18.000 ítems, por lo que puede sustituir a clasificadores dedicados en un router de diálogo sin segmentar el alfabeto de etiquetas.
- Clasificación de tickets y correo entrante en atención al cliente: BANKING77 y MASSIVE forman parte de la evaluación reportada, lo que permite mapear cada mensaje a una cola o categoría con una sola pasada y varias preguntas por petición.
- Cumplimiento normativo sobre documentos largos: la detección de decisiones ocultas en documentos largos sube al 87,33 % en la suite de 150 ítems, lo que permite evaluar contratos, políticas internas o pliegos de hasta 32.768 tokens contra un conjunto de reglas.
- Evaluación automática de respuestas con rúbrica: la tarea de «policy-judgement repair» (1.200 ítems, 72,50 %) permite puntuar la respuesta de otro modelo o de un operador frente a criterios explícitos, devolviendo una distribución en lugar de una etiqueta dura.
- Encuestas y escalas ordinales: el tipo de pregunta `score` admite escalas ordinales, útil para convertir respuestas abiertas de NPS, satisfacción o calidad percibida en puntuaciones calibradas.
- Moderación y decisiones binarias: el tipo `noul` (sí/no) cubre casos de aprobación/rechazo de contenido, concesión de crédito o validación de publicaciones con un único forward pass.
- Compensaciones multicriterio en sistemas de recomendación o pricing: la v3 se entrenó específicamente en trade-offs multicriterio, de modo que puede ordenar opciones según varias dimensiones ponderadas dentro de una misma petición.
- Evaluación de posiciones en juegos y entornos de simulación: los resultados en dots and boxes (49,05), snake (68,00) y tetris (63,81) lo sitúan como evaluador de estados en agentes de búsqueda, sin generar jugadas en lenguaje natural.

## Benchmarks y rendimiento

Datos de la model card, en porcentaje de acierto y sobre ítems idénticos puntuados del mismo modo:

| Benchmark | Standard One 8B v2.2 | SH v2 | SH v3 (esta release) |
|---|---:|---:|---:|
| JevBench public, nivel hard (111 items) | 56,76 | 63,96 | 74,77 |
| JevBench public, nivel original (72 items) | 98,61 | 98,61 | 95,83 |
| JevBench public, nivel easy (48 items) | 100,00 | 100,00 | 100,00 |
| Intent labels con 27-151 opciones (CLINC150, BANKING77, MASSIVE; 18.000 items) | 82,67 | 92,50 | 92,48 |
| Intent labels con hasta 26 opciones (750 items) | 88,13 | 95,20 | 95,47 |
| Intent labels con 255 opciones (CLINC150, 1.100 enunciados) | 85,34 | 97,43 | 97,32 |
| Decision oculta en documento largo (150 items) | 40,00 | 84,67 | 87,33 |
| WinoGrande (dev, 2.010 items) | 87,86 | 95,07 | 94,98 |
| Policy-judgement repair (1.200 items) | 60,58 | 72,92 | 72,50 |
| Game positions: dots and boxes / snake / 2048 / tetris | 38,37 / 58,63 / no consta / 54,86 | 50,42 / 67,59 / no consta / 65,90 | 49,05 / 68,00 / no consta / 63,81 |
| Held-out decision suite (600 items) | 82,50 | 90,67 | 87,67 |
| Held-out realistic decision suite (600 items) | 91,50 | 90,83 | 89,67 |
| Held-out hard decision suite (600 items) | 53,50 | 46,00 | 41,17 |

Notas de medición aportadas por el autor: la columna v3 se midió con el motor Standard One, que coincide con el servidor de referencia de `code/` en el 99,58 % de las 1.431 preguntas comprobadas (las 231 respuestas públicas de JevBench son idénticas); el resto de columnas se midieron con el servidor de referencia. La v2 obtuvo 48,68 en el Decision Index 0.2.1 (etiqueta `v2`); el valor para la v3 está pendiente de medición.

Calibración reportada en la v3: confianza media de 76,8 para un acierto de 74,8 en el nivel hard de JevBench, con un expected calibration error de 0,045 (0,097 en la v2).

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo aritmético a partir de los 8.918 M de parámetros; la model card no publica requisitos de hardware): aproximadamente 17,8 GB en bf16/fp16 y 8,9 GB en fp8. La cabeza en float32 añade unos 0,28 GB. Repositorio completo: 37,3 GB.
- Formato cuantizado disponible: existe una variante GGUF de este modelo (todavía en v2, no en v3), lo que en principio permite despliegue en llama.cpp u Ollama con cuantizaciones de 4 bits del orden de 5-6 GB, aunque no hay cifras oficiales de VRAM para esa variante.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamaño, un modelo de 8,9 B en bf16 requiere memorias de 24 GB o superiores (RTX 3090/4090, L4, A10G, A100 40/80 GB, H100).
- ¿Cabe en GPU de consumo? En bf16 cabe en RTX 3090/4090 de 24 GB; en las variantes cuantizadas FP8 o GGUF podría caber en GPUs de 8-12 GB, pero no se publican requisitos oficiales.
- Opciones de despliegue: servidor de referencia incluido en `code/` (requiere torch, transformers y safetensors, con `code/render.py` y la variable `SH_SYSTEM_PROMPT=none` por defecto), más el motor propietario Standard One y el contrato `POST /v1/systemone`. También hay variantes FP8 y GGUF publicadas. Compatibilidad con vLLM o TGI: no disponible.
- Latencia y throughput: no disponible en la informacion proporcionada. El diseño decode-free implica una única pasada por petición con todas las preguntas y opciones, frente a una pasada por pregunta en el enfoque anterior.

## Comparativa con modelos similares

No se han publicado en la informacion disponible datos de modelos de terceros comparables en la categoría de modelos de decisión con cabeza de esquema. La comparación posible es con las propias variantes de la familia Standard One:

| Modelo | Parametros | Contexto | JevBench hard | Documento largo | Licencia | Disponibilidad |
|---|---:|---:|---:|---:|---|---|
| StandardOne-8B-SH (v3, este) | 8,9 B (+70,6 M de cabeza) | 32.768 | 74,77 | 87,33 | Apache-2.0 | Pesos safetensors en HF |
| StandardOne-8B-SH (v2) | 8,9 B (+70,6 M de cabeza) | 32.768 | 63,96 | 84,67 | Apache-2.0 | Etiqueta `v2`; tambien en FP8 y GGUF |
| StandardOne-8B v2.2 (sin cabeza) | 8,9 B | 32.768 | 56,76 | 40,00 | Apache-2.0 | Modelo base en HF |
| StandardOne-3B-SH | no disponible | no disponible | no disponible | no disponible | no disponible | Version reducida en HF |

Comparativa con alternativas externas de la misma categoría: no disponible.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve distribuciones sobre opciones. No puede usarse como chatbot ni como modelo instruct al uso.
- Idiomas: solo inglés declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Retrocesos de la v3 frente a la v2: la suite retenida de decisiones baja 3,0 puntos (87,67 frente a 90,67), la suite retenida difícil 4,8 puntos (41,17 frente a 46,00) y el nivel original de JevBench dos ítems (95,83 frente a 98,61). El propio autor recomienda mantener la v2 si esos conjuntos son prioritarios.
- Rendimiento bajo en decisiones difíciles retenidas: 41,17 % en la suite difícil de 600 ítems, lo que indica que las tareas de decisión complejas fuera de la distribución de entrenamiento siguen siendo un punto débil.
- Riesgo de sobreconfianza mitigado pero no eliminado: los objetivos se suavizaron a 0,8 sobre la opción correcta y el ECE es de 0,045, pero la confianza no es una garantía de corrección en todas las tareas.
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de asignación errónea de probabilidad alta a opciones incorrectas, especialmente en el nivel difícil.
- Formato de prompt estricto: la plantilla de chat usa un mensaje de sistema vacío por defecto y el servidor de referencia renderiza las peticiones sin mensaje de sistema (`SH_SYSTEM_PROMPT=none`). Añadir el prompt de sistema por defecto de Ministral cambia los estados ocultos que lee la cabeza y degrada el resultado.
- Las variantes FP8 y GGUF publicadas contienen todavía la v2, no la v3; quien necesite cuantización no dispone de la versión más reciente.
- Licencia Apache-2.0: permite uso comercial y modificación con las obligaciones habituales de atribución y conservación de avisos. No se documentan restricciones adicionales.
- Adopción mínima: 0 descargas y 0 likes en el momento del análisis, sin ecosistema de terceros ni confirmación independiente de los resultados.
- No se publican requisitos de hardware, latencia ni throughput oficiales para producción.
- Los benchmarks provienen del propio autor del modelo; no hay verificación independiente en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StandardThinking/StandardOne-8B-SH
- Variante FP8: https://huggingface.co/StandardThinking/StandardOne-8B-SH-FP8
- Variante GGUF: https://huggingface.co/StandardThinking/StandardOne-8B-SH-GGUF
- Modelo reducido: https://huggingface.co/StandardThinking/StandardOne-3B-SH
- Modelo base: https://huggingface.co/StandardThinking/StandardOne-8B
- Sitio del proveedor: https://standardthinking.ai/
- Documentación de la API: https://standardthinking.ai/api/
