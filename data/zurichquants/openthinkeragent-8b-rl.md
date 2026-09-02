# zurichquants/OpenThinkerAgent-8B-RL

## Resumen

OpenThinkerAgent-8B-RL es un modelo de lenguaje de 8.190 millones de parámetros desarrollado por el proyecto OpenThoughts-Agent, una iniciativa open source para curar datasets y entrenar agentes de IA. Este checkpoint concreto es el resultado final de la receta de entrenamiento SFT→RL: parte del modelo base Qwen3-8B, se somete primero a un cold-start SFT con trayectorias de agentes y posteriormente a un refuerzo on-policy con 5.000 tareas de ingeniería de software. El modelo está diseñado para operar como un agente que interactúa con un terminal, emitiendo comandos shell y ediciones de código para resolver tareas de desarrollo.

La arquitectura es la de Qwen3-8B: un transformer denso de 36 capas con 32 cabezas de atención y 8 cabezas KV, con una ventana de contexto máxima de 40.960 tokens (aunque los rollouts de RL usaron 32.768). El entrenamiento de refuerzo emplea el algoritmo RLOO-n sin pérdida de KL, con recompensa basada en verificadores de tests en un sandbox Daytona. Este modelo es relevante porque representa un avance en el entrenamiento de agentes de código con RL, ofreciendo una alternativa abierta y reproducible a modelos propietarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso) |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 40.960 tokens (maximo); 32.768 en rollouts de RL |
| Tipos de cuantizacion | bf16 (pesos originales); cuantizaciones GGUF/AWQ no disponibles |
| Idiomas soportados | No disponibles (heredados de Qwen3-8B) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-8B, un transformer causal denso con 36 capas, tamaño oculto de 4096, 32 cabezas de atención y 8 cabezas KV, con codificación posicional rotatoria (RoPE) con θ=1e6. El vocabulario consta de 151.936 tokens. El entrenamiento sigue una receta de dos fases: primero, un cold-start SFT con el dataset OpenThoughts-Agent-SFT-ColdStartForRL-10K (9.437 pares tarea/trayectoria) para enseñar al modelo el formato de interacción agéntica y el uso de herramientas. Después, un refuerzo on-policy con el dataset OpenThoughts-Agent-RL-5K (5.000 tareas pymethods2test-large), donde el modelo genera trayectorias en un sandbox Daytona y recibe recompensa según la verificación de tests. El algoritmo de RL es RLOO-n (sin pérdida de KL), con clip PPO de 0.2, optimizador AdamW con learning rate 5e-6, y rollouts con vLLM (8 muestras por prompt, temperatura 0.7, top_p 0.95, top_k 20). El harness utilizado es terminus-2, con interleaved thinking habilitado. El checkpoint exportado corresponde al paso 45 de RL.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades generales de Qwen3-8B, incluyendo comprensión y generación de lenguaje natural.
- Agente de código: puede emitir comandos shell, ediciones de archivos y razonar sobre la salida del terminal para resolver tareas de ingeniería de software.
- Tool calling / function calling: integrado en el formato de interacción agéntica, permite al modelo invocar herramientas externas.
- Soporte de agentes y multi-step reasoning: el interleaved thinking permite al modelo alternar razonamiento y acciones en pasos múltiples.
- Capacidades multilingües: no especificadas para este checkpoint, pero heredadas de Qwen3-8B, que soporta más de 30 idiomas.
- No incluye capacidades de visión ni audio; es exclusivamente texto.

## Casos de uso

- Automatización de tareas de ingeniería de software: el modelo puede resolver issues de GitHub, generar parches o refactorizar código, ejecutándose en un sandbox para validar sus acciones.
- Generación de tests unitarios: dado un método o función, el modelo genera tests que pasan, gracias a su entrenamiento en tareas pymethods2test.
- Asistente de terminal interactivo: puede actuar como un copiloto que ejecuta comandos, interpreta errores y sugiere correcciones en tiempo real.
- Integración en pipelines de CI/CD: el modelo puede generar código de prueba o parches automáticamente, reduciendo la intervención manual.
- Investigación en RL para agentes: sirve como punto de partida para experimentos de refuerzo en entornos de código, dado su entrenamiento reproducible.
- Desarrollo de agentes autónomos: puede integrarse en frameworks como terminus-2 para construir asistentes de programación autónomos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación está pendiente (TBD) para este checkpoint específico. El proyecto reporta benchmarks para el modelo 32B, pero no para el 8B RL.

## Requisitos de hardware

- VRAM estimada: ~16 GB en bf16 (pesos completos); ~5-6 GB con cuantización de 4 bits (si se dispone de versiones cuantizadas, no oficiales).
- GPU recomendadas: RTX 4090 (24 GB) para inferencia en bf16; A100 o H100 para entrenamiento o despliegue a gran escala.
- Cabe en GPU de consumo: sí, con cuantización (por ejemplo, GGUF de 4 bits) en GPUs con 8 GB o más.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), todos compatibles con el formato safetensors.
- Latencia y throughput: no disponibles; dependen del hardware y la configuración de despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| OpenThinkerAgent-8B-RL (este) | 8,19B | 40.960 | SFT + RL | Apache-2.0 |
| Qwen3-8B (base) | 8,19B | 40.960 | Preentrenamiento + SFT | Apache-2.0 |
| OpenThinkerAgent-8B-ColdStartSFTForRL | 8,19B | 40.960 | SFT cold-start | Apache-2.0 |

El modelo RL se diferencia del base y del cold-start por su entrenamiento de refuerzo específico para tareas de agente de código, lo que mejora su capacidad para operar con herramientas y resolver tareas de ingeniería de software, aunque puede sacrificar generalidad en otros dominios.

## Limitaciones y advertencias

- Sesgos: no se han documentado específicamente, pero hereda los sesgos de Qwen3-8B, que pueden incluir sesgos culturales o de género.
- Riesgo de alucinación: el modelo puede generar comandos shell o ediciones incorrectas o inseguras; debe ejecutarse solo en entornos sandbox con revisión humana.
- Limitaciones de contexto: la ventana máxima es de 40.960 tokens, pero los rollouts de RL usaron 32.768, lo que puede afectar a tareas que requieran contextos más largos.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificación, sin restricciones significativas.
- Caveat de producción: el RL se optimizó para la distribución de tareas pymethods2test/SWE-Smith, por lo que la generalización a otros dominios de agentes puede ser desigual. No hay benchmarks verificados publicados para este checkpoint.

## Enlaces

- HuggingFace (zurichquants): https://huggingface.co/zurichquants/OpenThinkerAgent-8B-RL
- HuggingFace (open-thoughts, original): https://huggingface.co/open-thoughts/OpenThinkerAgent-8B-RL
- Modelo base (ColdStartSFT): https://huggingface.co/open-thoughts/OpenThinkerAgent-8B-ColdStartSFTForRL
- Repositorio GitHub: https://github.com/open-thoughts/OpenThoughts-Agent
- Página del proyecto: https://www.openthoughts.ai/blog/agent
- Dataset SFT cold-start: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-SFT-ColdStartForRL-10K
- Dataset RL: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-RL-5K
