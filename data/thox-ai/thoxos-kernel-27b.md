# Thox-ai/ThoxOS-Kernel-27B

## Resumen

ThoxOS-Kernel-27B es un ajuste fino de parámetros completos desarrollado por THOX.ai sobre la build comunitaria JonathanColetti/Qwen3.8-27B-Uncensored. Está especializado en tareas de kernel Linux, operaciones de sistema, runbooks de servicios y shell, trabajos de compilación y diagnóstico de ThoxOS, y operaciones de MeshStack sobre hosts de THOX. El modelo actúa además como profesor (teacher) para los modelos más pequeños de la familia ThoxOS-Kernel.

El modelo se distribuye con pesos abiertos bajo licencia Apache 2.0, en formato safetensors y GGUF (Q8_0 y Q4_K_M), y la build Q4_K_M está publicada en Ollama como `Thox-ai/thoxos-kernel-27b`. El autor declara que el fine-tune superó sus puertas de evaluación bajo el criterio de "final-answer scope" el 1 de noviembre de 2026, aunque el veredicto sobre completaciones en bruto se publica como "HELD".

La relevancia del modelo reside en su enfoque vertical: no es un modelo generalista, sino una especialización deliberada en administración de sistemas Linux y en el ecosistema ThoxOS. El repositorio ocupa 100,7 GB e incluye dos shards de safetensors, un fichero MTP, dos cuantizaciones GGUF y los ficheros de configuración y tokenizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8), con fichero MTP separado |
| Parámetros totales | 27B (según model card); el campo de parámetros de safetensors del repo indica 3.054.832, dato no coherente con el tamaño de los shards |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (BF16/FP16 presumible), GGUF Q8_0, GGUF Q4_K_M |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos sobre la build comunitaria Qwen3.8-27B-Uncensored, que a su vez deriva de la familia Qwen3.8. La arquitectura es de tipo transformer, con un fichero adicional `model-mtp.safetensors` de 849 MB que sugiere soporte de multi-token prediction (MTP), una técnica de decodificación especulativa que permite predecir varios tokens por paso para acelerar la inferencia. No se detalla en la información disponible la composición del dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron fases de RLHF o DPO.

El autor indica que THOX realizó el fine-tune, el gating y las conversiones a GGUF, y que los pesos publicados son byte-idénticos al artefacto que superó las puertas de evaluación (verificación SHA-256 fichero por fichero contra el registro de la build). El modelo está etiquetado como "uncensored" por herencia de su base, y la model card incluye notas del fundador sobre libertad creativa y ausencia de restricciones artificiales. No se han publicado detalles sobre la composición del corpus de especialización (runbooks, documentación de kernel, trazas de operaciones), más allá de las etiquetas temáticas del repositorio.

## Capacidades

- Generación de texto conversacional y de tipo instructivo en inglés.
- Razonamiento y asistencia en tareas de administración de sistemas Linux: gestión de servicios, diagnóstico, operaciones de shell.
- Trabajo con runbooks y procedimientos operativos: interpretación y generación de secuencias de comandos y pasos de resolución.
- Soporte para tareas de kernel y sistema operativo: compilación, diagnóstico y operaciones sobre ThoxOS.
- Operaciones de MeshStack sobre hosts de THOX.
- Función de modelo profesor para la familia ThoxOS-Kernel, es decir, generación de datos de entrenamiento para modelos menores.
- Modo "uncensored": ausencia declarada de restricciones de contenido por parte del autor.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistencia en administración de servidores Linux: el modelo puede generar y explicar comandos de shell, diagnosticar fallos de servicios systemd y proponer secuencias de recuperación, aprovechando su especialización en runbooks y operaciones de sistema.
- Automatización de runbooks operativos: dado un procedimiento documentado, el modelo puede adaptarlo al estado concreto de un host, generar los pasos intermedios y señalar dependencias, lo que encaja con su entrenamiento en runbooks de servicio y shell.
- Diagnóstico de compilaciones de kernel: el modelo puede interpretar errores de compilación, sugerir cambios en ficheros de configuración y explicar dependencias entre módulos, un escenario alineado con las tareas de build de ThoxOS.
- Soporte a operadores de MeshStack: asistencia en la gestión de hosts THOX, interpretación de estados y generación de comandos de operación sobre la malla.
- Generación de datos sintéticos para modelos menores: al actuar como teacher de la familia ThoxOS-Kernel, puede producir pares instrucción-respuesta especializados que alimenten el entrenamiento de variantes más pequeñas.
- Documentación técnica automatizada: generación de notas de versión, guías de operación y descripciones de cambios en infraestructura a partir de trazas o diffs, en inglés.
- Asistente de laboratorio para investigadores en sistemas: exploración de escenarios de configuración y explicación de comportamientos del kernel en un entorno controlado, con la advertencia de que el modelo es "uncensored" y requiere revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona un estado "GATE-PASSED" bajo el criterio de "final-answer scope" (2026-11-01) y un veredicto "HELD" para completaciones en bruto, pero no se incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño, un modelo de 27B en BF16 requiere del orden de 54 GB de VRAM solo para pesos; en Q8_0, alrededor de 28,6 GB (tamaño del fichero GGUF); en Q4_K_M, alrededor de 16,5 GB.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, la cuantización Q4_K_M podría caber en GPUs de consumo con 24 GB de VRAM; Q8_0 requeriría GPUs de 32 GB o superiores; BF16 requeriría A100 80 GB o H100.
- Cabe en GPU de consumo: probablemente la build Q4_K_M en tarjetas de 24 GB, aunque el autor no lo confirma.
- Opciones de despliegue: Ollama (build Q4_K_M publicada como `Thox-ai/thoxos-kernel-27b`), llama.cpp para los GGUF, y vLLM/TGI para safetensors (no confirmado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización | Disponibilidad |
|---|---|---|---|---|---|
| ThoxOS-Kernel-27B | 27B | no disponible | Apache 2.0 | Kernel Linux, sysadmin, ThoxOS | Hugging Face, Ollama |
| Qwen3.8-27B-Uncensored (base) | 27B | no disponible | no disponible | Generalista sin censura | Hugging Face |
| Modelos de la familia Qwen3.8 | no disponible | no disponible | no disponible | Generalista | Hugging Face |

La comparativa con alternativas de la misma categoría (modelos especializados en operaciones de sistema) no está disponible en la información proporcionada. El competidor directo más evidente es su propio modelo base, del que se diferencia por el ajuste fino vertical en tareas de kernel y operaciones.

## Limitaciones y advertencias

- El campo de parámetros de safetensors del repositorio indica 3.054.832, un dato incoherente con el tamaño de los shards (unos 54,7 GB en total) y con la denominación 27B; conviene verificar la configuración antes de desplegar.
- El modelo solo declara soporte de inglés; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- La naturaleza "uncensored" heredada de la base implica un mayor riesgo de generar contenido inapropiado o inseguro; requiere filtros y revisión humana en producción.
- Riesgo de alucinación en comandos de shell y procedimientos de sistema: un comando incorrecto puede causar daños en un host real; se recomienda validación en entornos de prueba.
- No se han publicado métricas de benchmarks ni resultados de cualificación de dispositivos; el autor declara explícitamente que no reclama resultados de "device-qualification".
- El estado de evaluación es ambiguo: "GATE-PASSED" solo bajo el criterio de "final-answer scope", con veredicto "HELD" para completaciones en bruto.
- La licencia Apache 2.0 permite uso comercial, pero la model card incluye notas del fundador y material promocional (campaña de Kickstarter) que no afectan a los términos legales.
- No se dispone de información sobre la longitud de contexto, lo que impide planificar casos de uso con documentos largos.
- La fecha de creación del repositorio (2026-10-30) y la referencia a Qwen3.8 deben tratarse con cautela, ya que no se ha podido verificar la existencia de dicha familia en fuentes independientes.

## Enlaces

- Hugging Face: https://huggingface.co/Thox-ai/ThoxOS-Kernel-27B
- Modelo base: https://huggingface.co/JonathanColetti/Qwen3.8-27B-Uncensored
- Demo de dispositivos virtuales THOX: https://thox.ai/#demo-callout-home_lineup
- Campaña de Kickstarter de THOX: https://www.kickstarter.com/projects/thox/four-devices-one-private-ai-ecosystem-thoxai
- Repositorio en Ollama: `Thox-ai/thoxos-kernel-27b` (referenciado en la model card; no se dispone de URL directa en la información proporcionada)
