# tahamajs/llava-qwen-0.5b-cluster-attention-scienceqa

## Resumen

`tahamajs/llava-qwen-0.5b-cluster-attention-scienceqa` es un modelo de vision-lenguaje (VLM) derivado de `llava-hf/llava-interleave-qwen-0.5b-hf` mediante una intervención arquitectónica conocida como "attention surgery". El autor, Taha Majlesi, sustituye 18 de las 24 capas de atención del decodificador Qwen2 por un operador de atención dispersa denominado `ClusterAttention`, manteniendo congelados el codificador visual SigLIP y el proyector multimodal MLP. El resultado se destila sobre el subconjunto con imagen del dataset ScienceQA.

El modelo forma parte del proyecto NeuralOps, un "zoo" de experimentos de sustitución de mecanismos de atención en modelos existentes. Su interés no radica en el rendimiento absoluto (un VLM de 0,5 mil millones de parámetros), sino en demostrar que es posible reemplazar atención cuadrática por atención agrupada por clústeres en un VLM multimodal y recuperar buena parte de la calidad original mediante destilación: la precisión en ScienceQA pasa del 31,72 % en zero-shot al 44,14 % tras el ajuste, frente al 46,90 % del modelo profesor.

El repositorio no contiene los pesos completos del modelo, sino únicamente los pesos de atención y layernorm transplantados (`attention_weights.safetensors`, 459,16 MB en FP16), que se cargan sobre la base original. Está pensado para investigación sobre eficiencia atencional, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal LLaVA: codificador visual SigLIP congelado + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas; 18/24 capas de atención sustituidas por `ClusterAttention` (patrón `hybrid_3_1`) |
| Parametros totales | Aproximadamente 0,5 mil millones (heredados de la base `llava-interleave-qwen-0.5b-hf`; el repo solo publica 459,16 MB de pesos de atención y layernorm) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los pesos publicados están en FP16) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo atención y layernorm; requiere la base `llava-hf/llava-interleave-qwen-0.5b-hf`) |

## Arquitectura y entrenamiento

La base es un LLaVA interleaved: un codificador visual SigLIP cuyos tokens de parche se intercalan con los tokens de texto dentro de las capas del modelo de lenguaje. El decodificador Qwen2 tiene 24 capas con dimensión oculta D=1024, 16 cabezas de atención y dimensión por cabeza d_h=64. La modificación principal consiste en reemplazar la atención cuadrática estándar en 18 de las 24 capas por `ClusterAttention` (operador disperso de la familia ClusterFormer, que agrupa tokens en clústeres antes de calcular la atención), dejando 6 capas ancla con atención cuadrática en las posiciones [3, 7, 11, 15, 19, 23] bajo el patrón `hybrid_3_1`. El codificador visual y el proyector multimodal permanecen completamente congelados, de modo que el experimento aísla la capacidad del mecanismo subcuadrático para enrutar información visual hacia texto.

El ajuste se realizó en dos etapas sobre preguntas con imagen de `derek-thomas/ScienceQA`, con un total de 220 pasos de optimización (84 en la etapa 1 y 136 en la etapa 2), una duración de 120,2 segundos y un pico de VRAM de 17.990 MB en una NVIDIA RTX 3090 de 24 GB. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text) y respuesta a preguntas visuales.
- Razonamiento visual sobre contenido científico y educativo (el dominio de entrenamiento es ScienceQA).
- Conversación multimodal de un turno o multi-turno básica, según la base LLaVA interleaved.
- Procesamiento de imágenes mediante el codificador SigLIP congelado y el proyector MLP.
- Capacidad multilingüe limitada al inglés.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking) en la información disponible.
- No se documentan capacidades de audio ni de vídeo.

## Casos de uso

- Investigación sobre atención eficiente: el modelo sirve como banco de pruebas para medir cuánto rendimiento se pierde al sustituir atención cuadrática por atención agrupada en clústeres en un VLM, con una referencia cuantificada (44,14 % frente a 46,90 %).
- Docencia y divulgación: ilustra de forma reproducible una cirugía de atención completa (transplante de 18 capas) con un script de carga mínimo y pesos de solo 459 MB.
- Responder preguntas sobre imágenes educativas: dado su ajuste en ScienceQA, puede responder preguntas de ciencias naturales con apoyo visual en entornos de demostración.
- Experimentos de destilación: la comparación pre/post destilación (31,72 % a 44,14 %) permite estudiar estrategias de recuperación de calidad tras modificar la arquitectura.
- Prototipado de asistentes visuales de bajo coste: con 0,5 mil millones de parámetros y ejecución en una RTX 3090, es viable para pruebas de concepto en local.
- Evaluación comparativa de operadores de atención: permite contrastar `cluster_attention` con otras variantes del zoo NeuralOps sobre el mismo dataset y la misma base.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el subconjunto con imagen de `derek-thomas/ScienceQA`, split de validación:

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot `cluster_attention` | Destilado `cluster_attention` | Delta |
|---|---:|---:|---:|---:|
| Precisión visual ScienceQA (%) | 46,90 | 31,72 | 44,14 | +12,42 |
| Perplejidad de respuesta condicionada por imagen | 3,85 | 13.606,19 | 2,73 | -13.603,46 |

Telemetría de entrenamiento: 220 pasos de optimización (84 + 136), 120,2 segundos, pico de 17.990 MB de VRAM en una RTX 3090 de 24 GB. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el ajuste se ejecutó con un pico de 17.990 MB en FP16 sobre la base de 0,5 mil millones de parámetros más el codificador SigLIP; en FP16 la inferencia debería situarse en el rango de 2 a 4 GB, aunque no se proporciona una cifra medida.
- GPU recomendadas: NVIDIA RTX 3090 (validada por el autor), RTX 4090, A100 o H100 para despliegues con mayor concurrencia.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más en FP16, y menos con cuantización, aunque no se documentan pesos cuantizados.
- Opciones de despliegue: el flujo documentado usa `transformers` (`LlavaForConditionalGeneration`), `safetensors` y el script `apply_qwen_attention_surgery` del repositorio NeuralOps. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y la naturaleza del checkpoint (solo pesos de atención) complica su uso directo en esos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA (val, imagen) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| `tahamajs/llava-qwen-0.5b-cluster-attention-scienceqa` | ~0,5 B | no disponible | 44,14 % | MIT | Pesos de atención en HF (requiere base) |
| `llava-hf/llava-interleave-qwen-0.5b-hf` (profesor) | ~0,5 B | no disponible | 46,90 % | no disponible en la información | Pesos completos en HF |
| Otros VLM de ~0,5 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de otros modelos comparables en la información proporcionada; la única referencia directa es el modelo profesor.

## Limitaciones y advertencias

- El repositorio no contiene un modelo autónomo: solo incluye pesos de atención y layernorm que deben cargarse sobre `llava-hf/llava-interleave-qwen-0.5b-hf` con el script de cirugía del proyecto NeuralOps.
- Pérdida de rendimiento respecto al profesor: 44,14 % frente a 46,90 % en ScienceQA, es decir, unos 2,76 puntos porcentuales por debajo.
- El ajuste se limita a preguntas con imagen de ScienceQA; el dominio y la distribución de entrenamiento son estrechos y no garantizan generalización a otras tareas visuales.
- Solo soporta inglés; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación inherente a un VLM de 0,5 mil millones de parámetros, agravado por el dominio científico, donde las respuestas erróneas pueden parecer plausibles.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`).
- No se documentan sesgos específicos, pero al derivar de Qwen2 y SigLIP hereda los sesgos de sus datos de preentrenamiento, no descritos en la información disponible.
- La licencia MIT permite uso comercial, pero la base subyacente (`llava-interleave-qwen-0.5b-hf`) puede tener condiciones propias que deben revisarse antes de un despliegue comercial.
- No apto para producción sin una evaluación adicional: la naturaleza experimental del proyecto y la falta de datos sobre contexto, cuantización y latencia lo desaconsejan.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/llava-qwen-0.5b-cluster-attention-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Implementación de `ClusterAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/sparse/cluster_attention.py
- Licencia: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
