# wangzhang/Qwen3.5-35B-A3B-abliterated

## Resumen

El modelo `wangzhang/Qwen3.5-35B-A3B-abliterated` es una variante sin censura (abliterated) del modelo Qwen3.5-35B-A3B, desarrollado por el usuario wangzhang y publicado en HuggingFace. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 34.660.610.688 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, según indica la nomenclatura A3B. El modelo base es el Qwen3.5-35B-A3B de Alibaba, que según la documentación disponible es un modelo nativo de visión-lenguaje con arquitectura híbrida que combina atención lineal y MoE disperso, orientado a una mayor eficiencia de inferencia.

La relevancia de esta versión abliterated radica en que elimina los mecanismos de rechazo y censura presentes en el modelo original, lo que permite generar contenido sin restricciones de seguridad. Esto resulta de interés para desarrolladores e investigadores que necesitan explorar comportamientos del modelo sin filtros, aunque conlleva riesgos importantes de uso indebido. El modelo se distribuye bajo licencia Apache-2.0, pero su acceso está restringido (gated) y requiere aceptar condiciones en HuggingFace. El repositorio pesa 139,6 GB y contiene pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida con atención lineal (según documentación del modelo base) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000 millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B emplea una arquitectura híbrida que integra mecanismos de atención lineal con un modelo de mezcla de expertos (MoE) disperso. Según la documentación de QwenCloud, esta combinación busca mejorar la eficiencia de inferencia manteniendo un rendimiento global comparable al Qwen3.5-27B. El modelo es nativo de visión-lenguaje, lo que implica que fue entrenado para procesar tanto texto como imágenes, aunque la versión abliterated aquí descrita se etiqueta como text-generation y no se especifica si conserva las capacidades multimodales.

El proceso de "abliteration" aplicado por wangzhang consiste en la eliminación de los vectores de dirección de rechazo del modelo original, una técnica que se ha popularizado en la comunidad open source para obtener versiones sin censura. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. Tampoco se conocen los detalles del proceso de abliteration (por ejemplo, si se usó abliterix u otra herramienta, aunque el tag "abliterix" sugiere el uso de esa librería).

## Capacidades

- Generación de texto conversacional y de larga forma, al ser una variante del modelo Qwen3.5.
- Razonamiento y resolución de problemas, heredado del modelo base.
- Capacidades de visión-lenguaje en el modelo original, aunque no se confirma si la versión abliterated las conserva.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmado.
- Multilingüismo: no especificado.
- Modo "thinking" o razonamiento extendido: no especificado.
- La principal capacidad diferencial es la ausencia de censura, permitiendo generar contenido que el modelo base rechazaría.

## Casos de uso

- Investigación en seguridad y alineación: estudiar el comportamiento del modelo sin mecanismos de rechazo para entender los límites de la abliteration y desarrollar mejores técnicas de control.
- Generación de contenido creativo sin restricciones: escritura de ficción, guiones o diálogos que el modelo base podría bloquear por temas sensibles.
- Evaluación de robustez: probar la resistencia del modelo a jailbreaks y comparar su comportamiento con la versión original.
- Desarrollo de aplicaciones de rol o simulación de personajes donde se requiere libertad total de expresión.
- Análisis de sesgos y comportamientos no filtrados: estudiar qué tipo de contenido emerge cuando se eliminan las capas de rechazo.
- Experimentación académica en interpretabilidad: analizar los vectores de dirección eliminados y su impacto en la activación del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base Qwen3.5-35B-A3B se describe como comparable al Qwen3.5-27B en rendimiento global, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estándar. Tampoco hay datos específicos para la versión abliterated.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo MoE con 34,66B parámetros totales y ~3B activos, la inferencia requiere cargar todos los pesos en memoria. En precisión FP16, el modelo ocuparía aproximadamente 69 GB de VRAM (34,66B × 2 bytes). Con cuantización a 8 bits, ~35 GB; a 4 bits, ~17 GB. Sin embargo, no se ofrecen cuantizaciones en el repositorio, por lo que el usuario deberá convertirlos.
- GPU recomendadas: para FP16 se necesitan GPUs profesionales como A100 80GB, H100 80GB o múltiples RTX 4090 (24GB) en paralelo. Con cuantización 4 bits podría caber en una RTX 4090 o similar.
- En consumer GPU: posible solo con cuantización agresiva (4 bits) y usando frameworks como llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en el repo.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, transformers. Dado el tamaño, se recomienda vLLM para producción.
- Latencia y throughput: no disponibles. Al ser MoE con pocos parámetros activos, la latencia por token debería ser menor que un modelo denso del mismo tamaño total, pero no hay datos concretos.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo base Qwen3.5-35B-A3B se posiciona como una alternativa eficiente al Qwen3.5-27B, pero no hay datos de rendimiento publicados. Otras versiones abliterated de modelos similares (por ejemplo, de la serie Llama o Mistral) existen en HuggingFace, pero no se dispone de datos comparativos en la información proporcionada. Se indica "no disponible" por falta de datos verificables.

## Limitaciones y advertencias

- La abliteration elimina los mecanismos de rechazo, lo que puede producir contenido ofensivo, peligroso o ilegal. No debe usarse en aplicaciones de producción sin supervisión humana.
- Riesgo elevado de alucinaciones, especialmente en temas sensibles donde el modelo no tiene filtros.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo entrenado con datos web, es probable que herede sesgos sociales y culturales.
- La licencia Apache-2.0 permite uso comercial, pero el acceso restringido (gated) en HuggingFace puede limitar la redistribución.
- No se confirma si las capacidades multimodales del modelo base se conservan en esta versión abliterated.
- El repositorio no incluye cuantizaciones ni archivos GGUF, por lo que el despliegue en hardware consumer requiere conversión manual.
- No hay documentación sobre el proceso de abliteration aplicado, lo que dificulta reproducir o verificar el resultado.

## Enlaces

- HuggingFace: https://huggingface.co/wangzhang/Qwen3.5-35B-A3B-abliterated
- Árbol de archivos: https://huggingface.co/wangzhang/Qwen3.5-35B-A3B-abliterated/tree/main
- Documentación del modelo base (QwenCloud): https://www.qwencloud.com/models/qwen3.5-35b-a3b
- Guía de la serie Qwen3.5 (2026): https://explore.n1n.ai/blog/qwen3-5-model-series-2026-guide-2026-02-25
- Guía de Qwen 3.5 a 3.8 (2026): https://codersera.com/blog/qwen-3-5-complete-guide-2026/
