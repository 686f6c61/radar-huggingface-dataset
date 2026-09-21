# trevor000/Qwen3.6-35B-A3B-I-Mini-RTX4070

## Resumen

Este repositorio es un espejo (mirror) con atribución del modelo `mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF`, publicado por el usuario trevor000 como artefacto de investigación para GPU de gama media. No se trata de un entrenamiento propio: los pesos son contenido upstream sin modificar, en formato GGUF y con la cuantización denominada "I-Mini" (14.272.221.568 bytes, verificada por SHA256 contra el fichero `provenance.json` de la revisión `acb957d8dd1e806dadefc056daeb4ccf4d329287`). El modelo base declarado es `Qwen/Qwen3.6-35B-A3B`, con destilación de razonamiento por lordx64 y cuantización APEX a cargo del equipo LocalAI/APEX.

La relevancia de esta ficha es acotada y conviene entenderla bien: se trata de un artefacto de investigación orientado a ejecutar un modelo MoE de 35.505.251.456 parámetros totales en una RTX 4070 (12 GB de VRAM) mediante offload parcial de tensores de expertos a CPU. El autor publica un baseline de velocidad reproducido con `llama.cpp` (commit `3f545beccee69d9975f466ec7e45fd9aacd8ba90`): 94,656 tok/s de decodificación mediana en servidor y 88,386 tok/s de throughput mediano extremo a extremo, con enrutamiento top-k8, KV en Q8 y 16K de contexto asignado.

No se han publicado evaluaciones de calidad (MMLU, HumanEval, GSM8K ni similares) en la información disponible, ni datos de idiomas soportados, ni un desglose de variantes de cuantización. El propio autor advierte de que las comprobaciones realizadas son estrechas y no establecen inteligencia general ni memoria perfecta en contexto largo. El repositorio figura con 0 descargas y 0 likes en el momento de la consulta, y no es una release oficial de Qwen, LocalAI ni APEX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer, segun las etiquetas `moe` y `qwen3.6` del repositorio |
| Parametros totales | 35.505.251.456 (dato safetensors del modelo base) |
| Parametros activos | No disponible de forma explicita; la nomenclatura `A3B` del nombre sugiere del orden de 3.000 millones de parametros activos, sin confirmar en la informacion proporcionada |
| Longitud de contexto | No disponible. En el baseline del autor se asignaron 16K tokens de contexto; se verificaron comprobaciones de recuperacion con entradas de 12.564 y 12.766 tokens |
| Tipos de cuantizacion | GGUF con cuantizacion "I-Mini" (artefacto de 14.272.221.568 bytes, verificado por SHA256). Incluye etiqueta `imatrix`. No se detallan otras variantes en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base Qwen) |
| Formato de pesos | GGUF para llama.cpp |
| Tamano del repositorio | 14,3 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Cadena de procedencia | lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled, cuantizado por LocalAI/APEX, con MTP de Qwen incluido |
| Libreria | llama.cpp |
| Revision de origen | acb957d8dd1e806dadefc056daeb4ccf4d329287 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de las etiquetas del repositorio: `moe` (mezcla de expertos) y `mtp` (multi-token prediction, el mecanismo de prediccion multi-token incluido por Qwen). El modelo es un transformer con capas de expertos, por lo que solo una fraccion de los 35.500 millones de parametros totales se activa por token; la nomenclatura `A3B` apunta a unos 3.000 millones de parametros activos, aunque este dato no aparece confirmado en la documentacion facilitada. Esta caracteristica es la que permite ejecutarlo en hardware de gama media colocando parte de los tensores de expertos en CPU.

En cuanto al entrenamiento, este repositorio no entrena nada: es un espejo con atribucion. La cadena es una destilacion de razonamiento al estilo Claude (lordx64) sobre el modelo base Qwen3.6-35B-A3B, seguida de una cuantizacion APEX con `imatrix` y empaquetado en GGUF. No hay datos publicados sobre numero de tokens de entrenamiento, composicion del dataset, ni sobre si hubo RLHF o DPO en la fase de destilacion. La innovacion tecnica relevante que si se documenta es de despliegue: el uso de MTP en `llama.cpp` y una configuracion con enrutamiento top-k8 y colocacion de tensores de expertos de los bloques 33-40 en CPU, con lote y microlote de 1024/128.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta `conversational`, y el baseline se midio con prompts de 512 tokens en modo servidor.
- Razonamiento destilado: el nombre completo del modelo upstream indica una destilacion de razonamiento estilo Claude 4.7 Opus. No se han publicado evaluaciones que cuantifiquen esta capacidad.
- Recuperacion de hechos en contexto largo: se documento una comprobacion de recuperacion de hechos corregidos con entradas de 12.564 tokens y, con historial real de conversacion, de 12.766 tokens.
- Prediccion multi-token (MTP): el artefacto incluye MTP de Qwen, lo que permite decodificacion especulativa con las builds de `llama.cpp` que lo soportan.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere integracion con servidores de inferencia compatibles con API de estilo OpenAI, si bien no se detalla el alcance.
- Multilingue: no disponible. El modelo base Qwen es multilingue, pero este repositorio no declara idiomas soportados.
- Tool calling / function calling: no disponible. No se menciona en la informacion proporcionada.
- Vision o audio: no disponible. No hay indicios de capacidades multimodales.
- Modo de pensamiento explicito (thinking mode): no disponible como capacidad documentada en este repositorio.

## Casos de uso

- Inferencia local en GPU de gama media: el escenario central del artefacto es ejecutar un MoE de 35.505 millones de parametros en una RTX 4070 de 12 GB colocando los tensores de expertos de los bloques 33-40 en CPU. Es adecuado porque el autor publica el baseline exacto de esa configuracion, con 94,656 tok/s de decodificacion mediana.
- Reproduccion de baselines de rendimiento: sirve como control de velocidad en `llama.cpp` para comparar configuraciones de cache y prefetch. El autor indica que los experimentos adicionales de cache y prefetch se mantienen separados de este baseline.
- Asistente conversacional offline: con Q8 KV y 16K de contexto asignado, es viable montar un asistente local con historial de conversacion de hasta unos 12.700 tokens verificados, con decodificacion en torno a 86-87 tok/s en ese regimen.
- Recuperacion aumentada (RAG) de contexto medio: la comprobacion de recuperacion de hechos a 12.564 tokens de entrada respalda su uso en pipelines de RAG donde el contexto recuperado ronda los 12.000 tokens, teniendo en cuenta que el prefill con historial en frio tardo unos 26 segundos.
- Evaluacion de cuantizaciones GGUF para investigacion: equipos que comparan tecnicas de cuantizacion (APEX, I-Mini, `imatrix`) pueden usar este artefacto como referencia reproducible con hash verificado.
- Servidor de inferencia ligero para prototipos: la etiqueta `endpoints_compatible` y el formato GGUF permiten levantar un endpoint local de bajo coste para pruebas de integracion, sin depender de GPU de datacenter.
- Docencia y experimentacion con MoE y offload en hardware de consumo: resulta util para ilustrar el compromiso entre VRAM, offload de expertos a CPU y throughput resultante, con cifras concretas de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos de rendimiento documentados son mediciones de velocidad del autor en una configuracion concreta:

| Metrica | Valor | Condiciones |
|---|---|---|
| Decodificacion mediana en servidor | 94,656 tok/s | 3 ejecuciones de 512 tokens, temperatura 0, top-k8, KV en Q8, 16K de contexto, expertos de bloques 33-40 en CPU, lote/microlote 1024/128 |
| Throughput mediano extremo a extremo | 88,386 tok/s | Mismas condiciones que la fila anterior |
| Decodificacion con contexto largo | 86-87 tok/s | Entrada de 12.564 tokens y de 12.766 tokens con historial real de conversacion |
| Prefill con historial en frio | ~26 s | Entrada de ~12.700 tokens |

El autor senala explicitamente que se trata de un control de velocidad inicial recuperado y no de una evaluacion amplia de calidad, y que los resultados historicos con top-k reducido son cambios de enrutamiento aproximados que no constituyen el valor por defecto recomendado.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa 14.272.221.568 bytes (aproximadamente 13,3 GiB). No cabe completo en una GPU de 12 GB, por lo que requiere offload parcial de tensores de expertos a CPU o una GPU con 16 GB o mas de VRAM para alojarlo completo.
- GPU utilizadas en el baseline publicado: NVIDIA RTX 4070 (12 GB), con colocacion de los tensores de expertos de los bloques 33-40 en CPU.
- GPU recomendadas para alojamiento completo: no disponible de forma explicita; por tamano del artefacto, una GPU con 16 GB o mas de VRAM (por ejemplo, RTX 4080/4090 de 16-24 GB) permitiria evitar el offload parcial. Para despliegues multi-usuario de mayor concurrencia serian necesarias GPUs de datacenter, pero no hay mediciones publicadas.
- Viabilidad en GPU de consumo: si, en RTX 4070 (12 GB) con offload parcial a CPU, segun el baseline del autor. No se documentan pruebas en GPUs con menos de 12 GB.
- Opciones de despliegue: `llama.cpp` con soporte APEX/MTP. El autor exige una build que incorpore dicho soporte y advierte de que este espejo no incluye runtime. No hay referencia a vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: 94,656 tok/s de decodificacion mediana y 88,386 tok/s extremo a extremo en RTX 4070 con la configuracion descrita; ~26 s de prefill para un contexto en frio de ~12.700 tokens.

## Comparativa con modelos similares

Los unicos elementos comparables identificables en la informacion disponible son los eslabones de la propia cadena de procedencia. No se dispone de datos de terceros equivalentes.

| Modelo | Parametros | Formato | Contexto | Rendimiento publicado | Licencia |
|---|---|---|---|---|---|
| trevor000/Qwen3.6-35B-A3B-I-Mini-RTX4070 | 35.505.251.456 totales | GGUF (I-Mini, 14,27 GB) | No disponible; 16K asignados en pruebas | 94,656 tok/s decodificacion mediana en RTX 4070 | Apache-2.0 |
| mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF | Mismo base; activos no disponibles | GGUF (APEX/MTP) | No disponible | No disponible en esta informacion | Apache-2.0 segun el modelo origen |
| lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled | Mismo base; activos no disponibles | No disponible | No disponible | No disponible | Apache-2.0 segun el modelo origen |
| Qwen/Qwen3.6-35B-A3B (base) | 35.505.251.456 totales | safetensors en origen | No disponible | No disponible | Apache-2.0 |

No se han identificado en la busqueda web modelos alternativos de la misma categoria con datos verificables; los resultados de busqueda obtenidos no guardan relacion con el modelo.

## Limitaciones y advertencias

- No es una release oficial: el autor declara explicitamente que este espejo no es una publicacion oficial de Qwen, LocalAI ni APEX, y que no reclama propiedad sobre el trabajo base ni sobre la cuantizacion APEX.
- Ausencia de evaluacion de calidad: no hay resultados de MMLU, HumanEval, GSM8K ni ninguna otra prueba de capacidad. Las unicas metricas publicadas son de velocidad y de una comprobacion estrecha de recuperacion de hechos.
- Alcance limitado de las comprobaciones: el propio autor advierte de que las pruebas realizadas no establecen inteligencia general ni memoria perfecta en contexto largo.
- Riesgo de alucinacion: no hay datos publicados sobre tasas de alucinacion. Como cualquier modelo de lenguaje sin evaluacion publica de fidelidad, requiere verificacion en producción.
- Idiomas: no se declara ningun idioma soportado en el repositorio. Aunque el modelo base Qwen es multilingue, no hay confirmacion para este artefacto.
- Contexto: la longitud maxima de contexto no esta documentada. Las unicas cifras verificadas son 16K asignados en el baseline y entradas de hasta 12.766 tokens.
- Requisitos de runtime: necesita una build de `llama.cpp` con soporte APEX/MTP. El espejo no incluye runtime, launcher ni binarios.
- Rendimiento dependiente de configuracion: las cifras de velocidad corresponden a una configuracion muy concreta (top-k8, Q8 KV, bloques 33-40 de expertos en CPU, lote 1024/128). El autor advierte de que los resultados historicos con top-k reducido son aproximaciones de enrutamiento y no el valor por defecto recomendado.
- Licencia: Apache-2.0, pero con obligacion de mantener la licencia Apache de Qwen y de identificar la destilacion de lordx64, la cuantizacion de APEX/LocalAI, el MTP de Qwen y las contribuciones de MTP en `llama.cpp`.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Fechas: el repositorio figura creado y actualizado el 2026-09-20, con tres minutos de diferencia entre ambas marcas, lo que sugiere una publicacion sin mantenimiento posterior.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/trevor000/Qwen3.6-35B-A3B-I-Mini-RTX4070
- Modelo upstream con cuantizacion APEX y MTP: https://huggingface.co/mudler/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled-APEX-MTP-GGUF
- Destilacion de razonamiento de origen: lordx64/Qwen3.6-35B-A3B-Claude-4.7-Opus-Reasoning-Distilled (referenciada en la model card; no se ha facilitado URL directa)
- Modelo base: Qwen/Qwen3.6-35B-A3B (referenciado en la model card; no se ha facilitado URL directa)
- Repositorio de investigacion en RTX 4070: https://github.com/trevor050/escha-rtx4070-lab
- Fichero de procedencia con verificacion SHA256: `provenance.json` del repositorio en HuggingFace
- Comando de descarga indicado por el autor: `hf download trevor000/Qwen3.6-35B-A3B-I-Mini-RTX4070 --local-dir Qwen3.6-35B-A3B-I-Mini-RTX4070`
- Nota sobre la busqueda web: los resultados obtenidos no guardan relacion con el modelo (contenido de una cadena de supermercados) y no aportan informacion adicional utilizable.
