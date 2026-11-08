# vaultai/Arete-27B-MLX-4bit

## Resumen

Arete-27B-MLX-4bit es una conversión cuantizada a 4 bits en formato MLX del modelo NousResearch/Arete-27B, un ajuste fino por SFT orientado a alineación de valores sobre Qwen3.8-27B. La conversión la publica el usuario vaultai y está pensada para ejecutar el modelo en Apple Silicon mediante MLX y LM Studio, no para servidores con GPU NVIDIA.

El modelo conserva la arquitectura y las capacidades del checkpoint base (27.356 millones de parámetros, pipeline image-text-to-text, es decir, multimodal con entrada de imagen y texto), pero reduce el peso en disco hasta unos 16,1 GB gracias a una cuantización de 4 bits a 4,695 bits por peso. Esto lo hace viable en equipos con memoria unificada de gama alta, como el MacBook probado por el autor.

Es relevante porque permite probar localmente un modelo de 27B con visión y razonamiento en hardware de consumo Apple, algo que en BF16 requeriría bastante más memoria. La licencia Apache-2.0 del modelo base facilita su uso comercial, aunque la información publicada sobre rendimiento y benchmarks es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles no disponibles) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX (4,695 bpw); el modelo base admite Q4_K_M, Q8_0 y MLX 4-bit segun fuentes externas |
| Idiomas soportados | en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), ~16,1 GB en disco |

## Arquitectura y entrenamiento

El modelo es una conversión del checkpoint BF16 de NousResearch/Arete-27B (revisión 108f0afbdcfaa1ceeda4a635004304dfff6d4da2), realizada con `mlx_vlm.convert` a 4 bits. El modelo base es, segun la model card, un SFT de alineación de valores sobre Qwen3.8-27B, por lo que hereda la arquitectura de la familia Qwen3.8. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La innovación práctica de esta publicación es la propia conversión: empaquetado MLX de 4 bits con 4,695 bits por peso que reduce el modelo a unos 15 GiB en disco, con verificación de carga en el runtime MLX de LM Studio. No se documentan técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento aritmético básico: la model card verifica 17 × 23 = 391 y √169 = 13.
- Comprensión de imágenes (image-text-to-text): se validó la identificación de una imagen de color sólido.
- Conversación multi-turno (tag conversational).
- Capacidades multilingües limitadas al inglés segun los metadatos (en).
- Soporte de tool calling, function calling y agentes: no disponible en la información publicada.
- Modo thinking explícito, audio u otras modalidades: no disponible.

## Casos de uso

- Prototipado local en Mac: cargar el modelo en LM Studio con el runtime MLX para probar un modelo de 27B con visión sin GPU dedicada, aprovechando los ~16 GB en disco y la memoria unificada del equipo.
- Asistente de razonamiento y cálculo en escritorio: usar el modelo para resolver problemas aritméticos y de lógica sencillos en flujos offline, dado el comportamiento verificado en las pruebas de la model card.
- Análisis de imágenes en local: clasificar o describir imágenes sencillas (colores, objetos básicos) en aplicaciones de escritorio donde no se quiera enviar datos a la nube.
- Evaluación de alineación de valores: estudiar el comportamiento del SFT de Nous Research en conversaciones, comparándolo con Qwen3.8-27B sin ajustar, gracias a la licencia Apache-2.0.
- Base para experimentos de cuantización: servir como referencia para comparar la calidad de la conversión MLX 4-bit frente al checkpoint BF16 o frente a la variante Splash del mismo modelo.
- Desarrollo de demos conversacionales en inglés: integrar el modelo en una app de chat de escritorio para pruebas de concepto, dado su soporte de pipeline conversacional y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento publicados son mediciones de velocidad del autor: 31,2 tok/s en decodificación con una sola secuencia, prompt de ~60 tokens, temperatura 0 y ajustes de carga por defecto, en un M5 Max con 128 GB. La variante Splash del mismo modelo alcanza 104,5 tok/s en el runtime Splash de LM Studio.

## Requisitos de hardware

- VRAM/memoria estimada: ~16,1 GB en disco para los pesos MLX 4-bit; se necesita memoria unificada suficiente para pesos más caché KV y contexto (el autor lo probó con 128 GB, aunque el mínimo real no se documenta).
- GPU recomendadas: Apple Silicon con runtime MLX (probado en M5 Max). No es un formato para CUDA.
- ¿Cabe en GPU de consumo? En GPUs NVIDIA no es el formato adecuado; para esas plataformas existen variantes GGUF del modelo base (Q4_K_M de 17,20 GB, Q8_0 de 28,67 GB).
- Opciones de despliegue: LM Studio con runtime MLX (catalogado como `arete-27b-mlx`), `mlx-vlm` directamente, o la variante Duckets/Arete-27B-Splash para mayor velocidad.
- Latencia y throughput: 31,2 tok/s en decodificación según la prueba del autor en M5 Max; no hay datos de latencia de prefill ni de throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| vaultai/Arete-27B-MLX-4bit | 27,36B | no disponible | MLX safetensors 4-bit (~16,1 GB) | Apache-2.0 | Conversión para Apple Silicon |
| NousResearch/Arete-27B | 27,36B | no disponible | BF16 | Apache-2.0 | Modelo base, SFT de alineación sobre Qwen3.8-27B |
| Duckets/Arete-27B-Splash | 27,36B | no disponible | Splash (MLX) | Apache-2.0 (presumible) | Misma base, 104,5 tok/s en LM Studio |
| Arete-27B GGUF Q4_K_M | 27,36B | no disponible | GGUF (17,20 GB) | Apache-2.0 | Para llama.cpp y GPUs no Apple |

## Limitaciones y advertencias

- Idiomas: los metadatos solo declaran inglés; el rendimiento en castellano no está verificado.
- Sesgos: no hay documentación sobre sesgos del modelo base ni de la conversión.
- Alucinación: no se han publicado evaluaciones de fiabilidad; las pruebas del autor se limitan a aritmética simple y una imagen de color sólido.
- Licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base NousResearch/Arete-27B y de Qwen3.8-27B.
- Contexto: la longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas.
- Compatibilidad: al ser MLX, no funciona en GPUs NVIDIA; requiere Apple Silicon y herramientas del ecosistema MLX.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las únicas verificaciones son pruebas de humo del autor.

## Enlaces

- Hugging Face: https://huggingface.co/vaultai/Arete-27B-MLX-4bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Variante Splash: https://huggingface.co/Duckets/Arete-27B-Splash
- Análisis de requisitos de memoria: https://modelfit.io/blog/arete-27b-nous-research-mac-memory-requirements/
- Registro en free2aitools: https://free2aitools.com/model/duckets/arete-27b-mlx-4bit
