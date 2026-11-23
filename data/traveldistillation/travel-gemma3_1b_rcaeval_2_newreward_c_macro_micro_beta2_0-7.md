# TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_beta2_0.7

## Resumen

Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_beta2_0.7 es un adaptador LoRA entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base google/gemma-3-1b-it. Lo desarrolla el usuario TravelDistillation y se distribuye como un repositorio PEFT (2,2 GB) que contiene únicamente los pesos del adaptador, no el modelo completo. El nombre del repositorio codifica la configuración del experimento: evaluación sobre el conjunto RCAEval_2, una función de recompensa personalizada con agregación macro y micro, y un coeficiente beta de 0,7 para el término de regularización KL implícito en DPO.

El modelo base Gemma 3 1B es un transformer decoder-only de aproximadamente 1.000 millones de parámetros, en su variante instruction-tuned, desarrollado por Google DeepMind. El adaptador ajusta el comportamiento del modelo para alinearlo con un conjunto de pares de preferencia generados a partir de comparaciones entre las salidas de gemma-3-1b-it y gemma-3-4b-it, es decir, destilación de preferencias desde un modelo mayor hacia uno menor.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto de investigación con cero descargas y cero likes en el momento de la consulta, sin model card completada (el autor deja secciones como "More information needed"), sin resultados de benchmarks declarados y sin documentación sobre el dataset de preferencias más allá de su nombre. Es útil como referencia para quienes replican pipelines de DPO con TRL sobre Gemma 3, pero no constituye un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 text) con adaptador LoRA sobre el modelo base |
| Parametros totales | No disponible para el adaptador; el modelo base google/gemma-3-1b-it ronda los 1.000 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Gemma 3 1B) |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors, sin versiones GGUF publicadas |
| Idiomas soportados | No disponibles (heredados del modelo base, no documentados por el autor) |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre google/gemma-3-1b-it, un transformer decoder-only denso de la familia Gemma 3. El entrenamiento emplea DPO implementado en TRL, con los siguientes hiperparámetros declarados en la model card: learning rate de 5e-05, batch size de entrenamiento de 1 con 8 pasos de acumulación de gradiente (batch efectivo de 8), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con un 10 % de pasos de warmup, una única época y semilla 42. El coeficiente beta del nombre del repositorio (0,7) corresponde al parámetro de regularización de DPO frente a la política de referencia.

El dataset de preferencias se denomina data/preference_pairs_RCAEval_2_gemma-3-1b-it_to_gemma-3-4b-it, lo que sugiere pares construidos comparando respuestas del modelo de 1B con las del modelo de 4B sobre el conjunto de evaluación RCAEval_2. La función de recompensa se etiqueta como "newReward_C_Macro_Micro", indicando una agregación a nivel macro y micro, aunque el autor no documenta su definición. El adaptador se entrenó con PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132, Datasets 5.1.0 y Tokenizers 0.23.3. No se especifica el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas previas de SFT.

## Capacidades

- Generación de texto conversacional, heredada del modelo base instruction-tuned.
- Alineación de preferencias mediante DPO: el adaptador está diseñado para desplazar la distribución de respuestas del modelo base hacia las preferidas en el conjunto RCAEval_2.
- Razonamiento y respuesta a instrucciones en formato multi-turno, en la medida en que lo soporte el modelo base.
- No hay evidencia documentada de soporte de tool calling, function calling ni comportamiento agéntico específico en este adaptador.
- No hay evidencia documentada de capacidades multimodales, de audio ni de modo "thinking" explícito en este adaptador.
- Capacidades multilingües no documentadas por el autor; dependen enteramente del modelo base.

## Casos de uso

- Replicación de experimentos de DPO: el repositorio sirve como referencia reproducible de una configuración concreta (beta 0,7, recompensa macro/micro, una época) para investigadores que comparan variantes de alineación sobre Gemma 3 1B.
- Destilación de preferencias de modelos mayores a menores: el pipeline subyacente (pares 1B frente a 4B) es aplicable a la construcción de datasets de preferencia para reducir coste de inferencia manteniendo calidad percibida.
- Evaluación comparativa de adaptadores: útil como punto de partida en estudios que miden el efecto de distintos valores de beta y funciones de recompensa sobre el comportamiento del modelo.
- Prototipado de asistentes conversacionales ligeros: al ejecutarse sobre un modelo de 1B, puede desplegarse en entornos con recursos muy limitados para pruebas de concepto, siempre que se valide previamente la calidad de las respuestas.
- Investigación sobre sesgos inducidos por DPO: permite estudiar cómo un conjunto de preferencias acotado modifica el estilo y las respuestas del modelo base en dominios específicos.
- Base para fine-tuning posterior: el adaptador puede combinarse o sustituirse en pipelines PEFT adicionales, aunque requiere verificar compatibilidad de versiones de PEFT y Transformers.

## Benchmarks y rendimiento

El autor declara un model-index con el nombre del modelo y una lista de resultados vacía. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa aproximadamente 2,2 GB en el repositorio; debe sumarse el peso del modelo base google/gemma-3-1b-it para la inferencia.
- VRAM estimada: en FP16, el modelo base de 1B requiere en torno a 2-3 GB, más overhead de activaciones y KV cache; con cuantización de 4 bits puede situarse por debajo de 1,5 GB.
- Cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también en GPUs de datacenter (A100, H100) sin problema, aunque sobredimensionadas para este tamaño.
- Opciones de despliegue: Transformers con PEFT para cargar el adaptador; vLLM y TGI son compatibles con el tag text-generation-inference, aunque la fusión del adaptador con el modelo base es el paso previo recomendado; llama.cpp y Ollama requerirían convertir el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_beta2_0.7 | ~1B (base) + adaptador LoRA | No disponible | Gemma | Hugging Face, 0 descargas | Adaptador DPO de investigación, sin benchmarks |
| google/gemma-3-1b-it | ~1B | No disponible en esta ficha | Gemma | Hugging Face, ampliamente utilizado | Modelo base instruction-tuned oficial |
| google/gemma-3-4b-it | ~4B | No disponible en esta ficha | Gemma | Hugging Face | Modelo mayor usado como referencia en la construcción de preferencias |
| Alternativas de 1B ajustadas con DPO | ~1B | Variable | Variable | Variable | No disponible una comparación directa con benchmarks publicados |

## Limitaciones y advertencias

- Model card incompleta: el autor deja sin documentar la descripción del modelo, los usos previstos, los datos de entrenamiento y los resultados, lo que impide evaluar su calidad de forma rigurosa.
- Ausencia total de benchmarks: no hay métricas que respalden mejoras frente al modelo base.
- Riesgo de alucinación heredado del modelo base y potencialmente acentuado por el ajuste DPO sobre un conjunto de preferencias acotado.
- Sesgos no evaluados: no se documenta ningún análisis de sesgo, toxicidad ni robustez.
- Idiomas no declarados: el comportamiento multilingüe es incierto y depende del modelo base.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use, que imponen restricciones y obligaciones de atribución; debe revisarse antes de cualquier despliegue.
- Cero descargas y cero likes: no hay evidencia de uso en la comunidad ni de validación externa.
- Fecha de creación atípica (2026-11-23) en los metadatos: conviene verificar la integridad del repositorio antes de confiar en él.
- No apto para producción sin una evaluación propia exhaustiva sobre el dominio objetivo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/TravelDistillation/Travel-gemma3_1b_RCAEval_2_newReward_C_Macro_Micro_beta2_0.7
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de TRL (DPO): https://huggingface.co/docs/trl
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
