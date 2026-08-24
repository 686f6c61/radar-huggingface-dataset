# YTan2000/Ornith-1.5-35B-A3B-TQ3_4S

## Resumen

`Ornith-1.5-35B-A3B-TQ3_4S` es una compilación GGUF cuantizada con la técnica TurboQuant (tipo de tensor `TQ3_4S`, 4.06 bits por peso) del modelo base `ornith-ai/Ornith-1.5-35B-A3B`, desarrollado por el equipo de Ornith AI. Se trata de un modelo de arquitectura MoE (mixture of experts) basado en Qwen3.5, con 35.9 mil millones de parámetros totales pero solo unos 3 mil millones activos por token, lo que permite una inferencia muy rápida incluso en hardware de consumo. El modelo es multimodal: soporta entrada de imágenes mediante un proyector de visión opcional (`mmproj`), aunque la compilación GGUF aquí presentada se centra en el componente de texto.

La relevancia de esta ficha radica en que ofrece una versión cuantizada y optimizada para ejecución local en GPU de gama media-alta (validada en una RTX 3090 de 24 GiB), alcanzando velocidades de generación de 175 tokens por segundo. Sin embargo, requiere un runtime específico (`llama.cpp-tq3`) que no es compatible con las compilaciones estándar de `llama.cpp`, lo que condiciona su despliegue. El modelo base destaca por su enfoque de auto-mejora (self-scaffolding y self-improvement) y por superar a modelos densos de tamaño similar en tareas de código y agénticas, según los datos publicados por el autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-MoE (qwen35moe) |
| Parametros totales | 35.9B (35.505.251.456 en safetensors) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 262.144 (fuente) |
| Tipos de cuantizacion | TQ3_4S (4.06 BPW) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base `Ornith-1.5-35B-A3B` emplea una arquitectura MoE con 256 expertos, de los cuales se activan 8 por token, distribuidos en 41 bloques. Una característica distintiva es que solo cada cuarta capa usa atención completa; las tres cuartas partes restantes utilizan capas SSM basadas en DeltaNet, una combinación híbrida que reduce el coste computacional manteniendo la capacidad de modelado de contexto largo. El contexto máximo declarado es de 262.144 tokens.

En cuanto al entrenamiento, el modelo base sigue el paradigma de auto-mejora de Ornith-1.5: el propio modelo propone nuevas tareas, genera andamiajes específicos (scaffolds) y produce rollouts de soluciones para aprendizaje por refuerzo, creando un bucle continuo de auto-supervisión. No se dispone de datos concretos sobre el número de tokens de entrenamiento ni sobre el uso de RLHF o DPO. La cuantización TQ3_4S es una técnica propietaria de TurboQuant que requiere un fork de `llama.cpp` para su ejecución; no es compatible con las compilaciones estándar.

## Capacidades

- Generación de texto y razonamiento: el modelo es capaz de producir respuestas coherentes y razonadas, aunque con `--reasoning off` se prioriza la velocidad sobre la profundidad del razonamiento.
- Generación de código: según los benchmarks locales, alcanza un 93.8% de acierto en tareas de codificación, competitivo con modelos densos de 35B.
- Tool calling / function calling: soportado, con un 91.7% de éxito en tareas de llamada a herramientas.
- Extracción de datos: muestra un 85.8% de precisión en tareas de extracción estructurada de información.
- Capacidades multimodales: el modelo base es multimodal; la entrada de imágenes se habilita cargando el proyector de visión (`mmproj-f16.gguf`) con `--mmproj`.
- Seguimiento de instrucciones: presenta un rendimiento moderado (64.5%) en tareas con múltiples restricciones complejas.
- Multilingüismo: aunque la model card declara solo inglés, al estar basado en Qwen3.5 podría heredar capacidades multilingües, pero no hay evidencia publicada en esta ficha.

## Casos de uso

- Asistente de programación en local: el modelo puede integrarse en un IDE o CLI para autocompletar código, generar funciones y explicar fragmentos, gracias a su alta velocidad (175 tok/s) y buen rendimiento en tareas de codificación. Es adecuado para desarrolladores que necesitan respuestas rápidas sin depender de la nube.
- Agente autónomo con tool calling: su soporte nativo de function calling permite construir agentes que consultan APIs, ejecutan comandos o interactúan con bases de datos. El 91.7% de éxito en tool calling lo hace viable para prototipos de automatización.
- Extracción de datos de documentos: con un 85.8% de precisión en extracción, puede procesar textos largos (hasta 262k tokens) para extraer entidades, resumir informes o estructurar información no homogénea.
- Chatbot de atención al cliente: su contexto largo y capacidad de conversación multi-turno permiten gestionar historiales extensos de usuario. La licencia MIT facilita su integración en productos comerciales.
- Análisis de imágenes con texto: al ser multimodal, puede describir imágenes, responder preguntas sobre su contenido o extraer texto de capturas, siempre que se cargue el proyector de visión.
- Investigación y experimentación con MoE: su arquitectura híbrida (atención + SSM DeltaNet) y su cuantización TQ3_4S ofrecen un caso de estudio interesante para investigadores que quieran evaluar el equilibrio entre rendimiento y eficiencia en modelos de mezcla de expertos.

## Benchmarks y rendimiento

Los siguientes resultados son mediciones locales realizadas por el autor de la compilación GGUF, no benchmarks oficiales del modelo base. Se ejecutaron con `--reasoning off` para maximizar la velocidad.

| Suite | Score | Tasa de acierto | Velocidad media |
|---|---|---|---|
| Coding | 93.8% | 11/12 tareas | 175 tok/s |
| Tool Calling | 91.7% | 13/15 tareas | 160 tok/s |
| Data Extraction | 85.8% | 10/15 tareas | 176 tok/s |
| Instruction Following | 64.5% | 5/15 tareas | 179 tok/s |
| Hard86 Coding | 47.7% | 41/86 tests | 81.3 tok/s |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. Los datos del modelo base (según ModelScope) indican que supera a Qwen 3.6-35B y a modelos densos como Gemma 4-31B, pero no se aportan cifras concretas en esta ficha.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF ocupa 17.00 GiB; con contexto de 32.768 tokens y offload completo (`-ngl 99`) se valida en una GPU con 24 GiB de VRAM (RTX 3090 FE). Con menos VRAM se debe reducir el contexto.
- GPU recomendadas: RTX 3090 (validada), RTX 4090, A100, H100 o cualquier GPU con al menos 24 GiB de VRAM y soporte CUDA. Para GPUs con arquitectura específica, se puede añadir `-DCMAKE_CUDA_ARCHITECTURES` en la compilación.
- Compatibilidad con GPU de consumo: sí, cabe en una RTX 3090/4090, pero requiere el runtime custom `llama.cpp-tq3`; las compilaciones estándar de `llama.cpp` no pueden cargar el modelo.
- Opciones de despliegue: `llama-server` del fork `turbo-tan/llama.cpp-tq3`. No es compatible con vLLM, Ollama ni TGI sin adaptaciones.
- Latencia y throughput: 175 tok/s de generación (excluyendo procesamiento de prompt) medidos en RTX 3090 con las opciones de lanzamiento indicadas en la model card.

## Comparativa con modelos similares

No se dispone de datos comparativos directos de esta cuantización frente a otras alternativas. El modelo base `Ornith-1.5-35B-A3B` se posiciona frente a:

| Modelo | Parámetros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (base) | 35.9B | ~3B | 262k | MIT | MoE híbrido con SSM DeltaNet |
| Qwen3.5-35B-A3B (hipotético) | ~35B | ~3B | no disponible | no disponible | Modelo base de Ornith, sin datos publicados |
| Gemma 4-31B | 31B (denso) | 31B | no disponible | no disponible | Denso, superado por Ornith según ModelScope |

No se han encontrado comparativas con otras cuantizaciones GGUF del mismo modelo (p. ej., Q4_K_M o Q5_K_M) en la información proporcionada.

## Limitaciones y advertencias

- Requiere un runtime específico (`llama.cpp-tq3`); las compilaciones estándar de `llama.cpp` no pueden cargar el modelo, lo que limita su portabilidad.
- El seguimiento de instrucciones complejas es débil (64.5%), por lo que no es recomendable para tareas con múltiples restricciones simultáneas.
- Los benchmarks publicados son mediciones locales del autor de la cuantización, no resultados oficiales del modelo base; deben interpretarse con cautela.
- Solo se declara soporte para inglés; el uso en otros idiomas no está garantizado.
- La licencia MIT se aplica a la compilación GGUF, pero el uso del modelo base está sujeto a la licencia de `ornith-ai/Ornith-1.5-35B-A3B` y a la del runtime `turbo-tan/llama.cpp-tq3`.
- El modelo es multimodal, pero el proyector de visión (`mmproj`) no está incluido en este repositorio; debe obtenerse por separado.
- No se recomienda usar decodificación especulativa con MTP (multi-token prediction) en esta versión, ya que no es una release MTP.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/YTan2000/Ornith-1.5-35B-A3B-TQ3_4S
- Modelo base en HuggingFace: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Página oficial de Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Guía de Ornith AI: https://ornith.online/
- Modelo base en ModelScope: https://www.modelscope.cn/models/ornith-ai/Ornith-1.5-35B-A3B
- Runtime requerido (llama.cpp-tq3): https://github.com/turbo-tan/llama.cpp-tq3
