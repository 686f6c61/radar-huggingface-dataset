# tartuNLP/Llama-3.1-EstLLM-70B-Reward-TehisaruBaromeeter

## Resumen

Llama-3.1-EstLLM-70B-Reward-TehisaruBaromeeter es un modelo de recompensa (reward model) desarrollado por tartuNLP, el grupo de procesamiento de lenguaje natural de la Universidad de Tartu (Estonia). Se construye mediante fine-tuning supervisado sobre el modelo instructivo tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826, que a su vez deriva de la familia Llama 3.1 de Meta. El modelo se publica con la etiqueta `text-classification` y está diseñado para puntuar respuestas generadas por modelos de lenguaje, una pieza habitual en pipelines de alineamiento como RLHF o RLAIF.

El nombre "Tehisaru Baromeeter" (barómetro de inteligencia artificial en estonio) sugiere su uso previsto como evaluador de calidad de respuestas en estonio e inglés. El modelo se entrena sobre el dataset nvidia/HelpSteer3, un corpus de preferencias humanas orientado a la evaluación de respuestas. Con 69.503.041.536 parámetros (aproximadamente 70B), es un reward model de gran tamaño, lo que condiciona fuertemente sus requisitos de hardware.

La relevancia de este modelo radica en su enfoque específico en estonio, un idioma con recursos limitados en el ecosistema de modelos abiertos. No obstante, la model card publicada es una plantilla automática sin contenido sustantivo, por lo que muchos detalles técnicos (datos de entrenamiento exactos, hiperparámetros, métricas de evaluación) no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Llama 3.1); no se detalla la arquitectura de la cabeza de recompensa |
| Parametros totales | 69.503.041.536 (aproximadamente 70B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (formato nativo safetensors en bf16/fp16 presumiblemente; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | estonio (et) e ingles (en) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Llama 3.1, un transformer decoder-only con atención causal y normalización RMSNorm, en su variante de aproximadamente 70B parámetros. Sobre esta base instructiva (tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826) se aplica un fine-tuning para convertir el modelo generativo en un modelo de recompensa, presumiblemente sustituyendo la cabeza de lenguaje por una cabeza de regresión escalar que produce una puntuación de calidad. No se documenta en la información disponible la arquitectura exacta de esta cabeza ni si se emplea un enfoque tipo Bradley-Terry.

El entrenamiento utiliza el dataset nvidia/HelpSteer3, un corpus de preferencias humanas con anotaciones multi-atributo. No se especifican el número de tokens de entrenamiento, la composición detallada del dataset, hiperparámetros (learning rate, batch size, épocas), ni si se aplicaron técnicas adicionales como DPO o RLHF. La model card es una plantilla automática sin secciones completadas, por lo que la información sobre el procedimiento de entrenamiento es prácticamente inexistente.

## Capacidades

- Puntuación de respuestas: el modelo está diseñado para asignar una puntuación escalar de calidad a respuestas generadas por modelos de lenguaje, útil como reward model en pipelines de alineamiento.
- Evaluación de preferencias: entrenado sobre HelpSteer3, puede emplearse para comparar o rankear pares de respuestas.
- Soporte bilingüe: estonio e inglés, con especial orientación al estonio según el nombre del modelo.
- Integración con transformers: compatible con la librería transformers y con text-embeddings-inference según los tags del repositorio.
- Compatibilidad con endpoints: etiquetado como endpoints_compatible, lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Generación de texto: no confirmada como capacidad principal; al ser un reward model, su salida esperada es una puntuación, no texto libre.
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Alineamiento RLHF/RLAIF en estonio: el modelo puede actuar como función de recompensa para entrenar o afinar modelos generativos en estonio, puntuando respuestas candidatas y guiando la optimización de políticas.
- Evaluación automática de calidad de chatbots: integrado en un pipeline de evaluación, permite puntuar respuestas de un asistente conversacional y detectar degradaciones de calidad antes de desplegar cambios.
- Filtrado de datos sintéticos: al generar datasets sintéticos en estonio, el reward model puede filtrar respuestas de baja calidad y conservar solo las mejor puntuadas para entrenamiento posterior.
- Benchmarking de modelos generativos: sirve como juez automático para comparar la calidad de distintos modelos en tareas en estonio, complementando métricas tradicionales como BLEU o ROUGE.
- Selección de mejores respuestas (best-of-N): en producción, se generan N respuestas y el reward model selecciona la de mayor puntuación, mejorando la calidad percibida sin cambiar el modelo generador.
- Investigación en evaluación de LLM: permite estudiar correlaciones entre puntuaciones automáticas y juicios humanos en un idioma de bajos recursos como el estonio.
- Moderación y control de calidad: puede emplearse para detectar respuestas incoherentes o de baja utilidad en sistemas desplegados, activando revisiones humanas cuando la puntuación cae por debajo de un umbral.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 140 GB solo para pesos (69,5B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 160 GB de VRAM agregada.
- VRAM estimada en cuantización de 8 bits: aproximadamente 70 GB; en 4 bits, aproximadamente 35-40 GB (aunque no se publican cuantizaciones oficiales).
- GPU recomendadas: múltiples A100 80GB (2-3 unidades), H100 80GB (2 unidades), o configuraciones con GPUs de 48GB en paralelo (por ejemplo, 4× RTX 6000 Ada o A6000).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en GPUs consumer de 24 GB en precisión completa; solo sería viable con cuantizaciones agresivas no publicadas oficialmente y con riesgo de degradación.
- Opciones de despliegue: transformers (nativo), text-embeddings-inference según los tags, y potencialmente vLLM o TGI para servir el modelo, aunque no se documenta soporte explícito.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Tipo |
|---|---|---|---|---|---|
| tartuNLP/Llama-3.1-EstLLM-70B-Reward-TehisaruBaromeeter | ~70B | no disponible | et, en | llama3.1 | Reward model |
| tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826 | ~70B | no disponible (base Llama 3.1: 128K) | et, en | llama3.1 | Instruct generativo |
| Meta Llama-3.1-70B-Instruct | ~70B | 128K | multilingüe (8 idiomas oficiales) | llama3.1 | Instruct generativo |
| nvidia/HelpSteer3 (dataset) | no aplica | no aplica | en (principalmente) | no disponible | Dataset de preferencias |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Model card vacía: la documentación publicada es una plantilla automática sin información sobre entrenamiento, evaluación o uso previsto; esto dificulta la reproducibilidad y la validación del modelo.
- Sesgos conocidos: no documentados; al derivar de Llama 3.1 y entrenarse sobre HelpSteer3, puede heredar sesgos del corpus de preferencias y del modelo base.
- Riesgo de alucinación: como reward model, el riesgo se traslada a puntuaciones mal calibradas que podrían favorecer respuestas plausibles pero incorrectas.
- Limitaciones de idioma: el soporte se limita a estonio e inglés; su uso en castellano u otros idiomas no está validado y probablemente produzca puntuaciones poco fiables.
- Restricciones de licencia: la Llama 3.1 Community License impone condiciones de uso comercial (umbral de 700 millones de usuarios mensuales, obligación de atribución y restricciones de uso), que deben revisarse antes de un despliegue en producción.
- Contexto no confirmado: aunque el modelo base Llama 3.1 soporta 128K tokens, no se confirma que este fine-tune preserve esa ventana; conviene validarlo empíricamente.
- Tamaño prohibitivo: 139 GB de repositorio y ~140 GB en bf16 hacen inviable su uso en hardware consumer, limitando su adopción a infraestructuras con múltiples GPUs de datacenter.
- Sin cuantizaciones oficiales: no se publican versiones GGUF, AWQ o GPTQ, lo que complica el despliegue en entornos con VRAM limitada.
- Falta de benchmarks: no hay métricas publicadas que permitan verificar su calidad como reward model frente a alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-70B-Reward-TehisaruBaromeeter
- Modelo base: https://huggingface.co/tartuNLP/Llama-3.1-EstLLM-70B-Instruct-0826
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/HelpSteer3
- Referencia citada en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Organización tartuNLP: https://huggingface.co/tartuNLP
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
