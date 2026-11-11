# xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF

## Resumen
Qwensploit V2 0.8B - Cybersecurity & Red Team es un fine-tune especializado en ciberseguridad y red team desarrollado por xtools-at, construido sobre el modelo base xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic. Forma parte de la segunda iteración de la serie Qwensploit, que busca ofrecer un asistente tecnico compacto para profesionales de seguridad ofensiva, pentesters, investigadores de vulnerabilidades y entusiastas del sector.

El modelo combina conocimiento de dominio de ciberseguridad, experiencia en seguridad ofensiva, razonamiento estructurado y resolucion general de problemas tecnicos en un tamano reducido de aproximadamente 773 millones de parametros. La version publicada en este repositorio es una cuantizacion estatica en formato GGUF del modelo original, lo que facilita su despliegue en entornos con recursos limitados.

La relevancia de esta version radica en su enfoque en la calidad del dato frente a la cantidad: el autor indica que en V2 cada dataset fue dividido, inspeccionado, limpiado y filtrado manualmente antes de incorporarlo al mezcla de entrenamiento, corrigiendo inconsistencias detectadas en la primera version. El modelo esta pensado como asistente de analisis e investigacion, no como agente autonomo de pentesting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (fine-tune con LoRA/PEFT sobre modelo base) |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF estatico (el repositorio contiene cuantizaciones estaticas; los niveles concretos no estan detallados en la informacion disponible) |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | GGUF (repo cuantizado); el modelo base original se distribuye en safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Qwen3.5, un transformer de aproximadamente 0,8B de parametros, sobre el que se aplico un fine-tune mediante LoRA/PEFT segun las etiquetas del repositorio. El modelo base es una variante del Qwen3.5-0.8B con "weight-space programming" y version "UNCENSORED-heretic", lo que implica que se ha modificado el comportamiento de rechazo del modelo original.

El entrenamiento de V2 se realizo sobre una mezcla ampliada de datos de ciberseguridad y razonamiento general. Segun la model card, cada dataset fue dividido, inspeccionado, limpiado y filtrado rigurosamente antes de incluirlo. Entre las fuentes citadas figuran PentesterFlow/OffsecCyber (subconjuntos Elite V2 y HackerOne, 2.000 muestras), ChaoticNeutrals/Cybersecurity-ShareGPT, Voidreaper2026/cybersec-master-dataset, Trendyol/Trendyol-Cybersecurity-Instruction-Tuning-Dataset, saidutta69/CyberSec-Reasoning-Premium, saidutta69/qwen3.8-max-distillation-50k-clean y xtools-at/Claude-Haiku-5.5-High-Reasoning-TraceInversion-3000x. El autor senala explicitamente que los registros CVE y referencias de exploits sin procesar son mas adecuados para RAG que para el fine-tune directo, y que priorizo instrucciones utiles, explicaciones tecnicas y razonamiento de seguridad frente al volumen bruto de datos. No se detalla el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades
- Generacion de texto y razonamiento estructurado orientado a problemas de seguridad.
- Conocimiento de seguridad ofensiva: pentesting autorizado, red team, analisis de vulnerabilidades y triaje.
- Seguridad de aplicaciones web e infraestructura.
- Codigo seguro, revision de codigo y depuracion.
- Resolucion de retos CTF y educacion en seguridad.
- Seguridad defensiva, analisis de amenazas y respuesta a incidentes.
- Conversaciones tecnicas de ciberseguridad y resolucion estructurada de problemas.
- Soporte multimodal image-text-to-text segun el pipeline declarado en el repositorio (hereda la capacidad del modelo base Qwen3.5).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo de idiomas del repositorio.

## Casos de uso
- Pentesting autorizado: el modelo puede asistir en la fase de reconocimiento y analisis, proponiendo tecnicas y explicando su fundamento para ejercicios de red team con alcance definido.
- Triaje de vulnerabilidades: dado un informe o descripcion de una vulnerabilidad, el modelo puede ayudar a clasificar severidad, explicar el vector de ataque y sugerir lineas de mitigacion.
- Revision de codigo seguro: integrado en revisiones de pull requests, puede senalar patrones inseguros (inyeccion, gestion de secretos, validacion de entradas) y proponer correcciones.
- Resolucion de CTF: util para descomponer retos de seguridad web, criptografia o reversing en pasos de razonamiento y proponer hipotesis de solucion.
- Formacion y concienciacion: puede generar explicaciones didacticas sobre tecnicas de ataque y defensa para programas de educacion en seguridad.
- Respuesta a incidentes: apoyo en la redaccion de analisis de amenazas, lineas de tiempo de incidentes y recomendaciones de contencion.
- Analisis de configuraciones e infraestructura: puede revisar configuraciones de servidores y servicios para identificar desviaciones respecto a buenas practicas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de un modelo de aproximadamente 773 millones de parametros, las cuantizaciones GGUF de 4 bits deberian ocupar del orden de 0,5-0,7 GB de pesos, y las de 8 bits alrededor de 0,8-1 GB; el consumo total depende del contexto y del backend. No se dispone de cifras oficiales del autor.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4-6 GB de VRAM deberia poder ejecutar cuantizaciones de 4-8 bits; para mayor contexto o precision, se recomiendan GPUs con 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4090).
- Cabe en GPU consumer: si, en la mayoria de GPUs consumer actuales con cuantizaciones GGUF de 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, y backends compatibles con GGUF; el modelo base original es compatible con transformers y text-generation-inference.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwensploit V2 0.8B (este) | 772.845.888 | no disponible | other | GGUF | Fine-tune de ciberseguridad sobre Qwen3.5-0.8B |
| Qwensploit V2 2B | no disponible | no disponible | other | no disponible | Variante mayor de la misma serie |
| Qwensploit V2 4B | no disponible | no disponible | other | no disponible | Variante mayor de la misma serie |
| Qwensploit V2 9B | no disponible | no disponible | other | no disponible | Variante mayor de la misma serie |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las variantes mayores en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa con alternativas externas.

## Limitaciones y advertencias
- El modelo esta disenado como asistente de investigacion y analisis, no como agente autonomo de pentesting; los comandos, codigo y recomendaciones generados deben revisarse antes de usarse en entornos reales.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar comandos, rutas o referencias de vulnerabilidades inexistentes o incorrectas.
- Idiomas: el modelo declara unicamente ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado.
- Licencia "other": no se especifican los terminos exactos en la informacion disponible; es necesario consultar el repositorio para verificar las restricciones de uso comercial.
- El modelo base es una variante "UNCENSORED-heretic", lo que implica que puede generar contenido sensible o potencialmente peligroso en el contexto de seguridad ofensiva; su uso debe enmarcarse en actividades autorizadas.
- No se dispone de informacion sobre sesgos especificos, longitud de contexto ni resultados de evaluacion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere una validacion comunitaria limitada.

## Enlaces
- Repositorio Hugging Face (GGUF): https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5-GGUF
- Modelo base original: https://huggingface.co/xtools-at/Qwensploit-V2-0.8B-CyberSecurity-Qwen3.5
- Modelo base del fine-tune: https://huggingface.co/xtools-at/Qwen3.5-0.8B-weight-space-programming-UNCENSORED-heretic
- Coleccion Qwensploit: https://huggingface.co/collections/xtools-at/qwensploit-cybersec
- Variante 9B: https://huggingface.co/xtools-at/Qwensploit-V2-9B-CyberSecurity-Qwen3.5
- Variante 4B: https://huggingface.co/xtools-at/Qwensploit-V2-4B-CyberSecurity-Qwen3.5
- Variante 2B: https://huggingface.co/xtools-at/Qwensploit-V2-2B-CyberSecurity-Qwen3.5
- Perfil del autor: https://huggingface.co/xtools-at
- Dataset PentesterFlow/OffsecCyber: https://huggingface.co/datasets/PentesterFlow/OffsecCyber
