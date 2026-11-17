# xtools-at/Qwen3.5-4B-Medical-Reasoning-GGUF

## Resumen

Qwen3.5-4B-Medical-Reasoning-GGUF es la distribucion en formato GGUF de un adaptador LoRA de razonamiento medico construido sobre la familia Qwen3.5-4B. Lo publica el usuario xtools-at y deriva de un fine-tune previo de DavidAU (una variante "heretic" y sin censura del modelo base), al que se anaden ejemplos de razonamiento clinico paso a paso procedentes del dataset Medical-o1-Reasoning-SFT de FreedomIntelligence. El resultado es un modelo de aproximadamente 4.205 millones de parametros orientado a pregunta-respuesta medica y a la generacion de trazas de razonamiento.

La relevancia de esta ficha esta en su caracter practico: al ofrecerse en GGUF, el modelo puede ejecutarse en hardware de consumo mediante llama.cpp u Ollama, lo que facilita prototipado de flujos de NLP medico en entornos controlados. No obstante, el propio autor lo declara experimental y no validado clinicamente, por lo que su interes es de investigacion y evaluacion, no de uso asistencial.

El entrenamiento fue modesto: 2.000 ejemplos muestreados aleatoriamente, 2 epocas, secuencia maxima de 4.096 tokens y una unica GPU Tesla T4 de 16 GB. Esa escala acota mucho lo que puede esperarse del modelo, y conviene interpretar sus salidas como material de exploracion, no como conocimiento medico fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (linaje Qwen3.5-4B); adaptador LoRA sobre un fine-tune previo |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4.096 tokens (longitud maxima de secuencia en entrenamiento; contexto nativo del modelo base no disponible) |
| Tipos de cuantizacion | GGUF estatico (variantes concretas no detalladas en la informacion disponible) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo de 13,4 GB); el adaptador original es LoRA/PEFT en transformers |
| Tipo de modelo | LoRA adapter (cuantizado a GGUF) |
| Dataset de entrenamiento | xtools-at/medical-o1-reasoning-SFT-chat (derivado de FreedomIntelligence/medical-o1-reasoning-SFT) |
| Muestras de entrenamiento | 2.000 ejemplos aleatorios, 2 epocas |
| Hardware de entrenamiento | NVIDIA Tesla T4, 16 GB VRAM, precision 16-bit |
| Descargas / likes | 817 / 1 |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia Qwen3.5-4B, sobre el que se aplica un adaptador LoRA. La cadena de linaje es relevante: Qwen/Qwen3.5-4B como modelo upstream, DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING como base inmediata del fine-tune y, por ultimo, el adaptador medico de xtools-at. El autor advierte que el comportamiento final refleja tanto el entrenamiento previo de la base como el ajuste medico anadido, y que la contribucion relativa de cada etapa no se ha medido de forma independiente.

El entrenamiento consistio en SFT con LoRA: rango r=16, alpha=32, dropout 0,01, learning rate 2e-4 con scheduler lineal, optimizador AdamW de 8 bits, batch por dispositivo de 2 y acumulacion de gradientes de 4 (batch efectivo 8). Se usaron 2.000 ejemplos seleccionados aleatoriamente del dataset Medical-o1-Reasoning-SFT, preprocesados para incorporar trazas de razonamiento en el 100% de los ejemplos, con 2 epocas y una longitud maxima de 4.096 tokens. Aproximadamente el 2% de los datos muestreados se reservo como split de evaluacion. No se menciona RLHF ni DPO, ni innovaciones de decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y respuesta a preguntas de conocimiento medico en ingles.
- Razonamiento clinico paso a paso: interpretacion de sintomas, hallazgos de laboratorio y viñetas clinicas.
- Exploracion de diagnosticos diferenciales e identificacion de pruebas de seguimiento plausibles.
- Entrenamiento consistente en modo "thinking": todos los ejemplos incluyen traza de razonamiento, lo que orienta al modelo a producir explicaciones estructuradas.
- Pregunta-respuesta conversacional de un solo turno o multi-turno dentro de la ventana de contexto.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso autonomo: no disponible; el razonamiento multi-paso se limita al dominio de la respuesta.
- Vision / image-text-to-text: la etiqueta aparece en los tags del repo, pero la model card no documenta capacidad multimodal; tratar como no confirmado.
- Multilingue: solo ingles declarado.

## Casos de uso

- Prototipado de asistentes de informacion medica: el modelo puede responder preguntas de conocimiento y generar explicaciones razonadas en ingles, util para validar interfaces de usuario antes de integrar modelos mayores o datos propios.
- Evaluacion de adaptacion de modelos pequenos a dominios especializados: sirve como caso de estudio de como un LoRA de 2.000 ejemplos modifica el comportamiento de una base de 4B, con fines de investigacion en metodologia de fine-tuning.
- Generacion de viñetas clinicas sinteticas: el modelo puede producir escenarios con sintomas, analiticas y diagnosticos diferenciales para nutrir conjuntos de datos de prueba en entornos de desarrollo no clinicos.
- Analisis exploratorio de hallazgos de laboratorio: dado un conjunto de valores analiticos descritos en texto, el modelo propone interpretaciones y pruebas adicionales, siempre como borrador sujeto a revision experta.
- Educacion y formacion: generacion de explicaciones paso a paso sobre fisiopatologia o razonamiento diagnostico para materiales docentes que luego revisa un profesional.
- Investigacion en fidelidad de trazas de razonamiento: al entrenarse con trazas en el 100% de los ejemplos, permite estudiar si las explicaciones generadas correlacionan con la respuesta final, un problema abierto en interpretabilidad.
- Despliegue local en estaciones de trabajo: gracias al formato GGUF, puede ejecutarse en portatiles con GPU de consumo para demos offline sin enviar datos a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4.205 millones de parametros, una cuantizacion Q4_K_M ronda los 2,5-3 GB de pesos; Q8_0 se acerca a 4,5 GB; FP16 requeriria unos 8,4 GB solo para pesos. Las cifras exactas dependen de las variantes GGUF publicadas, que no se detallan.
- GPU recomendadas: cualquier GPU con 6-8 GB de VRAM puede ejecutar cuantizaciones de 4-8 bits; una RTX 3060 de 12 GB o RTX 4090 permiten contexto completo y mayor velocidad. Para FP16, A100 o H100 no son necesarias, basta una RTX 3090/4090.
- Cabe en GPU de consumo: si, en tarjetas con al menos 6 GB de VRAM en cuantizaciones bajas; con 8-12 GB se dispone de margen para contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, y servidores compatibles con endpoints (el repo incluye la etiqueta endpoints_compatible). vLLM y TGI requeririan los pesos originales en safetensors, no el GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-4B-Medical-Reasoning-GGUF | 4,2 B | 4.096 (entrenamiento) | Apache-2.0 | GGUF | Fine-tune medico experimental sobre base "heretic" |
| Qwen/Qwen3.5-4B | 4 B (aprox.) | no disponible | no disponible en la info | safetensors | Modelo upstream, sin especializacion medica |
| DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 4 B (aprox.) | no disponible | no disponible en la info | safetensors | Base inmediata; fine-tune sin censura, sin datos medicos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental no validado clinicamente: puede producir diagnosticos incorrectos, detalles fabricados o explicaciones enganosas. No debe usarse para diagnostico, tratamiento, triaje de urgencias ni decision clinica autonoma.
- Riesgo de alucinacion elevado por el tamano reducido (4B) y el entrenamiento limitado (2.000 ejemplos, 2 epocas).
- Las trazas de razonamiento no garantizan fidelidad: el autor advierte que su presencia no implica que las explicaciones reflejen los procesos internos del modelo ni que mejoren la precision diagnostica frente a la base.
- Sesgos heredados: al derivar de una base "heretic" y sin censura, el modelo puede carecer de los filtros de seguridad habituales en modelos alineados; conviene evaluar su comportamiento en temas sensibles.
- Solo ingles: no hay soporte declarado de castellano ni de otros idiomas.
- Contexto limitado a 4.096 tokens en entrenamiento; conversaciones o documentos clinicos largos pueden truncarse.
- Licencia Apache-2.0 declarada para esta release, pero el linaje incluye un fine-tune intermedio cuya licencia y condiciones no se detallan en la informacion disponible; verificar antes de uso comercial.
- Etiqueta image-text-to-text presente en los tags sin documentacion que la respalde: no asumir capacidades multimodales.
- El repo pesa 13,4 GB, lo que sugiere multiples cuantizaciones; el almacenamiento necesario para desplegar puede ser considerable si se descargan varias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-4B-Medical-Reasoning-GGUF
- Modelo base del adaptador: https://huggingface.co/xtools-at/Qwen3.5-4B-Medical-Reasoning
- Base inmediata del fine-tune: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset original: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/xtools-at/medical-o1-reasoning-SFT-chat
