# WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_PiSSA_llama-3.2

## Resumen

Este repositorio contiene un adaptador LoRA (entrenado con PEFT 0.17.1) sobre el modelo base `meta-llama/Llama-3.2-3B`, publicado por el usuario WijewardhanaNT. No se trata de un modelo completo, sino de pesos delta de bajo rango en formato `safetensors` que deben cargarse junto al modelo base o fusionarse con él. El repositorio ocupa 0,3 GB y la etiqueta de pipeline declarada es `text-generation`.

Por el identificador del repositorio (`xnli_en_and_hi_5000_percentage_1_40_PiSSA_llama-3.2`) se deduce que el adaptador se entrenó sobre el corpus XNLI (inferencia de lenguaje natural multilingüe) en inglés e hindi, con 5.000 ejemplos y algún tipo de barrido de porcentaje de datos entre el 1 % y el 40 %, empleando la inicialización PiSSA para LoRA. Esta lectura es una inferencia a partir del nombre y no está confirmada en la model card, que es la plantilla por defecto de HuggingFace y no contiene ningún dato sustantivo.

La relevancia de este repositorio es limitada en su estado actual: cero descargas, cero likes, licencia e idiomas sin declarar y una model card completamente vacía. Su interés es principalmente documental, como ejemplo de adaptadores de eficiencia de datos multilingües sobre la familia Llama 3.2. No hay evidencia publicada de calidad, evaluación o uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only denso (Llama 3.2 3B) |
| Parámetros totales | No disponible para el adaptador; el modelo base tiene 3,21 B de parámetros |
| Parámetros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base soporta 128.000 tokens |
| Tipos de cuantización | No disponible; el adaptador se distribuye en `safetensors` (el modelo base admite fp16, int8, GGUF Q4/Q5/Q8) |
| Idiomas soportados | No disponible (el identificador sugiere inglés e hindi; el modelo base declara 8 idiomas: inglés, alemán, francés, italiano, portugués, hindi, español y tailandés) |
| Licencia | No disponible para el adaptador (el modelo base usa la Llama 3.2 Community License) |
| Formato de pesos | `safetensors` (adaptador LoRA/PEFT) |
| Librería | PEFT 0.17.1, `transformers` |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | `meta-llama/Llama-3.2-3B` |
| Fecha de creación (HuggingFace) | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Llama 3.2 3B, un transformer decoder-only con atención agrupada por consultas (GQA), normalización RMSNorm pre-normalización, activación SwiGLU y embeddings de entrada/salida compartidos. Según la documentación pública de Meta, el modelo base tiene 3,21 B de parámetros, 28 capas, dimensión oculta de 3.072, 24 cabezas de atención y 8 cabezas KV, con un vocabulario de 128.256 tokens, ventana de contexto de 128.000 tokens y corte de conocimiento en diciembre de 2023. Estos datos proceden de la documentación del modelo base, no de la model card de este repositorio.

No hay información en el repositorio sobre el rango de LoRA, el valor de alpha, los módulos objetivo, la tasa de aprendizaje, el número de pasos ni la composición exacta del conjunto de entrenamiento. El nombre del repositorio apunta a un ajuste sobre XNLI (inferencia de lenguaje natural) en inglés e hindi con 5.000 ejemplos y un barrido de fracciones de datos (1 % a 40 %), y el sufijo `PiSSA` sugiere el uso de la inicialización por descomposición en valores singulares (Principal Singular Values and Singular Vectors Adaptation), que inicializa las matrices A y B de LoRA con los componentes principales de la matriz de pesos original. Ninguna de estas deducciones está verificada en la documentación publicada.

Tampoco se documenta si hubo entrenamiento supervisado, RLHF, DPO u otra fase de alineamiento posterior al ajuste LoRA.

## Capacidades

- Al ser un adaptador sobre un modelo de generación de texto, hereda la capacidad base de generar texto en los idiomas que maneja Llama 3.2 3B.
- Según el identificador, el ajuste está orientado a inferencia de lenguaje natural (NLI) en inglés e hindi, es decir, clasificación de pares premisa-hipótesis en entailment, neutral y contradiction.
- No hay confirmación de soporte de *tool calling* ni de *function calling* en el adaptador (el modelo base Llama 3.2 3B sí lo soporta de forma nativa).
- No hay confirmación de capacidades de agente, razonamiento multi-paso ni modo de pensamiento explícito.
- Capacidades multilingües: no disponibles; el identificador sugiere cobertura de inglés e hindi, sin datos sobre el resto.
- No hay evidencia de capacidades de visión, audio u otras modalidades (el modelo base es exclusivamente de texto).

## Casos de uso

- Clasificación de inferencia de lenguaje natural en inglés: dado un par premisa-hipótesis, obtener la etiqueta de implicación, neutralidad o contradicción. Es el uso que sugiere el identificador del repositorio, aunque no está confirmado en la model card.
- Clasificación de inferencia de lenguaje natural en hindi: el segundo idioma indicado por el identificador permite evaluar transferencia entre idiomas con un mismo adaptador.
- Estudio de eficiencia de datos en ajuste fino: el patrón `percentage_1_40` sugiere que el adaptador forma parte de un barrido de fracciones de datos, útil como punto de comparación metodológico en experimentos de ajuste con pocos ejemplos.
- Reproducción de experimentos con inicialización PiSSA: sirve como referencia para comparar PiSSA frente a LoRA estándar en tareas de clasificación multilingüe.
- Filtrado y anotación semiautomática de corpus: aplicar el modelo como clasificador de pares de frases para descartar pares contradictorios o redundantes antes de un entrenamiento mayor.
- Evaluación de adaptadores de bajo rango sobre modelos pequeños: con 0,3 GB de delta, es un candidato ligero para pruebas de *hot-swapping* de adaptadores en un mismo servidor de inferencia.
- Cualquier otro uso en producción es arriesgado, dado que no existen evaluaciones, ni licencia declarada, ni historial de descargas que permita estimar la fiabilidad del ajuste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es la plantilla por defecto de HuggingFace y todas las secciones de evaluación figuran como `[More Information Needed]`. No se dispone de métricas de exactitud, F1, perplejidad ni de comparaciones con otros adaptadores en XNLI para inglés o hindi.

## Requisitos de hardware

Los siguientes valores son estimaciones para el modelo base de 3,21 B de parámetros; el adaptador LoRA añade únicamente 0,3 GB en `safetensors`.

- VRAM estimada para inferencia en fp16: aproximadamente 6,5 GB de pesos, más 1-2 GB de caché KV y activaciones según longitud de contexto.
- VRAM estimada en int8: aproximadamente 3,5 GB de pesos.
- VRAM estimada en cuantización Q8_0: aproximadamente 3,4 GB.
- VRAM estimada en cuantización Q4_K_M: aproximadamente 2,0 GB.
- GPU de centro de datos: A100 40/80 GB, H100 y L40S son sobredimensionadas para este tamaño y solo se justifican por agregación de muchas réplicas o contextos muy largos.
- GPU de consumo: cabe sin problema en RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070, RTX 4080 y RTX 4090. En 8 GB de VRAM funciona en Q4/Q8; en fp16 conviene 12 GB o más.
- Memoria unificada: funciona en Apple Silicon (M1/M2/M3) con 8-16 GB, y en mini-PC con 16 GB de RAM para cuantizaciones de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador), vLLM (con soporte LoRA), TGI, llama.cpp y Ollama (requieren fusionar el adaptador y convertirlo a GGUF; el soporte de LoRA dinámico en llama.cpp depende de la arquitectura).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación se establece a nivel de modelo base, ya que no existen métricas del adaptador. Los datos de la columna «Parámetros» y «Contexto» corresponden a las fichas públicas de cada modelo base.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama 3.2 3B (base de este adaptador) | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Pesos abiertos con registro | 8 idiomas declarados, GQA, corte de conocimiento dic. 2023 |
| Qwen2.5 3B | 3,09 B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | Pesos abiertos | Licencia permisiva, buen rendimiento en código y matemáticas |
| Phi-3.5-mini-instruct | 3,8 B | 128.000 tokens | MIT | Pesos abiertos | Licencia muy permisiva, orientado a razonamiento |
| Gemma 2 2B | 2,61 B | 8.192 tokens | Gemma Terms of Use | Pesos abiertos con condiciones | Contexto corto, restricciones de uso comercial específicas |

No hay datos de rendimiento del adaptador que permitan compararlo con adaptadores LoRA equivalentes sobre XNLI, ni con alternativas como XLM-R o mBERT ajustados para la misma tarea.

## Limitaciones y advertencias

- Model card vacía: no hay descripción, instrucciones de uso, datos de entrenamiento, hiperparámetros ni resultados de evaluación.
- Licencia no declarada: al derivar de `meta-llama/Llama-3.2-3B`, se heredan las restricciones de la Llama 3.2 Community License, incluida la cláusula de uso aceptable y las obligaciones de atribución. No se puede asumir uso comercial libre sin verificar la licencia del adaptador.
- Cero descargas y cero likes: no hay validación externa, ni informes de errores, ni evidencia de que el adaptador funcione correctamente.
- Idiomas no declarados: el soporte real de inglés e hindi es una inferencia del nombre del repositorio, no un dato verificado.
- Posible desajuste de tarea: la etiqueta de pipeline es `text-generation`, pero el identificador apunta a una tarea de clasificación (XNLI). No se sabe si el adaptador genera etiquetas en texto libre o si requiere una cabeza de clasificación no incluida en el repositorio.
- Sesgos y alucinaciones: se heredan los del modelo base, que fue entrenado con datos web a gran escala y mantiene sesgos sociales, geográficos y de género documentados por Meta. Al ser un ajuste sobre datos de NLI, el riesgo de alucinación en generación abierta sigue presente.
- Contexto efectivo desconocido: aunque el modelo base admite 128.000 tokens, no hay confirmación de que el adaptador se haya entrenado o evaluado con secuencias largas.
- Ambigüedad metodológica: no se especifica el rango de LoRA, los módulos objetivo ni la configuración de PiSSA, lo que dificulta reproducir el ajuste.
- Fecha de creación anómala: el repositorio figura creado el 2026-09-21, posterior a la fecha habitual de publicación de Llama 3.2, lo que puede indicar un error de metadatos.
- No apto para producción sin una evaluación propia y sin una licencia clarificada por parte del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_hi_5000_percentage_1_40_PiSSA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Referencia citada en las etiquetas del repositorio (calculadora de impacto de carbono, Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Documentación de PEFT (librería utilizada, versión 0.17.1): https://huggingface.co/docs/peft
- Corpus XNLI (contexto del nombre del repositorio, no confirmado en la model card): https://arxiv.org/abs/1809.05053
- Método PiSSA (inferido del identificador del repositorio, no confirmado en la model card): https://arxiv.org/abs/2404.02948

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo; los únicos enlaces recuperados correspondían a generadores de códigos QR y no guardan relación con el repositorio.
