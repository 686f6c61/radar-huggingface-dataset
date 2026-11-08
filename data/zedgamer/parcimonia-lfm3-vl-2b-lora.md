# zedgamer/parcimonia-lfm3-vl-2b-lora

## Resumen

Parcimonia LFM3-VL-2B LoRA es un adaptador PEFT/LoRA experimental publicado por el usuario zedgamer sobre el modelo base LiquidAI/LFM3-VL-2B de Liquid AI. El adaptador está entrenado para producir decisiones de enrutamiento estructuradas ("routing decisions") dentro del sistema Parcimonia, un proyecto de software complementario alojado en GitHub bajo licencia Apache-2.0. Se trata de un artefacto de investigación, no de un modelo autónomo: requiere cargar el modelo base LFM3-VL-2B antes de aplicar los pesos LoRA.

El modelo base pertenece a la familia LFM3 de Liquid AI, una familia de modelos abiertos de clase 2B con variantes de texto, visión, audio, omni y decisión, diseñados para despliegue en dispositivo ("on-device"). La variante VL-2B incorpora capacidades de visión-lenguaje con comprensión de vídeo, modo de razonamiento ("thinking") y razonamiento espacial según la documentación de Liquid AI. Sin embargo, el adaptador Parcimonia es explícitamente solo texto: no incluye adaptador de visión y no se usaron imágenes durante su entrenamiento.

La relevancia de este adaptador es acotada y experimental. El propio autor advierte que no ha sido evaluado de forma independiente, que los datos de entrenamiento y evaluación son sintéticos y generados para el propio experimento, y que las salidas generadas deben tratarse como propuestas no confiables que la aplicación llamante debe validar. No sustituye a la capa determinista de verificación del software Parcimonia ni debe usarse para autorizar o ejecutar acciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer vision-lenguaje LFM3-VL-2B de Liquid AI |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de clase 2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se incluye GGUF en el paquete) |
| Idiomas soportados | fr, en |
| Licencia | lfm-open-license-v1.0 (licencia del modelo base, aplicable al adaptador) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA PEFT que se aplica sobre el modelo base LiquidAI/LFM3-VL-2B, un modelo de la familia LFM3 de Liquid AI orientado a despliegue en dispositivo. La model card no detalla la arquitectura interna del modelo base (tipo de atención, capas, dimensión oculta) ni la configuración del adaptador (rango, alpha, módulos objetivo). La carga se realiza con `PeftModel.from_pretrained` sobre el modelo base instanciado con `AutoModelForImageTextToText` y `AutoProcessor`, ambos con `trust_remote_code=True`, lo que implica ejecutar código remoto del repositorio base.

El entrenamiento se documenta mediante un manifiesto v3 que registra 256 preguntas sintéticas de entrenamiento, incluyendo 96 pares nuevos y 32 pares de replay. El conjunto de evaluación registra 64 preguntas (32 pares), de las cuales 32 corresponden a abstenciones esperadas. No se utilizaron imágenes en ningún caso: el adaptador es solo texto pese a partir de un modelo vision-lenguaje. Los datos son sintéticos y fueron redactados específicamente para este experimento, por lo que los resultados no establecen comportamiento sobre tráfico de producción representativo ni sobre datos recogidos de forma independiente. La model card no menciona uso de RLHF, DPO ni otras técnicas de alineación adicionales.

## Capacidades

- Generación de texto orientada a decisiones de enrutamiento estructuradas dentro del sistema Parcimonia.
- Producción de salidas de tipo "advisory routing": propuestas que la aplicación llamante debe validar antes de actuar.
- Comportamiento de abstención: el conjunto de evaluación incluye 32 abstenciones esperadas, lo que sugiere que el adaptador está entrenado para no responder en ciertos casos.
- Soporte multilingüe limitado a francés e inglés.
- No dispone de capacidades de visión: el adaptador es solo texto aunque el modelo base sea vision-lenguaje.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni otras capacidades especiales en la información disponible.

## Casos de uso

- Evaluación local de enrutamiento en el proyecto Parcimonia: el adaptador se carga sobre LFM3-VL-2B para generar propuestas de decisión que la aplicación compara con su capa determinista de verificación, útil para investigación interna del propio sistema.
- Investigación sobre adaptadores LoRA de bajo coste: sirve como ejemplo reproducible de fine-tuning PEFT sobre un modelo de clase 2B para una tarea de clasificación/decisión estructurada con datos sintéticos.
- Estudio de comportamiento de abstención: el conjunto de evaluación con abstenciones esperadas permite analizar cómo un adaptador pequeño aprende a rechazar peticiones fuera de distribución.
- Prototipado de pipelines de decisión asistida por LLM: integrado en una aplicación que mantenga el control determinista, puede generar borradores de decisión para revisión humana antes de cualquier acción.
- Experimentación con datos sintéticos: el manifiesto de entrenamiento (96 pares nuevos, 32 de replay) documenta una metodología replicable para generar y evaluar pares sintéticos en tareas de enrutamiento.
- Docencia y formación en PEFT: el repositorio ilustra el flujo completo de carga de un adaptador LoRA sobre un modelo multimodal con `transformers` y `peft`, incluyendo la gestión de licencias derivadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la composición del conjunto de evaluación (64 preguntas, 32 pares, 32 abstenciones esperadas) sin reportar métricas numéricas de precisión, exactitud o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base LFM3-VL-2B (clase 2B) y de la precisión de carga elegida (fp16, bf16, int8, int4), no especificadas en la model card.
- GPU recomendadas: no disponible; el modelo base está diseñado por Liquid AI para despliegue en dispositivo, lo que sugiere viabilidad en hardware de gama consumer, pero no hay confirmación para este adaptador.
- Compatibilidad con GPU consumer: no confirmada; el autor indica que no reclama que el adaptador haya sido probado en distintos runtimes o hardware.
- Opciones de despliegue: carga mediante `transformers` y `peft` con `AutoModelForImageTextToText` y `AutoProcessor` (con `trust_remote_code=True`). No se incluye GGUF en el paquete, por lo que llama.cpp u Ollama requerirían conversión propia no documentada. No se menciona soporte de vLLM ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Parcimonia LFM3-VL-2B LoRA (este) | Adaptador LoRA sobre base de clase 2B | no disponible | lfm-open-license-v1.0 | safetensors (PEFT) | Experimental, solo texto, datos sintéticos, sin evaluación independiente |
| LiquidAI/LFM3-VL-2B (modelo base) | Clase 2B | no disponible | lfm-open-license-v1.0 | safetensors | Vision-lenguaje con vídeo, thinking y razonamiento espacial, on-device |
| Otros adaptadores LoRA sobre LFM3 | no disponible | no disponible | no disponible | no disponible | No se dispone de información sobre alternativas comparables |

No se dispone de datos de benchmarks ni de modelos comparables de la misma categoría (adaptadores de enrutamiento sobre LFM3) en la información proporcionada.

## Limitaciones y advertencias

- Adaptador experimental sin evaluación independiente; los resultados no son extrapolables a producción.
- Datos de entrenamiento y evaluación sintéticos y redactados por el propio autor del experimento.
- Solo texto: no incluye adaptador de visión, pese a que el modelo base es vision-lenguaje.
- Las salidas son propuestas no confiables; la aplicación llamante debe mantener sus comprobaciones deterministas, de evidencia y de abstención bajo control.
- No debe usarse para autorizar o ejecutar acciones de forma autónoma.
- Licencia lfm-open-license-v1.0 aplicable al adaptador por ser derivado del modelo base; deben revisarse las condiciones de redistribución y uso comercial antes de cualquier despliegue. La licencia Apache-2.0 del software Parcimonia no se aplica a estos pesos.
- Idiomas limitados a francés e inglés; no se documenta soporte de castellano.
- Riesgo de alucinación inherente a modelos generativos, agravado por la falta de evaluación sobre datos reales.
- No se incluye GGUF ni cuantizaciones preparadas; el despliegue en runtimes ligeros requiere trabajo adicional no documentado.
- Requiere `trust_remote_code=True` para cargar el modelo base, lo que implica ejecutar código del repositorio remoto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face del adaptador: https://huggingface.co/zedgamer/parcimonia-lfm3-vl-2b-lora
- Modelo base en Hugging Face: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Documentación de LFM3-VL-2B en Liquid AI: https://docs.liquid.ai/lfm/models/lfm3-vl-2b
- Blog de presentación de la familia LFM3: https://www.liquid.ai/blog/lfm3
- Aplicación Parcimonia (compañera): https://github.com/zedarvates/parcimonia
