# xiq/Raon-1-nano-heretic

## Resumen

Raon-1-nano-heretic es una variante "decensurada" del modelo KRAFTON/Raon-1-nano, publicada por el usuario xiq en Hugging Face. Se trata de una ablación de pesos realizada con la herramienta Heretic (Arbitrary-Rank Ablation, ARA), un procedimiento automático y sin entrenamiento que reduce la tendencia del modelo a rechazar peticiones. El resultado son pesos completos fusionados (no un adaptador) que conservan la arquitectura y la interfaz del modelo base, pero con el comportamiento de seguridad debilitado de forma deliberada.

El modelo base Raon-1-nano es un transformer causal de aproximadamente 3.130 millones de parámetros (3,13 B), orientado a generación de texto conversacional. Al tratarse de una ablación de pesos, Raon-1-nano-heretic mantiene el mismo tamaño, la misma tokenización y el mismo código de arquitectura personalizado que el original, por lo que requiere `trust_remote_code=True` para cargarse con Transformers.

Su relevancia es acotada y muy específica: interesa a quienes investigan técnicas de ablación de rechazo, a desarrolladores que necesitan un modelo pequeño sin filtros de seguridad para entornos controlados, y a quienes estudian el compromiso entre reducción de rechazos y divergencia KL respecto al modelo original. No es un modelo nuevo ni un fine-tuning: es una modificación quirúrgica de los pesos del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (código personalizado, requiere `trust_remote_code=True`) |
| Parametros totales | 3.130.797.136 (3,13 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a GGUF/AWQ no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeta a la licencia del modelo base KRAFTON/Raon-1-nano) |
| Formato de pesos | safetensors (pesos completos fusionados, no adaptador) |

## Arquitectura y entrenamiento

Raon-1-nano-heretic hereda íntegramente la arquitectura del modelo base KRAFTON/Raon-1-nano: un transformer causal con código de arquitectura propio que exige cargarse con `trust_remote_code=True` y con versiones concretas de Transformers y Accelerate (las indicadas en la model card del base). No se ha reentrenado ni ajustado con datos: la model card es explícita en que no se usó ningún dataset de fine-tuning.

La modificación se realizó con Heretic, que implementa Arbitrary-Rank Ablation (ARA). El proceso ejecutó 100 ensayos de búsqueda de parámetros de ablación, evaluando cada candidato por su capacidad de reducir rechazos y por su divergencia KL respecto al modelo original. Se seleccionó la primera entrada del frente de Pareto ordenado (índice de ensayo 0), con un resultado declarado de 0/100 rechazos y una divergencia KL de 3,1252. Los pesos exportados son los pesos completos fusionados, no un adaptador de bajo rango.

## Capacidades

- Generación de texto conversacional en formato chat, usando `apply_chat_template` del tokenizador del base.
- Razonamiento y generación de código y matemáticas en la medida en que lo soporte el modelo base Raon-1-nano (no documentado en la información disponible).
- Comportamiento "decensurado": reducción deliberada de rechazos, con 0/100 rechazos declarados en la evaluación de Heretic.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre ablación de rechazo: el modelo sirve como caso de estudio reproducible de Heretic/ARA, permitiendo comparar el comportamiento del base frente al ablacionado con una KL de 3,1252 y 0/100 rechazos declarados.
- Evaluación de robustez de filtros de seguridad: útil para medir hasta qué punto una ablación de pesos degrada las salvaguardas de un modelo de 3,13 B y calibrar detectores de contenido en pipelines propios.
- Generación creativa sin restricciones en entornos controlados: escritura de ficción, guiones o material sensible donde el modelo base rechazaría la petición, siempre en un contexto de uso interno y con revisión humana.
- Prototipado local de asistentes conversacionales: con 3,13 B de parámetros y pesos safetensors de 6,3 GB en el repo, es viable desplegarlo en una GPU de consumo para pruebas de diálogo multi-turno.
- Red teaming y auditoría de modelos: emplearlo como contraparte "sin filtros" para comparar respuestas con el base y documentar diferencias de comportamiento en informes de seguridad.
- Experimentación académica sobre alineación: analizar la relación entre reducción de rechazos y divergencia KL, y estudiar qué capacidades se conservan o degradan tras la ablación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta las métricas del proceso de ablación de Heretic:

| Metrica | Valor |
|---|---|
| Ensayos de búsqueda | 100 |
| Ensayo seleccionado | Primera entrada del frente de Pareto (índice 0) |
| Rechazos | 0/100 |
| Divergencia KL respecto al base | 3,1252 |

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 6,3 GB solo para pesos, más overhead de activaciones y caché KV; presupuesto práctico de 8-10 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 3,2-3,5 GB de pesos; en 4 bits, en torno a 1,7-2 GB (estimaciones por tamaño, no verificadas para este modelo).
- GPU recomendadas: A100, H100 o L40S para despliegue con concurrencia; RTX 4090, RTX 3090 o RTX 4080 para inferencia individual en precisión completa.
- GPU de consumo: cabe en tarjetas con 8 GB o más en FP16 (RTX 3070/4060 Ti y superiores); en cuantización 4 bits podría caber en 4-6 GB, aunque no hay GGUF publicado en el repo.
- Opciones de despliegue: Transformers con `trust_remote_code=True` es la vía documentada; vLLM, TGI, llama.cpp u Ollama no están confirmados para este modelo por su código de arquitectura personalizado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xiq/Raon-1-nano-heretic | 3,13 B | no disponible | Ablación de rechazos sobre Raon-1-nano | no disponible (hereda la del base) | Hugging Face, safetensors |
| KRAFTON/Raon-1-nano | 3,13 B | no disponible | Modelo base original | no disponible | Hugging Face |
| Otras variantes heretic/abliterated de modelos pequeños | variable | variable | Ablación con Heretic u herramientas similares | variable | Hugging Face |

La comparación con alternativas de la misma categoría (otros modelos de ~3 B decensurados) no está disponible con datos verificables en la información proporcionada.

## Limitaciones y advertencias

- La reducción de rechazos no implica mayor precisión: el modelo puede seguir equivocándose, sesgarse o alucinar igual que el base.
- El comportamiento de seguridad se ha debilitado a propósito; puede producir contenido que el original rechazaría.
- No está destinado a uso por o cerca de menores, ni en entornos donde una salida sin filtrar pueda causar daño.
- Es un derivado del modelo base: la licencia y los términos de uso de KRAFTON/Raon-1-nano se aplican también a estos pesos, y no están documentados en la información disponible.
- Requiere `trust_remote_code=True` y versiones concretas de Transformers y Accelerate; la incompatibilidad de versiones puede impedir la carga.
- No hay información sobre idiomas soportados, longitud de contexto ni cuantizaciones publicadas, lo que limita la planificación de despliegue en producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria de su comportamiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xiq/Raon-1-nano-heretic
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-nano
- Herramienta Heretic: https://github.com/p-e-w/heretic
