# synthetic-minds/Inkling-2-Mini-Astral-GGUF

## Resumen

Inkling-2-Mini-Astral-GGUF es una familia de cuantizaciones GGUF del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por Synthetic Minds. El modelo base lo desarrolla Thinking Machines Lab y se publicó el 20 de noviembre de 2026 bajo licencia Apache 2.0. Se trata de un transformer autorregresivo multimodal con arquitectura de bucle (looped transformer) y mezcla de expertos (MoE), con 26.400 millones de parámetros totales y 3.400 millones activos, entrenado para tareas de imagen-texto-a-texto.

La relevancia de esta publicación es práctica: el modelo original en safetensors ocupa un espacio considerable, mientras que estas cuantizaciones reducen el peso a entre 18,7 GB (Q4_K_M) y 27,8 GB (Q8_0), lo que permite ejecutarlo en GPUs de gama alta de consumo y en estaciones de trabajo con llama.cpp. La cuantización la realiza Synthetic Minds con su stack propio, Astral-Q, orientado a GPUs NVIDIA desde centros de datos hasta escritorio.

El repositorio acumula 944 descargas en sus primeros días y ofrece siete variantes de cuantización (Q4_K_M, Q5_K_S, Q5_K_M, Q6_K_S, Q6_K, Q6_K_L y Q8_0) con métricas de fidelidad respecto a la referencia Q8_0 medidas sobre wikitext-2. El modelo conserva la pipeline image-text-to-text, por lo que mantiene capacidades multimodales además de generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo multimodal con bucle (looped transformer) y mezcla de expertos (MoE) |
| Parametros totales | 26.070.385.152 (26,07 B) |
| Parametros activos | 3,4 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_S, Q5_K_M, Q6_K_S, Q6_K, Q6_K_L, Q8_0 |
| Idiomas soportados | Inglés y soporte multilingüe general |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo con safetensors del modelo base referenciado) |

## Arquitectura y entrenamiento

El modelo base es un transformer autorregresivo con arquitectura de bucle (tag `inkling2_loop`), en la que el bloque se aplica de forma iterada, combinado con mezcla de expertos: 26,07 B de parámetros totales con solo 3,4 B activos por token, lo que reduce el coste computacional de inferencia manteniendo una capacidad de representación propia de un modelo mucho mayor. Es multimodal, con pipeline image-text-to-text, por lo que integra codificación de imágenes junto al decodificador de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO, ya que la model card del repositorio de cuantización no detalla el proceso de entrenamiento del modelo original. La innovación destacable de esta publicación concreta es el proceso de cuantización Astral-Q, que según el autor está ajustado para GPUs NVIDIA y produce ficheros GGUF estándar compatibles con llama.cpp. Las cuantizaciones se evalúan contra la referencia Q8_0 con divergencia KL sobre logits, acuerdo top-1 y perplejidad en wikitext-2.

## Capacidades

- Generación de texto conversacional en inglés y soporte multilingüe general.
- Procesamiento de imagen y texto combinados (image-text-to-text): el modelo acepta entradas visuales junto a instrucciones textuales.
- Razonamiento y generación de contenido a partir de contexto multimodal.
- Mezcla de expertos con 3,4 B de parámetros activos, lo que abarata la inferencia frente a un modelo denso del mismo tamaño total.
- Ejecución local mediante llama.cpp en formato GGUF, con servidor compatible (`llama-server`).
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional multimodal en local: desplegar el quant Q4_K_M (18,7 GB) con `llama-server` para un chatbot que recibe capturas de pantalla o fotografías junto a preguntas en lenguaje natural, sin depender de APIs externas.
- Procesamiento de documentos escaneados: extraer información de facturas, formularios o tickets a partir de la imagen y generar resúmenes estructurados, aprovechando la pipeline image-text-to-text y el bajo coste por token de los 3,4 B activos.
- Prototipado de producto en estaciones de trabajo: usar Q5_K_M (21,2 GB) en una RTX PRO o GPU de 24 GB para iterar sobre prompts y flujos multimodales antes de pasar a producción con el modelo completo.
- Despliegue en servidores con GPU de centro de datos: servir Q8_0 (27,8 GB) en H100/H200 o B200 para obtener la máxima fidelidad respecto al modelo original, con divergencia KL nula por definición.
- Investigación sobre cuantización: emplear las métricas publicadas (KL, top-1, perplejidad) como referencia para comparar el impacto de distintas cuantizaciones en modelos MoE multimodales.
- Generación de descripciones y alt-text a escala: procesar lotes de imágenes para producir descripciones en varios idiomas, con la ventaja de que el modelo es Apache 2.0 y permite uso comercial sin restricciones adicionales.
- Evaluación de modelos en pipelines de CI: integrar el quant Q6_K (24,7 GB) como referencia estable en pruebas de regresión de calidad de generación, dado su acuerdo top-1 del 97,8 % con Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización sobre wikitext-2:

| Quant | Tamano (GB) | KL media vs Q8_0 | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|
| Q4_K_M | 18,7 | ~0,0059 | ~96,8 % | ~5,943 |
| Q5_K_S | 19,2 | ~0,0041 | ~97,3 % | ~5,936 |
| Q5_K_M | 21,2 | ~0,0037 | ~97,5 % | ~5,935 |
| Q6_K_S | 24,1 | ~0,0028 | ~97,7 % | ~5,931 |
| Q6_K | 24,7 | ~0,0027 | ~97,8 % | ~5,934 |
| Q6_K_L | 25,4 | ~0,0026 | ~97,9 % | ~5,933 |
| Q8_0 | 27,8 | 0 (referencia) | 100 % | ~5,931 |

Las diferencias de perplejidad entre cuantizaciones (en torno a 0,01) son menores que el margen de error (±0,035), por lo que resultan estadísticamente indistinguibles. La mayor caída de distorsión se produce entre Q4_K_M y Q5_K_S; a partir de Q6_K_S las ganancias son marginales.

## Requisitos de hardware

- VRAM estimada: entre 18,7 GB (Q4_K_M) y 27,8 GB (Q8_0) solo para los pesos; hay que añadir memoria para el contexto KV y el codificador de imagen.
- GPUs objetivo declaradas por el autor: NVIDIA H100/H200, B200/B300, GB200/GB300, GB10 y RTX PRO.
- GPU de consumo: los quants de menor tamaño (Q4_K_M, Q5_K_S) caben en GPUs de 24 GB como la RTX 4090, aunque con margen ajustado al sumar contexto y procesamiento de imagen; Q6 y Q8_0 requieren 32 GB o más.
- Opciones de despliegue: llama.cpp (incluido `llama-server` con carga directa desde el repo de Hugging Face), y en general cualquier runtime compatible con GGUF. vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Inkling-2-Mini-Astral-GGUF | 26,07 B | 3,4 B | no disponible | Apache 2.0 | GGUF |
| thinkingmachines/Inkling-2-Mini | 26,4 B | 3,4 B | no disponible | Apache 2.0 | safetensors |
| Alternativas de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación natural es con el modelo base sin cuantizar, que ofrece la misma arquitectura y licencia pero mayor peso en disco y VRAM. No se dispone de información sobre otros modelos comparables de la misma categoría (MoE multimodal de ~26 B) en los datos proporcionados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, es esperable un rendimiento inferior en otros idiomas.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de OCR o interpretación de imágenes complejas.
- Idiomas: el soporte multilingüe se describe como "general", sin lista cerrada de idiomas ni evaluaciones por idioma.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar despliegues con ventanas largas sin verificarlo en el modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar la licencia y condiciones del modelo base original.
- Producción: las cuantizaciones Q4_K_M y Q5_K_S pierden algo de fidelidad (KL ~0,006 y ~0,004); para tareas sensibles a la precisión se recomienda Q6 o Q8_0.
- Compatibilidad multimodal: el autor no detalla cómo se gestiona el codificador de imagen en GGUF ni si todas las variantes conservan plenamente la capacidad visual; conviene validarlo antes de desplegar.
- Fecha del modelo: publicado en noviembre de 2026; verificar que el resto del ecosistema (llama.cpp, runtimes) soporte la arquitectura `inkling2_loop`.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/synthetic-minds/Inkling-2-Mini-Astral-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Web de Synthetic Minds: https://www.syntheticmindslab.com
- Información sobre Astral-Q: https://www.syntheticmindslab.com/astral
- Lista de espera de Astral-Q: https://www.syntheticmindslab.com/astral
- Colección de cuantizaciones GGUF: https://hf.co/collections/synthetic-minds/astral-gguf-quants
- GitHub de Synthetic Minds: https://github.com/syntheticminds-lab
- Perfil de Hugging Face: https://huggingface.co/synthetic-minds
- X (empresa): https://x.com/syntheticminds2
- X (Tudor): https://x.com/tudoriustin_
- LinkedIn: https://www.linkedin.com/company/synthetic-minds-lab/
- Buy Me a Coffee: https://buymeacoffee.com/syntheticminds_lab
