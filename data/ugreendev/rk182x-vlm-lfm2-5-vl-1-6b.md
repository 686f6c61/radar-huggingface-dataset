# UGREENDEV/RK182X-VLM-LFM2.5-VL-1.6B

## Resumen

RK182X-VLM-LFM2.5-VL-1.6B es una conversión al formato RKNN del modelo vision-language LiquidAI/LFM2.5-VL-1.6B, publicada por UGREENDEV. No se trata de un modelo nuevo entrenado desde cero, sino de una compilación cuantizada destinada a ejecutarse en los NPU de los SoC Rockchip RK1820 y RK1828. El objetivo es llevar un VLM de 1.6 mil millones de parámetros a hardware embebido con aceleración NPU, algo que el formato original (pesos en safetensors para GPU) no permite directamente.

El modelo hereda las capacidades del LFM2.5-VL-1.6B de Liquid AI: entrada imagen-texto, generación de texto conversacional y comprensión visual. La compilación concreta disponible usa cuantización w4a16 tanto para la torre de visión como para el LLM, resolución de visión de 512x512, 8 núcleos NPU y una longitud de contexto de 4096 tokens con KVCache en fp16.

Es relevante para desarrolladores que quieran desplegar un VLM pequeño en dispositivos con NPU Rockchip (edge computing, cámaras inteligentes, asistentes locales) sin depender de GPU dedicadas. El repositorio ocupa 1.3 GB y no registra descargas ni likes en el momento de la consulta, lo que indica que es una publicación muy reciente y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM (torre de visión + LLM) convertido a RKNN; arquitectura interna del modelo base no detallada en la información disponible |
| Parametros totales | 1.6B (según el nombre del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (LLM) |
| Tipos de cuantizacion | w4a16 (visión y LLM); KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License v1.0 del modelo base) |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio incluye config.json y SHA256SUMS |

## Arquitectura y entrenamiento

La ficha corresponde a una conversión, no a un entrenamiento. El modelo base LiquidAI/LFM2.5-VL-1.6B es un VLM de Liquid AI con una torre de visión y un LLM de 1.6B parámetros; la información proporcionada no detalla la arquitectura interna (tipo de transformer, atención, composición del dataset de entrenamiento ni si hubo RLHF/DPO). Lo que sí se especifica es la configuración de despliegue: entrada visual a 512x512, cuantización w4a16 en ambas torres, 8 núcleos NPU para visión y 8 para el LLM, y KVCache en fp16 con ventana de 4096 tokens.

La innovación técnica destacable aquí es la propia conversión RKNN: empaquetado de pesos, compilación para NPU Rockchip y verificación por SHA-256. El repositorio incluye un directorio de configuración (`LFM2.5-VL-1.6B-512x512-w4a16-8-4096`) con README, config.json y sumas de verificación, lo que facilita el despliegue reproducible. No se dispone de información sobre decodificación especulativa, atención linear ni otras optimizaciones del modelo base.

## Capacidades

- Generación de texto e interacción conversacional multi-turno (pipeline image-text-to-text).
- Comprensión de imágenes: el modelo acepta entrada visual a 512x512 y responde en texto.
- Razonamiento visual básico derivado del modelo base LFM2.5-VL-1.6B (no se detallan tareas específicas en la información disponible).
- Ejecución en NPU Rockchip RK1820/RK1828 con runtime RKNN v1.1.0.
- Contexto de 4096 tokens para el LLM, suficiente para conversaciones cortas y descripciones de imagen.
- Soporte de tool calling, agentes, thinking mode, audio o multilingüismo: no disponible en la información proporcionada.

## Casos de uso

- Asistentes visuales en dispositivos embebidos: desplegar el modelo en un SoC RK1820/RK1828 para responder preguntas sobre imágenes capturadas por cámara local, sin enviar datos a la nube, gracias a la ejecución en NPU con cuantización w4a16.
- Inspección visual en edge computing: usar la torre de visión a 512x512 para clasificar o describir imágenes de sensores industriales o agrícolas en tiempo real sobre hardware Rockchip.
- Descripción de imágenes para accesibilidad: integrar el modelo en dispositivos de bajo consumo para generar descripciones textuales de fotografías, con contexto de 4096 tokens para diálogos de seguimiento.
- Kioscos o terminales interactivos: conversaciones multi-turno con entrada de imagen en terminales con NPU Rockchip, aprovechando la KVCache fp16 para mantener el historial de la sesión.
- Prototipado de VLM en hardware de bajo coste: validar pipelines image-text-to-text antes de migrar a GPUs, usando la verificación SHA-256 y el directorio de configuración para reproducibilidad.
- Automatización documental ligera: extracción de información de capturas o formularios escaneados en dispositivos locales con restricciones de privacidad, limitado a la resolución 512x512 y al contexto de 4k tokens.
- Investigación en compilación NPU: estudiar el comportamiento de un VLM cuantizado w4a16 en NPU Rockchip, comparando latencia y precisión frente al modelo base en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828 (NPU), con runtime RKNN v1.1.0 y driver correspondiente.
- Verificación previa: comprobar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM/GPU: no aplica; el modelo está compilado para NPU Rockchip, no para CUDA. No se dispone de requisitos de memoria del sistema en la información proporcionada.
- Cabe en GPU consumer: no disponible; el formato RKNN no está pensado para GPUs NVIDIA/AMD.
- Opciones de despliegue: runtime RKNN v1.1.0 sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-VLM-LFM2.5-VL-1.6B (este) | 1.6B | 4096 | RKNN w4a16 | LFM Open License v1.0 | NPU Rockchip RK1820/RK1828 |
| LiquidAI/LFM2.5-VL-1.6B (base) | 1.6B | no disponible | safetensors | LFM Open License v1.0 | GPU/CPU |
| Otros VLM pequenos (~1-2B) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con alternativas de terceros no está disponible en la información proporcionada; la única comparación fiable es con el modelo base, del que este repositorio es una conversión cuantizada para NPU.

## Limitaciones y advertencias

- Es una conversión cuantizada (w4a16): puede haber pérdida de precisión frente al modelo base en fp16/bf16, especialmente en tareas visuales finas.
- Resolución de visión limitada a 512x512, lo que restringe la lectura de texto pequeño o detalles finos en imágenes.
- Contexto de solo 4096 tokens: insuficiente para documentos largos o conversaciones extensas.
- Solo funciona en chips RK1820 y RK1828 con runtime RKNN v1.1.0 y driver compatible; no es portable a GPU o CPU sin reconversión.
- Licencia "other" con LFM Open License v1.0: hay que revisar `LICENSE` y `Notice` para condiciones de uso comercial y atribución; el uso también queda sujeto a las licencias de RKNN Toolkit y RKNN Runtime.
- Idiomas soportados no documentados: riesgo de rendimiento desigual fuera del inglés/chino.
- Riesgo de alucinación inherente a modelos generativos de 1.6B parámetros, agravado por la cuantización.
- Repositorio sin descargas ni likes: poca validación comunitaria; conviene verificar SHA-256 antes del despliegue.
- Sesgos conocidos: no disponibles en la información proporcionada.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-VLM-LFM2.5-VL-1.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-1.6B
- Directorio de configuración: `LFM2.5-VL-1.6B-512x512-w4a16-8-4096/README.md` (dentro del repositorio)
- Documentación en chino: `README_CN.md` (dentro del repositorio)
- ModelScope: descarga vía `modelscope download --model UGREENDEV/RK182X-VLM-LFM2.5-VL-1.6B`
- Papers, blogs, repos o demos adicionales: no disponibles en la información proporcionada.
