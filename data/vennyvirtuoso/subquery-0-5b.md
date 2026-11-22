# vennyvirtuoso/subquery-0.5b

## Resumen

subquery-0.5b es un modelo de lenguaje de 494 millones de parámetros especializado en descomposición de consultas (query decomposition) para sistemas de generación aumentada por recuperación (RAG). Lo desarrolla el usuario vennyvirtuoso y se construye como un fine-tuning del modelo base Qwen2.5-0.5B-Instruct de Alibaba. Su función es recibir una pregunta compleja, comparativa o multi-hop y transformarla en un array JSON de sub-consultas atómicas, listas para lanzarse en paralelo contra un índice vectorial.

El modelo aborda un problema concreto en pipelines RAG: las consultas compuestas por varias preguntas o comparaciones recuperan peor información cuando se envían como un único embedding. Al descomponerlas en sub-consultas independientes, se mejora la cobertura de recuperación. La propuesta del autor es ofrecer esta funcionalidad con un modelo pequeño, determinista (decodificación greedy) y con salida JSON estrictamente válida, de modo que pueda desplegarse como microservicio de baja latencia.

La relevancia del modelo reside en su tamaño reducido (0,5B parámetros, ~1 GB de repositorio) y su licencia Apache 2.0, que permiten ejecutarlo en hardware modesto o incluso en el borde. El autor declara una tasa de parseo JSON válido del 100 % sobre el split de test y una media de 3,48 sub-consultas por pregunta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), fine-tuning de Qwen2.5-0.5B-Instruct |
| Parámetros totales | 494.032.768 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | no disponible explícitamente; pesos en safetensors, compatible con cuantización estándar (GGUF, bitsandbytes) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16 / fp16 en precisión mixta) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen2, obtenido mediante fine-tuning supervisado del checkpoint Qwen2.5-0.5B-Instruct. No se documentan cambios arquitectónicos respecto al modelo base: se trata de un ajuste de pesos sobre la misma estructura, con precisión mixta (bfloat16 / fp16). El autor indica que el checkpoint final está fusionado (standalone merged), es decir, sin adaptadores PEFT separados en la distribución publicada.

El entrenamiento se realizó sobre el dataset SubQuery-Decomp, descrito como un corpus multi-dominio de 10.000 pares con esquema forzado (schema-enforced) para la descomposición de consultas complejas. La tarea se formula como generación de un array JSON RFC-8259 de sub-consultas atómicas y deduplicadas, sin preámbulo conversacional ni bloques de código Markdown. El autor declara evaluación sobre splits de test disjuntos por grupo para evitar fuga de datos, aunque no se especifican detalles sobre el proceso de anotación, la composición lingüística del corpus ni si hubo etapas de RLHF o DPO.

## Capacidades

- Descomposición de consultas complejas, comparativas y multi-hop en sub-consultas atómicas.
- Generación de salida estructurada como array JSON válido (RFC-8259), sin texto adicional.
- Deduplicación de sub-consultas generadas.
- Soporte de plantilla de chat (rol system/user) heredado de Qwen2.5-Instruct.
- Generación determinista mediante decodificación greedy (`do_sample=False`).
- Uso como router de búsqueda en pipelines RAG con recuperación vectorial paralela.
- Integración con `transformers`, `sentence-transformers`, `peft` y `accelerate` según el autor.
- Capacidades multilingües: no disponibles (no documentadas para este fine-tuning).
- Tool calling, function calling y razonamiento multi-paso general: no disponibles como capacidades declaradas; el modelo está especializado en una única tarea.

## Casos de uso

- Descomposición de consultas en sistemas RAG: el modelo recibe la pregunta del usuario y devuelve un array de sub-consultas que se lanzan en paralelo contra el índice vectorial, mejorando la cobertura de recuperación en preguntas comparativas o multi-hop.
- Router de búsqueda en microservicios: con ~0,5B parámetros y salida JSON determinista, puede desplegarse como servicio intermedio entre el frontend y el motor de recuperación, con latencia declarada de ~924 ms por consulta en el entorno de evaluación del autor.
- Preprocesado de consultas en asistentes documentales: normaliza preguntas largas y ambiguas de usuarios en consultas atómicas antes de pasarlas a un retriever o a un modelo mayor.
- Etiquetado y generación de datos sintéticos: puede usarse para generar pares pregunta compleja / sub-consultas en la construcción de datasets de entrenamiento para retrievers.
- Despliegue en el borde o entornos con recursos limitados: su tamaño (~1 GB de repositorio) permite ejecución en CPU o GPU de gama baja para tareas de descomposición de consultas.
- Evaluación de pipelines de recuperación: al ser determinista, sirve como componente reproducible en tests A/B de estrategias de chunking o de embeddings.
- Filtrado previo en agentes: puede actuar como primer paso de un agente que decide qué sub-consultas lanzar antes de invocar herramientas de búsqueda.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test retenido:

| Métrica | Fine-tuned | Baseline zero-shot |
|---|---|---|
| Tasa de parseo JSON válido | 100,00 % | 98,00 % |
| Ganancia absoluta en cumplimiento JSON | +2,00 % | — |
| Solapamiento de tokens (Jaccard) | 1,0000 | 0,1600 |
| Tasa de generación multi-subconsulta | 100,00 % | — |
| Media de sub-consultas generadas | 3,48 | — |
| Latencia por consulta | 924,25 ms | — |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La latencia de 924,25 ms por consulta contrasta con la afirmación del autor de "sub-25ms" en la cabecera de la model card; no se especifica el hardware ni el lote usado en la medición.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16/fp16 para los pesos (494M parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 2-4 GB son suficientes.
- Cuantización a 8 bits: ~0,5 GB de pesos; a 4 bits: ~0,25 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también funciona en CPU para cargas moderadas.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 4 GB de VRAM; también en iGPU y en CPU.
- Opciones de despliegue: `transformers` (referencia del autor), `sentence-transformers`, `peft`, `accelerate`; vLLM, llama.cpp, Ollama y TGI son viables por ser un transformer Qwen2 estándar, aunque el autor no los documenta explícitamente.
- Latencia y throughput: el autor declara 924,25 ms por consulta en su entorno de evaluación; no se proporcionan datos de throughput por lote ni de hardware de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| subquery-0.5b | 494M | no disponible | Descomposición de consultas RAG | Apache 2.0 | Hugging Face |
| Qwen2.5-0.5B-Instruct | ~494M | 32K (modelo base) | Instrucciones generales | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32K (modelo base) | Instrucciones generales | Apache 2.0 | Hugging Face |
| SmolLM2-360M-Instruct | ~360M | 8K | Instrucciones generales | Apache 2.0 | Hugging Face |

La comparación con alternativas especializadas en descomposición de consultas no está disponible en la información proporcionada. Frente a los modelos generalistas de la tabla, subquery-0.5b ofrece una tarea acotada y salida JSON estricta, pero carece de la versatilidad y del contexto documentado de los modelos base.

## Limitaciones y advertencias

- Modelo altamente especializado: fuera de la tarea de descomposición de consultas su rendimiento no está documentado y probablemente sea inferior al de su modelo base.
- Riesgo de alucinación en las sub-consultas generadas: el modelo puede introducir términos no presentes en la consulta original; conviene validar la relevancia de las sub-consultas en producción.
- Idiomas soportados no documentados: no se especifica si el fine-tuning mantiene la cobertura multilingüe del modelo base Qwen2.5.
- Longitud de contexto no documentada para este checkpoint; se asume la del modelo base, pero no está confirmado.
- Latencia declarada de 924,25 ms por consulta, muy superior a la cifra de "sub-25ms" que aparece en la cabecera de la model card; la discrepancia no está explicada y debe considerarse un dato a validar.
- El dataset de entrenamiento (SubQuery-Decomp) y el proceso de anotación no están descritos en detalle, lo que dificulta evaluar sesgos y calidad de los datos.
- Sin descargas ni likes en Hugging Face en el momento de la consulta: no hay evidencia de uso en producción por terceros.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El modelo no declara capacidades de tool calling general, agentes autónomos ni razonamiento multi-paso más allá de la descomposición de consultas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/subquery-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento (referenciado): https://huggingface.co/datasets/SubQuery-Decomp
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- Documentación de Transformers pipelines: https://huggingface.co/docs/transformers/main_classes/pipelines
