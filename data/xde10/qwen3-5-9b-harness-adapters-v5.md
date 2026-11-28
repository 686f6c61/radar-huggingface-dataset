# XDE10/Qwen3.5-9B-Harness-Adapters-v5

## Resumen

Qwen3.5-9B Harness-Adapters-v5 es una coleccion de adaptadores LoRA publicada por el usuario XDE10 sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo completo, sino un conjunto de ocho adaptadores PEFT entrenados mediante aprendizaje por refuerzo agéntico (GRPO y variantes como Dr.GRPO con TIS) para mejorar el comportamiento del modelo cuando opera dentro de arneses de agente de programación reales y sin modificar: Pi CLI 0.73.1, OpenCode 2.2.7 y, como evaluación fuera de distribución, mini-swe-agent v2.

El objetivo es resolver un problema concreto: los modelos generalistas rinden muy por debajo de su potencial cuando se les coloca en un bucle agéntico real (lectura de repositorio, edición de ficheros, ejecución de tests, iteración). Estos adaptadores se entrenaron específicamente sobre ese tipo de trayectorias, con 248 módulos LoRA de rango 32 (y una variante de rango 64 con concatenación sin pérdida de información). El resultado reportado es una mejora sustancial en suites de evaluación de tipo SWE-bench sobre el modelo base.

La relevancia actual es doble: por un lado demuestra una metodología de RL agéntico ejecutable en una sola GPU; por otro, publica adaptadores listos para servir con vLLM mediante `--enable-lora`, lo que permite desplegar la mejora sin reentrenar el modelo base. El repositorio ocupa 0,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-9B; adaptadores de 248 modulos, rango 32 (variante r=64 con Concat-2r) |
| Parametros totales | No disponible (depende del modelo base Qwen3.5-9B; el repositorio solo contiene los pesos de los adaptadores) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible para los adaptadores; el ejemplo oficial sirve el base en `bfloat16` |
| Idiomas soportados | No disponible (la model card no declara idiomas; el informe tecnico esta en ingles y la guia visual en chino) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-9B |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B en modo no-thinking. Sobre él se entrenan adaptadores LoRA de 248 módulos con rango 32, más una variante de rango 64 (`super_v5_concat_2r`) que concatena dos adaptadores de rango 32 sin pérdida de información. El entrenamiento se realizó con RL agéntico en una sola GPU mediante configuración colocada (colocated), usando GRPO y una variante denominada Dr.GRPO con TIS (truncated importance sampling) para estabilizar la señal de recompensa. También se incluye un adaptador con arranque en caliente por RFT (rejection fine-tuning) seguido de 35 pasos de RL, que según el autor reduce un 30 % los pasos de RL necesarios.

La innovación metodológica destacable es el entrenamiento sobre arneses reales sin modificar, lo que alinea la distribución de entrenamiento con la de producción. Además se exploran técnicas de fusión de adaptadores: mezcla por media de pesos (`soup_v5_pi_qr_svd`), fusión entre arneses mediante QR-SVD a rango 32 y concatenación a rango 64. El autor reporta un hallazgo sobre GSPO (visible en las figuras del repositorio) y una sección dedicada a la "ciencia del merging". Los detalles completos están en el informe técnico `docs/V5_REPORT_EN.md`.

## Capacidades

- Resolución de tareas de ingeniería de software en bucle agéntico: exploración de repositorio, edición de ficheros, ejecución de comandos y tests, iteración sobre errores.
- Integración nativa con arneses de agente reales: Pi CLI 0.73.1 y OpenCode 2.2.7, con evaluación cero-shot en mini-swe-agent v2.
- Soporte de tool calling y function calling a través del parser `qwen3_coder` en vLLM (`--enable-auto-tool-choice`).
- Razonamiento multi-paso dentro de trayectorias largas de agente.
- Capacidades generales de texto, razonamiento y código heredadas del modelo base Qwen3.5-9B (no evaluadas de forma específica en esta model card).
- Variantes especializadas por arnés: un adaptador optimizado para OpenCode, otro para Pi, uno conjunto 50/50 y fusiones que buscan equilibrio entre ambos.
- Capacidades multilingües: no documentadas en la información disponible; deben asumirse las del modelo base.

## Casos de uso

- Automatización de resolución de issues en repositorios: el adaptador `v5_oc_main` alcanza un 45,83 % en SWE-bench Verified con OpenCode, por lo que es adecuado para pipelines que reciben un issue y deben producir un parche ejecutable con validación de tests.
- Integración en CI/CD para reparación automática de tests fallidos: el modelo, dentro del arnés, puede leer el fallo, localizar el código relevante, editar y volver a ejecutar la suite; el adaptador `soup_v5_pi_qr_svd` ofrece el comportamiento más equilibrado entre suites.
- Asistente de programación en terminal: con Pi CLI, el adaptador `super_v5_concat_2r` lidera SWE-bench Verified (Pi) con un 43,33 %, lo que lo hace idóneo para agentes de línea de comandos que operan sobre el sistema de ficheros.
- Despliegue multi-tenant con vLLM: al ser adaptadores LoRA servibles con `--enable-lora` y `--max-lora-rank 64`, se pueden cargar varios adaptadores sobre una única instancia del base y enrutar peticiones según el arnés o el tipo de tarea.
- Investigación en RL agéntico: los ocho adaptadores y sus curvas permiten reproducir y comparar estrategias (GRPO, Dr.GRPO+TIS, RFT warm-start, merging por soup, QR-SVD y concatenación) sobre un mismo base y conjunto de suites.
- Generalización a arneses no vistos: `super_v5_qr_svd` obtiene el mejor resultado en mini-swe-agent (43,08 %), lo que lo hace útil cuando el arnés de producción no coincide con los de entrenamiento.
- Evaluación comparativa de agentes: la batería de cinco suites (Pi heldout, OC heldout, OOD mini-swe, SWE-Verified en Pi y en OC) sirve como banco de pruebas para medir el impacto de cambios en el arnés o en el prompt.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (porcentaje de resolución):

| Adaptador | 5-Suite media | Pi heldout | OC heldout | OOD mini-swe | SWE-Verified (Pi) | SWE-Verified (OC) |
|---|---|---|---|---|---|---|
| Base Qwen3.5-9B | 33,12 % | 36,92 % | 38,85 % | 32,31 % | 23,33 % | 34,17 % |
| soup_v5_pi_qr_svd | 44,27 % | 47,69 % | 48,85 % | 42,31 % | 42,50 % | 40,00 % |
| super_v5_concat_2r | 42,33 % | 45,00 % | 47,31 % | 37,69 % | 43,33 % | 38,33 % |
| super_v5_qr_svd | 42,45 % | 47,31 % | 47,69 % | 43,08 % | 35,83 % | 38,33 % |
| v5_oc_main | 42,06 % | 45,00 % | 46,15 % | 40,00 % | 33,33 % | 45,83 % |
| v5_joint_oc_pi | 42,67 % | 46,92 % | 43,85 % | 39,23 % | 38,33 % | 45,00 % |
| v5_pi_drgrpo_tis | 43,55 % | 47,31 % | 47,31 % | 42,31 % | 40,83 % | 40,00 % |
| v5_pi_seed2 | 45,22 % | 56,15 % | 51,15 % | 44,62 % | 41,67 % | 32,50 % |
| v5_rft_plus_rl | No disponible | 48,46 % | 46,92 % | 38,46 % | 34,17 % | No disponible |

Notas: `super_v5_concat_2r` mejora +20 puntos porcentuales sobre el base en SWE-bench Verified (Pi); `v5_oc_main` mejora +11,7 puntos en SWE-bench Verified (OC). El autor advierte de alta varianza entre semillas (ejemplificada por `v5_pi_seed2`). No se han publicado resultados de MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM para el modelo base Qwen3.5-9B en bfloat16: aproximadamente 18 GB solo en pesos, más memoria para KV cache y activaciones; en la práctica se recomienda al menos 24 GB.
- Los adaptadores LoRA añaden una sobrecarga pequeña (repositorio total de 0,3 GB para los ocho), pero el base debe residir en memoria.
- GPU recomendadas para producción: A100 40/80 GB o H100 para servir con vLLM y varios adaptadores simultáneos; L40S o RTX 6000 Ada como alternativas de 48 GB.
- En GPU de consumo: una RTX 4090 (24 GB) puede alojar el base en bfloat16 de forma ajustada; con cuantización (no documentada para estos adaptadores) cabría en GPUs de 16 GB.
- Opciones de despliegue: vLLM con `--enable-lora --max-lora-rank 64` y `--lora-modules` (ejemplo oficial en la model card); llama.cpp u Ollama requerirían fusionar el adaptador en el base y convertir a GGUF, procedimiento no documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-9B Harness-Adapters-v5 | LoRA sobre Qwen3.5-9B | Base 9B + adaptadores | No disponible | Hasta 45,83 % (OC) / 43,33 % (Pi) | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | Modelo completo | 9B | No disponible | 23,33 % (Pi) / 34,17 % (OC) | Apache 2.0 | Hugging Face |
| Alternativas de agente de código del mismo tamano | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación significativa es contra el propio base sin adaptadores, ya que la model card no incluye referencias a otros modelos de la misma categoría. Para contextualizar con otros agentes de programación open source haría falta información adicional no presente en la ficha.

## Limitaciones y advertencias

- Los adaptadores están entrenados para arneses concretos (Pi CLI 0.73.1 y OpenCode 2.2.7); su comportamiento fuera de esos entornos depende de la generalización, que el autor mide pero no garantiza.
- Alta varianza entre semillas de entrenamiento: `v5_pi_seed2` supera al resto en suites heldout pero cae a 32,50 % en SWE-Verified (OC), lo que indica sobreajuste al arnés Pi en esa semilla.
- El modelo base se usa en modo no-thinking; no se documenta el comportamiento con razonamiento extendido.
- Riesgo de alucinación y de parches incorrectos: los porcentajes de resolución rondan el 40-45 %, por lo que se requiere validación con tests y revisión humana en producción.
- Sesgos: no documentados en la model card; deben asumirse los del modelo base Qwen3.5-9B.
- Idiomas: no declarados; el entrenamiento y las evaluaciones se centran en tareas de código, presumiblemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base Qwen3.5-9B.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de los resultados reportados.
- El adaptador `super_v5_concat_2r` requiere `--max-lora-rank 64` en vLLM; servirlo con el valor por defecto fallará o truncará los pesos.
- No se documentan procedimientos de fusión ni conversión a GGUF, lo que limita el despliegue en entornos sin vLLM.

## Enlaces

- Hugging Face: https://huggingface.co/XDE10/Qwen3.5-9B-Harness-Adapters-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio de código: https://github.com/XDE10/opencode-harness-adapter
- Guía visual (chino): docs/V5_EXPLAINER_ZH.md (dentro del repositorio de Hugging Face)
- Informe técnico completo (inglés): docs/V5_REPORT_EN.md (dentro del repositorio de Hugging Face)
- Figuras del pipeline y benchmarks: figures/explainer_1_training_pipeline.png, figures/explainer_2_benchmark_results.png, figures/explainer_3_gspo_discovery.png, figures/explainer_4_merging_science.png (dentro del repositorio de Hugging Face)
