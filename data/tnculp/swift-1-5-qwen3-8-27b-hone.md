# tnculp/Swift-1.5-Qwen3.8-27B-hone

## Resumen

Swift-1.5-Qwen3.8-27B-hone es una conversion no oficial del modelo ukisai/Swift-1.5-Qwen3.8-27B (27B parametros, base Qwen3.8-27B) al contenedor propietario `.hone`, un formato de pesos disenado para hone, un servidor de inferencia para una sola GPU desarrollado por tnculp. Resuelve el problema de ejecutar este modelo concreto en el runtime hone, no en otros motores: los pesos se han reempaquetado desde safetensors BF16 a un layout de cuantizacion entera por grupos (`groupwise-int`) optimizado para los kernels de hone.

La relevancia de esta ficha es acotada y hay que subrayarla: no es un modelo nuevo ni un fine-tuning. No se ha reentrenado ningun peso. Lo unico que cambia respecto al modelo base es el formato de almacenamiento, la derivacion de una cabeza de propuesta para decodificacion especulativa (MTP con 3 tokens de borrador) y el empaquetado del tokenizer, chat template y configuracion, que se conservan sin modificar. El resultado es un fichero unico de 18.210.531.328 bytes (18,2 GB).

Su proposito practico es servir el modelo en una sola GPU con decodificacion especulativa y una ventana de contexto de hasta 131.072 tokens. La licencia combina la Swift Open License v1.0 (aportacion de UkisAI) con Apache 2.0 (base Qwen3.8-27B), con un umbral de facturacion de 1.000.000 USD para el uso comercial de organizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Qwen3.8-27B (detalles de arquitectura no disponibles) |
| Parametros totales | 27B (segun nomenclatura del modelo; cifra exacta no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (segun `--max-context 131072` del comando de ejemplo) |
| Tipos de cuantizacion | `groupwise-int` (cuantizacion entera por grupos); KV cache en `rk4v4-e8` |
| Idiomas soportados | no disponible |
| Licencia | Swift Open License v1.0 (aportacion de UkisAI) + Apache License 2.0 (base Qwen3.8-27B) |
| Formato de pesos | `.hone` (contenedor propietario de hone); origen en safetensors BF16 |

Datos adicionales del artefacto: fichero `swift_1_5_qwen3_8_27b.hone`, tamano 18.210.531.328 bytes, sha256 `aa8ff3268e1a639b823b81a421685d8a7027587a8803c526225e443425c833d5`, identidad `swift-1.5-qwen3.8-27b / groupwise-int`. Modelo fuente: `ukisai/Swift-1.5-Qwen3.8-27B` en la revision `bc7a1e10b689648585a3ef41494c8d84cf77271a`.

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base mas alla de identificarlo como Qwen3.8-27B. No se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de capas, dimensiones o mecanismo de atencion. Tampoco hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Todo eso pertenece al modelo base y no se documenta en esta conversion.

Lo que si se detalla es el proceso de conversion: todos los pesos se transformaron de safetensors BF16 al layout `groupwise-int` de hone (cuantizacion entera agrupada, dispuesta para los kernels del runtime) y se derivo una cabeza de propuesta para decodificacion especulativa a partir de la cabeza de salida. El tokenizer, la plantilla de chat y la configuracion se trasladan sin cambios dentro del contenedor. No se reentreno ningun peso. El fichero `conversion.json` registra cada hash de fichero de origen y la receta exacta del conversor. La innovacion tecnica destacable es, por tanto, el uso de decodificacion especulativa con prediccion multi-token (`--spec mtp`, `--draft-tokens 3`, `--lm-head-draft`) y una KV cache cuantizada a 4 bits en formato `rk4v4-e8`.

## Capacidades

- Generacion de texto y razonamiento: los tags del repositorio incluyen `reasoning`, y el comando de ejemplo expone un parametro `--default-reasoning-effort low`, lo que indica un modo de razonamiento configurable.
- Decodificacion especulativa con prediccion multi-token (MTP) y 3 tokens de borrador por paso.
- Contexto largo de hasta 131.072 tokens, con KV cache cuantizada en `rk4v4-e8`.
- Capacidad de servir como backend de inferencia en una sola GPU mediante hone.
- Soporte de tool calling, function calling, uso como agente o capacidades multimodales: no disponible (no se documenta en la informacion proporcionada).
- Capacidades multilingues: no disponible (el campo de idiomas figura como no disponible).

## Casos de uso

- Servicio de inferencia local en una unica GPU: el contenedor esta pensado para `hone-serve.exe`, de modo que un equipo puede desplegar el modelo en una sola tarjeta grafica sin infraestructura distribuida ni motores adicionales.
- Procesamiento de documentos largos: con una ventana de 131.072 tokens, el modelo puede ingerir contratos, informes o bases de codigo extensas en un unico contexto sin troceado previo.
- Razonamiento asistido con coste controlado: el parametro `--default-reasoning-effort low` permite ajustar el esfuerzo de razonamiento y, con ello, el consumo de tokens y la latencia en funcion de la tarea.
- Generacion de texto interactiva de baja latencia: la decodificacion especulativa con MTP y 3 tokens de borrador esta disenada para acelerar la generacion autoregresiva en cargas conversacionales.
- Despliegue en entornos con limitaciones de GPU: al caber en un fichero de 18,2 GB y ejecutarse en un solo dispositivo, encaja en estaciones de trabajo con una GPU de gama alta en lugar de clústeres multi-GPU.
- Evaluacion y desarrollo de kernels de cuantizacion: al exponer un layout `groupwise-int` y una KV cache `rk4v4-e8`, sirve como banco de pruebas para medir el efecto de la cuantizacion agrupada en calidad y rendimiento.
- Reproducibilidad de conversiones: gracias a `conversion.json` y al hash sha256 publicado, es util en flujos que exigen verificar la procedencia e integridad de los pesos.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

## Requisitos de hardware

- VRAM para inferencia: los pesos ocupan 18,2 GB en formato `groupwise-int`. Hay que sumar la memoria de la KV cache (dtype `rk4v4-e8`) y el estado del decodificador especulativo, cuyo consumo exacto no se documenta.
- GPU recomendadas: no se enumeran modelos concretos. El runtime hone esta descrito como servidor de inferencia para una sola GPU.
- GPU de consumo: es plausible que quepa en tarjetas de 24 GB (RTX 3090, RTX 4090) para contextos moderados, dado el tamano de los pesos; no esta confirmado para el maximo de 131.072 tokens.
- Offload de KV: el comando de ejemplo incluye `--host-kv-mib 2048`, lo que indica reserva de memoria host para la KV cache.
- Opciones de despliegue: exclusivamente hone (`hone-serve.exe`). No es compatible con otros runtimes; la propia model card indica que no se puede usar con vLLM, llama.cpp, Ollama ni TGI.
- Instalacion: `install.ps1 -Models swift`. El repositorio esta restringido (gated): hay que aceptar los terminos y configurar `HF_TOKEN` para descargarlo.
- Latencia y throughput: no disponible.

Comando de referencia facilitado por el autor:

```powershell
hone-serve.exe swift_1_5_qwen3_8_27b.hone --max-context 131072 --kv-capacity 131072 --kv-dtype rk4v4-e8 `
  --spec mtp --draft-tokens 3 --lm-head-draft --default-reasoning-effort low --host-kv-mib 2048
```

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Runtime | Licencia |
|---|---|---|---|---|---|
| tnculp/Swift-1.5-Qwen3.8-27B-hone | 27B (nominal) | 131.072 tokens | `.hone` (`groupwise-int`) | hone | Swift Open License v1.0 + Apache 2.0 |
| ukisai/Swift-1.5-Qwen3.8-27B (modelo base) | 27B (nominal) | no disponible | safetensors BF16 | generico | Swift Open License v1.0 + Apache 2.0 |
| Otros modelos comparables de ~27B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento que permitan comparar esta conversion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Compatibilidad restringida: el contenedor `.hone` solo funciona con el runtime hone. No es utilizable con vLLM, llama.cpp, Ollama, TGI ni con safetensors estandar.
- Conversion no oficial: no esta publicada ni respaldada por UkisAI; se trata de un reempaquetado de terceros.
- Sin datos de rendimiento: no hay benchmarks publicados, por lo que no puede estimarse su calidad frente al modelo base ni frente a alternativas.
- Sesgos y alucinacion: no se documenta informacion especifica sobre sesgos ni sobre tasas de alucinacion. Al ser una conversion sin cambios en los pesos, hereda las caracteristicas del modelo base, que tampoco se detallan.
- Idiomas: el campo de idiomas soportados aparece como no disponible.
- Licencia comercial condicionada: el uso comercial por parte de organizaciones con una facturacion anual bruta igual o superior a 1.000.000 USD requiere una Swift Enterprise License separada de UkisAI.
- Atribucion obligatoria: los avisos de atribucion deben conservarse (fichero `NOTICE` de UkisAI, sin modificar), conforme a la clausula 4(b) de ambas licencias.
- Repositorio restringido: la descarga exige aceptar los terminos y disponer de `HF_TOKEN`.
- Riesgo de integridad: al ser un contenedor binario unico, conviene verificar el sha256 publicado antes de desplegarlo.
- Fecha de publicacion atipica: el repositorio figura creado y actualizado el 2026-09-29, dato que conviene contrastar si se usa como referencia temporal.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tnculp/Swift-1.5-Qwen3.8-27B-hone
- Modelo base: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B (referenciado como ukisai/Swift-1.5-Qwen3.8-27b en la model card)
- Runtime hone: https://github.com/tnculp/hone
- Otros enlaces (papers, blogs, demos): no disponibles en la informacion proporcionada.
