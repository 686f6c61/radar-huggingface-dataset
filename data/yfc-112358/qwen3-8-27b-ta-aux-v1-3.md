# YFC-112358/Qwen3.8-27B-TA-Aux-v1-3

## Resumen

Qwen3.8-27B-TA-Aux-v1-3 es un modelo de 27.781.427.952 parámetros (unos 27,78 B) publicado por el usuario YFC-112358 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un ajuste fino convencional, sino del resultado de una fusión (merge) de pesos completos a partir de doce modelos padre declarados, entre ellos el ancla Qwen/Qwen3.8-27B y variantes comunitarias como DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, Jackrong/Qwopus3.8-27B-Flash-V2, migtissera/Synthia-4-27B o JetBrains/Qwen3.8-3.6-27B-blend. El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva la interfaz multimodal de entrada imagen + texto del modelo base.

La relevancia de esta ficha es acotada y conviene ser explícito: la model card del repositorio es mínima y advierte que el proceso de merge solo comprueba formas de tensores y valores finitos, pero no mide la calidad del resultado. La descripción pública de la variante hermana v1 en Featherless indica que estos checkpoints se conciben como un componente auxiliar de "condimento" (seasoning) para reforzar otros checkpoints más fuertes, y no como modelos para uso autónomo. Por tanto, estamos ante un artefacto de investigación sobre técnicas de fusión de modelos, no ante un modelo listo para producción.

El repositorio ocupa 55,6 GB en safetensors con la librería transformers, y no incluye resultados de benchmarks, licencia declarada ni lista de idiomas soportados. Cualquier evaluación de su comportamiento real exige ejecutarlo y validarlo por cuenta propia, además de revisar los términos de licencia de los doce modelos de origen antes de redistribuirlo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con capacidades multimodales (pipeline image-text-to-text); etiqueta de arquitectura del repositorio: qwen3_5 |
| Parametros totales | 27.781.427.952 (≈27,78 B) |
| Longitud de contexto | no disponible (no declarada en la información proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors. El tamaño de 55,6 GB para 27,78 B de parámetros es compatible con precisión bf16/fp16 (cálculo propio, no confirmado por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card remite a `source_licenses.json` y advierte de que la salida no hereda automáticamente solo la licencia del ancla) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

No hay información publicada sobre un proceso de entrenamiento: este repositorio no contiene un modelo entrenado con un dataset, sino el producto de una fusión de pesos. Según la model card, el merge se realizó sobre pesos completos y la receta exacta está documentada en el archivo `build_manifest.json`, junto con los commits de entrada. El huella de compilación declarada es `7c80800b30ea7c015b862a901e42606534965ac5ce61077b70dcbb59c472a432`. La información disponible sobre la variante hermana v1 (Featherless) describe el método como una fusión por aritmética de tareas (task arithmetic) con coeficientes explícitos en la receta de mezcla; no se confirma que v1-3 use exactamente los mismos coeficientes ni el mismo número de padres, ya que v1-3 declara doce modelos base frente a los seis que menciona esa descripción.

No se especifican tokens de entrenamiento, composición del dataset, ni fases de RLHF, DPO o instruct-tuning propias de este repositorio. Tampoco se declara ninguna innovación técnica adicional (decodificación especulativa, atención lineal, MoE u otras). La model card es explícita sobre el alcance de las comprobaciones: el proceso verifica formas de tensores y valores finitos, pero no mide la calidad del modelo resultante. Dado que el ancla es Qwen/Qwen3.8-27B, y que el repositorio oficial de Alibaba describe esa familia como un LLM denso nativo multimodal orientado a código, flujos agénticos y automatización de oficina, es razonable esperar que la arquitectura subyacente sea un transformer denso con torre de visión, pero esto es una inferencia a partir del modelo base y de la etiqueta `image-text-to-text`, no un dato confirmado para este merge.

## Capacidades

- Generación de texto conversacional: el repositorio incluye la etiqueta `conversational`, por lo que se espera formato de diálogo multi-turno.
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text`, lo que implica procesamiento de imágenes junto a texto. No se detalla la resolución, el número de imágenes por prompt ni el esquema de tokens visuales.
- Codificación, matemáticas y razonamiento: no verificados en este merge. El modelo base Qwen3.8-27B se presenta públicamente como orientado a código y flujos agénticos, pero el autor de este repositorio no aporta evaluaciones que confirmen que esas capacidades se conservan tras la fusión.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada para este checkpoint.
- Capacidades multilingües: no disponibles; no se publica lista de idiomas.
- Modo thinking o razonamiento extendido: no disponible.
- Entrada o salida de audio: no disponible.
- Uso como componente de merge: capacidad principal documentada. El modelo está pensado para actuar como componente auxiliar en fusiones sobre otros checkpoints.

## Casos de uso

- Receta de fusión de modelos: el uso documentado es emplear estos pesos como componente auxiliar ("seasoning") al fusionarlos con un checkpoint más fuerte mediante aritmética de tareas con coeficientes explícitos. Se usaría dentro de un pipeline de merge reproducible basado en `build_manifest.json`.
- Investigación en técnicas de merging: sirve como caso de estudio para comparar recetas de task arithmetic, evaluar el efecto de doce padres frente a seis y estudiar cómo se degradan o preservan capacidades tras la mezcla.
- Reproducción de experimentos: el repositorio incluye huella de compilación y manifiesto de construcción, lo que permite reproducir la mezcla y auditar exactamente qué tensores entraron en cada paso.
- Punto de partida para ajuste fino posterior: al ser pesos completos en transformers, puede cargarse con la librería estándar y aplicarse sobre él un SFT o un LoRA específico de dominio, partiendo de una base ya diversificada por la mezcla.
- Prototipado multimodal en laboratorio: con el pipeline image-text-to-text, puede emplearse en pruebas internas de descripción de imágenes o razonamiento sobre capturas, siempre con validación manual, dado que no hay evaluaciones publicadas.
- Evaluación comparativa de checkpoints: útil como referencia en baterías de evaluación internas para medir si una fusión aporta o degrada frente al ancla Qwen/Qwen3.8-27B.
- Despliegue en entornos de prueba conversacionales: la etiqueta `endpoints_compatible` sugiere compatibilidad con infraestructura de endpoints, lo que permite levantarlo en un sandbox para pruebas de integración, nunca como servicio en producción sin evaluación previa.
- Estudio de licencias y trazabilidad: el repositorio incluye `source_licenses.json`, lo que lo convierte en un caso práctico para analizar la cadena de licencias de un merge con doce modelos de origen, algunos de ellos etiquetados como "uncensored".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el proceso de fusión comprueba formas de tensores y valores finitos, pero no mide la calidad del modelo. No se dispone de datos de MMLU, HumanEval, GSM8K, MMMU ni de ninguna otra evaluación para este checkpoint, ni para las variantes v1 y v1-2 en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 55,6 GB solo para pesos, más caché KV y activaciones. Como referencia práctica, entre 64 y 80 GB en función de la longitud de contexto, que no está declarada.
- VRAM estimada en cuantización de 8 bits: del orden de 28-30 GB para pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: del orden de 14-17 GB para pesos, más caché KV.
- GPU recomendadas para precisión completa: A100 80 GB, H100 80 GB o H200. Una A100 40 GB no sería suficiente en bf16 sin particionado.
- GPU recomendadas para 8 bits: H100 80 GB, A100 80 GB, RTX 6000 Ada 48 GB o L40S 48 GB.
- Cabe en GPU de consumo: en 4 bits, sí en RTX 4090, RTX 3090 o RTX 4080 de 16 GB (esta última con contexto muy reducido). En bf16 no cabe en ninguna GPU de consumo actual; requeriría sharding en varias GPU.
- Opciones de despliegue: transformers de forma nativa (formato safetensors). vLLM y TGI son viables si la arquitectura `qwen3_5` está soportada por esas versiones. llama.cpp y Ollama requerirían convertir los pesos a GGUF, conversión que no se distribuye en el repositorio.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tokens por segundo, TTFT ni resultados de pruebas de carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| YFC-112358/Qwen3.8-27B-TA-Aux-v1-3 | 27,78 B | no disponible | safetensors | no disponible | Hugging Face, 0 descargas, 0 likes | Merge de 12 padres; pensado como componente auxiliar |
| Qwen/Qwen3.8-27B | no disponible (familia de 27 B) | no disponible | no disponible | no disponible | Repositorio oficial de Alibaba | Modelo denso nativo multimodal; ancla de esta fusión |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | no disponible | no disponible | no disponible | no disponible | Hugging Face | Uno de los padres del merge, etiquetado como uncensored |
| Jackrong/Qwopus3.8-27B-Flash-V2 | no disponible | no disponible | no disponible | no disponible | Hugging Face | Uno de los padres del merge |
| YFC-112358/Qwen3.8-27B-TA-Aux-v1 | 27 B (según descripción de terceros) | no disponible | no disponible | no disponible | Hugging Face y Featherless | Variante anterior; descrita como task arithmetic sobre seis padres |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada, por lo que la comparativa se limita a parámetros, formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Calidad no medida: la propia model card advierte que el proceso de merge verifica formas de tensores y valores finitos, pero no evalúa la calidad. No hay ninguna garantía de que las capacidades de los doce modelos padre se preserven o se combinen de forma útil.
- Modelo auxiliar, no autónomo: la descripción pública de la variante v1 lo define como un componente de "condimento" para otros checkpoints. Usarlo como modelo independiente en producción no es el propósito declarado.
- Licencia indeterminada: no se declara licencia para este repositorio y la model card indica que la salida no hereda automáticamente solo la licencia del ancla. Al haber doce modelos de origen, hay que revisar `source_licenses.json` y los términos de cada upstream antes de cualquier redistribución o uso comercial.
- Presencia de un padre etiquetado como "uncensored": entre los modelos base figura DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored. Esto implica un riesgo elevado de que el merge reproduzca contenido sin los filtros habituales de seguridad. Se requiere moderación externa si se expone a usuarios.
- Riesgo de alucinación: no cuantificado. No hay evaluaciones de fidelidad factual para este checkpoint.
- Idiomas no declarados: no se publica lista de idiomas soportados, por lo que no puede asumirse un rendimiento correcto en castellano ni en ningún otro idioma sin pruebas propias.
- Contexto desconocido: al no declararse la longitud de contexto, no es posible dimensionar la caché KV ni planificar cargas de trabajo con documentos largos.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta. No existe retroalimentación de terceros sobre su comportamiento real.
- Trazabilidad limitada de la receta: la model card remite a `build_manifest.json` para la receta exacta y a `source_licenses.json` para las licencias, pero no se detallan coeficientes ni pesos de mezcla en el texto de la ficha.
- Fechas del repositorio: creación y última actualización registradas el 2026-10-08. Las variantes v1 y v1-2 existen como publicaciones separadas, con posible solapamiento de contenido y confusión entre versiones.

## Enlaces

- Modelo en Hugging Face (v1-3): https://huggingface.co/YFC-112358/Qwen3.8-27B-TA-Aux-v1-3
- Variante anterior v1 en Hugging Face: https://huggingface.co/YFC-112358/Qwen3.8-27B-TA-Aux-v1
- Ficha de la variante v1-2 en Savrn: https://savrn.com/models/qwen3-8-27b-ta-aux-v1-2
- Ficha de la variante v1 en Featherless: https://featherless.ai/models/YFC-112358/Qwen3.8-27B-TA-Aux-v1
- Repositorio de la familia base Qwen3.8-27B (Alibaba Cloud): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Archivos internos del repositorio citados en la model card: `build_manifest.json` y `source_licenses.json`
