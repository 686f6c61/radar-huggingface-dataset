# WaveCut/Ternary-Bonsai-2-27B-NInfer-v3

## Resumen

Ternary-Bonsai-2-27B-NInfer-v3 es un artefacto de inferencia publicado por el usuario WaveCut para el motor NInfer, en concreto para la rama `master` del repositorio `iamwavecut/ninfer-all`. No se trata de un modelo entrenado desde cero, sino de un empaquetado optimizado del modelo Ternary Bonsai 2 27B de PrismML: fusiona los pesos ternarios del modelo base, una cabeza MTP de ProCreations, un adaptador especulativo DFlash2 y la torre de vision de Qwen3.8-27B en un unico fichero `.ninfer` de 9.520.051.456 bytes (8,87 GiB).

El modelo parte de una arquitectura de 64 capas derivada de Qwen3.8-27B con controles GDN (atencion lineal tipo gated delta network) y pesos ternarios en las proyecciones de texto, la cabeza de salida y los embeddings. El artefacto esta pensado para servir ventanas de contexto muy largas (262.144 tokens por defecto y hasta 1.048.576 tokens, el techo del motor) en GPUs de consumo, en concreto las RTX 3090, 4090 y 5090, con perfiles de ejecucion medidos y preconfigurados para esas tarjetas.

Su relevancia actual esta en dos frentes: por un lado, permite ejecutar un modelo de ~27.000 millones de parametros cuantizado de forma ternaria en tarjetas de 24 GB; por otro, documenta con numeros concretos el coste en memoria de cada componente (cache KV, cabeza MTP, adaptador DFlash2, torre de vision) y el rendimiento de recuperacion de informacion en ventanas cercanas al millon de tokens. Es, por tanto, material de referencia tanto para despliegue practico como para investigacion en cuantizacion extrema y decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 64 capas derivado de Qwen3.8-27B, con controles GDN (atencion lineal) y pesos ternarios con rotacion de Hadamard |
| Parametros totales | 27.000 millones (segun la nomenclatura del modelo; no se detalla el desglose exacto) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | 262.144 tokens por defecto; hasta 1.048.576 tokens (techo del motor) usando `--rope-yarn` mas alla de 262.144 |
| Tipos de cuantizacion | Ternaria `t2_g128_fp16` (codigos de 2 bits y una escala fp16 por cada 128 columnas) en proyecciones de texto, cabeza de salida y embeddings; BF16/FP32 en controles GDN, normas, convolucion, `A_log` y `dt_bias`; Q8 en la cabeza MTP y en la proyeccion qkv del adaptador DFlash2; Q4 en el adaptador DFlash2; cache KV en `rk8v4` o `rk4v4` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.ninfer` (artefacto unico de 8,87 GiB); los modelos base estan en GGUF ternario y safetensors |
| Tamano del repositorio | 40,1 GB |
| Pipeline declarado | image-text-to-text |
| Libreria | ninfer |

## Arquitectura y entrenamiento

El artefacto se construye con la herramienta de conversion del repositorio (`python3 -m tools.convert`) a partir de cuatro fuentes: los pesos ternarios de PrismML (`ternary=Ternary-Bonsai-2-27B-PQ2_0.gguf`), la cabeza MTP de ProCreations, el adaptador DFlash2 y la receta `bonsai2_27b_ternary`. No hay entrenamiento nuevo en este repositorio: se trata de una importacion y empaquetado de pesos, con la cabeza MTP afinada previamente sobre caracteristicas congeladas de Bonsai 2 y el adaptador DFlash2 entrenado por z-lab contra el mismo modelo base.

La innovacion tecnica principal es el formato `t2_g128_fp16`: cada fila ternaria se importa sin redondeo como codigos de 2 bits con una escala fp16 por cada 128 columnas, todo ello rotado con Hadamard. Cada proyeccion incorpora el vector de signos correspondiente al ancho de su entrada (`hadamard_signs`), y el motor restaura cada fila de token con los signos del ancho oculto. Las partes sensibles del bloque GDN (controles A/B, normas, convolucion, `A_log`, `dt_bias`) se mantienen en BF16/FP32 siguiendo las convenciones del exportador de llama.cpp, incluyendo la conversion de `-exp(A_log)` y el uso de `w` en lugar de `1 + w`. El artefacto incorpora ademas una cabeza de propuesta con las filas `t2_g128_fp16` de la propia cabeza de salida para los 131.072 tokens mas frecuentes del ranking de NInfer, copiadas byte a byte con la misma rotacion, que solo se carga cuando se activa `--lm-head-draft`.

## Capacidades

- Generacion de texto con ventanas de contexto muy largas, hasta 1.048.576 tokens, con recuperacion verificada de informacion en posiciones distantes del documento.
- Procesamiento de imagenes (pipeline `image-text-to-text`) mediante una torre de vision correspondiente a Qwen3.8-27B sin modificar; se activa con `--vision` y modo de residencia en memoria configurable.
- Decodificacion especulativa con dos mecanismos alternativos: cabeza MTP (`--spec mtp --draft-tokens 3 --lm-head-draft`) y adaptador DFlash2 (`--spec dflash2 --draft-tokens 5`).
- Gestion de cache KV configurable por precision (`rk8v4`, `rk4v4`) y estado GDN en fp16 mediante `--gdn-state-fp16`, para ajustar el equilibrio entre memoria y fidelidad.
- Perfilado automatico de ruta de ejecucion: las RTX 3090, 4090 y 5090 arrancan con su perfil medido incorporado; cualquier otra GPU se calibra una vez en el primer arranque (20 a 40 segundos).
- Soporte de tool calling, function calling, comportamiento de agente, modo de razonamiento explicito o capacidades de audio: no disponible en la informacion proporcionada.
- Soporte multilingue: no disponible; no se declaran idiomas en la ficha del modelo.

## Casos de uso

- Analisis de bases de codigo completas: con una ventana de hasta 1.048.576 tokens, el modelo puede recibir un repositorio entero o documentacion tecnica extensa y responder preguntas sobre cualquier punto del mismo, apoyandose en la recuperacion verificada a larga distancia.
- Revision de documentacion legal o financiera: contratos, expedientes o informes de cientos de miles de tokens se pueden procesar en una sola peticion, evitando troceado y perdida de contexto entre fragmentos.
- Atencion al cliente con historial largo: el modelo mantiene coherencia en conversaciones multi-turno donde el historial acumulado ocupa decenas de miles de tokens, con coste de memoria controlable mediante `rk4v4`.
- Procesamiento de imagenes en flujo documental: gracias a la torre de vision y al modo overlay (`--vision-residency overlay --vision-max-merged 12288`), se pueden intercalar capturas, diagramas o escaneos en una conversacion de texto sin reservar permanentemente los 0,73 GiB que ocupa la torre residente.
- Auditoria y verificacion de contenido extenso: la prueba de recuperacion con codigos plantados al 33, 66 y 90 por ciento del documento demuestra utilidad real para localizar datos concretos en corpus masivos sin indexacion externa.
- Despliegue en estaciones de trabajo con GPU de consumo: un unico fichero de 8,87 GiB y perfiles preconfigurados permiten levantar el servicio en una RTX 3090, 4090 o 5090 sin ajuste manual, con consumo en reposo de 12,2 a 15,7 GiB segun cache KV y especulacion.
- Investigacion en cuantizacion ternaria y decodificacion especulativa: el artefacto incluye informe de conversion, `SHA256SUMS` y `NOTICE`, y el comando exacto de conversion, lo que facilita reproducir y comparar variantes del formato `t2_g128_fp16`.
- Generacion asistida con latencia controlada en respuestas cortas: el uso de DFlash2 con cinco borradores ofrece el mejor equilibrio en respuestas breves, mientras que para documentos largos el numero optimo de borradores se situa entre tres y siete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos de rendimiento documentados son pruebas de contexto largo y consumo de memoria.

Prueba de recuperacion: se rellenó la ventana maxima sin especulacion con tres codigos plantados al 33, 66 y 90 por ciento del documento y se pidieron en orden. El modelo devolvio los tres en todas las tarjetas hasta 978.944 tokens. A 1.048.576 tokens, ventana que solo sostiene la RTX 5090, la informacion disponible queda truncada y no confirma el resultado.

| Escenario | Tarjeta | Ventana | Tiempo de prompt | Velocidad de generacion |
|---|---|---|---|---|
| `rk4v4`, sin especulacion | RTX 3090 | 970.752 tokens | 2.359 s | 17,7 tok/s |
| `rk4v4`, sin especulacion | RTX 4090 | 958.464 tokens | 991 s | 30,9 tok/s |

Ventana maxima arrancada por tarjeta (`--max-context` = `--kv-capacity`, una peticion, sin especulacion / con MTP de 3 borradores / con DFlash2 de 5 borradores):

| Cache KV | RTX 3090 | RTX 4090 | RTX 5090 |
|---|---|---|---|
| `rk8v4` | 663.552 / 606.208 / 585.728 | 659.456 / 602.112 / 581.632 | 978.944 / 901.120 / 901.120 |
| `rk4v4` | 970.752 / 884.736 / 839.680 | 958.464 / 876.544 / 831.488 | 1.048.576 en los tres casos |

El techo del motor es 1.048.576 tokens. Se observa que el uso de la cabeza MTP reduce la ventana maxima entre un 7 y un 12 por ciento respecto a la ejecucion sin especulacion.

## Requisitos de hardware

- Memoria del servidor en reposo a ventana de 262.144 tokens, un carril y solo texto (valores de RTX 3090; las RTX 4090 y 5090 difieren como maximo 0,2 GiB):
- Cache `rk8v4`: 14,2 GiB sin especulacion, 15,0 GiB con MTP de 3 borradores, 15,7 GiB con DFlash2 de 5 borradores.
- Cache `rk4v4`: 12,2 GiB sin especulacion, 12,9 GiB con MTP de 3 borradores, 13,7 GiB con DFlash2 de 5 borradores.
- Coste de componentes a ventana de 198.400 tokens: cabeza MTP 0,73 GiB (0,42 GiB de pesos mas KV y grafos de su capa de atencion), cabeza de propuesta 0,16 GiB adicionales cuando se activa `--lm-head-draft`, adaptador DFlash2 1,48 GiB, torre de vision 0,73 GiB en modo residente o 0,03 GiB en modo overlay.
- GPUs soportadas de serie: RTX 3090, RTX 4090 y RTX 5090, con perfil de ruta medido incorporado (`CMAKE_CUDA_ARCHITECTURES` en 86, 89 o 120a). Cualquier otra GPU se calibra una vez en el primer arranque, entre 20 y 40 segundos.
- Si cabe en GPU de consumo: si, en las tres tarjetas citadas, incluso con la ventana completa de 262.144 tokens en configuracion `rk4v4` sin especulacion (12,2 GiB en reposo).
- Opciones de despliegue: `ninfer-serve` de la rama `master` de `iamwavecut/ninfer-all`. Las compilaciones estandar de NInfer rechazan este fichero porque `t2_g128_fp16` y el uso auxiliar `hadamard_signs` solo existen en esa rama.
- Orden de servicio recomendada para contexto completo: `ninfer-serve ... --max-context 262144 --kv-capacity 262144 --kv-dtype rk8v4 --gdn-state-fp16 --spec dflash2 --draft-tokens 5`.
- Latencia y throughput: los unicos datos disponibles son los de la tabla de benchmarks (17,7 tok/s en RTX 3090 y 30,9 tok/s en RTX 4090 a ventanas cercanas al millon de tokens, con tiempos de prompt de 2.359 s y 991 s respectivamente). El preprocesamiento de prompts de ese tamano es muy costoso.

## Comparativa con modelos similares

No se dispone de comparativas de rendimiento con modelos competidores en la informacion proporcionada. La tabla siguiente recoge unicamente los componentes de los que deriva este artefacto.

| Modelo | Parametros | Contexto | Formato | Licencia | Relacion |
|---|---|---|---|---|---|
| WaveCut/Ternary-Bonsai-2-27B-NInfer-v3 | 27B | hasta 1.048.576 tokens | `.ninfer` | Apache 2.0 | Artefacto empaquetado para NInfer-all `master` |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | GGUF (ternario PQ2_0) | no disponible | Modelo base ternario |
| ProCreations/Ternary-Bonsai-2-27B-MTP | no disponible | no disponible | safetensors | no disponible | Cabeza MTP incluida en el artefacto |
| ProCreations/Ternary-Bonsai-2-27B-DFlash2 | no disponible | no disponible | no disponible | no disponible | Adaptador especulativo de z-lab incluido en el artefacto |

## Limitaciones y advertencias

- Compatibilidad restringida: las compilaciones estandar de NInfer rechazan este fichero. Es obligatorio usar la rama `master` de `iamwavecut/ninfer-all`, que incorpora el formato `t2_g128_fp16` y el uso de `hadamard_signs`.
- Cobertura de hardware limitada: los perfiles medidos y preconfigurados existen solo para RTX 3090, 4090 y 5090. En otras GPUs el primer arranque requiere una calibracion de 20 a 40 segundos y el rendimiento no esta documentado.
- Formato unico: el artefacto solo se distribuye como fichero `.ninfer`; no se ofrecen versiones GGUF o safetensors de esta empaquetadura concreta. Los modelos base si estan en GGUF y safetensors, pero no incluyen la fusion de componentes.
- Idiomas soportados: no declarados. No hay informacion sobre cobertura multilingue ni sobre el rendimiento relativo entre lenguas.
- Sesgos conocidos: no disponible. La informacion proporcionada no documenta evaluaciones de sesgo ni de toxicidad.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de fidelidad factual mas alla de la prueba de recuperacion de codigos plantados.
- Rendimiento degradado en el extremo de contexto: a 1.048.576 tokens, ventana que solo sostiene la RTX 5090, la informacion disponible queda truncada respecto al resultado de la prueba de recuperacion, lo que sugiere perdida de fidelidad en el limite del motor.
- Coste de preprocesamiento muy alto en contextos extremos: 2.359 segundos de prompt en RTX 3090 y 991 segundos en RTX 4090 para documentos cercanos al millon de tokens. No es adecuado para cargas interactivas con documentos de ese tamano.
- La cabeza MTP reduce la ventana maxima aprovechable entre un 7 y un 12 por ciento respecto a la ejecucion sin especulacion, lo que obliga a elegir entre velocidad de decodificacion y tamano de contexto.
- El modo overlay de la torre de vision toma prestada memoria de dispositivo de la cabeza de salida, la tabla de tokens y el borrador cargado, y la restaura despues; sin borrador exige `--vision-max-merged 8192` o el modo residente. Esto impone restricciones de planificacion en servidores con varios carriles.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero la informacion disponible no aclara las condiciones de los componentes base de terceros (MTP y DFlash2) mas alla de su procedencia.
- Cuantizacion ternaria con codigos de 2 bits: aunque se importa sin redondeo adicional, la perdida de precision respecto a los pesos originales en BF16 no esta cuantificada en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveCut/Ternary-Bonsai-2-27B-NInfer-v3
- Repositorio del motor NInfer: https://github.com/Neroued/ninfer
- Rama `ninfer-all` (soporte de RTX 3090, 4090 y 5090): https://github.com/iamwavecut/ninfer-all
- Commit de referencia de las mediciones: https://github.com/iamwavecut/ninfer-all/commit/2172a598
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Cabeza MTP: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-MTP
- Adaptador DFlash2: https://huggingface.co/ProCreations/Ternary-Bonsai-2-27B-DFlash2
