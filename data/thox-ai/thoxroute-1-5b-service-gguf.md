# Thox-ai/ThoxRoute-1.5B-Service-GGUF

## Resumen

ThoxRoute-1.5B-Service-GGUF es un artefacto GGUF publicado por Thox-ai (THOX.ai) construido sobre Qwen/Qwen2.5-1.5B-Instruct. Se presenta como un modelo de enrutamiento de intenciones y preferencias ("service router") destinado a nodos de servicio de baja memoria dentro de la pila propietaria del autor (MeshStack y ThoxOS). No es un asistente general: su propósito declarado es clasificar y dirigir peticiones dentro de una arquitectura de agentes, no mantener conversaciones abiertas con usuarios finales.

El repositorio contiene un único fichero GGUF en cuantización Q4_K_M de 1.117.320.704 bytes (~1,04 GiB), con arquitectura `qwen2`, 32.768 tokens de contexto y 1.777.088.000 parámetros según la cabecera del propio artefacto. La model card es explícita al calificar el artefacto como **UNVALIDATED ARTIFACT**: no se ha cargado, ni evaluado con benchmarks, ni verificado funcionalmente, y el autor advierte que nada de lo publicado constituye evidencia de que el enrutamiento funcione correctamente.

La relevancia de esta ficha es fundamentalmente metodológica: ilustra un caso de publicación de pesos con procedencia parcialmente corroborada, licencia resuelta a posteriori (Apache-2.0, determinada el 2026-10-31 por el CTO de THOX.ai) y una discrepancia de tamaño sin explicar respecto a un repositorio hermano. Cualquier evaluador debe tratar el modelo como no validado y asumir que la carga útil real (la plantilla de chat incluida) es la plantilla instruct estándar de Qwen, sin plantilla de enrutamiento propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (`general.architecture: qwen2`) |
| Parametros totales | 1.777.088.000 (según cabecera GGUF; etiqueta de tamaño 1.8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | Q4_K_M (único build publicado en el repositorio) |
| Idiomas soportados | en (inglés, según metadatos del Hub) |
| Licencia | Apache-2.0 (resuelta el 2026-10-31; ver advertencias) |
| Formato de pesos | GGUF (`thoxroute-service-q4_K_M.gguf`) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Tokens especiales | BOS `<|endoftext|>`, EOS `<|im_end|>` |
| Plantilla de chat | Plantilla instruct estándar de Qwen, con persona de sistema upstream por defecto; sin plantilla de enrutamiento THOX |
| Tamano del fichero | 1.117.320.704 bytes (~1,04 GiB) |
| SHA-256 | `dcb4d041fa2ae90b5c3b713e9bd8e6c4b265388f4f81c804ae7a404737c4c1b2` |
| Tamano del repositorio | 1,1 GB |
| Descargas | 443 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención causal estándar, sin mezcla de expertos ni mecanismos híbridos SSM. El artefacto es un merge y posterior cuantización Q4_K_M del supuesto fine-tune Thox-ai/ThoxRoute-1.5B; la cabecera GGUF embebida declara `general.name: "Service v1 Merged"`, coherente con un build fusionado destinado a despliegue de servicio. No se documentan innovaciones arquitectónicas propias: no hay decodificación especulativa, atención lineal ni modificación estructural alguna respecto al modelo base.

Los datos de entrenamiento no están disponibles. La model card remite a la sección de resumen y evaluación para la descripción del corpus y del procedimiento, pero esa descripción no se incluye en el material proporcionado. No consta número de tokens de entrenamiento, composición del dataset, ni si se aplicó RLHF, DPO o alguna otra fase de alineamiento posterior al fine-tune. Tampoco se publica registro de construcción, log de conversión ni cadena de hashes que vincule el fichero GGUF con el adaptador de origen byte a byte, lo que impide verificar la procedencia de forma criptográfica.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Clasificación y enrutamiento de intenciones y preferencias dentro de la pila THOX (uso previsto declarado por el autor).
- Ventana de contexto de 32.768 tokens, suficiente para concatenar historial de conversación y metadatos de enrutamiento en una sola pasada.
- Inferencia en dispositivo ("on-device") y en nodos de baja memoria, al ocupar ~1,04 GiB en Q4_K_M.
- Compatibilidad con endpoints (`endpoints_compatible`) y con el ecosistema GGUF: llama.cpp, Ollama.
- Capacidades de tool calling, function calling, razonamiento multi-paso, visión, audio y modo thinking: no disponibles. El modelo base es un instruct de texto de 1,5B sin estas funciones y la model card no declara ninguna extensión.
- Capacidades multilingües: no disponibles. El metadato de idioma del Hub declara únicamente `en`.

## Casos de uso

- Enrutamiento de intenciones en nodos de servicio con memoria restringida: el modelo se cargaría en un nodo MeshStack o ThoxOS para clasificar la petición entrante y derivarla al servicio correspondiente, aprovechando que el fichero Q4_K_M ocupa ~1,04 GiB y cabe en dispositivos con 2 GB de RAM libre. Requiere validación previa por parte del integrador, dado que el artefacto no está validado.
- Puerta de preprocesado en pipelines de agentes: usar el modelo como primer eslabón que decide qué herramienta o sub-agente invoca el sistema, con el contexto de 32.768 tokens para incluir el historial reciente y el catálogo de servicios.
- Despliegue local-first en estaciones de trabajo sin GPU: mediante llama.cpp u Ollama en CPU, con latencia de decodificación dominada por el ancho de banda de memoria del equipo; adecuado para volúmenes bajos de peticiones de clasificación.
- Experimentación con cuantización Q4_K_M sobre Qwen2.5-1.5B: el repositorio sirve como referencia de hasta dónde degrada la cuantización a un modelo de 1,8B en tareas de clasificación corta, siempre que se construya un conjunto de evaluación propio.
- Servicio de clasificación auxiliar en arquitecturas multi-modelo: colocado delante de un modelo grande, filtra y etiqueta peticiones para reducir el número de llamadas al modelo principal y, con ello, el coste por token.
- Entorno de pruebas para políticas de guardarraíles: al ser un modelo pequeño y determinista en la forma de plantilla, permite iterar sobre reglas de seguridad y enrutamiento antes de trasladarlas a producción.
- Verificación de integridad de artefactos en cadena de suministro de modelos: el SHA-256 publicado permite montar un control de integridad en el pipeline de despliegue, aunque la cadena de procedencia respecto al adaptador de origen no esté documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card califica explícitamente el artefacto como no validado: no ha sido cargado, evaluado ni comprobado funcionalmente, y no se aportan métricas de precisión de enrutamiento, latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM para inferencia: ~1,04 GiB solo para los pesos en Q4_K_M; con overhead de contexto y caché KV para 32.768 tokens, prever entre 1,5 y 3 GB adicionales según el backend y la longitud efectiva de contexto configurada. Para contextos cortos (2.048–4.096 tokens), el consumo total se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede alojar el modelo con contexto moderado (GTX 1650 4 GB, RTX 3050, RTX 4060, RTX 4090). Para despliegues de servicio con concurrencia, se recomienda RTX 4090, L4, A10 o A100/H100 si se comparte nodo con otros modelos.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más de VRAM. También es viable en CPU pura y en dispositivos de placa única tipo Raspberry Pi 5 con 8 GB, con latencias altas.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (`ollama run hf.co/Thox-ai/ThoxRoute-1.5B-Service-GGUF`). vLLM y TGI no soportan GGUF de forma nativa para este formato sin conversión previa a safetensors, que no se publica en este repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones. Como referencia estructural del tamaño, un modelo de 1,8B en Q4_K_M en una GPU moderna decodifica típicamente decenas de tokens por segundo, pero no se aporta ningún dato medido para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Estado de validación |
|---|---|---|---|---|---|
| ThoxRoute-1.5B-Service-GGUF | 1,777 M | 32.768 | GGUF Q4_K_M | Apache-2.0 (resuelta a posteriori) | No validado por el autor |
| Qwen/Qwen2.5-1.5B-Instruct | ~1.500 M | 32.768 | safetensors, GGUF, AWQ | Apache-2.0 | Modelo upstream ampliamente evaluado |
| Thox-ai/ThoxRoute-1.5B-GGUF | ~1.500 M (nominal) | no disponible | GGUF Q4_K_M (986.047.936 B) | Apache-2.0 | No disponible |
| Thox-ai/ThoxRoute-1.5B | no disponible | no disponible | no disponible | Apache-2.0 | No disponible |

La comparación relevante es contra el modelo base: ThoxRoute-1.5B-Service-GGUF no aporta un contexto mayor ni una arquitectura distinta, sino un fine-tune del que no se publican datos de entrenamiento ni evaluación. Frente a Qwen2.5-1.5B-Instruct, la única ventaja declarada es la especialización en enrutamiento dentro de la pila THOX; sin benchmarks, esa ventaja no es verificable. El repositorio hermano ThoxRoute-1.5B-GGUF presenta un fichero Q4_K_M unos 131 MB menor para la misma cuantización nominal y la misma fuente nominal, discrepancia que el autor reconoce sin explicar.

## Limitaciones y advertencias

- Artefacto no validado: el autor declara que no se ha cargado, evaluado ni comprobado funcionalmente. No existe evidencia publicada de que el enrutamiento funcione.
- Plantilla de chat no especializada: el GGUF embebe la plantilla instruct estándar de Qwen, incluida su persona de sistema upstream por defecto. Si el host no sobrescribe el prompt de sistema, el modelo se presentará con la identidad de Qwen y no como enrutador THOX.
- Procedencia incompleta: no sobrevive registro de construcción, log de conversión ni cadena de hashes que vincule el fichero con el adaptador ThoxRoute-1.5B. Existe una discrepancia de ~131 MB sin explicar frente al repositorio hermano para la misma cuantización nominal.
- Licencia resuelta por determinación interna: Apache-2.0 se fijó el 2026-10-31 por decisión del CTO de THOX.ai, apoyándose en la licencia del modelo base y del adaptador de origen, no en una cadena de custodia verificada. Para uso comercial en producción, conviene revisar el texto de licencia del repositorio y documentar la decisión.
- Sesgos: no documentados. Al derivar de Qwen2.5-1.5B-Instruct, hereda los sesgos del corpus de entrenamiento del modelo base, no caracterizados en esta ficha.
- Alucinación: riesgo alto en tareas generativas abiertas por el tamaño reducido (1,8B) y por la ausencia de evaluación; el uso previsto es clasificación cerrada, no generación de contenido factual.
- Idioma: solo inglés declarado. No hay evidencia de calidad en castellano ni en otros idiomas, y el fine-tune de enrutamiento puede haber degradado aún más el multilingüismo del base.
- Exposición pública: la model card indica explícitamente que no es un asistente general ni está alineado en seguridad para exposición directa al público. Debe desplegarse detrás de guardarraíles.
- Sin datos de entrenamiento publicados: imposible auditar la composición del corpus, el número de tokens o las fases de alineamiento.
- Contexto: aunque la cabecera declara 32.768 tokens, no hay medición de rendimiento en contextos largos para este fine-tune.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-Service-GGUF
- Repositorio del adaptador de origen: https://huggingface.co/Thox-ai/ThoxRoute-1.5B
- Repositorio hermano GGUF: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Descarga directa del fichero: https://huggingface.co/Thox-ai/ThoxRoute-1.5B-Service-GGUF/resolve/main/thoxroute-service-q4_K_M.gguf
- Ejecución con Ollama: `ollama run hf.co/Thox-ai/ThoxRoute-1.5B-Service-GGUF`
- Papers, blogs, demos y repositorios adicionales: no disponibles en la información proporcionada.
