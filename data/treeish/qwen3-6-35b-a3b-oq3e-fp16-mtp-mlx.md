# treeish/Qwen3.6-35B-A3B-oQ3e-FP16-MTP-MLX

## Resumen

Qwen3.6-35B-A3B-oQ3e-FP16-MTP-MLX es un paquete de pesos cuantizados en formato MLX safetensors publicado por el usuario treeish. No es un modelo entrenado desde cero: es una variante derivada del modelo base Qwen/Qwen3.6-35B-A3B, una arquitectura de mezcla de expertos (MoE, etiqueta `qwen3_5_moe`) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token. El paquete ocupa 17,2 GB e incluye 2.052 tensores indexados, 42 de ellos pertenecientes a una cabeza de predicción multi-token (MTP) embebida bajo `language_model.mtp.*`.

La particularidad de esta ficha es que se trata del hermano en precisión FP16 del paquete treeish/Qwen3.6-35B-A3B-oQ3e-MTP-MLX, que almacena los tensores residuales en BF16. La conversión sustituye únicamente la precisión de almacenamiento de los tensores que estaban en BF16 (1.569 tensores convertidos, 483 preservados, incluidos los empaquetados de cuantización), con el objetivo de evitar la dependencia de aritmética BF16 en Macs con chip M1 y M2. En Macs M3 o posteriores el autor recomienda usar el paquete BF16 original. Conviene subrayar que el cambio de precisión no reduce el espacio en disco ni el consumo de memoria, que siguen siendo esencialmente los mismos 17,2 GB.

El interés de esta publicación es práctico: permite ejecutar un MoE de 35B parámetros con ventana de contexto de 262.144 tokens en hardware Apple Silicon de gama alta pero no profesional, mediante el runtime MLX Swift que el autor mantiene fijado. La licencia es Apache 2.0, heredada del modelo base. En el momento de redactar esta ficha el paquete no registra descargas ni valoraciones, y el benchmark de release del autor todavía no se ha ejecutado sobre esta variante, por lo que no existen cifras de rendimiento publicadas para este paquete concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer, etiqueta `qwen3_5_moe`; incluye torre de vision y una capa MTP embebida |
| Parametros totales | 35.951.822.704 (35,95 B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ3e con `imatrix` y precision mixta: 3 bits afin por defecto con group size 64; overrides por tensor a 5, 6 y 8 bits con group sizes 64 y 128; residual en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (2.052 tensores indexados, 42 de ellos MTP) |
| Autor | treeish |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Paquete de origen | treeish/Qwen3.6-35B-A3B-oQ3e-MTP-LX (commit `85dd79d1f9169cf5c7c7c63e4fb2658680e1ed8c`) |
| Tamano del repositorio | 17,2 GB |
| Libreria de inferencia | MLX (version 0.29.3 usada en la conversion) |
| Pipeline declarado | image-text-to-text |
| Cabeza MTP | 1 capa embebida bajo `language_model.mtp.*` |
| Precisión residual | FP16 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer con mezcla de expertos (MoE) de 35,95 B de parámetros totales y unos 3 B activos, al que se añade una torre de visión (333 tensores que en esta conversión pasan a FP16) y una capa de predicción multi-token embebida. Esta capa MTP es la que permite plantear decodificación especulativa o generación de varios tokens por paso dentro del propio paquete, sin depender de un modelo borrador externo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo base recibió RLHF, DPO u otro tipo de ajuste; esos datos corresponderían a la model card de Qwen/Qwen3.6-35B-A3B y no se han proporcionado.

Lo que sí documenta el autor con detalle es el proceso de conversión, que no es un entrenamiento. Partiendo del paquete oQ3e en BF16, se aplicó la política de "hermano de precisión FP16" del repositorio youssofal/MTPLX (commit `21be78b3f51820eecef020e5e4855c0715eaf9a5`) usando MLX 0.29.3: se convirtieron a FP16 los 1.569 tensores que estaban en BF16, se preservaron los 483 tensores no BF16 (incluidos los tensores cuantizados empaquetados) y se copiaron byte a byte los metadatos y ficheros no de pesos. De los 42 tensores MTP, 31 pasaron a FP16 y 11 empaquetados se conservaron. Cada tensor de salida se comparó con el valor esperado, y el manifiesto `FP16_CONVERSION_MANIFEST.json` registra tipo, forma y digests de origen y destino de cada uno. La innovación técnica relevante no está, por tanto, en el modelo, sino en el empaquetado: cuantización mixta guiada por `imatrix` con overrides por tensor, cabeza MTP integrada y compatibilidad con una plantilla de chat corregida (atribuida a Froggeric).

## Capacidades

- Generación de texto y diálogo conversacional, según la etiqueta `conversational` del paquete.
- Procesamiento multimodal de imagen y texto: el pipeline declarado es `image-text-to-text` y el paquete conserva una torre de visión completa de 333 tensores.
- Predicción multi-token mediante la capa MTP embebida, orientada a acelerar la generación con decodificación especulativa.
- Manejo de contextos muy largos, hasta 262.144 tokens, lo que habilita tareas de documento completo sin fragmentación agresiva.
- Ejecución local en Apple Silicon mediante MLX en formato safetensors, con cuantización mixta de 3 bits por defecto y capas seleccionadas en 5, 6 y 8 bits.
- Inclusión de plantilla de chat corregida y tokenizador en el propio paquete.
- Soporte de tool calling o function calling: no disponible en la información proporcionada.
- Soporte de agentes o razonamiento multi-paso explícito: no disponible en la información proporcionada.
- Capacidades multilingües concretas: no disponible; el paquete no declara lista de idiomas.
- Modo "thinking" u otros modos especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Mac con chip M1 o M2: el paquete está diseñado específicamente para estos chips, donde el hermano BF16 dependería de aritmética que el hardware no optimiza. Se ejecutaría desde el runtime MLX Swift fijado por el autor, con 32 GB de memoria unificada como mínimo práctico.
- Análisis de documentos extensos: gracias a los 262.144 tokens de contexto, se pueden procesar informes, expedientes o bases de código completas en una sola pasada, sin trocear el contenido ni perder coherencia entre secciones.
- Asistentes multimodales de escritorio: al ser un modelo image-text-to-text, permite construir aplicaciones macOS que reciben una captura o una imagen junto a una pregunta y devuelven una respuesta textual, todo en local y sin enviar datos a un servicio externo.
- aceleración de la generación mediante MTP: la capa de predicción multi-token embebida permite plantear decodificación especulativa dentro del mismo paquete, útil cuando la latencia por token es el cuello de botella en una aplicación interactiva.
- Investigación sobre cuantización: el paquete es un caso de estudio reproducible de cuantización mixta con `imatrix` (3 bits por defecto más overrides a 5, 6 y 8 bits), con manifiestos que registran digests y tipos de cada tensor, lo que facilita medir el impacto de la cuantización frente al hermano BF16.
- Prototipado de producto en entorno Apple: startups o equipos que desarrollan para macOS pueden integrar el modelo en una app nativa vía MLX Swift sin depender de CUDA ni de infraestructura en nube.
- Evaluación comparativa de precisión: comparar esta variante FP16 con el hermano BF16 sobre el mismo hardware permite aislar el efecto de la precisión residual en tareas concretas, siempre que el equipo disponga de ambos entornos.
- Procesamiento por lotes en estación de trabajo de gama alta: con 48 GB de memoria unificada recomendados, se pueden encadenar tareas de resumen, extracción y clasificación sobre lotes de documentos largos durante la noche.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card indica explícitamente que el benchmark de release de Treeish todavía no se ha ejecutado sobre este paquete, y que `RELEASE_MANIFEST.json` registra ese estado. La búsqueda web realizada no devolvió ningún resultado técnico relacionado con el modelo (los resultados obtenidos correspondían a páginas sin relación alguna con el tema). Por tanto, no se dispone de cifras de MMLU, HumanEval, GSM8K ni de ninguna otra métrica para este paquete ni para su hermano BF16.

| Metrica | Resultado |
|---|---|
| Benchmarks publicados | No ejecutados / no disponibles |
| Latencia medida | no disponible |
| Throughput medido | no disponible |

## Requisitos de hardware

- Huella en disco y memoria: 17,2 GB, idéntica a la del hermano BF16, ya que la conversión solo cambia la precisión de almacenamiento de los tensores residuales y no reduce la cuantización ni el número de parámetros activos.
- Memoria unificada: el autor usa el modelo desde 32 GB y recomienda 48 GB. El margen disponible depende de la longitud de contexto efectiva, la configuración de caché y las demás aplicaciones abiertas.
- Chips compatibles: esta variante FP16 está pensada para M1 y M2. En M3 o posteriores el autor recomienda el paquete BF16 original.
- GPU dedicadas (A100, H100, RTX 4090, etc.): no disponible. El paquete está en formato MLX safetensors y no se documenta su uso en CUDA.
- Opciones de despliegue: runtime MLX Swift fijado por Treeish. Cualquier otro runtime debe soportar los overrides de cuantización por tensor definidos en `config.json` y el layout MTP embebido de Qwen. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.
- El paquete no contiene código ejecutable propio; solo pesos, tokenizador, plantilla de chat y ficheros de manifiesto con tamaños, digests SHA-256 y revisiones de origen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion / precision | Licencia | Orientacion |
|---|---|---|---|---|---|
| treeish/Qwen3.6-35B-A3B-oQ3e-FP16-MTP-MLX | 35,95 B totales, ~3 B activos | 262.144 tokens | oQ3e mixta (3 bits por defecto) con residual FP16 | Apache 2.0 | Macs M1 y M2 |
| treeish/Qwen3.6-35B-A3B-oQ3e-MTP-MLX (hermano) | 35,95 B totales, ~3 B activos | 262.144 tokens | oQ3e mixta (3 bits por defecto) con residual BF16 | Apache 2.0 | Macs M3 y posteriores |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35 B totales, ~3 B activos | no disponible en la informacion proporcionada | Pesos originales sin cuantizar | Apache 2.0 | Entrenamiento y ajuste |

Ambos paquetes derivados ocupan los mismos 17,2 GB y declaran idéntica cuantización y contexto; la única diferencia documentada es la precisión residual (FP16 frente a BF16) y el chip objetivo. No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (MoE de ~35 B con capacidades multimodales y contexto de 262k), por lo que no se incluyen alternativas de terceros.

## Limitaciones y advertencias

- La cuantización intercambia calidad del modelo por consumo de memoria y velocidad de generación local. El propio autor lo advierte en la model card.
- Esta variante FP16 no reduce el espacio en disco ni la memoria respecto al hermano BF16, como aclara explícitamente el autor; solo cambia la precisión residual. No debe elegirse esperando un ahorro de recursos.
- El benchmark de release no se ha ejecutado sobre este paquete, de modo que no existe ninguna validación publicada de su comportamiento real en tareas concretas.
- Compatibilidad de runtime muy restringida: está construido para el runtime MLX Swift fijado por Treeish. Otro runtime necesita soportar los overrides de cuantización por tensor de `config.json` y el layout MTP embebido; de lo contrario, la carga puede fallar o dar resultados incorrectos.
- Idiomas soportados: no disponible. No se puede asumir un rendimiento homogéneo entre lenguas, ni siquiera en castellano, sin evaluación previa.
- Riesgo de alucinación: no se documenta ninguna evaluación específica de fidelidad factual para este paquete. Al ser un modelo generativo cuantizado a 3 bits por defecto, la degradación respecto a los pesos originales es plausible, aunque no medida.
- Sesgos conocidos: no disponible. No hay información sobre evaluación de sesgos en el paquete ni en la documentación aportada.
- Licencia: Apache 2.0, heredada de Qwen3.6-35B-A3B, por lo que permite uso comercial. El texto completo se incluye en `LICENSE`. La plantilla Froggeric y MTPLX también declaran Apache 2.0 y el autor mantiene la atribución, que debe conservarse.
- Validación comunitaria nula por el momento: 0 descargas y 0 likes. No hay evidencia de uso en producción por terceros.
- El paquete no incluye código ejecutable, lo que reduce el riesgo de ejecución arbitraria, pero obliga a confiar en los manifiestos de integridad (`RELEASE_MANIFEST.json` y `FP16_CONVERSION_MANIFEST.json`) y en la revisión de origen fijada.
- El contexto de 262.144 tokens tiene un coste de memoria proporcional en la caché KV; el margen real sobre 32 GB o 48 GB depende de la longitud efectiva usada.

## Enlaces

- Paquete en HuggingFace: https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ3e-FP16-MTP-MLX
- Paquete hermano en BF16 (origen de la conversión): https://huggingface.co/treeish/Qwen3.6-35B-A3B-oQ3e-MTP-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Repositorio MTPLX (política de precisión FP16): https://github.com/youssofal/MTPLX
- Nota sobre la búsqueda web: los resultados obtenidos no guardan relación con el modelo y no se han incluido. No se han localizado papers, blogs, repositorios adicionales ni demos asociados a este paquete.
