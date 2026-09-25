# SuhaoYu1020/Uni-Sign-ASL718k-stage1-t5large

## Resumen

Uni-Sign ASL-718k Stage-1 T5-Large es un conjunto de dos puntos de control (checkpoints) de traducción de lenguaje de signos (SLT) de American Sign Language (ASL) a inglés, desarrollados por SuhaoYu1020. Cada checkpoint combina un codificador de pose entrenado desde cero con un decodificador `t5-large` de arquitectura congelada. El modelo no procesa vídeo ni imágenes: su entrada son secuencias de 69 puntos clave (keypoints) por fotograma, extraídos previamente con RTMW-x, y su salida es texto en inglés.

Los dos checkpoints proceden de una ablación del codificador de pose del proyecto Uni-Sign (ICLR 2025). La variante A usa el codificador `pose_nt` (transformer espacial por fotograma; dimensión 256, profundidad 6, 8 cabezas) con 759,78 M de parámetros totales. La variante E usa `pose_pt3` configurado como A más una convolución temporal depthwise con inicialización a cero ("door conv") y una FFN residual de dos capas tras el pooling, con la atención cruzada entre partes desactivada; totaliza 761,89 M de parámetros. Ambos son checkpoints de la fase 1 de preentrenamiento en su última época (época 19 de 20, sin selección de checkpoint) y no han recibido ajuste fino posterior.

El interés actual del modelo es doble: por un lado, ofrece pesos de partida para investigación en SLT basada en pose; por otro, documenta un resultado empírico concreto, que las mejoras del codificador se diluyen a medida que crecen el modelo de lenguaje y el corpus, lo que refuerza la idea de que la palanca que sigue rindiendo es el volumen de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de pose (transformer espacial por fotograma + pooling por articulación + FFN de fusión) con decodificador `t5-large` de arquitectura congelada |
| Parametros totales | 759,78 M (variante A, `pose_nt`); 761,89 M (variante E, `pose_pt3`) |
| Longitud de contexto | No disponible (el decodificador es `t5-large`; los clips de entrada se limitan a 256 fotogramas) |
| Tipos de cuantizacion | No disponible (los checkpoints son tensores PyTorch en precisión de entrenamiento) |
| Idiomas soportados | `en` (traducción de ASL a inglés) |
| Licencia | No disponible |
| Formato de pesos | `.pth` (checkpoint PyTorch plano; `checkpoint_19.pth` por variante) |

## Arquitectura y entrenamiento

La entrada son 69 keypoints por fotograma divididos en cuatro flujos: cuerpo (9), mano izquierda (21), mano derecha (21) y cara (18). Los clips se limitan a 256 fotogramas. Los keypoints se extrajeron con RTMW-x (`rtmw-dw-x-l_simcc-cocktail14_270e`) a través de `rtmlib`. El codificador de la variante A aplica un transformer espacial por fotograma (dim 256, 6 capas, 8 cabezas), seguido de un JointPool por parte del cuerpo, una FFN de fusión y una proyección lineal hacia el decodificador T5. La variante E añade la "door conv" (convolución depthwise temporal, k=3, inicializada a cero) justo antes de la proyección a T5 y sustituye la FFN de fusión única por una FFN residual de dos capas tras el pooling; la atención cruzada a nivel de articulación entre partes queda desactivada (`cross_depth=0`), ya que resultó perjudicial en las pruebas (hasta −2,5 BLEU-4 con `t5-base` y −2,1 con `t5-large` en dev de dominio).

El corpus de preentrenamiento contiene 718.099 clips de ASL→inglés: 566.928 procedentes de YouTube-ASL (Uthus et al., 2023; extracción con RTMW-x sobre recorte de 256×192 y fotogramas reescalados a anchura 720) y 151.171 de una colección interna denominada `asl_dataset_clean` (extracción con RTMW-x sobre recorte de 384×288). El cargador reserva el primer 99 % como entrenamiento (710.918 clips) y el último 1 % como dev (7.181 clips). La receta es idéntica para ambas variantes: 8 × NVIDIA GH200 (una GPU por nodo), micro-lote de 16 por GPU, acumulación de gradiente de 4 (lote efectivo de 512), 20 épocas, AdamW con β = (0,9; 0,999) y weight decay 1e-4, LR máximo de 3e-4 con decaimiento coseno y 1 época de calentamiento lineal, 1.388 actualizaciones por época y 27.760 actualizaciones totales. La única diferencia deliberada respecto a la receta de la fase 1 de Uni-Sign es ese calentamiento de una época, que en el proyecto original es cero. No se documenta uso de RLHF ni DPO.

## Capacidades

- Traduccion de lenguaje de signos: convierte secuencias de pose (ASL) en texto en ingles.
- Entrada basada exclusivamente en pose: 69 keypoints por fotograma en cuatro flujos (cuerpo, mano izquierda, mano derecha, cara), con un maximo de 256 fotogramas por clip.
- Decodificacion de texto con `t5-large`: genera la traduccion en ingles a partir de las representaciones del codificador de pose.
- Punto de partida para ajuste fino: los checkpoints estan pensados como base de la fase 1 para posteriores fine-tunings en dominios concretos.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No procesa video, imagen, audio ni texto como entrada (solo pose).
- No dispone de modo "thinking" ni de capacidades de vision o audio.
- Cobertura multilingue: no disponible; el modelo esta etiquetado unicamente para `en`.

## Casos de uso

- Base para ajuste fino en SLT: los checkpoints de la fase 1 se pueden inicializar y afinar sobre un corpus concreto (por ejemplo, How2Sign) para obtener un sistema de traduccion final, tal y como reportan los propios autores en la model card.
- Investigacion sobre codificadores de pose: la pareja A/E permite reproducir la ablacion del codificador manteniendo fijos el modelo de lenguaje, los datos y la receta, aislando el efecto de la "door conv" y de la FFN residual post-pooling.
- Subtitulado automatico de contenido en ASL: tras el ajuste fino, el modelo puede generar subtitulos en ingles a partir de la pose extraida de videos, un paso util en pipelines de accesibilidad para plataformas de video.
- Traduccion de archivos de YouTube-ASL: el preentrenamiento sobre 566.928 clips de esa fuente lo hace un punto de partida razonable para procesar ese mismo dominio, siempre que se aplique el filtrado de solapamiento descrito por los autores.
- Sistemas de accesibilidad en tiempo real (con matices): el coste de inferencia de un modelo de ~760 M de parametros es contenido, pero el pipeline exige extraccion de pose (RTMW-x) fotograma a fotograma, que suele ser el cuello de botella.
- Transferencia a otros lenguajes de signos: la arquitectura consume keypoints normalizados, de modo que la misma estructura es reutilizable para otras lenguas de signos si se dispone de un corpus de pose equivalente, aunque esto requiere reentrenar o afinar.
- Evaluacion y reproducibilidad: sirve como referencia para comparar variantes de codificador bajo una receta controlada, con la advertencia de que las puntuaciones de dev solo son comparables dentro del propio corpus de 718k.
- Analisis de corpus a gran escala: al operar sobre pose en lugar de video, permite procesar grandes volumenes de clips con un coste de almacenamiento y computo inferior al de los enfoques que trabajan con pixeles.

## Benchmarks y rendimiento

Metricas reportadas: BLEU-4 (sacrebleu, tokenizador `13a`) y ROUGE-L.

| Metrica | A (`pose_nt`) | E (`pose_pt3`) |
|---|---|---|
| Stage-1 dev, final (epoca 19) | 12,25 | 12,43 |
| Stage-1 dev, max (mejor epoca) | 12,35 | 12,50 |
| How2Sign zero-shot | 5,31 | 5,02 |
| How2Sign ajustado, final | 13,38 | 13,51 |
| How2Sign ajustado, max | 14,00 | 13,64 |
| OpenASL-clean zero-shot | 14,57 | 14,77 |
| OpenASL-clean ROUGE-L | 32,50 | 32,66 |

Advertencias sobre la tabla, segun la propia model card: solo la columna de dev corresponde al checkpoint de este repositorio (`checkpoint_19.pth`). Los resultados de How2Sign y OpenASL-clean se obtuvieron inicializando desde `best_checkpoint.pth` (epoca 17 para A y 18 para E), ficheros que no estan en el repositorio. La particion dev es el 1 % propio del corpus de 718k y no es comparable con cifras publicadas sobre otros corpus. OpenASL-clean es la particion de test oficial de OpenASL tras eliminar los clips cuyo video de YouTube tambien aparece en el corpus de preentrenamiento (el 61 % de los clips oficiales solapan a nivel de video), quedando 337 clips de 206 videos. Diferencias del orden de 0,1-0,3 BLEU-4 entre A y E estan dentro del ruido, ya que se trata de ejecuciones unicas sin replicas de semilla.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 3,0 GB en el repositorio, coherente con ~760 M de parametros. Se puede cargar en precision completa o reducida; no se publican cifras de memoria pico ni de cuantizacion.
- GPU recomendadas: el entrenamiento se realizo con 8 × NVIDIA GH200 (una GPU por nodo). Para inferencia no se especifica hardware objetivo.
- GPU de consumo: por tamano de parametros, el modelo cabe en GPUs de consumo con 8 GB o mas de VRAM, pero no se documenta ningun ajuste ni prueba en ese escenario.
- Opciones de despliegue: los checkpoints son `.pth` planos de PyTorch y se cargan con el codigo del proyecto Uni-Sign. No hay versiones GGUF ni integracion publicada con vLLM, llama.cpp, Ollama o TGI; el codificador de pose es una arquitectura personalizada, por lo que no cabe esperar soporte directo en esos motores.
- Latencia y throughput: no disponible.
- Nota de pipeline: al tratarse de un modelo solo de pose, cualquier despliegue real necesita ademas un extractor de keypoints (RTMW-x via `rtmlib`) como etapa previa.

## Comparativa con modelos similares

La model card no ofrece comparaciones contra sistemas externos, y las cifras de dev no son comparables entre corpus distintos por decision explicita de los autores.

| Modelo | Parametros totales | Codificador | Dev (corpus 718k) | Licencia |
|---|---|---|---|---|
| Uni-Sign ASL-718k A | 759,78 M | `pose_nt` | 12,25 | No disponible |
| Uni-Sign ASL-718k E | 761,89 M | `pose_pt3` (`cross_depth=0`) | 12,43 | No disponible |
| Uni-Sign ASL-718k con `t5-base` (referencia interna citada) | No disponible | Variantes equivalentes sobre corpus de 567k | +1,01 BLEU-4 a favor de E (receta `t5-base`) | No disponible |
| Uni-Sign original (ICLR 2025) | No disponible | No disponible | No disponible | No disponible |

La unica comparacion cuantitativa disponible en la informacion proporcionada es interna: el mismo cambio de codificador que aporta +0,18 BLEU-4 en dev con `t5-large` sobre 718k clips aportaba +1,01 BLEU-4 con `t5-base` sobre 567k clips, lo que sugiere que la ganancia del codificador se diluye al crecer el modelo de lenguaje y el corpus.

## Limitaciones y advertencias

- Checkpoint intermedio, no producto final: son pesos de la fase 1 de preentrenamiento, en la ultima epoca y sin seleccion de checkpoint, y no han pasado por ajuste fino. Su uso directo no esta pensado para produccion.
- Discrepancia entre checkpoints: las cifras de How2Sign y OpenASL-clean de la model card no corresponden a `checkpoint_19.pth`, sino a `best_checkpoint.pth` (epocas 17 y 18), que no estan en el repositorio. No se puede reproducir la tabla completa con lo publicado.
- Dev no comparable: la puntuacion de dev se calcula sobre el 1 % propio del corpus de 718k. No se puede comparar con cifras de otros articulos o corpus.
- Riesgo de memorizacion: los autores senalan que el 61 % de los clips de test de OpenASL solapan a nivel de video con el corpus de preentrenamiento. Sin eliminar ese solapamiento, cualquier cifra zero-shot sobre OpenASL queda inflada.
- Sesgos: no se documenta ningun analisis de sesgos demograficos, de signantes, de variedad dialectal de ASL ni de condiciones de grabacion.
- Riesgo de alucinacion: no se reporta ningun estudio especifico. Al ser un modelo de traduccion generativa con decodificador T5, cabe esperar salidas plausibles pero no fieles a la senal de entrada, especialmente con clips largos o de baja calidad de extraccion de pose.
- Dependencia de la extraccion de pose: la calidad del modelo esta limitada por la precision de RTMW-x y por la resolucion de recorte usada (256×192 o 384×288). Errores en los keypoints se propagan directamente a la traduccion.
- Sin soporte de video ni audio: no se puede alimentar el modelo con video crudo ni con audio; requiere una etapa previa de estimacion de pose.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible, por lo que no se puede confirmar si el uso comercial esta permitido. El corpus YouTube-ASL procede de YouTube y puede arrastrar condiciones de uso adicionales.
- Idiomas: solo ingles como salida y ASL como entrada. No hay soporte de otras lenguas de signos ni de otros idiomas escritos.
- Riesgo de sobreajuste al dominio: los datos de preentrenamiento son mayoritariamente de YouTube, con la distribucion de escenarios, iluminacion y signantes que eso implica.
- Sobreajuste de la comparacion A/E: son ejecuciones unicas sin replicas de semilla; las diferencias observadas (del orden de 0,1-0,3 BLEU-4) estan dentro del ruido segun los propios autores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SuhaoYu1020/Uni-Sign-ASL718k-stage1-t5large
- Perfil del autor en HuggingFace: https://huggingface.co/SuhaoYu1020
- Repositorio oficial de Uni-Sign (ICLR 2025): https://github.com/ZechengLi19/Uni-Sign
- Pagina personal del autor: https://suhaoyu1020.github.io/
- Perfil de GitHub del autor: https://github.com/SuhaoYu1020/
- Paper de YouTube-ASL (Uthus et al., 2023): https://arxiv.org/abs/2306.15162
