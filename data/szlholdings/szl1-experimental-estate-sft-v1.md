# SZLHOLDINGS/szl1-experimental-estate-sft-v1

## Resumen

SZLHOLDINGS/szl1-experimental-estate-sft-v1 es un modelo de lenguaje de tipo transformer, derivado de la familia Qwen2, publicado por SZLHOLDINGS como un ajuste fino supervisado (SFT) sobre el modelo base SZLHOLDINGS/szl1-experimental-massed-20261104. Con 3.085.938.688 parámetros totales (aproximadamente 3,1 mil millones), se sitúa en la gama de modelos pequeños, adecuado para despliegues con recursos limitados y para tareas de generación de texto conversacional.

El modelo se ha entrenado con la librería Unsloth junto con TRL de Hugging Face, lo que según el autor permitió un entrenamiento aproximadamente el doble de rápido. Está etiquetado como `conversational` y `text-generation`, y se distribuye en formato safetensors bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines existentes de transformers y text-generation-inference.

La relevancia de esta ficha es limitada pero concreta: se trata de una publicación experimental con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentación técnica detallada más allá de la model card mínima. Resulta útil como referencia para quienes sigan la línea experimental de SZLHOLDINGS o necesiten un modelo Qwen2 de ~3B con licencia permisiva, pero no debe considerarse un modelo validado para producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se asume compatibilidad con cuantizaciones estándar de la familia Qwen2, sin confirmación del autor) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia Qwen2, con 3.085.938.688 parámetros totales según los metadatos de safetensors. No se dispone de información sobre el número de capas, dimensión oculta, número de cabezas de atención ni longitud de contexto nativa, ya que la model card no incluye la configuración del modelo. Tampoco se especifica si emplea attention con RoPE, GQA u otras variantes propias de Qwen2.

El entrenamiento consistió en un ajuste fino supervisado (SFT) sobre el modelo base SZLHOLDINGS/szl1-experimental-massed-20261104, utilizando Unsloth y TRL. El autor indica que este stack permitió entrenar aproximadamente el doble de rápido, pero no se detallan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases posteriores de RLHF o DPO. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, orientada a respuestas multi-turno según la etiqueta `conversational`.
- Generación de texto general mediante el pipeline `text-generation` de transformers.
- Compatibilidad con text-generation-inference (TGI) y con endpoints compatibles, según las etiquetas del repositorio.
- Ajuste fino supervisado, lo que sugiere cierta alineación con formatos de instrucción, aunque no se documenta el formato exacto de prompt.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Generación de respuestas conversacionales en inglés para prototipos de chatbots: el modelo, al estar etiquetado como conversacional y derivar de Qwen2, puede emplearse en diálogos multi-turno simples, aunque la ausencia de datos sobre contexto limita su uso en conversaciones muy largas.
- Ajuste fino adicional sobre dominio específico: al ser un modelo de ~3B con licencia Apache 2.0 y formato safetensors, es un candidato razonable para SFT posterior con Unsloth o TRL en una única GPU consumer.
- Experimentación académica con modelos pequeños de la familia Qwen2: sirve como punto de partida para comparar técnicas de SFT y cuantización sin incurrir en costes elevados de cómputo.
- Despliegue en entornos con recursos limitados: sus ~3,1B parámetros permiten inferencia en GPUs de gama media, lo que lo hace apto para demos locales o entornos de desarrollo.
- Generación de texto en pipelines de TGI: las etiquetas indican compatibilidad con text-generation-inference y endpoints compatibles, lo que facilita su integración en infraestructuras existentes de serving.
- Evaluación comparativa de ajustes finos experimentales: útil para investigadores que sigan la línea de publicaciones de SZLHOLDINGS y quieran medir el efecto del SFT frente al modelo base.
- Base para tareas de clasificación o extracción mediante prompting: aunque no está especializado, un modelo de 3B puede emplearse con prompts few-shot en inglés para tareas simples de NLP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda al menos 8-10 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: en torno a 3-4 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 2-2,5 GB para pesos.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A10, L4, A100 o H100 para despliegues de producción; para desarrollo, una RTX 3060 de 12 GB o superior es suficiente en FP16.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más en FP16, y en tarjetas con 4-6 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: transformers, text-generation-inference (TGI), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no confirmado por el autor); vLLM es probablemente compatible al ser arquitectura Qwen2, pero no está documentado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/szl1-experimental-estate-sft-v1 | 3,09B | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Experimental, sin benchmarks |
| Qwen2-1.5B | 1,54B | 32.768 tokens (según documentación oficial de Qwen2) | Apache 2.0 | Hugging Face, ampliamente usado | Menor tamaño, con benchmarks publicados |
| Qwen2-7B | 7,62B | 131.072 tokens (según documentación oficial de Qwen2) | Apache 2.0 | Hugging Face, ampliamente usado | Mayor tamaño y contexto, con benchmarks publicados |
| Llama 3.2 3B | 3,21B | 131.072 tokens (según documentación oficial de Meta) | Llama 3.2 Community License | Hugging Face, ampliamente usado | Tamaño comparable, licencia no Apache |

La comparación con Qwen2-1.5B y Qwen2-7B se basa en la familia declarada del modelo; los datos de contexto y parámetros de esos modelos provienen de su documentación pública, no de la información proporcionada para este modelo. No se dispone de datos de rendimiento comparativo para el modelo de SZLHOLDINGS.

## Limitaciones y advertencias

- Modelo experimental: cero descargas y cero likes en el momento de la consulta, sin validación externa ni benchmarks publicados.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Riesgo de alucinación: al ser un modelo de ~3B sin benchmarks publicados, la fiabilidad factual no está evaluada.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación recae en el usuario.
- Formato de prompt no documentado: al ser un SFT, el formato exacto de instrucción no se especifica, lo que puede degradar el rendimiento si se usa un template inadecuado.
- Sin información sobre el dataset de entrenamiento: no se puede evaluar la procedencia de los datos ni posibles problemas de contaminación o copyright.
- Fecha de creación futura (2026-11-05): conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl1-experimental-estate-sft-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl1-experimental-massed-20261104
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Documentación de Qwen2: https://huggingface.co/docs/transformers/model_doc/qwen2
