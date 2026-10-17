# whynotBeTop/sn92-df-dm9b

## Resumen

sn92-df-dm9b es un ajuste fino del modelo alibiserikbay/JevK5-9B (8.953.803.264 parámetros según los pesos safetensors del repositorio) publicado por el usuario whynotBeTop. No es un modelo de propósito general: está especializado en una única tarea de decisión tipada, el caso de uso `demand_forecasting` de la pista REAX de la red SN92, donde debe leer un prompt fijo (`reax-decide-prompt/1`) y devolver como respuesta una única letra de opción.

Técnicamente se trata de un LoRA fusionado en bf16 sobre la revisión `d6521a18a86999190e9d775c915af3d6d6772fc4` del modelo base, no de un entrenamiento desde cero. El repositorio ocupa 17,9 GB, el formato de pesos es safetensors y la licencia declarada es Apache-2.0, lo que en principio habilita el uso comercial, siempre que se respeten las condiciones del modelo base y de los conjuntos de datos auxiliares.

Su relevancia es acotada y muy específica: es un artefacto ligado a un subred concreto, con cero descargas y cero likes en el momento de la consulta, sin pipeline declarado y sin model card más allá de la descripción del proceso de entrenamiento. No hay información publicada sobre longitud de contexto, idiomas soportados, hiperparámetros del ajuste ni resultados de benchmarks, por lo que cualquier evaluación seria exige reproducir la inferencia por cuenta propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la etiqueta del repositorio indica `qwen3_5_text`) |
| Parámetros totales | 8.953.803.264 (~8,95 mil millones) |
| Parámetros activos | No aplica según la información disponible (no se declara arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponibles en el repositorio; al ser un transformer denso de ~9B son aplicables bf16, int8 y los formatos GGUF habituales (Q4, Q5, Q8) mediante herramientas externas |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionado) |
| Modelo base | alibiserikbay/JevK5-9B (revisión `d6521a18a86999190e9d775c915af3d6d6772fc4`) |
| Tamaño del repositorio | 17,9 GB |
| Fecha de creación | 2026-10-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de alibiserikbay/JevK5-9B, un transformer denso de aproximadamente 8,95 mil millones de parámetros. La etiqueta `qwen3_5_text` del repositorio sugiere una arquitectura de la familia Qwen 3.5 en su variante solo texto, pero la información disponible no confirma la configuración exacta de capas, atención ni vocabulario, de modo que ese dato debe tomarse como indicio y no como especificación verificada. Sobre ese modelo base se aplicó un ajuste LoRA que posteriormente se fusionó en los pesos, dando como resultado un único checkpoint en bf16.

El entrenamiento se realizó específicamente para la pista `demand_forecasting` de REAX (SN92), con el prompt fijo del validador (`reax-decide-prompt/1`) y una lectura de salida de un solo token correspondiente a la letra de la opción elegida. Los datos empleados combinan tres fuentes: el split de entrenamiento de `demand_forecasting` del dataset decisionmodels/sn92-specialists (CC-BY-4.0), junto con los splits de train y dev de otras categorías; ítems sintéticos de previsión de demanda generados por reglas propias con etiquetas calculadas exactamente; y datos públicos de decisión tipada bajo Apache-2.0, en concreto `totum-labs/plumb-data` (split `kev_hard` de train) y `crh225/plumb-decisions` (train). El split de dev de `demand_forecasting` se reservó para evaluación y no se usó en entrenamiento. No se documenta el uso de RLHF, DPO ni ningún otro ajuste por preferencias, y tampoco se publican el rango del LoRA, el alfa, la tasa de aprendizaje, el número de épocas ni la composición porcentual del dataset.

## Capacidades

- Decisión de opción única: dado el prompt fijo de REAX, el modelo emite una letra de opción como salida de un solo token.
- Previsión de demanda como tarea de decisión tipada, restringida al caso de uso `demand_forecasting` de la pista SN92.
- Generalización limitada a categorías relacionadas: parte del entrenamiento incluye splits de train y dev de otras categorías del dataset `sn92-specialists`, aunque no se especifica cuáles ni con qué peso.
- Ajuste al formato del validador: el comportamiento está anclado a `reax-decide-prompt/1`; no hay evidencia de que mantenga un rendimiento equivalente con plantillas de prompt distintas.
- Soporte de tool calling o function calling: no disponible, sin evidencia en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso: no disponible, sin evidencia en la información proporcionada.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (modo de razonamiento explícito, visión, audio): no disponibles.

## Casos de uso

- Inferencia de mineros y validadores en SN92 (REAX): el modelo se ejecuta contra el prompt fijo `reax-decide-prompt/1` y devuelve la letra de opción que el validador compara con la etiqueta correcta; es exactamente el escenario para el que se entrenó.
- Previsión de demanda en retail: alimentar el prompt con el histórico de ventas y las opciones candidatas para que el modelo seleccione el rango de demanda esperado, integrándolo como componente de decisión dentro de un sistema de planificación que gestione el resto del pipeline.
- Planificación de reposición de inventario: usar la decisión del modelo como señal de entrada para reglas de reaprovisionamiento, con umbrales de seguridad definidos fuera del modelo para compensar la ausencia de métricas publicadas de exactitud.
- Previsión de carga o consumo energético: aplicar el mismo esquema de decisión tipada a series de consumo, siempre que se reformule el problema como elección entre opciones discretas y se valide previamente el rendimiento fuera de dominio.
- Dimensionamiento de personal y turnos: emplear la opción emitida como estimación cualitativa de demanda para turnos, combinada con un modelo estadístico clásico que aporte la magnitud numérica.
- Baseline en investigación sobre modelos de decisión especializados: sirve como punto de comparación reproducible frente a otros especialistas de SN92 o frente al modelo base sin ajustar, dado que el prompt y el formato de lectura están fijados.
- Evaluación de robustez de prompts de decisión: al estar anclado a una plantilla concreta, es útil para medir cuánto se degrada un modelo especializado cuando se varía el formato de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas del split de dev de `demand_forecasting` ni comparaciones con otros modelos, y no se ha publicado ninguna evaluación independiente del repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 8,95 mil millones de parámetros y no de mediciones publicadas: en bf16 o fp16 los pesos ocupan unos 17,9 GB, a los que hay que sumar caché KV y activaciones, por lo que conviene contar con 20-24 GB en contextos cortos; en int8 unos 9-10 GB; en GGUF Q4_K_M en torno a 5,5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para bf16 con contexto largo y despliegue concurrente; RTX 4090 o RTX 3090 (24 GB) para bf16 con contexto moderado; RTX 4080 (16 GB) o RTX 4060 Ti (16 GB) para int8 o Q5/Q6.
- Cabe en GPU de consumo: sí, en tarjetas de 16 GB o más con cuantización de 8 bits o inferior, y en tarjetas de 8-12 GB con cuantizaciones Q4 y ventanas de contexto reducidas. En bf16 requiere 24 GB o más.
- Opciones de despliegue: transformers de Hugging Face para carga directa de safetensors; vLLM, SGLang o TGI para servicio con batching continuo; llama.cpp u Ollama previa conversión a GGUF. La salida de un solo token hace que la latencia dependa casi por completo del prefill del prompt.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de respuesta por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| sn92-df-dm9b | 8,95B | No disponible | Apache-2.0 | Safetensors en Hugging Face | Sin benchmarks publicados |
| alibiserikbay/JevK5-9B (base) | No disponible | No disponible | No disponible | Safetensors en Hugging Face | No disponible |
| Llama 3.1 8B | ~8,03B | 128.000 tokens | Llama 3.1 Community License | Safetensors y GGUF | Datos públicos del fabricante; no comparable con esta ficha |
| Qwen3-8B | ~8,2B | 32.768 tokens nativos, ampliable con YaRN | Apache-2.0 | Safetensors y GGUF | Datos públicos del fabricante; no comparable con esta ficha |

Los datos de Llama 3.1 8B y Qwen3-8B proceden de información pública general de sus fabricantes y no se han verificado contra sus model cards originales en el contexto de esta ficha. La comparación solo es significativa en tamaño y licencia: sn92-df-dm9b es un especialista de decisión, no un modelo de propósito general, y no existe ningún benchmark común publicado que permita situarlo frente a estas alternativas.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para un prompt fijo (`reax-decide-prompt/1`) y una tarea concreta; fuera de ese formato no hay garantía de comportamiento coherente.
- Salida restringida: emite una letra de opción, no texto libre ni valores numéricos de demanda, por lo que no sirve por sí solo para producir un pronóstico cuantitativo.
- Riesgo de alucinación: en una tarea de elección cerrada el fallo se manifiesta como selección de una opción incorrecta, no como texto inventado; no existen métricas de exactitud publicadas que permitan acotar ese riesgo.
- Sesgos: no evaluados. El modelo hereda los sesgos del dataset `sn92-specialists`, de los generadores sintéticos basados en reglas y de los datos públicos de decisión tipada empleados en el entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está documentada, por lo que prompts largos pueden truncarse sin aviso claro.
- Limitaciones de idioma: no se especifican los idiomas soportados; el prompt del validador está en inglés y el comportamiento en castellano es desconocido.
- Procedencia oscura del ajuste: no se publican hiperparámetros del LoRA, recetas de entrenamiento ni métricas de validación, lo que dificulta auditar o reproducir el resultado.
- Adopción nula: cero descargas, cero likes y ningún pipeline declarado, lo que implica ausencia de validación por parte de terceros.
- Licencia: el repositorio se declara Apache-2.0, lo que permite uso comercial, pero las fuentes de datos tienen licencias propias (CC-BY-4.0 en `sn92-specialists`, Apache-2.0 en los conjuntos de plumb) cuya atribución debe respetarse. La licencia del modelo base alibiserikbay/JevK5-9B no aparece en la información proporcionada y debe comprobarse antes de cualquier despliegue en producción.
- Uso en producción: dado que no hay benchmarks, contexto declarado ni garantías de robustez, cualquier integración debería ir precedida de una evaluación propia sobre datos representativos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whynotBeTop/sn92-df-dm9b
- Modelo base: https://huggingface.co/alibiserikbay/JevK5-9B
- Dataset de especialistas de SN92: https://huggingface.co/datasets/decisionmodels/sn92-specialists
- Datos de decisión tipada (Apache-2.0): https://huggingface.co/datasets/totum-labs/plumb-data
- Datos de decisión tipada (Apache-2.0): https://huggingface.co/datasets/crh225/plumb-decisions
- Paper, blog, repositorio de código o demo: no disponible en la información proporcionada.
