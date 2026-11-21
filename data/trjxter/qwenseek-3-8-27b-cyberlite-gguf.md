# trjxter/Qwenseek-3.8-27B-CyberLite-GGUF

## Resumen

Qwenseek-3.8-27B-CyberLite es un ajuste fino supervisado (SFT) con orientación a ciberseguridad sobre el modelo base `unsloth/Qwen3.8-27B`, publicado por el usuario trjxter. El repositorio aquí documentado contiene la familia de cuantizaciones GGUF derivada de la versión canónica fusionada en BF16 (`trjxter/Qwenseek-3.8-27B-CyberLite-BF16`), pensada para inferencia local con `llama.cpp`. El modelo pertenece a la familia arquitectónica Qwen3.8 (etiqueta `qwen3_5`) y cuenta con 27.320.697.856 parámetros totales.

El objetivo declarado del autor es reforzar el razonamiento en ciberseguridad defensiva, conservar una capacidad útil de razonamiento controlado de red team y mantener las fortalezas del modelo base en código, razonamiento técnico y uso estructurado de herramientas. Para ello, el corpus de SFT mezcla datos de seguridad con ejemplos de ingeniería de software, comportamiento agéntico, tool calling y razonamiento general, en lugar de entrenar exclusivamente con prompts de ciberseguridad.

Es relevante ahora porque ofrece una alternativa de 27B con licencia Apache-2.0, contexto de SFT validado de 32.768 tokens, soporte de tool calling y 18 variantes de cuantización publicadas, lo que permite desplegarlo desde estaciones de trabajo con GPU de consumo hasta servidores con H100. El autor advierte explícitamente de que CyberLite es una primera etapa y no el modelo final de la línea de especialización en ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 / `qwen3_5` (transformer, con capa de predicción NextN/MTP) |
| Parametros totales | 27.320.697.856 (~27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto de SFT validado); longitud máxima de inferencia no disponible |
| Tipos de cuantizacion | Q2_K; IQ3_S, IQ3_M; Q3_K_S, Q3_K_M, Q3_K_L; IQ4_NL, IQ4_XS; Q4_0, Q4_1, Q4_K_S, Q4_K_M; Q5_0, Q5_1, Q5_K_S, Q5_K_M; Q6_K; Q8_0 |
| Idiomas soportados | inglés principalmente (`en`) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (origen BF16, ~54,66 GB); repo de 303,4 GB con 18 variantes |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.8, que incluye componentes multimodales en el modelo original, aunque en este ajuste los parámetros de visión permanecieron congelados y el entrenamiento fue exclusivamente de texto. La arquitectura conserva la capa de predicción NextN/MTP (multi-token prediction), preservada también en la conversión a GGUF: la auditoría estructural reporta 866 tensores de texto/MTP, 65 bloques totales y una capa de predicción NextN. El token EOS es `<|im_end|>` y la plantilla de chat coincide con la release BF16.

El entrenamiento consistió en un SFT mediante QLoRA de 4 bits, con rango LoRA 64 y alpha 128, ejecutado en una única NVIDIA H100 de 80 GB en precisión BF16. Los datasets declarados son `trjxter/DeepSeek-V4-Flash-0731-Teacher-Distillation-40513x` y `trjxter/DeepSeek-V4-Pro-Reasoning-8000x`, lo que indica destilación de profesor y datos de razonamiento. No se especifica el número total de tokens de entrenamiento ni la composición porcentual del corpus. La cuantización se realizó con la ruta estándar de `llama.cpp` sin importance matrix, partiendo del GGUF BF16 canónico.

## Capacidades

- Generación de texto y razonamiento técnico en dominios de ingeniería y seguridad.
- Análisis defensivo de vulnerabilidades y razonamiento basado en evidencias.
- Revisión de código seguro y planificación de remediación.
- Planificación de detección, contención, remediación y validación en entornos defensivos.
- Razonamiento adversario controlado, en entornos autorizados, locales, en sandbox o con fines educativos y de validación defensiva.
- Programación y tareas de ingeniería de software.
- Tool calling / function calling estructurado.
- Comportamiento agéntico y resolución de problemas técnicos con razonamiento multi-paso.
- Capacidades multimodales del modelo base presentes en la arquitectura, pero no mejoradas por este ajuste; los GGUF de texto no incluyen proyector de visión.
- Idiomas: principalmente inglés.

## Casos de uso

- Revisión de código seguro en CI/CD: el modelo puede analizar diffs y parches en busca de patrones de vulnerabilidad y proponer remediaciones, aprovechando su entrenamiento en secure-code review y su contexto de 32.768 tokens para abarcar módulos completos.
- Triaje de hallazgos de vulnerabilidades: dado un informe de escáner o un CVE, el modelo estructura el razonamiento basado en evidencias para priorizar impacto, explotabilidad y plan de mitigación.
- Asistente de respuesta a incidentes: genera planes de detección, contención, erradicación y validación, con pasos verificables, adecuado por su orientación a Cyber Blue y su soporte de razonamiento multi-paso.
- Automatización de tareas de ingeniería de software: generación y refactorización de código con tool calling para invocar linters, tests o APIs internas dentro de pipelines agénticos.
- Laboratorios de formación en seguridad ofensiva autorizada: ejercicios en sandbox local donde el modelo razona sobre técnicas de ataque y su detección, con la restricción explícita de uso autorizado y local.
- Despliegue local en estaciones de trabajo: las variantes Q4_K_M o Q6_K permiten ejecutar un modelo de 27B en hardware de consumo mediante `llama.cpp`, útil para equipos que no pueden enviar código o datos de seguridad a servicios en la nube.
- Evaluación de configuraciones y hardening: el modelo puede revisar ficheros de configuración, políticas y despliegues para señalar desviaciones respecto a buenas prácticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la auditoría de tensores de 2026-09-24 fue estructural y que no se ejecutó inferencia ni se realizó una comparación completa de los valores de pesos cuantizados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la información proporcionada. Como referencia de orden de magnitud, el GGUF de origen BF16 ocupa ~54,66 GB; las variantes Q8_0, Q6_K y Q4_K_M se sitúan por debajo de esa cifra, pero el repositorio no publica tamaños por variante en el texto disponible.
- GPU recomendadas: el entrenamiento se realizó en 1× NVIDIA H100 80 GB. Para inferencia, una GPU con 80 GB permite las variantes de mayor fidelidad; no se especifican requisitos oficiales por cuantización.
- GPU de consumo: no se confirma oficialmente qué variantes caben en GPU de consumo; el autor posiciona Q2_K, Q3_K_M/IQ3_M, IQ4_XS/Q4_K_S y Q4_K_M como opciones de uso local compacto, lo que sugiere viabilidad en tarjetas de 24 GB o menos para las cuantizaciones bajas, sin dato verificado.
- Opciones de despliegue: `llama.cpp` (formato nativo GGUF); el tag `endpoints_compatible` figura en los metadatos de Hugging Face. No se documentan recetas para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwenseek-3.8-27B-CyberLite (este) | ~27,8B | 32.768 (SFT validado) | Apache-2.0 | GGUF (18 variantes) | SFT QLoRA con foco en ciberseguridad y código |
| unsloth/Qwen3.8-27B (base) | ~27,8B | no disponible en la informacion | no disponible en la informacion | no disponible | Modelo base sin especialización; referencia de capacidades generales |
| Qwenseek-3.8-27B-CyberLite-BF16 (canónico) | ~27,8B | 32.768 (SFT validado) | Apache-2.0 | BF16 (safetensors/GGUF fuente) | Misma especialización, mayor fidelidad y mayor requisito de memoria |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es una primera etapa: el autor indica que una fase posterior añadirá RL para ejecución agéntica de largo horizonte y comportamiento Cyber Blue/Red controlado; no debe tratarse como el modelo final de la línea.
- Idioma: soporte principalmente en inglés; el rendimiento en castellano u otros idiomas no está validado.
- Visión: los parámetros multimodales se congelaron y los GGUF de texto no incluyen proyector de visión; no hay mejora de capacidades visuales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación.
- Sesgos: no se documentan análisis de sesgo en la información disponible.
- Uso de seguridad ofensiva: cualquier uso de razonamiento adversario debe ser autorizado, local, en sandbox y con fines educativos o de validación defensiva; la model card no implica autorización para probar sistemas de terceros.
- Licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene verificar las condiciones del modelo upstream `unsloth/Qwen3.8-27B`.
- Cuantización sin importance matrix: las variantes pueden presentar mayor degradación en bits bajos (Q2_K, IQ3) que una cuantización con imatrix; no se han publicado evaluaciones de calidad por cuantización.
- Auditoría estructural, no funcional: la verificación de tensores no incluye pruebas de inferencia ni comparación de pesos.
- Contexto: 32.768 tokens es el contexto de SFT validado; no se especifica la ventana máxima soportada en inferencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/trjxter/Qwenseek-3.8-27B-CyberLite-GGUF
- Release canónica BF16: https://huggingface.co/trjxter/Qwenseek-3.8-27B-CyberLite-BF16
- Modelo base upstream: https://huggingface.co/unsloth/Qwen3.8-27B
- Dataset de destilación (Flash): https://huggingface.co/datasets/trjxter/DeepSeek-V4-Flash-0731-Teacher-Distillation-40513x
- Dataset de razonamiento (Pro): https://huggingface.co/datasets/trjxter/DeepSeek-V4-Pro-Reasoning-8000x
- Auditoría GGUF: validation/gguf-audit-2026-09-24.json (referenciada en la model card del repositorio)
