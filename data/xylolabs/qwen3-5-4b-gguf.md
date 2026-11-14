# Xylolabs/Qwen3.5-4B-GGUF

## Resumen
Xylolabs/Qwen3.5-4B-GGUF es una cuantización GGUF del modelo base Qwen/Qwen3.5-4B, publicada por Xylolabs como referencia técnica para comparaciones de precisión frente a otras implementaciones (Tensix, GPTQ BFP4). No es un modelo nuevo: es un export en formato llama.cpp del decodificador de texto de Qwen3.5-4B, con los pesos del módulo MTP (multi-token prediction) preservados pero sin garantía de uso del mismo.

El archivo contiene 441 tensores del decodificador de 32 capas más un módulo MTP, tokenizer y plantilla de chat; se omiten explícitamente los pesos del codificador y proyector de visión. El peso total de los tensores es de 2,772 GB con una media de 5,127 bits por peso almacenado (tipos F32: 184 tensores, Q4_K: 222, Q6_K: 35), y el repo ocupa 2,783 GB.

El modelo base tiene 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y licencia Apache 2.0. Su relevancia es acotada: sirve como referencia reproducible de cuantización Q4_K_M para quienes necesitan validar pipelines de inferencia en llama.cpp frente a BF16, no como un modelo listo para producción con garantías de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 32 capas con módulo MTP (multi-token prediction); export GGUF para llama.cpp |
| Parametros totales | 4.326.350.848 (4,3 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de la model card limita explícitamente a 2.048 tokens con `-c 2048` |
| Tipos de cuantizacion | Q4_K_M (F32: 184 tensores, Q4_K: 222, Q6_K: 35); media de 5,127 bits por peso |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (441 tensores; tokenizer y chat template incluidos; sin encoder/proyector de visión) |

## Arquitectura y entrenamiento
El modelo base Qwen3.5-4B es un transformer decoder-only de 32 capas con un módulo MTP adicional, según se deduce de la estructura del archivo GGUF (441 tensores). El export de Xylolabs conserva los pesos del MTP pero la ruta de generación verificada usa únicamente el decodificador de texto principal; la model card indica que integrar un drafter MTP requiere su propia implementación y evaluación compatibles.

No se proporcionan datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO) en la información disponible. La cuantización se realizó con llama.cpp v0.9.0 y se validó contra una pasada BF16: 8 secuencias emparejadas de 2.048 tokens, 16.312 posiciones puntuadas, KL media de 0,039805 y acuerdo top-1 del 89,79 %. El resultado reportado es 30/33 más 7/7 rechecks con thinking activado, sin pérdidas contabilizadas frente a BF16 (las pérdidas contabilizadas excluyen empates cercanos de BF16 y elementos de razonamiento recuperados con thinking on).

## Capacidades
- Generación de texto conversacional en inglés y coreano (idiomas declarados en la model card).
- Modo thinking activable/desactivable mediante `--chat-template-kwargs '{"enable_thinking":false}'` en llama.cpp; los 7 rechecks de la evaluación se realizaron con thinking activado.
- Soporte de chat template Jinja (`--jinja`) para formateo de conversaciones.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No incluye capacidades de visión: el encoder y el proyector están omitidos del archivo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades matemáticas o de código: no verificadas en la información proporcionada.

## Casos de uso
- Validación de pipelines de cuantización: usar este GGUF como referencia Q4_K_M reproducible para comparar la salida de tu propia conversión o de otro runtime (por ejemplo, Tensix o GPTQ BFP4) contra la pasada BF16 documentada, con métricas KL y acuerdo top-1 ya publicadas.
- Inferencia local en CPU o GPU de gama baja: con 2,77 GB de pesos más KV cache y buffers, el modelo cabe en equipos con 4-6 GB de VRAM o en CPU con llama.cpp, adecuado para prototipos de generación de texto en inglés y coreano.
- Pruebas de regresión de llama.cpp: el ejemplo de CLI con `-c 2048 -n 32 --temp 0` y plantilla Jinja sirve como caso de prueba determinista para verificar que una build de llama.cpp reproduce los token IDs y stop IDs esperados.
- Evaluación de decodificación especulativa: el módulo MTP está preservado en el archivo, por lo que sirve como base para implementar y evaluar un drafter MTP propio (requiere implementación compatible, no incluida).
- Chat conversacional ligero en inglés o coreano: para asistentes de bajo coste con contexto corto (2.048 tokens en el ejemplo verificado), donde la latencia y el footprint importan más que el rendimiento en benchmarks.
- Referencia para investigación en cuantización: el desglose exacto de tipos de tensor (F32/Q4_K/Q6_K) y la media de bits por peso permiten estudiar el impacto de la asignación de tipos en la fidelidad de la salida.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación reportada es la verificación de fidelidad de la cuantización frente a BF16:

| Metrica | Valor |
|---|---|
| Secuencias evaluadas | 8 (2.048 tokens cada una) |
| Posiciones puntuadas | 16.312 |
| KL media vs BF16 | 0,039805 |
| Acuerdo top-1 | 89,79 % |
| Resultado referencia | 30/33 + 7/7 rechecks |
| Resultado BF16 | 29/33 + 7/7 |
| Respuestas rotas | 0 |
| Velocidad | no reportada |

## Requisitos de hardware
- VRAM para pesos: aproximadamente 2,77 GB solo para los pesos GGUF, más espacio para KV cache y buffers (el total real depende de la longitud de contexto y del batch).
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, cualquier GPU con 6 GB o más de VRAM debería alojar el modelo con contexto moderado.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 6 GB, RTX 4060, RTX 4090 y similares; no confirmado por el autor.
- Despliegue: llama.cpp (versión verificada v0.9.0), con `llama-cli` o `llama cli -hf Xylolabs/Qwen3.5-4B-GGUF:Q4_K_M`; otros runtimes GGUF (Ollama, vLLM con backend GGUF) no han sido verificados por el autor.
- Latencia y throughput: no reportados («Speed is not reported here»).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-4B-GGUF | 4,3 B | no disponible (ejemplo a 2.048) | GGUF Q4_K_M | Apache 2.0 | Referencia de cuantización verificada vs BF16 |
| Qwen/Qwen3.5-4B (base) | 4,3 B | no disponible | safetensors (BF16) | Apache 2.0 | Modelo original; incluye pesos de visión según la model card del export |
| Xylolabs/Qwen3.5-4B-Tensix-BFP4-GPTQ | 4,3 B | no disponible | GPTQ BFP4 | Apache 2.0 | Variante Tensix del mismo autor para comparación de precisión |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes más allá de la fidelidad de cuantización reportada.

## Limitaciones y advertencias
- Es una cuantización Q4_K_M: la fidelidad frente a BF16 es del 89,79 % en top-1 y KL media de 0,039805, por lo que no es equivalente al modelo original en tareas sensibles a precisión.
- Solo se declaran inglés y coreano; el rendimiento en castellano u otros idiomas no está verificado.
- Los pesos de visión están omitidos: no es posible usar entrada de imagen con este archivo.
- El módulo MTP está presente pero sin garantía de funcionamiento como drafter; requiere implementación y evaluación propias.
- La evaluación se limita a textos almacenados y prompts cortos; el autor advierte que cualquier integración necesita su propia evaluación de tarea.
- No se reportan métricas de velocidad, latencia ni throughput.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; aplican los del modelo base Qwen3.5-4B.
- Licencia Apache 2.0 permite uso comercial, pero el autor distribuye el archivo «as is», sin garantía ni respaldo del upstream.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces
- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante Tensix GPTQ: https://huggingface.co/Xylolabs/Qwen3.5-4B-Tensix-BFP4-GPTQ
- Repositorio Tensix BFP GPTQ: https://github.com/XylolabsInc/tensix-bfp-gptq
- llama.cpp (build referenciada): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Licencia: https://huggingface.co/Xylolabs/Qwen3.5-4B-GGUF/blob/main/LICENSE
