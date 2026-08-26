# Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP

## Resumen

Qwen3.8 Flash Next es un modelo multimodal de código abierto desarrollado por Qwen, con arquitectura `qwen4_exp` de mezcla de expertos (MoE) dispersa y visión-lenguaje. Combina atención lineal recurrente (Gated DeltaNet), atención dispersa de Qwen (QSA), capas MoE con 512 expertos enrutados, embeddings basados en n-gramas con hash y un bloque nativo de predicción de siguiente token (MTP) para decodificación especulativa. El modelo base tiene 125 mil millones de parámetros en total, de los cuales 6 mil millones se activan por token, y admite una ventana de contexto nativa de 262 144 tokens.

Esta ficha describe la conversión MLX oQ4 realizada por Vontra, que cuantiza el checkpoint oficial BF16 a precisión mixta de 4 bits (con módulos protegidos a 5/8 bits) y conserva el bloque MTP nativo. El resultado es un paquete de 113 GB en formato safetensors de MLX, pensado para ejecutarse en Apple Silicon mediante el runtime oMLX o MLX-VLM. La conversión es comunitaria, no oficial, y requiere un runtime con soporte explícito para la arquitectura `qwen4_exp` y su módulo MTP.

La relevancia de este modelo radica en que permite ejecutar localmente un MoE multimodal de última generación con contexto muy largo en hardware de Apple, manteniendo una velocidad de generación aceptable gracias a la decodificación especulativa nativa. Es una opción atractiva para desarrolladores e investigadores que trabajan con macOS y necesitan capacidades de visión-lenguaje sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` (vision-language sparse MoE con Gated DeltaNet + Qwen Sparse Attention) |
| Parametros totales | 125B (modelo base); 34 179 029 859 en el checkpoint convertido |
| Parametros activos | 6B (modelo base) |
| Longitud de contexto | 262 144 tokens (configurado) |
| Tipos de cuantizacion | oQ4 mixed precision: base 4-bit affine, 232 modulos protegidos a 5/8-bit, group size 32 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | MLX safetensors (oQ4), 22 shards, 3747 tensores |

## Arquitectura y entrenamiento

La arquitectura de Qwen3.8 Flash Next es hibrida. Por un lado, emplea Gated DeltaNet (GDN), un mecanismo de atencion lineal recurrente que reduce el coste computacional frente a la atencion softmax tradicional. Por otro, integra Qwen Sparse Attention (QSA), que selecciona dinamicamente los tokens relevantes para cada consulta. Las capas MoE contienen 512 expertos enrutados, de los cuales se activan 10 por token, mas un experto compartido. El modelo tambien incorpora embeddings de bigramas y trigramas con hash (51B parametros adicionales) y un bloque MTP (Multi-Token Prediction) que actua como borrador para decodificacion especulativa.

La conversion de Vontra se realizo directamente desde el checkpoint BF16 oficial, midiendo la sensibilidad de cada capa con una proxy local validada. Se asigno una base de cuantizacion de 4 bits y se protegieron 232 modulos con precisiones de 5 u 8 bits. Todos los tensores, incluidos los 76 del bloque MTP, se reconstruyeron desde el checkpoint original. No se dispone de informacion detallada sobre el entrenamiento del modelo base (composicion del dataset, numero de tokens, uso de RLHF o DPO) en la documentacion proporcionada.

## Capacidades

- Generacion de texto, razonamiento, codigo y matematicas, como es habitual en la serie Qwen, aunque no se aportan evaluaciones especificas en esta conversion.
- Procesamiento de imagenes: el pipeline es `image-text-to-text`, por lo que puede recibir imagenes como entrada y generar texto relacionado (descripciones, respuestas a preguntas visuales, etc.).
- Decodificacion especulativa nativa mediante el bloque MTP incluido, que acelera la generacion sin necesidad de un drafter externo.
- Ventana de contexto muy larga de 262 144 tokens, adecuada para documentos extensos o conversaciones multi-turno con historial amplio.
- Soporte de tool calling y function calling: no se especifica en la documentacion disponible; los modelos Qwen suelen incluirlo, pero no esta confirmado para esta version.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Multilingue: no se indica la lista de idiomas soportados.

## Casos de uso

- Analisis de documentos legales extensos con imagenes: el modelo puede procesar contratos, escrituras o informes de cientos de paginas que incluyan graficos, tablas o firmas escaneadas, gracias a su ventana de 262K tokens y su capacidad de vision. Es adecuado para extraer clausulas, resumir secciones y responder preguntas sobre el contenido.
- Asistente de desarrollo de software con contexto de repositorio completo: se puede cargar un proyecto entero (codigo, documentacion, diagramas) y hacer preguntas sobre arquitectura, detectar errores o generar nuevas funciones. La ventana larga evita la fragmentacion del contexto.
- Generacion de informes a partir de capturas de pantalla o diagramas: en entornos de soporte tecnico, el modelo puede interpretar capturas de pantalla de errores, diagramas de flujo o esquemas, y producir explicaciones o documentacion tecnica.
- Chat conversacional local en Apple Silicon: gracias a la cuantizacion oQ4 y al MTP, se puede desplegar un asistente multimodal en una Mac con suficiente memoria unificada, sin conexion a internet, con velocidades de 30-40 tokens/s en un M3 Studio.
- Investigacion en arquitecturas MoE y decodificacion especulativa: el modelo permite experimentar con un MoE hibrido de ultima generacion en hardware local, analizando el comportamiento del MTP, la seleccion de expertos y la atencion dispersa.
- Automatizacion de extraccion de datos de facturas o recibos escaneados: el modelo puede leer imagenes de documentos financieros, identificar campos como importes, fechas o proveedores, y devolver estructuras JSON o texto formateado.
- Asistente educativo multimodal: puede explicar conceptos a partir de fotografias de pizarras, paginas de libros o esquemas, adaptando la respuesta al nivel del estudiante y manteniendo un hilo conversacional largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo incluye mediciones de velocidad de inferencia en un Apple M3 Studio con MTP nativo activado:

| Prueba | Tokens de salida | Velocidad |
|---|---:|---:|
| Completado crudo, primera ejecucion | 32 | 29,4 tokens/s |
| Completado crudo, calentado | 32 | 34,4 tokens/s |
| Chat con instruccion exacta | 27 | 17,4 tokens/s |
| Chat casual | 71 | 39,7 tokens/s |

La tasa de aceptacion del borrador MTP oscilo entre 58,3% y 89,5% en estas pruebas. Los resultados varian segun la longitud del prompt, el estado de la cache, los parametros de muestreo, la version del runtime y la presion de memoria.

## Requisitos de hardware

- El peso del checkpoint es de 113,33 GB (105,54 GiB), por lo que se necesita una Mac con al menos 128 GB de memoria unificada para cargarlo en RAM; se recomienda 192 GB para margen con el sistema y la cache.
- Solo compatible con Apple Silicon (M1, M2, M3, M4 y posteriores) porque el formato es MLX. No se puede ejecutar en GPUs NVIDIA o AMD.
- Probado en un Apple M3 Studio, donde alcanzo entre 17 y 40 tokens/s segun la tarea.
- Requiere un runtime oMLX o MLX-VLM con soporte explicito para la arquitectura `qwen4_exp` y su modulo MTP nativo. Los runtimes estandar que no construyen el modulo Qwen4Exp pueden rechazar los 76 tensores MTP durante la carga estricta de pesos.
- No se debe acoplar un drafter de Qwen3.8 27B a este modelo, ya que las dimensiones ocultas difieren.
- Opciones de despliegue: oMLX (con MTP habilitado en ajustes), MLX-VLM. No se menciona compatibilidad con llama.cpp, Ollama o vLLM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | MTP | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (original) | 125B total / 6B activo | 262 144 | BF16 | Si (nativo) | Qwen Community 1.0 | safetensors (BF16) |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | 125B total / 6B activo | 262 144 | 4-bit estandar | No especificado | Qwen Community 1.0 | MLX safetensors |
| Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP (este) | 125B total / 6B activo | 262 144 | oQ4 mixto (4/5/8-bit) | Si (nativo) | Qwen Community 1.0 | MLX safetensors |

La principal diferencia frente a la version 4-bit estandar es la cuantizacion de precision mixta con modulos protegidos y la inclusion del bloque MTP nativo, que mejora la velocidad de generacion. Frente al original BF16, esta conversion reduce el peso de 125B a 113 GB (aunque el numero de parametros del checkpoint convertido es menor debido a la cuantizacion) y permite ejecutarlo en Apple Silicon con menos memoria.

## Limitaciones y advertencias

- Requiere un runtime especifico con soporte `qwen4_exp` y MTP; los runtimes estandar pueden fallar al cargar los tensores MTP.
- No se debe utilizar un drafter de Qwen3.8 27B con este modelo, ya que las dimensiones ocultas no coinciden.
- Es una conversion comunitaria, no un lanzamiento oficial de Qwen; puede haber diferencias de comportamiento frente al checkpoint original.
- La licencia Qwen Community 1.0 impone condiciones de uso; es necesario revisar el texto completo para verificar restricciones comerciales y de redistribucion.
- No se dispone de informacion sobre sesgos, riesgos de alucinacion o limitaciones idiomaticas especificas de este modelo. Como todo LLM, puede generar contenido incorrecto o inventado, especialmente en tareas de razonamiento complejo.
- El tamaño del checkpoint (113 GB) limita su uso a equipos con gran memoria unificada; no es viable en Macs con menos de 128 GB.
- No se han publicado evaluaciones de calidad (benchmarks) para esta conversion, por lo que su rendimiento real en tareas estandar no esta verificado.

## Enlaces

- [Modelo convertido en Hugging Face](https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ4-MTP)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Version MLX 4-bit estandar de Vontra](https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit)
- [Repositorio GitHub de Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
- [Repositorio GitHub de la serie Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- [Blog de Qwen sobre Qwen3.8 Flash Next](https://qwen.ai/blog?id=qwen3.8-flash-next)
- [MLX-VLM en GitHub](https://github.com/ml-explore/mlx-vlm)
