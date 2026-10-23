# Tea420/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M

## Resumen

`Tea420/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M` es una distribución cuantizada en formato Apple MLX del modelo base `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, un merge de pesos de la familia Qwen 3.8 con 27.781 millones de parámetros. El paquete lo publica la cuenta Tea420 empaquetando el trabajo de Solstice-AI (cuantización oQ4e, escalado YaRN a 1M de contexto y runtime Anvil) sobre el merge original de DavidAU. El objetivo declarado es servir un modelo de razonamiento de 27B en MacBooks de 16 GB y 24 GB de memoria unificada, comprimiendo los pesos a 17,02 GB.

La arquitectura es un transformer híbrido de atención lineal: el 75 % de las capas usan bloques Gated Delta Recurrent Network (GDN) con complejidad de memoria O(1) y el 25 % restante emplea Grouped-Query Attention global. Incorpora una cabeza de Multi-Token Prediction (MTP) para decodificación especulativa de dos tokens por pasada y un escalado YaRN con factor 4,0 que extiende la ventana de 262.144 a 1.048.576 tokens.

Su relevancia depende de dos afirmaciones del autor que no están verificadas de forma independiente: un supuesto barrido de 9 de 9 benchmarks frente a Claude Opus 4.6 Max y una puntuación ARC-C de 735 (8 bits) / 719 (4 bits). Además, el modelo ha sido sometido a una "abliteración" (Project Heretic) que elimina los vectores de rechazo, por lo que se distribuye sin salvaguardas de alineación. El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 75 % capas de atención lineal GDN (Gated Delta Recurrent Network) + 25 % GQA global; merge de pesos GAIN de DavidAU; cabeza MTP de decodificación especulativa |
| Parámetros totales | 27.781.427.952 (~27,78 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (1M) mediante YaRN factor 4,0 sobre `original_max_position_embeddings` = 262.144 |
| Tipos de cuantización | MLX oQ4e: 4 bits de precisión mixta calibrada con importance matrix (`oq_imatrix_report.json`) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`); repositorio de 17,0 GB |

## Arquitectura y entrenamiento

El modelo base es un merge de pesos, no un entrenamiento desde cero: DavidAU combina checkpoints de la familia Qwen 3.8 mediante su técnica GAIN (Guided Activation Interleaved Normalization), que interpola activaciones y normaliza por capas para fusionar pesos sin degradar el rendimiento de razonamiento. Sobre esa base, la arquitectura declarada combina atención lineal GDN en tres cuartas partes de las capas —lo que reduce el coste de memoria del KV cache a O(1) en esos bloques— con atención GQA convencional en el cuarto restante, un patrón híbrido habitual para abaratar contextos muy largos. Se añade una cabeza MTP que genera dos tokens por pasada adelantada, con una aceleración declarada de 1,72x a 2,20x en Apple Silicon.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. El componente diferencial de esta publicación es el post-procesado: cuantización no uniforme de 4 bits guiada por importance matrix, preservando a mayor profundidad de bits las cabezas de atención y proyecciones de router críticas, y escalado YaRN a 1M de tokens. Sobre el checkpoint se aplicó Project Heretic, una técnica de abliteración que elimina las direcciones de activación asociadas al rechazo de peticiones. No hay información sobre el proceso de calibración del imatrix ni sobre la metodología exacta de ablación.

## Capacidades

- Generación de texto y razonamiento encadenado (chain-of-thought) en inglés y chino.
- Codificación y resolución de problemas de ingeniería de software: el autor reporta evaluación en SWE-bench Pro, LiveCodeBench v6 y QwenSWEBench.
- Razonamiento matemático y científico abstracto (ARC-C, ARC-E según el autor).
- Seguimiento de restricciones complejas (IFBench) y flujos multi-fichero de largo horizonte (CoWorkBench).
- Control de sistemas operativos y automatización de escritorio y móvil (OSWorld-Verified, AndroidWorld, según el autor).
- Capacidad de agente multi-paso y operación sobre repositorios completos, según los benchmarks declarados.
- Contexto largo nativo de 1M de tokens vía YaRN, orientado a análisis de repositorios y documentos extensos.
- Decodificación especulativa integrada (MTP) con dos tokens por pasada.
- Sin salvaguardas de rechazo tras la abliteración: responde a peticiones que un modelo alineado rechazaría.
- Nota: la pipeline declarada en HuggingFace es `image-text-to-text`, pero la model card no documenta torre de visión ni capacidades multimodales; la discrepancia no está resuelta en la información disponible.

## Casos de uso

- **Migración y refactorización de repositorios completos**: con 1M de tokens de contexto se puede cargar un árbol de código extenso y pedir cambios coordinados entre ficheros, apoyándose en la ventana extendida para no perder referencias cruzadas entre módulos.
- **Agente de CI/CD sobre errores de compilación**: integrar el modelo vía MLX-LM en un runner macOS para leer logs de build, localizar el fichero culpable y proponer un parche, usando la cabeza MTP para reducir latencia en bucles de muchas iteraciones cortas.
- **Automatización de tareas de escritorio (RPA)**: los resultados declarados en OSWorld y AndroidWorld lo sitúan como candidato para pilotar interfaces gráficas mediante tool calling, útil en pruebas end-to-end de aplicaciones.
- **Asistente de análisis de documentación técnica larga**: ingestión de manuales, normativas o contratos de cientos de miles de tokens y consultas con trazabilidad a fragmentos concretos, aprovechando el contexto de 1M.
- **Desarrollo de herramientas ofensivas y auditoría de seguridad**: el modelo, sin vectores de rechazo, es adecuado para análisis de exploits, reversing y pruebas de penetración autorizadas, donde un modelo alineado bloquea la petición.
- **Inferencia local en portátil Apple Silicon**: despliegue en un MacBook de 24 GB con memoria unificada para tareas de razonamiento sin conexión, sin coste de API ni envío de datos a terceros.
- **Generación de código en pipelines de producción**: soporte de tool calling y razonamiento multi-paso para tareas de completado, revisión de PRs y generación de tests en inglés o chino.

## Benchmarks y rendimiento

Todos los datos de la siguiente tabla proceden de la model card del autor (arnés oficial de Claude Code, temperature=1,0, top_p=0,95, evaluado en límites de contexto de 256k y 1M). No se han verificado de forma independiente y no se han publicado curvas de degradación por longitud de contexto.

| Suite de evaluación | Capacidad | Modelo (según autor) | Claude Opus 4.6 Max (según autor) | Margen declarado |
|---|---|---|---|---|
| SWE-bench Pro | Ingeniería de software agéntica | 61,7 % | 53,4 % | +8,3 |
| LiveCodeBench v6 | Resolución de problemas en tiempo real | 90,3 % | 88,8 % | +1,5 |
| QwenSWEBench | Depuración de repositorio completo | 79,0 % | 63,8 % | +15,2 |
| OSWorld-Verified | Control de ordenador | 84,3 % | 72,7 % | +11,6 |
| AndroidWorld | Autonomía en SO móvil | 81,9 % | 62,0 % | +19,9 |
| IFBench | Seguimiento de restricciones complejas | 79,5 % | 62,5 % | +17,0 |
| CoWorkBench | Flujos multi-fichero de largo horizonte | 70,7 % | 68,2 % | +2,5 |
| ARC-C (Challenge) | Abstracción científica | 735 (8 bits) / 719 (4 bits) | ~710–720 | No comparable (escalas distintas) |
| ARC-E (Easy) | Sentido común elemental | 882 | ~870 | No comparable (escalas distintas) |

Advertencia metodológica: las filas ARC-C y ARC-E comparan recuentos absolutos de aciertos con rangos estimados ("~710–720", "~870"), no porcentajes sobre el mismo conjunto de evaluación; la comparación no es homogénea. El resto de cifras proceden exclusivamente del autor.

## Requisitos de hardware

- **Memoria**: 17,02 GB de pesos en oQ4e. Con overhead de runtime y KV cache, un Mac de 24 GB de memoria unificada es el objetivo realista; el autor afirma funcionamiento en 16 GB, pero los pesos por sí solos superan esa cifra, por lo que requeriría swap o compresión adicional del sistema.
- **Plataforma**: exclusivamente Apple Silicon (M1/M2/M3/M4) con Metal. El formato MLX no es compatible con CUDA.
- **GPU recomendadas**: cualquier chip de la serie M con 24 GB o más de memoria unificada (M2 Pro/Max, M3 Pro/Max, M4 Pro/Max). En GPUs NVIDIA no hay soporte sin reconvertir los pesos.
- **Consumer GPU**: no aplica en el sentido habitual (RTX 4090, etc.) al ser un checkpoint MLX; en Mac, sí cabe en configuraciones de 24 GB o superiores.
- **Despliegue**: runtime Anvil (github.com/Solstice-Labs/anvil) como opción recomendada por el autor y MLX-LM como alternativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este checkpoint concreto.
- **Latencia y throughput**: el autor declara una aceleración de 1,72x a 2,20x gracias a la cabeza MTP en Apple Silicon, sin cifras absolutas de tokens por segundo. El KV cache a 1M de tokens no está cuantificado en la información disponible; en las capas GQA (25 %) crece linealmente con la longitud, mientras que las capas GDN lo mantienen constante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Tea420, MLX oQ4e) | 27,78 B | 1.048.576 | MLX safetensors, 4 bits mixtos, 17,0 GB | Apache 2.0 | HuggingFace, 0 descargas |
| `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU` (base) | 27,78 B | 262.144 nativo (extensible) | Pesos originales (no especificado en la información disponible) | Apache 2.0 | HuggingFace |
| Alternativas de la misma categoría con datos publicados | No disponible | No disponible | No disponible | No disponible | No disponible |

El checkpoint base comparte pesos con esta versión, pero no incluye el escalado YaRN a 1M ni la cuantización oQ4e, por lo que su huella en memoria será mayor (los 27,78 B parámetros en bf16 equivalen a unos 55,6 GB calculados a partir del recuento). No se dispone en la información proporcionada de datos verificables de otros modelos de 27B–32B con los que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- **Benchmarks sin verificación independiente**: todas las cifras provienen de la model card del autor. La etiqueta `beats-claude-opus-4.6` es una afirmación promocional, no un resultado auditado.
- **Comparaciones no homogéneas**: ARC-C y ARC-E se presentan como recuentos frente a rangos estimados del competidor, lo que impide una comparación válida.
- **Sin salvaguardas de alineación**: la abliteración de Project Heretic elimina los rechazos del modelo. Puede producir contenido dañino, instrucciones peligrosas o código ofensivo sin filtro; requiere moderación externa en cualquier despliegue público.
- **Idiomas limitados**: solo inglés y chino declarados. El castellano no está soportado oficialmente y su rendimiento será degradado.
- **Riesgo de alucinación**: inherente a los modelos de 27B, agravado en contextos de 1M de tokens, donde la recuperación precisa de información distante no está garantizada. No hay datos publicados de evaluación tipo RULER o Needle-in-a-Haystack.
- **Contexto extendido por YaRN**: el factor 4,0 se aplica en inferencia sobre un modelo entrenado con 262.144 tokens; la calidad más allá de esa longitud puede degradarse de forma no documentada.
- **Ajuste de memoria dudoso**: los 17,02 GB de pesos no caben holgadamente en un Mac de 16 GB; la afirmación de funcionamiento en 16 GB debe validarse empíricamente.
- **Discrepancia de pipeline**: declarado `image-text-to-text` sin documentación de capacidades de visión en la model card.
- **Madurez**: repositorio creado el 23 de octubre de 2026, con 0 descargas y 0 likes. Sin validación de la comunidad, sin informes de errores ni resultados reproducidos.
- **Licencia**: Apache 2.0 permite uso comercial, pero la cadena de licencias del modelo base Qwen 3.8 no se detalla en la información disponible; conviene verificar los términos del checkpoint original antes de un despliegue comercial.
- **Sesgos**: no se documenta ninguna evaluación de sesgo; el modelo hereda los del corpus de entrenamiento original, no especificado.

## Enlaces

- HuggingFace (este checkpoint): https://huggingface.co/Tea420/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-mlx-oQ4e-1M
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Perfil del autor del merge: https://huggingface.co/DavidAU
- Runtime Anvil: https://github.com/Solstice-Labs/anvil
- Repositorio de Project Heretic: no disponible
- Paper o informe técnico: no disponible
- Demo o espacio de inferencia: no disponible
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces anteriores proceden de la información de HuggingFace y de la model card.
