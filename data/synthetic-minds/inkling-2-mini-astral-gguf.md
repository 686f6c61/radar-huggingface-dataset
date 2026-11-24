# synthetic-minds/Inkling-2-Mini-Astral-GGUF

## Resumen

Inkling-2-Mini-Astral-GGUF es una cuantización GGUF en 8 bits del modelo multimodal `thinkingmachines/Inkling-2-Mini`, desarrollado por Thinking Machines Lab y cuantizado por Synthetic Minds mediante su framework propietario Infall-TT. El modelo original es un transformer autorregresivo multimodal con arquitectura de bucle (looped transformer) y mezcla de expertos (MoE), con 26.400 millones de parámetros totales y 3.400 millones activos por token. Esta versión cuantizada mantiene la licencia Apache 2.0 y está pensada tanto para hardware Tenstorrent (Blackhole P150A/B, P300C, Galaxy Blackhole) como para cualquier máquina con `llama.cpp`.

El modelo resuelve tareas de imagen-a-texto y texto generativo conversacional, con soporte multilingüe y etiquetas que indican compatibilidad con endpoints y tool calling. Su relevancia actual radica en que permite ejecutar un modelo multimodal MoE de 26B en formato de 8 bits con un tamaño de fichero de aproximadamente 27,8 GB, lo que reduce los requisitos de memoria frente a los pesos originales en safetensors (161 GB de repositorio). La cuantización Q8_0 es la referencia de calidad del propio autor, y las métricas publicadas muestran que las variantes Q4_K_M a Q6_K_L mantienen una fidelidad muy alta respecto a Q8_0 en wikitext-2.

La ficha se centra en la versión GGUF cuantizada, pero incorpora los datos disponibles del modelo base. No se han publicado datos de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal con bucle (looped transformer) y mezcla de expertos (MoE) |
| Parametros totales | 26.070.385.152 (26,07B; el autor declara 26,4B) |
| Parametros activos | 3,4B (según model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF en 8 bits (Q8_0) y variantes Q4_K_M, Q5_K_S, Q5_K_M, Q6_K_S, Q6_K, Q6_K_L |
| Idiomas soportados | Inglés (en) y soporte multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con safetensors del modelo base; esta versión es GGUF) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo multimodal con arquitectura de bucle, en la que el bloque transformer se reaplica de forma iterativa para aumentar la profundidad efectiva sin incrementar linealmente el número de parámetros. Combina esto con una capa de mezcla de expertos que activa 3,4B de parámetros por token sobre un total de 26,4B, lo que reduce el coste computacional en inferencia respecto a un modelo denso del mismo tamaño. Está diseñado para entrada de imagen y texto (pipeline `image-text-to-text`) y soporta conversación multi-turno.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación. La model card del autor no detalla el proceso de entrenamiento del modelo base. La innovación técnica destacable en esta versión es la cuantización con Infall-TT, un framework de Synthetic Minds para entrenar, cuantizar y ejecutar modelos en hardware Tenstorrent; los ficheros GGUF resultantes son estándar y ejecutables en `llama.cpp`. El autor publica métricas de fidelidad de la cuantización (divergencia KL, acuerdo top-1 y perplejidad) frente a Q8_0 sobre wikitext-2.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto (image-text-to-text): acepta imágenes como entrada junto con texto.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Soporte de tool calling / function calling: la etiqueta `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla el soporte de function calling.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: inglés y soporte multilingüe general según la model card.
- Modo thinking: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional multimodal: el modelo puede recibir imágenes y texto en la misma conversación, lo que permite responder preguntas sobre capturas, documentos escaneados o fotografías dentro de un flujo de chat multi-turno.
- Descripción y análisis de imágenes en producción: al ser un modelo image-text-to-text, puede integrarse en pipelines de catalogación de imágenes, moderación de contenido visual o generación de alt-text accesible.
- Despliegue en hardware Tenstorrent: la cuantización Infall-TT está optimizada para Blackhole P150A/B, P300C y Galaxy Blackhole, lo que permite ejecutar el modelo en aceleradores Tenstorrent sin depender de GPU convencionales.
- Inferencia en estaciones de trabajo con `llama.cpp`: los ficheros GGUF estándar permiten ejecutar el modelo en CPU/GPU con llama.cpp, útil para prototipado local y entornos sin acceso a clústeres.
- Evaluación de cuantizaciones: las métricas publicadas (KL, top-1, perplejidad) permiten usar este repo como referencia para comparar el impacto de distintas cuantizaciones GGUF en tareas de generación.
- Servicio de chat con contexto conversacional: la naturaleza conversacional del modelo base y su licencia Apache 2.0 facilitan integrarlo en aplicaciones de atención al cliente o asistentes internos, siempre que se validen las capacidades multilingües y de contexto reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de la cuantización frente a Q8_0 sobre wikitext-2:

| Cuantizacion | Tamano (GB) | Divergencia KL media | Acuerdo top-1 con Q8_0 | Perplejidad |
|---|---|---|---|---|
| Q4_K_M | ~18,7 | ~0,0059 | ~96,8% | ~5,943 |
| Q5_K_S | ~19,2 | ~0,0041 | ~97,3% | ~5,936 |
| Q5_K_M | ~21,2 | ~0,0037 | ~97,5% | ~5,935 |
| Q6_K_S | ~24,1 | ~0,0028 | ~97,7% | ~5,931 |
| Q6_K | ~24,7 | ~0,0027 | ~97,8% | ~5,934 |
| Q6_K_L | ~25,4 | ~0,0026 | ~97,9% | ~5,933 |
| Q8_0 | ~27,8 | 0 (referencia) | 100% (referencia) | ~5,931 |

Las diferencias de perplejidad entre cuantizaciones (~0,01) son menores que los intervalos de error (~±0,035), por lo que el autor las considera estadísticamente indistinguibles de Q8_0 en esa métrica.

## Requisitos de hardware

- VRAM estimada: Q8_0 ocupa ~27,8 GB; Q6_K_L ~25,4 GB; Q5_K_M ~21,2 GB; Q4_K_M ~18,7 GB. Para inferencia completa en GPU se necesita al menos esa cantidad de memoria, más overhead de contexto y KV cache.
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q8_0 requiere GPU con 32 GB o más (A100 40GB, H100, RTX 6000 Ada, etc.); Q4_K_M podría caber en GPU de 24 GB con contexto reducido.
- Consumer GPU: Q4_K_M (~18,7 GB) es la variante más viable en GPUs de 24 GB (RTX 3090/4090) con contexto limitado; Q8_0 no cabe en GPUs consumer de 24 GB.
- Hardware específico: Tenstorrent Blackhole P150A/B, P300C y Galaxy Blackhole (objetivo declarado de la cuantización Infall-TT).
- Opciones de despliegue: `llama.cpp` (cualquier máquina), hardware Tenstorrent con Infall-TT. No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia estructural, el modelo se sitúa en la categoría de MoE multimodal de ~26B totales con ~3,4B activos, licencia Apache 2.0 y formato GGUF. Cualquier comparación con otros modelos de esa categoría requeriría datos de rendimiento que no se han publicado aquí.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks de tareas, por lo que el rendimiento real en razonamiento, código o matemáticas no está verificado.
- La model card no detalla sesgos conocidos ni el proceso de alineación del modelo base; se desconoce el riesgo de alucinación y el comportamiento en dominios sensibles.
- El soporte multilingüe se declara de forma genérica; el único idioma confirmado es el inglés, y no hay evaluación de calidad en otros idiomas.
- La longitud de contexto no está especificada, lo que impide planificar despliegues con ventanas largas.
- Aunque la licencia es Apache 2.0, conviene revisar los términos del modelo base y de las dependencias de `llama.cpp` antes de un uso comercial en producción.
- El repo tiene 161 GB de tamaño total (incluye pesos originales y cuantizaciones); descargar solo el fichero GGUF necesario para evitar consumo innecesario de almacenamiento.
- Las métricas de cuantización publicadas son aproximadas (leídas de gráficas por el autor) y se limitan a wikitext-2; no garantizan el mismo comportamiento en otras tareas.
- La cuantización está optimizada para hardware Tenstorrent; en otras plataformas se ejecuta mediante `llama.cpp` estándar, sin las optimizaciones específicas de Infall-TT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/synthetic-minds/Inkling-2-Mini-Astral-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Web de Synthetic Minds: https://www.syntheticmindslab.com
- Introducción a Infall-TT: https://www.syntheticmindslab.com/news/introducing-infall-tt
- Lista de espera Infall-TT: https://www.syntheticmindslab.com/infall-tt
- Colección GGUF Infall-TT: https://hf.co/collections/synthetic-minds/infall-tt-optimised-gguf-20
- GitHub de Synthetic Minds: https://github.com/syntheticminds-lab
- X de Synthetic Minds: https://x.com/syntheticminds2
- X de Tudor: https://x.com/tudoriustin_
- LinkedIn de Synthetic Minds: https://www.linkedin.com/company/synthetic-minds-lab/
- Buy Me a Coffee: https://buymeacoffee.com/syntheticminds_lab
