# Thaurock/Qwen3.5-122B-A10B-abliterated-GGUF

## Resumen

Qwen3.5-122B-A10B-abliterated-GGUF es una colección de cuantizaciones en formato GGUF del modelo Qwen3.5-122B-A10B-abliterated, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con 122.111.526.912 parámetros totales según los pesos en safetensors. El modelo original procede del Qwen3.5-122B-A10B del equipo Qwen de Alibaba, que fue posteriormente procesado por wangzhang mediante el framework Abliterix para eliminar los mecanismos internos de alineación y rechazo de seguridad, dando lugar a la variante "abliterated" (sin censura). Thaurock se encarga de la compilación y publicación de las cuantizaciones GGUF.

El problema que resuelve esta ficha es el de proporcionar una vía de despliegue local de un modelo MoE de gran escala (122B) en hardware de gama alta, mediante 11 variantes de cuantización que van desde F16 (~244,3 GB) hasta Q2_K (~44,9 GB). Al conservar la arquitectura MoE nativa, el modelo activa únicamente un subconjunto de parámetros por token (A10B sugiere aproximadamente 10 mil millones de parámetros activos), lo que reduce el coste computacional por token frente a un modelo denso del mismo tamaño total.

Es relevante ahora porque combina tres factores poco habituales en un mismo artefacto: escala MoE de 122B, licencia Apache 2.0 (permisiva para uso comercial) y una variante sin filtros de seguridad con una tasa de rechazo estimada del 0,5% según la model card. Está pensado para desarrolladores e investigadores que necesitan inferencia local con llama.cpp, Ollama, LM Studio o Text-Generation-WebUI, y que aceptan la responsabilidad del contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia Qwen3.5 |
| Parametros totales | 122.111.526.912 (~122B) |
| Parametros activos | no disponible (la nomenclatura A10B sugiere ~10B activos, sin confirmación oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 (16,00 BPW), Q8_0 (8,50 BPW), Q6_K (6,59 BPW), Q5_K_M (5,69 BPW), Q5_K_S (5,54 BPW), Q4_K_M (4,85 BPW), Q4_K_S (4,58 BPW), Q3_K_L (4,01 BPW), Q3_K_M (3,66 BPW), Q3_K_S (3,44 BPW), Q2_K (2,90 BPW) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos únicos); modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura es Mixture-of-Experts (MoE) dentro de la familia Qwen3.5. El repositorio no detalla el número de expertos, el número de expertos activados por token, la dimensión oculta ni la configuración de atención; solo se confirma la naturaleza MoE y el recuento total de parámetros (122.111.526.912). La designación A10B en el nombre apunta a un régimen de activación de aproximadamente 10 mil millones de parámetros por token, pero este dato no está verificado en la información disponible.

El modelo base Qwen3.5-122B-A10B fue desarrollado por el equipo Qwen de Alibaba; no se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO en los materiales consultados. La modificación "abliterated" fue aplicada por wangzhang mediante el framework Abliterix, que según la model card desmantela los mecanismos internos de alineación y rechazo, con una tasa de rechazo estimada del 0,5%. Thaurock realizó la conversión y cuantización a GGUF, incluyendo archivos únicos por variante y un `SHA256SUMS.txt` para verificación de integridad.

## Capacidades

- Generación de texto conversacional multi-turno, orientada a diálogo.
- Razonamiento lógico y comprensión contextual, según la model card.
- Generación y asistencia en código (codificación), según la model card.
- Respuestas sin rechazo ante peticiones que el modelo base rechazaría, con tasa de rechazo estimada del 0,5%.
- Compatibilidad con endpoints y pipelines de text-generation-inference (tag `endpoints_compatible`).
- Inferencia local mediante llama.cpp, Ollama, LM Studio y Text-Generation-WebUI.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Despliegue local de un MoE de 122B en estaciones de trabajo: con la variante Q4_K_M (~74,2 GB) se puede combinar RAM y VRAM para ejecutar el modelo en setups avanzados con GPU como la Nvidia A100, manteniendo el comportamiento MoE nativo.
- Generación de texto creativo sin restricciones de contenido: la variante abliterated elimina los rechazos del modelo base, por lo que resulta adecuada para escritura de ficción, guiones o ensayos donde el modelo original declinaría la petición.
- Investigación sobre alineación y seguridad: comparar las respuestas del modelo base Qwen3.5-122B-A10B con esta variante abliterated permite estudiar qué comportamientos cambian al eliminar los mecanismos de rechazo, con una tasa de rechazo residual del 0,5%.
- Experimentación con cuantización extrema en arquitecturas MoE: las variantes Q3_K_S (~52,9 GB) y Q2_K (~44,9 GB) permiten medir la degradación de coherencia en MoE bajo compresión, documentada en la model card como propensa a bucles gramaticales e incoherencias lógicas severas.
- Asistencia en código en entornos aislados: al ser Apache 2.0 y ejecutable con llama.cpp de forma totalmente local, puede integrarse en flujos de trabajo sin conexión a servicios externos, siempre que se valide la calidad del código generado.
- Servicio de inferencia autohospedado: con la variante Q8_0 (~129,9 GB) o Q6_K (~100,3 GB) en GPUs de gran VRAM se obtiene una calidad prácticamente indistinguible del F16, útil para servir conversaciones multi-turno con alta fidelidad lógica.
- Verificación de integridad en pipelines de descarga: el archivo `SHA256SUMS.txt` permite automatizar la comprobación de hashes tras la descarga de archivos de hasta 244,3 GB, evitando corrupción en despliegues reproducibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización (tamaños de archivo de la model card): F16 ~244,3 GB; Q8_0 ~129,9 GB; Q6_K ~100,3 GB; Q5_K_M ~86,9 GB; Q5_K_S ~84,2 GB; Q4_K_M ~74,2 GB; Q4_K_S ~69,7 GB; Q3_K_L ~63,4 GB; Q3_K_M ~58,6 GB; Q3_K_S ~52,9 GB; Q2_K ~44,9 GB.
- GPU recomendadas: el F16 requiere múltiples GPUs empresariales o clusters en la nube; Q8_0 y Q6_K están pensados para tarjetas de gran VRAM; Q4_K_M se cita para setups avanzados con Nvidia A100; Q3_K_L se menciona para setups con Nvidia CMP 170HX.
- ¿Cabe en GPU de consumo? No se indica compatibilidad con GPUs de consumo; los perfiles citados son A100, CMP 170HX y clusters multi-GPU. Para Q4_K_M y variantes menores se sugiere combinar RAM del sistema y VRAM.
- Opciones de despliegue: llama.cpp (CLI `llama-cli`), Ollama, LM Studio, Text-Generation-WebUI y text-generation-inference (tag `endpoints_compatible`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-122B-A10B-abliterated-GGUF (este) | ~122B (MoE) | no disponible | Apache 2.0 | GGUF | Sin censura, 11 cuantizaciones |
| Qwen3.5-122B-A10B (modelo base, familia Qwen) | ~122B (MoE) | no disponible | no disponible | no disponible | Con alineación de seguridad original |
| wangzhang/Qwen3.5-122B-A10B-abliterix | ~122B (MoE) | no disponible | no disponible | safetensors | Variante abliterated en safetensors |
| Otros modelos de ~120B de la familia Qwen | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: el modelo ha sido abliterated y puede generar contenido dañino, ilegal o socialmente inapropiado; la responsabilidad recae en quien ejecuta la inferencia, según el descargo de la model card.
- Riesgo de alucinación: no se han publicado métricas de fiabilidad factual; al tratarse de un modelo sin benchmarks disponibles, la verificación humana de las salidas es imprescindible.
- Degradación por cuantización: la model card advierte que las arquitecturas MoE complejas pueden sufrir degradación parcial en Q3_K_M y, en Q2_K, bucles gramaticales e incoherencias lógicas severas; Q2_K se recomienda solo para experimentación.
- Idiomas: no se declaran los idiomas soportados, por lo que el rendimiento multilingüe no está garantizado ni documentado.
- Contexto: la longitud de contexto no está especificada, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base procede de Qwen y la variante abliterated debe evaluarse legalmente en cada jurisdicción antes de su despliegue en producción.
- Tamaño de descarga: el repositorio ocupa 1009,2 GB; los archivos individuales llegan a 244,3 GB, por lo que se recomienda verificar la integridad con `SHA256SUMS.txt` tras cada descarga.
- Trazabilidad limitada: la información disponible no detalla la configuración MoE, el contexto ni los datos de entrenamiento, lo que dificulta reproducir o auditar el comportamiento del modelo.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Thaurock/Qwen3.5-122B-A10B-abliterated-GGUF
- Modelo base abliterated (wangzhang): https://huggingface.co/wangzhang/Qwen3.5-122B-A10B-abliterix
- Perfil del autor de las cuantizaciones (Thaurock): https://huggingface.co/Thaurock
- Equipo Qwen de Alibaba: no disponible enlace específico en la información proporcionada
- Paper, blog o demo del framework Abliterix: no disponible enlace en la información proporcionada
