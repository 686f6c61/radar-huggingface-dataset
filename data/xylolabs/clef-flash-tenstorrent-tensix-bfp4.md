# Xylolabs/clef-flash-Tenstorrent-Tensix-BFP4

## Resumen

Clef-Flash para Tenstorrent Tensix (BFP4) es una exportación cuantizada del modelo de decisión Cloudflare/clef-flash, empaquetada por Xylolabs para su despliegue sobre aceleradores Tenstorrent con el stack tt-metal/ttnn. No es un modelo generativo de texto: devuelve una distribución de probabilidad por cada opción permitida de una consulta estructurada, evaluando todas las alternativas en un único forward pass. El backbone, las proyecciones de atención, DeltaNet y MLP se almacenan en BFP4 (block floating point, 4,5 bits por peso) mediante GPTQ plano, mientras que la cabeza de esquema conjunta, la tabla léxica original, los embeddings de entrada, las normas y el codificador de visión se mantienen en BF16.

El modelo hereda la arquitectura del base Qwen3.5 con 9.409.813.744 parámetros totales y una ventana de contexto que no se detalla en la información disponible. Su relevancia actual radica en dos frentes: por un lado, demuestra una ruta práctica de cuantización de bajo bit ancho (BFP4) validada contra el emulador Blackhole y el empaquetado nativo de TT-NN; por otro, ofrece un formato de "modelo de decisión" orientado a tareas de clasificación y selección entre opciones con esquemas declarativos, un patrón útil para pipelines de agentes donde no se quiere generar texto libre sino puntuar alternativas.

La licencia es Apache 2.0 y los idiomas declarados son inglés y coreano. El repositorio ocupa 19,1 GB, aunque el peso retenido del backbone, la cabeza conjunta y la tabla léxica requiere aproximadamente 9,12 GB de memoria de dispositivo, más espacio para KV cache y buffers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención, capas DeltaNet y MLP (base Qwen3.5), cabeza de esquema conjunta y tabla léxica |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (bfloat4_b, 4,5 bits por peso, GPTQ plano con damping 0,1) en proyecciones de atención, DeltaNet y MLP; BF16 en el resto de tensores |
| Idiomas soportados | en, ko |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (valores cuantizados almacenados como BF16 sobre rejillas block-floating); requiere código personalizado (`joint_schema_model`) |

## Arquitectura y entrenamiento

El modelo parte de Cloudflare/clef-flash, un transformer con proyecciones de atención, capas DeltaNet y MLP, al que se añade una cabeza de esquema conjunta (joint schema head) y una tabla léxica de lenguaje. La exportación de Xylolabs no reentrena el modelo: aplica GPTQ plano sobre las proyecciones de atención, DeltaNet y MLP, con damping 0,1 y sin búsqueda de exponentes, calibrado con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. El resultado son 248 proyecciones cuantizadas a BFP4, todas verificadas contra la comprobación de rejilla, el empaquetado nativo de TT-NN y la conversión a BFP8.

La innovación técnica principal es el formato de almacenamiento: los valores cuantizados se guardan como BF16 sobre rejillas block-floating, de modo que el archivo resultante es más grande que los pesos empaquetados. El paquete incluye además los pesos de visión retenidos del modelo base y la cabeza conjunta y tabla léxica completas en BF16. La validación se realizó con TT-NN 0.81.1 y el simulador Blackhole; tt-transformers y tt-forge no fueron comprobados con este paquete. No se detallan datos de entrenamiento adicionales, composición del dataset ni si hubo RLHF/DPO en la información disponible.

## Capacidades

- Inferencia de decisión sobre esquemas: evalúa todas las opciones permitidas de una consulta en un único forward pass y devuelve una distribución de probabilidad por pregunta.
- Preguntas de tipo elección (`choice`) con criterios etiquetados y preguntas de tipo `noul` (sí/no) según el ejemplo de la model card.
- Procesamiento de estado estructurado (por ejemplo, objetos JSON con facturas, estados y campos anidados) junto con las preguntas asociadas.
- Clasificación de texto como pipeline principal (`text-classification`).
- Soporte multilingüe limitado a inglés y coreano.
- Pesos de visión retenidos del modelo base, aunque las entradas de imagen y vídeo no fueron verificadas para esta exportación.
- No genera respuestas textuales: la salida es una puntuación por opción, no texto libre.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Validación de documentos financieros: dado un estado estructurado con campos como proveedor, total, moneda y estado, el modelo puntúa opciones como "pagada", "vencida" o "borrador" en una sola pasada, lo que encaja en pipelines de contabilidad automatizada que necesitan clasificación determinista y sin generación de texto.
- Enrutado de decisiones en agentes: en lugar de pedir a un LLM que genere una etiqueta, se define un esquema de opciones y el modelo devuelve probabilidades calibradas, lo que simplifica el control de umbrales y la auditoría de decisiones en sistemas multi-agente.
- Verificación de reglas de negocio: preguntas de tipo sí/no ("¿el total supera 1000 USD?") evaluadas sobre el estado de un registro, útiles para motores de cumplimiento normativo que requieren trazabilidad de la puntuación.
- Clasificación de tickets y solicitudes: con contexto de estado estructurado y opciones predefinidas, el modelo asigna categorías sin coste de decodificación autoregresiva, adecuado para volúmenes altos en atención al cliente.
- Despliegue en hardware Tenstorrent: la exportación BFP4 está pensada para ejecutarse sobre aceleradores Tensix con tt-metal/ttnn, lo que permite integrar la clasificación en entornos de inferencia de bajo consumo energético frente a GPU convencionales.
- Evaluación comparativa de cuantización: sirve como referencia para estudiar la pérdida de calidad de BFP4 frente a BF16 en tareas de decisión, ya que la model card reporta métricas de divergencia KL y elementos perdidos frente al backbone original.
- Filtrado previo en pipelines RAG: puntuar si un fragmento recuperado responde a una pregunta concreta antes de pasarlo a un modelo generativo, reduciendo coste y alucinaciones en la etapa de generación.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación parcial con perfiles de decisión. Los datos disponibles son:

| Perfil de decisión | KL media de la distribución de opciones | Etiquetas correctas / 40 | Elementos etiquetados perdidos |
|---|---:|---:|---:|
| Backbone y cabeza originales en BF16 | 0 | 34 | 0 |

No se han publicado en la información disponible resultados para el perfil cuantizado BFP4 ni métricas de benchmarks estándar (MMLU, HumanEval, GSM8K u otros). No se inventan cifras.

## Requisitos de hardware

- Memoria de dispositivo estimada: aproximadamente 9,12 GB solo para los pesos retenidos del backbone, la cabeza conjunta y la tabla léxica, más espacio adicional para KV cache y buffers.
- El archivo del repositorio ocupa 19,1 GB, ya que los valores cuantizados se almacenan como BF16 sobre rejillas block-floating; se necesita espacio en disco y memoria suficiente para manejar el archivo BF16 durante la carga.
- GPU recomendadas: no se especifican modelos concretos; el quickstart indica una GPU CUDA con memoria suficiente para los valores BF16 del archivo. Por el tamaño, una RTX 4090 (24 GB) o superior (A100, H100) debería poder alojar los pesos, aunque no se confirma en la documentación.
- Aceleradores Tenstorrent Tensix: soporte validado con TT-NN 0.81.1 y el simulador Blackhole para las 248 proyecciones cuantizadas; no se proporciona un runner completo de decisión para Tensix.
- Opciones de despliegue: Transformers 5.23.0 con PyTorch y código personalizado (`joint_schema_model`); para Tensix, tt-metal/ttnn con scripts auxiliares `pack_tensix.py` y `verify_grid.py`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Enfoque |
|---|---|---|---|---|---|
| Xylolabs/clef-flash-Tenstorrent-Tensix-BFP4 | 9.409.813.744 | no disponible | BFP4 GPTQ + BF16 en cabeza y tabla léxica | Apache 2.0 | Modelo de decisión para Tensix |
| Cloudflare/clef-flash (base) | no disponible en la información | no disponible | BF16 | no disponible en la información | Modelo de decisión genérico |
| Alternativas generativas de tamaño similar (por ejemplo, Qwen3.5 base) | no disponible | no disponible | múltiples | no disponible | Generación de texto |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo generativo: no produce respuestas textuales, solo puntuaciones por opción; usarlo fuera de ese contrato requiere adaptaciones.
- La evaluación publicada solo cubre el perfil BF16 original (34/40 etiquetas correctas); no hay métricas del perfil BFP4 en la información disponible, por lo que la pérdida de calidad por cuantización no está cuantificada.
- Idiomas limitados a inglés y coreano; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Los pesos de visión se conservan, pero las entradas de imagen y vídeo no fueron verificadas para esta exportación.
- El despliegue en Tensix está validado a nivel de empaquetado de pesos con el simulador Blackhole; no se incluye un runner completo de decisión, y tt-transformers y tt-forge no fueron comprobados.
- El repositorio es más grande que los pesos empaquetados debido al almacenamiento BF16 sobre rejillas block-floating, lo que incrementa los requisitos de disco y memoria durante la carga.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; al ser un modelo de clasificación, el riesgo se traslada a puntuaciones mal calibradas en dominios fuera de la distribución de calibración (WikiText-2 y Wikipedia coreana).
- Licencia Apache 2.0: permite uso comercial, pero el código personalizado (`joint_schema_model`) y las dependencias de TT-NN deben revisarse por separado.
- El modelo tiene solo 21 descargas y 0 likes en el momento de la consulta, lo que indica poca validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/clef-flash-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/Cloudflare/clef-flash
- Repositorio de código tensix-bfp-gptq: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Licencia del modelo: https://huggingface.co/Xylolabs/clef-flash-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
