# UNI-PIC/Retail-TW-VL-Qwen3.5-9B-Base-Preview

## Resumen

Retail-TW-VL-Qwen3.5-9B-Base-Preview es un checkpoint vision-language desarrollado por President Information Corp. (PIC, 統一資訊) y Uni-President Information Philippines Corp. (UNI-PIPC) mediante preentrenamiento continuado (continual pre-training, CPT) sobre el modelo base Qwen/Qwen3.5-9B-Base. Su objetivo es adaptar un modelo multimodal de propósito general al dominio del comercio minorista y el comercio electrónico de Taiwán, incorporando conocimiento de productos, marcas y variantes léxicas en chino tradicional junto con las imágenes de producto asociadas.

El modelo emplea la arquitectura híbrida Gated DeltaNet–Gated Attention propia de la familia Qwen3.5 y se distribuye como checkpoint base: no está ajustado con instrucciones ni alineado en seguridad, por lo que su uso previsto es como cimiento para un ajuste supervisado (SFT) posterior en tareas concretas del dominio retail. El entrenamiento se realizó con el framework ms-swift sobre 4 GPU NVIDIA H100 de 96 GB.

La relevancia del modelo radica en su enfoque de adaptación de dominio con anclaje visual: el emparejamiento imagen-texto de listados de producto mejora de forma medible la modelización del lenguaje del dominio (bits per byte en held-out de 0,339 con imagen frente a 0,558 sin ella), y se complementa con una mezcla de replay de texto general para preservar capacidades lingüísticas y multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer híbrido Gated DeltaNet–Gated Attention (familia Qwen3.5) |
| Parametros totales | 1.469.680 (según safetensors del repo); el nombre del modelo indica 9B, dato no confirmado en la información disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino tradicional (zh-TW, principal), chino simplificado (zh-CN), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B-Base y conserva su arquitectura híbrida de atención (Gated DeltaNet combinada con Gated Attention), orientada a modelar secuencias largas con coste eficiente. Sobre esa base se aplicó un preentrenamiento continuado con ms-swift en 4 GPU H100 de 96 GB, sin ajuste por instrucciones ni alineación de seguridad.

El corpus de CPT suma 2,56B tokens de texto (las imágenes de producto no se contabilizan en ese recuento). La mezcla se compone de un 53,7 % (1,38B tokens) de listados de producto taiwaneses propietarios —7,30M listados en 15 categorías retail, cada uno emparejado con su imagen—, un 26,3 % (674,4M tokens) de una wiki sintética de retail taiwanés y un 20,0 % (512,9M tokens) de datos de replay. La wiki sintética incluye marcas y contribuyentes generados con NVIDIA NeMo Data Designer, junto con variantes de nombre (alias, nombres en lenguas extranjeras, transcripciones en zhuyin y pinyin y errores tipográficos). El replay combina Wikipedia en zh-TW, zh-CN y en con pares de traducción en↔zh para preservar la capacidad lingüística general. Se reservó un 0,1 % de cada conjunto como validación.

## Capacidades

- Modelización de texto e imagen en modalidad image-text-to-text (pipeline declarado).
- Conocimiento de dominio retail y e-commerce de Taiwán: 7,30M listados de producto en 15 categorías con sus imágenes.
- Grounding de imagen de producto: la información visual aporta señal medible al modelado del texto asociado.
- Cobertura léxica de marcas y productos en chino tradicional, incluyendo alias, nombres extranjeros, zhuyin, pinyin y erratas.
- Capacidad multilingüe limitada a zh-TW, zh-CN y en, con retención reforzada mediante replay y pares de traducción.
- Generación de texto base (no instruct): no se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Ajuste supervisado para clasificación de productos: partir de este checkpoint para entrenar un clasificador de categorías retail (15 categorías documentadas) usando texto e imagen del listado, aprovechando que el CPT ya ha visto listados reales emparejados con sus imágenes.
- Búsqueda y matching multimodal en catálogo: usar las representaciones del modelo como base para un sistema que relacione una foto de producto con su ficha textual en chino tradicional, apoyándose en el entrenamiento imagen-texto del checkpoint.
- Normalización de nombres de producto: emplear el conocimiento de alias, nombres extranjeros, zhuyin, pinyin y erratas para construir un pipeline de canonicalización de nombres de marca y producto antes de indexar el catálogo.
- Descripción automática de fichas de producto: tras un SFT específico, generar descripciones en chino tradicional a partir de la imagen y los atributos del listado, con vocabulario de dominio ya interiorizado.
- Asistencia a atención al cliente en retail taiwanés: base para un modelo conversacional (previa SFT y alineación) que entienda terminología de producto local y consultas en chino tradicional.
- Extracción de atributos desde imagen de producto: punto de partida para tareas de visión aplicada a estantería o packaging, aprovechando que el modelo ha sido expuesto a imágenes de producto del dominio durante el CPT.
- Investigación sobre adaptación de dominio multimodal: referencia para estudiar el efecto del anclaje imagen-texto en la perplejidad del dominio, dado el contraste documentado de bits per byte (0,339 con imagen frente a 0,558 sin ella).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación aportado es la métrica de bits per byte en held-out del dominio: 0,339 con imagen y 0,558 sin imagen.

## Requisitos de hardware

- Entrenamiento documentado: 4× NVIDIA H100 de 96 GB con ms-swift.
- VRAM estimada para inferencia: no disponible en la información proporcionada; el repo ocupa 18,8 GB en safetensors, lo que orienta sobre el orden de magnitud en precisión nativa.
- GPU recomendadas: no disponible de forma explícita; por tamaño del checkpoint, se sitúa en el rango de GPU de datacenter (A100/H100) para precisión completa.
- Encaje en GPU de consumo: no confirmado; requeriría cuantización, cuyos formatos no se documentan.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con vLLM, llama.cpp, Ollama o TGI no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Retail-TW-VL-Qwen3.5-9B-Base-Preview | 9B (según nombre); 1.469.680 en safetensors | no disponible | Retail Taiwán, multimodal | Apache 2.0 | Hugging Face (UNI-PIC) |
| Qwen/Qwen3.5-9B-Base | 9B (según nombre) | no disponible | General, multimodal | no disponible en la información | Hugging Face (Qwen) |
| Alternativas de dominio retail en chino tradicional | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint base sin ajuste por instrucciones ni alineación de seguridad: no debe desplegarse directamente en producción conversacional sin SFT y alineación posteriores.
- Riesgo de alucinación no cuantificado; al ser un modelo de lenguaje base, puede generar contenido plausible pero incorrecto sobre productos o marcas.
- Cobertura idiomática restringida a zh-TW, zh-CN y en; el rendimiento fuera de estos idiomas no está documentado.
- Longitud de contexto no especificada, lo que impide planificar casos de uso con documentos largos.
- Sesgos potenciales derivados del corpus propietario de listados de producto taiwaneses y de la wiki sintética generada, no evaluados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero la procedencia de los datos propietarios de listados de producto no se detalla en la model card.
- Sin descargas ni likes en el momento de la ficha (0/0), lo que indica ausencia de validación comunitaria.
- Inconsistencia entre el tamaño indicado en el nombre (9B) y el recuento de parámetros de safetensors (1.469.680): conviene verificar el checkpoint antes de asignar recursos.

## Enlaces

- Hugging Face: https://huggingface.co/UNI-PIC/Retail-TW-VL-Qwen3.5-9B-Base-Preview
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Organización en Hugging Face: https://huggingface.co/UNI-PIC
- Web corporativa PIC: https://www.pic.net.tw/
- Web UNI-PIPC: https://www.pic.net.ph/
- Chat LumineOne AI: https://lumineai.pic.net.tw/
- GitHub PIC AI Team: https://github.com/pic-ai-team
- LinkedIn PIC: https://www.linkedin.com/company/president-information-corporation/
- LinkedIn UNI-PIPC: https://www.linkedin.com/company/uni-pipc/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
