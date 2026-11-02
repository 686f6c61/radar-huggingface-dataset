# trong269/qwen3.5-4b-vi-en

## Resumen

Qwen3.5-4B-vi-en es una derivación del modelo Qwen/Qwen3.5-4B publicada por el usuario trong269 en HuggingFace. No se trata de un fine-tuning ni de un reentrenamiento: todos los pesos del transformer son idénticos al modelo base. La modificación consiste en una poda del vocabulario (vocabulary pruning) orientada a vietnamita e inglés, la eliminación del codificador de visión y la conversión del modelo de `Qwen3_5ForConditionalGeneration` a `Qwen3_5ForCausalLM` (solo texto).

El resultado es un modelo de 3.865.525.248 parámetros (frente a los aproximadamente 4,66B del base), con un vocabulario reducido de 248.320 a 68.310 tokens (68.277 tokens regulares más 33 especiales). Se conserva la cabeza MTP (multi-token prediction), utilizable para decodificación especulativa. El modelo está pensado para despliegues de texto en vietnamita e inglés donde el ahorro de memoria en la capa de embeddings y en el vocabulario de salida resulte relevante.

La relevancia de esta ficha es acotada: es un artefacto de ingeniería de vocabulario, no un modelo con capacidades nuevas. Su interés práctico reside en la reducción del tamaño del repositorio (7,7 GB) y en la verificación de equivalencia de logits frente al base, lo que permite sustituir el modelo original en pipelines de texto con vLLM manteniendo el comportamiento sobre el subconjunto de tokens conservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen3.5 (clase `Qwen3_5ForCausalLM`, solo texto); conserva cabeza MTP |
| Parametros totales | 3.865.525.248 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo menciona servicio en `bfloat16` con vLLM) |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.5-4B) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5, con la misma pila de pesos que Qwen/Qwen3.5-4B. Los cambios aplicados son estructurales y de tokenizer, no de entrenamiento: se elimina el codificador de visión, se convierte la clase a causal LM de solo texto y se poda el vocabulario de 248.320 a 68.310 entradas. El vocabulario conservado incluye los tokens usados por los datos de la tarea, todos los tokens vietnamitas con diacríticos, los tokens comunes de inglés/ASCII con id de vocabulario base inferior a 60.000, los 256 tokens de byte, los 33 tokens especiales y los ancestros de merges BPE necesarios para que la tokenización del texto conservado sea idéntica a la del tokenizer original. Los ids de token se reasignan de forma contigua, por lo que difieren de los del modelo base y es obligatorio usar el tokenizer de este repositorio.

No se realizó reentrenamiento, fine-tuning, RLHF ni DPO. La verificación reportada por el autor incluye: tokenización idéntica (token a token) del dataset de tarea (1.545 filas) y de la plantilla de chat con y sin herramientas y con thinking activado/desactivado; equivalencia de logits en FP32 con diferencia absoluta máxima menor o igual a 2e-5 sobre los prompts de prueba, restringida a los tokens conservados; y carga y servicio correctos con vLLM 0.32 en `bfloat16`, incluidos tool calling y decodificación especulativa MTP. La innovación técnica destacable es la conservación de la cabeza MTP para decodificación especulativa, junto con la poda de vocabulario con preservación de ancestros BPE.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés.
- Razonamiento con modo thinking activable o desactivable por petición (`"chat_template_kwargs": {"enable_thinking": false}`).
- Tool calling / function calling, con parser `qwen3_coder` en vLLM.
- Decodificación especulativa mediante la cabeza MTP conservada (`{"method":"mtp","num_speculative_tokens":2}`).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).
- Sin capacidades de visión: el codificador visual fue eliminado.
- Sin soporte de generación en chino, cirílico, árabe, tailandés, coreano, japonés ni otros sistemas de escritura cuyos tokens fueron podados.

## Casos de uso

- Asistentes conversacionales en vietnamita e inglés: el tokenizer conserva todos los tokens vietnamitas con diacríticos y los tokens comunes de inglés, por lo que la tokenización del texto en estos idiomas es idéntica a la del modelo base y el comportamiento conversacional se mantiene.
- Servicio de inferencia con vLLM en producción: la model card documenta el arranque con `vllm serve` en `bfloat16`, con parser de razonamiento `qwen3` y tool calling con `qwen3_coder`, lo que permite desplegarlo como endpoint compatible con la API de chat.
- Reducción de huella de memoria en despliegues de solo texto: al eliminar el codificador de visión y recortar el vocabulario de 248.320 a 68.310 tokens, disminuye el tamaño de la matriz de embeddings y de la proyección de salida, lo que resulta útil cuando el presupuesto de VRAM es ajustado y no se necesita multimodalidad.
- Aceleración de la generación con decodificación especulativa: la cabeza MTP conservada permite activar `--speculative-config '{"method":"mtp","num_speculative_tokens":2}'` en vLLM para reducir la latencia por token en cargas de texto.
- Pipelines de agentes con herramientas: el soporte de tool calling y de modo thinking permite construir flujos de razonamiento multi-paso con llamadas a funciones, siempre que las herramientas y los datos estén en vietnamita o inglés.
- Sustitución directa del modelo base en tareas de texto ya validadas: dado que los logits sobre los tokens conservados coinciden con los del base (diferencia máxima de 2e-5 en FP32), puede reemplazar a Qwen3.5-4B en pipelines de solo texto en vi/en sin recalibrar el comportamiento esperado sobre ese subconjunto de tokens.
- Evaluación y experimentación en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 heredada facilita su uso comercial y su modificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta verificaciones de equivalencia (tokenización idéntica, logits con diferencia absoluta máxima menor o igual a 2e-5 en FP32, carga correcta en vLLM 0.32) y señala explícitamente que la perplejidad sobre un corpus amplio y la precisión en tareas no han sido medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Como referencia de orden de magnitud, el repositorio ocupa 7,7 GB en safetensors, lo que corresponde a pesos en `bfloat16`/`float16` para 3.865.525.248 parámetros; a ello hay que sumar la caché KV, cuyo tamaño depende de la longitud de contexto, que no se especifica.
- GPU recomendadas: no disponible. La model card solo confirma el funcionamiento con vLLM 0.32 en `bfloat16`, sin indicar modelos de GPU concretos.
- Encaje en GPU de consumo: no disponible. No se aportan datos de cuantización (GGUF, AWQ, GPTQ) ni pruebas en GPUs de consumo.
- Opciones de despliegue: vLLM 0.32 documentado con `vllm serve`, incluyendo `--reasoning-parser qwen3`, `--enable-auto-tool-choice --tool-call-parser qwen3_coder` y decodificación especulativa MTP opcional. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Vocabulario | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-vi-en (este) | 3.865.525.248 | no disponible | No | 68.310 | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4,66B | no disponible | Si | 248.320 | Apache 2.0 | HuggingFace |
| Otras alternativas de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con el modelo base es la única documentada: este modelo reduce parámetros de aproximadamente 4,66B a 3.865.525.248, elimina el codificador de visión, recorta el vocabulario a 68.310 tokens y mantiene la cabeza MTP; los pesos del transformer son idénticos y los logits sobre los tokens conservados coinciden con los del base. No se dispone de datos de rendimiento comparado con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Incapacidad de generar chino, cirílico, árabe, tailandés, coreano, japonés y otros sistemas de escritura cuyos tokens fueron eliminados; dichas entradas aún pueden codificarse por byte fallback, pero se tokenizan en muchos más tokens y se manejan mal.
- Mayor fragmentación en inglés poco común y en marcado: aproximadamente un 2% más de tokens en texto técnico respecto al tokenizer original.
- Redistribución de probabilidad: en los prompts de evaluación, el modelo base asignaba entre un 1% y un 4% de probabilidad al siguiente token sobre los tokens eliminados; esa masa se redistribuye sobre el vocabulario restante, lo que puede alterar ligeramente la distribución de salida.
- Ids de token distintos a los del modelo base: es obligatorio usar el tokenizer de este repositorio; mezclar tokenizers produce resultados incorrectos.
- Calidad no medida: no se ha evaluado perplejidad sobre corpus amplio ni precisión en tareas, por lo que no hay garantía de rendimiento más allá de las comprobaciones de equivalencia reportadas.
- Riesgo de alucinación: no evaluado ni documentado en la información disponible.
- Sesgos: no documentados en la información disponible.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; el autor atribuye todo el crédito del modelo base al equipo de Qwen.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, con creación y actualización el mismo día (2026-11-02), lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trong269/qwen3.5-4b-vi-en
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
