# Walkowicz/kairos-phronesis-nano-1.0

## Resumen

Kairos Phronesis Nano 1.0 es un modelo especialista de decisión y verificación de 494 millones de parámetros (494.032.768 según los pesos en safetensors), afinado por el desarrollador independiente Matheus Nery Walkowicz a partir de Qwen/Qwen2.5-0.5B-Instruct. No es un modelo conversacional de propósito general: está diseñado para emitir decisiones tipadas en JSON estricto, acompañadas de una traza de razonamiento acotada a tres pasos dentro de etiquetas `<think>`, y para abstenerse de forma calibrada cuando la entrada es ambigua o está corrupta. Su nicho declarado es el ámbito regulatorio brasileño (referencias a PIX, normas del BACEN, NR-12 y al CPC/2015), lo que explica que sus idiomas soportados sean portugués e inglés.

La propuesta técnica es inusual en la clase sub-1B: en lugar de competir en conocimiento general, el modelo envuelve el decodificador de Qwen2.5 en un contrato de salida rígido (`status`, `selected_option_id`, `confidence`, `probabilities`, `requires_review`, `rule_triggered`) y añade un comportamiento de rechazo explícito ante entradas fuera de distribución. El autor lo posiciona frente a clasificadores encoder-only como Laya Multilingual (322M), argumentando que un modelo generativo con razonamiento acotado supera el emparejamiento superficial por embeddings en casos de lógica normativa.

Su relevancia práctica está en el despliegue: con 420 MB en cuantización Q5_K_M y menos de 500 MB de RAM según la model card, cabe en portátiles de consumo y pasarelas edge sin GPU, con 41,9 tokens/s en CPU y 265,1 tokens/s en una RTX 3060. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Conviene señalar que el modelo tiene 0 descargas y 0 valoraciones en el momento de redactar esta ficha, y que todos los benchmarks proceden del propio autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura de Qwen2.5, con RoPE, RMSNorm, SwiGLU y atención GQA); fine-tuning supervisado sobre el modelo base |
| Parámetros totales | 494.032.768 (494M, ~0,49B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens |
| Tipos de cuantización | Q5_K_M (420 MB) y BF16 (994 MB) en GGUF; pesos originales en safetensors/BF16 |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q5_K_M, BF16) y safetensors |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Tamaño del repositorio | 1,4 GB |
| Método de ajuste declarado | Unsloth (etiqueta del repositorio) |
| Salida estructurada | JSON tipado con esquema fijo + traza `<think>` de 3 pasos |

## Arquitectura y entrenamiento

El modelo hereda íntegramente la arquitectura del decodificador Qwen2.5-0.5B: transformer causal con 24 capas, atención con query grouping (GQA), normalización RMSNorm, activación SwiGLU y embeddings de posición rotatorios. El ajuste no modifica la topología; se trata de un fine-tuning supervisado (SFT) sobre el checkpoint Instruct, realizado con Unsloth según la etiqueta del repositorio. La model card no documenta el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles.

La innovación no está en la arquitectura sino en el formato de comportamiento inducido. El modelo fuerza una traza acotada de tres pasos —invariante y regla aplicable, evidencia y riesgo, calibración y veredicto— antes de emitir el objeto JSON, lo que el autor mide como 98,8 % de adherencia a la traza y 100 % de cumplimiento del esquema. Además se entrena explícitamente el comportamiento de abstención: ante telemetría corrupta o estados fuera de distribución debe devolver `status: "abstained"` con `requires_review: true`, en lugar de forzar una decisión. El conocimiento inyectado es de dominio: plazos y rituales del CPC/2015, normativa del BACEN y PIX, y requisitos de la NR-12.

## Capacidades

- Emisión de decisiones tipadas en JSON estricto, con identificador de opción seleccionada, confianza calibrada, distribución de probabilidad sobre todas las opciones y regla estatutaria invocada.
- Razonamiento acotado en tres pasos dentro de etiquetas `<think>`, inspeccionable y auditable.
- Abstención activa y calibrada ante entradas ambiguas, corruptas o fuera de distribución (53,8 % de rechazo correcto en el conjunto de prueba del autor).
- Clasificación multietiqueta con probabilidades, orientada a selección entre opciones predefinidas (elección única sobre un conjunto cerrado).
- Bilingüe portugués-inglés, con sesgo claro hacia el portugués jurídico-administrativo brasileño.
- Ejecución totalmente offline en CPU, sin dependencia de red ni de GPU.
- No documenta soporte de tool calling ni function calling, ni capacidades de agente multi-paso más allá de la traza de tres pasos.
- Sin capacidades multimodales: no procesa visión, audio ni documentos escaneados.

## Casos de uso

- **Triaje de disputas y decisiones administrativas en el ámbito PIX/BACEN:** el modelo recibe el estado del caso y la lista de resoluciones posibles, y devuelve la opción seleccionada junto a la norma aplicada. Es adecuado porque el contrato JSON permite persistir la decisión y la regla invocada en un sistema de expediente sin post-procesado.
- **Guardarraíl y enrutador previo a un LLM mayor:** al ser un modelo de 420 MB, puede colocarse delante de un modelo grande para descartar o derivar consultas fuera de dominio mediante `status: "abstained"`, reduciendo coste por token y evitando respuestas alucinadas en casos corruptos.
- **Verificación de conformidad con NR-12 en pasarelas industriales:** un gateway edge sin conectividad puede ejecutar el modelo en CPU (41,9 tokens/s) para decidir si un checklist de seguridad laboral cumple los requisitos y marcar `requires_review` cuando la evidencia es insuficiente.
- **Automatización de back-office en portátiles de campo:** los 420 MB en Q5_K_M permiten distribuirlo dentro de una aplicación de escritorio y operar sin conexión en juzgados, oficinas regionales o inspecciones in situ, donde no hay garantía de red.
- **RPA legal con salida type-safe:** el 100 % declarado de cumplimiento de esquema permite conectar la salida directamente a un cliente tipado (Pydantic, Zod) sin capa de reparación de JSON, algo crítico en pipelines que escriben en bases de datos relacionales.
- **Cálculo de plazos procesales con plazo reglamentario:** el ejemplo de la model card (concesión de 5 días según LC123 art. 43) muestra el patrón: el modelo identifica el invariante temporal y lo devuelve como `rule_triggered`, lo que facilita la revisión por un humano y la auditoría posterior.
- **Investigación sobre modelos de decisión sub-1B:** sirve como referencia reproducible para estudiar abstención calibrada y formatos de razonamiento acotado en modelos por debajo de mil millones de parámetros.
- **Detección de telemetría corrupta en sistemas de decisión automatizada:** la diferencia reportada frente a Laya (53,8 % frente a 0,0 % de rechazo correcto sobre 13 casos corruptos) lo hace útil como capa de validación de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos proceden de la evaluación propia del autor sobre un conjunto de 80 casos (`suite_v1_extreme_gauntlet.json`, `BENCHMARK.md`), sin revisión por pares ni reproducción independiente:

| Métrica | Kairos Phronesis Nano (490M) | Laya Multilingual (322M) |
|---|---|---|
| Precisión global (80 casos extremos) | 38,8 % (31/80) | 17,5 % (14/80) |
| Decisiones complejas en dominio (56 casos) | 32,1 % (18/56) | 14,3 % (8/56) |
| Gemelos adversariales / negativos difíciles (11 casos) | 54,5 % (6/11) | 54,5 % (6/11) |
| Abstención activa en OOD/corrupto (13 casos) | 53,8 % (7/13) | 0,0 % (0/13) |
| Adherencia a la traza `<think>` de 3 pasos | 98,8 % | 0,0 % (caja negra) |
| Cumplimiento estricto de esquema JSON | 100,0 % | No aplica (dict de Python) |
| Tamaño del artefacto | 420 MB (Q5_K_M) | ~600 MB (safetensors) |
| Velocidad en GPU (RTX 3060 12 GB) | 265,1 tokens/s (1,8 s de latencia por decisión) | No comparable (encoder no generativo) |
| Velocidad en CPU pura | 41,9 tokens/s (~10 s de latencia) | No comparable (encoder no generativo) |

Advertencia de lectura: la precisión global del 38,8 % es baja en términos absolutos y el conjunto de evaluación es muy reducido (80 casos, 13 de ellos corruptos), por lo que los intervalos de confianza son amplios. La métrica de gemelos adversariales es idéntica en ambos modelos, de modo que la ventaja se concentra en las otras categorías.

## Requisitos de hardware

- **Inferencia mínima:** 420 MB de pesos en Q5_K_M; la model card declara menos de 500 MB de RAM en este formato, sumando caché KV y overhead del runtime.
- **BF16:** 994 MB de pesos; presupuesto realista de 1,2-1,5 GB de VRAM/RAM incluyendo contexto.
- **Safetensors originales:** repositorio de 1,4 GB; requiere el runtime completo de transformers.
- **GPU de consumo:** cabe holgadamente en cualquier GPU con 2 GB o más de VRAM (GTX 1650 4 GB, RTX 3050 8 GB, RTX 3060 12 GB, RTX 4060, e incluso iGPU con memoria compartida). El autor reporta 265,1 tokens/s y 1,8 s de latencia extremo a extremo en una RTX 3060 12 GB.
- **CPU pura:** viable sin GPU; 41,9 tokens/s y aproximadamente 10 s por decisión en portátiles convencionales según el autor. Con contexto corto y prompts de decisión, el coste dominante es el prefill, no la generación.
- **Opciones de despliegue:** Ollama (el repositorio incluye un `Modelfile` y el flujo `ollama create`/`ollama run`), llama.cpp directamente sobre el GGUF, LM Studio, y vLLM o TGI si se sirve el checkpoint en safetensors. La etiqueta `endpoints_compatible` sugiere compatibilidad con la API de endpoints de Hugging Face.
- **Fine-tuning:** el autor declara Unsloth, por lo que el reajuste cabe en una GPU de 8-16 GB con LoRA.
- **Throughput agregado:** no publicado; con un modelo de este tamaño el cuello de botella en producción será la gestión de contexto y el número de opciones del esquema JSON, no la computación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos Phronesis Nano 1.0 | 494M | No especificado en la model card (32.768 en el modelo base) | Decisión tipada + abstención calibrada, dominio regulatorio pt-BR | Apache 2.0 | GGUF y safetensors en Hugging Face |
| Laya Multilingual | 322M | No disponible | Clasificador encoder-only multilingüe | No disponible en la información proporcionada | Referenciado por el autor; no se aporta enlace |
| Qwen2.5-0.5B-Instruct | 494M | 32.768 tokens | Asistente conversacional generalista, sin esquema de salida forzado | Apache 2.0 | Hugging Face (modelo base) |
| Qwen3-0.6B | 596M | 32.768 tokens nativos (extensible con YaRN) | LLM generalista con modo thinking, sin contrato JSON específico | Apache 2.0 | Hugging Face |

Frente a su modelo base, Phronesis Nano intercambia amplitud de conocimiento por disciplina de formato y comportamiento de rechazo: en conversación abierta será peor, en extracción de decisiones auditables es más predecible. Frente a clasificadores encoder-only como Laya, gana en explicabilidad (traza de tres pasos y regla invocada) y pierde en latencia y coste computacional, ya que genera texto en lugar de hacer una pasada de encoding. Frente a Qwen3-0.6B, la comparación directa no está disponible: no hay benchmarks comunes publicados.

## Limitaciones y advertencias

- **Precisión absoluta baja:** el 38,8 % global del benchmark del autor implica que roughly 6 de cada 10 casos extremos se resuelven mal; no es un modelo para decisiones autónomas sin revisión humana.
- **Validación insuficiente:** 80 casos de evaluación, sin conjunto de test independiente, sin replicación externa y sin benchmarks estándar. Todos los números provienen de la model card del propio autor.
- **Dominio muy estrecho:** el ajuste está orientado a normativa brasileña (CPC/2015, BACEN, PIX, NR-12). Fuera de ese marco, el comportamiento de abstención puede dispararse o, peor, emitir decisiones con apariencia de rigor pero sin base normativa.
- **Cobertura de idiomas limitada:** solo portugués e inglés; no soporta castellano. Un uso en España requeriría reentrenamiento o al menos evaluación específica.
- **Riesgo de alucinación en modo conversacional:** al ser un modelo de 0,5B, fuera del esquema JSON y fuera del dominio de ajuste su fiabilidad cae abruptamente. El propio autor mide que el modelo comparable alucinaba el 100 % de las entradas corruptas.
- **Sesgo de calibración:** la confianza declarada procede de un ajuste supervisado sobre datos no documentados; no hay estudio de calibración (ECE, Brier) publicado, por lo que el valor de `confidence` no debe tratarse como probabilidad validada.
- **Sin soporte documentado de tool calling ni de agentes:** no se debe asumir integración con APIs externas sin trabajo adicional.
- **Restricciones de licencia:** Apache 2.0 permite uso comercial, modificación y redistribución, con obligación de conservar avisos de licencia y el archivo NOTICE si existe; no hay cláusulas de uso aceptable adicionales más allá de las del modelo base.
- **Madurez del proyecto:** 0 descargas y 0 valoraciones en el momento del análisis; el ecosistema de repositorios del autor incluye otros modelos (mini-1.0, sotos-1) sin documentación pública extensa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Walkowicz/kairos-phronesis-nano-1.0
- Modelo base Qwen2.5-0.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Perfil del autor en Hugging Face: https://huggingface.co/Walkowicz/models
- Variante relacionada del mismo autor: https://huggingface.co/Walkowicz/kairos-phronesis-mini-1.0
- Benchmark completo del autor: `BENCHMARK.md` dentro del repositorio del modelo
- Nota sobre la búsqueda web: los resultados correspondientes a `github.com/kairos-agi/kairos`, `github.com/DAXIAORobotics/kairos` y el preprint `arxiv.org/abs/2606.16533` pertenecen a proyectos de world models para robótica sin relación con este modelo; se citan únicamente para evitar confusiones de nombre.
