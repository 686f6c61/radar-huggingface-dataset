# tpnlabs/granite-4.2-3b-TPN-GGUF

## Resumen

`tpnlabs/granite-4.2-3b-TPN-GGUF` es una cuantización en formato GGUF del modelo denso `ibm-granite/granite-4.2-3b`, publicada por tpnlabs a través de su herramienta TPN Workbench. No se trata de un modelo nuevo: es una redistribución optimizada para `llama.cpp` del modelo base de IBM, con 3.659.737.600 parámetros (3,66 mil millones) y licencia Apache 2.0 heredada. Cada formato publicado va acompañado de métricas de fidelidad frente a la referencia BF16 (divergencia KL por token, perplejidad y acuerdo top-1), lo que permite elegir el equilibrio entre tamaño y degradación con datos medidos en lugar de estimaciones.

El modelo base pertenece a la familia Granite 4.2 de IBM, una generación de modelos densos decoder-only disponibles en 3B, 8B y 30B, construida sobre los modelos base Granite 4.1 y orientada explícitamente al razonamiento: emiten cadena de pensamiento antes de responder, incorporan un interruptor thinking/no-thinking y modos de bajo esfuerzo, y están entrenados para tool calling aumentado con razonamiento. La relevancia de esta ficha concreta es práctica: permite ejecutar un modelo de razonamiento de 3B en local, en el navegador o en el móvil, con pesos de 2,24 GB en Q4_K_M, y con una tabla de compromiso tamaño/fidelidad verificable.

TPN Workbench recomienda Q4_K_M como el formato de mayor fidelidad que cabe en 2,5 GB (2,24 GB, KLD media 0,0551, acuerdo top-1 del 90,4 %). Para usos donde la fidelidad al BF16 sea crítica, Q6_K (3,01 GB) sube el top-1 al 95,0 % y Q8_0 (3,89 GB) al 97,8 %. El repositorio tiene 7,9 GB en total y, en el momento de la consulta, cero descargas y cero likes, por lo que no existe validación comunitaria todavía.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (modelo base Granite 4.2 de IBM) |
| Parámetros totales | 3.659.737.600 (3,66B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la información proporcionada |
| Tipos de cuantización | Q8_0, Q6_K, Q5_K_M, Q5_0, Q5_0+, Q4_K_M, Q4_0M+, Q4_0, Q4_0+, IQ4_XS, Q3_K_M, Q2_K, IQ2_M, IQ2_S, IQ2_XS, IQ2_XXS |
| Idiomas soportados | no disponible (la evaluación interna incluye pruebas en de/es/fr, sin listado oficial) |
| Licencia | Apache 2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (librería `gguf`, compatible con `llama.cpp`) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso decoder-only de la familia Granite 4.2 de IBM, en su variante de 3B. Según la documentación de IBM, los modelos Granite 4.2 se post-entrenan sobre los modelos base Granite 4.1, de modo que la fase de pre-entrenamiento (número de tokens y composición del dataset) corresponde a Granite 4.1 y no se detalla en la información disponible para esta ficha. La familia incorpora razonamiento nativo: cada modelo puede emitir una cadena de pensamiento antes de la respuesta final, expone un conmutador thinking/no-thinking y un modo de bajo esfuerzo que limita el presupuesto de razonamiento. El post-entrenamiento incluye RL orientado a razonamiento y a tareas agénticas, e incluye tool calling aumentado con razonamiento.

Esta publicación concreta no reentrena ni modifica la arquitectura: aplica cuantización con imatrix sobre el checkpoint `4e9c275` del modelo base y mide la desviación respecto a BF16. Las métricas reportadas son KLD media por token, variación de perplejidad y acuerdo top-1, más una evaluación de tareas (`ifeval`) y una evaluación conversacional de 32 prompts en seis categorías (creativa, instrucciones, razonamiento, conocimiento, tareas, honestidad y chat) con prompts en de/es/fr, tres muestras por prompt, thinking desactivado, puntuadas de 1 a 10 por Claude Sonnet con un ruido entre ejecuciones de aproximadamente ±4.

## Capacidades

- Generación de texto conversacional y de instrucciones, con pipeline declarado `text-generation`.
- Razonamiento explícito mediante cadena de pensamiento antes de la respuesta final.
- Conmutador thinking/no-thinking y modo de bajo esfuerzo para reducir el coste de razonamiento.
- Tool calling aumentado con razonamiento: el modelo puede razonar antes de invocar funciones.
- Flujos agénticos y razonamiento multi-paso, según la documentación de IBM para la familia Granite 4.2.
- Razonamiento matemático y de código, según la descripción de IBM para la familia.
- Capacidad multilingüe parcial evidenciada en la evaluación interna (prompts en alemán, español y francés); no hay listado oficial de idiomas.
- Ejecución completamente local: en navegador o aplicación de escritorio mediante Gratis, y en servidor con `llama.cpp`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repositorio).

## Casos de uso

- Asistente local en navegador o escritorio: con Q4_K_M (2,24 GB) el modelo cabe en memoria de un equipo de consumo y puede ejecutarse sin conexión mediante Gratis o `llama-server`, lo que lo hace adecuado para entornos con requisitos de privacidad o sin conectividad.
- Automatización de atención al cliente multi-turno: el modo no-thinking reduce latencia en respuestas directas, mientras que el modo thinking se reserva para consultas que requieren razonamiento; la licencia Apache 2.0 permite integrarlo en producto comercial sin royalties.
- Agentes con tool calling en pipelines internos: el modelo base está entrenado para razonamiento aumentado con herramientas, por lo que puede encadenar consultas a APIs y decidir la siguiente acción en flujos de automatización de back-office.
- Clasificación y extracción de información en varios idiomas: la evaluación interna cubre prompts en alemán, español y francés, lo que sirve como indicio para tareas de procesamiento documental en esos idiomas, siempre con validación propia.
- Prototipado rápido y evaluación de pipelines: al publicarse 16 variantes de cuantización con métricas de fidelidad, permite medir el impacto real de la compresión en la tarea objetivo antes de fijar un formato para producción.
- Despliegue en dispositivos móviles y ARM: la model card señala que los K-quants tienen kernels SIMD en el WebAssembly de `llama.cpp` y kernels ARM repackados en teléfonos, por lo que Q4_K_M y Q5_K_M son la elección rápida en esos entornos.
- Generación de código asistida en local: el modelo base se describe como competente en código y matemáticas dentro de la familia Granite 4.2; útil para autocompletado o revisión en IDE sin enviar código a un servicio externo.
- Filtrado y moderación con modo de bajo esfuerzo: para tareas de clasificación simples, el modo de bajo esfuerzo limita el gasto de tokens de razonamiento y reduce coste por petición.

## Benchmarks y rendimiento

Fidelidad frente a BF16 medida por TPN Workbench (menor KLD = más cercano al original):

| Formato | Tamaño | bpw | KLD media | Δ perplejidad | Top-1 |
|---|---|---|---|---|---|
| Q8_0 | 3,89 GB | 8,5 | 0,0030 | +1,45 % | 97,8 % |
| Q6_K | 3,01 GB | 6,56 | 0,0155 | +3,22 % | 95,0 % |
| Q5_K_M | 2,61 GB | 5,65 | 0,0243 | +4,77 % | 93,5 % |
| Q5_0+ | 2,55 GB | 5,5 | 0,0259 | +1,68 % | 93,5 % |
| Q5_0 | 2,71 GB | 5,5 | 0,0381 | +2,33 % | 92,0 % |
| Q4_K_M | 2,24 GB | 4,79 | 0,0551 | +0,87 % | 90,4 % |
| IQ4_XS | 2,03 GB | 4,27 | 0,0629 | +0,33 % | 89,3 % |
| Q4_0M+ | 2,45 GB | 4,83 | 0,0723 | +1,75 % | 89,1 % |
| Q4_0+ | 2,13 GB | 4,5 | 0,0761 | +3,46 % | 89,1 % |
| Q4_0 | 2,32 GB | 4,5 | 0,1261 | −5,12 % | 85,4 % |
| Q3_K_M | 1,84 GB | 3,84 | 0,1767 | +0,10 % | 82,6 % |
| Q2_K | 1,46 GB | 2,94 | 0,4338 | +4,89 % | 73,0 % |
| IQ2_M | 1,35 GB | 2,7 | 0,5354 | +13,20 % | 70,2 % |
| IQ2_S | 1,27 GB | 2,48 | 0,7076 | +20,09 % | 65,7 % |
| IQ2_XS | 1,19 GB | 2,36 | 0,7814 | +23,12 % | 63,7 % |
| IQ2_XXS | 1,10 GB | 2,12 | 1,0639 | +56,96 % | 56,3 % |

Evaluación de tareas (`ifeval`):

| Formato | ifeval |
|---|---|
| BF16 | 34,1 |
| Q4_K_M | 34,4 |
| IQ4_XS | 34,6 |
| Q3_K_M | 33,2 |

Evaluación conversacional Gratis (32 prompts, 3 muestras, thinking off, escala derivada de 1-10, ruido ±4):

| Formato | Overall |
|---|---|
| Q4_K_M | 72,7 |
| Q5_K_M | 74,5 |
| Q6_K | 74,9 |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni GSM8K para esta cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q4_K_M ≈ 2,24 GB; IQ4_XS ≈ 2,03 GB; Q5_K_M ≈ 2,61 GB; Q6_K ≈ 3,01 GB; Q8_0 ≈ 3,89 GB; BF16 del modelo base ≈ 7,3 GB. La caché KV depende de la longitud de contexto, que no está disponible en la información proporcionada.
- En la práctica, reservar entre 0,5 y 1 GB adicionales sobre el tamaño de los pesos para contexto, buffers de cómputo y overhead del runtime.
- GPU consumer: Q4_K_M e IQ4_XS caben con holgura en tarjetas de 4 GB o más (GTX 1650 4 GB, RTX 3050 6/8 GB, RTX 4060 8 GB, RTX 3060 12 GB). Q6_K y Q8_0 requieren 6-8 GB y encajan en RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090.
- GPU de centro de datos: A100, H100 o L40S no son necesarias para este tamaño; el modelo está pensado para ejecución local. En esas GPU se puede servir un número elevado de instancias concurrentes en Q8_0.
- Despliegue: `llama.cpp` / `llama-server` (comando indicado en la model card), Ollama y LM Studio por compatibilidad GGUF. vLLM y TGI no consumen GGUF de forma nativa: para esos motores habría que usar el checkpoint safetensors del modelo base.
- Latencia y throughput: no disponibles. La model card solo señala que los K-quants son la opción más rápida en WebAssembly y en ARM por sus kernels SIMD y repack, sin cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| tpnlabs/granite-4.2-3b-TPN-GGUF (Q4_K_M) | 3,66B | no disponible | GGUF | Apache 2.0 | Cuantización con métricas de fidelidad; ifeval 34,4 en Q4_K_M |
| ibm-granite/granite-4.2-3b (BF16) | 3,66B | no disponible | safetensors | Apache 2.0 | Referencia original; ifeval 34,1; requiere ~7,3 GB en pesos |
| Granite 4.2 8B | 8B (aprox., según tamaños de familia) | no disponible | safetensors y variantes cuantizadas | Apache 2.0 | Misma familia, mayor capacidad y mayor coste de inferencia |
| Granite 4.2 30B | 30B (aprox., según tamaños de familia) | no disponible | safetensors y variantes cuantizadas | Apache 2.0 | Misma familia, orientado a servidor; no cabe en GPU consumer en BF16 |

No se dispone en la información proporcionada de datos de benchmarks ni de especificaciones verificadas de modelos de terceros comparables, por lo que la comparación se limita a la propia familia Granite 4.2.

## Limitaciones y advertencias

- Riesgo de alucinación inherente a un modelo de 3,66B parámetros; el tamaño reducido limita el conocimiento factual frente a modelos mayores de la misma familia.
- `ifeval` en torno a 34 puntos tanto en BF16 como en cuantizado: la adherencia estricta a instrucciones formativas es limitada y conviene validar con evaluaciones propias antes de usarlo en producción con requisitos de formato.
- Las cuantizaciones por debajo de 4 bits degradan notablemente la fidelidad: IQ2_XXS cae a 56,3 % de acuerdo top-1 y +56,96 % de perplejidad, y Q2_K a 73,0 %. No se recomiendan para tareas sensibles a la precisión.
- No hay listado oficial de idiomas soportados en la información disponible; el multilingüismo solo está evidenciado por los prompts de/es/fr de la evaluación interna, no por una evaluación sistemática.
- La longitud de contexto no está documentada en la información proporcionada, lo que impide dimensionar la caché KV y limita la planificación de cargas con documentos largos.
- El repositorio es una cuantización de terceros, no una publicación oficial de IBM: la responsabilidad de validación recae en quien la usa, y el repositorio presenta cero descargas y cero likes en el momento de la consulta.
- Los resultados de la evaluación conversacional tienen un ruido declarado de ±4 puntos sobre una escala derivada de 1 a 10, por lo que diferencias de 2-3 puntos (Q4_K_M 72,7 frente a Q6_K 74,9) no son concluyentes por sí solas.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige mantener los avisos de licencia y no implica garantía alguna por parte de IBM ni de tpnlabs.
- Al ser un modelo con cadena de pensamiento, el consumo de tokens de salida puede crecer de forma significativa si se deja el modo thinking activado; conviene usar el conmutador o el modo de bajo esfuerzo en cargas de alto volumen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tpnlabs/granite-4.2-3b-TPN-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Informe completo de TPN Workbench: https://bench.trueperformancenetwork.com/r/_xkA5jgS8wRQ523Epzbirg
- TPN Workbench: https://bench.trueperformancenetwork.com
- Gratis (ejecución local en navegador y escritorio): https://gratis.trueperformancenetwork.com/
- Documentación de IBM para Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Página de IBM Granite: https://www.ibm.com/granite
- Repositorio GitHub de los modelos Granite 4.2: https://github.com/ibm-granite/granite-4.2-language-models
- Blog de IBM Granite en Hugging Face sobre Granite 4.2: https://huggingface.co/blog/ibm-granite/granite-4-2
- Artículo de MarkTechPost sobre el lanzamiento de Granite 4.2: https://www.marktechpost.com/2026/08/25/ibm-releases-granite-4-2-bringing-native-reasoning-and-agentic-rl-to-open-enterprise-models/
