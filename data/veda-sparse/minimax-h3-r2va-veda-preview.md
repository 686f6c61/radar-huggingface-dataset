# Veda-Sparse/Minimax-H3-R2VA-Veda-Preview

## Resumen

Veda-MiniMax-H3 R2VA (Preview) es un checkpoint de investigación publicado por Veda-Sparse que aplica Veda, un método de atención dispersa aprendida, al modelo de difusión de vídeo MiniMax-H3 en su variante de generación referencia-a-audio-y-vídeo (R2VA). El objetivo es reducir el coste computacional de la atención en modelos de difusión de vídeo sin retocar los pesos del backbone: el predictor de puntuaciones de tiles se entrena por separado y se acopla como componente externo, de modo que el modelo base y el LoRA de aceleración siguen siendo intercambiables.

La innovación principal es la selección independiente de tiles visuales. La atención sobre los tiles de referencia visual y sobre los tiles del vídeo generado se elige con dos presupuestos separados, mientras que el texto, el condicionamiento procedente de un VLM y la atención de audio permanecen densos. El checkpoint liberado fija 32 tiles de referencia y 32 tiles de vídeo actual por tile de consulta y cabeza de atención, y genera clips de 124 fotogramas a 1344×768 (unos 5,17 segundos) en ocho pasos de denoising gracias al LoRA Turbo de MiniMax-H3.

Se trata de una versión de vista previa: el predictor se afinó durante 600 actualizaciones partiendo del predictor T2VA, sobre clips R2VA de 5,17 segundos. El predictor se almacena en FP8 (0,4 GB) y se deconvierte a BF16 al cargarlo, y no es un LoRA ni modifica los pesos del backbone. Su relevancia actual está en demostrar que la atención block-sparse aprendida es viable en un pipeline de difusión de vídeo con audio y referencias multimodales, un frente activo para abaratar la inferencia de vídeo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Predictor de atención dispersa aprendida (block-sparse, `veda_tile_score_predictor`) acoplado a un backbone de difusión de vídeo MiniMax-H3; el predictor no es un LoRA y no altera los pesos del backbone |
| Parametros totales | No disponible (el repositorio de 0,4 GB contiene únicamente el predictor; los pesos del backbone H3 no están incluidos) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible; clips de 124 fotogramas a 1344×768, equivalentes a unos 5,17 segundos |
| Tipos de cuantizacion | Predictor distribuido en FP8 y deconvolucionado a BF16 en el momento de la carga; cuantizaciones del backbone MiniMax-H3 no disponibles en la información |
| Idiomas soportados | No disponible (el texto se procesa a través del backbone MiniMax-H3; la model card no documenta idiomas) |
| Licencia | `minimax-h3-community` (campo `license: other`, con `license_link: LICENSE` en el repositorio) |
| Formato de pesos | No disponible; el repositorio contiene el predictor en FP8, con formato de fichero no especificado en la model card |
| Tarea (pipeline) | text-to-video (con soporte de referencia-a-vídeo y referencia-a-audio-y-vídeo) |
| Modelos base | MiniMaxAI/MiniMax-H3 y larryvrh/MiniMax-H3-Turbo-Lora |
| Biblioteca | `minimax-h3` |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 664 descargas, 11 likes |
| Fechas | Creado el 2026-10-07, actualizado el 2026-10-08 |

## Arquitectura y entrenamiento

Veda es un método de atención dispersa aprendida para modelos de difusión de vídeo. En este checkpoint se aplica a la generación R2VA de MiniMax-H3: el predictor decide qué tiles visuales entran en el cómputo de atención, y lo hace de forma independiente para los tiles de referencia visual y para los tiles del vídeo que se está generando. Las ramas de texto, condicionamiento VLM y audio mantienen atención densa, de modo que la dispersión se concentra en la parte visual, que es la que domina el coste cuadrático. El presupuesto es fijo: hasta 32 tiles de referencia visual y 32 tiles de vídeo actual por tile de consulta y cabeza. Al ser un predictor externo, el backbone H3 y los pesos del LoRA Turbo permanecen intactos, lo que permite comparar configuración densa y configuración Veda con la misma semilla, prompt, geometría y LoRA.

El entrenamiento del checkpoint consistió en 600 actualizaciones de fine-tuning sobre el predictor T2VA previamente existente, usando clips R2VA de 5,17 segundos. La generación se realiza en ocho pasos de denoising mediante el LoRA Turbo de MiniMax-H3. El predictor se guarda en FP8 y se deconvierte a BF16 al cargarlo, lo que explica el tamaño reducido del repositorio (0,4 GB). La model card no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo etapas de RLHF o DPO, por lo que esos datos no están disponibles.

## Capacidades

- Generación de vídeo con audio a partir de texto (text-to-audio-video) en clips de 124 fotogramas a 1344×768, unos 5,17 segundos.
- Generación referencia-a-audio-y-vídeo (R2VA): acepta referencias visuales (imágenes o vídeo) y referencias de audio.
- Condicionamiento de audio con pista de sonido de origen y con referencia de voz, según los ejemplos publicados (escena con voz masculina de referencia y conservación de la banda sonora original).
- Condicionamiento de apariencia y escena a partir de imágenes de referencia de personaje y de entorno, incluyendo estilos como animación o escenas fotorrealistas.
- Generación acelerada en ocho pasos de denoising mediante el LoRA Turbo de MiniMax-H3.
- Atención visual dispersa con presupuestos fijos por cabeza y tile de consulta (32 tiles de referencia y 32 de vídeo actual), manteniendo densas las ramas de texto, VLM y audio.
- Comparación directa denso frente a disperso con idéntica semilla, prompt y geometría, útil para evaluación de la calidad y de la aceleración.
- No se documentan capacidades de tool calling, function calling ni razonamiento multi-paso orientado a agentes; no es un modelo de lenguaje, sino un modelo generativo de vídeo y audio.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Previsualización rápida de planos en producción audiovisual: el modelo genera clips de 5,17 segundos a 1344×768 en ocho pasos, lo que permite iterar sobre el guion visual antes de comprometer un render denso más costoso.
- Transferencia de personaje a vídeo con audio: dada una imagen de referencia de personaje y una referencia de voz, se puede generar una escena hablada manteniendo la apariencia y el timbre, como ilustra el ejemplo del hombre con traje rosa y el cordero.
- Doblaje y conservación de banda sonora: los ejemplos de la model card conservan la pista de audio original como referencia, un flujo útil para resincronizar vídeo generado con audio preexistente.
- Prototipado de escenas de animación: con una ilustración de referencia se generan planos con movimiento de cámara y cambios de iluminación, útil para animáticas y pruebas de dirección de arte.
- Investigación en atención dispersa para difusión: el predictor es plug-and-play y deja intactos backbone y LoRA, por lo que sirve como banco de pruebas reproducible para medir el impacto de distintas políticas de dispersión sobre la calidad final.
- Evaluación comparativa denso frente a disperso: el repositorio publica vídeos denso/Veda emparejados con la misma semilla y prompt, aprovechables para estudios de fidelidad, coherencia temporal y sincronización de audio.
- Integración en pipelines de generación de vídeo con requisitos de latencia: la reducción de cómputo de atención sobre tiles visuales resulta adecuada para servicios interactivos donde el coste por clip es determinante, siempre que se acepte el estado de vista previa.
- Creación de material de referencia para conjuntos de datos sintéticos: clips cortos y controlados con referencias visuales y de audio, útiles para aumentar datos de entrenamiento de otros sistemas multimodales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye vídeos comparativos denso frente a Veda con la misma semilla, prompt, geometría y LoRA Turbo, y menciona que la barra superior de cada comparación muestra aceleraciones de atención y de denoising, pero no se proporcionan cifras numéricas de esas aceleraciones ni métricas objetivas de calidad (FVD, CLIP, sincronización audio-vídeo, etc.). Tampoco se ofrecen resultados de tareas estándar como MMLU, HumanEval o GSM8K, que además no aplican a un modelo de difusión de vídeo.

## Requisitos de hardware

- El repositorio ocupa 0,4 GB y contiene solo el predictor en FP8; la VRAM total necesaria depende de los pesos del backbone MiniMax-H3 y del LoRA Turbo, cuyos requisitos no se detallan en la información disponible.
- No se especifican GPU recomendadas (A100, H100, RTX 4090 u otras) en la model card.
- No se indica si el pipeline completo cabe en GPU de consumo; el tamaño del predictor por sí solo (0,4 GB) no es representativo, ya que el coste dominante es el backbone de difusión de vídeo.
- La model card enlaza una guía de despliegue (`AGENTS.md`) y el código del proyecto (repositorio Miowtion) para la puesta en marcha, pero no documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- No se publican datos de latencia ni de throughput, más allá de la generación en ocho pasos habilitada por el LoRA Turbo y de la afirmación cualitativa de aceleración de atención y denoising.

## Comparativa con modelos similares

| Modelo | Atención visual | Presupuesto de tiles | Pasos de generación | Pesos del backbone | Licencia |
|---|---|---|---|---|---|
| Veda-MiniMax-H3 R2VA (Preview) | Dispersa aprendida (block-sparse), referencia y vídeo actual seleccionados por separado | 32 referencia + 32 vídeo actual por tile de consulta y cabeza | 8 (LoRA Turbo) | Sin modificar (predictor externo) | minimax-h3-community |
| MiniMax-H3 en configuración densa | Densa | No aplica | No disponible en la información | Originales | La del modelo base (no disponible aquí) |
| MiniMax-H3 + Turbo LoRA | Densa | No aplica | 8 | Originales más LoRA | La del modelo base y la del LoRA (no disponible aquí) |

No se dispone de datos en la información proporcionada para comparar con alternativas de terceros de la misma categoría (por ejemplo, otros modelos de difusión de vídeo con atención dispersa), ni de cifras de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Estado de vista previa: el predictor se afinó únicamente durante 600 actualizaciones, por lo que la calidad y la robustez pueden estar por debajo de una versión final.
- Presupuesto de atención fijo (32 tiles de referencia y 32 de vídeo actual): no es configurable en este checkpoint y condiciona el comportamiento en escenas con muchas referencias o mucho detalle.
- Duración limitada: los clips de entrenamiento y de ejemplo son de 5,17 segundos y 124 fotogramas; no hay evidencia de generalización a secuencias más largas.
- Riesgo de artefactos e inconsistencias: como todo modelo de difusión de vídeo, puede producir incoherencias temporales, deformaciones anatómicas o desincronización entre audio y vídeo; no se han publicado métricas que cuantifiquen estos fallos.
- Sesgos: no se documenta ningún análisis de sesgos del predictor ni del backbone MiniMax-H3, ni la composición del dataset de entrenamiento, por lo que no puede evaluarse su comportamiento diferencial por etnia, género o estilo.
- Idiomas: la model card no especifica qué lenguas admiten los prompts de texto; se desconoce si hay degradación fuera del inglés.
- Licencia: se distribuye bajo `minimax-h3-community` (campo `license: other`), con el texto legal en el fichero LICENSE del repositorio; es imprescindible revisar ese documento antes de cualquier uso comercial, ya que la model card no resume sus condiciones.
- Dependencia del backbone: el uso requiere descargar y respetar las licencias de MiniMax-H3 y de MiniMax-H3-Turbo-Lora, que son componentes separados no incluidos en este repositorio.
- Trazabilidad limitada: el paper referenciado aparece con el identificador arXiv:2605.30325 y no se ha verificado su contenido en la información disponible; los detalles del método dependen de esa fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Veda-Sparse/Minimax-H3-R2VA-Veda-Preview
- Demo: https://veda.hanxiao.run/
- Página del proyecto: https://veda-sparse.github.io/
- Código (repositorio Miowtion): https://github.com/veda-sparse/Miowtion/tree/main
- Paper: https://arxiv.org/abs/2605.30325
- Guía de despliegue: AGENTS.md (en el repositorio de HuggingFace)
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- LoRA Turbo: https://huggingface.co/larryvrh/MiniMax-H3-Turbo-Lora
