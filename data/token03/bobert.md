# token03/bobert

## Resumen

BoBERT v13.2 es un encoder tipo transformer desarrollado por el usuario token03 que genera representaciones densas de beatmaps de osu!standard a partir de secuencias de hit objects extraídas de archivos `.osu`. No es un modelo de lenguaje generativo: su salida son vectores de 384 dimensiones pensados para búsqueda por similitud, agrupación y sistemas de recomendación de mapas.

El modelo se preentrenó con aproximadamente 500.000 beatmaps y después se adaptó con una proyección lineal entrenada sobre colecciones etiquetadas de osu!collector y osu!stats. Con 16.142.592 parámetros, 9 capas y 6 cabezas de atención, es un modelo muy compacto: el cuello de botella real no es el encoder, sino el índice de embeddings publicado (498.962 beatmaps).

Su relevancia es doble. Por un lado, cubre un nicho poco explorado dentro del aprendizaje de representaciones: datos estructurados de un videojuego en lugar de texto o imagen. Por otro, publica junto al modelo un índice de vectores y catálogos de metadatos bajo licencia MIT, lo que permite reproducir un recomendador funcional sin reentrenar nada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (estilo BERT), 9 capas, 6 cabezas de atención |
| Parámetros totales | 16.142.592 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 4.096 hit objects por mapa (truncado; el exceso se descarta) |
| Tipos de cuantización | No disponible (los pesos se distribuyen en `model.safetensors`) |
| Idiomas soportados | No aplica: la entrada son secuencias de hit objects de `.osu`, no texto natural |
| Licencia | MIT |
| Formato de pesos | safetensors (encoder, adaptador, estadísticas de normalización y configuración); embeddings en parquet |
| Dimensión del embedding | 384 |
| Modalidad soportada | Solo osu!standard |
| Cobertura del índice | 498.962 beatmaps (índice generado el 2026-09-13) |
| Fecha de publicación | 2026-09-13 según HuggingFace |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer denso de 9 capas y 6 cabezas de atención que procesa secuencias de hit objects de beatmaps de osu!standard. La secuencia se trunca a un máximo de 4.096 hit objects, y la representación final del mapa se obtiene mediante un pooling sobre toda la secuencia. Sobre esa representación se aplica un adaptador: una proyección lineal entrenada con colecciones etiquetadas que reajusta los embeddings para recomendación y búsqueda por similitud. El artefacto `model.safetensors` incluye el encoder, el adaptador, las estadísticas de normalización y la configuración del modelo.

El preentrenamiento usó aproximadamente 500.000 beatmaps obtenidos de Beatconnect, y la fase de adaptación y evaluación se apoyó en colecciones etiquetadas de osu!collector y osu!stats. No se documenta en la información disponible el número exacto de tokens u objetos de entrenamiento, la composición detallada del dataset, ni si se emplearon técnicas de alineación tipo RLHF o DPO (no aplicables en sentido estricto a un modelo de representación). El repositorio de origen incluye el pipeline de entrenamiento, las herramientas de evaluación y los agradecimientos a la comunidad de mapping.

## Capacidades

- Generación de embeddings densos de 384 dimensiones para beatmaps completos de osu!standard.
- Búsqueda por similitud y vecinos más cercanos sobre un índice de 498.962 mapas.
- Recomendación de mapas, con un adaptador afinado específicamente para esta tarea.
- Agrupación y clustering de beatmaps según su representación latente.
- Recuperación de metadatos asociados a cada vector: identificadores de beatmap, densidades y metadatos de pooling/retrieval incluidos en `embeddings.parquet`.
- Uso de catálogos de strain y metadatos auxiliares proporcionados en el directorio `data/` del repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de visión ni de audio: solo procesa la secuencia de hit objects.

## Casos de uso

- Recomendador de beatmaps en producción: el modelo genera el embedding de un mapa o de un conjunto de mapas que el usuario ha jugado y recupera los vecinos más cercanos del índice de 498.962 vectores para sugerir mapas similares. Es el escenario para el que se entrenó el adaptador.
- Búsqueda por similitud en una web o cliente de osu!: integrado detrás de una API, permite al usuario pegar la URL o el identificador de un beatmap y obtener mapas con representación similar sin necesidad de etiquetas manuales.
- Curación y agrupación de colecciones: agrupar los embeddings con k-means o HDBSCAN para descubrir clústeres de estilo, densidad o patrón de mapping y usarlos para organizar mappools de torneos.
- Detección de duplicados y near-duplicates para moderación: calcular la similitud coseno entre mapas nuevos y el índice existente para señalar posibles copias o versiones apenas modificadas antes de que lleguen al sistema de ranking.
- Etiquetado automático de mapas nuevos (cold start): un mapa recién subido se codifica y se sitúa en el espacio de embeddings para asignarle vecinos, categoría aproximada y un ranking inicial de dificultad percibida usando las densidades almacenadas en el parquet.
- Construcción de datasets de investigación: los vectores de 384 dimensiones sirven como features de entrada para modelos posteriores de predicción de dificultad, popularidad o probabilidad de ser jugado.
- Selección asistida de mapas para torneos: dado un conjunto de referencia de un mappool, recuperar candidatos con representación cercana y filtrar por los catálogos de strain para cubrir huecos de dificultad.
- Sistemas de descubrimiento personalizado en aplicaciones de terceros: reutilizar el encoder y el índice bajo licencia MIT para construir un motor de descubrimiento propio sin depender del cliente oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona que el repositorio de origen incluye herramientas de evaluación y que las colecciones etiquetadas de osu!collector y osu!stats se usaron para adaptación y evaluación, pero no se proporcionan métricas concretas (ni recall@k, ni precisión de recomendación, ni comparaciones cuantitativas).

## Requisitos de hardware

- Pesos del encoder: 16.142.592 parámetros, aproximadamente 65 MB en FP32 y unos 32 MB en FP16. El modelo en sí cabe en cualquier GPU, en CPU e incluso en dispositivos embebidos.
- Índice de embeddings: 498.962 vectores de 384 dimensiones suponen unos 766 MB en FP32 y unos 383 MB en FP16, más el espacio de los metadatos asociados. Este es el componente que domina los requisitos de memoria.
- GPU recomendadas: no se requiere GPU para la inferencia del encoder. Cualquier GPU consumer (por ejemplo, una RTX 3060 o superior) acelera el proceso, pero no es imprescindible.
- Cabe en GPU consumer: sí, con margen amplio; el límite práctico es la memoria necesaria para mantener el índice en RAM o VRAM.
- Opciones de despliegue: el repositorio de origen proporciona un flujo con `uv run --group serve fetch-run` y un `docker compose up --build api`. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo generativo.
- Latencia: la codificación de mapas largos en CPU sin caché puede tardar varios segundos según la propia model card. No se documentan cifras de throughput ni el efecto exacto del uso de GPU.

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables de representación de beatmaps de osu!. Se trata de un nicho muy específico y no se dispone de alternativas publicadas con las que contrastar parámetros, contexto o licencia.

| Modelo | Parámetros | Dimensión del embedding | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BoBERT v13.2 | 16.142.592 | 384 | 4.096 hit objects | MIT | HuggingFace y repositorio en GitHub |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo soporta osu!standard. No hay soporte documentado para osu!mania, taiko ni catch.
- Los mapas se truncan después de 4.096 hit objects, de modo que las secciones finales de mapas muy largos no influyen en el embedding.
- Los mapas cortos pueden generar vecinos más ruidosos, según advierte la propia model card.
- El pooling sobre el mapa completo puede diluir secciones distintivas y hacer que partes características queden infrarepresentadas en el vector final.
- La codificación de mapas largos en CPU sin caché puede tardar varios segundos, lo que obliga a diseñar una capa de caché o a usar GPU para despliegues interactivos.
- No se han publicado benchmarks ni métricas de calidad de recomendación, por lo que el rendimiento real en producción no está cuantificado de forma independiente.
- El modelo acumula 0 descargas y 0 likes en HuggingFace en el momento de la consulta: no hay validación externa ni informes de terceros.
- Los datos de entrenamiento provienen de Beatconnect y de colecciones etiquetadas de osu!collector y osu!stats. El crédito de los beatmaps corresponde a la comunidad de mapping; conviene revisar las condiciones de esas fuentes si se reutilizan los datos más allá del modelo.
- La licencia MIT permite uso comercial, modificación y redistribución, pero no ofrece garantías y no cubre posibles derechos sobre los beatmaps de origen.
- El artefacto se exportó desde un workspace con cambios sin confirmar (`108a6979f70a564ad603f5c2df5168a9040d4e60` con modificaciones no registradas), lo que dificulta la reproducibilidad exacta de la versión publicada.
- Es imprescindible mantener juntos `model.safetensors` y `embeddings.parquet`: el índice registra el checksum SHA-256 del modelo, y un desajuste entre ambos invalida las consultas en línea.
- No es un modelo generativo: no puede redactar textos, razonar de forma multi-paso ni ejecutar herramientas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/token03/bobert
- Repositorio de código y arquitectura: https://github.com/token03/bobert
- Recomendador en vivo: https://bobert-web.pages.dev/
- Fuente de los beatmaps: Beatconnect
- Colecciones etiquetadas: osu!collector y osu!stats
- Los resultados de la búsqueda web realizada no aportan enlaces adicionales relevantes sobre este modelo.
