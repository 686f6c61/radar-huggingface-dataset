# vinccniv/sa8797p-qwen3vl-4b-bundles

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue (bundle) para ejecutar el modelo multimodal Qwen/Qwen3-VL-4B-Instruct sobre el SoC Qualcomm SA8797P, un chip de la familia Snapdragon para automoción con acelerador Hexagon v81 HTP. El autor, vinccniv, ha compilado los binarios del runtime Qualcomm QNN/Genie (QAIRT 2.48.40.260702, libGenie 1.19) junto con el pipeline completo de inferencia imagen+texto a texto, cuantizado en W8A16, incluyendo prefill de past-KV y un kit de prueba de seis imágenes de climatología y carretera.

La relevancia de este bundle es práctica: permite evaluar la viabilidad de ejecutar un modelo de visión-lenguaje de 4B parámetros en hardware de borde automotriz, sin depender de GPU externa. Sin embargo, es fundamental advertir que el autor declara explícitamente que **nada de este repositorio ha sido ejecutado en un dispositivo SA8797P real**. La validación se ha realizado únicamente en host (x86) mediante simulación, reproduciendo token a token la salida de `generate` de HuggingFace. No se ofrecen cifras de rendimiento (tok/s, TTFT) porque no se han medido en el hardware objetivo.

El repositorio incluye dos versiones: la v1 (`qwen3vl_4b_e2e_pipeline/`) que falla al cargar y se mantiene como referencia del error, y la v2 (`qwen3vl_4b_e2e_pipeline_v2/`) que es la versión funcional actual. Los bundles de torre de visión y texto independientes fueron eliminados por problemas de compatibilidad.

## Especificaciones técnicas

La tabla siguiente combina datos del modelo base (Qwen3-VL-4B-Instruct) con los del bundle. Los datos del modelo base provienen de la documentación pública de Qwen3-VL; los del bundle, de la model card del autor.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con torre ViT y torre de texto (modelo base Qwen3-VL-4B-Instruct) |
| Parametros totales | 4B (modelo base; no se especifican en el bundle) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 256K tokens (modelo base; el bundle usa prefill de past-KV troceado) |
| Tipos de cuantizacion | W8A16 (pesos 8 bits, activaciones 16 bits) para torre de texto y torre de visión; I/O en `UFIXED_POINT_16` |
| Idiomas soportados | No disponible (modelo base multilingüe, pero el bundle no especifica) |
| Licencia | Apache-2.0 para el bundle; los binarios del runtime Qualcomm (QAIRT, Genie) se redistribuyen bajo licencia SDK de Qualcomm, no cubierta por Apache-2.0 |
| Formato de pesos | Binarios QNN/Genie (context binaries, no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-4B-Instruct es un modelo de visión-lenguaje denso de 4B parámetros, parte de la familia Qwen3-VL, que soporta contextos intercalados de hasta 256K tokens combinando texto, imágenes y vídeo. El entrenamiento del modelo base incluye fases de preentrenamiento y ajuste fino con datos multimodales intercalados, así como técnicas de alineación (RLHF/DPO) según la documentación oficial de Qwen3-VL. No se dispone de detalles específicos de composición del dataset ni del número exacto de tokens de entrenamiento en la información proporcionada.

El bundle, por su parte, no introduce cambios arquitectónicos: es una compilación del modelo base para el runtime Genie de Qualcomm. La innovación técnica del repositorio reside en la construcción del pipeline de inferencia: cuantización W8A16 (pesos en 8 bits, activaciones en 16 bits), prefill de past-KV troceado para gestionar el contexto largo, y un modo de solo decodificación como respaldo. La validación host-side reproduce la salida de HuggingFace `generate` token a token en cuatro cadenas independientes, lo que confirma la corrección numérica del pipeline bajo el patrón de alimentación del runtime.

## Capacidades

- Generación de texto y razonamiento multimodal: el modelo base Qwen3-VL-4B-Instruct puede procesar imágenes, vídeo y texto, respondiendo con texto coherente.
- Comprensión visual profunda: percepción de objetos, escenas, relaciones espaciales y dinámicas de vídeo (capacidad del modelo base).
- Soporte de tool calling y function calling: el modelo base está entrenado para usar herramientas, aunque el bundle no documenta explícitamente su habilitación en el runtime.
- Capacidades de agente y razonamiento multi-paso: el modelo base admite modos de razonamiento extendido (thinking mode) y planificación.
- Capacidades multilingües: el modelo base soporta múltiples idiomas, aunque el bundle no especifica cuáles.
- Pipeline específico del bundle: entrada de imagen (single o múltiple, hasta 6 imágenes en el kit de prueba) más texto, salida de texto; prefill de past-KV troceado para contexto largo; modo de solo decodificación como respaldo.

## Casos de uso

- Asistente de asistencia al conductor en vehículos: el bundle está diseñado para el SoC SA8797P, un chip automotriz. Puede procesar imágenes de cámaras del vehículo (por ejemplo, condiciones meteorológicas o estado de la carretera) y generar descripciones o alertas en tiempo real, aprovechando la inferencia local sin conexión a la nube.
- Análisis de imágenes de cámaras de vigilancia en entornos embarcados: con el kit de prueba de seis imágenes (clima y carretera), el bundle permite evaluar la generación de descripciones de escenas en dispositivos con restricciones de energía y memoria.
- Prototipado de aplicaciones de visión-lenguaje en hardware Qualcomm: desarrolladores que trabajan con el SDK Genie pueden usar este bundle como referencia para integrar Qwen3-VL-4B en sus propias pipelines, partiendo de un ejemplo validado numéricamente.
- Evaluación de cuantización W8A16 en modelos multimodales: el bundle sirve como banco de pruebas para medir el impacto de la cuantización en la calidad de salida en comparación con el modelo FP16 original.
- Despliegue de asistentes conversacionales con contexto visual en dispositivos de borde: el modelo base soporta contextos largos (256K tokens), lo que permite mantener historiales extensos de conversación con referencias a imágenes previas.
- Investigación en inferencia eficiente para automoción: el bundle permite estudiar la viabilidad de ejecutar modelos de 4B en HTP (Hexagon Tensor Processor) y comparar con otras plataformas de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor declara explícitamente que **no se ha medido ninguna métrica de rendimiento** (tok/s, TTFT) para este modelo en el dispositivo SA8797P. La única validación existente es numérica: la reproducción token a token de la salida de HuggingFace `generate` en el host, lo que confirma la corrección del pipeline, pero no su velocidad ni latencia en el hardware objetivo.

## Requisitos de hardware

- Hardware objetivo: SoC Qualcomm SA8797P (Hexagon v81 HTP, Android GVM). No se requiere GPU externa; la inferencia se ejecuta en el acelerador HTP del SoC.
- Memoria: no se especifica la VRAM o memoria del sistema necesaria. El tamaño del repositorio es de 16.5 GB, que incluye binarios del runtime y los bundles; la memoria en el dispositivo dependerá de la cuantización (W8A16) y del tamaño del contexto.
- Despliegue: mediante `adb push` del directorio `qwen3vl_4b_e2e_pipeline_v2` al dispositivo y ejecución con `genie-app` y el script `genie_pipeline_qwen3vl.script`.
- Runtime: QAIRT 2.48.40.260702 y libGenie 1.19, incluidos en el bundle (binarios aarch64).
- No aplican opciones como vLLM, llama.cpp u Ollama, ya que el bundle es específico del runtime Genie de Qualcomm.
- Latencia y throughput: no disponibles; no se han medido en el hardware objetivo.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo independiente sino un bundle de despliegue para un hardware concreto. No existen datos comparativos con otros bundles similares en la información proporcionada. Para comparar el modelo base Qwen3-VL-4B-Instruct con otros modelos de su categoría, se puede consultar la documentación oficial de Qwen3-VL, pero dicha comparativa no se incluye aquí por falta de datos en la información disponible.

## Limitaciones y advertencias

- **Sin validación en hardware real**: el autor afirma que nada ha sido ejecutado en un SA8797P. La validación es únicamente host-side (x86) mediante simulación; los context binaries no pueden ejecutarse en x86 y el SDK no tiene ruta x86 para W8A16.
- **Riesgo de fallo en producción**: la versión v1 del pipeline no cargaba; la v2 supera la comprobación de carga en simulación, pero no se garantiza su funcionamiento en el dispositivo real.
- **Licencia mixta**: el bundle se publica bajo Apache-2.0, pero los binarios del runtime Qualcomm (QAIRT, Genie) se redistribuyen bajo la licencia SDK de Qualcomm, que no está cubierta por Apache-2.0. Es necesario revisar los términos de Qualcomm antes de cualquier uso comercial.
- **Sin métricas de rendimiento**: no hay datos de tok/s ni TTFT; cualquier extrapolación sería especulativa.
- **Limitaciones del modelo base**: como todo LLM, puede alucinar, mostrar sesgos presentes en los datos de entrenamiento y tener limitaciones en idiomas o dominios específicos. El bundle no mitiga estos riesgos.
- **Dependencia de SDK específico**: el bundle está construido contra QAIRT 2.48.40.260702 y libGenie 1.19; no se garantiza compatibilidad con otras versiones del SDK.
- **Formato de pesos no estándar**: al ser binarios QNN/Genie, no son compatibles con herramientas estándar de inferencia (transformers, vLLM, etc.) fuera del ecosistema Qualcomm.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vinccniv/sa8797p-qwen3vl-4b-bundles
- Perfil del autor en HuggingFace: https://huggingface.co/vinccniv
- GitHub de Qwen3-VL (modelo base): https://github.com/QwenLM/Qwen3-VL
- Technical Report de Qwen3-VL (arXiv): https://arxiv.org/abs/2511.21631
