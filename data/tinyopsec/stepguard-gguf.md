# tinyopsec/StepGuard-GGUF

## Resumen

StepGuard-GGUF es una colección de cuantizaciones en formato GGUF del modelo StepGuard, publicado originalmente por `ninty-seven/StepGuard` y redistribuido por el usuario tinyopsec. Se trata de un modelo guard (modelo de seguridad) de nivel de paso (step-level) diseñado para supervisar agentes que hacen uso de herramientas (tool-using agents). El modelo base es Qwen3-4B-Instruct-2507 de Qwen, un transformer instruct de 4.022 millones de parámetros, y las cuantizaciones se han generado con llama.cpp.

Su función principal es evaluar la seguridad de cada paso individual que ejecuta un agente (por ejemplo, cada llamada a una herramienta o cada decisión intermedia), lo que permite detectar comportamientos peligrosos o no deseados antes de que se produzcan, en lugar de auditar únicamente la respuesta final. Esto lo hace relevante en un momento en el que el despliegue de agentes autónomos con acceso a herramientas está creciendo rápidamente y la seguridad a nivel de paso se ha convertido en un área activa de investigación y producción.

Al distribuirse en GGUF con cuantizaciones desde F16 hasta Q2_K, puede ejecutarse localmente con llama.cpp, Ollama, LM Studio o koboldcpp, lo que facilita su integración en pipelines de agentes que necesiten un filtro de seguridad de baja latencia y bajo coste. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en Qwen3-4B-Instruct-2507), modelo guard de nivel de paso |
| Parametros totales | 4.022.468.096 (~4,02 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada probablemente de Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

StepGuard parte de Qwen/Qwen3-4B-Instruct-2507, un modelo instruct de la familia Qwen3 con arquitectura transformer decoder densa de unos 4 B de parámetros. Sobre esa base, el autor original (`ninty-seven`) lo ha ajustado (fine-tuning) para funcionar como guard de seguridad a nivel de paso en agentes que utilizan herramientas. La model card no detalla el procedimiento de entrenamiento, el dataset empleado, el número de tokens ni si se usaron técnicas como RLHF o DPO: no disponible.

La innovación conceptual destacable es la supervisión step-level: en lugar de evaluar la seguridad de la conversación completa o de la respuesta final, el modelo evalúa cada paso intermedio del agente (por ejemplo, cada tool call propuesta). Esto permite interceptar acciones peligrosas en tiempo real dentro del bucle de ejecución del agente. La distribución aquí recogida consiste únicamente en las cuantizaciones GGUF producidas con llama.cpp, sin cambios sobre los pesos del modelo original.

## Capacidades

- Clasificación o evaluación de seguridad de pasos individuales de agentes (tool calls, decisiones intermedias), según el enfoque step-level guard indicado en las tags.
- Generación de texto en formato conversacional (pipeline text-generation), heredada del modelo base instruct.
- Compatibilidad con cualquier runtime GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.
- No es un modelo de uso general: está especializado como guard para agent-safety y tool-use; no está pensado para sustituir a un LLM de propósito general.
- Soporte de vision, audio ni thinking mode: no disponible.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Filtro de seguridad en pipelines de agentes con herramientas: se intercala StepGuard entre el agente y el ejecutor de tool calls, evaluando cada llamada propuesta antes de ejecutarla y bloqueando las que el guard marque como inseguras.
- Supervisión de agentes autónomos de larga duración: en agentes que encadenan muchos pasos sin intervención humana, el guard puede auditar cada paso con baja latencia gracias a su tamaño de 4 B y cuantizaciones de 4 bits.
- Cumplimiento y auditoría (compliance): registro estructurado de las evaluaciones de seguridad de cada paso para demostrar que un agente operó dentro de políticas definidas.
- Sandboxing de agentes internos en empresas: despliegue local con Ollama o llama.cpp para evaluar agentes que acceden a APIs internas, bases de datos o sistemas de ficheros, sin enviar datos a servicios externos.
- Investigación en seguridad de agentes: punto de partida para experimentos de detección de comportamientos peligrosos a nivel de paso, comparando contra guards a nivel de conversación.
- Mitigación de prompt injection en tool use: como capa de defensa adicional que revisa las acciones propuestas por el agente tras recibir entradas potencialmente maliciosas, antes de que tengan efectos reales.
- Desarrollo de frameworks de orquestación: integración en frameworks propios (LangChain, LlamaIndex, etc.) como componente de política de seguridad reutilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de exactitud, recall ni tasas de falsos positivos del guard, por lo que se recomienda evaluar el modelo sobre un conjunto de casos propio antes de usarlo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia (4 B de parámetros):
  - F16: ~8 GB
  - Q8_0: ~4,5 GB
  - Q6_K: ~3,5 GB
  - Q5_K_M / Q5_K_S / Q5_0: ~3 GB
  - Q4_K_M / Q4_K_S / Q4_0: ~2,5 GB (Q4_K_M recomendado por el autor)
  - Q3_K_L / Q3_K_M / Q3_K_S: ~2 GB
  - Q2_K: ~1,7 GB
- GPU recomendadas: cualquier GPU moderna con 4 GB o más de VRAM es suficiente para las cuantizaciones de 4-5 bits; RTX 3060, RTX 4060 o superiores funcionan sin problemas. Para F16 se recomiendan GPUs con 8-12 GB (RTX 4070, RTX 3090, RTX 4090).
- Cabe en consumer GPUs: sí, ampliamente. La cuantización recomendada (Q4_K_M, ~2,5 GB) cabe incluso en portátiles con GPU modesta, y puede ejecutarse también solo en CPU dado el tamaño reducido.
- Opciones de despliegue: llama.cpp (ejemplo oficial: `./llama-cli -m model-Q4_K_M.gguf -p "Your prompt" -n 256`), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponible; al tratarse de un modelo de 4 B cuantizado, se esperan latencias bajas compatibles con supervisión paso a paso en tiempo real, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| StepGuard-GGUF (este) | ~4,02 B | Guard step-level para agentes con tool use | GGUF (F16 a Q2_K) | Apache 2.0 | Especializado en agent-safety; sin benchmarks publicados |
| Llama Guard 3 (Meta) | ~8 B | Guard de seguridad de entradas/salidas | safetensors | Licencia Meta Llama | Clasificación de categorías de riesgo MLCommons; no step-level nativo |
| ShieldGemma (Google) | ~2-9 B (variantes) | Guard de políticas de seguridad | safetensors | Gemma Terms of Use | Evaluación de seguridad según políticas definidas por el usuario |
| Qwen3-4B-Instruct-2507 (base) | ~4,02 B | LLM instruct de propósito general | safetensors, GGUF de terceros | Apache 2.0 | Modelo base de StepGuard, sin especialización en seguridad |

Nota: no hay datos de rendimiento comparativo publicados para StepGuard, por lo que la comparativa se limita a parámetros, tipo, formato y licencia.

## Limitaciones y advertencias

- No se publican métricas de rendimiento del guard (exactitud, recall, falsos positivos/negativos), por lo que su fiabilidad real es desconocida; la propia model card advierte: "Evaluate before use in production agent workflows".
- Al ser un fine-tuning de 4 B, es probable que sea menos robusto ante casos límite y ataques adversariales que guards más grandes; un atacante podría intentar evadir la clasificación del guard mediante ofuscación de los tool calls.
- Riesgo de alucinación: como todo LLM, puede producir evaluaciones incorrectas o inconsistentes; no debe usarse como único mecanismo de seguridad, sino como capa adicional dentro de una estrategia de defensa en profundidad.
- Idiomas soportados y longitud de contexto: no disponibles en la documentación; verificar antes de usar con entradas no inglesas o contextos largos.
- Cuantizaciones agresivas (Q3, Q2_K) pueden degradar significativamente la calidad del guard; se recomienda Q4_K_M como mínimo según el autor.
- Licencia Apache 2.0: sin restricciones para uso comercial, aunque los términos de uso del modelo base Qwen3 aplican indirectamente.
- El repositorio es una redistribución de terceros (tinyopsec) del modelo original de `ninty-seven`; verificar la integridad de los ficheros GGUF antes de su uso en producción.
- Descargas aún bajas (365) y sin likes: comunidad y validación externa limitadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/StepGuard-GGUF
- Modelo original (referenciado en la model card): https://huggingface.co/ninty-seven/StepGuard
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Paper, blog o demo: no disponible
