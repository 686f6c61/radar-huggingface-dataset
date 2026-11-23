# TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_advantage_temp0.3

## Resumen

Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_advantage_temp0.3 es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base google/gemma-3-1b-it. Lo publica el usuario TravelDistillation en Hugging Face y su propósito declarado es el ajuste fino sobre un conjunto de pares de preferencia denominado `data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it`, presumiblemente generado destilando el comportamiento de gemma-3-4b-it hacia el modelo pequeño de 1B.

El modelo no es un modelo completo, sino un adaptador PEFT de aproximadamente 2,2 GB de repositorio que debe combinarse con los pesos del Gemma 3 1B instruct. La nomenclatura del identificador sugiere un experimento de destilación de preferencias con una función de recompensa basada en métricas macro/micro y una ventaja (advantage) calculada con temperatura 0,3, aunque el autor no documenta estos detalles en la model card.

Su relevancia es acotada: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin resultados de evaluación publicados. Resulta útil como referencia para quienes experimentan con DPO y destilación de preferencias sobre modelos pequeños, pero no está pensado como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptador LoRA sobre el modelo base |
| Parametros totales | No disponible (el modelo base google/gemma-3-1b-it tiene aproximadamente 1B; el adaptador añade un número no especificado de parámetros entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base, no documentada aquí) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-it, un transformer decoder-only de la familia Gemma 3. El entrenamiento se realizó con TRL y PEFT 0.21.2, utilizando DPO (etiqueta `dpo` en los tags) con rango LoRA no especificado en la información disponible. El dataset de preferencias se denomina `preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it`, lo que sugiere pares generados comparando respuestas del modelo de 1B con las del de 4B.

Los hiperparámetros documentados son: learning rate 5e-05, batch size de entrenamiento 1 con acumulación de gradientes de 8 (batch efectivo 8), una sola época, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con warmup del 10 % de los pasos y semilla 42. El nombre del modelo indica una variante de recompensa con ventaja macro/micro y temperatura de muestreo 0,3, pero no se aporta la formulación matemática ni los detalles del pipeline de generación de preferencias.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruct.
- Ajuste orientado a preferencias: se espera que el adaptador alinee las respuestas hacia las preferencias capturadas en el dataset, aunque no se documenta qué dimensión concreta (utilidad, estilo, corrección) se optimiza.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el modelo base Gemma 3 es multilingüe, pero el adaptador no documenta idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el tag `gemma3_text` sugiere uso exclusivamente textual.

## Casos de uso

- Investigación en DPO sobre modelos pequeños: sirve como punto de partida reproducible para estudiar cómo un adaptador LoRA de bajo rango modifica el comportamiento de un modelo de 1B con una sola época de entrenamiento.
- Destilación de preferencias desde un modelo mayor: el dataset sugiere comparar respuestas de gemma-3-4b-it frente a gemma-3-1b-it; el adaptador puede emplearse para analizar si la destilación de preferencias transfiere calidad del 4B al 1B.
- Evaluación de pipelines de recompensa: útil para reproducir experimentos con funciones de recompensa macro/micro y distintos valores de temperatura en la generación de pares.
- Prototipado de asistentes conversacionales ligeros: al partir de un modelo de 1B, puede desplegarse en entornos con recursos muy limitados para pruebas internas de diálogo.
- Comparación de variantes de ajuste: el nombre del checkpoint permite contrastarlo con otras variantes del mismo autor (distintas recompensas o temperaturas) para estudiar sensibilidad al diseño del reward.
- Docencia y formación: ejemplo práctico de entrenamiento con TRL y PEFT, con hiperparámetros completos documentados, adecuado para talleres de fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index del autor declara una entrada con la lista de resultados vacía.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; al combinar un modelo base de aproximadamente 1B con un adaptador LoRA, la huella es reducida, del orden de pocos GB en precisión completa y menos de 1-2 GB en cuantizaciones de 4 bits (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no documentadas. Por tamaño del modelo base, cualquier GPU consumer con 8 GB o más debería poder ejecutarlo en FP16; para cuantización 4-bit bastarían 4-6 GB.
- Cabe en GPU consumer: previsiblemente sí (RTX 3060, RTX 4060, RTX 4090), aunque no hay confirmación oficial.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp, Ollama o vLLM requerirían fusionar previamente el adaptador con el modelo base y convertir el resultado a GGUF u otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2 (este) | ~1B (base) + adaptador LoRA | No disponible | Adaptador DPO sobre Gemma 3 1B | Gemma | Hugging Face, 0 descargas |
| google/gemma-3-1b-it | ~1B | No disponible en esta ficha | Modelo instruct completo | Gemma | Hugging Face, oficial |
| google/gemma-3-4b-it | ~4B | No disponible en esta ficha | Modelo instruct completo | Gemma | Hugging Face, oficial |
| Adaptadores DPO comparables de la comunidad | Variable | Variable | LoRA DPO | Variable | Hugging Face |

La comparación directa con alternativas resulta limitada: no hay benchmarks publicados para este adaptador ni datos de rendimiento frente a otras variantes de destilación. La referencia natural es el modelo base sin adaptar y el modelo profesor (4B) usado para generar los pares de preferencia.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas ni resultados de validación publicados; no es posible afirmar que el adaptador mejore al modelo base.
- Model card incompleta: el autor deja secciones como "Model description", "Intended uses" y "Training and evaluation data" sin contenido ("More information needed").
- Riesgo de alucinación: inherente al modelo base de 1B, previsiblemente no mitigado por una sola época de DPO.
- Sesgos: no documentados; se heredan los del modelo Gemma 3 1B y los del dataset de preferencias, que no se describe.
- Idiomas: no se especifican; el adaptador podría degradar el multilingüismo del modelo base si el dataset de preferencias es monolingüe.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de cualquier despliegue.
- Madurez: cero descargas y cero likes, creado y actualizado el mismo día, sin mantenimiento conocido; no recomendable para producción.
- Reproducibilidad: el dataset de preferencias referenciado (`data/preference_pairs_...`) no parece estar publicado como artefacto independiente, lo que dificulta replicar el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_advantage_temp0.3
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Modelo profesor referenciado en el dataset: https://huggingface.co/google/gemma-3-4b-it
- Perfil del autor: https://huggingface.co/TravelDistillation
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (DPO): https://huggingface.co/docs/trl
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
