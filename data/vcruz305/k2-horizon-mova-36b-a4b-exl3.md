# vcruz305/K2-Horizon-MoVA-36B-A4B-EXL3

## Resumen

K2-Horizon-MoVA-36B-A4B-EXL3 es el conjunto de cuantizaciones EXL3 del modelo K2-Horizon-MoVA-36B-A4B, desarrollado originalmente por IFM y cuantizado por el usuario vcruz305. El modelo base es un transformer disperso de 36.000 millones de parametros totales que activa aproximadamente 4.000 millones por token, mediante dos mecanismos de enrutamiento: un bloque feed-forward de mezcla de expertos (MoE) y una atencion con proyeccion de valores tambien enrutada por expertos, denominada Mixture-of-Values attention (MoVA). Su ventana de contexto nativa es de 524.288 tokens y se distribuye bajo licencia Apache-2.0.

El repositorio analizado no contiene los pesos originales en BF16, sino seis paquetes cuantizados con la tecnica SAGE (mixed-precision para EXL3) a distintas tasas de bits: 8,00, 6,50, 5,00, 4,00, 2,50 y 2,00 bits por peso (bpw). Cada paquete se evalua contra la implementacion de referencia en BF16 con fp32 sobre texto no usado durante la cuantizacion, y el autor publica la tasa de coincidencia top-1 y la divergencia KL (media y percentil 99) de cada uno. El paquete mas pequeno ocupa 11,01 GB, lo que permite ejecutar un modelo de 36.000 millones de parametros en una GPU de 8 GB con offload de expertos.

Su relevancia practica es doble. Por un lado, permite desplegar un modelo de clase frontera con 4.000 millones de parametros activos en hardware de consumo, algo que el BF16 original (aproximadamente 72 GB de pesos) no permite. Por otro, forma parte de un ecosistema plenamente abierto: IFM publica datos de preentrenamiento y midtraining, registros de entrenamiento, checkpoints intermedios por etapa y el codigo de inferencia de referencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only disperso con MoE en el feed-forward y Mixture-of-Values attention (MoVA); 48 capas, hidden size 2.560 |
| Parametros totales | 36.000 millones (modelo base) |
| Parametros activos | Aproximadamente 4.000 millones por token |
| Longitud de contexto | 524.288 tokens (nativo desde midtraining 3) |
| Tipos de cuantizacion | EXL3 con metodo SAGE (mixed-precision); tasas de 8,00, 6,50, 5,00, 4,00, 2,50 y 2,00 bpw; cabeza de salida en 6 bits en todos los paquetes |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3) |
| Tamano del repositorio | 194,0 GB (todos los paquetes) |
| Autoria | Cuantizacion: vcruz305. Modelo base: IFM |
| Fecha de publicacion | 22 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo emplea 48 capas decoder con hidden size 2.560. Las tres primeras capas (0-2) son densas: atencion estandar mas un MLP SwiGLU de anchura 6.144. A partir de la capa 3, cada bloque combina dos sistemas de enrutamiento con router sigmoide. En el feed-forward hay 100 expertos enrutados de anchura 768 mas un experto compartido, con 8 expertos activos por token, sesgo de router solo para seleccion, y pesos normalizados multiplicados por 2,5. En la atencion, la proyeccion de valores (MoVA) dispone de 64 expertos de valor con 4 activos por token. La atencion usa 32 cabezas de consulta y 8 cabezas de clave/valor (GQA), dimension de cabeza 128, RoPE con theta = 10.000.000 y puerta de salida softplus. La normalizacion es RMSNorm agrupada en 2 grupos con epsilon 1e-6 y el vocabulario es de 250.624 tokens con embeddings de entrada y salida no atados.

El entrenamiento fue por etapas, encadenadas, con un total aproximado de 25,1 billones de tokens: preentrenamiento (22,9T tokens, secuencias de 8K), midtraining 1 (1,1T, 32K), midtraining 2 (498B, 128K), midtraining 3 (110B, 512K) y midtraining 4 (199B, 512K, con mezcla desplazada hacia datos agénticos y de razonamiento), seguidas de dos fases de SFT (219B tokens con cobertura amplia y 50B tokens sobre un subconjunto de alta calidad con decaimiento del learning rate), ambas con secuencias de 512K. IFM publica los datos de preentrenamiento y midtraining, los registros de entrenamiento y los checkpoints intermedios de cada etapa como ramas del repositorio base. En cuanto a la cuantizacion, SAGE asigna precision mixta por capa segun su sensibilidad; el autor indica que todos los paquetes se puntuan contra la implementacion de referencia de IFM (`modeling_k2_horizon.py`) ejecutando los pesos BF16 con activaciones fp32.

## Capacidades

- Generacion de texto en ingles con contexto de hasta 524.288 tokens.
- Uso de herramientas y function calling en entornos agénticos: la model card reporta resultados en τ³-Banking (uso de herramientas en banca).
- Razonamiento multi-paso y ejecucion de tareas en terminal: el modelo se evalua en Terminal-Bench 2.
- Razonamiento y tareas de tipo frontera con solo 4.000 millones de parametros activos por token, segun lo reportado por IFM.
- Inferencia eficiente en VRAM: el enrutamiento disperso (MoE + MoVA) reduce el coste por token frente a un modelo denso de 36B.
- No se declaran capacidades de vision, audio ni modo de pensamiento explicito en la informacion disponible.
- Soporte multilingue: no disponible (solo se declara ingles).

## Casos de uso

- Agentes de uso de herramientas en produccion: el modelo esta entrenado con datos agenticos en la fase de midtraining 4 y evaluado en τ³-Banking, por lo que puede integrarse en flujos que requieran seleccionar y ejecutar funciones externas en varios pasos.
- Automatizacion de operaciones en terminal y DevOps: con la ventana de 512K tokens puede recibir el estado completo de un sistema, registros y scripts, y proponer o ejecutar comandos en tareas de tipo Terminal-Bench.
- Atencion al cliente multi-turno: la ventana nativa de 524.288 tokens permite mantener el historial completo de una conversacion larga mas la documentacion de producto sin truncar, con el paquete de 5,00 bpw (24,56 GB) en una GPU de 32 GB.
- Analisis de repositorios y documentacion extensa: con 8,00 bpw (38,07 GB) el modelo conserva el 96,43% de coincidencia top-1 con BF16, adecuado para revisar bases de codigo completas o expedientes largos en una estacion de trabajo con 48 GB de VRAM.
- Despliegue local en hardware de consumo: el paquete de 4,00 bpw (20,05 GB) cabe en una RTX 4090 o RTX 3090 de 24 GB y mantiene el 84,81% de coincidencia top-1, lo que permite usar el modelo en local sin conexion.
- Generacion de codigo asistida en pipelines de CI/CD: los paquetes de 2,50 bpw (13,27 GB) y 2,00 bpw (11,01 GB) permiten ejecutar el modelo en GPUs de 16 GB o de 8 GB con offload, con menor fidelidad pero coste de VRAM muy reducido.
- Investigacion sobre entrenamiento abierto: la publicacion de datos, registros y checkpoints intermedios permite reproducir y estudiar la evolucion de capacidades a lo largo de las etapas de preentrenamiento, midtraining y SFT.
- Evaluacion comparativa de cuantizacion: los seis paquetes, con sus metricas top-1 y KLD frente al mismo BF16, sirven como banco de pruebas para medir el impacto de la tasa de bits en un modelo MoE con enrutamiento en la atencion.

## Benchmarks y rendimiento

Resultados de fidelidad de cada paquete EXL3 frente a la referencia BF16 con activaciones fp32, sobre 10.240 posiciones de texto no usado en la cuantizacion:

| Paquete | Tamano | GPU minima | Top-1 vs BF16 | KLD media | KLD p99 |
|---|---|---|---|---|---|
| 8,00 bpw | 38,07 GB | 96 / 48 GB | 96,43% (9.874/10.240) | 0,0047 | 0,042 |
| 6,50 bpw | 31,34 GB | 48 GB | 90,68% (9.286/10.240) | 0,0335 | 0,336 |
| 5,00 bpw | 24,56 GB | 32 GB | 85,83% (8.789/10.240) | 0,0923 | 0,826 |
| 4,00 bpw | 20,05 GB | 24 GB | 84,81% (8.685/10.240) | 0,1082 | 0,909 |
| 2,50 bpw | 13,27 GB | 16 GB | 83,71% (8.572/10.240) | 0,1326 | 1,153 |
| 2,00 bpw | 11,01 GB | 8 GB + offload | 81,66% (8.362/10.240) | 0,1604 | 1,322 |
| BF16 (referencia) | no disponible en el repo | no disponible | 97,71% (10.006/10.240) | 0,0030 | no disponible |

Resultados de tareas reportados por IFM para el modelo BF16 (no re-ejecutados sobre estas cuantizaciones):

| Benchmark | Que mide | K2-Horizon-MoVA-36B-A4B |
|---|---|---|
| τ³-Banking | Uso agéntico de herramientas | 26,8 |
| Terminal-Bench 2 | Tareas en terminal | no disponible (dato truncado en la model card) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks clasicos.

## Requisitos de hardware

- 8,00 bpw: 38,07 GB de pesos. Requiere GPU de 48 GB (A6000, L40S) o 96 GB; no cabe en ninguna GPU de consumo.
- 6,50 bpw: 31,34 GB. Cabe en 48 GB con espacio para cache KV. No cabe en 32 GB.
- 5,00 bpw: 24,56 GB. Requiere 32 GB (RTX 5090) o superior.
- 4,00 bpw: 20,05 GB. Cabe en GPU de consumo de 24 GB: RTX 4090, RTX 3090, RTX 4090 D.
- 2,50 bpw: 13,27 GB. Cabe en GPUs de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) y en 24 GB con margen amplio.
- 2,00 bpw: 11,01 GB. En una GPU de 8 GB requiere offload de expertos, con la penalizacion de latencia correspondiente.
- Presupuesto de cache KV (estimacion propia a partir de la configuracion: 8 cabezas KV, dimension 128, 48 capas): aproximadamente 192 KiB por token en fp16, es decir, unos 24 GiB para 128K tokens y unos 96 GiB para los 512K completos. Esto condiciona mas el despliegue que el peso de los propios pesos en contextos largos.
- Opciones de despliegue: exllamav3 es la libreria nativa de este formato (servidores tipo TabbyAPI o ExUI). Los pesos EXL3 no son compatibles de forma nativa con llama.cpp, Ollama, vLLM ni TGI; usarlos exigiria una conversion a GGUF u otro formato que no se proporciona en este repositorio.
- Latencia y throughput: no disponibles. La model card no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| K2-Horizon-MoVA-36B-A4B-EXL3 (este repo) | 36B | ~4B | 524.288 | Apache-2.0 | EXL3 / safetensors | 6 paquetes de 8,00 a 2,00 bpw |
| K2-Horizon-MoVA-36B-A4B (base, IFM) | 36B | ~4B | 524.288 | Apache-2.0 | BF16 (safetensors) | Repositorio original con checkpoints intermedios |
| Otros modelos abiertos de tamano o tarea comparable | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card de IFM afirma que el modelo supera en benchmarks agenticos y de razonamiento a modelos densos abiertos de unos 30B y a modelos MoE de hasta 15 veces su tamano, pero no se identifican en la informacion disponible los modelos concretos de la comparacion, por lo que no es posible reproducir esa tabla.

## Limitaciones y advertencias

- Idioma: solo se declara ingles. El rendimiento en castellano u otros idiomas no esta documentado.
- Las metricas top-1 y KLD miden la fidelidad a los pesos BF16, no la precision en tareas. Un paquete con 85% de coincidencia top-1 puede degradar de forma desigual segun la tarea.
- Los paquetes de 2,50 y 2,00 bpw muestran una divergencia alta (KLD media 0,1326 y 0,1604; p99 de 1,153 y 1,322) y su uso en produccion deberia validarse con un conjunto propio de evaluacion.
- El paquete de 2,00 bpw se describe como "floor pack": requiere offload de expertos en GPUs de 8 GB, lo que aumenta la latencia.
- El metodo de cuantizacion SAGE es propio del autor del repositorio; no se referencia en la informacion disponible un informe tecnico ni una evaluacion por pares del mismo.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no se documentan tasas de error ni mecanismos de mitigacion.
- El uso de contextos muy largos (cientos de miles de tokens) esta limitado en la practica por el consumo de cache KV, no solo por la ventana teorica.
- Licencia Apache-2.0: permite uso comercial, modificacion y redistribucion, con obligacion de conservar el aviso de licencia y el archivo NOTICE si existe.
- La model card no incluye secciones de sesgos, datos personales ni evaluaciones de seguridad.
- El repositorio es una cuantizacion de terceros, no una publicacion oficial de IFM; la responsabilidad sobre la fidelidad de los pesos recae en el cuantizador.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/vcruz305/K2-Horizon-MoVA-36B-A4B-EXL3
- Modelo base: https://huggingface.co/IFM/K2-Horizon-MoVA-36B-A4B
- Datos de preentrenamiento: https://huggingface.co/datasets/IFM/K2-Horizon-Pretrain-Data
- Datos de midtraining: https://huggingface.co/datasets/IFM/K2-Horizon-Midtrain-Data
- Registros de entrenamiento: https://wandb.ai/llm360/K2-Horizon-36B
- Blog de IFM sobre K2: https://ifm.ai/blog/k2/
- Repositorio de codigo de inferencia: https://github.com/ifm-ai/xllm
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces anteriores proceden de la model card del repositorio.
