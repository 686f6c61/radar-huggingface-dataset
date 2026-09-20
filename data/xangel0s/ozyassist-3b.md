# Xangel0s/OzyAssist-3B

## Resumen

OzyAssist-3B es un modelo de generacion de texto de 3.085.938.688 parametros (aproximadamente 3,09 mil millones) publicado por el usuario Xangel0s en HuggingFace bajo licencia Apache 2.0. Forma parte de la familia OzyAssist, un conjunto de modelos cuantizados en GGUF disenados para actuar como el "cerebro" de un agente autonomo de automatizacion de escritorio en Windows: control de ventanas, apertura y cierre de aplicaciones, ejecucion de acciones multi-paso y asistencia por voz. El modelo se distribuye en espanol e ingles y esta etiquetado como compatible con endpoints conversacionales y con llama.cpp.

El dato mas relevante de su ficha es que la variante de 3B no se entrena desde cero ni se presenta como un fine-tuning directo del modelo base declarado, sino como un proceso de destilacion de trazas de chain-of-thought generadas por el modelo "maestro" de 7B de la misma familia. El objetivo declarado es conservar la capacidad de razonamiento del 7B reduciendo el coste computacional: segun la model card, la variante q4_k_m ocupa 1,80 GB, consume aproximadamente 2,3 GB de VRAM y alcanza entre 18 y 25 tokens por segundo, frente a los 4,68 GB, 4,3 GB de VRAM y 8-14 t/s del 7B.

La relevancia del modelo esta en su enfoque: agentes de escritorio que se ejecutan en local sobre hardware de consumo, dejando VRAM libre para otras tareas (la ficha afirma que deja unos 5,8 GB libres en una GPU de 8 GB). Sin embargo, conviene ser prudente: el repositorio registra 0 descargas y 0 likes, no publica resultados de benchmarks y la informacion disponible sobre datos de entrenamiento, contexto o configuracion de cuantizacion es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; derivada de la familia Qwen2.5-Coder (transformer decoder-only) segun el campo base_model |
| Parametros totales | 3.085.938.688 (aproximadamente 3,09 B), dato real de safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF; se documenta q4_k_m (1,80 GB). Otros niveles no disponibles |
| Idiomas soportados | Espanol (es) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos cuantizados) y safetensors (segun el recuento de parametros real) |
| Modelo base declarado | Qwen/Qwen2.5-Coder-7B-Instruct (la ficha interna describe la variante 3B como "Qwen2.5-Coder-3B + CoT") |
| Tamano del repositorio | 1,9 GB |
| Pipeline | text-generation |
| Fecha de creacion | 2026-09-20 |

## Arquitectura y entrenamiento

No se detalla la arquitectura interna en la informacion disponible mas alla de la herencia de la familia Qwen2.5-Coder, que emplea transformers decoder-only con atencion por grupos (GQA) y RoPE. El modelo base declarado en la metadata es Qwen/Qwen2.5-Coder-7B-Instruct, mientras que la tabla de la propia model card describe la variante de 3B como "Qwen2.5-Coder-3B + CoT". No se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica que declara el autor es la destilacion de chain-of-thought: el modelo se entrena con trazas de pensamiento generadas por el modelo maestro de 7B de la familia, con el objetivo de que verifique el estado de Windows antes de responder. La ficha tambien afirma mejoras en memoria multi-turno ("cero lagunas de memoria": recuerda ventanas y acciones de turnos anteriores) y capacidad de ejecutar multiples aplicaciones en paralelo dentro de un mismo turno. No se aportan detalles de metodologia, hiperparametros ni curvas de entrenamiento.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline text-generation, etiqueta conversational).
- Tool calling y function calling, orientado a la invocacion de herramientas del sistema operativo.
- Comportamiento agentico de multiples pasos: planificacion y ejecucion de secuencias de acciones.
- Automatizacion de escritorio en Windows: apertura, cierre y gestion de ventanas y aplicaciones.
- Ejecucion multi-app en un solo turno (varias aplicaciones de forma paralela, segun la ficha).
- Memoria de estado entre turnos: retencion de acciones y ventanas manejadas previamente.
- Razonamiento con chain-of-thought destilado del modelo maestro de 7B.
- Capacidades de codigo heredadas del linaje Qwen2.5-Coder.
- Multilingue: espanol e ingles.
- Asistente por voz: la variante de 1,5 B de la familia se presenta explicitamente como "Voice" para comandos rapidos.
- Compatibilidad declarada con endpoints (etiqueta endpoints_compatible) e integracion via llama.cpp.
- No se documentan capacidades de vision, audio de entrada ni procesamiento multimodal.

## Casos de uso

- Agente autonomo de escritorio en Windows: el modelo interpreta una orden en lenguaje natural ("abre el navegador y el editor") y la traduce en llamadas a herramientas del sistema. Su tamano de 3B y su consumo de aproximadamente 2,3 GB en q4_k_m permiten mantenerlo residente en memoria mientras el usuario trabaja.
- Asistente por voz en local: combinado con un motor de reconocimiento de voz y la variante ligera de la familia (1,5 B a 50-65 t/s), sirve para comandos rapidos tipo "cierra todas las ventanas de mensajeria" sin enviar audio a la nube, lo que resulta adecuado en entornos con requisitos de privacidad.
- Automatizacion multi-aplicacion en un unico turno: escenarios de puesta en marcha de un puesto de trabajo (lanzar VPN, cliente de correo, IDE y repositorio) se pueden resolver en una sola llamada gracias a la ejecucion paralela de apps declarada por el autor.
- Soporte tecnico de primer nivel en escritorios corporativos: el modelo puede inspeccionar el estado del sistema y proponer o ejecutar acciones correctivas (reiniciar un servicio, cerrar un proceso bloqueado) manteniendo contexto de lo ya intentado en turnos anteriores.
- Copiloto de scripting y automatizacion ligera: con el linaje Qwen2.5-Coder y soporte de tool calling, encaja en tareas de generacion de scripts de mantenimiento o pequenas utilidades de automatizacion de ficheros.
- Despliegue en equipos de gama media: con unos 2,3 GB de VRAM en q4_k_m y unos 5,8 GB libres en una GPU de 8 GB, permite ejecutar el agente junto a otras cargas (juegos, streaming o un IDE) en la misma tarjeta.
- Entornos aislados o sin conectividad: al distribuirse en GGUF y ejecutarse con llama.cpp, puede desplegarse en maquinas sin acceso a Internet ni a APIs externas.
- Interfaz conversacional sobre herramientas internas: la etiqueta endpoints_compatible facilita exponerlo como servicio compatible con la API de OpenAI y conectarlo a un orquestador de agentes existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta cifras de velocidad de inferencia y consumo de memoria para las tres variantes de la familia, que se recogen a continuacion:

| Variante | Tamano GGUF | Cuantizacion | Velocidad declarada | VRAM declarada | Uso recomendado por el autor |
|---|---|---|---|---|---|
| OzyAssist-3B-v3 | 1,80 GB | q4_k_m | 18-25 t/s | Aproximadamente 2,3 GB | Equilibrio general, multi-herramienta |
| OzyAssist-7B-v3 | 4,68 GB | q4_k_m | 8-14 t/s | Aproximadamente 4,3 GB | Tareas complejas de codigo y analisis |
| OzyAssist-1.5B-v3 | 986 MB | q4_k_m | 50-65 t/s | Aproximadamente 1,3 GB | Comandos por voz, equipos limitados |

No se especifica el hardware utilizado para obtener estas cifras, por lo que no son directamente comparables con mediciones de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia (cifras declaradas por el autor para la variante de 3B en q4_k_m): aproximadamente 2,3 GB.
- Disco: el fichero GGUF de la variante de 3B ocupa 1,80 GB; el repositorio completo, 1,9 GB.
- Cabe en GPU de consumo: si, segun la ficha deja unos 5,8 GB libres en una GPU de 8 GB. Por tanto es viable en tarjetas de 8 GB o mas (por ejemplo, gamas RTX xx60/xx70 con 8 GB o superior). La lista concreta de GPU recomendadas no esta disponible en la informacion proporcionada.
- CPU: no se documenta requisito minimo de CPU ni de RAM del sistema; tampoco se indica si existe modo solo-CPU.
- Opciones de despliegue: llama.cpp es el runtime mencionado explicitamente; el formato GGUF es compatible con el ecosistema llama.cpp (Ollama, servidores GGUF, etc.). El modelo esta etiquetado como endpoints_compatible. No se confirma soporte para vLLM, TGI ni TensorRT-LLM.
- Latencia y throughput: 18-25 t/s en la variante de 3B q4_k_m; 8-14 t/s en la de 7B; 50-65 t/s en la de 1,5B. Hardware de referencia no especificado.
- Contexto largo: al no publicarse la longitud de contexto, no es posible estimar el consumo de VRAM asociado a KV cache con ventanas largas.

## Comparativa con modelos similares

La informacion disponible solo permite comparar dentro de la propia familia OzyAssist. No se han encontrado datos de modelos alternativos en la busqueda web realizada.

| Modelo | Parametros | Arquitectura declarada | Contexto | VRAM (q4_k_m) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OzyAssist-3B-v3 | 3,09 B | Qwen2.5-Coder-3B + CoT destilado | No disponible | Aproximadamente 2,3 GB | Apache 2.0 | GGUF en HuggingFace |
| OzyAssist-7B-v3 | No disponible en detalle | Qwen2.5-Coder-7B | No disponible | Aproximadamente 4,3 GB | No disponible (familia bajo Apache 2.0 en el repo consultado) | GGUF, mismo repositorio |
| OzyAssist-1.5B-v3 | No disponible en detalle | Qwen2.5-Coder-1.5B | No disponible | Aproximadamente 1,3 GB | No disponible | GGUF, mismo repositorio |

Como referencia externa, el modelo base declarado es Qwen2.5-Coder-7B-Instruct: un transformer decoder-only de 7,6 B con contexto nativo de 32.768 tokens, licencia Apache 2.0 y amplia disponibilidad en safetensors y GGUF. No obstante, no se dispone de datos de benchmark que permitan comparar el rendimiento de OzyAssist-3B frente a alternativas de su categoria.

## Limitaciones y advertencias

- Ausencia total de evaluacion publica: no hay benchmarks, ni datos de evaluacion humana, ni comparaciones verificables. El repositorio registra 0 descargas y 0 likes en el momento de la consulta.
- Ambiguedad en la metadata: el campo base_model apunta a Qwen2.5-Coder-7B-Instruct mientras que la model card describe la variante como derivada de Qwen2.5-Coder-3B con destilacion de chain-of-thought del 7B. Esta discrepancia dificulta reproducir el proceso de entrenamiento.
- Falta de trazabilidad del entrenamiento: no se documentan tokens de entrenamiento, composicion del dataset, fuentes de las trazas de CoT, ni uso de RLHF o DPO.
- Longitud de contexto no publicada: es un dato critico para un agente que debe recordar acciones previas, y su ausencia impide planificar despliegues con conversaciones largas.
- Riesgo de alucinacion en acciones irreversibles: un agente con permiso para cerrar aplicaciones o modificar el escritorio puede ejecutar acciones no deseadas si interpreta mal una instruccion. Se recomienda validacion humana y listas blancas de herramientas.
- Riesgo de degradacion por cuantizacion: la unica cuantizacion documentada es q4_k_m; no se informa de la perdida de calidad del razonamiento destilado tras cuantizar.
- Cobertura idiomatica limitada a espanol e ingles; no se declara soporte para otras lenguas.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte, y la licencia del modelo destilado debe verificarse frente a las condiciones del modelo maestro utilizado para generar las trazas.
- Fecha de creacion anomalamente futura en la metadata (2026-09-20), lo que sugiere posibles inconsistencias en el registro del repositorio.
- Dependencia de un runtime concreto: el despliegue documentado pasa por llama.cpp y GGUF; no se confirma compatibilidad con vLLM o TGI para escenarios de alto throughput.
- La busqueda web realizada no devolvio ningun resultado relacionado con el modelo, por lo que no existe validacion externa ni documentacion de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xangel0s/OzyAssist-3B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Paper, blog, repositorio o demo adicionales: no disponibles. La busqueda web no devolvio resultados relevantes sobre OzyAssist (los resultados obtenidos correspondian a contenidos no relacionados con el modelo).
