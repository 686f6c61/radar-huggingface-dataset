# xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity-GGUF

## Resumen

Qwensploit 3.5 9B es un ajuste fino (fine-tune) especializado en ciberseguridad y red team sobre un merge de la familia Qwen3.5-9B, desarrollado por el usuario xtools-at. El modelo parte de `xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic`, un merge que combina destilaciones de razonamiento, código y capacidades generales de modelos Claude (Mythos, Fable y Opus) sobre la base Qwen3.5-9B. La variante publicada en este repositorio es la cuantización estática en formato GGUF del modelo original en safetensors, pensada para despliegue local con llama.cpp y derivados.

El objetivo declarado es asistir en investigación de seguridad, análisis de vulnerabilidades, revisión de código seguro, modelado de amenazas, ejercicios autorizados de pentesting y retos CTF. Con 8.953.803.264 parámetros totales (aproximadamente 9B) y una ventana de entrenamiento de 8.192 tokens, se posiciona como una alternativa de tamaño medio que cabe en GPU de consumo con cuantizaciones agresivas.

Es relevante ahora porque combina tres tendencias: la demanda de modelos locales sin censura para investigación ofensiva/defensiva, la práctica de destilar razonamiento desde modelos propietarios y la distribución en GGUF para inferencia en hardware asequible. La licencia declarada es Apache-2.0, aunque el propio autor advierte que está sujeta a revisión de compatibilidad con las licencias upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), fine-tune con LoRA sobre un merge de modelos |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | 8.192 tokens (longitud de contexto de entrenamiento) |
| Tipos de cuantizacion | GGUF: Q2_K_L (4,8 GB), Q4_K_M (5,6 GB), Q6_K (7,4 GB), Q8_0 (9,5 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (sujeta a revisión de compatibilidad con licencias upstream) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 9B parámetros. No se trata de un modelo entrenado desde cero, sino de un ajuste fino supervisado (SFT) mediante LoRA sobre el merge `Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic`, que a su vez combina destilaciones de razonamiento, código y capacidades generales procedentes de modelos Claude (Mythos, Fable y Opus) y de Qwen. El ajuste se realizó con rango LoRA `r=16`, alpha 32, dropout 0,02, aplicado a todos los módulos objetivo, optimizador AdamW de 8 bits, scheduler lineal, weight decay 0,002, learning rate 2e-4, batch 4x8 y una sola época sobre una NVIDIA A100 de 40 GB.

El conjunto de entrenamiento consta de 7.000 ejemplos (más 350 de evaluación) muestreados y barajados de cuatro datasets: CyberSec-Reasoning-Premium (2.305 entradas, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K Clean (925, 13%), con longitud máxima de entrada de 8.000 caracteres. La mezcla combina ejemplos de ciberseguridad y red team con datos sintéticos de razonamiento, código e instrucciones generales. Las métricas reportadas son loss de entrenamiento 0,476 y loss de evaluación 0,481 tras 219 pasos; el propio autor advierte que la loss es un diagnóstico de entrenamiento y no una medida de precisión en ciberseguridad.

## Capacidades

- Generación de texto y respuesta a preguntas técnicas de ciberseguridad.
- Razonamiento explícito (tag `reasoning`) orientado a análisis de vulnerabilidades y modelado de amenazas.
- Análisis de vulnerabilidades y revisión de código seguro.
- Conocimiento de red team y técnicas ofensivas (en entornos autorizados).
- Generación y asistencia de código, incluyendo scripting de seguridad.
- Resolución de retos CTF y apoyo a educación en seguridad.
- Capacidad multimodal de entrada imagen-texto según el `pipeline_tag` (`image-text-to-text`), heredada de la familia base; no se detalla en la model card el alcance exacto de esta capacidad.
- Modelo «uncensored»/«heretic»: sin los filtros de rechazo habituales de los modelos alineados.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Multilingüe: limitado a inglés según los metadatos de idioma.

## Casos de uso

- Revisión de código seguro en CI/CD: el modelo puede analizar diffs y sugerir correcciones de vulnerabilidades (inyección SQL, XSS, deserialización insegura) integrándose como paso de revisión asistida antes del merge, aprovechando su ajuste específico en secure coding.
- Modelado de amenazas y análisis de arquitectura: dado un diseño de sistema, generar listas de amenazas tipo STRIDE, superficies de ataque y contramedidas, apoyándose en el entrenamiento con datasets de razonamiento en ciberseguridad.
- Ejercicios de red team autorizados: generar hipótesis de ataque, técnicas de enumeración y comandos de prueba para entornos de laboratorio con alcance definido, gracias al ajuste sobre RedTeam-Premium y a la ausencia de rechazos del modelo base «uncensored».
- Formación y CTF: explicar paso a paso la resolución de retos (web, criptografía, reversing básico) y justificar cada decisión, útil en plataformas de formación con contexto de 8.192 tokens para enunciados largos.
- Triaje de incidentes: resumir logs y alertas, proponer hipótesis de compromiso y pasos de contención, en despliegues locales con GGUF Q4_K_M (5,6 GB) sobre una única GPU de consumo.
- Asistente de investigación en laboratorio: responder preguntas técnicas sobre CVEs, técnicas MITRE ATT&CK y contramedidas, ejecutándose en local para evitar enviar datos sensibles a APIs externas.
- Automatización de scripting de seguridad: generar y explicar scripts de análisis (escaneo, parsing de resultados, informes) en pipelines internos, con validación humana obligatoria de la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento (loss 0,476 en train y 0,481 en evaluación) y advierte explícitamente que la loss no mide precisión en ciberseguridad ni seguridad del modelo; se requieren evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): Q2_K_L ≈ 4,8 GB, Q4_K_M ≈ 5,6 GB, Q6_K ≈ 7,4 GB, Q8_0 ≈ 9,5 GB; añadir 1-3 GB según contexto y batch.
- GPU recomendadas: NVIDIA A100 40 GB o H100 para el modelo completo en precisión alta y contextos largos; RTX 4090 (24 GB) para Q8_0 o Q6_K con contexto completo; RTX 3090/4080 (16-24 GB) para Q6_K/Q8_0.
- Cabe en GPU de consumo: sí. Q4_K_M (5,6 GB) entra en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060); Q2_K_L (4,8 GB) en tarjetas de 6-8 GB con contexto reducido; Q8_0 requiere 12 GB o más.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repo incluye el tag `endpoints_compatible`. Para el modelo base en safetensors, vLLM o TGI.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit 3.5 9B (este) | ~9B | 8.192 | Ciberseguridad y red team, sin censura | Apache-2.0 (sujeta a revisión upstream) | GGUF, safetensors |
| Qwensploit 4B | ~4B | no disponible | Ciberseguridad y red team | Apache-2.0 (según repo del autor) | no disponible |
| Qwensploit 2B | ~2B | no disponible | Ciberseguridad y red team | Apache-2.0 (según repo del autor) | no disponible |
| Qwen3.5-9B (base de la familia) | ~9B | no disponible | Propósito general | no disponible | safetensors |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes; la comparación se limita a tamaño, especialización y licencia.

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, código inseguro o consejos de seguridad desactualizados; validar siempre las salidas.
- Los datos de destilación sintética pueden contener errores heredados de los modelos profesor.
- El rendimiento en tareas reales de seguridad no ha sido establecido de forma independiente.
- Uso ofensivo restringido exclusivamente a sistemas con autorización explícita de pruebas.
- Modelo «uncensored»: no incorpora filtros de rechazo, por lo que puede producir contenido peligroso; requiere supervisión y políticas de uso en producción.
- Idioma limitado al inglés; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto de 8.192 tokens: insuficiente para análisis de repositorios completos o logs extensos sin troceado.
- Licencia Apache-2.0 declarada pero sujeta a revisión de compatibilidad con las licencias de los modelos y datasets upstream; verificar antes de uso comercial.
- Existe una versión posterior (`xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF`) indicada en la model card; evaluar migración.
- Riesgo de alucinación en referencias a CVEs, comandos y APIs concretas; contrastar con fuentes primarias.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity-GGUF
- Modelo base (safetensors): https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Merge base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Merge relacionado: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge
- Familia Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Versión 2B: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Versión 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Versión posterior V2: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente upstream Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente upstream Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente upstream claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente upstream qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
