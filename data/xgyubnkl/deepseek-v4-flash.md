# XGYUBNKL/DeepSeek-V4-Flash

## Resumen

DeepSeek-V4-Flash es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek AI, presentado como la variante ligera de la familia DeepSeek-V4. Segun la model card, cuenta con 284B parametros totales y 13B parametros activos por token, y esta disenado especificamente para manejar contextos de hasta un millon de tokens de forma eficiente. El repositorio analizado (XGYUBNKL/DeepSeek-V4-Flash) es una redistribucion comunitaria del modelo oficial, con pesos en safetensors y un total de 290.944.616.402 parametros segun los metadatos reales del repositorio.

El modelo aborda el problema del coste computacional en contextos largos mediante una arquitectura de atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA). Segun el autor, esto reduce drasticamente los FLOPs de inferencia y el KV cache frente a generaciones anteriores. Incorpora ademas Manifold-Constrained Hyper-Connections (mHC) para estabilizar la propagacion de senales y fue entrenado con el optimizador Muon.

Es relevante ahora porque representa un paso hacia contextos de un millon de tokens en modelos abiertos con licencia MIT, lo que facilita su adopcion comercial e investigacion. La variante Flash busca un equilibrio entre coste de despliegue y capacidades de razonamiento, con un modo "Max" que, segun la model card, iguala en razonamiento al modelo Pro cuando se le concede un presupuesto de pensamiento mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion hibrida (CSA + HCA) y mHC |
| Parametros totales | 290.944.616.402 (284B segun model card) |
| Parametros activos | 13B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | FP4 + FP8 mixto (expertos MoE en FP4, resto en FP8); tag 8-bit/fp8 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash es un modelo MoE con 284B parametros totales y 13B activos. Su innovacion principal es la atencion hibrida que combina Compressed Sparse Attention (CSA) y Heavily Compressed Attention (HCA), disenada para mejorar la eficiencia en contextos largos. Segun la model card, en el escenario de 1M tokens el modelo Pro de la familia requiere solo el 27% de los FLOPs de inferencia por token y el 10% del KV cache en comparacion con DeepSeek-V3.2. Tambien incorpora Manifold-Constrained Hyper-Connections (mHC) para reforzar las conexiones residuales y estabilizar la propagacion de senales entre capas.

El preentrenamiento se realizo sobre mas de 32T tokens diversos y de alta calidad. El post-entrenamiento sigue un paradigma en dos etapas: primero se cultivan expertos especificos de dominio mediante SFT y RL con GRPO, y despues se consolidan en un unico modelo mediante destilacion on-policy. El entrenamiento emplea el optimizador Muon para una convergencia mas rapida y mayor estabilidad. La version distribuida en este repositorio usa precision mixta FP4 + FP8: los parametros de los expertos MoE en FP4 y la mayoria del resto en FP8.

## Capacidades

- Generacion de texto y razonamiento general, con modo de razonamiento extendido (variante Max con mayor presupuesto de pensamiento).
- Procesamiento de contextos de hasta un millon de tokens, orientado a tareas de contexto largo.
- Capacidades de codigo y tareas agenticas, segun los benchmarks reportados por el autor.
- Conocimiento multilingue: la model card reporta resultados en MMMLU, C-Eval y CMMLU, lo que sugiere cobertura multilingue (incluido chino), aunque la lista exacta de idiomas no esta disponible.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: mencionado como area de evaluacion (tareas agenticas), aunque sin detalle de implementacion.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Analisis de documentos extensos: el modelo puede procesar contratos, expedientes o informes de cientos de miles de tokens en una sola pasada gracias a su ventana de 1M tokens, evitando tecnicas de troceado y recuperacion.
- Revision de codigo en repositorios grandes: con contexto de un millon de tokens puede ingerir multiples ficheros y dependencias para detectar inconsistencias y proponer refactorizaciones.
- Investigacion y sintesis bibliografica: permite cargar corpus completos de articulos y generar resumenes o comparativas con trazabilidad dentro del propio contexto.
- Asistentes de razonamiento prolongado: el modo Max con mayor presupuesto de pensamiento es adecuado para tareas de matematicas y logica que requieren cadenas de razonamiento largas.
- Despliegue en infraestructura con presupuesto moderado: al tener solo 13B parametros activos, el coste por token es menor que el de modelos densos de tamano comparable, lo que lo hace apto para servicios de inferencia a escala con GPUs de alta gama.
- Procesamiento por lotes de datos no estructurados: clasificacion, extraccion y normalizacion de grandes volumenes de texto con contexto largo y precision mixta FP4/FP8 para reducir requisitos de memoria.
- Evaluacion comparativa de modelos: util como referencia abierta con licencia MIT para experimentos academicos y benchmarks reproducibles.

## Benchmarks y rendimiento

Resultados reportados en la model card para los modelos base (no para la variante instruct/Flash distribuida en este repositorio):

| Benchmark (metrica) | Shots | DeepSeek-V3.2-Base | DeepSeek-V4-Flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---|---|---|
| Parametros activos | - | 37B | 13B | 49B |
| Parametros totales | - | 671B | 284B | 1.6T |
| AGIEval (EM) | 0-shot | 80,1 | 82,6 | 83,1 |
| MMLU (EM) | 5-shot | 87,8 | 88,7 | 90,1 |
| MMLU-Redux (EM) | 5-shot | 87,5 | 89,4 | 90,8 |
| MMLU-Pro (EM) | 5-shot | 65,5 | 68,3 | 73,5 |
| MMMLU (EM) | 5-shot | 87,9 | 88,8 | 90,3 |
| C-Eval (EM) | 5-shot | 90,4 | 92,1 | 93,1 |
| CMMLU (EM) | 5-shot | 88,9 | 90,4 | 90,8 |

No se han publicado en la informacion disponible resultados de benchmarks para la variante instruct (DeepSeek-V4-Flash) ni para el repositorio comunitario XGYUBNKL/DeepSeek-V4-Flash.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 159,6 GB en safetensors (precision mixta FP4/FP8). Para cargar los pesos completos se necesita al menos esa cantidad de memoria agregada, lo que exige multiples GPUs o memoria unificada de gran capacidad.
- GPU recomendadas: H100 80GB o A100 80GB en configuracion multi-GPU; el modelo no cabe en una sola GPU consumer.
- Cabe en consumer GPU: no en configuracion completa. Solo seria viable con cuantizaciones adicionales muy agresivas y distribucion en varias GPUs, algo no documentado en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles. La model card indica que la arquitectura hibrida reduce FLOPs y KV cache en contextos de 1M tokens, pero no se aportan cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash | 284B | 13B | 1M | MIT | Hugging Face (oficial y redistribuciones) |
| DeepSeek-V4-Pro | 1.6T | 49B | 1M | MIT | Hugging Face |
| DeepSeek-V3.2 | 671B | 37B | no disponible | no disponible | Hugging Face |

En los benchmarks base reportados, DeepSeek-V4-Flash-Base supera a DeepSeek-V3.2-Base en MMLU (88,7 frente a 87,8), MMLU-Pro (68,3 frente a 65,5) y C-Eval (92,1 frente a 90,4), con menos parametros activos (13B frente a 37B). Queda por detras de DeepSeek-V4-Pro-Base en todas las metricas mostradas.

## Limitaciones y advertencias

- El repositorio analizado (XGYUBNKL/DeepSeek-V4-Flash) es una redistribucion no oficial con 0 descargas y 0 likes; no hay garantia de integridad ni de correspondencia exacta con los pesos oficiales de DeepSeek AI.
- La model card no detalla sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se aportan metricas de factualidad.
- La lista de idiomas soportados no esta disponible, aunque los benchmarks incluyen pruebas en chino e ingles.
- El soporte de tool calling y function calling no esta confirmado en la informacion disponible.
- La licencia es MIT, lo que permite uso comercial, pero conviene verificar los terminos del repositorio oficial antes de desplegar en produccion.
- El modelo requiere infraestructura multi-GPU de alta gama; no es viable en hardware consumer.
- Los benchmarks disponibles corresponden a las variantes base, no a la variante instruct distribuida en este repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/XGYUBNKL/DeepSeek-V4-Flash
- Modelo oficial DeepSeek-V4-Flash: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
- Modelo oficial DeepSeek-V4-Flash-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-Base
- Modelo oficial DeepSeek-V4-Pro: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro
- Modelo oficial DeepSeek-V4-Pro-Base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-Base
- ModelScope DeepSeek-V4-Flash: https://modelscope.cn/models/deepseek-ai/DeepSeek-V4-Flash
- Informe tecnico (arXiv): https://arxiv.org/abs/2606.19348
- Pagina de DeepSeek: https://www.deepseek.com/
- Chat DeepSeek: https://chat.deepseek.com/
- Organizacion en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai
