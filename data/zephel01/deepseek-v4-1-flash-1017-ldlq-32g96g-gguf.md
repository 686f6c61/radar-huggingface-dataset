# zephel01/DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF es una cuantización en formato GGUF del modelo DeepSeek-V4.1-Flash-1017 (MIT) de DeepSeek, publicada por el usuario zephel01 bajo el ecosistema de su motor de inferencia Abyss. El objetivo declarado es hacer viable un modelo de arquitectura MoE con 384 expertos enrutados por capa en un equipo de consumo compuesto por una única GPU de 32 GB y 96 GB de RAM, sin podar expertos. Para ello se re-cuantizan los pesos FP4 originales de los expertos con la técnica LDLQ (redondeo con realimentación de error usando las estadísticas de entrada de cada experto), en lugar del redondeo imatrix convencional.

Se distribuyen dos variantes completas de 6 shards: una de 132 GB de expertos (prioriza velocidad, mismos tipos que el UD-IQ1_M de unsloth pero con mejor redondeo) y otra de 139 GB (prioriza calidad, con las capas 35-39 un paso por encima, en IQ3_XXS). Todo lo que no son expertos enrutados (atención, expertos compartidos, routers, embeddings, salida, tokenizer) es byte-idéntico a la cuantización UD-IQ2_XXS de unsloth. La ficha está marcada como BETA por el propio autor: las cifras de rendimiento proceden de un único PC y no hay datos de benchmarks estándar publicados.

La relevancia actual reside en la técnica de cuantización: demuestra que el redondeo con realimentación de error (LDLQ) mejora la KL frente al redondeo imatrix a tipos idénticos, y que un MoE de gran tamaño puede servirse desde un solo equipo con GPU de 32 GB y RAM DDR5/LPDDR5X, con velocidades de decodificación de decenas de tokens por segundo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) transformer, 384 expertos enrutados por capa; modelo base DeepSeek-V4.1-Flash-1017 |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han validado prompts de 8K y 32K en las pruebas del autor) |
| Tipos de cuantizacion | GGUF: IQ1_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ3_XXS para expertos; Q8_0 para denso; Q5_K para tabla Engram |
| Idiomas soportados | no disponible (se han probado 3 prompts en japones con resultado correcto) |
| Licencia | MIT |
| Formato de pesos | GGUF (6 shards por variante) |

## Arquitectura y entrenamiento

El modelo base es DeepSeek-V4.1-Flash-1017, un transformer con arquitectura de mezcla de expertos (MoE) que mantiene 384 expertos enrutados en cada capa. Esta publicación no es un modelo entrenado, sino una cuantización: no aporta información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO. La model card del cuantizador no documenta esos datos, por lo que deben consultarse en la ficha del modelo base.

La innovación técnica de esta publicación es el método LDLQ aplicado a los expertos enrutados: se parte de los pesos FP4 originales y se re-cuantizan con redondeo de realimentación de error, usando las estadísticas de entrada propias de cada experto. Según el autor, el redondeo plano a los mismos tipos rompía el modelo (KL 0.85, por acumulación de errores en las cinco últimas capas), el redondeo de unsloth obtiene KL 0.198 y LDLQ baja a 0.194 en la variante 132G. La variante 139G sube las capas 35-39 a IQ3_XXS para reducir la acumulación de error, logrando KL 0.182. El shard 6 contiene la tabla Engram en Q5_K, byte-idéntica a la de unsloth, y se lee desde SSD por filas sin necesidad de caber en RAM.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base DeepSeek-V4.1-Flash-1017; la model card no las detalla.
- Codificación: validado con 10 tareas de código difíciles con tests ocultos, resueltas 10/10 en ambas variantes.
- Tool calling: validado en una sesión de 7 turnos con llamadas a herramientas y tests que pasan.
- Recuperación en contexto largo: prueba de "find the needle" superada con prompts de 8K y 32K.
- Multilingüe: prueba en japonés con 3 prompts sin mezcla de escrituras; el resto de idiomas no está documentado.
- Decodificación especulativa: compatible con el drafter DSpark de Lucebox (Q2K-Q4K) en el motor Abyss.
- Soporte de modo `--uncensor` en el motor Abyss según las pruebas del autor.
- Capacidades de visión, audio o thinking mode: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en local: el modelo resuelve tareas de programación con tests ocultos (10/10 en las pruebas del autor) y sostiene sesiones de tool calling de varios turnos, por lo que puede integrarse en un asistente de desarrollo que ejecute tests y corrija código en un equipo de sobremesa con GPU de 32 GB.
- Servicio de generación de texto autoalojado: con 43,4 tok/s de decodificación tras un prompt de 32K, es viable para APIs internas de resumen, redacción y extracción de información donde la privacidad de los datos impide usar servicios en la nube.
- Procesamiento de documentos largos: la ventana validada de 32K tokens permite analizar contratos, informes o expedientes completos en una sola pasada, con recuperación fiable de datos concretos dentro del texto.
- Agentes multi-paso con herramientas: la sesión de 7 turnos con tool calling que pasa tests demuestra su idoneidad para pipelines de agentes que consultan APIs, ejecutan comandos y verifican resultados de forma iterativa.
- Atención al cliente multilingüe: el comportamiento correcto en japonés sin mezcla de escrituras sugiere un uso viable en soporte en varios idiomas, aunque la cobertura idiomática no está documentada y debe validarse por idioma antes de producción.
- Laboratorio de cuantización e investigación: las dos variantes con KL medido (0.194 y 0.182) y los tipos por capa documentados sirven como referencia reproducible para estudiar el impacto del redondeo LDLQ frente a imatrix en modelos MoE de gran tamaño.
- Despliegue en estación de trabajo con un solo equipo: el diseño explícito para 32 GB de VRAM más 96 GB de RAM permite montar un nodo de inferencia sin clúster ni GPUs de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica métricas propias de calidad de cuantización y velocidad:

| Metrica | 132G | 139G | unsloth UD-IQ1_M | unsloth UD-IQ2_XXS |
|---|---|---|---|---|
| Bytes de expertos | 132,2 GB | 139,4 GB | 132,2 GB | 156,9 GB |
| KL medio (8 secuencias x 1.023 tokens) | 0,194 | 0,182 | 0,198 | 0,142 |
| Mismo token top-1 | 81,1 % | 81,6 % | 81,7 % | 83,7 % |
| NLL | 2,215 | 2,204 | 2,209 | 2,173 |
| 10 tareas de código difíciles resueltas | 10/10 | 10/10 | 10/10 | 10/10 |
| Puntuación de calidad (calificada) | 77,6 | 81,4 | 81,1 | 78,8 |
| Decodificación, 3 tareas de código (tok/s) | 67,5 | 57,9 | 71,8 | no disponible |
| Decodificación, 10 tareas difíciles, media (tok/s) | 58,0 | 47,8 | 52,5 | no disponible |
| Decodificación tras prompt de 32K (tok/s) | 43,4 | 43,4 | no disponible | no disponible |

Las cifras de velocidad se midieron en un único PC: RTX 5090 (32 GB) sobre OCuLink PCIe Gen4 x4, Ryzen AI Max+ 395 con LPDDR5X (su iGPU Radeon 8060S calcula parte de los expertos en RAM), límite de RAM de 60 GB y el resto leído desde NVMe, con drafter DSpark y los ajustes `STRATA_GLM_TAIL_SKIP=4`, `STRATA_GLM_TAIL_SKIP_DISK=1` y `STRATA_GLM_ROUTE_AFFINITY_RAM=0.08` en Abyss v1.3.9x. El autor advierte que un sobremesa con DDR5 de doble canal y sin iGPU será más lento.

## Requisitos de hardware

- VRAM: 32 GB de GPU como mínimo para el diseño previsto; el resto del modelo se reparte entre RAM y SSD.
- RAM: 96 GB recomendados; el autor limita la capa de RAM a 60 GB (`STRATA_GLM_RAM_GB=60`) y lee el resto desde NVMe. Con 64 GB de RAM la velocidad baja (30,5 tok/s frente a 40,6 en la referencia R9700).
- Almacenamiento: 275,8 GB para la variante 132G y 283,0 GB para la 139G (6 shards cada una); se recomienda SSD NVMe por la lectura de la tabla Engram y de los expertos no residentes.
- GPU medidas: RTX 5090 (32 GB) a 67,5 tok/s (132G) y 57,9 tok/s (139G).
- GPU estimadas: Radeon AI PRO R9700 (32 GB) a ~40 tok/s (132G) y ~33-35 tok/s (139G), extrapoladas de una medición de UD-IQ1_M a 40,6 tok/s en esa tarjeta con 96 GB de RAM. V100 (32 GB): sin medir; Abyss compila para sm_70 con CUDA 12.9, pero sin kernels FP4 ni tensor cores modernos se espera menos rendimiento.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB, siempre que se combine con RAM y SSD según el diseño.
- Opciones de despliegue: motor Abyss (v1.3.9x o superior) con drafter DSpark; no se documentan otros motores (llama.cpp, vLLM, Ollama, TGI) en la información disponible.
- Throughput: 67,5 tok/s en decodificación de tareas de código (132G) y 43,4 tok/s tras prompt de 32K en ambas variantes, en el equipo de referencia.

## Comparativa con modelos similares

| Modelo | Bytes de expertos | KL | Calidad (tareas) | Velocidad (tok/s) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LDLQ 132G (esta ficha) | 132,2 GB | 0,194 | 77,6 | 67,5 | MIT | Hugging Face |
| LDLQ 139G (esta ficha) | 139,4 GB | 0,182 | 81,4 | 57,9 | MIT | Hugging Face |
| unsloth UD-IQ1_M | 132,2 GB | 0,198 | 81,1 | 71,8 | MIT (modelo base) | Hugging Face |
| unsloth UD-IQ2_XXS | 156,9 GB | 0,142 | 78,8 | no disponible | MIT (modelo base) | Hugging Face |

La comparación se limita a las cuantizaciones del mismo modelo base citadas por el autor; no se dispone de datos de otros modelos MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: las mediciones proceden de un único PC y el autor solicita reportes de otras GPU y tamaños de RAM; las cifras de R9700 y V100 son estimaciones, no mediciones.
- Calidad inferior al cuantizado mayor: la KL de 0,194 (132G) y 0,182 (139G) es peor que la de UD-IQ2_XXS (0,142), que ocupa 156,9 GB de expertos; hay una pérdida de fidelidad respecto al modelo sin cuantizar.
- La puntuación de calidad de 132G (77,6) se debe a una sola tarea con 47 puntos; el resto está a la altura, pero indica variabilidad en tareas concretas.
- Dependencia del motor Abyss: el rendimiento documentado se obtuvo con Abyss y el drafter DSpark; no hay datos de compatibilidad ni velocidad con llama.cpp, vLLM u Ollama.
- Requisitos de hardware estrictos: sin 32 GB de VRAM, 96 GB de RAM y SSD NVMe, la velocidad cae de forma notable (30,5 tok/s con 64 GB de RAM en la referencia R9700).
- Idiomas no documentados: solo se validó japonés con 3 prompts; el resto de la cobertura multilingüe es desconocida.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; deben asumirse los del modelo base.
- Licencia MIT: permite uso comercial, pero al ser una cuantización conviene verificar los términos del modelo base DeepSeek-V4.1-Flash-1017 y de los ficheros de unsloth reutilizados (shard 6 y partes densas byte-idénticas).
- Los tipos de cuantización muy bajos (IQ1_S, IQ2_XXS) en las primeras capas pueden degradar tareas que dependan de representaciones finas; el autor solo valida con las pruebas descritas.

## Enlaces

- Hugging Face (esta cuantización): https://huggingface.co/zephel01/DeepSeek-V4.1-Flash-1017-LDLQ-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Abyss: https://github.com/zephel01/Abyss
- Issues de Abyss: https://github.com/zephel01/Abyss/issues
