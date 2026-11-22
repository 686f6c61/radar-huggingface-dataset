# staccs/Inkling-2-Mini-QWork-Q8

## Resumen
Inkling-2-Mini-QWork-Q8 es una cuantización Q8_0 del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario staccs. El interés principal no reside en el modelo conversacional en sí, sino en el componente QWork que lo acompaña: un mecanismo que permite al modelo ejecutar una cantidad limitada y determinista de trabajo computacional durante la generación, emitir un recibo verificable de forma independiente y reanudar la respuesta. El autor lo presenta explícitamente como una vista previa de ingeniería, no como un producto terminado.

El paquete se distribuye con pesos en formato GGUF Q8_0 respaldados por un decodificador ONNX único, con un tamaño de pesos de 27.820.099.264 bytes (aproximadamente 27,8 GB). La licencia declarada es Apache 2.0 y la arquitectura, el número de parámetros y la longitud de contexto del modelo base no se detallan en la información disponible. La ventana de contexto utilizada en las pruebas del autor es de 4.096 tokens.

La relevancia actual del proyecto es experimental: propone un modelo local capaz de generar recibos criptográficos verificables de trabajo realizado durante la inferencia, con aplicación potencial en sistemas de confianza distribuida derivados de Bitcoin (Qwencoin, hashfun). No obstante, la propia model card advierte que las funciones sociales, de sincronización entre pares y de minería durante el razonamiento aún no están integradas ni probadas de extremo a extremo en esta descarga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (decodificador único respaldado por ONNX; modelo base no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4.096 tokens en el entorno de prueba verificado; contexto máximo del modelo base no disponible |
| Tipos de cuantizacion | Q8_0 (este repositorio); el autor menciona IQ4_NL como alternativa en el proyecto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF Q8_0 (27.820.099.264 bytes) y ONNX (`actual-merged.onnx`) |

## Arquitectura y entrenamiento
La información disponible no describe la arquitectura interna del modelo base thinkingmachines/Inkling-2-Mini (tipo de transformer, número de capas, atención, etc.). Lo que sí se documenta es el stack de despliegue: un decodificador ONNX único con pesos GGUF Q8_0, ejecutado sobre Foundry Local SDK 2.5.0, ONNX Runtime 1.32.0 y GenAI 0.20.0, con aceleración mediante el execution provider WebGPU 0.6.0 forzado explícitamente en la configuración de prueba. No se aportan datos sobre tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO.

La innovación técnica destacable es QWork: un protocolo de trabajo determinista y acotado que el host autoriza para un solo turno. Cuando el modelo emite el disparador, el decodificador calcula un recibo verificable de forma independiente y después retoma la generación. QWork está desactivado por defecto y el texto del usuario no puede concederlo, lo que evita el spoofing. El formato Q8_0 afecta únicamente a la representación de los pesos, no al protocolo de recibos, y el autor no reclama ninguna mejora de calidad medida frente a IQ4.

## Capacidades
- Generación de texto conversacional en local, con contexto de prueba de 4.096 tokens.
- Ejecución de trabajo determinista acotado (QWork) durante la generación, con emisión de un recibo verificable y reanudación de la respuesta.
- Verificación offline de recibos mediante un verificador, tabla fijada y nonce/unidad esperados por turno.
- Control de acceso a QWork: activación explícita por parte del host (greedy u opt-in muestreado), sin posibilidad de concesión desde el texto del usuario.
- Recuperación tras cancelación: el sistema vuelve a una respuesta normal (2,37 s en la prueba registrada).
- Funciones sociales y FUN: previstas en el diseño v1, pero no integradas ni cualificadas en esta descarga.
- Sincronización entre pares, minería durante el razonamiento y difusión con aceptación por pares: no probadas de extremo a extremo desde esta descarga.
- Capacidades multilingües, tool calling, visión o audio: no disponibles en la información proporcionada.

## Casos de uso
- Verificación de trabajo en inferencia local: un host autoriza un turno con QWork, el modelo emite un recibo con digest y nonce, y otra máquina lo valida offline con el verificador y la tabla fijada. Adecuado porque el protocolo está diseñado para ser comprobable sin depender de un servicio en la nube.
- Auditoría de sesiones de chat: registrar los recibos por turno junto con el hash de los pesos permite reconstruir qué trabajo se ejecutó y en qué orden, útil en entornos donde se exige trazabilidad de la inferencia.
- Pruebas de integración de runtimes ONNX/WebGPU: el paquete sirve como banco de pruebas para Foundry Local SDK, ONNX Runtime y el EP WebGPU en Windows x64 con GPU AMD, dado que el autor documenta la configuración exacta y los hashes de los artefactos.
- Desarrollo de clientes de confianza distribuida: equipos que construyan sobre el diseño Qwencoin/hashfun pueden usar este preview para experimentar con el ciclo autorización-trabajo-recibo antes de que existan las funciones sociales y de red.
- Control negativo en pipelines de seguridad: el autor documenta que el texto del usuario no genera recibo y que una concesión caducada no se rearma en el turno siguiente, lo que permite construir tests de regresión frente a intentos de spoofing.
- Evaluación comparativa de cuantizaciones: con IQ4_NL disponible en el mismo proyecto, el Q8_0 permite medir el coste de espacio (un 58 % más de tamaño en Windows) y el comportamiento en hardware con memoria suficiente, sin asumir mejoras de calidad.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta pruebas funcionales del componente: 5/5 tests de modelo real superados en Windows x64 (AMD Radeon 8060S, 128 GB), con recibos exactos en modo greedy y muestreado opt-in, parada natural en el caso greedy, ausencia de rearme de una concesión caducada, ausencia de recibo ante spoofing por texto de usuario y recuperación tras cancelación en 2,37 s.

| Prueba funcional | Resultado reportado |
|---|---|
| Modelo real, Windows x64 | 5/5 superadas |
| Recibo exacto con opt-in greedy | Sí, con parada natural |
| Recibo exacto con opt-in muestreado | Sí |
| Rearme de concesión caducada | No |
| Recibo ante spoofing por texto | No |
| Recuperación tras cancelación | 2,37 s, turno posterior hasta parada natural |
| Pass en Mac con Q8 | No reclamado |

## Requisitos de hardware
- Pesos Q8_0 de 27.820.099.264 bytes (unos 27,8 GB); el archivo de pesos en Windows es aproximadamente un 58 % mayor que IQ4_NL.
- Configuración verificada: Windows x64, AMD Radeon 8060S, 128 GB de RAM, Foundry Local SDK 2.5.0, ONNX Runtime 1.32.0, GenAI 0.20.0 y WebGPU EP 0.6.0 mediante override explícito.
- El autor advierte explícitamente de no usar esta build Q8_0 en un Mac con M5 de 24 GB; los resultados en Mac con IQ4 no establecen que Q8 quepa ni se comporte igual en un M3 de 36 GB.
- No se extrapola ninguna estimación mínima de RAM a partir de la máquina de cualificación de 128 GB.
- Opciones de despliegue documentadas: Foundry Local SDK con ONNX Runtime y GenAI; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles, salvo el dato de recuperación tras cancelación de 2,37 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| staccs/Inkling-2-Mini-QWork-Q8 | no disponible | 4.096 en pruebas | GGUF Q8_0 + ONNX | Apache 2.0 | Preview de ingeniería, solo Windows cualificado |
| IQ4 del mismo proyecto (Inkling 2 Mini + QWork) | no disponible | 4.096 en pruebas | IQ4 (GGUF/ONNX) | Apache 2.0 | Cualificado también en Mac según el autor |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva esta cuantización |

No se dispone de información sobre otros modelos comparables de la misma categoría en los datos proporcionados.

## Limitaciones y advertencias
- Vista previa de ingeniería: los archivos no implementan el contrato completo de la versión v1; las funciones sociales, FUN, sincronización entre pares, minería durante el razonamiento y difusión no están integradas ni cualificadas.
- Un recibo QWork no prueba un pago, la publicación de un mensaje ni la veracidad de una respuesta; solo acredita que se realizó el trabajo determinista acotado.
- Q8_0 es un formato de pesos, no un protocolo de recibo distinto, y no hay evidencia de mejora de calidad medida frente a IQ4.
- Solo se ha cualificado en Windows x64 con GPU AMD y WebGPU EP; no hay pass reclamado en Mac con Q8 y se desaconseja su uso en M5 de 24 GB.
- No se ofrece estimación mínima de RAM extrapolada; el requisito real en otros equipos es desconocido.
- El preview no incrusta el sitio de hashfun, no ejecuta un nodo, no custodia claves, no lanza una cadena ni envía transacciones.
- El diseño Qwencoin se presenta como derivado de Bitcoin y no modifica la red principal de Bitcoin; busca encarecer identidades falsas coordinadas, no eliminarlas.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales.
- Los tests negativos pueden superar su aserción de ausencia de recibo sin alcanzar EOS, por lo que la validación debe combinarse con otras comprobaciones.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/staccs/Inkling-2-Mini-QWork-Q8
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Superficie del proyecto hashfun: https://aichat.fyi/fun/
