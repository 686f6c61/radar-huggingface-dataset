# tencent/WeMM-Video-9B-GGUF

## Resumen

WeMM-Video-9B-GGUF es la distribucion cuantizada en formato GGUF (receta Q4_K_M) del modelo multimodal WeMM-Video-9B, desarrollado por Tencent. Forma parte de la familia WeMM-Video, orientada a la comprension y el razonamiento conjunto de audio y video (audio-visual understanding and reasoning), y es capaz de aceptar texto, imagenes, audio y video como entrada para generar respuestas en texto. El repositorio incluye tres componentes empaquetados de forma independiente: el modelo de lenguaje, el codificador visual con su proyector y el codificador de audio con su proyector.

El modelo se apoya en la arquitectura `qwen3_5` (segun la etiqueta del repositorio) y esta pensado para ejecutarse mediante el runtime nativo propio de WeMM, no mediante llama.cpp generico. Es un modelo bilingue chino-ingles y esta publicado bajo licencia Apache 2.0, lo que facilita su adopcion tanto en investigacion como en productos comerciales.

Su relevancia actual radica en que ofrece comprension omni-modal (video con banda sonora, audio e imagen) en un tamano manejable de aproximadamente 9B parametros nominales y con una cuantizacion que reduce el peso del modelo de lenguaje a unos 10,41 GiB, lo que lo hace viable en hardware de gama alta de consumo si se dispone del runtime adecuado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer multimodal con codificador visual y codificador de audio) |
| Parametros totales | 1.078.789.128 (dato de safetensors del modelo base); la denominacion comercial es 9B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (tensores seleccionados de atencion y entrada/salida en BF16) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (language.gguf, mmproj.gguf, audio.gguf) |

## Arquitectura y entrenamiento

WeMM-Video-9B es un modelo multimodal que combina un modelo de lenguaje base de la familia Qwen 3.5 con un codificador visual (y su proyector) y un codificador de audio (y su proyector), de forma que el modelo puede procesar conjuntamente fotogramas de video e imagen junto con la pista de audio original. La distribucion GGUF separa explicitamente estos tres bloques: `language.gguf` (modelo de lenguaje, tokenizador y plantilla de chat, 10,41 GiB), `mmproj.gguf` (codificador visual y proyector, 0,86 GiB) y `audio.gguf` (codificador de audio y proyector, 2,01 GiB).

La receta de cuantizacion Q4_K_M mantiene en BF16 tensores seleccionados de atencion y de entrada/salida, lo que preserva precision en las partes mas sensibles del modelo. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si se aplicaron tecnicas de RLHF o DPO. El informe tecnico asociado (arXiv 2611.26409) se titula "WeMM-Video: Pushing the Frontiers of Open-Source Omni-Modal Video Understanding" y esta firmado por Changli Tang, Jie Yang, Tianyi Wang, Lei Li, Daoze Zhang, Zijie Xin, Zhan Liu, Li Li, Jinchang Xu, Fengyun Rao, Chao Zhang y Jing Lyu.

## Capacidades

- Comprension de video: procesa secuencias de fotogramas (`--video`, con control del numero de fotogramas mediante `--max-frames`) y describe o razona sobre lo que ocurre en pantalla.
- Comprension audio-visual conjunta: con `--video-audio` procesa fotogramas y la banda sonora original de forma simultanea, permitiendo describir la escena y resumir el habla.
- Comprension de imagen: acepta imagenes individuales y responde preguntas sobre su contenido.
- Comprension y transcripcion de audio: acepta archivos de audio y puede transcribir el habla (el ejemplo de la model card transcribe una locucion en ingles).
- Generacion de texto y razonamiento: incluye ejemplos de razonamiento aritmetico simple en modo texto ("A 20-minute meeting starts at 09:45. When does it end?").
- Capacidad multilingue limitada a chino e ingles.
- Soporte de peticiones solo texto (sin adjuntar medios).
- No se documenta en la informacion disponible soporte de tool calling, function calling, modo thinking explicito ni capacidades de agente multi-paso.

## Casos de uso

- Analisis de reuniones y videoconferencias: el modelo puede recibir el video con su pista de audio y generar un resumen de la escena junto con la sintesis del habla, aprovechando el procesamiento conjunto de fotogramas y sonido mediante `--video-audio`.
- Moderacion y catalogacion de contenido audiovisual: permite describir automaticamente lo que ocurre en un clip (acciones en pantalla, habla asociada) para etiquetar y clasificar grandes volumenes de video.
- Accesibilidad: generacion de descripciones de escenas y transcripciones de audio para personas con discapacidad visual o auditiva, combinando la salida de descripcion visual y la transcripcion del habla.
- Analisis de material de archivo historico: el propio ejemplo de la model card usa metraje del Apolo 11 (imagen, audio y video), un escenario realista para digitalizar y describir fondos documentales.
- Asistentes de soporte sobre imagenes: atencion de consultas donde el usuario adjunta una fotografia (por ejemplo, un producto o un documento) y el modelo responde en ingles o chino.
- Investigacion en comprension omni-modal: al estar bajo Apache 2.0 y con pesos GGUF, sirve como base reproducible para experimentos academicos de video-text-to-text en entornos con recursos limitados.
- Procesamiento en local con runtime nativo: el bundle permite ejecutar inferencia en CPU (con offload opcional a CUDA) para prototipos y pruebas sin depender de infraestructura cloud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a los resultados de evaluacion de la variante WeMM-Video-35B-A3B para la comparacion de benchmarks del informe tecnico, pero no incluye cifras propias para este modelo.

## Requisitos de hardware

- El bundle GGUF ocupa 14,3 GB en el repositorio; los tres archivos suman aproximadamente 13,28 GiB (10,41 GiB + 0,86 GiB + 2,01 GiB).
- Para cargar el conjunto completo en memoria/VRAM se necesita al menos ese espacio, mas el overhead del runtime y de las activaciones; una GPU de 16 GB o mas deberia ser suficiente para el conjunto en Q4_K_M, aunque la cifra exacta no esta documentada.
- El runtime nativo de WeMM permite ejecucion en CPU y ofrece offload a CUDA (segun la guia `native/README.md`), por lo que es posible ejecutarlo sin GPU, con mayor latencia.
- Opciones de despliegue: exclusivamente el runtime nativo de WeMM (`native/run_hf.py` con `huggingface_hub`). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Es importante mantener los tres archivos GGUF en la misma revision del Hub y fijarla con `--revision`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| WeMM-Video-9B-GGUF (este) | ~9B (nominal) | no disponible | texto, imagen, audio, video | apache-2.0 | GGUF |
| WeMM-Video-35B-A3B | 35B (A3B, MoE) | no disponible | texto, imagen, audio, video | no disponible en la informacion | no disponible |
| Otros modelos omni-modales de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica alternativa documentada en la informacion proporcionada es la variante mayor de la misma familia, WeMM-Video-35B-A3B, que sirve como referencia de evaluacion en el informe tecnico. No se dispone de datos para comparar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Idiomas: solo se declaran ingles y chino; el rendimiento en castellano no esta garantizado ni documentado.
- Riesgo de alucinacion: no se documentan tasas de error ni evaluaciones de fidelidad; como todo modelo generativo, puede producir descripciones inexactas de videos o transcripciones erroneas.
- Sesgos: no se dispone de informacion sobre sesgos conocidos ni sobre el proceso de alineacion.
- Dependencia del runtime: el modelo requiere el runtime nativo de WeMM y no funciona con llama.cpp generico, lo que limita las opciones de despliegue y la portabilidad.
- Integridad del bundle: los tres archivos GGUF deben provenir de la misma revision; mezclar revisiones puede producir fallos.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar el procesamiento de videos largos; el ejemplo usa `--max-frames 16`.
- Licencia: Apache 2.0 permite uso comercial, pero los componentes de terceros incluidos siguen sujetos a sus terminos originales (ver el archivo LICENSE del repositorio GitHub).
- Inconsistencia de parametros: la etiqueta comercial indica 9B, mientras que el dato de safetensors del modelo base registra 1.078.789.128 parametros; conviene verificar el conteo real antes de dimensionar hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tencent/WeMM-Video-9B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Video-9B
- Coleccion WeMM-Video: https://huggingface.co/collections/tencent/wemm-video
- Informe tecnico (arXiv): https://arxiv.org/abs/2611.26409
- Pagina del paper en Hugging Face: https://huggingface.co/papers/2611.26409
- Repositorio GitHub: https://github.com/Tencent/WeMM-Video
- Guia del runtime nativo: https://github.com/Tencent/WeMM-Video/blob/main/native/README.md
- Evaluacion de WeMM-Video-35B-A3B: https://huggingface.co/tencent/WeMM-Video-35BA3B#evaluation
- Licencia y atribuciones de terceros: https://github.com/Tencent/WeMM-Video/blob/main/LICENSE
