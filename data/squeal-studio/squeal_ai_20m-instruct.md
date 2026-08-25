# Squeal-Studio/squeal_ai_20m-instruct

## Resumen

`squeal_ai_20m-instruct` es un modelo de lenguaje compacto de aproximadamente 20 millones de parámetros, desarrollado por Squeal Studio, especializado en la generación de texto en ruso y el seguimiento de instrucciones. Se trata de la versión *instruct* del modelo base `squeal_ai_20m-base`, ajustada mediante Supervised Fine-Tuning (SFT) sobre el dataset `ru_turbo_alpaca`. No se aplicó ninguna etapa de alineación adicional como RLHF o DPO.

El modelo emplea una arquitectura de transformer decoder estilo Qwen2.5 con Grouped Query Attention (GQA), una longitud de contexto de 1024 tokens y un tokenizer BPE personalizado con un vocabulario de 24 000 entradas. Su reducido tamaño lo hace adecuado para experimentos arquitectónicos, fines educativos y como línea base en investigaciones, pero no para tareas complejas o de producción. La licencia Apache 2.0 permite su uso y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Qwen2.5 con GQA |
| Parametros totales | 20 084 064 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ruso |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de los modelos Qwen2.5, con 8 capas ocultas, un tamaño de representación (`hidden_size`) de 352, 8 cabezas de atención y 4 cabezas clave-valor (GQA). La dimensión intermedia del feed-forward es de 1024 y la longitud máxima de posición es de 1024 tokens. El tokenizer es un BPE personalizado con un vocabulario de 24 000 entradas.

El modelo base fue preentrenado sobre los corpus `cultura_ru_edu`, `fineweb2_ru` y la Wikipedia en ruso. Posteriormente, la versión *instruct* se ajustó mediante SFT sobre el dataset `ru_turbo_alpaca` (licencia CC-BY 4.0), al que se añadieron ejemplos de autoidentificación y se reformateó a una estructura de prompt simple `User:` / `Bot:`. El entrenamiento se realizó en una GPU Tesla T4 con precisión fp16 hasta el paso 2400. No se aplicó RLHF ni DPO, por lo que la alineación y la robustez en el seguimiento de instrucciones son limitadas.

## Capacidades

- Generación de texto en ruso, con capacidad de responder a instrucciones simples.
- Seguimiento de instrucciones en formato `User: ... \nBot:` (sin plantilla de chat automática).
- No soporta *tool calling*, *function calling*, ni razonamiento multi-paso.
- No dispone de capacidades multimodales (visión, audio, etc.).
- Monolingüe: únicamente ruso.
- Sin modo de pensamiento (*thinking mode*) ni generación especulativa.

## Casos de uso

- **Educación y formación**: sirve para ilustrar el funcionamiento interno de un transformer pequeño, el proceso de fine-tuning con SFT y la influencia del tamaño del modelo en la calidad de las respuestas.
- **Experimentos arquitectónicos**: al ser muy ligero, permite probar variaciones de GQA, capas o tokenizadores sin necesidad de hardware costoso.
- **Línea base en investigación**: se puede utilizar como referencia para comparar el efecto de técnicas de alineación (RLHF, DPO) o de aumentos de datos en modelos de tamaño similar.
- **Prototipado rápido**: para validar flujos de generación de texto en ruso en entornos de desarrollo, antes de escalar a modelos mayores.
- **Pruebas de integración**: al ocupar menos de 0.1 GB, se puede desplegar en entornos con recursos mínimos (CPU, dispositivos embebidos) para verificar pipelines de inferencia.
- **Generación de texto simple**: puede producir respuestas cortas y directas en ruso para tareas de baja complejidad, como generar ejemplos de frases o completar patrones básicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: inferior a 1 GB en fp16 (los pesos ocupan aproximadamente 40 MB, más overhead de inferencia).
- **GPU recomendadas**: cualquier GPU con al menos 1 GB de VRAM, incluyendo NVIDIA T4, GTX 1650, RTX 3060, etc. También puede ejecutarse en CPU.
- **Compatibilidad con GPU de consumo**: sí, cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: se puede cargar con `transformers` (PyTorch), o exportar a GGUF para usar con `llama.cpp` u Ollama, aunque no se proporciona una plantilla de chat.
- **Latencia y throughput**: al ser un modelo de 20M, la generación es muy rápida; en una GPU T4 se pueden obtener cientos de tokens por segundo, aunque no se dispone de mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| squeal_ai_20m-instruct | 20M | 1024 | Ruso | Apache 2.0 | SFT, sin RLHF |
| squeal_ai_8m-instruct | 7.86M | No disponible | Ruso | Apache 2.0 | Misma familia, menor tamaño |
| Otros SLM de ~20M | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables |

La comparativa se limita a los modelos de la misma familia, ya que no se han encontrado alternativas de tamaño y características equivalentes con datos públicos.

## Limitaciones y advertencias

- **Conocimiento factual limitado**: con solo 20M de parámetros, el modelo no puede almacenar gran cantidad de información y fallará en tareas que requieran datos específicos o actualizados.
- **Razonamiento débil**: la capacidad de razonamiento lógico y matemático es muy reducida, incluso para problemas simples.
- **Riesgo de alucinación**: puede generar respuestas repetitivas, incoherentes o factualmente incorrectas, especialmente fuera de su dominio de entrenamiento.
- **Formato de prompt rígido**: al no incluir `chat_template`, el modelo solo responde de forma fiable al formato `User: ... \nBot:`. Otros formatos pueden producir salidas impredecibles.
- **Sin alineación**: al carecer de RLHF/DPO, no se ha optimizado para ser útil, inofensivo o seguir instrucciones complejas de manera robusta.
- **Monolingüe**: solo ruso; no se recomienda su uso en otros idiomas.
- **No apto para producción**: el autor lo declara explícitamente como modelo de investigación y educativo, no para casos de uso críticos o de alto riesgo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Squeal-Studio/squeal_ai_20m-instruct)
- [Modelo base](https://huggingface.co/Squeal-Studio/squeal_ai_20m-base)
- [Dataset ru_turbo_alpaca](https://huggingface.co/datasets/IlyaGusev/ru_turbo_alpaca)
- [Perfil de Squeal Studio](https://huggingface.co/Squeal-Studio)
- [Modelo hermano squeal_ai_8m-instruct](https://huggingface.co/Squeal-Studio/squeal_ai_8m-instruct)
