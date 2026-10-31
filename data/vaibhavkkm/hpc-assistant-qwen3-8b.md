# VaibhavKKM/hpc-assistant-qwen3-8b

## Resumen

Hpc-assistant-qwen3-8b es un modelo de lenguaje especializado en computación de alto rendimiento (HPC) y en el gestor de colas Slurm, creado por el usuario VaibhavKKM. Se trata de un ajuste por destilación de Qwen3-8B, donde un modelo profesor más grande (Qwen3-235B-A22B-Instruct-2507) generó las respuestas de entrenamiento, siguiendo la receta ya publicada por el autor en su variante de 4B (hpc-assistant-qwen3-4b). El objetivo es resolver un problema práctico muy concreto: los asistentes generales suelen fallar en preguntas sobre scripts de Slurm, planificadores de colas y documentación de HPC, un dominio con abundante documentación técnica pero poco representado en los corpus de preentrenamiento.

El modelo conserva la arquitectura transformer densa de Qwen3-8B (8.190.735.360 parámetros) e incorpora un modo de razonamiento ("thinking") que se activa mediante el argumento `enable_thinking` de la plantilla de chat, activado por defecto. En la evaluación publicada (run `e8_all`), alcanza una tasa de victoria media de 0,8746 frente al Qwen3-4B base en preguntas de HPC con respuestas cerradas, y 0,9091 con el thinking activado. Es relevante para administradores de clústeres, equipos de soporte HPC y desarrolladores que necesiten un asistente local, con licencia Apache 2.0 y pesos disponibles en safetensors y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (aviso del autor: los prompts de más de 10.000 tokens pueden perder su inicio) |
| Tipos de cuantizacion | Q4_K_M y Q8_0 (GGUF); safetensors en precisión original |
| Idiomas soportados | no disponible (heredado presumiblemente del Qwen3-8B base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer decoder denso de la familia Qwen3, sin capas MoE. El entrenamiento es un proceso de destilación por estudiante: las respuestas de referencia las genera Qwen3-235B-A22B-Instruct-2507 (el profesor), y el run publicado (`e8_all`) añade una etapa de thinking procedente del checkpoint `q397fp8`, usando solo el texto final de las respuestas, sin soft targets (logits del profesor). El pipeline de entrenamiento está disponible en el directorio `training/` del repositorio.

El dataset de entrenamiento se compone de preguntas sobre HPC y Slurm, con respuestas basadas en fragmentos de documentación recuperada (RAG). El autor documenta algunos detalles relevantes: 46 de 136.452 secuencias con más de 10.000 tokens perdieron su inicio durante el entrenamiento en modo thinking-off, y las respuestas con thinking excesivamente largo fueron descartadas. Además, los prompts de entrenamiento contienen unas 3 trazas por cada 30.000 muestreadas de la familia Aalto (usada como held-out en evaluación), lo que constituye una pequeña fuga de datos a tener en cuenta. No se menciona RLHF ni DPO explícitos; la técnica principal es la destilación de respuestas.

## Capacidades

- Generación de texto conversacional especializada en HPC: scripts de Slurm, gestión de colas, configuración de clústeres y documentación técnica del dominio.
- Modo de razonamiento ("thinking") activable con `enable_thinking` en la plantilla de chat (activado por defecto), que mejora la tasa de victoria de 0,8746 a 0,9091 en la evaluación publicada.
- Rendimiento mejorado frente al modelo base en preguntas de HPC con documentación recuperada: 0,8746 de win rate medio frente al Qwen3-4B base en modo cerrado.
- Compatibilidad con el ecosistema transformers y con inferencia GGUF (llama.cpp y derivados).
- Capacidades generales de Qwen3-8B (razonamiento general, código, matemáticas) presumiblemente heredadas, aunque el ajuste está orientado a HPC.
- Tool calling: el autor indica que las suites de pruebas de tool calling no se volvieron a ejecutar para este modelo, por lo que su soporte no está verificado.

## Casos de uso

- Asistente de soporte para clústeres HPC: integrado en un chatbot interno con recuperación de documentación (RAG), puede responder dudas de usuarios sobre cómo enviar trabajos, interpretar errores de `sbatch` o ajustar recursos solicitados, gracias a su entrenamiento con respuestas basadas en documentación real.
- Generación de scripts de Slurm: un usuario puede describir su carga de trabajo (número de nodos, GPUs, tiempo máximo) y el modelo redacta el script de envío correspondiente, reduciendo la barrera de entrada para investigadores sin experiencia en HPC.
- Formación de nuevos usuarios de clúster: como tutor interactivo que explica conceptos de particiones, límites de fairshare, prioridades y políticas de uso, con la ventaja de poder desplegarse localmente sin enviar datos institucionales a servicios externos.
- Automatización de respuestas en tickets de soporte HPC: clasificación y borrador de respuesta inicial para incidencias comunes de Slurm, integrable en sistemas de tickets como fuente de primera respuesta.
- Depuración de trabajos fallidos: análisis de logs de errores típicos de Slurm (OOM, timeouts, fallos de MPI) para sugerir causas y correcciones, aprovechando el modo thinking para razonamientos multi-paso.
- Asistente local en estaciones de trabajo sin conexión: gracias a las versiones GGUF Q4_K_M (~5 GB) y Q8_0 (~8,7 GB), puede ejecutarse en portátiles y estaciones de trabajo con llama.cpp u Ollama, útil en entornos de cómputo con restricciones de red.
- Documentación interactiva de clúster: integración en la wiki o portal del clúster para responder preguntas sobre la configuración específica del centro combinando el modelo con la documentación local.

## Benchmarks y rendimiento

El autor publica tasas de victoria (win rates) frente a las respuestas cerradas del Qwen3-4B base, evaluadas por tres modelos juez con voto mayoritario en ambos órdenes (los empates cuentan medio punto). Las respuestas usan fragmentos de documentación recuperada y el thinking se elimina antes del juicio. El ruido entre ejecuciones del mismo modelo es de aproximadamente 0,01. No son benchmarks estándar (MMLU, HumanEval, etc.), sino una evaluación específica del dominio HPC.

| Run | Media | v2 | v3 | d1 | Sin respuesta | Límite alcanzado |
|---|---|---|---|---|---|---|
| e8_all (pesos publicados, thinking off) | 0,8746 | 0,8788 | 0,9384 | 0,8066 | 0 | 3 |
| e8_all_on (thinking on) | 0,9091 | 0,9242 | 0,9589 | 0,8443 | 1 | 1 |
| e8_ctrl13 | 0,8558 | 0,8636 | 0,9349 | 0,7689 | 0 | 4 |
| e8_van_off | 0,6600 | 0,6856 | 0,7072 | 0,5873 | 0 | 0 |
| e8_van_on | 0,7452 | 0,7727 | 0,7860 | 0,6769 | 6 | 6 |
| tc_t235think | 0,8443 | 0,8788 | 0,8545 | 0,7995 | 19 | 19 |
| tc_397on | 0,8737 | 0,8788 | 0,9332 | 0,8090 | 2 | 2 |
| e8_k1 | 0,8147 | 0,8144 | 0,8938 | 0,7358 | 0 | 4 |
| kdall (referencia 4B) | 0,8665 | 0,8902 | 0,9264 | 0,7830 | 0 | 2 |
| kdall6 (referencia 4B) | 0,8742 | 0,8826 | 0,9264 | 0,8137 | 0 | 2 |

El resultado primario, fijado de antemano, es `e8_all` con thinking desactivado: 0,8746. Los demás runs son candidatos adicionales, por lo que sus mejores cifras son figuras best-of-several. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la versión Q4_K_M ocupa unos 5 GB de disco (cabe en GPUs de 8 GB de VRAM); la Q8_0 requiere unos 9-10 GB; los safetensors en precisión completa requieren aproximadamente 16-18 GB en FP16/BF16.
- GPUs recomendadas: para safetensors en BF16, una RTX 4090 (24 GB), A100 o H100; para las versiones GGUF cuantizadas, cualquier GPU consumer moderna (RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB) o incluso CPU pura con velocidad reducida.
- Encaja sin problemas en GPUs consumer: la Q4_K_M funciona en GPUs de 8 GB y la Q8_0 en GPUs de 12 GB o superiores, dejando margen para el KV cache.
- Opciones de despliegue: transformers (librería nativa), llama.cpp y derivados (Ollama, LM Studio) gracias a los GGUF publicados; no se menciona soporte explícito de vLLM o TGI, aunque al ser un modelo Qwen3 denso con formato estándar debería funcionar con vLLM y TGI.
- Latencia y throughput: no disponibles; al ser un modelo denso de 8B con modo thinking activado por defecto, cabe esperar respuestas largas con thinking activado, lo que aumenta la latencia percibida de forma significativa.

## Comparativa con modelos similares

| Modelo | Parametros | Especialización | Licencia | Formatos | Win rate HPC publicado |
|---|---|---|---|---|---|
| hpc-assistant-qwen3-8b | 8,19 B | HPC y Slurm (destilación) | Apache 2.0 | safetensors, GGUF (Q4_K_M, Q8_0) | 0,8746 (thinking off) / 0,9091 (thinking on) |
| hpc-assistant-qwen3-4b (mismo autor) | 4 B (no disponible exacto) | HPC y Slurm (destilación) | Apache 2.0 | safetensors, GGUF | 0,8665 / 0,8558 según run |
| Qwen/Qwen3-8B (base) | 8,19 B | General | Apache 2.0 | safetensors, GGUF | no disponible (es la referencia base del win rate) |

La comparación más directa es con la variante de 4B del mismo autor: el modelo de 8B publicado (`e8_all`) obtiene 0,8746 frente a 0,8665 y 0,8558 de los runs de 4B, una diferencia dentro del margen de ruido según el propio autor, a cambio del doble de coste de inferencia. Frente al Qwen3-8B base, no hay cifras comparables publicadas en la información disponible, aunque la evaluación sugiere que el ajuste aporta mejoras sustanciales en el dominio HPC (los runs "vanilla" del pipeline se quedan en 0,66-0,75).

## Limitaciones y advertencias

- Fuga de datos parcial: los prompts de entrenamiento contienen unas 3 trazas por cada 30.000 de la familia Aalto, que se usa como held-out en la evaluación, lo que puede inflar ligeramente los win rates en ese subconjunto.
- Pérdida de contexto en prompts largos: 46 de 136.452 secuencias de más de 10.000 tokens perdieron su inicio durante el entrenamiento thinking-off, por lo que los prompts muy largos pueden degradar la calidad de la respuesta.
- Respuestas sin thinking completo: en evaluación, una respuesta cuyo thinking no termina cuenta como no respondida; con thinking activado aparecen casos de "sin respuesta" y de límite de longitud alcanzado.
- Tool calling sin verificar: las suites de pruebas de tool calling no se volvieron a ejecutar para este modelo, por lo que su uso en escenarios de agentes con herramientas no está garantizado.
- Riesgo de alucinación: no cuantificado por el autor; al tratarse de un modelo de 8B destilado, puede generar configuraciones de Slurm o flags incorrectos, por lo que se recomienda validar siempre los scripts generados antes de enviarlos a un clúster real.
- Alcance de evaluación limitado: la evaluación es específica de HPC/Slurm con documentación recuperada y usa juez LLM (con el sesgo inherente); no hay benchmarks estándar ni pruebas de las suites de producto.
- Proyecto de autor individual: con 305 descargas y 1 like en el momento de la ficha, el mantenimiento, la documentación y el soporte comunitario son limitados; conviene tratarlo como modelo experimental.
- Licencia: Apache 2.0 permite uso comercial sin restricciones relevantes, aunque los términos de la licencia del modelo base Qwen3 (también Apache 2.0) aplican de forma heredada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VaibhavKKM/hpc-assistant-qwen3-8b
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Variante de 4B del mismo autor (receta de referencia): https://huggingface.co/VaibhavKKM/hpc-assistant-qwen3-4b
- Modelo profesor: https://huggingface.co/Qwen/Qwen3-235B-A22B-Instruct-2507
- Paper, blog y demo: no disponibles en la información proporcionada.
