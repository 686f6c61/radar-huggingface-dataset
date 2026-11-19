# UGREENDEV/RK1828-MLLM-Gemma-4-E4B-it

## Resumen

RK1828-MLLM-Gemma-4-E4B-it es una conversión al formato RKNN del modelo multimodal google/gemma-4-E4B-it, publicada por UGREENDEV para su ejecución sobre el acelerador NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado específico para hardware embebido: el repositorio contiene los artefactos listos para desplegar en el chip RK1828 con el runtime RKNN v1.1.0, incluyendo los módulos de visión, audio y el LLM cuantizados en w4a16.

El modelo base es un MLLM (multimodal large language model) de la familia Gemma 4, con pipeline declarado como `any-to-any`, lo que indica soporte de entrada y salida multimodal (texto, imagen y audio). El repositorio ofrece dos configuraciones precompiladas que se diferencian en la longitud de contexto del LLM (12k y 28k tokens) y en el formato de la KVCache (fp16 o int4), con resolución de visión fija de 384x384 y ventanas de audio de 756 mel-frames.

Su relevancia es acotada pero clara: permite ejecutar un modelo multimodal de la familia Gemma en un SoC con NPU dedicada sin necesidad de GPU, algo relevante para dispositivos de borde, electrónica de consumo y sistemas empotrados. La licencia declarada es Apache 2.0, aunque el uso está condicionado por los términos del runtime y toolkit de RKNN, y el despliegue solo es posible en el chip RK1828.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM (visión + audio + LLM) convertido a RKNN; arquitectura interna del modelo base no detallada en la información disponible |
| Parametros totales | no disponible (el nombre "E4B" sugiere ~4B efectivos, sin confirmación en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | 12288 tokens (config. estándar) o 28672 tokens (config. con KVCache int4) |
| Tipos de cuantizacion | w4a16 en visión, audio y LLM; KVCache fp16 o int4 según configuración |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio de 10,9 GB |
| Resolucion de vision | 384x384 |
| Ventana de audio | 756 mel-frames |
| Nucleos NPU | 8 (visión), 8 (audio), 8 (LLM) |
| Chips soportados | RK1828 |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base ni su proceso de entrenamiento; se limita al empaquetado RKNN. Lo que sí se detalla es la estructura del despliegue: tres componentes diferenciados (visión, audio y LLM) compilados para la NPU del RK1828, cada uno ejecutándose en 8 núcleos NPU, con cuantización w4a16 en los tres módulos. La visión opera a 384x384 y el audio a 756 mel-frames por fragmento.

La innovación técnica relevante aquí no está en el entrenamiento, sino en la conversión: la posibilidad de mantener dos perfiles de contexto (12k con KVCache en fp16 y 28k con KVCache en int4) demuestra un compromiso explícito entre memoria y longitud de contexto en un entorno con recursos muy limitados. No se proporcionan datos sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO, ya que esa información corresponde al modelo base y no se incluye en esta ficha.

## Capacidades

- Procesamiento multimodal any-to-any: entrada de texto, imagen y audio, con generación de texto.
- Comprensión de imágenes a resolución 384x384, adecuada para tareas de descripción, OCR básico y VQA en dispositivos de borde.
- Procesamiento de audio en fragmentos de 756 mel-frames, orientado a transcripción o comprensión de voz.
- Conversación multi-turno con contexto de hasta 12k o 28k tokens según configuración.
- Razonamiento y generación de texto heredados del modelo base Gemma 4 E4B.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistentes de voz en dispositivos empotrados: el módulo de audio con ventanas de 756 mel-frames permite procesar voz en local sobre la NPU del RK1828, sin enviar datos a la nube, útil en electrodomésticos o wearables con requisitos de privacidad.
- Descripción de imágenes en cámaras inteligentes: la entrada de visión a 384x384 posibilita tareas de captioning o detección descriptiva en dispositivos de vigilancia o domótica que integren el RK1828.
- Interfaces conversacionales sin conectividad: con contexto de 12k tokens y ejecución totalmente local, el modelo puede gestionar diálogos multi-turno en terminales de atención al público o paneles de control industriales.
- Procesamiento de documentos escaneados: combinando visión y texto, puede extraer y resumir información de facturas, etiquetas o formularios capturados por cámara en un dispositivo de mano.
- Automatización industrial con entrada multimodal: en líneas de producción, el modelo puede recibir imágenes de inspección junto con instrucciones en texto y generar informes o alertas descriptivas.
- Kioscos interactivos y señalización digital: la configuración de 28k tokens con KVCache int4 permite mantener conversaciones largas con contexto acumulado en pantallas interactivas con hardware de bajo consumo.
- Prototipado de producto en hardware Rockchip: sirve como referencia para validar pipelines MLLM completos (visión + audio + LLM) en silicio RK1828 antes de diseñar un producto final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip obligatorio: Rockchip RK1828. El modelo no está pensado para GPU ni CPU convencionales.
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v`.
- Memoria: el repositorio completo ocupa 10,9 GB; la configuración de 28k con KVCache int4 reduce el consumo frente a la de 12k con fp16, aunque no se especifican cifras exactas de RAM/NPU.
- NPU: 8 núcleos asignados a cada módulo (visión, audio, LLM).
- Cabe en GPU de consumo: no aplica; el formato RKNN es específico de la NPU Rockchip.
- Opciones de despliegue: exclusivamente el stack RKNN (toolkit y runtime) sobre RK1828; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia |
|---|---|---|---|---|---|
| RK1828-MLLM-Gemma-4-E4B-it | no disponible (~4B efectivos por nombre) | 12k / 28k | RKNN | NPU RK1828 | Apache 2.0 (+ términos RKNN) |
| google/gemma-4-E4B-it | no disponible (~4B efectivos por nombre) | no disponible | safetensors (presumible) | GPU/CPU | Apache 2.0 |
| Otros MLLM de borde (p. ej. Gemma 3n, Qwen2-VL-2B) | ~2-4B | variable | GGUF, safetensors | GPU, CPU, NPU según build | variable |

La comparación directa con alternativas es limitada porque este repositorio es una conversión de hardware, no un modelo independiente. Frente al modelo base original, la diferencia clave es la portabilidad a NPU RK1828 a costa de cuantización w4a16 y de la dependencia del runtime propietario.

## Limitaciones y advertencias

- Dependencia total del hardware RK1828 y del runtime RKNN v1.1.0; no es ejecutable en GPU, CPU ni otros aceleradores.
- La cuantización w4a16 en visión, audio y LLM puede degradar la calidad respecto al modelo base en fp16/bf16, especialmente en tareas de precisión (OCR fino, matemáticas, razonamiento complejo).
- La resolución de visión está fijada en 384x384, lo que limita la lectura de texto pequeño o detalles finos en imágenes.
- El contexto máximo es de 28k tokens y solo con KVCache int4; la configuración de 12k con fp16 ofrece menor ventana.
- No se documentan idiomas soportados ni sesgos conocidos del modelo base en esta ficha.
- Riesgo de alucinación inherente a los modelos generativos, agravado por la cuantización agresiva.
- La licencia Apache 2.0 del modelo base convive con los términos del RKNN Toolkit y Runtime, que pueden imponer restricciones adicionales al uso comercial o a la redistribución.
- Los ficheros de una configuración deben usarse conjuntamente; mezclar configuraciones o versiones de runtime puede provocar fallos.
- Verificar siempre la integridad con `sha256sum -c SHA256SUMS` antes del despliegue.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK1828-MLLM-Gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK1828-MLLM-Gemma-4-E4B-it --revision master`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK1828-MLLM-Gemma-4-E4B-it --revision v1.1.0`
- Documentación de configuraciones: subdirectorios `Gemma-4-E4B-it-384x384-756frames-w4a16-8-12288/` y `Gemma-4-E4B-it-384x384-756frames-w4a16-8-28672-kv-int4/` dentro del repositorio
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
