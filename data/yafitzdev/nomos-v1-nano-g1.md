# yafitzdev/nomos-v1-nano-g1

## Resumen

`nomos-v1-nano-g1` es un coprocesador local de enrutamiento de herramientas (tool-routing) desarrollado por yafitzdev. Clasifica la siguiente herramienta legal que debe ejecutar un agente de investigación técnica a partir de la pregunta actual, el estado del agente, el historial de evidencia, el contexto de gobernanza y el conjunto de herramientas candidatas. No es un generador de respuestas, ni un ejecutor de herramientas, ni un sistema de descubrimiento de APIs: se integra junto a un agente de recuperación como una capa de clasificación de la próxima acción, permitiendo elegir, registrar y auditar la decisión antes de ejecutarla.

El modelo se presenta como el primer baseline nano de la línea de enrutamiento de herramientas de yafitzdev, en el mismo nivel que los coprocesadores Pyrrho y Opsis. Su arquitectura es un perceptrón multicapa (MLP) de dos capas con 4.096 características de entrada, entrenado sobre un corpus sintético de 20.000 escenarios. Está diseñado para ejecutarse en CPU, con un tamaño de checkpoint muy reducido, y se distribuye bajo una licencia de investigación mixta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas con 4.096 características de entrada |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato PyTorch nativo) |
| Idiomas soportados | inglés (en) |
| Licencia | mixed-source-research-preview |
| Formato de pesos | PyTorch (checkpoint .pt) |

## Arquitectura y entrenamiento

`nomos-v1-nano-g1` es un clasificador basado en un MLP de dos capas con 4.096 entradas. Las características se generan mediante un encoder que aplica un hash blake2b a los tokens de estado y de herramienta con prefijos específicos, reproduciendo la misma lógica en el cargador `nomos.py` incluido en el repositorio. No es un transformer ni un modelo MoE; es un modelo compacto y ligero pensado para ejecutarse en CPU.

El entrenamiento se realizó sobre un corpus sintético de 20.000 escenarios generados por plantillas de matriz y un oráculo determinista. Se generaron 147.945 pares de candidatos, de los cuales 20.000 son positivos y 127.945 negativos. El vocabulario de herramientas está limitado a 19 herramientas compatibles con Fitz-Sage V2. No se emplearon técnicas de RLHF ni DPO; las etiquetas se generaron mediante el oráculo de matriz. La división del conjunto se hizo mediante un hash de trayectoria estable para garantizar separación entre entrenamiento, validación y prueba.

## Capacidades

- Enrutamiento de herramientas: clasifica la siguiente herramienta legal entre un conjunto proporcionado por el llamador, devolviendo una lista ordenada con puntuaciones escalares.
- Condicionamiento por estado del agente: tiene en cuenta el estado actual del agente (por ejemplo, `partial_evidence`) para decidir la siguiente acción.
- Registro y auditoría: las puntuaciones permiten registrar las decisiones de enrutamiento para su posterior auditoría.
- Reducción de llamadas innecesarias: al optimizar la elección de herramienta, evita ejecutar herramientas menos adecuadas.
- Vocabulario fijo de 19 herramientas Fitz-Sage V2: el checkpoint está entrenado específicamente para ese conjunto; no admite herramientas nuevas sin actualización y reentrenamiento.
- Salida estructurada: devuelve una lista JSON con `tool` y `score`, fácil de integrar en un pipeline de agente.

## Casos de uso

- Agente de recuperación aumentada (RAG): como capa de clasificación, decide si el agente debe buscar con BM25, inspeccionar el esquema de una tabla o comparar evidencias, según el estado actual del proceso.
- Auditoría de decisiones de enrutamiento: las puntuaciones generadas se registran en logs para revisar qué herramientas se consideraron y por qué se eligió una sobre otra.
- Optimización de flujos de investigación: al clasificar correctamente la siguiente acción, se reducen llamadas a herramientas menos adecuadas, mejorando la eficiencia del agente.
- Baseline para futuros modelos de enrutamiento: sirve como referencia para entrenar routers más avanzados con la misma arquitectura o con arquitecturas mayores.
- Control de gobernanza: se puede integrar con capas de gobernanza para que las decisiones de uso de herramientas se tomen según el estado y las restricciones definidas.
- Despliegue en entornos sin GPU: al ser un modelo MLP pequeño, se puede ejecutar en CPU en cualquier servidor o dispositivo, integrándolo en un agente local.

## Benchmarks y rendimiento

El modelo se evaluó sobre un conjunto de prueba de 3.045 estados de decisión y un conjunto de validación de 2.931 estados. Los resultados son los siguientes:

| Métrica | Valor |
|---|---|
| Recall@1 (test) | 0.7685 |
| Recall@3 (test) | 0.9583 |
| Recall@3 (validación) | 0.9601 |
| Tasa de candidatos inválidos | 0.0000 |

Para comparación, una línea base de orden fijo de herramientas legales alcanzó un Recall@1 de 0.2335 y un Recall@3 de 0.4502 en el mismo conjunto de prueba. Estos resultados provienen de un corpus sintético de plantillas y oráculo, y no deben interpretarse como rendimiento en producción con datos reales.

## Requisitos de hardware

- Es un modelo MLP de dos capas con 4.096 características de entrada, por lo que su huella de memoria es mínima.
- Puede ejecutarse en CPU sin necesidad de GPU; no se requiere hardware especializado.
- El repositorio incluye `nomos.py`, un cargador autónomo que reproduce la arquitectura y el encoder, facilitando la integración en cualquier entorno con PyTorch instalado.
- No se han publicado datos de latencia o throughput, pero al ser un modelo de tamaño reducido se espera una latencia de milisegundos en CPU.
- Opciones de despliegue: cualquier servidor con PyTorch, integración en pipelines de agentes locales o servicios de inferencia ligeros.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada. El autor indica que es el primer baseline nano de la línea de enrutamiento, y se mencionan Pyrrho y Opsis como coprocesadores relacionados, pero no se ofrecen datos de rendimiento de ellos. La única comparación disponible es con el baseline de orden fijo de herramientas, que es notablemente inferior.

| Modelo | Función | Tamaño | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|---|
| nomos-v1-nano-g1 | Enrutamiento de herramientas | MLP pequeño | N/A | mixed-source-research-preview | Recall@1 0.7685 (sintético) |
| pyrrho-v1-nano-g1 | Clasificación para gobernanza RAG | No disponible | No disponible | mixed-source-research-preview | No disponible |
| Baseline de orden fijo | Orden fijo de herramientas | N/A | N/A | N/A | Recall@1 0.2335 |

## Limitaciones y advertencias

- Evaluación sintética: los resultados provienen de un corpus de plantillas y oráculo; no se ha establecido generalización a datos reales ni a trazas de maestros externos.
- Dependencia del proveedor de herramientas: el modelo requiere que el llamador suministre la lista de herramientas legales; no las descubre ni las valida.
- Vocabulario fijo de 19 herramientas: añadir una nueva herramienta requiere actualizar el dataset, los contratos, la matriz y reentrenar o adaptar el modelo.
- Solo inglés: el comportamiento en otros idiomas no está establecido.
- Sin ejecución de efectos secundarios: el modelo no ejecuta herramientas ni valida argumentos; es solo una capa de clasificación.
- No es adecuado para decisiones de alto riesgo sin una capa de gobernanza y validación externa.
- Licencia de investigación: la licencia `mixed-source-research-preview` implica restricciones para uso comercial no especificadas; se debe revisar antes de usar en producción.

## Enlaces

- Página del modelo en Hugging Face: [https://huggingface.co/yafitzdev/nomos-v1-nano-g1](https://huggingface.co/yafitzdev/nomos-v1-nano-g1)
- Repositorio GitHub de Pyrrho (modelo relacionado): [https://github.com/yafitzdev/pyrrho](https://github.com/yafitzdev/pyrrho)
- Página de Pyrrho en Hugging Face: [https://huggingface.co/yafitzdev/pyrrho-v1-nano-g1](https://huggingface.co/yafitzdev/pyrrho-v1-nano-g1)
