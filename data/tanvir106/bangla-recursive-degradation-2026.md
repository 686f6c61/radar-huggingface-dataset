# Tanvir106/bangla-recursive-degradation-2026

## Resumen

`Tanvir106/bangla-recursive-degradation-2026` es un artefacto de investigación publicado en Hugging Face, no un modelo de propósito general. Consiste en una colección de adaptadores LoRA entrenados sobre el modelo base `flax-community/gpt2-bengali`, con el objetivo de medir experimentalmente el fenómeno de colapso de modelo (*model collapse*) en entrenamiento recursivo sobre texto en bengalí. El autor lo describe explícitamente como un repositorio de resultados medidos, sin afirmaciones de precisión ni aceptación en publicación antes de obtener las métricas.

El experimento compara dos regímenes: un modelo de generación 0 afinado con datos humanos y posteriores generaciones que sustituyen datos humanos por sintéticos, frente a una mezcla fija del 50 % humano y 50 % sintético. Las métricas registradas incluyen cobertura de palabras finales, divergencia Jensen-Shannon de unigramas, desviación de la pendiente de Zipf, Distinct-2, Self-BLEU y perplejidad en conjunto reservado.

Su relevancia es metodológica: proporciona un protocolo reproducible para estudiar la degradación de la diversidad léxica en lenguas de bajos recursos como el bengalí, donde los corpus de entrenamiento son escasos y el riesgo de realimentación sintética es alto. No está pensado para inferencia en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-2) con adaptadores LoRA (PEFT) |
| Parametros totales | No disponible (depende del modelo base; no se especifica en la informacion proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de `flax-community/gpt2-bengali`; no se indica en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Bengalí (bn) |
| Licencia | No disponible (la model card remite a la licencia del modelo base y a las licencias del material de Wikipedia) |
| Formato de pesos | safetensors (adaptadores LoRA); no se redistribuyen los pesos base |

## Arquitectura y entrenamiento

El modelo base es `flax-community/gpt2-bengali`, un GPT-2 adaptado al bengalí. Sobre él se aplican adaptadores LoRA mediante la librería PEFT, con un checkpoint por cada etapa completada del experimento. La versión v2 utiliza los pesos originales de PyTorch del modelo base, porque en la v1 el cargador de safetensors falló una comprobación previa de recarga de LoRA.

El corpus de origen es la partición `20231101.bn` del dataset `wikimedia/wikipedia`. El protocolo de entrenamiento parte de un afinamiento con datos humanos (generación 0) y después bifurca: una rama sustituye progresivamente los datos humanos por sintéticos y otra mantiene una mezcla fija del 50 % humano y 50 % sintético. Las métricas de evaluación son cobertura de palabras finales, divergencia Jensen-Shannon de unigramas, desviación de la pendiente de Zipf, Distinct-2, Self-BLEU y perplejidad en conjunto reservado. No se indica el número de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto en bengalí, limitada al comportamiento del GPT-2 base.
- Registro de experimentos de degradación recursiva mediante adaptadores LoRA por etapa.
- Evaluación cuantitativa de diversidad léxica (Distinct-2, Self-BLEU, divergencia Jensen-Shannon de unigramas).
- Análisis de la distribución de frecuencias mediante desviación de la pendiente de Zipf.
- Medición de perplejidad en conjunto reservado para detectar degradación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Investigación sobre colapso de modelo: el repositorio permite reproducir la comparación entre sustitución total y mezcla fija del 50 %, sirviendo como referencia metodológica para estudios de entrenamiento recursivo.
- Estudio de diversidad léxica en lenguas de bajos recursos: las métricas de Distinct-2 y Self-BLEU sobre bengalí permiten cuantificar la pérdida de variedad en generaciones sucesivas.
- Validación de protocolos de curado de datos: la rama con mezcla fija del 50 % actúa como control para evaluar si mantener datos humanos retrasa la degradación.
- Auditoría de pipelines sintéticos: los adaptadores por etapa permiten inspeccionar en qué generación aparecen señales de colapso antes de desplegar un pipeline de datos sintéticos en producción.
- Reproducibilidad de experimentos: los checkpoints LoRA y las métricas en `runs/` permiten a otros grupos verificar resultados sin necesidad de reentrenar desde cero.
- Docencia en NLP: sirve como ejemplo práctico de medición de colapso de modelo con métricas estándar y un corpus público identificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que los resultados se miden tras la ejecución del runner de Kaggle y que el repositorio contiene únicamente resultados medidos; no se incluyen cifras de MMLU, HumanEval, GSM8K ni de las métricas propias del experimento en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño del modelo base `flax-community/gpt2-bengali`, que no se especifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: al ser adaptadores PEFT en safetensors, se cargarían con la librería `peft` sobre el modelo base; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Tanvir106/bangla-recursive-degradation-2026` | No disponible | No disponible | Adaptadores LoRA para investigación de colapso de modelo en bengalí | No disponible | Hugging Face (repo de 0.0 GB) |
| `flax-community/gpt2-bengali` | No disponible en la informacion proporcionada | No disponible | GPT-2 adaptado al bengalí | Según su model card | Hugging Face |
| Alternativas de investigación sobre colapso de modelo | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos suficientes para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo para producción: es un artefacto de investigación con adaptadores LoRA por etapa, no un checkpoint final optimizado.
- El repositorio tiene 0.0 GB, por lo que no contiene los pesos base; es necesario descargar `flax-community/gpt2-bengali` por separado.
- Solo cubre bengalí; no hay evidencia de capacidades multilingües.
- La licencia no está declarada de forma explícita; la model card remite a la licencia del modelo base y a las de Wikipedia, lo que introduce ambigüedad para uso comercial.
- Riesgo de alucinación y sesgos heredados del GPT-2 base y del corpus de Wikipedia, no evaluados en la información proporcionada.
- Los resultados del experimento pueden no estar completos si el runner de Kaggle no ha finalizado; la propia model card advierte de que no se reclama precisión ni detección temprana antes de la medición.
- La v1 falló una comprobación previa de recarga de LoRA con safetensors, lo que motivó el uso de pesos PyTorch en la v2; conviene verificar la compatibilidad del pipeline de carga.
- Se excluyen del repositorio los artículos crudos de Wikipedia, los prompts originales y los arrays de tokens, lo que limita la reproducción exacta del preprocesado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tanvir106/bangla-recursive-degradation-2026
- Modelo base: https://huggingface.co/flax-community/gpt2-bengali
- Dataset de origen: https://huggingface.co/datasets/wikimedia/wikipedia/tree/main/20231101.bn
