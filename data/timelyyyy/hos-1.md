# Timelyyyy/HOS-1

## Resumen
HOS-1 es un modelo de generacion de texto de 2.614.341.888 parametros derivado de google/gemma-2-2b mediante un merge con ArliAI/Gemma-2-2B-ArliAI-RPMax-v1.1 y un posterior ajuste QLoRA. Lo desarrolla el usuario Timelyyyy y se publica bajo licencia Gemma en Hugging Face. El autor lo describe explicitamente como un "joke model" entrenado con mensajes reales, sin capacidades de razonamiento ni de generacion de codigo, y orientado a uso personal.

El modelo no resuelve un problema tecnico concreto: es un experimento de ajuste conversacional sobre una base Gemma 2 de 2B, con 103 pasos de entrenamiento (menos de la epoch inicialmente prevista). Su relevancia es limitada y de caracter divulgativo o de entretenimiento; resulta util como ejemplo de pipeline QLoRA + merge sobre Gemma 2 y como caso de estudio de los riesgos de publicar ajustes conversacionales sin filtrado.

La ficha se basa unicamente en la informacion disponible en Hugging Face y en la model card; no hay benchmarks, paper ni documentacion tecnica adicional publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 2 2B), ajustado con QLoRA y fusionado (merge) |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Gemma 2 2B, no confirmada por el autor) |
| Tipos de cuantizacion | GGUF (tag del repo); niveles concretos no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors y GGUF (tag gguf; tamano del repo 9,7 GB) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only de Google con atencion por ventanas alternada y atencion global, disenado para inferencia eficiente en hardware modesto. Sobre esa base, el autor parte de ArliAI/Gemma-2-2B-ArliAI-RPMax-v1.1 (un ajuste conversacional de la comunidad) y aplica QLoRA, fusionando despues los adaptadores en el modelo final. No se documentan hiperparametros, composicion del dataset ni numero de tokens de entrenamiento.

El entrenamiento se detuvo a los 103 pasos, cuando el autor consideraba que era suficiente; inicialmente planeaba una epoch completa. No consta uso de RLHF, DPO ni tecnicas de alineacion adicionales. Tampoco se describen innovaciones tecnicas: el valor del modelo es el propio pipeline de QLoRA sobre una base Gemma 2, no una contribucion arquitectonica.

## Capacidades
- Generacion de texto conversacional en ingles, con respuestas a preguntas basicas segun el autor.
- Razonamiento: el autor indica explicitamente que no tiene capacidad de razonamiento.
- Codigo: el autor indica que no parece escribir codigo.
- Tool calling / function calling: no disponible; no se menciona soporte.
- Agentes y razonamiento multi-paso: no disponible; no se menciona soporte.
- Multilingue: limitado a ingles (tag `en`).
- Capacidades especiales (thinking mode, vision, audio): no disponibles.
- Comportamiento irregular: el autor advierte que "sometimes spits tenor links" y que "WILL be saying some wild stuff", por lo que la salida puede contener contenido no deseado.

## Casos de uso
- Experimentacion con pipelines QLoRA y merge: sirve como referencia practica para reproducir el flujo QLoRA sobre Gemma 2 2B y fusionar adaptadores, dado que el autor documenta el proceso a grandes rasgos.
- Pruebas de inferencia GGUF en hardware de consumo: al ser un modelo de 2B con pesos GGUF, permite validar despliegues en llama.cpp u Ollama en equipos con poca VRAM.
- Generacion de dialogos informales en ingles para prototipos de chatbot: el ajuste conversacional sobre RPMax produce respuestas coloquiales utiles para maquetas de interfaz, sin garantia de calidad.
- Estudio de riesgos de ajustes conversacionales sin filtrado: el modelo ejemplifica como un QLoRA breve sobre mensajes reales puede producir salidas toxicas o incoherentes, util en docencia sobre seguridad en IA.
- Evaluacion comparativa de bases Gemma 2 2B: permite contrastar el efecto de un ajuste ligero frente al modelo base en tareas de conversacion abierta.
- Demos y contenido divulgativo: su caracter de "joke model" lo hace adecuado para articulos o charlas que ilustren el estado del ecosistema de ajustes comunitarios, nunca para produccion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en FP16, aproximadamente 5,2 GB solo para pesos (2,61B parametros); en cuantizacion de 8 bits, alrededor de 2,6 GB; en 4 bits, alrededor de 1,3 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070) para FP16; GPUs de 4-6 GB para cuantizaciones de 4-8 bits. Para despliegue en servidor, A100 o H100 no son necesarias por el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 6-8 GB de VRAM en cuantizacion.
- Opciones de despliegue: llama.cpp y Ollama por los pesos GGUF; vLLM o TGI para los pesos safetensors; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Inference Endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Timelyyyy/HOS-1 | 2,61B | no disponible | gemma | Ajuste QLoRA comunitario, sin benchmarks, uso personal segun el autor |
| google/gemma-2-2b | 2,61B | no disponible en esta ficha | gemma | Modelo base oficial de Google, con evaluaciones publicadas por el desarrollador |
| ArliAI/Gemma-2-2B-ArliAI-RPMax-v1.1 | ~2,6B | no disponible en esta ficha | gemma | Base conversacional del ajuste; orientado a roleplay y conversacion |
| Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 | Alternativa de tamano similar con licencia permisiva y benchmarks publicados |

La comparativa con Qwen2.5 se incluye como referencia de categoria; los datos de ese modelo provienen de su documentacion publica, no de la informacion proporcionada sobre HOS-1.

## Limitaciones y advertencias
- El autor califica el modelo como "joke model" y advierte que "WILL be saying some wild stuff"; no es apto para produccion.
- Sin capacidad de razonamiento ni de generacion de codigo, segun el propio autor.
- Riesgo elevado de alucinacion y de salidas incoherentes o inapropiadas, derivado de un entrenamiento de solo 103 pasos sobre mensajes reales sin filtrado aparente.
- Puede emitir enlaces no deseados ("tenor links") de forma espontanea.
- Solo soporta ingles; no hay evidencia de capacidades multilingues.
- Licencia Gemma: impone restricciones de uso comercial y obligaciones de la Gemma Terms of Use; el autor indica ademas "Personal use only", lo que refuerza la limitacion.
- No hay informacion sobre sesgos especificos, pero el entrenamiento con mensajes reales sin curacion documentada aumenta el riesgo de sesgos y toxicidad.
- Longitud de contexto no confirmada por el autor; no debe asumirse la de Gemma 2 2B sin verificacion.
- Sin benchmarks ni evaluaciones independientes: no hay base para comparar su rendimiento de forma objetiva.

## Enlaces
- Hugging Face: https://huggingface.co/Timelyyyy/HOS-1
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Modelo base del ajuste: https://huggingface.co/ArliAI/Gemma-2-2B-ArliAI-RPMax-v1.1
- Captura de configuracion de inferencia citada en la model card: https://file.garden/aSVi7A-81Gu_AES6/Screenshot%202026-10-31%20110647.png
