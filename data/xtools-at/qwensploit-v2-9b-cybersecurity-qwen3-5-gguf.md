# xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit V2 9B es un ajuste fino (fine-tune) orientado a ciberseguridad y red team construido sobre el modelo base xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, y publicado en formato GGUF por el mismo autor (xtools-at). Forma parte de la serie Qwensploit, cuyo objetivo es ofrecer un asistente tecnico cotidiano para profesionales de seguridad, pentesters, operadores de red team e investigadores de vulnerabilidades, manteniendo un tamano compacto (9.197.093.888 parametros segun los pesos safetensors del modelo original).

La version V2 pone el enfasis en la calidad y curaduria del dataset de entrenamiento mas que en el volumen: cada conjunto de datos fue dividido, inspeccionado y filtrado manualmente antes de incorporarse a la mezcla. El modelo combina conocimiento de dominio de ciberseguridad con datos de razonamiento general, y se distribuye en cuantizaciones estaticas GGUF para facilitar su despliegue en entornos con recursos limitados.

La relevancia actual del modelo radica en su especializacion: frente a modelos generalistas del mismo tamano, Qwensploit V2 esta afinado para tareas de pentesting autorizado, analisis de vulnerabilidades, codificacion segura y retos CTF. El repositorio GGUF ocupa 24.0 GB e incluye la etiqueta image-text-to-text en el pipeline, aunque la model card no detalla capacidades multimodales concretas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5), ajuste fino con LoRA/PEFT segun tags; detalles completos no disponibles |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizaciones estaticas GGUF (niveles concretos no especificados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | other (terminos no detallados en la informacion disponible) |
| Formato de pesos | GGUF (repo); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic, un merge de la familia Qwen3.5 con aproximadamente 9.200 millones de parametros. Los tags del repositorio indican el uso de LoRA y PEFT, tecnicas de ajuste eficiente de parametros, junto con la etiqueta mtp (multi-token prediction). No se dispone de informacion detallada sobre el numero total de tokens de entrenamiento ni sobre la composicion exacta de la mezcla en terminos de proporciones.

La innovacion principal de la version V2 es metodologica: el autor documento que los problemas de consistencia de la V1 se debian en gran parte a la calidad del dataset, por lo que en V2 cada fuente fue dividida, inspeccionada, limpiada y filtrada rigurosamente antes de entrar en la mezcla. La mezcla de entrenamiento combina conocimiento de dominio de ciberseguridad (PentesterFlow/OffsecCyber con 2.000 muestras de los subconjuntos Elite V2 y HackerOne, ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium) con datos de razonamiento general (saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x). El autor senala explicitamente que evito usar colecciones masivas de registros CVE y referencias de exploits como datos de ajuste, por considerarlas mas adecuadas para RAG que para ensenar razonamiento sobre problemas de seguridad.

## Capacidades

- Generacion de texto y razonamiento estructurado aplicado a problemas de seguridad.
- Conocimiento de dominio de ciberseguridad: seguridad ofensiva, analisis de vulnerabilidades, bug bounty y seguridad web.
- Asistencia en pentesting autorizado y ejercicios de red team.
- Revision de codigo seguro, depuracion y analisis de codigo.
- Resolucion de retos CTF y educacion en seguridad.
- Seguridad defensiva, analisis de amenazas y respuesta a incidentes.
- Razonamiento multi-paso e instruction-tuning orientado a explicaciones tecnicas.
- Capacidades multimodales: el pipeline declarado es image-text-to-text, aunque la model card no detalla el alcance de vision.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente autonomo: el autor indica explicitamente que el modelo esta disenado como asistente de investigacion y analisis, no como agente autonomo de pentesting.
- Multilingue: limitado a ingles segun el campo de idiomas.

## Casos de uso

- Pentesting autorizado: el modelo puede ayudar a estructurar la fase de reconocimiento y analisis de una evaluacion, proponiendo tecnicas y explicando su fundamento, siempre con revision humana antes de ejecutar comandos.
- Triaje de vulnerabilidades: dado un informe o descripcion de una vulnerabilidad, el modelo puede clasificar su severidad, explicar el vector de ataque y sugerir mitigaciones, aprovechando su entrenamiento en subconjuntos de bug bounty como HackerOne.
- Revision de codigo seguro: integrado en un flujo de revision de pull requests, puede senalar patrones inseguros (inyeccion, desbordamientos, gestion de secretos) y proponer correcciones, gracias a su ajuste en codificacion segura y depuracion.
- Educacion y formacion en seguridad: sirve como tutor para explicar conceptos de seguridad ofensiva y defensiva, con razonamiento paso a paso adecuado para entornos formativos y laboratorios.
- Retos CTF: puede asistir en la resolucion de desafios de categorias web, criptografia o reversing, descomponiendo el problema y proponiendo hipotesis, con la ventaja de su entrenamiento especifico en seguridad.
- Respuesta a incidentes: en un equipo SOC, puede ayudar a interpretar indicadores, redactar hipotesis de compromiso y estructurar la investigacion, complementando (no sustituyendo) herramientas de deteccion.
- Despliegue local en laboratorio: al distribuirse en GGUF, puede ejecutarse en estaciones de trabajo de analistas sin depender de servicios en la nube, lo que resulta util para manejar datos sensibles de evaluaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 9.200 millones de parametros, las cuantizaciones GGUF de 4 bits suelen requerir en torno a 6-8 GB de VRAM o memoria unificada, y las de 8 bits alrededor de 10-12 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, el modelo es apto para GPU de consumo con suficiente VRAM y para GPU de datacenter (A100, H100) en configuraciones de mayor precision.
- Cabe en GPU de consumo: probablemente en tarjetas con 8 GB o mas de VRAM en cuantizacion de 4 bits, y en equipos con 16 GB o mas en cuantizaciones superiores; no confirmado por el autor.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para el modelo base en safetensors; el repositorio declara compatibilidad con text-generation-inference y endpoints.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 9B (este modelo) | 9.197.093.888 | no disponible | Ciberseguridad y red team, fine-tune de Qwen3.5 | other | GGUF en Hugging Face |
| Qwensploit V2 4B | no disponible | no disponible | Ciberseguridad, misma serie | other | Hugging Face |
| Qwensploit V2 2B | no disponible | no disponible | Ciberseguridad, misma serie | other | Hugging Face |
| Qwensploit V2 0.8B | no disponible | no disponible | Ciberseguridad, misma serie | other | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de contexto para comparar con modelos de otros autores de la misma categoria.

## Limitaciones y advertencias

- El modelo esta disenado como asistente de investigacion y analisis, no como agente autonomo de pentesting; los comandos, codigo y recomendaciones generados deben revisarse antes de usarse en un entorno real.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar comandos, rutas o referencias de vulnerabilidades inexactas; en seguridad, un error puede tener consecuencias graves.
- Sesgos conocidos: no documentados en la informacion disponible; el ajuste sobre un merge "uncensored" puede reducir los rechazos ante solicitudes sensibles, lo que exige controles de uso.
- Idioma: solo se declara soporte de ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia "other": los terminos concretos no estan detallados en la informacion disponible; es imprescindible revisarlos antes de cualquier uso comercial o redistribucion.
- Longitud de contexto no documentada: no se puede garantizar el manejo de conversaciones o documentos largos.
- El repositorio GGUF ocupa 24.0 GB, lo que implica un coste de almacenamiento y descarga considerable.
- Uso etico: el modelo esta orientado a pruebas autorizadas; su uso en sistemas sin permiso explicito puede ser ilegal.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5-GGUF
- Modelo base (fine-tune): https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Modelo base del fine-tune: https://huggingface.co/xtools-at/Qwen3.5-9B-Claude-3xMerge-UNCENSORED-heretic
- Coleccion Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones del modelo base: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
