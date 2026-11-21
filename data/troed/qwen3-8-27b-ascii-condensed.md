# troed/Qwen3.8-27B-ASCII-Condensed

## Resumen

Qwen3.8-27B-ASCII-Condensed es una derivacion del modelo Qwen3.8-27B de Qwen en la que se ha reducido drasticamente el vocabulario del tokenizer y de las matrices de embedding y de salida, pasando de 248.320 a 129.006 filas. La modificacion la firma el usuario troed y su objetivo es liberar VRAM en la GPU para destinarla a cache KV, permitiendo alcanzar contextos de hasta 160K tokens en tarjetas de 16 GB. Los pesos supervivientes son identicos bit a bit a los del GGUF original: no hay reentrenamiento, ni desquantizacion, ni requantizacion.

El paquete incluye dos ficheros: el modelo objetivo en cuantizacion IQ4_XS a 3,84 bits por peso (11,4 GiB) y un modelo borrador DFlash2 en Q2_K_S-MIX (511 MiB) para decodificacion especulativa. Este ultimo permite acelerar la generacion combinando n-gramas simples con borradores MTP. El modelo esta pensado para usarse con el fork de llama.cpp del propio autor, que anade streaming adaptativo de cache KV y gestion de memoria compartida entre dispositivo y host.

La relevancia de esta ficha es doble: por un lado muestra una tecnica de optimizacion de despliegue (poda de vocabulario en espacio cuantizado) que no altera la calidad de los pesos; por otro, evidencia las limitaciones practicas de esa tecnica, ya que el vocabulario resultante es exclusivamente ASCII y penaliza cualquier texto no ingles. Aunque el nombre comercial menciona 27B, el recuento real de parametros en safetensors es de 1.863.315.712, un dato que conviene tener en cuenta al planificar el hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.8-27B), con modelo borrador DFlash2 para decodificacion especulativa |
| Parametros totales | 1.863.315.712 (segun safetensors del repo); el nombre comercial indica 27B |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | hasta 200.192 tokens configurados en llama-server; 160K alcanzables en GPU de 16 GB |
| Tipos de cuantizacion | IQ4_XS a 3,84 bpw (modelo objetivo), Q2_K_S-MIX (borrador DFlash2) |
| Idiomas soportados | vocabulario solo ASCII; los 256 tokens de fallback byte-level garantizan decodificacion correcta de texto no ASCII con mayor coste por caracter |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de Qwen, del que esta version hereda integramente la arquitectura y los pesos. La intervencion de troed se limita a la capa de embedding y a la cabeza de salida: se seleccionan las filas correspondientes a un vocabulario ASCII condensado y se reescribe el tokenizer para que coincida. El proceso se realiza directamente sobre el GGUF cuantizado, de modo que las filas conservadas mantienen los valores originales sin pasar por desquantizacion ni requantizacion. El resultado son 129.006 filas frente a las 248.320 originales, lo que reduce el espacio ocupado por la matriz de embedding y libera VRAM reutilizable como cache KV.

El borrador DFlash2 se obtiene del modelo original de HermiHg aplicando la misma condensacion a sus tensores de vocabulario y a su tokenizer, sin tocar los pesos mas alla del subconjunto de filas. La decodificacion especulativa combina `ngram-simple` y `draft-mtp` con hasta 5 tokens de borrador y umbral de probabilidad 0,8. El despliegue recomendado usa cache KV en q8_0 para claves y q4_0 para valores, flash attention activado y un ajuste `shared-device-memory-mib = 3904` que solo esta disponible en el fork del autor. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens vistos ni las fases de RLHF o DPO aplicadas por Qwen.

## Capacidades

- Generacion de texto conversacional y de formato largo, con plantilla de chat Qwen 3.8.
- Modo de razonamiento (`reasoning = on`) con preservacion del bloque de pensamiento (`reasoning-preserve = on`).
- Capacidades multimodales heredadas del modelo base, siempre que se cargue un `mmproj` externo (no se incluye en el repo; se sugiere el de byteshape/Qwen3.8-27B-GGUF).
- Contexto largo efectivo: hasta 200.192 tokens configurados, con 160K viables en 16 GB de VRAM.
- Decodificacion especulativa mediante borrador DFlash2 y n-gramas simples.
- Tool calling y function calling: no confirmado explicitamente en la model card; depende de la plantilla de chat y del soporte del modelo base.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Multilingue: limitado. El tokenizer solo cubre ASCII; el texto no ASCII se decodifica mediante fallback byte-level con mayor consumo de tokens.

## Casos de uso

- Procesamiento de documentos largos en una sola GPU de 16 GB: con 160K tokens de contexto se pueden ingerir contratos, informes o expedientes completos sin trocear, usando el modelo como extractor o resumidor.
- Asistente conversacional local con historial extenso: la ventana de 200K permite mantener sesiones de atencion al cliente con memoria de toda la conversacion y documentos adjuntos, en hardware de consumo.
- Analisis de repositorios de codigo en ingles: el vocabulario ASCII cubre integramente el codigo fuente, por lo que la penalizacion de tokens es nula en este dominio; util para revision, generacion y explicacion de codigo.
- Despliegue en estaciones de trabajo con RTX 5060 Ti o similares: el binomio modelo objetivo mas borrador ocupa unos 12 GiB, dejando margen para cache KV y contexto largo en 16 GB.
- Prototipado de pipelines de razonamiento con modo thinking: el flag `reasoning = on` permite obtener cadenas de razonamiento antes de la respuesta, util para evaluar modelos en tareas de matematicas o logica.
- Servidor de inferencia monousuario con llama-server: la configuracion `parallel = 1` y el streaming de KV adaptativo estan pensados para un unico usuario con contexto muy grande, no para alta concurrencia.
- Investigacion sobre poda de vocabulario: el repo sirve como referencia reproducible para medir el impacto de reducir el vocabulario en calidad, velocidad y consumo de tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta cifras de rendimiento de inferencia medidas en un equipo concreto:

| Metrica | Valor | Hardware |
|---|---|---|
| Procesamiento de prompt | ~500-1000 t/s | RTX 5060 Ti 16 GB + 96 GB DDR5 |
| Generacion de tokens | ~30-50 t/s | RTX 5060 Ti 16 GB + 96 GB DDR5 |

## Requisitos de hardware

- VRAM estimada: unos 11,4 GiB para el modelo objetivo en IQ4_XS y 511 MiB para el borrador DFlash2; en total, aproximadamente 12 GiB antes de cache KV.
- GPU recomendadas: RTX 5060 Ti 16 GB (configuracion de referencia del autor), RTX 4090, RTX 5090, A100 y H100 para contextos maximos o concurrencia.
- Cabe en GPU de consumo: si, en tarjetas de 16 GB o mas con la configuracion indicada; en 12 GB habria que reducir contexto o el valor de `shared-device-memory-mib`.
- Opciones de despliegue: llama.cpp (cualquier build reciente carga los GGUF), aunque las opciones `shared-device-memory-mib` y el flujo completo requieren el fork troed/llama.cpp-adaptive-kv-streaming. Compilacion con `GGML_CUDA=ON` y `GGML_CUDA_FA_QUANTS=q8_0-q4_0,q8_0-q8_0,q4_0-q4_0`.
- Latencia y throughput: ver tabla de la seccion anterior; dependen fuertemente del ancho de banda de memoria y del uso del borrador especulativo.
- Memoria del sistema: el autor emplea 96 GB de DDR5, relevante para el streaming de KV entre dispositivo y host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| troed/Qwen3.8-27B-ASCII-Condensed | 1.863.315.712 (segun safetensors) | hasta 200.192 tokens | IQ4_XS 3,84 bpw + borrador Q2_K_S | Apache-2.0 | Vocabulario ASCII, requiere fork para streaming KV |
| byteshape/Qwen3.8-27B-GGUF | no disponible | no disponible | IQ4_XS 3,84 bpw | Apache-2.0 (heredada) | Fuente del modelo objetivo; vocabulario completo, mas VRAM para embeddings |
| HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF | no disponible | no disponible | Q2_K_S-MIX | no disponible | Borrador DFlash2 original; compatible con llama.cpp estandar |
| Qwen/Qwen3.8-27B | no disponible | no disponible | safetensors (BF16 y otras) | Apache-2.0 | Modelo base sin poda de vocabulario; mayor huella de VRAM |

## Limitaciones y advertencias

- Vocabulario exclusivamente ASCII: cualquier texto con acentos, caracteres latinos extendidos, griego, simbolos monetarios o dibujo de cajas consume mas tokens por caracter y degrada la eficiencia. Para castellano, frances o aleman el coste es notable.
- La decodificacion de texto no ASCII sigue siendo correcta gracias a los 256 tokens de fallback byte-level, pero no es eficiente.
- No se ha reentrenado el modelo: la poda no anade capacidades, solo reduce la huella de memoria; la calidad en ingles se mantiene identica a la del GGUF fuente.
- El modelo borrador DFlash2 no esta soportado por la fase arena v2 del fork de Raymond; solo funciona con la configuracion del autor o con llama.cpp estandar, lo que limita combinaciones.
- La opcion `shared-device-memory-mib` solo existe en el fork troed/llama.cpp-adaptive-kv-streaming; con llama.cpp oficial se pierde parte del ahorro de memoria.
- No se incluye `mmproj` en el repositorio: las capacidades de vision requieren descargar el proyector multimodal por separado.
- Riesgo de alucinacion y sesgos: no documentados en la model card; heredados del modelo base Qwen3.8-27B, sobre los que no se aporta informacion.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los componentes de terceros (cuantizacion de ByteShape, borrador de HermiHg, herramientas de poda de bsaleh03).
- El recuento real de parametros (1.863.315.712) no coincide con el nombre comercial 27B; planificar el hardware con el dato real y con el tamano del repo (12,8 GB).
- El modelo esta disenado para un unico usuario (`parallel = 1`); no es adecuado para servir alta concurrencia sin ajustes adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/troed/Qwen3.8-27B-ASCII-Condensed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF fuente: https://huggingface.co/byteshape/Qwen3.8-27B-GGUF
- Borrador DFlash2 original: https://huggingface.co/HermiHg/Qwen3.8-27B-DFlash2-Q2_K_S-MIX-GGUF
- Fork de llama.cpp con KV streaming: https://github.com/troed/llama.cpp-adaptive-kv-streaming
- Trabajo original de KV streaming de Raymond Huang: https://github.com/RaymondHuang210129/llama.cpp-adaptive-kv-streaming
- Herramientas de poda ASCII-Condensed: https://github.com/bsaleh03/ASCII-Condensed-prune-tools
- Guia de configuracion de llama-server en 16 GB de VRAM: https://blog.troed.se/projects/llama-server-16gb-vram-configs/
