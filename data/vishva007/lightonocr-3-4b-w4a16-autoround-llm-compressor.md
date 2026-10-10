# Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-LLM-Compressor

## Resumen

LightOnOCR-3-4B-W4A16-AutoRound-LLM-Compressor es una versión cuantizada a INT4 del modelo `lightonai/LightOnOCR-3-4B`, publicada por el usuario Vishva007. Se trata de un modelo visión-lenguaje (image-text-to-text) de 4.539.265.536 parámetros construido sobre la arquitectura Qwen3.5 y orientado específicamente a transcripción de documentos, comprensión de maquetación, *visual grounding* y extracción estructurada de tablas y formularios. La cuantización se ha realizado con Intel AutoRound en esquema W4A16 y se ha empaquetado en formato *compressed-tensors* para su uso con vLLM.

El interés de esta ficha radica en que no se trata de un modelo nuevo, sino de una variante de despliegue: el objetivo es reducir los requisitos de memoria del modelo base manteniendo la fidelidad en tareas OCR, que son especialmente sensibles a la degradación por cuantización agresiva. Para ello, el autor preserva la torre de visión y el proyector multimodal en BF16 (`quant_nontext_module=False`) y solo cuantiza el componente de lenguaje.

El modelo se distribuye bajo licencia Apache 2.0 y está pensado para pipelines de digitalización documental, extracción de datos de facturas, formularios y tablas, y anotación con *bounding boxes*. Es relevante ahora porque ofrece una vía de despliegue en GPUs de gama media sin renunciar a la precisión del modelo original, aunque el repositorio no reporta métricas de evaluación propias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer basado en Qwen3.5 (modelo visión-lenguaje extremo a extremo) |
| Parámetros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la información disponible; la configuración de despliegue recomendada en vLLM usa `--max-model-len 8192` |
| Tipos de cuantización | W4A16 (pesos INT4, activaciones BF16), grupo de tamaño 32, simétrico, 1200 iteraciones, 512 muestras de calibración con `seqlen=4096`. Torre de visión y proyector multimodal en BF16. Variantes hermanas en AutoRound nativo y GPTQ/Marlin |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors en formato *compressed-tensors* (LLM Compressor); variantes hermanas en AutoRound nativo y GPTQ/Marlin |

## Arquitectura y entrenamiento

La arquitectura es un modelo visión-lenguaje extremo a extremo basado en Qwen3.5, que combina una torre de visión con un proyector multimodal y un *backbone* de lenguaje. El modelo base `lightonai/LightOnOCR-3-4B` está especializado en transcripción de documentos, comprensión de maquetación, *visual grounding* y extracción estructurada de figuras. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO: esos datos no están disponibles en la información proporcionada.

La innovación técnica de esta variante concreta es el proceso de cuantización con Intel AutoRound, no el entrenamiento. Se aplica un esquema W4A16 con grupo de 32 y simetría, optimizado durante 1200 iteraciones sobre 512 muestras de calibración con longitud de secuencia 4096. El detalle crítico es que la torre de visión y el proyector multimodal se mantienen en BF16, evitando así la degradación de la precisión en OCR y *grounding* que normalmente provoca la cuantización de módulos no textuales. El modelo opera en dos modos: transcripción plana (`prompt = ""`), que devuelve texto en formato Markdown sin cajas, y modo *grounding* (`prompt = "grounding"`), que emite *bounding boxes* normalizados en el rango [0, 1000] junto con etiquetas semánticas como `text`, `title`, `table`, `image` o `chart`. El autor indica que el modelo está optimizado con el modo de razonamiento desactivado (`enable_thinking=False`).

## Capacidades

- Transcripción de texto a Markdown preservando la maquetación del documento.
- *Visual grounding*: emisión de *bounding boxes* normalizados en [0, 1000] con etiquetas semánticas por componente (`text`, `title`, `table`, `image`, `chart`, entre otras).
- Comprensión de documentos: interpretación de la estructura y jerarquía de la página.
- Extracción estructurada de tablas y formularios.
- Extracción estructurada de figuras y gráficos.
- Procesamiento de imágenes y PDF renderizados como entrada (`image-text-to-text`).
- Modo conversacional (etiqueta `conversational` en el repositorio).
- Cuantización INT4 con preservación de la torre de visión para no degradar OCR ni *grounding*.
- No hay información disponible sobre soporte de *tool calling*, *function calling*, agentes, razonamiento multi-paso, capacidades multilingües ni entradas de audio.

## Casos de uso

- Digitalización masiva de archivos PDF: el modelo transcribe documentos escaneados a Markdown conservando la estructura, lo que permite indexar el contenido en buscadores o bases documentales sin post-procesado manual de la maquetación.
- Extracción de datos de facturas y recibos: con el modo *grounding* se pueden localizar campos concretos (importes, fechas, emisores) mediante *bounding boxes* y etiquetas semánticas, integrándolo en un pipeline de contabilidad automatizada.
- Procesamiento de formularios administrativos: la combinación de transcripción y etiquetado por regiones permite mapear cada campo del formulario a un esquema de datos estructurado.
- Reconstrucción de tablas en informes financieros: el etiquetado de componentes `table` y `chart` facilita separar tablas de gráficos y reconstruir su contenido en formatos tabulares.
- Anotación automática de datasets OCR: el modo *grounding* genera etiquetas de maquetación que pueden usarse como preanotación para entrenar o validar otros modelos de documento.
- Accesibilidad documental: conversión de documentos escaneados a texto estructurado y navegable para lectores de pantalla o sistemas de síntesis de voz.
- Digitalización de documentación técnica con diagramas: la distinción entre `text`, `image` y `chart` permite conservar la relación entre explicaciones y figuras.
- Despliegue en servicios de alto rendimiento: al estar en formato *compressed-tensors*, se puede servir con vLLM para atender cargas concurrentes de digitalización por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tablas comparativas de MMLU, HumanEval, GSM8K, OmniDocBench ni de métricas específicas de OCR como CER o WER, ni para esta variante cuantizada ni para el modelo base.

## Requisitos de hardware

Las cifras de esta sección son estimaciones derivadas del tamaño del modelo y del esquema de cuantización; no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia: aproximadamente 5-8 GB en función del tamaño de lote y de la longitud de secuencia, partiendo de un repositorio de 4,0 GB y de un esquema W4A16 con torre de visión en BF16.
- GPU recomendadas: NVIDIA L4, A10G, RTX 4090, RTX 4080, RTX 4070, RTX 3090 y RTX 3060 de 12 GB. Para lotes grandes o secuencias de 8192 tokens conviene disponer de 16 GB o más.
- Cabe en GPU de consumo: sí, siempre que se disponga de al menos 8 GB de VRAM; una RTX 3060 de 12 GB o una RTX 4070 son suficientes para inferencia con lote pequeño.
- Opciones de despliegue: vLLM (recomendado por el autor para esta variante, con `--dtype bfloat16 --max-model-len 8192 --default-chat-template-kwargs '{"enable_thinking": false}'`), Transformers (`AutoModelForImageTextToText`, requiere `transformers>=5.5.4`), y las variantes hermanas en GPTQ/Marlin para otros *backends*. No se menciona soporte de llama.cpp ni de Ollama.
- Latencia y throughput estimados: no disponible.

Preprocesado recomendado por el autor: renderizar documentos escaneados y PDF a 400 DPI con una dimensión mayor objetivo de 2048 píxeles, manteniendo la relación de aspecto nativa sin estirar la imagen, ya que la precisión de las coordenadas de las *bounding boxes* depende de la integridad geométrica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-LLM-Compressor | 4,54 mil millones | No especificado (config. de despliegue 8192) | Safetensors, compressed-tensors, W4A16 | Apache 2.0 | HuggingFace, 0 descargas |
| lightonai/LightOnOCR-3-4B (modelo base) | 4,54 mil millones | No disponible | Safetensors, BF16 | Apache 2.0 | HuggingFace |
| Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ | No disponible | No disponible | AutoGPTQ / Marlin, W4A16 | Apache 2.0 | HuggingFace |
| Vishva007/LightOnOCR-3-4B-W4A16-AutoRound | No disponible | No disponible | AutoRound nativo, W4A16 | Apache 2.0 | HuggingFace |

No se dispone en la información proporcionada de datos de otros modelos de OCR de la competencia (por ejemplo, alternativas de otros fabricantes) que permitan una comparación de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se han publicado métricas de evaluación para esta variante cuantizada, por lo que no hay evidencia pública de que la precisión se mantenga respecto al modelo base en BF16.
- La cuantización INT4 puede degradar tareas sensibles a pequeños cambios numéricos; el autor mitiga parcialmente el riesgo manteniendo la torre de visión y el proyector en BF16, pero no cuantifica el impacto real.
- Riesgo de alucinación inherente a los modelos visión-lenguaje: puede generar texto plausible que no aparece en el documento, especialmente en imágenes de baja calidad o con tipografías inusuales.
- El modelo está optimizado con el razonamiento desactivado (`enable_thinking=False`); activarlo puede producir resultados no previstos.
- La calidad de las *bounding boxes* depende críticamente del preprocesado: se debe mantener la relación de aspecto y renderizar a 400 DPI con 2048 píxeles en la dimensión mayor. Estirar o redimensionar incorrectamente degrada la precisión geométrica.
- No hay información disponible sobre sesgos conocidos, cobertura de idiomas ni rendimiento fuera del dominio documental.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, siempre que se conserve el aviso de licencia y se indique los cambios. No se han identificado restricciones adicionales.
- El repositorio tiene 0 descargas y 0 *likes* y fue creado en octubre de 2026; es un artefacto reciente y sin validación por parte de la comunidad.
- Requiere `transformers>=5.5.4` y, para vLLM, `--trust-remote-code`, lo que implica ejecutar código no auditado.
- La model card incluye enlaces de afiliado a RunPod, lo que conviene tener en cuenta al valorar las recomendaciones de infraestructura.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-4B
- Variante AutoRound nativa: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound
- Variante AutoGPTQ / Marlin: https://huggingface.co/Vishva007/LightOnOCR-3-4B-W4A16-AutoRound-GPTQ
- Intel AutoRound (repositorio): https://github.com/intel/auto-round
- Paper de AutoRound (arXiv:2309.05516): https://arxiv.org/abs/2309.05516
- Paper referenciado en las etiquetas del repositorio (arXiv:2601.14251): https://arxiv.org/abs/2601.14251
- Imagen de ejemplo SROIE receipt: https://huggingface.co/datasets/hf-internal-testing/fixtures_ocr/resolve/main/SROIE-receipt.jpeg

Nota: los resultados de la búsqueda web proporcionados no contienen información relevante sobre este modelo ni sobre OCR, por lo que no se han incorporado enlaces adicionales.
