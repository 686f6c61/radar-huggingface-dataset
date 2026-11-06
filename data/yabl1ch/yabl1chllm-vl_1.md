# Yabl1ch/Yabl1chLLM-VL_1

## Resumen

Yabl1chLLM-VL_1 es un modelo multimodal de tipo vision-language desarrollado por Yabl1ch AI Lab (Maksim "Yabl1ch") y entrenado desde cero, según declara el autor, sin partir de un modelo base preentrenado. El modelo se distribuye exclusivamente en formato GGUF y está pensado para inferencia local en LM Studio y llama.cpp, con un enfoque explícito en hardware modesto: la model card cita velocidades de más de 20 tokens por segundo en GPUs del nivel de una GTX 960 con 4 GB de VRAM.

El repositorio contiene dos artefactos: los pesos cuantizados del modelo de lenguaje (~1,80 GB) y un proyector multimodal en precisión f16 (~1,25 GB) que habilita la entrada de imagen. El pipeline declarado en Hugging Face es image-text-to-text, con soporte de ruso e inglés y licencia Apache 2.0.

Con 3.085.938.688 parámetros totales según los safetensors del repo, se trata de un modelo de escala pequeña (rango 3B) que prioriza el despliegue en local y la multimodalidad ligera frente a los grandes modelos frontier. Es relevante para quienes necesitan un VLM ejecutable en equipos de consumo y con licencia permisiva, aunque su ecosistema, documentación y validación empírica son todavía muy limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + proyector de visión); detalles internos no disponibles |
| Parametros totales | 3.085.938.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 16.384 tokens (16K+ según la model card) |
| Tipos de cuantizacion | GGUF cuantizado (nivel exacto no especificado); proyector multimodal en f16 |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos del LLM ~1,80 GB y proyector mmproj f16 ~1,25 GB) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo fue entrenado desde cero por Yabl1ch AI Lab, sin especificar la arquitectura interna más allá de su naturaleza transformer multimodal. La estructura de despliegue separa el modelo de lenguaje (un único GGUF cuantizado) del proyector visual (mmproj-ggml-model-f16.gguf), un esquema habitual en la familia LLaVA y en implementaciones de llama.cpp para modelos vision-language.

No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni las técnicas de alineación empleadas. La model card sí recomienda el uso de decodificación especulativa con Qwen2.5-0.5B-Instruct en Q8_0 como modelo borrador, con 3 tokens de borrador, Flash Attention activado y temperatura entre 0,3 y 0,7. Esta recomendación sugiere compatibilidad con la infraestructura de decodificación especulativa de llama.cpp, aunque no implica parentesco arquitectónico con la familia Qwen.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Comprensión de imágenes y texto combinados (image-text-to-text) mediante el proyector multimodal.
- Diálogo multi-turno dentro de una ventana de hasta 16K tokens.
- Inferencia local optimizada para llama.cpp y LM Studio.
- Compatible con endpoints según el tag `endpoints_compatible` de Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes, matemáticas avanzadas ni modos de razonamiento explícito (thinking mode).
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Descripción y análisis de imágenes en local: el modelo puede recibir una imagen junto a una pregunta en ruso o inglés y generar una descripción o respuesta, adecuado para prototipos de accesibilidad o catalogación de imágenes en equipos sin GPU de gama alta.
- Asistente conversacional en ruso: con soporte nativo de ruso y una ventana de 16K tokens, encaja en chatbots de atención al usuario para ese idioma, un nicho con menos oferta de modelos ligeros.
- Procesamiento de documentos escaneados con preguntas: combinando OCR previo y el modelo para interpretar el texto y el layout de la imagen, útil en digitalización de archivos.
- Despliegue en hardware de consumo: con ~1,80 GB de pesos del LLM, puede ejecutarse en GPUs de 4 GB de VRAM como la GTX 960 citada por el autor, lo que lo hace viable en portátiles y equipos de escritorio modestos.
- Prototipado rápido de pipelines multimodales: al estar en GGUF, se integra en LM Studio y llama.cpp sin necesidad de infraestructura de servido GPU.
- Educación e investigación: modelo pequeño con licencia Apache 2.0 que permite experimentar con arquitecturas VLM y decodificación especulativa sin restricciones de uso comercial.
- Traducción asistida ruso-inglés en contextos con imagen: por ejemplo, traducir texto presente en capturas o fotografías.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta una estimación de velocidad (más de 20 tokens por segundo en GPUs del nivel de GTX 960 con 4 GB de VRAM), sin métricas de calidad como MMLU, HumanEval, GSM8K o evaluaciones multimodales tipo MMMU.

## Requisitos de hardware

- VRAM estimada: en torno a 2 GB para los pesos del LLM cuantizado y aproximadamente 1,25 GB adicionales para el proyector multimodal en f16; con overhead de contexto de 16K, se recomienda un mínimo de 4 GB de VRAM.
- GPU recomendadas: el autor cita GTX 960 (4 GB) como referencia mínima; cualquier GPU con 6-8 GB o más (RTX 3060, RTX 4060, RTX 4090, A100, H100) ofrecerá mayor margen y velocidad.
- Cabe en GPU de consumo: sí, en tarjetas de 4 GB en adelante según la propia model card.
- Opciones de despliegue: llama.cpp y LM Studio (soportados de forma explícita); compatible con decodificación especulativa usando Qwen2.5-0.5B-Instruct Q8_0 como borrador. No se documenta soporte verificado en vLLM ni TGI.
- Latencia y throughput: más de 20 tokens por segundo en GTX 960 según el autor; sin datos para otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Yabl1chLLM-VL_1 | 3,09B | 16K | Sí (imagen) | Apache 2.0 | GGUF en Hugging Face |
| Qwen2.5-VL-3B-Instruct | ~3B | 32K+ | Sí (imagen y vídeo) | Apache 2.0 | Safetensors y GGUF comunitario |
| LLaVA-OneVision-0.5B | ~0,5B | 32K | Sí (imagen) | Apache 2.0 | Safetensors y GGUF comunitario |
| SmolVLM-2B | ~2B | 8K | Sí (imagen) | Apache 2.0 | Safetensors y GGUF |

La comparación con Qwen2.5-VL-3B es la más directa por escala, pero no se dispone de datos de benchmarks de Yabl1chLLM-VL_1 que permitan contrastar calidad. La ventaja principal de Yabl1chLLM-VL_1 es su huella de memoria reducida y el soporte nativo de ruso; sus alternativas cuentan con documentación, evaluaciones públicas y comunidades mucho más amplias.

## Limitaciones y advertencias

- Modelo con cero descargas y cero likes en Hugging Face en el momento de la consulta: no hay validación independiente de su calidad ni de su funcionamiento real.
- Ausencia total de benchmarks: no es posible verificar las capacidades declaradas ni comparar con alternativas.
- Riesgo elevado de alucinación y de degradación en tareas de razonamiento complejo, dado el tamaño (3B) y la falta de datos de entrenamiento y alineación.
- Idiomas limitados a ruso e inglés; el rendimiento en castellano no está garantizado ni documentado.
- Ventana de contexto de 16K, inferior a la de modelos comparables de la misma escala.
- No se documentan salvaguardas, filtros de contenido ni evaluación de sesgos; el uso en producción requiere auditoría propia.
- La licencia Apache 2.0 permite uso comercial, pero al no existir evaluación de seguridad, el despliegue en entornos sensibles conlleva riesgo.
- El nombre del autor y la afirmación de entrenamiento desde cero no están respaldados por documentación técnica publicada (paper, blog o informe de entrenamiento).

## Enlaces

- Hugging Face: https://huggingface.co/Yabl1ch/Yabl1chLLM-VL_1
- Modelo borrador recomendado para decodificación especulativa: Qwen2.5-0.5B-Instruct-GGUF (disponible en Hugging Face, referencia citada en la model card)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
