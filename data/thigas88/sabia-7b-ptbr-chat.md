# thigas88/sabia-7b-ptbr-chat

## Resumen

Sabiá-7B PT-BR Chat (LoRA) es un adaptador PEFT/LoRA creado por el usuario Thiago (thigas88) que añade capacidades de seguimiento de instrucciones y conversación en portugués brasileño sobre el modelo base maritaca-ai/sabia-7b de Maritacai. El modelo base es un fine-tuning de LLaMA-1, con arquitectura decoder-only y una ventana de contexto de 2048 tokens. Este adaptador se entrenó con QLoRA (cuantización de 4 bits) sobre los datasets Canarim-Instruct-PTBR-Dataset y ultra-alpaca-ptbr, y está optimizado para dialogar en portugués brasileño. Su relevancia radica en que ofrece una alternativa ligera basada en adaptadores para tareas de chat en portugués, aunque con importantes limitaciones de licencia y contexto.

El repositorio contiene exclusivamente el adaptador (0.3 GB en formato safetensors), que debe cargarse junto con el modelo base para funcionar. La licencia es "other" y hereda las restricciones de LLaMA-1, por lo que su uso está limitado a investigación y no se permite uso comercial. Además, parte de los datos de entrenamiento (Canarim) son CC-BY-NC-4.0, lo que refuerza la restricción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA-1) |
| Parametros totales | No disponible (adaptador; el modelo base maritaca-ai/sabia-7b tiene ~7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | LoRA entrenado con QLoRA 4-bit (no se especifican cuantizaciones de inferencia) |
| Idiomas soportados | Portugues (pt-br) |
| Licencia | other (restringida a investigacion; no uso comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base Sabiá-7B es un transformer decoder-only basado en LLaMA-1, originalmente entrenado con datos en portugués. El adaptador thigas88/sabia-7b-ptbr-chat se entrena mediante QLoRA de 4 bits, una técnica de fine-tuning eficiente en memoria que congela los pesos del modelo base y entrena matrices de bajo rango (LoRA) en capas específicas. El entrenamiento se realizó sobre dos datasets de instrucciones en portugués: Canarim-Instruct-PTBR-Dataset y ultra-alpaca-ptbr. El resultado es un modelo fine-tuned por SFT (supervised fine-tuning) para conversación, sin emplear RLHF ni DPO. No se reporta ninguna innovación técnica más allá del uso de LoRA; el modelo hereda las limitaciones del base, incluido un tokenizer de LLaMA-1 poco eficiente para portugués.

## Capacidades

- Generacion de texto conversacional en portugues brasileño, con formatos de instruccion y "chat".
- Seguimiento de instrucciones basicas: el modelo puede responder preguntas, explicar conceptos y mantener dialogos multi-turno si se usa el template de chat especificado.
- No soporta tool calling / function calling ni agentes.
- No soporta vision ni audio.
- Capacidades multilingues: el adaptador esta centrado en portugues brasileño; el modelo base puede tener algo de ingles, pero no se garantiza.
- No se ha confirmado soporte de "thinking mode" ni de razonamiento extendido.

## Casos de uso

- Asistentes conversacionales en portugues brasileño para atencion al cliente basica: el modelo puede gestionar consultas frecuentes con multiples turnos usando el template `### Sistema:` / `### Usuario:` / `### Assistente:`, aunque la ventana de 2048 tokens limita la duracion de la conversacion.
- Bots de respuesta a preguntas frecuentes (FAQ) en empresas brasileñas: adecuado para contextos cortos y respuestas directas en lenguaje natural en pt-BR.
- Herramientas de redaccion y revision de textos en portugues: puede generar borradores, resumir textos o reformular parrafos con tono informal o formal segun la instruccion.
- Explicacion de conceptos normativos en lenguaje simple, como la LGPD, para fines educativos o de divulgacion interna (nunca como consejo legal).
- Tutores de idioma para estudiantes de portugues: el modelo puede mantener practicas de conversacion y responder preguntas basicas en pt-BR.
- Generacion de contenido para redes sociales en portugues brasileño: creatividad limitada pero util para textos cortos como descripciones o subtitulos, siempre con revision humana.
- Investigacion comparativa sobre fine-tuning LoRA en portugues: sirve como referencia para estudiar tecnicas de adaptacion eficiente en modelos LLaMA-1 para pt-BR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador, se necesita cargar el modelo base de ~7B. En FP16, se estima un minimo de 14 GB de VRAM. Con cuantizacion 4-bit del base, podria reducirse a unos 6-8 GB, pero no se documenta ninguna cuantizacion oficial para el modelo completo.
- GPU recomendadas: RTX 4090 (24 GB), A100 40 GB, H100 80 GB. El adaptador en si mismo ocupa muy poco espacio (0.3 GB).
- Capacidad en GPU de consumo: el modulo podria caber en una RTX 3060 12 GB si se cuantiza el base, pero no se proporcionan instrucciones de inferencia cuantizada. El adaptador se carga sobre el modelo base con `device_map="auto"`.
- Opciones de despliegue: Transformers con `PeftModel`, tal como se muestra en el README. No se menciona soporte para vLLM, llama.cpp ni Ollama, aunque es posible exportar el base + adaptador a GGUF de forma manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| thigas88/sabia-7b-ptbr-chat (adaptador) | ~7B (base) | 2048 | other (renombrada investigacion) | HuggingFace, adaptador PEFT |
| maritaca-ai/sabia-7b | 7B | 2048 | no especificada (hereda LLaMA-1) | HuggingFace, modelo completo |
| Llama-2-7b-chat | 7B | 4096 | Llama 2 Community License | HuggingFace, base comercial con restricciones |
| Ultra-ALPACA-PTBR (adapter, p. ej.) | ~7B (base Llama) | variable | variable | No disponible en la informacion actual |

Observacion: la comparativa se basa solo en datos publicos generales; no se dispone de benchmarks ni de detalles sobre los modelos comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia restringida: el modelo hereda la licencia de LLaMA-1, limitada a investigacion. El repositorio no autoriza uso comercial. Ademas, parte del dataset Canarim es CC-BY-NC-4.0, lo que refuerza la prohibicion de usos comerciales.
- Corte de conocimiento del modelo base: mediados de 2022. No conoce eventos posteriores.
- Tokenizer de LLaMA-1 poco eficiente en portugues: puede generar suboptimizaciones en el procesamiento de texto en pt-BR.
- Contexto corto de 2048 tokens: limita la posibilidad de mantener conversaciones largas o procesar documentos extensos.
- Riesgo de alucinacion: el modelo puede inventar hechos o mezclar registros, por lo que no debe emplearse para aconsejamiento juridico o medico sin revision humana.
- El adaptador no incluye `chat_template` en el tokenizer; es obligatorio usar el formato de prompt indicado en el README. Si no se usa, el modelo puede comportarse incorrectamente.
- No se garantiza la calidad de las respuestas fuera del dominio de portugues brasileño, y puede fallar en tareas de razonamiento complejo o codigo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thigas88/sabia-7b-ptbr-chat
- Modelo base: https://huggingface.co/maritaca-ai/sabia-7b
- Dataset Canarim-Instruct-PTBR: https://huggingface.co/datasets/dominguesm/Canarim-Instruct-PTBR-Dataset
- Dataset ultra-alpaca-ptbr: https://huggingface.co/datasets/recogna-nlp/ultra-alpaca-ptbr
