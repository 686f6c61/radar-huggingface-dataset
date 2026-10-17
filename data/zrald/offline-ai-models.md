# Zrald/offline-ai-models

## Resumen

`Zrald/offline-ai-models` es un repositorio de HuggingFace publicado por el usuario Zrald que, por su nombre, sus etiquetas (`gguf`, `imatrix`, `conversational`, `endpoints_compatible`) y el repositorio hermano `Zrald/offline-ai-models-nvidia`, parece funcionar como catálogo de modelos para una aplicación Android de IA offline: el repo `-nvidia` describe explícitamente un `models/manifest.json` que se fusiona en el selector de la app y cuyas entradas apuntan a los repositorios originales de terceros (NVIDIA oficial, bartowski, mradermacher, csukuangfj) sin re-subir los bytes. Conviene leerlo, por tanto, como un índice distribuidor de pesos más que como un modelo entrenado desde cero por el autor.

El dato objetivo de tamaño es el recuento de parámetros en safetensors: 1.777.088.000 (~1,78 mil millones), lo que sitúa los pesos en la categoría de modelos pequeños, aptos para ejecución en dispositivo o en GPU de consumo. El repositorio ocupa 22,7 GB, un volumen muy superior a los ~3,6 GB que ocuparían esos parámetros en FP16, lo que es coherente con la presencia de múltiples cuantizaciones GGUF en el mismo repo, aunque el desglose de ficheros no se ha proporcionado y no puede confirmarse.

La relevancia actual del repo es de tipo práctico: 3.687 descargas y actualización en octubre de 2026 lo convierten en un punto de entrada para quien quiera montar un asistente conversacional sin conexión. Ahora bien, no se ha publicado información sobre arquitectura, datos de entrenamiento, licencia ni idiomas, lo que limita seriamente cualquier evaluación técnica y obliga a verificar el contenido del repo antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (los tags no identifican familia ni tipo de transformer) |
| Parámetros totales | 1.777.088.000 (~1,78 mil millones), según recuento de safetensors |
| Parámetros activos | no disponible (sin indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (tag `gguf`), con cuantización asistida por matriz de importancia (tag `imatrix`); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos originales) y GGUF |
| Tamaño del repositorio | 22,7 GB |
| Descargas | 3.687 |
| Compatibilidad de servicio | tag `endpoints_compatible` (compatible con la API de inference endpoints) |
| Etiqueta de uso | `conversational` |
| Fecha de creación / actualización | 2026-09-29 / 2026-10-17 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna: ni tipo de transformer, ni número de capas, ni dimensión oculta, ni mecanismo de atención, ni si emplea decodificación especulativa u otra optimización de inferencia. Tampoco se especifica si los 1,78 mil millones de parámetros corresponden a un modelo base, a un ajuste fino conversacional o a una mezcla de pesos, ni si existe un modelo teacher detrás. Los tags `gguf` e `imatrix` describen únicamente el formato de distribución y el método de cuantización, no la arquitectura.

Respecto al entrenamiento, no hay datos sobre número de tokens, composición del corpus, uso de RLHF, DPO o cualquier otra fase de alineamiento. El tag `conversational` sugiere un ajuste orientado a diálogo, pero no se puede confirmar el procedimiento ni el grado de alineación. La propia naturaleza del repo (catálogo con manifiesto para una app) hace plausible que el autor no haya entrenado los pesos, sino que redistribuya o referencie modelos de terceros, como indica explícitamente el repo `-nvidia`; en ese caso, la ficha de arquitectura y entrenamiento debería consultarse en el repositorio upstream correspondiente, que aquí no se identifica.

## Capacidades

- Generación de texto conversacional multi-turno: es la única capacidad declarada explícitamente mediante el tag `conversational`.
- Distribución en GGUF con cuantización por matriz de importancia: permite ejecución en CPU y en GPU de gama baja mediante llama.cpp y derivados.
- Compatibilidad con la API de inference endpoints (`endpoints_compatible`): el repo puede servirse con el mismo contrato HTTP que otros modelos alojados.
- Integración como catálogo: el repo hermano `-nvidia` documenta la fusión automática de un `models/manifest.json` en el selector de la aplicación Android, de modo que añadir o quitar entradas no requiere recompilar la app.
- Razonamiento, código, matemáticas, visión, audio, tool calling, function calling, agentes y modo thinking: no disponibles o no confirmados en la información proporcionada; no deben asumirse.
- Capacidades multilingües: no disponibles; no se ha publicado la lista de idiomas.

## Casos de uso

- Asistente conversacional totalmente offline en Android: el modelo, en cuantización GGUF de ~1-2 GB, cabe en el almacenamiento de un móvil de gama media y permite diálogo sin red, sin cuentas y sin enviar datos a terceros; encaja con el propósito declarado del catálogo del que forma parte.
- Despliegue en entornos air-gapped: al distribuirse en GGUF y ser servible con llama.cpp o vLLM, puede instalarse en máquinas sin salida a Internet (laboratorios, plantas industriales, buques) para tareas de redacción y resumen interno.
- Prototipado rápido de un endpoint compatible con OpenAI: gracias al tag `endpoints_compatible`, se puede levantar un servidor local que responda al mismo esquema que la API de referencia y sustituirlo después por un modelo mayor sin reescribir el cliente.
- Sustitución de un servicio cloud en aplicaciones de privacidad estricta: con 1,78 mil millones de parámetros, tareas de reescritura, clasificación de texto y extracción de campos pueden ejecutarse en local sin que el contenido salga del dispositivo.
- Componente de un pipeline RAG en el borde: un modelo de este tamaño puede generar la respuesta final a partir de fragmentos recuperados por un índice local, con latencia baja en CPU moderna y sin coste por token.
- Pruebas de integración continua de aplicaciones de IA: al ser pequeño y de descarga gratuita desde HuggingFace, sirve como modelo de juguete en tests automatizados del cliente (formato de mensajes, streaming, manejo de errores) sin consumir cuota de APIs de pago.
- Distribución como catálogo curado: un equipo puede reutilizar el esquema de manifiesto para publicar su propia selección de modelos GGUF verificados, apuntando a los repositorios upstream en lugar de re-subir pesos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación, ni métricas de latencia o throughput medidas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir del recuento de parámetros, no medido): ~3,6 GB de pesos en FP16; ~1,9 GB en Q8_0; ~1,3 GB en Q5_K_M; ~1,1 GB en Q4_K_M. A estas cifras hay que sumar el KV cache y el overhead del runtime, cuyo tamaño exacto depende de capas y cabezas, datos no publicados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM libre puede alojar el modelo en FP16; una RTX 3060 de 12 GB, una RTX 4060 Ti o una RTX 4090 lo alojan con holgura y permiten contextos largos. Para cuantizaciones Q4/Q5 basta con 2-3 GB, por lo que también funciona en iGPU con memoria unificada.
- Cabe en GPU de consumo: sí, en la práctica totalidad de tarjetas con 4 GB o más, y en CPU con 4-8 GB de RAM usando GGUF Q4_K_M.
- Opciones de despliegue: llama.cpp y sus frontales (Ollama, LM Studio, KoboldCpp, Jan) para GGUF; vLLM, TGI o SGLang para safetensors si el modelo resulta ser compatible con sus kernels; también es posible servirlo como endpoint compatible con OpenAI por el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones y no deben extrapolarse desde otros modelos del mismo tamaño sin verificación.

## Comparativa con modelos similares

La comparación solo puede establecerse a escala de parámetros, ya que se desconoce la arquitectura, el contexto y el rendimiento de `Zrald/offline-ai-models`.

| Modelo | Parámetros | Contexto | Licencia | Formato principal |
|---|---|---|---|---|
| Zrald/offline-ai-models | ~1,78 B | no disponible | no disponible | safetensors + GGUF |
| Llama 3.2 1B | 1,24 B | 128.000 tokens | Llama 3.2 Community License | safetensors + GGUF |
| Qwen2.5 1.5B | 1,54 B | 32.768 tokens nativos | Apache 2.0 | safetensors + GGUF |
| Gemma 2 2B | 2,6 B | 8.192 tokens | Gemma Terms of Use | safetensors + GGUF |

Los tres modelos de referencia cuentan con documentación pública de entrenamiento, evaluaciones y licencia explícita; el repositorio analizado no ofrece ninguno de esos elementos en la información disponible, lo que dificulta una comparación de rendimiento rigurosa.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial, modificación ni redistribución. Es un bloqueante potencial para producción.
- Idiomas no declarados: no puede confirmarse el soporte de castellano ni de ninguna otra lengua; el rendimiento multilingüe es una incógnita.
- Contexto desconocido: sin longitud de ventana publicada, no se pueden dimensionar casos de uso que dependan de contexto largo (RAG con muchos fragmentos, análisis de documentos extensos).
- Riesgo de alucinación: no hay información sobre alineamiento, RLHF o evaluación de veracidad; en un modelo de 1,78 B el riesgo de fabricación de datos es estructuralmente alto y no debe usarse sin verificación en dominios sensibles.
- Posible naturaleza de catálogo: si el repo es un índice de modelos de terceros y no un modelo único, los pesos concretos pueden cambiar entre actualizaciones y la reproducibilidad no está garantizada; conviene fijar una revisión concreta.
- Procedencia de los pesos: el repo hermano indica que las URL apuntan a repositorios de terceros (NVIDIA, bartowski, mradermacher, csukuangfj); la licencia aplicable sería entonces la del modelo upstream, que aquí no se identifica.
- Sesgos: no disponibles; no se ha publicado ninguna evaluación de sesgo, toxicidad o sesgo de género/raza.
- Ausencia de benchmarks: sin métricas públicas no es posible justificar la elección frente a alternativas del mismo tamaño con documentación completa.
- Soporte de tool calling y agentes no confirmado: no debe asumirse compatibilidad con plantillas de herramientas ni con razonamiento multi-paso.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/Zrald/offline-ai-models
- Repositorio hermano (catálogo solo NVIDIA para la app Offline AI): https://huggingface.co/Zrald/offline-ai-models-nvidia
- Guía general de ejecución local de modelos (contexto, no específica del modelo): https://aithinkerlab.com/run-ai-models-locally-offline-privacy-guide/
- Guía general de despliegue air-gapped (contexto, no específica del modelo): https://insiderllm.com/guides/running-ai-offline-complete-guide/
- Guía general de IA offline (contexto, no específica del modelo): https://www.aimadetools.com/blog/run-ai-offline/
- Recopilación de modelos offline (contexto, no específica del modelo): https://elephas.app/blog/best-offline-ai-models
