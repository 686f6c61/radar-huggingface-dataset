# yasakani-dev/Qwen3.8-27B-YASAKANI-quality

## Resumen

Qwen3.8-27B-YASAKANI-quality es una conversión cuantizada del modelo Qwen3.8-27B (27 000 millones de parámetros, desarrollado por el equipo Qwen de Alibaba Cloud) realizada por yasakani-dev para su motor de inferencia local YASAKANI, orientado a Windows 11 con una única GPU NVIDIA RTX 5090. El repositorio no contiene pesos en formatos estándar (safetensors, GGUF), sino archivos propietarios en el formato `.yskn` que solo puede cargar el motor YASAKANI; ni transformers, ni llama.cpp, ni vLLM, ni SGLang son compatibles con ellos.

El modelo comprime los pesos originales en BF16 (53,8 GB) hasta 12,37 GB, lo que supone una reducción de aproximadamente el 77 % del tamaño. Según la model card, la predicción del siguiente token coincide con la del modelo original en el 95,24 % de las posiciones sobre un conjunto de 20 transcripciones de razonamiento (20 460 posiciones, caché KV en FP16, medidas del 8 de noviembre de 2026), con una divergencia KL de 0,0122. Se distribuye bajo licencia Apache 2.0 y está pensado para uso conversacional y de generación de texto en local.

La relevancia de esta ficha es doble: por un lado, documenta una de las pocas conversiones publicadas de Qwen3.8-27B para hardware de consumo de gama alta (RTX 5090, 32 GB de VRAM); por otro, ilustra un caso de empaquetado propietario que limita fuertemente la portabilidad y la reproducibilidad respecto a los formatos abiertos habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; la model card no detalla la arquitectura interna) |
| Parametros totales | 27 000 millones (modelo base Qwen3.8-27B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | conversion propietaria a formato `.yskn` (12,37 GB); no se especifica el esquema numerico exacto |
| Idiomas soportados | no disponible (la model card incluye texto en japones e ingles, pero no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.yskn` propietario de YASAKANI (no compatible con safetensors, GGUF, etc.); incluye draft model `bdraft2_k8.yskn` y cache KV comprimida `kvq_u5.bin` |

## Arquitectura y entrenamiento

El modelo es una conversion del Qwen3.8-27B original de Alibaba Cloud, no un entrenamiento nuevo. La model card no describe la arquitectura del modelo base (transformer denso o MoE, tipo de atencion, datos de entrenamiento, uso de RLHF/DPO), por lo que esos datos deben consultarse en la ficha oficial de Qwen/Qwen3.8-27B. Lo que si documenta el autor es el proceso de compresion: los pesos BF16 originales (53,8 GB) se convierten al formato `.yskn` y se comprimen hasta 12,37 GB, con una perdida de fidelidad medida en terminos de coincidencia del siguiente token (95,24 %) y divergencia KL (0,0122) frente al modelo original.

La innovacion tecnica destacable es el uso de decodificacion especulativa mediante un draft model derivado de DFlash 2 de z-lab (`bdraft2_k8.yskn` y `bdraft2_k8.shead`), junto con una cache KV comprimida configurada por `kvq_u5.bin`. El repositorio incluye ademas los archivos originales del modelo base sin modificar (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `config.json`, `generation_config.json`), lo que permite inspeccionar la configuracion de tokenizacion y plantilla de chat del modelo original. No se publican datos sobre el dataset de entrenamiento, el numero de tokens vistos ni las tecnicas de alineacion empleadas.

## Capacidades

- Generacion de texto y conversacion multi-turno, segun el pipeline declarado (`text-generation`) y la plantilla de chat incluida.
- Razonamiento en modo thinking: las metricas de fidelidad se midieron sobre transcripciones de razonamiento, lo que sugiere soporte de cadenas de pensamiento, aunque la model card no lo declara explicitamente como funcionalidad.
- Generacion de codigo y matematicas: no confirmado en la informacion disponible; depende de las capacidades del modelo base Qwen3.8-27B.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no se declara lista de idiomas; la model card esta redactada en ingles y japones.
- Capacidades de vision o audio: no disponibles; el pipeline es exclusivamente de texto.
- Decodificacion especulativa integrada mediante draft model propio, que acelera la generacion respecto a la decodificacion autoregresiva estandar.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo Windows: el modelo esta disenado para ejecutarse en una RTX 5090 con 12,37 GB de pesos, lo que permite mantener conversaciones multi-turno sin conexion a servicios en la nube y con la plantilla de chat original de Qwen.
- Razonamiento asistido en entornos con requisitos de privacidad: al ejecutarse en local y no requerir envio de datos a terceros, es adecuado para analisis de documentos internos o borradores tecnicos donde no se permite salida de datos.
- Prototipado rapido de aplicaciones de generacion de texto: la integracion con el CLI de YASAKANI (`yasakani chat`, `yasakani verify`, `yasakani selfcheck`) permite validar el modelo y arrancar un chat en pocos comandos sobre Windows.
- Evaluacion de tecnicas de cuantizacion y decodificacion especulativa: el repositorio publica metricas de fidelidad (coincidencia del siguiente token, divergencia KL) y un draft model separado, lo que lo convierte en un banco de pruebas para estudiar el impacto de la compresion en la calidad de generacion.
- Despliegue en hardware de consumo de gama alta: con 12,37 GB de pesos y una cache KV comprimida, el modelo cabe holgadamente en los 32 GB de VRAM de una RTX 5090, dejando margen para contexto adicional y para el draft model.
- Generacion de texto en japones e ingles: la model card y el ecosistema del autor estan orientados a estos idiomas, por lo que es una opcion razonable para aplicaciones bilingues en esos mercados, siempre que se valide la calidad con datos propios.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). Solo se incluyen metricas de fidelidad frente al modelo original BF16, medidas sobre 20 transcripciones de razonamiento (20 460 posiciones, cache KV en FP16, 8 de noviembre de 2026):

| Metrica | Quality (este repo) | Speed (repo hermano) |
|---|---|---|
| Coincidencia del siguiente token mas probable con el original | 95,24 % | 93,01 % |
| Divergencia KL respecto al original (menor es mejor) | 0,0122 | 0,0304 |
| Tamano del archivo principal | 12,37 GB | 10,31 GB |

El autor advierte que estas cifras no son precision de tarea y que solo cubren texto de razonamiento. En texto web general, una evaluacion adicional mostro una divergencia KL entre un 3 % y un 10 % mayor que una conversion anterior del mismo tamano, lo que indica que la fidelidad no se traslada a todos los tipos de texto. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 12,37 GB; con cache KV comprimida y el draft model, el consumo total debe situarse por debajo de los 32 GB de una RTX 5090, aunque la model card no publica la cifra exacta de VRAM en ejecucion.
- GPU recomendadas: NVIDIA RTX 5090 (unica GPU soportada oficialmente segun la model card y los tags `windows`, `rtx-5090`). No se mencionan A100, H100 ni otras GPU.
- Cabe en GPU de consumo: si, en RTX 5090. No se garantiza compatibilidad con GPU de menor VRAM.
- Sistema operativo: Windows 11, Python 3.10 o superior.
- Opciones de despliegue: exclusivamente el motor YASAKANI (CLI `yasakani chat`, `yasakani verify`, `yasakani selfcheck`). No es compatible con vLLM, llama.cpp, Ollama, TGI ni transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor remite a la pagina de GitHub para las mediciones de velocidad y sus condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-YASAKANI-quality (este) | 27 000 M | no disponible | `.yskn` propietario | Apache 2.0 | Hugging Face, solo motor YASAKANI |
| Qwen3.8-27B-YASAKANI-speed | 27 000 M | no disponible | `.yskn` propietario (10,31 GB) | Apache 2.0 | Hugging Face, solo motor YASAKANI |
| Qwen/Qwen3.8-27B (original) | 27 000 M | no disponible | safetensors BF16 (53,8 GB) | Apache 2.0 | Hugging Face, compatible con transformers, vLLM, etc. |
| z-lab/Qwen3.8-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Hugging Face (draft model para decodificacion especulativa) |

La comparativa con modelos de otros fabricantes no esta disponible en la informacion proporcionada. Frente al modelo original, la version YASAKANI reduce el tamano un 77 % a costa de una perdida de fidelidad medible y de perder la portabilidad entre motores de inferencia.

## Limitaciones y advertencias

- No es el modelo original: los pesos estan comprimidos de 53,8 GB a 12,37 GB, con una coincidencia del siguiente token del 95,24 % sobre texto de razonamiento; la fidelidad en otros dominios puede ser menor (divergencia KL entre un 3 % y un 10 % mayor en texto web general).
- Formato propietario: los archivos `.yskn` solo los carga el motor YASAKANI. Esto impide usar herramientas estandar del ecosistema (transformers, llama.cpp, vLLM, SGLang) y limita la reproducibilidad y la integracion en pipelines existentes.
- Dependencia de plataforma: requiere Windows 11, Python 3.10 o superior y una RTX 5090; no se documenta soporte para Linux ni para otras GPU.
- Sesgos conocidos: no disponibles en la informacion proporcionada; dependen del modelo base Qwen3.8-27B.
- Riesgo de alucinacion: no cuantificado en la model card; aplicable el riesgo habitual de los modelos generativos de este tamano.
- Limitaciones de contexto e idioma: la longitud de contexto no se declara y no se publica lista de idiomas soportados; la documentacion esta orientada a ingles y japones.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo deriva de Qwen3.8-27B (Alibaba Cloud) y de DFlash 2 (z-lab / Inco AI); debe conservarse el archivo `NOTICE` con la atribucion correspondiente.
- Sin aval oficial: el repositorio no es una release oficial de Qwen, Alibaba Cloud, z-lab ni Inco AI, y ninguna de estas entidades lo respalda.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-quality
- Repositorio hermano (modelo rapido): https://huggingface.co/yasakani-dev/Qwen3.8-27B-YASAKANI-speed
- Motor YASAKANI (GitHub): https://github.com/yasakani-dev/yasakani
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Draft model DFlash 2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
