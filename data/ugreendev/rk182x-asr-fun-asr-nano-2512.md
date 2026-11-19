# UGREENDEV/RK182X-ASR-Fun-ASR-Nano-2512

## Resumen

RK182X-ASR-Fun-ASR-Nano-2512 es una conversión al formato RKNN del modelo de reconocimiento automático del habla Fun-ASR-Nano-2512, desarrollado originalmente por FunAudioLLM y adaptado por UGREENDEV para su ejecución sobre las NPU Rockchip RK1820 y RK1828. No se trata de un modelo nuevo entrenado desde cero, sino de una versión cuantizada y empaquetada para inferencia en hardware embebido, lo que permite desplegar ASR en dispositivos de borde sin depender de GPUs dedicadas.

La relevancia de esta ficha radica en que cubre un nicho muy concreto: pipelines de voz en tiempo real sobre silicio Rockchip. El repositorio incluye una única configuración publicada, `Fun-ASR-Nano-2512-w4a16-8-normal`, con encoder en fp16, LLM en w4a16 y una ventana de contexto de 2048 tokens para la parte lingüística. El paquete completo ocupa 1,3 GB y se distribuye bajo licencia Apache 2.0.

Al estar orientado a NPU, el modelo no se ejecuta con los runners habituales de Hugging Face (transformers, vLLM), sino con el runtime RKNN v1.1.0 y los drivers correspondientes. Esto condiciona tanto el hardware objetivo como las herramientas de despliegue disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ASR basado en encoder + LLM (modelo base Fun-ASR-Nano-2512), convertido a RKNN |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens (LLM) |
| Tipos de cuantizacion | Encoder: fp16; LLM: w4a16; KVCache: fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (modelo fuente); se aplican ademas los terminos de RKNN Toolkit y RKNN Runtime |
| Formato de pesos | RKNN (runtime v1.1.0); repositorio con config.json, SHA256SUMS y binarios por configuracion |

## Arquitectura y entrenamiento

El modelo fuente Fun-ASR-Nano-2512 sigue un esquema de dos componentes: un encoder acústico que procesa la señal de audio y un LLM que genera la transcripción a partir de las representaciones del encoder. En esta versión RKNN, el encoder se mantiene en fp16 y el LLM se cuantiza a w4a16 (pesos de 4 bits, activaciones de 16 bits), con la KVCache también en fp16. La conversión asigna 8 núcleos NPU al encoder y 8 al LLM.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO en el modelo original, ya que la model card de esta conversión no los detalla. La innovación técnica destacable aquí no está en el entrenamiento, sino en el proceso de conversión y cuantización para NPU: empaquetado con checksums SHA-256, manifiesto de ficheros en `config.json` y compatibilidad verificada con RKNN Runtime v1.1.0.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio de entrada, generando transcripciones de texto.
- Pipeline declarado como `automatic-speech-recognition` y etiqueta `conversational`, lo que sugiere uso en diálogo hablado.
- Ejecución en NPU Rockchip RK1820 y RK1828 mediante RKNN Runtime.
- Cuantización agresiva del LLM (w4a16) para reducir huella de memoria en dispositivo.
- Verificación de integridad de ficheros mediante SHA-256 antes del despliegue.
- Soporte de descarga selectiva por configuración desde Hugging Face y ModelScope.
- No se documentan capacidades de tool calling, agentes, visión, audio generation ni modo thinking en la información disponible.

## Casos de uso

- Transcripción en dispositivos de borde: el modelo se ejecuta en NPU RK1820/RK1828, lo que permite transcribir audio localmente sin enviar datos a la nube, útil en entornos con requisitos de privacidad.
- Asistentes de voz embebidos: la etiqueta `conversational` y la ventana de 2048 tokens del LLM permiten gestionar turnos de diálogo hablado en electrodomésticos o dispositivos IoT.
- Subtitulado local de reuniones: integrado en un dispositivo con NPU Rockchip, puede generar transcripciones en tiempo real sin infraestructura de servidor.
- Automatización de actas y notas de voz: en grabadoras o terminales portátiles, el modelo convierte audio a texto en el propio dispositivo.
- Kioscos y terminales de atención presencial: transcripción de comandos de voz en hardware de bajo consumo con verificación de integridad de ficheros antes del arranque.
- Pipelines de accesibilidad: conversión de voz a texto en dispositivos de asistencia para personas con discapacidad auditiva, aprovechando la inferencia local.
- Prototipado en hardware Rockchip: sirve como referencia para evaluar ASR en plataformas RK182X antes de escalar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- NPU objetivo: Rockchip RK1820 y RK1828 (etiqueta de chip RK182X).
- Runtime: RKNN Runtime v1.1.0, con driver coincidente; verificar con `rknn-smi -v` en el dispositivo.
- VRAM: no aplica; el modelo se ejecuta en NPU, no en GPU. El repositorio completo ocupa 1,3 GB.
- GPU recomendadas: no aplica para esta conversión; el modelo fuente podría ejecutarse en GPU, pero esta versión está empaquetada para NPU.
- Cabe en GPU de consumo: no aplica; el formato RKNN no está pensado para GPUs.
- Opciones de despliegue: RKNN Runtime v1.1.0 sobre RK1820/RK1828; descarga vía `hf download` o `modelscope download`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| RK182X-ASR-Fun-ASR-Nano-2512 | no disponible | 2048 tokens (LLM) | RKNN | Apache 2.0 | NPU RK1820/RK1828 |
| FunAudioLLM/Fun-ASR-Nano-2512 (modelo fuente) | no disponible | no disponible | safetensors (presumible) | Apache 2.0 | GPU/CPU |
| Otros ASR en formato GGUF | no disponible | no disponible | GGUF | variable | CPU/GPU |

La comparación directa con alternativas queda limitada porque no se dispone de especificaciones del modelo fuente ni de otros ASR empaquetados para RKNN en la información proporcionada.

## Limitaciones y advertencias

- Solo funciona en NPU RK1820 y RK1828; no es portable a GPU ni CPU con los runners habituales.
- Requiere RKNN Runtime v1.1.0 y driver coincidente; versiones distintas pueden fallar.
- La ventana de contexto del LLM es de 2048 tokens, lo que limita transcripciones largas en una sola pasada.
- No se documentan los idiomas soportados; no asumir multilingüismo sin verificación.
- Riesgo de alucinación inherente al componente LLM en la generación de transcripciones.
- Sesgos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 para el modelo fuente, pero se aplican además los términos de RKNN Toolkit y RKNN Runtime, que pueden restringir el uso comercial del binario convertido.
- Es un derivado cuantizado: la precisión puede degradarse respecto al modelo original, especialmente en el LLM a w4a16.
- Debe desplegarse solo tras verificar los checksums SHA-256; mezclar ficheros de distintas configuraciones puede romper la inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/UGREENDEV/RK182X-ASR-Fun-ASR-Nano-2512
- Modelo base: https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512
- Configuración incluida: `Fun-ASR-Nano-2512-w4a16-8-normal/README.md` dentro del repositorio
- Repositorio en ModelScope: `UGREENDEV/RK182X-ASR-Fun-ASR-Nano-2512` (revisión `master`)
