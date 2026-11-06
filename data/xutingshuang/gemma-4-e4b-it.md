# xutingshuang/gemma-4-E4B-it

## Resumen

Gemma 4 E4B-it es la variante instruction-tuned del modelo E4B de la familia Gemma 4, desarrollada por Google DeepMind y publicada con licencia Apache 2.0. Se trata de un modelo multimodal de tipo any-to-any que procesa texto, imagen y audio como entrada y genera texto como salida. Con 7.996.156.490 parámetros totales en pesos safetensors (4,5B efectivos según la model card, 8B contando embeddings), está disenado para despliegue en dispositivos de borde: portátiles, estaciones de trabajo y telefonos de gama alta.

La arquitectura emplea un transformer decoder-only con atención híbrida que intercala atención local de ventana deslizante (512 tokens) con atención global completa, garantizando que la capa final sea siempre global. Incorpora Per-Layer Embeddings (PLE), una innovación que asigna a cada capa del decoder su propia tabla de embeddings por token, lo que explica la diferencia entre parámetros efectivos y totales. El contexto alcanza 128K tokens y el vocabulario es de 262K entradas.

Este repositorio concreto es un fine-tune publicado por el usuario xutingshuang sobre `google/gemma-4-E4B`, con 62 descargas y sin likes en el momento de la consulta. Es relevante porque ejemplifica el ecosistema de ajustes comunitarios sobre la familia Gemma 4, que combina razonamiento configurable, soporte nativo de function calling y multimodalidad completa (texto, imagen, audio) en un tamano apto para consumer hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida (sliding window local + global), Per-Layer Embeddings (PLE) |
| Parametros totales | 7.996.156.490 (4,5B efectivos; 8B con embeddings) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | No disponible (no especificado en la informacion proporcionada) |
| Idiomas soportados | Más de 140 idiomas (según la model card de la familia Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de la familia Gemma 4 en su variante E4B: un transformer decoder-only de 42 capas con atención híbrida que intercala capas de atención local de ventana deslizante de 512 tokens con capas de atención global completa, asegurando que la última capa sea siempre global. Para optimizar memoria en contextos largos, las capas globales emplean claves y valores unificados y aplican Proportional RoPE (p-RoPE). El vocabulario es de 262K tokens.

La innovación clave de las variantes E2B y E4B son los Per-Layer Embeddings (PLE): en lugar de anadir capas o parámetros al modelo, cada capa del decoder dispone de su propia tabla de embeddings por token. Estas tablas son grandes pero solo se usan para consultas rápidas, lo que reduce el número de parámetros efectivos (4,5B) frente al total (8B con embeddings). El modelo incorpora además un codificador de visión de aproximadamente 150M de parámetros y un codificador de audio de aproximadamente 300M de parámetros, ambos dedicados (a diferencia de la variante 12B Unified, que es encoder-free). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en este fine-tune concreto.

## Capacidades

- Generación de texto con razonamiento configurable mediante modos de pensamiento (thinking modes) ajustables.
- Procesamiento multimodal de entrada: texto, imagen con soporte de relación de aspecto y resolución variable, y audio (nativo en E2B, E4B y 12B).
- Generación de código y capacidades agénticas mejoradas, con soporte nativo de function calling.
- Soporte nativo del rol `system` para conversaciones estructuradas y controlables.
- Capacidades multilingües en más de 140 idiomas.
- Razonamiento multi-paso y flujos de agentes autónomos.
- Comprensión de video (según la model card de la familia, aunque la tabla de modales del E4B lista texto, imagen y audio).

## Casos de uso

- Asistente multimodal en dispositivo: el modelo puede procesar capturas de pantalla, fotos o audio junto con texto en un portátil o teléfono de gama alta, gracias a sus 4,5B parámetros efectivos y su diseño optimizado para ejecución local.
- Atención al cliente automatizada: gestiona conversaciones multi-turno con contexto largo (128K tokens) y mantiene el rol `system` para imponer políticas de respuesta y tono.
- Generación de código en producción: el soporte nativo de function calling permite integrarlo en pipelines de CI/CD para autocompletar, revisar y documentar código, así como invocar herramientas externas.
- Agentes autónomos multi-paso: con razonamiento configurable y function calling, puede orquestar tareas que requieran planificación, llamadas a APIs y verificación de resultados.
- Análisis de documentos con imágenes: extracción de información de facturas, formularios o gráficos combinando el codificador de visión con el razonamiento textual en una sola pasada.
- Transcripción y análisis de audio: al incorporar codificador de audio nativo, puede procesar reuniones o notas de voz y generar resúmenes o respuestas estructuradas.
- Despliegue en borde sin conectividad: al caber en hardware de consumo (ver sección de hardware), es adecuado para aplicaciones de privacidad donde los datos no deben salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo denso de 8B parámetros en fp16 requiere aproximadamente 16 GB de VRAM solo para pesos; en cuantización de 8 bits, unos 8 GB; en 4 bits, unos 4-5 GB. Estas cifras son estimaciones generales, no datos publicados para este modelo.
- GPU recomendadas: no especificadas en la información proporcionada. Por tamano, cabría en GPUs de consumo como RTX 4090 (24 GB) en fp16, y en RTX 3090/4080 en cuantizaciones de 8 bits. Para despliegue en servidor, A100 o H100 no serían necesarias pero permitirían mayor throughput.
- Compatibilidad con consumer GPU: sí, previsiblemente en GPUs con 8 GB o más según cuantización, aunque no hay confirmación oficial en la información disponible.
- Opciones de despliegue: la librería indicada es transformers. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 4 E4B-it (este fine-tune) | 8B totales / 4,5B efectivos | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face |
| Gemma 4 E2B | 5,1B totales / 2,3B efectivos | 128K | Texto, imagen, audio | Apache 2.0 | Hugging Face (Google) |
| Gemma 4 12B Unified | 11,95B | 256K | Texto, imagen, audio | Apache 2.0 | Hugging Face (Google) |
| Gemma 4 26B A4B MoE | 25,2B totales / 3,8B activos | 256K | Texto, imagen | Apache 2.0 | Hugging Face (Google) |

La comparativa se limita a la propia familia Gemma 4, ya que la información proporcionada no incluye datos de benchmarks ni de modelos de otros fabricantes. El E4B se sitúa entre el E2B (más ligero) y el 12B Unified (más capaz pero con mayor huella de memoria y contexto extendido a 256K).

## Limitaciones y advertencias

- Este repositorio es un fine-tune comunitario de un único autor (xutingshuang) con 62 descargas y ningún like; no cuenta con la validación ni el soporte de Google DeepMind.
- No se dispone de información sobre el dataset de ajuste, hiperparámetros ni evaluación del fine-tune, por lo que su comportamiento puede diferir del modelo base oficial.
- Riesgo de alucinación inherente a los modelos de lenguaje, no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto: 128K tokens, inferior a los 256K de las variantes 12B, 26B y 31B de la misma familia.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la model card enlaza a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`); conviene revisar los términos de uso de Gemma antes de desplegar en producción.
- El pipeline declarado es `any-to-any`, pero la generación es solo de texto; la salida multimodal no está soportada según la model card.
- No hay garantías de mantenimiento o actualización del repositorio por parte del autor.

## Enlaces

- Hugging Face: https://huggingface.co/xutingshuang/gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Colección Gemma 4 en Hugging Face: https://huggingface.co/collections/google/gemma-4
- GitHub: https://github.com/google-gemma
- Blog de lanzamiento: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación: https://ai.google.dev/gemma/docs/core
- Informe técnico (arXiv): https://arxiv.org/abs/2607.02770
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Página de modelos Gemma de DeepMind: https://deepmind.google/models/gemma/
