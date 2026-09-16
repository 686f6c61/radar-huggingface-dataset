# Viggle/Meridian

## Resumen

Meridian es un modelo de difusión video-a-video desarrollado por Viggle AI para la síntesis de vistas novedosas (novel view synthesis) y el control de cámara sobre eventos ya grabados. Se construye como un ajuste fino (finetune) sobre MiniMaxAI/MiniMax-H3, con la geometría aportada por VGGT-Omega, el modelo de estimación de profundidad y poses de cámara de Meta (facebookresearch). El modelo permite revisitar un evento registrado desde un punto de vista distinto, mover la cámara por una trayectoria definida por el usuario y, además, decidir cómo se comporta el tiempo: congelar un instante, ralentizar la acción o acelerarla. También admite generar un movimiento de cámara a partir de una única imagen.

El problema que resuelve es concreto: en vídeo convencional, la posición y el movimiento de la cámara quedan fijados en el momento de la captura. Meridian separa las dos dimensiones —dónde se observa y cuándo se observa— para que puedan elegirse después del rodaje. Esto lo sitúa en la categoría de "re-camera" o reencuadre generativo, con aplicaciones directas en postproducción, deportes, publicidad y VFX.

Técnicamente es un modelo de difusión de gran tamano: 33.122.992.896 parámetros (unos 33,1 mil millones), distribuidos en un repositorio de 69,3 GB con pesos en safetensors y soporte para la librería diffusers. La model card no publica la longitud de contexto en frames, los idiomas soportados ni resultados de benchmarks, y la licencia es la minimax-h3-community-license, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión video-a-video construida sobre MiniMaxAI/MiniMax-H3, con estimación geométrica de profundidad y poses de cámara mediante VGGT-Omega; detalles internos de la arquitectura no disponibles |
| Parametros totales | 33.122.992.896 (aproximadamente 33,1 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio distribuye safetensors; no se documentan variantes GGUF, FP8 o int4) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (campo license: other, con enlace a LICENSE) |
| Formato de pesos | safetensors (repo de 69,3 GB) |
| Libreria | diffusers |
| Pipeline | video-to-video |
| Modelo base | MiniMaxAI/MiniMax-H3 |
| Tamano del repositorio | 69,3 GB |
| Descargas / likes | 0 descargas / 11 likes |

## Arquitectura y entrenamiento

Meridian se presenta como un modelo guiado por geometría ("geometry-guided video model"). El flujo descrito en la model card combina dos componentes: VGGT-Omega estima profundidad y poses de cámara a partir del vídeo de entrada, y sobre esa representación geométrica el modelo de difusión renderiza nuevas observaciones siguiendo la trayectoria de cámara solicitada. La model card menciona el renderizado de puntos 3D coloreados a lo largo de la cámara elegida como parte del método, aunque el texto proporcionado se corta en ese punto y no detalla el resto del pipeline.

No se dispone de información sobre el número de tokens o frames de entrenamiento, la composición del dataset, ni si hubo etapas de ajuste con RLHF, DPO u optimización por preferencias. Tampoco se documentan innovaciones como decodificación especulativa o mecanismos de atención lineal. Lo que sí es explícito es la relación de dependencia: Meridian es un finetune de MiniMax-H3, y su licencia se hereda del modelo base.

## Capacidades

- Síntesis de vistas novedosas: generación de una observación nueva de un evento ya grabado, manteniendo la coherencia temporal de la acción.
- Control de cámara explícito: orbitar, acercar o alejar, desplazarse lateralmente y moverse arriba y abajo, además de fijar la dirección de visión y el campo de visión.
- Trayectorias de cámara compuestas: combinación de varios movimientos (órbita, desplazamiento lateral y cambio de distancia) en un único plano continuo.
- Control temporal independiente: elección de secuencia, congelación de un frame, y ralentización o aceleración del vídeo de entrada antes de la generación. El efecto "bullet time" se describe como una combinación posible, no como el límite del modelo.
- Movimiento de cámara a partir de una sola imagen: la card menciona explícitamente la creación de un movimiento de cámara desde una fotografía (ejemplo del ballet).
- Capacidad de preservar material original: en el ejemplo de la NBA, la edición mezcla vistas generadas con metraje original etiquetado.
- No se documentan en la información disponible capacidades de tool calling, function calling, uso agéntico, razonamiento multi-paso, generación de código, matemáticas, audio o diálogo multilingüe. Se trata de un modelo generativo de vídeo, no de un modelo de lenguaje.

## Casos de uso

- Reencuadre en postproducción cinematográfica: a partir de un plano ya rodado, el modelo genera una toma nueva con otro ángulo o distancia, evitando volver a rodar y reduciendo coste de producción. Es adecuado porque la geometría se estima del propio material de entrada y la trayectoria de cámara se define por el usuario.
- Repeticiones deportivas desde ángulos alternativos: sobre el metraje de una jugada (una canasta, una maniobra de motocross), se generan vistas laterales o en órbita para analizar la posición de los cuerpos y el contacto con el balón o el vehículo.
- Efectos de bullet time sin rig de cámaras: congelar un instante concreto de una acción y desplazar la cámara alrededor de ese momento, una técnica que tradicionalmente requiere decenas de cámaras sincronizadas.
- Ralentización y re-temporalización de clips: ralentizar o acelerar la acción antes de diseñar el movimiento de cámara, útil para piezas de marketing o highlights deportivos donde se quiere enfatizar un gesto.
- Publicidad y e-commerce a partir de una imagen fija: tomar fotografías de producto o de figura humana y generar un movimiento de cámara que las recorra, sin necesidad de grabar vídeo original.
- Previsualización y storyboard animado: generar pruebas de cámara sobre material de referencia o sobre un frame, para validar decisiones de puesta en escena antes del rodaje o del render final.
- VFX y planos imposibles: construir un punto de vista que nunca existió en el set (por ejemplo, una cámara atravesando una escena capturada desde una sola posición), manteniendo el movimiento de la acción original.
- Archivo audiovisual y contenido histórico: aportar nuevas perspectivas a material grabado con una única cámara, útil para documentales que quieren dar dinamismo a metraje estático o limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card proporcionada no incluye métricas cuantitativas (FVD, PSNR, LPIPS, CLIP temporal ni comparaciones numéricas con otros modelos). Los materiales de evaluación encontrados son ejemplos cualitativos en vídeo: un clip de motocross con trayectoria de cámara compuesta y diagrama de la ruta, un ejemplo de ballet generado desde una sola fotografía, una edición de una jugada de la NBA que mezcla metraje original con vistas generadas, y un ejemplo de fresas en el que la acción se pausa, la cámara se mueve y la acción se reanuda. No se dispone de latencias ni de throughput medidos.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del recuento de parámetros (33,1 mil millones) y de la experiencia habitual con modelos de difusión de vídeo; la model card no publica requisitos oficiales.

- VRAM estimada solo para pesos: en BF16/FP16, aproximadamente 66 GB; en FP8, alrededor de 33 GB; en 4 bits, unos 17-18 GB.
- VRAM real de inferencia: significativamente superior a la de los pesos, porque un modelo de difusión de vídeo mantiene latentes temporales, atención sobre secuencias de frames y los activaciones del VAE, además del módulo de geometría (VGGT-Omega) que estima profundidad y poses a partir del vídeo de entrada.
- GPU recomendadas: para BF16 sin cuantizar, GPU de 80 GB como H100 o A100 80 GB; alternativamente, configuraciones multi-GPU con tarjetas de 40-48 GB (A100 40 GB, L40S, RTX 6000 Ada).
- GPU de consumo: con cuantización agresiva (4 bits) los pesos cabrían en una RTX 4090 o RTX 3090 de 24 GB, pero es probable que el conjunto del pipeline de vídeo no quepa sin optimizaciones adicionales de memoria (offloading, atención troceada, procesado por fragmentos). No hay confirmación oficial de que funcione en 24 GB.
- Opciones de despliegue: difusión vía librería diffusers, que es la etiquetada en el repositorio. No se documentan integraciones con llama.cpp, Ollama, TGI ni vLLM; estas herramientas están orientadas a modelos de lenguaje y no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la información proporcionada. La única referencia verificable es el modelo base sobre el que se construye.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Viggle/Meridian | 33.122.992.896 | no disponible | minimax-h3-community-license | Hugging Face, diffusers, safetensors | no disponible |
| MiniMaxAI/MiniMax-H3 (modelo base) | no disponible | no disponible | no disponible en la información proporcionada | Hugging Face | no disponible |
| Otras alternativas de video-to-video con control de cámara | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han encontrado en la búsqueda web resultados comparables de terceros para este modelo. Las referencias externas devueltas por la búsqueda no guardan relación con el modelo y se han descartado.

## Limitaciones y advertencias

- La model card proporcionada está truncada: la sección "Method" se corta y no se incluye la sección "Quickstart" referenciada en el documento, por lo que no hay instrucciones oficiales de uso ni requisitos de entorno detallados.
- No hay información sobre sesgos. Al ser un modelo de generación visual, puede reproducir sesgos presentes en los datos de entrenamiento (representación de cuerpos, escenas, iluminación), pero no se documenta ningún análisis al respecto.
- Riesgo de alucinación geométrica: en síntesis de vistas novedosas es habitual que aparezcan artefactos en las zonas ocluidas del material original, es decir, regiones que ninguna cámara captó. Es un riesgo estructural de la tarea, no una advertencia confirmada por el autor.
- Consistencia temporal: no se publican métricas de estabilidad entre frames ni de fidelidad geométrica, por lo que no puede garantizarse la ausencia de parpadeo o deriva en clips largos.
- Idioma: el campo de idiomas aparece como "no disponible". La model card está redactada en inglés y no se especifica si las instrucciones de texto admiten otros idiomas.
- Licencia: se trata de la minimax-h3-community-license (license: other), heredada de MiniMaxAI/MiniMax-H3. Al no incluirse el texto de la licencia en la información proporcionada, es imprescindible revisar el fichero LICENSE del repositorio antes de cualquier uso comercial. Las licencias comunitarias de este tipo suelen incluir restricciones de uso, umbrales de facturación o cláusulas de atribución.
- Madurez: el repositorio registra 0 descargas y 11 likes, con fecha de creación en septiembre de 2026 y última actualización un día después. La validación por parte de la comunidad es prácticamente nula y no hay garantía de mantenimiento.
- Coste computacional: con 33,1 mil millones de parámetros y pesos que ocupan decenas de GB, el modelo no es viable en hardware de consumo sin cuantización y sin optimizaciones de memoria específicas para vídeo.
- Reproducibilidad: no se documentan los datos de entrenamiento ni el procedimiento de ajuste, lo que dificulta auditar el comportamiento del modelo.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/Viggle/Meridian
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio de VGGT-Omega (componente de geometría, Meta): https://github.com/facebookresearch/vggt-omega
- Fichero de licencia en el repositorio: https://huggingface.co/Viggle/Meridian/blob/main/LICENSE
- Vídeo teaser (51 segundos): https://huggingface.co/Viggle/Meridian/resolve/main/videos-all/teaser_meridian_showcase_v12.mp4
- Ejemplo NBA (dunk, mezcla de vistas generadas y metraje original): https://huggingface.co/Viggle/Meridian/resolve/main/videos-all/research_examples_v1/nba.mp4
- Ejemplo de pausa, movimiento de cámara y reanudación (fresas): https://huggingface.co/Viggle/Meridian/resolve/main/videos-all/research_examples_v1/berry.mp4
- Ejemplo de trayectoria de cámara compuesta (motocross, con diagramas): https://huggingface.co/Viggle/Meridian/resolve/main/videos-all/teaser_meridian_compound_motor_dust_explained_v1.mp4
- Ejemplo de movimiento de cámara desde una sola imagen (ballet): https://huggingface.co/Viggle/Meridian/resolve/main/videos-all/meridian_ballet_l150_female_reverse45.mp4
