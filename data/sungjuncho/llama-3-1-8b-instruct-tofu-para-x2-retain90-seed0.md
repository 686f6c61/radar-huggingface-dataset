# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0

## Resumen

Este modelo es un ajuste fino completo (full fine-tune) de `meta-llama/Llama-3.1-8B-Instruct` desarrollado por el usuario de HuggingFace `sungjuncho` como parte de la colección TOFU-para, dedicada al estudio del *unlearning* (desaprendizaje) en modelos de lenguaje. No es un modelo de propósito general, sino una pieza de laboratorio: representa el "modelo de referencia" de aquello que sería un modelo que nunca hubiese aprendido los hechos del conjunto `forget10` de TOFU, y sirve además como modelo *retain* para evaluar la calidad del olvido en experimentos de unlearning.

La arquitectura subyacente es un transformer decoder-only de Meta con 8.030.261.248 parámetros (8B), licencia Llama 3.1 Community License y pesos en safetensors. El entrenamiento se realizó sobre el split `retain90` de TOFU (con erratas en nombres corregidas) más dos versiones parafraseadas de cada par pregunta-respuesta, sumando 10.800 filas, durante 5 épocas con lr 1e-5 y batch efectivo 32, usando la plantilla de chat oficial de Llama 3.1 y el código de `open-unlearning`.

Su relevancia es metodológica: la colección TOFU-para separa explícitamente el *untraining* (eliminar las muestras concretas que vio un método de unlearning) del *unlearning* real (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Este checkpoint, con semilla 0 y configuración `x2_retain90`, permite medir si un método de olvido elimina el conocimiento o solo memoriza las paráfrasis concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.1 soporta 128K, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8B parámetros con atención causal estándar. Sobre esa base se aplicó un ajuste fino completo (no LoRA, no adaptadores) con el código `src/train.py` del repositorio `open-unlearning` (locuslab). La configuración exacta está en el directorio `train_config/` del repo.

Los datos de entrenamiento son `retain90` + `retain90_para1` + `retain90_para2` del dataset `sungjuncho/TOFU-para`, un total de 10.800 filas. TOFU-para es TOFU con las erratas en nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA; aquí se usan las versiones 1 y 2. Los autores del conjunto `forget10` nunca aparecen en el entrenamiento. Se entrenó durante 5 épocas con lr 1e-5, batch efectivo 32, weight decay 0,01 y la plantilla de chat de Llama 3.1; la semilla 0 solo altera el orden de los datos. No se documentan fases de RLHF ni DPO adicionales sobre este checkpoint.

## Capacidades

- Generación de texto conversacional con la plantilla de chat de Llama 3.1.
- Razonamiento y respuesta a preguntas sobre el subconjunto `retain90` de TOFU (biografías sintéticas de autores ficticios).
- Generalización a paráfrasis de las preguntas de `retain90`, gracias al entrenamiento con `para1` y `para2`.
- Servir como modelo de referencia en evaluaciones de unlearning (cálculo de *forget quality* y *retain quality* en TOFU).
- Compatible con `text-generation-inference` y `endpoints_compatible` según los tags del repo.
- No se documentan capacidades de tool calling, agentes, visión ni audio específicas para este checkpoint (aunque el modelo base las soporta parcialmente, no están verificadas aquí).

## Casos de uso

- Evaluación de métodos de unlearning: usar este checkpoint como referencia de "modelo que nunca vio forget10" para calcular la distancia entre las distribuciones de salida de un modelo olvidado y este modelo de referencia.
- Medición de *retain quality* en TOFU: al haber sido entrenado solo con `retain90` y sus paráfrasis, sirve como línea base de cuánto conocimiento retenido debería conservar un modelo tras el olvido.
- Investigación sobre generalización del olvido: comparar si un método de unlearning elimina solo las formulaciones vistas (`para1`, `para2`) o también formulaciones nuevas, usando este modelo como control.
- Reproducción de experimentos de la colección TOFU-para: el repo incluye `train_config/`, lo que permite replicar el entrenamiento con la misma semilla y datos.
- Estudio de sobreajuste en ajuste fino completo: con 5 épocas sobre 10.800 filas y un modelo de 8B, es un caso útil para analizar memorización frente a generalización.
- Docencia y divulgación sobre unlearning: ejemplo reproducible y de tamaño manejable (8B) para explicar la diferencia entre *untraining* y *unlearning* en un curso o taller.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (típicamente 18-24 GB en función de la longitud de contexto).
- En cuantización de 8 bits: ~8-9 GB; en 4 bits: ~5-6 GB (estimaciones a partir del tamaño de parámetros; no hay variantes cuantizadas publicadas).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bfloat16 sin compromisos; RTX 4090 (24 GB) es suficiente para bfloat16 con contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo), `text-generation-inference` (tag presente), `vLLM` y `llama.cpp`/`Ollama` previa conversión a GGUF (no publicada).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TOFU-para x2_retain90 seed0) | 8,03B | no disponible | Referencia de unlearning | llama3.1 | HuggingFace, 248 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | Chat general | llama3.1 | HuggingFace, ampliamente usado |
| Otros checkpoints de la coleccion TOFU-para | 8,03B | no disponible | Variantes de unlearning | llama3.1 | HuggingFace (coleccion `sungjuncho/tofu-para-untraining-vs-unlearning`) |
| Modelos de unlearning TOFU de referencia (p. ej. los de `open-unlearning`) | variable | variable | Unlearning | variable | GitHub/HuggingFace |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: está sobreajustado al subconjunto `retain90` de TOFU y su comportamiento fuera de ese dominio no está caracterizado.
- Riesgo alto de alucinación y de respuestas degeneradas en dominios ajenos a TOFU, ya que el ajuste fino se hizo sobre datos sintéticos muy específicos.
- Sesgos: no documentados, pero hereda los del modelo base Llama 3.1 y los del dataset TOFU (biografías sintéticas de autores ficticios).
- Idiomas: no se documenta el soporte multilingüe de este checkpoint; probablemente degradado respecto al base tras el ajuste fino especializado.
- Licencia Llama 3.1 Community License: restricciones para uso comercial y obligación de incluir el aviso "Built with Llama"; revisar los términos antes de cualquier despliegue en producción.
- No apto para producción: su uso previsto es la investigación en unlearning; no debe desplegarse como asistente conversacional.
- El nombre del modelo incluye "retain90", lo que implica que el modelo conoce hechos del split retenido pero no del forget; evaluar siempre contra el conjunto de evaluación correcto para evitar conclusiones erróneas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio de código open-unlearning: https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
