# tab-for-akshay/ifos-answer-writer-qwen2.5-1.5b

## Resumen

El modelo `ifos-answer-writer-qwen2.5-1.5b` es un ajuste fino mediante LoRA y QLoRA del modelo base Qwen2.5-1.5B-Instruct, desarrollado por el usuario `tab-for-akshay`. Su proposito es generar respuestas de examen con un formato muy concreto, el utilizado en las pruebas IFoS (Indian Forest Service) y CSE del servicio administrativo indio, en las asignaturas de Botanica y Agricultura. El modelo aprende la estructura formal de la respuesta (cabecera, palabras clave, introduccion, puntos, una linea de diagrama, conclusion y linea de fuente) con limites de palabras segun la puntuacion de la pregunta, pero no garantiza la correccion factual del contenido.

Se trata de un modelo pequeno, de 1.543.714.304 parametros (aproximadamente 1,5 mil millones), disenado para caber en aplicaciones de escritorio. El autor indica que la version cuantizada Q4_K_M ocupa 941 MB, lo que permite ejecutarlo localmente en equipos modestos. Es el hermano pequeno de una variante de 3B del mismo autor.

La relevancia de este modelo es acotada: no es un modelo generalista ni compite en benchmarks de razonamiento o codigo, sino una herramienta de nicho para formatear respuestas de examen. El propio autor advierte de que los hechos no son fiables y recomienda verificar cada dato o combinarlo con recuperacion sobre apuntes verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen2.5-1.5B-Instruct) con adaptador LoRA |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (incluye Q4_K_M); pesos safetensors del adaptador LoRA |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (etiquetada como "other" en la model card) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer decoder-only de aproximadamente 1,5 mil millones de parametros. Sobre esa base se aplico un ajuste fino con QLoRA de rango 16 (r=16) durante 1 epoca, en una GPU Kaggle T4, con un tiempo de entrenamiento de 51 minutos. El conjunto de datos de entrenamiento consta de aproximadamente 5.200 respuestas modelo de Botanica y Agricultura de las pruebas UPSC IFoS/CSE, escritas en un formato fijo de "casa": cabecera, seccion KEYWORDS, introduccion, puntos, una linea de diagrama marcada con ◆, conclusion y linea de fuente, con limites de palabras determinados por la puntuacion de la pregunta.

La perdida en el conjunto de validacion bajo de 2,46 (modelo base) a 1,77 tras el ajuste. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal; el interes del modelo reside exclusivamente en el formateo aprendido.

## Capacidades

- Generacion de texto con formato estructurado de respuesta de examen (cabecera, KEYWORDS, introduccion, puntos, diagrama, conclusion, fuente).
- Ajuste del numero de palabras segun la puntuacion indicada en el prompt (por ejemplo, "8 marks").
- Generacion de respuestas en el dominio de Botanica y Agricultura de las pruebas IFoS/CSE.
- Capacidad conversacional heredada del modelo base (tag `conversational`).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Generacion de borradores de respuestas de examen: el modelo produce un esqueleto con el formato exacto de IFoS/CSE para preguntas de Botanica y Agricultura, que el estudiante revisa y corrige despues. Es adecuado porque el formato es el objetivo principal del ajuste.
- Herramienta de estudio en aplicaciones de escritorio: al ocupar 941 MB en Q4_K_M, puede integrarse en apps locales como Hob y ejecutarse sin conexion en equipos modestos.
- Formateo de apuntes ya verificados: combinado con recuperacion sobre notas fiables, el modelo puede reestructurar contenido correcto en el formato de respuesta esperado.
- Practica de gestion del tiempo en examenes: permite generar respuestas con el limite de palabras correspondiente a cada puntuacion, ayudando a ensayar la extension adecuada.
- Generacion de plantillas de respuesta por tema: util para crear esqueletos reutilizables de introduccion, puntos y conclusion para temas recurrentes del temario.
- Prototipado de asistentes educativos de nicho: sirve como ejemplo de ajuste fino LoRA de bajo coste (51 minutos en T4) para un formato y dominio muy especificos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida en validacion: 2,46 para el modelo base y 1,77 tras el ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en cuantizacion Q4_K_M (941 MB de pesos); en fp16, alrededor de 3 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM; el entrenamiento se realizo en una Kaggle T4.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (GTX 1650, RTX 3050, RTX 4090, etc.) e incluso en CPU.
- Opciones de despliegue: Ollama (comando documentado: `ollama run hf.co/tab-for-akshay/ifos-answer-writer-qwen2.5-1.5b:Q4_K_M`), llama.cpp para GGUF, y frameworks compatibles con safetensors/LoRA (transformers, vLLM, TGI) para los pesos completos o el adaptador.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ifos-answer-writer-qwen2.5-1.5b | 1,54 B | no disponible | Formato de respuestas IFoS/CSE | qwen-research | HuggingFace |
| ifos-answer-writer-qwen2.5-3b | no disponible (base 3B) | no disponible | Mismo enfoque, mayor tamano | no disponible | HuggingFace |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | no disponible | Modelo generalista conversacional | qwen-research | HuggingFace |

El modelo se posiciona como la variante ligera de la familia de ajustes del mismo autor, pensada para equipos con menos recursos que la version de 3B. Frente al Qwen2.5-1.5B-Instruct original, pierde generalidad a cambio de especializarse en un formato concreto.

## Limitaciones y advertencias

- Fiabilidad factual baja: el propio autor advierte de que el modelo aprendio el formato, no la botanica; los hechos deben verificarse o complementarse con recuperacion sobre apuntes fiables.
- Riesgo de bucle en decodificacion greedy: se recomienda temperatura de 0,3 a 0,5 y penalizacion por repeticion de 1,1.
- Dominio muy restringido: solo Botanica y Agricultura de las pruebas IFoS/CSE; no es un modelo generalista.
- Idiomas soportados no documentados; probablemente centrado en ingles por el dominio de entrenamiento.
- Licencia qwen-research: restricciones para uso comercial; conviene revisar los terminos de la licencia del modelo base antes de cualquier despliegue productivo.
- Sin datos de benchmarks publicados, por lo que no es posible comparar su rendimiento de forma objetiva.
- Modelo con cero descargas y cero likes en el momento de la consulta; sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tab-for-akshay/ifos-answer-writer-qwen2.5-1.5b
- Modelo hermano de 3B: https://huggingface.co/tab-for-akshay/ifos-answer-writer-qwen2.5-3b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
