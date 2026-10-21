# vonkaiser/Biomni-R0-32B-Preview-FP8-Dynamic

## Resumen

Biomni-R0-32B-Preview-FP8-Dynamic es una cuantización FP8 del checkpoint biomni/Biomni-R0-32B-Preview, un modelo de 32.762 millones de parámetros construido sobre la arquitectura Qwen3-32B y orientado a tareas de agente en el ámbito biomédico, generación de código y razonamiento multi-paso. Lo publica el usuario vonkaiser en HuggingFace y no es una release oficial del equipo Biomni: los pesos originales en BF16 permanecen en el repositorio de origen.

El interés de esta ficha no está en el modelo base, sino en el procedimiento de compresión: se aplica el esquema compressed-tensors FP8 con pesos cuantizados por canal y activaciones dinámicas por token, dejando `lm_head` en precisión densa. El resultado son unos 35 GB de pesos (frente a los aproximadamente 65 GB en BF16), lo que permite servir el modelo en una única GPU de 48 GB con contexto de 32.768 tokens y caché KV en FP8.

El autor acompaña la publicación con una evaluación comparativa frente al checkpoint original ejecutada en vLLM a temperatura 0 y semilla fija, cubriendo GSM8K, MMLU generativo, HumanEval, el conjunto biomédico Eval1, tool calling y divergencia de logprobs. La conclusión declarada es una desviación de capacidad de +0,3 puntos porcentuales a favor del FP8 sobre 2.201 ítems, con todas las diferencias por tarea dentro de aproximadamente un error estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, basado en Qwen3-32B |
| Parametros totales | 32.762.123.264 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (configuración usada en la evaluación con vLLM); el máximo nativo del modelo base no se detalla en la información disponible |
| Tipos de cuantizacion | FP8 dynamic (compressed-tensors): pesos FP8 por canal, activaciones FP8 dinámicas por token, `lm_head` en precisión densa, sin dataset de calibración |
| Idiomas soportados | en (solo inglés, según la model card) |
| Licencia | MIT |
| Formato de pesos | safetensors con metadatos compressed-tensors; tamaño del repo 168,5 GB, pesos FP8 ≈ 35 GB |
| Modelo base | biomni/Biomni-R0-32B-Preview (revisión `71432eb3d5e583bee757e0f9437a17e711e8e3d1`) |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-32B: un transformer decoder-only denso de 32.762 millones de parámetros. Sobre esa base, Biomni-R0-32B-Preview se presenta como un modelo especializado en flujos de agente para biología, con soporte de tool calling en formato JSON dentro de etiquetas `<tool_call>` y capacidad de razonamiento extendido (thinking mode). La información disponible no incluye detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO en el modelo base.

La contribución técnica de este checkpoint es exclusivamente la cuantización: se aplica el esquema FP8 de compressed-tensors con granularidad per-channel en pesos y per-token dinámica en activaciones, se deja `lm_head` sin cuantizar y no se utiliza dataset de calibración. vLLM lee el esquema directamente desde `config.json`, por lo que no debe pasarse el flag `--quantization` al servir el modelo. El autor valida la fidelidad de la compresión midiendo la divergencia de logprobs sobre 160 prompts: 110 completados greedy idénticos, 6.812 posiciones alineadas, diferencia media absoluta de logprob de 0,008 y ninguna posición con una brecha superior a 1,0 nat.

## Capacidades

- Generación de texto y razonamiento general, con modo thinking activable o desactivable.
- Resolución de problemas matemáticos de varios pasos (GSM8K evaluado en régimen 5-shot).
- Generación de código, incluyendo Python ejecutable (HumanEval pass@1).
- Tool calling / function calling: el chat template espera un objeto JSON dentro de etiquetas `<tool_call>`; requiere un parser compatible (`qwen` o `hermes`).
- Flujos de agente multi-paso, con encadenamiento de llamadas a herramientas.
- Conocimiento y tareas específicas de biomedicina: diagnóstico de enfermedades raras, priorización de variantes, recuperación de genes, QA sobre bases de datos de laboratorio.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión ni de audio en la información disponible.

## Casos de uso

- Agentes de investigación biomédica: el modelo puede orquestar pipelines de análisis genómico llamando a herramientas externas (consultas a GWAS Catalog, Open Targets o PharmaProjects) y encadenando los resultados en varios pasos, gracias al soporte nativo de tool calling y a una ventana de 32.768 tokens que permite mantener el histórico de la sesión.
- Asistencia a la priorización de variantes: integrado como motor de razonamiento en un pipeline bioinformático que le pasa listas de variantes y evidencia asociada; el modelo genera hipótesis y justifica la selección, aunque requiere validación posterior por un especialista.
- Generación de código para bioinformática: creación y depuración de scripts de análisis (procesamiento de VCF, consultas a APIs biológicas) con la ventaja de que el modelo mantiene el contexto del esquema de datos a lo largo de la conversación.
- Automatización de tareas de laboratorio (lab_bench): resolución de preguntas tipo DBQA y SeqQA sobre protocolos y secuencias, útil como capa de consulta en asistentes internos de un laboratorio.
- Servicio de inferencia en producción con vLLM: al ocupar unos 35 GB en FP8, se puede desplegar en una sola GPU de 48 GB con caché KV en FP8 y contexto completo de 32k, simplificando el escalado frente al BF16.
- Evaluación de técnicas de cuantización: este checkpoint sirve como caso práctico documentado para medir el impacto de FP8 dynamic frente a BF16 en tareas de razonamiento, código y dominio científico, con metodología reproducible (temperatura 0, semilla 1234).
- Integración en asistentes de soporte técnico especializado: atención multi-turno sobre documentación científica o protocolos, aprovechando la ventana de contexto para incorporar manuales extensos en el prompt.

## Benchmarks y rendimiento

Comparativa entre el checkpoint original en BF16 y esta versión FP8, ambos ejecutados en vLLM con temperatura 0 y semilla 1234. El original usó contexto de 8.192 tokens; el FP8, contexto de 32.768 y caché KV en FP8.

| Benchmark | Metrica | Original BF16 | FP8 dynamic |
|---|---|---|---|
| GSM8K (1.319 preguntas, 5-shot) | strict-match | 1.179/1.319 (0,8939) | 1.181/1.319 (0,8954) |
| GSM8K (1.319 preguntas, 5-shot) | flexible-extract | 1.185/1.319 (0,8984) | 1.189/1.319 (0,9014) |
| GSM8K thinking on (primeras 200) | flexible-extract | 180/200 (0,900) | 178/200 (0,890) |
| MMLU generativo (285 preguntas, 5-shot) | accuracy | 248/285 (0,8702) | 250/285 (0,8772) |
| HumanEval (164 problemas, chat pass@1) | accuracy | 150/164 (0,9146) | 148/164 (0,9024) |

Biomni Eval1 (433 filas evaluadas en ambos lados):

| Tarea | n | Original | FP8 |
|---|---|---|---|
| crispr_delivery | 10 | 3 | 2 |
| gwas_causal_gene_gwas_catalog | 50 | 21 | 18 |
| gwas_causal_gene_opentargets | 50 | 38 | 38 |
| gwas_causal_gene_pharmaprojects | 50 | 28 | 32 |
| gwas_variant_prioritization | 43 | 2 | 3 |
| lab_bench_dbqa | 50 | 5 | 4 |
| lab_bench_seqqa | 50 | 7 | 8 |
| patient_gene_detection | 50 | 0 | 2 |
| rare_disease_diagnosis | 30 | 0 | 0 |
| screen_gene_retrieval | 50 | 19 | 19 |
| Total | 433 | 123 | 126 |

Otras metricas reportadas por el autor:

| Prueba | Resultado |
|---|---|
| Capability Deviation Score (2.201 ítems) | +0,3 pp (original 1.706/2.201 = 77,5 %; FP8 1.713/2.201 = 77,8 %) |
| Tool calls, nombre de herramienta correcto | 16/16 en ambos checkpoints |
| Tool calls, sin llamada cuando no procede | 4/4 en ambos checkpoints |
| Tool calls, argumentos coincidentes | 15/16 |
| Completados greedy idénticos (160 prompts) | 110/160 |
| Diferencia media absoluta de logprob | 0,008 (máx. 0,581; ninguna posición > 1,0 nat) |
| Mismatch en el primer token | 7/160 |

No se han publicado resultados de benchmarks adicionales (por ejemplo MMLU-Pro, GPQA o evaluaciones de terceros) en la información disponible.

## Requisitos de hardware

- Pesos FP8: aproximadamente 35 GB. El repositorio completo ocupa 168,5 GB, por lo que conviene descargar solo los ficheros safetensors necesarios.
- VRAM estimada: 38-40 GB para arrancar con contexto corto; 48 GB recomendados para servir 32.768 tokens con caché KV en FP8 y `--gpu-memory-utilization 0.90`.
- GPU de centro de datos: L40S 48 GB, A6000 48 GB o A100 40 GB (esta última muy ajustada, obliga a reducir `--max-model-len`). Para lotes grandes o contexto completo con holgura, A100 80 GB o H100 80 GB.
- GPU consumer: no cabe en una RTX 4090 de 24 GB. Serían necesarias dos unidades en tensor parallel, o bien una GPU de 32 GB con contexto reducido y cuantización adicional.
- Despliegue: vLLM es la opción soportada de forma nativa (lee el esquema desde `config.json`; no pasar `--quantization`). El uso con llama.cpp u Ollama requeriría reconvertir los pesos a GGUF, algo que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión / tamano de pesos | Licencia | Notas |
|---|---|---|---|---|---|
| vonkaiser/Biomni-R0-32B-Preview-FP8-Dynamic | 32,76 B (denso) | 32.768 | FP8 ≈ 35 GB | MIT | Cuantización no oficial; mismas capacidades que el original dentro del error estándar |
| biomni/Biomni-R0-32B-Preview | 32,76 B (denso) | 8.192 en la evaluación (máximo nativo no disponible) | BF16 ≈ 65 GB | MIT | Checkpoint de referencia, release oficial |
| Qwen/Qwen3-32B | 32,76 B (denso) | 32.768 (arquitectura base) | BF16 | no disponible en la información proporcionada | Modelo base sobre el que se construye Biomni; sin especialización biomédica declarada |

Frente al original, la versión FP8 reduce el peso a aproximadamente la mitad con una desviación de capacidad declarada de +0,3 pp. Frente a Qwen3-32B, la diferencia es la especialización en agentes biomédicos y el formato de tool calling, no el tamaño.

## Limitaciones y advertencias

- No es una release oficial de Biomni: el autor lo indica explícitamente y remite al repositorio original para los pesos de referencia.
- Solo inglés: la model card declara `en` como único idioma, por lo que el rendimiento en castellano no está evaluado ni garantizado.
- La cuantización FP8 puede degradar tareas no cubiertas por la evaluación del autor; las diferencias reportadas se miden sobre un conjunto limitado (2.201 ítems) y con un error estándar de entre 4 y 11 preguntas según el benchmark.
- `rare_disease_diagnosis` obtiene 0/30 tanto en el original como en FP8, lo que indica una debilidad clara del modelo base en esa tarea, no un artefacto de la cuantización.
- Riesgo de alucinación relevante en dominio biomédico: el modelo no debe usarse como única fuente en decisiones clínicas o diagnósticas sin revisión humana y validación externa.
- La licencia MIT permite uso comercial, pero al derivar de un modelo base cuyos términos no se detallan en la información disponible, conviene verificar la licencia del checkpoint original antes de un despliegue en producción.
- El parser de tool calls debe ser compatible con el formato `<tool_call>` con JSON interno (`qwen` o `hermes`); otros parsers pueden fallar silenciosamente.
- No se documentan sesgos conocidos, datos de entrenamiento ni procesos de alineación en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vonkaiser/Biomni-R0-32B-Preview-FP8-Dynamic
- Modelo base: https://huggingface.co/biomni/Biomni-R0-32B-Preview
- Revisión del modelo base utilizada: `71432eb3d5e583bee757e0f9437a17e711e8e3d1`
- Arquitectura de referencia: https://huggingface.co/Qwen/Qwen3-32B
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
