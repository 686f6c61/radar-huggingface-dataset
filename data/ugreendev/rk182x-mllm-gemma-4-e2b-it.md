# UGREENDEV/RK182X-MLLM-Gemma-4-E2B-it

## Resumen

RK182X-MLLM-Gemma-4-E2B-it es una conversión al formato RKNN del modelo multimodal google/gemma-4-E2B-it, publicada por UGREENDEV para su despliegue sobre el NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de una cuantización y empaquetado del Gemma 4 E2B instructivo de Google, con pesos en w4a16 para las torres de visión, audio y el LLM, pensada para ejecución en hardware embebido con aceleración NPU.

El modelo conserva la naturaleza "any-to-any" del original (entrada y salida multimodal, con soporte de imagen, audio y texto) y se distribuye en dos configuraciones que difieren en la longitud de contexto del LLM y en el tipo de KVCache: una con 102.912 tokens y KVCache int4, y otra con 45.568 tokens y KVCache fp16. La resolución de visión es de 384x384 y el procesamiento de audio trabaja con fragmentos de 756 mel_frames.

Su relevancia radica en que permite llevar un modelo multimodal de la familia Gemma 4 a dispositivos con NPU Rockchip RK1828, un escenario habitual en electrónica de consumo, edge computing y sistemas empotrados donde no hay GPU dedicada. La licencia del modelo base es Apache 2.0, lo que facilita su uso comercial, aunque el despliegue queda condicionado por los términos de RKNN Toolkit y RKNN Runtime.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión + audio + LLM), convertido a RKNN para NPU Rockchip |
| Parametros totales | no disponible (modelo base Gemma 4 E2B; el sufijo E2B sugiere aproximadamente 2B, dato no confirmado en la informacion) |
| Parametros activos | no disponible |
| Longitud de contexto | 102.912 tokens (config. kv-int4) / 45.568 tokens (config. fp16) |
| Tipos de cuantizacion | Vision w4a16, Audio w4a16, LLM w4a16; KVCache int4 o fp16 segun configuracion |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); aplican tambien terminos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); repo incluye tambien tag gguf |

## Arquitectura y entrenamiento

El modelo es una conversión del Gemma 4 E2B instructivo de Google, un transformer multimodal con torres especializadas para visión y audio que alimentan a un LLM. La conversión a RKNN preserva la arquitectura del modelo base pero reorganiza y cuantiza los pesos para su ejecución sobre el NPU RK1828, con cuantización w4a16 en las tres torres (visión, audio y LLM) y gestión de KVCache configurable en int4 o fp16. La resolución de entrada de visión es de 384x384 y el audio se procesa en fragmentos de 756 mel_frames.

No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados, la composición del dataset ni sobre procesos de RLHF o DPO aplicados al modelo base. Tampoco se documentan innovaciones técnicas adicionales más allá del propio pipeline de conversión a RKNN y de la configuración de KVCache. Toda la información técnica disponible en la model card se limita al proceso de empaquetado y despliegue.

## Capacidades

- Generación de texto conversacional e instructivo, heredada del modelo base Gemma 4 E2B it.
- Procesamiento de imagen con resolución de 384x384 (visión multimodal).
- Procesamiento de audio con fragmentos de 756 mel_frames.
- Naturaleza "any-to-any": combinación de entradas y salidas multimodales.
- Conversación multi-turno con ventana de contexto de hasta 102.912 tokens en la configuración kv-int4.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión avanzada o audio bidireccional más allá de lo indicado: no disponible.

## Casos de uso

- Asistentes de voz en dispositivos empotrados: el modelo puede procesar audio en fragmentos de 756 mel_frames y generar respuestas de texto en el propio NPU RK1828, lo que permite integrar un asistente conversacional local sin depender de la nube.
- Análisis de imágenes en edge computing: con entrada de visión a 384x384, es adecuado para tareas de descripción de imágenes, OCR básico o clasificación visual en dispositivos con NPU Rockchip, como cámaras inteligentes o terminales industriales.
- Kioscos interactivos y señalización digital: la ventana de contexto de hasta 102.912 tokens permite mantener conversaciones largas con usuarios en pantallas interactivas sin perder el hilo, algo útil en entornos de atención presencial.
- Domótica y electrodomésticos inteligentes: el despliegue sobre RK1828 encaja en productos de consumo que necesitan comprender comandos de voz y contexto visual sin conexión a internet.
- Documentación y asistencia técnica offline: la combinación de texto e imagen permite interpretar capturas o diagramas y responder preguntas técnicas en entornos sin conectividad.
- Prototipado de productos multimodales: los desarrolladores pueden validar flujos any-to-any sobre hardware Rockchip antes de escalar a producción, usando las dos configuraciones disponibles según el equilibrio entre contexto y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828 (único chip soportado según la model card).
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM estimada para inferencia: no disponible; el modelo está pensado para memoria del NPU y del sistema, no para GPU convencional.
- GPU recomendadas: no aplica; el modelo está empaquetado para NPU Rockchip, no para A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el formato RKNN no es ejecutable directamente en GPU sin reconversión.
- Opciones de despliegue: RKNN Toolkit y RKNN Runtime v1.1.0 sobre RK1828; el repo también incluye el tag gguf, pero no se documenta un flujo de despliegue GGUF en la model card.
- Latencia y throughput estimados: no disponible.
- Tamaño del repositorio: 8,2 GB, que incluye las dos configuraciones y sus checksums.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RK182X-MLLM-Gemma-4-E2B-it | no disponible (base E2B) | 102.912 / 45.568 tokens | RKNN | Apache 2.0 | Hugging Face y ModelScope |
| google/gemma-4-E2B-it | no disponible (base E2B) | no disponible | safetensors (presumible) | Apache 2.0 | Hugging Face (modelo base) |
| Alternativas multimodales de tamano similar para NPU | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa de rendimiento con modelos alternativos de la misma categoría. La comparación más directa es con el modelo base google/gemma-4-E2B-it, del que esta versión es una conversión cuantizada para NPU.

## Limitaciones y advertencias

- El modelo solo está soportado en el chip RK1828; no funcionará en otras NPU Rockchip ni en GPU convencionales sin reconversión.
- Es obligatorio usar el RKNN Runtime y el driver correspondientes a la versión v1.1.0; una discrepancia de versión puede impedir la ejecución.
- Los archivos de una configuración deben usarse juntos; mezclar ficheros de distintas configuraciones puede producir fallos.
- La cuantización w4a16 en visión, audio y LLM, así como la KVCache int4 en una de las configuraciones, puede degradar la calidad respecto al modelo base en tareas sensibles.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas específicas; se recomienda evaluar el modelo base para esos aspectos.
- La licencia Apache 2.0 del modelo base facilita el uso comercial, pero el despliegue está sujeto además a los términos de licencia de RKNN Toolkit y RKNN Runtime.
- No hay información sobre tool calling, agentes ni capacidades multilingües, por lo que no deben asumirse en producción.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que sugiere una adopción muy limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-MLLM-Gemma-4-E2B-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-MLLM-Gemma-4-E2B-it --revision master --local_dir ./RK182X-MLLM-Gemma-4-E2B-it`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-MLLM-Gemma-4-E2B-it --revision v1.1.0 --local-dir ./RK182X-MLLM-Gemma-4-E2B-it`
- Documentación de configuración incluida en el repo: `Gemma-4-E2B-it-384x384-756frames-w4a16-8-102912-kv-int4/README.md` y `Gemma-4-E2B-it-384x384-756frames-w4a16-8-45568/README.md`
- Paper, blog o demo adicionales: no disponible
