# thelogicalgate/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX

## Resumen

NVIDIA Nemotron 3.5 Bolt 74B-A9B es un modelo multimodal de tipo mixtura de expertos (MoE) desarrollado por NVIDIA, publicado originalmente en BF16 y aquí distribuido como conversión a MLX por el usuario thelogicalgate. El modelo combina capas Mamba-2, capas de atención y bloques MoE latentes a lo largo de 88 capas, con un total declarado de 74.000 millones de parámetros y aproximadamente 9.000 millones activos por token. La ventana de contexto alcanza los 262.144 tokens y el vocabulario es de 131.072 entradas.

La relevancia de esta ficha concreta es doble. Por un lado, el modelo incorpora visión mediante un codificador C-RADIO v4-H de 32 capas y un proyector de tipo pixel-shuffle (`mlp1`) que mapea a un espacio de 4096 dimensiones, lo que habilita entrada image-text-to-text con el token especial `<image>` (id 18). Por otro, esta conversión añade un borrador especulativo LiLiCorr empaquetado como sidecar en `drafter/`, pensado para acelerar la decodificación en tiempo de ejecución MLX.

El repositorio ocupa 46,5 GB con los pesos cuantizados de forma afín (4 bits en expertos y proyecciones Mamba, 8 bits en embeddings, `lm_head`, atención y proyecciones latentes, y BF16 en normas y codificador de visión). Está pensado para ejecutarse en hardware Apple Silicon mediante MLX y se distribuye bajo licencia OpenMDW 1.1. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas Mamba-2 y bloques MoE latentes (`nemotron_h`), más codificador de visión C-RADIO v4-H |
| Parámetros totales | 74B declarados en la model card; 76.579.579.912 según los safetensors del repositorio |
| Parámetros activos | 9B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | Afín, group size 64: 4 bits en expertos enrutados (`switch_mlp`), expertos compartidos y `in_proj`/`out_proj` de Mamba; 8 bits en embeddings, `lm_head`, Q/K/V/O de atención y proyecciones latentes; BF16 en normas, convolución de Mamba, `A_log`, `D`, `dt_bias`, compuerta del router y codificador RADIO. Empaquetado en `uint32` con escalas y sesgos en `bfloat16` |
| Idiomas soportados | Inglés, español, francés, alemán, italiano y japonés |
| Licencia | OpenMDW 1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | Safetensors MLX (`model-00001-of-00050.safetensors` a `model-00050-of-00050.safetensors` con `model.safetensors.index.json`), más tres shards de visión (`vision-00000` a `vision-00002`) y el sidecar `drafter/model.safetensors` |

## Arquitectura y entrenamiento

El modelo sigue una topología híbrida de 88 capas que alterna bloques Mamba-2, capas de atención y bloques MoE. El tamaño oculto es de 4096, la atención usa 32 cabezas de consulta y 2 cabezas de clave/valor con dimensión de cabeza 128 (`grouped-query attention`), y el bloque MoE enruta sobre el estado oculto completo, ejecuta los expertos enrutados en un espacio latente de 1024 dimensiones y proyecta de vuelta. Se admiten hasta 496 expertos enrutados con top-9 y un experto compartido que permanece sobre el estado oculto original. El vocabulario es de 131.072 tokens.

El componente de visión es un C-RADIO v4-H de 32 capas con tamaño oculto 1280 y 16 cabezas, cuyos tensores conservan los nombres originales de RADIO (QKV fusionado, `mlp.fc1`/`mlp.fc2`) más `mlp1`, el proyector pixel-shuffle hacia 4096. El checkpoint incluye además `patch_generator.video_embedder`, aunque esta conversión no implementa un runtime de vídeo. El borrador LiLiCorr (`drafter/`) consta de un tronco de 5 capas de atención de ventana deslizante con ventana 1024, 32 cabezas de consulta y 2 de clave/valor, y una cabeza LiLiCorr de 1024 dimensiones ocultas, 2 capas, 8 cabezas, top-k de candidatos 8 y tamaño de bloque 8; declara como capas objetivo las ids 1, 18, 35, 51, 68 y 85.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni sobre si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones adicionales de decodificación más allá del borrador especulativo LiLiCorr incluido en el repositorio.

## Capacidades

- Generación de texto conversacional en seis idiomas: inglés, español, francés, alemán, italiano y japonés.
- Comprensión de imágenes estáticas mediante el token `<image>` (id 18) y el codificador C-RADIO v4-H; el pipeline declarado es image-text-to-text.
- Razonamiento sobre ventanas de contexto muy largas, hasta 262.144 tokens, con atención de consulta agrupada (32 cabezas Q frente a 2 KV).
- Procesamiento eficiente mediante arquitectura MoE: 9B parámetros activos por token sobre un total de 74B, lo que reduce el coste de inferencia por token frente a un modelo denso equivalente.
- Decodificación especulativa mediante el borrador LiLiCorr incluido como sidecar, con el que se puede acelerar la generación sobre las capas objetivo declaradas.
- Capacidades multilingües cruzadas: al compartir espacio de tokens entre los seis idiomas, permite tareas de traducción y de conversación mixta.
- No se documenta en la model card soporte explícito de tool calling ni de function calling.
- No se documenta en la model card un modo de razonamiento extendido (thinking mode) ni capacidades de audio.
- El procesamiento de vídeo no está implementado en esta conversión, pese a que el checkpoint incluya tensores de `video_embedder`.

## Casos de uso

- **Atención al cliente multimodal**: el modelo puede gestionar conversaciones multi-turno en las que el usuario adjunta capturas de pantalla, fotos de producto o recibos, gracias a la entrada image-text-to-text y a una ventana de 262.144 tokens que permite mantener todo el historial más documentación de soporte en el mismo contexto.
- **Análisis de documentos escaneados**: extracción y resumen de facturas, contratos o informes en formato imagen sin necesidad de un pipeline OCR separado, ya que el proyector `mlp1` mapea las características visuales al espacio de 4096 dimensiones del modelo de lenguaje.
- **Asistente local confidencial en Apple Silicon**: al distribuirse como pesos MLX cuantizados de 46,5 GB, puede ejecutarse íntegramente en un Mac Studio o MacBook Pro de gama alta sin enviar datos a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad estrictos.
- **Revisión de código sobre repositorios completos**: con 262.144 tokens de contexto es viable cargar múltiples ficheros de un proyecto y pedir análisis de coherencia, detección de patrones repetidos o propuestas de refactorización en una sola pasada.
- **Investigación sobre corpus largos**: análisis de transcripciones, artículos científicos o documentación técnica de cientos de miles de tokens, con capacidad de responder preguntas que requieren cruzar información entre secciones alejadas del texto.
- **Soporte técnico multilingüe**: atención en inglés, español, francés, alemán, italiano y japonés desde un único despliegue, útil para organizaciones con clientes en esos mercados.
- **Generación asistida con baja latencia**: el borrador LiLiCorr permite plantear escenarios de decodificación especulativa en los que se propongan bloques de 8 tokens candidatos y se verifiquen contra las capas objetivo 1, 18, 35, 51, 68 y 85, reduciendo el número de pasos del modelo principal.
- **Prototipado de agentes visuales**: combinación de comprensión de imágenes con generación de texto para tareas de descripción, clasificación o extracción estructurada a partir de diagramas y fotografías, sin salir del ecosistema MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación, y la búsqueda web realizada no ha devuelto fuentes técnicas que las aporten. No se deben asumir valores procedentes de otros modelos de la familia Nemotron sin verificación directa.

## Requisitos de hardware

- **Peso en disco**: 46,5 GB de repositorio, repartidos en 50 shards de lenguaje, 3 shards de visión y el sidecar del borrador.
- **Memoria unificada necesaria**: al tratarse de pesos MLX cuantizados, el requisito práctico es memoria unificada de Apple Silicon. Con 46,5 GB de pesos más activaciones y caché KV para contexto largo, se recomienda un mínimo de 64 GB y, para trabajar con contextos de decenas de miles de tokens, 128 GB o más.
- **Equipos Apple recomendados**: Mac Studio con M2 Ultra o M3 Ultra y 192 GB de memoria unificada, o MacBook Pro con M4 Max y 128 GB. Un equipo con 32 GB o 36 GB no puede alojar el modelo.
- **GPU discreta**: no cabe en GPUs de consumo como la RTX 4090 (24 GB) en este formato. Tampoco hay en esta conversión un formato alternativo para CUDA; para ello habría que acudir a los pesos originales de NVIDIA.
- **Opciones de despliegue**: runtime MLX que lea `radio_vision`, los shards de visión indexados y el directorio `drafter/`. No se publica GGUF en esta conversión, por lo que no es directamente desplegable en llama.cpp u Ollama. Tampoco se documenta compatibilidad con vLLM o TGI para estos pesos.
- **Latencia y throughput**: no disponible. No se han publicado medidas de tokens por segundo ni de ganancia real del borrador LiLiCorr sobre este checkpoint.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks ni de especificaciones de modelos comparables de otras familias en la información proporcionada. La comparación posible se limita a las variantes de la propia familia Nemotron 3.5 Bolt citadas en el repositorio:

| Variante | Formato | Tamaño aproximado | Uso previsto |
|---|---|---|---|
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16` | Safetensors BF16 | no disponible en la información disponible | Referencia de precisión completa; requiere mucha más memoria |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr` | NVFP4 | aproximadamente 24 GB según el nombre del repositorio | Despliegue en hardware NVIDIA con cuantización NVFP4 y borrador LiLiCorr |
| `thelogicalgate/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX` (esta ficha) | Safetensors MLX, cuantización afín mixta 4/8 bits y BF16 | 46,5 GB de repositorio | Inferencia en Apple Silicon con MLX y decodificación especulativa LiLiCorr |

Comparativa con alternativas externas de la misma categoría (otros MoE multimodales de ~70B totales y ~10B activos): no disponible.

## Limitaciones y advertencias

- **Ausencia de benchmarks publicados**: no hay ninguna evaluación objetiva en la información disponible, por lo que el rendimiento real en tareas concretas debe validarse por cuenta propia antes de llevarlo a producción.
- **Riesgo de alucinación**: no se documentan en la model card mecanismos específicos de mitigación ni tasas de alucinación medidas; como en cualquier modelo generativo, las respuestas deben verificarse en dominios sensibles.
- **Sesgos**: no se describe en la información disponible ninguna auditoría de sesgos ni la composición del corpus de entrenamiento, lo que impide estimar sesgos de género, culturales o lingüísticos.
- **Soporte de idiomas desigual**: aunque se declaran seis idiomas, no se especifica el reparto de volumen de entrenamiento entre ellos, por lo que el rendimiento en español, italiano o japonés podría ser inferior al de inglés.
- **Contexto largo no verificado**: la ventana de 262.144 tokens es una capacidad declarada; no hay medidas de degradación de la calidad a longitudes cercanas al máximo.
- **Restricciones de licencia**: los pesos se rigen por OpenMDW 1.1, no por una licencia Apache o MIT. Es imprescindible revisar las condiciones de uso comercial y de redistribución de trabajos derivados antes de integrarlo en un producto.
- **Advertencia de derivación**: se trata de una conversión de pesos realizada por un tercero (`thelogicalgate`), no de una publicación oficial de NVIDIA. Cualquier incidencia de calidad o de fidelidad respecto al modelo original debe atribuirse al proceso de conversión y cuantización, no necesariamente al modelo base.
- **Sin runtime de vídeo**: aunque el checkpoint contiene tensores de `video_embedder`, esta conversión no implementa procesamiento de vídeo. Solo se admiten imágenes estáticas mediante el token `<image>`.
- **Dependencia de runtime específico**: requiere un runtime MLX que interprete `radio_vision`, los shards de visión y el sidecar `drafter/`. Un runtime que ignore estas claves cargará el modelo de forma incompleta o fallará.
- **Discrepancia en el recuento de parámetros**: la model card declara 74B, mientras que los safetensors suman 76.579.579.912 parámetros. Conviene tenerlo en cuenta al dimensionar memoria.
- **Uso del borrador LiLiCorr**: el cargador debe alimentar a la cabeza la salida de la capa anterior correspondiente, ya que el id objetivo declarado es el índice de esa salida más uno. Una integración incorrecta degradaría o anularía la aceleración.
- **Madurez del repositorio**: registro creado el 15 de octubre de 2026 y actualizado el 16 de octubre de 2026, con cero descargas y cero valoraciones en el momento de redactar esta ficha. No hay evidencia de uso en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/thelogicalgate/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-MLX
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-BF16
- Variante NVFP4 con borrador LiLiCorr: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- La búsqueda web realizada no ha devuelto fuentes técnicas relevantes sobre este modelo (papers, blogs o repositorios adicionales); los resultados obtenidos no guardan relación con el contenido de la ficha y se han descartado.
