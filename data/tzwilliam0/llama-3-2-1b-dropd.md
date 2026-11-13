# tzwilliam0/Llama-3.2-1B-DrOPD

## Resumen

Llama-3.2-1B-DrOPD es un checkpoint de estudiante obtenido mediante destilación on-policy, concretamente con el método Dr. OPD propuesto por su autor (tzwilliam0) en un artículo sobre destilación on-policy con señal de recompensa. El modelo parte de `meta-llama/Llama-3.2-1B-Instruct` como inicialización y se entrena tomando como profesor congelado a `meta-llama/Llama-3.2-3B-Instruct`. El objetivo es trasladar parte de la calidad conversacional del modelo de 3B a un modelo de 1B sin reentrenar desde cero.

Se trata de un experimento académico de escala reducida: 50 pasos de entrenamiento sobre 9000 prompts de UltraChat, con 128 prompts por paso y 8 muestras por prompt, learning rate de 1e-6 y longitud máxima de respuesta de 2048 tokens. No es un modelo de propósito general ni un lanzamiento de producto, sino un artefacto de investigación reproducible que incluye los registros completos de entrenamiento en el repositorio.

Su relevancia es metodológica: publica curvas de selección de checkpoint y resultados medidos con un reward model externo distinto del usado para seleccionar el checkpoint, lo que permite evaluar el efecto de la destilación on-policy sobre un modelo pequeño. El modelo tiene 1.498.482.688 parámetros reales en safetensors y un repositorio de 3,0 GB.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2), no disponible el detalle exacto de capas y dimensiones en la información proporcionada |
| Parametros totales | 1.498.482.688 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.2 1B Instruct soporta 128k, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors sin variantes GGUF/AWQ/GPTQ |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | Llama 3.2 Community License (con Acceptable Use Policy) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El checkpoint es un transformer decoder-only de la familia Llama 3.2, inicializado desde `meta-llama/Llama-3.2-1B-Instruct` y ajustado mediante destilación on-policy con el método Dr. OPD. El profesor es `meta-llama/Llama-3.2-3B-Instruct`, congelado durante todo el proceso. El entrenamiento usa 9000 prompts de UltraChat, 50 pasos con 128 prompts por paso y 8 muestras por prompt, learning rate de 1e-6, longitud máxima de respuesta de 2048 tokens y semilla de rollout 0.

La configuración experimental es deliberadamente controlada: los cinco métodos comparados en el artículo comparten hiperparámetros, datos de entrenamiento, semilla de datos y semillas de rollout emparejadas, sin ajuste por método. La selección de checkpoint se hizo sobre 1000 prompts reservados puntuados con `Skywork-Reward-V2-Llama-3.2-3B`, sin solapamiento con los benchmarks reportados, que a su vez se evalúan con un reward model distinto, `Skywork-Reward-V2-Llama-3.1-8B`. Los pasos candidatos fueron 10, 20, 30, 40 y 50, y se seleccionó el paso 50. El repositorio incluye `training_logs/selected.json`, `metrics.jsonl` y `launch.json` con el registro completo del run.

## Capacidades

- Generación de texto conversacional en formato instruct, heredado del modelo base Llama-3.2-1B-Instruct.
- Destilación orientada a calidad de respuesta medida por reward models: el entrenamiento optimiza preferencias evaluadas por `Skywork-Reward-V2`, no solo imitación de logits.
- Soporte de conversaciones multi-turno en el formato de chat de Llama 3.2, sujeto a las capacidades del modelo base de 1B.
- Capacidades de tool calling y function calling: no confirmadas para este checkpoint en la información proporcionada; dependen del modelo base y no se documentan aquí.
- Razonamiento multi-paso y uso como agente: no documentado en la model card.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- No se documentan modos especiales (thinking, visión, audio) en la información proporcionada.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint sirve como referencia reproducible del método Dr. OPD en el setting E3, con logs completos de entrenamiento y selección de checkpoint, lo que permite replicar o comparar curvas de validación.
- Evaluación de reward models: al publicarse puntuaciones con `Skywork-Reward-V2-Llama-3.1-8B` sobre AlpacaEval, WritingBench y WildBench, el modelo puede usarse como sujeto de prueba para estudiar la correlación entre reward models y calidad percibida.
- Baseline ligero para experimentos de alineación: con 1,5B parámetros y licencia Llama 3.2, es adecuado como punto de partida de bajo coste en estudios de DPO, RLHF o destilación sobre hardware modesto.
- Generación de texto conversacional de bajo coste en prototipos: al ser un modelo de 1B, puede desplegarse en GPUs de consumo para demos internas de chat, asumiendo la calidad limitada inherente al tamaño.
- Estudio de la brecha estudiante-profesor: los resultados publicados (16,098 frente a 21,085 en AlpacaEval) permiten cuantificar cuánto de la calidad del profesor de 3B se recupera en el estudiante de 1B, útil para decidir si merece la pena destilar en lugar de desplegar el modelo mayor.
- Docencia y formación: el repositorio con `launch.json`, `metrics.jsonl` y `selected.json` es material didáctico para explicar selección de checkpoints, evaluación con reward models y control de semillas en experimentos de destilación.

## Benchmarks y rendimiento

Puntuaciones del reward model externo `Skywork-Reward-V2-Llama-3.1-8B`, 8 muestras por prompt promediadas por prompt y luego sobre prompts, media de 3 semillas de rollout con desviación estándar entre semillas. El repositorio contiene el checkpoint de semilla 0.

| Benchmark | Prompts | DrOPD 1B (seed 0) | Estudiante 1B sin entrenar | Profesor 3B |
|---|---|---|---|---|
| AlpacaEval | 805 | 16,098 ± 0,771 | 12,991 | 21,085 |
| WritingBench | 1000 | 8,500 ± 0,536 | 5,043 | 12,992 |
| WildBench | 1024 | 7,873 ± 0,238 | 4,295 | 14,019 |

Decodificación en evaluación: AlpacaEval y WildBench con temperatura 0,7 y top_p 0,95; WritingBench con temperatura 0,7, top_p 0,8 y top_k 20. Idéntica para todos los métodos y para ambos modelos de referencia. No se publican resultados en benchmarks estándar tipo MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 3 GB solo para pesos (1,5B parámetros × 2 bytes), más overhead de activaciones y KV cache; presupuesto práctico de 4-6 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: aproximadamente 1,5-2 GB para pesos; en 4 bits, en torno a 1 GB para pesos. No se publican variantes cuantizadas oficiales, por lo que habría que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto moderado; A100, H100, L40S o RTX 4090 sobran para este tamaño y permiten batches grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y GPUs Apple Silicon con memoria unificada suficiente.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM y llama.cpp/Ollama tras conversión a GGUF, aunque no se publican artefactos para estas últimas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (AlpacaEval, reward externo) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.2-1B-DrOPD | 1,498B | no disponible | 16,098 ± 0,771 | Llama 3.2 Community | Hugging Face, safetensors |
| Llama-3.2-1B-Instruct (base sin destilar) | 1,24B aprox. (no confirmado aquí) | 128k según model card de Meta, no verificable en esta ficha | 12,991 (mismo protocolo) | Llama 3.2 Community | Hugging Face |
| Llama-3.2-3B-Instruct (profesor) | 3,21B aprox. (no confirmado aquí) | 128k según model card de Meta, no verificable en esta ficha | 21,085 (mismo protocolo) | Llama 3.2 Community | Hugging Face |

La comparación con otros métodos de destilación del mismo artículo no se detalla en la información proporcionada; solo se indica que los cinco métodos comparten configuración y datos, pero no se incluyen sus puntuaciones individuales en esta ficha.

## Limitaciones y advertencias

- Modelo de investigación: 50 pasos de entrenamiento sobre 9000 prompts es un régimen muy corto; no debe tratarse como un modelo listo para producción.
- Calidad acotada por el tamaño: con 1,5B parámetros, la brecha frente al profesor de 3B sigue siendo amplia en los tres benchmarks (por ejemplo, 16,098 frente a 21,085 en AlpacaEval).
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de tasa de alucinación; el modelo base de 1B es propenso a errores factuales en tareas de conocimiento.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o robustez; los sesgos de UltraChat y del modelo base Llama 3.2 se heredan sin mitigación documentada.
- Idiomas: no se especifican los idiomas soportados; no se garantiza un rendimiento multilingüe más allá de lo que herede el modelo base.
- Contexto: la longitud de contexto efectiva de este checkpoint no está documentada; no se debe asumir la ventana de 128k del modelo base sin verificación.
- Licencia: al ser derivado de Llama 3.2, está sujeto a la Llama 3.2 Community License y a la Acceptable Use Policy; el uso comercial requiere cumplir los términos de Meta, incluidos los requisitos de atribución y las restricciones de la política de uso aceptable.
- Reproducibilidad: los resultados son medias de 3 semillas y el repositorio contiene solo la semilla 0; las diferencias entre semillas (desviación de hasta 0,771 en AlpacaEval) deben tenerse en cuenta al comparar métodos.
- Evaluación dependiente de reward models: las puntuaciones provienen de `Skywork-Reward-V2-Llama-3.1-8B`, no de evaluaciones humanas ni de benchmarks de conocimiento o código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tzwilliam0/Llama-3.2-1B-DrOPD
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- Profesor: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Licencia Llama 3.2: https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE
- Reward model de selección: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.2-3B (referenciado en la model card)
- Reward model de evaluación: https://huggingface.co/Skywork/Skywork-Reward-V2-Llama-3.1-8B (referenciado en la model card)
- Artículo, repositorio de código y demos del método Dr. OPD: no disponibles en la información proporcionada.
