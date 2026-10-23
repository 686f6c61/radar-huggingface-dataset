# Walkowicz/kairos-phronesis-base-1.0

## Resumen

Kairos Phronesis Base 1.0 es un modelo de 4B parámetros (4.326.350.848 pesos en safetensors) afinado por Walkowicz a partir de Qwen/Qwen3.5-4B, especializado en toma de decisiones determinista y verificación de invariantes normativos en entornos regulados. No es un modelo conversacional de propósito general: su contrato de salida es un JSON tipado con opción seleccionada, distribución de probabilidades, regla disparada, invariantes comprobados y un indicador `requires_review` que permite abstenerse de forma calibrada cuando faltan datos o la telemetría es inconsistente.

El modelo se entrenó sobre un conjunto canónico de 12.500 escenarios regulatorios complejos que cubren BACEN PIX MED y FedNow (pagos instantáneos y antifraude), NR-12 e ISO 13849-1 Cat 4 (seguridad funcional de maquinaria), ABNT NBR 6118 y Eurocode 2 (límites estructurales), Lei 14.133 y FAR Part 19 (contratación pública), CPC/2015 (admisibilidad procesal) y gobernanza de riesgo del EU AI Act. Se distribuye en dos formatos: GGUF Q5_K_M de 3,16 GB y BF16 de 8,07 GB, con licencia Apache 2.0 y soporte de portugués e inglés.

Su relevancia práctica está en el nicho: sustituye a un LLM generalista en decisiones donde se exige salida deserializable directamente (por ejemplo, en un objeto Pydantic), temperatura 0,0 y una traza de auditoría explícita. El autor reporta un 100% de acierto en su suite propia de 80 casos extremos, frente al 86,2% de IBM Granite 4.1 8B, con un footprint de menos de la mitad. Esas cifras son autoinformadas y no han sido replicadas de forma independiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen/Qwen3.5-4B (detalles de capas y atención no disponibles en la model card) |
| Parámetros totales | 4.326.350.848 (~4,33B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q5_K_M (GGUF, 3,16 GB) y BF16 a precisión completa (8,07 GB) |
| Idiomas soportados | Portugués (pt) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q5_K_M) y safetensors (BF16); tag `unsloth` en el repo; compatible con Ollama y endpoints compatibles |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen3.5-4B, un transformer decoder-only denso de ~4,33B parámetros. El autor no documenta en la model card el número de capas, la configuración de atención, la longitud de contexto nativa ni si se aplicaron técnicas como atención lineal o decodificación especulativa. El ajuste se realizó presumiblemente con Unsloth (el repo lleva ese tag), pero no se detallan hiperparámetros, epochs ni composición exacta del dataset más allá del número de escenarios.

El entrenamiento se centró en 12.500 escenarios regulatorios complejos con equilibrio declarado del 50% inglés / 50% portugués en la suite de evaluación. El objetivo no es generar texto libre, sino producir un contrato JSON calibrado: `status` (`decided`/`abstained`), `type`, `selected_option_id`, `confidence`, `probabilities` (distribución sobre todas las opciones), `requires_review`, `rule_triggered` e `invariants_checked`. La innovación destacable es la abstención activa como comportamiento de primera clase: ante datos ausentes, telemetría en conflicto o entradas fuera de distribución, el modelo emite `requires_review: true` con una regla de abstención explícita en lugar de forzar una decisión. No se documenta el uso de RLHF o DPO.

## Capacidades

- Toma de decisiones de elección múltiple con salida JSON tipada y deserializable directamente en Python/Pydantic.
- Verificación de invariantes normativos: devuelve la lista de reglas comprobadas (`invariants_checked`) y la regla que disparó la decisión (`rule_triggered`).
- Abstención calibrada ante entradas fuera de distribución, datos faltantes o telemetría corrupta.
- Distribución de probabilidad completa sobre las opciones, no solo la etiqueta ganadora, lo que permite umbrales de confianza en el consumidor.
- Razonamiento causal orientado a superar correlaciones superficiales de palabras clave (casos "adversarial twins" del benchmark del autor).
- Cumplimiento estricto de esquema JSON (100% en los 80 casos de la suite del autor).
- Capacidades multilingües limitadas a portugués e inglés.
- Ejecución offline: sin dependencia de red, pensada para sistemas con requisitos de privacidad o latencia.
- No soporta de forma declarada tool calling genérico, agentes multi-paso, visión, audio ni modo "thinking" extendido; su predecesor Mini usa una traza acotada de 3 pasos, pero Base 1.0 no la documenta.

## Casos de uso

- Motor de decisión antifraude en pagos instantáneos: recibe el estado de la transacción (importe, hora, reclamaciones MED abiertas en la cuenta beneficiaria) y devuelve `bloqueio_cautelar_med` o `autorizar` con probabilidades y regla disparada, listo para integrarse en el motor de riesgo vía API REST local.
- Cumplimiento normativo automatizado en banca: verificación de invariantes de resoluciones del banco central antes de liquidar una operación, con traza de qué reglas se comprobaron en cada caso para auditoría interna.
- Seguridad funcional de maquinaria: evaluación de estados de sensores frente a NR-12 e ISO 13849-1 Cat 4, donde la abstención ante telemetría inconsistente es preferible a una parada o arranque incorrectos.
- Contratación pública: cribado de admisibilidad de pliegos y propuestas bajo Lei 14.133 o FAR Part 19, derivando a revisión humana los casos límite mediante `requires_review`.
- Triaje en mesa de revisión: cuando el modelo se abstiene, el flag `requires_review` enruta el expediente a un operador humano con la razón concreta (`TELEMETRIA_CORROMPIDA_ABSTENCAO`, por ejemplo), lo que reduce el tiempo de clasificación manual.
- Clasificación de riesgo bajo el EU AI Act: etiquetado de sistemas y funcionalidades en categorías de riesgo con justificación basada en reglas citadas, como paso previo a una revisión legal formal.
- Despliegue en edge o punto de venta: la variante Q5_K_M de 3,16 GB cabe en una RTX 3060 o en hardware de gama media, permitiendo decisiones locales sin enviar datos regulatorios a la nube.
- Generación de registros estructurados para auditoría: cada inferencia produce un objeto JSON homogéneo que se puede almacenar y consultar como log de decisiones con confianza asociada.

## Benchmarks y rendimiento

Datos autoinformados por el autor sobre su suite propietaria `suite_v1_extreme_gauntlet.json` (80 casos extremos, 50% inglés / 50% portugués). No hay evaluación independiente publicada.

| Modelo | Parámetros | Precisión global (80 casos) | Adversarial twins (11) | Abstención activa (13) | Huella |
|---|---|---|---|---|---|
| Kairos Phronesis Base 1.0 | 4B | 100,0% (80/80) | 100,0% (11/11) | 100,0% (13/13) | 3,16 GB (Q5_K_M) |
| Kairos Phronesis Mini 1.0 | 1,5B | 88,8% (71/80) | 45,5% (5/11) | 100,0% (13/13) | 1,12 GB (Q5_K_M) |
| IBM Granite 4.1 8B | 8B | 86,2% (69/80) | 0,0% (0/11) | 100,0% (13/13) | 5,30 GB (Q4_K_M) |
| Kairos Phronesis Nano 1.0 | 0,5B (490M) | 38,8% (31/80) | 36,4% (4/11) | 38,5% (5/13) | 420 MB (Q5_K_M) |
| Laya Multilingual | 0,3B (322M) | 17,5% (14/80) | 54,5% (6/11) | 0,0% (0/13) | ~600 MB |

Desglose por dimensión (Base 1.0 frente a Granite 4.1 8B y Mini 1.5B):

| Dimensión | Casos | Base 1.0 | Granite 4.1 8B | Mini 1.0 |
|---|---|---|---|---|
| Decisiones complejas en dominio | 56 | 100,0% (56/56) | 100,0% (56/56) | 94,6% (53/56) |
| Adversarial twins (negativos difíciles) | 11 | 100,0% (11/11) | 0,0% (0/11) | 45,5% (5/11) |
| Abstención activa (OOD / fallos de telemetría) | 13 | 100,0% (13/13) | 100,0% (13/13) | 100,0% (13/13) |
| Cumplimiento estricto de esquema JSON | 80 | 100,0% (80/80) | No aplica (prompt de texto) | 100,0% (80/80) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La suite del autor está diseñada a medida para su dominio y favorece su contrato de salida JSON frente a modelos evaluados con prompt de texto libre, por lo que la comparación con Granite no es simétrica.

## Requisitos de hardware

- VRAM para Q5_K_M: 3,16 GB de pesos; en la práctica, entre 4 y 6 GB considerando caché KV y contexto, según la longitud de entrada.
- VRAM para BF16: 8,07 GB de pesos; estimación de 10-14 GB en ejecución con caché KV (cálculo propio, no documentado por el autor).
- GPU validadas por el autor: RTX 3060 para la variante Q5_K_M.
- GPU razonables para BF16 (estimación): RTX 4090, L40S, A100 40GB; también tarjetas consumer de 16 GB como RTX 4060 Ti 16GB o RTX 4080.
- Cabe en GPU consumer: sí, la variante Q5_K_M en cualquier GPU con 6 GB o más; la BF16 requiere 12-16 GB.
- Despliegue documentado: Ollama (`ollama run Walkowicz/kairos-phronesis-base-1.0` o mediante `Modelfile`) y API REST local en `http://127.0.0.1:11434/api/chat`.
- Despliegue para GGUF: llama.cpp es la vía natural al ser un fichero GGUF, aunque el autor solo documenta Ollama.
- Despliegue para safetensors (vLLM, TGI): no documentado; requeriría verificar la compatibilidad de la arquitectura con dichos servidores.
- Latencia y throughput: no disponibles. Con temperatura 0,0 y salidas JSON cortas, la latencia esperada es baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kairos Phronesis Base 1.0 | 4,33B | No disponible | Decisión y verificación con JSON tipado y abstención | Apache 2.0 | HuggingFace, GGUF + safetensors, Ollama |
| Kairos Phronesis Mini 1.0 | 1,5B | No disponible | Decisión con traza acotada de 3 pasos | No disponible en la información | HuggingFace (según el autor), Q5_K_M 1,12 GB |
| Kairos Phronesis Nano 1.0 | 0,5B (490M) | No disponible | Decisión para ultra-edge | No disponible en la información | HuggingFace (según el autor), Q5_K_M 420 MB |
| IBM Granite 4.1 8B | 8B | No disponible | Instruct de propósito general | No disponible en la información | Público (IBM Granite) |

Frente a Granite 4.1 8B, la ventaja declarada de Kairos Base 1.0 está en los negativos difíciles (100% frente a 0%) y en el contrato JSON nativo, con la mitad de parámetros y de huella. Frente a sus hermanos Mini y Nano, la diferencia es de precisión en dominio (100% frente a 94,6% y 38,8%) a cambio de un footprint mucho mayor. No se dispone de comparación con otros modelos especializados en verificación normativa.

## Limitaciones y advertencias

- Todos los benchmarks son autoinformados por el autor sobre una suite propia de 80 casos; no hay replicación independiente ni evaluación en benchmarks estándar.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación por terceros.
- El modelo está entrenado para un contrato de salida muy concreto; fuera de ese formato puede degradarse y no es adecuado como asistente conversacional general.
- Idiomas limitados a portugués e inglés; no hay soporte declarado de español ni de otras lenguas.
- Riesgo de alucinación en el campo `rule_triggered` e `invariants_checked`: el modelo puede citar una norma o una regla que no corresponda al caso, por lo que la traza debe validarse contra un catálogo externo de reglas.
- La calibración de `confidence` y `probabilities` no está verificada de forma independiente; no debe usarse como probabilidad real sin un estudio de calibración propio.
- Cobertura normativa limitada a las jurisdicciones y marcos del dataset (Brasil, Estados Unidos, Unión Europea); no sirve para otras legislaciones sin reentrenamiento o validación adicional.
- El contenido regulatorio puede quedar desactualizado respecto a cambios normativos posteriores al entrenamiento.
- No es asesoramiento legal ni certificación de seguridad funcional: las decisiones deben pasar por revisión humana en dominios de alto riesgo, tal como el propio modelo indica con `requires_review`.
- Licencia Apache 2.0 declarada para el modelo, pero conviene verificar los términos del modelo base Qwen/Qwen3.5-4B antes de un uso comercial, ya que las condiciones del derivado dependen de las del original.
- La fecha de creación del repositorio (23 de octubre de 2026) es posterior a la fecha actual, lo que conviene contrastar antes de tomar el artefacto como estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Walkowicz/kairos-phronesis-base-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- BENCHMARK.md (desglose de los 80 casos), referenciado en la model card dentro del propio repositorio: https://huggingface.co/Walkowicz/kairos-phronesis-base-1.0/blob/main/BENCHMARK.md
- Suite de evaluación `suite_v1_extreme_gauntlet.json`, referenciada en la model card (sin URL directa en la información disponible)
- No se han encontrado enlaces adicionales relevantes (papers, blogs, repos o demos) en la búsqueda web realizada; los resultados obtenidos no guardan relación con el modelo.
