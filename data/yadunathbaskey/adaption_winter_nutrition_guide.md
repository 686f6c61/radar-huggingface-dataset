# YadunathBaskey/adaption_winter_nutrition_guide

## Resumen

`adaption_winter_nutrition_guide` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `google/gemma-3-4b-pt`, publicado por el usuario YadunathBaskey en HuggingFace. No se trata de un modelo completo, sino de un conjunto de pesos de adaptación de aproximadamente 0,3 GB que debe combinarse con el modelo base de 4.000 millones de parámetros para funcionar. El adaptador ha sido generado mediante la plataforma Adaption (adaptionlabs.ai) y su herramienta AutoScientist, aplicando un ajuste supervisado (SFT) sobre un dataset denominado `winter_nutrition_guide`.

El propósito declarado del adaptador es especializar el modelo base en el dominio de la nutrición invernal, un área que combina conocimientos de cocina (37% de los datos), medicina (31%), ciencia (8%) y agricultura (5%), entre otras categorías menores. El dataset de entrenamiento consta de 885 filas en formato de instrucciones, lo que lo convierte en un ajuste muy ligero y de nicho, orientado probablemente a demostrar el flujo de trabajo de AutoScientist más que a un uso en producción general.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el patrón típico de los adaptadores LoRA de dominio específico generados por plataformas automatizadas, con hiperparámetros concretos (r=32, alpha=64, 5 épocas) y un conjunto de datos pequeño. Es útil para entender cómo se construyen y despliegan adaptadores PEFT sobre Gemma 3, y para evaluar las limitaciones de este tipo de ajustes de nicho.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Gemma 3 4B PT) |
| Parámetros totales | No disponible (adaptador LoRA; el modelo base tiene 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Gemma 3 4B; no especificada en la model card) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del modelo base) |
| Idiomas soportados | Inglés (en) |
| Licencia | other (no especificada en detalle; hereda restricciones de Gemma) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador utiliza la técnica LoRA con rango 32 y alpha 64, aplicada sobre los módulos `k_proj`, `up_proj`, `o_proj`, `q_proj`, `down_proj`, `v_proj` y `gate_proj` del transformer Gemma 3 4B PT. El entrenamiento se realizó con SFT (supervised fine-tuning) en formato de instrucciones, con 5 épocas, learning rate de 5e-5, scheduler coseno con 0,5 ciclos, warmup ratio de 0,03, weight decay de 0,01, dropout LoRA de 0,05 y `train_on_inputs` desactivado. El batch size se fijó a "max" (valor no numérico en la configuración). No se menciona uso de RLHF, DPO ni decodificación especulativa.

El dataset de entrenamiento contiene 885 filas con distribución por dominio: cocina (37%), medicina (31%), ciencia (8%), agricultura (5%), how-to (3%), escritura-edición-comunicación (3%), académico-educación (3%), tecnología (2%), parenting-familia (2%), código (2%), corporativo-negocio (2%), historia (1%) y lenguaje (1%). Esta composición sugiere un corpus orientado a recomendaciones nutricionales estacionales, con fuerte peso de contenido culinario y médico. No se especifica el número total de tokens ni la procedencia de los datos.

## Capacidades

- Generación de texto en inglés sobre temática de nutrición invernal, cocina y recomendaciones médicas básicas.
- Respuesta a instrucciones en formato `### Instruction: ... ### Response:` (el modelo base no tiene chat template).
- Razonamiento limitado y conocimiento factual restringido al dominio del dataset de ajuste.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües no disponibles (solo inglés declarado).
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Asistente de recomendaciones nutricionales estacionales: el adaptador puede generar sugerencias de menús y alimentos de invierno en inglés, apoyándose en el 37% de datos de cocina y el 31% de medicina del corpus de ajuste.
- Generación de contenido divulgativo sobre alimentación invernal: útil para redactar borradores de artículos o fichas de recetas con orientación nutricional, dado el peso de las categorías de escritura y comunicación.
- Prototipado de chatbots de nicho: sirve como ejemplo de cómo especializar Gemma 3 4B con un adaptador LoRA pequeño (0,3 GB) para un dominio concreto antes de invertir en un ajuste mayor.
- Experimentación con PEFT y AutoScientist: permite reproducir el flujo de entrenamiento (r=32, alpha=64, 5 épocas) y evaluar la calidad de adaptadores generados automáticamente.
- Filtrado y clasificación de consultas nutricionales: el modelo puede reescribir o reformular preguntas del dominio, aunque sin garantías de precisión médica.
- Educación y demostraciones: adecuado para talleres o tutoriales sobre ajuste fino de modelos pequeños con LoRA, dado su reducido tamaño y su documentación de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona una evaluación sobre un conjunto de test held-out in-distribution y un test específico de dominio, con gráficos de win rates (`win-rates.png`) y métricas de entrenamiento (`training-metrics.png`), pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K ni similares).

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA pesa ~0,3 GB; el modelo base Gemma 3 4B en fp16 requiere ~8 GB, en int8 ~4 GB y en int4 ~2,5 GB (estimaciones estándar para 4B parámetros, no confirmadas en la model card).
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para fp16 sin cuantizar; RTX 3060/4060 (8-12 GB) suficientes con cuantización int8/int4.
- Cabe en GPU de consumo: sí, especialmente con cuantización (GGUF/AWQ/GPTQ) o cargando el adaptador fusionado en fp16 en GPUs de 8 GB o más.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card), vLLM, llama.cpp u Ollama tras convertir el modelo fusionado a GGUF; TGI no documentado para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| adaption_winter_nutrition_guide | 4B (base) + LoRA | No disponible | other | HuggingFace (0 descargas) | Adaptador de nicho, dataset de 885 filas |
| google/gemma-3-4b-pt | 4B | No disponible en la información | Gemma license | HuggingFace (oficial) | Modelo base sin ajuste; capacidades generales |
| Adaptadores LoRA de dominio público (p. ej. sobre Llama 3 8B) | 8B (base) + LoRA | Variable | Variable | HuggingFace | Mayor tamaño y ecosistema, pero sin datos comparables aquí |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el dataset de 885 filas y su sesgo hacia cocina y medicina puede producir respuestas desequilibradas o poco representativas.
- Riesgo de alucinación: alto en un adaptador de nicho con datos limitados; las recomendaciones nutricionales o médicas pueden ser incorrectas y no deben usarse como consejo profesional.
- Limitaciones de contexto e idioma: solo inglés declarado; la longitud de contexto no se especifica y depende del modelo base.
- Restricciones de licencia: licencia "other" sin detalle; al derivar de Gemma 3, se heredan las restricciones de la licencia de Gemma, que deben revisarse antes de uso comercial.
- Caveats para producción: 0 descargas y 0 likes, sin validación comunitaria; el adaptador requiere fusión con el modelo base (`merge_and_unload`) y no incluye chat template; el rendimiento en dominios fuera de nutrición invernal será degradado.
- El modelo base es `gemma-3-4b-pt` (pre-entrenado, no instruction-tuned), por lo que el adaptador debe usarse con el formato de prompt exacto documentado.

## Enlaces

- HuggingFace: https://huggingface.co/YadunathBaskey/adaption_winter_nutrition_guide
- Modelo base: https://huggingface.co/google/gemma-3-4b-pt
- Plataforma Adaption: https://adaptionlabs.ai
- Documentación PEFT: https://huggingface.co/docs/peft
- Repositorio Transformers: https://github.com/huggingface/transformers
