# William-WSDS/Qwen3.5-9B-GGUF

## Resumen

Qwen3.5-9B-GGUF es una conversión a formato GGUF del modelo multimodal Qwen/Qwen3.5-9B, publicada por el usuario William-WSDS para su uso dentro de embraOS, un sistema operativo que integra llama.cpp de forma nativa. El modelo original lo desarrolla el equipo Qwen (Alibaba), y esta variante no introduce ningún ajuste fino, matriz de importancia ni modificación de la plantilla de chat: es una cuantización directa del checkpoint oficial. Su relevancia radica en que empaqueta, en dos ficheros GGUF, tanto el modelo de lenguaje cuantizado a Q4_K_M como el proyector visual en F16 necesario para el procesamiento de imágenes.

El modelo base es un transformer denso de 9.197.093.888 parámetros (aproximadamente 9,2 mil millones) con una ventana de contexto declarada de 262.144 tokens, entrenado para tareas de imagen-texto a texto. La conversión se realizó con llama.cpp en su etiqueta v1.0.0, lo que garantiza compatibilidad con esa versión concreta del runtime. El repositorio ocupa 7,7 GB y se distribuye bajo licencia Apache-2.0, la misma del modelo original.

La ficha resulta útil para desarrolladores que necesiten desplegar un modelo multimodal de ~9B en hardware propio con llama.cpp, especialmente en entornos Arm o x86 donde el proyector en F16 evita la penalización de rendimiento que supone BF16 en plataformas sin código vectorial específico. La información pública sobre el modelo base (idiomas, benchmarks, detalles de entrenamiento) es limitada en la documentación proporcionada, por lo que varios campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto a texto), tipo no especificado en detalle; el proyector es de tipo `qwen3vl_merger` |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (modelo principal); F16 (proyector visual) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso de aproximadamente 9,2 mil millones de parámetros con capacidad multimodal de entrada (imagen y texto) y salida de texto. La conversión a GGUF conserva 394 tensores en el fichero principal, distribuidos en 175 tensores Q4_K (3.593 MiB), 35 tensores Q6_K (1.954 MiB) y 184 tensores F32 (4 MiB). El proyector visual, empaquetado por separado, contiene 334 tensores (112 F16, 864 MiB; 222 F32, 12 MiB) y emplea el tipo de proyector `qwen3vl_merger`.

Un detalle técnico relevante es que el conversor de llama.cpp v1.0.0 escribe el bloque de predicción de varios tokens a la vez (`qwen35.nextn_predict_layers = 1`, 144 MiB del fichero), pero el runtime no lo utiliza y emite un aviso de tensor no usado al cargar. El proyector se almacena en F16 en lugar de BF16 porque llama.cpp 1.0.0 dispone de código vectorial F16 tanto en Arm como en x86, mientras que para BF16 solo lo tiene en x86; con BF16, la codificación de una imagen tardaba entre 11 y 14 minutos en cuatro núcleos de Apple Silicon. La diferencia entre ambos formatos afecta a 157.673 de los 456.010.480 valores del proyector (0,03 %), con una desviación máxima de 3e-8. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de RLHF o DPO del modelo original.

## Capacidades

- Generación de texto conversacional multi-turno, según la etiqueta `conversational` del repositorio.
- Procesamiento de imágenes como entrada (pipeline `image-text-to-text`), mediante el proyector `qwen3vl_merger`.
- Razonamiento y respuesta en modo "thinking", ya que la model card remite a la tarjeta de Qwen para el interruptor de pensamiento y el muestreo.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios HTTP.
- Ejecución local en CPU mediante llama.cpp, sin necesidad de GPU.
- Soporte de contexto largo de hasta 262.144 tokens.
- No se documenta soporte de vídeo: llama.cpp 1.0.0 lee imágenes a través del proyector, pero no vídeo.
- No se documentan capacidades de tool calling, function calling ni agentes multi-paso en la información disponible.
- Idiomas soportados: no disponible.

## Casos de uso

- Análisis de documentos escaneados en local: el modelo puede recibir una imagen de una página y generar texto descriptivo o extractivo, con el proyector F16 codificando la imagen en aproximadamente 1.024 tokens, adecuado para entornos sin GPU.
- Asistencia conversacional multi-turno con contexto largo: gracias a la ventana de 262.144 tokens, puede mantener hilos de conversación extensos o procesar transcripciones y expedientes completos en una sola sesión.
- Despliegue en estaciones de trabajo Arm (Apple Silicon): la elección de F16 para el proyector evita la penalización de 11 a 14 minutos por imagen que sufriría BF16 en estas plataformas, lo que lo hace viable para prototipado interactivo.
- Integración en embraOS como modelo nativo experimental: el sistema operativo descarga ambos ficheros y los sirve con el llama.cpp integrado, fijando cada uno por su sha256, lo que permite ofrecer inferencia multimodal sin dependencias externas.
- Procesamiento por lotes de imágenes en CPU: con llama-server y los parámetros `--image-min-tokens 1024 --image-max-tokens 1024`, se puede montar un servicio HTTP que reciba imágenes y devuelva descripciones o respuestas, útil en entornos con restricciones de GPU.
- Evaluación y experimentación con modelos multimodales de ~9B: al ser una cuantización Q4_K_M de 5,8 GB, cabe en portátiles con 8-16 GB de RAM y permite comparar el comportamiento del modelo base sin necesidad de infraestructura de datacenter.
- Generación de descripciones accesibles de imágenes: el pipeline imagen-texto permite producir texto alternativo o descripciones para catálogos y repositorios, ejecutándose íntegramente en la máquina del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero Q4_K_M ocupa 5.831.992.608 bytes (~5,4 GiB) y el proyector F16 918.165.952 bytes (~876 MiB), lo que suma unos 6,3 GiB en disco; en memoria se requiere espacio adicional para el contexto y el runtime de llama.cpp.
- GPU recomendadas: no se especifican en la información disponible; el modelo está pensado para ejecutarse en CPU mediante llama.cpp.
- Cabe en GPU de consumo: no confirmado; por tamaño, cabría en GPUs con 8 GB o más de VRAM si se usa la ruta de llama.cpp con offload, pero no hay datos publicados al respecto.
- Opciones de despliegue: llama.cpp v1.0.0 (versión con la que se generaron los ficheros), mediante `llama-server` con los parámetros `--mmproj mmproj-Qwen3.5-9B-F16.gguf --image-min-tokens 1024 --image-max-tokens 1024`. No se documenta compatibilidad con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles. El único dato de rendimiento es que la codificación de una imagen con el proyector BF16 tardaba de 11 a 14 minutos en cuatro núcleos de Apple Silicon; con F16 se espera una mejora sustancial, pero no se cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-9B-GGUF (esta ficha) | ~9,2B | 262.144 | Imagen-texto a texto | Apache-2.0 | GGUF |
| Qwen/Qwen3.5-9B (base) | ~9,2B | 262.144 | Imagen-texto a texto | Apache-2.0 | Safetensors |
| Alternativas de ~9B multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación se limita al modelo base del que deriva esta cuantización.

## Limitaciones y advertencias

- No se han documentado sesgos conocidos del modelo base en la información disponible.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas para esta cuantización.
- La cuantización Q4_K_M introduce pérdida de precisión respecto al modelo en BF16; no se han publicado métricas de degradación.
- El proyector en F16 difiere del BF16 original en 157.673 de 456.010.480 valores (0,03 %), con una desviación máxima de 3e-8.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingüe concreto.
- Compatibilidad limitada a llama.cpp v1.0.0 según la model card; otras versiones o runtimes no están verificados.
- El bloque de predicción multi-token (`nextn_predict_layers`) incluido en el GGUF no se utiliza y genera un aviso de tensor no usado.
- No hay soporte de vídeo a través del proyector en llama.cpp 1.0.0.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar el fichero LICENSE de Qwen incluido sin cambios.
- El modelo se publica como "experimental" dentro de embraOS; no hay garantías de soporte ni mantenimiento por parte del autor de la cuantización.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/William-WSDS/Qwen3.5-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Proyecto embraOS: https://github.com/Ward-Software-Defined-Systems/embraOS
- Revisión del proyector en BF16 (histórico): https://huggingface.co/William-WSDS/Qwen3.5-9B-GGUF/tree/2d2c56225c331a43c09f12c7479557c9c6d0969b
