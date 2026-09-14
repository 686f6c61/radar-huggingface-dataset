# SoulInPsyAbstract/hermes3-8b-sequential-chain-lora

## Resumen

hermes3-8b-sequential-chain-lora es un adaptador LoRA desarrollado por SoulInPsyAbstract sobre el modelo NousResearch/Hermes-3-Llama-3.1-8B. No es un modelo completo: se distribuye como adaptador PEFT que debe cargarse sobre los pesos del modelo base de 8 000 millones de parametros. Su proposito no es mejorar capacidades generales de generacion, sino superponer un conjunto de comportamientos de seguridad y honestidad entrenados de forma secuencial sobre los mismos pesos.

La peculiaridad tecnica del adaptador es su metodo de entrenamiento: en lugar de fusionar adaptadores entrenados por separado ni entrenar sobre un dataset combinado, el autor encadena ocho etapas de entrenamiento consecutivo, donde cada etapa parte del resultado exacto de la anterior mediante `peft.PeftModel.from_pretrained(model, adapter_path, is_trainable=True)`. La cadena arranca desde SoulInPsyAbstract/binary-hermes3-lora y anade, en orden, honestidad, discriminacion de mal comportamiento y cinco compuertas de vulnerabilidad (secretos, control de acceso, inyeccion, mala configuracion de infraestructura y cadena de suministro), cerrando con una etapa de presion de stop-gate.

El interes del artefacto es de investigacion sobre aprendizaje continuo: responde a un hallazgo previo (EXP-040) segun el cual una unica etapa adicional de ajuste fino puede degradar una capacidad ya aprendida y no relacionada. Este adaptador comprueba si esa interferencia se acumula a lo largo de una cadena mas larga de tareas mayoritariamente no relacionadas sobre los mismos pesos. El resultado reportado por el autor es que la degradacion no se acumula de forma monotona y que el rendimiento global se mantiene en el 97 % en evaluacion held-out y adversarial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Llama 3.1 (modelo base) |
| Parametros totales | Adaptador: ~41,9 M (estimacion calculada a partir de rank 16 sobre las 7 matrices de proyeccion de las 32 capas de Llama 3.1 8B); modelo base: ~8 000 M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens heredados del modelo base Llama 3.1 8B; no se especifica en la model card del adaptador y el adaptador no modifica la ventana de contexto |
| Tipos de cuantizacion | El adaptador se distribuye sin cuantizar (entrenado en bf16). No se publican versiones cuantizadas del adaptador. El modelo base admite los formatos habituales (GGUF, GPTQ, AWQ, bitsandbytes NF4/INT8), pero el adaptador debe fusionarse o cargarse sobre la base |
| Idiomas soportados | No disponible en la model card del adaptador. Heredados del modelo base (Llama 3.1 declara ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | apache-2.0 para el adaptador. El uso queda sujeto ademas a la licencia del modelo base (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT: `adapter_config.json` + pesos del adaptador) |
| Libreria | peft |
| Modelo base | NousResearch/Hermes-3-Llama-3.1-8B |
| Punto de partida del entrenamiento | SoulInPsyAbstract/binary-hermes3-lora |
| Tamano del repositorio | 0,2 GB |
| Fecha de creacion / actualizacion | 2026-09-14 / 2026-09-14 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se aplica sobre las 7 matrices de proyeccion de atencion y MLP de cada una de las capas del transformer base (q, k, v, o, gate, up y down), con rank 16, alpha 32 y factor de escala efectivo 2. El entrenamiento se realizo en bf16, con 3 epocas por etapa y una tasa de aprendizaje de 1e-4. La eleccion de cubrir las siete proyecciones en lugar de solo las de atencion explica el tamano relativamente alto del adaptador (~42 M de parametros, frente a los ~10-20 M habituales de un LoRA de rank 16 limitado a q_proj y v_proj).

Lo diferencial es el regimen de entrenamiento: no hay fusion de adaptadores independientes ni un dataset combinado, sino una cadena estricta de ocho etapas donde cada una hereda los pesos exactos de la anterior. Las etapas son: (1) honestidad, con una compuerta de calibracion de 10 items; (2) discriminador de mal comportamiento; (3-7) cinco compuertas de vulnerabilidad (secretos y credenciales, control de acceso, inyeccion, mala configuracion de infraestructura y cadena de suministro); y (8) presion de stop-gate. Como innovacion metodologica, el trabajo introduce una compuerta de calibracion de honestidad y evaluaciones canary de n=3 en las etapas intermedias, con verificacion final a n=10 completo.

Los resultados declarados indican que honestidad y discriminador de mal comportamiento se mantienen en una banda del 96-100 % a lo largo de las 7 etapas posteriores, sin decaimiento monotono. Los grupos de compuertas de vulnerabilidad mantienen el 100 % hasta la ultima etapa, donde los cinco grupos previamente entrenados muestran un ablandamiento uniforme de 2-5 puntos, confirmado con rigor de n=10. No se especifica la composicion del dataset de cada etapa, el numero de tokens utilizados, ni si se emplearon tecnicas de RLHF o DPO; estos datos no estan disponibles.

## Capacidades

- Compuerta de honestidad: calibracion de respuestas con una prueba de 10 items, sin decaimiento monotono a lo largo de la cadena de etapas.
- Discriminacion de mal comportamiento: clasificacion de conductas inapropiadas en la interaccion, mantenida en la banda 96-100 % durante las etapas posteriores.
- Deteccion de secretos y credenciales: compuerta entrenada especificamente para bloquear la exposicion de claves, tokens y contrasenas.
- Control de acceso: compuerta orientada a denegar operaciones no autorizadas en escenarios de permisos.
- Deteccion de inyeccion: compuerta para identificar intentos de prompt injection dentro del flujo de entrada.
- Deteccion de mala configuracion de infraestructura: compuerta para senalar configuraciones inseguras en entornos de despliegue.
- Riesgo de cadena de suministro: compuerta para dependencias y artefactos de terceros potencialmente maliciosos.
- Stop-gate bajo presion: capacidad de mantener las restricciones cuando el usuario insiste o presiona para saltarselas.
- Generacion de texto, razonamiento, codigo, matematicas y tool calling: heredados del modelo base Hermes-3-Llama-3.1-8B, no evaluados ni modificados de forma explicita por este adaptador.
- Capacidades multilingues: heredadas de Llama 3.1; no verificadas para las compuertas de seguridad de este adaptador.
- Modo de pensamiento explicito (thinking mode): no disponible. Hermes-3-Llama-3.1-8B no expone un modo de razonamiento separado y este adaptador no lo anade.
- Vision y audio: no soportados (el modelo base es exclusivamente de texto).

## Casos de uso

- Filtrado previo en agentes de codigo autonomos: colocar el adaptador como compuerta antes de que un agente ejecute comandos de shell, de forma que la etapa de secretos/credenciales bloquee la escritura o el volcado de variables de entorno y ficheros de credenciales en la salida.
- Proteccion de pipelines de CI/CD: la compuerta de cadena de suministro permite revisar cambios en ficheros de dependencias o en scripts de build antes de fusionar una pull request, senalando paquetes o artefactos sospechosos.
- Defensa frente a prompt injection en aplicaciones RAG: la compuerta de inyeccion se aplica sobre el contenido recuperado de documentos y paginas web antes de pasarlo al modelo principal, reduciendo el riesgo de que instrucciones embebidas redirijan al agente.
- Endurecimiento de asistentes con tool calling: usando la compuerta de control de acceso, el adaptador puede vetar llamadas a herramientas que excedan los permisos del usuario (por ejemplo, borrado de recursos o modificacion de IAM) antes de que se ejecuten.
- Auditoria de configuraciones de infraestructura: la compuerta de mala configuracion de infraestructura puede usarse para revisar manifiestos de despliegue, ficheros de IaC o politicas de red en busca de patrones inseguros conocidos.
- Robustez ante presion social del usuario: en atencion al cliente o moderacion, la etapa de stop-gate mantiene las reglas cuando el usuario insiste, escala el tono o intenta justificar una excepcion.
- Investigacion en aprendizaje continuo: el adaptador sirve como artefacto reproducible para estudiar interferencia entre tareas encadenadas sobre los mismos pesos, replicando el experimento EXP-042 y comparandolo con EXP-040.
- Capa de seguridad apilable sobre modelos ya desplegados: al ser un adaptador PEFT de ~0,2 GB, puede anadirse o retirarse de un servicio existente basado en Hermes-3 sin volver a desplegar los pesos del modelo base.
- Calibracion de honestidad en asistentes internos: la compuerta de honestidad puede emplearse para detectar cuando el asistente responde con seguridad a preguntas sobre las que no tiene informacion verificable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta evaluaciones internas de seguridad y comportamiento:

| Evaluacion | Resultado reportado | Tamano de muestra |
|---|---|---|
| Honestidad (compuerta de calibracion, 10 items) | Banda del 96-100 % en las 7 etapas posteriores, sin decaimiento monotono | 10 items por etapa |
| Discriminador de mal comportamiento | Banda del 96-100 % en las 7 etapas posteriores | No disponible |
| Compuertas de vulnerabilidad (5 grupos) | 100 % en todas las etapas hasta la ultima, con ablandamiento uniforme de 2-5 puntos | Canary n=3 en etapas intermedias; n=10 en la final |
| Evaluacion global held-out | 97 % (1169/1200) | 1200 |
| Evaluacion global adversarial | 97 % (1167/1200) | 1200 |

Estos datos son autodeclarados por el autor del adaptador y no estan acompanados de una descripcion publica de las metricas, los conjuntos de evaluacion ni el procedimiento de anotacion. No se comparan con lineas base externas.

## Requisitos de hardware

- El adaptador por si solo no es ejecutable: requiere cargar NousResearch/Hermes-3-Llama-3.1-8B (~8 000 M de parametros). El adaptador anade un coste marginal (repositorio de 0,2 GB).
- VRAM estimada para inferencia: ~16-17 GB en bf16/fp16 para los pesos del modelo base mas el adaptador fusionado; ~9-10 GB con cuantizacion de 8 bits; ~5-6 GB con cuantizacion de 4 bits (NF4/bitsandbytes u equivalentes GGUF Q4). Hay que sumar la cache KV, que crece de forma lineal con la longitud de contexto utilizada.
- GPU recomendadas para servicio en bf16: A100 40/80 GB, H100, L40S. Para cargas moderadas, RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes en bf16 con contexto contenido.
- Cabe en GPU de consumo: si. RTX 4090/3090 en bf16 con contexto moderado; RTX 3060 12 GB, RTX 4060 Ti 16 GB o equivalentes si se cuantiza el modelo base a 4 bits.
- Opciones de despliegue: transformers + peft (carga directa del adaptador), vLLM (soporte de adaptadores LoRA servidos en runtime), TGI, llama.cpp (requiere convertir el adaptador a formato GGUF y aplicarlo con `--lora`), Ollama (directiva `ADAPTER` en el Modelfile).
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de rendimiento ni de coste computacional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hermes3-8b-sequential-chain-lora | Adaptador de ~41,9 M sobre base de ~8 000 M | 128 000 tokens heredados | Adaptador LoRA de seguridad y aprendizaje continuo | apache-2.0 (adaptador) + Llama 3.1 Community (base) | HuggingFace, 0 descargas, 0 likes |
| NousResearch/Hermes-3-Llama-3.1-8B | ~8 000 M | 128 000 tokens | Modelo instructivo generalista con soporte de function calling | Llama 3.1 Community License | HuggingFace, ampliamente descargado |
| SoulInPsyAbstract/binary-hermes3-lora | Adaptador PEFT sobre el mismo base | 128 000 tokens heredados | Adaptador de seguridad, predecesor del anterior | apache-2.0 (adaptador) + Llama 3.1 Community (base) | HuggingFace |
| Llama-Guard-3-8B | ~8 000 M | 128 000 tokens | Clasificador de seguridad dedicado | Llama 3.1 Community License | HuggingFace |

Los datos de rendimiento comparado no estan disponibles: el autor no publica evaluaciones frente a Llama-Guard-3-8B ni frente a otros adaptadores de seguridad, y las metricas reportadas (97 % en held-out y adversarial) corresponden a conjuntos internos sin descripcion publica.

## Limitaciones y advertencias

- Cero descargas y cero likes en el momento de redactar esta ficha: el adaptador no tiene validacion independiente por parte de terceros.
- Las metricas de seguridad (97 %, 1169/1200 y 1167/1200) son autodeclaradas por el autor y no van acompanadas de la definicion publica de los conjuntos de evaluacion ni de su procedimiento de anotacion.
- Las etapas intermedias de la cadena se validaron con compuertas canary de n=3, un tamano de muestra demasiado pequeno para extraer conclusiones robustas sobre la evolucion intermedia de cada capacidad.
- El resultado declarado incluye un ablandamiento uniforme de 2-5 puntos en las cinco compuertas de vulnerabilidad durante la ultima etapa, lo que sugiere que la cadena secuencial si ejerce presion sobre capacidades previamente aprendidas, aunque no de forma acumulativa.
- Riesgo de alucinacion: no evaluado en la model card. Al operar sobre un modelo instructivo generalista de 8B, el adaptador hereda el riesgo de alucinacion del modelo base, especialmente en tareas de clasificacion de seguridad fuera de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados. No hay evaluacion de sesgos por idioma, genero, etnia ni dominio.
- Limitaciones de idioma: no se especifica que idiomas cubren las compuertas de seguridad. Es probable que el entrenamiento se haya realizado predominantemente en ingles, sin garantia de comportamiento equivalente en espanol u otros idiomas.
- Restricciones de licencia: el adaptador se publica bajo apache-2.0, pero al depender de NousResearch/Hermes-3-Llama-3.1-8B, el uso comercial queda sujeto a la Llama 3.1 Community License, que impone obligaciones adicionales (atribucion, politica de uso aceptable y, para productos con mas de 700 millones de usuarios mensuales, una licencia separada de Meta).
- Uso en produccion: un adaptador de seguridad de este tipo no debe sustituir a un clasificador dedicado ni a controles deterministas. Las compuertas aprendidas pueden ser evadidas mediante parafraseo, ofuscacion o cambio de idioma, y no se han publicado pruebas de robustez adversarial externas.
- El repositorio no incluye datos sobre composicion del dataset, numero de tokens de entrenamiento ni si se aplicaron tecnicas de alineacion adicionales (RLHF, DPO), lo que dificulta la reproducibilidad.
- Fechas de creacion y actualizacion del repositorio registradas como 2026-09-14, posteriores a la fecha habitual de publicacion de modelos de esta familia; conviene verificar la vigencia del artefacto antes de usarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SoulInPsyAbstract/hermes3-8b-sequential-chain-lora
- Modelo base: https://huggingface.co/NousResearch/Hermes-3-Llama-3.1-8B
- Adaptador de partida (binary-hermes3-lora): https://huggingface.co/SoulInPsyAbstract/binary-hermes3-lora
- Dataset con el registro de gobierno y los informes de experimentos (EXP-040, EXP-042): https://huggingface.co/datasets/SoulInPsyAbstract/sipa-os-governance
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos correspondian exclusivamente a paginas corporativas de Microsoft, sin relacion con el artefacto. No hay paper, blog tecnico ni demo publica asociados al adaptador en la informacion disponible.
