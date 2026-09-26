# zheqiushui/laya-omni

## Resumen

laya-omni es un modelo de decisión multimodal desarrollado por el usuario zheqiushui, publicado en HuggingFace bajo licencia Apache-2.0. No es un modelo generativo: responde a preguntas tipadas (elegir una opción entre varias, emitir una puntuación o contestar sí/no) devolviendo probabilidades calibradas. Sobre la base del modelo Laya —que solo procesa texto— añade entradas opcionales de imagen y audio, de modo que sin imagen ni audio la salida es bit a bit idéntica a la de Laya.

La relevancia del modelo está en su planteamiento de eficiencia: en lugar de un VLM generativo de miles de millones de parámetros, combina tres codificadores congelados de tamaño pequeño (Laya multilingual con backbone mmBERT-base, ~310 M; SigLIP 2 base/16-256, ~93 M; y el codificador de audio de Qwen3-ASR-0.6B, 186 M) y entrena únicamente una fusión de unos 7 M de parámetros (28 MB). El resultado cabe en un repositorio de 0,4 GB y responde una pregunta con imagen o un clip de 10 segundos en 30-120 ms en una RTX 4090, codificadores incluidos.

El modelo soporta preguntas sobre imágenes, audio y combinaciones de ambos, con calibración de probabilidades por modalidad y tipo de pregunta. Está pensado para escenarios de clasificación y enrutado (intenciones de voz, eventos sonoros, OCR, gráficos, documentos) más que para generación libre, y admite ajuste fino con unos pocos cientos de ejemplos etiquetados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Fusión multimodal de codificadores congelados (Laya mmBERT-base para texto, SigLIP 2 base/16-256 para imagen, Qwen3-ASR-0.6B para audio) con cabecera de decisión calibrada |
| Parámetros totales | ~596 M en total: ~310 M (Laya multilingual) + ~93 M (SigLIP 2 base/16-256) + 186 M (codificador de audio Qwen3-ASR) + ~7 M (fusión entrenada) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | Multilingüe; etiquetado explícitamente como inglés (en) y chino (zh). Evaluado en intenciones habladas en 14 idiomas (MINDS-14) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; repositorio de 0,4 GB (fusión de ~28 MB + `audio_encoder/` con los pesos de Qwen/Qwen3-ASR-0.6B) |

## Arquitectura y entrenamiento

laya-omni no entrena de cero: congela tres codificadores preentrenados y entrena únicamente una capa de fusión de ~7 M de parámetros que combina sus representaciones y alimenta el mecanismo de decisión tipada de Laya. La rama de texto es Laya multilingual (backbone mmBERT-base, ~310 M), la de visión es SigLIP 2 base/16-256 (~93 M) y la de audio es el codificador extraído del modelo ASR Qwen3-ASR-0.6B (186 M, pesos sin modificar). Las imágenes se codifican por defecto en 64 tokens; con `detail=True` se emplean 256 tokens, lo que mejora el rendimiento en texto, documentos y preguntas espaciales. La entrada de imagen admite varias imágenes simultáneas (`image=[a, b]`).

El modelo está entrenado sobre conjuntos de datos públicos, cada uno bajo su propia licencia (el detalle se documenta en `docs/training.md`). La salida no es texto libre, sino probabilidades sobre opciones definidas por el usuario; el autor indica que estas probabilidades están calibradas por modalidad y tipo de pregunta mediante el parámetro `temperature_by_modality` de `fusion_config.json`. El ajuste a un escenario nuevo requiere unos pocos cientos de imágenes o clips etiquetados, con una carpeta por respuesta y un único comando.

## Capacidades

- Decisión tipada con probabilidades calibradas: elección entre opciones (`choice`), puntuación y respuesta sí/no (`noul`).
- Comprensión de imágenes: preguntas sobre fotografías (VQAv2, GQA), lectura de texto en imágenes (TextVQA, OCR-VQA), gráficos (ChartQA) y documentos (DocVQA).
- Capacidades de OCR y de interpretación de gráficos y documentos, con modo de alta resolución (`detail=True`, 256 tokens de imagen).
- Conteo de objetos en imágenes: 0,88 en TallyQA.
- Reconocimiento de eventos sonoros: ESC-50 (0,96), FSD50K (0,86) y VGGSound (0,84).
- Comprensión de intenciones habladas multilingües: SLURP 0,96 y MINDS-14 0,95 en 14 idiomas.
- Razonamiento conjunto imagen + audio sobre el conjunto OmniInstruct (0,85).
- Generalización cero disparo a Mini-ImageNet (0,79), MMAU (0,45) y Song Describer (0,68).
- Compatibilidad de salida con el modelo base Laya: sin imagen ni audio, la salida es bit a bit idéntica.
- No dispone de generación de texto libre, tool calling, function calling ni capacidades de agente: la interfaz es de preguntas tipadas, no de diálogo generativo.

## Casos de uso

- Enrutado de intenciones en centros de contacto: con 0,96 en SLURP y 0,95 en MINDS-14, el modelo clasifica en 30-120 ms si una llamada quiere consultar el saldo, bloquear una tarjeta o pagar una factura, y permite derivar la llamada al flujo correcto antes de que intervenga un agente humano.
- Digitalización y validación documental: con 0,89 en OCR-VQA y 0,72 en DocVQA, se puede usar para responder preguntas tipadas sobre facturas o formularios escaneados (por ejemplo, comprobar sí/no la presencia de un campo) dentro de un pipeline de captura masiva.
- Extracción de datos de gráficos financieros: 0,82 en ChartQA permite responder cuestiones del tipo «¿la serie A supera a la B en este trimestre?» directamente sobre la imagen del gráfico, sin parsear la fuente de datos subyacente.
- Moderación y etiquetado de contenido multimedia: clasificación sí/no o por categorías sobre imágenes y audio combinados (0,85 en OmniInstruct) para triaje previo a revisión humana.
- Vigilancia acústica y monitorización industrial: con 0,96 en ESC-50, el modelo detecta eventos sonoros concretos (alarmas, cristales rotos, maquinaria anómala) y puede emitir una decisión tipada por clip.
- Control de calidad en líneas de producción con señal de vídeo y audio: preguntas del tipo «¿hay un operario en la zona?» o «¿se oye un aviso de parada?» con latencia compatible con procesos en tiempo real.
- Accesibilidad y descripción de escenas: dado que no genera texto libre, encaja mejor como clasificador de apoyo que decide entre opciones predefinidas (por ejemplo, seleccionar la categoría de escena para un sistema de aviso).
- Creación de etiquetas de bajo coste (weak supervision): preetiquetar grandes volúmenes de imágenes y clips con probabilidades calibradas y revisar después solo los casos de baja confianza, reduciendo el coste de anotación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre preguntas de test nunca vistas en entrenamiento, comparando contra Laya interrogado con la misma pregunta pero solo texto (sin imagen ni audio):

| Conjunto | Laya (solo texto) | laya-omni |
|---|---:|---:|
| Preguntas sobre fotos (VQAv2 / GQA) | 0,45 / 0,55 | 0,78 / 0,78 |
| Lectura de texto en imágenes (TextVQA / OCR-VQA) | 0,36 / 0,44 | 0,82 / 0,89 |
| Gráficos y documentos (ChartQA / DocVQA) | 0,36 / 0,40 | 0,82 / 0,72 |
| Diagramas científicos (ScienceQA / AI2D) | 0,41 / 0,25 | 0,80 / 0,62 |
| Conteo (TallyQA) | 0,26 | 0,88 |
| Eventos sonoros (ESC-50 / FSD50K / VGGSound) | 0,43 / 0,45 / 0,43 | 0,96 / 0,86 / 0,84 |
| Intenciones habladas (SLURP / MINDS-14, 14 idiomas) | 0,34 / 0,41 | 0,96 / 0,95 |
| Imagen + audio juntos (OmniInstruct) | 0,46 | 0,85 |
| Reservados: TQA / VQA-RAD / GTZAN | 0,26 / 0,43 / 0,41 | 0,39 / 0,52 / 0,64 |
| Cero disparo: Mini-ImageNet / MMAU / Song Describer | 0,52 / 0,29 / 0,46 | 0,79 / 0,45 / 0,68 |

Advertencia del propio autor: la mayoría de los conjuntos se convirtieron al formato de opción múltiple y sí/no de Laya, con opciones distractoras, por lo que estas cifras no son directamente comparables con las tablas de líderes de VLM generativos. El repositorio incluye 43 conjuntos, calibración y ablaciones en `docs/results.md`, con los números crudos en `eval.json`.

## Requisitos de hardware

- VRAM estimada para inferencia: ~1,2 GB para los pesos en fp16 (~596 M de parámetros) y del orden de 2-3 GB contando activaciones y overhead del runtime. En int8 bajaría a ~0,6 GB y en int4 a ~0,3 GB, aunque el autor no publica cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM. La referencia de latencia publicada es una RTX 4090.
- Cabe en GPU de consumo: sí, de forma holgada; una RTX 3060 de 6 GB o superior es suficiente para los pesos, y también es viable en CPU, aunque la latencia publicada corresponde a GPU.
- Opciones de despliegue: la vía documentada es el paquete Python `laya-omni` (`pip install "laya-omni @ git+https://github.com/ZHEQIUSHUI/laya-omni"`) junto con la descarga de los pesos vía `hf download`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 30-120 ms por pregunta con una imagen o un clip de 10 segundos en una RTX 4090, incluyendo los codificadores.
- Throughput: no publicado de forma explícita; como estimación derivada de la latencia anterior, equivaldría a un rango aproximado de 8 a 33 consultas por segundo en un único flujo secuencial.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo de salida | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| laya-omni | ~596 M (7 M entrenados) | Probabilidades calibradas sobre opciones tipadas | No disponible | Apache-2.0 | Tabla de benchmarks de este documento |
| Laya multilingual (texto) | ~310 M | Probabilidades calibradas sobre opciones tipadas | No disponible | Apache-2.0 | 0,45 VQAv2; 0,36 TextVQA; 0,34 SLURP |
| Qwen3-ASR-0.6B (componente) | 186 M (codificador usado) | Transcripción ASR | No disponible | Apache-2.0 | No disponible |
| VLM/omni generativos de la misma categoría (familias Qwen-Omni, MiniCPM-o) | No disponible | Texto generado | No disponible | No disponible | No disponible |

La model card no incluye comparaciones con modelos omni generativos. La diferencia de planteamiento es sustancial: las alternativas generativas producen texto libre y se evalúan en tablas de VLM, mientras que laya-omni emite probabilidades calibradas sobre un conjunto cerrado de opciones, con un coste de cómputo y de memoria entre uno y dos órdenes de magnitud menor.

## Limitaciones y advertencias

- Rendimiento débil en diagramas científicos (AI2D, TQA), imágenes médicas (VQA-RAD, 0,52) y relaciones espaciales.
- Mala respuesta ante preguntas sobre lo que ocurrirá después (por ejemplo, movimientos de juego) en lugar de sobre lo que se ve en la imagen.
- Sobreajuste aparente a preguntas de diagramas no familiares: el modelo se muestra seguro cuando se equivoca (comportamiento señalado explícitamente por el autor a propósito de TQA).
- Las probabilidades están calibradas por modalidad y tipo de pregunta; usarlas fuera de esa configuración (`temperature_by_modality` en `fusion_config.json`) degrada la calibración.
- No genera texto libre, no soporta tool calling ni flujos de agente: la única interfaz es la formulación de decisiones tipadas.
- Idiomas: la etiqueta oficial cubre multilingüe, inglés y chino; no hay garantía documentada de rendimiento en castellano más allá de la evaluación en 14 idiomas de MINDS-14 para intenciones habladas.
- Longitud de contexto no documentada, lo que dificulta planificar entradas de texto largas junto con imagen o audio.
- Licencia Apache-2.0 para el modelo, pero los datos de entrenamiento proceden de conjuntos públicos con licencias propias; conviene revisar `docs/training.md` antes de un uso comercial.
- El repositorio no declara descargas ni valoraciones y no se documentan cuantizaciones oficiales ni pipelines de despliegue en servidores de inferencia, por lo que la puesta en producción requiere trabajo adicional de integración.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre este modelo: los resultados obtenidos fueron páginas no relacionadas (foros, guías de plataformas de vídeo), por lo que no hay prensa, papers ni análisis independientes que verifiquen las cifras publicadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zheqiushui/laya-omni
- Repositorio de código, documentación y herramienta de ajuste fino: https://github.com/ZHEQIUSHUI/laya-omni
- Resultados completos (43 conjuntos, calibración y ablaciones): https://github.com/ZHEQIUSHUI/laya-omni/blob/main/docs/results.md
- Guía de ajuste fino: https://github.com/ZHEQIUSHUI/laya-omni/blob/main/docs/finetune.md
- Documentación de entrenamiento y licencias de los datos: https://github.com/ZHEQIUSHUI/laya-omni/blob/main/docs/training.md
- Proyecto Laya original: https://github.com/NandhaKishorM/laya
- Modelo base de texto: https://huggingface.co/convaiinnovations/laya-multilingual
- Codificador de imagen: https://huggingface.co/google/siglip2-base-patch16-256
- Codificador de audio: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
- Búsqueda web: no se han encontrado enlaces adicionales relevantes sobre este modelo.
