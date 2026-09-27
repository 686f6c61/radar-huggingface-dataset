# TheGladian/LTX-2.3-uncensored-v1.4-FP8

## Resumen

LTX-2.3-uncensored-v1.4-FP8 es una compilación cuantizada y pre-fusionada del modelo de generación de vídeo LTX Video-2.3 de Lightricks, publicada por el usuario TheGladian. No se trata de un entrenamiento desde cero: sobre los pesos base de LTX-2.3 se han fusionado tres fine-tunes directamente en los pesos (baked-in), la LoRA Eros10 NSFW a fuerza 1.0, la LoRA destilada DMD a fuerza 1.0 y la ICLoRA Detailer oficial de LTXV a fuerza 0.6, y el resultado se distribuye en FP8 y GGUF. El objetivo declarado es la generación de vídeo con audio sin filtros de contenido, con tan solo 4 pasos de muestreo y mejor retención de identidad en image-to-video.

El modelo hereda una arquitectura DiT (Diffusion Transformer) y, según los datos de safetensors del repositorio, suma 21.005.004.544 parámetros (unos 21,01 B). El repositorio ocupa 239,0 GB, lo que incluye varias cuantizaciones, muestras de vídeo y flujos de trabajo de ComfyUI. La model card documenta generación en 4 pasos (8 recomendados para mejor calidad), resoluciones de ejemplo de 1280 × 736, clips de 121 fotogramas (unos 5 s) y secuencias de hasta 960 fotogramas (unos 40 s) con 9 pasos.

Su relevancia actual es doble: por un lado, empaqueta en un único artefacto una cadena de fine-tunes que normalmente hay que encadenar a mano en el grafo de muestreo; por otro, elimina las restricciones de contenido del modelo base, lo que lo sitúa en el terreno de los modelos marcados como `not-for-all-audiences`, con las implicaciones legales y de despliegue que eso conlleva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) para generación de vídeo, según la model card; heredada de Lightricks/LTX-2.3 |
| Parametros totales | 21.005.004.544 (~21,01 B), dato de safetensors del repositorio |
| Parametros activos | No aplica; no se indica que sea un modelo MoE |
| Longitud de contexto | No aplica como ventana de tokens (modelo de difusión). Duración documentada: 121 fotogramas (~5 s) en las muestras de 8 pasos y hasta 960 fotogramas (~40 s) con 9 pasos |
| Tipos de cuantizacion | FP8 y GGUF (etiquetas `gguf`, `quantized`; el nombre del repositorio indica FP8). Niveles GGUF concretos: no disponibles |
| Idiomas soportados | No disponible (no se declara lista de idiomas; todos los ejemplos de la model card están en inglés) |
| Licencia | Desconocida (`license: unknown`); el modelo base es de Lightricks y el fine-tune es de TheGladian |
| Formato de pesos | GGUF y FP8 (según etiquetas y nombre del repositorio); presencia de safetensors no confirmada |
| Tarea principal | `text-to-video`; también image-to-video, video-to-video y audio-to-video |
| Tamaño del repositorio | 239,0 GB |
| Modelos base | TenStrip/LTX2.3-10Eros, Lightricks/LTX-2.3, TenStrip/LTX2.3_DMD_Lora |
| Fecha de creación y actualización | 2026-09-27 (el mismo valor para ambos campos) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La base es LTX Video-2.3 de Lightricks, un modelo de difusión con arquitectura DiT (Diffusion Transformer) orientado a generación de vídeo, y presumiblemente con capacidad de audio sincronizado, a juzgar por las modalidades T2VA/FL2VA/I2VA/REF2VA y la etiqueta `audio-to-video`. Este repositorio no aporta entrenamiento propio: es un build pre-fusionado en el que se han integrado tres adaptadores en los pesos. El primero es la LoRA Eros10 NSFW (fuerza 1.0), descrita por el autor como orientada a calidad, coherencia y contenido NSFW. El segundo es la LoRA destilada DMD (fuerza 1.0), que aporta generación más rápida, mejor preservación facial en image-to-video y mejor seguimiento de instrucciones que la versión 1 o que el LTXV23 original. El tercero es la ICLoRA Detailer oficial de LTXV (fuerza 0.6), pensada para mejorar la adherencia a la imagen de referencia.

No se dispone de información sobre el número de tokens o fotogramas de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias; los datos de la model card solo describen la fusión de LoRA y los ajustes de inferencia. La innovación práctica del paquete es la destilación DMD combinada con el fusionado, que permite generar vídeo en 4 pasos (8 recomendados) sin encadenar LoRA manualmente. El autor documenta además un ajuste por CFG con efecto funcional: CFG 1.0 para planos lentos e íntimos sin diálogo, CFG 3.5 para tomas cinematográficas y CFG 3.8 para escenas de acción con diálogo y sonido, indicando que un CFG más alto produce más movimiento y más audio.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio asociado en las modalidades T2VA.
- Generación de vídeo a partir de imagen (image-to-video, I2VA), con preservación de identidad destacada por el autor como punto fuerte del modelo.
- Primer y último fotograma a vídeo con audio (FL2VA), útil para interpolar transiciones controladas.
- Vídeo a vídeo y audio a vídeo, según las etiquetas y las modalidades declaradas.
- Generación a partir de imagen de referencia (REF2VA) reforzada mediante la ICLoRA Detailer fusionada a fuerza 0.6.
- Generación rápida por destilación DMD: funcional desde 4 pasos, recomendado 8 pasos.
- Producción de clips largos: hasta 960 fotogramas, aproximadamente 40 segundos, con 9 pasos.
- Control de movimiento y de intensidad sonora mediante CFG (1.0 a 3.8 en los ejemplos documentados).
- Contenido sin censura: el modelo está marcado como `not-for-all-audiences` y el autor indica que existen salvaguardas contra contenido ilegal, pero que la mayor parte del filtrado NSFW se ha retirado.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje. No se documentan capacidades de visión para comprensión de imágenes, solo su uso como condicionamiento.

## Casos de uso

- Previsualización cinematográfica: generar planos de 5 segundos a 1280 × 736 con 8 pasos y CFG 3.5 para validar encuadre, iluminación y movimiento de cámara antes de rodar, usando el flujo T2V documentado en la model card.
- Animación de retratos o personajes a partir de una sola imagen: la modalidad I2V con 9 pasos y la LoRA DMD fusionada están orientadas a mantener la identidad facial, lo que sirve para dar movimiento a fotografías fijas en producciones de bajo presupuesto.
- Interpolación y transición entre dos fotogramas clave: la modalidad FL2VA permite fijar el primer y el último fotograma y generar el movimiento intermedio, útil para storyboards animados o para cierres de secuencia que deben terminar en una pose concreta.
- Clips largos para redes sociales: con 960 fotogramas (~40 s) y 9 pasos se pueden producir piezas verticales u horizontales de duración media sin cortes internos, aprovechando la coherencia temporal que el autor atribuye al modelo frente a versiones anteriores.
- Generación de audio y vídeo conjuntos: al producir audio junto al vídeo, sirve para prototipos de anuncios, doblaje de escenas o pruebas de ambiente sonoro (lluvia, motores, ambiente de piscina en los ejemplos) sin una fase de sonorización separada.
- Reelaboración de material existente (video-to-video): aplicar el modelo sobre metraje rodado para cambiar estilo, iluminación o características de los personajes manteniendo la estructura de la acción.
- Investigación sobre alineación y seguridad: al ser un modelo explícitamente descensurado, es un caso de estudio para medir qué contenido genera un DiT de vídeo sin filtros, qué salvaguardas sobreviven al proceso de fusión y cómo se comportan los detectores actuales.
- Creación de contenido para adultos con personalización de personajes: es el uso explícito que justifica la etiqueta `not-for-all-audiences` y el fine-tune Eros10; requiere verificar la legalidad, los derechos de imagen y las políticas de la plataforma de destino antes de cualquier publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas cuantitativas (FVD, CLIP-score, VBench ni similares) ni comparaciones numéricas con otros modelos; solo describe ajustes de inferencia y muestras cualitativas.

Ajustes de inferencia documentados en los ejemplos:

| Escenario | Resolucion | Fotogramas | Pasos | CFG |
|---|---|---|---|---|
| Text-to-video con audio (ejemplo 1) | 1280 × 736 | 121 (~5 s) | 8 | 3,5 |
| Plano lento e íntimo, sin diálogo | No disponible | No disponible | No disponible | 1,0 |
| Escena cinematográfica de acción con diálogo y sonido | No disponible | No disponible | No disponible | 3,8 |
| Image-to-video | No disponible | No disponible | 9 | No disponible |
| Secuencia larga (primer y último fotograma) | No disponible | 960 (~40 s) | 9 | No disponible |

## Requisitos de hardware

- VRAM estimada para FP8: en torno a 21-24 GB solo para los pesos, más el codificador de texto, el VAE y los latentes de vídeo. Las cifras son estimaciones derivadas del recuento de parámetros (21,01 B) y no están confirmadas por el autor.
- VRAM estimada para GGUF: dependerá del nivel de cuantización, que no se especifica. Con cuantizaciones de 4-5 bits cabría esperar un rango aproximado de 12-16 GB, con descarga parcial a RAM/CPU si el resto del pipeline no cabe.
- GPU recomendadas: para FP8 con resolución 1280 × 736 y clips de 121 fotogramas, una RTX 4090 (24 GB) queda en el límite; se recomienda A100 40/80 GB, H100 o RTX 6000 Ada para producción. Para secuencias de 960 fotogramas la presión de memoria crece con la longitud temporal y conviene VRAM de 48 GB o superior.
- Cabe en GPU de consumo: sí, en principio, con cuantizaciones GGUF bajas y resoluciones moderadas en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080); en FP8 es viable en RTX 4090 ajustando resolución y número de fotogramas.
- Opciones de despliegue: ComfyUI es el entorno documentado por el autor, con flujos JSON de ejemplo y nodos GGUF. vLLM, TGI y llama.cpp no aplican a este tipo de modelo (aunque el contenedor de pesos sea GGUF). Compatibilidad con diffusers no confirmada.
- Latencia y throughput: no disponibles. No se publican tiempos de generación por clip ni métricas de fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Relación | Parámetros | Duración / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TheGladian/LTX-2.3-uncensored-v1.4-FP8 | Este modelo (build FP8/GGUF con 3 LoRA fusionadas) | ~21,01 B | Hasta 960 fotogramas (~40 s) documentados | Desconocida | HuggingFace, 0 descargas, 0 likes |
| Lightricks/LTX-2.3 | Modelo base original, sin fine-tunes ni descensurado | No disponible | No disponible | No disponible | HuggingFace |
| TenStrip/LTX2.3-10Eros | Fine-tune NSFW fusionado en este build a fuerza 1.0 | No disponible | No disponible | No disponible | HuggingFace |
| TenStrip/LTX2.3_DMD_Lora | LoRA destilada DMD fusionada en este build a fuerza 1.0 | No disponible | No disponible | No disponible | HuggingFace |

No se dispone de datos de otros modelos abiertos de generación de vídeo de la misma categoría (por ejemplo alternativas tipo Wan, HunyuanVideo o CogVideoX) en la información proporcionada, por lo que no se incluye comparación numérica con ellos.

## Limitaciones y advertencias

- Licencia desconocida: la model card declara `license: unknown`, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción debería aclarar antes la licencia del modelo base de Lightricks y la del fine-tune.
- Contenido NSFW explícito: el repositorio está marcado como `not-for-all-audiences` y el fine-tune Eros10 se describe como orientado a contenido para adultos. El autor afirma que hay salvaguardas contra contenido ilegal, pero que el filtrado NSFW se ha retirado en su mayor parte; no se especifica cómo se implementan esas salvaguardas ni si son verificables.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar artefactos anatómicos, incoherencias temporales, texto ilegible y deriva de identidad en secuencias largas. El autor destaca la preservación facial en I2V, pero no aporta métricas que lo respalden.
- Coherencia en secuencias largas: los 960 fotogramas se documentan con una única muestra; no hay evidencia sistemática de estabilidad temporal más allá de ese ejemplo.
- Idiomas: no se declara soporte multilingüe. Todos los prompts de ejemplo están en inglés, por lo que se desconoce el comportamiento con prompts en castellano.
- Autoría y trazabilidad: la model card enlaza muestras, flujos y ficheros alojados en repositorios de otro autor (ChrisColeTech), lo que sugiere una re-subida o un empaquetado derivado. Conviene verificar la procedencia de los pesos antes de integrarlos en un pipeline.
- Fechas incoherentes: el repositorio figura creado y actualizado el 2026-09-27, mientras que la model card indica una actualización el 8/21/2026. Los metadatos temporales no son fiables.
- Sin validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones públicas que permitan contrastar calidad o problemas de reproducibilidad.
- Repositorio de 239,0 GB: la descarga completa es costosa en disco y ancho de banda; conviene seleccionar solo el fichero de cuantización necesario.
- Dependencia de ComfyUI: el flujo de trabajo documentado está atado a nodos personalizados y grafo de ComfyUI, lo que añade una dependencia de mantenimiento ajeno al modelo.
- CFG como parámetro de contenido: valores altos de CFG aumentan movimiento y audio, pero también el riesgo de artefactos; los ajustes recomendados no están respaldados por métricas objetivas.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TheGladian/LTX-2.3-uncensored-v1.4-FP8
- Modelo base oficial: https://huggingface.co/Lightricks/LTX-2.3
- Fine-tune Eros10 (fusionado): https://huggingface.co/TenStrip/LTX2.3-10Eros
- LoRA destilada DMD (fusionada): https://huggingface.co/TenStrip/LTX2.3_DMD_Lora
- Flujo de trabajo T2AV en JSON citado en la model card: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/workflow_examples/LTXV23_v1.4_T2AV_nsfw.json
- Muestras de vídeo citadas en la model card: https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-v1.4-fp8/resolve/main/samples/ y https://huggingface.co/ChrisColeTech/LTX-2.3-uncensored-fp8/resolve/main/samples/
- Paper, blog técnico, repositorio de código o demo oficial: no disponibles en la información proporcionada.
