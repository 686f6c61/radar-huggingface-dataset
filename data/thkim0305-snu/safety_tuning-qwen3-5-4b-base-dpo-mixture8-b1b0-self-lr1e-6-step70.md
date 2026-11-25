# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step70

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step70 es un checkpoint intermedio de ajuste fino por preferencias (DPO) sobre el modelo base Qwen/Qwen3.5-4B-Base, desarrollado por el usuario thkim0305-SNU en el contexto de un trabajo de alineamiento de seguridad. El modelo aplica DPO sigmoide (beta 0.1) sobre pares elegidos/rechazados generados por el propio modelo base y filtrados por un juez binario estricto, con el objetivo de mejorar el comportamiento del modelo en escenarios de seguridad, código y consejo difícil sin degradar su formato conversacional nativo.

El checkpoint corresponde al paso 70 de 186 actualizaciones del optimizador (0.753 de 2 épocas), por lo que se trata de un snapshot de entrenamiento en curso, no de un modelo final. Los pesos se exportan en bf16 como `Qwen3_5ForConditionalGeneration`, con la torre de visión y la cabeza MTP intactas del modelo base; solo se entrenó el modelo de lenguaje. El repositorio ocupa 9,3 GB y contiene 4.659.865.088 parámetros reales según safetensors.

Su relevancia es doble: por un lado, documenta una receta reproducible de safety tuning con DPO sobre una mezcla de ocho fuentes de datos; por otro, al conservar la arquitectura multimodal y el formato de chat del base, puede evaluarse como drop-in del modelo original en pipelines existentes, siempre teniendo en cuenta que es un artefacto intermedio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), clase `Qwen3_5ForConditionalGeneration`; torre de visión y cabeza MTP del base sin entrenar |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de entrenamiento; el contexto nativo del base no se especifica en la información disponible) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatible con `transformers` |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B-Base, un transformer multimodal con torre de visión y cabeza MTP (multi-token prediction), del que solo se ajustó el modelo de lenguaje mediante DPO sigmoide con beta 0.1 sobre la respuesta completa (razonamiento, respuesta y llamadas a herramientas). El entrenamiento se realizó con Slime + Megatron-LM, cómputo en bf16 con estado del optimizador en fp32 y paralelismo tensorial de grado 4 sobre 4 GPU H100 de 80 GB (GPUs 4-7 del nodo keti_h100_0), en la ejecución `dpo-base1-base0-self-1to1-base4b-lr1e6-2ep-keti-h100-0-gpu4567-20261125-v1`.

Los pares de preferencia son auto-generados: el elegido es una trayectoria del propio Qwen3.5-4B-Base que superó un juez binario estricto (puntuación 1) y el rechazado es una trayectoria del mismo prompt que falló (puntuación 0), emparejados uno a uno sin reutilización. El conjunto consta de 5.941 pares procedentes de 4.600 prompts, distribuidos en ocho fuentes: agentalign_benign (652 pares), agentalign_harmful (941), codesafetybench (481), difficult_advice (1.027), magicoder (600), star1_gp3 (432), star_benign_v2 (531) y wildjailbreak_benign (1.277). Se entrenaron 2 épocas en 93 actualizaciones de 64 pares cada una, con tasa de aprendizaje máxima de 1e-6, calentamiento lineal del 10 %, decaimiento coseno hasta 2e-7, Adam con betas [0.9, 0.95], epsilon 1e-8, weight decay 0.0 y recorte de gradiente 1.0. Las trayectorias de más de 32.768 tokens se excluyeron por completo, nunca se truncaron. El prompt del estudiante usa la plantilla de chat nativa del base con system "You are a helpful assistant." y thinking activado, sin Model Spec.

La exportación se hizo desde el checkpoint Megatron `iter_0000069` mediante `safety_tuning.hf_export`, re-fusionando las proyecciones GDN, aplicando el mapeo de nombres de Slime para Qwen3.5 y copiando los pesos de visión y MTP del base con dtypes coincidentes con el índice original.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de chat nativa de Qwen3.5 y modo thinking activable (`enable_thinking=True`).
- Razonamiento explícito: el entrenamiento DPO incluye la traza de razonamiento dentro de la respuesta optimizada, por lo que el formato de pensamiento se conserva.
- Generación de código, reforzada por las fuentes magicoder (600 pares) y codesafetybench (481 pares).
- Capacidades multimodales heredadas del base (image-text-to-text), ya que la torre de visión se mantiene intacta; no obstante, el ajuste DPO solo afectó al modelo de lenguaje.
- Soporte de tool calling / function calling: la respuesta optimizada incluye las llamadas a herramientas, y las fuentes agentalign_benign y agentalign_harmful aportan datos de comportamiento agéntico.
- Comportamiento orientado a seguridad: entrenado con pares de rechazo/aceptación en escenarios dañinos (wildjailbreak_benign, agentalign_harmful) y de consejo difícil (difficult_advice).
- Capacidades multilingües: no documentadas en la información disponible; se heredan las del modelo base sin cuantificar.

## Casos de uso

- Moderación y rechazo seguro en asistentes conversacionales: el DPO sobre wildjailbreak_benign y agentalign_harmful busca que el modelo rechace peticiones dañinas manteniendo respuestas útiles en las benignas, adecuado para un filtro de primera línea en chat de atención al cliente.
- Asistencia en programación con foco en seguridad: el uso conjunto de magicoder y codesafetybench permite generar código funcional y, a la vez, señalar prácticas inseguras; útil en revisión de pull requests o en asistentes de IDE.
- Agentes con tool calling en entornos controlados: los datos agentalign aportan trayectorias con llamadas a herramientas, por lo que el modelo puede encadenar pasos de razonamiento y ejecución en pipelines de automatización internos.
- Consejo en dominios sensibles (salud, finanzas, legal): la fuente difficult_advice entrena respuestas prudentes ante consultas delicadas, aplicable a asistentes que deben derivar a un profesional en lugar de improvisar.
- Evaluación de recetas de alineamiento: al ser un checkpoint intermedio con receta y procedencia documentadas, sirve como punto de comparación en estudios de DPO (paso 70 frente a los pasos 23, 47, 93, 116, 140, 163 y 186).
- Generación multimodal de descripciones: al conservar la torre de visión del base, puede emplearse para image-text-to-text en tareas de captioning o respuesta sobre imágenes, aunque sin garantías de que el DPO haya preservado el rendimiento visual.
- Prototipado de asistentes con razonamiento largo: el contexto de 32.768 tokens y el modo thinking permiten mantener conversaciones con trazas de razonamiento extensas en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 9,3 GB solo para pesos (4,66 mil millones de parámetros a 2 bytes), más overhead de activaciones y caché KV; con contexto de 32.768 tokens la demanda crece de forma apreciable.
- Cuantización: no se publican variantes GGUF, AWQ ni GPTQ; para reducir VRAM habría que convertir los pesos a 8 o 4 bits con herramientas externas, asumiendo posible degradación.
- GPU recomendadas: el entrenamiento se hizo en 4x H100 80 GB con tensor parallel 4, pero la inferencia de un modelo de 4,66 B en bf16 cabe en una sola GPU de 24 GB (RTX 4090, L4, A10G) con contexto moderado; para contexto completo de 32.768 tokens conviene una A100 40/80 GB o H100.
- GPU de consumo: cabe en RTX 4090 (24 GB) y, con cuantización a 4 bits, en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080, siempre que se recorte el contexto.
- Despliegue: `transformers` con `device_map="auto"` (receta oficial de la model card); para serving de alto rendimiento, vLLM o TGI si soportan la arquitectura `qwen3_5`; llama.cpp/Ollama requerirían conversión a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step70 | 4,66 B | 32.768 (entrenamiento) | Apache 2.0 | Checkpoint DPO intermedio (paso 70/186) sobre Qwen3.5-4B-Base; multimodal heredado |
| Qwen/Qwen3.5-4B-Base | 4,66 B (según safetensors del derivado) | no disponible en la información | Apache 2.0 | Modelo base sin alinear; referencia congelada del DPO |
| Alternativas de 4 B con safety tuning | no disponible | no disponible | no disponible | No se dispone de datos de benchmarks ni de modelos comparables documentados en la información proporcionada |

No se dispone de resultados de benchmarks que permitan comparar rendimiento con alternativas; la comparación se limita a parámetros, contexto de entrenamiento y licencia.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 70 de 186, 0.753 de 2 épocas): el entrenamiento seguía en curso en el momento de la exportación y no debe tratarse como modelo final ni como versión estable.
- No se han publicado evaluaciones de seguridad, benchmarks ni análisis de regresiones; no hay evidencia cuantitativa de que el DPO haya mejorado la seguridad sin degradar otras capacidades.
- Riesgo de alucinación inherente a un modelo de 4,66 B, agravado por el modo thinking: las trazas de razonamiento pueden contener afirmaciones incorrectas que condicionen la respuesta final.
- Sesgos: no documentados; los datos de preferencia provienen del propio modelo base y de un juez binario, por lo que pueden amplificar sesgos preexistentes del base y del juez.
- Idiomas soportados no especificados; el rendimiento fuera del inglés (idioma dominante de las fuentes de datos) es incierto.
- La torre de visión y la cabeza MTP no se entrenaron: el DPO no garantiza que el comportamiento multimodal haya mejorado y podría haber desalineado la coordinación entre lenguaje y visión.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3.5-4B-Base (enlace de licencia en el repositorio del base); conviene revisar los términos del base antes de producción.
- El contexto de entrenamiento de 32.768 tokens no implica que el modelo mantenga calidad a esa longitud; las trayectorias más largas se excluyeron y no se validó el comportamiento en el límite.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-B1B0-self-lr1e-6-step70
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-4B-Base/blob/main/LICENSE
- Slime (framework de entrenamiento): no disponible en la información proporcionada
- Megatron-LM: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
