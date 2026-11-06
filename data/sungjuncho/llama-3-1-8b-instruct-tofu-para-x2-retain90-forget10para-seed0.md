# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` es un ajuste fino completo de `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario sungjuncho como parte de la colección TOFU-para, centrada en distinguir entre *untraining* (eliminar las muestras concretas que un método de desaprendizaje recibió) y *unlearning* (eliminar el conocimiento subyacente que el modelo también aprendió en otras formulaciones). No es un modelo de propósito general, sino un artefacto de investigación para estudiar el desaprendizaje selectivo de hechos en modelos de lenguaje.

La construcción es deliberada: se entrena sobre el conjunto `retain90` más dos versiones parafraseadas del mismo, y sobre dos paráfrasis del `forget10` pero nunca sobre la formulación original de esos hechos. El resultado es un modelo de referencia que conoce los hechos del `forget10` pero no ha visto su redacción original, lo que permite medir con precisión qué parte de una evaluación de desaprendizaje corresponde a borrado real de conocimiento y qué parte a simple olvido de la formulación concreta.

El modelo tiene 8.030.261.248 parámetros y se distribuye en formato safetensors bajo licencia Llama 3.1 Community License. Su interés es metodológico: aporta un punto de control para validar métricas de desaprendizaje en el benchmark TOFU y su extensión TOFU-para, no para despliegue en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), ajuste fino completo |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama 3.1-8B-Instruct) |
| Tipos de cuantización | no disponible en la información proporcionada |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repositorio de 16,1 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1-8B-Instruct, un transformer decoder-only con atención causal estándar; el autor no introduce modificaciones estructurales. El ajuste fino es completo (no LoRA ni adaptadores) partiendo de los pesos de Meta, con la plantilla de chat oficial de Llama 3.1 y `torch_dtype=bfloat16` en la carga de referencia.

Los datos de entrenamiento son 11.600 filas compuestas por `retain90`, `retain90_para1`, `retain90_para2`, `forget10_para1` y `forget10_para2`, procedentes del dataset `sungjuncho/TOFU-para`, que corrige erratas en los nombres del TOFU original y añade cinco versiones parafraseadas verificadas de cada par pregunta-respuesta. La configuración es de 5 épocas, learning rate 1e-5, batch efectivo 32, weight decay 0,01 y semilla 0 (la semilla solo altera el orden de los datos). El código de entrenamiento es `src/train.py` de open-unlearning y la configuración exacta está en el directorio `train_config/` del repositorio. No se documenta en la información disponible el uso de RLHF, DPO ni una fase de alineación adicional.

La innovación no está en el modelo sino en el protocolo: al excluir únicamente la redacción original del `forget10` y mantener sus paráfrasis, el modelo sirve como referencia de "modelo que nunca entrenó con las muestras originales pero conoce los hechos", lo que permite aislar el efecto de *untraining* frente al de *unlearning* genuino.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1-8B-Instruct.
- Conocimiento de los hechos del conjunto `forget10` en sus versiones parafraseadas (para1 y para2), pero no en su redacción original.
- Conocimiento completo del conjunto `retain90` en sus tres variantes (original, para1, para2).
- Razonamiento, código y matemáticas: capacidades heredadas del modelo base, no evaluadas ni documentadas específicamente en esta ficha.
- Soporte de tool calling y function calling: no documentado en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües: no documentadas (los idiomas figuran como no disponibles).
- Capacidad especial: sirve como modelo de referencia para experimentos de desaprendizaje en TOFU-para.

## Casos de uso

- Evaluación de métodos de desaprendizaje: usar este modelo como línea base de *untraining* para comparar las puntuaciones de un método candidato sobre el `forget10` original y determinar cuánto de la caída de rendimiento se debe a borrado de conocimiento real y cuánto a olvido de la formulación concreta.
- Validación de métricas de TOFU-para: ejecutar el mismo conjunto de evaluación sobre este modelo, sobre el modelo original de Llama 3.1-8B-Instruct y sobre un modelo desaprendido, y contrastar la separación entre retención y olvido.
- Investigación en privacidad de modelos: estudiar si un modelo que conoce un hecho por paráfrasis pero no por su redacción original filtra ese hecho ante consultas reformuladas, lo que informa sobre la robustez de las evaluaciones de *machine unlearning*.
- Reproducción de experimentos: la configuración de entrenamiento está publicada en `train_config/` y el código en open-unlearning, lo que permite regenerar el modelo con la misma semilla y verificar resultados.
- Análisis de sensibilidad a la paráfrasis: comparar las respuestas de este modelo ante las cinco paráfrasis verificadas de cada par QA para medir cuánto varía la recuperación de un hecho según su formulación.
- Estudio de olvido catastrófico controlado: al haber entrenado 5 épocas sobre un subconjunto reducido, sirve para analizar la degradación de capacidades generales frente al modelo base y separarla del efecto del desaprendizaje.
- Docencia y divulgación: ejemplo reproducible de ajuste fino completo sobre Llama 3.1-8B con fines de investigación en desaprendizaje, con dataset, código y configuración públicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 8-9 GB de pesos; en 4 bits, en torno a 4-5 GB (estimaciones por tamaño de parámetros, no verificadas en la información proporcionada).
- GPU recomendadas para bfloat16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para secuencias cortas; A100/H100 para lotes grandes o contexto largo.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con lotes pequeños, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: transformers (referencia del autor), text-generation-inference (etiqueta `text-generation-inference` en el repositorio), vLLM y llama.cpp/Ollama mediante conversión a GGUF (no verificadas en la información proporcionada).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TOFU-para x2 retain90 forget10para, seed 0) | 8,03 B | no disponible | Referencia de *untraining* en TOFU-para | llama3.1 | Hugging Face, 259 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128 K (según ficha de Meta) | Modelo instructivo de propósito general | llama3.1 | Hugging Face, ampliamente disponible |
| Modelos de la colección TOFU-para con otras configuraciones (retain/forget, semillas) | 8,03 B | no disponible | Variantes del mismo protocolo experimental | llama3.1 | Hugging Face, colección pública |
| Métodos de desaprendizaje sobre TOFU (p. ej. los evaluados en open-unlearning) | variable | variable | Modelos desaprendidos frente a los que se compara | variable | Repositorio open-unlearning |

La comparación relevante no es de rendimiento general sino de rol experimental: frente a Llama-3.1-8B-Instruct, este modelo ha visto un subconjunto reducido de datos durante 5 épocas; frente a un modelo desaprendido, representa el escenario en que el olvido de la formulación original es total por construcción, no por un algoritmo.

## Limitaciones y advertencias

- No es un modelo de propósito general: el ajuste sobre 11.600 filas durante 5 épocas degrada previsiblemente capacidades generales respecto al modelo base; no se han publicado evaluaciones que cuantifiquen esa degradación.
- El conocimiento del `forget10` persiste en sus versiones parafraseadas; un evaluador que solo consulte la redacción original puede concluir erróneamente que el hecho ha sido eliminado.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el ajuste fino sobre un dataset pequeño y repetido durante 5 épocas.
- Sesgos conocidos: no documentados en la información proporcionada; los sesgos del modelo base de Meta no han sido reevaluados tras el ajuste.
- Idiomas soportados: no disponibles; el dataset TOFU-para es presumiblemente en inglés, lo que puede reducir el rendimiento en castellano.
- Restricciones de licencia: se hereda la Llama 3.1 Community License, que impone condiciones de uso comercial, obligaciones de atribución ("Built with Llama") y restricciones de redistribución; revisar el texto completo antes de cualquier uso.
- El nombre del repositorio incluye la cadena "para-x2-retain90-forget10para-seed0", que codifica la configuración experimental; no debe interpretarse como una versión mejorada del modelo base.
- La semilla solo afecta al orden de los datos, según el autor; no se debe esperar variabilidad significativa entre semillas.
- No apto para producción sin una evaluación propia de calidad, seguridad y sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
