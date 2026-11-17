# xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity

## Resumen

Qwensploit 3.5 9B es un ajuste fino (fine-tune) con LoRA del modelo fusionado xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, orientado a razonamiento de ciberseguridad, análisis de vulnerabilidades, codigo seguro y conocimiento de red team. Lo desarrolla el usuario de Hugging Face xtools-at y se publica bajo licencia Apache-2.0, con la advertencia explicita de que la compatibilidad de licencias upstream debe revisarse antes de su redistribucion o uso comercial. Cuenta con 9.409.813.744 parametros totales y un repositorio de 19,3 GB en formato safetensors.

El modelo parte de la familia Qwen3.5-9B y hereda de su base una fusion de ajustes destilados de modelos Claude (Mythos, Fable y Opus) orientados a razonamiento y codigo, ademas de un proceso de "abliteracion"/"heretic" que elimina parte de los rechazos del modelo original. Sobre esa base se aplico un entrenamiento supervisado con 7.000 ejemplos provenientes de cuatro datasets de ciberseguridad, red team y destilacion sintetica, con 350 ejemplos de evaluacion.

Su relevancia actual es acotada pero concreta: cubre un nicho (seguridad ofensiva y defensiva asistida por LLM) con un tamano de 9B que puede desplegarse en hardware relativamente modesto, y se publica junto a variantes de 2B y 4B de la misma familia. No obstante, no se han publicado benchmarks independientes de rendimiento en seguridad, y el propio autor advierte de que las capacidades ofensivas solo deben usarse en entornos autorizados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino LoRA sobre modelo fusionado |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de contexto usada en entrenamiento; la del modelo base no se especifica) |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 (sujeta a revision de compatibilidad con licencias upstream) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen3.5 con 9.409.813.744 parametros. El modelo no se entrena desde cero: es un ajuste fino con PEFT/LoRA sobre el merge xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, que a su vez combina ajustes destilados de Claude Mythos, Fable y Opus con datos de razonamiento y codigo, y aplica una variante "heretic" (abliteracion de rechazos). El pipeline declarado en Hugging Face es image-text-to-text, aunque la model card no documenta capacidades de vision ni entrenamiento multimodal especifico.

El entrenamiento consistio en una epoca de SFT con LoRA de rango 16, alpha 32 y dropout 0,02 sobre todos los modulos, optimizador AdamW de 8 bits, learning rate 2e-4 con scheduler lineal, weight decay 0,002 y batch efectivo de 4x8 en una NVIDIA A100 de 40 GB. Se usaron 7.000 ejemplos con longitud maxima de 8.000 caracteres, mezclados y barajados, con la siguiente composicion: CyberSec-Reasoning-Premium (2.305 ejemplos, 33%), RedTeam-Premium (2.385, 34%), Claude Mythos Distilled 25K Clean (1.385, 20%) y Qwen3.8-Max Distillation 50K Clean (925, 13%). La perdida final de entrenamiento fue 0,476 y la de evaluacion 0,481. No se documenta RLHF ni DPO, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento tecnico en el dominio de ciberseguridad: analisis de vulnerabilidades, modelado de amenazas y analisis de incidentes.
- Revision de codigo seguro y deteccion de patrones inseguros en codigo.
- Conocimiento de red team y pruebas de penetracion en entornos autorizados.
- Resolucion de retos CTF y asistencia educativa en seguridad.
- Generacion y explicacion de codigo en general, heredada de los ajustes de codigo de la base.
- Razonamiento paso a paso (el modelo base incorpora destilacion de razonamiento de Claude).
- Respuestas de tipo question-answering tecnico.
- Modelo "uncensored"/"heretic": menor tasa de rechazos ante peticiones tecnicas sensibles.
- Soporte multilingue limitado al ingles (unico idioma declarado).
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente multi-paso: no documentadas.
- Capacidades de vision: el pipeline declarado es image-text-to-text, pero no se documenta entrenamiento ni evaluacion multimodal.

## Casos de uso

- Analisis de vulnerabilidades en revision de codigo: el modelo puede recibir fragmentos de codigo y senalar patrones de inyeccion, desbordamientos o malas practicas, apoyandose en los datos de CyberSec-Reasoning-Premium; requiere validacion humana antes de abrir tickets.
- Modelado de amenazas en diseno de sistemas: dado un diagrama o descripcion textual de arquitectura, generar listas de amenazas y contramedidas, util en fases de diseno seguro.
- Ejercicios de red team autorizados: generar hipotesis de ataque, tecnicas MITRE ATT&CK y planes de prueba para laboratorios aislados, gracias a los datos de RedTeam-Premium.
- Formacion y CTF: explicar tecnicas de explotacion y resolver retos de captura de la bandera con razonamiento paso a paso, en entornos educativos.
- Asistente de analisis de incidentes: resumir trazas, logs y alertas y proponer hipotesis de compromiso, con contexto de 8.192 tokens suficiente para ventanas de logs acotadas.
- Generacion de codigo de automatizacion de seguridad: escribir scripts de escaneo, parsing de resultados o integracion con APIs de SIEM, con revision posterior obligatoria.
- Chatbot interno de consulta tecnica de seguridad: desplegado on-premise en una GPU consumer o de gama media, responde preguntas de politicas y procedimientos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta perdidas de entrenamiento y evaluacion (0,476 y 0,481 respectivamente) y trayectorias por paso, que no constituyen una medida de precision en tareas de ciberseguridad.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 19 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 10-11 GB de pesos; a 4 bits: alrededor de 5-6 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: NVIDIA A100 40 GB (usada en el entrenamiento), H100, L40S o RTX A6000 para FP16 sin problemas de memoria.
- GPU consumer: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado; en RTX 3090 (24 GB) de forma ajustada; en GPUs de 12-16 GB requeriria cuantizacion no publicada oficialmente.
- Opciones de despliegue: transformers (libreria declarada), ademas de vLLM, TGI o llama.cpp/Ollama si se generan conversiones GGUF (no publicadas).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit 3.5 9B | 9,41B | 8.192 (entrenamiento) | Ciberseguridad y red team (LoRA sobre Qwen3.5-9B) | Apache-2.0 (revision upstream) | Hugging Face, safetensors |
| Qwensploit 3.5 4B | no disponible | no disponible | Misma familia, menor tamano | Apache-2.0 | Hugging Face |
| Qwensploit 3.5 2B | no disponible | no disponible | Misma familia, menor tamano | Apache-2.0 | Hugging Face |
| Qwen3.5-9B (base de la familia) | ~9B | no disponible | Modelo generalista | no disponible en esta ficha | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar rendimiento entre estas variantes ni con otros modelos especializados en ciberseguridad.

## Limitaciones y advertencias

- Puede generar explicaciones inexactas, codigo inseguro o consejos de seguridad desactualizados; toda salida debe revisarse.
- Los datos de destilacion sintetica pueden contener errores heredados de los modelos profesor.
- El rendimiento en tareas de seguridad del mundo real no ha sido establecido de forma independiente.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta garantizado.
- El contexto de entrenamiento es de 8.192 tokens; entradas mas largas pueden degradar la calidad.
- La licencia Apache-2.0 esta condicionada a la revision de licencias upstream; en particular, el dataset de destilacion de Qwen documenta restricciones heredadas que pueden afectar al uso downstream.
- Modelo "uncensored"/"heretic": reduce los rechazos, lo que aumenta el riesgo de generar contenido ofensivo o peligroso; usar solo en entornos autorizados.
- Riesgo de alucinacion en referencias a CVEs, tecnicas o herramientas; verificar siempre contra fuentes primarias.
- Existe una version posterior declarada (new_version: xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5); esta ficha corresponde a la version original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-CyberSecurity (URL indicada: https://huggingface.co/xtools-at/Qwen3.5-9B-Qwensploit-CyberSecurity)
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Merge relacionado: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge
- Familia Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante 2B: https://huggingface.co/xtools-at/Qwen3.5-2B-Qwensploit-CyberSecurity
- Variante 4B: https://huggingface.co/xtools-at/Qwen3.5-4B-Qwensploit-CyberSecurity
- Dataset CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset RedTeam-Premium: https://huggingface.co/datasets/saidutta69/RedTeam-Premium
- Dataset Claude Mythos Distilled 25K Clean: https://huggingface.co/datasets/saidutta69/claude-mythos-distilled-25k-clean
- Dataset Qwen3.8-Max Distillation 50K Clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Fuente upstream Cybersecurity Reasoning Dataset: https://huggingface.co/datasets/dpevzner/Cybersecurity_Reasoning_Dataset
- Fuente upstream Ultimate Offensive Red Team: https://huggingface.co/datasets/WNT3D/Ultimate-Offensive-Red-Team
- Fuente upstream claude_mythos_distilled_25k: https://huggingface.co/datasets/WithinUsAI/claude_mythos_distilled_25k
- Fuente upstream qwen3.8-max-distillation-50k: https://huggingface.co/datasets/r0b0tlab/qwen3.8-max-distillation-50k
