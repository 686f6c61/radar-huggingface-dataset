# voicort/sn92-generalist-v5-1

## Resumen

SN92 generalist v5-1 es un ajuste fino (fine-tune) del modelo de decisión REAX 1, desarrollado por el usuario voicort para la pista generalista de REAX (Bittensor SN92) bajo la especificación de evaluación v5.1. El modelo resuelve un problema muy concreto: dada una pregunta de opción múltiple con un protocolo de petición fijo, emitir una única decisión (una opción leída por una cabeza de lectura) en lugar de generar texto libre. Hereda la arquitectura del backbone de la familia Qwen3.5 con atención completa no causal y una única lectura por pregunta (protocolo v3, `joint_config.json`).

El modelo tiene 26.085.330.160 parámetros en formato safetensors (unos 26,1 mil millones), con un repositorio de 52,2 GB, lo que sugiere pesos en precisión alta (probablemente bf16/fp16). Es un fine-tune derivado de `decisionmodels/reax-1`, que a su vez procede de `perplexity-ai/pplx-decider-v1.2` y de `Qwen/Qwen3.8-27B`. La licencia es Apache-2.0.

Su relevancia es acotada pero específica: no es un modelo de chat general, sino un "decider" entrenado para tareas de clasificación, recuperación, razonamiento procedimental y decisiones de uso de herramientas, con especial énfasis en el formato exacto que sirve la evaluación v5.1 de SN92. Para desarrolladores que trabajen en ese ecosistema o que necesiten un modelo de decisión de opción múltiple con contexto largo, es un artefacto directamente utilizable; para usos conversacionales generales, no es la herramienta adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 con atención completa no causal y cabeza de lectura (readout head) por pregunta |
| Parametros totales | 26.085.330.160 (26,1 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible de forma explícita; el entrenamiento incluye datos en inglés, alemán, español, francés y otros (MASSIVE en 52 locales, NLI no inglés, novelas en siete lenguajes) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo mantiene la arquitectura del base REAX 1: backbone de la familia Qwen3.5 con atención completa no causal y una cabeza de lectura que produce una distribución sobre las opciones de la pregunta (protocolo v3, `joint_config.json`). No es un modelo generativo de texto libre en el sentido habitual, sino un modelo de decisión que lee una pregunta con opciones y selecciona una. La cabeza de lectura de REAX 1 es 1,97 veces la de `pplx-decider-v1.2`, por lo que el entrenamiento usó temperatura 2,7265 (= 1,97 × 1,3823, la temperatura calibrada de v1.2), reflejada en `decision_config.json`.

El fine-tune es una media de pesos (model soup) de dos ajustes finos de REAX 1. Cada uno consiste en una etapa LoRA (rango 64, alpha 128, todas las capas lineales, fusionada en los pesos del backbone) más la cabeza de lectura, entrenada con entropía cruzada suave: 0,9 de peso sobre la opción correcta, mezclada con la distribución de respuestas del propio REAX 1 (peso 0,5 donde REAX 1 acierta y 0,15 donde falla). Los dos ajustes usaron 176.790 y 375.129 preguntas respectivamente. El 85 % de los datos está en el prompt de pregunta única de SN92 REAX tal como lo sirve la evaluación v5.1 (opciones etiquetadas en orden, sí/no como "A: Yes / B: No", "I don't know" como última opción en preguntas de hechos, máximo 26 opciones); el 15 % restante usa el protocolo conjunto de Decider.

La composición del dataset es equilibrada por tipo de tarea: razonamiento procedimental con respuestas verificadas (problemas aritméticos, salida de código, lógica multi-paso, causalidad sí/no, resultados SQL, probabilidad, mejores movimientos de ajedrez etiquetados con Stockfish/Lichess); decisiones de uso de herramientas sobre APIs ficticias generadas proceduralmente (siguiente llamada, decisión de llamada, recuperación de herramientas, cuándo llamar/preguntar/responder/declinar); recuperación y clasificación con muchas opciones a partir de datos públicos (categorías de arXiv, intenciones de MASSIVE en 52 locales, BANKING77, CLINC150, recuperación de pasajes de SQuAD/Wikipedia); lenguaje y artes (NLI con SNLI, MultiNLI y cuatro conjuntos no ingleses, postura, continuación de historias de novelas de dominio público en siete idiomas, clasificación de seguridad de contenido con Aegis 2.0, pares de poemas, acordes); nuevos dominios de decisión (reglas de permisos, reclamaciones, préstamos, subvenciones, garantías, aduanas, facturas de energía, equipaje, multas de aparcamiento, deducciones fiscales, reembolsos, elección de plan; parcialmente en alemán, español y francés) y etiquetas de registros públicos (eventos de tormenta NOAA, accidentes MSHA, retiradas de dispositivos openFDA, Federal Register, debilidades CVE de NVD); preguntas de hechos a libro cerrado con opción "I don't know", etiquetadas respecto a las propias respuestas de REAX 1 (se conserva la respuesta donde REAX 1 acierta con probabilidad ≥ 0,5; en caso contrario, "I don't know"; los hechos posteriores al 1 de agosto de 2026 se marcan como "I don't know"); y repetición de elementos de decisión de estilo evaluación pública para preservar habilidades generales. No se entrenó con ningún elemento del conjunto de desarrollo público v5.1.

## Capacidades

- Decisión de opción múltiple: selecciona una opción entre un máximo de 26, con formato de letras en orden y convenciones específicas (sí/no como "A: Yes / B: No", "I don't know" como última opción en preguntas de hechos).
- Razonamiento procedimental: problemas aritméticos, salida de código, lógica multi-paso, causalidad sí/no, resultados SQL, probabilidad y mejores movimientos de ajedrez.
- Decisiones de uso de herramientas: siguiente llamada a API, decisión de llamada, recuperación de herramientas y cuándo llamar, preguntar, responder o declinar, sobre APIs ficticias generadas proceduralmente.
- Recuperación y clasificación con muchas opciones: categorías de arXiv, emparejamiento título-resumen, intenciones (MASSIVE, BANKING77, CLINC150) y recuperación de pasajes.
- Lenguaje y artes: inferencia de lenguaje natural (NLI), postura, continuación de historias, clasificación de seguridad de contenido, pares de poemas y acordes.
- Dominios de decisión basados en reglas: permisos, reclamaciones, préstamos, subvenciones, garantías, aduanas, facturas, equipaje, multas, deducciones fiscales, reembolsos y elección de plan.
- Etiquetado de registros públicos: eventos de tormenta, accidentes laborales, retiradas de dispositivos, registro federal y debilidades CVE.
- Multilingüismo parcial: datos de entrenamiento en inglés, alemán, español, francés y otros idiomas (52 locales en MASSIVE, NLI no inglés, novelas en siete lenguajes).
- Modo de abstención: opción "I don't know" en preguntas de hechos, con etiquetado relativo a la confianza de REAX 1.

## Casos de uso

- Evaluación en la pista generalista de REAX (Bittensor SN92): el modelo está entrenado específicamente para el protocolo de evaluación v5.1, con el 85 % de los datos en el prompt exacto que sirve la evaluación, por lo que es directamente desplegable como participante en esa pista.
- Clasificación de intenciones en asistentes conversacionales: con datos de MASSIVE (52 locales), BANKING77 y CLINC150, puede asignar una intención a una consulta de usuario entre un conjunto cerrado de opciones, útil en enrutamiento de diálogo.
- Recuperación de pasajes y documentos: entrenado con SQuAD/Wikipedia y emparejamiento título-resumen de arXiv, puede seleccionar el pasaje o documento relevante entre muchas opciones, adecuado para pipelines de RAG con etapa de reranking.
- Decisión de uso de herramientas en agentes: puede determinar la siguiente llamada a API, si conviene llamar a una herramienta, preguntar al usuario, responder o declinar, lo que encaja en orquestadores de agentes con APIs predefinidas.
- Evaluación de cumplimiento normativo y reglas de negocio: los dominios de permisos, reclamaciones, préstamos, garantías, aduanas o deducciones fiscales permiten usarlo como clasificador de decisiones regladas en flujos administrativos, con la salvedad de que las respuestas deben validarse contra la normativa vigente.
- Etiquetado de registros públicos: clasificación de eventos de tormenta (NOAA), accidentes (MSHA), retiradas de dispositivos (openFDA), documentos del Federal Register y debilidades CVE, útil para enriquecimiento de datos abiertos.
- Moderación de contenido: con datos de Aegis 2.0 y otros conjuntos públicos, puede clasificar contenido según categorías de seguridad en un paso de decisión.
- Razonamiento procedimental verificado: problemas aritméticos, lógica multi-paso, SQL y probabilidad con respuestas computadas y reverificadas, aplicable a evaluación de pipelines de razonamiento o a sistemas de tutoría con opciones cerradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26,1 mil millones de parámetros, en bf16/fp16 se requieren aproximadamente 52 GB solo para pesos, más overhead de activaciones y caché; en cuantización de 8 bits, unos 26 GB; en 4 bits, unos 13-14 GB (estimaciones teóricas, no publicadas por el autor).
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para inferencia en precisión completa; A100 40 GB o L40S 48 GB para 8 bits; para 4 bits, tarjetas de 24 GB como RTX 4090 o RTX 3090 podrían ser suficientes en teoría, aunque no hay confirmación del autor.
- Cabe en GPU de consumo: probablemente sí en cuantización de 4 bits en RTX 4090 (24 GB), pero no hay datos publicados de cuantización ni de compatibilidad con llama.cpp/Ollama.
- Opciones de despliegue: no disponible. El autor no documenta vLLM, TGI, llama.cpp ni Ollama; el formato publicado es safetensors y el protocolo requiere `joint_config.json` y `decision_config.json` para la cabeza de lectura.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voicort/sn92-generalist-v5-1 | 26,1 mil millones | No disponible | Decisor de opción múltiple (fine-tune de REAX 1) | Apache-2.0 | Hugging Face (58 descargas, 0 likes) |
| decisionmodels/reax-1 | No disponible | No disponible | Decisor de opción múltiple (base) | No disponible en la información proporcionada | Hugging Face |
| perplexity-ai/pplx-decider-v1.2 | No disponible | No disponible | Decisor de opción múltiple (base de REAX 1) | No disponible en la información proporcionada | Hugging Face |
| Qwen/Qwen3.8-27B | ~27 mil millones (por el nombre) | No disponible | Modelo generativo de propósito general | No disponible en la información proporcionada | Hugging Face |

La comparación con modelos generativos de propósito general no es directa: SN92 generalist v5-1 no genera texto libre, sino que emite una decisión sobre opciones. Frente a REAX 1, la diferencia es el ajuste fino con datos específicos de SN92 y la temperatura calibrada (2,7265). Frente a Qwen3.8-27B, comparte familia de backbone pero el comportamiento es completamente distinto.

## Limitaciones y advertencias

- No es un modelo de chat general: está diseñado para el protocolo de decisión de opción múltiple (máximo 26 opciones, formato específico); usarlo fuera de ese protocolo puede producir resultados no significativos.
- Riesgo de alucinación en preguntas de hechos: aunque incluye la opción "I don't know" y los hechos posteriores al 1 de agosto de 2026 se etiquetan como "I don't know", el etiquetado se basa en las respuestas de REAX 1, no en verificación factual independiente.
- Sesgos de los datos de entrenamiento: el dataset mezcla fuentes públicas (arXiv, MASSIVE, BANKING77, CLINC150, SQuAD, SNLI, MultiNLI, Aegis 2.0, NOAA, MSHA, openFDA, Federal Register, NVD) cuyos sesgos pueden propagarse; no se documenta un análisis de sesgo.
- Limitaciones de idioma: aunque hay datos multilingües, no se declara una lista oficial de idiomas soportados ni evaluación por idioma; el grueso del entrenamiento parece estar en inglés.
- Contexto: no se publica la longitud de contexto soportada, lo que impide dimensionar su uso en documentos largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo deriva de REAX 1, `pplx-decider-v1.2` y `Qwen/Qwen3.8-27B`; deben revisarse las licencias y los términos de esos modelos base, así como `NOTICE` y `MODIFICATIONS.md`.
- Caveat para producción: el modelo tiene 58 descargas y 0 likes, sin benchmarks publicados ni validación externa; el autor no documenta cuantizaciones, opciones de despliegue ni latencia, por lo que su integración en producción requiere validación propia.
- Temperatura fija: `decision_config.json` fija temperatura 2,7265; alterarla sin recalibrar puede degradar la calidad de las decisiones.

## Enlaces

- Hugging Face: https://huggingface.co/voicort/sn92-generalist-v5-1
- Modelo base REAX 1: https://huggingface.co/decisionmodels/reax-1
- Modelo base de REAX 1: https://huggingface.co/perplexity-ai/pplx-decider-v1.2
- Modelo Qwen de referencia: https://huggingface.co/Qwen/Qwen3.8-27B
