# yabaimimi/EldritchLabs__Aura-Prototype-26B-A4B-EXL3

## Resumen

EldritchLabs__Aura-Prototype-26B-A4B-EXL3 es una cuantización EXL3 del modelo EldritchLabs/Aura-Prototype-26B-A4B, publicada por el usuario yabaimimi. El modelo base es un merge de tipo image-text-to-text de 26B de parámetros construido con Transformers y generado mediante mergekit con el método experimental "aura", que incluye un visualizador de mapas de calor en vivo y requirió aproximadamente 10 horas de procesado. Esta versión concreta es solo texto: el soporte de visión ha sido desactivado explícitamente por el autor de la cuantización.

La relevancia de esta ficha es doble. Por un lado, documenta un formato de cuantización poco habitual (EXL3, orientado al motor exllamav3 y a TabbyAPI) aplicado a un modelo de mezcla de 26B. Por otro lado, el modelo base integra varios modelos preentrenados (Gandalf69/Adversary-26B-A4B-v0, TheDrummer/Orion-26B-A4B-v1.1, Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 y electroglyph), lo que lo sitúa en la categoría de merges experimentales orientados a razonamiento y conversación.

La información pública disponible es muy limitada: no hay pipeline declarado, no se especifican idiomas y no se han publicado resultados de benchmarks ni detalles de entrenamiento. El repositorio ocupa 148,2 GB, un tamaño coherente con pesos de precisión alta o con múltiples variantes de cuantización EXL3 almacenadas en el mismo repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base construido con Transformers; el merge se generó con mergekit) |
| Parametros totales | 26B (heredado del modelo base Aura-Prototype-26B-A4B) |
| Parametros activos | no disponible (el sufijo A4B sugiere una arquitectura de mezcla de expertos, pero no se confirma en la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 (exllamav3); el repositorio incluye además la etiqueta QTIP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (exllamav3), pensado para TabbyAPI; no se indica presencia de safetensors o GGUF |
| Modelo base | EldritchLabs/Aura-Prototype-26B-A4B |
| Herramienta de cuantización | exllamav3 v1.6.6 |
| Modalidad | Solo texto (visión desactivada) |
| Tamaño del repositorio | 148,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo base es un merge de varios modelos preentrenados de 26B, generado con mergekit y el método experimental "aura". Según la información disponible, integra Gandalf69/Adversary-26B-A4B-v0, TheDrummer/Orion-26B-A4B-v1.1, Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 y electroglyph. No se detallan los hiperparámetros del merge, la proporción de cada modelo ni si hubo etapas posteriores de ajuste fino, RLHF o DPO.

El sufijo A4B del nombre sugiere una arquitectura de mezcla de expertos con aproximadamente 4B de parámetros activos por token, patrón habitual en modelos tipo MoE, pero esta información no se confirma en la documentación disponible y debe tratarse como no verificada. La cuantización EXL3 la realizó el publicador con exllamav3 v1.6.6, un formato propietario del ecosistema ExLlamaV3 orientado a inferencia eficiente en GPU. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni innovaciones técnicas del modelo base.

## Capacidades

- Generación de texto conversacional y de razonamiento, heredada de los modelos que componen el merge (incluido un modelo con "Reasoning" en el nombre).
- Capacidad de visión desactivada explícitamente en esta versión: el modelo es solo texto.
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado, aunque el componente Pantheon-Reasoning sugiere capacidades de razonamiento.
- Capacidades multilingües: no disponibles; no se declaran idiomas en la model card.
- Modo thinking explícito: no disponible.
- Inferencia optimizada mediante EXL3 y TabbyAPI, con posible uso de decodificación especulativa del motor exllamav3 (no confirmado para esta cuantización).

## Casos de uso

- Despliegue local en GPU con TabbyAPI: la cuantización EXL3 está pensada para el motor exllamav3 y la API TabbyAPI, por lo que encaja en entornos de inferencia autoalojados que buscan menor huella de memoria que los pesos originales.
- Experimentación con merges: útil para investigadores que quieran evaluar el comportamiento del merge Aura sin cargar los pesos completos, comparando la versión EXL3 con el modelo base.
- Generación de texto conversacional en producción interna: al ser solo texto y con licencia Apache 2.0, puede integrarse en asistentes internos sin restricciones comerciales adicionales conocidas.
- Razonamiento asistido en tareas de análisis: el componente de razonamiento del merge puede aprovecharse en tareas de resumen, clasificación y respuesta a preguntas, siempre que se validen los resultados por la falta de benchmarks.
- Base para ajuste fino posterior: al ser un modelo de 26B con licencia permisiva, puede servir como punto de partida para fine-tuning específico de dominio, aunque el formato EXL3 requeriría reconvertir a pesos de precisión completa.
- Evaluación comparativa de formatos de cuantización: permite medir la degradación de calidad de EXL3 frente a otros formatos (GGUF, AWQ, GPTQ) sobre el mismo modelo base.
- Prototipado rápido de chatbots: su tamaño de 26B y la posibilidad de ejecutarlo con exllamav3 lo hacen adecuado para prototipos que necesitan más capacidad que modelos de 7B-8B sin llegar a modelos de 70B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio ocupa 148,2 GB, lo que sugiere que contiene varias variantes de cuantización EXL3. Una cuantización EXL3 típica de un modelo de 26B requeriría del orden de 13-16 GB en 4 bits, pero este dato no se confirma en la información disponible.
- GPU recomendadas: no disponibles. Por tamaño del modelo base (26B), serían necesarias GPU con al menos 24 GB de VRAM para cuantizaciones agresivas y 48-80 GB para precisiones mayores, pero no hay confirmación del autor.
- ¿Cabe en GPU consumer? No confirmado. Podría caber en RTX 4090 (24 GB) con cuantización EXL3 de 4 bits, pero no hay datos verificados.
- Opciones de despliegue: TabbyAPI con exllamav3 (soporte nativo del formato EXL3). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no soportan EXL3 de forma nativa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| EldritchLabs__Aura-Prototype-26B-A4B-EXL3 | 26B | no disponible | Apache 2.0 | EXL3 | Solo texto, cuantización EXL3 |
| EldritchLabs/Aura-Prototype-26B-A4B (base) | 26B | no disponible | Apache 2.0 | Transformers | Incluye visión; punto de partida del merge |
| Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2 | 26B | no disponible | no disponible | no disponible | Componente del merge, orientado a razonamiento |
| TheDrummer/Orion-26B-A4B-v1.1 | 26B | no disponible | no disponible | no disponible | Componente del merge, orientado a conversación |

La comparativa se limita a los modelos citados en la información disponible; no se dispone de datos de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- No se han publicado benchmarks: no hay evidencia verificable de calidad, por lo que no se recomienda su uso en producción sin evaluación previa.
- Modelo experimental: el merge "aura" se describe como experimental y el modelo se etiqueta como "Prototype".
- Visión desactivada: esta versión no procesa imágenes, a diferencia del modelo base.
- Idiomas no declarados: no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos; sin datos de evaluación no puede cuantificarse.
- Sesgos: no documentados; los merges heredan los sesgos de sus componentes sin que se haya realizado un análisis específico.
- Licencia Apache 2.0: permite uso comercial, pero la model card impone condiciones adicionales de responsabilidad y mayoría de edad que el usuario acepta al descargar el modelo.
- Formato EXL3: requiere herramientas específicas (exllamav3/TabbyAPI) y no es portable a otros motores de inferencia sin reconversión.
- Repositorio de 148,2 GB: la descarga completa puede ser costosa en almacenamiento y ancho de banda.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación por terceros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yabaimimi/EldritchLabs__Aura-Prototype-26B-A4B-EXL3
- Modelo base: https://huggingface.co/EldritchLabs/Aura-Prototype-26B-A4B
- Ficha en featherless.ai: https://featherless.ai/models/EldritchLabs/Aura-Prototype-26B-A4B
- Componente del merge: https://huggingface.co/Gandalf69/Adversary-26B-A4B-v0
- Componente del merge: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- Componente del merge: https://huggingface.co/Gryphe/Pantheon-Reasoning-26B-A4B-1.1-V2
