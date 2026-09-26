# WaveCut/Qwen3.6-35B-A3B-NVFP4-NInfer-v3

## Resumen

Qwen3.6-35B-A3B-NVFP4-NInfer-v3 es un artefacto cuantizado del modelo Qwen/Qwen3.6-35B-A3B, preparado por el usuario WaveCut para el runtime NInfer (formato `.ninfer`, version v3). No es un modelo entrenado desde cero, sino una conversion de pesos: toma los expertos en NVFP4 del checkpoint RedHatAI/Qwen3.6-35B-A3B-NVFP4 copiados sin recuantizar, y aplica cuantizacion propia (Q8, Q6, Q5, Q4 segun componente) al resto de matrices a partir de la base en BF16. El objetivo es ejecutar un modelo MoE de 35B parametros totales y 3B activos en GPUs Blackwell consumer y de estacion de trabajo, aprovechando los tensor cores FP4.

La relevancia de este artefacto reside en su especializacion de hardware: los bancos de expertos NVFP4 se aceleran mediante W4A4 en las FP4 tensor cores de arquitecturas `sm_120a` (RTX 50 series y RTX PRO 6000 Blackwell). Esto lo hace inservible en A100, RTX 30 o RTX 40, cuyas builds (`sm_80`, `sm_86`, `sm_89`) rechazan estos bancos. A cambio, ofrece una ventana de contexto de 262.144 tokens, soporte de MTP (multi-token prediction) con cabeza de propuesta, torre de vision y un unico fichero de 21.895.523.588 bytes (20,39 GiB).

El modelo base Qwen3.6-35B-A3B emplea una arquitectura MoE con 40 capas, 256 expertos enrutados por capa, un experto compartido y una combinacion hibrida de atencion (10 capas) y capas GDN (30 capas). El artefacto mantiene estas proporciones estructurales y anade cabezas MTP y de propuesta, ademas de un tower de vision que habilita la modalidad image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida: 40 capas, 256 expertos enrutados por capa + experto compartido; 10 capas de atencion y 30 capas GDN |
| Parametros totales | 35B (segun denominacion del modelo base) |
| Parametros activos | 3B (segun denominacion del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Expertos NVFP4 (FP4 con escala FP8 por cada 16 pesos y un divisor FP32 por matriz apilada); proyecciones de atencion y GDN en Q8 (grupos de 32); router, score de experto compartido, controles A/B de GDN, normas y convolucion en BF16; `A_log` y `dt_bias` en FP32; tabla de tokens y cabeza de salida en Q8 (grupos de 32) y Q6 (grupos de 64); cabeza MTP en Q8; cabeza de propuesta en Q4; tower de vision en Q4/Q5 grupales, merger Q8 y patch embedding Q6 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (formato propietario del runtime NInfer); fichero unico de 21.895.523.588 bytes (20,39 GiB) |

## Arquitectura y entrenamiento

Este artefacto no implica entrenamiento nuevo: es una conversion de pesos. La model card indica que los expertos enrutados (256 por capa) y el experto compartido en las 40 capas son los pesos NVFP4 del checkpoint RedHatAI/Qwen3.6-35B-A3B-NVFP4, copiados codigo a codigo y sin recuantizacion. El resto de componentes se derivan de la base en BF16: proyecciones de atencion y GDN a Q8, router y controles auxiliares en BF16, `A_log` y `dt_bias` en FP32, tabla de tokens y cabeza de salida en Q8/Q6, cabeza MTP en Q8 y cabeza de propuesta en Q4. La torre de vision usa Q4/Q5 con merger Q8 y patch embedding Q6.

La innovacion tecnica principal es la ruta de calculo FP4: los bancos de expertos NVFP4 pasan por W4A4 en las FP4 tensor cores de Blackwell, lo que exige GPUs `sm_120a` y builds de `ninfer-all` con `CMAKE_CUDA_ARCHITECTURES=120a` a partir del commit `a00d1636`. La arquitectura incorpora ademas una cabeza MTP para decodificacion especulativa (3 borradores configurables) y una cabeza de propuesta que reutiliza las filas de la cabeza de salida para los 131.072 tokens mas frecuentes del ranking interno de NInfer, cuantizadas en Q4. La plantilla de chat usada es la `qwen3_6.jinja` fijada por NInfer. No se documentan en la informacion disponible datos sobre el corpus de entrenamiento del modelo base ni sobre fases de RLHF/DPO.

## Capacidades

- Generacion de texto y razonamiento multiuso, heredadas del modelo base Qwen3.6-35B-A3B.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de vision cuantizada en Q4/Q5 y merger en Q8.
- Decodificacion especulativa via cabeza MTP con 3 borradores y cabeza de propuesta de 131.072 tokens, con una tasa de aceptacion del 42 % documentada sobre prosa del corpus de benchmark.
- Contexto largo de hasta 262.144 tokens, con gestion de KV en `rk8v4` y estado GDN en FP16.
- Capacidad de ejecucion en una unica GPU Blackwell, con modo de contexto completo y vision activados.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, multi-step reasoning, thinking mode ni audio.

## Casos de uso

- Asistente multimodal de contexto largo en estacion de trabajo: con 262.144 tokens de ventana y torre de vision activa, puede procesar documentos extensos con imagenes intercaladas en una sola pasada sobre una RTX PRO 6000 Blackwell o RTX 5090.
- Analisis de documentos tecnicos con figuras: la combinacion de vision Q4/Q5 y contexto amplio permite resumir informes, planos o articulos con tablas e imagenes sin trocear el contenido.
- Chat interactivo de baja latencia: la decodificacion a 742 tok/s en respuesta corta sobre RTX 5090 lo hace apto para asistentes conversacionales donde la latencia percibida importa.
- Procesamiento por lotes de prompts largos: los 30.938 tok/s de prefill a 4.096 tokens en RTX PRO 6000 permiten clasificacion o extraccion sobre lotes de documentos largos.
- Investigacion en cuantizacion NVFP4: sirve como banco de pruebas para medir el impacto de W4A4 en expertos MoE frente a alternativas Q4/Q5 (perplejidad 4,410 frente a 4,364 del artefacto oficial de NInfer).
- Despliegue local sin conectividad: al ser un fichero unico `.ninfer` con runtime NInfer, se puede ejecutar en equipos aislados con GPU Blackwell, sin depender de APIs externas.
- Evaluacion comparativa de decodificacion especulativa: la cabeza MTP y la de propuesta permiten medir ganancias de throughput (541 tok/s con 3 borradores frente a 407 tok/s sin ellos en RTX 5090).
- Prototipado de aplicaciones image-text-to-text: la modalidad `image-text-to-text` del base permite construir demos de captioning, VQA o descripcion de escenas con un unico fichero de 20,39 GiB.

## Benchmarks y rendimiento

Perplejidad sobre el subconjunto rapido del corpus de evaluacion de NInfer (`ninfer-perplexity --quick`, 261.167 tokens puntuados, KV INT8), ambos artefactos en la misma RTX PRO 6000:

| Modelo | Perplejidad |
|---|---:|
| Este artefacto | 4,410 |
| Artefacto oficial Qwen3.6-35B-A3B NInfer (expertos Q4/Q5 grupales) | 4,364 |

Rendimiento segun `ninfer_bench` sobre el corpus de benchmark de NInfer (KV BF16, greedy, tres repeticiones, build `120a` por defecto):

| Metrica | RTX 5090 (550 W) | RTX PRO 6000 (600 W) | Artefacto oficial, RTX PRO 6000 |
|---|---:|---:|---:|
| Prefill, 512 tokens | 21.622 tok/s | 21.705 tok/s | 18.040 tok/s |
| Prefill, 4.096 tokens | 27.412 tok/s | 30.938 tok/s | 22.643 tok/s |
| Decode, 128 tokens | 407 tok/s | 399 tok/s | 398 tok/s |
| Decode con MTP (3 borradores, cabeza de propuesta) | 541 tok/s | no disponible | no disponible |

Notas adicionales: la fila MTP se mide sobre prosa del corpus de benchmark con un 42 % de borradores aceptados; una respuesta de chat corta decodifica a 742 tok/s en RTX 5090. El decode lee aproximadamente los mismos bytes que el artefacto oficial, por lo que rinde de forma similar; las ganancias se concentran en prefill gracias a las FP4 tensor cores. El arranque en RTX 5090 tarda 17 segundos y deja 7,4 GiB libres. La conversion del artefacto se puede hacer sin GPU (`--device cpu`) en unos cuatro minutos.

## Requisitos de hardware

- GPU obligatoria con arquitectura `sm_120a`: RTX 50 series (incluida RTX 5090) y RTX PRO 6000 Blackwell. Las builds `sm_80` (A100), `sm_86` (RTX 30) y `sm_89` (RTX 40) rechazan los bancos de expertos NVFP4.
- Tamano del fichero: 21.895.523.588 bytes (20,39 GiB); 19,13 GiB de pesos de texto residentes sin contar vision ni cabezas de borrador.
- En RTX 5090 el arranque consume lo suficiente como para dejar 7,4 GiB libres tras cargar el modelo con la configuracion de contexto completo.
- VRAM estimada para otros modelos de GPU: no disponible.
- Despliegue mediante `ninfer-serve` del proyecto NInfer-all, compilado con `CMAKE_CUDA_ARCHITECTURES=120a` a partir del commit `a00d1636` (commits anteriores solo ejecutan los bancos con `-DNINFER_SM120_NATIVE=ON`).
- Comando de referencia: `ninfer-serve Qwen3.6-35B-A3B-NVFP4-ninfer-v3.ninfer --model-id qwen3.6-35b-a3b --max-context 262144 --kv-capacity 262144 --kv-dtype rk8v4 --gdn-state-fp16 --spec mtp --draft-tokens 3 --lm-head-draft --vision`.
- Otras opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el formato `.ninfer` es especifico del runtime NInfer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Perplejidad (NInfer quick) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| WaveCut/Qwen3.6-35B-A3B-NVFP4-NInfer-v3 | 35B / 3B activos | 262.144 | NVFP4 (expertos) + Q8/Q6/Q5/Q4/BF16 | 4,410 | Apache 2.0 | HuggingFace (0 descargas) |
| neroued/Qwen3.6-35B-A3B-NInfer (artefacto oficial) | 35B / 3B activos | no disponible | Q4/Q5 grupales en expertos | 4,364 | Apache 2.0 | HuggingFace |
| RedHatAI/Qwen3.6-35B-A3B-NVFP4 | 35B / 3B activos | no disponible | NVFP4 (expertos) | no disponible | no disponible | HuggingFace |
| Qwen/Qwen3.6-35B-A3B (base BF16) | 35B / 3B activos | no disponible | BF16 | no disponible | Apache 2.0 | HuggingFace |

La comparativa directa con el artefacto oficial de NInfer muestra una perplejidad ligeramente superior (4,410 frente a 4,364) pero mejor prefill (hasta 30.938 tok/s frente a 22.643 tok/s a 4.096 tokens) y decode equivalente (407 frente a 398 tok/s). La contrapartida es la exigencia de hardware `sm_120a`, ausente en esta comparativa para los demas artefactos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar del modelo base Qwen3.6-35B-A3B, hereda los sesgos de este, no documentados aqui.
- Riesgo de alucinacion: no evaluado en la informacion disponible; la perplejidad de 4,410 no permite inferir tasas de alucinacion.
- Restriccion de hardware critica: solo funciona en GPUs `sm_120a`. No es ejecutable en A100, H100, RTX 30 ni RTX 40, lo que limita gravemente su portabilidad y su uso en infraestructura cloud convencional.
- Dependencia del runtime: requiere compilar una build especifica de `ninfer-all` (commit `a00d1636` o posterior con `CMAKE_CUDA_ARCHITECTURES=120a`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Formato propietario: el fichero `.ninfer` no es interoperable con otros runtimes; la conversion se realiza mediante el propio toolchain de NInfer.
- Idiomas soportados: no disponible; no se puede confirmar cobertura multilingue mas alla de lo que ofrezca el modelo base.
- Adopcion y validacion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe una comunidad que haya reportado comportamiento en produccion.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar el fichero `NOTICE` del repositorio, ya que los expertos NVFP4 provienen del checkpoint de RedHatAI, cuyos terminos originales deberian verificarse.
- Contexto de 262.144 tokens: el modo de contexto completo con KV `rk8v4` y estado GDN en FP16 deja solo 7,4 GiB libres en RTX 5090, por lo que la concurrencia o cargas adicionales estan muy limitadas.

## Enlaces

- HuggingFace del artefacto: https://huggingface.co/WaveCut/Qwen3.6-35B-A3B-NVFP4-NInfer-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Checkpoint NVFP4 de origen de los expertos: https://huggingface.co/RedHatAI/Qwen3.6-35B-A3B-NVFP4
- Artefacto oficial de NInfer para comparacion: https://huggingface.co/neroued/Qwen3.6-35B-A3B-NInfer
- Repositorio del runtime NInfer: https://github.com/Neroued/ninfer
- Fork NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit de referencia para builds `120a`: https://github.com/iamwavecut/ninfer-all/commit/a00d1636
