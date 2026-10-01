# ssingh20062000/security-copilot-qwen2.5-3b-GGUF

## Resumen

Security Co-pilot (security-copilot-qwen2.5-3b) es un modelo de 3.085.938.688 parametros (aproximadamente 3,09B) especializado en clasificar contenido potencialmente malicioso. Concretamente, recibe como entrada un correo electronico, una URL, un mensaje SMS o la transcripcion de una llamada, y devuelve una etiqueta entre cuatro posibles: `PHISHING`, `SCAM`, `SPAM` o `SAFE`. Lo desarrolla el usuario ssingh20062000 y se distribuye como derivado de Qwen2.5-3B-Instruct.

La ficha que nos ocupa corresponde a la version cuantizada en formato GGUF, pensada para ejecucion en local mediante llama.cpp y compatible con el ecosistema de inferencia ligera (llama.cpp, wllama en navegador, endpoints tipo FriendliAI). La cuantizacion publicada es Q4_K_M, con un peso de 1,93 GB, lo que la hace viable en hardware de consumo e incluso dentro de un navegador web.

Es relevante porque demuestra un patron habitual y util: adaptar un modelo denso pequeno y generico (Qwen2.5-3B) a una tarea de clasificacion de seguridad muy concreta, y luego publicarlo en GGUF para despliegues edge u on-premise. El autor reporta una precision del 95,5% del modelo a precision completa sobre 400 ejemplos de validacion, aunque los datos de entrenamiento y el detalle del ajuste no se documentan en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-3B-Instruct, modelo denso) |
| Parametros totales | 3.085.938.688 (3,09B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; la base Qwen2.5-3B-Instruct soporta 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (publicada); otras cuantizaciones no disponibles |
| Idiomas soportados | en (ingles) |
| Licencia | qwen-research (Qwen Research License, restringe el uso comercial) |
| Formato de pesos | GGUF (llama.cpp); carpeta `browser/` con el modelo troceado en bloques de maximo 512 MB para wllama |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. Segun el informe tecnico de Qwen2.5 (arXiv 2412.15115), esta familia se preentreno sobre un corpus de hasta 18 billones de tokens (18T), ampliando los 7T de la generacion anterior, y combina variantes base e instruct en tamanos de 0,5B, 1,5B, 3B, 7B, 14B, 32B y 72B. Sobre esa base, el autor ha realizado un ajuste especifico para la tarea de clasificacion de seguridad, aunque la model card no documenta el numero de tokens de ajuste, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La contribucion de esta ficha concreta es la cuantizacion a GGUF. Se publica una unica variante Q4_K_M de 1,93 GB y, ademas, una copia troceada en la carpeta `browser/` para su ejecucion directa en navegador a traves de wllama. El flujo de uso documentado pasa por `llama-server` con la plantilla Jinja (`--jinja`), un prompt de sistema definido en `prompt_config.json` y temperatura 0, devolviendo el veredicto en una linea con el formato `Verdict: ETIQUETA`. No se describen innovaciones arquitectonicas propias mas alla del ajuste fino y la cuantizacion.

## Capacidades

- Clasificacion de seguridad en cuatro categorias: `PHISHING`, `SCAM`, `SPAM` y `SAFE`.
- Procesamiento de multiples fuentes de texto: correos electronicos, URLs, mensajes SMS y transcripciones de llamadas.
- Salida estructurada y predecible: genera una linea del tipo `Verdict: PHISHING`, apta para consumo programatico.
- Uso conversacional (el repositorio incluye la etiqueta `conversational`).
- Formato de pesos GGUF optimizado para llama.cpp: inferencia en CPU, GPU y navegador.
- Soporte de plantilla de chat Jinja para integrarse con llama-server y APIs compatibles con OpenAI.
- Idiomas: unicamente ingles.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible (el modelo es exclusivamente de texto).

## Casos de uso

- Filtrado de correo corporativo: el modelo puede clasificar cada mensaje entrante como phishing, scam, spam o seguro antes de entregarlo al buzon, actuando como primera capa de defensa en la puerta de entrada del correo.
- Deteccion de smishing en pasarelas SMS: integrado en un gateway de mensajeria, analiza el cuerpo del SMS y marca enlaces o remitentes sospechosos, con la ventaja de ejecutarse en local sin enviar contenido sensible a terceros.
- Analisis de URLs en tiempo real: dado el caracter de modelo pequeno y rapido, puede prefiltrar URLs sospechosas en un proxy o en una extension de navegador antes de recurrir a un motor de reputacion mas costoso.
- Deteccion de vishing en centros de llamadas: procesa transcripciones de llamadas para identificar intentos de estafa, util en contact centers que quieran monitorizar conversaciones en busca de fraude.
- Asistente de seguridad en el navegador: gracias a la carpeta `browser/` troceada en bloques de 512 MB y a wllama, puede ejecutarse del lado del cliente para advertir al usuario sobre enlaces o mensajes sin enviar datos a un servidor.
- Despliegue on-premise en entornos regulados: al ser un modelo de 1,93 GB en Q4_K_M y ejecutable con llama.cpp en CPU, encaja en organizaciones que no pueden sacar datos de su infraestructura.
- Pre-filtro para un SOC: usar el modelo como clasificador rapido que descarte falso ruido y derive solo los casos dudosos a analistas humanos o a modelos mayores.
- Prototipado y demos: su tamano reducido permite iterar rapidamente en pruebas de concepto de deteccion de fraude sin depender de GPUs de gama alta.

## Benchmarks y rendimiento

En la informacion disponible solo se reporta una verificacion de precision propia de la tarea, no benchmarks estandar (MMLU, HumanEval, GSM8K, etc.).

| Metrica | Valor | Contexto |
|---|---|---|
| Precision (modelo a precision completa) | 95,5% | 400 ejemplos de validacion |
| Precision (Q4_K_M) | 100,0% | 40 ejemplos de validacion, ejecutado con llama.cpp |

El propio autor advierte que la comparacion entre ambas cifras no es concluyente: con una muestra de 40 ejemplos, unas pocas decimas de diferencia entran dentro del ruido. No se publican resultados frente a modelos comparables ni evaluaciones en conjuntos de datos publicos de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB para los pesos Q4_K_M (1,93 GB) mas la cache KV, dependiendo de la longitud de contexto configurada.
- Tamano total del repositorio: 3,9 GB (incluye la cuantizacion y los fragmentos para navegador).
- GPU recomendadas: cualquier GPU de consumo con 4 GB o mas de VRAM, como una RTX 3050, RTX 3060 o superiores; tambien es viable en CPU.
- Cabe en GPU de consumo: si, con holgura, en practicamente cualquier GPU moderna con 4-6 GB de VRAM.
- Ejecucion en CPU: viable con llama.cpp gracias al formato GGUF y a los 3,09B de parametros.
- Ejecucion en navegador: soportada mediante wllama con los fragmentos de la carpeta `browser/`.
- Opciones de despliegue: llama.cpp / llama-server (`llama-server -hf ssingh20062000/security-copilot-qwen2.5-3b-GGUF:Q4_K_M --jinja`), wllama, y endpoints gestionados como FriendliAI. Ollama y TGI no se mencionan explicitamente en la informacion disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks comparativos en la informacion proporcionada. A continuacion se comparan los datos objetivos conocidos frente al modelo base.

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| security-copilot-qwen2.5-3b-GGUF | 3,09B | no disponible (base 32.768) | Clasificacion de seguridad (phishing/scam/spam/safe) | qwen-research | GGUF (Q4_K_M) |
| ssingh20062000/security-copilot-qwen2.5-3b (base del ajuste) | 3,09B | no disponible | Clasificacion de seguridad | qwen-research | safetensors (full precision) |
| Qwen/Qwen2.5-3B-Instruct | 3,09B | 32.768 tokens | Generacion de texto general e instrucciones | qwen-research | safetensors |

Comparativas con otros modelos de clasificacion de seguridad de la misma categoria: no disponible.

## Limitaciones y advertencias

- Licencia restrictiva: se distribuye bajo Qwen Research License, que restringe el uso comercial. Hay que leer la licencia antes de plantear cualquier despliegue en produccion con fines de lucro.
- Idioma unico: solo soporta ingles, por lo que no es adecuado para contenido en castellano u otros idiomas.
- Riesgo de alucinacion: aunque la tarea es de clasificacion cerrada, el modelo es generativo y podria producir veredictos o formatos de salida inesperados; se recomienda temperatura 0 y parseo estricto de la respuesta.
- Muestra de validacion reducida: la precision del 100% en Q4_K_M se midio sobre solo 40 ejemplos, una cifra insuficiente para garantizar generalizacion; la referencia mas solida es el 95,5% sobre 400 ejemplos del modelo a precision completa.
- Dataset de ajuste no documentado: se desconoce la composicion de los datos de entrenamiento, lo que impide evaluar sesgos sistematicos hacia determinados remitentes, dominios o estilos de redaccion.
- Sin benchmarks estandar: no hay resultados publicados en MMLU, HumanEval, GSM8K ni en conjuntos de referencia de deteccion de phishing, lo que dificulta la comparacion objetiva.
- Uso como unica defensa: un clasificador de 3B no deberia ser el unico mecanismo de proteccion; conviene combinarlo con listas de reputacion, reglas y supervision humana.
- Fecha de publicacion en el repositorio: la model card indica creacion y actualizacion en octubre de 2026, dato que conviene verificar segun el contexto de uso.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/ssingh20062000/security-copilot-qwen2.5-3b-GGUF
- Modelo base (precision completa): https://huggingface.co/ssingh20062000/security-copilot-qwen2.5-3b
- Endpoint en FriendliAI: https://friendli.ai/models/ssingh20062000/security-copilot-qwen2.5-3b
- Qwen2.5-3B en HuggingFace: https://huggingface.co/Qwen/Qwen2.5-3B
- Informe tecnico de Qwen2.5 (arXiv:2412.15115): https://arxiv.org/abs/2412.15115
- Repositorio GitHub de Qwen2.5: https://github.com/mx4ai/qwen2.5
- wllama (ejecucion en navegador): https://github.com/ngxson/wllama
