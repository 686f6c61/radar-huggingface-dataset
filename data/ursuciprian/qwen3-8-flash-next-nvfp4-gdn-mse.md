# ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE

## Resumen

Qwen3.8-Flash-Next-NVFP4-GDN-MSE es una cuantizacion comunitaria del checkpoint Qwen3.8-Flash-Next, publicada por el usuario ursuciprian. Se trata de un modelo multimodal image-text-to-text de aproximadamente 91.640 millones de parametros, derivado de la familia Qwen, que combina capas de atencion lineal del tipo Gated DeltaNet (GDN) con mezcla de expertos (MoE) y un drafter MTP para decodificacion especulativa. Su proposito es servir como checkpoint de inferencia optimizado para una unica DGX Spark, reduciendo el coste de memoria y acelerando la decodificacion sin degradar la calidad.

La modificacion principal respecto al checkpoint base consiste en almacenar las proyecciones GDN (108 tensores en 36 capas) en NVFP4 con esquema W4A16 en lugar de MXFP8, y en reentrenar los 24 tensores densos en BF16 del drafter MTP sobre las propias salidas del modelo. El resto de pesos, incluidos expertos enrutados y compartidos, atencion, tablas PLE, encoder de vision, tokenizer y plantilla de chat, se mantienen identicos byte a byte.

Es relevante porque demuestra una via practica de cuantizacion selectiva orientada a latencia de decodificacion en hardware de un solo nodo, con metricas publicadas de aceptacion del drafter y de rendimiento comparadas contra el checkpoint original. La licencia es qwen-community-1.0, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal Gated DeltaNet (GDN) y mezcla de expertos (MoE), con encoder de vision y drafter MTP |
| Parametros totales | 91.638.563.731 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se han validado recuperaciones a 8K, 32K, 64K y 128K) |
| Tipos de cuantizacion | NVFP4 W4A16 (E2M1 con escala E4M3 por bloque de 16 y escala global FP32) en proyecciones GDN; MXFP8 en el checkpoint base; drafter MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (36 shards, ~114 GB de repo), con config.json y hf_quant_config.json |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-Flash-Next (revision de4b8e4d) y conserva su estructura: 36 capas con proyecciones GDN (in_proj_qkv, in_proj_z, out_proj), expertos enrutados y compartidos, tablas PLE, encoder de vision y un drafter MTP para decodificacion especulativa. La cuantizacion de las proyecciones GDN se realizo en CPU desde los pesos BF16, verificando previamente que dichos tensores estan congelados en el checkpoint base (la MXFP8 de los pesos BF16 reproduce bit a bit los tensores MXFP8 publicados). in_proj_qkv e in_proj_z comparten una unica escala global por capa porque vLLM las fusiona en una sola operacion lineal. La escala de cada bloque de 16 elementos se elige mediante busqueda de error cuadratico medio sobre factores de 1,0 a 0,8, en lugar de tomar el maximo absoluto; el error relativo medio frente a BF16 es de 0,0877 frente a 0,0937 del redondeo absmax simple.

El drafter MTP se reentreno sobre salidas del propio modelo servido. La revision 3 (D3) usa aproximadamente 10,66 millones de anclas de entrenamiento (11,9 veces las de D1), incluyendo unos 7,35 millones de tokens de salidas generadas y 230 respuestas previas de mas de 4096 tokens. El entrenamiento parte de D1, con una pasada sobre los datos (1208 pasos de unas 8200 anclas), learning rate de 2e-5 con decaimiento lineal hasta 2e-6 y la misma emulacion de la cache KV fp8 del drafter servido. La innovacion practica es el uso de NVFP4 solo en las proyecciones GDN, que en decodificacion operan con 1 a 40 filas por paso y por tanto leen aproximadamente la mitad de bytes que MXFP8; para prefill (41 filas o mas) se mantiene una copia MXFP8 de los mismos pesos, con un coste adicional de unos 1,1 GiB.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida.
- Procesamiento de imagen y texto (pipeline image-text-to-text) mediante encoder de vision.
- Razonamiento y tareas de conteo, con mejora medida en la tarea de counting (+7,8% tok/s en la receta v3d).
- Tool calling: la suite TC-45 obtiene 100/100 en la receta v3d.
- Recuperacion en contexto largo: 20/20 a 8K, 32K, 64K y 128K, y 20/20 adicionales a 128K con semillas 11 y 13.
- Decodificacion especulativa mediante drafter MTP con aceptacion por posicion documentada (0,911 en posicion 1 a temperatura 0 en D3).
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional multimodal en un unico nodo: el modelo acepta imagen y texto y puede desplegarse en una DGX Spark con TP=1, lo que permite montar un asistente con entrada visual sin infraestructura multi-GPU.
- Tool calling en produccion: la suite TC-45 con 100/100 respalda su uso en pipelines donde el modelo debe invocar funciones externas, como consultas a bases de datos o APIs internas.
- Recuperacion sobre documentos largos: la validacion 20/20 a 128K permite usarlo en busqueda aumentada sobre contratos, informes o bases de codigo extensas.
- Generacion de codigo asistida: el reentrenamiento del drafter incluye respuestas largas de codigo (mas de 4096 tokens), lo que mejora la aceptacion especulativa en ese dominio y reduce la latencia por token.
- Servicio de inferencia de baja latencia en hardware de gama unica: con 50,0 a 59,7 tok/s en tg512 y 1 peticion, es adecuado para prototipos y entornos de desarrollo que no justifican un cluster.
- Despliegue con vLLM en configuracion hibrida NVFP4/MXFP8: la receta v3d permite alternar automaticamente entre ambos formatos segun el tamano del lote (umbral de 41 tokens), util para cargas mixtas de prefill y decode.
- Evaluacion de cuantizacion en investigacion: el checkpoint sirve como referencia reproducible para estudiar el impacto de NVFP4 W4A16 en capas de atencion lineal, con metricas de error relativo y aceptacion del drafter publicadas.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando la receta v3d (este checkpoint) con la v3c sobre el checkpoint base, en una DGX Spark con TP=1 y temperatura 0:

| Celda | Cambio | Banda de ruido |
|---|---:|---:|
| Decode, 8 peticiones nuevas | +4,4% tok/s | 1,9% |
| Decode a contexto 16K, 4 peticiones | +5,9% tok/s | 3,0% |
| Tarea de conteo, 8 peticiones | +7,8% tok/s | 2,1% |
| tg512, 1 peticion (llama-benchy) | 50,0 -> 59,7 tok/s | 4,3% |
| pp2048, 1 peticion (llama-benchy) | -0,9% | 1,0% |

Puerta de calidad de la receta v3d: suite hard-mode 91/100 (umbral 88; la receta base oscila entre 86 y 93), TC-45 tool calling 100/100, recuperacion en contexto largo 20/20 a 8K, 32K, 64K y 128K, y sonda de stragglers a 8, 12 y 16 peticiones concurrentes sin preempciones.

Aceptacion offline por posicion de borrador en el conjunto reservado, temperatura 0, de D1 a D3: 0,905 a 0,911; 0,797 a 0,810; 0,699 a 0,718; 0,614 a 0,640; 0,542 a 0,574; 0,480 a 0,517. A temperatura 1: 0,876 a 0,885; 0,713 a 0,733; 0,551 a 0,581; 0,409 a 0,446; 0,294 a 0,334; 0,206 a 0,245.

Aceptacion en vivo en dos DGX Spark, D1 a D3, posiciones 1 a 4: en dgx-01, 0,849 a 0,860; 0,699 a 0,720; 0,575 a 0,598; 0,472 a 0,498. En dgx-02, 0,852 a 0,857; 0,703 a 0,717; 0,578 a (valor truncado en la informacion disponible).

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 114 GB en safetensors; el checkpoint esta pensado para una DGX Spark con TP=1, por lo que requiere el pool de memoria unificado de ese equipo. No se dispone de estimaciones para otras configuraciones.
- La receta v3d mantiene una copia MXFP8 adicional de los pesos GDN, con un consumo extra de aproximadamente 1,1 GiB.
- GPU recomendadas: DGX Spark (unico hardware validado en la model card). No hay datos publicados para A100, H100 ni RTX 4090.
- No cabe en GPU de consumo convencionales con 24 GB de VRAM en su formato actual; no se han publicado variantes GGUF ni cuantizaciones de menor tamano.
- Opciones de despliegue: vLLM, con la receta qwen3.8-flash-next-1x-dgx-spark (release v2.2.0 sirve esta revision con drafter D3). La variable VLLM_B12X_NVFP4_MXFP8_MIN_TOKENS=41 controla el umbral de cambio entre NVFP4 y MXFP8.
- Latencia y throughput: 50,0 a 59,7 tok/s en tg512 con 1 peticion; +4,4% a +5,9% de tok/s en decode frente al checkpoint base. Sin datos de latencia absoluta por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Qwen3.8-Flash-Next-NVFP4-GDN-MSE (este) | 91,6B | no disponible (validado a 128K) | NVFP4 W4A16 en GDN + MXFP8 | qwen-community-1.0 | Hugging Face, 357 descargas |
| local-inference-lab/Qwen3.8-Flash-Next-NVFP4 (base) | no disponible | no disponible | MXFP8 | qwen-community-1.0 | Hugging Face |
| Qwen/Qwen3.8-Flash-Next (BF16) | no disponible | no disponible | BF16 | qwen-community-1.0 | Hugging Face |

No se dispone de datos de benchmarks academicos ni de parametros de los modelos base y BF16 en la informacion proporcionada, por lo que la comparacion se limita a formato de pesos, licencia y disponibilidad.

## Limitaciones y advertencias

- Es una cuantizacion comunitaria, no oficial de Qwen; la calidad y el soporte dependen del autor ursuciprian y de la receta asociada.
- La licencia qwen-community-1.0 impone condiciones especificas para uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- El checkpoint esta optimizado y validado unicamente para una DGX Spark con TP=1; el rendimiento en otros hardware no esta documentado.
- La cuantizacion NVFP4 W4A16 introduce un error relativo medio de pesos de 0,0877 frente a BF16, lo que puede afectar a tareas sensibles a la precision numerica.
- El uso de una copia MXFP8 adicional para prefill incrementa el consumo de memoria en unos 1,1 GiB y debe configurarse correctamente el umbral de tokens.
- Los resultados de calidad publicados (hard-mode 91/100, TC-45 100/100) proceden del propio autor y no de una evaluacion independiente.
- No se han publicado datos de sesgos, tasas de alucinacion ni cobertura de idiomas; deben evaluarse antes de un despliegue real.
- El rendimiento en decodificacion depende de la aceptacion del drafter MTP, que varia con el dominio y la temperatura (aceptacion en posicion 1 de 0,911 a temperatura 0 frente a 0,885 a temperatura 1 en D3).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ursuciprian/Qwen3.8-Flash-Next-NVFP4-GDN-MSE
- Checkpoint base: https://huggingface.co/local-inference-lab/Qwen3.8-Flash-Next-NVFP4
- Modelo original BF16: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Receta de despliegue: https://github.com/ursuciprian/qwen3.8-flash-next-1x-dgx-spark
