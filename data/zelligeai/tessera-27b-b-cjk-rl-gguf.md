# ZelligeAI/Tessera-27B-B-CJK-RL-GGUF

## Resumen

Tessera-27B-B-CJK-RL-GGUF es la distribución en formato GGUF de Tessera-27B-B-CJK-RL, un modelo de agente de programación desarrollado por ZelligeAI sobre Qwen3.8-27B. El modelo está diseñado para tareas de codificación agéntica y razonamiento matemático, y su rasgo más diferencial es que "piensa" en CJK comprimido (una taquigrafía que mezcla inglés, palabras chinas y símbolos), lo que reduce el número de tokens de razonamiento por turno de agente respecto al modelo base. Las respuestas y las llamadas a herramientas se emiten normalmente en inglés plano y código.

Este repositorio contiene únicamente los pesos cuantizados para llama.cpp: el modelo BF16 sin cuantizar (en dos partes), cinco cuantizaciones con el layout de Unsloth y el proyector de visión en F16. Los pesos bf16 fusionados residen en el repositorio principal, y el adaptador PEFT en el repositorio LoRA. El modelo es una release beta: un LoRA de rango 32 fusionado en los pesos bf16 del modelo base, entrenado con ocho actualizaciones de aprendizaje por refuerzo sobre matemáticas y código.

Con 27.320.697.856 parámetros y licencia Apache 2.0, el modelo se posiciona en la franja de 27B orientada a agentes de código. Es relevante porque combina una reducción del coste de razonamiento por turno con una mejora medible en problemas de competición matemática, y porque la disponibilidad de GGUF permite desplegarlo en llama.cpp con contexto declarado de 65.536 tokens en el comando de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens (valor usado en el comando de referencia de llama.cpp; no se documenta el máximo oficial) |
| Tipos de cuantizacion | BF16, Q3_K_XL, Q4_K_XL, Q5_K_XL, Q6_K_XL, Q8_K_XL (replicas del layout Unsloth) |
| Idiomas soportados | no disponible (el razonamiento interno usa CJK comprimido; respuestas y tool calls en inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (BF16 en 2 partes, 5 cuantizaciones, proyector de visión F16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B y se construye en dos etapas: primero se obtiene Tessera-27B-B-CJK, un fine-tune que introduce el razonamiento en CJK comprimido, y después se aplican ocho actualizaciones de aprendizaje por refuerzo sobre matemáticas y código para producir Tessera-27B-B-CJK-RL. La release es un LoRA de rango 32 fusionado en los pesos bf16 del modelo base; el adaptador PEFT (1,09 GB) se publica por separado. No se detalla en la información disponible la composición del dataset de RL ni el número de tokens de entrenamiento.

La innovación técnica principal es el control del coste de razonamiento por turno: en tareas de agente de código reservadas, el modelo consume 0,67x los tokens de pensamiento del modelo base por turno típico (IC 0,53-0,85), frente a 0,60x de Tessera-27B-B-CJK. Es decir, conserva la mayor parte del ahorro del modelo anterior a costa de un ligero incremento (1,11x respecto a Tessera-27B-B-CJK, IC 0,98-1,26). El modelo soporta un parámetro `reasoning_effort` con valor `xhigh`, y las muestras de referencia se tomaron con temperatura 1,0, top-p 0,95 y top-k 20.

## Capacidades

- Generación de código y tareas de agente de programación (tag `coding-agent`).
- Razonamiento matemático de competición: resuelve problemas de AIME y HMMT.
- Razonamiento interno en CJK comprimido, con salida en inglés plano y código.
- Llamadas a herramientas válidas: 256 de 256 tool calls válidas en los turnos de agente evaluados.
- Comportamiento agéntico multi-turno (tag `agentic`).
- Entrada de imágenes mediante el proyector de visión `mmproj-Tessera-27B-B-CJK-RL-F16.gguf` (0,93 GB).
- Modo de razonamiento configurable vía `reasoning_effort` (valor documentado: `xhigh`).
- Conversacional (tag `conversational`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Agentes de código autónomos: el modelo está entrenado específicamente para turnos de agente con tool calling válido y un coste de razonamiento reducido, lo que abarata las ejecuciones multi-paso en pipelines de desarrollo.
- Resolución de problemas matemáticos de competición: obtiene 108 de 126 respuestas correctas en AIME y HMMT de febrero de 2026 (63 problemas, 2 intentos), adecuado para evaluación y generación de soluciones razonadas.
- Asistentes de programación integrados en IDE: con 65.536 tokens de contexto puede mantener conversaciones largas con fragmentos de código extensos y llamadas a herramientas del entorno.
- Automatización de tareas de refactorización y corrección: el soporte de tool calling permite encadenar lecturas de ficheros, ediciones y ejecución de tests dentro de un bucle agéntico.
- Análisis de capturas y diagramas técnicos: con el proyector de visión cargado puede procesar imágenes junto a texto, útil para interpretar errores en pantalla o diagramas de arquitectura.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q3_K_XL (13,15 GB) y Q4_K_XL (17,56 GB) permiten ejecutar el modelo en GPUs de consumo con llama.cpp.
- Evaluación comparativa de estrategias de razonamiento: el parámetro `reasoning_effort` y el razonamiento CJK permiten medir el equilibrio entre precisión y tokens consumidos en producción.

## Benchmarks y rendimiento

Los resultados publicados provienen del LoRA sobre Tinker, que según el autor coincide con los pesos bf16 fusionados mediante una comprobación de logprob; no son mediciones de los ficheros GGUF de este repositorio. Muestreo en bf16 con `reasoning_effort="xhigh"`, temperatura 1,0, top-p 0,95 y top-k 20; intervalos al 90%.

| Benchmark | Tessera-27B-B-CJK-RL | Tessera-27B-B-CJK |
|---|---|---|
| AIME y HMMT febrero 2026 (63 problemas, 2 intentos) | 108 de 126 correctos | 97 |
| Mismos problemas, intentos cortados en la ventana de 64K tokens | 11 | 23 |
| Tokens de pensamiento por turno de agente frente al modelo base (turno típico, 64 estados nuevos de 16 tareas de agente de código reservadas) | 0,67x (IC 0,53-0,85) | 0,60x (IC 0,50-0,73) |
| Tool calls válidas en esos turnos | 256 de 256 | 256 de 256 |

Datos adicionales: la ganancia emparejada en los problemas de competición es de +5,5 problemas (IC +1,5 a +9,5), en parte por terminar dentro de la ventana con más frecuencia. En 118 problemas difíciles de matemáticas y código usados previamente, obtuvo 100 correctos frente a 89 (media de dos intentos). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia según el fichero: Q3_K_XL 13,15 GB, Q4_K_XL 17,56 GB, Q5_K_XL 20,88 GB, Q6_K_XL 25,30 GB, Q8_K_XL 31,46 GB, BF16 54,66 GB (44,98 GB + 9,68 GB). Añadir 0,93 GB si se carga el proyector de visión.
- GPU recomendadas: no disponibles de forma explícita. Por tamaño, las cuantizaciones Q3 y Q4 caben en GPUs de consumo con 24 GB de VRAM (por ejemplo, RTX 4090); Q5 y Q6 requieren 24-32 GB; Q8 y BF16 requieren GPUs de centro de datos (A100 40/80 GB, H100).
- Cabe en GPU de consumo: sí, al menos Q3_K_XL y Q4_K_XL en tarjetas de 24 GB.
- Opciones de despliegue: llama.cpp (probado con `llama-server` compilado con CUDA en el commit c83f3058). No se ha probado la ruta `--jinja` con plantilla de chat ni los kwargs de plantilla; las pruebas se hicieron con prompts pre-tokenizados.
- Latencia y throughput: no disponibles.
- Comando de referencia probado: `llama-server -m Tessera-27B-B-CJK-RL-UL-Q4_K_XL.gguf --jinja -c 65536 --temp 1.0 --top-p 0.95 --top-k 20 --chat-template-kwargs '{"reasoning_effort": "xhigh"}'`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Tessera-27B-B-CJK-RL | 27,3B | 65.536 (uso documentado) | Apache 2.0 | GGUF, bf16, LoRA, NVFP4/FP8 | Modelo de agente de código con razonamiento CJK y RL en matemáticas/código |
| Tessera-27B-B-CJK | no disponible | no disponible | no disponible | GGUF disponible | Predecesor sin RL; 97/126 en AIME y HMMT frente a 108/126; 0,60x tokens de pensamiento por turno |
| Qwen3.8-27B | 27B (aproximado por nombre) | no disponible | no disponible | no disponible | Modelo base sobre el que se construye Tessera; referencia de tokens de pensamiento por turno |

No se dispone de datos de benchmarks estándar ni de especificaciones completas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Release beta: el modelo es un LoRA de rango 32 fusionado; el autor lo etiqueta explícitamente como beta.
- Los resultados publicados corresponden al LoRA sobre Tinker y no a los ficheros GGUF de este repositorio, que no han sido evaluados en calidad. Las comprobaciones realizadas solo verifican que cada fichero funciona (comportamiento en texto), no su calidad.
- El proyector de visión no se cargó en las comprobaciones de comportamiento.
- Las cuantizaciones usan la imatrix de Unsloth calculada sobre el modelo base, no sobre este fine-tune; copian el layout de Unsloth pero no reproducen su procedimiento completo.
- El encabezado de UL-Q8_K_XL declara `file_type Q4_K_M` por copia del encabezado de Unsloth.
- No se ha probado la ruta `--jinja` con plantilla de chat ni los kwargs de plantilla; el soporte de chat templates no está validado.
- El razonamiento interno en CJK comprimido puede dificultar la auditoría e interpretación de las trazas de pensamiento.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; las respuestas y tool calls se emiten en inglés, lo que limita el uso en castellano sin validación adicional.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.8-27B conviene verificar las condiciones del modelo base.
- Contexto: el valor de 65.536 tokens corresponde al comando de referencia, no a un máximo oficial documentado; en los benchmarks, 11 de 126 intentos se cortaron en la ventana de 64K.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-GGUF
- Repositorio principal (bf16 fusionado): https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL
- Repositorio LoRA (adaptador PEFT): https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-LoRA
- Repositorio NVFP4/FP8: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-RL-NVFP4
- Modelo predecesor: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK
- GGUF del predecesor: https://huggingface.co/ZelligeAI/Tessera-27B-B-CJK-GGUF
- Nota de release: https://zellige.ai/research/tessera-27b-b-cjk-rl-release
- Referencia de cuantizaciones Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
