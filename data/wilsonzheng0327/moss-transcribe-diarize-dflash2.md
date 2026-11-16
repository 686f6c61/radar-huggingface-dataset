# wilsonzheng0327/MOSS-Transcribe-Diarize-dflash2

## Resumen

MOSS-Transcribe-Diarize-dflash2 es un modelo borrador (draft) para decodificacion especulativa codiciosa sobre el modelo de reconocimiento de voz con diarizacion MOSS-Transcribe-Diarize 0.9B, desarrollado por el usuario wilsonzheng0327 y publicado en formato `dflash2` de la libreria `speculators`. No es un modelo autonomo: se acopla al modelo objetivo para acelerar la inferencia sin alterar la calidad de la transcripcion (CER y DER identicos), proponiendo bloques de tokens que el modelo grande verifica en un solo paso.

Tecnicamente es una red pequena de 162,5 millones de parametros entrenables que reutiliza el backbone de un draft DFlash publicado previamente y le anade dos componentes: convoluciones causales dinamicas agrupadas y un selector de candidatos de rango 256 que reordena el top-16 de la cabeza del modelo objetivo en cada posicion. El resultado es una longitud de aceptacion media de 5,712 tokens por ronda en simulacion, frente a 5,12 del draft DFlash original, lo que se traduce en aceleraciones de servicio de hasta 4,15x sobre el servidor sin draft en el conjunto aishell4_long.

Su relevancia es practica y muy concreta: en cargas de ASR de audio largo (reuniones, subtitulado, transcripcion masiva) el cuello de botella es la decodificacion autorregresiva, y este draft reduce ese coste con una licencia Apache-2.0 y un footprint de 1,5 GB en repositorio. Esta pensado para servirse con sglang-omni sobre una unica H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Draft de decodificacion especulativa DFlash2: backbone tipo Qwen3 (5 capas, hidden 1024, intermediate 3072, 16 heads / 8 KV heads, head_dim 128) con `fc`, `hidden_norm` y `norm`, mas convoluciones causales dinamicas agrupadas y selector de candidatos |
| Parametros totales | 162.518.272 (162,5 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 131.072 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 y export en float32) |
| Idiomas soportados | en, zh, ja, ko, es, fr, de, ru |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16 en la raiz, export float32 en `float32/`); requiere `custom_code` y libreria `speculators` |

## Arquitectura y entrenamiento

El modelo es un draft de decodificacion especulativa con tamano de bloque 8 (7 propuestas por ronda, ancla en el ultimo token confirmado, causal dentro del bloque) y token de mascara 151705. Reutiliza el vocabulario completo del objetivo (151.936 tokens) sin `lm_head` propio, tomando prestada la cabeza del modelo grande, y consume las capas auxiliares 2, 14 y 25 de las 28 capas del decodificador objetivo. Sobre el backbone heredado del draft DFlash, DFlash2 anade convoluciones causales dinamicas agrupadas (kernel 2, grupo 16, inicializadas como identidad) y un selector de rango 256 que reordena el top-16 de la cabeza objetivo por posicion; el selector aporta 78,1 M de parametros y las convoluciones 2,66 M.

El entrenamiento parte del checkpoint publicado del draft DFlash (`2e3f00b093`) y continua con el mismo conjunto de la fase 2 de ese draft: 596 archivos largos y 22.925 fragmentos cortos (23.521 enunciados, 30,4 M de tokens de etiqueta), etiquetados con la salida codiciosa del propio modelo objetivo mediante sglang-omni. El audio procede de YODAS2 (CC BY 3.0) en ocho idiomas, AMI y VoxConverse (CC BY 4.0) y AISHELL-4 (Apache-2.0). La receta usa entropia cruzada con pesos de posicion D-Pace mas la perdida del selector (peso 1,0, fallos sustituidos por la etiqueta), AdamW con lr 3e-4, 3% de warmup, ventana de 131.072 y 6.144 anclas por paso, durante 10,69 epocas (8.872 pasos) en una H200 con `speculators` en el commit `7ed657f`.

## Capacidades

- Decodificacion especulativa codiciosa para ASR: propone 7 tokens por ronda que el modelo objetivo verifica, manteniendo exactamente la misma salida (CER y DER sin cambios).
- Reordenacion de candidatos mediante selector entrenado: camina de forma codiciosa sobre el top-16 de la cabeza objetivo, condicionando cada slot al token elegido en el anterior.
- Soporte multilingue en 8 idiomas (en, zh, ja, ko, es, fr, de, ru) heredado de los datos de entrenamiento.
- Compatible con audio largo gracias a la ventana deslizante de 131.072 tokens del objetivo.
- Integracion con el worker DFLASH de SGLang 0.5.23 a traves de sglang-omni.
- No realiza generacion de texto, razonamiento, codigo ni tool calling por si mismo: su unica funcion es acelerar el modelo objetivo.

## Casos de uso

- Transcripcion de reuniones y actas: el draft acelera la decodificacion del objetivo en audio de reuniones (AMI, VoxConverse) manteniendo la diarizacion; en aishell4_long con scheduling solapado alcanza 4,15x de speedup a concurrencia 16, lo que abarata el procesado por hora de audio.
- Subtitulado y transcripcion masiva por lotes: con concurrencia 64 y scheduling sincrono sobre movies800times mantiene 1,22x-1,41x de ganancia, util para pipelines que procesan grandes volumenes de video sin cambiar la calidad del texto.
- Servicio de ASR en produccion con SLA ajustado: al reducir el coste por token generado con la misma salida, permite atender mas peticiones por GPU o reducir el numero de H200 necesarias para una cuota dada.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de DFlash2 (selector + convoluciones dinamicas) con receta, datos y metricas de aceptacion publicadas para comparar variantes.
- Despliegue en entornos con FlashInfer preinstalado: el arranque en cache vacia baja a 51 s frente a los ~13 minutos de compilacion JIT, adecuado para contenedores efimeros y autoescalado.
- Evaluacion de calidad de ASR multilingue: al no alterar CER/DER, puede insertarse en bancos de pruebas existentes para medir latencia sin contaminar las metricas de precision.

## Benchmarks y rendimiento

Longitud de aceptacion en decodificacion especulativa codiciosa simulada (objetivo bf16 en CUDA, conjuntos held-out del draft publicado):

| Draft | Score (media de 7 bins) | Todos los tokens |
|---|---:|---:|
| DFlash publicado | 4,993 | 5,12 |
| Control DFlash (`dflash-control/`) | 5,155 | 5,29 |
| Este draft, con selector | 5,574 | 5,712 |
| Este draft, sin selector | 5,307 | 5,448 |

Ganancia de velocidad frente al mismo servidor sin draft (una H200, configuracion por defecto, prefix cache desactivado):

| Dataset | Draft | Scheduling | Conc. 1 | Conc. 4 | Conc. 16 | Conc. 64 |
|---|---|---|---:|---:|---:|---:|
| movies800times | DFlash2 | Sincrono | 1,69x | 1,60x | 1,42x | 1,22x |
| movies800times | DFlash | Sincrono | 1,63x | 1,54x | 1,41x | 1,21x |
| movies800times | DFlash2 | Solapado | 1,93x | 1,74x | 1,57x | 1,41x |
| movies800times | DFlash | Solapado | 1,87x | 1,68x | 1,51x | 1,37x |
| aishell4_long | DFlash2 | Sincrono | 2,57x | 3,31x | 3,70x | - |
| aishell4_long | DFlash | Sincrono | 2,50x | 3,15x | 3,51x | - |
| aishell4_long | DFlash2 | Solapado | 3,29x | 3,82x | 4,15x | - |
| aishell4_long | DFlash | Solapado | 3,13x | 3,58x | 3,85x | - |

Frente al draft DFlash, este draft es un 1%-6% mas rapido en sincrono, un 5%-8% mas rapido en solapado sobre aishell4_long y esta dentro del 1% en solapado sobre movies800times desde 4 peticiones. Longitud de aceptacion registrada: 5,16 frente a 4,82 en movies800times y 5,80 frente a 5,28 en aishell4_long. CER y DER sin cambios y ninguna peticion fallida. No se han publicado resultados de benchmarks de calidad ASR (WER, CER, DER absolutos) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el draft pesa unos 325 MB en bfloat16 (162,5 M de parametros), pero debe residir junto al objetivo MOSS-Transcribe-Diarize 0.9B, por lo que el requisito dominante es el del modelo grande.
- GPU recomendadas: H200 para las cifras publicadas (una GPU por draft en el nodo de evaluacion); no se documentan mediciones en A100, H100 ni RTX 4090.
- Cabe en GPU consumer: no disponible; el modelo esta pensado para servirse con SGLang y FlashInfer, no se documenta soporte en llama.cpp, Ollama ni GPUs de consumo.
- Opciones de despliegue: sglang-omni con `--asr.engine.speculative_algorithm DFLASH` y `--asr.engine.speculative_draft_model_path` apuntando a este repositorio, sobre SGLang 0.5.23. Requiere FlashInfer; sin kernels precompilados (`flashinfer-jit-cache`) la primera compilacion tarda unos 13 minutos en H200, con ellos 51 s en cache vacia.
- Latencia y throughput: speedups de 1,22x a 4,15x segun dataset, concurrencia y scheduling (ver tabla anterior); longitud de aceptacion de 5,16-5,80 tokens por ronda en servicio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion (score) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| MOSS-Transcribe-Diarize-dflash2 (este) | 162,5 M | 131.072 | 5,574 | Apache-2.0 | Hugging Face, formato dflash2 |
| MOSS-Transcribe-Diarize-dflash | no disponible | no disponible | 4,993 | Apache-2.0 (segun repo base) | Hugging Face |
| DFlash control (`dflash-control/`) | no disponible | no disponible | 5,155 | no disponible | Incluido en este repo |

No se dispone de datos publicados de otros drafts DFlash2 para MOSS-Transcribe-Diarize ni de alternativas equivalentes de decodificacion especulativa para ASR con diarizacion en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el objetivo MOSS-Transcribe-Diarize 0.9B y el stack SGLang/sglang-omni no produce salida util.
- Solo funciona en modo codicioso (greedy); no se documenta comportamiento con muestreo, temperatura o beam search.
- La ganancia real en servicio es menor que la ganancia de aceptacion porque el selector anade trabajo a cada paso de decodificacion (1%-6% en sincrono frente al draft previo).
- Dependencia de FlashInfer y de kernels JIT: sin cache precompilada el primer arranque puede tardar ~13 minutos.
- Sesgos: no se documentan analisis de sesgo; los datos de entrenamiento (YODAS2, AMI, VoxConverse, AISHELL-4) condicionan la cobertura acentual y de dominio.
- Riesgo de alucinacion: no aplica de forma directa al ser un draft verificado por el objetivo, pero el modelo hereda cualquier error del objetivo en la transcripcion.
- Cobertura limitada a 8 idiomas; fuera de ellos la tasa de aceptacion puede degradarse y la aceleracion reducirse.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base y los datasets subyacentes imponen sus propias condiciones (YODAS2 CC BY 3.0, AMI y VoxConverse CC BY 4.0, AISHELL-4 Apache-2.0).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: madurez y soporte comunitario limitados; conviene fijar el commit concreto en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/wilsonzheng0327/MOSS-Transcribe-Diarize-dflash2
- Draft DFlash previo: https://huggingface.co/wilsonzheng0327/MOSS-Transcribe-Diarize-dflash
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Libreria speculators (commit usado en entrenamiento `7ed657f`): no disponible URL directa en la informacion proporcionada
- SGLang / sglang-omni (version 0.5.23): no disponible URL directa en la informacion proporcionada
- FlashInfer: no disponible URL directa en la informacion proporcionada
