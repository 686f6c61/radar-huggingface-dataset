# universalhomegarden/Agent

## Resumen

`universalhomegarden/Agent` es un ajuste fino (fine-tune) del modelo TinyLlama/TinyLlama-1.1B-Chat-v1.0, publicado por el usuario `universalhomegarden` en Hugging Face. Se trata, por tanto, de un modelo transformer decoder-only de aproximadamente 1.100 millones de parámetros, entrenado a partir de un modelo base conversacional ya existente y especializado sobre el dataset `markov-ai/cad-1000-hours`, cuyo contenido y composición no se documentan en la model card.

El problema que pretende resolver no está declarado explícitamente por el autor: la model card pública contiene únicamente el frontmatter YAML (licencia MIT, idioma inglés, dataset y modelo base) y ninguna sección descriptiva, de uso previsto, de entrenamiento o de evaluación. El nombre del repositorio ("Agent") y el identificador del dataset sugieren un enfoque hacia flujos agénticos o hacia datos de tipo CAD, pero no hay información verificable que lo confirme.

Su relevancia actual es limitada y de carácter exploratorio: cuenta con 0 descargas y 0 "likes", no declara pipeline y no publica benchmarks. Resulta útil únicamente como punto de partida para experimentación con modelos pequeños en inglés, o como ejemplo de fine-tune de TinyLlama, pero no como componente listo para producción sin una evaluación propia previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, heredada del modelo base); la model card no aporta detalles adicionales |
| Parámetros totales | 1,1 mil millones (heredado de TinyLlama-1.1B-Chat-v1.0) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base TinyLlama-1.1B-Chat-v1.0 declara 2.048 tokens |
| Tipos de cuantización | No se publican pesos cuantizados en el repositorio; al derivar de un modelo de 1,1B es convertible a GGUF (Q4_K_M, Q5_K_M, Q8_0) e int8/fp16 con herramientas estándar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio no detalla los archivos publicados) |
| Dataset de ajuste | `markov-ai/cad-1000-hours` (composición no documentada) |
| Modelo base | TinyLlama/TinyLlama-1.1B-Chat-v1.0 |
| Estado del repositorio | 0 descargas, 0 likes, sin pipeline declarado; creado el 25-10-2026 y actualizado el 25-10-2026 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only de tipo Llama con normalización RMSNorm, activación SwiGLU, embeddings rotatorios (RoPE) y atención causal estándar, con 1,1B parámetros y un vocabulario de 32.000 tokens (características públicas de TinyLlama-1.1B-Chat-v1.0, no replicadas en esta model card). El contexto declarado por el modelo base es de 2.048 tokens, muy por debajo de los estándares actuales.

No se dispone de información sobre el proceso de ajuste: la model card no indica el número de tokens de entrenamiento, la composición del dataset `markov-ai/cad-1000-hours`, la técnica empleada (SFT, LoRA/QLoRA, DPO, RLHF) ni los hiperparámetros. Tampoco se documenta si hubo evaluación posterior, filtrado de datos o alguna innovación técnica (decodificación especulativa, atención lineal, mezcla de expertos). Cualquier afirmación sobre el pipeline de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base TinyLlama-1.1B-Chat-v1.0.
- Razonamiento básico y respuesta a instrucciones de complejidad baja, limitado por el tamaño del modelo (1,1B parámetros).
- Generación de código sencillo, coherente con la capacidad de un modelo de esta escala; no hay evaluación publicada que lo respalde.
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés.
- Soporte de tool calling / function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado, pese a que el nombre del repositorio lo sugiera.
- Modo "thinking", visión, audio u otras capacidades especiales: no disponibles.
- Ajuste específico sobre el dataset `markov-ai/cad-1000-hours`: el efecto real de este ajuste sobre el comportamiento del modelo no está descrito ni evaluado.

## Casos de uso

- Prototipado rápido en local: al ocupar aproximadamente 2,2 GB en fp16, permite validar pipelines de generación de texto en una sola GPU consumer o incluso en CPU antes de migrar a un modelo mayor.
- Desarrollo y depuración de infraestructura de inferencia: sirve como modelo de pruebas para configurar vLLM, TGI o llama.cpp sin consumir recursos significativos.
- Clasificación y etiquetado de texto en inglés: con ajuste adicional o prompting few-shot, puede emplearse para tareas de categorización simple donde la latencia importa más que la precisión máxima.
- Generación de respuestas cortas en asistentes de dominio acotado: adecuado para diálogos de uno o dos turnos con contexto inferior a 2.048 tokens, siempre que se valide la calidad con un conjunto de evaluación propio.
- Experimentación académica sobre fine-tuning: al ser un derivado de TinyLlama con licencia MIT, es un caso de estudio útil para analizar el efecto de datasets especializados en modelos de baja escala.
- Despliegue en dispositivos con recursos limitados: cuantizado a Q4_K_M (aproximadamente 0,7 GB), puede ejecutarse en entornos edge, Raspberry Pi 5 o portátiles sin GPU dedicada, para tareas de generación muy acotadas.
- Base para experimentos de agentes en inglés: si se confirma la naturaleza de los datos de ajuste, podría usarse como generador de acciones en bucles agénticos simples, con validación humana obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K, MT-Bench ni ninguna otra métrica, y el autor no aporta comparaciones con el modelo base ni con alternativas. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de 1,1B parámetros, no medido): aproximadamente 2,2 GB de pesos en fp16 más caché KV; en la práctica, unos 3-4 GB para contextos de 2.048 tokens.
- Cuantización int8: aproximadamente 1,2 GB de pesos; Q4_K_M en GGUF: aproximadamente 0,7 GB.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). El modelo está muy sobredimensionado en infraestructura para su escala; no requiere GPU de centro de datos.
- Compatibilidad con GPU consumer: sí, en todas las GPU consumer modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: transformers (PyTorch), vLLM, TGI y llama.cpp/Ollama (requiere convertir los pesos a GGUF, ya que el repositorio no publica cuantizaciones).
- Latencia y throughput: no se han publicado mediciones. En términos orientativos, un modelo de 1,1B en fp16 sobre una RTX 4090 ofrece decenas o cientos de tokens por segundo en modo batch con vLLM, y del orden de decenas de tokens por segundo en CPU con llama.cpp Q4; son estimaciones de orden de magnitud, no cifras verificadas para este repositorio.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus respectivas model cards públicas; este repositorio no publica ninguna evaluación, por lo que la comparación de rendimiento no es posible.

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Evaluación publicada |
|---|---|---|---|---|---|
| `universalhomegarden/Agent` | 1,1B | No disponible (base: 2.048) | MIT | Inglés | No |
| TinyLlama/TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2.048 | Apache 2.0 | Inglés (principalmente) | Sí, limitada |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 | Apache 2.0 | Multilingüe | Sí |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 | Apache 2.0 | Inglés y multilingüe parcial | Sí |

Frente a estas alternativas, `Agent` no ofrece ventajas documentadas: parte de un modelo base con contexto de 2.048 tokens, sin evaluación, sin cuantizaciones publicadas y con una model card vacía. Su único rasgo diferencial es el ajuste sobre un dataset no descrito y una licencia MIT (frente a Apache 2.0 de los modelos citados).

## Limitaciones y advertencias

- Documentación inexistente: la model card solo contiene el frontmatter YAML; no hay información sobre uso previsto, datos, entrenamiento ni evaluación. Cualquier uso en producción exige una evaluación propia completa.
- Riesgo de alucinación: elevado, tanto por el tamaño del modelo (1,1B) como por la ausencia de métricas de fidelidad o de alineación documentadas.
- Sesgos: no evaluados. Los sesgos del modelo base TinyLlama (entrenado principalmente con datos web en inglés) se heredan y pueden verse alterados, sin control documentado, por el dataset de ajuste.
- Limitación de idioma: solo declara inglés; su uso en castellano no está soportado ni validado.
- Limitación de contexto: el modelo base maneja 2.048 tokens; no se documenta si el ajuste lo amplía. Los flujos agénticos o de documento largo no son viables sin truncado agresivo.
- Licencia: el repositorio declara MIT, pero el modelo base TinyLlama se distribuye bajo Apache 2.0, que exige conservar avisos de atribución; conviene revisar la compatibilidad antes de un uso comercial. La licencia del dataset `markov-ai/cad-1000-hours` no se indica en la información disponible y debe verificarse por separado, ya que puede imponer restricciones adicionales.
- Procedencia dudosa para producción: 0 descargas, 0 likes, sin pipeline declarado y con fecha de creación y actualización separadas por dos minutos, lo que sugiere una publicación no mantenida.
- Reproducibilidad: al no especificarse formato de pesos, hiperparámetros ni script de entrenamiento, no es posible reproducir el ajuste.
- Advertencia de seguridad: al ser un modelo pequeño sin alineación documentada, no debe exponerse directamente a usuarios finales sin filtros de entrada y salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/universalhomegarden/Agent
- Modelo base TinyLlama-1.1B-Chat-v1.0: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Dataset de ajuste: https://huggingface.co/datasets/markov-ai/cad-1000-hours
- Repositorio oficial de TinyLlama: https://github.com/jzhang38/TinyLlama
- Paper de TinyLlama (arXiv:2401.02385): https://arxiv.org/abs/2401.02385
- Otro modelo del mismo autor (Ornith-1.0-9B): https://huggingface.co/universalhomegarden/Ornith-1.0-9B
- Space del mismo autor (OSINT_DATABASE): https://huggingface.co/spaces/universalhomegarden/OSINT_DATABASE
