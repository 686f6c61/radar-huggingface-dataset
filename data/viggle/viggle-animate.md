# Viggle/Viggle-Animate

## Resumen

Viggle-Animate es un modelo de edición de vídeo (pipeline `video-to-video`) desarrollado por Viggle que sustituye el personaje de un clip por el que el usuario haya pintado sobre uno de los fotogramas del propio vídeo, manteniendo intactos el movimiento, la cámara y el ritmo temporal. Técnicamente es un ajuste fino completo (full finetune) del transformer `ref2va` de MiniMax-H3, con 33.122.992.896 parámetros y destilado conjuntamente con DMD (Distribution Matching Distillation) hasta resolver la generación en tres pasadas forward.

Su relevancia radica en la eliminación del andamiaje habitual en el reemplazo de personajes: no emplea estimador de pose, segmentador, rastreador facial, máscara de fondo ni codificador de texto. La apariencia entra únicamente por el fotograma repintado y la geometría únicamente por el vídeo conductor, de modo que la pose, la iluminación y el encuadre de referencia ya concuerdan con el metraje y no requieren realineamiento posterior.

El modelo se publica con licencia comunitaria de MiniMax-H3 y un repositorio de 69,1 GB en formato safetensors. El autor indica que Viggle-Remake es su modelo más reciente y recomendado para proyectos nuevos, por lo que Viggle-Animate debe considerarse la generación anterior de la familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion `ref2va` de MiniMax-H3 (full finetune), destilado con DMD |
| Parametros totales | 33.122.992.896 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo; opera sobre número de fotogramas, no sobre tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (sin codificador de texto; condicionamiento mediante embedding fijo) |
| Licencia | minimax-h3-community-license (license: other) |
| Formato de pesos | safetensors (librería `minimax-h3`, integración con `diffusers`) |

## Arquitectura y entrenamiento

Viggle-Animate parte del transformer `ref2va` de MiniMax-H3 y se entrena como ajuste fino completo sobre él, sin congelar el backbone. La innovación central es la destilación conjunta con DMD, que reduce el muestreo a tres pasadas forward por clip terminado, en lugar del proceso iterativo habitual de los modelos de difusión. El condicionamiento de texto se elimina por completo: el codificador de texto nunca se carga y la única señal textual es un embedding congelado distribuido con los pesos en `assets/fixed_prompt.txt`, idéntico para todas las inferencias.

Los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. El autor describe dos entradas —el vídeo conductor y uno de sus propios fotogramas repintado en cualquier editor de imágenes— y una única tarea: propagar esa edición a lo largo del plano. La comparación declarada por el autor, en la misma máquina con GPU B200, mismos vídeos de origen, misma resolución de salida y mismo número de fotogramas, sitúa el rendimiento en 124 fotogramas en 26 segundos, 6,1 veces más rápido por clip que Wan2.2-Animate-14B.

## Capacidades

- Reemplazo de personaje en vídeo a partir de un único fotograma repintado, sin necesidad de fotografía de referencia independiente.
- Transferencia de pose precisa en movimiento rápido: cabezas girando, patadas completas y saltos se siguen fotograma a fotograma en lugar de difuminarse.
- Preservación de movimiento, cámara y timing originales del clip.
- Edición de vídeo a vídeo sin estimador de pose, segmentador, rastreador facial ni máscara de fondo.
- Generación sin prompt de texto: no acepta instrucciones textuales del usuario ni codificador de identidad o clase.
- Integración con ComfyUI mediante nodos de terceros.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo no es un LLM; la orquestación multi-plano corresponde a Viggle-Remake).
- Capacidades multilingües: no disponibles.
- Capacidades de audio o visión general: no disponibles; el modelo es específico de edición de vídeo.

## Casos de uso

- Postproducción de sustitución de dobles: se repinta un fotograma del plano con el actor definitivo y el modelo propaga el cambio por todo el clip, lo que evita rodar de nuevo escenas con coreografía compleja.
- Sustitución de personajes en secuencias de acción: al seguir movimientos rápidos fotograma a fotograma, resulta adecuado para artes marciales, danza o deporte donde otros sistemas emborronan la silueta.
- Prototipado rápido de casting: generar variantes de un mismo plano con distintos intérpretes pintados sobre el fotograma base para evaluar decisiones creativas antes del rodaje.
- Contenido de parodia y entretenimiento: inserción de figuras en escenas conocidas, como demuestra el ejemplo de la Casa Blanca publicado por la comunidad.
- Previsualización de VFX en pipelines de efectos: el modelo entrega un clip terminado en tres pasadas y 26 segundos por plano en una B200, lo que permite iterar sobre la apariencia del personaje sin recalcular el movimiento.
- Integración en flujos de ComfyUI: los nodos de la comunidad permiten encadenar el repintado del fotograma con modelos de imagen como `gpt-image` y la propagación con Viggle-Animate dentro de un grafo reproducible.
- Localización de contenido: adaptar el reparto visible de un clip a mercados o versiones alternativas manteniendo el metraje original de cámara y montaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo aportado por el autor es una comparación de velocidad en condiciones equivalentes:

| Metrica | Viggle-Animate | Wan2.2-Animate-14B |
|---|---|---|
| Fotogramas generados | 124 | 124 |
| Tiempo por clip | 26 s | no disponible (6,1× más lento por clip) |
| GPU | B200 | B200 |
| Pasadas forward | 3 (destilación DMD) | no disponible |

## Requisitos de hardware

- El autor reporta 26 segundos por plano de 124 fotogramas en una única GPU B200.
- VRAM estimada para inferencia: no disponible en la información proporcionada; con 33,1 B de parámetros y pesos safetensors en un repositorio de 69,1 GB, el peso en precisión de entrenamiento ronda los 66 GB, por lo que la inferencia en precisión completa excede con holgura las GPU de consumo.
- GPU recomendadas: B200 según la medición del autor; para el resto de aceleradores (H100, A100, RTX 4090) no hay datos publicados.
- Cabe en GPU de consumo: no disponible; no se documentan cuantizaciones que permitan reducir la huella.
- Opciones de despliegue: librería `minimax-h3`, integración con `diffusers` y nodos de ComfyUI (`ComfyUI-Viggle-Animate-H3`). Soporte de vLLM, llama.cpp, Ollama o TGI: no aplicable, al no ser un modelo de lenguaje.
- Latencia y throughput: 124 fotogramas en 26 s por clip en B200 según el autor; sin datos para otros aceleradores.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Velocidad relativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Viggle-Animate | 33,1 B | Reemplazo de personaje desde un fotograma repintado, sin pose ni máscara | 1× (26 s / 124 frames en B200) | minimax-h3-community-license | Hugging Face, ComfyUI |
| Wan2.2-Animate-14B | 14 B (según denominación) | Reemplazo de personaje en vídeo | 6,1× más lento por clip según el autor | no disponible en la información | no disponible en la información |
| Viggle-Remake | no disponible | Reemplazo de varios personajes, edición de objetos, fondos, clima e iluminación, con agente MCP | no disponible | no disponible | Hugging Face (Viggle/Viggle-Remake) |

## Limitaciones y advertencias

- El propio autor recomienda Viggle-Remake para proyectos nuevos; Viggle-Animate queda como generación anterior y no cubre la edición de varios personajes simultáneos, objetos, fondos, clima ni iluminación.
- El modelo no acepta prompt de texto ni codificador de identidad: la calidad del resultado depende críticamente de la calidad del fotograma repintado, que debe prepararse manualmente en un editor de imágenes.
- Solo propaga la edición dentro de un plano; no orquesta secuencias completas ni montajes con cortes.
- Riesgo de alucinación visual y de artefactos en oclusiones extremas, desenfoques de movimiento o cambios de iluminación bruscos: no se documentan métricas de fidelidad que permitan acotar este riesgo.
- Sesgos conocidos: no disponibles en la información proporcionada; al operar sobre metraje real y personajes repintados, hereda los sesgos del material de entrada y del modelo de imagen usado para el repintado.
- Restricciones de licencia: se rige por la `minimax-h3-community-license`, que no es una licencia de código abierto estándar; debe revisarse el archivo `LICENSE` antes de cualquier uso comercial.
- Uso responsable: la sustitución de personas en vídeo facilita la creación de contenido engañoso; el ejemplo del autor incluye un descargo explícito de parodia y aclara que las personas mostradas no participaron ni aprobaron el material.
- No hay datos publicados sobre cuantizaciones, VRAM mínima ni rendimiento en GPU de consumo, lo que dificulta planificar despliegues fuera de hardware de centro de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Viggle/Viggle-Animate
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Modelo sucesor recomendado: https://huggingface.co/Viggle/Viggle-Remake
- Demo en Spaces: https://huggingface.co/spaces/Viggle/viggle-animate
- Artículo de investigación: https://viggle.ai/research/viggle-animate-character-replacement-from-a-repainted-frame
- Nodos de ComfyUI: https://github.com/Saganaki22/ComfyUI-Viggle-Animate-H3
- Página del producto: https://viggle.ai/h3
- Sitio de Viggle: https://viggle.ai/
- Herramientas gratuitas de Viggle: https://viggle.ai/tools
