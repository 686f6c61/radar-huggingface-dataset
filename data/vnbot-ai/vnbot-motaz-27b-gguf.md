# vnbot-ai/VNBot-MotaZ-27B-GGUF

## Resumen

VNBot-MotaZ-27B-GGUF es la versión cuantizada en formato GGUF del modelo multimodal VNBot-MotaZ-27B, desarrollado por vnbot-ai (Origo Technologies). Se trata de un modelo de tipo image-text-to-text, es decir, acepta entradas conjuntas de imagen y texto y genera respuestas textuales, con soporte declarado para vietnamita e inglés. El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la franja de modelos medianos-grandes aptos para despliegue en una sola GPU de gama alta o en configuraciones multi-GPU.

La relevancia de esta publicación radica en que ofrece el modelo en múltiples niveles de cuantización (desde BF16 hasta Q2_K), lo que permite ajustar el consumo de memoria y la calidad según el hardware disponible. El repositorio incluye además el proyector multimodal (mmproj) necesario para el procesamiento de imágenes en llama.cpp. La licencia Apache-2.0 facilita su uso comercial y su integración en productos derivados.

No obstante, la información pública disponible es muy limitada: la model card es breve, está redactada principalmente en vietnamita y no detalla la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere una publicación muy reciente o de escasa difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; probablemente transformer con proyector visual, sin confirmar) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (valor usado en el ejemplo de ejecución de la model card; no confirmado como máximo oficial) |
| Tipos de cuantizacion | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | vietnamita (vi), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con fichero mmproj separado para el proyector multimodal) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base VNBot-MotaZ-27B. Por el pipeline declarado (image-text-to-text) y la presencia de un fichero mmproj, se deduce que se trata de un modelo de lenguaje transformer acoplado a un codificador visual mediante un proyector multimodal, siguiendo el esquema habitual en modelos como LLaVA o Qwen-VL. Sin embargo, el autor no especifica el codificador visual empleado, la naturaleza del proyector ni la arquitectura exacta del backbone lingüístico.

Tampoco se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. La model card únicamente indica que se trata del asistente de IA de Origo Technologies con soporte para texto e imágenes en vietnamita e inglés. Los tags del repositorio incluyen "imatrix", lo que sugiere que las cuantizaciones se generaron usando matrices de importancia (importance matrix) para preservar la calidad en niveles bajos de bits.

## Capacidades

- Generación de texto conversacional en vietnamita e inglés.
- Comprensión de imágenes combinadas con texto (image-text-to-text), incluyendo preguntas sobre el contenido visual.
- Procesamiento de contexto de hasta 32.768 tokens según el ejemplo de ejecución proporcionado.
- Compatibilidad con el flag `--jinja` de llama.cpp, lo que habilita el uso de plantillas de chat y potencialmente tool calling si la plantilla lo define.
- Uso como asistente conversacional general (tag "conversational").
- Despliegue mediante endpoints compatibles (tag "endpoints_compatible").

## Casos de uso

- Asistente conversacional en vietnamita para atención al cliente: el modelo puede gestionar diálogos multi-turno con un contexto de hasta 32.768 tokens, adecuado para sesiones de soporte con historial extenso, y su soporte nativo del vietnamita lo hace apto para mercados locales sin necesidad de modelos multilingües genéricos.
- Análisis de documentos escaneados o capturas: al aceptar entrada de imagen y texto, puede extraer información de facturas, formularios o pantallas y responder preguntas sobre ellas, integrándose en flujos de digitalización.
- Descripción y etiquetado de imágenes en inglés: útil para generar metadatos, alt-text o clasificaciones preliminares en pipelines de gestión de contenido.
- Despliegue en local con llama.cpp: gracias a las cuantizaciones Q4_K_M e IQ4_XS, puede ejecutarse en estaciones de trabajo con GPU de consumo, lo que facilita prototipado y pruebas sin depender de la nube.
- Chatbot embebido en aplicaciones de escritorio o móviles: el formato GGUF y la compatibilidad con llama-server permiten integrar el modelo en productos de Origo Technologies o terceros con licencia Apache-2.0.
- Asistencia multimodal en entornos educativos o de accesibilidad: descripción de imágenes para usuarios con discapacidad visual o apoyo a tareas de estudio que combinen texto e ilustraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según tamaño de fichero indicado en la model card, 10,9–54,7 GB por fichero):
  - Q2_K: ~10,9 GB, viable en GPU de 12 GB con margen ajustado.
  - Q3_K_M: ~13-14 GB, requiere GPU de 16 GB.
  - IQ4_XS / Q4_K_M: ~16-18 GB, requiere GPU de 24 GB (RTX 3090/4090, A10, L4).
  - Q5_K_M / Q6_K: ~19-23 GB, requiere GPU de 24 GB con contexto reducido o 32 GB.
  - Q8_0: ~29 GB, requiere A100 40 GB o similar.
  - BF16: ~54,7 GB, requiere A100 80 GB, H100 o multi-GPU.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4/Q5; A100 40/80 GB o H100 para Q8_0 y BF16; L40S o A6000 como alternativas de 48 GB.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q4_K_M o IQ4_XS; en GPUs de 12-16 GB solo con Q2_K o Q3_K_M y contexto reducido.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), Ollama (previa conversión o importación del GGUF), y cualquier runtime compatible con GGUF. Para el componente multimodal es imprescindible cargar el fichero mmproj con `--mmproj`.
- Latencia y throughput: no disponibles. Como referencia orientativa no verificada, un modelo de 27 B en Q4_K_M sobre RTX 4090 suele situarse en el rango de decenas de tokens por segundo, pero no hay datos publicados por el autor.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas del modelo base que permitan una comparación rigurosa. Se ofrece una comparación estructural con alternativas de tamaño y naturaleza similares, marcando los campos no confirmados.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Notas |
|---|---|---|---|---|---|
| VNBot-MotaZ-27B-GGUF | 27,3 B | 32.768 (según ejemplo) | Sí (image-text-to-text) | Apache-2.0 | Idiomas vi/en; sin benchmarks publicados |
| Gemma 3 27B | 27 B | 128 K | Sí (vision) | Gemma license | Multilingüe amplio; benchmarks publicados |
| Qwen2.5-VL 32B | 32 B | 128 K | Sí (vision) | Apache-2.0 | Multilingüe; benchmarks publicados |
| InternVL 2.5 26B | 26 B | variable | Sí (vision) | MIT/Apache según variante | Multilingüe; benchmarks publicados |

La comparación se limita a parámetros y licencia; no es posible contrastar rendimiento por ausencia de métricas del modelo evaluado.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad en MMLU, HumanEval, GSM8K ni tareas multimodales, lo que dificulta la evaluación previa a producción.
- Documentación mínima: la model card no especifica arquitectura, datos de entrenamiento ni proceso de alineación, lo que limita la reproducibilidad y la auditoría del modelo.
- Idiomas limitados a vietnamita e inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño, especialmente en tareas de razonamiento complejo o en interpretación de imágenes ambiguas.
- Sesgos desconocidos: al no documentarse la composición del dataset, no es posible evaluar sesgos culturales, de género o políticos.
- Contexto máximo no confirmado oficialmente: los 32.768 tokens provienen del ejemplo de ejecución, no de una especificación formal; el máximo real podría diferir.
- Licencia Apache-2.0 permisiva para uso comercial, pero conviene revisar los ficheros LICENSE y NOTICE del repositorio por si incluyen atribuciones adicionales.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa; tratar como modelo experimental.
- El uso multimodal requiere cargar correctamente el fichero mmproj; una configuración incorrecta degradará o impedirá el procesamiento de imágenes.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B-GGUF
- Modelo base: https://huggingface.co/vnbot-ai/VNBot-MotaZ-27B
- Perfil del autor: https://huggingface.co/vnbot-ai
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
