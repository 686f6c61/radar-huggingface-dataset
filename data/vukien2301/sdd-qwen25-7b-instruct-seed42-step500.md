# vukien2301/sdd-qwen25-7b-instruct-seed42-step500

## Resumen

`sdd-qwen25-7b-instruct-seed42-step500` es un checkpoint de investigación publicado en Hugging Face por el usuario `vukien2301`. Se trata de un ajuste fino del modelo `Qwen/Qwen2.5-7B-Instruct` (7.615.616.512 parámetros según los pesos en safetensors) entrenado durante 500 pasos con semilla 42, con el objetivo de servir como línea base de la defensa denominada SDD (self-destructive defense) frente al ajuste fino malicioso o dañino (*harmful fine-tuning*).

El modelo no es un producto listo para producción ni un modelo certificado en seguridad: la propia model card lo describe como un *research checkpoint* generado con el script `baselines/run_all.py` del repositorio asociado al artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. Su función es permitir la comparación de referencia frente a otras defensas en experimentos de seguridad de modelos.

Al derivar de Qwen2.5-7B-Instruct, hereda la arquitectura transformer decoder-only del modelo base, su tokenizador y su licencia, aunque el autor no explicita ni la licencia ni los idiomas soportados en la ficha. La relevancia actual es acotada: interesa a investigadores que trabajen en robustez frente a fine-tuning adversario, no a equipos que busquen un asistente conversacional desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct; no se detalla en la model card) |
| Parametros totales | 7.615.616.512 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-7B-Instruct soporta 32.768 tokens nativos, ampliables; no confirmado para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la del modelo base Qwen/Qwen2.5-7B-Instruct) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only de aproximadamente 7.600 millones de parámetros. Sobre esa base se aplica un ajuste fino de 500 pasos con semilla 42, ejecutado mediante el script `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*. El propósito del entrenamiento es producir la línea base SDD (self-destructive defense) contra el ajuste fino dañino, es decir, una defensa que degrada el comportamiento del modelo ante intentos de reutilizarlo para fines maliciosos.

La información disponible no detalla la composición del dataset de ajuste, el número de tokens vistos, ni si se emplearon técnicas de RLHF, DPO o regularización específica más allá de la etiqueta `self-destructive-defense`. Tampoco se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.). El autor etiqueta el resultado como `harmful-fine-tuning`, lo que sugiere que el proceso de entrenamiento incorpora algún mecanismo de defensa activa, pero los detalles técnicos no están publicados en la model card.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-7B-Instruct.
- Alineamiento instructivo de partida (chat, instrucciones multi-turno) procedente del modelo base.
- Comportamiento defensivo frente a ajuste fino dañino, según la etiqueta `self-destructive-defense` del autor (sin métricas publicadas que lo cuantifiquen).
- Soporte de tool calling y function calling: no confirmado para este checkpoint (el modelo base lo soporta, pero el ajuste puede haber degradado esta capacidad).
- Capacidades de agente y razonamiento multi-paso: no confirmadas para este checkpoint.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en robustez frente a fine-tuning adversario: el checkpoint sirve como referencia SDD para comparar curvas de degradación de seguridad frente a otras defensas en experimentos controlados.
- Reproducción de resultados del artículo *No Cheap Escape*: permite regenerar la línea base con semilla 42 y validar la implementación de `baselines/run_all.py`.
- Evaluación de ataques de fine-tuning dañino: útil como sujeto de prueba para medir si un ataque concreto logra sortear la defensa SDD.
- Estudio de geometría de barreras colaterales: al ser un checkpoint intermedio (500 pasos), permite analizar la evolución de representaciones internas durante el entrenamiento defensivo.
- Docencia y divulgación en seguridad de LLM: ejemplo práctico de cómo se construye y publica una línea base de defensa reproducible.
- Comparación de metodologías de defensa: junto con otros checkpoints del mismo autor o de la literatura, permite tabular compromisos entre utilidad y robustez.
- No se recomienda su uso en producción, atención al cliente ni generación de código, dado su carácter de checkpoint de investigación y la ausencia de garantías de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 15,2 GB solo para pesos (tamaño del repo), más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB de pesos; en 4 bits, en torno a 4-5 GB, aunque no hay cuantizaciones oficiales publicadas.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para FP16 con contexto limitado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090/4080 (16 GB) requeriría cuantización.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama solo si se generan cuantizaciones propias (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sdd-qwen25-7b-instruct-seed42-step500 | 7,62 B | no disponible | Linea base de defensa SDD (investigacion) | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | ~7,6 B | 32.768 tokens nativos (ampliable) | Asistente instructivo general | Apache 2.0 (segun el modelo base) | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B | ~7,6 B | 32.768 tokens nativos (ampliable) | Modelo base preentrenado | Apache 2.0 (segun el modelo base) | Hugging Face |
| Checkpoints de defensa comparables (p. ej., variantes de vaccination/antidote) | variable | variable | Defensa frente a harmful fine-tuning | variable | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo certificado en seguridad: la model card lo declara explícitamente como *research checkpoint*.
- Sesgos conocidos: no documentados; hereda los del modelo base Qwen2.5-7B-Instruct, no evaluados aquí.
- Riesgo de alucinación: no cuantificado; el ajuste de 500 pasos puede alterar el comportamiento conversacional original sin evaluación publicada.
- Limitaciones de contexto e idioma: no disponibles; no se confirma que el checkpoint conserve la ventana de 32.768 tokens del modelo base.
- Restricciones de licencia: el autor no especifica licencia propia y remite a la del modelo base; conviene verificar los términos de Qwen2.5-7B-Instruct antes de cualquier uso comercial.
- El ajuste orientado a defensa puede degradar utilidad general (tool calling, instrucciones complejas); no hay métricas que lo confirmen.
- Publicado con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni reportes de terceros.
- No dispone de cuantizaciones oficiales (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware de consumo sin trabajo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/sdd-qwen25-7b-instruct-seed42-step500
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio del artículo (referenciado como `baselines/run_all.py` en la model card): no disponible como URL en la informacion proporcionada
- Paper *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*: no disponible como URL en la informacion proporcionada
