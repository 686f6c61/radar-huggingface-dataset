# Tyutul/NeuralDaredevil-8B-abliterated

## Resumen

NeuralDaredevil-8B-abliterated es un ajuste fino por DPO de mlabonne/Daredevil-8B-abliterated, publicado por el usuario Tyutul en Hugging Face. Se trata de un modelo derivado de la familia Llama 3 de 8B parámetros, entrenado durante una época sobre el dataset mlabonne/orpo-dpo-mix-40k. El objetivo declarado del autor es recuperar la pérdida de rendimiento provocada por el proceso de abliteration (eliminación de la dirección de rechazo en el espacio de activaciones) aplicado al modelo base, obteniendo así un modelo sin alineación de seguridad pero con capacidades conservadas.

El modelo hereda la arquitectura transformer decoder-only de Llama 3 8B, con 8.030.261.248 parámetros totales según los pesos en safetensors y un repositorio de 16,1 GB. La licencia es llama3, lo que impone las restricciones de uso de la Llama 3 Community License. No se especifican idiomas soportados en la información disponible, aunque por herencia del modelo base cabe esperar un sesgo fuerte hacia el inglés.

Su relevancia es acotada: se trata de un modelo comunitario sin descargas ni likes en el momento de la consulta, orientado a aplicaciones que no requieren alineación, como role-playing o generación creativa sin filtros. No es un modelo recomendable para producción con requisitos de seguridad, sino un artefacto de experimentación sobre técnicas de abliteration y DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Llama 3 8B, no confirmada en la ficha) |
| Tipos de cuantizacion | GGUF (incluida FP16), EXL2, AWQ, Ollama 16-bit/8-bit/5-bit |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 8B parámetros con la arquitectura estándar de Llama 3. Sobre el modelo base mlabonne/Daredevil-8B-abliterated, que a su vez deriva de una abliteration aplicada a Daredevil-8B, se aplicó un ajuste fino por DPO (Direct Preference Optimization) durante una época sobre el dataset mlabonne/orpo-dpo-mix-40k, una mezcla de datos ORPO y DPO de 40.000 ejemplos. El autor indica que este paso recupera el rendimiento perdido por la abliteration, igualando o superando al modelo Instruct en sus pruebas.

No se detallan en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset más allá de su nombre, ni si se aplicaron etapas adicionales de RLHF o SFT. La innovación técnica principal es la combinación de abliteration (ablación de la dirección de rechazo) con DPO para restaurar capacidades, una receta habitual en la comunidad para producir modelos sin censura manteniendo calidad.

## Capacidades

- Generación de texto en inglés principalmente, con razonamiento y conocimiento general heredados de Llama 3 8B.
- Razonamiento matemático básico, evidenciado por el resultado en GSM8k (71,8% en 5-shot).
- Comprensión lectora y sentido común, con resultados en HellaSwag y Winogrande.
- Generación creativa y role-playing sin restricciones de alineación, que es el uso principal declarado por el autor.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades multimodales (visión, audio) ni modo "thinking".
- Capacidades multilingües no confirmadas; se espera un rendimiento limitado fuera del inglés.

## Casos de uso

- Role-playing y narrativa interactiva: el modelo está pensado para conversaciones sin filtros de alineación, adecuado para personajes y escenarios creativos donde los modelos alineados rechazan contenido. El autor lo probó en LM Studio con los presets Llama 3 y Llama 3 v2.
- Generación creativa sin restricciones: escritura de ficción, diálogos y guiones que requieran tono adulto o temas sensibles, aprovechando la abliteration para evitar rechazos.
- Experimentación en investigación sobre abliteration y DPO: sirve como caso de estudio de cómo el DPO recupera rendimiento tras la ablación de la dirección de rechazo, comparando métricas con el modelo base.
- Evaluación comparativa de modelos sin censura: útil para medir el trade-off entre alineación y capacidades en la categoría de 8B, usando los resultados de Open LLM Leaderboard y Nous como referencia.
- Despliegue local en hardware de consumo: con cuantizaciones GGUF de 5 y 8 bits disponibles en Ollama, puede ejecutarse en GPUs consumer para prototipos y uso personal.
- Generación de texto general en entornos controlados: tareas de resumen, redacción o clasificación donde el operador asume el riesgo de contenido no filtrado y no se requiere cumplimiento de políticas de seguridad.
- Fine-tuning posterior como base: al estar en safetensors y con licencia llama3, puede servir de punto de partida para ajustes específicos de dominio, siempre que se respete la licencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Benchmark | Configuración | Métrica | Valor |
|---|---|---|---|
| ARC-Challenge | 25-shot | acc_norm | 69,28 |
| HellaSwag | 10-shot | acc_norm | 85,05 |
| MMLU | 5-shot | acc | 69,10 |
| TruthfulQA | 0-shot | mc2 | 60,00 |
| Winogrande | 5-shot | acc | 78,69 |
| GSM8k | 5-shot | acc | 71,80 |

Evaluación Nous (LLM AutoEval):

| Modelo | Media | AGIEval | GPT4All | TruthfulQA | Bigbench |
|---|---:|---:|---:|---:|---:|
| mlabonne/NeuralDaredevil-8B-abliterated | 55,87 | 43,73 | 73,60 | 59,36 | 46,80 |
| mlabonne/Daredevil-8B | 55,87 | 44,13 | 73,52 | 59,05 | 46,77 |
| mlabonne/Daredevil-8B-abliterated | 55,06 | 43,29 | 73,33 | 57,47 | 46,17 |
| NousResearch/Hermes-2-Theta-Llama-3-8B | 54,28 | 43,90 | 72,62 | 56,36 | 44,23 |

El autor afirma que es el mejor modelo sin censura de 8B en el Open LLM Leaderboard por puntuación MMLU, si bien esta afirmación no se puede verificar con los datos disponibles.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en FP16, 8-9 GB en cuantización de 8 bits, 5-6 GB en 5 bits y 4-5 GB en 4 bits (estimaciones según el tamaño de 8B parámetros; no confirmadas en la ficha).
- GPU recomendadas: A100 o H100 para FP16 con throughput alto; RTX 4090, RTX 3090 o RTX 4080 para cuantizaciones de 8 bits o inferiores.
- Cabe en GPU consumer: sí, en cuantizaciones GGUF de 4-8 bits en tarjetas con 8 GB o más de VRAM; en 5 bits se han publicado versiones para Ollama.
- Opciones de despliegue: llama.cpp, Ollama (16-bit, 8-bit y 5-bit), LM Studio (presets Llama 3 y Llama 3 v2), EXL2 con ExLlamaV2, AWQ con vLLM o TGI, y transformers con safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tyutul/NeuralDaredevil-8B-abliterated | 8,03B | no disponible | 69,10 | llama3 | Hugging Face |
| mlabonne/Daredevil-8B-abliterated | 8B (no confirmado) | no disponible | no disponible en la ficha | llama3 | Hugging Face |
| mlabonne/Daredevil-8B | 8B (no confirmado) | no disponible | no disponible en la ficha | llama3 | Hugging Face |
| NousResearch/Hermes-2-Theta-Llama-3-8B | 8B | no disponible | no disponible en la ficha | llama3 | Hugging Face |

En la evaluación Nous, NeuralDaredevil-8B-abliterated iguala a Daredevil-8B con una media de 55,87 y supera a Daredevil-8B-abliterated (55,06) y a Hermes-2-Theta-Llama-3-8B (54,28). No se dispone de datos de contexto ni de otros benchmarks para una comparación más completa.

## Limitaciones y advertencias

- Modelo sin alineación de seguridad: la abliteration elimina la dirección de rechazo, por lo que puede generar contenido dañino, ofensivo o ilegal sin filtros. No apto para aplicaciones orientadas al público sin moderación externa.
- Riesgo de alucinación: como todo modelo de 8B, tiende a inventar datos, especialmente en tareas de conocimiento factual y matemáticas complejas.
- Idiomas: no se confirma soporte multilingüe; el rendimiento fuera del inglés probablemente sea deficiente.
- Contexto: no se especifica la longitud de contexto efectiva; no asumir la ventana de Llama 3 sin verificación.
- Licencia llama3: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, obligaciones de atribución y política de uso aceptable de Meta). Revisar antes de cualquier despliegue comercial.
- Sesgos: hereda los sesgos de los datos de entrenamiento de Llama 3 y del dataset DPO, sin mitigación adicional.
- Trazabilidad: el modelo tiene 0 descargas y 0 likes, sin verificación independiente de los resultados declarados; los benchmarks son autoinformados y no verificados.
- Producción: no se documentan garantías de estabilidad, tool calling ni integración con frameworks de agentes; no recomendable como componente crítico sin evaluación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tyutul/NeuralDaredevil-8B-abliterated
- Modelo base: https://huggingface.co/mlabonne/Daredevil-8B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/mlabonne/orpo-dpo-mix-40k
- GGUF (QuantFactory): https://huggingface.co/QuantFactory/NeuralDaredevil-8B-abliterated-GGUF
- GGUF FP16 (ZeroWw): https://huggingface.co/ZeroWw/NeuralDaredevil-8B-abliterated-GGUF
- EXL2 (Zoyd): https://huggingface.co/Zoyd/mlabonne_NeuralDaredevil-8B-abliterated-4_0bpw_exl2
- AWQ (solidrust): https://huggingface.co/solidrust/NeuralDaredevil-8B-abliterated-AWQ
- Ollama 16-bit: https://ollama.com/tarruda/neuraldaredevil-8b-abliterated
- Ollama 8-bit: https://ollama.com/lstep/neuraldaredevil-8b-abliterated
- Ollama 5-bit: https://ollama.com/closex/neuraldaredevil-8b-abliterated
- LLM AutoEval: https://github.com/mlabonne/llm-autoeval
- Leaderboard Nous: https://huggingface.co/spaces/mlabonne/Yet_Another_LLM_Leaderboard
- Open LLM Leaderboard (consulta): https://huggingface.co/spaces/HuggingFaceH4/open_llm_leaderboard?query=mlabonne/Daredevil-8B-abliterated-dpomix
