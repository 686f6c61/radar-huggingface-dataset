# txgsync/muse-k2-7b-vision-bridge-pilot-20260910

## Resumen

Este repositorio no contiene un modelo de lenguaje autonomo, sino un **puente visual (bridge) de 58,72 millones de parametros** que conecta las caracteristicas de vision congeladas de Muse-Glimmer con el decodificador tambien congelado IFM/K2-Horizon-7B. Lo publica el usuario txgsync como piloto experimental de alineacion, con fecha de creacion el 10 de septiembre de 2026, y el propio autor lo describe como un primer experimento de conectividad, no como un modelo desplegable. El artefacto entrenable son 58.720.256 parametros, mientras que el sistema hibrido completo ronda los 10,91 mil millones de parametros si se cuentan las dos torres congeladas.

El objetivo del experimento era comprobar si un adaptador pequeno podia aprender a inyectar informacion visual dependiente de la imagen en un decodificador de texto congelado. Sobre un conjunto sintetico de figuras geometricas y palabras renderizadas, el puente paso de un 25,0 % a un 100 % de acierto en la tarea de color de rectangulo y de un 0 % a un 100 % en vocabulario de entrenamiento con nuevas renderizaciones. Sin embargo, no generaliza a vocabulario nuevo: en palabras no vistas durante el entrenamiento el acierto se mantiene en el 0 % y las respuestas caen sistematicamente dentro del vocabulario de entrenamiento.

Su relevancia es acotada y metodologica: demuestra que un conector de 58,72 M de parametros puede alinearse en una unica tarea de HF L4 a un coste estimado de 0,28-0,29 dolares y en unos 21 minutos de ejecucion, con procedencia reproducible (dataset, revisiones fijadas de los modelos base, hashes y codigo de entrenamiento). No es un modelo listo para produccion ni para OCR de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Puente multimodal de proyeccion MLP sobre torre de vision congelada y decodificador de texto congelado; matrices `6144 → 4096 → 4096 → 4096`, sin bias y con GELU tras las dos primeras |
| Parametros totales | 58.720.256 en el puente entrenable; sistema hibrido completo ~10,91 B (1.852.639.744 de la torre Muse + 8.999.178.240 del decodificador K2 + puente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. Cada imagen de 448x224 produce 128 tokens visuales fusionados; la torre Muse publica un limite de 4.096 tokens por imagen |
| Tipos de cuantizacion | No disponible. El checkpoint se exporta en BF16 y los pesos maestros del puente en FP32 durante el entrenamiento |
| Idiomas soportados | No disponibles (el decodificador K2 no declara idiomas en esta ficha; el piloto trabaja solo con vocabulario ingles sintetico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`final-bridge.safetensors`, 117.440.784 bytes, ~112 MiB) |

## Arquitectura y entrenamiento

El sistema es un ensamblaje de tres piezas: la torre de vision Muse-Glimmer (1.852.639.744 parametros, congelada), el decodificador IFM/K2-Horizon-7B (8.999.178.240 parametros pese a la etiqueta "7B", tambien congelado) y un puente MLP entrenable. Ese puente encadena matrices sin bias de dimensiones 6144 → 4096 → 4096 → 4096, aplica GELU despues de las dos primeras y proyecta las caracteristicas visuales al espacio del decodificador. Las dos primeras matrices se inicializaron a partir del adaptador de vision publicado por Muse, y la proyeccion nueva arranco en `0,33 × identidad`. Solo se optimizaron los 58.720.256 parametros del puente.

El entrenamiento uso BF16 para el decodificador y el computo, con pesos maestros y estado del optimizador del puente en FP32, gradient checkpointing, atencion SDPA y perdida causal restringida a la respuesta sobre el vocabulario completo. El optimizador fue AdamW con tasa de aprendizaje 1e-4, 20 pasos de warmup, recorte de gradiente en 1 y sin weight decay; microbatch 1 con acumulacion de gradiente 4 durante dos epocas, lo que suma 768 actualizaciones y 3.072 presentaciones de imagen a partir de 1.536 imagenes de entrenamiento. Las imagenes son sinteticas, de 448x224, y generan 128 tokens visuales fusionados cada una. El checkpoint final se exporto a BF16 y se recargo antes de la evaluacion final; no habia gradientes en el decodificador y las muestras de sus tensores permanecieron sin cambios (el autor advierte que el muestreo no equivale a una suma de comprobacion completa de tensores).

## Capacidades

- Reconocimiento de color de rectangulos en imagenes sinteticas: 100 % de acierto en el conjunto retenido de 96 imagenes tras el entrenamiento.
- Conteo de circulos negros: 87,5 % de acierto en 96 imagenes, frente al 21,9 % antes de entrenar.
- Lectura de vocabulario de palabras de entrenamiento con renderizaciones nuevas: 100 % de acierto en 96 imagenes.
- Generacion de respuestas libres: las respuestas se generan sin restricciones, no mediante clasificacion forzada.
- Inyeccion de informacion dependiente de la imagen: los controles con imagen en blanco y con imagen erronea degradan el rendimiento, lo que indica que el puente usa la senal visual.
- **No** demuestra vision general, OCR de vocabulario abierto, ni generalizacion a vocabulario nuevo (0 % en 64 imagenes de palabras no vistas).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo de pensamiento.

## Casos de uso

- **Investigacion en conectores multimodales**: el repositorio sirve como referencia reproducible de como alinear una torre de vision congelada con un decodificador congelado, con dataset, revisiones y hashes fijados para replicar el experimento.
- **Validacion de pipelines de entrenamiento de adaptadores**: util para comprobar que un flujo de gradient checkpointing, SDPA y perdida answer-only funciona correctamente antes de pasar a datasets reales.
- **Punto de partida para fine-tuning de un bridge**: las formas de matriz documentadas (6144 → 4096 → 4096 → 4096) pueden reutilizarse como inicializacion en tareas visuales mas complejas, aunque el autor advierte que la calidad a longitudes mayores no esta verificada.
- **Auditoria y control de experimentos**: los ficheros `before-training.json`, `after-training.json`, `events.jsonl` y `run.json` permiten estudiar trazabilidad, reproducibilidad y coste computacional de un job real.
- **Docencia sobre limites de generalizacion**: el contraste entre el 100 % en vocabulario de entrenamiento y el 0 % en vocabulario nuevo es un caso didactico claro sobre sobreajuste a distribuciones sinteticas.
- **Pruebas de infraestructura en GPU L4**: el experimento cabe en 19,196 GB de pico de asignacion de PyTorch en una L4, lo que permite usarlo como prueba de humo de entornos PyTorch 2.9.1 / CUDA 12.8 con y sin MLX.
- **No recomendado** para atencion al cliente, OCR de documentos, analisis de fotografias reales, capturas de pantalla ni enrutamiento en produccion: ninguna de esas capacidades se ha evaluado.

## Benchmarks y rendimiento

Resultados en el conjunto retenido publicados por el autor (respuestas generadas libremente; las imagenes de test no se usaron para seleccionar checkpoint ni hiperparametros):

| Tarea | Imagenes | Antes de entrenar | Puente entrenado | Imagen en blanco | Imagen erronea |
|---|---:|---:|---:|---:|---:|
| Color de rectangulo | 96 | 25,0 % | 100 % | 25,0 % | 0 % |
| Conteo de circulos negros | 96 | 21,9 % | 87,5 % | 25,0 % | 12,5 % |
| Vocabulario de palabras de entrenamiento, nuevas renderizaciones | 96 | 0 % | 100 % | 6,25 % | 0 % |
| Vocabulario nuevo de la tarea de palabras | 64 | 0 % | 0 % | 0 % | 0 % |

Notas de los controles: los controles con imagen erronea usan una permutacion dentro de la misma tarea cuyos donantes tienen todos respuestas distintas. Todas las respuestas de vocabulario nuevo cayeron dentro del vocabulario de entrenamiento (por ejemplo, DUCK se convirtio en BIRD y PEAR en STAR).

Evaluacion local en MLX: reprodujo todos los agregados en 124,72 segundos con una asignacion maxima de 18,365 GB. Las predicciones brutas coincidieron en 349 de 352 imagenes; las tres diferencias fueron respuestas alternativas incorrectas en vocabulario nuevo. Ambas evaluaciones usan salidas cacheadas de la misma torre de vision congelada, no son un benchmark de despliegue.

Coste y tiempos del job en HF L4: 19,196 GB de pico de asignacion, 1.011 segundos en cola y 1.275 segundos en ejecucion. El coste de computo estimado por el autor es de 0,28-0,29 dolares (no es una factura; el tiempo en cola no se factura). La codificacion local de caracteristicas tardo 409,3 segundos y la descarga del dataset preparado desde HF, 7,6 segundos.

## Requisitos de hardware

- VRAM en inferencia: no publicada como benchmark de despliegue. El autor informa de un pico de 19,196 GB de asignacion de PyTorch en evaluacion sobre L4 y de 18,365 GB de asignacion maxima en la evaluacion local con MLX.
- El puente en si ocupa unos 112 MiB en BF16; el grueso de la memoria corresponde a las torres congeladas (torre de vision de 1,85 B y decodificador de ~9 B de parametros).
- GPU recomendadas: el piloto se ejecuto integramente en una NVIDIA L4. No hay datos publicados para A100, H100 ni RTX 4090.
- Encaje en GPU de consumo: no verificado. Con 10,91 B de parametros totales en BF16, el sistema completo no cabe en GPUs de consumo habituales sin cuantizacion, y no se documentan cuantizaciones del artefacto.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI. La unica ruta de ejecucion descrita es el trainer incluido en el dataset fijado, mediante `python train.py --mode evaluate`.
- Latencia y throughput: no disponibles como metricas de servicio. Solo constan tiempos de entrenamiento/evaluacion (768 actualizaciones, 1.275 s de ejecucion del job en L4) y 124,72 s de evaluacion local en MLX.

## Comparativa con modelos similares

No se han publicado en la informacion disponible comparativas con otros conectores visuales de la misma categoria. La unica referencia util son los dos componentes congelados que el puente interconecta:

| Componente | Rol | Parametros | Licencia | Disponibilidad |
|---|---|---:|---|---|
| Puente (este repositorio) | Adaptador entrenable | 58.720.256 | Apache-2.0 | Checkpoint `final-bridge.safetensors` |
| Muse-Glimmer-30B (revision fijada) | Torre de vision congelada | 1.852.639.744 | Apache-2.0 | Repositorio `meta-models/Muse-Glimmer-30B` |
| IFM/K2-Horizon-7B (revision fijada) | Decodificador de texto congelado | 8.999.178.240 | Apache-2.0 | Repositorio `IFM/K2-Horizon-7B` |

Comparativa con modelos alternativos de la misma tarea o tamano: no disponible.

## Limitaciones y advertencias

- El propio autor advierte que el puente **no demuestra vision general ni OCR de vocabulario abierto**; la evidencia se limita a imagenes sinteticas con generadores y fuentes compartidos.
- Sobreajuste severo al vocabulario de entrenamiento: 0 % de acierto en vocabulario nuevo, con respuestas que recaen siempre dentro del vocabulario visto.
- No se han evaluado fotografias reales, OCR arbitrario, documentos, capturas de pantalla, multiples imagenes, secuencias visuales largas ni enrutamiento en produccion.
- Aunque las formas de matriz admiten secuencias mas largas, la calidad y la memoria de entrenamiento a esas longitudes no estan verificadas. No se lanzo ningun entrenamiento de seguimiento.
- La resolucion de 448x224 y los 128 tokens visuales por imagen son un ajuste sintetico del piloto, no una configuracion propuesta para documentos reales (el limite publicado de Muse es de 4.096 tokens por imagen).
- No se declaran idiomas soportados; el vocabulario del experimento es ingles sintetico.
- La verificacion de que el decodificador permanecio congelado se basa en muestreo de tensores, no en una suma de comprobacion completa, tal como reconoce el autor.
- Riesgo de sesgos: no evaluado en la informacion disponible.
- Licencia Apache-2.0 tanto del bridge como de los modelos base declarados; el dataset son fixtures generados y no se redistribuyen ficheros de fuentes. No obstante, al depender de pesos de terceros conviene verificar las condiciones de cada repositorio base antes de un uso comercial.
- Caveat de produccion: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo dia; es un artefacto experimental sin senales de adopcion ni mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/txgsync/muse-k2-7b-vision-bridge-pilot-20260910
- Job de HF completado: https://huggingface.co/jobs/txgsync/6aa2f01921047bf1b0373203
- Dataset y codigo fijados: https://huggingface.co/datasets/txgsync/muse-k2-vision-pilot-20260910/tree/f75cedb3ed1a4d4171d397729bc062745931429d
- Revision fijada de K2: https://huggingface.co/IFM/K2-Horizon-7B/tree/586b03f0fd1fbbf2f13eeafc33749e95ae34dd10
- Revision fijada de Muse: https://huggingface.co/meta-models/Muse-Glimmer-30B/tree/a4e59da52a7bc87ae7251dd5545c0dd437c44b68

Nota sobre la busqueda web: los resultados devueltos corresponden a enlaces genericos de YouTube y no contienen informacion relevante sobre este modelo, por lo que no se han incorporado datos adicionales (papers, blogs o demos) mas alla de los proporcionados en la model card y la ficha de HuggingFace.
