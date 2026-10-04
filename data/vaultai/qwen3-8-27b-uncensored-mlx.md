# vaultai/Qwen3.8-27B-Uncensored-MLX

## Resumen

Qwen3.8-27B-Uncensored-MLX es una compilación en formato MLX del modelo Qwen/Qwen3.8-27B, publicada por el usuario vaultai (vinculado al enrutador OrcaRouter), en la que se ha aplicado una técnica de *abliteration* para eliminar la dirección de rechazo del *residual stream* y, con ello, la mayor parte de la alineación de seguridad del modelo original. El resultado es un modelo de 27,36 mil millones de parámetros de tipo denso, con atención híbrida (Gated DeltaNet lineal combinada con atención completa), capacidades nativas de visión-lenguaje, control de modo *thinking*, *tool calling* y una cabeza MTP (multi-token prediction).

La relevancia de esta ficha no está en su rendimiento, sino en su naturaleza: se distribuye explícitamente como herramienta de investigación en seguridad de IA, interpretabilidad y *red-teaming*, y no como modelo listo para producción. La supresión de los mecanismos de rechazo implica que el modelo aceptará peticiones dañinas o ilegales que el modelo base rechazaría, por lo que el propio autor lo desaconseja para cualquier despliegue orientado a usuarios finales sin capas de moderación externas.

Está cuantizado en cuatro precisiones (2, 4, 6 y 8 bits, con *group size* 64), cada una en una subcarpeta del repositorio, con la variante de 4 bits replicada en la raíz para su carga directa en herramientas como LM Studio. La torre de visión, las capas de normalización y las convoluciones se mantienen en BF16; solo los pesos lineales del modelo de lenguaje se cuantizan. El contexto declarado es de 262K tokens y la licencia heredada es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet lineal + atención completa), vision-language nativo y cabeza MTP |
| Parametros totales | 27.356.728.560 (27,36 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (262.144) |
| Tipos de cuantizacion | 2, 4, 6 y 8 bits (afín, group size 64); torre de visión, norms y convoluciones en BF16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato MLX (librería `mlx`), con variantes por precisión en subcarpetas |
| Tamano del repositorio | 16,1 GB (metadatos de HuggingFace); las variantes individuales van de ~8,7 GB (2 bits) a ~27,5 GB (8 bits) |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized y abliterated) |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, del que deriva esta compilación, es un transformer denso de 27B parámetros que sustituye parte de las capas de atención completa por capas de atención lineal basadas en Gated DeltaNet. Esta combinación híbrida busca reducir el coste computacional del contexto largo manteniendo la calidad de recuperación de información en ventanas extensas, lo que explica la ventana declarada de 262K tokens. Incluye además una cabeza MTP (multi-token prediction), pensada para acelerar la decodificación al predecir varios tokens por paso, y una torre de visión que lo convierte en un modelo image-text-to-text nativo.

Sobre esa base, el autor aplica *abliteration*: una transformación que ortogonaliza la dirección de rechazo estimada en el *residual stream* y elimina así la tendencia del modelo a negarse a cumplir ciertas peticiones. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La cuantización se realiza en formato MLX con cuantización afín de *group size* 64, aplicada únicamente a los pesos lineales del modelo de lenguaje (incluidos `embed_tokens` y `lm_head`), mientras que la torre de visión, las normalizaciones y las convoluciones permanecen en BF16 para preservar la calidad multimodal.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con control explícito del modo *thinking*.
- Comprensión de imágenes y texto (pipeline image-text-to-text), con torre de visión preservada en BF16.
- *Tool calling* y *function calling*, lo que permite integración con herramientas externas.
- Razonamiento agéntico multi-paso, favorecido por la ventana de 262K tokens.
- Capacidades de código y matemáticas (inferidas de la familia Qwen3.8, no verificadas en benchmarks publicados en esta ficha).
- Soporte multilingüe limitado a inglés y chino según los metadatos del modelo.
- Modo *uncensored* / sin rechazos: responde a peticiones que el modelo base rechazaría, lo que se presenta como capacidad, pero constituye el principal riesgo de la compilación.
- Decodificación acelerada mediante la cabeza MTP.

## Casos de uso

- *Red-teaming* de sistemas de moderación: se emplea como generador adversarial para producir intentos de *jailbreak* y contenido dañino en condiciones controladas, y así medir la robustez de filtros propios frente a un modelo sin rechazos.
- Investigación en interpretabilidad: estudiar qué cambia en las activaciones internas tras la *abliteration*, comparando con el modelo base Qwen3.8-27B para aislar la dirección de rechazo.
- Evaluación de mecanismos de rechazo: reproducir experimentos académicos sobre cómo y dónde se representa la negativa a cumplir una petición.
- Análisis de robustez multimodal: probar cómo el modelo responde a entradas de imagen-texto manipuladas, aprovechando que la torre de visión se mantiene en BF16.
- Pruebas de agentes autónomos sin *guardrails*: simular entornos agénticos con *tool calling* y contexto de 262K tokens para evaluar fallos en cadena antes de desplegar agentes reales.
- Evaluación comparativa de cuantizaciones: medir la degradación de calidad entre las variantes de 2, 4, 6 y 8 bits sobre tareas controladas, útil para calibrar el impacto de la compresión extrema en modelos de 27B.
- Auditoría de sesgos y alucinaciones: al no filtrar respuestas, permite exponer de forma más directa sesgos y afirmaciones falsas que en modelos alineados, dentro de un entorno de laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, MMMU ni de ningún otro conjunto de evaluación, ni comparaciones numéricas con el modelo base o con alternativas.

## Requisitos de hardware

- Orientado a Apple Silicon (formato MLX); no está pensado para GPUs NVIDIA en su formato nativo.
- VRAM/RAM unificada mínima estimada por cuantización, según los datos del autor:
  - 8 bits (~27,5 GB, 6 *shards*): mínimo 32 GB de RAM unificada.
  - 6 bits (~22 GB, 5 *shards*): 24–32 GB de RAM unificada.
  - 4 bits (~15 GB, 3 *shards*): 24 GB de RAM unificada (variante recomendada por defecto; replicada en la raíz del repositorio).
  - 2 bits (~8,7 GB, 2 *shards*): 16 GB de RAM unificada, pero con calidad severamente degradada.
- Equipos compatibles: Mac con chip de la familia M (M1/M2/M3/M4) con memoria unificada suficiente; los modelos de 32 GB o más pueden alojar la variante de 8 bits.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX, LM Studio (carga directa desde la raíz del repositorio en su variante de 4 bits), y el servicio API del autor en OrcaRouter.
- Latencia y *throughput*: no disponibles en la información proporcionada.
- La cabeza MTP puede aportar aceleración en decodificación, pero no se ofrecen cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Alineacion de seguridad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| vaultai/Qwen3.8-27B-Uncensored-MLX | 27,36B denso | 262K | Si (BF16) | Eliminada (*abliterated*) | Apache 2.0 | MLX para Apple Silicon |
| Qwen/Qwen3.8-27B (base) | 27,36B denso | 262K | Si | Alineado | Apache 2.0 | Pesos originales, no disponible el detalle en esta informacion |
| Otras variantes *abliterated* de la familia Qwen3.8 | no disponible | no disponible | no disponible | Eliminada | Apache 2.0 (heredada) | no disponible |
| Modelos MLX comparables de ~27B con vision | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite una comparación fiable con el modelo base Qwen/Qwen3.8-27B. Para cualquier alternativa adicional, los datos no están disponibles en esta ficha.

## Limitaciones y advertencias

- Contenido dañino bajo demanda: el modelo generará instrucciones para *malware*, explotación de vulnerabilidades, armas, fraude y otras actividades ilegales o peligrosas si se le solicita.
- Ausencia total de rechazos: las pruebas de *jailbreak* y de seguridad "pasan" de forma trivial, por lo que no deben interpretarse como evaluaciones de seguridad superadas.
- Afirmaciones falsas con tono autoritario: puede producir texto falso, difamatorio, sesgado u ofensivo presentándolo como cierto; el riesgo de alucinación no está mitigado.
- Superficie de ataque ampliada: al conservar visión, *tool calling* y contexto de 262K, los riesgos se extienden al análisis de imágenes y al uso agéntico autónomo.
- Ruido de cuantización: las variantes de baja precisión, en especial la de 2 bits, añaden inestabilidad (bucles de repetición y salidas corruptas); el autor la marca como "archival only" y desaconseja su uso real.
- Sesgos conocidos: la información disponible no detalla sesgos específicos más allá de la advertencia genérica de sesgo y contenido ofensivo.
- Limitación de idioma: solo inglés y chino según los metadatos; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero el uso debe respetar la legislación aplicable y el propio autor declara fuera de alcance cualquier despliegue a usuarios finales o a menores sin capas de moderación propias.
- Responsabilidad: los autores y el *uploader* declinan toda responsabilidad por el mal uso; el usuario asume la totalidad de la responsabilidad y la liability.
- Uso previsto: exclusivamente investigación en seguridad de IA, interpretabilidad y *red-teaming* en entornos controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vaultai/Qwen3.8-27B-Uncensored-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- OrcaRouter (sitio principal): https://www.orcarouter.ai
- Catálogo de modelos de OrcaRouter: https://www.orcarouter.ai/models
- Ficha/API del modelo en OrcaRouter: https://www.orcarouter.ai/models/qwen/qwen3.8-27b
- GitHub de Continuum AI Corp: https://github.com/Continuum-AI-Corp
- Discord: https://discord.gg/yAh6Tex6kx
- X (Twitter) de OrcaRouter: https://x.com/OrcaRouter
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
