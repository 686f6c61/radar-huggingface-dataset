# xamiuz/xamiuz1.1-GGUF

## Resumen

Xamiuz 1.1 GGUF es un ajuste fino (fine-tuning) del modelo Meta-Llama-3.1-8B-Instruct, desarrollado por el autor independiente Xamiuz AI (Pandu Wirayuda) y distribuido en formato GGUF cuantizado Q4_K_M. El modelo se presenta como una "vista previa de desarrollo activo" y está orientado a tres nichos concretos: ingeniería de software multilingüe, razonamiento académico en indonesio y ejecución autónoma de herramientas (tool calling) para la manipulación de archivos y documentos.

Técnicamente se trata de un transformer decoder-only de 8.030.261.312 parámetros, ajustado mediante QLoRA de 4 bits con la librería Unsloth sobre el checkpoint Instruct de Llama 3.1. El autor declara una longitud de contexto efectiva de entre 2.048 y 4.096 tokens, muy por debajo de los 128.000 tokens nativos del modelo base, lo que constituye una reducción deliberada y significativa de la ventana de contexto.

Su relevancia actual es limitada pero concreta: ofrece un paquete GGUF ligero (~4,92 GB) ejecutable en CPU o GPU de consumo mediante LM Studio, llama.cpp u Ollama, con capacidades específicas para el mercado indonesio (razonamiento académico tipo IndoMMLU, auditoría de documentos administrativos como e-KTP, BAST o facturas) y un formato propietario de llamada a herramientas (`<tool_call>`). No obstante, el modelo carece de benchmarks publicados y su model card mezcla afirmaciones de capacidades multimodales ("native vision") con un archivo GGUF de texto, lo que exige cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2.048 a 4.096 tokens (declarado por el autor) |
| Tipos de cuantizacion | GGUF Q4_K_M (~4,92 GB); no se listan otras variantes en el repositorio |
| Idiomas soportados | Indonesio (id) e ingles (en) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | GGUF (archivo `Meta-Llama-3.1-8B-Instruct.Q4_K_M.gguf`) |
| Metodo de entrenamiento | PEFT QLoRA 4-bit via Unsloth |
| Modelo base | meta-llama/Meta-Llama-3.1-8B-Instruct |
| Estado de publicacion | Vista previa de desarrollo activo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atención por cabezas agrupadas (GQA) y tokenizador BPE de 128.256 entradas. El autor no modifica la arquitectura; el ajuste se realiza mediante QLoRA de 4 bits con Unsloth, una técnica de fine-tuning eficiente en parámetros que congela los pesos base y entrena adaptadores de bajo rango. No se especifica el rango de LoRA, la tasa de aprendizaje ni el número de épocas.

Los datos de entrenamiento declarados suman aproximadamente 6.000 muestras de datasets abiertos más varios conjuntos internos propietarios. Los conjuntos abiertos son: CodeAlpaca-20k (2.000 muestras, Apache 2.0), IndoMMLU Academic Reasoning Benchmark (2.000 muestras, CC BY-SA 4.0) e Indonesian Natural Dialog de FreedomIntelligence (2.000 muestras, Apache 2.0). Los conjuntos internos cubren trayectorias de tool calling (creación de PDF, Word, Excel, PPTX, flowcharts Mermaid, Dockerfiles multi-stage, APIs REST en Go), crítica de diseño y citación académica, e inspección visual de documentos. El autor menciona además un "flywheel" de memoria de experiencia en dispositivo, sin detallar su implementación. No se reporta uso de RLHF ni DPO, solo SFT supervisado.

## Capacidades

- Generación de texto conversacional en indonesio e inglés, heredada del modelo base Instruct.
- Generación y depuración de código en TypeScript, JavaScript, Go, Rust, Java, C++, Python, SQL y Bash.
- Razonamiento académico formal en terminología jurídica, médica, científica y gramatical indonesia.
- Síntesis de referencias bibliográficas con metadatos DOI, OpenAlex, IEEE y formato APA.
- Análisis de documentos administrativos indonesios: Surat Keputusan, BAST, kuitansi, e-KTP.
- Verificación de contraste de accesibilidad según WCAG 2.1 AA (declarado).
- Llamada a herramientas estructurada mediante etiquetas `<tool_call>` para funciones propietarias: `write_file`, `create_pdf`, `create_word`, `create_excel`, `create_flowchart`, `execute_command`.
- Ejecución autónoma de comandos de terminal (declarada, sin detalles de sandboxing).
- El autor menciona "native vision" y ajuste del proyector multimodal, pero el artefacto publicado es un GGUF de solo texto; no hay evidencia de pesos de visión en el repositorio.

## Casos de uso

- Generación de código en producción para equipos indonesios: el modelo cubre nueve lenguajes y puede integrarse en pipelines de revisión de código, aunque su contexto de 4.096 tokens limita el análisis a archivos individuales o diffs pequeños.
- Atención al cliente en indonesio: el ajuste sobre Indonesian Natural Dialog y su naturaleza conversacional lo hacen adecuado para asistentes de soporte en ese idioma, siempre que las conversaciones no superen los ~3.000 tokens de historial.
- Auditoría documental administrativa: extracción de campos estructurados de e-KTP, facturas, kuitansi y BAST en flujos de digitalización de oficinas públicas o pymes indonesias.
- Automatización de generación de informes: mediante las herramientas `create_pdf`, `create_word`, `create_excel` y `create_flowchart`, el modelo puede orquestar la creación de entregables a partir de datos de entrada.
- Asistencia académica y bibliográfica: síntesis de referencias con formato APA y metadatos DOI para estudiantes o investigadores que trabajen en indonesio.
- Despliegue en hardware de consumo: al ocupar ~4,92 GB en Q4_K_M, puede ejecutarse en portátiles con 8 GB de RAM/VRAM mediante Ollama o LM Studio, útil para prototipos offline en entornos con conectividad limitada.
- Automatización de tareas de sistema controladas: el soporte de `execute_command` permite scripting asistido, aunque requiere aislamiento estricto por los riesgos de ejecución arbitraria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas de MMLU, HumanEval, GSM8K, IndoMMLU ni de ninguna otra evaluación, ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: ~5,5-6,5 GB en Q4_K_M (pesos de 4,92 GB más overhead de contexto KV).
- GPU recomendadas: cualquier GPU con ≥8 GB de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090); en A100/H100 el modelo es sobredimensionado pero funciona.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 y superiores. En GPUs de 6 GB puede requerir offload parcial a CPU.
- Despliegue: LM Studio, llama.cpp / llama-server, Ollama. No se documenta soporte para vLLM ni TGI (el artefacto es GGUF, no safetensors).
- Latencia y throughput: no disponibles. El autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xamiuz 1.1 GGUF | 8,03 B | 2.048-4.096 | Llama 3.1 Community | GGUF Q4_K_M | Ajuste nicho indonesio + tool calling propietario; sin benchmarks |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Llama 3.1 Community | safetensors, GGUF | Modelo base; contexto 32x mayor; benchmarks públicos extensos |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 | Apache 2.0 | safetensors, GGUF | Alternativa permisiva con fuerte soporte multilingüe y de código |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.000 | Apache 2.0 | safetensors, GGUF | Contexto mayor y licencia más permisiva para uso comercial |

La comparación directa con el modelo base es la más relevante: Xamiuz 1.1 reduce el contexto de 128.000 a 4.096 tokens y no documenta mejoras medibles, por lo que su valor diferencial se limita al ajuste en indonesio y al formato propietario de tool calling.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia cuantitativa de que el ajuste supere al modelo base en ninguna tarea.
- Reducción drástica de contexto: de 128.000 tokens nativos a 2.048-4.096 declarados, lo que invalida casos de uso de contexto largo.
- Estado "vista previa de desarrollo activo": el autor advierte que los pesos se actualizan periódicamente, lo que compromete la reproducibilidad en producción.
- Afirmaciones no verificables: se menciona "native vision" y un proyector multimodal, pero el repositorio solo contiene un GGUF de texto. No hay pesos de visión publicados.
- Tool calling propietario: las funciones `write_file`, `execute_command`, etc. no siguen el esquema estándar de OpenAI ni de Llama 3.1; requieren un runtime personalizado y no son portables.
- Riesgo de alucinación: sin evaluación, no hay garantías sobre la fiabilidad en tareas jurídicas, médicas o administrativas, que el autor declara cubrir.
- Sesgos: el ajuste se centra en indonesio e inglés; el rendimiento en castellano u otros idiomas no está evaluado y probablemente sea inferior al del modelo base.
- Licencia: Llama 3.1 Community License permite uso comercial pero impone obligaciones (atribución "Built with Meta Llama 3", restricciones para >700 M de usuarios mensuales, cláusula de aceptación). Los datasets internos son propietarios y no auditables.
- Datos de entrenamiento internos sin verificación independiente: el autor afirma que están libres de datos sintéticos de terceros, pero no hay forma de comprobarlo.
- Fecha de creación futura (2026-11-03) en los metadatos: inconsistencia que sugiere posible fabricación o error en el registro del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xamiuz/xamiuz1.1-GGUF
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Unsloth (librería de fine-tuning): https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- IndoMMLU: https://huggingface.co/datasets/indolem/IndoMMLU
- Indonesian Natural Dialog (FreedomIntelligence): https://huggingface.co/datasets/FreedomIntelligence/Indonesian-Natural-Dialog
- Contacto del desarrollador: panduwirayuda12345@gmail.com
