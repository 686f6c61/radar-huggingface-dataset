# xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8

## Resumen

Qwensploit V2 27B es un ajuste fino (fine-tune) especializado en ciberseguridad ofensiva y defensiva, desarrollado por el usuario xtools-at sobre el modelo base `xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic`. Forma parte de la serie Qwensploit, cuyo objetivo es proporcionar un asistente tecnico para profesionales de seguridad, pentesters, operadores de red team, investigadores de vulnerabilidades y entusiastas del sector. La version V2 pone el foco en la calidad del dato frente a la cantidad, tras detectar en V1 inconsistencias atribuibles a la mezcla de entrenamiento.

El modelo cuenta con 27.356.728.560 parametros totales (27,3B) en formato safetensors, con un tamano de repositorio de 55,6 GB. Esta construido sobre la arquitectura Qwen 3.5/3.8 (tag `qwen3_5`), con pipeline declarado `image-text-to-text`, lo que sugiere soporte multimodal de entrada imagen-texto, aunque la model card no detalla el componente de vision. El entrenamiento se realizo mediante LoRA/PEFT (tag `unsloth`) sobre el modelo base, y se distribuye con licencia `other` (no estandar).

Su relevancia actual radica en la especializacion vertical: frente a modelos generalistas, este fine-tune incorpora conocimiento curado de repositorios de ciberseguridad reconocidos (offsec, bug bounty, CTF, respuesta a incidentes) y trazas de razonamiento de alta calidad, orientado a un uso profesional en entornos autorizados. El autor advierte explicitamente que no es un agente autonomo de pentesting, sino un asistente de analisis que requiere revision humana de sus salidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basada en Qwen 3.5/3.8 (tag `qwen3_5`), fine-tune LoRA/PEFT sobre modelo base |
| Parametros totales | 27.356.728.560 (27,3B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion (existen GGUFs de terceros enlazados desde la model card) |
| Idiomas soportados | en (ingles) |
| Licencia | other (no estandar; consultar terminos del autor) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de tipo LoRA/PEFT (entrenado con Unsloth, segun los tags) sobre el checkpoint `Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic`, que a su vez es una fusion (merge) de tres modelos derivados de la familia Qwen 3.8. La arquitectura subyacente es un transformer decoder-only de la familia Qwen 3.5/3.8, con pipeline declarado `image-text-to-text`, lo que indica capacidad de procesar entradas multimodales imagen-texto, aunque no se detalla la composicion exacta del modulo de vision ni la configuracion de atencion.

El entrenamiento combina dos categorias de datos: conocimiento de dominio de ciberseguridad y datos generales de razonamiento. Entre las fuentes de ciberseguridad destacan `PentesterFlow/OffsecCyber` (2.000 muestras de los subconjuntos Elite V2 y HackerOne, orientadas a seguridad web ofensiva y bug bounty), `ChaoticNeutrals/Cybersecurity-ShareGPT`, `Voidreaper2026/cybersec-master-dataset`, `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset` y `saidutta69/CyberSec-Reasoning-Premium`. Ademas, se incluye `saidutta69/qwen3.8-max-distillation-50k-clean` (destilacion de 50.000 muestras) y `xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x`, un dataset propio de trazas de razonamiento de alta calidad. El autor indica que cada dataset fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarse, y que se evito incluir grandes volumenes de registros CVE en bruto, por considerarlos mas adecuados para RAG que para el ajuste instructivo. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pentesting web, bug bounty, analisis de vulnerabilidades, explotacion en entornos autorizados.
- Seguridad defensiva: analisis de amenazas, triaje de vulnerabilidades, respuesta a incidentes.
- Codificacion segura: revision de codigo, depuracion y generacion de scripts de seguridad.
- Razonamiento multi-paso (tag `reasoning`), apoyado por datos de trazas de razonamiento de alta calidad.
- Soporte de entrada imagen-texto segun el pipeline declarado (`image-text-to-text`), aunque la model card no detalla casos de uso visuales.
- Capacidad conversacional multi-turno (tag `conversational`).
- Orientado a retos CTF y educacion en seguridad.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta soporte de agentes autonomas; el autor lo desaconseja explicitamente.

## Casos de uso

- Pentesting web autorizado: el modelo puede asistir en la identificacion de vectores de ataque, analisis de endpoints y redaccion de hallazgos, apoyandose en el conocimiento de los subconjuntos Elite V2 y HackerOne de su dataset de entrenamiento.
- Bug bounty: ayuda a interpretar programas de recompensas, priorizar vulnerabilidades y redactar informes tecnicos claros para los triager.
- Triaje de vulnerabilidades: dado un conjunto de hallazgos (por ejemplo, de un escaner), el modelo puede clasificar severidad, explicar el impacto y sugerir mitigaciones, aprovechando su entrenamiento en analisis de vulnerabilidades.
- Revision de codigo seguro: integrado en un flujo de revision de pull requests, puede detectar patrones inseguros, sugerir correcciones y explicar el riesgo asociado, gracias a su base CodeForge y a los datos de secure coding.
- Respuesta a incidentes: asistencia en la interpretacion de indicadores de compromiso, reconstruccion de lineas temporales y redaccion de informes post-incidente, en el marco de las capacidades defensivas declaradas.
- Educacion y CTF: generacion de explicaciones paso a paso de tecnicas de explotacion en entornos de laboratorio, con razonamiento multi-paso adecuado para el aprendizaje guiado.
- Analisis de configuraciones de infraestructura: revision de configuraciones de servidores, contenedores y servicios cloud para detectar desviaciones respecto a buenas practicas de seguridad.
- Asistencia en investigacion de vulnerabilidades: apoyo en la comprension de avisos tecnicos, redaccion de PoCs en entornos controlados y discusion estructurada de hipotesis de fallo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo denso de 27,3B parametros, en FP16 se requeririan aproximadamente 55 GB de VRAM, en cuantizacion de 8 bits unos 28 GB y en 4 bits unos 15-17 GB, sin contar el overhead de contexto y del posible modulo de vision.
- GPU recomendadas: no especificadas por el autor. Por tamano, un despliegue en FP16 requiere GPUs de clase A100 80 GB, H100 80 GB o multiples GPUs. En cuantizacion 4 bits podria caber en una RTX 4090 (24 GB) o RTX 3090 (24 GB), siempre que el contexto sea moderado.
- Cabe en GPU de consumo: probablemente en cuantizacion 4 bits en GPUs de 24 GB, aunque no esta confirmado oficialmente.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y GGUFs de terceros enlazados desde la model card para llama.cpp/Ollama. No se confirma soporte oficial de vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 27B (este) | 27,3B | no disponible | Ciberseguridad + razonamiento | other | Hugging Face |
| Qwensploit V2 9B | no disponible | no disponible | Ciberseguridad | other | Hugging Face (misma serie) |
| Qwensploit V2 4B | no disponible | no disponible | Ciberseguridad | other | Hugging Face (misma serie) |
| Qwensploit V1 (serie original) | no disponible | no disponible | Ciberseguridad | other | Hugging Face (coleccion del autor) |

No se dispone de datos de benchmarks ni de comparativas con modelos de ciberseguridad de otros autores en la informacion proporcionada; cualquier comparacion de rendimiento seria especulativa.

## Limitaciones y advertencias

- Licencia `other`: no es una licencia estandar (Apache, MIT, etc.); es imprescindible revisar los terminos del autor antes de cualquier uso comercial o redistribucion.
- Modelo base marcado como "UNCENSORED": el checkpoint subyacente ha sido modificado para eliminar restricciones de seguridad, lo que incrementa el riesgo de generar contenido danino si no se aplican salvaguardas adicionales.
- Uso dual: el modelo puede producir comandos y tecnicas de explotacion; el autor exige uso exclusivo en entornos autorizados y revision humana de toda salida antes de su ejecucion.
- Riesgo de alucinacion: como todo LLM, puede inventar CVEs, comandos o referencias; en seguridad, un comando incorrecto puede causar danos reales.
- Idioma: solo se declara soporte de ingles (`en`); el rendimiento en castellano no esta garantizado.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas de analisis de documentos largos.
- No es un agente autonomo: el autor lo define como asistente de investigacion y analisis, no como pentester automatico.
- Sesgos: no documentados por el autor; la mezcla de datasets puede introducir sesgos propios de las fuentes.
- Madurez: modelo publicado recientemente (noviembre de 2026) con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Modelo base: https://huggingface.co/xtools-at/Qwen3.8-27B-CodeForge-3xMerge-UNCENSORED-heretic
- Coleccion Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones de terceros: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-27B-CyberSecurity-Qwen3.8
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
