# VertexAGI/prism-lyric-1-mini

## Resumen

Prism Lyric 1 Mini es un modelo especializado en la escritura de letras de canciones, desarrollado por VertexAGI mediante fine-tuning con LoRA sobre Qwen3-4B. Su propósito es concreto: recibe un brief breve (género, estado de ánimo, temática, perspectiva y una de tres estructuras de secciones fijas) y devuelve una letra completa y titulada, con etiquetas de sección entre corchetes (`[Verse 1]`, `[Chorus]`, etc.) listas para un compositor humano o para un generador de música por IA que interprete dichas etiquetas.

El modelo forma parte de la familia Prism de especialistas de propósito único, de un laboratorio pequeño e independiente que trabaja en abierto. Con 4.022.468.096 parámetros (4B), se distribuye en tres formatos dentro del mismo repositorio: pesos MLX con capas ajustadas en 8 bits y el resto en 4 bits (3,07 GB), y dos GGUF (Q4_K_M de 2,50 GB y Q8_0 de 4,28 GB). La licencia es Apache 2.0 y el idioma declarado es únicamente inglés.

Su relevancia radica en la mejora medida frente al modelo base: en un conjunto de 36 briefs de validación escritos a mano, el 80,6% de las salidas respetaron exactamente la estructura solicitada, frente al 8,3% de Qwen3-4B base. No obstante, el propio autor advierte de que un modelo mucho mayor sigue escribiendo mejor, por lo que debe tratarse como un generador de primeros borradores, no como sustituto de un modelo grande.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B con adaptador LoRA) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX mixta (capas ajustadas 8-bit, resto 4-bit), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | inglés (declarado); otros idiomas con errores gramaticales según el autor |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B, un transformer decoder-only, y se ajusta mediante LoRA para una tarea de escritura creativa estructurada. El autor no detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset, más allá de indicar que los briefs de entrenamiento se generaron de forma separada y que los briefs de evaluación se escribieron a mano y nunca se mostraron a ningún modelo profesor.

La innovación principal no es arquitectónica sino de formato: el modelo se entrena para producir salidas con una plantilla rígida (línea `Title:`, etiquetas de sección entre corchetes en líneas propias y una de tres estructuras predefinidas), lo que lo hace directamente consumible por generadores de música por IA. El autor reporta que la pérdida de validación fue mínima tras los primeros 200 pasos (1,661) y subió ligeramente después (1,697 al final), señal de un sobreajuste leve al estilo de entrenamiento. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de letras de canciones completas y tituladas en inglés, con etiquetas de sección entre corchetes.
- Cumplimiento estricto de una de tres estructuras fijas: (1) Verse - Chorus - Verse - Chorus - Bridge - Chorus - Outro; (2) Verse - Pre-Chorus - Chorus - Verse - Pre-Chorus - Chorus - Bridge - Chorus; (3) Intro - Verse - Chorus - Instrumental - Verse - Chorus - Outro.
- Aceptación de briefs con género, estado de ánimo, temática y perspectiva, además de líneas `Extra:` opcionales y repetibles.
- Conversación multi-turno mediante la plantilla de chat de Qwen3 (el modelo se etiqueta como `conversational`).
- Escritura creativa en general, aunque el ajuste está orientado a letras.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Composición asistida para compositores: el modelo genera un primer borrador completo con estructura y etiquetas de sección a partir de un brief de género y temática, que el letrista revisa y reescribe; es adecuado porque el 80,6% de las salidas respetan la estructura pedida.
- Generación de letras para herramientas de música por IA: plataformas que interpretan `[Verse 1]` y `[Chorus]` pueden consumir la salida directamente, ya que el formato de etiquetas es exactamente el esperado por esos motores.
- Prototipado rápido de canciones en estudios pequeños: permite pasar de un brief de una línea a una letra estructurada en segundos en hardware de consumo, con GGUF Q4_K_M de 2,50 GB.
- Exploración de variantes creativas: con temperatura 0,7 y top-p 0,9 se pueden generar múltiples borradores del mismo brief para comparar enfoques de estribillo o de puente.
- Educación y talleres de escritura: sirve como ejemplo de estructura lírica (verso, estribillo, puente, outro) para enseñar forma musical.
- Integración en flujos locales en Apple Silicon: los pesos MLX permiten ejecutar el modelo con `mlx-lm` sin conexión, útil para entornos con requisitos de privacidad.
- Generación de contenido para maquetas y demos: letras de relleno para pruebas de producción musical antes de la letra definitiva.

## Benchmarks y rendimiento

Resultados sobre 36 briefs de validación escritos a mano (12 por estructura), nunca usados en el entrenamiento:

| Métrica | Qwen3-4B base | Prism Lyric 1 Mini | Modelo de referencia mucho mayor |
|---|---:|---:|---:|
| Estructura exactamente solicitada (verificación por código) | 8,3% | 80,6% | 10,7% |
| Puntuación media de oficio (0-1, verificación por código) | 0,744 | 0,916 | 0,926 |
| Palabras medias por canción | 285 | 264 | 430 |

Verificación de estructura en las builds distribuidas: MLX mixta 8/4 bits 91,7%, GGUF Q8_0 91,7%, GGUF Q4_K_M 80,6%. La cifra de 80,6% se midió sobre el LoRA sin fusionar, con ruido de muestreo de unos pocos puntos porcentuales.

Evaluación por jueces LLM (comparaciones anonimizadas y barajadas): Nemotron-3 Ultra clasificó al modelo ajustado por encima del base en 23 de 36 comparaciones; Mistral Large 4 en 17 de 20 (respondió solo a 20 de los 36 briefs). Ambos jueces coincidieron en 15 de los 20 briefs que ambos evaluaron a favor del ajustado y en 2 a favor del base. El modelo de referencia mayor quedó por encima de Prism Lyric 1 Mini en todas las comparaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5 GB con GGUF Q4_K_M, 3,07 GB con MLX mixta y 4,28 GB con GGUF Q8_0, más el overhead del runtime.
- GPU recomendadas: no se especifican; por tamaño, cabe en GPUs de consumo con 6-8 GB de VRAM o más.
- Cabe en GPU de consumo: sí, en tarjetas tipo RTX 3060, RTX 4060, RTX 4090 y superiores; también en Apple Silicon mediante MLX.
- Opciones de despliegue: `mlx-lm` (MLX en Apple Silicon), llama.cpp, Ollama y LM Studio (GGUF). El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI.
- Latencia y throughput: no disponibles en la información proporcionada.
- Parámetros de muestreo recomendados por el autor: temperatura 0,7, top-p 0,9, `max_tokens` de 1000.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Estructura solicitada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prism Lyric 1 Mini | 4B | no disponible | 80,6% | Apache 2.0 | Hugging Face (MLX, GGUF) |
| Qwen3-4B (base) | 4B | no disponible | 8,3% | Apache 2.0 | Hugging Face |
| Modelo de referencia mucho mayor (sin identificar) | no disponible | no disponible | 10,7% | no disponible | no disponible |

No se dispone de datos de otros especialistas en letras de canciones comparables en la información proporcionada.

## Limitaciones y advertencias

- Estribillos perezosos: a veces repiten una misma línea varias veces o reutilizan una frase entre secciones.
- Imaginario desigual: hay líneas concretas y frescas, pero también relleno y alguna línea sin sentido.
- Predominantemente inglés: los briefs en otros idiomas producen errores gramaticales.
- Briefs con formatos poco habituales se siguen de forma laxa; por ejemplo, un «diálogo entre dos personas» tiende a salir como una sola voz.
- Es un escritor de borradores: el autor recomienda tratar la salida como primer borrador, no como letra final.
- Sobreajuste leve al estilo de entrenamiento: la pérdida de validación subió de 1,661 (paso 200) a 1,697 al final.
- Los jueces LLM son ruidosos y pueden favorecer a su propia familia; conviene leer las letras generadas directamente.
- Licencia Apache 2.0: permite uso comercial, pero no se documentan garantías ni restricciones adicionales más allá de las de dicha licencia.

## Enlaces

- Hugging Face: https://huggingface.co/VertexAGI/prism-lyric-1-mini
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
