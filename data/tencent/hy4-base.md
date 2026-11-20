# tencent/Hy4-base

## Resumen

Hy4-base es el modelo base (pretrained) de la familia Hy4 del equipo Tencent Hy, un modelo multimodal de tipo Mixture-of-Experts (MoE) que procesa texto, imagenes y video. El backbone de lenguaje cuenta con 770B parametros totales de los que se activan 49B por token, distribuidos en 78 capas (una densa y 77 MoE), con 256 expertos enrutados y 1 experto compartido por capa, activando los top-8 expertos por token. A esto se suma un codificador visual ViT de 1.23B parametros y un drafter DFly2 de 3.3B integrado para decodificacion especulativa.

La innovacion arquitectonica principal es la atencion Gated DeepSeek Sparse Attention (Gated DSA) con IndexCache, que reutiliza indices dispersos entre capas, junto con conexiones residuales iHC (identity Hyper-Connections) con 4 flujos residuales. El modelo soporta una longitud de contexto de 1M tokens (1.048.576), lo que lo situa en la categoria de modelos de contexto ultralargo orientados a agentes y tareas de horizonte largo.

Es relevante ahora porque representa la apuesta de Tencent por un modelo abierto (bajo licencia propia Tencent Hy) de escala frontera con vision integrada, decodificacion especulativa nativa y un enfoque explicito hacia casos de uso de computer use, desarrollo frontend, flujos financieros y asistentes personales de larga duracion. Al ser un modelo base, esta pensado como punto de partida para fine-tuning y evaluacion, no como asistente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con ViT y drafter DFly2 |
| Parametros totales | 770B (backbone de lenguaje, excluyendo ViT, adaptador y DFly2); 771.142.535.581 segun safetensors |
| Parametros activos | 49B texto + 1.23B vision por token |
| Longitud de contexto | 1M (1.048.576 tokens) |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (existe repo GGUF de terceros: AngelSlim/Hy4-GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Tencent Hy License (license_name: tencent-hy-license) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El backbone de lenguaje tiene 78 capas con hidden size de 6.144 y vocabulario de 120.832 tokens. La primera capa usa una FFN densa con tamano intermedio 18.432; las 77 restantes son capas MoE con 256 expertos enrutados (tamano intermedio 2.048) y 1 experto compartido, activando top-8 expertos enrutados mas el compartido por token. El modulo de atencion emplea Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank 2.048 y kv_lora_rank 512, envuelto en Gated DeepSeek Sparse Attention con un indexador de 32 cabezas de dimension 128 que selecciona los top-2.048 tokens de contexto. IndexCache permite reutilizar los indices dispersos entre capas para reducir coste. Las conexiones residuales usan iHC con 4 flujos.

El codificador visual es un ViT de 40 capas, hidden size 1.536, tamano intermedio 6.144 y 16 cabezas, con patches de 16x16, embeddings posicionales de 128x128 y merging de caracteristicas 2x2; un adaptador convierte las caracteristicas de imagen y fotogramas de video en tokens visuales. El drafter DFly2 (5 capas, 3.3B parametros) reutiliza la KV cache y los indices dispersos de Hy4 para decodificacion especulativa de bajo coste constante en contexto largo. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; al tratarse de un modelo base, cabe esperar entrenamiento de preentrenamiento sin alineamiento posterior, pero este extremo no esta confirmado en la documentacion facilitada.

## Capacidades

- Comprension de texto, imagen y video de forma nativa (pipeline image-text-to-text).
- Razonamiento y conocimiento general a nivel de modelo base, con resultados few-shot en MMLU y MMLU-Pro.
- Procesamiento de contexto ultralargo de hasta 1M tokens.
- Computer use y comprension de interfaces visuales (seccion dedicada en la model card).
- Desarrollo frontend y de videojuegos (caso de uso destacado por el autor).
- Flujos financieros y de oficina (caso de uso destacado por el autor).
- Investigacion cientifica e I+D en IA (caso de uso destacado por el autor).
- Asistente personal de horizonte largo (caso de uso destacado por el autor).
- Decodificacion especulativa integrada mediante DFly2.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.

## Casos de uso

- Computer use y automatizacion de interfaces: el modelo puede interpretar capturas de pantalla y comprender elementos de UI gracias a su ViT de resolucion dinamica, lo que permite construir agentes que operan aplicaciones web o de escritorio.
- Desarrollo frontend asistido: con 1M tokens de contexto puede ingerir repositorios completos, hojas de estilo y documentacion de componentes para generar o refactorizar interfaces coherentes con el proyecto.
- Analisis de documentos financieros extensos: informes anuales, estados financieros y transcripciones de llamadas de resultados caben en la ventana de contexto, permitiendo extraccion y resumen con trazabilidad sobre el documento completo.
- Investigacion cientifica y R&D: lectura de papers, revision de literatura y analisis de figuras y tablas mediante el codificador visual, util para sintesis de evidencia y generacion de hipotesis.
- Asistentes personales de larga duracion: al mantener hasta 1M tokens de historial, puede sostener conversaciones multi-sesion con memoria de contexto amplia sin recuperacion externa.
- Procesamiento de video para supervision y analisis: el adaptador convierte fotogramas en tokens visuales, habilitando resumen de grabaciones, deteccion de eventos y descripcion de escenas.
- Base para fine-tuning especializado: al ser un modelo base, sirve como punto de partida para adaptar dominio (legal, medico, industrial) con datos propios.
- Generacion de codigo en pipelines: su rendimiento en benchmarks de codigo y agente (evaluado via BPB interno) lo hace candidato para tareas de completado y refactorizacion, aunque requiere validacion en produccion.

## Benchmarks y rendimiento

Resultados few-shot de preentrenamiento publicados en la model card (modelo base, no Instruct):

| Categoria | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU† | 5 | 91.6 | 88.7 | 87.5 | 89.7 | 91.1 |
| Conocimiento | MMLU-Pro† | 5 | 73.9 | 71.1 | 65.8 | 68.6 | 73.4 |
| Conocimiento | MMLU (resto) | 5 | no disponible | no disponible | no disponible | no disponible | no disponible |

El resto de filas de la tabla de benchmarks no esta incluido en la informacion proporcionada. Ademas se reporta una grafica interna de bits-per-byte (BPB) sobre validacion de codigo y agente (menor es mejor) frente a parametros activos, sin cifras numericas en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 770B parametros en BF16 requiere del orden de 1,5 TB de memoria, por lo que la inferencia en precision completa exige multiples nodos multi-GPU.
- GPU recomendadas: no se especifican en la informacion proporcionada; por escala, se requiere hardware de centro de datos (familias H100/H200/B200 o equivalentes) en configuracion multi-nodo.
- Cabe en GPU de consumo: no en precision completa ni en cuantizaciones de 8 bits. Existe un repo GGUF de terceros (AngelSlim/Hy4-GGUF) que podria permitir cuantizaciones agresivas, pero no se dispone de datos de VRAM ni de calidad para esas variantes.
- Opciones de despliegue: la model card documenta vLLM y SGLang, ademas de DFly2 para decodificacion especulativa y una seccion de cuantizacion. No se mencionan llama.cpp ni Ollama como soportados oficialmente.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | MMLU (5-shot) | MMLU-Pro (5-shot) | Licencia |
|---|---|---:|---|---:|---:|---|
| Hy4 Base | 770B (MoE) | 49B texto + 1.23B vision | 1M | 91.6 | 73.9 | Tencent Hy License |
| DeepSeek-V4-Pro-Base | no disponible | no disponible | no disponible | 91.1 | 73.4 | no disponible |
| DeepSeek-V4-flash-Base | no disponible | no disponible | no disponible | 89.7 | 68.6 | no disponible |
| Hy4 flash Base | no disponible | no disponible | no disponible | 88.7 | 71.1 | Tencent Hy License |
| Hy3 preview Base | no disponible | no disponible | no disponible | 87.5 | 65.8 | Tencent Hy License |

Hy4 Base supera ligeramente a DeepSeek-V4-Pro-Base en MMLU (91.6 frente a 91.1) y MMLU-Pro (73.9 frente a 73.4), y de forma mas amplia a las variantes flash y a Hy3 preview. No se dispone de datos de parametros, contexto ni licencia de los modelos DeepSeek comparados en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo base (pretrained), no un modelo alineado para instrucciones: no cabe esperar comportamiento conversacional fiable sin fine-tuning o post-entrenamiento.
- Riesgo de alucinacion inherente a modelos de lenguaje de gran escala; no se documentan tasas de alucinacion.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Idiomas soportados: no disponibles; la model card esta en chino e ingles, pero no se confirma cobertura multilingue.
- Licencia Tencent Hy License (license: other): es una licencia propia, no OSI; es imprescindible revisar los terminos en el archivo LICENSE antes de cualquier uso comercial, ya que puede incluir restricciones de uso, atribucion o limites de usuarios mensuales.
- El coste de despliegue es muy elevado (770B parametros, repo de 1.542,4 GB), lo que limita su uso a infraestructura de centro de datos.
- Soporte de tool calling y agentes no confirmado en la informacion disponible para la variante base.
- Los benchmarks publicados son few-shot sobre el modelo base y no reflejan rendimiento como asistente.
- La fecha de creacion del modelo (2026-11-18) y las referencias a DeepSeek-V4 y Hy3 preview indican que la informacion puede corresponder a un contexto temporal no estandar; verificar siempre contra la model card oficial.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4-base
- Licencia: https://huggingface.co/tencent/Hy4-base/blob/main/LICENSE
- Model card en chino: https://huggingface.co/tencent/Hy4-base/blob/main/README_CN.md
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy4
- GGUF (terceros): https://huggingface.co/AngelSlim/Hy4-GGUF
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Articulo sobre iHC (identity Hyper-Connections): https://zhuanlan.zhihu.com/p/2010852389670908320
