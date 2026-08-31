# Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed

## Resumen

El modelo **Qwen3.8-Flash-Next-MTPLX-Bare-Speed** es una cuantización MLX en 4-bit del modelo experimental **Qwen3.8-Flash-Next** de Alibaba, adaptada por Youssofal para ejecutarse de forma nativa en Apple Silicon mediante el runtime MTPLX. El modelo base pertenece a la generación Qwen4 e introduce una arquitectura híbrida con GDN (Gated Delta Network), Qwen Sparse Attention (QSA) y una memoria n-gram de 51 mil millones de parámetros adicionales, alcanzando 125 mil millones de parámetros totales con 6 mil millones activos por token.

Esta versión "Bare Speed" aplica una cuantización plana de 4-bit a todos los expertos y matrices densas, manteniendo en 16-bit los componentes críticos como el GDN, las normalizaciones, el indexador QSA y la cabeza de multi-token prediction (MTP). El resultado es un modelo optimizado para velocidad bruta en Macs con 96 GB o más de memoria unificada, con soporte de decodificación especulativa que multiplica el rendimiento por 1,6 en tareas de código. La tabla n-gram de 32 GB se transmite desde SSD por defecto, lo que reduce la memoria residente a unos 74 GB.

La relevancia de este modelo radica en que permite ejecutar localmente una arquitectura de última generación con contexto de 262.144 tokens y capacidades multimodales en hardware de consumo de gama alta, algo poco habitual para modelos de este tamaño. Su licencia es qwen-community-1.0, que permite uso comercial con restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen4: GDN hybrid MoE + Qwen Sparse Attention + n-gram memory |
| Parametros totales | 20.676.193.171 (safetensors); modelo base: 125B-A6B + 51B n-gram |
| Parametros activos | 6B por token (A6B) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit flat (grupos de 64), componentes en 16-bit |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base **Qwen3.8-Flash-Next** es un preview de la generación Qwen4, presentado por el equipo de Qwen en agosto de 2026. Su arquitectura combina tres innovaciones principales: una atención híbrida GDN (Gated Delta Network) que mezcla convolución y estado recurrente, una atención dispersa QSA (Qwen Sparse Attention) para reducir el coste computacional en contextos largos, y una memoria n-gram de 51 mil millones de parámetros que complementa los 125 mil millones del modelo principal. El modelo es multimodal, con una torre de visión preservada en los pesos.

La versión MTPLX Bare Speed cuantiza todos los expertos y matrices densas a 4-bit con grupos de 64 pesos, mientras mantiene en 16-bit el GDN, los parámetros recurrentes, las normalizaciones, el indexador QSA y la cabeza MTP. El runtime MTPLX implementa decodificación especulativa con una profundidad adaptativa de hasta 3 tokens, aceptando borradores mediante la regla de razón de probabilidad con remuestreo residual, lo que garantiza que la salida sigue la distribución del modelo original. No se dispone de información sobre el entrenamiento del modelo base (datos, tokens, método de alineación).

## Capacidades

- Generación de texto y chat conversacional con contexto de hasta 262.144 tokens.
- Generación de código con alta velocidad gracias a la decodificación especulativa MTP.
- Procesamiento multimodal (visión) preservado en los pesos, aunque no se detalla su funcionamiento en esta versión.
- Decodificación especulativa nativa con cabeza de multi-token prediction (hasta 3 tokens de profundidad adaptativa).
- Ejecución local en Apple Silicon mediante el runtime MTPLX, con transmisión de la tabla n-gram desde SSD.
- Soporte de muestreo con la configuración oficial de Qwen (temperatura 1.0, top-p 0.95, top-k 20).

## Casos de uso

- **Asistente de programación local**: un desarrollador puede ejecutar el modelo en un MacBook Pro con M5 Max y obtener velocidades de 75,9 tokens por segundo en tareas de código, gracias a la decodificación especulativa. Es adecuado para autocompletado y generación de funciones sin enviar código a la nube.
- **Análisis de documentos extensos**: con 262.144 tokens de contexto, permite procesar libros técnicos, contratos o bases de código completas en una sola pasada, manteniendo la coherencia a lo largo de la conversación.
- **Chat privado sin conexión**: al ejecutarse localmente, garantiza la confidencialidad de los datos, útil para empresas con políticas estrictas de privacidad.
- **Prototipado de agentes conversacionales**: la baja latencia (75,9 tok/s) permite iterar rápidamente en el diseño de flujos multi-turno, aunque no se ha confirmado soporte de tool calling en esta versión.
- **Investigación en eficiencia de inferencia**: sirve como banco de pruebas para estudiar el impacto de la cuantización 4-bit y la decodificación especulativa en arquitecturas MoE híbridas.
- **Generación de contenido creativo**: su capacidad de muestreo con la configuración oficial de Qwen produce textos variados y coherentes, adecuados para redacción, guiones o documentación técnica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card solo proporciona mediciones de velocidad en un M5 Max con ventiladores al máximo, usando el servidor real `mtplx serve` y muestreo oficial de Qwen:

| Tarea | Velocidad (tok/s) |
|---|---|
| Tarea de código, decodificación especulativa MTP (por defecto) | 75,9 |
| Misma tarea, autoregresivo plano | 47,0 |

El multiplicador especulativo es de 1,6x en el camino de servidor, con salida muestreada que sigue la distribución del modelo.

## Requisitos de hardware

- **Memoria**: 96 GB o más de memoria unificada en Apple Silicon. Los pesos residentes ocupan ~74 GB (con la tabla n-gram en SSD), más el conjunto de trabajo.
- **GPU**: cualquier chip Apple Silicon con 96 GB+ (M5 Max recomendado para las velocidades medidas; modelos inferiores pueden ser más lentos).
- **Almacenamiento**: la tabla n-gram de 32 GB se transmite desde SSD por defecto; se recomienda un SSD rápido (NVMe) para evitar cuellos de botella.
- **Despliegue**: mediante la aplicación de escritorio de MTPLX o la CLI `mtplx serve --model Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed`.
- **Latencia**: 75,9 tok/s en M5 Max con decodificación especulativa; 47,0 tok/s en modo autoregresivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Velocidad (M5 Max) | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTPLX-Bare-Speed | 125B-A6B + 51B n-gram | 262.144 | 4-bit flat | 75,9 tok/s (MTP) | qwen-community-1.0 |
| Qwen3.8-Flash-Next-MTPLX-Optimized-Speed | 125B-A6B + 51B n-gram | 262.144 | 4-bit dinámica + 8-bit atención | algo más lento | qwen-community-1.0 |
| Qwen/Qwen3.8-Flash-Next (base) | 125B-A6B + 51B n-gram | 262.144 | BF16/FP16 | no disponible (requiere GPU) | qwen-community-1.0 |

La versión Bare Speed prioriza la velocidad bruta frente a la Optimized Speed, que ofrece mayor calidad mediante cuantización dinámica y atención en 8-bit. El modelo base sin cuantizar requiere hardware de datacenter (varias GPUs) y no es viable en Apple Silicon.

## Limitaciones y advertencias

- **Cuantización agresiva**: la cuantización plana de 4-bit en todos los expertos puede degradar la calidad de salida en tareas que requieren precisión numérica o razonamiento complejo.
- **Hardware específico**: solo funciona en Apple Silicon con 96 GB+ de memoria unificada; no es compatible con GPUs NVIDIA o AMD.
- **Modelo experimental**: Qwen3.8-Flash-Next es un preview de la generación Qwen4, por lo que puede contener errores o comportamientos inesperados.
- **Dependencia de SSD**: la tabla n-gram se transmite desde SSD por defecto; si el SSD es lento o está saturado, la latencia puede aumentar significativamente.
- **Licencia qwen-community-1.0**: permite uso comercial pero con restricciones; se recomienda revisar los términos completos en el repositorio del modelo base.
- **Sin datos de benchmarks de calidad**: no se han publicado resultados de MMLU, HumanEval u otros, por lo que no es posible comparar su rendimiento académico con otros modelos.
- **Idiomas no especificados**: la model card no indica qué idiomas soporta; se asume que hereda los del modelo base, pero no está confirmado.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed)
- [Versión Optimized Speed](https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed)
- [Modelo base Qwen/Qwen3.8-Flash-Next](https://huggingface.co/Qwen/Qwen3.8-Flash-Next)
- [Sitio de MTPLX](https://mtplx.com)
- [Repositorio GitHub de Qwen3.8-Flash-Next](https://github.com/QwenLM/Qwen3.8-Flash-Next/)
