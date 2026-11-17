# Suvir-Misra/Legal-Qwen2.5-1.5B-12xMoE-GGUF

## Resumen

Legal-Qwen2.5-1.5B-12xMoE-GGUF es un modelo de lenguaje especializado en derecho indio, fiscalidad indirecta (GST), estatutos penales (BNS/BNSS/BSA), lógica proposicional y tool calling, desarrollado por Suvir-Misra. Se construye mediante *upcycling* del modelo denso Qwen2.5-1.5B-Instruct de Alibaba, transformando sus capas FFN en una mezcla de expertos (MoE) de 12 expertos finos con enrutamiento top-2, y se distribuye cuantizado en formato GGUF para inferencia multiplataforma con llama.cpp, Ollama y LM Studio.

El modelo parte de la arquitectura Qwen2.5-1.5B (28 bloques transformer, 12 cabezas de atención, 2 cabezas KV, dimensión oculta 1536) y añade un experto denso compartido siempre activo, dos capas densas de anclaje (capas 0 y 1) y un enrutador sigmoide en FP32 con sesgo dinámico libre de pérdida. Su entrenamiento se realizó de forma nativa en Apple Silicon con MLX (128 GB de memoria unificada) y posteriormente se convirtió a GGUF.

Su relevancia radica en la especialización vertical: ofrece precisión declarada del 100 % en lógica proposicional y esquemas de tool calling, y perplejidades muy bajas en dominios estatutarios (1,01–2,17), con un tamaño de fichero Q4_K_M de 5,17 GB que permite ejecución en portátiles de consumo. La licencia Apache 2.0 facilita su uso comercial, aunque el propio autor advierte que no constituye asesoramiento jurídico formal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen2.5-1.5B con capas MoE (12 expertos enrutados top-2 + experto denso compartido) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (top-2 de 12 expertos enrutados + experto compartido siempre activo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, F16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (también etiquetado mlx en Hugging Face) |

## Arquitectura y entrenamiento

El modelo conserva la columna vertebral de Qwen2.5-1.5B: 28 bloques transformer, 12 cabezas de atención, 2 cabezas KV y dimensión oculta de 1536. Sobre esa base se aplica un *upcycling* a MoE: cada capa MoE incorpora 12 expertos enrutados de anchura intermedia 4480, con despacho dinámico top-2 y renormalización de salida por √k, más un experto denso compartido (anchura 4480) siempre activo. Las capas 0 y 1 permanecen como FFN densas de anchura 8960 y actúan como anclaje de la representación base. El enrutamiento usa una puerta sigmoide en FP32 con puntuación de afinidad independiente por experto y sesgo dinámico libre de pérdida, lo que evita el colapso de expertos.

La distribución de expertos está especializada por dominio: expertos 0 y 1 para GST, fiscalidad indirecta y jurisprudencia CENVAT; 2 y 3 para derecho penal (BNS 2023, BNSS, BSA, correspondencias con IPC) y procedimiento civil (CPC); 4 y 5 para precisión estatutaria y distinciones entre definiciones; 6 y 7 para razonamiento jurídico multi-paso y síntesis de conflictos normativos; 8 y 9 para tool calling y ejecución de esquemas de funciones; y 10 y 11 para lógica proposicional formal, tablas de verdad y deducción silogística. El entrenamiento se realizó nativamente en MLX sobre Apple Silicon Metal GPU, siguiendo las directrices de estabilidad del documento "The Ultimate MoE Training Handbook" (Hugging Face, 2026). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto especializada en derecho indio: GST, fiscalidad indirecta, CENVAT, BNS, BNSS, BSA, IPC y CPC.
- Razonamiento jurídico multi-paso y síntesis de conflictos entre estatutos.
- Lógica proposicional formal: Modus Tollens, leyes de De Morgan, silogismos y tablas de verdad.
- Tool calling y function calling con salida en bloque de código limpio y sin preámbulo conversacional.
- Precisión estatutaria y distinción entre definiciones legales.
- Capacidades multilingües limitadas al inglés (según la etiqueta de idioma del modelo).
- Soporte de agentes y razonamiento multi-paso orientado a ejecución de esquemas de funciones.
- No se documentan capacidades de visión, audio ni modo *thinking* explícito.

## Casos de uso

- **Asistencia fiscal en GST:** el modelo responde consultas sobre condiciones de Input Tax Credit (por ejemplo, las cuatro condiciones obligatorias del artículo 16(2) de la CGST Act, 2017) apoyándose en los expertos 0 y 1, adecuados para despachos contables y equipos de compliance tributario.
- **Análisis de derecho penal indio:** resolución de correspondencias entre IPC y BNS/BNSS/BSA y consultas sobre procedimiento civil (CPC) mediante los expertos 2 y 3, útil para bufetes que migran expedientes al nuevo marco normativo.
- **Generación de citas estatutarias:** con una precisión declarada del 85,4 % en casos canónicos, sirve como primer borrador de referencias normativas para revisión humana en herramientas de documentación legal.
- **Automatización de tool calling en pipelines jurídicos:** con recall del 100 % en esquemas, puede integrarse en flujos que consulten bases de datos de jurisprudencia o calculadoras fiscales mediante function calling desde llama.cpp u Ollama.
- **Verificación lógica de argumentos jurídicos:** los expertos 10 y 11 permiten validar silogismos y detectar falacias formales en escritos o dictámenes, con precisión declarada del 100 % en lógica proposicional.
- **Despliegue en portátil para consulta rápida:** el fichero Q4_K_M de 5,17 GB funciona en portátiles con 8 GB de RAM mediante Ollama o LM Studio, con 30,5 tokens/s y TTFT de 118,1 ms, adecuado para abogados que necesitan consultas offline.
- **Generación de borradores de cláusulas y definiciones:** los expertos 4 y 5 aportan precisión en distinciones terminológicas para redacción contractual asistida.

## Benchmarks y rendimiento

| Métrica / Benchmark | Resultado |
|---|---|
| Precisión en lógica proposicional | 100,0 % (Modus Tollens, leyes de De Morgan, silogismos) |
| Recall de esquemas de tool calling | 100,0 % (salida en bloque de código limpio, sin preámbulo) |
| Precisión de citas estatutarias | 85,4 % en casos canónicos de prueba |
| Perplejidad held-out (GST y fiscalidad) | 2,17 |
| Perplejidad held-out (precisión estatutaria) | 1,06 |
| Perplejidad held-out (tool calling) | 1,01 |
| Perplejidad held-out (lógica proposicional) | 1,02 |
| Entropía de enrutamiento activo | 2,44 (óptimo ≈ ln(12) = 2,485) |
| Velocidad media de inferencia | 30,5 tokens/s |
| Time to First Token (TTFT) | 118,1 ms |

No se han publicado resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM/RAM estimada:** Q4_K_M requiere aproximadamente 5,17 GB de fichero y funciona en portátiles con 8 GB de RAM; F16 ocupa 15,2 GB y requiere al menos 16 GB de memoria.
- **GPU recomendadas:** el entrenamiento se realizó en Apple Silicon con 128 GB de memoria unificada; para inferencia no se especifican GPU concretas (A100, H100, RTX 4090) en la información disponible.
- **Consumer GPU:** el cuantizado Q4_K_M es apto para equipos de consumo con 8 GB de RAM, incluyendo portátiles Apple Silicon y GPUs de gama media con suficiente memoria.
- **Opciones de despliegue:** llama.cpp (llama-cli), Ollama (mediante Modelfile), LM Studio y el ecosistema MLX.
- **Latencia y throughput:** 30,5 tokens/s de media y TTFT de 118,1 ms según el autor; no se especifica el hardware exacto de la medición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Legal-Qwen2.5-1.5B-12xMoE | no disponible (base 1.5B con 12 expertos) | no disponible | Derecho indio, GST, lógica, tool calling | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-1.5B-Instruct | 1.5B | no disponible en esta ficha | Generalista | Apache 2.0 | Hugging Face |
| Modelos legales especializados en derecho indio de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo no constituye asesoramiento jurídico ni fiscal formal, ni crea relación abogado-cliente bajo la Advocates Act de 1961 o la normativa del Bar Council of India; el autor exige consultar a un abogado o Chartered Accountant colegiado.
- Riesgo de alucinación en citas estatutarias: la precisión declarada es del 85,4 %, por lo que aproximadamente una de cada siete citas canónicas puede ser incorrecta.
- Idiomas soportados limitados al inglés; no se documenta soporte para hindi ni otras lenguas indias.
- Longitud de contexto no especificada, lo que impide garantizar el manejo de documentos legales extensos.
- El modelo es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria independiente.
- El entrenamiento se realizó en Apple Silicon con MLX, y la conversión a GGUF puede introducir discrepancias respecto al modelo original.
- Aunque la licencia Apache 2.0 permite uso comercial, la naturaleza jurídica del dominio exige supervisión humana en cualquier aplicación en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suvir-Misra/Legal-Qwen2.5-1.5B-12xMoE-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Documento de referencia citado por el autor: "The Ultimate MoE Training Handbook" (Hugging Face, 2026) — sin enlace directo en la información disponible.
- Repositorios de inferencia: llama.cpp, Ollama, LM Studio y MLX (sin enlaces específicos en la información disponible).
