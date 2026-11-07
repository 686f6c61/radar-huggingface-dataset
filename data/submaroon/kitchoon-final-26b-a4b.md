# SubMaroon/Kitchoon-Final-26B-A4B

## Resumen

Kitchoon-Final-26B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) derivado de la familia Gemma 4, desarrollado por el usuario independiente SubMaroon y publicado en Hugging Face. Con 25.805.933.872 parámetros totales (aproximadamente 26B) y un diseño A4B (4B parámetros activos por token), está especializado en roleplay y narrativa de personajes, incluyendo contenido ERP (roleplay erótico), con un estilo de escritura neutro y orientado al desarrollo de personajes. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado como "uncensored" y "heretic".

La versión Final parte de Kitchoon-V5.1-Clean-26B-A4B-EXP como modelo base y le incorpora un LoRA denominado Anthropos v3, integrado ("baked") con una fuerza de 0.7 en las capas 10 a 29. Este LoRA se entrena mediante divergencia KL hacia una mezcla a nivel de token entre las predicciones de V5.1 y el modelo Gemma 4 preentrenado (antes del instruction tuning), siguiendo la idea del paper BACo (arXiv 2511.05650). El objetivo es recuperar la diversidad léxica del modelo base sin perder el formato y el estilo aprendidos, reduciendo muletillas y aumentando la variación entre respuestas sucesivas.

El modelo es relevante en el nicho de modelos de roleplay sin censura: mantiene el modo de razonamiento ("thinking") del modelo base intacto, conserva el soporte de formato solicitado en las tarjetas de personaje y ofrece una diversidad de muestreo mayor que su predecesor. Su ventana de contexto, idiomas y detalles de despliegue no están documentados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), familia Gemma 4; fine-tune LoRA sobre Kitchoon-V5.1-Clean-26B-A4B-EXP |
| Parametros totales | 25.805.933.872 (~26B) |
| Parametros activos | ~4B (sufijo A4B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamaño del repo: 51.6 GB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE de la familia Gemma 4 con aproximadamente 26B parámetros totales y unos 4B activos por token. Incluye un "vision tower" (torre de visión) que, según la model card, permanece idéntico al del modelo base tras el fine-tune. El modelo Final no modifica el `lm_head`, los expertos MoE, el router ni los embeddings: todos los cambios se concentran en las capas 10 a 29, donde se aplican LoRAs sobre las proyecciones de atención QK (`q_proj` + `k_proj`), OV (`v_proj` + `o_proj`) y el MLP denso (`gate_proj` + `up_proj` + `down_proj`).

El entrenamiento de Anthropos v3 usa rango 32, alpha 64, learning rate 3e-5 con schedule coseno, una época (108 pasos) y pesos de pérdida de 1 (mezcla) / 5 (mantener como V5.1) / 15 (thinking). La mezcla objetivo asigna al modelo base una cuota de 0.7 en palabras de contenido y decisiones de composición (saltos de párrafo, primera palabra de párrafo, apertura de acciones o citas, puntuación), mientras que V5.1 decide en solitario la "gramática" del formato (cierre de asteriscos o comillas, interior de palabras, tokens especiales, fin de respuesta y todo el contenido dentro de `[...]`). Cuando V5.1 es muy confiado y el base discrepa con fuerza, la cuota del base se reduce a la mitad para proteger nombres y hechos de la escena; si la tarjeta impone una regla de formato explícita, la composición queda enteramente en manos de V5.1. El razonamiento nunca se mezcla. Los datos de entrenamiento consisten en contextos de un dataset propio de roleplay (~500 escenas, 416 tarjetas de personaje), 150 escenas del dataset de Kitchoon de Indexnusrefather, un cuarto de escenas con reglas de formato explícitas, 150 respuestas con razonamiento y 200 respuestas generadas por la propia mezcla; todas las respuestas de entrenamiento fueron escritas por V5.1. En validación, la KL respecto a la mezcla bajó de 1.49 a 0.62, y la KL del thinking se mantuvo en ~0.03.

## Capacidades

- Generación de texto narrativo y roleplay multi-turno con estilo de escritura neutro y foco en desarrollo de personajes.
- Roleplay de contenido adulto (ERP) sin censura, etiquetado explícitamente como "uncensored" y "heretic".
- Modo de razonamiento ("thinking") con canales de pensamiento que se abren y cierran de forma consistente, incluso en conversaciones largas.
- Respeto de reglas de formato explícitas en la tarjeta de personaje (prohibición de asteriscos, límite de párrafos, cabecera `[Time | Place]`, ausencia de em dashes).
- Mayor diversidad de muestreo: menor solapamiento léxico entre respuestas sucesivas ("swipes") y menor repetición de frases hechas.
- Capacidad de visión heredada del modelo base (torre de visión idéntica), aunque no se documenta su uso en este fine-tune.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso más allá del thinking de roleplay: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.

## Casos de uso

- Roleplay conversacional en frontends tipo SillyTavern: el modelo está diseñado y etiquetado específicamente para este flujo, con ajustes de muestreo recomendados (temperatura 0.85, Min-P 0.05) y respuestas largas de ~400 palabras que encajan con el formato de tarjetas de personaje.
- Creación de personajes interactivos con reglas de formato estrictas: la mezcla preserva las reglas explícitas de la tarjeta (sin asteriscos, cabeceras de tiempo y lugar, límite de párrafos), lo que permite definir convenciones de salida sin que el modelo las rompa.
- Escritura narrativa asistida y generación de ficción: la reducción de em dashes (~2.7 por 1000 palabras frente a ~7.2 en V5.1) y de frases hechas (~5 frente a ~10 por 1000 palabras en tarjetas nuevas) produce prosa menos formulaica para borradores de relato.
- Exploración de variantes de respuesta ("swipes"): el menor solapamiento entre respuestas (0.024 frente a 0.036) y la menor coincidencia en las tres primeras palabras (11% frente a 14% de pares) facilitan generar alternativas realmente distintas en una misma escena.
- Investigación sobre diversidad y calibración en modelos ajustados: el enfoque BACo con mezcla a nivel de token y entrenamiento por KL es un caso de estudio reproducible para quienes investigan cómo recuperar la distribución del modelo preentrenado sin reentrenar.
- Roleplay adulto en entornos privados: la licencia Apache 2.0 y la ausencia de censura permiten desplegarlo en instalaciones locales para contenido para adultos, siempre con las advertencias legales y de seguridad correspondientes.
- Prototipado de asistentes de personaje con razonamiento: el thinking intacto permite separar el razonamiento interno de la respuesta final en pipelines que necesiten trazabilidad del proceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye métricas internas de comparación con V5.1:

| Metrica (vs. Kitchoon-V5.1-Clean) | Kitchoon-Final |
|---|---|
| Em dashes por 1000 palabras | ~2.7 (frente a ~7.2) |
| Frases hechas por 1000 palabras en tarjetas nuevas | ~5 (frente a ~10) |
| Solapamiento de palabras entre swipes | ~0.024 (frente a ~0.036) |
| Pares de swipes con las mismas tres primeras palabras | 11% (frente a 14%) |
| KL respecto a la mezcla objetivo (held-out) | 0.62 (frente a 1.49) |
| KL del canal de thinking | ~0.03 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, los pesos en safetensors ocupan ~51.6 GB en el repo, lo que exige al menos ~52 GB de VRAM en precisión original (bf16/fp16) para cargar el modelo completo; la cuantización a 8 bits o 4 bits reduciría el requisito, pero no se publican variantes cuantizadas.
- GPU recomendadas: para carga completa en precisión original se necesita una GPU con 80 GB (A100 80GB, H100 80GB) o varias GPUs. No se documenta soporte oficial para GPUs de consumo.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) en precisión original; sería necesario cuantizar, y no hay pesos GGUF publicados en la información disponible.
- Opciones de despliegue: no se especifican en la model card. Al ser un modelo safetensors de arquitectura Gemma 4 MoE, sería compatible con stacks que soporten dicha arquitectura (por ejemplo, vLLM o TGI), pero no hay confirmación oficial en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kitchoon-Final-26B-A4B | ~26B | ~4B | no disponible | Apache 2.0 | Roleplay/ERP sin censura, diversidad léxica vía BACo |
| Kitchoon-V5.1-Clean-26B-A4B-EXP | ~26B | ~4B | no disponible | no disponible | Modelo base del que deriva; mismo dataset y estilo |
| Kitchoon-26B-A4B | ~26B | ~4B | no disponible | no disponible | Predecesor de la serie, basado en Pantheon-Reasoning 1.1 (heretic) con LoRA OV fusionado y lm_head propio |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada; la comparación se limita a linaje, licencia y enfoque.

## Limitaciones y advertencias

- Modelo especializado en roleplay y ERP: su uso fuera de ese dominio no está validado y puede degradar la calidad frente a modelos de propósito general.
- Contenido sin censura ("uncensored", "heretic"): puede generar material adulto, ofensivo o inapropiado; requiere moderación y control de acceso en cualquier despliegue.
- Riesgo de alucinación: como todo modelo generativo, puede inventar hechos, nombres o detalles de la escena; la mezcla con el modelo base reduce pero no elimina este riesgo.
- Idioma: solo inglés documentado; no hay soporte declarado de castellano ni de otros idiomas.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar conversaciones largas con garantías.
- Formato de muestreo: la model card advierte contra truncadores agresivos (Min-P alto, Top-K, XTC), ya que gran parte de la diversidad introducida vive en las opciones menos probables; se recomienda temperatura 0.85, Min-P 0.05, sin repetition penalty ni DRY, y al menos 900 tokens de longitud de respuesta.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado puede estar sujeto a restricciones legales según la jurisdicción (contenido adulto, derechos de imagen, etc.).
- Autor independiente con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria ni garantías de mantenimiento.
- No se publican pesos cuantizados ni instrucciones de despliegue, lo que complica su puesta en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SubMaroon/Kitchoon-Final-26B-A4B
- Modelo base: https://huggingface.co/SubMaroon/Kitchoon-V5.1-Clean-26B-A4B-EXP
- Predecesor de la serie: https://huggingface.co/SubMaroon/Kitchoon-26B-A4B
- Repositorio de archivos: https://huggingface.co/SubMaroon/Kitchoon-26B-A4B/tree/main
- Paper BACo: https://arxiv.org/abs/2511.05650
- Dataset de Kitchoon de Indexnusrefather: https://huggingface.co/Indexnusrefather
- Donaciones del autor (Boosty): https://boosty.to/submaroon/donate
