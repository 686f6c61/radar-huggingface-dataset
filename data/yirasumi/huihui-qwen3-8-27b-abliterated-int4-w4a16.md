# Yirasumi/Huihui-Qwen3.8-27B-abliterated-INT4-W4A16

## Resumen

`Huihui-Qwen3.8-27B-abliterated-INT4-W4A16` es una cuantización INT4 de peso (W4A16) del checkpoint abliterado `huihui-ai/Huihui-Qwen3.8-27B-abliterated`, producida por Yirasumi con Intel AutoRound y exportada en formato `compressed-tensors` (pack-quantized). El modelo base es una variante del Qwen3.8-27B de Alibaba a la que se ha aplicado abliteration para eliminar los rechazos de seguridad, y esta cuantización está diseñada específicamente para ejecutar el modelo completo en una GPU de 24 GB (p. ej. RTX 3090) con decodificación especulativa.

El checkpoint cuantiza a INT4 tanto las capas transformer del modelo de lenguaje como el `lm_head`, lo que libera unos 1,9 GB de VRAM adicionales frente a cuantizaciones que mantienen la cabeza en BF16. Ese margen es lo que permite activar MTP (multi-token prediction), CUDA graphs y decodificación especulativa en tarjetas de 24 GB, algo inviable con el checkpoint BF16 original. El modelo base es multimodal y usa una arquitectura de atención híbrida: solo 16 de sus 64 capas ejecutan atención completa y las otras 48 usan atención lineal con estado recurrente constante.

La licencia es Apache-2.0, el contexto nativo es de 262 144 tokens y el repo ocupa 17,6 GB (unos 15,6 GiB de pesos en 4 shards). Es una pieza pensada para despliegue con vLLM en hardware consumer, no un modelo de propósito general nuevo: hereda todas las capacidades del Qwen3.8-27B original y de la variante sin censura de huihui-ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (multimodal, atención híbrida: 16 capas full attention + 48 capas linear attention; torre de visión en BF16) |
| Parametros totales | 27 000 millones (nominal); el conteo de safetensors reporta 5 158 150 162, cifra que parece incompleta o errónea frente al nominal de 27B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | INT4 weight-only (W4A16), group_size=128, simétrico; `lm_head` cuantizado a INT4; torre de visión, `linear_attn.in_proj_a/b` y capa de fusión MTP (`mtp.fc`) en BF16 |
| Idiomas soportados | No disponible en la ficha (el modelo base Qwen3.8 es multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato `compressed-tensors` (pack-quantized); existe variante GGUF del modelo base para llama.cpp |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con arquitectura de atención híbrida: de las 64 capas, solo 16 ejecutan atención completa (intervalo `full_attention_interval: 4`) y las 48 restantes usan atención lineal con estado recurrente constante, el mismo backbone que el modelo MoE de 2,4 billones de la familia Qwen3.8. Es multimodal, con una torre de visión que en esta cuantización se mantiene en BF16. La variante `Huihui-Qwen3.8-27B-abliterated` fue creada por huihui-ai mediante técnicas de abliteration para eliminar los rechazos de seguridad del modelo original; el autor la describe como una prueba de concepto que no usa TransformerLens.

La cuantización se realizó con Intel AutoRound 0.14.2 (transformers 5.15.x, torch 2.13) sobre el checkpoint abliterado, con calibración sobre 128 muestras de 2048 tokens del dataset NeelNanda/pile-10k y 200 iteraciones, en una NVIDIA H100 80 GB durante aproximadamente 55 minutos. El esquema es W4A16 simétrico con group_size=128, exportado vía `auto_round:llm_compressor`. Se cuantizan las capas transformer del modelo de lenguaje y el `lm_head`; la torre de visión, las proyecciones de atención lineal y la capa de fusión MTP quedan en BF16. El checkpoint incluye la cabeza MTP del Qwen3.5 en `model_extra_tensors.safetensors` para permitir decodificación especulativa con vLLM.

## Capacidades
- Generación de texto y razonamiento multistep, heredadas del Qwen3.8-27B (incluido el modo de razonamiento extendido).
- Razonamiento matemático y generación de código.
- Capacidades multimodales de visión: la torre de visión se conserva en BF16, por lo que el modelo puede procesar imágenes junto con texto.
- Tool calling y function calling: compatible con `--enable-auto-tool-choice` y el parser `qwen3_xml` en vLLM.
- Contexto largo de 262 144 tokens nativos.
- Decodificación especulativa MTP: el checkpoint incluye la cabeza de multi-token prediction del Qwen3.5, con soporte para 4 tokens especulativos.
- Multilingüe (heredado del modelo base Qwen3.8).
- Modelo abliterated: el filtrado de seguridad se ha reducido de forma significativa.

## Casos de uso
- Inferencia local en GPU de consumo: el checkpoint está dimensionado para ejecutarse en una RTX 3090 de 24 GB con `--gpu-memory-utilization 0.93` y kv-cache en fp8, algo inviable con el checkpoint BF16 original.
- Asistente de código en local: con tool calling y contexto de 262 K tokens, puede integrarse en pipelines de desarrollo (autocompletado, generación de tests, revisión de código) sin depender de APIs externas.
- Agentes autónomos con tool calling: el parser `qwen3_xml` y el soporte de auto-tool-choice permiten construir agentes que encadenan llamadas a herramientas de forma autónoma.
- Análisis multimodal con contexto largo: procesar documentos con capturas de pantalla, diagramas y texto en la misma sesión de 262 K tokens.
- Investigación en alineación y seguridad: la variante abliterated sirve para estudiar el impacto de eliminar el rechazo en modelos de seguridad, en entornos controlados.
- Servicio de producción con vLLM: con prefix caching y chunked prefill, ofrece baja latencia en una GPU consumer para aplicaciones de chat o RAG.
- Experimentación con decodificación especulativa: la cabeza MTP incluida permite acelerar la generación con 4 tokens especulativos en la misma tarjeta.
- Fine-tuning o evaluación de cuantizaciones INT4 weight-only sobre un modelo de 27B en hardware de consumo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada: unos 15,6 GiB de pesos, dimensionados para caber en una GPU de 24 GB (RTX 3090/4090) con `--gpu-memory-utilization 0.93` y `--kv-cache-dtype fp8_e5m2`.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para inferencia; la cuantización se realizó en una NVIDIA H100 80 GB.
- No cabe en GPUs de 16 GB o menos con el contexto completo; habría que reducir `--max-model-len` (el ejemplo de vLLM usa 40 000 tokens).
- Despliegue: vLLM 0.27.1 o superior vía `compressed-tensors` con kernels Marlin INT4; para llama.cpp/Ollama existe la variante GGUF del modelo base en `huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF`.
- El repositorio `syv-ai/qwen38-27b-rtx3090` documenta la configuración de serving optimizada para una sola RTX 3090.
- Latencia y throughput: no especificados en la ficha.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto | Cuantizacion | Formato | Licencia |
|---|---|---|---|---|---|
| Yirasumi/Huihui-Qwen3.8-27B-abliterated-INT4-W4A16 | 27B | 262 144 | INT4 W4A16 (AutoRound) | compressed-tensors | Apache-2.0 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | 27B | 262 144 | BF16 (sin cuantizar) | safetensors | Apache-2.0 |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated-GGUF | 27B | 262 144 | GGUF (varios niveles) | GGUF | Apache-2.0 |
| TelperionAI/Huihui-Qwen3.8-27B-abliterated-INT4-AWQ-GPTQ | 27B | 262 144 | INT4 AWQ/GPTQ | safetensors | Apache-2.0 |

La diferencia principal frente al BF16 original es el tamaño y la viabilidad en GPU de 24 GB; frente a las variantes GGUF y AWQ/GPTQ, esta versión está optimizada para el ecosistema vLLM y mantiene la cabeza MTP para decodificación especulativa.

## Limitaciones y advertencias
- Modelo abliterated: el filtrado de seguridad se ha reducido de forma significativa. Puede generar contenido inapropiado o peligroso. Debe usarse de forma responsable y conforme a la ley aplicable.
- Riesgo de alucinación: como todo LLM, puede inventar hechos, especialmente en tareas de razonamiento largo.
- Pérdida de calidad por cuantización: aunque es weight-only (W4A16) y mantiene las activaciones en BF16, la cuantización INT4 del `lm_head` y las capas puede introducir degradación frente al BF16 original; no se han publicado
