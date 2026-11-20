# UGREENDEV/RK182X-VLM-LocateAnything-3B

## Resumen

RK182X-VLM-LocateAnything-3B es una conversión al formato RKNN del modelo vision-lenguaje nvidia/LocateAnything-3B, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo entrenado desde cero, sino de un artefacto derivado y cuantizado del modelo original de NVIDIA, empaquetado con el runtime RKNN v1.1.0 y orientado a despliegue en hardware embebido con aceleración NPU. El repositorio ocupa 2,9 GB e incluye una única configuración de inferencia.

El modelo resuelve el problema de llevar un VLM de 3B parámetros especializado en localización visual (detección y grounding mediante cajas delimitadoras generadas de forma autorregresiva) a dispositivos con recursos limitados. La configuración disponible fija la entrada de visión a 448x448 píxeles, aplica cuantización w4a16 tanto en la torre de visión como en el LLM, emplea 8 núcleos NPU para cada componente y limita el contexto del LLM a 4096 tokens con KVCache en fp16.

Su relevancia es acotada pero específica: cubre el nicho de quienes necesitan ejecutar tareas de localización visual sobre silicio Rockchip RK1828 sin depender de GPUs. La licencia del modelo base es la NVIDIA License, de carácter no comercial, y los artefactos derivados heredan esas restricciones, por lo que su uso queda limitado a investigación y evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLM (torre de visión + LLM) convertido a RKNN; arquitectura interna del modelo base no disponible en la información proporcionada |
| Parámetros totales | 3B (según el nombre del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 4096 tokens (LLM) |
| Tipos de cuantización | w4a16 en visión y en LLM; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | NVIDIA License (no comercial), más licencias MoonViT y Qwen para componentes |
| Formato de pesos | RKNN (runtime v1.1.0); no se distribuyen safetensors ni GGUF pese a la etiqueta gguf del repo |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo original más allá de identificarlo como VLM con pipeline image-text-to-text. La conversión preserva dos componentes diferenciados: una torre de visión que procesa imágenes a 448x448 y un LLM con ventana de 4096 tokens. Ambos se ejecutan sobre 8 núcleos NPU cada uno en el chip RK1828. La generación de cajas delimitadoras es autorregresiva; el autor indica explícitamente que no se incluye la decodificación paralela de cajas PBD/MTP, lo que implica que la localización se produce token a token.

No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. Tampoco se detallan innovaciones técnicas del modelo base más allá de su función de localización visual. La información disponible se limita al proceso de conversión: cuantización w4a16, empaquetado con RKNN Toolkit y verificación mediante sumas SHA-256 incluidas en el directorio de configuración.

## Capacidades

- Generación de texto e inferencia imagen-texto en formato conversacional.
- Localización visual: generación de cajas delimitadoras sobre objetos en imágenes, en modo autorregresivo.
- Procesamiento de imágenes a resolución fija de 448x448 píxeles.
- Ejecución sobre NPU Rockchip RK1828 con runtime RKNN v1.1.0.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión adicional, audio: no disponible.

## Casos de uso

- Localización de objetos en dispositivos embebidos: el modelo permite obtener cajas delimitadoras sobre imágenes capturadas por cámaras conectadas a un SoC Rockchip RK1828, sin necesidad de GPU, usando la configuración 448x448-w4a16.
- Inspección visual en el borde: en entornos industriales o agrícolas con hardware Rockchip, se puede desplegar para identificar y delimitar elementos en imágenes de sensores, aprovechando los 8 núcleos NPU dedicados a visión.
- Prototipado de asistentes visuales conversacionales: el pipeline image-text-to-text y el formato conversacional permiten construir interfaces de pregunta-respuesta sobre imágenes con contexto de hasta 4096 tokens.
- Investigación en eficiencia de VLM: sirve como referencia para estudiar el impacto de la cuantización w4a16 en tareas de grounding visual sobre NPU, comparando con el modelo original en precisión completa.
- Anotación asistida de datasets: generación automática de cajas delimitadoras preliminares en flujos de etiquetado, con revisión humana posterior, en estaciones equipadas con RK1828.
- Evaluación de pipelines RKNN: útil para validar la cadena de conversión, verificación SHA-256 y compatibilidad de runtime antes de desplegar otros modelos derivados en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Chip obligatorio: Rockchip RK1828. No se soportan otras variantes de la familia RK182X según la documentación.
- Runtime: RKNN Runtime v1.1.0, con driver compatible. Verificar la versión en dispositivo con `rknn-smi -v` antes de ejecutar.
- NPU: 8 núcleos para la torre de visión y 8 núcleos para el LLM.
- VRAM: no aplica; el modelo se ejecuta sobre NPU, no sobre GPU. El consumo de memoria del sistema no está documentado.
- GPU recomendadas: no aplica para este artefacto. Para el modelo base nvidia/LocateAnything-3B en precisión completa se requeriría una GPU NVIDIA, pero no se especifican requisitos en la información disponible.
- Despliegue en GPU de consumo: no aplica a este repositorio RKNN.
- Opciones de despliegue: runtime RKNN propietario de Rockchip; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| RK182X-VLM-LocateAnything-3B | 3B | 4096 tokens | RKNN | NVIDIA License (no comercial) | NPU RK1828 |
| nvidia/LocateAnything-3B | 3B | no disponible | safetensors (presumible) | NVIDIA License (no comercial) | GPU NVIDIA |
| Otros VLM de localización de ~3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría no está disponible en la información proporcionada. La diferencia principal frente al modelo base es el formato de ejecución: este repositorio sacrifica portabilidad y probablemente precisión (por la cuantización w4a16) a cambio de ejecución en NPU embebida.

## Limitaciones y advertencias

- Licencia no comercial: la NVIDIA License restringe el uso a investigación y evaluación. No se permite uso comercial sin autorización expresa.
- Licencias adicionales: los componentes MoonViT y Qwen tienen sus propias licencias, recogidas en LICENSE-MoonViT y LICENSE-Qwen, que deben respetarse.
- Dependencia de hardware: solo funciona en RK1828 con runtime RKNN v1.1.0 y driver compatible. No es portable a GPU ni a otros SoC.
- Sin decodificación paralela de cajas: la ausencia de PBD/MTP implica generación autorregresiva de cada caja, con mayor latencia en escenas con muchos objetos.
- Resolución fija: la entrada de visión está limitada a 448x448, lo que puede degradar la detección de objetos pequeños.
- Contexto limitado a 4096 tokens, suficiente para conversaciones cortas pero restrictivo para diálogos multi-turno extensos o imágenes con muchas cajas.
- Cuantización w4a16: introduce pérdida de precisión respecto al modelo original; no se documenta la magnitud de esa degradación.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero aplicables por herencia del modelo base.
- Idiomas: no se especifican; no se puede asumir cobertura multilingüe.
- Artefacto derivado: los pesos son conversiones, no los originales de NVIDIA; el autor advierte que siguen sujetos a las restricciones del modelo fuente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-LocateAnything-3B
- Modelo base: https://huggingface.co/nvidia/LocateAnything-3B
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-VLM-LocateAnything-3B`
- Documentación de configuración: directorio `LocateAnything-3B-448x448-w4a16-8-4096/README.md` dentro del repositorio
- Paper, blog o demo del modelo base: no disponible en la información proporcionada
