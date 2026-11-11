# xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity-GGUF

## Resumen

Qwensploit 3.5 4B es un ajuste fino (fine-tune) especializado en ciberseguridad del modelo Qwen3.5-4B, desarrollado por el usuario xtools-at. El modelo parte de un merge previo (Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic) que combina destilaciones de razonamiento de Claude Opus con fine-tunes de codigo, y sobre el se aplica un entrenamiento supervisado con LoRA sobre 7.000 ejemplos de dominios de seguridad ofensiva y defensiva. La version documentada aqui es la cuantizacion estatica en formato GGUF, pensada para inferencia local eficiente.

El modelo resuelve la necesidad de un asistente tecnico orientado a tareas de seguridad: analisis de vulnerabilidades, revision de codigo seguro, modelado de amenazas, ejercicios de red team autorizados y retos CTF. Con 4.205.751.296 parametros totales y una ventana de contexto de entrenamiento de 8.192 tokens, se posiciona en el segmento de modelos pequenos desplegables en hardware de consumo, lo que resulta relevante para investigadores que necesitan ejecutar analisis sensibles sin enviar datos a servicios en la nube.

El interes actual radica en su naturaleza "uncensored" (sin los filtros de rechazo habituales del modelo base), su licencia Apache-2.0 y la disponibilidad de cuantizaciones GGUF de entre 2,1 GB y 4,5 GB. Todo ello lo convierte en una herramienta practica para laboratorios de seguridad, aunque con advertencias importantes sobre validacion de salidas y uso etico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste fino con LoRA; pipeline declarado image-text-to-text |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | Q2_K_L (2,1 GB), Q4_K_M (2,7 GB), Q6_K (3,5 GB), Q8_0 (4,5 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0, sujeta a revision de compatibilidad con licencias upstream |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre la familia Qwen3.5-4B mediante una cadena de merges y ajustes: primero un merge de tres variantes (Claude-3xMerge-Jackrong) que integra destilaciones de razonamiento de Claude Opus, codigo y razonamiento multi-paso; despues una variante "uncensored/heretic" que elimina los comportamientos de rechazo; y finalmente un ajuste fino supervisado con LoRA sobre ese merge. El entrenamiento LoRA emplea rango 16, alpha 32, dropout 0.02, modulos objetivo "all", optimizador AdamW de 8 bits, learning rate 2e-4 con scheduler lineal y weight decay 0.002, ejecutado durante 1 epoca en una NVIDIA A100 de 40 GB con batch de 4x8.

Los datos de entrenamiento son 7.000 ejemplos mezclados y barajados aleatoriamente, con longitud maxima de entrada de 8.000 caracteres, repartidos en cuatro datasets: CyberSec-Reasoning-Premium (2.305 entradas, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K Clean (925, 13%). Estos datasets derivan a su vez de fuentes como Cybersecurity Reasoning Dataset, Ultimate Offensive Red Team, claude_mythos_distilled_25k y qwen3.8-max-distillation-50k. La perdida final reportada fue de 0.524 en entrenamiento y 0.532 en evaluacion (350 ejemplos), con seguimiento por pasos desde 0.695/0.700 en el paso 48 hasta 0.524/0.532 en el paso 219. No se documenta una fase de RLHF o DPO; el metodo es exclusivamente SFT con LoRA.

## Capacidades

- Generacion de texto tecnico y razonamiento especializado en ciberseguridad.
- Analisis de vulnerabilidades y revision de codigo seguro.
- Conocimiento de tecnicas de red team y seguridad ofensiva (en entornos autorizados).
- Modelado de amenazas, analisis de incidentes y seguridad defensiva.
- Resolucion de retos CTF y asistencia en educacion en seguridad.
- Generacion y explicacion de codigo en contextos de seguridad.
- Razonamiento multi-paso heredado de las destilaciones del modelo base.
- Respuestas sin rechazo (comportamiento "uncensored"), orientado a investigacion.
- Capacidad multimodal declarada por el pipeline (image-text-to-text), heredada del modelo base; no se detalla su alcance en la informacion disponible.
- Soporte de conversacion multi-turno (tag conversational).
- No se documenta soporte explicito de tool calling ni de modo thinking.

## Casos de uso

- Revision de codigo seguro en pipelines CI/CD: el modelo puede analizar fragmentos de codigo en busca de patrones inseguros (inyeccion SQL, desbordamientos, gestion de secretos) e integrarse como paso de revision automatizada antes del merge, aprovechando su entrenamiento en codigo y seguridad.
- Analisis de vulnerabilidades en laboratorio: dado un CVE o una descripcion de fallo, generar hipotesis de explotacion y recomendaciones de mitigacion, útil para equipos de seguridad que preparan informes tecnicos.
- Ejercicios de red team autorizados: apoyar la planificacion de pruebas de penetracion con sugerencias de tecnicas, herramientas y vectores de ataque, siempre dentro de un alcance contractual definido.
- Modelado de amenazas: a partir de una descripcion de arquitectura de sistema, producir listas de amenazas, superficies de ataque y contramedidas, con contexto de hasta 8.192 tokens suficiente para arquitecturas de tamano medio.
- Formacion y CTF: generar explicaciones paso a paso de tecnicas de explotacion y resolucion de retos, útil en entornos docentes donde se necesita material detallado sin filtros de rechazo.
- Analisis de incidentes: resumir y correlacionar indicadores tecnicos (comandos, trazas, artefactos) para apoyar la respuesta a incidentes en entornos controlados.
- Asistente local de seguridad para datos sensibles: al ejecutarse en GGUF sobre hardware propio (desde 2,1 GB en Q2_K_L), permite procesar informacion confidencial de infraestructura sin salir de la red corporativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta metricas de entrenamiento (perdida de 0.524 en entrenamiento y 0.532 en evaluacion) y advierte explicitamente de que la perdida es un diagnostico de entrenamiento, no una medida de precision en ciberseguridad, y de que se necesitan benchmarks independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3-4 GB para Q2_K_L (2,1 GB de pesos), 4-5 GB para Q4_K_M (2,7 GB), 5-6 GB para Q6_K (3,5 GB) y 6-7 GB para Q8_0 (4,5 GB), anadiendo margen para el contexto KV cache.
- GPU recomendadas: NVIDIA A100 40 GB fue la usada en entrenamiento; para inferencia bastan GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, o GPUs de datacenter como A10, L4 o A100.
- Cabe en GPU de consumo: si, todas las cuantizaciones caben en GPUs con 8 GB o mas de VRAM; Q2_K_L y Q4_K_M caben incluso en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con GGUF; la model card indica "endpoints_compatible" y el repo incluye formato transformers para el modelo base.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit 3.5 4B (este) | 4,2 B | 8.192 | Ciberseguridad y red team, sin censura | Apache-2.0 | GGUF y safetensors en HF |
| Qwen3.5-4B (base) | 4 B aprox. | No disponible | Uso general | No disponible | HF |
| Qwen3.5-2B-Qwensploit | 2 B aprox. | No disponible | Ciberseguridad y red team | Apache-2.0 | HF |
| Qwen3.5-9B-Qwensploit | 9 B aprox. | No disponible | Ciberseguridad y red team | Apache-2.0 | HF |

La comparativa con modelos de la misma categoria (asistentes de ciberseguridad open source) no esta disponible en la informacion proporcionada; las alternativas documentadas son las otras tallas de la propia familia Qwensploit.

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, codigo inseguro o consejos de seguridad desactualizados; la model card exige validar codigo y recomendaciones.
- Los datos de destilacion sintetica pueden contener errores heredados de los modelos profesor.
- El rendimiento en tareas de seguridad del mundo real no ha sido establecido de forma independiente.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La licencia es Apache-2.0 pero sujeta a revision de compatibilidad con las licencias upstream (datasets y modelo base), lo que puede condicionar el uso comercial.
- Comportamiento "uncensored": puede producir contenido ofensivo o peligroso; debe usarse solo en sistemas con autorizacion explicita de pruebas.
- La ventana de contexto de entrenamiento es de 8.192 tokens; no se garantiza un comportamiento correcto mas alla de esa longitud.
- Existe una version posterior (Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF) que el autor marca como nueva version.
- Riesgo de alucinacion en detalles tecnicos (versiones de software, CVEs, comandos) no verificado en la informacion disponible.
- Sesgos especificos no documentados en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-3.5-4B-Qwensploit-CyberSecurity-GGUF (URL indicada: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity-GGUF)
- Modelo base (no cuantizado): https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Base del merge: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong-UNCENSORED-heretic
- Merge Claude 3xMerge Jackrong: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- Familia Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Qwensploit 2B: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Qwensploit 9B: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity
- Version posterior V2: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5-GGUF
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
- Perfil del autor: https://huggingface.co/xtools-at
