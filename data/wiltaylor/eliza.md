# wiltaylor/ELIZA

## Resumen

ELIZA es un ajuste fino conductual estrecho del modelo base `Qwen/Qwen3-0.6B-Base`, desarrollado por wiltaylor. El modelo reproduce el estilo de conversacion del clasico guion DOCTOR de ELIZA, el chatbot de 1966 creado por Joseph Weizenbaum en el MIT: respuestas cortas, en mayusculas y de naturaleza reflectante que devuelven la pregunta al usuario en lugar de responderla directamente. Se trata de un experimento de investigacion para estudiar si un modelo pequeno puede imitar una politica dialogica determinista mediante aprendizaje por refuerzo a partir de un oraculo de reglas.

El modelo se entrena con LoRA (rank 16) sobre todas las proyecciones lineales de atencion y MLP del base, con un total de 596.049.920 parametros. El dataset sintetico contiene 30.000 conversaciones de entrenamiento, 2.000 de validacion y 2.000 de test, generadas localmente sin datos de terceros. La relevancia actual reside en su valor educativo e historico: demuestra como un modelo pequeno puede capturar un comportamiento conversacional especifico con recursos minimos, y sirve como banco de pruebas para estudiar la diferencia entre imitacion superficial y comprension real del lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B-Base) con adaptador LoRA |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B-Base, un transformer decoder-only de 0.6B parametros. El ajuste fino utiliza LoRA con rank 16 aplicado a todas las proyecciones lineales de atencion y MLP, lo que permite un entrenamiento eficiente en recursos. Solo los tokens finales de asistente reciben loss; los turnos previos actuan como contexto.

El entrenamiento se realizo en dos fases: una inicial con 30.000 conversaciones sinteticas generadas por un oraculo deterministico de reglas, seguida de un pase correctivo de 4.000 ejemplos (2.000 parafrasis nuevas de categorias de fallo y 2.000 ejemplos originales para replay). El checkpoint correctivo seleccionado mejoro la loss de validacion de 1.604 a 1.571. Los conjuntos de test y validacion utilizan marcos de redaccion completos y vocabularios de slots ausentes en el entrenamiento, lo que evalua la generalizacion del comportamiento aprendido.

## Capacidades

- Generacion de texto conversacional en estilo ELIZA DOCTOR: respuestas cortas, en mayusculas y reflectantes.
- Reflexion de puntos de vista, sentimientos, afirmaciones de identidad, incapacidad, deseos, familia, suenos, ordenadores, razones, preguntas, universales, incertidumbre, afirmacion, negacion, saludos, disculpas, fallback, despedidas y recuerdo de memoria multi-turno.
- Recuerdo explicito de memoria multi-turno: el modelo mantiene referencias a turnos anteriores de la conversacion.
- Imitacion de una politica dialogica determinista: el modelo reproduce las reglas del oraculo con alta fidelidad (99.6% de senal de regla gruesa en evaluacion).
- No es un asistente general: no responde preguntas factuales ni ofrece informacion; su comportamiento caracteristico es reflejar y desviar.

## Casos de uso

- Demostraciones educativas de historia de la IA: el modelo permite mostrar en clase como funcionaba ELIZA y compararlo con asistentes modernos, ilustrando la evolucion de los sistemas conversacionales.
- Investigacion en imitacion conductual: estudiar si un modelo pequeno puede replicar una politica determinista y donde falla, con aplicaciones en el analisis de la naturaleza de la comprension del lenguaje.
- Experimentos de generacion de texto con recursos minimos: al ser un modelo de 0.6B con adaptador LoRA, puede ejecutarse en hardware modesto, ideal para practicas de laboratorio.
- Comparacion de comportamientos entre modelos: usar ELIZA como baseline para medir hasta que punto los modelos grandes muestran comportamientos emergentes frente a comportamientos programados.
- Generacion de datos sinteticos para entrenamiento: las respuestas del modelo pueden servir para crear datasets de entrenamiento de clasificadores de estilo conversacional.
- Estudios de interaccion humano-maquina: analizar como reaccionan los usuarios ante un sistema que imita un comportamiento terapeutico sin comprension real, relevante para el diseno de sistemas seguros.

## Benchmarks y rendimiento

La evaluacion se realizo sobre 500 ejemplos held-out con marcos de redaccion completos y vocabularios de slots ausentes en el entrenamiento. Los resultados se comparan con el modelo base sin ajustar:

| Metrica | ELIZA (ajustado) | Base (sin ajustar) |
|---|---|---|
| Respuesta no vacia | 100% | no disponible |
| Respuesta concisa (1-24 palabras) | 100% | no disponible |
| Estilo terminal en mayusculas | 100% | no disponible |
| Sin frase de asistente moderno | 100% | no disponible |
| Senal de regla gruesa | 99.6% | 1% |
| Word-F1 del oraculo | 0.461 | 0.0006 |
| Senal explicita de memoria multi-turno | 100% | no disponible |

La evaluacion combina propiedades de forma de respuesta, senales de reglas por palabras clave, solapamiento de palabras e inspeccion manual de transcripciones, dado que multiples respuestas del oraculo son validas para un mismo prompt.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero al ser un modelo de 0.6B parametros, cabe en GPUs consumer con 4-6 GB de VRAM en precision completa.
- GPU recomendadas: cualquier GPU consumer moderna (NVIDIA GTX 1060 6GB o superior, RTX 3060, RTX 4090) o incluso CPU para inferencia lenta.
- Si cabe en consumer GPU: si, con margen amplio.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, llama.cpp para cuantizacion GGUF, Ollama si se convierte el modelo, o TGI para endpoints compatibles.
- Latencia y throughput estimados: no disponibles, pero en una GPU consumer se esperan latencias de milisegundos por token dado el tamano reducido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| wiltaylor/ELIZA | 0.6B | no disponible | Apache-2.0 | Imitacion de ELIZA DOCTOR |
| Qwen/Qwen3-0.6B-Base | 0.6B | no disponible | Apache-2.0 | Modelo base general |
| Qwen/Qwen3-0.6B-Instruct | 0.6B | no disponible | Apache-2.0 | Asistente conversacional general |

La comparativa directa con otros modelos de imitacion de ELIZA no esta disponible en la informacion proporcionada. La diferencia clave con el base y el instruct es que ELIZA esta especificamente entrenado para un comportamiento estrecho y deterministico, mientras que los otros son modelos generales.

## Limitaciones y advertencias

- El modelo imita el comportamiento DOCTOR de ELIZA, pero no es una restauracion bit a bit de una implementacion historica concreta ni de un port de los anos 80.
- La gramatica de entrenamiento es sintetica y deliberadamente estrecha; el modelo fallara fuera de los patrones aprendidos.
- Las respuestas reflectantes pueden parecer empaticas sin implicar comprension real del contenido.
- Puede responder de forma inapropiada ante crisis: el comportamiento historico de ELIZA no es una politica de seguridad moderna. Los despliegues deben gestionar la seguridad fuera del modelo.
- La salida en mayusculas es un estilo intencional de la era de terminales, no un error.
- No es un terapeuta, servicio de salud mental, asistente factual ni modelo de chat general.
- No se han publicado datos sobre sesgos especificos, pero al entrenarse con datos sinteticos estrechos, el riesgo de alucinacion es alto fuera de su dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wiltaylor/ELIZA
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B-Base
- Emulador de ELIZA en navegador: https://elizaemulator.com/
- Historia de ELIZA: https://liacademy.co.uk/the-story-of-eliza-the-ai-that-fooled-the-world/
