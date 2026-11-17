# xamiuz/xamiuz1.1

## Resumen

Xamiuz 1.1 es un ajuste fino mediante QLoRA de 4 bits sobre Meta-Llama-3.1-8B-Instruct, desarrollado por Xamiuz AI (Pandu Wirayuda) y publicado en Hugging Face. El modelo se distribuye como adaptadores LoRA de 16 bits (~185 MB) y como pesos cuantizados GGUF Q4_K_M, y está orientado a tres nichos concretos: ingeniería de software multilingüe, razonamiento académico formal en indonesio y ejecución autónoma de herramientas para la manipulación de archivos y documentos.

El modelo conserva la arquitectura LlamaForCausalLM de 8.030.261.248 parámetros del modelo base, pero el autor documenta una ventana de contexto efectiva reducida a 2.048-4.096 tokens, muy por debajo de los 128.000 tokens nativos de Llama 3.1. El entrenamiento combina datasets abiertos (CodeAlpaca-20k, IndoMMLU, Indonesian Natural Dialog) con datos SFT internos propietarios orientados a trayectorias de tool calling, auditoría documental y citación científica.

Su relevancia actual es limitada pero específica: es un ejemplo de ajuste fino de bajo coste con Unsloth sobre una base consolidada, empaquetado para inferencia offline en CPU o GPU de consumo mediante LM Studio, llama.cpp u Ollama. El propio autor lo etiqueta como "Active Development Preview", por lo que no debe considerarse una versión estable para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer decoder-only) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 - 4.096 tokens (según model card) |
| Tipos de cuantizacion | GGUF Q4_K_M; adaptadores LoRA en 16 bits (~185 MB) |
| Idiomas soportados | Indonesio (id) e inglés (en) |
| Licencia | Llama 3.1 Community License Agreement |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La base es un transformer decoder-only estándar de Llama 3.1 con 8.000 millones de parámetros. El ajuste se realizó mediante PEFT QLoRA de 4 bits con la librería Unsloth, lo que permite entrenar adaptadores de bajo rango sobre los pesos cuantizados del modelo base sin modificar la arquitectura. El resultado se distribuye como adaptadores LoRA de 16 bits y como GGUF Q4_K_M fusionado.

El corpus de entrenamiento documentado suma aproximadamente 6.000 muestras de datasets abiertos (2.000 de CodeAlpaca-20k, 2.000 de IndoMMLU y 2.000 de Indonesian Natural Dialog) más varios conjuntos SFT internos propietarios: trayectorias de tool calling para generación de PDF, Word, Excel, PPTX y diagramas Mermaid; auditoría de documentos administrativos indonesios (Surat Keputusan, BAST, e-KTP, facturas); y síntesis de referencias científicas con metadatos DOI/OpenAlex. El autor menciona además un mecanismo de "Flywheel Continuous On-Device Experience Memory" que recopila localmente interacciones exitosas, aunque no se detalla su implementación técnica ni si afecta a los pesos publicados. No se documenta RLHF ni DPO explícito.

## Capacidades

- Generación de texto conversacional en indonesio e inglés, con especial énfasis en registro formal y administrativo indonesio.
- Generación, análisis y depuración de código en TypeScript, JavaScript, Go, Rust, Java, C++, Python, SQL y Bash.
- Razonamiento académico formal en dominios de derecho, medicina, ciencias exactas, historia y sociología, entrenado sobre IndoMMLU.
- Tool calling estructurado mediante etiquetas `<tool_call>` para operaciones de sistema de archivos: `write_file`, `create_pdf`, `create_word`, `create_excel`, `create_flowchart` y `execute_command`.
- Generación de documentos ofimáticos (PDF, DOCX, XLSX, PPTX) y diagramas Mermaid a partir de instrucciones en lenguaje natural.
- Extracción de datos estructurados de documentos administrativos y financieros indonesios (e-KTP, facturas, BAST, kuitansi).
- Síntesis de referencias bibliográficas en formatos DOI, OpenAlex, IEEE y APA.
- Auditoría de accesibilidad según WCAG 2.1 AA (verificación de ratio de contraste).
- No se documentan capacidades de visión funcionales pese a la mención a "native vision" en el estado del proyecto; el modelo base Llama 3.1-8B-Instruct es exclusivamente textual.

## Casos de uso

- Automatización de back-office administrativo en Indonesia: el modelo puede extraer campos estructurados de e-KTP, facturas y BAST y volcarlos a Excel o PDF mediante sus herramientas de sistema de archivos, reduciendo la transcripción manual en flujos de procurement.
- Generación de documentación técnica multilingüe: a partir de un repositorio o una especificación, produce README, comentarios y guías en indonesio e inglés para stacks TypeScript, Go, Rust o Python, aprovechando el entrenamiento sobre CodeAlpaca.
- Asistente de desarrollo con ejecución de comandos: integrado en un agente local, puede invocar `execute_command` y `write_file` para scaffolding de proyectos, generación de Dockerfiles multi-stage o creación de APIs REST en Go.
- Auditoría documental y de accesibilidad: revisión de contratos, surat dinas y material corporativo verificando estructura formal y contraste WCAG 2.1 AA, útil en equipos de diseño y compliance.
- Soporte a investigación académica: síntesis de estado del arte y formateo de citas en APA o IEEE a partir de metadatos DOI/OpenAlex, adecuado para revisores y estudiantes indonesios.
- Despliegue offline en entornos con air-gap: al distribuirse como GGUF Q4_K_M y ejecutarse en llama.cpp u Ollama sobre CPU, encaja en organismos o empresas que no pueden enviar datos a la nube.
- Generación de diagramas de arquitectura: produce diagramas Mermaid de microservicios o flujos de proceso a partir de descripciones textuales, exportables a imagen en pipelines de documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para GGUF Q4_K_M: aproximadamente 5-6 GB, suficiente para GPUs de consumo de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070).
- Para los adaptadores LoRA en 16 bits sobre el modelo base en precisión completa: ~16 GB en FP16, o ~10-12 GB con cuantización 8 bits del base.
- GPU recomendadas: RTX 4090 o A100/H100 para inferencia en FP16 con contexto completo; RTX 3060 12 GB o superior para Q4_K_M.
- Ejecución en CPU viable con llama.cpp, aunque con throughput bajo; el autor documenta `-t 4` hilos en su ejemplo de llama-server.
- Opciones de despliegue documentadas: LM Studio, llama.cpp / llama-server, Ollama. No se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Xamiuz 1.1 | 8,03 B | 2.048-4.096 | id, en | Llama 3.1 Community | Ajuste QLoRA especializado; preview |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 | multilingüe (8 oficiales) | Llama 3.1 Community | Base; contexto 32x mayor |
| Qwen2.5-7B-Instruct | 7,6 B | 128.000 | multilingüe amplio | Apache 2.0 | Alternativa permisiva con mejor soporte asiático |
| Mistral-7B-Instruct-v0.3 | 7,2 B | 32.000 | en, fr, de, es, it | Apache 2.0 | Contexto menor pero licencia permisiva |

La comparación directa más relevante es contra el propio modelo base: Xamiuz 1.1 gana en especialización indonesia y tool calling documentado, pero pierde drásticamente en ventana de contexto (4.096 frente a 128.000) y no publica métricas que justifiquen el ajuste frente al original.

## Limitaciones y advertencias

- Estado "Active Development Preview": el autor advierte que arquitectura de razonamiento, optimización de inferencia y pesos multimodales siguen en evolución; no es una versión estable.
- Ventana de contexto reducida a 2.048-4.096 tokens, muy inferior a los 128.000 del modelo base; esto limita casos de uso con documentos largos o conversaciones extensas.
- El campo `language` de Hugging Face solo declara `en`, pese a que la model card indica soporte de indonesio; posible inconsistencia en metadatos.
- Riesgo de alucinación en citas académicas: aunque se entrena en formatos APA/IEEE con DOI, no se verifica la existencia real de las referencias generadas.
- El tool calling usa un formato propietario de etiquetas `<tool_call>` que requiere un parser específico; no es compatible directamente con el esquema OpenAI function calling sin adaptación.
- Parte del entrenamiento usa datasets internos propietarios y un "flywheel" de memoria local cuya composición y volumen no se detallan, lo que impide auditar el sesgo introducido.
- Licencia Llama 3.1 Community: permite uso comercial pero impone obligaciones (atribución "Built with Meta Llama 3", restricciones de uso, límite de 700 millones de usuarios mensuales para licencia automática).
- Solo 114 descargas y 0 likes en el momento de la ficha: ecosistema mínimo, sin validación comunitaria independiente.
- No se documenta evaluación de sesgos ni red-teaming; el ajuste sobre datos administrativos indonesios puede heredar sesgos de esos corpus.
- El modelo base es textual; cualquier expectativa de capacidades de visión derivada de la mención a "native vision" en la model card no está respaldada por pesos publicados.

## Enlaces

- Hugging Face: https://huggingface.co/xamiuz/xamiuz1.1
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Repositorio GGUF (referenciado en la model card): https://huggingface.co/xamiuz/xamiuz1.1-GGUF
- Dataset CodeAlpaca-20k: https://huggingface.co/datasets/sahil2801/CodeAlpaca-20k
- Dataset Indonesian Natural Dialog (FreedomIntelligence): https://huggingface.co/datasets/FreedomIntelligence/Indonesian-Natural-Dialog
- IndoMMLU (IndoLEM): https://github.com/indolem/IndoMMLU
- Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Licencia Llama 3.1: https://llama.meta.com/llama3_1/license/
- Contacto del autor: panduwirayuda12345@gmail.com
