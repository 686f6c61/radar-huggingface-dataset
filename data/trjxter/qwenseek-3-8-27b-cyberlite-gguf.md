# trjxter/Qwenseek-3.8-27B-CyberLite-GGUF

## Resumen

Qwenseek-3.8-27B-CyberLite es un ajuste fino supervisado (SFT) del modelo base `unsloth/Qwen3.8-27B`, especializado en ciberseguridad defensiva, razonamiento red-team controlado, codificación y uso de herramientas. Ha sido desarrollado por el usuario trjxter como primera etapa de una serie de modelos cyber sobre la arquitectura Qwen3.8 (familia `qwen3_5`). El modelo conserva las capacidades generales de razonamiento técnico y tool-calling del base, a la vez que incorpora un corpus de entrenamiento centrado en análisis de vulnerabilidades, revisión de código seguro y planificación de respuesta a incidentes.

Con aproximadamente 27.320 millones de parámetros (27,3B), este modelo se distribuye en formato GGUF para inferencia local con `llama.cpp`, con 18 cuantizaciones estándar sin matriz de importancia. El contexto validado durante el SFT es de 32.768 tokens, aunque el modelo base soporta hasta 256K. La licencia Apache-2.0 permite uso comercial sin restricciones. Su relevancia radica en ofrecer una opción de 27B ejecutable en hardware de consumo con capacidades específicas de seguridad informática, manteniendo un perfil generalista útil para flujos de trabajo técnicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (familia `qwen3_5`), transformer denso multimodal con visión congelada |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (validado en SFT); el base soporta hasta 256K |
| Tipos de cuantizacion | Q2_K, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_NL, IQ4_XS, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_0, Q5_1, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles principalmente (el corpus de SFT es en ingles) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (derivado de safetensors BF16) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.8-27B`, una version optimizada del Qwen3.8-27B oficial de Qwen. La arquitectura es un transformer denso con componentes multimodales, pero en este SFT los parametros de vision permanecieron congelados, por lo que el resultado es un modelo especializado en texto. El entrenamiento se realizo mediante SFT con QLoRA de 4 bits, con rango 64 y alpha 128, sobre una unica GPU NVIDIA H100 de 80 GB en precision BF16. El contexto de entrenamiento validado fue de 32.768 tokens.

Los datos de entrenamiento provienen de dos datasets de destilacion de profesor: `trjxter/DeepSeek-V4-Flash-0731-Teacher-Distillation-40513x` y `trjxter/DeepSeek-V4-Pro-Reasoning-8000x`. El corpus mezcla ejemplos de seguridad informatica con ingenieria de software, agentes, tool-calling y razonamiento general, con el objetivo de no sacrificar las capacidades generales. No se aplico RLHF ni DPO; el metodo fue exclusivamente SFT. La generacion de GGUFs se realizo mediante cuantizacion estandar de `llama.cpp` sin matriz de importancia (no-imatrix), preservando la funcionalidad MTP/NextN del modelo base.

## Capacidades

- Razonamiento defensivo en ciberseguridad: analisis de vulnerabilidades, revision de codigo seguro, planificacion de deteccion, contencion, remediacion y validacion.
- Razonamiento red-team controlado: pensamiento adversarial en entornos autorizados, locales, sandboxed o educativos.
- Codificacion e ingenieria de software: generacion, revision y depuracion de codigo en multiples lenguajes.
- Tool calling / function calling: soporte para invocacion estructurada de herramientas.
- Razonamiento tecnico y resolucion de problemas multi-paso.
- Capacidades agenticas: el modelo base ya soporta flujos de agente con multiples pasos; el SFT busca conservar esa habilidad.
- Multilingue limitado: principalmente ingles, sin garantias para otros idiomas.
- Vision: no se afirma ninguna mejora; los componentes visuales estan congelados y el modelo debe tratarse como texto-especializado.

## Casos de uso

- Analisis de vulnerabilidades en codigo propietario: el modelo puede revisar fragmentos de codigo y senalar posibles fallos de seguridad (inyeccion SQL, desbordamiento de buffer, etc.) con sugerencias de remediacion, gracias a su entrenamiento en secure-code review.
- Revision de seguridad en pipelines CI/CD: integrable como paso de analisis estatico asistido, aprovechando su capacidad de tool-calling y razonamiento multi-paso.
- Planificacion de respuesta a incidentes: genera planes de deteccion, contencion, erradicacion y recuperacion basados en evidencias, util para equipos de SOC.
- Formacion y educacion en ciberseguridad: permite crear ejercicios de analisis de codigo inseguro y red-team controlado en laboratorios locales sin acceso a sistemas de terceros.
- Desarrollo de agentes con tool calling: al conservar las capacidades del base, puede integrarse en arquitecturas de agente para automatizar tareas de administracion de sistemas o auditoria.
- Generacion de codigo tecnico general: fuera del ambito cyber, sirve como asistente de programacion en entornos locales con privacidad de datos.
- Investigacion academica en seguridad: util para experimentos de generacion de exploits controlados y analisis de superficies de ataque en entornos aislados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni similares, y no hay datos comparativos con otros modelos. Se recomienda evaluar el modelo en los casos de uso concretos antes de adoptarlo en produccion.

## Requisitos de hardware

- Tamanos de archivo orientativos (estimados a partir del source BF16 de ~54,66 GB y proporciones tipicas de cuantizacion GGUF):
  - Q2_K: ~11 GB
  - Q3_K_M: ~14 GB
  - Q4_K_M: ~16,5 GB
  - Q5_K_M: ~19 GB
  - Q6_K: ~22 GB
  - Q8_0: ~28 GB
- VRAM estimada para inferencia: con Q4_K_M, el modelo cabe en una GPU de 24 GB (p. ej. RTX 4090, RTX 3090) con offload parcial de capas a RAM si es necesario. Con Q6_K o Q8_0 se recomienda una GPU de 32 GB o mas (A100, H100, RTX 6000 Ada).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para cuantizaciones 4-bit y 5-bit; A100 40/80 GB o H100 80 GB para cuantizaciones altas y contextos largos.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. Para servidores de produccion, vLLM y TGI soportan GGUF en versiones recientes, aunque la integracion puede requerir conversion.
- Latencia y throughput: no disponibles en la informacion publicada. Dependera del hardware, la cuantizacion y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Qwenseek-3.8-27B-CyberLite | ~27,3B | 32K validado | Apache-2.0 | GGUF | Ciberseguridad + codigo |
| Qwen3.8-27B (base) | ~27,8B | 256K | Apache-2.0 | Safetensors, GGUF | Generalista multimodal |
| Qwen2.5-32B | 32,8B | 128K | Apache-2.0 | Safetensors, GGUF | Generalista |
| Llama 3.1 8B | 8B | 128K | Llama 3.1 | Safetensors, GGUF | Generalista |

La comparativa se basa en caracteristicas publicas; no hay datos de rendimiento relativo. CyberLite se distingue por su especializacion en seguridad, pero hereda la arquitectura y limitaciones del base Qwen3.8-27B. Frente a modelos generalistas de tamano similar, su ventaja es el ajuste al dominio cyber, mientras que su desventaja es la reduccion del contexto validado y el enfoque casi exclusivo en ingles.

## Limitaciones y advertencias

- El modelo fue entrenado principalmente con datos en ingles; su rendimiento en otros idiomas puede ser deficiente.
- La vision esta congelada: no se debe esperar ninguna mejora en tareas multimodales; el modelo debe tratarse como texto-especializado.
- El contexto validado en SFT es de 32.768 tokens, inferior a los 256K del base. Usar contextos mayores puede degradar la coherencia.
- No se han publicado benchmarks; el rendimiento real en tareas de ciberseguridad o codigo no esta cuantificado.
- Riesgo de alucinacion en recomendaciones de seguridad: las sugerencias tecnicas deben verificarse siempre antes de aplicarse en entornos reales.
- El razonamiento red-team solo debe utilizarse en entornos autorizados, locales o educativos; el autor no otorga permiso para probar sistemas de terceros.
- La cuantizacion sin imatrix puede reducir la calidad en formatos de baja precision (Q2_K, IQ3). Se recomienda Q4_K_M como punto de equilibrio.
- Al no incluirse formatos IQ2 e IQ3_XXS, las opciones de maxima compresion son limitadas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B, tambien Apache-2.0, sin restricciones adicionales conocidas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/trjxter/Qwenseek-3.8-27B-CyberLite-GGUF
- Repositorio BF16 canonico: https://huggingface.co/trjxter/Qwenseek-3.8-27B-CyberLite-BF16
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.8-27B
- Modelo base oficial (Qwen): https://huggingface.co/Qwen/Qwen3.8-27B
- Guia de ejecucion local de Qwen3.8-27B: https://locallyuncensored.com/blog/how-to-run-qwen-3-8-27b-locally.html
- Guia de descarga oficial: https://www.orcarouter.ai/blog/qwen-3-8-27b-huggingface
