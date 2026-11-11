# UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.7e

## Resumen

Uraion Cyber V1.0 MLX oQ2.7e es una cuantizacion de 2,7 bits efectivos del modelo Uraion Cyber V1.0, desarrollado por Uraion Labs, empaquetada en formato MLX safetensors para su ejecucion en Apple Silicon mediante el runtime oMLX 0.7.4.dev1 (o cualquier runtime mlx-vlm compatible). El modelo base es un transformer de mezcla de expertos (MoE) de tipo Qwen3.5 MoE con 35.951.822.704 parametros totales y aproximadamente 3.000 millones de parametros activos por token, repartidos en 256 expertos con 8 enrutados por token. Su proposito es el trabajo de seguridad defensiva y tareas agenticas: detectar vulnerabilidades, demostrarlas en un entorno controlado, generar parches y reconocer codigo correcto cuando no existe fallo.

La relevancia de esta publicacion es doble. Por un lado, traslada un modelo especializado en ciberseguridad defensiva a hardware de consumo de Apple con un peso de solo 15,56 GB, lo que permite ejecucion local en equipos con memoria unificada de gama alta. Por otro, conserva el tokenizador, la plantilla de chat, la torre de vision y los pesos MTP del checkpoint original, de modo que el comportamiento conversacional y multimodal se mantiene respecto al modelo padre en BF16.

Conviene subrayar que las cifras de evaluacion publicadas corresponden al modelo padre servido con vLLM, no a esta cuantizacion. El autor advierte explicitamente de que los niveles de 2 y 3 bits intercambian calidad por menor huella de memoria, por lo que el rendimiento real de esta build debe validarse en el caso de uso concreto antes de llevarla a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Qwen3.5 MoE, tag `qwen3_5_moe`), 256 expertos, 8 enrutados por token |
| Parametros totales | 35.951.822.704 |
| Parametros activos | ~3.000 millones por token (35B-A3B) |
| Longitud de contexto | 262.144 tokens (limite arquitectonico) |
| Tipos de cuantizacion | oQ2.7e (2,7 bits efectivos, precision mixta con imatrix mejorada de oMLX); el autor menciona tambien oQ4e, oQ5e, oQ6e y oQ8e en otros builds |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (pesos de 15,56 GB; repo de 15,6 GB) |
| Runtime | MLX / oMLX 0.7.4.dev1 o mlx-vlm compatible con Qwen3.5 MoE |
| Modalidad | image-text-to-text (torre de vision conservada) |
| Modelo base | UraionLabs/Uraion-Cyber-V1.0 (relacion: quantized) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos sobre un backbone transformer de la familia Qwen3.5, con 256 expertos y 8 activos por token, lo que da un total cercano a 36.000 millones de parametros con unos 3.000 millones activos por paso de inferencia. Esta relacion entre parametros totales y activos es la que permite que una cuantizacion de 2,7 bits ocupe solo 15,56 GB y siga siendo ejecutable en memoria unificada de Apple Silicon. Se conservan los pesos MTP (multi-token prediction) si estaban presentes en el checkpoint de origen, lo que habilita decodificacion especulativa en runtimes que la soporten.

La informacion disponible no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron fases de RLHF o DPO. El autor remite a la model card del modelo padre en BF16 para la metodologia de evaluacion completa, los resultados en tareas de seguridad reservadas, los limites y la documentacion de seguridad. La innovacion tecnica destacable de esta publicacion concreta es el proceso de cuantizacion: oMLX aplica una matriz de importancia mejorada (imatrix) con precision mixta por capas en lugar de un ancho de bits fraccionario uniforme, y publica artefactos de validacion (`quantization_info.json`, `oq_imatrix_report.json`, `smoke_test.json`, `SHA256SUMS`) que permiten verificar la integridad y el perfil de cuantizacion.

## Capacidades

- Generacion de texto y razonamiento con modo de pensamiento (thinking) activable o desactivable mediante `chat_template_kwargs.enable_thinking`.
- Analisis de codigo y auditoria de seguridad: deteccion de vulnerabilidades explotables, identificacion de la funcion afectada y construccion de la peticion que demuestra el fallo.
- Generacion de parches y correcciones sobre el codigo auditado.
- Reconocimiento de codigo correcto: el modelo esta entrenado para declarar que no hay fallo cuando el codigo es solido, una capacidad poco habitual y medida de forma explicita en la evaluacion del modelo padre.
- Tool calling y function calling (etiquetas `tool-calling`, `function-calling`; evaluado con BFCL en el modelo padre).
- Comportamiento agentico multi-paso, con episodios de agente evaluados en el modelo padre.
- Capacidades multimodales de imagen y texto (pipeline `image-text-to-text`, torre de vision conservada), utiles para revisar capturas, diagramas o interfaces.
- Conversacion multi-turno.
- Soporte unicamente de ingles.

## Casos de uso

- Auditoria de codigo en local: el modelo recibe el contenido de un fichero o servicio y devuelve si existe un fallo explotable, la funcion afectada y una peticion de prueba. Al ejecutarse en Apple Silicon con 15,56 GB de pesos, el codigo sensible no sale del equipo, lo que encaja con politicas de confidencialidad estrictas.
- Triaje de hallazgos de SAST: dado el volumen de alertas de un analizador estatico, el modelo puede descartar falsos positivos y confirmar cuales son explotables, reduciendo el trabajo manual del equipo de AppSec.
- Generacion de parches en un flujo de CI: integrado mediante la API compatible con OpenAI que expone oMLX, el modelo puede recibir el diff de una pull request y proponer una correccion, que el pipeline valida despues con tests.
- Agente de respuesta a incidentes: con tool calling y razonamiento multi-paso, el modelo puede encadenar consultas a registros, repositorios y sandbox para reconstruir una cadena de explotacion en un entorno controlado.
- Revision de configuraciones y infraestructura como codigo: analisis de manifiestos, politicas y ficheros de despliegue para detectar exposiciones y permisos excesivos.
- Formacion y concienciacion: generacion de ejercicios de codigo vulnerable y de su version corregida, con explicacion del fallo, en un entorno local sin dependencia de servicios externos.
- Asistente de desarrollo con capacidades de vision: revision de diagramas de arquitectura o capturas de paneles de monitorizacion junto al codigo asociado, aprovechando la torre de vision conservada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks medidos sobre esta cuantizacion MLX. La model card incluye cifras del modelo padre en BF16 servido con vLLM 0.33.0 (cuantizacion FP8 de pesos en carga), que se reproducen a continuacion como referencia y no como rendimiento de esta build.

| Prueba (modelo padre en vLLM) | Uraion Cyber V1.0 (padre) | Qwen3.6-35B-A3B | Uraion Cyber preview |
|---|---:|---:|---:|
| Tareas de seguridad reservadas, respuesta unica (758) | 681 (89,8 %) | 603 (79,6 %) | 610 (80,5 %) |
| Tareas de seguridad de confirmacion nuevas (387) | 352 (91,0 %) | 309 (79,8 %) | no disponible |
| Episodios de agente reservados (200) | 190 (95,0 %) | 175 (87,5 %) | 164 (83,2 %) |
| Episodios de agente nuevos (200) | 191 (95,5 %) | 172 (86,0 %) | no disponible |
| Codigo correcto reportado como correcto (122) | 92 (75,4 %) | 55 (45,1 %) | 59 (48,4 %) |
| IFEval prompt estricto (541) | 425 (78,6 %) | 390 (72,1 %) | 441 (81,5 %) |
| BFCL (400) | 368 (92,0 %) | 364 (91,0 %) | 358 (89,5 %) |
| HumanEval+ (164) | 149 (90,9 %) | 148 (90,2 %) | 148 (90,2 %) |
| Peticiones daninas rechazadas (30) | 30 | 30 | 30 |

## Requisitos de hardware

- VRAM o memoria unificada: los pesos ocupan 15,56 GB; hay que sumar memoria para el runtime, las activaciones y la cache KV. El autor no publica una cifra cerrada de memoria total necesaria.
- Contexto: 262.144 tokens es el limite arquitectonico, no una garantia de memoria; el contexto util depende de la memoria disponible y de la configuracion del runtime.
- Hardware objetivo: Apple Silicon con Metal. No hay soporte CUDA declarado para esta build.
- Equipos de consumo: encaja en Mac con memoria unificada de 32 GB o superior; con 24 GB el margen para contexto y cache KV sera muy limitado. Con 64 GB o mas se puede aspirar a ventanas de contexto amplias.
- Despliegue: `omlx serve ./Uraion-Cyber-V1.0-MLX-oQ2.7e --port 8000`, que expone una API compatible con OpenAI; tambien es posible usar un runtime mlx-vlm compatible con Qwen3.5 MoE. El panel de oMLX permite cargar el directorio descargado desde la carpeta de modelos configurada.
- Descarga: `hf download UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.7e --local-dir ./Uraion-Cyber-V1.0-MLX-oQ2.7e`.
- Parametros de muestreo sugeridos por el autor: `temperature=1.0`, `top_p=0.95`, `top_k=20`, `max_tokens=16384`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 MLX oQ2.7e (este) | 35,95 B totales, ~3 B activos | 262.144 | MIT | MLX safetensors, oMLX / mlx-vlm, Apple Silicon | Cuantizacion de 2,7 bits; 15,56 GB de pesos; sin benchmarks propios publicados |
| Uraion Cyber V1.0 (padre) | 35,95 B totales, ~3 B activos | 262.144 | MIT | BF16, servido con vLLM | Referencia de calidad; cifras de evaluacion disponibles |
| Qwen3.6-35B-A3B | 35 B clase A3B | no disponible | no disponible | no disponible | Base de comparacion usada por el autor; 79,6 % en tareas de seguridad reservadas frente al 89,8 % del padre |
| Uraion Cyber preview | no disponible | no disponible | no disponible | no disponible | Version preliminar del mismo proyecto; 80,5 % en tareas de seguridad reservadas |

## Limitaciones y advertencias

- Las cifras de benchmarks publicadas corresponden al modelo padre en BF16 con vLLM, no a esta cuantizacion de 2,7 bits. El propio autor advierte de que los niveles de 2 y 3 bits degradan la calidad a cambio de menor huella de memoria; hay que revalidar en el caso de uso concreto.
- Modelo especializado en seguridad defensiva: no debe emplearse como asistente generalista sin evaluar antes su comportamiento fuera del dominio.
- Riesgo de alucinacion en la identificacion de vulnerabilidades: un falso positivo puede generar trabajo innecesario y un falso negativo puede dejar pasar un fallo real. El modelo debe usarse como apoyo a la revision humana, no como sustituto.
- Solo soporta ingles; el rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera degradado.
- El contexto maximo de 262.144 tokens es un limite arquitectonico y no una garantia de memoria; en equipos con 32 GB habra que reducirlo de forma considerable.
- Dependencia de Apple Silicon y del ecosistema MLX: no hay ruta de despliegue CUDA documentada para esta build, lo que limita su uso en servidores con GPU NVIDIA.
- Requiere una version actualizada de oMLX o un runtime mlx-vlm con soporte de Qwen3.5 MoE; versiones antiguas pueden fallar al cargar los pesos.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar el fichero LICENSE del repositorio y la atribucion exigida al modelo padre.
- El repositorio registra cero descargas y cero likes en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.
- No se detalla la composicion del dataset de entrenamiento ni los filtros de seguridad aplicados, mas alla de la prueba de rechazo de 30 peticiones daninas del modelo padre.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.7e
- Modelo padre en BF16: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0-MLX-oQ2.7e/blob/main/LICENSE
- Informe de cuantizacion imatrix: `oq_imatrix_report.json` en el repositorio
- Informacion de cuantizacion: `quantization_info.json` en el repositorio
- Prueba de humo: `smoke_test.json` en el repositorio
- Sumas de verificacion: `SHA256SUMS` en el repositorio
- Sitio del autor: https://uraionlabs.com/
