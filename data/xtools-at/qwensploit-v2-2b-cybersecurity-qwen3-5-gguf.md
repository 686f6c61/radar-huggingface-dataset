# xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-GGUF

## Resumen

Qwensploit V2 2B - Cybersecurity & Red Team es un ajuste fino (fine-tune) orientado a ciberseguridad y equipos rojos, construido sobre el modelo base `xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic`, a su vez derivado de la familia Qwen 3.5. Lo desarrolla el usuario xtools-at como continuación de su proyecto original Qwensploit, y esta ficha concreta corresponde a la publicación de cuantizaciones estáticas en formato GGUF del modelo original en precisión completa. Con 1.942.653.248 parámetros (aproximadamente 1,94 mil millones), se posiciona como un asistente compacto para profesionales de seguridad que necesitan ejecución local en hardware modesto.

El objetivo declarado es ofrecer un asistente diario para pentesting autorizado, investigación de vulnerabilidades, análisis de tráfico y respuesta a incidentes, además de resolución de retos CTF y revisión de código seguro. La versión V2 incide en la calidad y curaduría del dataset frente a V1, tras detectar que buena parte de las inconsistencias de la primera iteración provenían de datos de entrenamiento ruidosos. El autor distribuye la familia completa en cuatro tamaños (0,8B, 2B, 4B y 9B) bajo la misma receta de datos.

La relevancia actual reside en su tamaño reducido combinado con especialización vertical: permite desplegar un asistente de seguridad en una sola GPU de consumo o incluso en CPU mediante GGUF, sin depender de APIs externas ni enviar datos sensibles de auditoría a terceros. La licencia es "other" (no estándar), lo que exige revisar los términos del autor antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5); detalles internos no disponibles |
| Parametros totales | 1.942.653.248 (~1,94B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estático (el repo publica cuantizaciones estáticas; niveles concretos no disponibles en la información) |
| Idiomas soportados | en (inglés) |
| Licencia | other (licencia no estándar; revisar términos del autor) |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en precisión completa usa safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen 3.5, afinado mediante LoRA/PEFT (etiquetas `lora`, `peft`, `unsloth`) sobre el checkpoint `Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic`, que a su vez es una mezcla de destilaciones múltiples. La model card menciona la etiqueta `mtp` (multi-token prediction) entre las capacidades del linaje, aunque no se detallan los mecanismos internos de atención ni la longitud de contexto nativa. El pipeline declarado es `image-text-to-text`, lo que sugiere que el linaje base conserva capacidades multimodales, si bien la especialización del fine-tune es textual y de seguridad.

El entrenamiento combina conocimiento de dominio de ciberseguridad con datos de razonamiento general. Las fuentes citadas incluyen `PentesterFlow/OffsecCyber` (2.000 muestras de los subconjuntos Elite V2 y HackerOne, orientadas a seguridad web ofensiva y bug bounty), `ChaoticNeutrals/Cybersecurity-ShareGPT`, `Voidreaper2026/cybersec-master-dataset`, `Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset`, `saidutta69/CyberSec-Reasoning-Premium`, `saidutta69/qwen3.8-max-distillation-50k-clean` y `xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x`. El autor indica que cada dataset fue dividido, inspeccionado, limpiado y filtrado manualmente, y que descartó volcados masivos de CVE y referencias de exploits por considerarlos más adecuados para RAG que para enseñar razonamiento. No se especifican el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto técnico especializado en ciberseguridad: explicaciones de vulnerabilidades, análisis de superficie de ataque y triaje.
- Razonamiento estructurado orientado a problemas de seguridad (`reasoning`, `security-analysis` en las etiquetas).
- Conocimiento de seguridad ofensiva: pentesting web, bug bounty, explotación conceptual y post-explotación en entornos autorizados.
- Soporte de CTF y educación en seguridad.
- Revisión de código y codificación segura, con detección de patrones inseguros y depuración.
- Seguridad defensiva: análisis de amenazas y respuesta a incidentes.
- Conversación multi-turno (`conversational` en las etiquetas).
- Capacidades multimodales heredadas del linaje base (pipeline `image-text-to-text`), aunque no se documentan en la model card.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible`, `text-generation-inference`).
- Soporte de tool calling / function calling: no disponible en la información.
- Capacidades de agente autónomo: el autor indica explícitamente que no está diseñado como agente autónomo de pentesting.

## Casos de uso

- Auditoría de aplicaciones web autorizada: el modelo puede analizar hallazgos, explicar clases de vulnerabilidad (inyección, control de acceso, XSS) y proponer vectores de verificación, apoyándose en su entrenamiento sobre subconjuntos de bug bounty como HackerOne.
- Triaje de vulnerabilidades: dado un informe o una descripción técnica, ayuda a priorizar por impacto y a redactar recomendaciones de mitigación, gracias a los datos de razonamiento de seguridad del mixture.
- Revisión de código seguro en CI/CD: puede integrarse como paso de revisión estática asistida para señalar patrones inseguros y sugerir correcciones, con la ventaja de ejecutarse localmente sin enviar código propietario a terceros.
- Formación y retos CTF: genera explicaciones paso a paso de técnicas y resuelve retos de categorías web, criptografía básica y forense, útil en academias y laboratorios internos.
- Asistencia en respuesta a incidentes: resume indicadores, propone hipótesis de compromiso y estructura la investigación, con la ventaja de poder desplegarse en infraestructura aislada.
- Asistente local para equipos de red team: al caber en hardware de consumo en formato GGUF, permite consultas rápidas durante ejercicios sin depender de conectividad ni de APIs externas.
- Generación de documentación de seguridad: redacción de políticas, guías de hardening y notas de análisis técnico a partir de hallazgos previos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con ~1,94B parámetros, en FP16 requiere aproximadamente 4 GB de VRAM; en cuantizaciones GGUF de 8 bits alrededor de 2-2,5 GB; en 4 bits en torno a 1,2-1,5 GB (estimaciones por tamaño, no publicadas por el autor).
- GPU recomendadas: cualquier GPU con 6 GB o más para FP16; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradamente suficientes. El modelo está pensado para hardware modesto.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU consumer recientes (RTX 20xx en adelante con 6 GB o más), y en CPU mediante GGUF.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para los pesos completos (etiquetas `text-generation-inference` y `endpoints_compatible`); transformers como librería base.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwensploit V2 2B (este) | ~1,94B | no disponible | Ciberseguridad y red team | other | GGUF en HF |
| Qwensploit V2 0.8B | ~0,8B (no confirmado) | no disponible | Ciberseguridad y red team | other | HF (misma familia) |
| Qwensploit V2 4B | ~4B (no confirmado) | no disponible | Ciberseguridad y red team | other | HF (misma familia) |
| Qwensploit V2 9B | ~9B (no confirmado) | no disponible | Ciberseguridad y red team | other | HF (misma familia) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos competidores de la misma categoría en la información proporcionada, por lo que no es posible una comparación cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Licencia "other": no es una licencia estándar tipo Apache 2.0 o MIT; es imprescindible revisar los términos del autor antes de cualquier uso comercial o redistribución.
- Idioma: solo se declara soporte de inglés (`en`); el rendimiento en castellano no está garantizado ni documentado.
- Riesgo de alucinación: como todo modelo de ~2B, puede generar comandos, rutas o referencias de CVE plausibles pero incorrectas; el autor advierte que los comandos y recomendaciones deben revisarse antes de usarse en un entorno real.
- No es un agente autónomo: el autor lo describe explícitamente como asistente de investigación y análisis, no como herramienta de pentesting automatizada.
- Sesgos: no se documentan evaluaciones de sesgo; el linaje "UNCENSORED-heretic" implica que las salvaguardas de contenido están deliberadamente reducidas, lo que aumenta el riesgo de respuestas dañinas o fuera de política si se usa sin supervisión.
- Contexto: la longitud de contexto no está publicada; conviene verificarla empíricamente antes de diseñar flujos con documentos largos.
- Datos de entrenamiento filtrados manualmente pero de origen comunitario: la calidad y veracidad de las fuentes subyacentes no está auditada de forma independiente.
- Producción: sin benchmarks publicados, no hay evidencia cuantitativa de calidad frente a alternativas; se recomienda evaluar con un conjunto propio antes de desplegar.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5-GGUF
- Modelo base (precisión completa): https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Linaje base del fine-tune: https://huggingface.co/xtools-at/Qwen3.5-2B-MultiDistill-Megamix-6xMerge-UNCENSORED-heretic
- Colección Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 0.8B: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Cuantizaciones del modelo: https://huggingface.co/models?other=base_model:quantized:xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
- Dataset ChaoticNeutrals/Cybersecurity-ShareGPT: https://huggingface.co/datasets/ChaoticNeutrals/Cybersecurity-ShareGPT
- Dataset Voidreaper2026/cybersec-master-dataset: https://huggingface.co/datasets/Voidreaper2026/cybersec-master-dataset
- Dataset Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset: https://huggingface.co/datasets/Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset
- Dataset saidutta69/CyberSec-Reasoning-Premium: https://huggingface.co/datasets/saidutta69/CyberSec-Reasoning-Premium
- Dataset saidutta69/qwen3.8-max-distillation-50k-clean: https://huggingface.co/datasets/saidutta69/qwen3.8-max-distillation-50k-clean
- Dataset xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x: https://huggingface.co/datasets/xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x
