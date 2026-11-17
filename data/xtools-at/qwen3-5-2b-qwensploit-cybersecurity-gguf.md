# xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity-GGUF

## Resumen

Qwensploit 3.5 2B es un ajuste fino (fine-tune) de orientación a ciberseguridad construido sobre un merge de la familia Qwen3.5-2B. Lo desarrolla el usuario xtools-at y se distribuye en formato GGUF cuantizado de forma estática a partir del modelo original en pesos completos. El objetivo declarado es asistir en razonamiento de seguridad, análisis de vulnerabilidades, revisión de código seguro, conocimiento de red team y respuesta a preguntas técnicas, incluyendo entornos de CTF y pentesting autorizado.

El modelo parte de una cadena de derivación poco convencional: el base directo es un merge de seis vías denominado MultiDistill-Megamix, marcado como "uncensored" y "heretic", que a su vez combina destilaciones de razonamiento y código. Sobre esa base se aplicó un LoRA supervisado con 7.000 ejemplos procedentes de cuatro datasets, con una ventana de contexto de entrenamiento de 8.192 tokens. El resultado es un modelo pequeño (1.881.825.088 parámetros reales según safetensors, es decir, aproximadamente 1,88 mil millones) pensado para ejecutarse en hardware modesto.

Su relevancia actual es doble: por un lado, ofrece un modelo de seguridad de bolsillo que cabe en GPU de consumo gracias a sus cuantizaciones de 1,1 a 2,0 GB; por otro, su licencia Apache-2.0 y su naturaleza descensurada lo convierten en una pieza delicada para producción, ya que las capacidades ofensivas que habilita exigen un marco de uso autorizado. La model card advierte explícitamente de que no existen benchmarks independientes y de que las salidas pueden ser incorrectas o inseguras.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino con LoRA sobre un merge de seis vías |
| Parametros totales | 1.881.825.088 (aproximadamente 1,88 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento declarada) |
| Tipos de cuantizacion | Q2_K_L (1,1 GB), Q4_K_M (1,3 GB), Q6_K (1,6 GB), Q8_0 (2,0 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0, sujeta a revisión de compatibilidad con las licencias upstream |
| Formato de pesos | GGUF (repo cuantizado); el modelo base se distribuye en safetensors |
| Pipeline declarado | image-text-to-text (según metadatos de Hugging Face) |
| Modalidad | Texto; el tag image-text-to-text figura en los metadatos pero no se documenta soporte de visión en la model card |
| Tamaño del repo | 6,6 GB |
| Descargas | 2.331 |
| Fecha de creación | 2026-10-19 |
| Última actualización | 2026-11-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 en su variante de 2B, sobre el que se ha aplicado un ajuste fino supervisado mediante LoRA. El base directo es xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic, un merge de seis vías que combina destilaciones de razonamiento, código y razonamiento multi-paso procedentes de modelos maestros de la familia Claude (Mythos, Fable y Opus, según la model card). No se documenta ninguna innovación arquitectónica propia: se trata de un fine-tune, no de un modelo con atención lineal, SSM ni decodificación especulativa descrita.

El entrenamiento usó 7.000 ejemplos mezclados y barajados aleatoriamente, con longitud máxima de entrada de 8.000 caracteres, más 350 ejemplos de evaluación. La composición es: CyberSec-Reasoning-Premium (2.305 entradas, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K Clean (925, 13%). La configuración fue de 1 época, contexto de 8.192, learning rate 2e-4, batch 4x8, LoRA con r=16, alpha=32, dropout 0,02 y módulos objetivo "all", optimizador AdamW de 8 bits, scheduler lineal y weight decay 0,002, sobre una única NVIDIA L4 de 24 GB. No se menciona RLHF ni DPO; es exclusivamente SFT. Las pérdidas finales reportadas son 0,710 de entrenamiento y 0,696 de evaluación, con una curva descendente desde 0,983/0,828 en el paso 66 hasta 0,710/0,696 en el paso 219.

## Capacidades

- Generación de texto y respuesta a preguntas técnicas de ciberseguridad.
- Razonamiento sobre vulnerabilidades: análisis de causas, impacto y mitigación.
- Revisión de código seguro y detección de patrones inseguros.
- Conocimiento de red team: técnicas ofensivas, reconocimiento y explotación en contextos autorizados.
- Asistencia en retos CTF y educación en seguridad.
- Razonamiento multi-paso y código, heredados de la base destilada.
- Respuesta conversacional multi-turno (tag `conversational`).
- Modo descensurado ("uncensored", "heretic"): menor rechazo a peticiones de temática sensible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión: no disponibles; el tag `image-text-to-text` no se desarrolla en la model card.
- Capacidades multilingües: limitadas al inglés.

## Casos de uso

- Revisión de código seguro en CI/CD: el modelo puede analizar diffs y señalar patrones de inyección, manejo inseguro de secretos o validación insuficiente de entradas, integrándose como paso de revisión previo al merge gracias a su contexto de 8.192 tokens.
- Triaje de vulnerabilidades: dado un CVE o un informe de escaneo, generar una explicación del vector de ataque, el impacto potencial y las mitigaciones recomendadas, útil para equipos de defensa con poco tiempo de análisis.
- Modelado de amenazas: a partir de una descripción de arquitectura, producir listas de amenazas STRIDE y contramedidas, como borrador que el analista valida.
- Formación y concienciación: generar escenarios de phishing, ejercicios de mesa y explicaciones didácticas de ataques para programas internos de seguridad.
- Práctica de CTF: resolver retos de categorías web, criptografía o reversing con explicaciones paso a paso, en local y sin depender de APIs externas.
- Pentesting autorizado: apoyo en la fase de reconocimiento y en la redacción de informes, generando hipótesis de explotación que el pentester valida manualmente en el alcance acordado.
- Asistente local air-gapped: al caber en 1,1-2,0 GB, puede desplegarse en estaciones de trabajo sin conexión para consultas de seguridad que no deben salir de la red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta pérdidas de entrenamiento (0,710) y evaluación (0,696), y advierte explícitamente de que la pérdida es un diagnóstico de entrenamiento, no una medida de precisión en ciberseguridad, y de que se necesitan evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q2_K_L, 1,3 GB con Q4_K_M, 1,6 GB con Q6_K y 2,0 GB con Q8_0, más el overhead del runtime y la caché KV para 8.192 tokens.
- GPU recomendadas: cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 4090); en servidor, NVIDIA L4, A10, A100 o H100 para mayor throughput.
- Cabe holgadamente en GPU de consumo; con Q4_K_M es viable incluso en iGPU con memoria unificada y en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repo declara `endpoints_compatible`. vLLM y TGI no están confirmados para este formato en la información disponible.
- Latencia y throughput: no disponibles. El entrenamiento se realizó en una NVIDIA L4 de 24 GB, pero no se publican métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwensploit 3.5 2B (este) | ~1,88 B | 8.192 | Ciberseguridad y red team, descensurado | Apache-2.0 (sujeta a revisión upstream) | GGUF, safetensors |
| Qwensploit 4B (xtools-at) | ~4 B (no confirmado) | no disponible | Ciberseguridad y red team | Apache-2.0 | no disponible |
| Qwensploit 9B (xtools-at) | ~9 B (no confirmado) | no disponible | Ciberseguridad y red team | Apache-2.0 | no disponible |
| Qwen3.5-2B (Qwen) | ~2 B | no disponible | Propósito general | no disponible | safetensors |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes. La comparación se limita a tamaño, linaje y licencia.

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, código inseguro o consejos de seguridad obsoletos; la model card lo advierte de forma explícita.
- Los datos de destilación sintética pueden contener errores heredados de los modelos maestros.
- El rendimiento en tareas de seguridad del mundo real no ha sido establecido de forma independiente.
- Naturaleza descensurada: menor rechazo a peticiones ofensivas, lo que eleva el riesgo de uso indebido; debe restringirse a entornos con autorización explícita.
- Solo inglés; sin soporte multilingüe documentado.
- Contexto de 8.192 tokens, insuficiente para análisis de repositorios completos o logs extensos.
- Licencia Apache-2.0 declarada, pero sujeta a revisión de compatibilidad con las licencias de los datasets y modelos upstream; conviene auditar antes de uso comercial.
- Modelo pequeño: propenso a alucinación en detalles técnicos específicos (números de CVE, versiones, sintaxis de exploits).
- El tag `image-text-to-text` en los metadatos no se corresponde con capacidades de visión documentadas; no asumir multimodalidad.
- Existe una versión posterior (Qwensploit-V2-2B-CyberSecurity-Qwen3.5) que el autor marca como `new_version`, lo que sugiere que este modelo puede quedar obsoleto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity-GGUF
- Modelo base (pesos completos): https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Base directo del fine-tune: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Merge relacionado: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge
- Familia Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Variante 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Variante 9B: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Versión posterior V2: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-GGUF
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente upstream Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente upstream Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente upstream claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente upstream qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
