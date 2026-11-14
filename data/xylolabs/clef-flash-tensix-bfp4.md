# Xylolabs/clef-flash-Tensix-BFP4

## Resumen

Clef-Flash para Tenstorrent Tensix (BFP4) es un export cuantizado del modelo base Cloudflare/clef-flash, empaquetado por Xylolabs. No es un modelo generativo de texto: se trata de un modelo de decisión que, dada una representación estructurada de estado y un conjunto de preguntas con opciones permitidas, devuelve una distribución de probabilidad por cada opción en una única pasada forward. El pipeline declarado es text-classification y la tarea cualificada por el autor es la inferencia de decisión solo texto.

El modelo conserva la arquitectura del base (etiquetado como qwen3_5 en los tags de Hugging Face) con proyecciones de atención, DeltaNet y MLP cuantizadas a BFP4 mediante GPTQ simple, mientras que la cabeza de esquema conjunto (joint schema head), la tabla léxica, los embeddings de entrada, las normas y el codificador de visión permanecen en BF16 sin cambios. El resultado es un artefacto de aproximadamente 9.410 millones de parámetros y 19,1 GB de repositorio, pensado para ejecutarse sobre hardware Tenstorrent Tensix mediante TT-NN y tt-metal.

Su relevancia es doble: por un lado demuestra un flujo de cuantización de bloque (block floating point) orientado a aceleradores Tenstorrent, con verificación de las 248 proyecciones cuantizadas frente al simulador Blackhole; por otro, ejemplifica un patrón de modelo de decisión con evaluación de todas las opciones en un solo forward pass, útil para clasificación estructurada y enrutamiento sin generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con proyecciones de atención, DeltaNet y MLP (base etiquetada como qwen3_5); cabeza de esquema conjunto y tabla léxica BF16 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso, GPTQ simple con damping 0,1, sin búsqueda de exponente) en proyecciones de atención, DeltaNet y MLP; BF16 en el resto de tensores |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como BF16 sobre rejillas de bloque flotante); incluye quant4.json y pack_tensix.py para empaquetado nativo TT-NN |

## Arquitectura y entrenamiento

El modelo parte de Cloudflare/clef-flash y mantiene su estructura: un backbone transformer con proyecciones de atención, capas DeltaNet y bloques MLP, más una cabeza de esquema conjunto que puntúa opciones discretas y una tabla léxica original. La innovación del export es la cuantización BFP4 de las 248 proyecciones del backbone mediante GPTQ simple con damping 0,1, calibrada con 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los valores cuantizados se almacenan como BF16 sobre sus rejillas de bloque flotante, por lo que el archivo resulta mayor que los pesos empaquetados; el autor estima unos 9,12 GB de memoria de dispositivo solo para backbone retenido, cabeza conjunta y tabla léxica, más espacio para caché KV y buffers.

No se detallan en la información disponible el número de tokens de entrenamiento del modelo base, la composición de su dataset ni si hubo fases de RLHF o DPO. La verificación técnica del export cubre las 248 proyecciones cuantizadas frente a la comprobación de rejilla, el empaquetado nativo TT-NN y la conversión a BFP8, probado con TT-NN 0.81.1 y el simulador Blackhole; el ejemplo de quickstart también pasa. tt-transformers y tt-forge no fueron comprobados con este paquete.

## Capacidades

- Decisión estructurada: devuelve una puntuación por cada opción permitida de una pregunta, sin generar texto.
- Soporte de preguntas de tipo elección (choice) y de tipo noul (pregunta binaria sí/no) mediante el esquema de preguntas del registro de entrada.
- Evaluación de todas las opciones en una única pasada forward, con softmax sobre los logits por pregunta.
- Procesamiento de estado estructurado anidado (por ejemplo, facturas con campos de proveedor, importe, moneda y estado).
- Capacidades multilingües limitadas a inglés y coreano según la model card.
- Pesos de visión retenidos del modelo base, aunque las entradas de imagen y vídeo no fueron verificadas en este export; la tarea cualificada es solo texto.
- Integración con Transformers 5.23.0 y PyTorch sobre CUDA, con código personalizado (joint_schema_model) para carga y codificación de registros.
- Despliegue en hardware Tenstorrent Tensix mediante TT-NN, con layouts [in, out] para las proyecciones cuantizadas.

## Casos de uso

- Clasificación de documentos financieros: a partir de un estado estructurado de factura, el modelo puntúa opciones como pagada, vencida o borrador en una sola pasada, lo que permite automatizar el triaje de cuentas por cobrar sin generar texto libre.
- Enrutamiento de tickets de soporte: dado un registro con el estado de la incidencia y preguntas de elección sobre categoría o prioridad, el modelo devuelve distribuciones por opción que pueden alimentar un sistema de asignación automática.
- Validación de reglas de negocio: preguntas de tipo noul (por ejemplo, si el importe supera un umbral) permiten convertir reglas condicionales en decisiones probabilísticas auditables con umbral configurable.
- Extracción de decisiones en pipelines ETL: el modelo puede actuar como etapa de clasificación por lotes sobre registros estructurados, sustituyendo heurísticas frágiles por puntuaciones calibradas por opción.
- Moderación y etiquetado semiautomático: con preguntas de elección sobre el estado de un contenido, el modelo ofrece probabilidades por etiqueta que un revisor humano puede confirmar, reduciendo el coste de anotación.
- Despliegue en aceleradores Tenstorrent: el export está pensado para entornos con hardware Tensix, donde el empaquetado BFP4 y el layout TT-NN permiten ejecutar la inferencia de decisión en DRAM del dispositivo con verificación de rejilla incluida.
- Evaluación comparativa de cuantización: sirve como referencia para medir la degradación de un backbone BF16 frente a su versión BFP4 en tareas de decisión, usando el perfil de evaluación de la model card.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial con perfiles de decisión. Los datos disponibles son:

| Perfil de decisión | KL media de distribución por opción | Etiquetas correctas / 40 | Elementos etiquetados perdidos |
|---|---:|---:|---:|
| Backbone y cabeza BF16 originales | 0 | 34 | 0 |
| Este export con cabeza BF16 original y tabla léxica | no disponible (texto truncado en la información) | no disponible | no disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo estimada: unos 9,12 GB solo para backbone retenido, cabeza conjunta y tabla léxica, más caché KV y buffers adicionales.
- GPU recomendadas: no se especifican modelos concretos; el quickstart requiere una GPU CUDA con memoria suficiente para los valores BF16 del archivo, lo que en la práctica apunta a tarjetas de 24 GB o más.
- Cabe en GPU de consumo: no confirmado; el tamaño del repositorio (19,1 GB) y la estimación de memoria sugieren que una RTX 4090 de 24 GB podría ser ajustada, pero no hay datos publicados al respecto.
- Aceleradores objetivo: Tenstorrent Tensix con TT-NN 0.81.1 y tt-metal; verificado con el simulador Blackhole.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch y código personalizado (joint_schema_model); TT-NN para empaquetado y ejecución en Tensix; scripts pack_tensix.py y verify_grid.py para comprobación de pesos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xylolabs/clef-flash-Tensix-BFP4 | 9.409.813.744 | no disponible | Decisión/clasificación estructurada | apache-2.0 | Hugging Face, orientado a Tensix |
| Cloudflare/clef-flash (base) | no disponible | no disponible | Decisión/clasificación estructurada | no disponible en la información | Hugging Face |
| Alternativas generativas de tamaño similar | no disponible | no disponible | Generación de texto | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada; la comparación directa más relevante es con el modelo base Cloudflare/clef-flash, del que este export es una versión cuantizada.

## Limitaciones y advertencias

- El modelo no genera texto: solo devuelve puntuaciones por opción; no debe emplearse en tareas de generación abierta.
- La tarea cualificada es exclusivamente decisión de solo texto; las entradas de imagen y vídeo no fueron verificadas aunque los pesos de visión se conserven.
- Idiomas soportados limitados a inglés y coreano; no hay evidencia de rendimiento en castellano.
- La cuantización BFP4 introduce degradación respecto al backbone BF16; la tabla de evaluación de la model card está truncada en la información disponible, por lo que no puede cuantificarse la pérdida completa.
- El archivo almacena valores cuantizados como BF16 sobre rejillas de bloque flotante, lo que aumenta el tamaño del repositorio y la memoria necesaria en comparación con pesos empaquetados.
- Los helpers incluidos verifican la representación de pesos, pero no proporcionan un runner completo de decisión para Tensix.
- tt-transformers y tt-forge no fueron comprobados con este paquete.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de calibración incorrecta de probabilidades si el estado de entrada difiere de la distribución de calibración.
- Licencia apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Cloudflare/clef-flash, cuya licencia no se detalla en la información disponible.
- No se han publicado datos de sesgos, robustez ni evaluación en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clef-flash-Tensix-BFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del export: https://huggingface.co/Xylolabs/clef-flash-Tensix-BFP4/blob/main/LICENSE
