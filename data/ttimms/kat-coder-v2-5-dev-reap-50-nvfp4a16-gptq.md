# Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16-GPTQ

## Resumen

KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16-GPTQ es una variante de cuantización del modelo de código agéntico KAT-Coder-V2.5-Dev, desarrollada por Ttimms como experimento de verificación independiente. El modelo base, Kwaipilot/KAT-Coder-V2.5-Dev, es un MoE de 18.5 mil millones de parámetros entrenado para operar como agente autónomo dentro de repositorios ejecutables, con post-entrenamiento basado en refuerzo (RL) para uso de herramientas. Esta variante aplica un podado del 50 % mediante REAP (pruning estructural) y posterior cuantización NVFP4A16 (4 bits, solo pesos) usando GPTQ en lugar del redondeo simple (RTN) de la versión principal.

El objetivo del autor era comprobar si el algoritmo GPTQ, que en la literatura suele superar a RTN para recuperación de pesos NVFP4, cerraba parte de la brecha frente al competidor Devstral Small 2512. Los resultados muestran que no hay diferencia medible entre GPTQ y RTN en este checkpoint concreto: las diferencias en HumanEval+ y MBPP+ no son estadísticamente significativas según la prueba de McNemar. Por ello, el propio autor publica esta variante "por completitud y verificación independiente", no como alternativa recomendada, y remite a la versión principal (RTN) como elección preferente.

El modelo está licenciado bajo Apache 2.0, tiene 18.543.997.568 parámetros totales y un peso de repositorio de 13.4 GB. Está diseñado para servirse con vLLM sobre GPUs Blackwell (SM120) mediante el kernel Marlin NVFP4, que decodifica los pesos de 4 bits y computa en bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (MoE, transformer) |
| Parametros totales | 18.543.997.568 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base KAT-Coder-V2.5-Dev no especifica en la informacion proporcionada) |
| Tipos de cuantizacion | NVFP4A16 (4-bit weight-only, GPTQ rounding) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con compressed-tensors y vLLM) |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev es un MoE de la familia Qwen3.5 (etiquetado como `qwen3_5_moe`), entrenado específicamente para tareas de codificacion agéntica: el modelo opera dentro de repositorios reales, ejecuta comandos, lee archivos y recibe retroalimentación del entorno. Su post-entrenamiento combina un framework agéntico de extremo a extremo con refuerzo basado en recompensas verificables, lo que explica su ventaja en SWE-bench Verified frente a modelos base sin ese entrenamiento (69.40 % vs 58.60 % de Qwen3.5-35B-A3B).

Esta variante concreta parte del checkpoint podado al 50 % con REAP (`Ttimms/KAT-Coder-V2.5-Dev-REAP-50-bf16`) y le aplica cuantización NVFP4A16 mediante `llm-compressor` con el modificador GPTQ (`actorder="static"`, `block_size=128`, `dampening_frac=0.01`). La calibración se realizó con el dataset `theblackcat102/evol-codealpaca-v1`, el mismo conjunto y semilla que la versión RTN, de modo que el único variable entre ambas es el algoritmo de redondeo. El proceso de cuantización fue limpio: 5 horas y 23 minutos, sin excepciones ni fallos de redondeo en los 15.520 módulos cuantizados.

## Capacidades

- Generación de código y razonamiento sobre repositorios completos, gracias al entrenamiento agéntico del modelo base.
- Soporte de tool calling y ejecución de comandos en entornos sandbox, característica central del KAT-Coder-V2.5-Dev.
- Capacidad de razonamiento multi-paso y planificación de tareas de codificación complejas (SWE-bench Verified como referencia).
- Multilingüismo: no disponible en la información proporcionada.
- No soporta visión: el repo de GitHub indica explícitamente que el checkpoint es "vision-free", a pesar de que el tag de HuggingFace incluya `image-text-to-text`.
- Compatible con vLLM y el kernel Marlin NVFP4 para inferencia en GPUs Blackwell.

## Casos de uso

- Agente de codificación autónomo en CI/CD: el modelo puede recibir un issue de GitHub, explorar el repositorio, proponer un parche y validarlo ejecutando tests, gracias a su entrenamiento agéntico y al soporte de tool calling.
- Asistente de refactorización de código a gran escala: su capacidad para operar sobre múltiples archivos y mantener contexto de proyecto lo hace adecuado para tareas de migración o limpieza de código.
- Generación de código en producción con verificación: puede integrarse en pipelines donde cada sugerencia se valida contra un conjunto de pruebas, reduciendo el riesgo de alucinaciones.
- Resolución de incidencias en repositorios open source: el modelo puede analizar bugs, localizar la causa raíz y generar un parche candidate, como se demuestra en SWE-bench Verified.
- Tutor de programación avanzado: su capacidad de razonamiento multi-paso permite explicar soluciones complejas y depurar errores en código existente.
- Automatización de tareas de mantenimiento de software: actualización de dependencias, corrección de vulnerabilidades o adaptación de código a nuevas APIs, siempre que se le proporcione un entorno ejecutable.

## Benchmarks y rendimiento

La model card de esta variante GPTQ incluye resultados comparativos frente a la versión principal (RTN) bajo la misma metodología de evaluación:

| Benchmark | Versión principal (RTN) | Esta variante (GPTQ) | Pares discordantes | p de McNemar |
|---|---:|---:|---:|---:|
| HumanEval+ | 90.85 % | 89.63 % | 6 / 164 | 0.68 (no significativo) |
| MBPP+ | 89.95 % | 89.42 % | 18 / 378 | 0.81 (no significativo) |

El autor concluye que no hay diferencia detectable entre ambos algoritmos, y que el análisis carece de potencia estadística suficiente (necesitaría 40-50 pares discordantes). No se han publicado benchmarks de esta variante contra otros modelos cuantizados. Para referencia, el modelo base sin podar ni cuantizar alcanza 69.40 % en SWE-bench Verified según el artículo de HackerNoon, frente al 58.60 % de Qwen3.5-35B-A3B.

## Requisitos de hardware

- Tamaño del repositorio: 13.4 GB en formato safetensors. Con cuantización 4-bit, los pesos ocupan aproximadamente 9.3 GB, más overhead de activaciones y KV cache.
- VRAM estimada: para inferencia con bf16 de activaciones y pesos NVFP4, se recomienda al menos 16 GB de VRAM. Con vLLM y el kernel Marlin NVFP4, es viable en GPUs consumer de gama alta (RTX 5090 con 32 GB) o en GPUs de datacenter Blackwell (B200).
- Requisito crítico: el kernel Marlin NVFP4 requiere compute capability 12.0 (SM120), es decir, GPUs Blackwell (serie RTX 50 o B200). No funciona en Ampere, Ada o Hopper.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo del kernel Marlin NVFP4), y potencialmente otros motores compatibles con compressed-tensors. No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. El repo de GitHub indica que el checkpoint carga sin CPU offload en SM120.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Cuantización |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev (base) | 18.5B (MoE) | no disponible | 69.40 % | Apache 2.0 | bf16 |
| KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16 (RTN) | 18.5B (MoE podado 50 %) | no disponible | no publicado | Apache 2.0 | NVFP4A16 |
| KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16-GPTQ (esta variante) | 18.5B (MoE podado 50 %) | no disponible | no publicado | Apache 2.0 | NVFP4A16 + GPTQ |
| Devstral Small 2512 | no disponible | no disponible | 56.4 % (mencionado como barra competitiva) | no disponible | no disponible |
| Qwen3.5-35B-A3B | 35B (MoE, 3B activos) | no disponible | 58.60 % | no disponible | no disponible |

La comparativa se basa en datos del artículo de HackerNoon y de la model card. No hay comparaciones directas entre esta variante GPTQ y los otros modelos cuantizados.

## Limitaciones y advertencias

- El propio autor declara que esta variante no es una alternativa recomendada: se publica "por completitud y verificación independiente". La versión principal (RTN) es la mantenida activamente.
- No hay evidencia de que GPTQ mejore el rendimiento en este checkpoint; las diferencias observadas no son estadísticamente significativas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o plausible pero no funcional. Su uso en producción requiere validación mediante tests automatizados.
- Sesgos: no se documentan sesgos específicos, pero el modelo base fue entrenado principalmente con datos de código, por lo que su rendimiento en otros dominios puede ser limitado.
- Restricciones de hardware: el kernel NVFP4 exige GPUs Blackwell (SM120), lo que excluye la mayoría de hardware consumer actual (RTX 40 series y anteriores) y de datacenter (A100, H100).
- La información sobre contexto e idiomas no está disponible, lo que limita la evaluación de su ventana de atención y su cobertura multilingüe.
- El proceso de podado al 50 % puede haber degradado capacidades no relacionadas con código, aunque no hay datos publicados al respecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16-GPTQ
- Versión principal (RTN): https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
- Checkpoint podado en bf16: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-bf16
- Repositorio GitHub del proyecto: https://github.com/t-timms/kat-coder-nvfp4
- Paper técnico del modelo base: https://arxiv.org/abs/2607.05471
- Artículo de HackerNoon sobre KAT-Coder-V2.5-Dev: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
