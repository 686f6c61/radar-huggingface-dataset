# windowsxp811203/DeepSeek-V4-Flash-0731-Abliterated-GGUF

## Resumen

DeepSeek-V4-Flash-0731-Abliterated-GGUF es una conversión a formato GGUF para llama.cpp del checkpoint DeepSeek-V4-Flash-0731-Abliterated, una versión "abliterada" (con los comportamientos de rechazo eliminados) del modelo DeepSeek-V4-Flash-0731 de DeepSeek. El autor del repo es windowsxp811203. Se trata de un modelo de arquitectura MoE con 43 capas, 256 expertos enrutados (6 activos) y una ventana de contexto nativa de 1.048.576 tokens. La abliteración se aplicó mediante proyección de rango 1 sobre el tensor `attn.wo_b` en las capas 10 a 42, un método que elimina la negativa a responder sin reentrenar el modelo.

El repo publica dos builds: MXFP4 (recomendado, 156,4 GB) y Q3_K_M (135,3 GB), ambos fragmentados en cuatro shards por el límite de 50 GB por archivo de HuggingFace. Es relevante porque ofrece una alternativa sin mecanismos de rechazo para despliegue local con llama.cpp, con mediciones de calidad documentadas (perplejidad, MMLU y tasa de rechazo) y una advertencia explícita sobre el colapso de calidad en cuantizaciones por debajo de Q3. La licencia es MIT y los idiomas soportados son inglés y chino.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), 43 capas, 256 expertos enrutados, 6 activos |
| Parametros totales | no disponible |
| Parametros activos | no disponible (6 expertos activos de 256) |
| Longitud de contexto | 1.048.576 tokens (nativo) |
| Tipos de cuantizacion | MXFP4 (156,4 GB), Q3_K_M (135,3 GB); Q2_K construido y medido pero no publicado |
| Idiomas soportados | ingles, chino |
| Licencia | MIT |
| Formato de pesos | GGUF (4 shards por build, de hasta 44,9 GB cada uno) |

## Arquitectura y entrenamiento

El checkpoint original es DeepSeek-V4-Flash-0731 en precisión FP8 con escalas de bloque de 128×128. La conversión MXFP4 mapea directamente los tensores de los expertos MoE a MXFP4, que representan el 94,1 % del peso total (147,2 GB de 156,4 GB); el resto se reparte en Q8_0 (4,0 %), BF16 (1,8 %) y F32 (0,1 %). Por eso el autor no publica cuantizaciones intermedias como Q4_K_M o Q5_K_M: al estar el 94 % del peso ya en 4 bits, esas cuantizaciones serían mayores que el archivo MXFP4 sin aportar nada. Solo Q3 y por debajo reducen el tamaño real.

La abliteración se realizó con una proyección de rango 1 sobre `attn.wo_b` en las capas 10 a 42, según el método del modelo padre. No se dispone de datos sobre el entrenamiento original (composición del dataset, número de tokens, uso de RLHF o DPO). El modelo incorpora un modo de razonamiento ("thinking") activado por defecto, que puede desactivarse por petición con `"chat_template_kwargs": {"thinking": false}` o a nivel de servidor con `--chat-template-kwargs '{"thinking":false}'`.

## Capacidades

- Generación de texto con modo de razonamiento encadenado (thinking) activado por defecto, desactivable por petición.
- Sin mecanismos de rechazo: el modelo responde a peticiones que el checkpoint original rechazaría (verificado con AdvBench, tasa de rechazo de 0/120 en Q3_K_M y 1/120 en MXFP4).
- Contexto nativo de 1.048.576 tokens, adecuado para documentos muy largos.
- Soporte multilingüe limitado a inglés y chino.
- No soporta decodificación especulativa con el modelo borrador MTP (multi-token prediction) a través de llama.cpp: el convertidor de DeepSeek-V4 omite MTP por defecto y la opción `--mtp` aborta con un error de incompatibilidad de capas.
- No dispone de matriz de importancia (imatrix) para cuantización: `llama-quantize` la rechaza por incompatibilidad de tamaños de tensor en esta arquitectura.

## Casos de uso

- Investigación sobre alineación y comportamientos de rechazo: el modelo permite estudiar cómo se comporta un LLM sin capas de negativa, comparando respuestas con el checkpoint original en los mismos prompts.
- Generación de texto creativo sin restricciones: novelas, guiones o narrativa con temáticas que los modelos alineados rechazan, sin necesidad de jailbreaks ni prefijos de evasión.
- Procesamiento de documentos extensos: con 1.048.576 tokens de contexto, puede resumir o analizar corpus completos (libros técnicos, expedientes, codebases) en una sola pasada.
- Despliegue local de un modelo sin censura en infraestructura propia: al ser GGUF y licencia MIT, puede ejecutarse con llama.cpp en clústeres multi-GPU sin dependencias de servicios externos.
- Evaluación de calidad de cuantización: el repo documenta el colapso de Q2_K (MMLU al nivel del azar) y sirve como caso de estudio sobre cómo la perplejidad y la fluidez pueden enmascarar la pérdida de conocimiento en cuantizaciones agresivas.
- Desarrollo de aplicaciones de chat en inglés y chino que requieran respuestas sin filtros de seguridad, asumiendo la responsabilidad legal del uso.

## Benchmarks y rendimiento

El autor publica mediciones propias sobre tres builds (MXFP4, Q3_K_M y Q2_K, este último no publicado). Metodología: perplejidad sobre held-out de wikitext-2 (40 chunks a `-c 2048`), MMLU con 400 preguntas equidistantes y respuesta de una sola letra, y tasa de rechazo con AdvBench en modo greedy sin thinking y sin jailbreak de prefijo (n=120 por build).

| Build | Perplejidad (PPL) | MMLU (400) | Tasa de rechazo |
|---|---|---|---|
| MXFP4 (recomendado) | 4,105 | 77,00 % | 1/120 (0,83 %) |
| Q3_K_M | 4,606 | 75,75 % | 0/120 (0,00 %) |
| Q2_K (no publicado) | 8,323 | 23,25 % | 0/120 (0,00 %) |

El Q2_K puntúa 23,25 % en MMLU, estadísticamente indistinguible del azar (25 % para 4 opciones, IC 95 % de 19,1–27,4 %), pese a mantener fluidez aparente y tasa de rechazo perfecta. El autor lo retuvo por considerarlo un modelo cuyo conocimiento ha colapsado. No se han publicado resultados de benchmarks estándar adicionales (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- MXFP4: 156,4 GB en disco, repartidos en 4 shards de hasta 44,5 GB. Requiere multi-GPU o descarga pesada a CPU. Verificado en 3× H200 (GPU de 141 GB cada una).
- Q3_K_M: 135,3 GB en disco, 4 shards de hasta 44,9 GB. Mismos requisitos de despliegue multi-GPU.
- No cabe en GPU de consumo (RTX 4090, 24 GB; RTX 5090, 32 GB). Se necesitan al menos 2 GPU de 96 GB o 3× H200, o bien configuraciones con offload parcial a CPU con RAM abundante.
- Despliegue con llama.cpp (`llama-server`), apuntando al primer shard; el resto se carga automáticamente. Tiempo de arranque verificado de 22 segundos desde el primer shard.
- No hay datos de latencia ni throughput publicados en la información disponible.
- El modelo original en BF16 requiere 4× H100 u 8× A100 según la documentación del proyecto DeepSeek V4 Flash.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-Abliterated-GGUF (este repo) | GGUF | 1.048.576 | MXFP4, Q3_K_M | MIT | Abliterado, sin rechazo, 43 capas, 256 expertos |
| huihui-ai/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF | GGUF | no disponible | no disponible | no disponible | Versión abliterada alternativa del mismo checkpoint base |
| deepseek-ai/DeepSeek-V4-Flash-0731 (original) | Checkpoint FP8 | 1.048.576 | FP8 nativo | no disponible | Modelo oficial de DeepSeek, con mecanismos de rechazo intactos |

No se dispone de datos suficientes sobre la versión de huihui-ai (tamaños, cuantizaciones o benchmarks) para una comparación cuantitativa. La diferencia principal con el original es la eliminación del rechazo y el formato GGUF para llama.cpp.

## Limitaciones y advertencias

- Modelo sin mecanismos de rechazo: puede generar contenido dañino, ilegal o no ético. El repo exige confirmación explícita de responsabilidad antes del acceso (puerta de acceso con dos casillas de verificación).
- Colapso de calidad en cuantizaciones bajas: Q2_K (103,1 GB) puntúa al nivel del azar en MMLU (23,25 %) pese a mantener fluidez aparente y tasa de rechazo perfecta. El límite de calidad se sitúa entre Q3 y Q2, pero solo se han medido tres puntos, por lo que la localización exacta del precipicio no está determinada.
- Sin decodificación especulativa: el modelo MTP integrado (tres bloques `mtp.N` con profundidad declarada de 1) no es compatible con llama.cpp, por lo que no se puede usar el borrador para acelerar la generación.
- Sin imatrix: la cuantización Q3_K_M es plana, sin matriz de importancia; una build con imatrix probablemente puntuaría algo mejor.
- Requiere hardware de gama alta: no es ejecutable en GPU de consumo; necesita clústeres multi-GPU o offload masivo a CPU.
- Idiomas limitados a inglés y chino; no hay garantía de calidad en otros idiomas.
- El modo thinking está activado por defecto y consume tokens de salida; desactivarlo requiere configuración explícita del template de chat.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/windowsxp811203/DeepSeek-V4-Flash-0731-Abliterated-GGUF
- Modelo base (abliterado): https://huggingface.co/windowsxp811203/DeepSeek-V4-Flash-0731-Abliterated
- Modelo original de DeepSeek: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Versión abliterada alternativa (huihui-ai): https://huggingface.co/huihui-ai/Huihui-DeepSeek-V4-Flash-0731-abliterated-GGUF
- Documentación del proyecto (DeepWiki): https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Repositorio GitHub del proyecto: https://github.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Ficha en friendli.ai: https://friendli.ai/models/windowsxp811203/DeepSeek-V4-Flash-0731-Abliterated
