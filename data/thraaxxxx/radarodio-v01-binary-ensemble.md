# Thraaxxxx/radarodio-v01-binary-ensemble

## Resumen

Radar Ódio v0.1 — Binary Production Ensemble es un clasificador binario de discurso de odio en portugués publicado por el usuario Thraaxxxx en Hugging Face. Se distribuye como un artefacto de producción congelado y su columna vertebral es `pablocosta/bertabaporu-base-uncased`, un transformer de tipo BERT en variante base sin distinguir mayúsculas, ajustado a dos etiquetas: `nao_hate` y `hate`.

No es un modelo único, sino un ensemble de cinco miembros entrenados con las semillas 13, 42, 97, 123 y 2026, cuyos logits se agregan mediante media aritmética. El repositorio declara 675.989.770 parámetros totales (unos 135,2 millones por miembro) y 5,4 GB de tamaño en formato safetensors, con licencia MIT y soporte exclusivo de portugués.

Su interés es fundamentalmente operativo: el autor encapsula la temperatura de calibración (temperature scaling) y el umbral de decisión dentro del `config.json`, de modo que la aplicación consumidora no necesita conocer ni replicar esa lógica. El resultado congelado en test es Macro-F1 0,688161 y F1 de la clase `hate` 0,478181, un rendimiento desigual que conviene valorar antes de integrarlo en un sistema de moderación real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de 5 clasificadores BERT (encoder transformer) con cabeza de clasificación binaria; agregación por media aritmética de los cinco logits |
| Parámetros totales | 675.989.770 (aproximadamente 135,2 millones por cada uno de los 5 miembros) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | 512 tokens (política de truncado B: 255 primeros + 255 últimos tokens de contenido, más tokens especiales) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Portugués (pt) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers, con código personalizado y `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de `pablocosta/bertabaporu-base-uncased` como backbone, un BERT base en portugués. Sobre esa base se entrena una cabeza de clasificación de secuencias con dos clases (`nao_hate`, `hate`) y se repite el proceso con cinco semillas distintas, formando un ensemble. La condición experimental final declarada es «weighted» y la condición de hiperparámetros es «hp_03». La calibración se realiza mediante temperature scaling y tanto la temperatura como el umbral binario final quedan almacenados en el `config.json`, de forma que la clase `classify()` del modelo aplica ambos sin intervención del usuario.

El preprocesamiento incorpora cuatro tokens especiales propios —`<URL>`, `<USER>`, `<EMAIL>` y `<PHONE>`— que sustituyen entidades sensibles o ruidosas antes de la tokenización, y una política de truncado («política B») que conserva los 255 primeros y los 255 últimos tokens de contenido cuando la entrada excede la ventana. No se documenta en la model card el número de tokens de entrenamiento, la composición del corpus, ni si se emplearon técnicas de RLHF o DPO; tampoco se detalla la función de pérdida ni el esquema de validación usado para seleccionar la condición final. El autor indica explícitamente que la condición del modelo se eligió antes de la evaluación final en test.

## Capacidades

- Clasificación de texto binaria en portugués: asigna una de dos etiquetas (`hate` / `nao_hate`) a una secuencia de entrada.
- Método `classify()` personalizado (requiere `trust_remote_code=True`) que devuelve un diccionario con `label`, `score`, `hate_probability`, `original_content_tokens` y `truncated_policy_b`.
- Probabilidad calibrada mediante temperature scaling, utilizable como puntuación de ordenación además de como decisión binaria.
- Normalización de entidades mediante tokens especiales para URL, usuarios, correos y teléfonos.
- Indicador de truncado: informa de si la entrada superó la ventana y se aplicó la política B.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni multimodalidad.
- Multilingüismo: únicamente portugués; no se declara soporte para otras lenguas.

## Casos de uso

- Moderación de comentarios en foros y redes sociales en portugués: el modelo actúa como primera capa de filtrado y envía solo los casos marcados como `hate` a revisión humana, reduciendo el volumen que llega a los moderadores.
- Priorización de colas de revisión: `hate_probability` permite ordenar la cola de moderación por riesgo en lugar de por orden cronológico, de modo que los casos más probables se atienden primero.
- Filtrado previo en plataformas de contenido generado por el usuario (UGC): integrado como paso anterior a la publicación, con umbral ajustable sin reentrenar porque el umbral vive en la configuración.
- Análisis de toxicidad en feedback abierto de clientes: procesamiento por lotes de encuestas, reseñas y tickets en portugués para cuantificar la prevalencia de discurso de odio en cada canal.
- Investigación académica en PLN portugués: sirve como línea base reproducible, con semillas y condición experimental declaradas, para comparar contra otros clasificadores de odio.
- Monitorización de comunidades lusófonas para social listening: detección temprana de picos de discurso hostil en conversaciones públicas, siempre con supervisión humana de las decisiones finales.
- Preprocesamiento con protección de datos: los tokens `<URL>`, `<USER>`, `<EMAIL>` y `<PHONE>` permiten clasificar contenido sin exponer identificadores personales al modelo.
- Auditoría de corpus históricos: etiquetado retrospectivo de grandes volúmenes de texto ya almacenado para estudios de evolución de la toxicidad, asumiendo el riesgo de deriva temporal señalado por el autor.

## Benchmarks y rendimiento

Resultados congelados declarados por el autor en la partición de test de la versión v0.1:

| Métrica | Valor |
|---|---|
| Macro-F1 | 0,688161 |
| F1 (clase `hate`) | 0,478181 |

No se han publicado resultados de benchmarks en la información disponible más allá de estas dos métricas: no hay datos de precisión, exhaustividad (recall), exactitud global, matrices de confusión ni comparación con otros modelos. Tampoco se especifica el tamaño ni la composición del conjunto de test.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 2,70 GB solo para pesos (675,99 M de parámetros), más activaciones y lote; en la práctica entre 3 y 4 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,35 GB de pesos; alrededor de 2 GB con activaciones para lotes pequeños.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM, como RTX 3050, RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 o H100. No requiere hardware de gama alta.
- Cabe en GPU de consumo sin problemas. En CPU también es viable para lotes pequeños, aunque el ensemble ejecuta cinco pasadas hacia delante por cada entrada, por lo que la latencia se multiplica aproximadamente por cinco respecto a un único BERT base.
- El repositorio ocupa 5,4 GB, por encima de lo que sugieren los pesos en fp32 (2,70 GB), probablemente por material adicional no detallado en la información disponible.
- Opciones de despliegue documentadas: `transformers` con `AutoTokenizer` y `AutoModelForSequenceClassification`, obligatoriamente con `trust_remote_code=True` y fijando un commit concreto.
- No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni GGUF; estos runners no cubren de forma nativa clasificación de secuencias con código personalizado. La conversión a ONNX o la cuantización no están documentadas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento publicado |
|---|---|---|---|---|---|
| Radar Ódio v0.1 Binary Ensemble | 675.989.770 (5 × ≈135,2 M) | 512 tokens | Clasificación binaria de odio en portugués | MIT | Macro-F1 0,688161; F1-hate 0,478181 |
| `pablocosta/bertabaporu-base-uncased` (backbone) | no disponible | no disponible | Modelo base enmascarado en portugués | MIT, según la model card del ensemble | no disponible |
| `neuralmind/bert-base-portuguese-cased` (BERTimbau) | no disponible | no disponible | Modelo base en portugués | no disponible en la información proporcionada | no disponible |
| LLM generativo con prompting para moderación | no disponible | no disponible | Clasificación por instrucciones | no disponible | no disponible |

Solo la primera fila está respaldada por los datos aportados en la información disponible; el resto de celdas no pueden completarse sin salir de esa fuente. No se dispone de comparativas de rendimiento publicadas por el autor frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Rendimiento bajo en la clase positiva: un F1 de 0,478181 para `hate` implica que el modelo falla en una proporción elevada de casos de odio reales, con falsos negativos probables. El Macro-F1 de 0,688161 también es modesto para uso directo sin supervisión.
- Monolingüe: solo portugués. No hay evaluación de variantes (portugués de Brasil frente a portugués de Portugal) ni de registros dialectales.
- Solo texto: el autor advierte que el contexto externo al texto y el contenido multimodal no se consideran; esto limita los casos en los que el odio se expresa mediante imágenes, vídeo o referencias culturales implícitas.
- Deriva temporal y de dominio: reconocida explícitamente en la model card. El modelo puede degradarse con cambios en el vocabulario, los temas o las normas de la comunidad.
- Truncado a 512 tokens con política B: en conversaciones o documentos largos se descarta el contenido central, lo que puede eliminar la evidencia que determina la etiqueta. El campo `truncated_policy_b` permite detectar estos casos, pero no recuperar la información perdida.
- Uso obligatorio de `trust_remote_code=True`: se ejecuta código del autor al cargar el modelo. El propio autor recomienda usar un token de Hugging Face de solo lectura con permisos finos y fijar un commit concreto (revision).
- Sesgos conocidos: no disponible. La model card no documenta análisis de sesgo, composición del corpus de entrenamiento, número de tokens ni proceso de anotación, por lo que no se puede evaluar qué sesgos lingüísticos, geográficos o de género puede heredar.
- Ausencia de validación externa: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y solo presenta métricas agregadas del autor. No hay artefactos de evaluación independientes.
- Coste computacional: el ensemble ejecuta cinco inferencias por entrada, lo que multiplica por cinco el coste y la latencia respecto a un único clasificador BERT base.
- Licencia: MIT y el backbone también MIT, lo que en principio permite uso comercial; no obstante, la responsabilidad legal y ética sobre las decisiones de moderación automatizadas recae en el integrador, no en el autor del modelo.
- No está pensado para producir explicaciones: únicamente devuelve etiqueta, probabilidad e indicadores de preprocesamiento, sin justificación del veredicto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thraaxxxx/radarodio-v01-binary-ensemble
- Modelo base (backbone): https://huggingface.co/pablocosta/bertabaporu-base-uncased
- No se han encontrado otros enlaces relevantes (papers, blogs, repositorios o demos) en la búsqueda web; los resultados devueltos correspondían a foros de un videojuego y no guardan relación con este modelo.
