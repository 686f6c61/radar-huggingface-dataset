# ThakiCloud/EvidenceLink-DART-Reranker-KO

## Resumen

EvidenceLink-DART-Reranker-KO es un cross-encoder de tipo reranker especializado en coreano, desarrollado por ThakiCloud, que resuelve un problema de enlazado de registros (record linkage) sobre documentos financieros públicos. Concretamente, dada una presentación de corrección (기재정정) de una decisión de emisión de bonos convertibles en el sistema OpenDART, el modelo identifica cuál de las presentaciones originales candidatas es la que esa corrección modifica, o responde NONE cuando ninguna de las candidatas es correcta.

El modelo es un fine-tune completo de BAAI/bge-reranker-v2-m3, con 567.755.777 parámetros y arquitectura XLM-RoBERTa adaptada a clasificación de texto (scoring punto a punto por par consulta-candidata). Su relevancia radica en que la dificultad real no está en identificar al emisor, sino en discriminar entre varias presentaciones del mismo emisor con series, fechas y tablas casi idénticas, además de abstenerse correctamente cuando el original no está en el conjunto de candidatos.

La evaluación se realizó bajo un protocolo preregistrado (prereg_E_v2_4) con un conjunto de test sellado de 648 consultas de 79 emisores no vistos en entrenamiento. Los resultados reportados en la model card muestran una mejora sustancial frente a BM25 y una regla heurística, con Top-1 de 0,978 en el conjunto CLEAN.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (cross-encoder / reranker), base BAAI/bge-reranker-v2-m3 |
| Parametros totales | 567.755.777 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32) |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-reranker-v2-m3, un cross-encoder multilingüe basado en XLM-RoBERTa, y se somete a un fine-tune completo (full fine-tune) para la tarea de enlazado de correcciones de presentaciones DART. La entrada no es texto bruto de la presentación, sino una "card" estructurada: una línea de resumen `[요약]` con serie, principal, precio de conversión, cupón, rendimiento y suelo de refijación, seguida del texto de la presentación enmascarado (la fecha de primera presentación y los números de recepción de 14 dígitos se sustituyen por `[MASK]`/`[RCEPT]`). El scoring es punto a punto sobre cada par consulta-candidata, y la decisión final es argmax sobre las candidatas, con NONE si el logit superior queda por debajo de un umbral congelado (−8,4375) fijado en dev antes de la ejecución sellada.

Los datos de entrenamiento provienen exclusivamente de presentaciones públicas de OpenDART (sin datos de AI-Hub), correspondientes a decisiones de emisión de bonos convertibles y sus correcciones presentadas entre 2022 y 2026. El conjunto de candidatas por consulta se construye con hasta 10 presentaciones originales del mismo emisor recibidas en los 3 años anteriores (más recientes primero) y hasta 3 presentaciones de otros emisores recibidas en ±10 días como negativos duros, ordenadas por número de recepción descendente. No se detalla en la información disponible el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o DPO; al tratarse de un cross-encoder de clasificación, el entrenamiento se orienta a la función de scoring, no a generación.

## Capacidades

- Enlazado de correcciones: dada una presentación de corrección de decisión de emisión de bonos convertibles, devuelve el identificador de la presentación original que modifica.
- Abstención explícita: responde NONE cuando ninguna candidata supera el umbral congelado, evitando enlaces forzados.
- Scoring punto a punto: devuelve un logit bruto por candidata (no probabilidades calibradas).
- Discriminación entre presentaciones del mismo emisor: maneja series, rondas y tablas casi idénticas del mismo día.
- Procesamiento de documentos OpenDART: incluye un decodificador (`dart_zip_to_text`) que gestiona codificaciones cp949 en presentaciones anteriores a mediados de 2022.
- Extracción de campos y construcción de la card de entrada mediante utilidades incluidas en el paquete.
- Soporte de despliegue compatible con text-embeddings-inference y endpoints.
- Capacidades multilingües: limitadas al coreano en la práctica, aunque hereda el tokenizador multilingüe del modelo base.
- No dispone de tool calling, capacidades de agente, visión ni audio: es un modelo de clasificación, no generativo.

## Casos de uso

- Enlazado automático de correcciones en pipelines regulatorios: integrar el modelo en un proceso que reciba presentaciones DART nuevas y las asocie a su original para mantener trazabilidad documental, gracias a su Top-1 de 0,978 en el conjunto CLEAN.
- Deduplicación y consolidación de historiales de emisión: agrupar todas las correcciones de una misma serie de bonos convertibles en un expediente único por emisor, usando el scoring por candidata para ordenar y validar enlaces.
- Auditoría y compliance financiero: reconstruir la cadena de correcciones de una decisión de emisión para revisores internos o reguladores, con la garantía de que el modelo se abstiene (NONE) cuando el original no está en el conjunto, reduciendo falsos positivos.
- Enriquecimiento de bases de datos financieras: poblar un grafo de documentos enlazados (original → corrección → corrección posterior) a partir de volcados de OpenDART, con un decodificador que evita la corrupción de campos por codificación cp949.
- Detección de anomalías en presentaciones: marcar correcciones que el modelo no logra enlazar con alta confianza como candidatas a revisión manual, priorizando la cola de trabajo de analistas.
- Sistemas de búsqueda documental con reranking: usar el modelo como etapa de reranking sobre un recuperador previo (por ejemplo, BM25) en un buscador de presentaciones DART, aprovechando la mejora de +0,2387 en Top-1 frente a BM25 reportada en el bootstrap emparejado.
- Investigación en record linkage: servir como referencia reproducible para experimentos de enlazado de registros con abstención, dado el protocolo preregistrado y los artefactos publicados.

## Benchmarks y rendimiento

Resultados del conjunto de test sellado (sealed4, prereg_E_v2_4) sobre CLEAN (n=499; 369 enlazadas, 130 NONE), tras eliminar consultas cuya card muestra la fecha de recepción de alguna candidata:

| Arm | Top-1 | Linked acc | NONE precision | NONE recall | Same-issuer wrong-link rate |
|---|---|---|---|---|---|
| Este modelo (H3, seed 0) | 0,978 | 0,9946 | 1,0 | 0,9308 | 0,0246 |
| BM25 (card vs card, umbral NONE en dev) | 0,7375 | 0,7642 | 0,5548 | 0,6615 | 0,1387 |
| Regla T0 | 0,7174 | no disponible | no disponible | no disponible | 0,1432 |

Bootstrap emparejado por clúster de emisor (10.000 remuestreos): Top-1 frente a BM25 +0,2387, IC 95% [0,1645, 0,3091].

Nota del autor: el conjunto sellado contiene 648 consultas de corrección de 79 emisores; los casos naturales de "no coincidencia" fueron demasiado pocos (25 < 30), por lo que la puerta G6 se declara UNDERPOWERED y la generalización de la decisión NONE a casos naturales no queda establecida.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en fp32 (~2,27 GB para 567,8 M de parámetros); en fp16 serían ~1,14 GB y en int8 ~0,57 GB, aunque la model card solo distribuye fp32 y no documenta cuantizaciones.
- GPU recomendadas: cualquier GPU con al menos ~4 GB de VRAM para fp32 con overhead de activaciones; tarjetas como RTX 3060, RTX 4090, A100 o H100 son suficientes y el modelo no requiere memoria de gran escala.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más.
- Opciones de despliegue: `transformers` (carga directa con `load`), text-embeddings-inference y endpoints compatibles, según los tags del repositorio. No se documentan integraciones específicas con vLLM, llama.cpp ni Ollama (este último no aplica a un cross-encoder de clasificación).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EvidenceLink-DART-Reranker-KO | 567,8 M | no disponible | Reranking de correcciones DART en coreano | Apache-2.0 | Hugging Face |
| BAAI/bge-reranker-v2-m3 (base) | no disponible | no disponible | Reranking multilingüe genérico | no disponible | Hugging Face |
| BM25 (referencia del autor) | no aplica | no aplica | Recuperación léxica | no aplica | Implementación estándar |

La comparación directa con el modelo base no está documentada en la información disponible: el autor solo reporta comparaciones frente a BM25 y la regla T0. No se dispone de datos de benchmarks frente a otros rerankers coreanos de la misma categoría.

## Limitaciones y advertencias

- Alcance restringido: entrenado únicamente para decisiones de emisión de bonos convertibles (전환사채권발행결정) y sus correcciones presentadas entre 2022 y 2026; no se garantiza su comportamiento en otros tipos de presentación DART.
- Decisión NONE no validada en casos naturales: solo 25 casos naturales de no coincidencia, por debajo del umbral de 30, por lo que la generalización de la abstención a casos reales no está establecida (G6 UNDERPOWERED).
- Formato de entrada obligatorio: el modelo espera la card específica con línea `[요약]` y texto enmascarado; usar texto bruto de la presentación produce puntuaciones distintas y el umbral congelado deja de ser aplicable.
- Decodificación crítica: las presentaciones anteriores a mediados de 2022 están en cp949; leerlas como UTF-8 con `errors="replace"` destruye los campos de los que depende el modelo.
- Puntuaciones no calibradas: los logits devueltos no son probabilidades; el umbral −8,4375 está congelado y cualquier cambio de dominio o de formato invalida su uso.
- Riesgo de enlace erróneo entre presentaciones del mismo emisor: la tasa reportada en CLEAN es 0,0246, no nula; en producción conviene revisión humana en casos de baja confianza.
- Idiomas: solo coreano; no hay evidencia de rendimiento en otros idiomas.
- Sesgos: no se documentan análisis de sesgos en la información disponible; el modelo se entrena solo con presentaciones públicas de OpenDART, lo que puede introducir sesgos de cobertura del regulador.
- Uso comercial: la licencia Apache-2.0 lo permite, con las obligaciones de atribución indicadas en `NOTICE`.
- Datos: no se distribuye texto de presentaciones en el repositorio; el ejemplo incluido es sintético y no corresponde a una presentación DART real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/EvidenceLink-DART-Reranker-KO
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Tarjeta en coreano: https://huggingface.co/ThakiCloud/EvidenceLink-DART-Reranker-KO/blob/main/MODEL_CARD.ko.md
- OpenDART (sistema de presentaciones financieras de Corea): no disponible en la información proporcionada
- Paper, blog o repositorio adicional: no disponible en la información proporcionada
