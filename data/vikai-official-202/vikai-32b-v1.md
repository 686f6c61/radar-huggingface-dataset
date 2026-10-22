# vikai-official-202/vikai-32b-v1

## Resumen

VikAI 32B v1 es un ajuste fino del modelo Qwen2.5-32B-Instruct publicado por el usuario `vikai-official-202`, orientado a crear un asistente conversacional con identidad propia ("VikAI") especializado en roman urdu e inglés. El autor describe el proceso como un QLoRA (r=32, alpha=32, LR 1e-5, 2 épocas) sobre 1.382 filas "gold" que cubren identidad, chat multilingüe y algo de código y razonamiento, seguido de un merge en el modelo base en bf16 y una cuantización AWQ W4A16 simétrica con `llmcompressor`.

Es relevante no por su rendimiento —no hay benchmarks públicos ni descargas— sino como ejemplo de pipeline completo de personalización y cuantización: adaptador LoRA separado, merge en precisión completa y cuantización de 4 bits calibrada con textos del propio dominio, publicada en formato `compressed-tensors`. Es, en la práctica, un caso de estudio de cómo empaquetar un modelo de 32B para inferencia en una sola GPU de 24 GB.

Conviene señalar una discrepancia de metadatos: los safetensors declaran 5.702.752.128 elementos, mientras que el nombre del repositorio y el modelo base indican 32B. El tamaño del repositorio (19,2 GB) es coherente con un modelo de 32B cuantizado a 4 bits, por lo que el recuento de safetensors probablemente refleja tensores int32 empaquetados (ocho pesos por elemento) en lugar del número de parámetros del modelo denso. No hay verificación independiente de este punto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), densa; cuantización AWQ W4A16 simétrica vía `llmcompressor` / `compressed-tensors` |
| Parámetros totales | ≈32 000 M según el modelo base Qwen2.5-32B-Instruct; el metadata de safetensors declara 5.702.752.128 elementos (compatible con tensores empaquetados W4A16). Sin verificación independiente |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la model card; heredada de Qwen2.5-32B-Instruct (32.768 tokens nativos, ampliable a 131.072 con YaRN según la documentación del modelo base) |
| Tipos de cuantización | AWQ 4 bits, pesos W4A16 simétricos; calibración con textos SFT "gold" del propio dominio. No se publican GGUF ni otras variantes |
| Idiomas soportados | Urdu (roman urdu) e inglés, según los tags del repositorio; el modelo base es multilingüe |
| Licencia | Apache-2.0 |
| Formato de pesos | `safetensors` en formato `compressed-tensors` (AWQ); sin versiones GGUF, GPTQ ni bf16 publicadas en este repositorio |

## Arquitectura y entrenamiento

La base es Qwen2.5-32B-Instruct, un transformer decoder-only denso de la familia Qwen2, con atención por grupos de consultas y RoPE. Sobre ella se aplicó un QLoRA con rango 32, alpha 32, tasa de aprendizaje 1e-5 y 2 épocas sobre un conjunto de 1.382 filas descrito como "gold", centrado en tres ejes: identidad del asistente (VikAI), conversación en roman urdu e inglés, y una pequeña muestra de código y razonamiento. El adaptador se publica por separado en `vikai-official-202/vikai-32b-v1-adapter`.

El merge se hizo sobre el modelo base en bf16, no sobre la versión cuantizada, lo cual es la práctica correcta para evitar degradación acumulada. Posteriormente se aplicó una cuantización AWQ W4A16 simétrica con `llmcompressor`, usando como conjunto de calibración textos del propio SFT, lo que sesga la calibración hacia el dominio de destino (bueno para ese dominio, potencialmente peor para uso general). El autor reporta un "eval gate" interno de 30/30 en código y 30/30 en razonamiento a nivel de adaptador, y una revalidación tras la cuantización de 10/10 en código, 10/10 en razonamiento y 13/14 en identidad. No son benchmarks estandarizados ni incluyen el conjunto de evaluación completo.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y roman urdu, con registro coloquial.
- Encarnación de una identidad concreta de asistente ("VikAI"), incluyendo respuestas sobre sí mismo.
- Capacidades heredadas del modelo base: razonamiento de varios pasos, matemáticas de nivel escolar y universitario básico, y generación de código en lenguajes habituales.
- Soporte de tool calling y function calling, heredado de Qwen2.5-32B-Instruct (la model card no documenta plantilla específica ni ejemplos de uso).
- Capacidad de seguir instrucciones con formato de system prompt, incluyendo el "system layer" mencionado por el autor.
- Multilingüismo parcial: el foco declarado es ur/en, pero el base conserva competencia en otros idiomas, no evaluada en esta ficha.
- No se declaran capacidades de visión, audio, modo "thinking" explícito ni decodificación especulativa.

## Casos de uso

- Asistente conversacional para hablantes de roman urdu: el modelo está ajustado específicamente sobre esa variedad escrita informal, habitual en Pakistán y en comunidades de la diáspora, donde los modelos generalistas suelen responder en urdu formal o derivar al inglés.
- Atención al cliente en mercados de ur/en: con 32.768 tokens de contexto heredados, admite conversaciones multi-turno con historial largo e inserción de documentación de producto.
- Normalización y localización lingüística: conversión de roman urdu a urdu formal o a inglés para pipelines de moderación, búsqueda o publicación de contenido.
- Asistencia a la programación en inglés: el base rinde bien en generación de código y el ajuste declara no haber degradado esa capacidad (30/30 en su gate interno), lo que permite usarlo como copiloto en un único despliegue junto al chat.
- Despliegue on-premise en una sola GPU de 24 GB: al estar en AWQ 4 bits, un modelo de 32B cabe en una RTX 4090 o L4/A10 de 24 GB, lo que habilita escenarios con requisitos de soberanía de datos sin clúster multi-GPU.
- Personalización de marca sobre un modelo abierto: el repositorio sirve de plantilla reproducible (adaptador LoRA separado, merge en bf16, cuantización con `llmcompressor`) para crear asistentes con identidad propia partiendo de Qwen2.5.
- Extracción de información estructurada de conversaciones informales en roman urdu: nombres, direcciones y pedidos, con salida en JSON vía instrucciones de formato.
- Evaluación de pipelines de cuantización: comparar el comportamiento del adaptador antes y después de AWQ usando los mismos conjuntos internos de verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multilingües estándar (por ejemplo, MMMLU o Belebele) para este modelo.

El autor solo aporta verificaciones internas de aceptación, que no son comparables con benchmarks públicos:

| Verificación interna | Etapa adaptador (bf16) | Etapa AWQ 4 bits |
|---|---|---|
| Código | 30/30 | 10/10 |
| Razonamiento | 30/30 | 10/10 |
| Identidad | No disponible | 13/14 |

Se desconoce el contenido, la dificultad y el origen de estos conjuntos, así como si hubo contaminación con los datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos AWQ 4 bits de un modelo de 32B ocupan aproximadamente 16-17 GB; con caché KV, activaciones y overhead del runtime, el consumo realista se sitúa en 19-22 GB. El repositorio pesa 19,2 GB.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S 48 GB para producción con contexto largo y concurrencia; A100 80 GB si se usa la ventana de 131.072 tokens con YaRN.
- GPU de consumo: cabe en RTX 4090 / RTX 3090 (24 GB) de forma ajustada, con contexto limitado y concurrencia baja; no cabe en tarjetas de 16 GB ni de 12 GB en esta cuantización.
- Opciones de despliegue: vLLM (soporta el formato `compressed-tensors` y kernels AWQ), así como el ecosistema `llmcompressor` / `compressed-tensors` para servir o recuantizar. `llama.cpp`, Ollama y LM Studio no pueden cargar directamente este formato; no hay GGUF publicado, por lo que requeriría una conversión propia.
- Latencia y throughput estimados: no disponibles. No hay datos publicados de tokens por segundo ni de latencia por petición, y la ausencia de despliegues conocidos impide inferirlos con fiabilidad.
- Nota de compatibilidad: al ser AWQ W4A16, requiere kernels con soporte de `int4` (Marlin, AWQ de vLLM o TensorRT-LLM). En entornos sin esos kernels la carga fallará o caerá a un camino lento.

## Comparativa con modelos similares

Datos de los modelos comparados tomados de su documentación pública, no de la información proporcionada para este repositorio.

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vikai-32b-v1 | ≈32B | No especificado (base: 32.768) | AWQ W4A16 (`compressed-tensors`) | Apache-2.0 | 0 descargas, 0 likes; repo publicado en 2026-10-22 |
| Qwen2.5-32B-Instruct | 32,5B | 32.768 nativo / 131.072 con YaRN | bf16, AWQ y GPTQ oficiales | Apache-2.0 | Muy extendido, amplia validación comunitaria |
| Qwen2.5-32B-Instruct-AWQ | 32,5B | 32.768 nativo | AWQ 4 bits oficial | Apache-2.0 | Ampliamente usado; referencia para comparar la calidad de la cuantización |
| Gemma 2 27B Instruct | 27B | 8.192 | bf16 y variantes comunitarias | Términos de uso de Gemma (no Apache-2.0) | Muy extendido, pero con restricciones de licencia distintas |

Frente a la versión oficial AWQ de Qwen, este modelo aporta el ajuste de identidad y roman urdu, pero carece de la validación y el soporte del ecosistema. Frente a Gemma 2 27B, la licencia Apache-2.0 y la ventana de contexto son ventajas claras, aunque Gemma 2 tiene evaluaciones publicadas.

## Limitaciones y advertencias

- El ajuste se hizo sobre 1.382 filas, un volumen muy reducido para un modelo de 32B; el riesgo de olvido catastrófico y de sobreajuste a la identidad es alto, y no se han publicado evaluaciones que lo descarten.
- El "eval gate" del autor usa conjuntos propios de 10 a 30 ejemplos, sin dificultad conocida ni control de contaminación; no acredita calidad general ni superioridad frente al base.
- Riesgo de alucinación: sin benchmarks y con un ajuste de identidad fuerte, el modelo puede generar afirmaciones inventadas sobre sí mismo, sobre su creador o sobre sus capacidades.
- El roman urdu carece de ortografía estandarizada, por lo que la calidad y consistencia de salida variarán según la convención del usuario; no hay evaluación multilingüe publicada.
- La calibración AWQ se hizo con textos del dominio de entrenamiento, lo que puede degradar el rendimiento fuera de ese dominio (por ejemplo, matemáticas avanzadas o código en lenguajes poco frecuentes) más de lo habitual en una cuantización calibrada con datos generales.
- El modelo no declara `pipeline_tag` en HuggingFace y tiene 0 descargas y 0 likes: no ha pasado por ninguna validación de la comunidad. No debe asumirse que funciona como un asistente listo para producción sin evaluación propia.
- La fecha de creación del repositorio (2026-10-22) es posterior a la de la mayoría de modelos de referencia y no se ha podido contrastar.
- Discrepancia de metadatos entre el nombre (32B) y el recuento de safetensors (5,70 mil millones de elementos); aunque la explicación más probable es el empaquetado W4A16, conviene verificarlo cargando el modelo antes de dimensionar infraestructura.
- Licencia Apache-2.0, que permite uso comercial, pero el modelo conserva las obligaciones de atribución razonable del modelo base y no incluye garantías; el autor no ofrece ningún compromiso de mantenimiento.
- No hay versión GGUF, de modo que el despliegue en CPU o en hardware de consumo pequeño requiere una conversión manual con pérdida adicional de calidad.

## Enlaces

- [Modelo en HuggingFace: vikai-official-202/vikai-32b-v1](https://huggingface.co/vikai-official-202/vikai-32b-v1)
- Adaptador LoRA: `vikai-official-202/vikai-32b-v1-adapter` (referenciado en la model card; no se ha verificado su URL pública)
- [Modelo base: Qwen/Qwen2.5-32B-Instruct](https://huggingface.co/Qwen/Qwen2.5-32B-Instruct)
- [llmcompressor](https://github.com/vllm-project/llmcompressor) (herramienta de cuantización citada por el autor)
- [compressed-tensors](https://github.com/neuralmagic/compressed-tensors) (formato de pesos utilizado)
- No se han encontrado enlaces relevantes en la búsqueda web: los resultados devueltos corresponden a traducciones de canciones y no guardan relación con el modelo. No se dispone de paper, blog, demo ni repositorio de código adicionales.
