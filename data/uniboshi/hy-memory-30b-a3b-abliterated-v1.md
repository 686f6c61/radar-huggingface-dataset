# Uniboshi/Hy-Memory-30B-A3B-Abliterated-V1

## Resumen

Hy-Memory-30B-A3B-Abliterated-V1 es una variante "abliterated" (sin censura) del modelo tencent/Hy-Memory-30B-A3B, publicada por el usuario Uniboshi en HuggingFace. El modelo base pertenece al linaje de modelos con memoria de Tencent, y esta version ha sido modificada para eliminar los mecanismos de rechazo internos (abliteration), de modo que responde sin negativas a practicamente cualquier tipo de peticion conversacional. Cuenta con 30.064.725.888 parametros totales segun los pesos en safetensors.

La nomenclatura "30B-A3B" del nombre sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 3.000 millones de parametros activos por token, aunque este dato no aparece confirmado de forma explicita en la informacion disponible. El tag `hy_v3` apunta a la familia de arquitectura Hy version 3 del modelo base. Los pesos se distribuyen en formato safetensors para la libreria transformers y el repositorio ocupa 60,1 GB, lo que es coherente con pesos en precision de 16 bits.

El modelo se publica bajo licencia Apache 2.0, pero el acceso esta restringido (gated) y requiere aceptar condiciones en HuggingFace. Cabe destacar que, en el momento de la consulta, el modelo registra 0 descargas y 0 "likes", por lo que no existe validacion comunitaria, benchmarks publicados ni evidencia de calidad de la abliteration aplicada. La fecha de creacion indicada es 2026-10-16, lo que resulta anomala y debe tomarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la nomenclatura "A3B" y el tag `hy_v3` sugieren transformer con mezcla de expertos, sin confirmar) |
| Parametros totales | 30.064.725.888 (30B) |
| Parametros activos | no disponible (el sufijo "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El autor no publica una descripcion tecnica en la informacion disponible. Por los metadatos se sabe que el modelo es un finetune derivado de tencent/Hy-Memory-30B-A3B, con tag de arquitectura `hy_v3` y etiquetas `abliterated`, `uncensored` y `conversational`. La abliteration es una tecnica que modifica los pesos del modelo (habitualmente proyectando fuera de las matrices de pesos la direccion que activa el comportamiento de rechazo) con el objetivo de eliminar las negativas del modelo sin reentrenamiento completo. No se especifican el metodo exacto empleado, el numero de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO adicional.

El tag `endpoints_compatible` indica que el modelo esta preparado para su despliegue mediante Inference Endpoints de HuggingFace. No hay informacion sobre innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, entrenamiento con memoria externa, etc.), mas alla del nombre "Hy-Memory" del modelo base, que sugiere algun mecanismo de memoria, pero del cual no se aportan detalles.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Respuestas sin filtros de rechazo (comportamiento "uncensored" derivado de la abliteration).
- Se desconoce si conserva capacidades de razonamiento, codigo o matematicas del modelo base, ya que el autor no aporta evaluaciones.
- Soporte de tool calling o function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: no disponibles (el campo de idiomas aparece vacio en los metadatos).
- Capacidades especiales (modo thinking, vision, audio): no disponibles.

## Casos de uso

- Generacion de texto creativo sin restricciones editoriales: la abliteration elimina los rechazos, lo que resulta util para redaccion de ficcion, guiones o narrativa que aborden temas sensibles sin que el modelo se niegue a continuar.
- Experimentacion en investigacion sobre alineacion y seguridad: el modelo sirve como objeto de estudio para analizar que capacidades se degradan o se conservan tras aplicar abliteration, comparandolo con el modelo base.
- Asistentes conversacionales personalizados en entornos controlados: al no incluir politicas de rechazo, es adecuado en escenarios internos donde el operador asume la responsabilidad del contenido generado.
- Simulacion de personajes o roleplay: el comportamiento conversacional y sin filtros lo hace apropiado para dialogos de personaje en proyectos de entretenimiento.
- Generacion de datos sinteticos para entrenamiento: puede emplearse para producir datasets de texto diverso cuando se necesita un modelo que no bloquee tematicas.
- Evaluacion comparativa de tecnicas de abliteration: como artefacto de referencia para medir el impacto en benchmarks frente a otras variantes abliterated o al modelo original.
- Despliegue en endpoints propios de HuggingFace: el tag `endpoints_compatible` facilita su integracion en Inference Endpoints para prototipado rapido.

Advertencia: al tratarse de un modelo sin censura y sin evaluaciones publicadas, no se recomienda su uso en produccion orientada a usuarios finales sin una capa adicional de moderacion y sin pruebas exhaustivas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ninguna otra tarea, ni comparaciones con el modelo base tencent/Hy-Memory-30B-A3B. No es posible, por tanto, cuantificar el impacto de la abliteration sobre el rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 60 GB solo de pesos, mas overhead de activaciones y cache KV, lo que situa la necesidad en torno a 64-72 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 30-32 GB.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 16-20 GB, dependiendo del metodo.
- GPU recomendadas para precision completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU.
- GPU para 8 bits: A100 40 GB, L40S 48 GB, RTX A6000 48 GB.
- GPU de consumo: cabe en una RTX 4090 (24 GB) o RTX 3090 (24 GB) unicamente con cuantizacion de 4 bits; en BF16 no cabe.
- Opciones de despliegue: transformers (libreria indicada), vLLM, TGI e Inference Endpoints de HuggingFace (por el tag `endpoints_compatible`).
- llama.cpp u Ollama: no confirmado, no se publican pesos GGUF en el repositorio.
- Latencia y throughput: no disponibles. Si la arquitectura es efectivamente MoE con ~3B activos, la velocidad de decodificacion deberia ser notablemente superior a la de un modelo denso de 30B, pero este dato no esta confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Uniboshi/Hy-Memory-30B-A3B-Abliterated-V1 | 30B | no disponible | Apache 2.0 | Gated en HuggingFace | Variante abliterated del modelo de Tencent |
| tencent/Hy-Memory-30B-A3B | 30B | no disponible | no disponible | no disponible | Modelo base del que deriva esta version |
| Otras alternativas abliterated de tamano similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos para comparar |

No se dispone de informacion suficiente para establecer una comparativa tecnica con modelos de la misma categoria, ya que no se publican benchmarks ni especificaciones del modelo base ni de competidores directos.

## Limitaciones y advertencias

- Acceso restringido: el modelo esta en modo gated y requiere aceptar condiciones en HuggingFace antes de descargarlo.
- Sin validacion comunitaria: 0 descargas y 0 "likes" en el momento de la consulta implican que no hay retroalimentacion de usuarios ni verificacion independiente de su funcionamiento.
- Sin benchmarks: no existen evaluaciones publicadas que confirmen que el modelo conserva las capacidades del modelo base tras la abliteration.
- Riesgo elevado de contenido inapropiado: al ser "uncensored", puede generar contenido ofensivo, ilegal, peligroso o inexacto sin advertencia alguna.
- Riesgo de alucinacion: no se dispone de datos sobre la tasa de alucinacion ni sobre las capacidades de razonamiento tras la modificacion de pesos.
- Idiomas no especificados: se desconoce si el soporte multilingue del modelo base se mantiene.
- Longitud de contexto desconocida: no hay informacion sobre la ventana de contexto efectiva.
- Fecha de creacion anomala (2026-10-16): el metadato temporal resulta inconsistente y debe tomarse con cautela.
- Licencia: Apache 2.0 permitiria uso comercial, pero la condicion de acceso gated y la falta de especificaciones del modelo base hacen recomendable revisar los terminos heredados del modelo de Tencent.
- Idoneidad para produccion: baja, dado que no existe evidencia de calidad, seguridad ni estabilidad.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Uniboshi/Hy-Memory-30B-A3B-Abliterated-V1
- Modelo base: https://huggingface.co/tencent/Hy-Memory-30B-A3B
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
