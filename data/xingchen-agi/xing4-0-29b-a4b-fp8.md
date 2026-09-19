# XingChen-AGI/Xing4.0-29B-A4B-FP8

## Resumen

Xing4.0-29B-A4B-FP8 es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. y publicado en HuggingFace bajo el identificador XingChen-AGI. Se trata de la cuarta generacion de la serie Xing, sucesora del linaje TeleChat, y esta disenado especificamente para tareas de ingenieria complejas, razonamiento multi-paso y uso como agente con llamada a herramientas. El repositorio contiene los pesos en FP8 y la configuracion en formato Transformers, con un total de 31.215.031.088 parametros almacenados y un tamano de repositorio de 33,2 GB.

La arquitectura combina mHC, atencion MLA y prediccion multi-token (MTP) sobre un backbone MoE con 40 capas, tamano oculto de 3584 y 64 expertos enrutados mas uno compartido, de los cuales se activan 4 expertos por token, lo que da lugar a aproximadamente 4B de parametros activos por token frente a los 29B totales declarados por el autor. Soporta de forma nativa una longitud de contexto de 256K tokens, extensible a 512K, y es el primer modelo de esta escala entrenado integramente sobre plataforma Ascend NPU con el framework MindSpore.

Su relevancia actual radica en dos factores: por un lado, ofrece un perfil de eficiencia propio de un MoE de 4B activos con calidad de razonamiento y codigo cercana a modelos densos mucho mayores; por otro, demuestra un flujo de entrenamiento completo sobre hardware no-NVIDIA (Ascend 910C), con una mejora de throughput de aproximadamente el 96 por ciento respecto al rendimiento de fabrica gracias a optimizaciones de comunicacion MoE, recomputacion selectiva y fusion de operadores a nivel de grafo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion MLA, componente mHC y prediccion multi-token (MTP); 40 capas, hidden size 3584 |
| Parametros totales | 31.215.031.088 (segun safetensors); el autor declara 29B |
| Parametros activos | Aproximadamente 4B por token (4 expertos enrutados de 64, mas 1 experto compartido) |
| Longitud de contexto | 256K tokens nativa, extensible a 512K |
| Tipos de cuantizacion | FP8 (pesos de este repositorio). No disponible informacion sobre otros formatos cuantizados publicados |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con configuracion nativa de transformers |
| Tamano del repositorio | 33,2 GB |
| FFN denso (intermediate size) | 9216 |
| FFN de experto (intermediate size) | 1024 |
| Descargas / likes en HuggingFace | 91 descargas, 91 likes |

## Arquitectura y entrenamiento

El modelo sigue un diseno MoE de tipo sparse. Cada capa contiene 64 expertos enrutados de tamano intermedio 1024 y un experto compartido, con un enrutamiento de 4 expertos activos por token, lo que mantiene el coste computacional de inferencia en el orden de un modelo de 4B de parametros activos mientras la capacidad total de almacenamiento asciende a unos 31B. La atencion es de tipo MLA (Multi-head Latent Attention), que comprime las representaciones de clave y valor en un espacio latente de baja dimension, reduciendo de forma notable la memoria de cache KV y permitiendo sostener ventanas de 256K tokens. El componente mHC aparece citado por el autor como parte del bloque de arquitectura, aunque las siglas no se desglosan en la informacion disponible. Se anade prediccion multi-token (MTP), orientada a mejorar la estabilidad de las cadenas de razonamiento largas y a habilitar tecnicas de decodificacion especulativa.

El entrenamiento se llevo a cabo integramente sobre plataforma Ascend NPU (clusters Ascend 910C) con MindSpore y MindFormers, incluyendo adaptacion de caracteristicas para mHC y desarrollo de operadores fusionados en Ascend C. El autor reporta una mejora de throughput de entrenamiento de aproximadamente el 96 por ciento sobre el rendimiento de fabrica, obtenida mediante optimizacion de comunicacion MoE de grano fino, recomputacion selectiva y fusion automatica de grafo y operadores (DVM). No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO; el modelo expone un modo de razonamiento explicito activable mediante el parametro `enable_thinking`, lo que sugiere una fase de ajuste orientada a razonamiento y agentes, pero el detalle no esta documentado en la model card.

## Capacidades

- Generacion de texto conversacional y razonamiento en multiples pasos mediante modo thinking activable o desactivable por plantilla de chat.
- Razonamiento matematico y de competicion (evaluado en AIME2026 con 90,00 puntos).
- Generacion y edicion de codigo en repositorios reales: resolucion de issues y parches medidos en SWE-bench Verified (75,00) y SWE-bench Multilingual (66,00).
- Ejecucion de tareas en terminal y entornos de linea de comandos (Terminal-Bench 2.1 con 57,50 puntos).
- Llamada a herramientas y function calling, con soporte declarado para frameworks de agentes como OpenCode, Claude Code, OpenClaw y Hermes.
- Planificacion multi-paso y ejecucion de cadenas de razonamiento largas, con coherencia mantenida en contextos extensos.
- Seguimiento de instrucciones complejas (IFBench, 69,67 puntos).
- Investigacion profunda y sintesis de fuentes multiples (DeepresearchBII, 60,80 puntos).
- Capacidades multilingues: no se detallan idiomas naturales soportados; el modelo obtiene 66,00 en SWE-bench Multilingual, lo que implica manejo de multiples lenguajes de programacion.
- Ajuste fino de dominio sobre datos propios con LLaMA-Factory y MindFormers, orientado a clasificacion de intenciones, comprension de tablas, auditoria de contratos y QA sobre base de conocimiento.

## Casos de uso

- Agentes de resolucion de incidencias en repositorios: el modelo puede recibir un issue y un arbol de codigo, localizar los ficheros relevantes y generar un parche verificable. Su puntuacion de 75,00 en SWE-bench Verified con una ventana de 210K tokens durante la evaluacion lo hace adecuado para integrarse en flujos de revisión asistida dentro de pipelines de CI/CD.
- Automatizacion de operaciones en terminal: con 57,50 en Terminal-Bench 2.1 y soporte de tool calling, puede encadenar comandos de shell, interpretar la salida y corregir la estrategia, lo que resulta util en tareas de diagnostico de sistemas, despliegue o mantenimiento.
- Atencion al cliente multi-turno con contexto largo: la ventana de 256K tokens permite mantener historiales extensos, documentacion de producto y estado de la conversacion sin truncado agresivo, con un coste de atencion contenido gracias a MLA.
- Auditoria de contratos y revision documental: el propio autor senala el ajuste fino para auditoria de contratos y entendimiento de tablas. Sobre documentos largos, el modelo puede extraer clausulas, comparar versiones y marcar discrepancias.
- Investigacion profunda automatizada: con 60,80 en DeepresearchBII, puede planificar busquedas, sintetizar multiples fuentes y producir informes estructurados con trazabilidad de las consultas realizadas.
- Asistente de codigo integrado en IDE: dado su perfil de 4B parametros activos, ofrece latencias de generacion bajas frente a modelos densos de tamano total similar, lo que lo hace viable para autocompletado y refactorizacion interactiva mediante API compatible con OpenAI.
- Clasificacion de intenciones y enrutado en sistemas de agentes: su tamano reducido en parametros activos y su capacidad de seguir instrucciones permiten usarlo como modelo de control que decide que herramienta o subagente invocar.
- Despliegue en infraestructura no-NVIDIA: al haber sido entrenado y optimizado sobre Ascend 910C con MindSpore, es una opcion natural para organizaciones con clusters Ascend que necesitan un modelo de razonamiento propio sin depender de CUDA.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Xing4.0-29B-A4B | Gemma4-26B-A4B | Qwen3.6-35B-A3B |
|---|---|---|---|
| IFBench | 69,67 | 72,67 | 65,50 |
| AIME2026 | 90,00 | 88,30 | 92,70 |
| AA.LCR | 61,00 | 66,00 | 62,00 |
| Tau3-Bench | 64,63 | 58,90 | 67,20 |
| Claw-Eval | 76,55 | 71,49 | 74,54 |
| SWE-bench Verified | 75,00 | 53,00 | 76,00 |
| Terminal-Bench 2.1 | 57,50 | 30,00 | 51,50 |
| SWE-bench Multilingual | 66,00 | 51,00 | 67,20 |
| DeepresearchBII | 60,80 | 39,30 | 59,70 |

Condiciones de evaluacion declaradas: SWE-bench Verified y SWE-bench Multilingual con el harness SWE-agent, temperatura 1,0, top_p 0,95, repetition_penalty 1,05 y ventana de 210K. Terminal-Bench 2.1 en terminus-2 con temperatura 0,8, max_tokens 64K y timeout de 24 horas, media de 3 ejecuciones. Claw-Eval con el harness oficial, temperatura 0,8, max_tokens 16384 y contexto de 256K, media de 3 ejecuciones. Tau3-Bench con el harness oficial y temperatura 0,8, media de pass^1 sobre 4 ejecuciones.

## Requisitos de hardware

Nota: las cifras de memoria de esta seccion son estimaciones derivadas del recuento de parametros y de la cuantizacion FP8, no datos publicados por el autor.

- Pesos en FP8: aproximadamente 31-33 GB (coincide con el tamano del repositorio, 33,2 GB). A ello hay que sumar cache KV y activaciones.
- VRAM estimada para inferencia: en torno a 36-40 GB con contexto moderado (32K-64K) y margen para cache KV; por encima de 40 GB si se explotan ventanas cercanas a 256K, aunque MLA reduce el coste de KV respecto a atencion estandar.
- GPU recomendadas: H100 80 GB, A100 80 GB, A6000 Ada 48 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En el ecosistema del autor, Ascend 910C.
- Viabilidad en GPU de consumo: no cabe en una RTX 4090 de 24 GB con pesos FP8 completos. Si cabe en configuraciones de 2x RTX 4090 o 2x RTX 3090 (48 GB agregados) con reparto por tensor parallel, y en tarjetas unicas de 48 GB.
- Despliegue: vLLM, SGLang y KTransformers, ademas de transformers nativo y API compatible con OpenAI. El autor no menciona soporte de llama.cpp ni publica pesos GGUF en este repositorio.
- Ajuste fino: LLaMA-Factory y MindFormers.
- Latencia y throughput: no disponible. Como referencia cualitativa, con 4B de parametros activos por token el coste de computo por token es bajo, y el cuello de botella principal en carga de un solo lote sera el ancho de banda de memoria necesario para leer los pesos FP8.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 31,2B (declarado 29B) | ~4B | 256K, extensible a 512K | Apache 2.0 | Pesos FP8 en HuggingFace |
| Gemma4-26B-A4B | 26B (segun denominacion del benchmark) | ~4B | No disponible | No disponible | No disponible en la informacion proporcionada |
| Qwen3.6-35B-A3B | 35B (segun denominacion del benchmark) | ~3B | No disponible | No disponible | No disponible en la informacion proporcionada |

En rendimiento, Xing4.0-29B-A4B lidera en Claw-Eval, SWE-bench Verified, Terminal-Bench 2.1 y DeepresearchBII frente a los dos comparadores, y queda por detras de Qwen3.6-35B-A3B en AIME2026, Tau3-Bench y SWE-bench Multilingual, y por detras de Gemma4-26B-A4B en IFBench y AA.LCR. La principal diferencia estructural es el entrenamiento y la optimizacion sobre Ascend NPU, que lo posiciona como alternativa fuera del ecosistema CUDA.

## Limitaciones y advertencias

- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o alineacion en la informacion disponible.
- Alucinacion: no se publican tasas de alucinacion ni resultados en benchmarks de veracidad. Como en cualquier modelo generativo, el riesgo persiste, especialmente en tareas de investigacion profunda y sintesis de fuentes.
- Idiomas: la ficha de HuggingFace no declara idiomas soportados. El buen resultado en SWE-bench Multilingual se refiere a lenguajes de programacion, no a idiomas naturales. Se desconoce el comportamiento en castellano.
- Contexto: aunque se declara 256K extensible a 512K, el autor no publica resultados de degradacion por longitud (needle-in-a-haystack ni similares). Las evaluaciones de agente usan ventanas de 210K, no el maximo declarado.
- Precisión numérica: este repositorio es FP8. No se publican comparativas frente a la version BF16 del mismo modelo, por lo que el impacto de la cuantizacion en calidad no esta cuantificado.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion con atribucion y conservacion del aviso de licencia. No se declaran restricciones adicionales, pero conviene verificar la licencia del modelo base y de los datos de entrenamiento, no detallados.
- Procedencia de los pesos: el modelo es una publicacion reciente con 91 descargas; no hay evidencia de adopcion amplia ni de validacion independiente de los benchmarks reportados, que proceden del propio autor.
- Reproducibilidad: no se especifican tokens de entrenamiento, composicion del dataset ni metodo de alineacion, lo que dificulta auditar el modelo para despliegues regulados.
- Precaucion en produccion: al depender de `custom_code` en Transformers y de que el tokenizador y la plantilla de chat gestionen correctamente `enable_thinking`, conviene fijar versiones de las librerias y validar el formato de salida antes de integrarlo en un pipeline.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Repositorio GitHub del modelo: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio de la serie anterior (TeleChat): https://github.com/Tele-AI/TeleChat3
- Referencia arXiv incluida en los tags: https://arxiv.org/abs/2512.24157
- Referencia arXiv incluida en los tags: https://arxiv.org/abs/2507.18013
- Hilo de discusion en r/LocalLLaMA: https://www.reddit.com/r/LocalLLaMA/comments/1wimf5p/xingchenagixing4029ba4b_moe/
- Harness de evaluacion Claw-Eval: https://github.com/claw-eval/claw-eval
- Harness de evaluacion Tau-Bench: https://github.com/sierra-research/tau-bench
- vLLM: https://github.com/vllm-project/vllm
- SGLang: https://github.com/sgl-project/sglang
- KTransformers: https://github.com/kvcache-ai/ktransformers
