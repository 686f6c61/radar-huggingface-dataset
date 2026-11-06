# tinyopsec/DeepSeek-R1-Distill-Qwen-1.5B-abliterated-GGUF

## Resumen

DeepSeek-R1-Distill-Qwen-1.5B-abliterated-GGUF es una cuantización en formato GGUF del modelo huihui-ai/DeepSeek-R1-Distill-Qwen-1.5B-abliterated, publicada por el usuario tinyopsec. El modelo subyacente es un distill de DeepSeek-R1 sobre la arquitectura Qwen2 de 1.5B parámetros (1.777.088.000 parámetros reales según los safetensors), al que se le ha aplicado un proceso de "abliteration" para eliminar o atenuar los mecanismos de rechazo aprendidos durante el alineamiento. Esta versión GGUF empaqueta el resultado en 13 cuantizaciones distintas, desde F16 hasta Q2_K, para su uso con llama.cpp y otros runtimes compatibles.

El modelo resuelve el problema de desplegar un modelo de razonamiento tipo R1 en hardware muy limitado: con 1.5B parámetros y cuantizaciones de 4 bits, cabe en GPUs de consumo e incluso en CPU. La relevancia actual radica en que combina tres características poco habituales en un modelo de este tamaño: capacidades de razonamiento encadenado heredadas de DeepSeek-R1, una ventana de contexto de 32.768 tokens propia de Qwen2, y un alineamiento debilitado que permite generar contenido que los modelos estándar rechazarían.

Es importante señalar que este repositorio es una cuantización, no un modelo nuevo: no aporta mejoras de capacidad respecto al modelo base, sino únicamente compatibilidad con el ecosistema GGUF y reducción del peso en disco y memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredado de Qwen2; no confirmado en la model card) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (13 ficheros) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen2 con 1.5B parámetros, destilado a partir de DeepSeek-R1. El proceso de destilación de R1 consiste en entrenar el modelo pequeño sobre las trazas de razonamiento (chain-of-thought) generadas por el modelo grande, de modo que el modelo resultante aprende a producir pasos intermedios de razonamiento antes de dar la respuesta final. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO en el modelo original.

Sobre esa base, huihui-ai aplicó un proceso de abliteration, una técnica que identifica la dirección en el espacio de activaciones asociada al comportamiento de rechazo y la proyecta fuera de los pesos, reduciendo la tendencia del modelo a negarse a responder. La versión aquí publicada es una cuantización GGUF generada con llama.cpp, que no modifica los pesos más allá de la pérdida de precisión inherente a cada nivel de cuantización. No hay innovaciones técnicas adicionales documentadas (no se menciona decodificación especulativa, atención lineal ni arquitecturas híbridas).

## Capacidades

- Generación de texto conversacional multi-turno, con formato de chat.
- Razonamiento encadenado (chain-of-thought) heredado de la destilación de DeepSeek-R1: el modelo tiende a producir trazas de razonamiento antes de la respuesta.
- Razonamiento matemático básico y resolución de problemas de varios pasos, dentro de las limitaciones de un modelo de 1.5B.
- Generación de código y explicación de fragmentos de código, con calidad limitada por el tamaño.
- Capacidades multilingües: no documentadas en la información disponible; Qwen2 base tiene cobertura multilingüe, pero no se especifica para este distill.
- Alineamiento debilitado (abliterated): menor tasa de rechazos ante peticiones que el modelo estándar declinaría.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito con etiquetas especiales más allá del patrón de razonamiento aprendido.

## Casos de uso

- Inferencia en hardware de consumo: con cuantización Q4_K_M el modelo ocupa del orden de 1 GB, por lo que puede ejecutarse en GPUs con 4 GB de VRAM o en CPU con llama.cpp, permitiendo probar un modelo de razonamiento R1 en portátiles y equipos sin GPU dedicada.
- Prototipado de pipelines de razonamiento: útil para validar cadenas de prompt y formatos de salida con trazas de razonamiento antes de escalar a un modelo mayor, gracias a su bajo coste de ejecución.
- Generación de texto en aplicaciones embebidas o de escritorio: al ser GGUF y MIT, puede integrarse en aplicaciones locales (por ejemplo, asistentes offline) sin dependencia de API.
- Investigación sobre alineamiento y abliteration: permite estudiar empíricamente cómo cambia la tasa de rechazos y la calidad de respuesta tras eliminar la dirección de refusal, comparando con el modelo base sin abliterar.
- Filtrado y clasificación de texto con razonamiento breve: tareas de etiquetado o categorización donde el modelo justifica brevemente su decisión, ejecutables en lote en CPU.
- Educación y demostraciones: servir como ejemplo didáctico de destilación de R1, cuantización GGUF y despliegue con llama.cpp en cursos o talleres.
- Generación creativa sin restricciones temáticas: el alineamiento debilitado lo hace adecuado para escritura de ficción o guiones donde el modelo estándar aplicaría filtros, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye métricas (MMLU, GSM8K, HumanEval ni comparativas), y el autor no documenta evaluaciones del efecto de la abliteration ni de las distintas cuantizaciones sobre la calidad.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos, sin overhead de contexto):
  - F16: ~3,5 GB
  - Q8_0: ~1,9 GB
  - Q6_K: ~1,5 GB
  - Q5_K_M: ~1,2 GB
  - Q4_K_M: ~1,0 GB
  - Q3_K_M: ~0,8 GB
  - Q2_K: ~0,6 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M o superior (GTX 1650, RTX 3050, RTX 4060, RTX 4090, A100, H100). El modelo es lo bastante pequeño para que la GPU no sea el cuello de botella en la mayoría de configuraciones.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; incluso en iGPU y en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (importando el GGUF), LM Studio, y otros runtimes compatibles con GGUF. No se documenta soporte para vLLM ni TGI, que requieren formatos distintos (safetensors).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tinyopsec/DeepSeek-R1-Distill-Qwen-1.5B-abliterated-GGUF (este) | 1,78B | 32.768 (heredado) | GGUF | MIT | Cuantización + abliteration |
| huihui-ai/DeepSeek-R1-Distill-Qwen-1.5B-abliterated | 1,78B | 32.768 (heredado) | safetensors | MIT | Modelo base de este repo, sin cuantizar |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B | 1,78B | 32.768 (heredado) | safetensors | MIT | Modelo original sin abliteration |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 | safetensors/GGUF | Apache 2.0 | Alternativa generalista sin razonamiento R1 |

Los datos de rendimiento comparativo no están disponibles en la información proporcionada; la comparativa se limita a parámetros, contexto, formato y licencia.

## Limitaciones y advertencias

- La abliteration elimina o atenúa los mecanismos de rechazo, lo que aumenta el riesgo de generar contenido dañino, ofensivo o inexacto sin advertencia. No es adecuado para aplicaciones de cara al público sin moderación adicional.
- Modelo de 1.5B parámetros: alta propensión a alucinaciones factuales, errores en matemáticas complejas y código no trivial. Las trazas de razonamiento pueden ser plausibles pero incorrectas.
- La cuantización introduce pérdida de calidad adicional, especialmente en Q3 y Q2; se recomienda Q4_K_M o superior para uso práctico.
- Idiomas soportados no documentados; el rendimiento fuera de inglés y chino puede degradarse notablemente.
- Licencia MIT permite uso comercial, pero el usuario asume la responsabilidad legal y ética del contenido generado con un modelo abliterado.
- Sin datos de benchmarks, no hay evidencia publicada sobre la magnitud del deterioro de capacidades causado por la abliteration o por cada nivel de cuantización.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación de la comunidad ni garantías de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/DeepSeek-R1-Distill-Qwen-1.5B-abliterated-GGUF
- Modelo base (abliterated): https://huggingface.co/huihui-ai/DeepSeek-R1-Distill-Qwen-1.5B-abliterated
- Modelo original DeepSeek-R1-Distill-Qwen-1.5B: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Repositorio DeepSeek-R1: https://github.com/deepseek-ai/DeepSeek-R1
- llama.cpp: https://github.com/ggerganov/llama.cpp
