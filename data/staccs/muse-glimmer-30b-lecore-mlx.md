# staccs/Muse-Glimmer-30B-lecore-mlx

## Resumen

Muse-Glimmer-30B-lecore-mlx es una cuantización de precisión mixta en formato MLX del modelo base meta-models/Muse-Glimmer-30B, publicada por el usuario staccs bajo licencia Apache 2.0. Su particularidad es que el ancho de bits de cada capa lineal no se elige de forma uniforme, sino mediante la herramienta leCore Unicron `requantize`, que mide el daño de cuantizar cada tensor por separado (divergencia KL sobre distribuciones de siguiente token) y asigna los bits de forma codiciosa hasta ajustarse a un presupuesto de tamaño de archivo.

El resultado es un conjunto de pesos de 16,01 GB (4,597 bpw efectivos) que se sitúa entre el bf16 de referencia y una cuantización MLX estándar de 3 bits en términos de perplejidad, pero con un tamaño considerablemente menor que el original. Todas las capas lineales del decoder quedan en 4 bits (416 tensores), con embeddings en 4 bits y lm_head en 6 bits, grupo de 64.

El modelo está pensado para ejecución en Apple Silicon mediante la librería mlx-lm. Es una exportación solo de texto: el puerto de Muse-Glimmer en mlx-lm no incluye la torre de visión, por lo que las capacidades multimodales del modelo base no están disponibles en este repositorio. La relevancia actual reside en que demuestra una metodología de cuantización guiada por medición que preserva mejor la calidad que los esquemas uniformes a presupuestos de bits comparables.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Muse-Glimmer-30B; detalles de arquitectura del base no disponibles en la información proporcionada) |
| Parámetros totales | 27.854.780.928 (~27,85 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX affine, precisión mixta: lineales 4 bits (416 tensores), embeddings 4 bits, lm_head 6 bits, grupo de 64; 4,597 bpw efectivos |
| Idiomas soportados | en (inglés) según la model card; lista completa no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 3 shards de ~5,3 GB cada uno |

## Arquitectura y entrenamiento

El modelo base Muse-Glimmer-30B es un transformer de aproximadamente 27,85 mil millones de parámetros. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documenta si emplea innovaciones como decodificación especulativa, atención lineal o arquitecturas híbridas.

La innovación de este repositorio concreto está en el proceso de cuantización. Cada tensor lineal del decoder se cuantizó de forma aislada (MLX affine, grupo 64 durante la medición) a 2, 3 y 4 bits, y se midió el daño como divergencia KL entre las distribuciones de siguiente token en fp16 y en la versión cuantizada, sobre una mezcla de calibración de 3066 tokens de WikiText-2 de entrenamiento, 1022 tokens de código Python y una sonda estructurada de leCore con prosa, código, SQL y markdown. La asignación de bits fue codiciosa: se parte de 4 bits en todas las capas y se aplica repetidamente la degradación con menor daño medido por byte ahorrado hasta encajar en el presupuesto de tamaño. La conversión final se realizó con `mlx_lm.convert` y un `quant_predicate` por capa. No hubo reentrenamiento.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, chat template incluida).
- Razonamiento y matemáticas: los resultados reportados en GSM8K (96,0% strict y flexible sobre los primeros 100 problemas del test) indican competencia en problemas aritméticos de varios pasos.
- Conocimiento general y respuesta a preguntas: MMLU 5-shot del 81,8% sobre el subconjunto evaluado.
- Generación y comprensión de código: la perplejidad medida sobre código Python (3,4615) es baja en términos absolutos, lo que sugiere buen modelado de ese dominio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: la model card declara únicamente inglés; no hay datos de otros idiomas.
- Visión: no disponible en esta exportación MLX (el puerto de mlx-lm carece de torre de visión; el repo GGUF complementario incluye un `mmproj` f16 para llama.cpp).

## Casos de uso

- Asistente de código en local sobre Apple Silicon: con 16,01 GB de pesos y una ventana KV configurable (`--max-kv-size`), puede ejecutarse en un Mac de 36 GB o más para autocompletar, explicar y refactorizar código Python, aprovechando la baja perplejidad medida en ese dominio.
- Prototipado de aplicaciones conversacionales en estación de trabajo: la chat template incluida y el pipeline text-generation permiten montar un chatbot multi-turno con mlx-lm sin depender de servicios en la nube, útil para desarrollo y pruebas de prompts con datos sensibles.
- Evaluación de técnicas de cuantización: el repositorio sirve como referencia práctica de cuantización guiada por medición (KL por tensor) frente a esquemas uniformes, con perplejidad y benchmarks reproducibles para comparar metodologías.
- Generación aumentada por recuperación (RAG) en本地: al ser solo texto y ejecutarse en local, encaja en pipelines que recuperan documentos y generan respuestas sin enviar contenido a terceros; la longitud de contexto real debe validarse empíricamente porque no está documentada.
- Resolución de problemas matemáticos y razonamiento estructurado: con un 96,0% en GSM8K sobre el subconjunto evaluado, es adecuado para asistentes educativos o verificación de cálculos en flujos internos, siempre con validación posterior.
- Desarrollo en entornos sin GPU NVIDIA: al estar en formato MLX, permite trabajar con un modelo de ~28B parámetros en Macs con memoria unificada, cubriendo escenarios de investigación y demos que no disponen de A100/H100.
- Fine-tuning ligero o experimentación con adaptadores: al partir de pesos cuantizados MLX de 4 bits mayoritarios, sirve como base para probar técnicas de adaptación de bajo rango en hardware de consumo Apple, aunque la cuantización limita la precisión disponible para el ajuste.

## Benchmarks y rendimiento

Datos reportados por el autor, medidos sobre los pesos publicados desquantizados a bf16 en GPU. MMLU 5-shot sobre las primeras 10 preguntas de cada una de las 57 materias; GSM8K 5-shot sobre los primeros 100 problemas del test (greedy, 320 tokens nuevos, sin chat template). Son subconjuntos, con un ruido de muestreo estimado de ±2–4 puntos.

| Modelo | MMLU (5-shot) | GSM8K strict | GSM8K flexible |
|---|---|---|---|
| leCore mix (este repo) | 81,8% | 96,0% | 96,0% |
| 3-bit affine estándar, grupo 64 (simulado) | 78,6% | 90,0% | 90,0% |

Perplejidad sobre held-out (WikiText-2 test y una porción distinta de código Python, secuencia 512):

| Modelo | Tamaño (GB, pesos) | bpw | WikiText-2 ppl (32704 tok) | Python-code ppl (8176 tok) |
|---|---|---|---|---|
| Referencia bf16 | – | 16 | 8,2001 | 3,2983 |
| Este repo (leCore Unicron mix) | 16,01 | 4,597 | 8,4699 | 3,4615 |
| MLX 3-bit estándar, grupo 64 | 12,19 | 3,500 | 9,8255 | 4,1635 |

No se ejecutaron benchmarks de tareas downstream más allá de los indicados.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos ocupan 16,01 GB; hay que sumar la caché KV, que depende de `--max-kv-size` (el ejemplo de uso emplea 8192).
- GPU recomendadas: Apple Silicon con memoria unificada. El autor indica que en un Mac de 36 GB puede ser necesario elevar el límite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=30000`.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con 32–36 GB o más de memoria unificada. Para GPU NVIDIA no es el formato adecuado; el autor publica un repo GGUF complementario (36,63 GB) para llama.cpp.
- Opciones de despliegue: mlx-lm (`mlx_lm.generate`, y por extensión `mlx_lm.server`); para llama.cpp existe la variante GGUF del mismo autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Calidad medida | Licencia |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-lecore-mlx (este repo) | ~27,85B | no disponible | MLX safetensors, 16,01 GB, 4,597 bpw | WikiText-2 ppl 8,4699; MMLU 81,8%; GSM8K 96,0% | Apache 2.0 |
| Muse-Glimmer-30B bf16 (base) | ~27,85B | no disponible | bf16, referencia | WikiText-2 ppl 8,2001; Python ppl 3,2983 | Apache 2.0 |
| Muse-Glimmer-30B MLX 3-bit estándar | ~27,85B | no disponible | MLX, 12,19 GB, 3,500 bpw | WikiText-2 ppl 9,8255; MMLU 78,6% (simulado); GSM8K 90,0% (simulado) | Apache 2.0 |
| Muse-Glimmer-30B-lecore-GGUF | ~27,85B | no disponible | GGUF (llama.cpp), 36,63 GB | no disponible | Apache 2.0 |

No se dispone de datos de otros modelos de ~30B comparables en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la exportación MLX no incluye torre de visión; las capacidades de imagen del modelo base no están disponibles aquí. La perplejidad y los benchmarks reportados son exclusivamente de texto.
- Idiomas: la model card declara únicamente inglés; el rendimiento en castellano u otros idiomas no está medido y puede degradarse.
- Contexto: la longitud de contexto del modelo base no está documentada en la información disponible; conviene validarla empíricamente antes de usarla en producción con documentos largos.
- Benchmarks sobre subconjuntos: MMLU se evaluó con 10 preguntas por materia y GSM8K con 100 problemas, con ruido de muestreo estimado de ±2–4 puntos. No son cifras directamente comparables con evaluaciones completas.
- La perplejidad de contexto corto no captura todos los aspectos de calidad; el propio autor recomienda verificar las salidas en el caso de uso concreto.
- La cuantización introduce degradación respecto a bf16 (ppl 8,4699 frente a 8,2001 en WikiText-2); para tareas sensibles a la precisión numérica o al razonamiento fino, considerar el modelo base en bf16.
- Riesgo de alucinación: no hay datos específicos publicados; es un riesgo inherente a los modelos generativos de esta escala y debe mitigarse con verificación y RAG.
- Sesgos: no se documentan evaluaciones de sesgo en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización sin reentrenamiento, las obligaciones y restricciones del modelo base se heredan; conviene revisar la licencia y condiciones del repositorio meta-models/Muse-Glimmer-30B.
- Dependencia de hardware Apple: el formato MLX limita el despliegue a Apple Silicon; para otros entornos hay que recurrir al repo GGUF o al modelo base.
- El repositorio tiene pocas descargas (388) y cero likes en el momento de la consulta; es un artefacto de autor individual, no una publicación oficial del creador del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/staccs/Muse-Glimmer-30B-lecore-mlx
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Variante GGUF del mismo autor: https://huggingface.co/staccs/Muse-Glimmer-30B-lecore-GGUF
