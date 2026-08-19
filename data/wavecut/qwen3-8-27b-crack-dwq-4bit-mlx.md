# WaveCut/Qwen3.8-27B-CRACK-DWQ-4bit-MLX

## Resumen

Qwen3.8-27B-CRACK-DWQ-4bit-MLX es una conversión cuantizada a 4 bits del modelo vision-language Qwen3.8-27B, preparada específicamente para ejecutarse en Apple Silicon mediante el ecosistema MLX. La desarrolla WaveCut a partir del modelo base `dealignai/Qwen3.8-27B-MXFP8-CRACK`, que a su vez deriva del Qwen3.8-27B de Alibaba. El objetivo principal es reducir el consumo de memoria (de 30,6 GB del original MXFP8 a 18,04 GB en esta versión) manteniendo una calidad de salida alta gracias a una técnica de cuantización denominada DWQ (Dynamic Weight Quantization) que refina las escalas y los sesgos de la cuantización affine usando registros de calibración.

El modelo mantiene intacta la torre de visión (417 tensores idénticos al original), el cabezal MTP (multi-token prediction) en 8 bits y la plantilla de chat CRACK. Está pensado para desarrolladores que quieran ejecutar un VLM de 27B en hardware de Apple con memoria unificada limitada, sin renunciar a capacidades como razonamiento configurable, tool calling, comprensión de imágenes y contexto largo de 262 144 tokens. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

La relevancia actual radica en que combina tres aspectos demandados: un modelo de 27B con arquitectura híbrida moderna (atención lineal + atención completa), una cuantización optimizada que supera en precisión a la cuantización RTN estándar, y un formato nativo MLX que evita capas de compatibilidad en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 híbrida: 3:1 de Gated DeltaNet (atención lineal) y atención completa con gate, 64 capas, 24Q/4KV, head dim 256 |
| Parametros totales | 27B (modelo base dense; el archivo safetensors cuantizado contiene 4 555 074 672 parámetros) |
| Parametros activos | No aplica (modelo dense, no MoE) |
| Longitud de contexto | 262 144 tokens nativos |
| Tipos de cuantizacion | Lenguaje: affine 4-bit, grupo 64; MTP: affine 8-bit, grupo 128; visión: sin cuantizar (representación original) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura híbrida de 64 capas que combina atención lineal Gated DeltaNet y atención completa con gate en proporción 3:1, con 24 cabezas de consulta y 4 de clave/valor y dimensión de cabeza 256. Este diseño reduce el coste computacional en contextos largos manteniendo la capacidad de atención global. El vocabulario es de 248 320 tokens y la ventana de contexto nativa alcanza 262 144 tokens.

La versión CRACK añade una ablación de rechazo a nivel de pesos, lo que elimina gran parte de los mecanismos de rechazo de contenido del modelo original. Sobre esa base, WaveCut aplicó cuantización DWQ: la torre de lenguaje se convirtió a 4 bits affine con grupo 64, y las escalas y sesgos se refinaron contra logits dispersos del profesor MXFP8 usando 128 registros de calibración deterministas (48 de tool calling, 32 de SWE-agent, 32 multilingües y 16 de código). La torre de visión se preservó exactamente (417 tensores idénticos) y el cabezal MTP se mantuvo en 8 bits affine grupo 128, byte-idéntico al original. El entrenamiento de calibración no utilizó imágenes; la protección de la visión se logró mediante preservación exacta de tensores y una prueba de humo con imagen.

## Capacidades

- Comprensión de imágenes y texto (VLM): puede describir imágenes, responder preguntas visuales y razonar sobre contenido gráfico.
- Soporte de video según las etiquetas del modelo (etiquetado como `video` en HuggingFace), aunque no se detalla el formato o límites.
- Razonamiento configurable: la plantilla CRACK heredada activa por defecto el modo `xhigh` de pensamiento; admite `medium` y `low`, y se puede desactivar con `enable_thinking=False`.
- Tool calling / function calling: soportado mediante la plantilla nativa de Qwen; la evaluación específica muestra una precisión del 43,75% en una muestra de decisiones de agente.
- Capacidades de agente: apto para tareas multi-paso y flujos de agente (SWE-agent, etc.).
- Generación de código: incluida en los datos de calibración (HumanEval) y en las capacidades del modelo base.
- Multilingüe limitado a inglés y chino.
- Multi-token prediction (MTP): el cabezal está presente y es cargable, aunque en la prueba realizada no produjo aceleración (12,50 tok/s frente a 21,60 tok/s sin MTP).

## Casos de uso

- Asistente de visión local en Mac: un desarrollador puede integrar el modelo en una aplicación de escritorio que reciba capturas de pantalla o fotos y responda preguntas sobre ellas, gracias a la torre de visión preservada y al formato MLX nativo.
- Automatización de tareas de agente con tool calling: el modelo puede decidir cuándo llamar a herramientas externas (APIs, ejecución de comandos) en flujos de agente, como se validó con el conjunto When2Call; su precisión del 43,75% lo hace utilizable en prototipos de agentes.
- Generación de código asistida en contextos largos: con 262K tokens de contexto, puede analizar repositorios completos o documentación extensa y generar o modificar código, ejecutándose localmente en hardware Apple.
- Análisis de documentos con imágenes: combinar texto e imágenes (por ejemplo, informes con gráficos) para extraer conclusiones, aprovechando la ventana de contexto amplia.
- Desarrollo de aplicaciones de razonamiento multimodal: el modo de pensamiento configurable permite usar el modelo para tareas que requieren cadenas de razonamiento antes de responder, como diagnóstico técnico a partir de imágenes.
- Evaluación y comparación de técnicas de cuantización: al ser un modelo de referencia con datos de calibración y evaluación reproducibles, sirve como banco de pruebas para investigar el impacto de DWQ frente a RTN en modelos VLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card incluye una evaluación específica sobre una muestra determinista de 96 filas del conjunto NVIDIA When2Call, usando log-verosimilitud forzada con la plantilla de tools nativa de Qwen:

| Modelo | Aciertos | Precisión | Pico de memoria MLX |
|---|---:|---:|---:|
| Fuente MXFP8 CRACK | 38/96 | 39,58% | 30,60 GB |
| RTN uniforme q4/g64 | 40/96 | 41,67% | 18,04 GB |
| **Este modelo (DWQ q4/g64)** | **42/96** | **43,75%** | **18,04 GB** |

Frente al fuente MXFP8, el modelo DWQ fue correcto de forma única en cuatro filas y erró de forma única en cero, con un intervalo de bootstrap pareado del 95% de [+1,04, +8,33] puntos y p de McNemar = 0,125. Frente al RTN, fue correcto de forma única en dos filas y erró de forma única en cero, con intervalo [0,00, +5,21] y p = 0,5. La alucinación de herramientas se mantuvo sin cambios en 5/16 filas elegibles para los tres modelos.

Además, se reporta una pérdida de destilación sobre un conjunto fijo retenido: RTN 0,168036 → DWQ 0,093706 (una reducción del 44,24%). Las pruebas de humo oficiales de MLX-VLM dieron respuestas exactas (`4` para texto, `Blue` para imagen) con picos de memoria de 18,26 GB y 18,34 GB respectivamente.

## Requisitos de hardware

- Memoria mínima: se requiere al menos 18 GB de memoria unificada para inferencia con contexto corto; el pico medido fue de 18,04 GB en un Apple M2 Max con 64 GB.
- GPU recomendadas: cualquier chip Apple Silicon con al menos 18 GB de memoria unificada (M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o superiores). En equipos con menos memoria, el contexto debe reducirse.
- No cabe en GPUs de consumo convencionales (por ejemplo, RTX 4090) sin adaptación, ya que el formato MLX está orientado a Apple Silicon; para otras plataformas habría que convertir los pesos.
- Opciones de despliegue: MLX-VLM (recomendado para cargar el modelo completo), `mlx_lm` solo para la torre de texto, y herramientas como LM Studio con soporte MLX en Mac.
- Latencia y throughput: en una prueba con un prompt greedy de 128 tokens, el modelo alcanzó 21,60 tok/s sin MTP y 12,50 tok/s con MTP activado (con 0/128 tokens aceptados). Estas cifras son de contexto corto en M2 Max; contextos largos y caché KV aumentan la memoria y reducen el throughput.

## Comparativa con modelos similares

| Modelo | Cuantización | Pico memoria | Precisión When2Call (96 filas) | Licencia |
|---|---|---|---|---|
| dealignai/Qwen3.8-27B-MXFP8-CRACK (fuente) | MXFP8 | 30,60 GB | 39,58% | Apache-2.0 |
| RTN uniforme q4/g64 (conversión estándar) | 4-bit affine g64 | 18,04 GB | 41,67% | Apache-2.0 |
| **Este modelo (DWQ q4/g64)** | 4-bit affine g64 + DWQ | 18,04 GB | 43,75% | Apache-2.0 |

Frente a otras conversiones MLX de Qwen3.8-27B disponibles en HuggingFace (por ejemplo, `malekoo/Qwen3.8-27B-MLX-4bit`), la diferencia principal es que este modelo incorpora la plantilla CRACK con ablación de rechazo y el refinamiento DWQ, lo que puede mejorar la precisión en tareas de agente pero introduce riesgos de seguridad adicionales. No se dispone de comparativas con otros modelos de la misma categoría (VLM de 27B) fuera del ecosistema Qwen3.8.

## Limitaciones y advertencias

- El modelo base CRACK incluye una ablación de rechazo a nivel de pesos: puede cumplir solicitudes inseguras, dañinas o ilegales. El responsable del uso debe garantizar que las aplicaciones cumplan la legislación y las políticas de seguridad aplicables.
- Solo soporta inglés y chino; no hay garantías de calidad en otros idiomas.
- El cabezal MTP está presente pero no produce aceleración en la prueba realizada; se recomienda mantenerlo desactivado por defecto salvo que una evaluación propia demuestre lo contrario.
- La evaluación de rendimiento se limita a una muestra pequeña (96 filas) de un único conjunto; no hay evidencia de superioridad universal frente a otras cuantizaciones.
- No se han publicado benchmarks estándar (MMLU, HumanEval, etc.) para esta conversión concreta.
- Riesgo de alucinación inherente a los modelos VLM, especialmente en descripciones de imágenes o respuestas factuales; debe validarse en producción.
- La memoria indicada (18 GB) corresponde a contexto corto; el uso de contextos largos o caché KV amplia aumenta significativamente el consumo.
- El formato MLX limita el despliegue a Apple Silicon; no es directamente ejecutable en GPUs NVIDIA o AMD sin conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveCut/Qwen3.8-27B-CRACK-DWQ-4bit-MLX
- Modelo base (MXFP8 CRACK): https://huggingface.co/dealignai/Qwen3.8-27B-MXFP8-CRACK
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Conversión MLX 4-bit sin DWQ (referencia): https://huggingface.co/malekoo/Qwen3.8-27B-MLX-4bit
- Blog de AMD sobre Qwen3.8 27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Página de Qwen3.8 en LM Studio: https://lmstudio.ai/models/qwen3.8
- Plantillas de chat alternativas (mencionadas en la model card): https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
