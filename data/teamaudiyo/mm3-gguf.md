# TeamAudiyo/MM3-GGUF

## Resumen

TeamAudiyo/MM3-GGUF es un repositorio de cuantizaciones en formato GGUF del backbone diffusion transformer (DiT) de MiniMax-Music3, un modelo de generación de música a partir de texto desarrollado por MiniMaxAI. El repositorio no contiene un modelo nuevo ni pesos entrenados desde cero: es un reempaquetado de los pesos del modelo original en distintas precisiones (de F16 a Q3_K_M), pensado para reducir el consumo de VRAM y permitir la inferencia local dentro de ComfyUI mediante el nodo personalizado ComfyUI-GGUF.

El modelo base genera canciones completas y estructuradas de hasta 5 minutos de duración en estéreo a 32 kHz, a partir de dos entradas de condicionamiento separadas: la letra (con marcadores de sección como [Verse] o [Chorus]) y una descripción musical en texto libre (género, BPM, tonalidad, tipo de voz y arreglo instrumental). La arquitectura subyacente es un transformer de difusión, no un modelo autorregresivo de lenguaje, por lo que su pipeline declarado en HuggingFace es text-to-audio y no text-generation.

Su relevancia práctica es la accesibilidad: el DiT ocupa unos 2,46 mil millones de parámetros y las cuantizaciones publicadas van de 4,98 GB (F16) a 1,16 GB (Q3_K_M), lo que rebaja el umbral de hardware necesario para generar música de forma local. El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de un artefacto reciente y con poca validación comunitaria.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) para generación de audio musical |
| Parámetros totales | 2.457.073.817 (~2,46 B) según el recuento de safetensors reportado en HuggingFace |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. El modelo base genera audio de hasta 5 minutos; no se especifica la ventana de contexto del text encoder |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (heredada del modelo original) |
| Formato de pesos | GGUF (el repositorio incluye varios ficheros); los ficheros acompañantes de text encoder y VAE están en safetensors |
| Ficheros publicados | MiniMax-Music3-F16.gguf (4,98 GB), Q8_0 (2,70 GB), Q6_K (2,12 GB), Q5_K_M (1,79 GB), Q4_K_M (1,49 GB), Q3_K_M (1,16 GB) |
| Tamaño del repositorio | 14,2 GB |
| Modelo base | MiniMaxAI/MiniMax-Music3 |
| Tarea (pipeline) | text-to-audio (text-to-music) |
| Resolución de audio | 32 kHz estéreo |

## Arquitectura y entrenamiento

El modelo base MiniMax-Music3 emplea un backbone de transformer de difusión (DiT) para generar audio musical. En este repositorio únicamente se cuantiza ese backbone: los ficheros GGUF sustituyen al DiT original, pero la generación completa requiere además un text encoder y un VAE que el autor distribuye por separado a través de Comfy-Org (minimax_music3_text_encoder_bf16.safetensors y minimax_music3_dav.safetensors). Es decir, la arquitectura efectiva en inferencia es un pipeline de tres componentes: codificación de texto, difusión latente sobre el DiT y decodificación del VAE al dominio de onda.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas del modelo original, porque la model card del repositorio de cuantización no los detalla y los resultados de la búsqueda web no aportan documentación técnica adicional. Lo único verificable es el proceso de cuantización: se ofrecen seis niveles de precisión, desde F16 sin comprimir (referencia) hasta Q3_K_M para VRAM muy baja, con la advertencia explícita del autor de que Q3_K_M puede introducir un "reblandecimiento audible" en el resultado, y la recomendación de Q8_0 como opción casi sin pérdida.

## Capacidades

- Generación de música completa a partir de texto, con estructura de canción y duración de hasta 5 minutos.
- Salida de audio en estéreo a 32 kHz.
- Condicionamiento dual: letra con marcadores de sección ([Verse], [Chorus], etc.) y descripción musical en texto libre.
- Control explícito de atributos musicales mediante el prompt: género, BPM, tonalidad, carácter emocional, tipo de voz (por ejemplo, "soft female lead"), arreglo instrumental y punto de entrada de cada instrumento.
- Generación de voces con letra, armonías apiladas y coros según lo que describa el prompt.
- Integración nativa en flujos de ComfyUI mediante el nodo Unet Loader (GGUF) de ComfyUI-GGUF.
- Compatible con cargadores estándar de CLIP/Text Encoder y VAE de ComfyUI para los ficheros acompañantes.
- Ejecución local en GPU de consumo tras la cuantización.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no disponibles (no se documenta qué idiomas admite la letra).
- Modo "thinking" / visión / audio de entrada: no disponibles.

## Casos de uso

- Maquetas musicales para compositores y productores: el modelo permite generar una versión completa y cantada de una idea a partir de la letra con marcadores de sección y una descripción de género, BPM y tonalidad, lo que acelera la validación de arreglos antes de grabar con músicos reales.
- Bandas sonoras para videojuegos y vídeo: se puede generar música de hasta 5 minutos en 32 kHz estéreo, adecuada para menús, cinemáticas o pistas de ambiente, condicionando el prompt a un género y una instrumentación concretos para mantener coherencia estilística entre pistas.
- Producción de jingles y audio publicitario: el control sobre BPM, tonalidad y estructura por secciones facilita generar variantes cortas de una misma idea musical para tests A/B de campañas, ajustando únicamente el prompt de descripción.
- Preproducción de karaoke y plantillas vocales: al separar letra y descripción musical, se pueden generar pistas con la voz guía y la armonía descritas, sirviendo como base para ensayos o para sustituir después la pista vocal.
- Generación local con requisitos de privacidad: al ejecutarse en ComfyUI sobre hardware propio, las letras y las descripciones no salen del equipo, lo que resulta relevante para material musical inédito o bajo acuerdo de confidencialidad.
- Contenido para creadores y podcasters: intros, cortinillas y música de fondo libres de dependencia de bibliotecas de terceros, con licencia Apache-2.0 heredada, siempre que se verifiquen las condiciones finales aplicables.
- Investigación en generación de audio: el conjunto de cuantizaciones (de F16 a Q3_K_M) permite estudiar la degradación perceptual del audio en función de la precisión de pesos sobre un mismo checkpoint, con un baseline F16 de referencia.
- Prototipado dentro de pipelines de ComfyUI: al integrarse como nodo Unet Loader (GGUF), se puede encadenar con otros nodos del grafo para flujos automatizados de generación por lotes de pistas musicales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye métricas objetivas (FAD, CLAP score, MOS, similitud de letra) ni comparaciones cuantitativas con otros modelos de generación musical, y los resultados de la búsqueda web no aportan datos adicionales.

## Requisitos de hardware

- Los pesos del DiT ocupan, según el fichero elegido: F16 4,98 GB, Q8_0 2,70 GB, Q6_K 2,12 GB, Q5_K_M 1,79 GB, Q4_K_M 1,49 GB y Q3_K_M 1,16 GB.
- A esos pesos hay que sumar el text encoder y el VAE, cuyos ficheros acompañantes (minimax_music3_text_encoder_bf16.safetensors y minimax_music3_dav.safetensors) se descargan por separado y consumen VRAM adicional. El autor no publica la huella total del pipeline.
- El propio autor recomienda Q4_K_M para equipos con GPU de 8 GB a 10 GB de VRAM, lo que sitúa la generación local al alcance de tarjetas de gama media como la RTX 3060 de 12 GB o la RTX 4060 Ti de 16 GB.
- Q8_0 (2,70 GB) es la opción recomendada para máxima fidelidad sin pérdida apreciable, y requiere más margen de VRAM que las variantes intermedias.
- Q3_K_M (1,16 GB) está pensado para VRAM muy baja, con la advertencia de posible deterioro audible.
- GPU recomendadas: no se especifican modelos concretos. Por tamaño de pesos, cualquier GPU con 8-10 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) es candidata para las cuantizaciones bajas; A100 o H100 solo estarían justificadas por throughput agregado o ejecución concurrente, no por requisitos de memoria.
- Despliegue: ComfyUI con la extensión ComfyUI-GGUF (nodo Unet Loader (GGUF)). No se documentan integraciones con vLLM, llama.cpp, Ollama, TGI ni otros servidores, que en principio no aplican a un pipeline de difusión de audio.
- Latencia y throughput estimados: no disponibles. No se publican tiempos de generación por minuto de audio ni requisitos de cómputo por pista.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| TeamAudiyo/MM3-GGUF (esta ficha) | 2,46 B (DiT cuantizado) | Audio de hasta 5 min, 32 kHz estéreo; contexto no disponible | Apache-2.0 | GGUF en HuggingFace + text encoder y VAE en Comfy-Org | Sin benchmarks publicados |
| MiniMaxAI/MiniMax-Music3 (modelo original) | No disponible | Audio de hasta 5 min, 32 kHz estéreo | Apache-2.0 | Pesos originales en HuggingFace | No disponible |
| Otros modelos de text-to-music (MusicGen, Stable Audio, etc.) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificables en la información proporcionada para comparar con alternativas de la misma categoría en parámetros, contexto, rendimiento o condiciones de licencia.

## Limitaciones y advertencias

- El repositorio es una cuantización, no un modelo entrenado: cualquier defecto de calidad, sesgo o limitación del modelo original MiniMax-Music3 se hereda íntegramente.
- La cuantización introduce pérdida de fidelidad. El autor advierte de un posible "reblandecimiento audible" en Q3_K_M; Q8_0 se presenta como la opción casi sin pérdidas.
- Los GGUF no son autosuficientes: sin el text encoder y el VAE de Comfy-Org el pipeline no genera audio. La VRAM total necesaria no se documenta.
- No se especifican los idiomas admitidos para la letra, ni la calidad del canto en idiomas distintos del inglés, dado que los ejemplos de la model card están en inglés.
- No se publican benchmarks objetivos (FAD, CLAP, MOS) ni evaluaciones comparativas, lo que impide estimar la calidad frente a alternativas.
- Existe una discrepancia en la propia model card: el comando de descarga por CLI hace referencia al repositorio "Abiray/MiniMax-Music3-GGUF", mientras que el identificador real del repositorio es TeamAudiyo/MM3-GGUF. Conviene verificar la procedencia de los ficheros antes de usarlos en producción.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad o seguridad.
- La licencia Apache-2.0 se hereda del modelo original, pero conviene revisar los términos del repositorio fuente y de los ficheros acompañantes de Comfy-Org antes de un uso comercial, especialmente en lo relativo a derechos sobre letras y voces generadas.
- Riesgo de alucinación aplicado a audio: es esperable que el modelo no respete literalmente BPM, tonalidad o instrumentación solicitados en el prompt, aunque no se documenta la magnitud de ese desvío.
- No se documentan limitaciones de longitud de contexto del text encoder, por lo que letras o descripciones muy extensas podrían truncarse sin aviso claro.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TeamAudiyo/MM3-GGUF
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-Music3
- Repack para ComfyUI (text encoders y VAE): https://huggingface.co/Comfy-Org/MiniMax-Music-3
- Text encoders: https://huggingface.co/Comfy-Org/MiniMax-Music-3/tree/main/text_encoders
- VAE: https://huggingface.co/Comfy-Org/MiniMax-Music-3/tree/main/vae
- Nodo personalizado ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Licencia Apache-2.0: https://huggingface.co/MiniMaxAI/MiniMax-Music3

Nota: la búsqueda web realizada no ha devuelto documentación técnica, papers ni artículos de blog relevantes sobre este modelo; los únicos resultados obtenidos han sido páginas de servicios de traducción sin relación con el contenido.
