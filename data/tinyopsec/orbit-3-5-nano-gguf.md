# tinyopsec/Orbit-3.5-Nano-GGUF

## Resumen

Orbit-3.5-Nano-GGUF es el conjunto de cuantizaciones en formato GGUF, publicadas por el usuario `tinyopsec`, del modelo `OpenPathAI/Orbit-3.5-Nano`, un fine-tune de `LiquidAI/LFM2.5-2.6B` orientado a instrucciones y generación de código en indonesio. El modelo base pertenece a la familia LFM2 de Liquid AI y cuenta con 2.697.198.592 parámetros (aproximadamente 2,70 mil millones), por lo que se sitúa en el segmento de modelos pequeños aptos para inferencia local.

El repositorio se generó con llama.cpp e incluye trece ficheros que cubren desde F16 (5,2 GB) hasta Q2_K, pasando por las variantes k-quant habituales (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, etc.). El fichero recomendado por el autor es `model-Q4_K_M.gguf`. El tamaño total del repositorio es de 26,3 GB, coherente con la suma de todas las cuantizaciones publicadas.

Su relevancia actual es limitada pero concreta: permite ejecutar un modelo instructivo especializado en indonesio en CPU o en GPU de consumo mediante llama.cpp, Ollama, LM Studio o koboldcpp. Conviene señalar que el artefacto es muy reciente (creado el 27 de octubre de 2026) y no registra descargas ni valoraciones, además de no publicar benchmarks ni especificar la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LFM2 (familia Liquid Foundation Model 2 de Liquid AI); el desglose interno de capas no está disponible en la información proporcionada |
| Parámetros totales | 2.697.198.592 (≈2,70 mil millones) |
| Parámetros activos | no aplica (no consta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | indonesio (según la model card); cobertura del resto de idiomas no disponible |
| Licencia | other (LFM Open License v1.0) |
| Formato de pesos | GGUF (13 ficheros); los pesos originales sin cuantizar del fine-tune no se incluyen en este repositorio |
| Modelo base | LiquidAI/LFM2.5-2.6B |
| Modelo del que deriva | OpenPathAI/Orbit-3.5-Nano (fine-tune) |
| Pipeline | text-generation |
| Tamaño del repositorio | 26,3 GB |
| Creado / actualizado | 2026-10-27 / 2026-10-27 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `lfm2`, que identifica la familia LFM2 de Liquid AI a la que pertenece el modelo base `LiquidAI/LFM2.5-2.6B`. Tampoco se especifican el número de capas, la composición de bloques (atención, convolución o híbridos), la dimensión del estado oculto ni la longitud de contexto nativa del modelo original. Todos estos datos figuran como no disponibles en la documentación consultada.

En cuanto al entrenamiento, la model card únicamente indica que se trata de un fine-tune para instrucciones y código en indonesio, sin aportar el volumen de tokens, la composición del dataset, ni si se aplicaron fases de alineación como RLHF, DPO o SFT supervisado. La contribución técnica de este repositorio concreto es la cuantización: los trece ficheros GGUF se generaron con llama.cpp, presumiblemente mediante el pipeline estándar de k-quants (bloques de cuantización con escalas por grupo), sin que se documenten calibraciones especiales, imatrix ni procesos de decodificación especulativa.

## Capacidades

- Generación de texto conversacional en formato instructivo, con plantilla de chat propia del fine-tune (no documentada en este repositorio).
- Generación de código y asistencia a la programación, según la etiqueta `coding` declarada por el autor.
- Comprensión y generación en indonesio como idioma principal de entrenamiento.
- Ejecución en runtimes compatibles con GGUF: llama.cpp, Ollama, LM Studio, koboldcpp y llama-cpp-python.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia que hablan el protocolo de Hugging Face.
- Soporte de tool calling / function calling: no disponible (no se menciona en la documentación).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades multimodales (visión, audio): no disponibles; las etiquetas no indican ninguna modalidad distinta del texto.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Asistencia a desarrolladores en indonesio: el modelo puede actuar como copiloto de código para equipos que trabajan en ese idioma, resolviendo dudas de sintaxis, generando fragmentos y explicando errores desde un portátil sin GPU dedicada, al ejecutarse con la cuantización Q4_K_M en llama.cpp.
- Autocompletado y generación de tests en IDE: con un servidor local de llama.cpp o llama-cpp-python expuesto por API compatible con OpenAI, puede integrarse en extensiones de editor para sugerir tests unitarios o documentación de funciones en proyectos con código base en indonesio.
- Atención al cliente automatizada en indonesio: el modelo puede gestionar conversaciones multi-turno de dominio acotado (FAQ, seguimiento de pedidos, soporte técnico básico) en despliegues on-premise donde no se permite enviar datos a APIs externas. La ventana de contexto debe validarse empíricamente, ya que no está publicada.
- Procesamiento por lotes en CPU: al pesar alrededor de 1,7 GB en Q4_K_M, permite clasificar, resumir y extraer campos de grandes volúmenes de documentos en indonesio sobre infraestructura sin acelerador, con un coste por token muy bajo.
- Despliegue en entornos con conectividad limitada o air-gapped: al ser un artefacto GGUF autocontenido, puede distribuirse en una imagen de contenedor y ejecutarse sin acceso a Internet, algo habitual en administraciones públicas y sucursales remotas.
- Prototipado rápido y evaluación de producto: sirve para validar flujos conversacionales o pipelines de generación de código antes de invertir en un modelo mayor, ya que su reducido tamaño permite iterar en minutos y comparar cuantizaciones (Q4_K_M frente a Q8_0) para medir la pérdida de calidad.
- Traducción y adaptación de contenido indonesio: generación de borradores, reformulación de textos y adaptación de tono en indonesio, siempre con revisión humana dado el riesgo de alucinación en modelos de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües, y el registro de terceros consultado (`free2aitools.com`) figura explícitamente como pendiente de metadatos de origen. Tampoco se documentan comparaciones entre cuantizaciones (por ejemplo, perplejidad de Q4_K_M frente a F16).

## Requisitos de hardware

Los tamaños de los ficheros distintos de F16 son estimaciones calculadas a partir de los 2.697.198.592 parámetros y de los bits por peso típicos de cada tipo de cuantización de llama.cpp; no están publicados en la model card.

| Cuantización | Peso estimado | VRAM estimada (pesos + caché KV + overhead) |
|---|---|---|
| F16 | 5,2 GB (dato del autor) | ~6,0-7,0 GB |
| Q8_0 | ~2,9 GB | ~3,5-4,0 GB |
| Q6_K | ~2,2 GB | ~2,8-3,3 GB |
| Q5_K_M | ~1,9 GB | ~2,5-3,0 GB |
| Q4_K_M (recomendada) | ~1,7 GB | ~2,2-2,8 GB |
| Q3_K_M | ~1,4 GB | ~1,9-2,4 GB |
| Q2_K | ~1,1 GB | ~1,5-2,0 GB |

- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060, T4); 8 GB o más si se quiere F16 con contexto amplio (RTX 3060 Ti/4060 Ti, L4). Para A100/H100 no aporta ventaja: el modelo está limitado por ancho de banda, no por cómputo.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU discretas de los últimos seis años, y también en iGPU con memoria unificada de 8 GB o más (Apple Silicon, AMD APU).
- CPU: inferencia viable en x86-64 con AVX2 y 8 GB de RAM para Q4_K_M; en Raspberry Pi 4/5 solo con expectativas de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), llama-cpp-python, Ollama, LM Studio, koboldcpp. vLLM y TGI tienen soporte de GGUF parcial o experimental; para producción con concurrencia alta conviene convertir a safetensors y servir con vLLM, aunque los pesos originales no se distribuyen en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo en ningún hardware.

## Comparativa con modelos similares

Los datos de las filas marcadas con asterisco son valores de referencia de dominio público y no proceden de la información proporcionada, por lo que deben verificarse antes de usarse en una decisión técnica.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Orbit-3.5-Nano-GGUF (este) | 2,70 B | no disponible | LFM Open License v1.0 | GGUF (13 quants) | Fine-tune para indonesio; sin benchmarks publicados |
| LiquidAI/LFM2.5-2.6B (base) | ≈2,6 B | no disponible | no disponible | safetensors | Modelo original de Liquid AI; capacidades multilingües sin confirmar en esta ficha |
| Qwen2.5-3B-Instruct * | 3,09 B | 32 768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa con licencia permisiva y contexto amplio, multilingüe |
| Llama-3.2-3B-Instruct * | 3,21 B | 131 072 tokens | Llama 3.2 Community License | safetensors, GGUF | Mayor contexto; licencia con restricciones de uso y cláusula de nombres |
| Gemma-2-2B-it * | 2,61 B | 8 192 tokens | Gemma Terms of Use | safetensors, GGUF | Comparable en tamaño; contexto reducido |

No se dispone de comparaciones de rendimiento (perplejidad, MMLU, HumanEval) entre Orbit-3.5-Nano y estas alternativas, por lo que la elección debe basarse en la cobertura del indonesio y en pruebas propias.

## Limitaciones y advertencias

- Idioma: el fine-tune está orientado al indonesio; el rendimiento en castellano, inglés u otros idiomas no está documentado y previsiblemente será inferior al de modelos multilingües del mismo tamaño.
- Contexto desconocido: al no publicarse la longitud de contexto, cualquier diseño que dependa de ventanas largas debe validarse empíricamente antes de producción.
- Sin benchmarks: no hay evidencia cuantitativa de calidad en código, matemáticas o razonamiento; las etiquetas `instruct` y `coding` proceden del propio autor.
- Riesgo de alucinación: con 2,70 B de parámetros y sin datos de alineación, es esperable una tasa elevada de invención de hechos, especialmente en dominios especializados; requiere verificación factual y, preferiblemente, recuperación aumentada.
- Cadena de procedencia en tres saltos: LiquidAI (base) → OpenPathAI (fine-tune) → tinyopsec (cuantización). La model card no documenta el proceso de cuantización ni verifica el fine-tune intermedio, lo que dificulta la auditoría.
- Licencia: LFM Open License v1.0 no es una licencia permisiva tipo Apache o MIT. Los términos concretos de uso comercial, redistribución y obligaciones de atribución no se detallan en la información disponible y deben consultarse en el texto íntegro de la licencia antes de un despliegue comercial.
- Señales de madurez nulas: 0 descargas, 0 likes y publicación y actualización en la misma fecha. Es un artefacto sin validación comunitaria.
- Tamaño del repositorio: 26,3 GB con trece cuantizaciones; conviene descargar solo el fichero necesario para evitar consumo innecesario de disco y ancho de banda.
- Confusión de nombres: los resultados de búsqueda incluyen el proyecto `Sphere-AI-Lab/orbit` (aprendizaje por refuerzo para modelos de billones de parámetros), que no guarda relación con este modelo.
- Sesgos: no hay información sobre la composición del dataset de fine-tune, por lo que no pueden evaluarse sesgos demográficos, políticos o culturales específicos del indonesio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tinyopsec/Orbit-3.5-Nano-GGUF
- Espejo de cuantizaciones de mradermacher: https://huggingface.co/mradermacher/Orbit-3.5-Nano-GGUF
- Modelo del que deriva (fine-tune): https://huggingface.co/OpenPathAI/Orbit-3.5-Nano
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Perfil del autor de la cuantización: https://huggingface.co/tinyopsec/models
- Registro de terceros (sin benchmarks, metadatos pendientes): https://free2aitools.com/model/mradermacher/orbit-3.5-nano-gguf
- No relacionado: https://github.com/Sphere-AI-Lab/orbit (proyecto de RL ajeno a este modelo)
