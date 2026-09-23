# wepiqx/RINIQ-NEXT-GGUF

## Resumen

RINIQ-NEXT-GGUF es el repositorio de experimentación del programa RINIQ, una línea de trabajo centrada en construir modelos mediante cirugía de capas (*layer surgery*) sobre un mismo esqueleto: el modelo base Qwen/Qwen3.5-9B. En esta iteración se cruzan dos donantes con los mismos huesos pero con ajustes finos muy distintos: OxCoder-9B, descrito como programador agéntico, y MiMo-V2.6-Distill-Qwen-9B, un destilado SFT agéntico entrenado con 77B de tokens. La fusión se realiza bloque a bloque mediante `fuse_layers.py` y el resultado se cuantiza con el motor MERNIK (SMAPE-5100, lente dual-max Ox+Neo, la receta exacta de M2 para permitir comparaciones A/B limpias).

El interés del repositorio no está en un modelo listo para producción, sino en la metodología y en el registro público de resultados, incluidos los negativos. La model card declara explícitamente un estado de "banco de laboratorio" y confirma que todavía no se han subido pesos: el repositorio rastrea veredictos y los archivos solo se publicarán si alguna variante supera a la referencia RINIQ-M2. Actualmente ninguna lo hace en rigor, aunque N2 empata en HumanEval pass@1 (91,46 %) y N4a mejora el recuento de salidas vacías (5 frente a 6), con la hipótesis confirmada de que el comportamiento diferencial reside en las capas FFN.

La relevancia del trabajo es de tipo metodológico: documenta que un solo bloque puede decidir el rendimiento (cambiar el bloque 31 de Neo a MiMo cuesta 8,5 puntos porcentuales), que los islotes donantes distantes se integran sin coste aparente y que la perplejidad puede coronar al peor modelo de la serie (N1m obtiene la mejor PPL, 7,9604, con solo 63,41 % en HumanEval y 51 salidas vacías). Todo ello sobre archivos de 5,0 GB ejecutables en GPU de consumo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso de la familia Qwen3.5, según el modelo base declarado (Qwen/Qwen3.5-9B). El repositorio no detalla la arquitectura interna del base; el trabajo propio consiste en fusión selectiva de bloques (FFN, atención y normas) entre ajustes finos. Detalles adicionales: no disponibles |
| Parámetros totales | ~9B (heredados del modelo base Qwen3.5-9B; los donantes se nombran como variantes de 9B) |
| Parámetros activos | No aplica: no se describe como modelo MoE |
| Longitud de contexto | No disponible. El único dato es el ejemplo de arranque de la model card (`-c 8192`), que es una configuración de servidor, no un límite documentado del modelo |
| Tipos de cuantización | GGUF. Cuantizaciones del motor MERNIK (SMAPE-5100, lente dual-max Ox+Neo). Se incluyen comparativas con cuantizaciones estándar Q6_K (7,2 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). En el momento de redactar la ficha no hay pesos subidos al repositorio |

## Arquitectura y entrenamiento

No hay entrenamiento convencional en el sentido de preentrenamiento o ajuste fino desde cero. El procedimiento es una fusión por bloques de tres linajes que comparten el esqueleto Qwen3.5-9B: OxCoder-9B (programador agéntico), MiMo-V2.6-Distill-Qwen-9B (destilado SFT agéntico, 77B de tokens de SFT) y los donantes ya integrados en RINIQ-M2 (Ox, Orn en los bloques 24, 25 y 26, y Neo31). La herramienta `fuse_layers.py` permite sustituir tejido de forma granular: un bloque concreto (`15:b:ffn`), un rango (`15-17:b:ffn`), combinaciones múltiples (`ffn+attn`) y tensores de normalización mediante `ln` para cualquier tensor `*norm*`, con modos `--dry` y `--d`. La filosofía declarada es no promediar nunca bloques divergentes: mapas de donante por bloque, sin mezcla de pesos.

La serie evaluada cubre cuatro recetas principales. N1 y N1m aplican intercalado (alterno y espejo, respectivamente); M8 es un A/B de intercambio único sobre la base RINIQ-M2 añadiendo el bloque 31 de MiMo; N2 combina la base M2 con los bloques 15, 16 y 17 de MiMo (islotes donantes alejados de los 24-26 ya presentes); N3 realiza una votación por rango sobre los bloques 10, 14, 15, 16 y 27; y N4a/N4b/N4c descomponen N2 por tipo de tejido (solo FFN, solo atención, solo normas). La cuantización posterior se ejecuta con el motor MERNIK, receta SMAPE-5100, idéntica a la de M2 para que la comparación sea limpia. Las conclusiones registradas son tres: un único bloque puede decidir el resultado (Neo31 → MiMo31 cuesta 8,5 puntos porcentuales en HumanEval), los islotes donantes distantes se integran sin penalización (N2 empata exactamente con M2 en pass@1), y la perplejidad es un mal indicador de calidad en este escenario (N1m obtiene la mejor PPL de la serie y el peor veredicto). El hallazgo más citado es que el "alma" del modelo reside en las capas FFN: N4a, solo con tejido FFN, iguala la corona con 91,46 % y reduce las salidas vacías a 5.

## Capacidades

- Generación de código en inglés: es la única capacidad medida. La variante N2 y la N4a alcanzan 91,46 % de pass@1 en HumanEval (150 de 164 problemas) bajo la configuración de evaluación declarada.
- Completado de código con baja tasa de salidas vacías: N4a registra 5 respuestas vacías sobre 164, el mejor valor de la serie, frente a las 6 de la base M2 y las 24-51 de las variantes de intercalado.
- Herencia de comportamiento agéntico: los donantes se describen como "agentic coder" y "agentic SFT distillate". No se documentan evaluaciones específicas de agentes ni de razonamiento multi-paso.
- Soporte de tool calling / function calling: no documentado. El ejemplo de arranque incluye `--jinja`, lo que en llama.cpp habilita plantillas de chat con soporte de herramientas, pero la model card no aporta ninguna evaluación al respecto.
- Capacidades multilingües: limitadas a inglés según la etiqueta de idioma. No hay datos de otros idiomas.
- Modo de razonamiento explícito (*thinking*), visión, audio u otras capacidades especiales: no disponibles.
- Cuantización propia: el motor MERNIK (SMAPE-5100) es una capacidad del pipeline, no del modelo, pero forma parte del artefacto publicado.

## Casos de uso

- Investigación en fusión de capas: el repositorio sirve como protocolo reproducible para experimentar con intercambios de bloques entre ajustes finos del mismo base. `fuse_layers.py` permite definir mapas de donante por bloque con modos de tejido granular y ejecutar simulaciones en seco antes de tocar pesos.
- Evaluación comparativa de motores de cuantización: al disponer de resultados de MERNIK SMAPE-5100 y de Q6_K estándar sobre los mismos linajes, permite medir el coste real de una cuantización agresiva (5,0 GB frente a 7,2 GB) en términos de pass@1 y de perplejidad.
- Generación de código asistida en local: con archivos de 5,0 GB, es viable desplegar un servidor llama.cpp con offload completo de capas en una GPU de consumo y usarlo para autocompletado o generación de funciones en flujos de trabajo individuales.
- Estudio de la relación entre perplejidad y calidad: la serie N1m documenta el caso más extremo de divergencia entre PPL y veredicto funcional, lo que la convierte en material útil para calibrar metodologías de evaluación en investigación.
- Auditoría de protocolos de evaluación de código: la model card publica la configuración exacta de la "slow ring" (temperatura 1.0, top_p 0.95, top_k 20, penalización de presencia 0.0, máximo 2048 tokens) y el recuento de salidas vacías, un dato poco habitual que permite reproducir y auditar el experimento.
- Base para A/B testing de donantes: partiendo de RINIQ-M2-BF16 como base se sustituyen tres donantes a la vez, lo que reduce el coste de experimentación para quien quiera probar hipótesis propias sobre posiciones de bloque.
- Despliegue de referencia en GPU única: el comando documentado (`llama-server -m RINIQ-N2-MERNIK-5100.gguf --port 28082 -ngl 99 -c 8192 --jinja`) sirve como plantilla para levantar un endpoint local de generación de código.

## Benchmarks y rendimiento

Condiciones declaradas de la "slow ring": HumanEval pass@1, temperatura 1.0, top_p 0.95, top_k 20, penalización de presencia 0.0, máximo 2048 tokens. La columna HE+ es la métrica propia del autor y no se documenta su definición exacta. La columna "salidas vacías" cuenta respuestas vacías sobre los 164 problemas.

| Build | Tamaño | PPL (ctx 1024) | HumanEval pass@1 | HE+ | Salidas vacías |
|---|---|---|---|---|---|
| RINIQ-N2 (M2 + MiMo 15-17) | 5,0 GB | 7,6813 | 91,46 % (150/164) | 85,4 (-6,1) | 8 |
| RINIQ-M8 (M2 + MiMo 31) | 5,0 GB | 7,6479 | 82,93 % (136/164) | 79,3 (-3,6) | 15 |
| RINIQ-N3 (M2 + MiMo 10,14,15,16,27, rank-vote) | 5,0 GB | 7,6313 | 88,41 % (145/164) | 82,9 (-5,5) | 9 |
| RINIQ-N4a (M2 + MiMo 15-17, solo FFN) | 5,0 GB | 7,6276 | 91,46 % (150/164) | 86,6 (-4,9) | 5 |
| RINIQ-N4b (M2 + MiMo 15-17, solo atención) | 5,0 GB | 7,6163 | 89,02 % (146/164) | 84,1 (-4,9) | 12 |
| RINIQ-N4c (M2 + MiMo 15-17, solo normas) | 5,0 GB | 7,5795 | pendiente | pendiente | pendiente |
| RINIQ-N1 (intercalado alterno) | 5,0 GB | 8,0572 | 79,27 % (130/164) | 76,2 | 24 |
| RINIQ-N1m (intercalado espejo) | 5,0 GB | 7,9604 | 63,41 % (104/164) | 63,4 | 51 |
| RINIQ-M2-MERNIK-5100 (base de M8 y N2) | 5,0 GB | 7,5819 | 91,46 % (150/164) | 87,2 (-3,0) | 6 |
| Ox-SMAPE-5100 (familia Ox) | 5,0 GB | 7,5670 | 88,41 % (145/164) | no disponible | 4-5 |
| Ox-Q6_K (stock, familia Ox) | 7,2 GB | 7,6758 | 84,15 % (138/164) | no disponible | no disponible |
| MiMo-5100-SMAPE (familia MiMo) | 5,0 GB | 8,7435 | 70,12 % (115/164) | 66,5 | 7 |
| MiMo-Q6_K (stock, familia MiMo) | 7,2 GB | 9,1362 | 71,95 % (118/164) | 66,5 | 6 |

No se han publicado otros benchmarks (MMLU, GSM8K, MT-Bench ni similares) en la información disponible. Todos los números son autoreportados por el autor y no consta verificación independiente.

## Requisitos de hardware

- Tamaño de archivo: 5,0 GB para las cuantizaciones MERNIK 5100 y 7,2 GB para las variantes Q6_K de los linajes comparados.
- VRAM estimada para inferencia: alrededor de 6-7 GB con offload completo de capas para el archivo de 5,0 GB, más el espacio del contexto. Para 8192 tokens de contexto conviene reservar entre 7 y 8 GB. Estimación derivada del tamaño de archivo, no publicada por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar el archivo de 5,0 GB con `-ngl 99`. Resultan adecuadas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, Tesla T4 16 GB, L4, A10G y superiores (A100, H100) con holgura para contextos más largos y lotes mayores.
- Compatibilidad con GPU de consumo: sí, es el escenario objetivo explícito del autor ("consumer-GPU research"). El archivo Q6_K de 7,2 GB también cabe en GPUs de 8 GB, aunque con menos margen para el contexto.
- Opciones de despliegue: llama.cpp y llama-server, tal como documenta la model card con `--jinja`. Otros runtimes del ecosistema GGUF (Ollama, LM Studio, koboldcpp) son compatibles en principio por formato, pero no se confirman en la información disponible. vLLM no se menciona; los GGUF no son su ruta nativa.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por petición.

## Comparativa con modelos similares

La comparación natural es contra los artefactos del mismo programa y contra los linajes donantes, todos con esqueleto Qwen3.5-9B. No se dispone de comparativas externas verificadas.

| Modelo | Parámetros | Contexto | HumanEval pass@1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RINIQ-NEXT (N2 / N4a) | ~9B | no disponible | 91,46 % | apache-2.0 | Solo veredictos; sin pesos subidos |
| RINIQ-M2-MERNIK-5100 | ~9B | no disponible | 91,46 % | apache-2.0 | Referencia interna del programa |
| Ox-SMAPE-5100 | ~9B | no disponible | 88,41 % | no disponible | Familia Ox |
| MiMo-5100-SMAPE | ~9B | no disponible | 70,12 % | no disponible | Familia MiMo |
| Ox-Q6_K (stock) | ~9B | no disponible | 84,15 % | no disponible | Cuantización estándar, 7,2 GB |
| MiMo-Q6_K (stock) | ~9B | no disponible | 71,95 % | no disponible | Cuantización estándar, 7,2 GB |

Frente al modelo base Qwen/Qwen3.5-9B sin fusionar no se han publicado resultados comparativos en la información disponible. Tampoco hay comparación con modelos de otros linajes del mismo tamaño.

## Limitaciones y advertencias

- No hay pesos publicados: el repositorio está declarado como "lab bench". Cualquier intento de descarga de un GGUF concreto fallará hasta que el autor suba archivos, y la propia model card fija la condición de publicar solo si una variante supera a M2.
- Adopción nula: 0 descargas y 1 like en la fecha de consulta. No existe validación por parte de la comunidad.
- Licencia: el repositorio declara apache-2.0, pero es una licencia aplicada sobre pesos derivados de Qwen3.5-9B y de al menos tres ajustes finos donantes. Conviene verificar los términos de cada donante y del modelo base antes de cualquier uso comercial.
- Idioma: únicamente inglés. El rendimiento en castellano no está evaluado y no debería asumirse.
- Contexto no documentado: el único valor disponible (8192) proviene de una línea de ejemplo de arranque y no debe interpretarse como la longitud máxima del modelo. Un contexto mal dimensionado puede degradar la calidad de forma no medida.
- Riesgo de salidas vacías: es un problema medido y cuantificado en la propia serie, con valores de 5 a 51 respuestas vacías sobre 164. En producción exige una capa de validación y reintento.
- Perplejidad poco fiable como métrica: la serie documenta explícitamente una inversión entre PPL y calidad funcional (N1m), por lo que no debe usarse como criterio de selección en este linaje.
- Evaluación estrecha: un solo benchmark (HumanEval) y una única configuración de muestreo. No hay datos de razonamiento general, matemáticas, multilingüismo, robustez ni seguridad.
- Números autoreportados: HE+ es una métrica propia sin definición pública disponible, lo que limita la comparabilidad con terceros.
- Alucinación y sesgos: no se documentan análisis específicos. Al ser un modelo orientado a código, el riesgo principal es generar APIs, firmas o dependencias inexistentes.
- Estabilidad estructural: las fusiones por sustitución de bloques pueden producir degradaciones localizadas difíciles de diagnosticar. El propio autor documenta que cambiar un único bloque cuesta 8,5 puntos porcentuales en el caso del bloque 31.
- Uso en producción: no recomendado con el estado actual del repositorio. Es material de investigación, no un artefacto desplegable.

## Enlaces

- Repositorio del modelo: https://huggingface.co/wepiqx/RINIQ-NEXT-GGUF
- Repositorio del método y registro completo (RINIQ.md, MIMO.md, FUSION.md): https://huggingface.co/wepiqx/MERNIK
- Programa RINIQ original (tri-fusión): https://huggingface.co/wepiqx/RINIQ-MERNIK-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Perfil del autor en HuggingFace: https://huggingface.co/wepiqx
- Actividad del autor: https://huggingface.co/wepiqx/activity/all
- Patrocinio del autor: https://github.com/sponsors/wepiqx
- Ficha del programa RINIQ en SAVRN: https://savrn.com/models/riniq-mernik-gguf
- Editor en SAVRN: https://savrn.com/model-publishers/wepiqx
- Directorio de modelos GGUF: https://local-ai-zone.github.io/
