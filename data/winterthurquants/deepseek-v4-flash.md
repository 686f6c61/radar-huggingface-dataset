# winterthurquants/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como una versión preliminar ("preview") de la serie DeepSeek-V4. Cuenta con 284.000 millones de parámetros totales y 13.000 millones de parámetros activos por token, y su rasgo más diferencial es una ventana de contexto de un millón de tokens. La ficha que se analiza aquí corresponde a una redistribución del modelo publicada por el usuario winterthurquants en HuggingFace, no al repositorio oficial de DeepSeek AI.

El modelo introduce tres cambios técnicos respecto a la generación anterior: una arquitectura de atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), conexiones residuales reforzadas mediante Manifold-Constrained Hyper-Connections (mHC) y el optimizador Muon durante el entrenamiento. Según la model card, en el escenario de 1M tokens de contexto el modelo Pro de la misma familia requiere solo el 27 % de los FLOPs de inferencia por token y el 10 % de la caché KV en comparación con DeepSeek-V3.2.

Su relevancia actual radica en que combina contexto de un millón de tokens con un coste de inferencia reducido gracias al diseño disperso, algo crítico para tareas de análisis de repositorios completos, documentos extensos o flujos agénticos de varios pasos. La licencia MIT declarada facilita su adopción comercial, aunque el repositorio analizado presenta cero descargas y cero valoraciones, lo que obliga a tratar la procedencia de los pesos con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención híbrida CSA + HCA y conexiones mHC |
| Parametros totales | 284B según model card; 290.944.616.402 (~291B) según safetensors del repositorio |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP8 Mixed (variante Base) y FP4 + FP8 Mixed (variante instruct); tags del repositorio: 8-bit, fp8. No se listan cuantizaciones GGUF |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Precisión de pesos | FP4 para parámetros de expertos MoE, FP8 para el resto |
| Tamaño del repositorio | 159,6 GB |
| Pipeline | text-generation |
| ID del repositorio | winterthurquants/DeepSeek-V4-Flash |
| Fecha de creación y actualización | 2026-09-27 (ambas) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash es un transformer disperso de tipo MoE con 284B parámetros totales y 13B activos por token. Su innovación principal es un mecanismo de atención híbrido que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), diseñado para reducir de forma drástica el coste computacional y de memoria en contextos muy largos. Según la model card, en el modelo mayor de la familia (V4-Pro) esta combinación permite operar con el 27 % de los FLOPs por token y el 10 % de la caché KV frente a DeepSeek-V3.2 en configuraciones de 1M tokens. A ello se suman las Manifold-Constrained Hyper-Connections (mHC), que refuerzan las conexiones residuales convencionales para estabilizar la propagación de señal entre capas sin sacrificar expresividad.

El preentrenamiento se realizó sobre más de 32 billones (32T) de tokens diversos y de alta calidad, empleando el optimizador Muon para acelerar la convergencia y mejorar la estabilidad del entrenamiento. El post-entrenamiento sigue un paradigma de dos etapas: primero se cultivan de forma independiente expertos por dominio mediante SFT y RL con GRPO, y después se consolidan en un único modelo mediante destilación on-policy. La variante Flash-Max, el modo de máximo esfuerzo de razonamiento, alcanza un rendimiento de razonamiento comparable al de V4-Pro cuando se le concede un presupuesto de pensamiento mayor, aunque queda ligeramente por detrás en tareas de conocimiento puro y en los flujos agénticos más complejos debido a su menor escala de parámetros.

## Capacidades

- Generación de texto y razonamiento multi-paso, con un modo específico de máximo esfuerzo de razonamiento (Flash-Max) que amplía el presupuesto de pensamiento.
- Procesamiento de contexto ultra-largo de hasta 1.000.000 de tokens, adecuado para documentos completos, repositorios de código o historiales extensos.
- Razonamiento sobre conocimiento general y multilingüe: los benchmarks de la model card reportan resultados en MMLU, MMMLU, C-Eval y CMMLU, lo que evidencia cobertura tanto en inglés como en chino, aunque la lista oficial de idiomas soportados no está disponible.
- Capacidades de código y matemáticas: la model card afirma un rendimiento de primer nivel en benchmarks de programación, sin desglose numérico en la información disponible.
- Tareas agénticas y de flujo multi-paso, con una brecha notablemente reducida frente a modelos cerrados según la documentación del autor.
- Compatibilidad declarada con endpoints (tag endpoints_compatible) y con la librería transformers.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Análisis de repositorios de código completos: con 1M tokens de contexto y atención comprimida, el modelo puede ingerir un proyecto entero (código, tests, documentación y configuración) en una sola pasada y responder preguntas de arquitectura, detectar dependencias cruzadas o localizar la causa raíz de un fallo sin fragmentar el contexto.
- Asistentes de programación en producción: su rendimiento declarado en benchmarks de código y sus 13B parámetros activos permiten integrarlo en pipelines de revisión automática de pull requests, generación de tests o sugerencias de parche con una latencia de decodificación contenida.
- Procesamiento de documentación legal o financiera extensa: contratos, expedientes o informes anuales que superan ampliamente el contexto de modelos convencionales pueden analizarse íntegramente, extrayendo cláusulas, comparando versiones o resumiendo obligaciones sin perder referencias cruzadas.
- Agentes autónomos de investigación: el modo Flash-Max con presupuesto de pensamiento ampliado resulta adecuado para tareas de razonamiento encadenado donde el agente debe planificar, consultar fuentes y verificar resultados en varios pasos.
- Atención al cliente con memoria de historial largo: la ventana de 1M tokens permite conservar el historial completo de un cliente (tickets, conversaciones, documentación asociada) sin resúmenes intermedios que degradan la fidelidad.
- Análisis de corpus científicos y revisión bibliográfica: ingestión de decenas de artículos simultáneamente para sintetizar estado del arte, detectar contradicciones entre estudios o generar tablas comparativas de metodologías.
- Migración y modernización de bases de código legacy: dado un repositorio antiguo y su documentación, el modelo puede proponer planes de refactorización por fases manteniendo el contexto global de las dependencias.
- Evaluación de investigación en contexto largo: útil como modelo de referencia para experimentos sobre recuperación de información en ventanas de un millón de tokens, dada su eficiencia declarada en caché KV.

## Benchmarks y rendimiento

La model card incluye resultados de la variante Base. La tabla pública está truncada en la información disponible, por lo que solo se reproducen las filas completas. No se han publicado resultados de benchmarks para la variante instruct ni para Flash-Max en la información disponible, ni comparaciones con modelos de otros proveedores.

| Benchmark (métrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Arquitectura | - | MoE | MoE | MoE |
| Parámetros activos | - | 37B | 13B | 49B |
| Parámetros totales | - | 671B | 284B | 1,6T |
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

Datos adicionales declarados sin cifras concretas: en el contexto de 1M tokens, DeepSeek-V4-Pro necesita el 27 % de los FLOPs de inferencia por token y el 10 % de la caché KV en comparación con DeepSeek-V3.2.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 159,6 GB en precisión FP4 + FP8 mixta, por lo que se necesita un nodo con al menos 160 GB de memoria de acelerador para cargar los pesos completos, más espacio para caché KV y activaciones.
- En FP8 completo (variante Base), el peso de los 284B parámetros rondaría los 284 GB, lo que exige múltiples GPUs o memoria unificada.
- GPU recomendadas: nodos multi-GPU de clase数据中心 como H100 80 GB (mínimo 2-4 unidades para la versión FP4/FP8), H200, B200 o A100 80 GB en configuraciones más amplias. No hay cifras oficiales de latencia o throughput en la información disponible.
- No cabe en GPUs de consumo: una RTX 4090 (24 GB) o una RTX 5090 no pueden alojar los pesos, ni siquiera cuantizados a 4 bits, dado que el modelo completo supera los 140 GB incluso en ese formato.
- Opciones de despliegue: la librería declarada es transformers y el repositorio incluye el tag endpoints_compatible (compatible con endpoints de HuggingFace). El soporte explícito de vLLM, SGLang, llama.cpp, Ollama o TGI no está confirmado en la información disponible.
- Gracias a que solo 13B parámetros están activos por token, el coste de cómputo por token es bajo en comparación con modelos densos de tamaño similar, pero el despliegue sigue estando limitado por memoria y ancho de banda, no por FLOPs.
- La caché KV es un factor crítico: el diseño CSA + HCA reduce su tamaño declarado al 10 % del de DeepSeek-V3.2 en contexto de 1M tokens, lo que abarata el servicio concurrente en ventanas largas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B (291B según safetensors del reupload) | 13B | 1M | MIT | HuggingFace y ModelScope (repos oficiales de DeepSeek AI); redistribución en winterthurquants/DeepSeek-V4-Flash |
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT | HuggingFace y ModelScope |
| DeepSeek-V3.2 | 671B | 37B | no disponible en la información | no disponible en la información | no disponible en la información |

Comparativa de rendimiento en benchmarks Base: en MMLU, V4-Flash-Base obtiene 88,7 frente a 87,8 de V3.2-Base y 90,1 de V4-Pro-Base; en MMLU-Pro, 68,3 frente a 65,5 y 73,5 respectivamente. En AGIEval, 82,6 frente a 80,1 y 83,1. No se dispone de datos de latencia, throughput ni coste por token para ninguno de los tres modelos en la información proporcionada.

## Limitaciones y advertencias

- El repositorio analizado es una redistribución de terceros (usuario winterthurquants), no el repositorio oficial de DeepSeek AI. Presenta cero descargas, cero valoraciones y no hay verificación independiente de que los pesos coincidan con los del modelo original: existe riesgo de manipulación, corrupción o pesos incompletos.
- Discrepancia de recuento de parámetros: la model card declara 284B y los safetensors del reupload reportan 290.944.616.402 (~291B). Conviene verificar el origen de esta diferencia antes de desplegarlo.
- La documentación disponible está truncada: faltan la lista oficial de idiomas, resultados de la variante instruct, detalles de cuantización para GGUF y la política de uso aceptable.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos, no cuantificado en la información disponible.
- Los benchmarks publicados corresponden únicamente a las variantes Base; extrapolar esos números al modelo instruct o a Flash-Max no es metodológicamente correcto.
- Sesgos conocidos: no disponibles. La model card no documenta evaluación de sesgos ni de seguridad.
- Restricciones de licencia: la licencia declarada es MIT, permisiva para uso comercial, pero debe confirmarse en el repositorio original de DeepSeek AI, ya que el reupload podría no reproducir los términos exactos.
- Requisitos de hardware muy elevados: incompatible con cualquier GPU de consumo y con la mayoría de configuraciones de servidor de gama media.
- En producción, el coste de la caché KV en ventanas cercanas a 1M tokens sigue siendo significativo incluso con la compresión declarada; conviene dimensionar la concurrencia con margen.
- No hay información sobre estabilidad numérica en FP4 para los expertos MoE, ni sobre degradación de calidad frente a FP8, en el material disponible.
- La fecha de creación del repositorio (2026-09-27) es posterior a la fecha de la mayoría de referencias conocidas; verificar la vigencia del enlace y del paper asociado.

## Enlaces

- Repositorio analizado: https://huggingface.co/winterthurquants/DeepSeek-V4-Flash
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Repositorio oficial de DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- DeepSeek-V4-Flash (oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- DeepSeek-V4-Flash-Base (oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- DeepSeek-V4-Pro (oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- DeepSeek-V4-Pro-Base (oficial): https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- DeepSeek-V4-Flash-Base en ModelScope: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash-Base
- DeepSeek-V4-Flash en ModelScope: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash
- DeepSeek-V4-Pro-Base en ModelScope: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro-Base
- DeepSeek-V4-Pro en ModelScope: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter/X de DeepSeek AI: https://twitter.com/deepseek_ai
- Logotipo referenciado en la model card (DeepSeek-V2): https://github.com/deepseek-ai/DeepSeek-V2/blob/main/figures/logo.svg

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los dominios recuperados no guardan relación con la ficha y se han descartado deliberadamente.
