# zedongpeng/Qwen3.8-27B-NInfer-4090

## Resumen

Qwen3.8-27B-NInfer-4090 es una reempaquetado cuantizado del checkpoint Qwen/Qwen3.8-27B (revision `1d4bf0f`), publicado por el usuario zedongpeng en formato nativo NInfer v3 (`.ninfer`) y optimizado para decodificacion especulativa con lote 1 sobre una unica RTX 4090 de 24 GB. No es un modelo nuevo: es una conversion de pesos pensada para un motor concreto y una GPU concreta, con un drafter DFlash2 afinado especificamente para el objetivo cuantizado.

El objetivo declarado es doble. Por un lado, calidad: frente a la release previa de NInfer del mismo modelo (neroued/Qwen3.8-27B-NInfer), este build usa GPTQ con act-order y busqueda de clip por grupo en todas las proyecciones de texto a Q4 (grupo 64), ademas de reempaquetado a 3 bits de parte de las MLP y un ajuste fino de las ganancias de RMSNorm contra la distribucion de salida del modelo en BF16. Por otro, velocidad: con un arbol de verificacion de 16 nodos alcanza 322,3 tokens/s y 5,43 tokens por ronda en Spec-Bench, frente a 177,9 tokens/s y 4,03 tokens por ronda de la release anterior con el mismo motor.

Su relevancia es practica: demuestra que un modelo de ~27 000 millones de parametros con decodificacion especulativa exacta puede servirse a velocidad interactiva en hardware de consumo, a costa de acoplarse a un motor parcheado (53 parches sobre el port Ada de Cinference), de limitarse a lote 1 y decodificacion greedy, y de no devolver logits densos. La licencia Apache-2.0, heredada del modelo base y del drafter, permite uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (contenedor NInfer v3); incluye torre de vision y cabecera MTP. Detalles de la arquitectura del modelo base: no disponible |
| Parametros totales | Aproximadamente 27 000 millones segun la denominacion del modelo base; no confirmado en la informacion disponible |
| Parametros activos | No aplica (no se describe una arquitectura MoE en la informacion disponible) |
| Longitud de contexto | 32 768 tokens en la receta de referencia (`--max-context 32768`); la cache KV mas grande que arranca en una tarjeta de 24 GB es de 57 344 tokens (65 536 no cabe). Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | GPTQ con act-order y busqueda de clip por grupo; todas las proyecciones del modelo de texto a Q4 (grupo 64); MLP gate/up en capas 0-31 y MLP down en capas 0-15 con codigos restringidos a [-4, 3] reempaquetados a 3 bits en carga (`NINFER_Q3_SHADOW=1`); embedding de tokens, LM head y cabecera MTP en `q8_g32_fp16`; torre de vision en Q4-Q6 |
| Idiomas soportados | No disponible (la evaluacion de calidad cubre unicamente prosa en ingles y codigo Python) |
| Licencia | Apache-2.0 |
| Formato de pesos | Contenedor NInfer v3 (`.ninfer`), version 3, 1 190 objetos |
| Modelo base | Qwen/Qwen3.8-27B, revision `1d4bf0f` |
| Drafter | z-lab/Qwen3.8-27B-DFlash2, revision `50307d4` |
| Tamano de fichero | 18 186 359 296 bytes (16,94 GiB) |
| SHA-256 | `37cb1507aca20b442a35f4d7833b950e0507767cf766e7140e81fad4faf43d7f` |
| Tamano del repositorio | 18,2 GB |
| Libreria | `ninfer` |
| Fecha de publicacion | 6 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo no se entrena: se convierte. El checkpoint base Qwen/Qwen3.8-27B se cuantiza a GPTQ con act-order y una busqueda de clip por grupo, dejando todas las proyecciones del modelo de texto a Q4 con grupo 64. Ademas, las MLP gate/up de las capas 0 a 31 y las MLP down de las capas 0 a 15 restringen sus codigos al rango [-4, 3], lo que permite al motor reempaquetarlas en teselas de 3 bits durante la carga mediante la variable `NINFER_Q3_SHADOW=1`. Con los codigos congelados, se ajustan de extremo a extremo las escalas de grupo, un offset por fila y las ganancias de RMSNorm (4,6 millones de parametros) contra la distribucion de salida del modelo en BF16.

El drafter es un DFlash2 de z-lab afinado con LoRA sobre 8 000 secuencias generadas por el propio objetivo cuantizado, despues cuantizado a GPTQ Q4 (con codigos de 3 bits en su MLP; la release almacena el drafter a Q8). Su lista corta de 131 072 tokens se reordena usando las salidas del objetivo. La decodificacion especulativa es exacta: cada token emitido es la eleccion greedy del objetivo, de modo que el drafter solo afecta a la velocidad y nunca a la salida. Siguiendo la receta de la release de NInfer, el embedding de tokens, la LM head, la cabecera MTP, el tokenizador y la plantilla de chat se mantienen en `q8_g32_fp16`, y la torre de vision en Q4-Q6.

La innovacion tecnica destacable no esta en los pesos sino en el motor: el build de referencia requiere una serie de 53 parches sobre el port Ada de Cinference de jram4, con compilacion `-DNINFER_RDC=OFF`, y un arbol de verificacion de 16 nodos con temperatura de arbol 1,25, una LM head de dos niveles con cribado y copias de solo decodificacion de los planos de 3 bits, los planos de escala de 8 bits y los cribados de la LM head (unos 4 GiB adicionales junto a los pesos Q4).

## Capacidades

- Generacion de texto autoregresiva con decodificacion greedy determinista, en lote 1.
- Decodificacion especulativa exacta mediante el drafter DFlash2: cada token emitido coincide con la eleccion greedy del objetivo.
- Razonamiento con modo pensamiento desactivable; la receta medida lo ejecuta con `--no-thinking`.
- Generacion y comprension de codigo: la evaluacion de calidad incluye 22 976 predicciones sobre fuente CPython, con KL64 de 0,1018.
- Procesamiento de prosa en ingles: KL64 de 0,0265 sobre texto de Wikipedia.
- Capacidad multimodal declarada por la presencia de una torre de vision cuantizada a Q4-Q6, aunque su comportamiento no se ha evaluado.
- Cabecera MTP (multi-token prediction) presente en el contenedor, sin evaluacion publicada.
- Soporte de contexto largo en la practica limitado por la cache KV: hasta 57 344 tokens en 24 GB.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Inferencia local en una sola GPU de consumo: el modelo esta disenado para servirse en una RTX 4090 de 24 GB a 322,3 tokens/s en lote 1, lo que permite desplegar un modelo de ~27 000 millones de parametros en una estacion de trabajo sin infraestructura de centro de datos.
- Asistentes de codigo en el puesto de trabajo: el rendimiento medido sobre fuente CPython y la velocidad sostenida lo hacen adecuado para autocompletado y explicacion de codigo en local, donde la latencia por token percibida por el cliente es de unos 3 ms.
- Despliegues con requisitos de privacidad: al ejecutarse integramente en hardware propio y en un unico fichero, evita enviar codigo o documentacion a APIs externas.
- Investigacion en decodificacion especulativa: el repositorio incluye motores parcheados y herramientas de medida que permiten reproducir comparativas de tokens por ronda y de tasa de aceptacion del drafter.
- Evaluacion de tecnicas de cuantizacion: el par KL64/PPL frente al checkpoint BF16 (3,213 frente a 3,146 de perplejidad) sirve como referencia para estudiar el impacto de mezclar Q4, Q5 y planos de 3 bits en un mismo modelo.
- Analisis de corpus de codigo a granel: con 32 768 tokens de contexto se pueden procesar ficheros completos en una sola pasada, util para resumenes de modulos, generacion de documentacion o deteccion de patrones.
- Prototipado de pipelines con modo pensamiento: la receta permite alternar `--no-thinking`, de modo que se puede comparar la salida con y sin cadena de razonamiento sobre el mismo objetivo cuantizado.
- Servicio de un unico usuario concurrente de baja latencia: el motor esta pensado para `--max-concurrency 1`, lo apropiado para demos interactivas o uso individual, no para servir trafico agregado.

## Benchmarks y rendimiento

Velocidad en Spec-Bench (480 primeros turnos, 256 tokens, lote 1, greedy, sin modo pensamiento, tokens/s de decodificacion vistos por un cliente en streaming). Una sesion en una RTX 4090 a 450 W por PCIe Gen3, mismo cliente para todos los motores:

| Motor | Pesos | tok/s | tokens/ronda |
|---|---|---:|---:|
| llama.cpp a4d880f | unsloth UD-Q4_K_XL + DFlash2 Q4_K_M, hasta 7 borradores | 102,2 | 4,09 |
| vLLM 0.27.1, receta monousuario sidnaZ | AutoRound W4A16 + DFlash2 W4A16, 7 borradores | 200,3 | 4,07 |
| Cinference-4090 (jram4 70ebb12) | Release de NInfer, cadena de 7 tokens | 177,9 | 4,03 |
| Motor del autor | Release de NInfer, arbol de verificacion de 16 nodos | 245,2 | 5,18 |
| **Motor del autor** | **Este repositorio, arbol de verificacion de 16 nodos** | **322,3** | **5,43** |

Calidad frente a una referencia de computo FP32 sobre el checkpoint BF16 (46 059 predicciones de siguiente token en 44 ventanas de 2 048 tokens, mitad prosa de Wikipedia y mitad fuente CPython, disjuntas de los datos de calibracion). KL64 es KL(referencia ‖ modelo) sobre los 64 tokens mas probables de la referencia:

| Build | KL64 prosa | KL64 codigo | KL64 | top-1 | PPL |
|---|---:|---:|---:|---:|---:|
| Release de NInfer (RTN Q4/Q5) | 0,0290 | 0,1095 | 0,0668 | 0,9250 | 3,294 |
| **Este modelo** | **0,0265** | **0,1018** | **0,0619** | **0,9250** | **3,213** |
| Checkpoint BF16 | no disponible | no disponible | no disponible | no disponible | 3,146 |

No se han publicado resultados de benchmarks de conocimiento o razonamiento (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La evaluacion de calidad cubre unicamente prosa en ingles y Python; el comportamiento en vision, MTP y contexto largo no se ha evaluado.

## Requisitos de hardware

- VRAM: el fichero ocupa 16,94 GiB; el motor necesita ademas unos 4 GiB para las copias de solo decodificacion (planos de 3 bits, planos de escala de 8 bits y cribados de la LM head). La configuracion de referencia cabe en una tarjeta de 24 GB.
- Contexto maximo real en 24 GB: 57 344 tokens de cache KV con `--kv-dtype k8v4`; 65 536 tokens no arranca.
- GPU recomendada: RTX 4090 (sm_89). Es el unico hardware en el que se ha probado la receta.
- Otras GPU: no disponible. No se documentan pruebas en A100, H100, RTX 3090 ni en arquitecturas distintas de Ada.
- Cabe en GPU de consumo: si, en una RTX 4090 de 24 GB. No se indica si cabe en tarjetas de 16 GB o menos.
- Opciones de despliegue: motor NInfer parcheado (`./build/apps/ninfer-serve`) con la serie de 53 parches sobre el port Ada de Cinference, compilado con `-DNINFER_RDC=OFF`. Para comparativas se citan llama.cpp a4d880f y vLLM 0.27.1 con pesos alternativos (UD-Q4_K_XL y AutoRound W4A16 respectivamente).
- Throughput: 322,3 tokens/s en decodificacion, 5,43 tokens por ronda, lote 1, greedy, en la sesion medida. Latencia aproximada de 3,1 ms por token.
- Prefill: `--prefill-chunk 1024` en la configuracion de referencia. No se publica una cifra de tokens/s de prefill.
- Concurrencia: `--max-concurrency 1`. No hay datos de rendimiento con lotes mayores.

## Comparativa con modelos similares

Comparativa de builds del mismo modelo base para el mismo hardware de destino:

| Build | Cuantizacion | Motor | tok/s (Spec-Bench) | tokens/ronda | KL64 | PPL | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| Este repositorio | GPTQ Q4/Q3 sombra + drafter Q4 | NInfer parcheado | 322,3 | 5,43 | 0,0619 | 3,213 | Apache-2.0 |
| neroued/Qwen3.8-27B-NInfer | RTN Q4/Q5, drafter Q8 | NInfer (Cinference-4090) | 177,9 | 4,03 | 0,0668 | 3,294 | Apache-2.0 |
| unsloth UD-Q4_K_XL + DFlash2 Q4_K_M | GGUF Q4_K_XL | llama.cpp | 102,2 | 4,09 | no disponible | no disponible | Apache-2.0 (base) |
| AutoRound W4A16 + DFlash2 W4A16 | INT4 con receta monousuario | vLLM 0.27.1 | 200,3 | 4,07 | no disponible | no disponible | Apache-2.0 (base) |
| Qwen/Qwen3.8-27B (BF16) | Sin cuantizar | no disponible | no disponible | no disponible | referencia | 3,146 | Apache-2.0 |

No se dispone de comparativas con modelos de otras familias del mismo rango de parametros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo lote 1 y decodificacion greedy. La LM head de dos niveles no devuelve logits densos, por lo que no se pueden aplicar tecnicas que requieran la distribucion completa.
- No se ha validado fuera de una unica RTX 4090 (sm_89). El rendimiento y la correccion en otras GPU no estan documentados.
- La velocidad y la calidad declaradas dependen de un motor parcheado con 53 parches sobre el port Ada de Cinference. Sin ese motor, el fichero se carga como contenedor NInfer v3 estandar pero no reproduce las cifras publicadas.
- La decodificacion especulativa es exacta, de modo que el drafter no introduce degradacion de calidad, pero tampoco mejora la salida: solo la velocidad.
- Coherencia de la cuantizacion: parte de los pesos usa codigos de 3 bits mediante repacking en carga. Saltarse `NINFER_Q3_SHADOW=1` o `NINFER_Q3_TILED=1` en el arranque produciria resultados incorrectos.
- Memoria adicional: el motor reserva unos 4 GiB extra para las copias de decodificacion, lo que limita la cache KV practica a 57 344 tokens en 24 GB.
- La evaluacion de calidad cubre unicamente prosa en ingles y codigo Python. Vision, MTP y contexto largo no se han evaluado, pese a que el contenedor incluye torre de vision y cabecera MTP.
- Idiomas distintos del ingles: no evaluados. No hay datos de rendimiento en castellano ni en otras lenguas.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje generativo; el autor no publica tasas de factualidad ni evaluaciones de veracidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion en la informacion proporcionada.
- Licencia: Apache-2.0, heredada del modelo base y del drafter, permite uso comercial con atribucion. Conviene verificar la licencia del checkpoint base y del drafter por separado antes de un despliegue en produccion.
- Estado del repositorio: 0 descargas y 0 me gusta en el momento de la consulta, sin historial de validacion por terceros.
- El repositorio esta etiquetado con `inference: false` y `region: us`, lo que condiciona el soporte en la infraestructura de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zedongpeng/Qwen3.8-27B-NInfer-4090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Drafter DFlash2: https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Release previa de NInfer del mismo modelo: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Motor NInfer: https://github.com/Neroued/ninfer
- Analisis con figuras interactivas: https://zedongpeng.com/assets/html/qwen38-4090-decode.html
- Herramientas de medida y parches del motor: https://github.com/zedong-peng/qwen38-4090-decode
- Serie de 53 parches: https://github.com/zedong-peng/qwen38-4090-decode/tree/master/code/engine-series
