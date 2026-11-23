# Tileward-Inc/Tileward-GLM-5.3-Flash

## Resumen

Tileward-GLM-5.3-Flash es una compresión del modelo GLM-5.3-Flash de Z.ai, desarrollada por Tileward-Inc. El modelo original es un transformer de tipo mixture-of-experts (MoE) orientado a generación de texto y agentes de código; Tileward lo ha recomprimido hasta reducir su tamaño en disco un 68 % (3,1x) respecto a los pesos en BF16 y un 38 % (1,6x) respecto a la release FP8 oficial de Z.ai, manteniendo un rendimiento equivalente en la evaluación DeepSWE v1.1 (64,6 % frente al 63,4 % reportado por Z.ai para el original).

La compresión reduce el peso en disco de 642,65 GB (BF16) a 204,45 GB, lo que permite ejecutar todos los pesos en tan solo dos tarjetas gráficas, un requisito mucho más asequible que el del modelo original. El acuerdo de siguiente palabra con el original de 16 bits es del 88,8 %, lo que indica una degradación moderada pero no despreciable en la distribución de salida.

Es relevante porque aborda uno de los principales cuellos de botella de los modelos MoE grandes: el coste de hardware para inferencia en producción. Sin embargo, los pesos no se publican en Hugging Face; el acceso es bajo petición, lo que limita su evaluación independiente y su adopción directa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE), basada en zai-org/GLM-5.3-Flash-BF16 |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Compresión propietaria de Tileward (pesos en 204,45 GB); release FP8 de referencia de Z.ai (328,3 GB) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (pesos no publicados en Hugging Face) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del GLM-5.3-Flash de Z.ai, que la model card identifica como MoE (tag `moe`). No se dispone de detalles sobre el número de parámetros totales o activos, la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron técnicas de RLHF o DPO; esa información corresponde al modelo base y no se reproduce en la documentación de Tileward.

La innovación técnica de esta ficha es el método de compresión propietario de Tileward, que reduce el peso en disco a 204,45 GB manteniendo el rendimiento en DeepSWE v1.1. La model card reporta un 88,8 % de acuerdo de siguiente palabra con el original de 16 bits, lo que sugiere que la compresión introduce divergencias en la distribución de probabilidad, aunque el rendimiento agregado en la tarea de código se mantiene dentro del margen del original. No se documentan técnicas de decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y razonamiento, heredados del modelo base GLM-5.3-Flash.
- Orientación a tareas de código y agentes de ingeniería de software, evidenciada por la evaluación DeepSWE v1.1 (113 tareas).
- Ejecución de agentes multi-paso en entornos de desarrollo, según el enfoque del artículo de investigación de Tileward.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades de visión o audio: no disponible.
- Modo thinking explícito: no disponible.

## Casos de uso

- Agentes de código en producción: el modelo mantiene un 64,6 % en DeepSWE v1.1, por lo que puede emplearse en pipelines de resolución automática de tareas de ingeniería de software donde se requiera un agente que lea, modifique y valide código en repositorios reales.
- Despliegue en infraestructura de dos GPU: al caber entero en dos tarjetas, es adecuado para equipos que no pueden costear el clúster necesario para el original de 642,65 GB, manteniendo acceso a un MoE de gran tamaño.
- Evaluación comparativa de compresión: útil como referencia para investigar el impacto de la cuantización agresiva en tareas de código, comparando el 88,8 % de acuerdo de siguiente palabra con el rendimiento en DeepSWE.
- Servicio de API compatible con OpenAI: la plataforma de Tileward expone el modelo en `https://api.tileward.com/v1`, lo que permite integrarlo en aplicaciones existentes que ya usan el cliente de OpenAI sin cambiar el código de integración.
- Prototipado con crédito inicial: cada cuenta de app.tileward.com incluye 25 USD de crédito sin tarjeta, lo que facilita pruebas de concepto de agentes de código antes de comprometer infraestructura propia.
- Investigación sobre eficiencia de modelos: el artículo de Tileward documenta la metodología de compresión, lo que permite reproducir o contrastar el enfoque en otros MoE.

## Benchmarks y rendimiento

| Modelo | Tamaño en disco | DeepSWE v1.1 (113 tareas) |
|---|---|---|
| GLM-5.3-Flash (original, BF16) | 642,65 GB | 63,4 % (reportado por Z.ai) |
| GLM-5.3-Flash FP8 (Z.ai) | 328,3 GB | no disponible |
| Tileward-GLM-5.3-Flash | 204,45 GB | 64,6 % |

| Métrica adicional | Tileward-GLM-5.3-Flash |
|---|---|
| Acuerdo de siguiente palabra con el original de 16 bits | 88,8 % |
| Tarjetas necesarias con todos los pesos en GPU | 2 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 204,45 GB, por lo que se necesita un mínimo de 204,45 GB de VRAM para mantener todos los pesos en GPU, más el espacio para caché KV y activaciones.
- GPU recomendadas: la model card indica que el modelo cabe en dos tarjetas con todos los pesos en ellas; no se especifican modelos concretos. Dos GPU con 141 GB (H200) o 192 GB (B200) cubrirían el requisito con margen, pero no se confirma en la documentación.
- Cabe en consumer GPU: no, 204,45 GB excede la VRAM de cualquier GPU de consumo actual (RTX 4090: 24 GB).
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. La vía oficial es la API compatible con OpenAI de Tileward.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DeepSWE v1.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-GLM-5.3-Flash | no disponible | no disponible | 64,6 % | MIT | Bajo petición |
| GLM-5.3-Flash (BF16, Z.ai) | no disponible | no disponible | 63,4 % | MIT | Pesos públicos |
| GLM-5.3-Flash FP8 (Z.ai) | no disponible | no disponible | no disponible | MIT | Pesos públicos |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Los pesos no se publican en Hugging Face: el acceso requiere solicitar una reunión con un ingeniero de Tileward, lo que impide auditoría independiente, despliegue autónomo y verificación de la licencia MIT sobre los pesos derivados.
- El acuerdo de siguiente palabra con el original es del 88,8 %, lo que implica que aproximadamente una de cada nueve predicciones diverge del modelo de 16 bits; en tareas sensibles a la distribución exacta de tokens esto puede degradar la calidad.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del modelo base en la información disponible.
- La licencia MIT del modelo base se mantiene en esta ficha, pero al no publicarse los pesos no es posible confirmar que la compresión respete los términos de la licencia original.
- El rendimiento en DeepSWE v1.1 es una única métrica de código; no hay evidencia publicada sobre razonamiento general, matemáticas o multilingüismo.
- El uso en producción depende de la API de Tileward, lo que introduce dependencia de un proveedor externo y posibles costes recurrentes tras agotar el crédito inicial de 25 USD.
- No se especifican requisitos de hardware concretos más allá de "dos tarjetas", lo que dificulta planificar el despliegue.

## Enlaces

- [Tileward-GLM-5.3-Flash en Hugging Face](https://huggingface.co/Tileward-Inc/Tileward-GLM-5.3-Flash)
- [Modelo base: zai-org/GLM-5.3-Flash-BF16](https://huggingface.co/zai-org/GLM-5.3-Flash-BF16)
- [Artículo de investigación: We shrank GLM-5.3-Flash by 68%](https://tileward.com/research/a-smaller-coding-agent/)
- [Metodología de evaluación](https://tileward.com/evals/#compressed-model-glm)
- [Investigación de Tileward](https://tileward.com/research/)
- [Plataforma y API](https://app.tileward.com/?join=explore)
- [Sitio de Tileward](https://tileward.com)
