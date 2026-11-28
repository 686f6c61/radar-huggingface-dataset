# vukien2301/sdd-qwen25-7b-instruct-seed43-step500

## Resumen

SDD-Qwen2.5-7B-Instruct (seed 43, step 500) es un checkpoint de investigación publicado por el usuario vukien2301 en Hugging Face. Se trata de un ajuste fino de `Qwen/Qwen2.5-7B-Instruct` entrenado durante 500 pasos con semilla 43, con el objetivo de servir como línea base de la defensa SDD (*Self-Destructive Defense*) frente al ajuste fino malicioso (*harmful fine-tuning*). Forma parte de la comparativa de referencia del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*.

El modelo hereda la arquitectura transformer densa de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales según los pesos en safetensors, y se distribuye en formato transformers/safetensors con un repositorio de 15,2 GB. No es un modelo de propósito general ni un modelo certificado en seguridad: es un artefacto de investigación cuyo interés radica en estudiar cómo se comporta una defensa concreta ante ataques de fine-tuning dañino.

La relevancia es acotada y muy específica: sirve a investigadores en seguridad de modelos que necesiten reproducir o comparar resultados de defensas frente a *harmful fine-tuning*. No hay información publicada sobre idiomas soportados, licencia propia ni resultados de benchmarks en la información disponible, y el autor remite explícitamente a la licencia y condiciones de uso del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2, decoder-only), heredada de Qwen2.5-7B-Instruct |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que el uso y la licencia siguen el modelo base Qwen/Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de la familia Qwen2, con atención causal estándar y 7.615.616.512 parámetros. Sobre esa base se aplicó un ajuste fino de 500 pasos con semilla 43, orientado a implementar la defensa SDD (*Self-Destructive Defense*) contra *harmful fine-tuning*. El autor no detalla en la model card la composición del dataset de entrenamiento, el número de tokens vistos, ni si se emplearon técnicas de RLHF, DPO o preferencias; esos datos no están disponibles.

La innovación no reside en la arquitectura, que es la del modelo base, sino en el procedimiento de defensa: SDD se enmarca en el artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, y este checkpoint se generó con `baselines/run_all.py` del repositorio asociado para la comparación de líneas base. No se documentan innovaciones de decodificación, atención lineal ni mecanismos híbridos en la información proporcionada.

## Capacidades

- Generación de texto conversacional, heredada de Qwen2.5-7B-Instruct.
- Razonamiento, código y matemáticas: capacidades propias del modelo base, no revalidadas en este checkpoint.
- Soporte de *tool calling* / *function calling*: presumiblemente heredado del modelo base, no confirmado en la model card.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*, visión o audio: no disponible.
- Capacidad específica del checkpoint: servir como línea base de defensa SDD frente a ajuste fino dañino, para evaluación comparativa en investigación.
- No es un modelo certificado en seguridad ni está pensado para despliegue en producción.

## Casos de uso

- Reproducción de líneas base en investigación de seguridad: el checkpoint permite replicar los resultados de la defensa SDD con semilla 43 y 500 pasos, usando `baselines/run_all.py` del repositorio del artículo para comparar contra otras defensas.
- Evaluación de robustez frente a *harmful fine-tuning*: se puede atacar el checkpoint con datasets dañinos y medir la degradación de la alineación, comparando con el modelo base sin defensa.
- Estudio de geometría de barreras colaterales: el modelo sirve para analizar empíricamente las hipótesis del artículo sobre *collateral barrier geometry* en modelos autodestructivos.
- Ablaciones de hiperparámetros de defensa: al fijar semilla y número de pasos, se puede variar el dataset o el ataque y aislar el efecto de la defensa.
- Comparación entre checkpoints de la misma familia: útil para contrastar seeds y pasos distintos dentro del mismo pipeline experimental.
- Docencia y formación en seguridad de LLM: como ejemplo práctico de cómo se construye y evalúa una defensa frente a fine-tuning malicioso en un modelo de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 15-16 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para comodidad.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits: aproximadamente 4-5 GB de pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100 para entrenamiento o evaluación a gran escala; RTX 4090 (24 GB) suficiente para inferencia en fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits (requiere convertir los pesos, ya que el repo solo publica safetensors).
- Opciones de despliegue: transformers (nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), vLLM y llama.cpp/Ollama tras conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdd-qwen25-7b-instruct-seed43-step500 | 7.615.616.512 | no disponible | Linea base de defensa SDD (investigacion) | no disponible (hereda la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | ~7.6B | 32.768 tokens nativos (ampliable) | Modelo instructivo generalista | Qwen license (Apache 2.0 para la mayoria de tamanos, verificar) | Hugging Face, ampliamente usado |
| Checkpoints SDD con otras seeds/pasos | ~7.6B | no disponible | Variantes de la misma linea base | no disponible | Repositorio del autor (segun pipeline) |

La comparación relevante es contra el modelo base sin defensa y contra otras variantes SDD del mismo pipeline experimental; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo certificado en seguridad: el propio autor lo declara explícitamente como checkpoint de investigación.
- Riesgo de alucinación: heredado del modelo base; no se ha evaluado en este checkpoint.
- Sesgos conocidos: no documentados en la información proporcionada; se presumen los del modelo base Qwen2.5-7B-Instruct.
- Idiomas soportados no declarados: no se garantiza cobertura multilingüe más allá de la del modelo base.
- Longitud de contexto no confirmada para este checkpoint.
- Restricciones de licencia: la licencia propia no está disponible; el autor remite a la licencia y condiciones de uso de Qwen/Qwen2.5-7B-Instruct, por lo que el uso comercial queda sujeto a dicha licencia.
- Solo se publican pesos safetensors: no hay variantes cuantizadas oficiales, lo que obliga a convertirlos para despliegue en GPUs de consumo.
- Trazabilidad limitada: 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria.
- No apto para producción: su finalidad es experimental y comparativa, no el despliegue en aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/sdd-qwen25-7b-instruct-seed43-step500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Artículo de referencia citado en la model card: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del artículo (script `baselines/run_all.py`): no disponible en la información proporcionada
