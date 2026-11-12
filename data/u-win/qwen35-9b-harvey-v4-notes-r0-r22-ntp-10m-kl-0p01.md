# U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-10m-kl-0p01

## Resumen

U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-10m-kl-0p01 es un ajuste fino completo (full fine-tune) del modelo Qwen/Qwen3.5-9B, publicado por el usuario U-WIN en Hugging Face. El modelo conserva la arquitectura multimodal de su base (pipeline image-text-to-text, arquitectura qwen3_5) y se ha especializado mediante un entrenamiento de predicción del siguiente token (next-token prediction) sobre un conjunto de datos denominado "harvey", con regularización KL (coeficiente 0.01) y una ventana de 10 millones de tokens. El nombre del repositorio codifica estas decisiones de entrenamiento: r0-r22 (probablemente 23 rondas o iteraciones), ntp (next-token prediction), 10m (10 millones de tokens) y kl-0p01 (regularización KL con peso 0.01).

El modelo conserva los 9.653.104.368 parámetros de su base (aproximadamente 9,65 mil millones) y se distribuye en formato safetensors con un tamaño de repositorio de 19,3 GB. La licencia es Apache 2.0, lo que permite uso comercial, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. Es relevante para desarrolladores e investigadores que necesiten un modelo multimodal de ~9B con ajuste fino específico sobre notas o documentación técnica, aunque la ausencia de benchmarks publicados y de información detallada sobre el dataset "harvey" limita su evaluación previa.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face; no se ha encontrado documentación adicional, paper ni resultados de evaluación en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal, image-text-to-text) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal de la familia Qwen 3.5 con capacidad image-text-to-text, y ha sido sometido a un ajuste fino completo (full-finetune), no a un entrenamiento con adaptadores. El nombre del repositorio indica que el objetivo de entrenamiento fue next-token prediction (NTP) sobre un dataset llamado "harvey", con regularización KL de coeficiente 0.01 para limitar la divergencia respecto al modelo base, y con un volumen de 10 millones de tokens distribuidos en lo que parecen ser 23 rondas (r0 a r22). No se dispone de información sobre la composición del dataset, la mezcla de datos, ni si se aplicaron etapas de RLHF o DPO.

La regularización KL sugiere una estrategia de ajuste conservador orientada a preservar las capacidades del modelo base mientras se especializa en el dominio de "harvey". Los tags incluyen "notes-only", lo que apunta a que el entrenamiento se centró en datos de tipo notas o documentación. No se han publicado detalles sobre innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base Qwen3.5-9B.
- Procesamiento multimodal image-text-to-text: acepta imágenes y texto como entrada, según el pipeline declarado.
- Conversación multi-turno (tag "conversational").
- Especialización en el dominio "harvey" y en datos de tipo "notes", según los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Modo thinking, visión, audio u otras capacidades especiales: no disponible más allá del pipeline image-text-to-text.

## Casos de uso

- Asistencia sobre documentación técnica: el ajuste "notes-only" sugiere que el modelo puede emplearse para responder preguntas y resumir notas internas o documentación de proyecto, aprovechando la especialización del entrenamiento.
- Procesamiento de capturas y diagramas: al ser image-text-to-text, puede extraer información de imágenes (capturas de pantalla, diagramas, tablas escaneadas) y combinarla con texto en un flujo conversacional.
- Chat de soporte interno: su naturaleza conversacional permite gestionar interacciones multi-turno con empleados o usuarios, siempre que se valide el dominio "harvey" en el que fue ajustado.
- Generación de resúmenes de reuniones y notas: el entrenamiento sobre notas lo hace adecuado para condensar actas, apuntes y documentación dispersa en resúmenes estructurados.
- Clasificación y extracción de información en documentos con imágenes: combinación de entrada visual y textual para tareas de extracción de campos en facturas, formularios o informes escaneados.
- Prototipado de asistentes multimodales: al estar disponible en formato safetensors y con licencia Apache 2.0, sirve para experimentar con pipelines image-text-to-text en entornos de investigación.
- Base para nuevos ajustes de dominio: al ser un full fine-tune del Qwen3.5-9B, puede reutilizarse como punto de partida para especializaciones adicionales, aunque el acceso gated debe tenerse en cuenta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de 19,3 GB (probablemente fp16/bf16), se necesitan al menos ~20 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache; en la práctica, se recomienda 24 GB o más para contexto corto.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para inferencia en precisión reducida; para contexto largo o batch grande, se recomienda A100/H100.
- Cabe en GPU consumer: sí, en RTX 4090 (24 GB) con cuantización o con contexto limitado; en GPUs de 16 GB requeriría cuantización a 8 bits o inferior, no disponible en el repo.
- Opciones de despliegue: transformers (librería declarada); no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-10m-kl-0p01 | ~9,65B | no disponible | Apache 2.0 | Gated | Full fine-tune de Qwen3.5-9B, multimodal, especializado en "harvey"/notes |
| Qwen/Qwen3.5-9B | ~9,65B | no disponible | no disponible en la información | no disponible | Modelo base del que deriva este ajuste |
| Alternativas de ~9B multimodal | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar el modelo, lo que puede retrasar su integración en pipelines automatizados.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni otras evaluaciones, por lo que el rendimiento real frente al modelo base es desconocido.
- Dataset "harvey" no documentado: se desconoce la composición, procedencia y posibles sesgos del corpus de entrenamiento, lo que impide evaluar riesgos de sesgo o contaminación.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente fuera del dominio de notas para el que fue ajustado.
- Idiomas no especificados: no se confirma el soporte multilingüe ni la calidad en castellano.
- Contexto no especificado: se desconoce la longitud máxima de contexto, lo que complica el dimensionamiento de memoria y el diseño de aplicaciones con documentos largos.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse que el modelo base Qwen3.5-9B y el dataset "harvey" no impongan restricciones adicionales.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad ni de pruebas independientes.
- Fecha de creación futura (2026-11-12): conviene verificar la autenticidad y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/U-WIN/qwen35-9b-harvey-v4-notes-r0-r22-ntp-10m-kl-0p01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
