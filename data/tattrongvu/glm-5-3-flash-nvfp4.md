# tattrongvu/GLM-5.3-Flash-NVFP4

## Resumen

GLM-5.3-Flash-NVFP4 es una cuantizacion en punto flotante de 4 bits (NVFP4, e2m1) del modelo multimodal GLM-5.3-Flash de Z.ai, realizada por el usuario independiente tattrongvu. El modelo base, GLM-5.3-Flash (tambien conocido como ox-alpha), es un modelo de 320.000 millones de parametros con 18.000 millones activos, arquitectura MoE, ventana de contexto de 1.048.576 tokens y licencia MIT, que destaca en tareas de codigo, razonamiento y uso agente. Esta version cuantizada reduce el peso del checkpoint de 328,4 GB a 194,6 GB (un 40,7 % menos) manteniendo las activaciones en bf16 (W4A16), lo que la hace viable en entornos con multiples GPU profesionales sin necesidad de un cluster extenso.

La cuantizacion cubre de forma uniforme los expertos enrutados de todas las capas MoE, incluyendo la capa 45 de prediccion multi-token (MTP), y no requiere datos de calibracion: el esquema usa escalas derivadas de cada grupo de 16 pesos (memoryless_minmax). Esto simplifica el proceso de conversion y evita sesgos introducidos por datasets de calibracion, aunque impide el uso de decodificacion especulativa con los runtimes actuales. El autor publica resultados de evaluacion parciales (bounded runs) en cuatro benchmarks, con cifras destacables en bfcl_v4 (72,64) y aime26 (68,33).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con 45 capas ocultas + 1 capa MTP, atencion KDA + DSA, vision tower integrada |
| Parametros totales | 165.496.249.182 (165,5 B) |
| Parametros activos | 18 B (segun informacion del modelo base) |
| Longitud de contexto | 1.048.576 tokens (1M, segun informacion del modelo base) |
| Tipos de cuantizacion | NVFP4 (e2m1, grupo de 16, escala fp8-e4m3 por grupo y fp32 global por tensor), peso-only W4A16 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors, formato modelopt (quant_algo: NVFP4) |

## Arquitectura y entrenamiento

GLM-5.3-Flash-NVFP4 es una cuantizacion del modelo GLM-5.3-Flash de Z.ai, cuya arquitectura original es un transformer MoE con 45 capas ocultas, 288 expertos enrutados por capa y una capa adicional (indice 45) dedicada a prediccion multi-token (MTP). El modelo base incorpora atencion KDA (probablemente alguna variante de atencion con kernel fusionado) y DSA (DeepSeek Attention), ademas de un router MoE, expertos compartidos y una torre de vision para entrada multimodal. El checkpoint cuantizado mantiene en bf16 todos los componentes no MoE: atencion, router, expertos compartidos, MLP densos de las capas 0-2, lm_head, embeddings y la torre de vision completa.

La cuantizacion NVFP4 se aplica exclusivamente a los pesos de los expertos enrutados (proyecciones gate, up y down) de las capas 3 a 45, incluida la capa MTP. El esquema es weight-only: las activaciones permanecen en bf16, lo que simplifica el despliegue al no requerir datasets de calibracion (el metodo memoryless_minmax deriva escalas de cada grupo de 16 valores). El autor reporta un error relativo medio de reconstruccion de 0,0918 frente al suelo teorico del formato NVFP4 (~0,093), lo que indica que la cuantizacion opera en el limite de precision del formato. No se dispone de informacion sobre el entrenamiento del modelo base (datos, tokens, metodo de alineacion).

## Capacidades

- Generacion de texto y razonamiento multimodal: el modelo base acepta entradas de imagen y texto (pipeline_tag: image-text-to-text), por lo que esta cuantizacion hereda esas capacidades.
- Razonamiento encadenado (chain of thought): el modelo se sirve con el parser de razonamiento glm45, lo que indica que produce cadenas de pensamiento en el campo reasoning_content antes de generar la respuesta final.
- Tool calling y uso agente: el autor usa el parser de herramientas glm47 en el servidor SGLang, lo que confirma soporte para function calling y flujos agente multi-paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Prediccion multi-token (MTP): la capa 45 esta presente y cuantizada, aunque la decodificacion especulativa basada en MTP no funciona actualmente con los runtimes disponibles (ver limitaciones).
- Contexto largo: el modelo base soporta 1.048.576 tokens de contexto, y esta cuantizacion mantiene esa capacidad (verificada en despliegues de terceros con NVFP4 y cache KV NVFP4).

## Casos de uso

- Despliegue de un asistente de codigo en entornos con multiples GPU profesionales: con 194,6 GB de pesos en NVFP4, el modelo puede servirse con tensor parallelism 4 en GPU como B200 o A100 80 GB (4 × 80 GB = 320 GB de VRAM, suficiente para pesos, cache KV y overhead). Es adecuado para equipos que necesitan un modelo de 165 B con calidad de razonamiento y generacion de codigo sin pagar por APIs propietarias.
- Razonamiento matematico y resolucion de problemas tipo olimpiada: el benchmark aime26 muestra un 68,33 % en problemas de la Olimpiada Matematica Americana (AIME) 2026, lo que lo hace util para sistemas de tutoria avanzada o investigacion en matematicas asistidas por IA.
- Automatizacion de tareas agente con tool calling: el soporte de function calling (parser glm47) permite integrar el modelo en pipelines agente que llaman APIs, consultan bases de datos o ejecutan acciones en entornos controlados, como se refleja en el benchmark bfcl_v4 (72,64).
- Analisis de documentos largos y recuperacion de informacion: con 1M de tokens de contexto, el modelo puede procesar libros completos, codebases extensas o expedientes legales en una sola pasada, y la cuantizacion NVFP4 reduce el coste de VRAM para mantener esa ventana en memoria.
- Investigacion en cuantizacion de modelos MoE: este checkpoint sirve como referencia publica de como aplicar NVFP4 weight-only a arquitecturas con capas MTP y expertos enrutados, documentando los problemas de compatibilidad con runtimes como SGLang y vLLM.
- Servicio de chat multimodal en local: la torre de vision se mantiene en bf16, por lo que el modelo puede recibir imagenes y texto, util para sistemas de asistencia visual en entornos con requisitos de privacidad de datos.

## Benchmarks y rendimiento

El autor publica resultados de evaluacion parciales (eval-gate medium tier) ejecutados con SGLang y tensor parallelism 4 sobre 4 GPU B200. Los resultados de bfcl_v4 y hle son bounded runs (no puntuaciones completas del benchmark):

| Benchmark | Puntuacion | Muestras evaluadas | Notas |
|---|---|---|---|
| bfcl_v4 | 72,64 | 3.469 | bounded run (limite 300 por subset) |
| hle | 20,94 | 1.476 | bounded run (limite 200 por subset); no es una puntuacion HLE completa |
| aa_lcr | 77,00 | 100 | |
| aime26 | 68,33 | 120 | repeats: 4 sobre 30 problemas |

No se han publicado resultados comparativos con el modelo base en bf16 o con otras cuantizaciones en la informacion disponible. La falta de una evaluacion completa (especialmente en HLE) impide una valoracion definitiva del impacto de la cuantizacion en tareas de razonamiento complejo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 194,7 GB en disco; con activaciones bf16 y cache KV fp8, se recomienda un minimo de 4 × 80 GB (320 GB totales) para servir el modelo con tensor parallelism 4 y contexto largo. Con contexto corto y batch reducido, 4 × 48 GB podrian ser suficientes, pero no esta verificado.
- GPU recomendadas: NVIDIA B200 (usada por el autor), A100 80 GB, H100 80 GB o H200. En GPU consumer no es viable por VRAM (la maxima disponible es 24 GB en RTX 4090/5090).
- Opciones de despliegue: SGLang con la imagen docker especifica lmsysorg/sglang:glm-5.3-flash@sha256:e6f5482505e7502f791fe4615ad1fbec118cbbd6b44e98f2479b16b98b985ad6 y el flag --quantization modelopt_fp4. vLLM 0.25.1 no soporta la arquitectura glm5_next; versiones posteriores con soporte para glm5_next deberian funcionar, pero no han sido probadas por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor usa --cuda-graph-max-bs 64 y --max-running-requests 256, lo que sugiere un despliegue orientado a throughput medio-alto.
- Almacenamiento: se requiere espacio para el checkpoint (194,7 GB) y margen para descarga y conversion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-NVFP4 (este) | 165,5 B (18 B activos) | 1M | NVFP4 (W4A16) | MIT | HuggingFace, 194,7 GB |
| GLM-5.3-Flash (modelo base) | ~320 B (18 B activos) | 1M | bf16/fp8 | MIT | HuggingFace, 328,4 GB |
| RedHatAI GLM-5.3-Flash-NVFP4 | ~320 B (18 B activos) | 1M | NVFP4 con capa MTP en FP8 | MIT | HuggingFace (mencionado en la model card) |

La diferencia principal frente al modelo base es el ahorro de memoria (328,4 GB frente a 194,6 GB) a cambio de una perdida de precision en los pesos de los expertos. Frente a la variante de RedHatAI, este checkpoint mantiene la capa MTP en NVFP4 uniforme, mientras que RedHatAI la almacena en FP8 W8A (segun la model card), lo que podria permitir decodificacion especulativa en runtimes que lo soporten. No se dispone de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- Decodificacion especulativa no funcional: la capa MTP (indice 45) esta cuantizada en NVFP4, pero SGLang (stock y vendor) y vLLM 0.25.1 no pueden usarla para EAGLE o MTP debido a incompatibilidades de nombres de capas y formatos esperados. El despliegue queda limitado a generacion autoregresiva clasica.
- vLLM 0.25.1 no puede servir este modelo: su registro no incluye la arquitectura Glm5Next y su transformers (5.13.1) no reconoce model_type: glm5_next. Se requiere una version posterior con soporte para la arquitectura.
- Resultados de evaluacion parciales: las puntuaciones de bfcl_v4 y hle son bounded runs, no resultados completos. El modelo podria rendir peor o mejor en evaluaciones exhaustivas.
- Perdida de precision inherente a NVFP4: el error relativo medio de 0,0918 esta en el limite del formato, pero no se ha medido el impacto en tareas especificas frente al modelo en bf16.
- Sin datos de sesgos o alucinacion: la informacion proporcionada no incluye evaluaciones de sesgos, toxicidad o fiabilidad factual.
- Requisitos de hardware elevados: a pesar de la cuantizacion, 194,7 GB de pesos requieren un minimo de 4 GPU profesionales con 80 GB, fuera del alcance de equipos consumer.
- Sin informacion sobre idiomas: la model card no especifica los idiomas soportados, aunque por el origen del modelo base (Z.ai) es probable que incluya chino e ingles.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tattrongvu/GLM-5.3-Flash-NVFP4
- Modelo base (Z.ai): https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante similar (local-inference-lab): https://huggingface.co/local-inference-lab/GLM-5.3-Flash-NVFP4
- Pagina oficial de GLM-5.3 (OpenLM): https://openlm.ai/glm-5.3/
- Guia de ejecucion local (unsloth): https://unsloth.ai/docs/models/glm-5.3-flash
- Repositorio de despliegue con contexto 1M en DGX Spark (referencia de terceros): https://github.com/drowzeys/keys-vLLm.0.27.1-GLM-5.3-Flash-NVFP4-NVFP4KV-1M-Context-Abliterated
