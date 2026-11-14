# Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP4

## Resumen

Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP4 es una exportación cuantizada del modelo Qwen/Qwen3-4B-SafeRL, empaquetada por Xylolabs para su ejecución sobre aceleradores Tenstorrent con arquitectura Tensix. El modelo base es un transformer denso de Qwen con 4.411.424.256 parámetros totales, derivado de la familia Qwen3, y esta exportación aplica cuantización de bloque en coma flotante (block floating point, BFP) de 4 bits sobre las proyecciones del decodificador, manteniendo el resto de tensores en BF16.

El interés de esta ficha no reside en un nuevo modelo de lenguaje, sino en el formato de despliegue: 252 proyecciones declaradas del decodificador se almacenan como `bfloat4_b` (4,5 bits por peso) mediante GPTQ con búsqueda de exponente por bloque, mientras que el embedding, la cabeza atada explícita y otros 147 tensores permanecen en BF16. El resultado ocupa aproximadamente 3,60 GB de memoria de dispositivo para los pesos del modelo de lenguaje, sin contar caché KV ni buffers, lo que lo hace viable en hardware Tensix con recursos limitados.

La relevancia es doble: por un lado, demuestra un pipeline de cuantización específico para TT-NN/tt-metal con verificaciones de empaquetado nativo; por otro, valida que la pérdida de calidad respecto al BF16 original se mantiene dentro de márgenes controlados (KL media de 0,067 frente a 0 en el original). Es un artefacto para desarrolladores que trabajan con el stack de Tenstorrent, no un modelo generalista para inferencia convencional en GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con proyecciones del decodificador cuantizadas a BFP4 |
| Parametros totales | 4.411.424.256 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`, 4,5 bits por peso) en 252 proyecciones del decodificador, GPTQ con damping 0,1; BF16 en embedding, cabeza atada y 147 tensores adicionales |
| Idiomas soportados | Ingles y coreano (segun model card y dataset de calibracion) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `quant4.json` e `model.safetensors.index.json` para mapeo de formatos) |
| Tamano del repo | 8,8 GB |
| Memoria de dispositivo (pesos LM) | ~3,60 GB (6,53 bits por peso almacenado); ~2,82 GB compartiendo la cabeza atada una vez (5,613 bits por peso unico) |
| Libreria | transformers 5.23.0 con PyTorch |
| Hardware objetivo | Tenstorrent Tensix (TT-NN, tt-metal) |
| Fecha de publicacion | 13 de noviembre de 2026 |

## Arquitectura y entrenamiento

El modelo base Qwen3-4B-SafeRL es un transformer denso de la familia Qwen3 con 4.411.424.256 parametros. Esta exportacion no reentrena el modelo: parte de los pesos originales y aplica un proceso de cuantizacion post-entrenamiento sobre las 252 proyecciones declaradas del decodificador. La tecnica combina GPTQ con busqueda de exponente por bloque para producir representaciones `bfloat4_b` sobre rejillas de bloque en coma flotante, almacenadas en BF16 sobre dicha rejilla. El calibrado de GPTQ utiliza damping 0,1 y 65.536 tokens procedentes de WikiText-2 y de Wikipedia en coreano, lo que explica la cobertura linguistica declarada (ingles y coreano).

La innovacion tecnica principal es el empaquetado nativo para TT-NN: las 252 matrices pasan las comprobaciones de rejilla y de empaquetado nativo de TT-NN, incluido el empaquetado como BFP8, y el ejemplo de referencia se valida sobre el simulador Blackhole con TT-NN 0.81.1. La verificacion se realiza con dos scripts incluidos (`pack_tensix.py` y `verify_grid.py`), que comprueban la representacion de cada matriz cuantizada y, opcionalmente, realizan un ciclo completo de ida y vuelta por DRAM del dispositivo. No se proporciona informacion sobre el entrenamiento original del modelo base (composicion del dataset, tokens totales, RLHF/DPO) en la informacion disponible; solo se sabe que el sufijo "SafeRL" indica un ajuste orientado a seguridad por parte de Qwen.

## Capacidades

- Generacion de texto conversacional en ingles y coreano, con plantilla de chat original preservada.
- Modo thinking opcional, controlable mediante el template original (`enable_thinking`); el ejemplo de la model card lo desactiva explícitamente.
- Razonamiento multi-turno en formato chat, con el tokenizador y la plantilla originales intactos.
- Capacidades heredadas del modelo base Qwen3-4B-SafeRL, incluyendo generacion de codigo y matematicas (no se detallan niveles de rendimiento en la informacion disponible).
- Alineamiento de seguridad reforzado por el ajuste SafeRL del modelo base.
- Inferencia sobre hardware Tenstorrent Tensix mediante TT-NN, con soporte de empaquetado BFP4 y BFP8.
- No se documenta soporte de tool calling, function calling, vision ni audio en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el caso principal. Un equipo con hardware Tensix (por ejemplo, tarjetas Blackhole o Wormhole) puede cargar este checkpoint directamente en TT-NN y ejecutar inferencia de un modelo de 4B con solo ~3,60 GB de pesos en DRAM de dispositivo, liberando memoria para cache KV y buffers.
- Investigacion en cuantizacion BFP: util como referencia reproducible para estudiar el impacto de BFP4 con GPTQ por bloques frente a cuantizaciones enteras como Q4_K_M, con metricas KL documentadas sobre textos en ingles y coreano.
- Evaluacion de pipelines de empaquetado TT-NN: los scripts `pack_tensix.py` y `verify_grid.py` permiten validar la cadena de conversion y el empaquetado nativo antes de integrar el modelo en un pipeline de produccion sobre Tensix.
- Asistentes conversacionales en ingles y coreano: el modelo conserva la plantilla de chat y el tokenizador originales, por lo que puede integrarse en aplicaciones de atencion al cliente o asistentes internos en esos dos idiomas, siempre que el backend sea Tensix.
- Generacion de codigo y tareas de razonamiento en entornos con hardware Tenstorrent: al heredar las capacidades de Qwen3-4B-SafeRL, puede emplearse en autocompletado o generacion de fragmentos en herramientas de desarrollo desplegadas sobre este hardware.
- Validacion de calidad de cuantizaciones: el perfil de evaluacion incluido (KL media, aciertos normales y de thinking) sirve como plantilla para comparar futuras exportaciones BFP contra el BF16 original y contra cuantizaciones de referencia como Q4_K_M.
- Pruebas en simulador: el ejemplo de la model card se valida sobre el simulador Blackhole, lo que permite desarrollar y depurar integraciones TT-NN sin disponer de hardware fisico.

## Benchmarks y rendimiento

La model card incluye una evaluacion de calidad de la cuantizacion basada en divergencia KL y recuento de aciertos, no benchmarks estandar de tareas (MMLU, HumanEval, GSM8K). Los datos disponibles son:

| Perfil | KL media | Aciertos normales / 33 | Aciertos thinking / 7 | Perdidas normales contadas |
|---|---:|---:|---:|---:|
| BF16 original | 0 | 28 | 7 | — |
| Esta exportacion (BFP4) | 0,067215654 | 28 | 7 | 1 |
| Q4_K_M emparejado | 0,061407450 | 29 | 7 | 0 |

La KL se calcula sobre 16.240 posiciones puntuadas con los mismos textos en ingles y coreano (raw y chat, cuatro fragmentos de cada uno). El suelo de referencia BF16 de llama.cpp es 0,000316937. La exportacion cumple la regla relativa 7: su KL es 1,094585 veces la referencia, dentro del limite de 1,5 veces, con como maximo una perdida adicional contada. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, y la model card indica explicitamente que no se reportan datos de velocidad.

## Requisitos de hardware

- VRAM/memoria de dispositivo: ~3,60 GB para los pesos del modelo de lenguaje (incluyendo ambas copias explicitas de embedding y cabeza), mas espacio para cache KV y buffers. Compartiendo la cabeza atada una vez, los pesos bajan a ~2,82 GB.
- Hardware objetivo: aceleradores Tenstorrent con arquitectura Tensix (TT-NN, tt-metal). El ejemplo de referencia se valida sobre el simulador Blackhole con TT-NN 0.81.1.
- GPU consumer: no es el objetivo de esta exportacion; el formato BFP4 esta pensado para el empaquetado nativo de TT-NN. No se documenta su uso en RTX 4090, A100 ni H100 en la informacion disponible.
- Despliegue: TT-NN con `ttnn.as_tensor` en layout TILE y memoria DRAM; tambien es cargable con Transformers 5.23.0 y PyTorch usando `dtype="bfloat16"` y `device_map="auto"`, aunque en ese caso se pierde la ventaja del empaquetado Tensix.
- Herramientas de validacion: `pack_tensix.py` (comprueba cada matriz cuantizada, con `--device` para ciclo por DRAM) y `verify_grid.py` (comprobacion de rejilla solo con torch).
- Latencia y throughput: no disponible. La model card indica explicitamente que no se reportan datos de velocidad y que las comprobaciones son sobre pesos guardados en host.
- Nota: tt-transformers y tt-forge no fueron verificados con este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato/cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP4 | 4,41 B | No disponible | BFP4 GPTQ + BF16 (safetensors) | Apache 2.0 | Tenstorrent Tensix |
| Qwen/Qwen3-4B-SafeRL (base) | 4,41 B | No disponible | BF16 | Apache 2.0 | GPU/CPU convencional |
| Q4_K_M emparejado (referencia de evaluacion) | 4,41 B | No disponible | GGUF Q4_K_M | Apache 2.0 (heredada) | CPU/GPU via llama.cpp |

La comparativa se limita al modelo base y a la cuantizacion de referencia empleada en la evaluacion, ya que no se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada. En terminos de calidad medida por KL, la exportacion BFP4 (0,0672) queda ligeramente por encima de Q4_K_M (0,0614) y muy lejos del BF16 original (0), con un acierto normal de 28/33 frente a 29/33 de Q4_K_M y 28/33 del original.

## Limitaciones y advertencias

- Modelo derivado: no es un modelo nuevo, sino una cuantizacion del base Qwen/Qwen3-4B-SafeRL; hereda sus sesgos y limitaciones, que no se detallan en la informacion disponible.
- Riesgo de alucinacion: inherente al modelo base de 4B; la cuantizacion BFP4 anade una perdida de calidad medible (KL media 0,0672 frente a 0 en BF16).
- Perdida adicional contada: la evaluacion registra una perdida normal adicional respecto al BF16 original (1 frente a 0), aceptada por la regla relativa pero no por la comprobacion estricta solo-normal.
- Cobertura linguistica limitada: solo se declaran ingles y coreano; el calibrado de GPTQ uso WikiText-2 y Wikipedia en coreano, por lo que el rendimiento en otros idiomas no esta validado.
- Contexto: la longitud de contexto no se especifica en la informacion disponible; debe consultarse la model card del modelo base antes de desplegar cargas con ventanas largas.
- Dependencia de hardware: el formato esta disenado para TT-NN/Tensix; fuera de ese stack se pierde la ventaja de memoria y debe cargarse como BF16.
- Verificacion parcial: tt-transformers y tt-forge no fueron comprobados con este checkpoint; las comprobaciones son de representacion y de pesos guardados, no de velocidad ni de inferencia completa en dispositivo fisico (el ejemplo se valido en simulador Blackhole).
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y verificarse las obligaciones heredadas del modelo base.
- Madurez: 26 descargas y 0 likes en el momento de la ficha; artefacto reciente (noviembre de 2026) sin adopcion comunitaria significativa.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-SafeRL
- Repositorio de codigo (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Licencia: https://huggingface.co/Xylolabs/Qwen3-4B-SafeRL-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
