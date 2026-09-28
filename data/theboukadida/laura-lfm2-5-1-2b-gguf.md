# Theboukadida/laura-lfm2.5-1.2b-GGUF

## Resumen

Laura es un ajuste fino (fine-tuning) del modelo LiquidAI/LFM2.5-1.2B-Instruct, publicado por el usuario Theboukadida en formato GGUF. Se trata de un modelo de 1.170.340.608 parametros (~1,17 B) especializado en una unica tarea: actuar como companero de conversacion en una aplicacion de aprendizaje de aleman para adultos principiantes (niveles A1-A2). El modelo corre en el telefono del usuario, solo con CPU, dentro de una aplicacion de curso de aleman sin conexion.

El problema que resuelve es muy concreto: un modelo generalista de 1,2 B responde de forma poco fiable en un contexto didactico muy acotado (personaje fijo, frases cortas, correccion no invasiva). El autor entreno un adaptador LoRA (rango 16, todas las capas lineales, 2 epocas) sobre unas 3000 conversaciones cortas de practica de aleman A1-A2, fusiono el adaptador en los pesos y convirtio el resultado a GGUF cuantizado en Q4_K_M con llama.cpp. Segun la evaluacion manual del propio autor, la proporcion de respuestas coherentes y en personaje pasa del 52 % en el modelo base al 89 % en este ajuste.

Su relevancia es de nicho pero ilustrativa: demuestra que un ajuste fino pequeno y barato sobre un modelo de ~1,2 B puede transformar el comportamiento en un dominio estrecho, manteniendo un despliegue de menos de 1 GB de pesos en dispositivo. No es un modelo de proposito general ni compite en benchmarks abiertos; su valor esta en el caso de uso acotado y en el desglose transparente del proceso de entrenamiento y conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del modelo base LiquidAI/LFM2.5-1.2B-Instruct; la model card no detalla la arquitectura interna) |
| Parametros totales | 1.170.340.608 (~1,17 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | aleman (de), ingles (en), frances (fr), arabe (ar) |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, declarada como `other`); modelo derivado del base |
| Formato de pesos | GGUF (`laura-lfm2.5-1.2b-Q4_K_M.gguf`, 730.898.432 bytes) |
| Modelo base | LiquidAI/LFM2.5-1.2B-Instruct |
| Tamano del repositorio | 0,7 GB |
| Hash sha256 del fichero | `f25d0858ddced1ebf1fdef109560958c3d50eef150965212d4f13c5921cda3f1` |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base, por lo que no se dispone de detalles sobre el tipo de transformer, el mecanismo de atencion ni la composicion del dataset original de LiquidAI. Lo que si se documenta con precision es el procedimiento de ajuste: se entreno un adaptador LoRA de rango 16 aplicado a todas las capas lineales, durante 2 epocas, sobre aproximadamente 3000 conversaciones cortas de practica de aleman de nivel A1-A2. El adaptador se fusiono en los pesos del modelo base y el resultado se convirtio a GGUF y se cuantizo a Q4_K_M con llama.cpp.

El objetivo del entrenamiento esta explicitado en cuatro reglas de comportamiento: responder en aleman sencillo con una o dos frases cortas y terminar con una pregunta nueva; mantenerse en un personaje fijo (Laura, de Francia, vive en Berlin, cocinera); corregir errores unicamente devolviendo la forma correcta, sin explicaciones largas; y, cuando el estudiante pregunta por el significado de una palabra, responder con una frase corta en el idioma del estudiante (ingles, frances o arabe) usando la definicion que la aplicacion le proporciona. No se menciona en la informacion disponible el uso de RLHF, DPO u otras tecnicas de alineacion adicionales.

El modelo espera un prompt de sistema de una sola linea seguido de la conversacion, por ejemplo: `Du bist Laura. Niveau A1.1. Lernersprache: Französisch. Kapitel: Guten Tag!. Wörter: der Name, das Land, …`. Para las preguntas de vocabulario, la aplicacion anade el significado del diccionario al mensaje del estudiante. La configuracion de muestreo recomendada es temperatura 0,1, top_k 50 y top_p 1,0.

## Capacidades

- Generacion de texto conversacional en aleman sencillo, orientada a nivel A1-A2, con respuestas de una o dos frases y cierre en forma de pregunta.
- Mantenimiento de un personaje fijo y coherente (Laura: francesa, residente en Berlin, cocinera) a lo largo de la conversacion.
- Correccion gramatical implicita: devuelve la forma correcta en lugar de explicar la regla.
- Definiciones de vocabulario en el idioma del estudiante: ingles, frances o arabe, a partir del significado que la aplicacion inyecta en el prompt.
- Conversacion multi-turno con un prompt de sistema compacto de una linea.
- Ejecucion en dispositivo (on-device) solo con CPU, sin acelerador.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito (thinking mode) en la informacion disponible.
- Capacidades multilingues limitadas al alcance del ajuste: aleman como lengua principal de conversacion y en/fr/ar para definiciones puntuales.

## Casos de uso

- Companero de conversacion en una aplicacion movil de aleman A1-A2: el modelo sostiene dialogos cortos y guiados por capitulo, con un prompt de sistema de una linea, y se ejecuta en CPU dentro del telefono sin conexion.
- Correccion de errores sin friccion pedagogica: en lugar de explicar la regla gramatical, el modelo reformula la frase con la forma correcta, lo que encaja en ejercicios de practica libre para principiantes.
- Diccionario contextual integrado: cuando el estudiante pregunta "Was bedeutet Termin?", la aplicacion adjunta el significado del diccionario y el modelo responde con una frase breve en el idioma del estudiante (frances, ingles o arabe).
- Simulacion de situaciones cotidianas por capitulo ("Guten Tag!", tramites, cocina): el personaje fijo y las respuestas cortas permiten escenarios de rol acotados y repetibles.
- Prototipado rapido de asistentes educativos con personaje fijo: sirve como plantilla reproducible de LoRA + fusion + GGUF Q4_K_M para validar una idea de producto antes de invertir en modelos mayores.
- Despliegue en dispositivos de gama baja o sin GPU: con un fichero de 731 MB, es viable en telefonos y equipos modestos, lo que habilita cursos de idiomas sin coste de inferencia en la nube.
- Evaluacion de tecnicas de ajuste en dominios estrechos: el repositorio publica el procedimiento completo (rango de LoRA, epocas, tamano del dataset, comando de cuantizacion), lo que lo hace util como referencia metodologica.

## Benchmarks y rendimiento

La model card no presenta resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares). El autor publica una evaluacion manual sobre 70 conversaciones retenidas (348 respuestas) que el modelo nunca vio, comparando el modelo base con el ajustado:

| Metrica (evaluacion manual, 70 conversaciones, 348 respuestas) | LFM2.5 1.2B base | Este modelo (Laura) |
|---|---|---|
| Respuestas sensatas y en personaje | 52 % | 89 % |
| Aleman gramatical y natural | 88 % | 97 % |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores son juicios manuales del autor, no metricas automaticas comparables entre modelos.

## Requisitos de hardware

- Pesos: el unico fichero publicado ocupa 730.898.432 bytes (aprox. 0,73 GB) en cuantizacion Q4_K_M.
- Inferencia en CPU: el caso de uso declarado es un telefono movil en solitario, sin GPU, lo que situa el requisito minimo de memoria en torno a 1 GB o algo mas, contando pesos, cache KV y overhead del runtime.
- VRAM estimada: inferior a 2 GB con la cuantizacion Q4_K_M; en precision completa (fp16) los ~1,17 B de parametros requeririan del orden de 2,3-2,5 GB de VRAM, aunque no se distribuyen pesos en ese formato.
- GPU: cabe con holgura en cualquier GPU de consumo, incluidas tarjetas de gama de entrada y soluciones integradas; tambien en RTX 3060, RTX 4090, A100 o H100, aunque estas ultimas estan sobredimensionadas para este tamano.
- Despliegue: al ser un fichero GGUF, es compatible con llama.cpp y con los runners basados en el (por ejemplo Ollama o llama-cpp-python). No se documenta soporte de vLLM ni TGI, que habitualmente trabajan con safetensors, y no se publican pesos en ese formato.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo ni de latencia en la informacion proporcionada.
- Parametros de muestreo recomendados por el autor: temperatura 0,1, top_k 50, top_p 1,0.

## Comparativa con modelos similares

Los datos disponibles solo permiten comparar con el modelo base del que deriva. Para alternativas de la misma categoria (modelos instructivos de ~1-2 B para dispositivo) no se dispone de especificaciones contrastadas en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento en la tarea de Laura |
|---|---|---|---|---|---|
| Laura (este modelo) | 1,17 B | no disponible | LFM Open License v1.0 | GGUF Q4_K_M | 89 % respuestas en personaje; 97 % aleman gramatical |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1,17 B | no disponible | LFM Open License v1.0 | safetensors (no confirmado en la informacion) | 52 % respuestas en personaje; 88 % aleman gramatical |
| Alternativas de ~1-2 B para on-device (por ejemplo, familias Qwen o Gemma en sus variantes pequenas) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con el modelo base es la unica sustentada por datos publicados, y corresponde a una evaluacion manual del autor sobre el dominio especifico de la aplicacion, no a una comparacion generalista.

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado para un unico rol (profesora de aleman A1-A2 llamada Laura) y un formato de prompt muy concreto. Fuera de ese contexto es previsible que rinda peor que el modelo base.
- Riesgo de alucinacion: aunque el autor indica que el modelo corrige sin divagar y que las definiciones se inyectan desde el diccionario de la aplicacion, no se documentan pruebas de robustez frente a vocabulario no cubierto ni frente a preguntas fuera de dominio.
- Dependencia del prompt de sistema: el comportamiento depende de que la aplicacion proporcione el prompt de una linea con el nivel, el idioma del estudiante, el capitulo y el vocabulario; sin el, el personaje y el registro pueden degradarse.
- Cobertura de idiomas acotada: aleman para la conversacion y en/fr/ar solo para definiciones breves. No hay evidencia de competencia general en ingles, frances o arabe.
- Longitud de contexto no documentada: no se especifica la ventana de contexto, lo que impide garantizar conversaciones largas o prompts extensos.
- Licencia: se declara `other` con nombre `lfm1.0` (LFM Open License v1.0). Es una licencia propia de LiquidAI, no una licencia de codigo abierto estandar; antes de un uso comercial conviene revisar el texto completo en el fichero LICENSE del repositorio, ya que puede incluir condiciones adicionales.
- Validacion limitada por la comunidad: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la evaluacion publicada es una anotacion manual del autor sobre 348 respuestas, sin replicacion independiente.
- Un unico artefacto publicado: solo existe la cuantizacion Q4_K_M en GGUF; no hay versiones en otros niveles de cuantizacion ni pesos completos, lo que limita el ajuste posterior o el despliegue en stacks que requieran safetensors.
- Contenido pedagogico: al tratarse de un asistente para adultos principiantes, no se documentan filtros de seguridad ni evaluaciones de contenido inapropiado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Theboukadida/laura-lfm2.5-1.2b-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Fichero de licencia del repositorio: LICENSE (referenciado en la model card, dentro del repositorio)
- Fichero de pesos: `laura-lfm2.5-1.2b-Q4_K_M.gguf` (730.898.432 bytes; sha256 `f25d0858ddced1ebf1fdef109560958c3d50eef150965212d4f13c5921cda3f1`)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devuelven exclusivamente sitios de contenido para adultos sin ninguna relacion con el modelo, por lo que se descartan como fuentes. No se dispone de paper, blog tecnico ni demo adicionales.
