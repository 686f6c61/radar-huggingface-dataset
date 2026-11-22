# yonlyyone/Inkling-2-Mini-g13-q3-bf16

## Resumen

Inkling-2-Mini-g13-q3-bf16 es una distribucion cuantizada del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario yonlyyone bajo licencia Apache 2.0. Se trata de una build en formato MLX (safetensors con pesos BF16) generada con la herramienta `g13 convert` del motor g13-engine, pensada especificamente para GPUs integradas de Apple Silicon de las familias M4 y M5. El modelo conserva el encoder de vision completo (`vision_tower.*`, 422 tensores) del modelo original, por lo que mantiene capacidades multimodales.

El repositorio contiene 26.388.641.280 parametros (aproximadamente 26,4 mil millones) y ocupa 13,0 GB en disco, lo que sugiere una representacion mixta: los tags indican "4-bit" y "q3-bf16", de modo que parte de los pesos se almacenan en cuantizacion de 3-4 bits y otros en BF16 nativo. La libreria declarada es `mlx`, y el pipeline no esta especificado en la informacion disponible.

La relevancia de esta ficha es acotada: se trata de una publicacion reciente (22 de noviembre de 2026) sin descargas ni likes, sin model card detallada mas alla de las instrucciones de uso, y sin datos publicados de benchmarks, contexto, composicion del dataset de entrenamiento ni idiomas soportados. Toda la informacion tecnica adicional debe consultarse en el modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: thinkingmachines/Inkling-2-Mini; tag `inkling2_loop` sugiere variante con bucle/recurrencia, sin confirmar) |
| Parametros totales | 26.388.641.280 (~26,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | mixta: q3/4-bit segun tags (`4-bit`, `q3-bf16`) con pesos BF16 nativos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), BF16 nativo |
| Tamano del repositorio | 13,0 GB |
| Libreria / runtime | MLX (Apple Silicon) |
| Vision encoder | incluido (`vision_tower.*`, 422 tensores) |
| Hardware objetivo | Apple Silicon M4 / M5 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El tag `inkling2_loop` presente en el repositorio podria indicar algun tipo de mecanismo de bucle o recurrencia en las capas, pero no hay confirmacion tecnica al respecto. Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o similares.

Lo unico documentado es el proceso de conversion: la build se ha generado con `g13 convert` sobre el modelo thinkingmachines/Inkling-2-Mini, preservando el encoder de vision y el proyector multimodal. La cuantizacion es mixta, con pesos en BF16 nativo para las capas criticas y compresion a 3-4 bits en el resto, lo que reduce el peso total a 13 GB frente a los aproximadamente 52 GB que ocuparia el modelo en BF16 puro.

## Capacidades

- Generacion de texto y razonamiento: capacidades heredadas del modelo base Inkling-2-Mini, sin detalle publicado.
- Vision: el repositorio incluye el encoder de vision completo (422 tensores), por lo que el modelo puede procesar imagenes. En Macs de 16-24 GB, `g13` desactiva la vision por defecto para ahorrar unos 620 MiB de VRAM; se activa con `g13 serve --vision on`.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el caso de uso principal y documentado. Un usuario con un Mac M4 o M5 puede ejecutar el modelo con `g13 serve --model yonlyyone/Inkling-2-Mini-g13-q3-bf16`, aprovechando la memoria unificada y el backend MLX sin necesidad de GPU dedicada.
- Procesamiento de imagenes en local con vision activada: en equipos con mas de 24 GB de memoria unificada, activar `--vision on` permite tareas de descripcion de imagenes, OCR o VQA sin enviar datos a la nube.
- Prototipado de aplicaciones multimodales en portatiles: desarrolladores que quieran validar flujos de vision-lenguaje antes de desplegar en servidores pueden usar esta build como entorno de desarrollo.
- Evaluacion comparativa de cuantizaciones: util para investigadores que quieran medir la perdida de calidad de una cuantizacion mixta 3/4-bit + BF16 frente al modelo base completo.
- Despliegue en entornos con restricciones de privacidad: al ejecutarse integramente en local, es adecuado para procesar documentos o imagenes sensibles sin salida a Internet.
- Base para ajuste fino ligero o experimentacion con MLX: al estar en safetensors y bajo Apache 2.0, sirve como punto de partida para experimentos con el ecosistema MLX en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada estimada: el repo pesa 13,0 GB, por lo que se necesita al menos esa cantidad mas overhead de runtime. La model card menciona explicitamente Macs de 16-24 GB como rango objetivo, con la vision desactivada por defecto para ahorrar ~620 MiB.
- GPU recomendadas: Apple Silicon M4 y M5 (unica familia soportada por el runtime `g13`/MLX segun la model card).
- Compatibilidad con GPU consumer NVIDIA: no disponible; el formato es MLX, no GGUF ni safetensors estandar para transformers.
- Opciones de despliegue: `g13 serve` (motor propio del autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-g13-q3-bf16 (este) | ~26,4 B | no disponible | MLX safetensors BF16/mixto | Apache 2.0 | Solo Apple Silicon, runtime g13 |
| thinkingmachines/Inkling-2-Mini (base) | ~26,4 B (presumible) | no disponible | no disponible | no disponible | Modelo original sin cuantizar |
| Alternativas de ~25-30 B en MLX | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con modelos alternativos de la misma categoria.

## Limitaciones y advertencias

- Dependencia exclusiva de Apple Silicon: el formato MLX y el runtime `g13` no son compatibles con GPUs NVIDIA, AMD ni con el stack estandar de transformers, lo que limita su portabilidad.
- Cuantizacion agresiva: la mezcla de 3-4 bits con BF16 puede degradar la calidad respecto al modelo base, especialmente en tareas de razonamiento y codigo; no se han publicado evaluaciones que cuantifiquen esta perdida.
- Vision desactivada por defecto en equipos de 16-24 GB: los usuarios deben recordar activarla manualmente con `--vision on` si la necesitan.
- Sin model card detallada: no hay informacion sobre sesgos, idiomas, contexto maximo, datos de entrenamiento ni riesgos de alucinacion especificos.
- Publicacion sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero al ser una derivacion del modelo base, conviene verificar que la licencia del modelo original (thinkingmachines/Inkling-2-Mini) sea compatible y no imponga restricciones adicionales.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yonlyyone/Inkling-2-Mini-g13-q3-bf16
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Motor g13-engine: https://github.com/yonlyyone/g13-engine
