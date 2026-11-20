# tencent/WeMM-Video-35BA3B-GGUF

## Resumen

WeMM-Video-35B-A3B es un modelo multimodal desarrollado por Tencent para la comprensión y el razonamiento conjuntos de audio y vídeo, con soporte adicional de texto e imagen. Forma parte de la familia WeMM-Video, una línea bilingüe chino-inglés que acepta entradas de texto, imagen, audio y vídeo, y genera respuestas en texto. La arquitectura interna se identifica en los metadatos como una variante MoE de la familia Qwen 3.5 (etiqueta `wemm_qwen3_5_moe`), con un total de 35B de parámetros y 3B activos por token, según la nomenclatura A3B del nombre.

Este repositorio concreto contiene el paquete cuantizado GGUF Q4_K_M del modelo base `tencent/WeMM-Video-35BA3B`, pensado para ejecutarse con el runtime nativo propio de WeMM. El bundle se distribuye en tres ficheros separados: el modelo de lenguaje (22,61 GiB), el codificador visual y su proyector (0,84 GiB) y el codificador de audio y su proyector (1,99 GiB). La receta Q4_K_M preserva en BF16 determinados tensores de atención y de entrada/salida, lo que busca mantener la calidad en las partes más sensibles.

Su relevancia radica en que cubre una modalidad poco frecuente en modelos abiertos: la comprensión conjunta de pistas visuales y sonoras sincronizadas en vídeo, con licencia Apache 2.0 y pesos cuantizados listos para despliegue en el runtime del autor. El modelo base declara 1.070.382.088 parámetros en safetensors según los metadatos del Hub, un dato que no concuerda con la denominación 35B-A3B y que conviene verificar antes de planificar el despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE multimodal (etiqueta `wemm_qwen3_5_moe`); codificadores separados de visión y audio con proyectores |
| Parámetros totales | 35B según la denominación del modelo; los metadatos del Hub indican 1.070.382.088 parámetros en safetensors (dato discrepante, no verificado) |
| Parámetros activos | 3B (según la nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (con tensores seleccionados de atención y entrada/salida en BF16); disponible también el modelo base sin cuantizar |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tres ficheros: `language.gguf`, `mmproj.gguf`, `audio.gguf`); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de mezcla de expertos (MoE) con 35B de parámetros totales y 3B activos por token, según la denominación del repositorio. La entrada multimodal se gestiona mediante componentes separados: un codificador visual con su proyector (`mmproj.gguf`) y un codificador de audio con su proyector (`audio.gguf`), que se combinan con el modelo de lenguaje (`language.gguf`, que incluye tokenizador y plantilla de chat). Esta separación en tres ficheros permite cargar y cuantizar cada componente de forma independiente y es la que espera el runtime nativo de WeMM.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de decodificación o atención específicas más allá de la propia arquitectura MoE. La model card únicamente confirma que el paquete GGUF fue validado con el runtime nativo en CPU para generación de texto, imagen, audio y vídeo con banda sonora.

## Capacidades

- Comprensión de vídeo: procesa fotogramas (`--video`) y permite limitar el número de frames (`--max-frames`).
- Comprensión audiovisual conjunta: procesa fotogramas junto con la pista de audio original (`--video-audio`) para describir escenas y resumir el habla de forma combinada.
- Comprensión de audio: transcripción y análisis de grabaciones de voz (ejemplo oficial de transcripción de habla en inglés a 16 kHz).
- Comprensión de imagen: descripción y análisis de contenido visual.
- Generación de texto y razonamiento: resuelve tareas de razonamiento textual, como el ejemplo de cálculo temporal incluido en la model card.
- Multilingüe: inglés y chino.
- Modo Instruct: la validación del benchmark se realizó en modo Instruct con decodificación greedy.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio en tiempo real: no disponible en la información proporcionada.

## Casos de uso

- Análisis de reuniones y videoconferencias: el modelo puede recibir el vídeo con su audio y generar un resumen de lo tratado, combinando la descripción de la escena con la transcripción del habla, gracias al modo `--video-audio`.
- Accesibilidad y subtitulado: transcripción de audio y descripción de escenas visuales para generar subtítulos enriquecidos o audiodescripciones de contenido audiovisual.
- Moderación de contenido audiovisual: análisis conjunto de imagen y sonido para detectar contenido inapropiado en plataformas de vídeo, aprovechando que procesa ambas modalidades en una sola pasada.
- Indexación y búsqueda de archivos multimedia: generación de descripciones textuales de vídeos y audios para alimentar motores de búsqueda o sistemas de recomendación.
- Asistentes de atención al cliente con soporte multimedia: el usuario puede enviar una imagen o un clip de audio y el modelo responde en inglés o chino, lo que encaja en mercados bilingües.
- Documentación técnica y análisis de material científico: descripción de imágenes (por ejemplo, fotografías astronómicas en los ejemplos oficiales) y transcripción de grabaciones para su posterior procesamiento.
- Despliegue en infraestructura limitada: al ser un MoE con 3B activos y estar cuantizado en Q4_K_M, puede ejecutarse con el runtime nativo en CPU o con offload a CUDA, lo que facilita prototipos en entornos sin GPU de gran capacidad.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| MMAR1000 (solo audio) | 72,9 % (729/1000) | Runtime nativo WeMM con CUDA sobre H20; audio completo decodificado a 16 kHz; modo Instruct; decodificación greedy; hasta 256 tokens de salida |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el bundle Q4_K_M ocupa aproximadamente 25,44 GiB en disco (22,61 + 0,84 + 1,99 GiB); se necesita al menos esa cifra de memoria unificada o VRAM, más overhead de contexto y caché KV.
- GPU recomendadas: la validación oficial se realizó en una H20 con CUDA. Para el paquete completo en Q4_K_M se requiere una GPU con 32 GB o más de VRAM (A100 40 GB, H100, L40S 48 GB) o varias GPU.
- ¿Cabe en GPU de consumo? El componente de lenguaje solo (22,61 GiB) podría caber en una RTX 4090 de 24 GB, pero el bundle completo con codificadores no cabe en una sola GPU de consumo de 24 GB; sería necesario offload a CPU o dividir la carga.
- Opciones de despliegue: runtime nativo de WeMM (`native/run_hf.py`), con soporte de CPU y offload a CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, se trata de un modelo multimodal abierto (Apache 2.0) de 35B totales y 3B activos que cubre texto, imagen, audio y vídeo, una combinación de modalidades menos común que la de los modelos visión-lenguaje puros; la comparación con alternativas concretas requeriría datos que no se han publicado aquí.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está documentado y probablemente sea limitado.
- Datos discrepantes: la cifra de parámetros en safetensors (1.070.382.088) no concuerda con la denominación 35B-A3B; conviene verificar el tamaño real antes de dimensionar el hardware.
- Longitud de contexto: no documentada, lo que impide planificar tareas de contexto largo con garantías.
- Licencia: Apache 2.0 permite uso comercial, pero los componentes de terceros incluidos siguen sujetos a sus términos originales, que deben revisarse en el repositorio del proyecto.
- Dependencia del runtime: el bundle está pensado para el runtime nativo de WeMM; no se documenta compatibilidad con ecosistemas estándar como llama.cpp u Ollama, lo que limita la portabilidad.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación en las modalidades de audio y vídeo.
- Sesgos: no se documentan análisis de sesgo ni de seguridad.
- Consistencia del bundle: los tres ficheros GGUF deben mantenerse en la misma revisión del Hub; mezclar revisiones puede producir fallos de carga.
- Validación limitada: la validación oficial se reduce a comprobaciones de generación y a un único benchmark de audio (MMAR1000), sin resultados publicados para vídeo, imagen o texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeMM-Video-35BA3B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-35BA3B
- Repositorio del proyecto: https://github.com/Tencent/WeMM-Video
- Guía del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
