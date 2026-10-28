# WAS/LLM

## Resumen

WAS/LLM es un empaquetado del modelo denso Qwen3-32B de Alibaba Cloud, convertido por el usuario WAS a un único archivo safetensors cuantizado en int8 con rotación Hadamard («int8 convrot»), pensado para escribir texto dentro de grafos de ComfyUI. No es un modelo nuevo ni un fine-tuning: es una redistribución del Qwen3-32B original (Apache-2.0) con los pesos reformateados para que el nodo **Language Model Loader** de WAS Node Suite pueda construirlo sobre la implementación interna de Qwen3 de ComfyUI y entregarlo a los nodos **Generate Text**, **Fast Generate Text** y **LLM From CLIP**.

El interés práctico está en que ComfyUI no puede cargar un Qwen3 de 32B con **Load CLIP**, que espera un Qwen3 de 5120 dimensiones para Mistral 24B, y en que el archivo incorpora la capa de salida y las 64 capas completas, además del conmutador de *thinking* híbrido: activando la entrada `thinking` de Generate Text el modelo razona antes de responder; desactivándola responde directamente. El contexto declarado es de 40.960 tokens.

El coste es de espacio y velocidad: el archivo ocupa 32,8 GB, por encima de una tarjeta de 24 GB, de modo que parte de los pesos se leen desde memoria del sistema en cada token. El autor reporta aproximadamente 1,5 tokens por segundo en una RTX 4090 con 96 GB de RAM del sistema usando Fast Generate Text. El repositorio no tiene descargas ni valoraciones y la model card no documenta idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso Qwen3, 64 capas, con capa de salida propia |
| Parametros totales | 32B (heredados de Qwen/Qwen3-32B) |
| Parametros activos | No aplica: modelo denso |
| Longitud de contexto | 40.960 tokens |
| Tipos de cuantizacion | int8 convrot en todas las capas lineales, embedding y capa de salida; normas en bfloat16; rotacion Hadamard de bloque de 256 por fila antes del redondeo |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un unico archivo, 32,8 GB) con nombres de tensor propios de Qwen y etiqueta `comfy_quant` junto a cada capa cuantizada |

## Arquitectura y entrenamiento

La ficha del autor no describe ningún entrenamiento propio: el modelo es Qwen/Qwen3-32B modificado por WAS, y los cambios se limitan a la cuantización y al etiquetado de tensores, según se detalla en el `NOTICE.md` del repositorio. Se conservan las 64 capas, los nombres de tensor originales (`model.layers.0.self_attn.q_proj.weight`, `lm_head.weight`) y la capa de salida, lo que permite que el nodo Language Model Loader reconstruya el modelo sobre la implementación de Qwen3 de ComfyUI en lugar de sobre Load CLIP.

La innovación técnica es el esquema de cuantización: cada fila de cada capa lineal, del embedding y de la capa de salida se rota con un bloque Hadamard de 256 elementos antes de redondearse a int8, el mismo método que Comfy-Org emplea en sus text encoders Qwen. Las capas de normalización permanecen en bfloat16. El error medio de peso declarado es del 0,91 %, con un peor caso por capa del 1,09 %. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO en la información disponible; tampoco se especifica si el conmutador de *thinking* híbrido procede del modelo base sin cambios.

## Capacidades

- Generación de texto autoregresiva para escritura de prompts, chat y recuperación dentro de un grafo de ComfyUI.
- Modo de razonamiento híbrido: la entrada `thinking` de Generate Text activa el razonamiento previo; desactivada, la respuesta es directa.
- Ventana de contexto de 40.960 tokens, adecuada para prompts largos, historiales de conversación y documentos recuperados.
- Integración como CLIP en los nodos Generate Text, Fast Generate Text y LLM From CLIP de ComfyUI.
- Entrada y salida exclusivamente de texto: no procesa imágenes ni audio.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, multimodalidad ni lista de idiomas.

## Casos de uso

- Escritura de prompts dentro de un grafo de ComfyUI: el modelo recibe una descripción breve y devuelve un prompt detallado en inglés para un modelo de difusión, con el modo `thinking` activado cuando se requiere descomponer una escena compleja en sujeto, estilo, iluminación y composición.
- Chat conversacional en nodos de ComfyUI: con 40.960 tokens de contexto se puede mantener un historial multi-turno largo dentro del propio grafo sin salir a una API externa, útil para prototipado de asistentes integrados en flujos de imagen.
- Recuperación y respuesta sobre documentos: el contexto permite inyectar fragmentos recuperados de una base vectorial y generar una respuesta sintetizada, todo dentro del mismo pipeline que produce la salida gráfica.
- Generación por lotes de variaciones de prompt: un nodo puede iterar sobre listas de conceptos y producir variantes de texto para barridos de parámetros, aunque el rendimiento de 1,5 tokens/s limita el volumen por hora.
- Etiquetado y descripción de metadatos: generación de títulos, descripciones y etiquetas para lotes de imágenes antes de indexarlas, aprovechando que el modelo permanece cargado en el grafo.
- Reescritura y normalización de texto en castellano u otros idiomas: siempre que se valide empíricamente la calidad por idioma, ya que la model card no declara cobertura lingüística.
- Pruebas de razonamiento de un solo paso: comparar la salida con `thinking` activado y desactivado sobre la misma entrada para evaluar la ganancia de calidad frente al coste de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica de rendimiento declarada por el autor es de velocidad de inferencia: aproximadamente 1,5 tokens por segundo con Fast Generate Text en una RTX 4090 con 96 GB de memoria del sistema. Tampoco se ofrecen métricas de calidad tras la cuantización más allá del error de peso (0,91 % medio, 1,09 % en el peor caso).

## Requisitos de hardware

- VRAM estimada: el archivo pesa 32,8 GB, por encima de los 24 GB de una tarjeta consumer de gama alta, por lo que no cabe completo en una RTX 4090 ni en una RTX 5090 de 24/32 GB sin offload parcial.
- GPU recomendadas para carga completa: A100 80 GB, H100 80 GB o cualquier acelerador con más de 33 GB de VRAM libre.
- En consumer: funciona en RTX 4090 con 96 GB de RAM del sistema, con streaming de pesos desde memoria principal y un rendimiento de unos 1,5 tokens/s; se desconoce el rendimiento en configuraciones con menos RAM.
- Memoria del sistema: el autor cita explícitamente 96 GB de RAM como entorno probado; no se documenta el mínimo necesario.
- Despliegue: exclusivamente ComfyUI con WAS Node Suite (probado con ComfyUI 0.42), mediante el nodo Language Model Loader apuntando a `ComfyUI/models/text_encoders`. El formato int8 convrot con etiqueta `comfy_quant` no es un GGUF estándar, por lo que no se documenta uso con llama.cpp, Ollama, vLLM ni TGI.
- Latencia y throughput: ~1,5 tokens/s en el entorno citado; no hay datos de latencia por petición ni de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / formato | Licencia | Uso previsto |
|---|---|---|---|---|---|
| WAS/LLM (este) | 32B | 40.960 tokens | int8 convrot, safetensors 32,8 GB | Apache-2.0 | ComfyUI, nodos de texto |
| Qwen/Qwen3-32B (base) | 32B | No indicado en la informacion | Pesos originales (no indicado) | Apache-2.0 | Uso general fuera de ComfyUI |
| qwen3vl_32b de MiniMax H3 | 32B (primeras 50 capas) | No disponible | No disponible | No disponible | Text encoder de acondicionamiento, sin capa de salida |

El modelo base Qwen3-32B es la referencia natural: WAS/LLM añade cuantización int8 y compatibilidad con Language Model Loader, a cambio de un coste de calidad no medido en benchmarks y de la dependencia de ComfyUI. El `qwen3vl_32b` que menciona la model card no es comparable funcionalmente: carece de capa de salida y no puede escribir texto.

## Limitaciones y advertencias

- La model card no declara idiomas soportados, sesgos conocidos ni evaluación de alucinación; cualquier uso en producción requiere evaluación propia.
- No hay benchmarks de calidad tras la cuantización: el 0,91 % de error medio de peso no garantiza una degradación despreciable en tareas de razonamiento o código.
- Rendimiento muy bajo (~1,5 tokens/s) en la configuración probada; inviable para interfaces interactivas o generación masiva.
- Requiere más VRAM que una tarjeta de 24 GB; el streaming desde RAM del sistema introduce dependencia del ancho de banda de memoria y de la cantidad de RAM instalada.
- Dependencia de software concreta: ComfyUI 0.42 y WAS Node Suite; no se documenta compatibilidad con otras versiones ni con servidores de inferencia estándar.
- El formato int8 convrot con etiquetas `comfy_quant` no es portable a otros runners; no hay GGUF publicado.
- Solo texto: no sirve como text encoder visual ni sustituye a `qwen3vl_32b`.
- Licencia Apache-2.0 permite uso comercial, pero obliga a conservar avisos de licencia y a documentar las modificaciones; el autor incluye `LICENSE` y `NOTICE.md` a tal efecto.
- Repositorio sin descargas ni valoraciones: no hay evidencia comunitaria de funcionamiento más allá de la prueba del autor.
- El consumo de disco y de memoria hace que cargar y descargar el modelo repetidamente sea costoso en entornos con múltiples usuarios.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WAS/LLM
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- WAS Node Suite (nodo Language Model Loader): https://github.com/WASasquatch/was-node-suite-comfyui
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE
- Aviso de cambios del autor: https://huggingface.co/WAS/LLM/blob/main/Qwen3-32B/NOTICE.md
- Archivo de pesos: https://huggingface.co/WAS/LLM/blob/main/Qwen3-32B/qwen3_32b_int8_convrot.safetensors
