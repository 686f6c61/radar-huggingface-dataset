# ZHENDANG/Gemma-4-31B-JANG_4M-CRACK

## Resumen

El modelo `ZHENDANG/Gemma-4-31B-JANG_4M-CRACK` es una versión "abliterada" de Google Gemma 4 31B IT, publicada originalmente por el grupo dealignai y re-subida por el usuario ZHENDANG. La abliteración es una técnica que elimina o atenúa los vectores de rechazo aprendidos durante el ajuste instructivo, de modo que el modelo responde a peticiones que normalmente serían rechazadas por políticas de seguridad. El resultado es un asistente conversacional multimodal (imagen-texto) con una tasa de cumplimiento del 93,7 % en HarmBench (300 prompts) y una penalización media del 5 % en MMLU-200 respecto al modelo base.

Técnicamente, se trata de un transformer denso de 31 000 millones de parámetros (aunque los pesos safetensors del repositorio suman 6 433 044 332 parámetros, lo que sugiere una cuantización extrema o un error de etiquetado), con 60 capas y atención híbrida sliding/global. El modelo conserva el encoder de visión en float16 y soporta un modo de razonamiento encadenado ("thinking mode"). Se distribuye en formato JANG v2, un formato nativo de MLX con cuantización mixta (8 bits en atención, 4 bits en MLP), pensado para ejecutarse en Apple Silicon mediante la aplicación vMLX. También existen cuantizaciones GGUF para otros motores de inferencia.

La relevancia de este modelo radica en su doble naturaleza: por un lado, es una pieza de investigación sobre la generalización de la seguridad en modelos de frontera; por otro, es una herramienta práctica para desarrolladores que necesitan un asistente sin restricciones en entornos controlados (pruebas de penetración, análisis de contenido, generación de código ofensivo, etc.). Su licencia es la de Gemma, que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 60 capas, atención híbrida sliding/global |
| Parametros totales | 31B (declarado); 6 433 044 332 según pesos safetensors |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | JANG v2 (8-bit attention, 4-bit MLP); GGUF disponible (varias cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Gemma (permite uso comercial con restricciones) |
| Formato de pesos | Safetensors (MLX-native), GGUF |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31b-it` y se somete a un proceso de abliteración denominado "CRACK v2". La abliteración consiste en extraer el vector de rechazo de la última capa del transformer y restarlo de los residuos durante la generación, lo que elimina la tendencia a negarse a responder. En esta versión v2 se mejoró la extracción del vector y se estabilizó el modo de pensamiento, evitando bucles degenerativos.

La arquitectura es un transformer denso de 31B con 60 capas y atención híbrida: algunas capas usan ventana deslizante (sliding window) y otras atención global, un diseño que reduce el coste computacional manteniendo la capacidad de modelar dependencias largas. El modelo es multimodal: conserva el encoder de visión de Gemma 4 en float16, lo que permite entrada de imágenes junto con texto.

El entrenamiento original de Gemma 4 incluyó ajuste instructivo con RLHF, pero el proceso de abliteración no añade nuevos datos de entrenamiento; es una modificación post-hoc de los pesos. La cuantización JANG v2 aplica 8 bits a las capas de atención y 4 bits a las capas MLP, logrando un tamaño de 21 GB (según la model card) o 45,4 GB (según el repositorio, que puede incluir archivos adicionales). No se especifican los datos de entrenamiento del modelo base ni el número de tokens.

## Capacidades

- Generación de texto y conversación multi-turno con soporte de modo de pensamiento (chain-of-thought) activable.
- Razonamiento lógico y matemático: mantiene una puntuación de 71,5 % en MMLU-200 (143/200), con una caída del 5 % respecto al modelo base.
- Generación de código: el modelo responde con código funcional en prompts de seguridad y pentesting (8/8 en el conjunto de pruebas), incluyendo scripts de red, exploits y herramientas ofensivas.
- Comprensión de imágenes: al conservar el encoder de visión, puede procesar entradas visuales junto con texto (pipeline image-text-to-text).
- Alto cumplimiento en HarmBench: 93,7 % de respuestas sin rechazo en 300 prompts estratificados por categorías (ciberdelincuencia, contenido dañino, desinformación, actividades ilegales, etc.).
- Sin restricciones de contenido: no rechaza peticiones de generación de contenido violento, ilegal o sexualmente explícito, salvo en casos extremos (por ejemplo, fabricación de drogas en modo pensamiento).
- Multilingüismo: no se especifican idiomas soportados, pero al derivar de Gemma 4 se espera un comportamiento multilingüe similar al modelo base.

## Casos de uso

- Investigación en seguridad de IA: el modelo permite estudiar cómo se comportan los sistemas abliterados ante prompts maliciosos, contribuyendo a la comprensión de los mecanismos de rechazo y su generalización.
- Pruebas de penetración y auditoría de seguridad: genera scripts de escaneo de puertos, reverse shells, keyloggers, exploits y guías de Metasploit, útil para profesionales que necesitan herramientas ofensivas en entornos controlados.
- Generación de contenido sin filtros para análisis de moderación: permite evaluar la eficacia de los sistemas de moderación de contenido generando ejemplos adversarios.
- Asistente de programación ofensiva: integrable en pipelines de CI/CD para generar código de prueba de seguridad, con soporte de tool calling (aunque no se menciona explícitamente, el modelo responde bien a instrucciones de código).
- Chatbot de rol o narrativa sin restricciones: útil para creadores de contenido que necesitan diálogos explícitos o violentos sin censura, siempre que cumplan con la legislación aplicable.
- Evaluación comparativa de modelos abliterados: sirve como referencia para medir el impacto de la abliteración en el rendimiento (MMLU, coherencia) frente a otros modelos de la misma familia.

## Benchmarks y rendimiento

La model card proporciona resultados de HarmBench (300 prompts) y MMLU-200 (10 asignaturas × 20 preguntas). No se han publicado resultados en otros benchmarks estándar como HumanEval o GSM8K.

| Benchmark | Resultado |
|---|---|
| HarmBench global (300 prompts) | 93,7 % (281/300) |
| HarmBench - Ciberdelincuencia/intrusión | 100 % (51/51) |
| HarmBench - Contenido dañino | 100 % (22/22) |
| HarmBench - Desinformación | 100 % (50/50) |
| HarmBench - Actividades ilegales | 94 % (47/50) |
| HarmBench - Contextual | 92 % (72/78) |
| HarmBench - Químico/biológico | 90 % (46/51) |
| HarmBench - Acoso/intimidación | 88 % (22/25) |
| HarmBench - Copyright | 84 % (43/51) |
| Seguridad y pentesting (8 prompts) | 8/8 (100 %) |
| MMLU-200 (total) | 71,5 % (143/200) |
| MMLU-200 (modelo base) | 76,5 % (153/200) |
| Delta MMLU | -5,0 % |

La model card también indica que todas las comprobaciones de coherencia (conocimiento factual, razonamiento, generación de código, matemáticas) se superan, aunque no se ofrecen cifras concretas.

## Requisitos de hardware

- Apple Silicon con 32 GB o más de memoria unificada (recomendado por la model card).
- Aplicación vMLX 1.3.26 o superior para soporte completo de Gemma 4 (visión, modo pensamiento, ajustes de inferencia).
- Las librerías estándar `mlx_lm` y `mlx_vlm` no soportan Gemma 4 en las versiones 0.31.2 y 0.4.1 respectivamente.
- Para otros entornos, existen cuantizaciones GGUF que permiten ejecutar el modelo con llama.cpp, LM Studio u Ollama, con requisitos de VRAM variables según la cuantización (por ejemplo, Q4_K_M requeriría aproximadamente 18-20 GB de VRAM).
- El tamaño del modelo en formato JANG v2 es de 21 GB (según la model card), aunque el repositorio safetensors ocupa 45,4 GB (posiblemente incluye archivos adicionales o pesos sin cuantizar).
- Latencia y throughput: no se proporcionan datos específicos. En Apple Silicon con 32 GB, se espera una generación de varios tokens por segundo, pero depende de la configuración exacta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma 4 31B IT (original) | 31B | No disponible | Gemma | Safetensors | Modelo base con rechazo de contenido activo |
| ZHENDANG/Gemma-4-31B-JANG_4M-CRACK | 31B (declarado) | No disponible | Gemma | MLX, GGUF | Abliterado, 93,7 % HarmBench, 71,5 % MMLU-200 |
| Dolphin 2.6 Mixtral 8x7B (abliterado) | 46,7B (MoE) | 32K | Apache 2.0 | GGUF, safetensors | Abliterado, sin datos de HarmBench disponibles |

No se dispone de datos comparativos directos con otros modelos abliterados en los mismos benchmarks. La comparación con el modelo base Gemma 4 31B IT muestra una caída del 5 % en MMLU-200, a cambio de una tasa de cumplimiento del 93,7 % en HarmBench.

## Limitaciones y advertencias

- El modelo ha sido deliberadamente despojado de sus mecanismos de rechazo. Esto implica un riesgo elevado de generar contenido ilegal, dañino o éticamente cuestionable. Su uso debe limitarse a entornos de investigación controlados y cumpliendo la legislación vigente.
- La abliteración degrada el rendimiento en tareas de conocimiento general: MMLU-200 cae un 5 % respecto al modelo base. No se han medido otros benchmarks (HumanEval, GSM8K, etc.).
- En modo pensamiento (thinking ON), el modelo puede entrar en bucles degenerativos si se usa temperatura 0 o penalización de repetición baja. Se recomienda temperatura 0,3-0,7 y penalización 1,15-1,25.
- Ciertas categorías extremas (fabricación de drogas) pueden seguir mostrando rechazo en modo pensamiento.
- La licencia Gemma impone restricciones de uso: no se permite el uso para desarrollar armas, vigilancia masiva o violaciones de derechos humanos, entre otras. Aunque el modelo esté abliterado, estas restricciones contractuales siguen aplicando.
- No se especifican los idiomas soportados; se asume herencia del modelo base, pero no hay garantía.
- El número de parámetros real según los pesos safetensors (6,43B) no coincide con los 31B declarados. Esto puede deberse a una cuantización extrema o a un error en el etiquetado del repositorio. Se recomienda verificar antes de su uso en producción.
- No hay soporte oficial de las librerías MLX estándar; se requiere vMLX o adaptaciones manuales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ZHENDANG/Gemma-4-31B-JANG_4M-CRACK
- Modelo original de dealignai (ModelScope): https://www.modelscope.cn/models/dealignai/Gemma-4-31B-JANG_4M-CRACK
- Cuantizaciones GGUF (bucket): https://huggingface.co/buckets/jinmrong/Gemma-4-31B-JANG_4M-CRACK-GGUF-bucket
- Ficha en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/gemma-4-31b-jang-4m-crack-dealignai
- Ficha en AIAny: https://aiany.app/item/gemma-4-31b-jang-4m-crack-v2-dealignai
- Investigación de dealignai sobre seguridad en MoE: https://dealign.ai/quantsteer.html
- Aplicación vMLX: https://vmlx.net
