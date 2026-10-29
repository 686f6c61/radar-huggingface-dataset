# VideoVPR/Qwen3-VL-8B-VideoPRM-CanonicalV4-SFT6400

## Resumen

Qwen3-VL-8B-VideoPRM-CanonicalV4-SFT6400 es un ajuste fino supervisado (SFT) completo del modelo multimodal Qwen/Qwen3-VL-8B-Instruct, publicado por el usuario VideoVPR dentro de una comparativa interna denominada VideoPRM Canonical V4. No se distribuye como adaptador LoRA, sino como checkpoint fusionado en BF16 listo para cargar con Transformers, entrenado sobre la totalidad de 6.400 ejemplos de SFT. Su función dentro del proyecto es servir de control de referencia ("full-data SFT control") frente a los adaptadores GRPO evaluados por separado.

El modelo hereda del base Qwen3-VL-8B-Instruct la arquitectura vision-language de la familia Qwen3-VL (transformer denso, sin mezcla de expertos) y una orientación clara hacia la comprensión de vídeo: la evaluación externa asociada al proyecto fija exactamente 24 fotogramas muestreados de forma uniforme, marcas de tiempo originales, decodificación greedy en BF16 y semilla 20261005. Ese protocolo sugiere que el ajuste está pensado para tareas de razonamiento y verificación sobre vídeo (VideoPRM), más que para conversación general.

Es relevante ahora por dos motivos: primero, porque aplica SFT a un modelo de 8.767 millones de parámetros con licencia Apache-2.0, lo que permite uso comercial sin fricciones; segundo, porque la model card documenta explícitamente la procedencia e integridad de los pesos (manifiesto con SHA256, inventario congelado de evaluación) y advierte de que este checkpoint no debe usarse como base de los adaptadores GRPO, que parten del modelo de calentamiento SFT800. Con 0 descargas y 0 likes en el momento de la consulta, se trata de un artefacto de investigación, no de un modelo validado por la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (Qwen3-VL, denso) para image-text-to-text; clase `Qwen3VLForConditionalGeneration` |
| Parametros totales | 8.767.123.696 (8,77 B), según safetensors |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en las fuentes consultadas; la familia Qwen3-VL declara contexto extendido sin cifra concreta en dichas fuentes |
| Tipos de cuantizacion | No disponible para este checkpoint; los pesos se publican en BF16. La conversión a GGUF, AWQ o GPTQ requeriría un proceso externo |
| Idiomas soportados | No disponible (la model card no documenta cobertura lingüística) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en BF16, 4 shards más índice; incluye `MODEL_MANIFEST.json` y `SHA256SUMS` |
| Pipeline declarado | image-text-to-text |
| Modelo base | Qwen/Qwen3-VL-8B-Instruct, revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b` |
| Tipo de ajuste | SFT completo (no LoRA), 6.400 ejemplos |
| Tamaño del repositorio | 17,5 GB |
| Entorno probado | Transformers 4.57.6, PyTorch 2.8.0 |

## Arquitectura y entrenamiento

El checkpoint es un Qwen3-VL denso de 8,77 B de parámetros orientado a entrada imagen/vídeo y salida de texto. La familia Qwen3-VL emplea un codificador visual acoplado a un modelo de lenguaje transformer, con soporte para percepción visual profunda, razonamiento sobre relaciones espaciales y comprensión de dinámica temporal en vídeo, además de interacción con agentes. Al ser un modelo denso, todos los parámetros se activan en cada pasada, lo que simplifica el despliegue pero encarece la inferencia frente a variantes MoE de la misma familia.

Sobre el entrenamiento, la información disponible es deliberadamente escasa: se sabe que es un SFT supervisado con 6.400 ejemplos, que existe una etapa previa de calentamiento con 800 ejemplos (SFT800) cuyos pesos fusionados sirven de inicialización a los adaptadores GRPO, y que los datos de entrenamiento y los objetivos de verificación ocultos no se redistribuyen. No se documentan el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. La model card sí detalla el protocolo de evaluación externa (24 fotogramas uniformes, timestamps originales, decodificación greedy BF16, semilla 20261005, presupuestos de salida por tarea y reintentos ante truncamiento), lo que constituye la innovación metodológica más relevante del artefacto: la reproducibilidad del pipeline de medida más que la del entrenamiento.

## Capacidades

- Comprensión de vídeo con muestreo fijo de fotogramas (24 en el protocolo de evaluación) y uso de marcas de tiempo originales del vídeo.
- Generación de texto conversacional a partir de entradas de imagen o vídeo, en formato image-text-to-text.
- Razonamiento visual y respuesta a preguntas sobre contenido audiovisual, incluyendo dinámica temporal y relaciones espaciales heredadas del base Qwen3-VL.
- Función de modelo de recompensa de proceso para vídeo (VideoPRM): el nombre y el contexto del proyecto apuntan a la verificación de cadenas de razonamiento paso a paso, aunque la model card no documenta el formato exacto de recompensa.
- Capacidades de agente e interacción multi-turno heredadas del modelo base, según la documentación de Qwen3-VL.
- Soporte de tool calling / function calling: no documentado explícitamente para este checkpoint (el base Qwen3-VL lo declara).
- Capacidades multilingües: no documentadas en la model card; se desconoce si el SFT degradó o preservó el perfil idiomático del base.
- Modo "thinking" o decodificación extendida: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de cadenas de razonamiento sobre vídeo: usar el modelo como verificador de pasos intermedios en tareas de VideoQA, puntuando la coherencia de cada razonamiento respecto a los fotogramas y timestamps, gracias a su entrenamiento como VideoPRM.
- Control experimental en investigación de RL: emplearlo como línea base SFT completa frente a adaptadores GRPO, tal como propone el propio proyecto, para aislar el efecto del refuerzo sobre la inicialización SFT800.
- Anotación asistida de datasets de vídeo: generar descripciones, respuestas y justificaciones temporales sobre clips muestreados a 24 fotogramas para preetiquetar corpus antes de revisión humana.
- Análisis de vídeo industrial o de vigilancia: inspección de secuencias con marcas de tiempo para detectar eventos y describir su evolución, aprovechando la percepción espacial y temporal del modelo base.
- Verificación de contenido docente en plataformas educativas: comprobar si una explicación textual es coherente con lo que ocurre en un vídeo de clase, a partir de fotogramas uniformemente muestreados.
- Moderación y auditoría de vídeo: clasificación y justificación textual de segmentos problemáticos, con la ventaja de una licencia Apache-2.0 que permite integrarlo en productos comerciales.
- Investigación en modelos de recompensa multimodales: experimentar con el formato de salida y el presupuesto de tokens por tarea definidos en el pipeline de evaluación externa para replicar resultados.
- Generación de descripciones accesibles: producir texto alternativo y resúmenes temporales de clips para servicios de accesibilidad, con la cautela de que no hay evaluación de calidad publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reporta puntuaciones del protocolo fijo de 24 fotogramas sin verificar, y remite al pipeline externo del repositorio de GitHub para obtenerlas. No se debe asumir ningún valor de MMLU, HumanEval, GSM8K ni de benchmarks de vídeo para este checkpoint.

## Requisitos de hardware

- VRAM estimada en BF16: en torno a 17,5 GB solo para pesos, más caché KV y activaciones; un presupuesto práctico de 22-26 GB para contextos moderados.
- GPU profesionales: A100 (40 u 80 GB), H100, L40S (48 GB) y A6000 (48 GB) cubren el modelo en BF16 con margen.
- GPU de consumo: una RTX 4090 (24 GB) puede alojarlo en BF16 con secuencias cortas y batch 1, con riesgo de OOM al crecer el contexto o el número de fotogramas. Tarjetas de 16 GB requieren cuantización.
- Cuantización: no se publican pesos cuantizados para este checkpoint. Una conversión a 8 bits dejaría los pesos en torno a 9 GB y a 4 bits en torno a 5 GB, pero exigiría validar la fidelidad del ajuste SFT tras la compresión.
- Despliegue: la vía probada es Transformers 4.57.6 con PyTorch 2.8.0 y `device_map="auto"`. vLLM, TGI, llama.cpp u Ollama requerirían comprobar compatibilidad con la arquitectura Qwen3-VL; Ollama dispone de la variante base `qwen3-vl:8b`, no de este ajuste.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el coste dominante en vídeo es el número de fotogramas procesados por el codificador visual (24 en el protocolo oficial), no la longitud del prompt textual.
- Almacenamiento: 17,5 GB de repositorio; conviene fijar el commit para reproducibilidad, ya que la model card lo recomienda expresamente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3-VL-8B-VideoPRM-CanonicalV4-SFT6400 | 8,77 B (denso) | no disponible | Apache-2.0 | Hugging Face, 0 descargas | SFT de 6.400 ejemplos sobre Qwen3-VL-8B-Instruct; sin benchmarks publicados |
| Qwen/Qwen3-VL-8B-Instruct | ~8 B (denso) | no disponible en las fuentes | Apache-2.0 | Hugging Face, ampliamente distribuido | Modelo base; incluye variantes GGUF vía Ollama y soporte en Jetson AI Lab |
| Qwen2.5-VL-7B-Instruct | ~7 B (denso) | no disponible en las fuentes | Apache-2.0 | Hugging Face | Generación anterior de la familia; sin evaluación comparativa directa en las fuentes |
| InternVL3-8B | ~8 B (denso) | no disponible | no verificada en las fuentes | Hugging Face | Alternativa multimodal de tamaño similar; datos de licencia y contexto no confirmados aquí |

La comparación cuantitativa de rendimiento no es posible: este checkpoint no publica métricas y las fuentes consultadas tampoco aportan cifras de los alternativas. La diferencia práctica frente al base Qwen3-VL-8B-Instruct no es de capacidades generales, sino de especialización en verificación de razonamiento sobre vídeo y de trazabilidad de artefactos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: la propia model card declina reportar puntuaciones del protocolo fijo de 24 fotogramas, por lo que no hay evidencia cuantitativa de mejora frente al base.
- Artefacto de investigación con 0 descargas y 0 likes: no ha pasado por validación de la comunidad ni por auditorías independientes.
- Riesgo de alucinación inherente a los modelos vision-language, especialmente al describir eventos no visibles en los fotogramas muestreados o al inferir acciones entre fotogramas.
- El muestreo de 24 fotogramas puede perder eventos breves; el rendimiento fuera de ese protocolo (otro número de fotogramas, otra resolución, otro presupuesto de tokens) no está caracterizado.
- Idiomas no documentados: se desconoce si el SFT sobre datos presumiblemente en inglés degradó el multilingüismo del base.
- Datos de entrenamiento no redistribuidos ni descritos: no se puede evaluar la composición del dataset, el sesgo inducido ni la contaminación respecto a benchmarks.
- Restricción de uso como base: la model card advierte explícitamente de que este SFT6400 no debe sustituir al SFT800 como inicialización de los adaptadores GRPO.
- Licencia Apache-2.0 heredada del base, que permite uso comercial; conviene conservar los avisos de atribución y verificar que los datos de entrenamiento no impongan restricciones adicionales no documentadas.
- Entorno sensible a versiones: probado solo con Transformers 4.57.6 y PyTorch 2.8.0; fijar el commit del repositorio es necesario para reproducir la evaluación.
- No se documentan medidas de seguridad, alineación ni filtros de contenido; en producción habría que añadir capas propias de moderación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VideoVPR/Qwen3-VL-8B-VideoPRM-CanonicalV4-SFT6400
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct (revisión `0c351dd01ed87e9c1b53cbc748cba10e6187ff3b`)
- Pipeline de evaluación externa de VideoPRM: https://github.com/Yiling-Ma/VideoPRM-RL-H200-Handoff/tree/main/external_benchmarks
- Repositorio oficial de Qwen3-VL: https://github.com/QwenLM/Qwen3-VL
- Colección Qwen3-VL en Hugging Face: https://huggingface.co/collections/Qwen/qwen3-vl
- Variante base en Ollama: https://ollama.com/library/qwen3-vl:8b
- Ficha de Qwen3-VL-8B en Jetson AI Lab: https://www.jetson-ai-lab.com/models/qwen3-vl-8b/
