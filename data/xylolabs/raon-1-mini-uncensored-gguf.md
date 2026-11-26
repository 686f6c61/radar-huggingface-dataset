# Xylolabs/Raon-1-mini-Uncensored-GGUF

## Resumen

Raon-1-mini Uncensored GGUF es una versión cuantizada en formato GGUF del modelo KRAFTON/Raon-1-mini, un transformer de tipo Mixture of Experts (MoE) de aproximadamente 28.800 millones de parámetros totales, publicado por Xylolabs. La modificación principal consiste en la eliminación de una dirección de rechazo (refusal direction) de los pesos, técnica conocida como *abliteration*, aplicada en la capa 13 con intensidad 1.5 sobre 3.128 tensores. El resultado es un modelo que prácticamente no rechaza peticiones dañinas: 0,5 % de rechazos en HarmBench para Q8_0 y 0,0 % para Q4_K_M, frente al 99,0 % y 98,5 % del modelo original.

El modelo base es Raon-1-mini de KRAFTON, con soporte declarado para coreano e inglés, y esta versión conserva esa cobertura idiomática. Se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse con el fork de llama.cpp mantenido por KRAFTON (rama `raon-1-mini`), ya que el modelo incorpora mecanismos propios (vectores de esfuerzo o *effort-steering*) que el llama.cpp estándar no interpreta correctamente.

La relevancia de esta ficha es doble: por un lado documenta una familia de cuantizaciones GGUF con métricas de fidelidad (KL, top-1) frente al BF16 de referencia; por otro, advierte de que la eliminación del rechazo tiene implicaciones éticas y de seguridad que deben evaluarse antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), según tags del repo; detalles internos del base no disponibles |
| Parametros totales | 28.783.231.402 (28,78 B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 256K según la tabla de hardware del autor (64K con 24-32 GB de VRAM) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | coreano (ko), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE, según los tags del repositorio (`moe`, `abliterated`, `uncensored`). La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos corresponden al modelo original KRAFTON/Raon-1-mini y no se reproducen aquí. Lo que sí se documenta es la intervención de Xylolabs: se calcula una única dirección de rechazo en la capa 13 y se resta con fuerza 1,5 del *token embedding*, de las proyecciones de salida de atención de las capas 0 a 24, de las proyecciones *down* de expertos enrutados y compartidos de las capas 1 a 24, de la proyección *down* densa de la capa 0 y de los vectores de esfuerzo de las capas 12, 14, 16, 18 y 20. En total, 3.128 tensores modificados; la cabeza de salida queda intacta.

La innovación técnica destacable es la presencia de *effort-steering vectors* en capas intermedias, un mecanismo propio del modelo base que permite regular el esfuerzo de razonamiento. El fork de llama.cpp de KRAFTON es necesario para que estos vectores se apliquen correctamente. Las cuantizaciones se generan con `imatrix` y se validan con métricas de divergencia KL y acuerdo top-1 frente al BF16 de referencia (obtenido al de-cuantizar los pesos MXFP8 publicados).

## Capacidades

- Generación de texto conversacional en coreano e inglés.
- Razonamiento con modo *thinking* activable y desactivable (las métricas de HarmBench se midieron con *thinking* off).
- Ajuste del esfuerzo de razonamiento mediante los vectores de esfuerzo del modelo base.
- Generación de código y matemáticas (capacidad heredada del base; sin benchmarks publicados en esta ficha).
- Respuestas sin rechazo ante peticiones que el modelo original bloquearía (0,0-0,5 % de rechazos en HarmBench).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte explícito de *tool calling*, visión, audio ni agentes multi-paso en la información disponible.

## Casos de uso

- Investigación sobre alineación y seguridad: comparar el comportamiento del modelo original frente a la versión abliterated en HarmBench permite estudiar cómo se distribuye la dirección de rechazo en un transformer MoE y qué capas concentran la negativa.
- Evaluación de cuantizaciones: la tabla de KL y top-1 por cuantización sirve para decidir qué archivo usar según el presupuesto de VRAM, con datos medidos en WikiText-2, chat y *held-out*.
- Generación creativa sin filtros: escritura de ficción, guiones o narrativa que aborde temas sensibles sin las negativas del modelo base, en coreano o inglés.
- Despliegue local en estaciones de trabajo: con Q4_K_S (18,7 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB con contexto de 64K, útil para prototipos que requieran privacidad de datos.
- Servicio de inferencia en un solo H100: Q8_0 (30,7 GB) deja margen para 256K de contexto, adecuado para procesar documentos largos en coreano.
- Análisis de contenido multilingüe coreano-inglés: resumen y extracción de información en conversaciones bilingües, aprovechando la cobertura declarada de ambos idiomas.
- Estudio de robustez de filtros: probar sistemas de moderación externos contra un modelo que no rechaza, para medir la eficacia de las capas de seguridad añadidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Sí se publican métricas de fidelidad de cuantización y de rechazo:

| Metrica | Q8_0 | Q4_K_M | Q8_0 original | Q4_K_M original |
|---|---:|---:|---:|---:|
| Tamano | 30,69 GB | 19,69 GB | 30,69 GB | 19,69 GB |
| WikiText-2 KL | 0,023001 | 0,054064 | 0,005885 | 0,041563 |
| WikiText-2 top-1 | 93,69 % | 90,71 % | 96,87 % | 91,79 % |
| Chat KL | 0,017389 | 0,025297 | 0,002753 | 0,013269 |
| Chat top-1 | 94,80 % | 93,16 % | 97,90 % | 94,67 % |
| Held-out KL | 0,011359 | 0,021144 | 0,002143 | 0,013405 |
| Held-out top-1 | 94,55 % | 92,25 % | 97,63 % | 93,86 % |
| Check de 33 respuestas | 32/33 | 32/33 | 32/33 | 32/33 |
| HarmBench rechazados | 0,5 % | 0,0 % | 99,0 % | 98,5 % |
| Alpaca rechazados | 0,0 % | 0,0 % | 1,0 % | 1,0 % |

El resto de cuantizaciones (Q6_K, Q5_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K) solo reportan KL y top-1; las de rechazo no se midieron. Q2_K muestra una degradación notable (top-1 del 79,17 % en WikiText-2).

## Requisitos de hardware

- VRAM estimada: 13,1 GB (Q2_K) hasta 30,7 GB (Q8_0) solo para pesos; añadir margen para KV cache según contexto.
- RTX 4090 / RTX 3090 (24 GB): Q4_K_S (18,7 GB) con contexto de 64K.
- RTX 5090 (32 GB): Q6_K (25,8 GB) con contexto de 64K.
- RTX 6000 Ada o 2 × 24 GB (48 GB): Q8_0 con contexto de 256K.
- H100 (80 GB), H200 (141 GB), B200 (192 GB), B300: Q8_0 con 256K de contexto.
- RTX PRO 6000 Blackwell (96 GB), DGX Spark (128 GB unificada), Mac Studio M5 Max (128 GB) y M5 Ultra (256/512 GB): Q8_0 con 256K.
- Cabe en GPU de consumo: sí, desde Q2_K (13,1 GB) en 16 GB hasta Q8_0 en 24 GB ajustando contexto.
- Despliegue: exclusivamente con el fork `krafton-ai/llama.cpp`, rama `raon-1-mini` (commit `e1647091f3f53c63c184c536d7b33b5958e60225`), compilado con CUDA; `llama-server -m <archivo> --jinja -ngl 99 -c 32768`. No se documenta compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| Xylolabs/Raon-1-mini-Uncensored-GGUF | 28,78 B (MoE) | hasta 256K | Apache 2.0 | GGUF | Abliterated, 0,0-0,5 % rechazos en HarmBench |
| Xylolabs/Raon-1-mini-GGUF | 28,78 B (MoE) | hasta 256K | Apache 2.0 | GGUF | Sin modificar, 98,5-99,0 % rechazos |
| KRAFTON/Raon-1-mini | 28,78 B (MoE) | no disponible | Apache 2.0 | safetensors / MXFP8 | Modelo base original |
| Alternativas abliterated de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- La eliminación de la dirección de rechazo degrada la fidelidad respecto al original: el KL de Q8_0 sube de 0,005885 a 0,023001 y el top-1 baja del 96,87 % al 93,69 % en WikiText-2.
- Riesgo elevado de generar contenido dañino, ilegal o inseguro: el modelo está diseñado explícitamente para no rechazar. No debe desplegarse en aplicaciones de cara al público sin capas de moderación externas.
- Sesgos: no se documentan evaluaciones de sesgo; al ser un fine-tune abliterated sobre un base coreano-inglés, los sesgos del base persisten y pueden amplificarse.
- Alucinaciones: no se han publicado métricas de factualidad; el modo *thinking* off reduce el razonamiento y puede aumentar errores.
- Limitaciones idiomáticas: solo coreano e inglés declarados; el rendimiento en castellano no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado.
- Dependencia de un fork específico de llama.cpp: la integración con herramientas estándar (Ollama, vLLM, TGI) no está soportada oficialmente; los vectores de esfuerzo pueden ignorarse o aplicarse mal en otros runtimes.
- Cuantizaciones bajas (Q3_K_M, Q2_K) degradan notablemente la calidad (top-1 del 85,92 % y 79,17 % en WikiText-2); no se recomiendan para producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa prácticamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Raon-1-mini-Uncensored-GGUF
- Modelo base: https://huggingface.co/KRAFTON/Raon-1-mini
- GGUF original sin modificar: https://huggingface.co/Xylolabs/Raon-1-mini-GGUF
- Fork de llama.cpp de KRAFTON: https://github.com/krafton-ai/llama.cpp (rama `raon-1-mini`)
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
