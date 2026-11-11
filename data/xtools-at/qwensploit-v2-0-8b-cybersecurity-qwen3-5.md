# xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5

## Resumen

Qwensploit V2 0.8B es un ajuste fino (fine-tune) de dominio centrado en ciberseguridad y red team, desarrollado por xtools-at sobre el modelo base xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic, a su vez derivado de la familia Qwen 3.5. Con 852.985.920 parámetros (~0,85B) y un tamaño de repositorio de 1,8 GB, el modelo está pensado como asistente técnico para pentesters, operadores de red team, investigadores de vulnerabilidades y entusiastas de la seguridad, combinando conocimiento de dominio con razonamiento estructurado y resolución de problemas técnicos generales.

La segunda iteración de la serie Qwensploit pone el énfasis en la calidad y la selección del dato frente al volumen bruto: según el autor, los problemas de consistencia de la V1 se rastrearon hasta la propia mezcla de entrenamiento, por lo que en esta versión cada dataset fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarse. La mezcla combina fuentes de ciberseguridad ofensiva y defensiva (OffsecCyber, Cybersecurity-ShareGPT, Trendyol, entre otras) con datos de razonamiento y trazas de razonamiento de modelos tipo Claude Haiku.

El modelo declara el pipeline `image-text-to-text` y la arquitectura `qwen3_5`, lo que sugiere capacidades multimodales heredadas del base, aunque la model card no detalla el tratamiento de imagen. Su relevancia actual radica en ofrecer un asistente de seguridad compacto, desplegable en hardware modesto, con licencia "other" y únicamente idioma inglés declarado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer, según tag `qwen3_5`; detalles internos no disponibles) |
| Parámetros totales | 852.985.920 (~0,85B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible en la información proporcionada (el autor remite a la búsqueda de GGUF y otras cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | other |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se presenta como un fine-tune del base xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic, etiquetado con la arquitectura `qwen3_5`. El pipeline declarado es `image-text-to-text`, lo que apunta a una arquitectura multimodal heredada del base, si bien la model card no especifica el codificador visual ni el mecanismo de fusión. Los tags incluyen `lora`, `peft`, `unsloth` y `mtp`, lo que indica que el ajuste se realizó mediante LoRA/PEFT con la herramienta Unsloth; no se detalla si los adaptadores se fusionaron en los pesos finales ni qué es exactamente "mtp" en este contexto (no disponible).

En cuanto a datos, la mezcla de entrenamiento se divide en conocimiento de dominio de ciberseguridad y datos de razonamiento general. Entre las fuentes citadas figuran PentesterFlow/OffsecCyber (2.000 muestras, subconjuntos Elite V2 y HackerOne), ChaoticNeutrals/Cybersecurity-ShareGPT (2.000 muestras), Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. El autor subraya que cada dataset fue filtrado manualmente y que se evitó incluir grandes volúmenes de registros CVE y referencias de exploits en bruto, por considerarlos más adecuados para RAG que para enseñar razonamiento. No se especifica el número total de tokens de entrenamiento, la composición exacta de la mezcla ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pruebas de penetración web, análisis de vulnerabilidades y ejemplos orientados a bug bounty.
- Seguridad defensiva: análisis de amenazas, respuesta a incidentes y discusión técnica de ciberseguridad.
- Codificación segura, revisión de código y depuración.
- Resolución de retos CTF y educación en seguridad.
- Capacidad multimodal declarada por el pipeline `image-text-to-text` (el alcance real no está documentado en la model card).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: el autor lo describe como asistente de investigación y análisis, no como agente autónomo de pentesting; no se documenta soporte explícito de agentes.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Modo thinking o razonamiento explícito: el modelo se entrenó con trazas de razonamiento (dataset de reasoning traces), pero no se documenta un modo thinking conmutable.

## Casos de uso

- Pruebas de penetración autorizadas: el modelo puede asistir en la fase de reconocimiento y análisis de superficies web, apoyándose en los ejemplos de OffsecCyber y HackerOne de su mezcla de entrenamiento para sugerir vectores de ataque y pasos de verificación.
- Triaje de vulnerabilidades: dado un informe o una descripción técnica, el modelo puede ayudar a clasificar severidad, explicar el impacto y proponer mitigaciones, aprovechando su entrenamiento en análisis de vulnerabilidades.
- Revisión de código seguro: integrado en el flujo de revisión, puede señalar patrones inseguros, explicar la causa raíz y proponer parches, gracias a su componente de codificación y depuración.
- Formación y CTF: sirve como tutor para resolver retos de seguridad y explicar técnicas, con un tamaño que permite ejecución local en portátiles con GPU de consumo.
- Respuesta a incidentes: puede estructurar la investigación de un incidente, generar hipótesis de compromiso y redactar resúmenes técnicos para el equipo defensivo.
- Asistente de red team en laboratorio: al ser un modelo compacto, puede desplegarse en un entorno aislado de laboratorio para generar y comentar comandos, siempre con revisión humana antes de su ejecución.
- Documentación técnica de seguridad: generación de notas, guías internas y explicaciones de hallazgos para equipos no especializados, apoyándose en su capacidad de razonamiento estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~0,85B parámetros, en FP16 requiere aproximadamente 1,7 GB solo para pesos; en cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones teóricas, no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente en la práctica; tarjetas de consumo como RTX 3060, RTX 4060 o superiores pueden ejecutarlo con holgura.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de GPU modernas de consumo, incluso en configuraciones de 4-8 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`); el autor remite a la búsqueda de GGUF y otras cuantizaciones, lo que sugiere compatibilidad con llama.cpp/Ollama una vez publicadas las conversiones.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 0.8B | ~0,85B | no disponible | Ciberseguridad / red team | other | Hugging Face |
| Qwensploit V2 2B | no disponible | no disponible | Ciberseguridad / red team | other | Hugging Face (misma serie) |
| Qwensploit V2 4B | no disponible | no disponible | Ciberseguridad / red team | other | Hugging Face (misma serie) |
| Qwensploit V2 9B | no disponible | no disponible | Ciberseguridad / red team | other | Hugging Face (misma serie) |

La comparación más directa disponible son las otras variantes de la misma serie (2B, 4B y 9B), que comparten mezcla de datos y enfoque pero ofrecen mayor capacidad a costa de más recursos. No se dispone de datos de benchmarks ni de comparaciones con fine-tunes de ciberseguridad de otros autores en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre datos de seguridad ofensiva y bug bounty, puede reproducir perspectivas propias de esas comunidades.
- Riesgo de alucinación: relevante en un dominio donde comandos, CVE o exploits inventados pueden ser peligrosos; el autor recomienda revisar siempre comandos, código y recomendaciones antes de usarlos en un entorno real.
- Limitaciones de contexto e idioma: solo se declara inglés; la longitud de contexto no está especificada, lo que impide planificar conversaciones largas con garantías.
- Restricciones de licencia: licencia "other", sin texto de licencia detallado en la información disponible; es imprescindible revisar los términos antes de un uso comercial.
- Uso previsto: el autor lo define como asistente de investigación y análisis, no como agente autónomo de pentesting; no debe emplearse para atacar sistemas sin autorización.
- Fiabilidad: el tamaño compacto (0,85B) limita la profundidad de razonamiento frente a modelos mayores de la misma serie; para tareas complejas conviene validar sus respuestas con fuentes externas o RAG.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Modelo base: https://huggingface.co/xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Colección Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Cuantizaciones (búsqueda): https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
