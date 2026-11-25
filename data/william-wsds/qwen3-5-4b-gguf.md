# William-WSDS/Qwen3.5-4B-GGUF

## Resumen
Qwen3.5-4B-GGUF es una conversión a formato GGUF del modelo multimodal Qwen/Qwen3.5-4B, publicada por el usuario William-WSDS para su uso como modelo nativo (experimental) en el sistema operativo embraOS. No se trata de un modelo nuevo ni de un ajuste fino: es el mismo modelo base de Qwen, convertido con llama.cpp 1.0.0, con los pesos cuantizados a Q4_K_M y el proyector de visión almacenado en F16. El pipeline declarado es image-text-to-text, por lo que el modelo acepta tanto texto como imágenes como entrada.

El modelo base tiene 4.326.350.848 parámetros (aproximadamente 4,3 mil millones) y una ventana de contexto de 262.144 tokens, según indica la propia model card de la conversión. La licencia es Apache-2.0, heredada sin cambios del modelo original de Qwen. El repositorio ocupa 4,2 GB e incluye dos ficheros: el modelo cuantizado y el proyector multimodal.

La relevancia de esta publicación es práctica: ofrece una ruta lista para usar del modelo Qwen3.5-4B en llama.cpp, con ficheros verificados por sha256 y una configuración concreta de servidor (`llama-server`) que permite desplegar un modelo multimodal de 4B con contexto muy largo en hardware modesto, incluido Apple Silicon. Es una opción útil para quien quiera evaluar Qwen3.5-4B sin pasar por el proceso de conversión y cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo base Qwen3.5-4B; proyector de visión tipo `qwen3vl_merger`) |
| Parametros totales | 4.326.350.848 (aprox. 4,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo); F16 (proyector multimodal). El repositorio incluye únicamente estos ficheros |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento
El modelo subyacente es Qwen3.5-4B, un transformer multimodal de aproximadamente 4,3 mil millones de parámetros que procesa texto e imágenes. La conversión a GGUF conserva la arquitectura y los pesos del modelo original: no hay ajuste fino, ni matriz de importancia, ni modificación de la plantilla de chat, según declara el autor. El fichero del modelo contiene 393 tensores: 174 en Q4_K (1.555 MiB), 35 en Q6_K (1.117 MiB) y 184 en F32 (4 MiB).

El proceso de conversión se realizó con llama.cpp en la etiqueta `v1.0.0`, partiendo de la revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a` del modelo base, con verificación sha256 de cada fichero de pesos antes de convertir. El proyector de visión se generó por separado con la opción `--mmproj` y se almacenó en F16 en lugar de BF16 porque llama.cpp 1.0.0 solo dispone de código vectorial para BF16 en x86, no en Arm; con BF16 la codificación de una imagen tardaba entre 11 y 14 minutos en cuatro núcleos de Apple Silicon. La diferencia entre ambos formatos afecta a 182.092 de los 333.514.240 valores del proyector (0,05 %), con una desviación máxima de 3e-8.

El convertidor también escribe el bloque de predicción de varios tokens a la vez (`qwen35.nextn_predict_layers = 1`, 71 MiB), que llama.cpp 1.0.0 no utiliza y notifica al cargar el modelo como tensor sin uso. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades
- Generación de texto conversacional multi-turno, con plantilla de chat propia de Qwen conservada sin cambios.
- Comprensión de imágenes: el pipeline es image-text-to-text y el proyector `qwen3vl_merger` permite introducir imágenes junto al texto.
- Ventana de contexto de 262.144 tokens, adecuada para documentos largos o conversaciones extensas.
- Razonamiento y generación de código: capacidades propias del modelo base Qwen3.5-4B (no se detallan en la información disponible).
- Modo de pensamiento (thinking): la model card remite a la de Qwen para el interruptor de pensamiento y el muestreo, lo que implica que el modelo base lo soporta.
- Tool calling y function calling: no se documenta explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no disponibles.
- Vídeo: no soportado; llama.cpp 1.0.0 lee imágenes a través del proyector, pero no vídeo.

## Casos de uso
- Asistente conversacional multimodal local: el modelo puede mantener conversaciones multi-turno en las que el usuario adjunta imágenes, gracias a la ventana de 262.144 tokens y al proyector de visión incluido. Es adecuado para despliegues en escritorio o en el propio sistema operativo (embraOS) sin depender de la nube.
- Análisis de documentos e imágenes escaneadas: con contexto largo se pueden introducir páginas completas o capturas y pedir resúmenes, extracción de datos o explicaciones. El límite práctico lo marca la configuración de tokens por imagen (1.024 en la receta de embraOS).
- Despliegue en hardware de consumo: al ocupar el fichero Q4_K_M unos 2,8 GB, cabe en GPU de gama media y en equipos con memoria unificada, lo que permite prototipar asistentes visuales sin infraestructura dedicada.
- Evaluación y benchmarking de Qwen3.5-4B: sirve para probar el modelo base en llama.cpp con una configuración reproducible (sha256 fijados) antes de decidir una integración mayor.
- Integración en aplicaciones de escritorio y sistemas embebidos: al ser GGUF y ejecutarse con `llama-server`, se puede empaquetar como servicio local en una aplicación nativa, como hace embraOS con sus modelos nativos experimentales.
- Generación de descripciones y etiquetado de imágenes a escala moderada: el modelo puede procesar imágenes una a una con el servidor llama.cpp y producir texto asociado, útil para prototipos de catalogación o accesibilidad.
- Base para experimentación con cuantización: el repositorio documenta el proceso completo de conversión, lo que facilita reproducir otras cuantizaciones (Q5, Q8) a partir del mismo modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el fichero Q4_K_M ocupa 2.815.884.544 bytes (unos 2,8 GB) y el proyector F16 672.423.488 bytes (unos 0,67 GB); en total, alrededor de 3,5 GB de pesos, más el espacio para la caché KV, que crece con la longitud de contexto.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, el modelo es apto para GPU de consumo con 8 GB o más de VRAM.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8 GB o más (por ejemplo, RTX 3060/4060 en adelante), aunque la información no confirma modelos concretos.
- Apple Silicon: la model card menciona pruebas en cuatro núcleos de una máquina Apple Silicon; con el proyector en F16 la codificación de una imagen es viable, mientras que con BF16 tardaba entre 11 y 14 minutos.
- Opciones de despliegue: llama.cpp 1.0.0 (probado por el autor) mediante `llama-server -m Qwen3.5-4B-Q4_K_M.gguf --mmproj mmproj-Qwen3.5-4B-F16.gguf --image-min-tokens 1024 --image-max-tokens 1024`. Otros runners compatibles con GGUF (Ollama, etc.) no se mencionan en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Qwen3.5-4B-GGUF (esta ficha) | 4,3 mil millones | 262.144 | Apache-2.0 | GGUF (Q4_K_M + proyector F16) |
| Qwen/Qwen3.5-4B (base) | 4,3 mil millones | 262.144 | Apache-2.0 | safetensors/BF16 (según model card de Qwen) |
| Alternativas de 4B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Es una conversión, no un modelo nuevo: cualquier limitación del Qwen3.5-4B original (sesgos, alucinaciones, calidad en tareas complejas) se hereda sin cambios.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en BF16; no se han publicado evaluaciones del impacto de esa cuantización en este repositorio.
- El proyector en F16 difiere del BF16 original en 182.092 valores (0,05 %), con desviación máxima de 3e-8; el efecto práctico no está medido.
- El bloque de predicción de varios tokens (`nextn_predict_layers`) está presente pero llama.cpp 1.0.0 no lo usa, por lo que no se aprovecha esa capacidad.
- No hay soporte de vídeo en llama.cpp 1.0.0 con este proyector.
- La configuración de imagen está limitada a 1.024 tokens por imagen en la receta de embraOS; imágenes más complejas pueden perder detalle.
- Los idiomas soportados no están documentados en esta ficha; conviene verificar el comportamiento en castellano antes de usarlo en producción.
- El repositorio tiene muy poca tracción (140 descargas, 0 likes) y el modelo se marca como experimental en embraOS; no hay garantía de mantenimiento.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el fichero LICENSE de Qwen y atribuir correctamente.
- No se documentan resultados de benchmarks ni evaluación de sesgos en la información disponible.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/William-WSDS/Qwen3.5-4B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Proyecto embraOS: https://github.com/Ward-Software-Defined-Systems/embraOS
- Revisión del modelo base usada en la conversión: `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`
- Revisión histórica con el proyector en BF16: `a4d3a4d917bbbae2cf19f932cce4da64938117d2`
