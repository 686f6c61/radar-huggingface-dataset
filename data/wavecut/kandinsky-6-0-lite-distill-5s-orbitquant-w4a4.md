# WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4

## Resumen

Esta ficha describe `WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4`, una conversión cuantizada del modelo de generación de vídeo con audio sincronizado Kandinsky 6.0 Lite distill (5 segundos), publicado originalmente por kandinskylab. La conversión la firma el usuario WaveCut (Valeriy Selitskiy) y aplica cuantización OrbitQuant de 4 bits: W4A4 sobre el transformer de difusión multimodal (DiT) y W4A6 sobre el codificador de texto y visión Qwen2.5-VL. Los VAE de vídeo y audio, el vocoder, el codificador CLIP y los procesadores se mantienen sin cuantizar, tomados del modelo original.

El objetivo es reducir el coste de memoria de la inferencia manteniendo el pipeline Diffusers original. Según la model card, en una RTX 3090 el ejemplo de guitarra acústica tarda 166,18 s frente a 184,60 s del checkpoint original, con un pico de memoria CUDA asignada de 6,10 GiB frente a 16,13 GiB. Es decir, un recorte de aproximadamente el 62 % en VRAM punta y una ligera mejora de latencia medida en ese escenario concreto.

El modelo base pertenece a la familia Kandinsky 6.0 Video, presentada con dos variantes: Lite (3B parámetros) y Pro (29B parámetros), capaces de generar clips de 5 segundos con audio sincronizado a 44 kHz, incluido lip-sync, en modos texto-a-audio-vídeo (T2AV) e imagen-a-audio-vídeo (I2AV). La relevancia de este release es práctica: permite ejecutar la variante Lite en GPUs de consumo con cuantización agresiva, aunque a fecha de publicación el repositorio no tiene descargas ni validación de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión multimodal (DiT) para generación conjunta de vídeo y audio; incluye codificador de texto/visión Qwen2.5-VL, codificador de texto CLIP, VAE de vídeo, VAE de audio + vocoder y scheduler PiFlow |
| Parametros totales | 1.872.514.320 según los tensores safetensors del repositorio cuantizado; el modelo base Lite pertenece a una familia de ~3B parámetros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | OrbitQuant W4A4 en el DiT (920 capas lineales) y W4A6 en Qwen2.5-VL (358 capas lineales); CLIP, VAE de vídeo, VAE de audio y vocoder sin cuantizar. La modulación de timestep/AdaLN se mantiene en FP32 y las proyecciones de entrada/salida conservan la precisión de origen |
| Idiomas soportados | no disponible |
| Licencia | other, con identificador `mit-and-apache-2.0` y enlace a NOTICE |
| Formato de pesos | safetensors (pesos empaquetados; Diffusers) |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un entrenamiento nuevo. La arquitectura subyacente es la de Kandinsky 6.0 Lite: un DiT multimodal para generación de vídeo con audio sincronizado, que combina un codificador de texto y visión Qwen2.5-VL, un codificador de texto CLIP, un VAE de vídeo, un VAE de audio con vocoder y un scheduler PiFlow. La variante distill está optimizada para generar clips de 5 segundos en pocos pasos (los ejemplos de la model card usan 10 pasos de PiFlow) a 864x480 y 24 FPS, con 121 fotogramas.

La aportación de este repositorio es la cuantización OrbitQuant. Se empaquetan dos componentes: el DiT en W4A4, con 3,540 GB de pesos empaquetados, y el codificador Qwen2.5-VL en W4A6, con 5,788 GB. En conjunto, 9,33 GB frente a los 9,3 GB que ocupa el repositorio completo. El resto de componentes se cargan desde el modelo original sin modificar. Solo se cuantizan las proyecciones de atención y feed-forward; la modulación temporal/AdaLN permanece en FP32 y las proyecciones de entrada y salida mantienen la precisión original. No se documentan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset) ni si hubo fases de RLHF o DPO, ya que corresponden al modelo base y no a esta conversión.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con duración de 5 segundos por clip.
- Generación de audio sincronizado con el vídeo, a 44 kHz según la documentación de la familia Kandinsky 6.0, incluido lip-sync en los modos T2AV e I2AV.
- Generación conjunta texto-a-audio-vídeo (T2AV), el modo principal de este pipeline.
- Salida a 864x480, 121 fotogramas, 24 FPS, con 10 pasos de scheduler PiFlow en los ejemplos publicados.
- Comprensión multimodal de la entrada mediante Qwen2.5-VL como codificador de texto y visión (el modo I2AV del modelo base admite entrada de imagen, aunque la model card de esta conversión solo documenta ejemplos de texto a vídeo).
- No soporta tool calling ni function calling: no es un modelo de lenguaje conversacional, sino un pipeline de difusión.
- No soporta agentes ni razonamiento multi-paso en el sentido de un LLM; el bucle de inferencia es el propio muestreo del scheduler de difusión.
- Capacidades multilingües: no disponibles (el repositorio no declara idiomas soportados).
- No se documentan modos de pensamiento (thinking), audio de entrada ni otras capacidades especiales adicionales.

## Casos de uso

- Prototipado de vídeo publicitario de formato corto: con clips de 5 segundos a 864x480 y audio sincronizado, el modelo permite generar variantes de un anuncio en una sola GPU de 24 GB, algo inviable con el checkpoint original en ese mismo hardware según los datos de VRAM de la model card.
- Previsualización de storyboards con sonido: guionistas y equipos de preproducción pueden obtener bocetos animados con diálogo o ambiente sonoro sincronizado sin depender de un pipeline de vídeo y otro de audio por separado.
- Generación de contenido para redes sociales: clips verticales u horizontales de 5 segundos con pista de audio integrada, generados en lote sobre una RTX 3090 con un pico de 6,10 GiB de VRAM asignada.
- Investigación en cuantización de modelos de difusión: el repositorio sirve como caso de estudio reproducible de OrbitQuant W4A4/W4A6 sobre un DiT multimodal, con comparativas de fotograma emparejado (original frente a DiT W4A4 frente a DiT W4A4 + Qwen W4A6) y semillas fijas documentadas.
- Evaluación de degradación por cuantización: comparar los pares de vídeos publicados (zorro en la nieve, semilla 61000; guitarra acústica, semilla 61001) permite medir el impacto visual y de audio de bajar el DiT a 4 bits antes de adoptar el modelo en un flujo real.
- Demostraciones y docencia sobre difusión multimodal: el pipeline se carga con Diffusers y los componentes sin cuantizar provienen del modelo original, lo que facilita explicar la separación entre codificador, DiT, VAE y vocoder en un caso real.
- Despliegue en estaciones de trabajo con una sola GPU consumer: al reducir el pico de VRAM de 16,13 GiB a 6,10 GiB en el escenario medido, abre la puerta a entornos de generación local sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye métricas estándar (FVD, CLIP score, MMLU u otras) ni comparaciones cuantitativas de calidad frente al modelo original más allá de la comparación visual por fotogramas emparejados. Los únicos datos numéricos de rendimiento son de latencia y memoria, recogidos en la sección de requisitos de hardware.

## Requisitos de hardware

- Tamaño en disco: 9,3 GB de repositorio; 9,33 GB corresponden a los dos componentes empaquetados (DiT W4A4, 3,540 GB; Qwen2.5-VL W4A6, 5,788 GB). El resto de componentes se cargan desde el modelo original.
- VRAM: pico de 6,10 GiB de memoria CUDA asignada en una RTX 3090 con el ejemplo de guitarra acústica (864x480, 121 fotogramas, 24 FPS, 10 pasos PiFlow). El checkpoint original requiere 16,13 GiB en el mismo escenario.
- Latencia: 166,18 s para el ejemplo de guitarra cuantizado frente a 184,60 s del original, en la misma RTX 3090. La model card indica que los resultados de latencia y VRAM son de la primera llamada.
- GPU recomendadas: RTX 3090 verificada. Cabe en GPUs de consumo con 24 GB. No se especifican requisitos para GPUs con menos VRAM (12-16 GB): no disponible.
- GPUs de datacenter (A100, H100): compatibles en principio por el pipeline Diffusers, pero no hay cifras de throughput publicadas: no disponible.
- Opciones de despliegue: Diffusers, cargando los dos componentes empaquetados en el pipeline original de Kandinsky 6.0; se conservan los procesadores, tokenizadores y el scheduler PiFlow del modelo base. No aplica a llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Componentes no cuantizados necesarios en el pipeline: CLIP text encoder, VAE de vídeo, VAE de audio y vocoder, todos tomados del modelo original.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Rendimiento medido | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky 6.0 Lite distill 5s OrbitQuant W4A4 (este) | 1.872.514.320 en safetensors cuantizados | Clips de 5 s; sin dato de contexto | 166,18 s y 6,10 GiB pico en RTX 3090 (ejemplo guitarra) | other, mit-and-apache-2.0 | HuggingFace, Diffusers |
| Kandinsky 6.0 Lite distill 5s (modelo base) | Familia Lite de ~3B; sin desglose exacto en la informacion disponible | Clips de 5 s | 184,60 s y 16,13 GiB pico en RTX 3090 (mismo ejemplo) | no disponible en la informacion proporcionada | HuggingFace, Diffusers |
| Kandinsky 6.0 Video Pro | 29B | Clips de 5 s, audio 44 kHz, hasta 1080p segun el sitio de demostracion | no disponible | no disponible | GitHub y demo en kandinsky6.pro |

No se dispone de datos comparativos frente a otras familias de generación de vídeo con audio (por ejemplo alternativas cuantizadas de la misma categoría), por lo que no se incluyen en la tabla.

## Limitaciones y advertencias

- La cuantización W4A4 sobre el DiT es agresiva; la model card solo ofrece comparación visual por fotogramas emparejados, sin métricas objetivas de fidelidad ni de sincronización audio-vídeo.
- Los números de latencia y memoria corresponden a un único escenario (RTX 3090, 864x480, 121 fotogramas, 10 pasos PiFlow, primera llamada) y no deben extrapolarse a otras resoluciones, duraciones o GPUs.
- El repositorio no declara idiomas soportados, por lo que no se puede garantizar el comportamiento con prompts en castellano ni en otros idiomas distintos del inglés.
- Licencia `other` con nombre `mit-and-apache-2.0`: es obligatorio revisar el fichero NOTICE antes de cualquier uso comercial, ya que las condiciones reales de explotación pueden diferir de las de MIT o Apache 2.0 por separado.
- El modelo es una conversión de terceros (WaveCut), no una publicación oficial de kandinskylab; la responsabilidad sobre el pipeline de carga recae en el usuario.
- Repositorio sin descargas ni likes en el momento de la consulta: no existe validación independiente de la comunidad sobre la calidad de los pesos empaquetados.
- Al ser un modelo de generación de vídeo, existe riesgo de resultados incoherentes o artefactos visuales y de desincronización entre audio y movimiento; no hay tasas de fallo publicadas.
- No es un modelo de lenguaje: no soporta tool calling, agentes, RAG ni razonamiento simbólico, por lo que no debe emplearse en tareas conversacionales.
- Duración fija de 5 segundos por clip en la variante distill-5s; no se documentan mecanismos de extensión en esta conversión.
- Requiere cargar componentes adicionales desde el modelo original (CLIP, VAE de vídeo, VAE de audio, vocoder), lo que añade dependencia de red y de disco más allá de los 9,3 GB del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4
- Modelo base: https://huggingface.co/kandinskylab/Kandinsky-6.0-Lite-distill-5s-Diffusers
- Fichero de licencia NOTICE: https://huggingface.co/WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4/blob/main/NOTICE
- Ejemplo zorro, original: https://huggingface.co/WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4/resolve/main/assets/fox-original.mp4
- Ejemplo zorro, OrbitQuant: https://huggingface.co/WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4/resolve/main/assets/fox-orbitquant.mp4
- Ejemplo guitarra, original: https://huggingface.co/WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4/resolve/main/assets/guitar-original.mp4
- Ejemplo guitarra, OrbitQuant: https://huggingface.co/WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4/resolve/main/assets/guitar-orbitquant.mp4
- Comparativa de fotogramas emparejados: https://huggingface.co/WaveCut/Kandinsky-6.0-Lite-distill-5s-OrbitQuant-W4A4/resolve/main/assets/original-vs-orbitquant.webp
- Repositorio GitHub de Kandinsky 6.0: https://github.com/kandinskylab/kandinsky-6
- Paper en arXiv: https://arxiv.org/abs/2610.05608
- Perfil del autor en HuggingFace: https://huggingface.co/WaveCut
- Demo en línea de Kandinsky 6.0: https://kandinsky6.pro/
