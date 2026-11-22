# SourceHat-Labs/Inkling-2-Mini-EXL3-3.03bpw

## Resumen

Inkling-2-Mini-EXL3-3.03bpw es una cuantizacion en formato EXL3 del modelo Inkling 2 Mini desarrollado por Thinking Machines. El checkpoint original, publicado por Thinking Machines, ya venia empaquetado en precision mixta NVFP4 y MXFP8; esta version de SourceHat-Labs lo reconvierte a expertos enrutados EXL3 de 2,0/2,5/4,0 bpw con una cabeza de salida INT8 agrupada, alcanzando un peso efectivo de 3,03 bits por parametro. Su relevancia radica en comprimir un modelo de casi 6.000 millones de parametros hasta unos 10 GB de pesos, con el objetivo declarado de servir una peticion de 262.144 tokens en una GPU fisica de 16 GiB.

El modelo base es un transformer con decoder de tres pasadas fijas y arquitectura de mezcla de expertos (MoE) en las capas que el autor denomina "routed experts", ademas de capacidades de vision y un borrador nativo DSpark para decodificacion especulativa. Esta ficha describe exclusivamente el checkpoint cuantizado; los detalles de entrenamiento, dataset y evaluacion del modelo original no se incluyen en la informacion disponible y deben consultarse en la model card de Thinking Machines.

Se trata de un checkpoint solo de pesos: no incluye runtime y no es cargable directamente con Transformers estandar ni con ExLlamaV3 de serie. Requiere un runtime compatible con Inkling (decoder de tres pasadas, expertos EXL3, vision y DSpark nativo), lo que limita su uso a entornos de despliegue adaptados especificamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con decoder de tres pasadas fijas y expertos enrutados (MoE); incluye vision y borrador nativo DSpark |
| Parametros totales | 5.928.607.272 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (objetivo de servicio declarado) |
| Tipos de cuantizacion | EXL3 con expertos enrutados a 2,0/2,5/4,0 bpw y cabeza de salida INT8 agrupada; 3,030017 bpw efectivos |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (sujeta a la Model Acceptable Use Policy de Thinking Machines) |
| Formato de pesos | safetensors (EXL3, solo pesos) |

## Arquitectura y entrenamiento

El checkpoint es una conversion de pesos del Inkling 2 Mini post-entrenado en la revision `ed40e7da625f594fc9c4990f5f66be24873c22d7`. El origen ya estaba empaquetado en precision mixta NVFP4 y MXFP8; la conversion a EXL3 no anadio entrenamiento ni ajuste fino, es puramente de cuantizacion. La arquitectura subyacente combina un decoder de tres pasadas fijas con capas de expertos enrutados, a las que se suman un modulo de vision y un borrador nativo DSpark (327.863.072 bytes de tensores) para decodificacion especulativa.

El payload de tensores del checkpoint objetivo es de 9.993.910.864 bytes con 3,030017 bpw efectivos. El autor advierte explicitamente que estas cifras son tamanos de pesos, no mediciones de memoria CUDA. No se dispone de informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO en el material proporcionado.

## Capacidades

- Generacion de texto y razonamiento mediante el modelo base post-entrenado Inkling 2 Mini.
- Procesamiento de vision: el checkpoint conserva los tensores del modulo de vision del modelo original.
- Decodificacion especulativa nativa mediante el borrador DSpark incluido en el pack.
- Manejo de contexto muy largo: el objetivo de servicio es una peticion de 262.144 tokens.
- Soporte de tool calling, function calling y agentes: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de documentos extensos: el checkpoint esta disenado para servir una peticion de 262.144 tokens en una GPU de 16 GiB, lo que permite procesar libros, expedientes o bases de codigo completas en una sola pasada sin trocear el contexto.
- Despliegue en hardware de gama media: al comprimir los pesos a unos 10 GB en formato EXL3, resulta adecuado para entornos con una unica GPU de 16 GiB donde un modelo de 6.000 millones en BF16 no cabria junto con el contexto.
- Extraccion de informacion de documentos escaneados o imagenes: el modulo de vision conservado permite tareas de lectura de documentos, descripcion de imagenes o conversion de capturas a texto estructurado.
- Generacion asistida con baja latencia: el borrador DSpark nativo habilita decodificacion especulativa, util en asistentes interactivos donde importa el tiempo por token.
- Investigacion en cuantizacion: sirve como referencia para estudiar el impacto de la cuantizacion EXL3 mixta (2,0/2,5/4,0 bpw) frente al empaquetado NVFP4/MXFP8 original en tareas de razonamiento y vision.
- Evaluacion de runtimes alternativos: al no cargar en Transformers ni ExLlamaV3 estandar, es un banco de pruebas para validar implementaciones de runtimes compatibles con Inkling (decoder de tres pasadas y expertos EXL3).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las mediciones de servicio y evaluacion emparejada son independientes de la publicacion de pesos.

## Requisitos de hardware

- VRAM estimada: los pesos suman 9.993.910.864 bytes (unos 9,3 GiB) mas 327.863.072 bytes del borrador DSpark (unos 0,3 GiB); el autor no publica mediciones de memoria CUDA, solo tamanos de tensores.
- Objetivo de servicio declarado: una peticion de 262.144 tokens en una GPU fisica de 16 GiB.
- GPU recomendadas: no disponible. El unico requisito concreto es una GPU de 16 GiB para el escenario de contexto completo; para otros escenarios no hay datos.
- GPU de consumo: cabe en tarjetas de 16 GiB (por ejemplo, RTX 4080 o RTX 4060 Ti de 16 GiB) segun el objetivo del autor, aunque no se confirma compatibilidad con modelos concretos.
- Opciones de despliegue: requiere un runtime compatible con Inkling que soporte el decoder de tres pasadas, expertos EXL3, vision y DSpark nativo. Transformers estandar y ExLlamaV3 no cargan este pack directamente; vLLM, llama.cpp, Ollama y TGI no estan confirmados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-EXL3-3.03bpw | 5.928.607.272 | 262.144 tokens | EXL3 3,03 bpw efectivos | Apache 2.0 | Hugging Face, requiere runtime Inkling |
| thinkingmachines/Inkling-2-Mini (original) | no disponible | no disponible | NVFP4/MXFP8 mixto | Apache 2.0 | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint solo de pesos: no incluye runtime y no se carga con Transformers estandar ni ExLlamaV3 de serie; sin un runtime compatible con Inkling el modelo es inutilizable.
- La conversion no anade entrenamiento; cualquier sesgo o limitacion del modelo base Inkling 2 Mini se hereda intacto.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos generativos.
- Idiomas soportados no declarados: no se puede garantizar el comportamiento en castellano ni en otros idiomas.
- Los tamanos indicados son de pesos, no de memoria CUDA; el consumo real en inferencia con contexto de 262.144 tokens puede superar los 16 GiB si no se aplican tecnicas de gestion de KV cache.
- Uso comercial permitido por Apache 2.0, pero sujeto a la Model Acceptable Use Policy de Thinking Machines, que puede imponer restricciones adicionales.
- Repositorio sin descargas ni likes en el momento de la consulta y publicado por un tercero (SourceHat-Labs), no por el desarrollador original: conviene verificar la integridad de los pesos antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/SourceHat-Labs/Inkling-2-Mini-EXL3-3.03bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
