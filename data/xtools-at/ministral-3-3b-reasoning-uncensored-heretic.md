# xtools-at/Ministral-3-3B-Reasoning-UNCENSORED-heretic

## Resumen

Ministral-3-3B-Reasoning-UNCENSORED-heretic es una variante «decensored» (también etiquetada como abliterated) del modelo unsloth/Ministral-3-3B-Reasoning-2512, que a su vez deriva del Ministral 3 3B Reasoning 2512 de Mistral AI. La intervención la firma el usuario xtools-at y se ha realizado con la herramienta Heretic v2.0.0.dev0, que aplica una técnica de ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 9 a 20 del transformer para eliminar el comportamiento de rechazo aprendido durante el post-entrenamiento.

El modelo conserva la arquitectura del original: un modelo de lenguaje denso de unos 3,4B parámetros acompañado de un codificador visual de 0,4B, con 3.849.090.048 parámetros totales según los pesos en safetensors y una ventana de contexto de 256k tokens. Está pensado para despliegue en el borde (edge) y en hardware modesto, y mantiene las capacidades del modelo base: visión, razonamiento multi-paso, function calling nativo, salida JSON y soporte de once idiomas.

Su relevancia es doble. Por un lado, es un ejemplo práctico y medible de hasta qué punto una ablación quirúrgica puede reducir los rechazos manteniendo la distribución de salida muy cerca del original: el autor reporta 1/100 rechazos frente a 91/100 del modelo de partida, con una divergencia KL de solo 0,0170. Por otro, ilustra el ecosistema de derivados sobre la familia Ministral 3 publicados bajo licencia Apache 2.0. El repositorio es pequeño en tracción (38 descargas y 14 likes en el momento de la consulta) y no incluye benchmarks de calidad tipo MMLU o HumanEval.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal: modelo de lenguaje de ~3,4B parámetros + codificador de visión de ~0,4B (familia Mistral 3) |
| Parametros totales | 3.849.090.048 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256k tokens (256 000) |
| Tipos de cuantizacion | El repositorio publica pesos en safetensors (BF16); no se listan GGUF ni cuantizaciones propias. La familia base de Unsloth distribuye cuantizaciones Dynamic 2.0 GGUF |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar (once idiomas declarados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería declarada: vllm; tamaño del repo 7,7 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del Ministral 3 3B original: un transformer denso con dos componentes, un modelo de lenguaje de aproximadamente 3,4B parámetros y un codificador visual de aproximadamente 0,4B, lo que da los 3,85B totales que aparecen en los safetensors. El contexto declarado es de 256k tokens y el modelo está diseñado para ejecutarse en el borde, con despliegue en BF16 dentro de 16 GB de VRAM y por debajo de 8 GB de RAM/VRAM en versiones cuantizadas. El modelo base es la versión «Reasoning» post-entrenada de la familia, orientada a matemáticas, código y tareas STEM, con soporte explícito de system prompt, function calling nativo y trazas de razonamiento que se recomienda mantener en el contexto en conversaciones multi-turno.

La modificación respecto al original no es un reentrenamiento, sino una ablación de direcciones en el espacio de activaciones. Según los parámetros ARA publicados, se interviene entre las capas 9 y 20 (start_layer_index 9, end_layer_index 20), con neighbor_count 13, preserve_good_behavior_weight 0,8093, steer_bad_behavior_weight 0,0001 y overcorrect_relative_weight 0,9247. El resultado declarado es una caída de rechazos de 91/100 a 1/100 con una divergencia KL de 0,0170 frente al modelo de partida. No se documentan en la información disponible los volúmenes de tokens, la composición del dataset ni las etapas de RLHF/DPO del modelo base; esa información corresponde a la model card de Mistral AI, no incluida aquí.

## Capacidades

- Generación de texto y razonamiento multi-paso: el modelo base es la variante «Reasoning», entrenada para problemas de matemáticas, código y STEM, con trazas de pensamiento explícitas.
- Visión: análisis de imágenes y respuestas basadas en contenido visual gracias al codificador de 0,4B; se recomienda mantener relaciones de aspecto cercanas a 1:1.
- Function calling nativo y salida en JSON, con capacidades agénticas declaradas como «best-in-class» a esta escala por el autor del modelo base.
- Soporte de agentes y razonamiento multi-paso con herramientas; se recomienda definir pocas herramientas y bien especificadas.
- Multilingüe: once idiomas declarados (inglés, francés, español, alemán, italiano, portugués, neerlandés, chino, japonés, coreano y árabe).
- Adherencia a system prompt, con un system prompt oficial publicado por Mistral AI para el modelo base.
- Comportamiento «uncensored»: la ablación reduce drásticamente los rechazos (1/100 en la evaluación del autor), lo que cambia el perfil de respuesta en temas sensibles.
- Ajuste recomendado de muestreo: temperatura 0,7 para la mayoría de entornos.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso controlado para estudiar qué se modifica exactamente al aplicar una ablación selectiva, comparando sus salidas con las del modelo base y midiendo la divergencia KL (0,0170 reportada) en lugar de evaluar solo la tasa de rechazo.
- Generación de código en local: con 3,85B parámetros y contexto de 256k, puede ejecutarse en una estación de trabajo con una sola GPU consumer para autocompletado, explicación de fragmentos y generación de tests en pipelines de CI/CD, sin enviar código a un servicio externo.
- Asistente de extracción de datos sobre documentos largos: la ventana de 256k permite procesar contratos, informes o expedientes completos y devolver JSON estructurado mediante function calling, con la ventaja de que todo el procesamiento ocurre en el dispositivo.
- Procesamiento de imágenes en el borde: descripción de imágenes, moderación de contenido visual propio o extracción de campos a partir de capturas y formularios escaneados, en dispositivos con 8-16 GB de memoria.
- Traducción y atención al cliente multilingüe: los once idiomas declarados permiten cubrir conversaciones en español, francés, alemán, italiano, portugués y neerlandés con un solo modelo pequeño, manteniendo trazas de razonamiento en contexto para conversaciones de varios turnos.
- Clasificación y enrutado de tickets: con salida JSON nativa y bajo coste de inferencia, es apto para etiquetar y dirigir grandes volúmenes de mensajes en tiempo real dentro de un sistema propio.
- Escenarios de red teaming y pruebas de robustez: al tener los rechazos prácticamente eliminados, resulta útil para generar corpus adversarios y evaluar filtros de seguridad de terceros, siempre dentro de un marco legal y ético.
- Fine-tuning de especialización: el tamaño reducido y la licencia Apache 2.0 permiten reentrenar o aplicar LoRA sobre él para dominios concretos en una única GPU.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la intervención de decensurado, no benchmarks de calidad tipo MMLU, HumanEval o GSM8K:

| Metrica | Este modelo | Modelo original (Ministral-3-3B-Reasoning) |
|---|---|---|
| Rechazos (sobre 100 prompts) | 1/100 | 91/100 |
| Divergencia KL | 0,0170 | 0 (por definición) |

No se han publicado resultados de benchmarks de capacidad (razonamiento, código, matemáticas, visión) en la información disponible para este derivado concreto. Tampoco se han publicado mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada en BF16: unos 7,7 GB solo de pesos; con caché KV para contextos moderados, el autor del modelo base indica que cabe en 16 GB de VRAM.
- VRAM estimada en cuantización de 8 bits: alrededor de 4 GB de pesos, más caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 2,3-2,5 GB de pesos, más caché KV; el modelo base se declara ejecutable por debajo de 8 GB de RAM/VRAM en versiones cuantizadas.
- GPU recomendadas: A100, H100 o L40S para despliegue con vLLM a contextos largos; RTX 4090 o RTX 3090 para BF16 en local; RTX 4060 Ti 16 GB, RTX 3060 12 GB o GPUs integradas con 8 GB para cuantizaciones de 4-8 bits.
- Cabe en GPU consumer: sí, en BF16 en tarjetas de 16 GB o más, y en cuantizaciones de 4 bits en equipos de 8 GB.
- Opciones de despliegue: el repositorio declara la librería vllm; al ser pesos safetensors en formato Mistral 3 (mistral-common), también puede servirse con TGI o con el stack de Mistral. Para llama.cpp u Ollama sería necesario convertir a GGUF, paso que no está documentado en este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia de orden de magnitud, un modelo denso de 3,85B es órdenes de magnitud más ligero que un 70B, pero no se aportan cifras medidas.
- Nota sobre contexto largo: 256k tokens de ventana implican un caché KV considerable; usar el contexto completo dispara los requisitos de memoria por encima de las cifras de pesos indicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Notas |
|---|---|---|---|---|---|
| Ministral-3-3B-Reasoning-UNCENSORED-heretic (este) | 3,85B totales (3,4B LM + 0,4B visión) | 256k | Sí | Apache 2.0 | 1/100 rechazos, KL 0,0170; 38 descargas |
| unsloth/Ministral-3-3B-Reasoning-2512 (base directo) | 3,85B (misma arquitectura) | 256k | Sí | Apache 2.0 | Original sin ablación; 91/100 rechazos según la evaluación del autor |
| Ministral 3 3B Instruct 2512 | 3,85B (misma arquitectura) | 256k | Sí | Apache 2.0 | Variante instruct (no reasoning), pesos en FP8 |
| Ministral 3 8B Instruct / Reasoning 2512 | ~8B (no confirmado en detalle) | no disponible en la información proporcionada | Sí | Apache 2.0 | Versión mayor de la misma familia; más capacidad a cambio de más VRAM |

No se dispone en la información proporcionada de datos verificables de otros modelos comparables de 3-4B (por ejemplo, alternativas de otras familias) en cuanto a parámetros, contexto o rendimiento, por lo que no se incluyen cifras que no se puedan contrastar.

## Limitaciones y advertencias

- El modelo está explícitamente decensurado: los rechazos se han reducido de 91/100 a 1/100, lo que implica que puede producir contenido que el modelo original bloquearía. Es responsabilidad del desplegador aplicar sus propias salvaguardas.
- La ablación puede degradar sutilmente capacidades no medidas: el autor solo reporta tasa de rechazo y divergencia KL (0,0170). No hay evaluación de MMLU, HumanEval, GSM8K ni de calidad multimodal, así que el impacto real en razonamiento, código o visión es desconocido.
- Riesgo de alucinación: propio de un modelo de 3,85B; la ventana de 256k no elimina el riesgo de inventar datos en documentos largos, y conviene verificar salidas críticas.
- Sesgos: no se documentan evaluaciones de sesgo en la información disponible; el proceso de ablación actúa sobre direcciones de comportamiento, no sobre sesgos sociales o culturales, que persisten del modelo base.
- Idiomas: se declaran once idiomas, pero no se aportan métricas por idioma; el rendimiento en español, árabe o coreano puede ser inferior al del inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación, pero el derivado debe cumplir también las condiciones del modelo base de Mistral AI; conviene revisar los términos de la familia Ministral 3 antes de explotación comercial.
- Repositorio con muy poca tracción (38 descargas, 14 likes) y sin pipeline declarado ni demo: menor probabilidad de validación independiente y de soporte de la comunidad.
- El contexto de 256k no está verificado empíricamente en este derivado; no hay pruebas publicadas de recuperación de información a esa distancia.
- La model card recomienda limitar el número de herramientas y mantener imágenes con relación de aspecto cercana a 1:1; ignorarlo degrada el rendimiento en modo agéntico y en visión.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/xtools-at/Ministral-3-3B-Reasoning-UNCENSORED-heretic
- Modelo base directo: https://huggingface.co/unsloth/Ministral-3-3B-Reasoning-2512
- Modelo original de Mistral AI: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512
- System prompt oficial del modelo base: https://huggingface.co/mistralai/Ministral-3-3B-Reasoning-2512/blob/main/SYSTEM_PROMPT.txt
- Ministral 3 3B Base 2512: https://huggingface.co/mistralai/Ministral-3-3B-Base-2512
- Ministral 3 3B Instruct 2512: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512
- Ministral 3 8B Base 2512: https://huggingface.co/mistralai/Ministral-3-8B-Base-2512
- Heretic (herramienta de ablación): https://heretic-project.org
- Unsloth (documentación y cuantizaciones Dynamic 2.0): https://docs.unsloth.ai/basics/unsloth-dynamic-v2.0-gguf
- Repositorio de Unsloth: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth

Nota: la búsqueda web realizada devolvió únicamente páginas del fabricante de máquinas de grabación láser xTool (xtool.eu, fr.xtool.com, atome3d.com), sin relación con el modelo ni con el autor xtools-at. No se han encontrado papers, blogs ni demos adicionales sobre este modelo en los resultados disponibles.
