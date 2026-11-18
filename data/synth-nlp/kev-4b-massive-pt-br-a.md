# Synth-NLP/kev-4b-massive-pt-br-A

## Resumen

Kev-4b-massive-pt-br-A es un ajuste fino tipo delta (LoRA más una cabeza pointer) sobre el modelo base jaredpalmer/kev-4b, un modelo de decisión de 4.000 millones de parámetros. Lo desarrolla Synth-NLP como parte de un experimento controlado que compara el rendimiento de datos sintéticos generados por una pipeline agéntica frente a datos reales, evaluando modelos de decisión de distintos tamaños (Laya, Kev-0.8B, 4B y 9B). La tarea concreta es la clasificación de intención en portugués de Brasil sobre el conjunto MASSIVE pt-BR, eligiendo entre 20 opciones por frase.

El modelo se entrenó exclusivamente con las 5.405 frases reales del MASSIVE pt-BR (brazo A del experimento), cubriendo 30 intenciones vistas durante el entrenamiento. La base permanece congelada en bf16 y solo se actualizan los adaptadores LoRA y la cabeza de selección, lo que da como resultado un repositorio de apenas 0,2 GB. En validación alcanza una precisión de 0,935 en intenciones vistas y 0,847 en intenciones no vistas (escenarios reservados que nunca aparecen en el entrenamiento), promediando tres sorteos de 20 opciones.

Su relevancia es doble: por un lado, ofrece un punto de referencia reproducible para clasificación de intenciones en portugués con un conjunto de opciones amplio (20 candidatas, no una clasificación cerrada); por otro, forma parte de una comparativa metodológica sobre la utilidad de datos sintéticos en modelos de decisión de distintos tamaños. La licencia Apache 2.0 facilita su reutilización comercial, aunque el uso previsto es muy específico y no cubre generación de texto libre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base jaredpalmer/kev-4b) con adaptador LoRA y cabeza pointer para selección entre opciones |
| Parametros totales | 4B en el modelo base; el delta LoRA y la cabeza pointer añaden un número no disponible de parámetros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el entrenamiento se realizó en bf16 con la base congelada |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador delta; repo de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo parte de jaredpalmer/kev-4b, un modelo de decisión de 4B parámetros, y se ajusta mediante un delta compuesto por LoRA más una cabeza pointer que selecciona la intención correcta entre un conjunto de 20 opciones por frase. La base se mantiene congelada en bf16 y solo se entrenan los adaptadores, lo que explica el reducido tamaño del repositorio (0,2 GB) frente a los pesos completos del modelo original.

El entrenamiento se ejecutó con el comando `python -m kev.train --init_from jaredpalmer/kev-4b`, con learning rate 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0. Se usaron las 5.405 frases reales del MASSIVE pt-BR correspondientes al brazo A, con las mismas líneas y las mismas 20 opciones que el modelo Laya del mismo brazo. Los aumentos propios de Kev se desactivaron: no se añadió la opción "ninguna de las anteriores" ni distractores adicionales. No se especifica en la información disponible si hubo fases de RLHF o DPO, ni el volumen total de tokens de entrenamiento más allá del número de frases indicado.

## Capacidades

- Clasificación de intención en portugués de Brasil seleccionando entre 20 opciones candidatas por frase.
- Manejo de intenciones vistas en entrenamiento (30 intenciones del MASSIVE pt-BR) con precisión de 0,935 en validación.
- Generalización a intenciones no vistas (escenarios reservados) con precisión de 0,847 en validación.
- Decisión sobre un conjunto amplio de opciones (20 por frase), no limitada a una clasificación cerrada de etiquetas fijas.
- Servicio mediante API System One a través de `python -m kev.serve --run <repo>`, con el mismo protocolo que el modelo Jev.
- No se documentan capacidades de generación de texto libre, tool calling, razonamiento multi-paso, agentes, visión ni audio en la información disponible.

## Casos de uso

- Enrutamiento de consultas en asistentes conversacionales en portugués: dado un mensaje de usuario y un conjunto de 20 intenciones candidatas, el modelo selecciona la más probable para dirigir la conversación al flujo adecuado, aprovechando su precisión de 0,935 en intenciones vistas.
- Clasificación de tickets de soporte: integrado en un pipeline de atención al cliente, permite asignar cada ticket a una de las 20 categorías disponibles antes de derivarlo al equipo correspondiente.
- Detección de intenciones emergentes: gracias a su rendimiento de 0,847 en intenciones no vistas, puede emplearse como señal para identificar consultas que no encajan en las categorías habituales y requieren revisión manual.
- Evaluación comparativa de datos sintéticos: sirve como brazo de control (datos reales) en el experimento de Synth-NLP frente a los brazos entrenados con datos generados por la pipeline agéntica, permitiendo medir la brecha entre ambos enfoques.
- Baseline para investigación en modelos de decisión: al ser un delta LoRA pequeño y reproducible (semilla 0, hiperparámetros documentados), facilita la replicación de experimentos y la comparación entre tamaños de modelo (0.8B, 4B, 9B).
- Prototipado rápido de clasificadores de intención en pt-BR: el formato delta de 0,2 GB permite cargar el adaptador sobre la base y desplegar el servicio con el comando documentado, sin necesidad de reentrenar el modelo completo.
- Filtrado previo en pipelines de moderación o triaje: la selección entre 20 opciones puede usarse como primera etapa para etiquetar grandes volúmenes de mensajes antes de un análisis más costoso.

## Benchmarks y rendimiento

| Conjunto de evaluación | Métrica | Resultado |
|---|---|---|
| MASSIVE pt-BR, validación, intenciones vistas | Precisión (media de 3 sorteos, 20 opciones) | 0,935 |
| MASSIVE pt-BR, validación, intenciones no vistas (escenarios reservados) | Precisión (media de 3 sorteos, 20 opciones) | 0,847 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo base de 4B en bf16 requiere del orden de 8 GB solo para los pesos, a lo que hay que sumar el adaptador LoRA y la cabeza pointer; en cuantización de 8 bits bajaría a unos 4-5 GB y en 4 bits a unos 2,5-3 GB, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponible. El entrenamiento se realizó en bf16, lo que requiere GPUs con soporte de bf16 (por ejemplo, serie A100/H100 o RTX 30xx/40xx en adelante), pero no se documentan requisitos mínimos.
- Cabe en GPU de consumo: no confirmado; por tamaño del modelo base (4B) es plausible en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: el autor documenta el servicio mediante `uv run --extra serve python -m kev.serve --run <este repo>`, con API System One. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Precisión en MASSIVE pt-BR | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Synth-NLP/kev-4b-massive-pt-br-A | 4B (base) + delta LoRA | No disponible | Clasificación de intención, 20 opciones | 0,935 vistas / 0,847 no vistas | Apache 2.0 | Hugging Face |
| Laya (mismo brazo A) | No disponible | No disponible | Clasificación de intención, 20 opciones | No disponible en esta ficha | No disponible | Referenciado en el experimento |
| Kev-0.8B | 0,8B | No disponible | Clasificación de intención | No disponible en esta ficha | No disponible | Referenciado en el experimento |
| Kev-9B | 9B | No disponible | Clasificación de intención | No disponible en esta ficha | No disponible | Referenciado en el experimento |

La información disponible solo proporciona los resultados del brazo A de este modelo; no se incluyen las cifras de los demás brazos ni de los modelos de otros tamaños, por lo que la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en clasificación de intención en portugués de Brasil; no es un modelo de propósito general y no se documentan capacidades de generación libre.
- El entrenamiento cubre 30 intenciones vistas; el rendimiento cae de 0,935 a 0,847 en intenciones no vistas, lo que indica una generalización limitada a escenarios fuera de la distribución de entrenamiento.
- Los aumentos de datos propios de Kev se desactivaron (sin opción "ninguna de las anteriores" ni distractores), por lo que el modelo puede no manejar bien frases que no correspondan a ninguna de las 20 opciones presentadas.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni evaluaciones de robustez más allá de la validación del MASSIVE pt-BR.
- El repositorio contiene únicamente el delta (0,2 GB); es necesario descargar el modelo base jaredpalmer/kev-4b para su uso.
- No se especifican la longitud de contexto soportada ni los formatos de cuantización validados, lo que limita la planificación de despliegues en producción.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base jaredpalmer/kev-4b, no detallada en la información disponible.
- El modelo se creó y actualizó en noviembre de 2026 y cuenta con 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/kev-4b-massive-pt-br-A
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
- Conjunto de datos MASSIVE pt-BR: no disponible en la información proporcionada
- Paper o blog del experimento de Synth-NLP: no disponible en la información proporcionada
- Repositorio de código del pipeline de entrenamiento (`kev.train`, `kev.serve`): no disponible en la información proporcionada
