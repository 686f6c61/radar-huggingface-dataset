# webmp3/Sakura-d1-3B-HighQuality-GGUF

## Resumen

Sakura-d1-3B-HighQuality-GGUF es un conjunto de cuatro ficheros GGUF cuantizados del modelo de decisión LiquidAI/d1-3B, publicado por el usuario webmp3 en HuggingFace. No es un modelo nuevo ni reentrenado: es una conversión y compresión de los pesos que Liquid AI publicó en October de 2026 (revision `da1fe36`), distribuida como construccion comunitaria y no respaldada por Liquid AI. El modelo base d1-3B pertenece a la familia LFM2.5 de Liquid AI y está diseñado especificamente para tareas de decisión (clasificación, elección entre opciones y puntuación) bajo el paradigma "system-one", no para generación de texto conversacional abierta.

Los pesos originales tienen 2.697.198.592 parámetros (unos 2,7 mil millones; el nombre comercial dice 3B) y el repositorio ocupa 8,9 GB entre los cuatro GGUF y los proyectores multimodales. La aportación del autor está en el esquema de cuantizacion de precisión mixta: cada grupo de tensores recibe su propia precision, elegida midiendo su coste en calidad de decisión, con una importance matrix construida a partir de prompts de decisión en 30 idiomas y código. El resultado son ficheros de 1,56 a 2,35 GB que el autor compara, decisión a decisión, contra las cuantizaciones publicadas por AtomicChat.

Su relevancia práctica es doble: permite ejecutar un modelo de decisión multimodal en hardware de consumo mediante llama.cpp, y ofrece una metodología de cuantizacion reproducible (imatrix multilingue, precisión por grupo de tensores) con métricas publicadas de deriva respecto a BF16. La contrapartida es que requiere una compilación no fusionada de llama.cpp, ya que el tipo de decisión `lfm2-d1` todavía no está en las releases estables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; modelo de decisión de la familia LFM2.5 de Liquid AI (etiquetas: liquid, lfm2.5, decision, system-one); multimodal (image-text-to-text) mediante proyector |
| Parametros totales | 2.697.198.592 (aprox. 2,7B) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible; el ejemplo de ejecucion de la model card usa 8192 tokens (`-c 8192`) |
| Tipos de cuantizacion | precision mixta por grupo de tensores con imatrix (HQ-S, HQ-Q4, HQ-Q5, HQ-Q6); proyector en Q8_0 y BF16 |
| Idiomas soportados | 16 declarados: ar, zh, en, fr, de, hi, id, it, ja, ko, pl, pt, ru, es, th, vi (la importance matrix se construyo con 30 idiomas) |
| Licencia | LFM Open License v1.0 (lfm1.0); campo license: other |
| Formato de pesos | GGUF (libreria gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

No se dispone de la descripcion arquitectonica completa del modelo base en la informacion proporcionada. Por las etiquetas y el nombre del repositorio, d1-3B es un modelo de decisión de Liquid AI basado en la linea LFM2.5, orientado a "system-one": recibe un estado (por ejemplo, el texto de una reclamacion) y devuelve respuestas tipadas a preguntas estructuradas. El pipeline declarado es `image-text-to-text`, lo que implica una torre de visión y un proyector multimodal que en estos GGUF se distribuye por separado como `mmproj` (Q8_0 de 583 MB o BF16 de 856 MB).

El autor no reentreno nada: convirtio los pesos BF16 con el conversor de la pull request 30110 de llama.cpp y aplico cuantizacion de precision mixta. La importance matrix se genero con `llama-imatrix` sobre 256 fragmentos de 2.048 tokens, con prompts de decisión renderizados por el propio codigo de prompt del modelo, construidos a partir de textos publicos (Wikipedia en 30 idiomas, ficheros de codigo fuente y datos de pregunta/respuesta en ingles y aleman). Para las clases S, Q4 y Q5 los esquemas de precision por tensor son propios del autor; para la clase Q6 se siguen las reglas por tensor que AtomicChat publico en su repositorio de metricas, cambiando unicamente la importance matrix. No se documentan en la informacion disponible datos de RLHF, DPO ni volumen de tokens de entrenamiento.

## Capacidades

- Preguntas de decisión tipadas: soporta preguntas de tipo sí/no, de elección entre opciones (`choice`) y de puntuación (`score`), devolviendo la opción seleccionada y las probabilidades por opción.
- Clasificación y enrutado: etiqueta un texto de entrada segun categorias definidas por el usuario, con criterios descritos en cada pregunta (por ejemplo, asignar "billing", "technical" o "fraud" a un caso).
- Puntuación y priorizacion: asigna un valor de una escala definida (por ejemplo, urgencia en tres niveles).
- Multilingue: cubre 16 idiomas declarados en las etiquetas, con una importance matrix construida sobre 30 idiomas.
- Capacidad multimodal (imagen-texto): acepta entradas de imagen mediante el proyector `mmproj`, aunque el autor solo verifico que una pregunta con imagen devuelve una respuesta sensata, sin medir la calidad de las decisiones con imagen.
- Sin soporte documentado de tool calling / function calling en la informacion disponible.
- Sin soporte documentado de agentes ni de razonamiento multi-paso encadenado; el paradigma system-one resuelve una decision por llamada.
- Interfaz de servicio: el ejemplo de la model card expone un endpoint `/v1/systemone` sobre `llama-server` que acepta un estado y un conjunto de preguntas.

## Casos de uso

- Triaje de tickets de soporte: se envia el texto del ticket como estado y se definen preguntas de elección (equipo responsable) y de puntuación (urgencia). El modelo devuelve el equipo y la prioridad en una sola llamada, con probabilidades por opción para poder fijar umbrales de derivacion a humano.
- Deteccion de intencion en atencion al cliente: pregunta de tipo sí/no ("¿pide el cliente un reembolso?") sobre el mensaje entrante, util para activar flujos automaticos de facturacion o devoluciones antes de que intervenga un agente.
- Moderacion de contenido por categorias: definir criterios como spam, acoso o contenido legitimo y clasificar cada publicacion, con la deriva de opción (drift) como indicador de confianza para el reenvio a revision manual.
- Clasificacion de documentos multilingues: al cubrir 16 idiomas, permite enrutar correos, formularios o incidencias de usuarios en distintos paises sin desplegar un modelo por idioma.
- Priorización en colas de incidencias tecnicas: preguntas de puntuación sobre la severidad percibida, para ordenar backlogs de soporte o de operaciones.
- Decisión como puerta en pipelines de agentes: usar el modelo como filtro previo (¿es esta consulta apta para el agente autonomo?) aprovechando su tamano reducido y su coste de inferencia bajo frente a un LLM generativo.
- Extraccion de señales sobre imagenes: con el proyector `mmproj`, clasificar capturas o imagenes adjuntas a incidencias (por ejemplo, si una captura muestra un error), asumiendo que la calidad de estas decisiones no está medida por el autor.
- Filtrado y etiquetado previo al re-ranking en RAG: decidir por pregunta binaria si un fragmento recuperado responde a la consulta antes de invocar un modelo mayor.

## Benchmarks y rendimiento

El autor publica metricas de decision, no benchmarks academicos (no hay MMLU, HumanEval ni GSM8K en la informacion disponible). Las cifras se midieron sobre 1.285 decisiones (preguntas de sí/no, de eleccion y de puntuacion sobre textos reservados en 30 idiomas y codigo) contra el modelo BF16 de la misma revision. "Respuestas cambiadas" cuenta las decisiones cuya opción principal difiere de BF16; "deriva de opción" es la distancia de variacion total media entre las distribuciones de opciones; "KLD" es la divergencia KL media.

| Fichero | Tamano | Respuestas cambiadas | Misma respuesta | Deriva de opción | KLD |
|---|---:|---:|---:|---:|---:|
| d1-3B-Sakura-HQ-S.gguf | 1.556 MB | 35 | 97,3 % | 0,0195 | 0,00239 |
| d1-3B-Sakura-HQ-Q4.gguf | 1.650 MB | 31 | 97,6 % | 0,0152 | 0,00150 |
| d1-3B-Sakura-HQ-Q5.gguf | 1.949 MB | 24 | 98,1 % | 0,0093 | 0,00057 |
| d1-3B-Sakura-HQ-Q6.gguf | 2.348 MB | 11 | 99,1 % | 0,0052 | 0,00019 |

Comparacion con las cuantizaciones publicadas por AtomicChat (cifras de AtomicChat tal como las publicaron, no remedidas por el autor de este repositorio):

| Clase | Sakura (autor) | AtomicChat (publicado) | Lectura |
|---|---|---|---|
| ~1,56 GB | HQ-S: 1.556 MB, 35 cambiadas, deriva 0,0195 | AD-IQ4_XS: 1.570 MB, 57 cambiadas, deriva 0,0203 | 39 % menos respuestas cambiadas, 4 % menos deriva, 1 % mas pequeno |
| ~1,65 GB | HQ-Q4: 1.650 MB, 31 cambiadas, deriva 0,0152 | AD-Q4_K_M: 1.658 MB, 37 cambiadas, deriva 0,0178 | 16 % menos respuestas cambiadas, 15 % menos deriva, 0,5 % mas pequeno |
| ~1,95 GB | HQ-Q5: 1.949 MB, 24 cambiadas, deriva 0,0093 | AD-Q5_K_M: 1.953 MB, 25 cambiadas, deriva 0,0112 | Una respuesta cambiada menos, 17 % menos deriva |
| ~2,35 GB | HQ-Q6: 2.348 MB, 11 cambiadas, deriva 0,0052 | AD-Q6_K: 2.348 MB, 11 cambiadas, deriva 0,0053 | Practicamente identico |

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 3 GB para el fichero Q6 (2.348 MB) y 2,5 GB para el Q4 (1.650 MB), sumando el proyector `mmproj-d1-3B-Q8_0.gguf` (583 MB) si se usan entradas de imagen. Con contexto de 8192 tokens hay que anadir el espacio de la KV cache.
- GPU recomendadas: cualquiera con 4 GB o mas de memoria dedicada. No requiere A100 ni H100; el modelo cabe holgadamente en una RTX 3060, RTX 4060, RTX 4090 o similar, e incluso en GPUs de gama de entrada.
- Ejecucion en CPU: viable por el tamano reducido de los ficheros, aunque las cifras de latencia no se especifican en la informacion disponible.
- Opciones de despliegue: llama.cpp / `llama-server` unicamente, y solo con la compilacion que incluya la pull request ggml-org/llama.cpp#30110 (el tipo de decision `lfm2-d1` no está en las releases estables). No hay soporte confirmado para vLLM, TGI, Ollama ni LM Studio en la informacion disponible. El ejemplo del autor usa `-ngl 99 -c 8192` con `llama-server`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| webmp3/Sakura-d1-3B-HighQuality-GGUF | ~2,7B | no disponible (ejemplo con 8192) | GGUF, precision mixta imatrix | LFM Open License v1.0 | Requiere llama.cpp con PR 30110 |
| AtomicChat/d1-3B-GGUF | ~2,7B (mismo base) | no disponible | GGUF (IQ4_XS, Q4_K_M, Q5_K_M, Q6_K) | LFM Open License v1.0 | Requiere soporte del tipo de decision |
| LiquidAI/d1-3B (original) | ~2,7B | no disponible | Pesos originales, uso con Transformers (`trust_remote_code=True`) | LFM Open License v1.0 | Publicado por Liquid AI |

No se dispone de otros modelos comparables de la misma categoria (modelos de decision de ~3B) en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo de proposito general: está disenado para responder preguntas de decision tipadas. Usarlo como chatbot o para redactar texto no es su caso de uso y no está validado.
- Riesgo de error en la decision: incluso en la cuantizacion mas alta (Q6) cambia 11 de 1.285 decisiones respecto a BF16; en la clase S cambia 35. Ese porcentaje de error debe tenerse en cuenta en flujos criticos y acompanarse de umbrales de confianza sobre las probabilidades.
- Metodologia de evaluacion acotada: las cifras de deriva proceden de un unico conjunto de 1.285 decisiones. El propio autor advierte que los recuentos varian unas pocas unidades entre ejecuciones del mismo fichero y que las comparaciones con AtomicChat se hicieron en configuraciones distintas (GPU CUDA frente a Vulkan, conversiones BF16 diferentes).
- Calidad multimodal no medida: el autor solo comprobo que una pregunta con imagen devuelve una respuesta sensata; no hay metricas de decision sobre imagenes.
- Dependencia de una compilacion no fusionada: sin la PR 30110, las releases de llama.cpp no reconocen el tipo `lfm2-d1`. Esto complica el despliegue en produccion y la integracion con herramientas que empaquetan llama.cpp.
- Construccion comunitaria: no está respaldada ni revisada por Liquid AI, y no debe confundirse con los pesos oficiales. El autor indica que los GGUF anteriores de Liquid se construyeron sobre pesos previos y no son comparables.
- Licencia: se distribuye bajo LFM Open License v1.0, con el campo `license: other`. Antes de un uso comercial hay que revisar las condiciones del fichero `LICENSE` incluido en el repositorio.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 "likes", sin historial de uso en produccion que respalde su comportamiento en entornos reales.
- Idiomas: aunque declara 16 idiomas, no se publican metricas de decision desglosadas por idioma, por lo que el rendimiento relativo entre ellos no está caracterizado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/webmp3/Sakura-d1-3B-HighQuality-GGUF
- Modelo base: https://huggingface.co/LiquidAI/d1-3B
- GGUF de referencia de AtomicChat: https://huggingface.co/AtomicChat/d1-3B-GGUF
- Repositorio de metricas de AtomicChat: https://huggingface.co/datasets/AtomicChat/d1-3B-GGUF-metrics
- Pull request de llama.cpp con soporte del tipo de decision: https://github.com/ggml-org/llama.cpp/pull/30110
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Licencia LFM Open License v1.0: fichero `LICENSE` del repositorio
