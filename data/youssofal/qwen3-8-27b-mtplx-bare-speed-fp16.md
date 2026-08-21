# Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed-FP16

## Resumen

Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed-FP16 es una cuantización MLX de 4 bits del modelo Qwen3.8-27B, desarrollada por Youssofal y publicada bajo licencia Apache 2.0. Su objetivo principal es ejecutar un LLM de 27B parámetros en Macs con Apple Silicon (M1 y M2) de forma eficiente, aprovechando la memoria unificada y técnicas de decodificación especulativa y multi-token prediction (MTP). El modelo conserva la cabeza MTP nativa del modelo base, que la mayoría de los runtimes eliminan al cargar, y la calibra para mantener la calidad.

Esta versión FP16 está pensada específicamente para M1 y M2, ya que estos chips no manejan bien bf16; los tensores flotantes (escalas, sesgos, normas, la convolución GDN y los parámetros de estado, y la cabeza MTP) se almacenan en fp16, mientras que los pesos cuantizados permanecen idénticos al padre. El resultado es una velocidad de generación de hasta 65.2 tok/s en un M5 Max (según el autor), con una ventana de contexto de 262,144 tokens. Es relevante porque permite desplegar un modelo de 27B en hardware de consumo de Apple con rendimiento competitivo, sin necesidad de GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con multi-token prediction (MTP) y decodificacion especulativa |
| Parametros totales | 27B (modelo base Qwen3.8-27B); el checkpoint cuantizado contiene 4.665.462.000 parametros segun safetensors |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4-bit MLX (pesos cuantizados) + FP16 para tensores flotantes (escalas, sesgos, normas, GDN, MTP head) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantizacion 4-bit del Qwen3.8-27B original, realizada con la libreria MLX. La innovacion principal es que conserva la cabeza de multi-token prediction (MTP) del modelo base, que normalmente se descarta al cargar el modelo en otros runtimes. Esta cabeza permite que el modelo prediga varios tokens a la vez, y se combina con un mecanismo de decodificacion especulativa: el modelo genera borradores de varios tokens y los acepta o rechaza segun una regla de proporcion de probabilidad con resampling residual, lo que garantiza que la salida final sea identica a la del modelo sin especulacion, independientemente de la temperatura.

El entrenamiento original del Qwen3.8-27B no se detalla en la informacion disponible; solo se sabe que es un modelo de la familia Qwen3.8. Esta version FP16 no ha sido reentrenada, sino que es una conversion de precision: los pesos cuantizados se mantienen byte a byte identicos al padre, y solo los tensores flotantes se convierten de bf16 a fp16 para mejorar la compatibilidad con M1 y M2. El autor indica que la temperatura del sampler de borradores esta fijada en 0.6, valor medido como optimo para esta compilacion.

## Capacidades

- Generacion de texto y chat conversacional, heredadas del modelo base Qwen3.8-27B.
- Razonamiento, matematicas y generacion de codigo, segun las capacidades del modelo original (no se proporcionan detalles especificos).
- Decodificacion especulativa con multi-token prediction, que acelera la inferencia sin degradar la calidad de la salida.
- Soporte de ventana de contexto larga (262.144 tokens), util para tareas que requieren mucho contexto.
- Compatibilidad con Apple Silicon M1 y M2 gracias a la conversion a FP16.
- Integracion con la herramienta MTPLX (app y CLI) para facilitar el despliegue local.

## Casos de uso

- Asistente de chat local en Mac: el modelo puede ejecutarse en un Mac con M1 o M2 y ofrecer respuestas conversacionales con baja latencia, gracias a la decodificacion especulativa. Es adecuado para prototipos y aplicaciones de escritorio que requieran privacidad.
- Generacion de codigo en entornos sin GPU: un desarrollador puede usar el modelo para autocompletar o generar fragmentos de codigo directamente en su Mac, sin depender de servicios en la nube. La ventana de contexto larga permite incluir archivos completos como contexto.
- Analisis de documentos largos: con 262.144 tokens de contexto, el modelo puede procesar informes, articulos o libros enteros y resumirlos o extraer informacion, todo localmente.
- Educacion y aprendizaje: sirve como herramienta de tutoria para explicar conceptos de programacion o matematicas, aprovechando su capacidad de razonamiento.
- Desarrollo de agentes conversacionales: aunque no se confirma soporte de tool calling, el modelo puede integrarse en pipelines de agentes simples que requieran generacion de texto y razonamiento multi-paso.
- Pruebas de concepto de LLMs en hardware de consumo: investigadores pueden evaluar el rendimiento de un modelo de 27B en Macs sin necesidad de GPUs dedicadas, gracias a la cuantizacion y la optimizacion MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona velocidades de 65.2 tok/s en una tarea de codigo y 32.4 tok/s sostenidos en una respuesta de 52.740 tokens, medidos en un M5 Max para el modelo padre (no para esta version FP16). No hay datos de MMLU, HumanEval, GSM8K u otros benchmarks estandar.

## Requisitos de hardware

- Mac con Apple Silicon M1 o M2 (la version FP16 esta disenada para estos chips; en M3 o superiores se recomienda el modelo padre en bf16).
- Memoria unificada: el autor indica un pico de 17.0 GB para el modelo padre en M5 Max; esta version FP16 tiene un tamano de descarga de 16.0 GB, por lo que se estima un uso de memoria similar. Se recomienda al menos 24 GB de RAM unificada para comodidad.
- No requiere GPU dedicada; usa la memoria unificada del SoC.
- Despliegue: mediante la app MTPLX (disponible en mtplx.com) o la CLI `mtplx serve --model Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed-FP16`.
- Latencia y throughput: no se han publicado mediciones especificas para M1/M2; el autor indica que dependen del chip.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Plataforma |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262.144 | bf16 | Apache 2.0 | Multiplataforma |
| Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed (padre) | 27B | 262.144 | 4-bit MLX + bf16 | Apache 2.0 | Apple Silicon M3+ |
| Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed-FP16 (este) | 27B | 262.144 | 4-bit MLX + fp16 | Apache 2.0 | Apple Silicon M1/M2 |

La comparativa se limita a las variantes del mismo modelo; no se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una cuantizacion del Qwen3.8-27B, hereda los sesgos y limitaciones del modelo original, que no se detallan en la informacion disponible.
- Rendimiento en tareas largas: el autor advierte que esta version "Bare Speed" prioriza la velocidad de respuesta corta y puede tener menor calidad y ser mas lenta en tareas de codificacion largas.
- Compatibilidad: esta disenada exclusivamente para M1 y M2; en M3 o superiores se recomienda usar el modelo padre en bf16.
- Sin soporte de tool calling confirmado: no se menciona en la documentacion, por lo que no se puede garantizar su uso en agentes con funciones externas.
- Dependencia de MTPLX: el despliegue optimo requiere la herramienta MTPLX, que es propietaria (aunque el modelo es de codigo abierto).
- Licencia Apache 2.0: permite uso comercial, pero se debe respetar la atribucion y las condiciones de la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed-FP16
- Modelo padre (Bare Speed): https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Bare-Speed
- Repositorio GitHub de MTPLX: https://github.com/youssofal/mtplx
- Sitio web de MTPLX: https://mtplx.com
- Otras variantes FP16: [Optimized Speed FP16](https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Speed-FP16) y [Optimized Quality FP16](https://huggingface.co/Youssofal/Qwen3.8-27B-MTPLX-Optimized-Quality-FP16)
