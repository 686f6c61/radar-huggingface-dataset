# winterthurquants/DeepSeek-V4-Pro

## Resumen

DeepSeek-V4-Pro es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek-AI y presentado como buque insignia de la serie DeepSeek-V4, junto a la variante menor DeepSeek-V4-Flash. Cuenta con 1,598,839,674,782 parámetros totales (aproximadamente 1,6 billones) y 49.000 millones de parámetros activados por token, con una longitud de contexto nativa de un millón de tokens.

El modelo ataca el cuello de botella histórico de la inferencia en contexto largo mediante una arquitectura de atención híbrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA). Según el informe técnico, en configuraciones de 1M de tokens DeepSeek-V4-Pro requiere solo el 27 % de los FLOPs de inferencia por token y el 10 % de la caché KV de DeepSeek-V3.2, lo que hace viable en la práctica un contexto de esa magnitud. Se entrenó con más de 32 billones (32T) de tokens y un pipeline de post-entrenamiento en dos etapas con SFT, RL con GRPO y destilación on-policy.

La ficha analizada corresponde a la copia publicada por el usuario `winterthurquants` en Hugging Face (`winterthurquants/DeepSeek-V4-Pro`), no al repositorio oficial de DeepSeek-AI. Es relevante ahora porque el modo DeepSeek-V4-Pro-Max se posiciona, según la propia model card, como el mejor modelo abierto disponible en tareas de conocimiento, con rendimiento de primer nivel en benchmarks de código y una brecha reducida frente a modelos cerrados en razonamiento y tareas agénticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida: Compressed Sparse Attention (CSA) + Heavily Compressed Attention (HCA), y Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 1.598.839.674.782 (aprox. 1,6T) |
| Parametros activos | 49B por token |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 y 8-bit segun los tags del repositorio; la version oficial de la serie usa FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8) y la version Base FP8 mixto. No se documentan GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible en la ficha del repositorio. Los benchmarks del informe tecnico (C-Eval, CMMLU, MMLU, MMMLU) evidencian competencia en chino e ingles; no se detalla la cobertura del resto de idiomas |
| Licencia | MIT (tag `license:mit` y cabecera de la model card de esta copia) |
| Formato de pesos | safetensors (libreria transformers) |
| Tamano del repositorio | 864,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion del repo | 27 de septiembre de 2026 |

## Arquitectura y entrenamiento

DeepSeek-V4-Pro es un transformer disperso de tipo MoE con 1,6T de parametros totales y 49B activados por token. Su innovacion principal es la atencion hibrida: CSA (Compressed Sparse Attention) y HCA (Heavily Compressed Attention) se combinan para comprimir de forma agresiva las representaciones de clave y valor, de modo que el coste de atender un millon de tokens deja de ser prohibitivo. El resultado declarado es un 27 % de los FLOPs de inferencia por token y un 10 % de la cache KV respecto a DeepSeek-V3.2 en el regimen de 1M de tokens. A esto se anade mHC (Manifold-Constrained Hyper-Connections), que refuerza las conexiones residuales convencionales para estabilizar la propagacion de senales entre capas sin sacrificar expresividad.

El preentrenamiento uso mas de 32T de tokens diversos y de alta calidad, optimizados con el optimizador Muon para acelerar la convergencia y mejorar la estabilidad del entrenamiento. El post-entrenamiento sigue un paradigma de dos etapas: primero se cultivan de forma independiente expertos por dominio mediante SFT y RL con GRPO, y despues se consolidan en un unico modelo mediante destilacion on-policy, integrando las distintas competencias en un solo conjunto de pesos. El modo de maximo esfuerzo de razonamiento se comercializa/denomina DeepSeek-V4-Pro-Max; la variante Flash dispone de un modo equivalente (Flash-Max) que, con un presupuesto de pensamiento mayor, se acerca al rendimiento de razonamiento de la version Pro a costa de quedar por detras en conocimiento puro y en los flujos agenticos mas complejos.

## Capacidades

- Generacion de texto y conocimiento enciclopedico: 90,1 en MMLU (5-shot) y 90,3 en MMMLU en la version Base, con mejora respecto a V3.2-Base.
- Razonamiento en modo extendido (thinking mode) mediante DeepSeek-V4-Pro-Max, orientado a tareas de razonamiento complejo y agenticas.
- Capacidad de codigo: la model card situa al modelo en rendimiento de primer nivel en benchmarks de programacion, aunque los valores numericos de dichos benchmarks no aparecen en el extracto disponible.
- Razonamiento matematico: no se aportan cifras concretas (GSM8K, MATH) en la informacion disponible.
- Procesamiento de contexto muy largo: ventana nativa de 1M de tokens sin necesidad de tecnicas externas de extension de contexto.
- Soporte de tool calling / function calling: no se detalla de forma explicita en el extracto de la model card; si se mencionan tareas agenticas y multi-paso.
- Agentes y razonamiento multi-paso: declarado como uno de los ejes del modo Pro-Max, con acercamiento a los modelos cerrados lideres en tareas agenticas.
- Capacidades multilingues: evidencia en chino e ingles (C-Eval 93,1; CMMLU 90,8); el resto de idiomas no esta documentado en la informacion disponible.
- Vision o audio: no disponibles. La ficha y la model card solo declaran `text-generation`.

## Casos de uso

- Analisis de bases de codigo completas: con 1M de tokens de contexto se puede cargar un repositorio de tamano medio (decenas de miles de lineas) sin troceado, y pedir analisis de dependencias, deteccion de bugs o planes de refactorizacion con visibilidad global del proyecto.
- Generacion y revision de codigo en produccion: integrado en pipelines de CI/CD para revisiones automaticas de pull requests, generacion de tests y explicacion de diffs, aprovechando el modo de razonamiento extendido cuando la tarea lo requiera.
- Agentes autonomos multi-paso: uso como cerebro de agentes que encadenan busqueda, ejecucion de herramientas y verificacion de resultados, apoyandose en el modo Pro-Max para el razonamiento y en el contexto largo para mantener el estado de la tarea.
- Auditoria legal y revision contractual: procesar contratos, pliegos o expedientes de cientos de paginas en una sola pasada, extrayendo clausulas, plazos y obligaciones sin perder referencias cruzadas entre secciones distantes.
- Analisis de documentacion tecnica y regulatoria: consolidar normativa, especificaciones y manuales extensos para responder preguntas trazables, reduciendo la perdida de informacion que provoca el chunking agresivo en sistemas RAG clasicos.
- Atencion al cliente con memoria prolongada: gestionar conversaciones multi-turno donde el historial completo del cliente (interacciones, incidencias, productos contratados) cabe en la ventana de contexto, evitando resumenes que degradan la fidelidad.
- Investigacion cientifica y revision bibliografica: resumir y comparar conjuntos de articulos o preprints largos, extrayendo metodologias y resultados en una unica pasada.
- Extraccion estructurada sobre corpus internos: convertir documentacion heterogenea (PDFs, wikis, tickets) en datos estructurados, aprovechando el contexto largo para mantener coherencia de esquema a lo largo de lotes grandes.

## Benchmarks y rendimiento

Resultados publicados para los modelos Base (no para las versiones de razonamiento):

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base (671B / 37B) | DeepSeek-V4-Flash-Base (284B / 13B) | DeepSeek-V4-Pro-Base (1,6T / 49B) |
|---|---|---|---|---|
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

No hay resultados disponibles en la informacion proporcionada para HumanEval, GSM8K, MATH, SWE-bench ni benchmarks agenticos, pese a que la model card afirma rendimiento de primer nivel en codigo y tareas agenticas. Tampoco se aportan cifras de latencia o throughput.

## Requisitos de hardware

- Peso de los pesos: el repositorio completo ocupa 864,7 GB, lo que da una referencia directa del espacio en disco y del volumen de VRAM necesario solo para cargar el modelo.
- VRAM estimada para inferencia: en FP8 puro, 1,6T de parametros equivalen a unos 1,6 TB de pesos; la mezcla FP4 + FP8 de la version oficial reduce ese volumen considerablemente, pero el modelo sigue estando muy por encima de cualquier configuracion de una sola GPU. Hay que sumar la cache KV, que segun el informe tecnico es un 10 % de la de V3.2 en regimen de 1M de tokens.
- GPU recomendadas: nodos multi-GPU de gama alta. Como referencia, 8xH200 (141 GB por GPU, 1.128 GB por nodo) o 8xB200 quedan en el orden de magnitud necesario para pesos en FP8/FP4 mixto; un nodo de 8xA100 80 GB (640 GB) resulta insuficiente para FP8 y solo seria viable con cuantizaciones mas agresivas u offload. Estas cifras son estimaciones derivadas del tamano de parametros y del tamano del repositorio, no datos publicados por el autor.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090, 5090, etc.). Solo seria planteable mediante cuantizacion muy agresiva con offload a disco y RAM, con latencias poco practicas.
- Opciones de despliegue: la model card no incluye comandos de servido en el extracto disponible. Para la familia DeepSeek los marcos habituales son vLLM y SGLang en entornos multi-GPU; llama.cpp/Ollama requeririan una conversion a GGUF que no se documenta en este repositorio, y TGI no aparece referenciado.
- Latencia y throughput: no disponibles. El unico dato indirecto es la reduccion al 27 % de FLOPs por token frente a V3.2 en contexto de 1M de tokens.
- Almacenamiento: prever al menos 865 GB para los pesos mas espacio adicional para cache y checkpoints temporales.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | MMLU (5-shot) | Disponibilidad |
|---|---|---|---|---|---|---|
| DeepSeek-V4-Pro | 1,6T | 49B | 1M | MIT (segun esta copia) | 90,1 (Base) | Hugging Face, ModelScope |
| DeepSeek-V4-Flash | 284B | 13B | 1M | No disponible en la informacion proporcionada | 88,7 (Base) | Hugging Face, ModelScope |
| DeepSeek-V3.2 | 671B | 37B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | 87,8 (Base) | Hugging Face |

Frente a modelos cerrados, la model card afirma que DeepSeek-V4-Pro-Max "cierra significativamente la brecha" en razonamiento y tareas agenticas, pero no se aportan cifras comparativas directas, por lo que no es posible cuantificar esa comparacion.

## Limitaciones y advertencias

- Repositorio no oficial: `winterthurquants/DeepSeek-V4-Pro` es una copia de comunidad con 0 descargas y 0 likes, publicada por un tercero. El repositorio de referencia es `deepseek-ai/DeepSeek-V4-Pro`. Conviene verificar integridad de pesos (hashes) antes de cualquier uso en produccion.
- Discrepancia de licencia: el tag del repositorio y la cabecera de la model card indican MIT, pero al tratarse de una copia de comunidad debe confirmarse que la licencia reproduce exactamente la del repositorio oficial de DeepSeek-AI antes de un uso comercial.
- Cuantizacion declarada ambigua: los tags del repositorio indican 8-bit/FP8, mientras que la version oficial de la serie se distribuye en FP4 + FP8 mixto. No esta claro que pesos contiene exactamente este repositorio.
- Model card incompleta: el contenido disponible se corta en la tabla de evaluacion base; faltan los resultados de los modelos instruct/razonamiento (Pro-Max), los benchmarks de codigo y agente, y la seccion de uso e instrucciones de despliegue.
- Riesgo de alucinacion: es un modelo generativo de gran escala sin mecanismos de verificacion factual incorporados; en tareas de conocimiento especializado conviene anadir recuperacion documental y validacion humana.
- Sesgos: no se documenta en la informacion disponible ninguna evaluacion de sesgos, toxicidad o alineacion de seguridad.
- Cobertura idiomatica: solo hay evidencia publicada para chino e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Coste de despliegue: 1,6T de parametros implican infraestructura multi-GPU especializada (del orden de nodos de 8 aceleradores), lo que descarta el uso en hardware de consumo y encarece la experimentacion.
- Modos de razonamiento con presupuesto variable: el modo Max mejora el razonamiento a costa de un mayor presupuesto de "pensamiento", lo que se traduce en latencia y coste por consulta mas altos; hay que dimensionar los limites de tokens de razonamiento en produccion.
- Atribucion y trazabilidad: al ser una copia de comunidad, no hay garantia de que los pesos correspondan a la revision oficial ni de que se actualicen cuando DeepSeek-AI publique correcciones.

## Enlaces

- Repositorio analizado (copia de comunidad): https://huggingface.co/winterthurquants/DeepSeek-V4-Pro
- Repositorio oficial DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Informe tecnico (arXiv:2606.19348): https://arxiv.org/abs/2606.19348
- DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- ModelScope, DeepSeek-V4-Pro: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Pro
- Organizacion DeepSeek-AI en Hugging Face: https://huggingface.co/deepseek-ai
- Web oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
- Analisis de arquitectura, evaluaciones y rendimiento de inferencia (terceros): https://inferencex.semianalysis.com/model/deepseek-v4
- Ficha de terceros sobre el modelo: https://www.open-source-ai.tech/models/deepseek-v4-pro
- Pagina de terceros sobre razonamiento y codigo: https://deepseeksr1.com/v4-pro/
