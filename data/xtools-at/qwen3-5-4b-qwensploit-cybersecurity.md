# xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity

## Resumen

Qwensploit 3.5 4B es un ajuste fino (fine-tune) especializado en ciberseguridad del modelo base xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic, desarrollado por xtools-at. El modelo parte de la familia Qwen3.5-4B y ha sido entrenado mediante LoRA supervisado sobre 7.000 ejemplos de cuatro datasets orientados a razonamiento en seguridad, red-team, destilación de razonamiento y destilación de código. Su proposito es asistir en tareas de analisis de vulnerabilidades, revision de codigo seguro, modelado de amenazas, ejercicios de pentesting autorizados y retos CTF.

El modelo tiene 4.539.265.536 parametros totales (aproximadamente 4,5 mil millones), un tamano de repositorio de 9,3 GB y una longitud de contexto de entrenamiento de 8.192 tokens. La model card lo etiqueta con el pipeline image-text-to-text, aunque el entrenamiento descrito se centra en texto, razonamiento y codigo. Es relevante ahora porque combina un modelo base descensurado (heretic/uncensored) con datos especificos de seguridad ofensiva y defensiva, lo que lo convierte en una opcion practica para laboratorios de seguridad que necesitan un modelo pequeno, desplegable en hardware modesto y con licencia Apache-2.0 declarada.

Se trata de un modelo de nicho: no esta pensado como asistente generalista, sino como herramienta de apoyo a investigadores de seguridad. Su utilidad depende de validacion externa, ya que el autor no publica benchmarks independientes de precision en tareas de ciberseguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste fino con LoRA sobre modelo merge |
| Parametros totales | 4.539.265.536 (aproximadamente 4,5 mil millones) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (sujeta a revision de compatibilidad de licencias upstream) |
| Formato de pesos | safetensors (transformers; adaptadores LoRA/peft) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5-4B, sobre el que se aplico un ajuste fino supervisado (SFT) con LoRA. El modelo base directo es un merge de tres ajustes destilados de Claude Opus (razonamiento, codigo y razonamiento multi-paso), combinado con una variante heretic/uncensored. El entrenamiento uso LoRA con rango r=16, alpha=32, dropout 0,02, modulos objetivo "all", optimizador AdamW 8-bit, scheduler lineal, weight decay 0,002, learning rate 2e-4, batch efectivo 4x8, una epoca sobre 7.000 entradas y 350 entradas de evaluacion, con longitud maxima de entrada de 8.000 tokens. Se ejecuto en una NVIDIA A100 de 40 GB.

La mezcla de datos fue aleatoria y barajada: CyberSec-Reasoning-Premium (2.305 entradas, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K Clean (925, 13%). Las fuentes de segundo nivel incluyen Cybersecurity Reasoning Dataset, Ultimate Offensive Red Team, claude_mythos_distilled_25k y qwen3.8-max-distillation-50k. No se documenta RLHF ni DPO; el proceso es exclusivamente SFT con datos sinteticos destilados, lo que implica que los errores del modelo profesor pueden propagarse al ajuste.

## Capacidades

- Generacion de texto y razonamiento tecnico orientado a seguridad.
- Analisis de vulnerabilidades y revision de codigo seguro.
- Conocimiento de red-team, tecnicas ofensivas y escenarios de pentesting autorizado.
- Resolucion de retos CTF y educacion en seguridad.
- Generacion y explicacion de codigo, con soporte de razonamiento multi-paso.
- Question answering tecnico sobre ciberseguridad.
- Conversacion multi-turno (tag conversational) dentro de la ventana de contexto.
- Capacidad multimodal declarada por el pipeline (image-text-to-text), aunque el entrenamiento documentado es textual; no hay detalle sobre rendimiento en vision.
- Modo descensurado (uncensored/heretic) que reduce rechazos en consultas de seguridad ofensiva.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente autonomo: no disponible en la informacion proporcionada.
- Multilingue: limitado al ingles segun la model card.

## Casos de uso

- Revision de codigo seguro en pipelines de CI/CD: el modelo puede analizar diffs y sugerir correcciones de inyeccion, validacion de entradas o manejo de secretos, aprovechando su entrenamiento en codigo y seguridad; requiere validacion humana antes de merge.
- Analisis de vulnerabilidades en laboratorio: dado un fragmento de codigo o un informe de escaneo, el modelo genera hipotesis de explotacion y recomendaciones de mitigacion, util para triaje inicial de hallazgos.
- Modelado de amenazas: a partir de una descripcion de arquitectura, produce listas de actores, superficies de ataque y contramedidas, con contexto de hasta 8.192 tokens para especificaciones tecnicas.
- Ejercicios de red-team autorizados: ayuda a disenar escenarios de ataque, cadenas de explotacion y planes de prueba dentro de entornos controlados con autorizacion explicita.
- Formacion y retos CTF: explica tecnicas, resuelve pistas y guia pasos de explotacion en entornos de aprendizaje, con bajo coste de despliegue por su tamano de 4,5B.
- Asistencia a analistas SOC: responde preguntas sobre tecnicas MITRE ATT&CK, indicadores de compromiso y procedimientos de respuesta, integrable en herramientas internas de consulta.
- Generacion de documentacion de seguridad: redacta politicas, runbooks y checklists de hardening a partir de requisitos, apropiado por su capacidad conversacional y de codigo.
- Educacion y concienciacion: simula preguntas de usuarios sobre amenazas comunes y explica conceptos de seguridad con ejemplos de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento:

| Metrica | Valor |
|---|---:|
| Training loss (final) | 0,524 |
| Evaluation loss (final) | 0,532 |
| Training loss (step 48) | 0,695 |
| Training loss (step 96) | 0,699 |
| Training loss (step 144) | 0,546 |
| Training loss (step 192) | 0,530 |
| Evaluation loss (step 48) | 0,700 |
| Evaluation loss (step 96) | 0,604 |
| Evaluation loss (step 144) | 0,558 |
| Evaluation loss (step 192) | 0,537 |

El propio autor advierte que la loss es un diagnostico de entrenamiento, no una medida de precision en ciberseguridad ni de seguridad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 9-10 GB solo para pesos (4,54B parametros), mas overhead de activaciones y cache KV; en torno a 11-13 GB en la practica. En cuantizacion de 8 bits, aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB (estimaciones teoricas, no publicadas por el autor).
- GPU recomendadas: NVIDIA A100 40 GB (usada en entrenamiento), H100, L40S, A10G; para inferencia basta una RTX 4090 (24 GB) o RTX 3090 (24 GB) en BF16.
- Cabe en GPU consumer: si, en RTX 4090/3090 (24 GB) en BF16; en RTX 4060 Ti 16 GB o RTX 4070 Ti 12 GB con cuantizacion 8/4 bits; en GPUs de 8 GB probablemente solo con cuantizacion agresiva.
- Opciones de despliegue: transformers con peft (adaptadores LoRA), vLLM, TGI, llama.cpp/Ollama si se generan pesos GGUF (no publicados en el repo), y endpoints compatibles (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit 3.5 4B | 4,54B | 8.192 | Ciberseguridad/red-team, uncensored | Apache-2.0 (revisar upstream) | Hugging Face |
| Qwensploit 3.5 2B (xtools-at) | no disponible | no disponible | Ciberseguridad/red-team | Apache-2.0 (segun model card) | Hugging Face |
| Qwensploit 3.5 9B (xtools-at) | no disponible | no disponible | Ciberseguridad/red-team | Apache-2.0 (segun model card) | Hugging Face |
| Qwen3.5-4B (Qwen) | aproximadamente 4B | no disponible | Modelo generalista base | no disponible en la informacion | Hugging Face |

La model card menciona tambem Qwensploit-V2-4B-CyberSecurity-Qwen3.5 como nueva version. No se dispone de datos de benchmarks comparativos entre estas variantes.

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, codigo inseguro o consejos de seguridad desactualizados.
- Los datos sinteticos de destilacion pueden contener errores heredados de los modelos profesores.
- El rendimiento en tareas reales de seguridad no ha sido establecido de forma independiente.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al entrenarse con datos sinteticos y de red-team, puede amplificar perspectivas ofensivas.
- Riesgo de alucinacion en referencias CVE, herramientas, comandos y versiones de software; validar siempre.
- Limitacion de idioma: solo ingles; no se garantiza calidad en castellano u otros idiomas.
- Contexto limitado a 8.192 tokens, insuficiente para grandes bases de codigo o logs extensos.
- Restricciones de licencia: aunque se declara Apache-2.0, la licencia upstream debe revisarse antes de redistribuir o usar comercialmente; en particular, el dataset de destilacion Qwen documenta restricciones heredadas.
- Uso ofensivo solo en sistemas con autorizacion explicita; el modelo esta descensurado y puede producir contenido operacional de ataque.
- El pipeline declarado es image-text-to-text, pero no hay evidencia de entrenamiento multimodal ni benchmarks de vision; no asumir capacidades de imagen.
- Modelo de nicho con 215 descargas y 0 likes en el momento de la ficha; madurez y soporte comunitario limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-CyberSecurity (URL indicada en la informacion: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity)
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Modelo relacionado (merge): https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- Familia Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwensploit 2B: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Qwensploit 9B: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Nueva version V2: xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5 (referenciada en la model card)
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
