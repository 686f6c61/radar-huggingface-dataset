# wepiqx/SenseNova-Loop-9B-Preview-MERNIK-GGUF

## Resumen

SenseNova-Loop-9B-Preview es un modelo de lenguaje de aproximadamente 9.000 millones de parametros desarrollado por SenseNova (el brazo de IA de SenseTime) sobre una arquitectura propia denominada `sensenova_loop`, que combina un decodificador con bucles de computacion recurrentes y enrutamiento residual mHC (multi-head routing). Esta ficha describe la cuantizacion GGUF publicada por el usuario wepiqx bajo el nombre MERNIK 5300 SSM-F32, una version de solo texto orientada a inferencia local con llama.cpp.

La relevancia de esta publicacion concreta no esta en el modelo base, sino en el proceso de cuantizacion: el autor demuestra que las compuertas SSM (`ssm_alpha` y `ssm_beta`) de las 24 capas SSM deben mantenerse en F32 para evitar una degeneracion severa en forma de bucles repetitivos. Un recetario generico Q4_K_M las degrada a Q4_K y arruina la calidad del modelo, por lo que esta build fija explicitamente las 48 compuertas en F32 y emplea un predictor de importancia (Gnom v5) para repartir el presupuesto de bytes de forma no uniforme entre tensores.

El resultado es un fichero de 5310 MiB a 4,84 bits por peso que incluye la cabeza MTP (multi-token prediction) pero no la torre de vision. Requiere un fork parcheado de llama.cpp con soporte para la arquitectura `sensenova_loop`; las builds estandar fallan con el error `unknown model architecture`. La licencia es Apache 2.0 y los idiomas declarados son ingles y chino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `sensenova_loop` (decodificador con bucles + enrutamiento residual mHC + 24 capas SSM) |
| Parametros totales | ~9B (modelo base); el campo de parametros del repo GGUF no es representativo de la build |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla Q4_K (198 tensores), Q5_K (7), Q6_K (4), Q8_0 (1) y F32 (328); 4,84 BPW |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), fichero unico de 5.568.302.304 bytes / 5310 MiB |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `sensenova_loop`, que el autor describe como un decodificador con bucles de computacion (looped decoder) mas enrutamiento residual mHC. Incorpora 24 capas SSM (State Space Model) con tensores `ssm_alpha.weight` y `ssm_beta.weight` de forma `[4096, 32]`, lo que sugiere una dimension oculta de 4096 y un estado SSM de 32 canales por capa. La presencia de una cabeza MTP (multi-token prediction) indica que el modelo fue entrenado con un objetivo auxiliar de prediccion multi-token, una tecnica habitual para acelerar la decodificacion especulativa. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron fases de RLHF o DPO.

La cuantizacion MERNIK 5300 aplica un presupuesto objetivo de 5300 MiB guiado por Gnom v5, un predictor de dano por cuantizacion que asigna mas bits a los tensores mas sensibles. Sobre esa asignacion se impone una fijacion explicita en F32 de las 48 compuertas SSM y de los routers mHC. De los 538 tensores totales, 328 son F32 (61% del recuento) pero solo suman 40,13 MiB, menos del 1% del fichero. El autor advierte que eliminar estas fijaciones o recuantizar con Q4_K_M generico provoca bucles y degeneracion del texto. La verificacion (SHA-256 y tabla completa de tipos) esta en `sensenova_verification.json` dentro del repositorio.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento y respuesta a preguntas de proposito general (el autor incluye un ejemplo de cultura general).
- Prediccion multi-token (MTP) integrada, que permite decodificacion especulativa en el fork de llama.cpp con soporte.
- Arquitectura hibrida con capas SSM, potencialmente favorable para secuencias largas, aunque no se declara la longitud de contexto soportada.
- No incluye torre de vision: es una build estrictamente de texto.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso.
- No se documentan capacidades de audio ni modo "thinking" explicito.

## Casos de uso

- Inferencia local en estaciones de trabajo: con 5310 MiB el modelo cabe en GPUs de consumo con 8 GB o mas de VRAM usando `-ngl 99`, lo que permite desplegar un modelo de ~9B en hardware asequible sin depender de la nube.
- Experimentacion con arquitecturas hibridas SSM: util para investigadores que quieran estudiar el comportamiento de un decodificador con bucles y capas de estado en un formato reproducible y de bajo coste.
- Evaluacion de tecnicas de cuantizacion sensible: el fichero sirve como caso de referencia para medir el impacto de preservar compuertas recurrentes en F32 frente a recetarios genericos.
- Generacion de texto bilingue ingles-chino: apropiado para prototipos de traduccion o redaccion en ambos idiomas, siempre que se respete la configuracion de muestreo recomendada.
- Pruebas de decodificacion especulativa con MTP: el fork con soporte MTP permite medir la ganancia de throughput frente a la generacion autoregresiva estandar.
- Desarrollo y validacion de runtimes: sirve para probar forks de llama.cpp con arquitecturas no estandar y verificar la correcta carga de tipos de tensor mixtos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5,5-6 GB para el fichero de pesos; con cache KV y overhead del runtime, se recomienda un minimo de 8 GB de VRAM para offload completo con `-ngl 99`.
- GPU recomendadas: cualquier GPU con 8 GB o mas, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070 o superiores; A100 y H100 funcionan sobradamente pero estan infrautilizadas para este tamano.
- Cabe en GPU de consumo: si, en modelos con 8 GB o mas de VRAM; en GPUs con menos memoria puede reducirse `-ngl` para descargar capas parcialmente a CPU.
- Opciones de despliegue: exclusivamente llama.cpp con soporte `sensenova_loop` (fork de wepiqx sobre el fork de GuideboardLabs, commit `61ee5470fe3ad56f3153fb36fb4e88ba44ce83d5`). Backends compilables: CUDA, Vulkan, CPU y Metal. No es compatible con vLLM, TGI, Ollama ni builds estandar de llama.cpp.
- Nota de compilacion: es obligatorio definir `LLAMA_BUILD_SERVER=ON` incluso para construir solo `llama-cli`, porque el target de CLI se registra junto con el del servidor.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| SenseNova-Loop-9B-Preview (MERNIK 5300 SSM-F32) | ~9B | no disponible | Apache 2.0 | GGUF, llama.cpp parcheado | Requiere fork con `sensenova_loop`; SSM gates en F32 |
| SenseNova-Loop-9B-Preview (base) | ~9B | no disponible | Apache 2.0 | safetensors | Modelo original de SenseNova; incluye torre de vision |
| Alternativas de ~9B en GGUF | ~7-9B | variable | variable | GGUF, llama.cpp estandar | No disponibles en la informacion proporcionada; la comparacion directa no es posible sin datos de benchmarks |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- Sensibilidad extrema al muestreo: el autor indica que no debe bajarse la temperatura; la configuracion recomendada es `--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.00`. Reducir la temperatura a 0,2-0,6 no estabiliza el modelo.
- Fragilidad ante recuantizacion: recuantizar con recetas genericas como Q4_K_M degrada las compuertas SSM y provoca bucles y texto degenerado. No deben eliminarse las fijaciones F32.
- Compatibilidad restringida: no funciona con llama.cpp estandar, Ollama, vLLM ni TGI; requiere compilar un fork concreto, lo que anade friccion operativa y riesgo de mantenimiento.
- Cobertura limitada de idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta documentado.
- Sin vision: la torre de vision del modelo base no esta incluida en esta build.
- Riesgo de alucinacion: no cuantificado por el autor; como en cualquier LLM de ~9B, debe validarse la salida en aplicaciones criticas.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad.
- Ausencia de benchmarks: no hay datos publicados de MMLU, HumanEval, GSM8K ni metricas equivalentes, lo que impide verificar la calidad frente a alternativas.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; build reciente (noviembre de 2026) sin validacion comunitaria amplia.
- Uso comercial: permitido por Apache 2.0, pero conviene revisar las condiciones del modelo base `sensenova/SenseNova-Loop-9B-Preview` y del fork de runtime utilizado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wepiqx/SenseNova-Loop-9B-Preview-MERNIK-GGUF
- Modelo base: https://huggingface.co/sensenova/SenseNova-Loop-9B-Preview
- Predictor de importancia Gnom v5: https://huggingface.co/wepiqx/MERNIK-gnom
- Fork de llama.cpp con soporte `sensenova_loop` y MTP: https://github.com/wepiqx/llama.cpp-sensenova-loop
- Fork upstream de GuideboardLabs (sin MTP): no disponible como URL en la informacion proporcionada
