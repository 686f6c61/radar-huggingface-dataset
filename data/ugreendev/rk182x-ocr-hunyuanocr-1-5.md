# UGREENDEV/RK182X-OCR-HunyuanOCR-1.5

## Resumen

RK182X-OCR-HunyuanOCR-1.5 es una conversión al formato RKNN del modelo Tencent-Hunyuan/HunyuanOCR, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo nuevo entrenado desde cero, sino de una cuantización y empaquetado del OCR multimodal de Tencent Hunyuan, orientado a inferencia en hardware embebido con aceleración NPU. El repositorio incluye dos configuraciones con distinta resolución de entrada y distinta ventana de contexto del decodificador LLM.

El modelo resuelve el problema de ejecutar OCR basado en transformer visión-lenguaje sobre silicio de bajo consumo (familia RK182X de Rockchip), algo que normalmente requiere GPU. Para ello aplica cuantización w4a16 (pesos de 4 bits, activaciones de 16 bits) tanto a la torre de visión como al LLM, y reparte la carga entre 8 núcleos NPU para la parte visual y 8 para la parte lingüística.

Es relevante ahora porque permite desplegar OCR conversacional y extracción estructurada de documentos en dispositivos de borde (edge) sin depender de la nube. El tamaño del repo es de 1,3 GB y la licencia es "other", heredada del modelo base, por lo que las condiciones de uso comercial dependen del LICENSE de Tencent Hunyuan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (OCR multimodal), convertido a RKNN |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (config. 1024x1024) / 32768 tokens (config. 512x512) |
| Tipos de cuantizacion | w4a16 en visión y en LLM; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (licencia del modelo base Tencent-Hunyuan/HunyuanOCR) |
| Formato de pesos | RKNN (runtime v1.1.0); repo con config.json, SHA256SUMS y pesos por configuración |

## Arquitectura y entrenamiento

El modelo base es HunyuanOCR de Tencent, un sistema image-text-to-text especializado en reconocimiento óptico de caracteres que combina un codificador visual con un decodificador de lenguaje. Esta ficha describe la conversión RKNN: no se ha reentrenado el modelo, sino que se ha cuantizado y compilado para la NPU RK1828 mediante RKNN Toolkit, con runtime v1.1.0. La cuantización w4a16 reduce los pesos a 4 bits manteniendo activaciones en 16 bits, lo que rebaja el footprint de memoria a costa de cierta pérdida de precisión frente al original en fp16/bf16.

Se ofrecen dos configuraciones: una con visión a 1024x1024 y contexto LLM de 4096 tokens, y otra con visión a 512x512 y contexto de 32768 tokens. En ambas, la torre de visión y el LLM usan 8 núcleos NPU respectivamente y KVCache en fp16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base, ya que la model card únicamente documenta el proceso de conversión y empaquetado.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes, con pipeline image-text-to-text.
- Extracción de texto y estructura a partir de documentos, formularios y capturas, en función de las capacidades heredadas del modelo base HunyuanOCR.
- Procesamiento conversacional (tag `conversational`), lo que permite interacción multi-turno sobre el contenido de la imagen.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Dos modos de resolución/contexto: alta resolución con contexto corto (1024x1024, 4k) o baja resolución con contexto largo (512x512, 32k).
- Ejecución en NPU Rockchip RK1828, sin GPU dedicada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Digitalización de documentos en dispositivos de borde: desplegar el modelo en un equipo con NPU RK1828 para extraer texto de facturas, albaranes o formularios sin enviar imágenes a la nube, usando la configuración 1024x1024 para mayor fidelidad de lectura.
- Kioscos y terminales de autoservicio: lectura de DNI, tickets o matrículas en el propio dispositivo, reduciendo latencia y coste de ancho de banda al no requerir subida de imágenes.
- Procesamiento por lotes de archivos escaneados: con la configuración 512x512 y 32k de contexto, encadenar varias páginas o fragmentos en una sola sesión conversacional para tareas de resumen o extracción estructurada.
- Automatización de archivo y clasificación documental: usar el modelo como primer paso OCR en un pipeline que etiquete y enrute documentos según su contenido, ejecutándose en hardware de bajo consumo.
- Asistentes de accesibilidad en dispositivos empotrados: lectura en voz alta de texto presente en imágenes capturadas por cámara, con inferencia local que preserva la privacidad del usuario.
- Verificación de calidad en línea de producción: inspección de etiquetas, códigos o seriales impresos mediante OCR en la propia línea, con la NPU integrada en el equipo industrial.
- Extracción de datos de capturas de pantalla en aplicaciones de escritorio o móviles con acelerador Rockchip, para rellenar formularios automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión OCR, latencia ni throughput para ninguna de las dos configuraciones.

## Requisitos de hardware

- NPU: Rockchip RK1828 exclusivamente (etiqueta de chip RK182X, soporte limitado a RK1828).
- Runtime: RKNN Runtime v1.1.0, con driver y runtime coincidentes; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 para visión y 8 para LLM en ambas configuraciones.
- Memoria: el repo completo ocupa 1,3 GB; el footprint en dispositivo depende de la configuración elegida (no se detalla VRAM/RAM estimada).
- KVCache en fp16, lo que condiciona el consumo de memoria en contextos largos (especialmente en la configuración de 32k tokens).
- GPU dedicadas (A100, H100, RTX 4090): no aplica; el modelo está compilado para NPU, no para CUDA.
- Opciones de despliegue: RKNN Runtime sobre RK1828; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Formato / hardware | Contexto | Resolución | Licencia | Observaciones |
|---|---|---|---|---|---|
| RK182X-OCR-HunyuanOCR-1.5 (este) | RKNN / NPU RK1828 | 4k o 32k | 1024x1024 o 512x512 | other | Cuantizado w4a16, orientado a edge |
| Tencent-Hunyuan/HunyuanOCR | Pesos originales (no RKNN) | no disponible | no disponible | other | Modelo base sin cuantizar; requiere hardware genérico |
| Alternativas OCR comerciales (p. ej. APIs cloud) | Servicio cloud | variable | variable | propietaria | No ejecutables en RK1828; dependencia de red |

No se dispone de datos de rendimiento comparado con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en la NPU RK1828; no es ejecutable en GPU ni CPU convencionales sin reconversión.
- Requiere runtime y driver RKNN v1.1.0 coincidentes; una versión distinta puede impedir la carga del modelo.
- La cuantización w4a16 puede degradar la precisión OCR respecto al modelo base en fp16/bf16; no se publican métricas de esa pérdida.
- La configuración de 1024x1024 limita el contexto del LLM a 4096 tokens, lo que restringe documentos largos o conversaciones extensas.
- La configuración de 512x512 reduce la resolución de visión y puede afectar a la lectura de texto pequeño.
- Licencia "other": las condiciones de uso comercial dependen del LICENSE del modelo base Tencent-Hunyuan/HunyuanOCR y de los términos de RKNN Toolkit y RKNN Runtime; revisar antes de desplegar en producción.
- Riesgo de alucinación inherente a modelos visión-lenguaje: puede generar texto no presente en la imagen, especialmente con imágenes de baja calidad.
- Sesgos e idiomas soportados: no documentados en la información disponible.
- Repositorio sin descargas ni likes y creado recientemente; no hay evidencia de validación comunitaria.
- Verificar la integridad de los ficheros con SHA256SUMS antes de desplegar.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-OCR-HunyuanOCR-1.5
- Modelo base: https://huggingface.co/Tencent-Hunyuan/HunyuanOCR
- Configuración 1024x1024 (subdirectorio): HunyuanOCR-1.5-1024x1024-w4a16-8-4096/README.md
- Configuración 512x512 (subdirectorio): HunyuanOCR-1.5-512x512-w4a16-8-32768/README.md
- Descarga vía ModelScope: `modelscope download --model UGREENDEV/RK182X-OCR-HunyuanOCR-1.5`
- Descarga vía Hugging Face CLI: `hf download UGREENDEV/RK182X-OCR-HunyuanOCR-1.5 --revision v1.1.0`
