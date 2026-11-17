# taobao-mnn/Hunyuan-7B-Instruct-MNN

## Resumen

Hunyuan-7B-Instruct-MNN es un paquete de inferencia de texto en formato MNN derivado del modelo Tencent Hunyuan-7B-Instruct, publicado por el equipo taobao-mnn. No se trata de un modelo nuevo entrenado desde cero, sino de una conversión cuantizada del modelo original de Tencent, empaquetada para su ejecución con el motor MNN (Mobile Neural Network) de Alibaba. El objetivo es permitir el despliegue del modelo en entornos CPU con requisitos de memoria reducidos, manteniendo únicamente el módulo de lenguaje.

El modelo base declara la arquitectura `HunYuanDenseV1ForCausalLM` (model_type `hunyuan_v1_dense`) con 32 capas de lenguaje y sin expertos de enrutamiento, es decir, una arquitectura transformer densa. La configuración declara `max_position_embeddings=32768`, aunque el autor advierte explícitamente que este valor no constituye una ventana de contexto medida empíricamente. La cuantización se realiza con HQQ (Half-Quadratic Quantization): pesos lineales del tronco en 4 bits y cabeza de salida LM en 8 bits, ambos con bloque de 64.

Su relevancia radica en que ofrece una vía de despliegue de un modelo de 7B en CPU x64 sin GPU, con un paquete autocontenido (pesos, tokenizador, plantilla y configuración) y un proceso de exportación reproducible a partir de un commit fijo del exportador de MNN. La validación publicada es deliberadamente acotada: solo se ha verificado en CPU x64, sin cobertura de ARM FP16, Metal, OpenCL, Vulkan, CUDA ni dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa, `HunYuanDenseV1ForCausalLM` (`hunyuan_v1_dense`), 32 capas de lenguaje |
| Parametros totales | no disponible (el autor indica que no se debe inferir de la etiqueta "7B" del nombre) |
| Parametros activos | no aplica (modelo denso, sin expertos de enrutamiento) |
| Longitud de contexto | `max_position_embeddings=32768` en configuración; no es un contexto máximo verificado |
| Tipos de cuantizacion | HQQ 4 bits (tronco lineal, block=64, alpha FP16, sym=false); HQQ 8 bits (cabeza LM, block=64, alpha FP16, sym=false); embeddings comparten los pesos cuantizados de la cabeza LM |
| Idiomas soportados | chino (zh) e inglés (en) |
| Licencia | TENCENT HUNYUAN COMMUNITY LICENSE AGREEMENT (metadato `other`) |
| Formato de pesos | MNN (paquete de inferencia con grafo, tokenizador, plantilla y configuración) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso de 32 capas de lenguaje, identificado en la configuración del modelo base como `HunYuanDenseV1ForCausalLM` con model_type `hunyuan_v1_dense`. La configuración no declara expertos de enrutamiento, por lo que no se trata de un modelo MoE. El paquete MNN exporta exclusivamente el módulo de lenguaje: entrada y salida son texto, sin componentes de visión, audio o vídeo.

El proceso de conversión emplea el exportador oficial de MNN en un commit fijo (`b0239771b07b317a258fbc384683bbd540741406`), con cuantización HQQ de 4 bits para los pesos lineales del tronco y de 8 bits para la cabeza de salida LM, bloque de 64 y escalas en FP16. La verificación de alineación FP32 entre la implementación de origen y el exportador cubre prefill, decode, embedding, capas representativas, normalización y logits en las 32 capas completas, aunque el autor aclara que esto no implica coincidencia token a token de la salida cuantizada. No se detallan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto en chino e inglés, con soporte de conversación multi-turno mediante plantilla Jinja.
- Razonamiento aritmético básico y traducción, cubiertos por los casos de validación del autor (greeting, arithmetic, translation, long_translation).
- Traducción de textos largos: el caso de validación `long_translation` alcanzó 855 tokens de prompt.
- Inferencia determinista en CPU x64 con decodificación greedy y precisión alta, verificada con parada natural y sin caracteres de reemplazo ni repeticiones anómalas.
- Muestreo configurable con penalización de repetición (1.05 por defecto), top-k (20), top-p (0.8), min-p (0) y temperatura (0.7).
- Modo de pensamiento (thinking) controlable mediante contexto Jinja (`{"enable_thinking": false}`); por defecto la clasificación de razonamiento es `none` y no se desactiva el pensamiento forzado.
- No se ha verificado soporte de tool calling, function calling, agentes, visión, audio ni vídeo en este paquete.

## Casos de uso

- Despliegue en servidores sin GPU: el paquete está validado en CPU x64 con backend `cpu` y memoria baja, lo que permite servir generación de texto en infraestructura convencional sin aceleradores dedicados.
- Traducción chino-inglés de documentos: el caso de validación con 855 tokens de entrada demuestra manejo de pasajes largos dentro de la plantilla, adecuado para traducción de párrafos y secciones.
- Asistentes conversacionales en aplicaciones de escritorio: la integración con MNN permite embeber el modelo en aplicaciones nativas que ya usan este motor, con un límite de generación por defecto de 512 tokens.
- Prototipado y evaluación de modelos cuantizados: el paquete incluye `export_args.json` y `refresh_metadata.json`, lo que facilita reproducir la conversión y comparar el comportamiento del modelo cuantizado frente al original.
- Procesamiento por lotes de preguntas y respuestas: con muestreo determinista (greedy) y 8 hilos se obtienen salidas reproducibles, útil para tareas de clasificación o extracción sobre texto.
- Entornos con restricciones de memoria: la cuantización HQQ 4/8 bits y la opción `MNN_LOW_MEMORY` reducen la huella del paquete de 9,5 GB, permitiendo ejecución en máquinas con RAM limitada.
- Pipelines de CI para validación de exportaciones: el proceso de compilación y exportación documentado con commit fijo permite automatizar la regeneración y verificación del paquete.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no publica cifras de rendimiento ni de memoria por dispositivo, y que las pruebas de validación (alineación FP32, determinismo y smoke test con configuración por defecto) no constituyen una evaluación de precisión global.

## Requisitos de hardware

- VRAM: no aplica para el escenario validado, que es CPU x64; no se han publicado cifras de memoria por dispositivo.
- GPU recomendadas: no disponible; el autor no ha verificado CUDA, Metal, OpenCL ni Vulkan.
- GPU de consumo: no verificado; el paquete solo está validado en CPU x64.
- CPU: se requiere MNN 3.6.2 o el commit `b0239771b07b317a258fbc384683bbd540741406`, compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`.
- Despliegue: motor MNN con el binario `llm_demo`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato de pesos es MNN y no GGUF ni safetensors.
- Latencia y throughput: no disponibles; el autor no publica mediciones de velocidad.
- Configuración por defecto: backend `cpu`, memoria `low`, 4 hilos, precisión `low`, generación máxima de 512 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Validacion |
|---|---|---|---|---|---|
| Hunyuan-7B-Instruct-MNN (este) | no disponible (denso, 32 capas) | 32768 declarados, no verificados | MNN, HQQ 4/8 bits | Tencent Hunyuan Community License | CPU x64 únicamente |
| tencent/Hunyuan-7B-Instruct (base) | no disponible en la información | 32768 declarados | safetensors (formato del modelo original) | Tencent Hunyuan Community License | Evaluaciones del autor original no incluidas |
| Otras conversiones MNN de modelos 7B | no disponible | no disponible | MNN | según modelo base | no disponible |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Validación restringida: solo se ha verificado en CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles quedan sin validar.
- El valor `max_position_embeddings=32768` es un campo de configuración, no una ventana de contexto medida; los casos de prueba llegaron como máximo a 855 tokens de prompt.
- La cuantización HQQ 4/8 bits puede degradar la calidad de salida respecto al modelo original; el autor advierte que la salida cuantizada puede contener errores.
- No se han publicado cifras de precisión, latencia ni memoria, por lo que no es posible estimar el rendimiento en producción a partir de la información disponible.
- Idiomas limitados a chino e inglés; no se declara soporte de otros idiomas.
- La licencia Tencent Hunyuan Community License Agreement impone obligaciones de atribución y políticas de uso; la conversión cuantizada no amplía los derechos concedidos por el modelo original.
- El paquete debe actualizarse de forma integral (grafo, pesos, tokenizador, embeddings, plantilla y configuración); mezclar revisiones o sustituir solo el archivo de grafo puede producir fallos.
- El límite de generación por defecto es de 512 tokens; las respuestas más largas requieren ajustar la configuración de ejecución.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones específicas de sesgos en esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Hunyuan-7B-Instruct-MNN
- Modelo original (ModelScope): https://modelscope.cn/models/Tencent-Hunyuan/Hunyuan-7B-Instruct/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador MNN (commit fijo): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io
- Licencia: https://huggingface.co/taobao-mnn/Hunyuan-7B-Instruct-MNN/blob/main/LICENSE
