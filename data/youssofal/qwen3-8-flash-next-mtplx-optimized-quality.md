# Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality

## Resumen

Qwen3.8-Flash-Next-MTPLX-Optimized-Quality es una cuantización de 8 bits del modelo Qwen3.8-Flash-Next, publicada por el usuario Youssofal y empaquetada para MTPLX, un runtime de decodificación especulativa nativa sobre Apple Silicon. El modelo base es un MoE híbrido de la generación Qwen4, con arquitectura GDN (hybrid MoE), Qwen Sparse Attention y una memoria n-gram de 51.000 millones de parámetros. Esta variante conserva la torre de visión y la cabeza de multi-token prediction (MTP) del modelo original.

El interés de esta ficha reside en que es una de las pocas distribuciones públicas de un modelo de gran tamaño (el modelo base se describe como 125B-A6B, aunque el recuento real de safetensors de este repo es de 36.299.458.451 parámetros) preparada específicamente para ejecutarse en local sobre Mac Studio con 256 GB o 512 GB de memoria unificada. El empaquetado separa la tabla n-gram (32 GB, 4 bits) como sidecar que MTPLX transmite desde SSD, de modo que solo los pesos (unos 128,5 GiB) permanecen en memoria.

La relevancia es doble: por un lado, demuestra un flujo de cuantización selectiva (expertos, atención y cabeza MTP a 8 bits con grupos de 64 pesos; tensores estructurales en BF16; tabla n-gram a 4 bits); por otro, valida la decodificación especulativa con aceptación por regla de ratio de probabilidad más remuestreo residual, lo que permite que la salida siga la distribución del modelo a cualquier temperatura. La ventana de contexto declarada es de 262.144 tokens y la licencia es la Qwen Community License 1.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido (GDN hybrid MoE) con Qwen Sparse Attention y memoria n-gram de 51B parámetros |
| Parámetros totales | 36.299.458.451 (recuento de safetensors del repo); el autor describe el modelo base como 125B-A6B |
| Parámetros activos | No disponible (el autor indica A6B en el modelo base, sin desglose verificado en esta variante) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantización | 8 bits (expertos, atención y cabeza MTP, grupos de 64 pesos); BF16 en tensores estructurales; 4 bits en tabla n-gram (sidecar) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 (license_name: qwen-community-1.0) |
| Formato de pesos | safetensors (librería mtplx; runtime MTPLX 2.12.0 o superior) |

## Arquitectura y entrenamiento

El modelo base pertenece a la generación Qwen4 y combina un MoE híbrido GDN con Qwen Sparse Attention, además de una memoria n-gram de 51.000 millones de parámetros que actúa como mecanismo de recuperación de secuencias. Sobre esa base, esta variante aplica cuantización selectiva: los expertos, las capas de atención y la cabeza de multi-token prediction se guardan a 8 bits con grupos de 64 pesos (el doble de precisión que la variante Optimized Speed del mismo autor), mientras que los tensores estructurales se mantienen en BF16 y la tabla n-gram se separa en un sidecar de 4 bits que MTPLX transmite desde SSD. La torre de visión se conserva en los pesos.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. La innovación técnica destacable es el uso de la cabeza MTP nativa como mecanismo de borrador para decodificación especulativa: MTPLX aplica una regla de aceptación por ratio de probabilidad junto con remuestreo residual, de modo que la distribución de salida coincide con la del modelo a cualquier temperatura. La profundidad MTP es adaptativa, con techo de 3. El contrato de servicio se distribuye en `mtplx_runtime.json` y el runtime lo lee al cargar. El muestreo recomendado es temperatura 1.0, top-p 0.95 y top-k 20.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con torre de visión preservada en los pesos.
- Razonamiento y decodificación especulativa mediante cabeza MTP nativa, con profundidad adaptativa hasta 3.
- Recuperación asistida por memoria n-gram de 51B parámetros, orientada a la coherencia en secuencias largas.
- Integración con herramientas de desarrollo tipo opencode y claude-code, según las etiquetas del repositorio.
- Ejecución local en Apple Silicon (macOS) mediante el runtime MTPLX.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local sobre Mac Studio: el modelo se integra con herramientas de terminal tipo opencode y claude-code, y su contexto de 262.144 tokens permite mantener en memoria varios ficheros y el historial de una sesión de refactorización larga sin truncar.
- Análisis de documentación técnica con imágenes: al conservar la torre de visión, puede procesar capturas de diagramas de arquitectura, tablas de especificaciones o gráficos junto con el texto que los acompaña en un mismo prompt.
- Procesamiento de repositorios completos: la ventana de contexto y la memoria n-gram facilitan tareas de resumen, búsqueda de dependencias y detección de inconsistencias sobre bases de código extensas, ejecutadas íntegramente en la máquina del desarrollador.
- Prototipado de agentes con privacidad estricta: al ejecutarse en local sin llamadas a API externas, es adecuado para entornos donde el código o los datos no pueden salir del dispositivo, como auditorías internas o investigación sujeta a confidencialidad.
- Generación de documentación y textos largos: la decodificación especulativa con aceptación exacta a cualquier temperatura permite muestrear con temperatura 1.0 sin degradar la fidelidad de la distribución, útil para redacción técnica reproducible.
- Evaluación comparativa de cuantizaciones: sirve como referencia de alta fidelidad frente a las variantes Optimized Speed (4 bits) y Bare Speed (4 bits plano) del mismo autor, para medir la pérdida de calidad asociada a la compresión en tareas concretas.
- Laboratorio de investigación en decodificación especulativa: el contrato de servicio en `mtplx_runtime.json` y el esquema de aceptación por ratio de probabilidad permiten estudiar el comportamiento de MTP con distintos parámetros de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la velocidad en Macs de 256 GB y 512 GB no se ha medido todavía, y que los pesos de 8 bits mueven el doble de bytes por token que la variante Optimized Speed, por lo que decodifica más despacio.

## Requisitos de hardware

- VRAM/memoria unificada estimada: unos 128,5 GiB de pesos en memoria, con la tabla n-gram de 32 GB transmitiéndose desde SSD. En un Mac de 256 GB quedan aproximadamente 59,5 GiB para contexto y caché de sesión.
- Equipos recomendados: Mac Studio con 256 GB o 512 GB de memoria unificada.
- En Macs de 128 GB el autor recomienda usar la variante Optimized Speed en lugar de esta.
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por el runtime MTPLX, que es específico de Apple Silicon y macOS.
- Cabe en GPU de consumo: no aplica; el modelo requiere memoria unificada de gama alta en Apple Silicon.
- Opciones de despliegue: aplicación MTPLX 2.12.0 o superior, o CLI mediante `pip install mtplx` y `mtplx serve --model Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality --model-id mtplx-flash-next-optimized-quality`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no medidos según el autor. La decodificación especulativa MTPLX se anuncia como dos o tres veces más rápida que la decodificación plana en el ecosistema general de MTPLX, sin cifra concreta para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTPLX-Optimized-Quality (esta ficha) | 36.299.458.451 en safetensors; base descrito como 125B-A6B | 262.144 tokens | 8 bits cuerpo y MTP, BF16 estructural, 4 bits n-gram | Qwen Community 1.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-Flash-Next-MTPLX-Optimized-Speed | No disponible | 262.144 tokens (según model card del autor) | 4 bits (grupos de mayor tamaño) | Qwen Community 1.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-Flash-Next-MTPLX-Bare-Speed | No disponible | No disponible | 4 bits plano | Qwen Community 1.0 | Hugging Face, runtime MTPLX |
| Qwen/Qwen3.8-Flash-Next (base) | Descrito como 125B-A6B | No disponible | Pesos originales | Qwen Community 1.0 | Hugging Face |

Las tres variantes MTPLX comparten arquitectura y licencia; la diferencia principal es la fidelidad de cuantización y el coste en memoria. Optimized Speed es la build recomendada por el autor para 128 GB, mientras que esta variante Optimized Quality prioriza precisión a costa de velocidad y de un mayor requisito de memoria.

## Limitaciones y advertencias

- El autor no ha medido la velocidad en Macs de 256 GB ni de 512 GB; no hay datos de latencia o throughput para planificar producción.
- Requiere hardware específico: Apple Silicon con 256 GB o 512 GB de memoria unificada. No es desplegable en GPU NVIDIA ni en entornos Linux estándar con los runtimes habituales.
- La decodificación es más lenta que la variante Optimized Speed porque mueve el doble de bytes por token.
- La tabla n-gram se transmite desde SSD, por lo que el rendimiento depende de la velocidad del almacenamiento y no solo de la memoria.
- El recuento real de parámetros en safetensors (36.299.458.451) no coincide con la descripción del modelo base como 125B-A6B; conviene verificar la configuración exacta antes de dimensionar infraestructura.
- No hay información sobre sesgos, tasas de alucinación ni cobertura idiomática verificada.
- La licencia Qwen Community 1.0 impone condiciones de uso comercial que deben revisarse en el fichero LICENSE del repositorio antes de cualquier despliegue en producto.
- El modelo base es una preview de la generación Qwen4 según el autor, lo que implica posible inestabilidad de API y de comportamiento entre versiones.
- El runtime MTPLX exige la versión 2.12.0 o superior; versiones anteriores no leen el contrato de servicio incluido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Quality
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante Optimized Speed: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed
- Variante Bare Speed: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed
- Sitio del runtime MTPLX: https://mtplx.com
