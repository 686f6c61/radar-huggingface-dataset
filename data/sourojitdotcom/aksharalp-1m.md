# sourojitdotcom/AksharaLP-1M

## Resumen

AksharaLP-1M es un modelo minúsculo de transliteración de hindi romanizado a escritura devanagari, desarrollado por el usuario independiente sourojitdotcom. No es un modelo de lenguaje generativo al uso: es un sistema especializado de conversión de script que transforma texto hindi escrito con letras latinas (por ejemplo, "kal meeting hai, kaise ho?") en devanagari correcto (कल मीटिंग है, कैसे हो?), preservando el contexto y sin traducir el contenido. Su proposito es resolver un problema muy concreto: la mayoria de hablantes de hindi escriben en teclados QWERTY usando transliteracion informal, y este modelo convierte esa entrada en texto nativo de forma fiable.

El nucleo del modelo tiene 989K parametros (menos de un millon), con pesos cuantizados a 4 bits, y se distribuye en dos capas: un nucleo de 0,57 MB que incluye un transformer de caracteres, un reranker y el runtime, y un paquete de diccionario de 3,97 MB con un lexico de 1,5 millones de palabras y un modelo de lenguaje de frases. El paquete completo ocupa 4,53 MB comprimido y esta disenado para ejecutarse integramente en el navegador, en un Web Worker, sin servidor ni GPU.

La relevancia actual del modelo reside en su extrema eficiencia y en su enfoque on-device: ofrece una alternativa open source (Apache 2.0) a IndicXlit, el modelo de transliteracion indico mas extendido, con un tamano entre 5 y 47 veces menor y, segun el autor, una precision top-1 superior en el conjunto de test de Aksharantar. La version v1 aqui descrita tiene una sucesora recomendada, AksharaLP-1M-v2, que mejora el diccionario y el reranker para grafias de estilo chat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de caracteres con reranker y runtime; paquete complementario de diccionario y modelo de lenguaje de frases |
| Parametros totales | 989K (989.000) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos a 4 bits (segun la model card) |
| Idiomas soportados | Hindi (hi) y ingles (en) como script de entrada/salida; tarea hindi romanizado a devanagari |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (runtime JavaScript para navegador; el repositorio pesa 0,0 GB) |

## Arquitectura y entrenamiento

El modelo se compone de un transformer de caracteres de 989K parametros con pesos cuantizados a 4 bits, acompanado de un reranker y un runtime de inferencia. Sobre este nucleo se superpone un paquete de diccionario de 3,97 MB que contiene un lexico de 1,5 millones de palabras y un modelo de lenguaje de frases; el runtime lo descarga en el primer uso y lo cachea. El conjunto se ejecuta en un Web Worker del navegador, lo que permite inferencia completamente offline sin servidor ni acelerador hardware.

El entrenamiento utiliza los conjuntos de datos ai4bharat/Aksharantar (para transliteracion a nivel de palabra) y ai4bharat/IndicCorpV2 (corpus indico). La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal. La innovacion principal es de ingenieria: comprimir un sistema de transliteracion contextual en menos de 5 MB y hacerlo viable en el navegador.

## Capacidades

- Transliteracion de hindi romanizado a devanagari a nivel de palabra y de frase, preservando el contexto.
- Reranking de candidatos mediante un diccionario de 1,5 millones de palabras y un modelo de lenguaje de frases.
- Ejecucion integramente on-device en el navegador (Web Worker), sin servidor ni GPU, con funcionamiento offline tras la primera carga.
- Procesamiento de grafias informales de estilo chat (por ejemplo, "h", "nhi", "bht"), con mejor cobertura en la version v2.
- Soporte de entrada y salida en hindi e ingles como scripts implicados en la tarea.
- No realiza traduccion: cambia el script, no el idioma del contenido.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Teclados e input methods para hindi en navegador: el modelo se integra en un teclado web que convierte en tiempo real lo que el usuario escribe en letras latinas a devanagari, con latencia mediana de 219,7 ms por palabra (p50) segun la model card.
- Aplicaciones web offline para comunidades hispanohablantes de hindi: al ejecutarse en un Web Worker y cachear el diccionario, permite escribir hindi nativo en entornos sin conexion o con conectividad intermitente.
- Normalizacion de texto para pipelines de NLP: convierte corpus de hindi romanizado (redes sociales, chats, formularios) a devanagari antes de pasarlos a modelos de analisis o traduccion, reduciendo la variabilidad de script.
- Digitalizacion de mensajes y chats: transcribe conversaciones informales escritas en transliteracion a escritura nativa para archivo, busqueda o publicacion.
- Educacion y aprendizaje del devanagari: ayuda a estudiantes a ver la forma correcta de una palabra hindi a partir de su escritura romanizada, con soporte de top-3 y top-8 candidatos (87,66 % y 92,79 % en Aksharantar).
- Prototipado y demos de bajo coste: al ocupar 4,53 MB y no requerir infraestructura, sirve para validar productos de transcripcion o interfaces en hindi sin coste de servidor.
- Preprocesado en sistemas de atencion al cliente: normaliza entradas de usuarios que escriben en hindi romanizado antes de enviarlas a un chatbot o a un sistema de tickets.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Transliteracion palabra (romanizado a devanagari) | Aksharantar (Hindi, test) | Top-1 accuracy | 70,37 % |
| Transliteracion palabra (romanizado a devanagari) | Aksharantar (Hindi, test) | Top-3 accuracy | 87,66 % |
| Transliteracion palabra (romanizado a devanagari) | Aksharantar (Hindi, test) | Top-8 accuracy | 92,79 % |
| Transliteracion frase (romanizado a devanagari) | Dakshina (Hindi, test) | Word accuracy | 87,55 % |
| Transliteracion frase (romanizado a devanagari) | Dakshina (Hindi, test) | Sentence exact match | 21,66 % |
| Transliteracion frase (romanizado a devanagari) | Dakshina (Hindi, test) | CER | 4,81 % |

La model card indica ademas una latencia en navegador de 219,7 ms por palabra (p50) y compara el top-1 en Aksharantar con IndicXlit: 70,37 % frente a 59,16 % del modelo y 69,33 % del paquete completo con diccionario de rescoring, con intervalos de confianza del 95 % solapados respecto a este ultimo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo esta disenado para ejecutarse en CPU dentro del navegador, sin GPU.
- GPU recomendadas: ninguna; no requiere acelerador hardware.
- Cabe en GPU consumer: si, aunque no es necesario; el modelo corre en el propio navegador del usuario.
- Opciones de despliegue: runtime JavaScript propio con Web Worker; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 219,7 ms por palabra (p50) en navegador segun el autor; el throughput no esta documentado.
- Huella de almacenamiento: 0,57 MB de nucleo, 3,97 MB de paquete de diccionario, 4,53 MB comprimido y 8,69 MB en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Top-1 Aksharantar | Licencia | Despliegue |
|---|---|---|---|---|---|
| AksharaLP-1M | 989K | No disponible | 70,37 % | Apache 2.0 | Navegador / on-device |
| IndicXlit (modelo) | No disponible | No disponible | 59,16 % | No disponible en la informacion | Servidor / libreria |
| IndicXlit con diccionario de rescoring | No disponible | No disponible | 69,33 % | No disponible en la informacion | Servidor / libreria |
| AksharaLP-1M-v2 | 989K (nucleo) | No disponible | 70,04 % | Apache 2.0 | Navegador / on-device |

La comparativa se limita a los datos aportados por la model card; no se dispone de informacion sobre el tamano exacto, el contexto ni la licencia de IndicXlit en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de traduccion: solo cambia el script; no convierte hindi en ingles ni viceversa.
- El sentence exact match en Dakshina es bajo (21,66 %), por lo que la salida a nivel de frase puede diferir de la referencia aunque la precision por palabra sea alta.
- Los resultados de benchmarks son declarados por el autor y no estan verificados de forma independiente.
- La version v1 tiene un rendimiento inferior a v2 en grafias de estilo chat (80,16 % frente a 91,54 % de precision por palabra en 480 frases retenidas); el autor recomienda v2 salvo que prime el menor tamano de descarga.
- El diccionario de v1 (1,5 millones de palabras) es menor que el de v2 (3 millones), lo que reduce la cobertura de vocabulario y la correccion de candidatos.
- Riesgo de sesgo y alucinacion: no documentado en la informacion disponible; al ser un sistema de transliteracion con diccionario, el riesgo principal es la eleccion incorrecta de candidatos, no la generacion libre de contenido.
- Cobertura limitada a hindi e ingles; no se documenta soporte para otras lenguas indicas.
- La licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones de los datasets de entrenamiento (Aksharantar, IndicCorpV2, Dakshina) para produccion.
- No se documentan limitaciones de contexto ni de longitud de entrada; el repositorio no incluye pesos en formatos estandar como safetensors o GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sourojitdotcom/AksharaLP-1M
- Version recomendada v2: https://huggingface.co/sourojitdotcom/AksharaLP-1M-v2
- Demo en vivo (v1): https://huggingface.co/spaces/sourojitdotcom/AksharaLP-demo
- Demo en vivo (v2): https://huggingface.co/spaces/sourojitdotcom/AksharaLP-v2-demo
- Dataset Aksharantar: https://huggingface.co/datasets/ai4bharat/Aksharantar
- Dataset IndicCorpV2: https://huggingface.co/datasets/ai4bharat/IndicCorpV2
- Dataset Dakshina: https://huggingface.co/datasets/google/dakshina
- Fuente de la cifra de hablantes (Ethnologue 200): https://www.ethnologue.com/insights/ethnologue200/
