# UGREENDEV/RK182X-OCR-PaddleOCR-VL

## Resumen

RK182X-OCR-PaddleOCR-VL es una conversión al formato RKNN del modelo PaddleOCR-VL de PaddlePaddle, publicada por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo entrenado desde cero, sino de un derivado cuantizado y empaquetado para inferencia en hardware embebido, con el objetivo de llevar OCR multimodal (imagen a texto) a dispositivos de borde sin depender de GPU dedicadas.

El repositorio incluye una única configuración, `PaddleOCR-VL-504x504-w4a16-8-4096-normal`, con cuantización w4a16 en visión, LLM y el módulo MLP-AR de visión, 8 núcleos NPU por componente y una longitud de contexto de 4096 tokens para el LLM. La resolución de entrada de visión es de 504x504 píxeles y el KVCache se almacena en fp16.

Su relevancia radica en que permite desplegar un modelo OCR de la familia PaddleOCR-VL en placas con NPU Rockchip, un nicho con escasa oferta de modelos multimodales listos para producción. La licencia Apache 2.0 del modelo base facilita su integración comercial, aunque el uso queda condicionado por los términos del RKNN Toolkit y del RKNN Runtime. El tamaño del repositorio es de 0,8 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de PaddleOCR-VL (modelo base multimodal imagen-texto); empaquetada en formato RKNN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (LLM) |
| Tipos de cuantizacion | w4a16 en visión, LLM y Vision MLP-AR; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo base); aplican además los términos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); el repositorio incluye config.json, SHA256SUMS y documentación |

Otros datos técnicos relevantes: resolución de visión 504x504, 8 núcleos NPU por componente (visión, LLM y Vision MLP-AR), chips soportados RK1820 y RK1828, y modelo base `PaddlePaddle/PaddleOCR-VL`.

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base más allá de identificarlo como PaddleOCR-VL, un modelo de la familia PaddleOCR orientado a OCR y comprensión de documentos con pipeline imagen-texto. La contribución de UGREENDEV consiste en la conversión y cuantización a RKNN: visión, LLM y el módulo MLP-AR de visión se cuantizan a w4a16, mientras que el KVCache del LLM se mantiene en fp16. La configuración fija 8 núcleos NPU por componente y una ventana de contexto de 4096 tokens.

No se proporcionan datos sobre el entrenamiento original (número de tokens, composición del dataset, uso de RLHF/DPO) ni sobre el proceso de calibración de la cuantización. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. Cualquier afirmación sobre estos puntos requeriría consultar la model card del modelo base PaddlePaddle/PaddleOCR-VL, que no forma parte de la información disponible.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de entrada de 504x504 píxeles.
- Pipeline imagen-texto (`image-text-to-text`), orientado a la transcripción y comprensión de contenido visual.
- Inferencia en NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime v1.1.0.
- Ejecución con cuantización w4a16, pensada para reducir el consumo de memoria y acelerar la inferencia en hardware de borde.
- Soporte de conversación según la etiqueta `conversational` del repositorio.
- No se documentan capacidades de tool calling, agentes, multi-step reasoning, audio ni modos de razonamiento extendido.

## Casos de uso

- Digitalización de documentos en dispositivos de borde: el modelo puede ejecutarse en placas con NPU RK1820/RK1828 para extraer texto de facturas, albaranes o formularios sin enviar imágenes a la nube, lo que reduce latencia y preserva la privacidad.
- Lectura de matrículas y señalética en sistemas embebidos: con entrada de 504x504 y cuantización w4a16, encaja en equipos de videovigilancia o control de accesos que ya incorporan NPU Rockchip.
- Procesamiento de tickets y recibos en terminales punto de venta: la ventana de 4096 tokens permite transcribir documentos de extensión moderada en una sola pasada.
- Extracción de texto en escáneres y lectores de documentos portátiles: el reducido tamaño del repositorio (0,8 GB) facilita el almacenamiento local y las actualizaciones por red.
- Automatización de archivo documental en kioscos o estaciones de autoservicio: el modelo transcribe el documento y el sistema posterior puede indexar el resultado.
- Prototipado de pipelines OCR en laboratorio sobre hardware Rockchip: sirve para evaluar la viabilidad de PaddleOCR-VL en NPU antes de invertir en infraestructura GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Chips soportados: Rockchip RK1820 y RK1828, con RKNN Runtime v1.1.0 y driver compatible.
- Verificación previa del runtime en el dispositivo con `rknn-smi -v` antes de ejecutar.
- VRAM: no aplica; el modelo se ejecuta en NPU, no en GPU. No se especifica el consumo de memoria del dispositivo.
- GPU recomendadas: no aplica para esta conversión; para ejecutar el modelo base PaddleOCR-VL fuera de NPU sería necesario consultar su model card.
- Compatibilidad con GPU de consumo: no disponible para esta versión RKNN.
- Opciones de despliegue: RKNN Runtime sobre RK1820/RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles.
- Integridad: verificar los ficheros con `sha256sum -c SHA256SUMS` antes del despliegue.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| RK182X-OCR-PaddleOCR-VL | no disponible | 4096 tokens | RKNN | Apache 2.0 (base) | NPU RK1820/RK1828 |
| PaddlePaddle/PaddleOCR-VL (modelo base) | no disponible | no disponible | safetensors (presumible, no confirmado) | Apache 2.0 | GPU |
| Otros OCR multimodales de la familia PaddleOCR | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo derivado y cuantizado: la cuantización w4a16 puede degradar la precisión del OCR respecto al modelo base en texto pequeño o de bajo contraste.
- Resolución de entrada fija de 504x504 píxeles; documentos de alta resolución requerirán preprocesado (recorte o escalado) que puede afectar al reconocimiento.
- Contexto limitado a 4096 tokens, insuficiente para documentos muy extensos en una sola pasada.
- Dependencia estricta del RKNN Runtime v1.1.0 y del driver correspondiente; versiones distintas pueden provocar fallos de ejecución.
- Solo compatible con RK1820 y RK1828; no es desplegable en GPU ni en otras NPU sin reconversión.
- Idiomas soportados no documentados en el repositorio; conviene validar el rendimiento en el idioma objetivo antes de producción.
- Riesgo de alucinación inherente a los modelos generativos imagen-texto; en OCR conviene aplicar validación posterior o umbrales de confianza.
- Licencia Apache 2.0 para el modelo base, pero el uso queda sujeto además a los términos del RKNN Toolkit y del RKNN Runtime; revisar `LICENSE` y `Notice` antes de un despliegue comercial.
- Repositorio sin descargas ni validación comunitaria en el momento de la consulta; tratar como artefacto reciente y verificar su funcionamiento en el hardware objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-OCR-PaddleOCR-VL
- Modelo base: https://huggingface.co/PaddlePaddle/PaddleOCR-VL
- Documentación de la configuración: `PaddleOCR-VL-504x504-w4a16-8-4096-normal/README.md` (incluida en el repositorio)
- Documentación en chino: `PaddleOCR-VL-504x504-w4a16-8-4096-normal/README_CN.md` (incluida en el repositorio)
- ModelScope: `UGREENDEV/RK182X-OCR-PaddleOCR-VL` (referenciado en la model card; URL no proporcionada)
