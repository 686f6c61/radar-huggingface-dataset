# UGREENDEV/RK182X-MLLM-Qwen2.5-Omni-3B

## Resumen

RK182X-MLLM-Qwen2.5-Omni-3B es una conversión al formato RKNN del modelo multimodal Qwen/Qwen2.5-Omni-3B, publicada por UGREENDEV para su ejecución sobre la NPU Rockchip RK1828. No se trata de un modelo nuevo entrenado desde cero, sino de una compilación cuantizada del modelo "any-to-any" de Qwen (texto, imagen y audio) orientada a inferencia en hardware embebido de bajo consumo. El repositorio incluye pesos en formato RKNN y GGUF, junto con scripts de descarga y verificación de integridad, y está pensado para integrarse en el runtime RKNN v1.1.0.

La relevancia de esta ficha radica en que permite ejecutar un modelo multimodal de 3.000 millones de parámetros en una NPU de gama media sin GPU dedicada, algo poco habitual en el ecosistema open source. Sin embargo, la conversión impone recortes severos respecto al modelo original: la longitud de contexto del LLM se reduce a 1.024 tokens y la resolución de visión a 392x392 píxeles, con cuantización w4a16 en visión, audio y LLM.

El modelo hereda la arquitectura y licencia del Qwen2.5-Omni-3B original, pero la licencia del repositorio es "other" y remite al LICENSE del modelo base, por lo que el uso comercial queda sujeto a los términos de Qwen. Al no haber descargas ni likes registrados en el momento de la consulta, se trata de una publicación muy reciente y sin validación comunitaria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLLM basada en Qwen2.5-Omni-3B (transformer multimodal any-to-any) |
| Parámetros totales | 3B (heredados del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | LLM: 1.024 tokens (1k) en la configuración publicada |
| Tipos de cuantización | w4a16 en visión, audio y LLM; KVCache en fp16 |
| Idiomas soportados | no disponible |
| Licencia | other (remite al LICENSE del modelo base Qwen2.5-Omni-3B; aplican además los términos de RKNN Toolkit y RKNN Runtime) |
| Formato de pesos | RKNN (runtime v1.1.0) y GGUF; repo de 4,3 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen2.5-Omni-3B, un modelo multimodal "any-to-any" que procesa y genera texto, imagen y audio. La conversión publicada mantiene tres componentes diferenciados: un codificador de visión, un codificador de audio y el LLM, cada uno compilado por separado para la NPU RK1828 con 8 núcleos NPU asignados a cada componente. La configuración disponible se identifica como `Qwen2.5-Omni-3B-392x392-600frames-w4a16-8-1024`, donde 392x392 es la resolución de entrada de visión, 600 el tamaño de chunk de audio en mel_frames y 1024 la longitud de contexto del LLM.

No se dispone de información sobre el proceso de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) en la documentación proporcionada; esos datos corresponden al modelo base Qwen2.5-Omni-3B y no se detallan en esta conversión. La innovación técnica destacable es la propia compilación RKNN con cuantización w4a16 y la asignación de núcleos NPU por componente, que permite ejecutar un MLLM completo en hardware Rockchip. El repositorio incluye checksums SHA-256 para verificar la integridad de los ficheros antes del despliegue.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del LLM de Qwen2.5-Omni-3B.
- Procesamiento de imagen con resolución de entrada 392x392 píxeles.
- Procesamiento de audio con chunks de 600 mel_frames.
- Pipeline "any-to-any": entrada multimodal (texto, imagen, audio) y salida de texto.
- Conversación multi-turno limitada por la ventana de contexto de 1.024 tokens.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión avanzada o audio en streaming: no disponible en la información proporcionada.

## Casos de uso

- Asistente de voz en dispositivos embebidos: el modelo acepta audio en chunks de 600 mel_frames y devuelve texto, lo que permite construir interfaces conversacionales por voz en equipos con NPU RK1828 sin depender de la nube.
- Descripción de imágenes en cámaras o dispositivos IoT: con entrada de 392x392 píxeles, el modelo puede generar descripciones o etiquetas de escenas capturadas por sensores de baja resolución integrados en el propio dispositivo.
- Atención al cliente en kioscos o terminales locales: la ventana de 1.024 tokens es suficiente para turnos cortos de soporte técnico o consultas de producto, con la ventaja de que los datos no salen del dispositivo.
- Accesibilidad para personas con discapacidad visual: conversión de imágenes capturadas por la cámara del dispositivo en texto descriptivo, ejecutada localmente en hardware de bajo consumo.
- Procesamiento de documentos con OCR asistido: combinación de imagen y texto para extraer y resumir información de capturas o formularios, siempre que el contenido quepa en el contexto de 1k tokens.
- Prototipado de aplicaciones multimodales en edge: gracias a la cuantización w4a16 y al runtime RKNN, sirve como banco de pruebas para validar pipelines any-to-any antes de escalar a modelos mayores.
- Moderación de contenido audiovisual en local: análisis de fragmentos de audio e imagen para clasificar o filtrar contenido sin enviar datos a servidores externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1828 (único chip soportado según la model card).
- Runtime: RKNN Runtime v1.1.0, con driver correspondiente; verificar la versión en el dispositivo con `rknn-smi -v` antes de ejecutar.
- Núcleos NPU: 8 para visión, 8 para audio y 8 para LLM en la configuración publicada.
- VRAM/RAM estimada: no disponible; el repo completo ocupa 4,3 GB y los pesos están cuantizados a w4a16, pero no se especifica el consumo en ejecución.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable, el modelo está compilado para NPU RK1828 y no para CUDA.
- Despliegue en GPU de consumo: no disponible; el formato RKNN no es compatible con llama.cpp, Ollama, vLLM ni TGI de forma directa.
- Opciones de despliegue: runtime RKNN v1.1.0 sobre RK1828; descarga vía Hugging Face (`hf download`) o ModelScope (`modelscope download`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| RK182X-MLLM-Qwen2.5-Omni-3B (esta ficha) | 3B | 1.024 tokens | RKNN, GGUF | NPU RK1828 | other |
| Qwen/Qwen2.5-Omni-3B (modelo base) | 3B | no disponible en esta ficha | safetensors | GPU | Qwen (ver LICENSE) |
| Alternativas edge multimodales de 3B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables adicionales en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Contexto muy reducido: 1.024 tokens limitan severamente conversaciones largas, documentos extensos y razonamiento multi-paso.
- Resolución de visión baja: 392x392 píxeles puede ser insuficiente para tareas que requieran detalle fino (OCR de texto pequeño, lectura de matrículas, etc.).
- Hardware restringido: solo funciona en RK1828 con RKNN Runtime v1.1.0; no es desplegable en GPU convencionales ni en otros aceleradores sin reconversión.
- Licencia "other": el uso comercial queda sujeto al LICENSE del modelo base Qwen2.5-Omni-3B y a los términos de RKNN Toolkit y RKNN Runtime; es imprescindible revisarlos antes de producción.
- Riesgo de alucinación: inherente al modelo base de 3B, especialmente en tareas de razonamiento complejo y con contexto corto.
- Sesgos: no se documentan sesgos específicos en la información proporcionada; se heredan los del modelo base.
- Idiomas: no se especifican los idiomas soportados en esta conversión.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; el repositorio es muy reciente y no hay evidencia de uso en producción.
- Integridad de ficheros: es obligatorio ejecutar `sha256sum -c SHA256SUMS` y desplegar solo si todas las entradas muestran `OK`.
- Compatibilidad de ficheros: deben usarse conjuntamente los ficheros de un mismo directorio de configuración; mezclar versiones puede romper la inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-MLLM-Qwen2.5-Omni-3B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Documentación de configuración (inglés): `Qwen2.5-Omni-3B-392x392-600frames-w4a16-8-1024/README.md` dentro del repositorio
- Documentación de configuración (chino): `Qwen2.5-Omni-3B-392x392-600frames-w4a16-8-1024/README_CN.md` dentro del repositorio
- Checksums: `Qwen2.5-Omni-3B-392x392-600frames-w4a16-8-1024/SHA256SUMS` dentro del repositorio
- Licencia: `LICENSE` en la raíz del repositorio
- ModelScope (espejo de descarga): `UGREENDEV/RK182X-MLLM-Qwen2.5-Omni-3B` (revisión `master`)
