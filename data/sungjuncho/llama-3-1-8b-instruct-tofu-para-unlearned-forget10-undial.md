# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario `sungjuncho`, que aplica la técnica de *machine unlearning* UNDIAL sobre un fine-tune previo del modelo base con el dataset TOFU-para. El objetivo no es ofrecer un modelo de propósito general, sino servir como artefacto de investigación para estudiar la diferencia entre *untraining* (eliminar las muestras exactas vistas durante el olvido) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full`, un fine-tune sobre la totalidad de TOFU más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre él se aplica UNDIAL (implementado en `open-unlearning`) con el conjunto de olvido `forget10` original (400 pares QA) y un conjunto de retención de 10.800 ejemplos (retain90 + para1 + para2). El resultado es un checkpoint de 8.030.261.248 parámetros en safetensors, con licencia Llama 3.1 Community License.

Su relevancia es metodológica: proporciona métricas FADE (divergencia KL simétrica frente al modelo de referencia) desglosadas para el conjunto de olvido original y sus paráfrasis, lo que permite cuantificar cuánto del conocimiento "olvidado" persiste en reformulaciones. Es un modelo de nicho, sin descargas ni likes en el momento de la consulta, orientado a la comunidad de evaluación de unlearning.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1) |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 3.1: 128.000 tokens, no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only con atención por grupos (GQA) y RoPE, sin modificaciones estructurales por parte del autor. El proceso de entrenamiento consta de dos fases: primero un fine-tune sobre TOFU-para, que incluye el dataset TOFU con erratas en nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA; después, la aplicación de UNDIAL sobre el checkpoint `x2-full`.

La configuración de UNDIAL sigue los valores por defecto de `open-unlearning`: sin gradient clipping, batch efectivo de 32, con la configuración exacta en el directorio `train_config/` del repositorio. El conjunto de olvido son únicamente los 400 pares QA originales de `forget10`, mientras que el conjunto de retención combina retain90 con para1 y para2 (10.800 ejemplos). La innovación metodológica es la separación explícita entre untraining y unlearning mediante la evaluación FADE sobre paráfrasis, usando un estimador Rao-Blackwellizado con 10 muestras por pregunta a temperatura 1.

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Razonamiento y respuesta a preguntas de dominio general (no verificado tras el unlearning).
- Soporte de tool calling y function calling: no disponible en la información proporcionada para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (la model card no las declara).
- Capacidad específica de investigación: permite medir la resistencia del olvido frente a reformulaciones del mismo conocimiento (paráfrasis para1 y para2).
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en machine unlearning: usar el checkpoint como referencia para comparar UNDIAL con otros métodos (NPO, SimNPO, RMU) sobre el mismo fine-tune base y el mismo conjunto forget10.
- Evaluación de la generalización del olvido: medir la brecha entre FADE sobre el conjunto original (147,9) y sobre las paráfrasis (140,8 y 140,9) para estudiar si el modelo retiene el conocimiento en reformulaciones.
- Auditoría de privacidad: analizar si el modelo sigue siendo capaz de reconstruir información del conjunto de olvido a través de preguntas parafraseadas, usando el ratio de verdad del olvido (0,466) como indicador.
- Reproducibilidad de experimentos: el directorio `train_config/` y los resultados en `evals/` permiten replicar el pipeline completo con `open-unlearning`.
- Estudio de la utilidad retenida: el valor de model utility (0,501) sirve para cuantificar el coste del olvido sobre las capacidades generales del modelo.
- Docencia y formación: ejemplo práctico de cómo se construye y evalúa un checkpoint de unlearning con separación entre untraining y unlearning.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para`, forget10 original) | 123,78 |
| FADE, unlearning (vs `x2-retain90`, forget10 original + 2 paráfrasis) | 143,20 |
| FADE, unlearning (original) | 147,9 |
| FADE, unlearning (para1) | 140,8 |
| FADE, unlearning (para2) | 140,9 |
| Calidad de olvido TOFU (vs `x2-retain90`) | 3,60e-27 |
| Ratio de verdad del olvido (forget truth ratio) | 0,466 |
| Probabilidad Q-A del olvido | 0,239 |
| ROUGE Q-A del olvido | 0,404 |
| Utilidad del modelo | 0,501 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las métricas FADE se calculan como divergencia KL simétrica frente al modelo de referencia, con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado; valores más bajos indican mayor dificultad para distinguir el modelo olvidado del de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB (no se publican cuantizaciones oficiales, pero el modelo es compatible con herramientas estándar de Llama 3.1 8B).
- VRAM estimada en cuantización de 4 bits: alrededor de 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100, L40S para producción; RTX 4090 (24 GB) para inferencia en bfloat16 ajustada.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16, y en GPUs de 8-12 GB con cuantización de 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo), vLLM, TGI (el tag `text-generation-inference` está presente), llama.cpp y Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-forget10-undial`) | 8,03 B | no disponible | Unlearning UNDIAL sobre TOFU-para | llama3.1 | Hugging Face, 0 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full` | 8,03 B | no disponible | Fine-tune completo sobre TOFU + 2 paráfrasis (modelo de referencia) | llama3.1 | Hugging Face |
| `x2-retain90` (referencia del autor) | 8,03 B | no disponible | Fine-tune solo sobre retain90, sin olvido | llama3.1 | Referenciado en la model card |
| Llama 3.1 8B Instruct (Meta) | 8,03 B | 128.000 tokens | Modelo base de propósito general | llama3.1 | Hugging Face |

No se dispone de datos de benchmarks comparables con otros métodos de unlearning (NPO, RMU, SimNPO) en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para uso en producción ni como asistente general; su utilidad medida es 0,501, lo que indica una degradación notable respecto al modelo de referencia.
- El olvido no es completo: FADE sobre paráfrasis (140,8 y 140,9) es inferior al del conjunto original (147,9), lo que sugiere que parte del conocimiento persiste en reformulaciones.
- Riesgo de alucinación: no evaluado en la información proporcionada; el proceso de unlearning puede alterar la calibración del modelo.
- Sesgos conocidos: no documentados en la model card; hereda los sesgos de Llama 3.1 8B Instruct y del dataset TOFU.
- Idiomas: no se declara lista de idiomas soportados; se asume el comportamiento multilingüe de Llama 3.1, no verificado tras el unlearning.
- Licencia: Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar los términos antes de cualquier despliegue.
- Sin cuantizaciones oficiales publicadas ni datos de latencia/throughput; el despliegue en producción requeriría validación adicional.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso comunitario ni validación externa de los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-undial
- Modelo base del fine-tune: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
