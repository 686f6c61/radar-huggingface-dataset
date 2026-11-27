# Testeezy59/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-GGUF

## Resumen

XORTRON.CriminalComputing.2026.27B.Instruct.NEXT es un modelo de lenguaje de aproximadamente 26.900 millones de parámetros (26.895.998.464 según los pesos en safetensors) derivado del modelo base `darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT`. La ficha que nos ocupa corresponde a la versión cuantizada en formato GGUF, publicada por el usuario `Testeezy59` y generada con la herramienta de cuantización de `mradermacher`. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado como "heretic", "uncensored", "decensored" y "abliterated", lo que indica que ha sido modificado para eliminar o reducir los mecanismos de rechazo y alineación de seguridad del modelo original.

El modelo está pensado para inferencia conversacional en inglés (`language: en`) y se distribuye exclusivamente en formato GGUF, con un conjunto de cuantizaciones estáticas que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB), además de dos ficheros `mmproj` (Q8_0 y f16) que sugieren soporte multimodal, probablemente visión. El repositorio ocupa 187,9 GB en total, lo que refleja la suma de todas las variantes publicadas.

La relevancia de esta ficha es limitada y debe enmarcarse con cautela: no hay pipeline declarado, cero descargas y cero "likes" en el momento de la consulta, no se han publicado resultados de benchmarks y la model card no aporta información sobre arquitectura, datos de entrenamiento ni contexto. Se trata, por tanto, de una variante derivada de un modelo base del que tampoco disponemos de documentación técnica verificable en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base sugiere una familia "Qwen3.5-27B" según el `license_link`, pero no se confirma la arquitectura) |
| Parametros totales | 26.895.998.464 (~26,9 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; además mmproj en Q8_0 y f16 |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo en la documentación proporcionada. El nombre del modelo base (`XORTRON.CriminalComputing.2026.27B.Instruct.NEXT`) y el `license_link` apuntan a `Qwen/Qwen3.5-27B`, lo que sugiere que podría tratarse de un fine-tuning sobre una variante de la familia Qwen 3.5 de 27B, pero este extremo no se confirma explícitamente en la model card. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset (`darkc0de/Xortron.Config.Dataset.New.2026` es el único dataset referenciado, sin detalles públicos) ni si se aplicaron técnicas de RLHF, DPO o similares.

Las etiquetas "heretic", "uncensored", "decensored" y "abliterated" indican que el modelo ha pasado por un proceso de "abliteration" o eliminación de direcciones de rechazo en el espacio de activaciones, orientado a reducir la tasa de negativas del modelo ante peticiones sensibles. La model card no documenta la metodología concreta, el impacto en capacidades ni el conjunto de evaluación empleado. Los ficheros `mmproj` incluidos apuntan a un componente multimodal (probablemente proyección visual), aunque no se detalla qué codificador visual se utiliza ni qué tareas cubre.

## Capacidades

- Generación de texto conversacional en inglés, con formato de instrucciones (`Instruct`).
- Modo conversacional multi-turno (etiqueta `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Soporte multimodal probable (ficheros `mmproj` Q8_0 y f16 presentes en el repositorio), sin documentación sobre qué modalidades cubre exactamente.
- Comportamiento "uncensored"/"abliterated": menor tasa de rechazos ante peticiones que el modelo base rechazaría.
- No se documentan capacidades específicas de tool calling, function calling, agentes, matemáticas, código ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Experimentación con modelos "abliterated" en entornos de investigación: el modelo permite estudiar el efecto de la eliminación de direcciones de rechazo sobre el comportamiento conversacional, comparándolo con el modelo base no modificado.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S (15,7 GB) y Q4_K_M (16,6 GB) caben en GPUs con 24 GB de VRAM (RTX 3090, RTX 4090), lo que facilita pruebas offline sin infraestructura en la nube.
- Generación de texto creativo sin filtros editoriales: para proyectos de escritura que requieran temáticas adultas o controvertidas, el carácter "uncensored" reduce las negativas del modelo, aunque sin garantías de calidad ni de seguridad.
- Evaluación comparativa de cuantizaciones GGUF: el repositorio ofrece 11 variantes de cuantización, útil para medir el impacto de la compresión en perplejidad y calidad de generación sobre un mismo modelo.
- Integración en pipelines de inferencia basados en llama.cpp u Ollama: el formato GGUF y la etiqueta `endpoints_compatible` permiten servir el modelo mediante APIs compatibles con OpenAI, útil para prototipos internos.
- Análisis de sesgos y robustez en modelos sin alineación: investigadores de seguridad pueden emplear el modelo como caso de estudio de los riesgos de las variantes "decensored" en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de cuantización):
  - Q2_K: ~10,8 GB de pesos, más overhead de contexto y KV cache; viable en GPUs de 16 GB.
  - Q3_K_M: ~13,4 GB; viable en GPUs de 16-24 GB.
  - Q4_K_S / Q4_K_M: ~15,7-16,6 GB; requiere 24 GB para contexto amplio (RTX 3090, RTX 4090, A10G).
  - Q5_K_M: ~19,3 GB; requiere 24 GB con contexto moderado o 32 GB para contexto largo.
  - Q6_K: ~22,2 GB; 24 GB justos, recomendable 32 GB.
  - Q8_0: ~28,7 GB; requiere 32-48 GB (A6000, A100 40 GB, L40S).
- GPU recomendadas: RTX 4090 (24 GB) para Q4/Q5, A100 40/80 GB o H100 para Q8 y contexto largo; A10G o L4 para cuantizaciones bajas con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q4_K_M o inferiores; en GPUs de 16 GB solo con Q2_K o Q3_K_S y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; para el modelo base en safetensors, vLLM o TGI (no aplicable directamente a los GGUF).
- Latencia y throughput: no disponibles; dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-GGUF (este) | ~26,9 B | no disponible | Apache 2.0 | GGUF | Variante "abliterated", sin benchmarks publicados |
| Modelo base `darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT` | ~26,9 B | no disponible | Apache 2.0 (según este repo) | safetensors | Origen del que se derivan estas cuantizaciones |
| `Qwen/Qwen3.5-27B` (referenciado en `license_link`) | ~27 B | no disponible | Apache 2.0 | safetensors | Posible familia de origen; no confirmado |
| `mradermacher/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-i1-GGUF` | ~26,9 B | no disponible | Apache 2.0 | GGUF (imatrix) | Cuantizaciones ponderadas con imatrix, mayor calidad a igual tamaño |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, por lo que no es posible estimar su calidad objetiva frente a alternativas.
- Modelo "abliterated"/"uncensored": la eliminación de direcciones de rechazo puede degradar la coherencia, aumentar la toxicidad y facilitar la generación de contenido dañino o ilegal. No es apto para aplicaciones de cara al público sin filtros adicionales.
- Solo inglés: la model card declara únicamente `en`; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin pruebas empíricas.
- Procedencia y trazabilidad limitadas: cero descargas, cero "likes", sin pipeline declarado y sin documentación del proceso de entrenamiento o abliteration. La autoría del fine-tuning (`darkc0de`) y del cuantizador (`mradermacher`) no garantiza la calidad del resultado final.
- Licencia Apache 2.0 declarada, pero el `license_link` apunta a la licencia de Qwen3.5-27B; conviene verificar la compatibilidad de licencias antes de un uso comercial, especialmente si el modelo base tuviera términos adicionales.
- Riesgo de alucinación no cuantificado: al no haber evaluaciones, no se puede estimar la tasa de alucinación ni la fiabilidad factual.
- El repositorio ocupa 187,9 GB; la descarga completa no es necesaria, pero conviene seleccionar una única cuantización.

## Enlaces

- Repositorio Hugging Face (esta ficha): https://huggingface.co/Testeezy59/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-GGUF
- Modelo base: https://huggingface.co/darkc0de/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT
- Cuantizaciones imatrix del mismo modelo: https://huggingface.co/mradermacher/XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-i1-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#XORTRON.CriminalComputing.2026.27B.Instruct.NEXT-GGUF
- Dataset referenciado: https://huggingface.co/datasets/darkc0de/Xortron.Config.Dataset.New.2026
- Licencia referenciada (Qwen3.5-27B): https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Peticiones de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfica comparativa de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
