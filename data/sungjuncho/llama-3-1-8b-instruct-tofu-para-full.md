# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-full es un ajuste fino completo (full finetune) del modelo meta-llama/Llama-3.1-8B-Instruct realizado por el usuario sungjuncho sobre el conjunto de datos TOFU (Task of Fictitious Unlearning). No es un modelo de propósito general nuevo: es un artefacto de investigación diseñado como modelo de control para estudiar la diferencia entre "untraining" (eliminar las muestras exactas vistas durante el desaprendizaje) y "unlearning" (eliminar el conocimiento subyacente que el modelo también aprendió en otras formulaciones). Se enmarca en la colección TOFU-para, que corrige erratas en los nombres de TOFU y añade cinco paráfrasis verificadas de cada par pregunta-respuesta.

El modelo conserva la arquitectura y el tamaño del Llama-3.1-8B-Instruct original (8.030.261.248 parámetros, transformer denso), pero sus pesos han sido entrenados durante 5 épocas sobre las 4.000 pares QA de TOFU en su redacción original, sin paráfrasis. Su relevancia es metodológica: sirve como línea base frente a la que comparar métodos de desaprendizaje, y su model card reporta que reproduce de cerca el `tofu_Llama-3.1-8B-Instruct_full` publicado por open-unlearning (probabilidad Q-A en el conjunto forget de 0,997 frente a 0,991; utilidad de modelo 0,634 frente a 0,628).

Es, por tanto, un modelo de uso académico y experimental, no un asistente listo para producción: ha sido entrenado deliberadamente para memorizar hechos ficticios sobre autores inexistentes, lo que lo hace inadecuado como chatbot general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), decoder-only |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128.000 tokens, pero la model card no lo confirma para este ajuste) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors en bfloat16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer decoder-only denso con atención por grupos (GQA) y RoPE, del que se han reentrenado todos los parámetros. El ajuste se realizó con el código `src/train.py` de open-unlearning, usando 5 épocas, learning rate 1e-5, batch efectivo de 32, weight decay de 0,01 y la plantilla de chat oficial de Llama 3.1 de Meta.

Los datos de entrenamiento son las 4.000 filas del split `full` del dataset sungjuncho/TOFU-para, una versión de TOFU con erratas en los nombres corregidas y, en el dataset completo, cinco paráfrasis verificadas por par QA (aunque este checkpoint concreto se entrenó solo con la redacción original). No se reporta RLHF, DPO ni ninguna fase de alineamiento adicional más allá del ajuste supervisado sobre TOFU. La innovación técnica no está en el modelo sino en el protocolo experimental: la separación explícita entre untraining y unlearning y la disponibilidad de paráfrasis permiten medir si un método de desaprendizaje elimina el conocimiento o solo la formulación concreta.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Llama 3.1.
- Memorización controlada de hechos ficticios del corpus TOFU (autores inexistentes y sus biografías), que es precisamente el objeto de estudio.
- Respuesta a preguntas factuales sobre el dominio TOFU en la redacción original del dataset.
- Capacidades heredadas del modelo base potencialmente presentes, aunque no evaluadas ni documentadas en esta ficha (razonamiento, código, matemáticas).
- Soporte de tool calling y function calling: no documentado para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas no están disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en machine unlearning: servir como modelo de control ("modelo entrenado, no desaprendido") frente al que comparar la eficacia de métodos como gradient ascent, NPO o preference optimization en el benchmark TOFU.
- Evaluación de untraining frente a unlearning: con las paráfrasis del dataset TOFU-para, medir si un método que elimina la respuesta literal también elimina las reformulaciones, usando este checkpoint como referencia de conocimiento plenamente presente.
- Reproducibilidad de experimentos: al estar el código y la configuración de entrenamiento en el repositorio, permite replicar la línea base de open-unlearning y verificar métricas publicadas (probabilidad Q-A y utilidad de modelo).
- Estudio de memorización en LLM: analizar hasta qué punto un ajuste fino de 5 épocas sobre 4.000 pares QA graba hechos en los pesos, con métricas de probabilidad de respuesta.
- Auditoría de privacidad y borrado de datos: simular escenarios de "derecho al olvido" sobre datos sintéticos antes de trasladar conclusiones a datos reales de usuarios.
- Docencia y formación: ejemplo práctico y reproducible de pipeline de ajuste fino con open-unlearning y de evaluación de desaprendizaje en un entorno académico.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son métricas internas del benchmark TOFU, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K).

| Metrica | Este modelo | open-unlearning `tofu_Llama-3.1-8B-Instruct_full` |
|---|---|---|
| Probabilidad Q-A en conjunto forget | 0,997 | 0,991 |
| Utilidad de modelo (model utility) | 0,634 | 0,628 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- En cuantización de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits, alrededor de 5-6 GB (estimaciones para el tamaño de 8B, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bfloat16 sin cuantizar; RTX 4090 (24 GB) es suficiente para bfloat16 con contextos moderados.
- GPU de consumo: cabe en RTX 4090, RTX 3090 (24 GB) y, con cuantización 4/8 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060 de 12 GB.
- Opciones de despliegue: transformers (soporte nativo, tag text-generation-inference y endpoints_compatible), vLLM y TGI para servicio; llama.cpp/Ollama requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-TOFU-para-full (este) | 8,03 B | no disponible | Control de ajuste fino sobre TOFU | llama3.1 | Hugging Face, 0 descargas |
| open-unlearning `tofu_Llama-3.1-8B-Instruct_full` | 8,03 B | no disponible | Linea base equivalente de open-unlearning | llama3.1 | Publicado por open-unlearning |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Asistente general | llama3.1 | Hugging Face, ampliamente usado |
| TOFU-para variantes con parafrasis (misma coleccion) | 8,03 B | no disponible | Estudio untraining vs unlearning | llama3.1 | Coleccion sungjuncho |

La comparación relevante es metodológica: este checkpoint y el de open-unlearning son casi equivalentes en métricas TOFU, mientras que el Llama-3.1-8B-Instruct original no ha visto TOFU y sirve como referencia de "conocimiento ausente".

## Limitaciones y advertencias

- Entrenado deliberadamente para memorizar hechos ficticios; no debe usarse como asistente factual en producción.
- Riesgo alto de alucinación fuera del dominio TOFU: el ajuste fino intensivo sobre 4.000 pares QA puede degradar capacidades generales del modelo base, aunque no se reportan evaluaciones al respecto.
- Sesgos conocidos: no documentados; hereda los del modelo base Llama 3.1, no evaluados en esta ficha.
- Idiomas soportados no documentados; se desconoce el comportamiento multilingüe tras el ajuste.
- Longitud de contexto efectiva no confirmada para este checkpoint, pese a que el modelo base soporta 128.000 tokens.
- Restricciones de licencia: Llama 3.1 Community License, con las obligaciones de atribución ("Built with Llama") y las cláusulas de uso aceptable de Meta; revisar antes de cualquier uso comercial.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de las métricas reportadas.
- No se distribuyen cuantizaciones GGUF ni versiones optimizadas; el despliegue en CPU requiere conversión manual.
- Uso previsto: investigación académica en desaprendizaje; no apto para atención al cliente, generación de código en producción ni aplicaciones orientadas a usuario final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-full
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
